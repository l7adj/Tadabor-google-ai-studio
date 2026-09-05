/**
 * Arabic linguistic processing utilities for Quranic research
 * Designed for accurate Uthmani Hafs matching and highlight extraction
 */

// Regular expressions for Arabic diacritics
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL_REGEX = /\u0640/g;

/**
 * Check if a token is a Quranic pause mark, section symbol, or non-word sign
 */
export function isQuranicSign(token: string): boolean {
  if (!token) return false;
  const clean = token.trim();
  return /^[۞۩ۖۗۚۛۜ۝۟۠]*$/.test(clean) || clean === '۞' || clean === 'ۖ' || clean === 'ۗ' || clean === 'ۚ' || clean === 'ۛ' || clean === 'ۜ';
}

/**
 * Remove all diacritical marks (Tashkeel) from Arabic text
 */
export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text
    .replace(TASHKEEL_REGEX, '')
    .replace(TATWEEL_REGEX, '')
    .replace(/\u0671/g, 'ا') // Wasla to bare alif
    .replace(/\u200C|\u200D|\u200E|\u200F|\uFEFF/g, ''); // Zero-width spaces & bidi marks
}

/**
 * Normalizes Arabic text for flexible literal matching
 * Normalizes variations of Alif, Ya, Ta Marbuta, and strips tashkeel.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  let normalized = removeTashkeel(text);

  // Normalize Alif variations
  normalized = normalized
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Ya and Alif Maqsura
    .replace(/ى/g, 'ي')
    // Normalize Ta Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Hamza forms
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Trim and normalize multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

/**
 * Highly accurate Quranic orthography normalization for Uthmani script matching
 * Properly handles:
 * - Waw with dagger alef (وٰ): pronounced as Alif (e.g. ٱلصَّلَوٰةَ -> الصلاة, ٱلزَّكَوٰةَ -> الزكاة, ٱلۡحَيَوٰةُ -> الحياة)
 * - Dagger alef (\u0670): expands to 'ا' in standard mode (إِبۡرَٰهِـۧمَ -> ابراهيم, ٱلرَّحۡمَٰنِ -> الرحمان/الرحمن)
 * - Small yeh (\u06E6, \u06E7): maps to 'ي' (إِبۡرَٰهِـۧمَ -> ابراهيم)
 * - Small waw (\u06E5): maps to 'و' (دَاوُۥدَ -> داوود/داود)
 * - Alif Maqsura + dagger alef (\u0649\u0670): maps to 'ي' (ٱبۡتَلَىٰٓ -> ابتلي, مُوسَىٰ -> موسي)
 * - Alef Wasla (\u0671): maps to 'ا'
 * 
 * When expandElided is false (bare Uthmani skeleton):
 * - Dagger alefs are omitted, keeping the consonantal skeleton (e.g. صلوه, ابرهم, سموت, داود)
 */
