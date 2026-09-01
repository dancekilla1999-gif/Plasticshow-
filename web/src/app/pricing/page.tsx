import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { PriceNav } from '@/components/pricing/PriceNav';
import { ButtonLink } from '@/components/ui/Button';
import { CTABand } from '@/components/ui/CTABand';
import { PRICE_GROUPS, TAX_NOTE } from '@/content/pricing';
import { whatsappLink } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Цены 2026',
  description:
    'Прайс-лист Plastic Show на 2026 год: шоу-программы от 65 000 ₽, велком-перформанс, гоу-гоу, постановка номера, выезды, гос. проекты и новогодний период.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        kicker="Прайс · Москва 2026"
        title="Инвестиция во впечатление"
        lead={TAX_NOTE}
        media="gold-silk"
      />

      {/* The rail and the sections share one parent — a sticky element only
          stays pinned within its own containing block. */}
      {/* The rail is a direct child of the container that wraps every price
          section — a sticky element only stays pinned inside its own parent's
          box, so an intermediate wrapper would unpin it immediately. */}
      <div className="relative">
        <PriceNav />

        <div className="divide-y divide-bone/10">
        {PRICE_GROUPS.map((group) => (
          <section
            key={group.id}
            id={group.id}
            className="scroll-mt-[calc(var(--header-h)+72px)] px-[var(--gutter)] py-[clamp(3rem,7vw,5.5rem)]"
          >
            <header className="mb-10 max-w-3xl">
              <p className="kicker mb-5" data-reveal>
                {group.index} · {group.kicker}
              </p>
              <h2 className="display text-[clamp(1.4rem,3.6vw,2.8rem)]" data-reveal>
                {group.title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ash" data-reveal>
                {group.text}
              </p>
            </header>

            <ul
              className="grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              data-reveal-group
            >
              {group.items.map((item) => (
                <li
                  key={item.id}
                  data-reveal
                  className={`relative flex flex-col justify-between gap-8 bg-void p-6 transition-colors duration-500 hover:bg-graphite sm:p-7 ${
                    item.highlight ? 'ring-1 ring-inset ring-scarlet/45' : ''
                  }`}
                >
                  {item.highlight && (
                    <span className="absolute -top-px right-5 bg-scarlet px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white">
                      {item.highlight}
                    </span>
                  )}

                  <div>
                    <p className="display text-base sm:text-lg">{item.name}</p>
                    <p className="mt-2 text-sm text-ash">{item.sub}</p>

                    <p className="mt-7 flex flex-wrap items-baseline gap-1.5">
                      {item.prefix && (
                        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
                          {item.prefix}
                        </span>
                      )}
                      <span className="display text-[clamp(1.3rem,2.6vw,1.9rem)] leading-none">
                        {item.price}
                      </span>
                      {item.unit && <span className="text-sm text-ash">{item.unit}</span>}
                    </p>

                    <ul className="mt-6 space-y-2">
                      {[...item.notes, 'Налог +10% отдельно'].map((note) => (
                        <li key={note} className="flex gap-3 text-xs leading-relaxed text-ash">
                          <span aria-hidden className="mt-1.5 h-px w-3 shrink-0 bg-bone/30" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ButtonLink
                    href={whatsappLink(
                      `Здравствуйте! Интересует позиция «${group.title} — ${item.name}» (${item.price}${item.unit ? ` ${item.unit}` : ''}). Расскажите, пожалуйста, о деталях.`,
                    )}
                    variant="outline"
                    magnetic={false}
                    className="w-full justify-center !px-5 !py-3.5"
                  >
                    {item.cta}
                  </ButtonLink>
                </li>
              ))}
            </ul>

            {group.footnotes && (
              <ul className="mt-8 grid gap-px bg-bone/10 md:grid-cols-2" data-reveal-group>
                {group.footnotes.map((note) => (
                  <li key={note.title} className="bg-void p-6" data-reveal>
                    <p className="display text-sm">{note.title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ash">{note.text}</p>
                  </li>
                ))}
              </ul>
            )}
            </section>
          ))}
        </div>
      </div>

      <p className="border-t border-bone/10 px-[var(--gutter)] py-10 text-sm leading-relaxed text-ash">
        {TAX_NOTE} Финальная смета, точный состав программы и даты обсуждаются индивидуально.
      </p>

      <CTABand
        kicker="Смета"
        title={<>Посчитаем <span className="text-scarlet">под ваше событие</span></>}
        text="Пришлём точную смету с составом, хронометражем и техрайдером."
        primary={{ href: '/contact', label: 'Запросить смету' }}
        secondary={{ href: '/shows', label: 'Репертуар' }}
        media="new-year"
      />
    </>
  );
}
