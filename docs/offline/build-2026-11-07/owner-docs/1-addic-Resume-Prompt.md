---
title: 1-addic · Resume Prompt and Steps
subtitle: The status report and the plan at the park, how to start the offline build again, and the complete hand-over
accent: hub
cover: true
toc: true
confidential: false
auto_glossary: false
Prepared by: Claude, the owner's window of the build program (rendered by owner-docs/build_resume_doc.py)
Date: 17 November 2026, 14:48 IST
Edition: Park of 17 November 2026; latest tag offline-v3.4; trunk build/offline-v1 at 8c1f5b51
Status: Rendered from the live state at 2026-11-17 14:48 IST; the launcher loop is stopped and nothing runs
---

> [!SUMMARY]
> **What this is.** The one document the owner needs to start the 1-addic offline build again after a park. It opens with the status report and the plan. Part A is yours: six steps, the prompt to paste, and the open choices only you can make. Part B is the complete hand-over: where the build stopped, what remains toward `offline-v3.5`, how the start works, how the program runs and the decisions in force.
> **Where we are.** The app stands at the tag `offline-v3.4` (2026-11-15 12:24) with every gate green. The program was parked on 17 November 2026: the owner paused the work, R-O-19. The launcher loop is stopped, so nothing runs and nothing spends usage until you start it.

Everything in this document was read from the live files and git at render time, except the park notes of section 4, the rulings of section 8 and the items of section 3, which are written by hand.

# The status report

This part is written by hand at the park of 17 November 2026, in plain words. Sections 4 and 5 hold the same facts as they were read from the files.

## Where things stand

| What | Where it stands |
|---|---|
| The latest tagged version | Version 3.4, the tag `offline-v3.4` (15 November, 12:24), on GitHub. Every check passed on it: 809 of 809 automatic checks, 33 of 33 browser flows, the build, validate, the guards and the guide. |
| The file to test | `offline/1-addic.html` in the folder `C:\Users\ruchi\1-addic`, also sent with this document. It is the newest build: version 3.4 plus the two-tab fix, 1,221,933 bytes. It is not a tagged version yet. When the fix was merged (15 November, 16:23), 814 of 814 automatic checks and 33 of 33 browser flows passed on it. At the park it was built again from the sources and came out identical, byte for byte. |
| New in version 3.4 | When a change is not saved because another tab changed the notebook, the app says so once and keeps a short line until you act. Never in SOS, never in a printout. The guide has a passage on it. |
| New since version 3.4 | The two-tab fix. Setting, changing or removing the PIN in one tab now works from the stored entries, so entries another tab saved before are kept. One narrow case stays: an entry saved in another tab in the very moment the PIN is being set, changed or removed. Until version 3.5 and its guide, keep the notebook open in one tab only. |
| Running at the park | Nothing. No build, no check and no merge was in progress, so nothing was cut off and nothing is lost. The launcher is stopped: nothing starts and nothing spends usage until you resume. |
| 15 to 17 November | No work was done after 15 November, 17:05. The weekly usage limit stopped the chats that day (17:09 and 17:34; it reset on 16 November at 14:30). The two chats the launcher started on 16 November at 20:44 stopped at their first step on the notice "Claude Code can't use your Claude subscription, usually because a payment is past due". The owner's window was stopped by the same limit, so no report reached you until your line of 17 November. |
| GitHub | Everything is pushed. The branch `build/offline-v1` and the tags hold all of it. `main` holds version 3.3 (your merge of 14 November) and moves only when you say so. |
| Red | None. |
| From you | Nothing blocks the start. Section 3 lists the open choices; each has its default in force. |

## The work in hand and planned

Nothing is in hand: no work was running at the park. This is the order after you resume.

| Order | The work | Status | What it is |
|---|---|---|---|
| 1 | The wording fix, part 1 (core, FIX-DRAWN-WRITE-SAY) | Prepared, not started | Today the app can say a change of yours was not saved when the refused save was one the app made by itself while it drew a page. The fix makes the app stay quiet for its own saves. A builder, an independent check and two reviewers. It starts when 7 GB of memory is free. |
| 2 | The wording fix, part 2 (actions-sos, the actions.js part) | Granted, starts after part 1 is merged | The same fix where the app's actions save, for example a tap on "Got it" on a tip card. Two reviewers. |
| 3 | One documents run (tests-docs) | Planned, after both parts | The counts of the checks in the README and CLAUDE.md, and the guide's rows on two tabs: they still name the PIN-removal loss as a known issue and will name the narrow case that stays. |
| 4 | The freeze, the full checks, the tag `offline-v3.5` | Planned | The coordinating chat runs every check on the merged result and tags version 3.5 if every check is green. You get the app file and the guide. |
| Later | The last two-tab gap (FIX-LOCK-WRITE-GAP) and the low findings C1, C2 and C3 | Named, not started | Small fixes the reviewers named for after version 3.5: the narrow two-tab case that stays, and three low findings. |
| Any time | Your walk findings | Waiting for you | Whatever you find when you use the app file. They go ahead of every other fix. |

<!-- pagebreak -->

# Part A · Resume

## 1 Steps to resume

1. **Open Claude Code** in the folder `C:\Users\ruchi\1-addic`.
2. **Start a new chat** and name it `1-addic owner resume`: type `/rename 1-addic owner resume`, or rename it in the app's session list. Use a new chat, not last night's window. Keep the capital words HUB, CORE and SCREENS out of the name, or the launcher takes the chat for one of its own.
3. **Paste the prompt** of section 2 into it. Or send the one line below this list: it makes the chat read the same prompt from a file.
4. **Wait five to ten minutes.** The chat checks the parked state and starts the launcher. The launcher starts a fresh chat named "HUB hh:mm". If it has not done so within five minutes, the chat forces that start by itself (section 6.4). Then the chat gives you a short first report.
5. **Send your lines.** The chat files each one and passes it on. The build goes on by itself toward `offline-v3.5`: your `Continue` of 14 November stands. Section 3 lists what helps.
6. **To stop for the day,** say `park`. The chat stops the launcher, parks the chats and sends you this document again, refreshed.

The one line for step 3:

```
Read docs/offline/build-2026-11-07/owner-docs/1-addic-Resume-Prompt.txt and follow it. It is my resume prompt for the 1-addic offline build.
```

**What you will see.**

| When | What you see | What it means |
|---|---|---|
| In the first minute | The chat runs `date`, `git status`, the launcher's `--status` and `claude agents` | It checks that the park is intact before it changes anything. |
| After about two minutes | "loop started: pid N (alive: True)" | The launcher runs again. It checks every two minutes. |
| After five to ten minutes | A chat named "HUB hh:mm" in the session list | The fresh HUB chat. It merges, rules and tags. You do not need to type in it. |
| Then | The first report: the state, what the launcher did, what is needed from you | The chat does not ask for your `/usage` reading any more (your R-O-13). |
| After about five minutes, memory allowing | A chat named "CORE hh:mm" | The build chat. It builds; the HUB merges. No chat named "SCREENS hh:mm": that track is paused and owes nothing. |
| Every 30 minutes | A short report | It also comes at once at a merge, a tag, a red by name or a question for you. |

**If something looks wrong.**

| What you see | What to do |
|---|---|
| The chat says free memory is under 4.0 GB | Nothing, or close other programs. The launcher tries again every two minutes by itself. |
| The chat reports a line "WEEKLY LIMIT" | The weekly usage limit holds every start until the time it names. When `/usage` shows the limit has reset, say `the limit has reset`. |
| A fresh chat stops at once with "Claude Code can't use your Claude subscription" | It happened on 16 November. The notice names a payment that is past due: check claude.ai/settings/billing. When it works again, say `the subscription works again`. |
| No chat named "HUB hh:mm" after ten minutes | Say `force the HUB launch`. Section 6.4 explains it. |
| "loop running" or "the loop already runs", yet nothing happens | Say `check the stale loop.pid`. Section 6.5 explains it. |
| You typed in last night's window by mistake | Leave it alone for 30 minutes. Or paste the prompt of section 2 there: that window then forces the HUB launch. |
| A question you cannot answer | Say `use the default`. Every question comes with one. |
| A report names a red | Nothing, unless the report asks you. A red is a failed check, and its lane fixes it by name. |

**One thing left running.** No watch loop of this build is left running. Two parked chats (HUB 16:58 and CORE 16:56) may still be listed as idle: they do nothing and spend no usage (section 4.6). Nothing at the start depends on them.

<!-- pagebreak -->

## 2 The prompt to paste

Paste everything inside the box into the new chat, as its first message. The same text is in the file `docs/offline/build-2026-11-07/owner-docs/1-addic-Resume-Prompt.txt`.

