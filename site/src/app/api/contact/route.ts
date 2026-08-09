import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { validateContact, type ContactPayload } from '@/lib/contact-schema';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { companySizes, interests } from '@/content/form';
import { site } from '@/content/site';

/** Submissions faster than this were not typed by a human. */
const MIN_ELAPSED_MS = 3000;

export async function POST(request: Request) {
  const ip = clientIp(request.headers);

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = validateContact(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: 'validation_failed', fieldErrors: parsed.fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Anti-spam. Both checks answer 200 rather than an error: a bot that learns
  // which submissions were rejected learns how to get past the check.
  if (data.company_website) {
    console.info('[contact] Honeypot filled, dropping submission.');
    return NextResponse.json({ ok: true });
  }
  // A missing `elapsed_ms` validates to 0 and so is dropped here. That is
  // deliberate: the form always sends it, so an absent value means the payload
  // did not come from the form. Anything posting directly to this endpoint
  // must include it.
  if (data.elapsed_ms < MIN_ELAPSED_MS) {
    console.info('[contact] Submitted too fast, dropping submission.');
    return NextResponse.json({ ok: true });
  }

  const submittedAt = new Date().toISOString();
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  // With no mail configured the enquiry is still accepted and logged, so the
  // form can be exercised end to end in development without credentials.
  if (!apiKey || !toEmail || !fromEmail) {
    console.warn(
      '[contact] RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL is unset — enquiry accepted but not emailed:',
      { name: data.name, email: data.email, interest: data.interest, submittedAt },
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  const resend = new Resend(apiKey);

  try {
    // The notification carries everything, including hidden attribution —
    // that is what makes it possible to see which video produced the lead.
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: data.email,
      subject: `Enquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`,
      text: notificationBody(data, submittedAt, ip),
    });
  } catch (error) {
    // A failed notification is a real failure: the lead would be lost.
    console.error('[contact] Notification email failed:', error);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: `Thank you — your enquiry has reached ${site.name}`,
      text: acknowledgementBody(data),
    });
  } catch (error) {
    // The visitor already has an on-screen confirmation, and Sofia has the
    // enquiry. A missing acknowledgement is not worth failing the submission.
    console.error('[contact] Acknowledgement email failed:', error);
  }

  return NextResponse.json({ ok: true, delivered: true });
}

function label(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function notificationBody(
  data: ContactPayload,
  submittedAt: string,
  ip: string,
): string {
  const lines = [
    `Name:          ${data.name}`,
    `Email:         ${data.email}`,
    `Company:       ${data.company || '—'}`,
    `Role:          ${data.role || '—'}`,
    `Company size:  ${label(companySizes, data.companySize)}`,
    `Interested in: ${label(interests, data.interest)}`,
    `Prefers:       ${data.contactPreference || '—'}`,
    `Phone:         ${data.phone || '—'}`,
    '',
    'What is happening right now',
    '---------------------------',
    data.situation,
    '',
  ];

  if (data.snapshot_result) {
    lines.push('Readiness snapshot', '------------------', data.snapshot_result, '');
  }

  lines.push(
    'Attribution',
    '-----------',
    `utm_source:    ${data.utm_source || '—'}`,
    `utm_medium:    ${data.utm_medium || '—'}`,
    `utm_campaign:  ${data.utm_campaign || '—'}`,
    `utm_content:   ${data.utm_content || '—'}`,
    `Referrer:      ${data.referrer || '—'}`,
    `Landing video: ${data.landing_video_id || '—'}`,
    `Page:          ${data.page_path || '—'}`,
    `Submitted at:  ${submittedAt}`,
    `IP:            ${ip}`,
  );

  return lines.join('\n');
}

function acknowledgementBody(
  data: ContactPayload,
): string {
  return [
    `Hello ${data.name},`,
    '',
    `Thank you for getting in touch. Your enquiry has reached me and I read every one personally.`,
    `I will reply ${site.contact.responseTime}.`,
    '',
    'For reference, this is what you sent:',
    '',
    data.situation,
    '',
    '—',
    site.name,
    site.role,
  ].join('\n');
}
