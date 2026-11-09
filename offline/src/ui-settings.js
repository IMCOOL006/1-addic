/* 1-addic offline edition: Settings (lane workbook-settings, U-19; BUILD-PLAN 3.5, tracks/SCREENS/contracts/workbook-settings.md).
   Routes #/settings and #/settings/<tab>, tab in privacy, look, rhythm, names, help, about, data (unknown -> privacy).
   Every setting goes through Actions.settings.patch, every profile edit through Actions.onboard, every data action
   through Actions (never Store.replaceAll, resetAll or commit). The PIN is offered, never forced (O2), and never logged,
   exported or shown. Nothing here gates or delays SOS: the header SOS button stays on every tab, and every sheet carries
   its own way to SOS (ui-core). Text goes in as text only (UI.h), never as HTML. */
const SettingsUI = (function () {
  'use strict';

  /* Content, Engine, Store, Actions, UI and GuidanceUI are classic-script globals, not globalThis properties. */
  const ns = (name) => {
    try {
      if (name === 'Store') return typeof Store !== 'undefined' ? Store : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'Actions') return typeof Actions !== 'undefined' ? Actions : null;
      if (name === 'Content') return typeof Content !== 'undefined' ? Content : null;
      if (name === 'UI') return typeof UI !== 'undefined' ? UI : null;
      if (name === 'GuidanceUI') return typeof GuidanceUI !== 'undefined' ? GuidanceUI : null;
    } catch (e) { /* a namespace that throws on access counts as absent */ }
    return null;
  };
  const safe = (fn, fallback) => { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } };

  const TABS = [
    { id: 'privacy', label: 'Privacy' },
    { id: 'look', label: 'Look' },
    { id: 'rhythm', label: 'Rhythm' },
    { id: 'names', label: 'Names' },
    { id: 'help', label: 'Help' },
    { id: 'about', label: 'About' },
    { id: 'data', label: 'Your data' },
  ];
  const DEFAULTS = { theme: 'system', calm: false, counters: true, showCurrentRun: false, discreet: false, tips: true,
    showAll: false, textSize: 'normal', reducedMotion: false, highContrast: false, lastBackupAt: null,
    backupReminderDismissedAt: null, earlyNoticeSeen: false };
  const AUTO_LOCK = [{ value: 1, label: 'After 1 minute' }, { value: 5, label: 'After 5 minutes' },
    { value: 15, label: 'After 15 minutes' }, { value: 0, label: 'Never' }];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const ERASE_PARTIAL_TEXT = 'Most of your notebook was erased, but an older copy may still be on this device. ' +
    'Close other tabs of this file and erase again.';
  const TEXT = {
    pinHelp: 'Set a PIN before you write anything private.',
    pinOffer: 'A PIN is up to you. With one, your notes are locked on this device and only open with it.',
    pinRule: 'A PIN is 4 to 12 digits.',
    pinSame: 'The two PINs are not the same.',
    pinWrong: 'That PIN did not match',
    noCrypto: 'A PIN cannot be set in this browser.',
    forgot: 'Forgot your PIN? It cannot be recovered. You can erase this notebook on the lock screen, then start again from a backup file.',
    eraseSampleLater: 'Erasing only the sample comes with the next update. Erase everything removes it too.',
    noSample: 'Sample data is not in this version yet.',
    sampleOwnProfile: 'Sample data is for a fresh notebook. This one already holds your own profile, so the sample is not loaded. Your entries stay as they are.',
    tourLater: 'Replaying the tour comes with the tutorials update.',
    drillsLater: 'Training drills come with the tutorials update.',
    backupNote: 'The backup file is not locked by your PIN. Anyone who has the file can read it, so keep it somewhere private.',
  };
  /* About: the safety line points to SOS and says little else. */
  const ABOUT = {
    clinicalReview: true,
    credits: '1-addic turns the skills of a recovery workbook into short lessons, exercises and tools you can use on your phone. ' +
      'Every word in the app was written for it. The ideas come from the research listed below.',
    notClinical: 'This app has not been clinically tested and it is not medical advice. It does not replace a doctor, counsellor or support group.',
    danger: 'If you are in danger or might hurt yourself, open SOS and tap Urgent help.',
    offline: 'It works offline. Nothing leaves this device unless you save a backup file yourself.',
    early: 'Every screen is in the app now, and where content is still coming, the screen says so. Your notes stay on this device.',
  };

  /* ── Pure helpers (tests) ──────────────────────────────────────────────────────────────── */
  function normalTab(t) {
    const s = String(t == null ? '' : t).toLowerCase();
    return TABS.some((x) => x.id === s) ? s : 'privacy';
  }
  function pinOk(s) {
    return typeof s === 'string' && /^[0-9]{4,12}$/.test(s);
  }
  /* The text to show for a new PIN and its repeat, or '' when both are fine. */
  function pinError(a, b) {
    if (!pinOk(a)) return TEXT.pinRule;
    if (b !== undefined && a !== b) return TEXT.pinSame;
    return '';
  }
  const pad = (n) => String(n).padStart(2, '0');
  function localDate(d) {
    const x = d instanceof Date ? d : new Date(d == null ? Date.now() : d);
    if (Number.isNaN(x.getTime())) return null;
    return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate());
  }
  function backupName(date) {
    return '1-addic-' + (localDate(date) || localDate(new Date())) + '.json';
  }
  const KIND = { craving: 'Craving', feeling: 'Feeling', checkin: 'Check-in', activity: 'Activity', slip: 'Slip', sos: 'SOS' };
  function detailOf(l) {
    const out = [];
    if (typeof l.intensity === 'number') out.push('strength ' + l.intensity + '/10');
    if (l.checkin && typeof l.checkin === 'object') {
      if (l.checkin.kind) out.push(String(l.checkin.kind));
      if (typeof l.checkin.mood === 'number') out.push('mood ' + l.checkin.mood);
    }
    if (l.activity && typeof l.activity === 'object') {
      if (l.activity.name) out.push(String(l.activity.name));
      if (typeof l.activity.minutes === 'number') out.push(l.activity.minutes + ' min');
    }
    if (Array.isArray(l.feelings) && l.feelings.length) out.push(l.feelings.join(', '));
    if (Array.isArray(l.skills) && l.skills.length) out.push('tools: ' + l.skills.join(', '));
    return out.join(' · ');
  }
  /* Logs as print rows, newest first: {at, date, time, kind, detail}. Drill rows are practice, not logs. */
  function logRows(logs) {
    const rows = (Array.isArray(logs) ? logs : []).filter((l) => l && typeof l === 'object' && !l.drill && typeof l.at === 'string');
    rows.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
    return rows.map((l) => {
      const d = new Date(l.at);
      const ok = !Number.isNaN(d.getTime());
      const type = String(l.type || 'log');
      return {
        at: l.at, date: l.date || (ok ? localDate(d) : ''), time: ok ? pad(d.getHours()) + ':' + pad(d.getMinutes()) : '',
        kind: KIND[type] || type.charAt(0).toUpperCase() + type.slice(1), detail: detailOf(l),
      };
    });
  }
  function storeText(st) {
    const p = st && st.persistence;
    if (p === 'indexeddb') return 'Saved on this device.';
    if (p === 'localstorage') return 'Saved in this browser\'s backup storage. Save a backup file now and then.';
    return 'This browser is not keeping your notebook. Save a backup file before you close the page.';
  }
  function errorText(e) {
    const code = e && e.code;
    if (code === 'BAD_PIN') return TEXT.pinRule;
    if (code === 'NO_CRYPTO') return TEXT.noCrypto;
    if (code === 'LOCKED') return 'The notebook is locked. Unlock it first.';
    if (code === 'STALE') return 'This notebook changed in another tab. Close other tabs of this file and try again.';
    if (code === 'ERASE_PARTIAL') return ERASE_PARTIAL_TEXT;
    if (code === 'no-sample') return TEXT.noSample;
    if (code === 'no-store') return 'The notebook is not open yet. Please try again in a moment.';
    if (code === 'bad-profile' || code === 'bad-setting') return 'That could not be saved. Please check it and try again.';
    return 'That did not work. Please try again.';
  }
  function importErrorText(e) {
    const list = e && Array.isArray(e.errors) ? e.errors.slice(0, 3).map(String) : [];
    return 'This file is not a backup this app can read.' + (list.length ? ' ' + list.join('; ') + '.' : '');
  }
  const countOf = (counts, k) => (counts && typeof counts[k] === 'number' ? counts[k] : 0);
  function importedText(counts) {
    return 'Backup restored: ' + countOf(counts, 'logs') + ' logs, ' + countOf(counts, 'responses') + ' answers and ' +
      countOf(counts, 'contacts') + ' contacts.';
  }

  /* ── Small DOM helpers (UI.h only) ─────────────────────────────────────────────────────── */
  const h = (...a) => ns('UI').h(...a);
  let uid = 0;
  const nextId = (p) => 'ws-' + p + '-' + (++uid);
  const toast = (msg, tone) => { const U = ns('UI'); if (U && typeof U.toast === 'function') safe(() => U.toast(msg, tone), null); };
  /* A message that stays on its tab across store re-renders until another tab opens. */
  let flash = null;
  const say = (tab, text, tone) => { flash = { tab, text, tone: tone || 'info' }; };
  const rerender = () => { const U = ns('UI'); if (U && typeof U.render === 'function') safe(() => U.render('settings'), null); };

  function applyContrast(on) {
    safe(() => {
      const root = typeof document !== 'undefined' ? document.documentElement : null;
      if (!root || typeof root.setAttribute !== 'function') return;
      if (on) root.setAttribute('data-contrast', 'high'); else root.removeAttribute('data-contrast');
    }, null);
  }

  async function patch(p, okText) {
    const A = ns('Actions');
    if (!A || !A.settings || typeof A.settings.patch !== 'function') { toast(errorText({ code: 'no-store' }), 'warn'); return false; }
    try { await A.settings.patch(p); } catch (e) { toast(errorText(e), 'warn'); return false; }
    const U = ns('UI');
    if (Object.prototype.hasOwnProperty.call(p, 'theme') && U && typeof U.applyTheme === 'function') safe(() => U.applyTheme(p.theme), null);
    if (Object.prototype.hasOwnProperty.call(p, 'discreet') && U && typeof U.applyDiscreet === 'function') safe(() => U.applyDiscreet(p.discreet), null);
    if (Object.prototype.hasOwnProperty.call(p, 'highContrast')) applyContrast(p.highContrast);
    if (okText) toast(okText, 'ok');
    return true;
  }

  function hintEl(id, text) { return text ? h('p', { id, class: 'field-hint', text }) : null; }

  function toggle(st, key, label, hint, test) {
    const id = nextId(key);
    const box = h('input', {
      type: 'checkbox', id, checked: !!st[key], 'data-test': test || null, 'aria-describedby': hint ? id + '-hint' : null,
      onChange: () => { patch({ [key]: !!box.checked }); },
    });
    return h('div', { class: 'field ws-setting' }, h('div', { class: 'choice' }, box, h('label', { for: id, text: label })), hintEl(id + '-hint', hint));
  }

  function radios(st, key, legend, options, testPrefix, after) {
    const name = nextId(key);
    return h('fieldset', { class: 'choices ws-setting' }, h('legend', { class: 'field-label', text: legend }),
      options.map((o, i) => {
        const id = name + '-' + i;
        const r = h('input', {
          type: 'radio', id, name, value: o.value, checked: st[key] === o.value, 'data-test': testPrefix ? testPrefix + o.value : null,
          onChange: () => { if (r.checked) patch({ [key]: o.value }).then((ok) => { if (ok && after) after(o.value); }); },
        });
        return h('div', { class: 'choice' }, r, h('label', { for: id, text: o.label }));
      }));
  }

  function pinField(test, label) {
    const id = nextId(test);
    const input = h('input', {
      type: 'password', id, name: test, inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'one-time-code',
      minlength: '4', maxlength: '12', required: true, 'data-test': test, 'aria-describedby': id + '-hint',
    });
    return { input, el: h('div', { class: 'field' }, h('label', { class: 'field-label', for: id, text: label }), input,
      h('p', { id: id + '-hint', class: 'field-hint', text: '4 to 12 digits' })) };
  }

  function select(options, value, attrs) {
    const el = h('select', attrs, options.map((o) => h('option', { value: String(o.value), text: o.label })));
    el.value = String(value);
    return el;
  }

  /* A sheet with PIN fields. check(values) resolves to an error text, or '' when the sheet may close. Resolves true
     once check passes, false when the sheet is closed. The PIN never leaves the sheet's own variables. */
  function pinSheet(o) {
    const U = ns('UI');
    return new Promise((resolve) => {
      const fields = o.fields.map((f) => Object.assign({ key: f.key }, pinField(f.test, f.label)));
      const extra = o.extra || null;
      const err = h('p', { class: 'field-error', role: 'alert', hidden: true });
      let busy = false; let done = false; let s = null;
      const submit = async (ev) => {
        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
        if (busy) return;
        const values = {};
        fields.forEach((f) => { values[f.key] = String(f.input.value || ''); });
        if (extra && extra.read) Object.assign(values, extra.read());
        busy = true;
        let msg = '';
        try { msg = await o.check(values); } catch (e) { msg = errorText(e); }
        busy = false;
        if (msg) { err.textContent = msg; err.hidden = false; return; }
        done = true;
        fields.forEach((f) => { f.input.value = ''; });
        if (s) s.close('confirmed');
      };
      const save = h('button', { type: 'submit', class: 'btn primary', 'data-test': 'pin-save', text: o.submitLabel || 'Save' });
      const cancel = h('button', { type: 'button', class: 'btn ghost', text: 'Cancel', onClick: () => { if (s) s.close('cancelled'); } });
      const body = h('form', { class: 'stack ws-pin-form', onSubmit: submit, novalidate: true },
        o.intro ? h('p', { text: o.intro }) : null, fields.map((f) => f.el), extra ? extra.el : null, err,
        h('div', { class: 'row' }, cancel, save));
      s = U && typeof U.sheet === 'function' ? U.sheet(o.title, body, { onClose: () => resolve(done) }) : null;
      if (!s || !s.el) resolve(false);
    });
  }

  /* ── Privacy ───────────────────────────────────────────────────────────────────────────── */
  const hasCrypto = () => safe(() => typeof crypto !== 'undefined' && !!crypto && !!crypto.subtle, false);

  function setPin(st) {
    const S = ns('Store');
    let min = 5;
    const minSel = select(AUTO_LOCK, min, { id: nextId('auto'), 'aria-label': 'Lock the notebook when I am away' });
    const extra = { el: h('div', { class: 'field' }, h('label', { class: 'field-label', for: minSel.id, text: 'Lock the notebook when I am away' }), minSel),
      read: () => { min = Number(minSel.value); return {}; } };
    const fields = st.hasLock
      ? [{ key: 'cur', test: 'pin-current', label: 'Your PIN now' }, { key: 'a', test: 'pin-input', label: 'New PIN' }, { key: 'b', test: 'pin-input2', label: 'New PIN again' }]
      : [{ key: 'a', test: 'pin-input', label: 'New PIN' }, { key: 'b', test: 'pin-input2', label: 'New PIN again' }];
    if (st.hasLock) min = st.autoLockMin == null ? 5 : st.autoLockMin;
    minSel.value = String(min);
    return pinSheet({
      title: st.hasLock ? 'Change your PIN' : 'Set a PIN', intro: st.hasLock ? null : TEXT.pinOffer, fields, extra,
      submitLabel: st.hasLock ? 'Change PIN' : 'Set PIN',
      check: async (v) => {
        const bad = pinError(v.a, v.b);
        if (bad) return bad;
        if (st.hasLock && !(await S.lock.verify(v.cur))) return TEXT.pinWrong;
        await S.lock.set(v.a, { autoLockMin: min });
        return '';
      },
    }).then((ok) => { if (ok) { toast(st.hasLock ? 'Your PIN is changed.' : 'Your PIN is set. Your notes are locked on this device.', 'ok'); rerender(); } });
  }

  function removePin() {
    const S = ns('Store');
    return pinSheet({
      title: 'Remove the PIN', intro: 'Your notes stay. The notebook will open without a PIN.', submitLabel: 'Remove PIN',
      fields: [{ key: 'a', test: 'pin-input', label: 'Your PIN' }],
      check: async (v) => ((await S.lock.remove(v.a)) ? '' : TEXT.pinWrong),
    }).then((ok) => { if (ok) { toast('The PIN is removed.', 'ok'); rerender(); } });
  }

  function changeAutoLock(st, sel) {
    const S = ns('Store');
    const want = Number(sel.value);
    const before = st.autoLockMin == null ? 5 : st.autoLockMin;
    return pinSheet({
      title: 'Change the auto-lock', intro: 'Enter your PIN to change when the notebook locks.', submitLabel: 'Change',
      fields: [{ key: 'a', test: 'pin-input', label: 'Your PIN' }],
      check: async (v) => {
        if (!(await S.lock.verify(v.a))) return TEXT.pinWrong;
        await S.lock.set(v.a, { autoLockMin: want });
        return '';
      },
    }).then((ok) => {
      if (ok) toast(want ? 'The notebook now locks after ' + want + (want === 1 ? ' minute' : ' minutes') + ' away.' : 'The notebook no longer locks by itself.', 'ok');
      else sel.value = String(before);
      rerender();
    });
  }

  function privacyTab(c, st) {
    const S = ns('Store');
    const status = safe(() => S.status(), null) || {};
    const rows = [h('p', { class: 'muted', 'data-test': 'store-status', text: storeText(status) })];
    if (!status.hasLock) {
      rows.push(h('p', { class: 'ws-lead', text: TEXT.pinHelp }), h('p', { class: 'muted', text: TEXT.pinOffer }));
      if (hasCrypto()) rows.push(h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', 'data-test': 'set-pin', text: 'Set a PIN', onClick: () => setPin(status) })));
      else rows.push(h('p', { 'data-test': 'no-crypto', text: TEXT.noCrypto + ' Everything else keeps working.' }));
    } else {
      const selId = nextId('auto-lock');
      const sel = select(AUTO_LOCK, status.autoLockMin == null ? 5 : status.autoLockMin, { id: selId, 'data-test': 'auto-lock' });
      sel.addEventListener('change', () => changeAutoLock(status, sel));
      rows.push(
        h('p', { text: 'Your notebook has a PIN. It locks on this device and opens only with it.' }),
        h('div', { class: 'field' }, h('label', { class: 'field-label', for: selId, text: 'Lock the notebook when I am away' }), sel,
          h('p', { class: 'field-hint', text: 'Changing this asks for your PIN.' })),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn primary', 'data-test': 'lock-now', text: 'Lock now', onClick: () => { safe(() => S.lock.lockNow(), null); } }),
          h('button', { type: 'button', class: 'btn', 'data-test': 'set-pin', text: 'Change PIN', onClick: () => setPin(status) }),
          h('button', { type: 'button', class: 'btn', 'data-test': 'remove-pin', text: 'Remove PIN', onClick: () => removePin() })),
        h('p', { class: 'muted', text: TEXT.forgot }));
    }
    const C = ns('Content');
    const dn = safe(() => C.discreetName, null) || 'Notebook';
    return [
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'PIN' }), rows),
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'Discreet mode' }),
        toggle(st, 'discreet', 'Discreet mode', 'The app shows "' + dn + '" as its name, the SOS button says "Help", and day counters are hidden.', 'discreet-toggle')),
    ];
  }

  /* ── Look ──────────────────────────────────────────────────────────────────────────────── */
  function lookTab(c, st) {
    return [
      h('section', { class: 'card ws-card' },
        radios(st, 'theme', 'Theme', [{ value: 'system', label: 'Same as my device' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }], 'theme-'),
        radios(st, 'textSize', 'Text size', [{ value: 'normal', label: 'Normal' }, { value: 'large', label: 'Large' }, { value: 'larger', label: 'Larger' }], 'text-size-')),
      h('section', { class: 'card ws-card' },
        toggle(st, 'calm', 'Calm mode', 'Fewer colours, no celebrations, and a quieter Today screen.', 'calm-toggle'),
        toggle(st, 'highContrast', 'High contrast', 'Stronger text and borders.', 'contrast-toggle'),
        toggle(st, 'reducedMotion', 'Reduce motion', 'No moving effects. Your device setting is followed too.', 'motion-toggle')),
      h('section', { class: 'card ws-card' },
        toggle(st, 'counters', 'Show day counters', 'Your total days are counted either way. This only shows or hides them.', 'counters-toggle'),
        toggle(st, 'showCurrentRun', 'Show my current run', 'Off unless you want it. Your total days never go down.', 'run-toggle')),
    ];
  }

  /* ── Rhythm and names (profile edits through Actions.onboard) ─────────────────────────── */
  function textField(label, value, attrs, hint) {
    const id = nextId('f');
    const input = h('input', Object.assign({ id, value: value == null ? '' : String(value), 'aria-describedby': hint ? id + '-hint' : null }, attrs));
    return { input, el: h('div', { class: 'field' }, h('label', { class: 'field-label', for: id, text: label }), input, hintEl(id + '-hint', hint)) };
  }
  function selectField(label, options, value, attrs, hint) {
    const id = nextId('s');
    const input = select(options, value, Object.assign({ id, 'aria-describedby': hint ? id + '-hint' : null }, attrs));
    return { input, el: h('div', { class: 'field' }, h('label', { class: 'field-label', for: id, text: label }), input, hintEl(id + '-hint', hint)) };
  }
  async function saveProfile(tab, p, err) {
    const A = ns('Actions');
    err.hidden = true;
    try {
      if (!A || typeof A.onboard !== 'function') throw Object.assign(new Error('no store'), { code: 'no-store' });
      await A.onboard(p);
      toast('Saved.', 'ok');
    } catch (e) { err.textContent = errorText(e); err.hidden = false; }
  }
  function rhythmTab(c) {
    const p = c.profile || {};
    const C = ns('Content');
    const ck = p.checkin || {};
    const paces = (safe(() => C.paces, null) || []).map((x) => ({ value: x.id, label: x.name + ': ' + x.gist }));
    const morning = textField('Morning check-in', ck.morning || '', { type: 'time', 'data-test': 'checkin-morning' }, 'Leave empty for no morning check-in.');
    const evening = textField('Evening check-in', ck.evening || '', { type: 'time', 'data-test': 'checkin-evening-time' }, 'Leave empty for no evening check-in.');
    const review = selectField('Weekly review day', DAYS.map((d, i) => ({ value: i, label: d })), p.reviewDay == null ? 0 : p.reviewDay, { 'data-test': 'review-day' });
    const pace = selectField('Pace', paces, p.pace || 'steady', { 'data-test': 'pace' });
    const custom = textField('Steps a week (Custom pace)', p.customPerWeek == null ? '' : p.customPerWeek,
      { type: 'number', min: '1', max: '7', step: '1', inputmode: 'numeric', 'data-test': 'custom-per-week' }, 'Only used with the Custom pace: 1 to 7.');
    const err = h('p', { class: 'field-error', role: 'alert', hidden: true });
    const onSubmit = (ev) => {
      if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
      const isCustom = pace.input.value === 'custom';
      const n = Number(custom.input.value);
      if (isCustom && !(Number.isInteger(n) && n >= 1 && n <= 7)) { err.textContent = 'For the Custom pace, choose 1 to 7 steps a week.'; err.hidden = false; return; }
      saveProfile('rhythm', { checkin: { morning: morning.input.value || null, evening: evening.input.value || null },
        reviewDay: Number(review.input.value), pace: pace.input.value, customPerWeek: isCustom ? n : null }, err);
    };
    return [h('form', { class: 'card ws-card stack', onSubmit, novalidate: true },
      h('p', { class: 'muted', text: 'When the app checks in with you and how fast the roadmap moves. You can change it any time.' }),
      morning.el, evening.el, review.el, pace.el, custom.el, err,
      h('div', { class: 'row' }, h('button', { type: 'submit', class: 'btn primary', 'data-test': 'rhythm-save', text: 'Save' })))];
  }
  function namesTab(c) {
    const p = c.profile || {};
    const C = ns('Content');
    const terms = (safe(() => C.terms, null) || []).map((t) => ({ value: t.id, label: 'Days ' + t.word + ' (' + t.days + ')' }));
    const name = textField('Your name', p.name || '', { type: 'text', maxlength: '80', autocomplete: 'off', 'data-test': 'name-input' }, 'Optional. Only shown to you.');
    const companion = textField('Your guide\'s name', p.companion || '', { type: 'text', maxlength: '40', autocomplete: 'off', 'data-test': 'companion-input' }, 'The name of the guide who talks to you in the app.');
    const term = selectField('The words for your days', terms, p.term || (terms[0] && terms[0].value) || '', { 'data-test': 'term-select' });
    const err = h('p', { class: 'field-error', role: 'alert', hidden: true });
    const onSubmit = (ev) => {
      if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
      saveProfile('names', { name: String(name.input.value || '').trim().slice(0, 80), companion: String(companion.input.value || '').trim().slice(0, 40), term: term.input.value }, err);
    };
    return [h('form', { class: 'card ws-card stack', onSubmit, novalidate: true }, name.el, companion.el, term.el, err,
      h('div', { class: 'row' }, h('button', { type: 'submit', class: 'btn primary', 'data-test': 'names-save', text: 'Save' })))];
  }

  /* ── Help ──────────────────────────────────────────────────────────────────────────────── */
  function helpTab(c, st) {
    const C = ns('Content');
    const G = ns('GuidanceUI');
    const tour = G && typeof G.coach === 'function'
      ? h('button', { type: 'button', class: 'btn', 'data-test': 'tour-replay', text: 'Replay the tour', onClick: () => { safe(() => G.coach('tour', { replay: true }), null); } })
      : h('p', { class: 'muted', 'data-test': 'tour-later', text: TEXT.tourLater });
    const drills = G && typeof G.training === 'function' ? safe(() => G.training(), []) || [] : null;
    const drillList = drills
      ? (drills.length ? h('ul', { class: 'ws-links' }, drills.filter((d) => d && d.route).map((d) => h('li', {}, h('a', { class: 'btn ghost', href: d.route, text: d.name || d.id }))))
        : h('p', { class: 'muted', text: 'No training drills yet.' }))
      : h('p', { class: 'muted', 'data-test': 'drills-later', text: TEXT.drillsLater });
    const help = safe(() => C.help, null) || [];
    return [
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'Tour and training' }), tour, drillList),
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'How do I...?' }),
        help.length ? help.map((x) => h('details', { class: 'ws-help' }, h('summary', { text: x.q }), h('p', { text: x.a }),
          x.route ? h('a', { class: 'btn ghost', href: x.route, text: 'Take me there' }) : null))
          : h('p', { class: 'muted', text: 'Help answers are not in this version yet.' })),
      h('section', { class: 'card ws-card' },
        toggle(st, 'tips', 'Show tips', 'Short tips on Today. SOS never shows tips.', 'tips-toggle'),
        toggle(st, 'showAll', 'Show all features now', 'Everything opens at once instead of step by step.', 'show-all-toggle')),
    ];
  }

  /* ── About ─────────────────────────────────────────────────────────────────────────────── */
  function aboutTab(c, st) {
    const C = ns('Content');
    const refs = safe(() => C.references, null) || [];
    const version = safe(() => C.version, null);
    const build = safe(() => C.build, null);
    const notice = h('section', { class: 'card ws-card ws-notice', 'data-test': 'early-notice' },
      h('h3', { class: 'card-title', text: 'Early access' }), h('p', { text: ABOUT.early }),
      st.earlyNoticeSeen ? null : h('button', { type: 'button', class: 'btn', 'data-test': 'early-notice-ok', text: 'Got it', onClick: () => patch({ earlyNoticeSeen: true }) }));
    return [
      notice,
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'About 1-addic' }),
        h('p', { text: ABOUT.credits }), h('p', { text: ABOUT.notClinical }), h('p', { text: ABOUT.danger }),
        h('a', { class: 'btn', href: '#/sos/urgent', text: 'Urgent help' }), h('p', { class: 'muted', text: ABOUT.offline }),
        h('p', { class: 'muted', 'data-test': 'version', text: 'Version ' + (version || 'unknown') + (build ? ' · built ' + build : '') })),
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'Evidence' }),
        refs.length ? h('ol', { class: 'ws-refs' }, refs.map((r) => h('li', { id: r.id ? 'ref-' + r.id : null }, h('p', { text: r.claim }), h('p', { class: 'muted', text: r.cite }))))
          : h('p', { class: 'muted', text: 'The reference list is not in this version yet.' })),
    ];
  }

  /* ── Your data ─────────────────────────────────────────────────────────────────────────── */
  function askPin(title, intro) {
    const S = ns('Store');
    return pinSheet({ title, intro, submitLabel: 'Continue', fields: [{ key: 'a', test: 'pin-input', label: 'Your PIN' }],
      check: async (v) => ((await S.lock.verify(v.a)) ? '' : TEXT.pinWrong) });
  }

  async function doExport() {
    const S = ns('Store'); const E = ns('Engine'); const U = ns('UI');
    if (!S || !E || typeof E.exportBackup !== 'function') { toast(errorText({ code: 'no-store' }), 'warn'); return false; }
    const status = safe(() => S.status(), {}) || {};
    if (status.hasLock && !(await askPin('Save a backup', 'Enter your PIN to save a backup file.'))) return false;
    const now = new Date();
    const name = backupName(now);
    let obj;
    try { obj = E.exportBackup(S.view, { exportedAt: now.toISOString() }); } catch (e) { toast(errorText(e), 'warn'); return false; }
    const ok = U && typeof U.download === 'function' ? U.download(name, JSON.stringify(obj, null, 2), 'application/json') : false;
    if (ok === false) { say('data', 'This browser could not save the file.', 'warn'); rerender(); return false; }
    await patch({ lastBackupAt: now.toISOString() });
    say('data', 'Backup saved as ' + name + '. ' + TEXT.backupNote, 'ok');
    rerender();
    return true;
  }

  function readFile(file) {
    if (file && typeof file.text === 'function') return file.text();
    return new Promise((resolve, reject) => {
      try {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ''));
        r.onerror = () => reject(r.error || new Error('read'));
        r.readAsText(file);
      } catch (e) { reject(e); }
    });
  }

  async function doImport(input) {
    const U = ns('UI'); const A = ns('Actions');
    const file = input && input.files && input.files[0];
    if (!file) return false;
    let obj;
    try { obj = JSON.parse(await readFile(file)); } catch (e) {
      input.value = '';
      say('data', 'This file could not be read. Choose a 1-addic backup file (it ends in .json).', 'warn'); rerender(); return false;
    }
    input.value = '';
    const yes = await U.confirm({ title: 'Bring back this backup?', message: 'This replaces everything on this device. Your PIN stays.',
      confirmLabel: 'Replace with the backup', danger: true });
    if (!yes) return false;
    try {
      if (!A || typeof A.importBackup !== 'function') throw Object.assign(new Error('no store'), { code: 'no-store' });
      const r = await A.importBackup(obj);
      flash = null;
      toast(importedText(r && r.counts), 'ok');
      if (typeof U.go === 'function') U.go('#/today');
      return true;
    } catch (e) {
      say('data', e && e.code === 'bad-backup' ? importErrorText(e) : errorText(e), 'warn'); rerender(); return false;
    }
  }

  async function doErase() {
    const U = ns('UI'); const A = ns('Actions');
    const yes = await U.confirm({ title: 'Erase everything?',
      message: 'This erases every log, answer, contact and setting on this device, and the PIN. It cannot be undone. Save a backup first if you may want it back.',
      confirmLabel: 'Erase everything', danger: true });
    if (!yes) return false;
    try {
      if (!A || typeof A.eraseAll !== 'function') throw Object.assign(new Error('no store'), { code: 'no-store' });
      await A.eraseAll();
      safe(() => U.applyDiscreet(false), null);
      safe(() => U.applyTheme('system'), null);
      applyContrast(false);
      say('data', 'Your notebook is erased. You can start again, or bring back a backup file below.', 'ok');
    } catch (e) {
      say('data', e && e.code === 'ERASE_PARTIAL' ? ERASE_PARTIAL_TEXT : errorText(e), 'warn');
    }
    rerender();
    return true;
  }

  function printLogs(view) {
    const U = ns('UI');
    const rows = logRows(safe(() => view.list('logs'), []));
    const node = h('div', { class: 'ws-print' }, h('h1', { text: 'My logs' }), h('p', { text: 'Printed ' + localDate(new Date()) + ' · ' + rows.length + ' entries' }),
      rows.length
        ? h('table', { class: 'ws-print-table' },
          h('thead', {}, h('tr', {}, ['Date', 'Time', 'What', 'Details'].map((t) => h('th', { scope: 'col', text: t })))),
          h('tbody', {}, rows.map((r) => h('tr', {}, h('td', { text: r.date }), h('td', { text: r.time }), h('td', { text: r.kind }), h('td', { text: r.detail })))))
        : h('p', { text: 'No logs yet.' }));
    if (U && typeof U.printDoc === 'function') safe(() => U.printDoc(node), null);
    return node;
  }

  /* FIX-SAMPLE (R-H-28): the sample writes its own profile 'me' and settings 'app', so it is offered only on a notebook
     without the person's own profile: a profile row 'me' that exists and is not marked sample: true. */
  function hasOwnProfile(view) {
    const p = safe(() => view.get('profile', 'me'), null);
    return !!(p && typeof p === 'object' && p.sample !== true);
  }

  async function doLoadSample() {
    const A = ns('Actions'); const S = ns('Store');
    // Checked again at the tap: a page drawn before onboarding cannot load the sample over an own profile.
    if (hasOwnProfile(safe(() => S.view, null))) { say('data', TEXT.sampleOwnProfile, 'info'); rerender(); return false; }
    try {
      const r = await A.loadSample();
      say('data', 'Sample data loaded: ' + ((r && r.count) || 0) + ' items, all marked as sample. Erase it any time.', 'ok');
    } catch (e) { say('data', errorText(e), 'warn'); }
    rerender();
    return true;
  }

  async function doEraseSample() {
    const U = ns('UI'); const A = ns('Actions');
    const yes = await U.confirm({ title: 'Erase the sample data?', message: 'This removes only the items marked as sample. Your own entries stay.',
      confirmLabel: 'Erase the sample', danger: true });
    if (!yes) return false;
    try {
      const r = await A.eraseSample();
      say('data', 'Sample data erased' + (r && typeof r.erased === 'number' ? ' (' + r.erased + ' items)' : '') + '. Your own entries stay.', 'ok');
    } catch (e) { say('data', errorText(e), 'warn'); }
    rerender();
    return true;
  }

  function dataTab(c, st) {
    const view = c.view;
    const A = ns('Actions'); const C = ns('Content');
    const fileId = nextId('import');
    const file = h('input', { type: 'file', id: fileId, accept: '.json,application/json', 'data-test': 'import-file', 'data-testid': 'settings-import', class: 'ws-file' });
    file.addEventListener('change', () => { doImport(file); });
    const last = st.lastBackupAt ? safe(() => localDate(st.lastBackupAt), null) : null;
    const remindId = nextId('remind');
    const remind = h('input', { type: 'checkbox', id: remindId, checked: !st.backupReminderDismissedAt, 'data-test': 'backup-reminder',
      onChange: () => { patch({ backupReminderDismissedAt: remind.checked ? null : new Date().toISOString() }); } });
    const sampleRow = safe(() => view.get('meta', 'sample'), null);
    const canLoad = !!(C && C.sample && typeof C.sample.generate === 'function') && !!(A && typeof A.loadSample === 'function');
    const canErase = !!(A && typeof A.eraseSample === 'function');
    const ownProfile = hasOwnProfile(view);
    const ownNoteId = nextId('sample-note');
    const eraseLine = !canErase ? TEXT.eraseSampleLater : (!sampleRow ? 'No sample data is loaded.' : null);
    return [
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'Backup' }),
        h('p', { 'data-test': 'last-backup', text: 'Last backup: ' + (last || 'never') }),
        h('p', { class: 'muted', text: TEXT.backupNote }),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', 'data-test': 'export-btn', 'data-testid': 'settings-export', text: 'Save a backup file', onClick: () => { doExport(); } })),
        h('div', { class: 'field' }, h('div', { class: 'choice' }, remind, h('label', { for: remindId, text: 'Remind me to save a backup' })))),
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'Bring back a backup' }),
        h('div', { class: 'field' }, h('label', { class: 'field-label', for: fileId, text: 'Choose a backup file' }), file,
          h('p', { class: 'field-hint', text: 'This replaces everything on this device. You are asked first.' }))),
      h('section', { class: 'card ws-card' }, h('h3', { class: 'card-title', text: 'Print' }),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', 'data-test': 'print-logs', text: 'Print my logs', onClick: () => { printLogs(view); } }))),
      h('section', { class: 'card ws-card', 'data-test': 'sample-card' }, h('h3', { class: 'card-title', text: 'Sample data' }),
        sampleRow ? h('p', { class: 'ws-sample-on', 'data-test': 'sample-loaded', text: 'Sample data is loaded. It is marked as sample and you can erase it.' })
          : h('p', { class: 'muted', text: 'Try the app with made-up entries. They are marked as sample.' }),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn', 'data-test': 'load-sample', text: 'Load sample data', disabled: !canLoad || ownProfile,
            'aria-describedby': ownProfile ? ownNoteId : null, onClick: () => { if (canLoad && !ownProfile) doLoadSample(); } }),
          h('button', { type: 'button', class: 'btn', 'data-test': 'erase-sample', text: 'Erase sample data', disabled: !(canErase && sampleRow), onClick: () => { if (canErase && sampleRow) doEraseSample(); } })),
        ownProfile ? h('p', { class: 'muted', id: ownNoteId, 'data-test': 'load-sample-note', text: TEXT.sampleOwnProfile }) : null,
        canLoad ? null : h('p', { class: 'muted', text: TEXT.noSample }),
        eraseLine ? h('p', { class: 'muted', 'data-test': 'erase-sample-note', text: eraseLine }) : null),
      h('section', { class: 'card ws-card ws-danger' }, h('h3', { class: 'card-title', text: 'Erase everything' }),
        h('p', { text: 'Removes every entry, setting and the PIN from this device. You are asked first.' }),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn danger', 'data-test': 'erase-all', 'data-testid': 'settings-erase', text: 'Erase everything', onClick: () => { doErase(); } })),
        flash && flash.tab === 'data' && /erased\. You can start again/.test(flash.text) ? h('a', { class: 'btn primary', href: '#/onboarding', text: 'Start again' }) : null),
    ];
  }

  const VIEWS = { privacy: privacyTab, look: lookTab, rhythm: rhythmTab, names: namesTab, help: helpTab, about: aboutTab, data: dataTab };

  function page(ctx) {
    const c = ctx || {};
    const r = c.route || { parts: [], query: {} };
    const tab = normalTab(r.parts && r.parts[1]);
    if (flash && flash.tab !== tab) flash = null;
    const st = Object.assign({}, DEFAULTS, c.settings || {});
    applyContrast(!!st.highContrast);
    const label = TABS.find((t) => t.id === tab).label;
    const body = safe(() => VIEWS[tab](c, st), null) || [h('p', { text: 'This part of Settings could not open. SOS still works.' })];
    return h('div', { class: 'ws-settings', 'data-test': 'settings-page' },
      h('h1', { text: 'Settings' }),
      h('nav', { class: 'ws-tabs', 'aria-label': 'Settings sections' },
        TABS.map((t) => h('a', { href: '#/settings/' + t.id, class: t.id === tab ? 'ws-tab active' : 'ws-tab',
          'aria-current': t.id === tab ? 'page' : null, 'data-test': 'settings-tab-' + t.id, text: t.label }))),
      flash ? h('p', { class: 'ws-flash ws-flash-' + flash.tone, role: flash.tone === 'warn' ? 'alert' : 'status', 'data-test': 'settings-message', text: flash.text }) : null,
      h('section', { class: 'stack ws-body', 'aria-labelledby': 'ws-tab-title' }, h('h2', { id: 'ws-tab-title', text: label }), body));
  }

  const PURE = ['TABS', 'TEXT', 'ABOUT', 'ERASE_PARTIAL_TEXT', 'normalTab', 'pinOk', 'pinError', 'backupName', 'logRows', 'errorText', 'importErrorText', 'importedText', 'hasOwnProfile'];

  return {
    TABS, TEXT, ABOUT, ERASE_PARTIAL_TEXT, normalTab, pinOk, pinError, backupName, logRows, errorText, importErrorText, importedText, hasOwnProfile,
    page, doExport, doImport, doErase, doLoadSample, doEraseSample, printLogs, PURE,
  };
})();

