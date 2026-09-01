import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { VideoGrid } from '@/components/video/VideoGrid';
import { CTABand } from '@/components/ui/CTABand';
import { SHOW_VIDEOS } from '@/content/videos';
import { plural } from '@/lib/plural';

export const metadata: Metadata = {
  title: 'Видео',
  description:
    'Видео постановок Plastic Show: превью номеров репертуара со сцены — MATRIX, АЗИЯ, ГРЕЦИЯ, БАРОККО, ПОЖАРЫ и другие.',
  alternates: { canonical: '/video' },
};

export default function VideoPage() {
  return (
    <>
      <PageHero
        kicker={`Видео · ${SHOW_VIDEOS.length} ${plural(SHOW_VIDEOS.length, 'номер', 'номера', 'номеров')}`}
        title="Движение в кадре"
        lead="Превью номеров репертуара. Нажмите на кадр — ролик откроется на весь экран. На странице каждой постановки есть тот же ролик и все фотографии."
        media="matritsa-9"
      />

      <section className="px-[var(--gutter)] py-[clamp(3.5rem,8vw,7rem)]">
        <VideoGrid />
      </section>

      <CTABand
        kicker="Материалы"
        title={<>Пришлём <span className="text-scarlet">полные записи</span></>}
        text="На сайте — короткие превью. Полные записи номеров под ваш формат события отправим в мессенджер."
        primary={{ href: '/contact', label: 'Запросить видео' }}
        secondary={{ href: '/gallery', label: 'Галерея' }}
        media="dikie-zemli-4"
      />
    </>
  );
}
