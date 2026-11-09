"""Usage: python gen_v32.py <workbook-settings|content> <trunk tip> "<now>"
Writes tracks/SCREENS/args/v32_<lane>.json for the HUB's offline-v3.2 fixes by name (R-H-53, SCREENS 16:08).
base = diffFrom = the trunk tip at the start. Prints the path and the size."""
import json, sys
D = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/'
SESSION = 'https://claude.ai/code/session_6f1291e1-0216-436a-a494-2f0b2049e32d'
lane, tip, now = sys.argv[1:4]
COMMON = (" One batch, one builder, one commit, the unit id in the message, both trailers (Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
          " and Claude-Session: " + SESSION + "). The worktree was fast-forwarded --ff-only to the trunk tip " + tip + ": base and diffFrom are that tip."
          " The unit note is the spec. Test names are failure identities: add the one new name, never rename or delete one."
          " Under 4.0 GB free memory before a heavy gate: commit what is clean and return the note. Restore offline/1-addic.html after any build.")
if lane == 'workbook-settings':
    a = json.load(open(D + 'tracks/SCREENS/args/v3_ws_fixtour.json', encoding='utf-8'))
    u = 'R-S-32'
    a.update(area="One 'Replay the tour' control on Settings Help.", units=[u], batches=[[u]], unitTier={u: 2},
             done=['U-19','U-20a','U-20b','U-21','FIX-SAMPLE','C1','V-24','V-22b','FIX-TOUR-REPLAY','FIX-WS-LOWS'], slot=6)
    a['unitNotes'] = {u: ("ui-settings.js helpTab (:421 on): Settings > Help shows two controls named 'Replay the tour' that do the same thing: the link data-test tour-replay, and the training list's entry (ui-guidance.js:223, kind 'tour'). "
        "Keep the tour-replay link and drop the list's entry, by filtering before the empty check: const drills = G && typeof G.training === 'function' ? (safe(() => G.training(), []) || []).filter((d) => d && d.kind !== 'tour') : null; so a list holding only the tour says 'No training drills yet.' honestly. Leave the later filter on d.route. ui-guidance.js is not yours and does not change: Training elsewhere still offers the tour. "
        "New test, exactly this name: 'workbook-settings R-S-32: Settings Help shows one Replay the tour control'. With a stand-in globalThis.GuidanceUI (coach a no-op; training returns the tour entry and one drill entry), restored in finally, render the help tab and assert exactly one control reads 'Replay the tour', it is the tour-replay link, and the drill's link is still drawn."),}
    a['laneNote'] = ("R-S-32: a fix by name from the HUB (R-H-53; toward offline-v3.2; SCREENS 16:08, " + now + ")." + COMMON +
        " Only offline/src/ui-settings.js and offline/tests/workbook-settings.test.mjs change. No words change. Gates through gates.py: build, test, validate, guards, browser --grep tour (three flows).")
elif lane == 'content':
    b = json.load(open(D + 'tracks/SCREENS/args/v3_content_t2.json', encoding='utf-8'))
    a = dict(b)
    u = 'FIX-MARKERS'
    a.update(area="clinicalReview markers on the four unmarked safety blocks of content-core.js.", tier=2, units=[u], batches=[[u]], unitTier={u: 2},
             files=['offline/src/content-core.js', 'offline/tests/content.test.mjs'],
             done=['U-31a','U-31b','U-29','U-30','U-32','U-33','V-10','V-10r','V-42','C1','V-23'], slot=4,
             brief=D + 'tracks/SCREENS/briefs/content-v3.md', contract=D + 'tracks/SCREENS/contracts/content-v3.md')
    a['unitNotes'] = {u: ("The clinical pack's P-28, P-29, P-30 and P-32 (CLINICAL-REVIEW-PACK.md:273-317) are safety passages in offline/src/content-core.js with no clinicalReview marker. "
        "Add one per block as a trailing line comment on a line that already exists, so no line number moves (the pack and V-10b cite these lines) and no shape changes (overdose and withdrawal are arrays of strings read by texts() in ui-sos.js and lineList() in ui-onboarding.js; context is a string; a data flag would change them). The precedents are ui-sos.js:53 and ui-onboarding.js:23. "
        "The four: :431 'in: { // clinicalReview (pack P-28: the crisis numbers; each entry keeps verify)'; :454 at the end of the context line '// clinicalReview (pack P-29)'; :464 'overdose: [ // clinicalReview (pack P-30)'; :471 'withdrawal: [ // clinicalReview (pack P-32)'. "
        "Not one shown word, number, url or verify flag changes: V-10b does those after the owner's I6. "
        "New test, exactly this name: 'content FIX-MARKERS: the four safety blocks are marked and keep their shape'. It reads content-core.js's text and asserts each of those four lines carries clinicalReview, and that C.resources.overdose and C.resources.withdrawal are still arrays of strings and C.resources.in.context a string. Read how content.test.mjs loads files; do not add harness code."),}
    a['laneNote'] = ("FIX-MARKERS: a fix by name from the HUB (R-H-53; toward offline-v3.2; SCREENS 16:08, " + now + "). Safety passages, comments only." + COMMON +
        " V-10b is NOT built. LOW C1 (content.test.mjs:381) stays. Only offline/src/content-core.js and offline/tests/content.test.mjs change; the diff of content-core.js is four changed lines, each only gaining a trailing comment. Gates through gates.py: build, test, validate, guards; no browser (no DOM change). "
        "Say in for_the_chat: which lines of CLINICAL-REVIEW-PACK.md go stale (its NO MARKER tags and its marker count); change none of them.")
else:
    sys.exit('no such lane')
a.update(base=tip, diffFrom=tip, session=SESSION, now=now, sliceRun=False, start='build', priorNote='', flagged=False)
p = D + 'tracks/SCREENS/args/v32_' + lane + '.json'
open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=2, ensure_ascii=False) + '\n')
print(p, len(json.dumps(a)))
