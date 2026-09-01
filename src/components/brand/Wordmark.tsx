import { CAP, DOT_R, GAP, LINE_H, PLASTIC_W, P_W, SHOW_W } from './paths';

type Common = {
  className?: string;
  /** Подпись для скринридеров; без неё знак декоративный. */
  title?: string;
};

/**
 * Фирменный знак в строку: PLASTIC · SHOW. Точка стоит по центру капители —
 * это подпись бренда, она же в монограмме и favicon. Цвет букв — currentColor,
 * точка — фирменный алый.
 */
export function Wordmark({ className = '', title }: Common) {
  const w = PLASTIC_W + GAP + SHOW_W;
  return (
    <svg
      viewBox={`0 0 ${w} ${CAP}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      {title && <title>{title}</title>}
      <use href="#wm-plastic" width={PLASTIC_W} height={CAP} />
      <circle cx={PLASTIC_W + GAP / 2} cy={CAP / 2} r={DOT_R} fill="var(--color-scarlet)" />
      <use href="#wm-show" x={PLASTIC_W + GAP} width={SHOW_W} height={CAP} />
    </svg>
  );
}

/**
 * Двухстрочная версия: PLASTIC набором, SHOW — хайрлайном, точка замыкает
 * вторую строку. Так знак стоит в подвале и в меню.
 */
export function WordmarkStacked({ className = '', title }: Common) {
  const h = LINE_H + CAP;
  return (
    <svg
      viewBox={`0 0 ${PLASTIC_W} ${h}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      {title && <title>{title}</title>}
      <use href="#wm-plastic" width={PLASTIC_W} height={CAP} />
      <use
        href="#wm-show"
        y={LINE_H}
        width={SHOW_W}
        height={CAP}
        fill="none"
        stroke="currentColor"
        strokeWidth={22}
      />
      <circle cx={SHOW_W + GAP / 2} cy={LINE_H + CAP / 2} r={DOT_R} fill="var(--color-scarlet)" />
    </svg>
  );
}

/**
 * Одно слово знака — для составных композиций, где строки анимируются
 * по отдельности (hero главной). Оба слова получают одинаковую ширину
 * viewBox, чтобы стоять в одном масштабе и по одной левой линии.
 */
export function WordmarkWord({
  word,
  outline = false,
  dot = false,
  className = '',
}: {
  word: 'plastic' | 'show';
  outline?: boolean;
  /** Фирменная точка после слова. */
  dot?: boolean;
  className?: string;
}) {
  const w = word === 'plastic' ? PLASTIC_W : SHOW_W;
  return (
    <svg viewBox={`0 0 ${PLASTIC_W} ${CAP}`} className={className} aria-hidden fill="currentColor">
      <use
        href={`#wm-${word}`}
        width={w}
        height={CAP}
        {...(outline ? { fill: 'none', stroke: 'currentColor', strokeWidth: 12 } : {})}
      />
      {dot && <circle cx={w + GAP / 2} cy={CAP / 2} r={DOT_R} fill="var(--color-scarlet)" />}
    </svg>
  );
}

/** Монограмма «P·» — тот же знак, сведённый к первой букве и подписи. */
export function Monogram({ className = '', title }: Common) {
  const w = P_W + GAP * 0.55 + DOT_R * 2;
  return (
    <svg
      viewBox={`0 0 ${w} ${CAP}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      {title && <title>{title}</title>}
      <use href="#wm-p" width={P_W} height={CAP} />
      <circle cx={P_W + GAP * 0.55 + DOT_R} cy={CAP / 2} r={DOT_R} fill="var(--color-scarlet)" />
    </svg>
  );
}
