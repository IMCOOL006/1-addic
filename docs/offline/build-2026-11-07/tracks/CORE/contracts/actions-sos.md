# Contract: lane actions-sos (BUILD-PLAN 3.2, 3.4, 3.5, 3.7). "wait" = not at base 655516dc (base has only content-core.js, content-lessons-a.js). Consumers named; "none yet" otherwise.

## Actions (offline/src/actions.js, new; classic script `const Actions`, module.exports guard). All verbs async, return the written rows/events; failure = `AppError(message, code)`, nothing written.
| Verb | Args | Writes | Events | Errors | Consumer |
|---|---|---|---|---|---|
| onboard(patch) | profile fields of 3.4 | profile `me`, settings `app` | OnboardingCompleted (once) | bad-profile | ui-onboarding |
| settings.patch(patch) | 3.4 settings keys | settings `app` | none | bad-setting | workbook-settings |
| recordEvent(type, payload) | known 3.7 type | events | that type | bad-event | game-tutorials, learn |
| logCraving(e) / logFeeling(e) | {intensity 0-10, triggerIds[], thought?, redFlag?, feelings[], skills[], notes?, emotion?} | logs | LogCreated, SkillUsed per skill | bad-log | today-track |
| checkin(kind, data) | 'morning'/'evening', mood, anxiety, peakCraving, pleasantCount, used, sleep, meeting, intention | logs type checkin | CheckinCompleted | bad-checkin | today-track |
| logActivity(data) | {kind, minutes, name, enjoyment} | logs | ActivityDone | bad-activity | today-track, actions |
| logSlip(data) | {date?, substance?, situation?, notes?} | logs type slip | SlipLogged | bad-slip | today-track, ui-sos |
| sosSession(s) | {kind, ratingBefore, ratingAfter, tools:[{skillId, helpful}], delays, used, risky, outcome, drill} | logs (not drill) | LogCreated, SkillUsed*, SosCompleted, SlipLogged if used; drill: TutorialCompleted('drill') once only | bad-session | ui-sos |
| completeLesson(id) | lessonId | none | LessonCompleted (once) | unknown-lesson | learn |
| checkpoint(moduleId, answers) | answers[] | none | CheckpointCompleted (once), ModuleCompleted | bad-checkpoint | learn |
| saveResponse(exerciseId, payload, {mode, draft}) | | responses (append-only) | ArtifactSaved or ExerciseDone by exercise kind; none when draft | unknown-exercise | learn, ui-onboarding |
| contacts.add/update/deactivate(id) / reached(id, how) | Contact of 3.4 | contacts | ContactReached on reached | bad-contact | workbook-settings, ui-sos |
| plans.add/update/remove, plans.debrief(id,{usedPlan,how}), weeklyReview(data), todos.add/done/remove | 3.4 | plans, todos | BattlePlanCreated, BattlePlanDebriefed, WeeklyReviewCompleted | bad-plan | actions |
| motivation.add({stage, score, plusOne, source}) / predictions.add/complete / quests.tick(questId, stepId) | 3.4 | motivation, predictions, quests | none / none / none | bad-* | ui-onboarding, actions |
| tutorial.done(id,{skipped}) / tutorial.replay(id) / reveal(featureId) / markTipShown(id) | | tutorials, reveals, tips | TutorialCompleted (once), FeatureRevealed | | game-tutorials |
| recoveryPlan.save(sections,{confirm}) / scriptUsed(responseId) | | recoveryPlan `plan` | RecoveryPlanConfirmed (once), ScriptUsed | bad-plan | workbook-settings, ui-sos |
| loadSample() / eraseAll() / importBackup(obj) | | meta `sample`; all; replaceAll | none | no-sample, bad-backup | workbook-settings |
Event shape: `{id, type, at: ISO, payload}`. SlipLogged payload `{date, logId}`; SkillUsed `{skillId, helpful, logId}`; SosCompleted `{kind, outcome, ratingBefore, ratingAfter, delays, logId}`; TutorialCompleted `{id, skipped}`. Status: all wait for the file (U-09 slice).

