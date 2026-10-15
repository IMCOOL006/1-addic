# 1-addic Build Guide: step by step, with prompts

This guide turns [`docs/PLAN.md`](PLAN.md) into 50 small build steps. Each step has a goal, **a prompt you paste into a new Claude Code session**, and a "done when" checklist. Follow the steps in order. Each one builds on the last.

> **Before you start:** the plan is still a draft. Settle the decisions in PLAN §15 first (step 0.1). Until then, the steps assume the recommended defaults.

---

## How to run a step

1. Open **Claude Code on the web** (claude.ai/code) and start a **new session** on the `IMCOOL006/1-addic` repo, from the latest `main`.
2. Paste the step's prompt. Every prompt already tells Claude which docs to read.
3. Let it work. It plans, builds, tests and pushes a branch.
4. Try it. Open the preview link (from step 0.3 onward), or ask: *"How do I try this?"*
5. Click **Create PR** in the claude.ai UI, review the summary, and merge.
6. Go to the next step. If something is wrong, use the **Fix it** prompt in Appendix A before moving on.

One step usually means one session and one pull request. If a step feels too big, ask Claude to split it: *"Do only the first half of this step and tell me what's left."*

---

## Rules for every step

Every prompt below says "Follow the house rules in docs/BUILD-GUIDE.md." These are the house rules:

1. **Read first.** Read `CLAUDE.md`, the PLAN.md sections named in the prompt, and the relevant `docs/book/` notes. Never read or commit the epub, and never copy the book's text. Write original copy in the plan's tone (PLAN §7).
2. **Safety is non-negotiable.**
   - SOS works offline, is never gated, and is never interrupted by tips or tutorials.
   - Urgent help is always one tap from SOS.
   - There are no streak resets, no random rewards, and no points for claimed sober days (PLAN §6.1).
3. **Privacy by default.**
   - All data stays on the device.
   - No analytics, ads, trackers or third-party network calls.
   - Contacts are never uploaded.
4. **Small and tested.**
   - Keep commits small.
   - Add or extend unit tests and Playwright tests.
   - Run lint, typecheck, unit tests, e2e tests and content validation. Push only when all of them are green.
5. **Teach every feature.** From Phase 2 on, every user-facing feature ships with:
   - its just-in-time tutorial (`content/tutorials/`),
   - a "How do I…?" help entry,
   - a tutorial e2e test (PLAN §5.10).
6. **Accessible.** Keyboard, screen-reader labels, visible focus, reduced motion, good contrast, large tap targets.
7. **Keep the docs true.**
   - Update `CLAUDE.md` when commands change.
   - Record decisions as ADRs in `docs/decisions/`.
   - Tick covered exercises in `docs/COVERAGE.md`.
8. **Finish with a summary:** what changed, how to try it, test results, and anything left for later.

---

## Phase 0: Decide & scaffold (about 1–2 weeks)

### Step 0.1: Record the decisions

**Goal:** turn your answers to PLAN §15 into decision records, so every later step follows them.

```text
I've reviewed docs/PLAN.md. Here are my answers to the decisions in §15
(write "default" to accept the recommended default):
D1: … D2: … D3: … D4: … D5: … D6: … D7: … D8: … D9: …
D10 (region/language): … D11: … D12: … D13 (app name): … D14: … D15: …
D16 (clinical advisor): … D17: … D18: … D19: …

Create one short ADR per decision in docs/decisions/ (0001-<slug>.md: context,
decision, consequences). Update PLAN.md so §15 shows each decision as settled
and any section affected by a non-default answer matches it. Don't write app
code. Push and summarize what changed in the plan.
```

**Done when:** `docs/decisions/` has 19 ADRs, and PLAN §15 shows every decision as settled.

### Step 0.2: Scaffold the app

**Goal:** an empty, installable web app with the agreed stack.

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §10.1, §10.7 and
the ADRs in docs/decisions/.

Scaffold the app at the repo root: Vite + React + TypeScript (strict),
React Router, Tailwind CSS, vite-plugin-pwa (offline + installable), Dexie,
Zod, Zustand, Vitest + Testing Library, Playwright, ESLint + Prettier.
Pin exact dependency versions. Create the folder layout from §10.7 with
placeholder index files. Add npm scripts: dev, build, preview, lint,
typecheck, test, e2e, validate:content, check (runs everything). Make sure
.claude/hooks/session-start.sh still installs everything, and configure
Playwright to use the preinstalled Chromium if needed. Update CLAUDE.md with
the build/test/run commands.
One smoke unit test and one smoke e2e test. Everything green, then push.
```

**Done when:**
- `npm run check` passes in a fresh session.
- The app shows a placeholder home screen.
- `CLAUDE.md` lists the commands.

### Step 0.3: CI and a preview link

**Goal:** every push is tested automatically, and you get a link to try the app on your phone.

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §10.6.

Add a GitHub Actions workflow that runs `npm run check` (lint, typecheck,
unit, content validation, Playwright e2e) on every push and pull request.
Add a deploy workflow that publishes a preview of `main` as a static site.
Use GitHub Pages if this repo can use it (set Vite's `base` correctly);
otherwise explain the simplest free alternative and the exact steps I need
to do by hand. Add a "How to try the app" section to README.md. Push and
tell me exactly what I must click in GitHub settings, if anything.
```

