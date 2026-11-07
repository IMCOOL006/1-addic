# Brief · lane content (chat SCREENS) · base 1ef2482e · toward offline-v1.1

Read code at BASE with `git -C C:/Users/ruchi/1-addic show 1ef2482e:<path>` (the _base worktree is at 655516dc, not BASE). Cites are path:line at 1ef2482e.

## What the lane is for
The original content: exercises, lessons M4-M10, guided practices and game data, a loadable sample profile. Every word original (docs/book/ notes are ideas, never wording). Content owns content-core.js. Depends only on BUILD-PLAN 3.6, 3.8 (and 3.4 for the sample). Order: U-31a (slice, tier 1) | U-31b, U-29 | U-30, U-32, U-33.

## Files
Owned: offline/src/content-lessons-b.js (M4-M6), content-lessons-c.js (M7-M10), content-exercises.js, content-practices.js, content-sample.js, content-core.js, offline/tests/content.test.mjs (new). All content-* parts are already in build.mjs's parts list (build.mjs:15-21); no build.mjs edit. Do not touch: engine.js, actions.js, ui-*.js, other lanes' files, docs/offline/. Pattern for new files = content-lessons-a.js:1-5: `const C_x = (typeof Content !== 'undefined') ? Content : require('./content-core.js');` then add keys, then `if (typeof module !== 'undefined' && module.exports) module.exports = C_x;`. Lessons: `C_x.modules.push({...})` (lessons-a.js:6). Classic scripts share one scope: use a unique const per file (C_b, C_c, C_ex, C_pr, C_sm); never redeclare `Content`.
Neighbours: other lanes ask content by outbox and append to content-core.js only after `/* -- additions -- */`. Edits above that line are yours.

## What validateContent checks (engine.js:1439-1475; this is the acceptance: zero errors)
1. Every lesson cites >=1 `refs` id in Content.references (R1-R32, core:382-413). 2. `tryIt.exercise` exists in Content.exercises (array or map; engine.js:1453; ui-exercise.js:338). 3. `moment.cast` in Content.cast (meera, raj, farhan, kavita, dev; core:466-472). 4. skill.region in regions. 5. Every string starting `#/` is a route of the 3.5 table (engine.js:1376-1396): module/lesson/exercise ids must exist; practice ids only breathe, body-scan, sober, urge-surf, shower, eating, walking. 6. No "addict"/"addicts" noun in any string (ADDICT_RE, engine.js:1469) unless the whole string is one quotation; keys book, cite, refs, id and Content.references are exempt. "addicted brain" and "addiction" pass. Before U-08 merges, content.test.mjs does the same checks in Node (require core + lessons + exercises).

## U-31a (SLICE, tier 1, 1 h)
Today: no Content.exercises. tryIt ids in lessons-a that do not resolve: quick-reasons (:36), signs-check (:83), risk-factors (:96), help-request (:109), motivation (:193, :246), balance (:219), four-lenses (:233). Also `checkpoint` (ui-learn.js:244-252) and program-questions (3.8).
Build: content-exercises.js sets `C_ex.exercises = [...]` (array). Shape 3.8: `{id,title,book:{chapter,exercise},kind,artifact?,repeat?,skill?,fields:[{id,type,label,hint?,options?|from,max?,min?,labels?,optional?}],tutorial:{example:{cast,values},hints:{fieldId:text},built},events:[...]}`. Field types are exactly the 19 of ExerciseUI.FIELD_TYPES (check, check2, single, slider, text, textarea, list, matrix2x2, pair, rows, template, bodymap, date, number, yesno, percent, contactPicker, rating, topN). Events by 3.7: kind build/assess/plan -> ArtifactSaved; practice/reflect/tool -> ExerciseDone. `from:'catalogs.x'` points into Content.catalogs (core:300; riskFactors :375). risk-factors: sensitive:true, hidden by default, no scoring, no "you are at risk" wording. `checkpoint`: `{id:'checkpoint', modules:{m0:[q,q], m1:[..], m2:[..], m3:[..]}}`, each q a lesson check `{q, options:[{t,ok,why}]}` (ui-learn.js:246-250; two per module). `motivation` sets artifact 'motivation' (the row is written by Actions).
Add the line `/* -- additions -- */` at the end of content-core.js, before the module.exports guard. Asks placed: see table.
Acceptance: every M0-M3 exercise id resolves with the 3.8 shape; content validation green. Tests: "every tryIt exercise resolves", "exercise shape", "no addict noun". Feeds the browser tests of exercise save and tutorial (learn).

