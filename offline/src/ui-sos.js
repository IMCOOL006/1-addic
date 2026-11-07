/* 1-addic · ui-sos.js · the SOS screens (BUILD-PLAN 3.5 routes #/sos*, PLAN 5.2; unit U-10, lane actions-sos).
   Contract: docs/offline/build-2026-11-07/tracks/CORE/contracts/actions-sos.md ("Added by U-10 / U-11").
   Rules this file keeps: SOS works offline and is never gated (no PIN, onboarding, tip, tutorial or confirm here);
   urgent help is one tap from every SOS screen; two lines of text per screen at most; numbers come from
   Content.resources only and every one marked verify shows "please verify"; crisis routing (the hopeless chip, or
   typed text that Engine.crisisKeywords flags) shows the numbers at once and says little else; a drill or a preview
   saves nothing; a save that fails never stops the flow. No network: phone numbers are tel: links, web addresses
   are copied, never opened from here. The person's text is never logged. Pure helpers load in Node (module.exports);
   the screens need a DOM and UI (ui-core.js). Everything sits inside one function so no global name is added. */
(function () {
  'use strict';

  const WAVE_MIN = 15;

  // The in-file copy. Every line here is listed in the lane report for clinical review (clinicalReview: true).
  // One title and at most one line per screen; buttons are labels, not reading.
  const COPY = {
    clinicalReview: true,
    hub: { title: 'SOS', line: 'You opened this. That is a strong move.' },
    rate: { title: 'How strong is it?', line: 'Tap 0 to 10, or skip. Your 15-minute timer is running.' },
    tools: { title: 'Pick a tool', line: 'Somewhere risky? Leaving is a valid move.' },
    wave: { title: 'Ride the wave' },
    helped: { title: 'Did that help?' },
    why: { title: 'Remind me why', empty: 'Add your reasons in the Workbook later.' },
    call: { title: 'Call someone', line: 'Pick someone safe. A short call is enough.', none: 'No Safety Net yet. You can add one later.', drill: 'In a real craving, your people show here.' },
    meetings: { title: 'Meetings' },
    distract: { title: 'Distract me' },
    talkback: { title: 'Talk back' },
    reassess: { title: 'How strong is it now?', line: 'Tap 0 to 10, then choose.' },
    used: { title: 'Did you use?', line: 'Either answer is OK here.' },
    surfed: { title: 'Wave surfed.', line: 'You rode it out. That skill grows each time.' },
    drillDone: { title: 'Drill done.', line: 'Nothing goes in your log. Now you know the way.' },
    feelPick: { title: 'What are you feeling?', line: 'Pick the closest one.' },
    feelOther: { title: 'Name it, if you like', line: 'A word or two is enough.' },
    beat: { title: 'Give it a beat', line: 'Step away if you can. Count to ten with me.' },
    selfTalk: { title: 'Say it to yourself' },
    assertive: { title: 'If you need words' },
    activity: { title: 'One small good thing' },
    feelHelped: { title: 'What helped?', line: 'Tick any that helped.' },
    feelRate: { title: 'How strong is the feeling now?', line: 'Optional. Tap 0 to 10, or skip.' },
    motivation: { title: 'How is your motivation?', line: 'Optional. 0 is none, 10 is strong.' },
    feelDone: { title: 'You stayed with it.', line: 'That takes skill. It gets easier.' },
    slipStart: { title: 'A slip is not a failure.', line: 'Everything you earned stays. You opened this, and that counts.', log: 'Log it and go on', read: 'Just reading' },
    slipSafe: { title: 'Are you safe right now?', line: 'If not, get help now.' },
    reach: { title: 'Reach out', line: 'One call or text. You do not have to explain it all.' },
    slipNext: { title: 'Within a day', line: 'Look back at what happened, kindly. It helps next time.' },
    slipDone: { title: 'You took the next step.', line: 'Come back here any time.' },
    urgent: { title: 'Urgent help', line: 'If you or someone else is in danger, call now.' },
    crisis: { title: 'Please call now.', line: 'You do not have to carry this alone.' },
    drillBanner: 'Practice drill. Nothing goes in your log.',
    previewBanner: 'Preview: nothing is saved.',
    overdose: 'If someone may have overdosed',
    withdrawal: 'Heavy daily drinking or sedatives: stop with a doctor.', // RS3, clinicalReview
    verify: 'please verify',
    crisisVerify: 'Please check these numbers.', // the one verify line of the crisis view
    noVoice: 'Read-aloud is not available on this device.',
    notSaved: 'Not saved on this device. You can keep going.',
    copied: 'Copied.',
    hidden: 'Locked: your own notes are hidden.',
    lockedKept: 'Locked. This saves when you unlock.',
  };

  // Stand-ins until Content.practices (content U-32) and the engine's SOS views arrive. Reported for clinical review.
  const FALLBACK = {
    clinicalReview: true,
    sober: [
      'Stop. Pause where you are.',
      'Observe. Notice what you feel in your body.', // RS8: neutral, so a discreet screen stays discreet
      'Breathe. Slow breath in. Slower breath out.',
      'Expand. Notice the whole room around you.',
      'Respond. Choose your next move on purpose.',
    ],
    talkback: [
      'This is a craving. It rises, peaks and passes.',
      'Wanting it is not the same as needing it.',
      'I can wait 15 minutes and let this wave pass.',
    ],
    spiralReply: 'I can stop now. This does not erase my progress.',
    guide: ['wave', 'why', 'distract'],
  };
  // Typed-text crisis phrases (RS2), checked beside Engine.crisisKeywords, never instead of it: errs towards the numbers.
  // The text is matched after crisisNorm: curly quotes become straight, spaces collapse; an apostrophe may be missing.
  const CRISIS = {
    clinicalReview: true,
    patterns: [
      'suicid\\w*', 'kill (my ?self|me)', 'kms', 'self[- ]?harm', '(hurt|cut|hang) my ?self', 'overdose on purpose',
      '(want(ed)?|going) to die', 'wanna die', 'wish i (was|were) dead', 'better off dead',
      "(do not|don'?t|not) (want|wanna)( to)? (live|be here|be alive|wake up)", "(can'?t|cannot) go on",
      'end(ing)? (it|it all|things|my life)', 'tak(e|ing) my (own )?life',
      'nothing to live for', 'no (reason|point)( (to|in|for))? (live|living|going on)',
    ],
  };
  const CRISIS_RE = new RegExp('\\b(' + CRISIS.patterns.join('|') + ')\\b', 'i');
  const crisisNorm = (s) => String(s).replace(/[‘’‛ʼ`´]/g, "'").replace(/\s+/g, ' ');

  // The craving tools: route id, skill credited (Content.skills ids), label.
  const TOOLS = [
    { id: 'wave', skillId: 'ride-wave', label: 'Ride the wave' },
    { id: 'why', skillId: 'reasons', label: 'Remind me why' },
    { id: 'call', skillId: 'call', label: 'Call someone' },
    { id: 'distract', skillId: 'distract', label: 'Distract me' },
    { id: 'talkback', skillId: 'talk-back', label: 'Talk back' },
  ];
  const FEEL_SKILLS = { beat: 'beat', sober: 'sober', selfTalk: 'self-kindness', accept: 'accept', activity: 'pleasant', call: 'call' };

  /* ── Pure helpers (Node-testable; read Content and the view passed in, never stored state of their own) ── */
  const safe = (fn, fallback) => { try { const v = fn(); return v === undefined || v === null ? fallback : v; } catch (e) { return fallback; } };
  // Content, Engine and Store are const globals of other scripts (not globalThis properties in a browser): read them by name.
  const glob = (name) => safe(() => (name === 'Content' ? (typeof Content !== 'undefined' ? Content : null)
    : name === 'Engine' ? (typeof Engine !== 'undefined' ? Engine : null)
      : name === 'Store' ? (typeof Store !== 'undefined' ? Store : null) : null), null);
  const toText = (x) => (typeof x === 'string' ? x : x && typeof x === 'object' ? String(x.text || x.label || x.name || x.thought || '') : '');
  const texts = (arr) => (Array.isArray(arr) ? arr.map(toText).filter((s) => s.trim() !== '') : []);
  const isScoreN = (n) => Number.isInteger(n) && n >= 0 && n <= 10;

  function telHref(number) {
    const digits = String(number == null ? '' : number).replace(/[^0-9+]/g, '');
    return digits ? 'tel:' + digits : null;
  }

  function urgentItem(x) {
    if (!x || typeof x !== 'object') return null;
    const number = x.number ? String(x.number) : null;
    const alt = x.alt ? String(x.alt) : null;
    return {
      name: String(x.name || ''), number, tel: number ? telHref(number) : null, alt, altTel: alt ? telHref(alt) : null,
      url: x.url ? String(x.url) : null, note: x.note ? String(x.note) : null, verify: x.verify === true,
    };
  }

  // The urgent-help model: the person's region first, then the other list (O3: India plus the international list).
  function urgentList(region, C) {
    const res = safe(() => C.resources, {}) || {};
    const local = res.in || {};
    const intl = res.intl || {};
    const items = (arr) => (Array.isArray(arr) ? arr.map(urgentItem).filter((i) => i && i.name) : []);
    const india = { id: 'in', name: String(local.name || 'India'), verifyNote: local.verifyNote ? String(local.verifyNote) : null,
      items: items([].concat(local.emergency || [], local.crisis || [])) };
    const other = { id: 'intl', name: String(intl.name || 'Elsewhere'), verifyNote: intl.verifyNote ? String(intl.verifyNote) : null,
      items: items(intl.lines) };
    const r = region === 'intl' ? 'intl' : 'in';
    return {
      region: r,
      sections: (r === 'intl' ? [other, india] : [india, other]).filter((s) => s.items.length),
      overdose: texts(res.overdose),
      withdrawal: texts(res.withdrawal),
    };
  }

  // The same rule as Actions.sosSession when no outcome is given.
  function outcomeFrom(before, after, used) {
    if (used === true) return 'used';
    const b = isScoreN(before) ? before : null;
    const a = isScoreN(after) ? after : null;
    return b !== null && a !== null && a > 0 && a >= b ? 'still' : 'passed';
  }

  function isCrisisEmotion(id, C) {
    const content = C || glob('Content');
    const list = safe(() => content.emotions, []);
    return Array.isArray(list) && list.some((e) => e && e.id === id && e.crisisCheck === true);
  }

  function isCrisisText(text, E) {
    const s = String(text == null ? '' : text);
    if (!s.trim()) return false;
    const eng = E === undefined ? glob('Engine') : E;
    if (eng && typeof eng.crisisKeywords === 'function') {
      const v = safe(() => eng.crisisKeywords(s), null);
      if (v === true || (Array.isArray(v) && v.length > 0)) return true;
      if (v === false || Array.isArray(v)) return CRISIS_RE.test(crisisNorm(s)); // the engine's list plus this one: never fewer
    }
    return CRISIS_RE.test(crisisNorm(s));
  }

  function parseSos(r) {
    const parts = (r && Array.isArray(r.parts)) ? r.parts : [];
    const q = (r && r.query) || {};
    const sub = parts[1];
    const flow = ['craving', 'feeling', 'slip', 'urgent'].includes(sub) ? sub : 'hub';
    const drill = flow === 'hub' && String(q.drill) === '1';
    return { flow: drill ? 'craving' : flow, drill, preview: flow === 'slip' && String(q.preview) === '1', logged: String(q.logged) === '1' };
  }

  // The Actions.sosSession payload for a finished session. Ratings left out when not given.
  function sessionFrom(st) {
    const s = st || {};
    const used = s.kind === 'slip' || s.used === true;
    const out = { kind: s.kind || 'craving', tools: [], delays: Number.isInteger(s.delays) && s.delays > 0 ? s.delays : 0,
      used, risky: s.risky === true, drill: s.drill === true };
    if (isScoreN(s.ratingBefore)) out.ratingBefore = s.ratingBefore;
    if (isScoreN(s.ratingAfter)) out.ratingAfter = s.ratingAfter;
    const seen = new Map();
    for (const t of Array.isArray(s.tools) ? s.tools : []) {
      if (!t || !t.skillId) continue;
      seen.set(t.skillId, (seen.get(t.skillId) === true) || t.helpful === true); // one entry per skill; helpful wins
    }
    out.tools = [...seen].map(([skillId, helpful]) => ({ skillId, helpful }));
    if (typeof s.emotion === 'string' && s.emotion) out.emotion = s.emotion; // a feeling session keeps the feeling
    // The person's own word wins (It passed); a use is always 'used' (Actions refuses anything else with used).
    out.outcome = used ? 'used' : s.outcome === 'passed' || s.outcome === 'still' ? s.outcome : outcomeFrom(out.ratingBefore, out.ratingAfter, false);
    return out;
  }

  function guideOrder(view, E) {
    const eng = E === undefined ? glob('Engine') : E;
    const fn = eng && (typeof eng.guideSequence === 'function' ? eng.guideSequence : eng.sos && typeof eng.sos.guideSequence === 'function' ? eng.sos.guideSequence : null);
    const known = TOOLS.map((t) => t.id);
    const got = fn ? safe(() => fn.call(eng, view), null) : null;
    const ids = Array.isArray(got) ? got.map((x) => (typeof x === 'string' ? x : x && (x.id || x.tool))).filter((x) => known.includes(x)) : [];
    return ids.length ? ids : FALLBACK.guide.slice();
  }

  function soberSteps(C) {
    const p = safe(() => C.practices, null);
    const sober = p && (Array.isArray(p) ? p.find((x) => x && x.id === 'sober') : p.sober);
    const steps = texts(sober && (sober.steps || sober.lines));
    return steps.length ? steps : FALLBACK.sober.slice();
  }

  const listOf = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? (v.reasons || v.items || v.cards || v.lines || []) : []);
  function latestResponse(view, exerciseId) {
    const rows = safe(() => view.list('responses'), []) || [];
    return rows.filter((r) => r && r.exerciseId === exerciseId && !r.draft).sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))[0] || null;
  }

  // Engine.reasonsCard gives {quick, drawbacks, benefits, different} (BUILD-PLAN 3.2) or a list: every list, in that order.
  const REASON_LISTS = ['reasons', 'items', 'cards', 'lines', 'quick', 'drawbacks', 'benefits', 'different'];
  const reasonLists = (v) => (Array.isArray(v) ? v : v && typeof v === 'object'
    ? [].concat(...REASON_LISTS.map((k) => (Array.isArray(v[k]) ? v[k] : []))) : []);
  // Engine.comebacks gives [{thought, response, at}] or strings: a card shows the reply, never the craving thought.
  const replyText = (x) => (typeof x === 'string' ? x : x && typeof x === 'object'
    ? String(x.response || x.reply || x.rebuttal || x.answer || x.text || '') : '');

  function reasonsFrom(view, E) {
    const eng = E === undefined ? glob('Engine') : E;
    if (eng && typeof eng.reasonsCard === 'function') {
      const got = texts(reasonLists(safe(() => eng.reasonsCard(view), null)));
      if (got.length) return got;
    }
    const r = latestResponse(view, 'quick-reasons');
    return texts(listOf(r && r.payload));
  }

  function deckFrom(view, E, C) {
    const eng = E === undefined ? glob('Engine') : E;
    if (eng && typeof eng.distractionDeck === 'function') {
      const got = texts(listOf(safe(() => eng.distractionDeck(view), null)));
      if (got.length) return got;
    }
    return texts(safe(() => C.catalogs.distractions, []));
  }

  function comebacksFrom(view, E) {
    const eng = E === undefined ? glob('Engine') : E;
    if (eng && typeof eng.comebacks === 'function') {
      const got = listOf(safe(() => eng.comebacks(view), null)).map(replyText).filter((s) => s.trim() !== '');
      if (got.length) return got;
    }
    return FALLBACK.talkback.slice();
  }

  // The person's own spiral thoughts first (engine), else the catalog; each with a reply.
  function spiralPairs(view, E, C) {
    const eng = E === undefined ? glob('Engine') : E;
    let raw = eng && typeof eng.spiralThoughts === 'function' ? listOf(safe(() => eng.spiralThoughts(view), null)) : [];
    if (!raw.length) raw = safe(() => C.catalogs.spiral, []) || [];
    const replies = texts(safe(() => C.catalogs.slipSelfTalk, []));
    // RS9: a thought that is crisis text or says 'hopeless' is never answered by a stock reply here.
    const keep = raw.map((x) => ({ x, thought: typeof x === 'string' ? x : toText(x) }))
      .filter((p) => p.thought.trim() && !/hopeless/i.test(p.thought) && !isCrisisText(p.thought, eng || null));
    return keep.map(({ x, thought }, i) => {
      const own = x && typeof x === 'object' ? String(x.reply || x.rebuttal || x.answer || '') : '';
      return { thought, reply: own.trim() || (i === 0 ? FALLBACK.spiralReply : replies[(i - 1) % (replies.length || 1)] || FALLBACK.spiralReply) };
    }).filter((p) => p.thought.trim());
  }

  // RS4: which first choice of the slip flow writes the slip. Only 'log' does, and never in a preview.
  function slipLogs(choice, preview) { return choice === 'log' && preview !== true; }

  // RS7: the feeling flow's tools are helpful only when the person ticks them at 'What helped?' (toggles start off).
  function markHelped(tools, ticked) {
    const yes = new Set(Array.isArray(ticked) ? ticked : []);
    return (Array.isArray(tools) ? tools : []).map((t) => Object.assign({}, t, { helpful: yes.has(t.skillId) }));
  }

  // RS6: the meetings list, each group keeping its verify flag ('please verify' shows beside it).
  function meetingsFrom(C) {
    const groups = safe(() => C.resources.in.groups, []);
    return (Array.isArray(groups) ? groups : []).filter((g) => g && g.name)
      .map((g) => ({ name: String(g.name), url: g.url ? String(g.url) : null, verify: g.verify === true }));
  }

  function activeContacts(view) {
    const rows = safe(() => view.list('contacts'), []) || [];
    return rows.filter((c) => c && c.active !== false && c.phone && telHref(c.phone));
  }

  function planFor(view) {
    const plan = safe(() => view.get('recoveryPlan', 'plan'), null);
    return plan && plan.confirmedAt ? plan : null;
  }

  function planSections(plan) {
    const sec = (plan && plan.sections) || {};
    return Object.keys(sec).map((k) => ({ id: k, items: texts(listOf(sec[k])) })).filter((s) => s.items.length);
  }

  const pad = (n) => (n < 10 ? '0' : '') + n;
  function clock(sec) {
    const s = Math.max(0, Math.round(Number(sec) || 0));
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }
  function remaining(startMs, nowMs, minutes) {
    const total = (minutes || WAVE_MIN) * 60;
    return Math.max(0, total - Math.floor((nowMs - startMs) / 1000));
  }

  const H = {
    COPY, FALLBACK, CRISIS, TOOLS, FEEL_SKILLS, WAVE_MIN,
    telHref, urgentList, outcomeFrom, isCrisisEmotion, isCrisisText, parseSos, sessionFrom, guideOrder, soberSteps,
    reasonsFrom, deckFrom, comebacksFrom, spiralPairs, slipLogs, markHelped, meetingsFrom, activeContacts, planFor, planSections, clock, remaining,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = H;
  if (typeof UI === 'undefined' || !UI || typeof document === 'undefined') return;

  /* ── Screens (browser) ──────────────────────────────────────────────────────────────────────── */
  const h = UI.h;
  const Cn = () => glob('Content') || {};
  const toast = (msg, tone) => safe(() => UI.toast(msg, tone || 'info'), null);
  const tid = (id) => ({ testid: id });
  const isLockedNow = () => safe(() => !!Store.status().locked, false);
  // The person's own rows on an SOS screen carry data-private, so a lock inside SOS can hide them at once.
  const mine = (node) => { if (node && node.dataset) node.dataset.private = '1'; return node; };

  function btn(label, onClick, opts) {
    const o = opts || {};
    return h('button', { type: 'button', class: ['btn', o.primary ? 'primary' : '', o.ghost ? 'ghost' : ''], text: label,
      dataset: o.testid ? tid(o.testid) : null, 'data-tour': o.tour || null, 'aria-pressed': o.pressed, onClick });
  }
  const link = (label, href, opts) => h('a', { class: ['btn', (opts && opts.primary) ? 'primary' : ''], href, text: label,
    dataset: opts && opts.testid ? tid(opts.testid) : null, 'data-tour': (opts && (opts['data-tour'] || opts.tour)) || null });

  // A screen: one heading (focused on paint) and at most one line, then the controls.
  function screen(title, line, ...controls) {
    return h('div', { class: 'stack sos-screen' },
      h('h1', { tabindex: '-1', class: 'sos-title', text: title }),
      line ? h('p', { class: 'sos-line', text: line }) : null,
      ...controls);
  }

  function ratingRow(onPick, testid) {
    const row = h('div', { class: 'sos-rating', role: 'group', 'aria-label': '0 to 10', dataset: tid(testid || 'sos-rating'),
      style: { display: 'grid', gridTemplateColumns: 'repeat(6, minmax(44px, 1fr))', gap: '8px' } });
    for (let n = 0; n <= 10; n += 1) {
      row.appendChild(h('button', { type: 'button', class: 'btn', text: String(n), dataset: { value: String(n) },
        style: { minHeight: '56px', width: '100%' }, onClick: () => onPick(n) }));
    }
    return row;
  }

  // An SOS write refused with LOCKED (a lock came while SOS stayed open) waits here, in memory only, and is saved
  // after the next unlock (core's Q1). Nothing of it is stored or logged anywhere else meanwhile.
  const waiting = [];
  let flushing = false;
  let listening = false;
  async function flushWaiting() {
    if (flushing || !waiting.length || isLockedNow()) return;
    flushing = true;
    try {
      while (waiting.length && !isLockedNow()) {
        try { await waiting[0](); } catch (err) { if (err && err.code === 'LOCKED') break; }
        waiting.shift();
      }
    } finally { flushing = false; }
  }
  function keepForUnlock(fn) {
    waiting.push(fn);
    const S = glob('Store');
    if (!listening && S && typeof S.subscribe === 'function') { listening = true; safe(() => S.subscribe(() => { flushWaiting(); }), null); }
  }
  async function save(fn) {
    try { return await fn(); } catch (err) {
      if (err && err.code === 'LOCKED') { keepForUnlock(fn); toast(COPY.lockedKept, 'info'); return null; }
      toast(COPY.notSaved, 'warn');
      return null;
    }
  }

  async function copyText(text) {
    let ok = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') { await navigator.clipboard.writeText(text); ok = true; }
    } catch (e) { ok = false; }
    if (!ok) {
      try {
        const ta = h('textarea', { 'aria-hidden': 'true', style: { position: 'fixed', left: '-9999px' } });
        ta.value = text;
        document.body.appendChild(ta); ta.select();
        ok = !!document.execCommand && document.execCommand('copy');
        ta.remove();
      } catch (e) { ok = false; }
    }
    toast(ok ? COPY.copied : 'Could not copy. It is ' + text + '.', ok ? 'ok' : 'warn');
  }

  // The urgent numbers. Reads Content (and the region from the profile when unlocked) only. Shared with the lock screen.
  function urgentView(c, opts) {
    const o = opts || {};
    const region = safe(() => c.profile.region, 'in');
    const model = urgentList(region, Cn());
    const words = o.crisis ? COPY.crisis : COPY.urgent;
    let n = 0;
    const sections = model.sections.map((sec) => h('section', { class: 'stack', 'aria-label': sec.name },
      h('h2', { text: sec.name }),
      h('ul', { class: 'sos-list' }, sec.items.map((it) => {
        const i = it.tel ? ++n : 0;
        const verify = it.verify ? h('span', { class: 'sos-verify muted', dataset: tid('urgent-verify'), text: COPY.verify }) : null;
        const main = it.tel
          ? h('a', { class: 'sos-target', href: it.tel, dataset: tid('urgent-number-' + i), 'aria-label': 'Call ' + it.name + ', ' + it.number },
            h('span', { class: 'sos-target-name', text: it.name }), h('span', { class: 'sos-target-number', text: it.number }))
          : h('div', { class: 'sos-target' }, h('span', { class: 'sos-target-name', text: it.name }),
            it.url ? h('span', { class: 'sos-target-number', text: it.url }) : it.note ? h('span', { class: 'muted', text: it.note }) : null);
        const copyWhat = it.number || it.url;
        return h('li', { class: 'stack' }, main,
          h('div', { class: 'row' },
            copyWhat ? h('button', { type: 'button', class: 'btn ghost', text: 'Copy', dataset: i ? tid('urgent-copy-' + i) : null,
              'aria-label': 'Copy ' + copyWhat, style: { width: 'auto', minHeight: '44px' }, onClick: () => copyText(copyWhat) }) : null,
            it.altTel ? h('a', { class: 'btn ghost', href: it.altTel, text: it.alt, style: { width: 'auto', minHeight: '44px' } }) : null,
            verify));
      })),
      sec.verifyNote && !o.crisis ? h('p', { class: 'muted', text: sec.verifyNote }) : null));
    const extra = (title, lines) => (lines.length ? h('details', { class: 'card' }, h('summary', { text: title, style: { minHeight: '44px' } }),
      h('ol', null, lines.map((t) => h('li', { text: t })))) : null);
    return h('div', { class: 'stack', dataset: tid(o.crisis ? 'sos-crisis' : 'sos-urgent'), 'aria-live': o.crisis ? 'assertive' : null },
      h('h1', { tabindex: '-1', class: 'sos-title', text: words.title }),
      h('p', { class: 'sos-line', text: words.line }),
      ...sections,
      o.crisis && sections.length ? h('p', { class: 'muted', dataset: tid('crisis-verify'), text: COPY.crisisVerify }) : null,
      o.crisis ? null : extra(COPY.overdose, model.overdose), // a crisis: the numbers and little else
      o.crisis ? null : extra(COPY.withdrawal, model.withdrawal));
  }

  // SOBER, one step a time, with read-aloud (device voice only, O4). Shared with the lock screen.
  function soberView(onDone, doneLabel, title) { // title: 'Breathe' from the discreet lock screen (RS8)
    const steps = soberSteps(Cn());
    let i = 0;
    const box = h('div', { class: 'stack' });
    const paint = () => {
      const last = i >= steps.length - 1;
      box.replaceChildren(screen(title || COPY.wave.title, steps[i],
        btn('Read aloud', () => { if (!safe(() => UI.speak(steps[i]), false)) toast(COPY.noVoice, 'info'); }, { ghost: true }),
        btn(last ? (doneLabel || 'Done') : 'Next', () => {
          safe(() => UI.stopSpeaking(), null);
          if (last) { if (onDone) onDone(); } else { i += 1; paint(); focusTitle(box); }
        }, { primary: true })));
    };
    paint();
    return box;
  }

  function focusTitle(root) {
    const t = root && root.querySelector && root.querySelector('.sos-title');
    if (t && t.focus) safe(() => t.focus({ preventScroll: false }), null);
  }

  // `list`: an array, or a function read again at each paint (a card drawn after a lock has none of the person's rows).
  function cards(title, list, emptyText, onDone, testid, priv) {
    let i = 0;
    const box = h('div', { class: 'stack', dataset: testid ? tid(testid) : null });
    const paint = () => {
      const items = (typeof list === 'function' ? list() : list) || [];
      if (!items.length) { box.replaceChildren(screen(title, emptyText, btn('Done', onDone, { primary: true }))); return; }
      const s = screen(title, items[i % items.length],
        items.length > 1 ? btn('Another one', () => { i += 1; paint(); focusTitle(box); }) : null,
        btn('Done', onDone, { primary: true }));
      if (priv) mine(s.querySelector('.sos-line'));
      box.replaceChildren(s);
    };
    paint();
    return box;
  }

  function contactsView(c, drill, onDone, words) {
    const A = c.A;
    const w = words || COPY.call; // the slip flow says Reach out
    const people = drill || isLockedNow() ? [] : activeContacts(c.view);
    const groups = meetingsFrom(Cn());
    const reached = (id, how) => { if (!drill && A && A.contacts && A.contacts.reached) save(() => A.contacts.reached(id, how)); };
    const list = people.length
      ? mine(h('div', null, h('ul', { class: 'sos-list' }, people.map((p) => h('li', { class: 'row' },
        h('a', { class: 'sos-target', href: telHref(p.phone), onClick: () => reached(p.id, 'call') },
          h('span', { class: 'sos-target-name', text: p.name || 'Safety Net' }), h('span', { class: 'sos-target-number', text: 'Call' })),
        h('a', { class: 'btn ghost', href: 'sms:' + telHref(p.phone).slice(4), text: 'Text', style: { width: 'auto' }, onClick: () => reached(p.id, 'text') }))))))
      : null;
    return h('div', { class: 'stack' },
      screen(w.title, drill ? COPY.call.drill : people.length ? w.line : COPY.call.none, list),
      groups.length ? h('details', { class: 'card' }, h('summary', { text: COPY.meetings.title, style: { minHeight: '44px' } }),
        h('ul', { class: 'sos-list' }, groups.map((g) => h('li', { class: 'row' }, h('span', { text: g.name }),
          g.url ? h('button', { type: 'button', class: 'btn ghost', text: 'Copy link', style: { width: 'auto' }, onClick: () => copyText(g.url) }) : null,
          g.verify ? h('span', { class: 'sos-verify muted', dataset: tid('meetings-verify'), text: COPY.verify }) : null)))) : null,
      btn('Done', onDone, { primary: true }));
  }

  /* ── The craving flow (and the drill) ───────────────────────────────────────────────────────── */
  function cravingFlow(c, mode) {
    const A = c.A;
    const st = { kind: 'craving', ratingBefore: null, ratingAfter: null, tools: [], delays: 0, used: false, risky: false, drill: !!mode.drill };
    let started = Date.now();
    let queue = [];
    const body = h('div', { class: 'stack' });
    const timer = h('p', { class: 'sos-timer', role: 'timer', 'aria-label': 'Wave timer', dataset: tid('sos-timer'), text: clock(WAVE_MIN * 60),
      style: { fontSize: '2rem', fontWeight: '700', margin: '0', fontVariantNumeric: 'tabular-nums' } });
    const root = h('section', { class: 'page sos-page stack', dataset: tid('sos-craving') },
      mode.drill ? h('p', { class: 'card', dataset: tid('sos-drill-banner'), text: COPY.drillBanner }) : null,
      timer, body,
      h('div', { class: 'row' }, link('Urgent help', '#/sos/urgent'), link('Back to SOS', '#/sos')));
    let seen = false;
    const iv = setInterval(() => {
      if (!root.isConnected) { if (seen) clearInterval(iv); return; }
      seen = true;
      const left = remaining(started, Date.now(), WAVE_MIN);
      timer.textContent = left > 0 ? clock(left) : 'Time to check in';
    }, 1000);
    const show = (node) => { safe(() => UI.stopSpeaking(), null); body.replaceChildren(node); focusTitle(body); };
    const credit = (tool) => (helpful) => { st.tools.push({ skillId: tool.skillId, helpful }); next(); };
    const helped = (tool) => show(screen(COPY.helped.title, null,
      btn('It helped', () => credit(tool)(true), { primary: true }), btn('Not really', () => credit(tool)(false))));
    const next = () => { if (queue.length) runTool(queue.shift()); else if (st.guided) { st.guided = false; reassess(); } else tools(); };
    const reasons = () => (mode.drill ? texts(safe(() => Cn().catalogs.reassuring, [])) : isLockedNow() ? [] : reasonsFrom(c.view, c.E));

    function runTool(id) {
      const tool = TOOLS.find((t) => t.id === id);
      if (!tool) { next(); return; }
      if (id === 'wave') show(soberView(() => helped(tool)));
      else if (id === 'why') show(cards(COPY.why.title, reasons, COPY.why.empty, () => helped(tool), null, !mode.drill));
      else if (id === 'call') show(contactsView(c, mode.drill, () => helped(tool)));
      else if (id === 'distract') show(cards(COPY.distract.title, () => deckFrom(mode.drill || isLockedNow() ? null : c.view, c.E, Cn()), '', () => helped(tool), null, !mode.drill));
      else if (id === 'talkback') show(cards(COPY.talkback.title, () => (mode.drill || isLockedNow() ? FALLBACK.talkback.slice() : comebacksFrom(c.view, c.E)), '', () => helped(tool), null, !mode.drill));
    }

    function rate() {
      show(screen(COPY.rate.title, COPY.rate.line,
        ratingRow((n) => { st.ratingBefore = n; tools(); }),
        btn('Skip', tools, { ghost: true })));
    }

    function tools() {
      show(screen(COPY.tools.title, COPY.tools.line,
        h('div', { class: 'stack' }, TOOLS.map((t) => btn(t.label, () => runTool(t.id), { testid: 'sos-tool-' + t.id, primary: t.id === 'wave' }))),
        btn('Guide me', () => { st.guided = true; queue = guideOrder(c.view, c.E); next(); }, { testid: 'sos-tool-guide' }),
        btn(st.risky ? 'I am leaving the risky place' : 'I am somewhere risky', () => { st.risky = !st.risky; tools(); }, { ghost: true, pressed: st.risky ? 'true' : 'false' }),
        btn('Check in with the craving', reassess, { ghost: true })));
    }

    function reassess() {
      const row = ratingRow((n) => {
        st.ratingAfter = n;
        for (const b of row.querySelectorAll('button')) b.setAttribute('aria-pressed', b.dataset.value === String(n) ? 'true' : 'false');
      });
      show(screen(COPY.reassess.title, COPY.reassess.line, row,
        btn('It passed', () => { st.outcome = 'passed'; usedQ(); }, { primary: true, testid: 'sos-reassess-passed' }),
        btn('Still strong: wait 15 more', () => { st.delays += 1; st.ratingAfter = null; started = Date.now(); tools(); }, { testid: 'sos-reassess-still' })));
    }

    function usedQ() {
      show(screen(COPY.used.title, COPY.used.line,
        btn('No', () => finish(false), { primary: true, testid: 'sos-used-no' }),
        btn('Yes', () => finish(true), { testid: 'sos-used-yes' })));
    }

    async function finish(used) {
      if (st.finished) return; // a second tap while the save runs writes nothing more
      st.finished = true;
      st.used = used;
      clearInterval(iv);
      const payload = sessionFrom(st);
      if (A && typeof A.sosSession === 'function') await save(() => A.sosSession(payload));
      if (used && !mode.drill) { UI.go('#/sos/slip?logged=1'); return; }
      if (used && mode.drill) { UI.go('#/sos/slip?preview=1'); return; }
      const words = mode.drill ? COPY.drillDone : COPY.surfed;
      show(screen(words.title, words.line, link('Finish', '#/today', { primary: true, testid: 'sos-finish' })));
    }

    rate();
    return root;
  }

  /* ── The feeling flow ───────────────────────────────────────────────────────────────────────── */
  function feelingFlow(c) {
    const A = c.A;
    const C = Cn();
    const st = { emotion: null, tools: [] };
    const body = h('div', { class: 'stack' });
    const root = h('section', { class: 'page sos-page stack', dataset: tid('sos-feeling') }, body,
      h('div', { class: 'row' }, link('Urgent help', '#/sos/urgent'), link('Back to SOS', '#/sos')));
    const show = (node) => { safe(() => UI.stopSpeaking(), null); body.replaceChildren(node); focusTitle(body); };
    const crisis = () => show(urgentView(c, { crisis: true }));
    const use = (skill, then) => () => { st.tools.push({ skillId: skill, helpful: false }); then(); }; // helpful only when ticked (RS7)

    function pick() {
      const list = Array.isArray(C.emotions) ? C.emotions : [];
      show(screen(COPY.feelPick.title, COPY.feelPick.line, h('div', { class: 'stack' }, list.map((e) => btn(e.name, () => {
        st.emotion = e.id;
        if (isCrisisEmotion(e.id, C)) crisis();
        else if (e.id === 'other') other();
        else if (e.tools === 'anger') beat();
        else low();
      }, { testid: 'sos-feeling-' + e.id })))));
    }

    function other() {
      const input = h('input', { id: 'sos-feel-text', type: 'text', maxlength: '120', autocomplete: 'off', 'aria-label': COPY.feelOther.title, style: { minHeight: '44px', width: '100%' } });
      const go = () => { if (isCrisisText(input.value, c.E)) crisis(); else low(); };
      input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); go(); } });
      show(screen(COPY.feelOther.title, COPY.feelOther.line, input, btn('Next', go, { primary: true })));
    }

    function beat() {
      let n = 10; let iv = null;
      const count = h('p', { role: 'timer', 'aria-live': 'off', text: '10', style: { fontSize: '3rem', fontWeight: '700', margin: '0', textAlign: 'center' } });
      const startBtn = btn('Start counting', () => {
        if (iv) return;
        startBtn.disabled = true;
        iv = setInterval(() => {
          if (!count.isConnected) { clearInterval(iv); return; }
          n -= 1; count.textContent = String(Math.max(0, n));
          if (n <= 0) { clearInterval(iv); selfTalk(); }
        }, 1000);
      }, { primary: true });
      show(screen(COPY.beat.title, COPY.beat.line, count, startBtn, btn('Next', () => { if (iv) clearInterval(iv); selfTalk(); }, { ghost: true })));
      function selfTalk() {
        show(cards(COPY.selfTalk.title, texts(safe(() => C.catalogs.angerSelfTalk, [])), '', use(FEEL_SKILLS.beat, assertive)));
      }
      function assertive() {
        const line = toText(safe(() => C.catalogs.assertiveLine, ''));
        show(screen(COPY.assertive.title, line, btn('Next', () => callStep(), { primary: true })));
      }
    }

    function low() {
      show(soberView(use(FEEL_SKILLS.sober, () => {
        const lines = texts(safe(() => C.catalogs.reassuring, [])).concat(texts(safe(() => C.catalogs.acceptance, [])));
        show(cards(COPY.selfTalk.title, lines, '', use(FEEL_SKILLS.selfTalk, activity)));
      }), 'Next'));
    }

    function activity() {
      const all = [].concat(...(safe(() => C.catalogs.activities, []) || []).map((g) => texts(g && g.items)));
      const start = all.length ? new Date().getDate() % all.length : 0; // the day picks the first card: no chance involved
      show(cards(COPY.activity.title, all.slice(start).concat(all.slice(0, start)), '', use(FEEL_SKILLS.activity, callStep)));
    }

    function callStep() { show(contactsView(c, false, helpedStep)); }

    // Asked once, at the end: every toggle starts off, and one left off is saved as helpful:false.
    function helpedStep() {
      const label = { [FEEL_SKILLS.beat]: COPY.beat.title, [FEEL_SKILLS.sober]: COPY.wave.title, [FEEL_SKILLS.selfTalk]: COPY.selfTalk.title, [FEEL_SKILLS.activity]: COPY.activity.title };
      const ids = [...new Set(st.tools.map((t) => t.skillId))];
      if (!ids.length) { rateEnd(); return; }
      const boxes = ids.map((id) => {
        const input = h('input', { type: 'checkbox', id: 'sos-helped-' + id, dataset: tid('sos-helped-' + id), style: { width: '24px', height: '24px' } });
        input.checked = false;
        return { id, input, el: h('label', { class: 'row', for: 'sos-helped-' + id, style: { minHeight: '44px', alignItems: 'center' } }, input, h('span', { text: label[id] || id })) };
      });
      show(h('div', { class: 'stack', dataset: tid('sos-helped') }, screen(COPY.feelHelped.title, COPY.feelHelped.line,
        h('div', { class: 'stack' }, boxes.map((b) => b.el)),
        btn('Next', () => { st.tools = markHelped(st.tools, boxes.filter((b) => b.input.checked).map((b) => b.id)); rateEnd(); }, { primary: true }))));
    }

    function rateEnd() {
      show(screen(COPY.feelRate.title, COPY.feelRate.line,
        ratingRow((n) => done(n)), btn('Skip', () => done(null), { ghost: true })));
    }

    let saving = false;
    async function done(intensity) {
      if (saving) return; // a second tap while the save runs writes nothing more
      saving = true;
      if (A && typeof A.sosSession === 'function') { // one verb, rated or not: SosCompleted either way, and the feeling kept
        const s = { kind: 'feeling', tools: st.tools, emotion: st.emotion };
        if (isScoreN(intensity)) s.ratingAfter = intensity;
        await save(() => A.sosSession(sessionFrom(s)));
      }
      const stage = safe(() => c.profile.stage, null);
      if (stage && A && A.motivation && typeof A.motivation.add === 'function') {
        show(screen(COPY.motivation.title, COPY.motivation.line,
          ratingRow((n) => { save(() => A.motivation.add({ stage, score: n, source: 'sos' })); end(); }, 'sos-motivation'),
          btn('Skip', end, { ghost: true })));
      } else end();
    }

    function end() { show(screen(COPY.feelDone.title, COPY.feelDone.line, link('Finish', '#/today', { primary: true, testid: 'sos-finish' }))); }

    pick();
    return root;
  }

  /* ── The slipped flow (Lapse Recovery; ?preview=1 rehearses and writes nothing) ────────────────── */
  function slipFlow(c, mode) {
    const A = c.A;
    const C = Cn();
    const body = h('div', { class: 'stack' });
    const root = h('section', { class: 'page sos-page stack', dataset: tid('sos-slip') },
      mode.preview ? h('p', { class: 'card', dataset: tid('sos-preview-banner'), text: COPY.previewBanner }) : null,
      body, h('div', { class: 'row' }, link('Urgent help', '#/sos/urgent'), link('Back to SOS', '#/sos')));
    const show = (node) => { body.replaceChildren(node); focusTitle(body); };
    let logged = mode.logged;
    const write = (fn) => (mode.preview ? Promise.resolve(toast(COPY.previewBanner, 'info')) : save(fn));

    function start() {
      const go = (choice) => () => {
        if (!logged && slipLogs(choice, mode.preview) && A && typeof A.logSlip === 'function') { logged = true; save(() => A.logSlip({})); }
        safety();
      };
      show(screen(COPY.slipStart.title, COPY.slipStart.line,
        btn(COPY.slipStart.log, go('log'), { primary: true, testid: 'sos-slip-continue' }),
        btn(COPY.slipStart.read, go('read'), { ghost: true, testid: 'sos-slip-reading' })));
    }

    function safety() {
      const res = safe(() => C.resources, {}) || {};
      const facts = texts(res.overdose).concat(texts(res.withdrawal));
      show(screen(COPY.slipSafe.title, COPY.slipSafe.line,
        btn('I am safe', spiral, { primary: true, testid: 'sos-slip-safe' }),
        link('I need help now', '#/sos/urgent', { testid: 'sos-slip-help' }),
        facts.length ? h('details', { class: 'card' }, h('summary', { text: 'Safety facts', style: { minHeight: '44px' } }),
          h('ul', null, facts.map((t) => h('li', { text: t })))) : null));
    }

    function spiral() {
      let i = 0;
      const paint = () => {
        const pairs = spiralPairs(mode.preview || isLockedNow() ? null : c.view, c.E, C); // read again: after a lock, none of the person's
        if (!pairs.length) { reach(); return; }
        const p = pairs[Math.min(i, pairs.length - 1)];
        const last = i >= pairs.length - 1 || i >= 2; // three at most: enough to stop the spiral, not a lecture
        const s = screen('“' + p.thought + '”', p.reply,
          last ? null : btn('Next thought', () => { i += 1; paint(); }),
          btn('Continue', reach, { primary: true }));
        if (!mode.preview) { mine(s.querySelector('.sos-title')); mine(s.querySelector('.sos-line')); }
        show(s);
      };
      paint();
    }

    function reach() { show(contactsView(c, mode.preview, nextSteps, COPY.reach)); }

    function nextSteps() {
      let adding = false;
      show(screen(COPY.slipNext.title, COPY.slipNext.line,
        link('Slip Review now', '#/exercise/slip-review', { primary: true, testid: 'sos-slip-review' }),
        btn('Add it to my to-dos', async () => {
          if (adding) return; // one to-do for one tap, however fast the second comes
          adding = true;
          if (A && A.todos && typeof A.todos.add === 'function') {
            const r = await write(() => A.todos.add({ text: 'Do the Slip Review', source: 'sos', route: '#/exercise/slip-review' }));
            if (r && !mode.preview) toast('Added to your to-dos.', 'ok');
          }
          finish();
        }, { testid: 'sos-slip-todo' }),
        link('Revisit my reasons', '#/workbook/motivation'),
        link('Step up support', '#/workbook/plan'),
        btn('Not now', finish, { ghost: true })));
    }

    function finish() { show(screen(COPY.slipDone.title, COPY.slipDone.line, link('Finish', '#/today', { primary: true, testid: 'sos-finish' }))); }

    start();
    return root;
  }

  /* ── The hub ────────────────────────────────────────────────────────────────────────────────── */
  function hub(c) {
    const plan = isLockedNow() ? null : planFor(c.view);
    const secs = planSections(plan);
    return h('section', { class: 'page sos-page stack', dataset: tid('sos-hub') },
      link('Urgent help', '#/sos/urgent', { primary: true, 'data-tour': 'sos-urgent', testid: 'sos-go-urgent' }),
      screen(COPY.hub.title, COPY.hub.line,
        link('I’m craving', '#/sos/craving', { 'data-tour': 'sos-craving', testid: 'sos-go-craving' }),
        link('A hard feeling', '#/sos/feeling', { testid: 'sos-go-feeling' }),
        link('I slipped', '#/sos/slip', { testid: 'sos-go-slip' })),
      secs.length ? mine(h('div', null, h('details', { class: 'card', dataset: tid('sos-plan') }, h('summary', { text: 'My plan', style: { minHeight: '44px' } }),
        ...secs.map((s) => h('ul', { 'aria-label': s.id }, s.items.map((t) => h('li', { text: t }))))))) : null,
      link('Leave SOS', '#/today', { testid: 'sos-leave' }));
  }

  // A lock inside SOS (manual or auto): ui-core keeps SOS on screen, so the page hides the person's rows itself, at
  // once, and the flow goes on. It never navigates.
  function hideOnLock(node) {
    const S = glob('Store');
    if (!node || !node.querySelectorAll || !S || !S.lock || typeof S.lock.onLock !== 'function') return node;
    let off = null;
    off = safe(() => S.lock.onLock(() => {
      if (!node.isConnected) { if (typeof off === 'function') off(); return; }
      for (const n of node.querySelectorAll('[data-private]')) n.textContent = COPY.hidden;
    }), null);
    return node;
  }

  function page(c) {
    return hideOnLock(pageFor(c));
  }

  function pageFor(c) {
    const m = parseSos(c && c.route);
    if (m.flow === 'urgent') {
      return h('section', { class: 'page sos-page stack' }, urgentView(c), link('Back to SOS', '#/sos'));
    }
    if (m.flow === 'craving') return cravingFlow(c, m);
    if (m.flow === 'feeling') return feelingFlow(c);
    if (m.flow === 'slip') return slipFlow(c, m);
    return hub(c);
  }

  UI.sosHelpers = H;
  UI.sosUrgentView = (c, opts) => urgentView(c || {}, opts);
  UI.sosSoberView = (onDone, label, title) => soberView(onDone, label, title);
  if (UI.pages) UI.pages.sos = page;
})();
