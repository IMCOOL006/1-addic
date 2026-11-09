export const meta = {
  name: '1-addic-actions-sos-end-fix2',
  description: 'Second fix round of the actions-sos whole-lane review: the SOS button defect the first round brought in, by name, then both lenses and the gates with a real-browser probe',
  phases: [
    { title: 'Fix', detail: 'one flagged builder fixes the named findings, a commit per finding' },
    { title: 'Recheck', detail: 'both lenses attack the fix at the new tip; the lane-checker runs the gates, the full Node suite and a real-Chrome probe' },
  ],
}

// CORE 17, 2026-11-09. wf_lane_end_review.js round 1 (wf_4d2ab8ba-606) returned RED at 4376554: its EC1 fix held the route on #/sos and so killed the header SOS link.
const A = args || {}
const WT = 'C:/Users/ruchi/1-addic-wt/actions-sos', TIP = A.tip || '4376554', SESSION = A.session || '(none)', NOW = A.now || '(no stamp)'
const DOCS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07'
const SCR = 'C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/end-review'
const GATES = DOCS + '/tools/gates.py'
const FILES = 'offline/src/ui-onboarding.js, offline/src/ui-sos.js, offline/tests/actions.test.mjs'

const FINDINGS = `- F1 (ids ECR1 = ESR1 = the checker's HIGH; brought in by 2898cd8; rule: SOS never gated or interrupted, BUILD-PLAN.md section 2; store.test.mjs:269 'the SOS button stays on the lock screen'): offline/src/ui-onboarding.js:272 holds the route with setRoute('#/sos') while the SOBER practice is open on the lock page. The header SOS button is a plain link to #/sos (shell.html:14, ui-core.js:26); the page draws only on hashchange (ui-core.js:997); a link to the hash already in the address fires none; replaceState paints no chrome, so the button stays visible (ui-core.js:719). A tap changes nothing. Real Chrome at 390 px, locked notebook, lock-sober tapped, then #sos-btn tapped: at 84ba534 hash #/lock then #/sos, h1 ['SOS'], the lock page gone; at 4376554 hash #/sos before and after, h1 ['Ride the wave','Locked'], the lock page still there. FIX, tried by both reviewers on an export: hold the practice on L.sober.href (#/sos/craving), a route that differs from the button's target and is the page the lock screen's own fallback link opens (ui-onboarding.js:275); a reload lands in the same flow. Correct the EC1 comment at :246-247. REGRESSION TEST, named 'ESR1: the header SOS button opens the SOS page from the practice on the lock page (the real router)': real ui-core over the stand-in DOM, with a tap that fires hashchange only when the hash changes, as a browser does (a.tap at actions.test.mjs:3796 fires it always, which is why the EC1 tests missed this; change that only for this test or add an option, the other tests keep their behaviour). It must fail at 4376554 (prove it) and pass after the fix. Reviewers' probes to reuse: ${SCR}/tree-safety-r1/offline/tests/actions.test.mjs (PROBE-ESR1, PROBE-ESR2) and ${SCR}/tree-contracts-r1.
- F2 (ids ECR2 = ESR2, LOW, brought in by 2898cd8): the key arrives with the practice open, so ui-core paints the chrome as SOS and hides #sos-btn; the idle auto-lock fires or another tab locks; Done (closePractice, :249-253) goes back to #/lock with no redraw, so the lock screen has no SOS button and data-route stays 'sos' until the next chrome paint. FIX: in closePractice's locked branch, put the chrome back for the lock route WITHOUT redrawing the page (a PIN being checked must go on). Candidates: safe(() => UI.applyDiscreet(isDiscreet()), null), which runs chrome(pageKey(route()), v) (ui-core.js:678-683: read it first and confirm it leaves the page alone), or a guarded #sos-btn hidden = false plus data-route = 'lock' in the lane's file. TEST, named 'ESR2: Done back on the lock page shows the SOS button again (the real router)', failing at 4376554.
- F3 (ES3's leftover, comment only, no test): offline/src/ui-sos.js:484's comment says 'never written into this one'; since :466-471 names the case where a kept save IS written into a notebook another tab imported, reword :484 to agree. CORE's ruling on ES3: accepted for offline-v3.1 and named for offline-v3.2 as a core unit; no behaviour change and no store.js change in this round.`

const ATTACK = `This is the second round because the first round's fix brought in a defect that its tests could not see. Attack the fix, do not only confirm it: the header SOS button in every state of the practice (locked, key being made, key arrived, unlocked); the Back button and a reload while the practice is held on #/sos/craving; a hashchange arriving while held; Done and its two branches; the chrome (SOS button, data-route) on each return to #/lock; a PIN being checked going on through all of it; the discreet labels; whether ui-core redraws #/sos/craving when the notebook opens (it must not take the practice away); whether a test's stand-in hides a difference from a real browser.`

