import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/content/site';
import { getArticles } from '@/lib/insights';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();
  const now = new Date();

  return [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: absoluteUrl('/insights'),
      lastModified: articles[0] ? new Date(articles[0].date) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...articles.map((article) => ({
      url: absoluteUrl(`/insights/${article.slug}`),
      lastModified: new Date(article.date),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    {
      url: absoluteUrl('/privacy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
