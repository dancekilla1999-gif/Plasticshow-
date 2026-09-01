'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCapabilities } from '@/lib/capabilities';

gsap.registerPlugin(ScrollTrigger);

/**
 * A single scroll-reveal engine for the whole site.
 *
 * Anything marked `data-reveal` fades and lifts into place; `data-reveal="mask"`
 * wipes in behind a clip-path; `.line-mask > span` slides up per line. Elements
 * are only hidden after `html.anim` is set, so content stays visible if this
 * never runs.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    if (getCapabilities().reducedMotion) {
      root.classList.remove('anim');
      return;
    }
    root.classList.add('anim');

    const ctx = gsap.context(() => {
      // Grouped reveals: children of [data-reveal-group] stagger together.
      gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>('[data-reveal]');
        if (!items.length) return;
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: group, start: 'top 82%', once: true },
        });
      });

      // Standalone reveals.
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        if (el.closest('[data-reveal-group]')) return;
        const masked = el.dataset.reveal === 'mask';
        gsap.to(el, {
          opacity: 1,
          y: 0,
          ...(masked ? { clipPath: 'inset(0 0 0% 0)' } : {}),
          duration: masked ? 1.25 : 0.95,
          ease: masked ? 'power4.inOut' : 'power3.out',
          delay: Number(el.dataset.revealDelay ?? 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      // Per-line typographic reveals.
      gsap.utils.toArray<HTMLElement>('.line-mask').forEach((el, i) => {
        gsap.to(el.querySelector('span'), {
          y: '0%',
          duration: 1.1,
          ease: 'power4.out',
          delay: i * 0.06,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      // Parallax on anything tagged with a strength.
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const strength = Number(el.dataset.parallax || 12);
        gsap.fromTo(
          el,
          { yPercent: -strength },
          {
            yPercent: strength,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement ?? el, scrub: true },
          },
        );
      });

      // Counters that tick up when they scroll into view.
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count || 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toString();
          },
        });
      });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