**Done when:** CI is green on GitHub, and a preview URL opens the app on your phone.

### Step 0.4: Content system

**Goal:** lessons, exercises, tutorials, resources and app text live in `content/` as validated data.

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §10.3, §10.4 and
§5.10, and docs/book/exercises.md.

Define Zod schemas for: exercise (fields, tutorial examples/hints, events,
bookRef), lesson (cards, checks, linked exercise, cited reference ids),
tutorial (steps with target, one line of copy, completing action), tip,
resource (by region), cast character, reference (an evidence citation:
authors, year, title, source, DOI or URL, evidence type, plain-language
claim, reviewedOn, usedBy; see docs/evidence-references.md), and UI copy
strings. Write `npm run validate:content` that loads everything in content/
and fails with clear messages, including a lesson that cites no reference.
Add one sample of each type (use the Urge Planner example from §10.3).
Create docs/COVERAGE.md: one row per exercise in docs/book/exercises.md with
columns implemented / tutorial / tested, all unchecked. Push.
```

**Done when:** `validate:content` passes, and it fails with a readable error if you break a sample file.

### Step 0.5: Design system & app shell

**Goal:** the look and feel, plus the navigation skeleton of every screen.

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §2, §4 and §6.2,
and the ADRs for the app name and game theme.

Create the design system in src/ui: color tokens for light and dark themes
(calm and adult; no childish colors), a type scale with a highly readable body
font, spacing, radii, motion tokens (durations, easings, reduced-motion
rules), and accessible base components (Button, Card, Slider, Chip, Sheet,
Dialog, ProgressRing, EmptyState). Write docs/design/style-guide.md: the
illustration style, the progress-map scene, and visual do/don'ts from
PLAN.md §10.8. Build the app shell: bottom
navigation (Today, Learn, Workbook, Track, Actions) and a floating SOS button
on every screen that respects safe areas. Create empty routed screens for each
area in §4, with friendly empty states. Add docs/design/wireframes.md with
low-fi sketches of Today, SOS and a lesson. Test navigation e2e. Push.
```

**Done when:** you can tap through every tab on your phone, the SOS button is everywhere, and both light and dark themes look right.

### Step 0.6: Unity feasibility spike (go/no-go for D3)

**Goal:** find out, with numbers, whether Unity can deliver this app within the §10.8 budget. Runs on your own computer.

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §10.1, §10.8 and
docs/design/game-concept-review.md (the Unity section).

This step runs on my own computer with Unity 6 installed. First write
docs/unity-spike.md: exact steps for a non-developer to install Unity Hub,
Unity 6 with the 2D URP template, the Unity MCP server for Claude Code, and
the iOS and Android build tools. Then build a throwaway spike app with: a
Today screen with a calm animated harbor scene, an SOS screen with a
15-minute wave timer, a long text form using the phone keyboard and
dictation, encrypted local storage (SQLite + SQLCipher), one local
notification, and screen-reader labels on every control. Measure and record
in the same file: cold-start time to the SOS screen on a mid-range Android
phone and a recent iPhone, download and installed size, memory on Today,
battery over 30 minutes idle, VoiceOver and TalkBack walkthroughs, font
scaling, dictation, and whether any network call happens at startup.
Compare each number with the pass marks in PLAN.md §10.8 and end with a
clear go / no-go recommendation for D3. Update the D3 ADR. Push.
```

**Done when:** `docs/unity-spike.md` has every measurement filled in and a go / no-go recommendation, and the D3 ADR records the decision.

### Step 0.7 (only if Unity wins): re-plan the guide for Unity

```text
I've decided D3 = Unity (see the ADR). Rewrite docs/BUILD-GUIDE.md steps 0.2
to 5.4 for a Unity 2D (URP) C# app: keep every step's goal, order and
"done when", and keep the SOS, safety, privacy, tutorial and accessibility
rules unchanged; replace the web tooling (Vite, React, Dexie, Playwright,
GitHub Pages) with the Unity equivalents (Unity Test Framework in batch
mode on CI, a device-build pipeline, SQLite + SQLCipher, the Accessibility
module, Mobile Notifications, Unity IAP, native widget and shortcut). Mark
which steps must run on my own computer. Update PLAN.md §10 and CLAUDE.md to
match, and add an ADR. Don't write app code. Push.
```

**Done when:** every step from 0.2 onward names Unity tooling, and `CLAUDE.md` says how to build and test.

---

## Phase 1: Safety core MVP, "help in the moment" (about 2–3 weeks)

### Step 1.1: Private local storage, app lock and the event log

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §9, §10.2 and
§10.4.

Build the data layer in src/data: a Dexie database with typed repositories
for the §10.4 entities (start with Profile, Contact, LogEntry, ExerciseResponse,
DomainEvent, TutorialProgress), schema migrations, and encryption at rest with
a key derived from an app-lock PIN (WebCrypto AES-GCM with a strong KDF). Add
an app-lock screen (set PIN, unlock, auto-lock timeout, "forgot PIN" means
wiping data, with a clear warning). Add an append-only domain event log with
a helper to record events. Ask the browser for persistent storage. Unit-test
the encryption round-trip, the migrations and the event log. Push.
```