const READ = tip => `READ ONLY, THROUGH GIT: never edit a file in ${WT}. Read with git -C ${WT} show ${tip}:<path>. To prove anything by a test, export the tree: mkdir -p ${SCR}/<your folder> && git -C ${WT} archive ${tip} offline package.json | tar -x -C ${SCR}/<your folder>, then node --test there. Write nothing anywhere but under ${SCR}/. Never push, merge, rebase, stash, checkout, or touch another worktree or C:/Users/ruchi/1-addic.`

const FIX_SCHEMA = { type: 'object', properties: { results: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, state: { type: 'string', enum: ['FIXED', 'NOT-FIXED'] }, sha: { type: 'string' }, test: { type: 'string' }, why: { type: 'string' } }, required: ['id', 'state'] } }, tip: { type: 'string' }, testsRun: { type: 'string' }, requests: { type: 'array', items: { type: 'string' } } }, required: ['results', 'tip', 'testsRun'] }
const FINDING = { type: 'object', properties: { id: { type: 'string' }, severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW'] }, where: { type: 'string' }, scenario: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } }, required: ['id', 'severity', 'where', 'scenario', 'evidence', 'fix'] }
const RECHECK_SCHEMA = { type: 'object', properties: { results: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, state: { type: 'string', enum: ['FIXED', 'NOT-FIXED', 'PARTIAL'] }, evidence: { type: 'string' } }, required: ['id', 'state', 'evidence'] } }, newFindings: { type: 'array', items: FINDING }, tip: { type: 'string' } }, required: ['results', 'newFindings'] }
const GATES_SCHEMA = { type: 'object', properties: { verdict: { type: 'string', enum: ['PASS', 'FIX'] }, gates: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, verdict: { type: 'string' }, counts: { type: 'string' }, log: { type: 'string' }, fails: { type: 'string' } }, required: ['name', 'verdict', 'log'] } }, probe: { type: 'string' }, fullNode: { type: 'string' }, territory: { type: 'string' }, findings: { type: 'array', items: { type: 'string' } }, tip: { type: 'string' } }, required: ['verdict', 'gates', 'probe', 'fullNode', 'territory'] }

phase('Fix')
const fix = await agent(`You are the fix builder of the flagged lane actions-sos of the 1-addic offline edition build (build chat CORE, ${NOW}), round 2 of the whole-lane review. Worktree ${WT}, branch build/actions-sos. First: git -C ${WT} status must be clean (an M on offline/1-addic.html alone is the build's output: git -C ${WT} checkout -- offline/1-addic.html) and HEAD must be ${TIP}; if not, stop and say so.

THE FINDINGS TO FIX, each confirmed in round 1's re-check:
${FINDINGS}

NOT in this round: ES2, EC3 and any other LOW. Nothing but these three. Round 1's fix brought in F1, so keep this the shortest change that closes each finding, and think about what your change does to the SOS button, Back and reload before you commit.

How: one commit per finding, message 'fix(offline, actions-sos <id>): <what changed for the person>' written to a file and committed with git commit -F; git add by explicit path, never -A; never commit offline/1-addic.html. Every commit message ends with the line 'Claude-Session: ${SESSION}' (PLAN.md section 6 requires it on every commit, whatever the Co-Authored-By line says). Only these files: ${FILES}. A fix that needs another lane's file is a request line in your result, not an edit. A finding you judge wrong after reading the code: NOT-FIXED with the lines that show why. After the fixes: node --test offline/tests/actions.test.mjs and node offline/build.mjs, then git checkout -- offline/1-addic.html. Never push, merge, rebase, stash or touch another worktree or C:/Users/ruchi/1-addic.

BUDGET: 60 tool steps; commit each fix as it is done, so a cut-off loses nothing. Return per finding FIXED with its SHA and the test's name (ids F1, F2, F3), or NOT-FIXED with why; the tip; the tests you ran with their pass and fail counts; requests for other lanes.`, { label: 'fix2:actions-sos', phase: 'Fix', agentType: 'lane-builder-flagged', schema: FIX_SCHEMA })
if (!fix) { log('the fix builder returned nothing: read git log'); return { state: 'RED', why: 'no fix result' } }

