## today-track (SCREENS, 1-addic offline build): the slice report

State: READY-SLICE. Branch build/today-track. Base 1ef2482e. Tip 13eba28. Worktree C:/Users/ruchi/1-addic-wt/today-track. Run time 2026-11-07 16:13 IST.
Commits (1ef2482e..HEAD):
- 13eba28 style(today-track, U-15): the Today section at the end of styles.css
- f615567 feat(today-track, U-15): Today screen in ui-today.js with its Node tests

### Turn caps
- Builder batch [U-15]: steps_used 19; returned a note. capHits 0.

### Units
- U-15 Today (tier 1): built. SHAs f615567 (offline/src/ui-today.js, offline/tests/today-track.test.mjs), 13eba28 (offline/src/styles.css).
  What a person can do on #/today (and every unknown route):
  - Greeting by the hour, companion name, and two links always at the top: "Log a craving" (#/track/log/craving) and SOS (#/sos; "Help" in discreet mode). Never gated.
  - Check-in card: morning before 12:00, evening from 17:00, between them whichever is not done; hidden when done. Opens #/track/log/checkin?kind=morning|evening (shows "coming soon" until U-16).
  - Today's plan: plan rows for today (skipped left out), by start; risky blocks say "Risky time" in words; Battle Plan in a collapsed details; sample rows tagged "Sample". Empty: one line and a link to #/actions/planner (or #/learn). No overdue wording.
  - Want-to idea; Continue learning (LearnUI.focusCard or link card); up to 2 active quests; one rotating reason from the Reasons Card.
  - Opt-in counters (settings.counters === true, start date set, not discreet); total days always, current run only with showCurrentRun; next milestone line.
  - Momentum ring and Explorer ring (hidden in Calm, maintenance, and when Explorer is done).
  - Tip of the day ("Show me", "Not now"); markTipShown once per day per tip; never on SOS routes.
  - Backup reminder (data exists, last backup missing or 14+ days old, not set aside in 14 days) -> #/settings/data.
  - Milestone card in words only, no XP; "Thanks" records MilestoneSeen and patches milestonesSeen.
  - Maintenance variant: greeting, links, check-in, plan, reasons, tip, backup, one-line note.
  - Harbor: static lantern placeholder (aria-hidden) until HarborUI exists; hidden in Calm and discreet.
  Questions closed: settings verb is A.settings.patch (actions.js:232); check-in rule per the chat's ruling.
  Engine note: rowsOf/rowOf drop sample:true rows, so Today's own readers (planToday, checkinsDone, backupDue) read view.list directly; sample rows do not count as data for the backup reminder.
- Held or blocked: none.
- Still to build on this lane:
  - U-16 (tier 1): offline/src/ui-track.js (global TrackUI, UI.pages.track from its own file, pure names in module.exports). Read actions.js:269-360 for logCraving, logFeeling, checkin, logActivity, logSlip. data-tour quicklog-button, quicklog-intensity, quicklog-save.
  - U-17 (tier 2): #/track/insights inside ui-track.js from E.insights(view, now) (engine.js:928); one line only below 7 logs; data-tour insights-triggers, insights-heatmap.
  - U-18 (tier 2): offline/src/ui-harbor.js with HarborUI.scene(ctx) and lightLevels(view, now) = E.gameState(view, now).regions. Today switches over when typeof HarborUI !== 'undefined' and wraps the scene in data-test today-harbor.

### Contract changes
- UI.pages.today = (ctx) => TodayUI.page(ctx), registered in ui-today.js. Consumer: ui-core router.
- Global TodayUI. page(ctx). Pure names (module.exports), consumer none yet (tests): TEXT, localDate, greetingFor(now, profile, E?), checkinsDone(view, now), checkinKind(view, now, profile) -> 'morning'|'evening'|null, planToday(view, now) -> [{...plan, risky, battlePlan|null}], wantToday(view, now, E?), activeQuests(view, E?), reasonOfDay(view, now, E?), countersData(counters, settings, discreet), backupDue(view, settings, now) -> bool, milestoneDue(counters, settings) -> int|null, cardsFor({maintenance, calm, discreet}).
- data-test hooks (consumer: tests-docs hooks.mjs): today-page, today-log-craving, today-sos, today-checkin, today-checkin-go, today-plan, today-battle, today-want, today-learn, today-quests, today-reasons, today-counters, today-momentum, today-explorer, today-tip, today-tip-go, today-tip-dismiss, today-backup, today-backup-dismiss, today-milestone, today-milestone-thanks, today-maintenance, today-harbor. focus-card comes from LearnUI.
- No events, content keys, Actions verbs, or data-tour names added. Verbs used: A.settings.patch (actions.js:232), A.recordEvent (actions.js:252), A.markTipShown (actions.js:777).
- Routes linked: #/track/log/craving, #/track/log/checkin?kind=, #/sos, #/actions/planner, #/actions/battle, #/actions/quests, #/workbook/reasons, #/settings/data, #/learn.

### Gates
VERIFIED (check run at tip 13eba28):
- build GREEN pass=1 fail=0 log=C:\Users\ruchi\1-addic-wt\_logs\gates\today-track\build-20261107-162044.log
- test GREEN pass=10 fail=0 (1 file) log=C:\Users\ruchi\1-addic-wt\_logs\gates\today-track\test-20261107-162045.log
- validate GREEN pass=1 fail=0 log=C:\Users\ruchi\1-addic-wt\_logs\gates\today-track\validate-20261107-162045.log
- guards RED pass=4 fail=15 log=C:\Users\ruchi\1-addic-wt\_logs\gates\today-track\guards-20261107-162045.log. All 15 are tour-target names already baselined (coordination/baselines.md:26-40): quicklog-button/intensity/save, planner-day/gaps/add, bp-new, bp-form, workbook-groups, workbook-card, insights-triggers, insights-heatmap, review-start, plan-sections, plan-print. No new failure. The quicklog and insights names should lift in U-16 and U-17.
- Territory: 3 files changed, 2 own (ui-today.js, today-track.test.mjs), 1 shared (styles.css, append only under /* -- today-track -- */), 0 nobody's, 0 errors, 0 warnings.
ASSUMED (not run):
- Browser gate: the lane adds no browser tests; hooks and flows are asked of tests-docs.
- Reading level (grade 6-8) checked by reading only.
- The engine rule that a slip leaves the counters total unchanged is the engine's; the lane's test only consumes it.
- Builder's own logs: build/test/validate-20261107-161931.log in the same folder.

### Review gates
None.

### Check
Verdict PASS at 13eba28. Findings (both LOW, no fix commit, open):
- C1 ui-today.js:169-171: brief says check-in times come from profile.checkin; code uses fixed 12:00/17:00 and ignores the profile argument. Justified by a chat ruling cited in the units record (lines 36, 41) but the ruling text was not found in the files the checker could read, and the hand-off notes do not list it. Fix: none yet; the chat should confirm or revise.
- C2 today-track.test.mjs:204-205: the test finds recordEvent and settings.patch calls by position (A.calls[1], [2]) rather than by name, so a change in tip rules could break it. Not vacuous (probe in _logs/reports/today-track/probe-check.mjs). Fix: none yet; find by name.
Not checked: browser gate, the C1 ruling, reading level by tool, the engine slip rule.

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
No clinicalReview: true passages and no verify: true resources were added (no Content added). Reviewer candidates, strings in ui-today.js TEXT: milestoneBody ("You reached a milestone. Take a moment to notice what you did to get here.") and backupBody. SOS is never gated; no overdue wording; risky times shown in words, not colour only.

### Requests for other lanes
- tests-docs (offline/tests/helpers/hooks.mjs): add the today-* data-test hooks listed above, and browser flows for Today (empty and sample profile, no dead button).
- actions (offline/src/actions.js:165): SETTINGS_DEFAULTS has counters: true, so counters are on once a start date exists; confirm that is intended.
- engine: none required; rowsOf/rowOf drop sample rows, which Today works around.

### Docs owed
- offline/README.md: none for U-15.
- Guide: the Today page section belongs to tests-docs/docs.
- CLAUDE.md lines: none.

### Open questions
1. milestoneDue returns the HIGHEST reached-and-unseen milestone (the brief said the first); Thanks marks all up to it seen. Default built: highest.
2. No "Explorer dismissed" setting exists; the ring hides when E.explorerDone is true.
3. profile.checkin times unused (fixed 12:00/17:00 rule, see C1).
4. Counters default: counters is true by default, so tracking depends on a start date being set.

### For the HUB at the merge
- Shared file: offline/src/styles.css, section appended at end (banner line 382, after /* -- end core -- */); no token redefined. build.mjs already lists ui-today.js (unchanged).
- package.json and package-lock.json: no change.
- Conflicts to expect: styles.css append point only, if other lanes also append there.
- Territory warnings: none.
- Uncommitted offline/1-addic.html is a regenerated build output, left out.
- Browser tests for the quiet window: npm run test:browser once tests-docs adds the today-* hooks; until then none exercise Today.
