import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />

      <main id="main" className="section-y">
        <div className="shell">
          <p className="eyebrow mono">404</p>
          <h1 className="display-lg mt-5">That page does not exist.</h1>
          <p className="lede measure mt-5">
            The link may be out of date. Everything on this site lives on one
            page, so the fastest way back is the start.
          </p>
          <p className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary">
              Back to the start
            </Link>
            <Link href="/insights" className="btn btn-ghost">
              Read the insights
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
