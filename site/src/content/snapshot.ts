/**
 * The Organizational Readiness Snapshot: questions, scoring and result bands.
 *
 * Scoring model
 * -------------
 * Each statement is answered on a 4-point scale, stored as 0..3 where 3 is
 * "Strongly agree". Statements phrased so that agreement is a *good* sign are
 * marked `positive: true`; the rest are reverse-scored, so a high total always
 * means a healthier organization. Maximum score is `questions.length * 3`.
 *
 * Bands are matched by `maxPercent`, ascending, and the first match wins.
 * Add or remove questions freely — the bands are percentage-based, so the
 * scoring stays correct without any other change.
 */

export interface SnapshotQuestion {
  id: string;
  statement: string;
  /**
   * true  → agreement indicates strength (scored as given)
   * false → agreement indicates founder-dependence (reverse-scored)
   */
  positive: boolean;
}

export interface SnapshotBand {
  id: string;
  /** Upper bound of this band, inclusive, as a percentage of the maximum. */
  maxPercent: number;
  name: string;
  /** 2–3 sentences. Interpretation, not flattery. */
  interpretation: string;
  /** Exactly one recommended next step. */
  nextStep: string;
}

export interface SnapshotContent {
  eyebrow: string;
  heading: string;
  intro: string;
  /** Ordered low → high, mapped to 0..3. */
  scale: string[];
  questions: SnapshotQuestion[];
  bands: SnapshotBand[];
  handoffCta: string;
}

export const snapshot: SnapshotContent = {
  eyebrow: 'Snapshot',
  heading: 'How founder-dependent is your organization?',
  intro:
    'Five statements, about a minute. You get the result immediately — no email required.',

  scale: ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'],

  questions: [
    {
      id: 'decisions',
      statement: 'Decisions that should be made by my team still come to me.',
      positive: false,
    },
    {
      id: 'absence',
      statement:
        'If I were unavailable for two weeks, the business would slow down noticeably.',
      positive: false,
    },
    {
      id: 'roles',
      statement:
        'Roles and responsibilities are documented and actually followed.',
      positive: true,
    },
    {
      id: 'strategy',
      statement:
        'We have a strategy the whole leadership team could state in one sentence.',
      positive: true,
    },
    {
      id: 'rhythm',
      statement:
        'We review performance on a fixed rhythm, not only when something goes wrong.',
      positive: true,
    },
  ],

  bands: [
    {
      id: 'founder-dependent',
      maxPercent: 40,
      name: 'Founder-dependent',
      interpretation:
        'The company runs through you. That is normal for a business that grew quickly, and it is also the ceiling on how much further it can grow. The constraint is not effort or talent — it is that decision rights and roles have never been made explicit.',
      nextStep:
        'Start with a diagnostic. Before changing anything, get an accurate map of where decisions actually stall.',
    },
    {
      id: 'structurally-forming',
      maxPercent: 70,
      name: 'Structurally forming',
      interpretation:
        'Some structure holds and some does not. Typically roles are clearer than the operating rhythm, so good intentions decay between meetings. This is the stage where a small amount of deliberate design produces a disproportionate result.',
      nextStep:
        'Work on strategy and operating rhythm. The structure exists; it needs a cadence that keeps it running.',
    },
    {
      id: 'systems-led',
      maxPercent: 100,
      name: 'Systems-led',
      interpretation:
        'The organization largely runs on its systems rather than on you. The remaining constraint is usually the depth of the management layer: whether your managers can hold decisions at their level under pressure, not just on a good week.',
      nextStep:
        'Focus on leadership development. Deepen the management layer so the systems survive growth.',
    },
  ],

  handoffCta: 'Send this snapshot to Sofia',
};

/** Highest achievable raw score. */
export const snapshotMaxScore = snapshot.questions.length * 3;

/**
 * Turns raw 0..3 answers into a band. Answers are keyed by question id;
 * unanswered questions are treated as 0 so a partial set never throws.
 */
export function scoreSnapshot(answers: Record<string, number>): {
  score: number;
  percent: number;
  band: SnapshotBand;
} {
  const score = snapshot.questions.reduce((total, question) => {
    const raw = answers[question.id] ?? 0;
    return total + (question.positive ? raw : 3 - raw);
  }, 0);

  const percent = Math.round((score / snapshotMaxScore) * 100);
  const band =
    snapshot.bands.find((candidate) => percent <= candidate.maxPercent) ??
    snapshot.bands[snapshot.bands.length - 1];

  return { score, percent, band };
}
