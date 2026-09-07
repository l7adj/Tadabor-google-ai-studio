import {
  QuranSelection,
  QuranSelectionType,
  createCharSelection,
  createCharRangeSelection,
  createWordSelection,
  createWordRangeSelection,
  createAyahSelection,
  createAyahRangeSelection,
  createMultiSelection
} from './QuranSelection';
import { QuranAnchorV2 } from './QuranAnchor';
import { validateQuranAnchor, ValidationResult } from './QuranAnchorValidator';
import { QuranRelationship, createQuranRelationship } from '../relationship/QuranRelationship';
import { validateRelationship } from '../relationship/RelationshipValidator';
import { RelationshipKind } from '../../types';

export type SelectionChangeListener = (
  current: QuranSelection | null,
  multiSet: QuranSelection[]
) => void;

/**
 * QuranSelectionEngine: The central state machine governing user selections
 * across the entire Quranic application.
 *
 * Implements the full pipeline: Selection -> Anchor -> Relationship
 */
export class QuranSelectionEngine {
  private activeSelection: QuranSelection | null = null;
  private multiSelections: Map<string, QuranSelection> = new Map();
  private listeners: Set<SelectionChangeListener> = new Set();

  /**
   * Gets the single primary active selection
   */
  public getSelection(): QuranSelection | null {
    return this.activeSelection;
  }

  /**
   * Alias for getSelection() for consistency
   */
  public getActiveSelection(): QuranSelection | null {
    return this.activeSelection;
  }

  /**
   * Gets all items in the multi-selection set
   */
  public getMultiSelections(): QuranSelection[] {
    return Array.from(this.multiSelections.values());
  }

  /**
   * Validates any selection against the Quranic canonical rules
   */
  public validateSelection(selection: QuranSelection): ValidationResult {
    if (!selection || !selection.anchor) {
      return {
        isValid: false,
        errorCode: 'NULL_SELECTION',
        errorMessage: 'التحديد غير موجود أو خالي من المرساة القرآنية'
      };
    }
    return validateQuranAnchor(selection.anchor);
  }

  /**
   * Sets the single active selection (replaces current)
   */
  public select(selection: QuranSelection | null): boolean {
    if (selection) {
      const val = this.validateSelection(selection);
      if (!val.isValid) {
        console.warn('QuranSelectionEngine: Invalid selection rejected:', val.errorMessage);
        return false;
      }
    }
    this.activeSelection = selection;
    this.notify();
    return true;
  }

  /**
   * Central API: Selects a single letter / character
   */
  public selectLetter(options: {
    surah: number;
    ayah: number;
    wordIndex: number;
    charIndex: number;
    charText: string;
    wordText?: string;
    surahName?: string;
  }): QuranSelection {
    const sel = createCharSelection(options);
    this.select(sel);
    return sel;
  }

  /**
   * Central API: Selects a single Quranic word
   */
  public selectWord(options: {
    surah: number;
    ayah: number;
    wordIndex: number;
    wordText: string;
    surahName?: string;
  }): QuranSelection {
    const sel = createWordSelection(options);
    this.select(sel);
    return sel;
  }

  /**
   * Central API: Selects a contiguous range of words (sentence, phrase, idiom)
   */
  public selectWordRange(options: {
    surah: number;
    ayah: number;
    startWord: number;
    endWord: number;
    phraseText: string;
    surahName?: string;
  }): QuranSelection {
    const sel = createWordRangeSelection(options);
    this.select(sel);
    return sel;
  }

  /**
   * Central API: Selects a sub-range of characters within a word (root letters, prefixes, affixes)
   */
  public selectCharRange(options: {
    surah: number;
    ayah: number;
    wordIndex: number;
    startChar: number;
    endChar: number;
    charRangeText?: string;
    charsText?: string;
    wordText?: string;
    surahName?: string;
  }): QuranSelection {
    const text = options.charRangeText || options.charsText || '';
    const sel = createCharRangeSelection({
      surah: options.surah,
      ayah: options.ayah,
      wordIndex: options.wordIndex,
      startChar: options.startChar,
      endChar: options.endChar,
      charsText: text,
      wordText: options.wordText,
      surahName: options.surahName
    });
    this.select(sel);
    return sel;
  }

