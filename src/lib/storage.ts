import { TadabburMap, CanvasNode, CanvasEdge, WordAnnotation } from '../types';

const STORAGE_KEY_MAPS = 'tadabbur_quran_maps_v1';
const STORAGE_KEY_ACTIVE_ID = 'tadabbur_quran_active_map_v1';

export const STARTER_MAPS: TadabburMap[] = [
  {
    id: 'fatiha-contemplation',
    title: 'تدبّر سورة الفاتحة: مقاصد الحمد والصراط المستقيم',
    description: 'خريطة تأملية تبين الرابط العظيم بين حمْدِ الله تعالى وتوحيد ألوهيته، والافتقار إليه بالعبادة والاستعانة، وطلب الهداية إلى الصراط المستقيم.',
    zoom: 1,
    panX: 40,
    panY: 30,
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now() - 500000,
    nodes: [
      {
        id: 'node-fatiha-1',
        type: 'ayah',
        x: 100,
        y: 80,
        width: 380,
        colorTheme: 'amber',
        ayahData: {
          surahNumber: 1,
          surahName: 'الفاتحة',
          ayahNumberInSurah: 2,
          juz: 1,
          revelationType: 'Meccan',
          textUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
          textSimple: 'الحمد لله رب العالمين',
          annotations: [
            {
              id: 'ann-1',
              wordIndex: 0,
              wordText: 'ٱلْحَمْدُ',
              type: 'highlight',
              color: '#f59e0b',
              note: 'استغراق واستحقاق لجميع المحامد'
            },
            {
              id: 'ann-2',
              wordIndex: 2,
              wordText: 'رَبِّ',
              type: 'circle',
              color: '#10b981',
              note: 'التربية والرعاية الشاملة للعوالم'
            }
          ]
        }
      },
      {
        id: 'node-fatiha-2',
        type: 'ayah',
        x: 560,
        y: 80,
        width: 380,
        colorTheme: 'emerald',
        ayahData: {
          surahNumber: 1,
          surahName: 'الفاتحة',
          ayahNumberInSurah: 5,
          juz: 1,
          revelationType: 'Meccan',
          textUthmani: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
          textSimple: 'إياك نعبد وإياك نستعين',
          annotations: [
            {
              id: 'ann-3',
              wordIndex: 0,
              wordText: 'إِيَّاكَ',
              type: 'circle',
              color: '#3b82f6',
              note: 'تقديم المعمول يفيد الحصر والاختصاص'
            },
            {
              id: 'ann-4',
              wordIndex: 3,
              wordText: 'نَسْتَعِينُ',
              type: 'highlight',
              color: '#06b6d4',
              note: 'إقرار بالضعف البشري والافتقار إلى المدد الإلهي'
            }
          ]
        }
      },
      {
        id: 'node-fatiha-3',
        type: 'ayah',
        x: 320,
        y: 430,
        width: 400,
        colorTheme: 'teal',
        ayahData: {
          surahNumber: 1,
          surahName: 'الفاتحة',
          ayahNumberInSurah: 6,
          juz: 1,
          revelationType: 'Meccan',
          textUthmani: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
          textSimple: 'اهدنا الصراط المستقيم',
          annotations: [
            {
              id: 'ann-5',
              wordIndex: 0,
              wordText: 'ٱهْدِنَا',
              type: 'circle',
              color: '#e11d48',
              note: 'أعظم دعاء في القرآن: هداية إرشاد وتوفيق وثبات'
            }
          ]
        }
      },
      {
        id: 'node-concept-center',
        type: 'concept',
        x: 380,
        y: 280,
        width: 280,
        colorTheme: 'indigo',
        conceptData: {
          title: 'الرباط الدلالي بين الثناء والطلب',
          description: 'تصدير السورة بالحمد والثناء تمهيدٌ أدبي عظيم قبل سؤال أعظم مطلوب وهو الهداية إلى الصراط المستقيم.',
          category: 'منهجية التدبر',
          badge: 'محور مركزي'
        }
      },
      {
        id: 'node-note-reflection',
        x: 820,
        y: 380,
        width: 320,
        type: 'note',
        colorTheme: 'stone',
        noteData: {
          title: 'وقفة تدبّرية: الجمع بين العبادة والاستعانة',
          content: 'قُدِّمت العبادة على الاستعانة لأن العبادة هي الغاية التي خُلقنا لأجلها، والاستعانة هي الوسيلة إليها. ولا قدرة للعبد على العبادة إلا بمعونة ربه.',
          tags: ['أسرار_الفاتحة', 'إياك_نعبد', 'التوكل'],
          referenceSurah: 1,
          referenceAyah: 5,
          referenceText: 'سورة الفاتحة، الآية 5'
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        sourceId: 'node-fatiha-1',
        targetId: 'node-concept-center',
        label: 'الثناء والاعتراف بالربوبية',
        style: 'solid',
        arrowType: 'end',
        color: '#f59e0b'
      },
      {
        id: 'edge-2',
        sourceId: 'node-fatiha-2',
        targetId: 'node-concept-center',
        label: 'الإخلاص والبراءة من الشرك والحول',
        style: 'solid',
        arrowType: 'end',
        color: '#10b981'
      },
      {
        id: 'edge-3',
        sourceId: 'node-concept-center',
        targetId: 'node-fatiha-3',
        label: 'السؤال والدعاء المستجاب',
        style: 'solid',
        arrowType: 'end',
        color: '#6366f1'
      },
      {
        id: 'edge-4',
        sourceId: 'node-fatiha-2',
        targetId: 'node-note-reflection',
        label: 'تأمّل وتفريع',
        style: 'dashed',
        arrowType: 'end',
        color: '#64748b'
      }
    ]
  },
  {
    id: 'kahf-ships',
    title: 'سورة الكهف: الفتن الأربع وسفينة النجاة',
    description: 'ربط بصري بين قصص سورة الكهف الأربع (الدين، المال، العلم، السلطة) وعواصم النجاة المستنبطة من الآيات.',
    zoom: 0.9,
    panX: 60,
    panY: 40,
    createdAt: Date.now() - 500000,
    updatedAt: Date.now() - 200000,
    nodes: [
      {
        id: 'kahf-center',
        type: 'concept',
        x: 450,
        y: 280,
        width: 320,
        colorTheme: 'amber',
        conceptData: {
          title: 'محور سورة الكهف: عصمة المسلم من الفتن',
          description: 'تتكامل قصص السورة الأربع لتعالج أعتى فتن البشرية: فتنة الدين، فتنة المال، فتنة العلم، وفتنة السلطة، وتختم بالتوحيد والعمل الصالح.',
          category: 'المحاور الكبرى',
          badge: 'رؤية كلية'
        }
      },
      {
        id: 'kahf-story-1',
        type: 'ayah',
        x: 100,
        y: 80,
        width: 360,
        colorTheme: 'emerald',
        ayahData: {
          surahNumber: 18,
          surahName: 'الكهف',
          ayahNumberInSurah: 10,
          juz: 15,
          revelationType: 'Meccan',
          textUthmani: 'إِذْ أَوَى ٱلْفِتْيَةُ إِلَى ٱلْكَهْفِ فَقَالُوا۟ رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
          textSimple: 'إذ أوى الفتية إلى الكهف فقالوا ربنا آتنا من لدنك رحمة وهيئ لنا من أمرنا رشدا',
          annotations: [
            {
              id: 'kann-1',
              wordIndex: 1,
              wordText: 'أَوَى',
              type: 'highlight',
              color: '#10b981',
              note: 'اللجوء إلى الله والفرار بالدين'
            },
            {
              id: 'kann-2',
              wordIndex: 9,
              wordText: 'رَحْمَةً',
              type: 'circle',
              color: '#06b6d4',
              note: 'طلب الرحمة والرشد عصمةٌ من فتنة الدين'
            }
          ]
        }
      },
      {
        id: 'kahf-story-2',
        type: 'ayah',
        x: 820,
        y: 80,
        width: 360,
        colorTheme: 'teal',
        ayahData: {
          surahNumber: 18,
          surahName: 'الكهف',
          ayahNumberInSurah: 46,
          juz: 15,
          revelationType: 'Meccan',
          textUthmani: 'ٱلْمَالُ وَٱلْبَنُونَ زِينَةُ ٱلْحَيَوٰةِ ٱلدُّنْيَا ۖ وَٱلْبَٰقِيَٰتُ ٱلصَّٰلِحَٰتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا',
          textSimple: 'المال والبنون زينة الحياة الدنيا والباقيات الصالحات خير عند ربك ثوابا وخير أملا',
          annotations: [
            {
              id: 'kann-3',
              wordIndex: 0,
              wordText: 'ٱلْمَالُ',
              type: 'highlight',
              color: '#f59e0b',
              note: 'فتنة المال وخداع الزينة العاجلة'
            },
            {
              id: 'kann-4',
              wordIndex: 5,
              wordText: 'وَٱلْبَٰقِيَٰتُ',
              type: 'circle',
              color: '#10b981',
              note: 'علاج فتنة المال: تذكر الباقيات الصالحات'
            }
          ]
        }
      },
      {
        id: 'kahf-story-3',
        type: 'ayah',
        x: 100,
        y: 480,
        width: 360,
        colorTheme: 'indigo',
        ayahData: {
          surahNumber: 18,
          surahName: 'الكهف',
          ayahNumberInSurah: 66,
          juz: 15,
          revelationType: 'Meccan',
          textUthmani: 'قَالَ لَهُۥ مُوسَىٰ هَلْ أَتَّبِعُكَ عَلَىٰٓ أَن تُعَلِّمَنِ مِمَّا عُلِّمْتَ رُشْدًا',
          textSimple: 'قال له موسى هل أتبعك على أن تعلمن مما علمت رشدا',
          annotations: [
            {
              id: 'kann-5',
              wordIndex: 8,
              wordText: 'رُشْدًا',
              type: 'highlight',
              color: '#8b5cf6',
              note: 'التواضع في طلب العلم وسؤال الرشد'
            }
          ]
        }
      },
      {
        id: 'kahf-story-4',
        type: 'ayah',
        x: 820,
        y: 480,
        width: 360,
        colorTheme: 'rose',
        ayahData: {
          surahNumber: 18,
          surahName: 'الكهف',
          ayahNumberInSurah: 88,
          juz: 16,
          revelationType: 'Meccan',
          textUthmani: 'وَأَمَّا مَنْ ءَامَنَ وَعَمِلَ صَٰلِحًا فَلَهُۥ جَزَآءً ٱلْحُسْنَىٰ ۖ وَسَنَقُولُ لَهُۥ مِنْ أَمْرِنَا يُسْرًا',
          textSimple: 'وأما من آمن وعمل صالحا فله جزاء الحسنى وسنقول له من أمرنا يسرا',
          annotations: [
            {
              id: 'kann-6',
              wordIndex: 8,
              wordText: 'يُسْرًا',
              type: 'circle',
              color: '#ec4899',
              note: 'علاج فتنة السلطة: العدل وتيسير شؤون الناس'
            }
          ]
        }
      }
    ],
    edges: [
      {
        id: 'kedge-1',
        sourceId: 'kahf-story-1',
        targetId: 'kahf-center',
        label: '1. فتنة الدين وعاصمها الصحبة الصالحة',
        style: 'solid',
        arrowType: 'end',
        color: '#10b981'
      },
      {
        id: 'kedge-2',
        sourceId: 'kahf-story-2',
        targetId: 'kahf-center',
        label: '2. فتنة المال وعاصمها معرفة حقيقة الدنيا',
        style: 'solid',
        arrowType: 'end',
        color: '#f59e0b'
      },
      {
        id: 'kedge-3',
        sourceId: 'kahf-story-3',
        targetId: 'kahf-center',
        label: '3. فتنة العلم وعاصمها التواضع',
        style: 'solid',
        arrowType: 'end',
        color: '#8b5cf6'
      },
      {
        id: 'kedge-4',
        sourceId: 'kahf-story-4',
        targetId: 'kahf-center',
        label: '4. فتنة السلطة وعاصمها العدل والإخلاص',
        style: 'solid',
        arrowType: 'end',
        color: '#ec4899'
      }
    ]
  }
];

export function getStoredMaps(): TadabburMap[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MAPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MAPS, JSON.stringify(STARTER_MAPS));
      return STARTER_MAPS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_MAPS, JSON.stringify(STARTER_MAPS));
      return STARTER_MAPS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse stored maps:', e);
    return STARTER_MAPS;
  }
}

