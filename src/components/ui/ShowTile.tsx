'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Media } from './Media';
import { HoverVideo } from './HoverVideo';
import { CATEGORY_LABEL, type Show } from '@/content/shows';
import { hasVideo } from '@/content/videos';

/**
 * Catalogue tile. On hover the photograph scales behind a fixed frame, a
 * scrim lifts and the title rises — the "reveal" is done with transforms only,
 * so it stays on the compositor.
 */
export function ShowTile({
  show,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
  eager = false,
}: {
  show: Show;
  sizes?: string;
  className?: string;
  eager?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const video = hasVideo(show.slug);

  return (
    <Link
      href={`/shows/${show.slug}`}
      data-cursor={video ? 'Play' : 'Смотреть'}
      aria-label={`${show.title} — ${show.tagline}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group relative block overflow-hidden bg-graphite ${className}`}
    >
      <Media
        slug={show.cover}
        alt={`${show.title} — ${show.tagline}`}
        sizes={sizes}
        priority={eager}
        className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
      />

      {video && <HoverVideo src={`/video/${show.slug}.mp4`} active={hover} />}

      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-100" />

      {/* Accent wash drawn from the show's own palette. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-70"
        style={{ background: `linear-gradient(160deg, transparent 35%, ${show.palette[1]})` }}
      />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <p className="kicker mb-3 text-bone/50">{CATEGORY_LABEL[show.category]}</p>
        <h3 className="display text-[clamp(1.3rem,2.6vw,2.3rem)] leading-none">{show.title}</h3>
        {/* Tagline slides up out of its own mask on hover. */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr]">
          <span className="overflow-hidden">
            <span className="mt-2.5 block text-sm text-bone/65">{show.tagline}</span>
          </span>
        </div>
      </div>

      <span
        aria-hidden
        className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone/70 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 sm:translate-x-2"
      >
        {video ? '▶' : '→'}
      </span>
    </Link>
  );
}
