"""Usage: python gen_t2.py <lane> <base sha> "<now>" [<merged-at sha>]
Writes tracks/SCREENS/args/v3_<lane>_t2.json for a SCREENS tier 2 run (V3, after the FREEZE): the lane object of
lane_args_v3.json with units/batches cut to the tier 2 batch, base = diffFrom = <base>, done = the finished units,
the session of SCREENS 11:07, and a laneNote naming what is in the worktree. Prints the path and the size."""
import json, sys
D = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/'
SESSION = 'https://claude.ai/code/session_c26b6cc6-42e0-4b1c-9ebf-30ba97e949b7'
lane, base, now = sys.argv[1], sys.argv[2], sys.argv[3]
merged_at = sys.argv[4] if len(sys.argv) > 4 else ''
L = json.load(open(D + 'tracks/HUB/workflows/lane_args_v3.json', encoding='utf-8'))['lanes'][lane]
a = dict(L)
WT = 'C:/Users/ruchi/1-addic-wt/' + lane
COMMON = (f" The worktree {WT} was fast-forwarded with merge --ff-only (no merge commit) to BASE {base}, the commit of the tag"
          " offline-v3.0 (pushed 11:57 IST): base and diffFrom are " + base + ". Tier 2: this goes toward offline-v3.1; the HUB merges it as it lands."
          " Under 4.0 GB free memory (PowerShell Get-CimInstance Win32_OperatingSystem FreePhysicalMemory) before a heavy gate:"
          " commit what is clean and return the note (the chat pauses the newest run). Test names are failure identities: add new"
          " names, never rename or delete one. Restore offline/1-addic.html (git checkout -- offline/1-addic.html) after any build"
          " so the tree ends clean. One commit per unit, the unit id in the message, both trailers"
          f" (Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com> and Claude-Session: {SESSION}).")
if lane == 'content':
    a.update(units=['V-23'], batches=[['V-23']], unitTier={'V-23': 2},
             done=['U-31a', 'U-31b', 'U-29', 'U-30', 'U-32', 'U-33', 'V-10', 'V-10r', 'V-42', 'C1'],
             brief=D + 'tracks/SCREENS/briefs/content-v3.md', contract=D + 'tracks/SCREENS/contracts/content-v3.md', slot=4)
    a['unitNotes'] = {'V-23': L['unitNotes']['V-23']}
    a['laneNote'] = ("V3 V-23 (tier 2; PLAN-V3.md section 2; SCREENS 11:07, " + now + "). THIS RUN BUILDS V-23 ONLY: one batch, one builder."
        " V-10, V-10r and V-42 with its C1 are done and merged (V-42 at 899f77e4). V-10b is NOT built: it waits for the owner's I6"
        " answer, and no number, url or verify flag changes without it." + COMMON +
        " SPEC: the brief tracks/SCREENS/briefs/content-v3.md section 'V-23' (written at f69bc68a: re-read each cited line in the"
        " worktree; the code wins, say so in the note). The three items, LOWs of the v1 report (lane-reports/content.md:86-88):"
        " (C2a) offline/src/content-sample.js:6 (the header comment) says nothing is dated after nowIso, but the sample's plans run"
        " 1-3 days ahead: fix the comment only, no data change; (C2b/C3) offline/tests/content.test.mjs, the sample test: one explicit"
        " assert that every row generate() returns, in every store, carries sample: true (the meta row {key:'sample'} is written by"
        " Actions.loadSample, not by generate), so erasing the sample leaves nothing behind. Actions.eraseSample IS in the trunk now"
        " (actions-sos RS-SAMPLE): assert the round trip through it only if content.test.mjs already loads the Store and Actions the"
        " way other test files do (offline/tests/helpers); if that needs new harness code, keep the generate-level assert alone and"
        " say so; (C4) offline/src/content-core.js:133, the M10 rank: one comment that the M10 milestone is the base rank id 'guide'"
        " (the 'graduate' badge at :149 is a different thing, My Recovery Plan built); no id change. Files: content-sample.js,"
        " content.test.mjs, content-core.js (own). Gates: build, test, validate, guards through gates.py; no browser (no DOM change).")