```
You are the owner's window of the 1-addic offline build program (the build of 7 November 2026). The owner parked the program on 17 November 2026 (the owner paused the work, R-O-19) and resumes it now, in this window. This prompt is the owner's word to start the launcher. You are in C:\Users\ruchi\1-addic (the main folder; the trunk build/offline-v1 is checked out here; the lanes live in worktrees under C:\Users\ruchi\1-addic-wt\<lane>). Below, <docs> stands for docs/offline/build-2026-11-07. Time stamps come from `date`, never estimated.

The state at the park, as rendered 2026-11-17 14:48 IST: the latest tag is offline-v3.4 at 8bd439b2 (2026-11-15 12:24; frozen at 8bd439b2; the full gates GREEN by every name: build 1220739 B; Node 809/809 in 16 files; validate; guards 5/5; browser 33/33; docs). The trunk tip was 8c1f5b51; the commits that carry the resume document follow it, so expect one or two newer "docs(HUB, ...)" commits on top of it. 82 lane merges are on the trunk. The launcher loop is stopped; the tracks paused in the launcher: SCREENS. The status words: HUB PARKED, CORE PARKED, SCREENS WAITING. The owner's last line on file is R-O-19 · 2026-11-17 14:27 · "give resume prompt and steps, status report and details for work going on and planned in a word doc. Current testable version ( html for testing) and pause work till we start from the resume prompt"; the next free number is R-O-20.

1. The order, and one standing rule. Do steps 2 and 3 before you read any program file. The launcher reads the first 300 KB of every chat's transcript in this folder. It counts a chat as a track's own chat when that text shows the opening sentence of the track's kickoff prompt: the words 'You are the', then a track's name in capitals, then the word 'chat'. A chat counted that way holds back the fresh chat of that track. So, for the whole life of this chat, never print any of these six files whole, nor any line of them that holds that sentence: <docs>/KICKOFF-PROMPTS.md, <docs>/owner-docs/1-addic-Resume-Prompt.md, <docs>/owner-docs/build_resume_doc.py, <docs>/tools/fresh_chat_launcher.py, <docs>/tools/hook_context_restart.py, docs/offline/START-OR-RESUME.md. Search them with grep for the exact lines you need. Never write that sentence yourself. Keep the capital words HUB, CORE and SCREENS out of this chat's name. Never add this chat to <docs>/tools/token_roles.json: the launcher counts every chat listed there as its track's chat.

2. Verify the parked state. Change nothing in this step. Run each as its own command:
- `date`
- `git status --short` (expected: only the line " M .claude/settings.json": the owner's own file, which you leave alone)
- `git fetch origin`, then `git rev-parse --short=8 HEAD` and `git rev-parse --short=8 origin/build/offline-v1` (one revision per call; the two must be equal)
- `git tag -l "offline-v*"` (expected: offline-v1.0, offline-v1.1, offline-v3.0, offline-v3.1, offline-v3.2, offline-v3.3, offline-v3.4)
- `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status` (expected: the first line ends "loop NOT RUNNING (...)"; the second line reads "paused tracks: SCREENS"; the track rows are those of the last check before the park, not of now)
- `claude agents --json` (read only the rows of this folder: is a chat named "HUB hh:mm" of today already live? Is your own row's name free of the three capital words? Two rows of 15 November may still have a process and are not the resume day's: HUB 16:58 (1ae91d3d) and CORE 16:56 (2258732f), both parked on 17 November. If one still reads live and holds back a fresh chat, `claude stop <id>` of a dead chat of this program is allowed under R-O-7. Read `startedAt`, not the name alone.)
Never start a second loop, and never double a live launcher HUB. One known fault (FIX-LOOP-PID): the loop leaves its pid file behind when it stops, and the launcher takes any process with that number for its loop. The sign: the first line says "loop running (pid N)" while "last check" is more than five minutes old. Check it in PowerShell: `Get-CimInstance Win32_Process -Filter "ProcessId=N" | Select-Object Name,CommandLine`. If nothing is printed, or the command line does not name fresh_chat_launcher.py, the file is a leftover: delete C:\Users\ruchi\AppData\Local\1-addic-hub\launcher\loop.pid (and loop.stop in the same folder, if it is there), tell the owner, then go on.

3. Start the launcher. This prompt is the owner's word for it (R-O-3 and R-O-7 stand).
- `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start` (expected: "loop started: pid N (alive: True)"; the answer "the loop already runs (pid N)" when step 2 showed no loop is the leftover pid file of step 2)
- about a minute later: `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --launch-missing`. One exception: if step 2 showed a line "WEEKLY LIMIT: no launch for any track until <stamp>", do not run it yet, because it lifts that hold. Tell the owner the stamp and wait for the word that the limit has reset.
- then `--status` again. Expected: "loop running (pid N)"; a "last check" of this minute; a row "launched HUB <today>T<hh:mm> <id> (HUB <hh:mm>) because NO CHAT live for HUB (...)"; and a row "launched CORE <today>T<hh:mm> ..." and a SCREENS row that ends "; the track is paused (--resume-track SCREENS lifts it) -> HELD: ...". A HUB row "live 1 ... -> nothing to do" in its place is the case of step 4.
The fresh HUB chat runs on claude-fable-5-2 (the owner's R-O-12) and starts from the HUB's own Resume here. It takes the HUB's work: the merges, the rulings, the gates, the tag. While a launcher HUB is live you do none of that work. When it is listed, send it one message: the owner's window hand-over that follows its Resume here in <docs>/tracks/HUB/RUN-RECORD.md is for it too (the hourly renewal, the idle chats that still have a process, the leftover watch loops, the watch rule).

4. If no fresh HUB chat is listed within five minutes, read the HUB row of `--status` and act on what it says.
- "free memory X GB, under 4.0": the memory hold. The loop tries again every two minutes. Tell the owner; close nothing yourself.
- a line "WEEKLY LIMIT: no launch for any track until <stamp>": tell the owner the stamp. Run `--launch-missing` (it lifts the hold) only when the owner says the limit has reset.
- a line "FAILED <when> HUB: ...": report it to the owner in its own words.
- "live 1" or more with "-> nothing to do", and no chat named "HUB hh:mm" of today: the launcher takes an open chat for the HUB: this one if a kickoff sentence was printed in it, a chat the roles file lists (the owner's window of 7 to 11 November, afc0ccd2), or an old "HUB hh:mm" chat that still has a process. An open chat that only waits still reads live for 30 minutes after each hourly renewal of its transcript file. Then force the launch, and only while no launcher HUB is live. In <docs>/coordination/status-HUB.md replace the first line that starts with STATE: by `STATE: RESTART   # <stamp from date> IST: the owner's window: the parked HUB's Resume here of 2026-11-17 14:37 IST stands; a fresh HUB is wanted`, and the first line that starts with UPDATED: by `UPDATED: <YYYY-MM-DD HH:MM> IST` (now, from `date`). Commit that one file by path (step 10) and push. The loop starts the HUB at its next check "because HAND-OVER written".

5. Then read, in this order, cutting long lines with `cut -c1-700`:
- the first three lines of <docs>/coordination/SPRINT-BOARD.md (STATE, NEEDS YOU, NEXT)
- the STATE, BASE, MERGING, MERGE-QUEUE, OWNER and UPDATED lines of <docs>/coordination/status-HUB.md (grep them; do not print the file)
- <docs>/tracks/HUB/RUN-RECORD.md from its last "## Resume here" heading to the end: the HUB's Resume here, then the owner's window hand-over of the park day
- every "## R-O-" heading of <docs>/coordination/outbox-OWNER.md, and its last entry whole
- the last two entries of <docs>/coordination/outbox-HUB.md
- the STATE and LANE lines of <docs>/coordination/status-CORE.md and <docs>/coordination/status-SCREENS.md
- <docs>/PLAN.md sections 4 (memory) and 8 (the merge), only when you need them.

6. Your first report to the owner, under one page: the time; the state against the paragraph above, with every difference named; what the launcher did; the board's NEEDS YOU items, one line each. Do not ask the owner for the weekly reading of /usage (the owner's R-O-13). A WEEKLY LIMIT line of the launcher, or a chat that stops on a subscription notice, is told to the owner at once.

