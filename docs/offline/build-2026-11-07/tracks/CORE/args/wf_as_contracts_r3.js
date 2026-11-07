export const meta = {
  name: 'actions-sos-contracts-r3',
  description: 'actions-sos: read-only contracts-and-tests re-review of fca2781..HEAD (FIX-R2..FIX-R6), each HIGH/MEDIUM finding adversarially verified (CORE 93bffdb7)',
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

phase('Review')
const review = await agent(reviewPrompt, { label: 'review:contracts:actions-sos:r3', phase: 'Review', agentType: 'lane-reviewer', schema: REVIEW_SCHEMA })
if (!review) { log('the contracts reviewer returned nothing (cap?)'); return { review: null, verdicts: [] } }
const serious = review.findings.filter(f => ['BLOCKER', 'HIGH', 'MEDIUM'].includes(f.severity))
log(`contracts re-review: ${review.findings.length} findings (${serious.length} BLOCKER/HIGH/MEDIUM), ${review.questions.length} questions, tip ${review.tip}`)
phase('Verify')
const verdicts = await parallel(serious.map(f => () =>
  agent(verifyPrompt(f), { label: 'verify:' + f.id, phase: 'Verify', agentType: 'lane-checker', schema: VERDICT_SCHEMA })))
return { review, verdicts: verdicts.filter(Boolean), lost: verdicts.filter(v => !v).length }
