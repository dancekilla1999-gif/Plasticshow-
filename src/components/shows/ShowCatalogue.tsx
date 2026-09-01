'use client';

import { useMemo, useState } from 'react';
import { ShowTile } from '@/components/ui/ShowTile';
import { SHOWS, SHOW_CATEGORIES, type ShowCategory } from '@/content/shows';

/**
 * Filterable repertoire mosaic. Filtering is client-side over a fixed list, so
 * it stays instant and needs no network; the full list is rendered on the
 * server first, which keeps every show crawlable.
 */
export function ShowCatalogue() {
  const [filter, setFilter] = useState<ShowCategory | 'all'>('all');

  const shows = useMemo(
    () => (filter === 'all' ? SHOWS : SHOWS.filter((s) => s.category === filter)),
    [filter],
  );

  return (
    <>
      <div
        role="group"
        aria-label="Фильтр репертуара"
        className="mb-12 flex flex-wrap gap-2.5 border-b border-bone/10 pb-8"
      >
        {SHOW_CATEGORIES.map((cat) => {
          const active = filter === cat.id;
          const count =
            cat.id === 'all' ? SHOWS.length : SHOWS.filter((s) => s.category === cat.id).length;
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

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {shows.map((show, i) => (
          <ShowTile
            key={show.slug}
            show={show}
            eager={i < 3}
            sizes={
              show.wide
                ? '(max-width: 1024px) 100vw, 62vw'
                : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 31vw'
            }
            className={`${show.wide ? 'aspect-[16/10] md:col-span-2' : 'aspect-[4/5]'} [animation:tileIn_0.6s_var(--ease-plastic)_both]`}
          />
        ))}
      </div>

      <style>{`@keyframes tileIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { @keyframes tileIn { from { opacity: 1; } to { opacity: 1; } } }`}</style>
    </>
  );
}
