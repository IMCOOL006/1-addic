export const meta = {
  name: 'actions-sos-fix-r8',
  description: 'actions-sos FIX-R8: test-only fix round by name of the lane check C-R7-1..3 (the lane tests red on the trunk merge preview), then an independent re-check with a fresh merge preview and a contracts-and-tests review, each HIGH/MEDIUM finding adversarially verified (CORE 11310a7c)',
  phases: [{ title: 'Fix' }, { title: 'Recheck' }, { title: 'Verify' }],
}
const A = args || {}
const NOW = A.now || '<now not passed>'
const SESSION = '11310a7c-b949-4ec5-8ddc-1f7fa59bc77a'
const WT = 'C:/Users/ruchi/1-addic-wt/actions-sos'
const SCR = 'C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos'
const GLOG = 'C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos'
const DOCS = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07'
const GATES = DOCS + '/tools/gates.py'
const FROM = 'cd385a5'
const FILES = 'offline/src/actions.js, offline/src/ui-sos.js, offline/src/ui-onboarding.js, offline/tests/actions.test.mjs'
const RULES = `THE PRODUCT RULES (docs/offline/BUILD-PLAN.md section 2): SOS offline, never gated, never interrupted; urgent help one tap from SOS; nothing leaves the device; nothing derived ever decreases; deterministic rules; no new copy, no new crisis phrase in this round.`
const PREVIEW = (dir) => `THE MERGE PREVIEW: empty and recreate C:/Users/ruchi/1-addic-wt/_logs/scratch/${dir}; git -C C:/Users/ruchi/1-addic archive build/offline-v1 offline package.json | tar -x -C <that dir>; copy over it the lane's four files from ${WT} (${FILES}); in it: node offline/build.mjs, then node --test on every offline/tests/*.test.mjs except browser.test.mjs (log to ${GLOG}/trunk-preview-<stamp>.log). Never touch the trunk checkout C:/Users/ruchi/1-addic (read it only through git -C ... show/archive/grep) and never copy trunk files into the worktree.`

const FINDINGS = A.findings || []
if (!Array.isArray(FINDINGS) || !FINDINGS.length || !FINDINGS.every(f => f && f.id && f.expected)) throw new Error('wf_as_r8: args.findings must be the findings array of the check (id, expected, ...)')
const NOTE_SCHEMA = {
  type: 'object',
  properties: {
    done: { type: 'array', items: { type: 'object', properties: { unit: { type: 'string', description: 'the finding id: C-R7-1, C-R7-2 or C-R7-3' }, shas: { type: 'array', items: { type: 'string' } }, how: { type: 'string' } }, required: ['unit', 'shas', 'how'] } },
    tip: { type: 'string' },
    files_changed: { type: 'array', items: { type: 'string' }, description: `git -C ${WT} diff --name-only ${FROM}..HEAD` },
    product_defect: { type: 'string', description: '"none" if every failure was the test harness or the test premise; else the product defect found, its evidence and its fix SHA' },
    worktree_test: { type: 'string', description: 'gates.py test in the worktree at the tip: counts and log path' },
    preview_runs: { type: 'array', items: { type: 'string' }, description: 'each merge-preview run: counts, failing names, log path (at least the full suite once and actions.test.mjs three times)' },
    blocked: { type: 'array', items: { type: 'object', properties: { unit: { type: 'string' }, why: { type: 'string' } }, required: ['unit', 'why'] } },
    for_the_chat: { type: 'array', items: { type: 'string' } },
    steps_used: { type: 'number' },
  },
  required: ['done', 'tip', 'files_changed', 'product_defect', 'worktree_test', 'preview_runs', 'blocked'],
}
const FIND_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FIX'] },
    tip: { type: 'string' },
    results: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, state: { type: 'string', enum: ['FIXED', 'PARTLY', 'NOT-FIXED'] }, evidence: { type: 'string' } }, required: ['id', 'state', 'evidence'] } },
    findings: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW'] }, where: { type: 'string' }, scenario: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } },
      required: ['id', 'severity', 'where', 'scenario', 'evidence', 'fix'] } },
    gates: { type: 'array', items: { type: 'string' } },
    trunk_suite: { type: 'string' },
    territory: { type: 'string' },
    not_checked: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'results', 'findings'],
}
const VERDICT_SCHEMA = {
  type: 'object',
  properties: { id: { type: 'string' }, real: { type: 'boolean' }, severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] }, reason: { type: 'string' }, evidence: { type: 'string' } },
  required: ['id', 'real', 'severity', 'reason', 'evidence'],
}

