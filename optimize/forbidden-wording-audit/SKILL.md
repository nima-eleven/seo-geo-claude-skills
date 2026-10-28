---
name: forbidden-wording-audit
description: 'Live, page-by-page audit of a website for forbidden or avoided words and claims from a strategy, brief or house rules, done in real Chrome via Chrome DevTools MCP. Produces a hand-off package for whoever fixes the copy: an HTML report with the section and sentence of every hit, highlighted screenshots, and an Excel checklist with a Done column. Built for iGaming / social-casino sites (Win777, BitPlay, BitSpinWin, VegasGems, BitBetWin) that ban "sweepstakes", "real money", "real cash", "gambling", em dashes or "verified/official distributor" claims, but works for any site and word list. Use it whenever the user wants to find where banned words appear on a live site, screenshot them for a writer or agency to fix, or verify a wording-fix ticket went live, even if they only say "کلمات ممنوع رو تو سایت پیدا کن", "ببین کجای سایت real money نوشته" or "check the pages for banned terms".'
---

# Forbidden-wording audit (live, Chrome DevTools MCP)

The output is a package someone else uses to fix copy, so every finding has to be easy to find on the page. A list of counts isn't enough: each row gives the URL, the section heading above the word, the full sentence, the fix, and a screenshot with the word highlighted.

The bundled scripts do the mechanical work. Most of your effort goes into choosing the right rules, checking false positives, and explaining the result.

## 1. Get the rules

The rules come from the user's strategy or brief, not from memory.
- If the user attached a strategy file (often an HTML export like `Win777_Q4_Strategy.html`), read it. Look for sections such as "Rules every task follows", "Stop doing", "house rules", or wording-fix tickets (WIN-103 style). Extract every banned word, phrase and claim. Also note the exemptions: the plan may allow the NCPG name, and it may let pages whose slug contains the word keep their title, meta and H1.
- `rules/win777-house-rules.json` holds the Win777 Q4 2026 rules. It is a ready template. For another site, or for a new plan, copy it to a new file (for example `rules/<site>-rules.json`, or one in the scratchpad) and edit it. Don't edit the Win777 file to suit another site.
- If the plan names a page-specific error (for example "Ultra Thunder's body names Ultra Panda"), add it as a rule with `onlyPaths`.
- Tell the user in one short list which rules you will check. If something in the plan is ambiguous, ask before the crawl rather than after, because the crawl is the slow part.

Rule fields (JSON, case-insensitive JS regex in `pattern`):

| field | meaning |
|---|---|
| `id`, `label`, `severity` | Critical / High / Medium / Low. The report sorts pages by the first (most severe) rule. |
| `pattern` | Regex, double-escaped in JSON. Use word boundaries, and allow `[\s-]+` between words ("real-money"). |
| `fix` | What the writer should do. Shown on every row. |
| `screenshot` | `false` for high-volume, low-severity rules such as em dashes. These are listed per page under a fold, so hundreds of screenshots don't drown the real issues. |
| `exemptContext` | Regexes checked around the match; a hit is skipped when one matches (for example `problem\s+gambling` keeps "National Council on Problem Gambling"). |
| `onlyPaths` | Apply only on these paths. |
| `slugToken` + top-level `slugExemptFields` | A hit in those fields (`<title>`, `meta description`, `H1`) is exempt when the URL path contains the token. Exempt hits go to their own sheet, not into the findings. |

Put a combined claim pattern before the single word it contains (for example "licensed gambling site" before "gambling"). The scanner keeps the longer of two overlapping matches, so the claim wins.

## 2. Make sure Chrome can reach the site

The user wants this done with Chrome DevTools MCP only. Don't substitute Ahrefs or Semrush page content, WebFetch, or curl. Those show a crawl snapshot, not the live page, and they can't produce screenshots.

The scripts start `chrome-devtools-mcp` (pinned to 1.12.0) over stdio. They use the pre-installed Chromium in cloud containers and pass the egress proxy to Chrome themselves. Before the long run, check reachability with a one-page `--urls` run (step 3). If navigation fails with `ERR_TUNNEL_CONNECTION_FAILED`, or curl gets a proxy 403, the environment's network policy is blocking the domain. Tell the user to add the domain under the environment's Network access → Allowed domains, and wait. Don't fall back to another data source.

