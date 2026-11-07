## today-track (SCREENS, 1-addic offline build): lane report

State: READY at tip 6b0184b (2026-11-07 23:17 IST). Earlier: READY at 3f3001e (16:31 IST); READY-SLICE at 13eba28 (16:13 IST). Branch build/today-track. Base 1ef2482e. Worktree C:/Users/ruchi/1-addic-wt/today-track. Units U-15 to U-18 and FIX-EMBED all built; none held.

Commits (1ef2482e..HEAD, newest first):
- 6b0184b feat(offline, U-15, FIX-EMBED): Today embeds GameUI.panel, GuidanceUI.explorerRing, moreTools and dot (continued run, base 7485e254, 22:48)
- 3f3001e style(today-track, U-18): Harbor scene rules and transform-only motion in the today-track section
- c467fae feat(today-track, U-18): Harbor scene in ui-harbor.js with its Node tests
- bd06841 style(today-track, U-17): Insights chart rules in the today-track section of styles.css
- e7d248d feat(today-track, U-17): Insights cards in ui-track.js with their Node tests
- 9f76c9a style(today-track, U-16): Track rules in the today-track section of styles.css
- 2a77cfe feat(today-track, U-16): Track screen in ui-track.js with its Node tests
- e845599 test(today-track, U-15 C2): find the milestone calls by name
- 87c03f1 fix(today-track, U-15 C1): check-in card follows profile.checkin times
- 13eba28 style(today-track, U-15): the Today section at the end of styles.css
- f615567 feat(today-track, U-15): Today screen in ui-today.js with its Node tests

### Turn caps
- 16:13 run: builder batch [U-15]: steps_used 19. capHits 0.
- 16:31 run: builder [U-16] steps_used 38 (also C1, C2); builder [U-17, U-18] steps_used 27. capHits 0.
- 2026-11-07 run (continued from 7485e254, slot 5): builder [FIX-EMBED] run wf_8859379a-bb6, committed 6b0184b 22:48. capHits 0. The SCREENS chat stopped that run at 22:52 (memory pause) during the checker's gates; the check was redone at 23:17.

