import { TadabburMap, CanvasNode, CanvasEdge, NodeType } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  map?: TadabburMap;
  error?: string;
}

const VALID_NODE_TYPES: Set<NodeType> = new Set([
  'ayah',
  'note',
  'reflection',
  'concept',
  'group',
  'image'
]);

/**
 * Validates and sanitizes an imported map JSON object.
 * Prevents corrupted, malicious, or malformed data from crashing the application.
 */
export function validateImportedMap(rawJson: unknown): ValidationResult {
  if (!rawJson || typeof rawJson !== 'object' || Array.isArray(rawJson)) {
    return { isValid: false, error: 'الملف لا يحتوي على كائن بيانات صالح' };
  }

  const obj = rawJson as Record<string, unknown>;

  // Title validation
  const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim() : 'خريطة مستوردة';

  // Nodes validation
  if (!Array.isArray(obj.nodes)) {
    return { isValid: false, error: 'هيكل العقد (nodes) غير صالح أو مفقود' };
  }

  const sanitizedNodes: CanvasNode[] = [];
  const validNodeIds = new Set<string>();

  for (let i = 0; i < obj.nodes.length; i++) {
    const rawNode = obj.nodes[i];
    if (!rawNode || typeof rawNode !== 'object') continue;

    const n = rawNode as Record<string, unknown>;
    const id = typeof n.id === 'string' && n.id.trim() ? n.id.trim() : `node-imported-${i}-${Date.now()}`;
    const type = typeof n.type === 'string' && VALID_NODE_TYPES.has(n.type as NodeType)
      ? (n.type as NodeType)
      : 'note';

    const x = typeof n.x === 'number' && !isNaN(n.x) ? n.x : 100;
    const y = typeof n.y === 'number' && !isNaN(n.y) ? n.y : 100;
    const colorTheme = typeof n.colorTheme === 'string' ? n.colorTheme : 'amber';

    const node: CanvasNode = {
      id,
      type,
      x,
      y,
      colorTheme,
      width: typeof n.width === 'number' ? n.width : undefined,
      height: typeof n.height === 'number' ? n.height : undefined,
      fontSize: typeof n.fontSize === 'number' ? n.fontSize : undefined,
      zIndex: typeof n.zIndex === 'number' ? n.zIndex : undefined,
      ayahData: (n.ayahData && typeof n.ayahData === 'object' ? n.ayahData : undefined) as CanvasNode['ayahData'],
      noteData: (n.noteData && typeof n.noteData === 'object' ? n.noteData : undefined) as CanvasNode['noteData'],
      reflectionData: (n.reflectionData && typeof n.reflectionData === 'object' ? n.reflectionData : undefined) as CanvasNode['reflectionData'],
      conceptData: (n.conceptData && typeof n.conceptData === 'object' ? n.conceptData : undefined) as CanvasNode['conceptData'],
      groupData: (n.groupData && typeof n.groupData === 'object' ? n.groupData : undefined) as CanvasNode['groupData'],
      imageData: (n.imageData && typeof n.imageData === 'object' ? n.imageData : undefined) as CanvasNode['imageData'],
      anchor: (n.anchor && typeof n.anchor === 'object' ? n.anchor : undefined) as CanvasNode['anchor']
    };

    sanitizedNodes.push(node);
    validNodeIds.add(id);
  }

  // Edges validation
  const sanitizedEdges: CanvasEdge[] = [];
  if (Array.isArray(obj.edges)) {
    for (let i = 0; i < obj.edges.length; i++) {
      const rawEdge = obj.edges[i];
      if (!rawEdge || typeof rawEdge !== 'object') continue;

      const e = rawEdge as Record<string, unknown>;
      const id = typeof e.id === 'string' && e.id.trim() ? e.id.trim() : `edge-imported-${i}-${Date.now()}`;
      const sourceId = typeof e.sourceId === 'string' ? e.sourceId.trim() : '';
      const targetId = typeof e.targetId === 'string' ? e.targetId.trim() : '';

      // Ignore dangling edges that point to non-existent nodes
      if (!sourceId || !targetId || !validNodeIds.has(sourceId) || !validNodeIds.has(targetId)) {
        continue;
      }

      // Self-loop prevention
      if (sourceId === targetId) {
        continue;
      }

      const edge: CanvasEdge = {
        id,
        sourceId,
        targetId,
        label: typeof e.label === 'string' ? e.label : undefined,
        relationshipKind: typeof e.relationshipKind === 'string' ? (e.relationshipKind as CanvasEdge['relationshipKind']) : undefined,
        customRelationship: typeof e.customRelationship === 'string' ? e.customRelationship : undefined,
        sourceAnchor: (e.sourceAnchor && typeof e.sourceAnchor === 'object' ? e.sourceAnchor : undefined) as CanvasEdge['sourceAnchor'],
        targetAnchor: (e.targetAnchor && typeof e.targetAnchor === 'object' ? e.targetAnchor : undefined) as CanvasEdge['targetAnchor'],
        curveType: typeof e.curveType === 'string' ? (e.curveType as CanvasEdge['curveType']) : 'bezier',
        style: typeof e.style === 'string' ? (e.style as CanvasEdge['style']) : 'solid',
        arrowType: typeof e.arrowType === 'string' ? (e.arrowType as CanvasEdge['arrowType']) : 'end',
        color: typeof e.color === 'string' ? e.color : '#10b981',
        animated: Boolean(e.animated)
      };

      sanitizedEdges.push(edge);
    }
  }

  const now = Date.now();
  const validGridTypes = new Set(['dots', 'lines', 'grid', 'islamic', 'clean']);
  const gridType = typeof obj.gridType === 'string' && validGridTypes.has(obj.gridType)
    ? (obj.gridType as TadabburMap['gridType'])
    : 'dots';
  const snapToGrid = typeof obj.snapToGrid === 'boolean' ? obj.snapToGrid : false;

  const sanitizedMap: TadabburMap = {
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : `map-imported-${now}`,
    title,
    description: typeof obj.description === 'string' ? obj.description : undefined,
    nodes: sanitizedNodes,
    edges: sanitizedEdges,
    zoom: typeof obj.zoom === 'number' && !isNaN(obj.zoom) && obj.zoom > 0 ? Math.min(Math.max(obj.zoom, 0.2), 2.5) : 1,
    panX: typeof obj.panX === 'number' && !isNaN(obj.panX) ? obj.panX : 80,
    panY: typeof obj.panY === 'number' && !isNaN(obj.panY) ? obj.panY : 60,
    gridType,
    snapToGrid,
    createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : now,
    updatedAt: now
  };

  return {
    isValid: true,
    map: sanitizedMap
  };
}
