"""CORE 16:19 (2026-11-14): the launch file of core FIX-BULK-REFUSAL-SAY + FIX-TAKEIN-SAY + FIX-STALE-SAVE-KEEP (after the tag offline-v3.3; R-H-61, R-H-62).
Usage: python mk_core_v34.py <base sha> <now>
Writes extra_core_FIX-BULK-REFUSAL-SAY.json and, through gen8.py, args_v3_core_FIX-BULK-REFUSAL-SAY.json, then trims its notes."""
import io, json, os, subprocess, sys
ARGS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/args'
BRIEFS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/briefs/core/'
SESSION = '45b995c7-ba6e-4a78-b5a2-4e87b3bce8a8'
base, now = sys.argv[1], sys.argv[2]
B8 = base[:8]
extra = os.path.join(ARGS, 'extra_core_FIX-BULK-REFUSAL-SAY.json')
N1 = ("FIX-BULK-REFUSAL-SAY (core, flagged; after the tag offline-v3.3; merge base " + B8 + "; R-H-61 (1)). A save refused inside Store.bulk() because another tab changed "
      "the notebook (Load sample data and every other bulk caller) is said with the page's own toast, without the stale flag: one wording for every refused save. "
      "Keep the refusal; give bulk's stale refusal the same flag and lock event as write()'s so ui-core says the one line and hushes the page's toast in the same turn. "
      "[The whole note, with the lines, the callers, the tests and the proof: " + BRIEFS + "FIX-BULK-REFUSAL-SAY.md: read it before you build.]")
N2 = ("FIX-TAKEIN-SAY (core, flagged; after the tag offline-v3.3; merge base " + B8 + "; R-H-61 (2)). takeIn's automatic write after an unlock can be refused in a race "
      "with another tab's lock change and is then called 'your last change' though nothing of the person's was lost. An automatic write's refusal is not said as the "
      "person's change; a person's own refused save keeps the one toast. "
      "[The whole note: " + BRIEFS + "FIX-TAKEIN-SAY.md: read it before you build.]")
N3 = ("FIX-STALE-SAVE-KEEP (core, flagged; after the tag offline-v3.3; merge base " + B8 + "; RS2 of R-C-95, R-H-61, R-H-62). The refused-save toast leaves after 4.5 s: "
      "a kept line says it until the person unlocks or leaves, never in SOS, in the shortest true words (a wording question goes to the owner with its default); "
      "plus one screen-reader pass (a real-Chrome probe and its log) over the refused-save toast, the kept line and FIX-SOS-FOCUS's focus move. "
      "[The whole note: " + BRIEFS + "FIX-STALE-SAVE-KEEP.md: read it before you build.]")
UNITS = ['FIX-BULK-REFUSAL-SAY', 'FIX-TAKEIN-SAY', 'FIX-STALE-SAVE-KEEP']
NOTES = dict(zip(UNITS, [N1, N2, N3]))
json.dump({u: {'tier': 1, 'note': n} for u, n in NOTES.items()}, io.open(extra, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
env = dict(os.environ, SESSION=SESSION, SLOT='1', EXTRA=extra)
print(subprocess.check_output(['python', os.path.join(ARGS, 'gen8.py'), now, 'core', json.dumps([UNITS]), base, '-', base,
                               '["V-11","V-46","V-16","V-17a","V-26a","FIX-IMPORT-MARK","FIX-STALE-SAVE-SAY","FIX-SOS-FOCUS"]'], env=env).decode())
p = os.path.join(ARGS, 'args_v3_core_FIX-BULK-REFUSAL-SAY.json')
a = json.load(io.open(p, encoding='utf-8'))
a['unitNotes'] = NOTES
a['files'] = FILES = json.loads(os.environ.get('FILES', '["offline/src/store.js", "offline/src/ui-core.js", "offline/src/styles.css", "offline/tests/store.test.mjs", "offline/1-addic.html"]'))
a['area'] = ("After the tag offline-v3.3, by name: one wording for every save refused because another tab changed the notebook (bulk writes too); an automatic write's "
             "refusal is not called the person's change; a kept line after a refused save; one screen-reader pass.")
a['laneNote'] = ("CORE 16:19's word (2026-11-14), after the tag offline-v3.3 by the HUB's grant (slot 1, R-H-62), under R-O-7. Flagged lane: encryption and the person's data; two reviewers before READY. "
                 "One batch of three units: name each by its id in done, one commit per unit at least. "
                 "'Claude-Session: " + SESSION + "' goes on every commit, whatever the Co-Authored-By line says. Message from a file, add by explicit path, never git add -A. "
                 "offline/1-addic.html is generated: never commit its rebuild. Never make a refused save succeed, retry it, or keep the entry anywhere new. "
                 "No clinical copy, no new public name, no new event type (stale and any automatic mark are fields on the existing lock event or error). "
                 "SOS is never interrupted: no toast, kept line, lock or redirect in SOS. Words: the shortest true ones at grade 6 to 8; a wording question goes to CORE as an OWNER QUESTION with the default you build. "
                 "A change in a file outside this lane's list is an outbox ask in your hand-off, not an edit. "
                 "One browser or screens run at a time. Under 4.0 GB free: stop at your next commit, say so.")
io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=1, ensure_ascii=False) + '\n')
print({k: (v if k in ('base', 'diffFrom', 'slot', 'session', 'now', 'sliceRun', 'units', 'batches', 'done', 'flagged', 'files') else len(json.dumps(v))) for k, v in a.items()})
