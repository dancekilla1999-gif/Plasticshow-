import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Media } from '@/components/ui/Media';
import { ButtonLink } from '@/components/ui/Button';
import { CTABand } from '@/components/ui/CTABand';
import { SERVICES } from '@/content/services';
import { whatsappLink } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Услуги',
  description:
    'Десять направлений Plastic Show: постановка шоу под ключ, танцевальные выступления, люксовые события, корпоративы, свадьбы, костюмы, режиссура, сценография, эксклюзивные концепции и программы под ключ.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Услуги · 10 направлений"
        title="Полный цикл"
        lead="Одна команда и один стандарт качества. Выберите формат или доверьте нам всё событие целиком."
        media="gretsiya-10"
      />

      <div className="divide-y divide-bone/10 border-t border-bone/10">
        {SERVICES.map((service, i) => (
          <section
            key={service.slug}
            id={service.slug}
            className="scroll-mt-[var(--header-h)] px-[var(--gutter)] py-[clamp(3rem,7vw,6rem)]"
          >
            <div
              className={`grid items-center gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-2 ${
                // Alternating sides keep a ten-item list from reading as a table.
                i % 2 ? 'lg:[&>figure]:order-first' : ''
              }`}
            >
              <div>
                <p className="kicker mb-6" data-reveal>
                  {service.index} · {service.kicker}
                </p>
                <h2 className="display text-[clamp(1.5rem,4vw,3.1rem)]" data-reveal>
                  {service.title}
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-ash" data-reveal>
                  {service.text}
                </p>

                <ul className="mt-9 space-y-3.5" data-reveal-group>
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-4 text-sm text-bone/80" data-reveal>
                      <span aria-hidden className="mt-2 h-px w-5 shrink-0 bg-scarlet" />
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="mt-10" data-reveal>
                  <ButtonLink
                    href={whatsappLink(
                      `Здравствуйте! Интересует услуга «${service.title}». Расскажите, пожалуйста, подробнее.`,
                    )}
                    variant="outline"
                  >
                    {service.cta} <span aria-hidden>→</span>
                  </ButtonLink>
                </div>
              </div>

              <figure className="relative aspect-[4/3] overflow-hidden lg:aspect-[4/5]" data-reveal="mask">
                <Media
                  slug={service.cover}
                  alt={service.title}
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/55 to-transparent" />
                <span
                  aria-hidden
                  className="display absolute bottom-5 right-6 text-[clamp(2.5rem,6vw,5rem)] leading-none text-bone/15"
                >
                  {service.index}
                </span>
              </figure>
            </div>
          </section>
        ))}
      </div>

      <CTABand
        kicker="Одно письмо"
        title={<>Доверьте <span className="text-scarlet">весь вечер</span></>}
        text="Соберём программу, поставим номера, сошьём костюмы и выведем всё на сцену — по одному договору."
        primary={{ href: '/contact', label: 'Обсудить проект' }}
        secondary={{ href: '/pricing', label: 'Цены' }}
        media="atelier-1"
      />
    </>
  );
}
