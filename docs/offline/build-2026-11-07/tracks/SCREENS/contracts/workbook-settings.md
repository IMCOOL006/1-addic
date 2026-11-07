# Contract · lane workbook-settings (read at 1ef2482e; AS = build/actions-sos)

## Exposed by the lane
| Name | Shape | Consumer |
|---|---|---|
| `UI.pages.settings` | `(ctx) => Node`; routes `#/settings`, `#/settings/<tab>`, tab in privacy, look, rhythm, names, help, about, data | ui-core router; today (link), onboarding (link to PIN) |
| `UI.pages.workbook` | `(ctx) => Node`; routes `#/workbook`, `#/workbook/<artifact>` (3.5 list), `#/workbook/reasons?big=1`, `#/workbook/network`, `#/workbook/plan` | ui-sos (links `#/workbook/motivation`, `#/workbook/plan`), today-track, learn |
| `SettingsUI` (global const, ui-settings.js) | `.page(ctx) -> Node`; pure helpers on `module.exports`: `normalTab(t)`, `pinOk(s) -> bool (4-12 digits)`, `backupName(date) -> '1-addic-YYYY-MM-DD.json'`, `logRows(logs) -> rows`, `ERASE_PARTIAL_TEXT` | tests only |
| `WorkbookUI` (ui-workbook.js) | `.page(ctx)`, `.reasonsSections(view) -> {quick,drawbacks,benefits,different}`, `.wrapLines(text, maxChars) -> string[]`, `.ARTIFACTS` (id -> {exerciseIds, group, practiseRoute?, sensitive?}), `.GROUPS` | tests, PlanUI |
| `PlanUI` (ui-plan.js) | `.view(ctx) -> Node`; `.merge(saved, prefill) -> sections` (adds, never drops); `.SECTIONS` = [motivation, wellness, situation, people, mood, triggers, warnings, battlePlans, support] | ui-workbook |
| Events written | none new; through Actions: ContactReached, ScriptUsed, RecoveryPlanConfirmed, ArtifactSaved (by the exercise page) | engine |
| Content keys | none added (uses `Content.help`, `.references`, `.discreetName`, `.version`, `.build`, `.exercises`, `.sample`, `.terms`, `.paces`) | content |

## data-tour targets (guards gate): workbook-groups (#/workbook container), workbook-card (first artifact card), plan-sections (plan sections container), plan-print (plan print button).

## DOM hooks (data-test; tests-docs adds to helpers/hooks.mjs by outbox)
settings-tab-<tab>, set-pin, pin-input, pin-input2, pin-save, remove-pin, lock-now, auto-lock, export-btn, import-file, erase-all, erase-sample, load-sample, print-logs, theme-<value>, discreet-toggle; reasons-card, reasons-big, reasons-export, contact-add, contact-<id>, reached-<id>; workbook-group-<id>, workbook-card-<artifact>, artifact-edit, artifact-history, artifact-print, risks-reveal; plan-section-<id>, plan-confirm-<id>, plan-save, plan-print, plan-refresh. Consumer: tests-docs (browser flows: PIN set/lock/unlock/export; export -> erase -> import; plan print).

## Relied on, present at BASE (1ef2482e)
- `Actions.settings.patch(obj)` actions.js:233 (rules :169-173); `Actions.onboard(patch)` :209; `Actions.contacts.add/update/deactivate/reached` :509-540; `Actions.recoveryPlan.save(sections,{confirm})` ~:870; `Actions.scriptUsed(responseId)` ~:885; `Actions.saveResponse` :453; `Actions.loadSample()` ~:870 (BASE returns {sample,count}); `Actions.eraseAll()` ~:848 (rejects ERASE_PARTIAL from Store); `Actions.importBackup(obj)` :~822 (throws bad-backup with errors[]; Store.replaceAll by Actions only).
- `Store.status()` {persistence,lastSavedAt,hasLock,locked,autoLockMin,unreadable} store.js:509; `Store.lock.set(pin,{autoLockMin})` :658, `unlock`, `verify` :749, `remove` :757, `lockNow`, `touch`, `hold`; codes BAD_PIN, NO_CRYPTO, LOCKED, STALE, ERASE_PARTIAL (:586); `Store.view.get/list`.
- `Engine.reasonsCard` engine.js:698, `latest` :676, `history` :680, `comebacks` :710, `distractionDeck` :712, `prefillRecoveryPlan(view, now)` :831 -> {<section>:{items,confirmed}}, `exportBackup(view, meta)` :1230, `validateBackup`, `migrateBackup`.
- `UI.h, form, confirm, sheet, toast, card, empty, download, printDoc, applyTheme, applyDiscreet, go, pages` ui-core.js (see brief section 2). Exercise page `#/exercise/<id>?mode=workbook` (ui-exercise.js:865, :972).

## Waits for another lane
- `Actions.eraseSample() -> {erased}` (AS:actions.js:928), and `loadSample() -> {sample,count,skipped}` marking rows `sample:true`: actions-sos merge; feature-detected.
- Content: `Content.sample.generate` (content U-33), exercises beyond M0-M3 (content U-31b), `Content.resources.opioidSafety` etc. (R-C-13 (1)-(4)): stubs honest until then.
- Tour/replay/training entry points (game-tutorials U-27): feature-detected.
- SOS link "Open the card" to `#/workbook/reasons?big=1` (actions-sos follow-up, by outbox).
