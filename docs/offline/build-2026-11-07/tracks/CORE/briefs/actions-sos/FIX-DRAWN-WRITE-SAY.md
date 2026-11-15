<!-- written 2026-11-15 by CORE 13:03 from wf_e0e35035-0ba (read-only scout, two verifiers: code truth; fix and tests; a reviser) -->
# FIX-DRAWN-WRITE-SAY (actions-sos): { auto: true } on the drawn writes

Lines at 9f233b1. Files: offline/src/actions.js, tests/actions.test.mjs.

## The code
- C6 `write(label, at, fn)` (actions.js:113-138) calls `S.commit(label, cb)` (:116). Every verb uses it except importBackup and eraseAll (S.replaceAll :1033, S.resetAll :1041).
- C7 reveal :925-940 (opts seen and forced, :930); markTipShown :941-949; recordEvent :261-275, label `event ${type}` (:271).
- C8 Drawn writes: markTipShown from Today's tipCard (ui-today.js:474); reveal { seen: true } (ui-guidance.js:678) and ExplorerCompleted (:547), both from afterRender. Taps stay plain: MilestoneSeen (ui-today.js:502), tutorial.done (ui-guidance.js:374), Show now { forced: true } (:565). GuidanceUI.tipCard's 'Got it' (:484) also marks a tip, but no page draws that card.

## WANT
1. `write(label, at, fn, auto)`: `if (auto === true) await S.commit(label, cb, { auto: true }); else await S.commit(label, cb);`
2. markTipShown: always auto. A 'Got it' tap is silent too; that is accepted, since nothing typed is in it. Say so in a comment.
3. reveal: auto when `o.seen === true && o.forced !== true`.
4. recordEvent: auto only for 'ExplorerCompleted' (it is logged as a page is drawn; add a comment).
5. No change to any signature, to ui-*.js or to any words.
6. Either merge order is safe: commit(label, fn) ignores a third argument.

## After the fix
A refused drawn write is silent and is not tried again this session, because its guard is set first (ui-today.js:473, ui-guidance.js:546, :678). ExplorerCompleted waits until a reload. Nothing typed is lost.

## Tests (actions.test.mjs, exact names)
Use a recording Store, inline, put back in finally (the wrapper at :652-653 drops a third argument): `Object.assign(Object.create(real), { commit(label, fn, ...rest) { calls.push([label, rest.length, rest[0]]); return real.commit(label, fn, ...rest); } })`.
- `FIX-DRAWN-WRITE-SAY: markTipShown commits with { auto: true }` (red now)
- `FIX-DRAWN-WRITE-SAY: reveal with seen commits with { auto: true }, with forced it does not` (red now)
- `FIX-DRAWN-WRITE-SAY: recordEvent ExplorerCompleted commits with { auto: true }, MilestoneSeen does not` (red now)
- `FIX-DRAWN-WRITE-SAY: a person's own write passes commit two arguments` (guard: completeLesson, rest.length 0)
- Once core is merged (it holds slot 1): `FIX-DRAWN-WRITE-SAY: a tip marked after another tab removed the PIN says nothing as stale (two real stores)`, in describe 'V-17b on two real stores (ES3T)' (:4326-4441). twoTabs() (:4387); T1.lock.remove('2468'); globalThis.Store = T2 (Store is read at call time, actions.js:13), put back in finally. markTipShown('breathe') rejects LOCKED; T2's notes deepStrictEqual [{ label: 'unlock' }]. Red on the merged core without this unit.
Count +5 (+4 if core is not in yet; the HUB then names who adds the fifth): npm test 821 + 5 = 826. Logs: C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/.

## Mutants
No auto in markTipShown: test 1 red. Reveal auto when forced: 2. Every recordEvent auto, or none for ExplorerCompleted: 3. write() auto by default: 2, 3 and 4.

## KEEP
Existing test names and the stand-ins (:653, :768, :3113). One commit per change naming FIX-DRAWN-WRITE-SAY; gates once each at the tip; never commit offline/1-addic.html. Contract: one line in tracks/CORE/contracts/actions-sos.md naming the three verbs.

## Questions (default)
- Q1 Is reveal { seen: true } a drawn write? Yes.
- Q2 tutorial.replay (ui-guidance.js:408, reached from afterRender :686-687 after a link tap or a reload): plain.
- Q3 Is 'Got it' covered by markTipShown's auto? Yes.
