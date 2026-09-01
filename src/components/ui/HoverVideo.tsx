'use client';

import { useEffect, useRef, useState } from 'react';
import { getCapabilities } from '@/lib/capabilities';

/**
 * Muted preview that starts on hover and stops on leave.
 *
 * The <video> element carries no src until the pointer first arrives, so a
 * catalogue of forty tiles costs nothing until someone actually hovers one.
 * Touch devices and reduced-motion visitors never load it at all — they keep
 * the poster image the tile already shows.
 */
export function HoverVideo({
  src,
  className = '',
  active,
}: {
  src: string;
  className?: string;
  /** Hover state owned by the parent tile, so the whole card is the trigger. */
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { pointerFine, reducedMotion, saveData } = getCapabilities();
    setEnabled(pointerFine && !reducedMotion && !saveData);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    if (active) {
      if (!el.src) el.src = src;
      // A rejected play() is normal when the pointer leaves mid-load.
      el.play().catch(() => {});
    } else {
      el.pause();
      if (el.readyState) el.currentTime = 0;
    }
  }, [active, enabled, src]);

  if (!enabled) return null;

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      onPlaying={() => setReady(true)}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
        active && ready ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    />
  );
}
