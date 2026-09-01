import type { ReactNode } from 'react';
import { Media } from '@/components/ui/Media';
import type { MediaSlug } from '@/lib/media';

/**
 * Inner-page opening. Shorter than the home hero so the content starts fast,
 * but with the same typographic weight so the site reads as one piece.
 */
export function PageHero({
  kicker,
  title,
  lead,
  media,
  align = 'left',
  aside,
}: {
  kicker: string;
  title: ReactNode;
  lead?: string;
  media: MediaSlug;
  align?: 'left' | 'center';
  aside?: ReactNode;
}) {
  return (
    <header className="relative flex min-h-[72svh] items-end overflow-hidden pt-[var(--header-h)]">
      <div className="absolute inset-0">
        <Media
          slug={media}
          alt=""
          sizes="100vw"
          priority
          className="h-full w-full object-cover opacity-45"
          data-parallax="6"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/50" />
      </div>

      <div
        className={`relative w-full px-[var(--gutter)] pb-[clamp(2.5rem,5vw,4.5rem)] pt-[clamp(5rem,12vw,9rem)] ${
          align === 'center' ? 'text-center' : ''
        }`}
      >
        <p className="kicker mb-7">
          <span className="mr-3 inline-block h-px w-10 translate-y-[-3px] bg-scarlet align-middle" />
          {kicker}
        </p>

        <h1 className="display max-w-5xl text-[clamp(2.1rem,7vw,6.5rem)]">
          <span className="line-mask"><span>{title}</span></span>
        </h1>

        {lead && (
          <p
            className={`mt-8 max-w-2xl text-base leading-relaxed text-ash sm:text-lg ${
              align === 'center' ? 'mx-auto' : ''
            }`}
            data-reveal
          >
            {lead}
          </p>
        )}

        {aside && <div className="mt-10">{aside}</div>}
      </div>
    </header>
  );
}
