import React, { useState } from 'react';
import { Trash2, Link, Edit3, MessageSquare, Palette, CopyPlus, GripHorizontal } from 'lucide-react';
import { CanvasNode, NoteNodeData, HandlePosition } from '../../../types';

interface NoteNodeCardProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdateNoteData: (nodeId: string, data: NoteNodeData) => void;
  onUpdateTheme?: (nodeId: string, theme: string) => void;
  onStartConnecting: (nodeId: string, wordIndex?: number, handle?: HandlePosition) => void;
  onCompleteConnecting?: (targetNodeId: string, targetHandle?: HandlePosition) => void;
  isConnectingMode?: boolean;
  readOnly?: boolean;
}

const THEME_STYLES: Record<string, { bg: string; border: string; headerBg: string; text: string }> = {
  stone: { bg: 'bg-white/95', border: 'border-stone-300', headerBg: 'bg-stone-100/80', text: 'text-stone-900' },
  amber: { bg: 'bg-amber-50/95', border: 'border-amber-300', headerBg: 'bg-amber-100/80', text: 'text-amber-950' },
  emerald: { bg: 'bg-emerald-50/95', border: 'border-emerald-300', headerBg: 'bg-emerald-100/80', text: 'text-emerald-950' },
  teal: { bg: 'bg-teal-50/95', border: 'border-teal-300', headerBg: 'bg-teal-100/80', text: 'text-teal-950' },
  indigo: { bg: 'bg-indigo-50/95', border: 'border-indigo-300', headerBg: 'bg-indigo-100/80', text: 'text-indigo-950' },
  rose: { bg: 'bg-rose-50/95', border: 'border-rose-300', headerBg: 'bg-rose-100/80', text: 'text-rose-950' }
};

export const NoteNodeCard: React.FC<NoteNodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdateNoteData,
  onUpdateTheme,
  onStartConnecting,
  onCompleteConnecting,
  isConnectingMode = false,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.noteData?.title || 'وقفة تدبرية');
  const [content, setContent] = useState(node.noteData?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!node.noteData) return null;

  const currentTheme = THEME_STYLES[node.colorTheme] || THEME_STYLES.stone;

  const handleSave = () => {
    onUpdateNoteData(node.id, {
      ...node.noteData,
      title: title.trim(),
      content: content.trim()
    });
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTags = [...(node.noteData?.tags || []), tagInput.trim()];
      onUpdateNoteData(node.id, {
        ...node.noteData,
        tags: Array.from(new Set(newTags))
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = (node.noteData?.tags || []).filter((t) => t !== tagToRemove);
    onUpdateNoteData(node.id, {
      ...node.noteData,
      tags: updated
    });
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
      style={{ width: node.width || 340 }}
      dir="rtl"
    >
      {/* Visual guidance indicator when connecting */}
      {isConnectingMode && (
        <div className="absolute -top-3.5 right-6 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-bounce z-40 font-cairo flex items-center gap-1">
          <Link className="w-3 h-3 text-amber-300" />
          <span>انقر هنا لربط الوقفة التدبرية</span>
        </div>
      )}
      {/* Magnetic Connection Ports - Touch & Mobile Friendly */}
      {!readOnly && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'top');
            }}
            className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من أعلى البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'bottom');
            }}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من أسفل البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'right');
            }}
            className={`absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من يمين البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'left');
            }}
            className={`absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من يسار البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>
        </>
      )}

      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-t-3xl border-b border-black/5 ${currentTheme.headerBg}`}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-stone-400 cursor-grab active:cursor-grabbing hover:text-stone-700" />
          <MessageSquare className="w-4 h-4 text-emerald-700" />
          <span className="font-cairo font-bold text-sm text-stone-900 truncate max-w-[170px]">
            {node.noteData.title}
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1">
            {/* Theme switcher */}
            {onUpdateTheme && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700 hover:bg-black/5 rounded-full transition-colors"
                  title="تغيير اللون"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>

                {showColorPicker && (
                  <div
                    className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl p-1.5 flex gap-1 z-40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.keys(THEME_STYLES).map((col) => (
                      <button
                        key={col}
                        onClick={() => {
                          onUpdateTheme(node.id, col);
                          setShowColorPicker(false);
                        }}
                        className={`w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110 ${
                          col === 'amber'
                            ? 'bg-amber-400'
                            : col === 'emerald'
                            ? 'bg-emerald-400'
                            : col === 'teal'
                            ? 'bg-teal-400'
                            : col === 'indigo'
                            ? 'bg-indigo-400'
                            : col === 'rose'
                            ? 'bg-rose-400'
                            : 'bg-stone-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-black/5 rounded-full transition-colors"
              title="تعديل الملاحظة"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(node.id);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-black/5 rounded-full transition-colors"
                title="تكرار البطاقة"
              >
                <CopyPlus className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartConnecting(node.id);
              }}
              className="p-1 text-stone-400 hover:text-emerald-700 hover:bg-black/5 rounded-full transition-colors"
              title="ربط بسهم"
            >
              <Link className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-black/5 rounded-full transition-colors"
              title="حذف الملاحظة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isEditing && !readOnly ? (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الملاحظة..."
              className="w-full text-xs font-bold p-1.5 border border-stone-300 rounded-lg outline-none focus:border-emerald-600 text-stone-900"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تأملاتك وأفكارك حول الآيات..."
              rows={4}
              className="w-full text-xs p-2 border border-stone-300 rounded-lg outline-none focus:border-emerald-600 font-tajawal leading-relaxed text-stone-900"
            />
            <button
              onClick={handleSave}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-1.5 rounded-xl shadow-xs transition-colors"
            >
              حفظ التعديلات
            </button>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-stone-800 font-tajawal leading-relaxed whitespace-pre-wrap">
            {node.noteData.content || 'انقر لتسجيل خاطرة أو وقفة تدبرية...'}
          </p>
        )}

        {/* Reference link if attached */}
        {node.noteData.referenceText && (
          <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60 flex items-center gap-1">
            <span>مرجع مرتبط:</span>
            <span className="font-semibold">{node.noteData.referenceText}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-black/5">
          {node.noteData.tags?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-black/5 text-stone-700 px-2 py-0.5 rounded-md flex items-center gap-1 group/tag"
            >
              #{tag}
              {!readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                  className="text-stone-400 hover:text-rose-600 ml-0.5"
                >
                  ×
                </button>
              )}
            </span>
          ))}

          {!readOnly && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="+ وسم"
                className="text-[10px] w-14 px-1 py-0.5 border border-stone-200 rounded outline-none focus:border-emerald-500 bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
