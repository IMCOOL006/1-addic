export const meta = {
  name: '1-addic-lane-end-review',
  description: 'Whole-lane two-lens review of a flagged lane of the 1-addic offline build at the end of its V3 work: the lane\'s own commits since f69bc68a, adversarial verification of every MEDIUM or worse finding, one fix round by name, the finders\' re-check and the gates',
  phases: [
    { title: 'Review', detail: 'two lane-reviewers (contracts and tests; safety copy, privacy and the person\'s data) over the lane\'s own commits, read through git' },
    { title: 'Verify', detail: 'two skeptics per BLOCKER, HIGH or MEDIUM finding, each told to refute; a split vote gets a third' },
    { title: 'Fix', detail: 'one flagged builder fixes the confirmed findings by name, a commit per finding' },
    { title: 'Recheck', detail: 'each lens re-checks its fixed findings at the new tip; the lane-checker runs the gates over the fix commits' },
  ],
}

// CORE's whole-lane review for the flagged lanes core and actions-sos (2026-11-08, CORE 15). lane.js's reviewers judge
// base...HEAD, which after the fast-forwards to the trunk holds every other lane's merged work; this script judges only
// the lane's own commits, listed by unit in args. No clock, no random, no file access here: every name comes from args.
// args: lane*, wt*, tip*, units* ([{id, shas: [..], note}]: judged), context ([{id, shas, note}]: already reviewed),
// files (the lane's own files), brief, contract, known (findings already handled), extra (the chat's word),
// session (the Claude-Session trailer), now, scratch, gates (default 'build test validate guards'), browserGrep
// (a --grep pattern for the browser gate after the fixes, or none), builder (default lane-builder-flagged), noFix.

const A = args || {}
const lane = A.lane, WT = A.wt, TIP = A.tip, NOW = A.now || '(no stamp)', SESSION = A.session || '(none)'
if (!lane || !WT || !TIP || !Array.isArray(A.units) || !A.units.length) throw new Error('args: lane, wt, tip and units are required')
const DOCS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07'
const GATES = DOCS + '/tools/gates.py'
const SCR = A.scratch || ('C:/Users/ruchi/1-addic-wt/_logs/reports/' + lane + '/end-review')
const BRIEF = A.brief || (DOCS + '/tracks/CORE/briefs/' + lane + '.md')
const CONTRACT = A.contract || (DOCS + '/tracks/CORE/contracts/' + lane + '.md')
const REPORT = DOCS + '/tracks/CORE/lane-reports/' + lane + '.md'
const FILES = (A.files || []).join(', ') || '(the brief\'s "Your files" section)'
const BUILDER = A.builder || 'lane-builder-flagged'
const GATE_LIST = A.gates || 'build test validate guards'
const fmtUnits = us => (us || []).map(u => '- ' + u.id + ': ' + u.shas.join(', ') + (u.note ? ' (' + u.note + ')' : '')).join('\n')
const UNITS = fmtUnits(A.units)
const CONTEXT = fmtUnits(A.context)

const readText = tip => `READ ONLY, THROUGH GIT: never edit a file, never run a gate, a build, npm or a browser in ${WT}. Read with git: git -C ${WT} show --stat <sha>; git -C ${WT} show <sha> -- <path>; the code as it stands: git -C ${WT} show ${tip}:<path> | sed -n 'a,bp'; git -C ${WT} grep -n <pattern> ${tip} -- offline/src offline/tests. To prove a finding by a test, export the tree first: mkdir -p ${SCR}/tree-<your label> && git -C ${WT} archive ${tip} offline package.json | tar -x -C ${SCR}/tree-<your label>, then node --test offline/tests/<file> inside it (Node only, never a browser). Write nothing anywhere but your notes file under ${SCR}/. Never push, merge, rebase, stash, checkout, or touch another worktree or C:/Users/ruchi/1-addic.`

const SEVERITY = `Severity: BLOCKER (data loss, SOS gated or broken, the person's data or a secret leaked), HIGH (a contract broken for its consumer, a refusal that writes or throws, a rule of BUILD-PLAN.md section 2 broken), MEDIUM (a real defect with a narrow trigger, or an acceptance criterion with no test that fails without the change), LOW (polish). Report only what you can show with lines or a test; a hunch is a question.`