## Relied on, waiting for other lanes
- Store (core U-04, wait): load, view.get/list/count, commit(label, fn), subscribe, bulk, status(), exportJson, replaceAll, resetAll, lock.set/unlock/verify/remove/lockNow/touch, STORES (3.2/3.3). Stand-in in actions.test.mjs.
- Engine (engine U-05..U-08, wait): id, todayStr, dateStr, counters, AppError, validateBackup, migrateBackup, reasonsCard, distractionDeck, comebacks, spiralThoughts, guideSequence (as `Engine.sos.guideSequence` or flat; verify at switch-over), crisisKeywords.
- UI core (core U-03, wait): UI.h, UI.go, UI.route, UI.pages, UI.ctx, UI.speak, UI.stopSpeaking, UI.night, UI.toast, UI.sheet, UI.confirm, UI.form. Optional `UI.tour.start(id)` (game-tutorials).
- Content (base): resources.in {emergency, crisis, groups, treatment, verifyNote, context}, resources.intl.lines, resources.overdose[], resources.withdrawal[] (content-core.js:417-463); emotions with `hopeless.crisisCheck` (:36-45); terms (:15), stages (:28), paces (:47), substances (:22), discreetName (:12); catalogs.reassuring, acceptance, angerSelfTalk, assertiveLine, slipSelfTalk, spiral, distractions, activities (:300+); tutorials 'tour' and 'drill' (:227); xp (:113). Waiting: Content.practices (SOBER, give-it-a-beat), Content.sample.generate, early-access wording.

## Added by U-10 / U-11 (ui-sos.js, ui-onboarding.js; new files, wait for core U-03)
Routes: `#/sos`, `#/sos/craving`, `#/sos/feeling`, `#/sos/slip` (`?preview=1`), `#/sos/urgent`, `#/sos?drill=1`, `#/lock`, `#/onboarding`. Registered: `UI.pages.sos`, `UI.pages.lock`, `UI.pages.onboarding`. Exports: `UI.sosHelpers = {urgentList(region, Content), outcomeFrom(before, after, used), isCrisisEmotion(id)}`; `UI.sosUrgentView(ctx)` (the shared urgent node, used by the lock screen). Consumers: ui-core router (lock redirect), game-tutorials (drill is ours, tour theirs), tests-docs.
DOM hooks (data-testid via `dataset`; stable): `sos-hub`, `sos-craving`, `sos-feeling`, `sos-slip`, `sos-urgent`, `sos-drill-banner` (drill mode shown), `sos-rating`, `sos-timer`, `sos-tool-<wave|why|call|distract|talkback|guide>`, `sos-reassess-passed`, `sos-reassess-still`, `sos-used-yes`, `sos-used-no`, `sos-finish`, `sos-feeling-<emotionId>`, `sos-crisis` (numbers block shown at once), `urgent-number-<n>` (tel link), `urgent-copy-<n>`, `urgent-verify` ("please verify" label), `lock-pin`, `lock-unlock`, `lock-urgent`, `lock-sober`, `onb-step-<1..8>`, `onb-next`, `onb-skip`, `onb-safety-ok`, `onb-finish`, `onb-tour-offer`, `early-notice`, `early-notice-dismiss`.
data-tour targets this lane carries: `sos-urgent` (urgent entry on the SOS hub), `sos-craving` (the craving button). The `sos-button` itself and nav targets are core's. Consumers: tests-docs (browser), game-tutorials (tour). Status: all wait for U-10/U-11.

## Additions from actions-sos U-10 and U-11 (1507640, c629cae on build/actions-sos), written in by the CORE chat 2026-11-07 09:33 IST (nothing removed; the code wins)

