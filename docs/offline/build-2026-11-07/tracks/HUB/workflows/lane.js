export const meta = {
  name: '1-addic-lane',
  description: '1-addic offline edition build (7 November 2026): one lane of one build chat (CORE or SCREENS), parameterised by args. A scout writes the brief and the contract; a fresh lane builder per batch (the first batch is the slice; lane-builder-flagged on the flagged lanes core and actions-sos, lane-builder on the others); the independent lane-checker with one fix round; on a flagged lane the two lane-reviewers (contracts and tests; safety copy, privacy and the person\'s data) once at its end; the lane report under 20 KB, staged under 1-addic-wt/_logs/reports and copied into the program docs with cp.',
  phases: [
    { title: 'Scout', detail: 'start: scout only: the scout reads the plan rows, the overlap register and the base worktree, writes the brief (under 15 KB) and the contract into 1-addic-wt/_logs/briefs and copies them into tracks/<chat>/briefs and /contracts' },
    { title: 'Build', detail: 'a fresh lane builder per batch of args.batches not in args.done, in order; sliceRun builds batches[0] only; each builder returns the hand-off note with its tip' },
    { title: 'Check', detail: 'lane-checker on args.diffFrom...HEAD (default base...HEAD), the gates script and the brief; a FIX verdict is fixed one effort level up and re-checked once' },
    { title: 'Review', detail: 'flagged lanes only: two lane-reviewers over base...HEAD (contracts and tests; safety copy, privacy and the person\'s data), once per lane at its end; one fix round; each finder re-checks once; skipped on sliceRun or skipReview' },
    { title: 'Report', detail: 'the lane report (at most 20 KB) staged at 1-addic-wt/_logs/reports/<lane>-report.md and copied into tracks/<chat>/lane-reports/<lane>.md' },
  ],
}

// The 1-addic lane workflow: the offline edition build of 7 November 2026 (docs/offline/BUILD-PLAN.md sections 2, 5, 7
// and 9; the program plan docs/offline/build-2026-11-07/PLAN.md). Adapted from the Kriya pharma program's pharma_lane.js
// (kriya/structured docs/02-execution/pharma-program-2026-10-29/tracks/PHARMA/workflows), whose shape it keeps: agents
// launched by agentType (the type sets model, effort and the 80-turn cap; a fix round passes one effort level up),
// builders get the brief, the previous hand-off note and their batch; the checker and the reviewers get the diff and the
// brief, never a builder's conversation. Every name comes from args. Gone from the source: the backend/frontend split
// (repo), the databases, servers and locks, the migration slices, Prisma, pnpm, Docker and INT's scripts; the gates are
// this program's tools/gates.py and tools/check_territory.py; reviewers run on the flagged lanes only.
//
// HOW A BUILD CHAT CALLS IT. Copy the lane's object out of tracks/HUB/workflows/lane_args.json (key lanes.<lane>), add
// base (the BASE line of coordination/status-HUB.md when the lane is cut), slot (the lane's slot n on the chat's SLOTS
// line), session (the chat's session id: the Claude-Session trailer) and now (the clock's stamp), then
//   Workflow({ scriptPath: 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/HUB/workflows/lane.js',
//              args: { ...laneObject, base: '<sha>', slot: 1, session: '<session id>', now: '2026-11-07 08:12 IST',
//                      start: 'scout' } })
// The runs of one lane, in order: (1) start: 'scout' (returns {lane, briefPath, contractPath}); (2) the chat cuts the
// worktree: python tracks/HUB/workflows/cut_lane.py <lane> <base> (this script cannot read the disk: the first builder
// checks the worktree exists and stops at once if not: the run throws WORKTREE-MISSING; cut, then relaunch WITHOUT
// resumeFromRunId, since the cached builder note would replay the block); (3) sliceRun: true (batches[0] only, the
// checker with one fix round, the slice report, no reviewers; returns {state: 'READY-SLICE', tip}: the chat writes
// "READY-SLICE <lane> <tip>" on coordination/status-<chat>.md); (4) the resume: the same args plus done: [the slice's
// unit], priorNote: <the slice builder's note>, diffFrom: '<the slice tip>' (the check judges the commits after it; on a
// flagged lane the two reviewers judge base...HEAD once at the end); returns {state: 'READY'|'RED'|'STOPPED', tip,
// reportPath, findings}: the chat writes "LANE: <lane> READY <tip>".
// The acceptance dry run (no agent is launched; the script walks to the Check phase):
//   Workflow({ scriptPath: '<the path above>', args: { lane: 'engine', chat: 'CORE', units: [], dryRun: true, now: '2026-11-07 06:40 IST' } })
// Locally, without the runtime: node tracks/HUB/workflows/wf_sim.mjs tracks/HUB/workflows/lane.js
//   tracks/HUB/workflows/lane_args.json --lane engine --with '{"sliceRun":true,"base":"<sha>","slot":1,"session":"test","now":"..."}'
// args (all optional unless said): lane* (^[a-z][a-z0-9-]+$), chat* (CORE|SCREENS), units (ids in build order), batches
// ([[ids]]; batches[0] is the slice, one unit), unitTier ({unit: 1|2}), unitNotes ({unit: note}), tier, files, area (the
// lane's files in words), flagged (default true for core and actions-sos only), base* (not in dryRun), slot, brief,
// contract (default tracks/<chat>/briefs|contracts/<lane>.md), session, laneNote, start ('scout'|'build'|'check'|
// 'review'|'report'; default 'build'), sliceRun, done, priorNote, carried ({check, review}), reviewGates ([{unit, after,
// question}]), reviewOnly (['contracts'|'safety']), knownFindings, diffFrom, skipReview, dryRun, now (the clock's stamp;
// the only source of a date in this run).
// Forbidden here by the Workflow tool: the clock (the Date object), random numbers, any filesystem or Node API, module loading (the stamp comes in as args.now).

const REPO = 'C:/Users/ruchi/1-addic'
const DOCS = REPO + '/docs/offline/build-2026-11-07'
const WT = 'C:/Users/ruchi/1-addic-wt'
const BASE_WT = WT + '/_base'
const LOGS = WT + '/_logs'
const TOOLS = DOCS + '/tools'
const GATES = TOOLS + '/gates.py'
const TERRITORY_CHECK = TOOLS + '/check_territory.py'
const WORKFLOWS = DOCS + '/tracks/HUB/workflows'
const CUT = WORKFLOWS + '/cut_lane.py'
const ARGS_FILE = WORKFLOWS + '/lane_args.json'
const COORD = DOCS + '/coordination'
const STATUS = COORD + '/status-HUB.md'
const BASELINES = COORD + '/baselines.md'
const TERRITORY_MAP = COORD + '/territory.json'
const OVERLAP = COORD + '/overlap-register.md'
const PLAN = DOCS + '/PLAN.md'
const SPEC = REPO + '/docs/offline/BUILD-PLAN.md'
const GUIDE = REPO + '/docs/BUILD-GUIDE.md'
const TRUNK = 'build/offline-v1'
const CHATS = { CORE: ['core', 'engine', 'actions-sos', 'learn', 'tests-docs'], SCREENS: ['today-track', 'workbook-settings', 'actions', 'game-tutorials', 'content'] }
const FLAGGED_LANES = ['core', 'actions-sos']
// BUILD-PLAN.md section 3 by line: the contracts every lane builds on.
const SEC3 = '3.1 parts line 48, 3.2 namespaces and contracts 72, 3.3 storage and lock 138, 3.4 data rows 146, 3.5 routes 167, 3.6 lessons 171, 3.7 events and game rules 183, 3.8 exercises 187, 3.9 insights and planner 193, 3.10 Recovery Plan 200, 3.11 guidance 204, 3.12 look 208, 3.13 tests 212, 3.14 guide 220'
const SEC3_SHORT = 'lines: 3.1 48, 3.2 72, 3.3 138, 3.4 146, 3.5 167, 3.6 171, 3.7 183, 3.8 187, 3.9 193, 3.10 200, 3.11 204, 3.12 208, 3.13 212, 3.14 220'
const DECISIONS = 'O1 the file offline/1-addic.html, title "1-addic", discreet title "Notebook"; O2 a PIN offered, never forced; O3 the India numbers marked "please verify", plus an international list; O4 read-aloud by the device\'s speechSynthesis only; O5 no Gujarati, locale \'en\' everywhere; O6 a "Load sample data" button, marked and erasable; O7 a tier-2 screen honestly working, a stub or locked, never a dead button; O8 the .docx guide in the tag if its skeleton merges'
const RULES = `THE RULES (BUILD-PLAN section 2, lines 33-42; docs/BUILD-GUIDE.md "Rules for every step"): SOS works offline, is never gated and never interrupted by a tip or tutorial; urgent help is one tap from SOS; no streak resets, random rewards or points for claimed sober days; no network, no trackers; contacts never leave the device; accessible (keyboard, labels, visible focus, reduced motion, contrast, 44 px targets). Original content only: never the source book's text (docs/book/ notes give ideas, never wording). Tone: person-first (never "addict" as a noun), adult-to-adult, never moralising, grade 6-8. Content safety and restraint: substance use brief and clinical (never how to get, prepare or take it; no sensations, no doses); crisis content shows the urgent-help numbers and says little else; such passages carry clinicalReview: true; unsure, write the shorter version. Numbers and links in Content.resources carry verify: true. Nothing ever decreases (XP, mastery, badges, total days and the Harbor's light come from the append-only event log; a slip restarts only the opt-in current run). Territory: your files only, shared files at their append points. No new failure by name.`

