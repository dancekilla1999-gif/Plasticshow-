import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { ShowCatalogue } from '@/components/shows/ShowCatalogue';
import { CTABand } from '@/components/ui/CTABand';
import { SHOWS } from '@/content/shows';
import { SITE } from '@/content/site';

export const metadata: Metadata = {
  title: 'Репертуар',
  description:
    'Девять постановок Plastic Show: ЧЁРНАЯ РОЗА, MATRIX, КРИСТАЛЛ, RED VELVET, БЕЛЫЙ БАЛ, ХОХЛОМА, БЕЛЫЙ ЛЕБЕДЬ, НОВОГОДНЕЕ КАБАРЕ, НУАР.',
  alternates: { canonical: '/shows' },
};

const listSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Репертуар Plastic Show',
  itemListElement: SHOWS.map((show, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: show.title,
    url: `${SITE.url}/shows/${show.slug}/`,
  })),
};

export default function ShowsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />

      <PageHero
        kicker={`Репертуар · ${SHOWS.length} постановок`}
        title="Каждое шоу — свой мир"
        lead="Готовые номера, которые адаптируются под вашу площадку, хронометраж и палитру. Откройте постановку, чтобы увидеть концепцию, костюмы и состав."
        media="black-rose"
      />

      <section className="px-[var(--gutter)] pb-[clamp(3.5rem,8vw,7rem)] pt-[clamp(2.5rem,5vw,4rem)]">
        <ShowCatalogue />
      </section>

      <CTABand
        kicker="Подбор программы"
        title={<>Не знаете, <span className="text-scarlet">что выбрать?</span></>}
        text="Опишите событие — соберём программу из номеров репертуара или поставим новый специально под вас."
        primary={{ href: '/contact', label: 'Подобрать программу' }}
        secondary={{ href: '/pricing', label: 'Цены' }}
        media="crystal"
      />
    </>
  );
}
