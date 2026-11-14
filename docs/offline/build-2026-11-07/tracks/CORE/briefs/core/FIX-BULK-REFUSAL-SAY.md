# FIX-BULK-REFUSAL-SAY

FIX-BULK-REFUSAL-SAY (core, flagged; offline-v3.4 batch with FIX-STALE-SAVE-KEEP and FIX-TAKEIN-SAY; R-H-61 (1), a LOW; merge base: the trunk tip at the start, BASE e167f71a).

TODAY. The HUB's premise is only half true, and this change is defensive: it changes nothing a person sees today, because bulk() has no caller in offline/src.
- Store.bulk() (offline/src/store.js:487-495) refuses nothing; it counts (state.bulk) and sends one 'bulk' notice at the end. Callers (grep 'bulk('): store.test.mjs:1978 and a stand-in at actions.test.mjs:788 only. Load sample data does not use it: Actions.loadSample (actions.js:1050-1076) makes one Store.commit through Actions.write (:113-116).
- That commit goes to write() (store.js:390-403). On STALE it runs resync(true) and throws LOCKED with stale: true. A refused sample load, with or without a lock stored, already reaches heard() through onLock (:755) or resync's notify (:756), and ui-core says the one toast (ui-core.js:920, :1058) and hushes a second warn toast (:172-176).
- The code hole, inside bulk() only: with no lock stored, notify() (:420-423) returns early while state.bulk > 0 and sets only dirty, so the stale flag from :756 is lost; the flush at :493 sends 'bulk' with no stale, and heard() (ui-core.js:919-921) says nothing. With a lock stored, onLock is called directly and is fine.
- ui-settings.js:569 says say('data', errorText(e), 'warn'); errorText gives 'The notebook is locked. Unlock it first.' for LOCKED (:130); say() (:155) is an inline flash, not hushed. With no lock stored that line is false. That file is SCREENS' (not ours). ui-onboarding.js:325 is a hushed toast, fine.

KEEP. The refusal; no retry; write()'s flag and onLock event; SOS never pulled (ui-core.js:1055, :920); the 'bulk' label and one notice per bulk; a notice with no refusal carries no flag.

WANT.
1. store.js notify(): while bulk is open and more && more.stale, set state.dirtyStale = true (add to state, :28); the flush in bulk()'s finally calls notify('bulk', stale ? { stale: true } : null) and clears it. Nothing else changes.
2. bulk() adds no new refusal or event; ui-core.js unchanged (heard() already reads n.stale).
3. The inline page line is an outbox ask to SCREENS (errorText returns '' or the stale words when e.stale). Default: no change.

TESTS (store.test.mjs; names start 'FIX-BULK-REFUSAL-SAY'):
(a) '(a): a commit refused inside bulk with no lock stored any more still sends the stale notice once': stores A and B over one fake IndexedDB; B removes the PIN; in A, S.bulk(async () => commit) rejects LOCKED with stale true; the subscriber hears one { label: 'bulk', stale: true }. Red before: { label: 'bulk' }; or the mutant dropping dirtyStale.
(b) Name it as a bulk-wrapped variant of store.test.mjs:2723-2748 ('brings back a backup, a lock still stored'), which already pins the case outside bulk: with a lock stored, onLock { reason: 'auto', stale: true } once and error.stale true. Green before; red if write()'s resync(true) or f.stale is removed. Drop it if the builder judges it duplicate.
(c) '(c): a bulk with no refusal sends one notice with no stale': a later bulk after a refused one hears no stale (the flag does not stick).
(d) ui-core: heard({ label: 'bulk', stale: true }) on a non-SOS route puts one toast, on '#/sos/craving' none (may exist near store.test.mjs:942-957: name it, do not duplicate).

DONE WHEN. npm run build; npm test (all files, counts as in CLAUDE.md plus the new names); baselined guard names unchanged; browser lock, SOS and PIN flows green on the merged tree. Two reviewers (flagged).

OUT OF SCOPE. A new bulk refusal; a sample-load retry; editing ui-settings.js or ui-onboarding.js; changing the words.

OWNER QUESTIONS.
1. Inline line on Settings > Your data after a refused sample load: leave (default) or ask SCREENS for the stale words?
2. Wording: the existing 'This notebook changed in another tab, so your last change was not saved.' is true here. Default: no change.
Interaction: FIX-STALE-SAVE-KEEP touches the lock page, not the notice path. FIX-TAKEIN-SAY edits write() too: merge in one pass.
