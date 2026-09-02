import type { MediaSlug } from './media.generated';

export const SITE = {
  name: 'PLASTIC SHOW',
  legalName: 'Plastic Show',
  tagline: 'Танцевальная инициатива икон стиля',
  description:
    'Продакшн танцевальных шоу премиум-класса. Идея → хореография → костюмы → сцена. Москва и весь мир.',
  url: 'https://plasticshow.pro',
  locale: 'ru_RU',
  founded: '2015-02-03',
  /**
   * Дата публикации превью на сайте — её требует schema.org/VideoObject.
   * Даты самих съёмок в архиве не указаны, поэтому здесь именно публикация.
   */
  videoUploadDate: '2026-09-01',
  /** Home bases — each has its own price list. */
  cities: ['Москва', 'Екатеринбург'],
  city: 'Москва',
};

export const CONTACTS = {
  whatsapp: '79667056675',
  whatsappDisplay: '+7 966 705-66-75',
  telegram: 'efremcha',
  instagram: 'efremcha',
  email: 'efremcha.n@yandex.ru',
  address: 'Москва · студия Plastic Show · выезд в любую точку мира',
};

export const NAV = [
  { href: '/', label: 'Главная', index: '01' },
  { href: '/about', label: 'О нас', index: '02' },
  { href: '/shows', label: 'Репертуар', index: '03' },
  { href: '/services', label: 'Услуги', index: '04' },
  { href: '/costumes', label: 'Костюмы', index: '05' },
  { href: '/gallery', label: 'Галерея', index: '06' },
  { href: '/video', label: 'Шоурил', index: '07' },
  { href: '/team', label: 'Артисты', index: '08' },
  { href: '/pricing', label: 'Цены', index: '09' },
  { href: '/contact', label: 'Контакты', index: '10' },
];

/** Event formats the company works with — used in the hero marquee. */
export const EVENT_FORMATS = [
  'Корпоративы',
  'Свадьбы',
  'Фестивали',
  'Концерты',
  'Частные вечеринки',
  'ТВ-съёмки',
  'Брендовые запуски',
  'Гала-ужины',
];

/** Formats the company sells, straight from the 2026 commercial offer. */
export const OFFER_LINE = ['SHOW', 'WELCOME', 'GO-GO'];
export const OFFER_VALUES = ['Стиль', 'Энергия', 'Сцена'];

export const MANIFESTO = [
  {
    mark: '01',
    title: 'Визуальный язык',
    text: 'Часто используем интонационные хореографические решения и оригинальные костюмы, что делает наши выступления визуально привлекательными.',
  },
  {
    mark: '02',
    title: 'Разноплановая аудитория',
    text: 'Выступаем на концертах, корпоративах, фестивалях и крупных ивентах, добавляя к ним уникальную атмосферу.',
  },
  {
    mark: '03',
    title: 'Шоу за два дня',
    text: 'Фишка проекта: создание шоу с нуля за два дня — с залом и стилизацией образа. Подбор образов под ваши разноплановые концепции.',
  },
  {
    mark: '04',
    title: 'Иммерсивное театральное шоу',
    text: 'Постановочный процесс под любую концепцию мероприятия — не готовый номер на чужой праздник, а спектакль, собранный вокруг вашего события.',
  },
];

export const GEOGRAPHY = {
  russia: [
    'Москва',
    'Крым',
    'Екатеринбург',
    'Челябинск',
    'Новый Уренгой',
    'Сочи',
    'Подмосковье',
  ],
  countries: ['Казахстан', 'Китай', 'Турция', 'Армения'],
};

/** Verified credits, taken from the studio's own materials. */
export const CREDITS = [
  { year: '2020', title: 'Премия Призвания «Артист»', note: 'Обладатели премии' },
  { year: '2023 · 2024', title: 'Артисты Блоггеры России', note: 'Москва' },
  { year: '—', title: 'ТВ-канал НТВ', note: 'Работа с ведущей Валерией Кудрявцевой' },
  { year: '—', title: 'Кинопоиск', note: 'Съёмки сериала «Седьмой игрок»' },
  {
    year: '—',
    title: 'Всемирный фестиваль молодёжи',
    note: 'Представители Сбербанка · Сочи',
  },
];

export const COLLABORATIONS = [
  'Валя Карнавал',
  'Егор Шип',
  'Сосо Павлиашвили',
  'Авраам Руссо',
  'LIZWI',
  'Джиган',
  'Бьянка',
  'Артем Кид',
  'Катя Голышева',
  'Ваша Маруся',
  'Хабиб',
  'Янгер',
  'Зара',
  'Распутина',
  'Рыбины',
];

export const VENUES = {
  moscow: ['BLA BLA BAR', 'Monkey', 'Memo', 'Kaifuso', 'Сплетни Анны Асти', 'Yuma', 'Nomo', 'Soul'],
  crimea: ['Ресторан Ливадия', 'Чайка на Пляже', 'Гастродвор', 'Kiki beach club', 'Ptizza'],
};

