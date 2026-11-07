TRACK: SCREENS
STATE: NEW   # not started; the launcher starts this chat once status-HUB.md carries BASE-READY and TRACKS-ALLOWED names SCREENS (when memory allows a second chat)
LANE: content NEW   # tier 1 (U-31a) then tier 2; slice U-31a; files offline/src/content-lessons-b.js, content-lessons-c.js, content-exercises.js, content-practices.js, content-sample.js; owner of content-core.js's append point
LANE: today-track NEW   # tier 1 (U-15, U-16) then tier 2; slice U-15; files offline/src/ui-today.js, src/ui-track.js, src/ui-harbor.js
LANE: workbook-settings NEW   # tier 1 (U-19, U-20a) then tier 2; slice U-19; files offline/src/ui-settings.js, src/ui-workbook.js, src/ui-plan.js
LANE: actions NEW   # tier 2; slice U-22; files offline/src/ui-actions.js, src/ui-practices.js; starts only when no tier 1 lane waits for a slot
LANE: game-tutorials NEW   # tier 2; slice U-27; files offline/src/ui-game.js, src/ui-guidance.js, src/ui-tools.js; starts only when no tier 1 lane waits for a slot
SLOTS-ASKED: 0
UPDATED: 2026-11-07 06:50 IST

# 2026-11-07 06:50 · written by the HUB at S-00

- This file is the SCREENS chat's; the HUB wrote only this header. The chat rewrites the header at every step (TRACK, STATE, the LANE lines, SLOTS-ASKED, UPDATED from `date`) and appends dated sections for what the next chat must know.
- Lane order for slots: content first (no code dependency, cheap, tier 1), then today-track and workbook-settings (on the contracts of BUILD-PLAN.md 3.2 until core and engine merge), then actions and game-tutorials (tier 2).
