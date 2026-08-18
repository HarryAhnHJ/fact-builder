# Build a Factorio Factory Design & Production Rate Calculator UI

Build a web-based UI for designing and analyzing Factorio factory layouts.

## 1. Core Goal

The application should let me visually design a Factorio-style production setup by:

1. Selecting entities/items from a searchable library.
2. Dragging entities onto a large 300 × 300 tile canvas.
3. Clearly distinguishing different entities visually.
4. Moving, rotating, copying, deleting, and duplicating entities.
5. Defining production recipes and machine configurations.
6. Automatically calculating material production and consumption rates.
7. Showing the total production/consumption rate of the selected entities or the entire design.
8. Saving and loading designs.

The visual style does **not** need to reproduce Factorio's actual graphics. Use clean, modern, schematic-style graphics. Prioritize usability, readability, accurate calculations, and fast interaction over visual fidelity.

Think of the application as a combination of:

* Factory layout editor
* Production calculator
* Rate analyzer

Do not try to recreate the Factorio game.

---

## 2. Main UI Layout

Use a three-panel application layout.

### Left Panel — Entity & Recipe Library

Provide:

* Search bar
* Categories
* Entity list
* Item list
* Recipe list
* Machine list

Categories could include:

* Belts
* Inserters
* Assemblers
* Furnaces
* Mining
* Power
* Pipes
* Storage
* Logistics
* Production
* Intermediate products
* Science
* Other

Each entity should have:

* Name
* Icon
* Type
* Quality (Normal, Uncommon, Rare, Epic, Legendary)
* Relevant stats
* Recipe(s)
* Production/consumption information

Quality should be represented in the data model and UI, and should support production modifiers where applicable.

The library should support drag-and-drop onto the canvas.

### Center Panel — Design Canvas

Create a fixed **300 × 300 tile** 2D canvas.

The canvas should support:

* Pan
* Zoom
* Grid
* Snap-to-grid
* Entity placement
* Dragging
* Rotation
* Selection
* Multi-selection
* Copy/paste
* Delete
* Duplicate
* Undo/redo
* Rectangle selection
* Optional alignment tools

Entities should be represented as simple schematic blocks rather than game sprites.

For example:

```text
┌─────────────────────┐
│     ASSEMBLER       │
│                     │
│  Iron Gear          │
│  x2.0 / sec         │
│                     │
│  IN →       → OUT   │
└─────────────────────┘
```

Different entity types should use different shapes or icons so they are immediately distinguishable.

Multiple canvas should be able to be open at the same time on different 'tabs'.

---

## 3. Right Panel — Inspector & Statistics

When nothing is selected, show factory-wide statistics and the total-design production table.

When a single entity is selected, show its properties.

When multiple entities are selected, show:

* Common editable properties where applicable.
* The selected-entities production/consumption table.

Allow editable parameters where appropriate:

* Recipe
* Machine
* Machine count
* Crafting speed
* Modules
* Beacon effects
* Productivity
* Speed
* Energy settings
* Direction
* Input/output configuration

---

## 4. Production Rate System

Every recipe should have structured production data.

Example:

```text
Recipe: Electronic Circuit

Inputs:
Iron Plate: 1
Copper Cable: 3

Outputs:
Electronic Circuit: 1

Crafting time:
0.5 seconds
```

If crafting speed is 1:

```text
Production:
2 Electronic Circuits / second

Consumption:
2 Iron Plates / second
6 Copper Cables / second
```

If crafting speed or modifiers change, automatically recalculate all rates.

Use **items per second** as the internal calculation unit.

---

## 5. Production & Consumption Calculation

Every placed production entity should contribute its recipe's production and consumption rates to the calculation engine.

For each machine:

```text
Machine count × recipe rate × modifiers
```

should determine its total production and consumption.

Allow the UI to display:

* /second
* /minute
* /hour

Do not round values internally. Round only for display.

The calculation engine should aggregate all placed entities independently of their visual positions.

---

## 6. Selected Entities Table

When one or more entities are selected, display a production/consumption table for only those selected entities.

