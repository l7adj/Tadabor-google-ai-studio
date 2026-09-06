import React, { useState } from 'react';
import { CanvasEdge, CanvasNode, HandlePosition, RelationshipKind } from '../../types';
import { Trash2, Edit2, Check, Sparkles, SlidersHorizontal, Activity } from 'lucide-react';
import { RELATIONSHIP_LIST, formatAnchorReference } from '../../lib/quranAnchors';

interface EdgeRendererProps {
  edge: CanvasEdge;
  sourceNode: CanvasNode;
  targetNode: CanvasNode;
  onUpdateEdge: (edgeId: string, updates: Partial<CanvasEdge>) => void;
  onDeleteEdge: (edgeId: string) => void;
  readOnly?: boolean;
}

const RELATIONSHIP_PRESETS = RELATIONSHIP_LIST.map((def) => ({
  kind: def.kind,
  label: def.label,
  color: def.color,
  category: def.shortLabel
}));

const COLOR_PALETTE = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

// Helper to get estimated node height based on type
function getNodeHeight(node: CanvasNode): number {
  if (node.height) return node.height;
  if (node.type === 'group') return 400;
  if (node.type === 'ayah') return 220;
  if (node.type === 'note') return 180;
  if (node.type === 'concept') return 140;
  return 180;
}

// Calculate precise anchor point on a node or exact word inside an ayah
export function getPreciseNodeAnchor(
  node: CanvasNode,
  handle: HandlePosition,
  wordIndex?: number,
  preferVerticalDirection?: 'top' | 'bottom' | 'center'
): { x: number; y: number; isWordAnchor: boolean } {
  let width = node.width || (node.type === 'group' ? 680 : 400);
  let height = getNodeHeight(node);

  let cardEl: HTMLElement | null = null;
  if (typeof document !== 'undefined') {
    cardEl = document.getElementById(`node-card-${node.id}`);
    if (cardEl) {
      if (cardEl.offsetWidth > 0) width = cardEl.offsetWidth;
      if (cardEl.offsetHeight > 0) height = cardEl.offsetHeight;
    }
  }

  if (wordIndex !== undefined && node.type === 'ayah') {
    // 1. Try to locate the exact DOM element of the word in real-time
    if (typeof document !== 'undefined') {
      const wordEl = document.getElementById(`ayah-word-${node.id}-${wordIndex}`);

      if (wordEl && cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        const wordRect = wordEl.getBoundingClientRect();

        if (cardRect.width > 0 && width > 0) {
          const zoomScale = cardRect.width / width;
          const relX = (wordRect.left + wordRect.width / 2 - cardRect.left) / zoomScale;
          
          let relY = (wordRect.top + wordRect.height / 2 - cardRect.top) / zoomScale;
          if (preferVerticalDirection === 'top') {
            relY = (wordRect.top - cardRect.top) / zoomScale - 4;
          } else if (preferVerticalDirection === 'bottom') {
            relY = (wordRect.bottom - cardRect.top) / zoomScale + 4;
          }

          return {
            x: node.x + relX,
            y: node.y + relY,
            isWordAnchor: true
          };
        }
      }
    }

    // 2. Intelligent mathematical fallback if DOM is not yet measured
    const words = (node.ayahData?.textUthmani || '').trim().split(/\s+/);
    const totalWords = Math.max(words.length, 1);
    const clampedIndex = Math.min(Math.max(wordIndex, 0), totalWords - 1);
    
    // Estimate word position in Arabic RTL flow
    const wordsPerLine = Math.max(Math.floor(width / 65), 4);
    const lineIndex = Math.floor(clampedIndex / wordsPerLine);
    const indexInLine = clampedIndex % wordsPerLine;
    const totalInThisLine = Math.min(wordsPerLine, totalWords - lineIndex * wordsPerLine);
    
    // RTL: 0 is on the right
    const horizontalFraction = (indexInLine + 0.5) / Math.max(totalInThisLine, 1);
    const fallbackX = node.x + width * (1 - horizontalFraction);
    const fallbackY = node.y + 65 + lineIndex * 42;

    return {
      x: fallbackX,
      y: fallbackY,
      isWordAnchor: true
    };
  }

  // Node boundary handle
  let coord = { x: node.x + width / 2, y: node.y + height / 2 };
  switch (handle) {
    case 'top':
      coord = { x: node.x + width / 2, y: node.y };
      break;
    case 'bottom':
      coord = { x: node.x + width / 2, y: node.y + height };
      break;
    case 'right':
      coord = { x: node.x + width, y: node.y + height / 2 };
      break;
    case 'left':
      coord = { x: node.x, y: node.y + height / 2 };
      break;
  }
  return { ...coord, isWordAnchor: false };
}

