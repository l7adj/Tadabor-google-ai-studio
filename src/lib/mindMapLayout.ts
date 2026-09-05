import { CanvasNode, CanvasEdge } from '../types';

interface PositionedNode {
  id: string;
  x: number;
  y: number;
}

/**
 * Intelligent mind-map layout algorithm
 * Arranges nodes hierarchically or clustered based on relationship edges
 */
export function calculateMindMapLayout(
  nodes: CanvasNode[],
  edges: CanvasEdge[]
): PositionedNode[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map<string, CanvasNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Build adjacency graph
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();

  nodes.forEach((n) => {
    childrenMap.set(n.id, []);
    parentMap.set(n.id, []);
  });

  edges.forEach((e) => {
    if (childrenMap.has(e.sourceId) && parentMap.has(e.targetId)) {
      childrenMap.get(e.sourceId)!.push(e.targetId);
      parentMap.get(e.targetId)!.push(e.sourceId);
    }
  });

  // Find root nodes: Concepts, or nodes with no incoming edges
  const roots: string[] = [];
  nodes.forEach((n) => {
    const incoming = parentMap.get(n.id) || [];
    if (incoming.length === 0 || n.type === 'concept') {
      roots.push(n.id);
    }
  });

  // If no roots found (cyclic), pick the first node
  if (roots.length === 0) {
    roots.push(nodes[0].id);
  }

  const visited = new Set<string>();
  const positions: PositionedNode[] = [];

  let currentRootY = 120;
  const startX = 1400; // Place root comfortably on the right (for RTL flow)
  const horizontalGap = 440; // Gap between parent and children (going leftwards)
  const verticalGap = 240; // Gap between sibling nodes

  // Recursive layout for a tree branch
  function layoutSubtree(nodeId: string, depth: number, startY: number): { height: number; y: number } {
    visited.add(nodeId);
    const children = (childrenMap.get(nodeId) || []).filter((id) => !visited.has(id));

    if (children.length === 0) {
      const nodeX = startX - depth * horizontalGap;
      const nodeY = startY;
      positions.push({ id: nodeId, x: nodeX, y: nodeY });
      return { height: verticalGap, y: nodeY };
    }

    let totalChildHeight = 0;
    let childY = startY;
    const childYs: number[] = [];

    for (const childId of children) {
      const { height, y } = layoutSubtree(childId, depth + 1, childY);
      childYs.push(y);
      childY += height;
      totalChildHeight += height;
    }

    // Place parent vertically at the average/center of its children
    const avgChildY = childYs.reduce((a, b) => a + b, 0) / childYs.length;
    const nodeX = startX - depth * horizontalGap;
    const nodeY = avgChildY;

    positions.push({ id: nodeId, x: nodeX, y: Math.round(nodeY) });
    return { height: Math.max(totalChildHeight, verticalGap), y: nodeY };
  }

  // Layout all tree roots
  for (const rootId of roots) {
    if (!visited.has(rootId)) {
      const { height } = layoutSubtree(rootId, 0, currentRootY);
      currentRootY += height + 80;
    }
  }

  // Handle any remaining orphan/unconnected nodes in a clean aligned grid
  const unvisited = nodes.filter((n) => !visited.has(n.id));
  if (unvisited.length > 0) {
    let orphanX = startX;
    let orphanY = currentRootY + 100;
    let col = 0;

    for (const orphan of unvisited) {
      positions.push({
        id: orphan.id,
        x: orphanX - col * horizontalGap,
        y: orphanY
      });
      col++;
      if (col >= 3) {
        col = 0;
        orphanY += verticalGap;
      }
    }
  }

  return positions;
}
