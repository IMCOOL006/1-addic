TRACK: SCREENS
STATE: SCOUTING   # 2026-11-07 16:09 IST: SCREENS chat 6721d28e started 16:05; five scouts live (lane.js start: 'scout', one run per lane); content's slot 4 is granted (cut from BASE 1ef2482e once its brief exists); today-track, workbook-settings HELD by the HUB (7.0 GB rows)
LANE: content NEW   # scout wf_775e2870-386 live; slot 4 granted 16:03; slice U-31a; then U-31b+U-29, U-30+U-32+U-33
LANE: today-track NEW   # scout wf_7fed43a4-107 live; slot HELD (HUB); slice U-15; real ui-core/store/engine/actions at BASE
LANE: workbook-settings NEW   # scout wf_d0ab1d38-3c2 live; slot HELD (HUB); slice U-19; R-C-13 (5)-(9) are its
LANE: actions NEW   # scout wf_2ddf548c-8fe live; tier 2: starts when no tier 1 lane waits for a slot; slice U-22
LANE: game-tutorials NEW   # scout wf_5b4ee79d-812 live; tier 2: starts when no tier 1 lane waits for a slot; slice U-27
SLOTS-ASKED: 5   # in this order: content (granted slot 4), today-track, workbook-settings (tier 1), then actions, game-tutorials (tier 2, only when no tier 1 lane waits)
UPDATED: 2026-11-07 16:09 IST

# 2026-11-07 16:09 IST · SCREENS chat 6721d28e-5b48-49f1-9f7e-094b769e422f starts

- Read: PLAN.md 1, 2, 5, 6, 7, 9; status-HUB.md (BASE 1ef2482e; content slot 4 granted 16:03; today-track, workbook-settings HELD; tag offline-v1.0 cut 11:40, so every lane now builds toward offline-v1.1); outbox-OWNER.md (R-O-2: the defaults are the owner's); outbox-CORE.md R-C-9, R-C-13, R-C-18 and outbox-HUB.md R-H-19 (the asks for content and workbook-settings); lane.js header and scout stage; lane_args.json _readme and the five lanes; territory.json and overlap-register.md; baselines.md (the 15 baselined tour targets are SCREENS screens' names); status-CORE.md header; BUILD-PLAN.md 2 and 3.2-3.5.
- Scouts: one lane.js run per lane, start: 'scout', base 1ef2482e, now 16:07. The laneNote of each carries a correction: the base worktree _base sits at BASE-READY 655516dc, not at BASE, so the scouts read the code at BASE with git show 1ef2482e:<path> (the trunk checkout is read-only for them).
- What the trunk holds at BASE: the real ui-core.js, store.js, engine.js (validateContent on), actions.js (U-09), ui-learn.js, ui-exercise.js; build.mjs already lists every SCREENS part. Not merged: ui-sos.js, ui-onboarding.js (actions-sos FIX-R3). Browser tests and offline/tests/helpers/hooks.mjs are tests-docs' (CORE): new hooks go by outbox.

# 2026-11-07 06:50 · written by the HUB at S-00

- This file is the SCREENS chat's; the HUB wrote only this header. The chat rewrites the header at every step (TRACK, STATE, the LANE lines, SLOTS-ASKED, UPDATED from `date`) and appends dated sections for what the next chat must know.
- Lane order for slots: content first (no code dependency, cheap, tier 1), then today-track and workbook-settings (on the contracts of BUILD-PLAN.md 3.2 until core and engine merge), then actions and game-tutorials (tier 2).
