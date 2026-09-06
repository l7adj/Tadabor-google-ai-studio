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
  Check,
  Target,
  FileText,
  Compass
} from 'lucide-react';
import { QuranCorpus, SurahData, AyahData, SearchResultItem, QuranAnchor } from '../../types';
import { loadQuranCorpus, searchQuran } from '../../lib/quranService';
import { cleanSurahName, extractAyahWords } from '../../lib/arabicUtils';
import { createQuranAnchor } from '../../lib/quranAnchors';

interface QuickAyahPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAyahs: (items: SearchResultItem[], anchor?: QuranAnchor) => void;
  onOpenDeepSearch?: () => void;
}

export const QuickAyahPickerModal: React.FC<QuickAyahPickerModalProps> = ({
  isOpen,
  onClose,
  onAddAyahs,
  onOpenDeepSearch
}) => {
  const [corpus, setCorpus] = useState<QuranCorpus | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'search'>('browse');

  // Browse state
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(18); // Default to Surah Al-Kahf
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [startAyahNumber, setStartAyahNumber] = useState<number>(1);
  const [endAyahNumber, setEndAyahNumber] = useState<number>(1);
  const [isRangeMode, setIsRangeMode] = useState(false);

  // Direct Search state
  const [directQuery, setDirectQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected Word Anchor state inside previewed Ayah
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    loadQuranCorpus().then(setCorpus).catch(console.error);
  }, []);

  // Live direct search debounced
  useEffect(() => {
    if (activeTab !== 'search' || !directQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchQuran({ mode: 'literal', query: directQuery.trim(), limit: 12 });
        setSearchResults(res.results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [directQuery, activeTab]);

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
      setSelectedWordIndex(null);
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

  // When single ayah is selected, extract words for interactive token picker
  const previewWords = useMemo(() => {
    if (selectedAyahs.length === 1) {
      return extractAyahWords(selectedAyahs[0].textUthmani);
    }
    return [];
  }, [selectedAyahs]);

  const handleSelectSearchResult = (res: SearchResultItem) => {
    setSelectedSurahNumber(res.surahNumber);
    setStartAyahNumber(res.ayahNumberInSurah);
    setEndAyahNumber(res.ayahNumberInSurah);
    setIsRangeMode(false);
    if (res.matchedWordIndices && res.matchedWordIndices.length > 0) {
      setSelectedWordIndex(res.matchedWordIndices[0]);
    } else {
      setSelectedWordIndex(null);
    }
    setActiveTab('browse');
  };

  const handleToggleWord = (index: number) => {
    setSelectedWordIndex((prev) => (prev === index ? null : index));
  };

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

    let anchor: QuranAnchor | undefined = undefined;
    if (selectedAyahs.length === 1 && selectedWordIndex !== null) {
      const wordObj = previewWords.find((w) => w.index === selectedWordIndex);
      if (wordObj) {
        anchor = createQuranAnchor({
          surah: selectedSurah.number,
          ayah: selectedAyahs[0].numberInSurah,
          level: 'word',
          text: wordObj.uthmani,
          startWord: selectedWordIndex,
          endWord: selectedWordIndex,
          surahName: selectedSurah.name
        });
      }
    } else if (selectedAyahs.length === 1) {
      anchor = createQuranAnchor({
        surah: selectedSurah.number,
        ayah: selectedAyahs[0].numberInSurah,
        level: 'ayah',
        text: selectedAyahs[0].textUthmani,
        surahName: selectedSurah.name
      });
    }

    onAddAyahs(items, anchor);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 400);
  };

  const selectedWordObj = selectedWordIndex !== null
    ? previewWords.find((w) => w.index === selectedWordIndex)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-cairo">
                إضافة وربط عنصر قرآني
              </h2>
              <p className="text-xs text-stone-500 font-tajawal">
                حدد آية أو كلمة دقيقة لربطها كمرتكز (Anchor) في الخريطة التدبرية
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

        {/* Tab switcher: Browse vs Direct Search */}
        <div className="px-6 pt-3 pb-2 bg-stone-50/50 border-b border-stone-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all font-cairo flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>تصفح بالمصحف (سورة ورقم آية)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all font-cairo flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>بحث فوري باللفظ (مثل: إبراهيم، الصبر)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {activeTab === 'search' ? (
            /* Direct Instant Search Mode */
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={directQuery}
                  onChange={(e) => setDirectQuery(e.target.value)}
                  placeholder="ابحث عن لفظ أو كلمة قرآنية (مثال: إبراهيم، النور، غفور رحيم)..."
                  autoFocus
                  className="w-full text-xs sm:text-sm pr-9 pl-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none font-cairo"
                />
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {isSearching ? (
                <div className="py-8 text-center text-xs text-stone-400 font-tajawal">
                  جاري البحث في النص القرآني الشريف...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {searchResults.map((res) => (
                    <div
                      key={`${res.surahNumber}-${res.ayahNumberInSurah}`}
                      onClick={() => handleSelectSearchResult(res)}
                      className="p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex flex-col gap-1.5 bg-white shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 font-cairo">
                        <span>
                          سورة {cleanSurahName(res.surahName)} [آية {res.ayahNumberInSurah}]
                        </span>
                        <span className="text-[10px] text-stone-400 font-tajawal font-normal">
                          الجزء {res.juz} • صفحة {res.page}
                        </span>
                      </div>
                      <p className="font-quran text-sm sm:text-base text-stone-900 leading-relaxed text-right line-clamp-2">
                        {res.textUthmani}
                      </p>
                    </div>
                  ))}
                </div>
              ) : directQuery.trim() ? (
                <div className="py-8 text-center text-xs text-stone-400 font-tajawal">
                  لم يتم العثور على نتائج مطابقة لكلمة "{directQuery}". جرّب كتابتها بدون همزات أو تشكيل.
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-stone-400 font-tajawal">
                  اكتب أي كلمة أو جملة قرآنية في مربع البحث للوصول الفوري إلى الآية وموضعها
                </div>
              )}
            </div>
          ) : (
            /* Browse Mode */
            <>
              {/* Surah Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 font-cairo flex items-center justify-between">
                  <span>السورة الكريمة (114 سورة)</span>
                  {selectedSurah && (
                    <span className="text-[11px] font-normal text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-tajawal">
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
                      className="w-full text-xs font-bold p-2.5 bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-none font-cairo text-stone-800"
                    >
                      {(corpus?.surahs || []).map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. سورة {cleanSurahName(s.name)} ({s.numberOfAyahs} آية)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="تصفية السور..."
                        value={surahSearchQuery}
                        onChange={(e) => setSurahSearchQuery(e.target.value)}
                        className="w-full text-xs p-2.5 pr-8 bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-none font-cairo"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ayah Range Controls */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 font-cairo">
                    رقم الآية الكريمة:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRangeMode(!isRangeMode);
                      if (isRangeMode) setEndAyahNumber(startAyahNumber);
                      setSelectedWordIndex(null);
                    }}
                    className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold font-cairo flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3" />
                    <span>{isRangeMode ? 'إلغاء وضع التتابع (آية واحدة فقط)' : 'تحديد عدة آيات متتابعة'}</span>
                  </button>
                </div>

                {!isRangeMode ? (
                  <div className="flex items-center gap-3">
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
                        onChange={(e) =>
                          setStartAyahNumber(
                            Math.min(
                              Math.max(1, Number(e.target.value) || 1),
                              selectedSurah?.numberOfAyahs || 286
                            )
                          )
                        }
                        className="w-16 text-center text-xs font-bold p-1.5 bg-white border border-stone-300 rounded-lg outline-none font-mono"
                      />

                      <button
                        type="button"
                        disabled={startAyahNumber >= (selectedSurah?.numberOfAyahs || 286)}
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
                    <span className="text-[11px] text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded font-tajawal">
                      (سيتم إدراج {selectedAyahs.length} بطاقات آيات متتابعة)
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Live Preview Box with Word Anchor Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 font-cairo flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-800" />
                <span>نص الآية الكريمة (انقر على كلمة لتحديدها كمرتكز):</span>
              </span>

              {selectedWordObj && (
                <button
                  type="button"
                  onClick={() => setSelectedWordIndex(null)}
                  className="text-[11px] text-rose-600 hover:underline font-cairo"
                >
                  إلغاء تحديد الكلمة (ربط الآية كاملة)
                </button>
              )}
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 max-h-56 overflow-y-auto space-y-3">
              {selectedAyahs.map((ayah) => (
                <div key={ayah.numberInSurah} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-cairo">
                      سورة {cleanSurahName(selectedSurah?.name || '')} • الآية {ayah.numberInSurah}
                    </span>
                    <span className="text-[10px] text-stone-400 font-tajawal">
                      الجزء {ayah.juz} • صفحة {ayah.page}
                    </span>
                  </div>

                  {/* Interactive Word Tokens */}
                  <div className="font-quran text-lg sm:text-xl text-stone-900 leading-[2.6] text-right flex flex-wrap gap-1 items-center">
                    {previewWords.length > 0 ? (
                      previewWords.map((w) => {
                        const isSelected = selectedWordIndex === w.index;
                        return (
                          <span
                            key={w.index}
                            onClick={() => handleToggleWord(w.index)}
                            className={`cursor-pointer px-1.5 py-0.5 rounded-lg transition-all select-none ${
                              isSelected
                                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs ring-2 ring-amber-600/60 scale-105'
                                : 'hover:bg-amber-200/60 text-stone-900'
                            }`}
                            title={`انقر لتحديد كلمة "${w.uthmani}" كمرتكز (Anchor)`}
                          >
                            {w.uthmani}
                          </span>
                        );
                      })
                    ) : (
                      <p>{ayah.textUthmani}</p>
                    )}

                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full mx-1.5 text-xs font-mono border border-amber-400 bg-amber-100 text-amber-900 font-bold align-middle">
                      {ayah.numberInSurah}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Designated Anchor Indicator Pill */}
            <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-tajawal flex items-center justify-between">
              <span className="text-stone-500">المرتكز القرآني الذي سينشأ:</span>
              <span className="font-bold text-stone-800 font-cairo">
                {selectedWordObj ? (
                  <span className="text-emerald-800">
                    كلمة «{selectedWordObj.uthmani}» (الموضع {selectedWordObj.index + 1}) في الآية {startAyahNumber}
                  </span>
                ) : (
                  <span className="text-stone-700">
                    كامل الآية {startAyahNumber} من سورة {cleanSurahName(selectedSurah?.name || '')}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/90">
          {onOpenDeepSearch ? (
            <button
              onClick={() => {
                onClose();
                onOpenDeepSearch();
              }}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold font-cairo flex items-center gap-1 underline underline-offset-4"
            >
              <Search className="w-3.5 h-3.5" />
              <span>بحث عميق بالجذر اللغوي</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors font-cairo"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={selectedAyahs.length === 0}
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] font-cairo disabled:opacity-50 cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>تمت الإضافة بنجاح!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>
                    {selectedWordObj
                      ? `إضافة مع ارتكاز «${selectedWordObj.uthmani}»`
                      : `إضافة إلى الخريطة (${selectedAyahs.length})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
