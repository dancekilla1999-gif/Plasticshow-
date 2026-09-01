import type { ReactNode } from 'react';

/** Standard section shell: consistent gutters, kicker + oversized heading. */
export function Section({
  id,
  kicker,
  title,
  lead,
  children,
  className = '',
  align = 'left',
}: {
  id?: string;
  kicker?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <section id={id} className={`px-[var(--gutter)] py-[clamp(4.5rem,11vw,9.5rem)] ${className}`}>
      {(kicker || title || lead) && (
        <header
          className={`mb-[clamp(2.5rem,6vw,5rem)] ${align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-4xl'}`}
        >
          {kicker && (
            <p className="kicker mb-6" data-reveal>
              <span className="mr-3 inline-block h-px w-8 translate-y-[-3px] bg-scarlet align-middle" />
              {kicker}
            </p>
          )}
          {title && (
            <h2 className="display text-[clamp(2.1rem,6.4vw,5.2rem)]" data-reveal>
              {title}
            </h2>
          )}
          {lead && (
            <p
              className="mt-7 max-w-2xl text-base leading-relaxed text-ash sm:text-lg"
              data-reveal
              data-reveal-delay="0.08"
            >
              {lead}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
