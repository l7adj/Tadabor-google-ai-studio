import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Maximize,
  Minimize,
  Sliders,
  Sparkles,
  BookOpen,
  MessageSquare,
  Image as ImageIcon,
  Compass,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { TadabburMap, CanvasNode } from '../../types';
import { extractAyahWords, extractWordLetters, cleanSurahName } from '../../lib/arabicUtils';

interface PresentationViewProps {
  map: TadabburMap;
  onExit: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ map, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const nodes = map.nodes;
  const currentNode: CanvasNode | undefined = nodes[currentIndex];

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < nodes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, nodes.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
        } else {
          onExit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onExit]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Find incoming/outgoing edges for this node to display connected ideas
  const connectedEdges = map.edges.filter(
    (e) => e.sourceId === currentNode?.id || e.targetId === currentNode?.id
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${
        isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-stone-100 text-stone-900'
      }`}
      dir="rtl"
    >
      {/* Top Zen Bar - Fixed height, never overlaps content */}
      <div className={`h-16 shrink-0 px-4 sm:px-6 flex items-center justify-between border-b z-20 ${
        isDarkMode ? 'border-stone-800/90 bg-stone-950/95' : 'border-stone-200 bg-white/95'
      } backdrop-blur shadow-2xs`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-amber-200 flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-bold font-cairo ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
              {map.title}
            </h2>
            <span className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              عرض تدبّري وقور • بطاقة {currentIndex + 1} من {nodes.length}
            </span>
          </div>
        </div>

        {/* Presentation Controls */}
        <div className="flex items-center gap-2">
          {/* Night/Day Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isDarkMode
                ? 'bg-stone-900 border-stone-700 text-stone-200 hover:text-white hover:bg-stone-800'
                : 'bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200'
            }`}
          >
            {isDarkMode ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي'}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg transition-colors border ${
              isDarkMode
                ? 'bg-stone-900 border-stone-700 text-stone-300 hover:text-white'
                : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
            }`}
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Exit Back to Studio */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>العودة للمحرر</span>
          </button>
        </div>
      </div>

      {/* Main Focus Center Stage - Clean scrolling layout: never covered by top bar */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col items-center">
        {currentNode ? (
          <div className="w-full max-w-3xl space-y-6 pt-4 pb-24 animate-in fade-in zoom-in-95 duration-200">
            {/* 1. AYAH SLIDE */}
            {currentNode.type === 'ayah' && currentNode.ayahData && (
              <div
                className={`p-6 sm:p-12 rounded-3xl border shadow-xl transition-all ${
                  isDarkMode
                    ? 'bg-stone-900 border-stone-800 shadow-black/40'
                    : 'bg-white border-stone-200 shadow-stone-200'
                }`}
              >
                <div className={`flex items-center justify-between pb-5 border-b mb-6 ${
                  isDarkMode ? 'border-stone-800' : 'border-stone-200/70'
                }`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-base sm:text-lg font-bold font-cairo ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-800'
                    }`}>
                      سورة {cleanSurahName(currentNode.ayahData.surahName)}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      isDarkMode
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        : 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                    }`}>
                      الآية {currentNode.ayahData.ayahNumberInSurah}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'
                    }`}>
                      الجزء {currentNode.ayahData.juz}
                    </span>
                    {currentNode.ayahData.page && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-600'
                      }`}>
                        ص {currentNode.ayahData.page}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    {currentNode.ayahData.revelationType === 'Meccan' ? 'مكية 🕋' : 'مدنية 🕌'}
                  </span>
                </div>

                {/* Quranic Text in Full Glory - Deep high-contrast stone-950 in day mode, stone-100 in dark mode */}
                <div className="text-right py-4">
                  <p
                    className="font-quran text-2xl sm:text-4xl leading-[2.6] select-text"
                    style={{ color: isDarkMode ? '#f5f5f4' : '#1c1917' }}
                  >
                    {extractAyahWords(
                      currentNode.ayahData.textUthmani,
                      currentNode.ayahData.textSimple
                    ).map((w) => {
                      const annotation = currentNode.ayahData?.annotations.find(
                        (a) =>
                          a.wordIndex === w.index ||
                          (a.endWordIndex !== undefined &&
                            w.index >= a.wordIndex &&
                            w.index <= a.endWordIndex)
                      );

                      const isMultiWord = Boolean(
                        annotation?.endWordIndex !== undefined &&
                          annotation.endWordIndex > annotation.wordIndex
                      );
                      const isFirstInMulti = annotation ? annotation.wordIndex === w.index : false;
                      const isLastInMulti =
                        annotation && annotation.endWordIndex !== undefined
                          ? annotation.endWordIndex === w.index
                          : false;
                      const hasCharTarget = Boolean(
                        annotation && annotation.charIndex !== undefined && annotation.wordIndex === w.index
                      );
                      const wordLetters = hasCharTarget ? extractWordLetters(w.uthmani) : null;

                      return (
                        <span
                          key={w.index}
                          className={`relative inline-block mx-1.5 transition-all ${
                            isMultiWord ? 'px-1.5 py-0.5 my-0.5' : 'px-1'
                          } ${
                            isMultiWord && isFirstInMulti
                              ? 'rounded-r-2xl'
                              : isMultiWord && isLastInMulti
                              ? 'rounded-l-2xl'
                              : isMultiWord
                              ? 'rounded-none'
                              : 'rounded-xl'
                          }`}
                          style={{
                            backgroundColor:
                              !hasCharTarget && annotation?.type === 'highlight'
                                ? `${annotation.color}25`
                                : isMultiWord
                                ? `${annotation?.color}15`
                                : undefined,
                            borderBottom:
                              !hasCharTarget && annotation?.type === 'underline'
                                ? `4px solid ${annotation.color}`
                                : undefined,
                            borderTop: isMultiWord ? `2px dashed ${annotation?.color}70` : undefined,
                            borderBottomColor: isMultiWord ? `${annotation?.color}70` : undefined,
                            borderRight: isMultiWord && isFirstInMulti ? `2px solid ${annotation?.color}` : undefined,
                            borderLeft: isMultiWord && isLastInMulti ? `2px solid ${annotation?.color}` : undefined
                          }}
                        >
                          {/* Whole-word circle */}
                          {!hasCharTarget && annotation?.type === 'circle' && (
                            <span
                              className="absolute inset-x-[-6px] inset-y-[-4px] pointer-events-none rounded-full"
                              style={{
                                border: `3px solid ${annotation.color}`,
                                backgroundColor: `${annotation.color}15`,
                                transform: 'rotate(-1.5deg)'
                              }}
                            />
                          )}

                          {/* Word text: either letter-level breakdown or whole word */}
                          {hasCharTarget && wordLetters ? (
                            <span className="inline-flex items-center">
                              {wordLetters.map((letter) => {
                                const isTargetChar = letter.charIndex === annotation.charIndex;
                                return (
                                  <span
                                    key={letter.charIndex}
                                    className="relative inline-block px-0.5"
                                    style={{
                                      backgroundColor:
                                        isTargetChar && annotation.type === 'highlight'
                                          ? `${annotation.color}35`
                                          : undefined
                                    }}
                                  >
                                    {isTargetChar && annotation.type === 'circle' && (
                                      <span
                                        className="absolute inset-x-[-3px] inset-y-[-2px] pointer-events-none rounded-full"
                                        style={{
                                          border: `2.5px solid ${annotation.color}`,
                                          backgroundColor: `${annotation.color}20`
                                        }}
                                      />
                                    )}
                                    <span
                                      className="font-quran"
                                      style={{
                                        color: isTargetChar
                                          ? annotation.color
                                          : isDarkMode
                                          ? '#f5f5f4'
                                          : '#1c1917',
                                        fontWeight: isTargetChar ? 700 : undefined
                                      }}
                                    >
                                      {letter.letter}
                                    </span>
                                  </span>
                                );
                              })}
                            </span>
                          ) : (
                            <span
                              className="font-quran"
                              style={{
                                color: isDarkMode ? '#f5f5f4' : '#1c1917'
                              }}
                            >
                              {w.uthmani}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-full mx-2 text-sm font-mono align-middle ${
                        isDarkMode
                          ? 'border border-stone-700 text-stone-300 bg-stone-800'
                          : 'border border-stone-300 text-stone-800 bg-stone-100 font-bold'
                      }`}
                    >
                      {currentNode.ayahData.ayahNumberInSurah}
                    </span>
                  </p>
                </div>

                {/* Word Callout Notes List if any */}
                {currentNode.ayahData.annotations.filter((a) => a.note).length > 0 && (
                  <div className={`mt-8 pt-6 border-t space-y-3 ${
                    isDarkMode ? 'border-stone-800' : 'border-stone-200/70'
                  }`}>
                    <h4 className={`text-xs font-bold flex items-center gap-1.5 ${
                      isDarkMode ? 'text-stone-400' : 'text-stone-600'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      إضاءات وتأملات الكلمات المحددة:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentNode.ayahData.annotations
                        .filter((a) => a.note)
                        .map((ann) => (
                          <div
                            key={ann.id}
                            className={`p-3 rounded-xl border text-xs leading-relaxed ${
                              isDarkMode
                                ? 'bg-stone-800/70 border-stone-700 text-stone-200'
                                : 'bg-stone-50 border-stone-200 text-stone-800'
                            }`}
                          >
                            <span
                              className="inline-block px-2 py-0.5 rounded font-quran font-bold text-sm mb-1"
                              style={{ backgroundColor: `${ann.color}25`, color: ann.color }}
                            >
                              {ann.phraseText || ann.wordText}
                            </span>
                            <p className="font-tajawal text-xs">{ann.note}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. NOTE SLIDE */}
            {currentNode.type === 'note' && currentNode.noteData && (
              <div
                className={`p-6 sm:p-12 rounded-3xl border shadow-xl ${
                  isDarkMode
                    ? 'bg-stone-900 border-stone-800 text-stone-100'
                    : 'bg-white border-stone-200 text-stone-900'
                }`}
              >
                <div className={`flex items-center gap-2 pb-4 mb-4 border-b ${
                  isDarkMode ? 'border-stone-800' : 'border-stone-200/70'
                }`}>
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-bold font-cairo">{currentNode.noteData.title}</h3>
                </div>

                <p className="font-tajawal text-base sm:text-xl leading-relaxed whitespace-pre-wrap">
                  {currentNode.noteData.content}
                </p>

                {currentNode.noteData.referenceText && (
                  <div className={`mt-6 pt-4 border-t text-xs font-semibold ${
                    isDarkMode ? 'border-stone-800 text-emerald-400' : 'border-stone-200 text-emerald-800'
                  }`}>
                    مرجع الآية: {currentNode.noteData.referenceText}
                  </div>
                )}

                {currentNode.noteData.tags?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                    {currentNode.noteData.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2.5 py-1 rounded-md ${
                          isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. CONCEPT SLIDE */}
            {currentNode.type === 'concept' && currentNode.conceptData && (
              <div
                className={`p-6 sm:p-12 rounded-3xl border shadow-xl text-center space-y-4 ${
                  isDarkMode
                    ? 'bg-indigo-950/60 border-indigo-800 text-stone-100'
                    : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 text-indigo-950'
                }`}
              >
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                  isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {currentNode.conceptData.badge || 'محور تدبّري مركزي'}
                </span>

                <h2 className="text-2xl sm:text-4xl font-bold font-cairo">
                  {currentNode.conceptData.title}
                </h2>

                {currentNode.conceptData.description && (
                  <p className={`font-tajawal text-base sm:text-xl max-w-xl mx-auto leading-relaxed ${
                    isDarkMode ? 'text-stone-300' : 'text-stone-700'
                  }`}>
                    {currentNode.conceptData.description}
                  </p>
                )}
              </div>
            )}

            {/* 4. IMAGE SLIDE */}
            {currentNode.type === 'image' && currentNode.imageData && (
              <div
                className={`p-6 rounded-3xl border shadow-xl text-center space-y-4 ${
                  isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
                }`}
              >
                {currentNode.imageData.url ? (
                  <div className={`rounded-2xl overflow-hidden max-h-[60vh] flex items-center justify-center ${
                    isDarkMode ? 'bg-stone-800' : 'bg-stone-100'
                  }`}>
                    <img
                      src={currentNode.imageData.url}
                      alt={currentNode.imageData.caption || 'صورة توضيحية'}
                      className="max-h-[60vh] w-auto object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className={`h-48 flex items-center justify-center ${
                    isDarkMode ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    لم تُرفع صورة بعد
                  </div>
                )}
                {currentNode.imageData.caption && (
                  <p className={`font-tajawal text-base font-medium ${
                    isDarkMode ? 'text-stone-200' : 'text-stone-800'
                  }`}>
                    {currentNode.imageData.caption}
                  </p>
                )}
              </div>
            )}

            {/* Connected Ideas & Links Indicator */}
            {connectedEdges.length > 0 && (
              <div className="pt-2">
                <span className={`text-[11px] font-bold block mb-2 ${
                  isDarkMode ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  الروابط التدبرية المتصلة بهذه البطاقة:
                </span>
                <div className="flex flex-wrap gap-2">
                  {connectedEdges.map((edge) => {
                    const otherNodeId = edge.sourceId === currentNode.id ? edge.targetId : edge.sourceId;
                    const otherNode = nodes.find((n) => n.id === otherNodeId);
                    const otherTitle =
                      otherNode?.type === 'ayah'
                        ? `سورة ${cleanSurahName(otherNode.ayahData?.surahName || '')} [${otherNode.ayahData?.ayahNumberInSurah}]`
                        : otherNode?.type === 'note'
                        ? otherNode.noteData?.title
                        : otherNode?.conceptData?.title || 'بطاقة مرتبطة';

                    return (
                      <div
                        key={edge.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
                          isDarkMode
                            ? 'bg-stone-900 border-stone-800 text-stone-300'
                            : 'bg-white border-stone-200 text-stone-700 shadow-2xs'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: edge.color }} />
                        <span className="font-semibold">{edge.label || 'علاقة تدبرية'}</span>
                        <span className="text-stone-400">←</span>
                        <span className={`font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                          {otherTitle}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-stone-400 my-auto">لا توجد بطاقات في هذه الخريطة</div>
        )}
      </div>

      {/* Bottom Timeline Slide Bar & Controls */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-t ${
          isDarkMode ? 'border-stone-800/80 bg-stone-950/90' : 'border-stone-200 bg-white/90'
        } backdrop-blur`}
      >
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : isDarkMode
              ? 'bg-stone-900 hover:bg-stone-800 text-white'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابق (سهم يمين)</span>
        </button>

        {/* Slide Indicators */}
        <div className="flex items-center gap-1.5 max-w-md overflow-x-auto py-1 px-2">
          {nodes.map((node, idx) => (
            <button
              key={node.id}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all rounded-full ${
                idx === currentIndex
                  ? 'w-8 h-2.5 bg-emerald-600'
                  : isDarkMode
                  ? 'w-2.5 h-2.5 bg-stone-700 hover:bg-stone-600'
                  : 'w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400'
              }`}
              title={`الانتقال إلى البطاقة ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentIndex === nodes.length - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            currentIndex === nodes.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : isDarkMode
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
          }`}
        >
          <span>التالي (سهم يسار أو مسافة)</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
