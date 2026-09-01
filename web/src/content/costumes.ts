import type { MediaSlug } from './media.generated';

export type Costume = { id: string; cat: string; title: string; media: MediaSlug };

export const COSTUMES: Costume[] = [
  { id: 'cs-1', cat: 'Black & Gold', title: 'Пайетки и золотой узор', media: 'black-gold' },
  { id: 'cs-2', cat: 'Gold Line', title: 'Золотой шёлк и цепи', media: 'gold-silk' },
  { id: 'cs-3', cat: 'Фолк', title: 'Хохлома и кокошники', media: 'khokhloma' },
  { id: 'cs-4', cat: 'Новый год', title: 'Красный корсет и белый мех', media: 'new-year' },
  { id: 'cs-5', cat: 'Ретро', title: 'Мех и синий атлас', media: 'retro' },
  { id: 'cs-6', cat: 'Crystal', title: 'Кристаллы, перья и короны', media: 'crystal' },
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
