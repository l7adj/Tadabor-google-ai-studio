import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Link,
  Copy,
  Check,
  MessageSquare,
  BookOpen,
  Palette,
  GripHorizontal,
  CopyPlus,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { CanvasNode, WordAnnotation, HandlePosition, QuranAnchor } from '../../../types';
import { extractAyahWords, cleanSurahName, extractWordLetters } from '../../../lib/arabicUtils';
import {
  createAyahAnchor,
  createWordAnchor,
  createWordRangeAnchor,
  createCharAnchor
} from '../../../lib/quranAnchors';
import {
  useQuranSelection,
  createWordSelection,
  createCharSelection,
  createAyahSelection
} from '../../../engine';
import { WordAnnotationPopover } from './WordAnnotationPopover';

interface AyahNodeCardProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdateAnnotations: (nodeId: string, annotations: WordAnnotation[]) => void;
  onUpdateTafsir?: (nodeId: string, tafsir: string) => void;
  onUpdateTheme?: (nodeId: string, theme: string) => void;
  onUpdateDimensions?: (nodeId: string, width: number, height?: number, fontSize?: number) => void;
  onStartConnecting: (
    nodeId: string,
    wordIndex?: number,
    handle?: HandlePosition,
    wordText?: string,
    anchor?: QuranAnchor
  ) => void;
  onCompleteConnecting?: (
    targetNodeId: string,
    targetHandle?: HandlePosition,
    targetWordIndex?: number,
    targetWordText?: string,
    targetAnchor?: QuranAnchor
  ) => void;
  isConnectingMode?: boolean;
  readOnly?: boolean;
  zoom?: number;
}

const THEME_STYLES: Record<string, {
  cardBg: string;
  border: string;
  badge: string;
  headerBg: string;
  accent: string;
  glow: string;
}> = {
  amber: {
    cardBg: 'bg-amber-50/95',
    border: 'border-amber-300',
    badge: 'bg-amber-200/90 text-amber-900 border border-amber-300',
    headerBg: 'bg-amber-100/60',
    accent: 'text-amber-700',
    glow: 'ring-amber-400/40'
  },
  emerald: {
    cardBg: 'bg-emerald-50/95',
    border: 'border-emerald-300',
    badge: 'bg-emerald-200/90 text-emerald-900 border border-emerald-300',
    headerBg: 'bg-emerald-100/60',
    accent: 'text-emerald-700',
    glow: 'ring-emerald-400/40'
  },
  teal: {
    cardBg: 'bg-teal-50/95',
    border: 'border-teal-300',
    badge: 'bg-teal-200/90 text-teal-900 border border-teal-300',
    headerBg: 'bg-teal-100/60',
    accent: 'text-teal-700',
    glow: 'ring-teal-400/40'
  },
  indigo: {
    cardBg: 'bg-indigo-50/95',
    border: 'border-indigo-300',
    badge: 'bg-indigo-200/90 text-indigo-900 border border-indigo-300',
    headerBg: 'bg-indigo-100/60',
    accent: 'text-indigo-700',
    glow: 'ring-indigo-400/40'
  },
  rose: {
    cardBg: 'bg-rose-50/95',
    border: 'border-rose-300',
    badge: 'bg-rose-200/90 text-rose-900 border border-rose-300',
    headerBg: 'bg-rose-100/60',
    accent: 'text-rose-700',
    glow: 'ring-rose-400/40'
  },
  stone: {
    cardBg: 'bg-stone-50/95',
    border: 'border-stone-300',
    badge: 'bg-stone-200/90 text-stone-900 border border-stone-300',
    headerBg: 'bg-stone-200/60',
    accent: 'text-stone-700',
    glow: 'ring-stone-400/40'
  }
};

