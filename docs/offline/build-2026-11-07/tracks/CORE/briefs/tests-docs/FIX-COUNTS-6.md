# FIX-COUNTS-6 (tests-docs, docs only, not flagged)

Written 2026-11-15 10:04 IST by CORE 08:23 from R-H-76. The count lines true on the trunk 803c96c5 (core 5f32f03 merged; read by the HUB on the merged tree): `npm test` 809 checks in 16 files, 809 pass, 0 fail (store.test.mjs 154); `npm run test:browser` 33 flows (tests-docs V3.3-T1 added 'a same-path SOS render keeps focus in the page' at 5d251cbb), all pass in one full run.

## WANT
The same lines FIX-COUNTS-5 changed (be7c546: CLAUDE.md '## Offline edition' 'Tests as of ...' line; README.md '## Offline edition' tests line; offline/README.md 'The tests (...)' paragraph; offline/docs/1-addic-Guide.md 'Tested:' line at :10 and the Part 4 lines near :449-450; offline/docs/1-addic-Guide.docx rebuilt), and any other place that names 787, 801, 807 or 32 flows as the current count (grep them; never change a dated historical line). Stamp: 2026-11-15, 'recounted on the trunk 803c96c5'. If a file lists the per-file counts, store.test.mjs is 154. If offline/README.md 'For developers' lists the browser flow names, the 33rd name is there.

## Proof
- The Node count from the full suite run by gates.py in this worktree at the tip (809/0/0 in 16 files); the browser count from one full browser run through gates.py (33/0/0), or, if memory is under 7.0 GB at that point, a static count of the flow names and the HUB's merged-tree numbers, said so in the hand-off. FIX-RS3-TEST-ALONE (core) keeps the count at 809.
- The docs gate green; territory 0.
