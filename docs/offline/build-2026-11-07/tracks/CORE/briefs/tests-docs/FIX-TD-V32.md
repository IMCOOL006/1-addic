# FIX-TD-V32 (tests-docs; offline-v3.2 by the HUB's order, R-H-53; not flagged)

Five items, one commit each, the item's id in the message. Three new browser flows, one screenshot retake, one hook. Only offline/tests/browser.test.mjs, offline/tests/helpers/*, offline/docs/images/sos-craving-*.png and offline/docs/1-addic-Guide.docx. Nothing under offline/src. Test names are failure identities: use the three names below exactly. If a flow finds a real defect in another lane's file, do not fix it and do not weaken the flow: stop that item and put the file, the line and what you saw in your note.

Not in this batch: the count lines and the README's list of flow names. FIX-COUNTS-4 does those once from the merged tree's numbers, before any offline-v3.2 tag.

Every hook a flow drives goes in offline/tests/helpers/hooks.mjs with its file:line comment. Flows use F.need and F.waitFor (wait by condition, no fixed sleeps). The harness fails on any console error or non-file request, so a probe you add must make neither.

## T1 ES1 paint: 'discreet start shows no emergency line while the app loads'

core's ES1 (bf9b83c, styles.css) is `html[data-discreet] .boot-line { display: none }`. It has never been painted in a browser. The line lives in <main> at shell.html:26 and is gone once boot draws. In one flow, by page.addInitScript and a reload for each case:

- A MutationObserver installed before any page script samples getComputedStyle(document.querySelector('.boot-line')).display on each DOM change until the line is gone, into a window field of the probe's own.
- With localStorage '1-addic:discreet' = '1': at least one sample, and every sample is 'none'.
- Without the flag (the control): at least one sample is not 'none', so the flow cannot pass by never sampling.

Prove it: remove the CSS rule in a copy of the built file outside the worktree, and the flow goes red there. Hook: `bootLine: '.boot-line'` (a class, no hook attribute: say so in the comment).

## T2 V-20's toasts: 'finishing a lesson and a checkpoint says +10 XP once'

No browser flow drives the checkpoint, so V-20's toasts have never been seen (ui-learn.js:543 and :619; the rule is in lane_args_v3.json lanes.learn.unitNotes["V-20"]). Routes ['lesson' or 'learn' as registered], globals Store, Actions.completeLesson, Actions.checkpoint. Reuse the harness's seeding helpers.

- Open a lesson of the first module, go to the wrap (`lesson-next` until `lesson-finish` shows), finish: the toast reads 'Lesson done. +10 XP'.
- Open '#/learn/<module>?checkpoint=1', answer (`checkpoint-q-<n>`), `checkpoint-finish`: the toast reads 'Checkpoint saved. +10 XP'.
- Open it again and finish: the toast reads 'Checkpoint saved.' with no XP (a CheckpointCompleted earns once per module, ui-learn.js:615).

Assert the text of the toast shown, not only the events. If the first module's checkpoint needs its lessons done, seed them by Actions, not by clicking through all of them. If calm mode or the seed changes the words, read the code and follow it.

## T3 lock-sober: 'lock page SOBER practice stays open, SOS still works, Done comes back'

No browser flow opens the practice on the lock page (ui-onboarding.js:270-275, hook data-testid lock-sober). PIN set, lock, then:

- Tap lock-sober: the practice's heading shows, #sos-btn is visible, the route's path begins '#/sos/craving'. Match the path, not the whole hash: actions-sos is changing the hold to '#/sos/craving?from=lock' in this same release.
- Tap #sos-btn: the SOS page opens at once and the practice gives way.
- Lock again, open the practice, Done: back on the lock page with a usable PIN field and #sos-btn visible; the right PIN then opens Today.
- Lock again, open the practice, submit the right PIN from the form while the practice is open: the practice stays open (the route stays on the craving path), and Done then goes to Today.

Use the lock helpers the 'PIN set lock unlock export' flow uses (F.TEST_PIN, F.unlockWith, browser.test.mjs lockSet). Where the practice has steps, Done is what the flow needs; read UI.sosSoberView.

## T4 the sos-craving retake

offline/docs/images/sos-craving-phone.png predates V-SOS10 and shows the rating '10' on two lines. Run a fresh build, then `ADDIC_SHOTS=sos-craving npm run screens`. Look at the new phone image (the Read tool shows it): '10' on one line, at 390 px. Commit the slug's PNGs that changed, by path. The guide embeds it (1-addic-Guide.md:223): rebuild the .docx with `python offline/docs/build_guide.py`, 0 images missing, and commit it. Keep any other image unchanged: if the run rewrites another file, restore that file.

## T5 the hook lock-opening

ui-onboarding.js:241 has p#lock-opening with data-testid lock-opening (V-25); hooks.mjs does not name it. Add `lockOpening: tid('lock-opening')`, and read it in T3: the polite line is on the lock page, empty before a try, empty again after it.

## The gates and the hand-off

build, test, validate, guards, the full browser suite in one run (the 29 existing flows must stay green by name, plus the three new: 32), docs, territory with --wt the worktree. offline/1-addic.html is generated: never commit its rebuild. One browser or screens run at a time. In the hand-off: each id with its sha, how T1 was proven, the browser log's path, what the phone image shows. Say so if any flow skipped.
