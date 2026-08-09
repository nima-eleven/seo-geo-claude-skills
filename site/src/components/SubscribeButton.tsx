'use client';

import { track } from '@/lib/analytics';

/**
 * The outbound subscribe link — the retention loop back to YouTube.
 * Tracked separately from `cta_click` so the loop can be measured on its own.
 */
export function SubscribeButton({
  href,
  location,
  variant = 'ghost',
}: {
  href: string;
  /** Where on the page this instance lives, e.g. "watch", "footer". */
  location: string;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`btn btn-${variant}`}
      onClick={() => track('youtube_subscribe_click', { location })}
    >
      Subscribe on YouTube
      <span className="sr-only-custom"> (opens in a new tab)</span>
    </a>
  );
}
