/* 1-addic · ui-onboarding.js · the lock screen and the eight onboarding steps (BUILD-PLAN 3.5 #/lock and #/onboarding,
   PLAN 5.1; unit U-11, lane actions-sos). Contract: tracks/CORE/contracts/actions-sos.md and core.md section E (Store.lock).
   Rules this file keeps: the lock screen reaches urgent help and the SOBER practice in one tap without the PIN, from
   Content only (never stored rows); a wrong PIN gets a short message and a one-second pause; the PIN is never stored,
   logged or kept after the attempt; a PIN is offered, never forced (O2); "Forgot PIN" is an erase then a restore from
   a backup, said plainly; every onboarding step can be skipped except the safety notice ("I understand"), and none of
   it gates SOS (the SOS button stays in the chrome). The discreet name for the locked chrome comes from the device
   flag '1-addic:discreet' (ui-core's chrome), never from the sealed settings. Pure helpers load in Node. */
(function () {
  'use strict';

  const WRONG_PAUSE_MS = 1000;
  const DISCREET_KEY = '1-addic:discreet';

  // In-file copy, listed in the lane report (clinicalReview: true for the safety step and the lock's help line).
  const COPY = {
    clinicalReview: true,
    lock: { title: 'Locked', line: 'Enter your PIN. Help works without it.' },
    wrong: 'That PIN did not match.',
    forgot: { title: 'Forgot your PIN?', line: 'Without the PIN, the only way in is to erase this notebook on this device, then restore a backup if you have one.' },
    erase: { title: 'Erase everything on this device?', message: 'Your notes here will be gone. A backup file can bring them back.', confirm: 'Erase' },
    early: 'Early access: this is a test version. Export a backup now and then.',
    opioid: 'After a break, your tolerance drops. Never use alone. In an emergency, call for help.', // RS5, clinicalReview
    steps: {
      welcome: { title: 'Welcome', line: 'A private skills coach for recovery. It is not treatment or a diagnosis.' },
      privacy: { title: 'Your notebook stays here', line: 'Nothing leaves this device. A PIN is recommended, never required.' },
      focus: { title: 'Your focus', line: 'Pick what fits. You can change it later.' },
      where: { title: 'Where you are', line: 'There is no wrong answer. This sets the tone.' },
      safety: { title: 'A quick safety check', line: 'Not a diagnosis. Tick any that fit you.' },
      sos: { title: 'Make SOS yours', line: 'Three quick reasons, one person, and where you are.' },
      rhythm: { title: 'Your rhythm', line: 'When to check in, and how fast to learn.' },
      tour: { title: 'You are set', line: 'Take a two-minute tour, or practise SOS once.' },
    },
    safetyOk: 'I understand',
    tourLater: 'The guided tour is coming in a later version.',
    pinSet: 'PIN set. The notebook locks after 5 minutes away.',
    pinMismatch: 'The two PINs do not match.',
  };

  // The eight steps of PLAN 5.1. Only the safety notice cannot be skipped.
  const STEPS = [
    { n: 1, id: 'welcome', skip: true }, { n: 2, id: 'privacy', skip: true }, { n: 3, id: 'focus', skip: true },
    { n: 4, id: 'where', skip: true }, { n: 5, id: 'safety', skip: false }, { n: 6, id: 'sos', skip: true },
    { n: 7, id: 'rhythm', skip: true }, { n: 8, id: 'tour', skip: true },
  ];
  // The answers each step owns: Skip clears exactly these.
  const STEP_KEYS = {
    welcome: ['earlyNoticeSeen'], privacy: ['discreet'], focus: ['substances', 'substanceOther', 'term', 'startDate', 'notSure'],
    where: ['stage', 'score'], safety: ['medical'], sos: ['reasons', 'contact', 'region'], rhythm: ['checkin', 'reviewDay', 'pace'], tour: [],
  };

  const safe = (fn, fallback) => { try { const v = fn(); return v === undefined || v === null ? fallback : v; } catch (e) { return fallback; } };
  // Content and Store are const globals of other scripts (not globalThis properties in a browser).
  const getContent = () => safe(() => (typeof Content !== 'undefined' ? Content : null), null) || {};
  const getStore = () => safe(() => (typeof Store !== 'undefined' ? Store : null), null);
  const str = (v, max) => (typeof v === 'string' && v.trim() && v.trim().length <= max ? v.trim() : null);
  const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + 'T00:00:00'));
  const isTime = (v) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  const known = (list, id) => Array.isArray(list) && list.some((x) => x && x.id === id);

  function needsMedicalCard(medical) {
    return !!(medical && (medical.heavyDaily === true || medical.sedatives === true || medical.opioids === true));
  }

  // RS5: the safety card's lines for the ticks. Content's withdrawal lines when any box is ticked; with opioids,
  // Content.resources.opioidSafety when it is there, else the one built-in tolerance line.
  const lineList = (v) => [].concat(v && !Array.isArray(v) && typeof v === 'object' && v.lines ? v.lines : v == null ? [] : v)
    .map((x) => (typeof x === 'string' ? x : x && x.text ? String(x.text) : '')).filter((s) => s.trim() !== '');
  function medicalLines(medical, C) {
    if (!needsMedicalCard(medical)) return [];
    const res = safe(() => (C || getContent()).resources, null) || {};
    const out = lineList(res.withdrawal);
    if (medical.opioids === true) { const own = lineList(res.opioidSafety); out.push(...(own.length ? own : [COPY.opioid])); }
    return out;
  }

  const PHONE_RE = /^[0-9+()\-.\s]{3,24}$/; // the same rule as Actions.checkContact (actions.js)

  // Answers -> the writes of the finish, keeping only what Actions accepts. Missing answers write nothing.
  function buildPatch(answers, C) {
    const a = answers || {};
    const content = C || getContent();
    const profile = {};
    const subs = Array.isArray(a.substances) ? a.substances.filter((s) => str(s, 120)) : [];
    const other = str(a.substanceOther, 120);
    if (other && !subs.includes(other)) subs.push(other);
    if (subs.length) profile.substances = subs.slice(0, 20);
    if (typeof a.term === 'string' && known(content.terms, a.term)) profile.term = a.term;
    if (a.notSure === true) { profile.notSure = true; profile.startDate = null; } else if (isDate(a.startDate)) profile.startDate = a.startDate;
    if (typeof a.stage === 'string' && known(content.stages, a.stage)) profile.stage = a.stage;
    if (a.medical && typeof a.medical === 'object') {
      profile.medical = { heavyDaily: a.medical.heavyDaily === true, sedatives: a.medical.sedatives === true, opioids: a.medical.opioids === true };
    }
    profile.region = a.region === 'intl' ? 'intl' : 'in';
    if (a.checkin && typeof a.checkin === 'object') {
      const c = {};
      for (const k of ['morning', 'evening']) if (isTime(a.checkin[k])) c[k] = a.checkin[k];
      if (Object.keys(c).length) profile.checkin = c;
    }
    if (Number.isInteger(a.reviewDay) && a.reviewDay >= 0 && a.reviewDay <= 6) profile.reviewDay = a.reviewDay;
    if (typeof a.pace === 'string' && known(content.paces, a.pace)) profile.pace = a.pace;
    const settings = {};
    if (typeof a.discreet === 'boolean') settings.discreet = a.discreet;
    if (a.earlyNoticeSeen === true) settings.earlyNoticeSeen = true;
    const motivation = profile.stage && Number.isInteger(a.score) && a.score >= 0 && a.score <= 10
      ? { stage: profile.stage, score: a.score, source: 'onboarding' } : null;
    const reasons = (Array.isArray(a.reasons) ? a.reasons : []).map((r) => str(r, 200)).filter(Boolean).slice(0, 3);
    const cname = a.contact && str(a.contact.name, 80);
    const typed = a.contact && str(a.contact.phone, 40);
    const cphone = typed && PHONE_RE.test(typed) ? typed : null; // a number Actions would refuse never costs the name
    const contact = cname ? Object.assign({ name: cname, role: 'safetyNet' }, cphone ? { phone: cphone } : {}) : null;
    return { profile, settings, motivation, reasons: reasons.length ? reasons : null, contact, phoneDropped: !!(contact && typed && !cphone) };
  }

  // The finish: Actions.onboard first (it creates the settings row), then the optional extras. A failed extra never
  // stops the person from reaching Today; the errors come back by code only (no personal text).
  async function finishOnboarding(A, answers, C) {
    const p = buildPatch(answers, C);
    const errors = [];
    const run = async (name, fn) => { try { await fn(); } catch (err) { errors.push({ step: name, code: (err && err.code) || 'error' }); } };
    if (!A || typeof A.onboard !== 'function') return { ok: false, errors: [{ step: 'onboard', code: 'no-actions' }], patch: p };
    await run('onboard', () => A.onboard(p.profile));
    if (errors.length) return { ok: false, errors, patch: p };
    if (Object.keys(p.settings).length) await run('settings', () => A.settings.patch(p.settings));
    if (p.motivation) await run('motivation', () => A.motivation.add(p.motivation));
    if (p.reasons) await run('reasons', () => A.saveResponse('quick-reasons', { reasons: p.reasons }));
    if (p.contact) await run('contact', () => A.contacts.add(p.contact));
    return { ok: true, errors, patch: p };
  }

  function lockError(err) {
    const code = err && err.code;
    if (code === 'BAD_PIN') return 'Use 4 to 64 characters.';
    if (code === 'NO_CRYPTO') return 'A PIN is not available on this device.';
    if (code === 'WRITE_FAILED') return 'This device did not save it. Try again.';
    return 'Something went wrong. Try again.';
  }

  // One unlock attempt. Wrong PIN: the message after a pause. The PIN is only passed to Store.lock.unlock.
  async function attemptUnlock(S, pin, opts) {
    const wait = opts && Number.isInteger(opts.delayMs) ? opts.delayMs : WRONG_PAUSE_MS;
    const pause = () => new Promise((r) => setTimeout(r, wait));
    if (!S || !S.lock || typeof S.lock.unlock !== 'function') return { ok: false, message: lockError(null) };
    if (typeof pin !== 'string' || pin === '') return { ok: false, message: COPY.wrong };
    let ok = false;
    try { ok = (await S.lock.unlock(pin)) === true; } catch (err) { await pause(); return { ok: false, message: lockError(err) }; }
    if (ok) return { ok: true, message: '' };
    await pause();
    return { ok: false, message: COPY.wrong };
  }

  function lockLabels(discreet, C) {
    const content = C || getContent();
    return {
      title: discreet ? String(content.discreetName || 'Notebook') : COPY.lock.title,
      line: COPY.lock.line,
      urgent: { label: discreet ? 'Help' : 'Urgent help', href: '#/sos/urgent' },
      sober: { label: discreet ? 'Breathe' : 'Ride the wave (SOBER)', href: '#/sos/craving', title: discreet ? 'Breathe' : null },
    };
  }

  function discreetFrom(flag, attr) { return flag === '1' || attr === true; }
  const cryptoReady = () => safe(() => !!(typeof crypto !== 'undefined' && crypto.subtle), false);

  async function forgetPin(S) {
    if (!S || typeof S.resetAll !== 'function') return false;
    await S.resetAll();
    return true;
  }

  const O = { COPY, STEPS, STEP_KEYS, WRONG_PAUSE_MS, needsMedicalCard, medicalLines, buildPatch, finishOnboarding, lockError, attemptUnlock,
    lockLabels, discreetFrom, forgetPin };
  if (typeof module !== 'undefined' && module.exports) module.exports = O;
  if (typeof UI === 'undefined' || !UI || typeof document === 'undefined') return;

  /* ── Screens (browser) ──────────────────────────────────────────────────────────────────────── */
  const h = UI.h;
  const tid = (id) => ({ testid: id });
  const toast = (msg, tone) => safe(() => UI.toast(msg, tone || 'info'), null);
  const isDiscreet = () => discreetFrom(safe(() => localStorage.getItem(DISCREET_KEY), null), safe(() => document.documentElement.hasAttribute('data-discreet'), false));
  const btn = (label, onClick, o) => h('button', { type: 'button', class: ['btn', o && o.primary ? 'primary' : '', o && o.ghost ? 'ghost' : '', o && o.danger ? 'danger' : ''],
    text: label, dataset: o && o.testid ? tid(o.testid) : null, onClick });
  let uid = 0;
  const nextId = (p) => 'onb-' + p + '-' + (++uid);

  function field(label, input, hint) {
    if (!input.id) input.id = nextId('f');
    return h('div', { class: 'field' }, h('label', { class: 'field-label', for: input.id, text: label }), input,
      hint ? h('p', { class: 'muted', text: hint }) : null);
  }
  function choice(type, name, value, label, checked) {
    const id = nextId('c');
    const input = h('input', { type, name, id, value: String(value), checked: !!checked });
    return { input, el: h('div', { class: 'choice' }, input, h('label', { for: id, text: label })) };
  }
  const group = (legend, items) => h('fieldset', { class: 'stack' }, h('legend', { text: legend }), ...items.map((i) => i.el));

  /* The lock screen */
  function lockPage() {
    const S = getStore();
    const L = lockLabels(isDiscreet());
    const pin = h('input', { id: 'lock-pin', type: 'password', inputmode: 'numeric', autocomplete: 'off', 'aria-describedby': 'lock-msg', dataset: tid('lock-pin') });
    const msg = h('p', { id: 'lock-msg', class: 'field-error', role: 'alert', hidden: true });
    const unlock = h('button', { type: 'submit', class: 'btn primary', text: 'Unlock', dataset: tid('lock-unlock') });
    const panel = h('div', { class: 'stack', hidden: true });
    const form = h('form', { class: 'form stack', novalidate: true, onSubmit: async (ev) => {
      ev.preventDefault();
      const tried = pin.value;
      pin.value = '';
      if (!tried) return;
      unlock.disabled = true; pin.disabled = true;
      const r = await attemptUnlock(S, tried);
      unlock.disabled = false; pin.disabled = false;
      if (r.ok) { UI.go('#/today', { replace: true }); return; }
      msg.textContent = r.message; msg.hidden = false;
      pin.focus();
    } }, field('PIN', pin), msg, unlock);
    const sober = typeof UI.sosSoberView === 'function'
      ? btn(L.sober.label, () => {
        panel.replaceChildren(UI.sosSoberView(() => { panel.hidden = true; panel.replaceChildren(); }, 'Done', L.sober.title));
        panel.hidden = false;
        const t = panel.querySelector('h1'); if (t && t.focus) t.focus();
      }, { testid: 'lock-sober' })
      : h('a', { class: 'btn', href: L.sober.href, text: L.sober.label, dataset: tid('lock-sober') });
    const forgot = h('details', { class: 'card' }, h('summary', { text: COPY.forgot.title, style: { minHeight: '44px' } }),
      h('p', { text: COPY.forgot.line }),
      btn('Erase and start again', async () => {
        const yes = typeof UI.confirm === 'function'
          ? await UI.confirm({ title: COPY.erase.title, message: COPY.erase.message, confirmLabel: COPY.erase.confirm, danger: true }) : false;
        if (!yes) return;
        try { await forgetPin(S); } catch (e) { toast(lockError(e), 'warn'); return; }
        UI.go('#/onboarding', { replace: true });
      }, { danger: true, testid: 'lock-forgot' }));
    return h('section', { class: 'page stack lock-page', dataset: tid('lock-page') },
      h('a', { class: 'btn primary big', href: L.urgent.href, text: L.urgent.label, dataset: tid('lock-urgent') }),
      sober, panel,
      h('h1', { text: L.title }),
      h('p', { text: L.line }),
      form, forgot);
  }

  /* Onboarding */
  function onboardingPage(c) {
    const A = c && c.A;
    const C = getContent();
    const answers = {};
    let at = 0;
    let finishing = false;
    const root = h('section', { class: 'page stack onboarding-page', dataset: tid('onboarding') });
    const settings = (c && c.settings) || {};
    let noticeOpen = settings.earlyNoticeSeen !== true;

    function collectors(id) {
      // Each builder returns {body, read()} so Next keeps the answers and Skip drops them.
      if (id === 'welcome') {
        const notice = noticeOpen ? h('div', { class: 'card stack', dataset: tid('early-notice'), role: 'note' },
          h('p', { text: COPY.early }),
          btn('Got it', () => { noticeOpen = false; answers.earlyNoticeSeen = true; notice.remove(); }, { testid: 'early-notice-dismiss' })) : null;
        return { body: [notice], read() {} };
      }
      if (id === 'privacy') {
        const p1 = h('input', { type: 'password', inputmode: 'numeric', autocomplete: 'new-password', dataset: tid('onb-pin') });
        const p2 = h('input', { type: 'password', inputmode: 'numeric', autocomplete: 'new-password', dataset: tid('onb-pin2') });
        const out = h('p', { role: 'status', class: 'muted' });
        const S = getStore();
        const canPin = cryptoReady() && S && S.lock && typeof S.lock.set === 'function';
        const setBtn = btn('Set PIN', async () => {
          const a = p1.value; const b = p2.value;
          p1.value = ''; p2.value = '';
          if (a !== b) { out.textContent = COPY.pinMismatch; return; }
          try { await S.lock.set(a, { autoLockMin: 5 }); out.textContent = COPY.pinSet; setBtn.disabled = true; } catch (err) { out.textContent = lockError(err); }
        }, { testid: 'onb-pin-set' });
        const disc = choice('checkbox', 'discreet', '1', 'Discreet mode: show "' + String(C.discreetName || 'Notebook') + '" instead of the app name', settings.discreet === true);
        return {
          body: [canPin ? h('div', { class: 'stack' }, field('PIN (optional)', p1), field('Same PIN again', p2), setBtn, out)
            : h('p', { class: 'muted', text: lockError({ code: 'NO_CRYPTO' }) }), disc.el],
          read() { answers.discreet = disc.input.checked; },
        };
      }
      if (id === 'focus') {
        const subs = (C.substances || []).map((s) => choice('checkbox', 'substance', s, s));
        const other = h('input', { type: 'text', maxlength: '120', autocomplete: 'off' });
        const terms = (C.terms || []).map((t, i) => choice('radio', 'term', t.id, t.word, i === 0));
        const date = h('input', { type: 'date' });
        const unsure = choice('checkbox', 'notSure', '1', 'I am not sure yet');
        return {
          body: [group('What do you want to change?', subs), field('Anything else (optional)', other), group('Which word fits you?', terms),
            field('Start date (optional)', date), unsure.el],
          read() {
            answers.substances = subs.filter((s) => s.input.checked).map((s) => s.input.value);
            answers.substanceOther = other.value;
            const t = terms.find((x) => x.input.checked); answers.term = t ? t.input.value : undefined;
            answers.startDate = date.value; answers.notSure = unsure.input.checked;
          },
        };
      }
      if (id === 'where') {
        const stages = (C.stages || []).map((s) => choice('radio', 'stage', s.id, s.name + ': ' + s.gist));
        const slider = h('input', { type: 'range', min: '0', max: '10', step: '1', value: '5', 'aria-valuetext': '5 of 10' });
        slider.addEventListener('input', () => slider.setAttribute('aria-valuetext', slider.value + ' of 10'));
        return {
          body: [group('Which is closest?', stages), field('How much do you want to change? 0 to 10', slider)],
          read() { const s = stages.find((x) => x.input.checked); answers.stage = s ? s.input.value : undefined; answers.score = s ? Number(slider.value) : undefined; },
        };
      }
      if (id === 'safety') {
        const items = [['heavyDaily', 'I drink heavily every day'], ['sedatives', 'I take sleeping pills or benzodiazepines every day'], ['opioids', 'I use opioids']]
          .map(([k, label]) => Object.assign(choice('checkbox', 'medical', k, label), { k }));
        const card = h('div', { class: 'card', dataset: tid('onb-medical-card'), role: 'note', hidden: true });
        const sync = () => {
          const ticks = Object.fromEntries(items.map((i) => [i.k, i.input.checked]));
          card.replaceChildren(h('ul', null, medicalLines(ticks, C).map((t) => h('li', { text: t }))));
          card.hidden = !needsMedicalCard(ticks);
        };
        for (const i of items) i.input.addEventListener('change', sync);
        return { body: [h('fieldset', { class: 'stack' }, ...items.map((i) => i.el)), card],
          read() { answers.medical = Object.fromEntries(items.map((i) => [i.k, i.input.checked])); } };
      }
      if (id === 'sos') {
        const rs = [1, 2, 3].map(() => h('input', { type: 'text', maxlength: '200', autocomplete: 'off' }));
        const name = h('input', { type: 'text', maxlength: '80', autocomplete: 'off' });
        const phone = h('input', { type: 'tel', maxlength: '24', autocomplete: 'off' });
        const reg = [choice('radio', 'region', 'in', 'India', true), choice('radio', 'region', 'intl', 'Somewhere else')];
        return {
          body: [h('div', { class: 'stack' }, ...rs.map((r, i) => field('Reason ' + (i + 1), r))),
            field('A Safety Net: name (optional)', name), field('Their phone (optional)', phone, 'It stays on this device.'),
            group('Where are you, for crisis lines?', reg)],
          read() {
            answers.reasons = rs.map((r) => r.value);
            answers.contact = { name: name.value, phone: phone.value };
            answers.region = reg[1].input.checked ? 'intl' : 'in';
          },
        };
      }
      if (id === 'rhythm') {
        const m = h('input', { type: 'time', value: '08:00' });
        const e = h('input', { type: 'time', value: '21:00' });
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = h('select', null, days.map((d, i) => h('option', { value: String(i), text: d, selected: i === 0 })));
        const paces = (C.paces || []).map((p) => choice('radio', 'pace', p.id, p.name + ': ' + p.gist, p.id === 'steady'));
        return {
          body: [field('Morning check-in', m), field('Evening check-in', e), field('Weekly review day', day), group('Learning pace', paces)],
          read() {
            answers.checkin = { morning: m.value, evening: e.value };
            answers.reviewDay = Number(day.value);
            const p = paces.find((x) => x.input.checked); answers.pace = p ? p.input.value : undefined;
          },
        };
      }
      return { body: [], read() {} };
    }

    async function finish(then) {
      if (finishing) return;
      finishing = true;
      const r = await finishOnboarding(A, answers, C);
      if (!r.ok && r.errors.some((x) => x.step === 'onboard' && x.code !== 'no-actions')) toast('Not saved on this device. You can set this up later.', 'warn');
      else if (r.patch.phoneDropped) toast('The phone number was not saved. You can add it later.', 'warn');
      if (r.patch.settings.discreet === true && typeof UI.applyDiscreet === 'function') safe(() => UI.applyDiscreet(true), null);
      UI.go(then === 'drill' ? '#/sos?drill=1' : '#/today');
      if (then === 'tour' && UI.tour && typeof UI.tour.start === 'function') setTimeout(() => safe(() => UI.tour.start('tour'), null), 0);
    }

    function paint() {
      const step = STEPS[at];
      const words = COPY.steps[step.id];
      const col = collectors(step.id);
      const forward = () => { col.read(); at += 1; paint(); };
      const skip = () => { for (const k of STEP_KEYS[step.id]) if (k !== 'earlyNoticeSeen') delete answers[k]; at += 1; paint(); };
      let nav;
      if (step.id === 'safety') {
        nav = [btn(COPY.safetyOk, forward, { primary: true, testid: 'onb-safety-ok' })];
      } else if (step.id === 'tour') {
        const hasTour = !!(UI.tour && typeof UI.tour.start === 'function');
        nav = [h('div', { class: 'stack', dataset: tid('onb-tour-offer') },
          hasTour ? btn('Take the tour', () => finish('tour'), { primary: true, testid: 'onb-tour' }) : h('p', { class: 'muted', text: COPY.tourLater }),
          btn('Practise SOS once', () => finish('drill'), { testid: 'onb-drill' }),
          btn('Go to Today', () => finish('today'), { primary: !hasTour, testid: 'onb-finish' }))];
      } else {
        nav = [h('div', { class: 'row' }, btn('Next', forward, { primary: true, testid: 'onb-next' }), btn('Skip', skip, { ghost: true, testid: 'onb-skip' }))];
      }
      const node = h('div', { class: 'stack', dataset: tid('onb-step-' + step.n) },
        h('p', { class: 'muted', text: 'Step ' + step.n + ' of ' + STEPS.length }),
        h('h1', { tabindex: '-1', text: words.title }),
        h('p', { text: words.line }),
        ...col.body, ...nav);
      root.replaceChildren(node);
      const t = node.querySelector('h1'); if (t && t.focus && at > 0) safe(() => t.focus(), null);
    }

    paint();
    return root;
  }

  UI.onboardingHelpers = O;
  if (UI.pages) {
    UI.pages.lock = lockPage;
    UI.pages.onboarding = onboardingPage;
  }
})();