// ---------- args ----------
const A = args || {}
const lane = A.lane
const chat = A.chat
const dryRun = A.dryRun === true
if (!lane || typeof lane !== 'string' || !/^[a-z][a-z0-9-]+$/.test(lane)) throw new Error('lane.js: args.lane is missing or not a lane id (^[a-z][a-z0-9-]+$, e.g. engine); got ' + JSON.stringify(A.lane))
if (!chat || !/^(CORE|SCREENS)$/.test(String(chat))) throw new Error('lane.js: args.chat is missing or not one of CORE|SCREENS (got ' + JSON.stringify(A.chat) + ')')
const otherChat = chat === 'CORE' ? 'SCREENS' : 'CORE'
if (CHATS[otherChat].includes(lane)) throw new Error(`lane.js: ${lane} is a lane of ${otherChat}, not of ${chat} (BUILD-PLAN section 5)`)
if (!CHATS[chat].includes(lane)) log(`${lane}: not one of ${chat}'s lanes in BUILD-PLAN section 5 (${CHATS[chat].join(', ')}); continuing with the args as given`)
if (!dryRun && !/^[0-9a-f]{7,40}$/.test(String(A.base || ''))) throw new Error('lane.js: args.base must be the BASE sha of coordination/status-HUB.md (7 to 40 hex chars, not a placeholder); got ' + JSON.stringify(A.base))
if (A.slot != null && !(Number.isInteger(Number(A.slot)) && Number(A.slot) > 0)) throw new Error('lane.js: args.slot must be a positive whole number (the lane\'s slot on the chat\'s SLOTS line); got ' + JSON.stringify(A.slot))
const base = A.base || '<base>'
const slot = A.slot != null ? Number(A.slot) : null
const FLAGGED = A.flagged === true || (A.flagged !== false && FLAGGED_LANES.includes(lane))
const session = A.session || '<the build chat\'s session id: pass args.session>'
const NOW = A.now || '<args.now was not passed: take the stamp from the clock (date) and never invent one>'
const start = A.start || 'build'
const sliceRun = A.sliceRun === true
const doneBefore = Array.isArray(A.done) ? A.done.map(String) : []
const unitsAll = Array.isArray(A.units) ? A.units.map(String) : []
const units = unitsAll.filter(u => !doneBefore.includes(u))
const carried = A.carried || {}
const reviewGates = Array.isArray(A.reviewGates) ? A.reviewGates : []
const laneNote = A.laneNote || ''
const unitNotes = A.unitNotes || {}
const unitTier = A.unitTier || {}
const files = Array.isArray(A.files) ? A.files.map(String) : []
const AREA = ((A.area || '') + (files.length ? (A.area ? ' Files: ' : '') + files.join(', ') : '')) || '(args.area and args.files not passed: the brief\'s "Your files" section is your area)'
const reviewOnly = Array.isArray(A.reviewOnly) && A.reviewOnly.length ? A.reviewOnly : null
const knownFindings = A.knownFindings || ''
const DIFF_FROM = A.diffFrom || null
if (!['scout', 'build', 'check', 'review', 'report'].includes(start)) throw new Error('lane.js: args.start must be scout|build|check|review|report; got ' + JSON.stringify(start))

const W = {
  wt: WT + '/' + lane, branch: 'build/' + lane, base,
  scratch: LOGS + '/reports/' + lane,
  reportStage: LOGS + '/reports/' + lane + '-report.md',
  reportAnnex: LOGS + '/reports/' + lane + '-report-annex.md',
  reportHub: DOCS + '/tracks/' + chat + '/lane-reports/' + lane + '.md',
  brief: A.brief || (DOCS + '/tracks/' + chat + '/briefs/' + lane + '.md'),
  contract: A.contract || (DOCS + '/tracks/' + chat + '/contracts/' + lane + '.md'),
  briefStage: LOGS + '/briefs/' + lane + '__brief.md',
  contractStage: LOGS + '/briefs/' + lane + '__contract.md',
  chatStatus: COORD + '/status-' + chat + '.md',
}
W.units = W.scratch + '/' + lane + '__units.md'
W.progress = W.scratch + '/' + lane + '__progress.md'
W.checkNotes = W.scratch + '/' + lane + '__check.md'

// Batches: args.batches filtered to the units still to build (an id in a batch but not in args.units is dropped with a
// log line; a unit in no batch gets a batch of its own at the end). Without args.batches: the slice rule (one unit first),
// then two or three per batch.
function chunk(list) {
  const out = []
  for (let i = 0; i < list.length;) {
    const left = list.length - i
    const n = left === 4 ? 2 : Math.min(3, left)
    out.push(list.slice(i, i + n)); i += n
  }
  return out
}
let plannedBatches
if (Array.isArray(A.batches) && A.batches.length) {
  plannedBatches = []
  const seen = new Set()
  for (const b of A.batches) {
    const ids = (Array.isArray(b) ? b : [b]).map(String)
    const unknown = ids.filter(u => !unitsAll.includes(u))
    if (unknown.length) log(`${lane}: batch ids not in args.units are dropped: ${unknown.join(', ')}`)
    const keep = ids.filter(u => units.includes(u) && !seen.has(u))
    keep.forEach(u => seen.add(u))
    if (keep.length) plannedBatches.push(keep)
  }
  const orphan = units.filter(u => !seen.has(u))
  if (orphan.length) { log(`${lane}: units in no batch get batches of their own: ${orphan.join(', ')}`); plannedBatches.push(...chunk(orphan)) }
} else {
  plannedBatches = units.length ? [[units[0]]].concat(chunk(units.slice(1))) : []
}
// A tier boundary never sits inside a batch (BUILD-PLAN section 5: tier 1 before tier 2): a mixed batch is logged, not split.
plannedBatches.forEach(b => {
  const ts = Array.from(new Set(b.map(u => unitTier[u]).filter(t => t != null)))
  if (ts.length > 1) log(`${lane}: the batch ${b.join('+')} crosses a tier boundary (tiers ${ts.join(', ')}): split it in lane_args.json`)
})
// sliceRun: batches[0] whatever its length.
const batchesToRun = sliceRun ? plannedBatches.slice(0, 1) : plannedBatches
const unitsToRun = batchesToRun.flat()

const LEVELS = ['low', 'medium', 'high', 'xhigh', 'max']
const up = e => LEVELS[Math.min(LEVELS.indexOf(e) + 1, LEVELS.length - 1)]
const BUILDER = FLAGGED ? 'lane-builder-flagged' : 'lane-builder'
// One level above the builder type's own effort (lane-builder-flagged xhigh, lane-builder high: the HUB's agent files).
const FIX_EFFORT = up(FLAGGED ? 'xhigh' : 'high')

// ---------- the shared text ----------
const NEIGHBOURS = `THE NEIGHBOURS (the overlap register ${OVERLAP}; the territory map ${TERRITORY_MAP}; ${SPEC} section 9, lines 344-358). A lane edits only its own files plus the shared files at their append points, never another lane's files:
- CORE: core = offline/build.mjs, offline/src/shell.html, styles.css, ui-core.js, store.js, boot.js, offline/tests/store.test.mjs, root package.json (all but its scripts and devDependencies keys); engine = offline/src/engine.js, offline/tests/logic.test.mjs, engine-*.test.mjs; actions-sos = offline/src/actions.js, ui-sos.js, ui-onboarding.js (the lock screen too), offline/tests/actions.test.mjs; learn = offline/src/ui-exercise.js, ui-learn.js; tests-docs = offline/tests/browser.test.mjs, screens.mjs, helpers/*, offline/docs/*, offline/README.md, docs/decisions/0022-*.md, package.json's scripts and devDependencies keys, package-lock.json, the "## Offline edition" sections of README.md and CLAUDE.md.
- SCREENS: today-track = offline/src/ui-today.js, ui-track.js, ui-harbor.js; workbook-settings = ui-settings.js, ui-workbook.js, ui-plan.js; actions = ui-actions.js, ui-practices.js; game-tutorials = ui-game.js, ui-guidance.js, ui-tools.js; content = content-lessons-b.js, content-lessons-c.js, content-exercises.js, content-practices.js, content-sample.js and content-core.js (its owner).
- Append points: build.mjs's parts list between // -- parts -- and // -- end parts -- (one line per new file, in the order of 3.1); styles.css a new section at the end under /* -- <lane> -- */ (tokens never redefined); content-core.js after /* -- additions -- */; package.json committed by path by both owners. By request only (your note's for_the_chat; the build chat sends it to the owner): shell.html, ui-core.js (a page registers through UI.pages from its own file), engine.js, store.js, actions.js (a UI lane that needs a new rule writes the pure function in its own ui-*.js for the day and files the request).
- Protected, never touched: main, origin/main, the claude/* branches, the trunk ${TRUNK} (the HUB merges into it), docs/PLAN.md, docs/BUILD-GUIDE.md, docs/decisions/0001-0021, docs/book/, docs/program/, scripts/, data/, .claude/settings.json, docs/offline/ (the HUB's: only the cp of a brief, contract or report goes there), the pharma program and its launcher.
- The territory check: python ${TERRITORY_CHECK} ${lane} ${base}..HEAD --wt ${W.wt} (an ERROR line = another lane's file; a warning = a file no lane owns, allowed and explained in the lane report).`

