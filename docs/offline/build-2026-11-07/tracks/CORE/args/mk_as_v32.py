"""CORE 18: the launch file of actions-sos FIX-AS-V32 (offline-v3.2). Usage: python mk_as_v32.py <base sha> <now>
Writes extra_actions-sos_FIX-AS-V32.json and, through gen8.py, args_v3_actions-sos_FIX-AS-V32.json, then trims its notes."""
import io, json, os, subprocess, sys
ARGS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/args'
BRIEF = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/briefs/actions-sos/FIX-AS-V32.md'
SESSION = '987cb3b4-a89e-435e-a65d-bbb9929bdb52'
base, now = sys.argv[1], sys.argv[2]
extra = os.path.join(ARGS, 'extra_actions-sos_FIX-AS-V32.json')
SHORT = ("FIX-AS-V32 (actions-sos, flagged; offline-v3.2; merge base " + base + "; R-H-53). Five items, one commit each: ES3T (the V-17b test that a kept save is dropped on another tab's import, "
         "now that FIX-IMPORT-MARK moves lockId; two comments in ui-sos.js), EC3, ES2, EF1, SF1. [The whole note, with each item's file, test name and proof: " + BRIEF + ": read it before you build.]")
json.dump({'FIX-AS-V32': {'tier': 1, 'note': SHORT}}, io.open(extra, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
env = dict(os.environ, SESSION=SESSION, SLOT='3', EXTRA=extra)
print(subprocess.check_output(['python', os.path.join(ARGS, 'gen8.py'), now, 'actions-sos', '[["FIX-AS-V32"]]', base, '-', base,
                               '["V-08a","V-SOS10","V-41","V-25","V-18","V-17b"]'], env=env).decode())
p = os.path.join(ARGS, 'args_v3_actions-sos_FIX-AS-V32.json')
a = json.load(io.open(p, encoding='utf-8'))
a['unitNotes'] = {'FIX-AS-V32': SHORT}
a['files'] = ['offline/src/actions.js', 'offline/src/ui-sos.js', 'offline/src/ui-onboarding.js', 'offline/tests/actions.test.mjs', 'offline/1-addic.html']
a['area'] = "The offline-v3.2 fixes by name: the V-17b test of a kept save on another tab's import, the USE_VERB message, the retry's PIN message, the discreet chrome through Done, the Back press on the lock page's practice."
a['laneNote'] = ("CORE 18's word (2026-11-09), offline-v3.2 by the HUB's grant (R-H-53), under R-O-7. Flagged lane: safety copy; two reviewers before READY. One unit: name it by its batch id in done. "
                 "'Claude-Session: " + SESSION + "' goes on every commit, whatever the Co-Authored-By line says. offline/1-addic.html is generated: never commit its rebuild. "
                 "No clinical copy, no new public name, no new event. One browser or screens run at a time. Under 4.0 GB free: stop at your next commit, say so.")
io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=1, ensure_ascii=False) + '\n')
print({k: (v if k in ('base', 'diffFrom', 'slot', 'session', 'now', 'sliceRun', 'units', 'batches') else len(json.dumps(v))) for k, v in a.items()})
