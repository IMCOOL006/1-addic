// wf_sim.mjs: a local simulator of the Workflow runtime, for the 1-addic lane workflow (lane.js) and any script written
// for the same API. No agent is ever launched and nothing is written unless --dump is given.
//
// Usage:  node wf_sim.mjs <script.js> <args.json> [--lane <id>] [--with '<json>'] [--fix] [--dump <dir>]
//   <args.json>  the args object; when it holds "lanes" (lane_args.json), --lane <id> picks lanes.<id>
//   --with       a JSON object merged on top of the args (base, slot, session, now, sliceRun, done, ...)
//   --fix        the checker answers FIX with two findings and each reviewer one, so the fix rounds run
//   --dump <dir> writes every prompt to <dir>/<n>-<label>.txt for reading
//
// What it does, as the real runtime does: reads the script text, removes the `export const meta = {...}` statement
// (parsed separately: its phase titles are printed), and wraps the rest in an async function with the parameters
// args, agent, parallel, pipeline, phase, log (so a top-level return is legal). The clock (Date), Math.random, require,
// process and fetch are poisoned inside: touching them throws, as the Workflow tool forbids them. Stubs:
//   phase(title)          records the title (and checks it is one of meta.phases)
//   agent(prompt, opts)   records {label, agentType, phase, effort, promptBytes} and returns a canned result:
//                         builder (build:*, fix:*) a hand-off note with done = the batch's units and tip deadbeef1;
//                         checker {verdict: 'PASS', ...}; re-check {results}; reviewer {findings: []};
//                         review gate {approved: true}; scout {briefPath, contractPath}; report {stagedPath, copied}
//   parallel(fns)         runs the thunks and returns their results in order
//   pipeline(items, a, b) maps each item through a, then b
//   log(msg)              prints the line
// Then prints the phases reached, the agents launched (label, type, prompt size) and the returned object.
// Checks (each one a PROBLEM line and exit 1): the script throws; an agent without label, agentType or schema; a phase
// not in meta.phases; a prompt containing "undefined", "[object Object]" or "NaN"; a builder prompt over 12 KB.
// Exit 0 clean, 1 a problem, 2 usage.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BUILDER_TYPES = ['lane-builder', 'lane-builder-flagged']
const BUILDER_LIMIT = 12 * 1024
const TIP = 'deadbeef1'

function usage(msg) {
  if (msg) console.error('wf_sim: ' + msg)
  console.error("usage: node wf_sim.mjs <script.js> <args.json> [--lane <id>] [--with '<json>'] [--fix] [--dump <dir>]")
  process.exit(2)
}

// ---------- the command line ----------
const argv = process.argv.slice(2)
const pos = []
const opt = { lane: null, with: null, fix: false, dump: null }
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--lane') opt.lane = argv[++i]
  else if (a === '--with') opt.with = argv[++i]
  else if (a === '--fix') opt.fix = true
  else if (a === '--dump') opt.dump = argv[++i]
  else if (a.startsWith('--')) usage('unknown option ' + a)
  else pos.push(a)
}
if (pos.length !== 2) usage('two positional arguments are needed')
const [scriptPath, argsPath] = pos

let args
try { args = JSON.parse(readFileSync(argsPath, 'utf8')) } catch (e) { usage('cannot read the args file ' + argsPath + ': ' + e.message) }
if (args && args.lanes && typeof args.lanes === 'object') {
  if (!opt.lane) usage(argsPath + ' holds "lanes": pick one with --lane <id> (' + Object.keys(args.lanes).join(', ') + ')')
  if (!args.lanes[opt.lane]) usage('no lanes.' + opt.lane + ' in ' + argsPath)
  args = JSON.parse(JSON.stringify(args.lanes[opt.lane]))
}
if (opt.with) {
  let extra
  try { extra = JSON.parse(opt.with) } catch (e) { usage('--with is not JSON: ' + e.message) }
  args = Object.assign({}, args, extra)
}

// ---------- the meta statement ----------
// Scan from an opening brace to its matching close, skipping strings, template literals (with nested ${...}) and comments.
function matchBrace(src, i) {
  if (src[i] !== '{') throw new Error('matchBrace: no { at ' + i)
  let depth = 0
  const stack = [] // 'tpl' frames: inside a template literal; numbers: the brace depth at which a ${ opened
  for (; i < src.length; i++) {
    const c = src[i]
    const top = stack[stack.length - 1]
    if (top === 'tpl') {
      if (c === '\\') { i++; continue }
      if (c === '`') { stack.pop(); continue }
      if (c === '$' && src[i + 1] === '{') { stack.push(depth); depth++; i++; continue }
      continue
    }
    if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); i = e < 0 ? src.length : e; continue }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 1; continue }
    if (c === '\'' || c === '"') {
      for (i++; i < src.length && src[i] !== c; i++) if (src[i] === '\\') i++
      continue
    }
    if (c === '`') { stack.push('tpl'); continue }
    if (c === '{') { depth++; continue }
    if (c === '}') {
      depth--
      if (typeof top === 'number' && depth === top) { stack.pop(); continue }
      if (depth === 0) return i
    }
  }
  throw new Error('matchBrace: unbalanced braces')
}

