"""CORE 16:19 (2026-11-14): the launch file of tests-docs V3.3-T1 (after the tag offline-v3.3; R-H-61, R-H-62). Usage: python mk_td_v33.py <base sha> <now>"""
import io, json, os, subprocess, sys
ARGS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/args'
BRIEF = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/briefs/tests-docs/V3.3-T1.md'
SESSION = '45b995c7-ba6e-4a78-b5a2-4e87b3bce8a8'
base, now = sys.argv[1], sys.argv[2]
extra = os.path.join(ARGS, 'extra_tests-docs_V3.3-T1.json')
SHORT = ("V3.3-T1 (tests-docs, not flagged; after the tag offline-v3.3; merge base " + base[:8] + "; R-H-61, R-H-62). One browser flow named exactly "
         "'a same-path SOS render keeps focus in the page': it proves core's FIX-SOS-FOCUS (324194c) in the suite: a route render of the same path that removes the focused "
         "element from main puts focus on main (or inside it) with no scroll. Proven red on the pre-fix code (a scratch build from 324194c^ or a mutant), never by editing offline/src. "
         "[The whole note, with the steps, the hooks and the proof: " + BRIEF + ": read it before you build.]")
json.dump({'V3.3-T1': {'tier': 1, 'note': SHORT}}, io.open(extra, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
env = dict(os.environ, SESSION=SESSION, SLOT='5', EXTRA=extra)
prev = '["U-35","V-07","V-03","V-06","V-01t","V-45","V-22a","V-26b","V-27","V-29","FIX-TD-V32","FIX-COUNTS-4","FIX-COUNTS-5"]'
print(subprocess.check_output(['python', os.path.join(ARGS, 'gen8.py'), now, 'tests-docs', '[["V3.3-T1"]]', base, '-', base, prev], env=env).decode())
p = os.path.join(ARGS, 'args_v3_tests-docs_V3.3-T1.json')
a = json.load(io.open(p, encoding='utf-8'))
a['unitNotes'] = {'V3.3-T1': SHORT}
a['area'] = "After the tag offline-v3.3, by name: a browser flow that a same-path SOS render keeps keyboard focus inside the page (FIX-SOS-FOCUS)."
a['laneNote'] = ("CORE 16:19's word (2026-11-14), after the tag offline-v3.3 by the HUB's grant (slot 5, R-H-62). One unit: name it by its batch id V3.3-T1 in done. "
                 "'Claude-Session: " + SESSION + "' goes on every commit, whatever the Co-Authored-By line says. Message from a file, add by explicit path, never git add -A. "
                 "offline/1-addic.html is generated: never commit its rebuild. Nothing under offline/src (the red proof uses a scratch copy outside the worktree's src or a mutant build). "
                 "The count lines and offline/README.md's list of flow names are a later FIX-COUNTS unit's, not this batch's: do not edit CLAUDE.md, README.md, offline/README.md or the guide. "
                 "A hook the flow needs goes in offline/tests/helpers/hooks.mjs; a hook in another lane's src file is an outbox ask, not an edit. "
                 "One browser or screens run at a time. Under 4.0 GB free: stop at your next commit, say so.")
io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=1, ensure_ascii=False) + '\n')
print({k: (v if k in ('base', 'diffFrom', 'slot', 'session', 'now', 'sliceRun', 'batches', 'done') else len(json.dumps(v))) for k, v in a.items()})
