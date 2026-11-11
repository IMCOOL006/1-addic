---
title: 1-addic · Resume Prompt and Steps
subtitle: How to start the offline build again after a park, with the complete hand-over
accent: hub
cover: true
toc: true
confidential: false
auto_glossary: false
Prepared by: Claude, the owner's window of the build program (rendered by owner-docs/build_resume_doc.py)
Date: 11 November 2026, 23:32 IST
Edition: Park of 11 November 2026; latest tag offline-v3.2; trunk build/offline-v1 at b99f5e02
Status: Rendered from the live state at 2026-11-11 23:32 IST; the launcher loop is stopped and nothing runs
---

> [!SUMMARY]
> **What this is.** The one document the owner needs to start the 1-addic offline build again after a park. Part A is yours: six steps, the prompt to paste, and the seven things only you can answer. Part B is the complete hand-over: where the build stopped, what remains toward `offline-v3.3`, how the start works, how the program runs and the decisions in force.
> **Where we are.** The app stands at the tag `offline-v3.2` (2026-11-09 20:44) with every gate green. The program was parked on 11 November 2026: the day closed, the owner's R-O-10. The launcher loop is stopped, so nothing runs and nothing spends usage until you start it.

Everything in this document was read from the live files and git at render time, except the park notes of section 4, the rulings of section 8 and the items of section 3, which are written by hand.

# Part A · Resume

## 1 Steps to resume

1. **Open Claude Code** in the folder `C:\Users\ruchi\1-addic`.
2. **Start a new chat** and name it `1-addic owner 12 Nov`: type `/rename 1-addic owner 12 Nov`, or rename it in the app's session list. Use a new chat, not last night's window. Keep the capital words HUB, CORE and SCREENS out of the name, or the launcher takes the chat for one of its own.
3. **Paste the prompt** of section 2 into it. Or send the one line below this list: it makes the chat read the same prompt from a file.
4. **Wait five to ten minutes.** The chat checks the parked state and starts the launcher. The launcher starts a fresh chat named "HUB hh:mm". If it has not done so within five minutes, the chat forces that start by itself (section 6.4). Then the chat gives you a short first report.
5. **Send your lines.** The chat files each one and passes it on. `continue v3.3` wakes the build. Section 3 lists what else helps.
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
| Then | The first report: the state, what the launcher did, what is needed from you | The chat also asks for your `/usage` reading. |
| Until you ask for work | No chat named "CORE hh:mm" or "SCREENS hh:mm" | The build tracks are paused, so nothing spends usage while there is nothing to build. `continue v3.3` wakes them. |
| Every 30 minutes | A short report | It also comes at once at a merge, a tag, a red by name or a question for you. |

**If something looks wrong.**

| What you see | What to do |
|---|---|
| The chat says free memory is under 4.0 GB | Nothing, or close other programs. The launcher tries again every two minutes by itself. |
| The chat reports a line "WEEKLY LIMIT" | The weekly usage limit holds every start until the time it names. When `/usage` shows the limit has reset, say `the limit has reset`. |
| No chat named "HUB hh:mm" after ten minutes | Say `force the HUB launch`. Section 6.4 explains it. |
| "loop running" or "the loop already runs", yet nothing happens | Say `check the stale loop.pid`. Section 6.5 explains it. |
| You typed in last night's window by mistake | Leave it alone for 30 minutes. Or paste the prompt of section 2 there: that window then forces the HUB launch. |
| A question you cannot answer | Say `use the default`. Every question comes with one. |
| A report names a red | Nothing, unless the report asks you. A red is a failed check, and its lane fixes it by name. |

**One thing left running.** 36 small watch loops of ended chats of this build still run on the computer. They are harmless and spend no usage, but they hold about 0.3 GB of memory. Section 4.7 has three ways to clear them. Nothing at the start depends on it.

<!-- pagebreak -->

## 2 The prompt to paste

Paste everything inside the box into the new chat, as its first message. The same text is in the file `docs/offline/build-2026-11-07/owner-docs/1-addic-Resume-Prompt.txt`.

