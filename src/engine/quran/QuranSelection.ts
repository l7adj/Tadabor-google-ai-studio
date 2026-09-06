import { QuranPosition } from './QuranPosition';
import { QuranAnchorV2, generateAnchorId } from './QuranAnchor';
import { normalizeArabic } from '../../lib/arabicUtils';

export type QuranSelectionType =
  | 'surah'
  | 'ayah'
  | 'ayah_range'
  | 'word'
  | 'word_range'
  | 'char'
  | 'char_range'
  | 'multi';

/**
 * QuranSelection represents an active, user-originated or programmatic
 * selection inside the Quranic corpus, with precise spatial coordinates.
 */
export interface QuranSelection {
  id: string;
  type: QuranSelectionType;
  anchor: QuranAnchorV2;
  startPosition: QuranPosition;
  endPosition?: QuranPosition;
  text: string;
  normalizedText: string;
  subSelections?: QuranSelection[];
  createdAt: number;
  metadata?: Record<string, any>;
}

/**
 * Factory for a single character selection
 */
export function createCharSelection(params: {
  surah: number;
  ayah: number;
  wordIndex: number;
  charIndex: number;
  charText: string;
  wordText?: string;
  surahName?: string;
}): QuranSelection {
  const startPos: QuranPosition = {
    surah: params.surah,
    ayah: params.ayah,
    word: params.wordIndex,
    char: params.charIndex
  };

  const anchor: QuranAnchorV2 = {
    id: `anchor-s${params.surah}-a${params.ayah}-w${params.wordIndex}-c${params.charIndex}`,
    surahId: params.surah,
    ayahId: params.ayah,
    level: 'char',
    wordIndex: params.wordIndex,
    startWord: params.wordIndex,
    endWord: params.wordIndex,
    charIndex: params.charIndex,
    startChar: params.charIndex,
    endChar: params.charIndex,
    charText: params.charText,
    text: params.charText,
    normalizedText: normalizeArabic(params.charText),
    surahName: params.surahName,
    ayahNumberInSurah: params.ayah,
    surah: params.surah,
    ayah: params.ayah
  };
  anchor.id = generateAnchorId(anchor);

  return {
    id: `sel-${anchor.id}`,
    type: 'char',
    anchor,
    startPosition: startPos,
    endPosition: startPos,
    text: params.charText,
    normalizedText: normalizeArabic(params.charText),
    createdAt: Date.now()
  };
}

/**
 * Factory for a character range selection (e.g. root or morpheme)
 */
export function createCharRangeSelection(params: {
  surah: number;
  ayah: number;
  wordIndex: number;
  startChar: number;
  endChar: number;
  charsText: string;
  wordText?: string;
  surahName?: string;
}): QuranSelection {
  const startPos: QuranPosition = {
    surah: params.surah,
    ayah: params.ayah,
    word: params.wordIndex,
    char: params.startChar
  };
  const endPos: QuranPosition = {
    surah: params.surah,
    ayah: params.ayah,
    word: params.wordIndex,
    char: params.endChar
  };

  const anchor: QuranAnchorV2 = {
    id: `anchor-s${params.surah}-a${params.ayah}-w${params.wordIndex}-c${params.startChar}_to_c${params.endChar}`,
    surahId: params.surah,
    ayahId: params.ayah,
    level: 'char_range',
    wordIndex: params.wordIndex,
    startWord: params.wordIndex,
    endWord: params.wordIndex,
    startChar: params.startChar,
    endChar: params.endChar,
    charIndex: params.startChar,
    endCharIndex: params.endChar,
    charText: params.charsText,
    text: params.charsText,
    normalizedText: normalizeArabic(params.charsText),
    surahName: params.surahName,
    ayahNumberInSurah: params.ayah,
    surah: params.surah,
    ayah: params.ayah
  };
  anchor.id = generateAnchorId(anchor);

  return {
    id: `sel-${anchor.id}`,
    type: 'char_range',
    anchor,
    startPosition: startPos,
    endPosition: endPos,
    text: params.charsText,
    normalizedText: normalizeArabic(params.charsText),
    createdAt: Date.now()
  };
}

/**
 * Factory for a single word selection
 */
export function createWordSelection(params: {
  surah: number;
  ayah: number;
  wordIndex: number;
  wordText: string;
  surahName?: string;
}): QuranSelection {
  const pos: QuranPosition = {
    surah: params.surah,
    ayah: params.ayah,
    word: params.wordIndex
  };

  const anchor: QuranAnchorV2 = {
    id: `anchor-s${params.surah}-a${params.ayah}-w${params.wordIndex}`,
    surahId: params.surah,
    ayahId: params.ayah,
    level: 'word',
    wordIndex: params.wordIndex,
    startWord: params.wordIndex,
    endWord: params.wordIndex,
    text: params.wordText.trim(),
    normalizedText: normalizeArabic(params.wordText),
    surahName: params.surahName,
    ayahNumberInSurah: params.ayah,
    surah: params.surah,
    ayah: params.ayah
  };
  anchor.id = generateAnchorId(anchor);

  return {
    id: `sel-${anchor.id}`,
    type: 'word',
    anchor,
    startPosition: pos,
    endPosition: pos,
    text: params.wordText.trim(),
    normalizedText: normalizeArabic(params.wordText),
    createdAt: Date.now()
  };
}

