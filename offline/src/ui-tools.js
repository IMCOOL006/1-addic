/* 1-addic offline: the tools and mini-games (BUILD-PLAN 3.11, U-28; tracks/SCREENS/contracts/game-tutorials.md "ToolsUI").
   Pages: #/tools (Put it on trial, Should I go?, Problem Solver) and #/games (Distortion Sort, Spot the Red Flag,
   The Big Game, Refusal Rehearsal, Rewrite the Scene). Each plays from Content data (Content.games, Content.catalogs,
   Content.exercises) or is an honest stub with a way back (O7), never a dead button.
   The guided tools save through Actions.saveResponse with their exercise id (XP comes from the Actions event only).
   The games record one SkillUsed when the person says how it went. A ?drill=1 run uses the sample answers and saves
   nothing. Nothing here covers the SOS button, opens an overlay or moves focus away from the page. */
const ToolsUI = (function () {
  'use strict';

  function ns(name) {
    switch (name) {
      case 'Content': return typeof Content !== 'undefined' ? Content : null;
      case 'Actions': return typeof Actions !== 'undefined' ? Actions : null;
      case 'UI': return typeof UI !== 'undefined' ? UI : null;
      default: return null;
    }
  }
  const arr = (x) => (Array.isArray(x) ? x : []);
  const str = (s) => (typeof s === 'string' ? s : '');
  const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
  const content = () => ns('Content') || {};
  const games = (c) => (isObj((c || content()).games) ? (c || content()).games : {});
  const query = (ctx) => (ctx && ctx.route && isObj(ctx.route.query) ? ctx.route.query : {});
  const sub = (ctx) => (ctx && ctx.route && Array.isArray(ctx.route.parts) ? str(ctx.route.parts[1]) : '');
  const isDrill = (ctx) => query(ctx).drill === '1';
  const clone = (v) => JSON.parse(JSON.stringify(v === undefined ? null : v));

  const TEXT = {
    toolsTitle: 'Tools',
    gamesTitle: 'Practice games',
    toolsIntro: 'Short, guided tools for a thought, a choice or a problem.',
    gamesIntro: 'Short games to practise the skills. No timers, no scores that go down.',
    later: 'Coming in a later version',
    stubText: 'This one is not ready in this version yet. Its content comes in a later update.',
    backTools: 'Back to Tools',
    backGames: 'Back to games',
    drill: 'Training run: the answers are a sample, and nothing here is saved.',
    stepOf: (i, n) => 'Step ' + i + ' of ' + n,
    next: 'Next', back: 'Back', save: 'Save', finishDrill: 'Finish training',
    fillIn: (labels) => 'Please fill in: ' + labels.join('; ') + '.',
    saved: 'Saved.',
    saveFailed: 'That did not save. Your words are still here; try again.',
    drillDone: 'Training done. Nothing was saved.',
    helped: 'That helped', notNow: 'Done for now', noted: 'Noted. Thank you.',
    again: 'Play again',
    endStory: 'The end of this story.',
    seeEnding: 'See how it ends',
    kit: 'Moves from your refusal kit',
    strongHere: 'A strong answer here: ',
    rating: { best: 'A strong answer.', ok: 'This works for now.', weak: 'This one leaves the door open.' },
    check: 'Check my picks',
    flagged: 'Red flag', missed: 'A red flag you missed', notFlag: 'Not a red flag',
    found: (n, of) => 'You found ' + n + ' of ' + of + ' red flags.',
    sorted: (n, of) => 'You sorted ' + n + ' of ' + of + ' on the first try. Every trap you can name is easier to answer.',
    sortYes: (name, gist) => 'Yes: ' + name + '. ' + gist,
    sortNo: (name, gist) => 'Not quite. This one is ' + name + ': ' + gist,
    whichTrap: 'Which thinking trap is this?',
    whatSay: 'What do you say?',
    pickLines: 'Tap each line that sounds like a red-flag thought, then check.',
  };

  /* The tools and games, in the order of the lists. `ex` is the exercise a tool saves through; `key` the
     Content.games key a game plays from; `skill` the Content.skills id a finished game records. */
  const TOOLS = [
    { id: 'trial', name: 'Put it on trial', gist: 'Take a thought to court and close with a comeback.', ex: 'trial', skill: 'trial' },
    { id: 'should-i-go', name: 'Should I go?', gist: 'Check a small choice before it turns into a big one.', ex: 'should-i-go', skill: 'should-i-go' },
    { id: 'problem-solver', name: 'Problem Solver', gist: 'Find a way around something that gets in the way.', ex: 'obstacles', skill: 'problem-solve' },
  ];
  const GAMES = [
    { id: 'distortion-sort', name: 'Distortion Sort', gist: 'Sort each thought into its thinking trap.', key: 'sort', skill: 'spot-trap' },
    { id: 'spot-red-flag', name: 'Spot the Red Flag', gist: 'Find the red-flag thoughts in a short chat.', key: 'flag', skill: 'talk-back' },
    { id: 'big-game', name: 'The Big Game', gist: 'Make the choices in one evening of a story.', key: 'bigGame', skill: 'then-what' },
    { id: 'refusal', name: 'Refusal Rehearsal', gist: 'Practise saying no, and see how each answer lands.', key: 'refusal', skill: 'refuse' },
    { id: 'rewrite', name: 'Rewrite the Scene', gist: 'Replay a hard moment and write a better ending.', ex: 'rewrite-scene', skill: 'beat' },
  ];

  /* Fallback lines for Spot the Red Flag when Content.games.flag is absent: the red flags come from
     Content.catalogs.redFlags; these plain, safe lines sit between them (original wording). */
  const PLAIN_LINES = ['I will call my sister after work.', 'A walk might clear my head.', 'I can ask for help with this.', 'Tea first, then I will decide.'];
  const FALLBACK_WHY = 'This thought makes using sound reasonable. Naming it is the first step to answering it.';

  /* Courtroom extras for Put it on trial (not exercise fields; saved beside them in the payload). */
  const FOR_FIELD = { id: 'for', type: 'textarea', label: 'The case for it: what makes this thought feel true?', optional: true };
  const VERDICT_FIELD = { id: 'verdict', type: 'single', label: 'Your verdict', optional: true, options: [
    { id: 'does-not-hold', label: 'It does not hold up' }, { id: 'partly', label: 'Partly true, but it does not decide what I do' },
    { id: 'unsure', label: 'Not sure yet' }] };

  /* ── the pure rules ──────────────────────────────────────────────────────────────────────── */

  function exercise(id, c) {
    const ex = (c || content()).exercises;
    if (Array.isArray(ex)) return ex.find((x) => x && x.id === id) || null;
    return isObj(ex) && isObj(ex[id]) ? ex[id] : null;
  }
  function available(item, c) {
    const cc = c || content();
    if (item.ex) return !!exercise(item.ex, cc);
    if (item.key === 'sort') return sortItems(cc).length > 0;
    if (item.key === 'flag') return !!flagModel(cc);
    if (item.key === 'bigGame') return !!bigGameModel(cc);
    if (item.key === 'refusal') return !!refusalModel(cc);
    return false;
  }

  const unquote = (s) => str(s).replace(/^["“]+|["”]+$/g, '').trim();
  /* round-robin over the traps, so the same trap never comes twice in a row when it can be helped (no randomness) */
  function interleave(items) {
    const groups = new Map();
    for (const it of items) { if (!groups.has(it.trap)) groups.set(it.trap, []); groups.get(it.trap).push(it); }
    const out = [];
    const lists = [...groups.values()];
    for (let i = 0; out.length < items.length; i++) for (const g of lists) if (g[i]) out.push(g[i]);
    return out;
  }
  function traps(c) {
    return arr(((c || content()).catalogs || {}).distortions).filter((d) => d && typeof d.id === 'string' && typeof d.name === 'string');
  }
  function sortItems(c) {
    const cc = c || content();
    const ids = new Set(traps(cc).map((d) => d.id));
    if (!ids.size) return [];
    const own = arr(games(cc).sort).filter((x) => x && typeof x.thought === 'string' && ids.has(x.trap))
      .map((x, i) => ({ id: str(x.id) || 'st' + i, thought: x.thought, trap: x.trap }));
    if (own.length) return interleave(own);
    return traps(cc).filter((d) => d.example).map((d) => ({ id: 'd-' + d.id, thought: unquote(d.example), trap: d.id }));
  }
  const checkSort = (item, trapId) => !!item && item.trap === trapId;
  function sortSummary(items, firstPicks) {
    let n = 0;
    items.forEach((it, i) => { if (checkSort(it, firstPicks[i])) n++; });
    return { firstTry: n, total: items.length };
  }

  function flagModel(c) {
    const cc = c || content();
    const f = games(cc).flag;
    if (isObj(f) && Array.isArray(f.lines) && f.lines.length && Array.isArray(f.redFlags)) {
      const lines = f.lines.filter((l) => l && typeof l.t === 'string').map((l) => ({ who: str(l.who), t: l.t }));
      const why = {};
      f.redFlags.forEach((idx, k) => { why[idx] = str(arr(f.why)[k]) || FALLBACK_WHY; });
      return { title: str(f.title) || 'Spot the Red Flag', lines, flags: new Set(f.redFlags.filter((i) => Number.isInteger(i) && i >= 0 && i < lines.length)), why };
    }
    const reds = arr((cc.catalogs || {}).redFlags).filter((s) => typeof s === 'string').slice(0, 6);
    if (!reds.length) return null;
    const lines = []; const flags = new Set(); const why = {};
    reds.forEach((t, i) => {
      flags.add(lines.length); why[lines.length] = FALLBACK_WHY; lines.push({ who: 'A thought', t });
      if (PLAIN_LINES[i]) lines.push({ who: 'A thought', t: PLAIN_LINES[i] });
    });
    return { title: 'Thoughts on a long day', lines, flags, why };
  }
  function scoreFlags(model, picked) {
    const p = picked instanceof Set ? picked : new Set(arr(picked));
    let found = 0; let extra = 0;
    for (const i of p) { if (model.flags.has(i)) found++; else extra++; }
    return { found, missed: model.flags.size - found, extra, total: model.flags.size };
  }

  function bigGameModel(c) {
    const b = games(c).bigGame;
    if (!isObj(b) || typeof b.start !== 'string') return null;
    const scenes = {};
    if (Array.isArray(b.scenes)) for (const s of b.scenes) { if (s && typeof s.id === 'string') scenes[s.id] = s; }
    else if (isObj(b.nodes)) for (const k of Object.keys(b.nodes)) scenes[k] = Object.assign({ id: k }, b.nodes[k]);
    if (!scenes[b.start]) return null;
    const ch = isObj(b.character) ? b.character : {};
    return { title: str(b.title) || 'The Big Game', character: { name: str(ch.name), bio: str(ch.bio) }, start: b.start, scenes };
  }
  /* one step of the story: the next scene id, or null when the story ends */
  function bigGameNext(model, sceneId, choiceIndex) {
    const s = model && model.scenes[sceneId];
    const ch = s && arr(s.choices)[choiceIndex];
    if (!ch) return null;
    return typeof ch.to === 'string' && model.scenes[ch.to] ? ch.to : null;
  }

  function refusalModel(c) {
    const r = games(c).refusal;
    const list = Array.isArray(r) ? r : (isObj(r) && Array.isArray(r.scenes) ? r.scenes : null);
    if (!list) return null;
    const scenes = list.filter((s) => s && typeof s.scene === 'string' && Array.isArray(s.responses) && s.responses.length)
      .map((s) => ({ id: str(s.id), scene: s.scene, responses: s.responses.filter((x) => x && typeof x.t === 'string') }));
    return scenes.length ? scenes : null;
  }
  function refusalFeedback(scene, index, c) {
    const pick = scene.responses[index];
    if (!pick) return null;
    const best = scene.responses.find((x) => x.rating === 'best') || null;
    return {
      rating: TEXT.rating[pick.rating] || '', why: str(pick.why),
      best: pick.rating === 'best' || !best ? '' : best.t,
      kit: arr(((c || content()).catalogs || {}).refusal).filter((s) => typeof s === 'string'),
    };
  }

  /* options for a 'single' or 'check' field: its own options, or a catalog named by `from` */
  function optionsOf(field, c) {
    if (Array.isArray(field.options)) return field.options.filter((o) => o && o.id).map((o) => ({ id: o.id, label: str(o.label) || o.id }));
    const m = /^catalogs\.([A-Za-z]+)$/.exec(str(field.from));
    const list = m ? arr(((c || content()).catalogs || {})[m[1]]) : [];
    return list.map((o) => (typeof o === 'string' ? { id: o, label: o } : { id: str(o && o.id), label: str(o && (o.label || o.name)) })).filter((o) => o.id);
  }
  const FIELD_TYPES = ['text', 'textarea', 'single', 'check', 'list', 'rows'];
  const usable = (f) => isObj(f) && typeof f.id === 'string' && FIELD_TYPES.includes(f.type);

  /* steps for a tool: Put it on trial is a courtroom; the others take one field per step */
  function stepsFor(toolId, ex) {
    const fields = arr(ex && ex.fields).filter(usable);
    const by = (id) => fields.find((f) => f.id === id);
    const tagged = (f, test) => f && Object.assign({}, f, { test });
    if (toolId !== 'trial') return fields.map((f) => ({ title: f.label, fields: [f] }));
    const plan = [
      { title: 'The charge', fields: [by('mode'), by('thought')] },
      { title: 'The case for it', fields: [FOR_FIELD] },
      { title: 'The case against it', fields: [by('trap'), by('against')] },
      { title: 'The verdict', fields: [by('thenWhat'), VERDICT_FIELD] },
      { title: 'Closing statement', fields: [tagged(by('comeback'), 'trial-closing')] },
    ].map((s) => ({ title: s.title, fields: s.fields.filter(Boolean) }));
    const used = new Set(plan.flatMap((s) => s.fields.map((f) => f.id)));
    const rest = fields.filter((f) => !used.has(f.id));
    if (rest.length) plan[3].fields.push(...rest);
    return plan.filter((s) => s.fields.length);
  }
  function filled(f, v) {
    if (f.type === 'list' || f.type === 'check') return arr(v).some((x) => str(x).trim());
    if (f.type === 'rows') return arr(v).some((r) => isObj(r) && Object.values(r).some((x) => str(x).trim()));
    return str(v).trim() !== '';
  }
  function missing(fields, values) {
    return fields.filter((f) => !f.optional && !filled(f, values[f.id]));
  }
  function payloadOf(steps, values) {
    const out = {};
    for (const s of steps) for (const f of s.fields) {
      const v = values[f.id];
      if (!filled(f, v)) continue;
      if (f.type === 'list' || f.type === 'check') out[f.id] = arr(v).map((x) => str(x).trim()).filter(Boolean);
      else if (f.type === 'rows') out[f.id] = arr(v).filter((r) => isObj(r) && Object.values(r).some((x) => str(x).trim()))
        .map((r) => { const o = {}; for (const k of Object.keys(r)) o[k] = str(r[k]).trim(); return o; });
      else out[f.id] = str(v).trim();
    }
    return out;
  }
  /* the first values of a tool: a drill takes the exercise's sample answers; Put it on trial takes ?mode= and ?thought= */
  function startValues(toolId, ex, q, drill) {
    const v = drill ? clone((ex && ex.tutorial && ex.tutorial.example && ex.tutorial.example.values) || {}) || {} : {};
    if (toolId === 'trial' && !drill) {
      if (q.mode === 'redflag' || q.mode === 'mood') v.mode = q.mode;
      if (typeof q.thought === 'string' && q.thought.trim()) v.thought = q.thought.trim().slice(0, 500);
    }
    return v;
  }

  /* ── DOM ─────────────────────────────────────────────────────────────────────────────────── */

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    const a = attrs || {};
    for (const k of Object.keys(a)) {
      const v = a[k];
      if (v == null || v === false) continue;
      if (k === 'text') n.textContent = String(v);
      else if (k === 'value') n.value = String(v);
      else if (/^on[A-Z]/.test(k) && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (/^on/i.test(k)) continue;
      else n.setAttribute(k === 'className' ? 'class' : k, v === true ? '' : String(v));
    }
    for (const c of kids.flat(Infinity)) {
      if (c == null || c === false || c === true) continue;
      n.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    }
    return n;
  }
  const btn = (text, onClick, extra) => el('button', Object.assign({ type: 'button', class: 'btn tl-btn', text, onClick }, extra || {}));
  const link = (href, text, extra) => el('a', Object.assign({ class: 'btn ghost tl-btn', href, text }, extra || {}));
  function clear(n) { while (n.children && n.children.length) n.removeChild(n.children[0]); if (n.firstChild) { while (n.firstChild) n.removeChild(n.firstChild); } }
  function focusIn(n) { const t = n.querySelector ? n.querySelector('[data-focus]') : null; if (t && typeof t.focus === 'function') t.focus(); }
  const heading = (text, test) => el('h2', { class: 'tl-h', tabindex: '-1', 'data-focus': '', 'data-test': test || null, text });

  function shell(ctx, kind, title, body) {
    const back = kind === 'tools' ? link('#/tools', TEXT.backTools, { 'data-test': 'tools-back' }) : link('#/games', TEXT.backGames, { 'data-test': 'tools-back' });
    return el('section', { class: 'page stack tl-page', 'data-test': kind + '-page' },
      el('h1', { text: title }),
      isDrill(ctx) ? el('p', { class: 'tl-drill', role: 'note', 'data-test': 'drill-banner', text: TEXT.drill }) : null,
      body, el('p', { class: 'tl-foot' }, back));
  }
  function stub(ctx, kind, item) {
    return shell(ctx, kind, item ? item.name : (kind === 'tools' ? TEXT.toolsTitle : TEXT.gamesTitle),
      el('div', { class: 'card tl-stub', 'data-test': 'tool-stub' }, el('p', { text: TEXT.stubText })));
  }
  function index(ctx, kind) {
    const items = kind === 'tools' ? TOOLS : GAMES;
    const c = content();
    return el('section', { class: 'page stack tl-page', 'data-test': kind + '-page' },
      el('h1', { text: kind === 'tools' ? TEXT.toolsTitle : TEXT.gamesTitle }),
      el('p', { class: 'muted', text: kind === 'tools' ? TEXT.toolsIntro : TEXT.gamesIntro }),
      el('ul', { class: 'tl-list' }, items.map((it) => {
        const ok = available(it, c);
        return el('li', { class: 'card tl-item', 'data-test': kind === 'games' ? 'game-card' : null, 'data-game': kind === 'games' ? it.id : null },
          el('a', { class: 'tl-item-link', href: '#/' + kind + '/' + it.id, 'data-test': 'tool-link-' + it.id },
            el('strong', { text: it.name }), el('span', { class: 'muted', text: ok ? it.gist : it.gist + ' (' + TEXT.later + ')' })));
      })));
  }

  /* XP comes only from Actions.useSkill (one SkillUsed); a drill or no useSkill records nothing and draws no button.
     A refusal or a throw ends on the same neutral line: a refused credit loses nothing and is never called a failure. */
  function helpedRow(ctx, skill) {
    const box = el('div', { class: 'tl-row', 'data-test': 'game-helped' });
    if (isDrill(ctx)) { box.appendChild(el('p', { text: TEXT.drillDone })); return box; }
    const A = ns('Actions');
    if (!A || typeof A.useSkill !== 'function') return box;
    let sent = false;
    const send = (helpful) => async () => {
      if (sent) return; sent = true;
      try { await A.useSkill({ skillId: skill, helpful }); } catch (e) { /* the game still ends well */ }
      clear(box); box.appendChild(el('p', { role: 'status', text: TEXT.noted }));
    };
    box.appendChild(btn(TEXT.helped, send(true), { 'data-test': 'game-helped-yes' }));
    box.appendChild(btn(TEXT.notNow, send(false), { 'data-test': 'game-helped-no' }));
    return box;
  }

  /* ── the guided tools (Put it on trial, Should I go?, Problem Solver, Rewrite the Scene) ──── */

  function fieldNode(f, values, c) {
    const fid = 'tl-f-' + f.id;
    const tid = f.test || 'tl-field-' + f.id;
    const set = (v) => { values[f.id] = v; };
    const lab = el('label', { for: fid, class: 'tl-label', text: f.label + (f.optional ? ' (optional)' : '') });
    const onIn = (fn) => (e) => fn(e && e.target ? e.target.value : '');
    if (f.type === 'text') return el('div', { class: 'tl-field' }, lab, el('input', { id: fid, type: 'text', class: 'tl-input', value: str(values[f.id]), 'data-test': tid, onInput: onIn(set) }));
    if (f.type === 'textarea') return el('div', { class: 'tl-field' }, lab, el('textarea', { id: fid, rows: '3', class: 'tl-input', value: str(values[f.id]), 'data-test': tid, onInput: onIn(set) }));
    if (f.type === 'single' || f.type === 'check') {
      const multi = f.type === 'check';
      const opts = optionsOf(f, c);
      const group = el('div', { class: 'tl-opts', role: 'group', 'aria-label': f.label, 'data-test': tid });
      const paint = () => Array.from(group.children).forEach((b, i) => {
        const on = multi ? arr(values[f.id]).includes(opts[i].id) : values[f.id] === opts[i].id;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      opts.forEach((o) => group.appendChild(btn(o.label, () => {
        if (multi) { const cur = arr(values[f.id]); set(cur.includes(o.id) ? cur.filter((x) => x !== o.id) : cur.concat(o.id)); }
        else set(values[f.id] === o.id ? '' : o.id);
        paint();
      }, { class: 'btn tl-btn tl-opt', 'aria-pressed': 'false' })));
      paint();
      return el('div', { class: 'tl-field' }, el('p', { class: 'tl-label', text: f.label + (f.optional ? ' (optional)' : '') }), group);
    }
    if (f.type === 'list') {
      const n = Math.max(1, Math.min(Number(f.max) || 3, 5));
      if (!Array.isArray(values[f.id])) values[f.id] = [];
      const box = el('div', { class: 'tl-field' }, el('p', { class: 'tl-label', text: f.label }));
      for (let i = 0; i < n; i++) {
        box.appendChild(el('input', { id: fid + '-' + i, type: 'text', class: 'tl-input', 'aria-label': f.label + ' ' + (i + 1), value: str(values[f.id][i]),
          'data-test': tid + '-' + i, onInput: onIn((v) => { values[f.id][i] = v; }) }));
      }
      return box;
    }
    /* rows */
    const cols = arr(f.columns).filter((x) => x && x.id);
    const n = Math.max(1, Math.min(Number(f.max) || 3, 3));
    if (!Array.isArray(values[f.id])) values[f.id] = [];
    const box = el('div', { class: 'tl-field' }, el('p', { class: 'tl-label', text: f.label }));
    for (let i = 0; i < n; i++) {
      const row = el('fieldset', { class: 'tl-rowset' }, el('legend', { text: String(i + 1) }));
      for (const col of cols) {
        const id = fid + '-' + i + '-' + col.id;
        row.appendChild(el('label', { for: id, class: 'tl-label', text: str(col.label) }));
        row.appendChild(el('input', { id, type: 'text', class: 'tl-input', value: str((values[f.id][i] || {})[col.id]), 'data-test': tid + '-' + i + '-' + col.id,
          onInput: onIn((v) => { values[f.id][i] = Object.assign({}, values[f.id][i] || {}, { [col.id]: v }); }) }));
      }
      box.appendChild(row);
    }
    return box;
  }

  function toolScreen(ctx, kind, item) {
    const c = content();
    const ex = exercise(item.ex, c);
    if (!ex) return stub(ctx, kind, item);
    const steps = stepsFor(item.id, ex);
    if (!steps.length) return stub(ctx, kind, item);
    const drill = isDrill(ctx);
    const values = startValues(item.id, ex, query(ctx), drill);
    const hints = isObj(ex.tutorial && ex.tutorial.hints) ? ex.tutorial.hints : {};
    const live = el('p', { class: 'tl-live', 'aria-live': 'polite', 'data-test': 'tl-live' });
    const body = el('div', { class: 'stack tl-steps' });
    const st = { i: 0, done: false, busy: false };
    const A = ns('Actions');

    async function finish() {
      const lack = missing(steps[st.i].fields, values);
      if (lack.length) { live.textContent = TEXT.fillIn(lack.map((f) => f.label)); return; }
      if (drill) { st.done = true; draw(TEXT.drillDone); return; }
      if (st.busy) return;
      if (!A || typeof A.saveResponse !== 'function') { live.textContent = TEXT.saveFailed; return; }
      st.busy = true;
      try {
        await A.saveResponse(item.ex, payloadOf(steps, values), { mode: 'workbook' });
        st.done = true;
        draw(str(ex.tutorial && ex.tutorial.built) || TEXT.saved);
      } catch (e) { live.textContent = TEXT.saveFailed; }
      st.busy = false;
    }
    function draw(doneText) {
      clear(body);
      live.textContent = '';
      if (st.done) {
        body.appendChild(el('div', { class: 'card tl-done', 'data-test': 'tl-done' }, heading(doneText, 'tl-done-text')));
        focusIn(body);
        return;
      }
      const s = steps[st.i];
      const last = st.i === steps.length - 1;
      body.appendChild(el('div', { class: 'card stack tl-step', 'data-test': 'tl-step' },
        el('p', { class: 'muted', text: TEXT.stepOf(st.i + 1, steps.length) }),
        heading(s.title),
        s.fields.map((f) => [fieldNode(f, values, c), hints[f.id] ? el('p', { class: 'muted tl-hint', text: hints[f.id] }) : null]),
        el('div', { class: 'tl-row' },
          st.i > 0 ? btn(TEXT.back, () => { st.i--; draw(); focusIn(body); }, { 'data-test': 'tl-back' }) : null,
          last ? btn(drill ? TEXT.finishDrill : TEXT.save, finish, { class: 'btn primary tl-btn', 'data-test': 'tl-save' })
            : btn(TEXT.next, () => {
              const lack = missing(s.fields, values);
              if (lack.length) { live.textContent = TEXT.fillIn(lack.map((f) => f.label)); return; }
              st.i++; draw(); focusIn(body);
            }, { class: 'btn primary tl-btn', 'data-test': 'tl-next' }))));
    }
    draw();
    return shell(ctx, kind, item.name, el('div', { class: 'stack' }, el('p', { class: 'muted', text: item.gist }), body, live));
  }

  /* ── the games ────────────────────────────────────────────────────────────────────────────── */

  function sortGame(ctx, item) {
    const c = content();
    const items = sortItems(c);
    if (!items.length) return stub(ctx, 'games', item);
    const bins = traps(c);
    const st = { i: 0, picks: [], shown: false };
    const live = el('p', { class: 'tl-live', 'aria-live': 'polite', 'data-test': 'sort-feedback' });
    const body = el('div', { class: 'stack' });
    function draw() {
      clear(body);
      if (st.i >= items.length) {
        const s = sortSummary(items, st.picks);
        live.textContent = '';
        body.appendChild(el('div', { class: 'card stack', 'data-test': 'sort-end' }, heading(TEXT.sorted(s.firstTry, s.total), 'sort-score'),
          helpedRow(ctx, item.skill), btn(TEXT.again, () => { st.i = 0; st.picks = []; st.shown = false; draw(); focusIn(body); }, { 'data-test': 'game-again' })));
        return;
      }
      const it = items[st.i];
      body.appendChild(el('div', { class: 'card stack' },
        el('p', { class: 'muted', text: TEXT.stepOf(st.i + 1, items.length) }),
        heading(TEXT.whichTrap),
        el('blockquote', { class: 'tl-quote', 'data-test': 'sort-thought', text: it.thought }),
        el('div', { class: 'tl-opts', role: 'group', 'aria-label': TEXT.whichTrap }, bins.map((d) => btn(d.name, () => {
          if (st.shown) return;
          st.picks[st.i] = d.id; st.shown = true;
          const right = bins.find((b) => b.id === it.trap) || d;
          live.textContent = checkSort(it, d.id) ? TEXT.sortYes(right.name, str(right.gist)) : TEXT.sortNo(right.name, str(right.gist));
          draw();
        }, { class: 'btn tl-btn tl-opt', 'data-test': 'sort-bin-' + d.id, 'aria-pressed': st.shown && st.picks[st.i] === d.id ? 'true' : 'false', disabled: st.shown })),
        st.shown ? btn(TEXT.next, () => { st.i++; st.shown = false; live.textContent = ''; draw(); focusIn(body); }, { class: 'btn primary tl-btn', 'data-test': 'sort-next' }) : null)));
    }
    draw();
    return shell(ctx, 'games', item.name, el('div', { class: 'stack' }, el('p', { class: 'muted', text: item.gist }), body, live));
  }

  function flagGame(ctx, item) {
    const m = flagModel(content());
    if (!m) return stub(ctx, 'games', item);
    const st = { picked: new Set(), checked: false };
    const body = el('div', { class: 'stack' });
    const live = el('p', { class: 'tl-live', 'aria-live': 'polite', 'data-test': 'flag-result' });
    function draw() {
      clear(body);
      body.appendChild(heading(m.title));
      body.appendChild(el('p', { class: 'muted', text: TEXT.pickLines }));
      body.appendChild(el('ol', { class: 'tl-chat' }, m.lines.map((l, i) => {
        const on = st.picked.has(i);
        const verdict = !st.checked ? null : m.flags.has(i) ? (on ? TEXT.flagged : TEXT.missed) : (on ? TEXT.notFlag : null);
        return el('li', { class: 'tl-line' },
          btn((l.who ? l.who + ': ' : '') + l.t, () => { if (st.checked) return; if (on) st.picked.delete(i); else st.picked.add(i); draw(); },
            { class: 'btn tl-btn tl-opt tl-line-btn', 'aria-pressed': on ? 'true' : 'false', 'data-test': 'flag-line-' + i, disabled: st.checked }),
          verdict ? el('p', { class: 'tl-verdict', text: verdict + (m.flags.has(i) ? '. ' + m.why[i] : '.') }) : null);
      })));
      if (!st.checked) body.appendChild(btn(TEXT.check, () => {
        st.checked = true;
        const s = scoreFlags(m, st.picked);
        live.textContent = TEXT.found(s.found, s.total);
        draw();
      }, { class: 'btn primary tl-btn', 'data-test': 'flag-check' }));
      else body.appendChild(el('div', { class: 'stack' }, helpedRow(ctx, item.skill),
        btn(TEXT.again, () => { st.picked = new Set(); st.checked = false; live.textContent = ''; draw(); focusIn(body); }, { 'data-test': 'game-again' })));
    }
    draw();
    return shell(ctx, 'games', item.name, el('div', { class: 'stack' }, body, live));
  }

  function bigGame(ctx, item) {
    const m = bigGameModel(content());
    if (!m) return stub(ctx, 'games', item);
    const st = { at: m.start, choice: -1, ended: false };
    const body = el('div', { class: 'stack' });
    const live = el('p', { class: 'tl-live', 'aria-live': 'polite', 'data-test': 'bg-note' });
    function draw() {
      clear(body);
      const s = m.scenes[st.at];
      const chosen = st.choice >= 0 ? arr(s.choices)[st.choice] : null;
      if (st.ended) {
        body.appendChild(el('div', { class: 'card stack', 'data-test': 'bg-end' }, heading(TEXT.endStory),
          chosen && chosen.note ? el('p', { text: chosen.note }) : null,
          helpedRow(ctx, item.skill),
          btn(TEXT.again, () => { st.at = m.start; st.choice = -1; st.ended = false; live.textContent = ''; draw(); focusIn(body); }, { 'data-test': 'bg-restart' })));
        return;
      }
      body.appendChild(el('div', { class: 'card stack', 'data-test': 'bg-scene' },
        heading(m.title),
        el('p', { 'data-test': 'bg-text', text: str(s.text) }),
        el('div', { class: 'tl-opts', role: 'group', 'aria-label': 'Choices' }, arr(s.choices).map((ch, i) => btn(str(ch.t), () => {
          if (st.choice >= 0) return;
          st.choice = i; live.textContent = str(ch.note); draw();
        }, { class: 'btn tl-btn tl-opt', 'aria-pressed': st.choice === i ? 'true' : 'false', disabled: st.choice >= 0, 'data-test': 'bg-choice-' + i }))),
        chosen ? btn(bigGameNext(m, st.at, st.choice) ? TEXT.next : TEXT.seeEnding, () => {
          const to = bigGameNext(m, st.at, st.choice);
          if (to) { st.at = to; st.choice = -1; live.textContent = ''; } else { st.ended = true; live.textContent = ''; }
          draw(); focusIn(body);
        }, { class: 'btn primary tl-btn', 'data-test': 'bg-next' }) : null));
    }
    draw();
    const who = m.character.name ? el('div', { class: 'card tl-who', 'data-test': 'bg-character' }, el('strong', { text: m.character.name }), m.character.bio ? el('p', { class: 'muted', text: m.character.bio }) : null) : null;
    return shell(ctx, 'games', item.name, el('div', { class: 'stack' }, who, body, live));
  }

  function refusalGame(ctx, item) {
    const scenes = refusalModel(content());
    if (!scenes) return stub(ctx, 'games', item);
    const st = { i: 0, pick: -1 };
    const body = el('div', { class: 'stack' });
    const live = el('p', { class: 'tl-live', 'aria-live': 'polite', 'data-test': 'rf-feedback' });
    function draw() {
      clear(body);
      if (st.i >= scenes.length) {
        body.appendChild(el('div', { class: 'card stack', 'data-test': 'rf-end' }, heading(TEXT.kit),
          el('ul', { class: 'tl-kit' }, arr((content().catalogs || {}).refusal).map((k) => el('li', { text: k }))),
          helpedRow(ctx, item.skill),
          btn(TEXT.again, () => { st.i = 0; st.pick = -1; live.textContent = ''; draw(); focusIn(body); }, { 'data-test': 'game-again' })));
        return;
      }
      const s = scenes[st.i];
      const fb = st.pick >= 0 ? refusalFeedback(s, st.pick) : null;
      body.appendChild(el('div', { class: 'card stack', 'data-test': 'rf-scene' },
        el('p', { class: 'muted', text: TEXT.stepOf(st.i + 1, scenes.length) }),
        el('p', { class: 'tl-quote', 'data-test': 'rf-text', text: s.scene }),
        heading(TEXT.whatSay),
        el('div', { class: 'tl-opts', role: 'group', 'aria-label': 'Your answer' }, s.responses.map((r, i) => btn(r.t, () => {
          if (st.pick >= 0) return;
          st.pick = i;
          const f = refusalFeedback(s, i);
          live.textContent = f.rating + ' ' + f.why;
          draw();
        }, { class: 'btn tl-btn tl-opt', 'aria-pressed': st.pick === i ? 'true' : 'false', disabled: st.pick >= 0, 'data-test': 'rf-option-' + i }))),
        fb ? el('div', { class: 'tl-feedback' },
          fb.best ? el('p', { text: TEXT.strongHere + fb.best }) : null,
          fb.kit.length ? el('details', { class: 'tl-kit' }, el('summary', { text: TEXT.kit }), el('ul', {}, fb.kit.map((k) => el('li', { text: k })))) : null,
          btn(TEXT.next, () => { st.i++; st.pick = -1; live.textContent = ''; draw(); focusIn(body); }, { class: 'btn primary tl-btn', 'data-test': 'rf-next' })) : null));
    }
    draw();
    return shell(ctx, 'games', item.name, el('div', { class: 'stack' }, el('p', { class: 'muted', text: item.gist }), body, live));
  }

  /* ── pages ────────────────────────────────────────────────────────────────────────────────── */

  function toolsPage(ctx) {
    const id = sub(ctx);
    if (!id) return index(ctx, 'tools');
    const item = TOOLS.find((t) => t.id === id);
    return item ? toolScreen(ctx, 'tools', item) : stub(ctx, 'tools', null);
  }
  function gamesPage(ctx) {
    const id = sub(ctx);
    if (!id) return index(ctx, 'games');
    const item = GAMES.find((g) => g.id === id);
    if (!item) return stub(ctx, 'games', null);
    if (item.ex) return toolScreen(ctx, 'games', item);
    if (item.key === 'sort') return sortGame(ctx, item);
    if (item.key === 'flag') return flagGame(ctx, item);
    if (item.key === 'bigGame') return bigGame(ctx, item);
    return refusalGame(ctx, item);
  }

  return {
    toolsPage, gamesPage, TOOLS, GAMES, TEXT,
    // the pure rules, for the Node tests
    exercise, available, sortItems, checkSort, sortSummary, flagModel, scoreFlags, bigGameModel, bigGameNext,
    refusalModel, refusalFeedback, stepsFor, missing, payloadOf, startValues, optionsOf,
  };
})();

// Pages register from this file (contracts/core.md: UI.pages[firstSegment]); nothing in ui-core.js or shell.html changes.
if (typeof UI !== 'undefined' && UI && UI.pages) {
  UI.pages.tools = (ctx) => ToolsUI.toolsPage(ctx);
  UI.pages.games = (ctx) => ToolsUI.gamesPage(ctx);
}

if (typeof module !== 'undefined' && module.exports) module.exports = ToolsUI;