// The builders' copy of the neighbours: short, because a builder prompt stays under 12 KB (the territory check and the
// map are the authority; the scout and the checker get the full NEIGHBOURS above).
const NEIGHBOURS_SHORT = `THE NEIGHBOURS: every file not in "Your files" belongs to another lane or the HUB (coordination/territory.json in ${DOCS} says whose; a shared file's rule is in coordination/overlap-register.md there): never edit it. Append points: build.mjs's parts list between // -- parts -- and // -- end parts -- (one line per file, in 3.1's order); styles.css a section at the end under /* -- ${lane} -- */ (no token redefined); content-core.js after /* -- additions -- */; never reorder or reformat a shared file. By request only (for_the_chat in your note): shell.html and ui-core.js (core; a page registers through UI.pages from its own file), store.js (core), engine.js (engine), actions.js (actions-sos); meanwhile write the pure function in your own file. Protected: docs/PLAN.md, docs/BUILD-GUIDE.md, docs/decisions/0001-0021, docs/book/, docs/program/, docs/offline/, scripts/, data/, .claude/settings.json.`

const WHERE = `WHERE YOU WORK
- Lane ${lane} of ${chat}${slot ? ' (slot ' + slot + ')' : ''}. Worktree ${W.wt}, branch ${W.branch}, cut from ${TRUNK} at ${base}. Work ONLY there. Your files: ${AREA}
- FIRST STEP: git -C ${W.wt} rev-parse --abbrev-ref HEAD. If the worktree is missing or not on ${W.branch}, stop: return the note at once with blocked = every unit of your batch, why "WORKTREE-MISSING: run python ${CUT} ${lane} ${base} first".
- No database, server or Docker. ${BASE_WT} is the base, READ-ONLY. A lane you call that has not merged: build to its contract (tracks/<CHAT>/contracts/<lane>.md in ${DOCS}) and BUILD-PLAN 3.2; switch to the real module when it merges.
- Gates ONLY through the gates script (it takes the repo lock; one call at a time; Bash timeout 600000; never poll a lock; a call that times out runs once more with run_in_background, then read its log):
  iterate:   python ${GATES} --wt ${W.wt} --lane ${lane} test   (or node --test offline/tests/<file>; never the browser suite outside the script)
  batch end: python ${GATES} --wt ${W.wt} --lane ${lane} build test validate guards   (+ browser if your lane has browser tests, + docs for offline/docs; --full is the HUB's)
  It prints GATE <name> GREEN|RED|SKIP|VOID ... log=<path> and FAIL <test> lines; exit 0 green or skip, 1 red, 2 void (re-run once; void twice goes in your note, never green). Judge failures BY NAME against ${BASELINES} (empty on the base); re-run a failure under load alone once. Before a browser run: grep -m1 "^QUIET:" ${STATUS}; while it says running, one sleep 600, then re-read.
- THE SLICE RULE: the first batch is the slice (one unit); committed and green, it is merged at once (READY-SLICE ${lane} <tip>), so commit nothing half-done; a later batch never changes the slice's public shape without a line in the note.
- Scratch ${W.scratch}/ (mkdir -p; files prefixed ${lane}): keep ${lane}__progress.md there (one line per unit: started / committed <sha> / gates) and ${lane}__units.md (YOUR OUTPUT). Write and Edit are REFUSED under ${REPO}/ (${WT}/ is yours): never write there.
- Commit small, at every green unit and at least every 45 minutes, the message naming the unit, written to a scratch file: git -C ${W.wt} commit -F <file>; stage BY PATH, never git add -A, -u or .; every message ends with exactly:
Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: ${session}
- Never push, merge, rebase or stash; never checkout over uncommitted work; never touch another worktree, the base, ${REPO} or the branches ${TRUNK}, main, claude/*. No new npm dependency unless your unit names one. Windows, Git Bash: an odd count of single quotes breaks a heredoc, so write scripts and messages with Write into the scratch folder. LF line endings; never reformat lines you did not change.
- Decisions in force, never re-opened: ${DECISIONS}. A unit the brief marks DROPPED, HELD or MOVED is not built.
- The spec, by range, only what your batch needs: ${SPEC} section 3 (${SEC3_SHORT}), section 5 your units (238-301), 7 gates (313-324), 9 territory (344-358).

${RULES}

${NEIGHBOURS_SHORT}`

// ---------- schemas ----------
const NOTE_SCHEMA = {
  type: 'object',
  properties: {
    done: { type: 'array', items: { type: 'object', properties: { unit: { type: 'string', description: 'the bare unit id exactly as your batch names it (e.g. U-05, U-20a), or a finding id in a fix round (e.g. C1, RS2); never a description' }, shas: { type: 'array', items: { type: 'string' } } }, required: ['unit', 'shas'] } },
    tip: { type: 'string', description: 'git -C <worktree> rev-parse --short HEAD after your last commit' },
    in_flight: { type: 'string', description: 'what is half-done and where (files, the last clean commit), or "none"' },
    next: { type: 'array', items: { type: 'object', properties: { unit: { type: 'string' }, first_step: { type: 'string' } }, required: ['unit', 'first_step'] } },
    files_touched: { type: 'array', items: { type: 'string' } },
    shared_touched: { type: 'array', items: { type: 'string' }, description: 'the shared files you appended to, each with its append point and line number' },
    one_thing: { type: 'string', description: 'the fact the next builder must not rediscover' },
    evidence: { type: 'array', items: { type: 'string' }, description: 'the gate log paths (log=...) that prove the tests and the gates' },
    blocked: { type: 'array', items: { type: 'object', properties: { unit: { type: 'string' }, why: { type: 'string' } }, required: ['unit', 'why'] } },
    for_the_chat: { type: 'array', items: { type: 'string' }, description: 'what the build chat must send on (a request to another lane\'s owner for a file that is not yours, a contract change for a consuming lane, a question for the HUB)' },
    steps_used: { type: 'number', description: 'your tool steps, roughly' },
  },
  required: ['done', 'tip', 'in_flight', 'next', 'files_touched', 'one_thing', 'evidence', 'steps_used'],
}

const NOTE_RULES = `YOUR OUTPUT. When the batch is done, at about 60 tool calls (the hard cap is 80; an agent cut off at the cap loses its note: count your calls), or when a unit cannot be finished: commit what is clean, return the hand-off note (the structured result) and stop: done (units with SHAs), tip (git -C ${W.wt} rev-parse --short HEAD), in_flight, next (unit, first step), files_touched, shared_touched (append points, lines), one_thing (what the next builder must not rediscover), evidence (gate log paths), blocked (unit, why), for_the_chat (requests to another lane's owner, contract changes for a consuming lane, questions for the HUB), steps_used.
First bring ${W.units} up to date, one section per unit: SHAs; what a person can now do, screen by screen; the public names added or changed (functions, events, content keys, routes, UI.pages entries, data-tour targets) and who consumes them; shared files touched; passages marked clinicalReview: true and resources marked verify: true (file, key); docs owed; questions closed; open questions with the default taken. The lane report is built from that file only.`

const SCOUT_SCHEMA = {
  type: 'object',
  properties: {
    briefPath: { type: 'string', description: 'the docs path of the brief after the cp' },
    contractPath: { type: 'string', description: 'the docs path of the contract after the cp' },
    briefBytes: { type: 'number' },
    units: { type: 'array', items: { type: 'object', properties: { unit: { type: 'string' }, note: { type: 'string', description: 'one line: what the brief says about this unit, or HELD/DROPPED with why' } }, required: ['unit', 'note'] } },
    questions: { type: 'array', items: { type: 'string' }, description: 'open questions for the build chat with the default the brief takes' },
    read: { type: 'array', items: { type: 'string' } },
  },
  required: ['briefPath', 'contractPath', 'briefBytes', 'units'],
}