**Done when:** data survives a reload, and is unreadable without the PIN when you inspect IndexedDB.

### Step 1.2: Onboarding

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.1, §5.11
(pace) and §8, and docs/book/03-step1-motivation.md.

Build the onboarding flow from §5.1 (steps 1–7; the step 8 tour comes in
step 1.8): welcome and "what this is / isn't", privacy promise with PIN
setup, focus (substances, terminology choice, optional start date or "not
sure yet"), stage of change and 0–10 motivation (Ex 3.1), medical safety
check with the withdrawal caution card, 3 quick reasons, 1 optional Safety
Net, region, check-in times, weekly review day and learning pace. Every step
is skippable except the safety notice. Save to Profile and record events. All
copy goes in content/copy, in plain, kind, person-first language. e2e: full
run and skip-everything run. Push.
```

**Done when:** a new user gets through onboarding in under 3 minutes and lands on Today.

### Step 1.3: Urgent help & resources

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.2 ("I need
urgent help"), §5.8 and §8.

Build the urgent-help screen (reachable from SOS and from Settings in one tap)
and a Resources screen, both driven by content/resources/<region>.yaml for
the regions in the D10 ADR: crisis line, emergency number, poison control,
overdose steps (including naloxone and "don't use alone"), withdrawal
cautions, mutual-help groups and meeting finders, treatment finders. Mark
every phone number and link "needs verification" in the data, and list them
in docs/resources-to-verify.md for me to check. Show numbers as selectable
text with call/copy buttons. e2e: reach urgent help in 2 taps offline. Push.
```

**Done when:** urgent help opens offline in 2 taps, and you have personally verified the numbers for your region.

### Step 1.4: Reasons Card and Safety Nets (basic)

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.4 and
docs/book/03-step1-motivation.md and docs/book/04-step2-set-up-to-succeed.md.

Build a quick Reasons Card (seeded from onboarding; edit, reorder, add
"my life will be different because…") and a basic Support Network (add
contacts by typing name and number; role: Safety Net, sponsor, therapist).
The Reasons Card has a big readable view for SOS. Record events. Unit and
e2e tests. Push.
```

### Step 1.5: The SOS craving flow

**Goal:** the most important feature in the app.

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.2 carefully,
and docs/book/06-step4-respond-to-distortions.md and
docs/book/07-step5-mindfulness.md.

Build "I'm craving" exactly as the §5.2 diagram shows: optional 0–10 rating,
15-minute wave timer (calm animation, reduced-motion friendly), tool choice
(Ride the wave with a short guided SOBER script read by device text-to-speech,
Remind me why → Reasons Card, Call someone → Safety Nets with call/text
buttons, Distract me → a starter distraction deck, Talk back → placeholder
until Phase 3), "guide me" default sequence, the "somewhere risky? leaving is
a valid move" prompt, re-rate at timer end, "delay another 15 minutes" loop,
"what helped?" rating, and "did you use?" (yes leads to a simple, kind
placeholder for Lapse Recovery plus urgent-help access). The session saves
itself as a craving LogEntry and records SkillUse events. Works fully offline.
One-handed layout, big targets, 2 lines of text max per screen, dark at night.
e2e: the whole flow offline, the delay loop, and the yes and no outcomes. Push.
```

**Done when:** you can run a full SOS session in airplane mode, and it appears in your logs.

### Step 1.6: Quick-log and evening check-in

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.5 and
docs/book/05-step3-self-expert.md (Ex 5.4) and
docs/book/08-step6-rediscover-rewards.md (Ex 8.1).

Build the unified quick-log (+ button): Craving (time auto, situation, thought,
feelings chips, 0–10, what I did, helped 1–5, used Y/N), Feeling (emotion,
0–10, situation, thought, same-day craving), plus the evening check-in (mood,
optional anxiety, peak craving, pleasant activities count, used today, sleep
quality, meeting/therapy). Target under 20 seconds. Use the browser's voice
input where available. Show a simple Timeline in Track. Unit and e2e tests.
Push.
```

### Step 1.7: Today screen v1

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §4 (Today) and
§6.4 (counters and momentum).

Build Today: greeting, morning/evening check-in card depending on time,
Reasons Card peek, "Start Here" lesson placeholder, and opt-in counters
(total sober days that never reset, urges surfed). Include Momentum ("practiced
on X of the last 14 days"), and no streaks. Settings toggle for showing
counters. Tests. Push.
```

### Step 1.8: First-run tour and SOS practice drill

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.10 (parts 1
and 2) and §5.1 step 8.

Build a minimal guidance engine and two tutorials driven by
content/tutorials: (1) the first-run tour with spotlight coach marks over the
five tabs and the SOS button (accessible: focus moves to each step, screen
readers announce it, skip at any time), and (2) the SOS practice drill: a
1-minute calm run through the craving flow with sample content, saved as
practice and never as a real log. Store TutorialProgress. Replay both from
Settings → Help & tutorials. The guidance engine must never show anything
during a live SOS session. e2e: complete, skip, replay, and the drill creates
no real LogEntry. Push.
```

### Step 1.9: Export, import and delete

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §9.

Add Settings → Your data: export everything (decrypted JSON, after PIN
confirmation), import/restore from that file, delete everything (two-step
confirmation inside the app), and a monthly backup reminder on Today. Round-
trip test: export → delete → import gives identical data. Push.
```

### Step 1.10: MVP hardening

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §10.6 and §12
(Phase 1 exit criteria).

Harden the MVP: run an accessibility audit (axe + manual keyboard pass) and
fix the issues; check SOS opens interactive in under 1 second from a cold,
offline start and fix it if not; test on a narrow phone viewport; review
every screen against the safety and privacy house rules. Write
docs/dogfooding.md: a 7-day checklist for me to use the app daily and note
problems. Summarize anything you couldn't fix. Push.
```

**Phase 1 done when:** the offline SOS test passes, and you've used the app daily for 7 days.

---

## Phase 2: Learn + Workbook (about 4–6 weeks)

### Step 2.1: Exercise engine

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §3 (two modes),
§10.3 and docs/book/exercises.md (field types).

Build the schema-driven exercise engine in src/engine: one React component per
field type (check, check★, single, slider, text, list, matrix2x2, pair, rows,
hourgrid, plan+backups, template, bodymap, timer, audio, date, contactPicker),
a runner that renders an exercise from content/exercises in tutorial mode
(examples, hints, "you built X" ending) or workbook mode (compact), saving
ExerciseResponse with schemaVersion, history and "finish later". A dev-only
gallery page shows every field type. Unit tests per field type, plus an e2e
test for one full exercise. Push.
```

### Step 2.2: Lesson player

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.3 (lesson
anatomy).

Build the lesson player: story moment, 2–5 swipeable concept cards, 1–3 checks
with explanations and no fail state, "Try it" (runs the linked exercise in
tutorial mode), and a wrap screen (what you built, where it lives, one
suggested action that becomes a to-do). Record LessonCompleted. Use one sample
lesson. e2e. Push.
```

### Step 2.3: Guidance engine, full version

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.10 in full and
§10.2 (guidance engine).

Extend the guidance engine: just-in-time tutorials (3–5 interactive steps that
end by doing the thing once, with a "Show me / Later" choice), Training drills
section, contextual tips (at most one a day, rule-based, can be switched off,
never in SOS), the Explorer checklist on Today with a progress ring, Help &
tutorials (replay, searchable "How do I…?" with "Show me" buttons), and
progressive feature reveal with "New" dots, the §5.10 reveal table and a
"Show all features now" setting. Rules live in content, not code. Unit-test
the rules; e2e the checklist and the reveal. Push.
```

### Step 2.4: Learning Roadmap

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.11 in full and
§5.3.

Build the Learning Roadmap as the Learn tab's home: Map view (11 modules as a
path; each stop shows lessons, skills, and what it unlocks), Plan view
(calendar of weekly targets based on the pace from onboarding), the three
tracks (Learn, Practice via skill uses, Use via features revealed), the "this
week's focus" card on Today, checkpoint reflections at module end (saved for
the Recovery Plan), stage-based starting path, pace changes, and the
guilt-free "welcome back, pick up where you left off?" re-plan, with no
overdue or red labels ever. Store RoadmapPlan. Tests. Push.
```

### Step 2.5: Voice, cast and the first lessons (M0–M2)

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §7 and §5.3,
docs/book/00-front-matter.md, 01-how-addiction-happens.md and
02-brain-disease.md.

Write docs/content-style.md (tone guide, person-first language, reading level
US grade 6–8, words to avoid) and content/cast/: 4–6 original composite
characters (different substances, ages, backgrounds; not the book's
characters). Then write modules M0 (Start Here), M1 (Understand Addiction,
with Ex 1.1 and 1.2 adapted in our own words, the help-request script and the
program checklist) and M2 (Your Brain Can Heal, quizzes only). All original
text. Medical content stays educational and says "talk to a doctor." Mark
safety-sensitive passages with a `clinicalReview: true` flag. Validate
content; e2e one lesson. Tick COVERAGE.md. Push.
```

