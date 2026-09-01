import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/layout/Section';
import { Media } from '@/components/ui/Media';
import { CTABand } from '@/components/ui/CTABand';
import { DIRECTORS, TEAM } from '@/content/site';
import type { MediaSlug } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Артисты',
  description:
    'Команда Plastic Show: режиссёр-постановщик Анастасия Бондарева, хореограф-постановщик Егор Бондарев и основной состав артисток проекта.',
  alternates: { canonical: '/team' },
};

export default function TeamPage() {
  return (
    <>
      <PageHero
        kicker={`Команда · ${DIRECTORS.length + TEAM.length} человек`}
        title="Люди, которые делают магию"
        lead="Постановщики и основной состав. Регалии ниже — из личных портфолио хореографов."
        media="artist-anastasiya-1"
      />

      {/* Directors — each gets a full card with credits. */}
      <Section kicker="Постановка" title="Режиссура и хореография">
        <div className="space-y-px bg-bone/10">
          {DIRECTORS.map((person, i) => (
            <article
              key={person.id}
              className="grid gap-[clamp(2rem,5vw,4rem)] bg-void py-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-[0.7fr_1.3fr]"
              data-reveal
            >
              <figure
                className={`relative aspect-[3/4] overflow-hidden ${i % 2 ? 'lg:order-last' : ''}`}
              >
                <Media
                  slug={`${person.slug}-1` as MediaSlug}
                  alt={person.name}
                  sizes="(max-width: 1024px) 100vw, 32vw"
                  className="h-full w-full object-cover"
                />
              </figure>

              <div className="flex flex-col justify-center">
                <p className="kicker mb-5">{person.role}</p>
                <h2 className="display text-[clamp(1.5rem,4vw,3rem)]">{person.name}</h2>
                <p className="mt-6 max-w-xl text-sm leading-relaxed text-ash">{person.education}</p>

                <ul className="mt-9 space-y-3">
                  {person.credits.map((credit) => (
                    <li key={credit} className="flex gap-4 text-sm leading-relaxed text-bone/80">
                      <span aria-hidden className="mt-2.5 h-px w-5 shrink-0 bg-scarlet" />
                      {credit}
                    </li>
                  ))}
                </ul>

                {person.venues && (
                  <p className="mt-8 max-w-xl border-l-2 border-bone/15 pl-6 text-sm leading-relaxed text-ash">
                    {person.venues}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Troupe */}
      <Section
        kicker="Основной состав"
        title={<>Артистки <span className="text-scarlet">проекта</span></>}
        lead="Портреты из архива проекта."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
          {TEAM.map((member) => (
            <li key={member.id} data-reveal>
              <figure className="group relative aspect-[3/4] overflow-hidden bg-graphite">
                <Media
                  slug={`${member.slug}-1` as MediaSlug}
                  alt={member.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5">
                  <span className="display block text-base">{member.name}</span>
                  <span className="kicker mt-1.5 block">{member.role}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ash" data-reveal>
          Состав программы — 4 артистки, расширяется под масштаб площадки.
        </p>
      </Section>

      <CTABand
        kicker="Состав"
        title={<>Соберём состав <span className="text-scarlet">под задачу</span></>}
        text="Базовый состав программы — 4 артистки. Расширяем до 6 и больше под масштаб площадки."
        secondary={{ href: '/pricing', label: 'Цены и составы' }}
        media="dikie-zemli-4"
      />
    </>
  );
}