const CHECK_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FIX'] },
    tip: { type: 'string', description: 'git -C <worktree> rev-parse --short HEAD when you judged' },
    units: { type: 'array', items: { type: 'object', properties: { unit: { type: 'string' }, state: { type: 'string' } }, required: ['unit', 'state'] } },
    findings: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, severity: { type: 'string', enum: ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW'] }, unit: { type: 'string' },
      where: { type: 'string' }, expected: { type: 'string' }, evidence: { type: 'string' } }, required: ['id', 'severity', 'where', 'expected', 'evidence'] } },
    gates: { type: 'array', items: { type: 'string' } },
    territory: { type: 'string', description: 'the territory check\'s summary line and its warnings explained, or why it was not run' },
    not_checked: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'units', 'findings', 'gates'],
}

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
  required: ['findings', 'questions'],
}

const RECHECK_SCHEMA = {
  type: 'object',
  properties: {
    results: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, state: { type: 'string', enum: ['FIXED', 'NOT-FIXED', 'PARTLY', 'WONTFIX-ACCEPTED'] }, note: { type: 'string' } }, required: ['id', 'state', 'note'] } },
    new_findings: { type: 'array', items: { type: 'string' } },
    tip: { type: 'string' },
  },
  required: ['results'],
}

const GATE_SCHEMA = {
  type: 'object',
  properties: { approved: { type: 'boolean' }, findings: { type: 'array', items: { type: 'string' } }, note: { type: 'string' } },
  required: ['approved', 'findings', 'note'],
}

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    stagedPath: { type: 'string' }, hubPath: { type: 'string' }, bytes: { type: 'number' },
    copied: { type: 'boolean', description: 'true when cp into the program docs succeeded' },
  },
  required: ['stagedPath', 'hubPath', 'bytes', 'copied'],
}

// ---------- prompts ----------
function fmtNote(n) {
  if (!n) return ''
  return `done: ${(n.done || []).map(d => d.unit + ' (' + (d.shas || []).join(', ') + ')').join('; ') || 'none'}
tip: ${n.tip || '?'}
in flight: ${n.in_flight}
next: ${(n.next || []).map(x => x.unit + ': ' + x.first_step).join('; ') || 'none'}
files touched: ${(n.files_touched || []).join(', ')}${n.shared_touched && n.shared_touched.length ? '\nshared files appended: ' + n.shared_touched.join(', ') : ''}
the one thing to know: ${n.one_thing}
evidence: ${(n.evidence || []).join(', ')}${n.blocked && n.blocked.length ? '\nblocked: ' + n.blocked.map(b => b.unit + ': ' + b.why).join('; ') : ''}${n.for_the_chat && n.for_the_chat.length ? '\nfor the build chat: ' + n.for_the_chat.join(' | ') : ''}`
}

const batchText = batch => batch.map(u => `- ${u}${unitTier[u] ? ' (tier ' + unitTier[u] + ')' : ''}${unitNotes[u] ? ': ' + unitNotes[u] : ''}`).join('\n')

function scoutPrompt() {
  return `You are the scout of lane ${lane} of build chat ${chat}, the 1-addic offline edition build of 7 November 2026 (the clock says ${NOW}). You write the lane's brief and its contract; you build nothing and change no repository file.

THE LANE: units ${unitsAll.join(', ') || '(none passed)'} in this build order; batches ${JSON.stringify(plannedBatches)} (the first batch is the slice: what the chain needs most; it is merged first; tier 1 before tier 2). Flagged: ${FLAGGED ? 'yes (two reviewers at the end: contracts and tests; safety copy, privacy and the person\'s data)' : 'no'}. Your files: ${AREA}
THE UNITS (the build chat's notes):
${batchText(unitsAll) || '(none)'}${laneNote ? '\nTHE BUILD CHAT\'S WORD: ' + laneNote : ''}

READ, in this order, by range (batch independent reads in one step; your cap is 80 tool calls and about 60 is your budget):
1. The unit definitions: ${SPEC} section 5 (lines 238-301: your lane's paragraph under Track ${chat}, the dependencies and the chain order at its end) and the contracts your units build on in section 3 (${SEC3}); the rules of section 2 (lines 33-42), the gates of section 7 (313-324), territory of section 9 (344-358). The program plan ${PLAN} (the HUB's order and anything it says of your lane; if it is missing, say so in questions). The args file ${ARGS_FILE}: its _readme and your lane's object only.
2. The overlap register ${OVERLAP} and the territory map ${TERRITORY_MAP}: the rows of every file your units touch (the owner, the append point, the rule).
3. The base worktree ${BASE_WT} (READ-ONLY; detached at ${base}): the files your units extend or call, with path:line (at the plan's base offline/src held content-core.js and content-lessons-a.js, M0-M3); git -C ${BASE_WT} log --oneline -10.
4. ${GUIDE} "Rules for every step" (line 33, by range).${['learn', 'content', 'game-tutorials'].includes(lane) ? ' docs/book/exercises.md and docs/book/glossary.md as IDEAS only (paraphrased notes; never copy the source book\'s wording into the brief or the contract).' : ''}
5. The status of your chat ${W.chatStatus} (the last section: the HUB's notes for the scouts) and the header of ${STATUS} (STATE, BASE, SLOTS, QUIET).
Never run a gate or a test; never write into the base worktree.

WRITE (the Write and Edit tools are refused under ${REPO}/ for you; ${WT}/ is a different folder: write into the staging folder there, then copy with Bash cp):
- mkdir -p ${LOGS}/briefs "${DOCS}/tracks/${chat}/briefs" "${DOCS}/tracks/${chat}/contracts"
- The brief at ${W.briefStage}, UNDER 15,000 bytes (check with wc -c; trim), in this shape: what the lane is for; your files (owned; shared at their append points; do not touch, with the neighbours); the units in order, one section each (today at the base with path:line; build: what and where, the section-3 contract it implements; acceptance: section 5's "done when"; tests: the Node test names, and the browser test names of 3.13 it feeds; the rules that bite here: clinicalReview, verify, nothing decreases, SOS never gated; closes), the slice marked; the decisions that bite (${DECISIONS}); the open questions with the default the builder takes; the gates (python ${GATES} --wt ${W.wt} --lane ${lane} build test validate guards, and browser or docs where they apply) and the baselines by name (${BASELINES}); the go-aheads (none unless the build chat's word above names one).
- The contract at ${W.contractStage}: every public name the lane adds or relies on (namespace and function signatures, events with their fields, content keys and shapes, routes and UI.pages entries, data-tour targets, the DOM hooks the browser tests use), which exist at the base (path:line in ${BASE_WT}) and which wait for another lane (named), and for each the lane that consumes it or "none yet".
- Then: cp ${W.briefStage} "${W.brief}" and cp ${W.contractStage} "${W.contract}"; ls -la both to prove the copies.

${RULES}

${NEIGHBOURS}

Return the structured result: briefPath and contractPath (the docs paths), briefBytes, units (one line each), questions, read.`
}

function builderPrompt(batch, prevNote, extra, findingsNote) {
  const fixRound = batch[0] === 'the fix round'
  // findingsNote (a fix round only): {text, files}, the finders' findings, placed between extra and the build chat's word.
  const word = laneNote ? `THE BUILD CHAT'S WORD (${chat}; it wins over the brief where they differ):\n` + laneNote : ''
  const isSlice = !fixRound && (sliceRun || (batchesToRun.length > 0 && !doneBefore.length && batchesToRun[0].some(u => batch.includes(u))))
  const compose = (prev, fnd) => `You are a lane builder of build chat ${chat}, lane ${lane}${FLAGGED ? ' (flagged: two reviewers judge the whole lane at its end: contracts and tests; safety copy, privacy and the person\'s data)' : ''}, the 1-addic offline edition build of 7 November 2026. The clock said ${NOW} when this run started: never invent a date; take stamps from date.

YOUR BATCH, in this order, each unit as its own commits (the build chat's notes; the brief has the detail):
${fixRound ? '- the fix round (below)' : batchText(batch)}
Build these and nothing else.${isSlice ? ' THIS BATCH IS THE SLICE: it ends committed, complete and green, with the contract\'s public shape as the brief states it.' : ''}

READ: the brief ${W.brief} (plan, files, acceptance, append points, open questions with defaults) and the contract ${W.contract} (what you build to; where the base code and the brief disagree, the code wins: say so in your note).
RESUME FIRST, in one step: the FIRST STEP below; git -C ${W.wt} status --short; git -C ${W.wt} log --oneline --first-parent ${base}..HEAD; read ${W.progress} if it exists. Never redo a committed unit; never discard uncommitted work unread (a half-done unit of your batch is yours to finish).
${prev ? '\nTHE PREVIOUS BUILDER\'S HAND-OFF NOTE:\n' + prev + '\n' : ''}${extra || fnd || word ? '\n' + [extra, fnd ? 'THE FINDINGS:\n' + fnd : '', word].filter(Boolean).join('\n') + '\n' : ''}
${WHERE}

${NOTE_RULES}`
  // Under 12 KB: the prior note (at most 2,000 characters) is cut further to fit; the rest is on disk. A fix round's
  // findings travel in full, at most 12,000 characters, and are cut to fit the same way (V3-15); the rest is in the
  // finders' notes files, which the tail names.
  const LIMIT = 12000
  const tail = ' ... (cut to fit the prompt: the rest is in ' + W.progress + ' and git log)'
  const fTail = findingsNote ? ' ... (cut to fit the prompt: the full findings are in ' + (findingsNote.files || []).join(' or ') + ')' : ''
  let prev = prevNote ? (String(prevNote).length > 2000 ? cut(prevNote, 2000) + tail : String(prevNote)) : ''
  let fnd = findingsNote ? (String(findingsNote.text).length > LIMIT ? cut(findingsNote.text, LIMIT) + fTail : String(findingsNote.text)) : ''
  let text = compose(prev, fnd)
  if (text.length > LIMIT && fnd) {
    fnd = cut(fnd, Math.max(300, fnd.length - (text.length - LIMIT) - fTail.length)) + fTail
    text = compose(prev, fnd)
  }
  if (text.length > LIMIT && prev) {
    prev = cut(prev, Math.max(300, prev.length - (text.length - LIMIT) - tail.length)) + tail
    text = compose(prev, fnd)
  }
  return text
}