/**
 * Factory for a range of words selection (phrase or clause)
 */
export function createWordRangeSelection(params: {
  surah: number;
  ayah: number;
  startWord: number;
  endWord: number;
  phraseText: string;
  surahName?: string;
}): QuranSelection {
  const startPos: QuranPosition = {
    surah: params.surah,
    ayah: params.ayah,
    word: params.startWord
  };
  const endPos: QuranPosition = {
    surah: params.surah,
    ayah: params.ayah,
    word: params.endWord
  };

  const anchor: QuranAnchorV2 = {
    id: `anchor-s${params.surah}-a${params.ayah}-w${params.startWord}_to_w${params.endWord}`,
    surahId: params.surah,
    ayahId: params.ayah,
    level: 'word_range',
    startWord: params.startWord,
    endWord: params.endWord,
    wordIndex: params.startWord,
    endWordIndex: params.endWord,
    text: params.phraseText.trim(),
    normalizedText: normalizeArabic(params.phraseText),
    surahName: params.surahName,
    ayahNumberInSurah: params.ayah,
    surah: params.surah,
    ayah: params.ayah
  };
  anchor.id = generateAnchorId(anchor);

  return {
    id: `sel-${anchor.id}`,
    type: 'word_range',
    anchor,
    startPosition: startPos,
    endPosition: endPos,
    text: params.phraseText.trim(),
    normalizedText: normalizeArabic(params.phraseText),
    createdAt: Date.now()
  };
}

/**
 * Factory for an Ayah selection
 */
export function createAyahSelection(params: {
  surah: number;
  ayah: number;
  text: string;
  surahName?: string;
}): QuranSelection {
  const pos: QuranPosition = {
    surah: params.surah,
    ayah: params.ayah
  };

  const anchor: QuranAnchorV2 = {
    id: `anchor-s${params.surah}-a${params.ayah}`,
    surahId: params.surah,
    ayahId: params.ayah,
    level: 'ayah',
    text: params.text.trim(),
    normalizedText: normalizeArabic(params.text),
    surahName: params.surahName,
    ayahNumberInSurah: params.ayah,
    surah: params.surah,
    ayah: params.ayah
  };
  anchor.id = generateAnchorId(anchor);

  return {
    id: `sel-${anchor.id}`,
    type: 'ayah',
    anchor,
    startPosition: pos,
    endPosition: pos,
    text: params.text.trim(),
    normalizedText: normalizeArabic(params.text),
    createdAt: Date.now()
  };
}

/**
 * Factory for a composite non-contiguous multi-selection
 */
export function createMultiSelection(selections: QuranSelection[]): QuranSelection {
  const subAnchors = selections.map((s) => s.anchor);
  const texts = selections.map((s) => s.text).join(' • ');
  const firstPos = selections[0]?.startPosition || { surah: 1, ayah: 1 };
  const lastPos = selections[selections.length - 1]?.endPosition || firstPos;

  const anchor: QuranAnchorV2 = {
    id: `anchor-multi-${Date.now()}`,
    surahId: firstPos.surah,
    ayahId: firstPos.ayah,
    level: 'multi',
    text: texts,
    normalizedText: normalizeArabic(texts),
    subAnchors,
    surah: firstPos.surah,
    ayah: firstPos.ayah
  };
  anchor.id = generateAnchorId(anchor);

  return {
    id: `sel-${anchor.id}`,
    type: 'multi',
    anchor,
    startPosition: firstPos,
    endPosition: lastPos,
    text: texts,
    normalizedText: normalizeArabic(texts),
    subSelections: selections,
    createdAt: Date.now()
  };
}

/**
 * Formats a QuranSelection for intuitive, elegant Arabic UI display
 */
export function formatQuranSelectionLabel(sel: QuranSelection): string {
  const a = sel.anchor;
  const sName = a.surahName ? `سورة ${a.surahName}` : `سورة [${a.surahId}]`;
  const ayahNum = a.ayahId;

  switch (sel.type) {
    case 'char':
      return `${sName} [${ayahNum}] • حرف «${a.charText || a.text}»`;
    case 'char_range':
      return `${sName} [${ayahNum}] • حروف «${a.charText || a.text}»`;
    case 'word':
      return `${sName} [${ayahNum}] • كلمة «${a.text}»`;
    case 'word_range':
      return `${sName} [${ayahNum}] • مقطع «${a.text}»`;
    case 'ayah_range':
      return `${sName} [${ayahNum}-${a.endAyah || ayahNum}]`;
    case 'multi':
      return `${sel.subSelections?.length || subAnchorsLength(a)} مواضع قرآنية محددة`;
    case 'ayah':
    default:
      return `${sName} [${ayahNum}]`;
  }
}

function subAnchorsLength(anchor: QuranAnchorV2): number {
  return anchor.subAnchors ? anchor.subAnchors.length : 1;
}
