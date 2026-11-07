TRACK: CORE
STATE: BUILDING   # 2026-11-07 16:43 IST: learn READY 4f5832f and engine READY 57153d3 (FIX-RS4); two runs live: actions-sos FIX-R4 wf_157ff262-161, core FIX-V11 wf_37a1972d-79e
LANE: core BUILDING 957f333   # 2026-11-07 16:42 IST: MERGED lane, fix round by name FIX-V11 (R-S-6 high contrast on every render; RC12, RS18 follow-ups) run wf_37a1972d-79e slot 1 (granted 16:42); checker and both reviewers over 957f333...HEAD; was MERGED 957f333 (15:29, d4eed2a)
LANE: engine READY 57153d3   # 2026-11-07 16:43 IST: FIX-RS4 (R-S-4 1-2) run wf_c2c0444c-8dc: 57153d3 test-only, engine-data.test.mjs (delete c.exercises before the 'waits' half; '#/exercise/quick-reasons' known, '#/exercise/not-one' unknown when Content.exercises exists); check PASS; test GREEN 102/102 in 4 files on the branch (_logs/gates/engine/test-20261107-164216.log) and engine-data 15/15 against the trunk 9b319256's content (_logs/reports/engine/engine__FIX-RS4.trunk.log); report lane-reports/engine.md (15265 B); cut base 655516dc; lifts the baselined names engine-data :243 and :266
LANE: actions-sos REVIEWING 1131827   # 2026-11-07 16:21 IST: FIX-R4 run wf_157ff262-161 (start review, carried check PASS at 1131827, carried safety findings RS24 HIGH, RS25-RS26 MEDIUM, RS27-RS28 LOW; rulings contracts/actions-sos.md 16:17); journal C:/Users/ruchi/.claude-pro/projects/C--Users-ruchi-1-addic/06285082-1542-4c84-9b2f-a2d27df214fe/subagents/workflows/wf_157ff262-161/journal.jsonl; READY only when every id is FIXED and no new HIGH or MEDIUM
LANE: learn READY 4f5832f   # 2026-11-07 16:43 IST: FIX-RS4 (R-S-4 3) run wf_f4494348-6f1: 4f5832f test-only, 1 line of learn.test.mjs (open 'not-an-exercise'); check PASS; test GREEN 28/28 on the branch (_logs/gates/learn/test-20261107-164039.log) and 28/28 against the trunk 9b319256's content (_logs/reports/learn/learn__FIX-RS4.trunk.log); guards RED by count on the branch only because a 655516dc branch has no build (as at its 10:48 READY); report lane-reports/learn.md (13019 B); cut base 655516dc; lifts the baselined name learn.test.mjs :265
LANE: tests-docs MERGED   # tier 1 done (d91164d merged as f3775f1a); U-35, U-36b are tier 2 (after the SCREENS tier-1 merges)
SLOTS-ASKED: 4   # all four granted and running: actions-sos slot 3 (FIX-R4), engine slot 2 and learn slot 9 (FIX-RS4, R-H-21), core slot 1 (FIX-V11, R-H-23)
UPDATED: 2026-11-07 16:43 IST

# 2026-11-07 16:39 IST · R-H-21 and R-S-4..6: engine and learn test fixes running; core FIX-V11 asked

- R-H-21 (16:33): content U-31a merged (trunk 9b319256); three CORE test names red on the merged tree and baselined by the HUB (engine-data :243, :266; learn :265). Launched 16:36: engine FIX-RS4 wf_c2c0444c-8dc, learn FIX-RS4 wf_f4494348-6f1 (args C:/Users/ruchi/.claude-pro/jobs/06285082/tmp/args_<lane>_rs4.json; base 655516dc, diffFrom the merged tips; wf_sim OK).
- R-S-4 actions-sos part: no change needed (ui-onboarding.js lineList reads `.text`). R-S-6: core FIX-V11 asked (R-C-22); the Settings hooks are tests-docs', after actions-sos merges.

# 2026-11-07 16:21 IST · CORE session 06285082 resumes; actions-sos FIX-R4 launched

