import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Nothing under /api is useful to a crawler.
      disallow: '/api/',
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
