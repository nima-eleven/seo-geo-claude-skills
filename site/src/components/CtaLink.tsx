'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';

/**
 * An anchor-scrolling CTA that reports itself to analytics.
 *
 * Every primary and secondary call to action on the page goes through this so
 * `cta_click` is fired consistently with a `location` and a `label`, which is
 * what makes the funnel readable afterwards.
 */
export function CtaLink({
  href,
  location,
  label,
  variant = 'primary',
  className = '',
  children,
  onNavigate,
}: {
  href: string;
  /** Where on the page this CTA lives, e.g. "header", "hero". */
  location: string;
  /** Stable label for analytics, independent of visible copy changes. */
  label: string;
  variant?: 'primary' | 'ghost' | 'text';
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const base =
    variant === 'text' ? 'link-underline' : `btn btn-${variant}`;

  return (
    <a
      href={href}
      className={`${base} ${className}`.trim()}
      onClick={() => {
        track('cta_click', { location, label });
        onNavigate?.();
      }}
    >
      {children}
    </a>
  );
}
