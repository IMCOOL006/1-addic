---
title: Early Access and the build program
subtitle: A two-week testable build, your answers recorded, and the proposed way of working, with one reply to copy
kicker: PROJECT 1-ADDIC
box_title: What this document asks of you
box: Part 1 records your Part 2 and Part 3 answers and the two designs you asked for (device transfer, visual direction). Part 2 is the plan for a testable Early Access build in the next two weeks. Part 3 proposes the multi-chat build program adapted from Kriya. Part 4 lists the open questions with the default I will use. Part 5 is the reply to copy. || Nothing is built and no setting is changed until you reply.
note: Companion to the 1-addic Execution Plan (docs/1-addic-execution-plan.docx) and the decision records in docs/decisions/. Source text: docs/program/EARLY-ACCESS-AND-PROGRAM.md.
---

# How to use this document

> In short: Read Part 2 if you want to know what you will be able to test in two weeks. Read Part 3 if you want to know how the work will be organised from now on. Answer with the one line in Part 5; every question has a default that applies if you do not answer it, but silence is never a yes.

This follows your standing instruction from the Kriya build program: decisions are read, not made; questions are batched in one document with defaults; every decision document has the problem, the long-term solution, the options, the recommendation and a reply you can copy. The records live in `docs/decisions/` and `docs/program/`.

# Part 1: Your answers, recorded

> In short: Parts 2 and 3 of the questionnaire are recorded in `docs/decisions/owner-inputs.md` and in two new decision records. Four answers changed the plan: Android first, free tools until public, the device-transfer design, and the forecast check.

## 1.1 What changed because of your answers

> In short: Most inputs took the recommended default. The table shows the ones that moved something.

@widths 0.6,1.6,2.8
| ID | Your answer | What it changed |
|---|---|---|
| I2 | Free tools until public | Unity Personal; a community Unity MCP server if the official one needs a paid plan; the friends build as a direct Android install, so no Play Console fee until public; free fonts and sounds; generated placeholder art for the alpha; no paid clinical or legal hours until Phase 6. |
| I3 | Unity and Android available; iPhone later | The spike and Early Access measure Android only. No Mac, Apple account or TestFlight needed now (addendum to decision record 0003). |
| I5, I6 | Legal and crisis-number verification before release | Scheduled before the public release. My default is to verify the crisis numbers before the friends build too (Q7 below). |
| I7 | Suggest visual directions | Four directions in 1.5, with a recommendation. |
| C2 | Double the pass marks for now; test on a real device, then decide | Confirmed in record 0003. |
| C3 | Default, plus transfer for lost or changed devices | Designed in 1.2 and record 0020. |
| C5 | Yes to the forecast check | Adopted in record 0021; built with the Weekly Review. |

## 1.2 Moving, losing and recovering devices (C3)

> In short: Changing phones is a ten-minute code between the two phones. Losing one phone is a tap on another. Losing every phone is recovered through the store purchase, which proves ownership without any account of ours. Support handles only what the store cannot prove, and can never see or recover data.

- **Both phones in hand.** Settings → Your devices and plan → "Move to a new phone". The old phone shows a short code or QR valid for ten minutes; the new phone enters it. The server moves the slot in one step, and the old phone hands its encrypted data (and later the sync key) directly to the new one.
- **One phone lost, another still on the plan.** Remove it from any remaining device. Its licence is revoked at its next check; its local data stays encrypted behind the PIN; the safety floor keeps working on it.
- **Every device lost.** The store purchase is the recovery root: install on the new phone, tap "Restore purchase", and the Google Play account proves ownership. The server matches the receipt to the plan and offers to move it to the new phone. No password of ours is needed.
- **Data after a total loss.** Without sync, the data is gone unless a backup was exported, which is why the monthly reminder and one-tap export exist. With sync (Phase 6), data comes back only with a recovery code (a 12-word phrase or printable QR shown once at setup). Without it nobody can decrypt the data, including us, and the app says so plainly.
- **Support ticket, narrow.** Only for what the store cannot prove: a form with the order id. Support can move a plan's slots after checking the receipt, can never recover data or see health data, and every support action is shown to the person in the app.
- **Limits.** At most three device changes per plan in 30 days (support can lift it). Invite codes do not change on transfer. When the plan is full, the app offers to remove a device before adding one.

::: decision Recommended:
Adopt this as the device policy (record 0020). It is built in Step 5.4, with the recovery code in Step 6.5.
:::

## 1.3 The forecast check (C5)

> In short: Adopted. In the Weekly Review, last week's forecast rough weather sits beside what the logbook recorded, as reflection, never as a score.

It uses data the app already has (planner blocks marked risky, Battle Plans, craving and feeling logs), adds no entity and no points, and is built with the Weekly Review in Step 3.8. Record 0021.

## 1.4 Android first (I3) and free until public (I2)

> In short: The next months run on your Windows machine with Unity 6.6, an Android phone, and free tools. The iPhone version, the Mac, the Apple account and the Play Console fee wait until they are needed.

