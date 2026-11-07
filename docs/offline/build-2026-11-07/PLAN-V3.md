# 1-addic · Offline edition · V3 build plan (8 November 2026)

**Written by:** the HUB chat (HUB 9, session `90539ba6`), 02:25–02:45 IST, from the owner's R-O-5 (02:09: "Look at what can be improved and complete building those in a new 1-addic V3. Also include a dedicated visual layer to see the status give effect. Keep this version copy for future analysis and let's proceed to update this version") and from `V3-IMPROVEMENTS.md` (the read-only review of offline-v1.1 by the owner's window, 02:21: 29 candidates with evidence by path, ranked and tiered; the visual status layer proposal in its section 2). This file holds V3's units, lanes, arithmetic, hours and decisions. Everything it does not restate is as in `PLAN.md` (sections 4 to 8: slots, gates, rules, how a lane is built, how the HUB merges) and `docs/offline/BUILD-PLAN.md` (the specification). The candidates' evidence stays in V3-IMPROVEMENTS.md; every unit below names its candidate id.

**The goal in one line.** The same single file, `offline/1-addic.html`, improved over offline-v1.1 (f69bc68): a dedicated visual status layer where the person sees their recovery status and sees their actions take effect, every dead end a person meets closed, the browser hooks round, the guide complete with screenshots, the docs true, the open LOW findings by name, the tooling defects. Tag **`offline-v3.0`** (default; the owner may rename it) at the green on the trunk `build/offline-v1`; offline-v1.1 stays as the tag and as `offline/releases/1-addic-v1.1.html`.

---

## 1. The shape (what changes from PLAN.md section 1)

| Piece | V3 |
|---|---|
| Trunk, base | `build/offline-v1` unchanged; **BASE f69bc68a** (the tag offline-v1.1). The lane branches exist and are merged: a lane fast-forwards `build/<lane>` and its worktree to BASE (no merge commit, as tests-docs did at 02:03), then builds its V3 units on it. No new branch names. |
| Lanes | The same ten lanes with the same owners and chats; the territory grows by the files named in section 2 (`coordination/territory.json` carries them). An eleventh "lane", **tooling**, is the HUB's own (the launcher, `lane.js`): fixed by the HUB's plain sub-agents under the tooling's self-tests, never on the product's gates. |
| Args | `tracks/HUB/workflows/lane_args_v3.json`: the lanes' V3 objects (units, batches, unitTier, unitNotes, laneNote), same shape as `lane_args.json`; a chat launches `lane.js` with `...lanes.<lane>` from the V3 file, `base` f69bc68a (or the BASE of the moment), `done` the lane's v1 units, `diffFrom` the fast-forward point. |
| Chats | CORE and SCREENS as before (Prompts 1 and 2 plus the V3 paragraph in `KICKOFF-PROMPTS.md`); the owner's window files R-O lines, relays the walk findings and the clinical reviewer's answers. |
| Decisions | Section 5 below, with defaults and the time each applies. |

---

## 2. The units and lanes

Hours are build estimates (V3-IMPROVEMENTS.md, re-cut by unit). ★ = the lane's slice (the first batch, one unit). Tier 1 = what makes V3 what the owner asked (the status layer, the dead ends, the hooks round, the guide and docs); tier 2 = the LOWs by name and depth. "after X" = the unit starts when the board shows X merged; until then the lane builds on the contract and switches at the merge.

### Track CORE

