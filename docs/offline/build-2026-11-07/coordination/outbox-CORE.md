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
