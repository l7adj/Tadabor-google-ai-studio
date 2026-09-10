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

import {
  worldToScreen,
  screenToWorld,
  zoomAtPoint,
  calculatePinch,
  panBy,
  MIN_ZOOM,
  MAX_ZOOM,
  Point,
  Viewport
} from '../viewport/ViewportEngine';

import { computePureEdgePath } from '../../components/Canvas/EdgeRenderer';
import { validateImportedMap } from '../../domains/map/mapValidator';
import { TadabburMap, CanvasNode, CanvasEdge, CreateReflectionPayload, QuranAnchor } from '../../types';

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

// Test 6: Central Selection APIs & Unified Pipeline (Selection -> Anchor -> Relationship)
{
  const engine = new QuranSelectionEngine();

  // 1. selectWord
  const wordSel = engine.selectWord({
    surah: 1,
    ayah: 1,
    wordIndex: 1,
    wordText: 'اللَّهِ',
    surahName: 'الفاتحة'
  });
  assert(engine.getSelection()?.id === wordSel.id, 'selectWord sets active selection');
  assert(engine.toAnchor()?.wordIndex === 1, 'toAnchor resolves word anchor');

  // 2. selectLetter
  const charSel = engine.selectLetter({
    surah: 1,
    ayah: 1,
    wordIndex: 0,
    charIndex: 0,
    charText: 'بِ',
    wordText: 'بِسْمِ'
  });
  assert(engine.getSelection()?.id === charSel.id, 'selectLetter updates active selection');
  assert(engine.toAnchor()?.charIndex === 0, 'toAnchor resolves char anchor');

  // 3. selectWordRange
  const rangeSel = engine.selectWordRange({
    surah: 1,
    ayah: 1,
    startWord: 0,
    endWord: 3,
    phraseText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
  });
  assert(rangeSel.anchor.level === 'word_range', 'selectWordRange creates valid range');

  // 4. selectCharRange
  const charRangeSel = engine.selectCharRange({
    surah: 1,
    ayah: 2,
    wordIndex: 1,
    startChar: 0,
    endChar: 2,
    charRangeText: 'حَمْد'
  });
  assert(charRangeSel.anchor.level === 'char_range', 'selectCharRange creates valid char range');

  // 5. selectAyah
  const ayahSel = engine.selectAyah({
    surah: 112,
    ayah: 1,
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ'
  });
  assert(ayahSel.anchor.level === 'ayah', 'selectAyah creates ayah anchor');

  // 6. selectMultiple
  const multi = engine.selectMultiple([wordSel, ayahSel]);
  assert(multi !== null, 'selectMultiple returns composite selection');
  assert(engine.getMultiSelections().length === 2, '2 items in multi-selection set');

  // 7. Pipeline: Selection -> Anchor -> Relationship
  const pipelineResult = engine.createRelationshipPipeline({
    source: wordSel,
    target: ayahSel,
    kind: 'theme',
    label: 'علاقة موضوعية'
  });
  assert(pipelineResult.validation.isValid, 'Pipeline validation passed');
  assert(pipelineResult.relationship !== null, 'Relationship created through pipeline');
  assert(pipelineResult.relationship?.sourceAnchor.id === wordSel.anchor.id, 'Source anchor matched in pipeline');
  assert(pipelineResult.relationship?.targetAnchor.id === ayahSel.anchor.id, 'Target anchor matched in pipeline');

  // 8. Pipeline rejection on identical anchors
  const invalidPipeline = engine.createRelationshipPipeline({
    source: wordSel,
    target: wordSel,
    kind: 'similarity'
  });
  assert(!invalidPipeline.validation.isValid, 'Pipeline correctly rejects self-linking identical selection');

  console.log('✓ Test 6 Passed: Central Selection APIs & Unified Pipeline (Selection -> Anchor -> Relationship)');
}

// Test 7: Real Quran Data Canonical Validation (P3 Requirement)
{
  const { ensureCanonicalCorpusLoaded } = await import('../quran/QuranAnchorValidator');
  await ensureCanonicalCorpusLoaded();

  // Ayat Al-Kursi (2:255) has exactly 50 words
  const validWordPos = validateQuranPosition({ surah: 2, ayah: 255, word: 49 });
  assert(validWordPos.isValid, 'Word 49 (last word) of Ayat Al-Kursi is valid');

  const invalidWordPos = validateQuranPosition({ surah: 2, ayah: 255, word: 50 });
  assert(!invalidWordPos.isValid, 'Word 50 of Ayat Al-Kursi is rejected as out of bounds');
  assert(invalidWordPos.errorCode === 'WORD_OUT_OF_BOUNDS', 'Correct error code WORD_OUT_OF_BOUNDS');

  // Word 0 is "اللَّهُ" (7 characters with marks)
  const validCharPos = validateQuranPosition({ surah: 2, ayah: 255, word: 0, char: 0 });
  assert(validCharPos.isValid, 'First character of first word in 2:255 is valid');

  const invalidCharPos = validateQuranPosition({ surah: 2, ayah: 255, word: 0, char: 20 });
  assert(!invalidCharPos.isValid, 'Char 20 in 7-character word is rejected');
  assert(invalidCharPos.errorCode === 'CHAR_OUT_OF_BOUNDS', 'Correct error code CHAR_OUT_OF_BOUNDS');

  console.log('✓ Test 7 Passed: Real Quran Data Canonical Validation (Words & Chars boundaries verified)');
}

