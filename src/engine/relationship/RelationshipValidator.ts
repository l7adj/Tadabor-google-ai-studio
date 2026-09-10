import { QuranRelationship } from './QuranRelationship';
import { validateQuranAnchor, ValidationResult } from '../quran/QuranAnchorValidator';
import { QuranAnchorV2 } from '../quran/QuranAnchor';

/**
 * Validates a QuranRelationship to prevent invalid self-loops,
 * corrupted anchors, or impossible references.
 */
export function validateRelationship(rel: QuranRelationship): ValidationResult {
  if (!rel) {
    return {
      isValid: false,
      errorCode: 'NULL_RELATIONSHIP',
      errorMessage: 'العلاقة القرآنية غير معرّفة'
    };
  }

  const srcVal = validateQuranAnchor(rel.sourceAnchor);
  if (!srcVal.isValid) {
    return {
      isValid: false,
      errorCode: 'INVALID_SOURCE_ANCHOR',
      errorMessage: `مرساة المصدر غير صالحة: ${srcVal.errorMessage}`
    };
  }

  const tgtVal = validateQuranAnchor(rel.targetAnchor);
  if (!tgtVal.isValid) {
    return {
      isValid: false,
      errorCode: 'INVALID_TARGET_ANCHOR',
      errorMessage: `مرساة الهدف غير صالحة: ${tgtVal.errorMessage}`
    };
  }

  // Prevent identical self-link
  if (isIdenticalAnchor(rel.sourceAnchor, rel.targetAnchor)) {
    return {
      isValid: false,
      errorCode: 'SELF_LOOP_IDENTICAL_ANCHOR',
      errorMessage: 'لا يمكن ربط موضع قرآني بنفسه بشكل متطابق'
    };
  }

  return { isValid: true };
}

/**
 * Checks if two anchors point to the exact same granularity and position
 */
export function isIdenticalAnchor(a: QuranAnchorV2, b: QuranAnchorV2): boolean {
  if (a.id && b.id && a.id === b.id) return true;

  const aSurah = a.surahId ?? a.surah;
  const bSurah = b.surahId ?? b.surah;
  const aAyah = a.ayahId ?? a.ayah ?? a.ayahNumberInSurah;
  const bAyah = b.ayahId ?? b.ayah ?? b.ayahNumberInSurah;

  if (aSurah !== bSurah || aAyah !== bAyah) return false;
  if (a.level !== b.level) return false;

  const aWord = a.wordIndex ?? a.startWord;
  const bWord = b.wordIndex ?? b.startWord;
  if (aWord !== bWord) return false;

  const aChar = a.charIndex ?? a.startChar;
  const bChar = b.charIndex ?? b.startChar;
  return aChar === bChar;
}