### Units
Per-unit record: C:/Users/ruchi/1-addic-wt/_logs/reports/today-track/today-track__units.md.
- U-15 Today (tier 1): built. SHAs f615567 (offline/src/ui-today.js, offline/tests/today-track.test.mjs), 13eba28 (styles.css). Follow-ups 87c03f1 (C1), e845599 (C2).
  What a person can do on #/today (and every unknown route):
  - Greeting by the hour, companion name, and two links always at the top: "Log a craving" (#/track/log/craving) and SOS (#/sos; "Help" in discreet mode). Never gated.
  - Check-in card: with both profile.checkin times set, morning until their midpoint and evening from two hours before the evening time; otherwise morning before 12:00 and evening from 17:00; hidden when done. Opens #/track/log/checkin?kind=morning|evening (live since U-16).
  - Today's plan (skipped left out, risky blocks say "Risky time" in words, Battle Plan in a details, sample rows tagged "Sample"); empty: one line and a link. No overdue wording.
  - Want-to idea; Continue learning; up to 2 active quests; one rotating reason.
  - Opt-in counters (settings.counters true, start date set, not discreet); next milestone line.
  - Momentum ring and Explorer ring (hidden in Calm, maintenance, Explorer done).
  - Tip of the day ("Show me", "Not now"); backup reminder (14+ days) to #/settings/data; milestone card in words only, "Thanks" records MilestoneSeen.
  - Maintenance variant. Harbor card: the scene from U-18 (static lantern only if HarborUI is missing).
  Engine note: rowsOf/rowOf drop sample:true rows; Today's readers use view.list directly.
- U-16 Track (tier 1): built 2026-11-07. SHAs 2a77cfe (ui-track.js + tests), 9f76c9a (styles).
  - #/track: "+ Log" (data-tour quicklog-button) and SOS at the top; "Your days" when counters are on and tracking; the Insights line below seven logs, else a link "See your insights"; timeline newest first by day (Today, Yesterday, then date), time + type word + detail, Sample tag, 30 rows then "Show more"; empty state with "Log something".
  - #/track/log: a chooser of five kinds. #/track/log/craving and /feeling: intensity slider 0-10 (quicklog-intensity), feeling chips, trigger chips (frequent first), thought, red flag, tried/helped skill chips, notes; Save (quicklog-save) calls A.logCraving / A.logFeeling.
  - #/track/log/checkin?kind=: mood and worry sliders, intention; evening adds strongest craving, good moments, used, sleep, meeting -> A.checkin. #/track/log/activity -> A.logActivity.
  - #/track/log/slip: kind words first, link "Steps for after a slip" (#/sos/slip?preview=1), date, what was used, situation, notes -> A.logSlip, then #/track/log/slip?saved=1 ("It is in your log." with "Next steps" #/sos/slip?logged=1). A slip changes no total (tested).
  - Action errors show their message in an aria-live line; locked: "Your notebook is locked. Unlock it to save. What you typed is still here."; the form keeps its values. Success: toast and back to #/track.
  Questions closed: Insights is a link on Track, not a tab, hidden below seven logs (the chat's word). C1 and C2 closed.
- U-17 Insights (tier 2): built. SHAs e7d248d (ui-track.js + tests), bd06841 (styles).
  - #/track/insights below seven own logs: the one line and "Log something". Sample rows and drills do not count (as in E.insights).
  - At seven or more: cards, each SVG with role="img" and its numbers in the aria-label: craving strength by week (8 weeks, gaps shown); top 5 triggers as bars (insights-triggers); 7x24 heatmap with a "Show as a table" details (insights-heatmap); skills that helped; mood and pleasant activities (engine sentences, no cause claims); predictions; motivation. Cards with no data are left out or give one line.
  - Under 14 logs every card shows the engine's caveat. Without UI.svg the numbers show as text and the table. Without the engine: one honest line and a back link.
  Questions closed: Insights lives at #/track/insights as a link (chat's word).
- U-18 Harbor (tier 2): built. SHAs c467fae (ui-harbor.js + tests), 3f3001e (styles).
  - Today's Harbor card shows a layered SVG: sea, breakwater, Lighthouse, Garden, Pier, Compass Rose, Weather Station, each lit by its level 0-5 from E.gameState regions. Caption: "Each place grows brighter as you use its skills. The light never goes out." Screen readers hear each place and its level.
  - Motion is transform only, still under the reduced-motion setting, the system setting, data-motion=reduce or an SOS route. No keyframe touches opacity, so the light never dims.
  - Calm and discreet modes: no scene.
- FIX-EMBED Today embeds game-tutorials' pieces (tier 2), 2026-11-07: built. SHA 6b0184b (ui-today.js +40/-7, today-track.test.mjs +86).
  - On Today a person sees "Your progress" (GameUI.panel) after Momentum; the Explorer ring (GuidanceUI.explorerRing) in place of Today's own Explorer card; "More tools" (GuidanceUI.moreTools) after the tip; a "New" dot (GuidanceUI.dot) only by the Planner link of the plan card and the Quests link.
  - Calm: no panel, no ring. Discreet: no panel. Maintenance: the five basics only. Without GuidanceUI/GameUI Today renders as before. GuidanceUI.tipCard is never rendered (one tip card only). A null ring shows nothing. Each piece is behind typeof, in safe(), given the ctx as received.
  - Questions closed: dot placement (Planner and Quests links only; Want card and Battle Plan links get none); 'more' shows in Calm and discreet.
- Held or blocked: none.

### Contract changes
- UI.pages.today (ui-today.js), UI.pages.track (ui-track.js) register from their own files; consumer ui-core router.
- Global TodayUI: page(ctx); pure names (module.exports): TEXT, localDate, greetingFor, checkinsDone, checkinKind(view, now, profile), planToday, wantToday, activeQuests, reasonOfDay, countersData, backupDue, milestoneDue, cardsFor.
- Global TrackUI: page(ctx); pure TEXT, KINDS, localDate, timeline(view, limit), timelineCount, insightCount (own logs only), triggerOptions(view, E), formToLog(type, values) -> {verb, args}, save(A, type, values) -> {ok, log}|{ok:false, code, message}, rowText, countersData, routeOf, insightsView(view, now, E?) -> {ready, count, engine, caveat, trend[8], triggers[], maxTrigger, heatmap[7][24], maxCell, cravings, hot[], skills[], sentences[], predictions|null, motivation[]}.
- Global HarborUI: scene(ctx) -> Node|null (a div.hb-wrap holding the svg and caption); pure TEXT, PLACES, lightLevels(view, now, E?) -> {lighthouse, cove, garden, pier, compass, weather: 0-5}, lightOpacity, ariaLabel, hidden, still. Consumers: Today (typeof guard), game-tutorials may embed.
- data-tour names added: quicklog-button, quicklog-intensity, quicklog-save, insights-triggers, insights-heatmap (written as literal pairs; a variable does not count for guards).
- data-test hooks (consumer: tests-docs hooks.mjs): Today: today-page, today-log-craving, today-sos, today-checkin, today-checkin-go, today-plan, today-battle, today-want, today-learn, today-quests, today-reasons, today-counters, today-momentum, today-explorer, today-tip, today-tip-go, today-tip-dismiss, today-backup, today-backup-dismiss, today-milestone, today-milestone-thanks, today-maintenance, today-harbor. Track: track-page, track-add, track-sos, track-back, track-counters, track-timeline, timeline-row (data-type), timeline-more, timeline-log-first, track-insights-link, track-choose, log-kind-<type>, log-<type>, log-<field> (intensity, triggerIds, emotion, thought, redFlag, tried, helped, notes, mood, anxiety, peakCraving, pleasantCount, used, sleep, meeting, intention, kind, minutes, name, enjoyment, date, substance, situation), log-checkin-morning, log-checkin-evening, log-error, log-save, slip-lead, slip-steps, slip-done, slip-next, slip-back. Insights: insights-page, insights-empty, insights-log, insights-back, insights-card (data-card), insights-caveat, insights-trend, insights-bars, insights-heat, insights-heat-table, insights-skills, insights-unavailable. Harbor: harbor-scene; classes hb-still, hb-moving.
- FIX-EMBED: TodayUI.cardsFor now lists 'game' (after 'momentum') and 'more' (after 'tip'); maintenance list unchanged. No new route, event, data-test or data-tour name.
- No events, content keys or Actions verbs added. Verbs used: A.settings.patch, A.recordEvent, A.markTipShown, A.logCraving, A.logFeeling, A.checkin, A.logActivity, A.logSlip.
- Routes linked: #/track/log/*, #/track/insights, #/sos, #/sos/slip?preview=1 and ?logged=1 (actions-sos), #/actions/planner, #/actions/battle, #/actions/quests, #/workbook/reasons, #/settings/data, #/learn.

### Gates
VERIFIED at tip 3f3001e (check, 2026-11-07):
- build GREEN: C:\Users\ruchi\1-addic-wt\_logs\gates\today-track\build-20261107-164343.log
- test GREEN, 26 pass 0 fail (today-track.test.mjs): ...\test-20261107-164345.log
- validate GREEN: ...\validate-20261107-164347.log
- guards RED on 10 names, all baselined (baselines.md lines 29-35, 38-40), other lanes': planner-day, planner-gaps, planner-add, bp-new, bp-form, workbook-groups, workbook-card, review-start, plan-sections, plan-print. This lane lifts its five (quicklog-button, quicklog-intensity, quicklog-save, insights-triggers, insights-heatmap). No new failure: ...\guards-20261107-164348.log
- Territory 1ef2482e..HEAD: 5 files, 4 own (ui-harbor.js, ui-today.js, ui-track.js, today-track.test.mjs), 1 shared (styles.css, append only inside the today-track section, banner line 382, ends line 463); 0 errors, 0 warnings; no token redefined; build.mjs, shell.html, ui-core.js, engine.js, store.js, actions.js untouched; all 7 new commits carry both trailers.
- Earlier (13eba28, 16:13 IST): build ...\build-20261107-162044.log, test 10 pass ...\test-20261107-162045.log, validate ...\validate-20261107-162045.log, guards RED 15 baselined names ...\guards-20261107-162045.log.
ASSUMED (not run):
- Browser gate: the lane adds no browser tests; tests-docs owns browser.test.mjs and hooks.
- Reading level (grade 6-8) by manual read only.
- Clinical review of the slip copy and red-flag label (UI strings, not Content).
- #/sos/slip?preview=1 and ?logged=1 rendering (actions-sos's).
- The engine's slip rule (totals unchanged) is the engine's; the lane's test consumes it.
- Builder logs: ...\build-20261107-163908.log, build-20261107-164159.log, test-20261107-164201.log, validate-20261107-164215.log, guards-20261107-164215.log (same folder).
- offline/1-addic.html is build output, left uncommitted.

VERIFIED at tip 6b0184b (check, 2026-11-07 23:17 IST, commits after 7485e254):
- build GREEN: C:\Users\ruchi\1-addic-wt\_logs\gates\today-track\build-20261107-231952.log
- test GREEN, 31 pass 0 fail 0 skip (five FIX-EMBED tests, ok 27-31): ...\test-20261107-232003.log
- validate GREEN: ...\validate-20261107-232007.log
- guards GREEN 5/5: ...\guards-20261107-232008.log
- Territory 7485e254..HEAD: 2 files, 2 own (ui-today.js, today-track.test.mjs), 0 shared; 0 errors, 0 warnings; shell.html, ui-core.js, engine.js, store.js, actions.js, styles.css untouched.
ASSUMED (not run, 23:17): browser gate. Builder reports GREEN 13/0/6 before and after (browser-20261107-224054.log, browser-20261107-224528.log, same folder); the check did not confirm (memory short). The 6 skips: #/onboarding x2, #/sos x3 (actions-sos not merged), hook quicklog-button (on #/track only, flow starts on Today; R-S-16 to CORE).

### Review gates
None (not flagged).

### Check
2026-11-07 16:13 IST: PASS at 13eba28. Findings, both LOW:
- C1 LOW, U-15, ui-today.js: check-in times ignored profile.checkin. Fix 87c03f1. Re-check at 16:31 run: fixed (today-track.test.mjs:121-135).
- C2 LOW, U-15, test found calls by position. Fix e845599. Re-check at 16:31 run: fixed (found by name, :219-222).
2026-11-07 16:31 IST: PASS at 3f3001e, judged commits after 13eba28 (U-16, U-17, U-18). Findings: none. Each unit's named tests exist and pass; a slip changes no total (:418-447); tour-name test (:531-532); fallback test without UI.svg; scene returns null in Calm and discreet.
Not checked: browser gate, reading level by tool, clinical review of slip copy, actions-sos slip routes.

2026-11-07 23:17 IST: PASS at 6b0184b, judged commits after 7485e254 (FIX-EMBED). Findings: none. Meets R-S-14 (ui-today.js and its test only). U-15 to U-18 present in base, confirmed by passing named tests and lifted guard names, not re-read.
Not checked: browser gate; U-15 to U-18 line by line; GuidanceUI.dot with the real module on a profile with newDots planner/quests (stand-in only).

### Review
Not a flagged lane: no reviewers run. Review findings: none (2026-11-07 23:17 run: none).

### Safety and content marks
No clinicalReview: true passages and no verify: true resources added (no Content added). Reviewer candidates, UI strings: ui-today.js TEXT milestoneBody and backupBody; ui-track.js TEXT slipLead ("A slip can happen. Noting it helps you and your plan learn what to change. Nothing you have built is taken away."), slipDone, slipDoneBody, and the redFlag label. SOS is never gated; no overdue wording, no streak words; risky times and types shown in words, not colour alone; slip is logged with no total changed; Harbor light never dims and motion is off under reduced motion and on SOS routes; insights make no cause claims and show the small-sample caveat; all data stays on the device.

### Requests for other lanes
- tests-docs (offline/tests/helpers/hooks.mjs): add the hooks listed under Contract changes (Today, Track, Insights, Harbor); browser flows for Today, logging each kind, a slip, Insights below and at seven logs, Harbor still/moving.
- actions (offline/src/actions.js:165): SETTINGS_DEFAULTS counters: true; confirm intended.
- actions-sos: #/sos/slip?preview=1 and ?logged=1 must render (linked from the slip log).
- game-tutorials: coach marks may target the five new data-tour names.
- game-tutorials: Today now embeds GameUI.panel, GuidanceUI.explorerRing, moreTools and dot; keep those names and signatures. Real-module dot test is open.
- core (R-S-16): add the quicklog-button hook where the flow starts on Today, not only on #/track.
- engine: none; rowsOf/rowOf drop sample rows, which this lane follows for Insights counts.

### Docs owed
- Guide (tests-docs/docs): the Today, Track, Insights and Harbor pages. offline/README.md: none. CLAUDE.md lines: none.

### Open questions
1. milestoneDue returns the highest reached-and-unseen milestone (brief said first); Thanks marks all up to it seen. Default: highest.
2. No "Explorer dismissed" setting; the ring hides when E.explorerDone is true.
3. C1 closed: profile.checkin times are used; fixed 12:00/17:00 only without them.
4. Counters on by default, so tracking depends on a start date.
5. Trigger ids saved are E.triggerChips ids ("kind:slug").
6. Fields use ui-track.js's own builders, not UI.form (Node tests run on the stand-in DOM).
7. Slip saves then routes to #/track/log/slip?saved=1 (a Store change re-renders the page).
8. Check-in with no kind: morning before 15:00, else evening.
9. Track line counts own logs only (code over brief); U-16 test now expects 2.
10. Tour targets sit on the insights cards, not the SVGs.
12. FIX-EMBED: dot only by Planner (plan card) and Quests links; ring in a plain section.card; 'more' shows in Calm and discreet.
11. Prediction wording is neutral. scene(ctx) returns a div.hb-wrap, not the bare svg; without UI.svg no scene.

### For the HUB at the merge
- Shared file: offline/src/styles.css, section appended at end (banner line 382, after /* -- end core -- */, now ends line 463); no token redefined. build.mjs already lists ui-today.js, ui-track.js, ui-harbor.js (unchanged).
- package.json and package-lock.json: no change.
- Conflicts to expect: styles.css append point only.
- Guards stays RED on the 10 other-lane tour names in baselines.md; this lane lifts five.
- Uncommitted offline/1-addic.html is regenerated build output; never commit it.
- FIX-EMBED touches ui-today.js only; no new conflict point.
- Browser tests for these pages wait on tests-docs adding the hooks.
