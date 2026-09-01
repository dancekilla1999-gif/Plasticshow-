/**
 * Video on the site.
 *
 * Every piece with a usable recording in the studio archive gets a ~12-second
 * preview at /video/<slug>.mp4 — 720p on the long side, H.264, faststart.
 * The source material is 4K phone footage at 30–90 Mbit/s, one to two orders
 * of magnitude more than a web page should carry; the previews are ~1.7 MB.
 *
 * There is no hand-kept list: `scripts/prepare-video.mjs` reads public/video
 * and writes the manifest below, so a show has video exactly when its file
 * exists. Most of the archive is shot vertically on a phone, so the real
 * dimensions travel with each clip and every player reserves the right box
 * instead of letterboxing a 9:16 frame into a 16:9 one.
 */
import { SHOWS, type Show } from './shows';
import { VIDEO_MANIFEST, type VideoMeta } from './video.generated';

export type ShowVideo = {
  show: Show;
  src: string;
  poster: Show['cover'];
  /** Taller than it is wide — true for most of the archive. */
  portrait: boolean;
} & VideoMeta;

const manifest: Record<string, VideoMeta> = VIDEO_MANIFEST;

/** Preview for a show, or null where the archive has no recording. */
export function videoFor(show: Show): ShowVideo | null {
  const meta = manifest[show.slug];
  if (!meta) return null;
  return { show, src: `/video/${show.slug}.mp4`, poster: show.cover, portrait: meta.h > meta.w, ...meta };
}

export const SHOW_VIDEOS: ShowVideo[] = SHOWS.map(videoFor).filter(
  (v): v is ShowVideo => v !== null,
);

export function hasVideo(slug: string): boolean {
  return slug in manifest;
}

/**
 * Backdrop clips for the opening frame. The archive is shot on phones, so the
 * landscape and portrait cuts come from different numbers rather than from one
 * crop — a 9:16 frame centre-cropped to 16:9 loses the dancers' feet.
 */
export const HERO_VIDEO_LANDSCAPE = '/video/hero-landscape.mp4';
export const HERO_VIDEO_PORTRAIT = '/video/hero-portrait.mp4';
