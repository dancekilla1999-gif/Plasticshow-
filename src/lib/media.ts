import { MEDIA_MANIFEST, type MediaSlug } from '@/content/media.generated';

export type { MediaSlug };

/**
 * Builds the srcset/sizes pair for a pre-generated responsive image set.
 * The files themselves are produced by `npm run media`.
 */
export function mediaSources(slug: MediaSlug, format: 'avif' | 'webp') {
  const entry = MEDIA_MANIFEST[slug];
  return entry.widths.map((w) => `/media/${slug}-${w}.${format} ${w}w`).join(', ');
}

export function mediaFallback(slug: MediaSlug) {
  const entry = MEDIA_MANIFEST[slug];
  const widest = entry.widths[entry.widths.length - 1];
  return `/media/${slug}-${widest}.webp`;
}

export function mediaMeta(slug: MediaSlug) {
  return MEDIA_MANIFEST[slug];
}

export const ALL_MEDIA = Object.keys(MEDIA_MANIFEST) as MediaSlug[];
