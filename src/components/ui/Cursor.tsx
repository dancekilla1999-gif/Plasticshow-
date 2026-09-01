'use client';

import { useEffect, useRef } from 'react';
import { getCapabilities } from '@/lib/capabilities';

/**
 * Custom cursor for pointer devices. It never replaces the system cursor
 * outright — the native one stays visible over text and form fields so the site
 * remains usable if this ring lags or fails.
 *
 * Any element can label the ring via `data-cursor="VIEW"`.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const { pointerFine, reducedMotion } = getCapabilities();
    if (!pointerFine || reducedMotion) return;

    const el = ring.current;
    const text = label.current;
    if (!el || !text) return;

    const pos = { x: -100, y: -100, tx: -100, ty: -100 };
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;

      const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-cursor]');
      const value = target?.dataset.cursor ?? '';
      if (text.textContent !== value) text.textContent = value;
      el.dataset.state = value ? 'label' : target ? 'active' : 'idle';

      const interactive = (e.target as HTMLElement)?.closest('a, button, input, textarea, select');
      if (interactive && !value) el.dataset.state = 'active';
    };

    const loop = () => {
      frame = requestAnimationFrame(loop);
      pos.x += (pos.tx - pos.x) * 0.19;
      pos.y += (pos.ty - pos.y) * 0.19;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
    };
    loop();

    const onLeave = () => { el.style.opacity = '0'; };
    const onEnter = () => { el.style.opacity = '1'; };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden
      data-state="idle"
      className="pointer-events-none fixed left-0 top-0 z-[9998] hidden items-center justify-center rounded-full border border-bone/45 text-[10px] font-mono uppercase tracking-[0.2em] text-bone mix-blend-difference transition-[width,height,background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(pointer:fine)]:flex data-[state=active]:h-14 data-[state=active]:w-14 data-[state=active]:border-bone data-[state=idle]:h-7 data-[state=idle]:w-7 data-[state=label]:h-24 data-[state=label]:w-24 data-[state=label]:border-transparent data-[state=label]:bg-bone data-[state=label]:text-void data-[state=label]:mix-blend-normal"
    >
      <span ref={label} />
    </div>
  );
}