// Automatically choose the best connection ports based on relative positions
function getAutoHandles(
  source: CanvasNode,
  target: CanvasNode
): { sHandle: HandlePosition; tHandle: HandlePosition } {
  const sW = source.width || 400;
  const sH = getNodeHeight(source);
  const tW = target.width || 400;
  const tH = getNodeHeight(target);

  const sCenter = { x: source.x + sW / 2, y: source.y + sH / 2 };
  const tCenter = { x: target.x + tW / 2, y: target.y + tH / 2 };

  const dx = tCenter.x - sCenter.x;
  const dy = tCenter.y - sCenter.y;

  // Horizontal dominance (RTL preferred)
  if (Math.abs(dx) >= Math.abs(dy) * 0.8) {
    if (dx < 0) {
      // Target is to the left (standard Arabic forward direction)
      return { sHandle: 'left', tHandle: 'right' };
    } else {
      // Target is to the right
      return { sHandle: 'right', tHandle: 'left' };
    }
  } else {
    // Vertical dominance
    if (dy > 0) {
      // Target is below source
      return { sHandle: 'bottom', tHandle: 'top' };
    } else {
      // Target is above source
      return { sHandle: 'top', tHandle: 'bottom' };
    }
  }
}

export const EdgeRenderer: React.FC<EdgeRendererProps> = ({
  edge,
  sourceNode,
  targetNode,
  onUpdateEdge,
  onDeleteEdge,
  readOnly = false
}) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState(edge.label || '');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const isSameNode = sourceNode.id === targetNode.id;
  const hasWordLevelAnchor = edge.sourceWordIndex !== undefined || edge.targetWordIndex !== undefined;

  // Compute Handles
  const autoHandles = getAutoHandles(sourceNode, targetNode);
  const sHandle = edge.sourceHandle || autoHandles.sHandle;
  const tHandle = edge.targetHandle || autoHandles.tHandle;

  // For intra-ayah arcs between words in the same ayah, prefer top direction
  const sVerticalPref = isSameNode ? 'top' : undefined;
  const tVerticalPref = isSameNode ? 'top' : undefined;

  const sCoord = getPreciseNodeAnchor(sourceNode, sHandle, edge.sourceWordIndex, sVerticalPref);
  const tCoord = getPreciseNodeAnchor(targetNode, tHandle, edge.targetWordIndex, tVerticalPref);

  const sX = sCoord.x;
  const sY = sCoord.y;
  const tX = tCoord.x;
  const tY = tCoord.y;

  const dx = tX - sX;
  const dy = tY - sY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Compute Path based on curveType or intra-ayah arc
  const curveType = edge.curveType || (isSameNode ? 'arc' : 'bezier');
  let pathData = '';
  let midX = (sX + tX) / 2;
  let midY = (sY + tY) / 2;

  if (isSameNode) {
    // Elegant rhetorical arch above the words in the SAME ayah!
    const arcHeight = Math.min(Math.max(Math.abs(dx) * 0.45, 28), 85);
    const apexY = Math.min(sY, tY) - arcHeight;
    pathData = `M ${sX} ${sY} C ${sX} ${apexY}, ${tX} ${apexY}, ${tX} ${tY}`;
    midX = (sX + tX) / 2;
    midY = apexY + 12;
  } else if (curveType === 'straight') {
    pathData = `M ${sX} ${sY} L ${tX} ${tY}`;
    midX = (sX + tX) / 2;
    midY = (sY + tY) / 2;
  } else if (curveType === 'orthogonal') {
    // Stepped right angles
    const midStepX = sX + dx * 0.5;
    pathData = `M ${sX} ${sY} L ${midStepX} ${sY} L ${midStepX} ${tY} L ${tX} ${tY}`;
    midX = midStepX;
    midY = (sY + tY) / 2;
  } else {
    // Smooth Bezier
    let cx1 = sX;
    let cy1 = sY;
    let cx2 = tX;
    let cy2 = tY;

    const curvatureOffset = Math.min(Math.max(distance * 0.35, 40), 160);

    if (sCoord.isWordAnchor) {
      // Direct word anchor leaves vertically or diagonally
      if (tY < sY) cy1 -= curvatureOffset * 0.7;
      else cy1 += curvatureOffset * 0.7;
    } else {
      if (sHandle === 'left') cx1 -= curvatureOffset;
      else if (sHandle === 'right') cx1 += curvatureOffset;
      else if (sHandle === 'top') cy1 -= curvatureOffset;
      else if (sHandle === 'bottom') cy1 += curvatureOffset;
    }

    if (tCoord.isWordAnchor) {
      // Direct word target anchor arrives smoothly
      if (sY < tY) cy2 -= curvatureOffset * 0.7;
      else cy2 += curvatureOffset * 0.7;
    } else {
      if (tHandle === 'left') cx2 -= curvatureOffset;
      else if (tHandle === 'right') cx2 += curvatureOffset;
      else if (tHandle === 'top') cy2 -= curvatureOffset;
      else if (tHandle === 'bottom') cy2 += curvatureOffset;
    }

    pathData = `M ${sX} ${sY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tX} ${tY}`;

    // Midpoint on Bezier at t=0.5
    midX = 0.125 * sX + 0.375 * cx1 + 0.375 * cx2 + 0.125 * tX;
    midY = 0.125 * sY + 0.375 * cy1 + 0.375 * cy2 + 0.125 * tY;
  }

  const handleSaveLabel = () => {
    onUpdateEdge(edge.id, { label: labelInput.trim() || undefined });
    setIsEditingLabel(false);
  };

  const handleSelectPreset = (preset: { kind: RelationshipKind; label: string; color: string; category: string }) => {
    onUpdateEdge(edge.id, {
      relationshipKind: preset.kind,
      label: preset.label,
      color: preset.color
    });
    setLabelInput(preset.label);
    setShowSettingsMenu(false);
  };

  const arrowMarkerId = `arrow-${edge.id}`;
  const lineColor = edge.color || '#10b981';

  const sourceNodeTitle =
    sourceNode.type === 'ayah' && sourceNode.ayahData
      ? `سورة ${sourceNode.ayahData.surahName} [${sourceNode.ayahData.ayahNumberInSurah}]`
      : sourceNode.conceptData?.title || sourceNode.noteData?.title || 'عنصر تدبري';

  const targetNodeTitle =
    targetNode.type === 'ayah' && targetNode.ayahData
      ? `سورة ${targetNode.ayahData.surahName} [${targetNode.ayahData.ayahNumberInSurah}]`
      : targetNode.conceptData?.title || targetNode.noteData?.title || 'عنصر تدبري';

  const sourceAnchorRef = edge.sourceAnchor
    ? formatAnchorReference(edge.sourceAnchor)
    : edge.sourceWordText
    ? `«${edge.sourceWordText}»`
    : sourceNodeTitle;

  const targetAnchorRef = edge.targetAnchor
    ? formatAnchorReference(edge.targetAnchor)
    : edge.targetWordText
    ? `«${edge.targetWordText}»`
    : targetNodeTitle;

  return (
    <g className="group/edge">
      <defs>
        <marker
          id={arrowMarkerId}
          viewBox="0 0 12 12"
          refX="9"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path
            d="M 1 2 L 10 6 L 1 10 z"
            fill={lineColor}
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {/* High-contrast underlay halo ensuring visibility over any card frame and background */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255, 255, 255, 0.95)"
        strokeWidth={5}
        strokeLinecap="round"
        className="pointer-events-none drop-shadow-sm"
      />

      {/* Invisible wider hit-box path for easy click and hover */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        className="cursor-pointer pointer-events-stroke"
        onClick={() => !readOnly && setShowSettingsMenu(!showSettingsMenu)}
      />

      {/* Visible colored line */}
      <path
        d={pathData}
        fill="none"
        stroke={lineColor}
        strokeWidth={2.5}
        strokeDasharray={
          edge.style === 'dashed'
            ? '7 5'
            : edge.style === 'dotted'
            ? '3 4'
            : undefined
        }
        markerEnd={edge.arrowType !== 'none' ? `url(#${arrowMarkerId})` : undefined}
        markerStart={edge.arrowType === 'both' ? `url(#${arrowMarkerId})` : undefined}
        className="transition-all group-hover/edge:stroke-[3.5px] pointer-events-none"
      />

      {/* Optional Animated Pulse Dash */}
      {edge.animated && (
        <path
          d={pathData}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2}
          strokeDasharray="6 24"
          className="pointer-events-none animate-[dash_2s_linear_infinite]"
        />
      )}

      {/* Source Anchor Pin (نقطة الانطلاق / من) */}
      <g className="pointer-events-none">
        <circle cx={sX} cy={sY} r={8} fill={lineColor} fillOpacity={0.25} className="animate-pulse" />
        <circle cx={sX} cy={sY} r={4.5} fill="#ffffff" stroke={lineColor} strokeWidth={2} />
        <circle cx={sX} cy={sY} r={2} fill={lineColor} />
      </g>

      {/* Target Anchor Pin (نقطة الوصول / إلى) */}
      <g className="pointer-events-none">
        {tCoord.isWordAnchor ? (
          <>
            <circle cx={tX} cy={tY} r={9} fill={lineColor} fillOpacity={0.25} />
            <circle cx={tX} cy={tY} r={4} fill={lineColor} stroke="#ffffff" strokeWidth={1.5} />
          </>
        ) : (
          <circle cx={tX} cy={tY} r={4} fill={lineColor} stroke="#ffffff" strokeWidth={1.5} />
        )}
      </g>

      {/* Center Label and Action Badge */}
      <foreignObject
        x={midX - 140}
        y={midY - 26}
        width={280}
        height={85}
        className="overflow-visible pointer-events-auto"
      >
        <div className="flex flex-col items-center justify-center h-full relative" dir="rtl">
          {isEditingLabel && !readOnly ? (
            <div
              className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl shadow-xl border border-stone-300 z-50 animate-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel()}
                placeholder="نوع العلاقة التدبرية..."
                autoFocus
                className="text-xs p-1.5 border border-stone-200 rounded-xl outline-none w-36 text-stone-900 font-cairo"
              />
              <button
                onClick={handleSaveLabel}
                className="p-1.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800"
                title="حفظ"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!readOnly) setShowSettingsMenu(!showSettingsMenu);
                }}
                className="bg-white/98 backdrop-blur-md text-stone-900 text-xs font-bold px-3 py-1.5 rounded-2xl shadow-lg border border-stone-300/90 cursor-pointer hover:border-emerald-500 hover:shadow-xl transition-all font-cairo whitespace-nowrap flex flex-col items-center gap-0.5"
                style={{ borderRightColor: lineColor, borderRightWidth: '4px' }}
                title="انقر لتعديل الرابط أو تغيير نوعه"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span className="text-stone-900 font-bold">{edge.label || 'رابط تدبري'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-600 font-medium max-w-[260px] truncate dir-rtl">
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/70 truncate max-w-[115px]">
                    من: {sourceAnchorRef}
                  </span>
                  <span className="text-stone-400 font-bold">➔</span>
                  <span className="text-rose-800 font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-200/70 truncate max-w-[115px]">
                    إلى: {targetAnchorRef}
                  </span>
                </div>
              </button>

              {/* Quick Delete button on hover */}
              {!readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEdge(edge.id);
                  }}
                  className="opacity-0 group-hover/edge:opacity-100 p-1.5 bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-full border border-stone-200 shadow-md transition-all"
                  title="حذف هذا الرابط"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Relationship Settings Menu Popover */}
          {showSettingsMenu && !readOnly && (
            <div
              className="absolute top-full mt-2 bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl shadow-2xl p-3 w-64 z-50 text-right space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 font-cairo">
                  خصائص الرابط التدبري
                </span>
                <button
                  onClick={() => setShowSettingsMenu(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs px-1"
                >
                  ✕
                </button>
              </div>

              {/* Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  علاقات تدبرية مقترحة:
                </span>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5">
                  {RELATIONSHIP_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleSelectPreset(p)}
                      className="w-full text-right text-xs py-1 px-2 rounded-lg hover:bg-stone-100 transition-colors flex items-center justify-between font-tajawal"
                    >
                      <span className="truncate">{p.label}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Label input toggle */}
              <div className="pt-1 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsEditingLabel(true);
                    setShowSettingsMenu(false);
                  }}
                  className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  كتابة تسمية مخصصة
                </button>
              </div>

              {/* Line Style & Curves */}
              <div className="pt-1.5 border-t border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>شكل السلك:</span>
                  <div className="flex gap-1">
                    {(['bezier', 'orthogonal', 'straight'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => onUpdateEdge(edge.id, { curveType: type })}
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          curveType === type
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {type === 'bezier' ? 'منحنٍ' : type === 'orthogonal' ? 'قائم' : 'مستقيم'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>نوع الخط:</span>
                  <div className="flex gap-1">
                    {(['solid', 'dashed', 'dotted'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateEdge(edge.id, { style: st })}
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          edge.style === st
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {st === 'solid' ? 'متصل' : st === 'dashed' ? 'متقطع' : 'منقط'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animated Pulse Toggle */}
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-600" />
                    نبض التدفق:
                  </span>
                  <button
                    onClick={() => onUpdateEdge(edge.id, { animated: !edge.animated })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      edge.animated ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {edge.animated ? 'مفعّل' : 'معطّل'}
                  </button>
                </div>

                {/* Color choices */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-600">اللون:</span>
                  <div className="flex gap-1">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => onUpdateEdge(edge.id, { color: c })}
                        className="w-4 h-4 rounded-full border border-black/10 transition-transform hover:scale-125"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
};
