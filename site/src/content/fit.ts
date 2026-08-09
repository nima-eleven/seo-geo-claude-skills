/**
 * The "Who this is for" comparison.
 *
 * Honest disqualification builds more trust than universal appeal, and it
 * filters the inbound. Keep the "not a fit" column genuinely disqualifying —
 * a list of soft non-objections defeats the purpose.
 */

export interface FitContent {
  eyebrow: string;
  heading: string;
  intro: string;
  fit: { heading: string; items: string[] };
  notFit: { heading: string; items: string[] };
}

export const fitContent: FitContent = {
  eyebrow: 'Fit',
  heading: 'Who this is for',
  intro:
    'I work with a narrow kind of company. Being clear about that saves us both a call.',

  fit: {
    heading: 'This is a fit if',
    items: [
      'You have roughly 10 to 250 employees and the business is trading.',
      'You are still the bottleneck — decisions that should not reach you, reach you.',
      'Revenue is growing but margins or morale are not keeping pace.',
      'A leadership team exists on paper but not yet in practice.',
      'You are willing to change how the company is structured, not just how it feels.',
    ],
  },

  notFit: {
    heading: 'This is not a fit if',
    items: [
      'You are pre-revenue and looking for a co-founder or an operator to hire.',
      'You want a one-off motivational workshop rather than a structural change.',
      'Reporting lines and role definitions are not open for discussion.',
      'You need someone to deliver the work rather than build the team that does.',
    ],
  },
};
