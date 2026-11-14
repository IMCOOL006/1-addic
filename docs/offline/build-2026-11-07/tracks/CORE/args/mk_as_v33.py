"""CORE 12:02 (2026-11-14): the launch file of actions-sos FIX-C1-BACK (offline-v3.3, R-H-58). Usage: python mk_as_v33.py <base sha> <now>
Writes extra_actions-sos_FIX-C1-BACK.json and, through gen8.py, args_v3_actions-sos_FIX-C1-BACK.json, then trims its notes."""
import io, json, os, subprocess, sys
ARGS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/args'
BRIEF = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/briefs/actions-sos/FIX-C1-BACK.md'
SESSION = '393886cb-a443-4703-8331-923de2473966'
base, now = sys.argv[1], sys.argv[2]
extra = os.path.join(ARGS, 'extra_actions-sos_FIX-C1-BACK.json')
SHORT = ("FIX-C1-BACK (actions-sos, flagged; offline-v3.3; merge base " + base[:8] + "; the checker's C1, R-C-88). The lock page's SOBER practice is held on the fixed hash "
         "'#/sos/craving?from=lock'; after a reload and a second practice two adjacent history entries share it, so one Back press does nothing (the checker's real-Chrome probe). "
         "Make every hold's hash differ from every earlier hold's, also across a reload; keep SF1, ESR1, EC1 and ESR2 green by name. "
         "[The whole note, with the probe, the tests and the proof: " + BRIEF + ": read it before you build.]")
json.dump({'FIX-C1-BACK': {'tier': 1, 'note': SHORT}}, io.open(extra, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
env = dict(os.environ, SESSION=SESSION, SLOT='3', EXTRA=extra)
print(subprocess.check_output(['python', os.path.join(ARGS, 'gen8.py'), now, 'actions-sos', '[["FIX-C1-BACK"]]', base, '-', base,
                               '["V-08a","V-SOS10","V-41","V-25","V-18","V-17b","FIX-AS-V32"]'], env=env).decode())
p = os.path.join(ARGS, 'args_v3_actions-sos_FIX-C1-BACK.json')
a = json.load(io.open(p, encoding='utf-8'))
a['unitNotes'] = {'FIX-C1-BACK': SHORT}
a['files'] = ['offline/src/ui-onboarding.js', 'offline/tests/actions.test.mjs', 'offline/1-addic.html']
a['area'] = "The offline-v3.3 fix by name: the lock page's practice is held on a hash no earlier hold used, so the first Back always moves."
a['laneNote'] = ("CORE 12:02's word (2026-11-14), offline-v3.3 by the HUB's grant (R-H-58 on the owner's R-O-11), under R-O-7. Flagged lane: safety copy; two reviewers before READY. One unit: name it by its id in done. "
                 "'Claude-Session: " + SESSION + "' goes on every commit, whatever the Co-Authored-By line says. Message from a file, add by explicit path, never git add -A. "
                 "offline/1-addic.html is generated: never commit its rebuild. No copy change, no clinical copy, no new public name, no new event. SOS is never gated or interrupted. "
                 "One browser or screens run at a time. Under 4.0 GB free: stop at your next commit, say so.")
io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=1, ensure_ascii=False) + '\n')
print({k: (v if k in ('base', 'diffFrom', 'slot', 'session', 'now', 'sliceRun', 'units', 'batches', 'done', 'flagged') else len(json.dumps(v))) for k, v in a.items()})
