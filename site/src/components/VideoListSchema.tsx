import type { VideoItem } from '@/content/videos';
import { thumbnailUrl } from '@/content/videos';
import { JsonLd } from './StructuredData';

/**
 * An ItemList of VideoObject for the Watch section.
 *
 * Emitted only when there are videos, so the page never advertises an empty
 * list. Kept separate from the Person/ProfessionalService graph because it
 * depends on a fetch that can fail.
 */
export function VideoListSchema({ videos }: { videos: VideoItem[] }) {
  if (!videos.length) return null;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: videos.map((video, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'VideoObject',
            name: video.title,
            description: video.description || video.title,
            thumbnailUrl: video.thumbnail ?? thumbnailUrl(video.id, 'hq'),
            uploadDate: video.publishedAt || undefined,
            contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
          },
        })),
      }}
    />
  );
}