const COMMON = `The 1-addic offline edition: a private, phone-first, single-file recovery app (docs/offline/BUILD-PLAN.md section 2 holds the product rules that bind every lane; PLAN-V3.md sections 3 and 7 the V3 contracts). This is the WHOLE-LANE review of the flagged lane ${lane} at the end of its V3 work, before its final READY. Some of its units were merged into the trunk as slices without the flagged lane's two reviewers: this review is theirs. Worktree ${WT}, branch build/${lane}, tip ${TIP}.

THE LANE'S OWN COMMITS, the only code you judge:
${UNITS}
${CONTEXT ? 'Context only, already reviewed by this lane\'s reviewers in an earlier run (do not repeat what they found; a NEW defect there counts):\n' + CONTEXT + '\n' : ''}The lane's files: ${FILES}. Everything else in the tree is other lanes' merged code: context, never a finding against this lane (a defect there is a question that names its owner).

The specification: the unit notes ${DOCS}/tracks/CORE/briefs/${lane}/<unit id>.md; the lane brief ${BRIEF} (its V3 section); the contract ${CONTRACT} (dated sections override older lines); the lane report ${REPORT} (the units as built, the findings already handled).
${A.known ? 'Already found and handled (do not repeat): ' + A.known + '\n' : ''}${A.extra ? 'The build chat\'s word: ' + A.extra + '\n' : ''}
${readText(TIP)}

${SEVERITY}`

const LENSES = [
  { key: 'contracts', id: 'EC', who: 'the contracts-and-tests reviewer', ask: 'the contracts and the tests: every namespace function, verb, event, content key, route and data-tour or data-test hook the units add or change matches the lane contract, BUILD-PLAN section 3 and its callers (the lanes that consume it: grep the trunk for each name); every acceptance criterion of each unit note has a test that fails without the change (a test that cannot fail is a finding); refusal paths tested as carefully as the happy path (each code, nothing written on refusal); "nothing ever decreases" wherever a unit touches the event log; determinism (no clock or random number inside a rule without an injected now); export then import identical; the shared files only at their append points under the lane\'s banner; the territory kept' },
  { key: 'safety', id: 'ES', who: 'the safety-copy, privacy and data reviewer', ask: 'safety copy, privacy and the person\'s data: SOS works offline, is never gated by a PIN, a tutorial, a tip, a reveal or an unlock, and is never interrupted; urgent help is one tap from SOS and reachable on the lock screen without the PIN; every word a person in a craving, a hard feeling or a slip reads is short, person-first, grade 6-8, never moralising, original (never the source book\'s text); crisis or medical passages short and marked clinicalReview; encryption and the lock: the PIN offered, never forced, the key in memory only, nothing readable in storage when a PIN is set, a wrong PIN refused, no plaintext copy in another key, label, log or export; the person\'s data: no network, no tracker, no external URL outside resources and references, export, import, erase and print do what they say, the sample data marked and erasable; no streak reset, random reward or points for claimed sober days; accessible (labels, visible focus, 44 px targets, contrast, reduced motion, live regions polite)' },
]

const FINDING = {
  type: 'object',
  properties: {
    id: { type: 'string' }, severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW'] }, unit: { type: 'string' },
    where: { type: 'string' }, scenario: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' },
  },
  required: ['id', 'severity', 'unit', 'where', 'scenario', 'evidence', 'fix'],
}
const REVIEW_SCHEMA = {
  type: 'object',
  properties: { findings: { type: 'array', items: FINDING }, questions: { type: 'array', items: { type: 'string' } }, filesRead: { type: 'array', items: { type: 'string' } } },
  required: ['findings', 'questions'],
}
const VERDICT_SCHEMA = {
  type: 'object',
  properties: { verdict: { type: 'string', enum: ['UPHELD', 'REFUTED', 'UNSURE'] }, evidence: { type: 'string' }, severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] } },
  required: ['verdict', 'evidence', 'severity'],
}
const FIX_SCHEMA = {
  type: 'object',
  properties: {
    results: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, state: { type: 'string', enum: ['FIXED', 'NOT-FIXED'] }, sha: { type: 'string' }, test: { type: 'string' }, why: { type: 'string' } }, required: ['id', 'state'] } },
    tip: { type: 'string' }, testsRun: { type: 'string' }, requests: { type: 'array', items: { type: 'string' } }, steps_used: { type: 'number' },
  },
  required: ['results', 'tip', 'testsRun'],
}
const RECHECK_SCHEMA = {
  type: 'object',
  properties: {
    results: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, state: { type: 'string', enum: ['FIXED', 'NOT-FIXED', 'PARTIAL'] }, evidence: { type: 'string' } }, required: ['id', 'state', 'evidence'] } },
    newFindings: { type: 'array', items: FINDING }, tip: { type: 'string' },
  },
  required: ['results', 'newFindings'],
}
const GATES_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FIX'] },
    gates: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, verdict: { type: 'string' }, counts: { type: 'string' }, log: { type: 'string' }, fails: { type: 'string' } }, required: ['name', 'verdict', 'log'] } },
    territory: { type: 'string' }, findings: { type: 'array', items: { type: 'string' } }, tip: { type: 'string' },
  },
  required: ['verdict', 'gates', 'territory'],
}

