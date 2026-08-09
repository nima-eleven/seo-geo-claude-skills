/**
 * The contact form's shape, validated identically on the client and the server.
 *
 * Deliberately dependency-free. A schema library would be the obvious choice,
 * but this module is imported by the form component, so it ships to every
 * visitor — and it cost 18KB gzipped of the page's budget for a handful of
 * required-field, enum and length checks. This is the single source of truth
 * for both `ContactForm` and the `/api/contact` route, so dropping the library
 * removed weight without introducing a second implementation to keep in sync.
 *
 * Error messages are written to be shown directly to the visitor: each one
 * states what is wrong and how to fix it. "Invalid input" is never acceptable.
 */

import { companySizes, contactPreferences, interests } from '@/content/form';

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  role: string;
  companySize: string;
  interest: string;
  situation: string;
  contactPreference: string;
  phone: string;
  consent: true;

  // Hidden attribution. Captured automatically, never shown to the visitor.
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  referrer: string;
  landing_video_id: string;
  snapshot_result: string;
  page_path: string;

  // Anti-spam. Checked server-side; neither is visible.
  company_website: string;
  elapsed_ms: number;
}

/** Field-keyed errors, the shape the form renders directly. */
export type FieldErrors = Partial<Record<keyof ContactPayload, string>>;

export type ValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; fieldErrors: FieldErrors };

/**
 * A pragmatic email check: one @, something either side, a dot in the domain,
 * and no whitespace. Stricter patterns reject addresses that are genuinely
 * valid, and the only real proof of deliverability is a reply anyway.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX = {
  name: 200,
  email: 320,
  company: 120,
  role: 120,
  situation: 4000,
  phone: 40,
  snapshot_result: 2000,
  attribution: 500,
} as const;

export function validateContact(input: unknown): ValidationResult {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = text(raw.name, MAX.name);
  if (name.length < 2) {
    errors.name = 'Please enter your name so I know who I am replying to.';
  }

  const email = text(raw.email, MAX.email);
  if (!email) {
    errors.email = 'Please enter an email address so I can reply.';
  } else if (!EMAIL.test(email)) {
    errors.email = 'That email address is missing an @ or a domain. Check it over.';
  }

  const companySize = text(raw.companySize, 40);
  if (!isOneOf(companySize, companySizes)) {
    errors.companySize = 'Please choose the size of your company.';
  }

  const interest = text(raw.interest, 40);
  if (!isOneOf(interest, interests)) {
    errors.interest = 'Please choose what you are interested in.';
  }

  const situation = text(raw.situation, MAX.situation + 1);
  if (situation.length < 20) {
    errors.situation =
      'A sentence or two, please — at least 20 characters. What is happening right now?';
  } else if (situation.length > MAX.situation) {
    errors.situation = `That is longer than the form accepts. Please trim it to ${MAX.situation} characters.`;
  }

  const contactPreference = text(raw.contactPreference, 40);
  if (contactPreference && !isOneOf(contactPreference, contactPreferences)) {
    errors.contactPreference = 'Please choose one of the listed contact methods.';
  }

  const phone = text(raw.phone, MAX.phone);
  if (contactPreference === 'phone' && phone.length < 6) {
    errors.phone = 'You chose phone — please add a number I can reach you on.';
  }

  if (raw.consent !== true) {
    errors.consent = 'Please tick the box so I have permission to reply.';
  }

  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      name,
      email,
      company: text(raw.company, MAX.company),
      role: text(raw.role, MAX.role),
      companySize,
      interest,
      situation,
      contactPreference,
      phone,
      consent: true,

      utm_source: text(raw.utm_source, MAX.attribution),
      utm_medium: text(raw.utm_medium, MAX.attribution),
      utm_campaign: text(raw.utm_campaign, MAX.attribution),
      utm_content: text(raw.utm_content, MAX.attribution),
      referrer: text(raw.referrer, MAX.attribution),
      landing_video_id: text(raw.landing_video_id, 50),
      snapshot_result: text(raw.snapshot_result, MAX.snapshot_result),
      page_path: text(raw.page_path, 300),

      company_website: text(raw.company_website, 200),
      elapsed_ms:
        typeof raw.elapsed_ms === 'number' && Number.isFinite(raw.elapsed_ms)
          ? Math.max(0, Math.floor(raw.elapsed_ms))
          : 0,
    },
  };
}

/** Coerces to a trimmed string and caps the length, so a hostile payload
 *  cannot put an unbounded value into an email body. */
function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function isOneOf(value: string, options: { value: string }[]): boolean {
  return options.some((option) => option.value === value);
}
