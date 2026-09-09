import React, { useState } from 'react';
import { Trash2, Link, Sparkles, Edit3, CopyPlus, GripHorizontal } from 'lucide-react';
import { CanvasNode, ConceptNodeData, HandlePosition } from '../../../types';

interface ConceptNodeCardProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdateConceptData: (nodeId: string, data: ConceptNodeData) => void;
  onStartConnecting: (nodeId: string, wordIndex?: number, handle?: HandlePosition) => void;
  onCompleteConnecting?: (targetNodeId: string, targetHandle?: HandlePosition) => void;
  isConnectingMode?: boolean;
  readOnly?: boolean;
}

export const ConceptNodeCard: React.FC<ConceptNodeCardProps> = React.memo(({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdateConceptData,
  onStartConnecting,
  onCompleteConnecting,
  isConnectingMode = false,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.conceptData?.title || 'فكرة محورية');
  const [description, setDescription] = useState(node.conceptData?.description || '');
  const [badge, setBadge] = useState(node.conceptData?.badge || 'محور تدبّري');

  if (!node.conceptData) return null;

  const handleSave = () => {
    onUpdateConceptData(node.id, {
      ...node.conceptData,
      title: title.trim(),
      description: description.trim(),
      badge: badge.trim()
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
      className={`relative rounded-3xl border-2 transition-all duration-200 shadow-md bg-gradient-to-br from-indigo-50/95 to-purple-50/95 border-indigo-200 select-none ${
        isConnectingMode
          ? 'ring-4 ring-indigo-500/60 shadow-xl cursor-crosshair scale-[1.01]'
          : isSelected
          ? 'ring-4 ring-indigo-500/40 shadow-xl scale-[1.008]'
          : 'hover:shadow-lg'
      } group/node`}
      style={{ width: node.width || 320 }}
      dir="rtl"
    >
      {/* Visual guidance indicator when connecting */}
      {isConnectingMode && (
        <div className="absolute -top-3.5 right-6 bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-bounce z-40 font-cairo flex items-center gap-1">
          <Link className="w-3 h-3 text-amber-300" />
          <span>انقر هنا لربط المحور التدبري</span>
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
            className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من أعلى البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'bottom');
            }}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من أسفل البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'right');
            }}
            className={`absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من يمين البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'left');
            }}
            className={`absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من يسار البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          </button>
        </>
      )}

      <div className="p-4 space-y-2.5">
        {/* Top badge & tools */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <GripHorizontal className="w-3.5 h-3.5 text-indigo-400 cursor-grab active:cursor-grabbing hover:text-indigo-700" />
            <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-indigo-700" />
              {node.conceptData.badge || 'فكرة محورية'}
            </span>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                }}
                className="p-1 text-indigo-400 hover:text-indigo-800 rounded-full hover:bg-black/5"
                title="تعديل"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {onDuplicate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(node.id);
                  }}
                  className="p-1 text-indigo-400 hover:text-indigo-800 rounded-full hover:bg-black/5"
                  title="تكرار"
                >
                  <CopyPlus className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartConnecting(node.id);
                }}
                className="p-1 text-indigo-400 hover:text-indigo-800 rounded-full hover:bg-black/5"
                title="سحب سهم رابط"
              >
                <Link className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                className="p-1 text-indigo-400 hover:text-rose-600 rounded-full hover:bg-rose-50"
                title="حذف"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Title and description */}
        {isEditing && !readOnly ? (
          <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="الشارة..."
              className="w-full text-[11px] p-1.5 border border-indigo-200 rounded-lg outline-none bg-white"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="العنوان المركزي..."
              className="w-full text-xs font-bold p-1.5 border border-indigo-300 rounded-lg outline-none text-stone-900 bg-white"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح الفكرة المحورية..."
              rows={3}
              className="w-full text-xs p-1.5 border border-indigo-200 rounded-lg outline-none text-stone-900 bg-white"
            />
            <button
              onClick={handleSave}
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold py-1.5 rounded-xl shadow-xs"
            >
              حفظ
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-base font-bold text-indigo-950 font-cairo leading-snug">
              {node.conceptData.title}
            </h3>
            {node.conceptData.description && (
              <p className="text-xs text-indigo-900/80 font-tajawal mt-1 leading-relaxed">
                {node.conceptData.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
