import { SemanticTopic } from '../types';

export const QURAN_SEMANTIC_TOPICS: SemanticTopic[] = [
  {
    id: 'tawheed',
    title: 'التوحيد وعظمة الخالق',
    category: 'العقيدة والإيمان',
    iconName: 'Compass',
    description: 'إفراد الله سبحانه بالربوبية والألوهية والأسماء والصفات، وإدراك وحدانيته ونفي الشريك والند عنه.',
    keywords: ['توحيد', 'لا إله إلا الله', 'الخالق', 'الله أحد', 'الرب', 'الألوهية', 'الإخلاص', 'الشرك', 'وحدانية'],
    sampleAyahs: [
      { surahNumber: 112, ayahNumber: 1, tadabburNote: 'إعلان صريح للوحدانية المطلقة التي لا يعتريها شريك ولا تجزؤ.' },
      { surahNumber: 2, ayahNumber: 255, tadabburNote: 'آية الكرسي: أعظم آية، تجمع بين كمال الحياة والقيومية وسعة الملك والعلم.' },
      { surahNumber: 59, ayahNumber: 23, tadabburNote: 'سرد جليل لأسماء الجلال والجمال التي تورث في القلب الهيبة والمحبة.' },
      { surahNumber: 6, ayahNumber: 102, tadabburNote: 'ربوبية الله الشاملة لكل موجود تستوجب إفراده بالعبادة والتوكل.' }
    ]
  },
  {
    id: 'tadabbur-creation',
    title: 'التفكر في آيات الآفاق والأنفس',
    category: 'التدبر والتفكر',
    iconName: 'Eye',
    description: 'دعوة القرآن المستمرة لإعمال العقل والتأمل في بديع صنع الله في الكون والسماوات والأرض وخلق الإنسان.',
    keywords: ['تفكر', 'يتفكرون', 'تدبر', 'خلق السماوات', 'الآفاق', 'الأنفس', 'آيات', 'أولو الألباب', 'الكون', 'صنع الله'],
    sampleAyahs: [
      { surahNumber: 3, ayahNumber: 191, tadabburNote: 'الجمع بين دوام الذكر باللسان وعمق التفكر بالقلب يثمر معرفة الحكمة من الخلق.' },
      { surahNumber: 41, ayahNumber: 53, tadabburNote: 'وعد إلهي بتجلي براهين الحق في اتساع الآفاق ودقائق الأنفس عبر العصور.' },
      { surahNumber: 88, ayahNumber: 17, tadabburNote: 'دعوة للنظر المباشر في مخلوقات مشهودة: الإبل، السماء، الجبال، الأرض.' },
      { surahNumber: 51, ayahNumber: 21, tadabburNote: 'عجائب تكوين الإنسان وما أودع فيه من آيات وأسرار تدل على عظمة بارئه.' }
    ]
  },
  {
    id: 'sabr-pleasure',
    title: 'الصبر والرضا والاحتساب',
    category: 'أعمال القلوب',
    iconName: 'Shield',
    description: 'قوة النفس في مواجهة الابتلاءات والمصائب، واليقين بأن مع العسر يسراً، وبشارة الصابرين بأوفى الجزاء.',
    keywords: ['صبر', 'الصابرين', 'ابتلاء', 'مصيبة', 'عسر', 'يسر', 'رضا', 'احتساب', 'بلاء', 'اصبر'],
    sampleAyahs: [
      { surahNumber: 2, ayahNumber: 155, tadabburNote: 'الابتلاء سنة ماضية، وجزاء الصابرين صلوات من ربهم ورحمة وهداية.' },
      { surahNumber: 94, ayahNumber: 6, tadabburNote: 'تكرار المعية: إن مع العسر يسراً، غلب يسرٌ عسرين.' },
      { surahNumber: 39, ayahNumber: 10, tadabburNote: 'الجزاء المفتوح بغير حساب خاص بالصابرين لعظم ما كابدوه لوجه الله.' },
      { surahNumber: 16, ayahNumber: 127, tadabburNote: 'الصبر لا ينال بالجهد البشري المجرد، بل هو معونة وتوفيق من الله: وما صبرك إلا بالله.' }
    ]
  },
  {
    id: 'mercy-forgiveness',
    title: 'الرحمة والمغفرة والعفو',
    category: 'الرجاء واللطف',
    iconName: 'Heart',
    description: 'سعة رحمة الله التي سبقت غضبه، وفتح باب التوبة لكل مسرف، والحث على العفو والصفح بين العباد.',
    keywords: ['رحمة', 'مغفرة', 'غفور', 'رحيم', 'عفو', 'توبة', 'استغفار', 'لطف', 'صفح', 'واسع'],
    sampleAyahs: [
      { surahNumber: 39, ayahNumber: 53, label: 'أرجى آية في كتاب الله', tadabburNote: 'نداء مليء بالتودد: يا عبادي الذين أسرفوا... لا تقنطوا من رحمة الله.' },
      { surahNumber: 7, ayahNumber: 156, tadabburNote: 'شمول الرحمة الإلهية لكل ذرة في الوجود، وتخصيص كمالها للمتقين.' },
      { surahNumber: 42, ayahNumber: 25, tadabburNote: 'فرح الرب بتوبة عباده وتجاوزه عن السيئات وقبول الإنابة.' },
      { surahNumber: 24, ayahNumber: 22, tadabburNote: 'الترغيب في العفو الإنساني: ألا تحبون أن يغفر الله لكم.' }
    ]
  },
  {
    id: 'tawakkul-trust',
    title: 'التوكل واليقين وحسن الظن',
    category: 'أعمال القلوب',
    iconName: 'Anchor',
    description: 'تفويض الأمور إلى الله، وانقطاع التعلق بالأسباب وحدها، والثقة الكاملة بتدبير الخالق الحكيم.',
    keywords: ['توكل', 'وكيل', 'حسبنا الله', 'يقين', 'ثقة', 'كفاية', 'تفويض', 'متوكلين'],
    sampleAyahs: [
      { surahNumber: 65, ayahNumber: 3, tadabburNote: 'من جعل اعتماده التام على الله، كفاه جميع ما أهمّه في دنياه ودينه.' },
      { surahNumber: 3, ayahNumber: 173, tadabburNote: 'كلمة إبراهيم ومحمد عليهما السلام في الشدائد: حسبنا الله ونعم الوكيل.' },
      { surahNumber: 8, ayahNumber: 2, tadabburNote: 'من سمات المؤمنين الصادقين: إذا تليت عليهم آياته زادتهم إيماناً وعلى ربهم يتوكلون.' }
    ]
  },
  {
    id: 'duaa-whisper',
    title: 'الدعاء والمناجاة والقرب',
    category: 'الصلة بالله',
    iconName: 'Sparkles',
    description: 'عبادة الدعاء، ونداء المضطرين، وقرب الله من السائلين في الأسحار وأدبار الصلوات ومواطن الشدة.',
    keywords: ['دعاء', 'ادعوني', 'قريب', 'أجيب', 'مناجاة', 'تضرع', 'ربنا', 'سأل', 'استجابة'],
    sampleAyahs: [
      { surahNumber: 2, ayahNumber: 186, tadabburNote: 'آية القرب الصادق: وردت بين آيات الصيام لتبين شرف مقام الدعاء.' },
      { surahNumber: 40, ayahNumber: 60, tadabburNote: 'أمر بالدعاء مقرون بضمان الإجابة: ادعوني أستجب لكم.' },
      { surahNumber: 21, ayahNumber: 87, tadabburNote: 'دعوة ذي النون في ظلمات ثلاث: توحيد وتنزيه واعتراف بالذنب، ما دعا بها مكروب إلا فرّج عنه.' }
    ]
  },
  {
    id: 'ethics-ihsan',
    title: 'الإحسان ومكارم الأخلاق',
    category: 'المعاملات والأخلاق',
    iconName: 'Award',
    description: 'القول الحسن، كظم الغيظ، الدفع بالتي هي أحسن، الصدق، الأمانة، والعدل مع الصديق والمخالف.',
    keywords: ['إحسان', 'محسنين', 'أخلاق', 'قول حسن', 'كظم الغيظ', 'ادفع بالتي هي أحسن', 'عفو', 'صدق'],
    sampleAyahs: [
      { surahNumber: 3, ayahNumber: 134, tadabburNote: 'مراتب الإحسان: الإنفاق في السراء والضراء، وكظم الغيظ، والعفو عن الناس.' },
      { surahNumber: 41, ayahNumber: 34, tadabburNote: 'قانون تحويل العداوة إلى ولاء ومودة: ادفع بالتي هي أحسن.' },
      { surahNumber: 2, ayahNumber: 83, tadabburNote: 'الأدب اللفظي الشامل مع كافة البشر: وقولوا للناس حسنا.' },
      { surahNumber: 49, ayahNumber: 12, tadabburNote: 'حرمة الأعراض والنهي عن الظن والتجسس والغيبة لحفظ لحمة المجتمع.' }
    ]
  },
  {
    id: 'quran-guidance',
    title: 'أثر القرآن وتأمل رسالته',
    category: 'التدبر والتفكر',
    iconName: 'BookOpen',
    description: 'خصائص القرآن، هدايته للتي هي أقوم، بركته، شفاؤه للصدور، وأثره في تليين القلوب وتثبيت المؤمنين.',
    keywords: ['القرآن', 'هدى', 'شفاء', 'ذكر', 'مبارك', 'فرقان', 'نور', 'أقوم', 'تدبر القرآن'],
    sampleAyahs: [
      { surahNumber: 17, ayahNumber: 9, tadabburNote: 'القرآن يهدي لأقوم الطرق في الاعتقاد والعمل والسلوك وحياة الأفراد والأمم.' },
      { surahNumber: 10, ayahNumber: 57, tadabburNote: 'أربع فضائل جامعة: موعظة من ربكم، وشفاء لما في الصدور، وهدى، ورحمة للمؤمنين.' },
      { surahNumber: 59, ayahNumber: 21, tadabburNote: 'جلال القرآن وثقله: لو أنزل على جبل لرأيته خاشعاً متصدعاً من خشية الله.' },
      { surahNumber: 38, ayahNumber: 29, tadabburNote: 'الغاية الكبرى من تنزيل الكتاب: ليدّبّروا آياته وليتذكر أولو الألباب.' }
    ]
  },
  {
    id: 'family-parents',
    title: 'بر الوالدين وحقوق الأسرة',
    category: 'المعاملات والأخلاق',
    iconName: 'Users',
    description: 'الإحسان للوالدين وخفض جناح الذل لهما رحمةً، والمودة والرحمة بين الزوجين، ورعاية الأبناء.',
    keywords: ['والدين', 'أمي', 'أبي', 'بر الوالدين', 'أف', 'جناح الذل', 'مودة', 'رحمة', 'أهل', 'أسرة'],
    sampleAyahs: [
      { surahNumber: 17, ayahNumber: 23, tadabburNote: 'قرن الله حقه بالتوحيد بحق الوالدين بالإحسان، ونهى عن أدنى درجات التأفف.' },
      { surahNumber: 31, ayahNumber: 14, tadabburNote: 'التذكير بوهن الحمل ومعاناة الفصال استثارة لوازع الوفاء والشكر.' },
      { surahNumber: 30, ayahNumber: 21, tadabburNote: 'أساس البناء الأسري السليم: السكن النفسي، والمودة الجامعة، والرحمة الواقية.' }
    ]
  },
  {
    id: 'justice-rights',
    title: 'العدل والقسط ومحاربة الظلم',
    category: 'الحكم والاجتماع',
    iconName: 'Scale',
    description: 'إقامة الميزان بالقسط، تحريم الظلم والاعتداء، وأداء الأمانات والشهادة بالحق ولو على النفس.',
    keywords: ['عدل', 'قسط', 'ميزان', 'ظلم', 'أمانات', 'شهادة بالحق', 'إنصاف', 'مقسطين'],
    sampleAyahs: [
      { surahNumber: 4, ayahNumber: 135, tadabburNote: 'الشهادة المجردة لله ولو كانت على النفس أو الوالدين أو الأقربين.' },
      { surahNumber: 5, ayahNumber: 8, tadabburNote: 'نهي جازم أن يحمل الشنآن (البغض) على ترك العدل مع الخصوم.' },
      { surahNumber: 14, ayahNumber: 42, tadabburNote: 'تسلية للمظلومين ووعيد للظلمة: ولا تحسبن الله غافلاً عما يعمل الظالمون.' }
    ]
  }
];

export function findSemanticTopics(query: string): SemanticTopic[] {
  const q = query.trim();
  if (!q) return QURAN_SEMANTIC_TOPICS;

  return QURAN_SEMANTIC_TOPICS.filter(topic =>
    topic.title.includes(q) ||
    topic.category.includes(q) ||
    topic.description.includes(q) ||
    topic.keywords.some(k => k.includes(q))
  );
}
