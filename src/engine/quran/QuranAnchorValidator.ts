import { QuranAnchorV2 } from './QuranAnchor';
import { QuranPosition } from './QuranPosition';

/**
 * Canonical verse counts for all 114 Surahs of the Holy Quran
 */
export const SURAH_AYAH_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
  5, 4, 5, 6
];

export interface CanonicalVerseData {
  textUthmani: string;
  words: string[];
}

export type CanonicalQuranDataProvider = (surah: number, ayah: number) => CanonicalVerseData | null;

let customCorpusProvider: CanonicalQuranDataProvider | null = null;
let canonicalMap: Map<string, CanonicalVerseData> | null = null;

/**
 * Registers a canonical Quran corpus for full word and character boundary validations
 */
export function registerCanonicalCorpus(corpus: {
  surahs: Array<{
    id?: number;
    number?: number;
    ayahs: Array<{ id?: number; number?: number; numberInSurah?: number; ayahNumberInSurah?: number; textUthmani: string }>;
  }>;
}): void {
  const map = new Map<string, CanonicalVerseData>();
  for (const s of corpus.surahs) {
    const surahId = s.number ?? s.id ?? 0;
    for (const a of s.ayahs) {
      const uText = (a.textUthmani || '').trim();
      const words = uText.split(/\s+/).filter(Boolean);
      const ayahNum = a.numberInSurah ?? a.ayahNumberInSurah ?? a.number ?? a.id ?? 0;
      map.set(`${surahId}:${ayahNum}`, {
        textUthmani: uText,
        words
      });
    }
  }
  canonicalMap = map;
}

/**
 * Registers a custom canonical Quran data provider
 */
export function setCanonicalQuranProvider(provider: CanonicalQuranDataProvider | null): void {
  customCorpusProvider = provider;
}

/**
 * Ensures canonical corpus is loaded in Node.js environments (e.g. testing)
 */
export async function ensureCanonicalCorpusLoaded(): Promise<boolean> {
  if (canonicalMap && canonicalMap.size > 0) return true;
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const p = path.join(process.cwd(), 'public', 'quran-data.json');
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const json = JSON.parse(raw);
        registerCanonicalCorpus(json);
        return true;
      }
    } catch {
      // ignore
    }
  }
  return false;
}

/**
 * Resolves canonical verse data for a specific surah and ayah
 */
export function getCanonicalVerse(surah: number, ayah: number): CanonicalVerseData | null {
  if (customCorpusProvider) {
    const res = customCorpusProvider(surah, ayah);
    if (res) return res;
  }

  if (canonicalMap) {
    return canonicalMap.get(`${surah}:${ayah}`) || null;
  }

  return null;
}

export interface ValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Validates a QuranPosition for Quranic authenticity
 */
export function validateQuranPosition(pos: QuranPosition): ValidationResult {
  if (!pos || typeof pos.surah !== 'number' || typeof pos.ayah !== 'number') {
    return {
      isValid: false,
      errorCode: 'INVALID_COORDINATES',
      errorMessage: 'إحداثيات الموضع القرآني ناقصة أو غير رقمية'
    };
  }

  if (pos.surah < 1 || pos.surah > 114) {
    return {
      isValid: false,
      errorCode: 'SURAH_OUT_OF_BOUNDS',
      errorMessage: `رقم السورة (${pos.surah}) خارج النطاق الصحيح (1-114)`
    };
  }

  const maxAyahs = SURAH_AYAH_COUNTS[pos.surah - 1];
  if (pos.ayah < 1 || pos.ayah > maxAyahs) {
    return {
      isValid: false,
      errorCode: 'AYAH_OUT_OF_BOUNDS',
      errorMessage: `رقم الآية (${pos.ayah}) خارج نطاق السورة ${pos.surah} (الحد الأقصى ${maxAyahs})`
    };
  }

  if (pos.word !== undefined && (pos.word < 0 || !Number.isInteger(pos.word))) {
    return {
      isValid: false,
      errorCode: 'INVALID_WORD_INDEX',
      errorMessage: `ترتيب الكلمة (${pos.word}) يجب أن يكون عدداً صحيحاً موجباً`
    };
  }

  if (pos.char !== undefined && (pos.char < 0 || !Number.isInteger(pos.char))) {
    return {
      isValid: false,
      errorCode: 'INVALID_CHAR_INDEX',
      errorMessage: `ترتيب الحرف (${pos.char}) يجب أن يكون عدداً صحيحاً موجباً`
    };
  }

  // Canonical Data Check against actual Quran corpus
  const canonicalVerse = getCanonicalVerse(pos.surah, pos.ayah);
  if (canonicalVerse) {
    if (pos.word !== undefined) {
      const wordCount = canonicalVerse.words.length;
      if (pos.word >= wordCount) {
        return {
          isValid: false,
          errorCode: 'WORD_OUT_OF_BOUNDS',
          errorMessage: `الكلمة رقم (${pos.word + 1}) غير موجودة في الآية ${pos.surah}:${pos.ayah} (إجمالي كلمات الآية: ${wordCount})`
        };
      }

      if (pos.char !== undefined) {
        const wordText = canonicalVerse.words[pos.word];
        if (pos.char >= wordText.length) {
          return {
            isValid: false,
            errorCode: 'CHAR_OUT_OF_BOUNDS',
            errorMessage: `الحرف رقم (${pos.char + 1}) غير موجود في الكلمة «${wordText}» (أحرف الكلمة: ${wordText.length})`
          };
        }
      }
    }
  }

  return { isValid: true };
}

