Annex to today-track-v3.md (it holds V-01a and V-01b); this file is V-43 only (R-O-6). Read at trunk 37d1a53c (BASE, 2026-11-08); cites are path:line at 37d1a53c. V-01b is in build (wf_ccfdc4d0-2ae) and was not read.

# today-track V-43: objectives, the run, the quest-line (2 h, tier 1, not flagged, the whole lane is one batch)

## Goal
1. Today gets a "Today's objectives" card, a run line in the header and the quest-line's current-step card with its claim.
2. Your Harbor (#/status) draws one growth element per objective day in the scene, shows the spine "Your way", and shows the run in "Where you stand".
3. Everything is read from Engine and written only through Actions; nothing is computed in the DOM; nothing ever decreases; SOS is never gated.

## Files
Owned: offline/src/ui-today.js, ui-harbor.js, ui-status.js, ui-track.js (no change: the radar card is V-01b's), offline/tests/status.test.mjs, today-track.test.mjs.
- ui-today.js: header quick row :507-509 (`row td-quick`: log craving, SOS); cardsFor :280-285 (list `all`); `make` map :511-515; helpers embedFn :298, ctxOf, safe; countersCard :385 (O6, stays); harborCard :472; page :~490; PURE and exports :520-523; UI.pages.today :530.
- ui-harbor.js: scene(ctxIn) :84-137 (places via place(s,id,level,...art) :77, each g has data-place; lights :72; glow :80; hidden(c) :55 returns no scene in Calm or discreet); PURE :~139.
- ui-status.js: TEXT :~10-35; model :122-153 (pure; says "no current-run field"); ticks :151; diff :156-175 (up() rises only); extraOf ends :~228; page :237-293 (scene div :255; places list :270; "Where you stand" `stand` :280-287, data-test status-stand, status-days; `next` :288; return :292); PURE :296.
- styles.css (CORE file, append only): today-track blocks :383-465 and :694-707. Add one section at the very end `/* -- today-track V-43 -- */ ... /* -- end today-track V-43 -- */`; tokens never redefined.
- V-01b adds (not yet read): "What just changed", the 14-day strip and "What to watch" in ui-status.js; the "Your harbor" chip (today-status) and today-harbor-go in ui-today.js; the radar card in ui-track.js. Rebase on its merge; do not move its parts. V-43 puts the growth block right after the scene, "Your way" after `stand`, and the Today cards by the `make` keys below.
- Do not touch: engine.js, actions.js, content-*.js, ui-guidance.js, ui-core.js, build.mjs, hooks.mjs, browser.test.mjs, docs/offline.

## Order: U1 Today, U2 Harbor growth, U3 Status, U4 tests

## U1 Today (ui-today.js)
Sources (each via ns('Engine'), `typeof E.fn === 'function'`, inside safe()): Engine.dailyObjectives, Engine.run, Engine.questLine (waits for V-40). Words from Content (runWords, step title/line/opened, objective title/line, features[reward].name); a few fixed labels in TEXT.
- Objectives card: key `objectives` (cardsFor: after `checkin`, before `plan`), data-test objectives-card, data-tour objectives-card, heading "Today's objectives". One row per item: data-test objective, data-id, data-done "true"/"false"; title and line; button objective-done (text "Done", 44 px) only while not done; a done row shows "Done" text, no button. Button objective-swap only where item.swappable is true, item.swapTo is set and result.swapped is false; gone once swapped. Taps call Actions.objective.done(id) / .swap(id); {ok:false,message} shows the message in a role=status line, never throws; an ok result re-renders through Store.subscribe. Growth line: with growth > 0 "N things growing in your harbor"; at 0 "The first one grows when you do one."
- Run line: data-test run-line, data-tour run-line, a row under the h1 before td-quick: runWords.header ("Days shown up") then spans run-current, run-best, run-total ("current · best · total"). run-kept only when run.holding (runWords.keptLine, else "Kept"); run-back only when run.cameBack (runWords.cameBackLine, else "You came back."). Never "streak", "lost", "broken", "reset", a countdown or an hours-left line. Not a sober-day counter: countersCard (:385) is unchanged.
- Quest-line card: key `questline` (after `objectives`), data-test questline-card, data-tour questline-card. Shows ql.current (the step object): title, line, "Unlocks: <features[reward].name>", opened line, progress "have of need". Button questline-claim only when current.claimable. Claim: Actions.questLine.claim(current.id); on ok take payload.feature of the FeatureUnlocked event in res.events and call GuidanceUI.rewardSheet(feature, ctxOf(c)) behind typeof (V-44's; a null return is fine, the unlock shows on the next Today). A refusal shows its message, no sheet. current null with ql.done === ql.total: one line "Every step is done."; absent questLine: no card.
- Modes: Calm: both cards and the run line stay as plain text (no motion). Discreet: objectives and run line with neutral words; the quest-line card hidden (reward names are not neutral). Maintenance (cardsFor base list): objectives only. Nothing is added on SOS routes; SOS stays in td-quick.
- Absent Engine or Actions (V-40/V-41 unmerged): the card or line is not drawn, no dead button (O7).

## U2 Harbor growth (ui-harbor.js)
In scene() after the six places and before `wrap`, append `g.hb-growth` (data-test status-growth-layer, pointer-events none, no data-place). N = Engine.growth(view) (typeof guard, else 0); draw min(N, 60); the words give the true N. New pure `growthSpots(n) -> [{x,y,kind}]` (export in PURE): spots from a fixed table of 60 on the pier deck, hill and water edge, off the places' tap areas (lighthouse x 38-58, cove x 10-172 y 132-198, pier x 176-286 y 138-171, garden hill x 196-360 y 70-140, weather x 330-350, compass x 308-336 y 162-190); kind = ['lantern','tree','boat','bench','flag','gull','garden','bell'][k % 8]. growthSpots(n+1) begins with growthSpots(n), so the scene only adds. The place taps (Status scene click handler :255, closest('[data-place]')) keep working. Scene aria-label adds ", N things growing". hidden(c) :55 unchanged: Calm and discreet get no scene.

## U3 Status (ui-status.js)
- extraOf passes growth (number), run, way ({steps,current,done,total}) from the Engine, null if absent. model stays pure and reads only `extra`. diff gains growth, run.best, run.total (rises only; equal or lower: nothing).
- Growth block, data-test status-growth, after the scene: one li status-growth-item per unit drawn (kind name), capped at 60 plus "and N more". Calm: no items, one line in words "N things growing in your harbor". Discreet: block and scene absent (unchanged). N = 0: "Nothing growing yet. An objective done on Today starts it."
- "Your way", data-test status-way, h2 "Your way", after `stand`: ol of li questline-step with data-state done|current|locked. done: title and opened; current: title, line, reward name, progress, and a link "Claim it on Today" (#/today) when claimable; locked: the title only (no line, reward or condition). Calm: same as plain text. Discreet: no reward names. Absent questLine: no block.
- In "Where you stand" (stand :280), from V-43 on (HUB ruling 1451806, PLAN-V3 s3): run-current, run-best, run-total, plus run-kept / run-back by the Today rules. status-days and the O6 counters stay.

## Acceptance (PLAN-V3 s7 V-43)
Today shows three objectives (tap to do, one swap a day), the growth line, the run line (kept on a grace day; "you came back" after a break; no countdown or shame line) and the quest-line step with its claim. Status draws one growth element per unit, never removed, Calm in words, discreet unchanged; "Your way" lists done / current / locked (locked title only); the run sits in "Where you stand". With no V-40/V-41 the pages equal V-01a/b.

## Tests (Node; names fixed)
status.test.mjs: "growth: a done objective adds one growth element and never removes one"; "growth: same units give the same elements"; "growth: Calm shows the count as words, no elements"; "growth: discreet draws nothing new"; "way: a locked step shows its title only"; "way: current shows reward and progress, done shows opened"; "run: a break shows 'you came back' and the same best and total"; "diff: growth, best and total only rise"; "way: Engine.questLine absent means no block and no dead button".
today-track.test.mjs: "objectives: card absent when Engine.dailyObjectives is absent"; "objectives: done button only on an undone item, swap hidden once swapped"; "objectives: a refusal shows its message and never throws"; "run: kept only when holding, back only when cameBack, no countdown words"; "questline: claim only when claimable, card absent when questLine absent"; "questline: absent GuidanceUI.rewardSheet does not throw"; "today: the sober-day counters card is unchanged". Browser tests (3.13, tests-docs V-45) fed: "an objective done grows the harbor", "a break keeps best and total", "a quest-line step unlocks a feature". Tests use stub Engine/Actions objects, so they run before the other lanes merge.

## Hooks (data-test; data-tour for tours)
objectives-card, objective (data-id, data-done), objective-done, objective-swap, run-line, run-current, run-best, run-total, run-kept, run-back, questline-card, questline-step (data-state), questline-claim, status-growth, status-growth-item, status-way. data-tour: questline-card, objectives-card, run-line (Today). Existing hooks stay.

## Rules that bite
Never a countdown, a shame line, a decrease or a red; no XP or count for a claimed sober day; sample rows count toward nothing (O6, R-H-41); the quest-line only opens more, never locks an open tool (R-S-20; where a gate is needed read Engine.unlocked behind typeof, else Engine.revealed; ctx.features comes from core, R-S-21); SOS and Help one tap from every screen, never gated, never behind a sheet; text via text:, never HTML; 44 px targets, visible focus, no new animation (reduced motion); original words, grade 6-8, person-first, no promise; no clinical copy added.

## Dependencies and order
Chain: V-01b -> V-40 (engine) -> V-42 (content) -> V-41 (actions-sos) -> V-43 -> V-44 (reward sheet, called behind typeof, not a wait) -> V-45. Go-aheads: V-01b merged; V-40, V-41, V-42 merged on PLAN-V3 s7 plus its Refinements (77bcd490, R-C-50). If a merge is late, build and test against stubs; the screens degrade as stated.

## Decisions that bite
O1 file offline/1-addic.html, title "1-addic", discreet title "Notebook"; O2 PIN offered, never forced; O3 India numbers "please verify" (not this lane); O4 read-aloud by speechSynthesis only; O5 no Gujarati, locale 'en'; O6 Load sample data, marked and erasable; O7 a control whose verb is absent is not drawn; O8 the .docx guide is tests-docs'. V-Q9..V-Q13 defaults apply from 04:00 IST unless outbox-OWNER.md says otherwise.

## Open questions (default taken)
1. Which element per unit: the fixed 8-kind cycle by index (the Engine does not list per-day kinds); later ask CORE for growth kinds. 2. Discreet shows objectives and run, not the quest-line card. 3. Maintenance: objectives only. 4. Words missing in Content.runWords: TEXT fallback with the same plain words. 5. A key clash with V-01b's chip: V-01b keeps its place, V-43 goes after it. 6. Cap of 60 drawn elements: keep.

## Gates
python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/today-track --lane today-track build test validate guards (browser where it applies); baselines by name in coordination/baselines.md. Territory: python tools/check_territory.py today-track 37d1a53c..HEAD --wt C:/Users/ruchi/1-addic-wt/today-track.
