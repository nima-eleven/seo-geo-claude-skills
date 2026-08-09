import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter_Tight, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import { site, siteUrl, absoluteUrl } from '@/content/site';
import { StructuredData } from '@/components/StructuredData';
import { AttributionCapture } from '@/components/AttributionCapture';
import './globals.css';

/* Fonts. Three roles, three families, subset to Latin, `swap` so text is
   never invisible while a font loads. Fraunces and Inter Tight are variable,
   so a weight range costs no extra requests. */

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK'],
  variable: '--font-fraunces',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.meta.title,
    template: `%s — ${site.name}`,
  },
  description: site.meta.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.meta.title,
    description: site.meta.description,
    url: absoluteUrl('/'),
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.meta.title,
    description: site.meta.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#F5F6F3',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analyticsDomain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${plexMono.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        {children}

        <AttributionCapture />
        <StructuredData />

        {/* Plausible. Absent entirely when no domain is configured; every
            track() call degrades to a no-op, so nothing else changes. */}
        {analyticsDomain ? (
          <Script
            defer
            data-domain={analyticsDomain}
            src="https://plausible.io/js/script.tagged-events.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
