/* 1-addic · store.js · the person's data, on this device only (BUILD-PLAN 3.2 Store block, 3.3). Owned by lane core.
   IndexedDB '1-addic' v1 with every store created in one upgrade; if it cannot open, the localStorage snapshot
   '1-addic:snapshot'; else memory (also in Node, where indexedDB is undefined). With a PIN, every row outside the meta
   store is sealed with AES-GCM-256 under a PBKDF2-HMAC-SHA256 key that lives in memory only. A PIN is offered, never
   forced: without one the rows are stored plain. Nothing here makes a network request. Never log a PIN, a key or a row. */
const Store = (function () {
  'use strict';

  const STORES = Object.freeze({
    profile: 'key', settings: 'key', meta: 'key', events: 'id', logs: 'id', responses: 'id', contacts: 'id', plans: 'id',
    todos: 'id', motivation: 'id', predictions: 'id', quests: 'id', tutorials: 'id', reveals: 'id', tips: 'id',
    recoveryPlan: 'key',
  });
  const NAMES = Object.keys(STORES);
  const DB_NAME = '1-addic';
  const DB_VERSION = 1;
  const SNAPSHOT = '1-addic:snapshot';
  const DISCREET = '1-addic:discreet'; // ui-core's plain device flag for discreet mode; resetAll removes it
  const ITERATIONS = 310000;
  const CHECK = '1-addic:pin-check';
  const AUTO_LOCK = [0, 1, 5, 15]; // minutes idle before the lock closes; 0 is never
  const OPEN_TIMEOUT = 10000; // a slow first open on a low-end phone must not split the data between two places
  const utf8 = new TextEncoder();
  const unutf8 = new TextDecoder();

  const state = {
    loading: null, mode: 'memory', backend: null, rows: blank(), unread: blank(), lock: null, key: null, locked: false, lastSavedAt: null,
    subs: new Set(), lockSubs: new Set(), bulk: 0, dirty: false, asked: false, chain: Promise.resolve(), epoch: 0,
    fails: 0, last: 0, timer: null,
  };

  function blank() {
    const o = {};
    for (const n of NAMES) o[n] = new Map();
    return o;
  }
  function fail(code, message) {
    const e = new Error(message);
    e.code = code;
    return e;
  }
  const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const has = (store) => Object.prototype.hasOwnProperty.call(STORES, store);
  const isBrowser = () => typeof window !== 'undefined';
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  function known(store) {
    if (!has(store)) throw fail('UNKNOWN_STORE', 'There is no store named ' + String(store) + '.');
    return STORES[store];
  }
  function checkId(store, id) {
    if (typeof id !== 'string' || id === '') throw fail('BAD_ROW', 'A ' + store + ' row needs a text ' + STORES[store] + '.');
    if (store === 'meta' && id === 'lock') throw fail('RESERVED', 'The lock row is kept by the store itself.');
    return id;
  }
  const idOf = (store, row) => checkId(store, row && typeof row === 'object' ? row[known(store)] : undefined);

  /* ── Crypto ───────────────────────────────────────────────────────────────────────────── */
  function subtle() {
    const c = globalThis.crypto;
    return c && c.subtle ? c.subtle : null;
  }
  function random(n) {
    const b = new Uint8Array(n);
    globalThis.crypto.getRandomValues(b);
    return b;
  }
  function b64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function unb64(s) {
    const bin = atob(String(s));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function derive(pin, salt, iterations) {
    const s = subtle();
    if (!s) throw fail('NO_CRYPTO', 'A PIN cannot be set in this browser.');
    const base = await s.importKey('raw', utf8.encode(pin), 'PBKDF2', false, ['deriveKey']);
    return s.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base,
      { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  // The store and id are bound in as additional data, so a sealed row cannot be moved to another place and still open.
  async function seal(key, store, id, value) {
    const iv = random(12);
    const ct = await subtle().encrypt({ name: 'AES-GCM', iv, additionalData: utf8.encode(store + '/' + id) },
      key, utf8.encode(JSON.stringify(value)));
    return { iv: b64(iv), ct: b64(new Uint8Array(ct)) };
  }
  async function unseal(key, store, id, box) {
    const pt = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(box.iv), additionalData: utf8.encode(store + '/' + id) },
      key, unb64(box.ct));
    return JSON.parse(unutf8.decode(pt));
  }
  // The key for this PIN, or null when it does not open the lock's check.
  async function keyFor(pin) {
    const L = state.lock;
    if (!L || typeof pin !== 'string' || pin === '' || !subtle()) return null;
    try {
      const key = await derive(pin, unb64(L.salt), L.iterations || ITERATIONS);
      return (await unseal(key, 'meta', 'lock', L.check)) === CHECK ? key : null;
    } catch (e) {
      return null;
    }
  }
  // A wrong PIN changes nothing. In the browser each failed try waits a little longer (250 ms a try, at most 2 s).
  async function refused() {
    state.fails += 1;
    if (isBrowser()) await sleep(Math.min(250 * state.fails, 2000));
    return false;
  }
  // Two tabs of the file share the storage. Each write carries the lock row its tab knows, and the backend refuses
  // it when the stored one differs (another tab set, changed or removed the PIN): no tab then writes plain rows beside
  // a lock, seals a row under an old key or drops the lock row (RC2, RS3).
  const lockOf = (all) => ((all && Array.isArray(all.meta) ? all.meta : []).find((r) => r && r.key === 'lock' && r.salt && r.check) || null);
  const lockId = (L) => (L && L.salt && L.check ? String(L.salt) + '|' + JSON.stringify(L.check) : '');
  const stale = () => fail('STALE', 'Another tab changed the lock.');
  async function sealAll(rows, key) {
    const jobs = [];
    for (const n of NAMES) for (const [id, row] of rows[n]) jobs.push(stored(key, n, id, row).then((r) => [n, id, r]));
    return Promise.all(jobs);
  }
  async function stored(key, store, id, row) {
    if (!key || store === 'meta') return clone(row);
    return { [STORES[store]]: id, enc: await seal(key, store, id, row) };
  }
  // The rows that open, and the rows that will not (damaged, or sealed under another key) kept as they are stored
  // rather than failing the unlock (Q4). Each goes in its stored order, whatever order the decryptions end in (RC9).
  async function decode(all, key) {
    const rows = blank();
    const unread = blank();
    const jobs = [];
    for (const n of NAMES) {
      for (const row of (all && all[n]) || []) {
        const id = row && row[STORES[n]];
        if (typeof id !== 'string' || (n === 'meta' && id === 'lock')) continue;
        if (!row.enc) jobs.push([n, id, row]);
        else if (!key) jobs.push([n, id, undefined, row]);
        else jobs.push(unseal(key, n, id, row.enc).then((v) => [n, id, v], () => [n, id, undefined, row]));
      }
    }
    for (const [n, id, v, raw] of await Promise.all(jobs)) {
      if (raw) unread[n].set(id, raw);
      else rows[n].set(id, v);
    }
    return { rows, unread };
  }
  // lock.set, remove and replaceAll write the unread rows back as they are stored, unless the new rows hold the id.
  function keep(rows, unread) {
    const left = blank();
    const puts = [];
    for (const n of NAMES) for (const [id, r] of unread[n]) if (!rows[n].has(id)) { left[n].set(id, r); puts.push([n, id, clone(r)]); }
    return { left, puts };
  }
  const byKey = (a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  const sorted = (m) => Array.from(m).sort(byKey).map((e) => e[1]); // key order, as IndexedDB gives it, in every mode

  /* ── Backends: IndexedDB, the localStorage snapshot, memory ───────────────────────────── */
  function idbFactory() {
    try { return typeof indexedDB !== 'undefined' && indexedDB ? indexedDB : null; } catch (e) { return null; }
  }
  function storage() {
    try {
      const ls = globalThis.localStorage;
      if (!ls) return null;
      ls.setItem('1-addic:probe', '1');
      ls.removeItem('1-addic:probe');
      return ls;
    } catch (e) {
      return null;
    }
  }
  function readSnapshot(ls) {
    try {
      const raw = ls.getItem(SNAPSHOT);
      const o = raw ? JSON.parse(raw) : null;
      return o && o.app === '1-addic' && o.stores && typeof o.stores === 'object' ? o.stores : null;
    } catch (e) {
      return null;
    }
  }
  function listAll(m) {
    const o = {};
    for (const n of NAMES) o[n] = Array.from(m[n].values());
    return o;
  }

  // Memory, or memory mirrored whole into the snapshot on every write. A failed save changes nothing. Another tab may
  // have saved since, so with a snapshot every read and every write starts again from it.
  function mirror(ls) {
    const m = blank();
    function seed(all) {
      for (const n of NAMES) for (const r of Array.isArray(all[n]) ? all[n] : []) if (r && typeof r[STORES[n]] === 'string') m[n].set(r[STORES[n]], r);
    }
    const again = () => { if (!ls) return; Object.assign(m, blank()); const s = readSnapshot(ls); if (s) seed(s); };
    return {
      seed,
      async readAll() { again(); return listAll(m); },
      async write(w) {
        again();
        if ('expect' in w && lockId(lockOf(listAll(m))) !== lockId(w.expect)) throw stale();
        const next = Object.assign({}, m);
        const open = (n) => { if (next[n] === m[n]) next[n] = new Map(w.clear ? [] : m[n]); return next[n]; };
        if (w.clear) for (const n of NAMES) open(n);
        for (const [n, id] of w.dels) open(n).delete(id);
        for (const [n, id, row] of w.puts) open(n).set(id, row);
        if (ls) ls.setItem(SNAPSHOT, JSON.stringify({ app: '1-addic', v: 1, stores: listAll(next) }));
        Object.assign(m, next);
      },
      async erase() {
        if (ls) ls.removeItem(SNAPSHOT);
        Object.assign(m, blank());
      },
    };
  }

  function idb(db) {
    function tx(mode, fill) {
      return new Promise((res, rej) => {
        let t;
        try {
          t = db.transaction(NAMES, mode);
          fill(t);
        } catch (e) {
          rej(e);
          return;
        }
        t.oncomplete = () => res();
        t.onerror = () => rej(t.error || fail('WRITE_FAILED', 'The browser stopped the save.'));
        t.onabort = () => rej(t.error || fail('WRITE_FAILED', 'The browser stopped the save.'));
      });
    }
    return {
      async readAll() {
        const out = {};
        await tx('readonly', (t) => {
          for (const n of NAMES) {
            const r = t.objectStore(n).getAll();
            r.onsuccess = () => { out[n] = r.result || []; };
          }
        });
        return out;
      },
      // Every touched row goes in ONE transaction. Rows are sealed before it opens: IndexedDB ends a transaction that
      // waits on anything else.
      // The stored lock row is read inside the same transaction, so no other tab can change it between the check and
      // the write.
      write(w) {
        let refused = false;
        return tx('readwrite', (t) => {
          const apply = () => {
            if (w.clear) for (const n of NAMES) t.objectStore(n).clear();
            for (const [n, id] of w.dels) t.objectStore(n).delete(id);
            for (const [n, , row] of w.puts) t.objectStore(n).put(row);
          };
          if (!('expect' in w)) { apply(); return; }
          const g = t.objectStore('meta').get('lock');
          g.onsuccess = () => {
            if (lockId(g.result) === lockId(w.expect)) { apply(); return; }
            refused = true;
            t.abort();
          };
        }).catch((e) => { throw refused ? stale() : e; });
      },
      erase() { return this.write({ clear: true, puts: [], dels: [] }); },
    };
  }

  function openDb(factory) {
    return new Promise((res, rej) => {
      let done = false;
      const end = (f, v) => { if (!done) { done = true; clearTimeout(timer); f(v); } };
      const timer = setTimeout(() => end(rej, fail('NO_DB', 'IndexedDB did not open.')), OPEN_TIMEOUT);
      if (timer && typeof timer.unref === 'function') timer.unref();
      let r;
      try {
        r = factory.open(DB_NAME, DB_VERSION);
      } catch (e) {
        end(rej, e);
        return;
      }
      r.onupgradeneeded = () => {
        const db = r.result;
        for (const n of NAMES) if (!db.objectStoreNames.contains(n)) db.createObjectStore(n, { keyPath: STORES[n] });
      };
      r.onsuccess = () => {
        const db = r.result;
        if (done || !NAMES.every((n) => db.objectStoreNames.contains(n))) {
          try { db.close(); } catch (e) { /* already closed */ }
          end(rej, fail('NO_DB', 'IndexedDB is missing a store.'));
          return;
        }
        end(res, db);
      };
      r.onerror = () => end(rej, r.error || fail('NO_DB', 'IndexedDB did not open.'));
    });
  }
  // Deletes the database '1-addic' (resetAll in a session that runs without it, RS5). A tab that holds it open blocks
  // the delete: the timeout then decides.
  function dropDb(factory) {
    return new Promise((res, rej) => {
      let done = false;
      const end = (f, v) => { if (!done) { done = true; clearTimeout(timer); f(v); } };
      const timer = setTimeout(() => end(rej, fail('NO_DB', 'IndexedDB was not deleted.')), OPEN_TIMEOUT);
      if (timer && typeof timer.unref === 'function') timer.unref();
      let r;
      try {
        r = factory.deleteDatabase(DB_NAME);
      } catch (e) {
        end(rej, e);
        return;
      }
      r.onsuccess = () => end(res);
      r.onerror = () => end(rej, r.error || fail('NO_DB', 'IndexedDB was not deleted.'));
      r.onblocked = () => {}; // another tab holds it open: wait for the timeout
    });
  }

  async function boot() {
    let all = null;
    const factory = idbFactory();
    if (factory) {
      try {
        const b = idb(await openDb(factory));
        all = await b.readAll();
        const ls = storage();
        const snap = ls && readSnapshot(ls);
        // Adoption: rows saved in the snapshot while IndexedDB was not available move into an empty IndexedDB as they
        // are (sealed rows stay sealed), then the snapshot is removed. A non-empty IndexedDB leaves the snapshot alone.
        if (snap && NAMES.every((n) => !(all[n] || []).length)) {
          const puts = [];
          for (const n of NAMES) for (const r of Array.isArray(snap[n]) ? snap[n] : []) {
            if (r && typeof r[STORES[n]] === 'string') puts.push([n, r[STORES[n]], r]);
          }
          await b.write({ clear: false, puts, dels: [] });
          try { ls.removeItem(SNAPSHOT); } catch (e) { /* kept: it is adopted already */ }
          all = await b.readAll();
        }
        state.backend = b;
        state.mode = 'indexeddb';
      } catch (e) {
        all = null;
      }
    }
    if (!state.backend && (factory || isBrowser())) {
      const ls = storage();
      if (ls) {
        const b = mirror(ls);
        const snap = readSnapshot(ls);
        if (snap) b.seed(snap);
        state.backend = b;
        state.mode = 'localstorage';
        all = await b.readAll();
      }
    }
    if (!state.backend) {
      state.backend = mirror(null);
      state.mode = 'memory';
      all = await state.backend.readAll();
    }
    const L = (all.meta || []).find((r) => r && r.key === 'lock' && r.salt && r.check);
    state.lock = L ? clone(L) : null;
    state.locked = !!L;
    state.key = null;
    const d = L ? null : await decode(all, null);
    state.rows = d ? d.rows : blank();
    state.unread = d ? d.unread : blank();
  }

  function load() {
    if (!state.loading) state.loading = boot();
    return state.loading;
  }

  /* ── Writes, notifications ────────────────────────────────────────────────────────────── */
  function run(task) {
    const p = state.chain.then(task);
    state.chain = p.catch(() => {});
    return p;
  }
  async function write(w) {
    try {
      await state.backend.write(Object.assign({ expect: state.lock }, w));
    } catch (e) {
      if (e && e.code === 'STALE') {
        try { await resync(); } catch (err) { /* the next write asks again */ }
        throw fail('LOCKED', 'This changed in another tab, so nothing was saved here.');
      }
      const f = fail('WRITE_FAILED', 'This could not be saved on this device.');
      f.cause = e;
      throw f;
    }
    if (state.mode !== 'memory') state.lastSavedAt = new Date().toISOString();
    askPersist();
  }
  function askPersist() {
    if (state.asked || state.mode === 'memory') return;
    state.asked = true;
    try {
      const s = typeof navigator !== 'undefined' && navigator && navigator.storage;
      if (s && typeof s.persist === 'function') Promise.resolve(s.persist()).catch(() => {});
    } catch (e) { /* not offered here */ }
  }
  function call(set, arg) {
    for (const fn of Array.from(set)) {
      try { fn(arg); } catch (e) { if (typeof console !== 'undefined') console.error('[store] a listener failed:', e && e.name); }
    }
  }
  function notify(label) {
    if (state.bulk) { state.dirty = true; return; }
    call(state.subs, { label });
  }
  function listen(set, fn) {
    if (typeof fn !== 'function') return () => {};
    set.add(fn);
    return () => { set.delete(fn); };
  }

  function commit(label, fn) {
    return run(async () => {
      await load();
      if (state.locked) throw fail('LOCKED', 'The data is locked.');
      if (typeof fn !== 'function') throw new TypeError('Store.commit needs a function.');
      const epoch = state.epoch;
      const staged = new Map();
      const slot = (store, id) => store + '\u0000' + id;
      const draft = {
        get(store, id) {
          known(store);
          const k = slot(store, String(id));
          if (staged.has(k)) return clone(staged.get(k).row);
          const r = state.rows[store].get(String(id));
          return r === undefined ? null : clone(r);
        },
        list(store) {
          known(store);
          const out = new Map(state.rows[store]);
          for (const s of staged.values()) if (s.store === store) { if (s.row === null) out.delete(s.id); else out.set(s.id, s.row); }
          return clone(Array.from(out.values()));
        },
        put(store, row) {
          const id = idOf(store, row);
          const copy = clone(row);
          staged.set(slot(store, id), { store, id, row: copy });
          return clone(copy);
        },
        del(store, id) {
          known(store);
          checkId(store, id);
          staged.set(slot(store, id), { store, id, row: null });
        },
      };
      const out = await fn(draft); // a throw here rejects the commit; the working set was never touched
      if (!staged.size) return out;
      if (state.locked || epoch !== state.epoch) throw fail('LOCKED', 'The data locked before this was saved.');
      const key = state.key;
      const puts = [];
      const dels = [];
      for (const s of staged.values()) {
        if (s.row === null) dels.push([s.store, s.id]);
        else puts.push([s.store, s.id, await stored(key, s.store, s.id, s.row)]);
      }
      await write({ clear: false, puts, dels });
      if (epoch !== state.epoch) return out; // locked while saving: the rows are saved sealed, the working set stays empty
      for (const s of staged.values()) {
        state.unread[s.store].delete(s.id); // the stored row was replaced or deleted: never written back later
        if (s.row === null) state.rows[s.store].delete(s.id);
        else state.rows[s.store].set(s.id, s.row);
      }
      notify(label);
      return out;
    });
  }

  // Many commits, one notification (sample data, import). Await the commits inside fn.
  async function bulk(fn) {
    state.bulk += 1;
    try {
      return await fn();
    } finally {
      state.bulk -= 1;
      if (!state.bulk && state.dirty) { state.dirty = false; notify('bulk'); }
    }
  }

  // Rows from the view are the working set itself, frozen (Q3): read them, never change them (change rows through
  // commit, whose drafts are copies).
  const view = {
    get(store, id) {
      if (state.locked || !has(store)) return null;
      const r = state.rows[store].get(String(id));
      return r === undefined ? null : Object.freeze(r);
    },
    list(store) { return state.locked || !has(store) ? [] : sorted(state.rows[store]).map((r) => Object.freeze(r)); },
    count(store) { return state.locked || !has(store) ? 0 : state.rows[store].size; },
  };

  // autoLockMin is the lock's idle minutes (1, 5 or 15; 0 is never; null without a PIN), so the settings screen can
  // show the choice in force (RC3). unreadable counts the stored rows that did not open (0 while locked) (Q4).
  function status() {
    let unreadable = 0;
    if (!state.locked) for (const n of NAMES) unreadable += state.unread[n].size;
    return { persistence: state.mode, lastSavedAt: state.lastSavedAt, hasLock: !!state.lock, locked: state.locked,
      autoLockMin: state.lock ? state.lock.autoLockMin : null, unreadable };
  }

  // Decrypted rows, in key order. When a lock exists the caller asks for the PIN first (Store.lock.verify).
  function exportJson() {
    if (state.locked) throw fail('LOCKED', 'The data is locked.');
    const stores = {};
    for (const n of NAMES) stores[n] = clone(sorted(state.rows[n]));
    return { app: '1-addic', schemaVersion: 1, exportedAt: new Date().toISOString(), stores };
  }

  // Replaces every row (never merges), in one write; the current lock stays and the new rows are sealed under it.
  function replaceAll(obj) {
    return run(async () => {
      await load();
      if (state.locked) throw fail('LOCKED', 'The data is locked.');
      const src = obj && typeof obj === 'object' && obj.stores && typeof obj.stores === 'object' ? obj.stores : null;
      if (!src) throw fail('BAD_BACKUP', 'This is not a 1-addic backup.');
      const next = blank();
      for (const n of NAMES) {
        const rows = src[n] == null ? [] : src[n];
        if (!Array.isArray(rows)) throw fail('BAD_BACKUP', 'This backup is damaged.');
        for (const r of rows) {
          if (n === 'meta' && r && r.key === 'lock') continue;
          next[n].set(idOf(n, r), clone(r));
        }
      }
      const epoch = state.epoch;
      const kept = keep(next, state.unread);
      const puts = (await sealAll(next, state.key)).concat(kept.puts);
      if (state.lock) puts.push(['meta', 'lock', clone(state.lock)]);
      await write({ clear: true, puts, dels: [] });
      if (epoch === state.epoch) { state.rows = next; state.unread = kept.left; }
      notify('replaceAll');
    });
  }

  // Erases everything on this device, the lock too. This is also what "Forgot PIN" does: start again from a backup.
  function resetAll() {
    return run(async () => {
      await load();
      try {
        await state.backend.erase();
      } catch (e) {
        const f = fail('WRITE_FAILED', 'The data could not be erased.');
        f.cause = e;
        throw f;
      }
      if (state.mode === 'indexeddb') {
        const ls = storage();
        if (ls) try { ls.removeItem(SNAPSHOT); } catch (e) { /* nothing there */ }
      }
      // A session without IndexedDB (it did not open) may still have rows in it from an earlier visit: they go too.
      let left = null;
      const factory = state.mode !== 'indexeddb' ? idbFactory() : null;
      if (factory) try { await dropDb(factory); } catch (e) { left = e; }
      const plain = storage();
      if (plain) try { plain.removeItem(DISCREET); } catch (e) { /* nothing there */ }
      state.epoch += 1;
      state.rows = blank();
      state.unread = blank();
      state.lock = null;
      state.key = null;
      state.locked = false;
      state.fails = 0;
      state.lastSavedAt = null;
      disarm();
      notify('resetAll');
      if (left) {
        const f = fail('ERASE_PARTIAL', 'This copy was erased, but an older copy may still be on this device.');
        f.cause = left;
        throw f;
      }
    });
  }

  /* ── The lock ─────────────────────────────────────────────────────────────────────────── */
  function minutes(v) {
    if (v === null || v === 0 || v === 'never') return 0;
    const n = Number(v);
    return AUTO_LOCK.includes(n) ? n : 5;
  }
  function disarm() {
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
  }
  function arm() {
    disarm();
    const min = state.lock && !state.locked ? state.lock.autoLockMin : 0;
    if (!min) return;
    state.timer = setTimeout(() => { state.timer = null; lockNow('auto'); }, min * 60000);
    if (state.timer && typeof state.timer.unref === 'function') state.timer.unref();
  }
  function opened(key) {
    state.key = key;
    state.locked = false;
    state.fails = 0;
    state.last = Date.now();
    arm();
  }

  function lockNow(reason) {
    if (!state.lock || state.locked) return;
    state.epoch += 1;
    state.key = null;
    state.rows = blank();
    state.locked = true;
    disarm();
    call(state.lockSubs, { reason: reason === 'auto' ? 'auto' : 'manual' });
    notify('lock');
  }

  // Activity keeps the lock open. A touch after the idle limit (a phone that slept) locks instead.
  function touch() {
    if (!state.lock || state.locked) return;
    const min = state.lock.autoLockMin;
    const now = Date.now();
    if (min && now - state.last >= min * 60000) { lockNow('auto'); return; }
    state.last = now;
    arm();
  }

  function setLock(pin, opts) {
    return run(async () => {
      await load();
      if (state.locked) throw fail('LOCKED', 'The data is locked.');
      if (typeof pin !== 'string' || pin.length < 4 || pin.length > 64) throw fail('BAD_PIN', 'A PIN needs 4 to 64 characters.');
      if (!subtle()) throw fail('NO_CRYPTO', 'A PIN cannot be set in this browser.');
      const epoch = state.epoch;
      // The rows are taken before the first wait: a lock while the key is derived empties state.rows, and a clear
      // write of an empty set would erase every row (RC1, RS2).
      const rows = state.rows;
      const kept = keep(rows, state.unread);
      const salt = random(16);
      const key = await derive(pin, salt, ITERATIONS);
      const row = {
        key: 'lock', salt: b64(salt), iterations: ITERATIONS, check: await seal(key, 'meta', 'lock', CHECK),
        autoLockMin: minutes(opts && opts.autoLockMin), setAt: new Date().toISOString(),
      };
      const puts = (await sealAll(rows, key)).concat(kept.puts);
      puts.push(['meta', 'lock', row]);
      await write({ clear: true, puts, dels: [] });
      state.lock = row;
      if (epoch !== state.epoch) return; // locked meanwhile: it opens with the new PIN
      opened(key);
      try { await takeIn(key); } catch (e) { /* tried again at the next unlock */ }
      notify('lock');
    });
  }

  // A stale snapshot from a fallback session must not stay readable beside a PIN (RS1). When a key is in hand in
  // IndexedDB (lock.set, unlock), the snapshot's rows this device lacks are sealed in and the snapshot goes; a row that
  // will not open with this key stays behind in it, sealed. Without a PIN the snapshot is left as it is.
  async function takeIn(key) {
    const ls = state.mode === 'indexeddb' && key ? storage() : null;
    const snap = ls && readSnapshot(ls);
    if (!snap) return;
    const puts = [];
    const left = {};
    for (const n of NAMES) {
      for (const r of Array.isArray(snap[n]) ? snap[n] : []) {
        const id = r && r[STORES[n]];
        if (typeof id !== 'string' || (n === 'meta' && id === 'lock') || state.rows[n].has(id)) continue;
        let v = r;
        if (r.enc) {
          try { v = await unseal(key, n, id, r.enc); } catch (e) { (left[n] = left[n] || []).push(r); continue; }
        }
        puts.push([n, id, v, await stored(key, n, id, v)]);
      }
    }
    if (puts.length) {
      await write({ clear: false, puts: puts.map(([n, id, , s]) => [n, id, s]), dels: [] });
      for (const [n, id, v] of puts) state.rows[n].set(id, v);
    }
    if (Object.keys(left).length) ls.setItem(SNAPSHOT, JSON.stringify({ app: '1-addic', v: 1, stores: left }));
    else ls.removeItem(SNAPSHOT);
  }

  // Another tab changed the lock (or erased the data): this tab takes the stored state as it now is, locked when a
  // lock is stored.
  async function resync() {
    const all = await state.backend.readAll();
    const L = lockOf(all);
    state.epoch += 1;
    state.key = null;
    disarm();
    state.lock = L ? clone(L) : null;
    state.locked = !!L;
    const d = L ? null : await decode(all, null);
    state.rows = d ? d.rows : blank();
    state.unread = d ? d.unread : blank();
    if (L) call(state.lockSubs, { reason: 'auto' });
    notify(L ? 'lock' : 'unlock');
  }

  function unlock(pin) {
    return run(async () => {
      await load();
      // The stored lock row decides: another tab may have changed the PIN since this tab loaded.
      if (state.locked && lockId(lockOf(await state.backend.readAll())) !== lockId(state.lock)) await resync();
      if (!state.lock) return false;
      const key = await keyFor(pin);
      if (!key) return refused();
      if (!state.locked) { state.fails = 0; return true; }
      const d = await decode(await state.backend.readAll(), key);
      state.rows = d.rows;
      state.unread = d.unread;
      opened(key);
      try { await takeIn(key); } catch (e) { /* tried again at the next unlock */ }
      notify('unlock');
      return true;
    });
  }

  async function verify(pin) {
    await load();
    if (!state.lock) return false;
    if (!(await keyFor(pin))) return refused();
    state.fails = 0;
    return true;
  }

  function remove(pin) {
    return run(async () => {
      await load();
      if (!state.lock) return false;
      const key = await keyFor(pin);
      if (!key) return refused();
      const d = state.locked ? await decode(await state.backend.readAll(), key) : { rows: state.rows, unread: state.unread };
      const rows = d.rows;
      const kept = keep(rows, d.unread);
      await write({ clear: true, puts: (await sealAll(rows, null)).concat(kept.puts), dels: [] });
      state.epoch += 1;
      state.rows = rows;
      state.unread = kept.left;
      state.lock = null;
      state.key = null;
      state.locked = false;
      state.fails = 0;
      disarm();
      notify('unlock');
      return true;
    });
  }

  return {
    STORES, load, view, commit, subscribe: (fn) => listen(state.subs, fn), bulk, status, exportJson, replaceAll, resetAll,
    lock: {
      set: setLock, unlock, verify, remove, lockNow: () => lockNow('manual'), touch,
      onLock: (fn) => listen(state.lockSubs, fn),
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Store;
