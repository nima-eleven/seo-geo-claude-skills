/**
 * The MDX article pipeline.
 *
 * Articles are `.mdx` files in `src/content/insights/`. Frontmatter is parsed
 * with gray-matter and validated here, so a malformed post fails loudly at
 * build time instead of rendering a broken card. Posts marked `draft: true`
 * are excluded everywhere except local development.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface Article {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readingTime: string;
  tags: string[];
  coverImage?: string;
  draft: boolean;
  /** Raw MDX body, rendered by the article route. */
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'insights');

/** All publishable articles, newest first. */
export function getArticles(): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => parseArticle(file))
    .filter((article) => !article.draft)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getArticle(slug: string): Article | null {
  return getArticles().find((article) => article.slug === slug) ?? null;
}

function parseArticle(filename: string): Article {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf8');
  const { data, content } = matter(raw);
  const fallbackSlug = filename.replace(/\.mdx$/, '');

  // Fail at build rather than shipping a card with a missing title or date.
  for (const field of ['title', 'date'] as const) {
    if (!data[field]) {
      throw new Error(
        `Article "${filename}" is missing required frontmatter field "${field}".`,
      );
    }
  }

  const date = new Date(data.date);
  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Article "${filename}" has an unparseable date: "${String(data.date)}". Use YYYY-MM-DD.`,
    );
  }

  return {
    slug: String(data.slug ?? fallbackSlug),
    title: String(data.title),
    date: date.toISOString(),
    excerpt: String(data.excerpt ?? ''),
    readingTime: String(data.readingTime ?? estimateReadingTime(content)),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    draft: Boolean(data.draft),
    content,
  };
}

/** 200 words per minute, rounded up. Close enough to be useful, cheap to compute. */
function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

/** Consistent date rendering across cards, articles and structured data. */
export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