```
You are the owner's window of the 1-addic offline build program (the build of 7 November 2026). The owner parked the program on 11 November 2026 (the day closed, the owner's R-O-10) and resumes it now, in this window. This prompt is the owner's word to start the launcher. You are in C:\Users\ruchi\1-addic (the main folder; the trunk build/offline-v1 is checked out here; the lanes live in worktrees under C:\Users\ruchi\1-addic-wt\<lane>). Below, <docs> stands for docs/offline/build-2026-11-07. Time stamps come from `date`, never estimated.

The state at the park, as rendered 2026-11-11 23:32 IST: the latest tag is offline-v3.2 at c5dc3743 (2026-11-09 20:44; frozen at aac18546; the full gates GREEN by every name: build 1213207 B; Node 763/763 in 16 files; validate; guards 5/5; browser 32/32; docs). The trunk tip was b99f5e02; the commits that carry the resume document follow it, so expect one or two newer "docs(HUB, ...)" commits on top of it. 73 lane merges are on the trunk. The launcher loop is stopped; the tracks paused in the launcher: CORE, SCREENS. The status words: HUB PARKED, CORE WAITING, SCREENS WAITING-OWNER. The owner's last line on file is R-O-10 · 2026-11-11 21:00 · "We are going to resume work tomorrow, prepare complete handover details. Then give me a resume prompt and steps in a word doc."; the next free number is R-O-11.

1. The order, and one standing rule. Do steps 2 and 3 before you read any program file. The launcher reads the first 300 KB of every chat's transcript in this folder. It counts a chat as a track's own chat when that text shows the opening sentence of the track's kickoff prompt: the words 'You are the', then a track's name in capitals, then the word 'chat'. A chat counted that way holds back the fresh chat of that track. So, for the whole life of this chat, never print any of these six files whole, nor any line of them that holds that sentence: <docs>/KICKOFF-PROMPTS.md, <docs>/owner-docs/1-addic-Resume-Prompt.md, <docs>/owner-docs/build_resume_doc.py, <docs>/tools/fresh_chat_launcher.py, <docs>/tools/hook_context_restart.py, docs/offline/START-OR-RESUME.md. Search them with grep for the exact lines you need. Never write that sentence yourself. Keep the capital words HUB, CORE and SCREENS out of this chat's name. Never add this chat to <docs>/tools/token_roles.json: the launcher counts every chat listed there as its track's chat.

2. Verify the parked state. Change nothing in this step. Run each as its own command:
- `date`
- `git status --short` (expected: only the line " M .claude/settings.json": the owner's own file, which you leave alone)
- `git fetch origin`, then `git rev-parse --short=8 HEAD` and `git rev-parse --short=8 origin/build/offline-v1` (one revision per call; the two must be equal)
- `git tag -l "offline-v*"` (expected: offline-v1.0, offline-v1.1, offline-v3.0, offline-v3.1, offline-v3.2)
- `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status` (expected: the first line ends "loop NOT RUNNING (...)"; the second line reads "paused tracks: CORE, SCREENS"; the track rows are those of the last check before the park, not of now)
- `claude agents --json` (read only the rows of this folder: is a chat named "HUB hh:mm" of today already live? Is your own row's name free of the three capital words? Four idle rows of earlier days still have a process and are not today's: HUB 12:09 (2b59e0da), CORE 11:10 (80a57fa8) and SCREENS 11:07 (c26b6cc6) of 8 November, and CORE 21:42 (8b2ee4e2) of 9 November. Read `startedAt`, not the name alone.)
Never start a second loop, and never double a live launcher HUB. One known fault (FIX-LOOP-PID): the loop leaves its pid file behind when it stops, and the launcher takes any process with that number for its loop. The sign: the first line says "loop running (pid N)" while "last check" is more than five minutes old. Check it in PowerShell: `Get-CimInstance Win32_Process -Filter "ProcessId=N" | Select-Object Name,CommandLine`. If nothing is printed, or the command line does not name fresh_chat_launcher.py, the file is a leftover: delete C:\Users\ruchi\AppData\Local\1-addic-hub\launcher\loop.pid (and loop.stop in the same folder, if it is there), tell the owner, then go on.

3. Start the launcher. This prompt is the owner's word for it (R-O-3 and R-O-7 stand).
- `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start` (expected: "loop started: pid N (alive: True)"; the answer "the loop already runs (pid N)" when step 2 showed no loop is the leftover pid file of step 2)
- about a minute later: `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --launch-missing`. One exception: if step 2 showed a line "WEEKLY LIMIT: no launch for any track until <stamp>", do not run it yet, because it lifts that hold. Tell the owner the stamp and wait for the word that the limit has reset.
- then `--status` again. Expected: "loop running (pid N)"; a "last check" of this minute; a row "launched HUB <today>T<hh:mm> <id> (HUB <hh:mm>) because NO CHAT live for HUB (...)"; and a CORE row that ends "; the track is paused (--resume-track CORE lifts it) -> HELD: ..." and a SCREENS row that ends "-> nothing to do". A HUB row "live 1 ... -> nothing to do" in its place is the case of step 4.
The fresh HUB chat runs on claude-fable-5-1 and starts from the HUB's own Resume here. It takes the HUB's work: the merges, the rulings, the gates, the tag. While a launcher HUB is live you do none of that work. When it is listed, send it one message: the owner's window hand-over that follows its Resume here in <docs>/tracks/HUB/RUN-RECORD.md is for it too (the hourly renewal, the idle chats that still have a process, the leftover watch loops, the watch rule).

4. If no fresh HUB chat is listed within five minutes, read the HUB row of `--status` and act on what it says.
- "free memory X GB, under 4.0": the memory hold. The loop tries again every two minutes. Tell the owner; close nothing yourself.
- a line "WEEKLY LIMIT: no launch for any track until <stamp>": tell the owner the stamp. Run `--launch-missing` (it lifts the hold) only when the owner says the limit has reset.
- a line "FAILED <when> HUB: ...": report it to the owner in its own words.
- "live 1" or more with "-> nothing to do", and no chat named "HUB hh:mm" of today: the launcher takes an open chat for the HUB: this one if a kickoff sentence was printed in it, a chat the roles file lists (the owner's window of 7 to 11 November, afc0ccd2), or an old "HUB hh:mm" chat that still has a process. An open chat that only waits still reads live for 30 minutes after each hourly renewal of its transcript file. Then force the launch, and only while no launcher HUB is live. In <docs>/coordination/status-HUB.md replace the first line that starts with STATE: by `STATE: RESTART   # <stamp from date> IST: the owner's window: the parked HUB's Resume here of 2026-11-11 21:15 IST stands; a fresh HUB is wanted`, and the first line that starts with UPDATED: by `UPDATED: <YYYY-MM-DD HH:MM> IST` (now, from `date`). Commit that one file by path (step 10) and push. The loop starts the HUB at its next check "because HAND-OVER written".

5. Then read, in this order, cutting long lines with `cut -c1-700`:
- the first three lines of <docs>/coordination/SPRINT-BOARD.md (STATE, NEEDS YOU, NEXT)
- the STATE, BASE, MERGING, MERGE-QUEUE, OWNER and UPDATED lines of <docs>/coordination/status-HUB.md (grep them; do not print the file)
- <docs>/tracks/HUB/RUN-RECORD.md from its last "## Resume here" heading to the end: the HUB's Resume here, then the owner's window hand-over of the park day
- every "## R-O-" heading of <docs>/coordination/outbox-OWNER.md, and its last entry whole
- the last two entries of <docs>/coordination/outbox-HUB.md
- the STATE and LANE lines of <docs>/coordination/status-CORE.md and <docs>/coordination/status-SCREENS.md
- <docs>/PLAN.md sections 4 (memory) and 8 (the merge), only when you need them.

6. Your first report to the owner, under one page: the time; the state against the paragraph above, with every difference named; what the launcher did; the board's NEEDS YOU items, one line each. Then ask for the weekly reading of /usage and its reset time: only the owner can read it.

