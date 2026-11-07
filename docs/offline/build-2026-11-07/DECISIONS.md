---
title: 1-addic · Offline edition · Decisions
subtitle: The thirteen decisions of the 7 November build, with options, the defaults in force and a recommendation for each
accent: hub
cover: true
toc: true
confidential: false
Prepared by: Claude, the HUB chat of the build program
Date: 7 November 2026, 12:45 IST
Status: Defaults in force since 08:25 IST; every decision still takes a one-line answer
---

> [!SUMMARY]
> Thirteen decisions were put to you for the offline edition: nine about the product (O1 to O9) and four about how the build program runs (Q10 to Q13). No answer arrived by 08:25, so the defaults listed here are in force (filed as R-O-1). They have served well: `offline-v1.0` was tagged at 11:40 with eleven units in it. **Every decision can still be changed with one line.** For a unit not yet built the change is free; for a unit already built or merged it becomes a named fix on the lane's branch. The three that matter most now: **O3**, because the India crisis numbers need your own verification before anyone else uses the file; **Q11**, because it decides whether the screens get built this afternoon; and **O1**, the name, which is still the project's open decision D13.

## How to answer

One line, in any chat of the program or to me, in this form:

```text
O1-O9 default, Q10-Q13 default
O3: international only
Q11: start SCREENS when the pharma program is done
```

The HUB files your words in `outbox-OWNER.md` with the time, and they are in force from that stamp. A decision reaches a unit^[one numbered piece of work in the build plan, such as U-10 SOS screens; a lane builds its units in order] in one of three ways:

| State of the unit at 12:45 IST | What your answer does |
|---|---|
| Not started | Changes the brief before anyone builds it. Free. |
| Built on a lane branch, in review | A named fix in the lane's fix round, before its merge. Cheap. |
| Merged into the trunk or the tag | A named fix on the lane's branch, merged under the same gates into `offline-v1.1`. Small for copy and flags, larger for behaviour. |

## Overview

Legend: **Done** = settled and built · **In progress** = built on a branch and in review, a change is a named fix before the merge · **Pending** = not built yet, so any answer is free.

| # | Decision | Default in force | Recommendation | Where it stands | Status |
|---|---|---|---|---|---|
| O1 | File and app name | `1-addic.html`, title "1-addic", discreet title "Notebook" | Keep for this edition; rename when D13 closes | U-01 merged, in the tag | Done |
| O2 | PIN by default? | Offered and recommended in onboarding, never forced | Keep | U-04 and U-11 built on branches, in review | In progress |
| O3 | Which region files | India numbers, each marked "please verify", plus an international list | Keep, and verify the India list yourself before anyone else opens the file | U-10 built on a branch, in review | In progress |
| O4 | Voice | Device text-to-speech, text always on screen, no recorded audio | Keep | U-10 built; U-25 not started | In progress |
| O5 | Gujarati | Not in this edition yet; a locale field on every record and item | Keep; plan SOS and the lock screen as the first Gujarati step | Fields in place; nothing to build now | Pending |
| O6 | Sample data | A "Load sample data" button on the welcome screen and in Settings, marked, erasable | Keep | The action exists; U-33 and U-19 not started | Pending |
| O7 | Screens not yet built | Honest states: working, stub or locked; never a dead button | Keep | Binds every screen lane; none has started | Pending |
| O8 | The Word guide in the tag | Yes if the skeleton merges; Part 3 later | Keep; Part 3 after the screens exist | Skeleton and .docx merged at 10:26 | Done |
| O9 | Pushing | Trunk, lane branches and the tag to origin; never `main` | Keep | Everything pushed; `main` untouched | Done |
| Q10 | May the HUB run the workflow tool itself? | No; it merges by script, the build chats run the workflow | Keep | Eight merges done this way | Done |
| Q11 | When does the SCREENS chat start? | When free memory leaves room for a second chat and one more lane | Decide now: free memory, or wait for the pharma tag | Never started; the open question of the afternoon | Pending |
| Q12 | Models | Fresh HUB on Fable 5.1 at high effort; build chats on Opus 5.5 | Keep | Four HUB and three CORE sessions ran on it | Done |
| Q13 | May the 4 GB memory floor drop? | No; fewer lanes instead | Keep; free memory rather than lower the floor | A lane costs about 3 GB measured | Pending |

