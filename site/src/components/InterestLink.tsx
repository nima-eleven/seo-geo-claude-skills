'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';

/**
 * "Talk about this" — scrolls to the form and preselects the matching option
 * in the interest dropdown.
 *
 * The href is a plain `#contact-form` anchor so the link still works without
 * JavaScript; the preselection rides on a custom event the form listens for.
 * (`#contact-form?interest=x` would not work: everything after `#` is one
 * fragment identifier, so no element would match and the page would not scroll.)
 */
export const PRESELECT_INTEREST_EVENT = 'sofia:preselect-interest';

export function InterestLink({
  interest,
  location,
  children,
}: {
  interest: string;
  location: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#contact-form"
      className="link-underline"
      onClick={() => {
        track('cta_click', { location, label: `talk_about_${interest}` });
        window.dispatchEvent(
          new CustomEvent(PRESELECT_INTEREST_EVENT, { detail: interest }),
        );
      }}
    >
      {children}
    </a>
  );
}
