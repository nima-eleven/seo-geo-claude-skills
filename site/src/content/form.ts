/**
 * The contact form's labels, options and copy.
 *
 * The `interests` values are also what the services section links to via
 * `?interest=<value>`, so they must stay in sync with the `id` field in
 * services.ts.
 */

export interface SelectOption {
  value: string;
  label: string;
}

export const companySizes: SelectOption[] = [
  { value: '1-9', label: '1 to 9 employees' },
  { value: '10-49', label: '10 to 49 employees' },
  { value: '50-249', label: '50 to 249 employees' },
  { value: '250+', label: '250 or more employees' },
];

export const interests: SelectOption[] = [
  { value: 'diagnostic', label: 'Organizational diagnostic' },
  { value: 'strategy', label: 'Strategy and operating rhythm' },
  { value: 'leadership', label: 'Leadership development' },
  { value: 'speaking', label: 'Speaking or workshop' },
  { value: 'unsure', label: 'Not sure yet' },
];

export const contactPreferences: SelectOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video call' },
];

export const formContent = {
  eyebrow: 'Work with Sofia',
  heading: 'Start a conversation',
  intro:
    'Tell me what is happening in the business right now. I read every enquiry myself.',
  submitLabel: 'Send my enquiry',
  submittingLabel: 'Sending…',
  successHeading: 'Thank you — your enquiry is with me.',
  /** `{responseTime}` is substituted from site.contact.responseTime. */
  successBody:
    'I read every enquiry personally and reply {responseTime}. If it is urgent, email me directly and put "urgent" in the subject line.',
  successSecondaryCta: 'While you wait, watch the latest video',
  errorHeading: 'That did not send.',
  errorBody:
    'Nothing you typed has been lost. Try again in a moment, or email me directly and I will pick it up from there.',
  consentLabel: 'I agree to be contacted about my enquiry.',
};
