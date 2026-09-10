import React, { useState, useEffect } from 'react';
import { Trash2, Link, Edit3, Sparkles, Palette, CopyPlus, BookOpen, HelpCircle, Lightbulb, Check } from 'lucide-react';
import { CanvasNode, ReflectionNodeData, HandlePosition } from '../../../types';
import { cleanSurahName } from '../../../lib/arabicUtils';

interface ReflectionNodeCardProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdateReflectionData: (nodeId: string, data: ReflectionNodeData) => void;
  onUpdateTheme?: (nodeId: string, theme: string) => void;
  onStartConnecting: (nodeId: string, wordIndex?: number, handle?: HandlePosition) => void;
  onCompleteConnecting?: (targetNodeId: string, targetHandle?: HandlePosition) => void;
  isConnectingMode?: boolean;
  readOnly?: boolean;
}

const THEME_STYLES: Record<string, { bg: string; border: string; headerBg: string; text: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-50/95', border: 'border-emerald-300', headerBg: 'bg-emerald-100/80', text: 'text-emerald-950', badge: 'bg-emerald-200/80 text-emerald-900' },
  amber: { bg: 'bg-amber-50/95', border: 'border-amber-300', headerBg: 'bg-amber-100/80', text: 'text-amber-950', badge: 'bg-amber-200/80 text-amber-900' },
  teal: { bg: 'bg-teal-50/95', border: 'border-teal-300', headerBg: 'bg-teal-100/80', text: 'text-teal-950', badge: 'bg-teal-200/80 text-teal-900' },
  indigo: { bg: 'bg-indigo-50/95', border: 'border-indigo-300', headerBg: 'bg-indigo-100/80', text: 'text-indigo-950', badge: 'bg-indigo-200/80 text-indigo-900' },
  rose: { bg: 'bg-rose-50/95', border: 'border-rose-300', headerBg: 'bg-rose-100/80', text: 'text-rose-950', badge: 'bg-rose-200/80 text-rose-900' },
  stone: { bg: 'bg-stone-50/95', border: 'border-stone-300', headerBg: 'bg-stone-200/80', text: 'text-stone-900', badge: 'bg-stone-200 text-stone-800' }
};

