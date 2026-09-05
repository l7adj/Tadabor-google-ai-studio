import { RootDictionaryEntry } from '../types';

/**
 * Curated Quranic Roots Dictionary
 * Provides rich linguistic roots, their core semantic meanings, and notable Quranic derivatives
 */
export const QURAN_ROOTS_DICTIONARY: RootDictionaryEntry[] = [
  {
    root: 'رحم',
    description: 'الرِّقَّةُ والتعطُّفُ والمغفِرَةُ، ومنه الرحمن والرحيم، وأصل الرحم القرابة وموضع تكوّن الجنين لحفظه ولطفه.',
    primaryDerivatives: ['الرحمن', 'الرحيم', 'رحمة', 'يرحم', 'ارحم', 'أرحام', 'تراحم'],
    occurrenceCountApprox: 339,
    suggestedVerses: [
      { surah: 1, ayah: 1, label: 'بسم الله الرحمن الرحيم' },
      { surah: 7, ayah: 156, label: 'ورحمتي وسعت كل شيء' },
      { surah: 21, ayah: 107, label: 'وما أرسلناك إلا رحمة للعالمين' }
    ]
  },
  {
    root: 'هدي',
    description: 'الدلالة والإرشاد بلطف إلى ما فيه الخير والصلاح، ونقيضه الضلال والغيّ.',
    primaryDerivatives: ['هدى', 'يهدي', 'اهتدى', 'المهتدين', 'هداية', 'أهدى'],
    occurrenceCountApprox: 316,
    suggestedVerses: [
      { surah: 1, ayah: 6, label: 'اهدنا الصراط المستقيم' },
      { surah: 2, ayah: 2, label: 'هدى للمتقين' },
      { surah: 28, ayah: 56, label: 'إنك لا تهدي من أحببت ولكن الله يهدي من يشاء' }
    ]
  },
  {
    root: 'علم',
    description: 'إدراك الشيء بحقيقته، ومنه عليم وعالم ومَعْلَم، ونقيضه الجهل والظن والشك.',
    primaryDerivatives: ['علم', 'يعلم', 'عليم', 'علّم', 'علماء', 'معلوم', 'أعلم'],
    occurrenceCountApprox: 854,
    suggestedVerses: [
      { surah: 96, ayah: 5, label: 'علّم الإنسان ما لم يعلم' },
      { surah: 2, ayah: 31, label: 'وعلّم آدم الأسماء كلها' },
      { surah: 20, ayah: 114, label: 'وقل رب زدني علما' }
    ]
  },
  {
    root: 'كتب',
    description: 'جمع الحروف ورسمها، وأصل الكَتْبِ الجمع والإلزام والفرض والتقدير في اللوح.',
    primaryDerivatives: ['كتب', 'كتاب', 'كتبنا', 'يكتب', 'كاتب', 'مكتوب', 'كتابا'],
    occurrenceCountApprox: 319,
    suggestedVerses: [
      { surah: 2, ayah: 183, label: 'كتب عليكم الصيام' },
      { surah: 4, ayah: 103, label: 'إن الصلاة كانت على المؤمنين كتابا موقوتا' },
      { surah: 6, ayah: 12, label: 'كتب على نفسه الرحمة' }
    ]
  },
  {
    root: 'حكم',
    description: 'المنع من الفساد والفصل بين الحق والباطل، ومنه الحكمة وهي معرفة أفضل الأشياء بأفضل العلوم.',
    primaryDerivatives: ['حكم', 'حكمة', 'حكيم', 'يحكم', 'الحاكمين', 'أحكمت'],
    occurrenceCountApprox: 210,
    suggestedVerses: [
      { surah: 2, ayah: 269, label: 'يؤتي الحكمة من يشاء' },
      { surah: 4, ayah: 58, label: 'وإذا حكمتم بين الناس أن تحكموا بالعدل' },
      { surah: 95, ayah: 8, label: 'أليس الله بأحكم الحاكمين' }
    ]
  },
  {
    root: 'خلق',
    description: 'التقدير والإيجاد على غير مثال سابق، وتمليس الشيء وتسويته بإتقان.',
    primaryDerivatives: ['خلق', 'يخلق', 'خالق', 'خلاّق', 'خلقنا', 'مخلوق'],
    occurrenceCountApprox: 261,
    suggestedVerses: [
      { surah: 96, ayah: 1, label: 'اقرأ باسم ربك الذي خلق' },
      { surah: 23, ayah: 14, label: 'فتبارك الله أحسن الخالقين' },
      { surah: 3, ayah: 191, label: 'ربنا ما خلقت هذا باطلا' }
    ]
  },
  {
    root: 'امن',
    description: 'طمأنينة النفس وزوال الخوف، والتصديق الجازم بالحق مع الإذعان، ونقيضه الكفر والريب.',
    primaryDerivatives: ['آمن', 'يؤمن', 'مؤمن', 'إيمان', 'أمن', 'أمانة', 'مأمون'],
    occurrenceCountApprox: 879,
    suggestedVerses: [
      { surah: 2, ayah: 3, label: 'الذين يؤمنون بالغيب' },
      { surah: 49, ayah: 14, label: 'ولما يدخل الإيمان في قلوبكم' },
      { surah: 106, ayah: 4, label: 'وآمنهم من خوف' }
    ]
  },
  {
    root: 'عبد',
    description: 'التذلل والخضوع مع كمال المحبة والتعظيم، ومنه العبادة والطاعة الخالصة لله وحده.',
    primaryDerivatives: ['عبد', 'يعبد', 'عبادة', 'عابد', 'عباد', 'عبيد', 'تعبيد'],
    occurrenceCountApprox: 275,
    suggestedVerses: [
      { surah: 1, ayah: 5, label: 'إياك نعبد وإياك نستعين' },
      { surah: 51, ayah: 56, label: 'وما خلقت الجن والإنس إلا ليعبدون' },
      { surah: 25, ayah: 63, label: 'وعباد الرحمن الذين يمشون على الأرض هونا' }
    ]
  },
  {
    root: 'سلم',
    description: 'السلامة والنجاة من الآفات والنقائص، والانقياد والإخلاص في الاستسلام لأمر الله.',
    primaryDerivatives: ['إسلام', 'مسلم', 'سلام', 'سليم', 'يسلم', 'سلّم', 'السلم'],
    occurrenceCountApprox: 140,
    suggestedVerses: [
      { surah: 3, ayah: 19, label: 'إن الدين عند الله الإسلام' },
      { surah: 26, ayah: 89, label: 'إلا من أتى الله بقلب سليم' },
      { surah: 59, ayah: 23, label: 'الملك القدوس السلام' }
    ]
  },
  {
    root: 'صبر',
    description: 'حبس النفس عن الجزع واللسان عن الشكوى والجوارح عن المعصية، والثبات على المكاره.',
    primaryDerivatives: ['صبر', 'يصبر', 'صابر', 'اصطبر', 'صبور', 'الصابرين'],
    occurrenceCountApprox: 103,
    suggestedVerses: [
      { surah: 2, ayah: 153, label: 'استعينوا بالصبر والصلاة إن الله مع الصابرين' },
      { surah: 39, ayah: 10, label: 'إنما يوفى الصابرون أجرهم بغير حساب' },
      { surah: 103, ayah: 3, label: 'وتواصوا بالحق وتواصوا بالصبر' }
    ]
  },
  {
    root: 'شكر',
    description: 'الاعتراف بالنعمة وإظهارها باللسان والقلب والعمل، ونقيضه الكفران والجحود.',
    primaryDerivatives: ['شكر', 'يشكر', 'شاكر', 'شكور', 'شكرتم', 'شكرنا'],
    occurrenceCountApprox: 75,
    suggestedVerses: [
      { surah: 14, ayah: 7, label: 'لئن شكرتم لأزيدنكم' },
      { surah: 31, ayah: 12, label: 'ومن يشكر فإنما يشكر لنفسه' },
      { surah: 34, ayah: 13, label: 'اعملوا آل داوود شكرا وقليل من عبادي الشكور' }
    ]
  },
  {
    root: 'غفر',
    description: 'الستر والتغطية والوقاية من أثر الذنب وعقابه، ومنه المغفرة والغفار.',
    primaryDerivatives: ['غفر', 'يغفر', 'مغفرة', 'غفور', 'غفار', 'استغفر', 'غفرانك'],
    occurrenceCountApprox: 234,
    suggestedVerses: [
      { surah: 39, ayah: 53, label: 'إن الله يغفر الذنوب جميعا' },
      { surah: 3, ayah: 133, label: 'وسارعوا إلى مغفرة من ربكم' },
      { surah: 71, ayah: 10, label: 'فقلت استغفروا ربكم إنه كان غفارا' }
    ]
  },
  {
    root: 'فكر',
    description: 'إعمال العقل والتأمل في دلائل الأشياء للوصول إلى حقائقها ومعانيها.',
    primaryDerivatives: ['تفكر', 'يتفكرون', 'فكرة', 'فكروا', 'يتفكر'],
    occurrenceCountApprox: 18,
    suggestedVerses: [
      { surah: 3, ayah: 191, label: 'ويتفكرون في خلق السماوات والأرض' },
      { surah: 59, ayah: 21, label: 'وتلك الأمثال نضربها للناس لعلهم يتفكرون' },
      { surah: 16, ayah: 44, label: 'وأنزلنا إليك الذكر لتبين للناس ما نزل إليهم ولعلهم يتفكرون' }
    ]
  },
  {
    root: 'عقل',
    description: 'الإمساك والتثبت والربط، وهو القوة المانعة للإنسان من الخطأ وقبائح الأفعال.',
    primaryDerivatives: ['عقل', 'يعقلون', 'يعقلها', 'نعقل'],
    occurrenceCountApprox: 49,
    suggestedVerses: [
      { surah: 2, ayah: 44, label: 'أتأمرون الناس بالبر وتنسون أنفسكم وأنتم تتلون الكتاب أفلا تعقلون' },
      { surah: 29, ayah: 43, label: 'وتلك الأمثال نضربها للناس وما يعقلها إلا العالمون' },
      { surah: 67, ayah: 10, label: 'وقالوا لو كنا نسمع أو نعقل ما كنا في أصحاب السعير' }
    ]
  },
  {
    root: 'دبر',
    description: 'النظر في عواقب الأمور وأدبارها، ومنه التَّدَبُّرُ وهو الفحص العميق لمعاني الآيات وتأمل مآلاتها.',
    primaryDerivatives: ['تدبّر', 'يتدبرون', 'يدبّر', 'أدبار', 'دُبُر', 'مدبرات'],
    occurrenceCountApprox: 44,
    suggestedVerses: [
      { surah: 4, ayah: 82, label: 'أفلا يتدبرون القرآن ولو كان من عند غير الله لوجدوا فيه اختلافا كثيرا' },
      { surah: 47, ayah: 24, label: 'أفلا يتدبرون القرآن أم على قلوب أقفالها' },
      { surah: 38, ayah: 29, label: 'كتاب أنزلناه إليك مبارك ليدبروا آياته وليتذكر أولو الألباب' }
    ]
  },
  {
    root: 'نور',
    description: 'الضياء الساطع الكاشف للظلمات الحسيّة والمعنوية، وهو الحق والهدى والبيان.',
    primaryDerivatives: ['نور', 'أنوار', 'منير', 'ينير', 'نوره'],
    occurrenceCountApprox: 194,
    suggestedVerses: [
      { surah: 24, ayah: 35, label: 'الله نور السماوات والأرض' },
      { surah: 5, ayah: 15, label: 'قد جاءكم من الله نور وكتاب مبين' },
      { surah: 57, ayah: 12, label: 'يسعى نورهم بين أيديهم وبأيمانهم' }
    ]
  },
  {
    root: 'صدق',
    description: 'مطابقة القول والاعتقاد للواقع والحق، ونقيضه الكذب والرياء والخداع.',
    primaryDerivatives: ['صدق', 'صادق', 'صدّيق', 'يصدق', 'مصدق', 'صدقة', 'صداق'],
    occurrenceCountApprox: 155,
    suggestedVerses: [
      { surah: 9, ayah: 119, label: 'يا أيها الذين آمنوا اتقوا الله وكونوا مع الصادقين' },
      { surah: 33, ayah: 23, label: 'من المؤمنين رجال صدقوا ما عاهدوا الله عليه' },
      { surah: 39, ayah: 33, label: 'والذي جاء بالصدق وصدّق به أولئك هم المتقون' }
    ]
  },
  {
    root: 'عدل',
    description: 'الاستقامة والمساواة والإنصاف وإعطاء كل ذي حق حقه، ونقيضه الظلم والجور.',
    primaryDerivatives: ['عدل', 'يعدل', 'عادل', 'عدالة', 'تعدلوا'],
    occurrenceCountApprox: 28,
    suggestedVerses: [
      { surah: 16, ayah: 90, label: 'إن الله يأمر بالعدل والإحسان وإيتاء ذي القربى' },
      { surah: 5, ayah: 8, label: 'اعدلوا هو أقرب للتقوى' },
      { surah: 6, ayah: 115, label: 'وتمت كلمة ربك صدقا وعدلا' }
    ]
  },
  {
    root: 'قسط',
    description: 'العدل البالغ والنصيب الوافي، والمُقسِط هو العادل المنصف المحبوب عند الله.',
    primaryDerivatives: ['قسط', 'مقسطين', 'أقسطوا', 'القسطاس'],
    occurrenceCountApprox: 25,
    suggestedVerses: [
      { surah: 5, ayah: 42, label: 'وإن حكمت فاحكم بينهم بالقسط إن الله يحب المقسطين' },
      { surah: 57, ayah: 25, label: 'ليقوم الناس بالقسط' },
      { surah: 4, ayah: 135, label: 'كونوا قوامين بالقسط شهداء لله' }
    ]
  },
  {
    root: 'حمد',
    description: 'الثناء بالجميل الاختياري على جهة التعظيم والمحبة، وهو أعم من الشكر.',
    primaryDerivatives: ['حمد', 'الحمد', 'حامد', 'محمود', 'حميد'],
    occurrenceCountApprox: 68,
    suggestedVerses: [
      { surah: 1, ayah: 2, label: 'الحمد لله رب العالمين' },
      { surah: 17, ayah: 79, label: 'عسى أن يبعثك ربك مقاما محمودا' },
      { surah: 14, ayah: 1, label: 'إلى صراط العزيز الحميد' }
    ]
  },
  {
    root: 'ذكر',
    description: 'استحضار الشيء في القلب أو النطق به باللسان حتى لا يُنسى، والعظة والقرآن كله ذكر.',
    primaryDerivatives: ['ذكر', 'يذكر', 'تذكر', 'ذكرى', 'تذكرة', 'مذكور', 'ذاكرين'],
    occurrenceCountApprox: 292,
    suggestedVerses: [
      { surah: 13, ayah: 28, label: 'ألا بذكر الله تطمئن القلوب' },
      { surah: 2, ayah: 152, label: 'فاذكروني أذكركم واشكروا لي ولا تكفرون' },
      { surah: 15, ayah: 9, label: 'إنا نحن نزلنا الذكر وإنا له لحافظون' }
    ]
  },
  {
    root: 'بصر',
    description: 'رؤية العين ونور القلب الذي تُدرك به الحقائق (البصيرة).',
    primaryDerivatives: ['بصر', 'أبصار', 'بصير', 'يبصر', 'بصائر', 'مبصرة'],
    occurrenceCountApprox: 148,
    suggestedVerses: [
      { surah: 67, ayah: 3, label: 'فارجع البصر هل ترى من فطور' },
      { surah: 6, ayah: 104, label: 'قد جاءكم بصائر من ربكم فمن أبصر فلنفسه' },
      { surah: 17, ayah: 1, label: 'إنه هو السميع البصير' }
    ]
  },
  {
    root: 'سمع',
    description: 'إدراك الأصوات وفهم الكلام والاستجابة له، ونقيضه الصمم والإعراض.',
    primaryDerivatives: ['سمع', 'يسمع', 'سميع', 'استمع', 'أسمع', 'سمعنا'],
    occurrenceCountApprox: 185,
    suggestedVerses: [
      { surah: 2, ayah: 285, label: 'وقالوا سمعنا وأطعنا غفرانك ربنا' },
      { surah: 7, ayah: 204, label: 'وإذا قرئ القرآن فاستمعوا له وأنصتوا' },
      { surah: 2, ayah: 256, label: 'والله سميع عليم' }
    ]
  },
  {
    root: 'قرب',
    description: 'الدنو في المكان أو المنزلة والزمان، والتقرب إلى الله بالأعمال الصالحة.',
    primaryDerivatives: ['قرب', 'قريب', 'أقرب', 'مقربون', 'قربة', 'تقرب'],
    occurrenceCountApprox: 96,
    suggestedVerses: [
      { surah: 2, ayah: 186, label: 'وإذا سألك عبادي عني فإني قريب أجيب دعوة الداع إذا دعان' },
      { surah: 50, ayah: 16, label: 'ونحن أقرب إليه من حبل الوريد' },
      { surah: 96, ayah: 19, label: 'واسجد واقترب' }
    ]
  },
  {
    root: 'جهد',
    description: 'بذل أقصى الوسع والطاقة لمدافعة الباطل وتحقيق مرضاة الله ومجاهدة النفس.',
    primaryDerivatives: ['جهاد', 'يجاهد', 'مجاهدين', 'جهد', 'جاهدوا'],
    occurrenceCountApprox: 41,
    suggestedVerses: [
      { surah: 29, ayah: 69, label: 'والذين جاهدوا فينا لنهدينهم سبلنا' },
      { surah: 22, ayah: 78, label: 'وجاهدوا في الله حق جهاده' }
    ]
  },
  {
    root: 'زكو',
    description: 'النماء والزيادة في الخير، والطهارة من الأدناس والآثام.',
    primaryDerivatives: ['زكاة', 'يزكي', 'تزكى', 'زكي', 'أزكى', 'زاكية'],
    occurrenceCountApprox: 59,
    suggestedVerses: [
      { surah: 91, ayah: 9, label: 'قد أفلح من زكاها' },
      { surah: 2, ayah: 43, label: 'وأقيموا الصلاة وآتوا الزكاة' },
      { surah: 87, ayah: 14, label: 'قد أفلح من تزكى' }
    ]
  },
  {
    root: 'صلو',
    description: 'الدعاء والثناء، والصلة والعبادة المخصوصة التي تجمع خضوع البدن والروح.',
    primaryDerivatives: ['صلاة', 'يصلي', 'صلوات', 'مصلين'],
    occurrenceCountApprox: 99,
    suggestedVerses: [
      { surah: 2, ayah: 45, label: 'واستعينوا بالصبر والصلاة' },
      { surah: 23, ayah: 2, label: 'الذين هم في صلاتهم خاشعون' },
      { surah: 20, ayah: 14, label: 'وأقم الصلاة لذكري' }
    ]
  },
  {
    root: 'صوم',
    description: 'الإمساك والامتناع عن الشهوات طاعةً وامتثالاً لأمر الله.',
    primaryDerivatives: ['صوم', 'صيام', 'يصوم', 'صائمين', 'صائمات'],
    occurrenceCountApprox: 14,
    suggestedVerses: [
      { surah: 2, ayah: 183, label: 'كتب عليكم الصيام كما كتب على الذين من قبلكم' },
      { surah: 2, ayah: 184, label: 'وأن تصوموا خير لكم إن كنتم تعلمون' }
    ]
  },
  {
    root: 'توب',
    description: 'الرجوع والإنابة عن الذنب إلى الطاعة والندم، وتوبة الله على عبده قبوله ورضاه عنه.',
    primaryDerivatives: ['تاب', 'يتوب', 'توبة', 'تواب', 'تائبين'],
    occurrenceCountApprox: 87,
    suggestedVerses: [
      { surah: 24, ayah: 31, label: 'وتوبوا إلى الله جميعا أيه المؤمنون لعلكم تفلحون' },
      { surah: 4, ayah: 17, label: 'إنما التوبة على الله للذين يعملون السوء بجهالة' },
      { surah: 110, ayah: 3, label: 'واستغفره إنه كان توابا' }
    ]
  },
  {
    root: 'وكل',
    description: 'تفويض الأمر والاعتماد والثقة بالله مع الأخذ بالأسباب المشروعة.',
    primaryDerivatives: ['توكل', 'يتوكل', 'وكيل', 'متوكلين'],
    occurrenceCountApprox: 70,
    suggestedVerses: [
      { surah: 65, ayah: 3, label: 'ومن يتوكل على الله فهو حسبه' },
      { surah: 3, ayah: 159, label: 'فإذا عزمت فتوكل على الله إن الله يحب المتوكلين' },
      { surah: 3, ayah: 173, label: 'وقالوا حسبنا الله ونعم الوكيل' }
    ]
  },
  {
    root: 'ظلم',
    description: 'وضع الشيء في غير موضعه المخصوص إما بنقصان أو بزيادة، وهو مجاوزة الحد والجور.',
    primaryDerivatives: ['ظلم', 'ظالم', 'ظالمين', 'مظلوم', 'ظلمات', 'أظلم'],
    occurrenceCountApprox: 315,
    suggestedVerses: [
      { surah: 31, ayah: 13, label: 'إن الشرك لظلم عظيم' },
      { surah: 18, ayah: 49, label: 'ولا يظلم ربك أحدا' },
      { surah: 2, ayah: 257, label: 'يخرجهم من الظلمات إلى النور' }
    ]
  },
  {
    root: 'كفر',
    description: 'الستر والتغطية، ومنه كفر النعمة وجحود وحدانية الله والرسالات.',
    primaryDerivatives: ['كفر', 'كافر', 'كفار', 'كفور', 'كفران', 'كفّر'],
    occurrenceCountApprox: 525,
    suggestedVerses: [
      { surah: 2, ayah: 6, label: 'إن الذين كفروا سواء عليهم' },
      { surah: 2, ayah: 256, label: 'فمن يكفر بالطاغوت ويؤمن بالله' }
    ]
  },
  {
    root: 'نفق',
    description: 'بذل المال في وجوه الخير والبر ابتغاء مرضاة الله، ومنه النفاق وهو إبطان الكفر وإظهار الإسلام.',
    primaryDerivatives: ['أنفق', 'ينفق', 'إنفاق', 'نفقة', 'منافقين', 'نفاق'],
    occurrenceCountApprox: 111,
    suggestedVerses: [
      { surah: 2, ayah: 261, label: 'مثل الذين ينفقون أموالهم في سبيل الله كمثل حبة' },
      { surah: 3, ayah: 92, label: 'لن تنالوا البر حتى تنفقوا مما تحبون' }
    ]
  },
  {
    root: 'حيي',
    description: 'الحياة ضد الموت، والحياء وهو انقباض النفس عن القبيح.',
    primaryDerivatives: ['حي', 'أحياء', 'يحيي', 'أحيا', 'حياة', 'استحيا'],
    occurrenceCountApprox: 184,
    suggestedVerses: [
      { surah: 2, ayah: 255, label: 'الله لا إله إلا هو الحي القيوم' },
      { surah: 16, ayah: 97, label: 'من عمل صالحا من ذكر أو أنثى وهو مؤمن فلنحيينه حياة طيبة' }
    ]
  },
  {
    root: 'موت',
    description: 'مفارقة الروح للجسد وانقطاع القوة الحسية والحركية في الدنيا.',
    primaryDerivatives: ['موت', 'ميت', 'أموات', 'يميت', 'ممات'],
    occurrenceCountApprox: 165,
    suggestedVerses: [
      { surah: 3, ayah: 185, label: 'كل نفس ذائقة الموت' },
      { surah: 67, ayah: 2, label: 'الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا' }
    ]
  },
  {
    root: 'قـول',
    description: 'النطق بالكلام والتعبير عن المعاني بالألفاظ.',
    primaryDerivatives: ['قال', 'يقول', 'قول', 'أقوال', 'قيل'],
    occurrenceCountApprox: 1722,
    suggestedVerses: [
      { surah: 2, ayah: 83, label: 'وقولوا للناس حسنا' },
      { surah: 17, ayah: 53, label: 'وقل لعبادي يقولوا التي هي أحسن' }
    ]
  },
  {
    root: 'حقـق',
    description: 'الثبوت والوجوب واليقين والعدل، والحق نقيض الباطل، ومن أسماء الله الحسنى: الحق.',
    primaryDerivatives: ['حق', 'أحق', 'حقيق', 'يحق', 'حقائق'],
    occurrenceCountApprox: 287,
    suggestedVerses: [
      { surah: 22, ayah: 6, label: 'ذلك بأن الله هو الحق وأنه يحيي الموتى' },
      { surah: 17, ayah: 81, label: 'وقل جاء الحق وزهق الباطل' }
    ]
  },
  {
    root: 'حسن',
    description: 'كل مبهج مرغوب فيه شرعاً وعقلاً وطبعاً، والإحسان فعل ما هو جميل وأفضل ما ينبغي.',
    primaryDerivatives: ['حسن', 'أحسن', 'إحسان', 'محسنين', 'حسنة', 'حسنى'],
    occurrenceCountApprox: 194,
    suggestedVerses: [
      { surah: 2, ayah: 195, label: 'وأحسنوا إن الله يحب المحسنين' },
      { surah: 55, ayah: 60, label: 'هل جزاء الإحسان إلا الإحسان' },
      { surah: 7, ayah: 180, label: 'ولله الأسماء الحسنى فادعوه بها' }
    ]
  },
  {
    root: 'خشع',
    description: 'الخضوع والسكينة والرقة وسكون الجوارح رهبة من الله وتعظيماً له.',
    primaryDerivatives: ['خشع', 'خاشع', 'خشوع', 'يخشع', 'خاشعين'],
    occurrenceCountApprox: 17,
    suggestedVerses: [
      { surah: 23, ayah: 2, label: 'الذين هم في صلاتهم خاشعون' },
      { surah: 57, ayah: 16, label: 'ألم يأن للذين آمنوا أن تخشع قلوبهم لذكر الله' }
    ]
  },
  {
    root: 'قلب',
    description: 'تحويل الشيء ظهراً لبطن، والقلب سُمِّي به لسرعة تقلبه ومحله مشاعر الإنسان وبصيرته.',
    primaryDerivatives: ['قلب', 'قلوب', 'ينقلب', 'تقلب', 'منقلب'],
    occurrenceCountApprox: 168,
    suggestedVerses: [
      { surah: 26, ayah: 89, label: 'إلا من أتى الله بقلب سليم' },
      { surah: 13, ayah: 28, label: 'ألا بذكر الله تطمئن القلوب' }
    ]
  }
];

/**
 * Fast Root Lookup
 */
export function getRootEntry(root: string): RootDictionaryEntry | undefined {
  const norm = root.replace(/\s+/g, '').trim();
  return QURAN_ROOTS_DICTIONARY.find(r => r.root === norm);
}

/**
 * Filter roots based on query
 */
export function searchRoots(query: string): RootDictionaryEntry[] {
  const q = query.trim();
  if (!q) return QURAN_ROOTS_DICTIONARY.slice(0, 24);

  return QURAN_ROOTS_DICTIONARY.filter(r =>
    r.root.includes(q) ||
    r.description.includes(q) ||
    r.primaryDerivatives.some(d => d.includes(q))
  );
}
