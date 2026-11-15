# GUIDE-V34 (tests-docs, docs only, not flagged)

Written 2026-11-15 10:04 IST by CORE 08:23 from R-H-64 (the default 'yes, small'; the owner did not say 'no guide change'), R-H-74 (2) and R-H-76 (the known issue of the board's NEEDS YOU 8 with its one-tab workaround).

## Scope: only what a person would look up, in the guide's own places, the shortest true words, original words only
1. **The not-saved line** (offline/docs/1-addic-Guide.md, in the part on your data and backups, near '## Backups' at :167, or where the guide already speaks of saving): what the app says when a change is not saved because the notebook changed in another tab, and what to do. The words the app shows (quote them exactly; they are the app's own): 'This notebook changed in another tab, so your last change was not saved.' Facts to say, from contracts/core.md's last section (the kept line's lifetime, core 5f32f03): it shows as a short message and as a line under the top bar that stays; if the notebook is locked it shows on the lock page until you unlock; otherwise it stays on that page until you go to another page or a save of yours goes through; it never shows in SOS. What to do: enter the change again (after unlocking if the lock page shows); keep the notebook open in one tab. Two to five sentences.
2. **Known issue (the board's NEEDS YOU 8)** under '## Known quirks' (:433): if 1-addic is open in two tabs and you remove your PIN in one, entries saved in the other tab after the first tab was opened can be lost (Store.lock.remove() rewrites the notebook from the removing tab's own rows; evidence C:/Users/ruchi/1-addic-wt/_logs/scratch/core-kept-probe-20261115/B/run1.log:42-53; the fix FIX-REMOVE-STALE-ROWS comes after offline-v3.4). Workaround, plainly: before you remove your PIN, close every other tab with 1-addic open (use one tab). One or two sentences; say nothing about changing or setting a PIN or restoring a backup (not checked yet).
3. Nothing on the lock page's Back press (it simply works). The India numbers stay as they are (please verify, four lines, no change).

## KEEP
- No screenshot retaken (no pictured screen changed). No new heading unless the guide has no place for item 1.
- Grade 6-8, person-first, no clinical words. Never a word of the source book.
- The .docx rebuilt from the .md with the guide's own pipeline (`python offline/docs/build_guide.py`, CLAUDE.md 'Offline edition'); the docs gate green.
