import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The Open Graph card, generated rather than designed as a static asset so it
 * stays in sync with site.ts and cannot drift from the page it represents.
 *
 * Uses system fonts only: fetching Fraunces here would add a network
 * dependency to every build for a 1200x630 image nobody views at full size.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#F5F6F3',
          padding: '72px 80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 3, backgroundColor: '#A8762C' }} />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#5A635E',
              fontFamily: 'monospace',
            }}
          >
            Management Consulting · Organizational Development
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 76,
            lineHeight: 1.05,
            color: '#111614',
            letterSpacing: '-0.02em',
            maxWidth: 940,
          }}
        >
          {site.hero.headline}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #DDE6DF',
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', fontSize: 40, color: '#0E4D3C' }}>
            {site.name}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#5A635E',
              fontFamily: 'monospace',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {site.role}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