| Item               | Consumption | Production |   Net |
| ------------------ | ----------: | ---------: | ----: |
| Iron Plate         |        10/s |        0/s | -10/s |
| Copper Cable       |        30/s |        0/s | -30/s |
| Electronic Circuit |         0/s |       10/s | +10/s |

Use:

```text
Net = Production - Consumption
```

Interpretation:

* Negative = net consumption
* Positive = net production
* Zero = balanced

The table should update immediately whenever:

* Selection changes.
* Machine count changes.
* Recipe changes.
* Crafting speed changes.
* Modules or modifiers change.

Provide:

* Search/filter by item.
* Sort by item name.
* Sort by consumption.
* Sort by production.
* Sort by net rate.

Optional filters:

```text
[All] [Inputs] [Outputs] [Balanced]
```

---

## 7. Total Design Table

When no entities are selected, display the aggregated production and consumption of the entire design.

| Item               | Consumption | Production |   Net |
| ------------------ | ----------: | ---------: | ----: |
| Iron Ore           |        30/s |        0/s | -30/s |
| Iron Plate         |        20/s |       30/s | +10/s |
| Copper Plate       |        30/s |        0/s | -30/s |
| Copper Cable       |        60/s |       60/s |   0/s |
| Electronic Circuit |         0/s |       20/s | +20/s |

Above the table, show:

```text
TOTAL DESIGN

Entities: 47
Net Inputs: 5
Net Outputs: 3
Balanced Items: 8
```

The table should update immediately whenever the design changes.

A zero net rate means the design produces and consumes the same amount of that item.

---

## 8. Entity Data Model

Create clean data structures for entities, recipes, items, and machines.

### Entity

```text
Entity
├── id
├── name
├── category
├── quality
├── icon
├── width
├── height
├── rotation
├── position
├── type
├── recipes
└── properties
```

### Recipe

```text
Recipe
├── id
├── name
├── craftingTime
├── inputs[]
└── outputs[]
```

### Item

```text
Item
├── id
├── name
├── icon
└── category
```

### Production Machine

```text
Machine
├── id
├── name
├── craftingSpeed
├── energyUsage
├── allowedRecipes
└── modifiers
```

Keep the data layer separate from the UI so the full Factorio dataset can be added later.

---

## 9. Canvas Interaction

Required interactions:

* Drag entities onto the canvas.
* Move entities.
* Rotate with `R`.
* Delete with `Delete` or `Backspace`.
* Duplicate with `Ctrl+D`.
* Copy/paste with `Ctrl+C` and `Ctrl+V`.
* Undo/redo with `Ctrl+Z` and `Ctrl+Shift+Z`.
* Pan with middle mouse or Space + drag.
* Zoom with mouse wheel or trackpad.
* Shift-click for multi-select.
* Rectangle selection.
* Grid and snap toggles.

---

## 10. Context Menu

Right-clicking an entity should provide:

```text
Edit
Duplicate
Rotate
Copy
Delete
Change Recipe
Change Machine
```

Right-clicking empty canvas:

```text
Paste
Select All
Clear Selection
Toggle Grid
Zoom to Fit
```

---

## 11. Save & Load

Support:

```text
New Design
Save
Load
Export
Import
```

Use a versioned JSON format:

```json
{
  "version": 1,
  "entities": [],
  "settings": {}
}
```

Support, if practical:

* Local storage autosave.
* JSON export.
* JSON import.

---

## 12. Calculation Engine

Do not hard-code calculations into UI components.

Use this flow:

```text
Design
   ↓
Rate Calculation
   ↓
Aggregated Inputs/Outputs
   ↓
Selected or Total Table
   ↓
UI
```

The engine should answer:

### Individual Machine

* What does it consume?
* What does it produce?
* At what rate?

### Selected Group

* What does the selection consume?
* What does it produce?

### Entire Design

* What items have net consumption?
* What items have net production?
* What items are balanced?

Keep full precision internally.

---

## 13. Architecture

Separate:

```text
UI
Canvas
Entity Library
Inspector
Statistics
Calculation Engine
Data Model
Persistence
```

