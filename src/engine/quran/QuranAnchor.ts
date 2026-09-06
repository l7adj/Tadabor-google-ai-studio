import { QuranPosition, formatQuranPositionKey } from './QuranPosition';

export type QuranAnchorLevel =
  | 'surah'
  | 'ayah'
  | 'ayah_range'
  | 'word'
  | 'word_range'
  | 'char'
  | 'char_range'
  | 'multi';

/**
 * QuranAnchorV2: The unified, canonical representation of any targetable location
 * in the Quran, from a single letter to a whole Surah or non-contiguous multi-selection.
 */
export interface QuranAnchorV2 {
  id: string;
  surahId: number;
  ayahId: number;
  level: QuranAnchorLevel;

  // Word coordinates (0-based)
  startWord?: number;
  endWord?: number;
  wordIndex?: number;
  endWordIndex?: number;

  // Character coordinates (0-based) inside the designated word
  startChar?: number;
  endChar?: number;
  charIndex?: number;
  endCharIndex?: number;
  charText?: string;

  // Range of ayahs (for multi-ayah blocks)
  endAyah?: number;

  // Display texts
  text: string;
  normalizedText?: string;
  surahName?: string;
  ayahNumberInSurah?: number;

  // Composite multi-selections (for non-contiguous selections)
  subAnchors?: QuranAnchorV2[];

  // DOM element target id for exact geometric SVG bezier snapping
  domTargetId?: string;

  // Backward-compatibility aliases
  surah?: number;
  ayah?: number;
}

/**
 * Generates a deterministic, unique anchor ID
 */
export function generateAnchorId(anchor: Partial<QuranAnchorV2>): string {
  const surah = anchor.surahId ?? anchor.surah ?? 0;
  const ayah = anchor.ayahId ?? anchor.ayah ?? anchor.ayahNumberInSurah ?? 0;
  const level = anchor.level || 'ayah';

  switch (level) {
    case 'surah':
      return `anchor-s${surah}`;

    case 'ayah_range':
      return `anchor-s${surah}-a${ayah}_to_a${anchor.endAyah ?? ayah}`;

    case 'word': {
      const wIdx = anchor.wordIndex ?? anchor.startWord ?? 0;
      return `anchor-s${surah}-a${ayah}-w${wIdx}`;
    }

    case 'word_range': {
      const sWord = anchor.startWord ?? anchor.wordIndex ?? 0;
      const eWord = anchor.endWord ?? anchor.endWordIndex ?? sWord;
      return `anchor-s${surah}-a${ayah}-w${sWord}_to_w${eWord}`;
    }

    case 'char': {
      const wIdx = anchor.wordIndex ?? anchor.startWord ?? 0;
      const cIdx = anchor.charIndex ?? anchor.startChar ?? 0;
      return `anchor-s${surah}-a${ayah}-w${wIdx}-c${cIdx}`;
    }

    case 'char_range': {
      const wIdx = anchor.wordIndex ?? anchor.startWord ?? 0;
      const sChar = anchor.startChar ?? anchor.charIndex ?? 0;
      const eChar = anchor.endChar ?? anchor.endCharIndex ?? sChar;
      return `anchor-s${surah}-a${ayah}-w${wIdx}-c${sChar}_to_c${eChar}`;
    }

    case 'multi': {
      if (anchor.subAnchors && anchor.subAnchors.length > 0) {
        const subIds = anchor.subAnchors.map((s) => s.id).join('__');
        return `anchor-multi-${subIds}`;
      }
      return `anchor-multi-s${surah}-a${ayah}-${Date.now()}`;
    }

    case 'ayah':
    default:
      return `anchor-s${surah}-a${ayah}`;
  }
}

/**
 * Converts a QuranAnchorV2 into its starting QuranPosition
 */
export function getAnchorStartPosition(anchor: QuranAnchorV2): QuranPosition {
  return {
    surah: anchor.surahId ?? anchor.surah ?? 1,
    ayah: anchor.ayahId ?? anchor.ayah ?? 1,
    word: anchor.startWord ?? anchor.wordIndex,
    char: anchor.startChar ?? anchor.charIndex
  };
}

/**
 * Converts a QuranAnchorV2 into its ending QuranPosition
 */
export function getAnchorEndPosition(anchor: QuranAnchorV2): QuranPosition {
  return {
    surah: anchor.surahId ?? anchor.surah ?? 1,
    ayah: anchor.endAyah ?? anchor.ayahId ?? anchor.ayah ?? 1,
    word: anchor.endWord ?? anchor.endWordIndex ?? anchor.startWord ?? anchor.wordIndex,
    char: anchor.endChar ?? anchor.endCharIndex ?? anchor.startChar ?? anchor.charIndex
  };
}

// Type Guards
export function isCharLevel(anchor: QuranAnchorV2): boolean {
  return anchor.level === 'char' || anchor.level === 'char_range';
}

export function isWordLevel(anchor: QuranAnchorV2): boolean {
  return anchor.level === 'word' || anchor.level === 'word_range';
}

export function isAyahLevel(anchor: QuranAnchorV2): boolean {
  return anchor.level === 'ayah' || anchor.level === 'ayah_range';
}

export function isMultiLevel(anchor: QuranAnchorV2): boolean {
  return anchor.level === 'multi';
}