7. Filing the owner's words. Every line of the owner that decides or asks for something is filed first: a new entry at the end of <docs>/coordination/outbox-OWNER.md, with the heading `## R-O-<n> · <YYYY-MM-DD HH:MM of the owner's message> · "<the owner's words, verbatim>"` and one paragraph: the words in full, when it was filed, what changes, who acts. The next number is R-O-11. Copy the form of the last entry. Commit by path, push, then tell the live launcher HUB with SendMessage to its "HUB hh:mm" name. A chat's question for the owner goes to the owner in the chat's own words, with its default.

8. Waking the build tracks. CORE and SCREENS are paused in the launcher under R-H-56 until an owner line asks for work: 'continue v3.3', the walk's findings, or I6. File the line and tell the HUB; the HUB lifts the pause. If no launcher HUB is live, or the pause is still on ten minutes after your message, run `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --resume-track <TRACK>` yourself under R-O-7 and tell the HUB. One catch: the status word of SCREENS is WAITING-OWNER, which the launcher reads as a stop word. After `--resume-track SCREENS` nothing starts for it until the HUB changes that STATE line, or the owner starts the chat by hand with the prompt of section 9 of the Word document. That start is the owner's: never print that section in this chat. After a pause is lifted, the fresh chat starts at the first check that finds no chat of the track reading live. An idle chat of the track that still has a process reads live for 30 minutes after each hourly renewal of its transcript file, so that check can be most of an hour away unless the HUB first ends those chats (`claude stop <id>`, R-O-7; the HUB's call). The work named toward offline-v3.3: FIX-STALE-SAVE-SAY, FIX-SOS-FOCUS, the C1 Back path, V-10b, the owner's walk findings.

9. Reports. Every 30 minutes, and at once at a merge, a tag, a red by name or a question for the owner (R-O-3). A report says: the time, the trunk tip, what merged, what runs, the reds by name, the questions with their defaults, and what is needed from the owner. Between reports stay quiet: use a small polling script under the Monitor tool that wakes you on a change, not a loop of steps. Give the script its own end (it exits by itself after about 35 minutes; start the next one after each report) and stop the old watch before you start a new one, because a watch script keeps running after its watch and its chat have ended.

10. The remit. You are the owner's interactive window: you file the owner's words in outbox-OWNER.md with the stamp, relay status, route the owner's walk findings to lanes by outbox, send builds with SendUserFile, and keep the owner's part moving. You merge only if no launcher HUB is live (check ListAgents or `claude agents --json` for a live "HUB hh:mm" first; one HUB at a time), using <docs>/PLAN.md section 8 and merge_lane.py (prepare, conflicts, guards, commit, finish; "merge(offline): <lane> READY|READY-SLICE <tip7>"). You never edit .claude/settings.json, never build a unit, never touch main, origin/main, the claude/* branches, docs/PLAN.md, docs/BUILD-GUIDE.md, docs/decisions/0001 to 0021, docs/book/, docs/program/, scripts/, data/, the pharma program or its launcher (kriya-hub). Commit only by path: `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <this chat's session link or id> -m "docs(HUB, <date>): ..." <paths>`. The tool stages only the named paths and writes the two trailers itself. Push build/offline-v1, lane branches and tags only. Never `git add -A`; never force-push, rebase, stash or check out over uncommitted work. The launcher's lines (--start, --stop, --restart, --resume, --launch-missing, --pause-track, --resume-track) and `claude stop <id>` of a dead chat of this program are allowed under R-O-7. When the owner asks for the build, send offline/1-addic.html with SendUserFile: `offline/1-addic.html` in the main folder (1213207 bytes) is the file at the tag `offline-v3.2`: no commit since the tag changed it.

11. Memory (<docs>/PLAN.md section 4). The machine is shared. Under 4.0 GB free nothing new starts and the newest run pauses at its next commit; a new run needs a memory row of 7.0 GB. `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --mem` prints the reading and writes nothing. When memory holds the build, tell the owner; close nothing yourself. 36 leftover watch loops of ended chats of this program were still running at the park, and the owner's window was not allowed to end them. The owner's window hand-over in the run record has the count, the filter and the one command. End them only on the owner's line 'end the leftover watch loops', with that one command, then count again. Never end a loop of another program.

12. The product house rules bind everything: SOS is never gated; nothing derived decreases; no streak resets, no shame line; no random rewards; no points for claimed sober days; nothing leaves the device; original words only, never the source book's text; crisis copy is marked for clinical review. Secrets and .env files are never committed.

13. Parking. When the owner says "park" or "day closed", or reads 98% weekly usage, do these nine steps in order (section 10 of the Word document has them in full): file the line; stop the loop (`--stop`), confirm "loop NOT RUNNING" and delete a leftover loop.pid; message the live chats to park; wait for their PARKED lines; append your hand-over to <docs>/tracks/HUB/RUN-RECORD.md under a heading that starts "## Owner's window hand-over" (never "## Resume here"); edit the PARK notes near the top of <docs>/owner-docs/build_resume_doc.py (print only that block, never the file whole) and run the generator; commit the four owner-docs files by path and push; send 1-addic-Resume-Prompt.docx with SendUserFile; confirm the final state.

