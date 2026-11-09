---
title: 1-addic · Resume Prompt
subtitle: How to resume and complete the offline build (V3, tag offline-v3.0) from where we parked: the state, what remains, the commands, the prompts
accent: hub
cover: true
toc: true
confidential: false
auto_glossary: false
Prepared by: Claude, the owner's window of the build program (rendered by owner-docs/build_resume_doc.py)
Date: 9 November 2026, 20:46 IST
Edition: offline-v3.0 in progress; trunk build/offline-v1 at c5dc374; tags offline-v1.0, offline-v1.1, offline-v3.0, offline-v3.1, offline-v3.2
Status: Rendered from the live state at 2026-11-09 20:46 IST; refresh with one command at the 98% trigger
---

> [!SUMMARY]
> **What this is.** The one document the owner needs to resume and finish the 1-addic offline build (V3) after it parked at 98% of the weekly usage limit (the owner's R-O-9). It holds the state at parking, what remains to the tag `offline-v3.0`, the exact commands, and paste-ready prompts. It was rendered from the live files and git at **2026-11-09 20:46 IST**. One line of state: trunk `build/offline-v1` at **c5dc374**, tags **offline-v1.0, offline-v1.1, offline-v3.0, offline-v3.1, offline-v3.2**, **72 merges** recorded on status-HUB.md, HUB RUNNING, CORE WAITING, SCREENS WAITING-OWNER.

## Read this first

This document is for the owner. The build runs as three Claude Code chats (HUB, CORE, SCREENS) started by a small program called the launcher, plus the owner's own window. When the weekly usage limit reads 98%, the program parks: the launcher is stopped, each chat writes where it stopped, everything is pushed. This document is refreshed at that moment, so it says where we stopped. To resume, three steps:

1. Open a Claude Code window in `C:\Users\ruchi\1-addic` (the main folder; it holds the trunk `build/offline-v1`).
2. Paste the whole prompt of section 6 into it. That window becomes the owner's HUB window. It reads the files, checks the parked state, and reports to you.
3. The window starts the launcher. The launcher starts the three chats. The chats resume from their own records. You get a report every 30 minutes, and at once at a merge, a tag, a red by name or a question.

If the launcher cannot start a chat, section 7 has a short prompt for each chat so you can start it by hand. Section 8 is the checklist the window follows when the usage limit nears 98% again.

**Refresh this document:** `python docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py` (in the main folder; it rewrites `1-addic-Resume-Prompt.md` and `1-addic-Resume-Prompt.docx` in `owner-docs/` from the live state). Then commit the three files by path with `tools/hub_commit.py` and push (section 8).

Everything above was read from the live files and git at render time.

<!-- pagebreak -->

# 1 Where we stopped

Rendered **2026-11-09 20:46 IST**. The trunk is `build/offline-v1` at `c5dc374` (`c5dc374 merge(offline): tests-docs READY 69f2b72 (FIX-COUNTS-4: the counts true on the trunk aac18546: Node 763 checks in 16 files, 32 browser flows with their names; docs only)`). Pushed: yes, origin/build/offline-v1 is at the same tip (as last fetched). Tags: offline-v1.0, offline-v1.1, offline-v3.0, offline-v3.1, offline-v3.2. Merges recorded on status-HUB.md: 72. Uncommitted: 2 file(s) uncommitted in the main folder (this document's own three files not counted), of them 1 under docs/offline/build-2026-11-07/: M docs/offline/build-2026-11-07/coordination/status-HUB.md.

The HUB's last hand-over note in `tracks/HUB/RUN-RECORD.md`: *## Resume here (written 2026-11-09 19:17 IST by HUB 16:12 ca715d55 at about 255k context, a safe point: no merge in flight, nothing of the HUB's running, _int detached at the trunk tip 3a0b2100, the trunk pushed)*.

## 1.1 The HUB (status-HUB.md)

| Line | Value (cut to about 300 characters) |
|---|---|
| STATE | RUNNING   # 2026-11-09 19:21 IST: HUB 19:18 (d9d055f4, session 32) started by the launcher 19:18 on HUB 16:12's RESTART line. Read PLAN.md, status-HUB.md, the run record's Resume here (19:17), status-CORE.md and status-SCREENS.md, the outbox tails (R-C-85, R-S-33, R-O-9, R-H-53), the launcher sta... |
| BASE | aac18546 (the trunk tip after the actions-sos FIX-AS-V32 merge = the offline-v3.2 FREEZE, 2026-11-09 20:37 IST; fixes cut from the trunk tip at their start, merge base that tip; the tag offline-v3.1 is 903016cc; lanes: actions-sos fb3966b, tests-docs 1686bb8 (FIX-COUNTS-4 next, docs only), core 4... |
| MERGING | tests-docs 69f2b72 (FIX-COUNTS-4) since 2026-11-09 20:44 IST; docs only: the docs gate by hand on the merged tree |
| MERGE-QUEUE | tests-docs READY 69f2b72 (FIX-COUNTS-4; merge base aac18546; R-C-89; docs only) queued 2026-11-09 20:44 IST; then TAG offline-v3.2 on the merge |
| SLOTS-ALLOWED | 7 (2026-11-08 05:05 IST: the row 05:02 8.0 GB (five slots by the formula at 8.0; R-O-7): tests-docs 5, today-track 6, engine 2 (idle after V-40c; V-19 + V-30 tier 2 only when no tier 1 lane waits), content 4, core 1, actions-sos 3, game-tutorials 8 granted now. Every tier 1 lane has a slot; nothi... |
| OWNER | R-O-9 (2026-11-08 08:53, filed by the owner's window, read by the HUB 09:00): at 98% of the owner's weekly usage the program PARKS (the owner's stop word given in advance; only the owner reads /usage, so the trigger is the owner's line): the launcher loop stops first (--stop), every live chat par... |
| RULING | R-H-49 (2026-11-09 16:01 IST): R-C-79's one named red on tests-docs READY dbc81e6 ('contrast: .coach-sos (dark)' 2.73:1, styles.css:566) is a real defect in game-tutorials' territory, not a test fault: SCREENS fixes it first as FIX-COACH-SOS by name within the hour (to 17:00), the HUB merges the... |
| UPDATED | 2026-11-09 20:44 IST |

## 1.2 CORE (status-CORE.md)

| Line | Value |
|---|---|
| STATE | WAITING   # 2026-11-09 20:43 IST: CORE 18 (987cb3b4-a89e-435e-a65d-bbb9929bdb52). Nothing of CORE runs. tests-docs READY 69f2b72 (FIX-COUNTS-4) is with the HUB, which tags offline-v3.2 on its merge |
| UPDATED | 2026-11-09 20:43 IST |

Lanes of CORE (the tip is `git rev-parse --short build/<lane>`; "pushed" compares it with origin as last fetched):

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
| core | MERGED 49c788f | 49c788f | yes | 2026-11-09 19:55 IST: FIX-IMPORT-MARK merged 82c5eddf (the HUB: build 1212699 B, store.test GREEN, validate, guards GREEN). RS1 LOW open, named FIX-STALE-SAVE-SAY, the HUB's call |
| engine | MERGED 97ac73a | 97ac73a | yes | 2026-11-08 10:56 IST: FIX-RS27 merged 0db0a9f7 (trunk c8b553ce; full Node suite 623/623, the trunk's one red closed). The engine's V3 units and fixes complete |
| actions-sos | MERGED fb3966b | fb3966b | yes | 2026-11-09 20:37 IST: FIX-AS-V32 merged aac18546, pushed (the HUB: build, actions.test 226/226, validate, guards GREEN, territory 0; full Node 763/763; the SOS, lock, PIN and SOBER flows 9/9, the SOBER flow's first run against SF1's hold). R-H-54: C1 and FIX-SOS-FOCUS LOW, named for v3.3; the dro... |
| learn | MERGED a494fa7 | a494fa7 | yes | 2026-11-09 15:36 IST: V-20 merged 95aac382 (HUB 15:45: build 1209510 B, learn.test 30/30, validate, guards 5/5, the lesson flow 1/1). The lane's V3 units complete. The suite has no checkpoint flow, so the two toasts stay unseen in a browser: named for offline-v3.2 |
| tests-docs | READY 69f2b72 | 69f2b72 | yes | 2026-11-09 20:43 IST: FIX-COUNTS-4; merge base aac18546. Docs only, the HUB's numbers: Node 763 in 16 files, browser 32 flows; 32 names in offline/README.md; no old count in the four text files; .docx rebuilt, 0 images missing; territory 0. R-C-89 |

## 1.3 SCREENS (status-SCREENS.md)

| Line | Value |
|---|---|
| STATE | WAITING-OWNER   # 2026-11-09 19:18 IST: SCREENS 16:08 (6f1291e1): both R-H-53 fixes are merged (R-S-32 526663bb, FIX-MARKERS 3a0b2100). Nothing of SCREENS is running and no merge is open. Content V-10b waits for the owner's I6; a background watch on outbox-OWNER.md and the HUB's messages reopen t... |
| UPDATED | 2026-11-09 19:18 IST |

Lanes of SCREENS:

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
| content | MERGED cd17758 | cd17758 | yes | FIX-MARKERS merged 3a0b2100 (HUB; build, 41/41, validate, guards GREEN). V-10b after I6 is the lane's one remaining unit; LOW C1 (content.test.mjs:381) goes with it or later |
| today-track | MERGED 670df19 | 670df19 | yes | V-43 with the round-1 fix merged at 91c81de2 (07:36, HUB 11; trunk fb6061b5; every gate green by name on the merged tree). The lane's V3 units are complete; fixes by name only |
| workbook-settings | MERGED b76d4f3 | b76d4f3 | yes | R-S-32 merged 526663bb (HUB; build, 27/27, validate, guards GREEN; the tour and Settings flows 4/4 on the merged tree). Fixes by name only |
| actions | MERGED 0977edd | 0977edd | yes | READY 0977edd merged 18:50 (49f1c1d4; U-22..U-25 in the trunk); complete; fixes by name only |
| game-tutorials | MERGED a3f0bf7 | a3f0bf7 | yes | FIX-COACH-SOS merged 18852152 (HUB 14:40; trunk eec5d862 with tests-docs on top; the contrast check green on the merged tree, 723/723). The lane's V3 units are complete |

## 1.4 The launcher

The launcher's own status (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status`, first 12 lines, read). At a proper parking the first line says the loop is stopped; a chat listed as live here may have ended with the usage limit.

```
launcher: active; loop running (pid 39876)
paused tracks: none
last check: 2026-11-09T20:46:14; free memory then 9.24 GB
  HUB: STATE RUNNING, UPDATED 2026-11-09 20:44, live 2, newest d9d055f4 181k -> nothing to do
  CORE: STATE WAITING, UPDATED 2026-11-09 20:43, live 1, newest 987cb3b4 273k -> nothing to do
  SCREENS: STATE WAITING-OWNER, UPDATED 2026-11-09 19:18, live 1, newest 6f1291e1 258k; at a stop -> nothing to do
  launched HUB 2026-11-09T14:40 38b3cc2e (HUB 14:40) because NO CHAT live for HUB (last step 09 Nov 12:42); stepped
  launched HUB 2026-11-09T16:12 ca715d55 (HUB 16:12) because HAND-OVER written (status RESTART, 2026-11-09 16:12); stepped
  launched HUB 2026-11-09T19:18 d9d055f4 (HUB 19:18) because HAND-OVER written (status RESTART, 2026-11-09 19:16); stepped
  launched CORE 2026-11-09T14:46 215e6cdd (CORE 14:46) because NO CHAT live for CORE (last step 09 Nov 13:42); stepped
  launched CORE 2026-11-09T16:24 7ccd92d4 (CORE 16:24) because HAND-OVER written (status RESTART, 2026-11-09 16:22); stepped
  launched CORE 2026-11-09T19:51 987cb3b4 (CORE 19:51) because HAND-OVER written (status RESTART, 2026-11-09 19:50); stepped
```

## 1.5 What was in flight

- A merge in flight (MERGING on status-HUB.md): tests-docs 69f2b72 (FIX-COUNTS-4) since 2026-11-09 20:44 IST; docs only: the docs gate by hand on the merged tree
- CORE lane `tests-docs` READY 69f2b72 waits for the HUB's merge: 2026-11-09 20:43 IST: FIX-COUNTS-4; merge base aac18546. Docs only, the HUB's numbers: Node 763 in 16 files, browser 32 flows; 32 names in offline/README.md; no old count in the four text files; .docx rebuilt, 0 images missing; territory 0. R-C-89

<!-- pagebreak -->

# 2 What remains to the tag offline-v3.0

The chain, in order, from PLAN-V3.md section 7 and the HUB's status file. **Done** means a `MERGED:` line of status-HUB.md names the unit as merged. **Left** means it is not merged yet. The column "The lane's line now" is the lane's own LANE line at render time: it can say MERGED for an earlier unit of that lane while a later unit is still left. Each unit is built by its lane, checked, then merged by the HUB alone, one at a time, with every gate green by name on the merged tree.

| Unit | Lane (track) | What it is | The lane's line now | Status |
|---|---|---|---|---|
| V-42 | content (SCREENS) | the quest-line's words: content-quests.js with Content.questLine (8 to 12 steps), Content.objectives (a pool of about 20), the run's words, the Content.xp rows, the JIT tutorials and help entries | MERGED cd17758 | Done |
| V-41 | actions-sos (CORE, flagged) | the verbs: Actions.objective.done and swap, Actions.questLine.claim; a refusal returns ok:false and never throws; sample mode writes nothing of the person's own | MERGED fb3966b | Done |
| V-46 | core (CORE, flagged) | the app's chrome builds its feature set from Engine.unlocked, so a reward the quest-line opened shows | MERGED 49c788f | Done |
| V-43 | today-track (SCREENS) | Today's objectives card, the run line in the header, the quest-line's current step card; Your Harbor's growth elements and the spine 'Your way' | MERGED 670df19 | Done |
| V-28 | game-tutorials (SCREENS) | the tour step on status-open, the JIT wiring and the 'New' dot for the status feature (unlock surfaces, part 1) | MERGED a3f0bf7 | Done |
| V-44 | game-tutorials (SCREENS) | the reward sheet on a claim ('You unlocked ...'); the tools and game surfaces honour Engine.unlocked; the JIT tutorials and tour steps for the three features (unlock surfaces, part 2) | MERGED a3f0bf7 | Done |
| V-45 | tests-docs (CORE) | three browser flows (an objective done grows the harbor; a break keeps best and total; a quest-line step unlocks a feature), their hooks, the guide lessons for the three, screenshots | READY 69f2b72 | Done |
| V-01t | tests-docs (CORE) | the status layer's browser flows, their hooks, the #/status screenshots and the guide lesson Your Harbor | READY 69f2b72 | Done |
| FREEZE | the HUB | no new unit starts after the chain's last READY; fixes by name only | - | Done |
| Full gates | the HUB | the HUB runs every gate on the integration worktree at the trunk tip (the quiet window): python docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/_int --lane hub --full build test validate guards browser docs | - | Done |
| Reds by name | the HUB | every FAIL line is read by name against coordination/baselines.md; a red is fixed by its lane (by territory), then the gate runs again | - | Done |
| Tag offline-v3.0 | the HUB | git tag -a offline-v3.0 on the trunk in the main folder, then git push origin offline-v3.0 | - | Done |
| Release copy | the HUB | offline/releases/1-addic-v3.0.html kept as the file at the tag (as 1-addic-v1.1.html is for offline-v1.1), committed and pushed; the hand-off note in tracks/HUB/RUN-RECORD.md | - | Left |

**Pending, in order, at render time:** nothing: every unit of the chain is merged; FREEZE, the full gates and the tag follow.

**The HUB's own "Next:" text** (from the STATE line of status-HUB.md): (the STATE line carries no 'Next:' text; the MERGE-QUEUE line below and the BASE line give the order)

**Tier 2, not needed for the tag** (only when no tier 1 lane waits; the HUB's record of 2026-11-08 09:00 lists them; the status files are the truth at render time): core V-16, V-17a, V-26a; actions-sos V-25, V-18, V-17b; learn V-20; content V-23; game-tutorials V-21; workbook-settings V-24, V-22b; tests-docs V-22a, V-26b, V-27, V-29; the HUB's tooling V-12 to V-15 and the review pack V-09. What moves to the next tag if the memory rows do not hold, in this order: V-45's screenshots, V-44's tour steps, the tier 2 LOWs not merged by the freeze. Never cut: the house rules, the two reviewers on `actions-sos`, the gates by name.

<!-- pagebreak -->

# 3 How the program runs

**Branches and folders.**

| Thing | Where | What it is |
|---|---|---|
| The trunk | `build/offline-v1`, checked out in `C:\Users\ruchi\1-addic` | The one branch the HUB merges into and pushes. Nobody else moves it. The owner's window commits program documents on it by path. |
| Lane branches | `build/<lane>`, one per lane | core, engine, actions-sos, learn, tests-docs (CORE); content, today-track, workbook-settings, actions, game-tutorials (SCREENS). Cut from the BASE line of status-HUB.md, never from main. |
| Lane worktrees | `C:\Users\ruchi\1-addic-wt\<lane>` | Where a lane's branch is checked out and built. Only that lane's chat edits it. |
| `_int` | `C:\Users\ruchi\1-addic-wt\_int` | The integration worktree. The HUB merges a lane here, runs the gates on the merged tree, then fast-forwards the trunk. Detached at the trunk tip between merges. |
| `_base` | `C:\Users\ruchi\1-addic-wt\_base` | Read-only, at BASE-READY 655516dc. |
| `_logs` | `C:\Users\ruchi\1-addic-wt\_logs` | Gate logs (`gates\<lane>\`), merge logs (`merges\`), reports. Every verdict cites a log path. |
| `_locks` | `C:\Users\ruchi\1-addic-wt\_locks` | `1-addic.lock`: the test, browser and docs gates take it in arrival order, so two suites never run at once. |
| Program files | `docs/offline/build-2026-11-07/` | PLAN.md, PLAN-V3.md, KICKOFF-PROMPTS.md, `coordination/` (status files, outboxes, the board, baselines), `tracks/<TRACK>/RUN-RECORD.md`, `tools/`, `owner-docs/` (this document). |

**The launcher** (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py ...`): a loop that checks every two minutes and starts a fresh chat when a track needs one. It starts the HUB on `claude-fable-5-1` (effort high) and CORE and SCREENS on `claude-opus-5-5`, each with its kickoff block from `KICKOFF-PROMPTS.md` plus a resume line. It relaunches a chat whose status file says `STATE: RESTART` (a chat hands over at 300k context) or that has no live session for 30 minutes. It never launches under 4.0 GB free. Its state and log live in `%LOCALAPPDATA%\1-addic-hub\launcher\`. Commands:

| Command | What it does |
|---|---|
| `--start` | Starts the loop (detached; after a machine restart run this first). |
| `--launch-missing` | One check with the 30-minute rule off: every track without a live chat is launched now. Run it after `--start`. |
| `--status` | The loop, the pause, the last check, the chats per track. |
| `--stop` | Ends the loop. The launched chats live on. The first step of parking. |
| `--pause-track CORE` / `--resume-track CORE` | One track's pause and resume (also SCREENS, HUB). |
| `--pause "<reason>"` / `--resume` | The global pause. |

**The memory rule** (PLAN.md section 4): the machine is shared. Under 4.0 GB free, the newest run pauses at its next commit (a tier 2 run first when one runs); a new run needs a row of 7.0 GB free; at 4.0 GB or more, paused work resumes, tier 1 first. The loop writes a memory row every ten minutes to `coordination/lane-widening.md`. The pharma program's chats are the main brake: when they run, this build waits. Nothing is lost by a pause: every branch is pushed.

**The merge recipe** (PLAN.md section 8; the HUB alone, one lane at a time, always the tip the status file names, from the main folder):

```
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py prepare <lane> <tip> <base>
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py conflicts <lane>        (only if prepare lists any)
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py guards <lane> <base>
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py commit <lane> <msgfile>
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py finish <lane> <tip7> --hub --push
```

The message file's subject is `merge(offline): <lane> READY <tip7>` or `merge(offline): <lane> READY-SLICE <tip7>`, with the two trailers. A red by name: `abort <lane>`, the evidence to the lane, round 1 of 2. After a merge: the BASE line, a `MERGED:` line, a "from the HUB" note on the lane's status file, the run record, the board, commit, push.

**The gates** (`python docs/offline/build-2026-11-07/tools/gates.py --wt <worktree> --lane <lane> [--full] build test validate guards browser docs`): one `GATE <name> GREEN|RED|SKIP|VOID` line per gate and `FAIL <name>` lines; judged by failure name against `coordination/baselines.md`, never by count or exit code. A lane is green when every test it adds passes and nothing green on the base is red on the branch. The browser gate is the heavy one; the full suite runs once, in the quiet window, by the HUB.

**The commit discipline:** `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <session link> -m "docs(HUB, <date>): ..." <paths>` from the main folder. It stages and commits only the paths named and adds the two trailers (`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and `Claude-Session: <link>`). Never `git add -A`; never force-push, rebase, stash or check out over uncommitted work; only the HUB (or the owner's window when no launcher HUB is live) pushes, and only `build/offline-v1`, the lane branches and the tags.

<!-- pagebreak -->

# 4 The decisions in force

**The owner's words** (every R-O heading of `coordination/outbox-OWNER.md`, quoted whole; 9 so far; the next number is R-O-10):

1. R-O-1 · 2026-11-07 08:25 · no answer from the owner by 08:25: the defaults of PLAN.md section 9 are in force
2. R-O-2 · 2026-11-07 14:38 · "I agree with the defaults"
3. R-O-3 · 2026-11-07 22:01 · "start the launcher without waiting for my word 'start', run --start and --launch-missing" (filed 2026-11-07 22:09 IST)
4. R-O-4 · 2026-11-07 22:23 · "start the build if not started"
5. R-O-5 · 2026-11-08 02:09 · "Look at what can be improved and complete building those in a new 1-addic V3"
6. R-O-6 · 2026-11-08 03:03 · "Add a main quest-line with rewards that unlock new features as you progress through it, add daily tasks or objectives that grow something. Add a streak counter that doesn't demotivate breaking it, but more focus on keeping it up."
7. R-O-7 · 2026-11-08 04:44 · "V-Q1 to V-Q13 use default answers, continue to build ... Any ! Commands needed to maintain for the build are authorised. Complete the build as soon as possible."
8. R-O-8 · 2026-11-08 07:25 · "When we make the app, not just offline, it will have a feature that will only let people that have invite or refferal join the app (create account and start their journey)"
9. R-O-9 · 2026-11-08 08:53 · "When we hit 98% usage limit of weekly usage, we will prepare handover and details related to, create a resume prompt word doc we can use to resume and complete from where we left off"

**The V3 defaults** (PLAN-V3.md sections 5 and 7; the owner's R-O-7 took V-Q1 to V-Q13 at their defaults):

- The tag is `offline-v3.0` (V-Q1).
- The status layer is a page, "Your Harbor", at `#/status`, reached in one tap from Today (V-Q2, V-Q3, V-Q6).
- The 14-day strip shows dated dots without a count (V-Q4); "what just changed" is since the page was last drawn this session (V-Q5).
- The India crisis numbers: none cleared yet; every number keeps "please verify" (V-Q7). The clinical review pack is produced; no copy changes before the reviewer's answers (V-Q8).
- The run: one grace day a week keeps the run and shows as "kept" (V-Q9). A day shown up is any day with a log, a lesson, a practice, an objective or an SOS drill; never a claimed sober day (V-Q12). It shows in Today's header and in Your Harbor's "Where you stand"; never a push, a countdown or a shame line (V-Q13).
- Three daily objectives a day: two drawn by date and state, one the person may swap once a day; done by a tap or by the matching event (V-Q11).
- The quest-line opens features earlier than the modules would; nothing open in v1.1 locks; tools, mini-games and the Explorer are never a reward; never SOS, help, lessons, Settings, export or the person's data (V-Q10 as read by R-H-44; the owner may still say "V-Q10: lock <names> until earned").

**The product house rules** (bind every lane; never cut): SOS is never gated. Nothing derived ever decreases. No streak resets, no shame line. No random rewards. No points for claimed sober days. Nothing leaves the device (no network call, no tracker, no remote font). Original words only, never the source book's text. Every screen that is not finished shows an honest state, never a dead button.

# 5 The owner's open items

1. **The walk of the v1.1 file** on a phone and on a computer; the findings in one message to the owner's window, which routes them by outbox to the lanes.
2. **The India crisis numbers (input I6):** which numbers are confirmed. Until then every number says "please verify".
3. **A clinical reader** for `docs/offline/build-2026-11-07/CLINICAL-REVIEW-PACK.md`: who reads it and when. No safety copy changes before the answers.
4. **O-Q1 (from R-O-8, for the online app only):** is SOS open before sign-up? Default yes. Nothing changes for the offline edition; the record goes to `docs/decisions/owner-inputs.md` and an ADR when the main-line plan resumes.
5. **The usage reading:** only the owner can read `/usage`. Tell the window the reading and its reset time when asked, and the word "park" at 98%.

<!-- pagebreak -->

# 6 Paste-ready prompt for the owner's HUB window

Copy the whole block. Paste it into a fresh Claude Code window opened in `C:\Users\ruchi\1-addic`.

```
You are the owner's HUB window of the 1-addic offline build program (the build of 7 November 2026; edition V3; tag offline-v3.0). The program was parked at 2026-11-09 20:46 IST when the owner's weekly usage limit reached 98% (the owner's R-O-9). You resume it from its files. You are in C:\Users\ruchi\1-addic (the main folder; the trunk build/offline-v1 is checked out here; the lanes live in worktrees under C:\Users\ruchi\1-addic-wt\<lane>). Paths below are relative to docs/offline/build-2026-11-07/ (<docs>). Time stamps come from `date`, never estimated. The document you were pasted from (owner-docs/1-addic-Resume-Prompt.md) says the state at parking: trunk c5dc374, tags offline-v1.0, offline-v1.1, offline-v3.0, offline-v3.1, offline-v3.2, 72 merges, pending nothing: every unit of the chain is merged; FREEZE, the full gates and the tag follow; its section 1 has every lane's tip.

1. Read first, in this order, before you write anything: PLAN.md; PLAN-V3.md; coordination/status-HUB.md; tracks/HUB/RUN-RECORD.md from its last "Resume here" heading to the end; coordination/status-CORE.md; coordination/status-SCREENS.md; the four outboxes coordination/outbox-HUB.md, outbox-CORE.md, outbox-SCREENS.md and outbox-OWNER.md (the last three entries of each, every R-O entry of outbox-OWNER.md); coordination/baselines.md.

2. Verify the parked state without redoing anything: `git status --short` (uncommitted program files?); `git fetch origin`, then `git log --oneline -1` against `git rev-parse --short origin/build/offline-v1` (is the trunk pushed?); `git tag -l "offline-v*"`; `git rev-parse --short build/<lane>` for every lane the status files name, against the tips in the document; `claude agents --json` (which chats of this program are live, if any); `python <docs>/tools/fresh_chat_launcher.py --status` (the loop should be stopped). If status-HUB.md's MERGING line names a lane, `python <docs>/tracks/HUB/workflows/merge_lane.py status <lane>`. Do not merge, build, test or launch anything in this step.

3. Your first message to the owner, under a page: (1) the time from `date`; (2) the state as you found it, with every difference from the document named (a tip that moved, an uncommitted file, a chat still live, a tag missing, a merge left open); (3) the pending order to the tag offline-v3.0 from status-HUB.md's MERGE-QUEUE and BASE lines (the document expected: nothing: every unit of the chain is merged; FREEZE, the full gates and the tag follow); (4) the launcher's state; (5) one line of what you need from the owner, if anything (usually nothing: R-O-3 and R-O-7 let you start without waiting); (6) ask for the current /usage reading and its reset time, so you can pace the remaining hours.

4. Then start the program without waiting for a word: `python <docs>/tools/fresh_chat_launcher.py --start`, then `python <docs>/tools/fresh_chat_launcher.py --launch-missing`; confirm with `--status` that a HUB, a CORE and a SCREENS chat are listed and step. The launcher starts the HUB on claude-fable-5-1 and CORE and SCREENS on claude-opus-5-5 with the kickoff blocks of KICKOFF-PROMPTS.md and the resume line; it relaunches a chat whose status file says STATE: RESTART; it never launches under 4.0 GB free. A launched chat with no step after 15 minutes is most likely the usage limit: say so. If a chat cannot be started, the owner has a paste-ready prompt for it in section 7 of the document.

5. Report to the owner every 30 minutes, and at once at a merge, a tag, a red by name or a question (R-O-3). Each report: the time, the merges since the last report with their trunk tips, each lane's state, the launcher's state, the last memory row, the next step.

6. Your remit, as the owner's window (RUN-RECORD.md, "Resume here (00:13, owner's window)" and "Owner's window hand-over"): file the owner's words in coordination/outbox-OWNER.md as a heading `## R-O-10 · <stamp from date> · "<the owner's words>"` with a paragraph on what changed (the next number after that one each time), and tell the HUB chat by message; relay the board's first three lines and the status files to the owner; route the owner's walk findings by outbox to the lane that owns the file, each with a default; send a built file to the owner with SendUserFile when asked (offline/1-addic.html as built by the HUB or a lane; never build a unit yourself); merge only if no launcher HUB is live, and then exactly by the recipe (merge_lane.py prepare, conflicts, guards, commit, finish --hub --push; one lane at a time; never hand over with a gate running); never edit .claude/settings.json; never touch main, origin/main, the claude/* branches, docs/PLAN.md, docs/BUILD-GUIDE.md, docs/decisions/0001 to 0021, docs/book/, docs/program/, scripts/, data/, the pharma program or its launcher; commit only by path with `python <docs>/tools/hub_commit.py --track HUB --session <your session link> -m "docs(HUB, <date>): ..." <paths>` (it adds the trailers Co-Authored-By and Claude-Session; never git add -A; never force-push, rebase, stash or check out over uncommitted work); push build/offline-v1, the lane branches and the tags only, never main.

7. Memory (PLAN.md section 4): under 4.0 GB free the newest run pauses at its next commit (tier 2 first when one runs); a new run needs a row of 7.0 GB; at 4.0 GB or more paused work resumes, tier 1 first; the rows are in coordination/lane-widening.md. What frees memory is outside this build (the pharma program's chats, other windows): tell the owner; do not close them yourself.

8. The parking rule (R-O-9): when the owner says the weekly usage reads 98%, or says "park": (1) `python <docs>/tools/fresh_chat_launcher.py --stop` first; (2) message each live chat to finish or pause its runs at the next clean point, write its Resume here and the PARKED line on its status file, commit by path and push its branch (a merge in progress finishes if its gates are already green, otherwise it is aborted before guards); (3) wait for the PARKED lines; (4) write the final hand-over in tracks/HUB/RUN-RECORD.md; (5) `python <docs>/owner-docs/build_resume_doc.py`; (6) commit the three files by path with hub_commit.py and push; (7) confirm with `git status --short` (no program file left) and `git log origin/build/offline-v1 -1`.

9. Context: over 250,000 tokens write your hand-over in tracks/HUB/RUN-RECORD.md (filed R-O lines, the next number, the state, the open items); at 300,000, at the next safe point, write STATE: RESTART with a note on status-HUB.md only if no launcher HUB is live (the launcher's chats own that line otherwise), tell the owner to open a fresh window with this same prompt, and stop.
```

<!-- pagebreak -->

# 7 Paste-ready prompts for CORE and SCREENS

Use these only if the launcher cannot start a chat (its `--status` shows no live chat of the track after `--launch-missing`, or it reports a failed launch). Start the chat in `C:\Users\ruchi\1-addic` on the model the launcher would use: `claude --model claude-opus-5-5` (or in the background as the launcher does: `claude --bg --name "CORE <HH:MM>" --model claude-opus-5-5 "<the prompt>"`). Each prompt sends the chat to its full kickoff block in `KICKOFF-PROMPTS.md`, so the wording the launcher uses reaches it whole.

**CORE** (lanes core, engine, actions-sos, learn, tests-docs):

```
ultracode. You are the CORE chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 1 · CORE" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-CORE.md and tracks/CORE/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked at 2026-11-09 20:46 IST at 98% of the owner's weekly usage and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: core MERGED 49c788f; engine MERGED 97ac73a; actions-sos MERGED fb3966b; learn MERGED a494fa7; tests-docs READY 69f2b72.
```

**SCREENS** (lanes content, today-track, workbook-settings, actions, game-tutorials):

```
ultracode. You are the SCREENS chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 2 · SCREENS" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-SCREENS.md and tracks/SCREENS/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked at 2026-11-09 20:46 IST at 98% of the owner's weekly usage and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: content MERGED cd17758; today-track MERGED 670df19; workbook-settings MERGED b76d4f3; actions MERGED 0977edd; game-tutorials MERGED a3f0bf7.
```

# 8 The parking checklist

What the owner's window does when the owner says the weekly usage reads 98% (or "park"), from R-O-9. In this order:

1. Stop the launcher first, so no fresh chat is launched into the last 2%: `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --stop`.
2. Message each live chat (the HUB, CORE, SCREENS; `claude agents --json` lists them) to park: finish or pause its runs at the next clean point, write its Resume here in its run record and the PARKED line on its status file, commit by path and push its branch. A merge in progress finishes if its gates are already green; otherwise it is aborted before guards.
3. Wait for the PARKED lines on `coordination/status-HUB.md`, `status-CORE.md` and `status-SCREENS.md`.
4. Write the final hand-over in `tracks/HUB/RUN-RECORD.md` (the state, the filed R-O lines and the next number, the open items).
5. Re-run this generator: `python docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py`.
6. Commit the three files by path and push: `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <session link> -m "docs(HUB, <date>): the resume-prompt document refreshed at parking (R-O-9)" docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py docs/offline/build-2026-11-07/owner-docs/1-addic-Resume-Prompt.md docs/offline/build-2026-11-07/owner-docs/1-addic-Resume-Prompt.docx`, then `git push origin build/offline-v1`.
7. Confirm: `git status --short` shows no program file; `git log origin/build/offline-v1 -1` shows the commit; `git tag -l "offline-v*"` lists the tags; every lane branch's tip is on origin.

> [!NEXT]
> **To resume later:** open a Claude Code window in `C:\Users\ruchi\1-addic`, paste section 6, and let the window start the launcher. Everything the program needs is in the pushed branches and this document.
