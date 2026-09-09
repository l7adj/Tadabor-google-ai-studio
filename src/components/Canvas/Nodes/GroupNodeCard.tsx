import React, { useState } from 'react';
import { Trash2, Edit2, Check, Palette, Layers } from 'lucide-react';
import { CanvasNode, GroupNodeData } from '../../../types';

interface GroupNodeCardProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onUpdateGroupData: (nodeId: string, data: GroupNodeData) => void;
  onUpdateTheme: (nodeId: string, theme: string) => void;
  readOnly?: boolean;
}

const THEME_STYLES: Record<string, { bg: string; border: string; text: string; headerBg: string }> = {
  emerald: {
    bg: 'bg-emerald-50/40',
    border: 'border-emerald-300/80',
    text: 'text-emerald-950',
    headerBg: 'bg-emerald-100/70'
  },
  amber: {
    bg: 'bg-amber-50/40',
    border: 'border-amber-300/80',
    text: 'text-amber-950',
    headerBg: 'bg-amber-100/70'
  },
  teal: {
    bg: 'bg-teal-50/40',
    border: 'border-teal-300/80',
    text: 'text-teal-950',
    headerBg: 'bg-teal-100/70'
  },
  indigo: {
    bg: 'bg-indigo-50/40',
    border: 'border-indigo-300/80',
    text: 'text-indigo-950',
    headerBg: 'bg-indigo-100/70'
  },
  rose: {
    bg: 'bg-rose-50/40',
    border: 'border-rose-300/80',
    text: 'text-rose-950',
    headerBg: 'bg-rose-100/70'
  },
  stone: {
    bg: 'bg-stone-100/50',
    border: 'border-stone-300/80',
    text: 'text-stone-900',
    headerBg: 'bg-stone-200/70'
  }
};

export const GroupNodeCard: React.FC<GroupNodeCardProps> = React.memo(({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdateGroupData,
  onUpdateTheme,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.groupData?.title || 'قسم / محور موضوعي');
  const [description, setDescription] = useState(node.groupData?.description || '');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const themeKey = node.colorTheme || 'emerald';
  const theme = THEME_STYLES[themeKey] || THEME_STYLES.emerald;

  const width = node.width || 680;
  const height = node.height || 420;

  const handleSave = () => {
    onUpdateGroupData(node.id, {
      title: title.trim() || 'قسم موضوعي',
      description: description.trim()
    });
    setIsEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-3xl border-2 border-dashed transition-all select-none backdrop-blur-xs ${
        theme.bg
      } ${theme.border} ${
        isSelected ? 'ring-2 ring-emerald-500/50 shadow-md border-solid' : 'hover:border-solid hover:shadow-xs'
      }`}
      style={{
        width,
        minHeight: height
      }}
      dir="rtl"
    >
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between px-5 py-3 rounded-t-3xl border-b border-black/5 ${theme.headerBg}`}
      >
        <div className="flex items-center gap-2 flex-1">
          <Layers className="w-4 h-4 text-stone-600" />
          {isEditing && !readOnly ? (
            <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان المحور..."
                className="bg-white px-2.5 py-1 text-xs font-bold rounded-lg border border-stone-300 outline-none text-stone-900 flex-1 max-w-xs"
                autoFocus
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للمحور..."
                className="bg-white px-2 py-1 text-[11px] rounded-lg border border-stone-300 outline-none text-stone-700 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                className="p-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                title="حفظ"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`font-cairo font-bold text-sm sm:text-base ${theme.text}`}>
                {node.groupData?.title || 'قسم موضوعي'}
              </span>
              {node.groupData?.description && (
                <span className="text-xs text-stone-600 font-tajawal hidden sm:inline">
                  — {node.groupData.description}
                </span>
              )}
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Color switcher */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 text-stone-500 hover:text-stone-800 rounded-md hover:bg-black/5"
                title="تغيير لون الإطار"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl p-1.5 flex gap-1 z-30">
                  {Object.keys(THEME_STYLES).map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        onUpdateTheme(node.id, col);
                        setShowColorPicker(false);
                      }}
                      className={`w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110 ${
                        col === 'emerald'
                          ? 'bg-emerald-400'
                          : col === 'amber'
                          ? 'bg-amber-400'
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

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-stone-500 hover:text-stone-800 rounded-md hover:bg-black/5"
              title="تعديل العنوان"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(node.id)}
              className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
              title="حذف الإطار"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Group interior area */}
      <div className="p-4 pointer-events-none min-h-[340px] flex items-end justify-end">
        <span className="text-[10px] text-stone-400 font-medium">
          اسحب الآيات والبطاقات وضعها داخل هذا الإطار لتنظيمها
        </span>
      </div>
    </div>
  );
});
