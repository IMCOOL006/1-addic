export const meta = {
  name: 'actions-sos-contracts-r3',
  description: 'actions-sos: read-only contracts-and-tests re-review of fca2781..HEAD and an independent lane check of 1cfc936..HEAD with a trunk merge preview, each HIGH/MEDIUM finding adversarially verified (CORE 93bffdb7)',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}
const A = args || {}
const NOW = A.now || '<now not passed>'
const WT = 'C:/Users/ruchi/1-addic-wt/actions-sos'
const SCR = 'C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos'
const DOCS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07'
const GATES = DOCS + '/tools/gates.py'
const FROM = 'fca2781'
const READ_ONLY = `You change nothing in the repository: read-only on the code; you may write notes only under ${SCR}/ (never under C:/Users/ruchi/1-addic/: Write and Edit are refused there). Never push, merge, rebase, stash, checkout, commit, or touch another worktree or the trunk checkout. Gates ONLY through python ${GATES} --wt ${WT} --lane actions-sos <gates> (Bash timeout 600000); judge every failure BY NAME against ${DOCS}/coordination/baselines.md. Node tests only: never the browser suite.`
const RULES = `THE PRODUCT RULES (docs/offline/BUILD-PLAN.md section 2): SOS offline, never gated, never interrupted; urgent help one tap from SOS; no streak resets, random rewards or points for claimed sober days; nothing leaves the device; nothing derived ever decreases (append-only event log; a slip restarts only the opt-in current run); deterministic rules (an injected now, no clock or random inside a rule); export then import identical.`

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    findings: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW'] }, unit: { type: 'string' },
      where: { type: 'string' }, scenario: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } },
      required: ['id', 'severity', 'where', 'scenario', 'evidence', 'fix'] } },
    questions: { type: 'array', items: { type: 'string' } },
    tip: { type: 'string' },
    read: { type: 'array', items: { type: 'string' } },
  },
  required: ['findings', 'questions', 'tip'],
}
const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    real: { type: 'boolean' },
    severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] },
    reason: { type: 'string' },
    evidence: { type: 'string' },
  },
  required: ['id', 'real', 'severity', 'reason', 'evidence'],
}

const reviewPrompt = `You are the contracts-and-tests reviewer of the flagged lane actions-sos (build chat CORE, the 1-addic offline edition build of 7 November 2026), on a RE-REVIEW. Worktree ${WT}, branch build/actions-sos, base 655516dc; the tip is HEAD.
Your lens last judged the lane at ${FROM} (round 2, RC1-RC20, all fixed; your earlier text: ${SCR}/actions-sos__review-contracts.md). Since then six fix rounds by the safety reviewer's findings changed the code (FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5, FIX-R6; git -C ${WT} log --oneline ${FROM}..HEAD; about 31 commits over actions.js, ui-sos.js, ui-onboarding.js, actions.test.mjs). Judge ONLY what changed after ${FROM} (git -C ${WT} diff --stat ${FROM}...HEAD, then by file and range), reading the earlier code as context.

YOUR LENS: the contracts and the tests. Every Actions verb, event, content key, route, UI.pages entry and data-tour/DOM hook the changes touch still matches the lane contract (${DOCS}/tracks/CORE/contracts/actions-sos.md, its later sections are the chat's rulings), BUILD-PLAN section 3.2-3.5 and the callers on the trunk (the SCREENS lanes call Actions.* and UI.sos*: git -C C:/Users/ruchi/1-addic grep -n "Actions\\.\\|UI\\.sos" build/offline-v1 -- offline/src to see them; offline/tests/helpers/hooks.mjs on the trunk for the hooks the browser suite drives). In particular: the RS-SAMPLE change (loadSample, eraseSample, onboard, settings.patch, markTipShown through ownRow): does any caller on the trunk (ui-settings.js's Load sample / Erase sample, today, workbook) now get a different shape or a silent no-op? Is eraseSample's contract still what Settings relies on? The urgentList model's new key builtIn and the BUILT_IN constant: does any caller or test read the old shape? Changed ids, removed or renamed DOM ids/hooks (a hook the browser suite or tests-docs drives that no longer exists is a finding). Every behaviour change has a test that fails without it; refusal paths tested as carefully as happy paths; no test that passes vacuously (a stub that makes the assertion trivially true); determinism; nothing derived decreases.

${READ_ONLY}

${RULES}

CLOSED, not findings: the phrase lists of the crisis check (closed; RS34 overdose wordings and RS26's lock identity are offline-v1.1 by name); the safety copy itself (the safety reviewer's lens, running now); LOWs already ruled for offline-v1.1 in the contract file.

YOUR BUDGET: about 60 tool calls, hard cap 80 (an agent cut off at the cap returns NOTHING). Batch reads; read the diff by file and range; write each finding the moment you have it to ${SCR}/actions-sos__review-contracts.md under a new heading "# Round 3: lens contracts and tests, ${FROM}...HEAD (${NOW})" (append; never rewrite earlier rounds); at about 60 calls stop and return what you have.

Return: findings ranked most severe first, ids RC21, RC22, ... (severity, unit, file:line, the failure scenario in one sentence: the input and the wrong outcome, evidence: a path, a test or the lines, the fix); questions (a hunch is a question); tip (git -C ${WT} rev-parse --short HEAD); the files you read.`

