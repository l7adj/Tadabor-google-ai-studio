import React, { useRef } from 'react';
import { CanvasNode } from '../../types';
import { Map, Maximize2, Minimize2, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface CanvasMiniMapProps {
  nodes: CanvasNode[];
  pan: { x: number; y: number };
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
  onPanTo: (x: number, y: number) => void;
  onFitView: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const CanvasMiniMap: React.FC<CanvasMiniMapProps> = ({
  nodes,
  pan,
  zoom,
  viewportWidth,
  viewportHeight,
  onPanTo,
  onFitView,
  isOpen,
  onToggleOpen
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-stone-200 text-stone-700 hover:text-emerald-700 hover:bg-stone-50 transition-all flex items-center gap-1.5 text-xs font-bold font-cairo"
        title="فتح الخريطة المصغرة"
      >
        <Compass className="w-4 h-4 text-emerald-600" />
        <span className="hidden sm:inline">خريطة اللوحة</span>
      </button>
    );
  }

  // Calculate bounding box of all nodes
  let minX = 0;
  let maxX = 2000;
  let minY = 0;
  let maxY = 1500;

  if (nodes.length > 0) {
    minX = Math.min(...nodes.map((n) => n.x)) - 150;
    maxX = Math.max(...nodes.map((n) => n.x + (n.width || 380))) + 150;
    minY = Math.min(...nodes.map((n) => n.y)) - 150;
    maxY = Math.max(...nodes.map((n) => n.y + (n.height || 220))) + 150;
  }

  // Ensure minimum dimensions
  const worldWidth = Math.max(maxX - minX, 1500);
  const worldHeight = Math.max(maxY - minY, 1000);

  // Mini-map dimensions
  const miniMapWidth = 200;
  const miniMapHeight = 130;

  const scaleX = miniMapWidth / worldWidth;
  const scaleY = miniMapHeight / worldHeight;
  const scale = Math.min(scaleX, scaleY);

  // Viewport rectangle calculation in world coordinates
  const viewWorldX = -pan.x / zoom;
  const viewWorldY = -pan.y / zoom;
  const viewWorldW = viewportWidth / zoom;
  const viewWorldH = viewportHeight / zoom;

  // Transform to mini-map coordinates
  const rectX = (viewWorldX - minX) * scale;
  const rectY = (viewWorldY - minY) * scale;
  const rectW = Math.max(viewWorldW * scale, 12);
  const rectH = Math.max(viewWorldH * scale, 8);

  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickMiniX = e.clientX - rect.left;
    const clickMiniY = e.clientY - rect.top;

    // Convert back to world coordinates
    const targetWorldX = minX + clickMiniX / scale;
    const targetWorldY = minY + clickMiniY / scale;

    // Center viewport at this world position
    const newPanX = -(targetWorldX * zoom) + viewportWidth / 2;
    const newPanY = -(targetWorldY * zoom) + viewportHeight / 2;

    onPanTo(newPanX, newPanY);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-stone-100 bg-stone-50/80 text-xs font-bold text-stone-700 font-cairo">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-700" />
          <span>الخريطة المصغرة ({nodes.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onFitView}
            className="p-1 text-stone-400 hover:text-emerald-700 hover:bg-stone-200/50 rounded"
            title="ملاءمة كل الآيات على الشاشة"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onToggleOpen}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded"
            title="تصغير"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Map Surface */}
      <div
        ref={mapContainerRef}
        onClick={handleMiniMapClick}
        className="relative bg-stone-100/90 cursor-crosshair overflow-hidden"
        style={{ width: miniMapWidth, height: miniMapHeight }}
      >
        {/* Nodes representations */}
        {nodes.map((n) => {
          const nx = (n.x - minX) * scale;
          const ny = (n.y - minY) * scale;
          const nw = Math.max((n.width || 380) * scale, 5);
          const nh = Math.max((n.height || 180) * scale, 4);

          let nodeColor = '#f59e0b';
          if (n.type === 'ayah') {
            nodeColor = n.colorTheme === 'emerald' ? '#10b981' : n.colorTheme === 'teal' ? '#06b6d4' : '#f59e0b';
          } else if (n.type === 'concept') {
            nodeColor = '#6366f1';
          } else if (n.type === 'note') {
            nodeColor = '#78716c';
          } else if (n.type === 'group') {
            nodeColor = '#cbd5e1';
          }

          return (
            <div
              key={n.id}
              className="absolute rounded-xs pointer-events-none"
              style={{
                left: Math.max(nx, 0),
                top: Math.max(ny, 0),
                width: nw,
                height: nh,
                backgroundColor: nodeColor,
                opacity: n.type === 'group' ? 0.35 : 0.85,
                border: n.type === 'group' ? '1px dashed #64748b' : undefined
              }}
            />
          );
        })}

        {/* Viewport Frustum Box */}
        <div
          className="absolute border-2 border-emerald-600 bg-emerald-500/20 rounded-xs pointer-events-none transition-all duration-75 shadow-xs"
          style={{
            left: Math.max(rectX, 0),
            top: Math.max(rectY, 0),
            width: Math.min(rectW, miniMapWidth),
            height: Math.min(rectH, miniMapHeight)
          }}
        />
      </div>
    </div>
  );
};
