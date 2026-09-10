import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  PlusCircle,
  HelpCircle,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { SurahData, AyahData, SearchResultItem, CreateReflectionPayload } from '../../types';
import { getAyahContext, AyahContextData } from '../../lib/quranService';
import { cleanSurahName } from '../../lib/arabicUtils';

interface QuranContextModalProps {
  surahNumber: number;
  ayahNumberInSurah: number;
  initialWordIndex?: number;
  matchedWordIndices?: number[];
  onClose: () => void;
  onAddAyahToCanvas: (item: SearchResultItem) => void;
  onAddReflectionToCanvas?: (payload: CreateReflectionPayload) => void;
}

export const QuranContextModal: React.FC<QuranContextModalProps> = ({
  surahNumber,
  ayahNumberInSurah,
  initialWordIndex,
  matchedWordIndices = [],
  onClose,
  onAddAyahToCanvas,
  onAddReflectionToCanvas
}) => {
  const [currentAyahNum, setCurrentAyahNum] = useState(ayahNumberInSurah);
  const [contextData, setContextData] = useState<AyahContextData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reflection workflow states
  const [activeTab, setActiveTab] = useState<'context' | 'reflect'>('context');
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | undefined>(initialWordIndex);
  const [observation, setObservation] = useState('');
  const [question, setQuestion] = useState('');
  const [insight, setInsight] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAyahContext(surahNumber, currentAyahNum, 3)
      .then((data) => {
        setContextData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load context:', err);
        setIsLoading(false);
      });
  }, [surahNumber, currentAyahNum]);

  if (!contextData && isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center space-y-3 font-cairo shadow-2xl">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-stone-600">جاري فتح سياق الآية الكريمة...</p>
        </div>
      </div>
    );
  }

  if (!contextData) return null;

  const { surah, targetAyah, previousAyahs, nextAyahs } = contextData;

  const handleCopy = () => {
    const textToCopy = `﴿${targetAyah.textUthmani}﴾ [سورة ${cleanSurahName(surah.name)}: ${targetAyah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAddDirect = () => {
    const item: SearchResultItem = {
      surahNumber: surah.number,
      surahName: surah.name,
      revelationType: surah.revelationType,
      ayahNumberInSurah: targetAyah.numberInSurah,
      overallAyahNumber: targetAyah.number,
      juz: targetAyah.juz,
      page: targetAyah.page,
      textUthmani: targetAyah.textUthmani,
      textSimple: targetAyah.textSimple
    };
    onAddAyahToCanvas(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const targetWords = targetAyah.textUthmani.split(/\s+/).filter(Boolean);

  const handleSaveReflection = () => {
    if (onAddReflectionToCanvas) {
      const selectedWordText =
        selectedWordIndex !== undefined && targetWords[selectedWordIndex]
          ? targetWords[selectedWordIndex]
          : undefined;

      onAddReflectionToCanvas({
        surahNumber: surah.number,
        ayahNumberInSurah: targetAyah.numberInSurah,
        surahName: surah.name,
        textUthmani: targetAyah.textUthmani,
        wordIndex: selectedWordIndex,
        selectedText: selectedWordText,
        observation: observation.trim() || 'وقفة تدبرية حول الآية',
        question: question.trim(),
        insight: insight.trim()
      });
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-stone-50 rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white px-5 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 font-cairo">
                  سورة {cleanSurahName(surah.name)}
                </h3>
                <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                  الآية {targetAyah.numberInSurah}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-tajawal">
                {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • الجزء {targetAyah.juz} • صفحة {targetAyah.page}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setActiveTab('context')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors font-cairo ${
                  activeTab === 'context'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                قراءة السياق
              </button>
              <button
                onClick={() => setActiveTab('reflect')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-colors font-cairo ${
                  activeTab === 'reflect'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                وقفة تدبر
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'context' ? (
            <div className="space-y-4">
              {/* Surrounding Context Banner */}
              <div className="text-xs text-stone-500 font-tajawal flex items-center justify-between border-b border-stone-200/80 pb-2">
                <span>سياق الآيات السابقة واللاحقة في سورة {cleanSurahName(surah.name)}:</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentAyahNum <= 1}
                    onClick={() => setCurrentAyahNum((prev) => Math.max(1, prev - 1))}
                    className="p-1 rounded-lg hover:bg-stone-200 disabled:opacity-30 transition-colors"
                    title="الآية السابقة"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-stone-700">{currentAyahNum}</span>
                  <button
                    disabled={currentAyahNum >= surah.ayahs.length}
                    onClick={() => setCurrentAyahNum((prev) => Math.min(surah.ayahs.length, prev + 1))}
                    className="p-1 rounded-lg hover:bg-stone-200 disabled:opacity-30 transition-colors"
                    title="الآية التالية"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Previous Ayahs */}
              {previousAyahs.map((prevA) => (
                <div
                  key={prevA.numberInSurah}
                  onClick={() => setCurrentAyahNum(prevA.numberInSurah)}
                  className="bg-stone-100/70 hover:bg-stone-200/70 p-3 rounded-2xl border border-stone-200/60 transition-all cursor-pointer opacity-70 hover:opacity-100"
                  title="انقر لجعلها الآية المستهدفة"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span>الآية {prevA.numberInSurah}</span>
                    <span className="text-[10px] text-stone-400">انقر للتبديل</span>
                  </div>
                  <p className="font-quran text-base text-stone-800 leading-loose">
                    ﴿{prevA.textUthmani}﴾
                  </p>
                </div>
              ))}

              {/* Target Focused Ayah */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-emerald-600/80 shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-600" />
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold font-cairo">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    الآية موضع التدبر
                  </span>
                  <span>الآية {targetAyah.numberInSurah} من {surah.ayahs.length}</span>
                </div>

                <p className="font-quran text-xl sm:text-2xl text-stone-900 leading-loose text-center py-2">
                  ﴿{targetAyah.textUthmani}﴾
                </p>
              </div>

              {/* Next Ayahs */}
              {nextAyahs.map((nextA) => (
                <div
                  key={nextA.numberInSurah}
                  onClick={() => setCurrentAyahNum(nextA.numberInSurah)}
                  className="bg-stone-100/70 hover:bg-stone-200/70 p-3 rounded-2xl border border-stone-200/60 transition-all cursor-pointer opacity-70 hover:opacity-100"
                  title="انقر لجعلها الآية المستهدفة"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span>الآية {nextA.numberInSurah}</span>
                    <span className="text-[10px] text-stone-400">انقر للتبديل</span>
                  </div>
                  <p className="font-quran text-base text-stone-800 leading-loose">
                    ﴿{nextA.textUthmani}﴾
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Direct Guided Reflection Form */
            <div className="space-y-4 font-tajawal">
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-cairo">
                  <span>انقر على أي كلمة لتحديد ارتكاز الوقفة التدبرية (اختياري):</span>
                  {selectedWordIndex !== undefined && (
                    <button
                      type="button"
                      onClick={() => setSelectedWordIndex(undefined)}
                      className="text-stone-400 hover:text-rose-600 text-[10px] underline"
                    >
                      إلغاء ارتكاز الكلمة
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 font-quran text-lg leading-loose py-1" dir="rtl">
                  {targetWords.map((word, wIdx) => {
                    const isSelected = selectedWordIndex === wIdx;
                    const isMatchedFromSearch = matchedWordIndices.includes(wIdx);

                    return (
                      <button
                        key={wIdx}
                        type="button"
                        onClick={() => setSelectedWordIndex(isSelected ? undefined : wIdx)}
                        className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer text-stone-900 ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105'
                            : isMatchedFromSearch
                            ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-300'
                            : 'hover:bg-emerald-50 hover:text-emerald-900'
                        }`}
                        title={isSelected ? 'تم تحديد ارتكاز الوقفة على هذه الكلمة' : 'انقر لربط الوقفة بهذه الكلمة تحديداً'}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>

                {selectedWordIndex !== undefined && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-cairo">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>مرتكز الوقفة الحالي:</span>
                    <span className="font-quran font-bold text-xs text-emerald-950">
                      «{targetWords[selectedWordIndex]}»
                    </span>
                    <span className="text-stone-500 text-[10px]">(سيخرج سهم الرابطة في اللوحة مباشرة من هذه الكلمة)</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo">
                    ماذا لاحظت في هذه الآية؟ (التدبر والملحظ اللفظي والسياقي)
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={3}
                    placeholder="سجل ما لفت نظرك في سياق الآية أو ألفاظها أو ترتيبها..."
                    className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    ما السؤال الذي أثارته الآية؟ (سؤال التدبر والبحث)
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="سؤال أثارته الآية يحث على التفكر والبحث..."
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                    الهداية أو الأثر العملي (ثمرة التدبر):
                  </label>
                  <textarea
                    value={insight}
                    onChange={(e) => setInsight(e.target.value)}
                    rows={2}
                    placeholder="كيف نعيش بهذه الآية؟ وما العمل الصالح المترتب عليها؟"
                    className="w-full text-xs p-3 rounded-2xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white px-5 py-4 border-t border-stone-200 flex items-center justify-between shrink-0 font-cairo">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'تم النسخ' : 'نسخ الآية'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'context' ? (
              <>
                <button
                  onClick={() => setActiveTab('reflect')}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>وقفة تدبرية</span>
                </button>

                <button
                  onClick={handleAddDirect}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-900 hover:bg-black text-white hover:scale-[1.02]'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>{isAdded ? 'تمت الإضافة للخريطة' : 'إضافة إلى مساحة التدبر'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSaveReflection}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وإضافة لمساحة التدبر</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
