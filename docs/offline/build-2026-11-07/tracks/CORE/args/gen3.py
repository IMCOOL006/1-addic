"""CORE 93bffdb7: the launch wrapper for actions-sos FIX-R7 (fix round by name of RS37R, RS38, RS36R, then the safety finder's re-check).
Usage: python gen3.py "<now from date>" -> wf_as_r7.js and args_as_r7.json beside this file."""
import json, sys, io, os
J = os.path.dirname(os.path.abspath(__file__))
NOW = sys.argv[1]
LANE_JS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/HUB/workflows/lane.js'
a = json.load(io.open(os.path.join(J, 'args_as_r6b.json'), encoding='utf-8'))
F = json.load(io.open(os.path.join(J, 'fix_r7_findings.json'), encoding='utf-8'))
EV = 'C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/actions-sos__review-safety.md (Round 7 and section FIX-R7)'
CT = 'tracks/CORE/contracts/actions-sos.md (rulings 22:25 and ' + NOW + ')'
a['now'] = NOW
a['units'] = a['units'] + ['FIX-R7']
a['done'] = [u for u in a['units'] if u != 'FIX-R7']
a['batches'] = a['batches'] + [['FIX-R7']]
a['unitTier']['FIX-R7'] = 1
a['unitNotes']['FIX-R7'] = ('One fix round by name: RS37R, RS38, RS36R (rulings in ' + CT + '; full text in ' + EV + '). '
                            'Done when each has a test red before and green after and its own commit naming FIX-R7 and the id.')
a['start'] = 'review'
a.pop('reviewOnly', None)
a.pop('knownFindings', None)
a['diffFrom'] = '00a5c08'
a['carried'] = {'check': {'verdict': 'PASS', 'tip': '00a5c08', 'findings': []},
                'review': [{'findings': [], 'questions': []}, {'findings': F, 'questions': []}]}
a['priorNote'] = ('Run wf_4b67e91f-df4 (CORE 93bffdb7, 22:09-22:49, the FIX-R6 safety re-check): RS-SAMPLE, RS33, Q-BUILTIN, Q-SPIRAL, RS9T re-checked FIXED; '
                  'new RS35 HIGH FIXED ed34fc8, RS37 PARTLY 1f4b61c (contacts only), RS36 PARTLY 00a5c08 (onboarding only), one LOW (RS38). '
                  'test GREEN 164/164 at 00a5c08 (_logs/gates/actions-sos/test-20261107-224221.log); guards the same 21 tour-target names as 87030e3, other lanes\'. '
                  'Worktree clean at 00a5c08. The full text of every finding: ' + EV + '.')
a['laneNote'] = (
    "Flagged: safety copy (SOS, crisis routing, slips, the lock screen's urgent help) and the person's data. Owns actions.js, ui-sos.js, ui-onboarding.js, actions.test.mjs.\n"
    "CORE CHAT'S WORD (" + NOW + ", CORE session 93bffdb7-4bab-4cfc-a69c-5f4a981d5968): this run is one fix round by name, FIX-R7, of RS37R, RS38 and RS36R only; "
    "the rest of the lane is fixed and re-checked. Read each finding's full text in " + EV + " before you fix it, and the rulings in " + CT + ". "
    "The trunk shapes to test against (by a stand-in object of that shape in the test, or the trunk's real file read by path from git show into _logs/scratch): "
    "content-sample.js and ui-workbook.js on build/offline-v1; never copy trunk files into the worktree, never merge the trunk. "
    "No new copy, no new phrase. Each id: a test red before (log _logs/reports/actions-sos/actions-sos__<id>.red.log), one commit naming FIX-R7 and the id. "
    "Node tests and gates.py only. Trailers: 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' and 'Claude-Session: 93bffdb7-4bab-4cfc-a69c-5f4a981d5968'; "
    "message from a file; git add by explicit path; never git worktree add/remove. In your note's done: each id with its SHA.")
js = ("export const meta = { name: 'as_r7', description: 'as_r7 (wraps lane.js; args inside; CORE 93bffdb7)', phases: [{ title: 'Review' }, { title: 'Report' }] }\n"
      "const A = %s\nreturn await workflow({ scriptPath: '%s' }, A)\n") % (json.dumps(a, ensure_ascii=False), LANE_JS)
io.open(os.path.join(J, 'wf_as_r7.js'), 'w', encoding='utf-8', newline='\n').write(js)
json.dump(a, io.open(os.path.join(J, 'args_as_r7.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
print('as_r7', len(js), 'B')
