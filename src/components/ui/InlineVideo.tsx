'use client';

import { useRef, useState } from 'react';
import { Media } from './Media';
import type { ShowVideo } from '@/content/videos';

/**
 * Click-to-play player for a single show.
 *
 * Nothing is fetched until the visitor presses play: until then the poster is
 * the same responsive image the rest of the page uses, so the video costs no
 * bandwidth on a page someone only scrolls past.
 *
 * The frame takes the clip's own ratio. Most of the archive is vertical, and a
 * 9:16 recording dropped into a 16:9 box is mostly black bars — so a portrait
 * clip gets a narrow, centred stage instead, with the poster blurred behind it
 * to fill the width rather than leaving a void.
 */
export function InlineVideo({ video }: { video: ShowVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const { show, src, poster, portrait } = video;

  const start = () => {
    setStarted(true);
    // The element only gets a src on the first press, so play() has to wait
    // for React to attach it.
    requestAnimationFrame(() => ref.current?.play().catch(() => {}));
  };

  const stage = portrait
    ? 'mx-auto aspect-[9/16] w-full max-w-[min(26rem,58vh)]'
    : 'aspect-video w-full';

  return (
    <div className="relative overflow-hidden bg-graphite">
      {/* Blurred bed so a vertical clip sits in a lit room, not on a black slab. */}
      {portrait && (
        <div aria-hidden className="absolute inset-0">
          <Media
            slug={poster}
            alt=""
            sizes="100vw"
            className="h-full w-full scale-110 object-cover opacity-25 blur-2xl"
          />
        </div>
      )}

      <div className={`relative ${stage}`}>
        {!started && (
          <>
            <Media
              slug={poster}
              alt={show.title}
              sizes={portrait ? '(max-width: 640px) 100vw, 26rem' : '(max-width: 1024px) 100vw, 66vw'}
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/70 to-transparent" />
            <button
              type="button"
              onClick={start}
              data-cursor="Play"
              aria-label={`Смотреть видео: ${show.title}`}
              className="group absolute inset-0 flex items-center justify-center"
            >
              <span
                aria-hidden
                className="flex h-20 w-20 items-center justify-center rounded-full border border-bone/40 text-bone backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-bone group-hover:bg-bone group-hover:text-void"
              >
                ▶
              </span>
            </button>
          </>
        )}

        {started && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={ref}
            src={src}
            controls
            loop
            playsInline
            preload="metadata"
            width={video.w}
            height={video.h}
            className="h-full w-full bg-black object-contain"
          >
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        )}
      </div>
    </div>
  );
}