The calculation engine should be independent of React/UI state.

---

## 14. Technology

Prefer:

* React
* TypeScript
* Vite
* A suitable canvas/diagram library
* Tailwind or CSS
* Zustand or similar lightweight state management

Choose a canvas library that supports zoom, pan, dragging, selection, and custom node rendering.

Do not build a canvas engine from scratch unless necessary.

---

## 15. Visual Design

Use a professional engineering/planning style:

* Dark mode by default.
* Clear contrast.
* Compact controls.
* Simple icons.
* Consistent spacing.
* Minimal clutter.

Do not copy Factorio's pixel-art aesthetic.

Entities should be distinguishable through shape, icon, name, category, and ports—not color alone.

---

## 16. MVP Priority

### Phase 1 — Core

1. Canvas
2. Grid
3. Entity library
4. Drag/drop
5. Placement
6. Move
7. Delete
8. Rotate
9. Selection
10. Inspector

### Phase 2 — Production

11. Item database
12. Recipe database
13. Machine database
14. Recipe assignment
15. Production-rate calculation
16. Input/output aggregation
17. Selected-entities table
18. Total-design table

### Phase 3 — Persistence

19. Save
20. Load
21. JSON export
22. JSON import
23. Autosave

### Phase 4 — Polish

24. Undo/redo
25. Keyboard shortcuts
26. Multi-select
27. Copy/paste
28. Performance optimization

---

## 17. Important UX Requirement

The application should feel fast.

Typical workflow:

```text
Search "assembler"
       ↓
Drag assembler onto canvas
       ↓
Select recipe
       ↓
Immediately see production and consumption rates
```

Prefer inline editing and contextual controls over modal dialogs.

---

## 18. Initial Demo Data

Include at least:

### Items

* Iron Ore
* Copper Ore
* Iron Plate
* Copper Plate
* Copper Cable
* Iron Gear
* Electronic Circuit

### Machines

* Electric Mining Drill
* Stone Furnace
* Steel Furnace
* Assembling Machine 1
* Assembling Machine 2
* Assembling Machine 3

### Recipes

* Iron Plate
* Copper Plate
* Iron Gear
* Copper Cable
* Electronic Circuit

Use internally consistent data.

---

## 19. Example Expected Behavior

If I place:

```text
1 × Assembling Machine 2
Recipe: Electronic Circuit
```

with crafting speed `1.0`, show:

```text
Electronic Circuit
Production: 2/s

Iron Plate
Consumption: 2/s

Copper Cable
Consumption: 6/s
```

If I add four more identical assemblers, immediately update to:

```text
Electronic Circuit
Production: 10/s

Iron Plate
Consumption: 10/s

Copper Cable
Consumption: 30/s
```

No manual recalculation should be required.

---

## 20. What Not to Do

Do not:

* Build a Factorio game.
* Reproduce Factorio graphics.
* Spend excessive time on artwork.
* Hard-code calculations into visual components.
* Require manual rate calculations.
* Hide important rate information.
* Round calculations prematurely.
* Build unnecessary backend infrastructure.

The core value is:

**Place entities → configure them → instantly see what the selected entities or entire design consumes and produces.**

---

## 21. Development Approach

Before implementing:

1. Inspect the existing project structure.
2. Establish the data model.
3. Build the calculation engine.
4. Build the canvas.
5. Build the entity library.
6. Connect the canvas to the data model.
7. Implement production tables.
8. Add persistence.
9. Add polish.
After each major phase, run and verify the application.

Do not create placeholder-only UI.

---

## 22. Definition of Done

The MVP is complete when I can:

1. Open the application.
2. Search the entity library.
3. Drag entities onto the canvas.
4. Move and rotate them.
5. Select recipes.
6. Select multiple entities.
7. See production and consumption for the selected entities.
8. See production and consumption for the entire design.
9. Change machine counts or modifiers and immediately see rates update.
10. Save and reload a design.
11. Export and import the design as JSON.

The production calculations must be correct, deterministic, and easy to understand.

Build the application so the full Factorio recipe/entity dataset can later be added without requiring a major architectural rewrite.