const src = readFileSync(scriptPath, 'utf8')
const m = /^export\s+const\s+meta\s*=\s*/m.exec(src)
if (!m) usage(scriptPath + ' has no `export const meta = {...}` statement')
const objStart = m.index + m[0].length
const objEnd = matchBrace(src, objStart)
let stmtEnd = objEnd + 1
while (stmtEnd < src.length && (src[stmtEnd] === ' ' || src[stmtEnd] === '\t')) stmtEnd++
if (src[stmtEnd] === ';') stmtEnd++
const metaText = src.slice(objStart, objEnd + 1)
let meta
try { meta = new Function('"use strict"; return (' + metaText + ')')() } catch (e) { usage('meta is not a pure literal: ' + e.message) }
const metaTitles = (meta.phases || []).map(p => p.title)
// Keep the line numbers: the meta statement becomes as many blank lines.
const body = src.slice(0, m.index) + '\n'.repeat((src.slice(m.index, stmtEnd).match(/\n/g) || []).length) + src.slice(stmtEnd)
if (/^\s*(import|export)\s/m.test(body)) console.log('WARNING: the body still holds an import or export statement (the runtime forbids module loading)')

// ---------- the stubs ----------
const problems = []
const phases = []
const launched = []
const poison = name => new Proxy(function () {}, {
  get() { throw new Error(name + ' is forbidden inside a Workflow script') },
  apply() { throw new Error(name + ' is forbidden inside a Workflow script') },
  construct() { throw new Error(name + ' is forbidden inside a Workflow script') },
})
const safeMath = new Proxy(Math, { get(t, k) { if (k === 'random') throw new Error('Math.random is forbidden inside a Workflow script'); return t[k] } })

function phase(title) {
  if (!metaTitles.includes(title)) problems.push(`phase("${title}") is not one of meta.phases (${metaTitles.join(', ')})`)
  if (phases[phases.length - 1] !== title) phases.push(title)
}
function log(msg) { console.log('  log: ' + msg) }
async function parallel(fns) { return Promise.all((fns || []).map(f => (typeof f === 'function' ? f() : f))) }
async function pipeline(items, a, b) { return Promise.all((items || []).map(async x => { const r = a ? await a(x) : x; return b ? b(r, x) : r })) }

function sampleFindings(prefix, n, reviewer) {
  return Array.from({ length: n }, (_, i) => Object.assign(
    { id: prefix + (i + 1), severity: i ? 'MEDIUM' : 'HIGH', unit: 'U-00', where: 'offline/src/sim.js:' + (10 + i) },
    reviewer ? { scenario: 'a simulated scenario', evidence: 'sim', fix: 'a simulated fix' } : { expected: 'a simulated expectation', evidence: 'sim' }))
}

function canned(prompt, opts) {
  const label = String(opts.label || '')
  const kind = label.split(':')[0]
  const type = String(opts.agentType || '')
  if (kind === 'build' || (kind !== 'fix' && BUILDER_TYPES.includes(type))) {
    const units = (label.split(':')[2] || '').split('+').filter(Boolean)
    return { done: units.map(u => ({ unit: u, shas: [TIP] })), tip: TIP, in_flight: 'none', next: [], files_touched: ['offline/src/sim.js'], shared_touched: [], one_thing: '(simulated builder note)', evidence: ['C:/Users/ruchi/1-addic-wt/_logs/gates/sim.log'], blocked: [], for_the_chat: [], steps_used: 42 }
  }
  if (kind === 'fix') {
    const ids = (prompt.match(/"id":\s*"[A-Z]+\d+"/g) || []).map(s => s.replace(/"id":\s*"|"/g, ''))
    return { done: ids.map(id => ({ unit: id, shas: [TIP] })), tip: TIP, in_flight: 'none', next: [], files_touched: ['offline/src/sim.js'], one_thing: '(simulated fix note)', evidence: [], blocked: [], steps_used: 20 }
  }
  if (kind === 'check') return { verdict: opt.fix ? 'FIX' : 'PASS', tip: TIP, units: [], findings: opt.fix ? sampleFindings('C', 2, false) : [], gates: ['GATE test GREEN (simulated) log=sim.log'], territory: 'territory OK (simulated)', not_checked: [] }
  if (kind === 'recheck') {
    const ids = (prompt.match(/"id":\s*"[A-Z]+\d+"/g) || []).map(s => s.replace(/"id":\s*"|"/g, ''))
    return { results: Array.from(new Set(ids)).map(id => ({ id, state: 'FIXED', note: '(simulated)' })), new_findings: [], tip: TIP }
  }
  if (kind === 'review') return { findings: opt.fix ? sampleFindings(label.split(':')[1] === 'safety' ? 'RS' : 'RC', 1, true) : [], questions: [], tip: TIP, read: [] }
  if (kind === 'gate') return { approved: true, findings: [], note: '(simulated)' }
  if (kind === 'report' || kind === 'report-update') return { stagedPath: '(simulated staged report)', hubPath: '(simulated docs report)', bytes: 9000, copied: true }
  if (kind === 'scout' || type === 'scout') return { briefPath: '(simulated brief path)', contractPath: '(simulated contract path)', briefBytes: 9000, units: [], questions: [], read: [] }
  if (type === 'lane-checker') return { verdict: 'PASS', tip: TIP, units: [], findings: [], gates: [] }
  if (type === 'lane-reviewer') return { findings: [], questions: [] }
  problems.push(`no canned result for the agent ${label} (${type})`)
  return {}
}