- **The friends build** is a direct Android install (an APK file shared with friends), which costs nothing and needs no store account. Android asks the person to allow installs from the file; `docs/friends-release.md` (Step 2.12) will explain it in one screen.
- **Unity MCP:** Unity's official server is in open beta and may require a Unity AI subscription; if it does, a free community MCP server for Unity is used instead, and the choice is recorded in the spike report.
- **Unity version:** Unity 6.6 for the build; the Unity 7 alpha only to try the official MCP, never for the shipped build.
- **Encrypted storage in the alpha:** an encrypted JSON store with a PIN-derived key using the .NET crypto built into Unity (free), with the Android Keystore added in Phase 5. SQLite with SQLCipher only if a free, maintained Unity package is found.

## 1.5 Visual direction: four options to discuss (I7)

> In short: Four looks that fit a calm, adult harbor for people in Gujarat and beyond. My recommendation is the paper harbor with a few folk-motif accents, produced first as generated placeholders and later by an illustrator.

@widths 1.1,2,1.5,1.3
| Direction | What it looks like | Why it fits | Watch out for |
|---|---|---|---|
| **1. Paper harbor** | Layered, hand-cut paper shapes with soft daylight gradients; sea, breakwater, lighthouse and garden as separate layers that drift gently. Palette: deep teal, sand, terracotta, lantern gold. | Warm and tactile, never clinical; perfect for Unity 2D with parallax layers; cheap to animate; dark mode becomes a lantern-lit paper night. | Can look like a children's book if the shapes get too round; keep the typography adult. |
| **2. Ink and wash, with Gujarati motifs** | Fine ink lines with watercolour wash; indigo, brass and saffron accents; sparing folk geometry (dot-work and embroidery-like borders) on cards and badges. | A strong local identity that still reads as calm; the lighthouse beam and fog suit ink and wash well. | Busy if motifs are overused; needs restraint and a style guide line "one motif per screen". |
| **3. Dusk minimal** | Flat vector, few lines, soft gradients, the lighthouse beam as the one recurring light motif; dark-first palette. | Cheapest to produce; very calm; excellent for SOS at night. | Generic; the harbor may feel like an icon rather than a place. |
| **4. Low-poly diorama** | A small 3D-looking harbor (2.5D sprites) that turns with the time of day. | Playful and "alive"; shows off Unity. | More production work; can feel like a game first and a recovery app second. |

::: decision Recommended:
Direction 1, the paper harbor, with direction 2's motifs as small accents on badges and section headers. For the Early Access build, generated placeholder art in that style, kept consistent by the design tokens; an illustrator later, when the look is confirmed with friends. Free fonts: Noto Sans and Noto Sans Gujarati.
:::

# Part 2: Early Access in two weeks

> In short: A playable, testable Android build on Unity in ten working days, with SOS, the harbor, quick logs, the first lessons and the evidence screen working, and every other feature visibly locked. It doubles as the Unity spike: the same build is measured against the pass marks, so the platform decision comes with it.

## 2.1 What "early access" means here

> In short: Three honest states for every feature: working, stub, or locked. Nothing pretends to be finished, nothing is hidden, and the safety rules apply from the first build.

- **Working:** usable for real, with real data and tests. SOS and urgent help are in this group from day one; house rule 2 applies to the alpha as much as to the release.
- **Stub:** the screen exists with a minimal version and a clear "early" label; it does something small and real (for example "I'm feeling…" offers SOBER and a call, nothing more).
- **Locked:** the tile is there with one line saying what it will be and which build unlocks it ("Planner: plan your day and see risky gaps. Build 0.2"). Nothing behind it.
- The first run shows "Early access. Not yet clinically reviewed. Crisis numbers are shown for your region; please check them." and a feedback link. Sample content is marked as sample.
- Tutorials, the tour and the drill are Phase 1 and 2 work and are locked in build 0.1, except a three-step first-run tour if time allows.

## 2.2 The slice: what works and what is locked

> In short: Everything a person needs in a hard moment works; the Journey starts; the rest is visible and locked.