const verifyPrompt = f => `You are an independent skeptic checking ONE finding of a code review of lane actions-sos (1-addic offline build), worktree ${WT} (branch build/actions-sos). Try to REFUTE it: default to real=false if after checking you cannot reproduce or confirm it.
THE FINDING:
${JSON.stringify(f, null, 1)}

Check it against the code at HEAD (git -C ${WT} show HEAD:<file>, git -C ${WT} log, the tests in offline/tests/actions.test.mjs) and, when it names a caller, against the trunk (git -C C:/Users/ruchi/1-addic show build/offline-v1:<file>). When a test can decide it, write a probe test ONLY under ${SCR}/ (a file named actions-sos__rc-verify-<id>.probe.test.mjs that imports from ${WT}/offline/... by absolute path) and run it with node --test; never edit the worktree.
${READ_ONLY}
Budget about 30 tool calls. Return id, real (true only if the failure scenario happens as described or in a closely related form), severity (your own; NONE when not real), reason (one or two sentences), evidence (paths, lines, the probe's output).`

const CHECK_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FIX'] },
    tip: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW'] }, unit: { type: 'string' },
      where: { type: 'string' }, expected: { type: 'string' }, evidence: { type: 'string' } }, required: ['id', 'severity', 'where', 'expected', 'evidence'] } },
    gates: { type: 'array', items: { type: 'string' } },
    trunk_suite: { type: 'string', description: 'the full Node suite on the trunk tree with the lane files over it: counts, failing names, log path' },
    territory: { type: 'string' },
    not_checked: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'findings', 'gates', 'trunk_suite'],
}
const CHECK_FROM = '1cfc936'
const checkPrompt = `You are the independent checker of lane actions-sos (build chat CORE, the 1-addic offline edition build of 7 November 2026). Worktree ${WT}, branch build/actions-sos, base 655516dc; the tip is HEAD. The last real lane check passed at ${CHECK_FROM}; since then two fix rounds by name were built and re-checked only by the safety reviewer: FIX-R6 (RS-SAMPLE, RS33, Q-BUILTIN, Q-SPIRAL, RS9T, RS35, RS36, RS37) and FIX-R7 (RS37R, RS38, RS36R). Judge ONLY ${CHECK_FROM}..HEAD (git -C ${WT} log --oneline ${CHECK_FROM}..HEAD; the diff by file and range), reading the earlier code as context. The findings' full text and rulings: ${SCR}/actions-sos__review-safety.md (Round 6, Round 7, section FIX-R7) and ${DOCS}/tracks/CORE/contracts/actions-sos.md (rulings 17:22, 17:57, 22:25, 22:52).

${READ_ONLY}

Check, once each:
1. The gates: python ${GATES} --wt ${WT} --lane actions-sos build test validate guards; each GATE and FAIL line judged by name against the baselines (build and validate SKIP in this worktree is expected: no build.mjs or engine.js at its base; the guards' tour-target names that belong to other lanes and are the same as at ${CHECK_FROM} are not this lane's failures: diff them by name against the gate log at ${CHECK_FROM} or 87030e3 under C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/).
2. The territory: python ${DOCS}/tools/check_territory.py actions-sos 655516dc..HEAD --wt ${WT} (an ERROR line is a BLOCKER).
3. THE MERGE PREVIEW (the most important): build a scratch tree of the trunk with the lane's four files over it and run the full Node suite there: mkdir -p C:/Users/ruchi/1-addic-wt/_logs/scratch/as-check-r7 (empty it first), git -C C:/Users/ruchi/1-addic archive build/offline-v1 offline package.json | tar -x -C <that dir>, copy over it ${WT}/offline/src/actions.js, ui-sos.js, ui-onboarding.js and offline/tests/actions.test.mjs, then in it: node offline/build.mjs, then node --test on every offline/tests/*.test.mjs except browser.test.mjs (log to C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/trunk-preview-<stamp>.log). Every failing test name is a finding unless ${DOCS}/coordination/baselines.md lists it; a failure in another lane's test caused by this lane's change (a caller on the trunk: ui-settings.js, ui-workbook.js, ui-today.js reading Actions.* or UI.sos*) is a HIGH. Never touch the trunk checkout or the worktree.
4. Each fix id of FIX-R6 and FIX-R7 has its own commit and a test that fails without it (spot-check two: revert the source hunk in the scratch tree only, run the test, see it fail, restore).
5. The commit messages after ${CHECK_FROM} carry the two trailers (Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>, and a Claude-Session line: 60f08c84-298d-4afc-9321-e70539a6534c for FIX-R6, 93bffdb7-4bab-4cfc-a69c-5f4a981d5968 for FIX-R7); nothing committed that is not the lane's.
6. THE RULES below kept in the changed code (SOS never gated or interrupted; urgent help one tap away; nothing derived decreases; no network or innerHTML with data; crisis copy brief with clinicalReview: true).

${RULES}

YOUR BUDGET: about 60 tool calls, hard cap 80 (cut off at the cap you return NOTHING); write findings as you go to ${SCR}/actions-sos__check-r7.md. Return: verdict PASS or FIX (FIX only for a BLOCKER, HIGH or MEDIUM), tip, findings (ids C-R7-1, ...: severity, unit, file:line, what is expected, evidence path), gates (one line each with its log path), trunk_suite (counts, failing names, log path), territory, not_checked.`