7. Filing the owner's words. Every line of the owner that decides or asks for something is filed first: a new entry at the end of <docs>/coordination/outbox-OWNER.md, with the heading `## R-O-<n> · <YYYY-MM-DD HH:MM of the owner's message> · "<the owner's words, verbatim>"` and one paragraph: the words in full, when it was filed, what changes, who acts. The next number is R-O-20. Copy the form of the last entry. Commit by path, push, then tell the live launcher HUB with SendMessage to its "HUB hh:mm" name. A chat's question for the owner goes to the owner in the chat's own words, with its default.

8. Waking the build tracks. SCREENS is paused in the launcher under R-H-56 (a track that owes nothing stays paused) until an owner line names work for it: the walk's findings in its territory, or I6. File the line and tell the HUB; the HUB lifts the pause. If no launcher HUB is live, or the pause is still on ten minutes after your message, run `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --resume-track <TRACK>` yourself under R-O-7 and tell the HUB. CORE is not paused: the owner's 'Continue' (R-O-17) stands, so its fresh chat starts by itself at the loop's first check that finds no chat of the track reading live, and goes on with the named work toward offline-v3.5. After a pause is lifted, the fresh chat starts at the first check that finds no chat of the track reading live. An idle chat of the track that still has a process reads live for 30 minutes after each hourly renewal of its transcript file, so that check can be most of an hour away unless the HUB first ends those chats (`claude stop <id>`, R-O-7; the HUB's call). The work named toward offline-v3.5: core's FIX-DRAWN-WRITE-SAY, actions-sos's FIX-DRAWN-WRITE-SAY, the counts and the guide's two-tab rows, FIX-LOCK-WRITE-GAP with the LOWs C1 to C3, the owner's walk findings.

9. Reports. Every 30 minutes, and at once at a merge, a tag, a red by name or a question for the owner (R-O-3). A report says: the time, the trunk tip, what merged, what runs, the reds by name, the questions with their defaults, and what is needed from the owner. Between reports stay quiet: use a small polling script under the Monitor tool that wakes you on a change, not a loop of steps. Give the script its own end (it exits by itself after about 35 minutes; start the next one after each report) and stop the old watch before you start a new one, because a watch script keeps running after its watch and its chat have ended.

10. The remit. You are the owner's interactive window: you file the owner's words in outbox-OWNER.md with the stamp, relay status, route the owner's walk findings to lanes by outbox, send builds with SendUserFile, and keep the owner's part moving. You merge only if no launcher HUB is live (check ListAgents or `claude agents --json` for a live "HUB hh:mm" first; one HUB at a time), using <docs>/PLAN.md section 8 and merge_lane.py (prepare, conflicts, guards, commit, finish; "merge(offline): <lane> READY|READY-SLICE <tip7>"). You never edit .claude/settings.json, never build a unit, never touch main, origin/main, the claude/* branches, docs/PLAN.md, docs/BUILD-GUIDE.md, docs/decisions/0001 to 0021, docs/book/, docs/program/, scripts/, data/, the pharma program or its launcher (kriya-hub). Commit only by path: `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <this chat's session link or id> -m "docs(HUB, <date>): ..." <paths>`. The tool stages only the named paths and writes the two trailers itself. Push build/offline-v1, lane branches and tags only. Never `git add -A`; never force-push, rebase, stash or check out over uncommitted work. The launcher's lines (--start, --stop, --restart, --resume, --launch-missing, --pause-track, --resume-track) and `claude stop <id>` of a dead chat of this program are allowed under R-O-7. When the owner asks for the build, send offline/1-addic.html with SendUserFile: `offline/1-addic.html` in the main folder (1221933 bytes) differs from the file at the tag `offline-v3.4`; take the tagged one with `git show offline-v3.4:offline/1-addic.html > 1-addic-v3.4.html`.

11. Memory (<docs>/PLAN.md section 4). The machine is shared. Under 4.0 GB free nothing new starts and the newest run pauses at its next commit; a new run needs a memory row of 7.0 GB. `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --mem` prints the reading and writes nothing. When memory holds the build, tell the owner; close nothing yourself. No leftover watch loop was found at the park.

12. The product house rules bind everything: SOS is never gated; nothing derived decreases; no streak resets, no shame line; no random rewards; no points for claimed sober days; nothing leaves the device; original words only, never the source book's text; crisis copy is marked for clinical review. Secrets and .env files are never committed.

13. Parking. When the owner says "park" or "day closed", or reads 98% weekly usage, do these nine steps in order (section 10 of the Word document has them in full): file the line; stop the loop (`--stop`), confirm "loop NOT RUNNING" and delete a leftover loop.pid; message the live chats to park; wait for their PARKED lines; append your hand-over to <docs>/tracks/HUB/RUN-RECORD.md under a heading that starts "## Owner's window hand-over" (never "## Resume here"); edit the PARK notes near the top of <docs>/owner-docs/build_resume_doc.py (print only that block, never the file whole) and run the generator; commit the four owner-docs files by path and push; send 1-addic-Resume-Prompt.docx with SendUserFile; confirm the final state.

