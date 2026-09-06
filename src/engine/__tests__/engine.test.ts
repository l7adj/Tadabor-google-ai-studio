/**
 * Automated Verification Suite for Quran Selection & Relationship Engine
 */

import {
  QuranPosition,
  compareQuranPositions,
  isSameQuranPosition,
  formatQuranPositionKey,
  parseQuranPositionKey
} from '../quran/QuranPosition';

import {
  QuranAnchorV2,
  generateAnchorId,
  isCharLevel,
  isWordLevel,
  isAyahLevel,
  isMultiLevel
} from '../quran/QuranAnchor';

import {
  validateQuranPosition,
  validateQuranAnchor
} from '../quran/QuranAnchorValidator';

import {
  createCharSelection,
  createCharRangeSelection,
  createWordSelection,
  createWordRangeSelection,
  createAyahSelection,
  createMultiSelection,
  formatQuranSelectionLabel
} from '../quran/QuranSelection';

import { QuranSelectionEngine } from '../quran/QuranSelectionEngine';

import {
  createQuranRelationship,
  RelationshipEngine,
  validateRelationship
} from '../index';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('--- Starting Quran Engine Verification Tests ---');

// Test 1: QuranPosition Coordinates & Parsing
{
  const p1: QuranPosition = { surah: 2, ayah: 255, word: 4, char: 1 };
  const p2: QuranPosition = { surah: 2, ayah: 255, word: 4, char: 2 };
  const p3: QuranPosition = { surah: 2, ayah: 255, word: 5 };
  const p4: QuranPosition = { surah: 3, ayah: 1 };

  assert(compareQuranPositions(p1, p2) < 0, 'p1 should precede p2 in character index');
  assert(compareQuranPositions(p2, p3) < 0, 'p2 should precede p3 in word index');
  assert(compareQuranPositions(p3, p4) < 0, 'p3 should precede p4 in surah number');
  assert(isSameQuranPosition(p1, { surah: 2, ayah: 255, word: 4, char: 1 }), 'Identical positions match');

  const key = formatQuranPositionKey(p1);
  assert(key === '2:255:4:1', 'Key formatting correct');
  const parsed = parseQuranPositionKey(key);
  assert(isSameQuranPosition(p1, parsed!), 'Key parsing accurate roundtrip');
  console.log('✓ Test 1 Passed: QuranPosition coordinates, comparison, and canonical keys');
}

// Test 2: QuranAnchorValidator Structural Integrity
{
  // Valid Position
  assert(validateQuranPosition({ surah: 1, ayah: 7 }).isValid, 'Al-Fatiha 7 is valid');
  assert(validateQuranPosition({ surah: 2, ayah: 286 }).isValid, 'Al-Baqarah 286 is valid');

  // Invalid Surahs / Ayahs
  assert(!validateQuranPosition({ surah: 0, ayah: 1 }).isValid, 'Surah 0 rejected');
  assert(!validateQuranPosition({ surah: 115, ayah: 1 }).isValid, 'Surah 115 rejected');
  assert(!validateQuranPosition({ surah: 1, ayah: 8 }).isValid, 'Al-Fatiha 8 rejected (only 7 ayahs)');
  assert(!validateQuranPosition({ surah: 2, ayah: 287 }).isValid, 'Al-Baqarah 287 rejected (only 286 ayahs)');

  // Invalid word/char indices
  assert(!validateQuranPosition({ surah: 2, ayah: 255, word: -1 }).isValid, 'Negative word index rejected');
  assert(!validateQuranPosition({ surah: 2, ayah: 255, word: 0, char: -2 }).isValid, 'Negative char index rejected');

  // Inverted range validation
  const invertedRange: QuranAnchorV2 = {
    id: 'test',
    surahId: 2,
    ayahId: 255,
    level: 'word_range',
    startWord: 8,
    endWord: 4,
    text: 'test'
  };
  assert(!validateQuranAnchor(invertedRange).isValid, 'Inverted word range rejected');

  console.log('✓ Test 2 Passed: QuranAnchorValidator canonical rules & boundary checks');
}

