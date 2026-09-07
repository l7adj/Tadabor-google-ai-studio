import { useState, useEffect, useCallback } from 'react';
import { globalSelectionEngine, QuranSelectionEngine } from './QuranSelectionEngine';
import { QuranSelection } from './QuranSelection';
import { QuranAnchorV2 } from './QuranAnchor';
import { RelationshipKind } from '../../types';
import { QuranRelationship } from '../relationship/QuranRelationship';
import { ValidationResult } from './QuranAnchorValidator';

/**
 * React hook to bind any UI component to the global QuranSelectionEngine
 */
export function useQuranSelection(engine: QuranSelectionEngine = globalSelectionEngine) {
  const [activeSelection, setActiveSelection] = useState<QuranSelection | null>(
    engine.getSelection()
  );
  const [multiSelections, setMultiSelections] = useState<QuranSelection[]>(
    engine.getMultiSelections()
  );

  useEffect(() => {
    // Initial sync
    setActiveSelection(engine.getSelection());
    setMultiSelections(engine.getMultiSelections());

    const unsubscribe = engine.subscribe((active, multi) => {
      setActiveSelection(active);
      setMultiSelections(multi);
    });

    return unsubscribe;
  }, [engine]);

  const selectWord = useCallback(
    (options: {
      surah: number;
      ayah: number;
      wordIndex: number;
      wordText: string;
      surahName?: string;
    }) => engine.selectWord(options),
    [engine]
  );

  const selectLetter = useCallback(
    (options: {
      surah: number;
      ayah: number;
      wordIndex: number;
      charIndex: number;
      charText: string;
      wordText?: string;
      surahName?: string;
    }) => engine.selectLetter(options),
    [engine]
  );

  const selectWordRange = useCallback(
    (options: {
      surah: number;
      ayah: number;
      startWord: number;
      endWord: number;
      phraseText: string;
      surahName?: string;
    }) => engine.selectWordRange(options),
    [engine]
  );

  const selectCharRange = useCallback(
    (options: {
      surah: number;
      ayah: number;
      wordIndex: number;
      startChar: number;
      endChar: number;
      charRangeText: string;
      wordText?: string;
      surahName?: string;
    }) => engine.selectCharRange(options),
    [engine]
  );

  const selectAyah = useCallback(
    (options: {
      surah: number;
      ayah: number;
      text: string;
      surahName?: string;
    }) => engine.selectAyah(options),
    [engine]
  );

  const selectAyahRange = useCallback(
    (options: {
      surah: number;
      startAyah: number;
      endAyah: number;
      text: string;
      surahName?: string;
    }) => engine.selectAyahRange(options),
    [engine]
  );

  const selectMultiple = useCallback(
    (selections: QuranSelection[]) => engine.selectMultiple(selections),
    [engine]
  );

  const toggleMultiSelection = useCallback(
    (selection: QuranSelection) => engine.toggleMultiSelection(selection),
    [engine]
  );

  const clearSelection = useCallback(() => engine.clearSelection(), [engine]);
  const clearMultiSelection = useCallback(() => engine.clearMultiSelection(), [engine]);
  const clearAll = useCallback(() => engine.clearAll(), [engine]);

  const toAnchor = useCallback(
    (selection?: QuranSelection | null): QuranAnchorV2 | null => engine.toAnchor(selection),
    [engine]
  );

  const createRelationshipPipeline = useCallback(
    (params: {
      source: QuranSelection;
      target: QuranSelection;
      kind: RelationshipKind;
      customRelationship?: string;
      label?: string;
      note?: string;
      createdBy?: 'user' | 'system' | 'ai';
    }): { relationship: QuranRelationship | null; validation: ValidationResult } =>
      engine.createRelationshipPipeline(params),
    [engine]
  );

  return {
    selection: activeSelection,
    activeSelection,
    multiSelections,
    hasSelection: activeSelection !== null,
    hasMultiSelection: multiSelections.length > 0,
    selectWord,
    selectLetter,
    selectWordRange,
    selectCharRange,
    selectAyah,
    selectAyahRange,
    selectMultiple,
    toggleMultiSelection,
    clearSelection,
    clearMultiSelection,
    clearAll,
    toAnchor,
    createRelationshipPipeline
  };
}