### Step 2.6: M3, Find Your Why

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.3–§5.4 and
docs/book/03-step1-motivation.md.

Write module M3 and build its artifacts: Motivation Meter (stage + 0–10 as a
time series, "+1 point" note, history chart), Decisional Balance (2×2 matrix
with suggestion chips), the four-lenses reflection (Ex 3.3), and the full
Reasons Card generated from them (with an image export for a lock-screen
wallpaper). Add their tutorials and help entries. Tick COVERAGE.md. Push.
```

### Step 2.7: M4, Set Yourself Up

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.4, §5.6, §6.5
and docs/book/04-step2-set-up-to-succeed.md.

Write module M4 and build: Clear the Space quest (Ex 4.1, with safe-disposal
notes), the "Should I go?" decision helper and The Big Game interactive story
for seemingly irrelevant decisions (original character), exercise plan and log
with self-chosen rewards (Ex 4.2–4.3), full Support Network (Safety Nets vs.
risky people with avoid/limit/set-limits, qualities rubric; Ex 4.4, 4.6),
Scripts builder ("I feel… when… I need…", refusals; Ex 4.5), and the Build
Your Crew quest (Ex 4.7, meetings info). Tutorials and help entries. Tick
COVERAGE.md. Push.
```

### Step 2.8: M5, Become a Self-Expert

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.4–§5.5 and
docs/book/05-step3-self-expert.md.

