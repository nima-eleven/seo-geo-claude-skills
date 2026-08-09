import { fitContent } from '@/content/fit';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/**
 * Self-qualification. Honest disqualification builds more trust than universal
 * appeal, and it filters the inbound so Sofia's time goes to real prospects.
 */
export function Fit() {
  return (
    <Reveal
      as="section"
      id="fit"
      labelledBy="fit-heading"
      sectionId="fit"
      className="section-y"
    >
      <div className="shell">
        <SectionHeading
          id="fit-heading"
          eyebrow={fitContent.eyebrow}
          heading={fitContent.heading}
          intro={fitContent.intro}
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-[4px] border border-sage-mist bg-sage-mist md:mt-16 md:grid-cols-2">
          <Column
            heading={fitContent.fit.heading}
            items={fitContent.fit.items}
            tone="yes"
          />
          <Column
            heading={fitContent.notFit.heading}
            items={fitContent.notFit.items}
            tone="no"
          />
        </div>
      </div>
    </Reveal>
  );
}

function Column({
  heading,
  items,
  tone,
}: {
  heading: string;
  items: string[];
  tone: 'yes' | 'no';
}) {
  return (
    <div className={tone === 'yes' ? 'bg-white p-7 md:p-10' : 'bg-porcelain p-7 md:p-10'}>
      <h3 className="mono text-graphite">{heading}</h3>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            {/* Marks are decorative; the column heading carries the meaning. */}
            <span
              aria-hidden="true"
              className={
                tone === 'yes'
                  ? 'mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-evergreen'
                  : 'mt-3 h-px w-3 flex-none bg-graphite'
              }
            />
            <span className={tone === 'yes' ? '' : 'text-graphite'}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
