import { ButtonLink } from './Button';
import { Media } from './Media';
import type { MediaSlug } from '@/lib/media';

/** Closing call-to-action used at the foot of most pages. */
export function CTABand({
  kicker = 'Заявка',
  title,
  text,
  primary = { href: '/contact', label: 'Обсудить шоу' },
  secondary,
  media = 'fans-stage',
}: {
  kicker?: string;
  title: React.ReactNode;
  text: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  media?: MediaSlug;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Media
          slug={media}
          alt=""
          sizes="100vw"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void/85 to-void" />
      </div>

      <div className="relative px-[var(--gutter)] py-[clamp(5rem,13vw,10rem)] text-center">
        <p className="kicker mb-7" data-reveal>{kicker}</p>
        <h2 className="display mx-auto max-w-4xl text-[clamp(2rem,6.4vw,5rem)]" data-reveal>
          {title}
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ash" data-reveal>
          {text}
        </p>
        <div className="mt-11 flex flex-wrap items-center justify-center gap-3" data-reveal>
          <ButtonLink href={primary.href} variant="solid">
            {primary.label}
            <span aria-hidden>→</span>
          </ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="outline">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
