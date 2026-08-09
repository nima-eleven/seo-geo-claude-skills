/**
 * The engagement cards in "How Sofia helps".
 *
 * The layout adapts to two, three or four entries, so an engagement can be
 * added or removed here without touching any component. `id` is what gets
 * written into the form's interest dropdown via `?interest=<id>`, so it must
 * match an option value in `contactForm.interests` (see form.ts).
 */

export interface Service {
  id: string;
  /** Mono label, e.g. "01 / DIAGNOSTIC". The number is added automatically. */
  label: string;
  title: string;
  /** 40–55 words, plain operator language. */
  description: string;
  /** Concrete deliverables, not benefits. */
  outputs: string[];
  /** Mono line, e.g. "4–6 weeks · On-site and remote". */
  format: string;
}

export const services: Service[] = [
  {
    id: 'diagnostic',
    label: 'Diagnostic',
    title: 'Organizational diagnostic',
    description:
      'A structured assessment of how decisions actually move through your company: who decides what, where work stalls, and which roles overlap. I interview your team, map the real flow rather than the org chart, and show you where the bottlenecks are.',
    outputs: [
      'Decision-flow map of the current organization',
      'Role and accountability gaps, named and ranked',
      'A prioritised sequence of what to fix first',
    ],
    format: '3–5 weeks · Interviews, observation, written findings',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    title: 'Strategy and operating rhythm',
    description:
      'Direction that lives in your head is not a strategy your team can run. We turn it into a small number of stated priorities, then build the meeting and review cadence that keeps them moving without you chasing every one of them.',
    outputs: [
      'A one-page strategy the leadership team can state from memory',
      'A weekly, monthly and quarterly operating cadence',
      'Owner and measure attached to every priority',
    ],
    format: '6–10 weeks · Workshops plus cadence coaching',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    title: 'Leadership and team development',
    description:
      'Most owners cannot step back because there is no management layer to step back into. We build one: developing the people who already report to you into managers who can hold a decision, run a team, and carry a number.',
    outputs: [
      'Individual development plans for your management layer',
      'A delegation framework your managers are trained to use',
      'A rhythm for feedback and performance that outlasts the engagement',
    ],
    format: '3–6 months · Group sessions and individual coaching',
  },
];