phase('Review')
// args.only: 'review' (the contracts reviewer only: the HUB's grant on a row under 7.0 GB), 'check' (the lane checker only, on a 7.0 GB row), or absent (both).
const ONLY = A.only || null
const [review, check] = await parallel([
  () => ONLY === 'check' ? Promise.resolve(null) : agent(reviewPrompt, { label: 'review:contracts:actions-sos:r3', phase: 'Review', agentType: 'lane-reviewer', schema: REVIEW_SCHEMA }),
  () => ONLY === 'review' ? Promise.resolve(null) : agent(checkPrompt, { label: 'check:actions-sos:r7', phase: 'Review', agentType: 'lane-checker', schema: CHECK_SCHEMA }),
])
if (!review && ONLY !== 'check') log('the contracts reviewer returned nothing (cap?)')
if (!check && ONLY !== 'review') log('the checker returned nothing (cap?)')
const serious = [
  ...(review ? review.findings : []),
  ...(check ? check.findings.map(f => ({ ...f, scenario: f.expected, fix: '(the checker\'s expectation)' })) : []),
].filter(f => ['BLOCKER', 'HIGH', 'MEDIUM'].includes(f.severity))
log(`contracts re-review: ${review ? review.findings.length : '?'} findings; check: ${check ? check.verdict + ' with ' + check.findings.length + ' findings' : '?'}; ${serious.length} BLOCKER/HIGH/MEDIUM to verify`)
phase('Verify')
const verdicts = await parallel(serious.map(f => () =>
  agent(verifyPrompt(f), { label: 'verify:' + f.id, phase: 'Verify', agentType: 'lane-checker', schema: VERDICT_SCHEMA })))
return { review, check, verdicts: verdicts.filter(Boolean), lost: verdicts.filter(v => !v).length }
