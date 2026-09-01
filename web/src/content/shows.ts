import type { MediaSlug } from './media.generated';

/**
 * One repertoire piece. Every show gets its own route at /shows/[slug], so the
 * fields here drive both the catalogue tile and the full show page.
 *
 * `facts` is deliberately open-ended: only the entries the studio has confirmed
 * are listed, and the show page renders whatever is present.
 */
export type Show = {
  slug: string;
  title: string;
  /** Latin/secondary line used in the oversized display typography. */
  latin: string;
  category: ShowCategory;
  /** One-line hook, shown on the catalogue tile. */
  tagline: string;
  /** Editorial lead paragraph on the show page. */
  intro: string;
  /** Longer body, one paragraph per entry. */
  body: string[];
  palette: [string, string];
  cover: MediaSlug;
  /** Extra photographs shown in the show page's own gallery strip. */
  stills: MediaSlug[];
  facts: { label: string; value: string }[];
  costume: string;
  /** Marks the pieces that lead the home page's featured grid. */
  featured?: boolean;
  /** Wider tile in the catalogue mosaic. */
  wide?: boolean;
};

export type ShowCategory = 'show' | 'fashion' | 'folk' | 'classic' | 'ny';

export const SHOW_CATEGORIES: { id: ShowCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'show', label: 'Шоу-программы' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'ny', label: 'Новый год' },
  { id: 'folk', label: 'Фолк' },
  { id: 'classic', label: 'Классика' },
];

export const CATEGORY_LABEL: Record<ShowCategory, string> = {
  show: 'Show Production',
  fashion: 'Fashion',
  folk: 'Фолк',
  classic: 'Классика',
  ny: 'Новый год',
};

