'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV } from '@/content/site';
import { Menu } from './Menu';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A route change always closes the overlay.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-full focus:bg-bone focus:px-5 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:text-void"
      >
        К основному содержанию
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[9990] transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled && !open
            ? 'border-b border-bone/10 bg-void/70 backdrop-blur-xl'
            : 'border-b border-transparent'
        }`}
      >
        <div className="flex h-[var(--header-h)] items-center justify-between px-[var(--gutter)]">
          <Link
            href="/"
            aria-label="Plastic Show — на главную"
            className="display relative z-10 text-[15px] leading-none tracking-[0.02em] mix-blend-difference"
          >
            PLASTIC<span className="text-scarlet">.</span>SHOW
          </Link>

          <nav aria-label="Основная навигация" className="hidden items-center gap-9 lg:flex">
            {NAV.slice(1, 6).map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="group relative font-mono text-[11px] uppercase tracking-[0.2em] text-bone/70 transition-colors hover:text-bone"
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-scarlet transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="relative z-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] mix-blend-difference"
          >
            <span className="hidden sm:inline">{open ? 'Закрыть' : 'Меню'}</span>
            <span className="flex h-4 w-6 flex-col justify-center gap-[5px]">
              <span
                className={`block h-px w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  open ? 'translate-y-[3px] rotate-45' : ''
                }`}
              />
              <span
                className={`block h-px w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  open ? '-translate-y-[3px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
