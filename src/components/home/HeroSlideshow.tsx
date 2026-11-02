'use client';

import { useEffect, useState } from 'react';
import { getCapabilities } from '@/lib/capabilities';
import { mediaFallback, mediaMeta, mediaSources, type MediaSlug } from '@/lib/media';

type Slide = {
  wide: MediaSlug;
  tall: MediaSlug;
  pos: string;
  alt: string;
};

// The reference deployment's six frames stay intact; Gzhel follows the first one.
const SLIDES: Slide[] = [
  { wide: 'novyy-god-5', tall: 'novyy-god-2', pos: '50% 30%', alt: 'Номер «Новый год» на сцене' },
  { wide: 'gzhel-3', tall: 'gzhel-3', pos: '50% 20%', alt: 'Номер «Гжель» на сцене' },
  { wide: 'gzhel-7', tall: 'gzhel-7', pos: '50% 20%', alt: 'Номер «Гжель»: бело-синие костюмы' },
  { wide: 'kombinatsiya-1', tall: 'kombinatsiya-8', pos: '50% 45%', alt: 'Номер «Комбинация»: шубы, ёлка, ретро-квартира' },
  { wide: 'novyy-god-8', tall: 'novyy-god-1', pos: '50% 30%', alt: 'Артистки в красных корсетах и белых варежках' },
  { wide: 'snezhnye-korolevy-1', tall: 'snezhnye-korolevy-2', pos: '50% 28%', alt: 'Номер «Снежные королевы»: короны и кристаллы' },
  { wide: 'novyy-god-7', tall: 'novyy-god-3', pos: '50% 35%', alt: 'Номер «Новый год»: красные корсеты' },
  { wide: 'novyy-god-4', tall: 'snezhnye-korolevy-3', pos: '50% 30%', alt: 'Новогодний номер Plastic Show' },
];

function SlidePicture({ slide, eager }: { slide: Slide; eager: boolean }) {
  const meta = mediaMeta(slide.wide);

  return (
    <picture>
      <source media="(orientation: portrait)" type="image/avif" srcSet={mediaSources(slide.tall, 'avif')} sizes="100vw" />
      <source media="(orientation: portrait)" type="image/webp" srcSet={mediaSources(slide.tall, 'webp')} sizes="100vw" />
      <source type="image/avif" srcSet={mediaSources(slide.wide, 'avif')} sizes="100vw" />
      <source type="image/webp" srcSet={mediaSources(slide.wide, 'webp')} sizes="100vw" />
      <img
        src={mediaFallback(slide.wide)}
        alt={slide.alt}
        width={meta.width}
        height={meta.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        fetchPriority={eager ? 'high' : 'auto'}
        className="h-full w-full object-cover"
        style={{
          objectPosition: slide.pos,
          backgroundImage: `url(${meta.lqip})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </picture>
  );
}

export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const capabilities = getCapabilities();
    const timeout = window.setTimeout(() => setReady(true), 800);
    if (capabilities.reducedMotion) return () => window.clearTimeout(timeout);

    const interval = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % SLIDES.length);
    }, 3000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="absolute inset-0" aria-roledescription="слайдшоу">
      {SLIDES.map((slide, index) => {
        if (index !== 0 && !ready) return null;
        const current = index === active;
        return (
          <div
            key={slide.wide}
            aria-hidden={!current}
            className={`hero-slide absolute inset-0 transition-opacity duration-[1200ms] ease-out ${current ? 'on' : ''}`}
            style={{ opacity: current ? 1 : 0, zIndex: current ? 1 : 0 }}
          >
            <div className="hero-slide-img h-full w-full">
              <SlidePicture slide={slide} eager={index === 0} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