## The product decisions, O1 to O9

### O1. File and app name

**The question.** What is the file called, and what title does the app show?

**Default in force.** The file is `offline/1-addic.html`, the title is "1-addic", and **discreet mode**^[a setting that renames the app "Notebook" in the tab and header, relabels the SOS button "Help" and hides the counters] shows "Notebook". The project's naming decision D13 stays open (ADR 0013).

| Option | What it means | Upside | Downside |
|---|---|---|---|
| Keep "1-addic" (default) | The working title as the product name for this edition | Nothing to decide; matches the repository and the guide | Not discreet: the file name shows the purpose in a file manager or a recent-files list |
| A shortlist name now | Kinaro, Laher or Ek Din from ADR 0013 as file name and title | Discreet from the first copy that leaves your hands | A rename before the trademark check can turn into a second rename |
| Neutral file name, same title | For example `notebook.html` with "1-addic" inside | Hides the purpose where it is most visible | The title still names the purpose until discreet mode is on |

**Recommendation.** Keep the default for this edition. The name lives in a handful of strings and the file name, so the rename is a small named fix whenever D13 closes. Anyone can rename the single file on their own phone without breaking it. The one thing to decide early is whether the shortlist's trademark check happens before friends get the file.

**Where it stands.** U-01 is merged and in the tag. A change is a named fix on `build/core`.

### O2. PIN by default?

**The question.** Does everyone set a PIN during onboarding, or is it offered?

