import { QuranAnchor, QuranAnchorLevel, RelationshipKind } from '../types';
import { normalizeArabic } from './arabicUtils';

/**
 * Generates a deterministic, collision-free anchor ID
 */
export function generateAnchorId(anchor: Partial<QuranAnchor>): string {
  const parts: string[] = [`s${anchor.surah || 0}`, `a${anchor.ayah || 0}`];
  if (anchor.endAyah && anchor.endAyah !== anchor.ayah) {
    parts.push(`ea${anchor.endAyah}`);
  }
  const w = anchor.wordIndex ?? anchor.startWord;
  if (w !== undefined) {
    parts.push(`w${w}`);
  }
  const ew = anchor.endWordIndex ?? anchor.endWord;
  if (ew !== undefined && ew !== w) {
    parts.push(`ew${ew}`);
  }
  const c = anchor.charIndex ?? anchor.startChar;
  if (c !== undefined) {
    parts.push(`c${c}`);
  }
  const ec = anchor.endChar ?? anchor.endCharIndex;
  if (ec !== undefined && ec !== c) {
    parts.push(`ec${ec}`);
  }
  return parts.join('_');
}

/**
 * Creates a standard QuranAnchor for a full Ayah
 */
export function createAyahAnchor(options: {
  surah: number;
  ayah: number;
  text: string;
  surahName?: string;
}): QuranAnchor {
  const anchor: QuranAnchor = {
    surah: options.surah,
    ayah: options.ayah,
    level: 'ayah',
    text: options.text.trim(),
    normalizedText: normalizeArabic(options.text),
    surahName: options.surahName,
    ayahNumberInSurah: options.ayah
  };
  anchor.id = generateAnchorId(anchor);
  return anchor;
}

/**
 * Creates a QuranAnchor for a range of Ayahs
 */
export function createAyahRangeAnchor(options: {
  surah: number;
  startAyah: number;
  endAyah: number;
  text: string;
  surahName?: string;
}): QuranAnchor {
  const anchor: QuranAnchor = {
    surah: options.surah,
    ayah: options.startAyah,
    endAyah: options.endAyah,
    level: 'ayah_range',
    text: options.text.trim(),
    normalizedText: normalizeArabic(options.text),
    surahName: options.surahName,
    ayahNumberInSurah: options.startAyah
  };
  anchor.id = generateAnchorId(anchor);
  return anchor;
}

/**
 * Creates a QuranAnchor for a single word
 */
export function createWordAnchor(options: {
  surah: number;
  ayah: number;
  wordIndex: number;
  wordText: string;
  surahName?: string;
}): QuranAnchor {
  const anchor: QuranAnchor = {
    surah: options.surah,
    ayah: options.ayah,
    level: 'word',
    wordIndex: options.wordIndex,
    startWord: options.wordIndex,
    endWord: options.wordIndex,
    endWordIndex: options.wordIndex,
    text: options.wordText.trim(),
    normalizedText: normalizeArabic(options.wordText),
    surahName: options.surahName,
    ayahNumberInSurah: options.ayah
  };
  anchor.id = generateAnchorId(anchor);
  return anchor;
}

/**
 * Creates a QuranAnchor for a range of words (phrase)
 */
export function createWordRangeAnchor(options: {
  surah: number;
  ayah: number;
  startWord: number;
  endWord: number;
  phraseText: string;
  surahName?: string;
}): QuranAnchor {
  const anchor: QuranAnchor = {
    surah: options.surah,
    ayah: options.ayah,
    level: 'word_range',
    startWord: options.startWord,
    endWord: options.endWord,
    wordIndex: options.startWord,
    endWordIndex: options.endWord,
    text: options.phraseText.trim(),
    normalizedText: normalizeArabic(options.phraseText),
    surahName: options.surahName,
    ayahNumberInSurah: options.ayah
  };
  anchor.id = generateAnchorId(anchor);
  return anchor;
}

/**
 * Creates a QuranAnchor for an exact character/letter inside a word
 */
export function createCharAnchor(options: {
  surah: number;
  ayah: number;
  wordIndex: number;
  charIndex: number;
  charText: string;
  wordText?: string;
  surahName?: string;
}): QuranAnchor {
  const anchor: QuranAnchor = {
    surah: options.surah,
    ayah: options.ayah,
    level: 'char',
    wordIndex: options.wordIndex,
    startWord: options.wordIndex,
    endWord: options.wordIndex,
    endWordIndex: options.wordIndex,
    charIndex: options.charIndex,
    startChar: options.charIndex,
    endChar: options.charIndex,
    charText: options.charText,
    text: options.charText,
    normalizedText: normalizeArabic(options.charText),
    surahName: options.surahName,
    ayahNumberInSurah: options.ayah
  };
  anchor.id = generateAnchorId(anchor);
  return anchor;
}

