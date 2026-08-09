/**
 * Global strings, contact details and social URLs.
 *
 * This is the file to edit for anything that appears in more than one place:
 * the name, the positioning line, the email address, the social links.
 *
 * Values wrapped in `{{DOUBLE_BRACES}}` are placeholders. They render visibly
 * on the page so nothing ships unnoticed. Replace them with real content and
 * the braces disappear on their own. See README → "Placeholder tokens".
 */

export interface SocialLink {
  label: string;
  /** Full URL, or a `{{TOKEN}}` while unknown. */
  href: string;
  /** Hidden entirely when the href is still a placeholder. */
  required?: boolean;
}

export interface SiteContent {
  name: string;
  /** Sits under the wordmark, in the mono utility face. */
  role: string;
  /** Absolute origin, no trailing slash. Overridden by NEXT_PUBLIC_SITE_URL. */
  domain: string;
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    /** Thin mono line under the CTAs. */
    footnote: string;
    portraitImage: string;
    portraitAlt: string;
  };
  /**
   * Rendered only when `enabled` is true. Per spec 6.3: never ship invented
   * numbers — leave this off until Sofia supplies real figures.
   */
  credibility: {
    enabled: boolean;
    items: { value: string; label: string }[];
  };
  contact: {
    email: string;
    phone: string;
    linkedinUrl: string;
    youtubeUrl: string;
    channelHandle: string;
    /** Optional. The booking CTA is hidden while this is a placeholder. */
    calendarUrl: string;
    /** Optional. The CV button is hidden while this is a placeholder. */
    cvPdfUrl: string;
    location: string;
    /** Used in the form success message: "I reply {{RESPONSE_TIME}}". */
    responseTime: string;
  };
  socials: SocialLink[];
}

export const site: SiteContent = {
  name: 'Sofia Mo',
  role: 'Strategy and Organizational Development',
  domain: 'https://sofiamo.com', // ASSUMPTION — see README §Open assumptions

  meta: {
    // Under 60 characters.
    title: 'Sofia Mo — Organizational Development for SMEs',
    // Under 155 characters.
    description:
      'Management consulting and organizational development for small and mid-sized companies. Rebuild how decisions, roles and strategy actually work.',
  },

  hero: {
    eyebrow: 'Management Consulting · Organizational Development',
    headline: 'Your business outgrew the way it is run.',
    subheadline:
      'I help owners and managers of small and mid-sized companies rebuild how decisions, roles, and strategy actually work, so growth stops depending on you being in every room.',
    primaryCta: 'Start a conversation',
    secondaryCta: 'Watch the latest video',
    footnote: 'Currently working with teams across {{SECTORS}}',
    portraitImage: '{{PORTRAIT_IMAGE}}',
    portraitAlt: 'Sofia Mo',
  },

  credibility: {
    // Turn on once every value below is real. Ship it off rather than invented.
    enabled: false,
    items: [
      { value: '{{YEARS_EXPERIENCE}}', label: 'Years advising' },
      { value: '{{ENGAGEMENTS_COUNT}}', label: 'Engagements' },
      { value: '{{SECTORS_COUNT}}', label: 'Sectors' },
      { value: '{{TEAM_MEMBERS_TRAINED}}', label: 'Managers coached' },
    ],
  },

  contact: {
    email: '{{EMAIL}}',
    phone: '{{PHONE}}',
    linkedinUrl: '{{LINKEDIN_URL}}',
    youtubeUrl: '{{YOUTUBE_URL}}',
    channelHandle: '{{CHANNEL_HANDLE}}',
    calendarUrl: '{{CALENDAR_URL}}',
    cvPdfUrl: '{{CV_PDF_URL}}',
    location: '{{LOCATION}}',
    responseTime: 'within two business days',
  },

  socials: [
    { label: 'LinkedIn', href: '{{LINKEDIN_URL}}' },
    { label: 'YouTube', href: '{{YOUTUBE_URL}}' },
    { label: 'Email', href: '{{EMAIL}}' },
  ],
};

/**
 * True when a value is empty or still contains an unreplaced `{{TOKEN}}`.
 *
 * Matches placeholders *anywhere* in the string, not just a whole-string token.
 * Some content mixes the two — `bioShort` is written as
 * "{{BIO_SHORT}} — management consultant…" — and a whole-string test would call
 * that real, putting a literal `{{BIO_SHORT}}` into the JSON-LD graph and any
 * `mailto:` built from it.
 */
export function isPlaceholder(value: string | undefined | null): boolean {
  return !value || /\{\{[A-Z0-9_]+\}\}/.test(value);
}

/**
 * The value, or `null` while it still holds a placeholder.
 *
 * Use this wherever a value would become a URL, an attribute or structured
 * data — anything that would be *broken* rather than merely unfinished. Copy
 * that is only read by a human is rendered directly instead, so unfilled
 * tokens stay visible on the page during development, as intended.
 */
export function realValue(value: string | undefined | null): string | null {
  return isPlaceholder(value) ? null : (value as string);
}

/** Absolute site origin. Env wins so previews and production differ correctly. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || site.domain
).replace(/\/$/, '');

/** Builds an absolute URL. Metadata and JSON-LD must never carry relative paths. */
export function absoluteUrl(path = '/'): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
