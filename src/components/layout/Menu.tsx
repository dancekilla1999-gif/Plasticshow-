'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { NAV, CONTACTS } from '@/content/site';
import { SHOWS } from '@/content/shows';
import { Media } from '@/components/ui/Media';
import { telegramLink, instagramLink, mailLink, whatsappLink } from '@/lib/whatsapp';
import type { MediaSlug } from '@/lib/media';

/** Each nav row previews a different photograph on hover. */
const PREVIEWS: Record<string, MediaSlug> = {
  '/': 'dikie-zemli-4',
  '/about': 'matritsa-8',
  '/shows': 'rozy-tsvety-13',
  '/services': 'gretsiya-10',
  '/costumes': 'gladiatory-1',
  '/gallery': 'snezhnye-korolevy-2',
  '/video': 'matritsa-9',
  '/team': 'artist-anna-1',
  '/pricing': 'barokko-6',
  '/contact': 'pozhary-1',
};

export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  // The overlay is always mounted (so it can animate), which means its preview
  // photographs would otherwise download on every page load even though nobody
  // has opened the menu. Render them only once it has been opened at least once.
  const [everOpened, setEverOpened] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  // Lock the page, trap focus and restore it on close.
  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !panel.current) return;

      const items = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const focusTimer = setTimeout(
      () => panel.current?.querySelector<HTMLElement>('a[href]')?.focus(),
      420,
    );

    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previous?.focus?.();
    };
  }, [open, onClose]);

  const previewSlug = hovered ? PREVIEWS[hovered] : null;

  return (
    <div
      id="site-menu"
      ref={panel}
      role="dialog"
      // Only a genuinely open dialog is modal; while closed the panel is inert
      // and must not be announced as one.
      aria-modal={open ? true : undefined}
      aria-label="Меню сайта"
      inert={!open ? true : undefined}
      className={`fixed inset-0 z-[9989] transition-[visibility] duration-700 ${
        open ? 'visible' : 'invisible'
      }`}
    >
      {/* Curtain panels sweep down, staggered left to right. */}
      <div aria-hidden className="absolute inset-0 grid grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-full w-full border-r border-bone/[0.06] bg-obsidian transition-transform duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{
              transitionDelay: `${(open ? i : 3 - i) * 60}ms`,
              transform: open ? 'translateY(0)' : 'translateY(-101%)',
            }}
          />
        ))}
      </div>

      {/* Photograph that swaps as you move down the list. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42vw] overflow-hidden lg:block"
      >
        {everOpened && Object.entries(PREVIEWS).map(([href, slug]) => (
          <div
            key={href}
            className={`absolute inset-0 transition-opacity duration-700 ${
              previewSlug === slug && open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Media
              slug={slug}
              alt=""
              sizes="42vw"
              className="h-full w-full object-cover grayscale-[0.35]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/45 to-transparent" />
          </div>
        ))}
      </div>

      <div className="relative flex h-full flex-col justify-between px-[var(--gutter)] pb-10 pt-[calc(var(--header-h)+3vh)]">
        <nav
          aria-label="Разделы сайта"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto py-[2vh] [justify-content:safe_center]"
        >
          <ul>
            {NAV.map((item, i) => (
              <li key={item.href} className="overflow-hidden">
                <Link
                  href={item.href}
                  onMouseEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  onMouseLeave={() => setHovered(null)}
                  className="group flex min-h-[44px] items-center gap-4 py-1 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:gap-8"
                  style={{
                    transitionDelay: `${open ? 260 + i * 45 : 0}ms`,
                    transform: open ? 'translateY(0)' : 'translateY(115%)',
                  }}
                >
                  <span className="font-mono text-[10px] text-ash transition-colors group-hover:text-ember">
                    {item.index}
                  </span>
                  <span className="display text-[clamp(1.45rem,4.6vw,4.2rem)] text-bone/85 transition-colors duration-300 group-hover:text-bone">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="flex flex-col gap-6 border-t border-bone/10 pt-6 transition-opacity duration-700 sm:flex-row sm:items-end sm:justify-between"
          style={{ transitionDelay: open ? '640ms' : '0ms', opacity: open ? 1 : 0 }}
        >
          <div className="hidden sm:block">
            <p className="kicker mb-3">Избранное из репертуара</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {SHOWS.filter((s) => s.featured).map((show) => (
                <li key={show.slug}>
                  <Link
                    href={`/shows/${show.slug}`}
                    className="inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.16em] text-bone/60 transition-colors hover:text-ember"
                  >
                    {show.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: 'WhatsApp', href: whatsappLink('Здравствуйте! Хочу обсудить шоу.') },
              { label: 'Telegram', href: telegramLink },
              { label: 'Instagram', href: instagramLink },
              { label: 'Email', href: mailLink },
            ].map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.16em] text-bone/60 transition-colors hover:text-bone"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="inline-flex min-h-[44px] items-center font-mono text-[11px] tracking-[0.16em] text-ash">
              {CONTACTS.whatsappDisplay}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
