import { MANIFESTO } from '@/content/site';
import { Media } from '@/components/ui/Media';

/**
 * Editorial split: an oversized statement on the left, a tall portrait on the
 * right, and three numbered principles beneath. The text is the studio's own
 * description of the project, re-set rather than rewritten.
 */
export function Manifesto() {
  return (
    <section className="px-[var(--gutter)] py-[clamp(4.5rem,11vw,9.5rem)]">
      <div className="grid gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="kicker mb-8" data-reveal>
            <span className="mr-3 inline-block h-px w-8 translate-y-[-3px] bg-scarlet align-middle" />
            О проекте
          </p>

          <h2 className="display text-[clamp(1.9rem,5.4vw,4.4rem)]">
            <span className="line-mask"><span>Танцевальная</span></span>
            <span className="line-mask"><span className="text-scarlet">инициатива</span></span>
            <span className="line-mask"><span>икон стиля</span></span>
          </h2>

          <div className="mt-10 max-w-xl space-y-6 text-base leading-relaxed text-ash sm:text-lg">
            <p data-reveal>
              Танцевальный проект <span className="text-bone">PLASTICSHOW</span> сочетает в себе
              элементы современного танца, перформанса, визуального искусства и икон стиля.
            </p>
            <p data-reveal data-reveal-delay="0.06">
              Мы выступаем на концертах, корпоративах, фестивалях и крупных ивентах, добавляя
              к ним уникальную атмосферу — и работаем полным циклом: идея, хореография,
              костюмы, сцена.
            </p>
          </div>
        </div>

        <figure className="relative aspect-[3/4] overflow-hidden lg:aspect-auto lg:h-full" data-reveal="mask">
          <Media
            slug="matrix-profile"
            alt="Артистка Plastic Show в кожаном тренче — номер MATRIX"
            sizes="(max-width: 1024px) 100vw, 35vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void/70 to-transparent" />
        </figure>
      </div>

      <ul className="mt-[clamp(3rem,7vw,6rem)] grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
        {MANIFESTO.map((item) => (
          <li key={item.mark} className="bg-void px-6 py-10 sm:px-8" data-reveal>
            <span className="font-mono text-[11px] tracking-[0.2em] text-ember">{item.mark}</span>
            <h3 className="display mt-6 text-lg sm:text-xl">{item.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-ash">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
