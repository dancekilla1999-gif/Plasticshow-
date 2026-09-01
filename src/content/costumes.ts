import type { MediaSlug } from './media.generated';

export type Costume = { id: string; cat: string; title: string; media: MediaSlug };

export const COSTUMES: Costume[] = [
  { id: 'cs-1', cat: 'Азия', title: 'Шёлк, веера, цветочные уборы', media: 'aziya-3' },
  { id: 'cs-2', cat: 'Гладиаторы', title: 'Золотой орнамент и алые перья', media: 'gladiatory-1' },
  { id: 'cs-3', cat: 'Богини', title: 'Золото и короны-лучи', media: 'bogini-1' },
  { id: 'cs-4', cat: 'Барокко', title: 'Пудреные парики и кружево', media: 'barokko-6' },
  { id: 'cs-5', cat: 'Сильвер', title: 'Кристальные короны', media: 'silver-1' },
  { id: 'cs-6', cat: 'Русь', title: 'Хохлома и кокошники', media: 'rus-1' },
  { id: 'cs-7', cat: 'Цирк', title: 'Перья и полоска', media: 'tsirk-1' },
  { id: 'cs-8', cat: 'Комбинация', title: 'Мех и синий атлас', media: 'kombinatsiya-9' },
  { id: 'cs-9', cat: 'Греция', title: 'Драпировки и золотые пояса', media: 'gretsiya-10' },
  { id: 'cs-10', cat: 'Апалле', title: 'Латекс и рюши из органзы', media: 'apalle-3' },
  { id: 'cs-11', cat: 'Дикие земли', title: 'Перьевые головные уборы', media: 'dikie-zemli-4' },
  { id: 'cs-12', cat: 'Ателье', title: 'Золотой шёлк и цепи', media: 'atelier-1' },
];

export const ATELIER_STEPS = [
  {
    index: '01',
    title: 'Эскиз и концепция',
    text: 'Художник отрисовывает образ под шоу: силуэт, фактуры, палитра, поведение ткани в движении и на свету.',
  },
  {
    index: '02',
    title: 'Материалы',
    text: 'Подбираем ткани и фурнитуру: итальянский шёлк, эко-кожа, кристаллы, зеркальный ПВХ, LED-компоненты.',
  },
  {
    index: '03',
    title: 'Пошив и примерки',
    text: 'Конструирование по индивидуальным меркам, две-три примерки, ручная отделка деталей.',
  },
  {
    index: '04',
    title: 'Сцен-тест',
    text: 'Проверяем костюм в движении и под светом: посадка, прочность, свобода амплитуды.',
  },
];

export const MATERIALS = [
  'Итальянский шёлк',
  'Кристаллы Preciosa',
  'Зеркальный ПВХ',
  'Эко-кожа',
  'Голографические ткани',
  'LED и оптоволокно',
  'Страусиные перья',
  '3D-печать',
  'Латекс',
  'Органза',
];
