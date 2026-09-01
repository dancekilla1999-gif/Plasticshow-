'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Media } from '@/components/ui/Media';
import { StageField } from '@/components/motion/StageField';
import { ButtonLink } from '@/components/ui/Button';
import { EVENT_FORMATS } from '@/content/site';
import { getCapabilities } from '@/lib/capabilities';

/**
 * Opening sequence. The wordmark splits into two lines that rise out of masks
 * while the backdrop scales down — the page "lands" rather than appearing.
 */
export function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getCapabilities().reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.from('[data-hero-backdrop]', { scale: 1.14, duration: 2.2, ease: 'power2.out' }, 0)
        .from(
          '[data-hero-line] > span',
          { yPercent: 115, duration: 1.25, stagger: 0.09 },
          0.25,
        )
        .from('[data-hero-meta]', { opacity: 0, y: 24, duration: 0.9, stagger: 0.09 }, 0.85)
        .from('[data-hero-rail]', { opacity: 0, duration: 0.8 }, 1.2);

      // Backdrop drifts up as the visitor scrolls out of the hero.
      gsap.to('[data-hero-backdrop]', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-hero-content]', {
        yPercent: -12,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <div data-hero-backdrop className="absolute inset-0 will-change-transform">
        <Media
          slug="dikie-zemli-4"
          alt="Артистки Plastic Show на сцене"
          sizes="100vw"
          priority
          className="h-full w-full object-cover object-[50%_35%]"
        />
        {/* Two gradients: one grounds the type, one darkens the whole frame. */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-void/55" />
        <StageField />
      </div>

      <div
        data-hero-content
        className="relative flex h-full flex-col justify-end px-[var(--gutter)] pb-[clamp(5.5rem,11vh,8rem)]"
      >
        <p data-hero-meta className="kicker mb-7">
          <span className="mr-3 inline-block h-px w-10 translate-y-[-3px] bg-scarlet align-middle" />
          <span className="sm:hidden">Танцевальная инициатива · с 2015</span>
          <span className="hidden sm:inline">Танцевальная инициатива икон стиля · с 2015</span>
        </p>

        <h1 className="display text-[clamp(3rem,15.5vw,15rem)]">
          <span data-hero-line className="line-mask block">
            <span className="block">PLASTIC</span>
          </span>
          <span data-hero-line className="line-mask block">
            <span className="block text-transparent [-webkit-text-stroke:1px_var(--color-bone)] sm:[-webkit-text-stroke:1.5px_var(--color-bone)]">
              SHOW
            </span>
          </span>
        </h1>

        <div className="mt-9 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p
            data-hero-meta
            className="max-w-md text-base leading-relaxed text-bone/70 sm:text-lg"
          >
            Современный танец, перформанс и визуальное искусство. Шоу под ключ — от идеи до
            оваций, продуманно с головы до ног.
          </p>

          <div data-hero-meta className="flex flex-wrap items-center gap-3">
            <ButtonLink href="/contact" variant="solid">
              Заказать шоу
              <span aria-hidden>→</span>
            </ButtonLink>
            <ButtonLink href="/shows" variant="outline">
              Смотреть репертуар
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Format rail — a quiet, continuous statement of what they play. */}
      <div
        data-hero-rail
        className="marquee absolute inset-x-0 bottom-0 overflow-hidden border-t border-bone/10 bg-void/60 py-3.5 backdrop-blur-sm"
      >
        <div className="marquee-track" style={{ ['--marquee-duration' as string]: '46s' }}>
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex shrink-0">
              {EVENT_FORMATS.map((format) => (
                <span
                  key={format}
                  className="flex items-center whitespace-nowrap px-6 font-mono text-[10px] uppercase tracking-[0.24em] text-bone/45"
                >
                  {format}
                  <span className="ml-6 text-scarlet">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