// The page registers from this file (contracts/core.md: UI.pages[firstSegment]); nothing in ui-core.js changes.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.settings = (ctx) => SettingsUI.page(ctx);

/* High contrast on every screen, not only in Settings (slice check C3). ui-core applies text size and motion from the
   settings row but not contrast yet (asked of core), so this file sets html[data-contrast=high] once the Store has
   loaded and again after every store change, without touching ui-core.js. Locked or not loaded: the sealed row decides
   nothing, so the attribute is left as it is. */
const applySavedContrast = (function () {
  const apply = () => {
    try {
      if (typeof Store === 'undefined' || !Store || !Store.view || typeof Store.view.get !== 'function') return;
      if (typeof document === 'undefined' || !document || !document.documentElement) return;
      const st = Store.view.get('settings', 'app');
      if (!st || typeof st !== 'object') return;
      const root = document.documentElement;
      if (st.highContrast) root.setAttribute('data-contrast', 'high'); else root.removeAttribute('data-contrast');
    } catch (e) { /* never in the way of a page */ }
  };
  if (typeof Store === 'undefined' || !Store) return apply;
  try { if (typeof Store.subscribe === 'function') Store.subscribe(apply); } catch (e) { /* no subscription here */ }
  const afterLoad = () => {
    try {
      // Store.load() is memoised: after ui-core's boot it hands back the same promise and starts nothing new.
      if (typeof Store.load === 'function') Promise.resolve().then(() => Store.load()).then(apply, () => {});
      else apply();
    } catch (e) { /* never in the way of a page */ }
  };
  try {
    const waiting = typeof window !== 'undefined' && window && typeof window.addEventListener === 'function' &&
      typeof document !== 'undefined' && document && document.readyState && document.readyState !== 'complete';
    if (waiting) window.addEventListener('load', afterLoad, { once: true }); else afterLoad();
  } catch (e) { /* never in the way of a page */ }
  return apply;
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of SettingsUI.PURE) module.exports[k] = SettingsUI[k];
}