export const SHOWS: Show[] = [
  {
    slug: 'black-rose',
    title: 'ЧЁРНАЯ РОЗА',
    latin: 'BLACK ROSE',
    category: 'show',
    tagline: 'Цветочный перформанс',
    intro:
      'Номер, в котором тело раскрывается как бутон: медленное развёртывание, вспышка цвета и резкое закрытие в темноту.',
    body: [
      'ЧЁРНАЯ РОЗА построена на контрасте между жёсткой геометрией фактур и текучей пластикой. Хореография развивается от почти неподвижной статуарной группы к финальному раскрытию, где сцена заполняется движением целиком.',
      'Номер одинаково работает на большой сцене и в банкетном зале: рисунок перестраивается под площадку, а свет и дым остаются частью драматургии, а не украшением.',
    ],
    palette: ['#0a0a0c', '#7c1f2e'],
    cover: 'black-rose',
    stills: ['black-rose', 'noir', 'red-velvet'],
    facts: [
      { label: 'Формат', value: 'Групповой перформанс' },
      { label: 'Базовый состав', value: '4 танцовщицы' },
      { label: 'Расширение', value: 'Доп. артист +15 000 ₽' },
      { label: 'Площадка', value: 'Сцена или банкетный зал' },
    ],
    costume: 'Флористические конструкции ручной работы, объёмные юбки, фактурная отделка.',
    featured: true,
    wide: true,
  },
  {
    slug: 'matrix',
    title: 'MATRIX',
    latin: 'MATRIX',
    category: 'show',
    tagline: 'Кожа, дым, цифровой код',
    intro:
      'Кожаные тренчи, чёрные очки и синхрон, отточенный до одного силуэта — самый узнаваемый номер репертуара.',
    body: [
      'MATRIX строится на унисоне: несколько артисток читаются как одно тело, размноженное в пространстве. Основной приём — резкая смена ритма, когда группа замирает и снова уходит в движение на долю такта раньше, чем зритель этого ждёт.',
      'Номер закрывает задачу эффектного открытия: он работает как визуальный удар в первые тридцать секунд и хорошо синхронизируется с экранным контентом и светом.',
    ],
    palette: ['#07090a', '#1f6f57'],
    cover: 'matrix-stage',
    stills: ['matrix-stage', 'matrix-profile', 'matrix-hero'],
    facts: [
      { label: 'Формат', value: 'Синхронный групповой номер' },
      { label: 'Базовый состав', value: '4 танцовщицы' },
      { label: 'Сильная сторона', value: 'Открытие события' },
      { label: 'Синхронизация', value: 'Со светом и экраном' },
    ],
    costume: 'Кожаные тренчи, чёрные очки, короткие тёмные парики.',
    featured: true,
  },
  {
    slug: 'crystal',
    title: 'КРИСТАЛЛ',
    latin: 'CRYSTAL',
    category: 'show',
    tagline: 'Короны, глиттер и белые сферы',
    intro:
      'Ледяная белизна, кристаллы на коже и крупные светящиеся сферы, которые становятся полноценным партнёром по сцене.',
    body: [
      'КРИСТАЛЛ — самый «объёмный» номер репертуара: сферы задают композицию кадра и позволяют строить многослойные мизансцены даже на небольшой площадке.',
      'Костюмы расшиты кристаллами и работают на отражение — номер рассчитан на контровой свет и тёмную сцену, где каждая грань даёт блик.',
    ],
    palette: ['#0b0b10', '#a9b8d6'],
    cover: 'crystal',
    stills: ['crystal', 'white-ball', 'ballet'],
    facts: [
      { label: 'Формат', value: 'Групповой перформанс с реквизитом' },
      { label: 'Реквизит', value: 'Крупные светящиеся сферы' },
      { label: 'Свет', value: 'Контровой, тёмная сцена' },
      { label: 'Базовый состав', value: '4 танцовщицы' },
    ],
    costume: 'Короны, кристаллы, глиттер, белые корсеты с фактурной вышивкой.',
    featured: true,
  },
  {
    slug: 'red-velvet',
    title: 'RED VELVET',
    latin: 'RED VELVET',
    category: 'fashion',
    tagline: 'Латекс и красные рюши',
    intro:
      'Fashion-выход на грани подиума и перформанса: чёрный латекс, алая органза и подача, рассчитанная на камеру.',
    body: [
      'RED VELVET — номер для презентаций брендов и fashion-событий. Пластика здесь ближе к съёмочной: работа на статичные позы, точные повороты и удержание кадра.',
      'Палитра сознательно ограничена двумя цветами, поэтому номер легко перекрашивается под айдентику заказчика — конструкция костюма остаётся, меняется материал.',
    ],
    palette: ['#0a0708', '#c8102e'],
    cover: 'red-velvet',
    stills: ['red-velvet', 'black-gold', 'gold-silk'],
    facts: [
      { label: 'Формат', value: 'Fashion-перформанс' },
      { label: 'Подача', value: 'Рассчитан на камеру' },
      { label: 'Кастомизация', value: 'Перекрашивается под бренд' },
      { label: 'Базовый состав', value: '4 танцовщицы' },
    ],
    costume: 'Латексные платья, объёмные рюши из органзы, длинные перчатки.',
    featured: true,
    wide: true,
  },
  {
    slug: 'white-ball',
    title: 'БЕЛЫЙ БАЛ',
    latin: 'WHITE BALL',
    category: 'show',
    tagline: 'С живым вокалом',
    intro:
      'Постановка для сцены с живым вокалистом: белые корсеты, веера и сотни световых сфер над площадкой.',
    body: [
      'БЕЛЫЙ БАЛ решён как единая сценография — артистки работают вокруг вокалиста, поддерживая номер, а не соревнуясь с ним.',
      'Формат подходит для гала-ужинов и церемоний, где нужен торжественный, но не музейный тон.',
    ],
    palette: ['#0d0b09', '#e6cfa8'],
    cover: 'white-ball',
    stills: ['white-ball', 'fans-stage', 'crystal'],
    facts: [
      { label: 'Формат', value: 'Шоу с живым вокалом' },
      { label: 'Событие', value: 'Гала-ужины, церемонии' },
      { label: 'Реквизит', value: 'Веера, световые сферы' },
      { label: 'Базовый состав', value: '4 танцовщицы' },
    ],
    costume: 'Белые корсеты, пышные юбки, кружевные веера, светлые парики.',
  },
  {
    slug: 'khokhloma',
    title: 'ХОХЛОМА',
    latin: 'KHOKHLOMA',
    category: 'folk',
    tagline: 'Русский стиль',
    intro: 'Фолк-номер, собранный из узнаваемого орнамента и современной хореографии.',
    body: [
      'ХОХЛОМА работает там, где нужен национальный код без лубка: орнамент, кокошники и красно-золотая палитра поданы через современную пластику.',
      'Номер часто заказывают для международных и государственных событий, где важно показать узнаваемый визуальный образ.',
    ],
    palette: ['#0c0705', '#c9761f'],
    cover: 'khokhloma',
    stills: ['khokhloma', 'gold-silk', 'black-gold'],
    facts: [
      { label: 'Формат', value: 'Фолк-перформанс' },
      { label: 'Событие', value: 'Международные и гос. проекты' },
      { label: 'Базовый состав', value: '4 танцовщицы' },
    ],
    costume: 'Кокошники, хохломской орнамент, красно-золотая палитра.',
  },
  {
    slug: 'white-swan',
    title: 'БЕЛЫЙ ЛЕБЕДЬ',
    latin: 'WHITE SWAN',
    category: 'classic',
    tagline: 'Классический балет',
    intro: 'Классика в чистом виде — пуанты, академическая форма, безупречная линия.',
    body: [
      'БЕЛЫЙ ЛЕБЕДЬ — академический номер для событий, где уместен строгий классический тон.',
      'Может исполняться как отдельный выход или как контрастная вставка внутри большой шоу-программы.',
    ],
    palette: ['#0a0a0d', '#dfe3ea'],
    cover: 'ballet',
    stills: ['ballet', 'white-ball', 'crystal'],
    facts: [
      { label: 'Формат', value: 'Классический балет' },
      { label: 'Использование', value: 'Отдельный выход или вставка' },
    ],
    costume: 'Классические пачки, пуанты, академический грим.',
  },
  {
    slug: 'new-year-cabaret',
    title: 'НОВОГОДНЕЕ КАБАРЕ',
    latin: 'NEW YEAR CABARET',
    category: 'ny',
    tagline: 'Красный корсет и белый мех',
    intro: 'Праздничный номер высокого сезона: красный бархат, белый мех, кабаре-подача.',
    body: [
      'НОВОГОДНЕЕ КАБАРЕ — основной номер декабрьского репертуара. Подача открытая, с прямым контактом с залом.',
      'В высокий сезон (18.12–30.12) на номер действует отдельное ценообразование — бронирование даты стоит планировать заранее.',
    ],
    palette: ['#0b0708', '#b3202f'],
    cover: 'new-year',
    stills: ['new-year', 'red-velvet', 'retro'],
    facts: [
      { label: 'Формат', value: 'Кабаре' },
      { label: 'Сезон', value: 'Декабрь' },
      { label: 'Наценка', value: '×1,5 с 18.12 по 30.12' },
      { label: 'Базовый состав', value: '4 танцовщицы' },
    ],
    costume: 'Красные корсеты, белый мех, головные уборы.',
  },
  {
    slug: 'noir',
    title: 'НУАР',
    latin: 'NOIR',
    category: 'show',
    tagline: 'Театральная драма',
    intro: 'Самый тёмный номер репертуара: густой свет, длинные тени и драматургия без слов.',
    body: [
      'НУАР ближе к театру, чем к танцу: номер строится на паузах, тяжёлом свете и медленном нарастании.',
      'Работает как финал программы или как смысловой центр вечера, где нужна не эффектность, а атмосфера.',
    ],
    palette: ['#08080a', '#6b6f7a'],
    cover: 'noir',
    stills: ['noir', 'black-rose', 'matrix-profile'],
    facts: [
      { label: 'Формат', value: 'Театральный перформанс' },
      { label: 'Роль в программе', value: 'Финал или смысловой центр' },
    ],
    costume: 'Тёмные силуэты, драпировки, минималистичная палитра.',
  },
];

export const getShow = (slug: string) => SHOWS.find((s) => s.slug === slug);
export const FEATURED_SHOWS = SHOWS.filter((s) => s.featured);
