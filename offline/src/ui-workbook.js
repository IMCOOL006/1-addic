/* 1-addic offline edition: the Workbook (lane workbook-settings; BUILD-PLAN 3.5, tracks/SCREENS/contracts/workbook-settings.md).
   U-20a: the Reasons Card (#/workbook/reasons), its big view for hard moments (#/workbook/reasons?big=1, the page SOS
   opens) with a lock-screen image drawn on a canvas on this device, and the Support Network (#/workbook/network):
   people by role, kept on this device only and in the backup file the person saves. Contacts are hidden, never deleted;
   "I reached out" writes through Actions.contacts.reached. No network call: a phone number becomes a tel: link only.
   U-20b: the browser (#/workbook, four groups, the sensitive card behind a tap) and every artifact page: the latest
   answer as text, Edit in workbook mode, read-only history, print, a practise link only when its page exists; an
   artifact whose exercise is not in this version says what it will be (O7). #/workbook/plan is PlanUI (ui-plan.js).
   Text goes in as text only (UI.h), never as HTML. Nothing here gates SOS. */
const WorkbookUI = (function () {
  'use strict';

  /* Content, Engine, Store, Actions, UI and PlanUI are classic-script globals, not globalThis properties. */
  const ns = (name) => {
    try {
      if (name === 'Store') return typeof Store !== 'undefined' ? Store : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'Actions') return typeof Actions !== 'undefined' ? Actions : null;
      if (name === 'Content') return typeof Content !== 'undefined' ? Content : null;
      if (name === 'UI') return typeof UI !== 'undefined' ? UI : null;
      if (name === 'PlanUI') return typeof PlanUI !== 'undefined' ? PlanUI : null;
      if (name === 'ExerciseUI') return typeof ExerciseUI !== 'undefined' ? ExerciseUI : null;
    } catch (e) { /* not loaded */ }
    return null;
  };
  const safe = (fn, fallback) => { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } };
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  /* ── words (original; grade 6-8, person-first) ───────────────────────────────────────────── */
  const ROLES = [
    { id: 'safetyNet', label: 'My safety net', hint: 'People I can call or text on a hard day.' },
    { id: 'sponsor', label: 'Sponsor or mentor', hint: 'Someone further along who walks with me.' },
    { id: 'therapist', label: 'Counsellor or doctor', hint: 'The people who care for my health.' },
    { id: 'other', label: 'Other people who help', hint: 'Friends, family, a group, a neighbour.' },
    { id: 'risky', label: 'People I am careful around', hint: 'Time with them makes using more likely for now. I keep a plan for them.' },
  ];
  const STRATEGIES = [
    { id: 'avoid', label: 'Stay away for now' },
    { id: 'limit', label: 'See them less' },
    { id: 'setLimits', label: 'Set clear limits when we meet' },
  ];
  const REACH = [
    { id: 'call', label: 'I called' },
    { id: 'text', label: 'I sent a message' },
    { id: 'meet', label: 'We met' },
    { id: 'other', label: 'Another way' },
  ];
  const SECTIONS = [
    { id: 'quick', label: 'My reasons' },
    { id: 'drawbacks', label: 'What using costs me' },
    { id: 'benefits', label: 'What changing gives me' },
    { id: 'different', label: 'What would be different' },
  ];
  const PHONE_RE = /^[0-9+()\-.\s]{3,24}$/;
  const TEXT = {
    cardTitle: 'My Reasons Card',
    bigTitle: 'Remember why',
    discreetTitle: 'Notes',
    networkTitle: 'My Support Network',
    discreetNetwork: 'People',
    stays: 'Stays on this device. It is in your backup file.',
    cardEmpty: 'Your card is empty for now. Write a few reasons, and they show here and in SOS.',
    exerciseLater: 'The exercise that fills this card comes in a later version. Until then, the lessons in Learn help you think it through.',
    bigEmpty: 'No reasons on your card yet. You are still here, and that counts. Call someone, or open SOS.',
    imageNote: 'The image is made on this device. Nothing is sent anywhere.',
    noCanvas: 'This browser cannot make the image. You can take a screenshot of the big view instead.',
    imageSaved: 'Image saved. Set it as your lock screen in your phone settings.',
    locked: 'Your notebook is locked. Unlock it to see this page. SOS and urgent help still work.',
    networkEmpty: 'No one here yet. Add one person you could call on a hard day.',
    later: 'This part of the workbook comes in a later version.',
    reached: (name) => 'Noted: you reached out to ' + name + '.',
    hideMessage: 'They leave this list but stay in your notebook and your backup file. You can show them again below.',
  };

  /* ── pure helpers (exported for the tests) ───────────────────────────────────────────────── */

  /* Greedy word wrap by characters; a word longer than the line is cut. Line breaks in the text are kept. */
  function wrapLines(text, maxChars) {
    const max = Math.max(1, Math.floor(Number(maxChars) || 1));
    const out = [];
    for (const para of String(text == null ? '' : text).split(/\r?\n/)) {
      const words = para.split(/\s+/).filter(Boolean);
      let line = '';
      for (let w of words) {
        while (w.length > max) {
          if (line) { out.push(line); line = ''; }
          out.push(w.slice(0, max)); w = w.slice(max);
        }
        if (!w) continue;
        if (!line) line = w;
        else if (line.length + 1 + w.length <= max) line += ' ' + w;
        else { out.push(line); line = w; }
      }
      if (line) out.push(line);
    }
    return out;
  }

  const textList = (x) => (Array.isArray(x) ? x : []).filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim());

  /* The card's four lists. Engine exports reasonsCardSections (engine.js:684, 1500), so the card reads the same
     payload keys as SOS; an Engine without it gives the flat card as one list. */
  function reasonsSections(view) {
    const out = { quick: [], drawbacks: [], benefits: [], different: [] };
    const E = ns('Engine');
    if (!view || !E) return out;
    const s = typeof E.reasonsCardSections === 'function' ? safe(() => E.reasonsCardSections(view), null) : null;
    if (isObj(s)) { for (const k of Object.keys(out)) out[k] = textList(s[k]); return out; }
    if (typeof E.reasonsCard === 'function') out.quick = textList(safe(() => E.reasonsCard(view), []));
    return out;
  }
  /* Every reason once, in the card's order (as Engine.reasonsCard). */
  function flatReasons(sections) {
    const seen = new Set();
    const out = [];
    for (const sec of SECTIONS) {
      for (const r of textList(sections && sections[sec.id])) {
        const k = r.toLowerCase();
        if (!seen.has(k)) { seen.add(k); out.push(r); }
      }
    }
    return out;
  }

  /* A contact from the form's values, in the shape Actions.contacts.add takes. */
  function contactPayload(v) {
    const x = v || {};
    const str = (s) => (typeof s === 'string' ? s.trim() : '');
    const role = ROLES.some((r) => r.id === x.role) ? x.role : 'safetyNet';
    const strategy = role === 'risky' && STRATEGIES.some((s) => s.id === x.strategy) ? x.strategy : null;
    return { name: str(x.name), role, strategy, phone: str(x.phone), note: str(x.note) };
  }
  /* What is wrong with a payload, in plain words, or ''. Same limits as Actions (actions.js:489-503). */
  function contactError(p) {
    if (!p || !p.name) return 'Add a name, or a nickname only you understand.';
    if (p.name.length > 80) return 'Keep the name under 80 characters.';
    if (p.phone && !PHONE_RE.test(p.phone)) return 'That phone number does not look right. Use digits, spaces and + ( ) - only.';
    if (p.note && p.note.length > 300) return 'Keep the note under 300 characters.';
    return '';
  }
  const byName = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'en', { sensitivity: 'base' });
  /* Active contacts by role, in the ROLES order; empty roles are left out. */
  function groupContacts(list) {
    const rows = (Array.isArray(list) ? list : []).filter((c) => c && c.active !== false && typeof c.id === 'string');
    return ROLES.map((r) => ({ role: r.id, label: r.label, hint: r.hint, items: rows.filter((c) => (ROLES.some((x) => x.id === c.role) ? c.role : 'other') === r.id).sort(byName) }))
      .filter((g) => g.items.length);
  }
  function hiddenContacts(list) {
    return (Array.isArray(list) ? list : []).filter((c) => c && c.active === false && typeof c.id === 'string').sort(byName);
  }
  const telHref = (phone) => {
    const d = String(phone || '').replace(/[^0-9+]/g, '');
    return d.length >= 3 ? 'tel:' + d : null;
  };
  const labelOf = (list, id) => { const x = list.find((r) => r.id === id); return x ? x.label : ''; };

  /* An exercise the exercise page can open (as ui-exercise.js exerciseFor reads Content.exercises). */
  function exerciseKnown(id) {
    const C = ns('Content');
    const ex = C && C.exercises;
    if (Array.isArray(ex)) return ex.some((x) => isObj(x) && x.id === id);
    return isObj(ex) && own(ex, id) && isObj(ex[id]);
  }

  /* ── small DOM helpers ───────────────────────────────────────────────────────────────────── */
  const h = (...a) => ns('UI').h(...a);
  let uid = 0;
  const nextId = (p) => 'wb-' + p + '-' + (++uid);
  const toast = (msg, tone) => { const U = ns('UI'); if (U && typeof U.toast === 'function') safe(() => U.toast(msg, tone), null); };
  const errText = (e) => (e && e.code === 'bad-contact' && e.message ? e.message : 'That could not be saved on this device. Please try again.');
  const discreetOf = (c) => !!(c && c.settings && c.settings.discreet);
  const isLocked = () => { const S = ns('Store'); return !!safe(() => S && typeof S.status === 'function' && S.status().locked, false); };
  const viewOf = (c) => (c && c.view) || safe(() => ns('Store').view, null);

  function lockedPage() {
    return h('div', { class: 'wb-page stack', 'data-test': 'workbook-locked' },
      h('p', { text: TEXT.locked }), h('a', { class: 'btn primary', href: '#/sos', text: 'Open SOS' }));
  }

  /* ── the Reasons Card ────────────────────────────────────────────────────────────────────── */

  /* Draws the lock-screen image: 1080 x 1920, dark, system font only, the top third left free for the clock. */
  function drawCard(canvas, title, reasons) {
    const W = 1080; const H = 1920; const X = 96;
    canvas.width = W; canvas.height = H;
    const g = canvas.getContext('2d');
    if (!g) return false;
    const font = (px, weight) => weight + ' ' + px + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    g.fillStyle = '#0f1a24'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#f2ece0'; g.textBaseline = 'top';
    let y = 560;
    g.font = font(68, '700'); g.fillText(title, X, y); y += 130;
    const total = reasons.reduce((n, r) => n + r.length, 0);
    const px = total > 600 ? 40 : total > 300 ? 46 : 54;
    const lh = Math.round(px * 1.32);
    const maxChars = Math.max(12, Math.floor((W - 2 * X - 50) / (px * 0.5)));
    g.font = font(px, '400');
    for (let i = 0; i < reasons.length; i++) {
      const lines = wrapLines(reasons[i], maxChars);
      if (y + lines.length * lh > H - 200) { g.fillText('and ' + (reasons.length - i) + ' more', X, y); break; }
      lines.forEach((ln, j) => { g.fillText(ln, X + 50, y); if (j === 0) g.fillText('•', X, y); y += lh; });
      y += Math.round(px * 0.55);
    }
    return true;
  }

  /* Makes the image and hands it to UI.download. Resolves true when a file was offered. */
  function exportImage(title, reasons, fileName) {
    const U = ns('UI');
    const canvas = safe(() => document.createElement('canvas'), null);
    const can = !!canvas && typeof canvas.getContext === 'function' && typeof canvas.toBlob === 'function';
    if (!can || !safe(() => drawCard(canvas, title, reasons), false)) { toast(TEXT.noCanvas, 'warn'); return Promise.resolve(false); }
    return new Promise((resolve) => {
      const done = (blob) => {
        const ok = !!blob && !!U && typeof U.download === 'function' && !!safe(() => U.download(fileName, blob, 'image/png'), false);
        toast(ok ? TEXT.imageSaved : TEXT.noCanvas, ok ? 'ok' : 'warn');
        resolve(ok);
      };
      try { canvas.toBlob(done, 'image/png'); } catch (e) { done(null); }
    });
  }

  function emptyCardAction() {
    if (exerciseKnown('quick-reasons')) return h('a', { class: 'btn primary', href: '#/exercise/quick-reasons?mode=workbook', 'data-test': 'reasons-write', text: 'Write my reasons' });
    return h('p', { class: 'muted', 'data-test': 'reasons-later', text: TEXT.exerciseLater });
  }

  function reasonsPage(c) {
    const discreet = discreetOf(c);
    const sections = reasonsSections(viewOf(c));
    const all = flatReasons(sections);
    const title = discreet ? TEXT.discreetTitle : TEXT.cardTitle;
    const lists = SECTIONS.filter((s) => sections[s.id].length).map((s) => h('section', { class: 'wb-section' },
      h('h2', { class: 'wb-section-title', text: s.label }),
      h('ul', { class: 'wb-reasons' }, sections[s.id].map((r) => h('li', { text: r })))));
    const exportBtn = all.length ? h('button', {
      type: 'button', class: 'btn', 'data-test': 'reasons-export',
      onClick: () => exportImage(title, all, discreet ? 'notes.png' : 'reasons-card.png'),
      text: 'Save as a lock-screen image',
    }) : null;
    return h('div', { class: 'wb-page stack', 'data-test': 'reasons-page' },
      h('h1', { text: title }),
      h('section', { class: 'card wb-card', 'data-test': 'reasons-card', 'aria-label': title },
        all.length ? lists : [h('p', { text: TEXT.cardEmpty }), emptyCardAction()]),
      h('div', { class: 'row wb-actions' },
        h('a', { class: 'btn primary', href: '#/workbook/reasons?big=1&from=card', 'data-test': 'reasons-big', text: 'Big view' }),
        exportBtn,
        h('a', { class: 'btn ghost', href: '#/workbook/network', text: 'My people' })),
      all.length ? h('p', { class: 'muted', text: TEXT.imageNote }) : null);
  }

  /* The big view: what a person sees from SOS. Large type, one tap back, a way to call someone; no tips, no tours. */
  function bigPage(c) {
    const discreet = discreetOf(c);
    const all = flatReasons(reasonsSections(viewOf(c)));
    const q = (c && c.route && c.route.query) || {};
    const back = q.from === 'card' ? { href: '#/workbook/reasons', text: 'Back to my card' } : { href: '#/sos', text: 'Back to SOS' };
    return h('div', { class: 'wb-big', 'data-test': 'reasons-big-view' },
      h('a', { class: 'btn ghost wb-back', href: back.href, 'data-test': 'reasons-back', text: back.text }),
      h('h1', { class: 'wb-big-title', text: discreet ? TEXT.discreetTitle : TEXT.bigTitle }),
      all.length ? h('ul', { class: 'wb-big-list' }, all.map((r) => h('li', { text: r }))) : h('p', { class: 'wb-big-empty', text: TEXT.bigEmpty }),
      h('a', { class: 'btn primary wb-big-call', href: '#/workbook/network', 'data-test': 'reasons-call', text: 'Call someone' }));
  }

  /* ── the Support Network ─────────────────────────────────────────────────────────────────── */

  const actions = () => {
    const A = ns('Actions');
    if (!A || !A.contacts) throw Object.assign(new Error('That could not be saved on this device.'), { code: 'no-store' });
    return A.contacts;
  };
  async function saveContact(values, id) {
    const p = contactPayload(values);
    const msg = contactError(p);
    if (msg) { const e = new Error(msg); e.code = 'bad-contact'; throw e; }
    return id ? actions().update(id, p) : actions().add(p);
  }
  const reachOut = (id, how) => actions().reached(id, how);
  const hideContact = (id) => actions().deactivate(id);
  const showContact = (id) => actions().update(id, { active: true });

  function sheetOf(title, body, onClose) {
    const U = ns('UI');
    return U && typeof U.sheet === 'function' ? U.sheet(title, body, { onClose: onClose || (() => {}) }) : null;
  }

  function field(label, input, hint) {
    const id = input.getAttribute('id');
    return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id, text: label }), input,
      hint ? h('p', { id: id + '-hint', class: 'field-hint', text: hint }) : null);
  }

  /* The add / edit sheet. The form lives in the sheet, so a store re-render of the page never clears it. */
  function contactSheet(existing) {
    const c = existing || {};
    const mk = (tag, test, attrs) => { const id = nextId(test); return h(tag, Object.assign({ id, name: test, 'data-test': test }, attrs || {})); };
    const name = mk('input', 'contact-name', { type: 'text', maxlength: '80', autocomplete: 'off', required: true });
    const role = mk('select', 'contact-role', {});
    ROLES.forEach((r) => role.appendChild(h('option', { value: r.id, text: r.label })));
    const strategy = mk('select', 'contact-strategy', {});
    STRATEGIES.forEach((s) => strategy.appendChild(h('option', { value: s.id, text: s.label })));
    const phone = mk('input', 'contact-phone', { type: 'tel', inputmode: 'tel', maxlength: '24', autocomplete: 'off' });
    const note = mk('textarea', 'contact-note', { rows: '3', maxlength: '300' });
    name.value = c.name || ''; role.value = c.role || 'safetyNet'; strategy.value = c.strategy || 'avoid';
    phone.value = c.phone || ''; note.value = c.note || '';
    phone.setAttribute('aria-describedby', phone.getAttribute('id') + '-hint');
    const stratField = field('My plan with them', strategy);
    const sync = () => { stratField.hidden = role.value !== 'risky'; };
    role.addEventListener('change', sync);
    sync();
    const err = h('p', { class: 'field-error', role: 'alert', hidden: true });
    let s = null; let busy = false;
    const submit = async (ev) => {
      if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
      if (busy) return;
      busy = true;
      try {
        await saveContact({ name: name.value, role: role.value, strategy: strategy.value, phone: phone.value, note: note.value }, c.id || null);
        if (s) s.close('saved');
        toast(c.id ? 'Saved.' : 'Added. ' + TEXT.stays, 'ok');
      } catch (e) {
        err.textContent = e && e.code === 'bad-contact' ? e.message : errText(e);
        err.hidden = false;
      }
      busy = false;
    };
    const body = h('form', { class: 'stack wb-contact-form', onSubmit: submit, novalidate: true },
      field('Name', name, null), field('Who they are to me', role, null), stratField,
      field('Phone (optional)', phone, 'Only for a Call button here. It never leaves this device.'),
      field('Note (optional)', note, null), err,
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn ghost', text: 'Cancel', onClick: () => { if (s) s.close('cancelled'); } }),
        h('button', { type: 'submit', class: 'btn primary', 'data-test': 'contact-save', text: c.id ? 'Save' : 'Add' })));
    s = sheetOf(c.id ? 'Edit ' + c.name : 'Add a person', body);
    return s;
  }

  function reachSheet(contact) {
    let s = null;
    const pick = async (how) => {
      try {
        await reachOut(contact.id, how);
        if (s) s.close('saved');
        toast(TEXT.reached(contact.name), 'ok');
      } catch (e) { toast(errText(e), 'warn'); }
    };
    const body = h('div', { class: 'stack' },
      h('p', { text: 'How did you reach out?' }),
      h('div', { class: 'wb-choices' }, REACH.map((r) => h('button', { type: 'button', class: 'btn', 'data-test': 'reach-' + r.id, text: r.label, onClick: () => pick(r.id) }))));
    s = sheetOf('I reached out to ' + contact.name, body);
    return s;
  }

  async function askHide(contact) {
    const U = ns('UI');
    const ok = U && typeof U.confirm === 'function'
      ? await U.confirm({ title: 'Hide ' + contact.name + '?', message: TEXT.hideMessage, confirmLabel: 'Hide' }) : false;
    if (!ok) return false;
    try { await hideContact(contact.id); return true; } catch (e) { toast(errText(e), 'warn'); return false; }
  }

  function contactRow(ct) {
    const tel = ct.phone ? telHref(ct.phone) : null;
    const risky = ct.role === 'risky';
    return h('li', { class: 'wb-contact', 'data-test': 'contact-' + ct.id },
      h('p', { class: 'wb-contact-name', text: ct.name }),
      risky && ct.strategy ? h('p', { class: 'wb-contact-plan', text: 'My plan: ' + labelOf(STRATEGIES, ct.strategy) }) : null,
      ct.note ? h('p', { class: 'muted wb-contact-note', text: ct.note }) : null,
      h('div', { class: 'row wb-contact-actions' },
        tel && !risky ? h('a', { class: 'btn primary', href: tel, 'data-test': 'call-' + ct.id, text: 'Call', 'aria-label': 'Call ' + ct.name }) : null,
        risky ? null : h('button', { type: 'button', class: 'btn', 'data-test': 'reached-' + ct.id, text: 'I reached out', 'aria-label': 'I reached out to ' + ct.name, onClick: () => reachSheet(ct) }),
        h('button', { type: 'button', class: 'btn ghost', 'data-test': 'contact-edit-' + ct.id, text: 'Edit', 'aria-label': 'Edit ' + ct.name, onClick: () => contactSheet(ct) }),
        h('button', { type: 'button', class: 'btn ghost', 'data-test': 'contact-hide-' + ct.id, text: 'Hide', 'aria-label': 'Hide ' + ct.name, onClick: () => askHide(ct) })));
  }

  function networkPage(c) {
    const discreet = discreetOf(c);
    const list = safe(() => viewOf(c).list('contacts'), []) || [];
    const groups = groupContacts(list);
    const hidden = hiddenContacts(list);
    return h('div', { class: 'wb-page stack', 'data-test': 'network-page' },
      h('h1', { text: discreet ? TEXT.discreetNetwork : TEXT.networkTitle }),
      h('p', { class: 'muted', 'data-test': 'network-stays', text: TEXT.stays }),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn primary', 'data-test': 'contact-add', text: 'Add a person', onClick: () => contactSheet(null) }),
        h('a', { class: 'btn ghost', href: '#/workbook/reasons', text: discreet ? TEXT.discreetTitle : TEXT.cardTitle })),
      groups.length ? groups.map((g) => h('section', { class: 'card wb-card', 'data-test': 'network-role-' + g.role },
        h('h2', { class: 'card-title', text: g.label }), h('p', { class: 'muted', text: g.hint }),
        h('ul', { class: 'wb-contacts' }, g.items.map(contactRow)))) : h('p', { 'data-test': 'network-empty', text: TEXT.networkEmpty }),
      hidden.length ? h('details', { class: 'wb-hidden' },
        h('summary', { text: 'Hidden people (' + hidden.length + ')' }),
        h('ul', { class: 'wb-contacts' }, hidden.map((ct) => h('li', { class: 'wb-contact', 'data-test': 'contact-' + ct.id },
          h('p', { class: 'wb-contact-name', text: ct.name }),
          h('button', { type: 'button', class: 'btn ghost', 'data-test': 'contact-show-' + ct.id, text: 'Show again', 'aria-label': 'Show ' + ct.name + ' again',
            onClick: () => { showContact(ct.id).catch((e) => toast(errText(e), 'warn')); } }))))) : null);
  }

  /* ── U-20b: the workbook browser and the artifacts (BUILD-PLAN 3.5, 3.8) ─────────────────── */
  /* Artifact -> the exercises that fill it. `will` names what it becomes while its exercise is not in this version (O7).
     `own` artifacts have their own page (the card, the network) or PlanUI (the plan). */
  const ARTIFACTS = {
    reasons: { title: 'My Reasons Card', group: 'why', exerciseIds: ['quick-reasons', 'balance', 'four-lenses'], own: true, blurb: 'Your reasons in one place, also shown in SOS.' },
    balance: { title: 'Pros and cons', group: 'why', exerciseIds: ['balance', 'four-lenses'], blurb: 'What using costs you and what changing gives you, seen from four sides.', will: 'a side-by-side list of what using costs you and what changing gives you' },
    motivation: { title: 'How ready I feel', group: 'why', exerciseIds: ['motivation'], blurb: 'How ready you feel to change, rated from time to time.', will: 'a short rating of how ready you feel, kept over time' },
    signs: { title: 'Signs I noticed', group: 'why', exerciseIds: ['signs-check'], blurb: 'The signs that told you something needed to change.', will: 'a list of the signs that made you take a closer look' },
    triggers: { title: 'My triggers', group: 'self', exerciseIds: ['triggers'], practiseRoute: '#/track/log/craving', blurb: 'People, places, feelings and times that set off cravings.', will: 'your own list of triggers, with the ones that come up most' },
    redflags: { title: 'Red-flag thoughts', group: 'self', exerciseIds: ['red-flags', 'trap-pairs'], practiseRoute: '#/games/spot-red-flag', blurb: 'Thoughts that make using seem fine, and the thinking traps behind them.', will: 'the thoughts that make using seem fine, paired with the trap behind each' },
    journal: { title: 'Thought Journal', group: 'self', exerciseIds: ['trial'], practiseRoute: '#/tools/trial', blurb: 'Thoughts you put on trial, and the comebacks you wrote.', will: 'the thoughts you put on trial and your comebacks' },
    spiral: { title: 'The spiral', group: 'self', exerciseIds: ['spiral'], blurb: 'Thoughts that pull you down after a hard moment, and your replies.', will: 'the thoughts that pull you down, each with your reply' },
    signature: { title: 'My craving signature', group: 'self', exerciseIds: ['craving-signature'], practiseRoute: '#/practice/urge-surf', blurb: 'Where a craving shows up in your body, and how it builds and fades.', will: 'a body map of where cravings show up, and how they build' },
    anger: { title: 'My anger signature', group: 'self', exerciseIds: ['anger-signature'], practiseRoute: '#/practice/breathe', blurb: 'How anger builds for you, and what sets it off.', will: 'how anger builds for you and what sets it off' },
    warnings: { title: 'My warning signs', group: 'self', exerciseIds: ['warning-signs'], blurb: 'Early signs that things are slipping, and a plan for each.', will: 'your top warning signs, each with a plan' },
    risks: { title: 'Risk factors', group: 'self', exerciseIds: ['risk-factors'], sensitive: true, blurb: 'Things in your history and health worth knowing about. Private, and only for you.', will: 'a private list of things in your history and health worth knowing about' },
    network: { title: 'My Support Network', group: 'people', exerciseIds: [], own: true, blurb: 'The people who help, and the ones you are careful around.' },
    scripts: { title: 'What I will say', group: 'people', exerciseIds: ['assertive-script'], practiseRoute: '#/games/refusal', blurb: 'Words you practised for saying no, or asking for what you need.', will: 'the words you practised for saying no or asking for help' },
    activities: { title: 'Activity Library', group: 'joys', exerciseIds: ['activity-menu', 'used-to-enjoy'], practiseRoute: '#/actions/planner', blurb: 'Things you enjoy, or used to enjoy, to fill your time.', will: 'a library of things you enjoy, or used to' },
    'balance-sw': { title: 'Should and want', group: 'joys', exerciseIds: ['should-want'], practiseRoute: '#/actions/planner', blurb: 'The balance between what you have to do and what you want to do.', will: 'the balance between what you have to do and what you want to do' },
    distractions: { title: 'Distraction deck', group: 'joys', exerciseIds: ['distractions'], practiseRoute: '#/sos/craving', blurb: 'Quick things to do while a craving passes.', will: 'your own deck of quick things to do while a craving passes' },
    plan: { title: 'My Recovery Plan', group: null, exerciseIds: [], own: true, blurb: 'Your plan for staying on track, built from your notebook.' },
  };
  const GROUPS = [
    { id: 'why', label: 'My Why', hint: 'What you are doing this for.' },
    { id: 'self', label: 'Know Myself', hint: 'How cravings and hard moments work for you.' },
    { id: 'people', label: 'My People', hint: 'Who helps, and what you say.' },
    { id: 'joys', label: 'My Joys', hint: 'What fills your time and lifts you.' },
  ];
  Object.assign(TEXT, {
    workbookTitle: 'Workbook',
    workbookIntro: 'Everything you write in the exercises lives here. Open any page to read it, change it or print it.',
    stub: (will) => 'Coming in a later version: ' + will + '.',
    nothing: 'Nothing saved here yet.',
    sensitiveShow: 'Show sensitive items',
    sensitiveHide: 'Hide sensitive items',
    sensitiveNote: 'Only you see this. Nothing here is a judgement.',
    saidIt: 'Noted. You said it, and that takes nerve.',
  });

  /* `#/workbook?sensitive=1` shows the sensitive card; the order is the GROUPS order, then the ARTIFACTS order. */
  function groupsFor(showSensitive) {
    return GROUPS.map((g) => ({ id: g.id, label: g.label, hint: g.hint,
      items: Object.keys(ARTIFACTS).filter((k) => ARTIFACTS[k].group === g.id && (showSensitive || !ARTIFACTS[k].sensitive)) }));
  }
  /* 'fooBarBaz' or 'foo-bar' -> 'Foo bar baz'. */
  const humanize = (k) => { const s = String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim().toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };
  function valueText(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v.trim();
    if (typeof v === 'number') return isFinite(v) ? String(v) : '';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (Array.isArray(v)) return v.map(valueText).filter(Boolean).join('; ');
    if (isObj(v)) return Object.keys(v).map((k) => { const t = valueText(v[k]); return t ? humanize(k) + ': ' + t : ''; }).filter(Boolean).join(', ');
    return '';
  }
  /* A saved answer as readable lines [{label, text}]: the spec's own labels when the exercise is known (and
     ExerciseUI.summarize when it is loaded), else a plain key and value list for a shape not known here. */
  function readable(payload, spec, view) {
    if (!isObj(payload)) { const t = valueText(payload); return t ? [{ label: 'Answer', text: t }] : []; }
    const fields = spec && Array.isArray(spec.fields) ? spec.fields.filter((f) => isObj(f) && f.id) : [];
    const EX = ns('ExerciseUI');
    const out = [];
    const done = new Set();
    for (const f of fields) {
      done.add(f.id);
      if (!own(payload, f.id)) continue;
      let t = '';
      if (EX && typeof EX.summarize === 'function') t = safe(() => String(EX.summarize(f, payload[f.id], view, ns('Content'), spec, payload) || ''), '');
      if (!t) t = valueText(payload[f.id]);
      if (t) out.push({ label: f.label ? String(f.label) : humanize(f.id), text: t });
    }
    for (const k of Object.keys(payload)) {
      if (done.has(k)) continue;
      const t = valueText(payload[k]);
      if (t) out.push({ label: humanize(k), text: t });
    }
    return out;
  }
  function specOf(id) {
    const EX = ns('ExerciseUI');
    if (EX && typeof EX.exerciseFor === 'function') return safe(() => EX.exerciseFor(id), null);
    const C = ns('Content');
    const ex = C && C.exercises;
    if (Array.isArray(ex)) return ex.find((x) => isObj(x) && x.id === id) || null;
    return isObj(ex) && own(ex, id) && isObj(ex[id]) ? Object.assign({ id }, ex[id]) : null;
  }
  /* Is the artifact a stub in this version: none of its exercises is in Content.exercises (O7). */
  const isStub = (a) => !!a && !a.own && !a.exerciseIds.some(exerciseKnown);
  /* A route is offered only when a page answers it (UI.pages[firstSegment]); never a link to nowhere. */
  function routeLive(route) {
    const seg = String(route || '').replace(/^#\//, '').split(/[/?]/)[0];
    const U = ns('UI');
    return !!seg && !!(U && U.pages && typeof U.pages[seg] === 'function');
  }
  const E_ = () => ns('Engine');
  const latestOf = (view, id) => { const E = E_(); return E && view ? safe(() => E.latest(view, id), null) : null; };
  const historyOf = (view, id) => { const E = E_(); return E && view ? safe(() => E.history(view, id), []) || [] : []; };
  const dateText = (at) => { const d = new Date(at); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }); };
  /* The newest save across the artifact's exercises, or null. */
  function lastSaved(view, a) {
    let best = null;
    for (const id of (a && a.exerciseIds) || []) { const r = latestOf(view, id); if (r && (!best || String(r.at) > String(best.at))) best = r; }
    return best;
  }

  function cardStatus(view, key, a) {
    if (key === 'reasons') { const n = flatReasons(reasonsSections(view)).length; return n ? n + (n === 1 ? ' reason' : ' reasons') : 'Empty for now'; }
    if (key === 'network') { const n = safe(() => groupContacts(view.list('contacts')).reduce((s, g) => s + g.items.length, 0), 0); return n ? n + (n === 1 ? ' person' : ' people') : 'No one yet'; }
    if (key === 'plan') { const p = safe(() => view.get('recoveryPlan', 'plan'), null); return p && p.sections ? 'Saved ' + dateText(p.lastReviewAt) : 'A first draft is ready'; }
    const r = lastSaved(view, a);
    if (r) return 'Saved ' + dateText(r.at);
    return isStub(a) ? 'Coming in a later version' : TEXT.nothing;
  }
  function artifactCard(view, key, first, discreet) {
    const a = ARTIFACTS[key];
    const title = key === 'reasons' && discreet ? TEXT.discreetTitle : key === 'network' && discreet ? TEXT.discreetNetwork : a.title;
    const tour = first ? { 'data-tour': 'workbook-card' } : null; // the first artifact card only
    return h('li', null, h('a', Object.assign({ class: 'card wb-card wb-art-card', href: '#/workbook/' + key, 'data-test': 'workbook-card-' + key }, tour),
      h('span', { class: 'wb-art-title', text: title }),
      h('span', { class: 'muted wb-art-blurb', text: a.blurb }),
      h('span', { class: 'wb-art-status', text: cardStatus(view, key, a) })));
  }
  function browserPage(c) {
    const view = viewOf(c);
    const q = (c.route && c.route.query) || {};
    const show = q.sensitive === '1';
    const discreet = discreetOf(c);
    let first = true;
    const groups = groupsFor(show).map((g) => h('section', { class: 'wb-group', 'data-test': 'workbook-group-' + g.id },
      h('h2', { class: 'wb-section-title', text: g.label }), h('p', { class: 'muted', text: g.hint }),
      h('ul', { class: 'wb-art-list' }, g.items.map((k) => { const n = artifactCard(view, k, first, discreet); first = false; return n; }))));
    return h('div', { class: 'wb-page stack', 'data-test': 'workbook-page' },
      h('h1', { text: TEXT.workbookTitle }),
      h('p', { class: 'muted', text: TEXT.workbookIntro }),
      h('ul', { class: 'wb-art-list' }, artifactCard(view, 'plan', false, discreet)),
      h('div', { class: 'stack', 'data-tour': 'workbook-groups' }, groups),
      h('a', { class: 'btn ghost', href: show ? '#/workbook' : '#/workbook?sensitive=1', 'data-test': 'risks-reveal', text: show ? TEXT.sensitiveHide : TEXT.sensitiveShow }));
  }

  function linesNode(lines) {
    return h('dl', { class: 'wb-lines' }, lines.map((l) => [h('dt', { text: l.label }), h('dd', { text: l.text })]));
  }
  /* The print view: the title, the date and the saved lines; no buttons, no chrome. */
  function printNode(title, blocks, now) {
    return h('article', { class: 'wb-print' },
      h('h1', { text: title }),
      h('p', { text: 'Printed ' + dateText(now || new Date()) }),
      blocks.map((b) => h('section', null, h('h2', { text: b.title }), b.lines.length ? linesNode(b.lines) : h('p', { text: TEXT.nothing }))));
  }
  /* The extras some artifacts carry: the motivation ratings, the comebacks, the deck, "I said it". */
  function extras(key, view) {
    const E = E_();
    if (key === 'motivation') {
      const rows = safe(() => view.list('motivation'), []).filter((r) => isObj(r)).sort((x, y) => String(y.at).localeCompare(String(x.at))).slice(0, 6);
      if (!rows.length) return null;
      return h('section', { class: 'card wb-card', 'data-test': 'motivation-meter' }, h('h2', { class: 'card-title', text: 'My ratings, newest first' }),
        h('ul', { class: 'wb-reasons' }, rows.map((r) => h('li', { text: dateText(r.at) + ': ' + valueText(r.score) + (valueText(r.plusOne) ? '. One step up: ' + valueText(r.plusOne) : '') }))));
    }
    if (key === 'journal') {
      const list = E && typeof E.comebacks === 'function' ? safe(() => E.comebacks(view), []) : [];
      return list.length ? h('section', { class: 'card wb-card', 'data-test': 'journal-comebacks' }, h('h2', { class: 'card-title', text: 'My comebacks' }),
        h('ul', { class: 'wb-reasons' }, list.map((t) => h('li', { text: t })))) : null;
    }
    if (key === 'distractions') {
      const list = E && typeof E.distractionDeck === 'function' ? safe(() => E.distractionDeck(view), []) : [];
      const mine = !!latestOf(view, 'distractions');
      return list.length ? h('section', { class: 'card wb-card', 'data-test': 'distraction-deck' }, h('h2', { class: 'card-title', text: mine ? 'My distraction deck' : 'Ideas to start with' }),
        h('ul', { class: 'wb-reasons' }, list.map((t) => h('li', { text: t })))) : null;
    }
    if (key === 'scripts') {
      const r = latestOf(view, 'assertive-script');
      return r ? h('button', { type: 'button', class: 'btn', 'data-test': 'script-said', text: 'I said it',
        onClick: () => { scriptSaid(r.id).then(() => toast(TEXT.saidIt), () => toast('That could not be noted on this device. Please try again.', 'warn')); } }) : null;
    }
    return null;
  }
  const scriptSaid = (responseId) => { const A = ns('Actions'); return A && typeof A.scriptUsed === 'function' ? A.scriptUsed(responseId) : Promise.reject(new Error('no actions')); };

  function artifactPage(c, key) {
    const a = ARTIFACTS[key];
    const view = viewOf(c);
    const stub = isStub(a);
    let edit = true; let hist = true;
    const blocks = [];
    const parts = a.exerciseIds.map((id) => {
      const spec = specOf(id);
      const known = exerciseKnown(id);
      const r = latestOf(view, id);
      const name = spec && spec.title ? String(spec.title) : a.title;
      const lines = r ? readable(r.payload, spec, view) : [];
      if (r) blocks.push({ title: name, lines });
      const versions = historyOf(view, id);
      const editBtn = known ? h('a', { class: 'btn primary', href: '#/exercise/' + id + '?mode=workbook', 'data-test': edit ? 'artifact-edit' : 'artifact-edit-' + id, text: r ? 'Change it' : 'Fill it in' }) : null;
      if (known) edit = false;
      const histNode = versions.length ? h('details', { class: 'wb-history', 'data-test': hist ? 'artifact-history' : 'artifact-history-' + id },
        h('summary', { text: 'History (' + versions.length + ')' }),
        h('ol', { class: 'wb-history-list' }, versions.map((v) => h('li', null, h('p', { class: 'wb-art-status', text: dateText(v.at) }), linesNode(readable(v.payload, spec, view)))))) : null;
      if (versions.length) hist = false;
      if (!r && !known) return null;
      return h('section', { class: 'card wb-card', 'data-test': 'artifact-part-' + id },
        a.exerciseIds.length > 1 ? h('h2', { class: 'card-title', text: name }) : null,
        r ? linesNode(lines) : h('p', { class: 'muted', text: TEXT.nothing }),
        editBtn, histNode);
    });
    const live = a.practiseRoute && routeLive(a.practiseRoute);
    return h('div', { class: 'wb-page stack', 'data-test': 'artifact-' + key },
      h('a', { class: 'btn ghost wb-back', href: '#/workbook', text: 'All of my workbook' }),
      h('h1', { text: a.title }),
      h('p', { class: 'muted', text: a.blurb }),
      a.sensitive ? h('p', { class: 'muted', text: TEXT.sensitiveNote }) : null,
      stub ? h('p', { class: 'card wb-card', 'data-test': 'artifact-stub', text: TEXT.stub(a.will) }) : null,
      parts,
      !stub && !parts.some(Boolean) ? h('p', { text: TEXT.nothing }) : null,
      extras(key, view),
      h('div', { class: 'row wb-actions' },
        live ? h('a', { class: 'btn', href: a.practiseRoute, 'data-test': 'artifact-practise', text: 'Practise with this' }) : null,
        blocks.length ? h('button', { type: 'button', class: 'btn ghost', 'data-test': 'artifact-print', text: 'Print',
          onClick: () => { const U = ns('UI'); if (U && typeof U.printDoc === 'function') U.printDoc(printNode(a.title, blocks, c.now)); } }) : null));
  }

  function planPage(c) {
    const P = ns('PlanUI');
    if (P && typeof P.view === 'function') return P.view(c);
    return h('div', { class: 'wb-page stack', 'data-test': 'workbook-later' }, h('h1', { text: ARTIFACTS.plan.title }), h('p', { text: TEXT.later }),
      h('a', { class: 'btn', href: '#/workbook', text: 'All of my workbook' }));
  }

  function page(ctx) {
    const c = ctx || {};
    if (isLocked()) return lockedPage();
    const r = c.route || { parts: [], query: {} };
    const artifact = (r.parts && r.parts[1]) || '';
    const q = r.query || {};
    if (artifact === 'reasons') return q.big === '1' ? bigPage(c) : reasonsPage(c);
    if (artifact === 'network') return networkPage(c);
    if (artifact === 'plan') return planPage(c);
    if (own(ARTIFACTS, artifact)) return artifactPage(c, artifact);
    return browserPage(c); // #/workbook and an unknown artifact
  }

  const PURE = ['ROLES', 'STRATEGIES', 'REACH', 'SECTIONS', 'TEXT', 'wrapLines', 'reasonsSections', 'flatReasons',
    'contactPayload', 'contactError', 'groupContacts', 'hiddenContacts', 'exerciseKnown', 'ARTIFACTS', 'GROUPS', 'groupsFor',
    'readable', 'valueText', 'humanize', 'isStub'];

  return {
    ROLES, STRATEGIES, REACH, SECTIONS, TEXT, wrapLines, reasonsSections, flatReasons, contactPayload, contactError,
    groupContacts, hiddenContacts, exerciseKnown, telHref, drawCard, exportImage, saveContact, reachOut, hideContact,
    showContact, ARTIFACTS, GROUPS, groupsFor, readable, valueText, humanize, isStub, routeLive, printNode, scriptSaid, page, PURE,
  };
})();

// The page registers from this file (contracts/core.md: UI.pages[firstSegment]); nothing in ui-core.js changes.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.workbook = (ctx) => WorkbookUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of WorkbookUI.PURE) module.exports[k] = WorkbookUI[k];
}