export function normalizeQuranic(text: string, expandElided: boolean = true): string {
  if (!text) return '';
  let s = text;

  if (expandElided) {
    // Waw with dagger alef represents an Alif (الصلاة، الزكاة، الحياة، الربا، الغداة)
    s = s.replace(/و\u0670/g, 'ا');
    // Alif Maqsura with dagger alef represents Alif / Yaa
    s = s.replace(/ى\u0670/g, 'ي');
    // Connecting small yaa (e.g. Ibrahim in Baqarah)
    s = s.replace(/ـ?[\u06E6\u06E7]/g, 'ي');
    // Connecting small waw (e.g. Dawud)
    s = s.replace(/\u06E5/g, 'و');
    // Dagger alef
    s = s.replace(/\u0670/g, 'ا');
  } else {
    // Bare skeleton: omit dagger alef and small additions
    s = s
      .replace(/\u0670/g, '')
      .replace(/ـ?[\u06E6\u06E7]/g, '')
      .replace(/\u06E5/g, '');
  }

  // Handle Alef Wasla
  s = s.replace(/\u0671/g, 'ا');

  // Remove pause marks and Quranic symbols
  s = s.replace(/[\u06D6-\u06ED\u06DE\u06E9]/g, '');

  // Remove standard diacritics
  s = s.replace(/[\u064B-\u065F]/g, '');

  // Remove tatweel
  s = s.replace(/\u0640/g, '');

  // Normalize Alefs
  s = s.replace(/[أإآٱ]/g, 'ا');

  // Normalize Yaa / Alif Maqsura
  s = s.replace(/ى/g, 'ي');

  // Normalize Ta Marbuta
  s = s.replace(/ة/g, 'ه');

  // Normalize Hamza chairs
  s = s.replace(/ؤ/g, 'و');
  s = s.replace(/ئ/g, 'ي');
  s = s.replace(/ء/g, '');

  // Remove punctuation
  s = s.replace(/[.,،؛:؟!()[\]{}"'«»—\-]/g, '');
  s = s.replace(/\s+/g, ' ');

  return s.trim();
}

/**
 * Phonetic / terminal unification:
 * - Maps ending 'ي' to 'ا' so that 'موسا' matches 'موسى' and 'علا' matches 'على'
 * - Maps ending 'ه' to 'ت' so open taa 'رحمت' matches 'رحمة'
 */
export function normalizeQuranicPhonetic(text: string): string {
  if (!text) return '';
  return normalizeQuranic(text, true)
    .replace(/ي$/g, 'ا')
    .replace(/ه$/g, 'ت');
}

const COMMON_ARABIC_PREFIXES = /^(ال|وال|فال|بال|ولل|فلل|كال|و|ف|ب|ل|ك)/;

/**
 * Checks whether a single Uthmani Quranic word matches a user query token
 * Supports both modern standard spelling, bare Uthmani skeleton, and phonetic matching.
 */
export function wordMatchesQuery(
  wordUthmani: string,
  queryToken: string,
  matchType: 'whole' | 'contains' | string = 'contains'
): boolean {
  if (!wordUthmani || !queryToken) return false;
  if (isQuranicSign(wordUthmani)) return false;

  const qStd = normalizeQuranic(queryToken, true);
  const qSkel = normalizeQuranic(queryToken, false);
  if (!qStd && !qSkel) return false;

  const uStd = normalizeQuranic(wordUthmani, true);
  const uSkel = normalizeQuranic(wordUthmani, false);

  if (matchType === 'whole') {
    // Exact full match in either standard or skeleton representation
    if (uStd === qStd || uSkel === qStd || (qSkel && (uStd === qSkel || uSkel === qSkel))) {
      return true;
    }

    // Match with common Arabic attached prefixes stripped (ال، و، ف، ب، ل، ك)
    const uStdStem = uStd.replace(COMMON_ARABIC_PREFIXES, '');
    const qStdStem = qStd.replace(COMMON_ARABIC_PREFIXES, '');
    if (uStdStem && qStdStem && (uStdStem === qStdStem || uStdStem === qStd || uStd === qStdStem)) {
      return true;
    }

    const uSkelStem = uSkel.replace(COMMON_ARABIC_PREFIXES, '');
    const qSkelStem = qSkel ? qSkel.replace(COMMON_ARABIC_PREFIXES, '') : '';
    if (qSkelStem && (uSkelStem === qSkelStem || uSkelStem === qStd || uStd === qSkelStem)) {
      return true;
    }

    // Terminal phonetic equivalence (e.g. موسا == موسى, رحمت == رحمة)
    if (normalizeQuranicPhonetic(wordUthmani) === normalizeQuranicPhonetic(queryToken)) {
      return true;
    }

    return false;
  }

  // 'contains' mode: Substring, prefix, suffix, root letters, or single letter match
  if (uStd.includes(qStd)) return true;
  if (uSkel.includes(qStd)) return true;
  if (qSkel && (uStd.includes(qSkel) || uSkel.includes(qSkel))) return true;

  // Phonetic containment if query is at least 3 characters
  if (qStd.length >= 3) {
    const qPhon = normalizeQuranicPhonetic(queryToken);
    if (normalizeQuranicPhonetic(wordUthmani).includes(qPhon)) {
      return true;
    }
  }

  return false;
}

/**
 * Clean token for root / word comparison
 */
export function cleanWordToken(word: string): string {
  return normalizeQuranic(word, true).replace(/[.,،؛:؟!()[\]{}"'«»—\-]/g, '');
}

/**
 * Extracts words from an ayah while keeping both Uthmani and Simple forms aligned
 */
export function extractAyahWords(textUthmani: string, textSimple: string): Array<{
  index: number;
  uthmani: string;
  simple: string;
  normalized: string;
}> {
  const uthmaniWords = textUthmani.trim().split(/\s+/);
  const simpleWords = textSimple.trim().split(/\s+/);

  const count = Math.max(uthmaniWords.length, simpleWords.length);
  const result: Array<{ index: number; uthmani: string; simple: string; normalized: string }> = [];

  for (let i = 0; i < count; i++) {
    const uWord = uthmaniWords[i] || '';
    const sWord = simpleWords[i] || removeTashkeel(uWord);
    result.push({
      index: i,
      uthmani: uWord,
      simple: sWord,
      normalized: cleanWordToken(uWord || sWord)
    });
  }

  return result;
}

/**
 * Extracts Arabic letters from a Uthmani word for character-level designation and linking
 */
export function extractWordLetters(wordUthmani: string): Array<{
  charIndex: number;
  letter: string;
  displayWithMarks: string;
}> {
  if (!wordUthmani) return [];
  const chars = Array.from(wordUthmani);
  const result: Array<{ charIndex: number; letter: string; displayWithMarks: string }> = [];

  let currentChunk = '';
  let currentBase = '';
  let charIdx = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    // Check if character is a Quranic mark or diacritic
    const isMark = /[\u064B-\u065F\u0670\u06D6-\u06ED\u06E5-\u06E8\u06DF-\u06E4]/.test(ch);

    if (!isMark) {
      if (currentBase) {
        result.push({
          charIndex: charIdx++,
          letter: currentBase,
          displayWithMarks: currentChunk
        });
      }
      currentBase = ch;
      currentChunk = ch;
    } else {
      currentChunk += ch;
    }
  }

  if (currentBase) {
    result.push({
      charIndex: charIdx,
      letter: currentBase,
      displayWithMarks: currentChunk
    });
  }

  return result;
}

/**
 * Standard Arabic Affix Stripping (Prefixes & Suffixes) to detect candidate root
 */
const COMMON_PREFIXES = [
  'كال', 'فال', 'بال', 'وال', 'ولل', 'فلل',
  'ال', 'لل', 'فس', 'وس', 'وب', 'وك', 'ول', 'وف',
  'ف', 'و', 'ب', 'ك', 'ل', 'س', 'ي', 'ت', 'ن', 'ا', 'م'
];

const COMMON_SUFFIXES = [
  'تموهما', 'تموهن', 'تموهم', 'ناهما', 'ناهم', 'ناهن', 'هما', 'هن', 'هم',
  'تما', 'تم', 'تن', 'كما', 'كم', 'كن',
  'ونا', 'ينها', 'ينهم', 'اتها', 'اتهم',
  'ون', 'ين', 'ان', 'ات', 'وا', 'تا', 'نا',
  'ها', 'هو', 'هي', 'ني', 'تي', 'كم',
  'ه', 'ي', 'ك', 'ت', 'ا', 'ة'
];

/**
 * Extract possible 3-letter or 4-letter root candidates from an Arabic word
 */
export function extractCandidateRoots(word: string): string[] {
  const clean = cleanWordToken(word);
  if (!clean || clean.length < 3) return clean ? [clean] : [];

  const candidates = new Set<string>();

  // If already 3 letters, that's a prime candidate
  if (clean.length === 3) {
    candidates.add(clean);
  }

  let stem = clean;

  // Try removing definite article 'ال'
  if (stem.startsWith('ال') && stem.length > 4) {
    stem = stem.slice(2);
    if (stem.length === 3) candidates.add(stem);
  }

  // Iterative stripping of prefix
  for (const p of COMMON_PREFIXES) {
    if (stem.startsWith(p) && stem.length - p.length >= 3) {
      const stripped = stem.slice(p.length);
      if (stripped.length === 3) candidates.add(stripped);
      for (const s of COMMON_SUFFIXES) {
        if (stripped.endsWith(s) && stripped.length - s.length >= 3) {
          const bothStripped = stripped.slice(0, stripped.length - s.length);
          if (bothStripped.length === 3 || bothStripped.length === 4) {
            candidates.add(bothStripped);
          }
        }
      }
    }
  }

  // Iterative stripping of suffix only
  for (const s of COMMON_SUFFIXES) {
    if (stem.endsWith(s) && stem.length - s.length >= 3) {
      const stripped = stem.slice(0, stem.length - s.length);
      if (stripped.length === 3) candidates.add(stripped);
    }
  }

  return Array.from(candidates);
}

/**
 * Check if word matches a root
 */
export function wordMatchesRoot(word: string, root: string): boolean {
  const normWord = cleanWordToken(word);
  const normRoot = cleanWordToken(root);

  if (normWord.length < 3 || normRoot.length < 3) return false;

  // Check if letters of root appear in order in the word
  let rIdx = 0;
  for (let i = 0; i < normWord.length && rIdx < normRoot.length; i++) {
    if (normWord[i] === normRoot[rIdx]) {
      rIdx++;
    }
  }

  return rIdx === normRoot.length;
}

/**
 * Strips leading 'سورة' or 'سُورَةُ' prefix from surah name if present
 */
export function cleanSurahName(name: string): string {
  if (!name) return '';
  return name.replace(/^سُورَةُ\s*|^سورة\s*/, '').trim();
}

export interface QuranicWordToken {
  index: number;
  raw: string;
  isMatched: boolean;
  isSign: boolean;
}

/**
 * Tokenizes an Uthmani Ayah into display tokens with match highlighting indicators
 * Preserves the exact Quranic ligatures and marks for every word
 */
export function tokenizeAyahForHighlight(
  textUthmani: string,
  query: string,
  options?: {
    mode?: string;
    matchedWords?: string[];
    root?: string;
    matchType?: 'whole' | 'contains' | 'exact' | string;
    exactTashkeel?: boolean;
  }
): QuranicWordToken[] {
  if (!textUthmani) return [];
  const words = textUthmani.trim().split(/\s+/);
  const qTokens = (query || '').trim().split(/\s+/).filter(Boolean);
  const rawMatchedSet = new Set(options?.matchedWords || []);
  const cleanMatchedSet = new Set((options?.matchedWords || []).map((w) => cleanWordToken(w)));
  const targetRoot = options?.root ? cleanWordToken(options.root) : '';
  const matchType = options?.matchType || 'contains';

  return words.map((w, i) => {
    const isSign = isQuranicSign(w);
    if (isSign) {
      return { index: i, raw: w, isMatched: false, isSign: true };
    }

    let isMatched = false;

    // Check direct raw match or clean word match against explicit matched words list
    if (rawMatchedSet.has(w) || cleanMatchedSet.has(cleanWordToken(w))) {
      isMatched = true;
    }

    // Exact tashkeel match
    if (!isMatched && options?.exactTashkeel && query && w.includes(query)) {
      isMatched = true;
    }

    // Check root mode
    if (!isMatched && targetRoot && wordMatchesRoot(w, targetRoot)) {
      isMatched = true;
    }

    // Check query tokens
    if (!isMatched && qTokens.length > 0) {
      for (const qt of qTokens) {
        if (wordMatchesQuery(w, qt, matchType)) {
          isMatched = true;
          break;
        }
      }
    }

    return {
      index: i,
      raw: w,
      isMatched,
      isSign: false
    };
  });
}