function reviewPrompt(lens) {
  return `You are ${lens.who} of the flagged lane ${lane} (build chat CORE), the 1-addic offline edition build. Your lens: ${lens.ask}.

${COMMON}

BUDGET: about 55 tool calls; your hard cap is 80 and an agent cut off at the cap returns NOTHING. Batch independent reads in one step; read each commit by file, never whole large files; write each finding the moment you have it to ${SCR}/${lane}__end-review-${lens.key}.md (id, severity, unit, file:line, scenario, evidence, fix); at about 55 calls stop reading and return what you have.

Return the findings ranked most severe first, ids ${lens.id}1, ${lens.id}2, ... (unit = the unit id; where = file:line at ${TIP}), your questions (a hunch with the line that raised it), and the files you read.`
}

function verifyPrompt(f, k) {
  return `You are skeptic ${k} for ONE finding from the whole-lane review of the flagged lane ${lane} of the 1-addic offline edition build. Try to REFUTE it. It is refuted when you show, with lines at ${TIP} or a test and its output, that the failure scenario cannot happen; that it is already handled or already tested (name the test); or that it lies outside the lane's own commits (another lane's code: name the owner). If the scenario holds as stated, it is UPHELD (give the severity you would assign; a lower one is fine). UNSURE only if your budget runs out undecided.

THE FINDING: ${JSON.stringify(f)}

The lane's own commits:
${UNITS}
The specification: the unit notes ${DOCS}/tracks/CORE/briefs/${lane}/<unit id>.md; the contract ${CONTRACT}; docs/offline/BUILD-PLAN.md section 2.

${readText(TIP)}

BUDGET: about 25 tool calls (hard cap 80; an agent cut off returns nothing). Return the verdict, the evidence, and the severity you would give it (NONE when refuted).`
}

function fixPrompt(list) {
  return `You are the fix builder of the flagged lane ${lane} of the 1-addic offline edition build (build chat CORE, ${NOW}). The whole-lane review found the defects below, each confirmed by independent skeptics. Fix EACH by name in the worktree ${WT} on branch build/${lane}. First: git -C ${WT} status must be clean (an M on offline/1-addic.html alone is the build's output: git -C ${WT} checkout -- offline/1-addic.html) and HEAD must be ${TIP}; if not, stop and say so.

THE FINDINGS TO FIX (${list.length}):
${list.map(f => '- ' + f.id + ' ' + f.severity + ' (' + f.unit + ') ' + f.where + ': ' + f.scenario + ' Evidence: ' + f.evidence + ' Suggested fix: ' + f.fix + (f.votes && f.votes.length ? ' Skeptics: ' + f.votes.join(' | ').slice(0, 600) : '')).join('\n')}
The reviewers' notes: ${SCR}/${lane}__end-review-contracts.md and ${SCR}/${lane}__end-review-safety.md. The spec: the unit notes ${DOCS}/tracks/CORE/briefs/${lane}/<unit id>.md, the contract ${CONTRACT}, docs/offline/BUILD-PLAN.md section 2.

How: one commit per finding, message 'fix(offline, ${lane} <id>): <what changed for the person or the contract>' written to a file and committed with git commit -F, ending with the two trailers 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' and 'Claude-Session: ${SESSION}'; git add by explicit path, never -A; never commit offline/1-addic.html. Only the lane's files (${FILES}) and the shared append points under the lane's banner; a fix that needs another lane's file is a request line in your result, not an edit. Every code fix comes with a test that fails without it (name it); a missing-test finding is closed by the test. The shortest change that closes the finding; a contract a consumer reads is never changed silently (say so in your result). A finding you judge wrong after reading the code: NOT-FIXED with the lines that show why. After the fixes: node --test offline/tests/<each file you touched> and node offline/build.mjs, then git checkout -- offline/1-addic.html. Never push, merge, rebase, stash or touch another worktree or C:/Users/ruchi/1-addic.

BUDGET: 80 tool steps hard; commit each fix as it is done, so a cut-off loses nothing. Return per finding: FIXED with its SHA and the test's name, or NOT-FIXED with why; the tip; the tests you ran with their pass and fail counts; requests for other lanes; the steps you used.`
}

