import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { HorizontalReel } from '@/components/gallery/HorizontalReel';
import { Lightbox, type LightboxItem } from '@/components/gallery/Lightbox';
import { CTABand } from '@/components/ui/CTABand';
import { SHOWS } from '@/content/shows';
import { COSTUMES } from '@/content/costumes';
import type { MediaSlug } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Галерея',
  description:
    'Фотографии постановок и костюмов Plastic Show: сцена, свет, образы и backstage — 2015–2026.',
  alternates: { canonical: '/gallery' },
};

// The reel leads with the most cinematic frames; the grid holds everything.
const REEL = SHOWS.map((show) => ({
  slug: show.cover,
  title: show.title,
  caption: `${show.title} — ${show.tagline}`,
}));

const GRID: LightboxItem[] = [
  ...SHOWS.flatMap((show) =>
    show.stills.slice(0, 1).map((slug) => ({
      slug,
      title: show.title,
      caption: `${show.title} — ${show.tagline}`,
    })),
  ),
  ...COSTUMES.map((costume) => ({
    slug: costume.media,
    title: costume.title,
    caption: `${costume.cat} — ${costume.title}`,
  })),
  ...(['matrix-hero', 'fans-stage', 'carnival-hero'] as MediaSlug[]).map((slug) => ({
    slug,
    title: 'Backstage',
    caption: 'Plastic Show — сцена и закулисье',
  })),
]
  // The same photograph can back several shows; show each frame once.
  .filter((item, i, all) => all.findIndex((x) => x.slug === item.slug) === i);

export default function GalleryPage() {
  return (
    <>
      <PageHero
        kicker="Галерея · 2015 → 2026"
        title="Свет, дым, движение"
        lead="Кадры со сцены, из ателье и из-за кулис. Нажмите на любой кадр для полноэкранного просмотра — стрелки и свайп листают дальше."
        media="crystal"
      />

      <section className="py-[clamp(3rem,7vw,6rem)]">
        <p className="kicker mb-8 px-[var(--gutter)]">Лента постановок</p>
        <HorizontalReel frames={REEL} />
      </section>

      <section className="px-[var(--gutter)] py-[clamp(3.5rem,8vw,7rem)]">
        <p className="kicker mb-8">Весь архив · {GRID.length} кадров</p>
        <Lightbox
          items={GRID}
          className="columns-1 gap-3 sm:columns-2 lg:columns-3 [&>*]:mb-3 [&>*]:break-inside-avoid"
          tileClassName="aspect-auto"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </section>

      <CTABand
        kicker="Ваше событие"
        title={<>Следующий кадр — <span className="text-scarlet">ваш</span></>}
        text="Расскажите о площадке и формате: подберём постановку и соберём смету."
        secondary={{ href: '/shows', label: 'Репертуар' }}
        media="white-ball"
      />
    </>
  );
}