## U-31b (tier 2, 2 h)
The rest of the 3.8 list: clear-space, exercise-plan, network-review, assertive-script, expand-network, should-i-go, triggers, red-flags, trap-pairs, spiral, craving-signature, trial (modes redflag|mood), cog-vs-beh, distractions, body-scan, breathing, everyday-mindful, sober-practice (script, timer, reflection, helpful rating; ids match Content.practices), used-to-enjoy, should-want, activity-menu, obstacles, rewards, anger-signature, rewrite-scene, warning-signs (check + topN 3 with plans), slip-review (sensitive), plus checkpoint questions for m4-m10. Examples use the cast. Acceptance: every lesson's exercise id resolves; validation green. Test: "every exercise id used by a lesson resolves".

## U-29 (tier 2, 2.5 h) Lessons M4-M6
content-lessons-b.js: m4 (6 lessons), m5 (6), m6 (6), 3.6 shape (BUILD-PLAN 171-181 lists the titles). Module `{id,step,name,harbor,book,blurb,unlocks:[feature ids from Content.features core:153],milestone?,lessons}`; milestones M5 Self-Expert, M6 Strategist (ranks core:130). Per lesson: moment 2-4 sentences, 3-4 cards of 2-4 sentences, 1-2 checks with `why` on every option, tryIt `{exercise}` or `{route,label}` (logs, planner, Battle Plans by route), wrap `{built,lives,action,todo|null}`, >=1 ref. Grade 6-8, person-first. Acceptance: validation green; no text from the source book. Tests: "lessons shape", "refs resolve", "routes known".

## U-30 (tier 2, 2.5 h) Lessons M7-M10
content-lessons-c.js: m7 (6), m8 (6), m9 (5), m10 (4); milestones M7 Mindful Navigator, M9 Builder, M10 Graduate. Rule 4 with extra care in M9 and M10 (feelings, anger, rewrite the scene, stopping a slip, warning signs): `clinicalReview: true` on each such lesson; slip or crisis passages short, pointing to `#/sos/urgent` and saying little else; no technique, dose or sensation. M10 l3 may link `#/sos/slip`; l4 `#/workbook/plan`. No wording that "resets" anything. Acceptance: validation green. Tests: as U-29 plus "M9-M10 lessons carry clinicalReview".

## U-32 (tier 2, 2 h) Practices and games
content-practices.js sets `C_pr.practices` = map `{breathe,'body-scan',sober,'urge-surf',shower,eating,walking,beat}`, each `{id,title,minutes,intro,steps|script:[{t,secs?}],close}`. Body scan about 10 min; breathe has `ladder:[5,10,15,20,25,30]` and no pacing cues; `sober.steps` is exactly 5 short lines (R-C-9; original words); `beat` = give it a beat (anger). Read aloud is the device's speech only: plain sentences. `C_pr.games = {sort:[12 {id,thought,trap}] (trap ids from catalogs core:313-330), flag:{lines, redFlags:[3 indexes]}, bigGame:{scenes:[6 {id,text,choices:[{t,to,note}]}]}, refusal:[4 {id,scene,responses:[3 {t,rating:'best'|'ok'|'weak',why}]}]}`; also `C_pr.comebacks` (3 lines). Acceptance: validation green. Tests: "practice ids match route ids", "games counts 12/3/6/4x3". game-tutorials U-28 reads these shapes.

