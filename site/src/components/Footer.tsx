import { realValue, site } from '@/content/site';
import type { PageSections } from '@/lib/sections';
import { SubscribeButton } from './SubscribeButton';

export function Footer({ sections }: { sections?: PageSections }) {
  // The footer also renders on the article and privacy routes, where the
  // landing page's optional sections are not in scope. Defaulting both to true
  // keeps those anchors working, since they resolve against `/` anyway.
  const { watch = true, insights = true } = sections ?? {};

  const NAV = [
    { href: '/#services', label: 'Services' },
    { href: '/#about', label: 'About' },
    ...(watch ? [{ href: '/#watch', label: 'Watch' }] : []),
    ...(insights ? [{ href: '/insights', label: 'Insights' }] : []),
    { href: '/#contact-form', label: 'Contact' },
  ];

  const channelHandle = realValue(site.contact.channelHandle);
  const socials = site.socials
    .map((social) => ({ ...social, href: realValue(social.href) }))
    .filter((social): social is { label: string; href: string } =>
      Boolean(social.href),
    );

  // Build year is fixed at build time — it should not drift with the visitor's
  // clock, and rendering it on the client would cause a hydration mismatch.
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="border-t border-sage-mist bg-white">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p
              className="text-2xl"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              {site.name}
            </p>
            <p className="mono mt-2 text-graphite">{site.role}</p>
            <p className="measure-tight mt-5 text-[0.9375rem] text-graphite">
              {site.meta.description}
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <h2 className="mono text-graphite">Navigate</h2>
            <ul className="mt-4 space-y-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a className="link-underline text-[0.9375rem]" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            {socials.length ? (
              <>
                <h2 className="mono text-graphite">Elsewhere</h2>
                <ul className="mt-4 space-y-2">
                  {socials.map((social) => (
                    <li key={social.label}>
                      <a
                        className="link-underline text-[0.9375rem]"
                        href={
                          social.label === 'Email'
                            ? `mailto:${social.href}`
                            : social.href
                        }
                        {...(social.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener' }
                          : {})}
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {/* Closes the retention loop: a visitor who is not ready to enquire
                can still become a subscriber. */}
            {channelHandle ? (
              <div className="mt-8">
                <SubscribeButton
                  href={`https://www.youtube.com/${channelHandle}?sub_confirmation=1`}
                  location="footer"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mono mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-sage-mist pt-8 text-graphite">
          <p>
            © {year} {site.name}
          </p>
          <p className="flex gap-6">
            <a className="link-underline" href="/privacy">
              Privacy policy
            </a>
            <span>Built {year}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
