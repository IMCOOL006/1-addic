# FIX-STALE-SAVE-KEEP

FIX-STALE-SAVE-KEEP (core, flagged: the person's data, two reviewers; after offline-v3.3; R-H-61 named it, R-H-62: the words are the shortest true ones, a wording question goes to the owner by outbox with its default; RS2, LOW; base e167f71a).

TODAY.
- RS2: should the lost-save words stay until unlock? Default kept: the 4.5 s toast.
- A stale refusal: store.js:755 tells onLock { reason: 'auto', stale: true }; ui-core.js:1053-1059 calls sayStale() (:172-176: one warn toast, role alert, gone after 4.5 s at :166) and go('#/lock', { replace: true }). In SOS: no toast, no move (:1055).
- No lock stored (store.js:756): notice { stale: true }; heard() (ui-core.js:919-921) calls sayStale() outside SOS, and the person stays on the page. A store render later redraws main (:914).
- The lock page is drawn by ui-onboarding.js:291 (actions-sos's file; core's file has only lockFallback, ui-core.js:796; the lock section is drawn at :826). Nothing on either page says the change was lost once the toast leaves. #toasts (shell.html:29, aria-live polite) sits outside main.

KEEP. The refusal itself, no retry, no entry kept anywhere. sayStale's words and its one-toast rule (hushed). Nothing in SOS, ever: no line, no toast. The lock page's own contents and ui-onboarding.js untouched. Urgent help stays one tap (SOS button in the header, the lock page's own link). Nothing stored: the flag lives in memory only.

WANT (smallest true version, inside core's files only).
1. shell.html: one element after the header, outside main: `<p id="kept" class="kept" hidden></p>` right after </header>, so before #sos-btn and #nav (shell.html:13-14). It is a plain, non-live line (no role=status, no aria-live): sayStale's role=alert toast in #toasts (aria-live polite) is the one announcement; the line is what stays visible. styles.css (append-only, territory.json:124-129): add rules only at the end, under /* -- core -- */: a plain block line, normal flow, never fixed or over the header, SOS button or nav; and `.kept[hidden] { display: none; }` so the block rule does not beat [hidden].
2. ui-core.js: a module flag `keptStale`. sayStale() sets it and calls a small `showKept()` that fills #kept with the same words as the toast, from one shared constant with sayStale's text ("This notebook changed in another tab, so your last change was not saved.", ui-core.js:173, pinned by STALE_WORDS at store.test.mjs:830), and unhides it. One constant, so one wording. Both paths (lock and no-lock) go through sayStale, so one place.
3. chrome(key): #kept is hidden when key is 'sos'; otherwise shown while keptStale. Its text is set once, when the flag is raised.
4. Cleared (flag off, hidden, text emptied): when the notebook is unlocked (the person leaves '#/lock' for another page); in the no-lock case on the first route render to a different path; at reload (memory only). It stays through store renders of the same page.
5. The toast stays as is (the first, loud notice); the kept line is the one that remains.
6. Screen-reader pass (same unit): a probe under C:/Users/ruchi/1-addic-wt/_logs/reports/core/ (core__stale-sr.probe.mjs, log core__stale-sr.log), real Chrome at 390 px through offline/tests/helpers/launch.mjs on a fresh build, offline, two pages over one profile with a PIN, tab B restores a backup, tab A saves. It records: the toast's role, its aria-live parent and text; #kept's (non-live) text and whether it is hidden on '#/lock' and in SOS; after FIX-SOS-FOCUS's move (Back/Forward on '#/sos/craving' and '?from=lock'): document.activeElement, main's tabindex (-1) and its accessible name (aria-label or the h1). A finding: fix in core's files if a line or two, else a named LOW; one needing ui-onboarding.js or ui-sos.js is an outbox ask to actions-sos.

TESTS (store.test.mjs, names start 'FIX-STALE-SAVE-KEEP'; ui-core stand-ins as in 11f2f70's e2e: a stand-in Store as in bootToLock / bootWithNotice, the real ui-core, mocked setTimeout (bootPending, :698; advance with t.mock.timers.tick); add ['kept', 'p'] to the stand-in id list at store.test.mjs:194-195 (shell.html is not loaded in Node), optionally a text check that shell.html has id="kept" outside main like the V-11 tests):
(a) 'FIX-STALE-SAVE-KEEP: a stale refusal on a page puts the kept line in #kept, and it is still there after the toast time and after a lock page draw'. Red before: no #kept; call t.mock.timers.tick(4500) to pass the toast time; mutant: drop the showKept() call.
(b) '... no lock stored: the notice shows the line, a store render keeps it, a route to another path clears it'. Mutant: clear on store render.
(c) '... inside SOS no line is shown, and a line raised outside SOS is hidden on a route to SOS'. Mutant: skip the hide in chrome().
(d) '... unlock clears the line; a lock without stale never shows it'. Mutant: never clear.
(e) '... one refused save gives one toast and one line' (keep the FIX-STALE-SAVE-SAY tests green by name).

DONE WHEN: npm run build; npm test (store.test.mjs counts up by the new tests, 0 fail); the lock, SOS and PIN browser flows on the built file (the HUB's run); the probe log written and read by the HUB; reviewers' two passes.

INTERACTIONS. FIX-BULK-REFUSAL-SAY and FIX-TAKEIN-SAY change which refusals say the words; this unit only keeps the line for a refusal that already calls sayStale(). If they route more refusals through sayStale(), the line follows. If takeIn's rare false alarm (R-H-61 item 2) is fixed, no line appears for it. One sayStale; the line and the toast share one constant.

OUT OF SCOPE. Any change to ui-onboarding.js, ui-sos.js, ui-track.js or the Store's behavior; a retry or a draft of the lost entry; a dismiss button; V3.3-T1 (tests-docs).

OWNER QUESTIONS (by outbox, with the default built).
1. The words. Default: the toast's existing words, shared by line and toast (grade 6, names no PIN or backup). A change of words is put to the owner as a change to both.
2. How long. Default: until unlock (lock case) or until the person goes to another page (no-lock case); no button.
3. If the HUB wants the line inside the lock page's own box: that is actions-sos's file (ui-onboarding.js:291) and needs an outbox ask; the default is the shell line above, which needs no edit there.
