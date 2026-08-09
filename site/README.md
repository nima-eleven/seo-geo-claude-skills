# Sofia Mo — website

A single-page marketing site for Sofia Mo, management consultant and
organizational development advisor.

The site exists to do one thing: **turn an anonymous YouTube view into a named,
reachable, qualified contact.** Every section is there to move a visitor one
step closer to submitting the enquiry form. If a change does not serve that, it
is decoration.

Built with Next.js 15 (App Router), TypeScript and Tailwind CSS v4.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # optional — the site runs with it empty
npm run dev                    # http://localhost:3000
```

Every environment variable is optional. With none set, the site builds and runs;
the sections that depend on missing data hide themselves rather than showing
empty states. See [Fallbacks](#fallbacks).

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Type-check without emitting |
| `node scripts/qa.mjs` | Browser QA suite (see [QA](#qa)) |

---

## Editing content without touching code

All copy lives in `src/content/`. These are TypeScript files, but you only ever
edit the text between quote marks. Each file is typed, so if something is
malformed the build fails with a clear message instead of shipping broken.

| File | What it controls |
| --- | --- |
| `site.ts` | Name, positioning line, hero copy, contact details, social links |
| `services.ts` | The engagement cards in "How Sofia helps" |
| `fit.ts` | The "This is a fit if / is not a fit if" lists |
| `experience.ts` | Biography, professional history, credentials |
| `snapshot.ts` | Readiness Snapshot questions, scoring bands, interpretations |
| `form.ts` | Form labels, dropdown options, success and error copy |
| `videos.ts` | Manual fallback video list (see [Fallbacks](#fallbacks)) |
| `insights/*.mdx` | Articles |

### Changing the email address, LinkedIn, or YouTube link

Open `src/content/site.ts` and edit the `contact` block. Anything still written
as `{{LIKE_THIS}}` is an unfilled placeholder — replace the whole thing,
braces included.

### Adding or removing a service

Edit `src/content/services.ts`. The layout adapts automatically to two, three
or four entries. The `id` must match one of the dropdown values in
`form.ts` → `interests`, because the "Talk about this" link uses it to
preselect the form.

### Adding an article

Create a new `.mdx` file in `src/content/insights/`, for example
`delegation-is-a-structure-problem.mdx`:

```mdx
---
title: 'Delegation is a structure problem'
slug: 'delegation-is-a-structure-problem'
date: '2026-03-14'
excerpt: 'One sentence that makes someone want to read it.'
tags: ['Delegation']
draft: false
---

Write the article here in Markdown. Headings with `##`, lists with `-`,
**bold**, and [links](https://example.com) all work.
```

- `date` must be `YYYY-MM-DD`.
- `readingTime` is calculated automatically; set it explicitly to override.
- Set `draft: true` to keep a post out of the published site.
- The article appears on the homepage, at `/insights`, at `/insights/<slug>`,
  and in `/rss.xml` with no further steps.

### Turning on the credibility strip

The band of numbers under the hero (years advising, engagements, sectors) is
**off by default**, because shipping invented figures about a real practice is
worse than shipping none. In `site.ts`, replace every `{{TOKEN}}` in
`credibility.items` with a real number, then set `credibility.enabled: true`.

### Adding testimonials

`src/components/Testimonials.tsx` is written but deliberately not mounted, for
the same reason. Populate its `testimonials` array with real quotes, then add
`<Testimonials />` to `src/app/page.tsx` between `<Fit />` and `<Services />`.

---

## Environment variables

Copy `.env.example` to `.env.local`. Nothing here is required to run the site.

| Variable | Purpose | If unset |
| --- | --- | --- |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | Falls back to the RSS feed |
| `YOUTUBE_CHANNEL_ID` | Channel ID (`UC…`) | Falls back to `videos.ts` |
| `YOUTUBE_UPLOADS_PLAYLIST_ID` | Uploads playlist (`UU…`) | Resolved via one extra API call |
| `RESEND_API_KEY` | Transactional email | Enquiries accepted and logged, not emailed |
| `CONTACT_TO_EMAIL` | Where enquiries are delivered | As above |
| `CONTACT_FROM_EMAIL` | Verified Resend sender | As above |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin for canonicals and JSON-LD | Uses `site.domain` |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | Plausible domain | Analytics script omitted; events no-op |

**Never commit a filled-in `.env.local`.** It is already in `.gitignore`.

---

## Fallbacks

The site is built so that a missing key or a failed third-party call degrades
visibly-correctly rather than breaking a layout.

**YouTube — three sources, tried in order.** Data API v3 → RSS feed → the
manual list in `src/content/videos.ts`. A failed API call is caught and logged,
never rendered. If all three yield nothing, the Watch section is omitted
entirely and the links pointing to it (header nav, hero secondary CTA, footer)
are omitted with it, so there are no dead anchors.

**Videos never load an iframe on page load.** Cards are a thumbnail-plus-play
facade; the player is swapped in on click, from `youtube-nocookie.com`. This is
mandatory, not an optimisation: nine live iframes would each pull the YouTube
player bundle and destroy the LCP budget.

**Email.** Without Resend configured, a valid enquiry still returns success and
is logged server-side, so the form can be exercised end to end in development.
The notification email failing is treated as a real failure (the lead would be
lost); the auto-acknowledgement failing is not.

**Optional UI hides itself** rather than rendering a placeholder: the booking
CTA without `{{CALENDAR_URL}}`, the CV button without `{{CV_PDF_URL}}`, the
Insights section with no published posts, the Contact section with no real
channels.

---

## Placeholder tokens

These render visibly on the page as `{{TOKEN}}` so nothing ships unnoticed.
Replace each one in `src/content/`. **The site is not ready to launch while any
of these remain.**

| Token | Where | Notes |
| --- | --- | --- |
| `{{PORTRAIT_IMAGE}}` | `site.ts`, `experience.ts` | Path or URL. Hero renders a sized placeholder block until set, so adding it shifts nothing |
| `{{BIO_SHORT}}` | `experience.ts` | Also used in JSON-LD |
| `{{BIO_LONG}}` | `experience.ts` | 150–220 words, first person |
| `{{SECTORS}}` | `site.ts` | Hero footnote |
| `{{YEARS_EXPERIENCE}}` `{{ENGAGEMENTS_COUNT}}` `{{SECTORS_COUNT}}` `{{TEAM_MEMBERS_TRAINED}}` | `site.ts` | Credibility strip; keep it disabled until all four are real |
| `{{EMAIL}}` `{{PHONE}}` | `site.ts` | Contact section, form fallback, JSON-LD |
| `{{LINKEDIN_URL}}` `{{YOUTUBE_URL}}` | `site.ts` | Also the `sameAs` array in JSON-LD |
| `{{CHANNEL_HANDLE}}` | `site.ts` | e.g. `@sofiamo`. Drives the subscribe buttons |
| `{{CALENDAR_URL}}` | `site.ts` | Optional — CTA hidden while unset |
| `{{CV_PDF_URL}}` | `site.ts` | Optional — button hidden while unset |
| `{{LOCATION}}` | `site.ts` | Optional |
| `{{YEAR_RANGE}}` `{{ROLE}}` `{{ORGANIZATION}}` `{{ONE_LINE_SCOPE}}` | `experience.ts` | One set per timeline entry |

`{{DOMAIN}}` and `{{RESPONSE_TIME}}` from the original spec are already
resolved: the domain is `site.domain` / `NEXT_PUBLIC_SITE_URL`, and the
response time is set to "within two business days" in `site.ts`.

---

## Assumptions to confirm with Sofia

These were not specified and were decided in order to ship something coherent.
Each is a one-line change.

1. **Domain** defaults to `https://sofiamo.com` (`site.ts` → `domain`, or
   `NEXT_PUBLIC_SITE_URL`).
2. **YouTube channel** is unknown. Built against env vars with the manual
   fallback list left empty.
3. **Persona company size** assumed 10–250 employees (`fit.ts`).
4. **The three service offerings** are proposed, not confirmed
   (`services.ts`). Wording and deliverables need Sofia's review.
5. **Snapshot question wording, bands and interpretations** are proposed
   (`snapshot.ts`). The scoring is percentage-based, so questions can be added
   or removed without breaking the bands.
6. **Fit / not-a-fit lists** are proposed (`fit.ts`).
7. **Booking tool** assumed absent. The CTA slot exists but is hidden.
8. **Testimonials and client logos** assumed unavailable. Component built,
   not mounted.
9. **Privacy policy** is a clearly-marked draft with `TODO`s at
   `src/app/privacy/page.tsx`, and is `noindex` until reviewed. It describes
   what the site actually does, but it is not legal advice and needs review
   before launch.
10. **Site is English only.** All strings live in content files, so a locale
    layer later is not a rewrite.

---

## Measurement

The whole premise is that a view is not enough, so tracking is a first-class
part of the build, not an afterthought.

Events fired: `cta_click`, `section_view`, `video_card_click`,
`youtube_subscribe_click`, `snapshot_start`, `snapshot_complete`, `form_start`,
`form_submit_success`, `form_submit_error`, `article_read`.

They go through `src/lib/analytics.ts`, which supports Plausible and GA4 and is
a safe no-op when neither is present.

### Tagging YouTube links — important

For attribution to work, every link Sofia places in a video description or
pinned comment must be tagged:

```
https://sofiamo.com/?utm_source=youtube&utm_medium=video&utm_campaign=<video-slug>&utm_content=description
```

The site captures these **on arrival**, persists them in `sessionStorage`, and
attaches them to the form submission — so a visitor who lands from a tagged
link, reads an article and then enquires is still attributed to the original
video. This is what turns "which videos get views" into "which videos get
clients".

Add `&v=<video-id>` to record the specific source video in the
`landing_video_id` field.

---

## Deployment

Designed for Vercel.

1. Push the repository and import it in Vercel. Set the project root to `site/`.
2. Add the environment variables from the table above under
   Settings → Environment Variables.
3. Deploy. The homepage uses ISR with a six-hour revalidation, which is what the
   YouTube section needs; everything else is static.
4. Point the domain, and set `NEXT_PUBLIC_SITE_URL` to match — canonical URLs
   and JSON-LD are absolute and read from it.
5. For email, verify the sending domain in Resend and set `CONTACT_FROM_EMAIL`
   to an address on it.

Any host that runs Next.js 15 works; only the ISR caching is Vercel-specific
in its tuning.

---

## QA

`scripts/qa.mjs` drives a real browser through the things a build cannot check:
responsive overflow from 320px to 1920px, the snapshot → form handoff, form
validation and submission, keyboard operability, and the mobile menu's focus
handling.

```bash
npm run build
npx next start -p 3111 &
npx playwright install chromium     # first run only
node scripts/qa.mjs
```

Playwright is deliberately not a dependency — it is a development tool, and
including it would put a browser download in every install. Set
`PLAYWRIGHT_CHROMIUM_PATH` to use a preinstalled browser, `QA_BASE_URL` to
target a deployed URL, and `QA_OUT_DIR` to save screenshots.

### Verified in this build

- Type-check and production build clean.
- All checks in `scripts/qa.mjs` pass, including a 33-stop keyboard walkthrough
  with no focus trap and no console errors.
- Contact API: validation errors, honeypot, minimum-time check, and per-IP rate
  limiting (5/hour, isolated per IP) all confirmed by direct request.
- Facade player confirmed: zero iframes on load, `youtube-nocookie.com` player
  swapped in on click.
- Colour contrast computed for every token pair in use — all pass WCAG 2.2 AA.
  Ratios are recorded in the palette comment in `src/app/globals.css`.

### Not verified here

- **The live YouTube fetch.** The build environment's proxy blocks
  `youtube.com` and `googleapis.com`, so the API and RSS paths could not be
  exercised against the real service. The degradation path *was* verified: a
  failed fetch is caught, the section falls through to the manual list, and an
  empty result hides the section without breaking the layout. Check the Watch
  section once a real channel ID is configured.
- **Live email delivery**, for the same reason — no Resend key. The no-key path
  is verified.
- **Lighthouse scores.** Not runnable here. The build reports 121 kB First Load
  JS on the homepage against a 120 kB target; the largest remaining contributor
  is the React and Next runtime itself.

---

## Design notes

Tokens are defined once in `src/app/globals.css` under `@theme`, which makes
them available both as CSS custom properties and as Tailwind utilities.

- **Palette.** Porcelain page, evergreen brand, brass accent used sparingly.
  Measured contrast ratios are in the comment beside the tokens. Note the two
  brass values: `--color-brass` (3.66:1) is for rules, underlines and large
  numerals only, and `--color-brass-deep` (4.52:1) is for anything brass at
  body or utility size — the 12px section numbers would otherwise fail AA.
- **Type.** Fraunces for display, Inter Tight for body, IBM Plex Mono for
  utility labels. The mono face is the connective tissue of the design: it
  signals precision, which is what an organizational development practice sells.
- **Motion.** Hero staggers in once; sections fade in at 15% intersection.
  No parallax, no counters, no scroll-jacking. All of it is disabled under
  `prefers-reduced-motion`.
- **Radius caps at 4px** and there is exactly one shadow token. Sharp and quiet
  reads as considered rather than consumer.

The Readiness Snapshot is the one place the design spends boldness — a white
card on a sage band — because it is the mechanism that converts a passive
viewer into a qualified lead. Everything around it stays restrained.

---

## Structure

```
src/
  app/
    page.tsx              the landing page
    layout.tsx            fonts, metadata, analytics, JSON-LD
    globals.css           design tokens and primitives
    api/contact/route.ts  form handling, anti-spam, email
    insights/             article index and article route
    privacy/              draft privacy policy
    opengraph-image.tsx   generated OG card
    sitemap.ts robots.ts rss.xml/
  components/             one file per section, plus shared primitives
  content/                all editable copy
  lib/                    YouTube, articles, analytics, attribution, validation
scripts/qa.mjs            browser QA suite
```