function recheckPrompt(lens, mine, fix) {
  return `You are ${lens.who} of the flagged lane ${lane} of the 1-addic offline edition build, re-checking your own findings after the fix round. For each finding below: read its fix commit (git -C ${WT} show <sha>) and the code at the new tip ${fix.tip}; FIXED when the scenario can no longer happen and the named test fails without the fix (say how you know: run it on an exported tree with the fix reverted if you must); PARTIAL or NOT-FIXED otherwise. A defect the fix itself brought in is a new finding (id ${lens.id}R1, ...).

YOUR FINDINGS AND THE FIX RESULTS:
${mine.map(f => '- ' + f.id + ' ' + f.severity + ' ' + f.where + ': ' + f.scenario + ' -> ' + JSON.stringify((fix.results || []).find(r => r.id === f.id) || { state: 'NOT-FIXED', why: 'no result from the fix builder' })).join('\n')}

${readText(fix.tip)}

BUDGET: about 30 tool calls (hard cap 80). Return the results by id, the new findings (usually none) and the tip you judged.`
}

function gatesPrompt(fix) {
  return `You are the independent checker of the fix round of the flagged lane ${lane} of the 1-addic offline edition build (build chat CORE). The whole-lane review's fixes are the commits ${TIP}..${fix.tip} in the worktree ${WT} (git -C ${WT} log --oneline ${TIP}..${fix.tip}). Run the gates ONLY through python ${GATES} --wt ${WT} --lane ${lane} ${GATE_LIST}${A.browserGrep ? ' and then, alone, python ' + GATES + ' --wt ' + WT + ' --lane ' + lane + ' --grep "' + A.browserGrep + '" browser' : ''} (Bash timeout 600000; a call that times out runs once more with run_in_background; before a browser run read the QUIET: line of ${DOCS}/coordination/status-HUB.md and wait while it says running); read each GATE line and cite its log= path; judge every failure BY NAME (a VOID twice is "not checked", never green). Then territory: python ${DOCS}/tools/check_territory.py ${lane} ${TIP}..${fix.tip} --wt ${WT} (0 errors). Then read each fix commit: does its test exercise the rule (a test that cannot fail is a finding)? After the gates: git -C ${WT} checkout -- offline/1-addic.html if the build rewrote it. You change nothing else. Never push, merge, rebase, stash or touch another worktree.

BUDGET: about 40 tool calls (hard cap 80). Return PASS or FIX, each gate (name, verdict, counts, log, fails by name), the territory line, findings (each with file:line) and the tip.`
}

// ---------- Review and Verify: each lens's findings are verified as soon as that lens returns ----------
async function verify(f, lensKey) {
  if (f.severity === 'LOW') return Object.assign({}, f, { lens: lensKey, status: 'LOW', votes: [] })
  const vs = (await parallel([1, 2].map(k => () =>
    agent(verifyPrompt(f, k), { label: `verify:${f.id}:${k}`, phase: 'Verify', agentType: 'lane-reviewer', schema: VERDICT_SCHEMA })))).filter(Boolean)
  let up = vs.filter(v => v.verdict === 'UPHELD').length
  let re = vs.filter(v => v.verdict === 'REFUTED').length
  if (up && re) {
    const v3 = await agent(verifyPrompt(f, 3), { label: `verify:${f.id}:3`, phase: 'Verify', agentType: 'lane-reviewer', schema: VERDICT_SCHEMA })
    if (v3) { vs.push(v3); if (v3.verdict === 'UPHELD') up++; if (v3.verdict === 'REFUTED') re++ }
  }
  const status = up > re ? 'CONFIRMED' : re > up ? 'REFUTED' : 'DISPUTED'
  return Object.assign({}, f, { lens: lensKey, status, votes: vs.map(v => v.verdict + ' (' + v.severity + '): ' + String(v.evidence || '').slice(0, 400)) })
}

