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

  const posValidation = validateQuranPosition({ surah, ayah });
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