const fixPrompt = `You are the fixer of the flagged lane actions-sos (build chat CORE, the 1-addic offline edition build of 7 November 2026), round FIX-R8, a TEST-ONLY fix round by name. Worktree ${WT}, branch build/actions-sos, base 655516dc, tip ${FROM}. The lane owns ${FILES}. Every review lens is clean at ${FROM}; the independent lane check (the trunk merge preview: the trunk build/offline-v1 with the lane's four files over it) found that 8 of the lane's own tests fail on the merged tree while all 169 pass in the worktree. Merging now would turn the trunk's test gate red. Fix exactly these three findings and nothing else:

${JSON.stringify(FINDINGS, null, 1)}

The checker's full notes: ${SCR}/actions-sos__check-r7.md; the failing preview log: ${GLOG}/trunk-preview-20261108-002223.log (and ${'C:/Users/ruchi/1-addic-wt/_logs/scratch'}/as-check-r7-t0.log, where RS26 passed: it is timing-sensitive).

WHAT THE CORE CHAT ALREADY FOUND (verify, do not take on trust):
- C-R7-1: the worktree has no offline/src/store.js, so actions.test.mjs:29 uses its store stand-in; on the merged tree it loads the trunk's real store.js, whose lock derives the key with PBKDF2-SHA256 at ITERATIONS = 310000 (store.js:19, :79-84, :661-670; it reads globalThis.crypto, i.e. Node's real WebCrypto, not the vm context's crypto that sosDom passes). d.settle() (actions.test.mjs:1079) waits about 10 ms, far less than one real derivation, so hasLock is read before Store.lock.set resolves. The likely fix: a condition wait helper in the test file (e.g. until(() => S().status().hasLock === true, 'the PIN is set', 8000): polls every few ms and FAILS with that message on its timeout, never passes silently), used wherever a test waits for a lock set, unlock, lock or a save kept for the unlock; the assertions stay exactly as strong. Read each of the six tests (PIN :1626, RS11 :1972, RS22 :2260, RS21 :2317, RS20 :2347, RS26 :2484) against the real store.js (git -C C:/Users/ruchi/1-addic show build/offline-v1:offline/src/store.js) before you change it: RS22 counts retries ('tried once more, at once' 1 !== 2) and RS20 checks that Next and Skip wait while the PIN is set: make sure each wait matches what the real store does, and that RS20 still proves the buttons wait (a slow real derivation is the case it is about).
- C-R7-2: the RS9 test (:1474-1475) asserts the shared catalog C().catalogs.spiral holds a 'hopeless' line; the trunk's content-core.js (U-31a, 0bbb7e2) removed it. The test should bring its own catalog line (set it for the test and restore it in a finally, as RS9T does with a stub Content), so it proves the skip on any content.
- C-R7-3: the 'RS24 remainder' case 'Somewhere else, no line with a number' (:2623, assertion :2638) passes res null = the real Content; the trunk gives the intl 'Your local emergency number' line tel '112' (content-core.js:448), so the built-in fallback and its 'Please check this number.' never draw. Give that case a stub Content.resources whose lines carry no number (restored after), so it proves the built-in fallback; and keep or add a case on the real Content that asserts the lead has a one-tap tel: line (true on both the lane's and the trunk's content).
If you find that a failure is a PRODUCT defect after all (the PIN, unlock, kept save or urgent lead failing for a person on the real store or the trunk's content), do not paper over it in the test: fix the product code with a test that is red on the merge preview before and green after, its own commit naming FIX-R8 and the id plus '-PRODUCT', and say so in product_defect.

DONE WHEN, for each id: the test(s) pass (a) in the worktree: python ${GATES} --wt ${WT} --lane actions-sos test (expect 169 or more, 0 fail); and (b) on the merge preview, run the full suite once and actions.test.mjs three more times in a row (the timing must hold every run; a flaky pass is not a pass). ${PREVIEW('as-fix-r8')}
The red-before evidence is the preview log above; save the green-after logs and name them in preview_runs. Write a short note per id to ${SCR}/actions-sos__fix-r8.md as you go.

RULES OF THE ROUND: test-only unless product_defect; never weaken an assertion, delete a test or skip one to make it pass; waits are conditions with a timeout that fails loudly, never a bare sleep that the assertion can outrun; no new copy, no new phrase; restore every stub in a finally. One commit per id, message from a file, subject 'test(actions-sos, FIX-R8 <id>): <what>', ending with the two trailers 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' and 'Claude-Session: ${SESSION}'; git add by explicit path (never -A); never push, merge, rebase, stash, amend or git worktree add/remove; never touch another worktree or the trunk checkout. ${RULES}
BUDGET: about 60 tool calls, hard cap 80 (cut off at the cap you return NOTHING: commit each id as soon as it is green). Return the hand-off note.`

