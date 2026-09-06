import { QuranAnchor, QuranAnchorLevel, RelationshipKind, RelationshipDefinition } from '../types';

export const RELATIONSHIP_DEFINITIONS: Record<RelationshipKind, RelationshipDefinition> = {
  cause: {
    kind: 'cause',
    label: 'علاقة سببية (علّة وموجب)',
    shortLabel: 'سبب',
    description: 'دلالة على أن هذا الموضع سبب أو علة موجبة لما يرتبط به',
    color: '#059669', // Emerald
    defaultArrow: 'end',
    defaultStyle: 'solid'
  },
  effect: {
    kind: 'effect',
    label: 'نتيجة وثمرة وجزاء',
    shortLabel: 'نتيجة',
    description: 'يترتب على هذا المعنى أثر أو جزاء أو مآل',
    color: '#0d9488', // Teal
    defaultArrow: 'end',
    defaultStyle: 'solid'
  },
  tafsir: {
    kind: 'tafsir',
    label: 'تفسير وبيان وإيضاح',
    shortLabel: 'تفسير',
    description: 'يوضح الموضع الآخر ويفسر دلالته اللغوية أو المعنوية',
    color: '#2563eb', // Blue
    defaultArrow: 'end',
    defaultStyle: 'solid'
  },
  emphasis: {
    kind: 'emphasis',
    label: 'تأكيد وتقوية للمعنى',
    shortLabel: 'تأكيد',
    description: 'يؤكد الحكم أو اللفظ ويرسخه في النفس',
    color: '#4f46e5', // Indigo
    defaultArrow: 'end',
    defaultStyle: 'solid'
  },
  contrast: {
    kind: 'contrast',
    label: 'مقابلة وتضاد وتمايز',
    shortLabel: 'مقابلة',
    description: 'مقابلة المعنى بنقيضه (كالنور والظلمات، الإيمان والكفر)',
    color: '#e11d48', // Rose
    defaultArrow: 'both',
    defaultStyle: 'dashed'
  },
  similarity: {
    kind: 'similarity',
    label: 'تشابه وتناظر سياقي',
    shortLabel: 'تشابه',
    description: 'تناظر في الدلالة أو تقارب في المشهد والقصة القرآنية',
    color: '#7c3aed', // Violet
    defaultArrow: 'both',
    defaultStyle: 'dashed'
  },
  pairing: {
    kind: 'pairing',
    label: 'اقتران لفظي متلازم',
    shortLabel: 'اقتران',
    description: 'اقتران الاسمين أو الصفتين كـ (غفور رحيم) أو (عزيز حكيم)',
    color: '#d97706', // Amber
    defaultArrow: 'both',
    defaultStyle: 'solid'
  },
  repetition: {
    kind: 'repetition',
    label: 'تكرار إعجازي ونظم بديع',
    shortLabel: 'تكرار',
    description: 'ورود نفس اللفظ أو العبارة لحكمة بلاغية أو تنبيه متجدد',
    color: '#9333ea', // Purple
    defaultArrow: 'both',
    defaultStyle: 'dotted'
  },
  theme: {
    kind: 'theme',
    label: 'وحدة موضوعية جامعة',
    shortLabel: 'موضوع',
    description: 'يندرجان تحت مقصد قرآني أو موضوع إيماني جامع',
    color: '#0891b2', // Cyan
    defaultArrow: 'both',
    defaultStyle: 'solid'
  },
  shared_word: {
    kind: 'shared_word',
    label: 'لفظ مشترك وتوافق تعبيري',
    shortLabel: 'لفظ مشترك',
    description: 'استعمال اللفظ ذاته في سياقين مختلفين لإبراز الإعجاز',
    color: '#ea580c', // Orange
    defaultArrow: 'both',
    defaultStyle: 'solid'
  },
  shared_root: {
    kind: 'shared_root',
    label: 'جذر لغوي واشتقاق مشترك',
    shortLabel: 'جذر مشترك',
    description: 'اتحاد في الجذر الصرفي والمادة المعجمية للكلمتين',
    color: '#c026d3', // Fuchsia
    defaultArrow: 'both',
    defaultStyle: 'dashed'
  },
  tadabbur: {
    kind: 'tadabbur',
    label: 'وقفة تدبرية وتأمل قلبي',
    shortLabel: 'تدبر',
    description: 'خاطرة إيمانية واستشعار للخطاب القرآني',
    color: '#b45309', // Warm Amber
    defaultArrow: 'end',
    defaultStyle: 'solid'
  },
  deduction: {
    kind: 'deduction',
    label: 'استنباط ودلالة حكم',
    shortLabel: 'استنباط',
    description: 'استخراج فائدة عقدية أو فقهية أو تربوية من النص',
    color: '#475569', // Slate
    defaultArrow: 'end',
    defaultStyle: 'solid'
  },
  question: {
    kind: 'question',
    label: 'سؤال واستفهام تدبري',
    shortLabel: 'سؤال',
    description: 'استفهام بلاغي أو سؤال يبحث عن إجابة في القرآن',
    color: '#0284c7', // Sky
    defaultArrow: 'end',
    defaultStyle: 'dashed'
  },
  answer: {
    kind: 'answer',
    label: 'جواب وبيان شافي',
    shortLabel: 'جواب',
    description: 'بيان للإشكال أو إجابة على سؤال مطروح في الخريطة',
    color: '#16a34a', // Green
    defaultArrow: 'end',
    defaultStyle: 'solid'
  },
  custom: {
    kind: 'custom',
    label: 'علاقة مخصصة',
    shortLabel: 'مخصص',
    description: 'علاقة خاصة بصياغتك الشخصية (مثل: "تذكرني بـ...")',
    color: '#e11d48',
    defaultArrow: 'end',
    defaultStyle: 'solid'
  }
};

export const RELATIONSHIP_LIST: RelationshipDefinition[] = Object.values(RELATIONSHIP_DEFINITIONS);

/**
 * Creates a standard QuranAnchor structure
 */
export function createQuranAnchor(options: {
  surah: number;
  ayah: number;
  level: QuranAnchorLevel;
  text: string;
  startWord?: number;
  endWord?: number;
  startChar?: number;
  endChar?: number;
  surahName?: string;
}): QuranAnchor {
  return {
    surah: options.surah,
    ayah: options.ayah,
    level: options.level,
    text: options.text.trim(),
    startWord: options.startWord,
    endWord: options.endWord ?? options.startWord,
    startChar: options.startChar,
    endChar: options.endChar,
    surahName: options.surahName,
    ayahNumberInSurah: options.ayah
  };
}

/**
 * Format a human-readable title for a QuranAnchor
 * e.g., "سورة البقرة: 255 (كلمة: ٱللَّهُ)"
 */
export function formatQuranAnchorLabel(anchor?: QuranAnchor): string {
  if (!anchor) return '';
  const surahPart = anchor.surahName ? `سورة ${anchor.surahName}` : `سورة ${anchor.surah}`;
  const ayahPart = `آية ${anchor.ayah}`;

  switch (anchor.level) {
    case 'char':
      return `${surahPart} [${ayahPart}] • حرف «${anchor.text}»`;
    case 'word':
      return `${surahPart} [${ayahPart}] • كلمة «${anchor.text}»`;
    case 'word_range':
      return `${surahPart} [${ayahPart}] • مقطع «${anchor.text}»`;
    case 'surah':
      return `${surahPart} (كامل السورة)`;
    case 'ayah':
    default:
      return `${surahPart} [${ayahPart}]`;
  }
}

export const formatAnchorReference = formatQuranAnchorLabel;