// The checker judges from (diffFrom || base); the reviewers always judge from the base (the whole lane, once at its end).
const readOnlyText = from => `You change nothing in the repository (you are read-only on the code; you may write your own notes in ${W.scratch}/ and never under ${REPO}/: the Write and Edit tools are refused there). Your input is the lane's diff and the brief, never a builder's conversation: the units by git -C ${W.wt} diff --stat ${from}...HEAD, then the diff by file and range (git -C ${W.wt} diff ${from}...HEAD -- <file>);${from !== base ? ` THIS IS A CONTINUATION RUN: the units ${doneBefore.join(', ') || '(see the report)'} were built and checked by an earlier run up to ${from} (its report: ${W.reportStage}); judge ONLY the commits after it (git -C ${W.wt} log --oneline ${from}..HEAD) and read the earlier code only as context.` : ''} the brief ${W.brief}, the contract ${W.contract}, and the builders' units record ${W.units}. Gates ONLY through python ${GATES} --wt ${W.wt} --lane ${lane} <gates> (it takes the repo lock itself; Bash timeout 600000, and a call that times out runs once more with run_in_background; before a browser run read "QUIET:" on ${STATUS} and wait ten minutes while it says running); cite each GATE line's log= path; judge every failure BY NAME against the baselines ${BASELINES}; a VOID twice is "not checked", never green. Never push, merge, rebase, stash, checkout or touch another worktree, ${BASE_WT} or the trunk checkout ${REPO}.`
const READ_ONLY = readOnlyText(DIFF_FROM || base)
const READ_ONLY_WHOLE = readOnlyText(base)

function notesText(notes) {
  return notes.map((n, i) => `--- builder ${i + 1} (${n.batch.join(', ')}) ---\n${n.note ? fmtNote(n.note) : '(no hand-off note returned: ' + (n.why || 'probably stopped at its turn cap') + ')'}`).join('\n')
}

function checkPrompt(notes, built, heldList) {
  const gateList = 'build test validate guards' + (lane === 'tests-docs' ? ' browser docs' : '')
  return `You are the independent checker of lane ${lane} of build chat ${chat}, the 1-addic offline edition build of 7 November 2026${sliceRun ? ' (THE SLICE CHECK: the first batch only)' : ''}. Worktree ${W.wt}, branch ${W.branch}, base ${base}; the tip is HEAD of the worktree. The units the lane was to build${sliceRun ? ' in this slice' : ''}: ${doneBefore.concat(unitsToRun).join(', ') || '(none listed)'} (the builders report built: ${built.join(', ') || 'none'}; held or blocked, not to be judged as missing: ${heldList.map(h => h.unit + ' (' + h.why + ')').join('; ') || 'none'}).

${READ_ONLY}

Check: every unit present and meeting its acceptance (the brief's "done when", from BUILD-PLAN section 5) and the contract (names, signatures, events, content keys and routes as written, or the note says why they changed); the tests the brief names exist and pass; the gates, once: python ${GATES} --wt ${W.wt} --lane ${lane} ${gateList}${lane === 'tests-docs' ? '' : ' (add browser when the lane has browser tests)'}, each GATE and FAIL line judged by name against the baselines; the territory: python ${TERRITORY_CHECK} ${lane} ${base}..HEAD --wt ${W.wt} (an ERROR line = another lane's file touched = a BLOCKER; a warning = a file no lane owns: allowed, explained in your "territory" line); the shared files touched only at their append points, and shell.html, ui-core.js, engine.js, store.js and actions.js untouched unless this lane owns them; THE RULES below kept (SOS never gated or interrupted; urgent help one tap from SOS; nothing decreases, proved by a test where the lane touches the event log; no network and no external URL outside resources and references; no innerHTML with data; no text from the source book; crisis and medical copy brief with clinicalReview: true; verify: true on resources; person-first, grade 6-8); the decisions (${DECISIONS}); the commit messages carry the two trailer lines (Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com> and Claude-Session: ${session}); nothing committed that is not the lane's (logs, node_modules, .env, scratch files). Write each finding, the moment you have it, to ${W.checkNotes} (id, severity, unit, file:line, expected, evidence).

${RULES}

${NEIGHBOURS}

The builders' hand-off notes:
${notesText(notes)}

Return the structured result: verdict PASS or FIX; tip; units present or missing; findings (each with an id C1, C2, ..., severity, unit, file:line, what is expected, the evidence path); gates (one line each with its log path); territory; not_checked.`
}

// A fix round's findings go to the fixer in full, one JSON line each, and name the finders' notes files (the checker's
// ${lane}__check.md; each reviewer's ${lane}__review-<lens>.md, written as the reviewer goes); builderPrompt caps them at
// 12,000 characters and cuts them to fit the prompt as it does the prior note (V3-15: the old 2,000-character compaction
// left the fixer the ids only, R-C-12).
function findingsText(findings, files) {
  return (findings || []).map(f => JSON.stringify({ id: f.id, severity: f.severity, unit: f.unit, where: cut(f.where, 200), what: cut(f.scenario || f.expected, 400), evidence: cut(f.evidence, 200), fix: cut(f.fix, 300) })).join('\n') + `\n(each finder's full notes: ${files.join(' or ')})`
}

function fixPrompt(findings, source, files) {
  return builderPrompt(['the fix round'], null, `THIS SESSION IS A FIX ROUND, not a batch of units: the lane's units are built; ${source} returned the findings below. Fix each finding once, in its own commit naming the finding's id (BLOCKER, HIGH and MEDIUM always; a LOW one only when it is a small, safe change inside the lane's files; a finding you judge wrong is not fixed: say why in your note's one_thing with the evidence). Run the touched tests and the gates through the gates script. In your note, "done" lists each finding id with its fix SHAs (unit = the finding id), and "blocked" lists the ones you did not fix with the reason.`, { text: findingsText(findings, files), files })
}

function recheckPrompt(findings, fixNote, lens) {
  return `You are ${lens} of lane ${lane} of build chat ${chat}, the 1-addic offline edition build, re-checking ONCE the fixes made to your findings. Worktree ${W.wt}, branch ${W.branch}, base ${base}.

${READ_ONLY}

Your findings:
${JSON.stringify(findings, null, 1)}

The fixer's note:
${fmtNote(fixNote) || '(no note returned)'}

For each finding: read the fix commit (git -C ${W.wt} show <sha>) and the code it touches, run the test that proves it when there is one (through the gates script), and judge FIXED, PARTLY, NOT-FIXED or WONTFIX-ACCEPTED (the fixer's reason holds). A regression the fix introduced is a new finding. Return the structured result with the tip.`
}

const LENSES = [
  { key: 'contracts', id: 'RC', who: 'the contracts-and-tests reviewer', ask: 'the contracts and the tests: every namespace function, verb, event, content key, route, UI.pages entry and data-tour target matches the lane contract, BUILD-PLAN section 3 and its callers (the lanes that consume it, or the module a screen calls); every acceptance criterion has a test that fails without the change; refusal paths (a wrong PIN, a bad import, an invalid content row, an empty log) tested as carefully as the happy path; "nothing ever decreases" and "a slip restarts only the current run" proved by tests wherever the lane touches the event log; determinism (no clock or random number inside a rule without an injected now); export then import identical; the shared files at their append points, the territory kept; the browser test names of 3.13 the lane feeds exist' },
  { key: 'safety', id: 'RS', who: 'the safety-copy, privacy and data reviewer', ask: 'safety copy, privacy and the person\'s data: SOS works offline, is never gated by a PIN, a tutorial, a tip or a reveal, and is never interrupted; urgent help is one tap from SOS and reachable on the lock screen without the PIN; crisis routing (hopelessness, thoughts of death) shows the numbers at once and says little else; every substance, craving, slip and medical passage is brief, clinical, person-first and grade 6-8, with no method, dose or sensation, and carries clinicalReview: true; numbers carry verify: true and show "please verify" (O3); no text from the source book; encryption and the lock: the PIN offered, never forced (O2), the key derived as the contract says, nothing readable in storage when a PIN is set, a wrong PIN refused, no plaintext copy left in another key, label, log or export the person did not ask for; the person\'s data: no network, no tracker, no external URL outside resources and references, contacts never leave the device, export, import, erase and print do exactly what they say, the sample data marked and erasable (O6), the discreet title (O1); and no streak reset, random reward or points for claimed sober days' },
]

