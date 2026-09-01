'use client';

import { useEffect, useState } from 'react';
import type { PriceGroup } from '@/content/pricing';

/**
 * Sticky category rail for a price list. Highlights the section currently in
 * view and scrolls to it on click — plain anchors underneath, so it works
 * without JS too.
 */
export function PriceNav({ groups }: { groups: PriceGroup[] }) {
  const [active, setActive] = useState(groups[0].id);

  useEffect(() => {
    const sections = groups
      .map((g) => document.getElementById(g.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // Band across the upper third: a section counts as "current" once its
      // heading clears the header.
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <nav
      aria-label="Разделы прайса"
      className="sticky top-[var(--header-h)] z-20 border-y border-bone/10 bg-void/85 px-[var(--gutter)] py-4 backdrop-blur-xl"
    >
      <ul className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((group) => (
          <li key={group.id}>
            <a
              href={`#${group.id}`}
              aria-current={active === group.id ? 'true' : undefined}
              className={`block whitespace-nowrap rounded-full border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-500 ${
                active === group.id
                  ? 'border-bone bg-bone text-void'
                  : 'border-bone/15 text-bone/60 hover:border-bone/45 hover:text-bone'
              }`}
            >
              {group.kicker}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
