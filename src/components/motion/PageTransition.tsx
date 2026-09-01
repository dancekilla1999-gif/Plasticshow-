'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCapabilities } from '@/lib/capabilities';

const DURATION = 620;

/**
 * Cinematic route transition: a curtain of vertical panels wipes across the
 * viewport, the next route is pushed behind it, then the panels retract.
 *
 * It intercepts internal link clicks rather than wrapping the router, so
 * modifier-clicks, middle-clicks and external links keep native behaviour. If
 * anything goes wrong the navigation still happens — the curtain is decoration
 * layered on top of a normal `router.push`.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'covering' | 'revealing'>('idle');
  const pending = useRef<string | null>(null);

  useEffect(() => {
    if (getCapabilities().reducedMotion) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement)?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (
        !href ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return;
      }

      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      if (next.pathname === window.location.pathname) return;

      e.preventDefault();
      pending.current = next.pathname + next.search;
      setPhase('covering');
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Once the curtain is closed, navigate behind it.
  useEffect(() => {
    if (phase !== 'covering') return;
    const timer = setTimeout(() => {
      if (pending.current) router.push(pending.current);
    }, DURATION);
    return () => clearTimeout(timer);
  }, [phase, router]);

  // The new route mounted — retract the curtain.
  useEffect(() => {
    if (phase !== 'covering' || !pending.current) return;
    if (pathname !== pending.current.split('?')[0]) return;
    pending.current = null;
    setPhase('revealing');
    const timer = setTimeout(() => setPhase('idle'), DURATION + 120);
    return () => clearTimeout(timer);
  }, [pathname, phase]);

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[9997] grid grid-cols-5 ${
          phase === 'idle' ? 'invisible' : 'visible'
        }`}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-full w-full bg-void transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{
              transitionDuration: `${DURATION}ms`,
              // Panels stagger outward from the centre column.
              transitionDelay: `${Math.abs(i - 2) * 55}ms`,
              transform:
                phase === 'covering'
                  ? 'translateY(0%)'
                  : phase === 'revealing'
                    ? 'translateY(-101%)'
                    : 'translateY(101%)',
            }}
          />
        ))}
      </div>

      {/* The wordmark flashes over the closed curtain, like a title card. */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[9997] flex items-center justify-center transition-opacity duration-300 ${
          phase === 'covering' ? 'opacity-100 delay-[380ms]' : 'invisible opacity-0'
        }`}
      >
        <span className="display text-[clamp(2rem,7vw,5rem)] text-bone/85">PLASTIC SHOW</span>
      </div>

      {children}
    </>
  );
}
