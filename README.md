# FactBuilder — Factory Designer & Production Rate Calculator

A web-based UI for designing Factorio-style production setups and instantly seeing
what they produce and consume. Built per `prompt.md`.

## Running it

**Online:** the app is deployed from `main` via GitHub Pages at
<https://harryahnhj.github.io/fact-builder/>.

**Locally:** it's a **zero-dependency static web app** — plain ES-module
JavaScript, no build step, no npm packages, no CDN. Any static file server
works (one is required because browsers block ES modules on `file://`):

```
node server.mjs          # bundled static server → http://localhost:8123
```

or `python -m http.server 8123`, or any equivalent. On Windows,
`start_app.bat` opens the browser and starts a server — note it currently
expects a repo-local Python venv (`venv\Scripts\python.exe`).

**Checks:** `npm run check` (syntax-checks the server and core modules) and
`npm test` (runs `tests/core.test.mjs`). Both need only Node — no installs.

## Features

### Designing
- Three-panel layout: searchable library · 300×300-tile canvas · inspector / statistics panel.
- Place entities by drag-and-drop or click-to-place — a ghost of the entity follows the cursor.
- Entities snap to whole tiles; footprints never overlap.
- Move (drag), rotate (<kbd>R</kbd>), duplicate (<kbd>Ctrl+D</kbd>), copy/paste (<kbd>Ctrl+C/V</kbd>), undo/redo (<kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Shift+Z</kbd>).
- Shift-click multi-select, rectangle selection, right-click context menus.
- Pan (middle mouse / <kbd>Space</kbd>+drag), zoom (wheel), grid toggle, zoom-to-fit.
- Multiple designs open at once in tabs.

### Machines (Factorio 2.0 / Space Age)
- Furnaces and assemblers, plus the Space Age production roster: foundry, electromagnetic plant, biochamber, cryogenic plant, chemical plant, oil refinery, centrifuge, recycler, lab, biolab, and rocket silo.
- **145 recipes / 129 items**, using the game's real crafting categories — each machine offers exactly the recipes in its categories, the same rule the game uses. Recipes craftable by two machine types (belts in an assembler *or* a foundry, circuits in an assembler *or* an EM plant) carry both categories.
- Full chains for every production machine: metallurgy casting, electromagnetics (superconductors → supercapacitors → science), Gleba organics (yumako/jellynut → bioflux → bioplastic, bacteria cultivation), cryogenics (fluoroketone, lithium, fusion cells), oil and chemistry, uranium centrifuging, recycling, and all nine science packs modeled here.
- Dimensions, speeds, energy, module slots, ingredients and crafting times verified against the official prototype data in [wube/factorio-data](https://github.com/wube/factorio-data), cross-checked with the wiki. `tests/gamedata.test.mjs` pins the per-machine recipe counts so the data can't silently drift.
- Excluded by design: weapons/ammo, mining machines, and space-platform-only recipes.
- Foundry / EM plant / biochamber carry their +50% built-in productivity; the biolab's 50% science-pack drain is modeled as +100% productivity.
- Per-entity quality (Normal → Legendary), set in the inspector; entities are placed at normal quality.

### Modules
- Each machine has module slots per its real counterpart.
- Slot Speed / Productivity / Efficiency modules 1–3 in the inspector.
- Effects flow through crafting speed, output productivity, and power draw (floored at 20% of base, as in the game).
- Multi-select offers a fill-all-slots shortcut.

### Rates
- Rates derive entirely from what is laid out on the canvas: each machine contributes `recipe rate × quality × modules`.
- All internal math is items-per-second at full precision; rounding happens only at display time. Display units: /s, /min, /h.
- **Rate-calculator zone** (button at the bottom-right of the canvas): drag a zone and everything inside is aggregated into a production/consumption table, like Factorio's Rate Calculator mod.
- Inspector shows live per-machine rates and a visual recipe grid — click a recipe icon to assign it.
- Selected-entities and total-design tables with Consumption / Production / Net columns, search, sort, and All / Inputs / Outputs / Balanced filters.
- Factory-wide stats: entity count, net inputs/outputs, balanced items, total power.

### Mobile / touch
- On narrow screens the side panels become slide-up sheets behind a bottom nav bar.
- One-finger drag pans (or moves an entity); two-finger pinch zooms; long-press opens the context menu.
- Tap a library card to attach the entity to your finger, then tap the canvas to place it.
- Respects iPhone safe areas / notch.

### Persistence
- localStorage autosave of the whole workspace, plus named saves (Save / Load).
- JSON export/import exists in the backend (`src/store/persist.js`) but is not currently exposed in the UI.

## Architecture

```
index.html, styles.css        shell + theme
server.mjs                    bundled Node static server (dev convenience)
tests/core.test.mjs           engine/data tests (node --test)
src/dom.js                    tiny DOM builder (no framework)
src/data/gamedata.js          items / recipes / machines / qualities (pure data)
src/data/seed.js              first-launch demo design
src/engine/rates.js           calculation engine (pure functions, no UI imports)
src/store/createStore.js      minimal observable store
src/store/appStore.js         app state + actions (tabs, selection, undo/redo…)
src/store/persist.js          autosave, named saves, JSON export/import
src/ui/…                      toolbar, tabs, library, canvas, inspector,
                              rates table, context menu, modal, toast, keyboard
```

The engine and data model have no UI dependencies, so the full Factorio dataset
can be added by extending `gamedata.js` (or loading generated JSON into the same
shapes), and the UI could later be ported to React/TypeScript/Vite without
touching the engine.

## Simplifications vs the prompt

- Manual rate modifiers (machine count, speed bonus %, productivity %) were
  removed — all rates derive from placed entities, their quality, and their
  slotted modules.
- **Energy** is displayed (per machine and factory-wide) but not editable.
- Alignment tools (optional in the prompt) were skipped.
- The UI is intentionally framework-free (no React/TS/Vite build); the module
  layout mirrors that architecture so a port is mechanical.
