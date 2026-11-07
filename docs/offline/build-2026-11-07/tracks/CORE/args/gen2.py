"""CORE 93bffdb7: launch wrappers for actions-sos FIX-R6 safety re-check and engine FIX-RS9E (finish and check).
Usage: python gen2.py "<now from date>" -> writes wf_as_r6b.js, wf_engine_rs9e2.js and their args_*.json beside this file."""
import json, sys, io, os
J = os.path.dirname(os.path.abspath(__file__))
SRC = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/args'
NOW = sys.argv[1]
OLD = '60f08c84-298d-4afc-9321-e70539a6534c'
NEW = '93bffdb7-4bab-4cfc-a69c-5f4a981d5968'
LANE_JS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/HUB/workflows/lane.js'

def rd(p):
    return json.load(io.open(os.path.join(SRC, p), encoding='utf-8'))

def restamp(a):
    a = json.loads(json.dumps(a, ensure_ascii=False).replace(OLD, NEW))
    a['session'] = NEW
    a['now'] = NOW
    return a

def wrap(name, a, phases):
    js = ("export const meta = { name: '%s', description: '%s (wraps lane.js; args inside; CORE 93bffdb7)', phases: [%s] }\n"
          "const A = %s\nreturn await workflow({ scriptPath: '%s' }, A)\n") % (
        name, name, ', '.join("{ title: '%s' }" % p for p in phases), json.dumps(a, ensure_ascii=False), LANE_JS)
    io.open(os.path.join(J, 'wf_' + name + '.js'), 'w', encoding='utf-8', newline='\n').write(js)
    json.dump(a, io.open(os.path.join(J, 'args_' + name + '.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(name, len(js), 'B; knownFindings', len(a.get('knownFindings', '')), 'chars')

# ---- actions-sos FIX-R6: the safety re-check only (the five fixes committed 42f5a9a..87030e3) ----
a = restamp(rd('args_as_r6.json'))
a['start'] = 'review'
a['reviewOnly'] = ['safety']
a['carried'] = {'check': {'verdict': 'PASS', 'tip': '87030e3', 'findings': []}}
a['diffFrom'] = '1cfc936'
a['done'] = [u for u in a['units'] if u != 'FIX-R6']
a['knownFindings'] = (
    "THIS ROUND (FIX-R6, commits 1cfc936..87030e3) fixed five findings of your lens's Round 6 (C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/actions-sos__review-safety.md). "
    "RE-CHECK EACH FIRST (git show the SHA; run its test through the gates script): "
    "RS-SAMPLE 42f5a9a (loadSample never writes over an own profile 'me' or settings 'app'; eraseSample removes only rows marked sample: true; onboard, settings.patch and markTipShown write a fresh unmarked row over a sample row); "
    "RS33 f429ce7 (every urgent line draws its short note with or without a tel, in urgentView in all modes and in leadView); "
    "Q-BUILTIN ff38655 (urgentList falls back to the built-in Emergency 112 with 'Please check this number.' when Content gives no section with items or only links, so the full urgent view, the crisis view and the lock screen's list always show a tel: link); "
    "Q-SPIRAL 934b85a (the crisis filter drops a thought only when it would get a stock reply; a thought with the person's own reply keeps its pair); "
    "RS9T 87030e3 (test-only: the refusal case reads a stub Content without sample). "
    "An incomplete fix, or a regression one of them introduced, is a new finding with its own id. Then judge the rest of the lane as your lens asks. "
    "CLOSED, not findings: the phrase lists (no new phrase this round; RS34's overdose wordings and RS26's lock identity are offline-v1.1 by name); "
    "the note copy in the crisis view (ruled by the CORE chat " + NOW + ": each number keeps its one short muted note, e.g. 'Usually 112, 911 or 999', because without it a number is not usable; nothing else is added); "
    "the earlier rulings in tracks/CORE/contracts/actions-sos.md.")
fx = rd('as_r6_fixnote.json')
a['priorNote'] = ('Run wf_45f788de-56d (FIX-R6, CORE 60f08c84, 19:07-19:10, stopped at the owner\'s park during the safety re-check; the fix agent had returned): '
                  + ', '.join(d['unit'] + ' ' + d['shas'][0] for d in fx['done']) +
                  '; test GREEN 161/161 at 87030e3 (_logs/gates/actions-sos/test-20261107-185750.log); guards: the same 21 tour-target names as 1cfc936, other lanes\', no new name; '
                  'build and validate SKIP in the worktree (no build.mjs or engine.js there). Worktree clean at 87030e3, pushed. '
                  'The fixer\'s note: C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/CORE/args/as_r6_fixnote.json. '
                  'This run (CORE 93bffdb7) is the safety re-check of FIX-R6 that the park stopped.')
a['laneNote'] = a['laneNote'].replace('this run is one fix round by name, FIX-R6, of RS-SAMPLE, RS33, Q-BUILTIN, Q-SPIRAL and RS9T only',
                                      'this run is the safety re-check of FIX-R6 (RS-SAMPLE, RS33, Q-BUILTIN, Q-SPIRAL, RS9T, committed 42f5a9a..87030e3); a fix round, if the re-check asks for one, fixes only what it names')
a['laneNote'] = a['laneNote'].replace('2026-11-07 19:07 IST', NOW)
wrap('as_r6b', a, ['Review', 'Report'])

# ---- engine FIX-RS9E: finish over the wip a927cac and check ----
b = restamp(rd('args_engine_fix-rs9e.json'))
b['laneNote'] = b['laneNote'].replace('2026-11-07 17:22 IST, CORE 60f08c84', NOW + ', CORE 93bffdb7')
b['priorNote'] = ('The lane is MERGED at 57153d3. FIX-RS9E only. Run wf_5b1d1a90-01f (CORE 60f08c84, 19:07-19:10) was stopped at the owner\'s park during its builder; '
                  'its work is committed as wip a927cac: engine.js reads x.item in recoveryPlanPrefill and ownWarningPlans; offline/tests/engine-warning-item.test.mjs is new; '
                  'neither checked nor proven red-before. Finish it: read a927cac (git show), prove the test red against 57153d3\'s engine.js (log C:/Users/ruchi/1-addic-wt/_logs/reports/engine/engine__FIX-RS9E.red.log), '
                  'green on the fix, run the gates, and commit over the wip with a message \'fix(engine, FIX-RS9E): ...\' (never amend or rewrite the pushed wip). In your note\'s done, name the unit FIX-RS9E.')
b['diffFrom'] = '57153d3'
wrap('engine_rs9e2', b, ['Build', 'Check', 'Report'])
