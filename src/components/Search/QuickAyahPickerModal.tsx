import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { QuranCorpus, SurahData, AyahData, SearchResultItem } from '../../types';
import { loadQuranCorpus } from '../../lib/quranService';
import { cleanSurahName } from '../../lib/arabicUtils';

interface QuickAyahPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAyahs: (items: SearchResultItem[]) => void;
  onOpenDeepSearch?: () => void;
}

export const QuickAyahPickerModal: React.FC<QuickAyahPickerModalProps> = ({
  isOpen,
  onClose,
  onAddAyahs,
  onOpenDeepSearch
}) => {
  const [corpus, setCorpus] = useState<QuranCorpus | null>(null);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(18); // Default to Surah Al-Kahf
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [startAyahNumber, setStartAyahNumber] = useState<number>(1);
  const [endAyahNumber, setEndAyahNumber] = useState<number>(1);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    loadQuranCorpus().then(setCorpus).catch(console.error);
  }, []);

  const selectedSurah = useMemo(() => {
    if (!corpus) return null;
    return corpus.surahs.find((s) => s.number === selectedSurahNumber) || corpus.surahs[0];
  }, [corpus, selectedSurahNumber]);

  // Ensure ayah numbers remain valid when surah changes
  useEffect(() => {
    if (selectedSurah) {
      if (startAyahNumber > selectedSurah.numberOfAyahs) {
        setStartAyahNumber(1);
        setEndAyahNumber(1);
      }
      if (endAyahNumber > selectedSurah.numberOfAyahs) {
        setEndAyahNumber(startAyahNumber);
      }
    }
  }, [selectedSurah, startAyahNumber, endAyahNumber]);

  if (!isOpen) return null;

  const filteredSurahs = corpus?.surahs.filter((s) => {
    if (!surahSearchQuery.trim()) return true;
    const clean = cleanSurahName(s.name);
    return (
      clean.includes(surahSearchQuery.trim()) ||
      s.number.toString() === surahSearchQuery.trim()
    );
  }) || [];

  const selectedAyahs: AyahData[] = useMemo(() => {
    if (!selectedSurah) return [];
    if (!isRangeMode) {
      const single = selectedSurah.ayahs.find((a) => a.numberInSurah === startAyahNumber);
      return single ? [single] : [];
    } else {
      const from = Math.min(startAyahNumber, endAyahNumber);
      const to = Math.max(startAyahNumber, endAyahNumber);
      return selectedSurah.ayahs.filter(
        (a) => a.numberInSurah >= from && a.numberInSurah <= to
      );
    }
  }, [selectedSurah, isRangeMode, startAyahNumber, endAyahNumber]);

  const handleAdd = () => {
    if (!selectedSurah || selectedAyahs.length === 0) return;

    const items: SearchResultItem[] = selectedAyahs.map((ayah) => ({
      surahNumber: selectedSurah.number,
      surahName: selectedSurah.name,
      revelationType: selectedSurah.revelationType,
      ayahNumberInSurah: ayah.numberInSurah,
      overallAyahNumber: ayah.number,
      juz: ayah.juz,
      page: ayah.page,
      textUthmani: ayah.textUthmani,
      textSimple: ayah.textSimple
    }));

    onAddAyahs(items);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-cairo">
                المنتقي السريع للآيات الكريمة
              </h2>
              <p className="text-xs text-stone-500 font-tajawal">
                اختر السورة ورقم الآية لإدراجها مباشرة في لوحتك التدبرية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Surah Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 font-cairo flex items-center justify-between">
              <span>السورة الكريمة (114 سورة)</span>
              {selectedSurah && (
                <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-tajawal">
                  {selectedSurah.revelationType === 'Meccan' ? 'مكية 🕋' : 'مدنية 🕌'} • {selectedSurah.numberOfAyahs} آية
                </span>
              )}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <select
                  value={selectedSurahNumber}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSelectedSurahNumber(val);
                    setStartAyahNumber(1);
                    setEndAyahNumber(1);
                  }}
                  className="w-full text-xs sm:text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-500 font-cairo text-stone-900 font-semibold"
                >
                  {filteredSurahs.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {cleanSurahName(s.name)} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 relative">
                <input
                  type="text"
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  placeholder="تصفية السور بالاسم..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-500 font-tajawal text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Ayah Number Selector (Single or Range) */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 font-cairo">
                تحديد الآية المطلوبة
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsRangeMode(!isRangeMode);
                  setEndAyahNumber(startAyahNumber);
                }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors font-cairo flex items-center gap-1 ${
                  isRangeMode
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                }`}
              >
                <Layers className="w-3 h-3" />
                {isRangeMode ? 'محدد نطاق (آيات متعددة)' : 'تحديد مقطع من آيات متعددة؟'}
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {!isRangeMode ? (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-stone-600 font-tajawal">
                    رقم الآية:
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={startAyahNumber <= 1}
                      onClick={() => setStartAyahNumber((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={selectedSurah?.numberOfAyahs || 286}
                      value={startAyahNumber}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(Number(e.target.value) || 1, selectedSurah?.numberOfAyahs || 286));
                        setStartAyahNumber(val);
                      }}
                      className="w-16 text-center text-sm font-bold p-1.5 bg-white border border-stone-300 rounded-lg outline-none text-stone-900 font-mono"
                    />
                    <button
                      type="button"
                      disabled={Boolean(selectedSurah && startAyahNumber >= selectedSurah.numberOfAyahs)}
                      onClick={() => setStartAyahNumber((prev) => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-stone-400 font-tajawal">
                    من أصل {selectedSurah?.numberOfAyahs} آية
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-stone-600 font-tajawal font-medium">من آية:</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedSurah?.numberOfAyahs || 286}
                      value={startAyahNumber}
                      onChange={(e) => setStartAyahNumber(Math.max(1, Number(e.target.value) || 1))}
                      className="w-14 text-center text-xs font-bold p-1 bg-white border border-stone-300 rounded-lg outline-none font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-stone-600 font-tajawal font-medium">إلى آية:</label>
                    <input
                      type="number"
                      min={startAyahNumber}
                      max={Math.min(startAyahNumber + 7, selectedSurah?.numberOfAyahs || 286)}
                      value={endAyahNumber}
                      onChange={(e) => setEndAyahNumber(Number(e.target.value) || startAyahNumber)}
                      className="w-14 text-center text-xs font-bold p-1 bg-white border border-stone-300 rounded-lg outline-none font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded font-tajawal">
                    (سيتم إدراج {selectedAyahs.length} بطاقات آيات متتابعة)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-stone-700 font-cairo">
              المعاينة الحية لنص الآية الشريفة:
            </span>
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 max-h-56 overflow-y-auto space-y-3">
              {selectedAyahs.map((ayah) => (
                <div key={ayah.numberInSurah} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-cairo">
                      الآية {ayah.numberInSurah}
                    </span>
                    <span className="text-[10px] text-stone-400 font-tajawal">
                      الجزء {ayah.juz} • صفحة {ayah.page}
                    </span>
                  </div>
                  <p className="font-quran text-lg sm:text-xl text-stone-900 leading-[2.4] text-right">
                    {ayah.textUthmani}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full mx-1.5 text-xs font-mono border border-amber-400 bg-amber-100 text-amber-900 font-bold align-middle">
                      {ayah.numberInSurah}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/80">
          {onOpenDeepSearch ? (
            <button
              onClick={() => {
                onClose();
                onOpenDeepSearch();
              }}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold font-cairo flex items-center gap-1 underline underline-offset-4"
            >
              <Search className="w-3.5 h-3.5" />
              <span>بحث متقدم بالمعنى أو الجذر اللغوي</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors font-cairo"
            >
              إلغاء
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedAyahs.length === 0}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] font-cairo disabled:opacity-50"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>تمت الإضافة بنجاح!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>إضافة إلى الخريطة ({selectedAyahs.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