@widths 1.2,0.7,3.1
| Feature | State | What is in build 0.1 |
|---|---|---|
| App shell | Working | Five tabs, floating SOS button, light and dark themes, Calm mode toggle, safe areas. |
| Onboarding | Working | Welcome and what the app is not; optional PIN; substance and word; stage and motivation slider; medical safety card; three quick reasons; one Safety Net; region India; pace (five options). Skippable except the safety notice. |
| Today | Working | Greeting; harbor scene v0 (layered placeholders with gentle motion; the Cove lights up with SOS use); evening check-in card; Reasons Card peek; "Continue: Start Here"; opt-in counters; Momentum ring. |
| SOS: I'm craving | Working | The full flow from the plan: rating, 15-minute wave timer, Ride the wave (SOBER text with Android text-to-speech), Remind me why, Call someone, Distract me (starter deck), Talk back (locked until build 0.3), guide me, the "somewhere risky?" prompt, re-rate, delay loop, what helped, did you use. Saves a craving log. Works offline. |
| SOS: I'm feeling… | Stub | Pick an emotion; anger gets the count-to-ten and a step-away line; the rest get SOBER, one reassuring line and Call someone; logs the feeling. |
| SOS: I slipped | Stub | Compassion first, the safety text (overdose after a break, don't use alone, naloxone, withdrawal), Call someone, urgent help. Slip Review locked. |
| Urgent help | Working | India numbers marked "needs verification", call and copy buttons, offline. |
| Quick log and Timeline | Working | Craving and Feeling entries with the plan's fields; evening check-in; a Timeline list. |
| Reasons Card and Support Network | Working | Quick Reasons Card with the big SOS view; contacts by name and number with a role. |
| Learn | Working / Locked | Roadmap map v0 with the eleven stops; module M0 "Start Here" playable (three short original lessons through the lesson player: cards, check, wrap; "Try it" stubbed); M1 to M10 locked. |
| Workbook | Locked | The artifact list with "coming soon"; Reasons Card and Support Network open. |
| Track: Insights | Locked | "Appears after seven logs. Build 0.2." |
| Actions | Locked | Planner, Battle Plans, quests, Weekly Review, each with one line. |
| Settings | Working | App lock, Calm mode, terminology, export JSON after PIN, delete everything, About & evidence (seeded with ten references), early-access notice, build number, feedback link. |
| Data | Working | Encrypted local store, append-only event log, XP derived from events (shown as a number). |
| Accessibility | Working | TalkBack labels on SOS, onboarding and Today; font scaling honoured. |
| Gujarati, tutorials, licence, invites, sync, audio recordings | Locked | Later builds, as the plan schedules them. |

## 2.3 The two weeks, lane by lane

> In short: Five lanes, one branch each, run one after another on your Windows machine with Claude Code and the Unity Editor open; cloud sessions help with content and documents. Week 1 builds the shell, the data, the hard-moment features and Today; week 2 adds Learn, the evidence screen, accessibility, measurement and the build for friends.

@widths 0.8,0.8,2.2,1.2
| Lane | Days | Builds | Done when |
|---|---|---|---|
| A: Foundation | 1–2 | Unity 6.6 project (2D URP), MCP loop proven, design tokens and base components, shell and navigation, locked placeholders, encrypted store, event log, repositories, Edit Mode test project, gate scripts, baseline recorded | Tabs navigate on the phone; a unit test suite runs in batch mode; the encryption round-trip test passes |
| B: First day | 2–4 | Onboarding, Reasons Card, Support Network, urgent help with the India file, quick log, evening check-in, Timeline, Today v0 | A new user reaches Today in under three minutes and can log a craving |
| C: SOS | 3–5 | The craving flow in full, the feeling and slip stubs, the wave timer with reduced motion, text-to-speech, the cold-start measurement harness | A full SOS session in airplane mode shows in the Timeline; cold start to SOS measured |
| D: Learn and evidence | 6–7 | Roadmap map v0, lesson player, M0's three lessons in original words, locked modules, About & evidence seeded, XP and the Cove lighting, Calm mode | M0 plays end to end; the evidence screen opens offline |
| E: Measure and release | 8–9 | TalkBack labels and font scaling, performance pass against the doubled marks, export and delete, the early-access notice and feedback link, the APK, `docs/early-access-0.1.md`, the spike report with the go/no-go | Every pass mark measured and recorded; a friend installs the APK from a link |
| Buffer | 10 | Fixes, the `ea-0.1` tag, the boundary record, the questions document | The boundary is written |

~ Days are working days. Week 2's last day is a buffer, not a plan. If lanes slip, Learn (lane D) is cut to one lesson before anything in lanes B or C is cut.

## 2.4 The units

> In short: Twenty-two units with one-line acceptance each. This is the list the build program turns into the unit file (Part 3); here it is the plan.

@size 17
@widths 0.5,1.5,0.5,2.5
| Unit | Name | Lane | Acceptance |
|---|---|---|---|
| U-01 | Unity project and MCP loop | A | Unity 6.6 2D URP project in the repo; Claude Code changes a scene through MCP and the change builds. |
| U-02 | Design tokens and base components | A | Colours (light and dark), type scale, spacing, Button, Card, Slider, Chip, Sheet, ProgressRing; a gallery scene. |
| U-03 | Shell, navigation, locked placeholders | A | Five tabs, floating SOS, locked tiles with one line each and a build number. |
| U-04 | Encrypted store and event log | A | AES-GCM store keyed from the PIN (PBKDF2), append-only events, repositories for Profile, Contact, LogEntry, ExerciseResponse, DomainEvent; round-trip and migration tests. |
| U-05 | Gates and baseline | A | `scripts/gates/` runs Edit Mode tests and the Android build in batch mode, prints counts and failing names, keeps logs on disk; `docs/program/BASELINE.md` written. |
| U-06 | Onboarding | B | The eight screens of 2.2, skippable except the safety notice, saving Profile and events. |
| U-07 | Reasons Card | B | Seeded from onboarding; edit, reorder, add; big SOS view. |
| U-08 | Support Network (basic) | B | Name, number, role; used by SOS Call someone. |
| U-09 | Urgent help and India resources | B | `content/resources/in.yaml`, every number "needs verification", call and copy, offline. |
| U-10 | Quick log, check-in, Timeline | B | Craving, Feeling, evening check-in; Timeline list. |
| U-11 | Today v0 | B | Greeting, check-in card, Reasons peek, Continue, counters opt-in, Momentum. |
| U-12 | SOS craving flow | C | The plan's diagram end to end, offline, saving a craving log and skill-use events; e2e-style play-mode test. |
| U-13 | SOS feeling and slip stubs | C | Emotion pick with the anger timer; the slip safety text; both reach Call someone and urgent help. |
| U-14 | Wave timer and text-to-speech | C | Calm wave animation with a static version for reduced motion; Android TTS for the SOBER script. |
| U-15 | Cold-start harness | C | A timer from process start to the SOS screen interactive, written to a log. |
| U-16 | Roadmap map v0 and locked modules | D | Eleven stops, M0 open, M1–M10 locked with their names and one line. |
| U-17 | Lesson player and M0 lessons | D | Cards, check with explanations, wrap; three original M0 lessons; "Try it" stub. |
| U-18 | About & evidence (seed) | D | Ten references from `docs/evidence-references.md`, the not-clinically-tested line, links. |
| U-19 | XP and the Cove | D | XP from events on Today; the Cove region lights with SOS use; Calm mode hides the scene. |
| U-20 | Accessibility pass | E | TalkBack reads every SOS, onboarding and Today control; font scaling honoured. |
| U-21 | Performance pass and spike report | E | Every doubled pass mark measured on the Android phone; `docs/unity-spike.md` with the go/no-go and, if needed, the failure report. |
| U-22 | Early-access build | E | Signed APK, `docs/early-access-0.1.md` (install, what works, what is locked, known issues, feedback), the early-access notice in the app. |

## 2.5 How it is built

> In short: On your machine, one lane at a time, with the house rules, the gates and the commit rule from Part 3 applied from the first lane.

- **Where:** your Windows machine with Unity 6.6 and Claude Code, one lane branch at a time (`lane/a-foundation`, `lane/b-first-day` and so on), merged to `main` at the end of each lane after the gates pass. Cloud sessions write content (the M0 lessons, the resources file, the evidence seed) and documents in parallel.
- **Gates (by name, against the baseline):** Edit Mode tests in batch mode; the Android build; the content validation script; the document checks. Each prints counts and failing names and leaves its log under `.gates/` on disk.
- **Commit rule:** commit by path with the counts declared; never "all untracked". Push at the end of a lane; a push in the middle of a lane needs your word.
- **House rules apply:** SOS offline and never gated; no analytics, ads or trackers; no streak resets or random rewards; keyboard, TalkBack and reduced motion respected; `docs/COVERAGE.md` ticked for the exercises the build covers (Ex 3.1, 3.2 seed, 4.4 basic, 5.4, 8.1 daily totals).
- **What this build does not do:** Gujarati, tutorials, licence, invites, sync, iPhone. It is an alpha for you, then for friends after build 0.2 adds Gujarati.

## 2.6 The go/no-go at the end of week 2

> In short: The same build is measured against the doubled pass marks on your Android phone. Pass means Unity is the foundation and the guide is re-planned for it; fail means the report says what failed and by how much, and the content moves to the web stack.

@widths 1.5,1.6,1.9
| Check | Spike pass mark (doubled) | How it is measured |
|---|---|---|
| Cold start to a usable SOS screen, offline | ≤ 4.0 s on a mid-range Android | The U-15 harness, ten cold starts, median |
| Download size | ≤ 120 MB | The signed APK size |
| Installed size | ≤ 240 MB | Android app info after first run |
| Memory on Today | ≤ 500 MB | Android Studio profiler or the device's memory view |
| Battery, 30 minutes idle on Today | ≤ 4% | Battery level before and after, screen on |
| Screen reader | TalkBack reads every SOS, onboarding and Today control with a role and a label; font scaling honoured | A recorded TalkBack walkthrough |
| Text input | Keyboard, autocorrect and dictation work in a long text field | A craving log with a dictated thought |
| Startup network calls | Zero | A proxy or the phone's network log during ten starts |
| Workflow | Claude Code completes a build, test and change loop through MCP | Lane A's U-01 |

If any check fails, `docs/unity-spike.md` names it, the measured value, the gap, and what would have to change; you then decide D3 with the numbers in hand, as record 0003 says.

## 2.7 Risks in these two weeks

> In short: The three risks that can eat the two weeks are MCP setup, the Unity 7 alpha, and encryption plugins. Each has a cheap fallback.

- **MCP setup time.** The official server's requirements are changing. Fallback: a free community MCP server; a day is budgeted in lane A either way.
- **Unity 7 alpha.** Alpha builds crash and measure differently. Fallback: Unity 6.6 for everything except a one-hour MCP trial.
- **Encrypted storage.** Paid SQLCipher plugins are out (I2). Fallback: encrypted JSON through .NET crypto, which is enough for an alpha and for the pass marks.
- **Android device.** The pass marks need a mid-range phone; a flagship makes them look better than they are. Note the device model in the report.
- **Scope creep.** Everything not in 2.2 is locked, not "quickly added".

## 2.8 The lane prompts

> In short: Five prompts, one per lane, to paste into Claude Code on your machine after you approve this plan. They follow the house rules and the program's hand-off rule.

```text Prompt for lane A (paste after approval)
Follow the house rules in docs/BUILD-GUIDE.md and docs/program/PROTOCOL.md.
Read docs/program/EARLY-ACCESS-AND-PROGRAM.md Part 2 (units U-01 to U-05),
PLAN.md §10.1, §10.7, §10.8 and the ADRs 0003 and 0006.

Lane A, branch lane/a-foundation, on this machine with Unity 6.6 and the
Android build tools. Build U-01 to U-05: create the Unity 2D URP project in
the repo with the folder layout from PLAN §10.7 adapted to Unity; prove the
MCP loop by making one scene change through Claude Code; design tokens and
base components with a gallery scene; the shell with five tabs, a floating
SOS button and locked placeholder tiles; the encrypted store (AES-GCM, PIN
with PBKDF2), the append-only event log and repositories with Edit Mode
tests; scripts/gates/ that run the tests and the Android build in batch
mode, print counts and failing names, and keep logs under .gates/. Record
docs/program/BASELINE.md. Commit by path with counts. Write the hand-off
note in docs/program/run/BUILD-RUN-RECORD.md before stopping.
```

```text Prompt for lane B (paste after approval)
Follow the house rules in docs/BUILD-GUIDE.md and docs/program/PROTOCOL.md.
Read docs/program/EARLY-ACCESS-AND-PROGRAM.md Part 2 (units U-06 to U-11),
PLAN.md §5.1, §5.4, §5.5, §5.8 and the ADRs 0010 and 0018.

Lane B, branch lane/b-first-day from the merged lane A. Build U-06 to U-11:
onboarding (eight screens, skippable except the safety notice, five pace
options, region India), the quick Reasons Card with its big SOS view, the
basic Support Network, urgent help driven by content/resources/in.yaml with
every number marked "needs verification", the quick log (craving, feeling),
the evening check-in, the Timeline, and Today v0 with Momentum and opt-in
counters. Person-first copy in content/copy. Edit Mode tests for the data,
a Play Mode test for onboarding. Gates green by name. Commit by path with
counts. Hand-off note before stopping.
```

```text Prompt for lane C (paste after approval)
Follow the house rules in docs/BUILD-GUIDE.md and docs/program/PROTOCOL.md.
Read docs/program/EARLY-ACCESS-AND-PROGRAM.md Part 2 (units U-12 to U-15),
PLAN.md §5.2 in full, docs/book/06-step4-respond-to-distortions.md and
docs/book/07-step5-mindfulness.md.

Lane C, branch lane/c-sos from the merged lane B. Build U-12 to U-15: the
"I'm craving" flow exactly as the PLAN §5.2 diagram shows, offline, saving
a craving log and skill-use events, with Talk back locked until build 0.3;
the "I'm feeling…" and "I slipped" stubs with the anger timer and the slip
safety text; the wave timer with a static version for reduced motion; the
SOBER script through Android text-to-speech; and a cold-start harness that
logs the time from process start to the SOS screen being interactive. Never
show anything but SOS inside SOS. Play Mode test for the whole flow in
airplane mode. Gates green by name. Commit by path with counts. Hand-off
note before stopping.
```

```text Prompt for lane D (paste after approval)
Follow the house rules in docs/BUILD-GUIDE.md and docs/program/PROTOCOL.md.
Read docs/program/EARLY-ACCESS-AND-PROGRAM.md Part 2 (units U-16 to U-19),
PLAN.md §5.3, §5.11, §5.12, §6.2 and docs/evidence-references.md.

Lane D, branch lane/d-learn from the merged lane C. Build U-16 to U-19: the
Roadmap map v0 with eleven stops, M0 open and M1 to M10 locked with their
names and one line each; the lesson player (cards, check with explanations
and no fail state, wrap) with three short original M0 lessons written in
our own words; About & evidence seeded with ten references from the list;
XP derived from the event log shown on Today; the Cove region of the
harbor scene lighting up with SOS use; Calm mode hiding the scene. Validate
content. Gates green by name. Commit by path with counts. Hand-off note
before stopping.
```

```text Prompt for lane E (paste after approval)
Follow the house rules in docs/BUILD-GUIDE.md and docs/program/PROTOCOL.md.
Read docs/program/EARLY-ACCESS-AND-PROGRAM.md Part 2 (units U-20 to U-22
and section 2.6), PLAN.md §10.8 and ADR 0003.

Lane E, branch lane/e-release from the merged lane D. Build U-20 to U-22:
TalkBack labels and font scaling on SOS, onboarding and Today; a
performance pass against the doubled spike pass marks on my Android phone,
recording every measurement with the device model; export after PIN and
delete everything; the early-access notice and feedback link on first run;
a signed APK; docs/early-access-0.1.md (install steps, what works, what is
locked, known issues, how to send feedback); and docs/unity-spike.md with
the go / no-go for D3 and, if anything fails, exactly what, by how much and
what would have to change. Gates green by name. Commit by path with counts.
Tag ea-0.1 only when I say so. Hand-off note before stopping.
```

# Part 3: The build program, adapted from Kriya

> In short: The mechanisms stay, the scale shrinks. Three chats to start (a planner-scribe, an integrator on your machine, one build track), the same files and rules Kriya uses, and a fourth and fifth chat when the work needs them. Nothing is created until you reply.

## 3.1 The problem in plain language

> In short: One long chat doing everything is slow, expensive and forgetful. The work needs to be cut into units with owners, gates and records, and the chats need to coordinate through files instead of memory.

Today this project runs in one cloud chat that plans, writes documents, and will soon build. Kriya's experience says that model re-reads everything it wrote, loses track at boundaries, and costs several times what the same work costs with a few chats that each own their files, with a step budget, gates judged by name, and hand-off notes. The Early Access build is the first group where this matters: five lanes, two machines (your Windows machine with Unity, the cloud for content), and a go/no-go at the end.

## 3.2 The long-term solution

> In short: Kriya's mechanisms, kept whole: one writer per file, status and outbox files, run records, a generated unit list, the agent pipeline with caps, gates by name against a baseline, hand-off notes, the context diet, the meter at every boundary, a restart at 300,000 tokens, and decisions read rather than made.

- **Units, lanes, groups.** A unit is one change with its files and its acceptance; a lane is units that touch the same area, on one branch; a group is a milestone that ends at a boundary: lanes converge on `main`, the gates run, the record is written, every open question goes to you in one document, and fresh chats start the next group. Group 0 is Early Access 0.1.
- **One writer per file.** Each chat owns its folder, status file, outbox and run record. Shared files are append-only under the chat's banner. To change another chat's file, ask through the outbox.
- **Status files** with fixed first lines (TRACK, GROUP, STATE, LANES-RUNNING, the wave branches, BASE, UPDATED), read by everyone before cutting lanes and before any heavy run; a script prints them together as the board.
- **Outboxes** carry requests (`R-<TRACK>-<n> · to <TRACK> · <date> · <what and why> · [needs: <branch>] · STATUS: open`) and answers (`re R-<TRACK>-<n> · <answer> · done|declined`); `needs:` is checked with `git merge-base --is-ancestor` before starting.
- **Run records** with clock time stamps and commit SHAs, so a new chat can take over from the status file and the run record alone.
- **The unit list** is generated by a script from the build guide plus an overrides file; nobody edits it by hand; each chat's queue is a view of it.
- **The agent pipeline** per lane: a scout writes a brief of at most 15 KB; builders take two or three units each with the brief, the previous hand-off note and their batch; a read-only checker runs the gates and returns findings; a sensitive lane (here: SOS, crisis copy, the licence, anything touching money or health data) also gets two reviewers with different lenses; then fixes and a lane report of at most 20 KB with evidence by path. A failed check is rebuilt one level up; the checker never fixes what it checks.
- **Gates by name, never by count** and never "exit 0": the baseline is recorded first, and every lane is judged against it with no new failure by name. The gate scripts print counts and failing names and leave the raw log on disk.
- **The hand-off note** is a builder's only output: done with SHAs, in flight, files touched, the one thing not to rediscover, evidence by path.
- **The context diet:** the step budget (80 tool steps or two to three units), batched reads, search before reading and line ranges, summaries not logs, briefs under 15 KB, reports under 20 KB, big files through tools, a file read once, think then act, the hand-off note before any long step, the one-hour cache for sub-agents, and a restart at every milestone and at 300,000 tokens with the resume line.
- **The meter** at every boundary: dollars, the re-read ratio, re-writes, agents over 100 steps, the three biggest reads, per chat and per agent, in one paragraph of the boundary record.
- **Decisions are read, not made.** The protocol and the addendum (your rulings, here the ADRs) bind every lane; a ruling that looks wrong in the code is a question to you, not a design choice.

## 3.3 Options

> In short: One chat as now, three chats now and five later, or five chats now. The middle option fits a one-owner project that is about to build its first group.

@widths 1,2,1.4,1.4
| Option | What it means | Upside | Downside |
|---|---|---|---|
| A. One chat, as now | The current cloud chat plans, builds and records. | Nothing to set up. | Slow and expensive at scale; forgetful at boundaries; one machine with Unity cannot be driven from a cloud chat. |
| **B. Three chats now, five later** | A planner-scribe (cloud), an integrator on your Windows machine (the Unity machine: lanes, gates, merges, builds, MCP), and one build track (cloud, for C# logic, content and documents). A second build track and a separate scribe when a group has more than three lanes in parallel. | All of Kriya's mechanisms with the smallest number of chats that still separates planning, integration and building. Matches the fact that only your machine can run Unity. | Three chats to keep in step through files; you run the integrator chat yourself. |
| C. Five chats now | Planner, integrator, scribe and two build tracks from day one. | Maximum parallelism. | More coordination than Early Access needs; most lanes are sequential on one Unity machine anyway. |

## 3.4 Recommendation: option B, with these specifics

> In short: Three chats, the files below, five agent types with caps, four gate scripts, the commit rule and the meter. Group 0 is Early Access 0.1. The one setting is yours to add.

**The chats and what each one writes**

@widths 1,1.6,2.4
| Chat | Runs where | Owns and writes |
|---|---|---|
| **PLAN** (planner and scribe) | Cloud session | `docs/PLAN.md`, `docs/BUILD-GUIDE.md`, `docs/decisions/`, the unit list generator and overrides, `docs/program/PROTOCOL.md`, the boundary records, the questions documents, the meter, the Word documents; `docs/program/status/PLAN.md`, `outbox/PLAN.md`, `run/PLAN-RUN-RECORD.md`. |
| **INT** (integrator, the machine) | Claude Code on your Windows machine with Unity | The Unity project, lane branches and merges to `main`, the gates and the baseline, the Android builds and the APK, measurements, the MCP loop, locks for heavy runs; `status/INT.md`, `outbox/INT.md`, `run/INT-RUN-RECORD.md`. |
| **BUILD** (build track 1) | Cloud session | C# logic that does not need the Editor (data model, XP derivation, insights maths, resources and content files, the M0 lessons, tests for pure logic), documents the lanes need; `status/BUILD.md`, `outbox/BUILD.md`, `run/BUILD-RUN-RECORD.md`. Lane work that needs the Editor is handed to INT through the outbox with `needs:`. |

**The files**

@widths 1.6,3.4
| File | What it is |
|---|---|
| `docs/program/PROTOCOL.md` | How the chats work: the rules above, the status format, the outbox format, the hand-off note, the step budget, the resume line. Read first by every chat. |
| `docs/program/ADDENDUM.md` | Your rulings that bind every lane, each with its date and your words. The ADRs are the first entries; new rulings are appended, never edited. |
| `docs/program/status/<TRACK>.md` | The status file per chat, fixed first lines. `scripts/program/board.sh` prints them together. |
| `docs/program/outbox/<TRACK>.md` | Requests and answers between chats. |
| `docs/program/run/<TRACK>-RUN-RECORD.md` | What happened, when (clock time), SHAs, where to resume. |
| `docs/program/UNITS.md` (generated) | The unit list, built by `scripts/program/units.py` from the build guide and `docs/program/units-overrides.yaml`. |
| `docs/program/BASELINE.md` | Which tests and checks fail on the base, by name, before each group. |
| `docs/program/boundaries/G<n>.md` | The boundary record per group: what merged, the gates, the meter paragraph, the open questions. |
| `.claude/agents/{scout,builder,builder-flagged,checker,reviewer}.md` | The agent types with their caps (below). |
| `scripts/gates/*.sh` | `tests.sh` (Unity Edit and Play Mode tests in batch mode), `build-android.sh`, `content.sh` (validate content), `docs.sh` (the document checks); each prints counts and failing names and writes `.gates/<name>.log`. |
| `scripts/program/commit.sh` | Commits only the paths given, refuses when the insertion and deletion counts differ from what the committer declared. |
| `scripts/program/meter.py` and `roles.json` | Reads the Claude Code transcripts on the machine where the chats ran, one usage record per message id, priced at list, per chat and per agent. |
| `scripts/program/context.py` | Prints each chat's current context from the last request's usage, so a chat knows when to restart. |

**The agent types and their caps**

@widths 1.1,0.8,0.7,0.7,2.2
| Agent | Model | Effort | Max turns | Tools and job |
|---|---|---|---|---|
| scout | sonnet | low | 60 | No edits. Reads the files the units name; writes the brief (≤ 15 KB, one file per unit). |
| builder | opus | high | 80 | Builds a batch of two or three units from the brief and the previous hand-off note; commits as it goes; writes the hand-off note. |
| builder-flagged | opus | xhigh | 80 | The same, for sensitive lanes and for rebuilds after a failed check. |
| checker | opus | medium | 80 | Read-only on the code. Gets the lane's diff and the brief, runs the gates through the shared scripts, returns findings by name. Never fixes. |
| reviewer | opus | max | 80 | Read-only. Two per sensitive lane, different lenses (here: safety and privacy; correctness and accessibility). |

**Gates, baseline and the commit rule**

- Gates are judged by name against `docs/program/BASELINE.md`; a lane passes when it adds no failure by name. Raw logs stay in `.gates/` and are cited by path.
- Sensitive lanes: anything in SOS, urgent help, the lapse flow, medical copy, the licence, invites, the sync service, or data encryption.
- Commits by path with exact counts through `scripts/program/commit.sh`; push at a group boundary; a push mid-group needs your word; deletions only where the protocol allows.
- One machine for Unity: a lane budget of one Unity lane at a time; locks for the heavy runs taken in arrival order; free disk checked before a worktree is created. Cloud lanes run in parallel with it.

**The meter and the restart rule**

- Targets, scaled from Kriya: build chats a re-read ratio of 1:500 then 1:300; the planner-scribe 1:300; re-writes under 10 per cent of a group's cost; the median agent under 40 steps and none over 100.
- Every chat writes its run record and status file and restarts at each boundary and whenever its context passes 300,000 tokens, with the resume line: `resume: read your status file and your RUN-RECORD.md, then continue from the last finished step`.

## 3.5 The baseline, recorded today

> In short: There is no app code yet, so the only gates that exist are the document checks, and they pass. The Unity gates come into being in lane A and are baselined there.

- Repository at commit `4085284` on `claude/adoring-fermat-klhyf9`: documents and scripts only; no `package.json`, no Unity project.
- `python3 scripts/check_execution_plan_doc.py`: all checks pass (70 section briefs, 62 step briefs, 56 prompts verbatim, contents field present). `--briefs-only` on the decisions document: passes.
- No `.claude/agents/`; `.claude/settings.json` holds only the session-start hook.
- The cloud container has Node 22 and Python 3; no Unity, no .NET SDK. Unity gates run on your machine.

## 3.6 What I need from you before anything is built

> In short: One setting to add yourself, one approval, and the three answers in Part 4 that the first lane needs.

- **The setting.** Add this line at the top level of `.claude/settings.json` on the machine where the chats and agents run (Claude Code 2.1.242 or later): `"subagentPromptCacheTtl": "1h"`. I will not add it myself. After the first lane, I will check the transcripts for `cache_creation.ephemeral_1h_input_tokens` and no `ephemeral_5m_input_tokens` on sub-agent requests.
- **Approval of option B** and of the files in 3.4, so the PLAN chat can create them. Nothing from Part 3 exists in the repository yet.
- **Your Windows machine as the integrator.** You open a Claude Code chat there with the Unity Editor running; the lane prompts in 2.8 are what you paste into it.

## 3.7 What is not carried over

> In short: Kriya's paths, names, counts and prices are examples; its mechanisms are the rule.

- Four execution chats and two build tracks were sized for a program of about 100 units in ten days. Group 0 has 22 units on one Unity machine; three chats suffice. The number of chats and lanes scales with the work; the rules do not scale down.
- No `autoCompactWindow`. No checker that fixes what it checks. No check or review traded for tokens. Model names in the agent files are Claude Code's aliases (`opus`, `sonnet`), which map to the current Claude 5 models on your account.

# Part 4: Questions, with the default I will use

> In short: Eight questions. If one goes unanswered, the default applies and is recorded as such in the boundary record.

@size 17
@widths 0.35,2.5,1.75,0.9
| # | Question | Default if unanswered | Needed by |
|---|---|---|---|
| Q1 | Approve option B (three chats now, five later) and the files in 3.4? | Yes; the PLAN chat creates the files, nothing else. | Before lane A |
| Q2 | Approve the Early Access scope in 2.2 and the lanes in 2.3, built on your Windows machine with Unity 6.6? | Yes, as written. | Before lane A |
| Q3 | Will you add `"subagentPromptCacheTtl": "1h"` to `.claude/settings.json` on your machine? | I assume yes and verify in the transcripts after lane A; without it, agents wait in chunks under four and a half minutes. | Before lane A |
| Q4 | Which Unity MCP: the official one (may need a Unity AI subscription) or a free community server? | The official one if it works without a paid plan, otherwise a free community server; recorded in the spike report. | Lane A |
| Q5 | Visual direction for the placeholder art (1.5): paper harbor with motif accents? | Direction 1 with direction 2's accents. | Lane A |
| Q6 | The device policy in 1.2, including the recovery code and the narrow support ticket? | Adopted (record 0020). | Step 5.4 |
| Q7 | Verify the crisis numbers before the friends build, not only before the public release? | Yes, before the friends build. | Build 0.2 |
| Q8 | The app's name for build 0.1? | "1-addic" stays the working title on the build; the store name is chosen later (record 0013). | Lane A |

# Part 5: Your reply

> In short: Copy the line, change what you want, and send it.

Reply to copy (the defaults are filled in):

```text Reply to copy
Approve: program B with the files in 3.4; Early Access 0.1 as planned.
Q3: I have added subagentPromptCacheTtl 1h. Q4: official MCP if free, else
community. Q5: paper harbor with motif accents. Q6: adopt record 0020.
Q7: verify crisis numbers before the friends build. Q8: working title stays.
Go: create the program files and start lane A.
```

After your reply, the PLAN chat creates the program files, generates the unit list, and hands lane A to the integrator chat on your machine. Until then nothing is built and no setting is changed.
