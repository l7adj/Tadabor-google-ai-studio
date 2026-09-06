import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  BookOpen,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  Link,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Grid,
  Layers,
  AlignStartVertical,
  AlignEndVertical,
  AlignRight,
  AlignLeft,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  HelpCircle,
  X,
  Magnet,
  Sparkle,
  Hand,
  MousePointer,
  Plus,
  Compass,
  MapPin,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import {
  TadabburMap,
  CanvasNode,
  CanvasEdge,
  CanvasGridType,
  HandlePosition,
  GroupNodeData,
  QuranAnchor,
  RelationshipKind
} from '../../types';
import { AyahNodeCard } from './Nodes/AyahNodeCard';
import { NoteNodeCard } from './Nodes/NoteNodeCard';
import { ImageNodeCard } from './Nodes/ImageNodeCard';
import { ConceptNodeCard } from './Nodes/ConceptNodeCard';
import { GroupNodeCard } from './Nodes/GroupNodeCard';
import { EdgeRenderer, getPreciseNodeAnchor } from './EdgeRenderer';
import { CanvasMiniMap } from './CanvasMiniMap';
import { calculateMindMapLayout } from '../../lib/mindMapLayout';
import { RelationConfigModal, PendingConnectionData } from './RelationConfigModal';

interface TadabburCanvasProps {
  currentMap: TadabburMap;
  onUpdateMap: (updatedMap: TadabburMap) => void;
  onOpenSearch: () => void;
  onOpenTemplates?: () => void;
  onOpenQuickAyahPicker?: () => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  readOnly?: boolean;
}

