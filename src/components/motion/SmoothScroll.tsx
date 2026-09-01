'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCapabilities } from '@/lib/capabilities';

gsap.registerPlugin(ScrollTrigger);

/** Shared instance so page-transition code can stop/scroll the page. */
export let lenis: Lenis | null = null;

/**
 * Drives momentum scrolling and keeps ScrollTrigger in sync with it.
 * Disabled entirely under prefers-reduced-motion, where native scrolling is
 * both faster and what the visitor asked for.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (getCapabilities().reducedMotion) return;

    const instance = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      // Native touch scrolling stays smoother than a JS-driven one on mobile.
      smoothWheel: true,
      syncTouch: false,
    });
    lenis = instance;

    instance.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenis = null;
    };
  }, []);

  // Every route change starts at the top and re-measures pinned sections.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