export type TeamMember = {
  id: string;
  /** Display name. Troupe members are listed by the first name the studio's
   *  own archive uses; only the two directors have confirmed full names. */
  name: string;
  role: string;
  /** Media slug prefix — portraits live as `<slug>-1`, `<slug>-2`, … */
  slug: string;
  photos: number;
};

/** Directors. Credits come from their own CVs; personal contact details and
 *  dates of birth in those documents are deliberately left off the site. */
export const DIRECTORS = [
  {
    id: 'anastasia',
    name: 'Анастасия Бондарева',
    role: 'Режиссёр-постановщик · художественный руководитель PLASTICSHOW',
    slug: 'artist-anastasiya',
    photos: 5,
    education: 'Уральский государственный педагогический университет, хореографическое искусство, 2012–2016',
    credits: [
      'Премия «Призвание — артист», 2020 — шоу-балет PLASTICSHOW',
      'Всемирный фестиваль молодёжи, Сочи 2024 — артист и хореограф, представители Сбербанка',
      'Финал Кубка России по футболу, Лужники 2024 — работа с Shaman',
      'День города Москвы и Московский урбанистический форум, 2023 — Олег Газманов, ST, Полина Гагарина',
      'Блогеры России, Москва 2023–2024 — Хабиб, Янгер, Ваша Маруся, Артём Кид',
      'Фестиваль «Верный отличник», 2023 — Валя Карнавал, Егор Шип',
      'Чайка на пляже, Ялта 2022 — Анна Боронина, Сосо Павлиашвили, DJ Smash',
      'TVC Show, Ханчжоу и Car Show, Шанхай, Китай — артист, 2019',
      'EXPO — работа с певицей Ingrid',
    ],
    venues:
      'Хореограф премиальных площадок: Bla Bla Bar (Екатеринбург, Москва), Monkey, MEMO, Сплетни Анны Асти, Nomo, Kaifuso, Чайка на пляже и ресторан Ливадия в Крыму.',
  },
  {
    id: 'egor',
    name: 'Егор Бондарев',
    role: 'Хореограф-постановщик',
    slug: 'artist-egor',
    photos: 4,
    education: 'Победитель дальневосточных чемпионатов по брейк-дансу; Dance Awards 2014 — лучший танцор Владивостока',
    credits: [
      'Хореограф-постановщик детского «Евровидения», 2019',
      'Хореограф продюсерского центра Григория Лепса',
      'Хореограф-постановщик Всемирного фестиваля молодёжи',
      'День города Москвы, 2023 — Лужники',
      'Открытие финала чемпионата по регби — ВТБ Арена',
      'Легенды Тавриды, 2023',
      'Хореограф и артист у Бьянки, 2018–2021',
      'Подтанцовка: ASAP Rocky, Wiz Khalifa, Lil Jon, Баста, Егор Крид, Элджей, Федук, Григорий Лепс, Ирина Дубцова',
      'Преподаватель студии танца MDC Energy',
    ],
    venues: '',
  },
];

/** Troupe, as listed in the studio's own archive. */
export const TEAM: TeamMember[] = [
  { id: 'anna', name: 'Анна', role: 'Артистка', slug: 'artist-anna', photos: 8 },
  { id: 'yuliya', name: 'Юлия', role: 'Артистка', slug: 'artist-yuliya', photos: 6 },
  { id: 'vlada', name: 'Влада', role: 'Артистка', slug: 'artist-vlada', photos: 5 },
  { id: 'arina', name: 'Арина', role: 'Артистка', slug: 'artist-arina', photos: 4 },
  { id: 'dzhuliya', name: 'Джулия', role: 'Артистка', slug: 'artist-dzhuliya', photos: 4 },
  { id: 'nastya-aziya', name: 'Настя', role: 'Артистка', slug: 'artist-nastya-aziya', photos: 4 },
  { id: 'natali', name: 'Натали', role: 'Артистка', slug: 'artist-natali', photos: 4 },
  { id: 'sofiya', name: 'София', role: 'Артистка', slug: 'artist-sofiya', photos: 3 },
];

/** Technical and hospitality rider, from the studio's own document. */
export const RIDER = [
  {
    index: '01',
    title: 'Гримёрная',
    text: 'Отдельное гримёрное помещение с рейлами, зеркалом и местами отдыха.',
  },
  {
    index: '02',
    title: 'Питание',
    text: 'Менее двух часов на площадке — сэндвичи, закуски, вода обязательна. Более двух часов — горячее блюдо на каждого артиста. В праздничные дни — бутылка шампанского и горячее.',
  },
  {
    index: '03',
    title: 'Площадка',
    text: 'Площадка, позволяющая исполнить выбранные номера, — по размеру в зависимости от количества артистов.',
  },
  {
    index: '04',
    title: 'Логистика',
    text: 'Если на площадке лестницы и нет лифта — нужна помощь координаторов с костюмами.',
  },
  {
    index: '05',
    title: 'Репетиции',
    text: 'Ранний чек-ин на репетицию оплачивается отдельно.',
  },
];
