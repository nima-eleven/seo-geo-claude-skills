import Image from 'next/image';
import { about } from '@/content/experience';
import { realValue, site } from '@/content/site';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/**
 * Two parts: a narrative bio, then a structured professional history rendered
 * from `experience.ts`. The history is a definition list rather than a
 * decorative graphic — a CV is read, not admired.
 */
export function About() {
  const portrait = realValue(about.portraitImage);
  const cvUrl = realValue(site.contact.cvPdfUrl);
  const credentials = about.credentials.filter((group) => group.entries.length);

  return (
    <Reveal
      as="section"
      id="about"
      labelledBy="about-heading"
      sectionId="about"
      className="section-y"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Part A — narrative bio, asymmetric against the portrait. */}
          <div className="lg:col-span-7">
            <SectionHeading
              id="about-heading"
              eyebrow={about.eyebrow}
              heading={about.heading}
            />

            <div className="measure mt-8 space-y-5 text-graphite">
              {about.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>

            {cvUrl ? (
              <p className="mt-8">
                <a
                  className="btn btn-ghost"
                  href={cvUrl}
                  target="_blank"
                  rel="noopener"
                >
                  Download CV
                  <span className="sr-only-custom"> (PDF, opens in a new tab)</span>
                </a>
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            {portrait ? (
              <Image
                src={portrait}
                alt={about.portraitAlt}
                width={560}
                height={700}
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="aspect-4/5 w-full rounded-[4px] object-cover"
              />
            ) : null}
          </div>
        </div>

        {/* Part B — structured professional history. */}
        {about.history.length ? (
          <div className="mt-16 border-t border-sage-mist pt-12 md:mt-24">
            <h3 className="mono text-graphite">Professional history</h3>

            <dl className="mt-8 space-y-0">
              {about.history.map((entry) => (
                <div
                  key={`${entry.yearRange}-${entry.role}`}
                  className="grid gap-2 border-b border-sage-mist py-7 md:grid-cols-12 md:gap-8"
                >
                  <dt className="mono pt-1 text-graphite md:col-span-3">
                    {entry.yearRange}
                  </dt>
                  <dd className="md:col-span-9">
                    <p className="display-md">{entry.role}</p>
                    <p className="mt-1 text-graphite">{entry.organization}</p>
                    <p className="measure mt-3 text-[0.9375rem] text-graphite">
                      {entry.scope}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {credentials.length ? (
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {credentials.map((group) => (
              <div key={group.heading}>
                <h3 className="mono text-graphite">{group.heading}</h3>
                <ul className="mt-4 space-y-2 text-[0.9375rem]">
                  {group.entries.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