- Read: this file, tracks/CORE/RUN-RECORD.md 'Resume here', status-HUB.md (BASE 1ef2482e; SLOTS actions-sos slot=3 held; QUIET done; SCREENS running content, today-track, workbook-settings), the actions-sos contract's last section (rulings 16:17), lane.js header.
- `claude agents --json` 16:19: 036d08b8 listed idle, state done (no live runs); HUB ed0e0a4b busy; SCREENS 6721d28e busy. actions-sos worktree clean at 1131827. Free memory 15.2 GB at 16:20.
- 16:20 launched FIX-R4 wf_157ff262-161 (args C:/Users/ruchi/.claude-pro/jobs/06285082/tmp/args_as_r4.json: 036d08b8's args_as_r4.json with session and trailer 06285082 and now 16:20; wf_sim passes but the advisory 12.8 KB prompt size, as before).

# 2026-11-07 14:47 IST · the owner's R-O-2; the launcher is active

- R-O-2 (outbox-OWNER.md, 14:38): the owner agrees with the defaults; O1-O9 and Q10-Q13 are the owner's decision. Nothing changes for the CORE lanes or their briefs (they build the defaults already). Relayed by the first HUB session (26196777): the launcher is active and the build continues to the complete edition; a fresh CORE follows a RESTART line within about two minutes. Priority unchanged: core READY, actions-sos READY, engine READY, each merged by the HUB as it lands.
- Runs live: core wf_019fc9eb-a81, actions-sos wf_b38141d2-651, engine wf_1a61a797-f39. Memory row 14:41 5.0 GB (above the floor; engine, the newest, pauses at its next commit under 4.0).

# 2026-11-07 13:52 IST · CORE session 036d08b8 resumes

- Read: this file, tracks/CORE/RUN-RECORD.md 'Resume here', status-HUB.md (BASE f9de7023; SLOTS: core PAUSE since 13:10, engine PAUSED, actions-sos no run; resume needs a row with 7.0 GB free and a live CORE), outbox-HUB.md to R-H-13, lane.js header and its build/review/state code.
- `claude agents --json` 13:44: 06ee0d0d listed idle (state blocked) with none of its runs alive (all returned before its RESTART at 13:41); HUB ed0e0a4b busy. Nothing to relaunch; the three worktrees (core bda0f0f, actions-sos fc0d038, engine 6cb722e) are clean.
- Free memory 6.3 GB at 13:44 (rows 13:28 4.1, 13:38 5.0). Nothing starts until the HUB grants a slot. R-C-15 to the HUB.

# 2026-11-07 10:45 IST · 224074c0's runs died at 10:37; four runs relaunched; the review findings that never reached the fix rounds

- 10:37 the watcher saw 224074c0 leave `claude agents` (10:38 confirmed: not listed). Its runs died: core and actions-sos at the reviewers' re-checks (no result), learn's builder after its commit 19f373c (U-13, U-14), engine's builder with U-06 uncommitted in the worktree (kept, never discarded).
- The review fix rounds of both flagged lanes saw only the first 2,000 characters of the findings (lane.js findingsText cuts there and points at the reviewers' notes files, which the reviewers never wrote). Never fixed: core RC5-RC7, RC9, RS5-RS8; actions-sos RS2 (HIGH: the typed-text crisis check misses 'don't want to live', 'can't go on', 'end it' and more), RS3-RS9, RC10. Their full text: C:/Users/ruchi/1-addic-wt/_logs/reports/<lane>/<lane>__review-open.md; the chat's rulings on each and on every reviewer question: the last section ('rulings 2026-11-07 10:45') of tracks/CORE/contracts/core.md, actions-sos.md and engine.md.
- Relaunched 10:43 (args in C:/Users/ruchi/.claude-pro/jobs/06ee0d0d/tmp/args_<lane>.json): core wf_bf29c997-958 (batches FIX-SAFETY, FIX-RULINGS; check over 98f872d..HEAD; both reviewers over base...HEAD with knownFindings); actions-sos wf_0a47dae7-ba9 (FIX-SAFETY-AS, FIX-ONB-EMO; check over c629cae..HEAD; both reviewers); learn wf_c538e4c5-38a (start check over a499dae..HEAD); engine wf_35f6a75a-d62 (resumes U-06; stopped at its next commit per the HUB's 10:42 pause).
- Neither flagged lane can be READY by the FREEZE 10:55: U-04 and U-10/U-11 come in as fixes by name if the HUB takes them before the tag, else offline-v1.1. R-C-12 to the HUB, R-C-13 to SCREENS.

# 2026-11-07 10:33 IST · CORE session 06ee0d0d resumes

- Read: this file, tracks/CORE/RUN-RECORD.md 'Resume here', status-HUB.md (BASE f3775f1a, SLOTS-ALLOWED 5, all five CORE lanes granted, QUIET no, FREEZE 10:55, QUIET 10:55-11:40), outbox-HUB.md to R-H-9, outbox-CORE.md to R-C-11, lane.js header.
- `claude agents --json` at 10:31 lists 224074c0 ('CORE 08:58', busy): its runs live on and are not relaunched. Journals at 10:31: core wf_6b7ddbb3-2a7 and actions-sos wf_379c12ed-2e4 at the two re-checks; learn wf_7e30a83f-8e5 builder (branch 19f373c, U-13 + U-14 committed); engine wf_f39915b9-3a4 builder on [U-06, U-07] (branch 3ed6e1d, C1 committed; tree has work in progress).
- A watcher reads the four journals, the board and the session list every 30 s; if 224074c0 leaves the list, each run is relaunched from its branch as RUN-RECORD 'Resume here' says.

# 2026-11-07 09:12 IST · the old session's runs died; both lanes relaunched

- 09:03 session a29cd9a2 left `claude agents --json` (pid 18548 gone): its runs wf_20fa36d0-f20 (core, in its check fix round) and wf_5187f402-d73 (actions-sos, first builder) died with it. Nothing uncommitted in either worktree (core at 06cdf34, actions-sos at 0699730).
- 09:10 relaunched on the same slots (1, 3) with done and priorNote from the branches: core wf_6b7ddbb3-2a7 (done U-01..U-04, diffFrom 06cdf34, batch FIX-C4-C5 = check C4 reload-and-unlock proof of replaceAll keeping the lock row, C5 discreet flag readable while locked: localStorage '1-addic:discreet' and UI.applyDiscreet); actions-sos wf_379c12ed-2e4 (done U-09, diffFrom 1cb96a3, U-10 and U-11; laneNote adds the real Store shape at build/core 06cdf34).
- U-04's Store additions and the C5 ruling are in tracks/CORE/contracts/core.md (last section). R-C-7 to the HUB, R-C-8 to SCREENS.

# 2026-11-07 09:02 IST · CORE session 224074c0 resumes

- Read: this file, tracks/CORE/RUN-RECORD.md 'Resume here', status-HUB.md (BASE 22c39654, SLOTS-ALLOWED 2, core and actions-sos running, engine PAUSED, learn HELD, tests-docs WAITING, QUIET no), the outboxes (R-H-1..7, R-C-1..6, R-O-1: defaults in force), status-SCREENS.md (not started), lane.js header.
- `claude agents --json` at 09:00 lists a29cd9a2 ('CORE 07:15', busy): its runs live on. core wf_20fa36d0-f20: builder returned F1 4112ca4, F2 36a2fbf, U-04 06cdf34; check FIX (C4 MEDIUM store.test.mjs:804-831 must reload and unlock('2468') after replaceAll; C5); fix agent running. actions-sos wf_5187f402-d73: builder U-10+U-11 running. This chat writes the LANE lines from the journals' report lines.

# 2026-11-07 07:23 · the CORE chat's first steps (session a29cd9a2)

- Read: PLAN.md 1, 2, 5-7, 9; status-HUB.md (BASE 655516dc, SLOTS-ALLOWED 4, four slots granted 07:15, QUIET no); outbox-OWNER.md (O1-O9, Q10-Q13 pending, defaults at 08:25); this file; RUN-RECORD.md; lane.js header and scout path; lane_args.json _readme and the five CORE lanes; territory.json rows; overlap-register.md; BUILD-PLAN.md 2 and 3.1-3.3.
- SLOTS-ASKED 5: the four granted plus tests-docs (tier 1: U-34, U-37, U-36a), which also waits for core's U-01 merged.
- The CORE chat's word given to every scout (and later builders), so the shapes stay one: (1) core U-01 writes package.json scripts.build and scripts.test (every offline/tests/*.test.mjs except browser.test.mjs) with tests-docs' go-ahead; engine never edits package.json (U-08 proves npm test runs its tests); no "type":"module". (2) build.mjs pre-lists every part file of BUILD-PLAN 3.1 and of the SCREENS lanes in 3.1's order and skips an absent file by name, so most lanes never touch build.mjs. (3) A Node test loads a real module by path when it exists and an in-file stand-in when absent (the switch to the real code happens on the merged trunk without merging the trunk into a lane); stand-ins never in offline/tests/helpers/. (4) core's order is the kickoff's: U-01, then [U-03, U-02], then U-04 alone (encryption).

# 2026-11-07 07:28 IST · the scouts are back; two slices running

- Briefs and contracts: tracks/CORE/briefs/<lane>.md (core 13.6 KB, engine 14.9, actions-sos 11.7, learn 10.8, tests-docs 13.7), a note per unit in briefs/<lane>/<unit>.md, contracts in tracks/CORE/contracts/<lane>.md. The DOM ids, UI.form spec, Store.lock.onLock and the LOCKED error code in contracts/core.md are fixed as of 07:26 (other lanes build on them; changes by outbox).
- Questions answered by the chat (defaults, in the run args): core's batches [[U-01],[U-03,U-02],[U-04]]; counters.total counts completed dates and a banked date stays counted; validateContent skips the tryIt-exercise check while Content.exercises is absent; SkillUsed.helpful has one encoding in engine's contract; tests-docs may npm install the pinned playwright in its worktree (dev time only; the app makes no network call).

# 2026-11-07 07:42 · from the HUB · core 8bf7b5c merged

- core READY-SLICE 8bf7b5c (U-01) merged into the trunk as 7eaf7f4; trunk fde4bbbd pushed with build/core. Gates on the merged tree: build GREEN (103409 B), test and validate SKIP, guards GREEN by name (the 15 screen-lane tour-target names are baselined in coordination/baselines.md until the screens land; core's own targets pass). Territory clean. BASE on status-HUB.md is now fde4bbbd (new cuts only; your lanes stay on their branches). engine 04fc0c1 is in the merge now. tests-docs may ask for its slot: U-01 is merged.

# 2026-11-07 07:46 · from the HUB · engine 04fc0c1 merged; the slots wait for memory

- engine READY-SLICE 04fc0c1 (U-05) merged as 6089dad; trunk 33d2a04f pushed with build/engine. Gates on the merged tree: build GREEN (127289 B), test GREEN (logic.test.mjs), validate SKIP (U-08), guards GREEN by name, territory 0 errors. BASE is 33d2a04f for new cuts.
- Free memory 5.6 GB at 07:46, above the 4.0 GB floor: engine stays paused, tests-docs's slot (asked 07:42) is recorded on status-HUB.md as WAITING, actions-sos and learn stay HELD. Order when memory returns (about 7 GB free, re-sampled every ten minutes, by hand in between): actions-sos U-09, engine's next run, tests-docs U-34, learn U-12. core's second slice runs on.

# 2026-11-07 08:21 · from the HUB · core 4a43190 merged; actions-sos granted

- core READY-SLICE 4a43190 (U-03, U-02) merged as 063b261; trunk 68371bb5 pushed with build/core. Gates on the merged tree: build GREEN (187464 B), test GREEN (store.test.mjs), validate SKIP (U-08), guards GREEN by name, territory 0 errors. The only conflict was the generated 1-addic.html, rebuilt by the HUB from the merged sources. BASE is 68371bb5 for new cuts.
- SLOTS: actions-sos slot=3 granted 08:21: start U-09 now (its worktree at 655516dc stays; the real engine.js and ui-core.js are on the trunk). engine stays paused; learn and tests-docs wait for the next memory rows (a third lane at 7.0 GB free with two running).
- Your hand-over: when core's final run returns, as you plan. If the fresh CORE finds a run gone with the old session, it relaunches that lane with done and priorNote from the branch, never waits for it.

# 2026-11-07 08:50 · from the HUB · actions-sos 1cb96a3 merged; actions-sos pauses at its next commit

- actions-sos READY-SLICE 1cb96a3 (U-09) merged as 7a9547c; trunk 22c39654 pushed with build/actions-sos. Gates on the merged tree: build GREEN (240874 B), test GREEN (actions.test.mjs with the real engine.js), validate SKIP (U-08), guards GREEN by name, territory 0 errors. BASE is 22c39654 for new cuts.
- Free memory 2.2 GB at 08:49, under the 4.0 GB floor, with two runs live: actions-sos (the newest lane) pauses at its next commit: let its builder commit what is done of U-10 with the hand-off note, then no new unit until the SLOTS line says granted again. core's final run (U-04) continues. The pause lifts when a row shows room (about 7 GB free with core running).
- R-C-5 noted: the replaceAll-keeps-the-lock-row rule is core's to prove in U-04's tip or by a fix by name before its final READY.

# 2026-11-07 09:57 · from the HUB · tests-docs 310780d merged; the HUB hands over

- tests-docs READY-SLICE 310780d (U-34) merged; trunk 2da0caa4 pushed with build/tests-docs. Gates on the merged tree: build GREEN (240874 B), test GREEN (harness.test.mjs), validate SKIP (U-08), guards GREEN by name, territory 0 errors, package.json merged by key owner. BASE is 2da0caa4 for new cuts.
- HUB session 874b2463 hands over now (context over 250k, nothing running, queue empty); the launcher starts the fresh HUB, which merges the next READY lines. Keep writing READY / READY-SLICE with the tip as before; the FREEZE is 10:55: what is on your status file by then enters the tag.

# 2026-11-07 10:20 · from the HUB · learn a499dae merged

- learn READY-SLICE a499dae (U-12) merged as 4618e43c at 10:18; trunk 4618e43c pushed with build/learn. Gates on the merged tree: build GREEN (298714 B), test GREEN (learn.test.mjs), validate SKIP (U-08), guards GREEN by name, territory 0 errors. BASE is 4618e43c for new cuts; learn stays on its branch (no rebase).
- FREEZE 10:55: what is READY or READY-SLICE on this file by then enters the tag, plus fixes by name. Keep the tips on the LANE lines.

# 2026-11-07 10:23 · from the HUB · engine granted again: resume [U-06,U-07],[U-08]

- Free memory 10.8 GB at 10:21 with four runs live: engine's pause lifts. Relaunch engine from 04fc0c1 with done [U-05] (first the check fix C1 helpfulValue by name), batches [U-06,U-07],[U-08]. Its units land after the FREEZE 10:55 and go to offline-v1.1; nothing heavy during the QUIET window 10:55-11:40 (Node tests on its own branch are fine; no browser suite). Pauses at its next commit if a row goes under 4.0 GB.

# 2026-11-07 10:27 · from the HUB · tests-docs d91164d merged (tier 1 complete)

- tests-docs READY d91164d (U-34 fixes, U-37, U-36a) merged as f3775f1a; trunk f3775f1a pushed with build/tests-docs. Gates on the merged tree: build GREEN (298714 B), test GREEN, validate SKIP (U-08), guards GREEN by name, docs GREEN (exit 0, the .docx reproducible, tree clean), territory 0 errors. BASE is f3775f1a for new cuts.
- tests-docs's tier 2 (U-35 screenshots, U-36b guide Part 3) waits for the SCREENS tier-1 merges, as its line says: nothing more from it before the tag. FREEZE 10:55: core and actions-sos READY lines by then enter the tag.

# 2026-11-07 10:42 · from the HUB · 3.6 GB free: engine pauses at its next commit

- Free memory 3.6 GB at 10:41 (the machine reaped the HUB's idle background shells for memory). PLAN.md section 4: the newest lane pauses at its next commit, that is engine (granted again 10:23): let its builder commit what is done of U-06/U-07 with the hand-off note, then nothing new on engine until its SLOTS line says granted (after the tag, at a row with 7.0 GB free). core, actions-sos and learn finish their current rounds. FREEZE 10:55 in 13 minutes: a core or actions-sos READY on this file by then enters the tag; QUIET 10:55-11:40: no lane runs the browser suite or anything heavy.

# 2026-11-07 10:51 · from the HUB · learn 19f373c merged; FREEZE 10:55

- learn READY 19f373c (U-13, U-14 and the C1, C2 fixes) merged as f9de7023 at 10:50; trunk f9de7023 pushed with build/learn. Gates on the merged tree: build GREEN (346637 B), test GREEN (learn.test.mjs), validate SKIP (U-08), guards GREEN by name, territory 0 errors. BASE is f9de7023.
- FREEZE 10:55: the tag holds U-01, U-03, U-02, U-05, U-09, U-34, U-37, U-36a, U-12, U-13, U-14. core U-04 and actions-sos U-10, U-11 go to offline-v1.1 as your R-C-12 says (rule 5: both reviewers before a flagged merge; RS2 open). Their READY lines, when they come, are merged into the trunk after the tag as the first of offline-v1.1. Until 11:40 the HUB runs the full suites on the trunk: no lane runs the browser suite or anything heavy; Node tests on a branch are fine. A fix by name to a merged unit (core U-01..U-03, engine U-05, actions-sos U-09, learn, tests-docs) still enters the tag if it is on a status file with its tip before 11:40.

# 2026-11-07 10:56 · from the HUB · R-C-14 answered (R-H-11): no tag-fix port

- No build/core-tagfix: the five fixes protect flows whose screens are not in the tag; they enter with core's READY after the tag as the first merge of offline-v1.1. Nothing new starts before the tag. Quiet gates on the trunk so far: build GREEN 346637 B, test GREEN 99/0 (4 files), validate SKIP (U-08), guards GREEN by name (the 15 baselined tour targets only); browser and docs running.

# 2026-11-07 11:43 · from the HUB · offline-v1.0 tagged at 45473b2; the day closes

- Tag offline-v1.0 at trunk 45473b2 pushed 11:40 (the quiet gates green by name on the same code). Your branches are pushed: core=cdfc0e9, engine=6cb722e, actions-sos=fca2781, learn=19f373c, tests-docs=d91164d. The HUB is at HANDOVER and the launcher is paused ("day closed"): finish the runs you have, commit by 45 minutes with hand-off notes, write READY with the tip when a lane is checked and reviewed; nothing merges until a HUB runs again (the owner starts the launcher). The merge order for offline-v1.1: core U-04 (with F1, F2, RC4, RS4, RS6), actions-sos U-10, U-11 (RS2 closed), engine U-06..U-08. The owner's walk findings reach you by outbox.

# 2026-11-07 15:31 · from the HUB · core 957f333 merged

- core READY 957f333 (U-04 and every review fix) merged into the trunk as d4eed2a; trunk c3559b32 pushed with build/core (bda0f0f..957f333). Gates on the merged tree: build GREEN (390318 B), test GREEN (80/80, store.test.mjs), validate SKIP (U-08), guards GREEN by name (the 15 baselined tour targets only), territory 0 errors. The generated 1-addic.html conflicted and was rebuilt by the HUB from the merged sources. BASE is c3559b32 for new cuts; actions-sos and engine stay on their branches (no rebase). The real Store is on the trunk now: actions-sos's tests that load store.js by path run against it on the merge.
- Next merges in the order their READY lines appear: actions-sos (both reviewers answered in its report), engine (READY-SLICE after U-07 welcome; the READY merge runs validate on the merged tree for the first time). Slot 1 is free; nothing new starts without a row at 7.0 GB free and a SLOTS line.

# 2026-11-07 15:36 · from the HUB · engine 227a07a merged

- engine READY 227a07a (U-06, U-07, U-08, the R-sample and R-outcome rulings) merged clean into the trunk as 1ef2482; trunk 1ef2482e pushed with build/engine (6cb722e..227a07a). Gates on the merged tree: build GREEN (451085 B), test GREEN (102/102, 4 files), validate GREEN (0 errors; its first run on the trunk), guards GREEN by name (the 15 baselined tour targets only), territory 0 errors. BASE is 1ef2482e for new cuts. core and engine are complete; actions-sos's READY is the next merge (its tests meet the real store.js and engine.js on the merged tree).


# 2026-11-07 16:42 · from the HUB · core FIX-V11 granted; the test fixes read as granted

- `SLOTS: core slot=1 granted again 16:42` (FIX-V11, flagged, both reviewers over the round's diff; READY with the tip; cut base 655516dc). engine slot 2 and learn slot 9 stand (R-H-21 was the grant); their READY lines lift the three baselined test names on merge. The 16:39 row: 13.8 GB free with six runs live; the pause rule stands (R-H-23).

# 2026-11-07 17:03 · from the HUB · learn 4f5832f and engine 57153d3 merged; names lifted (R-H-25)

- Both FIX-RS4 tips merged alone (cb0b427 16:45, 3720d119 16:47), GREEN by name; the full Node suite on the trunk 250/250; the three baselined test names lifted. engine and learn complete again. BASE 9f3026c6 after today-track and workbook-settings. Memory 6.8 GB at 17:02 with eight runs.
