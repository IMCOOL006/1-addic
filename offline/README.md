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

| The label says | What it means | What to do |
|---|---|---|
| **Saved on this device** | The browser's storage (IndexedDB) holds your data. It is there when you open the file again. | Nothing, apart from a weekly backup. |
| **Saved (fallback)** | The main storage was not available, so a simpler browser storage holds your data. | Export a backup now and then; open the file in a normal Chrome window when you can. |
| **Not saved — export before closing** | The browser is blocking storage (often a private window, or a restricted way of opening the file). Your data lives **only in memory**: closing the tab loses it. | Export a backup before you close the tab, then open the file in a normal browser window and import it. |

## Back up

Your data never leaves the device on its own, so a backup is the only copy that can survive a lost phone or a cleared browser. In **Settings → Your data**, export a backup file and keep it somewhere safe. Import it to restore everything on this device or a new one. If you set a PIN, the export asks for it.

A PIN is offered, never forced. A forgotten PIN cannot be recovered: the way back is to erase and import your latest backup.

## Privacy

- No network: the file makes no requests, and the browser is told to refuse them.
- No trackers, no analytics, no ads, no account.
- Contacts, logs and notes stay in this browser on this device. Nothing is sent, synced or shared.
- Discreet mode shows the name "Notebook" and labels SOS as "Help".

## Urgent-help numbers

SOS shows urgent-help numbers for India and an international list. **Every number is marked "please verify"**: the owner checks them before anyone else uses the file. If a number does not work, call your local emergency number.

## What is in this tag, and what is planned

The shell, the five tabs, SOS with its urgent-help fallback, the saved label, the theme and discreet mode, and the data layer (storage, the optional PIN, export and import) are the base of the tag. Other screens arrive lane by lane; a screen that is not ready says so ("coming soon", a stub with one real action, or locked with one line on what it will be), never a dead button. The full guide is `offline/docs/1-addic-Guide.docx` (its tutorial lessons are planned for the next tag).

## For developers

| Command | What it does |
|---|---|
| `npm run build` | Builds `offline/1-addic.html` |
| `npm test` | Node tests in `offline/tests/*.test.mjs` (not the browser suite) |
| `npm run test:browser` | Opens the built file in Chrome (or Chromium) offline at 390 px and runs the named flows; skips by name when a browser or a screen is missing |
| `npm run screens` | Planned (U-35): writes the guide's screenshots to `offline/docs/images/` |
| `npm run check` | Build, Node tests, browser suite and the guide, in that order |
| `python offline/docs/build_guide.py` | Builds the guide `.docx` from `offline/docs/1-addic-Guide.md` |

Layout: `offline/src/` (the parts: shell, styles, content, store, engine, actions, screens, boot), `offline/build.mjs`, `offline/tests/` (Node tests, the browser suite and its helpers), `offline/docs/` (the guide). The decision record is `docs/decisions/0022-offline-edition.md`.
