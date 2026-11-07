# V3 improvements · review of offline-v1.1 (f69bc68) · 2026-11-08

Read-only review for R-O-5. Tier 1 = makes V3 what the owner asked (the status layer, the v1.2 list, dead ends a person meets); tier 2 = depth. verified = read in code or a log at the path; assumed = from a report or not measurable here. Lanes by territory.json; a new file is assigned by the HUB.

## 1. Candidates, ranked

| id | what | why (evidence) | change | lane | h | tier | v/a |
|---|---|---|---|---|---|---|---|
| V3-01 | The visual status layer "Your Harbor" (section 2) | R-O-5; the Harbor is Today's 15th card and not tappable (ui-today.js:283, :472-477) | new ui-status.js at #/status, a chip in Today's header | today-track (+tests-docs, content, game-tutorials) | 7 | 1 | assumed (new) |
| V3-02 | Warning Sign Radar has no screen: a revealed feature leads nowhere | Engine.warningSigns (engine.js:989-1036) is called by no ui-*.js; Content.features.radar (content-core.js:176, revealed at m10 :189) is routed to /track/radar (ui-guidance.js:74), which ui-track.js:341-342 does not serve | render the radar in V3-01 ("What to watch") and at #/track/radar | today-track | 1.5 | 1 | verified |
| V3-03 | Browser hooks round | hooks.mjs:9-61 holds base and ASSUMED hooks only; R-S-6, R-S-7, R-S-11, R-S-12 name the settings, today/track/harbor, planner, guidance, battle, review, practice hooks; load-sample-note; lock-said | add the hooks and the flows | tests-docs | 1.5 | 1 | verified |
| V3-04 | SOS drill and craving flows always skip | the hooks exist (ui-sos.js:709-710); flows.mjs:46-55 advanceUntil taps only Next/Continue/Start, never sos-helped-yes (ui-sos.js:675) then sos-checkin (:700) or Guide me (:676) | the helper taps helped, then Check in | tests-docs (test-only) | 0.5 | 1 | verified |
| V3-05 | Quick-log flow always skips | data-tour quicklog-button sits on #/track only (ui-track.js:452); the flow has no start (browser.test.mjs:239); R-S-16 | start: '#/track' | tests-docs | 0.2 | 1 | verified |
| V3-06 | offline/README.md is stale | says the data layer, PIN, export, Settings and discreet switch are planned and the label always says Not saved; all merged (tag f69bc68); the pass is owed (lane-reports/tests-docs.md) | rewrite the today/planned pass; README.md and CLAUDE.md sections too | tests-docs | 1 | 1 | verified |
| V3-07 | Guide Part 3 and 4 and the screenshots | 1-addic-Guide.md: 14 lessons marked U-36b, Part 4 rows "Planned"; U-35 running (status-HUB 02:14) | U-35, U-36b with the check counts | tests-docs | 4 | 1 | verified |
| V3-08 | A skill used in a game is never credited (R-C-39) | ui-tools.js:315 recordEvent('SkillUsed') is refused (USE_VERB) and swallowed; ruling contracts/actions-sos.md:175 | Actions.useSkill({skillId, helpful}); ui-tools calls it | actions-sos, then game-tutorials | 1 | 1 | verified |
| V3-09 | The clinical-review copy (R-C-9, R-C-13) | clinicalReview marks in 13 files: ui-sos.js COPY, FALLBACK, CRISIS, OVERDOSE, LEAD; boot.js:27; ui-core.js URGENT; ui-onboarding.js x3; ui-settings.js:58; ui-exercise.js; engine.js CRISIS; M9/M10 lessons, 4 exercises, 5 practices, opioidSafety | one review pack by path; fixes by name after the reviewer | owner; content, actions-sos | 2 | 1 | verified |
| V3-10 | India crisis numbers (I6) | 17 verify: true in content-core.js; "please verify" shown (ui-sos.js:54, ui-core.js:40, boot.js:30) | the owner checks; content clears the flags | owner; content | 0.5 | 1 | verified |
| V3-11 | No help on screen before boot | shell.html <main> is empty until UI.boot; boot.js shows numbers only on a start failure; a slow 1.1 MB parse or an error before boot.js leaves nothing | a static emergency line and the built-in number inside #main, replaced at first render | core | 0.5 | 1 | verified (shell); parse time assumed |
| V3-12 | Launcher: --pause lost | once() loads state at its top and saves at its end (tools/fresh_chat_launcher.py:563-566, :617); a --pause written meanwhile (:1075-1079) is overwritten | re-read paused and paused_tracks before deciding; save only once()'s own keys | HUB | 0.5 | 2 | verified |
| V3-13 | Launcher: double launch | launch_missing() runs once() in a second process with no lock (:688-696) while the loop's tick runs the same (:651-664) | a lock file around once(); a per-track launching lease on disk | HUB | 0.5 | 2 | verified |
| V3-14 | Launcher: a dead listed chat counts as live | live_sessions() keeps every `claude agents --json` row (:174-195); once() filters by kind only (:608); pid_alive (:622) is never applied | drop a row whose pid is gone or whose transcript is 30 min still | HUB | 0.5 | 2 | verified |
| V3-15 | lane.js truncates reviewer findings | findingsText cuts at 2,000 chars (tracks/HUB/workflows/lane.js:395-398); fix rounds saw ids only (R-C-12) | write findings to a file and pass the path; cap at 12,000 like prevNote | HUB | 0.5 | 2 | verified |
| V3-16 | core LOWs N1, N2, Q-a | contracts/core.md:117-119 (role=group over an implicit role; contenteditable loses its tab stop; a bare control unnamed) | as ruled | core | 1 | 2 | verified (ruling) |
| V3-17 | Store.status().lockId (RS26 remainder) | contracts/actions-sos.md:130: a retry after another tab erased and set a new PIN could write into the new notebook | opaque lockId in status(); SOS marks its waiting saves with it | core, actions-sos | 1 | 2 | verified (ruling) |
| V3-18 | actions-sos RC23, RC22, R8-RC1 | contracts/actions-sos.md:172, :177, :183: a status change over a sample plan keeps the mark and BattlePlanCreated only for the person's row; two test gaps | as ruled | actions-sos | 1 | 2 | verified (ruling) |
| V3-19 | A filled spiral reply looks like the person's own (FIX-SPIRAL-OWN) | engine.js:729 fills an empty reply from catalogs.slipSelfTalk; SOS cannot tell | add own: boolean to each pair | engine | 0.5 | 2 | verified |
| V3-20 | learn C3 | ui-learn.js:610 says "+10 XP" on every checkpoint finish; CheckpointCompleted earns once per module (engine.js:181) | the XP words only the first time | learn | 0.3 | 2 | verified |
| V3-21 | game-tutorials C1 and the coach after a route change | no Node case for the narrow/flip branch (ui-guidance.js:329-335); a missing target shows a centred card (:310-315), which covered exercise-save (board 01:39) | end the tour (aborted) when the route leaves Today; test both branches | game-tutorials | 1 | 2 | verified |
| V3-22 | tests-docs C-TM-1; workbook-settings C1b | lane-reports/tests-docs.md FIX-TOURMARK; workbook-settings.test.mjs:284-294 conditional, not an assert | test-only | tests-docs; workbook-settings | 0.5 | 2 | verified (report) |
| V3-23 | content C2-C4 | content-sample.js:6 header vs plans 1-3 days ahead; the sample erase assertion; the 'guide' id note | one comment, one assert | content | 0.3 | 2 | verified (report) |
| V3-24 | Early-access copy out of date | ui-settings.js:65 "Some screens are still being built"; every screen is merged, the honest stubs (ui-tools.js:288, ui-practices.js:163, ui-workbook.js:487) only show when content is missing | one sentence | workbook-settings | 0.2 | 2 | verified |
| V3-25 | Unlock gives no sign of life | the lock form only disables its controls during the key derivation (ui-onboarding.js:240-252), about 1.2 s on a PC (lane-reports/actions-sos.md), longer on a phone; set-PIN says One moment (:41), unlock says nothing | an aria-live "Opening your notebook" line; time it on the owner's phone | actions-sos | 0.3 | 2 | code verified; phone time assumed |
| V3-26 | Boot-time budget for the 1.1 MB file | 1,113,578 B, every part inline; no test measures time to the first ui:rendered (browser.test.mjs names) | a browser test that reports and bounds it; build.mjs prints per-part sizes | tests-docs, core | 1 | 2 | assumed |
| V3-27 | Contrast guard | .coach-sos and .gt-dot contrast unmeasured (lane-reports/game-tutorials.md); gates.py guards are csp, external-url, innerHTML, theme-parity, tour-target only | a Node check of the fg/bg token pairs in both themes at 4.5:1 | tests-docs | 1 | 2 | assumed |
| V3-28 | Teach the status layer (house rule 5) | a new feature needs its JIT tutorial, help entry and tour step | Content.features.status, tutorials, help; a tour step on status-open | content, game-tutorials | 0.5 | 2 | assumed |
| V3-29 | ADR 0022 index row | asked in lane-reports/tests-docs.md; docs/decisions/README.md has no 0022 line | one row | HUB | 0.1 | 2 | verified |