async function agent(prompt, opts) {
  opts = opts || {}
  const text = String(prompt)
  const bytes = Buffer.byteLength(text, 'utf8')
  const rec = { n: launched.length + 1, label: opts.label, agentType: opts.agentType, phase: opts.phase || phases[phases.length - 1] || '-', effort: opts.effort || '', promptBytes: bytes }
  launched.push(rec)
  if (!opts.label) problems.push(`agent #${rec.n}: no label`)
  if (!opts.agentType) problems.push(`agent ${opts.label || '#' + rec.n}: no agentType`)
  if (!opts.schema || typeof opts.schema !== 'object') problems.push(`agent ${opts.label || '#' + rec.n}: no schema`)
  if (opts.phase && !metaTitles.includes(opts.phase)) problems.push(`agent ${opts.label}: phase "${opts.phase}" is not one of meta.phases`)
  const bad = text.match(/\bundefined\b|\[object Object\]|\bNaN\b/)
  if (bad) problems.push(`agent ${opts.label}: the prompt contains "${bad[0]}" near "${text.slice(Math.max(0, bad.index - 60), bad.index + 20).replace(/\s+/g, ' ')}"`)
  if (BUILDER_TYPES.includes(opts.agentType) && bytes > BUILDER_LIMIT) problems.push(`agent ${opts.label}: the builder prompt is ${bytes} bytes, over ${BUILDER_LIMIT}`)
  if (opt.dump) {
    mkdirSync(opt.dump, { recursive: true })
    writeFileSync(join(opt.dump, String(rec.n).padStart(2, '0') + '-' + String(opts.label || 'agent').replace(/[^A-Za-z0-9_.+-]+/g, '_') + '.txt'), text)
  }
  return canned(text, opts)
}

// ---------- run ----------
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
console.log(`meta: ${meta.name || '(no name)'}; phases: ${metaTitles.join(' | ')}`)
console.log(`args: ${JSON.stringify(args).slice(0, 400)}${JSON.stringify(args).length > 400 ? ' ...' : ''}`)
let result, threw = null
try {
  const fn = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'phase', 'log', 'Date', 'require', 'process', 'fetch', 'Math', body)
  result = await fn(args, agent, parallel, pipeline, phase, log, poison('Date'), poison('require'), poison('process'), poison('fetch'), safeMath)
} catch (e) {
  threw = e
  problems.push('the script threw: ' + (e && e.message || e))
}

console.log(`phases reached: ${phases.join(' -> ') || '(none)'}`)
console.log(`agents launched: ${launched.length}`)
for (const a of launched) {
  const isB = BUILDER_TYPES.includes(a.agentType)
  console.log(`  ${String(a.n).padStart(2)}  ${String(a.label).padEnd(34)} ${String(a.agentType).padEnd(22)} ${String(a.phase).padEnd(7)} ${String(a.promptBytes).padStart(6)} bytes${a.effort ? '  effort ' + a.effort : ''}${isB ? (a.promptBytes > BUILDER_LIMIT ? '  OVER 12 KB' : '  builder, under 12 KB') : ''}`)
}
const builders = launched.filter(a => BUILDER_TYPES.includes(a.agentType))
if (builders.length) console.log(`builder prompts: max ${Math.max(...builders.map(b => b.promptBytes))} bytes of ${BUILDER_LIMIT}`)
console.log('returned: ' + (threw ? '(threw)' : JSON.stringify(result, null, 1)))
if (problems.length) {
  for (const p of problems) console.log('PROBLEM ' + p)
  console.log(`SIM RED (${problems.length} problem${problems.length > 1 ? 's' : ''})`)
  process.exit(1)
}
console.log('SIM OK')
