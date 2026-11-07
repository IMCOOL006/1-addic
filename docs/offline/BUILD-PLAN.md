# 1-addic · Offline edition · Build plan

**Date:** 7 November 2026 · **Status:** the specification and proposed cut for the build program (the HUB reads this first and derives `PLAN.md` from it) · **Owner's goal:** a version of the app that works offline on any device, like `C:\Users\ruchi\event-offline\event-money.html`, plus a guide (explainer + tutorial), built in at most six clock hours, earlier if possible.

> **In short.** One self-contained HTML file, `offline/1-addic.html`, assembled from `offline/src/*` by `node offline/build.mjs`, runs the whole recovery-skills app from `file://` with no network call ever. Data lives in the browser (IndexedDB, with a loud label when storage is blocked), optionally encrypted behind a PIN, and travels between devices by export and import. The product is the one `docs/PLAN.md` describes (four layers plus SOS, the Harbor game layer, the tutorial system), built as plain JavaScript with no framework and no build dependency, tested in Node and in Chrome, and documented in `offline/docs/1-addic-Guide.md` → `.docx` with screenshots. Two content files already exist (`content-core.js`, `content-lessons-a.js`). The cut below is about 96 estimated hours in ten lanes; tier 1 (the chain that makes it usable end to end) is about 54. The six-hour day lands the chain's first slices; the rest continues toward the next tag under the same gates.

---

## 0. Why an offline single-file edition, and how it relates to the plan

`docs/PLAN.md` chooses between a Unity app and a web PWA for the phone app (D3, decided by a spike that has not run). The owner now wants something usable **today, on any device, offline**. A single HTML file is the fastest honest path: it needs no store, no install, no server, no account, and it runs in the browser every phone and computer already has. It follows the same product plan, the same ADRs (0001–0021) and the same house rules (`docs/BUILD-GUIDE.md`), so nothing built here is wasted: the content, the engine rules and the tests carry over to whichever native path D3 picks. Record this as **ADR 0022 "Offline single-file edition"** (unit U-37).

What the edition does **not** do (say so in the guide): no notifications (in-app prompts and `.ics` export only, ADR 0005), no sync (export/import instead), no licence or invites (ADR 0004/0015 are for the native builds), no Gujarati yet (ADR 0010: before the friends release; the structure carries a `locale` so it can come later), no clinical review yet (ADR 0016: a visible "not yet clinically reviewed" notice on first run and in Settings).

---

## 1. Deliverables (what the tag `offline-v1.0` contains)

| # | Deliverable | Path |
|---|---|---|
| 1 | The app, one file, committed so it is usable without building | `offline/1-addic.html` |
| 2 | Its sources and the builder | `offline/src/*.js`, `offline/src/styles.css`, `offline/src/shell.html`, `offline/build.mjs` |
| 3 | Node logic checks (no dependencies: `node --test`) | `offline/tests/logic.test.mjs` (may be split per area) |
| 4 | Browser checks and the screenshot script (Playwright over the installed Chrome, `channel: 'chrome'`) | `offline/tests/browser.test.mjs`, `offline/tests/screens.mjs` |
| 5 | The guide: explainer + tutorial, Markdown and Word, with screenshots | `offline/docs/1-addic-Guide.md`, `offline/docs/1-addic-Guide.docx`, `offline/docs/images/*.png`, `offline/docs/build_guide.py` |
| 6 | Root tooling | `package.json` (scripts: `build`, `test`, `test:browser`, `screens`, `check`; devDependency `playwright` pinned), `package-lock.json` |
| 7 | Docs kept true | `README.md` (how to use the offline edition), `CLAUDE.md` (commands), `docs/decisions/0022-offline-single-file-edition.md`, `offline/README.md` (copy-to-device instructions) |

Definition of done for the tag: `npm run check` is green (build, Node tests, content validation, browser smoke); the file opens from `file://` in Chrome with zero console errors and zero network requests; SOS works in airplane mode; export → erase → import round-trips; the guide's `.docx` builds and every screenshot it references exists.

---

## 2. Rules that bind every lane

