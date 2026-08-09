'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { track } from '@/lib/analytics';

/**
 * Fades content in once as it enters the viewport, and fires `section_view`
 * when the section is half visible.
 *
 * Content starts visible and is only hidden after mount, so a visitor without
 * JavaScript — or one who lands mid-page — never sees a blank section. Under
 * `prefers-reduced-motion` the CSS neutralises the transform and opacity, so
 * this component becomes a pure analytics observer.
 */
export function Reveal({
  children,
  className = '',
  /** Fires `section_view` with this id. Omit to skip the event. */
  sectionId,
  /** Delay in ms, for staggering siblings. */
  delay = 0,
  as: Tag = 'div',
  id,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  sectionId?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li';
  /** Anchor target. Set this on sections so `/#fit` scrolls correctly. */
  id?: string;
  /** id of the heading that names this section. */
  labelledBy?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(true);
  const viewTracked = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Only hide once we know we can reveal again.
    if (!('IntersectionObserver' in window)) return;
    setRevealed(false);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.15) setRevealed(true);

          if (
            sectionId &&
            !viewTracked.current &&
            entry.intersectionRatio >= 0.5
          ) {
            viewTracked.current = true;
            track('section_view', { section_id: sectionId });
          }
        }
      },
      { threshold: [0.15, 0.5] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sectionId]);

  return (
    <Tag
      ref={ref as never}
      id={id}
      aria-labelledby={labelledBy}
      className={`reveal ${className}`}
      data-revealed={revealed}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