export function saveStoredMaps(maps: TadabburMap[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MAPS, JSON.stringify(maps));
  } catch (e) {
    console.error('Failed to save maps to localStorage:', e);
  }
}

export function getActiveMapId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (stored) return stored;
    return STARTER_MAPS[0].id;
  } catch {
    return STARTER_MAPS[0].id;
  }
}

export function setActiveMapId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (e) {
    console.error('Failed to save active map id:', e);
  }
}

const STORAGE_KEY_CUSTOM_TEMPLATES = 'tadabbur_quran_custom_templates_v1';

export function loadUserCustomTemplates(): Array<{
  id: string;
  title: string;
  subtitle: string;
  category: 'thematic' | 'comparative' | 'etymology' | 'journey' | 'contrast' | 'narrative';
  categoryLabel: string;
  description: string;
  badge: string;
  colorTheme: string;
  iconName: string;
  nodesCount: number;
  edgesCount: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  isCustom?: boolean;
}> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TEMPLATES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUserCustomTemplate(template: {
  id: string;
  title: string;
  subtitle: string;
  category: 'thematic' | 'comparative' | 'etymology' | 'journey' | 'contrast' | 'narrative';
  categoryLabel: string;
  description: string;
  badge: string;
  colorTheme: string;
  iconName: string;
  nodesCount: number;
  edgesCount: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  isCustom?: boolean;
}): void {
  try {
    const current = loadUserCustomTemplates();
    const filtered = current.filter((t) => t.id !== template.id);
    filtered.unshift({ ...template, isCustom: true });
    localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATES, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save user custom template:', e);
  }
}

export function deleteUserCustomTemplate(templateId: string): void {
  try {
    const current = loadUserCustomTemplates();
    const filtered = current.filter((t) => t.id !== templateId);
    localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATES, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete user custom template:', e);
  }
}
