'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Media } from '@/components/ui/Media';
import { SHOW_VIDEOS } from '@/content/videos';
import { CATEGORY_LABEL } from '@/content/shows';
import { getCapabilities } from '@/lib/capabilities';
import { plural } from '@/lib/plural';

/** Enough to fill a wide rail without turning the home page into a playlist. */
const RAIL = SHOW_VIDEOS.filter((v) => v.portrait).slice(0, 8);

/**
 * Horizontal rail of live previews.
 *
 * Exactly one clip plays at a time — whichever card sits closest to the middle
 * of the rail — so the section costs one video, not eight, however wide the
 * screen. That also makes it the one place a phone gets moving footage without
 * a hover: the rail is a native swipe with scroll snapping, not a desktop
 * carousel with arrows bolted on.
 */
export function Showreel() {
  const rail = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const caps = getCapabilities();
    setEnabled(!caps.reducedMotion && !caps.saveData);
  }, []);

  // The card whose centre is nearest the rail's centre wins.
  useEffect(() => {
    const el = rail.current;
    if (!enabled || !el) return;

    let frame = 0;
    const pick = () => {
      frame = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDistance = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const node = child as HTMLElement;
        const distance = Math.abs(node.offsetLeft + node.offsetWidth / 2 - mid);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      setActive(best);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };

    // Only start playing once the rail is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) pick();
        else setActive(null);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      io.disconnect();
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return (
    <section className="overflow-hidden border-y border-bone/10 py-[clamp(3.5rem,8vw,6rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6 px-[var(--gutter)]">
        <div>
          <p className="kicker mb-4" data-reveal>
            Витрина
          </p>
          <h2 className="display text-[clamp(1.9rem,6vw,4rem)] leading-[0.95]" data-reveal>
            Как это <span className="text-scarlet">выглядит вживую</span>
          </h2>
        </div>
        <Link
          href="/video"
          data-cursor="Смотреть"
          className="ml-auto font-mono text-[11px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:text-bone"
        >
          Все {SHOW_VIDEOS.length}{' '}
          {plural(SHOW_VIDEOS.length, 'ролик', 'ролика', 'роликов')}{' '}
          <span aria-hidden>→</span>
        </Link>
      </div>

      <ul
        ref={rail}
        className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {RAIL.map((item, i) => (
          <li
            key={item.show.slug}
            className="w-[68vw] shrink-0 snap-center sm:w-[42vw] lg:w-[23vw]"
          >
            <Link
              href={`/shows/${item.show.slug}`}
              data-cursor="Play"
              className="group relative block aspect-[9/16] overflow-hidden bg-graphite"
            >
              <Media
                slug={item.poster}
                alt={item.show.title}
                sizes="(max-width: 640px) 68vw, (max-width: 1024px) 42vw, 23vw"
                className="h-full w-full object-cover"
              />
              {enabled && active === i && <RailVideo src={item.src} />}
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="kicker mb-2 text-bone/50">{CATEGORY_LABEL[item.show.category]}</p>
                <p className="display text-base leading-tight sm:text-lg">{item.show.title}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Mounted only for the active card, so leaving the rail releases the decoder. */
function RailVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setReady(true)}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
