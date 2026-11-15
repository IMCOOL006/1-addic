# FIX-REMOVE-STALE-ROWS (core, flagged: the person's data; two reviewers)

Written 2026-11-15 12:30 IST by CORE 11:24, from a scout's reading (wf_52e993b5-bf3, read-only; its Write was refused, so the chat wrote this file) and the chat's own reading of the lines below. Grant: R-H-74 (from R-C-102). After the tag offline-v3.4 (8bd439b2); merge base: the trunk tip at the cut. Lines are store.js at cbae1bb (= the trunk's offline/src).

## The finding
Two tabs of the file share one storage. `Store.lock.remove()` and `Store.lock.set()` rewrite the whole notebook (`clear: true`) from this tab's rows in memory. A row another open tab saved after this tab loaded is not in that memory, so the rewrite drops it without a word. Seen in a Node probe: C:/Users/ruchi/1-addic-wt/_logs/scratch/core-kept-probe-20261115/B/run1.log:42-53 (this tab's 'tip breathe' row gone after the other tab removed the PIN). CORE reads it MEDIUM: the person's data, lost silently; it needs two open tabs and a PIN change.

## What the code does now
- The stale refusal compares only the lock row: every write carries `expect: state.lock` (store.js:395) and the backend refuses it when the stored lock row differs (store.js:117-121, :210). A plain row another tab saved changes no lock row, so nothing refuses the rewrite.
- `remove()` (store.js:795-806): when this tab is locked it reads the stored rows (`decode(await state.backend.readAll(), key)`, :801); when it is open it takes `state.rows` and `state.unread` from memory (:801), then `write({ clear: true, ... })` (:804). LOSSY (the open branch).
- `setLock()` (store.js:688-717): `const rows = state.rows` (:697, taken before the key is derived so that a lock meanwhile cannot empty it, RC1, RS2), then `write({ clear: true, ... })` (:707). LOSSY.
- `replaceAll()` (store.js:551-583): replaces every row by design (the comment at :551: an import never merges), so another tab's rows going is intended. Only its unread rows come from memory (`keep(next, state.unread)`, :571). Minor.
- `takeIn`, commits through `view().commit` (puts and dels, no clear), `resetAll`, `resync` and `unlock` do not rewrite from memory (the scout read each).

## WANT
1. `remove()`: read the stored rows in both branches: `decode(await state.backend.readAll(), key)` with the key in hand, and rewrite from those rows and their unread rows. Set `state.rows` and `state.unread` from them after the write, as now.
2. `setLock()`: after the key is derived and just before sealing, read the stored rows (`decode(await state.backend.readAll(), null)`: no PIN is set yet, so they are plain) and seal and rewrite those, not `state.rows`. Keep the RC1/RS2 guard's purpose: a lock in this tab while the key is derived must never lead to a clear write of an empty set (reading storage instead of memory meets it; say so in the comment). After the write, when the epoch is unchanged, set `state.rows` and `state.unread` from what was read.
3. `replaceAll()`: take the unread rows from storage, not `state.unread`, if it is a one-line change; otherwise leave it and say so in the hand-off.
4. The gap that stays: another tab's plain row landing between this read and this write can still be lost (the backend has no row version). A short code comment names it; no retry loop. A lock change in that gap is refused as now with the existing stale words.
5. No new words on any screen. The existing stale refusal stays as it is.

## Tests (offline/tests/store.test.mjs)
Two tabs: two `freshStore()` (store.test.mjs:2086) on one `fakeIndexedDB()` (:2094) set as `globalThis.indexedDB`, as the test at :1848 does; wait by condition with a deadline, never a fixed sleep.
- `FIX-REMOVE-STALE-ROWS: removing the PIN keeps a row another tab saved` (red on the current code)
- `FIX-REMOVE-STALE-ROWS: setting a PIN keeps a row another tab saved, sealed` (red on the current code)
- `FIX-REMOVE-STALE-ROWS: an import keeps another tab's unread row` (only with WANT 3; say whether it is red first)
- `FIX-REMOVE-STALE-ROWS: a lock changed between the read and the write is refused as stale` (a guard; it may be green already: say so)
Red first on the current code, logged under C:/Users/ruchi/1-addic-wt/_logs/reports/core/; then a mutant run (put `state.rows` back in each path: the tests go red). New count: store.test 154 + n, npm test 809 + n in 16 files (n = 4 if all land). tests-docs needs the counts by outbox at READY.

## KEEP
- Files: offline/src/store.js and offline/tests/store.test.mjs only. offline/1-addic.html is generated: never commit its rebuild.
- Every existing test name and its meaning; the RC18 epoch rule; keep()'s unread-rows rule (store.js:157-163); the lock and key rules; no network.
- One commit per change naming FIX-REMOVE-STALE-ROWS. Gates once each at the tip: build, store.test, the full Node suite, validate, guards, browser (the lock and PIN flows).
- Flagged: the check, then the two reviewers (contracts and tests; safety, privacy and the person's data).

## Open questions (defaults built)
- WANT 3 (replaceAll's unread rows): default: in, if it is one line.
- The gap of WANT 4: default: a code comment and a line in the lane report, no retry. A real fix (a row version in the backend) would be a later unit, by name.