/**
 * Creates a QuranAnchor for a range of characters within a word (e.g. root or affix)
 */
export function createCharRangeAnchor(options: {
  surah: number;
  ayah: number;
  wordIndex: number;
  startChar: number;
  endChar: number;
  charsText: string;
  wordText?: string;
  surahName?: string;
}): QuranAnchor {
  const anchor: QuranAnchor = {
    surah: options.surah,
    ayah: options.ayah,
    level: 'char_range',
    wordIndex: options.wordIndex,
    startWord: options.wordIndex,
    endWord: options.wordIndex,
    endWordIndex: options.wordIndex,
    startChar: options.startChar,
    endChar: options.endChar,
    charIndex: options.startChar,
    endCharIndex: options.endChar,
    charText: options.charsText,
    text: options.charsText,
    normalizedText: normalizeArabic(options.charsText),
    surahName: options.surahName,
    ayahNumberInSurah: options.ayah
  };
  anchor.id = generateAnchorId(anchor);
  return anchor;
}

/**
 * Creates a composite multi-selection anchor
 */
export function createMultiSelectionAnchor(subAnchors: QuranAnchor[]): QuranAnchor {
  if (subAnchors.length === 0) {
    throw new Error('subAnchors cannot be empty');
  }
  const first = subAnchors[0];
  const combinedText = subAnchors.map((a) => a.text).join(' + ');
  const anchor: QuranAnchor = {
    surah: first.surah,
    ayah: first.ayah,
    level: 'multi',
    text: combinedText,
    surahName: first.surahName,
    ayahNumberInSurah: first.ayah,
    subAnchors
  };
  anchor.id = `multi_${subAnchors.map((a) => a.id || generateAnchorId(a)).join('_')}`;
  return anchor;
}

/**
 * Format a human-readable title for a QuranAnchor
 * e.g., "سورة البقرة [255] • حرف «ن» من كلمة «نَفْسٍ»"
 */
export function formatQuranAnchorLabel(anchor?: QuranAnchor): string {
  if (!anchor) return '';
  const surahPart = anchor.surahName ? `سورة ${anchor.surahName}` : `سورة ${anchor.surah}`;
  const ayahPart = anchor.endAyah && anchor.endAyah !== anchor.ayah
    ? `الآيات ${anchor.ayah}-${anchor.endAyah}`
    : `آية ${anchor.ayah}`;

  switch (anchor.level) {
    case 'char':
      return `${surahPart} [${ayahPart}] • حرف «${anchor.charText || anchor.text}»`;
    case 'char_range':
      return `${surahPart} [${ayahPart}] • حروف «${anchor.charText || anchor.text}»`;
    case 'word':
      return `${surahPart} [${ayahPart}] • كلمة «${anchor.text}»`;
    case 'word_range':
      return `${surahPart} [${ayahPart}] • مقطع «${anchor.text}»`;
    case 'ayah_range':
      return `${surahPart} [${ayahPart}]`;
    case 'multi':
      return `${surahPart} [${ayahPart}] • تحديدات متعددة (${anchor.subAnchors?.length || 0})`;
    case 'surah':
      return `${surahPart} (كامل السورة)`;
    case 'ayah':
    default:
      return `${surahPart} [${ayahPart}]`;
  }
}

/**
 * Short label for quick badges on the canvas edges or cards
 */
export function getAnchorShortBadge(anchor?: QuranAnchor): string {
  if (!anchor) return '';
  switch (anchor.level) {
    case 'char':
      return `حرف «${anchor.charText || anchor.text}»`;
    case 'char_range':
      return `حروف «${anchor.charText || anchor.text}»`;
    case 'word':
      return `كلمة «${anchor.text}»`;
    case 'word_range':
      return `مقطع «${anchor.text}»`;
    case 'ayah_range':
      return `آيات [${anchor.ayah}-${anchor.endAyah}]`;
    case 'ayah':
      return `آية [${anchor.ayah}]`;
    default:
      return anchor.text || 'موضع قرآني';
  }
}

/**
 * Resolves the DOM element ID for snapping edges to the exact canvas coordinate
 */
export function resolveAnchorDomTargetId(nodeId: string, anchor?: QuranAnchor): string {
  if (!anchor) return `node-card-${nodeId}`;

  const wIdx = anchor.wordIndex ?? anchor.startWord;
  const cIdx = anchor.charIndex ?? anchor.startChar;

  if ((anchor.level === 'char' || anchor.level === 'char_range') && wIdx !== undefined && cIdx !== undefined) {
    return `ayah-char-${nodeId}-${wIdx}-${cIdx}`;
  }

  if ((anchor.level === 'word' || anchor.level === 'word_range') && wIdx !== undefined) {
    return `ayah-word-${nodeId}-${wIdx}`;
  }

  return `node-card-${nodeId}`;
}