Write module M5 and build: Trigger Profile (internal/external, ✓ and ★,
feeds log chips; Ex 5.1), Red Flag library (Ex 5.2), Distortion Sort
mini-game plus the thought journal with distortion tags (Ex 5.2b), spiral
thoughts list (Ex 5.2c), Craving Signature with a tappable body map (Ex 5.3),
and upgrade the craving quick-log to use them (Ex 5.4). Tutorials and help
entries. Tick COVERAGE.md. Push.
```

### Step 2.9: Workbook tab

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §4 (Workbook) and
§5.4.

Build the Workbook tab: grouped artifact browser (My Why, Know Myself, My
People, My Joys, My Recovery Plan placeholder), each artifact with view, edit,
version history, "practice with this", and export (image or PDF where it
makes sense). Extra lock for sensitive artifacts. Tutorial and help entry.
Push.
```

### Step 2.10: Insights v1, XP and skill mastery

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.5 (insights),
§6.1, §6.4 and §10.2 (event-sourced game state).

Build the insights engine (on-device): craving trend, top triggers, time-of-day
heat map, skill helpfulness ranking; gentle wording, small-sample caveats.
Build the game engine core: XP and skill mastery derived from the event log
(the §6.4 table, levels at 1/3/7/15/30 uses, diminishing returns on repeated
identical logs), shown on Today and a simple progress page. Prove in tests
that recomputing from events gives the same result, and that a slip never
removes anything. Push.
```

### Step 2.11: About & evidence screen

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.12 and §7, and
docs/evidence-references.md.

Turn docs/evidence-references.md into content/references/ (one entry per
reference, using the schema from step 0.4) and build the "About & evidence"
screen in Settings: a plain-language intro that credits the source workbook
and says the app itself is not clinically tested, then one card per
technique with the claim in one or two sentences, the primary sources with
DOI or URL links, an evidence-strength label (meta-analysis, randomized
trial, review, guideline, theory, book), the date last reviewed, and which
app features use it. Add a small "Why this works" link on Today and in
every lesson wrap and Training drill that opens the matching card. Make
every lesson cite at least one reference; validation fails otherwise, and
also if a reference has no link. Tutorial and help entry. Push.
```

**Done when:** every lesson shows at least one real reference, and About & evidence opens offline with links that work when online.

