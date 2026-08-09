import Link from 'next/link';
import { formatDate, getArticles } from '@/lib/insights';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/**
 * The three most recent articles.
 *
 * With zero published posts the section is omitted entirely — an empty state
 * on a marketing page reads as neglect, which is the opposite of what the
 * section is there to signal.
 */
export function Insights() {
  const articles = getArticles().slice(0, 3);
  if (!articles.length) return null;

  return (
    <Reveal
      as="section"
      id="insights"
      labelledBy="insights-heading"
      sectionId="insights"
      className="section-y"
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="insights-heading"
            eyebrow="Insights"
            heading="Written notes"
          />
          <Link href="/insights" className="link-underline mono">
            All articles
          </Link>
        </div>

        {/* Columns track the number of articles. A fixed three-column grid
            would leave the unfilled cells showing as empty tinted blocks
            whenever fewer than three posts are published. */}
        <ul
          className={`mt-12 grid gap-px border border-sage-mist bg-sage-mist md:mt-16 ${
            articles.length === 1
              ? 'md:grid-cols-1'
              : articles.length === 2
                ? 'md:grid-cols-2'
                : 'md:grid-cols-3'
          }`}
        >
          {articles.map((article) => (
            <li key={article.slug} className="bg-white">
              <Link
                href={`/insights/${article.slug}`}
                className="flex h-full flex-col p-7 no-underline transition-colors duration-150 hover:bg-porcelain md:p-8"
              >
                <p className="mono text-graphite">
                  {formatDate(article.date)} · {article.readingTime}
                </p>
                <h3 className="display-md mt-4">{article.title}</h3>
                {article.excerpt ? (
                  <p className="clamp-2 mt-3 text-graphite">{article.excerpt}</p>
                ) : null}
                <span className="link-underline mono mt-auto pt-6">Read</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
