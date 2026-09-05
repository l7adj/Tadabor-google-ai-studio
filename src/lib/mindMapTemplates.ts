import { CanvasNode, CanvasEdge } from '../types';

export interface MindMapTemplate {
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
}

export const MIND_MAP_TEMPLATES: MindMapTemplate[] = [
  // 1. Surah Thematic Structure (الهيكل الموضوعي للسورة)
  {
    id: 'template-thematic-mulk',
    title: 'الهيكل الموضوعي ومقاصد السورة',
    subtitle: 'تحليل محاور السورة، ترابط الآيات، والمقصد العام',
    category: 'thematic',
    categoryLabel: 'تفسير موضوعي',
    description: 'قالب هيكلي متقن لدراسة السورة الكاملة أو مقطع رئيسي منها: يضع المقصد الكلي في القلب وتتفرع منه المحاور الفرعية والآيات الشاهدة والتطبيقات العملية.',
    badge: 'الأكثر استخداماً',
    colorTheme: 'emerald',
    iconName: 'LayoutGrid',
    nodesCount: 5,
    edgesCount: 4,
    nodes: [
      {
        id: 'tmpl-thm-hub',
        type: 'concept',
        x: 600,
        y: 80,
        width: 380,
        colorTheme: 'emerald',
        conceptData: {
          title: 'مقاصد سورة الملك: تبارك الذي بيده الملك',
          description: 'إثبات كمال الملك والقدرة لله تعالى، وابتلاء العباد بالحياة والموت لتمييز أحسن العمل، واستدعاء الخشية بالغيب في السر والعلن.',
          category: 'المحور الكلي للسورة',
          badge: 'مقصد جامع'
        }
      },
      {
        id: 'tmpl-thm-ayah-1',
        type: 'ayah',
        x: 100,
        y: 280,
        width: 390,
        colorTheme: 'amber',
        ayahData: {
          surahNumber: 67,
          surahName: 'الملك',
          ayahNumberInSurah: 1,
          juz: 29,
          revelationType: 'Meccan',
          textUthmani: 'تَبَٰرَكَ ٱلَّذِي بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
          textSimple: 'تبارك الذي بيده الملك وهو على كل شيء قدير',
          annotations: [
            {
              id: 'ann-tm1-1',
              wordIndex: 0,
              wordText: 'تَبَٰرَكَ',
              type: 'circle',
              color: '#d97706',
              note: 'تعالى وتكاثرت بركاته وخيراته الذاتية والإنعامية'
            },
            {
              id: 'ann-tm1-2',
              wordIndex: 2,
              endWordIndex: 3,
              wordText: 'بِيَدِهِ ٱلْمُلْكُ',
              type: 'highlight',
              color: '#f59e0b',
              note: 'تقديم الجار والمجرور يفيد الحصر والانفراد بالملك الحقيقي'
            }
          ]
        }
      },
      {
        id: 'tmpl-thm-ayah-2',
        type: 'ayah',
        x: 580,
        y: 340,
        width: 420,
        colorTheme: 'teal',
        ayahData: {
          surahNumber: 67,
          surahName: 'الملك',
          ayahNumberInSurah: 2,
          juz: 29,
          revelationType: 'Meccan',
          textUthmani: 'ٱلَّذِي خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ',
          textSimple: 'الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا وهو العزيز الغفور',
          annotations: [
            {
              id: 'ann-tm1-3',
              wordIndex: 2,
              wordText: 'ٱلْمَوْتَ',
              type: 'underline',
              color: '#0d9488',
              note: 'قُدم الموت لأنه أعظم رادع وموقظ للقلوب الغافلة'
            },
            {
              id: 'ann-tm1-4',
              wordIndex: 6,
              endWordIndex: 7,
              wordText: 'أَحْسَنُ عَمَلًا',
              type: 'circle',
              color: '#059669',
              note: 'قال الفضيل: أخلصه وأصوبه، فإن العمل إذا كان خالصاً ولم يكن صواباً لم يقبل'
            }
          ]
        }
      },
      {
        id: 'tmpl-thm-ayah-3',
        type: 'ayah',
        x: 1080,
        y: 280,
        width: 390,
        colorTheme: 'indigo',
        ayahData: {
          surahNumber: 67,
          surahName: 'الملك',
          ayahNumberInSurah: 12,
          juz: 29,
          revelationType: 'Meccan',
          textUthmani: 'إِنَّ ٱلَّذِينَ يَخْشَوْنَ رَبَّهُم بِٱلْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ',
          textSimple: 'إن الذين يخشون ربهم بالغيب لهم مغفرة وأجر كبير',
          annotations: [
            {
              id: 'ann-tm1-5',
              wordIndex: 2,
              endWordIndex: 4,
              wordText: 'يَخْشَوْنَ رَبَّهُم بِٱلْغَيْبِ',
              type: 'highlight',
              color: '#6366f1',
              note: 'الخشية في الخلوة حين لا يراهم إلا الله، وهي المحك الصادق لليقين'
            }
          ]
        }
      },
      {
        id: 'tmpl-thm-note',
        type: 'note',
        x: 590,
        y: 640,
        width: 400,
        colorTheme: 'emerald',
        noteData: {
          title: 'الربط التدبري والتطبيق المعاصر',
          content: 'تبدأ السورة بإثبات الملك المطلق لله، ثم تبين غاية خلق الإنسان (الابتلاء بحسن العمل)، ثم تثمر الخشية بالغيب في أفعال العبد وخلواته. الواجب العملي: مراجعة الإخلاص وتفقد خشية السر.',
          tags: ['تدبر_الملك', 'مقاصد_السور', 'أحسن_عملا', 'خشية_الغيب']
        }
      }
    ],
    edges: [
      {
        id: 'edge-thm-1',
        sourceId: 'tmpl-thm-hub',
        targetId: 'tmpl-thm-ayah-1',
        label: 'المحور الأول: انفراد الملك والقدرة',
        style: 'solid',
        arrowType: 'end',
        color: '#f59e0b'
      },
      {
        id: 'tmpl-thm-edge-2',
        sourceId: 'tmpl-thm-hub',
        targetId: 'tmpl-thm-ayah-2',
        label: 'المحور الثاني: حكمة الخلق والابتلاء',
        style: 'solid',
        arrowType: 'end',
        color: '#0d9488'
      },
      {
        id: 'tmpl-thm-edge-3',
        sourceId: 'tmpl-thm-hub',
        targetId: 'tmpl-thm-ayah-3',
        label: 'المحور الثالث: ثمرة الخشية في الخلوات',
        style: 'solid',
        arrowType: 'end',
        color: '#6366f1'
      },
      {
        id: 'tmpl-thm-edge-4',
        sourceId: 'tmpl-thm-ayah-2',
        targetId: 'tmpl-thm-note',
        label: 'الامتداد السلوكي: من المعرفة إلى العمل',
        style: 'dashed',
        arrowType: 'end',
        color: '#10b981'
      }
    ]
  },

  // 2. Linguistic & Rhetorical Comparison (مقارنة لفظية وبلاغية)
  {
    id: 'template-comparative-mutashabihat',
    title: 'المقارنة اللفظية والمتشابهات البلاغية',
    subtitle: 'تحليل دقيق للفروق الأسلوبية والتقديم والتأخير بين آيتين',
    category: 'comparative',
    categoryLabel: 'بلاغة ولطائف لغوية',
    description: 'قالب مصمم لمقارنة آيتين كريمتين تشابهت ألفاظهما واختلفت في حرف أو تقديم وتأخير، مع إبراز النكتة البلاغية وملاءمتها لسياق السورة.',
    badge: 'دراسات بلاغية',
    colorTheme: 'indigo',
    iconName: 'GitCompare',
    nodesCount: 4,
    edgesCount: 3,
    nodes: [
      {
        id: 'tmpl-cmp-hub',
        type: 'concept',
        x: 520,
        y: 60,
        width: 360,
        colorTheme: 'indigo',
        conceptData: {
          title: 'سر التقديم والتأخير: (السماوات والأرض)',
          description: 'مقارنة بين موضع تقديم السماوات على الأرض وموضع الإفراد أو الجمع، وتوجيه النكتة البلاغية بحسب مقاصد كل سياق.',
          category: 'متشابهات القرآن',
          badge: 'بلاغة نظم'
        }
      },
      {
        id: 'tmpl-cmp-ayah-1',
        type: 'ayah',
        x: 100,
        y: 240,
        width: 390,
        colorTheme: 'amber',
        ayahData: {
          surahNumber: 3,
          surahName: 'آل عمران',
          ayahNumberInSurah: 189,
          juz: 4,
          revelationType: 'Medinan',
          textUthmani: 'وَلِلَّهِ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ ۗ وَٱللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
          textSimple: 'ولله ملك السماوات والأرض والله على كل شيء قدير',
          annotations: [
            {
              id: 'ann-cmp-1',
              wordIndex: 0,
              endWordIndex: 1,
              wordText: 'وَلِلَّهِ مُلْكُ',
              type: 'highlight',
              color: '#d97706',
              note: 'سياق الرد على اليهود الذين قالوا إن الله فقير، فبدأ بإثبات الملك المطلق'
            },
            {
              id: 'ann-cmp-2',
              wordIndex: 2,
              wordText: 'ٱلسَّمَٰوَٰتِ',
              type: 'circle',
              color: '#b45309',
              note: 'تقديم السماوات لعلو شأنها واتساع عظمتها'
            }
          ]
        }
      },
      {
        id: 'tmpl-cmp-ayah-2',
        type: 'ayah',
        x: 900,
        y: 240,
        width: 390,
        colorTheme: 'teal',
        ayahData: {
          surahNumber: 45,
          surahName: 'الجاثية',
          ayahNumberInSurah: 3,
          juz: 25,
          revelationType: 'Meccan',
          textUthmani: 'إِنَّ فِي ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ لَءَايَٰتٍ لِّلْمُؤْمِنِينَ',
          textSimple: 'إن في السماوات والأرض لآيات للمؤمنين',
          annotations: [
            {
              id: 'ann-cmp-3',
              wordIndex: 0,
              endWordIndex: 1,
              wordText: 'إِنَّ فِي',
              type: 'highlight',
              color: '#0d9488',
              note: 'سياق تفكر واستدلال بآثار الصنعة الإلهية للوصول إلى الإيمان'
            },
            {
              id: 'ann-cmp-4',
              wordIndex: 4,
              wordText: 'لَءَايَٰتٍ',
              type: 'circle',
              color: '#0f766e',
              note: 'التنكير للتعظيم، أي دلالات عظمى قاطعة لكل صاحب عقل'
            }
          ]
        }
      },
      {
        id: 'tmpl-cmp-note',
        type: 'note',
        x: 500,
        y: 480,
        width: 420,
        colorTheme: 'indigo',
        noteData: {
          title: 'الخلاصة البلاغية المقارنة',
          content: 'في آل عمران السياق سياق تمليك وتقرير عظمة، فجاء التعبير باسم الملك "وَلِلَّهِ مُلْكُ". أما في الجاثية فالسياق سياق هداية ونظر وتأمل في آيات الآفاق، فجاء التعبير بالظرفية "إِنَّ فِي" المنبهة على ما في هذا الوعاء الكوني من دلائل.',
          tags: ['المتشابهات', 'بلاغة_القرآن', 'سر_الترتيب']
        }
      }
    ],
    edges: [
      {
        id: 'tmpl-cmp-edge-1',
        sourceId: 'tmpl-cmp-ayah-1',
        targetId: 'tmpl-cmp-ayah-2',
        sourceWordText: 'وَلِلَّهِ مُلْكُ',
        targetWordText: 'إِنَّ فِي',
        label: 'مقارنة: سياق الملك التام ⟷ سياق الاستدلال بالآيات',
        style: 'solid',
        arrowType: 'both',
        color: '#6366f1'
      },
      {
        id: 'tmpl-cmp-edge-2',
        sourceId: 'tmpl-cmp-ayah-1',
        targetId: 'tmpl-cmp-note',
        label: 'توجيه الموضع الأول',
        style: 'dashed',
        arrowType: 'end',
        color: '#f59e0b'
      },
      {
        id: 'tmpl-cmp-edge-3',
        sourceId: 'tmpl-cmp-ayah-2',
        targetId: 'tmpl-cmp-note',
        label: 'توجيه الموضع الثاني',
        style: 'dashed',
        arrowType: 'end',
        color: '#0d9488'
      }
    ]
  },

  // 3. Quranic Root & Morphological Family (دراسة الجذر والاشتقاق)
  {
    id: 'template-etymology-root',
    title: 'دراسة الجذر القرآني والأسرة اللفظية',
    subtitle: 'تتبع جذر ثلاثي في تصريفاته ودلالاته عبر سور القرآن',
    category: 'etymology',
    categoryLabel: 'اشتقاق ودلالة ألفاظ',
    description: 'قالب لاستقصاء المعنى المحوري للجذر اللغوي في القرآن، وتتبع تحولاته الصرفية (اسم، صفة مشبهة، فعل، صيغة مبالغة) وكيف يخدم كل تصريف معنى خاصاً.',
    badge: 'دراسة لغوية عميقة',
    colorTheme: 'rose',
    iconName: 'GitBranch',
    nodesCount: 5,
    edgesCount: 4,
    nodes: [
      {
        id: 'tmpl-root-hub',
        type: 'concept',
        x: 580,
        y: 80,
        width: 360,
        colorTheme: 'rose',
        conceptData: {
          title: 'المعنى المحوري لجذر [ر - ح - م]',
          description: 'الرقة والعطف والإحسان مع إرادة الخير للمرحوم وسوق المنفعة ودفع الضر عنه. تتفرع منه أسماء الذات والصفات وأفعال الإنعام.',
          category: 'جذر قرآني أصيل',
          badge: 'جذر: رحم'
        }
      },
      {
        id: 'tmpl-root-ayah-1',
        type: 'ayah',
        x: 100,
        y: 280,
        width: 380,
        colorTheme: 'amber',
        ayahData: {
          surahNumber: 1,
          surahName: 'الفاتحة',
          ayahNumberInSurah: 3,
          juz: 1,
          revelationType: 'Meccan',
          textUthmani: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
          textSimple: 'الرحمن الرحيم',
          annotations: [
            {
              id: 'ann-rt-1',
              wordIndex: 0,
              wordText: 'ٱلرَّحْمَٰنِ',
              type: 'circle',
              color: '#e11d48',
              note: 'صيغة فعلان: دالة على الامتلاء والاتساع والشمول لجميع الخلائق في الدنيا'
            },
            {
              id: 'ann-rt-2',
              wordIndex: 1,
              wordText: 'ٱلرَّحِيمِ',
              type: 'highlight',
              color: '#f43f5e',
              note: 'صيغة فعيل: دالة على الثبوت والدوام، وإيصال الرحمة للمؤمنين خاصة في الآخرة'
            }
          ]
        }
      },
      {
        id: 'tmpl-root-ayah-2',
        type: 'ayah',
        x: 580,
        y: 350,
        width: 400,
        colorTheme: 'emerald',
        ayahData: {
          surahNumber: 6,
          surahName: 'الأنعام',
          ayahNumberInSurah: 54,
          juz: 7,
          revelationType: 'Meccan',
          textUthmani: 'كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ ٱلرَّحْمَةَ',
          textSimple: 'كتب ربكم على نفسه الرحمة',
          annotations: [
            {
              id: 'ann-rt-3',
              wordIndex: 0,
              wordText: 'كَتَبَ',
              type: 'underline',
              color: '#059669',
              note: 'إيجاب فضل وكرم وإحسان ألزم به سبحانه ذاته العلية تطييباً لقلوب التائبين'
            },
            {
              id: 'ann-rt-4',
              wordIndex: 4,
              wordText: 'ٱلرَّحْمَةَ',
              type: 'circle',
              color: '#10b981',
              note: 'المصدر الصريح المحلى بأل الجنسية المستغرقة لكل أنواع الرحمات'
            }
          ]
        }
      },
      {
        id: 'tmpl-root-ayah-3',
        type: 'ayah',
        x: 1080,
        y: 280,
        width: 380,
        colorTheme: 'teal',
        ayahData: {
          surahNumber: 2,
          surahName: 'البقرة',
          ayahNumberInSurah: 105,
          juz: 1,
          revelationType: 'Medinan',
          textUthmani: 'وَٱللَّهُ يَخْتَصُّ بِرَحْمَتِهِۦ مَن يَشَآءُ',
          textSimple: 'والله يختص برحمته من يشاء',
          annotations: [
            {
              id: 'ann-rt-5',
              wordIndex: 1,
              wordText: 'يَخْتَصُّ',
              type: 'circle',
              color: '#0d9488',
              note: 'الفعل المضارع المفيد للتجدد والاستمرار في هداية القلوب واصطفائها'
            }
          ]
        }
      },
      {
        id: 'tmpl-root-note',
        type: 'note',
        x: 580,
        y: 650,
        width: 400,
        colorTheme: 'rose',
        noteData: {
          title: 'شبكة الاشتقاق واللطيفة الإيمانية',
          content: 'انظر كيف تنوع الجذر: من اسمين لله يدلان على السعة والثبوت (الرحمن الرحيم)، إلى كتابة الرحمة على نفسه سبحانه كعهد، إلى اختصاص عباده بها. ثمرة التدبر: عدم اليأس من رحمة الله مهما عظمت الذنوب.',
          tags: ['جذور_قرآنية', 'فقه_اللغة', 'الرحمة_الإلهية']
        }
      }
    ],
    edges: [
      {
        id: 'tmpl-rt-e1',
        sourceId: 'tmpl-root-hub',
        targetId: 'tmpl-root-ayah-1',
        label: 'صيغتا الاسم والوصف: الرحمن الرحيم',
        style: 'solid',
        arrowType: 'end',
        color: '#e11d48'
      },
      {
        id: 'tmpl-rt-e2',
        sourceId: 'tmpl-root-hub',
        targetId: 'tmpl-root-ayah-2',
        label: 'صيغة المصدر المؤكد: الرحمة',
        style: 'solid',
        arrowType: 'end',
        color: '#10b981'
      },
      {
        id: 'tmpl-rt-e3',
        sourceId: 'tmpl-root-hub',
        targetId: 'tmpl-root-ayah-3',
        label: 'صيغة الإضافة والاختصاص: برحمته',
        style: 'solid',
        arrowType: 'end',
        color: '#0d9488'
      },
      {
        id: 'tmpl-rt-e4',
        sourceId: 'tmpl-root-ayah-2',
        targetId: 'tmpl-root-note',
        label: 'الثمرة القلبية واليقين',
        style: 'dashed',
        arrowType: 'end',
        color: '#f43f5e'
      }
    ]
  },

  // 4. Contemplation Journey: Cause ⟵ Wisdom ⟵ Action (المسار التدبري المتكامل)
  {
    id: 'template-journey-action',
    title: 'المسار التدبري: سبب ⟵ حكمة ⟵ أثر وعمل',
    subtitle: 'رحلة متدرجة من فهم نزول الآية إلى التطبيق السلوكي في الواقع',
    category: 'journey',
    categoryLabel: 'تطبيق عملي وتزكية',
    description: 'قالب تسلسلي عملي يربط الآية بسياقها التاريخي أو العقدي، ثم يستنبط اللطيفة الروحية، ثم يختم بواجب عملي محدد وقابل للتطبيق اليوم.',
    badge: 'منهج تزكوي',
    colorTheme: 'amber',
    iconName: 'ArrowRightCircle',
    nodesCount: 4,
    edgesCount: 3,
    nodes: [
      {
        id: 'tmpl-jrn-ayah',
        type: 'ayah',
        x: 1000,
        y: 160,
        width: 420,
        colorTheme: 'amber',
        ayahData: {
          surahNumber: 65,
          surahName: 'الطلاق',
          ayahNumberInSurah: 2,
          juz: 28,
          revelationType: 'Medinan',
          textUthmani: 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
          textSimple: 'ومن يتق الله يجعل له مخرجا ويرزقه من حيث لا يحتسب',
          annotations: [
            {
              id: 'ann-jrn-1',
              wordIndex: 1,
              endWordIndex: 2,
              wordText: 'يَتَّقِ ٱللَّهَ',
              type: 'circle',
              color: '#d97706',
              note: 'الشرط: ملازمة الخشية وامتثال الأمر واجتناب الحرام'
            },
            {
              id: 'ann-jrn-2',
              wordIndex: 5,
              wordText: 'مَخْرَجًا',
              type: 'highlight',
              color: '#f59e0b',
              note: 'الجواب: من كل ضيق في الدنيا والآخرة'
            }
          ]
        }
      },
      {
        id: 'tmpl-jrn-cause',
        type: 'note',
        x: 560,
        y: 80,
        width: 360,
        colorTheme: 'stone',
        noteData: {
          title: '1. السياق القرآني ومناط الابتلاء',
          content: 'نزلت الآية في سياق الطلاق وأحكام المفارقة وضيق ذات اليد، لتبين أن ملازمة حدود الله عند أشد الخلافات النفسية والمادية هي مفتاح الفرج الحقيقي.',
          tags: ['سياق_النزول', 'أسباب_الفرج', 'فقه_الابتلاء']
        }
      },
      {
        id: 'tmpl-jrn-wisdom',
        type: 'concept',
        x: 560,
        y: 330,
        width: 360,
        colorTheme: 'teal',
        conceptData: {
          title: '2. الحكمة واللطيفة العقدية',
          description: 'الرزق والمخرج لا يقفان عند حسابات العقل المادي (من حيث لا يحتسب). الله يفتح الأبواب من جهات لم تكن في حسبان العبد إذا صدق في تقواه.',
          category: 'يقين وتوكل',
          badge: 'لطيفة إيمانية'
        }
      },
      {
        id: 'tmpl-jrn-action',
        type: 'note',
        x: 100,
        y: 200,
        width: 380,
        colorTheme: 'emerald',
        noteData: {
          title: '3. الواجب العملي وخطة اليوم',
          content: '• حصر همّ يشغل البال الآن والتوقف عن القلق غير المجدي.\n• رصد خصلة تقوى يحبها الله (بر والدين، كف أذى، صدقة خفاء) والقيام بها فوراً بنية الفرج.\n• الثقة التامة بوعد الله وأنه الكافي.',
          tags: ['خطة_عملية', 'تطبيق_اليوم', 'واجب_التدبر']
        }
      }
    ],
    edges: [
      {
        id: 'tmpl-jrn-e1',
        sourceId: 'tmpl-jrn-ayah',
        targetId: 'tmpl-jrn-cause',
        label: '1. فهم السياق',
        style: 'solid',
        arrowType: 'end',
        color: '#64748b'
      },
      {
        id: 'tmpl-jrn-e2',
        sourceId: 'tmpl-jrn-ayah',
        targetId: 'tmpl-jrn-wisdom',
        label: '2. استنباط الحكمة',
        style: 'solid',
        arrowType: 'end',
        color: '#0d9488'
      },
      {
        id: 'tmpl-jrn-e3',
        sourceId: 'tmpl-jrn-wisdom',
        targetId: 'tmpl-jrn-action',
        label: '3. الثمرة السلوكية المعاصرة',
        style: 'solid',
        arrowType: 'end',
        color: '#059669'
      }
    ]
  },

  // 5. Quranic Contrast & Dualities (المقابلة والتضاد)
  {
    id: 'template-contrast-duality',
    title: 'المقابلة والتضاد القرآني (النور مقابل الظلمات)',
    subtitle: 'رسم المقارنة بين مصيري الإيمان والكفر، والجنة والنار',
    category: 'contrast',
    categoryLabel: 'موازنات ومقابلات',
    description: 'قالب يعرض ركيزتين متقابلتين في القرآن: يمين الورقة يمثل مسار الحق والنور والهدى، ويسارها يمثل مسار الباطل والظلمات، مع محور فاصل يبرز جوهر الفرق.',
    badge: 'موازنة عقدية',
    colorTheme: 'teal',
    iconName: 'Columns',
    nodesCount: 5,
    edgesCount: 4,
    nodes: [
      {
        id: 'tmpl-cnt-axis',
        type: 'concept',
        x: 580,
        y: 60,
        width: 360,
        colorTheme: 'teal',
        conceptData: {
          title: 'محور التقابل: ولاية الله ⟷ ولاية الطاغوت',
          description: 'القرآن الكريم يعتمد أسلوب المقابلة لبيان حقائق التوحيد: إفراد النور لأنه حق واحد، وجمع الظلمات لأن سبل الباطل والضلال متشعبة.',
          category: 'الميزان القرآني',
          badge: 'تضاد بياني'
        }
      },
      {
        id: 'tmpl-cnt-ayah-light',
        type: 'ayah',
        x: 1050,
        y: 220,
        width: 400,
        colorTheme: 'emerald',
        ayahData: {
          surahNumber: 2,
          surahName: 'البقرة',
          ayahNumberInSurah: 257,
          juz: 3,
          revelationType: 'Medinan',
          textUthmani: 'ٱللَّهُ وَلِيُّ ٱلَّذِينَ ءَامَنُوا۟ يُخْرِجُهُم مِّنَ ٱلظُّلُمَٰتِ إِلَى ٱلنُّورِ',
          textSimple: 'الله ولي الذين آمنوا يخرجهم من الظلمات إلى النور',
          annotations: [
            {
              id: 'ann-cnt-1',
              wordIndex: 1,
              wordText: 'وَلِيُّ',
              type: 'circle',
              color: '#059669',
              note: 'المتولي لأمورهم بالنصرة والتوفيق والتسديد'
            },
            {
              id: 'ann-cnt-2',
              wordIndex: 7,
              wordText: 'ٱلنُّورِ',
              type: 'highlight',
              color: '#10b981',
              note: 'جاء النور مفرداً لأن صراط الله المستقيم واحد لا تفرق فيه'
            }
          ]
        }
      },
      {
        id: 'tmpl-cnt-ayah-dark',
        type: 'ayah',
        x: 100,
        y: 220,
        width: 400,
        colorTheme: 'rose',
        ayahData: {
          surahNumber: 2,
          surahName: 'البقرة',
          ayahNumberInSurah: 257,
          juz: 3,
          revelationType: 'Medinan',
          textUthmani: 'وَٱلَّذِينَ كَفَرُوٓا۟ أَوْلِيَآؤُهُمُ ٱلطَّٰغُوتُ يُخْرِجُونَهُم مِّنَ ٱلنُّورِ إِلَى ٱلظُّلُمَٰتِ',
          textSimple: 'والذين كفروا أولياؤهم الطاغوت يخرجونهم من النور إلى الظلمات',
          annotations: [
            {
              id: 'ann-cnt-3',
              wordIndex: 3,
              wordText: 'ٱلطَّٰغُوتُ',
              type: 'circle',
              color: '#e11d48',
              note: 'كل ما تجاوز به العبد حده من معبود أو متبوع أو مطاع في معصية الله'
            },
            {
              id: 'ann-cnt-4',
              wordIndex: 8,
              wordText: 'ٱلظُّلُمَٰتِ',
              type: 'highlight',
              color: '#f43f5e',
              note: 'جاءت الظلمات جمعاً لكثرة الأهواء والبدع والشبهات'
            }
          ]
        }
      },
      {
        id: 'tmpl-cnt-note-light',
        type: 'note',
        x: 1050,
        y: 520,
        width: 380,
        colorTheme: 'emerald',
        noteData: {
          title: 'أركان مسار النور',
          content: '• اليقين بوعد الله ومعيته.\n• السكينة ووضوح الرؤية في الفتن.\n• الخروج المستمر من ظلمات الحيرة إلى نور البصيرة.',
          tags: ['مسار_النور', 'الولاية_الإلهية']
        }
      },
      {
        id: 'tmpl-cnt-note-dark',
        type: 'note',
        x: 100,
        y: 520,
        width: 380,
        colorTheme: 'rose',
        noteData: {
          title: 'أخطار مسار الظلمات',
          content: '• التخبط في الشكوك والشهوات.\n• خذلان الطاغوت لأوليائه عند الشدائد.\n• الانتكاس من نور الفطرة إلى ظلمات الكفران.',
          tags: ['مسار_الظلمات', 'عواقب_الضلال']
        }
      }
    ],
    edges: [
      {
        id: 'tmpl-cnt-e1',
        sourceId: 'tmpl-cnt-axis',
        targetId: 'tmpl-cnt-ayah-light',
        label: 'حزب الإيمان: إخراج من الظلمات إلى النور',
        style: 'solid',
        arrowType: 'end',
        color: '#059669'
      },
      {
        id: 'tmpl-cnt-e2',
        sourceId: 'tmpl-cnt-axis',
        targetId: 'tmpl-cnt-ayah-dark',
        label: 'حزب الكفران: إخراج من النور إلى الظلمات',
        style: 'solid',
        arrowType: 'end',
        color: '#e11d48'
      },
      {
        id: 'tmpl-cnt-e3',
        sourceId: 'tmpl-cnt-ayah-light',
        targetId: 'tmpl-cnt-ayah-dark',
        sourceWordText: 'ٱلنُّورِ',
        targetWordText: 'ٱلظُّلُمَٰتِ',
        label: 'مقابلة تضادية: النور (مفرد) ⟷ الظلمات (جمع)',
        style: 'dashed',
        arrowType: 'both',
        color: '#0d9488'
      },
      {
        id: 'tmpl-cnt-e4',
        sourceId: 'tmpl-cnt-ayah-light',
        targetId: 'tmpl-cnt-note-light',
        label: 'ثمار الولاية',
        style: 'solid',
        arrowType: 'end',
        color: '#10b981'
      }
    ]
  },

  // 6. Quranic Narrative & Life Stations (قصص وتاريخ قرآني)
  {
    id: 'template-narrative-stations',
    title: 'المحطات التربوية في القصص القرآني',
    subtitle: 'تتبع المحطات القيادية والدروس في قصص الأنبياء',
    category: 'narrative',
    categoryLabel: 'قصص وعبر',
    description: 'قالب زمني متسلسل يربط محطات حياة النبي أو القصة القرآنية (الابتلاء ⟵ الإعداد والتربية ⟵ التمكين والنصر) مع استخلاص سنن التغيير الإلهية.',
    badge: 'تربية وسنن',
    colorTheme: 'indigo',
    iconName: 'BookOpen',
    nodesCount: 4,
    edgesCount: 3,
    nodes: [
      {
        id: 'tmpl-nst-hub',
        type: 'concept',
        x: 580,
        y: 70,
        width: 380,
        colorTheme: 'indigo',
        conceptData: {
          title: 'محطات الاصطناع الإلهي في قصة موسى عليه السلام',
          description: 'تتبع مراحل تربية كليم الله موسى عليه السلام من لحظة الإلقاء في اليم رضيعاً إلى مناجاة الطور والتمكين لبني إسرائيل.',
          category: 'القصص القرآني',
          badge: 'وَاصْطَنَعْتُكَ لِنَفْسِي'
        }
      },
      {
        id: 'tmpl-nst-ayah-1',
        type: 'ayah',
        x: 1050,
        y: 260,
        width: 390,
        colorTheme: 'teal',
        ayahData: {
          surahNumber: 20,
          surahName: 'طه',
          ayahNumberInSurah: 39,
          juz: 16,
          revelationType: 'Meccan',
          textUthmani: 'وَأَلْقَيْتُ عَلَيْكَ مَحَبَّةً مِّنِّي وَلِتُصْنَعَ عَلَىٰ عَيْنِي',
          textSimple: 'وألقيت عليك محبة مني ولتصنع على عيني',
          annotations: [
            {
              id: 'ann-nst-1',
              wordIndex: 5,
              endWordIndex: 7,
              wordText: 'وَلِتُصْنَعَ عَلَىٰ عَيْنِي',
              type: 'highlight',
              color: '#0d9488',
              note: 'التربية والرعاية الإلهية الخاصة حتى في قصر ألد أعدائه'
            }
          ]
        }
      },
      {
        id: 'tmpl-nst-ayah-2',
        type: 'ayah',
        x: 580,
        y: 350,
        width: 390,
        colorTheme: 'amber',
        ayahData: {
          surahNumber: 26,
          surahName: 'الشعراء',
          ayahNumberInSurah: 62,
          juz: 19,
          revelationType: 'Meccan',
          textUthmani: 'قَالَ كَلَّآ ۖ إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ',
          textSimple: 'قال كلا إن معي ربي سيهدين',
          annotations: [
            {
              id: 'ann-nst-2',
              wordIndex: 1,
              wordText: 'كَلَّآ',
              type: 'circle',
              color: '#d97706',
              note: 'حرف ردع وزجر حاسم لكل هواجس اليأس والخوف عند رؤية البحر وفرعون'
            },
            {
              id: 'ann-nst-3',
              wordIndex: 3,
              endWordIndex: 4,
              wordText: 'مَعِيَ رَبِّي',
              type: 'highlight',
              color: '#f59e0b',
              note: 'يقين المعية الخاصة الذي فلق البحر'
            }
          ]
        }
      },
      {
        id: 'tmpl-nst-note',
        type: 'note',
        x: 100,
        y: 280,
        width: 400,
        colorTheme: 'indigo',
        noteData: {
          title: 'الخلاصة السلوكية والتربوية',
          content: '• لا تيأس مهما بدا الظرف مستحيلاً: الذي حفظ الرضيع في اليم وسط التوابيت هو الذي فلق البحر للأمة المستضعفة.\n• كمال الاصطناع والتربية يسبق دائماً كمال التمكين والنصر.\n• المعية الإلهية الصادقة تبدد كل جيوش الخوف.',
          tags: ['قصة_موسى', 'سنن_النصر', 'المعية_الإلهية']
        }
      }
    ],
    edges: [
      {
        id: 'tmpl-nst-e1',
        sourceId: 'tmpl-nst-hub',
        targetId: 'tmpl-nst-ayah-1',
        label: 'المحطة الأولى: النشأة والحفظ الإلهي',
        style: 'solid',
        arrowType: 'end',
        color: '#0d9488'
      },
      {
        id: 'tmpl-nst-e2',
        sourceId: 'tmpl-nst-ayah-1',
        targetId: 'tmpl-nst-ayah-2',
        label: 'المحطة الثانية: محك اليقين عند البحر',
        style: 'solid',
        arrowType: 'end',
        color: '#d97706'
      },
      {
        id: 'tmpl-nst-e3',
        sourceId: 'tmpl-nst-ayah-2',
        targetId: 'tmpl-nst-note',
        label: 'العبر والدروس المعاصرة',
        style: 'dashed',
        arrowType: 'end',
        color: '#6366f1'
      }
    ]
  }
];