## U-33 (tier 2, 1.5 h) Sample data
content-sample.js sets `C_sm.sample = {name:'Sample', generate(nowIso) -> {stores:{...}}}`. Actions.loadSample calls `C.sample.generate(at)`, accepts `{stores}` or the map, checks it with backupErrors (fails 'no-sample' on any error), puts every row (skips meta key 'lock'), then adds meta `{key:'sample', loadedAt}` (actions.js:881-902). Rows follow 3.4 exactly: four weeks relative to `now` (date, hour, at), every row and event `sample: true` (R-C-13 (4)), profile name 'Sample', ids prefixed `smp-`, contacts invented with no real numbers, deterministic (seeded, no Math.random). Mix: 12-16 cravings, feelings, ~28 check-ins, activities, 3 plans, 4-6 responses (reasons, triggers, red-flags), 4 contacts (3 safetyNet), events consistent with logs. Acceptance: loads, shows as sample, erases completely (Actions.eraseSample; engine skips sample rows, engine.js:157,346). Tests: "sample passes backup validation", "all rows sample:true", "deterministic".

## Asks placed (R-C-9, R-C-13, R-C-18)
| ask | unit | where |
|---|---|---|
| practices.sober.steps (5); 3 default comebacks; review of FALLBACK.spiralReply | U-32 | content-practices.js |
| resources.intl local-emergency item gets tel '112', verify:true (core:448) | U-31a | edit in place |
| resources.opioidSafety, one short line, verify:true, clinicalReview | U-31a | after additions line |
| spiral {thought, reply} pairs and drop "I'm hopeless." (core:313-315) | U-31a | `catalogs.spiralPairs` after additions; remove the crisis thought in place |
| example 'hopeless addict' (core:323) -> '"I slipped, so I\'m hopeless."' | U-31a | edit in place |
| early-access line | U-31a | `Content.copy.early` = 'Early access: this is a test version. Export a backup now and then.' |
| clinical review of ui-sos.js / ui-onboarding.js copy (`git show build/actions-sos:offline/src/ui-sos.js`) | U-32 | notes in the lane report; the built copy stands until answered |

## Rules that bite
Original words only; person-first; substance use brief and clinical (no how-to, no sensations, no doses); crisis content shows urgent numbers and little else, clinicalReview: true; every number or link verify:true; locale 'en' only (O5); nothing here decreases anything (no streak or points wording); SOS never gated, no tips inside SOS; sample visibly marked (O6); no network, tracker or remote font.

## Decisions that bite
O1 file offline/1-addic.html, title "1-addic", discreet "Notebook" (core:12). O2 PIN offered, never forced. O3 India numbers "please verify" plus intl list. O4 read-aloud via speechSynthesis only. O5 no Gujarati. O6 sample button, marked, erasable (U-33). O7 tier-2 content honestly working. O8 guide .docx not this lane.

## Open questions (default taken)
1. Exercises array or map: array of `{id,...}` (both read, ui-exercise.js:338).
2. Spiral pairs: new key `catalogs.spiralPairs`, keep `spiral` minus the crisis thought; CORE tells actions-sos.
3. Engine skips sample:true rows, so Insights show nothing from the sample: build as ordered, flag to HUB.
4. No `#/practice/beat` route in 3.5: `beat` stays a Content.practices key, reached from lesson text, not a route.
5. PLAN.md and lane_args.json were not read (scout budget): follow BUILD-PLAN.

## Gates and baselines
`python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/content --lane content build test validate guards`. Baselines by name: coordination/baselines.md (validate was SKIP at the base; it runs now). Territory: `python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/check_territory.py content 1ef2482e..HEAD --wt C:/Users/ruchi/1-addic-wt/content`. Go-aheads: none. Never edit the engine to pass validation; fix content.
