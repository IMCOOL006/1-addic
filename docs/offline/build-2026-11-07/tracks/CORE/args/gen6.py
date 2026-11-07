"""V3 launch args for a CORE lane from lane_args_v3.json (CORE 11, 2026-11-08).
Usage: python gen6.py "<now from date>" <lane> <batches as JSON> <diffFrom> [priorNote-file] [base]
Writes args_v3_<lane>_<first unit>.json beside this file. done = the lane's v1 units and fix rounds + the V3 units before
the first batch given. sliceRun true when the first batch given is the lane's batches[0]."""
import io, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
V3 = os.path.join(HERE, '..', '..', 'HUB', 'workflows', 'lane_args_v3.json')
V1 = os.path.join(HERE, '..', '..', 'HUB', 'workflows', 'lane_args.json')
SESSION = 'c2601cf1-5557-49d0-a65e-b1eddd04b48d'
FIXES = {'tests-docs': ['FIX-TOURMARK'], 'core': ['FIX-V11'], 'actions-sos': ['FIX-R5', 'FIX-R6', 'FIX-R7', 'FIX-R8'],
         'engine': ['FIX-RS4', 'FIX-RS9E'], 'learn': ['FIX-RS4', 'FIX-RS9']}
now, lane, batches, diff = sys.argv[1], sys.argv[2], json.loads(sys.argv[3]), sys.argv[4]
prior = io.open(sys.argv[5], encoding='utf-8').read() if len(sys.argv) > 5 and sys.argv[5] != '-' else ''
base = sys.argv[6] if len(sys.argv) > 6 else 'f69bc68a'
a = json.load(io.open(V3, encoding='utf-8'))['lanes'][lane]
v1 = json.load(io.open(V1, encoding='utf-8'))['lanes'][lane]['units']
want = [u for b in batches for u in b]
before = []
for b in a['batches']:
    if any(u in want for u in b): break
    before += b
a['units'] = before + want
a['batches'] = ([before] if before else []) + batches
a['unitTier'] = {u: t for u, t in a['unitTier'].items() if u in a['units']}
NOTE_CAP = 500
def cap(u, n):
    if len(n) <= NOTE_CAP: return n
    cut = n[:NOTE_CAP].rsplit('. ', 1)[0] + '.'
    return cut + ' [The rest of this note: lane_args_v3.json lanes.' + lane + '.unitNotes["' + u + '"] and tracks/CORE/briefs/' + lane + '/' + u + '.md: read both before you build.]'
a['unitNotes'] = {u: cap(u, n) for u, n in a['unitNotes'].items() if u in want}
NOT_BUILT = {'tests-docs': ['U-36b']}
done = [u for u in v1 if u not in NOT_BUILT.get(lane, [])] + FIXES.get(lane, []) + before
a['done'] = list(dict.fromkeys(done))
a.update(base=base, session=SESSION, now=now, diffFrom=diff)
if os.environ.get('SLOT'): a['slot'] = int(os.environ['SLOT'])
if not before: a['sliceRun'] = True
if prior: a['priorNote'] = prior
a['laneNote'] = (a.get('laneNote', '') + " CORE 11's word (" + now + "): on the trunk's code (worktree at BASE; never merge or copy in); detail in the brief's '## V3' and tracks/CORE/briefs/" + lane +
    "/<unit>.md. A hook in another lane's file: never edit it; a request line in your note (lane, file:line, element, its attribute: data-test on SCREENS files, data-testid on ui-sos.js). "
    "No new dependency. Trailers 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' and 'Claude-Session: " + SESSION + "'; message from a file; add by path. "
    "One browser or screens run at a time. Under 4.0 GB free: stop at your next commit, say so.")
out = os.path.join(HERE, 'args_v3_%s_%s.json' % (lane, want[0]))
io.open(out, 'w', encoding='utf-8', newline='\n').write(json.dumps(a, indent=1, ensure_ascii=False) + '\n')
print(out, 'units', a['units'], 'batches', a['batches'], 'done', a['done'], 'sliceRun', a.get('sliceRun', False))