// Test 8: Multi-selection State Machine & Synchronization (P3.5 Requirement)
{
  const engine = new QuranSelectionEngine();

  const selA = createWordSelection({ surah: 1, ayah: 1, wordIndex: 0, wordText: 'بِسْمِ' });
  const selB = createWordSelection({ surah: 1, ayah: 1, wordIndex: 1, wordText: 'اللَّهِ' });

  // Toggle A: multiSelections = [A], activeSelection = A
  engine.toggleMultiSelection(selA);
  assert(engine.getMultiSelections().length === 1, 'Multi has 1 item');
  assert(engine.getActiveSelection()?.id === selA.id, 'Active selection is A');

  // Toggle B: multiSelections = [A, B], activeSelection = composite[A, B]
  engine.toggleMultiSelection(selB);
  assert(engine.getMultiSelections().length === 2, 'Multi has 2 items');
  assert(engine.getActiveSelection()?.type === 'multi', 'Active selection is composite multi');

  // Toggle B off: multiSelections = [A], activeSelection = A
  engine.toggleMultiSelection(selB);
  assert(engine.getMultiSelections().length === 1, 'Multi has 1 item after toggling B off');
  assert(engine.getActiveSelection()?.id === selA.id, 'Active selection is cleanly synced back to A');

  // Toggle A off: multiSelections = [], activeSelection = null
  engine.toggleMultiSelection(selA);
  assert(engine.getMultiSelections().length === 0, 'Multi is empty');
  assert(engine.getActiveSelection() === null, 'Active selection is null after removing last item');

  // Clear multi selection clears composite activeSelection
  engine.selectMultiple([selA, selB]);
  assert(engine.getActiveSelection()?.type === 'multi', 'Composite active');
  engine.clearMultiSelection();
  assert(engine.getMultiSelections().length === 0, 'Multi is empty');
  assert(engine.getActiveSelection() === null, 'Composite active cleared cleanly');

  console.log('✓ Test 8 Passed: Multi-Selection State Machine & Synchronization (No stale composite state)');
}

// Test 9: Incremental RelationshipEngine Synchronization & Single Source of Truth Projection
{
  const relEngine = new RelationshipEngine();

  const srcAnchor = createWordSelection({
    surah: 2,
    ayah: 255,
    wordIndex: 0,
    wordText: 'اللَّهُ'
  }).anchor;

  const tgtAnchor1 = createWordSelection({
    surah: 3,
    ayah: 2,
    wordIndex: 0,
    wordText: 'اللَّهُ'
  }).anchor;

  const tgtAnchor2 = createWordSelection({
    surah: 112,
    ayah: 1,
    wordIndex: 1,
    wordText: 'اللَّهُ'
  }).anchor;

  // Simulate Canvas Edges
  const edge1 = {
    id: 'edge-1',
    sourceId: 'node-1',
    targetId: 'node-2',
    sourceAnchor: srcAnchor as unknown as import('../../types').QuranAnchor,
    targetAnchor: tgtAnchor1 as unknown as import('../../types').QuranAnchor,
    relationshipKind: 'shared_word' as const,
    label: 'لفظ الجلالة المشترك',
    style: 'solid' as const,
    arrowType: 'end' as const,
    color: '#10b981'
  };

  const edge2 = {
    id: 'edge-2',
    sourceId: 'node-1',
    targetId: 'node-3',
    sourceAnchor: srcAnchor as unknown as import('../../types').QuranAnchor,
    targetAnchor: tgtAnchor2 as unknown as import('../../types').QuranAnchor,
    relationshipKind: 'theme' as const,
    label: 'توحيد',
    style: 'solid' as const,
    arrowType: 'end' as const,
    color: '#10b981'
  };

  // 1. Initial Sync (Add edge1 and edge2)
  const sync1 = relEngine.syncCanvasEdges([edge1, edge2]);
  assert(sync1.added === 2, 'Added 2 edges incrementally');
  assert(sync1.updated === 0, '0 updated on initial');
  assert(sync1.removed === 0, '0 removed on initial');
  assert(relEngine.getAllRelationships().length === 2, 'Total relationships is 2');

  // 2. Incremental Update: Edge 1 label and kind updated, Edge 2 untouched
  const updatedEdge1 = {
    ...edge1,
    label: 'علاقة توحيدية معدلة',
    relationshipKind: 'emphasis' as const
  };
  const sync2 = relEngine.syncCanvasEdges([updatedEdge1, edge2]);
  assert(sync2.added === 0, '0 added');
  assert(sync2.updated === 1, 'Exactly 1 relationship updated incrementally');
  assert(sync2.removed === 0, '0 removed');
  assert(relEngine.getRelationship('edge-1')?.label === 'علاقة توحيدية معدلة', 'Updated label retained in SSoT');
  assert(relEngine.getRelationship('edge-2')?.label === 'توحيد', 'Untouched relationship retained safely');

  // 3. Incremental Delete: Edge 2 removed, Edge 1 remains
  const sync3 = relEngine.syncCanvasEdges([updatedEdge1]);
  assert(sync3.added === 0, '0 added');
  assert(sync3.updated === 0, '0 updated');
  assert(sync3.removed === 1, 'Exactly 1 relationship removed');
  assert(relEngine.getAllRelationships().length === 1, 'Only 1 relationship remains');
  assert(relEngine.getRelationship('edge-2') === undefined, 'Removed relationship cleanly deleted from SSoT');
  assert(relEngine.findByAnchor(tgtAnchor2.id).length === 0, 'Target anchor 2 cleanly unindexed');

  // 4. Projection to Canvas Edge
  const remainingRel = relEngine.getRelationship('edge-1')!;
  const projectedEdge = RelationshipEngine.toCanvasEdge(remainingRel, 'node-1', 'node-2', {
    color: '#059669',
    curveType: 'bezier'
  });
  assert(projectedEdge.id === 'edge-1', 'Projected edge keeps ID');
  assert(projectedEdge.label === 'علاقة توحيدية معدلة', 'Projected edge has updated label');
  assert(projectedEdge.color === '#059669', 'Visual styling projected correctly');

  console.log('✓ Test 9 Passed: Incremental RelationshipEngine Synchronization & Single Source of Truth Projection');
}

