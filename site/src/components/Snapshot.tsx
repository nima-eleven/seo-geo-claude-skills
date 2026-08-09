'use client';

import { useEffect, useRef, useState } from 'react';
import {
  snapshot,
  scoreSnapshot,
  snapshotMaxScore,
  type SnapshotBand,
} from '@/content/snapshot';
import { track } from '@/lib/analytics';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/**
 * The Organizational Readiness Snapshot.
 *
 * This is the mechanism that turns a passive viewer into a qualified lead: the
 * visitor gets a real result before being asked for anything, and by the time
 * they reach the form they have already articulated their own problem — so the
 * form reads as a continuation rather than an interruption.
 *
 * Entirely client-side. No persistence, no cookies, no email gate on the result.
 * Implemented as a radiogroup per statement so it is fully keyboard operable,
 * with the result announced through a live region.
 */
export const SNAPSHOT_HANDOFF_EVENT = 'sofia:snapshot-handoff';

export function Snapshot() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    band: SnapshotBand;
    score: number;
    percent: number;
  } | null>(null);

  const startTracked = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const answered = Object.keys(answers).length;
  const complete = answered === snapshot.questions.length;

  // Score as soon as the last statement is answered — no submit step.
  useEffect(() => {
    if (!complete) {
      setResult(null);
      return;
    }
    const scored = scoreSnapshot(answers);
    setResult(scored);
    track('snapshot_complete', { score_band: scored.band.id });
  }, [answers, complete]);

  function answer(questionId: string, value: number) {
    if (!startTracked.current) {
      startTracked.current = true;
      track('snapshot_start');
    }
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  }

  /** Hands the result to the form: scrolls there and fills the hidden field. */
  function sendToForm() {
    if (!result) return;

    const detail = [
      `Band: ${result.band.name} (${result.score}/${snapshotMaxScore}, ${result.percent}%)`,
      ...snapshot.questions.map((question) => {
        const raw = answers[question.id] ?? 0;
        return `${question.statement} → ${snapshot.scale[raw]}`;
      }),
    ].join('\n');

    track('cta_click', { location: 'snapshot', label: 'send_snapshot' });
    window.dispatchEvent(
      new CustomEvent(SNAPSHOT_HANDOFF_EVENT, { detail }),
    );
    document
      .getElementById('contact-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <Reveal
      as="section"
      id="snapshot"
      labelledBy="snapshot-heading"
      sectionId="snapshot"
      className="section-y"
      // The one place to spend visual boldness: a white card on a sage band.
      // Everything around it stays quiet.
    >
      <div className="shell">
        <div className="rounded-[4px] bg-sage-mist p-5 md:p-10">
          <div className="card p-7 md:p-12" style={{ boxShadow: 'var(--shadow-elevated)' }}>
            <SectionHeading
              id="snapshot-heading"
              eyebrow={snapshot.eyebrow}
              heading={snapshot.heading}
              intro={snapshot.intro}
            />

            <ol className="mt-10 space-y-8 md:mt-12">
              {snapshot.questions.map((question, index) => (
                  <li
                    key={question.id}
                    className="border-t border-sage-mist pt-7 first:border-t-0 first:pt-0"
                  >
                    <fieldset>
                      <legend className="measure">
                        <span
                          className="mono mr-3"
                          style={{ color: 'var(--color-brass-deep)' }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[1.0625rem]">
                          {question.statement}
                        </span>
                      </legend>

                      {/* fieldset + legend is the native grouping semantic for
                          a set of radios; no ARIA role is needed on top of it. */}
                      <div className="mt-5 grid gap-2 sm:grid-cols-4">
                        {snapshot.scale.map((label, value) => {
                          const selected = answers[question.id] === value;
                          return (
                            <label
                              key={label}
                              className={`mono flex cursor-pointer items-center justify-center rounded-[4px] border px-3 py-3 text-center transition-colors duration-150 ${
                                selected
                                  ? 'border-evergreen bg-evergreen text-white'
                                  : 'border-sage-mist bg-white text-graphite hover:border-evergreen'
                              }`}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={value}
                                checked={selected}
                                onChange={() => answer(question.id, value)}
                                className="sr-only-custom"
                              />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  </li>
                ))}
            </ol>

            {/* Live region: always present so the result is announced when it
                appears, rather than the region itself being inserted. */}
            <div
              ref={resultRef}
              aria-live="polite"
              aria-atomic="true"
              className="mt-10"
            >
              {result ? (
                <div className="rise rounded-[4px] border-t-2 bg-porcelain p-7 md:p-9" style={{ borderTopColor: 'var(--color-brass)' }}>
                  <p className="mono text-graphite">
                    Your result · {result.score} of {snapshotMaxScore}
                  </p>

                  <h3 className="display-md mt-3">{result.band.name}</h3>

                  <p className="measure mt-4 text-graphite">
                    {result.band.interpretation}
                  </p>

                  <p className="measure mt-5">
                    <span className="mono text-graphite">Next step — </span>
                    {result.band.nextStep}
                  </p>

                  <p className="mt-7">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={sendToForm}
                    >
                      {snapshot.handoffCta}
                    </button>
                  </p>
                </div>
              ) : (
                <p className="mono text-graphite">
                  {answered} of {snapshot.questions.length} answered
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
