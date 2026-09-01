import { PLASTIC_D, P_D, SHOW_D } from './paths';

/**
 * Один набор контуров на документ. Все экземпляры знака ссылаются на эти
 * символы через <use>, поэтому шапка, подвал и hero не дублируют ~4 КБ путей,
 * а цвет и обводка наследуются от ссылающегося элемента.
 */
export function BrandSprite() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute" focusable="false">
      <defs>
        <symbol id="wm-plastic" viewBox="0 0 5453 750">
          <path d={PLASTIC_D} />
        </symbol>
        <symbol id="wm-show" viewBox="0 0 4101 750">
          <path d={SHOW_D} />
        </symbol>
        <symbol id="wm-p" viewBox="0 0 825 750">
          <path d={P_D} />
        </symbol>
      </defs>
    </svg>
  );
}
