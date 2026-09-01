import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Media } from '@/components/ui/Media';
import { ButtonLink } from '@/components/ui/Button';
import { Lightbox } from '@/components/gallery/Lightbox';
import { SHOWS, CATEGORY_LABEL, getShow } from '@/content/shows';
import { SITE } from '@/content/site';
import { whatsappLink } from '@/lib/whatsapp';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SHOWS.map((show) => ({ slug: show.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const show = getShow(slug);
  if (!show) return { title: 'Постановка не найдена' };

  const description = `${show.title} — ${show.tagline}. ${show.intro}`;
  return {
    title: show.title,
    description,
    alternates: { canonical: `/shows/${show.slug}` },
    openGraph: {
      title: `${show.title} — ${SITE.name}`,
      description,
      images: [{ url: `/media/${show.cover}-1200.webp`, alt: show.title }],
    },
  };
}

export default async function ShowPage({ params }: Params) {
  const { slug } = await params;
  const show = getShow(slug);
  if (!show) notFound();

  const index = SHOWS.findIndex((s) => s.slug === show.slug);
  const next = SHOWS[(index + 1) % SHOWS.length];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TheaterEvent',
    name: show.title,
    description: show.intro,
    url: `${SITE.url}/shows/${show.slug}/`,
    image: `${SITE.url}/media/${show.cover}-1200.webp`,
    performer: { '@type': 'PerformingGroup', name: SITE.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero — tinted with the show's own palette. */}
      <header className="relative flex min-h-[86svh] items-end overflow-hidden pt-[var(--header-h)]">
        <div className="absolute inset-0">
          <Media
            slug={show.cover}
            alt={`${show.title} — ${show.tagline}`}
            sizes="100vw"
            priority
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/35" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-45 mix-blend-soft-light"
            style={{ background: `linear-gradient(180deg, transparent 30%, ${show.palette[1]})` }}
          />
        </div>

        <div className="relative w-full px-[var(--gutter)] pb-[clamp(3rem,7vw,6rem)] pt-[clamp(4rem,10vw,7rem)]">
          <nav aria-label="Хлебные крошки" className="kicker mb-8 flex flex-wrap items-center gap-2">
            <Link href="/shows" className="transition-colors hover:text-bone">Репертуар</Link>
            <span aria-hidden className="text-scarlet">/</span>
            <span className="text-bone/70">{CATEGORY_LABEL[show.category]}</span>
          </nav>

          <h1 className="display text-[clamp(2.5rem,12vw,11rem)]">
            <span className="line-mask"><span>{show.title}</span></span>
          </h1>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-xl text-base leading-relaxed text-bone/75 sm:text-lg" data-reveal>
              {show.intro}
            </p>
            <span
              aria-hidden
              className="display shrink-0 text-[clamp(1.2rem,3vw,2.4rem)] text-transparent [-webkit-text-stroke:1px_var(--color-bone)] opacity-35"
            >
              {show.latin}
            </span>
          </div>
        </div>
      </header>

      {/* Concept + facts */}
      <section className="px-[var(--gutter)] py-[clamp(4rem,10vw,8rem)]">
        <div className="grid gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="kicker mb-8" data-reveal>Концепция</p>
            <div className="max-w-2xl space-y-6 text-base leading-relaxed text-ash sm:text-lg">
              {show.body.map((paragraph, i) => (
                <p key={i} data-reveal data-reveal-delay={i * 0.05}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12 border-l-2 border-scarlet pl-7" data-reveal>
              <p className="kicker mb-3">Костюмы</p>
              <p className="text-base leading-relaxed text-bone/80">{show.costume}</p>
            </div>
          </div>

          <dl className="divide-y divide-bone/10 border-y border-bone/10" data-reveal-group>
            {show.facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-6 py-5" data-reveal>
                <dt className="kicker">{fact.label}</dt>
                <dd className="text-right text-sm text-bone/85">{fact.value}</dd>
              </div>
            ))}
            <div className="pt-8" data-reveal>
              <ButtonLink
                href={whatsappLink(
                  `Здравствуйте! Интересует постановка «${show.title}». Расскажите, пожалуйста, о деталях и стоимости.`,
                )}
                variant="scarlet"
              >
                Заказать «{show.title}» <span aria-hidden>→</span>
              </ButtonLink>
            </div>
          </dl>
        </div>
      </section>

      {/* Stills — opens the shared lightbox. */}
      <section className="px-[var(--gutter)] pb-[clamp(4rem,10vw,8rem)]">
        <p className="kicker mb-8" data-reveal>Кадры постановки</p>
        <Lightbox
          items={show.stills.map((slug, i) => ({
            slug,
            title: show.title,
            caption: `${show.title} — кадр ${i + 1}`,
          }))}
          className="grid gap-3 sm:grid-cols-3"
          tileClassName="aspect-[3/4]"
        />
      </section>

      {/* Next show — a full-bleed handover rather than a "back" link. */}
      <Link
        href={`/shows/${next.slug}`}
        data-cursor="Далее"
        className="group relative block h-[52svh] min-h-[320px] overflow-hidden"
      >
        <Media
          slug={next.cover}
          alt={next.title}
          sizes="100vw"
          className="h-full w-full object-cover opacity-40 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[var(--gutter)] text-center">
          <p className="kicker mb-5">Следующая постановка</p>
          <span className="display text-[clamp(2rem,8vw,6.5rem)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5">
            {next.title}
          </span>
          <span className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
            {next.tagline}
          </span>
        </div>
      </Link>
    </>
  );
}
