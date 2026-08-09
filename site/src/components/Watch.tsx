import { getVideos } from '@/lib/youtube';
import { realValue, site } from '@/content/site';
import { formatDate } from '@/lib/insights';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { VideoFacade } from './VideoFacade';
import { SubscribeButton } from './SubscribeButton';

/**
 * The Watch section closes the loop with the traffic source.
 *
 * A Server Component: the YouTube fetch happens at build/revalidation time,
 * never in the browser. When no source yields videos the whole section is
 * omitted rather than rendering an empty grid.
 */
export async function Watch() {
  const { videos } = await getVideos();
  if (!videos.length) return null;

  const [featured, ...rest] = videos;
  const grid = rest.slice(0, 9);
  const channelHandle = realValue(site.contact.channelHandle);

  return (
    <Reveal
      as="section"
      id="watch"
      labelledBy="watch-heading"
      sectionId="watch"
      className="section-y border-t border-sage-mist bg-white"
    >
      <div className="shell">
        <SectionHeading
          id="watch-heading"
          eyebrow="Watch"
          heading="Thinking, on video"
          intro="The channel is where the ideas get worked out in public. It is evidence of how I think, not the product."
        />

        {/* Featured: most recent, or whichever video is pinned first in the
            manual fallback list. */}
        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <VideoFacade video={featured} position={1} featured />
          </div>

          <div className="lg:col-span-5 lg:pt-2">
            <p className="mono text-graphite">
              Latest
              {featured.publishedAt ? ` · ${formatDate(featured.publishedAt)}` : ''}
              {featured.duration ? ` · ${featured.duration}` : ''}
            </p>
            <h3 className="display-md mt-4">{featured.title}</h3>
            {featured.description ? (
              <p className="clamp-3 mt-4 text-graphite">{featured.description}</p>
            ) : null}
          </div>
        </div>

        {grid.length ? (
          <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((video, index) => (
              <li key={video.id}>
                <VideoFacade video={video} position={index + 2} />
                <p className="mono mt-4 text-graphite">
                  {video.publishedAt ? formatDate(video.publishedAt) : ''}
                  {video.duration ? ` · ${video.duration}` : ''}
                </p>
                <h3 className="clamp-2 mt-2 text-[1.0625rem] leading-snug">
                  {video.title}
                </h3>
              </li>
            ))}
          </ul>
        ) : null}

        {channelHandle ? (
          <div className="mt-14 border-t border-sage-mist pt-10">
            <SubscribeButton
              href={`https://www.youtube.com/${channelHandle}?sub_confirmation=1`}
              location="watch"
            />
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
