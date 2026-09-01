'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Media } from '@/components/ui/Media';
import type { MediaSlug } from '@/lib/media';

export type LightboxItem = { slug: MediaSlug; title: string; caption?: string };

/**
 * Grid of thumbnails plus a full-screen viewer.
 *
 * The viewer is keyboard-driven (←/→/Esc), traps focus, restores it on close,
 * and locks body scroll while open. Neighbouring frames are pre-decoded so
 * stepping through feels instant.
 */
export function Lightbox({
  items,
  className = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
  tileClassName = 'aspect-[4/5]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: {
  items: LightboxItem[];
  className?: string;
  tileClassName?: string;
  sizes?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const invoker = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? null : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Tab') {
        // Only the viewer's own controls are reachable while it is open.
        const focusable = dialog.current?.querySelectorAll<HTMLElement>('button');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', onKey);
    const timer = setTimeout(() => dialog.current?.querySelector('button')?.focus(), 60);

    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(timer);
      document.body.style.overflow = overflow;
      invoker.current?.focus?.();
    };
  }, [open, close, step]);

  // Swipe between frames on touch devices.
  const touchX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(delta) > 60) step(delta < 0 ? 1 : -1);
  };

  const current = open === null ? null : items[open];

  return (
    <>
      <div className={className}>
        {items.map((item, i) => (
          <button
            key={`${item.slug}-${i}`}
            type="button"
            data-cursor="Открыть"
            onClick={(e) => { invoker.current = e.currentTarget; setOpen(i); }}
            aria-label={`Открыть: ${item.caption ?? item.title}`}
            className={`group relative block w-full overflow-hidden bg-graphite ${tileClassName}`}
            data-reveal
          >
            <Media
              slug={item.slug}
              alt={item.caption ?? item.title}
              sizes={sizes}
              className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-void/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 text-left opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone">
                {item.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      {current && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? current.title}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="fixed inset-0 z-[9995] flex flex-col bg-void/97 backdrop-blur-lg [animation:fadeUp_0.45s_var(--ease-plastic)_both]"
        >
          <div className="flex items-center justify-between border-b border-bone/10 px-[var(--gutter)] py-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
              {String((open ?? 0) + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть просмотр"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-bone hover:bg-bone hover:text-void"
            >
              ✕
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Предыдущий кадр"
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-bone/20 text-bone/70 transition-colors hover:border-bone hover:text-bone sm:left-6"
            >
              ←
            </button>

            <figure key={current.slug + open} className="max-h-full [animation:fadeUp_0.5s_var(--ease-plastic)_both]">
              <Media
                slug={current.slug}
                alt={current.caption ?? current.title}
                sizes="92vw"
                className="max-h-[72svh] w-auto object-contain"
              />
              <figcaption className="mt-5 text-center">
                <span className="display block text-base">{current.title}</span>
                {current.caption && (
                  <span className="mt-1.5 block text-sm text-ash">{current.caption}</span>
                )}
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Следующий кадр"
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-bone/20 text-bone/70 transition-colors hover:border-bone hover:text-bone sm:right-6"
            >
              →
            </button>
          </div>

          {/* Pre-decode the neighbours so stepping never shows a blank frame. */}
          <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
            {[-1, 1].map((d) => {
              const n = items[((open ?? 0) + d + items.length) % items.length];
              return <Media key={`pre-${d}`} slug={n.slug} alt="" sizes="1px" />;
            })}
          </div>

          <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }`}</style>
        </div>
      )}
    </>
  );
}
