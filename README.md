# FactBuilder — Factory Designer & Production Rate Calculator

A web-based UI for designing Factorio-style production setups and instantly seeing
what they produce and consume. Built per `prompt.md`.

## Running it (no install required)

The app is a **zero-dependency static web app**: plain ES-module JavaScript,
no build step, no npm packages, and no CDN. It includes a small Node static
server, so it does not depend on a separate Python installation.

- Double-click **`start_app.bat`**, or run:

  ```
  node server.mjs
  ```

  then open <http://localhost:8123>.

> A server is required because the app uses ES modules (browsers block them on
> `file://`). Any static server works.

## Features

- **Three-panel layout** — searchable library (entities, recipes, items, category
  filters) · 300×300 tile canvas · inspector/statistics panel. Entities are
  placed at normal quality; change quality per entity in the inspector.
- **Canvas** — pan (middle mouse / Space+drag), zoom (wheel), grid toggle,
  drag-and-drop or click-to-place placement (a ghost of the entity follows the
  cursor), left-click-drag to move placed entities, rotate (R), delete,
  duplicate (Ctrl+D), copy/paste (Ctrl+C/V, paste follows mouse), undo/redo
  (Ctrl+Z / Ctrl+Shift+Z), shift-click multi-select, rectangle selection,
  right-click context menus, zoom-to-fit. Multiple designs open at once in
  **tabs**. Entities snap to whole tiles and each tile holds at most one
  entity — footprints never overlap.
- **Rate calculator** — a button at the bottom-right of the canvas lets you
  drag a zone; everything inside the zone is aggregated into a
  production/consumption table (like Factorio's Rate Calculator mod).
- **Production engine** — rates come entirely from what is laid out on the
  canvas: each placed machine contributes `recipe rate × quality × modules`.
  All internal math is items-per-second at full precision; rounding happens
  only at display time. Display units: /s, /min, /h.
- **Space Age machines** — foundry, electromagnetic plant, biochamber,
  cryogenic plant, chemical plant, oil refinery, centrifuge, recycler, lab,
  biolab, and rocket silo, with representative recipe chains (molten-metal
  casting, oil → plastic → circuits → modules, uranium processing, recycling,
  research). Entity dimensions, speeds, energy, and productivity are verified
  against the Factorio wiki (2.0 / Space Age). Foundry / EM plant / biochamber
  carry their +50% built-in productivity; the biolab's 50% science-pack drain
  is modeled as +100% productivity.
- **Modules** — each machine has module slots (per its real counterpart);
  slot Speed / Productivity / Efficiency modules 1–3 in the inspector.
  Effects flow through crafting speed, output productivity, and power draw
  (floored at 20% of base, as in the game). Multi-select offers a
  fill-all-slots shortcut.
- **Tables** — selected-entities table and total-design table with
  Consumption / Production / Net columns, search, sort, and
  All / Inputs / Outputs / Balanced filters. Factory-wide stats: entity count,
  net inputs/outputs, balanced items, total power.
- **Persistence** — localStorage autosave of the whole workspace and named
  saves (Save / Load). JSON export/import exists in the backend
  (`src/store/persist.js`) but is not currently exposed in the UI.
- **Inspector** — selecting a machine shows its modules, a quality picker
  (below modules, above rates), live rates, and a visual recipe grid: click a
  recipe icon to assign it.
- **Mobile / touch** — on narrow screens (phones) the side panels become
  slide-up sheets behind a bottom nav bar. One-finger drag pans (or moves an
  entity), two-finger pinch zooms, long-press opens the context menu, and
  tapping a library card attaches the entity to your finger — tap the canvas
  to place it. Respects iPhone safe areas / notch.

## Architecture

```
index.html, styles.css        shell + theme
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
- React/TS/Vite were unavailable without Node; the module layout mirrors that
  architecture so a port is mechanical.
