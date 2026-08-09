'use client';

import { useState } from 'react';
import Image from 'next/image';
import { thumbnailUrl, type VideoItem } from '@/content/videos';
import { track } from '@/lib/analytics';

/**
 * A YouTube facade: thumbnail plus play button, swapping in the iframe only on
 * click.
 *
 * This is mandatory rather than an optimisation. Nine live iframes on load
 * would each pull in the YouTube player bundle and destroy the Largest
 * Contentful Paint budget. The facade costs one image.
 *
 * The swapped-in player uses youtube-nocookie.com so no tracking cookie is set
 * for visitors who never press play.
 */
export function VideoFacade({
  video,
  position,
  featured = false,
}: {
  video: VideoItem;
  /** 1-based index, reported to analytics. */
  position: number;
  featured?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  // maxresdefault does not exist for every video; YouTube serves a 120x90
  // placeholder instead, which we detect on error and swap for hqdefault.
  const [src, setSrc] = useState(video.thumbnail ?? thumbnailUrl(video.id, 'maxres'));

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-ink">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        track('video_card_click', { video_id: video.id, position });
        setPlaying(true);
      }}
      className="group relative block aspect-video w-full overflow-hidden rounded-[4px] border border-sage-mist bg-sage-mist"
      aria-label={`Play video: ${video.title}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={featured ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
        className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
        onError={() => setSrc(thumbnailUrl(video.id, 'hq'))}
        unoptimized
      />

      <span
        aria-hidden="true"
        className="absolute inset-0 bg-ink/10 transition-colors duration-150 group-hover:bg-ink/20"
      />

      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform duration-150 group-hover:scale-105"
      >
        <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
          <path d="M0 0v18l16-9L0 0z" fill="var(--color-evergreen)" />
        </svg>
      </span>
    </button>
  );
}
