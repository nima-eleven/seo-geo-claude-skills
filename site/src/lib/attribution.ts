/**
 * UTM and referrer capture.
 *
 * This is what lets Sofia see which specific videos produce clients rather
 * than just views. Parameters are captured on the *first* visit of a session
 * and persisted in sessionStorage, so a visitor who lands from a tagged
 * YouTube link and then navigates around still submits the original
 * attribution rather than an internal referrer.
 */

const STORAGE_KEY = 'sofia_attribution_v1';

export interface Attribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  referrer: string;
  /** From `?v=` or `?video=` on the landing URL, when Sofia tags a link with it. */
  landing_video_id: string;
}

const EMPTY: Attribution = {
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
  referrer: '',
  landing_video_id: '',
};

/**
 * Reads attribution for this session, capturing it from the URL on first call.
 * Returns zeroed values on the server or when storage is unavailable
 * (private mode, storage disabled) rather than throwing.
 */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return EMPTY;

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) return { ...EMPTY, ...(JSON.parse(stored) as Attribution) };
  } catch {
    // Fall through to a fresh capture; storage may be blocked.
  }

  const params = new URLSearchParams(window.location.search);
  const captured: Attribution = {
    utm_source: params.get('utm_source') ?? '',
    utm_medium: params.get('utm_medium') ?? '',
    utm_campaign: params.get('utm_campaign') ?? '',
    utm_content: params.get('utm_content') ?? '',
    // An internal referrer tells us nothing, so only external ones are kept.
    referrer: isExternal(document.referrer) ? document.referrer : '',
    landing_video_id: params.get('v') ?? params.get('video') ?? '',
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // Attribution is best-effort; a blocked store is not an error.
  }

  return captured;
}

function isExternal(referrer: string): boolean {
  if (!referrer) return false;
  try {
    return new URL(referrer).origin !== window.location.origin;
  } catch {
    return false;
  }
}
