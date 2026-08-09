/**
 * Analytics event layer.
 *
 * The premise of this site is that a YouTube view is not enough, so measurement
 * is a first-class requirement. Every event in the spec's table goes through
 * `track()`, which is a safe no-op when no analytics script is loaded — so the
 * site behaves identically with or without NEXT_PUBLIC_ANALYTICS_DOMAIN set.
 */

export type AnalyticsEvent =
  | 'cta_click'
  | 'section_view'
  | 'video_card_click'
  | 'youtube_subscribe_click'
  | 'snapshot_start'
  | 'snapshot_complete'
  | 'form_start'
  | 'form_submit_success'
  | 'form_submit_error'
  | 'article_read';

type Props = Record<string, string | number | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
    dataLayer?: unknown[];
  }
}

/** Fires an event to whichever analytics tool is present. Never throws. */
export function track(event: AnalyticsEvent, props?: Props): void {
  if (typeof window === 'undefined') return;

  // Strip undefined so tools do not record empty-string properties.
  const clean: Props = {};
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value !== undefined && value !== '') clean[key] = value;
  }

  try {
    if (typeof window.plausible === 'function') {
      window.plausible(event, Object.keys(clean).length ? { props: clean } : undefined);
    }
    // GA4 via gtag's dataLayer, for the case where Sofia is already on Google.
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...clean });
    }
  } catch {
    // Analytics must never break the page.
  }
}