export const ReflectionNodeCard: React.FC<ReflectionNodeCardProps> = React.memo(({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdateReflectionData,
  onUpdateTheme,
  onStartConnecting,
  onCompleteConnecting,
  isConnectingMode = false,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const data = node.reflectionData;
  const [observation, setObservation] = useState(data?.observation || '');
  const [question, setQuestion] = useState(data?.question || '');
  const [insight, setInsight] = useState(data?.insight || '');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (!isEditing && data) {
      setObservation(data.observation || '');
      setQuestion(data.question || '');
      setInsight(data.insight || '');
    }
  }, [data?.observation, data?.question, data?.insight, isEditing]);

  if (!data) return null;

  const currentTheme = THEME_STYLES[node.colorTheme] || THEME_STYLES.emerald;

  const handleSave = () => {
    onUpdateReflectionData(node.id, {
      ...data,
      observation: observation.trim(),
      question: question.trim(),
      insight: insight.trim()
    });
    setIsEditing(false);
  };

  return (
    <div
      onClick={(e) => {
        if (isConnectingMode && onCompleteConnecting) {
          e.stopPropagation();
          onCompleteConnecting(node.id);
          return;
        }
        onSelect();
      }}
      className={`relative rounded-3xl border-2 transition-all duration-200 select-none ${
        currentTheme.bg
      } ${currentTheme.border} ${
        isConnectingMode
          ? 'ring-4 ring-emerald-500/60 shadow-xl cursor-crosshair scale-[1.01]'
          : isSelected
          ? 'ring-4 ring-emerald-500/40 shadow-xl scale-[1.008]'
          : 'hover:shadow-lg shadow-sm'
      } group/node`}
      style={{ width: node.width || 360 }}
      dir="rtl"
    >
      {/* Visual Handles for Relations */}
      {!readOnly && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'top');
            }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center opacity-0 group-hover/node:opacity-100 hover:scale-125 transition-all shadow-md z-30 cursor-pointer"
            title="إنشاء رابط من الأعلى"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'bottom');
            }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center opacity-0 group-hover/node:opacity-100 hover:scale-125 transition-all shadow-md z-30 cursor-pointer"
            title="إنشاء رابط من الأسفل"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'right');
            }}
            className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center opacity-0 group-hover/node:opacity-100 hover:scale-125 transition-all shadow-md z-30 cursor-pointer"
            title="إنشاء رابط من اليمين"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'left');
            }}
            className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center opacity-0 group-hover/node:opacity-100 hover:scale-125 transition-all shadow-md z-30 cursor-pointer"
            title="إنشاء رابط من اليسار"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>
        </>
      )}

      {/* Header Bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-t-3xl border-b ${currentTheme.headerBg} ${currentTheme.border}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 font-cairo">
              {data.title || 'وقفة تدبرية'}
            </h4>
            {data.anchor && (
              <span className="text-[10px] text-stone-600 font-cairo flex items-center gap-1">
                <BookOpen className="w-2.5 h-2.5 text-emerald-700" />
                <span>
                  سورة {cleanSurahName(data.surahName || String(data.anchor.surah))} • الآية {data.ayahNumberInSurah || data.anchor.ayah}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!readOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-white/60 rounded-md transition-colors"
              title={isEditing ? 'إغلاق التعديل' : 'تعديل الوقفة'}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-white/60 rounded-md transition-colors"
              title="تغيير اللون"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(node.id);
                }}
                className="p-1 text-stone-500 hover:text-stone-900 hover:bg-white/60 rounded-md transition-colors"
                title="تكرار البطاقة"
              >
                <CopyPlus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="حذف الوقفة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Palette Dropdown */}
      {showColorPicker && onUpdateTheme && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-2 bg-white/95 border-b border-stone-200 flex items-center justify-around gap-1.5 animate-in fade-in duration-150"
        >
          {Object.keys(THEME_STYLES).map((thKey) => (
            <button
              key={thKey}
              onClick={() => {
                onUpdateTheme(node.id, thKey);
                setShowColorPicker(false);
              }}
              className={`w-5 h-5 rounded-full border border-stone-300 transition-transform ${
                node.colorTheme === thKey ? 'ring-2 ring-emerald-600 scale-110' : 'hover:scale-105'
              }`}
              style={{
                backgroundColor:
                  thKey === 'emerald'
                    ? '#10b981'
                    : thKey === 'amber'
                    ? '#f59e0b'
                    : thKey === 'teal'
                    ? '#14b8a6'
                    : thKey === 'indigo'
                    ? '#6366f1'
                    : thKey === 'rose'
                    ? '#f43f5e'
                    : '#78716c'
              }}
            />
          ))}
        </div>
      )}

      {/* Quoted Quranic Text */}
      {data.selectedText && (
        <div className="px-4 pt-3 pb-1">
          <div className="bg-white/80 border border-emerald-200/90 rounded-xl px-3 py-2 text-stone-900 font-quran text-sm leading-relaxed text-center shadow-2xs">
            ﴿{data.selectedText}﴾
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 space-y-3 font-tajawal">
        {isEditing ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 font-cairo">
                ماذا لاحظت في الموضع القرآني؟
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={2}
                placeholder="تأمل اللفظ، السياق، أو المعنى..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed font-tajawal"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 font-cairo flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-amber-600" />
                ما السؤال أو التساؤل الذي أثارته الآية؟
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="سؤال أثارته الآية يدفع للبحث..."
                className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-tajawal"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 font-cairo flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-emerald-600" />
                الهداية أو الفائدة التدبرية:
              </label>
              <textarea
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                rows={2}
                placeholder="أثر هذه الآية في القلب والعمل..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed font-tajawal"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg transition-colors font-cairo"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors font-cairo"
              >
                <Check className="w-3.5 h-3.5" />
                حفظ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.observation && (
              <div>
                <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-tajawal">
                  {data.observation}
                </p>
              </div>
            )}

            {data.question && (
              <div className="bg-amber-100/60 border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs text-amber-950 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span className="font-tajawal font-medium leading-relaxed">{data.question}</span>
              </div>
            )}

            {data.insight && (
              <div className="bg-emerald-100/60 border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-emerald-950 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span className="font-tajawal font-medium leading-relaxed">{data.insight}</span>
              </div>
            )}

            {!data.observation && !data.question && !data.insight && (
              <p className="text-xs text-stone-400 italic">
                وقفة تدبرية بدون محتوى بعد. انقر على أيقونة التعديل لكتابة ملاحظاتك وتأملاتك.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ReflectionNodeCard.displayName = 'ReflectionNodeCard';
