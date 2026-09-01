import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { VideoGrid } from '@/components/video/VideoGrid';
import { CTABand } from '@/components/ui/CTABand';
import { Media } from '@/components/ui/Media';
import { VIDEOS } from '@/content/videos';
import { SHOWS } from '@/content/shows';

export const metadata: Metadata = {
  title: 'Шоурил',
  description:
    'Видео постановок Plastic Show: шоурил, съёмки со сцены и записи номеров репертуара.',
  alternates: { canonical: '/video' },
};

export default function VideoPage() {
  return (
    <>
      <PageHero
        kicker="Шоурил"
        title="Движение в кадре"
        lead={
          VIDEOS.length
            ? 'Записи номеров и общий шоурил. Нажмите на кадр, чтобы открыть плеер.'
            : 'Видеоматериалы готовятся к публикации. Пока — постановки в фотографиях: каждая карточка ведёт на страницу шоу с концепцией, костюмами и составом.'
        }
        media="matrix-stage"
      />

      <section className="px-[var(--gutter)] py-[clamp(3.5rem,8vw,7rem)]">
        {VIDEOS.length > 0 ? (
          <VideoGrid />
        ) : (
          <>
            {/* Awaiting-footage state: still a designed page, not a blank slot.
                Adding entries to src/content/videos.ts swaps this for the player. */}
            <div className="mb-14 border border-bone/12 p-8 sm:p-10" data-reveal>
              <p className="kicker mb-4">Статус раздела</p>
              <p className="max-w-2xl text-base leading-relaxed text-ash">
                Видео появятся здесь автоматически, как только файлы будут добавлены
                в <code className="font-mono text-bone/80">public/video/</code> и описаны
                в <code className="font-mono text-bone/80">src/content/videos.ts</code>.
                Плеер, обложки и разметка уже готовы.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" data-reveal-group>
              {SHOWS.map((show) => (
                <Link
                  key={show.slug}
                  href={`/shows/${show.slug}`}
                  data-cursor="Смотреть"
                  data-reveal
                  className="group relative aspect-video overflow-hidden bg-graphite"
                >
                  <Media
                    slug={show.cover}
                    alt={show.title}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-full w-full object-cover opacity-75 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-5">
                    <span className="kicker block">{show.tagline}</span>
                    <span className="display mt-2 block text-base">{show.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <CTABand
        kicker="Материалы"
        title={<>Пришлём <span className="text-scarlet">записи номеров</span></>}
        text="Напишите нам — отправим актуальные видео постановок под ваш формат события."
        primary={{ href: '/contact', label: 'Запросить видео' }}
        secondary={{ href: '/gallery', label: 'Галерея' }}
        media="carnival-hero"
      />
    </>
  );
}