/**
 * Validates a QuranAnchorV2 against Quranic structure rules
 */
export function validateQuranAnchor(anchor: QuranAnchorV2): ValidationResult {
  if (!anchor) {
    return {
      isValid: false,
      errorCode: 'NULL_ANCHOR',
      errorMessage: 'مرساة الموضع القرآني غير معرّفة'
    };
  }

  const surah = anchor.surahId ?? anchor.surah;
  const ayah = anchor.ayahId ?? anchor.ayah ?? anchor.ayahNumberInSurah;

  if (surah === undefined || ayah === undefined) {
    return {
      isValid: false,
      errorCode: 'MISSING_SURAH_OR_AYAH',
      errorMessage: 'يجب تحديد السورة والآية في المرساة القرآنية'
    };
  }

  const wordIndex = anchor.wordIndex;
  const charIndex = anchor.charIndex;

  const posValidation = validateQuranPosition({
    surah,
    ayah,
    word: wordIndex,
    char: charIndex
  });
  if (!posValidation.isValid) {
    return posValidation;
  }

  // Multi anchor recursion check
  if (anchor.level === 'multi') {
    if (!anchor.subAnchors || anchor.subAnchors.length === 0) {
      return {
        isValid: false,
        errorCode: 'EMPTY_MULTI_ANCHOR',
        errorMessage: 'التحديد المركب يجب أن يحتوي على مرساة فرعية واحدة على الأقل'
      };
    }
    for (const sub of anchor.subAnchors) {
      const subResult = validateQuranAnchor(sub);
      if (!subResult.isValid) return subResult;
    }
    return { isValid: true };
  }

  const canonicalVerse = getCanonicalVerse(surah, ayah);

  // Range validation for word range
  if (anchor.level === 'word_range') {
    const sWord = anchor.startWord ?? anchor.wordIndex;
    const eWord = anchor.endWord ?? anchor.endWordIndex;
    if (sWord === undefined || eWord === undefined) {
      return {
        isValid: false,
        errorCode: 'MISSING_WORD_RANGE',
        errorMessage: 'نطاق الكلمات يتطلب بداية ونهاية محددتين'
      };
    }
    if (sWord > eWord) {
      return {
        isValid: false,
        errorCode: 'INVERTED_WORD_RANGE',
        errorMessage: `بداية نطاق الكلمات (${sWord}) أكبر من نهايته (${eWord})`
      };
    }
    if (canonicalVerse) {
      const wordCount = canonicalVerse.words.length;
      if (eWord >= wordCount) {
        return {
          isValid: false,
          errorCode: 'WORD_RANGE_OUT_OF_BOUNDS',
          errorMessage: `نهاية نطاق الكلمات (${eWord + 1}) تتجاوز إجمالي كلمات الآية (${wordCount})`
        };
      }
    }
  }

  // Range validation for char range
  if (anchor.level === 'char_range') {
    const sChar = anchor.startChar ?? anchor.charIndex;
    const eChar = anchor.endChar ?? anchor.endCharIndex;
    if (sChar === undefined || eChar === undefined) {
      return {
        isValid: false,
        errorCode: 'MISSING_CHAR_RANGE',
        errorMessage: 'نطاق الأحرف يتطلب بداية ونهاية محددتين'
      };
    }
    if (sChar > eChar) {
      return {
        isValid: false,
        errorCode: 'INVERTED_CHAR_RANGE',
        errorMessage: `بداية نطاق الأحرف (${sChar}) أكبر من نهايته (${eChar})`
      };
    }
    if (canonicalVerse && wordIndex !== undefined && wordIndex < canonicalVerse.words.length) {
      const wordLen = canonicalVerse.words[wordIndex].length;
      if (eChar >= wordLen) {
        return {
          isValid: false,
          errorCode: 'CHAR_RANGE_OUT_OF_BOUNDS',
          errorMessage: `نهاية نطاق الأحرف (${eChar + 1}) تتجاوز طول الكلمة «${canonicalVerse.words[wordIndex]}» (${wordLen})`
        };
      }
    }
  }

  // Ayah range validation
  if (anchor.level === 'ayah_range') {
    if (anchor.endAyah === undefined) {
      return {
        isValid: false,
        errorCode: 'MISSING_END_AYAH',
        errorMessage: 'نطاق الآيات يتطلب تحديد نهاية الآيات'
      };
    }
    const maxAyahs = SURAH_AYAH_COUNTS[surah - 1];
    if (anchor.endAyah > maxAyahs || anchor.endAyah < ayah) {
      return {
        isValid: false,
        errorCode: 'INVALID_AYAH_RANGE',
        errorMessage: `نطاق الآيات (${ayah} إلى ${anchor.endAyah}) غير متسق مع السورة`
      };
    }
  }

  return { isValid: true };
}
