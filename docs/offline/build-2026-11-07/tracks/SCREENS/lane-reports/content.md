## content (SCREENS, 1-addic offline build): the slice report

State: READY-SLICE. Branch build/content, base 1ef2482e, tip 065699b. Date 2026-11-07 16:13 IST.
Commits: 0bbb7e2 feat(content, U-31a): content-core safety asks and the additions line; 065699b feat(content, U-31a): M0-M3 exercises, the checkpoint and content.test.mjs.

### Turn caps
One builder (batch U-31a): steps_used 26, returned a note. capHits 0.

### Units
- U-31a (tier 1), 0bbb7e2 and 065699b, built. For a person: every Try it in Learn M0-M3 opens a real exercise (#/exercise/<id>?mode=tutorial&from=<lesson>): quick-reasons, signs-check, risk-factors (behind the sensitive skip card), help-request, motivation, balance, four-lenses, each with a cast example, hints and a "built" line. program-questions is reachable from the Workbook or a tool. Checkpoints m0-m3 ask their own two questions. The SOS Reasons Card fills from quick-reasons, balance and four-lenses. Closes: exercises as an array (ruled a), spiral pairs in catalogs.spiralPairs (ruled b), Content.copy.early left out (ruled b). R-C-13 (1)-(3) and R-C-18 done.
- Held or blocked: none.
- Still to build: U-31b (more exercises, checkpoint m4-m10), U-29 (content-lessons-b.js, m4-m6), U-30 (content-lessons-c.js, m7-m10, clinicalReview on M9-M10), U-32 (content-practices.js: practices, games, comebacks), U-33 (content-sample.js, sample.generate(nowIso)).

### Contract changes
- Content.exercises (array, content-exercises.js, const C_ex). Ids: quick-reasons, signs-check, risk-factors (sensitive, no score), help-request, program-questions, motivation (artifact motivation, repeat), balance (pull, drawbacks, miss, benefits), four-lenses (problem, worries, why, different, believe), checkpoint ({id, title, book, kind:'reflect', modules:{m0..m3: 2 x {q, options:[{t, ok, why}]}}}). Consumers: ui-exercise.js exerciseFor, ui-learn.js checkpointQuestions, Actions.saveResponse, Engine reasonsCardSections, workbook-settings, the browser flow "lesson to artifact shown in SOS".
- Content.catalogs.spiral: "I'm hopeless." removed (7 left). Consumer: actions-sos.
- Content.catalogs.spiralPairs (new): 7 {thought, reply}, no crisis word. Consumer: actions-sos.
- Content.resources.opioidSafety (new): object {text, verify:true, clinicalReview:true}, not the contract's string[]. Consumer: actions-sos reads .text.
- Content.resources.intl.lines local-emergency item: tel '112' added.
- Content.catalogs.distortions labelling example changed (R-C-18).
- No events, routes, UI.pages entries or data-tour targets added. The additions line sits at the end of content-core.js.

### Gates
VERIFIED (check run, tip 065699b):
- GATE build GREEN: C:\Users\ruchi\1-addic-wt\_logs\gates\content\build-20261107-162140.log
- GATE test GREEN 10/10 (content.test.mjs): ...\test-20261107-162141.log
- GATE validate GREEN: ...\validate-20261107-162142.log
- GATE guards RED, only the 15 "guard: tour-target" names (quicklog-button through plan-print), all in coordination/baselines.md, so no new failure: ...\guards-20261107-162143.log
- Territory: 3 files changed, 3 own, 0 shared, 0 nobody's, 0 errors, 0 warnings.
ASSUMED: the builder's own earlier gate logs (build-20261107-161923, test-161924, validate-161925, guards-161925, same folder). Not run: browser gate (no browser tests added) and the full npm test across neighbour files.

### Review gates
None.

### Check
Verdict PASS at 065699b.
- C1 MEDIUM: three neighbour tests assumed Content.exercises absent and now fail by name (engine-data.test.mjs:243 and :266; learn.test.mjs:265). No fix SHA; owners update, HUB baselines until then. Open.
- C2 LOW: opioidSafety built as an object, not string[] (content-core.js:519-523). Allowed; actions-sos told to read .text; contract file still to update. Open.

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
- clinicalReview: true: content-core.js Content.resources.opioidSafety.
- verify: true: content-core.js Content.resources.opioidSafety; Content.resources.intl.lines[2] (tel 112). The clinical reviewer checks the opioid line; the owner confirms 112.

### Requests for other lanes
- TO ENGINE (CORE), tests/engine-data.test.mjs: the two tests at :243 and :266 assumed Content.exercises absent; update them.
- TO learn owner, tests/learn.test.mjs:265: expects quick-reasons "Not available yet"; update.
- TO actions-sos: read Content.resources.opioidSafety.text; use catalogs.spiralPairs.
- Engine keys to keep: quick-reasons reasons/quick, balance drawbacks/benefits, four-lenses different; never make balance one matrix2x2 field.
- Contracts/content.md: update opioidSafety shape.

### Docs owed
None for this unit; the guide can describe the M0-M3 exercises later.

### Open questions
1. opioidSafety shape: default object {text, verify, clinicalReview}.
2. risk-factors hidden by default: default only sensitive: true; the Workbook decides visibility.
3. Neighbour test failures: default content stays as contracted; owners update tests; HUB baselines the three names.

### For the HUB at the merge
No shared files touched; no package.json or package-lock.json changes; no conflicts expected; no territory warnings. offline/1-addic.html was regenerated by the build gate and left uncommitted: do not merge it from this lane. Baseline the three neighbour test names until owners fix them. Browser tests to run in the quiet window: the flow "lesson to artifact shown in SOS" and the learn gallery test.
