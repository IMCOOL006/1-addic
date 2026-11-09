# 1-addic, offline edition

1-addic is a private recovery-skills app in **one file**, `offline/1-addic.html`. It opens in a web browser on a phone or a computer. It needs no internet, no install, no account and no server. Everything you type stays inside the browser on that one device.

> **Early access.** This is an early test version. It is a set of skills and a notebook, not medical or clinical care. If you are in danger or may hurt yourself, open **SOS** and use the urgent-help numbers, or call your local emergency number.

## Build the file

You need Node 22 or later.

```
node offline/build.mjs      # or: npm run build
```

This joins the parts in `offline/src/` into `offline/1-addic.html` and prints its size. The file carries a Content-Security-Policy that blocks every network request (`connect-src 'none'`), so the app cannot send anything anywhere, even by mistake.

## Put it on a phone

1. Copy `offline/1-addic.html` to the phone: a USB cable, a memory card, or a file share you trust. Put it in the **Download** folder.
2. Open the **Files** app (or **My Files**), find `1-addic.html` and tap it. Choose **Chrome** if the phone asks which app to use.
3. If Files will not open it, open Chrome and type this in the address bar, then press Go:

   ```
   file:///sdcard/Download/1-addic.html
   ```

   Chrome keeps it in its history, so next time it is a few taps away.

On a computer, double-click the file, or drag it onto a Chrome or Edge window.

Always open the file from the **same place, in the same browser**. The browser keeps your data for that file; a copy in another folder, another browser or a private window starts empty.

## What the saved label means

The top bar always says where your data is.

The app tries the browser's main storage first, then a simpler one, then memory only. Which label you see depends on the browser and the way the file was opened.

| The label says | What it means | What to do |
|---|---|---|
| **Saved on this device** | The browser's storage (IndexedDB) holds your data. It is there when you open the file again. | Nothing, apart from a weekly backup. |
| **Saved (fallback)** | The main storage was not available, so a simpler browser storage holds your data. | Export a backup now and then; open the file in a normal Chrome window when you can. |
| **Not saved — export before closing** | The browser is blocking storage (often a private window, or a restricted way of opening the file). Your data lives **only in memory**: closing the tab loses it. | Export a backup before you close the tab, then open the file in a normal browser window and import it. |

## Back up

Your data never leaves the device on its own, so a backup is the only copy that can survive a lost phone or a cleared browser. In **Settings → Your data**, tap **Save a backup file** and keep the file somewhere safe. To restore, on this device or a new one, use **Bring back a backup** and choose the file: it replaces everything on this device, and you are asked first.

If you have a PIN, saving a backup asks for it. The backup file itself is not locked by the PIN, so keep it somewhere private.

## The PIN

A PIN is offered, never forced. Set one in **Settings → Privacy** (4 to 12 digits): your notes are then locked on this device and open only with it. The lock screen still reaches urgent help without the PIN. A forgotten PIN cannot be recovered: erase the notebook from the lock screen, then bring back your latest backup.

## Privacy

- No network: the file makes no requests, and the browser is told to refuse them.
- No trackers, no analytics, no ads, no account.
- Contacts, logs and notes stay in this browser on this device. Nothing is sent, synced or shared.
- Discreet mode (**Settings → Privacy**) shows the name "Notebook", labels SOS as "Help" and hides the day counters.

## Urgent-help numbers

**Urgent help** in SOS lists the India numbers and an international list (**Elsewhere**: two helpline directories and your local emergency number), each line marked "please verify". Each number is a tap to call. **Every number is unverified until the owner checks it**, before anyone else uses the file. If a number does not work, call your local emergency number.

## What is in this build

**In this build:** onboarding (eight short steps; every one but the safety notice can be skipped), the five tabs (Today, Learn, Workbook, Track, Actions), SOS (craving, feeling, slip and urgent help, one tap from every screen), the practices, tools and games, saving on the device with the saved label, backup and restore, the optional PIN and its lock screen, discreet mode, the light and dark theme, and Settings. **Load sample data** (Settings → Your data) fills the app with made-up entries marked as sample, to try it out; **Erase sample data** removes them and keeps your own entries.

**Not finished yet:** a tool, practice or Actions page whose content is not in this version says so, with a way back, never a dead button.

The guide is `offline/docs/1-addic-Guide.docx`, built from `offline/docs/1-addic-Guide.md`: how to open the file, every screen step by step with a phone screenshot from `offline/docs/images/`, and how the file was checked.

## For developers

| Command | What it does |
|---|---|
| `npm run build` | Builds `offline/1-addic.html` |
| `npm test` | Node tests in `offline/tests/*.test.mjs` (not the browser suite) |
| `npm run test:browser` | Opens the built file in Chrome (or Chromium) offline at 390 px and runs the named flows; skips by name when a browser or a screen is missing |
| `npm run screens` | Writes the guide's screenshots to `offline/docs/images/` from the built file, seeded with the sample data: `<name>-phone.png` (390x844) and `<name>-desktop.png` (1280x800), each at 300 DPI; skips by name when the file, a browser or a screen is missing |
| `npm run check` | Build, Node tests, browser suite and the guide, in that order |
| `python offline/docs/build_guide.py` | Builds the guide `.docx` from `offline/docs/1-addic-Guide.md` |

**The tests (9 November 2026).** `npm test` runs 743 checks in 16 files, `offline/tests/<name>.test.mjs` for actions-ui, actions, content, contrast, engine-data, engine-insights, engine-questline, engine-roadmap, engine-warning-item, game-tutorials, learn, logic, status, store, today-track and workbook-settings: 743 passed and 0 failed. `npm run test:browser` runs the 29 named flows of `offline/tests/browser.test.mjs`; in one full run all 29 passed: "loads offline with zero console errors and zero network requests"; "boots to the first render within the budget"; "phone viewport 390 px has no horizontal scroll"; "five tabs navigate by hash and back works"; "onboarding full"; "onboarding skip-all"; "tour complete"; "tour skip"; "tour replay from Settings Help"; "SOS drill creates no log"; "SOS craving flow offline with delay loop and both outcomes"; "SOS reachable and not gated before onboarding or on lock screen"; "quick log and evening check-in"; "lesson to artifact shown in SOS"; "PIN set lock unlock export"; "Settings PIN set and remove"; "planner add and save"; "discreet lock screen shows Notebook and Help"; "export erase import restores everything"; "dark theme applies and persists"; "print view of the plan"; "saved label is always shown"; "status opens from Today in one tap"; "status shows the change after a quick log"; "status: a slip lowers no light"; "status under reduced motion has no moving class"; "an objective done grows the harbor"; "a break keeps best and total"; "a quest-line step unlocks a feature". A test's name is how a failure is known, so names are kept.

**A kept copy.** `offline/releases/1-addic-v1.1.html` is the file as it was at tag `offline-v1.1` (f69bc68a, 1113578 bytes), kept for comparison later; `offline/releases/README.md` says what it is. To use the app, build your own with `npm run build`.

Layout: `offline/src/` (the parts: shell, styles, content, engine, store, actions, the UI core, the screens and boot), `offline/build.mjs`, `offline/tests/` (Node tests, the browser suite and its helpers), `offline/docs/` (the guide). The decision record is `docs/decisions/0022-offline-edition.md`.
