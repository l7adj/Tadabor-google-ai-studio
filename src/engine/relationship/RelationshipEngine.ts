import { QuranRelationship, createQuranRelationship } from './QuranRelationship';
import { validateRelationship } from './RelationshipValidator';
import { QuranAnchorV2 } from '../quran/QuranAnchor';
import { CanvasEdge, QuranAnchor } from '../../types';

export type RelationshipChangeEvent = {
  type: 'add' | 'update' | 'remove' | 'sync';
  relationshipId?: string;
  relationship?: QuranRelationship;
};

export class RelationshipEngine {
  private relationships: Map<string, QuranRelationship> = new Map();
  private anchorIndex: Map<string, Set<string>> = new Map(); // anchorId -> relationshipIds
  private listeners: Set<(event: RelationshipChangeEvent) => void> = new Set();

  public subscribe(listener: (event: RelationshipChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: RelationshipChangeEvent): void {
    this.listeners.forEach((l) => {
      try {
        l(event);
      } catch (err) {
        console.error('RelationshipEngine listener error:', err);
      }
    });
  }

  public addRelationship(rel: QuranRelationship): boolean {
    const val = validateRelationship(rel);
    if (!val.isValid) {
      console.warn('RelationshipEngine: Rejected invalid relationship:', val.errorMessage);
      return false;
    }

    this.relationships.set(rel.id, rel);
    this.indexAnchor(rel.sourceAnchor.id, rel.id);
    this.indexAnchor(rel.targetAnchor.id, rel.id);
    this.notify({ type: 'add', relationshipId: rel.id, relationship: rel });
    return true;
  }

  public updateRelationship(id: string, updates: Partial<QuranRelationship>): boolean {
    const existing = this.relationships.get(id);
    if (!existing) return false;

    const merged: QuranRelationship = {
      ...existing,
      ...updates,
      id, // Preserve immutable ID
      updatedAt: Date.now()
    };

    const val = validateRelationship(merged);
    if (!val.isValid) {
      console.warn('RelationshipEngine: Rejected invalid update:', val.errorMessage);
      return false;
    }

    // Re-index anchors if anchors changed
    if (updates.sourceAnchor && updates.sourceAnchor.id !== existing.sourceAnchor.id) {
      this.unindexAnchor(existing.sourceAnchor.id, id);
      this.indexAnchor(updates.sourceAnchor.id, id);
    }
    if (updates.targetAnchor && updates.targetAnchor.id !== existing.targetAnchor.id) {
      this.unindexAnchor(existing.targetAnchor.id, id);
      this.indexAnchor(updates.targetAnchor.id, id);
    }

    this.relationships.set(id, merged);
    this.notify({ type: 'update', relationshipId: id, relationship: merged });
    return true;
  }

  public removeRelationship(id: string): void {
    const rel = this.relationships.get(id);
    if (rel) {
      this.unindexAnchor(rel.sourceAnchor.id, id);
      this.unindexAnchor(rel.targetAnchor.id, id);
      this.relationships.delete(id);
      this.notify({ type: 'remove', relationshipId: id, relationship: rel });
    }
  }

  /**
   * Incremental Synchronization: Synchronizes canvas edges with the relationship engine
   * WITHOUT clearing and rebuilding all relationships.
   * Only adds new relationships, updates modified ones, and removes deleted ones.
   */
  public syncCanvasEdges(edges: CanvasEdge[]): { added: number; updated: number; removed: number } {
    const incomingValid = new Map<string, QuranRelationship>();

    for (const edge of edges) {
      if (edge.sourceAnchor && edge.targetAnchor) {
        try {
          const rel = RelationshipEngine.fromCanvasEdge(edge);
          if (rel) {
            incomingValid.set(rel.id, rel);
          }
        } catch (e) {
          // ignore non-quran edge conversion
        }
      }
    }

    let added = 0;
    let updated = 0;
    let removed = 0;

    // 1. Remove relationships that no longer exist in canvas edges
    for (const [id, existing] of Array.from(this.relationships.entries())) {
      if (!incomingValid.has(id)) {
        this.removeRelationship(id);
        removed++;
      }
    }

    // 2. Add or update incoming relationships
    for (const [id, incoming] of incomingValid.entries()) {
      const existing = this.relationships.get(id);
      if (!existing) {
        if (this.addRelationship(incoming)) {
          added++;
        }
      } else {
        // Check if anything meaningful changed
        const isChanged =
          existing.sourceAnchor.id !== incoming.sourceAnchor.id ||
          existing.targetAnchor.id !== incoming.targetAnchor.id ||
          existing.kind !== incoming.kind ||
          existing.label !== incoming.label ||
          existing.customRelationship !== incoming.customRelationship;

        if (isChanged) {
          this.updateRelationship(id, incoming);
          updated++;
        }
      }
    }

    if (added > 0 || updated > 0 || removed > 0) {
      this.notify({ type: 'sync' });
    }

    return { added, updated, removed };
  }

  public getRelationship(id: string): QuranRelationship | undefined {
    return this.relationships.get(id);
  }

  public getAllRelationships(): QuranRelationship[] {
    return Array.from(this.relationships.values());
  }

  public clear(): void {
    this.relationships.clear();
    this.anchorIndex.clear();
    this.notify({ type: 'sync' });
  }

  /**
   * Find all relationships connected to a given Quran anchor
   */
  public findByAnchor(anchorId: string): QuranRelationship[] {
    const ids = this.anchorIndex.get(anchorId);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.relationships.get(id))
      .filter((r): r is QuranRelationship => r !== undefined);
  }