phase('Review')
log(`${lane}: whole-lane review of ${A.units.map(u => u.id).join(', ')} at ${TIP}${CONTEXT ? '; context ' + (A.context || []).map(u => u.id).join(', ') : ''}`)
const reviewed = await pipeline(
  LENSES,
  lens => agent(reviewPrompt(lens), { label: `review:${lens.key}:${lane}`, phase: 'Review', agentType: 'lane-reviewer', schema: REVIEW_SCHEMA }),
  (r, lens) => r ? parallel((r.findings || []).map(f => () => verify(f, lens.key))).then(vf => ({ lens: lens.key, review: r, verified: vf.filter(Boolean) })) : { lens: lens.key, review: null, verified: [] },
)
const lost = reviewed.filter(x => !x || !x.review).length
const verified = reviewed.filter(Boolean).flatMap(x => x.verified)
const toFix = verified.filter(f => f.status === 'CONFIRMED')
const disputed = verified.filter(f => f.status === 'DISPUTED')
const lows = verified.filter(f => f.status === 'LOW')
log(`${lane}: ${verified.length} finding(s): ${toFix.length} confirmed, ${verified.filter(f => f.status === 'REFUTED').length} refuted, ${disputed.length} disputed, ${lows.length} LOW (recorded, not fixed); reviewers lost ${lost}`)

// ---------- Fix, Recheck ----------
let fix = null, recheck = [], gates = null
if (toFix.length && !A.noFix) {
  phase('Fix')
  fix = await agent(fixPrompt(toFix), { label: 'fix:end-review:' + lane, phase: 'Fix', agentType: BUILDER, schema: FIX_SCHEMA })
  if (!fix) log(`${lane}: the fix builder returned nothing (cut off at its cap?): read git -C ${WT} log ${TIP}..HEAD`)
  else {
    phase('Recheck')
    const lensRuns = LENSES.map(lens => ({ lens, mine: toFix.filter(f => f.lens === lens.key) })).filter(x => x.mine.length)
    const out = await parallel([
      ...lensRuns.map(x => () => agent(recheckPrompt(x.lens, x.mine, fix), { label: `recheck:${x.lens.key}:${lane}`, phase: 'Recheck', agentType: 'lane-reviewer', schema: RECHECK_SCHEMA }).then(r => ({ lens: x.lens.key, r }))),
      () => agent(gatesPrompt(fix), { label: 'gates:end-review:' + lane, phase: 'Recheck', agentType: 'lane-checker', schema: GATES_SCHEMA }).then(g => ({ gates: g })),
    ])
    recheck = out.filter(o => o && o.lens)
    const g = out.find(o => o && 'gates' in o)
    gates = g ? g.gates : null
  }
} else if (toFix.length) log(`${lane}: noFix: ${toFix.length} confirmed finding(s) left for the build chat`)

const recheckResults = recheck.flatMap(x => (x.r && x.r.results) || [])
const newFindings = recheck.flatMap(x => (x.r && x.r.newFindings) || [])
const openConfirmed = toFix.filter(f => {
  const r = recheckResults.find(x => x.id === f.id)
  return !r || r.state !== 'FIXED'
})
const lensLost = recheck.filter(x => !x.r).length
const gatesOk = !fix || (gates && gates.verdict === 'PASS')
const state = lost || lensLost || openConfirmed.length || newFindings.filter(f => f.severity !== 'LOW').length || !gatesOk || (toFix.length && !fix) ? 'RED' : 'READY'
const tip = (fix && fix.tip) || TIP
log(`${lane}: state ${state} at ${tip}: open confirmed ${openConfirmed.length}, new ${newFindings.length}, gates ${gates ? gates.verdict : 'not run'}`)
return {
  lane, state, tipBefore: TIP, tip, now: NOW,
  reviews: reviewed.filter(Boolean).map(x => ({ lens: x.lens, questions: x.review ? x.review.questions : null, findings: x.review ? x.review.findings.length : null })),
  verified: verified.map(f => ({ id: f.id, severity: f.severity, unit: f.unit, where: f.where, scenario: f.scenario, fix: f.fix, status: f.status, votes: f.votes })),
  fix, recheck: recheck.map(x => ({ lens: x.lens, results: x.r ? x.r.results : null, newFindings: x.r ? x.r.newFindings : null })),
  gates, openConfirmed: openConfirmed.map(f => f.id), disputed: disputed.map(f => f.id), lows: lows.map(f => f.id), reviewersLost: lost,
}
