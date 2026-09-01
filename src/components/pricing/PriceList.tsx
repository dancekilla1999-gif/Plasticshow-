import { PageHero } from '@/components/layout/PageHero';
import { PriceNav } from './PriceNav';
import { CitySwitch } from './CitySwitch';
import { ButtonLink } from '@/components/ui/Button';
import { CTABand } from '@/components/ui/CTABand';
import { TAX_NOTE, type City } from '@/content/pricing';
import { RIDER } from '@/content/site';
import { whatsappLink } from '@/lib/whatsapp';
import type { MediaSlug } from '@/lib/media';

/**
 * Column count for a price group.
 *
 * Groups hold anywhere from one to five items, so a fixed grid would leave
 * empty cells. Capping the columns at the item count keeps every row full at
 * every breakpoint.
 */
function gridCols(count: number) {
  if (count <= 1) return 'max-w-sm grid-cols-1';
  if (count === 2) return 'sm:grid-cols-2';
  if (count === 3) return 'sm:grid-cols-2 lg:grid-cols-3';
  if (count === 4) return 'sm:grid-cols-2 lg:grid-cols-4';
  return 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
}

/** Renders one city's complete price list. Shared by /pricing and /pricing/[city]. */
export function PriceList({ city, media }: { city: City; media: MediaSlug }) {
  return (
    <>
      <PageHero
        kicker={city.kicker}
        title={city.heading}
        lead={`${city.lead} ${TAX_NOTE}`}
        media={media}
        aside={<CitySwitch current={city.slug} />}
      />

      {/* The rail is a direct child of the container that wraps every price
          section — a sticky element only stays pinned inside its own parent's
          box, so an intermediate wrapper would unpin it immediately. */}
      <div className="relative">
        <PriceNav groups={city.groups} />

        <div className="divide-y divide-bone/10">
          {city.groups.map((group) => (
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
                className={`grid gap-3 ${gridCols(group.items.length)}`}
                data-reveal-group
              >
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    data-reveal
                    className={`relative flex flex-col justify-between gap-8 border bg-void p-6 transition-colors duration-500 hover:bg-graphite sm:p-7 ${
                      item.highlight ? 'border-scarlet/45' : 'border-bone/12'
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
                        `Здравствуйте! ${city.name}: интересует позиция «${group.title} — ${item.name}» (${item.price}${item.unit ? ` ${item.unit}` : ''}). Расскажите, пожалуйста, о деталях.`,
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
                <ul
                  className={`mt-8 grid gap-3 ${group.footnotes.length > 1 ? 'md:grid-cols-2' : 'max-w-2xl'}`}
                  data-reveal-group
                >
                  {group.footnotes.map((note) => (
                    <li key={note.title} className="border border-bone/12 bg-void p-6" data-reveal>
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

      {/* Rider — the same technical and hospitality conditions for both cities. */}
      <section className="border-t border-bone/10 px-[var(--gutter)] py-[clamp(3rem,7vw,5.5rem)]">
        <header className="mb-10 max-w-3xl">
          <p className="kicker mb-5" data-reveal>Райдер</p>
          <h2 className="display text-[clamp(1.4rem,3.6vw,2.8rem)]" data-reveal>
            Условия на площадке
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ash" data-reveal>
            Технические и бытовые условия для выступления команды.
          </p>
        </header>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
          {RIDER.map((item) => (
            <li key={item.index} className="border border-bone/12 bg-void p-6 sm:p-7" data-reveal>
              <span className="font-mono text-[11px] tracking-[0.2em] text-ember">{item.index}</span>
              <h3 className="display mt-5 text-base">{item.title}</h3>
              <p className="mt-3.5 text-sm leading-relaxed text-ash">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="border-t border-bone/10 px-[var(--gutter)] py-10">
        <p className="max-w-3xl text-sm leading-relaxed text-ash">
          {TAX_NOTE} Финальная смета, точный состав программы и даты обсуждаются индивидуально.
        </p>
        <div className="mt-7">
          <CitySwitch current={city.slug} />
        </div>
      </div>

      <CTABand
        kicker="Смета"
        title={<>Посчитаем <span className="text-scarlet">под ваше событие</span></>}
        text={`Пришлём точную смету с составом, хронометражем и техрайдером для события в ${city.locative}.`}
        primary={{ href: '/contact', label: 'Запросить смету' }}
        secondary={{ href: '/shows', label: 'Репертуар' }}
        media="novyy-god-2"
      />
    </>
  );
}
