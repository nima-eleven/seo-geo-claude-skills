'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  companySizes,
  contactPreferences,
  formContent,
  interests,
} from '@/content/form';
import { realValue, site } from '@/content/site';
import { getAttribution } from '@/lib/attribution';
import { track } from '@/lib/analytics';
import { validateContact, type FieldErrors } from '@/lib/contact-schema';
import { SNAPSHOT_HANDOFF_EVENT } from './Snapshot';
import { PRESELECT_INTEREST_EVENT } from './InterestLink';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** The shortest form that still qualifies. Every field earns its place. */
export function ContactForm({ hasWatch }: { hasWatch: boolean }) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [interest, setInterest] = useState('');
  const [preference, setPreference] = useState('');
  const [snapshotResult, setSnapshotResult] = useState('');

  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const mountedAt = useRef(Date.now());
  const startTracked = useRef(false);

  const email = realValue(site.contact.email);

  // Handoffs from elsewhere on the page: the snapshot result and the services
  // section's "Talk about this" links.
  useEffect(() => {
    const onSnapshot = (event: Event) => {
      setSnapshotResult((event as CustomEvent<string>).detail ?? '');
    };
    const onInterest = (event: Event) => {
      setInterest((event as CustomEvent<string>).detail ?? '');
    };

    window.addEventListener(SNAPSHOT_HANDOFF_EVENT, onSnapshot);
    window.addEventListener(PRESELECT_INTEREST_EVENT, onInterest);
    return () => {
      window.removeEventListener(SNAPSHOT_HANDOFF_EVENT, onSnapshot);
      window.removeEventListener(PRESELECT_INTEREST_EVENT, onInterest);
    };
  }, []);

  // Also honour ?interest=… on the landing URL, so a link from anywhere works.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('interest');
    if (fromUrl && interests.some((option) => option.value === fromUrl)) {
      setInterest(fromUrl);
    }
  }, []);

  // Move focus to the confirmation so keyboard and screen-reader users are not
  // left on a submit button that no longer exists.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  function onFirstFocus(field: string) {
    if (startTracked.current) return;
    startTracked.current = true;
    track('form_start', { entry_field: field });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      company: String(data.get('company') ?? ''),
      role: String(data.get('role') ?? ''),
      companySize: String(data.get('companySize') ?? ''),
      interest: String(data.get('interest') ?? ''),
      situation: String(data.get('situation') ?? ''),
      contactPreference: String(data.get('contactPreference') ?? ''),
      phone: String(data.get('phone') ?? ''),
      consent: data.get('consent') === 'on',
      ...getAttribution(),
      snapshot_result: snapshotResult,
      page_path: window.location.pathname,
      company_website: String(data.get('company_website') ?? ''),
      elapsed_ms: Date.now() - mountedAt.current,
    };

    const parsed = validateContact(payload);
    if (!parsed.ok) {
      setErrors(parsed.fieldErrors);
      setStatus('idle');
      // Focus the first field with an error so the fix is one keystroke away.
      const firstKey = Object.keys(parsed.fieldErrors)[0];
      if (firstKey) {
        form.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      }
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (body?.fieldErrors) setErrors(body.fieldErrors as FieldErrors);
        track('form_submit_error', {
          error_type: response.status === 429 ? 'rate_limited' : `http_${response.status}`,
        });
        setStatus('error');
        return;
      }

      track('form_submit_success', {
        interest: parsed.data.interest,
        company_size: parsed.data.companySize,
        utm_source: parsed.data.utm_source,
      });
      setStatus('success');
    } catch {
      // Network failure: keep every entered value, offer a way through.
      track('form_submit_error', { error_type: 'network' });
      setStatus('error');
    }
  }

  return (
    <Reveal
      as="section"
      id="contact-form"
      labelledBy="contact-form-heading"
      sectionId="contact-form"
      className="section-y border-t border-sage-mist bg-white"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading
              id="contact-form-heading"
              eyebrow={formContent.eyebrow}
              heading={formContent.heading}
              intro={formContent.intro}
            />
            {email ? (
              <p className="mono mt-8 text-graphite">
                Or email directly:{' '}
                <a className="link-underline" href={`mailto:${email}`}>
                  {email}
                </a>
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-8">
            {status === 'success' ? (
              <div
                ref={successRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
                className="card p-8 md:p-10"
              >
                <p className="eyebrow mono">Received</p>
                <h3 className="display-md mt-5">{formContent.successHeading}</h3>
                <p className="measure mt-4 text-graphite">
                  {formContent.successBody.replace(
                    '{responseTime}',
                    site.contact.responseTime,
                  )}
                </p>
                {hasWatch ? (
                  <p className="mt-7">
                    <a href="#watch" className="btn btn-ghost">
                      {formContent.successSecondaryCta}
                    </a>
                  </p>
                ) : null}
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate>
                {/* Honeypot. Hidden from sight and from assistive technology,
                    and skipped in the tab order — only a bot fills it. */}
                <div className="sr-only-custom" aria-hidden="true">
                  <label htmlFor="company_website">
                    Do not fill this in
                    <input
                      id="company_website"
                      name="company_website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    name="name"
                    label="Full name"
                    error={errors.name}
                    required
                  >
                    {(props) => (
                      <input
                        {...props}
                        type="text"
                        autoComplete="name"
                        onFocus={() => onFirstFocus('name')}
                      />
                    )}
                  </Field>

                  <Field name="email" label="Email" error={errors.email} required>
                    {(props) => (
                      <input
                        {...props}
                        type="email"
                        autoComplete="email"
                        onFocus={() => onFirstFocus('email')}
                      />
                    )}
                  </Field>

                  <Field name="company" label="Company name" error={errors.company}>
                    {(props) => (
                      <input
                        {...props}
                        type="text"
                        autoComplete="organization"
                        onFocus={() => onFirstFocus('company')}
                      />
                    )}
                  </Field>

                  <Field name="role" label="Your role" error={errors.role}>
                    {(props) => (
                      <input
                        {...props}
                        type="text"
                        autoComplete="organization-title"
                        placeholder="Owner, MD, Head of Operations…"
                        onFocus={() => onFirstFocus('role')}
                      />
                    )}
                  </Field>

                  <Field
                    name="companySize"
                    label="Company size"
                    error={errors.companySize}
                    required
                  >
                    {(props) => (
                      <select {...props} defaultValue="" onFocus={() => onFirstFocus('companySize')}>
                        <option value="" disabled>
                          Choose one…
                        </option>
                        {companySizes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>

                  <Field
                    name="interest"
                    label="I am interested in"
                    error={errors.interest}
                    required
                  >
                    {(props) => (
                      <select
                        {...props}
                        value={interest}
                        onChange={(event) => setInterest(event.target.value)}
                        onFocus={() => onFirstFocus('interest')}
                      >
                        <option value="" disabled>
                          Choose one…
                        </option>
                        {interests.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </div>

                <div className="mt-6">
                  <Field
                    name="situation"
                    label="What is happening right now?"
                    error={errors.situation}
                    required
                    hint="A few sentences is plenty. For example: “We are 40 people, growing, but every decision still comes back to me and two of my managers have resigned this year.”"
                  >
                    {(props) => (
                      <textarea
                        {...props}
                        rows={5}
                        onFocus={() => onFirstFocus('situation')}
                      />
                    )}
                  </Field>
                </div>

                <fieldset className="mt-6">
                  <legend className="mono text-graphite">Preferred contact</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contactPreferences.map((option) => {
                      const selected = preference === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`mono flex cursor-pointer items-center rounded-[4px] border px-4 py-2.5 transition-colors duration-150 ${
                            selected
                              ? 'border-evergreen bg-evergreen text-white'
                              : 'border-sage-mist bg-white text-graphite hover:border-evergreen'
                          }`}
                        >
                          <input
                            type="radio"
                            name="contactPreference"
                            value={option.value}
                            checked={selected}
                            onChange={() => setPreference(option.value)}
                            className="sr-only-custom"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Only asked for once it is actually needed. */}
                {preference === 'phone' ? (
                  <div className="mt-6 sm:max-w-xs">
                    <Field name="phone" label="Phone number" error={errors.phone} required>
                      {(props) => <input {...props} type="tel" autoComplete="tel" />}
                    </Field>
                  </div>
                ) : null}

                <div className="mt-8">
                  <label className="flex gap-3">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      className="mt-1.5 h-4 w-4 flex-none accent-[var(--color-evergreen)]"
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? 'consent-error' : undefined}
                    />
                    <span className="text-[0.9375rem] text-graphite">
                      {formContent.consentLabel}{' '}
                      <a className="link-underline" href="/privacy">
                        Privacy policy
                      </a>
                      .
                    </span>
                  </label>
                  {errors.consent ? (
                    <p id="consent-error" className="mt-2 text-[0.875rem]" style={{ color: 'var(--color-error)' }}>
                      {errors.consent}
                    </p>
                  ) : null}
                </div>

                {snapshotResult ? (
                  <p className="mono mt-6 rounded-[4px] bg-sage-mist px-4 py-3 text-graphite">
                    Your readiness snapshot will be sent with this enquiry.
                  </p>
                ) : null}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting'
                      ? formContent.submittingLabel
                      : formContent.submitLabel}
                  </button>

                  {/* Inline, never a full-page spinner. */}
                  <span aria-live="polite" className="mono text-graphite">
                    {status === 'submitting' ? 'Sending your enquiry…' : ''}
                  </span>
                </div>

                {status === 'error' ? (
                  <div
                    role="alert"
                    className="mt-6 rounded-[4px] border p-5"
                    style={{ borderColor: 'var(--color-error)' }}
                  >
                    <p className="mono" style={{ color: 'var(--color-error)' }}>
                      {formContent.errorHeading}
                    </p>
                    <p className="measure mt-2 text-[0.9375rem] text-graphite">
                      {formContent.errorBody}
                      {email ? (
                        <>
                          {' '}
                          <a className="link-underline" href={`mailto:${email}`}>
                            {email}
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */

interface ControlProps {
  id: string;
  name: string;
  className: string;
  /** Exposes the requirement to assistive technology. The visible asterisk is
   *  `aria-hidden`, so without this a screen reader gets no signal at all.
   *  Validation stays ours — the form carries `noValidate`. */
  required?: boolean;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

/**
 * A labelled field with inline error and hint wiring.
 *
 * Labels are real `<label>` elements — never placeholder-only — and both the
 * hint and the error are joined into `aria-describedby` so a screen reader
 * announces them with the field.
 */
function Field({
  name,
  label,
  error,
  hint,
  required,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: ControlProps) => ReactNode;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={name} className="mono block text-graphite">
        {label}
        {required ? (
          <span aria-hidden="true" style={{ color: 'var(--color-brass-deep)' }}>
            {' '}
            *
          </span>
        ) : (
          <span className="opacity-70"> (optional)</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="mt-2 text-[0.875rem] text-graphite">
          {hint}
        </p>
      ) : null}

      <div className="mt-2">
        {children({
          id: name,
          name,
          className: 'field',
          required: required || undefined,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
        })}
      </div>

      {error ? (
        <p id={errorId} className="mt-2 text-[0.875rem]" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
