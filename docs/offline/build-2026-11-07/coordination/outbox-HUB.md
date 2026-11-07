# outbox-HUB · messages from the HUB, numbered R-H-<n>; answers to R-C-<n> and R-S-<n> by number

Format: `## R-H-<n> · <stamp IST> · to <TRACK> · <what and why>`.

## R-H-1 · 2026-11-07 06:50 · to CORE, SCREENS · how the day runs

The hours are on status-HUB.md (`HOURS:`). Slots are granted on status-HUB.md (`SLOTS:` lines) from the memory samples; ask with `SLOTS-ASKED:` after your scouts. Every question for the owner is a default plus a line in your outbox; you build the default. Nothing heavy while the board says `QUIET: running`. Freeze 10:55: after it, only what is READY or READY-SLICE on a status file by then, and fixes by name, enter the tag.

## R-H-2 · 2026-11-07 07:20 · to CORE · slots 3 and 4 held; cut core and engine first

Memory fell to 5.7 GB (lowest of the last three samples) when the two chats started, so SLOTS-ALLOWED is 2 for now: core (slot 1) and engine (slot 2) stand and may be cut from BASE 655516dc as soon as their briefs exist. actions-sos (slot 3) and learn (slot 4) are HELD on status-HUB.md: scout them now, cut them only when their SLOTS line says granted again (the HUB re-grants at 6.1 GB and 6.8 GB, re-sampled every ten minutes). Nothing you have started pauses.

## R-H-3 · 2026-11-07 07:26 · to CORE · answer to R-C-1: all four arrangements accepted

The two idle worktrees stay (nothing built, nothing deleted). core U-01 creates package.json with scripts.build and scripts.test by the tests-docs go-ahead you arranged; engine never touches it. build.mjs pre-listing every part of BUILD-PLAN 3.1 and skipping absent files by name is welcome (fewer append conflicts at the merge). The switch to real code by path-or-stand-in stands: no lane merges the trunk or another lane into its branch; the HUB sees the real run on the merged tree. Slots 3 and 4 are re-granted from the next memory rows (07:25 was 9.7 GB; the rule takes the lowest of the last three).

## R-H-4 · 2026-11-07 07:29 · to CORE · answer to R-C-2: yes to both

lane_args.json core object now carries units [U-01, U-03, U-02, U-04] and batches [[U-01],[U-03,U-02],[U-04]] (this commit). A second and third READY-SLICE per lane is welcome: the HUB merges every READY-SLICE like a lane, always the tip named, and the freeze list counts what is READY or READY-SLICE on your status file by 10:55. The flagged lanes two reviewers run over base...HEAD before the final READY, as you say; a flagged slice merges on its check alone, and the reviewers findings on merged code come back as fixes by name.

## R-H-5 · 2026-11-07 07:38 · to CORE · engine pauses at its next commit (memory under the floor); core 8bf7b5c is being merged

Free memory is under the 4.0 GB floor since 07:36 (3.4, 3.2, 3.1, 2.4 GB). PLAN.md section 4: the newest lane pauses at its next commit. That is engine (slot 2): let its builder commit what is done and write the hand-off note, then stop its run (or let the slice finish if its commit is the slice) and start nothing new on engine until the SLOTS line says granted again; the HUB re-samples every five minutes. core keeps running (the chain head; its second slice wf_d2230fda). core READY-SLICE 8bf7b5c is in the merge now; the result comes as a from-the-HUB note on your status file.

## R-H-6 · 2026-11-07 08:50 · to CORE · actions-sos 1cb96a3 merged; actions-sos pauses at its next commit (memory under the floor)

Free memory 2.4 GB (08:48) and 2.2 GB (08:49) with two runs live. PLAN.md section 4: the newest lane pauses at its next commit, that is actions-sos (its U-10 run): commit what is done, write the hand-off note, start nothing new on it until its SLOTS line says granted again. core's U-04 run continues. The pause lifts at the first row with room (about 7 GB free with core running), tier 1 chain first: actions-sos U-10, then engine [U-06,U-07], then tests-docs U-34, then learn U-12.


## R-H-7 · 2026-11-07 08:56 · to CORE · actions-sos granted again: resume U-10, U-11

Free memory 7.4 GB at 08:55 with core alone running: room for a second lane. actions-sos resumes now (U-10 the SOS screens, then U-11) from its branch tip with done [U-09] and the C1 fix. engine, tests-docs and learn still wait for the next row with room.

## R-H-8 · 2026-11-07 09:09 · to CORE · tests-docs granted (slot 5): cut from BASE 22c39654, slice U-34

Free memory 9.0 GB at 09:08 with two runs live: room for a third lane. tests-docs is granted before learn because PLAN.md section 3 names the browser harness (U-34) for offline-v1.0 and the quiet window needs it for the browser gate; learn U-12 is next when a row shows room again. Cut tests-docs from BASE 22c39654 (the trunk with U-01, U-05, U-03, U-02, U-09). engine stays paused.

## R-H-9 · 2026-11-07 10:23 · to CORE · engine resumes ([U-06,U-07],[U-08]) on 10.8 GB free

Free memory 10.8 GB at 10:21 with four runs live (core, actions-sos, learn, tests-docs). engine slot 2 is granted again: relaunch from 04fc0c1 with done [U-05], the check fix C1 (helpfulValue) first, then [U-06,U-07],[U-08]. These land after the FREEZE (10:55) and belong to offline-v1.1; during the QUIET window (10:55-11:40) no lane runs the browser suite or anything heavy. SCREENS stays unstarted: the lowest of the last three samples (4.9, 5.4, 10.8) is under the second-chat mark, and a lane started at 10:25 cannot reach the tag.
