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
  'batches': [['V3-11'], ['V3-17', 'V3-16']],
  'tiers': {'V3-11': 1, 'V3-17': 2, 'V3-16': 2},
  'notes': {
   'V3-11': ("V3-IMPROVEMENTS.md V3-11 (tier 1, crisis copy, flagged): shell.html's <main id=main> holds, before boot, one static line "
     "'If you are in danger, call your local emergency number.' (boot.js COPY.none's words, no new phrase), marked for the clinical review "
     "by an HTML comment; the first render replaces it; boot.js's failure block replaces it too, never shows both. A Node test over the "
     "built file: the line is inside #main and nowhere else; the CSP and the guards stay green."),
   'V3-17': ("V3-17, RS26 remainder (contracts/actions-sos.md lines 111, 130). Store.status() gains lockId: an opaque string while a lock "
     "row exists, null when none; a NEW value whenever the lock row is created (set PIN), replaced (change PIN; replaceAll or import "
     "that writes a lock row, even one that carried an id; reset then set) or removed (remove PIN, erase: null); never derived from the PIN, "
     "salt or check (random bytes). Kept in the lock row, so a reload keeps it and a second Store over the same storage (another tab) reads "
     "the new value after its load; Node memory mode the same. store.test.mjs: each transition changes it; unchanged across reload; null "
     "without a lock; no PIN, salt or check inside it; a second instance sees the change. No other Store API change; an old export without "
     "the field imports with a fresh id."),
   'V3-16': ("V3-16: N1, N2, Q-a of contracts/core.md lines 117-119 (ui-core.js UI.form custom field focus, about :370-380). N1: role=group "
     "only on a plain div or span; a node with an implicit role (ul, ol, table, svg, fieldset ...) keeps it, still named by "
     "aria-labelledby. N2: a contenteditable node counts as a control (no tabindex -1, no role=group). Q-a: a native control returned as the "
     "node gets aria-labelledby the field label's id when the page named it no other way. Tests in store.test.mjs's UI.form block."),
  },
  'prior': "The lane is MERGED at 8e80951 (FIX-V11; a3081f33). This round: V3-11 (tier 1), then V3-17 and V3-16 (tier 2).",
 },
 'actions-sos': {
  'prior_done': ['FIX-SAFETY-AS', 'FIX-ONB-EMO', 'FIX-R4', 'FIX-R5', 'FIX-R6', 'FIX-R7', 'FIX-R8'],
  'batches': [['V3-08', 'V3-SOS10'], ['V3-17M', 'V3-18', 'V3-25']],
  'tiers': {'V3-08': 1, 'V3-SOS10': 1, 'V3-17M': 2, 'V3-18': 2, 'V3-25': 2},
  'notes': {
   'V3-08': ("V3-08 (tier 1; contracts/actions-sos.md line 175): Actions.useSkill({skillId, helpful}) writes SkillUsed {skillId, helpful, "
     "logId: null} with no log; skillId must be a skill in Content (else the lane's validation error, nothing written); helpful in the "
     "engine contract's one encoding; nothing in a preview or drill. Tests: written once, bad ids refused, the engine counts it. Name the "
     "verb and shape in your note (game-tutorials calls it from ui-tools.js :315)."),
   'V3-SOS10': ("At 390 px the SOS craving rating's '10' button wraps, '1' over '0' (offline/docs/images/sos-craving-phone.png on "
     "build/tests-docs dfc2703, U-35): every rating button keeps its number on one line at 390 px with its 44 px target (nowrap and a width "
     "that fits two digits; ui-sos.js or actions-sos's own styles.css section). Prove it with a browser screenshot at 390 px, named in the note."),
   'V3-17M': ("V3-17 actions-sos side (lines 111, 130): the save's mark (RS22's retry) also holds Store.status().lockId behind a feature "
     "check (no lockId field: today's behaviour); a retry whose lockId changed is dropped, never retried. Test with a stand-in store whose "
     "lockId changes between mark and retry, and one without the field."),
   'V3-18': ("V3-18: RC23 (line 172: a plan's status change keeps the sample mark, a flag for claimRow; plans.update writes "
     "BattlePlanCreated only for the person's row); RC22 (line 177: tests of the kept-session date in the feeling flow and the leave path); "
     "R8-RC1 (line 183, test-only: RS22's retry asserted by count, calls === 2, settle by condition)."),
   'V3-25': ("V3-25: while unlock derives the key, the lock form shows an aria-live line 'Opening your notebook' (the set-PIN form's 'One "
     "moment' pattern, ui-onboarding.js :41 and :240-252), cleared on success or error; the urgent-help link stays usable. Test it."),
  },
  'prior': "The lane is MERGED at 7d9d557 (e8da3fbd). This round: V3-08 and V3-SOS10 (tier 1), then V3-17M, V3-18, V3-25 (tier 2).",
 },
 'engine': {
  'prior_done': ['FIX-RS4', 'FIX-RS9E'],
  'batches': [['V3-19']],
  'tiers': {'V3-19': 2},
  'notes': {
   'V3-19': ("V3-19, FIX-SPIRAL-OWN (contracts/actions-sos.md line 151, re-ruled by CORE 10 to the additive form): each pair of "
     "spiralThoughts(view) gains own: true when its reply is the person's own words, false when it was filled from catalogs.slipSelfTalk "
     "(engine.js about :719-729); thought and reply unchanged. The consumer ui-sos.js spiralPairs (:341-357) keeps working unchanged: prove "
     "it with node --test offline/tests/actions.test.mjs. Tests: own reply, filled reply, strings and objects, the pickTexts path."),
  },
  'prior': "The lane is MERGED at 84075b6 (3ea2e13d). This round: V3-19 only.",
 },
 'learn': {
  'prior_done': ['FIX-RS4', 'FIX-RS9'],
  'batches': [['V3-20']],
  'tiers': {'V3-20': 2},
  'notes': {
   'V3-20': ("V3-20, C3 (lane-reports/learn.md line 78): the checkpoint finish says '+10 XP' only the first time that module's checkpoint "
     "is completed (CheckpointCompleted earns once per module, engine.js :181), as lessons do (ui-learn.js about :537 and :610). C4 and C5 "
     "need no code (C4 cannot happen on the trunk; C5 is provenance). A test in learn.test.mjs, red before."),
  },
  'prior': "The lane is MERGED at 75eb8e5 (ce691c21). This round: V3-20 only.",
 },
}
s = SPEC[LANE]
L = json.load(io.open(os.path.join(D, 'tracks/HUB/workflows/lane_args.json'), encoding='utf-8'))['lanes'][LANE]
a = dict(L)
done = list(L['units']) + s['prior_done']
flat = [u for b in s['batches'] for u in b]
a['units'] = done + flat
a['batches'] = s['batches']
a['unitTier'] = dict(L['unitTier'])
a['unitTier'].update({u: 1 for u in s['prior_done']})
a['unitTier'].update(s['tiers'])
a['unitNotes'] = {u: s['notes'][u] for u in flat}
a['done'] = done
a['base'] = BASE
a['diffFrom'] = BASE
a['slot'] = SLOT[LANE]
a['session'] = SESSION
a['now'] = NOW
a['start'] = 'build'
a['priorNote'] = s['prior'] + " CORE 10 fast-forwarded build/" + LANE + " to " + BASE + " (no merge commit; clean) before this run."
a['laneNote'] = ("CORE CHAT'S WORD (" + NOW + ", CORE 10, session " + SESSION + "): the V3 round by name (V3-IMPROVEMENTS.md in the program docs) on the real code (worktree "
  "fast-forwarded to " + BASE + "; never merge or copy files in). Your lane's files only; a change another lane's file needs is a line in your "
  "note's requests. No new copy unless the note asks; unsure, the shorter version. No new dependency. Name each unit by its batch id in done. "
  "Trailers: 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' and 'Claude-Session: " + SESSION + "'; message from a file; add by path. "
  "One browser run at a time. " + GATE)
out = os.path.join(J, 'args_low_' + LANE + '.json')
json.dump(a, io.open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
print(out)