  /**
   * Find all relationships connected to a specific Ayah (by Surah and Ayah numbers)
   */
  public findByAyah(surah: number, ayah: number): QuranRelationship[] {
    return this.getAllRelationships().filter((r) => {
      const sSurah = r.sourceAnchor.surahId ?? r.sourceAnchor.surah;
      const sAyah = r.sourceAnchor.ayahId ?? r.sourceAnchor.ayah;
      const tSurah = r.targetAnchor.surahId ?? r.targetAnchor.surah;
      const tAyah = r.targetAnchor.ayahId ?? r.targetAnchor.ayah;

      return (sSurah === surah && sAyah === ayah) || (tSurah === surah && tAyah === ayah);
    });
  }

  /**
   * Converts a CanvasEdge to a QuranRelationship if anchors exist
   */
  public static fromCanvasEdge(edge: CanvasEdge): QuranRelationship | null {
    if (!edge.sourceAnchor || !edge.targetAnchor) return null;

    return {
      id: edge.id,
      sourceAnchor: edge.sourceAnchor as QuranAnchorV2,
      targetAnchor: edge.targetAnchor as QuranAnchorV2,
      kind: edge.relationshipKind || 'custom',
      customRelationship: edge.customRelationship,
      label: edge.label || 'رابط قرآني',
      createdBy: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Projects a QuranRelationship to a CanvasEdge (Single Source of Truth projection)
   */
  public static toCanvasEdge(
    rel: QuranRelationship,
    sourceNodeId: string,
    targetNodeId: string,
    existingEdge?: Partial<CanvasEdge>
  ): CanvasEdge {
    return {
      id: rel.id,
      sourceId: sourceNodeId,
      targetId: targetNodeId,
      label: rel.label,
      relationshipKind: rel.kind,
      customRelationship: rel.customRelationship,
      sourceAnchor: rel.sourceAnchor as unknown as QuranAnchor,
      targetAnchor: rel.targetAnchor as unknown as QuranAnchor,
      curveType: existingEdge?.curveType || 'bezier',
      style: existingEdge?.style || 'solid',
      arrowType: existingEdge?.arrowType || 'end',
      color: existingEdge?.color || '#10b981',
      animated: existingEdge?.animated ?? false,
      sourceHandle: existingEdge?.sourceHandle || 'right',
      targetHandle: existingEdge?.targetHandle || 'left'
    };
  }

  private indexAnchor(anchorId: string, relId: string): void {
    let set = this.anchorIndex.get(anchorId);
    if (!set) {
      set = new Set();
      this.anchorIndex.set(anchorId, set);
    }
    set.add(relId);
  }

  private unindexAnchor(anchorId: string, relId: string): void {
    const set = this.anchorIndex.get(anchorId);
    if (set) {
      set.delete(relId);
      if (set.size === 0) {
        this.anchorIndex.delete(anchorId);
      }
    }
  }
}

export const globalRelationshipEngine = new RelationshipEngine();