**Phase 2 done when:** M0–M5 are complete with tutorials, the Roadmap and Explorer checklist work, and COVERAGE.md is ticked for Ch 1–5.

---

## Phase 3: Actions + full coverage (about 4–6 weeks)

### Step 3.1: Planner

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.6 and
docs/book/06-step4-respond-to-distortions.md (Ex 6.4).

Build the Planner (day and week views): typed blocks (should, want, recovery,
risky), gap detection for unstructured time, suggestions to place want-tos at
the user's risky times (from insights), and to-dos generated by exercises.
Tutorial and help entry. Tests. Push.
```

### Step 3.2: Battle Plans

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.6, §6.5 and
§10.5 (notifications decision).

Build Battle Plans (Ex 6.5): attach to risky blocks or events (situation,
plan, two backups, buddy from Safety Nets, exit plan), an in-app reminder
beforehand, .ics calendar export, and a debrief afterward ("did you use your
plan?") that earns XP whatever the outcome. Add the Battle Plan Training
drill. Tutorial and help entry. Tick COVERAGE.md. Push.
```

### Step 3.3: M6, Outsmart the Addicted Brain

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.2, §6.5 and
docs/book/06-step4-respond-to-distortions.md.

Write module M6 and build: Put It On Trial (three T's courtroom flow, superficial
truths, "is it worth it?"; Ex 6.1–6.3) saving Comeback cards, the personal
distraction deck (Ex 6.3b), and wire both into SOS "Talk back" and "Distract
me". Add the trial and SOS Training drills. Tutorials and help entries. Tick
COVERAGE.md. Push.
```

### Step 3.4: M7, Be Present (audio practices)

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §7 (audio) and
docs/book/07-step5-mindfulness.md.

Write module M7 and original guided scripts: body scan, breathing with
awareness (5 → 30 minute ladder; don't pace the breath), mindful shower,
eating and walking, urge surfing, and SOBER. Build an offline audio player
using device text-to-speech, with on-screen text, pause and replay. Add the
SOBER Training quest (imagined → stress → emotion → craving) and Everyday
Mindfulness quests, and mindful-minutes tracking. Tutorials and help entries.
Tick COVERAGE.md. Push.
```

### Step 3.5: M8, Rediscover Joy

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.6 and
docs/book/08-step6-rediscover-rewards.md.

Write module M8 and build: Activity Library (original starter list in
categories; should/want; "could this trigger me?" flag), Should/Want balance
meter, activity scheduling into the Planner, the obstacles problem-solver
(Ex 8.4b), Prediction Lab (predicted vs. actual enjoyment chart; Ex 8.5/8.6),
the 7-Day Activity Experiment (hourly tracking; Ex 8.1), and self-chosen
rewards for follow-through (Ex 8.7). Tutorials and help entries. Tick
COVERAGE.md. Push.
```

### Step 3.6: M9, Handle Hard Feelings

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.2 ("I'm
feeling…"), §8 (crisis triggers) and docs/book/09-step7-challenging-emotions.md.

Write module M9 and build: emotion logs with mood/anxiety vs. craving insights
(Ex 9.1–9.2), Put It On Trial in "negative thought" mode (Ex 9.3), Anger
Signature and anger triggers (Ex 9.3b–9.4), Rewrite the Scene (Ex 9.5), and
the full "I'm feeling…" SOS branch (give it a beat for anger, SOBER and
reassurance for sadness/anxiety, motivation re-rate). Crisis routing: selecting
thoughts of death or suicide, or extreme hopelessness, opens urgent help
immediately. The gentle "persistent low mood → see a professional" nudge.
Tutorials and help entries. Tick COVERAGE.md. Push.
```

