<!-- written 2026-11-15 by CORE 13:03 from wf_e0e35035-0ba (read-only scout, two verifiers: code truth; fix and tests; a reviser) -->
# FIX-DRAWN-WRITE-SAY (core): Store.commit takes { auto: true }

R-H-83, slot 1. Lines are offline/ at 9f233b1 (= bf74180c, per afe79d7). Files: store.js, tests/store.test.mjs.

## The finding (confirmed)
- C1 store.js:434 `commit(label, fn)`; its save `write({ clear: false, puts, dels })` (:478) passes no auto.
- C2 `write(w, auto)` :393-401: STALE gives `resync(!auto)` (:398), then LOCKED with `stale: true`. Only takeIn passes auto (:746).
- C3 `resync(saveRefused)` :760-773 flags onLock (:772) or, with no lock stored, the 'unlock' notice (:773).
- C4 ui-core.js:953-956, :1094-1100: a flag calls sayStale (:184-192, the toast and #kept); 'lock', 'unlock' and 'bulk' never clear #kept (:955).
- C5 The drawn writes: ui-today.js:472-474 (`tip <id>`, tipCard during render :656); ui-guidance.js:678 (`reveal <id>` seen) and :547 (`event ExplorerCompleted`), both from afterRender (:680). :484 is a 'Got it' tap on GuidanceUI.tipCard, which no page draws (today-track.test.mjs:740).
- C10 An erase is refused here only if this tab had a PIN: erase has no expect (:274), and lockId is '' on both sides otherwise (:121).

## WANT
1. `function commit(label, fn, opts)`, first line `const auto = !!opts && opts.auto === true;` (anything else is plain; never throw on it).
2. :478: `await write({ clear: false, puts, dels }, auto);`
3. The error stays LOCKED with `stale: true`, as takeIn's does (core.md:160).
4. Comments: at :390-392, add commit's { auto: true } (a write a page makes as it is drawn). Keep "Its error reaches no page" (lock.set()/unlock() and the pages' catches, ui-today.js:474, ui-guidance.js:25). :400: "for the person's own write".
5. No new words on any screen.

## After the fix (for the hand-off, and a core.md section that overrides :29)
- Lock stored (a PIN set or changed, a backup brought back with a lock): onLock `{ reason: 'auto' }`, notice `{ label: 'lock' }`, then #/lock with no words. Unsaved text on that page goes, as with an auto-lock (:642).
- No lock stored (PIN removed, notebook erased): notice `{ label: 'unlock' }`. The page stays, redrawn from storage (empty after an erase).
- bulk() holds no flag (:425), and it has no caller (core.md:161).
- C11 Gap, accepted LOW: a person's commit queued (:385-388) behind a refused auto commit, with a lock stored, fails at :437 ('The data is locked.', no flag). The stale line no longer covers it. Same window as an auto-lock. Write a comment in commit and a core.md line; no code.

## KEEP
Every other path, the epoch rule, the stale words; a two-argument commit works as now. Never commit offline/1-addic.html; one commit per change naming the unit; gates once each at the tip; existing test names keep their meaning.

## Tests (store.test.mjs, in describe 'store (U-04)' :2176-3632, after FIX-REMOVE-STALE-ROWS)
pinned() :2718, addRows :2182, IMPORT_PIN and IMPORT :2714-2715; model on FIX-STALE-SAVE-SAY (a) :2985-3015. Every step is awaited: no sleep. The fn stages a row (else :469 returns first): `(d) => { d.put('tips', { id: 't1', shownAt: '2026-11-15T09:00:00.000Z' }); }`, label 'tip t1'.
- (a) loop of 4: `'FIX-DRAWN-WRITE-SAY (a): another tab ' + how + ': an automatic commit refused here says nothing as stale'`, how = 'removes the PIN', 'erases the notebook', 'brings back a backup, a lock still stored', 'changes the PIN' (S.lock.set('1357')). pinned(); A = freshStore(), load, unlock(IMPORT_PIN); capture heard and notes; change(S); A commits with { auto: true }. Expect LOCKED, stale true. No lock: heard [], notes [{ label: 'unlock' }], open, no t1. Lock: heard [{ reason: 'auto' }], notes [{ label: 'lock' }], locked. Red now.
- (b) `FIX-DRAWN-WRITE-SAY (b): another tab sets a PIN where there was none: an automatic commit refused here says nothing as stale`: A loads, addRows; B loads, lock.set('2468', { autoLockMin: 'never' }); heard [{ reason: 'auto' }], notes [{ label: 'lock' }]. Red now.
- (c) `FIX-DRAWN-WRITE-SAY (c): a refused commit whose options are not { auto: true } still says stale`: (a)'s PIN change with { auto: 'yes' }; heard [{ reason: 'auto', stale: true }]. Guard.
- (d) `FIX-DRAWN-WRITE-SAY (d): an automatic commit that goes through saves and notifies as a plain one does`: fn's value, t1 in view and stored, notes [{ label: 'tip t1' }]. Guard.
Plain refusals already have guards: FIX-TAKEIN-SAY (c) :3134-3146 and FIX-STALE-SAVE-SAY (a).
n = 7: store.test 159 (outbox-CORE.md:660) + 7 = 166; npm test 814 + 7 = 821 in 16 files (afe79d7; not recounted). Logs: C:/Users/ruchi/1-addic-wt/_logs/reports/core/.

## Mutants
M1 no auto at :478: (a) and (b) red. M2 auto always true: (c), FIX-TAKEIN-SAY (c), FIX-STALE-SAVE-SAY (a). M3 `!!opts`: (c). M4 `resync(true)` at :398: (a), (b).

## Questions (default)
- Q1 tutorial.replay (ui-guidance.js:408, from afterRender :686-687): plain, since it follows a link tap (actions-sos decides).
- Q2 Accept a boolean as opts? No.
- Q3 The C11 gap: accept it; a comment only.
- Q4 A screen proof in the e2e describe (:3796)? Not needed.

Verified: C1 C2 C3 C4 C6 C7 | Corrected: C5, C8, C9, C6 wording, KEEP view().commit, test lines | Added: C10 erase and PIN-set cases, C11 gap, strictness test, :400 comment, counts
