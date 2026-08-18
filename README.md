# FactBuilder — Factory Designer & Production Rate Calculator

A web-based UI for designing Factorio-style production setups and instantly seeing
what they produce and consume. Built per `prompt.md`.

## Running it (no install required)

Node.js was not available in this environment, so the app is a **zero-dependency
static web app**: plain ES-module JavaScript, no build step, no npm packages, no CDN.
It only needs a static file server, which Python provides out of the box.

- Double-click **`start_app.bat`**, or run:

  ```
  py -m http.server 8123
  ```

  then open <http://localhost:8123>.

> A server is required because the app uses ES modules (browsers block them on
> `file://`). Any static server works.

## Features

- **Three-panel layout** — searchable library (entities, recipes, items, category
  filters, quality picker) · 300×300 tile canvas · inspector/statistics panel.
- **Canvas** — pan (middle mouse / Space+drag), zoom (wheel), grid + snap toggles,
  drag-and-drop placement, move, rotate (R), delete, duplicate (Ctrl+D),
  copy/paste (Ctrl+C/V, paste follows mouse), undo/redo (Ctrl+Z / Ctrl+Shift+Z),
  shift-click multi-select, rectangle selection, right-click context menus,
  zoom-to-fit. Multiple designs open at once in **tabs**.
- **Production engine** — every machine contributes
  `machine count × recipe rate × modifiers`; quality tiers modify crafting speed;
  speed/productivity bonuses model modules & beacons. All internal math is
  items-per-second at full precision; rounding happens only at display time.
  Display units: /s, /min, /h.
- **Tables** — selected-entities table and total-design table with
  Consumption / Production / Net columns, search, sort, and
  All / Inputs / Outputs / Balanced filters. Factory-wide stats: entity count,
  net inputs/outputs, balanced items, total power.
- **Persistence** — localStorage autosave of the whole workspace, named saves
  (Save / Load), and versioned JSON export/import (`{"version": 1, ...}`).

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

- **Modules/beacons** are modeled as numeric *Speed bonus %* and *Productivity %*
  fields rather than discrete module slots.
- **Energy** is displayed (per machine and factory-wide) but not editable.
- Alignment tools (optional in the prompt) were skipped.
- React/TS/Vite were unavailable without Node; the module layout mirrors that
  architecture so a port is mechanical.
