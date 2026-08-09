/**
 * Manual fallback video list.
 *
 * This is the last of three data sources for the Watch section (API → RSS →
 * this file). It exists so a failed API call renders a real section rather
 * than an empty one. Populate it with a handful of evergreen videos and it
 * will only ever be seen if both live sources fail.
 *
 * When this array is empty and both live sources fail, the Watch section
 * hides itself rather than rendering a broken layout.
 */

export interface VideoItem {
  /** YouTube video ID, the 11-character form. */
  id: string;
  title: string;
  /** ISO 8601 date string. */
  publishedAt: string;
  description: string;
  /** Optional. Falls back to the standard thumbnail URLs when omitted. */
  thumbnail?: string;
  /** Optional, e.g. "12:04". Only the API source can supply this. */
  duration?: string;
}

export const fallbackVideos: VideoItem[] = [
  // Example shape — replace with real videos, or leave empty.
  // {
  //   id: 'dQw4w9WgXcQ',
  //   title: 'Why your team keeps escalating decisions to you',
  //   publishedAt: '2025-01-15T09:00:00Z',
  //   description: 'The three conditions a decision needs before someone else can own it.',
  // },
];

/** Thumbnail URL with a graceful drop from maxres to hq. */
export function thumbnailUrl(id: string, quality: 'maxres' | 'hq' = 'maxres') {
  return `https://i.ytimg.com/vi/${id}/${quality}default.jpg`;
}