| Lane | Flagged | V3 units in build order (hours, tier, candidate) | Hours | Starts |
|---|---|---|---|---|
| `tests-docs` | no | U-35 screenshots (1.5, T1, V3-07; running since 02:07, the slice) · **V-07** U-36b guide Parts 3 and 4 with the Node and browser counts (2.5, T1, V3-07) · **V-03** the hooks round, test side: `helpers/hooks.mjs` and `flows.mjs` learn every hook of R-S-6, R-S-7, R-S-11, R-S-12, R-S-16, the load-sample note and the lock-said parent; the SOS drill and craving flows tap helped-yes then Check in (V3-04); the quick-log flow starts at `#/track` (V3-05); the three skipped browser tests run (the researcher's grep of 02:20: every hook of R-S-6 and R-S-11 is already in the source; `hooks.mjs` names none of them; the one absent is `actions-open-planner`, while `actions-to-planner` exists); a hook missing in another lane's file is asked of its owner by outbox, with the attribute name and the element (2.2, T1, V3-03) · **V-06** docs true again: `offline/README.md`, the `## Offline edition` sections of README.md and CLAUDE.md say what is merged (1, T1, V3-06) · **V-01t** the status layer's browser tests (section 3) and its guide lesson and screenshot (1.5, T1; after today-track V-01b) · **V-22a** C-TM-1 (0.2, T2) · **V-26b** boot-time budget: a browser test that reports and bounds the time to the first `ui:rendered` (0.7, T2, V3-26) · **V-27** contrast guard: a Node check of the theme token pairs in both themes at 4.5:1 (1, T2, V3-27) · **V-29** the ADR 0022 row in `docs/decisions/README.md` (0.1, T2, V3-29) | 10.7 | has slot 5 |
| `core` | yes | ★ **V-11** a static safety line inside `<main>` of `shell.html` before boot ("If you are in danger, call your local emergency number" and the built-in number), replaced at the first render (0.5, T1, V3-11) · **V-16** LOWs N1, N2, Q-a as ruled in `tracks/CORE/contracts/core.md` (1, T2, V3-16) · **V-17a** `Store.status().lockId`, opaque, as ruled in `contracts/actions-sos.md` (0.5, T2, V3-17) · **V-26a** `build.mjs` prints per-part sizes (0.3, T2, V3-26) | 2.3 | second CORE slot |
| `actions-sos` | yes | ★ **V-08a** `Actions.useSkill({skillId, helpful})`: a skill used in a game is credited (SkillUsed through Actions, never a refused verb) (0.5, T1, V3-08) · **V-SOS10** the SOS rating "10" wraps at 390 px, seen in the U-35 screenshots (CORE 10, R-C-46): one line at phone width (0.3, T1) · **V-25** unlock gives a sign of life: an `aria-live` "Opening your notebook" line during the key derivation (0.3, T2, V3-25) · **V-18** RC22, RC23, R8-RC1 as ruled (1, T2, V3-18) · **V-17b** SOS marks its waiting saves with `lockId` (0.5, T2; after core V-17a) | 2.6 | after core's slice merges, or on a free slot |
| `engine` | no | ★ **V-19** FIX-SPIRAL-OWN: `own: boolean` on each spiral reply pair; a filled reply is never shown as the person's own (0.5, T2, V3-19) · **V-30** export `tutorialDone` (ui-guidance.js calls it behind a typeof guard; engine.js exports only the tour/drill wrappers) (0.2, T2) | 0.7 | tier 2 |
| `learn` | no | ★ **V-20** C3: the "+10 XP" words only the first time a module's checkpoint is finished (0.3, T2, V3-20); C4, C5 as the lane report names them (0.2, T2) | 0.5 | tier 2 |

### Track SCREENS

| Lane | Flagged | V3 units in build order (hours, tier, candidate) | Hours | Starts |
|---|---|---|---|---|
| `today-track` | no | ★ **V-01a** the status layer "Your Harbor", page `#/status`, new `offline/src/ui-status.js` (`StatusUI`, registered as `UI.pages.status`; one parts line in `build.mjs`): the scene (`HarborUI.scene` reused; `data-place` taps open a sheet with the region's skills, levels and uses from `GameUI.model`), "Where you stand" (`GameUI.rankCard`, `xpBar`, badges; total days only with counters on and discreet off; never the current run), "Next small step" (Explorer, else next lesson or roadmap focus, else a quest step; one link), Back to Today and an SOS link; `StatusUI.model` and `StatusUI.diff` pure; Calm, discreet and reduced-motion rules; new `offline/tests/status.test.mjs` (section 3) (3, T1, V3-01) · **V-01b** "What just changed" (rises only since the page was last drawn: a light that grew, XP today, a badge, a rank, an Explorer or quest step, a day banked; the place pulses once, `hb-grew`, transform only, none under reduced motion or on an SOS route; first open "Here is where you stand"); the 14-day strip of dated dots from `Engine.momentum`; "What to watch" from `Engine.warningSigns` with each sign's plan, gentle, never red, and the same card at `#/track/radar` (closes V3-02); the "Your harbor" chip in Today's header quick row and the harbor card as a link; the CSS in today-track's section (2, T1, V3-01, V3-02) | 5 | first SCREENS slot |
| `content` | no | ★ **V-10** `Content.features.status`, its JIT tutorial and help entry, the "status" words of the glossary if any (0.3, T1, V3-28) · **V-10b** the India crisis numbers: the `verify: true` flags cleared only for the numbers the owner confirms (I6) (0.5, T1; after the owner's answer; else they stay "please verify") · **V-23** C2, C3, C4 (0.3, T2, V3-23) · the clinical-review fixes by name, after the reviewer's answers (hours by the answers; V3-09) | 1.1 + | after today-track's slice, or on a free slot |
| `game-tutorials` | no | ★ **V-08b** `ui-tools.js` credits a used skill through `Actions.useSkill` (0.5, T1, V3-08; after actions-sos V-08a merges; on the contract before) · **V-28** the tour step on `status-open`, the JIT wiring and the dot for `Content.features.status` (0.4, T1, V3-28) · **V-21** C1 and the coach after a route change: the tour ends as aborted when the route leaves Today; both narrow/flip branches tested (1, T2, V3-21) | 1.9 | after today-track's slice |
| `workbook-settings` | no | ★ **V-24** the early-access sentence in Settings says what is true now (0.2, T2, V3-24) · **V-22b** C1b: the conditional becomes an assert (0.3, T2) | 0.5 | tier 2 |
| `actions` | no | ★ **V-03h** the one absent hook, `actions-open-planner`, or the confirmation that `actions-to-planner` is it (0.1, T1) | 0.1 | when asked by tests-docs |

### The HUB's own

| Lane | Units (hours, tier, candidate) | Hours |
|---|---|---|
| `tooling` (HUB, plain sub-agents, the tooling's self-tests) | **V-12** the launcher's `--pause` survives a tick (0.5, T2, V3-12) · **V-13** one launch per track: a lock around `once()` and a per-track launching lease (0.5, T2, V3-13) · **V-14** a dead listed chat is not live: a row whose pid is gone or whose transcript is 30 minutes still is dropped (0.5, T2, V3-14) · **V-15** `lane.js` passes reviewer findings by file, capped like `prevNote` (0.5, T2, V3-15) | 2 |
| `review pack` (HUB, a read-only sub-agent) | **V-09** the clinical-review pack `CLINICAL-REVIEW-PACK.md` under `<docs>`: every `clinicalReview` passage by path (ui-sos.js COPY, FALLBACK, CRISIS, OVERDOSE, LEAD; boot.js; ui-core.js URGENT; ui-onboarding.js; ui-settings.js; ui-exercise.js URGENT_LINE; engine.js CRISIS; the M9/M10 lessons, four exercises, five practices, opioidSafety), each with its current words, for the owner's clinical reviewer; fixes by name go to content and actions-sos after the answers (1, T1, V3-09) | 1 |

**Totals.** Tier 1 ≈ 20 estimated hours (today-track 5, tests-docs 8.7, core 0.5, actions-sos 0.5, content 0.8, game-tutorials 0.9, actions 0.1, the review pack 1); tier 2 ≈ 11 (tests-docs 2, core 1.8, actions-sos 1.8, engine 0.7, learn 0.5, content 0.3, game-tutorials 1, workbook-settings 0.5, tooling 2). About 31 in all.

**The chain (tier 1 order):** U-35 → V-01a → V-07 → V-01b → V-10 → V-03 → V-08a → V-08b → V-28 → V-06 → V-11 → V-01t. A tag that holds the chain is the v1.1 file plus a status page the person reaches in one tap from Today, where what they just did shows, with the guide complete and every browser flow running.

**Dependencies.** V-01t (tests-docs) needs V-01b merged (the hooks' names are fixed in section 3, so the tests can be written against the contract and run at the merge). V-08b needs V-08a merged (the contract: `Actions.useSkill({skillId, helpful}) -> {ok, event}`; on refusal nothing is thrown). V-17b needs V-17a. The hooks of V-03 that live in other lanes' files go by outbox to their owners the moment tests-docs lists them (the attribute convention is `data-test` as `helpers/hooks.mjs` uses it; the owner adds the attribute only, never behaviour). V-10b and the clinical fixes wait for the owner and the reviewer; they are never a reason to hold the tag.

**Not in V3 (V3-IMPROVEMENTS.md section 3, binding):** streaks or the current run as a headline; random rewards, spinners, countdowns; XP for claimed days; a risk score or red colour from the radar; sharing, sync, notifications, a service worker, any network; remote fonts or analytics; a second file; the book's text; caching the PIN or weakening the key derivation.

---

## 3. The status layer's contract (binding for today-track, tests-docs, content, game-tutorials)

- **Route and registration:** `#/status`, `UI.pages.status` from `ui-status.js`; no change to `ui-core.js` (its `pageKey` accepts any registered segment). `build.mjs` gets one line at the parts append point, after `ui-harbor.js`. `ui-harbor.js` gets `data-place="<region>"` on each place and the `hb-grew` class only.
- **Pure functions:** `StatusUI.model(gs, extra)` and `StatusUI.diff(before, after)` take plain objects and return plain objects; the "changed" lines are rises only; a slip changes no level; nothing is computed in the DOM; the Engine is read, never written.
- **Never decreases on the page:** levels, XP, badges, rank, total days, Explorer and quest ticks. The current run never appears. The 14-day strip is dated history without a count (decision V-Q4).
- **Modes:** Calm: no scene, no XP, no badges; the places as a plain list, what to watch, next step. Discreet: no scene, no days. Reduced motion (`prefers-reduced-motion`, `data-motion=reduce`) or an SOS route: no pulse, the words carry it. Accessible: the sheet and every control reachable by keyboard, named, contrast as the tokens give.
- **SOS:** the chrome's `#sos-btn` stays on the page as on every page; the page adds a `status-sos` link. Never gated.
- **Hooks (`data-test`):** `status-page`, `status-scene`, `status-place` (with `data-region`, `data-level`), `status-change`, `status-change-item` (`data-kind`), `status-stand`, `status-days`, `status-strip`, `status-strip-day` (`data-date`, `data-active`), `status-watch`, `status-watch-item` (`data-sign`), `status-next`, `status-next-go`, `status-sos`, `status-back`; on Today: `today-status`, `today-harbor-go`. `data-tour`: `status-open` (the Today chip), `status-scene`, `status-change`, `status-watch`. The names are fixed here so tests-docs writes against them before the merge; `helpers/hooks.mjs` lists them.
- **Node tests (`offline/tests/status.test.mjs`, today-track):** model and diff pure and deterministic; a SkillUsed raises its region and the diff names it; a SlipLogged plus a slip log leaves every level equal and the diff empty; Calm, discreet and reduced-motion rules; every route renders with no dead button and SOS one tap away; text as text (no `innerHTML` with data); no network; pure exports only.
- **Browser tests (tests-docs, V-01t):** "status opens from Today in one tap"; "status shows the change after a quick log"; "status: a slip lowers no light" (`data-level` before and after); "status under reduced motion has no moving class".
- **Content (content, V-10):** `Content.features.status` (revealed with the Harbor, never later than m1), the JIT tutorial for the first open, the help entry; original words, grade 6 to 8, no promise of outcomes.
- **Guidance (game-tutorials, V-28):** the tour step on `status-open`; `GuidanceUI.dot` shows "New" on the chip once the feature exists.

---

## 4. The arithmetic and the hours

T = **02:25 IST, 2026-11-08** (the V3 cut). Slots from the rows as in PLAN.md section 4: one start per 7.0 GB row, measured about 3 GB per running lane, the 4.0 GB floor; the pharma program shares the machine. At 02:12 the row was 8.4 GB with one lane running (tests-docs U-35); at 02:23 it fell to 2.0 GB (the pharma program's build): under the floor, tests-docs paused at its next commit (dfc2703, 02:25) by the rule; no start until a row at or above 7.0 GB, one per row.

| When (IST) | What |
|---|---|
| 02:25–02:50 | This plan, `lane_args_v3.json`, `territory.json`, the V3 paragraph of `KICKOFF-PROMPTS.md`; R-H-38 to both chats; the questions on the board. |
| 02:50 → | SCREENS scouts today-track's V3 units (its first hour); today-track starts on the first 7.0 GB row (the critical path: 5 h). tests-docs runs on (U-35, then V-07, V-03, V-06). CORE's core slice V-11 and actions-sos V-08a on the next rows; SCREENS' small lanes after today-track's slice. |
| ≈ 05:30 | today-track READY-SLICE V-01a; merged; V-01b runs. |
| ≈ 08:00 | today-track READY V-01b; merged; tests-docs V-01t, content V-10, game-tutorials V-28 follow. |
| **≈ 11:30 FREEZE** | what is READY or READY-SLICE by then plus fixes by name; the tag's list on the board. The arithmetic: tests-docs' tier 1 is 8.7 estimated hours from 02:07 at about one per clock hour, so its last tier 1 unit (V-01t) lands about 11:00 if the rows hold two lanes from 03:00. |
| 11:30–12:15 QUIET | the full gates on `_int` at the trunk tip (build, every Node test, validate, guards, the full browser suite, docs); reds by name, fixes by territory, merged. |
| **≈ 12:30 TAG** | `offline-v3.0` (or the owner's name), annotated, pushed; a red named rather than no tag. Then the hand-off note, the board, the lane branches pushed. |

**What `offline-v3.0` can honestly hold** with two lanes running from 03:00 and the rows at 7.0 GB: the status layer (V-01a, V-01b), its content and tour step (V-10, V-28), the hooks round (V-03 and the owners' attributes), the guide complete with screenshots (U-35, V-07), the docs true (V-06), useSkill (V-08a, V-08b), the safety line before boot (V-11), the status browser tests (V-01t), and the tier 2 LOWs whose lanes got a slot after no tier 1 lane waited. **What moves to the next tag** unless the rows widen: the clinical-review copy (after the reviewer), the India flags (after the owner's I6), the boot-time budget and the contrast guard, the tooling fixes not done by the freeze. The hours are re-cut on the board every two hours from the rows; the owner is promised the arithmetic, not the wish.

---

## 5. Decisions (defaults apply unless the owner answers before the time named)

| # | Question | Default | Applies |
|---|---|---|---|
| V-Q1 | The tag's name | `offline-v3.0` | at the tag |
| V-Q2 | "A dedicated visual layer to see the status give effect": the person's recovery status taking effect visually in the app (built), or the build program's status (a published board)? | The person's status in the app (V-01); the program's visual board is a separate ask | 03:30 (today-track's start) |
| V-Q3 | A page at `#/status` or an overlay over Today? | A page: the back button works, it prints, nothing sits over SOS | 03:30 |
| V-Q4 | The 14-day activity strip (it changes as days roll off)? | Shown as dated dots without a count; dropped if only growing things may appear | 03:30 |
| V-Q5 | "What just changed" since the page was last drawn this session, or since the person last looked (a settings key)? | This session, no new write | 03:30 |
| V-Q6 | The page's name | "Your Harbor" | 03:30 |
| V-Q7 | The India crisis numbers (input I6): which are confirmed? | None cleared; every number keeps "please verify" | at the tag |
| V-Q8 | The clinical review: who reads the pack and when? | The pack is produced (V-09); no copy changes before the reviewer's answers | at the tag |

Reply to copy back: `V-Q1-V-Q8 default` (or e.g. `V-Q3: overlay`, `V-Q7: 112 and Tele-MANAS confirmed`).

---

## 6. The files

`PLAN-V3.md` (this) · `V3-IMPROVEMENTS.md` (the review; evidence by path) · `tracks/HUB/workflows/lane_args_v3.json` · `coordination/territory.json` (extended: today-track owns `offline/src/ui-status.js` and `offline/tests/status.test.mjs`) · `KICKOFF-PROMPTS.md` (the V3 paragraph in Prompts 1 and 2) · `CLINICAL-REVIEW-PACK.md` (V-09, when written) · everything else as PLAN.md section 10 (status files, outboxes, board, baselines, run records, briefs, contracts, lane reports).
