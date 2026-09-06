/**
 * QuranPosition: Defines exact, unambiguous 4-tuple coordinate in the Quran:
 * (Surah : Ayah : Word : Character)
 *
 * This guarantees mathematical uniqueness and zero ambiguity across all 6,236 Ayahs.
 */

export interface QuranPosition {
  surah: number;     // 1 - 114
  ayah: number;      // 1 - ayah count in surah
  word?: number;     // 0-based word index in ayah
  char?: number;     // 0-based character index in word
}

/**
 * Compares two Quran positions chronologically according to Mus'haf order.
 * Returns -1 if a < b, 0 if a == b, 1 if a > b.
 */
export function compareQuranPositions(a: QuranPosition, b: QuranPosition): number {
  if (a.surah !== b.surah) return a.surah - b.surah;
  if (a.ayah !== b.ayah) return a.ayah - b.ayah;

  const aWord = a.word ?? -1;
  const bWord = b.word ?? -1;
  if (aWord !== bWord) return aWord - bWord;

  const aChar = a.char ?? -1;
  const bChar = b.char ?? -1;
  return aChar - bChar;
}

/**
 * Checks if two Quran positions point to the exact same location.
 */
export function isSameQuranPosition(a?: QuranPosition, b?: QuranPosition): boolean {
  if (!a || !b) return a === b;
  return (
    a.surah === b.surah &&
    a.ayah === b.ayah &&
    a.word === b.word &&
    a.char === b.char
  );
}

/**
 * Formats a QuranPosition into a compact, standardized canonical string key:
 * e.g., "2:255", "2:255:4", or "2:255:4:2"
 */
export function formatQuranPositionKey(pos: QuranPosition): string {
  let key = `${pos.surah}:${pos.ayah}`;
  if (pos.word !== undefined) {
    key += `:${pos.word}`;
    if (pos.char !== undefined) {
      key += `:${pos.char}`;
    }
  }
  return key;
}

/**
 * Parses a canonical string key back into a QuranPosition.
 */
export function parseQuranPositionKey(key: string): QuranPosition | null {
  if (!key) return null;
  const parts = key.split(':').map((p) => parseInt(p, 10));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;

  return {
    surah: parts[0],
    ayah: parts[1],
    word: parts.length > 2 && !isNaN(parts[2]) ? parts[2] : undefined,
    char: parts.length > 3 && !isNaN(parts[3]) ? parts[3] : undefined
  };
}
