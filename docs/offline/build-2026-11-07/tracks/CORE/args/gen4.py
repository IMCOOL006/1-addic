"""CORE 10 (6c9dfc8f): the launch args for tests-docs tier 2 (R-H-37): the U-35 screenshots slice, then U-36b.
Usage: python gen4.py "<now from date>" <slice|u36b> [priorNote-file] -> args_td_<which>.json beside this file."""
import json, sys, io, os
J = os.path.dirname(os.path.abspath(__file__))
D = os.path.dirname(os.path.dirname(os.path.dirname(J)))  # docs/offline/build-2026-11-07
NOW, WHICH = sys.argv[1], sys.argv[2]
SESSION = '6c9dfc8f-25c9-4b86-802e-1c99fa025fca'
BASE = 'f69bc68a'
L = json.load(io.open(os.path.join(D, 'tracks/HUB/workflows/lane_args.json'), encoding='utf-8'))['lanes']['tests-docs']
a = dict(L)
a['units'] = ['U-34', 'U-37', 'U-36a', 'FIX-TOURMARK', 'U-35', 'V-07']
a['batches'] = [['U-34'], ['U-37', 'U-36a'], ['FIX-TOURMARK'], ['U-35'], ['V-07']]
a['unitTier'] = dict(L['unitTier']); a['unitTier']['FIX-TOURMARK'] = 1; a['unitTier']['V-07'] = 1; a['unitTier']['U-35'] = 1
a['unitNotes'] = dict(L['unitNotes'])
a['unitNotes']['U-35'] = (
  "Screenshots (tier 2, 1.5 h; BUILD-PLAN 3.13 line 216, 3.14; brief 'U-35'). offline/tests/screens.mjs, `npm run screens` (add scripts.screens "
  "= 'node offline/tests/screens.mjs' by JSON parse, no other key); shares helpers/launch.mjs (same launch, same offline route blocking: a non-file "
  "request or console error fails by name); selectors from helpers/hooks.mjs. SHOTS about 30 {slug, route, setup, size} for the screens the 14 "
  "Part 3 lessons of offline/docs/1-addic-Guide.md need (onboarding, lock, Today, SOS flows, urgent help, quick log, Learn, "
  "a lesson, an exercise, Workbook, Reasons Card, Recovery Plan, Track, Insights, Harbor, planner, Settings). Seed through Load sample data (O6) on a fresh profile; the tour marked skipped as "
  "markOnboarded does; reduced motion. Writes offline/docs/images/<slug>-desktop.png (1280x800) and <slug>-phone.png (390x844) with a pHYs chunk "
  "at 300 DPI (11811 px/m) by a dependency-free PNG rewrite (CRC32 in the file), then reads each back and checks size and pHYs (exit 1 by name). "
  "Exit 0 with a named reason when the file or a browser is absent; a shot whose route or hook is missing skips by name; prints 'screens: N "
  "written, M skipped'. Done when: build, then screens on the worktree writes at least 28 shots at both sizes, zero non-file requests, no console "
  "error (log _logs/gates/tests-docs/screens-<stamp>.log); you Read four images and name them; committed by path (images total under 15 MB, in the "
  "note); browser still 16/0/3 by name; docs gate green.")
a['unitNotes']['V-07'] = (
  "V-07 = U-36b, guide Parts 3 and 4 (PLAN-V3.md tier 1, 2.5 h; Part 4's 'Planned' rows say what is merged; BUILD-PLAN 3.14; brief section 'U-36b'). In offline/docs/1-addic-Guide.md write the 14 Part 3 lessons against the "
  "real screens on the trunk (the names, buttons and order as built: read the ui-*.js files and the U-35 images, never guess), one U-35 image per "
  "lesson with real alt text; 'How this guide was checked' with the real counts from the last runs (Node 536/536 in 13 files; browser 16 pass, "
  "0 fail, 3 skip by name on f69bc68, _logs/gates/hub/browser-20261108-015539.log; re-read the newest logs and use those) and the privacy proof "
  "(CSP connect-src 'none', zero network requests in the browser suite, no trackers, no remote font). Flip STRICT_IMAGES to True in build_guide.py. "
  "Original words only, grade 6-8, person-first; the SOS lesson keeps the urgent-help numbers' 'please verify' mark and says little else. "
  "Done when: python offline/docs/build_guide.py exits 0 with STRICT_IMAGES True, every referenced image exists, the docs gate green, the .docx "
  "rebuilt and committed by path.")
a['done'] = ['U-34', 'U-37', 'U-36a', 'FIX-TOURMARK'] + (['U-35'] if WHICH == 'u36b' else [])
a['base'] = BASE
a['slot'] = 5
a['session'] = SESSION
a['now'] = NOW
a['start'] = 'build'
if WHICH == 'slice':
    a['sliceRun'] = True
    a['diffFrom'] = BASE
    a['priorNote'] = (
      "The lane is MERGED at 9931e10 (FIX-TOURMARK; trunk f69bc68a, tag offline-v1.1 at f69bc68). U-34, U-37, U-36a and FIX-TOURMARK are in the "
      "trunk. CORE 10 fast-forwarded build/tests-docs to f69bc68a at 02:03 IST (no merge commit; worktree clean). On f69bc68 the browser suite is "
      "16 pass, 0 fail, 3 skip by name (sos-reassess-passed, sos-reassess-still, quicklog-button: the hooks round, later, not this run). The guide "
      "skeleton offline/docs/1-addic-Guide.md and offline/docs/build_guide.py (STRICT_IMAGES False) exist; offline/docs/images/ does not yet.")
else:
    a['priorNote'] = io.open(sys.argv[3], encoding='utf-8').read()
    a['diffFrom'] = sys.argv[4]
a['laneNote'] = ("Owns the harness, screens.mjs, the guide, package.json scripts test:browser/screens/check; every screen lane is in the trunk. "
  "CORE CHAT'S WORD (" + NOW + ", CORE 10, session " + SESSION + "; R-H-37): tier 2 on slot 5, on the real code (worktree fast-forwarded to " + BASE + "; "
  "never merge or copy files in). A hook missing from another lane's screen: a skip by name and a line in your note's requests, never an edit of "
  "their file. No new dependency, no npm install. Name the unit by its batch id in done. Trailers: 'Co-Authored-By: Claude Fable 5.1 "
  "<noreply@anthropic.com>' and 'Claude-Session: " + SESSION + "'; message from a file; add by path. One browser or screens run at a time.")
out = os.path.join(J, 'args_td_' + WHICH + '.json')
json.dump(a, io.open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
print(out, len(json.dumps(a)), 'B')