14. Context. Over 250,000 tokens, write your hand-over under an "## Owner's window hand-over" heading in the HUB's run record, commit and push. At 300,000, tell the owner to open a fresh window with this same prompt, and stop. You write STATE: RESTART on status-HUB.md only as the forced launch of step 4, never while a launcher HUB is live.
```

<!-- pagebreak -->

## 3 What is needed from you

Nothing here blocks the start. Each item has a fallback, so the build never waits on a guess.

| # | The item | What to send | If you send nothing |
|---|---|---|---|
| 1 | The walk of `offline-v3.2` | Use the app file on your phone and on your computer. Send what you find in one message. `send me the app file` makes the chat send it. | The fixes already named are built. The walk's findings wait for a later tag. |
| 2 | I6: the India crisis numbers | The numbers you have confirmed, each with its source and the date you checked it. | Every number keeps the words "please verify", and the unit V-10b waits. |
| 3 | The word to build | `continue v3.3` | The build tracks stay paused. Nothing spends usage. |
| 4 | The usage reading | The weekly percentage from `/usage` and its reset time, when the chat asks. Say `park` at 98%. | The chat cannot see the limit, so a chat can stop mid-step when the limit is reached. |
| 5 | ES1 | Only if you want it back: `reverse ES1`. In discreet mode the line 'If you are in danger, call your local emergency number' no longer shows while the app loads. It stood under the 'Notebook' title for up to 4 seconds and gave the app away. | The change stays (R-H-51). |
| 6 | V-Q8: the clinical reader | Who reads `CLINICAL-REVIEW-PACK.md`, and by when. | No safety copy changes. Crisis copy stays marked for clinical review. |
| 7 | O-Q1, for the online app only | Is SOS open before sign-up? | The default stands: yes. Nothing changes in the offline edition. |

> [!NOTE]
> **The board's own line for you, read live** (`coordination/SPRINT-BOARD.md`, NEEDS YOU): (tomorrow, one line each, in your fresh window after it runs --start and --launch-missing; they are filed as R-O-11 onward): (1) the walk of offline-v3.2 (offline/1-addic.html at the tag; build fresh with npm run build), the findings in one message; (2) I6, the India crisis numbers, for content V-10b; (3) 'continue v3.3' to wake the build tracks for the three named LOW fixes; (4) your /usage reading and its reset time; (5) ES1, a default you may reverse: in discreet mode the emergency line no longer shows while the app loads; say 'reverse ES1' to put it back; (6) V-Q8, who reads the clinical-review pack and when; (7) O-Q1, SOS open before sign-up (default yes). Tonight nothing is needed from you: the resume document is your starting point tomorrow.

<!-- pagebreak -->

# Part B · The hand-over

## 4 Where we stopped

**Why it is parked:** the owner closed the day. R-O-10, 21:00 IST: "We are going to resume work tomorrow, prepare complete handover details. Then give me a resume prompt and steps in a word doc."

| Time (IST), 11 November 2026 | What happened |
|---|---|
| 21:00 | The owner's line arrives in the owner's window. |
| 21:07 | Filed as R-O-10 in coordination/outbox-OWNER.md (commits d74d521 and 084924c), pushed. |
| 21:09 | The launcher loop is stopped on the owner's word (`--stop`, pid 39876, 21:09:45). No fresh chat can start overnight. |
| 21:15 | The HUB chat (HUB 04:36, session d608716f) parks at a clean point: STATE PARKED on status-HUB.md, its Resume here in tracks/HUB/RUN-RECORD.md, the board, R-H-57; commit fbc6d7d, pushed. No run was live and no merge was open, so nothing was paused or aborted. |
| 21:30 on | The owner's window checks the launcher's rules against tomorrow's start (a read-only simulation of its decision for each track). |
| 21:59 | A leftover `loop.pid` file (it held 39876, the stopped loop's number) is found in the launcher's state folder and removed. Left in place it could have blocked tomorrow's `--start` (section 6.5). |
| 22:10 on | The owner's window writes its hand-over under the HUB's Resume here, renders this document, pushes everything and sends the Word file. |
| 22:17 | The parked HUB chat's process ends, an hour after its last step. `claude agents` no longer lists it. |
| 22:55 | The owner's window finds why a chat that only waits can still read live to the launcher: every open chat's transcript file is renewed about once an hour (section 6.2). |
| 23:03 | 36 leftover watch loops of three ended chats of this program are found still running (section 4.7). The owner's window asks to end them at 23:10; its permission mode declines, so they are left as found. |

**The state, read live.** Rendered **2026-11-11 23:32 IST**. The trunk is `build/offline-v1` at `b99f5e02` (`b99f5e0 docs(HUB, 2026-11-11): the owner's window hand-over on R-O-10 (23:30): the park, how tomorrow starts, the hourly renewal that makes an idle open chat read live, the forced launch, 36 leftov...`). Pushed: yes, origin/build/offline-v1 is at the same tip (as last fetched). Lane merges recorded on status-HUB.md: 73. Uncommitted: 1 file(s), this document's own four files not counted: `M .claude/settings.json` (the owner's own file; the program never edits or commits it). The app file: `offline/1-addic.html` in the main folder (1213207 bytes) is the file at the tag `offline-v3.2`: no commit since the tag changed it.

**The tags.**

| Tag | Commit | Tagged | What it is |
|---|---|---|---|
| `offline-v1.0` | 45473b22 | 2026-11-07 11:40 | the 1-addic offline edition, first tag (2026-11-07) |
| `offline-v1.1` | f69bc68a | 2026-11-08 01:59 | the 1-addic offline edition, second tag (2026-11-08) |
| `offline-v3.0` | 60dffe33 | 2026-11-08 11:55 | the 1-addic offline edition, third tag (2026-11-08 11:55 IST) |
| `offline-v3.1` | 903016cc | 2026-11-09 18:15 | the offline edition, tier 2 complete (2026-11-09 IST) |
| `offline-v3.2` | c5dc3743 | 2026-11-09 20:44 | the offline edition of 1-addic, third edition's second fix tag (2026-11-09 IST) |

The gates at `offline-v3.2`: frozen at aac18546; the full gates GREEN by every name: build 1213207 B; Node 763/763 in 16 files; validate; guards 5/5; browser 32/32; docs.

**The last hand-over headings** in `tracks/HUB/RUN-RECORD.md`. A fresh HUB chat starts from the last "Resume here" heading and reads to the end of the file, so the owner's window hand-over below it is read too.

- The HUB's: Resume here (written 2026-11-11 21:15 IST by HUB 04:36, session d608716f, at the park on R-O-10: the program rests for the night; the owner resumes tomorrow)
- The owner's window's: Owner's window hand-over (2026-11-11 23:30 IST, session afc0ccd2, R-O-10: the day closed)

**The board, read live** (`coordination/SPRINT-BOARD.md`).

- STATE: PARKED for the night, TAGGED offline-v3.2 (2026-11-11 21:15 IST, HUB 04:36, on your R-O-10 of 21:00): the tag offline-v3.2 is on origin at c5dc3743 (9 Nov 20:44 IST), pushed with every lane branch; the full gates on the frozen trunk GREEN by every name (763 logic checks in 16 files; 32 browser flows; build, validate, guards, docs). The launcher loop is stopped (your window, 21:09); both build tracks stay paused; no run is live and no merge is in flight, so nothing was paused or aborted. The HUB chat parked at its clean point with its Resume here written; your window renders owner-docs/1-addic-Resume-Prompt.docx (the steps for tomorrow and the prompt to paste). Memory 6.7 GB.
- NEXT: (the HUB, tomorrow): started by the launcher from 'Resume here' (tracks/HUB/RUN-RECORD.md, 2026-11-11 21:15 IST); files your lines; on 'continue v3.3' or I6 resumes the track they need (--resume-track) and grants by the memory rows (one start per 7.0 GB row); merges the v3.3 fixes by name as they land (FIX-STALE-SAVE-SAY, FIX-SOS-FOCUS, the C1 Back path; content V-10b after I6), cut from c5dc3743; the board at every merge and every two hours.

### 4.1 The HUB (status-HUB.md)

| Line | Value (cut to about 300 characters) |
|---|---|
| STATE | PARKED   # 2026-11-11 21:15 IST: HUB 04:36 (d608716f, session 33) parks on R-O-10 (the owner, 21:00: work resumes tomorrow; a complete hand-over and a resume prompt with steps in a Word document). By R-O-9's procedure: the owner's window stopped the launcher loop 21:09:45 and renders owner-docs/1... |
| BASE-READY | 2026-11-07 07:15 655516dc |
| BASE | c5dc3743 (the trunk tip = TAG offline-v3.2, 2026-11-09 20:44 IST; fixes toward offline-v3.3 cut from the trunk tip at their start, merge base that tip; the tags offline-v3.1 903016cc, offline-v3.2 c5dc3743; lanes: tests-docs 69f2b72, actions-sos fb3966b, core 49c788f, content cd17758 (V-10b after... |
| TRACKS-ALLOWED | CORE SCREENS   # both tracks PAUSED in the launcher 2026-11-09 21:44:22 IST (--pause-track CORE, --pause-track SCREENS; R-H-56, the HUB's tooling call under R-O-7): after the tag offline-v3.2 the launcher relaunched idle chats hourly (V-14's 30-minute still rule) for nothing to do; nothing of eit... |
| MERGING | none   # 2026-11-09 20:46 IST: twenty-one merges on 9 Nov; seven after the tag offline-v3.1; TAG offline-v3.2 at c5dc3743 |
| MERGE-QUEUE | none; expected toward offline-v3.3 (R-H-55): core FIX-STALE-SAVE-SAY + FIX-SOS-FOCUS (flagged), actions-sos the C1 Back path (flagged), content V-10b after I6; the owner's findings from the walk |
| SLOTS-ALLOWED | 7 (2026-11-08 05:05 IST: the row 05:02 8.0 GB (five slots by the formula at 8.0; R-O-7): tests-docs 5, today-track 6, engine 2 (idle after V-40c; V-19 + V-30 tier 2 only when no tier 1 lane waits), content 4, core 1, actions-sos 3, game-tutorials 8 granted now. Every tier 1 lane has a slot; nothi... |
| OWNER | R-O-10 (2026-11-11 21:00, filed by the owner's window 21:14, read by the HUB 21:08): work resumes tomorrow; a complete hand-over and a resume prompt with steps in a Word document. The program parks tonight by R-O-9's procedure on the owner's line (no /usage reading came with it): the launcher loo... |
| RULING | R-H-49 (2026-11-09 16:01 IST): R-C-79's one named red on tests-docs READY dbc81e6 ('contrast: .coach-sos (dark)' 2.73:1, styles.css:566) is a real defect in game-tutorials' territory, not a test fault: SCREENS fixes it first as FIX-COACH-SOS by name within the hour (to 17:00), the HUB merges the... |
| UPDATED | 2026-11-11 21:15 IST |

### 4.2 CORE (status-CORE.md)

| Line | Value |
|---|---|
| STATE | WAITING   # 2026-11-09 21:46 IST: CORE 19 (8b2ee4e2-caf9-4c9c-9c48-fcfe5a9502c7). TAG offline-v3.2 at c5dc3743. The CORE track is paused in the launcher (R-H-56, 21:44). Nothing of CORE runs; nothing is owed. The offline-v3.3 LOWs wait for the owner's line (RUN-RECORD 'Resume here'). The word sta... |
| UPDATED | 2026-11-09 21:46 IST |

Lanes of CORE. The tip is `git rev-parse --short build/<lane>`; "pushed" compares it with origin as last fetched.

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
| core | MERGED 49c788f | 49c788f | yes | 2026-11-09 19:55 IST: FIX-IMPORT-MARK merged 82c5eddf (the HUB: build 1212699 B, store.test GREEN, validate, guards GREEN). RS1 LOW open, named FIX-STALE-SAVE-SAY, the HUB's call |
| engine | MERGED 97ac73a | 97ac73a | yes | 2026-11-08 10:56 IST: FIX-RS27 merged 0db0a9f7 (trunk c8b553ce; full Node suite 623/623, the trunk's one red closed). The engine's V3 units and fixes complete |
| actions-sos | MERGED fb3966b | fb3966b | yes | 2026-11-09 20:37 IST: FIX-AS-V32 merged aac18546, pushed (the HUB: build, actions.test 226/226, validate, guards GREEN, territory 0; full Node 763/763; the SOS, lock, PIN and SOBER flows 9/9, the SOBER flow's first run against SF1's hold). R-H-54: C1 and FIX-SOS-FOCUS LOW, named for v3.3; the dro... |
| learn | MERGED a494fa7 | a494fa7 | yes | 2026-11-09 15:36 IST: V-20 merged 95aac382 (HUB 15:45: build 1209510 B, learn.test 30/30, validate, guards 5/5, the lesson flow 1/1). The lane's V3 units complete. The suite has no checkpoint flow, so the two toasts stay unseen in a browser: named for offline-v3.2 |
| tests-docs | MERGED 69f2b72 | 69f2b72 | yes | 2026-11-09 20:44 IST: FIX-COUNTS-4 merged c5dc3743 (docs gate GREEN). TAG offline-v3.2 at c5dc3743, pushed 20:44:58 with every build/* branch |

### 4.3 SCREENS (status-SCREENS.md)

| Line | Value |
|---|---|
| STATE | WAITING-OWNER   # 2026-11-10 15:43 IST: SCREENS 16:08 (6f1291e1): nothing of SCREENS is running and no merge is open. Content V-10b waits for the owner's I6. The background watch on outbox-OWNER.md was stopped by Claude Code for low memory and is not restarted; the HUB files any answer there and... |
| UPDATED | 2026-11-10 15:43 IST |

Lanes of SCREENS:

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
| content | MERGED cd17758 | cd17758 | yes | FIX-MARKERS merged 3a0b2100 (HUB; build, 41/41, validate, guards GREEN). V-10b after I6 is the lane's one remaining unit; LOW C1 (content.test.mjs:381) goes with it or later |
| today-track | MERGED 670df19 | 670df19 | yes | V-43 with the round-1 fix merged at 91c81de2 (07:36, HUB 11; trunk fb6061b5; every gate green by name on the merged tree). The lane's V3 units are complete; fixes by name only |
| workbook-settings | MERGED b76d4f3 | b76d4f3 | yes | R-S-32 merged 526663bb (HUB; build, 27/27, validate, guards GREEN; the tour and Settings flows 4/4 on the merged tree). Fixes by name only |
| actions | MERGED 0977edd | 0977edd | yes | READY 0977edd merged 18:50 (49f1c1d4; U-22..U-25 in the trunk); complete; fixes by name only |
| game-tutorials | MERGED a3f0bf7 | a3f0bf7 | yes | FIX-COACH-SOS merged 18852152 (HUB 14:40; trunk eec5d862 with tests-docs on top; the contrast check green on the merged tree, 723/723). The lane's V3 units are complete |

### 4.4 The launcher

The launcher's own status (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status`, first 14 lines, read at render time). The track rows are those of its last check, not of now.

```
launcher: active; loop NOT RUNNING (python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start)
paused tracks: CORE, SCREENS
last check: 2026-11-11T21:07:36; free memory then 6.7 GB
  HUB: STATE WATCHING, UPDATED 2026-11-11 20:48, live 2, newest d608716f 132k -> nothing to do
  CORE: STATE WAITING, UPDATED 2026-11-09 21:46, live 1, newest 8b2ee4e2 164k -> nothing to do
  SCREENS: STATE WAITING-OWNER, UPDATED 2026-11-10 15:43, live 0, newest 6f1291e1 261k; at a stop -> nothing to do
  launched HUB 2026-11-09T16:12 ca715d55 (HUB 16:12) because HAND-OVER written (status RESTART, 2026-11-09 16:12); stepped
  launched HUB 2026-11-09T19:18 d9d055f4 (HUB 19:18) because HAND-OVER written (status RESTART, 2026-11-09 19:16); stepped
  launched HUB 2026-11-11T04:36 d608716f (HUB 04:36) because HAND-OVER written (status RESTART, 2026-11-11 04:36); stepped
  launched CORE 2026-11-09T16:24 7ccd92d4 (CORE 16:24) because HAND-OVER written (status RESTART, 2026-11-09 16:22); stepped
  launched CORE 2026-11-09T19:51 987cb3b4 (CORE 19:51) because HAND-OVER written (status RESTART, 2026-11-09 19:50); stepped
  launched CORE 2026-11-09T21:42 8b2ee4e2 (CORE 21:42) because NO CHAT live for CORE (last step 09 Nov 20:47); stepped
  launched SCREENS 2026-11-09T12:39 a3165ad8 (SCREENS 12:39) because NO CHAT live for SCREENS (last step 09 Nov 10:38); stepped
  launched SCREENS 2026-11-09T14:38 9c7e67fd (SCREENS 14:38) because NO CHAT live for SCREENS (last step 09 Nov 12:39); stepped
```

Read from it at render time:

- The loop: stopped. The loop is stopped and no `loop.pid` file is left behind (checked at render time).
- Tracks paused in the launcher: CORE, SCREENS.
- The last check: 2026-11-11T21:07:36 (144 minutes before this render).
- The last loop line of its log: `2026-11-11 21:09:45 | LOOP stopped on request (pid 39876); launched chats live on`
- No weekly-limit hold is on.

### 4.5 What was in flight

- No merge in flight (MERGING: none   # 2026-11-09 20:46 IST: twenty-one merges on 9 Nov; seven after the ta...).
- No lane line says BUILDING, CHECKING, REVIEWING, PAUSED, RED, READY or READY-SLICE: nothing was running.

### 4.6 The chats after the park

The chats of this folder on the park night, with how `claude agents` lists each. None of them needs anything at the start. A chat that still has a process reads live to the launcher for half of every hour (section 6.2).

| Chat | Session | Listed as | What it is |
|---|---|---|---|
| HUB 04:36 | d608716f | ended, no longer listed | The parked HUB chat. It marked its work done at 21:17 and its process ended at 22:17. A fresh HUB chat replaces it at the start. |
| CORE 21:42 | 8b2ee4e2 | background, idle | The last CORE chat. Its last step was on 9 November at 21:47, and its track is paused in the launcher. It still has a process, so it reads live for half of every hour (section 6.2). It needs nothing. |
| 1-Addic (hub) Fable Max builder 2 | afc0ccd2 | interactive | The owner's window of 7 to 11 November. It wrote this document. The launcher's roles file lists it as a HUB chat, so typing in it holds back a fresh HUB (section 6.3). While it stays open it also reads live for half of every hour (section 6.2). You can close it once you have this document. |
| 1-Addic Fable max planner | e4492b2a | interactive, idle | The planner's window. Not a build chat; the launcher does not count it. |
| HUB 12:09, CORE 11:10, SCREENS 11:07 | 2b59e0da, 80a57fa8, c26b6cc6 | background, idle | Chats of 8 November that still have a process. They do nothing, but the launcher reads each as live for half of every hour (section 6.2). The HUB may end them with `claude stop <id>`: R-O-7 allows it for a dead chat of this program, and the call is the HUB's. |
| Older rows named HUB, CORE or SCREENS | 42 rows | no status | Finished chats of earlier days with no process. They need nothing. |
| The pharma program's chats | other folders | not ours | Never touched by this program, nor its launcher (kriya-hub). |

**Memory on the park day.** On 11 November the memory rows of coordination/lane-widening.md read 5.0 to 6.7 GB free for most of the day, with dips to 3.3 to 3.9 GB (under the 4.0 GB floor) at 08:20 to 08:31, 18:27 and 19:28 to 19:38 while nothing of this build ran. The other programs on the machine are the main brake.

### 4.7 Leftover watch loops

A chat watches the status files with a small script that looks at them once a minute. When the watch ends, or its chat ends, the script's process keeps running. At 23:03 on the park night 36 such loops of three ended chats of this program were still running, with about 0.3 GB of memory between them. The owner's window asked to end them at 23:10 and its permission mode declined, so they still run.

| Loops | Script | The chat it belonged to | Running since |
|---|---|---|---|
| 33 | `watch.sh` | HUB 04:36 (d608716f) | 11 November: one was started about every 30 minutes, from 04:39 to 20:50 |
| 1 | `watch.sh` | HUB 18:52 (42f60331) | 7 November 19:00 |
| 2 | `board_watch.sh` and `board_watch2.sh` | CORE 01:56 (6c9dfc8f) | 8 November 02:00 and 02:20 |

The loops only read files. They change nothing and spend no usage, and nothing depends on them. They do hold memory, on a machine where a new run waits for a reading of 7.0 GB. Three ways to deal with them, whichever you prefer:

1. **Leave them.** Nothing breaks.
2. **Ask the chat.** Say `end the leftover watch loops` in the new owner's window, and approve the request if the app asks you.
3. **Do it yourself.** Paste this one line into a PowerShell window. It ends these loops and nothing else:

```
Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'bash.exe' -and $_.CommandLine -match 'jobs.(d608716f|6c9dfc8f|42f60331).tmp.(watch|board_watch|board_watch2)[.]sh' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

A restart of the computer clears them too. It also ends every open chat of every program, so do not restart for this alone.

Two other programs on this machine have loops of the same kind: the event-offline program 14 and the pharma program 1. They are not this program's to touch.

<!-- pagebreak -->

## 5 What remains (toward offline-v3.3)

The app is whole at `offline-v3.2`. What follows is small: fixes by name, then the same closing steps as every tag. **Done** means a `MERGED:` line of status-HUB.md names the unit on its lane. **Pending** means it is not merged yet.

| The unit | Lane | Track | Status | What it is |
|---|---|---|---|---|
| FIX-STALE-SAVE-SAY | core | CORE, flagged | Pending | With a PIN set and the app open in two tabs: after one tab imports data, a save in the other tab is refused, and the lock screen replaces the page before the refusal can be read. The entry is gone and nothing says so. The fix: say it (R-C-86, RS1). |
| FIX-SOS-FOCUS | core | CORE, flagged | Pending | Back then Forward between the SOS craving page and its from-the-lock-screen variant redraws the page without moving the keyboard focus, so a keyboard user can land on the page body (R-C-88). |
| The C1 Back path | actions-sos | CORE, flagged | Pending | A rare path leaves two '?from=lock' entries side by side in the browser history, so one Back press does nothing. The SOS button itself is unaffected (R-C-88, C1). |
| V-10b | content | SCREENS | Pending | The India crisis numbers in the app's content. It waits for the owner's input I6 (which numbers are confirmed); until then every number says "please verify". |
| The owner's walk findings | by the file's lane | routed by the owner's window | Pending | Whatever the owner's walk of the tagged file finds. Each finding goes by outbox to the lane that owns the file, with a default, and becomes a named fix. |

**Pending at render time:** FIX-STALE-SAVE-SAY, FIX-SOS-FOCUS, the C1 Back path, V-10b, the owner's walk findings.

**The closing steps**, once the named fixes are merged (the HUB's work):

| Step | What happens |
|---|---|
| FREEZE | no new unit starts after the last named fix is READY; fixes by name only |
| Full gates | the HUB runs every gate on the integration worktree at the trunk tip (the quiet window): python docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/_int --lane hub --full build test validate guards browser docs |
| Reds by name | every FAIL line is read by name against coordination/baselines.md; a red is fixed by its lane (by territory), then the gate runs again |
| Tag offline-v3.3 | git tag -a offline-v3.3 on the trunk in the main folder, then git push origin offline-v3.3; the hand-off note in tracks/HUB/RUN-RECORD.md |

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
| CORE | `WAITING` | yes | Held: the track is paused in the launcher. | `--resume-track CORE`: the HUB runs it at an owner line that asks for work. A fresh CORE chat starts at the first check that finds no CORE chat reading live (`NO CHAT live for CORE`, section 6.6). |
| SCREENS | `WAITING-OWNER` | yes | Held: the track is paused. And `WAITING-OWNER` is a stop word. | `--resume-track SCREENS` alone is not enough. The HUB changes the STATE line of status-SCREENS.md when there is work for the track, or the chat is started by hand (section 9). |

### 6.2 The rules behind it

- **A fresh chat for a track** starts when no chat of the track is live and the track's last step is at least 30 minutes old. `--launch-missing` drops the 30 minutes for one check.
- **A chat is live** when `claude agents` lists it, its process exists and its transcript was written in the last 30 minutes.
- **An open chat that only waits still reads live for half of every hour.** Its transcript file is renewed about once an hour with no step added, and the launcher counts the 30 minutes after that as live. Section 4.6 names the chats this applies to.
- **A status word that hands over** (RESTART, HANDOVER, HAND-OVER) starts a fresh chat "because HAND-OVER written", unless a newer chat of the track started after the UPDATED line.
- **A stop word** starts nothing: COMPLETE, COMPLETED, CLOSED, PAUSED, STOPPED, STOP, END, WAITING-OWNER, DONE, and READY for a build track.
- **Any other word** (PARKED, WATCHING, WAITING) starts a fresh chat "because NO CHAT live".
- **A build track** also needs the `BASE-READY` line and its name on the `TRACKS-ALLOWED` line of status-HUB.md.
- **Nothing starts** while a track is paused in the launcher, while free memory is under 4.0 GB, or while a weekly-limit hold is on.
- **The models:** the HUB runs on `claude-fable-5-1` (effort high), CORE and SCREENS on `claude-opus-5-5`.
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

**Third: the chat's name holds a track's name.** A session name with the capital word HUB, CORE or SCREENS counts for that track. A name such as `1-addic owner 12 Nov` is safe.

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

Both build tracks were paused in the launcher on 9 November (R-H-56), because a chat that only waits was relaunched about every hour and spent usage for nothing. The HUB lifts a pause with `--resume-track <TRACK>` when an owner line asks for work. What happens next depends on the track's status word:

- **CORE** (`WAITING`): a fresh CORE chat starts at the loop's first check that finds no CORE chat reading live.
- **SCREENS** (`WAITING-OWNER`): nothing starts, because the word is a stop word for the launcher. The HUB changes the STATE line of `status-SCREENS.md` when there is work for the track, or the chat is started by hand (section 9).

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

**The launcher** (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py ...`): a loop that checks every two minutes and starts a fresh chat when a track needs one. It starts the HUB on `claude-fable-5-1` (effort high) and CORE and SCREENS on `claude-opus-5-5`, each with its kickoff block from `KICKOFF-PROMPTS.md` plus a resume line. It relaunches a chat whose status file says `STATE: RESTART` (a chat hands over at 300k context) or that has no live session for 30 minutes, unless the track's status word is a stop word or the track is paused (section 6.2). It never launches under 4.0 GB free. Its state and log live in `%LOCALAPPDATA%\1-addic-hub\launcher\`. Commands:

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

**The commit discipline:** `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <session link> -m "docs(HUB, <date>): ..." <paths>` from the main folder. It stages and commits only the paths named and adds the two trailers (`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and `Claude-Session: <link>`). Never `git add -A`; never force-push, rebase, stash or check out over uncommitted work; only the HUB (or the owner's window when no launcher HUB is live) pushes, and only `build/offline-v1`, the lane branches and the tags.

<!-- pagebreak -->

## 8 The decisions in force

**The owner's words** (every R-O heading of `coordination/outbox-OWNER.md`, quoted whole; 10 so far; the next number is R-O-11):

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

**The HUB's rulings still in force** (`coordination/outbox-HUB.md` has each one whole):

| Ruling | What it says |
|---|---|
| R-H-51 | ES1. In discreet mode the line 'If you are in danger, call your local emergency number' no longer shows while the app loads: it appeared under the 'Notebook' title for up to 4 seconds and gave the app away. The SOS button and every help page are unchanged. The owner may say 'reverse ES1'. |
| R-H-53 and R-H-55 | After a tag only fixes by name are built. Each fix lane is cut from the trunk tip at its start. One run starts per 7.0 GB memory row across both tracks; under 4.0 GB free the newest run pauses first. The flagged lanes core and actions-sos need two reviewers. |
| R-H-56 | Both build tracks are paused in the launcher since 9 November 21:44 IST, because a waiting chat was relaunched about every hour for nothing to do. The HUB lifts a pause (`--resume-track <TRACK>`) at an owner line that asks for work: I6, the walk's findings or 'continue v3.3'. |
| R-H-57 | The park of 11 November 21:15 IST on R-O-10: nothing live, nothing aborted, the tag offline-v3.2 stands; the HUB's Resume here says how the HUB starts again. |

**The V3 defaults** (PLAN-V3.md sections 5 and 7; the owner's R-O-7 took V-Q1 to V-Q13 at their defaults):

- The V3 line is tagged `offline-v3.x` (V-Q1). The tags so far: offline-v1.0, offline-v1.1, offline-v3.0, offline-v3.1, offline-v3.2. The next is `offline-v3.3`.
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
ultracode. You are the CORE chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 1 · CORE" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-CORE.md and tracks/CORE/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked on 11 November 2026 (the day closed, the owner's R-O-10) and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: core MERGED 49c788f; engine MERGED 97ac73a; actions-sos MERGED fb3966b; learn MERGED a494fa7; tests-docs MERGED 69f2b72.
```

**SCREENS** (lanes content, today-track, workbook-settings, actions, game-tutorials):

```
ultracode. You are the SCREENS chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 2 · SCREENS" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-SCREENS.md and tracks/SCREENS/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked on 11 November 2026 (the day closed, the owner's R-O-10) and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: content MERGED cd17758; today-track MERGED 670df19; workbook-settings MERGED b76d4f3; actions MERGED 0977edd; game-tutorials MERGED a3f0bf7.
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
> **To resume:** open Claude Code in `C:\Users\ruchi\1-addic`, start a new chat named `1-addic owner 12 Nov`, paste the prompt of section 2 and let the chat start the launcher. Then send `continue v3.3`, your walk's findings or I6 when you are ready. Everything the program needs is in the pushed branches and in this document.