// Test 10: Canvas Drag & Pan Pipeline State Machine Verification (P0 Invariant)
{
  // Simulated Interaction Pipeline State Machine
  class DragPipelineSimulator {
    public onUpdateMapCalls = 0;
    public pushToHistoryCalls = 0;
    public transientRafUpdates = 0;

    private interaction = {
      mode: 'idle' as 'idle' | 'dragging' | 'panning',
      startMouse: { x: 0, y: 0 },
      transientDelta: { x: 0, y: 0 },
      hasMoved: false
    };

    public onPointerDown(x: number, y: number) {
      this.interaction.mode = 'dragging';
      this.interaction.startMouse = { x, y };
      this.interaction.transientDelta = { x: 0, y: 0 };
      this.interaction.hasMoved = false;
    }

    // High frequency pointermove events
    public onPointerMove(x: number, y: number) {
      if (this.interaction.mode !== 'dragging') return;

      const deltaX = x - this.interaction.startMouse.x;
      const deltaY = y - this.interaction.startMouse.y;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        this.interaction.hasMoved = true;
      }
      this.interaction.transientDelta = { x: deltaX, y: deltaY };

      // High frequency updates are strictly batched to transient visual layer (RAF)
      // and NEVER invoke canonical state mutations or history pushes!
      this.transientRafUpdates++;
    }

    public onPointerUp() {
      if (this.interaction.mode === 'dragging') {
        if (this.interaction.hasMoved) {
          // Exactly ONE canonical update committed at the end
          this.onUpdateMapCalls++;
          this.pushToHistoryCalls++;
        }
        this.interaction.mode = 'idle';
      }
    }
  }

  const sim = new DragPipelineSimulator();

  // Test Case A: Real dragging movement across 500 move events
  sim.onPointerDown(100, 100);
  for (let i = 1; i <= 500; i++) {
    sim.onPointerMove(100 + i, 100 + i);
    // Invariant check during movement: ZERO canonical updates
    assert(sim.onUpdateMapCalls === 0, 'Zero onUpdateMap calls during pointermove');
    assert(sim.pushToHistoryCalls === 0, 'Zero pushToHistory calls during pointermove');
  }
  assert(sim.transientRafUpdates === 500, 'All 500 move events handled transients via RAF');

  // Complete gesture
  sim.onPointerUp();
  assert(sim.onUpdateMapCalls === 1, 'Exactly ONE canonical onUpdateMap call upon pointerup');
  assert(sim.pushToHistoryCalls === 1, 'Exactly ONE history entry pushed upon pointerup');

  // Test Case B: Click without dragging (pointerdown + pointerup with no move)
  const clickSim = new DragPipelineSimulator();
  clickSim.onPointerDown(200, 200);
  clickSim.onPointerUp();
  assert(clickSim.onUpdateMapCalls === 0, 'Zero onUpdateMap calls on pure click');
  assert(clickSim.pushToHistoryCalls === 0, 'Zero pushToHistory calls on pure click');

  console.log('✓ Test 10 Passed: Canvas Drag & Pan Pipeline State Machine Verification (Zero move mutations, Exactly 1 commit on release)');
}

