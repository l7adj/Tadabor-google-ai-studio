import { QuranCorpus, SearchMode, SearchResultItem, SurahData, AyahData, SearchResponse } from '../types';
import {
  normalizeArabic,
  removeTashkeel,
  cleanWordToken,
  wordMatchesRoot,
  extractCandidateRoots,
  normalizeQuranic,
  wordMatchesQuery,
  isQuranicSign
} from './arabicUtils';
import { getRootEntry } from './quranRoots';
import { QURAN_SEMANTIC_TOPICS } from './quranSemantics';

let cachedCorpus: QuranCorpus | null = null;
let isFetchingCorpus = false;
let fetchPromise: Promise<QuranCorpus> | null = null;

export interface PreIndexedAyah {
  surah: SurahData;
  ayah: AyahData;
  uWords: string[];
  normUthmaniStd: string;
  normUthmaniSkel: string;
  normSimpleStd: string;
}

let indexedAyahs: PreIndexedAyah[] | null = null;

/**
 * Load the complete Quran corpus (114 surahs) and build search index
 */
export async function loadQuranCorpus(): Promise<QuranCorpus> {
  if (cachedCorpus) {
    return cachedCorpus;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  isFetchingCorpus = true;
  fetchPromise = fetch('/quran-data.json')
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to load Quran data: ${res.statusText}`);
      }
      const data: QuranCorpus = await res.json();
      cachedCorpus = data;

      // Build ultra-fast search index for all 6,236 ayahs
      if (!indexedAyahs) {
        const list: PreIndexedAyah[] = [];
        for (const surah of data.surahs) {
          for (const ayah of surah.ayahs) {
            list.push({
              surah,
              ayah,
              uWords: ayah.textUthmani.split(/\s+/),
              normUthmaniStd: normalizeQuranic(ayah.textUthmani, true),
              normUthmaniSkel: normalizeQuranic(ayah.textUthmani, false),
              normSimpleStd: normalizeQuranic(ayah.textSimple, true)
            });
          }
        }
        indexedAyahs = list;
      }

      isFetchingCorpus = false;
      return data;
    })
    .catch((err) => {
      isFetchingCorpus = false;
      fetchPromise = null;
      console.error('Error loading Quran corpus:', err);
      throw err;
    });

  return fetchPromise;
}

/**
 * Fast lookup for a single ayah
 */
export function getAyahFromCorpus(
  corpus: QuranCorpus,
  surahNumber: number,
  ayahNumberInSurah: number
): { surah: SurahData; ayah: AyahData } | null {
  const surah = corpus.surahs.find((s) => s.number === surahNumber);
  if (!surah) return null;
  const ayah = surah.ayahs.find((a) => a.numberInSurah === ayahNumberInSurah);
  if (!ayah) return null;
  return { surah, ayah };
}

export interface SearchOptions {
  mode: SearchMode;
  query: string;
  selectedSurahNumber?: number;
  juzNumber?: number;
  revelationType?: 'all' | 'Meccan' | 'Medinan';
  exactTashkeel?: boolean;
  matchType?: 'whole' | 'contains';
  limit?: number;
}

/**
 * Ultra-fast, comprehensive Quranic Search Engine
 */
export async function searchQuran(options: SearchOptions): Promise<SearchResponse> {
  const {
    mode,
    query,
    selectedSurahNumber,
    juzNumber,
    revelationType = 'all',
    exactTashkeel = false,
    matchType = 'contains',
    limit = 80
  } = options;

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      query: '',
      mode,
      totalMatches: 0,
      surahsCount: 0,
      results: []
    };
  }

  const corpus = await loadQuranCorpus();

  if (!indexedAyahs || indexedAyahs.length === 0) {
    const list: PreIndexedAyah[] = [];
    for (const surah of corpus.surahs) {
      for (const ayah of surah.ayahs) {
        list.push({
          surah,
          ayah,
          uWords: ayah.textUthmani.split(/\s+/),
          normUthmaniStd: normalizeQuranic(ayah.textUthmani, true),
          normUthmaniSkel: normalizeQuranic(ayah.textUthmani, false),
          normSimpleStd: normalizeQuranic(ayah.textSimple, true)
        });
      }
    }
    indexedAyahs = list;
  }

  const results: SearchResultItem[] = [];
  const matchingSurahIds = new Set<number>();

  const cleanQueryToken = cleanWordToken(trimmedQuery);

  // ----------------------------------------------------
  // 1. ROOT SEARCH MODE (البحث بالجذر)
  // ----------------------------------------------------
  if (mode === 'root') {
    let targetRoot = cleanQueryToken;
    let rootInfo = getRootEntry(targetRoot);

    if (!rootInfo) {
      const candidates = extractCandidateRoots(trimmedQuery);
      for (const cand of candidates) {
        const found = getRootEntry(cand);
        if (found) {
          rootInfo = found;
          targetRoot = cand;
          break;
        }
      }
    }

    const rootToSearch = targetRoot;

    for (const surah of corpus.surahs) {
      if (selectedSurahNumber && surah.number !== selectedSurahNumber) continue;
      if (revelationType !== 'all' && surah.revelationType !== revelationType) continue;

      for (const ayah of surah.ayahs) {
        if (juzNumber && ayah.juz !== juzNumber) continue;

        const uWords = ayah.textUthmani.split(/\s+/);
        const matchingWordsInAyah: string[] = [];

        for (const w of uWords) {
          if (isQuranicSign(w)) continue;
          const cleanW = cleanWordToken(w);
          if (wordMatchesRoot(cleanW, rootToSearch)) {
            matchingWordsInAyah.push(w);
          }
        }

        if (matchingWordsInAyah.length > 0) {
          matchingSurahIds.add(surah.number);
          results.push({
            surahNumber: surah.number,
            surahName: surah.name,
            revelationType: surah.revelationType,
            ayahNumberInSurah: ayah.numberInSurah,
            overallAyahNumber: ayah.number,
            juz: ayah.juz,
            page: ayah.page,
            textUthmani: ayah.textUthmani,
            textSimple: ayah.textSimple,
            matchedRoot: rootToSearch,
            matchedWords: Array.from(new Set(matchingWordsInAyah))
          });
        }
      }
    }

    return {
      query: trimmedQuery,
      mode,
      totalMatches: results.length,
      surahsCount: matchingSurahIds.size,
      results: results.slice(0, limit),
      matchedRootInfo: rootInfo ? {
        root: rootInfo.root,
        description: rootInfo.description,
        primaryDerivatives: rootInfo.primaryDerivatives
      } : undefined
    };
  }

  // ----------------------------------------------------
  // 2. SEMANTIC / THEMATIC SEARCH MODE (البحث بالمعنى والموضوع)
  // ----------------------------------------------------
  if (mode === 'semantic') {
    const matchedTopics = QURAN_SEMANTIC_TOPICS.filter((t) =>
      t.title.includes(trimmedQuery) ||
      t.keywords.some((k) => k.includes(trimmedQuery) || trimmedQuery.includes(k)) ||
      t.description.includes(trimmedQuery)
    );

    const primaryTopic = matchedTopics[0];
    const targetKeywords = primaryTopic
      ? Array.from(new Set([trimmedQuery, ...primaryTopic.keywords]))
      : [trimmedQuery];

    for (const surah of corpus.surahs) {
      if (selectedSurahNumber && surah.number !== selectedSurahNumber) continue;
      if (revelationType !== 'all' && surah.revelationType !== revelationType) continue;

      for (const ayah of surah.ayahs) {
        if (juzNumber && ayah.juz !== juzNumber) continue;

        const uWords = ayah.textUthmani.split(/\s+/);
        const matchedKw: string[] = [];

        for (const kw of targetKeywords) {
          for (const w of uWords) {
            if (isQuranicSign(w)) continue;
            if (wordMatchesQuery(w, kw, 'contains')) {
              matchedKw.push(w);
            }
          }
        }

        const isCurated = primaryTopic?.sampleAyahs.some(
          (sa) => sa.surahNumber === surah.number && sa.ayahNumber === ayah.numberInSurah
        );

        if (matchedKw.length > 0 || isCurated) {
          matchingSurahIds.add(surah.number);
          results.push({
            surahNumber: surah.number,
            surahName: surah.name,
            revelationType: surah.revelationType,
            ayahNumberInSurah: ayah.numberInSurah,
            overallAyahNumber: ayah.number,
            juz: ayah.juz,
            page: ayah.page,
            textUthmani: ayah.textUthmani,
            textSimple: ayah.textSimple,
            matchedWords: Array.from(new Set(matchedKw)),
            semanticTopic: primaryTopic ? primaryTopic.title : undefined
          });
        }
      }
    }

    if (primaryTopic) {
      results.sort((a, b) => {
        const aCurated = primaryTopic.sampleAyahs.some(
          (sa) => sa.surahNumber === a.surahNumber && sa.ayahNumber === a.ayahNumberInSurah
        );
        const bCurated = primaryTopic.sampleAyahs.some(
          (sa) => sa.surahNumber === b.surahNumber && sa.ayahNumber === b.ayahNumberInSurah
        );
        if (aCurated && !bCurated) return -1;
        if (!aCurated && bCurated) return 1;
        return 0;
      });
    }

    return {
      query: trimmedQuery,
      mode,
      totalMatches: results.length,
      surahsCount: matchingSurahIds.size,
      results: results.slice(0, limit),
      matchedSemanticTopic: primaryTopic ? {
        title: primaryTopic.title,
        description: primaryTopic.description
      } : undefined
    };
  }

  // ----------------------------------------------------
  // 3. LITERAL / PHRASE SEARCH MODE (البحث الحرفي واللفظي الدقيق)
  // ----------------------------------------------------
  const qTokens = trimmedQuery.split(/\s+/).filter(Boolean);
  const qStd = normalizeQuranic(trimmedQuery, true);
  const qSkel = normalizeQuranic(trimmedQuery, false);

  const itemsToSearch = indexedAyahs || [];

  for (const item of itemsToSearch) {
    const { surah, ayah, uWords } = item;

    if (selectedSurahNumber && surah.number !== selectedSurahNumber) continue;
    if (revelationType !== 'all' && surah.revelationType !== revelationType) continue;
    if (juzNumber && ayah.juz !== juzNumber) continue;

    const matchedWords: string[] = [];

    if (exactTashkeel) {
      if (ayah.textUthmani.includes(trimmedQuery)) {
        for (const w of uWords) {
          if (w.includes(trimmedQuery)) {
            matchedWords.push(w);
          }
        }
        if (matchedWords.length === 0) matchedWords.push(trimmedQuery);
      }
    } else if (matchType === 'contains') {
      // High-precision containment: check both full verse representations
      const isAyahMatch =
        item.normUthmaniStd.includes(qStd) ||
        item.normSimpleStd.includes(qStd) ||
        (qSkel && item.normUthmaniSkel.includes(qSkel));

      if (isAyahMatch) {
        for (const w of uWords) {
          if (isQuranicSign(w)) continue;
          for (const qt of qTokens) {
            if (wordMatchesQuery(w, qt, 'contains')) {
              matchedWords.push(w);
              break;
            }
          }
        }
        // Fallback if matching words were not individually tagged
        if (matchedWords.length === 0 && uWords.length > 0) {
          for (const w of uWords) {
            if (isQuranicSign(w)) continue;
            const wNorm = normalizeQuranic(w, true);
            if (qStd.split('').some((ch) => wNorm.includes(ch))) {
              matchedWords.push(w);
            }
          }
        }
      }
    } else {
      // Whole word matching
      if (qTokens.length === 1) {
        for (const w of uWords) {
          if (isQuranicSign(w)) continue;
          if (wordMatchesQuery(w, qTokens[0], 'whole')) {
            matchedWords.push(w);
          }
        }
      } else {
        // Multi-word exact sequence
        let tIdx = 0;
        const currentRun: string[] = [];
        for (const w of uWords) {
          if (isQuranicSign(w)) continue;
          if (tIdx < qTokens.length && wordMatchesQuery(w, qTokens[tIdx], 'whole')) {
            currentRun.push(w);
            tIdx++;
          } else if (tIdx > 0 && tIdx < qTokens.length) {
            if (wordMatchesQuery(w, qTokens[0], 'whole')) {
              currentRun.length = 0;
              currentRun.push(w);
              tIdx = 1;
            } else {
              currentRun.length = 0;
              tIdx = 0;
            }
          }
          if (tIdx === qTokens.length) {
            matchedWords.push(...currentRun);
            currentRun.length = 0;
            tIdx = 0;
          }
        }
      }
    }

    if (matchedWords.length > 0) {
      matchingSurahIds.add(surah.number);
      results.push({
        surahNumber: surah.number,
        surahName: surah.name,
        revelationType: surah.revelationType,
        ayahNumberInSurah: ayah.numberInSurah,
        overallAyahNumber: ayah.number,
        juz: ayah.juz,
        page: ayah.page,
        textUthmani: ayah.textUthmani,
        textSimple: ayah.textSimple,
        matchedWords: Array.from(new Set(matchedWords))
      });
    }
  }

  return {
    query: trimmedQuery,
    mode,
    totalMatches: results.length,
    surahsCount: matchingSurahIds.size,
    results: limit ? results.slice(0, limit) : results
  };
}

/**
 * Get overall ayah number (1-6236) by surah number and ayah number in surah
 */
export function getOverallAyahNumber(surahNumber: number, ayahNumberInSurah: number): number | undefined {
  if (!cachedCorpus) return undefined;
  const surah = cachedCorpus.surahs.find((s) => s.number === surahNumber);
  const ayah = surah?.ayahs.find((a) => a.numberInSurah === ayahNumberInSurah);
  return ayah?.number;
}
