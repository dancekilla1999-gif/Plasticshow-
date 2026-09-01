'use client';

import { useEffect, useMemo, useState } from 'react';
import { Media } from '@/components/ui/Media';
import { HoverVideo } from '@/components/ui/HoverVideo';
import { SHOW_VIDEOS, type ShowVideo } from '@/content/videos';
import { CATEGORY_LABEL, SHOW_CATEGORIES, type ShowCategory } from '@/content/shows';

/**
 * Wall of show previews with a full-screen player.
 *
 * Tiles are posters only — no <video> is created until a tile is opened, so a
 * page of 35 clips costs the same as a page of 35 photographs.
 */
export function VideoGrid() {
  const [open, setOpen] = useState<ShowVideo | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [filter, setFilter] = useState<ShowCategory | 'all'>('all');

  const items = useMemo(
    () =>
      filter === 'all'
        ? SHOW_VIDEOS
        : SHOW_VIDEOS.filter((v) => v.show.category === filter),
    [filter],
  );

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
      {/* Те же категории, что и в репертуаре — но только там, где есть запись. */}
      <div
        role="group"
        aria-label="Фильтр роликов"
        className="mb-12 flex flex-wrap gap-2.5 border-b border-bone/10 pb-8"
      >
        {SHOW_CATEGORIES.map((cat) => {
          const count =
            cat.id === 'all'
              ? SHOW_VIDEOS.length
              : SHOW_VIDEOS.filter((v) => v.show.category === cat.id).length;
          if (!count) return null;
          const active = filter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              aria-pressed={active}
              className={`rounded-full border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-500 ${
                active
                  ? 'border-bone bg-bone text-void'
                  : 'border-bone/15 text-bone/60 hover:border-bone/45 hover:text-bone'
              }`}
            >
              {cat.label}
              <span className={active ? 'ml-2 text-void/50' : 'ml-2 text-ash'}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.show.slug}
            type="button"
            data-cursor="Play"
            onClick={() => setOpen(item)}
            onMouseEnter={() => setHover(item.show.slug)}
            onMouseLeave={() => setHover(null)}
            aria-label={`Смотреть видео: ${item.show.title}`}
            className="group relative aspect-[4/5] overflow-hidden bg-graphite"
          >
            <Media
              slug={item.poster}
              alt={item.show.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <HoverVideo src={item.src} active={hover === item.show.slug} />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />

            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/40 text-bone backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-bone group-hover:bg-bone group-hover:text-void"
            >
              ▶
            </span>

            <span className="absolute inset-x-0 bottom-0 p-6 text-left">
              <span className="kicker block">{CATEGORY_LABEL[item.show.category]}</span>
              <span className="display mt-2.5 block text-base sm:text-lg">{item.show.title}</span>
              <span className="mt-1.5 block text-sm text-ash">{item.show.tagline}</span>
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.show.title}
          className="fixed inset-0 z-[9995] flex flex-col bg-void/97 backdrop-blur-lg"
        >
          <div className="flex items-center justify-between border-b border-bone/10 px-[var(--gutter)] py-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
              {open.show.title}
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
              controls
              autoPlay
              loop
              playsInline
              preload="metadata"
              width={open.w}
              height={open.h}
              className={`max-h-[78svh] w-full bg-black object-contain ${
                open.portrait ? 'max-w-[min(28rem,44svh)]' : 'max-w-5xl'
              }`}
            >
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