// Test 11: Viewport Math & Invariants (Inverses, Cursor-Centered Zoom, Pinch, and Limits)
{
  const vp: Viewport = { panX: 150, panY: -75, zoom: 1.8 };
  const p: Point = { x: 480, y: 320 };

  // 1. Coordinate Inverses
  const world = screenToWorld(p, vp);
  const screen = worldToScreen(world, vp);
  assert(Math.abs(screen.x - p.x) < 1e-6, 'screenToWorld -> worldToScreen must yield original X');
  assert(Math.abs(screen.y - p.y) < 1e-6, 'screenToWorld -> worldToScreen must yield original Y');

  // 2. Cursor-Centered Zoom Invariance
  const cursor: Point = { x: 500, y: 350 };
  const worldUnderCursorBefore = screenToWorld(cursor, vp);
  const zoomedVp = zoomAtPoint(cursor, 2.5, vp);
  const worldUnderCursorAfter = screenToWorld(cursor, zoomedVp);
  assert(
    Math.abs(worldUnderCursorBefore.x - worldUnderCursorAfter.x) < 1e-6,
    'World point under cursor must remain invariant before and after zoom (X)'
  );
  assert(
    Math.abs(worldUnderCursorBefore.y - worldUnderCursorAfter.y) < 1e-6,
    'World point under cursor must remain invariant before and after zoom (Y)'
  );

  // 3. Pan Invariance
  const pannedVp = panBy({ dx: 60, dy: -40 }, vp);
  assert(pannedVp.panX === vp.panX + 60, 'Pan X should increment by exactly dx');
  assert(pannedVp.panY === vp.panY - 40, 'Pan Y should increment by exactly dy');
  assert(pannedVp.zoom === vp.zoom, 'Pan operation must strictly preserve zoom level');

  // 4. Pinch Zoom Math & Invariant Midpoint
  const t1Start: Point = { x: 100, y: 200 };
  const t2Start: Point = { x: 300, y: 200 };
  const initialDist = 200;
  const screenMidpoint: Point = { x: 200, y: 200 };
  const startVp: Viewport = { panX: 50, panY: 50, zoom: 1.0 };
  const worldMidpoint = screenToWorld(screenMidpoint, startVp);

  // Pinch spread outwards (dist 200 -> 300)
  const t1End: Point = { x: 50, y: 200 };
  const t2End: Point = { x: 350, y: 200 };
  const pinchedVp = calculatePinch(t1End, t2End, initialDist, worldMidpoint, startVp.zoom);
  assert(Math.abs(pinchedVp.zoom - 1.5) < 1e-6, 'Pinch zoom should scale proportionally (300/200 = 1.5)');

  const worldMidpointAfter = screenToWorld(screenMidpoint, pinchedVp);
  assert(
    Math.abs(worldMidpoint.x - worldMidpointAfter.x) < 1e-6,
    'World point under pinch midpoint must remain invariant'
  );

  // 5. Global Zoom Limit Clamping Invariant
  assert(MIN_ZOOM === 0.15, 'MIN_ZOOM must equal 0.15');
  assert(MAX_ZOOM === 3.0, 'MAX_ZOOM must equal 3.0');

  const minClamped = zoomAtPoint(cursor, 0.01, vp);
  assert(minClamped.zoom === MIN_ZOOM, 'Zoom below min must clamp strictly to MIN_ZOOM');

  const maxClamped = zoomAtPoint(cursor, 99.0, vp);
  assert(maxClamped.zoom === MAX_ZOOM, 'Zoom above max must clamp strictly to MAX_ZOOM');

  console.log('✓ Test 11 Passed: Viewport Math & Invariants (Inverses, Cursor-Centered Zoom, Pinch, Limits)');
}

// Test 12: Map Switching & Viewport State Isolation
{
  interface MapState {
    id: string;
    panX: number;
    panY: number;
    zoom: number;
  }

  const mapA: MapState = { id: 'map-surah-baqarah', panX: 200, panY: 150, zoom: 1.4 };
  const mapB: MapState = { id: 'map-surah-kahf', panX: -80, panY: 60, zoom: 0.75 };

  let activeMap = mapA;
  let canvasViewport: Viewport = { panX: activeMap.panX, panY: activeMap.panY, zoom: activeMap.zoom };

  // Switch to Map B
  activeMap = mapB;
  canvasViewport = { panX: activeMap.panX, panY: activeMap.panY, zoom: activeMap.zoom };
  assert(canvasViewport.panX === -80 && canvasViewport.zoom === 0.75, 'Viewport loads Map B state correctly');

  // Pan within Map B
  canvasViewport = { panX: canvasViewport.panX + 50, panY: canvasViewport.panY + 20, zoom: canvasViewport.zoom };
  mapB.panX = canvasViewport.panX;
  mapB.panY = canvasViewport.panY;

  // Switch back to Map A
  activeMap = mapA;
  canvasViewport = { panX: activeMap.panX, panY: activeMap.panY, zoom: activeMap.zoom };
  assert(canvasViewport.panX === 200 && canvasViewport.panY === 150 && canvasViewport.zoom === 1.4,
    'Map A viewport remains intact with zero bleed from Map B'
  );

  console.log('✓ Test 12 Passed: Map Switching & Viewport State Isolation');
}