## 3. Crawl

```bash
SK=<this skill's directory>; OUT=<scratchpad>/<site>-wording; mkdir -p $OUT   # keep it out of the repo
node $SK/scripts/crawl.mjs --site https://win777.us --rules $SK/rules/win777-house-rules.json --out $OUT/crawl > $OUT/crawl.log 2>&1
```

- The seed list comes from `robots.txt` → sitemap(s), with sitemap indexes followed. Internal pages linked from audited pages are added too, unless you pass `--no-follow`. This catches legacy pages that are no longer in the sitemap, which often carry the worst wording. Use `--urls file.json` to audit a given list (for example only the 16 platform pages after a fix ticket), and `--max N` to cap the run.
- Expect about 15–25 seconds per page, so a 140-page site takes 40–60 minutes. Run it in the background (`run_in_background`) and watch `crawl.log` progress with Monitor. Don't poll with sleep. Keep the user posted with a short line now and then.
- The run is resumable: rerunning with the same `--out` skips pages that already finished cleanly.
- The site can intermittently serve a "Page Not Found" or empty body for a real page. On Win777, 14 live blog posts did this in one pass. The crawler retries such pages once at the end, and the report keeps the last result. Pages that are still broken get their own section; mention them to the user as a possible crawl or rendering issue, not as wording findings.

What the scanner does on each page: it reads the rendered DOM, including collapsed FAQ and accordion text, because collapsed text is still copy that Google reads. It wraps each hit in a yellow mark and records the nearest heading, the text block, and whether the hit is in the body, a heading or the H1. For screenshots it hides fixed pop-ups (push-notification prompts, chat bubbles, spin wheels), un-sticks headers, opens the collapsed blocks it needs, and boxes the text block in red. Blocks that fit in one viewport share one screenshot.

## 4. Build the report

```bash
python3 $SK/scripts/report.py --crawl $OUT/crawl --rules <rules.json> --site "Win777" --out $OUT/Win777_Wording_Audit
```

This writes `<Site>_Forbidden_Wording_Report.html` with `screenshots/`, `<Site>_Forbidden_Wording_Findings.xlsx` (sheets Findings, Pages and Exempt), and `<out>.zip`. It prints a JSON summary. Header or footer text counts as site-wide only when it repeats on 3 or more pages, because blog hero bars often carry "header" classes.

## 5. Check before you hand it over

- **False positives.** Count the top-severity matches by text (`grep`/python over `results.jsonl`) and read them. A claim pattern can catch generic text; for example "trusted gambling sites" in a listicle is a gambling-word issue, not a claim that the site is a distributor. If you find false positives, fix the pattern, rerun `report.py` on the same crawl, and say what changed.
- **Cross-check against the plan.** If the strategy file gives counts (for example "12 of 16 platform pages carry the distributor claim"), compare them. Agreement is worth one sentence. A gap is worth investigating before you deliver.
- **Visual check.** Open two or three screenshots (Read the jpeg) to confirm that the word is visible and highlighted and that no pop-up covers it. Also render the top of the HTML once.

## 6. Deliver

- Send the zip and the xlsx with SendUserFile (`display: attach`). The zip is often more than 50 MB, which is too large for an Artifact page. Offer a lighter Artifact with only the Critical pages if the user wants a shareable link.
- Reply in the user's language (Persian when they write Persian), short and decision-oriented:
  - what was checked (pages, rules) and the headline numbers in a small table;
  - where to start: the Critical pages, and any deadline the plan sets for them (for example "WIN-103 live 28 Oct");
  - what was deliberately left out of screenshots (em dashes) and what is exempt (slug title, meta and H1);
  - pages the plan already slates for deletion (410). The writer shouldn't spend time rewriting those;
  - side findings that matter, such as pages that failed to render.

## Files

- `scripts/crawl.mjs`: the crawler. It uses `scripts/mcp.mjs`, a minimal stdio client for Chrome DevTools MCP.
- `scripts/scan.js`, `scripts/shoot.js`: in-page scripts sent through `evaluate_script`.
- `scripts/report.py`: builds the HTML, XLSX and zip. It needs `openpyxl`.
- `rules/win777-house-rules.json`: the Win777 Q4 2026 rules, and the template for new rule files.
