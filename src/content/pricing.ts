/**
 * Price lists, one per city.
 *
 * Moscow and Ekaterinburg run on different rate cards — not a discount on the
 * same sheet, but separate structures (Ekaterinburg has no government-projects
 * tier, groups its go-go outings differently, and prices staging as an add-on
 * rather than a standalone item). So each city is its own set of groups, and
 * each gets its own route: /pricing and /pricing/ekaterinburg.
 *
 * Both sheets are quoted before tax; the +10% note is rendered globally.
 */
export type PriceItem = {
  id: string;
  /** Big number line, e.g. "1 номер". */
  name: string;
  /** Small line under the name. */
  sub: string;
  prefix?: string;
  price: string;
  unit?: string;
  notes: string[];
  cta: string;
  highlight?: string;
};

export type PriceGroup = {
  id: string;
  index: string;
  kicker: string;
  title: string;
  text: string;
  items: PriceItem[];
  footnotes?: { title: string; text: string }[];
};

export type City = {
  slug: string;
  /** Nominative, for headings: «Москва». */
  name: string;
  /** Prepositional, for sentences: «в Москве». */
  locative: string;
  /** Route for this city's price list. */
  href: string;
  /** Page <h1>. Distinct per city so the two lists don't share a heading. */
  heading: string;
  kicker: string;
  lead: string;
  groups: PriceGroup[];
};

export const TAX_NOTE =
  'Все цены — без учёта налога. Налог +10% рассчитывается дополнительно ко всем позициям.';

const MOSCOW_GROUPS: PriceGroup[] = [
  {
    id: 'numbers',
    index: '01',
    kicker: 'Шоу-программы',
    title: 'Номера · состав 4 танцовщицы',
    text: 'Базовый состав программы — 4 артистки. Можно расширить количество номеров или добавить артистов сверх состава.',
    items: [
      { id: 'n1', name: '1 номер', sub: 'Один выход', prefix: 'от', price: '65 000', unit: '₽', notes: ['Состав: 4 танцовщицы', 'Доп. танцор +15 000 ₽'], cta: 'Выбрать' },
      { id: 'n2', name: '2 номера', sub: 'Два выхода', prefix: 'от', price: '80 000', unit: '₽', notes: ['Состав: 4 танцовщицы', 'Доп. танцор +15 000 ₽'], cta: 'Выбрать' },
      { id: 'n3', name: '3 номера', sub: 'Три выхода', prefix: 'от', price: '100 000', unit: '₽', notes: ['Состав: 4 танцовщицы', 'Доп. танцор +15 000 ₽'], cta: 'Выбрать', highlight: 'Часто выбирают' },
      { id: 'n4', name: '4 номера', sub: 'Четыре выхода', prefix: 'от', price: '110 000', unit: '₽', notes: ['Состав: 4 танцовщицы', 'Доп. танцор +15 000 ₽'], cta: 'Выбрать' },
      { id: 'n5', name: '5 номеров', sub: 'Пять выходов', prefix: 'от', price: '130 000', unit: '₽', notes: ['Состав: 4 танцовщицы', 'Доп. танцор +15 000 ₽'], cta: 'Выбрать' },
    ],
    footnotes: [
      { title: 'Скидка на состав из 3 танцоров', text: 'При заказе на 3 танцовщиц вместо 4 — скидка −12 000 ₽ с каждой позиции выше.' },
      { title: 'Ранний вызов на репетицию', text: 'Если чек-ин команды нужен за 5–6 часов до мероприятия — оплачивается дополнительно +20 000 ₽.' },
    ],
  },
  {
    id: 'welcome',
    index: '02',
    kicker: 'Welcome',
    title: 'Велком-перформанс',
    text: 'Соло-артистка встречает гостей на входе или в welcome-зоне.',
    items: [
      { id: 'w1', name: '30 минут', sub: 'Велком · 1 девушка', price: '10 000', unit: '₽', notes: ['Без учёта налога'], cta: 'Забронировать' },
      { id: 'w2', name: '1 час', sub: 'Велком · 1 девушка', price: '15 000', unit: '₽', notes: ['Без учёта налога'], cta: 'Забронировать' },
    ],
  },
  {
    id: 'gogo',
    index: '03',
    kicker: 'Go-Go',
    title: 'Гоу-гоу перформанс',
    text: 'Состав: 2 артистки. Заказ возможен только от 2 выходов, каждый выход — 15 минут.',
    items: [
      { id: 'g3', name: '3 выхода', sub: 'По 15 минут', price: '30 000', unit: '₽', notes: ['Состав: 2 девочки'], cta: 'Заказать' },
      { id: 'g4', name: '4 выхода', sub: 'По 15 минут', price: '40 000', unit: '₽', notes: ['Состав: 2 девочки'], cta: 'Заказать' },
      { id: 'g5', name: '5 выходов', sub: 'По 15 минут', price: '50 000', unit: '₽', notes: ['Состав: 2 девочки'], cta: 'Заказать' },
      { id: 'g6', name: '6 выходов', sub: 'По 15 минут', price: '60 000', unit: '₽', notes: ['Состав: 2 девочки'], cta: 'Заказать' },
    ],
    footnotes: [
      { title: 'Ограничение по формату', text: '8, 9 и 10 выходов — не работаем. Максимальный формат гоу-гоу — 6 выходов по 15 минут.' },
    ],
  },
  {
    id: 'staging',
    index: '04',
    kicker: 'Постановка',
    title: 'Постановка номера',
    text: 'Разработка и постановка отдельного номера — зал для репетиций входит в стоимость.',
    items: [
      { id: 's1', name: 'Постановка', sub: '1 номер', price: '30 000', unit: '₽', notes: ['Зал для репетиций включён'], cta: 'Заказать постановку' },
    ],
  },
  {
    id: 'touring',
    index: '05',
    kicker: 'Выезд',
    title: 'Выездные выступления',
    text: 'Работаем в любой точке — стоимость выезда фиксирована вне зависимости от удалённости, детали обсуждаются лично.',
    items: [
      { id: 't1', name: 'Выезд', sub: 'Любая удалённость', prefix: 'от', price: '100 000', unit: '₽', notes: ['Цена не зависит от расстояния', 'Транспортные расходы — отдельно'], cta: 'Обсудить выезд' },
    ],
  },
  {
    id: 'government',
    index: '06',
    kicker: 'Гос. проекты',
    title: 'Государственные проекты',
    text: 'Работа с государственными и муниципальными мероприятиями в Москве.',
    items: [
      { id: 'gov1', name: 'Гос. проект', sub: 'От 6 человек · Москва', prefix: 'от', price: '150 000', unit: '₽', notes: ['Минимальный состав — 6 артистов', 'Только Москва'], cta: 'Запросить' },
    ],
  },
  {
    id: 'newyear',
    index: '07',
    kicker: 'Декабрь 2026',
    title: 'Новогодний период',
    text: 'В высокий сезон действует отдельное ценообразование — планируйте бронирование заранее.',
    items: [
      { id: 'ny1', name: 'До 18.12', sub: 'Обычные цены', price: 'без наценки', notes: ['Действуют все цены выше'], cta: 'Забронировать дату' },
      { id: 'ny2', name: '18.12 – 30.12', sub: 'Повышенный сезон', price: '×1,5', unit: 'к цене', notes: ['Наценка ко всем позициям выше'], cta: 'Забронировать дату', highlight: 'Высокий спрос' },
      { id: 'ny3', name: 'Новый год', sub: 'Москва · 31.12', price: '150 000–200 000', unit: '₽', notes: ['Цена договорная', 'Раннее бронирование обязательно'], cta: 'Забронировать Новый год' },
    ],
  },
];

