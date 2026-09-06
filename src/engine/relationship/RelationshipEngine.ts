import { QuranRelationship, createQuranRelationship } from './QuranRelationship';
import { validateRelationship } from './RelationshipValidator';
import { QuranAnchorV2 } from '../quran/QuranAnchor';
import { CanvasEdge } from '../../types';

export class RelationshipEngine {
  private relationships: Map<string, QuranRelationship> = new Map();
  private anchorIndex: Map<string, Set<string>> = new Map(); // anchorId -> relationshipIds

  public addRelationship(rel: QuranRelationship): boolean {
    const val = validateRelationship(rel);
    if (!val.isValid) {
      console.warn('RelationshipEngine: Rejected invalid relationship:', val.errorMessage);
      return false;
    }

    this.relationships.set(rel.id, rel);
    this.indexAnchor(rel.sourceAnchor.id, rel.id);
    this.indexAnchor(rel.targetAnchor.id, rel.id);
    return true;
  }

  public removeRelationship(id: string): void {
    const rel = this.relationships.get(id);
    if (rel) {
      this.unindexAnchor(rel.sourceAnchor.id, id);
      this.unindexAnchor(rel.targetAnchor.id, id);
      this.relationships.delete(id);
    }
  }

  public getRelationship(id: string): QuranRelationship | undefined {
    return this.relationships.get(id);
  }

  public getAllRelationships(): QuranRelationship[] {
    return Array.from(this.relationships.values());
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
