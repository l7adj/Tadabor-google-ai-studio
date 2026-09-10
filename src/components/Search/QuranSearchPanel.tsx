import React, { useState, useEffect, useTransition } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Filter,
  Copy,
  Check,
  PlusCircle,
  Hash,
  ExternalLink,
  ChevronLeft,
  X,
  Compass,
  Info,
  Palette
} from 'lucide-react';
import { SearchMode, SearchResponse, SearchResultItem, SurahData, QuranCorpus } from '../../types';
import { searchQuran, loadQuranCorpus } from '../../lib/quranService';
import { QURAN_ROOTS_DICTIONARY } from '../../lib/quranRoots';
import { QURAN_SEMANTIC_TOPICS } from '../../lib/quranSemantics';
import { cleanSurahName } from '../../lib/arabicUtils';
import { HighlightedAyahText, HighlightColor } from './HighlightedAyahText';
import { QuranContextModal } from './QuranContextModal';

interface QuranSearchPanelProps {
  onAddAyahToCanvas: (item: SearchResultItem) => void;
  onAddReflectionToCanvas?: (reflectionData: {
    surahNumber: number;
    ayahNumberInSurah: number;
    surahName: string;
    textUthmani: string;
    observation: string;
    question?: string;
    insight?: string;
  }) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const QuranSearchPanel: React.FC<QuranSearchPanelProps> = ({
  onAddAyahToCanvas,
  onAddReflectionToCanvas,
  onClose,
  isModal = false
}) => {
  const [mode, setMode] = useState<SearchMode>('literal');
  const [query, setQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<number | undefined>(undefined);
  const [selectedJuz, setSelectedJuz] = useState<number | undefined>(undefined);
  const [revelationType, setRevelationType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [exactTashkeel, setExactTashkeel] = useState(false);
  const [matchType, setMatchType] = useState<'contains' | 'whole' | 'exact'>('contains');
  const [highlightColor, setHighlightColor] = useState<HighlightColor>('amber');
  const [visibleCount, setVisibleCount] = useState(50);

  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [corpus, setCorpus] = useState<QuranCorpus | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [contextModalAyah, setContextModalAyah] = useState<{ surahNumber: number; ayahNumberInSurah: number } | null>(null);

  const [, startTransition] = useTransition();

  // Load Quran corpus once for dropdowns
  useEffect(() => {
    loadQuranCorpus().then(setCorpus).catch(console.error);
  }, []);

  // Reset pagination on filter or query change
  useEffect(() => {
    setVisibleCount(50);
  }, [query, mode, selectedSurah, selectedJuz, revelationType, exactTashkeel, matchType]);

  // Perform search on change with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResponse(null);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      startTransition(() => {
        searchQuran({
          mode,
          query,
          selectedSurahNumber: selectedSurah,
          juzNumber: selectedJuz,
          revelationType,
          exactTashkeel,
          matchType,
          limit: 0
        })
          .then((res) => {
            setResponse(res);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error('Search error:', err);
            setIsLoading(false);
          });
      });
    }, 180);

    return () => clearTimeout(timer);
  }, [query, mode, selectedSurah, selectedJuz, revelationType, exactTashkeel, matchType]);

  const handleCopy = (item: SearchResultItem) => {
    const textToCopy = `﴿${item.textUthmani}﴾ [سورة ${cleanSurahName(item.surahName)}: ${item.ayahNumberInSurah}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.overallAyahNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdd = (item: SearchResultItem) => {
    onAddAyahToCanvas(item);
    setAddedId(item.overallAyahNumber);
    setTimeout(() => setAddedId(null), 2000);
  };

  // Quick root selection
  const handleSelectRoot = (root: string) => {
    setMode('root');
    setQuery(root);
  };

  // Quick topic selection
  const handleSelectTopic = (topicTitle: string) => {
    setMode('semantic');
    setQuery(topicTitle);
  };

  return (
    <div className={`flex flex-col bg-white ${isModal ? 'h-full' : 'min-h-[calc(100vh-4rem)]'} overflow-hidden`}>
      {/* Search Header Bar */}
      <div className="p-4 sm:p-6 border-b border-stone-200 bg-stone-50/70">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2 font-cairo">
                <Search className="w-5 h-5 text-emerald-700" />
                الباحث القرآني الفوري والدقيق
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                بحث فوري مطابق برسم المصحف العثماني حفص، مع تمييز الكلمات والحروف بدقة الباحث القرآني
              </p>
            </div>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMode('literal')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'literal'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/80'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              بحث حرفي مطابق
            </button>

            <button
              onClick={() => setMode('root')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'root'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/80'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              بحث بالجذر اللغوي
            </button>

            <button
              onClick={() => setMode('semantic')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'semantic'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              بحث بالمعنى والموضوع
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === 'root'
                  ? 'أدخل الجذر الثلاثي (مثل: رحم، هدى، علم، صبر، فكر، دبر)...'
                  : mode === 'semantic'
                  ? 'ابحث بالمعنى أو الفكرة (مثل: الصبر، عظمة الخالق، بر الوالدين، النور)...'
                  : 'اكتب الكلمة أو العبارة (مثل: ابراهيم، الرحمن، كتب عليكم، إن مع العسر)...'
              }
              className="w-full pl-10 pr-11 py-3 text-sm sm:text-base bg-white border border-stone-300 rounded-xl shadow-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-stone-900 transition-all font-tajawal font-medium"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick suggestions pills */}
          {mode === 'root' && !query && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-500 block">جذور قرآنية محورية للتدبر:</span>
              <div className="flex flex-wrap gap-1.5">
                {QURAN_ROOTS_DICTIONARY.slice(0, 16).map((r) => (
                  <button
                    key={r.root}
                    onClick={() => handleSelectRoot(r.root)}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 px-2 py-1 rounded-md transition-colors"
                  >
                    جذر: <strong className="font-bold">{r.root}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'semantic' && !query && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-500 block">موضوعات كبرى للتدبّر:</span>
              <div className="flex flex-wrap gap-1.5">
                {QURAN_SEMANTIC_TOPICS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTopic(t.title)}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/60 px-2 py-1 rounded-md transition-colors"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-600">
            {/* Surah Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">السورة:</span>
              <select
                value={selectedSurah ?? ''}
                onChange={(e) => setSelectedSurah(e.target.value ? Number(e.target.value) : undefined)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none focus:border-emerald-600"
              >
                <option value="">جميع السور (114)</option>
                {corpus?.surahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. سورة {cleanSurahName(s.name)} ({s.numberOfAyahs} آية)
                  </option>
                ))}
              </select>
            </div>

            {/* Juz Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">الجزء:</span>
              <select
                value={selectedJuz ?? ''}
                onChange={(e) => setSelectedJuz(e.target.value ? Number(e.target.value) : undefined)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none focus:border-emerald-600"
              >
                <option value="">كل الأجزاء (30)</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                  <option key={j} value={j}>
                    الجزء {j}
                  </option>
                ))}
              </select>
            </div>

            {/* Revelation Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">النوع:</span>
              <select
                value={revelationType}
                onChange={(e) => setRevelationType(e.target.value as any)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none focus:border-emerald-600"
              >
                <option value="all">الكل (مكي ومدني)</option>
                <option value="Meccan">مكية فقط</option>
                <option value="Medinan">مدنية فقط</option>
              </select>
            </div>

            {/* Matching type (Contains vs Whole Word vs Exact) */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">المطابقة:</span>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value as 'contains' | 'whole' | 'exact')}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none focus:border-emerald-600"
              >
                <option value="contains">تضمين جزئي وحرفي (أي مقطع أو حرف)</option>
                <option value="whole">مطابقة كلمة كاملة (مع السوابق واللواحق)</option>
                <option value="exact">مطابقة لفظية مجردة بحتة</option>
              </select>
            </div>

            {/* Exact Tashkeel Toggle (for literal mode) */}
            {mode === 'literal' && (
              <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  checked={exactTashkeel}
                  onChange={(e) => setExactTashkeel(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700">مطابقة التشكيل الدقيق</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100/50">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Active Root Banner */}
          {response?.matchedRootInfo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-700 text-white font-bold text-sm px-2.5 py-0.5 rounded-lg">
                    جذر: {response.matchedRootInfo.root}
                  </span>
                  <span className="text-xs font-semibold text-emerald-900">
                    الدلالة اللغوية والأصل الاشتقاقي
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-tajawal">
                {response.matchedRootInfo.description}
              </p>
              {response.matchedRootInfo.primaryDerivatives?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-emerald-800">من مشتقاته القرآنية:</span>
                  {response.matchedRootInfo.primaryDerivatives.map((der, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                    >
                      {der}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Semantic Topic Banner */}
          {response?.matchedSemanticTopic && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700" />
                <h3 className="text-sm font-bold text-indigo-900">
                  الموضوع القرآني: {response.matchedSemanticTopic.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed font-tajawal">
                {response.matchedSemanticTopic.description}
              </p>
            </div>
          )}

          {/* Results Stats & Highlighting Color Selector Bar */}
          {response && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 bg-white border border-stone-200 px-3.5 py-2 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  تم العثور على <strong className="text-stone-900 font-bold">{response.totalMatches.toLocaleString('ar-EG')}</strong> آية
                  في <strong className="text-stone-900 font-bold">{response.surahsCount.toLocaleString('ar-EG')}</strong> سورة
                </span>
                {response.results.length > visibleCount && (
                  <span className="text-stone-500 font-medium">
                    (يُعرض حالياً {Math.min(visibleCount, response.results.length).toLocaleString('ar-EG')} آية)
                  </span>
                )}
                {isLoading && (
                  <span className="flex items-center gap-1 text-emerald-700 mr-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    جاري التحديث...
                  </span>
                )}
              </div>

              {/* Highlight Color Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-stone-500 flex items-center gap-1 text-[11px]">
                  <Palette className="w-3.5 h-3.5 text-stone-400" />
                  لون التمييز:
                </span>
                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                  <button
                    onClick={() => setHighlightColor('amber')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      highlightColor === 'amber'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    عنبري (الباحث)
                  </button>
                  <button
                    onClick={() => setHighlightColor('emerald')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      highlightColor === 'emerald'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    زمردي
                  </button>
                  <button
                    onClick={() => setHighlightColor('rose')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      highlightColor === 'rose'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    ياقوتي
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !response && (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400 gap-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">جاري البحث في المصحف الشريف...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && query && response && response.results.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-800">لم يتم العثور على نتائج مطابقة</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                جرب البحث بصيغة أخرى، أو استخدام &quot;البحث بالجذر&quot; للوصول لجميع المشتقات، أو مراجعة خيارات المطابقة.
              </p>
            </div>
          )}

          {/* Results List */}
          {response && response.results.length > 0 && (
            <div className="space-y-3">
              {response.results.slice(0, visibleCount).map((item) => (
                <div
                  key={item.overallAyahNumber}
                  className="bg-white border border-stone-200/90 hover:border-emerald-500/80 rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md space-y-3 group"
                >
                  {/* Top Meta Details */}
                  <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm font-cairo">
                        سورة {cleanSurahName(item.surahName)}
                      </span>
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono font-medium">
                        الآية {item.ayahNumberInSurah}
                      </span>
                      <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-[11px]">
                        الجزء {item.juz}
                      </span>
                      <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-[11px]">
                        صفحة {item.page}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {item.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setContextModalAyah({ surahNumber: item.surahNumber, ayahNumberInSurah: item.ayahNumberInSurah })}
                        className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors cursor-pointer"
                        title="قراءة سياق الآية وكتابة وقفة تدبرية"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>السياق والتدبر</span>
                      </button>

                      <button
                        onClick={() => handleAdd(item)}
                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                          addedId === item.overallAyahNumber
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
                        }`}
                        title="إضافة هذه الآية إلى خريطة التدبّر الحالية"
                      >
                        {addedId === item.overallAyahNumber ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            تمت الإضافة
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            إضافة للخريطة
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(item)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        title="نسخ الآية مع المرجع"
                      >
                        {copiedId === item.overallAyahNumber ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quranic Text (Uthmani) with Authentic Highlighting */}
                  <div className="pt-1">
                    <HighlightedAyahText
                      textUthmani={item.textUthmani}
                      query={response.query}
                      matchedWords={item.matchedWords}
                      matchedWordIndices={item.matchedWordIndices}
                      matches={item.matches}
                      mode={response.mode}
                      root={item.matchedRoot}
                      matchType={matchType}
                      exactTashkeel={exactTashkeel}
                      highlightColor={highlightColor}
                    />
                  </div>

                  {/* Matched Keywords Badge */}
                  {item.matchedWords && item.matchedWords.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-500 border-t border-stone-50">
                      <span>الكلمات المميزة في الآية:</span>
                      {item.matchedWords.map((mw, i) => (
                        <span
                          key={i}
                          className={`px-1.5 py-0.5 rounded font-quran text-sm font-medium ${
                            highlightColor === 'amber'
                              ? 'bg-amber-100 text-amber-900'
                              : highlightColor === 'emerald'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {mw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination Controls */}
              {visibleCount < response.results.length && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 pb-8">
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 50, response.results.length))}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>عرض 50 آية إضافية ↓</span>
                    <span className="bg-emerald-800/80 text-emerald-100 text-xs px-2 py-0.5 rounded-md">
                      متبقي {(response.results.length - visibleCount).toLocaleString('ar-EG')}
                    </span>
                  </button>
                  {response.results.length > visibleCount + 50 && (
                    <button
                      onClick={() => setVisibleCount(response.results.length)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-stone-50 active:scale-98 text-stone-700 border border-stone-300 rounded-xl font-medium text-xs shadow-2xs transition-all cursor-pointer"
                    >
                      عرض جميع النتائج ({response.results.length.toLocaleString('ar-EG')})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contextual Quran Reading & Reflection Modal */}
      {contextModalAyah && (
        <QuranContextModal
          surahNumber={contextModalAyah.surahNumber}
          ayahNumberInSurah={contextModalAyah.ayahNumberInSurah}
          onClose={() => setContextModalAyah(null)}
          onAddAyahToCanvas={onAddAyahToCanvas}
          onAddReflectionToCanvas={onAddReflectionToCanvas}
        />
      )}
    </div>
  );
};

