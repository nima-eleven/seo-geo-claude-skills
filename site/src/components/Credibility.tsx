import { site, isPlaceholder } from '@/content/site';

/**
 * Fast proof: a single horizontal band of data points.
 *
 * Renders nothing unless `site.credibility.enabled` is true AND every value is
 * real. Inventing numbers about a real person's practice is not an acceptable
 * placeholder, so the component hides itself instead.
 */
export function Credibility() {
  const { enabled, items } = site.credibility;
  const allReal = items.every((item) => !isPlaceholder(item.value));

  if (!enabled || !allReal || items.length === 0) return null;

  return (
    <section
      id="credibility"
      aria-label="Track record"
      className="border-y border-sage-mist bg-white"
    >
      <div className="shell">
        <dl className="grid grid-cols-2 divide-sage-mist md:grid-cols-4 md:divide-x">
          {items.map((item) => (
            <div key={item.label} className="px-2 py-8 md:px-6 md:py-10">
              <dd
                className="text-4xl md:text-5xl"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.02em',
                }}
              >
                {item.value}
              </dd>
              <dt className="mono mt-2 text-graphite">{item.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