const recheckPrompt = (note) => `You are the independent re-checker of lane actions-sos (build chat CORE, 1-addic offline build), after the test-only fix round FIX-R8 of the lane check's findings C-R7-1, C-R7-2, C-R7-3. Worktree ${WT}, branch build/actions-sos, base 655516dc; the round's diff is ${FROM}..HEAD. Read-only on the code: write notes only under ${SCR}/ (${SCR}/actions-sos__check-r8.md) and scratch trees only under C:/Users/ruchi/1-addic-wt/_logs/scratch/; never commit, push, merge, stash or checkout; never touch another worktree or the trunk checkout. Judge failures by name against ${DOCS}/coordination/baselines.md.
THE FINDINGS: ${JSON.stringify(FINDINGS)}
THE FIXER'S NOTE: ${JSON.stringify(note)}
Check, once each:
1. ${PREVIEW('as-check-r8')} Then run actions.test.mjs alone three more times there. Every failing name on any run is a finding (a flaky one is MEDIUM) unless baselines.md lists it; a failure in another lane's test is HIGH.
2. The gates in the worktree: python ${GATES} --wt ${WT} --lane actions-sos build test validate guards (Bash timeout 600000); build and validate SKIP are expected there; guards: only the same 21 other-lane tour-target names as ${GLOG}/guards-20261108-002211.log, by name.
3. Territory: python ${DOCS}/tools/check_territory.py actions-sos 655516dc..HEAD --wt ${WT} (an ERROR line is a BLOCKER).
4. Each id FIXED, PARTLY or NOT-FIXED, with evidence; and the tests are not vacuous: in the preview scratch tree only (restore and cmp after), (a) break Store.lock.set's result in the lane's ui-onboarding.js call path or make the onboarding PIN step skip Store.lock.set, and see the PIN or RS11 test fail; (b) disable the built-in fallback in ui-sos.js leadList and see the RS24 stub case fail; (c) drop the hopeless filter in the slip flow's spiral pairs and see RS9 fail. Each wait helper fails loudly on its timeout (read it).
5. The round's commits: one per id, subject naming FIX-R8 and the id, trailers 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' and 'Claude-Session: ${SESSION}'; git diff --name-only ${FROM}..HEAD lists only the lane's files; if a file under offline/src changed, say exactly what and why (the fixer's product_defect).
${RULES}
BUDGET: about 60 tool calls, hard cap 80. Return verdict (FIX only for a BLOCKER, HIGH or MEDIUM), tip, results (one per id), findings (ids C-R8-1, ...), gates (one line each with its log path), trunk_suite (counts, failing names, log paths of every preview run), territory, not_checked.`

const reviewPrompt = (lens, note) => `You are the ${lens === 'contracts' ? 'contracts-and-tests' : 'safety copy, privacy and the person\'s data'} reviewer of the flagged lane actions-sos (build chat CORE, 1-addic offline build), on the fix round FIX-R8 only: judge ${FROM}..HEAD (git -C ${WT} diff ${FROM}..HEAD), reading the earlier code as context. Your lens judged the whole lane before and found it clean of HIGH and MEDIUM at ${FROM} (${SCR}/actions-sos__review-${lens}.md). The round fixes three test defects the trunk merge preview showed (the lane's tests assumed the worktree's store stand-in and the lane's older content): ${JSON.stringify(FINDINGS.map(f => f.id + ': ' + f.expected))}. The fixer's note: ${JSON.stringify(note)}.
${lens === 'contracts'
  ? 'YOUR LENS: the tests. Is any assertion weaker than before (an expectation dropped, loosened or made conditional on the store kind)? Does a test now pass vacuously (a stub that makes it trivially true, a wait that returns before the state it waits for, a branch that skips the assertion on the real store)? Do the stubs have the trunk shapes (git -C C:/Users/ruchi/1-addic show build/offline-v1:offline/src/content-core.js for Content.resources and catalogs; store.js for Store.lock and status)? Is every stub restored? Are the waits deterministic (a condition with a loud timeout), and do RS20 and RS22 still prove what their names say on the real store?'
  : 'YOUR LENS: any product code the round changed (offline/src): SOS never gated or interrupted, urgent help one tap away on the lock screen and in SOS, the PIN and lock behaviour for a person, nothing derived decreases, no new copy or phrase without clinicalReview.'}
Read-only on the code: write notes only, appended under a heading "# Round FIX-R8 (${NOW})" to ${SCR}/actions-sos__review-${lens}.md; you may write probe tests only under ${SCR}/ and run them with node --test; never edit the worktree, commit, push or touch the trunk checkout. ${RULES}
BUDGET: about 40 tool calls, hard cap 80. Return findings ranked most severe first (ids R8-${lens === 'contracts' ? 'RC' : 'RS'}1, ...), questions, tip; verdict PASS unless a BLOCKER, HIGH or MEDIUM; results [] (none to re-check).`

