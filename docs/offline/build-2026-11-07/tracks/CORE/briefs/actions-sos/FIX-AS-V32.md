# FIX-AS-V32 (actions-sos, flagged; offline-v3.2 by the HUB's order, R-H-53)

Five items in one batch, one commit each, the item's id in the message. Only offline/src/actions.js, offline/src/ui-onboarding.js, offline/src/ui-sos.js and offline/tests/actions.test.mjs. No clinical copy, no new public name, no new event, no other lane's file. RS1 (FIX-STALE-SAVE-SAY) is core's and not in this batch. Each test below is proven red before its change, or by the named mutation (say how); run mutations on a copy outside the worktree, never leave one in it.

The line numbers are at a397a8d, the lane's last tip; read the code before you trust them.

## ES3T: the V-17b test (the point of this batch)

core's FIX-IMPORT-MARK, on the trunk now, makes an import with a PIN set move Store.status().lockId (it re-seals the lock row's check with a fresh IV). So the kept SOS save that ES3 said slipped into another tab's imported notebook must now be dropped, and told once.

Port from the safety reviewer's probe, C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/end-review/tree-safety/offline/tests/actions.test.mjs, lines 4009-4161: the describe 'PROBE-TABS V-17b on two real stores' with its helpers (freshStore, fakeIndexedDB, twoTabs, keep, actionsOn, until, count). Two real Stores over one fake IndexedDB. Do not copy the whole probe suite: the helpers and two tests.

- The import test, named 'V-17b: a kept save is dropped, and told once, when another tab imports a backup with the PIN kept (two real stores)'. Tab A locked with a kept save; tab B unlocked imports with the PIN kept; A unlocks with the same PIN. The probe's assertion of the old behaviour is reversed: the mark moves (assert.notEqual on lockId before and after, read on T2, and on T1 once it resyncs), written stays [], COPY.keptLost is shown exactly once.
- The control, named 'V-17b: a kept save is written once after the unlock when no other tab changed the notebook (two real stores)', so the import test cannot pass by dropping everything.

Prove the import test red by running it against offline/src/store.js from 0dd50197 (before FIX-IMPORT-MARK): `git show 0dd50197:offline/src/store.js` into a temp copy of the tree outside the worktree. The control must stay green there.

Then correct the two comments, comment only, no code in ui-sos.js: :466-471 ('The one case nothing here can see (ES3)...') and :484 ('the one case it cannot see: ES3'). They say what is true now: another tab's import with a PIN set re-seals the check, so the mark moves and the save is dropped.

## EC3 (LOW, V-08a)

offline/src/actions.js:262: the USE_VERB message lists the verbs to use and omits useSkill, the only verb for a skill used with no log. Add it. :279 says useSkill, 'unlike every other verb', never throws; V-41's verbs (:831) also return {ok: false, code, message}. Reword it to what is true. One line added to the USEVERB test (actions.test.mjs:1789) that the SkillUsed refusal's message names useSkill; fails without the message change.

## ES2 (LOW, V-25)

offline/src/ui-onboarding.js:250, the form's submit: after a wrong PIN, the next try keeps 'That PIN did not match.' on screen while 'Opening your notebook' shows, for the whole key time. Before the attempt set msg.hidden = true and msg.textContent = '' (the PIN field's aria-describedby points at msg, so empty it too). A wrong PIN writes it again as before. Named test in the V-25 describe, following the wrong-PIN test at :3646: 'ES2: a retry takes the old PIN message away while the new try runs'. Wrong PIN, message shown; a second submit with the Store's unlock waiting: the message is hidden and empty and the line says Opening your notebook; a second wrong PIN shows the message again. Red without the change.

## EF1 (LOW, test only; no source change)

The router tests cannot see the discreet flag: routerApp (actions.test.mjs:3761) has a localStorage.getItem that always returns null, and class E has no hasAttribute, so isDiscreet() is always false there. Give routerApp a discreet option (getItem returns '1' for '1-addic:discreet'; setItem and removeItem recorded) and add 'ESR2: Done on a discreet lock page keeps the discreet chrome and the device flag (the real router)', beside ESR2 at :3898: after Done, #app-name is 'Notebook', #sos-btn is 'Help', the flag was not removed. It must fail with applyDiscreet(false) at ui-onboarding.js:253; the existing tests must stay green with the new option off.

## SF1 (LOW)

offline/src/ui-onboarding.js:273 holds the practice on L.sober.href ('#/sos/craving'). A person who finished the craving flow (a real #/sos/craving entry, then Finish to the lock page) and opens the SOBER practice has two adjacent history entries with the same hash, so the first Back fires no hashchange and nothing happens.

Hold on a URL no other entry can have: L.sober.href + '?from=lock'. Keep ESR1's rule: never #/sos, the header SOS button's target. parseSos (ui-sos.js:230) ignores other query keys, so a reload still lands in the craving flow; check that with a test, not by reading. Grep for every reader of the held route before you change it (ui-core.js:572 compares location.hash; the comment at ui-onboarding.js:247 describes the hold). Do not change L.sober.href itself: it is also the link's href when the view function is missing (:276) and the SOS routes in engine.js are fixed.

Update ESR1's last assertion (:3895). Named test: 'SF1: the practice on the lock page is held on a hash no other history entry has, so the first Back works (the real router)', modelling the browser's same-hash rule as ESR1's follow() does. Regressions to keep green by name: ESR1 (the header button opens SOS at once), EC1 (the key arriving leaves the practice open), ESR2 (Done). In real Chrome at 390 px if you can, with one browser run at a time: the craving flow to Finish on a locked notebook, the practice, Back once.

## The gates and the hand-off

build, test (actions.test.mjs), validate, guards, browser --grep SOS and --grep lock on a fresh build, territory with --wt the worktree. offline/1-addic.html is generated: never commit its rebuild. In the hand-off: each id with its sha and how its test was proven, and the full-suite count if you ran it.