  /**
   * Central API: Selects a complete Ayah
   */
  public selectAyah(options: {
    surah: number;
    ayah: number;
    text: string;
    surahName?: string;
  }): QuranSelection {
    const sel = createAyahSelection(options);
    this.select(sel);
    return sel;
  }

  /**
   * Central API: Selects an Ayah range (passage or story arc)
   */
  public selectAyahRange(options: {
    surah: number;
    startAyah: number;
    endAyah: number;
    text: string;
    surahName?: string;
  }): QuranSelection {
    const sel = createAyahRangeSelection(options);
    this.select(sel);
    return sel;
  }

  /**
   * Central API: Selects multiple non-contiguous selections
   */
  public selectMultiple(selections: QuranSelection[]): QuranSelection | null {
    if (!selections || selections.length === 0) {
      this.clearMultiSelection();
      return null;
    }

    this.multiSelections.clear();
    for (const sel of selections) {
      const val = this.validateSelection(sel);
      if (val.isValid) {
        this.multiSelections.set(sel.id, sel);
      }
    }

    const composite = createMultiSelection(Array.from(this.multiSelections.values()));
    this.activeSelection = composite;
    this.notify();
    return composite;
  }

  /**
   * Toggles an item in the multi-selection set (Shift+Click / Multi-mode)
   */
  public toggleMultiSelection(selection: QuranSelection): void {
    if (this.multiSelections.has(selection.id)) {
      this.multiSelections.delete(selection.id);
    } else {
      const val = this.validateSelection(selection);
      if (val.isValid) {
        this.multiSelections.set(selection.id, selection);
      }
    }
    this.notify();
  }

  /**
   * Clears multi-selection set
   */
  public clearMultiSelection(): void {
    this.multiSelections.clear();
    this.notify();
  }

  /**
   * Clears single active selection
   */
  public clearSelection(): void {
    this.activeSelection = null;
    this.notify();
  }

  /**
   * Clears all active and multi-selections
   */
  public clearAll(): void {
    this.activeSelection = null;
    this.multiSelections.clear();
    this.notify();
  }

  /**
   * Converts a selection into an immutable QuranAnchorV2
   */
  public toAnchor(selection?: QuranSelection | null): QuranAnchorV2 | null {
    const target = selection ?? this.activeSelection;
    if (!target) return null;
    return target.anchor;
  }

  /**
   * Official Pipeline: Transforms Selection + Selection -> QuranRelationship
   */
  public createRelationshipPipeline(params: {
    source: QuranSelection;
    target: QuranSelection;
    kind: RelationshipKind;
    customRelationship?: string;
    label?: string;
    note?: string;
    createdBy?: 'user' | 'system' | 'ai';
  }): { relationship: QuranRelationship | null; validation: ValidationResult } {
    const srcVal = this.validateSelection(params.source);
    if (!srcVal.isValid) {
      return { relationship: null, validation: srcVal };
    }

    const tgtVal = this.validateSelection(params.target);
    if (!tgtVal.isValid) {
      return { relationship: null, validation: tgtVal };
    }

    const relationship = createQuranRelationship({
      sourceAnchor: params.source.anchor,
      targetAnchor: params.target.anchor,
      kind: params.kind,
      customRelationship: params.customRelationship,
      label: params.label,
      note: params.note,
      createdBy: params.createdBy
    });
    relationship.sourceSelection = params.source;
    relationship.targetSelection = params.target;

    const relVal = validateRelationship(relationship);
    if (!relVal.isValid) {
      return { relationship: null, validation: relVal };
    }

    return { relationship, validation: { isValid: true } };
  }

  /**
   * Subscribes to selection state changes
   */
  public subscribe(listener: SelectionChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const active = this.activeSelection;
    const multi = Array.from(this.multiSelections.values());
    this.listeners.forEach((fn) => {
      try {
        fn(active, multi);
      } catch (err) {
        console.error('QuranSelectionEngine: listener error:', err);
      }
    });
  }

  /**
   * Generates a composite anchor from the multi-selection set
   */
  public getCompositeMultiAnchor(): QuranAnchorV2 | null {
    const list = this.getMultiSelections();
    if (list.length === 0) return null;
    if (list.length === 1) return list[0].anchor;

    const multiSel = createMultiSelection(list);
    return multiSel.anchor;
  }
}

// Global Singleton Instance
export const globalSelectionEngine = new QuranSelectionEngine();
