"""FIX-COUNTS-4 (tests-docs, docs only; CORE 18): the count lines from the HUB's numbers on the merged tree.
Usage: python fc4.py <node checks> <test files> <browser flows> <trunk sha>   (run with the worktree at the sha; it does not commit or rebuild the .docx)"""
import io, sys
WT = 'C:/Users/ruchi/1-addic-wt/tests-docs/'
N, F, B, SHA = sys.argv[1:5]
NEW = ['discreet start shows no emergency line while the app loads', 'finishing a lesson and a checkpoint says +10 XP once', 'lock page SOBER practice stays open, SOS still works, Done comes back']
EDITS = {
 'CLAUDE.md': [("Tests as of 2026-11-09 (FIX-COUNTS-3, recounted on the trunk dcabd906): `npm test` 743 checks in 16 files, 743 pass, 0 fail; `npm run test:browser` 29 flows, 29 pass, 0 skip",
                f"Tests as of 2026-11-09 (FIX-COUNTS-4, recounted on the trunk {SHA}): `npm test` {N} checks in {F} files, {N} pass, 0 fail; `npm run test:browser` {B} flows, {B} pass, 0 skip")],
 'README.md': [("`npm test` runs 743 checks in 16 files: 743 pass and 0 fail; `npm run test:browser` runs 29 named flows, and in one full run all 29 pass.",
                f"`npm test` runs {N} checks in {F} files: {N} pass and 0 fail; `npm run test:browser` runs {B} named flows, and in one full run all {B} pass.")],
 'offline/README.md': [("`npm test` runs 743 checks in 16 files,", f"`npm test` runs {N} checks in {F} files,"),
                       (": 743 passed and 0 failed. `npm run test:browser` runs the 29 named flows of `offline/tests/browser.test.mjs`; in one full run all 29 passed:",
                        f": {N} passed and 0 failed. `npm run test:browser` runs the {B} named flows of `offline/tests/browser.test.mjs`; in one full run all {B} passed:"),
                       ('"a quest-line step unlocks a feature". A test\'s name', '"a quest-line step unlocks a feature"; ' + '; '.join('"' + x + '"' for x in NEW) + ". A test's name")],
 'offline/docs/1-addic-Guide.md': [("Tested: 9 November 2026, 743 of 743 logic checks passed (Part 4); 29 of 29 browser checks passed", f"Tested: 9 November 2026, {N} of {N} logic checks passed (Part 4); {B} of {B} browser checks passed"),
                                   ("On 9 November 2026, **743 of 743** logic checks passed, in 16 test files.", f"On 9 November 2026, **{N} of {N}** logic checks passed, in {F} test files."),
                                   ("On 9 November 2026 there were **29** of them. In one full run **all 29 passed**.", f"On 9 November 2026 there were **{B}** of them. In one full run **all {B} passed**.")],
}
for f, pairs in EDITS.items():
    s = io.open(WT + f, encoding='utf-8', newline='').read()
    for a, b in pairs:
        if s.count(a) != 1:
            sys.exit(f'{f}: expected one occurrence, found {s.count(a)}: {a[:70]}')
        s = s.replace(a, b)
    io.open(WT + f, 'w', encoding='utf-8', newline='').write(s)
    print('ok', f)