function reviewPrompt(lens, check) {
  return `You are ${lens.who} of the flagged lane ${lane} of build chat ${chat}, the 1-addic offline edition build of 7 November 2026. Your lens: ${lens.ask}. Worktree ${W.wt}, branch ${W.branch}, base ${base}; the tip is HEAD of the worktree. You judge the WHOLE lane, ${base}...HEAD (the reviewers run once per lane at its end), whatever a continuation run's diffFrom says for the checker.

${READ_ONLY_WHOLE}

${RULES}

The lane check already ran (verdict ${check ? check.verdict : 'not run'}); do not repeat its findings: ${check ? JSON.stringify(check.findings.map(f => f.id + ' ' + f.where + ': ' + f.expected)).slice(0, 3000) : '[]'}${knownFindings ? '\nAlready found by the other reviewer and fixed (do not repeat them): ' + knownFindings.slice(0, 3000) : ''}

YOUR BUDGET: about 60 tool calls; your hard cap is 80 and an agent cut off at the cap returns NOTHING. So: batch independent reads in one step; read the diff by file and range, never whole large files; write each finding, the moment you have it, to ${W.scratch}/${lane}__review-${lens.key}.md (id, severity, unit, file:line, scenario, evidence, fix); and at about 60 calls stop reading and return what you have.

Return the structured result: findings ranked most severe first, each with an id (${lens.id}1, ...), severity, unit, file:line, the failure scenario in one sentence (the input and the wrong outcome), the evidence (a path, a test, or the lines), and the fix you suggest; questions for the lane (a hunch is a question with the line that raised it, not a finding); tip; the files you read.`
}

function gatePrompt(g) {
  return `You are a fresh reviewer of lane ${lane} of build chat ${chat}, asked ONE question before the lane may build ${g.unit}: ${g.question}
The units it depends on (${g.after.join(', ')}) are committed in ${W.wt} (branch ${W.branch}, base ${base}); read their commits (git -C ${W.wt} log --oneline ${base}..HEAD; git show <sha>), the brief ${W.brief} and the contract ${W.contract}.

${READ_ONLY}

Return approved (true only if the work answers the question with no finding that must be fixed first), the findings (each one sentence with file:line), and a note.`
}

function reportPrompt(kind, factsText, builtNow) {
  const common = `The report is STAGED at ${W.reportStage} (mkdir -p ${LOGS}/reports first) and then copied into the program docs with Bash: mkdir -p "${DOCS}/tracks/${chat}/lane-reports" && cp ${W.reportStage} "${W.reportHub}" (the Write and Edit tools are refused under ${REPO}/ for you; the cp is how the docs get it). At most 20,000 bytes: check with wc -c and trim; the evidence stays on disk and is cited by path; if it would exceed, move the longest "### Docs owed" text to ${W.reportAnnex} and leave one line pointing there. Never edit a repository file. Dates come from ${NOW} or git log, never invented.`
  if (kind === 'update') {
    return `Your job this time is to UPDATE a lane report, not to write a new one: lane ${lane} of build chat ${chat}, the 1-addic offline edition build, ${reviewOnly ? 'had its review round re-run for the lens(es) ' + reviewOnly.join(', ') : 'was CONTINUED from ' + DIFF_FROM + ': this run built ' + (builtNow.join(', ') || 'nothing') + ', its check judged only the commits after ' + DIFF_FROM + (sliceRun || !FLAGGED ? '' : ', and the two reviewers judged the whole lane ' + base + '...HEAD')}. Edit ${W.reportStage} in place (if it is missing, cp "${W.reportHub}" ${W.reportStage} first; if both are missing, write a new one in the shape of a lane report): add this run's units under "### Units" (SHAs, what changed for a person using the file, the questions closed; read ${W.units} by range for them), its commits to the commit list and the new tip at the top (git -C ${W.wt} log --oneline ${base}..HEAD), its builders under "### Turn caps", its gates (VERIFIED and ASSUMED, with log paths), the territory line, its check and its review findings (each: id, severity, unit, fix SHA, the finder's re-check state) after the existing ones, each block headed with this run's date; update the held units, "### Contract changes", "### Safety and content marks", "### Requests for other lanes", "### Docs owed", "### Open questions" and "### For the HUB at the merge" for the new units; the state line at the top (READY, READY-SLICE, RED or STOPPED, with the tip). Keep every earlier line unless this run changes it. ${common}

THIS RUN'S FACTS:
${factsText}

Return the structured result: stagedPath, hubPath, bytes, copied.`
  }
  return `Your job this time is a ${kind === 'slice' ? 'SLICE REPORT (the lane\'s first batch is built and checked; the lane continues' + (FLAGGED ? '; no reviewers ran yet' : '') + ')' : 'LANE REPORT (the lane is finished)'}, not a brief: lane ${lane} of build chat ${chat}, the 1-addic offline edition build of 7 November 2026. Write ${W.reportStage} from (1) the builders' units record ${W.units} (read it by range if it is over 20 KB), (2) git -C ${W.wt} log --oneline ${base}..HEAD, and (3) the run's facts below. ${common}

Shape, in plain words, these headings: "## ${lane} (${chat}, 1-addic offline build): the ${kind === 'slice' ? 'slice' : 'lane'} report" with the state line (${kind === 'slice' ? 'READY-SLICE' : 'READY'}, RED or STOPPED: from the facts' state), branch, base, tip SHA and the commit list; "### Turn caps" (for each builder its steps_used and whether it returned no note; capHits from the facts); "### Units" (each: SHAs, what changed for a person using the file, the questions it closes; held or blocked units with why; ${kind === 'slice' ? 'the units still to build on this lane' : 'nothing left'}); "### Contract changes" (the public names added or changed: namespace functions with their signatures, events with their fields, content keys, routes and UI.pages entries, data-tour targets; for each, the lane that consumes it or "none yet"); "### Gates" (VERIFIED and ASSUMED, separate, each GATE line with its log path; the territory check's line and its warnings explained); "### Review gates" (each gate's question, the commit it read, its verdict and findings, verbatim; omit if none); "### Check" (the verdict, each finding and its fix SHA and re-check state); "### Review" (${!FLAGGED ? 'not a flagged lane: no reviewers run; say so in one line' : kind === 'slice' ? 'not run on a slice: the two reviewers run once at the lane\'s end' : 'each finding, severity, fix SHA, the finder\'s re-check state; what is still open goes to the owner as an open finding'}); "### Safety and content marks" (the passages marked clinicalReview: true and the resources marked verify: true, by file and key: what the clinical reviewer and the owner must check); "### Requests for other lanes" (each: the file, its owner lane, what is asked; from the notes' for_the_chat); "### Docs owed" (offline/README.md, the guide, CLAUDE.md lines, as text); "### Open questions" (each with the default built); "### For the HUB at the merge" (the shared files touched at their append points, package.json and package-lock.json changes, conflicts to expect, the territory warnings, the browser tests to run in the quiet window).

THE RUN'S FACTS:
${factsText}

Return the structured result: stagedPath, hubPath, bytes, copied.`
}

