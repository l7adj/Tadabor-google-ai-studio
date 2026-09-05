import React, { useState } from 'react';
import { Trash2, Link, Image as ImageIcon, Edit3, Upload } from 'lucide-react';
import { CanvasNode, ImageNodeData } from '../../../types';

interface ImageNodeCardProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onUpdateImageData: (nodeId: string, data: ImageNodeData) => void;
  onStartConnecting: (nodeId: string) => void;
  onCompleteConnecting?: (targetNodeId: string) => void;
  isConnectingMode?: boolean;
  readOnly?: boolean;
}

export const ImageNodeCard: React.FC<ImageNodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdateImageData,
  onStartConnecting,
  onCompleteConnecting,
  isConnectingMode = false,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(node.imageData?.url || '');
  const [caption, setCaption] = useState(node.imageData?.caption || '');

  if (!node.imageData) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setUrl(dataUrl);
        onUpdateImageData(node.id, {
          ...node.imageData!,
          url: dataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateImageData(node.id, {
      ...node.imageData!,
      url: url.trim(),
      caption: caption.trim()
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
      className={`relative rounded-2xl border-2 transition-all shadow-sm bg-white/95 overflow-hidden select-none border-stone-300 ${
        isConnectingMode
          ? 'ring-4 ring-emerald-500/60 shadow-xl cursor-crosshair scale-[1.01]'
          : isSelected
          ? 'ring-3 ring-emerald-500/40 shadow-lg scale-[1.01]'
          : 'hover:shadow-md'
      }`}
      style={{ width: node.width || 320 }}
      dir="rtl"
    >
      {/* Visual guidance indicator when connecting */}
      {isConnectingMode && (
        <div className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-bounce z-40 font-cairo flex items-center gap-1">
          <Link className="w-3 h-3 text-amber-300" />
          <span>انقر هنا للربط بالصورة</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-stone-100/70 border-b border-stone-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
          <ImageIcon className="w-4 h-4 text-sky-600" />
          <span>صورة توضيحية / خارطة</span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="p-1 text-stone-400 hover:text-stone-700 rounded"
              title="تعديل"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartConnecting(node.id);
              }}
              className="p-1 text-stone-400 hover:text-emerald-700 rounded"
              title="ربط بسهم"
            >
              <Link className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 text-stone-400 hover:text-rose-600 rounded"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Image body */}
      <div className="p-3 space-y-2">
        {node.imageData.url ? (
          <div className="rounded-xl overflow-hidden bg-stone-100 border border-stone-200 max-h-56 flex items-center justify-center">
            <img
              src={node.imageData.url}
              alt={node.imageData.caption || 'صورة التدبر'}
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="h-40 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center p-4 text-center text-stone-400 gap-2">
            <ImageIcon className="w-8 h-8 text-stone-300" />
            <span className="text-xs">لم يتم تعيين صورة بعد</span>
          </div>
        )}

        {/* Caption */}
        {node.imageData.caption && (
          <p className="text-xs text-stone-700 font-tajawal text-center font-medium px-1">
            {node.imageData.caption}
          </p>
        )}

        {/* Edit Modal / Form */}
        {isEditing && !readOnly && (
          <div className="space-y-2 pt-2 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="رابط الصورة (URL)..."
              className="w-full text-xs p-1.5 border border-stone-300 rounded-lg outline-none text-stone-900"
            />

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer text-stone-700">
                <Upload className="w-3.5 h-3.5" />
                رفع صورة من جهازك
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="وصف أو تعليق على الصورة..."
              className="w-full text-xs p-1.5 border border-stone-300 rounded-lg outline-none text-stone-900"
            />

            <button
              onClick={handleSave}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
            >
              حفظ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
