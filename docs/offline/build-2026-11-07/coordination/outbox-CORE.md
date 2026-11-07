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