// ---------- helpers ----------
// A note's unit matches an id when it is the id, or the id followed by a separator ("U-05: ..." counts for U-05;
// "U-20a" does not count for U-20, and an entry that is exactly another unit of THIS lane never counts for a prefix).
// Only the lane's own ids (args.units) are ever matched.
function matchUnit(entry, u) {
  const e = String(entry || '').trim()
  if (e === u) return true
  if (unitsAll.includes(e)) return false
  return e.startsWith(u) && /^[\s:(,;.\-]/.test(e.slice(u.length))
}
// An agent that ends without its structured result (most often its 80-turn cap) returns null instead of failing
// the lane's whole run; the caller treats null as a cap stop.
async function run(prompt, opts) {
  if (opts.agentType === BUILDER && prompt.length > 12288) log(`${opts.label}: the builder prompt is ${prompt.length} characters, over 12 KB (a long priorNote, laneNote or unit notes): shorten them`)
  try { return await agent(prompt, opts) } catch (e) { log(`${opts.label}: no structured result (${String(e && e.message || e).slice(0, 120)})`); return null }
}
const cut = (x, n) => String(x == null ? '' : x).slice(0, n)
const compactFindings = fs => (fs || []).map(f => ({ id: f.id, severity: f.severity, unit: f.unit, where: cut(f.where, 200), what: cut(f.scenario || f.expected, 300), fix: cut(f.fix, 160), evidence: cut(f.evidence, 160) }))
const compactRecheck = r => r ? { results: (r.results || []).map(x => ({ id: x.id, state: x.state, note: cut(x.note, 260) })), new_findings: (r.new_findings || []).map(x => cut(x, 500)) } : null
const openOf = (recheck, findings) => recheck ? (recheck.results || []).filter(r => r.state !== 'FIXED' && r.state !== 'WONTFIX-ACCEPTED').length : (findings || []).length

// ---------- Dry run: no agent is launched ----------
if (dryRun) {
  const wouldLaunch = []
  log(`DRY RUN of lane ${lane} (${chat}${slot ? ', slot ' + slot : ''}): worktree ${W.wt}, branch ${W.branch}, base ${base}; flagged ${FLAGGED ? 'yes' : 'no'}, builder ${BUILDER}; brief ${W.brief}; report ${W.reportStage} -> ${W.reportHub}`)
  if (start === 'scout') {
    phase('Scout')
    wouldLaunch.push({ label: 'scout:' + lane, agentType: 'scout', phase: 'Scout' })
    log(`DRY RUN: would launch scout:${lane} (agentType scout) for units ${unitsAll.join(', ') || '(none)'}`)
  }
  if (start === 'build' || start === 'scout') {
    phase('Build')
    if (!batchesToRun.length) log(`DRY RUN: no units to build (units ${JSON.stringify(unitsAll)}, done ${JSON.stringify(doneBefore)}): no builder would launch`)
    batchesToRun.forEach((b, i) => {
      wouldLaunch.push({ label: `build:${lane}:${b.join('+')}`, agentType: BUILDER, phase: 'Build', units: b, slice: i === 0 && !doneBefore.length })
      log(`DRY RUN: would launch build:${lane}:${b.join('+')} (agentType ${BUILDER}; units ${b.join(', ')}${i === 0 && !doneBefore.length ? '; the slice' : ''})`)
    })
    reviewGates.forEach(g => { wouldLaunch.push({ label: 'gate:' + g.unit, agentType: 'lane-reviewer', phase: 'Build' }); log(`DRY RUN: would launch gate:${g.unit} (lane-reviewer) before ${g.unit}`) })
  }
  if (start !== 'scout' && start !== 'review' && start !== 'report') {
    phase('Check')
    wouldLaunch.push({ label: 'check:' + lane, agentType: 'lane-checker', phase: 'Check', diff: (DIFF_FROM || base) + '...HEAD' })
    log(`DRY RUN: would launch check:${lane} (agentType lane-checker) over ${DIFF_FROM || base}...HEAD, then fix:check:${lane} (${BUILDER}, effort ${FIX_EFFORT}) and recheck:check:${lane} (lane-checker) on a FIX verdict`)
    log('DRY RUN: reached the checker')
  }
  if (start !== 'scout' && !sliceRun && !A.skipReview && start !== 'report' && FLAGGED) {
    phase('Review')
    const ls = reviewOnly ? LENSES.filter(l => reviewOnly.includes(l.key)) : LENSES
    ls.forEach(l => { wouldLaunch.push({ label: `review:${l.key}:${lane}`, agentType: 'lane-reviewer', phase: 'Review', diff: base + '...HEAD' }) })
    log(`DRY RUN: would launch ${ls.map(l => 'review:' + l.key + ':' + lane).join(' and ')} (lane-reviewer, in parallel) over ${base}...HEAD, then one fix round and each finder's re-check`)
  }
  if (start !== 'scout') {
    phase('Report')
    wouldLaunch.push({ label: 'report:' + lane, agentType: 'scout', phase: 'Report', path: W.reportStage, hub: W.reportHub })
    log(`DRY RUN: would launch report:${lane} (agentType scout) -> ${W.reportStage} copied to ${W.reportHub}`)
  }
  return { dryRun: true, lane, chat, slot, flagged: FLAGGED, builder: BUILDER, worktree: W.wt, branch: W.branch, base, batches: batchesToRun, wouldLaunch }
}

// ---------- Scout ----------
if (start === 'scout') {
  phase('Scout')
  const s = await run(scoutPrompt(), { label: 'scout:' + lane, phase: 'Scout', agentType: 'scout', schema: SCOUT_SCHEMA })
  if (!s) { log(`${lane}: the scout returned no structured result; the brief may be on disk at ${W.briefStage}: check it, then relaunch start: 'scout' or cp it by hand`); return { lane, briefPath: null, contractPath: null, staged: W.briefStage, state: 'STOPPED' } }
  log(`${lane}: brief ${s.briefPath} (${s.briefBytes} bytes), contract ${s.contractPath}; ${(s.units || []).length} unit notes, ${(s.questions || []).length} questions`)
  return { lane, briefPath: s.briefPath, contractPath: s.contractPath, briefBytes: s.briefBytes, units: s.units, questions: s.questions || [] }
}

// ---------- Build ----------
const notes = []
let builtSet = new Set(doneBefore)
let capHits = 0
let check = carried.check || null
let checkFix = null, checkRecheck = null
let review = carried.review || null
let reviewFix = null, reviewRecheck = null
const held = []
const gateResults = []
let stopped = null
let lastTip = DIFF_FROM || null
const noteTip = n => { if (n && n.tip) lastTip = n.tip }

if (start === 'build') {
  phase('Build')
  let remaining = unitsToRun.slice()
  let prev = A.priorNote || ''
  let stalls = 0
  let builders = 0
  const MAX_BUILDERS = batchesToRun.length + 4
  if (!remaining.length) log(`${lane}: nothing to build (units ${JSON.stringify(unitsAll)}, done ${JSON.stringify(doneBefore)})`)
  while (remaining.length && builders < MAX_BUILDERS) {
    const planned = batchesToRun.find(b => b.some(u => remaining.includes(u)))
    let batch = planned ? planned.filter(u => remaining.includes(u)) : remaining.slice(0, 3)
    // A unit behind a review gate starts only when a fresh reviewer approves the units it depends on.
    const gated = batch.filter(u => reviewGates.some(g => g.unit === u))
    for (const u of gated) {
      const g = reviewGates.find(x => x.unit === u)
      if (!(g.after || []).every(a => builtSet.has(a))) { held.push({ unit: u, why: 'its prerequisite ' + (g.after || []).join(', ') + ' is not built' }); remaining = remaining.filter(x => x !== u); continue }
      const verdict = await run(gatePrompt(g), { label: 'gate:' + u, phase: 'Build', agentType: 'lane-reviewer', schema: GATE_SCHEMA })
      log(`review gate before ${u}: ${verdict ? (verdict.approved ? 'approved' : 'not approved') : 'no answer'}`)
      gateResults.push({ unit: u, after: g.after, question: g.question, verdict })
      if (!verdict || !verdict.approved) {
        held.push({ unit: u, why: 'the review gate did not approve: ' + (verdict ? verdict.findings.join(' | ') + ' ' + verdict.note : 'no answer') })
        remaining = remaining.filter(x => x !== u)
      }
    }
    batch = batch.filter(u => remaining.includes(u))
    if (!batch.length) continue
    builders++
    const n = await run(builderPrompt(batch, prev, null), { label: `build:${lane}:${batch.join('+')}`, phase: 'Build', agentType: BUILDER, schema: NOTE_SCHEMA })
    if (!n) {
      capHits++
      notes.push({ batch, note: null, why: 'no hand-off note returned (the builder probably stopped at its 80-turn cap)' })
      prev = `(The previous builder of ${batch.join(', ')} returned no hand-off note: it probably stopped at its turn cap. Its commits and ${W.progress} are on disk: read them first and finish its batch.)`
      stalls++
    } else {
      notes.push({ batch, note: n })
      noteTip(n)
      const missingWt = (n.blocked || []).find(b => /WORKTREE-MISSING/.test(b.why || ''))
      if (missingWt) throw new Error(`lane.js: the worktree ${W.wt} on ${W.branch} does not exist: ${missingWt.why}. Cut it with cut_lane.py and relaunch WITHOUT resumeFromRunId (the cached builder note would replay the block).`)
      const doneIds = remaining.filter(u => (n.done || []).some(d => matchUnit(d.unit, u)))
      doneIds.forEach(u => builtSet.add(u))
      const blockedIds = batch.filter(u => !doneIds.includes(u) && (n.blocked || []).some(b => matchUnit(b.unit, u)))
      for (const u of blockedIds) held.push({ unit: u, why: 'blocked: ' + ((n.blocked || []).find(b => matchUnit(b.unit, u)) || {}).why })
      remaining = remaining.filter(u => !doneIds.includes(u) && !blockedIds.includes(u))
      if (n.steps_used >= 75) capHits++
      stalls = doneIds.length ? 0 : stalls + 1
      prev = fmtNote(n)
    }
    log(`${lane}: ${builtSet.size}/${unitsAll.length} built (${unitsToRun.filter(u => builtSet.has(u)).length}/${unitsToRun.length} of this run), ${remaining.length} left, ${held.length} held, tip ${lastTip || '?'}`)
    if (stalls >= 2) { stopped = 'two builders in a row made no progress'; log(`${lane}: ${stopped}; stopping the build for build chat ${chat}`); break }
  }
  if (remaining.length) {
    if (!stopped && builders >= MAX_BUILDERS) stopped = 'the builder budget (' + MAX_BUILDERS + ') is spent'
    held.push(...remaining.filter(u => !held.some(h => h.unit === u)).map(u => ({ unit: u, why: 'not built when the build loop ended' })))
  }
}
const built = start === 'build' ? Array.from(builtSet) : doneBefore.concat(unitsToRun)
const builtNow = built.filter(u => !doneBefore.includes(u))

// ---------- Check ----------
let toFix = []
if (start === 'build' || start === 'check') {
  phase('Check')
  check = await run(checkPrompt(notes, built, held), { label: 'check:' + lane, phase: 'Check', agentType: 'lane-checker', schema: CHECK_SCHEMA })
  if (check && check.tip) lastTip = check.tip
  toFix = check ? check.findings.filter(f => f.severity !== 'LOW' || check.verdict === 'FIX') : []
  if (check && check.verdict === 'FIX' && toFix.length) {
    checkFix = await run(fixPrompt(toFix, 'the lane check', [W.checkNotes]), { label: 'fix:check:' + lane, phase: 'Check', agentType: BUILDER, effort: FIX_EFFORT, schema: NOTE_SCHEMA })
    noteTip(checkFix)
    checkRecheck = await run(recheckPrompt(toFix, checkFix, 'the independent checker'), { label: 'recheck:check:' + lane, phase: 'Check', agentType: 'lane-checker', schema: RECHECK_SCHEMA })
    if (checkRecheck && checkRecheck.tip) lastTip = checkRecheck.tip
  }
  if (!check) log(`${lane}: the checker returned no structured result`)
}

// ---------- Review ----------
// Flagged lanes only (core, actions-sos), once per lane at its end, over base...HEAD; not on a slice run;
// args.skipReview: a small follow-up run of an already reviewed lane (its own check covers it; the build chat's call).
// reviewOnly re-runs one lens.
const lensesRun = reviewOnly ? LENSES.filter(l => reviewOnly.includes(l.key)) : LENSES
// No reviewers when the build loop stopped (two stalls or the builder budget) or built nothing: the state is STOPPED
// regardless and the lane is relaunched.
const REVIEWS = FLAGGED && !sliceRun && start !== 'report' && A.skipReview !== true && !stopped && !(start === 'build' && unitsToRun.length && !builtNow.length)
if (REVIEWS) {
  phase('Review')
  const rs = review || await parallel(lensesRun.map(lens => () =>
    run(reviewPrompt(lens, check), { label: `review:${lens.key}:${lane}`, phase: 'Review', agentType: 'lane-reviewer', schema: REVIEW_SCHEMA })))
  review = rs
  rs.filter(Boolean).forEach(r => { if (r.tip) lastTip = r.tip })
  const all = rs.filter(Boolean).flatMap(r => r.findings)
  if (all.length) {
    reviewFix = await run(fixPrompt(all, 'the two reviewers', lensesRun.map(l => W.scratch + '/' + lane + '__review-' + l.key + '.md')), { label: 'fix:review:' + lane, phase: 'Review', agentType: BUILDER, effort: FIX_EFFORT, schema: NOTE_SCHEMA })
    noteTip(reviewFix)
    reviewRecheck = await parallel(lensesRun.map((lens, i) => () => {
      const mine = rs[i] ? rs[i].findings : []
      return mine.length ? run(recheckPrompt(mine, reviewFix, lens.who), { label: `recheck:${lens.key}:${lane}`, phase: 'Review', agentType: 'lane-reviewer', schema: RECHECK_SCHEMA }) : Promise.resolve(null)
    }))
    reviewRecheck.filter(Boolean).forEach(r => { if (r.tip) lastTip = r.tip })
  }
}

// ---------- State ----------
// A FIX verdict with no finding listed launches no fix round: it stays one open item (never READY on a FIX verdict).
const openCheck = check ? (check.verdict === 'FIX' ? (toFix.length ? openOf(checkRecheck, check.findings) : 1) : 0) : null
const reviewFindingsAll = review ? review.filter(Boolean).flatMap(r => r.findings) : []
// reviewRecheck is the ARRAY parallel() returned (one re-check per lens, null where the lens had no findings or its
// re-checker was lost at its cap): flatten it; a lens with findings and no re-check result counts as still open.
const openReview = !REVIEWS ? 0 : reviewRecheck ? reviewRecheck.filter(Boolean).flatMap(r => r.results || []).filter(r => r.state !== 'FIXED' && r.state !== 'WONTFIX-ACCEPTED').length + lensesRun.filter((l, i) => review[i] && review[i].findings.length && !reviewRecheck[i]).length : reviewFindingsAll.filter(f => f.severity !== 'LOW').length
const reviewersLost = REVIEWS && review ? review.filter(r => !r).length : 0
let state
if (stopped || (start === 'build' && unitsToRun.length && !builtNow.length)) state = 'STOPPED'
else if ((start === 'build' || start === 'check') && !check) state = 'STOPPED'
else if (openCheck > 0 || openReview > 0 || reviewersLost > 0) state = 'RED'
else state = sliceRun ? 'READY-SLICE' : 'READY'
const heldNow = held.filter(h => unitsToRun.includes(h.unit))
if (state !== 'STOPPED' && heldNow.length) { state = 'RED'; log(`${lane}: ${heldNow.length} unit(s) held or blocked: the lane is RED until the build chat rules`) }

// ---------- Report ----------
phase('Report')
const facts = {
  lane, chat, slot, flagged: FLAGGED, state, base, branch: W.branch, worktree: W.wt, tip: lastTip, diffFrom: DIFF_FROM, sliceRun, now: NOW,
  units: unitsAll, unitTier, builtByEarlierRun: doneBefore, builtThisRun: builtNow, built, held, capHits, stopped, reviewGates: gateResults, priorNote: cut(A.priorNote || '', 1500),
  builders: notes.map(n => ({ batch: n.batch, steps_used: n.note ? n.note.steps_used : null, note: n.note ? cut(fmtNote(n.note), 2500) : n.why })),
  check: check ? { verdict: check.verdict, tip: check.tip, units: check.units, findings: compactFindings(check.findings), gates: check.gates, territory: cut(check.territory, 600), not_checked: check.not_checked } : null,
  checkFix: checkFix ? cut(fmtNote(checkFix), 2500) : null, checkRecheck: compactRecheck(checkRecheck), openCheck,
  reviewLenses: REVIEWS ? lensesRun.map(l => l.key) : [],
  review: review ? review.map(r => r ? { findings: compactFindings(r.findings), questions: (r.questions || []).map(q => cut(q, 300)) } : '(no result: the reviewer stopped at its cap)') : null,
  reviewFix: reviewFix ? cut(fmtNote(reviewFix), 2500) : null, reviewRecheck: reviewRecheck ? reviewRecheck.map(compactRecheck) : null, openReview,
}
const factsText = JSON.stringify(facts, null, 1)
log(`${lane}: state ${state}, tip ${lastTip || '?'}; report facts ${factsText.length} chars`)
const kind = (reviewOnly || DIFF_FROM) ? 'update' : sliceRun ? 'slice' : 'lane'
const rep = await run(reportPrompt(kind, factsText, builtNow), { label: (kind === 'update' ? 'report-update:' : 'report:') + lane, phase: 'Report', agentType: 'scout', schema: REPORT_SCHEMA })
if (!rep) log(`${lane}: the report agent returned no structured result; look for ${W.reportStage}`)
else if (!rep.copied) log(`${lane}: the report was staged at ${rep.stagedPath} but NOT copied into the program docs: the build chat runs cp ${W.reportStage} "${W.reportHub}"`)

const findings = {
  check: check ? compactFindings(check.findings) : [],
  checkRecheck: compactRecheck(checkRecheck),
  review: compactFindings(reviewFindingsAll),
  reviewRecheck: reviewRecheck ? reviewRecheck.map(compactRecheck) : null,
  openCheck, openReview, reviewersLost,
}
return {
  lane, chat, slot, tip: lastTip, state,
  built, builtThisRun: builtNow, held, capHits, stopped,
  checkVerdict: check ? check.verdict : 'not run',
  reportPath: rep ? (rep.copied ? rep.hubPath : rep.stagedPath) : W.reportStage, reportStaged: W.reportStage, reportBytes: rep ? rep.bytes : null,
  findings,
  statusLine: state === 'READY-SLICE' ? `READY-SLICE ${lane} ${lastTip || '<tip>'}` : `LANE: ${lane} ${state} ${lastTip || '<tip>'}`,
}
