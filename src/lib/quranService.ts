import {
  QuranCorpus,
  SearchMode,
  SearchResultItem,
  SurahData,
  AyahData,
  SearchResponse,
  SearchMatchSpan
} from '../types';
import {
  removeTashkeel,
  cleanWordToken,
  wordMatchesRoot,
  extractCandidateRoots,
  normalizeQuranic,
  normalizeQuranicPhonetic,
  isQuranicSign
} from './arabicUtils';
import { getRootEntry } from './quranRoots';
import { QURAN_SEMANTIC_TOPICS } from './quranSemantics';
import { registerCanonicalCorpus } from '../engine/quran/QuranAnchorValidator';

let cachedCorpus: QuranCorpus | null = null;
let isFetchingCorpus = false;
let fetchPromise: Promise<QuranCorpus> | null = null;

export interface IndexedWord {
  index: number;
  raw: string;
  clean: string;
  normStd: string;
  normSkel: string;
  normSimple: string;
  normPhonetic: string;
  isSign: boolean;
}

export interface PreIndexedAyah {
  surah: SurahData;
  ayah: AyahData;
  uWords: string[];
  words: IndexedWord[];
  normUthmaniStd: string;
  normUthmaniSkel: string;
  normSimpleStd: string;
}

let indexedAyahs: PreIndexedAyah[] | null = null;

const COMMON_ARABIC_PREFIXES = /^(ال|وال|فال|بال|ولل|فلل|كال|و|ف|ب|ل|ك)/;

/**
 * Builds deterministic, pre-indexed word coordinates for all 6,236 ayahs
 */