- **DOM hooks for tests-docs (data-test, beyond the listed ones).** SOS: sos-go-urgent, sos-go-craving, sos-go-feeling, sos-go-slip, sos-leave, sos-plan, sos-preview-banner, sos-motivation, sos-slip-continue, sos-slip-safe, sos-slip-help, sos-slip-review, sos-slip-todo, #sos-feel-text; sos-rating buttons carry data-value 0-10; urgent-number-<n> is 1-based over the items that have a number. Lock and onboarding: lock-page, lock-forgot, #lock-msg, onboarding, onb-medical-card, onb-pin, onb-pin2, onb-pin-set, onb-tour (only when UI.tour exists), onb-drill; onb-finish is labelled 'Go to Today'. data-tour: sos-urgent, sos-craving. Full list: C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/actions-sos__units.md.
- **Helpers.** `UI.sosHelpers.urgentList(region, Content) -> {region, sections:[{id, name, verifyNote, items:[{name, number, tel, alt, altTel, url, note, verify}]}], overdose[], withdrawal[]}` (the person's region first, then the other list); `isCrisisEmotion(id, Content?)`, `isCrisisText(text, Engine?)`; `UI.sosUrgentView(ctx, {crisis})`, `UI.sosSoberView(onDone, label)`, `UI.onboardingHelpers`. The in-file crisis word list always applies beside the engine's, so the check never covers fewer words.
- **What ui-sos reads from Engine (U-07, not built yet; tolerant readers):** `crisisKeywords(text)` as a boolean or an array of matched words; `guideSequence(view)` (flat or `Engine.sos.guideSequence`) as tool ids among wave|why|call|distract|talkback; `reasonsCard(view)`, `distractionDeck(view)`, `comebacks(view)` as strings or {reasons|items|cards}; `spiralThoughts(view)` as strings or {thought, reply}.
- **Globals in the built page.** Each part is its own classic script, so `const Content`, `Engine`, `Store` are not globalThis properties: read them with `typeof X !== 'undefined' ? X : null`, never `globalThis.X` (a vm test guards it in actions.test.mjs). Every screen lane: the same rule.
- **The chat's rulings 2026-11-07 09:33 IST (built in actions-sos' follow-up run):** (1) a new person (no profile.onboardedAt, not locked) who opens the app on the default route (#/ or #/today) is sent once to #/onboarding with replace, never from SOS, the lock or any other route; ui-onboarding.js does it on the ui:route event (no change to ui-core). (2) `Actions.sosSession` takes an optional `emotion`, so a feeling session saved without a rating keeps the feeling the person chose.
- **Sample data (O6; consumer workbook-settings; check C3 at c629cae):** `Actions.loadSample() -> {sample, count, skipped}` never overwrites the person's rows (keyed rows profile/settings/recoveryPlan and existing ids are skipped and counted in `skipped`); every sample row is marked; `Actions.eraseSample() -> {erased}` removes only the marked rows (actions.js:909-925).


## The CORE chat's rulings 2026-11-07 10:45 IST: actions-sos' review findings still open at 5cfed71 and the reviewers' questions (session 06ee0d0d; built in its follow-up run, batches FIX-SAFETY-AS then FIX-ONB-EMO)

The review fix round at 5cfed71 never saw RS2 to RS9: its prompt was cut at 2,000 characters. Their full text is in C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/actions-sos__review-open.md.

**FIX-SAFETY-AS** (each a commit naming its id; where code changes, a test red first):
- RS2 (HIGH): widen CRISIS_RE as the finding says. It must cover straight, curly and missing apostrophes, and 'don't want to live / be here / be alive / wake up', 'can't go on', 'end it / end it all / ending my life', 'take my own life', 'wanna die', 'kms', 'nothing to live for', 'no reason to live', 'hurt / cut / hang myself' and 'overdose on purpose'. Add positive and negative test phrases, and mark the list clinicalReview.
- RS3: the withdrawal label is 'Heavy daily drinking or sedatives: stop with a doctor.' (clinicalReview).
- RS4: the primary slip button says 'Log it and go on'. A ghost button 'Just reading' goes on and logs nothing. A pure helper and a test pin which choice writes.
- RS5: when opioids is ticked, the card adds Content.resources.opioidSafety when it is present. Otherwise it adds one built-in line: 'After a break, your tolerance drops. Never use alone. In an emergency, call for help.' (clinicalReview).
- RS6: 'please verify' appears beside each meetings group with verify:true (data-test meetings-verify).
- RS7: the feeling flow asks once at its end, 'What helped?', with toggles that start off. A toggle left off writes helpful:false.
- RS8: UI.sosSoberView takes a title: 'Breathe' when discreet. The step line becomes 'Notice what you feel in your body.'
- RS9: spiralPairs skips any thought that isCrisisText flags or that contains 'hopeless'.
- FALLBACK.talkback is 'I can wait 15 minutes and let this wave pass.' (clinicalReview).
- In crisis mode the verify note is one short line: 'Please check these numbers.'

**FIX-ONB-EMO:**
- The 09:33 ruling (1): a new person (no profile.onboardedAt, not locked) on #/ or #/today is sent once to #/onboarding with replace. This never happens from SOS, the lock or any other route. It is done on ui:route in ui-onboarding.js.
- The 09:33 ruling (2), Actions.sosSession taking an optional emotion: check caed857 and add only what is missing.
- Q1 of core's review: an SOS commit that fails with LOCKED keeps the session in memory and saves it after the next unlock.
- RC10: there is one outcome enum, 'passed'|'still'|'used' (the code's). engine.md now says the same.
- PIN fields: autocomplete 'one-time-code', inputmode numeric, pattern [0-9]*, 4 to 12 digits. The PIN help adds 'Set a PIN before you write anything private.'
- O6: step 1 of onboarding gets a ghost button 'Look around with sample data' (Actions.loadSample: marked, erasable in Settings).
- The drill says 'Nothing goes in your log.'
- The motivation slider starts with no value and saves only when the person moves it or confirms it.
- A start date after today is refused: max on the input, and Actions refuses it with the code FUTURE_DATE.
- The slip flow shows COPY.reach.
- Leaving a craving flow by Urgent help or Back to SOS after at least one tool saves those tools as one session with outcome 'still'. The save happens after the next screen draws, never before the numbers.
- recordEvent refuses SosCompleted, LogCreated, SkillUsed and SlipLogged (the code USE_VERB: each has its own verb).
- actions.test.mjs pins its clock. quick-reasons expects ArtifactSaved only when Content gives it the kind build, assess or plan.
- recoveryPlan.graduatedAt is set once, by the verb that writes RecoveryPlanConfirmed, and never cleared.
- Every import goes through Actions.importBackup (core's Q5).

**Rulings on questions that need no code here:**
- sms: is accepted beside tel: and Copy. It opens the device's own app, and this file sends nothing.
- While locked, the region is unknown: the India list comes first, then the international list, as now. No plain region flag. The content lane is asked by outbox for a number on the intl local-emergency item.

## The CORE chat's rulings 2026-11-07 13:55 IST: review round 2's open findings at fc0d038 (session 036d08b8; built in the run's batches FIX-R2-SAFETY then FIX-R2-REST)

- **DOM hooks added by c270a01 (RC14), part of the contract from now on:** sos-step-next, sos-step-done (soberView and the Done buttons of cards() and contactsView()), sos-helped-yes, sos-helped-no, sos-rate-skip, sos-checkin. The trunk's tests/helpers/flows.mjs and hooks.mjs drive them in tests-docs' next run (a fix by name to U-34, after actions-sos merges): RC14's remainder is not this lane's.
- **RS10 (HIGH):** the typed-text crisis check also matches the inflected and nearby forms the reviewer lists (killing myself, hurting/harming/cutting myself, self-harm in its forms, want(s/ed/ing) to die, thoughts of / thinking about death, dying or suicide, not worth living, never wake up), with one test per phrase. When unsure, the check shows the numbers: a false positive is allowed, a miss is not.
- **RS11:** Next on the privacy step with digits in either field runs the same check as Set PIN and sets the PIN; if they differ or are invalid, stay on the step and say why. Never go on with a typed PIN that was not set.
- **RS12:** the lock screen and the tab title follow the discreet flag while locked: localStorage '1-addic:discreet' and UI.applyDiscreet (core C5, 98f872d): 'Notebook' title and the discreet labels. On the trunk before core merges, use the flag through a guard. The browser case goes to tests-docs.
- **RS13:** 'Look around with sample data' on step 1 loads the sample, then shows the safety step (the one that cannot be skipped), then Today after 'I understand'.
- **RS14:** outside the drill, SOS never shows sample rows (sample === true) as the person's own: Call someone and Remind me why skip them. No tel: or sms: link ever points at a sample number.
- **RS15:** while locked, Call someone and Remind me why say the people and reasons are hidden while the notebook is locked (not the empty-state lines). Urgent help stays one tap away.
- **RS16:** #/sos/slip?logged=1 shows 'It is in your log.' and one primary 'Go on' (no 'Just reading').
- **RS17:** on the privacy step with a PIN already set, show 'A PIN is set. You can change it in Settings.' instead of the fields.
- **Check C2:** a save kept for the next unlock is dropped when the Store is reset (Forgot PIN erase) or replaced (import) first.
- **Check C3:** the slider gets a small confirm button that saves the shown value; moving it still saves.
- **Check C1 (trailers):** no fix. 9a970ec..5cfed71 come from session 224074c0 and carry its trailer; history is never rewritten.
