import { mediaFallback, mediaMeta, mediaSources, type MediaSlug } from '@/lib/media';

type Props = {
  slug: MediaSlug;
  alt: string;
  sizes?: string;
  className?: string;
  /** Only the hero image on each page should set this. */
  priority?: boolean;
};

/**
 * Responsive picture backed by the pre-generated AVIF/WebP sets.
 *
 * Uses a plain <picture> rather than next/image because the build is a static
 * export: the variants already exist on disk, so there is nothing left to
 * optimise at request time. The inline LQIP keeps the layout warm while the
 * real file streams in.
 */
export function Media({ slug, alt, sizes = '100vw', className, priority = false }: Props) {
  const meta = mediaMeta(slug);

  return (
    <picture>
      <source type="image/avif" srcSet={mediaSources(slug, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={mediaSources(slug, 'webp')} sizes={sizes} />
      <img
        src={mediaFallback(slug)}
        alt={alt}
        width={meta.width}
        height={meta.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={className}
        style={{
          backgroundImage: `url(${meta.lqip})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </picture>
  );
}