14. Context. Over 250,000 tokens, write your hand-over under an "## Owner's window hand-over" heading in the HUB's run record, commit and push. At 300,000, tell the owner to open a fresh window with this same prompt, and stop. You write STATE: RESTART on status-HUB.md only as the forced launch of step 4, never while a launcher HUB is live.
```

<!-- pagebreak -->

## 3 What is needed from you

Nothing here blocks the start. Each item has a fallback, so the build never waits on a guess.

| # | The item | What to send | If you send nothing |
|---|---|---|---|
| 1 | The walk of the app file | Use the file sent with this document on your phone and on your computer: version 3.4 plus the two-tab fix. Send what you find in one message. `send me the app file` makes the chat send it again. | The planned fixes are built. Your findings go ahead of every other fix whenever they come. |
| 2 | I6: the India crisis numbers | The numbers you have confirmed, each with its source and the date you checked it. | Every number keeps the words "please verify". |
| 5 | The words when a change is not saved because another tab changed the notebook | Only to change them, for example `5c: say the line`. (a) The line reads "This notebook changed in another tab, so your last change was not saved." (b) It stays on the lock page until you unlock, or until another page when no PIN is set; never in SOS. (c) In two rare races the app says nothing. (d) Settings > Your data keeps its own short line. | The words stay as built. |
| 6 | `main` on GitHub | `main follows the tags`, or ask for one merge to `main` in your own words. | `main` stays at version 3.3 and moves only when you say so. |
| 7 | Memory | `memory free`, after you pause another program for about an hour. | The build waits and starts again on each reading of 7 GB free. The 4 GB floor stays. |
| 8 | The narrow two-tab case that stays | `8: close the gap first` holds version 3.5 until it is closed. | Version 3.5 is tagged with the two-tab fix. Its guide names the narrow case, with the advice to keep the notebook open in one tab. The last gap is a later fix. |
| 9 | Three wording choices of the "not saved" line | Only to change one, for example `9a: clear after SOS`. (a) With a PIN set the line stays on the lock page until you unlock. (b) With no PIN it stays until another page or a save that goes through. (c) A Track save refused in SOS is never announced. | They stay as built. |
| 10 | One more wording choice | `10: only my own save` | Once you have tapped or typed, the next save that goes through clears the line, even a save the app makes itself. |
| 11 | The next wording fix (steps 1 and 2 of the plan) | `11: say it` shows a short line in its quiet cases. | The app stays quiet when a save it made by itself is refused. With a PIN set that tab goes to the lock page, and an erased notebook shows empty, both without a message. |
| - | To stop again | `park` stops the work at once. `stop at the tag` stops it after version 3.5. | Your `Continue` of 14 November stands: the build goes on by itself after the start. |
| - | ES1 | Only if you want it back: `reverse ES1`. In discreet mode the line 'If you are in danger, call your local emergency number' no longer shows while the app loads. | The change stays (R-H-51). |
| - | V-Q8: the clinical reader | Who reads `CLINICAL-REVIEW-PACK.md`, and by when. | No safety copy changes. Crisis copy stays marked for clinical review. |
| - | O-Q1, for the online app only | Is SOS open before sign-up? | The default stands: yes. Nothing changes in the offline edition. |

The numbers are the board's own (its NEEDS YOU line). Items 3 and 4 are done: the park, and the guide passage of version 3.4.

> [!NOTE]
> **The board's own line for you, read live** (`coordination/SPRINT-BOARD.md`, NEEDS YOU): (PARKED: nothing is needed from you while parked. To resume: open a fresh window and paste the prompt of the resume document your window gives you. The items below keep their defaults and wait; one line each, filed as R-O-20 onward): (1) the walk of offline-v3.4 (tagged today 12:24; it holds all of offline-v3.3 plus the "not saved" line; ask your window for the file and the guide): open the file your window sent you (offline/1-addic.html at the tag) on your phone and your computer, and write the findings in one message; they go before any other fix. (2) I6, the India crisis numbers: confirm numbers only if you want a please-verify flag cleared (default: none cleared). (3) Done: you parked the program on 17 Nov (R-O-19); it starts again only from the resume prompt. (4) Done, nothing needed: the guide in offline-v3.4 has the passage on the "not saved" line and the two-tab note (offline/docs/1-addic-Guide.docx at the tag). (5) The words when a change is not saved because another tab changed the notebook (asked 19:00, R-C-98; built as below unless you answer, e.g. "5c: say the line"): (a) the line reads "This notebook changed in another tab, so your last change was not saved."; (b) it stays on the lock page until you unlock, or until you go to another page when no PIN is set; never in SOS; (c) in a rare race right after an unlock you are back on the lock page and the app says nothing; the other choice is one line, "Your notebook changed in another tab."; a reviewer asks the same of one more rare race (01:02, R-H-69): right after you set a PIN in one tab while another tab is...

<!-- pagebreak -->

# Part B · The hand-over

## 4 Where we stopped

**Why it is parked:** the owner paused the work. R-O-19, 14:27 IST: "give resume prompt and steps, status report and details for work going on and planned in a word doc. Current testable version ( html for testing) and pause work till we start from the resume prompt"

| Time (IST), 17 November 2026 | What happened |
|---|---|
| 15 Nov 12:24 | The tag offline-v3.4 is set at 8bd439b2 with every gate green. The app file and the guide go to the owner at 12:29. |
| 15 Nov 16:23 | core FIX-REMOVE-STALE-ROWS (the two-tab fix) is merged at bf74180c: Node 814 of 814 and browser 33 of 33 on the merged tree (R-H-83). It is the last code change before the park. |
| 15 Nov 16:57 | core FIX-DRAWN-WRITE-SAY is prepared and granted (slot 1; slot 3 for its actions.js part after core's merge, R-H-84). HUB 16:58 and CORE 16:56 take over from their predecessors. |
| 15 Nov 17:09 | The weekly usage limit stops CORE 16:56 before it launches the run. The launcher logs WEEKLY LIMIT: no launch until 16 November 14:30. HUB 16:58 stops on the same limit at 17:34, and the owner's window after its report of 17:00. The last commit is f1ac3752 of 17:05. |
| 16 Nov 20:44 | The loop starts HUB 20:44 (b29c9b29) and CORE 20:44 (012aa274). Each stops at its first step on the notice "Claude Code can't use your Claude subscription, usually because a payment is past due" and commits nothing. Neither has a process at the park. |
| 17 Nov 14:27 | The owner's line arrives in the owner's window (5029727e): R-O-19, filed 14:32 (8147bab9), pushed. |
| 17 Nov 14:33 | The launcher loop is stopped on the owner's word (`--stop`, pid 31844). The leftover `loop.pid` file is removed at once (section 6.5). No fresh chat can start. |
| 17 Nov 14:36 | CORE 16:56 parks on the owner's window's message: STATE PARKED, its Resume here; commit f0850ed5. Nothing of CORE ran; core FIX-DRAWN-WRITE-SAY stays prepared. |
| 17 Nov 14:37 | HUB 16:58 parks at a clean point: STATE PARKED on status-HUB.md, its Resume here in tracks/HUB/RUN-RECORD.md, the board, R-H-85; commit c36a2a31, pushed with CORE's. No run was live and no merge was open, so nothing was paused or aborted. |
| 17 Nov 14:40 on | The owner's window checks the app file against a fresh build from the trunk's sources (identical, 1221933 bytes), writes its hand-over under the HUB's Resume here (c9a9ad88), renders this document, pushes everything and sends the Word file and the app file. |

**The state, read live.** Rendered **2026-11-17 14:48 IST**. The trunk is `build/offline-v1` at `8c1f5b51` (`8c1f5b5 docs(HUB, 2026-11-17): the owner's-window section of the park: one time corrected (the loop count was read at about 14:40)`). Pushed: yes, origin/build/offline-v1 is at the same tip (as last fetched). Lane merges recorded on status-HUB.md: 82. Uncommitted: 1 file(s), this document's own four files not counted: `M .claude/settings.json` (the owner's own file; the program never edits or commits it). The app file: `offline/1-addic.html` in the main folder (1221933 bytes) differs from the file at the tag `offline-v3.4`; take the tagged one with `git show offline-v3.4:offline/1-addic.html > 1-addic-v3.4.html`.

**The tags.**

| Tag | Commit | Tagged | What it is |
|---|---|---|---|
| `offline-v1.0` | 45473b22 | 2026-11-07 11:40 | the 1-addic offline edition, first tag (2026-11-07) |
| `offline-v1.1` | f69bc68a | 2026-11-08 01:59 | the 1-addic offline edition, second tag (2026-11-08) |
| `offline-v3.0` | 60dffe33 | 2026-11-08 11:55 | the 1-addic offline edition, third tag (2026-11-08 11:55 IST) |
| `offline-v3.1` | 903016cc | 2026-11-09 18:15 | the offline edition, tier 2 complete (2026-11-09 IST) |
| `offline-v3.2` | c5dc3743 | 2026-11-09 20:44 | the offline edition of 1-addic, third edition's second fix tag (2026-11-09 IST) |
| `offline-v3.3` | e167f71a | 2026-11-14 16:49 | the offline edition of 1-addic, third edition's third fix tag (2026-11-14 IST) |
| `offline-v3.4` | 8bd439b2 | 2026-11-15 12:24 | the offline edition of 1-addic, third edition's fourth fix tag (2026-11-15 IST) |

The gates at `offline-v3.4`: frozen at 8bd439b2; the full gates GREEN by every name: build 1220739 B; Node 809/809 in 16 files; validate; guards 5/5; browser 33/33; docs.

**The last hand-over headings** in `tracks/HUB/RUN-RECORD.md`. A fresh HUB chat starts from the last "Resume here" heading and reads to the end of the file, so the owner's window hand-over below it is read too.

- The HUB's: Resume here (written 2026-11-17 14:37 IST by HUB 16:58, session 1ae91d3d, on claude-fable-5-2, at the park on R-O-19: the program is PARKED by the owner until the resume prompt)
- The owner's window's: Owner's window hand-over (2026-11-17 14:43 IST, session 5029727e: the park on R-O-19; the program is parked until the owner resumes it with the resume prompt)

**The board, read live** (`coordination/SPRINT-BOARD.md`).

- STATE: PARKED (2026-11-17 14:37 IST, on your line of 17 Nov, R-O-19): work is paused until you start from the resume prompt. Nothing is running and nothing was lost. The last tagged app is offline-v3.4 (8bd439b2, 15 Nov 12:24, on GitHub; all 809 automatic checks and all 33 browser flows green on it). One fix is merged on top of it and waits for the next tag: with the notebook open in two tabs, removing the PIN in one no longer loses the other tab's newer entries (all 814 automatic checks and all 33 browser flows were green on the merged result on 15 Nov). No work was done on 16 or 17 Nov: the weekly usage limit stopped the chats on 15 Nov at about 17:30.
- NEXT: (the HUB, 2026-11-17 14:37 IST): nothing until you resume. After the resume, in this order: your walk findings of offline-v3.4 if you have any; one smaller wording fix in two parts (FIX-DRAWN-WRITE-SAY: first the store, then the actions; two reviewers each; prepared, not started), each merged alone; the counts and the guide's line; the full gates; the tag offline-v3.5.

### 4.1 The HUB (status-HUB.md)

| Line | Value (cut to about 300 characters) |
|---|---|
| STATE | PARKED   # 2026-11-17 14:37 IST: PARKED on the owner's R-O-19 (2026-11-17 14:27, filed by the owner's window 5029727e, 8147bab9): work is paused until the owner starts from the resume prompt. HUB 16:58 (1ae91d3d, claude-fable-5-2, session 42) parks at a clean point: nothing was running, nothing i... |
| BASE-READY | 2026-11-07 07:15 655516dc |
| BASE | bf74180c (the trunk tip after the core merge bf74180c, 2026-11-15 16:25 IST; fixes toward offline-v3.5 cut from the trunk tip at their start, merge base that tip; lanes: core d11f252 in the trunk; the code before it 8bd439b2 = TAG offline-v3.4). Earlier: 8bd439b2 (TAG offline-v3.4, 2026-11-15 12:... |
| TRACKS-ALLOWED | CORE SCREENS   # both tracks RESUMED in the launcher 2026-11-14 12:02 IST (--resume-track CORE, --resume-track SCREENS; R-H-58 on R-O-11); the launcher starts a fresh chat of each at its first pass with no chat of the track reading live (afc0ccd2, reopened today, reads live for the HUB track only... |
| MERGING | none   # 2026-11-15 16:25 IST: core d11f252 merged bf74180c, trunk bf74180c pushed 16:23 |
| MERGE-QUEUE | none; next: core FIX-DRAWN-WRITE-SAY (flagged) when READY, alone; then actions-sos FIX-DRAWN-WRITE-SAY (flagged) when READY, alone; then the tests-docs run (the counts, the guide's two-tab rows), alone; then FREEZE, QUIET, TAG offline-v3.5 |
| SLOTS-ALLOWED | 2 (2026-11-14 17:14 IST: toward offline-v3.4, by hand 7.9 GB free with nothing of this build running: tests-docs 5, core 1; one start per row at or above 7.0 GB, under 4.0 GB the newest run pauses at its next commit). Earlier: 3 (2026-11-14 12:02 IST: the row 11:58 16.0 GB free of 31.8 with nothi... |
| OWNER | R-O-19 (2026-11-17 14:27, filed by the owner's window, 8147bab9; read by the HUB 2026-11-17 14:37 IST): 'give resume prompt and steps, status report and details for work going on and planned in a word doc. Current testable version ( html for testing) and pause work till we start from the resume p... |
| RULING | R-H-69 (2026-11-15 01:02 IST): core's check and both reviews at 8f0cdaa read (CORE by message 01:01, a9a7d829): check PASS (C1-C3 LOW; build 1218625 B, store.test 146/146, validate, guards 5/5, territory 0; the contracts reviewer's full Node suite 801/0/0 in 16 files); contracts RC1 MEDIUM (a sav... |
| UPDATED | 2026-11-17 14:37 IST |

### 4.2 CORE (status-CORE.md)

| Line | Value |
|---|---|
| STATE | PARKED   # 2026-11-17 14:38 IST: the owner parked the program (R-O-19, 14:27). CORE 16:56 (2258732f-245f-416a-8429-fb94f8687578) launched nothing: core FIX-DRAWN-WRITE-SAY prepared, NOT started (note, contract shape, args with FILL; slot 1, slot 3 after core's merge). No loop or run of CORE is li... |
| UPDATED | 2026-11-17 14:38 IST |

Lanes of CORE. The tip is `git rev-parse --short build/<lane>`; "pushed" compares it with origin as last fetched.

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
| core | NEW 9f233b1 | 9f233b1 | no | 2026-11-17 14:38 IST: PARKED. FIX-DRAWN-WRITE-SAY (flagged, two reviewers; N1 of R-H-75, R-H-83) prepared, not started: build/core and its worktree at 9f233b1, clean; note tracks/CORE/briefs/core/FIX-DRAWN-WRITE-SAY.md; args tracks/CORE/args/args_v3_core_FIX-DRAWN-WRITE-SAY.json (FILL at launch);... |
| engine | MERGED 97ac73a | 97ac73a | yes | 2026-11-08 10:56 IST: FIX-RS27 merged 0db0a9f7 (trunk c8b553ce; full Node suite 623/623, the trunk's one red closed). The engine's V3 units and fixes complete |
| actions-sos | NEW f2b0023 | f2b0023 | yes | 2026-11-15 16:55 IST: FIX-DRAWN-WRITE-SAY's actions.js part asked on slot 3 (R-C-111), after core's part merges; note tracks/CORE/briefs/actions-sos/FIX-DRAWN-WRITE-SAY.md; fast-forward build/actions-sos and its worktree to the trunk tip at its start |
| learn | MERGED a494fa7 | a494fa7 | yes | 2026-11-09 15:36 IST: V-20 merged 95aac382. The lane's V3 units complete |
| tests-docs | MERGED 0bd6321 | 0bd6321 | yes | 2026-11-15 12:13 IST: merged 3a466262, trunk 8bd439b2 pushed 12:08 (R-H-80); FREEZE offline-v3.4 at 8bd439b2 |

### 4.3 SCREENS (status-SCREENS.md)

| Line | Value |
|---|---|
| STATE | WAITING   # 2026-11-14 17:04 IST: TAG offline-v3.3 = e167f71a (HUB, 16:50; R-H-62). SCREENS 12:59 (ce57dcb1) live with its watch. No SCREENS LOW is worth a run of its own (the stale comment at ui-guidance.js:381 goes with the next game-tutorials unit); no slot asked. The owner's walk findings in... |
| UPDATED | 2026-11-14 17:04 IST |

Lanes of SCREENS:

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
| content | MERGED 8b61575 | 8b61575 | yes | 2026-11-14 12:28 IST: V-10b (I6 default) + C1-381 merged 64967784 (HUB: build 1213283 B, content.test, validate, guards GREEN, territory 0). The lane's V3 units are complete; fixes by name only |
| today-track | MERGED 670df19 | 670df19 | yes | V-43 with the round-1 fix merged at 91c81de2 (07:36, HUB 11; trunk fb6061b5; every gate green by name on the merged tree). The lane's V3 units are complete; fixes by name only |
| workbook-settings | MERGED b76d4f3 | b76d4f3 | yes | R-S-32 merged 526663bb (HUB; build, 27/27, validate, guards GREEN; the tour and Settings flows 4/4 on the merged tree). Fixes by name only |
| actions | MERGED 0977edd | 0977edd | yes | READY 0977edd merged 18:50 (49f1c1d4; U-22..U-25 in the trunk); complete; fixes by name only |
| game-tutorials | MERGED a3f0bf7 | a3f0bf7 | yes | FIX-COACH-SOS merged 18852152 (HUB 14:40; trunk eec5d862 with tests-docs on top; the contrast check green on the merged tree, 723/723). The lane's V3 units are complete |

### 4.4 The launcher

The launcher's own status (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status`, first 14 lines, read at render time). The track rows are those of its last check, not of now.

```
launcher: active; loop NOT RUNNING (python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start)
paused tracks: SCREENS
last check: 2026-11-17T14:30:56; free memory then 11.34 GB
  HUB: STATE BUILDING, UPDATED 2026-11-15 17:05, live 2, newest b29c9b29 0k -> nothing to do
  CORE: STATE WAITING, UPDATED 2026-11-15 17:03, live 2, newest 012aa274 0k -> nothing to do
  SCREENS: STATE WAITING, UPDATED 2026-11-14 17:04, live 0, newest ce57dcb1 167k; the track is paused (--resume-track SCREENS lifts it) -> HELD: NO CHAT live for SCREENS (last step 14 Nov 19:14)
  launched HUB 2026-11-15T13:18 0a5aa1b1 (HUB 13:18) because HAND-OVER written (status RESTART, 2026-11-15 13:10); stepped
  launched HUB 2026-11-15T16:58 1ae91d3d (HUB 16:58) because HAND-OVER written (status RESTART, 2026-11-15 16:57); stepped
  launched HUB 2026-11-16T20:44 b29c9b29 (HUB 20:44) because NO CHAT live for HUB (last step 15 Nov 17:34); stepped
  launched CORE 2026-11-15T13:03 eac6e6a0 (CORE 13:03) because NO CHAT live for CORE (last step 15 Nov 12:32); stepped
  launched CORE 2026-11-15T16:56 2258732f (CORE 16:56) because HAND-OVER written (status RESTART, 2026-11-15 16:55); stepped
  launched CORE 2026-11-16T20:44 012aa274 (CORE 20:44) because NO CHAT live for CORE (last step 15 Nov 17:09); stepped
  launched SCREENS 2026-11-09T16:08 6f1291e1 (SCREENS 16:08) because HAND-OVER written (status RESTART, 2026-11-09 16:06); stepped
  launched SCREENS 2026-11-14T12:02 0bd68904 (SCREENS 12:02) because NO CHAT live for SCREENS (last step 08 Nov 13:05); stepped
```

Read from it at render time:

- The loop: stopped. The loop is stopped and no `loop.pid` file is left behind (checked at render time).
- Tracks paused in the launcher: SCREENS.
- The last check: 2026-11-17T14:30:56 (17 minutes before this render).
- The last loop line of its log: `2026-11-17 14:32:59 | LOOP stopped on request (pid 31844); launched chats live on`
- No weekly-limit hold is on.

### 4.5 What was in flight

- No merge in flight (MERGING: none   # 2026-11-15 16:25 IST: core d11f252 merged bf74180c, trunk bf74180c p...).
- No lane line says BUILDING, CHECKING, REVIEWING, PAUSED, RED, READY or READY-SLICE: nothing was running.

### 4.6 The chats after the park

The chats of this folder on the park night, with how `claude agents` lists each. None of them needs anything at the start. A chat that still has a process reads live to the launcher for half of every hour (section 6.2).

| Chat | Session | Listed as | What it is |
|---|---|---|---|
| HUB 16:58 | 1ae91d3d | background, idle | The parked HUB chat. It wrote its Resume here at 14:37 and stopped; no watch or loop of it runs. A fresh HUB chat replaces it at the start. If it still reads live then, the prompt's step 4 forces the start. |
| CORE 16:56 | 2258732f | background, idle | The parked CORE chat. It launched nothing and stopped at 14:38; no sampler or loop of it runs. A fresh CORE chat replaces it after the start: CORE is not paused in the launcher. |
| HUB 20:44 and CORE 20:44 | b29c9b29, 012aa274 | listed, no process | Started by the loop on 16 November. Each stopped at its first step on the subscription notice. They did nothing and need nothing. |
| 1-addic owner 14 Nov fable 5.2 max new h-u-b | 5029727e | interactive | The owner's window of 14 to 17 November. It wrote this document. The launcher's roles file does not list it. You can close it once you have this document; resume in a new chat. |
| Older rows named HUB, CORE or SCREENS | 45 rows of 8 and 9 November | listed, not live | Finished chats of earlier days. They need nothing. |
| The other programs' chats (pharma, event, paper) | other folders | not ours | Never touched by this program, nor their launchers. |

**Memory on the park day.** On 14 and 15 November free memory swung between 0.7 and 10 GB, nearly all of it taken by other programs on this machine (their node, claude and WSL processes). It paused core's runs several times in the night of 14 November and held starts on 15 November. At the park it read 10.8 to 11.3 GB (17 November, 14:28 to 14:30). The other programs on the machine are the main brake.

### 4.7 Leftover watch loops

A chat watches the status files with a small script that looks at them once a minute. When the watch ends, or its chat ends, the script's process keeps running. None was found at this park: at about 14:40 on 17 November no shell loop of a chat of this program was running. The watch scripts written since 14 November end by themselves.

| Loops | Script | The chat it belonged to | Running since |
|---|---|---|---|
| 0 | - | - | - |

The loops only read files. They change nothing and spend no usage, and nothing depends on them. They do hold memory, on a machine where a new run waits for a reading of 7.0 GB. Three ways to deal with them, whichever you prefer:

1. **Leave them.** Nothing breaks.
2. **Ask the chat.** Say `end the leftover watch loops` in the new owner's window, and approve the request if the app asks you.
3. **Do it yourself.** Paste this one line into a PowerShell window. It ends these loops and nothing else:

```
(no loop to end)
```

A restart of the computer clears them too. It also ends every open chat of every program, so do not restart for this alone.

Another program on this machine had three loops of the same kind at the park (wait_record.sh of one of its chats). They are not this program's to touch.

<!-- pagebreak -->

## 5 What remains (toward offline-v3.5)

The app is whole at `offline-v3.4`. What follows is small: fixes by name, then the same closing steps as every tag. **Done** means a `MERGED:` line of status-HUB.md names the unit on its lane. **Pending** means it is not merged yet.

| The unit | Lane | Track | Status | What it is |
|---|---|---|---|---|
| FIX-REMOVE-STALE-ROWS (the two-tab fix) | core | CORE, flagged | Done | With the notebook open in two tabs, setting, changing or removing the PIN in one tab rewrote the notebook from that tab's memory, so entries the other tab had saved since could be lost without a message. The fix: the PIN change works from the stored rows (R-C-102, R-H-74). Merged at bf74180c on 15 November; offline-v3.4 does not have it. |
| core's FIX-DRAWN-WRITE-SAY | core | CORE, flagged | Pending | A save the app makes by itself while it draws a page, refused because another tab changed the notebook, is said as the person's own lost change. The fix: stay quiet for the app's own writes (R-H-75 N1, R-H-83). Prepared, not started: the unit note, the shape in the contract and the args are filed; slot 1. |
| actions-sos's FIX-DRAWN-WRITE-SAY | actions-sos | CORE, flagged | Pending | The same fix where the app's actions write: a tap on "Got it" on a tip card is treated the same quiet way. Slot 3, cut from the trunk tip after core's part is merged, because its two-store test needs the real store.js (R-C-111, R-H-84). |
| The counts and the guide's two-tab rows | tests-docs | CORE | Pending | One tests-docs run after both parts are merged: the counts of the checks in the README and CLAUDE.md, read on the merged tree, and the guide's rows on two tabs, which will name the narrow case that stays. The unit names in the key are the expected ones; the HUB names the run. |
| FIX-LOCK-WRITE-GAP with the LOWs C1 to C3 | core and actions-sos | CORE, flagged | Pending | Named for after offline-v3.5, not granted: the read-to-write gap that stays in the two-tab fix (an entry saved in another tab in the very moment the PIN is set, changed or removed), and three low findings of the reviews. |
| The owner's walk findings | by the file's lane | routed by the owner's window | Pending | Whatever the owner's walk of the app file finds. Each finding goes by outbox to the lane that owns the file, with a default, and becomes a named fix. They go before every other fix. |

**Pending at render time:** core's FIX-DRAWN-WRITE-SAY, actions-sos's FIX-DRAWN-WRITE-SAY, the counts and the guide's two-tab rows, FIX-LOCK-WRITE-GAP with the LOWs C1 to C3, the owner's walk findings.

**The closing steps**, once the named fixes are merged (the HUB's work):

| Step | What happens |
|---|---|
| FREEZE | no new unit starts after the last named fix is READY; fixes by name only |
| Full gates | the HUB runs every gate on the integration worktree at the trunk tip (the quiet window): python docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/_int --lane hub --full build test validate guards browser docs |
| Reds by name | every FAIL line is read by name against coordination/baselines.md; a red is fixed by its lane (by territory), then the gate runs again |
| Tag offline-v3.5 | git tag -a offline-v3.5 on the trunk in the main folder, then git push origin offline-v3.5; the hand-off note in tracks/HUB/RUN-RECORD.md |

**Tooling still open.** None of these changes the app, and none is needed for the tag.

| The unit | Where | What it is |
|---|---|---|
| FIX-LANEJS-TIP | the HUB's lane workflow | The run's tip is taken from the journal's last fix commit, and the reviewer schema loses `tip`. |
| FIX-LOOP-PID | the launcher | The loop leaves its `loop.pid` file behind when it stops, and the launcher takes any process with that number for its loop. The fix: the loop removes the file when it stops, and the check confirms the process is the launcher's own loop. Until then: the check by hand of section 6.5. |
| STILL_MIN | the launcher | A chat that waits with nothing to do is relaunched after 30 silent minutes, which spends weekly usage (R-H-56, option b). Until it is built, a build track that only waits stays paused in the launcher. The mirror of it: an idle chat that still has a process reads live for 30 minutes after each hourly renewal of its transcript file, and holds back a fresh chat of its track for that time (section 6.2). |
| The leftover watch loops | every chat that watches | A watch script started under the Monitor tool keeps running after its watch and its chat have ended (section 4.7). Proposed to the HUB: the script ends by itself after a set time, and a chat stops its old watch before it starts a new one. |

<!-- pagebreak -->

## 6 How the start works

The launcher decides by rule, from each track's status word and from the chats it counts as live. This section says what it does at the start, and what can go wrong.

### 6.1 What the launcher does at the start

| Track | Status word | Paused in the launcher | At the start | What wakes it |
|---|---|---|---|---|
| HUB | `PARKED` | no | A fresh HUB chat starts at the first check that finds no chat of the HUB track reading live (`NO CHAT live for HUB`). If five minutes pass without it, the owner's window forces the start (section 6.4). | Nothing more than `--start`, then `--launch-missing`. |
| CORE | `PARKED` | no | A fresh CORE chat starts at the first check (`NO CHAT live for CORE`). | Nothing more. |
| SCREENS | `WAITING` | yes | Held: the track is paused in the launcher. | `--resume-track SCREENS`: the HUB runs it at an owner line that asks for work. A fresh SCREENS chat starts at the first check that finds no SCREENS chat reading live (`NO CHAT live for SCREENS`, section 6.6). |

### 6.2 The rules behind it

- **A fresh chat for a track** starts when no chat of the track is live and the track's last step is at least 30 minutes old. `--launch-missing` drops the 30 minutes for one check.
- **A chat is live** when `claude agents` lists it, its process exists and its transcript was written in the last 30 minutes.
- **An open chat that only waits still reads live for half of every hour.** Its transcript file is renewed about once an hour with no step added, and the launcher counts the 30 minutes after that as live. Section 4.6 names the chats this applies to.
- **A status word that hands over** (RESTART, HANDOVER, HAND-OVER) starts a fresh chat "because HAND-OVER written", unless a newer chat of the track started after the UPDATED line.
- **A stop word** starts nothing: COMPLETE, COMPLETED, CLOSED, PAUSED, STOPPED, STOP, END, WAITING-OWNER, DONE, and READY for a build track.
- **Any other word** (PARKED, WATCHING, WAITING) starts a fresh chat "because NO CHAT live".
- **A build track** also needs the `BASE-READY` line and its name on the `TRACKS-ALLOWED` line of status-HUB.md.
- **Nothing starts** while a track is paused in the launcher, while free memory is under 4.0 GB, or while a weekly-limit hold is on.
- **The models:** the HUB runs on `claude-fable-5-2` (effort high; the owner's R-O-12 of 14 November, `claude-fable-5-1` before it), CORE and SCREENS on `claude-opus-5-5`.
- **The loop** checks every two minutes. `--status` prints the rows of its last check.

### 6.3 Three ways the owner's window is taken for a track's chat

Each one makes the launcher count a live chat of that track. It then starts no fresh one.

**First: the transcript shows a kickoff sentence.** The launcher reads the first 300 KB of every chat's transcript. If that text holds the opening sentence of a track's kickoff prompt, the chat counts as that track's chat. Six files hold such sentences, so the owner's window never prints them whole:

| File | Why it holds one |
|---|---|
| `docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md` | The kickoff prompts themselves. |
| `docs/offline/build-2026-11-07/owner-docs/1-addic-Resume-Prompt.md` | Section 9 of this document, as Markdown. |
| `docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py` | The generator of this document. |
| `docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py` | The launcher builds the prompts. |
| `docs/offline/build-2026-11-07/tools/hook_context_restart.py` | The restart hook names them. |
| `docs/offline/START-OR-RESUME.md` | The older start guide. |

**Second: the roles file lists the chat.** `tools/token_roles.json` maps the first eight characters of a session id to a track. Only the launcher writes it, one line per chat it starts, or a person by hand. The owner's window of 7 to 11 November (session afc0ccd2) is listed there as a HUB chat, which is why the start uses a new chat. A new owner's window is not listed, and it must never be added.

**Third: the chat's name holds a track's name.** A session name with the capital word HUB, CORE or SCREENS counts for that track. A name such as `1-addic owner resume` is safe.

### 6.4 The forced launch

If the launcher counts an open chat as a live HUB, no fresh HUB starts. This is likely at a start, because an open chat of the HUB track reads live for half of every hour (section 6.2). The owner's window then forces the launch, and only while no launcher HUB is live:

1. On `coordination/status-HUB.md` it replaces the STATE line with `STATE: RESTART` and a note, and the UPDATED line with the time now.
2. It commits that one file by path and pushes.
3. At its next check the loop starts a fresh HUB "because HAND-OVER written". The fresh HUB reads its Resume here and writes its own STATE line.

The prompt tells the chat to do this by itself when five minutes pass with no fresh HUB. You can also say `force the HUB launch`.

### 6.5 The leftover loop.pid file

This fault was found at the park of 11 November 2026. It is not fixed in the launcher yet: the unit FIX-LOOP-PID of section 5.

The launcher keeps the number of its loop's process in a file, `loop.pid`, in the folder `C:\Users\ruchi\AppData\Local\1-addic-hub\launcher`. `--stop` ends the loop but leaves the file. Later, Windows can give the same number to another program. The launcher then believes its loop still runs.

| The launcher says | What is really happening |
|---|---|
| `--status`: "loop running (pid N)", with a "last check" more than five minutes old | No loop runs. Nothing is checked and nothing starts. |
| `--start`: "the loop already runs (pid N)" | Nothing was started. |
| `--stop`: it waits 130 seconds, then "loop N did not stop in time" | It leaves a second file, `loop.stop`. The next real loop would exit at its first pass. |
| `--restart` | It fails for the same reason. |

**The check**, in PowerShell, with the number the launcher printed:

```
Get-CimInstance Win32_Process -Filter "ProcessId=N" | Select-Object Name,CommandLine
```

If nothing is printed, or the command line does not name `fresh_chat_launcher.py`, the file is a leftover. **The fix:** delete `loop.pid` (and `loop.stop`, if it is there) in that folder, then run `--start`. You only say `check the stale loop.pid`.

At render time: The loop is stopped and no `loop.pid` file is left behind (checked at render time).

### 6.6 CORE and SCREENS after the pause is lifted

At this park only SCREENS is paused in the launcher, because it owes nothing; CORE is not paused, so a fresh CORE chat starts after the HUB's and goes on with the named work. How the pause came about: both build tracks were paused in the launcher on 9 November (R-H-56), because a chat that only waits was relaunched about every hour and spent usage for nothing. The HUB lifts a pause with `--resume-track <TRACK>` when an owner line asks for work. What happens next depends on the track's status word:

- **CORE** (`PARKED`): a fresh CORE chat starts at the loop's first check that finds no CORE chat reading live.
- **SCREENS** (`WAITING`): a fresh SCREENS chat starts at the loop's first check that finds no SCREENS chat reading live.

One thing can delay a fresh chat: idle chats of the track that still have a process (section 4.6). Each reads live for half of every hour, so the first check that finds none of them live can be most of an hour away. The HUB can shorten the wait by ending those chats first (`claude stop <id>`, R-O-7).

### 6.7 The memory hold

The machine is shared with other programs. Under 4.0 GB free the launcher starts nothing and says so in the track's row: "free memory X GB, under 4.0". It tries again every two minutes, so nothing has to be done. `--mem` prints the reading and writes nothing. Section 4.6 has the readings of the park day, and section 4.7 names leftover loops that hold a little of it.

<!-- pagebreak -->

## 7 How the program runs

The build runs as three Claude Code chats started by the launcher: the HUB, which merges and tags, and CORE and SCREENS, which build. The owner's window is the fourth chat: it files your words, relays status and keeps your part moving.

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

**The launcher** (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py ...`): a loop that checks every two minutes and starts a fresh chat when a track needs one. It starts the HUB on `claude-fable-5-2` (effort high) and CORE and SCREENS on `claude-opus-5-5`, each with its kickoff block from `KICKOFF-PROMPTS.md` plus a resume line. It relaunches a chat whose status file says `STATE: RESTART` (a chat hands over at 300k context) or that has no live session for 30 minutes, unless the track's status word is a stop word or the track is paused (section 6.2). It never launches under 4.0 GB free. Its state and log live in `%LOCALAPPDATA%\1-addic-hub\launcher\`. Commands:

| Command | What it does |
|---|---|
| `--start` | Starts the loop (detached; after a machine restart run this first). |
| `--launch-missing` | One check with the 30-minute rule off: every track without a live chat is launched now. Run it after `--start`. |
| `--status` | The loop, the pause, the last check, the chats per track. |
| `--stop` | Ends the loop. The launched chats live on. The first step of parking. |
| `--pause-track CORE` / `--resume-track CORE` | One track's pause and resume (also SCREENS, HUB). |
| `--pause "<reason>"` / `--resume` | The global pause. |
| `--restart` | `--stop`, then `--start`. |
| `--mem` | Prints the free-memory reading and writes nothing. |

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

**The commit discipline:** `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <session link> -m "docs(HUB, <date>): ..." <paths>` from the main folder. It stages and commits only the paths named and adds the two trailers (`Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>` for the HUB track, with `--coauthor` for a chat on another model, and `Claude-Session: <link>`). Never `git add -A`; never force-push, rebase, stash or check out over uncommitted work; only the HUB (or the owner's window when no launcher HUB is live) pushes, and only `build/offline-v1`, the lane branches and the tags.

<!-- pagebreak -->

## 8 The decisions in force

**The owner's words** (every R-O heading of `coordination/outbox-OWNER.md`, quoted whole; 19 so far; the next number is R-O-20):

1. R-O-1 · 2026-11-07 08:25 · no answer from the owner by 08:25: the defaults of PLAN.md section 9 are in force
2. R-O-2 · 2026-11-07 14:38 · "I agree with the defaults"
3. R-O-3 · 2026-11-07 22:01 · "start the launcher without waiting for my word 'start', run --start and --launch-missing" (filed 2026-11-07 22:09 IST)
4. R-O-4 · 2026-11-07 22:23 · "start the build if not started"
5. R-O-5 · 2026-11-08 02:09 · "Look at what can be improved and complete building those in a new 1-addic V3"
6. R-O-6 · 2026-11-08 03:03 · "Add a main quest-line with rewards that unlock new features as you progress through it, add daily tasks or objectives that grow something. Add a streak counter that doesn't demotivate breaking it, but more focus on keeping it up."
7. R-O-7 · 2026-11-08 04:44 · "V-Q1 to V-Q13 use default answers, continue to build ... Any ! Commands needed to maintain for the build are authorised. Complete the build as soon as possible."
8. R-O-8 · 2026-11-08 07:25 · "When we make the app, not just offline, it will have a feature that will only let people that have invite or refferal join the app (create account and start their journey)"
9. R-O-9 · 2026-11-08 08:53 · "When we hit 98% usage limit of weekly usage, we will prepare handover and details related to, create a resume prompt word doc we can use to resume and complete from where we left off"
10. R-O-10 · 2026-11-11 21:00 · "We are going to resume work tomorrow, prepare complete handover details. Then give me a resume prompt and steps in a word doc."
11. R-O-11 · 2026-11-14 11:50 · "continue v3.3. Wake the build tracks and complete the remaining work up to the tag offline-v3.3. Use the default answer for any question I have not answered."
12. R-O-12 · 2026-11-14 12:54 · "From now on HUB on Fable 5.2"
13. R-O-13 · 2026-11-14 13:45 · "Don't worry about usage"
14. R-O-14 · 2026-11-14 14:08 · "Status plan and eta to completion in word downloadable here"
15. R-O-15 · 2026-11-14 17:42 · "Give me the updated guide word doc"
16. R-O-16 · 2026-11-14 21:21 · "give latest report, merge everything to main, push and sync with git repo"
17. R-O-17 · 2026-11-14 22:06 · "Continue"
18. R-O-18 · 2026-11-15 11:55 · "give me a new prompt that i can paste into new chat, that will take the handover from this and be the next hub"
19. R-O-19 · 2026-11-17 14:27 · "give resume prompt and steps, status report and details for work going on and planned in a word doc. Current testable version ( html for testing) and pause work till we start from the resume prompt"

**The HUB's rulings still in force** (`coordination/outbox-HUB.md` has each one whole):

| Ruling | What it says |
|---|---|
| R-H-51 | ES1. In discreet mode the line 'If you are in danger, call your local emergency number' no longer shows while the app loads: it appeared under the 'Notebook' title for up to 4 seconds and gave the app away. The SOS button and every help page are unchanged. The owner may say 'reverse ES1'. |
| R-H-53 and R-H-55 | After a tag only fixes by name are built. Each fix lane is cut from the trunk tip at its start. One run starts per 7.0 GB memory row across both tracks; under 4.0 GB free the newest run pauses first. The flagged lanes core and actions-sos need two reviewers. |
| R-H-56 | A build track that only waits stays paused in the launcher, because a waiting chat was relaunched about every hour for nothing to do. At this park SCREENS is paused (it owes nothing since offline-v3.3) and CORE is not. The HUB lifts a pause (`--resume-track <TRACK>`) when work is named for the track. |
| R-H-60 and the owner's R-O-17 | After a tag the small named fixes go on toward the next tag as slots and memory allow. The owner's 'Continue' of 14 November stands until the owner says 'park' or 'stop at the tag'. |
| R-H-74 and R-H-83 | The two-tab loss on a PIN change (FIX-REMOVE-STALE-ROWS) was granted as core's unit after offline-v3.4 and is merged at bf74180c. One narrow case stays and is named for later (FIX-LOCK-WRITE-GAP); offline-v3.5's guide names it. 'close the gap first' from the owner holds the tag for it. |
| R-H-83 and R-H-84 | FIX-DRAWN-WRITE-SAY: core's part on slot 1, then actions-sos's actions.js part on slot 3 after core's merge, each flagged with two reviewers; then one tests-docs run. Its six small choices (Q1 to Q6, the board's NEEDS YOU 11) are built as their defaults; '11: say it' from the owner reverses them. |
| R-H-85 | The park of 17 November 14:37 IST on R-O-19: nothing live, nothing aborted, the tag offline-v3.4 stands; the HUB's Resume here says how the HUB starts again. |

**The V3 defaults** (PLAN-V3.md sections 5 and 7; the owner's R-O-7 took V-Q1 to V-Q13 at their defaults):

- The V3 line is tagged `offline-v3.x` (V-Q1). The tags so far: offline-v1.0, offline-v1.1, offline-v3.0, offline-v3.1, offline-v3.2, offline-v3.3, offline-v3.4. The next is `offline-v3.5`.
- The status layer is a page, "Your Harbor", at `#/status`, reached in one tap from Today (V-Q2, V-Q3, V-Q6).
- The 14-day strip shows dated dots without a count (V-Q4); "what just changed" is since the page was last drawn this session (V-Q5).
- The India crisis numbers: none cleared yet; every number keeps "please verify" (V-Q7). The clinical review pack is produced; no copy changes before the reviewer's answers (V-Q8).
- The run: one grace day a week keeps the run and shows as "kept" (V-Q9). A day shown up is any day with a log, a lesson, a practice, an objective or an SOS drill; never a claimed sober day (V-Q12). It shows in Today's header and in Your Harbor's "Where you stand"; never a push, a countdown or a shame line (V-Q13).
- Three daily objectives a day: two drawn by date and state, one the person may swap once a day; done by a tap or by the matching event (V-Q11).
- The quest-line opens features earlier than the modules would; nothing open in v1.1 locks; tools, mini-games and the Explorer are never a reward; never SOS, help, lessons, Settings, export or the person's data (V-Q10 as read by R-H-44; the owner may still say "V-Q10: lock <names> until earned").

**The product house rules** (bind every lane; never cut): SOS is never gated. Nothing derived ever decreases. No streak resets, no shame line. No random rewards. No points for claimed sober days. Nothing leaves the device (no network call, no tracker, no remote font). Original words only, never the source book's text. Every screen that is not finished shows an honest state, never a dead button.

<!-- pagebreak -->

## 9 Starting a build chat by hand

Use this only when the launcher cannot start a build chat, or when a build track has work while its status word is a stop word (section 6.6). The start is yours: open a new chat in `C:\Users\ruchi\1-addic` on the model `claude-opus-5-5`, name it `CORE <HH:MM>` or `SCREENS <HH:MM>` with the time now, and paste the prompt as its first message. Each prompt sends the chat to its full kickoff block in `KICKOFF-PROMPTS.md`, so the wording the launcher uses reaches it whole.

> [!WARNING]
> **Never paste these two prompts into the owner's window, and never ask it to print them.** Each opens with a kickoff sentence on purpose, so that the launcher counts the new chat for its track. In the owner's window the same sentence would make the launcher take that window for a build chat.

**CORE** (lanes core, engine, actions-sos, learn, tests-docs):

```
ultracode. You are the CORE chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 1 · CORE" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-CORE.md and tracks/CORE/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked on 17 November 2026 (the owner paused the work, R-O-19) and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: core NEW 9f233b1; engine MERGED 97ac73a; actions-sos NEW f2b0023; learn MERGED a494fa7; tests-docs MERGED 0bd6321.
```

**SCREENS** (lanes content, today-track, workbook-settings, actions, game-tutorials):

```
ultracode. You are the SCREENS chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 2 · SCREENS" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-SCREENS.md and tracks/SCREENS/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked on 17 November 2026 (the owner paused the work, R-O-19) and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: content MERGED 8b61575; today-track MERGED 670df19; workbook-settings MERGED b76d4f3; actions MERGED 0977edd; game-tutorials MERGED a3f0bf7.
```

From a terminal the same start is `claude --bg --name "CORE <HH:MM>" --model claude-opus-5-5 "<the prompt>"`.

## 10 Parking again

What the owner's window does when you say `park` or `day closed`, or when you read 98% weekly usage (R-O-9 and R-O-10). In this order:

1. File the owner's line in `coordination/outbox-OWNER.md`, commit by path, push.
2. Stop the launcher first, so no fresh chat starts: `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --stop`. Confirm that `--status` says "loop NOT RUNNING". Delete `loop.pid` if it is left behind (section 6.5).
3. Message each live chat (`claude agents --json` lists them) to park: finish or pause its runs at the next clean point, write its Resume here in its run record and the PARKED line on its status file, commit by path and push its branch. A merge in progress finishes if its gates are already green; otherwise it is aborted before guards.
4. Wait for the PARKED lines on the status files. A track that is paused and has no live chat keeps its line.
5. Append the owner's window hand-over to `tracks/HUB/RUN-RECORD.md`, after the HUB's Resume here, under a heading that starts "## Owner's window hand-over". Never head it "## Resume here": a fresh HUB starts from the last heading of that name.
6. Edit the PARK notes near the top of `owner-docs/build_resume_doc.py` (the day, the reason, the timeline, the chats, the memory note, the leftover watch loops of section 4.7). Then run the generator: `python docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py`.
7. Commit the four files by path with `tools/hub_commit.py`: `build_resume_doc.py`, `1-addic-Resume-Prompt.md`, `1-addic-Resume-Prompt.txt` and `1-addic-Resume-Prompt.docx`. Then `git push origin build/offline-v1`.
8. Send `1-addic-Resume-Prompt.docx` to the owner with SendUserFile.
9. Confirm: `git status --short` shows no program file; origin is at the trunk tip; `git tag -l "offline-v*"` lists the tags; `--status` says "loop NOT RUNNING"; no `loop.pid` is left.

> [!NEXT]
> **To resume:** open Claude Code in `C:\Users\ruchi\1-addic`, start a new chat named `1-addic owner resume`, paste the prompt of section 2 and let the chat start the launcher. The build then goes on by itself toward `offline-v3.5`. Send your walk's findings or I6 when you are ready. Everything the program needs is in the pushed branches and in this document.
