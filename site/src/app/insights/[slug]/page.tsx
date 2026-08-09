import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/StructuredData';
import { ArticleProgress } from '@/components/ArticleProgress';
import { CtaLink } from '@/components/CtaLink';
import { formatDate, getArticle, getArticles } from '@/lib/insights';
import { absoluteUrl, site } from '@/content/site';

export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const url = absoluteUrl(`/insights/${article.slug}`);

  return {
    title: article.title,
    description: article.excerpt || site.meta.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt || site.meta.description,
      url,
      publishedTime: article.date,
      authors: [site.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || site.meta.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = absoluteUrl(`/insights/${article.slug}`);

  return (
    <>
      <Header />
      <ArticleProgress slug={article.slug} />

      <main id="main" className="section-y">
        <article className="shell">
          <p className="mono text-graphite">
            <Link href="/insights" className="link-underline">
              Insights
            </Link>
            <span aria-hidden="true"> · </span>
            {formatDate(article.date)}
            <span aria-hidden="true"> · </span>
            {article.readingTime}
          </p>

          <h1 className="display-lg measure mt-6">{article.title}</h1>

          {article.excerpt ? (
            <p className="lede measure mt-6">{article.excerpt}</p>
          ) : null}

          {/* Same type system as the rest of the site, held to a 68-character
              measure. `prose` is defined in globals.css rather than pulled in
              from a plugin, so the article inherits the design tokens. */}
          <div className="prose measure mt-12 border-t border-sage-mist pt-12">
            <MDXRemote source={article.content} />
          </div>

          {article.tags.length ? (
            <ul className="mono measure mt-12 flex flex-wrap gap-2 text-graphite">
              {article.tags.map((tag) => (
                <li key={tag} className="rounded-[4px] bg-sage-mist px-3 py-1.5">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          {/* The persistent CTA: an article read to the end is a warm visitor. */}
          <aside className="measure mt-16 rounded-[4px] bg-sage-mist p-7 md:p-10">
            <p className="eyebrow mono">Work with Sofia</p>
            <p className="display-md mt-4">
              Recognise this in your own company?
            </p>
            <p className="mt-4 text-graphite">
              Tell me what is happening and I will tell you whether it is
              something I can help with.
            </p>
            <p className="mt-7">
              <CtaLink
                href="/#contact-form"
                location="article"
                label="start_conversation"
              >
                {site.hero.primaryCta}
              </CtaLink>
            </p>
          </aside>
        </article>
      </main>

      <Footer />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: article.title,
          description: article.excerpt || undefined,
          datePublished: article.date,
          dateModified: article.date,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          url,
          author: { '@type': 'Person', name: site.name, '@id': absoluteUrl('/#person') },
          publisher: { '@id': absoluteUrl('/#person') },
          ...(article.coverImage
            ? { image: absoluteUrl(article.coverImage) }
            : {}),
        }}
      />
    </>
  );
}
