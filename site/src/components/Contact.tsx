import { realValue, site } from '@/content/site';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { CtaLink } from './CtaLink';

/**
 * Direct contact methods, for the visitor who would rather not use a form.
 * No embedded map: it adds weight and serves no purpose for a consulting
 * practice.
 */
export function Contact() {
  const email = realValue(site.contact.email);
  const phone = realValue(site.contact.phone);
  const linkedin = realValue(site.contact.linkedinUrl);
  const youtube = realValue(site.contact.youtubeUrl);
  const calendar = realValue(site.contact.calendarUrl);
  const location = realValue(site.contact.location);

  const channels = [
    email ? { label: 'Email', value: email, href: `mailto:${email}` } : null,
    phone ? { label: 'Phone', value: phone, href: `tel:${phone.replace(/\s+/g, '')}` } : null,
    linkedin ? { label: 'LinkedIn', value: 'Connect on LinkedIn', href: linkedin } : null,
    youtube ? { label: 'YouTube', value: 'Watch the channel', href: youtube } : null,
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  // Nothing real to show yet — better an absent section than an empty one.
  if (!channels.length && !calendar && !location) return null;

  return (
    <Reveal
      as="section"
      id="contact"
      labelledBy="contact-heading"
      sectionId="contact"
      className="section-y"
    >
      <div className="shell">
        <SectionHeading
          id="contact-heading"
          eyebrow="Contact"
          heading="Other ways to reach me"
        />

        {channels.length ? (
          <dl className="mt-10 grid gap-px border border-sage-mist bg-sage-mist sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel) => (
              <div key={channel.label} className="bg-white p-6">
                <dt className="mono text-graphite">{channel.label}</dt>
                <dd className="mt-3">
                  <a
                    className="link-underline break-words"
                    href={channel.href}
                    {...(channel.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener' }
                      : {})}
                  >
                    {channel.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-6">
          {/* The booking slot exists in the layout but is hidden until a real
              calendar URL is supplied. */}
          {calendar ? (
            <CtaLink
              href={calendar}
              location="contact"
              label="book_a_call"
              variant="ghost"
            >
              Book a call
            </CtaLink>
          ) : null}

          {location ? <p className="mono text-graphite">{location}</p> : null}
        </div>
      </div>
    </Reveal>
  );
}