### Step 3.7: Lapse Recovery

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.2 ("I
slipped"), §6.7, §8 and docs/book/05-step3-self-expert.md (spiraling lapse)
and 10-personalized-recovery-plan.md.

Build "I slipped": compassion first, safety check (overdose risk after a
break, don't use alone, naloxone, withdrawal cautions, urgent help), stop the
spiral using the user's own spiral thoughts and rebuttals, one-tap reach-out,
and the Slip Review within 24 hours (Ex 10.2) with motivation revisit and
"step up support" actions. Total sober days, XP, badges and mastery never
decrease; the current run restarts quietly. Mark all copy
`clinicalReview: true`. e2e. Tick COVERAGE.md. Push.
```

### Step 3.8: M10, Warning Signs, Recovery Plan and Weekly Review

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §5.6, §5.7, §10.2
(warning-sign rules) and docs/book/10-personalized-recovery-plan.md.

Write module M10 and build: Warning Signs checklist with top-3 plans (Ex
10.1) and the Warning Sign Radar detectors from §10.2 showing the user's own
plan, My Recovery Plan pre-filled from real data with edit/confirm per section
(Ex 10.3), graduation, PDF export, pinned in SOS, monthly "still true?" review,
the full Weekly Review flow, and Maintenance mode at 6 months. Tutorials and
help entries. Tick COVERAGE.md. Push.
```

### Step 3.9: Coverage audit

```text
Follow the house rules in docs/BUILD-GUIDE.md. Compare docs/book/exercises.md
with docs/COVERAGE.md and the app. For every exercise, confirm it is
implemented, has its tutorial and is tested, or record why it is deferred.
Fix small gaps; list bigger ones as follow-up steps. Push the updated
COVERAGE.md and a short report.
```

**Phase 3 done when:** every row in COVERAGE.md is done or consciously deferred.

---

## Phase 4: Full game layer (about 4–5 weeks, can overlap Phase 3)

### Step 4.1: Progress map, ranks and badges

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §6 in full and
the game-theme ADR.

Build the progress map chosen in the game-theme ADR (the Brain Map or the
Harbor map from §6.2: six regions that light up from skill mastery; warm,
organic illustration style, nothing ever decays), ranks (Explorer →
Guide), the badges from §6.6 (deterministic, not farmable), sober-day
milestone celebrations with no XP, and cosmetic unlocks earned by practice.
Link roadmap milestones to the map. Tests prove nothing can be lost or
randomized. Push.
```

### Step 4.2: Quests and mini-games polish

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §6.5.

Polish every quest and mini-game in §6.5 into a consistent quest log in
Actions: progress, rewards, replays. Add the Refusal Rehearsal dialogue game
(scripted scenes with feedback against the refusal checklist) and the Spot the
Red Flag quiz. Tutorials and help entries. Push.
```

### Step 4.3: Calm mode and the guardrail review

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §6.1.

Add Calm mode (all game visuals off, every function kept, tutorials shown
plainly). Then review the whole app against the §6.1 do/don't table and the
safety house rules, fix any violation, and write docs/guardrail-review.md with
each rule and how the app meets it. Push.
```

### Step 4.4: Living progress map, motion polish and the performance budget

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §10.8,
docs/design/style-guide.md and the game-theme ADR.

Make the progress map a living scene: time-of-day light, gentle water or
ambient motion, lanterns or regions that light up with practice, and a calm
forecast look for planned rough weather, all with a static equivalent when
reduced motion is on. Polish micro-interactions: every log, check-in and
"wave surfed" moment gets a short, quiet acknowledgement under 300 ms. Then
enforce the §10.8 performance budget in CI (download and installed size,
cold start to SOS, frame time, memory, battery, zero startup network calls),
fix anything over budget, and add screenshot tests for the main screens in
light and dark themes. Push.
```

**Done when:** the budget checks pass in CI, and the scene looks right with reduced motion on.

---

## Phase 5: Native app & polish (about 4–5 weeks)

> Parts of this phase need a Mac with Xcode (iOS) or Android Studio, so some steps run on your own computer. Each prompt asks Claude to tell you exactly what to run locally.

### Step 5.1: Capacitor wrapper

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §10.1 and §12
(Phase 5).

Add Capacitor for iOS and Android around the existing web app. Keep the web
build working. Write docs/native-setup.md with the exact local steps for me
to build and run on my own phone (I may not know Xcode or Android Studio).
Push.
```

### Step 5.2: Native notifications, biometric lock and secure keys

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §9 and §10.5.

Replace in-app reminders with native local notifications on the native
builds (discreet text, quiet hours, daily cap, anchored to the user's risky
times). Add a biometric unlock and move the encryption key to the iOS
Keychain / Android Keystore. Add discreet mode's neutral icon and name.
Document anything I must test on a real device. Push.
```

### Step 5.3: SOS shortcut and final polish

```text
Follow the house rules in docs/BUILD-GUIDE.md. Add an SOS home-screen
shortcut (and a widget if practical), swap text-to-speech for recorded audio
if I've provided files in content/audio, and run a full accessibility and
performance audit on the native builds. Fix what you can and report the rest.
Push.
```

### Step 5.4: Purchases and the device licence

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §9.1 and the
ADRs for D4, D15 and D19.

Add purchases and the device licence to the native builds: the store in-app
purchase (one-time or subscription per the D15 ADR) with restore; a
device-bound key pair created in the Secure Enclave or Android Keystore on
first run; a licence check that caches a signed token and works offline with
a grace period; a "Your devices and plan" screen that lists up to three
devices and lets me remove one; and the D19 safety floor: urgent help, SOS,
my own artifacts, logs, export and delete must work with no licence,
offline, and after a lapse. Write docs/licence-server.md describing the tiny
server the app talks to, what it stores and what it must never store. Test
the lapse and offline cases end to end. Push.
```

**Done when:** sandbox purchases work on both stores, and SOS opens with no network and an expired licence.

---

## Phase 6: Validate & launch

### Step 6.1: Clinical review packet

```text
Read PLAN.md §8. Collect every piece of content marked clinicalReview: true,
plus all crisis, lapse, withdrawal, overdose and medication text, into
docs/review/clinical-review-packet.md, grouped by screen, with space for the
reviewer's comments. Then write a short cover note I can send to a licensed
addiction professional explaining what the app is and what I need them to
check. Push.
```

### Step 6.2: Usability study kit

```text
Read PLAN.md §8 (user research). Write docs/review/usability-study.md: goals,
a consent form, a recruiting note, 6 short tasks (including SOS and the
tutorial), questions about tone and the game layer, and a simple results
template. Keep it ethical: paid, consented, no pressure to share use history.
Push.
```

### Step 6.3: Privacy policy and store listing drafts

```text
Read PLAN.md §8–§9 and the ADRs. Draft docs/review/privacy-policy.md (plain
language, matching exactly what the app does: local-only data, no tracking)
and docs/review/store-listing.md (name, short and long description, keywords,
screenshot list, age rating notes). Mark both "draft, needs legal review".
Push.
```

### Step 6.4 (optional, later): AI coach

```text
Read PLAN.md §11 and use the claude-api skill. Propose (don't build yet) the
opt-in AI rehearsal partner: backend proxy design, prompts, crisis routing,
data minimization, an eval set of scenarios (including crisis and
manipulation attempts) and costs. Write docs/ai-coach-proposal.md and push.
```

### Step 6.5: Sync service for up to three devices

```text
Follow the house rules in docs/BUILD-GUIDE.md. Read PLAN.md §9 and §9.1 and
the D4 ADR.

Build the sync service for up to three devices on one plan: end-to-end
encrypted (the server stores only ciphertext, device public keys and plan
ids); a pairing flow that moves the sync key from one device to another by
QR code or short code; conflict handling for the append-only event log and
for edited artifacts; a "last synced" status in Settings; and removal of a
lost device. Nothing health-related ever leaves the device unencrypted, and
the server keeps no logs of content. Write docs/sync-design.md with threat
notes. Test two devices syncing offline edits. Push.
```

**Done when:** two phones on one plan show the same data within a minute of coming online, and the server cannot read any of it.

---

## Appendix A: Reusable prompts

**Fix it** (when something is broken):

```text
Something is wrong: <describe what you saw, on which screen, and what you
expected>. Reproduce it with a failing test first, fix it, make sure
`npm run check` passes, and explain the cause in one paragraph. Push.
```

**Pick up where we left off** (start of any session):

```text
Read CLAUDE.md, docs/PLAN.md, docs/BUILD-GUIDE.md and docs/COVERAGE.md. Look
at the latest merged pull requests and tell me which build step comes next,
whether anything from the previous step is unfinished, and what you'd do
first. Don't change anything yet.
```

**Write lesson content:**

```text
Follow the house rules in docs/BUILD-GUIDE.md and docs/content-style.md.
Write the lessons for module <Mx> from PLAN.md §5.3 using the matching
docs/book/ chapter notes for the ideas only: all wording original, person-first,
reading level grade 6–8, an original cast character in each story moment.
Validate content and tick COVERAGE.md. Push.
```

**Safety review** (after any step that touches SOS, mood, lapse or medical text):

```text
Review the changes on this branch against PLAN.md §8 and the safety house
rules: crisis access, withdrawal and overdose wording, no diagnosis claims, no
shame language, no game mechanics that punish slips. List problems by
severity and fix the clear ones. Push.
```

**Code review:** run `/code-review` in the session before creating the PR.

**Change the plan:**

```text
I want to change the plan: <describe the change>. Update docs/PLAN.md (and
BUILD-GUIDE.md steps if affected), add an ADR in docs/decisions/, and tell me
what it changes for steps already built. Don't write app code. Push.
```

## Appendix B: Definition of done (every step)

- [ ] Does what the step's prompt asked, and matches the PLAN sections it names
- [ ] Original wording only, in the content style
- [ ] Safety and privacy house rules respected
- [ ] Tutorial + help entry + tutorial e2e for any new user-facing feature (from Phase 2)
- [ ] Unit and e2e tests added; `npm run check` green locally and in CI
- [ ] Keyboard, screen-reader and reduced-motion friendly
- [ ] `docs/COVERAGE.md`, `CLAUDE.md` and ADRs updated where relevant
- [ ] Summary written: what changed, how to try it, what's left