const EKATERINBURG_GROUPS: PriceGroup[] = [
  {
    id: 'numbers',
    index: '01',
    kicker: 'Сценические номера',
    title: 'Номера · состав 4 девушки',
    text: 'Основная шоу-программа PLASTICSHOW для событий с яркой сценической драматургией.',
    items: [
      { id: 'e-n1', name: '1 номер', sub: 'Один выход', price: '40 000', unit: '₽', notes: ['Состав: 4 девушки'], cta: 'Выбрать' },
      { id: 'e-n2', name: '2 номера', sub: 'Два выхода', price: '50 000', unit: '₽', notes: ['Состав: 4 девушки'], cta: 'Выбрать' },
      { id: 'e-n3', name: '3 номера', sub: 'Три выхода', price: '60 000', unit: '₽', notes: ['Состав: 4 девушки'], cta: 'Выбрать', highlight: 'Часто выбирают' },
      { id: 'e-n4', name: '4 номера', sub: 'Четыре выхода', price: '70 000', unit: '₽', notes: ['Состав: 4 девушки'], cta: 'Выбрать' },
      { id: 'e-n5', name: '5 номеров', sub: 'Пять выходов', price: '80 000', unit: '₽', notes: ['Состав: 4 девушки'], cta: 'Выбрать' },
    ],
  },
  {
    id: 'special',
    index: '02',
    kicker: 'Special offer',
    title: 'Специальные условия',
    text: 'Гибкие условия состава и специальные постановочные решения для мероприятий в Екатеринбурге.',
    items: [
      { id: 'e-s3', name: 'Состав 3 танцовщицы', sub: 'Вместо базовых четырёх', price: '−5 000', unit: '₽', notes: ['Скидка с каждой позиции выше'], cta: 'Обсудить состав' },
      { id: 'e-sx', name: 'Доп. танцовщица', sub: 'Сверх базового состава', price: '+5 000', unit: '₽', notes: ['К каждой позиции выше'], cta: 'Добавить артиста' },
    ],
  },
  {
    id: 'staging',
    index: '03',
    kicker: 'Иммерсивное театральное шоу',
    title: 'Постановка под концепцию',
    text: 'Постановочный процесс под любую концепцию мероприятия — от идеи до готового номера.',
    items: [
      { id: 'e-st', name: 'Постановка с 0', sub: 'Новый номер под событие', price: '+15 000', unit: '₽', notes: ['К позициям выше'], cta: 'Заказать постановку' },
      { id: 'e-ur', name: 'Срочный проект', sub: 'Постановка с 0 за 2 дня', price: '+25 000', unit: '₽', notes: ['Зал для репетиций', 'Стилизация образа за короткий срок'], cta: 'Обсудить срочный проект', highlight: 'За 2 дня' },
    ],
  },
  {
    id: 'welcome',
    index: '04',
    kicker: 'Welcome',
    title: 'Велком-перформанс',
    text: 'Элегантная встреча гостей: соло-артистка на входе или в welcome-зоне.',
    items: [
      { id: 'e-w1', name: '30 минут', sub: 'Велком · 1 девушка', price: '5 000', unit: '₽', notes: ['Без учёта налога'], cta: 'Забронировать' },
      { id: 'e-w2', name: '1 час', sub: 'Велком · 1 девушка', price: '10 000', unit: '₽', notes: ['Без учёта налога'], cta: 'Забронировать' },
    ],
  },
  {
    id: 'gogo',
    index: '05',
    kicker: 'Go-Go',
    title: 'Гоу-гоу перформанс',
    text: 'Динамичные танцевальные выходы в течение вечера. Состав: 2 девушки.',
    items: [
      { id: 'e-g1', name: '2–4 выхода', sub: 'Состав: 2 девушки', price: '30 000', unit: '₽', notes: ['Без учёта налога'], cta: 'Заказать' },
      { id: 'e-g2', name: '5–6 выходов', sub: 'Состав: 2 девушки', price: '40 000', unit: '₽', notes: ['Без учёта налога'], cta: 'Заказать' },
    ],
    footnotes: [
      { title: 'Формат гоу-гоу', text: 'Стоимость указана для состава из 2 девушек. Налог +10% применяется ко всем указанным позициям.' },
    ],
  },
  {
    id: 'newyear',
    index: '06',
    kicker: 'Высокий сезон',
    title: 'Выезды и новогодний период',
    text: 'Специальные условия бронирования в декабре и на новогоднюю ночь.',
    items: [
      { id: 'e-t1', name: 'Выезды', sub: 'За пределы города', price: 'договорная', notes: ['Трансфер оплачивается отдельно'], cta: 'Обсудить выезд' },
      { id: 'e-ny1', name: '18–30 декабря', sub: 'Повышенный сезон', price: '×1,5', unit: 'к цене', notes: ['Коэффициент к каждой позиции выше'], cta: 'Забронировать дату', highlight: 'Высокий спрос' },
      { id: 'e-ny2', name: 'Новый год', sub: 'Екатеринбург · 31.12', price: '100 000–150 000', unit: '₽', notes: ['Цена договорная', 'Раннее бронирование обязательно'], cta: 'Забронировать Новый год' },
    ],
  },
];

export const CITIES: City[] = [
  {
    slug: 'moscow',
    name: 'Москва',
    locative: 'Москве',
    href: '/pricing',
    heading: 'Инвестиция во впечатление',
    kicker: 'Прайс · Москва 2026',
    lead: 'Полный прайс-лист на 2026 год для мероприятий в Москве и выездов по России и миру.',
    groups: MOSCOW_GROUPS,
  },
  {
    slug: 'ekaterinburg',
    name: 'Екатеринбург',
    locative: 'Екатеринбурге',
    href: '/pricing/ekaterinburg',
    // The company's own line from the 2026 offer: «СТИЛЬ • ЭНЕРГИЯ • СЦЕНА».
    heading: 'Стиль, энергия, сцена',
    kicker: 'Прайс · Екатеринбург 2026',
    lead: 'Отдельный прайс-лист на 2026 год для мероприятий в Екатеринбурге и Свердловской области.',
    groups: EKATERINBURG_GROUPS,
  },
];

export const getCity = (slug: string) => CITIES.find((c) => c.slug === slug);

/** Kept for anything that still wants the default (Moscow) sheet. */
export const PRICE_GROUPS = MOSCOW_GROUPS;
