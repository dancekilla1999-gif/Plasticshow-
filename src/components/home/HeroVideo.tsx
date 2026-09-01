'use client';

import { useEffect, useRef, useState } from 'react';
import { getCapabilities } from '@/lib/capabilities';
import { HERO_VIDEO_LANDSCAPE, HERO_VIDEO_PORTRAIT } from '@/content/videos';

/**
 * Moving backdrop for the opening frame. The photograph underneath stays the
 * LCP element — the clip is only attached after the first paint, and only on
 * devices that can afford it, then cross-fades in once it actually has frames.
 *
 * Two encodes exist because the archive is shot on phones: a 16:9 cut for
 * desktop and a 9:16 cut for portrait viewports, so neither is centre-cropped
 * into meaninglessness.
 */
export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const caps = getCapabilities();
    if (caps.reducedMotion || caps.saveData) return;
    if ((navigator.hardwareConcurrency ?? 4) < 4) return;

    const portrait = window.innerHeight > window.innerWidth;
    // Одного кадра ожидания хватает, чтобы фотография успела стать LCP.
    const id = window.setTimeout(
      () => setSrc(portrait ? HERO_VIDEO_PORTRAIT : HERO_VIDEO_LANDSCAPE),
      600,
    );
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = video.current;
    if (!el || !src) return;
    el.play().catch(() => {
      /* Автовоспроизведение может быть запрещено — остаётся фотография. */
    });
  }, [src]);

  if (!src) return null;

  return (
    <video
      ref={video}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setReady(true)}
      className={`absolute inset-0 h-full w-full object-cover object-[50%_35%] transition-opacity duration-[1600ms] ease-out ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
