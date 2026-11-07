/* 1-addic offline edition: the Workbook (lane workbook-settings; BUILD-PLAN 3.5, tracks/SCREENS/contracts/workbook-settings.md).
   U-20a: the Reasons Card (#/workbook/reasons), its big view for hard moments (#/workbook/reasons?big=1, the page SOS
   opens) with a lock-screen image drawn on a canvas on this device, and the Support Network (#/workbook/network):
   people by role, kept on this device only and in the backup file the person saves. Contacts are hidden, never deleted;
   "I reached out" writes through Actions.contacts.reached. No network call: a phone number becomes a tel: link only.
   The rest of the workbook (the browser and the artifacts) is U-20b; until then those routes say so honestly (O7).
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

  /* ── the rest of the workbook, until U-20b: honest, never a dead button (O7) ─────────────── */
  function laterPage(c, artifact) {
    const P = ns('PlanUI');
    if (artifact === 'plan' && P && typeof P.view === 'function') return P.view(c);
    return h('div', { class: 'wb-page stack', 'data-test': 'workbook-later' },
      h('h1', { text: 'Workbook' }),
      artifact ? h('p', { text: TEXT.later }) : null,
      h('ul', { class: 'wb-links' },
        h('li', null, h('a', { class: 'btn', href: '#/workbook/reasons', text: discreetOf(c) ? TEXT.discreetTitle : TEXT.cardTitle })),
        h('li', null, h('a', { class: 'btn', href: '#/workbook/network', text: discreetOf(c) ? TEXT.discreetNetwork : TEXT.networkTitle }))),
      artifact ? null : h('p', { class: 'muted', text: 'More of your workbook comes in a later version.' }));
  }

  function page(ctx) {
    const c = ctx || {};
    if (isLocked()) return lockedPage();
    const r = c.route || { parts: [], query: {} };
    const artifact = (r.parts && r.parts[1]) || '';
    const q = r.query || {};
    if (artifact === 'reasons') return q.big === '1' ? bigPage(c) : reasonsPage(c);
    if (artifact === 'network') return networkPage(c);
    return laterPage(c, artifact);
  }

  const PURE = ['ROLES', 'STRATEGIES', 'REACH', 'SECTIONS', 'TEXT', 'wrapLines', 'reasonsSections', 'flatReasons',
    'contactPayload', 'contactError', 'groupContacts', 'hiddenContacts', 'exerciseKnown'];

  return {
    ROLES, STRATEGIES, REACH, SECTIONS, TEXT, wrapLines, reasonsSections, flatReasons, contactPayload, contactError,
    groupContacts, hiddenContacts, exerciseKnown, telHref, drawCard, exportImage, saveContact, reachOut, hideContact,
    showContact, page, PURE,
  };
})();

// The page registers from this file (contracts/core.md: UI.pages[firstSegment]); nothing in ui-core.js changes.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.workbook = (ctx) => WorkbookUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of WorkbookUI.PURE) module.exports[k] = WorkbookUI[k];
}
