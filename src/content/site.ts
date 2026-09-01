import type { MediaSlug } from './media.generated';

export const SITE = {
  name: 'PLASTIC SHOW',
  legalName: 'Plastic Show',
  tagline: 'Танцевальная инициатива икон стиля',
  description:
    'Продакшн танцевальных шоу премиум-класса. Идея → хореография → костюмы → сцена. Москва и весь мир.',
  url: 'https://plasticshow.ru',
  locale: 'ru_RU',
  founded: '2015-02-03',
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
  name: string;
  role: string;
  since?: string;
  media?: MediaSlug;
};

export const TEAM: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Анастасия Бондарева',
    role: 'Режиссёр и хореограф-постановщик · EFREMCHA ART GROUP',
  },
  { id: 'team-2', name: 'Егор Бондарев', role: 'Хореограф-постановщик' },
  { id: 'team-3', name: 'Наталья Бражкина', role: 'Основной артист', since: '2021' },
  { id: 'team-4', name: 'Юлия Усольцева', role: 'Основной артист', since: '2020' },
  { id: 'team-5', name: 'Анна Холодова', role: 'Основной артист', since: '2016' },
  { id: 'team-6', name: 'Владислава Басенкова', role: 'Основной артист', since: '2020' },
  { id: 'team-7', name: 'Анастасия Житник', role: 'Основной артист', since: '2025' },
  { id: 'team-8', name: 'Юлия Лепешкина', role: 'Основной артист', since: '2024' },
];
