# Brief - lane tests-docs - chat CORE - base 655516dc - scout 2026-11-07 07:19 IST

## What the lane is for
(v1 unit sections U-34, U-37, U-36a, U-35, U-36b: tracks/CORE/briefs/tests-docs/v1-annex.md)

Prove the file works (a Playwright harness that opens the built `offline/1-addic.html` offline at 390 px and runs the 3.13 flows by name), say so truthfully (offline/README.md, README and CLAUDE.md sections, ADR 0022, `npm run check`), and teach it (the guide .md/.docx and about 30 screenshots). Not flagged. Slice = U-34. Batches: [U-34], then [U-37, U-36a], then [U-35, U-36b].

## State at the base (655516dc)
`offline/` holds only `src/content-core.js` and `src/content-lessons-a.js`. No package.json, build.mjs, tests, node_modules, built file. No contracts existed in tracks/*/contracts when scouted: every DOM hook below comes from BUILD-PLAN 3.2/3.5/3.11 text and is an ASSUMPTION. At build time re-read tracks/CORE/contracts/*.md and tracks/SCREENS/contracts/*.md and fix `helpers/hooks.mjs` (the one place to change). Node v22.22.3 present; python-docx 1.2.0 installed; `~/.claude-pro/skills/word-doc-generator/gen_docx.py` exists. Event Money's `build_guide.py` is at C:\Users\ruchi\event-offline\docs\build_guide.py (outside this repo; read it, copy, adapt). Playwright and Chrome presence unknown: check, never install silently (Q1).

## Files
Owned (new): `offline/tests/browser.test.mjs`, `offline/tests/screens.mjs`, `offline/tests/helpers/{run-browser.mjs,launch.mjs,hooks.mjs,flows.mjs}`, `offline/docs/1-addic-Guide.md`, `offline/docs/build_guide.py`, `offline/docs/images/*`, `offline/README.md`, `docs/decisions/0022-offline-edition.md`, `package-lock.json`.
Shared, append only: `README.md`, `CLAUDE.md` (a `## Offline edition` section at the end; nothing above changes).
`package.json`: you own ONLY `scripts.test:browser`, `scripts.screens`, `scripts.check` and `devDependencies`. Core (U-01) creates the file and writes `scripts.build` (`node offline/build.mjs`) and `scripts.test` (every offline/tests/*.test.mjs except browser.test.mjs). If package.json is absent when you start, U-01 is not merged: stop and report. Edit it by JSON parse, touch no other key, commit by path.
Do not touch: any other lane's file, docs/offline/ (only the cp of brief/contract/report), docs/PLAN.md, BUILD-GUIDE.md, ADRs 0001-0021, docs/book, scripts/.

## Gate view (tools/gates.py at 655516dc) - what the gate will see
- test gate: `node --test --test-reporter=tap` over the lane's `tests` globs (territory.json); browser.test.mjs is excluded by name; screens.mjs and helpers/** lack the .test.mjs suffix and are not run. So the gate sees NO test file from this lane and reports SKIP "no node test files". Do not rename screens.mjs. If browser.test.mjs is run bare (`node --test` by hand) it must still pass: `const ON = process.env.ADDIC_BROWSER === '1'` and every test is `test(name, {skip: reason}, fn)`; named reasons: "ADDIC_BROWSER not set", "offline/1-addic.html not built", "no Chrome or Chromium found", "route #/x not registered", "hook [data-tour=y] absent". Skips print `# SKIP` and are not failures.
- browser gate: runs `npm run test:browser [-- --grep PATTERN]` under the shared lock; needs a summary line (spec reporter `ℹ tests N`, or TAP `# tests N`), else VOID; zero tests = VOID. So `test:browser` = `node offline/tests/helpers/run-browser.mjs`, which sets ADDIC_BROWSER=1, maps `--grep X` to `--test-name-pattern X`, spawns `node --test --test-reporter=spec offline/tests/browser.test.mjs`, forwards the exit code. If no browser binary exists the suite still prints its skips with the reason and exits 0 (GREEN with skips; the chat reads the reasons). A failure prints `✖ name` and is judged by name: keep test names stable.
- docs gate: `python offline/docs/build_guide.py`; exit 0 is green, no summary line needed; SKIP while absent.
- Output never prints PINs or personal data.

## Decisions that bite
O1 file `offline/1-addic.html`, title "1-addic", discreet title "Notebook". O2 PIN offered, never forced (a test covers skip). O3 India numbers "please verify" plus an international list. O4 read-aloud only by the device's speechSynthesis (the guide says so). O5 no Gujarati, locale 'en'. O6 "Load sample data" marked and erasable. O7 a tier-2 screen honestly working, stub or locked, never a dead button (the guide describes the state shown). O8 the .docx guide in the tag if its skeleton merges.

## Open questions (default taken)
Q1 May the lane run `npm install` (network) for the pinned playwright and lockfile? Default yes in the lane's worktree, latest stable exact version; if refused, write devDependencies with the exact version, no lockfile, and report.
Q2 No browser in the cloud? Default: tests skip with the named reason, gate GREEN with skips.
Q3 Contracts absent at scouting: default to the assumed hooks in the contract file.
Q4 Where do validate and guards live for `check`? Default: in the HUB's gates.py; `check` runs build, test, test:browser, docs.
Q5 PLAN.md (HUB) was not read in full: the builder reads its tests-docs lines.

## Gates and baselines
`python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/tests-docs --lane tests-docs build test validate guards` then `browser` (U-34; the full suite is the HUB's, in the quiet window) and `docs` (U-36a/b). Baselines: coordination/baselines.md is empty (nothing red on the base; judged by failure name). Territory: `python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/check_territory.py tests-docs 655516dc..HEAD --wt C:/Users/ruchi/1-addic-wt/tests-docs`.

## Safety and content rules
SOS works offline, is never gated and never interrupted by a tip or tutorial; urgent help is one tap from SOS; no streak resets, random rewards or points for claimed sober days; no network, no trackers; contacts never leave the device; accessible (keyboard, labels, visible focus, reduced motion, contrast, 44 px targets). Original content only, never the source book's text. Person-first, never "addict" as a noun, adult-to-adult, grade 6-8. Substance use brief and clinical (never how to get, prepare or take it; no sensations, no doses); crisis content shows the urgent-help numbers and little else, marked clinicalReview: true; unsure, write the shorter version. Numbers and links carry verify: true or "please verify". Nothing ever decreases. Tests and screenshots use sample data only.

## Go-aheads
Waits for core U-01 merged (package.json, build.mjs, built file). U-35 and U-36b wait for the SCREENS tier-1 merge. This lane gives core U-01 the go-ahead to write scripts.build and scripts.test; it adds test:browser, screens, check and the playwright devDependency and never another key.

## V3 (2026-11-08 02:52 IST, PLAN-V3.md)
v1 is merged (tag f69bc68a; 19 browser tests, last gate 02:48: 19 tests, 16 pass, 0 fail, 3 skipped). The v1 unit sections moved to tracks/CORE/briefs/tests-docs/v1-annex.md. Worktree build/tests-docs at dfc2703 (BASE + U-35: 79 images in offline/docs/images, 2 per route). Code paths below are the trunk's offline/ (unchanged in src since f69bc68a). Read the attribute per file: ui-*.js SCREENS files use `data-test`; ui-sos.js `data-testid`; `data-tour` targets; R-H-39. Notes per unit: briefs/tests-docs/<unit>.md.

Order and batches: [U-35 done, dfc2703] -> [V-07] -> [V-03, V-06] -> [V-01t, after today-track V-01b merged] -> [V-22a, V-26b, V-27, V-29] (tier 2 only when no tier 1 lane waits). Slice = V-07 (READY-SLICE on the status file when committed and green by name).

### V-07 Guide Parts 3 and 4 (2.5 h, tier 1)
Today: offline/docs/1-addic-Guide.md:169-259 has 14 lessons, each body marked `<!-- U-36b -->`; Part 4 check table :295-301 says Planned; build_guide.py:27 `STRICT_IMAGES = False`. Build: write the 14 lessons against the real screens (names, buttons, order as built; one image each from images/*-phone.png, real alt text); table rows to the real result; "How this guide was checked" with the real counts (npm test total and browser 19/16/3 until V-03, then 19/19/0) and the privacy proof; set STRICT_IMAGES True. Acceptance: `python offline/docs/build_guide.py` exit 0, every image present, no `U-36b` marker left, no "Planned". Original words only. Detail: V-07.md.

### V-03 Hooks round, test side (2.2 h, tier 1)
Build hooks.mjs (today 4813 B, base and ASSUMED hooks only, :9-61) to name every R-S-6/R-S-11 hook with its file's attribute; flows.mjs `advanceUntil` (:46-55) taps helped then Check in; quick-log gets start '#/track'; new flows. Acceptance: `npm run test:browser` 0 skipped for "SOS drill creates no log", "SOS craving flow offline with delay loop and both outcomes", "quick log and evening check-in"; no test weakened. Detail: V-03.md. Ask: none needed (actions-open-planner exists, built as 'actions-open-' + c.id, ui-actions.js:378; unit test tests/actions-ui.test.mjs:260).

### V-06 Docs true (1 h, tier 1)
offline/README.md lines 31, 37, 43, 45, 58, 64-68, 77, 81 are stale; README.md:13-20 and CLAUDE.md "## Offline edition" (`npm run screens` "planned, U-35") need the merged facts; releases/ copy named. Append-only in shared files. Detail: V-06.md.

### V-01t Status layer browser tests (1.5 h, tier 1, after V-01b)
Four tests by name; hooks per PLAN-V3.md section 3 (data-test); guide lesson "Your Harbor" with a screenshot pair; screens.mjs adds `#/status`. Written first against the contract; run at the merge (skip by name 'route #/status not registered' before). Detail: V-01t.md.

### Tier 2 (short; V-22a, V-26b, V-27, V-29 notes)
V-22a: browser.test.mjs:58-66 markOnboarded does `Actions.onboard({})` then `Actions.tutorial.done('tour',{skipped:true})`: await both in order, one try. V-26b: a browser test "boots to the first render within the budget" (time from goto to first `ui:rendered`, printed, bound = 3 runs max x 2). V-27: offline/tests/contrast.test.mjs, pure Node, parse styles.css tokens both themes. V-29: one row in docs/decisions/README.md.

### Rules that bite
SOS never gated or interrupted (assert no overlay in #/sos; status page keeps #sos-btn and status-sos); clinicalReview untouched (no content edits); nothing decreases (the slip test compares every data-level before and after); original words; no network (the harness fails on any non-file request); throwaway PINs and sample data only, never print a PIN.

### Gates
`python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/tests-docs --lane tests-docs build test validate guards`, then `browser` (V-03, V-01t, V-26b) and `docs` (V-07, V-01t, V-06). Use `npm run test:browser -- --grep "<name>"` while iterating.

### Open questions (defaults)
1. Browser-test count in the guide: default the numbers of the last green gate on the merged file at write time. 2. Boot-time bound: default 3 runs on this machine, max x 2. 3. Contrast reds: default the test names the pair, is not skipped, and goes to the token owner by outbox; the lane does not edit styles.css. 4. V-01t before V-01b: default tests skip by name until the route exists.
