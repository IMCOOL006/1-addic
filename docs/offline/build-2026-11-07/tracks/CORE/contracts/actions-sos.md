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

## The CORE chat's rulings 2026-11-07 15:46 IST: the safety re-check's new items at a8dce5a (run wf_b38141d2-651; fixed by name in one more fix round)

- **RS19 (HIGH):** typed text also routes to the numbers for: want/wish/rather/ready (to) be dead, better off dead, (go to sleep and) not wake up / never wake up, no longer worth living, want it (all) to end, end my life / end it all, wish I was never born, disappear forever, (everyone/they'd be) better off without me, no reason to live. One test per phrase; 'dead tired', 'killing time', 'I hurt my knee' stay negatives. When unsure, show the numbers.
- **RS20 (LOW):** while Store.lock.set derives the key, Next and Skip are disabled and a short line says the PIN is being set; no step is skipped unseen.
- **RS21 (LOW):** a slip save kept for the unlock (not written yet) never reads 'It is in your log.': that case says 'It goes in your log when you unlock.'
- **RS22 (STALE-LOCKED):** when save() is refused LOCKED but Store.status() says unlocked (another tab changed the lock), retry the write once, at once; keep it for the unlock only if that also fails.
- **RS23 (overdose):** typed 'overdose', 'overdosed', 'OD' as a word or 'took too much' opens the full urgent view (with the overdose card), not the crisis view. clinicalReview: true.
- **RS15 question (an Unlock link):** no link; the line stays as it is (the shorter version). **Guards question:** to the HUB (R-C-19).

## The CORE chat's rulings 2026-11-07 16:17 IST: the safety re-check's items at 1131827 (run wf_32a8784b-3af; RS19-RS23 FIXED there; these are fix round FIX-R4)

- **RS24 (HIGH, the class, not one more phrase list):** a phrase list always misses some wording. So on 'Something else', whatever the person types, the next screen shows the urgent-help line with its numbers (one tap) above the steps; a match still opens the crisis view at once. Also add the re-checker's phrases (hope/wish I don't/didn't wake up, wanna be dead, hope I die, wish I hadn't been born, wish it would all end, better off if I was/were gone or dead), one test each.
- **RS25 (MEDIUM):** 'took/taken too many (pills|tablets|sleeping pills)', 'used too much' open the full urgent view with the overdose card.
- **RS26 (the person's data):** RS22's retry never writes into a notebook that was erased, reset or replaced in the meantime: when the C2 signal fired (or the store's lock row changed identity), the save is dropped, never retried.
- **RS27 (LOW):** a kept save dropped after the unlock for any reason shows one short toast ('This was not saved.'). 'It goes in your log when you unlock.' stays.
- **RS28 (LOW, clinical review):** when typed overdose words led to the urgent view, the overdose card is open, and the view's first line is announced (aria-live assertive). 'I could not wake up this morning' matching '(not|never) wake up' is an accepted false positive (it errs towards the numbers).

## Shapes for SCREENS 16:22 (R-C-21; CORE 06285082)

- `Content.catalogs.spiralPairs` ([{thought, reply}]) is read by ui-sos.js when present (actions-sos round FIX-SCREENS-ASKS, after READY); the fallback order stays Engine.spiralThoughts, then catalogs.spiral with catalogs.slipSelfTalk replies; RS9's filter applies to every source.
- `ExplorerCompleted` is written, if at all, by `Actions.recordEvent('ExplorerCompleted', {})` (allowed, once ever); no verb.
- Sample rows (sample: true) award nothing in any derivation (10:45 ruling, unchanged).
- FIX-SCREENS-ASKS also adds one link 'Open my Reasons Card' to `#/workbook/reasons?big=1` on the SOS 'Remind me why' card, shown only when unlocked and not in drill or preview.

## The CORE chat's rulings 2026-11-07 17:04 IST: the safety re-check's items at 5c2e7a7 (run wf_157ff262-161; RS25, RS27, RS28 FIXED; these are fix round FIX-R5; CORE 06285082)

- **RS24 remainder (HIGH, the class for 'Somewhere else'):** the lead above the steps always has at least one one-tap number, in every region and whatever Content holds. For intl: the local-emergency line (read `tel` as well as `number`, see RS29); if that list gives nothing, the built-in 112 entry (the same one core's URGENT uses when Content's list is empty), with 'Please check this number.' The lead also carries one link 'All urgent help' to the full urgent view. The test asserts at least one tel: link in the lead for 'in', for 'intl' on the trunk content shape ({name, tel: '112', verify: true}) and for an empty Content.resources; an assertion that passes on an empty list is not a test.
- **RS29 (MEDIUM, new):** urgentItem reads `x.number || x.tel` (both fields, every list: urgent help, the crisis view, the lead, the lock screen). A test on the trunk content shape: a tel:112 link in the Elsewhere section and in the intl lead.
- **RS30 (LOW, new, the crisis path):** the lead is read first: the focused step title's aria-describedby points at the lead line (the lead keeps its place above the title). A test: the focused title's description includes LEAD.line.
- **RS31 (RS25's question, clinical review):** OVERDOSE adds painkillers, paracetamol, medicine(s), medication(s), capsules, 'a whole bottle of (pills|tablets)', 'swallowed all my (pills|tablets)'; one test each, negatives kept ('I took my medicine', 'too many people'). 'I've had too much to drink' stays at the lead (numbers above the steps), no overdose card. clinicalReview: true.
- **RS32 (RS24's question, clinical review):** ui-sos's CRISIS list adds the eight phrases the re-checker found at the lead only ('I hope that I don't wake up', 'I wish it would all (just) end', 'I wish it would just stop', 'I want it all to stop', 'I can't do this anymore', 'no one would miss me', 'I'd be better off gone', 'I want to sleep forever'), so they open the crisis view; one test each. The same phrases and RS31's words go to engine as a request for Engine.crisisKeywords (offline-v1.1, by name).
- **The phrase lists are closed for this release.** The class rule is in force: any text that misses the lists gets the lead with numbers above the steps. A phrase found later is LOW for offline-v1.1, never a reason to hold READY.
- **RS26 remainder (another tab erases and sets a new PIN):** ruled for offline-v1.1. core adds an opaque `Store.status().lockId` (changes when a lock row is created, removed or replaced; never derived from the PIN), and actions-sos adds it to the save's mark with a feature check. Not this round; actions-sos READY is not held for it (the lane cannot close it alone).
- **RS22 question:** yes, any lock-row change drops the save, removal included (never write into a notebook whose lock changed; the SOS flow itself goes on). RS22's test is renamed to the one case it still covers (this tab locked and unlocked during the save) and drives that case.
- **RS27 copy question:** 'This was not saved.' stays as it is: short, and it names nothing private (discreet mode, a shared screen). For copy and clinical review later.

## The CORE chat's rulings 2026-11-07 17:22 IST: R-H-27 / R-S-9 for actions-sos (round FIX-R6, after FIX-R5 returns; CORE 06285082)

- **RS-SAMPLE (MEDIUM, the person's data; a tag condition of offline-v1.1):** Actions.loadSample never writes over an own row: it skips profile 'me' and settings 'app' when a row without sample: true exists (the rest of the sample loads), and eraseSample removes only rows with sample: true. Tests: an onboarded profile and settings survive loadSample then eraseSample unchanged; a fresh store still gets the sample profile.
- **RS9T (test-only):** actions.test.mjs 'validation failures write nothing' (:304) uses a stub Content without `sample` for the refusal case, so it passes with and without Content.sample.
- FIX-R6 also carries whatever FIX-R5's re-check leaves open (HIGH or MEDIUM only).
- **Kept for FIX-SCREENS-ASKS (after READY):** comebacksFrom reads Content.comebacks before FALLBACK.talkback; spiralPairs; the Reasons Card link; the R-C-9 copy suggestions (each for clinical review; the built copy stands until then; COPY.withdrawal may take SCREENS' line 'Stopping heavy daily drinking or sedatives suddenly can be dangerous. Talk to a doctor first.').

## The CORE chat's rulings 2026-11-07 17:57 IST: the safety re-check at 1cfc936 (run wf_fa0d78f5-b07; RS24, RS29-RS32, RS22T FIXED; these join FIX-R6)

- **RS33 (MEDIUM, a regression of 27b4f3b):** every urgent line draws its note whenever it has one, with or without a tel (urgentView and leadView), so 'Usually 112, 911 or 999' shows beside the one-tap 112. A test on the trunk shape.
- **Q-BUILTIN (ruled yes, the RS24 class):** urgentList falls back to the built-in 'Emergency 112' with 'Please check this number.' when Content gives no section, so the full urgent view, the crisis view and the lock screen's list always have one number. A test with empty Content.resources.
- **Q-SPIRAL (ruled):** RS9's filter drops a crisis or 'hopeless' thought only when it would get a stock reply; a thought the person answered with their own reply keeps its pair (their own words).
- **RS34 (LOW):** more overdose wordings ('I took 20 pills', 'the whole bottle'): offline-v1.1 by name (the lists are closed; the lead with numbers covers them).
- **FIX-R6 is therefore:** RS-SAMPLE (MEDIUM, a tag condition), RS33 (MEDIUM), Q-BUILTIN, Q-SPIRAL, RS9T. Then the safety re-check; READY when it is clean of HIGH and MEDIUM.

## Rulings 2026-11-07 22:25 IST (CORE 93bffdb7): the FIX-R6 safety re-check (RS35-RS37 and its four questions)

- RS35 HIGH (regression of Q-SPIRAL 934b85a): a reply counts as the person's own only when it is not a stock line (the normalised set of catalogs.slipSelfTalk, the catalogs.spiralPairs replies and FALLBACK.spiralReply); a crisis or hopeless thought with no own reply never reaches the slip flow with a stock line. The lane's stock-line check is the guard in offline-v1.1. The engine side (spiralThoughts returning the person's reply apart from a filled one: reply '' plus stockReply) is an engine fix by name, FIX-SPIRAL-OWN, for after actions-sos merges; until then nothing in actions-sos may depend on it.
- RS36 MEDIUM: shouldOnboard treats a profile marked sample: true as no profile (once a visit, sentOnce keeps it to one redirect); SOS reads stage and region from the person's own profile only (isOwn), defaulting region 'in'. No Today card in this round (SCREENS' territory; a later ask if the owner wants one).
- RS37 MEDIUM: a change the person makes to a row marked sample: true makes the row theirs: the update verbs (contacts.update, plans.update and the other update verbs of actions.js) drop the mark when the patch changes a field. No ask to SCREENS.
- The sample profile's startDate (content-sample.js:65-70 on the trunk): accepted under O6 for offline-v1.1. The sample is marked and erasable by design; its run is the sample's, shown while the sample is loaded; once the person onboards, their own profile row replaces it (ownRow). No Engine.counters change. Not a finding.

## Rulings 2026-11-07 22:52 IST (CORE 93bffdb7): FIX-R6 re-check returned (RS35 FIXED ed34fc8; RS36, RS37 PARTLY; one LOW); FIX-R7

- The sample-mark rule, refining 22:25 RS37: a patch that changes the value of a field that is not a true/false flag makes a sample row the person's (sample dropped). plans.debrief and predictions.complete always write the person's words or score, so they always drop it. A patch that changes nothing, or only true/false flags (todos.done; contacts' active from showContact or deactivate), keeps the mark: the words are still the sample's and go with Erase sample. One helper for every update verb. Events the person's verbs write stay in the append-only log either way.
- RS36's remainder: SOS reads stage and region from the person's own profile only (ui-sos.js :852, :539, :553 through isOwn; region default 'in'), as ruled 22:25. core's c.profile stays as it is (it hands the sample profile to screens that show the sample on purpose; no core change).
- FIX-R7 = RS37R (MEDIUM), RS38 (LOW, folded into RS37R's helper), RS36R (MEDIUM); full text: C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/actions-sos__review-safety.md, section FIX-R7. After FIX-R7: the contracts-and-tests lens re-reviews fca2781..HEAD (its last look was round 2), read-only.

## Contract changes since fca2781 and rulings 2026-11-08 00:02 IST (CORE 93bffdb7; the contracts re-review wf_66ea28b7-119, RC21)

These supersede the earlier lines they name (RC21: the code already does this; the text catches up):
- Actions.sosSession(v) takes an optional `date` (YYYY-MM-DD, today or earlier: a session kept across a lock is dated the day it was tapped) (RC16; supersedes line 13).
- Actions.saveResponse writes ArtifactSaved or ExerciseDone only for the kinds that earn them; another kind writes neither (RC17; supersedes line 16).
- Actions.recordEvent refuses with USE_VERB the seven verb-owned types: SosCompleted, LogCreated, SkillUsed, SlipLogged, RecoveryPlanConfirmed, OnboardingCompleted, ModuleCompleted (RC19; supersedes line 74's four).
- Actions.loadSample writes the sample's profile 'me' and settings 'app' (marked sample: true) only on a notebook with no own rows; it never writes over an own row; eraseSample removes only rows marked sample: true (RS-SAMPLE; supersedes line 43). Any change the person makes that changes a non-flag field of a sample row makes it theirs (claimRow, RS37R); a sample profile is not the person's for onboarding or SOS (RS36, RS36R).
- Route #/sos/slip?kept=1 (a slip saved across a lock). Hooks onb-score-ok, sos-urgent-lead, sos-lead-number-<n>, sos-lead-all and id sos-lead-line; note spans sos-note-<n> with aria-describedby on the tel links (for tests-docs' hooks round).

Rulings on the re-review's questions:
- Q1 (a plan's status over a sample plan): status is a state, treated as a flag for claimRow (a status change keeps the sample mark); and plans.update writes BattlePlanCreated only for a row that is the person's. LOW, offline-v1.1 by name (RC23); the tag does not wait for it.
- Q2 (a kept session after midnight: date the tap day, hour and at the unlock moment): accepted for offline-v1.1 (rare; nothing decreases; the heatmap shows it at the unlock hour). No engine change.
- Q3: the trunk merge preview runs in the lane check (the same workflow, only: check) before READY.
- Q4 (ui-tools.js:315 records SkillUsed through recordEvent, refused since U-09: a skill used in a game is not credited): offline-v1.1 by name: actions-sos adds a verb Actions.useSkill({skillId, helpful}) that writes SkillUsed with no log (FIX-USE-SKILL), then game-tutorials calls it (R-C-39 to SCREENS). Harmless meanwhile (the game catches it; nothing decreases).
- Q5: yes, RS-SAMPLE's "theirs starts fresh" is meant for settings as for the profile (dormant: the trunk sample has no settings row).
- RC22 (LOW, a test gap: the feeling flow's and the leave path's kept-session date are untested): offline-v1.1 by name.

## Rulings 2026-11-08 00:37 IST (CORE 11310a7c; the lane check wf_2b08aee9-a80, C-R7-1..3)

- The lane's tests must hold on the merged tree as well as in the worktree: the real store.js (PBKDF2 at 310000 iterations: a PIN set, unlock or kept save takes far longer than a few ticks) and the trunk's content (no 'hopeless' line in catalogs.spiral; the intl 'Your local emergency number' line has tel '112'). FIX-R8 is test-only: a wait is a condition with a timeout that fails loudly; a test that needs a content shape brings it as a stub restored in a finally; no assertion weakened. No public shape changes: verbs, events, routes, UI.pages and hooks stay as in the 00:02 section.
- Baselining these names instead was ruled out: they are the lane's own tests and the fix is small.
- 2026-11-08 01:28 IST: R8-RC1 (LOW, the FIX-R8 review): RS22's 'tried once more, at once' is held by the order of events since FIX-R8, not by time; C2 still fails a delayed retry. offline-v1.1 by name, FIX-RS22-AT-ONCE (count the refusal, wait for it, settle, assert calls === 2; probe in _logs/reports/actions-sos/fr8probe/). Trailers stay as the program's rules state.

## Ruling 2026-11-08 02:24 IST (CORE 10 6c9dfc8f): FIX-SPIRAL-OWN takes the additive form (V3-19)

- Supersedes line 151's engine shape: each pair of Engine.spiralThoughts(view) gains `own: true|false` (true only when the reply is the person's own words; false when filled from catalogs.slipSelfTalk); `thought` and `reply` stay as they are. ui-sos.js spiralPairs needs no change (it reads reply as before and may later read own instead of its stock-line set). Reason: additive, nothing that reads reply changes (V3-IMPROVEMENTS.md V3-19).


## 2026-11-08 02:50 IST · V3: Actions.useSkill (V-08a), published to game-tutorials (R-C-47)

- `Actions.useSkill({ skillId, helpful }) -> Promise<{ ok: true, event } | { ok: false, code, message }>`; never throws; a refusal writes nothing. Writes one SkillUsed event (payload skillId, helpful; no logId) through the verb path (VERB_OWNED keeps refusing recordEvent('SkillUsed')). Refusals: skillId not an id (isId), helpful not a boolean (isBool), the notebook locked, the sample rule RS-SAMPLE. Consumer: game-tutorials V-08b (ui-tools.js:315, behind a typeof guard). Replaces the 'FIX-USE-SKILL' line above (Q4, line 175).

## V3 (2026-11-08 02:52 IST)
At BASE (f69bc68a): Actions.useSkill is NOT yet there (V-08a adds it; actions.js export list :973; signature in the 02:50 section above; consumer game-tutorials V-08b at ui-tools.js:315, behind typeof A.useSkill === 'function'). Codes it returns: the AppError code of the refusal ('bad-skill', 'bad-event', 'sample-mode', or the store's lock code). Event: SkillUsed {skillId, helpful}, no logId; counted by Engine XP (engine.js:180, :248-260) and skill history (ui-learn.js:211).
Unchanged: recordEvent('SkillUsed') -> USE_VERB; VERB_OWNED actions.js:255.
V-SOS10: no new name; hooks stay data-testid (sos-rating, data-value 0..10, R-H-39); CSS `.sos-rating .btn`, consumed by tests-docs' screenshot U-35.
V-25: new hook data-testid 'lock-opening' (id lock-opening, aria-live polite) in ui-onboarding.js; consumer tests-docs hooks.mjs (HUB asked by outbox).
V-18: no public change. V-17b: waits for core V-17a: Store.status().lockId (string; store.js:121 internal today); ui-sos.js consumes it; no new public shape.

## 2026-11-08 03:01 IST · V3 rulings (CORE 11; R-C-48)

- useSkill refusals: the argument not an object; skillId not an id (isId) or not in Content.skills; helpful not a boolean; the store's own refusal (locked, no store) passed through. A loaded sample is not a refusal (no verb refuses for one; RS-SAMPLE): the SkillUsed event is the person's own, unmarked. The drill records nothing (ui-tools.js isDrill, before the call). This replaces the sample clause of the 02:50 section.
- V-SOS10: fixed in ui-sos.js ratingRow (the inline grid style, :440-444: the buttons keep '10' on one line at 390 px: nowrap and less inline padding); no styles.css edit; if unavoidable, a new `/* -- actions-sos -- */` section at the end of styles.css, never inside `/* -- actions -- */`.

- 2026-11-08 03:14 IST: the HUB (HUB 9) confirms both R-C-48 rulings: a loaded sample is not a refusal for useSkill or V-41's verbs (the person's own events written as usual; sample rows skipped by the Engine and Actions; the drill records nothing); V-SOS10 in ui-sos.js's inline style, no styles.css section.

## V3 R-O-6 (2026-11-08 03:11 IST)
Lane actions-sos, unit V-41 (PLAN-V3.md section 7). Public names; none exist at BASE f69bc68a (actions.js has no objective or questLine; export block :972-980; EVENT_TYPES :141):
- `Actions.objective.done(id) -> {ok:true, event: Event|null, already?: true} | {ok:false, code, message}`. Consumers: today-track V-43 (`objective-done`), tests-docs V-45.
- `Actions.objective.swap(id) -> {ok:true, event} | {ok:false, code:'swap-used'|'no-swap'|'bad-objective'|'not-today'|store codes}`; once a day. Consumer: V-43 (`objective-swap`).
- `Actions.questLine.claim(stepId) -> {ok:true, events:[QuestLineStepDone, FeatureUnlocked]|[]} | {ok:false, code:'not-ready'|'bad-step'|'locked'|'bad-reward'|store codes}`. Consumers: V-43 (`questline-claim`), V-44 (reward sheet reads events[1].payload.feature and Content.questLine[].opened).
- None of the three throws. Events: ObjectiveDone {id,date}; ObjectiveSwapped {from,to,date}; QuestLineStepDone {id}; FeatureUnlocked {feature, by:'questline'}. recordEvent of these four -> USE_VERB. Once-only: QuestLineStepDone by id, FeatureUnlocked by feature. Event consumers: engine V-40 (conditions, growth, run, unlocked); Content.xp rows (content V-42).
Relied on, waiting on other lanes (typeof-guarded; absent -> 'not-ready' or Content-only checks):
- engine V-40: `Engine.questLine(view, now) -> {steps:[{...step, state:'done'|'current'|'locked', doneAt?}], current}`; `Engine.dailyObjectives(view, now) -> {date, items:[{...objective, done, swappable}], growth}`, which must honour ObjectiveSwapped {from,to,date} of that date (`to` replaces `from`) and skip sample rows; `Engine.unlocked(view) -> Set<featureId>` includes FeatureUnlocked features.
- content V-42: `Content.questLine: [{id,title,line,condition:{event,count,within?},reward,opened}]`; `Content.objectives: [{id,title,line,doneBy:{event}|'tap',grows}]`; Content.features ids; rewards never sos, help, lessons, settings, export, data.
- At BASE: Engine.todayStr/hourOf/id via localDate :70; Content.features (reveal :801); write/tx :113.

## 2026-11-08 03:27 IST · V-41 rulings (CORE 11; R-C-50)

- swap: Actions does not pick the replacement. It writes `ObjectiveSwapped {from: id, to: item.swapTo, date}` from `Engine.dailyObjectives(view, now)`. With no Engine.dailyObjectives, or no swappable item with that id: `{ok: false, code: 'not-ready' | 'bad-objective'}`, and nothing is written. This overrules the scout's 'Actions picks the next id' default. A second swap the same day returns `{ok: false, code: 'swap-used'}`.
- done: idempotent by the Engine's done flag. An item already done today (by a tap or by its matching event) returns `{ok: true}` with no event, so a tap never earns XP twice.
- claim: trusts `Engine.questLine(view, now).current` and its `claimable` flag, and never re-evaluates conditions itself. With no Engine.questLine: `{ok: false, code: 'not-ready'}`. A done step returns `{ok: true}` with no new event; a locked or not-claimable step returns `{ok: false, code: 'not-claimable'}`.
