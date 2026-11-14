"""CORE 12:02 (2026-11-14): the launch file of core FIX-STALE-SAVE-SAY + FIX-SOS-FOCUS (offline-v3.3, R-H-58).
Usage: python mk_core_v33.py <base sha> <now>
Writes extra_core_FIX-STALE-SAVE-SAY.json and, through gen8.py, args_v3_core_FIX-STALE-SAVE-SAY.json, then trims its notes."""
import io, json, os, subprocess, sys
ARGS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/args'
BRIEFS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/briefs/core/'
SESSION = '393886cb-a443-4703-8331-923de2473966'
base, now = sys.argv[1], sys.argv[2]
extra = os.path.join(ARGS, 'extra_core_FIX-STALE-SAVE-SAY.json')
N1 = ("FIX-STALE-SAVE-SAY (core, flagged; offline-v3.3; merge base " + base[:8] + "; RS1 of R-C-86). A save refused because another tab changed the notebook "
      "(an import or a PIN change) is lost with nothing on screen saying so: the lock page replaces the page before its refusal shows. Keep the refusal; "
      "the stale branch of Store's write() tells the lock listeners { reason: 'auto', stale: true }, and ui-core's onLock shows one warn toast outside SOS. "
      "[The whole note, with the lines, the words, the tests and the proof: " + BRIEFS + "FIX-STALE-SAVE-SAY.md: read it before you build.]")
N2 = ("FIX-SOS-FOCUS (core, flagged; offline-v3.3; merge base " + base[:8] + "; R-C-88 question 2). A route render of the same path with a new query "
      "(Back or Forward between '#/sos/craving' and '#/sos/craving?from=lock') replaces main but does not move focus, so a keyboard user can fall to body. "
      "Reproduce it in real Chrome first (a red log); only then: focus main with no scroll when the focused element was inside main and is gone. "
      "[The whole note: " + BRIEFS + "FIX-SOS-FOCUS.md: read it before you build.]")
json.dump({'FIX-STALE-SAVE-SAY': {'tier': 1, 'note': N1}, 'FIX-SOS-FOCUS': {'tier': 1, 'note': N2}},
          io.open(extra, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
env = dict(os.environ, SESSION=SESSION, SLOT='1', EXTRA=extra)
print(subprocess.check_output(['python', os.path.join(ARGS, 'gen8.py'), now, 'core', '[["FIX-STALE-SAVE-SAY","FIX-SOS-FOCUS"]]', base, '-', base,
                               '["V-11","V-46","V-16","V-17a","V-26a","FIX-IMPORT-MARK"]'], env=env).decode())
p = os.path.join(ARGS, 'args_v3_core_FIX-STALE-SAVE-SAY.json')
a = json.load(io.open(p, encoding='utf-8'))
a['unitNotes'] = {'FIX-STALE-SAVE-SAY': N1, 'FIX-SOS-FOCUS': N2}
a['files'] = ['offline/src/store.js', 'offline/src/ui-core.js', 'offline/tests/store.test.mjs', 'offline/1-addic.html']
a['area'] = "The offline-v3.3 fixes by name: a save refused after another tab's import or PIN change is said in a toast that survives the lock page; a same-path route render keeps keyboard focus inside the page."
a['laneNote'] = ("CORE 12:02's word (2026-11-14), offline-v3.3 by the HUB's grant (R-H-58 on the owner's R-O-11), under R-O-7. Flagged lane: encryption and the person's data; two reviewers before READY. "
                 "One batch of two units: name each by its id in done, one commit per unit at least. "
                 "'Claude-Session: " + SESSION + "' goes on every commit, whatever the Co-Authored-By line says. Message from a file, add by explicit path, never git add -A. "
                 "offline/1-addic.html is generated: never commit its rebuild. No clinical copy, no new public name, no new event type (stale is a field on the existing lock event). "
                 "SOS is never interrupted. One browser or screens run at a time. Under 4.0 GB free: stop at your next commit, say so.")
io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=1, ensure_ascii=False) + '\n')
print({k: (v if k in ('base', 'diffFrom', 'slot', 'session', 'now', 'sliceRun', 'units', 'batches', 'done', 'flagged') else len(json.dumps(v))) for k, v in a.items()})
