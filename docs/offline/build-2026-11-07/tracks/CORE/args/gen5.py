"""CORE 10 (6c9dfc8f): the launch args for the CORE fix rounds by name after offline-v1.1 (R-H-37; V3 per R-O-5).
Each lane's worktree is fast-forwarded to BASE first (no merge commit); base and diffFrom are BASE, so the check (and on a
flagged lane the two reviewers) judge the round only.
Usage: python gen5.py "<now>" <lane> [BASE] -> args_low_<lane>.json beside this file."""
import json, sys, io, os
J = os.path.dirname(os.path.abspath(__file__))
D = os.path.dirname(os.path.dirname(os.path.dirname(J)))
NOW, LANE = sys.argv[1], sys.argv[2]
BASE = sys.argv[3] if len(sys.argv) > 3 else 'f69bc68a'
SESSION = '6c9dfc8f-25c9-4b86-802e-1c99fa025fca'
SLOT = {'core': 1, 'engine': 2, 'actions-sos': 3, 'learn': 9, 'tests-docs': 5}
GATE = ("Then on the worktree (it holds the whole trunk): npm run build, npm test (the full Node suite; 536/536 in 13 files at f69bc68) green by name, "
        "and gates.py browser (16/0/3 by name at f69bc68: no new failure, no new skip). Every Node test that meets the real store.js waits by "
        "condition, never a fixed settle (PBKDF2 at 310000 iterations). Each id: a test red before (log _logs/reports/" + LANE + "/" + LANE + "__<id>.red.log) "
        "and green after; one commit per id, the id in the subject.")
