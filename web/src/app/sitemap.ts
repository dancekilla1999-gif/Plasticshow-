import type { MetadataRoute } from 'next';
import { SITE, NAV } from '@/content/site';
import { SHOWS } from '@/content/shows';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = NAV.map((item) => ({
    url: `${SITE.url}${item.href === '/' ? '' : item.href}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: item.href === '/' ? 1 : 0.8,
  }));

  const shows = SHOWS.map((show) => ({
    url: `${SITE.url}/shows/${show.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...pages, ...shows];
}
