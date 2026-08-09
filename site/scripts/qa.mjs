/**
 * Browser QA for the landing page.
 *
 * Covers the things a type-check and a build cannot: responsive overflow, the
 * snapshot → form handoff, form validation and submission, keyboard operability
 * and the mobile menu's focus handling.
 *
 * Usage:
 *   npm run build && npx next start -p 3111
 *   npx playwright install chromium      # first run only
 *   node scripts/qa.mjs                  # QA_BASE_URL overrides the target
 *
 * Playwright is intentionally not a dependency of this project — it is a
 * development tool, and adding it would put a browser download in every
 * install. Screenshots go to QA_OUT_DIR if set, otherwise they are skipped.
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3111';
const OUT = process.env.QA_OUT_DIR ?? '';
const fail = [];
const ok = (m) => console.log('  ok   ' + m);
const bad = (m) => { console.log('  FAIL ' + m); fail.push(m); };

// PLAYWRIGHT_CHROMIUM_PATH lets a preinstalled browser be used instead of a download.
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);

// ---------------------------------------------------------------- desktop
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

console.log('\n== landing page ==');
await page.goto(BASE + '/?utm_source=youtube&utm_medium=video&utm_campaign=ep-42&utm_content=description', { waitUntil: 'networkidle' });

const h1s = await page.locator('h1').count();
h1s === 1 ? ok('exactly one <h1>') : bad(`expected 1 <h1>, found ${h1s}`);

// no horizontal scroll at any width
for (const w of [320, 375, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(120);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  overflow <= 1 ? ok(`no horizontal scroll at ${w}px`) : bad(`horizontal scroll at ${w}px (${overflow}px over)`);
}
await page.setViewportSize({ width: 1440, height: 1000 });

// attribution captured into sessionStorage
const attribution = await page.evaluate(() => window.sessionStorage.getItem('sofia_attribution_v1'));
attribution && JSON.parse(attribution).utm_campaign === 'ep-42'
  ? ok('UTM parameters captured to sessionStorage')
  : bad('UTM capture failed: ' + attribution);

// every in-page anchor resolves to a real element
const dead = await page.evaluate(() =>
  [...document.querySelectorAll('a[href^="#"], a[href^="/#"]')]
    .map((a) => a.getAttribute('href').replace(/^\/?#/, ''))
    .filter((id) => id && !document.getElementById(id)));
dead.length === 0 ? ok('no dead in-page anchors') : bad('dead anchors: ' + [...new Set(dead)].join(', '));

// ------------------------------------------------------------- snapshot
console.log('\n== readiness snapshot ==');
await page.locator('#snapshot').scrollIntoViewIfNeeded();
const groups = page.locator('#snapshot fieldset');
const n = await groups.count();
for (let i = 0; i < n; i++) {
  await groups.nth(i).locator('label').nth(i % 4).click();
}
const band = page.locator('#snapshot h3');
await band.waitFor({ timeout: 3000 });
const bandText = (await band.textContent())?.trim();
bandText ? ok(`result rendered: "${bandText}"`) : bad('no result band rendered');

const live = await page.locator('#snapshot [aria-live="polite"]').count();
live === 1 ? ok('result sits in an aria-live region') : bad(`expected 1 live region, found ${live}`);

// handoff into the form
await page.getByRole('button', { name: /send this snapshot/i }).click();
await page.waitForTimeout(700);
const handoff = await page.locator('#contact-form').getByText(/readiness snapshot will be sent/i).count();
handoff === 1 ? ok('snapshot handed off to the form') : bad('snapshot handoff not reflected in form');

// --------------------------------------------------------- form validation
console.log('\n== form ==');
await page.locator('#contact-form').scrollIntoViewIfNeeded();
await page.getByRole('button', { name: /send my enquiry/i }).click();
await page.waitForTimeout(300);
const shownErrors = await page.locator('#contact-form p[id$="-error"]').allTextContents();
shownErrors.length >= 4 ? ok(`inline errors shown (${shownErrors.length})`) : bad('expected inline errors, got ' + shownErrors.length);
shownErrors.every((t) => t.length > 15) ? ok('errors are specific, not generic') : bad('a generic error message slipped through');

const invalid = await page.locator('#contact-form [aria-invalid="true"]').count();
invalid >= 4 ? ok(`aria-invalid set on ${invalid} fields`) : bad('aria-invalid not set');

// "Talk about this" preselects the interest
await page.locator('#services').scrollIntoViewIfNeeded();
await page.getByRole('link', { name: /talk about this.*Strategy and operating/i }).first().click();
await page.waitForTimeout(500);
const preselected = await page.locator('#interest').inputValue();
preselected === 'strategy' ? ok('service link preselects the interest') : bad('interest not preselected, got: ' + preselected);

// fill and submit for real
await page.fill('#name', 'Jordan Reyes');
await page.fill('#email', 'jordan@example.com');
await page.fill('#company', 'Northgate Foods');
await page.selectOption('#companySize', '50-249');
await page.fill('#situation', 'We are 60 people and every pricing decision still routes through me. Two managers left this year.');
await page.locator('#contact-form input[name="consent"]').check();
await page.waitForTimeout(3200); // clear the min-time-on-form check
await page.getByRole('button', { name: /send my enquiry/i }).click();
await page.locator('#contact-form').getByText(/your enquiry is with me/i).waitFor({ timeout: 8000 })
  .then(() => ok('form submits end to end and confirms in place'))
  .catch(() => bad('form did not reach the confirmation state'));

// -------------------------------------------------------------- keyboard
console.log('\n== keyboard ==');
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
/skip to content/i.test(firstFocus ?? '') ? ok('first Tab reaches the skip link') : bad('skip link not first in tab order: ' + firstFocus);

// A focus trap is focus *stuck* on one element, not focus leaving the document
// at the end of the tab order — that is what is supposed to happen.
const stops = [];
for (let i = 0; i < 300; i++) {
  const id = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    return el.tagName + ':' + (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30);
  });
  if (id === null) break;
  stops.push(id);
  await page.keyboard.press('Tab');
}
const tail = stops.slice(-12);
const stuck = tail.length === 12 && new Set(tail).size === 1;
!stuck && stops.length > 10
  ? ok(`tab order completes in ${stops.length} stops, no trap`)
  : bad(stuck ? 'focus trapped on ' + tail[0] : 'tab order suspiciously short: ' + stops.length);

// mobile menu: opens, traps focus, closes on Escape
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole('button', { name: 'Menu' }).click();
await page.waitForTimeout(200);
(await page.locator('#mobile-menu').count()) === 1 ? ok('mobile menu opens') : bad('mobile menu did not open');
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
(await page.locator('#mobile-menu').count()) === 0 ? ok('mobile menu closes on Escape') : bad('Escape did not close the mobile menu');
const returned = await page.evaluate(() => document.activeElement?.textContent?.trim());
returned === 'Menu' ? ok('focus returns to the menu button') : bad('focus not restored, got: ' + returned);

// ------------------------------------------------------------ screenshots
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(900);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
if (OUT) await page.screenshot({ path: OUT + '/desktop.png', fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(900);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
if (OUT) await page.screenshot({ path: OUT + '/mobile.png', fullPage: true });

console.log('\n== console ==');
errors.length === 0 ? ok('no console errors or page exceptions') : bad('console errors: ' + errors.slice(0, 5).join(' | '));

await browser.close();
console.log(`\n${fail.length === 0 ? 'ALL CHECKS PASSED' : fail.length + ' CHECK(S) FAILED'}`);
process.exit(fail.length ? 1 : 0);
