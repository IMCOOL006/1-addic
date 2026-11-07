"""CORE 60f08c84: build the launch wrappers (args inline) for actions-sos FIX-R6, learn FIX-RS9, engine FIX-RS9E.
Usage: python gen.py "<now from date>"  -> writes wf_as_r6.js, wf_learn_fix-rs9.js, wf_engine_fix-rs9e.js in this dir."""
import json, sys, io, os
J = os.path.dirname(os.path.abspath(__file__))
NOW = sys.argv[1]
OLD = '06285082-1542-4c84-9b2f-a2d27df214fe'
NEW = '60f08c84-298d-4afc-9321-e70539a6534c'
LANE_JS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/HUB/workflows/lane.js'


def rd(p):
    return json.load(io.open(os.path.join(J, p), encoding='utf-8'))


def restamp(a):
    s = json.dumps(a, ensure_ascii=False).replace(OLD, NEW)
    a = json.loads(s)
    a['session'] = NEW
    a['now'] = NOW
    return a


def wrap(name, a, phases):
    js = ("export const meta = { name: '%s', description: '%s (wraps lane.js; args inside; CORE 60f08c84)', phases: [%s] }\n"
          "const A = %s\nreturn await workflow({ scriptPath: '%s' }, A)\n") % (
        name, name, ', '.join("{ title: '%s' }" % p for p in phases), json.dumps(a, ensure_ascii=False), LANE_JS)
    io.open(os.path.join(J, 'wf_' + name + '.js'), 'w', encoding='utf-8', newline='\n').write(js)
    json.dump(a, io.open(os.path.join(J, 'args_' + name + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(name, len(js), 'B')


# ---- actions-sos FIX-R6 ----
a = rd('args_as_r5.json')
EV = 'C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/actions-sos__review-safety.md (Round 6)'
CT = 'tracks/CORE/contracts/actions-sos.md (sections 17:22 and 17:57)'
a['units'] = a['units'] + ['FIX-R3', 'FIX-R4', 'FIX-R5', 'FIX-R6']
a['done'] = list(a['units'][:-1])
a['batches'] = a['batches'] + [['FIX-R6']]
for u in ('FIX-R3', 'FIX-R4', 'FIX-R5', 'FIX-R6'):
    a['unitTier'][u] = 1
a['unitNotes']['FIX-R6'] = ('One fix round by name: RS-SAMPLE, RS33, Q-BUILTIN, Q-SPIRAL, RS9T (the rulings in ' + CT + '). '
                            'Done when each has a test red before and green after and its own commit naming FIX-R6 and the id.')
a['diffFrom'] = '1cfc936'
a['start'] = 'review'
a['priorNote'] = ('Run wf_fa0d78f5-b07 (FIX-R5, 17:10-17:57): RS24 7c21ffd, RS29 27b4f3b, RS30 46083fe, RS31 0a7fe20, RS32 5585c65, '
                  'RS22T 1cfc936, each FIXED on the safety re-check; test GREEN 156/156 (_logs/gates/actions-sos/test-20261107-174638.log). '
                  'Worktree clean at 1cfc936. The re-check raised RS33 (a regression of 27b4f3b), RS34 (LOW, offline-v1.1) and two questions, ruled.')
a['laneNote'] = (
    "Flagged: safety copy (SOS, crisis routing, slips, the lock screen's urgent help) and the person's data. Owns actions.js, ui-sos.js, ui-onboarding.js, actions.test.mjs.\n"
    "CORE CHAT'S WORD (" + NOW + ", CORE session " + NEW + "): this run is one fix round by name, FIX-R6, of RS-SAMPLE, RS33, Q-BUILTIN, Q-SPIRAL and RS9T only; "
    "the rest of the lane is fixed and re-checked; RS26's remainder and RS34 are offline-v1.1 by name, not this round. "
    "Rulings: " + CT + "; the re-checker's text: " + EV + ". "
    "The trunk content shape (git show 42d2467d:offline/src/content-core.js, the resources section near lines 425-470, and the trunk's Content.sample: "
    "git grep -n 'sample' 42d2467d -- offline/src/content-*.js) is the one to test against, by a stand-in object of that shape in the test; "
    "never copy trunk files into the worktree, never merge the trunk. "
    "The phrase lists are closed: no new phrase in this round. Each id: a test red before (log _logs/reports/actions-sos/actions-sos__<id>.red.log), "
    "one commit naming FIX-R6 and the id. Crisis copy short, clinicalReview: true. Node tests and gates.py only. "
    "Trailers: 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' and 'Claude-Session: " + NEW + "'; message from a file; "
    "git add by explicit path; never git worktree add/remove. In your note's done: each id with its SHA.")
DATA_EV = 'R-H-27 (coordination/outbox-HUB.md), R-S-9; ' + CT


def F(i, sev, unit, where, scen, fix):
    return {'id': i, 'severity': sev, 'unit': unit, 'where': where, 'scenario': scen,
            'evidence': DATA_EV if i in ('RS-SAMPLE', 'RS9T') else EV, 'fix': fix}


a['carried'] = {'check': {'verdict': 'PASS', 'tip': '1cfc936', 'findings': []}, 'review': [{'findings': [], 'questions': []}, {'findings': [
    F('RS-SAMPLE', 'MEDIUM', 'U-09', 'offline/src/actions.js (loadSample, eraseSample)',
      "An onboarded person taps Load sample data: loadSample writes the sample's profile 'me' and settings 'app' over their own rows; "
      "eraseSample then deletes them, so their own profile and settings are gone. A condition of the offline-v1.1 tag.",
      "loadSample skips profile 'me' and settings 'app' when a row without sample: true exists (the rest of the sample loads, marked sample: true); "
      "eraseSample removes only rows with sample: true. Tests: an onboarded profile and settings survive loadSample then eraseSample unchanged (deep-equal); "
      "a fresh store still gets the sample profile and settings, and eraseSample removes them."),
    F('RS33', 'MEDIUM', 'U-10', 'offline/src/ui-sos.js urgentView (about :538-542) and leadView (about :515-523)',
      "Since 27b4f3b a line with a tel no longer draws its note: for a person who chose Somewhere else, the trunk line 'Your local emergency number' "
      "(tel 112, note 'Usually 112, 911 or 999') reads only '112 · please verify' on Urgent help, the crisis view, the lock screen's list and the lead.",
      "Every urgent line draws its note (a short muted label) whenever it has one, with or without a tel, in urgentView (all modes, UI.sosUrgentView included) "
      "and in leadView. Test on the trunk shape: the Elsewhere section and the intl lead contain 'Usually 112, 911 or 999' beside a tel:112 link."),
    F('Q-BUILTIN', 'MEDIUM', 'U-10', 'offline/src/ui-sos.js urgentList (about :167-181)',
      "With Content.resources empty or unreadable, the full urgent view (#/sos/urgent, the crisis view, UI.sosUrgentView on the lock screen) shows no number "
      "at all, while the lead's 'All urgent help' link points there (the RS24 class).",
      "Ruled yes: urgentList falls back to the built-in 'Emergency 112' entry with 'Please check this number.' (the one the lead uses; one constant for both) "
      "when Content gives no section with items, so the full urgent view, the crisis view and the lock screen's list always show at least one tel: link. "
      "A test with empty Content.resources for each of the three."),
    F('Q-SPIRAL', 'LOW', 'U-10', "offline/src/ui-sos.js spiralPairs (about :324, RS9's filter)",
      "RS32's wider CRISIS list feeds RS9's filter, which runs before the person's own reply is read: the person's own spiral thoughts "
      "('I can't do this anymore') drop out of the slip flow even when they wrote their own reply.",
      "Ruled: the filter drops a crisis or hopeless thought only when it would get a stock reply; a thought the person answered with their own reply keeps "
      "its pair (their own words). Tests: a crisis thought with an own reply keeps its pair; one without still never gets a stock reply."),
    F('RS9T', 'MEDIUM', 'U-09', "offline/tests/actions.test.mjs 'validation failures write nothing' (about :304)",
      "Baselined red on the trunk since content U-33 added Content.sample: the refusal case assumes no sample.",
      "Test-only: the refusal case uses a stub Content without sample, so the test passes with and without Content.sample (prove both: on the branch, and "
      "against the trunk 42d2467d's content by git archive into a new folder under C:/Users/ruchi/1-addic-wt/_logs/scratch/as-r6/ with the fixed test file "
      "copied over, node --test; log _logs/reports/actions-sos/actions-sos__RS9T.trunk.log)."),
], 'questions': []}]}
a = restamp(a)
wrap('as_r6', a, ['Review', 'Report'])

# ---- learn FIX-RS9, engine FIX-RS9E: the 06285082 args, restamped ----
for name, f in (('learn_fix-rs9', 'args_learn_fix-rs9.json'), ('engine_fix-rs9e', 'args_engine_fix-rs9e.json')):
    b = restamp(rd(f))
    b['laneNote'] = b['laneNote'].replace('CORE 06285082', 'CORE 60f08c84')
    wrap(name, b, ['Build', 'Check', 'Report'])
