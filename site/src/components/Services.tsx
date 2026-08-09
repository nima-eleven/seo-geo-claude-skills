import { services } from '@/content/services';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { InterestLink } from './InterestLink';

/**
 * The three engagement types.
 *
 * The grid adapts to two, three or four entries so services.ts stays the only
 * file that decides how many there are. Numbered markers are justified here
 * because these are sequential stages of an engagement, not decoration.
 */
export function Services() {
  const columns =
    services.length <= 2
      ? 'md:grid-cols-2'
      : services.length === 4
        ? 'md:grid-cols-2 xl:grid-cols-4'
        : 'md:grid-cols-3';

  return (
    <Reveal
      as="section"
      id="services"
      labelledBy="services-heading"
      sectionId="services"
      className="section-y border-t border-sage-mist bg-white"
    >
      <div className="shell">
        <SectionHeading
          id="services-heading"
          eyebrow="Engagements"
          heading="How Sofia helps"
          intro="Three ways to work together. Most engagements start with the first and continue into one of the others."
        />

        <ul className={`mt-12 grid gap-px bg-sage-mist md:mt-16 ${columns}`}>
          {services.map((service, index) => (
            <li key={service.id} className="flex flex-col bg-white p-7 md:p-9">
              <p className="mono text-graphite">
                <span style={{ color: 'var(--color-brass-deep)' }}>
                  {String(index + 1).padStart(2, '0')}
                </span>{' '}
                / {service.label}
              </p>

              <h3 className="display-md mt-5">{service.title}</h3>

              <p className="mt-4 text-graphite">{service.description}</p>

              <ul className="mt-6 space-y-3 border-t border-sage-mist pt-6">
                {service.outputs.map((output) => (
                  <li key={output} className="flex gap-3 text-[0.9375rem]">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-evergreen"
                    />
                    <span>{output}</span>
                  </li>
                ))}
              </ul>

              {/* mt-auto keeps the CTA on a common baseline across cards of
                  unequal height. */}
              <p className="mono mt-auto pt-8 text-graphite">{service.format}</p>

              <p className="mt-4">
                <InterestLink interest={service.id} location="services">
                  Talk about this
                  <span className="sr-only-custom"> — {service.title}</span>
                </InterestLink>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
