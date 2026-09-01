'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Media } from '@/components/ui/Media';
import { getCapabilities } from '@/lib/capabilities';
import type { MediaSlug } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger);

type Frame = { slug: MediaSlug; title: string; caption: string };

/**
 * Pinned horizontal reel: vertical scroll drives the strip sideways.
 *
 * On touch devices and under reduced motion the pin is skipped entirely and the
 * strip becomes a native swipeable scroller — the same content, without a
 * hijacked scroll that fights the OS.
 */
export function HorizontalReel({ frames }: { frames: Frame[] }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { pointerFine, reducedMotion } = getCapabilities();
    if (!pointerFine || reducedMotion) return;
    if (!root.current || !track.current) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    const ctx = gsap.context(() => {
      const strip = track.current!;
      const distance = () => strip.scrollWidth - window.innerWidth;

      gsap.to(strip, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative lg:h-[100svh] lg:overflow-hidden">
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-6 lg:h-full lg:items-center lg:overflow-visible lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {frames.map((frame, i) => (
          <figure
            key={`${frame.slug}-${i}`}
            className="group relative aspect-[3/4] w-[78vw] shrink-0 snap-center overflow-hidden bg-graphite sm:w-[52vw] lg:h-[68svh] lg:w-auto"
          >
            <Media
              slug={frame.slug}
              alt={frame.caption}
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 52vw, 40vw"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 lg:w-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="display mt-2.5 block text-base sm:text-lg">{frame.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="kicker mt-6 px-[var(--gutter)] lg:absolute lg:bottom-8 lg:right-[var(--gutter)] lg:mt-0">
        <span className="lg:hidden">Листайте вбок →</span>
        <span className="hidden lg:inline">Прокрутите вниз — лента едет вбок</span>
      </p>
    </div>
  );
}
