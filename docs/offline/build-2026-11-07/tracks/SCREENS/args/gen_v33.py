"""Usage: python gen_v33.py content <trunk tip> "<now>"
Writes tracks/SCREENS/args/v33_content.json for offline-v3.3 (R-H-58 on R-O-11, SCREENS 12:02): content V-10b under the
owner's I6 default (V-Q7: no number confirmed) and LOW C1 at content.test.mjs:381. base = diffFrom = the trunk tip at the start."""
import json, sys
D = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/'
SESSION = 'https://claude.ai/code/session_0bd68904-7c0c-4ab7-9809-fdcda30d3dba'
lane, tip, now = sys.argv[1:4]
if lane != 'content':
    sys.exit('content only')
a = dict(json.load(open(D + 'tracks/SCREENS/args/v3_content_t2.json', encoding='utf-8')))
U1, U2 = 'V-10b', 'C1-381'
a.update(area="The India crisis numbers under the owner's I6 default (no flag cleared, none changed), pinned by a test; one redundant assert removed.",
         tier=1, units=[U1, U2], batches=[[U1, U2]], unitTier={U1: 1, U2: 2},
         files=['offline/src/content-core.js', 'offline/tests/content.test.mjs'],
         done=['U-31a', 'U-31b', 'U-29', 'U-30', 'U-32', 'U-33', 'V-10', 'V-10r', 'V-42', 'C1', 'V-23', 'FIX-MARKERS'], slot=4,
         brief=D + 'tracks/SCREENS/briefs/content-v3.md', contract=D + 'tracks/SCREENS/contracts/content-v3.md')
a['unitNotes'] = {
    U1: ("The India crisis numbers under the owner's default: R-O-11 (2026-11-14) takes the default for every unanswered question; "
         "V-Q7's default is 'none cleared; every number keeps please verify' (PLAN-V3.md:105; R-H-58). No owner line confirms a number. So no verify flag is cleared, "
         "and no name, number, alt, tel, url, note or verifyNote changes in content-core.js resources (:429-475) or opioidSafety (:533-537). "
         "content-core.js changes in one place only: the heading comment at :429 gains, in place on the same line before its closing dashes, "
         "'; V-10b 2026-11-14: the I6 default, none confirmed, every entry keeps verify'. No line is added or removed in content-core.js: the pack and the test "
         "'content FIX-MARKERS: the four safety blocks are marked and keep their shape' read lines 431, 454, 464 and 471 by their start; keep all four clinicalReview comments. "
         "New test in content.test.mjs, exactly this name: 'content V-10b: every crisis number keeps its please-verify flag (the I6 default)'. It asserts: (1) every entry of every array in "
         "C.resources.in (emergency, crisis, groups, treatment) and of C.resources.intl.lines has verify === true; (2) C.resources.in.verifyNote is a non-empty string; "
         "(3) C.resources.opioidSafety.verify === true; (4) the numbers are pinned: the sorted list of every number, alt and tel string in C.resources.in and C.resources.intl "
         "deep-equals a literal list written into the test from the file as it is now (112, 108, 14416, 1800-891-4416, 1800-599-0019, 14446, 1860-2662-345, +91 9999 666 555, "
         "1800-116-117, 011-2658-9391 and the intl tel 112; read the file and copy, do not trust this note), its message: a number changes only after the owner confirms it (I6). "
         "See it fail once with one verify flipped locally, then restore."),
    U2: ("LOW C1 (the V-23 check): content.test.mjs:381 repeats :380 in the test 'content: all rows sample:true' (sampleRows is Object.values(st).flat() at :359, so :380 always throws first "
         "and :381's per-store message is never seen). Delete the line at :380 (the assert with the message 'every row and event is marked') and keep :381. Keep the test's name. "
         "Keep sampleRows (no other change)."),
}
COMMON = (" One batch, one builder, two commits (V-10b, then C1-381), the unit id in each message, both trailers (Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
          " and Claude-Session: " + SESSION + "). The worktree was fast-forwarded --ff-only to the trunk tip " + tip + ": base and diffFrom are that tip."
          " The unit notes are the spec. Test names are failure identities: add the one new name, never rename or delete one."
          " Under 4.0 GB free memory before a heavy gate: commit what is clean and return the note. Restore offline/1-addic.html after any build.")
a['laneNote'] = ("V-10b and LOW C1 by name from the HUB (R-H-58 on R-O-11 'continue v3.3'; toward offline-v3.3; SCREENS 12:02, " + now + ")." + COMMON +
    " Only offline/src/content-core.js (the one comment line :429) and offline/tests/content.test.mjs change. Gates through gates.py: build, test, validate, guards; no browser (no DOM change)."
    " for_the_chat: npm test's count at your tip (763 at the trunk; expect 764).")
a.update(base=tip, diffFrom=tip, session=SESSION, now=now, sliceRun=False, start='build', priorNote='', flagged=False)
p = D + 'tracks/SCREENS/args/v33_content.json'
open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=2, ensure_ascii=False) + '\n')
print(p, len(json.dumps(a)))
