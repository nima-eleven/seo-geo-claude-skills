import { absoluteUrl, site } from '@/content/site';
import { getArticles } from '@/lib/insights';

/** RSS 2.0 feed for the Insights articles. */
export async function GET() {
  const articles = getArticles();

  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/insights/${article.slug}`);
      return [
        '    <item>',
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(article.date).toUTCString()}</pubDate>`,
        article.excerpt
          ? `      <description>${escapeXml(article.excerpt)}</description>`
          : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — Insights`)}</title>
    <link>${absoluteUrl('/insights')}</link>
    <description>${escapeXml(site.meta.description)}</description>
    <language>en</language>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
