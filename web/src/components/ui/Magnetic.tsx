'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { getCapabilities } from '@/lib/capabilities';

/**
 * Pulls its child toward the cursor within a small radius. Mouse-only: on touch
 * the wrapper renders as an ordinary span with no listeners attached.
 */
export function Magnetic({ children, strength = 0.32 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const { pointerFine, reducedMotion } = getCapabilities();
    if (!el || !pointerFine || reducedMotion) return;

    const quickX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const quickY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      quickX((e.clientX - (r.left + r.width / 2)) * strength);
      quickY((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { quickX(0); quickY(0); };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return <span ref={ref} className="inline-block will-change-transform">{children}</span>;
}
