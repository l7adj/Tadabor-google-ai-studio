import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeftRight,
  Minus,
  Sparkles,
  Link,
  Tag,
  Check,
  Split,
  MessageSquare
} from 'lucide-react';
import { CanvasEdge, QuranAnchor, RelationshipKind } from '../../types';
import { RELATIONSHIP_LIST, formatQuranAnchorLabel } from '../../lib/quranAnchors';

export interface PendingConnectionData {
  sourceId: string;
  targetId: string;
  sourceAnchor?: QuranAnchor;
  targetAnchor?: QuranAnchor;
  sourceWordIndex?: number;
  targetWordIndex?: number;
  sourceWordText?: string;
  targetWordText?: string;
  sourceNodeTitle?: string;
  targetNodeTitle?: string;
  sourceHandle?: 'top' | 'right' | 'bottom' | 'left';
  targetHandle?: 'top' | 'right' | 'bottom' | 'left';
  isSameNode?: boolean;
}

interface RelationConfigModalProps {
  pendingConnection: PendingConnectionData;
  onConfirm: (edgeConfig: Partial<CanvasEdge>) => void;
  onCancel: () => void;
}

export const RelationConfigModal: React.FC<RelationConfigModalProps> = ({
  pendingConnection,
  onConfirm,
  onCancel
}) => {
  // Default relationship kind:
  // If words are adjacent or same node: pairing or parallel
  const initialKind: RelationshipKind = pendingConnection.isSameNode
    ? 'pairing'
    : pendingConnection.sourceWordText && pendingConnection.targetWordText
    ? 'similarity'
    : 'theme';

  const [selectedKind, setSelectedKind] = useState<RelationshipKind>(initialKind);
  const [customLabel, setCustomLabel] = useState('');
  const [arrowType, setArrowType] = useState<'end' | 'both' | 'none'>(
    RELATIONSHIP_LIST.find((r) => r.kind === initialKind)?.defaultArrow || 'end'
  );
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>(
    RELATIONSHIP_LIST.find((r) => r.kind === initialKind)?.defaultStyle || 'solid'
  );
  const [selectedColor, setSelectedColor] = useState(
    RELATIONSHIP_LIST.find((r) => r.kind === initialKind)?.color || '#e11d48'
  );

  const handleSelectPreset = (kind: RelationshipKind) => {
    setSelectedKind(kind);
    const def = RELATIONSHIP_LIST.find((r) => r.kind === kind);
    if (def) {
      setSelectedColor(def.color);
      setArrowType(def.defaultArrow);
      setLineStyle(def.defaultStyle);
      if (kind !== 'custom') {
        setCustomLabel('');
      }
    }
  };

  const handleCreate = () => {
    const def = RELATIONSHIP_LIST.find((r) => r.kind === selectedKind);
    const finalLabel =
      selectedKind === 'custom'
        ? customLabel.trim() || 'علاقة مخصصة'
        : def?.shortLabel || 'رابط تدبري';

    onConfirm({
      relationshipKind: selectedKind,
      customRelationship: selectedKind === 'custom' ? customLabel.trim() : undefined,
      label: finalLabel,
      color: selectedColor,
      arrowType,
      style: lineStyle,
      sourceAnchor: pendingConnection.sourceAnchor,
      targetAnchor: pendingConnection.targetAnchor,
      sourceWordIndex: pendingConnection.sourceWordIndex,
      targetWordIndex: pendingConnection.targetWordIndex,
      sourceWordText: pendingConnection.sourceWordText,
      targetWordText: pendingConnection.targetWordText,
      sourceHandle: pendingConnection.sourceHandle,
      targetHandle: pendingConnection.targetHandle
    });
  };

  const sourceLabel =
    formatQuranAnchorLabel(pendingConnection.sourceAnchor) ||
    (pendingConnection.sourceWordText ? `كلمة «${pendingConnection.sourceWordText}»` : '') ||
    pendingConnection.sourceNodeTitle ||
    'العنصر الأول';

  const targetLabel =
    formatQuranAnchorLabel(pendingConnection.targetAnchor) ||
    (pendingConnection.targetWordText ? `كلمة «${pendingConnection.targetWordText}»` : '') ||
    pendingConnection.targetNodeTitle ||
    'العنصر الثاني';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      dir="rtl"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
              <Link className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-cairo">
                تحديد نوع العلاقة القرآنية
              </h2>
              <p className="text-xs text-stone-500 font-tajawal">
                {pendingConnection.isSameNode
                  ? 'رابط بلاغي بين موضعين في نفس الآية الكريمة'
                  : 'ربط تدبري دلالي بين نقطتي ارتكاز في الخريطة'}
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anchors Visual Preview Card */}
        <div className="px-6 py-3.5 bg-amber-50/40 border-b border-amber-200/60 flex items-center justify-between gap-3 text-xs font-tajawal">
          <div className="flex-1 min-w-0 bg-white/90 p-2.5 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="block text-[10px] text-stone-400 font-bold mb-0.5">المصدر الأول:</span>
            <span className="font-bold text-stone-800 truncate block font-cairo" title={sourceLabel}>
              {sourceLabel}
            </span>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center text-amber-700 px-1">
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span className="text-[10px] font-mono mt-0.5">رابط</span>
          </div>

          <div className="flex-1 min-w-0 bg-white/90 p-2.5 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="block text-[10px] text-stone-400 font-bold mb-0.5">الهدف الثاني:</span>
            <span className="font-bold text-stone-800 truncate block font-cairo" title={targetLabel}>
              {targetLabel}
            </span>
          </div>
        </div>

        {/* Body: Semantic Presets */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          <div>
            <label className="text-xs font-bold text-stone-700 font-cairo mb-2 flex items-center justify-between">
              <span>اختر نوع العلاقة الذكية:</span>
              <span className="text-[11px] font-normal text-stone-400 font-tajawal">
                15 نوعاً معتمداً في تدبر القرآن
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RELATIONSHIP_LIST.map((preset) => {
                const isSelected = selectedKind === preset.kind;
                return (
                  <button
                    key={preset.kind}
                    type="button"
                    onClick={() => handleSelectPreset(preset.kind)}
                    className={`p-2.5 rounded-xl text-right border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500/40'
                        : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: preset.color }}
                      />
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </div>
                    <span className="text-xs font-bold text-stone-900 font-cairo leading-snug">
                      {preset.shortLabel}
                    </span>
                    <span className="text-[10px] text-stone-500 font-tajawal line-clamp-1 mt-0.5">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom label input if custom is chosen or quick override */}
          {selectedKind === 'custom' && (
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-stone-700 font-cairo flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>نص العلاقة المخصصة:</span>
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder='مثلاً: "تذكّرني بـ..." أو "رد على استشكال" أو "موطن اقتداء"'
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-stone-300 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none font-cairo"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
            </div>
          )}

          {/* Controls: Arrow Direction & Line Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Arrow Type */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-700 font-cairo block">
                اتجاه السهم:
              </span>
              <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setArrowType('end')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 font-cairo ${
                    arrowType === 'end'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>من ← إلى</span>
                </button>
                <button
                  type="button"
                  onClick={() => setArrowType('both')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 font-cairo ${
                    arrowType === 'both'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>اتجاهين</span>
                </button>
                <button
                  type="button"
                  onClick={() => setArrowType('none')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 font-cairo ${
                    arrowType === 'none'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>بدون أسهم</span>
                </button>
              </div>
            </div>

            {/* Line Style */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-700 font-cairo block">
                شكل الخط:
              </span>
              <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setLineStyle('solid')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center font-cairo ${
                    lineStyle === 'solid'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  متصل ──
                </button>
                <button
                  type="button"
                  onClick={() => setLineStyle('dashed')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center font-cairo ${
                    lineStyle === 'dashed'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  متقطع ╌╌
                </button>
                <button
                  type="button"
                  onClick={() => setLineStyle('dotted')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center font-cairo ${
                    lineStyle === 'dotted'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  منقط •••
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/90">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors font-cairo"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs hover:scale-[1.02] transition-all font-cairo cursor-pointer"
          >
            <Check className="w-4 h-4 text-amber-300" />
            <span>إنشاء الرابط التدبري</span>
          </button>
        </div>
      </div>
    </div>
  );
};
