'use client';

import { useEffect, useState } from 'react';
import { Media } from '@/components/ui/Media';
import { VIDEOS, type Video } from '@/content/videos';

/**
 * Video wall with a full-screen player.
 *
 * Nothing is preloaded: each tile shows its poster frame and only mounts a
 * <video> once opened, so the page costs the same as a photo grid until the
 * visitor actually asks to watch something.
 */
export function VideoGrid() {
  const [open, setOpen] = useState<Video | null>(null);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2" data-reveal-group>
        {VIDEOS.map((video) => (
          <button
            key={video.id}
            type="button"
            data-cursor="Play"
            onClick={() => setOpen(video)}
            aria-label={`Смотреть: ${video.title}`}
            data-reveal
            className="group relative aspect-video overflow-hidden bg-graphite"
          >
            <Media
              slug={video.poster}
              alt={video.title}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />

            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/40 text-bone backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-bone group-hover:bg-bone group-hover:text-void"
            >
              ▶
            </span>

            <span className="absolute inset-x-0 bottom-0 p-6 text-left">
              <span className="kicker block">{video.kicker}</span>
              <span className="display mt-2.5 block text-base sm:text-lg">{video.title}</span>
              {video.duration && (
                <span className="mt-1.5 block font-mono text-[10px] tracking-[0.16em] text-ash">
                  {video.duration}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          className="fixed inset-0 z-[9995] flex flex-col bg-void/97 backdrop-blur-lg"
        >
          <div className="flex items-center justify-between border-b border-bone/10 px-[var(--gutter)] py-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
              {open.kicker}
            </span>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Закрыть плеер"
              autoFocus
              className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-bone hover:bg-bone hover:text-void"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={open.src}
              poster={`/media/${open.poster}-1200.webp`}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="max-h-[76svh] w-full max-w-5xl bg-black"
            >
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