phase('Recheck')
const RESULTS = JSON.stringify(fix.results || []).slice(0, 4000)
const lens = (who, key, focus) => agent(`You are ${who} of the flagged lane actions-sos of the 1-addic offline edition build, re-checking round 2 of the whole-lane review at the new tip ${fix.tip} (the round's commits: git -C ${WT} log --oneline ${TIP}..${fix.tip}). Your focus: ${focus}.

THE FINDINGS:
${FINDINGS}

THE FIX RESULTS: ${RESULTS}

For each of F1, F2, F3: FIXED when the scenario can no longer happen and the named test fails without the fix (say how you know: revert on an exported tree); PARTIAL or NOT-FIXED otherwise. ${ATTACK} A defect the fix brought in is a new finding (ids ${key}1, ...), with file:line and proof; a hunch is not a finding. The severity scale: BLOCKER (data loss, SOS gated or broken), HIGH (a contract broken, a BUILD-PLAN section 2 rule broken), MEDIUM (a real defect with a narrow trigger), LOW (polish).

${READ(fix.tip)}

BUDGET: about 35 tool calls (hard cap 80; an agent cut off returns nothing). Return the results by id, the new findings (usually none) and the tip you judged.`, { label: 'recheck2:' + key, phase: 'Recheck', agentType: 'lane-reviewer', schema: RECHECK_SCHEMA })

const out = await parallel([
  () => lens('the contracts-and-tests reviewer', 'EF', 'the router, the tests and the contracts: does each test exercise the real rule, could it pass with the defect'),
  () => lens('the safety-copy, privacy and data reviewer', 'SF', 'SOS never gated or interrupted, urgent help one tap away, the person in a craving on the lock screen'),
  () => agent(`You are the independent checker of round 2 of the fix rounds of the flagged lane actions-sos of the 1-addic offline edition build. The commits are ${TIP}..${fix.tip} in ${WT}. Do these in order, reading the QUIET: line of ${DOCS}/coordination/status-HUB.md before any browser run and waiting while it says running:
1. python ${GATES} --wt ${WT} --lane actions-sos build test validate guards (Bash timeout 600000; read each GATE line and cite its log= path; judge every failure BY NAME).
2. The full Node suite: in ${WT}, npm test; report tests, pass, fail by file for any failure (tests-docs' count on the trunk was 723; round 1's tip had 740).
3. The browser gate on a fresh build: node offline/build.mjs in ${WT}, then WITHOUT restoring the file: python ${GATES} --wt ${WT} --lane actions-sos --grep "SOS" browser. A run against the committed offline/1-addic.html is VOID (it does not hold the fixes); say which build the run used.
4. A real-Chrome probe at 390 px on that fresh build, offline, in a scratch folder under ${SCR}/probe-fix2/ (playwright is in ${WT}/node_modules; round 1's probe may still exist at C:/Users/ruchi/AppData/Local/Temp/tmp.zYuVvNhs3T/probe.cjs; reuse it). Set a PIN, reload to the lock screen, tap lock-sober, tap #sos-btn: expected hash #/sos, h1 ['SOS'], the lock page gone. Also: tap lock-sober, tap Done: back on the lock page with the PIN field usable and #sos-btn visible. Report what you saw, hash and h1 by step.
5. Territory: python ${DOCS}/tools/check_territory.py actions-sos ${TIP}..${fix.tip} --wt ${WT} (0 errors).
6. Read each commit: does its test exercise the rule (a test that cannot fail is a finding)? Does every commit carry a Claude-Session line?
Then git -C ${WT} checkout -- offline/1-addic.html and leave the worktree clean. You change nothing else. Never push, merge, rebase, stash or touch another worktree.

BUDGET: about 45 tool calls (hard cap 80). Return PASS or FIX, each gate (name, verdict, counts, log, fails by name), the probe's result by step, the full Node counts, the territory line, findings (file:line) and the tip.`, { label: 'gates2:actions-sos', phase: 'Recheck', agentType: 'lane-checker', schema: GATES_SCHEMA }).then(g => ({ gates: g })),
])
const lenses = out.filter(o => o && o.results)
const g = (out.find(o => o && 'gates' in o) || {}).gates || null
const results = lenses.flatMap(r => r.results || [])
const newF = lenses.flatMap(r => r.newFindings || [])
const notFixed = ['F1', 'F2', 'F3'].filter(id => { const rs = results.filter(r => r.id === id); return !rs.length || rs.some(r => r.state !== 'FIXED') })
const state = lenses.length < 2 || notFixed.length || newF.some(f => f.severity !== 'LOW') || !g || g.verdict !== 'PASS' ? 'RED' : 'READY'
log(`actions-sos round 2: ${state} at ${fix.tip}: not fixed ${notFixed.join(',') || 'none'}; new ${newF.length}; gates ${g ? g.verdict : 'lost'}`)
return { lane: 'actions-sos', state, tipBefore: TIP, tip: fix.tip, now: NOW, fix, results, newFindings: newF, gates: g, notFixed, lensesLost: 2 - lenses.length }
