/**
 * Which optional sections of the landing page actually rendered.
 *
 * The Watch and Insights sections omit themselves when they have no content.
 * The header, hero, form confirmation and footer all link to them, so they
 * need to know — otherwise a visitor clicks an anchor that matches nothing and
 * the page simply does not move, which reads as a broken site.
 */
export interface PageSections {
  watch: boolean;
  insights: boolean;
}