// Test 3: QuranSelection Factories & Level Predicates
{
  const charSel = createCharSelection({
    surah: 1,
    ayah: 1,
    wordIndex: 0,
    charIndex: 0,
    charText: 'بِ',
    wordText: 'بِسْمِ',
    surahName: 'الفاتحة'
  });
  assert(isCharLevel(charSel.anchor), 'Identified as char level');
  assert(charSel.anchor.charText === 'بِ', 'Preserves exact char text with tashkeel');
  assert(charSel.startPosition.char === 0, 'Start position has char 0');

  const wordSel = createWordSelection({
    surah: 2,
    ayah: 255,
    wordIndex: 0,
    wordText: 'اللَّهُ',
    surahName: 'البقرة'
  });
  assert(isWordLevel(wordSel.anchor), 'Identified as word level');
  assert(wordSel.anchor.wordIndex === 0, 'Word index set');

  const rangeSel = createWordRangeSelection({
    surah: 1,
    ayah: 1,
    startWord: 0,
    endWord: 1,
    phraseText: 'بِسْمِ اللَّهِ',
    surahName: 'الفاتحة'
  });
  assert(rangeSel.anchor.level === 'word_range', 'Identified as word range');

  const multiSel = createMultiSelection([charSel, wordSel]);
  assert(isMultiLevel(multiSel.anchor), 'Identified as multi level');
  assert(multiSel.anchor.subAnchors?.length === 2, 'Sub-anchors length 2');

  console.log('✓ Test 3 Passed: QuranSelection factories and multi-selection composition');
}

// Test 4: QuranSelectionEngine State Management
{
  const engine = new QuranSelectionEngine();
  let listenerCalls = 0;

  const unsubscribe = engine.subscribe((active, multi) => {
    listenerCalls++;
  });

  const wordSel = createWordSelection({
    surah: 1,
    ayah: 1,
    wordIndex: 0,
    wordText: 'بِسْمِ'
  });

  engine.select(wordSel);
  assert(engine.getActiveSelection()?.id === wordSel.id, 'Active selection set');
  assert(listenerCalls === 1, 'Listener notified');

  // Toggle multi-selection
  engine.toggleMultiSelection(wordSel);
  assert(engine.getMultiSelections().length === 1, 'Added to multi-selection');
  assert(listenerCalls === 2, 'Listener notified on multi toggle');

  engine.toggleMultiSelection(wordSel);
  assert(engine.getMultiSelections().length === 0, 'Removed from multi-selection');

  unsubscribe();
  engine.clearAll();
  assert(engine.getActiveSelection() === null, 'Selection cleared');

  console.log('✓ Test 4 Passed: QuranSelectionEngine state transitions & subscriptions');
}

// Test 5: RelationshipEngine & Relationship Validation
{
  const relEngine = new RelationshipEngine();

  const srcAnchor = createWordSelection({
    surah: 2,
    ayah: 255,
    wordIndex: 0,
    wordText: 'اللَّهُ'
  }).anchor;

  const tgtAnchor = createWordSelection({
    surah: 3,
    ayah: 2,
    wordIndex: 0,
    wordText: 'اللَّهُ'
  }).anchor;

  const rel = createQuranRelationship({
    sourceAnchor: srcAnchor,
    targetAnchor: tgtAnchor,
    kind: 'shared_word',
    label: 'لفظ الجلالة المشترك'
  });

  assert(relEngine.addRelationship(rel), 'Relationship added successfully');
  assert(relEngine.getAllRelationships().length === 1, 'Relationship count is 1');

  // Query by anchor
  const foundBySrc = relEngine.findByAnchor(srcAnchor.id);
  assert(foundBySrc.length === 1, 'Found relationship by source anchor');

  // Query by ayah
  const foundByAyah = relEngine.findByAyah(2, 255);
  assert(foundByAyah.length === 1, 'Found relationship by ayah (2:255)');

  // Self-loop validation (connecting exact same anchor to itself)
  const selfRel = createQuranRelationship({
    sourceAnchor: srcAnchor,
    targetAnchor: srcAnchor,
    kind: 'emphasis'
  });
  const val = validateRelationship(selfRel);
  assert(!val.isValid, 'Identical self-loop rejected by validator');

  console.log('✓ Test 5 Passed: RelationshipEngine indexing, queries, and self-loop prevention');
}

console.log('\n========================================');
console.log('ALL 5 QURAN ENGINE TESTS PASSED WITH 100% SUCCESS');
console.log('========================================\n');
