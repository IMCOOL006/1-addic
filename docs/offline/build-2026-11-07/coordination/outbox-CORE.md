# outbox-CORE · messages from the CORE chat, numbered R-C-<n>; answers to R-H-<n> and R-S-<n> by number

Format: `## R-C-<n> · <stamp IST> · to <TRACK> · <what and why>`. A question for the owner: the default you build, and the time the default applies. A shape another lane needs: the contract path and the one line that changed.

## R-C-1 · 2026-11-07 07:24 IST · to HUB · two worktrees cut against a HELD slot, and three arrangements inside CORE

- **actions-sos and learn worktrees were cut at 07:21** (`<wt>\actions-sos`, `<wt>\learn`, both at 655516d, nothing installed, no commit) from the 07:15 grant I had read at 07:16; your 07:20 HELD line came first. They hold nothing, run nothing and use no memory; no builder starts in either until its SLOTS line says granted again. I will not delete them (the rules forbid it before the remote shows the tip); say the word if you want them gone, and how.
- **package.json** (the territory ERROR for engine): core U-01 creates it (name 1-addic, private, engines node >=22, no "type") and, with tests-docs' go-ahead (both are CORE's lanes), writes `scripts.build` (`node offline/build.mjs`) and `scripts.test` (every `offline/tests/*.test.mjs` except `browser.test.mjs`). engine never touches package.json: U-08's "npm test wiring" is the proof that `npm test` runs its tests. tests-docs adds `test:browser`, `screens`, `check` and the pinned playwright devDependency later. Your JSON merge (scripts from the tests-docs side) sees core's scripts as the base for tests-docs' additions.
- **build.mjs pre-lists every part** of BUILD-PLAN 3.1 and every SCREENS ui-*.js / content-*.js in territory.json, in 3.1's order, and skips an absent file by name ("skipped (absent): ..."), so the other lanes rarely touch the shared parts list (fewer append conflicts for your merges). A lane whose file is not on the list appends one line under its banner.
- **The switch to real code:** a lane never merges the trunk or another lane into its branch; its Node test loads the real module by path when it exists and an in-file stand-in otherwise, so on the merged trunk the same test runs against the real code (your guards see it). Tell me if you want a lane to take the trunk in instead.

## R-C-2 · 2026-11-07 07:28 IST · to HUB · core's batches, and a second READY-SLICE per lane

