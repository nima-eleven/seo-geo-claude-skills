import Image from 'next/image';
import { site, realValue } from '@/content/site';
import { CtaLink } from './CtaLink';

/**
 * The hero answers "who is this and what does she fix" before the visitor
 * scrolls. Asymmetric: 60% type, 40% portrait with a sage block offset behind
 * it. No stock photography, no gradient mesh, no dashboard mockup.
 */
export function Hero({ hasWatch }: { hasWatch: boolean }) {
  const portrait = realValue(site.hero.portraitImage);

  return (
    <section id="hero" aria-labelledby="hero-heading" className="pb-16 pt-12 md:pb-28 md:pt-20">
      <div className="shell grid items-center gap-12 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-3">
          <p className="eyebrow mono rise" style={{ animationDelay: '0ms' }}>
            {site.hero.eyebrow}
          </p>

          <h1
            id="hero-heading"
            className="display-xl rise mt-6"
            style={{ animationDelay: '60ms' }}
          >
            {site.hero.headline}
          </h1>

          <p
            className="lede rise measure mt-6"
            style={{ animationDelay: '120ms' }}
          >
            {site.hero.subheadline}
          </p>

          <div
            className="rise mt-9 flex flex-wrap gap-3"
            style={{ animationDelay: '180ms' }}
          >
            <CtaLink href="#contact-form" location="hero" label="start_conversation">
              {site.hero.primaryCta}
            </CtaLink>
            {/* Omitted rather than left dangling when the Watch section has
                no videos to show. */}
            {hasWatch ? (
              <CtaLink
                href="#watch"
                location="hero"
                label="watch_latest"
                variant="ghost"
              >
                {site.hero.secondaryCta}
              </CtaLink>
            ) : null}
          </div>

          <p
            className="mono rise mt-8 text-graphite"
            style={{ animationDelay: '240ms' }}
          >
            {site.hero.footnote}
          </p>
        </div>

        <div className="rise lg:col-span-2" style={{ animationDelay: '120ms' }}>
          <div className="relative mx-auto max-w-sm lg:max-w-none">
            {/* The offset block: the portrait's only decoration. */}
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -left-4 h-full w-full rounded-[4px] bg-sage-mist"
            />
            {portrait ? (
              <Image
                src={portrait}
                alt={site.hero.portraitAlt}
                width={640}
                height={800}
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="relative aspect-4/5 w-full rounded-[4px] object-cover"
              />
            ) : (
              /* No invented stock photograph. An explicit, sized slot that
                 holds its layout so swapping the real portrait in shifts
                 nothing. */
              <div
                className="relative flex aspect-4/5 w-full items-end rounded-[4px] border border-sage-mist bg-white p-6"
                role="img"
                aria-label="Portrait of Sofia Mo — image pending"
              >
                <span className="mono text-graphite">
                  {site.hero.portraitImage}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
