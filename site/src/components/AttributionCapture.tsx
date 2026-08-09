'use client';

import { useEffect } from 'react';
import { getAttribution } from '@/lib/attribution';

/**
 * Captures UTM parameters and the referrer on arrival.
 *
 * This has to happen on load, not at submit time. A visitor who lands on a
 * tagged link, reads an article, and then comes back to the form would
 * otherwise submit with no attribution at all — the parameters are long gone
 * from the URL by then, and the referrer is internal. Calling `getAttribution`
 * here persists the original values for the rest of the session.
 *
 * Mounted in the root layout so it covers every entry point, not just the
 * landing page. Renders nothing.
 */
export function AttributionCapture() {
  useEffect(() => {
    getAttribution();
  }, []);

  return null;
}
