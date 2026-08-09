import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Credibility } from '@/components/Credibility';
import { Fit } from '@/components/Fit';
import { Services } from '@/components/Services';
import { About } from '@/components/About';
import { Watch } from '@/components/Watch';
import { Insights } from '@/components/Insights';
import { Snapshot } from '@/components/Snapshot';
import { ContactForm } from '@/components/ContactForm';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { VideoListSchema } from '@/components/VideoListSchema';
import { getVideos } from '@/lib/youtube';
import { getArticles } from '@/lib/insights';

/**
 * The page.
 *
 * Ordering is deliberate and load-bearing: credibility precedes the ask, the
 * content proof (Watch, Insights) sits before the form so the visitor arrives
 * already convinced, and the Snapshot warms them immediately before it.
 *
 * Revalidated every six hours, which is what the YouTube section needs; every
 * other section is static.
 */
export const revalidate = 21600;

export default async function HomePage() {
  // Sections hide themselves when they have no real content, which would leave
  // the nav and the CTAs pointing at anchors that do not exist. So which
  // sections are present is decided once, here, and passed down.
  const { videos } = await getVideos();
  const sections = {
    watch: videos.length > 0,
    insights: getArticles().length > 0,
  };

  return (
    <>
      <Header sections={sections} />

      <main id="main">
        <Hero hasWatch={sections.watch} />
        <Credibility />
        <Fit />
        <Services />
        <About />
        <Watch />
        <Insights />
        <Snapshot />
        <ContactForm hasWatch={sections.watch} />
        <Contact />
      </main>

      <Footer sections={sections} />

      <VideoListSchema videos={videos} />
    </>
  );
}
