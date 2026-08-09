/**
 * YouTube data, fetched server-side with a three-step degradation path.
 *
 *   1. Data API v3   — full data including duration and view counts
 *   2. RSS feed      — no API key, 15 most recent, no duration or statistics
 *   3. videos.ts     — the manual list committed to the repo
 *
 * A failed API call must never render an empty section or a broken layout,
 * so every step falls through to the next and the caller always receives a
 * well-formed result carrying the source it came from.
 */

import { fallbackVideos, type VideoItem } from '@/content/videos';

export interface VideoLibrary {
  videos: VideoItem[];
  source: 'api' | 'rss' | 'manual' | 'none';
}

/** Six hours. Quota cost at this frequency is trivial. */
const REVALIDATE_SECONDS = 21_600;
const MAX_RESULTS = 10;

export async function getVideos(): Promise<VideoLibrary> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (apiKey && channelId) {
    const viaApi = await fromDataApi(apiKey, channelId).catch((error) => {
      console.error('[youtube] Data API failed, falling back to RSS:', error);
      return null;
    });
    if (viaApi?.length) return { videos: viaApi, source: 'api' };
  }

  if (channelId) {
    const viaRss = await fromRss(channelId).catch((error) => {
      console.error('[youtube] RSS failed, falling back to videos.ts:', error);
      return null;
    });
    if (viaRss?.length) return { videos: viaRss, source: 'rss' };
  }

  return {
    videos: fallbackVideos,
    source: fallbackVideos.length ? 'manual' : 'none',
  };
}

/* -------------------------------------------------------------------------- */
/* Source 1: Data API v3                                                       */
/* -------------------------------------------------------------------------- */

async function fromDataApi(
  apiKey: string,
  channelId: string,
): Promise<VideoItem[]> {
  const playlistId =
    process.env.YOUTUBE_UPLOADS_PLAYLIST_ID ||
    (await resolveUploadsPlaylist(apiKey, channelId));

  if (!playlistId) return [];

  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('part', 'snippet,contentDetails');
  url.searchParams.set('playlistId', playlistId);
  url.searchParams.set('maxResults', String(MAX_RESULTS));
  url.searchParams.set('key', apiKey);

  const data = await fetchJson<PlaylistItemsResponse>(url);
  const items = (data.items ?? []).filter((item) =>
    Boolean(item.contentDetails?.videoId),
  );
  if (!items.length) return [];

  // Durations come from a second call. If it fails the cards still render,
  // just without the duration line — so this is deliberately non-fatal.
  const ids = items.map((item) => item.contentDetails.videoId);
  const durations = await fetchDurations(apiKey, ids).catch(
    (): Record<string, string> => ({}),
  );

  return items.map((item) => ({
    id: item.contentDetails.videoId,
    title: item.snippet.title,
    publishedAt:
      item.contentDetails.videoPublishedAt ?? item.snippet.publishedAt,
    description: item.snippet.description ?? '',
    thumbnail: bestThumbnail(item.snippet.thumbnails),
    duration: durations[item.contentDetails.videoId],
  }));
}

async function resolveUploadsPlaylist(
  apiKey: string,
  channelId: string,
): Promise<string | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'contentDetails');
  url.searchParams.set('id', channelId);
  url.searchParams.set('key', apiKey);

  const data = await fetchJson<ChannelsResponse>(url);
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

async function fetchDurations(
  apiKey: string,
  ids: string[],
): Promise<Record<string, string>> {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'contentDetails');
  url.searchParams.set('id', ids.join(','));
  url.searchParams.set('key', apiKey);

  const data = await fetchJson<VideosResponse>(url);
  const durations: Record<string, string> = {};
  for (const item of data.items ?? []) {
    const formatted = formatDuration(item.contentDetails?.duration);
    if (formatted) durations[item.id] = formatted;
  }
  return durations;
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`${url.pathname} responded ${response.status}`);
  }
  return (await response.json()) as T;
}

/* -------------------------------------------------------------------------- */
/* Source 2: RSS                                                               */
/* -------------------------------------------------------------------------- */

async function fromRss(channelId: string): Promise<VideoItem[]> {
  const response = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
    { next: { revalidate: REVALIDATE_SECONDS } },
  );
  if (!response.ok) throw new Error(`RSS responded ${response.status}`);

  const xml = await response.text();
  const entries = xml.split('<entry>').slice(1);

  return entries.slice(0, MAX_RESULTS).flatMap((entry) => {
    const id = between(entry, '<yt:videoId>', '</yt:videoId>');
    const title = between(entry, '<title>', '</title>');
    if (!id || !title) return [];

    return [
      {
        id,
        title: decodeXmlEntities(title),
        publishedAt: between(entry, '<published>', '</published>') ?? '',
        description: decodeXmlEntities(
          between(entry, '<media:description>', '</media:description>') ?? '',
        ),
      },
    ];
  });
}

function between(source: string, open: string, close: string): string | null {
  const start = source.indexOf(open);
  if (start === -1) return null;
  const end = source.indexOf(close, start + open.length);
  if (end === -1) return null;
  return source.slice(start + open.length, end);
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                              */
/* -------------------------------------------------------------------------- */

function bestThumbnail(thumbnails?: Thumbnails): string | undefined {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url
  );
}

/** ISO 8601 duration (PT12M4S) to a display string (12:04). */
export function formatDuration(iso?: string): string | undefined {
  if (!iso) return undefined;
  const match = /^P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return undefined;

  const [hours, minutes, seconds] = [match[1], match[2], match[3]].map((part) =>
    part ? Number(part) : 0,
  );

  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/* -------------------------------------------------------------------------- */
/* API response shapes — only the fields actually read                         */
/* -------------------------------------------------------------------------- */

interface Thumbnail {
  url: string;
}
interface Thumbnails {
  medium?: Thumbnail;
  high?: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}
interface ChannelsResponse {
  items?: {
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }[];
}
interface PlaylistItemsResponse {
  items?: {
    snippet: {
      title: string;
      description?: string;
      publishedAt: string;
      thumbnails?: Thumbnails;
    };
    contentDetails: { videoId: string; videoPublishedAt?: string };
  }[];
}
interface VideosResponse {
  items?: { id: string; contentDetails?: { duration?: string } }[];
}
