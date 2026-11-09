"""CORE 18: the launch file of tests-docs FIX-TD-V32 (offline-v3.2). Usage: python mk_td_v32.py <base sha> <now>"""
import io, json, os, subprocess, sys
ARGS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/args'
BRIEF = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/briefs/tests-docs/FIX-TD-V32.md'
SESSION = '987cb3b4-a89e-435e-a65d-bbb9929bdb52'
base, now = sys.argv[1], sys.argv[2]
extra = os.path.join(ARGS, 'extra_tests-docs_FIX-TD-V32.json')
SHORT = ("FIX-TD-V32 (tests-docs; offline-v3.2; merge base " + base + "; R-H-53). Five items, one commit each: T1 a browser check that discreet mode paints no emergency line while the app loads, T2 V-20's toasts in a browser, "
         "T3 the lock page's SOBER practice, T4 the sos-craving retake, T5 the hook lock-opening. [The whole note, with the flow names and the proofs: " + BRIEF + ": read it before you build.]")
json.dump({'FIX-TD-V32': {'tier': 1, 'note': SHORT}}, io.open(extra, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
env = dict(os.environ, SESSION=SESSION, SLOT='5', EXTRA=extra)
prev = '["U-35","V-07","V-03","V-06","V-01t","V-45","V-22a","V-26b","V-27","V-29"]'
print(subprocess.check_output(['python', os.path.join(ARGS, 'gen8.py'), now, 'tests-docs', '[["FIX-TD-V32"]]', base, '-', base, prev], env=env).decode())
p = os.path.join(ARGS, 'args_v3_tests-docs_FIX-TD-V32.json')
a = json.load(io.open(p, encoding='utf-8'))
a['unitNotes'] = {'FIX-TD-V32': SHORT}
a['area'] = "The offline-v3.2 browser checks by name: the discreet start's emergency line, the lesson and checkpoint toasts, the lock page's SOBER practice; the sos-craving retake; one hook."
a['laneNote'] = ("CORE 18's word (2026-11-09), offline-v3.2 by the HUB's grant (R-H-53), under R-O-7. One unit: name it by its batch id in done. "
                 "'Claude-Session: " + SESSION + "' goes on every commit, whatever the Co-Authored-By line says. offline/1-addic.html is generated: never commit its rebuild. "
                 "Nothing under offline/src. The count lines and the README's flow names are FIX-COUNTS-4's, not this batch's. One browser or screens run at a time. Under 4.0 GB free: stop at your next commit, say so.")
io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=1, ensure_ascii=False) + '\n')
print({k: (v if k in ('base', 'diffFrom', 'slot', 'session', 'now', 'sliceRun', 'batches', 'done') else len(json.dumps(v))) for k, v in a.items()})