const verifyPrompt = f => `You are an independent skeptic checking ONE finding about lane actions-sos (1-addic offline build), worktree ${WT}, after its fix round FIX-R8 (${FROM}..HEAD). Try to REFUTE it: default to real=false if after checking you cannot reproduce or confirm it.
THE FINDING:
${JSON.stringify(f, null, 1)}
Check it against the code at HEAD and, when it names the trunk, against git -C C:/Users/ruchi/1-addic show build/offline-v1:<file>. When a test run can decide it, use a scratch tree under C:/Users/ruchi/1-addic-wt/_logs/scratch/as-verify-r8-<id> (${PREVIEW('as-verify-r8-' + String(f.id).replace(/[^A-Za-z0-9-]/g, ''))}) or a probe under ${SCR}/; never edit the worktree or the trunk checkout. Budget about 30 tool calls. Return id, real, severity (yours; NONE when not real), reason, evidence.`

phase('Fix')
const note = await agent(fixPrompt, { label: 'fix:actions-sos:FIX-R8', phase: 'Fix', agentType: 'lane-builder-flagged', effort: 'max', schema: NOTE_SCHEMA })
if (!note) { log('the FIX-R8 fixer returned no note (cap?): its commits and ' + SCR + '/actions-sos__fix-r8.md are on disk'); return { note: null, recheck: null, reviews: [], verdicts: [] } }
log(`FIX-R8: ${(note.done || []).map(d => d.unit + ' ' + (d.shas || []).join(',')).join('; ')}; tip ${note.tip}; product_defect: ${note.product_defect}; files ${(note.files_changed || []).join(', ')}`)
const srcChanged = (note.files_changed || []).some(f => /offline\/src\//.test(f)) || !/^none/i.test(String(note.product_defect || 'none').trim())
const jobs = [{ kind: 'recheck' }, { kind: 'review', lens: 'contracts' }].concat(srcChanged ? [{ kind: 'review', lens: 'safety' }] : [])
if (srcChanged) log('product code changed in FIX-R8: the safety lens reviews the round too')
phase('Recheck')
const out = await pipeline(jobs,
  j => j.kind === 'recheck'
    ? agent(recheckPrompt(note), { label: 'recheck:actions-sos:r8', phase: 'Recheck', agentType: 'lane-checker', schema: FIND_SCHEMA })
    : agent(reviewPrompt(j.lens, note), { label: 'review:' + j.lens + ':actions-sos:r8', phase: 'Recheck', agentType: 'lane-reviewer', schema: FIND_SCHEMA }),
  (r, j) => {
    if (!r) return { job: j, result: null, verdicts: [] }
    const serious = (r.findings || []).filter(f => ['BLOCKER', 'HIGH', 'MEDIUM'].includes(f.severity))
    const notFixed = (r.results || []).filter(x => x && x.id)
      .filter(x => x.state !== 'FIXED').map(x => ({ id: x.id + '-OPEN', severity: 'MEDIUM', where: x.id, scenario: 'the re-checker says ' + x.state, evidence: x.evidence, fix: 'finish ' + x.id }))
    return parallel(serious.concat(notFixed).map(f => () => agent(verifyPrompt(f), { label: 'verify:' + f.id, phase: 'Verify', agentType: 'lane-checker', schema: VERDICT_SCHEMA })))
      .then(vs => ({ job: j, result: r, verdicts: vs.filter(Boolean), lost: vs.filter(v => !v).length }))
  })
return { note, srcChanged, out }