**Default in force.** The PIN is offered in onboarding and recommended, never forced. With a PIN every record is encrypted on the device; a forgotten PIN means erasing and importing a backup, because there is no account to recover from. The **safety floor**^[ADR 0019: urgent help, SOS, the person's own records, export and delete keep working whatever else is locked or lapsed] holds either way: the lock screen offers urgent help and the SOBER breathing exercise without the PIN.

| Option | What it means | Upside | Downside |
|---|---|---|---|
| Offered, recommended (default) | A step in onboarding that can be skipped | Protection for those who want it; no lock-outs for those who do not | Records are readable on a phone without a PIN |
| Required | No way past onboarding without a PIN | Every file is encrypted from the first record | Lock-outs with no recovery; friction in the first three minutes, which is when people leave |
| Not offered in this edition | Discreet mode only | The simplest build | Nothing protects the records if the phone is opened by someone at home |

**Recommendation.** Keep the default. The plan's threat model is "someone at home sees the phone", and discreet mode plus an optional PIN answers it without creating a lock-out that nobody can undo.

**Where it stands.** The encrypted Store (U-04) and the lock screen with onboarding (U-11) are built on their branches and in their review rounds. Forcing the PIN would be a named fix in U-11 before its merge.

### O3. Which region files

**The question.** Which crisis numbers and resources does the SOS screen show?

**Default in force.** The India list (region `in`) with every number and link marked "please verify" until you check it, plus an international directory. Nobody else uses the file until you have verified the India list (your input I6, ADR 0010).

| Option | What it means | Upside | Downside |
|---|---|---|---|
| India plus international, flagged (default) | Both lists ship; the UI says "please verify" beside every entry | A person in Gujarat sees local lines; the flag is honest | A wrong number stays on screen until you check it |
| International only | No India entries until verified | No unverified local number can be shown | A person in Gujarat gets no local line in a crisis |
| Verified numbers only | You verify first, the lane removes the flags | The strongest version | Blocks U-10's merge on your time today |

**Recommendation.** Keep the default and do the verification yourself before the first copy leaves your hands. A wrong crisis number is the worst failure this product can have, and only you can make that call. After its review, the core lane also added a built-in 112 link for the case where the list is empty; it is on the lane's branch, in review.

**Where it stands.** U-10 is built on `build/actions-sos` and in review. Switching to international only would be a flag change, a named fix before the merge.

### O4. Voice

**The question.** Does the app read exercises and the SOBER steps aloud, and how?

**Default in force.** The device's own text-to-speech, with the text always on screen; no recorded audio in the file.

| Option | What it means | Upside | Downside |
|---|---|---|---|
| Device text-to-speech (default) | The browser's voices, whatever the phone has | No file size; works offline; any language the phone has | Voices vary, and some phones have none |
| Text only | No read-aloud | The simplest, nothing to test | Harder to follow a breathing exercise with eyes open on a phone |
| Recorded audio | Audio files inlined in the single file | A consistent voice | Megabytes per practice, a voice to record and license, no Gujarati voice available |

**Recommendation.** Keep the default. The app must behave well with no voice available, a rule already written into the plan, so the choice costs nothing on a phone without a voice.

**Where it stands.** SOS read-aloud is in U-10, built and in review. The practices player (U-25) is not started.

### O5. Gujarati

**The question.** Does this edition carry Gujarati, and if not, what prepares for it?

**Default in force.** Not in this edition. The profile and every content item carry `locale: 'en'`, so a Gujarati set can be added without changing the data.

| Option | What it means | Upside | Downside |
|---|---|---|---|
| English now, locale fields in place (default) | Add Gujarati in a later tag | Nothing blocks the tag; the structure is ready | A Gujarati-first person waits |
| SOS and the lock screen in Gujarati first | A small set of strings in both languages | The safety floor in the person's own language, cheaply | Needs a Gujarati text-to-speech check on real phones |
| Full Gujarati now | Every string and lesson translated | The plan's end state | Weeks of writing, and no translator in the program |

**Recommendation.** Keep the default for `offline-v1.0` and `offline-v1.1`, and name the SOS-and-lock-screen subset as the first Gujarati step after that. ADR 0010 already says Gujarati comes before the friends release, written as friendly everyday Gujarati.

**Where it stands.** The locale fields are in the merged data model. Nothing to build for this decision now.

### O6. Sample data

**The question.** Can a person fill the app with sample data to see it working?

**Default in force.** A "Load sample data" button on the welcome screen and in Settings under Your data; every sample row is marked as sample and can be erased in one tap.

| Option | What it means | Upside | Downside |
|---|---|---|---|
| Button, marked, erasable (default) | The person chooses to load it | You can walk every screen in a minute; nothing mixes with real data unless asked | One more button on the welcome screen |
| No sample data | A clean start only | Nothing to explain | Walking the app means logging for a week first |
| Loaded automatically | Sample data on first open | An instant demo | Sample and real records mix; erasing is a surprise |

**Recommendation.** Keep the default. Your acceptance walk starts with it.

**Where it stands.** The action behind it is in the merged Actions layer. The two buttons live in units not yet started: the welcome screen (U-33) and Settings (U-19).

### O7. Screens that are not built yet

**The question.** What does a person see where a screen of the plan does not exist yet?

**Default in force.** Honest states, as the Early Access plan says: a screen is working, a stub with one real action, or locked with one line naming what it will be. Never a dead button.

| Option | What it means | Upside | Downside |
|---|---|---|---|
| Honest states (default) | Each tab says what it is today | The person sees the roadmap; no false promise | Some tabs say "not yet" in the first copies |
| Hide what is missing | Only built screens appear | A cleaner first impression | The tutorials point at targets that do not exist; the plan's shape is invisible |
| "Coming soon" everywhere | Placeholders without a line of meaning | The fastest | Dead buttons, which the house rules forbid |

**Recommendation.** Keep the default. Fifteen tutorial targets are missing today because the screen lanes never started, and the honest state is what makes that visible rather than confusing.

**Where it stands.** The rule binds every screen lane; none of them has started.

### O8. The Word guide in the tag

**The question.** Does the tag ship the guide as a Word document before Part 3, the tutorial lessons, is written?

**Default in force.** Yes, if the guide skeleton merges in time; the full Part 3 comes with `offline-v1.1`.

| Option | What it means | Upside | Downside |
|---|---|---|---|
| Skeleton now, Part 3 later (default) | A real `.docx` with Parts 1, 2 and 4 and the lesson headings | A document to read today; the pipeline proven | Part 3 is headings only until the screens exist |
| Word document only when complete | Markdown now, `.docx` with v1.1 | One complete document | Nothing to hand anyone today |
| Markdown only | No Word output | Less tooling | Harder for a reviewer who does not read Markdown |

**Recommendation.** Keep the default. It is done: the skeleton and a reproducible `.docx` merged at 10:26. Part 3 with screenshots follows the screens (U-35, U-36b).

**Where it stands.** Done, in the tag.

### O9. Pushing

**The question.** What leaves this machine, and where?

**Default in force.** The trunk `build/offline-v1`, the lane branches and the tag go to origin as they are made; `main` is never touched.

| Option | What it means | Upside | Downside |
|---|---|---|---|
| Push trunk, lanes and tag; never main (default) | Backups on origin, `main` untouched | Nothing lost if the disk dies; the plan's branch stays clean | None |
| Local only | Nothing pushed | Nothing leaves the machine | One disk holds the whole day |
| Merge to main | The edition becomes the main line | Visible to every cloud session | `main` carries a plan whose platform decision D3 is still open |

**Recommendation.** Keep. When you have walked the edition and accept it, a pull request from `build/offline-v1` to `main` is your call, opened from the claude.ai UI as the repository's instructions say.

**Where it stands.** Done. The trunk, five lane branches and the tag are on origin; `main` is untouched.

## The program decisions, Q10 to Q13

### Q10. May the HUB run the workflow tool itself?

**Default in force.** No. The workflow tool needs your own opt-in line in a chat; the HUB merges by script, uses plain sub-agents for its tooling and proves the lane workflow with a local simulator. The build chats, which start from your prompt, run the real workflow.

**Recommendation.** Keep. Eight merges ran this way today without a conflict the script could not resolve.

### Q11. When does the SCREENS chat start?

**Default in force.** When the memory sample leaves room for a second build chat and one more lane after the CORE chat's grants. The plan assumed a lane costs 0.7 GB; measured today, a running lane costs about 3 GB, so the SCREENS chat needs roughly 8.5 GB free with no lane running and 11.5 GB with one. Free memory has moved between about 2 and 10 GB all day while the pharma program holds the machine. SCREENS never started.

| Option | What it means | Upside | Downside |
|---|---|---|---|
| Keep waiting for the rule (default) | Starts by itself when a sample allows | No risk to the pharma program or the running lanes | It may not happen today |
| Free memory now | Close the planner chat and idle tabs, or pause the pharma program if it has a pause | The screens start this afternoon, the content lane first | Your attention now; the pharma program slows if paused |
| Start SCREENS instead of the next CORE lane | One screen lane in place of the engine's resume | The visible screens arrive sooner | The engine's validate gate and the `npm test` wiring wait longer |

**Recommendation.** Decide this one now, because it decides what exists by tonight. If you free memory, the content lane should start first: it writes the clinical-review copy the reviewers asked for and the remaining lessons. If nothing can be freed, let the rule stand and expect the screens after the pharma tag, around 15:30.

### Q12. Models

**Default in force.** A fresh HUB runs on Claude Fable 5.1 at high effort; the build chats run on Claude Opus 5.5. A chat hands over to a fresh one at about 250k context.

**Recommendation.** Keep. Four HUB sessions and three CORE sessions ran on this today; the hand-overs worked.

### Q13. May the 4 GB memory floor drop for Node-only lanes?

**Default in force.** No. Under 4 GB free the newest lane pauses at its next commit; fewer lanes run instead.

**Recommendation.** Keep. The plan's per-lane estimate was wrong by a factor of four, and the floor is the only guard that kept the pharma program and the chats out of swap when two builders and a checker ran at once. The lever is freeing memory, not lowering the floor.

## Next steps

> [!NEXT]
> 1. **Verify the India crisis numbers** (O3, your input I6) before the first copy leaves your hands: each entry in the resources list carries `verify: true` until you clear it. 2. **Walk the tagged file** on your phone and computer and write what you find in one message; the HUB routes it to the lanes. 3. **Answer Q11** today if you can free memory; otherwise the screens follow the pharma tag. 4. **The name** (O1 and D13) when you are ready; it is a small named fix at any point. 5. Anything else: one line, `O1-O9 default, Q10-Q13 default`, or only the items you change.

> [!TIP]
> The sources: `docs/offline/BUILD-PLAN.md` section 8 (the questions and defaults), `docs/offline/build-2026-11-07/PLAN.md` section 9 (with Q10 to Q13), ADR 0022 (the defaults recorded), `outbox-OWNER.md` (R-O-1, 08:25). The build's live state is on `docs/offline/build-2026-11-07/coordination/SPRINT-BOARD.md`.