export const AyahNodeCard: React.FC<AyahNodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdateAnnotations,
  onUpdateTafsir,
  onUpdateTheme,
  onUpdateDimensions,
  onStartConnecting,
  onCompleteConnecting,
  isConnectingMode = false,
  readOnly = false,
  zoom = 1
}) => {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirText, setTafsirText] = useState(node.ayahData?.tafsir || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [liveWidth, setLiveWidth] = useState<number>(node.width || 420);

  // Central Quran Selection Engine Integration
  const {
    activeSelection,
    multiSelections,
    selectWord,
    selectLetter,
    toggleMultiSelection
  } = useQuranSelection();

  useEffect(() => {
    setLiveWidth(node.width || 420);
  }, [node.width]);

  if (!node.ayahData) return null;

  const {
    surahNumber,
    surahName,
    ayahNumberInSurah,
    overallAyahNumber,
    page,
    juz,
    revelationType,
    textUthmani,
    textSimple,
    annotations = []
  } = node.ayahData;

  const words = extractAyahWords(textUthmani, textSimple);
  const currentThemeKey = node.colorTheme || 'amber';
  const theme = THEME_STYLES[currentThemeKey] || THEME_STYLES.amber;

  // Interactive Drag Resizing
  const handleStartResize = (e: React.PointerEvent, direction: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    if (readOnly || !onUpdateDimensions) return;

    setIsResizing(direction);
    const startX = e.clientX;
    const startWidth = node.width || 420;
    const effectiveZoom = zoom || 1;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / effectiveZoom;
      // In Arabic RTL, left handle drag towards left increases width
      let newWidth: number;
      if (direction === 'left') {
        newWidth = Math.round(Math.min(Math.max(startWidth - deltaX, 280), 960));
      } else {
        newWidth = Math.round(Math.min(Math.max(startWidth + deltaX, 280), 960));
      }
      setLiveWidth(newWidth);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsResizing(null);

      const deltaX = (upEvent.clientX - startX) / effectiveZoom;
      let finalWidth: number;
      if (direction === 'left') {
        finalWidth = Math.round(Math.min(Math.max(startWidth - deltaX, 280), 960));
      } else {
        finalWidth = Math.round(Math.min(Math.max(startWidth + deltaX, 280), 960));
      }
      setLiveWidth(finalWidth);
      onUpdateDimensions(node.id, finalWidth, node.height, node.fontSize);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const WIDTH_PRESETS = [
    { label: 'مضغوط (320px)', width: 320 },
    { label: 'قياسي (420px)', width: 420 },
    { label: 'عريض (580px)', width: 580 },
    { label: 'واسع (760px)', width: 760 },
  ];

  const handleSelectPresetWidth = (w: number) => {
    setLiveWidth(w);
    if (onUpdateDimensions) {
      onUpdateDimensions(node.id, w, node.height, node.fontSize);
    }
    setShowSizeMenu(false);
  };

  const handleAdjustFontSize = (delta: number) => {
    const currentSize = node.fontSize || 24;
    const newSize = Math.min(Math.max(currentSize + delta, 16), 36);
    if (onUpdateDimensions) {
      onUpdateDimensions(node.id, liveWidth, node.height, newSize);
    }
  };

  const handleWordClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;

    const clickedWord = words.find((w) => w.index === index);
    if (!clickedWord) return;

    // Connect mode handling
    if (isConnectingMode && onCompleteConnecting) {
      onCompleteConnecting(
        node.id,
        undefined,
        index,
        clickedWord.uthmani,
        getAyahAnchor(index, clickedWord.uthmani)
      );
      return;
    }

    // Register with central QuranSelectionEngine
    const wordSel = createWordSelection({
      surah: surahNumber,
      ayah: ayahNumberInSurah,
      wordIndex: index,
      wordText: clickedWord.uthmani,
      surahName: cleanSurahName(surahName)
    });

    if (e.shiftKey) {
      toggleMultiSelection(wordSel);
      return;
    }

    selectWord({
      surah: surahNumber,
      ayah: ayahNumberInSurah,
      wordIndex: index,
      wordText: clickedWord.uthmani,
      surahName: cleanSurahName(surahName)
    });

    // Check if word already belongs to an existing annotation
    const existing = annotations.find(
      (a) => a.wordIndex === index || (a.endWordIndex !== undefined && index >= a.wordIndex && index <= a.endWordIndex)
    );

    if (existing) {
      setActiveWordIndex(activeWordIndex === existing.wordIndex ? null : existing.wordIndex);
    } else {
      // Immediate circle designation with distinctive contrasting color
      const newAnn: WordAnnotation = {
        id: `ann-${Date.now()}-${index}`,
        wordIndex: index,
        wordText: clickedWord.uthmani,
        type: 'circle',
        color: '#e11d48' // Distinctive vibrant ruby red
      };
      const updated = [...annotations, newAnn];
      onUpdateAnnotations(node.id, updated);
      setActiveWordIndex(index);
    }
  };

  const handleSaveAnnotation = (newAnn: WordAnnotation) => {
    const existingFiltered = annotations.filter((a) => a.wordIndex !== newAnn.wordIndex);
    const updated = [...existingFiltered, newAnn];
    onUpdateAnnotations(node.id, updated);
  };

  const handleRemoveAnnotation = (wordIdx: number) => {
    const updated = annotations.filter((a) => a.wordIndex !== wordIdx);
    onUpdateAnnotations(node.id, updated);
  };

  const handleCopyAyah = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `﴿${textUthmani}﴾ [سورة ${cleanSurahName(surahName)}: الآية ${ayahNumberInSurah}]`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveTafsir = () => {
    if (onUpdateTafsir) {
      onUpdateTafsir(node.id, tafsirText.trim());
    }
  };

  const getAyahAnchor = (
    wIndex?: number,
    wText?: string,
    charIndex?: number,
    charText?: string,
    endWordIndex?: number
  ): QuranAnchor => {
    if (charIndex !== undefined && wIndex !== undefined) {
      return createCharAnchor({
        surah: surahNumber,
        ayah: ayahNumberInSurah,
        wordIndex: wIndex,
        charIndex,
        charText: charText || wText || '',
        wordText: wText,
        surahName: cleanSurahName(surahName)
      });
    }
    if (endWordIndex !== undefined && wIndex !== undefined && endWordIndex > wIndex) {
      return createWordRangeAnchor({
        surah: surahNumber,
        ayah: ayahNumberInSurah,
        startWord: wIndex,
        endWord: endWordIndex,
        phraseText: wText || '',
        surahName: cleanSurahName(surahName)
      });
    }
    if (wIndex !== undefined) {
      return createWordAnchor({
        surah: surahNumber,
        ayah: ayahNumberInSurah,
        wordIndex: wIndex,
        wordText: wText || '',
        surahName: cleanSurahName(surahName)
      });
    }
    return createAyahAnchor({
      surah: surahNumber,
      ayah: ayahNumberInSurah,
      text: textUthmani,
      surahName: cleanSurahName(surahName)
    });
  };

  return (
    <div
      data-card-id={node.id}
      onClick={(e) => {
        if (isConnectingMode && onCompleteConnecting) {
          e.stopPropagation();
          onCompleteConnecting(node.id, undefined, undefined, undefined, getAyahAnchor());
          return;
        }
        onSelect();
      }}
      className={`relative rounded-3xl border-2 transition-all duration-200 select-none ${
        theme.cardBg
      } ${theme.border} ${
        isConnectingMode
          ? 'ring-4 ring-emerald-500/60 shadow-xl cursor-crosshair scale-[1.01]'
          : isSelected
          ? `ring-4 ${theme.glow} shadow-xl scale-[1.008]`
          : 'hover:shadow-lg shadow-sm'
      } group/node`}
      style={{ width: liveWidth }}
      dir="rtl"
    >
      {/* Visual guidance indicator when connecting */}
      {isConnectingMode && (
        <div className="absolute -top-3.5 right-6 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-bounce z-40 font-cairo flex items-center gap-1">
          <Link className="w-3 h-3 text-amber-300" />
          <span>انقر على البطاقة أو على كلمة محددة للربط</span>
        </div>
      )}
      {/* Magnetic Connection Ports (Top, Right, Bottom, Left) - Touch & Mobile Friendly */}
      {!readOnly && (
        <>
          {/* Top Port */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'top', undefined, getAyahAnchor());
            }}
            className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من أعلى البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>

          {/* Bottom Port */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'bottom', undefined, getAyahAnchor());
            }}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من أسفل البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>

          {/* Right Port (Arabic Start) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'right', undefined, getAyahAnchor());
            }}
            className={`absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center transition-all z-30 cursor-crosshair active:scale-95 ${
              isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover/node:opacity-100 hover:scale-125'
            }`}
            title="رابط من يمين البطاقة"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </button>

          {/* Left Port (Arabic Flow) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, 'left', undefined, getAyahAnchor());
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

      {/* Node Header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-t-3xl border-b border-black/5 ${theme.headerBg}`}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-stone-400 cursor-grab active:cursor-grabbing hover:text-stone-700" />
          <span className="font-cairo font-bold text-sm text-stone-900">
            سورة {cleanSurahName(surahName)}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${theme.badge}`}>
            الآية {ayahNumberInSurah}
          </span>
          <span className="text-[10px] text-stone-600 bg-white/80 px-1.5 py-0.5 rounded border border-stone-200">
            جزء {juz}
          </span>
          {page && (
            <span className="text-[10px] text-stone-500 bg-white/60 px-1.5 py-0.5 rounded border border-stone-200 hidden sm:inline">
              ص {page}
            </span>
          )}
          <span className="text-[10px] text-stone-500" title={revelationType === 'Meccan' ? 'مكية' : 'مدنية'}>
            {revelationType === 'Meccan' ? '🕋' : '🕌'}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Tafsir & Note Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTafsir(!showTafsir);
            }}
            className={`p-1.5 rounded-full transition-all ${
              showTafsir || node.ayahData.tafsir
                ? 'bg-amber-100 text-amber-800'
                : 'text-stone-500 hover:text-stone-800 hover:bg-black/5'
            }`}
            title="إضافة وقفة تدبرية أو تفسير للآية"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          {/* Color Switcher */}
          {!readOnly && onUpdateTheme && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-black/5 rounded-full transition-colors"
                title="تغيير لون البطاقة"
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

          {/* Quick Resize & Font Size Control */}
          {!readOnly && onUpdateDimensions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSizeMenu(!showSizeMenu);
                }}
                className={`p-1.5 rounded-full transition-all ${
                  showSizeMenu ? 'bg-emerald-100 text-emerald-800' : 'text-stone-400 hover:text-stone-700 hover:bg-black/5'
                }`}
                title="تحجيم الإطار وحجم خط الآية"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {showSizeMenu && (
                <div
                  className="absolute top-full left-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-2xl p-3 z-50 w-56 space-y-2.5 font-cairo animate-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[11px] font-bold text-stone-700 pb-1.5 border-b border-stone-100 flex items-center justify-between">
                    <span>تحجيم إطار الآية</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">{liveWidth}px</span>
                  </div>

                  {/* Width Presets */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {WIDTH_PRESETS.map((p) => (
                      <button
                        key={p.width}
                        onClick={() => handleSelectPresetWidth(p.width)}
                        className={`text-xs py-1.5 px-2 rounded-xl border text-center transition-all ${
                          liveWidth === p.width
                            ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Font Size Scaling */}
                  <div className="pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-stone-600">
                      <span>حجم خط المصحف:</span>
                      <span className="text-emerald-700 font-mono font-bold">{node.fontSize || 24}px</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustFontSize(-2)}
                        className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-700 transition-colors flex items-center justify-center gap-1"
                        title="تصغير خط الآية"
                      >
                        <ZoomOut className="w-3.5 h-3.5 text-stone-500" />
                        A- تصغير
                      </button>
                      <button
                        onClick={() => handleAdjustFontSize(2)}
                        className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-700 transition-colors flex items-center justify-center gap-1"
                        title="تكبير خط الآية"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-stone-500" />
                        A+ تكبير
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Copy Ayah */}
          <button
            onClick={handleCopyAyah}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-black/5 rounded-full transition-colors"
            title="نسخ الآية بالرسم العثماني"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Duplicate Card */}
          {!readOnly && onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(node.id);
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-black/5 rounded-full transition-colors"
              title="تكرار البطاقة"
            >
              <CopyPlus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Connect Button */}
          {!readOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartConnecting(node.id, undefined, undefined, undefined, getAyahAnchor());
              }}
              className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-black/5 rounded-full transition-colors"
              title="سحب سهم رابط"
            >
              <Link className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Card */}
          {!readOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-black/5 rounded-full transition-colors"
              title="حذف البطاقة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Ayah Words Display with Circles, Highlights, and Letter/Word Markers */}
      <div className="p-4 sm:p-5 relative">
        <div
          className="flex flex-wrap items-center justify-start gap-x-2 gap-y-3 font-quran text-stone-900 leading-[2.5] select-text"
          style={{ fontSize: `${node.fontSize || 24}px` }}
        >
          {words.map((w) => {
            const annotation = annotations.find(
              (a) => a.wordIndex === w.index || (a.endWordIndex !== undefined && w.index >= a.wordIndex && w.index <= a.endWordIndex)
            );
            const isWordActive = activeWordIndex === (annotation ? annotation.wordIndex : w.index);
            const isMultiWord = Boolean(annotation?.endWordIndex !== undefined && annotation.endWordIndex > annotation.wordIndex);
            const isFirstInMulti = annotation ? annotation.wordIndex === w.index : false;
            const isLastInMulti = annotation && annotation.endWordIndex !== undefined ? annotation.endWordIndex === w.index : false;

            // Check Central Selection Engine state
            const isEngineSelected =
              activeSelection?.anchor.surahId === surahNumber &&
              activeSelection?.anchor.ayahId === ayahNumberInSurah &&
              (activeSelection?.anchor.wordIndex === w.index ||
                (activeSelection?.anchor.startWord !== undefined &&
                  activeSelection?.anchor.endWord !== undefined &&
                  w.index >= activeSelection.anchor.startWord &&
                  w.index <= activeSelection.anchor.endWord));

            const isEngineMultiSelected = multiSelections.some(
              (m) =>
                m.anchor.surahId === surahNumber &&
                m.anchor.ayahId === ayahNumberInSurah &&
                m.anchor.wordIndex === w.index
            );

            // Character level rendering if this annotation targets a specific character within this word
            const hasCharTarget = Boolean(annotation && annotation.charIndex !== undefined && annotation.wordIndex === w.index);
            const wordLetters = hasCharTarget ? extractWordLetters(w.uthmani) : null;

            return (
              <div
                key={w.index}
                id={`ayah-word-${node.id}-${w.index}`}
                className="relative inline-block group/word"
              >
                {/* Hover Quick Connect Trigger */}
                {!readOnly && !isConnectingMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartConnecting(
                        node.id,
                        w.index,
                        undefined,
                        w.uthmani,
                        getAyahAnchor(w.index, w.uthmani)
                      );
                    }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/word:opacity-100 bg-emerald-700 hover:bg-emerald-800 text-white p-1 rounded-full shadow-lg transition-all z-30 scale-90 hover:scale-110 cursor-pointer flex items-center justify-center pointer-events-auto"
                    title={`ربط كلمة "${w.uthmani}" بسهم رابط`}
                  >
                    <Link className="w-2.5 h-2.5" />
                  </button>
                )}

                {/* Connecting Target Indicator when isConnectingMode */}
                {isConnectingMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCompleteConnecting) {
                        onCompleteConnecting(
                          node.id,
                          undefined,
                          w.index,
                          w.uthmani,
                          getAyahAnchor(w.index, w.uthmani)
                        );
                      }
                    }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-30 cursor-pointer animate-pulse whitespace-nowrap font-cairo border border-rose-300 pointer-events-auto"
                    title={`ربط إلى كلمة "${w.uthmani}"`}
                  >
                    اربط هنا
                  </button>
                )}

                <span
                  onClick={(e) => {
                    if (isConnectingMode && onCompleteConnecting) {
                      e.stopPropagation();
                      onCompleteConnecting(
                        node.id,
                        undefined,
                        w.index,
                        w.uthmani,
                        getAyahAnchor(w.index, w.uthmani)
                      );
                      return;
                    }
                    handleWordClick(w.index, e);
                  }}
                  className={`relative cursor-pointer transition-all inline-block select-text ${
                    !readOnly ? 'hover:opacity-90' : ''
                  } ${
                    isConnectingMode ? 'hover:scale-105 ring-2 ring-rose-500/80 rounded-lg shadow-xs' : ''
                  } ${
                    isEngineMultiSelected ? 'ring-2 ring-indigo-500/90 bg-indigo-100/50 rounded-lg shadow-xs' : ''
                  } ${
                    isEngineSelected && !isEngineMultiSelected ? 'ring-2 ring-emerald-500/80 bg-emerald-50/40 rounded-lg' : ''
                  }`}
                  style={{
                    padding: isMultiWord ? '2px 4px' : '2px 6px',
                    backgroundColor:
                      annotation?.type === 'highlight'
                        ? `${annotation.color}35`
                        : isMultiWord && annotation?.type === 'circle'
                        ? `${annotation.color}18`
                        : undefined,
                    borderBottom:
                      annotation?.type === 'underline'
                        ? `3.5px solid ${annotation.color}`
                        : isMultiWord && annotation?.type === 'circle'
                        ? `2.5px solid ${annotation.color}`
                        : undefined,
                    borderTop:
                      isMultiWord && annotation?.type === 'circle'
                        ? `2.5px solid ${annotation.color}`
                        : undefined,
                    borderRight:
                      isMultiWord && annotation?.type === 'circle' && isFirstInMulti
                        ? `2.5px solid ${annotation.color}`
                        : undefined,
                    borderLeft:
                      isMultiWord && annotation?.type === 'circle' && isLastInMulti
                        ? `2.5px solid ${annotation.color}`
                        : undefined,
                    borderTopRightRadius: isMultiWord && isFirstInMulti ? '9999px' : undefined,
                    borderBottomRightRadius: isMultiWord && isFirstInMulti ? '9999px' : undefined,
                    borderTopLeftRadius: isMultiWord && isLastInMulti ? '9999px' : undefined,
                    borderBottomLeftRadius: isMultiWord && isLastInMulti ? '9999px' : undefined
                  }}
                >
                  {/* Word circle SVG ring for single word */}
                  {annotation?.type === 'circle' && !isMultiWord && !hasCharTarget && (
                    <span
                      className="absolute inset-x-[-6px] inset-y-[-3px] pointer-events-none rounded-full shadow-xs"
                      style={{
                        border: `2.5px solid ${annotation.color}`,
                        backgroundColor: `${annotation.color}15`,
                        transform: 'rotate(-1.5deg)'
                      }}
                    />
                  )}

                  {/* Word Text or Letter-level Text */}
                  {hasCharTarget && wordLetters ? (
                    <span className="inline-flex items-center text-stone-900">
                      {wordLetters.map((ltr) => {
                        const isTargetChar = ltr.charIndex === annotation?.charIndex;
                        return (
                          <span
                            key={ltr.charIndex}
                            id={`ayah-char-${node.id}-${w.index}-${ltr.charIndex}`}
                            onClick={(e) => {
                              if (isConnectingMode && onCompleteConnecting) {
                                e.stopPropagation();
                                const charAnchor = getAyahAnchor(
                                  w.index,
                                  w.uthmani,
                                  ltr.charIndex,
                                  ltr.displayWithMarks
                                );
                                onCompleteConnecting(
                                  node.id,
                                  undefined,
                                  w.index,
                                  `حرف «${ltr.displayWithMarks}» في (${w.uthmani})`,
                                  charAnchor
                                );
                                return;
                              }

                              e.stopPropagation();
                              const charSel = createCharSelection({
                                surah: surahNumber,
                                ayah: ayahNumberInSurah,
                                wordIndex: w.index,
                                charIndex: ltr.charIndex,
                                charText: ltr.displayWithMarks,
                                wordText: w.uthmani,
                                surahName: cleanSurahName(surahName)
                              });

                              if (e.shiftKey) {
                                toggleMultiSelection(charSel);
                              } else {
                                selectLetter({
                                  surah: surahNumber,
                                  ayah: ayahNumberInSurah,
                                  wordIndex: w.index,
                                  charIndex: ltr.charIndex,
                                  charText: ltr.displayWithMarks,
                                  wordText: w.uthmani,
                                  surahName: cleanSurahName(surahName)
                                });
                              }
                            }}
                            className={`relative inline-block transition-all ${
                              isTargetChar ? 'px-1 rounded-full' : ''
                            } ${isConnectingMode ? 'hover:scale-125 cursor-crosshair hover:bg-emerald-200/60 rounded' : ''}`}
                            style={{
                              border: isTargetChar ? `2px solid ${annotation?.color}` : undefined,
                              backgroundColor: isTargetChar ? `${annotation?.color}25` : undefined,
                              color: isTargetChar ? annotation?.color : undefined,
                              fontWeight: isTargetChar ? 700 : undefined
                            }}
                            title={isConnectingMode ? `ربط إلى حرف «${ltr.displayWithMarks}»` : undefined}
                          >
                            {ltr.displayWithMarks}
                          </span>
                        );
                      })}
                    </span>
                  ) : (
                    <span className="text-stone-900 font-medium relative z-10">{w.uthmani}</span>
                  )}

                  {/* Note Callout Badge */}
                  {annotation?.note && (isFirstInMulti || !isMultiWord) && (
                    <span
                      className="absolute -top-3 -left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white shadow-xs font-sans font-bold z-20"
                      style={{ backgroundColor: annotation.color }}
                      title={annotation.note}
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                    </span>
                  )}
                </span>

                {/* Hover Tooltip for Word Reflection Note */}
                {annotation?.note && (
                  <div className="hidden group-hover:block absolute bottom-full mb-1.5 right-0 w-56 p-2.5 bg-stone-900 text-stone-100 text-xs rounded-xl shadow-2xl z-40 pointer-events-none font-tajawal leading-relaxed">
                    <p className="font-semibold text-[10px] text-amber-300">وقفة تدبرية حول الكلمة:</p>
                    <p className="mt-0.5">{annotation.note}</p>
                  </div>
                )}

                {/* Word Annotation Popover */}
                {isWordActive && (isFirstInMulti || !isMultiWord) && !readOnly && annotation && (
                  <WordAnnotationPopover
                    wordIndex={annotation.wordIndex}
                    wordText={w.uthmani}
                    allAyahWords={words}
                    currentAnnotation={annotation}
                    onSaveAnnotation={handleSaveAnnotation}
                    onRemoveAnnotation={handleRemoveAnnotation}
                    onStartConnectionFromWord={(idx, designatedText, charIndex, charText, endWordIndex) =>
                      onStartConnecting(
                        node.id,
                        idx,
                        undefined,
                        designatedText,
                        getAyahAnchor(idx, designatedText, charIndex, charText, endWordIndex)
                      )
                    }
                    onClose={() => setActiveWordIndex(null)}
                  />
                )}
              </div>
            );
          })}

          {/* Ayah End Symbol with number */}
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-stone-300 bg-white/90 text-xs font-mono text-stone-700 shadow-2xs">
            {ayahNumberInSurah}
          </span>
        </div>
      </div>

      {/* Tafsir / Personal Reflection Section */}
      {showTafsir && (
        <div
          className="px-4 pb-4 pt-2 border-t border-stone-200/80 bg-white/70 rounded-b-3xl space-y-2 animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-xs text-stone-700 font-bold">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>وقفة تدبرية وتفسير الآية:</span>
            </span>
            {!readOnly && (
              <button
                onClick={handleSaveTafsir}
                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-semibold flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                حفظ
              </button>
            )}
          </div>

          {readOnly ? (
            <p className="text-xs text-stone-800 leading-relaxed font-tajawal bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              {node.ayahData.tafsir || 'لا توجد وقفة مدونة لهذه الآية بعد.'}
            </p>
          ) : (
            <textarea
              value={tafsirText}
              onChange={(e) => setTafsirText(e.target.value)}
              onBlur={handleSaveTafsir}
              placeholder="اكتب لطيفة تفسيرية، دلالة سياقية، أو مناسبة بين الآيات..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white outline-none focus:border-emerald-600 text-stone-900 font-tajawal leading-relaxed"
            />
          )}
        </div>
      )}

      {/* Card Footer Hint for User */}
      {!readOnly && !showTafsir && (
        <div className="px-4 py-1.5 bg-black/3 border-t border-black/5 flex items-center justify-between text-[11px] text-stone-500 rounded-b-3xl">
          <span>انقر على أي كلمة لوضع دائرة أو تظليل أو ربط</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnecting(node.id, undefined, undefined, undefined, getAyahAnchor());
            }}
            className="text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            سحب سهم رابط ↗
          </button>
        </div>
      )}

      {/* Interactive Drag Resize Handles */}
      {!readOnly && onUpdateDimensions && (
        <>
          {/* Left Resize Corner (Primary for Arabic RTL expansion) */}
          <div
            onPointerDown={(e) => handleStartResize(e, 'left')}
            className={`absolute -bottom-1 -left-1 w-6 h-6 flex items-end justify-start p-1 z-30 cursor-ew-resize select-none group/resize hover:scale-125 transition-transform ${
              isResizing ? 'scale-125' : ''
            }`}
            title="اسحب لتكبير أو تصغير إطار الآية"
          >
            <div className="w-3.5 h-3.5 rounded-bl-xl border-b-[2.5px] border-l-[2.5px] border-stone-400 group-hover/resize:border-emerald-600 shadow-2xs" />
          </div>

          {/* Right Resize Corner */}
          <div
            onPointerDown={(e) => handleStartResize(e, 'right')}
            className={`absolute -bottom-1 -right-1 w-6 h-6 flex items-end justify-end p-1 z-30 cursor-ew-resize select-none group/resize hover:scale-125 transition-transform ${
              isResizing ? 'scale-125' : ''
            }`}
            title="اسحب لتكبير أو تصغير إطار الآية"
          >
            <div className="w-3.5 h-3.5 rounded-br-xl border-b-[2.5px] border-r-[2.5px] border-stone-400 group-hover/resize:border-emerald-600 shadow-2xs" />
          </div>
        </>
      )}

      {/* Floating Live Width Indicator during Drag Resizing */}
      {isResizing && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xl z-50 pointer-events-none font-cairo whitespace-nowrap">
          العرض: {liveWidth} بكسل
        </div>
      )}
    </div>
  );
};
