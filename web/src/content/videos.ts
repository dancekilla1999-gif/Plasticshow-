import type { MediaSlug } from './media.generated';

/**
 * Showreel and video content.
 *
 * No video files were supplied with the project materials, so this list is
 * empty and the /video page renders its "awaiting footage" state. Drop the MP4s
 * into `public/video/` and add entries here — the page, the hero showreel
 * button and the JSON-LD all read from this one array.
 */
export type Video = {
  id: string;
  title: string;
  kicker: string;
  /** Path under /public, e.g. '/video/showreel.mp4'. */
  src: string;
  /** Poster frame — any slug from the media manifest. */
  poster: MediaSlug;
  duration?: string;
  description?: string;
};

export const VIDEOS: Video[] = [];

/** The single reel featured in the hero, if one exists. */
export const SHOWREEL: Video | null = VIDEOS[0] ?? null;