export const TadabburCanvas: React.FC<TadabburCanvasProps> = ({
  currentMap,
  onUpdateMap,
  onOpenSearch,
  onOpenTemplates,
  onOpenQuickAyahPicker,
  zoom,
  setZoom,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Viewport State (Truly unbounded infinite canvas like TradingView)
  const [pan, setPan] = useState({ x: currentMap.panX || 80, y: currentMap.panY || 60 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Interaction Mode: 'select' (default pointer) or 'pan' (TradingView hand tool)
  const [canvasMode, setCanvasMode] = useState<'select' | 'pan'>('select');

  // Grid style & Snap-to-grid
  const [gridType, setGridType] = useState<CanvasGridType>(currentMap.gridType || 'dots');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(currentMap.snapToGrid ?? false);

  // Mouse Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragInitialMouse, setDragInitialMouse] = useState({ x: 0, y: 0 });
  const [dragInitialNodePositions, setDragInitialNodePositions] = useState<Map<string, { x: number; y: number }>>(
    new Map()
  );

  // Multi-Touch Gesture Tracking (Mobile First Engine)
  const touchDataRef = useRef<{
    active: boolean;
    mode: 'none' | 'pan' | 'pinch' | 'node';
    startTouches: Array<{ x: number; y: number }>;
    startPan: { x: number; y: number };
    startZoom: number;
    initialDistance: number;
    initialMidpoint: { x: number; y: number };
    draggedNodeId: string | null;
    initialNodePositions: Map<string, { x: number; y: number }>;
  }>({
    active: false,
    mode: 'none',
    startTouches: [],
    startPan: { x: 0, y: 0 },
    startZoom: 1,
    initialDistance: 0,
    initialMidpoint: { x: 0, y: 0 },
    draggedNodeId: null,
    initialNodePositions: new Map()
  });

  // Selection State (supports multi-selection with Shift or touch)
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  // Connection Creation State
  const [connectingSource, setConnectingSource] = useState<{
    nodeId: string;
    wordIndex?: number;
    handle?: HandlePosition;
    wordText?: string;
    anchor?: QuranAnchor;
  } | null>(null);
  const [pendingConnection, setPendingConnection] = useState<PendingConnectionData | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });

  // Mini-map & Modals
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : false));
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showMobileToolsSheet, setShowMobileToolsSheet] = useState(false);
  const [viewportDims, setViewportDims] = useState({ width: 1200, height: 800 });

  // Undo / Redo History
  const historyRef = useRef<Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>>([
    { nodes: currentMap.nodes, edges: currentMap.edges }
  ]);
  const historyIndexRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushToHistory = useCallback((nodes: CanvasNode[], edges: CanvasEdge[]) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push({ nodes, edges });
    if (newHistory.length > 40) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const state = historyRef.current[historyIndexRef.current];
      onUpdateMap({
        ...currentMap,
        nodes: state.nodes,
        edges: state.edges,
        updatedAt: Date.now()
      });
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    }
  }, [currentMap, onUpdateMap]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const state = historyRef.current[historyIndexRef.current];
      onUpdateMap({
        ...currentMap,
        nodes: state.nodes,
        edges: state.edges,
        updatedAt: Date.now()
      });
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, [currentMap, onUpdateMap]);

  // Track viewport dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportDims({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Keyboard Shortcuts (Space for Pan, Ctrl+Z for Undo, Ctrl+Y for Redo, Delete for remove)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeIds.size > 0 && !readOnly) {
        e.preventDefault();
        handleDeleteSelectedNodes();
      }

      if (e.key === 'Escape') {
        setSelectedNodeIds(new Set());
        setConnectingSource(null);
        setShowShortcutsHelp(false);
        setShowMobileToolsSheet(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleUndo, handleRedo, selectedNodeIds, readOnly]);

  // Snap position helper
  const snap = useCallback(
    (val: number) => {
      if (!snapToGrid) return val;
      const gridSize = 20;
      return Math.round(val / gridSize) * gridSize;
    },
    [snapToGrid]
  );

  // Zoom centered on cursor position (Mouse Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.09 : 0.91;
    const newZoom = Math.min(Math.max(Number((zoom * zoomFactor).toFixed(3)), 0.15), 3.0);

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (
      canvasMode === 'pan' ||
      isSpacePressed ||
      e.button === 1 ||
      e.target === containerRef.current ||
      (e.target as HTMLElement).id === 'canvas-svg-layer'
    ) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      if (!e.shiftKey) {
        setSelectedNodeIds(new Set());
      }
      if (connectingSource) setConnectingSource(null);
    }
  };

  // Node Drag Start (Mouse)
  const handleNodeMouseDown = (node: CanvasNode, e: React.MouseEvent) => {
    if (canvasMode === 'pan') {
      handleCanvasMouseDown(e);
      return;
    }

    if (readOnly) return;
    e.stopPropagation();

    // If in connecting mode and user clicks another node, complete the edge
    if (connectingSource && connectingSource.nodeId !== node.id) {
      handleCompleteConnection(node.id);
      return;
    }

    let nextSelection = new Set(selectedNodeIds);
    if (e.shiftKey) {
      if (nextSelection.has(node.id)) {
        nextSelection.delete(node.id);
      } else {
        nextSelection.add(node.id);
      }
    } else {
      if (!nextSelection.has(node.id)) {
        nextSelection = new Set([node.id]);
      }
    }
    setSelectedNodeIds(nextSelection);

    setDraggingNodeId(node.id);
    setDragInitialMouse({ x: e.clientX, y: e.clientY });

    const initialPositions = new Map<string, { x: number; y: number }>();
    currentMap.nodes.forEach((n) => {
      if (nextSelection.has(n.id) || n.id === node.id) {
        initialPositions.set(n.id, { x: n.x, y: n.y });
      }
    });
    setDragInitialNodePositions(initialPositions);
  };

  // Global Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMouseCanvasPos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      });
    }

    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    } else if (draggingNodeId && !readOnly) {
      const deltaX = (e.clientX - dragInitialMouse.x) / zoom;
      const deltaY = (e.clientY - dragInitialMouse.y) / zoom;

      const updatedNodes = currentMap.nodes.map((n) => {
        const initial = dragInitialNodePositions.get(n.id);
        if (initial) {
          return {
            ...n,
            x: snap(Math.round(initial.x + deltaX)),
            y: snap(Math.round(initial.y + deltaY))
          };
        }
        return n;
      });

      onUpdateMap({ ...currentMap, nodes: updatedNodes, panX: pan.x, panY: pan.y });
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (draggingNodeId) {
      setDraggingNodeId(null);
      pushToHistory(currentMap.nodes, currentMap.edges);
    }
  };

  // ==========================================
  // MOBILE FIRST MULTI-TOUCH GESTURE ENGINE
  // ==========================================
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2-Finger Pinch Zoom + Pan
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const mid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      touchDataRef.current = {
        active: true,
        mode: 'pinch',
        startTouches: [{ x: t1.clientX, y: t1.clientY }, { x: t2.clientX, y: t2.clientY }],
        startPan: { ...pan },
        startZoom: zoom,
        initialDistance: dist,
        initialMidpoint: mid,
        draggedNodeId: null,
        initialNodePositions: new Map()
      };
    } else if (e.touches.length === 1) {
      // 1-Finger Touch on Canvas Background
      const t = e.touches[0];
      touchDataRef.current = {
        active: true,
        mode: 'pan',
        startTouches: [{ x: t.clientX, y: t.clientY }],
        startPan: { ...pan },
        startZoom: zoom,
        initialDistance: 0,
        initialMidpoint: { x: 0, y: 0 },
        draggedNodeId: null,
        initialNodePositions: new Map()
      };
      // Clear selection if tapping canvas background in select mode
      if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-svg-layer') {
        setSelectedNodeIds(new Set());
        if (connectingSource) setConnectingSource(null);
      }
    }
  };

  const handleNodeTouchStart = (node: CanvasNode, e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      handleCanvasTouchStart(e);
      return;
    }

    if (canvasMode === 'pan') {
      handleCanvasTouchStart(e);
      return;
    }

    if (readOnly) return;
    e.stopPropagation();

    // If connecting mode active, tap target node to complete connection
    if (connectingSource && connectingSource.nodeId !== node.id) {
      handleCompleteConnection(node.id);
      return;
    }

    const t = e.touches[0];
    const nextSelection = new Set(selectedNodeIds);
    if (!nextSelection.has(node.id)) {
      nextSelection.clear();
      nextSelection.add(node.id);
      setSelectedNodeIds(nextSelection);
    }

    const initialPositions = new Map<string, { x: number; y: number }>();
    currentMap.nodes.forEach((n) => {
      if (nextSelection.has(n.id) || n.id === node.id) {
        initialPositions.set(n.id, { x: n.x, y: n.y });
      }
    });

    touchDataRef.current = {
      active: true,
      mode: 'node',
      startTouches: [{ x: t.clientX, y: t.clientY }],
      startPan: { ...pan },
      startZoom: zoom,
      initialDistance: 0,
      initialMidpoint: { x: 0, y: 0 },
      draggedNodeId: node.id,
      initialNodePositions: initialPositions
    };
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (!touchDataRef.current.active) return;

    if (e.touches.length === 2 && touchDataRef.current.mode === 'pinch') {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (touchDataRef.current.initialDistance <= 0) return;

      const scaleChange = newDist / touchDataRef.current.initialDistance;
      const targetZoom = Math.min(
        Math.max(Number((touchDataRef.current.startZoom * scaleChange).toFixed(3)), 0.15),
        3.0
      );

      const currentMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };

      // Zoom centered on the touch midpoint
      const startMid = touchDataRef.current.initialMidpoint;
      const initialPan = touchDataRef.current.startPan;
      const initialZoom = touchDataRef.current.startZoom;

      const newPanX = currentMid.x - (startMid.x - initialPan.x) * (targetZoom / initialZoom);
      const newPanY = currentMid.y - (startMid.y - initialPan.y) * (targetZoom / initialZoom);

      setZoom(targetZoom);
      setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      const startT = touchDataRef.current.startTouches[0];
      if (!startT) return;

      if (touchDataRef.current.mode === 'pan') {
        const deltaX = t.clientX - startT.x;
        const deltaY = t.clientY - startT.y;
        setPan({
          x: touchDataRef.current.startPan.x + deltaX,
          y: touchDataRef.current.startPan.y + deltaY
        });
      } else if (touchDataRef.current.mode === 'node' && touchDataRef.current.draggedNodeId && !readOnly) {
        const deltaX = (t.clientX - startT.x) / zoom;
        const deltaY = (t.clientY - startT.y) / zoom;

        const updatedNodes = currentMap.nodes.map((n) => {
          const initial = touchDataRef.current.initialNodePositions.get(n.id);
          if (initial) {
            return {
              ...n,
              x: snap(Math.round(initial.x + deltaX)),
              y: snap(Math.round(initial.y + deltaY))
            };
          }
          return n;
        });

        onUpdateMap({ ...currentMap, nodes: updatedNodes, panX: pan.x, panY: pan.y });
      }
    }
  };

  const handleCanvasTouchEnd = () => {
    if (touchDataRef.current.mode === 'node' && touchDataRef.current.draggedNodeId) {
      pushToHistory(currentMap.nodes, currentMap.edges);
    }
    touchDataRef.current = {
      active: false,
      mode: 'none',
      startTouches: [],
      startPan: { x: 0, y: 0 },
      startZoom: 1,
      initialDistance: 0,
      initialMidpoint: { x: 0, y: 0 },
      draggedNodeId: null,
      initialNodePositions: new Map()
    };
  };

  // Connection Workflow
  const handleStartConnecting = (
    nodeId: string,
    wordIndex?: number,
    handle?: HandlePosition,
    wordText?: string,
    anchor?: QuranAnchor
  ) => {
    if (readOnly) return;
    setConnectingSource({ nodeId, wordIndex, handle, wordText, anchor });
  };

  const handleCompleteConnection = (
    targetNodeId: string,
    targetHandle?: HandlePosition,
    targetWordIndex?: number,
    targetWordText?: string,
    targetAnchor?: QuranAnchor
  ) => {
    if (!connectingSource) {
      setConnectingSource(null);
      return;
    }

    // If source and target are exact same word on exact same node, cancel
    if (
      connectingSource.nodeId === targetNodeId &&
      connectingSource.wordIndex !== undefined &&
      connectingSource.wordIndex === targetWordIndex
    ) {
      setConnectingSource(null);
      return;
    }

    // If same node without words designated on both sides, cancel
    if (
      connectingSource.nodeId === targetNodeId &&
      (connectingSource.wordIndex === undefined || targetWordIndex === undefined)
    ) {
      setConnectingSource(null);
      return;
    }

    const isSameNode = connectingSource.nodeId === targetNodeId;
    const sourceNode = currentMap.nodes.find((n) => n.id === connectingSource.nodeId);
    const targetNode = currentMap.nodes.find((n) => n.id === targetNodeId);

    // Formulate source anchor
    let srcAnchor = connectingSource.anchor;
    if (!srcAnchor && sourceNode?.type === 'ayah' && sourceNode.ayahData) {
      srcAnchor = {
        surah: sourceNode.ayahData.surahNumber,
        ayah: sourceNode.ayahData.ayahNumberInSurah,
        level: connectingSource.wordIndex !== undefined ? 'word' : 'ayah',
        startWord: connectingSource.wordIndex,
        endWord: connectingSource.wordIndex,
        text: connectingSource.wordText || sourceNode.ayahData.textUthmani,
        surahName: sourceNode.ayahData.surahName,
        ayahNumberInSurah: sourceNode.ayahData.ayahNumberInSurah
      };
    }

    // Formulate target anchor
    let tgtAnchor = targetAnchor;
    if (!tgtAnchor && targetNode?.type === 'ayah' && targetNode.ayahData) {
      tgtAnchor = {
        surah: targetNode.ayahData.surahNumber,
        ayah: targetNode.ayahData.ayahNumberInSurah,
        level: targetWordIndex !== undefined ? 'word' : 'ayah',
        startWord: targetWordIndex,
        endWord: targetWordIndex,
        text: targetWordText || targetNode.ayahData.textUthmani,
        surahName: targetNode.ayahData.surahName,
        ayahNumberInSurah: targetNode.ayahData.ayahNumberInSurah
      };
    }

    const sourceTitle = sourceNode?.ayahData
      ? `سورة ${sourceNode.ayahData.surahName} [${sourceNode.ayahData.ayahNumberInSurah}]`
      : sourceNode?.conceptData?.title || sourceNode?.noteData?.title || 'عنصر تدبري';

    const targetTitle = targetNode?.ayahData
      ? `سورة ${targetNode.ayahData.surahName} [${targetNode.ayahData.ayahNumberInSurah}]`
      : targetNode?.conceptData?.title || targetNode?.noteData?.title || 'عنصر تدبري';

    setPendingConnection({
      sourceId: connectingSource.nodeId,
      targetId: targetNodeId,
      sourceAnchor: srcAnchor,
      targetAnchor: tgtAnchor,
      sourceWordIndex: connectingSource.wordIndex,
      targetWordIndex: targetWordIndex,
      sourceWordText: connectingSource.wordText,
      targetWordText: targetWordText,
      sourceNodeTitle: sourceTitle,
      targetNodeTitle: targetTitle,
      sourceHandle: connectingSource.handle,
      targetHandle: targetHandle,
      isSameNode: isSameNode
    });
    setConnectingSource(null);
  };

  const handleConfirmRelation = (edgeConfig: Partial<CanvasEdge>) => {
    if (!pendingConnection) return;
    const isSameNode = pendingConnection.isSameNode;

    const newEdge: CanvasEdge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId: pendingConnection.sourceId,
      targetId: pendingConnection.targetId,
      sourceAnchor: edgeConfig.sourceAnchor || pendingConnection.sourceAnchor,
      targetAnchor: edgeConfig.targetAnchor || pendingConnection.targetAnchor,
      sourceWordIndex: pendingConnection.sourceWordIndex,
      targetWordIndex: pendingConnection.targetWordIndex,
      sourceWordText: pendingConnection.sourceWordText,
      targetWordText: pendingConnection.targetWordText,
      sourceHandle: pendingConnection.sourceHandle,
      targetHandle: pendingConnection.targetHandle,
      relationshipKind: edgeConfig.relationshipKind || 'custom',
      customRelationship: edgeConfig.customRelationship,
      label: edgeConfig.label || 'رابط تدبري',
      style: edgeConfig.style || 'solid',
      curveType: isSameNode ? 'arc' : 'bezier',
      arrowType: edgeConfig.arrowType || 'end',
      color: edgeConfig.color || '#e11d48'
    };

    const newEdges = [...currentMap.edges, newEdge];
    onUpdateMap({
      ...currentMap,
      edges: newEdges,
      updatedAt: Date.now()
    });
    pushToHistory(currentMap.nodes, newEdges);
    setPendingConnection(null);
  };

  // Node Actions
  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = currentMap.nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = currentMap.edges.filter(
      (e) => e.sourceId !== nodeId && e.targetId !== nodeId
    );
    onUpdateMap({
      ...currentMap,
      nodes: updatedNodes,
      edges: updatedEdges,
      updatedAt: Date.now()
    });
    pushToHistory(updatedNodes, updatedEdges);
    setSelectedNodeIds((prev) => {
      const copy = new Set(prev);
      copy.delete(nodeId);
      return copy;
    });
  };

  const handleDeleteSelectedNodes = () => {
    if (selectedNodeIds.size === 0) return;
    const updatedNodes = currentMap.nodes.filter((n) => !selectedNodeIds.has(n.id));
    const updatedEdges = currentMap.edges.filter(
      (e) => !selectedNodeIds.has(e.sourceId) && !selectedNodeIds.has(e.targetId)
    );
    onUpdateMap({
      ...currentMap,
      nodes: updatedNodes,
      edges: updatedEdges,
      updatedAt: Date.now()
    });
    pushToHistory(updatedNodes, updatedEdges);
    setSelectedNodeIds(new Set());
  };

  const handleDuplicateNode = (nodeId: string) => {
    const target = currentMap.nodes.find((n) => n.id === nodeId);
    if (!target) return;

    const duplicated: CanvasNode = {
      ...JSON.parse(JSON.stringify(target)),
      id: `${target.type}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      x: target.x + 40,
      y: target.y + 40
    };

    const newNodes = [...currentMap.nodes, duplicated];
    onUpdateMap({
      ...currentMap,
      nodes: newNodes,
      updatedAt: Date.now()
    });
    pushToHistory(newNodes, currentMap.edges);
    setSelectedNodeIds(new Set([duplicated.id]));
  };

  const handleUpdateAnnotations = (nodeId: string, annotations: any[]) => {
    const updated = currentMap.nodes.map((n) => {
      if (n.id === nodeId && n.type === 'ayah') {
        return {
          ...n,
          ayahData: {
            ...n.ayahData,
            annotations
          }
        };
      }
      return n;
    });
    onUpdateMap({ ...currentMap, nodes: updated, updatedAt: Date.now() });
    pushToHistory(updated, currentMap.edges);
  };

  const handleUpdateTafsir = (nodeId: string, tafsir: string) => {
    const updated = currentMap.nodes.map((n) => {
      if (n.id === nodeId && n.type === 'ayah') {
        return {
          ...n,
          ayahData: {
            ...n.ayahData,
            tafsir
          }
        };
      }
      return n;
    });
    onUpdateMap({ ...currentMap, nodes: updated, updatedAt: Date.now() });
    pushToHistory(updated, currentMap.edges);
  };

  const handleUpdateNodeTheme = (nodeId: string, theme: string) => {
    const updated = currentMap.nodes.map((n) => (n.id === nodeId ? { ...n, colorTheme: theme } : n));
    onUpdateMap({ ...currentMap, nodes: updated, updatedAt: Date.now() });
    pushToHistory(updated, currentMap.edges);
  };

  const handleUpdateDimensions = (nodeId: string, width?: number, height?: number, fontSize?: number) => {
    const updated = currentMap.nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          width: width !== undefined ? width : n.width,
          height: height !== undefined ? height : n.height,
          fontSize: fontSize !== undefined ? fontSize : n.fontSize
        };
      }
      return n;
    });
    onUpdateMap({ ...currentMap, nodes: updated, updatedAt: Date.now() });
    pushToHistory(updated, currentMap.edges);
  };

  const handleAddNote = () => {
    const newNode: CanvasNode = {
      id: `note-${Date.now()}`,
      type: 'note',
      x: snap(Math.round((-pan.x + viewportDims.width / 2 - 160) / zoom)),
      y: snap(Math.round((-pan.y + viewportDims.height / 2 - 100) / zoom)),
      width: 340,
      colorTheme: 'amber',
      noteData: {
        title: 'وقفة تدبرية',
        content: 'سجل لطائف التدبر والملاحظات البيانية حول هذه الآية...',
        tags: ['تأمل']
      }
    };
    const newNodes = [...currentMap.nodes, newNode];
    onUpdateMap({ ...currentMap, nodes: newNodes, updatedAt: Date.now() });
    pushToHistory(newNodes, currentMap.edges);
    setSelectedNodeIds(new Set([newNode.id]));
    setShowMobileToolsSheet(false);
  };

  const handleAddConcept = () => {
    const newNode: CanvasNode = {
      id: `concept-${Date.now()}`,
      type: 'concept',
      x: snap(Math.round((-pan.x + viewportDims.width / 2 - 160) / zoom)),
      y: snap(Math.round((-pan.y + viewportDims.height / 2 - 80) / zoom)),
      width: 320,
      colorTheme: 'indigo',
      conceptData: {
        title: 'محور تدبري جامع',
        description: 'اكتب الفكرة المحورية الرابطة بين الآيات هنا...',
        badge: 'محور السورة'
      }
    };
    const newNodes = [...currentMap.nodes, newNode];
    onUpdateMap({ ...currentMap, nodes: newNodes, updatedAt: Date.now() });
    pushToHistory(newNodes, currentMap.edges);
    setSelectedNodeIds(new Set([newNode.id]));
    setShowMobileToolsSheet(false);
  };

  const handleAddGroup = () => {
    const newNode: CanvasNode = {
      id: `group-${Date.now()}`,
      type: 'group',
      x: snap(Math.round((-pan.x + viewportDims.width / 2 - 340) / zoom)),
      y: snap(Math.round((-pan.y + viewportDims.height / 2 - 200) / zoom)),
      width: 700,
      height: 440,
      colorTheme: 'emerald',
      groupData: {
        title: 'محور موضوعي / قسم',
        description: 'اجمع الآيات والملاحظات المتشابهة داخل هذا القسم'
      }
    };
    const newNodes = [newNode, ...currentMap.nodes];
    onUpdateMap({ ...currentMap, nodes: newNodes, updatedAt: Date.now() });
    pushToHistory(newNodes, currentMap.edges);
    setSelectedNodeIds(new Set([newNode.id]));
    setShowMobileToolsSheet(false);
  };

  const handleAddImage = () => {
    const newNode: CanvasNode = {
      id: `img-${Date.now()}`,
      type: 'image',
      x: snap(Math.round((-pan.x + viewportDims.width / 2 - 160) / zoom)),
      y: snap(Math.round((-pan.y + viewportDims.height / 2 - 100) / zoom)),
      width: 320,
      colorTheme: 'stone',
      imageData: {
        url: '',
        caption: 'خارطة ذهنية أو رسم توضيحي'
      }
    };
    const newNodes = [...currentMap.nodes, newNode];
    onUpdateMap({ ...currentMap, nodes: newNodes, updatedAt: Date.now() });
    pushToHistory(newNodes, currentMap.edges);
    setSelectedNodeIds(new Set([newNode.id]));
    setShowMobileToolsSheet(false);
  };

  // Smart Mind Map Auto-Layout
  const handleAutoLayout = () => {
    if (currentMap.nodes.length === 0) return;
    const newPositions = calculateMindMapLayout(currentMap.nodes, currentMap.edges);
    const posMap = new Map(newPositions.map((p) => [p.id, p]));

    const updatedNodes = currentMap.nodes.map((n) => {
      const p = posMap.get(n.id);
      if (p) {
        return { ...n, x: p.x, y: p.y };
      }
      return n;
    });

    onUpdateMap({
      ...currentMap,
      nodes: updatedNodes,
      updatedAt: Date.now()
    });
    pushToHistory(updatedNodes, currentMap.edges);
    handleFitView(updatedNodes);
  };

  // Zoom to Fit All Nodes (Unbounded TradingView-style)
  const handleFitView = (nodesToFit: CanvasNode[] = currentMap.nodes) => {
    if (nodesToFit.length === 0 || !containerRef.current) {
      setPan({ x: 80, y: 60 });
      setZoom(1);
      return;
    }

    const minX = Math.min(...nodesToFit.map((n) => n.x));
    const maxX = Math.max(...nodesToFit.map((n) => n.x + (n.width || 380)));
    const minY = Math.min(...nodesToFit.map((n) => n.y));
    const maxY = Math.max(...nodesToFit.map((n) => n.y + (n.height || 220)));

    const contentW = Math.max(maxX - minX, 200);
    const contentH = Math.max(maxY - minY, 200);

    const padding = 80;
    const availW = Math.max(viewportDims.width - padding * 2, 200);
    const availH = Math.max(viewportDims.height - padding * 2, 200);

    const scaleX = availW / contentW;
    const scaleY = availH / contentH;
    const targetZoom = Math.min(Math.max(Number(Math.min(scaleX, scaleY).toFixed(2)), 0.25), 1.25);

    const centerX = minX + contentW / 2;
    const centerY = minY + contentH / 2;

    const newPanX = viewportDims.width / 2 - centerX * targetZoom;
    const newPanY = viewportDims.height / 2 - centerY * targetZoom;

    setZoom(targetZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // Alignment Tools
  const handleAlign = (type: 'top' | 'bottom' | 'right' | 'left' | 'distribute-h' | 'distribute-v') => {
    const selectedNodes = currentMap.nodes.filter((n) => selectedNodeIds.has(n.id));
    if (selectedNodes.length < 2) return;

    let updatedNodes = [...currentMap.nodes];

    if (type === 'top') {
      const minY = Math.min(...selectedNodes.map((n) => n.y));
      updatedNodes = updatedNodes.map((n) => (selectedNodeIds.has(n.id) ? { ...n, y: minY } : n));
    } else if (type === 'bottom') {
      const maxY = Math.max(...selectedNodes.map((n) => n.y));
      updatedNodes = updatedNodes.map((n) => (selectedNodeIds.has(n.id) ? { ...n, y: maxY } : n));
    } else if (type === 'right') {
      const maxX = Math.max(...selectedNodes.map((n) => n.x));
      updatedNodes = updatedNodes.map((n) => (selectedNodeIds.has(n.id) ? { ...n, x: maxX } : n));
    } else if (type === 'left') {
      const minX = Math.min(...selectedNodes.map((n) => n.x));
      updatedNodes = updatedNodes.map((n) => (selectedNodeIds.has(n.id) ? { ...n, x: minX } : n));
    } else if (type === 'distribute-h') {
      const sorted = [...selectedNodes].sort((a, b) => a.x - b.x);
      const minX = sorted[0].x;
      const maxX = sorted[sorted.length - 1].x;
      const step = (maxX - minX) / (sorted.length - 1);
      sorted.forEach((node, idx) => {
        updatedNodes = updatedNodes.map((n) => (n.id === node.id ? { ...n, x: Math.round(minX + idx * step) } : n));
      });
    } else if (type === 'distribute-v') {
      const sorted = [...selectedNodes].sort((a, b) => a.y - b.y);
      const minY = sorted[0].y;
      const maxY = sorted[sorted.length - 1].y;
      const step = (maxY - minY) / (sorted.length - 1);
      sorted.forEach((node, idx) => {
        updatedNodes = updatedNodes.map((n) => (n.id === node.id ? { ...n, y: Math.round(minY + idx * step) } : n));
      });
    }

    onUpdateMap({ ...currentMap, nodes: updatedNodes, updatedAt: Date.now() });
    pushToHistory(updatedNodes, currentMap.edges);
  };

  const getCanvasBackgroundClass = () => {
    switch (gridType) {
      case 'dots':
        return 'bg-canvas-dots';
      case 'lines':
        return 'bg-canvas-lines';
      case 'islamic':
        return 'bg-canvas-islamic';
      case 'clean':
        return 'bg-stone-50';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleCanvasTouchStart}
      onTouchMove={handleCanvasTouchMove}
      onTouchEnd={handleCanvasTouchEnd}
      onTouchCancel={handleCanvasTouchEnd}
      className={`relative w-full h-[calc(100vh-4rem)] bg-stone-100/95 overflow-hidden select-none touch-none ${getCanvasBackgroundClass()} ${
        canvasMode === 'pan' || isSpacePressed || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        backgroundSize: gridType === 'dots' || gridType === 'lines' ? `${28 * zoom}px ${28 * zoom}px` : undefined
      }}
    >
      {/* Top Left Studio Control Toolbar (Desktop & Tablet) */}
      <div className="absolute top-3 left-3 z-30 hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-stone-200">
        {/* Interaction Mode Switcher: Pointer vs Hand */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl">
          <button
            onClick={() => setCanvasMode('select')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              canvasMode === 'select' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
            title="وضع التحديد والتحريك (V)"
          >
            <MousePointer className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline font-cairo">تحديد</span>
          </button>
          <button
            onClick={() => setCanvasMode('pan')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              canvasMode === 'pan' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
            title="وضع تحريك الورقة الحرة (H أو مسافة)"
          >
            <Hand className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline font-cairo">تحريك</span>
          </button>
        </div>

        <div className="h-4 w-px bg-stone-200 mx-0.5" />

        {/* Undo / Redo */}
        {!readOnly && (
          <>
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-xl transition-colors ${
                canUndo ? 'text-stone-700 hover:bg-stone-100' : 'text-stone-300 cursor-not-allowed'
              }`}
              title="تراجع (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-xl transition-colors ${
                canRedo ? 'text-stone-700 hover:bg-stone-100' : 'text-stone-300 cursor-not-allowed'
              }`}
              title="إعادة (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-stone-200 mx-0.5" />
          </>
        )}

        {/* Smart Auto Layout */}
        {!readOnly && (
          <button
            onClick={handleAutoLayout}
            className="flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-xl transition-colors font-cairo"
            title="ترتيب تلقائي ذكي لعناصر الخريطة الذهنية"
          >
            <Sparkle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">ترتيب ذكي</span>
          </button>
        )}

        {/* Fit to Content */}
        <button
          onClick={() => handleFitView()}
          className="p-1.5 text-stone-700 hover:text-emerald-700 hover:bg-stone-100 rounded-xl transition-colors"
          title="ملاءمة الشاشة لكل المحتوى"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Snap to grid */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`p-1.5 rounded-xl transition-colors ${
            snapToGrid ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-stone-500 hover:bg-stone-100'
          }`}
          title={snapToGrid ? 'المحاذاة للشبكة: مفعّلة' : 'المحاذاة للشبكة: معطّلة'}
        >
          <Magnet className="w-4 h-4" />
        </button>

        {/* Grid style switcher */}
        <button
          onClick={() => {
            const types: CanvasGridType[] = ['dots', 'lines', 'islamic', 'clean'];
            const next = types[(types.indexOf(gridType) + 1) % types.length];
            setGridType(next);
          }}
          className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors"
          title={`نمط الورقة: ${gridType}`}
        >
          <Grid className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-stone-200 mx-0.5" />

        {/* Shortcuts Help */}
        <button
          onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
          title="اختصارات لوحة المفاتيح (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* TradingView-Style Infinite Coordinates & Metrics HUD (Desktop) */}
      <div className="absolute bottom-4 left-4 z-30 hidden sm:flex items-center gap-2 bg-stone-900/90 backdrop-blur-md text-stone-200 px-3 py-1.5 rounded-xl border border-stone-700/60 shadow-xl text-xs font-mono select-none">
        <Compass className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-stone-400">X:</span>
        <span className="text-emerald-400 font-bold">{Math.round(-pan.x / zoom)}</span>
        <span className="text-stone-400">Y:</span>
        <span className="text-emerald-400 font-bold">{Math.round(-pan.y / zoom)}</span>
        <span className="text-stone-600">|</span>
        <button
          onClick={() => {
            setPan({ x: 80, y: 60 });
            setZoom(1);
          }}
          className="text-[11px] text-stone-300 hover:text-white hover:underline font-cairo transition-colors"
          title="العودة لنقطة البداية (0, 0)"
        >
          المركز
        </button>
        <span className="text-stone-600">|</span>
        <span className="text-amber-400 font-bold font-cairo">{Math.round(zoom * 100)}%</span>
        <span className="text-stone-600">|</span>
        <span className="text-stone-400 font-cairo text-[11px]">{currentMap.nodes.length} بطاقة</span>
      </div>

      {/* Multi-Selection Alignment Toolbar */}
      {selectedNodeIds.size >= 2 && !readOnly && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-1 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="text-stone-400 pl-2 border-l border-stone-700 ml-1 font-cairo">
            {selectedNodeIds.size} محددة
          </span>
          <button
            onClick={() => handleAlign('top')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-stone-300 hover:text-white"
            title="محاذاة لأعلى"
          >
            <AlignStartVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAlign('bottom')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-stone-300 hover:text-white"
            title="محاذاة لأسفل"
          >
            <AlignEndVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAlign('right')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-stone-300 hover:text-white"
            title="محاذاة لليمين"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAlign('left')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-stone-300 hover:text-white"
            title="محاذاة لليسار"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAlign('distribute-h')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-stone-300 hover:text-white"
            title="توزيع أفقي متساوٍ"
          >
            <AlignHorizontalDistributeCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAlign('distribute-v')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-stone-300 hover:text-white"
            title="توزيع رأسي متساوٍ"
          >
            <AlignVerticalDistributeCenter className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Connecting Mode Banner */}
      {connectingSource && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-stone-950/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-emerald-500/80 animate-in fade-in zoom-in-95">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <Link className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex items-center gap-1.5 font-cairo">
            <span className="text-stone-300">جاري الربط من:</span>
            <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200 font-bold font-quran">
              {connectingSource.wordText || 'البطاقة الحالية'}
            </span>
            <span className="text-stone-300">⟵ انقر على حرف أو كلمة أو بطاقة هدف</span>
          </div>
          <button
            onClick={() => setConnectingSource(null)}
            className="text-stone-400 hover:text-white px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold transition-colors ml-1"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TRADINGVIEW UNBOUNDED INFINITE WORLD VIEWPORT LAYER      */}
      {/* ========================================================= */}

      {/* SVG Layer for Edges and Active Drawing Wire (Layered at z-30 above cards so arrows and lines are completely visible) */}
      <svg
        id="canvas-svg-layer"
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {currentMap.edges.map((edge) => {
            const sNode = currentMap.nodes.find((n) => n.id === edge.sourceId);
            const tNode = currentMap.nodes.find((n) => n.id === edge.targetId);
            if (!sNode || !tNode) return null;

            return (
              <EdgeRenderer
                key={edge.id}
                edge={edge}
                sourceNode={sNode}
                targetNode={tNode}
                onUpdateEdge={(id, updates) => {
                  const updated = currentMap.edges.map((e) => (e.id === id ? { ...e, ...updates } : e));
                  onUpdateMap({ ...currentMap, edges: updated, updatedAt: Date.now() });
                  pushToHistory(currentMap.nodes, updated);
                }}
                onDeleteEdge={(id) => {
                  const updated = currentMap.edges.filter((e) => e.id !== id);
                  onUpdateMap({ ...currentMap, edges: updated, updatedAt: Date.now() });
                  pushToHistory(currentMap.nodes, updated);
                }}
                readOnly={readOnly}
              />
            );
          })}

          {/* Active Live Wire when pulling connection */}
          {connectingSource && (() => {
            const srcNode = currentMap.nodes.find((n) => n.id === connectingSource.nodeId);
            if (!srcNode) return null;
            let sX = srcNode.x + (srcNode.width || 400) / 2;
            let sY = srcNode.y + (srcNode.height || 200) / 2;
            let isWord = false;
            if (connectingSource.wordIndex !== undefined && srcNode.type === 'ayah') {
              const anchor = getPreciseNodeAnchor(srcNode, 'top', connectingSource.wordIndex, 'center');
              sX = anchor.x;
              sY = anchor.y;
              isWord = anchor.isWordAnchor;
            } else if (connectingSource.handle) {
              const anchor = getPreciseNodeAnchor(srcNode, connectingSource.handle);
              sX = anchor.x;
              sY = anchor.y;
            }
            return (
              <g>
                <line
                  x1={sX}
                  y1={sY}
                  x2={mouseCanvasPos.x}
                  y2={mouseCanvasPos.y}
                  stroke="rgba(255, 255, 255, 0.95)"
                  strokeWidth={5}
                />
                <line
                  x1={sX}
                  y1={sY}
                  x2={mouseCanvasPos.x}
                  y2={mouseCanvasPos.y}
                  stroke={isWord ? '#e11d48' : '#10b981'}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                />
                {isWord ? (
                  <>
                    <circle cx={sX} cy={sY} r={10} fill="#e11d48" fillOpacity={0.25} className="animate-ping" />
                    <circle cx={sX} cy={sY} r={5} fill="#ffffff" stroke="#e11d48" strokeWidth={2} />
                    <circle cx={mouseCanvasPos.x} cy={mouseCanvasPos.y} r={7} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
                  </>
                ) : (
                  <>
                    <circle cx={sX} cy={sY} r={5} fill="#ffffff" stroke="#10b981" strokeWidth={2} />
                    <circle cx={mouseCanvasPos.x} cy={mouseCanvasPos.y} r={7} fill="#10b981" stroke="#ffffff" strokeWidth={1.5} />
                  </>
                )}
              </g>
            );
          })()}
        </g>
      </svg>

      {/* Nodes Container (GPU Accelerated, Infinite World Matrix) */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Groups (Rendered at lower layer) */}
        {currentMap.nodes
          .filter((n) => n.type === 'group')
          .map((node) => (
            <div
              key={node.id}
              id={`node-card-${node.id}`}
              onMouseDown={(e) => handleNodeMouseDown(node, e)}
              onTouchStart={(e) => handleNodeTouchStart(node, e)}
              className={`absolute pointer-events-auto transition-shadow z-5 ${
                canvasMode === 'pan' ? 'cursor-grab' : 'cursor-move'
              }`}
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`
              }}
            >
              <GroupNodeCard
                node={node}
                isSelected={selectedNodeIds.has(node.id)}
                onSelect={() => setSelectedNodeIds(new Set([node.id]))}
                onDelete={handleDeleteNode}
                onUpdateGroupData={(id, data) => {
                  const updated = currentMap.nodes.map((n) => (n.id === id ? { ...n, groupData: data } : n));
                  onUpdateMap({ ...currentMap, nodes: updated, updatedAt: Date.now() });
                }}
                onUpdateTheme={handleUpdateNodeTheme}
                readOnly={readOnly}
              />
            </div>
          ))}

        {/* Content Cards (Ayah, Note, Concept, Image) */}
        {currentMap.nodes
          .filter((n) => n.type !== 'group')
          .map((node) => (
            <div
              key={node.id}
              id={`node-card-${node.id}`}
              onMouseDown={(e) => handleNodeMouseDown(node, e)}
              onTouchStart={(e) => handleNodeTouchStart(node, e)}
              className={`absolute pointer-events-auto transition-shadow z-20 ${
                canvasMode === 'pan' ? 'cursor-grab' : 'cursor-move'
              }`}
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`
              }}
            >
              {node.type === 'ayah' && (
                <AyahNodeCard
                  node={node}
                  isSelected={selectedNodeIds.has(node.id)}
                  onSelect={() => setSelectedNodeIds(new Set([node.id]))}
                  onDelete={handleDeleteNode}
                  onDuplicate={handleDuplicateNode}
                  onUpdateAnnotations={handleUpdateAnnotations}
                  onUpdateTafsir={handleUpdateTafsir}
                  onUpdateTheme={handleUpdateNodeTheme}
                  onUpdateDimensions={handleUpdateDimensions}
                  onStartConnecting={handleStartConnecting}
                  onCompleteConnecting={handleCompleteConnection}
                  isConnectingMode={Boolean(connectingSource)}
                  readOnly={readOnly}
                  zoom={zoom}
                />
              )}

              {node.type === 'note' && (
                <NoteNodeCard
                  node={node}
                  isSelected={selectedNodeIds.has(node.id)}
                  onSelect={() => setSelectedNodeIds(new Set([node.id]))}
                  onDelete={handleDeleteNode}
                  onDuplicate={handleDuplicateNode}
                  onUpdateNoteData={(id, data) => {
                    const updated = currentMap.nodes.map((n) => (n.id === id ? { ...n, noteData: data } : n));
                    onUpdateMap({ ...currentMap, nodes: updated, updatedAt: Date.now() });
                    pushToHistory(updated, currentMap.edges);
                  }}
                  onUpdateTheme={handleUpdateNodeTheme}
                  onStartConnecting={handleStartConnecting}
                  onCompleteConnecting={handleCompleteConnection}
                  isConnectingMode={Boolean(connectingSource)}
                  readOnly={readOnly}
                />
              )}

              {node.type === 'concept' && (
                <ConceptNodeCard
                  node={node}
                  isSelected={selectedNodeIds.has(node.id)}
                  onSelect={() => setSelectedNodeIds(new Set([node.id]))}
                  onDelete={handleDeleteNode}
                  onDuplicate={handleDuplicateNode}
                  onUpdateConceptData={(id, data) => {
                    const updated = currentMap.nodes.map((n) => (n.id === id ? { ...n, conceptData: data } : n));
                    onUpdateMap({ ...currentMap, nodes: updated, updatedAt: Date.now() });
                    pushToHistory(updated, currentMap.edges);
                  }}
                  onStartConnecting={handleStartConnecting}
                  onCompleteConnecting={handleCompleteConnection}
                  isConnectingMode={Boolean(connectingSource)}
                  readOnly={readOnly}
                />
              )}

              {node.type === 'image' && (
                <ImageNodeCard
                  node={node}
                  isSelected={selectedNodeIds.has(node.id)}
                  onSelect={() => setSelectedNodeIds(new Set([node.id]))}
                  onDelete={handleDeleteNode}
                  onUpdateImageData={(id, data) => {
                    const updated = currentMap.nodes.map((n) => (n.id === id ? { ...n, imageData: data } : n));
                    onUpdateMap({ ...currentMap, nodes: updated, updatedAt: Date.now() });
                    pushToHistory(updated, currentMap.edges);
                  }}
                  onStartConnecting={handleStartConnecting}
                  onCompleteConnecting={handleCompleteConnection}
                  isConnectingMode={Boolean(connectingSource)}
                  readOnly={readOnly}
                />
              )}
            </div>
          ))}
      </div>

      {/* Bottom Right Mini-Map (Hidden by default on mobile) */}
      <div className="absolute bottom-16 sm:bottom-5 right-3 sm:right-5 z-40">
        <CanvasMiniMap
          nodes={currentMap.nodes}
          pan={pan}
          zoom={zoom}
          viewportWidth={viewportDims.width}
          viewportHeight={viewportDims.height}
          onPanTo={(nx, ny) => setPan({ x: Math.round(nx), y: Math.round(ny) })}
          onFitView={() => handleFitView()}
          isOpen={isMiniMapOpen}
          onToggleOpen={() => setIsMiniMapOpen(!isMiniMapOpen)}
        />
      </div>

      {/* ========================================================= */}
      {/* DESKTOP STUDIO DOCK (hidden on mobile, visible on sm+)     */}
      {/* ========================================================= */}
      {!readOnly && (
        <div className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-stone-200 shadow-2xl px-3 py-2 rounded-2xl items-center gap-1.5 select-none animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Templates Launcher */}
          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all hover:scale-105 font-cairo"
              title="معرض هياكل وقوالب الخرائط التدبرية"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>قوالب الهياكل</span>
            </button>
          )}

          {/* Quick Ayah Picker */}
          {onOpenQuickAyahPicker && (
            <button
              onClick={onOpenQuickAyahPicker}
              className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105 font-cairo border border-stone-300"
              title="إدراج آية بالرقم والسورة مباشرة"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>منتقي سريع</span>
            </button>
          )}

          {/* Add Ayah via Quran Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all hover:scale-105 font-cairo"
            title="البحث في المصحف وإضافة آيات"
          >
            <Search className="w-3.5 h-3.5 text-amber-300" />
            <span>بحث الآيات</span>
          </button>

          {/* Add Note Card */}
          <button
            onClick={handleAddNote}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105 font-cairo"
            title="إضافة وقفة تدبرية"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>وقفة تدبرية</span>
          </button>

          {/* Add Concept Hub */}
          <button
            onClick={handleAddConcept}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105 font-cairo"
            title="إضافة فكرة أو محور مركزي"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>محور رئيسي</span>
          </button>

          {/* Add Group Section Frame */}
          <button
            onClick={handleAddGroup}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105 font-cairo"
            title="إضافة قسم أو إطار تجميعي"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>إطار تجميعي</span>
          </button>

          {/* Add Image */}
          <button
            onClick={handleAddImage}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105 font-cairo"
            title="إضافة رسم أو خريطة ذهنية"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>صورة</span>
          </button>

          <div className="h-5 w-px bg-stone-200 mx-1" />

          {/* Zoom In */}
          <button
            onClick={() => setZoom(Math.min(Number((zoom + 0.15).toFixed(2)), 3.0))}
            className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors"
            title="تكبير (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoom(Math.max(Number((zoom - 0.15).toFixed(2)), 0.15))}
            className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors"
            title="تصغير (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset Zoom & Pan to Origin */}
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 80, y: 60 });
            }}
            className="text-[11px] font-mono font-bold text-stone-700 hover:bg-stone-100 px-2 py-1 rounded-lg"
            title="إعادة ضبط المقياس إلى 100% والعودة للمركز"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOBILE FIRST BOTTOM THUMB BAR (optimized for phone thumbs) */}
      {/* ========================================================= */}
      <div className="sm:hidden absolute bottom-3 inset-x-3 z-30 flex items-center justify-between bg-stone-950/95 backdrop-blur-md text-white p-2 rounded-2xl shadow-2xl border border-stone-800">
        {/* Quick Mode Toggle (Pan vs Select) */}
        <button
          onClick={() => setCanvasMode(canvasMode === 'pan' ? 'select' : 'pan')}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            canvasMode === 'pan'
              ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
              : 'bg-stone-800 text-stone-200 hover:text-white'
          }`}
          title={canvasMode === 'pan' ? 'وضع التحريك مفعّل' : 'وضع التحديد مفعّل'}
        >
          {canvasMode === 'pan' ? (
            <>
              <Hand className="w-4 h-4" />
              <span>تحريك</span>
            </>
          ) : (
            <>
              <MousePointer className="w-4 h-4 text-emerald-400" />
              <span>تحديد</span>
            </>
          )}
        </button>

        {/* Primary Add Ayah Button (Prominent) */}
        <button
          onClick={onOpenSearch}
          className="flex-1 mx-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 min-h-[44px]"
        >
          <Search className="w-4 h-4 text-amber-300" />
          <span className="font-cairo">إضافة آية</span>
        </button>

        {/* Tools Sheet Toggle */}
        <button
          onClick={() => setShowMobileToolsSheet(!showMobileToolsSheet)}
          className={`p-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
            showMobileToolsSheet ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300'
          }`}
          title="عناصر إضافية"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Fit Content View */}
        <button
          onClick={() => handleFitView()}
          className="p-2.5 ml-1 bg-stone-800 text-stone-300 hover:text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="ملاءمة الشاشة"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Tools Drawer Sheet (When user taps '+' on mobile) */}
      {showMobileToolsSheet && (
        <div
          className="sm:hidden absolute bottom-18 inset-x-3 z-40 bg-stone-900/98 backdrop-blur-xl border border-stone-800 rounded-3xl p-4 shadow-2xl text-white animate-in fade-in slide-in-from-bottom-4 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
            <span className="text-xs font-bold text-stone-300 font-cairo">إضافة عناصر للخريطة الذهنية</span>
            <button
              onClick={() => setShowMobileToolsSheet(false)}
              className="text-stone-400 hover:text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {onOpenTemplates && (
              <button
                onClick={() => {
                  onOpenTemplates();
                  setShowMobileToolsSheet(false);
                }}
                className="col-span-2 flex items-center justify-between p-3 bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-700 hover:to-teal-800 rounded-2xl text-xs font-bold text-white shadow-md"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-bold">قوالب الهياكل التدبرية</div>
                    <div className="text-[10px] text-emerald-200 font-normal">تطبيق هيكل ذهني جاهز بضغطة زر</div>
                  </div>
                </div>
                <span className="text-[11px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">6 قوالب</span>
              </button>
            )}

            {onOpenQuickAyahPicker && (
              <button
                onClick={() => {
                  onOpenQuickAyahPicker();
                  setShowMobileToolsSheet(false);
                }}
                className="col-span-2 flex items-center gap-2 p-2.5 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-2xl text-xs font-bold text-right"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-stone-100">منتقي الآيات المباشر</div>
                  <div className="text-[10px] text-stone-400 font-normal">اختيار السورة والآيات بسهولة دون كتابة</div>
                </div>
              </button>
            )}

            <button
              onClick={handleAddNote}
              className="flex items-center gap-2 p-3 bg-stone-800 hover:bg-stone-700 rounded-2xl text-xs font-bold text-right"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-stone-200">وقفة تدبرية</div>
                <div className="text-[10px] text-stone-400 font-normal">تأمل أو لطيفة بيانية</div>
              </div>
            </button>

            <button
              onClick={handleAddConcept}
              className="flex items-center gap-2 p-3 bg-stone-800 hover:bg-stone-700 rounded-2xl text-xs font-bold text-right"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-stone-200">محور رئيسي</div>
                <div className="text-[10px] text-stone-400 font-normal">فكرة جامعة للسورة</div>
              </div>
            </button>

            <button
              onClick={handleAddGroup}
              className="flex items-center gap-2 p-3 bg-stone-800 hover:bg-stone-700 rounded-2xl text-xs font-bold text-right"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-stone-200">إطار تجميعي</div>
                <div className="text-[10px] text-stone-400 font-normal">قسم موضوعي كبير</div>
              </div>
            </button>

            <button
              onClick={handleAddImage}
              className="flex items-center gap-2 p-3 bg-stone-800 hover:bg-stone-700 rounded-2xl text-xs font-bold text-right"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-stone-200">صورة توضيحية</div>
                <div className="text-[10px] text-stone-400 font-normal">رسم أو مخطط خارجي</div>
              </div>
            </button>
          </div>

          {/* Quick Tools Row on Mobile */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
            <button
              onClick={() => {
                handleAutoLayout();
                setShowMobileToolsSheet(false);
              }}
              className="flex items-center gap-1 text-emerald-400 font-bold p-1.5"
            >
              <Sparkle className="w-3.5 h-3.5" />
              <span>ترتيب ذكي</span>
            </button>

            <button
              onClick={() => {
                setPan({ x: 80, y: 60 });
                setZoom(1);
                setShowMobileToolsSheet(false);
              }}
              className="flex items-center gap-1 text-stone-300 p-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>المركز (100%)</span>
            </button>

            <button
              onClick={() => {
                setIsMiniMapOpen(!isMiniMapOpen);
                setShowMobileToolsSheet(false);
              }}
              className="flex items-center gap-1 text-stone-300 p-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isMiniMapOpen ? 'إخفاء الخريطة' : 'إظهار الخريطة'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Dialog */}
      {showShortcutsHelp && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowShortcutsHelp(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-md w-full p-6 text-stone-800 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-cairo font-bold text-base text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                اختصارات بيئة التدبر الاحترافية
              </h3>
              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 px-2 bg-stone-50 rounded-xl">
                <span className="font-medium text-stone-700">تحريك الورقة اللانهائية (Pan)</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                  Space + سحب بالماوس أو إصبعين
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 bg-stone-50 rounded-xl">
                <span className="font-medium text-stone-700">التقريب والتبعيد (Zoom)</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                  عجلة الفأرة أو قرص بإصبعين
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 bg-stone-50 rounded-xl">
                <span className="font-medium text-stone-700">تحديد بطاقات متعددة</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                  Shift + نقر على البطاقات
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 bg-stone-50 rounded-xl">
                <span className="font-medium text-stone-700">تراجع / إعادة</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                  Ctrl + Z / Ctrl + Y
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 bg-stone-50 rounded-xl">
                <span className="font-medium text-stone-700">حذف البطاقات المحددة</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                  Delete / Backspace
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 bg-stone-50 rounded-xl">
                <span className="font-medium text-stone-700">إنشاء رابط بين آيتين</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                  نقر منفذ الاتصال بالبطاقة ثم نقر بطاقة أخرى
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsHelp(false)}
              className="mt-6 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold font-cairo text-xs transition-colors"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}

      {/* Semantic Relation Configuration Modal */}
      {pendingConnection && (
        <RelationConfigModal
          pendingConnection={pendingConnection}
          onConfirm={handleConfirmRelation}
          onCancel={() => setPendingConnection(null)}
        />
      )}
    </div>
  );
};