elif lane == 'workbook-settings':
    a.update(units=['V-24', 'V-22b'], batches=[['V-24'], ['V-22b']], done=['U-19', 'U-20a', 'U-20b', 'U-21', 'FIX-SAMPLE', 'C1'],
             brief=D + 'tracks/SCREENS/briefs/workbook-settings.md', contract=D + 'tracks/SCREENS/briefs/workbook-settings.md', slot=6)
    a['laneNote'] = ("V3 V-24 + V-22b (tier 2, two one-unit batches, a fresh builder each, V-24 first; PLAN-V3.md section 2; SCREENS 11:07, " + now + ")."
        " The v1 units U-19, U-20a, U-20b, U-21 and FIX-SAMPLE are done and merged (42d2467d); C1 was closed on e8da3fbd (R-S-18)." + COMMON +
        " No V3 brief or contract exists for this lane: this note and the unit notes are the spec; the v1 brief"
        " tracks/SCREENS/briefs/workbook-settings.md gives the lane's files and rules. V-24: offline/src/ui-settings.js:65, TEXT.early"
        " ('This is an early-access version. Some screens are still being built and say so. Your notes stay on this device while it"
        " grows.') becomes words that are true now: every screen is in; where content is still coming, the screen says so plainly"
        " (O7, honest stubs); the notes stay on this device. One or two short sentences, original words, grade 6-8, no promise of"
        " outcomes, no version number. Grep every test and helper (offline/tests/, including browser.test.mjs, helpers/, screens.mjs)"
        " and offline/docs for the old words: change only the lane's own test; a test or doc in another lane's file that reads the"
        " old words goes in for_the_chat (its owner fixes it by outbox), never edited here. V-22b (C1b): offline/tests/"
        "workbook-settings.test.mjs:278-294, the sample card test: Content.sample.generate and Actions.eraseSample are both in the"
        " trunk now, so assert that both exist (assert.ok with a message naming each) and run the load / own log / erase round trip"
        " without the if; keep the test's name. Files: ui-settings.js, workbook-settings.test.mjs (own). Gates: build, test,"
        " validate, guards through gates.py; add browser --grep Settings only if a browser flow reads the changed words.")
elif lane == 'game-tutorials':
    a.update(units=['V-21'], batches=[['V-21']], unitTier={'V-21': 2},
             done=['U-27', 'U-26', 'U-28', 'FIX-TOUR', 'V-08b', 'V-28', 'V-44'],
             brief=D + 'tracks/SCREENS/briefs/game-tutorials-v3.md', contract=D + 'tracks/SCREENS/contracts/game-tutorials-v3.md', slot=8)
    a['unitNotes'] = {'V-21': L['unitNotes']['V-21']}
    a['laneNote'] = ("V3 V-21 (tier 2; PLAN-V3.md section 2; SCREENS 11:07, " + now + "). THIS RUN BUILDS V-21 ONLY: one batch, one builder."
        " V-08b, V-28 and V-44 are done and merged" + (f" (V-28 + V-44 at {merged_at})" if merged_at else "") + "." + COMMON +
        " SPEC: the brief tracks/SCREENS/briefs/game-tutorials-v3.md section 'V-21' (written at f69bc68a, before V-28 and V-44 moved"
        " ui-guidance.js: re-read coach(), onRoute and place() in the worktree; the code wins, say so in the note). The unit: (1) in"
        " onRoute, a running kind 'tour' tutorial closes 'aborted' when the route leaves Today, and a JIT closes 'aborted' when"
        " featureOfRoute no longer matches its feature; 'aborted' marks nothing (no TutorialCompleted, so the tour is offered again"
        " later); the layer is removed; skip, Escape and tap-outside unchanged; the quiet paths (sos, lock, onboarding) and locked"
        " keep closing as today; nothing opens on an SOS route; V-44's reward sheet and the status JIT keep their rules; (2) place():"
        " Node cases asserting the style values of the below-target branch with room beside #sos-btn (maxWidth set), the"
        " below-target branch with no room (bottom-anchored above SOS) and the above-target branch. The test names from the brief:"
        " 'coach: the tour aborts when the route leaves Today'; 'coach: a JIT aborts on leaving its feature'; 'coach place: narrow"
        " branch sets maxWidth'; 'coach place: flip branch anchors above SOS'; 'coach place: above-target unchanged'. Files:"
        " ui-guidance.js, game-tutorials.test.mjs (own); ui-tools.js and ui-game.js unchanged. Gates: build, test, validate, guards,"
        " and browser --grep tour (the flows 'tour complete', 'tour skip', 'tour replay' stay green).")
else:
    sys.exit('no tier 2 for ' + lane)
a.update(base=base, diffFrom=base, session=SESSION, now=now, sliceRun=False, start='build', priorNote='')
for k in ('dryRun',):
    a.pop(k, None)
p = D + f'tracks/SCREENS/args/v3_{lane}_t2.json'
open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=2, ensure_ascii=False) + '\n')
print(p, len(json.dumps(a)), 'laneNote', len(a['laneNote']))
