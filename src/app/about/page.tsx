import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/layout/Section';
import { Media } from '@/components/ui/Media';
import { Marquee } from '@/components/ui/Marquee';
import { CTABand } from '@/components/ui/CTABand';
import {
  GEOGRAPHY, MANIFESTO, VENUES, COLLABORATIONS, CREDITS, SITE, OFFER_LINE, OFFER_VALUES,
} from '@/content/site';
import { CITIES } from '@/content/pricing';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'О проекте',
  description:
    'PLASTIC SHOW — танцевальная инициатива икон стиля. Современный танец, перформанс и визуальное искусство. С 2015 года, Москва и весь мир.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="О проекте · с 3 февраля 2015"
        title="Пластика как язык"
        lead="Танцевальный проект PLASTICSHOW сочетает в себе элементы современного танца, перформанса, визуального искусства и икон стиля."
        media="matritsa-5"
      />

      {/* Pull-quote: the studio's own positioning, set as a statement. */}
      <section className="px-[var(--gutter)] py-[clamp(4.5rem,11vw,9.5rem)]">
        <blockquote className="mx-auto max-w-5xl">
          <p className="display text-[clamp(1.5rem,4.6vw,3.6rem)] leading-[1.06]">
            <span className="line-mask"><span>Мы часто используем</span></span>
            <span className="line-mask"><span className="text-scarlet">интонационные</span></span>
            <span className="line-mask"><span>хореографические решения</span></span>
            <span className="line-mask"><span>и оригинальные костюмы.</span></span>
          </p>
          <footer className="kicker mt-10" data-reveal>Позиционирование проекта</footer>
        </blockquote>
      </section>

      {/* Three principles, in an asymmetric editorial grid. */}
      <section className="px-[var(--gutter)] pb-[clamp(4.5rem,11vw,9.5rem)]">
        <div className="grid gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[0.85fr_1.15fr]">
          <figure className="relative aspect-[3/4] overflow-hidden" data-reveal="mask">
            <Media
              slug="rozy-tsvety-13"
              alt="Номер ЧЁРНАЯ РОЗА — цветочный перформанс Plastic Show"
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="h-full w-full object-cover"
            />
          </figure>

          <ul className="flex flex-col justify-center divide-y divide-bone/10" data-reveal-group>
            {MANIFESTO.map((item) => (
              <li key={item.mark} className="py-9 first:pt-0 last:pb-0" data-reveal>
                <div className="flex items-baseline gap-6">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-ember">
                    {item.mark}
                  </span>
                  <div>
                    <h2 className="display text-[clamp(1.15rem,2.6vw,2rem)]">{item.title}</h2>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-ash sm:text-base">
                      {item.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Marquee
        items={['СОВРЕМЕННЫЙ ТАНЕЦ', 'ПЕРФОРМАНС', 'ВИЗУАЛЬНОЕ ИСКУССТВО', 'ИКОНЫ СТИЛЯ']}
        duration={40}
        className="display border-y border-bone/10 py-7 text-[clamp(1.4rem,4.5vw,3.2rem)] text-bone/15"
      />

      {/* Three formats · three values — the company's own framing from the
          2026 commercial offer. */}
      <Section kicker="Форматы" title={<>Show · Welcome · <span className="text-scarlet">Go-Go</span></>}>
        <div className="grid gap-px bg-bone/10 sm:grid-cols-3" data-reveal-group>
          {OFFER_LINE.map((format, i) => (
            <div key={format} className="bg-void p-8 sm:p-10" data-reveal>
              <p className="display text-[clamp(1.4rem,3.4vw,2.4rem)]">{format}</p>
              <p className="kicker mt-5">{OFFER_VALUES[i]}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Two home bases, each with its own rate card. */}
      <Section
        kicker="Города"
        title={<>Две базы — <span className="text-scarlet">Москва и Екатеринбург</span></>}
        lead="В каждом городе свой прайс-лист и свой состав. Выезды — в любую точку России и мира."
      >
        <div className="grid gap-px bg-bone/10 md:grid-cols-2" data-reveal-group>
          {CITIES.map((city) => (
            <div key={city.slug} className="flex flex-col justify-between gap-9 bg-void p-8 sm:p-10" data-reveal>
              <div>
                <h3 className="display text-[clamp(1.4rem,3.4vw,2.4rem)]">{city.name}</h3>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-ash">{city.lead}</p>
              </div>
              <ButtonLink href={city.href} variant="outline">
                Прайс · {city.name} <span aria-hidden>→</span>
              </ButtonLink>
            </div>
          ))}
        </div>
      </Section>

      {/* Geography */}
      <Section
        kicker="История и география"
        title={<>Одиннадцать лет <span className="text-scarlet">в движении</span></>}
        lead={`Работаем с ${new Date(SITE.founded).getFullYear()} года. Москва и Екатеринбург — базы, выезд в любую точку мира.`}
      >
        <div className="grid gap-px bg-bone/10 md:grid-cols-2" data-reveal-group>
          <div className="bg-void p-8 sm:p-10" data-reveal>
            <p className="kicker mb-7">Россия</p>
            <ul className="flex flex-wrap gap-2.5">
              {GEOGRAPHY.russia.map((city) => (
                <li
                  key={city}
                  className="rounded-full border border-bone/15 px-4 py-2 text-sm text-bone/75"
                >
                  {city}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-void p-8 sm:p-10" data-reveal>
            <p className="kicker mb-7">Страны</p>
            <ul className="flex flex-wrap gap-2.5">
              {GEOGRAPHY.countries.map((country) => (
                <li
                  key={country}
                  className="rounded-full border border-scarlet/30 px-4 py-2 text-sm text-bone/75"
                >
                  {country}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Venues */}
        <div className="mt-px grid gap-px bg-bone/10 md:grid-cols-2" data-reveal-group>
          <div className="bg-void p-8 sm:p-10" data-reveal>
            <p className="kicker mb-7">Площадки Москвы</p>
            <ul className="space-y-2.5">
              {VENUES.moscow.map((venue) => (
                <li key={venue} className="text-sm text-ash">{venue}</li>
              ))}
            </ul>
          </div>
          <div className="bg-void p-8 sm:p-10" data-reveal>
            <p className="kicker mb-7">Площадки Крыма</p>
            <ul className="space-y-2.5">
              {VENUES.crimea.map((venue) => (
                <li key={venue} className="text-sm text-ash">{venue}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Credits */}
      <Section kicker="Признание" title="Премии, ТВ и съёмки">
        <ul className="divide-y divide-bone/10 border-y border-bone/10" data-reveal-group>
          {CREDITS.map((credit) => (
            <li
              key={credit.title}
              data-reveal
              className="flex flex-col gap-2 py-8 transition-colors duration-500 hover:bg-graphite/60 sm:flex-row sm:items-baseline sm:gap-10"
            >
              <span className="w-32 shrink-0 font-mono text-[11px] tracking-[0.2em] text-ember">
                {credit.year}
              </span>
              <span className="flex-1">
                <span className="display block text-base sm:text-xl">{credit.title}</span>
                <span className="mt-2 block text-sm text-ash">{credit.note}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-14" data-reveal>
          <p className="kicker mb-6">Совместные выступления</p>
          <ul className="flex flex-wrap gap-2.5">
            {COLLABORATIONS.map((artist) => (
              <li
                key={artist}
                className="rounded-full border border-bone/15 px-4 py-2 text-sm text-bone/70 transition-colors hover:border-scarlet/50 hover:text-bone"
              >
                {artist}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CTABand
        kicker="Сотрудничество"
        title={<>Расскажите <span className="text-scarlet">о событии</span></>}
        text="Подберём формат, состав и постановку под вашу площадку и аудиторию."
        secondary={{ href: '/shows', label: 'Репертуар' }}
        media="matritsa-9"
      />
    </>
  );
}
