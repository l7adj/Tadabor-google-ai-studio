import {
  QuranSelection,
  QuranSelectionType,
  createCharSelection,
  createCharRangeSelection,
  createWordSelection,
  createWordRangeSelection,
  createAyahSelection,
  createMultiSelection
} from './QuranSelection';
import { QuranAnchorV2 } from './QuranAnchor';
import { validateQuranAnchor } from './QuranAnchorValidator';

type SelectionChangeListener = (
  current: QuranSelection | null,
  multiSet: QuranSelection[]
) => void;

/**
 * QuranSelectionEngine: The central state machine governing user selections
 * across the entire Quranic application.
 */
export class QuranSelectionEngine {
  private activeSelection: QuranSelection | null = null;
  private multiSelections: Map<string, QuranSelection> = new Map();
  private listeners: Set<SelectionChangeListener> = new Set();

  /**
   * Gets the single primary active selection
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
   * Sets the single active selection (replaces current)
   */
  public select(selection: QuranSelection | null): boolean {
    if (selection) {
      const val = validateQuranAnchor(selection.anchor);
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
   * Toggles an item in the multi-selection set (Shift+Click / Multi-mode)
   */
  public toggleMultiSelection(selection: QuranSelection): void {
    if (this.multiSelections.has(selection.id)) {
      this.multiSelections.delete(selection.id);
    } else {
      const val = validateQuranAnchor(selection.anchor);
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
   * Clears all active and multi-selections
   */
  public clearAll(): void {
    this.activeSelection = null;
    this.multiSelections.clear();
    this.notify();
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
