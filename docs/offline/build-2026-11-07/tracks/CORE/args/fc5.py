"""FIX-COUNTS-5 (tests-docs, docs only; CORE 12:02, 2026-11-14): the count lines from the HUB's numbers on the merged tree.
Usage: python fc5.py <node checks> <test files> <browser flows> <trunk sha> [--dry <copy dir>]
Run with the worktree at the trunk tip; it does not commit or rebuild the .docx. Each replacement must apply exactly once."""
import io, sys
WT = 'C:/Users/ruchi/1-addic-wt/tests-docs/'
N, F, B, SHA = sys.argv[1:5]
ROOT = sys.argv[6].rstrip('/') + '/' if len(sys.argv) > 6 and sys.argv[5] == '--dry' else WT
D_NEW = '14 November 2026'
EDITS = {
 'CLAUDE.md': [
  ("Tests as of 2026-11-09 (FIX-COUNTS-4, recounted on the trunk aac18546): `npm test` 763 checks in 16 files, 763 pass, 0 fail; `npm run test:browser` 32 flows, 32 pass, 0 skip",
   f"Tests as of 2026-11-14 (FIX-COUNTS-5, recounted on the trunk {SHA}): `npm test` {N} checks in {F} files, {N} pass, 0 fail; `npm run test:browser` {B} flows, {B} pass, 0 skip")],
 'README.md': [
  ("- Tests (9 November 2026): `npm test` runs 763 checks in 16 files: 763 pass and 0 fail; `npm run test:browser` runs 32 named flows, and in one full run all 32 pass.",
   f"- Tests ({D_NEW}): `npm test` runs {N} checks in {F} files: {N} pass and 0 fail; `npm run test:browser` runs {B} named flows, and in one full run all {B} pass.")],
 'offline/README.md': [
  ("**The tests (9 November 2026).** `npm test` runs 763 checks in 16 files,", f"**The tests ({D_NEW}).** `npm test` runs {N} checks in {F} files,"),
  (": 763 passed and 0 failed. `npm run test:browser` runs the 32 named flows of `offline/tests/browser.test.mjs`; in one full run all 32 passed",
   f": {N} passed and 0 failed. `npm run test:browser` runs the {B} named flows of `offline/tests/browser.test.mjs`; in one full run all {B} passed")],
 'offline/docs/1-addic-Guide.md': [
  ("Tested: 9 November 2026, 763 of 763 logic checks passed (Part 4); 32 of 32 browser checks passed (Part 4)",
   f"Tested: {D_NEW}, {N} of {N} logic checks passed (Part 4); {B} of {B} browser checks passed (Part 4)"),
  ("On 9 November 2026, **763 of 763** logic checks passed, in 16 test files.", f"On {D_NEW}, **{N} of {N}** logic checks passed, in {F} test files."),
  ("On 9 November 2026 there were **32** of them. In one full run **all 32 passed**.", f"On {D_NEW} there were **{B}** of them. In one full run **all {B} passed**.")],
}
bad = 0
for f, pairs in EDITS.items():
    p = ROOT + f
    t = io.open(p, encoding='utf-8', newline='').read()
    for old, new in pairs:
        n = t.count(old)
        if n != 1:
            print('NOT ONCE', f, n, old[:70]); bad += 1; continue
        t = t.replace(old, new)
    io.open(p, 'w', encoding='utf-8', newline='').write(t)
    print('ok', f)
for f in EDITS:
    t = io.open(ROOT + f, encoding='utf-8').read()
    if '763' in t: print('LEFT 763', f); bad += 1
sys.exit(1 if bad else 0)