function buildIndexedAyahs(corpus: QuranCorpus): PreIndexedAyah[] {
  const list: PreIndexedAyah[] = [];
  for (const surah of corpus.surahs) {
    for (const ayah of surah.ayahs) {
      const uWords = ayah.textUthmani.trim().split(/\s+/);
      const sWords = ayah.textSimple.trim().split(/\s+/);
      const words: IndexedWord[] = [];

      for (let i = 0; i < uWords.length; i++) {
        const raw = uWords[i];
        const sWord = sWords[i] || removeTashkeel(raw);
        const isSign = isQuranicSign(raw);
        words.push({
          index: i,
          raw,
          clean: cleanWordToken(raw || sWord),
          normStd: normalizeQuranic(raw, true),
          normSkel: normalizeQuranic(raw, false),
          normSimple: normalizeQuranic(sWord, true),
          normPhonetic: normalizeQuranicPhonetic(raw),
          isSign
        });
      }

      list.push({
        surah,
        ayah,
        uWords,
        words,
        normUthmaniStd: normalizeQuranic(ayah.textUthmani, true),
        normUthmaniSkel: normalizeQuranic(ayah.textUthmani, false),
        normSimpleStd: normalizeQuranic(ayah.textSimple, true)
      });
    }
  }
  return list;
}

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

  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', 'quran-data.json');
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data: QuranCorpus = JSON.parse(raw);
      cachedCorpus = data;
      registerCanonicalCorpus(data);
      if (!indexedAyahs) {
        indexedAyahs = buildIndexedAyahs(data);
      }
      return data;
    } catch (e) {
      console.error('Failed to load local file in node environment:', e);
    }
  }

  isFetchingCorpus = true;
  fetchPromise = fetch('/quran-data.json')
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to load Quran data: ${res.statusText}`);
      }
      const data: QuranCorpus = await res.json();
      cachedCorpus = data;
      registerCanonicalCorpus(data);

      if (!indexedAyahs) {
        indexedAyahs = buildIndexedAyahs(data);
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
 * Ultra-fast, deterministic Quranic Search Engine
 * Produces exact match spans and word coordinates (wordIndex) for seamless Uthmani highlighting
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
    indexedAyahs = buildIndexedAyahs(corpus);
  }

  const results: SearchResultItem[] = [];
  const matchingSurahIds = new Set<number>();
  const itemsToSearch = indexedAyahs || [];

  // ====================================================
  // 1. ROOT SEARCH MODE (البحث بالجذر القرآني)
  // ====================================================
  if (mode === 'root') {
    const cleanQueryToken = cleanWordToken(trimmedQuery);
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

    for (const item of itemsToSearch) {
      const { surah, ayah, words } = item;
      if (selectedSurahNumber && surah.number !== selectedSurahNumber) continue;
      if (revelationType !== 'all' && surah.revelationType !== revelationType) continue;
      if (juzNumber && ayah.juz !== juzNumber) continue;

      const matchedWordIndices: number[] = [];
      const matchedWords: string[] = [];
      const matches: SearchMatchSpan[] = [];

      for (const w of words) {
        if (w.isSign) continue;
        if (wordMatchesRoot(w.clean, rootToSearch)) {
          matchedWordIndices.push(w.index);
          matchedWords.push(w.raw);
          matches.push({
            wordIndex: w.index,
            matchType: 'root',
            matchedText: w.raw,
            query: rootToSearch,
            normalizedMatch: w.clean
          });
        }
      }

      if (matchedWordIndices.length > 0) {
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
          matchedWords: Array.from(new Set(matchedWords)),
          matchedWordIndices,
          matches
        });
      }
    }

    return {
      query: trimmedQuery,
      mode,
      totalMatches: results.length,
      surahsCount: matchingSurahIds.size,
      results: results.slice(0, limit),
      matchedRootInfo: rootInfo
        ? {
            root: rootInfo.root,
            description: rootInfo.description,
            primaryDerivatives: rootInfo.primaryDerivatives
          }
        : undefined
    };
  }

  // ====================================================
  // 2. SEMANTIC / THEMATIC SEARCH MODE (البحث الموضوعي/الدلالي الموجه)
  // ====================================================
  if (mode === 'semantic') {
    const matchedTopics = QURAN_SEMANTIC_TOPICS.filter(
      (t) =>
        t.title.includes(trimmedQuery) ||
        t.keywords.some((k) => k.includes(trimmedQuery) || trimmedQuery.includes(k)) ||
        t.description.includes(trimmedQuery)
    );

    const primaryTopic = matchedTopics[0];
    const targetKeywords = primaryTopic
      ? Array.from(new Set([trimmedQuery, ...primaryTopic.keywords]))
      : [trimmedQuery];

    const targetKeywordsNormalized = targetKeywords.map((kw) => ({
      raw: kw,
      normStd: normalizeQuranic(kw, true),
      clean: cleanWordToken(kw)
    }));

    for (const item of itemsToSearch) {
      const { surah, ayah, words } = item;
      if (selectedSurahNumber && surah.number !== selectedSurahNumber) continue;
      if (revelationType !== 'all' && surah.revelationType !== revelationType) continue;
      if (juzNumber && ayah.juz !== juzNumber) continue;

      const matchedWordIndices: number[] = [];
      const matchedWords: string[] = [];
      const matches: SearchMatchSpan[] = [];

      for (const kwObj of targetKeywordsNormalized) {
        for (const w of words) {
          if (w.isSign) continue;
          if (
            w.normStd.includes(kwObj.normStd) ||
            w.normSimple.includes(kwObj.normStd) ||
            w.clean.includes(kwObj.clean)
          ) {
            if (!matchedWordIndices.includes(w.index)) {
              matchedWordIndices.push(w.index);
              matchedWords.push(w.raw);
              matches.push({
                wordIndex: w.index,
                matchType: 'semantic',
                matchedText: w.raw,
                query: kwObj.raw,
                normalizedMatch: w.normStd
              });
            }
          }
        }
      }

      const isCurated = primaryTopic?.sampleAyahs.some(
        (sa) => sa.surahNumber === surah.number && sa.ayahNumber === ayah.numberInSurah
      );

      if (matchedWordIndices.length > 0 || isCurated) {
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
          matchedWords: Array.from(new Set(matchedWords)),
          matchedWordIndices,
          matches,
          semanticTopic: primaryTopic ? primaryTopic.title : undefined
        });
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
      matchedSemanticTopic: primaryTopic
        ? {
            title: primaryTopic.title,
            description: primaryTopic.description
          }
        : undefined
    };
  }

  // ====================================================
  // 3. LITERAL & PHRASE SEARCH MODE (البحث الحرفي واللفظي الدقيق)
  // ====================================================
  const qTokens = trimmedQuery.split(/\s+/).filter(Boolean);

  for (const item of itemsToSearch) {
    const { surah, ayah, words } = item;

    if (selectedSurahNumber && surah.number !== selectedSurahNumber) continue;
    if (revelationType !== 'all' && surah.revelationType !== revelationType) continue;
    if (juzNumber && ayah.juz !== juzNumber) continue;

    const matchedWordIndices: number[] = [];
    const matchedWords: string[] = [];
    const matches: SearchMatchSpan[] = [];

    // Case 3.1: Exact Tashkeel Matching
    if (exactTashkeel) {
      if (ayah.textUthmani.includes(trimmedQuery)) {
        for (const w of words) {
          if (w.raw.includes(trimmedQuery)) {
            matchedWordIndices.push(w.index);
            matchedWords.push(w.raw);
            matches.push({
              wordIndex: w.index,
              matchType: 'exact',
              matchedText: w.raw,
              query: trimmedQuery
            });
          }
        }
      }
    }
    // Case 3.2: Single Word Literal Matching
    else if (qTokens.length === 1) {
      const qStd = normalizeQuranic(trimmedQuery, true);
      const qSkel = normalizeQuranic(trimmedQuery, false);
      const qPhon = qStd.length >= 3 ? normalizeQuranicPhonetic(trimmedQuery) : '';
      const cleanQ = cleanWordToken(trimmedQuery);

      for (const w of words) {
        if (w.isSign) continue;
        let matchTypeFound: SearchMatchSpan['matchType'] | null = null;

        if (matchType === 'whole') {
          // Whole word matching
          if (
            w.normStd === qStd ||
            w.normSimple === qStd ||
            (qSkel && w.normSkel === qSkel) ||
            w.clean === cleanQ
          ) {
            matchTypeFound = 'whole';
          } else {
            // Check matching with attached prefixes stripped (ال، و، ف، ب، ل، ك)
            const wStem = w.normStd.replace(COMMON_ARABIC_PREFIXES, '');
            const qStem = qStd.replace(COMMON_ARABIC_PREFIXES, '');
            if (
              wStem &&
              qStem &&
              (wStem === qStem || wStem === qStd || w.normStd === qStem)
            ) {
              matchTypeFound = 'whole';
            }
          }
        } else {
          // Substring / Contains matching
          if (
            w.normStd.startsWith(qStd) ||
            w.normSimple.startsWith(qStd) ||
            (qSkel && w.normSkel.startsWith(qSkel))
          ) {
            matchTypeFound = 'prefix';
          } else if (
            w.normStd.endsWith(qStd) ||
            w.normSimple.endsWith(qStd) ||
            (qSkel && w.normSkel.endsWith(qSkel))
          ) {
            matchTypeFound = 'suffix';
          } else if (
            w.normStd.includes(qStd) ||
            w.normSimple.includes(qStd) ||
            (qSkel && w.normSkel.includes(qSkel))
          ) {
            matchTypeFound = 'substring';
          } else if (qPhon && w.normPhonetic.includes(qPhon)) {
            matchTypeFound = 'substring';
          }
        }

        if (matchTypeFound) {
          matchedWordIndices.push(w.index);
          matchedWords.push(w.raw);
          matches.push({
            wordIndex: w.index,
            matchType: matchTypeFound,
            matchedText: w.raw,
            query: trimmedQuery,
            normalizedMatch: w.normStd
          });
        }
      }
    }
    // Case 3.3: Multi-Word Phrase Matching (Sequential alignment)
    else {
      const tokenSpecs = qTokens.map((qt) => ({
        raw: qt,
        std: normalizeQuranic(qt, true),
        skel: normalizeQuranic(qt, false),
        clean: cleanWordToken(qt)
      }));

      const nonSignWords = words.filter((w) => !w.isSign);
      const phraseLength = tokenSpecs.length;

      for (let i = 0; i <= nonSignWords.length - phraseLength; i++) {
        let isSequenceMatch = true;

        for (let j = 0; j < phraseLength; j++) {
          const w = nonSignWords[i + j];
          const spec = tokenSpecs[j];

          let tokenMatches = false;
          if (matchType === 'whole') {
            if (
              w.normStd === spec.std ||
              w.normSimple === spec.std ||
              (spec.skel && w.normSkel === spec.skel) ||
              w.clean === spec.clean
            ) {
              tokenMatches = true;
            } else {
              const wStem = w.normStd.replace(COMMON_ARABIC_PREFIXES, '');
              const sStem = spec.std.replace(COMMON_ARABIC_PREFIXES, '');
              if (wStem && sStem && (wStem === sStem || wStem === spec.std || w.normStd === sStem)) {
                tokenMatches = true;
              }
            }
          } else {
            if (
              w.normStd.includes(spec.std) ||
              w.normSimple.includes(spec.std) ||
              (spec.skel && w.normSkel.includes(spec.skel)) ||
              w.clean.includes(spec.clean)
            ) {
              tokenMatches = true;
            }
          }

          if (!tokenMatches) {
            isSequenceMatch = false;
            break;
          }
        }

        if (isSequenceMatch) {
          for (let j = 0; j < phraseLength; j++) {
            const w = nonSignWords[i + j];
            if (!matchedWordIndices.includes(w.index)) {
              matchedWordIndices.push(w.index);
              matchedWords.push(w.raw);
              matches.push({
                wordIndex: w.index,
                matchType: 'phrase',
                matchedText: w.raw,
                query: tokenSpecs[j].raw,
                normalizedMatch: w.normStd
              });
            }
          }
        }
      }
    }

    // Include ayah if and only if valid word matches occurred
    if (matchedWordIndices.length > 0) {
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
        matchedWords: Array.from(new Set(matchedWords)),
        matchedWordIndices,
        matches
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
export function getOverallAyahNumber(
  surahNumber: number,
  ayahNumberInSurah: number
): number | undefined {
  if (!cachedCorpus) return undefined;
  const surah = cachedCorpus.surahs.find((s) => s.number === surahNumber);
  const ayah = surah?.ayahs.find((a) => a.numberInSurah === ayahNumberInSurah);
  return ayah?.number;
}

export interface AyahContextData {
  surah: SurahData;
  targetAyah: AyahData;
  previousAyahs: AyahData[];
  nextAyahs: AyahData[];
}

/**
 * Returns the contextual neighborhood for an Ayah within its Surah
 */
export async function getAyahContext(
  surahNumber: number,
  ayahNumberInSurah: number,
  contextWindow = 2
): Promise<AyahContextData | null> {
  const corpus = await loadQuranCorpus();
  const surah = corpus.surahs.find((s) => s.number === surahNumber);
  if (!surah) return null;

  const targetIdx = surah.ayahs.findIndex((a) => a.numberInSurah === ayahNumberInSurah);
  if (targetIdx === -1) return null;

  const targetAyah = surah.ayahs[targetIdx];
  const startIdx = Math.max(0, targetIdx - contextWindow);
  const endIdx = Math.min(surah.ayahs.length, targetIdx + contextWindow + 1);

  const previousAyahs = surah.ayahs.slice(startIdx, targetIdx);
  const nextAyahs = surah.ayahs.slice(targetIdx + 1, endIdx);

  return {
    surah,
    targetAyah,
    previousAyahs,
    nextAyahs
  };
}