SPEC = {
 'core': {
  'prior_done': ['FIX-V11'],
  'batch': ['FIX-LOCKID', 'FIX-A11Y-N'],
  'notes': {
   'FIX-LOCKID': ("RS26 remainder (tracks/CORE/contracts/actions-sos.md lines 111 and 130). Store.status() gains lockId: an opaque string while a "
     "lock row exists, null when none; a NEW value whenever the lock row is created (set PIN), replaced (change PIN; replaceAll or import "
     "that writes a lock row, even one that carried an id; reset then set) or removed (remove PIN, erase: null); never derived from the PIN, "
     "salt or check (random bytes). Kept in the lock row itself, so it survives a reload unchanged and a "
     "second Store over the same storage (another tab) reads the new value after its load. Node memory mode the same. store.test.mjs: each "
     "transition changes it; unchanged across reload; null without a lock; no PIN, salt or check text inside it; a second store instance "
     "sees the change. No other Store API change; an old export without the field imports with a fresh id."),
   'FIX-A11Y-N': ("N1, N2, Q-a of tracks/CORE/contracts/core.md lines 117-119 (ui-core.js UI.form custom field focus, about :370-380). N1: "
     "role=group is written only on a plain div or span; a node with an implicit role (ul, ol, table, svg, fieldset and the rest) keeps it, "
     "still named by aria-labelledby. N2: a contenteditable node counts as a control: no tabindex -1, no role=group. Q-a: a native control "
     "(input, select, textarea, button) returned as the custom field's node gets aria-labelledby the field label's id when the page named "
     "it no other way. Tests in store.test.mjs's UI.form block, each red before."),
  },
  'prior': "The lane is MERGED at 8e80951 (FIX-V11; a3081f33). Its open LOWs N1, N2, Q-a and the RS26 remainder (Store.status().lockId) are this round.",
 },
 'actions-sos': {
  'prior_done': ['FIX-SAFETY-AS', 'FIX-ONB-EMO', 'FIX-R4', 'FIX-R5', 'FIX-R6', 'FIX-R7', 'FIX-R8'],
  'batch': ['FIX-LOCKID-MARK', 'FIX-USE-SKILL', 'FIX-RC22-RC23', 'FIX-RS22-AT-ONCE'],
  'notes': {
   'FIX-LOCKID-MARK': ("RS26 remainder (contracts/actions-sos.md lines 111, 130): the save's mark (RS22's retry) also holds Store.status().lockId "
     "behind a feature check (no lockId field: today's behaviour); a retry whose lockId changed is dropped, never retried. Test with a "
     "stand-in store whose status().lockId changes between the mark and the retry, and one without the field."),
   'FIX-USE-SKILL': ("Q4 of contracts/actions-sos.md line 175: a verb Actions.useSkill({skillId, helpful}) writes SkillUsed {skillId, helpful, "
     "logId: null} with no log; skillId must be a skill in Content (else the lane's validation error, nothing written); helpful in the one "
     "encoding of the engine contract; never writes in a preview or drill. Tests: written once, refused bad ids, engine counts it. Name the "
     "verb and its shape in your note (the chat tells game-tutorials, ui-tools.js :315)."),
   'FIX-RC22-RC23': ("RC22 (line 177): tests for the kept-session date in the feeling flow and the leave path. RC23 (line 172): a plan's status "
     "change is a flag for claimRow (keeps the sample mark), and plans.update writes BattlePlanCreated only for the person's own row."),
   'FIX-RS22-AT-ONCE': ("R8-RC1 (line 183), test-only: RS22's 'tried once more, at once' asserted by count, not order: count the refusal, wait "
     "for it, settle by condition, assert calls === 2 (the probe: _logs/reports/actions-sos/fr8probe/)."),
  },
  'prior': ("The lane is MERGED at 7d9d557 (e8da3fbd). This round: the RS26 mark (core's FIX-LOCKID: feature-checked, works with or without "
            "it), FIX-USE-SKILL, RC22, RC23, R8-RC1. No copy changes; no new phrase."),
 },
 'engine': {
  'prior_done': ['FIX-RS4', 'FIX-RS9E'],
  'batch': ['FIX-SPIRAL-OWN'],
  'notes': {
   'FIX-SPIRAL-OWN': ("contracts/actions-sos.md line 151 (RS35's engine side). spiralThoughts(view) returns [{thought, reply, stockReply}]: reply "
     "is the person's own words or '' (never a fill), stockReply the catalog slipSelfTalk line it used to fill with. The one consumer, "
     "ui-sos.js spiralPairs (:341-357), already reads reply as the person's words and supplies its own fallback, so SOS keeps working; prove "
     "it: node --test offline/tests/actions.test.mjs green by name. Tests in an engine test file: own reply kept, missing reply '' with "
     "stockReply set, strings and objects both."),
  },
  'prior': "The lane is MERGED at 84075b6 (3ea2e13d). This round: FIX-SPIRAL-OWN only.",
 },
 'learn': {
  'prior_done': ['FIX-RS4', 'FIX-RS9'],
  'batch': ['FIX-C3-C4'],
  'notes': {
   'FIX-C3-C4': ("C3 (tracks/CORE/lane-reports/learn.md line 78): the checkpoint finish toast says '+10 XP' only the first time a checkpoint "
     "is completed, as lessons do (ui-learn.js about :537 and :610); XP itself comes from the engine and never decreases. C4 (line 79): "
     "'Why this works' still opens its text when UI.sheet is absent (a short inline block under the button). C5 is commit provenance: no "
     "code. Tests in learn.test.mjs, each red before."),
  },
  'prior': "The lane is MERGED at 75eb8e5 (ce691c21). This round: C3 and C4 (C5 is provenance, no code).",
 },
}
s = SPEC[LANE]
L = json.load(io.open(os.path.join(D, 'tracks/HUB/workflows/lane_args.json'), encoding='utf-8'))['lanes'][LANE]
a = dict(L)
done = list(L['units']) + s['prior_done']
a['units'] = done + s['batch']
a['batches'] = [s['batch']]
a['unitTier'] = dict(L['unitTier'])
a['unitTier'].update({u: 1 for u in s['prior_done'] + s['batch']})
a['unitNotes'] = {u: s['notes'][u] for u in s['batch']}
a['done'] = done
a['base'] = BASE
a['diffFrom'] = BASE
a['slot'] = SLOT[LANE]
a['session'] = SESSION
a['now'] = NOW
a['start'] = 'build'
a['priorNote'] = s['prior'] + " CORE 10 fast-forwarded build/" + LANE + " to " + BASE + " (no merge commit; clean) before this run."
a['laneNote'] = ("CORE CHAT'S WORD (" + NOW + ", CORE 10, session " + SESSION + "): one fix round by name on the real code (worktree "
  "fast-forwarded to " + BASE + "; never merge or copy files in). Your lane's files only; a change another lane's file needs is a line in your "
  "note's requests. No new copy unless the note asks; unsure, the shorter version. No new dependency. Name each unit by its batch id in done. "
  "Trailers: 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' and 'Claude-Session: " + SESSION + "'; message from a file; add by path. "
  "One browser run at a time. " + GATE)
out = os.path.join(J, 'args_low_' + LANE + '.json')
json.dump(a, io.open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
print(out)
