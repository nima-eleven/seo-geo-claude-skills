'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

/**
 * Fires `article_read` once the visitor has scrolled 75% of the article.
 *
 * Scroll depth, not time on page: it is the only cheap signal that separates a
 * reader from a bounce. Renders nothing.
 */
export function ArticleProgress({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (fired.current) return;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      if (window.scrollY / scrollable >= 0.75) {
        fired.current = true;
        track('article_read', { slug });
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  return null;
}
