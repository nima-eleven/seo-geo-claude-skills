import { absoluteUrl, realValue, site } from '@/content/site';
import { services } from '@/content/services';
import { about } from '@/content/experience';

/**
 * JSON-LD for the practice: a Person for Sofia and a ProfessionalService for
 * the practice itself.
 *
 * Every URL is absolute — a relative URL in structured data is silently
 * dropped by consumers. Placeholder values are omitted rather than emitted,
 * so the graph never claims `{{LINKEDIN_URL}}` is a profile.
 */
export function StructuredData() {
  const sameAs = [
    realValue(site.contact.linkedinUrl),
    realValue(site.contact.youtubeUrl),
  ].filter(Boolean);

  const email = realValue(site.contact.email);
  const portrait = realValue(site.hero.portraitImage);
  const bioShort = realValue(about.bioShort);

  const person = {
    '@type': 'Person',
    '@id': absoluteUrl('/#person'),
    name: site.name,
    jobTitle: 'Management Consultant and Organizational Development Advisor',
    url: absoluteUrl('/'),
    ...(bioShort ? { description: bioShort } : {}),
    ...(email ? { email } : {}),
    ...(portrait ? { image: absoluteUrl(portrait) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const practice = {
    '@type': 'ProfessionalService',
    '@id': absoluteUrl('/#practice'),
    name: site.name,
    url: absoluteUrl('/'),
    description: site.meta.description,
    provider: { '@id': absoluteUrl('/#person') },
    areaServed: 'Worldwide',
    serviceType: services.map((service) => service.title),
    audience: {
      '@type': 'BusinessAudience',
      name: 'Small and medium-sized enterprises',
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      practice,
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        url: absoluteUrl('/'),
        name: site.name,
        inLanguage: 'en',
        publisher: { '@id': absoluteUrl('/#person') },
      },
    ],
  };

  return <JsonLd data={graph} />;
}

/**
 * Renders a JSON-LD block.
 *
 * `JSON.stringify` output is escaped so a `</script>` sequence inside any
 * content value cannot break out of the script element.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
