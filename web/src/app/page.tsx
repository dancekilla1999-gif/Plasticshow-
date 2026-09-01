import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { Manifesto } from '@/components/home/Manifesto';
import { Stats } from '@/components/home/Stats';
import { Section } from '@/components/layout/Section';
import { ShowTile } from '@/components/ui/ShowTile';
import { Marquee } from '@/components/ui/Marquee';
import { CTABand } from '@/components/ui/CTABand';
import { ButtonLink } from '@/components/ui/Button';
import { Media } from '@/components/ui/Media';
import { FEATURED_SHOWS } from '@/content/shows';
import { SERVICES } from '@/content/services';
import { COLLABORATIONS, CREDITS } from '@/content/site';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />

      {/* Act II — the repertoire, shown as a mosaic rather than a card row. */}
      <Section
        kicker="Избранное"
        title={
          <>
            Сцены, которые <span className="text-scarlet">запоминают</span>
          </>
        }
        lead="Четыре постановки из постоянного репертуара. Каждая существует как самостоятельный мир — со своей палитрой, костюмами и драматургией."
      >
        <div className="grid gap-3 md:grid-cols-2" data-reveal-group>
          {FEATURED_SHOWS.map((show, i) => (
            <div
              key={show.slug}
              data-reveal
              className={show.wide ? 'md:col-span-2' : ''}
            >
              <ShowTile
                show={show}
                eager={i === 0}
                sizes={show.wide ? '(max-width: 768px) 100vw, 92vw' : '(max-width: 768px) 100vw, 46vw'}
                className={show.wide ? 'aspect-[16/10] md:aspect-[21/9]' : 'aspect-[4/5]'}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center" data-reveal>
          <ButtonLink href="/shows" variant="outline">
            Весь репертуар <span aria-hidden>→</span>
          </ButtonLink>
        </div>
      </Section>

      <Marquee
        items={['PLASTIC SHOW', 'МОСКВА', 'ШОУ ПОД КЛЮЧ', 'С 2015 ГОДА', 'ВЫЕЗД ПО МИРУ']}
        duration={44}
        className="display border-y border-bone/10 py-8 text-[clamp(1.6rem,5.5vw,4rem)] text-bone/15"
      />

      {/* Act III — what they actually sell. */}
      <Section
        kicker="Что мы делаем"
        title={
          <>
            Шоу под ключ. <br />
            <span className="text-transparent [-webkit-text-stroke:1px_var(--color-bone)]">
              От идеи до оваций.
            </span>
          </>
        }
        lead="Полный цикл продакшна внутри одной команды — без подрядчиков и компромиссов в качестве."
      >
        <ul className="grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
          {SERVICES.slice(0, 6).map((service) => (
            <li key={service.slug} data-reveal className="bg-void">
              <Link
                href={`/services#${service.slug}`}
                className="group flex h-full flex-col justify-between gap-10 p-7 transition-colors duration-500 hover:bg-graphite sm:p-9"
              >
                <div>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-ember">
                    {service.index}
                  </span>
                  <h3 className="display mt-6 text-lg leading-tight sm:text-xl">{service.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-ash">{service.text}</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50 transition-colors group-hover:text-bone">
                  Подробнее <span aria-hidden className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center" data-reveal>
          <ButtonLink href="/services" variant="outline">
            Все десять направлений <span aria-hidden>→</span>
          </ButtonLink>
        </div>
      </Section>

      <Stats />

      {/* Act IV — proof. Only verified credits, no invented awards. */}
      <Section
        kicker="Признание"
        title={<>Где нас <span className="text-scarlet">видели</span></>}
        lead="Проекты, съёмки и премии, подтверждённые материалами команды."
      >
        <div className="grid gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1fr_0.8fr]">
          <ul className="divide-y divide-bone/10 border-y border-bone/10" data-reveal-group>
            {CREDITS.map((credit) => (
              <li
                key={credit.title}
                data-reveal
                className="group flex flex-col gap-2 py-7 transition-colors duration-500 hover:bg-graphite/60 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span className="w-28 shrink-0 font-mono text-[11px] tracking-[0.2em] text-ember">
                  {credit.year}
                </span>
                <span className="flex-1">
                  <span className="display block text-base sm:text-lg">{credit.title}</span>
                  <span className="mt-1.5 block text-sm text-ash">{credit.note}</span>
                </span>
              </li>
            ))}
          </ul>

          <figure className="relative aspect-[4/5] overflow-hidden" data-reveal="mask">
            <Media
              slug="fans-stage"
              alt="Выступление Plastic Show с веерами на большой сцене"
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-7">
              <p className="kicker mb-2">Сцена</p>
              <p className="display text-lg">Большие сцены и банкетные залы</p>
            </figcaption>
          </figure>
        </div>

        <div className="mt-14" data-reveal>
          <p className="kicker mb-6">Выступали с артистами</p>
          <Marquee
            items={COLLABORATIONS}
            duration={52}
            reverse
            separator="·"
            className="border-y border-bone/10 py-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/45"
          />
        </div>
      </Section>

      <CTABand
        title={
          <>
            Готовы удивить <span className="text-scarlet">своих гостей?</span>
          </>
        }
        text="Расскажите о событии — предложим концепцию шоу, состав и смету под вашу площадку."
        primary={{ href: '/contact', label: 'Получить концепцию' }}
        secondary={{ href: '/pricing', label: 'Смотреть цены' }}
      />
    </>
  );
}
