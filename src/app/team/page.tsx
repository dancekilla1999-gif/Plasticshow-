import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/layout/Section';
import { Media } from '@/components/ui/Media';
import { CTABand } from '@/components/ui/CTABand';
import { TEAM } from '@/content/site';

export const metadata: Metadata = {
  title: 'Артисты',
  description:
    'Команда Plastic Show: режиссёры-постановщики и основной состав артистов проекта с 2016 по 2025 год.',
  alternates: { canonical: '/team' },
};

const DIRECTORS = TEAM.slice(0, 2);
const ARTISTS = TEAM.slice(2);

export default function TeamPage() {
  return (
    <>
      <PageHero
        kicker={`Команда · ${TEAM.length} человек`}
        title="Люди, которые делают магию"
        lead="Постановщики и основной состав. Часть артисток работает в проекте с 2016 года — это и есть причина, по которой синхрон читается как один силуэт."
        media="white-ball"
      />

      <Section kicker="Постановка" title="Режиссура и хореография">
        <div className="grid gap-px bg-bone/10 md:grid-cols-2" data-reveal-group>
          {DIRECTORS.map((member) => (
            <article key={member.id} className="bg-void p-8 sm:p-12" data-reveal>
              <span aria-hidden className="font-mono text-[11px] tracking-[0.2em] text-ember">
                ✦
              </span>
              <h2 className="display mt-7 text-[clamp(1.3rem,3vw,2.2rem)]">{member.name}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">{member.role}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        kicker="Основной состав"
        title={<>Артисты <span className="text-scarlet">проекта</span></>}
        lead="Год рядом с именем — год прихода артистки в основной состав."
      >
        <ul className="grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
          {ARTISTS.map((member) => (
            <li
              key={member.id}
              className="group relative overflow-hidden bg-void p-7 transition-colors duration-500 hover:bg-graphite sm:p-9"
              data-reveal
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="display text-base sm:text-lg">{member.name}</h3>
                {member.since && (
                  <span className="shrink-0 font-mono text-[11px] tracking-[0.16em] text-ember">
                    {member.since}
                  </span>
                )}
              </div>
              <p className="mt-3.5 text-sm text-ash">{member.role}</p>
              {/* Underline sweeps in on hover — the only motion this list needs. */}
              <span
                aria-hidden
                className="absolute inset-x-7 bottom-6 h-px origin-left scale-x-0 bg-scarlet transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 sm:inset-x-9"
              />
            </li>
          ))}
        </ul>

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ash" data-reveal>
          Персональные портреты артисток будут добавлены после фотосессии.
        </p>
      </Section>

      <section className="px-[var(--gutter)] pb-[clamp(4rem,10vw,8rem)]">
        <div className="grid gap-3 sm:grid-cols-3" data-reveal-group>
          {[
            { slug: 'fans-stage' as const, title: 'Площадки', text: 'Большие сцены и банкетные залы' },
            { slug: 'retro' as const, title: 'Образы', text: 'Каждое шоу — свой мир' },
            { slug: 'matrix-stage' as const, title: 'Сцена', text: 'Свет, дым, хореография' },
          ].map((item) => (
            <figure key={item.slug} className="relative aspect-[4/5] overflow-hidden" data-reveal>
              <Media
                slug={item.slug}
                alt={item.text}
                sizes="(max-width: 640px) 100vw, 33vw"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/85 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <p className="kicker mb-2">{item.title}</p>
                <p className="display text-sm sm:text-base">{item.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <CTABand
        kicker="Состав"
        title={<>Соберём состав <span className="text-scarlet">под задачу</span></>}
        text="Базовый состав программы — 4 артистки. Расширяем до 6 и больше под масштаб площадки."
        secondary={{ href: '/pricing', label: 'Цены и составы' }}
        media="carnival-hero"
      />
    </>
  );
}
