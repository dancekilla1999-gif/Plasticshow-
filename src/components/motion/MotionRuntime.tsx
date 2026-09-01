'use client';

import dynamic from 'next/dynamic';

/**
 * Keeps the animation runtime out of the critical path.
 *
 * SmoothScroll and Reveal pull in GSAP + ScrollTrigger + Lenis (~120 KB raw).
 * None of them render markup — they only enhance content that is already on the
 * page — so loading them lazily costs nothing visually and lets first paint
 * happen on the HTML alone.
 */
const SmoothScroll = dynamic(
  () => import('./SmoothScroll').then((m) => m.SmoothScroll),
  { ssr: false },
);

const Reveal = dynamic(() => import('./Reveal').then((m) => m.Reveal), { ssr: false });

const Cursor = dynamic(() => import('@/components/ui/Cursor').then((m) => m.Cursor), {
  ssr: false,
});

export function MotionRuntime() {
  return (
    <>
      <SmoothScroll />
      <Reveal />
      <Cursor />
    </>
  );
}