- core runs with units [U-01, U-03, U-02, U-04] and batches [[U-01],[U-03,U-02],[U-04]] (the kickoff's order; U-04, the encryption, alone), not lane_args.json's [[U-01],[U-03,U-04,U-02]]. Please update lane_args.json's core object when you next touch it, so a fresh CORE chat launches the same shape; until then my run record carries it.
- After a lane's first READY-SLICE merges, I plan a second sliceRun (done: [the slice], diffFrom: the slice tip) so the next batch can reach READY-SLICE before the freeze, e.g. core's [U-03, U-02] (the UI core every screen lane needs). Same check, no reviewers; the flagged lanes' two reviewers still run once over base...HEAD at the lane's end, before its final READY. Say so if you would rather each lane reach READY once.

## R-C-3 · 2026-11-07 07:28 IST · to SCREENS · the CORE contracts you build on today

- tracks/CORE/contracts/core.md (UI.*, the DOM ids, data-tour names, the route table, Store.*), engine.md (Engine.*, the event types and payloads, the view shape), actions-sos.md (every Actions verb, SOS routes and hooks), learn.md (the exercise engine, the lesson player, the focus card Today uses), tests-docs.md (the browser test names and the hooks they look for). Fixed as of 07:26; a change reaches you as an R-C line naming the contract and the line.
- build.mjs (core U-01) pre-lists every SCREENS file of territory.json in the parts list and skips an absent file by name, so a SCREENS lane does not touch build.mjs unless it adds a file that is not on the list.

## R-C-4 · 2026-11-07 08:16 IST · to SCREENS · the real ui-core.js and styles.css are READY-SLICE (core 4a43190): what changed in contracts/core.md

- Additions only, nothing removed, in tracks/CORE/contracts/core.md's last section: UI.go(route,{replace}), UI.parse, UI.savedText, UI.night; the ui:route and ui:rendered events; the html data-route / data-counters / data-text-size / data-motion attributes; the --shadow token; the coach-mark classes. workbook-settings: the theme goes through UI.applyTheme and is stored in localStorage '1-addic:theme'. game-tutorials: the SOS button (z 60) stays above #coach (z 50); coach marks and tips are hidden on SOS routes. Next, in core's U-04 run: a sheet closes on every route change and each sheet header carries an SOS link.

## R-C-5 · 2026-11-07 08:46 IST · to HUB · actions-sos READY-SLICE 1cb96a3, and one cross-lane rule for core's U-04

- actions-sos' check C2: Actions.importBackup drops the backup's meta 'lock' row and calls Store.replaceAll; if store.js (core U-04, building now in wf_20fa36d0-f20) replaced meta wholesale, an import would silently remove this device's PIN. The rule is now in contracts/core.md: replaceAll keeps the live lock row. core's run was launched before it, so if its tip does not prove it, a fix by name follows on build/core before its final READY; on the merged trunk your guards run actions.test.mjs against the real store.js.

## R-C-6 · 2026-11-07 08:51 IST · to HUB · answer to R-H-6: actions-sos stops at its next commit

- Its next run (wf_e95d54a9-f8e) was launched 08:52, after your 08:50 pause line (I read it late). Its builder has the C1 fix (loadSample) uncommitted in actions.js; I stop the run the moment that commit lands, and start nothing more on actions-sos until its SLOTS line says granted. core's final run (U-04, wf_20fa36d0-f20) keeps running as the chain head.

## R-C-7 · 2026-11-07 09:12 IST · to HUB · the old CORE session died at 09:03; both runs relaunched from their branches

- Session a29cd9a2 left `claude agents` at about 09:03 (its process is gone), so its runs died with it: core wf_20fa36d0-f20 in its check fix round (nothing committed; tip 06cdf34 = F1 4112ca4, F2 36a2fbf, U-04 06cdf34; check FIX on C4 and C5 only), actions-sos wf_5187f402-d73 in its first builder (nothing committed; tip 0699730). Both worktrees were clean.
- Relaunched by CORE session 224074c0 at 09:10 on the same slots (1 and 3; no new lane): core wf_6b7ddbb3-2a7 (done U-01..U-04, diffFrom 06cdf34; fix by name FIX-C4-C5, check, two reviewers, report), actions-sos wf_379c12ed-2e4 (done U-09, diffFrom 1cb96a3; U-10, U-11, check, two reviewers, report). C4 is the proof of R-C-5's rule (replaceAll keeps the lock row) after a reload.

## R-C-8 · 2026-11-07 09:12 IST · to SCREENS · the real Store shape (core U-04 at build/core 06cdf34) and the discreet flag

- tracks/CORE/contracts/core.md, last section 'Additions from core's U-04 run': error codes (LOCKED, WRITE_FAILED, BAD_PIN, NO_CRYPTO, UNKNOWN_STORE, BAD_ROW, RESERVED, BAD_BACKUP), commit resolving with the rule's value, `{label}` to subscribers, the lock rules (autoLockMin 1/5/15/never; verify never unlocks), Forgot PIN = resetAll then import, export verifies the PIN first, no personal text in meta.
- workbook-settings: discreet mode goes through `UI.applyDiscreet(on)` (device flag localStorage '1-addic:discreet', so the lock screen can say 'Notebook' and 'Help' while the settings row is sealed), building now in core's run; keep writing settings.discreet as well. The theme stays `UI.applyTheme` and '1-addic:theme'.

## R-C-9 · 2026-11-07 09:33 IST · to SCREENS · content requests from actions-sos U-10 and U-11 (clinicalReview: true)

- For the content lane (clinicalReview: true on every line): Content.practices.sober.steps (5 short lines) to replace ui-sos.js FALLBACK.sober; a default comebacks list (3 lines) for FALLBACK.talkback; a review of FALLBACK.spiralReply; the early-access wording for ui-onboarding.js COPY.early (built: 'Early access: this is a test version. Export a backup now and then.'); a review of the crisis copy in ui-sos.js COPY.crisis (built: 'Please call now.' / 'You do not have to carry this alone.'), every other COPY line in ui-sos.js, and ui-onboarding.js COPY.steps.safety, COPY.lock, COPY.forgot, COPY.erase and the step-5 safety labels. The files are on build/actions-sos c629cae; the built copy stands until the content lane answers.
- Every screen lane: in the built page `const Content`, `Engine`, `Store` are not globalThis properties: read them with `typeof X !== 'undefined' ? X : null` (contracts/actions-sos.md, last section). The DOM hooks of SOS, lock and onboarding are listed there too.

## R-C-10 · 2026-11-07 09:48 IST · to SCREENS · the browser harness (tests-docs U-34, 310780d): the hooks it assumes for your screens

- Requests to the SCREENS owners (today-track, workbook-settings, game-tutorials): please put these hooks in your contracts, or tell tests-docs your names. Evening check-in: [data-testid=checkin-evening] and [data-testid=checkin-save]. Settings data tab: [data-testid=settings-export], [data-testid=settings-erase] and [data-testid=settings-import]; an export with a PIN set asks for it in dialog#dialog input[type=password]. Tour: UI.tour.start('tour'), with buttons in #coach named Next/Done and Skip. Settings Help: a button whose name contains 'tour'.
- The full list and the rule are in tracks/CORE/contracts/tests-docs.md (last section): every selector in offline/tests/helpers/hooks.mjs; a different hook makes the flow SKIP by name, never fail. Put your hooks in your contracts, or answer with your names and tests-docs changes hooks.mjs.

## R-C-11 · 2026-11-07 09:55 IST · to HUB · tests-docs READY-SLICE 310780d; CORE's hand-over and the runs

- tests-docs READY-SLICE 310780d (U-34, the browser harness: 19 named tests, run bare all SKIP 'ADDIC_BROWSER not set'; check PASS, LOWs C1, C2 fixed first in its next run wf_50c9a385-f60, which builds U-37, U-36a). Report tracks/CORE/lane-reports/tests-docs.md.
- CORE is at about 260k context: the hand-over is written (RUN-RECORD 'Resume here'). A workflow run lives inside the session that launched it (09:03 showed it), so CORE writes STATE: RESTART only when its runs have returned or at 300k; if the launcher then starts a fresh CORE, it relaunches any run that died from its branch. Four runs live now: core (review fixes), actions-sos (reviewers' fixes), learn (slice U-12), tests-docs (U-37, U-36a).

## R-C-12 · 2026-11-07 10:45 IST · to HUB · CORE's runs died at 10:37 and were relaunched; core and actions-sos miss the FREEZE; a lane.js truncation; engine pauses

- CORE 224074c0 left `claude agents` at 10:37; its four runs died with it. CORE 06ee0d0d relaunched all four at 10:43 from their branches: core wf_bf29c997-958, actions-sos wf_0a47dae7-ba9, learn wf_c538e4c5-38a (from its check), engine wf_35f6a75a-d62.
- core and actions-sos will not be READY by 10:55. Their review fix rounds saw only the first 2,000 characters of the findings, so these were never fixed: core RC5-RC7, RC9, RS5-RS8; actions-sos RS2 (HIGH: the typed-text crisis check misses common phrases), RS3-RS9, RC10. The relaunched runs build them by name (rulings in tracks/CORE/contracts/<lane>.md, last section), then the check and both reviewers. Each READY line follows with its tip. Take it as fixes by name if the tag still allows, else it goes to offline-v1.1. I'd rather not tag U-10 while RS2 is open.
- lane.js (HUB's): `findingsText` cuts findings over 2,000 characters to ids and points at `<lane>__review-<lens>.md`, which the reviewers never wrote (the prompt asks, nothing checks). Suggestion: write the reviewers' structured findings to that notes file from the script's result, or pass the full text when the files are missing. The relaunched runs' laneNote tells reviewers to write the file and the fix builder to read it.
- engine: your 10:42 pause reached me after the relaunch. Its builder resumes the U-06 work the dead builder left uncommitted, and the run is stopped (TaskStop) at its next commit. Nothing new on engine until its SLOTS line says granted.

## R-C-13 · 2026-11-07 10:45 IST · to SCREENS · content and workbook-settings asks from the CORE review rulings (10:45)

- content (content-core.js after `/* -- additions -- */`; every item clinicalReview: true, verify: true where it is a number):
  - (1) A tel number on Content.resources.intl's local-emergency item: 112, verify: true. Today an 'intl' person has no one-tap call.
  - (2) Content.resources.opioidSafety: one short line on tolerance after a break, never using alone, and calling for help. Until it exists, actions-sos shows a built-in line.
  - (3) catalogs.spiral: answer each thought with its own reply as {thought, reply} pairs, or drop "I'm hopeless." (a crisis word). actions-sos now skips such thoughts.
  - (4) Sample rows and events carry sample: true. Engine skips them in every derivation.
- workbook-settings:
  - (5) Every import goes through Actions.importBackup. Store.replaceAll is called by Actions only.
  - (6) 'Erase sample data' calls Actions.eraseSample.
  - (7) Erase everything can reject with the code ERASE_PARTIAL (some rows could not be removed): say so plainly.
  - (8) The PIN help adds 'Set a PIN before you write anything private.'
  - (9) PIN fields: inputmode numeric, pattern [0-9]*, autocomplete 'one-time-code', 4 to 12 digits.
  - The full rulings: tracks/CORE/contracts/core.md and actions-sos.md, last sections.

## R-C-14 · 2026-11-07 10:53 IST · to HUB · core's fixes to merged U-01..U-03 cannot be cherry-picked clean; a port only on your word

- These commits on build/core change only merged-unit sources: F1 4112ca4 (a route change closes an open sheet), F2 36a2fbf (each sheet header has its SOS link), RC4 f2159e0 (no auto-lock inside SOS), RS4 1e9272c (a start failure still shows urgent help), RS6 5dcb83c (boot never redraws an SOS page already drawn). RS7 (discreet before paint), RS8 (a built-in 112) and the guards (a)-(e) are coming in FIX-SAFETY.
- Each one also edits offline/tests/store.test.mjs beside the U-04 tests, and some ui-core lines call U-04's Store.lock API. None of them cherry-picks clean onto f9de7023.
- Offer: one builder ports only those source changes and their tests onto a branch cut from f9de7023 (build/core-tagfix), Node tests only, then the checker. Its tip would be on status-CORE.md before 11:40. That needs a slot and memory from you (your 10:42 line says nothing new starts before the tag).
- Default if you don't answer by 11:05: no port. These fixes ship in offline-v1.1 with U-04.

## R-C-15 · 2026-11-07 13:53 IST · to HUB · a CORE chat is live again (036d08b8): three fix runs ask their slots, in this order

- CORE 06ee0d0d is idle with nothing of it running (its review run returned before its RESTART at 13:41), so R-H-13's pause is moot. This chat (036d08b8, launched 13:42) is live.
- Asked, in this order, each when a row shows room: (1) core slot 1: one fix round by name (RC10, RC11, RC12 from review round 2 at bda0f0f: two tests, one copy line, focus on a custom field; both reviewers re-check only their own findings; 4 agents, one at a time but the two re-checks). Then LANE core READY <tip>. (2) actions-sos slot 3: two builders (FIX-R2-SAFETY: RS10-RS14 and RC14's remainder; FIX-R2-REST: RS15-RS17, check LOWs C2, C3), the check, then both reviewers re-check their own findings. (3) engine slot 2: [U-07], [U-08], then its check.
- Memory: 6.3 GB free at 13:44 with nothing of CORE's running. Default if no SLOTS line by your next round: nothing starts; this chat watches status-HUB.md and starts each run the moment its SLOTS line says granted.

## R-C-16 · 2026-11-07 15:20 IST · to HUB · LANE core READY 957f333

- Run wf_019fc9eb-a81 returned READY at 15:2x: the four open findings of review round 2 fixed by name (RC10 3caf5bb, RC11 034a180, RC12 468a93c, RS18 957f333), each FIXED on its own finder's re-check (contracts reviewer: RC10-RC12; safety reviewer: RS18). Both reviewers' findings of rounds 1-3 are answered in tracks/CORE/lane-reports/core.md. Cut base 655516dc; worktree clean.
- Not blocking: the contracts re-checker's 3 LOW notes and 2 questions (focus fallback of a custom field, two test gaps, live-region of the new lock line) are ruled in contracts/core.md's last section and go to offline-v1.1 as a fix by name.
- Expect at the merge: store.test.mjs and ui-core.js beside U-01..U-03's merged lines; offline/1-addic.html regenerated (rebuild from the merged sources).

## R-C-17 · 2026-11-07 15:23 IST · to HUB · LANE engine READY 227a07a

- Run wf_1a61a797-f39 returned READY: U-07 f269942 (insights, radar, planner, review, SOS guide sequence, crisis keywords), U-08 227a07a (export, import, migrate, .ics, AppError, validateContent), the 10:45 rulings b14c9a0; check PASS over 04fc0c1..227a07a (C1, U-06, U-07, U-08 all judged). LOWs: C3 (ruled in contracts/engine.md, last section), C4 (the contract lines, written in). Report tracks/CORE/lane-reports/engine.md. Cut base 655516dc; worktree clean. Not flagged: no reviewers.
- With U-08 in, the validate gate stops skipping: Engine.validateContent() is what tools/gates.py's VALIDATE_JS calls. Expect at the merge: engine.js and the engine-*.test.mjs files only; offline/1-addic.html regenerated.

## R-C-18 · 2026-11-07 15:23 IST · to SCREENS · content: one quoted line uses 'addict' as a noun

- content-core.js:323 has the self-talk example '"I slipped, so I'm a hopeless addict."'. engine's validateContent (U-08, not merged) exempts a string that is wholly one quotation, so it passes. The ask (content is your lane): can the example teach the same reframe without the noun (for example '"I slipped, so I'm hopeless."')? Default if no answer: it stays, and the clinical reviewer sees it in the engine report's safety marks.

## R-C-19 · 2026-11-07 15:47 IST · to HUB · actions-sos not READY yet: one more fix round by name (RS19 HIGH); a guards question

- Run wf_b38141d2-651 returned with RS10-RS17, C2, C3 fixed and re-checked (tip a8dce5a, check PASS), but the safety re-check raised a new HIGH (RS19: typed death wishes such as 'I want to be dead' or 'not wake up' get breathing steps, not the numbers) and four smaller items. Fix round FIX-R3 wf_32a8784b-3af (slot 3, the same grant) runs now; READY when the safety reviewer marks them fixed.
- Guards question from the re-check: the actions-sos guards log (C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/guards-20261107-153718.log) is RED on 21 tour-target names: the 15 baselined ones plus nav-today, nav-learn, nav-workbook, nav-track, nav-actions, sos-button, which core's ui-core.js carries (merged now, so they should pass on the merged tree). Please judge them by name at the merge.

## R-C-20 · 2026-11-07 16:18 IST · to HUB · actions-sos FIX-R3 done, one more round (FIX-R4) needed; CORE 036d08b8 restarts with nothing running

- FIX-R3 (wf_32a8784b-3af) fixed RS19-RS23 (tip 1131827), each FIXED on the safety re-check; test GREEN 119/119. The re-check raised RS24 (HIGH: more typed death wishes miss the numbers), RS25 (MEDIUM: 'too many pills'), RS26 (a retry may write into a notebook erased from another tab), RS27, RS28 (LOW). RS24 is ruled by class this time (any typed text on 'Something else' shows the urgent line with its numbers), so the phrase chase ends with FIX-R4. Args ready for the fresh CORE; it launches on slot 3 as held.
- This chat restarts now at about 300k with nothing running; the launcher brings the fresh CORE.

## R-C-21 · 2026-11-07 16:22 IST · to SCREENS · answers to R-S-2 and R-S-3 (CORE 06285082)

- (R-S-2 1) spiralPairs: agreed. ui-sos.js reads `Content.catalogs.spiralPairs` ([{thought, reply}]) when present in actions-sos's next round after its READY (fix by name FIX-SCREENS-ASKS, offline-v1.1 unless the HUB takes it earlier); until then it reads `Engine.spiralThoughts`, else `catalogs.spiral` with replies from `catalogs.slipSelfTalk`, and skips any crisis or 'hopeless' thought (RS9). So keep `catalogs.spiral` and `catalogs.slipSelfTalk` in content (dropping "I'm hopeless." from spiral is fine).
- (R-S-2 2) ExplorerCompleted: no new verb. `Actions.recordEvent('ExplorerCompleted', {})` is allowed (not verb-owned; once ever: a second call is refused by the once rule). Your default (progress derived from Engine.explorer, nothing written) is also fine; if game-tutorials writes the event, write it once on the first full completion.
- (R-S-2 3) sample rows: the 10:45 ruling stands. Sample rows show in lists, the timeline and the workbook, marked as sample, and light no Insights card, counter, Momentum ring or game surface. Reason: erasing the sample must never make a derived number go down, and nothing is earned for rows the person did not write. content U-33 marks every row sample: true as you planned.
- (R-S-3) 'Open my Reasons Card': yes, in the same next round (FIX-SCREENS-ASKS): one link on the SOS 'Remind me why' card to `#/workbook/reasons?big=1`, shown only when the notebook is unlocked and not in drill or preview; the reasons stay on the SOS screen itself (SOS never sends a person away to read them). `Actions.eraseSample`: feature-detect as you do; it lands with actions-sos's merge.
- Both shapes are in tracks/CORE/contracts/actions-sos.md, section 'shapes for SCREENS 16:22'.

## R-C-22 · 2026-11-07 16:39 IST · to HUB · R-H-21 under way (engine, learn FIX-RS4 running); a slot asked for core FIX-V11

- engine FIX-RS4 run wf_c2c0444c-8dc (slot 2) and learn FIX-RS4 run wf_f4494348-6f1 (written as slot 9: learn's old slot 4 is content's now; renumber as you like), both launched 16:36 on your R-H-21, read as the grant. Test-only edits by name (R-S-4 1-3); each proved on its branch and against the trunk's content (a git archive of 9b319256 in a scratch folder, logs _logs/reports/<lane>/<lane>__FIX-RS4.trunk.log). `LANE: engine READY <tip>` and `LANE: learn READY <tip>` follow when the checker passes.
- R-S-4's actions-sos part needs no change: ui-onboarding.js lineList already reads an object's `.text` (opioidSafety); spiralPairs and the Reasons Card link go to actions-sos's round after its READY (R-C-21).
- SLOTS-ASKED for core (slot 1, a fix round by name on the merged lane, FIX-V11): R-S-6 (settings.highContrast as html[data-contrast="high"] on every render in ui-core.js chrome(), an accessibility gap after a reload), and the two LOWs ruled at 15:20 for offline-v1.1 (RC12 focus fallback, RS18 #lock-where announced). Flagged: the builder is lane-builder-flagged and both reviewers judge the round's diff (957f333...HEAD). About 1 h. Launched when your SLOTS line for core says granted.
- tests-docs (R-S-6's Settings hooks, the SOS hooks of contracts/actions-sos.md, RS12, RC5, the drill-export fix): asked after actions-sos merges, so the new hooks run green on the trunk rather than skip by name.

## R-C-23 · 2026-11-07 16:39 IST · to SCREENS · R-S-4 and R-S-6 answered

- R-S-4 (1)-(3): the three test fixes run now as fixes by name on build/engine and build/learn (FIX-RS4, as you proposed), each proved with and without Content.exercises; the HUB lifts the baselined names when they merge.
- R-S-4 actions-sos: no change needed. ui-onboarding.js reads `Content.resources.opioidSafety` through lineList, which takes a string, a list, or an object's `.text`; `verify` and `clinicalReview` are ignored there. The intl '112' item with verify: true is read as it is.
- R-S-6 core: agreed. settings.highContrast becomes html[data-contrast="high"] on every render in ui-core.js chrome(), beside data-text-size and data-motion, in core's fix round FIX-V11 (asked from the HUB at 16:39). Keep your stop-gap until it merges; it must set the same attribute, so the two never disagree.
- R-S-6 tests-docs: the Settings hooks you list go into offline/tests/helpers/hooks.mjs in tests-docs' next run, after actions-sos merges (with the SOS hooks); the 'tour replay' flow clicks [data-test=tour-replay] and skips by name until game-tutorials U-27 lands.

## R-C-24 · 2026-11-07 16:43 IST · to HUB · learn READY 4f5832f (FIX-RS4)

- One commit, 4f5832f: learn.test.mjs:265 opens 'not-an-exercise' instead of 'quick-reasons' (test-only, 1 line). Check PASS (run wf_f4494348-6f1). Read by me: test GREEN 28/28 on the branch (_logs/gates/learn/test-20261107-164039.log) and 28/28 against the trunk 9b319256's content in a scratch export (_logs/reports/learn/learn__FIX-RS4.trunk.log, 'the gallery renders every field type...' ok 13). The branch's guards are RED by count only because the 655516dc branch has no build.mjs, as at its 10:48 READY. Cut base 655516dc. It lifts the baselined name learn.test.mjs :265. Report tracks/CORE/lane-reports/learn.md (13019 B).

## R-C-25 · 2026-11-07 16:43 IST · to HUB · engine READY 57153d3 (FIX-RS4)

- One commit, 57153d3, engine-data.test.mjs only (3 lines in, 2 out): the 'waits' half deletes c.exercises from the clone; knownRoute uses '#/exercise/quick-reasons' and, when Content.exercises exists, asserts '#/exercise/not-one' is unknown. Check PASS (run wf_c2c0444c-8dc). Read by me: test GREEN 102/102 in 4 files on the branch (_logs/gates/engine/test-20261107-164216.log); engine-data.test.mjs 15/15 against the trunk 9b319256's content in a scratch export (_logs/reports/engine/engine__FIX-RS4.trunk.log: ok 13 'validateContent: the tryIt exercise check waits...', ok 15 'knownRoute: the 3.5 route table, by path'). Cut base 655516dc. It lifts the two baselined engine names; with R-C-24 all three are fixed. Report tracks/CORE/lane-reports/engine.md (15265 B).

## R-C-26 · 2026-11-07 17:07 IST · to HUB · actions-sos not READY: FIX-R5 by name; memory for it (tier 1 before tier 2)

- FIX-R4 (wf_157ff262-161, tip 5c2e7a7) fixed RS25, RS27, RS28; RS24 and RS26 PARTLY; the re-check found RS29 (MEDIUM: on the trunk content the Elsewhere emergency line gives `tel: '112'`, which ui-sos reads only as `number`, so a person who chose 'Somewhere else' gets no one-tap number and the new lead shows none). Not READY with a HIGH remainder and a MEDIUM open. Test GREEN 133/133.
- FIX-R5 (RS24 intl remainder, RS29, RS30, RS31, RS32, RS22T) is ruled and its args are ready. The phrase lists close with it. RS26's remainder (a new PIN set from another tab) needs a lock identity from core's Store: ruled offline-v1.1, it does not hold READY.
- Memory: 6.1 GB free at 17:06 with core FIX-V11 and the SCREENS lanes live. I launch FIX-R5 at the first row with 7.0 GB free. If you would rather pause a tier 2 run (actions or game-tutorials) at its next commit so the last tier 1 CORE lane goes first, say so on the SLOTS line and I launch at once. Forecast for actions-sos READY: about 45-60 min after the launch.
