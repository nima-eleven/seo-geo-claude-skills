/**
 * The shared section header: mono eyebrow, display heading, optional intro.
 * Every section uses this so the vertical rhythm and the heading hierarchy
 * stay consistent without each component re-deciding them.
 */
export function SectionHeading({
  id,
  eyebrow,
  heading,
  intro,
  className = '',
}: {
  /** Must match the `aria-labelledby` on the parent section. */
  id: string;
  eyebrow: string;
  heading: string;
  intro?: string;
  className?: string;
}) {
  return (
    <div className={`measure ${className}`.trim()}>
      <p className="eyebrow mono">{eyebrow}</p>
      <h2 id={id} className="display-lg mt-5">
        {heading}
      </h2>
      {intro ? <p className="lede mt-5">{intro}</p> : null}
    </div>
  );
}
