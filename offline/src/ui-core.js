/* 1-addic · ui-core.js · the UI core and the hash router (BUILD-PLAN 3.2 "UI core", 3.5 routes).
   Contract: docs/offline/build-2026-11-07/tracks/CORE/contracts/core.md, sections A to D. Owned by lane core;
   other lanes change it by request only. Pages register themselves from their own files:
     UI.pages.<firstSegment> = (ctx) => Node | Promise<Node>
   Store, Engine, Actions and Content are read only when they are defined, so this file works before those lanes
   merge and loads in Node (no DOM use outside functions). Text is always inserted as text. Nothing here makes a
   network request: read-aloud uses the device's own speech voices only (O4). */
const UI = (function () {
  'use strict';

  const THEME_KEY = '1-addic:theme';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  // First segments of BUILD-PLAN 3.5. A known page that nobody has registered yet shows an honest "coming soon".
  const KNOWN = ['today', 'learn', 'lesson', 'workbook', 'exercise', 'track', 'actions', 'practice', 'tools',
    'games', 'sos', 'settings', 'onboarding', 'lock', 'dev'];
  // The five tabs. Each data-tour name is spelled out so the tour-target guard finds it.
  const TABS = [
    { route: 'today', label: 'Today', 'data-tour': 'nav-today' },
    { route: 'learn', label: 'Learn', 'data-tour': 'nav-learn' },
    { route: 'workbook', label: 'Workbook', 'data-tour': 'nav-workbook' },
    { route: 'track', label: 'Track', 'data-tour': 'nav-track' },
    { route: 'actions', label: 'Actions', 'data-tour': 'nav-actions' },
  ];
  const SOS_BUTTON = { id: 'sos-btn', href: '#/sos', 'data-tour': 'sos-button' };
  const SAVED = {
    loading: 'Loading',
    device: 'Saved on this device',
    fallback: 'Saved (fallback)',
    none: 'Not saved — export before closing',
  };
  // Shown when the SOS page is missing or fails, so urgent help never depends on another file.
  const URGENT = {
    clinicalReview: true,
    title: 'Urgent help',
    line: 'If you or someone else is in danger, call now.',
    note: 'India numbers: please verify. Elsewhere: your local emergency number (usually 112, 911 or 999).',
  };
  const EMPTY_VIEW = Object.freeze({ get() { return null; }, list() { return []; }, count() { return 0; } });

  const pages = {};
  const state = {
    booted: false, loaded: false, seq: 0, lastPath: null, pending: 0, deferred: false, voices: null,
    lastTouch: 0, theme: 'system',
  };

  const hasDOM = () => typeof document !== 'undefined' && !!document.createElement;
  const byId = (id) => (hasDOM() ? document.getElementById(id) : null);
  const ns = (name) => {
    try {
      if (name === 'Store') return typeof Store !== 'undefined' ? Store : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'Actions') return typeof Actions !== 'undefined' ? Actions : null;
      if (name === 'Content') return typeof Content !== 'undefined' ? Content : null;
    } catch (e) { /* a namespace that throws on access counts as absent */ }
    return null;
  };
  const safe = (fn, fallback) => { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } };

  /* ── Elements ──────────────────────────────────────────────────────────────────────────── */
  function setAttrs(el, attrs, isSvg) {
    if (!attrs) return el;
    for (const k of Object.keys(attrs)) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class' || k === 'className') {
        const c = Array.isArray(v) ? v.filter(Boolean).join(' ') : String(v);
        if (c) el.setAttribute('class', c);
      } else if (k === 'text') {
        el.textContent = String(v);
      } else if (k === 'dataset') {
        for (const d of Object.keys(v)) if (v[d] != null) el.dataset[d] = String(v[d]);
      } else if (k === 'style' && typeof v === 'object') {
        for (const s of Object.keys(v)) {
          if (s.startsWith('--')) el.style.setProperty(s, String(v[s]));
          else el.style[s] = v[s];
        }
      } else if (/^on[A-Z]/.test(k) && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'html' || k === 'innerHTML' || k === 'outerHTML') {
        continue; // never: text is inserted as text
      } else if (!isSvg && (k === 'value' || k === 'checked' || k === 'selected' || k === 'indeterminate')) {
        el[k] = v;
      } else {
        el.setAttribute(k, v === true ? '' : String(v));
      }
    }
    return el;
  }

  function append(el, children) {
    for (const c of children) {
      if (c == null || c === false || c === true) continue;
      if (Array.isArray(c)) append(el, c);
      else if (typeof c === 'object' && typeof c.nodeType === 'number') el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
    return el;
  }

  function h(tag, attrs, ...children) {
    return append(setAttrs(document.createElement(tag), attrs, false), children);
  }

  function svg(tag, attrs, ...children) {
    return append(setAttrs(document.createElementNS(SVG_NS, tag), attrs, true), children);
  }

  const ICONS = {
    today: ['c:12,12,4', 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
    sun: ['c:12,12,4', 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
    moon: ['M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z'],
    learn: ['M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3zM21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21z'],
    workbook: ['M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM9 7h6M9 11h6M9 15h4'],
    track: ['M4 20V11M10 20V4M16 20v-7M2 20h20'],
    actions: ['M4 4h16v16H4zM8 12l3 3 5-6'],
    sos: ['c:12,12,9', 'c:12,12,4', 'M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6'],
    settings: ['M4 7h10M18 7h2M4 17h2M10 17h10', 'c:16,7,2', 'c:8,17,2'],
    close: ['M6 6l12 12M18 6L6 18'],
    back: ['M15 5l-7 7 7 7'],
    next: ['M9 5l7 7-7 7'],
    plus: ['M12 5v14M5 12h14'],
    check: ['M5 12l5 5 9-10'],
    phone: ['M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z'],
    lock: ['M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3'],
    play: ['M7 4l13 8-13 8z'],
    stop: ['M6 6h12v12H6z'],
    speaker: ['M4 9h4l5-4v14l-5-4H4zM16.5 9a4 4 0 0 1 0 6'],
    info: ['c:12,12,9', 'M12 11v6M12 7.5v.5'],
    wave: ['M2 12c3-4 5-4 8 0s5 4 8 0 3-2 4-2'],
  };

  function icon(name, size) {
    const px = String(size || 24);
    const parts = ICONS[name] || ['c:12,12,8'];
    const kids = parts.map((p) => {
      if (p.startsWith('c:')) {
        const [cx, cy, r] = p.slice(2).split(',');
        return svg('circle', { cx, cy, r });
      }
      return svg('path', { d: p });
    });
    return svg('svg', {
      class: 'icon', viewBox: '0 0 24 24', width: px, height: px, 'aria-hidden': 'true', focusable: 'false',
      fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }, kids);
  }

  /* ── Feedback: toast, sheet, confirm ───────────────────────────────────────────────────── */
  function toast(msg, tone) {
    const box = byId('toasts');
    if (!box) return null;
    const t = ['info', 'ok', 'warn'].includes(tone) ? tone : 'info';
    const el = h('div', { class: 'toast toast-' + t, role: t === 'warn' ? 'alert' : 'status', text: msg });
    box.appendChild(el);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 4500);
    return el;
  }

  let openSheet = null;
  function sheet(title, body, opts) {
    const o = opts || {};
    const dlg = byId('dialog');
    if (!dlg) return { el: null, close() {} };
    if (openSheet) openSheet.close('replaced');
    const back = document.activeElement;
    const titleId = 'dialog-title';
    let closed = false;
    const close = (why) => {
      if (closed) return;
      closed = true;
      openSheet = null;
      dlg.removeEventListener('close', onNativeClose);
      dlg.removeEventListener('click', onBackdrop);
      dlg.removeEventListener('cancel', onCancel);
      if (dlg.open && typeof dlg.close === 'function') dlg.close();
      else dlg.removeAttribute('open');
      dlg.replaceChildren();
      if (back && typeof back.focus === 'function' && document.contains(back)) back.focus();
      if (typeof o.onClose === 'function') o.onClose(why || 'closed');
    };
    // The browser fires 'close' later, as a queued task. If a newer sheet has opened the dialog by then (a confirm
    // from inside a sheet, a sheet opened as a confirm answers), the event belongs to an older sheet: ignore it.
    const onNativeClose = () => { if (!dlg.open) close('dismissed'); };
    const onBackdrop = (ev) => { if (ev.target === dlg && o.dismissable !== false) close('dismissed'); };
    const onCancel = (ev) => { if (o.dismissable === false) ev.preventDefault(); };
    const head = h('div', { class: 'sheet-head' },
      h('h2', { id: titleId, class: 'sheet-title', text: title || '' }),
      o.dismissable === false ? null : h('button', {
        type: 'button', class: 'icon-btn sheet-close', 'aria-label': 'Close', onClick: () => close('dismissed'),
      }, icon('close', 22)));
    const content = h('div', { class: 'sheet-body' }, body);
    const foot = o.actions ? h('div', { class: 'sheet-actions row' }, o.actions) : null;
    dlg.replaceChildren(head, content, foot || '');
    dlg.setAttribute('aria-labelledby', titleId);
    dlg.addEventListener('close', onNativeClose);
    dlg.addEventListener('click', onBackdrop);
    dlg.addEventListener('cancel', onCancel);
    try {
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
    } catch (e) { dlg.setAttribute('open', ''); }
    const first = content.querySelector('input, select, textarea, button, a[href]') || head.querySelector('button');
    if (first) first.focus();
    openSheet = { el: dlg, close };
    return openSheet;
  }

  function confirm(opts) {
    const o = opts || {};
    return new Promise((resolve) => {
      let answer = false;
      const yes = h('button', {
        type: 'button', class: o.danger ? 'btn danger' : 'btn primary', text: o.confirmLabel || 'OK',
        onClick: () => { answer = true; s.close('confirmed'); },
      });
      const no = h('button', {
        type: 'button', class: 'btn ghost', text: o.cancelLabel || 'Cancel', onClick: () => s.close('cancelled'),
      });
      const s = sheet(o.title || 'Are you sure?', o.message ? h('p', { text: o.message }) : null, {
        actions: [no, yes], onClose: () => resolve(answer),
      });
      if (!s.el) resolve(false);
      else no.focus();
    });
  }

  /* ── Forms ─────────────────────────────────────────────────────────────────────────────── */
  let uid = 0;
  const nextId = (p) => 'f-' + (p || 'x') + '-' + (++uid);
  const opt = (o) => (o && typeof o === 'object'
    ? { value: String(o.value != null ? o.value : o.id), label: String(o.label != null ? o.label : (o.value != null ? o.value : o.id)) }
    : { value: String(o), label: String(o) });

  function chips(options, selected, onChange, opts) {
    const multi = !!(opts && opts.multi);
    const list = (options || []).map(opt);
    let value = multi ? [].concat(selected || []).map(String) : (selected == null ? null : String(selected));
    const el = h('div', { class: 'chips', role: 'group' });
    if (opts && opts.label) el.setAttribute('aria-label', opts.label);
    const buttons = list.map((o) => h('button', {
      type: 'button', class: 'chip', 'aria-pressed': 'false', dataset: { value: o.value }, text: o.label,
      onClick: () => {
        if (multi) value = value.includes(o.value) ? value.filter((v) => v !== o.value) : value.concat(o.value);
        else value = value === o.value ? null : o.value;
        paint();
        if (typeof onChange === 'function') onChange(multi ? value.slice() : value);
      },
    }));
    const paint = () => buttons.forEach((b) => {
      const on = multi ? value.includes(b.dataset.value) : value === b.dataset.value;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    append(el, buttons);
    paint();
    Object.defineProperty(el, 'value', {
      get: () => (multi ? value.slice() : value),
      set: (v) => { value = multi ? [].concat(v || []).map(String) : (v == null ? null : String(v)); paint(); },
    });
    return el;
  }

  function buildField(f) {
    const id = nextId(f.name);
    const hintId = f.hint ? id + '-hint' : null;
    const errId = id + '-err';
    const described = [hintId, errId].filter(Boolean).join(' ');
    const label = (text, forId) => h('label', { class: 'field-label', for: forId, text: text || f.name });
    const hint = f.hint ? h('p', { id: hintId, class: 'field-hint', text: f.hint }) : null;
    const err = h('p', { id: errId, class: 'field-error', hidden: true });
    const common = { id, name: f.name, 'aria-describedby': described, required: !!f.required };
    let input; let get; let set; let body;
    const t = f.type || 'text';
    if (t === 'hidden') {
      input = h('input', { type: 'hidden', name: f.name, value: f.value != null ? String(f.value) : '' });
      return { name: f.name, field: f, el: input, get: () => input.value, set: (v) => { input.value = v == null ? '' : String(v); }, err: null, focus() {} };
    }
    if (t === 'textarea') {
      input = h('textarea', Object.assign({ rows: f.rows || 4 }, common));
      get = () => input.value; set = (v) => { input.value = v == null ? '' : String(v); };
      body = [label(f.label, id), hint, input];
    } else if (t === 'select') {
      input = h('select', common, (f.options || []).map(opt).map((o) => h('option', { value: o.value, text: o.label })));
      get = () => input.value; set = (v) => { input.value = v == null ? '' : String(v); };
      body = [label(f.label, id), hint, input];
    } else if (t === 'radio' || (t === 'checkbox' && f.options)) {
      const kind = t === 'radio' ? 'radio' : 'checkbox';
      const boxes = (f.options || []).map(opt).map((o, i) => {
        const bid = id + '-' + i;
        const b = h('input', { type: kind, id: bid, name: f.name, value: o.value });
        return { b, row: h('div', { class: 'choice' }, b, h('label', { for: bid, text: o.label })) };
      });
      input = boxes[0] ? boxes[0].b : null;
      get = () => (kind === 'radio'
        ? ((boxes.find((x) => x.b.checked) || {}).b || {}).value || null
        : boxes.filter((x) => x.b.checked).map((x) => x.b.value));
      set = (v) => {
        const want = [].concat(v == null ? [] : v).map(String);
        boxes.forEach((x) => { x.b.checked = want.includes(x.b.value); });
      };
      const fs = h('fieldset', { class: 'choices', 'aria-describedby': described },
        h('legend', { class: 'field-label', text: f.label || f.name }), boxes.map((x) => x.row));
      return finish(f, fs, [hint, err], get, set, err, input);
    } else if (t === 'checkbox') {
      input = h('input', Object.assign({}, common, { type: 'checkbox', required: false }));
      get = () => !!input.checked; set = (v) => { input.checked = !!v; };
      body = [h('div', { class: 'choice' }, input, label(f.label, id)), hint];
    } else if (t === 'chips') {
      input = chips(f.options || [], f.value, null, { multi: f.multi !== false, label: f.label || f.name });
      input.id = id;
      get = () => input.value; set = (v) => { input.value = v; };
      body = [h('p', { class: 'field-label', id: id + '-label', text: f.label || f.name }), hint, input];
      input.setAttribute('aria-labelledby', id + '-label');
      input.setAttribute('aria-describedby', described);
    } else if (t === 'slider') {
      const min = f.min != null ? f.min : 0;
      const max = f.max != null ? f.max : 10;
      input = h('input', Object.assign({}, common, { type: 'range', min, max, step: f.step || 1, value: f.value != null ? f.value : min }));
      const out = h('output', { class: 'slider-value', for: id, text: String(input.value) });
      const ends = Array.isArray(f.labels) && f.labels.length
        ? h('div', { class: 'slider-ends', 'aria-hidden': 'true' }, h('span', { text: f.labels[0] }), h('span', { text: f.labels[f.labels.length - 1] }))
        : null;
      const sync = () => {
        out.textContent = String(input.value);
        if (Array.isArray(f.labels) && f.labels.length === max - min + 1) input.setAttribute('aria-valuetext', input.value + ' ' + f.labels[input.value - min]);
      };
      input.addEventListener('input', sync);
      get = () => Number(input.value); set = (v) => { input.value = v == null ? min : String(v); sync(); };
      body = [h('div', { class: 'row slider-head' }, label(f.label, id), out), input, ends, hint];
      sync();
    } else if (t === 'custom') {
      const made = typeof f.render === 'function' ? f.render(f) : null;
      const isNode = made && typeof made.nodeType === 'number';
      const el = isNode ? made : (made && made.el) || h('div');
      get = isNode ? () => made.value : () => (made && typeof made.get === 'function' ? made.get() : undefined);
      set = isNode ? (v) => { made.value = v; } : (v) => { if (made && typeof made.set === 'function') made.set(v); };
      return finish(f, h('div', { class: 'field-custom' }, f.label ? h('p', { class: 'field-label', text: f.label }) : null, el), [hint, err], get, set, err, el);
    } else {
      const type = ['number', 'date', 'time'].includes(t) ? t : 'text';
      input = h('input', Object.assign({ type, min: f.min, max: f.max, step: f.step, inputmode: type === 'number' ? 'decimal' : null, autocomplete: f.autocomplete || 'off' }, common));
      get = type === 'number' ? () => (input.value === '' ? null : Number(input.value)) : () => input.value;
      set = (v) => { input.value = v == null ? '' : String(v); };
      body = [label(f.label, id), hint, input];
    }
    return finish(f, null, body.concat(err), get, set, err, input);
  }

  function finish(f, lead, rest, get, set, err, focusEl) {
    const el = h('div', { class: 'field field-' + (f.type || 'text'), dataset: { name: f.name } }, lead, rest);
    if (f.value !== undefined && f.type !== 'slider' && f.type !== 'chips') set(f.value);
    return { name: f.name, field: f, el, get, set, err, focus: () => { if (focusEl && focusEl.focus) focusEl.focus(); } };
  }

  function form(spec) {
    const s = spec || {};
    const fields = (s.fields || []).map(buildField);
    const byName = {};
    fields.forEach((x) => { byName[x.name] = x; });
    const values = () => {
      const out = {};
      fields.forEach((x) => { out[x.name] = x.get(); });
      return out;
    };
    const showError = (x, msg) => {
      if (!x.err) return;
      x.err.textContent = msg || '';
      x.err.hidden = !msg;
      x.el.classList.toggle('invalid', !!msg);
      const ctl = x.el.querySelector('input, select, textarea');
      if (ctl) { if (msg) ctl.setAttribute('aria-invalid', 'true'); else ctl.removeAttribute('aria-invalid'); }
    };
    const validate = () => {
      let first = null;
      fields.forEach((x) => {
        const f = x.field; const v = x.get();
        let msg = '';
        const empty = v == null || v === '' || (Array.isArray(v) && !v.length) || (f.type === 'checkbox' && !f.options && v === false);
        if (f.required && empty) msg = 'Please fill this in.';
        else if (f.type === 'number' && v != null && !empty) {
          if (Number.isNaN(v)) msg = 'Please enter a number.';
          else if (f.min != null && v < f.min) msg = 'The smallest is ' + f.min + '.';
          else if (f.max != null && v > f.max) msg = 'The largest is ' + f.max + '.';
        }
        showError(x, msg);
        if (msg && !first) first = x;
      });
      if (first) first.focus();
      return !first;
    };
    const api = { el: null, values, set: (name, val) => { if (byName[name]) byName[name].set(val); }, validate };
    const submit = s.onSubmit
      ? h('div', { class: 'form-actions row' }, h('button', { type: 'submit', class: 'btn primary', text: s.submitLabel || 'Save' }))
      : null;
    api.el = h('form', {
      class: 'form stack', novalidate: true,
      onSubmit: (ev) => {
        ev.preventDefault();
        if (typeof s.onSubmit === 'function' && validate()) s.onSubmit(values(), api);
      },
    }, fields.map((x) => x.el), submit);
    return api;
  }

  /* ── Building blocks ───────────────────────────────────────────────────────────────────── */
  function card(title, body, opts) {
    const o = opts || {};
    const level = o.level === 3 ? 'h3' : 'h2';
    return h(o.tag || 'section', { class: ['card', o.class], id: o.id, dataset: o.dataset, 'data-tour': o.tour },
      title ? h(level, { class: 'card-title', text: title }) : null,
      body, o.footer ? h('div', { class: 'card-foot row' }, o.footer) : null);
  }

  function tile(label, value, sub) {
    return h('div', { class: 'tile' },
      h('span', { class: 'tile-value', text: value == null ? '' : value }),
      h('span', { class: 'tile-label', text: label == null ? '' : label }),
      sub != null && sub !== '' ? h('span', { class: 'tile-sub', text: sub }) : null);
  }

  function ring(pct, label) {
    const p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    const r = 16; const c = 2 * Math.PI * r;
    return h('div', { class: 'ring', role: 'img', 'aria-label': (label ? label + ': ' : '') + p + '%' },
      svg('svg', { viewBox: '0 0 40 40', width: '64', height: '64', 'aria-hidden': 'true', focusable: 'false' },
        svg('circle', { class: 'ring-track', cx: '20', cy: '20', r: String(r) }),
        svg('circle', { class: 'ring-fill', cx: '20', cy: '20', r: String(r), 'stroke-dasharray': c.toFixed(2), 'stroke-dashoffset': (c * (1 - p / 100)).toFixed(2), transform: 'rotate(-90 20 20)' })),
      h('span', { class: 'ring-text', 'aria-hidden': 'true', text: p + '%' }),
      label ? h('span', { class: 'ring-label', 'aria-hidden': 'true', text: label }) : null);
  }

  function meter(value, max) {
    const m = Number(max) > 0 ? Number(max) : 100;
    const v = Math.max(0, Math.min(m, Number(value) || 0));
    return h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(m), 'aria-valuenow': String(v) },
      h('span', { class: 'meter-fill', style: { width: (100 * v / m).toFixed(1) + '%' } }));
  }

  function empty(text, action) {
    let act = null;
    if (action && typeof action.nodeType === 'number') act = action;
    else if (action && action.href) act = h('a', { class: 'btn', href: action.href, text: action.label || 'Open' });
    else if (action && typeof action.onClick === 'function') act = h('button', { type: 'button', class: 'btn', text: action.label || 'Start', onClick: action.onClick });
    return h('div', { class: 'empty' }, h('p', { text: text || 'Nothing here yet.' }), act);
  }

  /* ── Routing ───────────────────────────────────────────────────────────────────────────── */
  const dec = (s) => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { return s; } };

  function parse(hash) {
    const raw = String(hash || '').replace(/^#/, '');
    const qi = raw.indexOf('?');
    const pathPart = qi >= 0 ? raw.slice(0, qi) : raw;
    const parts = pathPart.split('/').filter(Boolean).map(dec);
    const query = {};
    if (qi >= 0) {
      for (const pair of raw.slice(qi + 1).split('&')) {
        if (!pair) continue;
        const eq = pair.indexOf('=');
        const k = dec(eq >= 0 ? pair.slice(0, eq) : pair);
        if (k) query[k] = eq >= 0 ? dec(pair.slice(eq + 1)) : '';
      }
    }
    return { path: '/' + parts.join('/'), parts, query };
  }

  function route() {
    return parse(typeof location !== 'undefined' && location ? location.hash : '');
  }

  function normal(r) {
    const s = String(r == null ? '' : r).trim();
    if (s.startsWith('#/')) return s;
    if (s.startsWith('#')) return '#/' + s.slice(1);
    if (s.startsWith('/')) return '#' + s;
    return '#/' + s;
  }

  function go(r, opts) {
    const target = normal(r);
    if (typeof location === 'undefined') return;
    if (opts && opts.replace && typeof history !== 'undefined' && history.replaceState) {
      history.replaceState(history.state, '', target);
      render('route');
    } else if (location.hash === target) {
      render('route');
    } else {
      location.hash = target; // the hashchange event renders, so Back and Forward work
    }
  }

  function pageKey(r) {
    const first = r.parts[0] || 'today';
    if (KNOWN.includes(first) || Object.prototype.hasOwnProperty.call(pages, first)) return first;
    return 'today';
  }

  function status() {
    const S = ns('Store');
    return S && typeof S.status === 'function' ? safe(() => S.status(), null) : null;
  }
  const isLocked = () => { const st = status(); return !!(st && st.locked); };

  function savedText(st, loaded, now) {
    if (loaded === false) return SAVED.loading;
    if (!st) return SAVED.none;
    if (st.persistence === 'indexeddb') {
      if (!st.lastSavedAt) return SAVED.device;
      const E = ns('Engine');
      const time = (E && typeof E.fmtTime === 'function' && safe(() => E.fmtTime(st.lastSavedAt), '')) ||
        safe(() => new Date(st.lastSavedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }), '');
      return time && time !== 'Invalid Date' ? SAVED.device + ' · ' + time : SAVED.device;
    }
    if (st.persistence === 'localstorage') return SAVED.fallback;
    return SAVED.none;
  }

  function ctx(r) {
    const S = ns('Store'); const E = ns('Engine'); const A = ns('Actions'); const C = ns('Content');
    const view = S && S.view && typeof S.view.list === 'function' ? S.view : EMPTY_VIEW;
    const profile = safe(() => view.get('profile', 'me'), null) || {};
    const settings = safe(() => view.get('settings', 'app'), null) || {};
    const defTerm = safe(() => C.terms.find((t) => t.id === profile.term) || C.terms[0], null) || { word: '', days: 'days', adjective: '' };
    const term = (E && typeof E.term === 'function' && safe(() => E.term(profile), null)) || defTerm;
    const features = (E && typeof E.revealed === 'function' && safe(() => E.revealed(view), null)) ||
      new Set(safe(() => C.reveal.always, []) || []);
    return { view, E, A, profile, settings, term, now: new Date(), features, calm: !!settings.calm, route: r || route() };
  }

  /* ── Theme, night, chrome ──────────────────────────────────────────────────────────────── */
  function storedTheme() {
    const t = safe(() => localStorage.getItem(THEME_KEY), null);
    return t === 'light' || t === 'dark' ? t : 'system';
  }

  const prefersDark = () => safe(() => !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches), false);

  function night(now) {
    const d = now instanceof Date ? now : new Date();
    const E = ns('Engine');
    if (E && typeof E.isNight === 'function') {
      const v = safe(() => E.isNight(d), null);
      if (typeof v === 'boolean') return v;
    }
    const hr = d.getHours();
    return hr >= 20 || hr < 6;
  }

  function paintTheme(key) {
    if (!hasDOM()) return;
    const t = state.theme;
    let eff = t === 'system' ? (prefersDark() ? 'dark' : 'light') : t;
    if (key === 'sos' && t !== 'light' && night()) eff = 'dark';
    document.documentElement.setAttribute('data-theme', eff);
    const btn = byId('theme-btn');
    if (btn) {
      const label = eff === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
  }

  function applyTheme(theme) {
    state.theme = theme === 'light' || theme === 'dark' ? theme : 'system';
    safe(() => {
      if (state.theme === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, state.theme);
    }, null);
    paintTheme(hasDOM() ? pageKey(route()) : null);
    return state.theme;
  }

  function chrome(key) {
    if (!hasDOM()) return;
    const C = ns('Content');
    const settings = ctx().settings;
    const root = document.documentElement;
    const discreet = !!settings.discreet;
    const name = discreet ? (safe(() => C.discreetName, null) || 'Notebook') : '1-addic';
    document.title = name;
    const appName = byId('app-name');
    if (appName && appName.textContent !== name) appName.textContent = name;
    if (discreet) root.setAttribute('data-discreet', ''); else root.removeAttribute('data-discreet');
    if (discreet || settings.counters === false) root.setAttribute('data-counters', 'off'); else root.removeAttribute('data-counters');
    if (typeof settings.textSize === 'string' && settings.textSize) root.setAttribute('data-text-size', settings.textSize); else root.removeAttribute('data-text-size');
    if (settings.reducedMotion) root.setAttribute('data-motion', 'reduce'); else root.removeAttribute('data-motion');
    if (document.body) document.body.classList.toggle('calm', !!settings.calm);
    root.setAttribute('data-route', key);
    const locked = isLocked();
    const nav = byId('nav');
    if (nav) {
      nav.hidden = locked;
      nav.querySelectorAll('a[data-route]').forEach((a) => {
        if (a.getAttribute('data-route') === key) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    }
    const set = byId('settings-btn');
    if (set) set.hidden = locked;
    const sos = byId('sos-btn');
    if (sos) {
      sos.hidden = key === 'sos';
      const label = discreet ? 'Help' : 'SOS';
      if (sos.textContent !== label) sos.textContent = label;
      sos.setAttribute('aria-label', discreet ? 'Help' : 'SOS: help right now');
    }
    if (key === 'sos') { // SOS shows no tips, tours or dots
      const coach = byId('coach');
      if (coach) { coach.hidden = true; coach.replaceChildren(); }
    }
    paintTheme(key);
    updateSaved();
  }

  function updateSaved() {
    const el = byId('saved-label');
    if (!el) return;
    const text = savedText(status(), ns('Store') ? state.loaded : true);
    if (el.textContent !== text) el.textContent = text;
  }

  // Builds the tabs and the SOS button when a shell without them is in use (the shell normally carries them).
  function ensureShell() {
    const app = byId('app');
    if (!app) return;
    if (!byId('main')) app.appendChild(h('main', { id: 'main', tabindex: '-1' }));
    if (!byId('sos-btn')) app.insertBefore(h('a', Object.assign({ class: 'sos-btn', text: 'SOS' }, SOS_BUTTON)), app.firstChild);
    if (!byId('nav')) {
      app.appendChild(h('nav', { id: 'nav', class: 'nav', 'aria-label': 'Main' }, TABS.map((t) => h('a', {
        href: '#/' + t.route, 'data-route': t.route, 'data-tour': t['data-tour'], text: t.label,
      }))));
    }
  }

  /* ── Built-in pages: Today placeholder, coming soon, lock fallback, urgent-help fallback ── */
  function todayPlaceholder() {
    return h('section', { class: 'page stack' },
      h('h1', { text: 'Today' }),
      h('p', { text: 'Today is coming together.' }),
      h('div', { class: 'row' },
        h('a', { class: 'btn primary', href: '#/learn', text: 'Go to Learn' }),
        h('a', { class: 'btn', href: '#/sos', text: 'Open SOS' })));
  }
  todayPlaceholder.placeholder = true;

  function comingSoon() {
    return h('section', { class: 'page' }, empty('This part is coming soon.', { label: 'Back to Today', href: '#/today' }));
  }

  function urgentFallback() {
    const C = ns('Content');
    const res = safe(() => C.resources, null) || {};
    const local = res.in || {};
    const lines = [].concat(local.emergency || [], local.crisis || []).filter((x) => x && x.number);
    const tel = (n) => 'tel:' + String(n).replace(/[^0-9+]/g, '');
    return h('section', { class: 'page sos-page stack', 'aria-labelledby': 'urgent-title' },
      h('h1', { id: 'urgent-title', text: URGENT.title }),
      h('p', { text: URGENT.line }),
      lines.length
        ? h('ul', { class: 'sos-list', 'aria-label': local.name || 'India' }, lines.map((x) => h('li', null,
          h('a', { class: 'sos-target', href: tel(x.number) }, h('span', { class: 'sos-target-name', text: x.name }), h('span', { class: 'sos-target-number', text: x.number })))))
        : null,
      h('p', { class: 'muted', text: URGENT.note }));
  }

  function lockFallback() {
    const S = ns('Store');
    const msg = h('p', { class: 'field-error', role: 'alert', hidden: true });
    const pin = h('input', { id: 'lock-pin', type: 'password', inputmode: 'numeric', autocomplete: 'off', 'aria-describedby': 'lock-msg' });
    msg.id = 'lock-msg';
    const btn = h('button', { type: 'submit', class: 'btn primary', text: 'Unlock' });
    const f = h('form', {
      class: 'form stack', novalidate: true,
      onSubmit: async (ev) => {
        ev.preventDefault();
        if (!S || !S.lock || typeof S.lock.unlock !== 'function' || !pin.value) return;
        const tried = pin.value;
        pin.value = '';
        btn.disabled = true; pin.disabled = true;
        const ok = await Promise.resolve(safe(() => S.lock.unlock(tried), false)).catch(() => false);
        btn.disabled = false; pin.disabled = false;
        if (ok) { go('#/today', { replace: true }); return; }
        msg.textContent = 'That PIN did not match. Try again.';
        msg.hidden = false;
        pin.focus();
      },
    }, h('div', { class: 'field' }, h('label', { class: 'field-label', for: 'lock-pin', text: 'PIN' }), pin, msg), btn);
    return h('section', { class: 'page stack lock-page' },
      h('h1', { text: 'Locked' }), f,
      h('div', { class: 'row' },
        h('a', { class: 'btn', href: '#/sos/urgent', text: 'Urgent help' }),
        h('a', { class: 'btn', href: '#/sos/craving', text: 'Ride the wave' })));
  }

  function failure(key) {
    if (key === 'sos') return urgentFallback();
    return h('section', { class: 'page' }, h('p', { class: 'render-fallback', role: 'alert', text: 'This page could not open. SOS still works.' }));
  }

  /* ── Render ────────────────────────────────────────────────────────────────────────────── */
  function emit(name, detail) {
    if (!hasDOM() || typeof CustomEvent === 'undefined') return;
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }

  async function render(reason) {
    const main = byId('main');
    if (!main) return;
    const why = reason || 'route';
    const seq = ++state.seq;
    let r = route();
    let key = pageKey(r);
    const locked = isLocked();
    if (locked && key !== 'sos' && openSheet) openSheet.close('locked'); // nothing of the person's stays on screen
    if (locked && key !== 'sos' && key !== 'lock') { go('#/lock', { replace: true }); return; }
    if (!locked && key === 'lock') { go('#/today', { replace: true }); return; }
    chrome(key);
    let node = null;
    const fn = pages[key] || (key === 'sos' ? urgentFallback : key === 'lock' ? lockFallback : key === 'today' ? todayPlaceholder : comingSoon);
    try {
      node = fn(ctx(r));
      if (node && typeof node.then === 'function') node = await node;
      if (!node || typeof node.nodeType !== 'number') node = failure(key);
    } catch (err) {
      if (typeof console !== 'undefined') console.error('[ui] page "' + key + '" failed:', err);
      node = failure(key);
    }
    if (seq !== state.seq) return; // a newer render has started
    main.replaceChildren(node);
    const moved = why === 'route' && state.lastPath !== null && state.lastPath !== r.path;
    const first = state.lastPath === null;
    if (why === 'route' || first) {
      state.lastPath = r.path;
      if (moved) {
        safe(() => main.focus({ preventScroll: true }), null);
        safe(() => window.scrollTo(0, 0), null);
      }
      emit('ui:route', r);
    }
    emit('ui:rendered', { route: r, page: key, reason: why });
  }

  // Store changes re-render the current page, one frame later. Never inside SOS or on the lock page (SOS is never
  // interrupted; a PIN being typed is never wiped), and not while the person is typing in the page.
  function schedule() {
    if (!hasDOM()) return;
    updateSaved();
    if (state.pending) return;
    const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f) => setTimeout(f, 16);
    state.pending = raf(() => {
      state.pending = 0;
      const key = pageKey(route());
      const locked = isLocked();
      if (key === 'lock') { if (locked) chrome(key); else render('route'); return; }
      if (locked && key !== 'sos') { render('route'); return; }
      if (key === 'sos') { chrome(key); return; }
      const main = byId('main'); const a = document.activeElement;
      if (main && a && main.contains(a) && a.matches && a.matches('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) {
        state.deferred = true;
        chrome(key);
        return;
      }
      render('store');
    });
  }

  /* ── Speech, print, download ───────────────────────────────────────────────────────────── */
  function synth() {
    return typeof window !== 'undefined' && window && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined'
      ? window.speechSynthesis : null;
  }

  // Only a voice that runs on the device (localService) is used: a network voice would send the text away.
  function localVoice(s) {
    const voices = safe(() => s.getVoices(), []) || [];
    const local = voices.filter((v) => v && v.localService);
    return local.find((v) => /^en(-|_|$)/i.test(v.lang || '')) || local[0] || null;
  }

  function speak(text) {
    const s = synth();
    if (!s || text == null || String(text).trim() === '') return false;
    const voice = localVoice(s);
    if (!voice) return false;
    try {
      s.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.voice = voice;
      u.lang = voice.lang || 'en';
      u.rate = 0.95;
      s.speak(u);
      return true;
    } catch (e) {
      return false;
    }
  }

  function stopSpeaking() {
    const s = synth();
    if (s) safe(() => s.cancel(), null);
  }

  function printDoc(node) {
    const root = byId('print-root');
    if (!root || typeof window === 'undefined') return;
    root.replaceChildren(node);
    const clear = () => { root.replaceChildren(); window.removeEventListener('afterprint', clear); };
    window.addEventListener('afterprint', clear);
    safe(() => window.print(), null);
  }

  function download(filename, text, mime) {
    if (!hasDOM() || typeof Blob === 'undefined' || typeof URL === 'undefined') return false;
    const blob = text instanceof Blob ? text : new Blob([text == null ? '' : String(text)], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: filename || 'download.txt', hidden: true });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 1000);
    return true;
  }

  /* ── Boot ──────────────────────────────────────────────────────────────────────────────── */
  function touch() {
    const S = ns('Store');
    const now = Date.now();
    if (now - state.lastTouch < 2000) return;
    state.lastTouch = now;
    if (S && S.lock && typeof S.lock.touch === 'function') safe(() => S.lock.touch(), null);
  }

  async function boot() {
    if (state.booted || !hasDOM()) return;
    state.booted = true;
    ensureShell();
    if (!pages.today) pages.today = todayPlaceholder;
    state.theme = storedTheme();
    window.addEventListener('hashchange', () => render('route'));
    const tb = byId('theme-btn');
    if (tb) tb.addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
    safe(() => window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => paintTheme(pageKey(route()))), null);
    document.addEventListener('pointerdown', touch, true);
    document.addEventListener('keydown', touch, true);
    const main = byId('main');
    if (main) main.addEventListener('focusout', (ev) => {
      if (state.deferred && !(ev.relatedTarget && main.contains(ev.relatedTarget))) { state.deferred = false; schedule(); }
    });
    const s = synth();
    if (s) safe(() => { s.getVoices(); s.addEventListener('voiceschanged', () => s.getVoices()); }, null);

    const S = ns('Store');
    const sosFirst = pageKey(route()) === 'sos';
    if (sosFirst || !S) await render('route'); // SOS never waits for storage
    if (S) {
      if (typeof S.load === 'function') {
        const load = Promise.resolve().then(() => S.load()).catch((err) => {
          if (typeof console !== 'undefined') console.error('[ui] Store.load failed:', err);
        });
        const slow = new Promise((res) => setTimeout(res, 4000, 'slow'));
        const first = await Promise.race([load, slow]);
        if (first === 'slow') load.then(() => { state.loaded = true; schedule(); });
        else state.loaded = true;
      } else {
        state.loaded = true;
      }
      if (typeof S.subscribe === 'function') safe(() => S.subscribe(schedule), null);
      if (S.lock && typeof S.lock.onLock === 'function') {
        safe(() => S.lock.onLock(() => {
          if (pageKey(route()) === 'sos') { chrome('sos'); return; } // never pull a person out of SOS
          go('#/lock', { replace: true });
        }), null);
      }
      if (!sosFirst || state.lastPath === null) await render('route');
      else chrome(pageKey(route()));
    }
  }

  return {
    h, svg, icon, toast, sheet, confirm, form, card, tile, chips, ring, meter, empty,
    go, route, render, pages, ctx, applyTheme, night, speak, stopSpeaking, printDoc, download, boot,
    savedText, parse,
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = UI;