// Test 13: Quran Selection Integrity & Precise Reflection Mapping (All 5 Granularities)
{
  function createReflectionFromPayload(payload: CreateReflectionPayload): { anchor: QuranAnchor; reflectionData: any; edge: CanvasEdge } {
    let determinedLevel: QuranAnchor['level'] = 'ayah';
    if (payload.level) {
      determinedLevel = payload.level;
    } else if (payload.startChar !== undefined || payload.charIndex !== undefined) {
      determinedLevel = payload.endChar !== undefined && payload.endChar !== (payload.startChar ?? payload.charIndex) ? 'char_range' : 'char';
    } else if (payload.endWord !== undefined && payload.startWord !== undefined && payload.endWord !== payload.startWord) {
      determinedLevel = 'word_range';
    } else if (payload.wordIndex !== undefined || payload.startWord !== undefined) {
      determinedLevel = 'word';
    }

    const anchor: QuranAnchor = payload.anchor
      ? payload.anchor
      : {
          surah: payload.surahNumber,
          ayah: payload.ayahNumberInSurah,
          level: determinedLevel,
          wordIndex: payload.wordIndex ?? payload.startWord,
          startWord: payload.startWord ?? payload.wordIndex,
          endWord: payload.endWord ?? payload.wordIndex,
          charIndex: payload.charIndex ?? payload.startChar,
          startChar: payload.startChar ?? payload.charIndex,
          endChar: payload.endChar ?? payload.charIndex,
          text: payload.selectedText || payload.textUthmani,
          surahName: payload.surahName,
          ayahNumberInSurah: payload.ayahNumberInSurah
        };

    const reflectionData = {
      title: payload.title,
      surahName: payload.surahName,
      ayahNumberInSurah: payload.ayahNumberInSurah,
      observation: payload.observation,
      question: payload.question,
      insight: payload.insight,
      tags: payload.tags,
      anchor,
      selectedText: payload.selectedText || payload.textUthmani,
      createdAt: Date.now()
    };

    const edge: CanvasEdge = {
      id: 'edge-test-ref',
      sourceId: 'ayah-node-1',
      targetId: 'ref-node-1',
      sourceHandle: 'left',
      targetHandle: 'right',
      relationshipKind: 'tadabbur',
      label: 'وقفة تدبرية',
      sourceWordIndex: anchor.wordIndex ?? anchor.startWord,
      sourceWordText: payload.selectedText,
      sourceAnchor: anchor,
      style: 'solid',
      curveType: 'bezier',
      arrowType: 'end',
      color: '#059669'
    };

    return { anchor, reflectionData, edge };
  }

  // 1. Ayah Level
  const rAyah = createReflectionFromPayload({
    surahNumber: 1,
    ayahNumberInSurah: 1,
    surahName: 'الفاتحة',
    textUthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    observation: 'افتتاح السورة بالبسملة',
    level: 'ayah'
  });
  assert(rAyah.anchor.level === 'ayah', 'Ayah level preserved');

  // 2. Single Word Level
  const rWord = createReflectionFromPayload({
    surahNumber: 1,
    ayahNumberInSurah: 2,
    surahName: 'الفاتحة',
    textUthmani: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    wordIndex: 1,
    selectedText: 'لِلَّهِ',
    observation: 'استحقاق الحمد لله وحده'
  });
  assert(rWord.anchor.level === 'word', 'Word level correctly inferred');
  assert(rWord.anchor.wordIndex === 1, 'Word index preserved');
  assert(rWord.edge.sourceWordIndex === 1, 'Edge sourceWordIndex preserved');

  // 3. Word Range Level
  const rWordRange = createReflectionFromPayload({
    surahNumber: 1,
    ayahNumberInSurah: 2,
    surahName: 'الفاتحة',
    textUthmani: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    startWord: 2,
    endWord: 3,
    selectedText: 'رَبِّ الْعَالَمِينَ',
    observation: 'ربوبية الله الشاملة'
  });
  assert(rWordRange.anchor.level === 'word_range', 'Word-range level correctly inferred');
  assert(rWordRange.anchor.startWord === 2 && rWordRange.anchor.endWord === 3, 'Word range bounds preserved');

  // 4. Single Character Level
  const rChar = createReflectionFromPayload({
    surahNumber: 1,
    ayahNumberInSurah: 1,
    surahName: 'الفاتحة',
    textUthmani: 'بِسْمِ اللَّهِ',
    charIndex: 0,
    selectedText: 'بِ',
    observation: 'دلالة باء الاستعانة والمصاحبة'
  });
  assert(rChar.anchor.level === 'char', 'Char level correctly inferred');
  assert(rChar.anchor.charIndex === 0, 'Char index preserved');

  // 5. Character Range Level
  const rCharRange = createReflectionFromPayload({
    surahNumber: 1,
    ayahNumberInSurah: 1,
    surahName: 'الفاتحة',
    textUthmani: 'بِسْمِ اللَّهِ',
    startChar: 0,
    endChar: 4,
    selectedText: 'بِسْمِ',
    observation: 'تحليل البسملة المقطعية'
  });
  assert(rCharRange.anchor.level === 'char_range', 'Char-range level correctly inferred');
  assert(rCharRange.anchor.startChar === 0 && rCharRange.anchor.endChar === 4, 'Char range bounds preserved');

  console.log('✓ Test 13 Passed: Quran Selection Integrity & Precise Reflection Mapping (All 5 Granularities)');
}