Tier 1: 11 (about 20 h). Tier 2: 18 (about 11 h).

## 2. The dedicated visual status layer

**Name and route.** "Your Harbor", a page at `#/status`, registered as `UI.pages.status` from a new `offline/src/ui-status.js` (StatusUI). No core edit: pageKey accepts any registered segment (ui-core.js:561-565); build.mjs gets one parts line at its append point; the CSS goes in today-track's section. One tap from Today: a "Your harbor" chip in the header quick row beside Log a craving and SOS (ui-today.js:507-509); the harbor card becomes a link; a "New" dot via GuidanceUI.dot once `Content.features.status` exists.

**What the person sees, top to bottom.**
1. The scene: `HarborUI.scene(ctx)` full width (reused, not redrawn). Tap a place: a sheet lists that region's skills with level and uses (`GameUI.model(gs).skills` by region) and the next level's count.
2. "What just changed": one line per rise since the page was last drawn (memory only, like GameUI's seen): a light that grew (place, level), XP today, a badge, a rank, an Explorer or quest step, a day banked. The matching place pulses once (class `hb-grew`, transform scale 300 ms; none under prefers-reduced-motion, data-motion=reduce or an SOS route: the words carry it). First open: "Here is where you stand."
3. "Where you stand": `GameUI.rankCard`, `GameUI.xpBar`, the badge count (one shared model object), days in total when counters are on and discreet is off (never the current run), and a 14-day strip of dated dots from `Engine.momentum(...).dates` (a history, not a score; no count headline).
4. "What to watch": `Engine.warningSigns(view, now)`, each with its plan (own plans win), gentle wording, never red; empty state "Nothing to watch right now." Closes V3-02.
5. "Next small step": the first undone `Engine.explorer` item, else `Engine.nextLesson` / `Engine.roadmap().focus`, else an open quest step. One link.
6. Back to Today; SOS as a page link (`status-sos`) beside the chrome's `#sos-btn`, present on every page.

**Engine derivations that feed it:** `gameState` (xp, mastery, regions, rank, badges, counters, momentum), `explorer` / `explorerDone`, `quests`, `warningSigns`, `roadmap` / `nextLesson`, `revealed` / `newDots`. The diff is a pure function in StatusUI (`model(gs, extra)`, `diff(before, after)`); in the Engine instead, engine adds 0.5 h.

**How it shows the effect of actions.** Every write goes through Actions, the Store notifies and ui-core re-renders the page (Store.subscribe(schedule), ui-core.js:1009): log a craving and the page redraws with "Weather Station: more light" or "+5 XP today"; finish a lesson and the Explorer step ticks; reach a contact and the Pier gains. The diff reports rises only: a slip shows no "down" line and no light dims (levels come from the append-only log).

**What never decreases:** levels, XP, badges, rank, total days, Explorer and quest ticks; the current run is never on this page; the dots strip is dated history. **Calm:** no scene, XP or badges; the places as a list, what to watch, next step. **Discreet:** no scene, no days. **Builds on, does not duplicate:** HarborUI.scene, GameUI.model/rankCard/xpBar, GuidanceUI.dot, the Explorer routes; ui-harbor.js gains only `data-place` taps and the `hb-grew` class.

**Hooks.** data-test: status-page, status-scene, status-place (data-region, data-level), status-change, status-change-item (data-kind), status-days, status-strip, status-strip-day (data-date, data-active), status-watch, status-watch-item (data-sign), status-next, status-next-go, status-sos; Today: today-status, today-harbor-go. data-tour: status-open, status-scene, status-change, status-watch.

**Tests.** Node (`offline/tests/status.test.mjs`, assigned by the HUB): model and diff pure and deterministic; a SkillUsed raises its region and the diff names it; a slip leaves every level equal and the diff empty; Calm, discreet and reduced-motion rules; no dead button, SOS one tap away; text as text, no network, pure exports only. Browser (tests-docs): "status opens from Today in one tap"; "status shows the change after a quick log"; "status: a slip lowers no light"; "status under reduced motion has no moving class".

**Hours:** ui-status.js 3; Today chip and harbor link 0.5; CSS 0.5; Node tests 1; hooks, flows 1; guide lesson and screenshot 0.5; feature, tutorial, help 0.5. About 7 h: today-track 5, tests-docs 1.5, content and game-tutorials 0.5.

**Three questions for the owner.**
1. A page at #/status or an overlay from Today? Default: a page (the back button works, it prints, nothing sits over SOS).
2. Show the 14-day activity strip, which changes as days roll off? Default: show it as dated dots, no count; drop it if only growing things may appear.
3. "What just changed" since the page was last drawn (this session) or since you last looked (one settings key through Actions.settings.patch)? Default: this session, no new write.

## 3. Not recommended

- Streaks, streak resets, the current run as a headline: house rule 2; counters give no XP (engine.js:418-424).
- Random rewards, spinners, loot, "almost there" countdowns on badges (ui-game.js badgeShelf keeps none).
- Points or XP for claimed sober days; a "risk score" or red colour from the radar (BUILD-PLAN 3.9: gentle, never red).
- Sharing, leaderboards, sync, cloud backup, notifications, a service worker: no network (CSP connect-src 'none'), file://.
- Remote fonts, icons or analytics; a second file or lazy content (one file, ADR 0022).
- The book's text, chapter quotes or close paraphrase (ADR 0002); chapter numbers only as metadata.
- Caching the PIN or a weaker key derivation for speed (BUILD-PLAN 3.3); V3-25 instead.

## 4. What I verified and what I assumed

Verified by reading: BUILD-PLAN.md 2-3; PLAN.md 2; board-notes.md, territory.json, the four outboxes (grep LOW, open, v1.1, v1.2, hooks, R-C-39, R-S-16); every lane report of CORE and SCREENS; contracts/core.md and actions-sos.md rulings; BUILD-GUIDE.md house rules; offline/README.md; 1-addic-Guide.md; ui-harbor.js, ui-game.js, ui-guidance.js, ui-today.js whole; engine.js 177-490, 587-672, 781-827, 874-1036; ui-core.js router; ui-sos.js 690-740 and its clinicalReview blocks; ui-onboarding.js lock form; ui-tools.js 308-320; ui-learn.js 606-612; ui-track.js 341-342, 452; content-core.js keys; shell.html, boot.js, build.mjs; styles.css motion rules; browser.test.mjs, hooks.mjs, flows.mjs; fresh_chat_launcher.py once, loop, launch_missing, live_sessions, pause; lane.js 395-398.

Assumed, not measured here: parse, first paint and key derivation time on a phone; colour contrast; the grade 6-8 reading level; the clinical soundness of any passage; the LOWs I did not re-read in code (rows marked "ruling" or "report"). Nothing was run, built, tested or committed.
