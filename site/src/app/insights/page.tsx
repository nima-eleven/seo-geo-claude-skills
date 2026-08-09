import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { formatDate, getArticles } from '@/lib/insights';
import { absoluteUrl } from '@/content/site';

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Written notes on organizational development, delegation, operating rhythm and building a management layer in a growing company.',
  alternates: { canonical: absoluteUrl('/insights') },
};

export default function InsightsIndex() {
  const articles = getArticles();

  return (
    <>
      <Header />

      <main id="main" className="section-y">
        <div className="shell">
          <p className="eyebrow mono">Insights</p>
          <h1 className="display-lg mt-5">Written notes</h1>
          <p className="lede measure mt-5">
            Shorter pieces on the same problems the videos cover: delegation,
            role clarity, operating rhythm, and the management layer.
          </p>

          {articles.length ? (
            <ul className="mt-14 border-t border-sage-mist">
              {articles.map((article) => (
                <li key={article.slug} className="border-b border-sage-mist">
                  <Link
                    href={`/insights/${article.slug}`}
                    className="grid gap-3 py-8 no-underline md:grid-cols-12 md:gap-8"
                  >
                    <p className="mono pt-1 text-graphite md:col-span-3">
                      {formatDate(article.date)}
                      <span className="block">{article.readingTime}</span>
                    </p>
                    <div className="md:col-span-9">
                      <h2 className="display-md">{article.title}</h2>
                      {article.excerpt ? (
                        <p className="measure mt-3 text-graphite">
                          {article.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            /* An index route the visitor navigated to deliberately does need an
               empty state — unlike the section on the marketing page, which
               hides itself. */
            <p className="mt-12 text-graphite">
              There are no published articles yet.{' '}
              <Link href="/#watch" className="link-underline">
                The video library
              </Link>{' '}
              is the place to start in the meantime.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
