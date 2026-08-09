import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { absoluteUrl, realValue, site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${site.name} handles the information you submit through this website.`,
  alternates: { canonical: absoluteUrl('/privacy') },
  // A draft policy must not be indexed as if it were the real thing.
  robots: { index: false, follow: true },
};

/**
 * DRAFT.
 *
 * TODO — before launch, this page must be reviewed by Sofia and, if she is
 * subject to the GDPR, by someone competent to check it. The sections below
 * describe what the site actually does, which is the accurate starting point,
 * but they are not legal advice and several details are unresolved:
 *
 *   TODO: name the data controller and give a registered address.
 *   TODO: state the lawful basis for processing (consent vs legitimate interest).
 *   TODO: state how long enquiries are retained before deletion.
 *   TODO: confirm the analytics tool actually deployed and its data location.
 *   TODO: name the supervisory authority for the relevant jurisdiction.
 */
export default function PrivacyPage() {
  const email = realValue(site.contact.email);

  return (
    <>
      <Header />

      <main id="main" className="section-y">
        <div className="shell">
          <p className="eyebrow mono">Legal</p>
          <h1 className="display-lg mt-5">Privacy policy</h1>

          <p
            className="measure mono mt-8 rounded-[4px] border-l-2 bg-white p-5 text-graphite"
            style={{ borderLeftColor: 'var(--color-brass)' }}
          >
            Draft — this policy has not yet been reviewed and is not final.
          </p>

          <div className="prose measure mt-12">
            <h2>What this page covers</h2>
            <p>
              This policy describes what happens to information you provide
              through this website. It does not cover any separate agreement you
              may enter into with {site.name} as a client.
            </p>

            <h2>What is collected</h2>
            <p>When you submit the enquiry form, the following is collected:</p>
            <ul>
              <li>Your name and email address, which are required to reply.</li>
              <li>
                Optionally your company name, role, company size, area of
                interest, preferred contact method and phone number.
              </li>
              <li>The description of your situation that you write yourself.</li>
              <li>
                Your readiness snapshot answers, but only if you choose to send
                them with the enquiry.
              </li>
              <li>
                Technical attribution: which link brought you to the site (UTM
                parameters), the referring page, and the page you submitted from.
                This is used to understand which videos lead to enquiries.
              </li>
              <li>
                Your IP address, recorded with the enquiry and used to limit
                automated submissions.
              </li>
            </ul>

            <h2>What is not collected</h2>
            <p>
              The readiness snapshot runs entirely in your browser. Your answers
              are not sent anywhere unless you press the button to include them
              with an enquiry. The site sets no advertising cookies and does not
              share data with advertising networks.
            </p>

            <h2>How it is used</h2>
            <p>
              Enquiry information is used to reply to you and to assess whether
              the engagement is a fit. It is not sold, and it is not added to a
              marketing list without your separate agreement.
            </p>

            <h2>Analytics</h2>
            <p>
              Aggregate, non-identifying analytics are used to understand which
              sections of the site are read and which links produce enquiries.
              {' '}
              <em>TODO: confirm the tool in use and where its data is held.</em>
            </p>

            <h2>Third parties</h2>
            <p>
              Enquiry emails are delivered by Resend. Video thumbnails are served
              by YouTube; a YouTube player is only loaded if you press play on a
              video, at which point YouTube&rsquo;s own privacy policy applies.
            </p>

            <h2>Your rights</h2>
            <p>
              You can ask what information is held about you, ask for it to be
              corrected, or ask for it to be deleted.
              {email ? (
                <>
                  {' '}
                  Write to{' '}
                  <a href={`mailto:${email}`}>{email}</a> and it will be actioned.
                </>
              ) : null}
            </p>

            <h2>Changes</h2>
            <p>
              If this policy changes materially, the change will be noted here
              with a date.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
