export type SearchMode = 'literal' | 'root' | 'semantic';

export interface AyahData {
  number: number;
  numberInSurah: number;
  juz: number;
  page: number;
  textUthmani: string;
  textSimple: string;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string; // 'Meccan' | 'Medinan'
  numberOfAyahs: number;
  ayahs: AyahData[];
}

export interface QuranCorpus {
  surahsCount: number;
  surahs: SurahData[];
}

export interface SearchResultItem {
  surahNumber: number;
  surahName: string;
  revelationType: string;
  ayahNumberInSurah: number;
  overallAyahNumber: number;
  juz: number;
  page: number;
  textUthmani: string;
  textSimple: string;
  matchedRoot?: string;
  matchedWords?: string[];
  semanticTopic?: string;
}

export interface RootDictionaryEntry {
  root: string; // e.g. "رحم"
  description: string; // Meaning summary
  primaryDerivatives: string[]; // e.g. ["الرحمن", "الرحيم", "يرحم", "رحمة"]
  occurrenceCountApprox?: number;
  suggestedVerses?: Array<{ surah: number; ayah: number; label?: string }>;
}

export interface SemanticTopic {
  id: string;
  title: string;
  category: string;
  iconName?: string;
  description: string;
  keywords: string[];
  sampleAyahs: Array<{
    surahNumber: number;
    ayahNumber: number;
    tadabburNote: string;
    label?: string;
  }>;
}

export interface SearchResponse {
  query: string;
  mode: SearchMode;
  totalMatches: number;
  surahsCount: number;
  results: SearchResultItem[];
  matchedRootInfo?: {
    root: string;
    description: string;
    primaryDerivatives: string[];
  };
  matchedSemanticTopic?: {
    title: string;
    description: string;
  };
}

// Mind Map & Canvas types
export type NodeType = 'ayah' | 'note' | 'image' | 'concept' | 'group';

export interface WordAnnotation {
  id: string;
  wordIndex: number; // 0-based word index in the ayah
  wordText: string;
  type: 'circle' | 'highlight' | 'underline';
  color: string; // Hex or CSS color
  note?: string; // Optional reflection on this specific word
  endWordIndex?: number; // For designating two or more consecutive words (كلمتين أو أكثر)
  phraseText?: string;   // Combined text of designated words
  charIndex?: number;    // If a specific letter is designated within word
  charText?: string;     // Designated letter/character
}

export interface AyahNodeData {
  surahNumber: number;
  surahName: string;
  ayahNumberInSurah: number;
  overallAyahNumber?: number;
  page?: number;
  juz: number;
  revelationType: string;
  textUthmani: string;
  textSimple: string;
  annotations: WordAnnotation[];
  tafsir?: string;
}

export interface NoteNodeData {
  title: string;
  content: string;
  tags: string[];
  referenceSurah?: number;
  referenceAyah?: number;
  referenceText?: string;
}

export interface ImageNodeData {
  url: string;
  caption: string;
  referenceSurah?: number;
  referenceAyah?: number;
}

export interface ConceptNodeData {
  title: string;
  description?: string;
  category?: string;
  badge?: string;
}

export interface GroupNodeData {
  title: string;
  description?: string;
  colorTheme?: string;
}

export interface CanvasNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number; // Custom font size for Quranic text or content (px)
  colorTheme: string; // theme color key (e.g. 'amber', 'emerald', 'teal', 'rose', 'indigo', 'slate', 'stone')
  zIndex?: number;
  ayahData?: AyahNodeData;
  noteData?: NoteNodeData;
  imageData?: ImageNodeData;
  conceptData?: ConceptNodeData;
  groupData?: GroupNodeData;
}

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

export interface CanvasEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceWordIndex?: number;
  targetWordIndex?: number;
  sourceWordText?: string;
  targetWordText?: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  label?: string; // e.g. "علاقة سببية", "مقابلة وتضاد", "تناسب لفظي"
  style: 'solid' | 'dashed' | 'dotted';
  curveType?: 'bezier' | 'orthogonal' | 'straight' | 'arc';
  animated?: boolean;
  arrowType: 'end' | 'both' | 'none';
  color: string;
  category?: string;
}

export type CanvasGridType = 'dots' | 'lines' | 'grid' | 'islamic' | 'clean';

export interface TadabburMap {
  id: string;
  title: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  zoom: number;
  panX: number;
  panY: number;
  gridType?: CanvasGridType;
  snapToGrid?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PresentationSlide {
  nodeId: string;
  title: string;
  subtitle?: string;
  focusType: NodeType;
  customReflection?: string;
}
