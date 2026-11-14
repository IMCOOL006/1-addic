# FIX-TAKEIN-SAY

FIX-TAKEIN-SAY (core, flagged; offline-v3.4 batch with FIX-STALE-SAVE-KEEP and FIX-BULK-REFUSAL-SAY; R-H-61 (2), a LOW; merge base: the trunk tip at the start, BASE e167f71a).

TODAY. takeIn(key) (offline/src/store.js:710-734) seals the rows of a localStorage snapshot this device lacks into IndexedDB. It runs after lock.set (:702) and unlock (:772), inside run(). Its one write is :729, only when puts is not empty. The person did nothing.
write() (:390-403) adds expect: state.lock. If another tab changed the lock after the decode, the IDB backend refuses with STALE (store.js:266-272, not the :210 fallback). write() runs resync(true) (:395) and throws LOCKED with stale: true (:396-397). resync(true) (:743-757) calls onLock { reason: 'auto', stale: true } for an open tab (:755), or notify('unlock', { stale: true }) when no lock is stored (:756). ui-core then says 'This notebook changed in another tab, so your last change was not saved.' (ui-core.js:172-173, :1058, :920), outside SOS. False: nothing of the person's was lost. takeIn's error is swallowed (:772 catch), the snapshot stays (:732-733 not reached), the next unlock retries.
After the caught refusal unlock() still runs notify('unlock') (:773) and returns true (:774). So a subscriber hears two notices: resync's, then { label: 'unlock' }. In the UI the lock page sees ok true, calls go('#/today') (ui-core.js:818), and the route guard sends it back to #/lock (:860).

KEEP. The refusal and the resync (do not skip it). A person's own save keeps its one toast (stale on the error and on onLock). SOS never pulled (ui-core.js:1055). The snapshot stays when takeIn fails. Locked tabs hear nothing (RC1).

WANT.
1. store.js write(w, auto): second argument, false by default. In the STALE branch: await resync(!auto); set f.stale = true only when !auto. An automatic refusal sends onLock { reason: 'auto' } and a notice with no stale flag.
2. takeIn passes true at :729.
3. Other write() callers keep the default: commit (:474), replaceAll (:566), lock.set (:698), remove (:795). resetAll bypasses write(): state.backend.erase() (:582; :274 has no expect), so it never goes STALE.
4. No new words; ui-core.js unchanged.

TESTS (store.test.mjs; names start 'FIX-TAKEIN-SAY'; each red before). A NEW HOOK IS NEEDED: fakeIndexedDB (:1835-1895) has only open, deleteDatabase, rows, storeNames, dump, failOpen, failWrites, opened, writes; no readAll, no hook, and transaction() (:1844) is synchronous. Add a once-hook to the fake's transaction(): on the first readwrite whose ops include a put that is not the lock row, synchronously replace the stored meta 'lock' row (a row taken earlier from a B.lock.set, or removed for (d)) before the ops run. Alternative: wrap localStorage.getItem, which takeIn reads at :712-713 after the decode; it needs the same synchronous swap.
(a) '(a): a takeIn write refused because another tab changed the lock says nothing as stale': snapshot in a fake localStorage with a row the device lacks (as store.test.mjs:2358-2377), A unlocking; the hook swaps in B's new lock row. A's unlock resolves without throwing; onLock hears exactly [{ reason: 'auto' }]; the subscriber hears exactly [{ label: 'lock' }, { label: 'unlock' }] (resync's, then the trailing notify('unlock') of :773, which says unlock while the tab is locked). Red before: onLock gives stale: true.
(b) '(b): the snapshot stays after that refusal and the next unlock takes it in': unlock with the new PIN seals the row in and removes the snapshot.
(c) '(c): a person's own save refused the same way still carries stale': commit in an open tab after B's change: error.stale true, onLock { reason: 'auto', stale: true }. Green before; red on the mutant making every write automatic.
(d) '(d): with no lock stored any more, a refused takeIn sends the notices without stale': hook removes the lock row; the subscriber hears exactly [{ label: 'unlock' }, { label: 'unlock' }], neither with stale.
FIX-STALE-SAVE-SAY (a) and (e2e) stay green.

DONE WHEN. npm run build; npm test with the new names; baselined guard names unchanged; browser lock, SOS and PIN flows green on the merged tree; both reviewers (flagged) find nothing open at HIGH or MEDIUM.

OUT OF SCOPE. How takeIn picks rows; retrying inside the same unlock; another line for the automatic case; any page file.

OWNER QUESTIONS.
1. Say nothing for an automatic refusal (default), or a true line such as 'Your notebook changed in another tab.'? Default: nothing. Consequence: someone who enters a correct PIN in this race lands back on the lock page silently, PIN field cleared (ok true, then the guard).
2. Wording of the person's own toast: no change (default).
Interaction: FIX-STALE-SAVE-KEEP keeps the stale line from the same flag; the automatic path carries none. FIX-BULK-REFUSAL-SAY edits notify(): build the three in one batch; run (c) after both.