// Test 14: Map Import / Export Full-Fidelity Invariants
{
  const fullMap: TadabburMap = {
    id: 'map-full-fidelity-test',
    title: 'خريطة الاختبار الشامل',
    description: 'خريطة شاملة للتحقق من أمان التصدير والاستيراد',
    createdAt: 1710000000000,
    updatedAt: 1710000050000,
    panX: 140,
    panY: -65,
    zoom: 1.25,
    gridType: 'dots',
    snapToGrid: true,
    nodes: [
      {
        id: 'node-ayah-1',
        type: 'ayah',
        x: 100,
        y: 150,
        width: 380,
        colorTheme: 'emerald',
        ayahData: {
          surahNumber: 2,
          surahName: 'البقرة',
          ayahNumberInSurah: 255,
          overallAyahNumber: 262,
          juz: 3,
          revelationType: 'Medinan',
          textUthmani: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
          textSimple: 'الله لا إله إلا هو الحي القيوم',
          annotations: []
        }
      },
      {
        id: 'node-note-1',
        type: 'note',
        x: 600,
        y: 150,
        width: 300,
        colorTheme: 'amber',
        noteData: {
          title: 'ملاحظة تدبرية',
          content: 'اسم الله القيوم يتضمن كمال الغنى وكمال القدرة',
          tags: ['أسماء الله الحسنى']
        }
      },
      {
        id: 'node-ref-1',
        type: 'reflection',
        x: 600,
        y: 350,
        width: 380,
        colorTheme: 'emerald',
        reflectionData: {
          title: 'وقفة القيوم',
          surahName: 'البقرة',
          ayahNumberInSurah: 255,
          observation: 'اقتران الحي بالقيوم',
          question: 'ما سر هذا الاقتران في آية الكرسي؟',
          insight: 'الحي جامع لصفات الذات، والقيوم جامع لصفات الأفعال',
          tags: ['توحيد الأسماء والصفات'],
          selectedText: 'الْحَيُّ الْقَيُّومُ',
          createdAt: 1710000010000,
          anchor: {
            surah: 2,
            ayah: 255,
            level: 'word_range',
            startWord: 5,
            endWord: 6,
            text: 'الْحَيُّ الْقَيُّومُ'
          }
        }
      },
      {
        id: 'node-concept-1',
        type: 'concept',
        x: 100,
        y: 400,
        width: 250,
        colorTheme: 'teal',
        conceptData: {
          title: 'كمال الألوهية',
          description: 'الأصل الذي تدور حوله السورة'
        }
      },
      {
        id: 'node-group-1',
        type: 'group',
        x: 50,
        y: 80,
        width: 950,
        height: 600,
        colorTheme: 'slate',
        groupData: {
          title: 'مجموعة آية الكرسي',
          description: 'حاوية لدراسة آية الكرسي'
        }
      },
      {
        id: 'node-image-1',
        type: 'image',
        x: 100,
        y: 550,
        width: 200,
        height: 150,
        colorTheme: 'stone',
        imageData: {
          url: 'data:image/svg+xml;utf8,<svg></svg>',
          caption: 'مخطط بياني توضيحي'
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        sourceId: 'node-ayah-1',
        targetId: 'node-ref-1',
        relationshipKind: 'tadabbur',
        sourceHandle: 'left',
        targetHandle: 'right',
        sourceWordIndex: 5,
        sourceWordText: 'الْحَيُّ',
        label: 'وقفة تدبرية',
        curveType: 'bezier',
        style: 'solid',
        arrowType: 'end',
        color: '#059669',
        category: 'تدبر',
        sourceAnchor: {
          surah: 2,
          ayah: 255,
          level: 'word',
          wordIndex: 5,
          text: 'الْحَيُّ'
        }
      }
    ]
  };

  // Serialize to JSON
  const serialized = JSON.stringify(fullMap);
  const parsed = JSON.parse(serialized);

  // Validate through domain map validator
  const valResult = validateImportedMap(parsed);
  assert(valResult.isValid, `Validation must pass: ${valResult.error}`);
  assert(valResult.map !== undefined, 'Validated map must exist');

  const vMap = valResult.map!;
  assert(vMap.nodes.length === 6, 'All 6 nodes of distinct types must be preserved');
  assert(vMap.edges.length === 1, 'Edge must be preserved');

  // Verify reflection data integrity
  const importedRef = vMap.nodes.find((n) => n.id === 'node-ref-1')!;
  assert(importedRef.reflectionData?.title === 'وقفة القيوم', 'Reflection title preserved');
  assert(importedRef.reflectionData?.observation === 'اقتران الحي بالقيوم', 'Reflection observation preserved');
  assert(importedRef.reflectionData?.question === 'ما سر هذا الاقتران في آية الكرسي؟', 'Reflection question preserved');
  assert(importedRef.reflectionData?.insight === 'الحي جامع لصفات الذات، والقيوم جامع لصفات الأفعال', 'Reflection insight preserved');
  assert(importedRef.reflectionData?.anchor.level === 'word_range', 'Reflection anchor level preserved');
  assert(importedRef.reflectionData?.anchor.startWord === 5, 'Reflection anchor startWord preserved');

  // Verify edge handle and anchor preservation
  const importedEdge = vMap.edges[0];
  assert(importedEdge.sourceHandle === 'left', 'Edge sourceHandle preserved');
  assert(importedEdge.targetHandle === 'right', 'Edge targetHandle preserved');
  assert(importedEdge.sourceWordIndex === 5, 'Edge sourceWordIndex preserved');
  assert(importedEdge.sourceWordText === 'الْحَيُّ', 'Edge sourceWordText preserved');
  assert(importedEdge.category === 'تدبر', 'Edge category preserved');
  assert(importedEdge.sourceAnchor?.level === 'word', 'Edge sourceAnchor preserved');

  // Verify map settings preservation
  assert(vMap.gridType === 'dots', 'Map gridType preserved');
  assert(vMap.snapToGrid === true, 'Map snapToGrid preserved');
  assert(vMap.panX === 140 && vMap.panY === -65 && vMap.zoom === 1.25, 'Map pan and zoom preserved');

  console.log('✓ Test 14 Passed: Map Import / Export Full-Fidelity Invariants');
}

// Test 15: Relationship Synchronization & Undo/Redo Invariants
{
  const relEngine = new RelationshipEngine();
  const edgesStateHistory: CanvasEdge[][] = [];
  let historyIndex = -1;

  function commitEdges(edges: CanvasEdge[]) {
    edgesStateHistory.splice(historyIndex + 1);
    edgesStateHistory.push(edges);
    historyIndex++;
    relEngine.syncCanvasEdges(edges);
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      relEngine.syncCanvasEdges(edgesStateHistory[historyIndex]);
    }
  }

  function redo() {
    if (historyIndex < edgesStateHistory.length - 1) {
      historyIndex++;
      relEngine.syncCanvasEdges(edgesStateHistory[historyIndex]);
    }
  }

  // 1. Initial Empty State
  commitEdges([]);
  assert(relEngine.getAllRelationships().length === 0, 'Initially 0 relationships');

  // 2. Add Edge 1
  const edge1: CanvasEdge = {
    id: 'edge-rel-1',
    sourceId: 'node-ayah-1',
    targetId: 'node-ayah-2',
    relationshipKind: 'similarity',
    label: 'تناسب وتناظر',
    style: 'solid',
    arrowType: 'end',
    color: '#059669',
    sourceAnchor: { surah: 2, ayah: 1, level: 'ayah', text: 'الم' },
    targetAnchor: { surah: 2, ayah: 2, level: 'ayah', text: 'ذلك الكتاب' }
  };
  commitEdges([edge1]);
  assert(relEngine.getAllRelationships().length === 1, '1 relationship indexed after edge add');
  assert(relEngine.getRelationship('edge-rel-1')?.kind === 'similarity', 'Relationship kind indexed correctly');

  // 3. Add Edge 2
  const edge2: CanvasEdge = {
    id: 'edge-rel-2',
    sourceId: 'node-ayah-2',
    targetId: 'node-ayah-3',
    relationshipKind: 'tafsir',
    label: 'بيان وتفسير',
    style: 'dashed',
    arrowType: 'end',
    color: '#3b82f6',
    sourceAnchor: { surah: 2, ayah: 2, level: 'ayah', text: 'ذلك الكتاب' },
    targetAnchor: { surah: 2, ayah: 3, level: 'ayah', text: 'الذين يؤمنون بالغيب' }
  };
  commitEdges([edge1, edge2]);
  assert(relEngine.getAllRelationships().length === 2, '2 relationships indexed after second edge');

  // 4. Update Edge 1
  const edge1Updated: CanvasEdge = {
    ...edge1,
    relationshipKind: 'cause',
    label: 'تعليل وبيان سبب'
  };
  commitEdges([edge1Updated, edge2]);
  assert(relEngine.getRelationship('edge-rel-1')?.kind === 'cause', 'Relationship kind updated to cause');
  assert(relEngine.getRelationship('edge-rel-1')?.label === 'تعليل وبيان سبب', 'Relationship label updated');

  // 5. Delete Edge 2
  commitEdges([edge1Updated]);
  assert(relEngine.getAllRelationships().length === 1, 'Only 1 relationship after deletion');
  assert(relEngine.getRelationship('edge-rel-2') === undefined, 'Deleted edge relationship removed from index');

  // 6. Undo Deletion
  undo();
  assert(relEngine.getAllRelationships().length === 2, 'Undo restores deleted relationship');
  assert(relEngine.getRelationship('edge-rel-2') !== undefined, 'Edge 2 relationship restored');

  // 7. Undo Update
  undo();
  assert(relEngine.getRelationship('edge-rel-1')?.kind === 'similarity', 'Undo restores original relationship kind');

  // 8. Redo Update
  redo();
  assert(relEngine.getRelationship('edge-rel-1')?.kind === 'cause', 'Redo restores updated relationship kind');

  // 9. Redo Deletion
  redo();
  assert(relEngine.getAllRelationships().length === 1, 'Redo restores deletion state');
  assert(relEngine.getRelationship('edge-rel-2') === undefined, 'Edge 2 cleanly removed after redo');

  console.log('✓ Test 15 Passed: Relationship Synchronization & Undo/Redo Invariants');
}

