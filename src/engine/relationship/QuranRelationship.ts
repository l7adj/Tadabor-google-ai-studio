import { QuranAnchorV2 } from '../quran/QuranAnchor';
import { QuranSelection } from '../quran/QuranSelection';
import { RelationshipKind } from '../../types';

/**
 * QuranRelationship defines a semantic or thematic connection
 * between two distinct points of anchor in the Holy Quran.
 */
export interface QuranRelationship {
  id: string;
  sourceAnchor: QuranAnchorV2;
  targetAnchor: QuranAnchorV2;
  sourceSelection?: QuranSelection;
  targetSelection?: QuranSelection;
  kind: RelationshipKind;
  customRelationship?: string;
  label: string;
  note?: string;
  confidence?: number;
  createdBy: 'user' | 'system' | 'ai';
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

/**
 * Factory for creating a validated QuranRelationship
 */
export function createQuranRelationship(params: {
  sourceAnchor: QuranAnchorV2;
  targetAnchor: QuranAnchorV2;
  kind: RelationshipKind;
  customRelationship?: string;
  label?: string;
  note?: string;
  createdBy?: 'user' | 'system' | 'ai';
}): QuranRelationship {
  const now = Date.now();
  const id = `rel-${params.sourceAnchor.id}__${params.kind}__${params.targetAnchor.id}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    sourceAnchor: params.sourceAnchor,
    targetAnchor: params.targetAnchor,
    kind: params.kind,
    customRelationship: params.customRelationship,
    label: params.label || params.kind,
    note: params.note,
    createdBy: params.createdBy || 'user',
    createdAt: now,
    updatedAt: now
  };
}
