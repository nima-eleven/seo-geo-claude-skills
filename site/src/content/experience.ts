/**
 * The About section: narrative bio plus structured professional history.
 *
 * The timeline renders straight from `history`, newest first, so entries can be
 * added or reordered here without touching JSX. Any group whose entries array
 * is empty is skipped entirely rather than rendering an empty heading.
 */

export interface ExperienceEntry {
  /** e.g. "2019 — present". Rendered in the mono utility face. */
  yearRange: string;
  role: string;
  organization: string;
  /** One line. What the scope actually was — not a duty list. */
  scope: string;
}

export interface CredentialGroup {
  heading: string;
  entries: string[];
}

export interface AboutContent {
  eyebrow: string;
  heading: string;
  /** 150–220 words, first person. Each string is a paragraph. */
  bio: string[];
  /** Short version, reused in structured data and the footer. */
  bioShort: string;
  portraitImage: string;
  portraitAlt: string;
  history: ExperienceEntry[];
  credentials: CredentialGroup[];
}

export const about: AboutContent = {
  eyebrow: 'About',
  heading: 'About Sofia',

  bio: [
    '{{BIO_LONG}}',
    'Replace this with 150 to 220 words in the first person. What earns trust here is specificity: the kind of companies you have worked inside, the pattern you keep seeing, and how you came to work this way. Avoid a list of adjectives.',
  ],

  bioShort:
    '{{BIO_SHORT}} — management consultant and organizational development advisor to small and mid-sized companies.',

  portraitImage: '{{PORTRAIT_IMAGE}}',
  portraitAlt: 'Sofia Mo',

  // Newest first. Leave empty to hide the timeline entirely.
  history: [
    {
      yearRange: '{{YEAR_RANGE}}',
      role: '{{ROLE}}',
      organization: '{{ORGANIZATION}}',
      scope: '{{ONE_LINE_SCOPE}}',
    },
  ],

  // Any group with an empty `entries` array is not rendered.
  credentials: [
    { heading: 'Education', entries: [] },
    { heading: 'Certifications', entries: [] },
    { heading: 'Languages', entries: [] },
    { heading: 'Speaking and publications', entries: [] },
  ],
};
