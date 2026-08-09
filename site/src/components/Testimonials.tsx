/**
 * Testimonials — built, deliberately not mounted.
 *
 * No real quotes were available at build time, and placeholder testimonials
 * about a real practice are not an acceptable stand-in. The component exists
 * so that adding real quotes is a content change plus one import, not a build.
 *
 * To enable: populate the array below and render `<Testimonials />` in
 * `src/app/page.tsx`, between `<Fit />` and `<Services />`.
 */

import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  organization: string;
}

export const testimonials: Testimonial[] = [];

export function Testimonials() {
  if (!testimonials.length) return null;

  return (
    <Reveal
      as="section"
      id="testimonials"
      labelledBy="testimonials-heading"
      sectionId="testimonials"
      className="section-y border-t border-sage-mist bg-white"
    >
      <div className="shell">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="In their words"
          heading="What clients say"
        />

        <ul className="mt-12 grid gap-px bg-sage-mist md:mt-16 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <li key={testimonial.name} className="bg-white p-7 md:p-10">
              <blockquote className="measure text-[1.0625rem]">
                “{testimonial.quote}”
              </blockquote>
              <p className="mono mt-6 text-graphite">
                {testimonial.name} · {testimonial.role}, {testimonial.organization}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
