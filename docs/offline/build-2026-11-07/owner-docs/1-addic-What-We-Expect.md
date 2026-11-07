---
title: 1-addic · What We Expect
subtitle: The offline edition, expectation by expectation: what, why, when, where, how and status; what we need from the owner; how we will know it is done
accent: hub
cover: true
toc: true
confidential: false
Prepared by: Claude, the owner's window of the build program
Date: 8 November 2026
Edition: offline-v1.1 (tag f69bc68, 2026-11-08 01:59 IST); V3 planned in PLAN-V3.md
Status: For the owner's review
---

> [!SUMMARY]
> The offline edition of 1-addic is **one file**, `offline/1-addic.html`, that a person opens in a browser on a phone or a computer with no internet, no install and no account. This document lists the **nineteen things we expect of it**, each with the same six parts: what we expect, why, when, where, how (and how anyone can check it), and its status at the tag `offline-v1.1`. **Ten are done in v1.1**, **five are partly done** with the rest planned for V3, and **four are new in V3**: the visual status layer "Your Harbor" (the owner's R-O-5) and, from the owner's order of 03:03 on 8 November (R-O-6), a main quest-line with unlocking rewards, daily objectives that grow the Harbor, and a streak counter that keeps a run going without shaming a break. Three things need the owner now: the walk of the file, the India crisis numbers, and a clinical reader for the safety copy.

## How to read this document

Each expectation has six parts, always in the same order: **What we expect** (one measurable sentence) · **Why** (a house rule or the person's need, in plain words, no medical claims) · **When** (the moment the person meets it, and the release: `offline-v1.1` now, or V3 by its id) · **Where** (the screen and its route, and the file in `offline/src`) · **How** (how the solution does it, and how anyone can check it: a gate^[a check that must be green before a merge or a tag; the six gates are build, test, validate, guards, browser and docs] or test by name, or a two-line manual check) · **Status** (Done in v1.1 · Partly · Planned V3-nn · Owner input needed).

In the tables: **Done** (green) = done in v1.1 · **In progress** (amber) = partly done · **Planned** (blue) = a V3 unit · **Pending** (amber) = waits for the owner's word. Every route, file, gate and test named here was read in the repository (the specification `docs/offline/BUILD-PLAN.md`, the house rules of `docs/BUILD-GUIDE.md`, the program's `PLAN.md`, `DECISIONS.md`, `V3-IMPROVEMENTS.md`, `PLAN-V3.md`, the owner's outbox, the board, the tag text, `offline/src/` and the test names in `offline/tests/`), as they stood at 03:35 IST on 8 November. Nothing was run for this document.

<!-- pagebreak -->

# Part A. The expectations

## 1. One file that works fully offline

**What we expect.** The whole app is one file, `offline/1-addic.html`, that opens from the device's own storage and makes no network request, ever.

**Why.** Privacy by default is a house rule: a page that cannot reach the network cannot leak, and one file needs no store, server, install or account (ADR^[Architecture Decision Record: a short file in docs/decisions that records one settled decision] 0022).

**When.** Every moment of use, airplane mode included. Release: in `offline-v1.1` now.

**Where.** The file itself, built by `offline/build.mjs` from `offline/src/`; in its head a **CSP**^[Content-Security-Policy: a rule written into the file that tells the browser what the page may load or send; here it says nothing from the network, ever] with `connect-src 'none'`.

**How.** The CSP makes the browser refuse every request the page could make, so even a bug cannot send anything. Check: the guards gate (`guard: csp`, `guard: external-url`); the browser flow "loads offline with zero console errors and zero network requests". Manual: airplane mode on, open the file, use SOS, log a craving.

**Status.** Done in v1.1 (1,113,578 bytes). V3: a safety line before any script runs (V3-11); a boot-time budget (V3-26).

## 2. The person's data stays on the device, encrypted, behind an optional PIN

**What we expect.** Every log, answer, contact and setting is stored only in the browser on that device; with a PIN set, every row is encrypted and a lock screen appears after the idle time.

**Why.** The threat is someone at home picking up the phone; a PIN answers it without an account to break into, offered and never forced (O2), because a lock-out nobody can undo is worse than an unlocked notebook nobody asked to lock.

**When.** Offered in onboarding and in Settings → Privacy; the lock after 1, 5 or 15 minutes idle (default 5), or never. Release: in `offline-v1.1` now.

**Where.** `store.js`; the lock screen `#/lock` and the privacy step of `#/onboarding`; `#/settings/privacy`. The top bar's saved label always says where the data is: "Saved on this device", "Saved (fallback)" or "Not saved — export before closing".

**How.** The Store writes to **IndexedDB**^[the browser's own database on the device; it keeps data between visits] (else a snapshot, else memory, and says so); with a PIN the key comes from **PBKDF2**^[a slow, salted way to turn a PIN into an encryption key, so guessing is costly] (SHA-256, 310,000 rounds) and every row is sealed with **AES-GCM**^[a standard encryption method that also detects tampering]-256, the key living in memory only; "Forgot PIN" means erase this device, then restore a backup. Check: `store.test.mjs` "with a PIN the rows hold only their key, iv and ct; a reload keeps them locked". Manual: set a PIN, close the tab, reopen: the lock screen comes first.

**Status.** Done in v1.1. Tier 2 of V3: a sign of life during the unlock (V3-25), an opaque lock id (V3-17), three lock-form findings (V3-16).

## 3. SOS in one tap, never gated, with urgent help and verified numbers

**What we expect.** From every screen, before onboarding and on the lock screen, one tap opens SOS; urgent help is one more tap; no PIN, tip, tutorial or confirm ever stands in the way; every crisis number shown has been checked by the owner.

**Why.** Safety is the first house rule and the safety floor (ADR 0019) keeps SOS working whatever else is locked; a wrong crisis number is the worst failure this product can have, so every number carries "please verify" until the owner clears it (O3, input I6).

**When.** In a craving, a hard feeling, after a slip, or in danger; also as a drill that writes nothing. Release: in `offline-v1.1` now; the numbers wait for the owner (V-Q7).

**Where.** `#sos-btn` in `shell.html` on every page; `#/sos`, `#/sos/craving`, `#/sos/feeling`, `#/sos/slip`, `#/sos/urgent`, `#/sos?drill=1` (`ui-sos.js`); the lock screen's "Urgent help" and "Ride the wave (SOBER)"; the numbers in `content-core.js`.

**How.** The craving flow rates the urge, offers SOBER breathing with a 15-minute wave timer, then the tools rated most helpful, and saves one session; a drill saves nothing; typed crisis words show the numbers at once; with no number in the list, a built-in 112 is shown. Check: `store.test.mjs` "locked: SOS is never gated, and the SOS button hides inside SOS"; the browser flow "SOS reachable and not gated before onboarding or on lock screen". Manual: lock the app, tap Urgent help: the numbers appear without the PIN.

**Status.** Done in v1.1 for the screens, after seven safety review rounds. Owner input needed for the numbers: 17 entries still carry `verify: true`. V3: V3-11; the rating row on one line at phone width (V-SOS10); the two skipped SOS flows made to run (V3-04).

## 4. A learning path M0 to M10 with exercises and checkpoints

**What we expect.** Eleven modules with 55 short lessons, every exercise of the plan's list, and a two-question checkpoint per module; the roadmap paces them by the person's choice and never says "overdue".

**Why.** The app is a skills workbook: learn a skill, try it, keep the result, find it again in SOS; original words only (ADR 0002), and the roadmap is a plan, not a judge.

**When.** A few minutes per lesson, three times a week in the guide's routine. Release: in `offline-v1.1` now.

**Where.** `#/learn` (the map), `#/learn/plan`, `#/learn/glossary`, `#/lesson/<lessonId>`, `#/exercise/<exerciseId>`; `ui-learn.js`, `ui-exercise.js`, the content files.

**How.** A lesson plays as steps with a "try it" exercise where it asks for one; the exercise engine renders 19 field types, keeps a draft for "Finish later" and saves through Actions; the checkpoint has no fail state. Check: `learn.test.mjs` "M0 plays end to end and writes LessonCompleted, CheckpointCompleted, ModuleCompleted"; the validate gate, zero errors over M0 to M10. Manual: Learn → Start Here → three lessons: the Reasons Card appears, and SOS → Remind me why shows it.

**Status.** Done in v1.1. Tier 2 of V3: the "+10 XP" words only the first time a checkpoint is finished (V3-20).

## 5. Tracking that never shames

**What we expect.** Nothing derived from the person's record ever decreases: not XP, mastery, badges, rank, total days or the Harbor's light; no streak resets, no points for claimed sober days, no random rewards.

**Why.** A house rule (BUILD-GUIDE rule 2, BUILD-PLAN rule 6): a slip is logged and learned from, not punished; points for claimed days would reward claims, and random rewards copy the mechanics the person is leaving behind.

**When.** Every quick log, every slip, every screen that shows a number. Release: in `offline-v1.1` now.

**Where.** `engine.js` (every number is derived here); Track `#/track`; Today; `ui-game.js`, `ui-harbor.js`.

**How.** Everything is computed from the **append-only event log**^[the list of things the person did, in time order; rows are added, never changed or removed, so what they earned cannot go down], so nothing can go down; the day counter never falls; a slip restarts only the opt-in "current run", off by default; counters earn no XP. Check: `logic.test.mjs` "a slip lowers nothing: today and backdated SlipLogged leave every number equal or higher", "no random rewards and no network". Manual: note XP and total days, log a slip, look again.

**Status.** Done in v1.1. V3's status page keeps the rule by contract (rises only).

## 6. Planning tools: planner, Battle Plans with .ics, Weekly Review, quests, to-dos

**What we expect.** The Actions tab plans a day, attaches a Battle Plan to a risky block and exports it as a calendar file, runs a five-screen Weekly Review with a forecast check, and keeps quests, predictions and to-dos; nothing there is "overdue" or scored.

**Why.** Skills need a time and a place; a planned risky hour with a plan beside it is the book's idea in the app's own words, and the review looks back without a score (ADR 0021).

**When.** The planner in the morning or the evening before; a Battle Plan before a risky event, a debrief after; the review weekly. Release: in `offline-v1.1` now.

**Where.** `#/actions/planner`, `#/actions/battle`, `#/actions/review`, `#/actions/quests`, `#/actions/predictions`, `#/actions/todos` (`ui-actions.js`); eight guided practices at `#/practice/<id>`.

**How.** A day runs 07:00 to 23:00; a two-hour uncovered stretch is a gap, and suggestions place the person's want-tos at their craving hours; the **.ics**^[the standard calendar file; a phone's calendar app opens it and adds the event] is made on the device with no buddy's details in it. Check: `actions-ui.test.mjs` "battle: a plan exports a valid .ics through Engine.ics", "to-dos: add with a past due date, no overdue words". Manual: make a Battle Plan, export, open it in the phone's calendar.

**Status.** Done in v1.1. V3 asks this lane for one browser hook only (V-03h).

## 7. Insights and the Warning Sign Radar

**What we expect.** After seven logs the person sees patterns in plain sentences (trend, top triggers, a week-by-hour heatmap, mood against activities, which skills helped); the radar's six gentle detectors have a screen of their own.

**Why.** Notice patterns, do not guess: under fourteen logs every card says the sample is small, and the radar is gentle and never red, pointing to the person's own plan rather than a risk score.

**When.** Insights from the seventh log; the radar whenever the person looks. Release: insights in `offline-v1.1`; the radar screen V3-02.

**Where.** `#/track/insights` (`ui-track.js`); `engine.js` (`insights`, `warningSigns`). V3: the "What to watch" card of `#/status` and `#/track/radar`.

**How.** The engine computes the weekly craving mean for eight weeks, the five top triggers, a 7×24 heatmap, check-ins with and without a pleasant activity, and a skill ranking; the radar's six detectors (no meeting, few pleasant activities, poor sleep, no contact reached, unplanned weekend evenings, feelings rising) each map to the person's own warning-sign plan. Check: `engine-insights.test.mjs` "insights: ready at 7 logs ..." and the six "radar ..." tests. Manual: load the sample data, Track → See your insights.

**Status.** Partly. Insights are done; the radar is computed and tested but no screen shows it (`#/track/radar` is not served: V3-02, verified). Planned inside V-01b.

## 8. The Workbook and My Recovery Plan

**What we expect.** Every exercise answer becomes a Workbook page the person can read, edit and print; the Reasons Card and the Support Network live there; My Recovery Plan prefills nine sections from the person's data, is confirmed section by section, and is pinned in SOS once confirmed.

**Why.** What a person writes in a hard moment is worth more than any lesson text and must be findable later and in SOS; contacts are hidden, never deleted, and never leave the device.

**When.** After any exercise; the Reasons Card from M0; the plan at the end of M10. Release: in `offline-v1.1` now.

**Where.** `#/workbook`, `#/workbook/<artifact>` (eighteen artifacts), `#/workbook/reasons` (`?big=1` is the page SOS opens), `#/workbook/network`, `#/workbook/plan`; `ui-workbook.js`, `ui-plan.js`.

**How.** The latest non-draft answer is the artifact, history is read-only and Print uses the print stylesheet; the plan's "Refresh from my data" only adds, never drops a line, and Save writes RecoveryPlanConfirmed once. Check: `workbook-settings.test.mjs` "U-21: the plan prefills, edits, confirms, saves, refreshes and prints"; the browser flow "lesson to artifact shown in SOS". Manual: build the Reasons Card, then SOS → Remind me why.

**Status.** Done in v1.1. Tier 2 of V3: one test assertion (V3-22).

## 9. Games, tools and guidance

**What we expect.** Three guided tools and five mini-games play from the content, every target the tutorials name exists, a first-run tour and just-in-time tutorials teach each screen once, and a skill used in a game is credited to that skill.

**Why.** House rule 5: teach every feature with a tutorial, a help entry and a test; the games rehearse skills in a safe place, and the credit matters because mastery and the Harbor's light grow from skills used.

**When.** The tour after onboarding; a **JIT tutorial**^[just-in-time: a short walk-through offered the first time a screen is used, at most once a day, never on an SOS route] the first time a revealed feature opens. Release: in `offline-v1.1`; the skill credit V3-08.

**Where.** `#/tools/trial`, `#/tools/should-i-go`, `#/tools/problem-solver` and the five `#/games/*` pages (`ui-tools.js`); `ui-game.js`; `ui-guidance.js`; help at `#/settings/help`.

**How.** The guidance overlay sits under the SOS button, carries its own SOS link and closes on any route to SOS; tips show one a day, Today only; Calm mode hides the game layer. Check: `game-tutorials.test.mjs` "guidance: tour never starts on SOS routes"; the guards gate `guard: tour-target`. Manual: Settings → Help → replay the tour.

**Status.** Partly. Built in v1.1; a game's SkillUsed write is refused by Actions and dropped (V3-08, verified). V3 adds `Actions.useSkill` (V-08a) and the call from the games (V-08b), the tour ending cleanly when the route leaves Today (V3-21), the status page's tutorial (V3-28).

## 10. Backup, restore and erase

**What we expect.** The person can save a backup file, bring it back on this or another device, erase everything (the PIN too) after a confirm, and load or erase marked sample data; a restore brings back every record exactly.

**Why.** Data never leaves the device on its own, so a backup is the only copy that survives a lost phone; erase is the person's right and the way out of a forgotten PIN; sample data lets the owner and testers walk every screen in a minute (O6).

**When.** Export weekly and before a new phone; import on the new device. Release: in `offline-v1.1` now.

**Where.** `#/settings/data` (`ui-settings.js`): Save a backup file, Bring back a backup, Erase everything, Load and Erase sample data, Print logs; `engine.js` (`exportBackup`, `validateBackup`), `actions.js` (`importBackup`, `eraseAll`).

**How.** The backup is a plain JSON file named by date; with a PIN set, export asks for the PIN first and the screen says the file itself is not locked; import validates and migrates, then replaces after a confirm, never merges; the lock row never travels. Check: the browser flow "export erase import restores everything". Manual: export, erase everything, import.

**Status.** Done in v1.1.

## 11. Accessibility: contrast, focus, screen readers, reduced motion

**What we expect.** The app works by keyboard and with a screen reader, every control is named, focus is visible, tap targets are 44 px or more, motion stops when the device or the person asks, and high-contrast and larger-text settings exist.

**Why.** House rule 6: a person in a hard moment may be shaking, tired, or one-handed in the dark, and a person with low vision has the same right to SOS as anyone.

**When.** Always; the Look settings are set once. Release: in `offline-v1.1`; a measured contrast check V3-27.

**Where.** `styles.css` (one token set for light and dark, `:focus-visible` outlines, 44 px minimums, the reduced-motion and high-contrast rules); `ui-core.js` (focus to `#main` on every route change, `aria-current`, labelled forms, live regions); `#/settings/look`.

**How.** Both themes define the same variables (the guards gate `guard: theme-parity`); `prefers-reduced-motion` and the in-app switch stop every animation; high contrast thickens borders and survives a reload. Check: `store.test.mjs` "RC5: each of the five tabs is the only one marked aria-current, and #main takes focus on every move"; the browser flow "phone viewport 390 px has no horizontal scroll". Manual: turn on the phone's "reduce motion", open Today: the Harbor stands still.

**Status.** Partly. Built in v1.1; colour contrast is not yet measured. V3-27 adds a Node check of every text and background pair at 4.5:1; V3-16 the lock-form findings.

## 12. Honest states: working, stub or locked, never a dead button

**What we expect.** Every tap leads somewhere: a working screen, a stub with one real action and a way back, or a locked card with one line naming what it will be; and the app's words about itself are true.

**Why.** Decision O7: a person who taps a dead button learns not to trust the app, and the docs stay true (house rule 7) for the same reason.

**When.** Every screen, every version. Release: in `offline-v1.1`; one stale sentence V3-24.

**Where.** `ui-core.js` ("coming soon" for a route no lane registered; a page that throws shows one line and the urgent numbers); the stubs in `ui-tools.js`, `ui-practices.js`, `ui-workbook.js`; `#/settings/about`.

**How.** Every screen lane tests its own routes for dead buttons, and `boot.js` shows help even when the app fails to start. Check: `today-track.test.mjs` "track: every route renders with no dead button and SOS one tap away". Manual: tap every card on Today and every tab of Settings.

**Status.** Done in v1.1 for the screens. `offline/README.md`, which the tag still carried as "planned" copy, was rewritten on the trunk after the tag (02:57, and the U-35 slice's docs fixes at 03:28; V3-06 closes the rest). Settings → About still says some screens are being built (V3-24) and shows "Version 1.0.0" (`Content.version`) while the tag is v1.1: both worth one pass.

## 13. Original content only, person-first, grade 6 to 8, short crisis copy marked for review

**What we expect.** Every word is original, speaks to a "person in recovery" and never uses "addict" as a noun in the app's voice, reads at about grade 6 to 8, keeps substance details brief, and every crisis or medical passage is short, points to a doctor or the emergency number, and is marked `clinicalReview: true`.

**Why.** The source book is copyrighted (ADR 0002), so the app carries its ideas in new words and cites references; crisis copy never speculates, and a clinician, not a builder, decides whether the safety words are right.

**When.** Every lesson, exercise, practice, game and SOS screen. Release: the words and marks in `offline-v1.1`; the clinical review (V3-09) waits for a reader (V-Q8).

**Where.** The content files; the copy blocks of `ui-sos.js`, `ui-onboarding.js`, `ui-core.js`, `boot.js`; the crisis phrase list in `engine.js`; the review pack `CLINICAL-REVIEW-PACK.md` (32 items, P-01 to P-32).

**How.** `Engine.validateContent()` rejects "addict" as a noun outside a quoted example thought and requires a reference per lesson; the cast is four original composite characters from Gujarat; SOS screens keep to one title and one short line. Check: `actions.test.mjs` "sos copy: one title and at most one short line per screen, person-first". Manual: read the pack's 32 passages, each with its file, line and words.

**Status.** Partly, and Owner input needed. The words and marks are in v1.1; the reading level is assumed, not measured; no passage has yet been read by a clinician.

## 14. A guide with screenshots

**What we expect.** A Word guide, built from Markdown, with a cover, contents, Part 1 Understanding, Part 2 Making it yours, Part 3 Tutorial (fourteen lessons, one screenshot each) and Part 4 Help with the real check counts.

**Why.** The owner's team, the designers, the clinical reviewer and the first testers need one readable document (decision O8).

**When.** Before the first copy leaves the owner's hands. Release: Parts 1, 2 and 4 in `offline-v1.1`; the screenshots (U-35) merged after the tag; Part 3 with the counts is V-07 (V3-07).

**Where.** `offline/docs/1-addic-Guide.md` → `.docx` by `python offline/docs/build_guide.py`; the screenshots in `offline/docs/images/`, written by `npm run screens`.

**How.** The docs gate runs the builder and fails if it exits non-zero or a referenced image is missing; Part 3's lessons follow the owner's acceptance walk. Check: docs GREEN at the tag; after V-07, every lesson has its screenshot and Part 4's table has counts, not "Planned".

**Status.** Partly. Parts 1, 2 and 4 are written and the `.docx` builds; Part 3 is headings only. The screenshots (U-35, 72 images) merged into the trunk at 03:28, after the tag; the guide does not reference them yet. V-07 (running on lane tests-docs) writes Part 3 and the counts; the status page's lesson (V-01t) and the R-O-6 lessons (V-45) follow.

## 15. The visual status layer "Your Harbor" (V3)

**What we expect.** One tap from Today opens a page where the person sees their harbor, what just changed since they last looked, where they stand, what to watch, and their next small step; nothing on it ever decreases, and SOS stays one tap away.

**Why.** The owner's R-O-5: "a dedicated visual layer to see the status give effect"; in v1.1 the Harbor is a card that cannot be tapped and the radar has no screen, so the person does something and sees nothing move.

**When.** After any action, and whenever the person wants to look. Release: V3-01 (V-01a, V-01b of lane today-track; V-01t, V-10, V-28; about 7 estimated hours), tag `offline-v3.0` by default.

**Where.** A new page `#/status` in a new file `ui-status.js`, a "Your harbor" chip in Today's header, the harbor card on Today becoming a link; it reuses `HarborUI.scene`, `GameUI`'s rank card, XP bar and badges, and the engine's derivations.

**How.** Top to bottom: the scene (tap a place to see its skills) · "What just changed" (rises only; a place pulses once, never under reduced motion or on an SOS route) · "Where you stand" (rank, XP, badges; a 14-day strip of dated dots, no count) · "What to watch" (the radar) · "Next small step" · Back to Today and an SOS link; Calm mode shows no scene, XP or badges, discreet no scene and no days; the model and the diff are pure functions, so a slip leaves every level equal. Check: `status.test.mjs`; the browser flow "status: a slip lowers no light". Manual: log a craving, open Your harbor: the Weather Station reads "more light".

**Status.** Planned V3-01, in progress: V-01a is built and checked on its branch (READY-SLICE 127509e, check PASS, 03:23 IST) and is next in the merge queue; V-01b follows. The defaults for its shape (V-Q2 to V-Q6) applied at 03:30.

## 16. Quality gates: build, Node tests, validate, guards, browser suite, judged by name

**What we expect.** Nothing is merged or tagged unless six gates are green on the merged code, and "green" means no failure by name against the baseline^[the list of check names already red before a change; a change is green when it adds no new red name; the offline edition's baseline is empty], never a count or an exit code read as a whole.

**Why.** House rule 4, small and tested: a count hides a swapped failure, a name does not; flagged lanes (the person's data, the safety copy) also get two independent reviewers before a merge.

**When.** On every lane's branch before READY, on the merged tree before each merge, and once in full before a tag; the same gates bind V3.

**Where.** `docs/offline/build-2026-11-07/tools/gates.py`, `coordination/baselines.md`, `package.json` (`npm run check`), the 13 Node files and `browser.test.mjs` in `offline/tests/`, `offline/docs/build_guide.py`.

**How.** Build: exit 0, the file exists, the CSP line present. Test: `node --test` over every Node file. Validate: zero content errors. Guards: csp, external-url, innerHTML with data, theme-parity, tour-target. Browser: **Playwright**^[a tool that drives a real browser from a script; here Chrome, offline, at 390 px phone width] runs nineteen named flows and fails on any console error or any request that is not the file; a flow whose hook is missing skips by name. Docs: the guide builds. Check: read the `GATE` and `FAIL` lines in the logs the tag cites, or run `npm run check` on a checkout of the tag.

**Status.** Done in v1.1: every gate GREEN by name (Part C). Three browser flows skipped because their hooks^[a `data-test` or `data-testid` attribute on a screen element that the browser suite uses to find it; it changes nothing for the person] were absent; V3-03 to V3-05 make them run.

## 17. A main quest-line with rewards that unlock extra features (V3)

**What we expect.** One ordered spine of quests runs through the app; finishing a step gives a fixed, named reward that unlocks an extra (a tool or mini-game, a game surface's extra, a Harbor scene or theme, the Explorer), and nothing a person needs for safety or learning is ever behind it.

**Why.** The owner's R-O-6 (8 November, 03:03 IST): "a main quest-line with rewards that unlock new features as you progress through it"; a visible path answers "what now?", and the house rules shape it: rewards are deterministic (no random rewards), earned by actions (never by claimed sober days), and SOS, help, the lessons, Settings, export and the person's data are never locked (ADR 0019).

**When.** From the first week: the first steps are things Today already suggests (the first log, the SOS drill, the M0 lesson, a Safety Net). Release: Planned V3 (R-O-6), tier 1: V-40 (engine), V-41 (actions-sos), V-42 (content), V-43 (today-track), V-44 (game-tutorials), V-45 (tests-docs), cut by the HUB at 03:07 (PLAN-V3 section 7).

**Where.** The spine "Your way" on `#/status` and the current step's card on Today; the steps in a new file `content-quests.js` (`Content.questLine`: 8 to 12 steps in a fixed order, each a condition over existing events, one reward feature id, a one-line "what opened"); `engine.js` (`Engine.questLine`, `Engine.unlocked`); `actions.js` (`Actions.questLine.claim`). Today's eight quests at `#/actions/quests` stay as they are.

**How.** `Engine.unlocked(view)` is the union of what the modules reveal today (`Engine.revealed`) and what the quest-line has rewarded: a superset, so nothing ever re-locks; each step reports whether it is met and claimable, a claim writes `QuestLineStepDone` and `FeatureUnlocked` only when the engine says so, and sample rows never count. Check (named in the plan): V-40's Node tests (unlocked never smaller than revealed; the same events give the same rewards; `validateContent` rejects a reward that is a protected feature); the browser flow "a quest-line step unlocks a feature" (V-45). Manual: finish the first step, tap Claim: the sheet names what opened and the feature carries a "New" dot.

**Status.** Planned V3 (R-O-6): V-40 to V-45; V-40 has been building on lane engine since 03:15. V-Q10 (which features unlock) takes its default at 04:00 IST unless the owner answers.

## 18. Daily tasks or objectives that grow something visible (V3)

**What we expect.** Each day offers three small objectives; doing them grows something the person can see, by default their Harbor on the status page; growth never shrinks, and a missed day pauses it rather than undoing it.

**Why.** R-O-6: "add daily tasks or objectives that grow something"; small daily actions are the skills of M4 to M8 made visible, and the house rules shape it: what grows is derived from the append-only log so it cannot go down, objectives are actions and never claimed sober days, Calm and discreet modes keep their scene rules, and nothing of it appears on an SOS route.

**When.** Every day, on Today; the growth is seen on "Your Harbor". Release: Planned V3 (R-O-6), tier 1: V-40 (`Engine.dailyObjectives`, `Engine.growth`), V-41 (`Actions.objective.done`, `swap`), V-42 (`Content.objectives`, a pool of about twenty), V-43 (the card and the scene), V-45 (the browser flow); after the status page (V-01b).

**Where.** A "Today's objectives" card on Today (`ui-today.js`): three a day, tap to do, one swap, the growth line; the growth elements in the Harbor scene on `#/status`: a lantern along the pier, a tree on the hill, a boat at anchor, one per unit of growth, never removed; the pool in `content-quests.js`.

**How.** Two of the day's three are drawn deterministically from the pool by the date and the person's state and the third may be swapped once a day (V-Q11); an objective is done by a tap (one `ObjectiveDone` per objective per day; only a tapped one earns XP) or automatically by its matching event; a day with at least one done adds one unit of growth (`Engine.growth`, a count that never decreases), and a missed day adds nothing, so the pause is the absence of growth, never a loss. Check (named in the plan): V-40's tests (the same date gives the same objectives; growth never decreases); the browser flow "an objective done grows the harbor" (V-45). Manual: tap one objective done, open Your harbor: one more lantern, tree or boat, still there tomorrow.

**Status.** Planned V3 (R-O-6): V-40 to V-45, after V-01b. V-Q11 (fixed or chosen) takes its default at 04:00 IST.

## 19. A streak counter that keeps the run going without shaming a break (V3)

**What we expect.** The person sees three numbers together: the current run, the best run and the total of days shown up; the total and the best never decrease; a break starts a new run with a "you came back" line and no loss of anything earned; one grace day a week keeps a run alive.

**Why.** R-O-6: "a streak counter that doesn't demotivate breaking it, but more focus on keeping it up"; the house rules say what it must not do: nothing derived decreases (the total and the best stand for ever), no points for claimed sober days (the run earns no XP and counts showing up, not a claim), no streak reset as punishment (a break is a new run beside a best that stays, never a zero in red); the current run is the one number the plan allows to restart (BUILD-PLAN rule 6), and it never stands alone, with no push, no countdown and no shame line (V-Q13).

**When.** Every day, in Today's header line and in "Where you stand"; the "you came back" line on the first day after a break. Release: Planned V3 (R-O-6), tier 1: V-40 (`Engine.run`), V-42 (the words), V-43 (the header line and "Where you stand"), V-45 (the browser flow).

**Where.** `Engine.run(view, now)` in `engine.js` gives the current run, the best, the total, the bridged dates, whether a grace day is holding the run now, and a came-back flag, all derived from the log; Today's header line (`ui-today.js`) and "Where you stand" on `#/status`; the words in `content-quests.js`. The sober-day counters (`Engine.counters`, opt-in) stay separate; the HUB ruled at 03:19 that their current run never appears on the status page, while this run does.

**How.** A day shown up is any day with a log, a lesson, a practice, an objective or an SOS drill, never a claimed sober day (V-Q12); the best run is the longest ever, kept once reached; one grace day a week keeps the run and shows as "kept" (V-Q9); a break starts a new run with "you came back", and XP, badges, the Harbor and the total stand; discreet mode hides the counters as it does today. Check (named in the plan): V-40's tests (a break never lowers the best or the total; a grace day keeps; deterministic); the browser flow "a break keeps best and total" over two dated sessions (V-45). Manual: miss a day with no grace left, open Today: the best stands, the run restarts, the line reads "you came back".

**Status.** Planned V3 (R-O-6): V-40, V-42, V-43, V-45. Owner input needed, each with a default at 04:00 IST: V-Q9 the grace day, V-Q12 what counts as a day shown up, V-Q13 where the run shows.

<!-- pagebreak -->

# Part B. What we need from the owner, and why, when, where, how

> [!WARNING]
> **Nobody else should use the file until two things are done:** the India crisis numbers are verified (B.2), and the owner has walked the file once on a phone (B.1). Both are the owner's alone; the build cannot do them.

## B.1 The walk of the file on a phone and a computer

**Why.** The gates prove the rules; they cannot judge the voice, the feel on a real phone, or whether a step confuses. Only the owner can, and the lanes fix what the owner finds, by name.

**When.** Now, on the tagged file, before the first copy leaves the owner's hands; again on the V3 tag.

**Where.** `offline/1-addic.html` (the kept copy of the tag is `offline/releases/1-addic-v1.1.html`). On a phone: copy it to the Download folder and open it from the Files app in Chrome, or type `file:///sdcard/Download/1-addic.html` in Chrome's address bar. On a computer: double-click it.

**How.** The six steps of the acceptance walk (BUILD-PLAN section 10), then every finding **in one message**; the HUB routes each to its lane:

1. Open the file on the phone; the welcome screen appears; load the sample data; every tab opens; the top bar says "Saved on this device".
2. Erase; onboard for real in under three minutes; set a PIN; land on Today; take the tour; run the SOS drill: no log appears.
3. Airplane mode on: SOS → I'm craving → the full flow with one delay → "the urge passed"; the log appears in Track with the skills rated.
4. Learn → Start Here → three lessons; the Reasons Card exists; SOS → Remind me why shows it.
5. Settings → Your data → export; erase everything; import; everything is back.
6. Open the guide `.docx`: cover, contents, Parts 1 to 4; after V3, the screenshots match the screens.

Worth a note on the walk: how long the unlock takes on the phone (V3-25) and how long the file takes to open (V3-26); both are assumed, not measured.

## B.2 The India crisis numbers (input I6)

**Why.** A wrong or dead number on the SOS screen is the worst failure this product can have. The build collected the numbers from public sources in October 2026 and marked every one `verify: true`; the screens say "please verify" beside each until the owner clears it. The default for the V3 tag (V-Q7) is that none is cleared.

**When.** Before anyone else gets the file; the content lane clears only the flags the owner names (V-10b).

**Where.** `offline/src/content-core.js`, `Content.resources` (lines 417 to 440), 17 flags in all; shown on `#/sos/urgent`, the lock screen and the crisis view.

**How.** Call each number, confirm it answers, its hours and that it is free; check each link. Reply in one line, for example `V-Q7: 112 and Tele-MANAS confirmed`. The entries as the app holds them today:

| Region | Service | Number | Note | Status |
|---|---|---|---|---|
| India | Emergency (police, ambulance, fire) | 112 | National emergency number | Pending |
| India | Ambulance | 108 | Many states, including Gujarat | Pending |
| India | Tele-MANAS mental health helpline | 14416 (alt 1800-891-4416) | 24×7, Government of India, Gujarati available | Pending |
| India | KIRAN mental health helpline | 1800-599-0019 | 24×7, Ministry of Social Justice | Pending |
| India | Nasha Mukti de-addiction helpline | 14446 | Toll-free; information on centres | Pending |
| India | Vandrevala Foundation | 1860-2662-345 (alt +91 9999 666 555) | 24×7, free counselling, WhatsApp | Pending |
| India | AIIMS poison information | 1800-116-117 (alt 011-2658-9391) | 24×7 | Pending |
| India | AA India, NA India, SMART Recovery (links) | web | meeting finders | Pending |
| India | IRCAs directory, Hospital for Mental Health Ahmedabad, district hospitals | web / note | treatment | Pending |
| Elsewhere | Find a Helpline, Befrienders Worldwide, local emergency number | web / 112 | directories | Pending |

The opioid safety card (`content-core.js` line 521) is marked both `verify` and `clinicalReview`: it belongs to B.3 as well.

## B.3 The clinical review of the safety copy

**Why.** Crisis and medical copy is short, conservative and points to a doctor or the emergency number; whether the words are right is a clinician's call. No copy changes before the reviewer's answers (V-Q8 default).

**When.** Before the friends release; the V3 tag does not wait for it, but the fixes follow the answers by name.

**Where.** `docs/offline/build-2026-11-07/CLINICAL-REVIEW-PACK.md`: 32 passages with file, line and current words: the SOS copy and crisis phrases, the start-failure line, the onboarding safety and lock texts, twelve marked lessons, four exercises, one game and four refusal scenes, the numbers, the overdose, opioid and withdrawal lines.

**How.** The owner names who reads the pack and when (`V-Q8: <name>, <date>`). The reviewer answers its three questions: are the numbers right and free; is the overdose and opioid wording right; does any passage over-promise or under-warn. Each answer becomes a named fix in the content or actions-sos lane, merged under the same gates.

## B.4 The decisions already taken

The thirteen decisions of the first build (PLAN.md section 9) took their defaults at 08:25 on 7 November (R-O-1) and became the owner's own at 14:38: "I agree with the defaults" (R-O-2). Any can still change with one line; a merged unit changes by a named fix. In force, all **Done**: **O1** the file `1-addic.html`, title "1-addic", discreet title "Notebook" (the naming decision D13 stays open) · **O2** the PIN offered and recommended in onboarding, never forced · **O3** India numbers with "please verify" on every entry plus an international list, the owner verifying first · **O4** the device's own text-to-speech with the text always on screen, no recorded audio · **O5** no Gujarati in this edition, a locale field on every record and item · **O6** "Load sample data" on the welcome screen and in Settings, marked and erasable · **O7** honest states for screens not yet built, never a dead button · **O8** the Word guide in the tag, Part 3 after the screens · **O9** the trunk, the lane branches and the tag pushed to origin, `main` never · **Q10** the HUB merges by script and the build chats run the workflow · **Q11** SCREENS starts when free memory allows a second chat and a lane · **Q12** a fresh HUB on Fable 5.1, build chats on Opus 5.5 · **Q13** the 4 GB memory floor stands, fewer lanes instead.

## B.5 The V3 questions and their defaults

From PLAN-V3 section 5 (V-Q1 to V-Q8) and section 7 (V-Q9 to V-Q13, added with R-O-6). Reply to copy: `V-Q1-V-Q8 default` and `V-Q9-V-Q13 default`, or only the items that change (for example `V-Q3: overlay`, `V-Q9: no grace day`).

| # | Question | Default | Default applies | Status |
|---|---|---|---|---|
| V-Q1 | The tag's name | `offline-v3.0` | at the tag | Pending |
| V-Q2 | "A visual layer to see the status give effect": the person's recovery status in the app, or the build program's status as a board? | The person's status in the app (V-01); a program board is a separate ask | 03:30 IST, 8 Nov | Pending |
| V-Q3 | A page at `#/status` or an overlay over Today? | A page: the back button works, it prints, nothing sits over SOS | 03:30 | Pending |
| V-Q4 | The 14-day activity strip, which changes as days roll off? | Dated dots with no count; dropped if only growing things may appear | 03:30 | Pending |
| V-Q5 | "What just changed" since the page was last drawn this session, or since the person last looked? | This session; no new stored value | 03:30 | Pending |
| V-Q6 | The page's name | "Your Harbor" | 03:30 | Pending |
| V-Q7 | The India crisis numbers: which are confirmed? | None cleared; every number keeps "please verify" | at the tag | Pending |
| V-Q8 | The clinical review: who reads the pack, and when? | The pack is produced; no copy changes before the answers | at the tag | Pending |
| V-Q9 | The streak's grace day | One grace day a week, shown as "kept" | 04:00 (engine V-40) | Pending |
| V-Q10 | Which features the quest-line unlocks | Tools and mini-games, the game surfaces' extras, Harbor scenes and themes, the Explorer; never SOS, help, lessons, Settings, export or the person's data | 04:00 (content V-42) | Pending |
| V-Q11 | Daily objectives fixed or chosen | Three a day: two drawn deterministically by date and state, one the person may swap once a day | 04:00 | Pending |
| V-Q12 | What counts as a day shown up | Any day with a log, a lesson, a practice, an objective or an SOS drill; never a claimed sober day | 04:00 | Pending |
| V-Q13 | Where the run shows | Today's header line and Your Harbor's "Where you stand"; never a push, a countdown or a shame line | 04:00 | Pending |

> [!NEXT]
> **For the owner, in order:** 1. Walk the v1.1 file on the phone and the computer (B.1) and send the findings in one message. 2. Verify the India numbers (B.2) and reply `V-Q7: ...`. 3. Name the clinical reader and the date (B.3, `V-Q8: ...`). 4. Answer or accept V-Q1 to V-Q6 (their defaults applied at 03:30 IST) and V-Q9 to V-Q13 before 04:00 IST (`V-Q1-V-Q8 default` and `V-Q9-V-Q13 default` are enough). 5. Keep the machine awake while the lanes run; the memory is shared with the other program.

<!-- pagebreak -->

# Part C. How we will know it is done

## C.1 The tag offline-v1.1: what its gates said

The tag `offline-v1.1` is commit `f69bc68`, 8 November 2026, 01:59 IST, on the trunk `build/offline-v1`. Git shows thirty lane merges (`merge(offline): ...` commits) on the trunk since the cut at `655516dc`, plus thirteen fold-ins of the trunk into integration branches (the board says thirty; the tag text says twenty-nine). Every unit of the plan is in except the screenshots (U-35, merged after the tag) and the guide's Part 3 (U-36b). The kept copy is `offline/releases/1-addic-v1.1.html`; the hand-off is `tracks/HUB/RUN-RECORD.md`.

| Gate | What it checks | Result on the tagged code | Status |
|---|---|---|---|
| build | `node offline/build.mjs` exits 0, the file exists, the CSP line is present | GREEN, 1,113,578 bytes | Pass |
| test | every `offline/tests/*.test.mjs` under `node --test` | GREEN, 536 of 536 in 13 files | Pass |
| validate | `Engine.validateContent()` over every content file | GREEN, 0 errors over M0 to M10 | Pass |
| guards | csp, external-url, innerHTML, theme-parity, tour-target | GREEN, all five, no baselined name | Pass |
| docs | `python offline/docs/build_guide.py` | GREEN, the `.docx` builds | Pass |
| browser | 19 named flows in Chrome 157, offline, 390 px | GREEN: 16 pass, 0 fail, 3 skip by name | Pass |

The three skipped flows: "SOS drill creates no log" and "SOS craving flow offline with delay loop and both outcomes" (the two reassess hooks absent), "quick log and evening check-in" (hook `quicklog-button` absent on the flow's start page). The hooks exist in the code; the suite's helper does not yet reach them (V3-03 to V3-05). The one red of the first quiet run ("lesson to artifact shown in SOS") was a harness gap, fixed test-only before the tag. Logs: `C:/Users/ruchi/1-addic-wt/_logs/gates/hub/quiet-20261108-0131.log` and `browser-20261108-015539.log`.

## C.2 What V3's tag will need

The V3 plan keeps the same six gates, the same rule of green by name, and the same quiet window before the tag. Its chain, in order: U-35 (merged 03:28) → V-01a → V-07 → V-01b, then the R-O-6 units V-40 → V-42 → V-41 → V-43 → V-44 → V-45, with V-10, V-03, V-08a, V-08b, V-28, V-06 and V-11 alongside, and V-01t last. A tag that holds the chain is the v1.1 file plus a status page the person reaches in one tap from Today, with the quest-line, the daily objectives and the run on it, the guide complete and every browser flow running.

| Need | Unit(s) | What "done" looks like | Status |
|---|---|---|---|
| The status page "Your Harbor" | V-01a, V-01b (today-track) | `#/status` from Today in one tap; `status.test.mjs` green; a slip lowers no light (V-01a READY-SLICE, check PASS, merge queued) | In progress |
| Its tests, lesson and screenshot | V-01t (tests-docs) | the four status browser flows pass; a guide lesson with its image | Planned |
| Its feature, tutorial, help and tour step | V-10 (content), V-28 (game-tutorials) | `Content.features.status`, a JIT tutorial, a help entry, the tour step | Planned |
| The radar has a screen | V3-02 inside V-01b | "What to watch" on the status page and at `#/track/radar` | Planned |
| The guide complete | U-35 (merged 03:28), V-07 (tests-docs, running) | Part 3 with fourteen lessons and their screenshots; Part 4 with the counts | In progress |
| The browser hooks round | V-03 (tests-docs), V-03h (actions) | the three skipped flows run | Planned |
| A skill used in a game is credited | V-08a (actions-sos), V-08b (game-tutorials) | `Actions.useSkill` writes SkillUsed; the Harbor grows after a game | Planned |
| A safety line before boot | V-11 (core) | the emergency sentence and 112 inside `<main>` before any script runs | Planned |
| The docs true | the U-35 slice's fixes (done), V-06 (tests-docs) | `offline/README.md` and the two `## Offline edition` sections say what is merged | In progress |
| The main quest-line "Your way" | V-40 (running) to V-45 | an ordered spine with one fixed reward per step; `Engine.unlocked` never smaller than `revealed`; the flow "a quest-line step unlocks a feature" passes | In progress |
| Daily objectives that grow the Harbor | V-40, V-41, V-42, V-43, V-45 (after V-01b) | a Today card of three; growth that never decreases; the flow "an objective done grows the harbor" passes | Planned |
| The run of days shown up | V-40, V-42, V-43, V-45 | current, best and total together; best and total never fall; the flow "a break keeps best and total" passes | Planned |
| The six gates in the quiet window | HUB | build, test, validate, guards, browser, docs GREEN by name on the trunk tip; the tag `offline-v3.0` annotated and pushed | Planned |

**The arithmetic.** R-O-6 added about 9.5 estimated tier 1 hours (engine 3, actions-sos 1, content 1.5, today-track 2, game-tutorials 1, tests-docs 1); V3's tier 1 is now about 30 hours. With three lanes running from 03:30 IST on 7 GB memory rows: the freeze about 13:30, the quiet window to 14:15, the tag `offline-v3.0` about 14:30 IST on 8 November; with two lanes, about two hours later. The hours are re-cut on the board every two hours, and a red is named rather than no tag. **What moves to the next tag if the rows do not hold, in this order:** V-45's screenshots, V-44's tour steps, the tier 2 LOWs not merged by the freeze; and, whatever the rows, the clinical-review copy (after the reviewer), the India flags (after the owner's I6), the boot-time budget and the contrast guard, and the tooling fixes not done by the freeze. Never cut: the house rules, the two reviewers on actions-sos, the gates by name.

**And the owner's acceptance.** The edition is done when, after the tag, the owner has walked the six steps of B.1 on a phone and a computer, every finding has a named fix merged or a named reason, the India numbers the owner confirmed show without "please verify", and the clinical reader has a date.

<!-- pagebreak -->

# Summary table

| # | Expectation | Status | Where |
|---|---|---|---|
| 1 | One file, fully offline, no network call ever (Done in v1.1; V3-11, V3-26) | Done | `offline/1-addic.html`; the CSP; `build.mjs` |
| 2 | Data on the device, encrypted, optional PIN, lock screen (Done in v1.1; V3-25, V3-17, V3-16 tier 2) | Done | `store.js`; `#/lock`, `#/settings/privacy` |
| 3 | SOS in one tap, never gated, urgent help, verified numbers (Done in v1.1; Owner input needed: 17 numbers, I6, V-Q7) | Pending | `#sos-btn`; `#/sos/*`; `ui-sos.js`; `content-core.js` |
| 4 | Learning path M0 to M10, exercises, checkpoints (Done in v1.1: 11 modules, 55 lessons; V3-20) | Done | `#/learn`, `#/lesson/<id>`, `#/exercise/<id>` |
| 5 | Tracking that never shames (Done in v1.1) | Done | `engine.js`; `#/track`; Today |
| 6 | Planner, Battle Plans with .ics, Weekly Review, quests, to-dos (Done in v1.1) | Done | `#/actions/*`, `#/practice/<id>` |
| 7 | Insights and the Warning Sign Radar (Partly: insights done; the radar screen Planned V3-02) | In progress | `#/track/insights`; V3 `#/status`, `#/track/radar` |
| 8 | The Workbook and My Recovery Plan (Done in v1.1) | Done | `#/workbook/*`, `#/workbook/plan` |
| 9 | Games, tools and guidance (Partly: the skill credit Planned V3-08; V3-21, V3-28) | In progress | `#/tools/*`, `#/games/*`; `ui-guidance.js` |
| 10 | Backup, restore and erase (Done in v1.1) | Done | `#/settings/data` |
| 11 | Accessibility (Partly: the contrast guard Planned V3-27; V3-16) | In progress | `styles.css`, `ui-core.js`; `#/settings/look` |
| 12 | Honest states, never a dead button (Done in v1.1; the About sentence V3-24) | Done | every `ui-*.js`; `#/settings/about` |
| 13 | Original, person-first, grade 6 to 8, crisis copy marked (Partly; Owner input needed: a clinical reader, V-Q8) | Pending | the content files; `CLINICAL-REVIEW-PACK.md` |
| 14 | A guide with screenshots (Partly: Parts 1, 2, 4 in v1.1; screenshots merged 03:28; Part 3 V-07) | In progress | `offline/docs/1-addic-Guide.md` → `.docx`; `offline/docs/images/` |
| 15 | The visual status layer "Your Harbor" (Planned V3-01; V-01a READY-SLICE, merge queued; V-01b, V-01t, V-10, V-28) | Planned | V3 `#/status`; `ui-status.js`; a chip on Today |
| 16 | Quality gates, judged by name (Done in v1.1; three flows skipped by name, Planned V3-03 to V3-05) | Done | `tools/gates.py`; `offline/tests/`; `baselines.md` |
| 17 | A main quest-line with unlocking rewards (Planned V3, R-O-6: V-40 to V-45; V-Q10) | Planned | "Your way" on `#/status`; Today; `content-quests.js` |
| 18 | Daily objectives that grow the Harbor (Planned V3, R-O-6: V-40 to V-45, after V-01b; V-Q11) | Planned | "Today's objectives" card; the scene on `#/status` |
| 19 | A streak counter that keeps the run going (Planned V3, R-O-6: V-40, V-42, V-43, V-45; Owner input: V-Q9, V-Q12, V-Q13) | Planned | Today's header line; "Where you stand" on `#/status` |

**Count:** 19 expectations. Done in v1.1: 10 (1, 2, 3, 4, 5, 6, 8, 10, 12, 16; number 3 waits for the owner's numbers). Partly: 5 (7, 9, 11, 13, 14; number 13 also waits for the clinical reader). Planned V3: 4 (15 from R-O-5; 17, 18, 19 from R-O-6).