1. **House rules** of `docs/BUILD-GUIDE.md` ("Rules for every step") apply in full: read first, safety non-negotiable (SOS offline, never gated, never interrupted by tips or tutorials; urgent help one tap from SOS; no streak resets, no random rewards, no points for claimed sober days), privacy by default (no network, no trackers, contacts never leave the device), small and tested, accessible (keyboard, labels, visible focus, reduced motion, contrast, 44 px targets), keep the docs true, finish with a summary.
2. **Original content only** (ADR 0002). The book's text is never read, quoted or paraphrased closely; `docs/book/*.md` notes are the source of *ideas*; every lesson cites at least one reference id from `Content.references` (validated by `Engine.validateContent()`); chapter numbers appear only as metadata.
3. **Tone** (PLAN §7): respectful, curious, hopeful, adult-to-adult; person-first ("person in recovery", never "addict" as a noun in the app's voice); reading level grade 6–8; never moralise; the user's chosen term (`Content.terms`) is used wherever the app names their days.
4. **Content safety and restraint.** Keep descriptions of substance use brief and clinical: never describe how a substance is obtained, prepared or taken, never dwell on the sensations of using, never list doses. Cravings and slips are described in one or two plain sentences. Medical safety text is short, conservative and points to a doctor or the emergency number (withdrawal from heavy daily alcohol or sedatives can be dangerous: see a doctor; after a break, tolerance drops: never use alone, call for help). Crisis content never speculates: when a person indicates thoughts of death or suicide, or extreme hopelessness, the screen shows the urgent-help numbers immediately and says little else. Mark every such passage `clinicalReview: true` in content. A builder who is unsure writes the shorter version.
5. **Numbers and links** in `Content.resources` are candidates: each carries `verify: true` until the owner checks it (ADR 0010, input I6); the UI shows "please verify" next to them.
6. **Nothing ever decreases.** XP, mastery, badges, total sober days and the Harbor's light are derived from an append-only event log; a slip restarts only the opt-in "current run". Tests prove it (U-05).
7. **Territory** (section 9): a lane touches only its files; the shared files have append points; a file that is not yours is changed by asking its owner through your outbox.
8. **No new failure by name**; the Node tests, content validation and the browser smoke are the gates; evidence by path.

---

## 3. Architecture

### 3.1 One file from parts

```
offline/
  build.mjs            reads the parts in order, inlines them into one HTML, writes 1-addic.html, prints size
  src/
    shell.html         <body> markup: topbar (name, saved label, theme, settings), #main, side/bottom nav, SOS button, <dialog>, #toasts, coach-mark layer
    styles.css         design tokens (light + dark, same variable set), base, components, SOS, lesson, harbor, coach marks, print
    content-core.js    const Content = {...}  (exists)      catalogs, skills, xp, features, reveal, tutorials, tips, help, references, resources, cast, glossary
    content-lessons-a.js (exists) M0–M3        content-lessons-b.js M4–M6        content-lessons-c.js M7–M10
    content-exercises.js  Content.exercises    content-practices.js  Content.practices + Content.games    content-sample.js  Content.sample (demo data generator)
    engine.js          const Engine = (() => {...})()   pure functions; Node-loadable (module.exports guard; reads Content via require when absent)
    store.js           const Store  = ...               IndexedDB + fallbacks + commit() + encryption + lock; Node-loadable in memory mode
    actions.js         const Actions = ...              every verb that writes rows and events; Node-testable with Store in memory mode
    ui-core.js         const UI = {...}                 h(), forms, sheet, toast, router, nav, theme, speak(), page registry UI.pages
    ui-today.js  ui-sos.js  ui-learn.js  ui-exercise.js  ui-workbook.js  ui-track.js  ui-actions.js  ui-settings.js  ui-game.js  ui-tools.js  ui-onboarding.js
    boot.js            UI.boot()
  tests/  logic.test.mjs  actions.test.mjs  browser.test.mjs  screens.mjs  helpers/
  docs/   1-addic-Guide.md  1-addic-Guide.docx  images/  build_guide.py
  README.md
```

The built file's `<head>` carries: `<meta charset>`, viewport, `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">` (the proof that nothing leaves the device), `color-scheme`, a pre-paint theme script (as Event Money), then `<style>`. Scripts are classic (not modules) so top-level `const Content/Engine/Store/Actions/UI` are shared across blocks; order: content files, engine, store, actions, ui-core, ui-*.js, boot. `tel:` / `sms:` / `mailto:` anchors are allowed (navigation, not fetch). External `href`s exist only in Resources and the evidence cards (they need internet and say so).

### 3.2 Namespaces and the contracts between lanes (build on these before the real code merges)

**Content** (plain object, see 3.6–3.8 for shapes). **Engine** (pure; every function takes data in, returns data out; `now` is a parameter so tests are deterministic):

```
ids/dates: id(), todayStr(now), dateStr(d), addDays(dateStr,n), daysBetween(a,b), weekStart(dateStr, weekStartsOn=1), fmtDate, fmtTime, fmtDateTime, hourOf(iso), isNight(now)
profile: term(profile) → {word, days, adjective}; greeting(now, name); companionName(profile)
game: xpFromEvents(events, now) → {total, today, byType}; mastery(events) → {skillId:{uses, level, helpfulAvg, lastAt}}; regionLevels(mastery) → {lighthouse..weather: 0–5}; momentum(events, now) → {days, of:14, dates[]}; rank(events, view) → rank; badges(view, now) → [{id, earnedAt}]; modulesDone(events) → Set; lessonsDone(events) → Set; counters(profile, slips, now) → {tracking, total, current, nextMilestone, reached[]}; gameState(view, now) → all of the above
roadmap: roadmap(profile, modulesDone, now) → {order[], weeks:[{start, moduleIds[], done}], current, next, focus:{moduleId, lessonsLeft, minutes, practiceGoal}, behindWeeks, free:boolean}; nextLesson(view)
reveal: revealed(view) → Set<featureId>; isRevealed(view, featureId); newDots(view) → Set
explorer: explorer(view) → [{id, label, done}]; explorerDone(view)
tips: pickTip(view, now) → tip|null   (≤1/day, never on SOS routes, tips.enabled, not shown in last 14 days)
quests: quests(view) → {questId:{steps:[{id,label,done}], done, total, complete}}
artifacts: latest(view, exerciseId) → response|null; history(view, exerciseId) → responses[]; reasonsCard(view) → {quick[], drawbacks[], benefits[], different[]}; comebacks(view) → [{thought, response, at}]; distractionDeck(view) → string[]; spiralThoughts(view) → string[]; triggerChips(view) → [{id,label,kind,frequent,anger}]
insights: insights(view, now) → {ready, count, cravingTrend[], topTriggers[], heatmap[7][24], moodVsActivities, skillRanking[], predictions, motivationHistory[], caveat}
radar: warningSigns(view, now) → [{signId, label, evidence, plan}]  (the six detectors of 3.9)
planner: gaps(planItems, dateStr) → [{start,end,hours}]; riskyHours(heatmap) → number[]; suggestions(view, dateStr) → [{hour, activity}]
review: forecastCheck(view, weekStart) → [{date, planned:[...], logged:[...]}]; weekSummary(view, weekStart)
plan: prefillRecoveryPlan(view, now) → sections (3.10)
sos: guideSequence(view) → toolIds[] (default order personalised by helpfulness); crisisKeywords(text) → boolean
data: exportBackup(view, meta) → object; validateBackup(obj) → {ok, errors[]}; migrateBackup(obj) → obj; ics(items) → string
content: validateContent() → errors[]  (every lesson cites ≥1 existing reference; every tryIt exercise exists; every route in content is in the route table; every skill has a region; every cast id used exists; no "addict" as a noun in app voice)
errors: AppError(message, code)
```

**Store** (one implementation, three persistence modes, always labelled):

```
await Store.load()                       opens IndexedDB (all stores created up front in one upgrade), or adopts the localStorage snapshot, or runs in memory
Store.view = { get(store,id), list(store), count(store) }
await Store.commit(label, (draft) => {...})   draft: get/list/put(store,row)/del(store,id); every touched row written in ONE IndexedDB transaction (encrypted when a key is set); a thrown rule rolls the working set back; notifies subscribers once
Store.subscribe(fn) / Store.bulk(fn)      bulk: many commits, one notification (sample data, import)
Store.status() → { persistence:'indexeddb'|'localstorage'|'memory', lastSavedAt, hasLock, locked }
Store.exportJson() → object (decrypted rows)   Store.replaceAll(obj)   Store.resetAll()
Store.lock.set(pin,{autoLockMin}) / unlock(pin)→bool / verify(pin)→bool / remove(pin) / lockNow() / touch()
Store.STORES = { profile:'key', settings:'key', meta:'key', events:'id', logs:'id', responses:'id', contacts:'id', plans:'id', todos:'id', motivation:'id', predictions:'id', quests:'id', tutorials:'id', reveals:'id', tips:'id', recoveryPlan:'key' }
```

Node mode: when `indexedDB` is undefined, `Store` runs in memory (so `actions.test.mjs` runs in Node); `crypto.subtle` from `globalThis.crypto` (Node 22 has it).

**Actions** (every verb validates, writes rows through one commit, appends `DomainEvent`s, returns what it wrote):

```
A.onboard(patch) · A.settings.patch(patch) · A.recordEvent(type,payload)
A.logCraving(e) · A.logFeeling(e) · A.checkin(kind:'morning'|'evening', data) · A.logActivity(data) · A.logSlip(data)
A.sosSession(s: {kind:'craving'|'feeling'|'slip', ratingBefore, ratingAfter, tools:[{skillId, helpful}], delays, used, risky, outcome, drill:boolean})  → when drill, writes NOTHING except TutorialCompleted('drill') once
A.completeLesson(lessonId) · A.checkpoint(moduleId, answers) · A.saveResponse(exerciseId, payload, {mode:'tutorial'|'workbook', draft}) 
A.contacts.add/update/deactivate · A.contacts.reached(contactId, how)   (ContactReached event for the radar)
A.plans.add/update/remove · A.plans.debrief(id, {usedPlan, how}) · A.weeklyReview(data) · A.todos.add/done/remove
A.motivation.add({stage, score, plusOne, source}) · A.predictions.add/complete · A.quests.tick(questId, stepId)
A.tutorial.done(id,{skipped}) · A.tutorial.replay(id) · A.reveal(featureId) · A.markTipShown(id)
A.recoveryPlan.save(sections,{confirm}) · A.scriptUsed(responseId) · A.loadSample() · A.eraseAll() · A.importBackup(obj)
```

**UI core** (`ui-core.js`; pages register themselves from their own files, so no shared edits):

```
UI.h(tag, attrs, ...children)   attrs: class, text, dataset, style{}, on<Event>, aria-*, data-*; children: nodes/strings/arrays; text is ALWAYS inserted as text
UI.svg(tag, attrs, ...children) · UI.icon(name, size) · UI.toast(msg, tone) · UI.sheet(title, body, opts) → {el, close} · UI.confirm({title, message, confirmLabel, danger}) → Promise<bool>
UI.form(spec) → {el, values(), set(name,val), validate()}   field types: text, textarea, number, date, time, select, radio, checkbox, chips(multi), slider(min,max,labels), hidden, custom(render)
UI.card(title, body, opts) · UI.tile(label, value, sub) · UI.chips(options, selected, onChange, {multi}) · UI.ring(pct, label) · UI.meter(value, max) · UI.empty(text, action)
UI.go(route) · UI.route() → {path, parts[], query{}} · UI.render() · UI.pages[firstSegment] = (ctx) => Node · UI.ctx() → {view, E:Engine, A:Actions, profile, settings, term, now, features, calm}
UI.applyTheme(theme) · UI.night() · UI.speak(text) / UI.stopSpeaking() · UI.printDoc(node) · UI.download(filename, text, mime) · UI.boot()
Routes are hash routes (section 3.5). The SOS button is rendered by ui-core with data-tour="sos-button"; tabs carry data-tour="nav-<tab>".
```

### 3.3 Storage, privacy and the lock

- IndexedDB `1-addic`, version 1, every store created in one upgrade (Kriya's "stores created up-front" law, `kriya-frontend/src/lib/tasks/idb.ts`). On failure to open (private window, a blocked `content://` origin on Android, a version rollback): localStorage snapshot (`1-addic:snapshot`), else memory. The top bar always says where the data lives: "Saved on this device · time", "Saved (fallback)", or "Not saved — export before closing". `navigator.storage.persist()` is requested on the first write (wrapped in try).
- **Encryption at rest** when a PIN is set: PBKDF2-HMAC-SHA256 (310,000 iterations, 16-byte random salt) → AES-GCM-256 key; every row stored as `{<keyPath>, enc:{iv, ct}}` (12-byte iv per row); `meta` store stays plain: `{key:'lock', salt, iterations, check, autoLockMin, setAt}` where `check` is the encryption of a known string used to verify the PIN. The key lives in memory only; `lockNow()` drops it and the working set; unlock reloads and decrypts. Auto-lock after N minutes idle (default 5; 1/5/15/never). "Forgot PIN" = erase and start from a backup, said plainly. Export asks for the PIN again when a lock exists.
- **Lock screen** offers, without the PIN: "Urgent help" (the numbers) and "Ride the wave (SOBER)" (content only). The safety floor (ADR 0019) never depends on unlock.
- **Discreet mode**: tab title and header become `Content.discreetName` ("Notebook"), the SOS button reads "Help", counters hidden.
- Export: `{app:'1-addic', schemaVersion, exportedAt, stores:{...}}` as `1-addic-YYYY-MM-DD.json`; import validates, migrates, **replaces** (never merges) after a confirm; "Print logs" and "Print My Recovery Plan" use the print stylesheet (PDF via the browser).

### 3.4 Data model (rows)

| Store | Row |
|---|---|
| `profile` (key `me`) | `{key, name, companion, substances[], term, startDate?, notSure, stage, region:'in'|'intl', checkin:{morning,evening}, reviewDay:0–6, pace, customPerWeek, roadmapStart, onboardedAt, medical:{heavyDaily, sedatives, opioids}, locale:'en'}` |
| `settings` (key `app`) | `{key, theme, calm, counters, showCurrentRun, discreet, tips, showAll, textSize, reducedMotion, highContrast, lastTipDay, lastBackupAt, backupReminderDismissedAt, milestonesSeen[], maintenance, earlyNoticeSeen}` |
| `meta` (key) | `lock` row (3.3); `sample` row `{key:'sample', loadedAt}` when demo data is loaded |
| `events` | `DomainEvent {id, type, at, payload}` (3.7) |
| `logs` | `LogEntry {id, type:'craving'|'feeling'|'checkin'|'activity'|'slip', at, date, hour, intensity?, emotion?, triggerIds[], thought?, redFlag?, feelings[], skills:[{skillId, helpful}], used?, situation?, notes?, checkin:{kind, mood, anxiety, peakCraving, pleasantCount, used, sleep, meeting, intention}, activity:{kind:'exercise'|'mindfulness'|'meeting'|'pleasant', minutes, name, enjoyment}, drill:false}` |
| `responses` | `ExerciseResponse {id, exerciseId, schemaVersion, payload, at, mode, draft}` (append-only; the latest non-draft is the artifact) |
| `contacts` | `Contact {id, name, role:'safetyNet'|'risky'|'sponsor'|'therapist'|'other', strategy?:'avoid'|'limit'|'setLimits', phone?, note?, active}` |
| `plans` | `PlanItem {id, date, start, end, title, kind:'should'|'want'|'recovery'|'risky', activity?, risky, battlePlan?:{situation, plan, backups[], buddyId, exit}, reward?, status:'planned'|'done'|'skipped', debrief?:{usedPlan, how, at}}` |
| `todos` | `{id, text, source, route?, due?, done, at}` |
| `motivation` | `{id, at, stage, score, plusOne, source}` |
| `predictions` | `{id, activity, predicted, actual?, at, completedAt?, notes}` |
| `quests` | `{id:questId, startedAt, ticks:{stepId:at}, completedAt}` |
| `tutorials` | `{id, completedAt, skipped, replays, stepsSeen}` |
| `reveals` | `{id:featureId, revealedAt, seenAt, forced}` |
| `tips` | `{id, shownAt}` |
| `recoveryPlan` (key `plan`) | `{key, sections, confirmedAt, lastReviewAt, graduatedAt}` |

### 3.5 Routes (hash)

`#/today` · `#/learn` (roadmap map) · `#/learn/plan` · `#/learn/<moduleId>` · `#/lesson/<lessonId>` · `#/learn/glossary` · `#/workbook` · `#/workbook/<artifact>` where artifact ∈ `reasons, balance, motivation, triggers, redflags, journal, spiral, signature, anger, network, scripts, activities, balance-sw, distractions, warnings, plan, signs, risks` · `#/exercise/<exerciseId>?mode=tutorial|workbook&from=<lessonId>` · `#/track` · `#/track/log/<type>` · `#/track/insights` · `#/actions` · `#/actions/planner?date=` · `#/actions/battle?new=1` · `#/actions/review` · `#/actions/quests` · `#/actions/predictions` · `#/actions/todos` · `#/practice/<id>` where id ∈ `breathe, body-scan, sober, urge-surf, shower, eating, walking` · `#/tools/trial?mode=redflag|mood&thought=` · `#/tools/should-i-go` · `#/tools/problem-solver` · `#/games/big-game` · `#/games/distortion-sort` · `#/games/spot-red-flag` · `#/games/refusal` · `#/games/rewrite` · `#/sos` · `#/sos/craving` · `#/sos/feeling` · `#/sos/slip?preview=1` · `#/sos/urgent` · `#/sos?drill=1` · `#/settings` · `#/settings/<tab>` where tab ∈ `privacy, look, rhythm, names, help, about, data` · `#/onboarding` · `#/lock` · `#/dev/fields` (the field gallery, dev only). Unknown routes render Today. The SOS routes use the dark palette between 20:00 and 06:00 unless the theme is forced light, show no tips, tours or dots, and the SOS button is hidden while inside SOS.

### 3.6 Lessons and modules (the shape `content-lessons-*.js` uses; M0–M3 exist)

```
module: { id:'m4', step:2|null, name, harbor, book, blurb, unlocks:[featureIds], milestone?, lessons:[lesson] }
lesson: { id:'m4-l1', title, minutes, sensitive?, clinicalReview?,
          moment:{cast:'meera', text}, cards:[{title, text, link?:{route,label}}], checks:[{q, options:[{t, ok, why}]}],
          tryIt: {exercise:'id'} | {route:'#/…', label} | null,
          wrap:{built, lives, action, todo:string|null}, refs:['R7'] }
```

Lesson order and the remaining modules: M4 Set Yourself Up (6 lessons: clear the space; small decisions + The Big Game; move your body; your crew; say it straight; saying no and growing the crew), M5 Become a Self-Expert (6: the chain; triggers; red-flag thoughts; six thinking traps + Distortion Sort; the spiral; craving signature and the logbook), M6 Outsmart the Addicted Brain (6: put it on trial; superficial truths; thinking vs doing; surf-distract-delay; plan the day; Battle Plans), M7 Be Present (6: what mindfulness is; autopilot; body scan; breathing; SOBER; acceptance and kindness), M8 Rediscover Joy (6: rewards and recovery; track your days; should/want; pleasant not risky; obstacles and predictions; follow through and reward), M9 Handle Hard Feelings (5: mood and recovery; thoughts and the same traps; anger: give it a beat; rewrite the scene; quick coping and back to why), M10 Your Recovery Plan (4: one step ahead; warning signs; stopping a slip; build my plan). 49 lessons in all. Each lesson: moment 2–4 sentences, 3–4 cards of 2–4 sentences, 1–2 checks with an explanation for every option, a tryIt, a wrap, ≥1 ref. Milestones: M5 Self-Expert, M6 Strategist, M7 Mindful Navigator, M9 Builder, M10 Graduate.

### 3.7 Events and the game rules (Engine; Content.xp holds the numbers)

Event types and XP: `LogCreated` 5 · `CheckinCompleted` 5 · `SkillUsed` 5 · `SosCompleted` 15 · `LessonCompleted` 10 (once per lesson) · `ArtifactSaved` 20 (exercises of kind build/assess/plan, once per exerciseId per day) · `ExerciseDone` 10 (practice/reflect/tool) · `BattlePlanCreated` 10 · `BattlePlanDebriefed` 15 · `ActivityDone` 10 · `MindfulMinute` 1 (cap 20/day) · `WeeklyReviewCompleted` 25 · `SlipReviewed` 25 · `TutorialCompleted` 5 (once per id) · `ExplorerCompleted` 25 (once) · `CheckpointCompleted` 10 (once per module). Zero-XP events: `SlipLogged`, `ContactReached`, `ScriptUsed`, `FeatureRevealed`, `MilestoneSeen`, `ModuleCompleted`, `RecoveryPlanConfirmed`, `OnboardingCompleted`. Diminishing returns on `LogCreated`, `CheckinCompleted`, `SkillUsed`, `ActivityDone`: per type per local day the first 3 earn full XP, 4–6 half, then none. Mastery: `SkillUsed` per `skillId`, levels at 1/3/7/15/30 uses. Region light 0–5: the same thresholds over the region's total uses. Momentum: distinct local dates in the last 14 days with any XP-bearing event. Ranks (Content.ranks): Explorer when the checklist is complete; Self-Expert/Strategist/Mindful Navigator/Builder/Guide when M5/M6/M7/M9/M10 are complete (all lessons done). Badges (Content.badges) by predicate: `smart-not-strong` quest clear-space complete · `first-wave` one `SosCompleted{outcome:'passed'}` · `wave-rider-10/50` · `self-expert` latest responses for `triggers` and `red-flags` exist · `objection` 10 trial responses · `net-weaver` 3 active safetyNet contacts · `said-it` one `ScriptUsed` · `mood-lies` a prediction with actual > predicted · `calm-core` quest sober-training complete · `planner` 4 `WeeklyReviewCompleted` · `comeback` one `SlipReviewed` (shown once, not farmable) · `graduate` `RecoveryPlanConfirmed`. Counters: `total` = days from `startDate` to today minus distinct slip dates; `current` = days since the last slip (or start); milestones `[1,3,7,14,30,60,90,180,365]` on `total`, each celebrated once (`MilestoneSeen`), with words, no XP. Recomputing from the same events must give the same state (test), and appending a `SlipLogged` must not lower any derived number (test).

### 3.8 Exercises (the contract between `content-exercises.js`, the exercise engine and the lessons)

Field types the engine renders: `check` (options, groups?, allowCustom), `check2` (two marks: ✓ experienced, ★ frequent), `single`, `slider` (min, max, labels), `text`, `textarea`, `list` (max), `matrix2x2` (four cells with labels and suggestion chips), `pair` (items with left/right prompts), `rows` (columns), `template` (sentence parts with blanks), `bodymap` (tap regions on an SVG figure), `date`, `number`, `yesno`, `percent`, `contactPicker` (filter by role), `rating` (1–5), `topN` (pick N from earlier checked items, a plan per pick). Exercise shape: `{ id, title, book:{chapter, exercise}, kind:'assess'|'build'|'plan'|'practice'|'reflect'|'tool'|'log', artifact?, repeat?, skill?, fields:[{id, type, label, hint?, options?|from:'catalogs.x'|'triggers'|'contacts', max?, min?, labels?, optional?}], tutorial:{example:{cast, values}, hints:{fieldId: text}, built:text}, events:['ArtifactSaved'|'ExerciseDone'] }`.

Exercise ids (every one is referenced by a lesson, a tool or the Workbook; `validateContent` checks the lessons' references): `quick-reasons` · `signs-check` (1.1) · `risk-factors` (1.2, sensitive, hidden by default) · `help-request` (1.x) · `program-questions` (1.y) · `motivation` (3.1/9.6; also writes a `motivation` row) · `balance` (3.2) · `four-lenses` (3.3) · `clear-space` (4.1) · `exercise-plan` (4.2) · `network-review` (4.6 qualities + reflection; contacts themselves are managed in the Workbook) · `assertive-script` (4.5) · `expand-network` (4.7) · `should-i-go` (4.x tool) · `triggers` (5.1 + 9.4 anger tag) · `red-flags` (5.2) · `trap-pairs` (5.2b) · `spiral` (5.2c) · `craving-signature` (5.3) · `trial` (6.1/6.2/9.3; modes redflag|mood; saves a Comeback) · `cog-vs-beh` (6.r) · `distractions` (6.3b) · `body-scan`, `breathing`, `everyday-mindful`, `sober-practice` (7.1–7.4; practices with a script, a timer, a reflection and a helpful rating) · `used-to-enjoy` (8.0) · `should-want` (8.2) · `activity-menu` (8.3) · `obstacles` (8.4b) · `rewards` (8.7) · `anger-signature` (9.3b + 9.4 anger triggers) · `rewrite-scene` (9.5) · `warning-signs` (10.1: check + topN 3 with plans) · `slip-review` (10.2) · `checkpoint` (per module, two questions). Logs (5.4, 6.3, 8.1, 9.1, 9.2) and the planner, Battle Plans, predictions and My Recovery Plan are screens, not exercises; lessons reach them by `tryIt.route`.

### 3.9 Insights, radar, planner, review (Engine rules)

- **Insights** are ready at 7 logs (craving + feeling + check-in); under 14 every card carries a small-sample caveat. Craving trend: weekly mean intensity for the last 8 weeks. Top triggers: counts of `triggerIds` in craving logs, top 5. Heatmap: 7×24 counts of craving logs with mean intensity. Mood vs activities: from evening check-ins, mean mood and mean peak craving on days with ≥1 pleasant activity against days with 0 (plain sentences, no claims beyond the data). Skill ranking: mean `helpful` × log(uses+1), top 8. Predictions: mean predicted vs actual. Motivation history: the series.
- **Warning Sign Radar** (the six detectors, each mapped to the user's own plan from `warning-signs` when that sign is in their top 3, else the general suggestion): no meeting logged in 14 days for a user with ≥2 meetings in the prior 28 · fewer than 2 pleasant activities in the last 7 check-ins · poor sleep on 3 of the last 5 check-ins · no `ContactReached` in 14 days for a user with contacts · weekend evenings (Fri/Sat/Sun 18–23) with no plan blocks in a week where the planner is in use · mean feeling intensity last 7 days exceeds the previous 7 by 2 or more. Gentle wording; never red.
- **Planner**: a day runs 07:00–23:00; a gap is an uncovered stretch ≥ 2 h; suggestions place want-tos from the Activity Library at the heatmap's top hours. Battle Plans attach to risky blocks; `.ics` export for Battle Plans and the Weekly Review (RRULE weekly on `reviewDay`); a debrief after the date earns XP whatever the outcome.
- **Weekly Review** (five screens, ~5 min): last week's highlights → the **forecast check** (planned risky blocks and Battle Plans beside the cravings and feelings logged that day, as reflection: "You planned for rough weather on Thursday evening; the log shows a 6/10 at 7:40 pm, and your plan was there") → motivation re-rate with "+1" → upcoming risky situations become Battle Plans → three want-tos with rewards → a focus skill. ADR 0021: no score, no XP beyond the review's 25.

### 3.10 My Recovery Plan (prefill)

Sections: `motivation` (the Reasons Card and the latest "+1"), `wellness` (top 6 skills of kind wellness by ranking), `situation` (top 6 of kind situation), `people` (active Safety Nets, sponsor, therapist), `mood` (top 3 of kind mood), `triggers` (starred triggers + insights' top 5), `warnings` (the top-3 signs with plans), `battlePlans` (recurring risky situations from the planner), `support` (groups and treatment from `support` fields of the slip review and expand-network). Each section: prefilled list, editable, "confirm" toggle. Graduation at the end of M10 (`RecoveryPlanConfirmed`), pinned in SOS as "My plan", "still true?" prompt 30 days after `lastReviewAt`, Maintenance mode suggested at 180 days (a lighter Today). Print/PDF through the print stylesheet.

### 3.11 Tutorials, tips, reveal, Explorer (Guidance; content in `Content.tutorials/tips/explorer/reveal`)

Coach marks: an overlay that spotlights `[data-tour=<target>]`, one sentence, Next/Skip, focus moves to the step, screen readers announce it. First-run tour after onboarding (then from Settings → Help). SOS drill = the craving flow with `drill:true` and sample content, saves nothing. Just-in-time tutorials on first visit to a revealed feature ("Show me / Later"). Training drills (SOBER, quick log, Battle Plan, trial, refusal) from Settings → Help → Training and from lesson wraps. Tips: `Engine.pickTip` rules by id (`redFlagLogNoTrial`, `eveningCravings`, `thinReasons`, `oneSafetyNet`, `noPractice`, `noBackup`, `lowMomentum`, `noWantTo`, `reviewDue`), one a day, Today only, switchable. Explorer checklist: the 12 items derived from events and rows, a ring on Today until done or dismissed. Progressive reveal: `Content.reveal` by module completion; unrevealed features appear in a collapsed "More tools unlock as you learn" list with the module that reveals them and a per-item "Show now"; `showAll` reveals everything; "New" dots until first visit.

### 3.12 Look

Design tokens as HSL triplets, light and dark complete (same variable set; a test compares the two sets). Palette: the **paper harbor** (owner input I7, Early Access doc 1.5): deep teal primary, sand background, terracotta accent, lantern gold for light; dark mode is the lantern-lit night. Red only for stuck or dangerous. System fonts. Phone-first: bottom nav (Today, Learn, Workbook, Track, Actions) + the floating SOS button; desktop: left nav. The harbor scene is layered inline SVG (sky, sea, breakwater, Lighthouse with beam, Cove, Garden hill, Pier with lanterns, Compass Rose, Weather Station); each place has a light level 0–5 from `regionLevels`; motion is transform/opacity only (water drift, beam sweep, lantern flicker) and static under `prefers-reduced-motion`; nothing ever decays; no weather drama inside SOS. Calm mode hides the scene and every XP/badge surface; functions stay.

### 3.13 Tests and gates

- `npm test` → `node --test offline/tests/` (Node 22, no dependencies): engine (every rule in 3.7–3.10 with named tests), content validation, store crypto round-trip and PIN refusal, actions (in memory mode: SOS session → log + events; drill writes nothing; slip lowers nothing; export → reset → import identical).
- `npm run test:browser` → Playwright over the installed Chrome (`chromium.launch({channel:'chrome'})`, fallback to bundled Chromium in the cloud): opens `file://…/offline/1-addic.html`; asserts zero console errors and zero network requests; onboarding full and skip-all; tour complete/skip/replay; SOS drill creates no log; SOS craving flow offline (`context.setOffline(true)`) with the delay loop and both outcomes; quick log + evening check-in; a lesson → artifact → shown in SOS; PIN set/lock/unlock/export; export → erase → import; dark theme; 390 px viewport; print view of the plan.
- `npm run screens` → `offline/tests/screens.mjs` writes the guide's screenshots (desktop 1280 and phone 390) into `offline/docs/images/` with print DPI metadata (as Event Money's).
- `npm run check` → build + test + validate + browser smoke. **Baselines:** the base has no code, so the baseline is empty; a lane is green when every test it adds passes and nothing that passed on the base fails.
- Guard checks (scripts print names and counts): the built file contains the CSP meta; `https?://` occurs only inside `Content.resources` and `Content.references`; no `innerHTML =` with data; the two theme blocks define the same variables; every `[data-tour]` target named by a tutorial exists in some page.

### 3.14 The guide (`offline/docs/1-addic-Guide.md`, built like the Event Money guide)

Front matter (title, subtitle, accent, cover, toc, App/Prepared by/Date/Tested) · a SUMMARY callout · "How to use this guide" table · **Part 1 Understanding** (what it is, why, what it does at a glance, when to use it, what it is not, how it thinks: the four layers and SOS, the rules it follows, the screens) · **Part 2 Making it yours in one sitting** (onboarding, the Reasons Card, Safety Nets, the first week's routine, moving to a phone, backups) · **Part 3 Tutorial** in lessons (test drive with sample data · set up · SOS craving · SOS feeling and slip · quick log and check-in · learn a module · Workbook · Track and Insights · planner and Battle Plans · Weekly Review · My Recovery Plan · back up and restore · use it on a phone · lock and discreet mode) with a screenshot per lesson · **Part 4 Help** (troubleshooting, known quirks, how it was checked: the Node and browser check counts, the privacy proof, a NEXT callout with a weekly routine). Terms footnoted with `^[…]` for the auto-glossary. `build_guide.py` = Event Money's (`C:\Users\ruchi\event-offline\docs\build_guide.py`) with the file names changed: renders through `~/.claude-pro/skills/word-doc-generator/gen_docx.py`, restarts numbering per section, moves page breaks onto headings, sizes Status tables.

---

## 4. What already exists, and what to reuse

| Asset | Where | Use |
|---|---|---|
| **Content, written** | `offline/src/content-core.js` (catalogs, 38 skills in six regions, XP table, features and reveal, 9 tutorials, 9 tips, 16 help entries, 12 Explorer items, 8 quests, 13 badges, 32 references, India + international resources with verify flags, 5 original cast members, 39 glossary terms); `offline/src/content-lessons-a.js` (M0–M3, 16 lessons) | The base. Lanes extend by adding files; `content-core.js` is append-only at its end (section 9). |
| **Event Money** (the owner's offline single-file app, same shape as this one) | `C:\Users\ruchi\event-offline\event-money.html` (633 KB, 5,342 lines): the Store (`const Store`, line ~1859: IDB stores up front, commit() with rollback, localStorage/memory degrade, the always-labelled saved state); the UI helpers (`const UI`, line ~3638: `h()`, `icon()`, `toast`, `openSheet`, `buildForm`, `confirmSheet`, `run`, `go`, `render`, `tile`, `table`, `meter`, `downloadJson`); the tokens and component CSS (lines 22–560); the pre-paint theme script; the print stylesheet pattern; `docs/build_guide.py`, `docs/Event-Money-Guide.md` (the guide's structure and tone) | Port, do not copy blindly: Event Money is finance; take the mechanisms (Store, forms, sheets, labels, tokens, build_guide.py) and the guide's skeleton. |
| **Kriya generic engine** | `C:\Users\ruchi\kriya-frontend\src\lib\tasks\idb.ts` (the IDB law and the rollback-trap degrade); `src/index.css` (semantic tokens, light/dark parity, "critical = stuck only"); `src/lib/usePrefersReducedMotion.ts`, `print.ts`, `tts.ts` (text-to-speech wrapper), `theme.ts`; `kriya-backend/src/engine/audit` (the append-only audit row shape) | Patterns only; nothing is imported. |
| **Design guidance** | `docs/PLAN.md` §2, §4, §5, §6, §10.8; `docs/program/EARLY-ACCESS-AND-PROGRAM.md` 1.5 (paper harbor) and 2.2 (working / stub / locked states); `docs/book/*.md` for ideas; `docs/evidence-references.md` | Read the sections the brief names. |
| **The method's tooling** (copy and adapt; saves most of S-00) | Lane and merge workflows: `C:\Users\ruchi\kriya\structured docs\02-execution\pharma-program-2026-10-29\tracks\PHARMA\workflows\pharma_lane.js`, `pharma_merge.js`, `merge_lane.py` · Launcher, context, board, territory: `C:\Users\ruchi\kriya\structured docs\02-execution\build-program-2026-10-05\tools\fresh_chat_launcher.py`, `context_now.py`, `board.py`, `territory.py`, `check_territory.py`, `token_meter.py`, `hook_subagent_wait_cap.py` · Hooks and commit: `C:\Users\ruchi\kriya\tools\hook_context_restart.py`, `hook_git_guard.py`, `hub_commit.py`, `gate_run.py` · Agent types: `C:\Users\ruchi\kriya\.claude\agents\{scout,lane-builder,lane-builder-flagged,lane-checker,lane-reviewer}.md` · Gates and conflict tools: `C:\Users\ruchi\kriya-wt\_int-tools\{gates-fe.sh,conflict_hunks.py,classify.py}` · The resume document to adapt: `pharma-program-2026-10-29\RESUME-2026-11-07.md` | Replace Kriya's paths, tracks, databases and Docker with this project's (no database, no Docker; gates are `npm` scripts); the launcher's state folder is `%LOCALAPPDATA%\1-addic-hub\launcher\` (the Kriya launcher is running for pharma and must not be touched). |

---

## 5. The cut: units, lanes, tracks

Hours are estimates (the method moves about one estimated hour per clock hour per lane). **Tier 1** = the chain that makes the file usable end to end; **tier 2** = depth. *Flagged* lanes get two reviewers (safety copy; encryption and the person's data). The **slice** (first batch, one unit) is marked ★.

### Track CORE (lanes core, engine, actions-sos, learn, tests-docs)

**Lane `core`** · tier 1 · flagged (encryption) · files: `offline/build.mjs`, `offline/src/shell.html`, `offline/src/styles.css`, `offline/src/ui-core.js`, `offline/src/store.js`, `offline/src/boot.js`, `offline/tests/store.test.mjs`, root `package.json` (initial)
- ★ U-01 Build pipeline and shell (1.5 h): `build.mjs` with the ordered parts list and the CSP head; `shell.html`; `boot.js`; `package.json` with `build`. Done when `node offline/build.mjs` writes `offline/1-addic.html` that opens with no console error and reports its size.
- U-02 Design tokens and components (2 h): `styles.css` per 3.12 with light/dark parity, components, SOS layout, coach marks, lesson cards, print. Done when the parity guard passes and the 390 px layout has no horizontal scroll.
- U-03 UI core and router (2.5 h): `ui-core.js` per 3.2; nav with `data-tour`; saved label; theme and night rule; `speak()`; page registry; `UI.boot()` rendering Today placeholder. Done when the five tabs navigate by hash and the browser back button works.
- U-04 Store with encryption and lock (3 h): per 3.3; Node memory mode; `store.test.mjs` (round-trip, wrong PIN refused, labels per mode, snapshot adoption). Done when data survives a reload in Chrome and is unreadable in DevTools when a PIN is set.

**Lane `engine`** · tier 1 · files: `offline/src/engine.js`, `offline/tests/logic.test.mjs` (+ `offline/tests/engine-*.test.mjs`)
- ★ U-05 Time, ids, game derivations (3 h): 3.2 ids/dates/profile + 3.7 in full; tests for every rule, determinism and "a slip lowers nothing".
- U-06 Roadmap, reveal, Explorer, tips, quests, artifacts, Recovery Plan prefill (2.5 h): 3.2 + 3.10 + 3.11 rules; tests.
- U-07 Insights, radar, planner, review, SOS guide sequence, crisis keywords (2.5 h): 3.9; tests with synthetic logs.
- U-08 Export/import/migrate/validate, `.ics`, `validateContent`, `npm test` wiring (1.5 h).

**Lane `actions-sos`** · tier 1 · flagged (safety copy) · files: `offline/src/actions.js`, `offline/src/ui-sos.js`, `offline/src/ui-onboarding.js` (incl. lock screen), `offline/tests/actions.test.mjs`
- ★ U-09 Actions (3 h): every verb of 3.2 with validation and events; tests in Node memory mode (SOS session writes a log and SkillUsed events; drill writes nothing; slip restarts only the run; export → reset → import identical).
- U-10 SOS screens (4.5 h): craving flow exactly as PLAN §5.2 (rating, 15-min wave timer, Ride the wave with SOBER read aloud, Remind me why, Call someone, Distract me, Talk back, Guide me, "somewhere risky?", re-rate, delay loop, what helped, did you use → Lapse Recovery), feeling flow (anger: give it a beat; others: SOBER, reassuring and acceptance lines, a quick pleasant activity, call someone; crisis routing on hopeless/thoughts of death), slipped flow (compassion, safety text, the user's spiral thoughts with rebuttals, reach out, Slip Review now or as a to-do, motivation revisit, step-up support), urgent help (region file, call/copy, verify labels), drill and preview modes, night palette, "My plan" when confirmed. Two lines of text per screen at most; one-handed.
- U-11 Lock screen and onboarding (2.5 h): lock with urgent help and SOBER without PIN; the eight onboarding steps of PLAN §5.1 (skippable except the safety notice); early-access notice; lands on Today with the tour offered.

**Lane `learn`** · tier 1 · files: `offline/src/ui-exercise.js`, `offline/src/ui-learn.js`
- ★ U-12 Exercise engine (3.5 h): every field type of 3.8, tutorial and workbook modes, examples and hints, "finish later" (draft responses), the `#/dev/fields` gallery.
- U-13 Lesson player and checkpoint (2.5 h): moment → cards → checks (no fail state) → try it (exercise or route) → wrap (built, lives, action → to-do, "Why this works" → the evidence card); `LessonCompleted`, `ModuleCompleted`, checkpoint at module end.
- U-14 Roadmap and glossary (2.5 h): map view (eleven stops as the harbor path, lessons done, skills, unlocks), plan view (weeks by pace, Custom and Free, no overdue ever, "welcome back" re-plan), the weekly focus card component, glossary page.

**Lane `tests-docs`** · tier 1 (harness, skeleton, docs) / tier 2 (full tutorial text, screenshots) · files: `offline/tests/browser.test.mjs`, `offline/tests/screens.mjs`, `offline/tests/helpers/*`, `offline/docs/*`, `offline/README.md`, `README.md` (append), `CLAUDE.md` (append), `docs/decisions/0022-*.md`, root `package.json` scripts (`test:browser`, `screens`, `check`), `package-lock.json`
- ★ U-34 Browser harness (3 h): Playwright pinned, `channel:'chrome'` with fallback, the flows of 3.13 as named tests, console and network assertions, offline mode, phone viewport.
- U-37 Docs true (1 h): `offline/README.md` (copy to a phone, open from Files/Chrome, the `file:///sdcard/Download/1-addic.html` tip, "Not saved" meaning), README and CLAUDE.md sections, ADR 0022, `npm run check`.
- U-36a Guide skeleton and pipeline (1.5 h): the Markdown with Parts 1, 2 and 4 written and Part 3's lesson headings; `build_guide.py`; the `.docx` builds.
- U-35 Screenshots (1.5 h, tier 2): the script, ~30 images at two sizes with DPI metadata.
- U-36b Guide, Part 3 (2.5 h, tier 2): the tutorial lessons written against the real screens, every image referenced exists, "How this guide was checked" with the real counts.

### Track SCREENS (lanes today-track, workbook-settings, actions, game-tutorials, content)

**Lane `today-track`** · files: `offline/src/ui-today.js`, `offline/src/ui-track.js`, `offline/src/ui-harbor.js`
- ★ U-15 Today (3 h, tier 1): greeting; check-in card by time of day; today's plan with risky blocks and their Battle Plans; want-to of the day; continue learning + weekly focus; active quests; Reasons Card peek; opt-in counters and Momentum ring; Explorer ring; tip of the day; backup reminder; milestone celebration; maintenance-mode variant.
- U-16 Track (2.5 h, tier 1): the quick log (+) for craving, feeling, check-in (morning/evening), activity, slip with trigger/red-flag/skill chips; timeline; counters.
- U-17 Insights (2 h, tier 2): the cards of 3.9 as inline SVG (trend line, bars, 7×24 heatmap, ranking), caveats, "appears after seven logs".
- U-18 Harbor scene (2 h, tier 2): `ui-harbor.js` per 3.12, Calm mode, reduced motion; Today uses a static placeholder until it merges.

**Lane `workbook-settings`** · files: `offline/src/ui-settings.js`, `offline/src/ui-workbook.js`, `offline/src/ui-plan.js`
- ★ U-19 Settings (3 h, tier 1): privacy (PIN set/change/remove, auto-lock, discreet), look (theme, Calm mode, text size, high contrast, reduced motion), rhythm (check-in times, review day, pace), names (your name, companion, term), help & tutorials (replay, "How do I…?", Training, tips on/off, show all features), about & evidence (credits, not clinically tested, the reference cards), your data (export, import, erase, print logs, sample data, backup reminder), early-access notice, version.
- U-20a Reasons Card and Support Network (1.5 h, tier 1): the Reasons Card view (big SOS view, lock-screen image export via canvas), contacts CRUD with roles and strategies, "I reached out".
- U-20b Workbook browser and the other artifacts (2.5 h, tier 2): groups My Why / Know Myself / My People / My Joys; each artifact: view, edit (exercise in workbook mode), history, practise with this, print; risk factors hidden behind a tap; Comebacks, Thought Journal, signatures with the body map, scripts with "I said it", Activity Library with the risk flag, should/want balance, distraction deck, warning signs.
- U-21 My Recovery Plan (2 h, tier 2): per 3.10.

**Lane `actions`** · tier 2 · files: `offline/src/ui-actions.js`, `offline/src/ui-practices.js`
- ★ U-22 Planner (3 h) · U-23 Battle Plans with `.ics` and debrief (2 h) · U-24 Weekly Review with the forecast check (2.5 h) · U-25 Quests, rewards, Prediction Lab, to-dos, the practices player (script shown and read aloud, pause, timer, reflection, helpful rating, mindful minutes) (3 h).

**Lane `game-tutorials`** · tier 2 · files: `offline/src/ui-game.js`, `offline/src/ui-guidance.js`, `offline/src/ui-tools.js`
- ★ U-27 Guidance engine (3 h): coach marks, first-run tour, JIT tutorials, Training drills (SOBER, quick log, Battle Plan, trial, refusal), tips, Explorer, reveal with "Show now" and "New" dots (the SOS drill itself lives in `ui-sos.js`) · U-26 Game surfaces (2 h): XP, mastery per skill, badges, ranks, region light, celebrations under 300 ms · U-28 Tools and mini-games (4 h): Put It On Trial (courtroom → Comeback), Distortion Sort, Spot the Red Flag, The Big Game (branching story, an original character), Refusal Rehearsal (scenes with feedback against `catalogs.refusal`), Rewrite the Scene, Should I go?, Problem Solver.

**Lane `content`** · files: `offline/src/content-lessons-b.js`, `content-lessons-c.js`, `content-exercises.js`, `content-practices.js`, `content-sample.js`
- ★ U-31a Exercises M0–M3 need (1 h, tier 1): `quick-reasons, signs-check, risk-factors, help-request, program-questions, motivation, balance, four-lenses, checkpoint` with examples and hints from the cast.
- U-31b The remaining exercises (2 h, tier 2) · U-29 Lessons M4–M6 (2.5 h, tier 2) · U-30 Lessons M7–M10 (2.5 h, tier 2; section 2 rule 4 applies with extra care in M9 and M10) · U-32 Practices and games (2 h, tier 2): original guided scripts (body scan ~10 min, breathing with the 5→30 ladder and no pacing, SOBER, urge surfing, mindful shower/eating/walking, give it a beat) and the games' data (12 sortable thoughts, a dialogue with three red flags, a six-scene branching story, four refusal scenes with three responses each) · U-33 Sample data (1.5 h, tier 2): "Sample" profile with four weeks of logs, check-ins, plans, responses, contacts and events relative to today, loadable and erasable, visibly marked.

**Totals:** core 9 · engine 9.5 · actions-sos 10 · learn 8.5 · tests-docs 9.5 · today-track 9.5 · workbook-settings 9 · actions 10.5 · game-tutorials 9 · content 11.5 → **≈ 96 estimated hours**; tier 1 ≈ 54; tier 2 ≈ 42. Ten lanes → two build chats (lanes ÷ 5): **CORE** and **SCREENS**.

**Dependencies.** Every UI lane builds on the contracts in 3.2 and switches to the real `ui-core.js`, `store.js`, `engine.js`, `actions.js` when the board shows `core` and `engine` merged (their slices U-01/U-03 and U-05 come first). `content` and `learn` depend only on 3.6–3.8. `tests-docs`' U-34 needs U-01 merged; U-35/U-36b need the screens, so they run last.

**Order of the chain (tier 1):** U-01 → U-03 → U-05 → U-09 → U-04 → U-12 → U-10 → U-15 → U-16 → U-19 → U-20a → U-11 → U-13 → U-14 → U-31a → U-34 → U-37 → U-36a. A tag that holds the chain is a file a person can open, set up, use in a craving, log in, learn M0–M3 in, back up and read about.

---

## 6. The arithmetic and the six-hour day

At 06:05 IST the machine had 8.6 GB free of 31.8 GB with the pharma program using about 14.5 GB (59 Claude and Node processes). A Node-only lane needs about 0.7 GB (worktree, `node --test`, one headless Chrome when its browser tests run); a build chat itself takes 1–2 GB. With the method's 4 GB floor that is **about three lanes at once at the start**, widening as pharma's chats close (sample free memory every ten minutes, as the method says). Three slots over the roughly 2 h 45 min between the lanes' start and the freeze move about 8 estimated hours of units, plus the slices: in six clock hours the tag `offline-v1.0` realistically holds **the chain's first slices** (U-01, U-03, U-05, U-09, and whichever of U-04, U-12, U-10 land), the harness and the guide skeleton. The HUB promises only what the arithmetic holds and names the rest for `offline-v1.1`; the lanes continue on their branches under the same gates. With pharma finished (about 20 GB free) the same cut runs eight to ten lanes at once and the whole edition is about a day and a half of lane time.

Suggested hours for a six-hour day starting at T (the HUB's first step): S-00 and S-01 by T+1:15 (the tooling is copied, not written); scouts T+1:15–T+2:00; lanes from T+2:00, tier 1 first; first slices READY about T+3:30; **freeze T+4:30**; quiet window T+4:30–T+5:15; **tag T+5:30**; hand-off note T+5:45; `STATE: HANDOVER` by T+6:00.

---

## 7. Gates, by name

| Gate | Command | Judged by |
|---|---|---|
| Build | `node offline/build.mjs` | exit 0, the file exists, size printed, CSP present |
| Node tests | `node --test offline/tests/` (scoped to the lane's files during the day: `node --test offline/tests/<file>`) | failure names against the baseline (empty on the base) |
| Content validation | `node -e "require('./offline/src/content.js'); …Engine.validateContent()"` (U-08 wraps it as `npm run validate`) | zero errors by name |
| Browser smoke | `npm run test:browser -- --grep <lane's tests>`; the full browser suite once, in the quiet window, by the HUB | failure names |
| Guards | `node offline/tests/guards.mjs`: CSP, external URLs only in resources/references, no `innerHTML` with data, theme parity, tutorial targets exist | zero findings by name |
| Docs | `python offline/docs/build_guide.py` builds; every image referenced exists | exit 0 |

The lock per repository for the suites is the method's; the browser suite is the heavy one and runs scoped during the day.

---

## 8. Decisions the HUB cannot make (defaults apply unless the owner answers before the lanes start)

| # | Question | Default | Applies |
|---|---|---|---|
| O1 | File and app name for this edition | `1-addic.html`, title "1-addic" (D13 stays open; the discreet title is "Notebook") | lane `core`, U-01 |
| O2 | PIN by default? | Offered in onboarding and recommended, not forced (a forgotten PIN means starting from a backup) | U-11 |
| O3 | Which region files | India (`in`) with every number marked "please verify", plus an international directory; the owner verifies before anyone else uses the file | U-10 |
| O4 | Voice | Device text-to-speech (`speechSynthesis`) with on-screen text always; no recorded audio | U-25, U-10 |
| O5 | Gujarati | Not in this tag; `locale:'en'` on the profile and every content item so it can be added | — |
| O6 | Sample data | A "Load sample data" button on the welcome screen and in Settings → Your data, marked as sample, erasable | U-33, U-19 |
| O7 | Stub or lock the tier-2 screens in the tag | Honest states as the Early Access plan: working, stub (one real action) or locked (one line naming what it will be); never a dead button | every UI lane |
| O8 | The `.docx` guide in the tag | Yes if U-36a merges; the full Part 3 comes with `offline-v1.1` | `tests-docs` |
| O9 | Pushing | The GOAL allows pushing `build/offline-v1`, the lane branches and the tag to origin; `main` is never touched | HUB |

---

## 9. Territory and append points

| File | Owner | Others |
|---|---|---|
| `offline/build.mjs` | `core` | append-only: the parts list between `// -- parts --` and `// -- end parts --` (one line per new file, in the order of 3.1) |
| `offline/src/styles.css` | `core` | append-only: a new section under the banner `/* -- <lane> -- */` at the end; tokens are never redefined |
| `offline/src/shell.html` | `core` | by outbox only |
| `offline/src/ui-core.js` | `core` | by outbox only; pages register through `UI.pages` from their own files |
| `offline/src/content-core.js` | `content` | append-only after the line `/* -- additions -- */` (add it in U-31a); other lanes ask by outbox |
| `offline/src/engine.js`, `store.js`, `actions.js` | `engine`, `core`, `actions-sos` | by outbox; a UI lane that needs a new rule writes the pure function in its own `ui-*.js` for the day and files a request |
| root `package.json` | `core` creates it (U-01); `tests-docs` adds scripts and the devDependency (U-34/U-37) under `// -- tests-docs --` is not possible in JSON: `tests-docs` owns the `scripts` and `devDependencies` keys, `core` owns the rest; both commit it by path | — |
| `README.md`, `CLAUDE.md` | `tests-docs` | append-only sections `## Offline edition` |
| `docs/offline/*` | the HUB (`<docs>` is `docs/offline/build-2026-11-07/`) | the method's files |

Protected (never touched by any lane): `main`, `origin/main`, the `claude/*` branches, `docs/PLAN.md`, `docs/BUILD-GUIDE.md`, `docs/decisions/0001`–`0021`, `docs/book/`, `docs/program/`, `scripts/`, `data/`, `.claude/settings.json` (the owner's), the pharma program and its launcher.

---

## 10. Acceptance of the whole, for the owner's walk

1. Copy `offline/1-addic.html` to a phone; open it in Chrome; the welcome screen appears; load the sample data; every tab opens; the top bar says "Saved on this device".
2. Erase; onboard for real in under three minutes; set a PIN; land on Today; take the tour; run the SOS drill (no log appears).
3. Airplane mode on: SOS → I'm craving → full flow with one delay → "the urge passed" → the log appears in Track with the skills rated.
4. Learn → Start Here → three lessons → the Reasons Card exists → SOS → Remind me why shows it.
5. Settings → Your data → Export; erase everything; import; everything is back.
6. Open the guide `.docx`: cover, contents, Parts 1–4, the screenshots match the screens.