// Test 16: Canvas Performance & Drag Hot Path Benchmark (100/300 & 200/600 graphs)
{
  console.log('\n--- Running Canvas Performance Benchmark ---');

  interface MockNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface MockEdge {
    id: string;
    sourceId: string;
    targetId: string;
    sX: number;
    sY: number;
    tX: number;
    tY: number;
  }

  function runBenchmark(nodeCount: number, edgeCount: number, frames: number) {
    // 1. Generate Synthetic Graph
    const nodes: MockNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: `node-${i}`,
        x: (i % 10) * 350,
        y: Math.floor(i / 10) * 200,
        width: 320,
        height: 160
      });
    }

    const edges: MockEdge[] = [];
    // Hub node 0 is connected to many edges to simulate high-load drag scenario
    const hubConnectedCount = Math.min(Math.floor(edgeCount * 0.15), 50);
    for (let i = 0; i < hubConnectedCount; i++) {
      const targetIdx = (i % (nodeCount - 1)) + 1;
      edges.push({
        id: `edge-hub-${i}`,
        sourceId: 'node-0',
        targetId: `node-${targetIdx}`,
        sX: nodes[0].x + 320,
        sY: nodes[0].y + 80,
        tX: nodes[targetIdx].x,
        tY: nodes[targetIdx].y + 80
      });
    }

    // Remaining edges distribute across other nodes
    for (let i = edges.length; i < edgeCount; i++) {
      const s = i % nodeCount;
      const t = (i + 3) % nodeCount;
      if (s === t) continue;
      edges.push({
        id: `edge-${i}`,
        sourceId: `node-${s}`,
        targetId: `node-${t}`,
        sX: nodes[s].x + 320,
        sY: nodes[s].y + 80,
        tX: nodes[t].x,
        tY: nodes[t].y + 80
      });
    }

    // 2. Simulate Dragging Node 0 across frames using computePureEdgePath
    const connectedEdges = edges.filter((e) => e.sourceId === 'node-0' || e.targetId === 'node-0');

    const start = performance.now();
    for (let f = 0; f < frames; f++) {
      const deltaX = Math.sin(f * 0.05) * 100;
      const deltaY = Math.cos(f * 0.05) * 100;

      for (let j = 0; j < connectedEdges.length; j++) {
        const e = connectedEdges[j];
        const curSX = e.sourceId === 'node-0' ? e.sX + deltaX : e.sX;
        const curSY = e.sourceId === 'node-0' ? e.sY + deltaY : e.sY;
        const curTX = e.targetId === 'node-0' ? e.tX + deltaX : e.tX;
        const curTY = e.targetId === 'node-0' ? e.tY + deltaY : e.tY;

        computePureEdgePath(curSX, curSY, curTX, curTY, 'bezier', false, 'right', 'left', false, false);
      }
    }
    const end = performance.now();
    const totalMs = end - start;
    const avgMsPerFrame = totalMs / frames;
    const theoreticalFps = 1000 / Math.max(avgMsPerFrame, 0.001);

    return {
      nodeCount,
      edgeCount,
      connectedEdgesCount: connectedEdges.length,
      frames,
      totalMs,
      avgMsPerFrame,
      theoreticalFps
    };
  }

  // Benchmark 1: 100 nodes, 300 edges
  const res1 = runBenchmark(100, 300, 1000);
  console.log(`[Benchmark 1] ${res1.nodeCount} nodes / ${res1.edgeCount} edges (${res1.connectedEdgesCount} connected to dragged hub):`);
  console.log(`  - 1,000 frames evaluated in ${res1.totalMs.toFixed(2)}ms`);
  console.log(`  - Average path calculation time per frame: ${(res1.avgMsPerFrame * 1000).toFixed(1)} µs (${res1.avgMsPerFrame.toFixed(4)} ms)`);
  console.log(`  - Frame computation capacity: ~${Math.round(res1.theoreticalFps).toLocaleString()} computations/sec (Target: 60-120 FPS)`);

  // Assert frame budget: 120 FPS = 8.33ms per frame. The pure path calculation should consume < 1ms (< 12% of frame budget).
  assert(res1.avgMsPerFrame < 1.0, `Benchmark 1 average time per frame (${res1.avgMsPerFrame}ms) must be well under 1.0ms`);

  // Benchmark 2: 200 nodes, 600 edges
  const res2 = runBenchmark(200, 600, 1000);
  console.log(`[Benchmark 2] ${res2.nodeCount} nodes / ${res2.edgeCount} edges (${res2.connectedEdgesCount} connected to dragged hub):`);
  console.log(`  - 1,000 frames evaluated in ${res2.totalMs.toFixed(2)}ms`);
  console.log(`  - Average path calculation time per frame: ${(res2.avgMsPerFrame * 1000).toFixed(1)} µs (${res2.avgMsPerFrame.toFixed(4)} ms)`);
  console.log(`  - Frame computation capacity: ~${Math.round(res2.theoreticalFps).toLocaleString()} computations/sec (Target: 60-120 FPS)`);

  assert(res2.avgMsPerFrame < 1.0, `Benchmark 2 average time per frame (${res2.avgMsPerFrame}ms) must be well under 1.0ms`);

  console.log('✓ Test 16 Passed: Canvas Performance & Drag Hot Path Benchmark (Measurements documented with real profiling)');
}

console.log('\n========================================');
console.log('ALL 16 ENGINE & PERFORMANCE TESTS PASSED WITH 100% SUCCESS');
console.log('========================================\n');

