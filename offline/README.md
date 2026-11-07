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

Always open the file from the **same place, in the same browser**. Once saving arrives (planned: see the last section), the browser keeps your data for that file; a copy in another folder, another browser or a private window starts empty.

## What the saved label means

The top bar always says where your data is.

**In this build** the data layer is not there yet (it is planned), so the label says **Not saved — export before closing**: nothing is kept when the tab closes, and there is no export yet. The table says what each label means once saving arrives.

| The label says | What it means | What to do |
|---|---|---|
| **Saved on this device** | The browser's storage (IndexedDB) holds your data. It is there when you open the file again. | Nothing, apart from a weekly backup. |
| **Saved (fallback)** | The main storage was not available, so a simpler browser storage holds your data. | Export a backup now and then; open the file in a normal Chrome window when you can. |
| **Not saved — export before closing** | The browser is blocking storage (often a private window, or a restricted way of opening the file). Your data lives **only in memory**: closing the tab loses it. | Export a backup before you close the tab, then open the file in a normal browser window and import it. |

## Back up (planned)

Export, import and the PIN arrive with the data layer and the Settings screen; none of them is in this build yet. This is how they will work.

Your data never leaves the device on its own, so a backup is the only copy that can survive a lost phone or a cleared browser. In **Settings → Your data** you will export a backup file and keep it somewhere safe, and import it to restore everything on this device or a new one. If you set a PIN, the export will ask for it.

The PIN will be offered, never forced. A forgotten PIN cannot be recovered: the way back is to erase and import your latest backup.

## Privacy

- No network: the file makes no requests, and the browser is told to refuse them.
- No trackers, no analytics, no ads, no account.
- Contacts, logs and notes stay in this browser on this device. Nothing is sent, synced or shared.
- Discreet mode shows the name "Notebook" and labels SOS as "Help". Its switch arrives with the Settings screen (planned).

## Urgent-help numbers

In this build SOS shows the India urgent-help numbers, each one a tap to call, under the note "India numbers: please verify", and a line for anyone elsewhere. **Every number is unverified until the owner checks it**, before anyone else uses the file. The full SOS screen, with an international list, is planned. If a number does not work, call your local emergency number.

## What is in this build, and what is planned

**In this build today:** the shell with its five tabs (a tab whose screen has not landed says "coming soon", and Today is a placeholder), the SOS button and the urgent-help page (it works with no other screen loaded), the saved label, the light and dark theme (the browser remembers your choice), and the content, engine and actions parts that the screens will use.

**Planned:** the data layer (saving on the device, the optional PIN, export and import), Settings (Your data, the discreet mode switch, Load sample data), onboarding, the full SOS screen and the other screens. They arrive one by one; a screen that is not ready says so ("coming soon", a stub with one real action, or locked with one line on what it will be), never a dead button. The guide is `offline/docs/1-addic-Guide.docx`: a skeleton today, with its tutorial lessons planned for the next tag.

## For developers

| Command | What it does |
|---|---|
| `npm run build` | Builds `offline/1-addic.html` |
| `npm test` | Node tests in `offline/tests/*.test.mjs` (not the browser suite) |
| `npm run test:browser` | Opens the built file in Chrome (or Chromium) offline at 390 px and runs the named flows; skips by name when a browser or a screen is missing |
| `npm run screens` | Writes the guide's screenshots to `offline/docs/images/` from the built file, seeded with the sample data: `<name>-phone.png` (390x844) and `<name>-desktop.png` (1280x800), each at 300 DPI; skips by name when the file, a browser or a screen is missing |
| `npm run check` | Build, Node tests, browser suite and the guide, in that order |
| `python offline/docs/build_guide.py` | Builds the guide `.docx` from `offline/docs/1-addic-Guide.md` |

Layout: `offline/src/` (the parts: shell, styles, content, engine, actions, the UI core and boot today; the store and the screens are planned), `offline/build.mjs`, `offline/tests/` (Node tests, the browser suite and its helpers), `offline/docs/` (the guide). The decision record is `docs/decisions/0022-offline-edition.md`.
