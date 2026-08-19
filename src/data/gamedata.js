// Static game data. Pure data module — no imports from engine/store/UI.
//
// Source of truth: the official prototype definitions in
// github.com/wube/factorio-data (base/prototypes/recipe.lua,
// space-age/prototypes/recipe.lua, space-age/base-data-updates.lua),
// cross-checked against wiki.factorio.com. Factorio 2.0 / Space Age.
//
// Crafting categories are the real ones from the prototypes, so a machine's
// recipe list is exactly "every recipe in my categories" — the same rule the
// game uses. Recipes craftable by more than one machine type carry a
// `categories` array (e.g. transport belts are crafting + metallurgy, so both
// assemblers and the foundry offer them); single-category recipes use
// `category`. Read them through recipeCategoriesOf() / machineCanCraft().
//
// Deliberately excluded (per project scope): weapons and ammo (tesla/railgun/
// flamethrower/military science), mining machines, and space-platform-only
// recipes. See tests/gamedata.test.mjs for the per-machine count expectations.

export const GRID_TILES = 300;

export const QUALITY_ORDER = ['normal', 'uncommon', 'rare', 'epic', 'legendary'];

// Crafting-speed multipliers per quality tier (+30% per level; legendary is level 5).
export const QUALITIES = {
  normal:    { id: 'normal',    name: 'Normal',    tier: 0, color: '#9aa5b1', speedMultiplier: 1.0 },
  uncommon:  { id: 'uncommon',  name: 'Uncommon',  tier: 1, color: '#4fbf58', speedMultiplier: 1.3 },
  rare:      { id: 'rare',      name: 'Rare',      tier: 2, color: '#4d9be6', speedMultiplier: 1.6 },
  epic:      { id: 'epic',      name: 'Epic',      tier: 3, color: '#b46ae0', speedMultiplier: 1.9 },
  legendary: { id: 'legendary', name: 'Legendary', tier: 4, color: '#e8a33d', speedMultiplier: 2.5 },
};

// Machine modules. Effects are percentages added per module; energy is a
// percentage change to power draw (floored at 20% of base, as in the game).
export const MODULE_ORDER = [
  'speed-1', 'speed-2', 'speed-3',
  'productivity-1', 'productivity-2', 'productivity-3',
  'efficiency-1', 'efficiency-2', 'efficiency-3',
];

export const MODULES = {
  'speed-1':        { id: 'speed-1',        name: 'Speed Module 1',        kind: 'speed',        color: '#5aa9f5', effects: { speed: 20,  energy: 50 } },
  'speed-2':        { id: 'speed-2',        name: 'Speed Module 2',        kind: 'speed',        color: '#5aa9f5', effects: { speed: 30,  energy: 60 } },
  'speed-3':        { id: 'speed-3',        name: 'Speed Module 3',        kind: 'speed',        color: '#5aa9f5', effects: { speed: 50,  energy: 70 } },
  'productivity-1': { id: 'productivity-1', name: 'Productivity Module 1', kind: 'productivity', color: '#e8746d', effects: { productivity: 4,  speed: -5,  energy: 40 } },
  'productivity-2': { id: 'productivity-2', name: 'Productivity Module 2', kind: 'productivity', color: '#e8746d', effects: { productivity: 6,  speed: -10, energy: 60 } },
  'productivity-3': { id: 'productivity-3', name: 'Productivity Module 3', kind: 'productivity', color: '#e8746d', effects: { productivity: 10, speed: -15, energy: 80 } },
  'efficiency-1':   { id: 'efficiency-1',   name: 'Efficiency Module 1',   kind: 'efficiency',   color: '#6fce7e', effects: { energy: -30 } },
  'efficiency-2':   { id: 'efficiency-2',   name: 'Efficiency Module 2',   kind: 'efficiency',   color: '#6fce7e', effects: { energy: -40 } },
  'efficiency-3':   { id: 'efficiency-3',   name: 'Efficiency Module 3',   kind: 'efficiency',   color: '#6fce7e', effects: { energy: -50 } },
};

// category 'Raw' marks things the map provides (ores, lava, crude oil, brine,
// wood, farmed fruit, reactor by-products) — the rate engine treats them as
// external inputs rather than something a design must produce.
const item = (id, name, icon, color, category) => ({ id, name, icon, color, category });

export const ITEMS = Object.fromEntries([
  // ---- raw resources ----
  item('iron-ore', 'Iron Ore', '▴', '#7fa0c0', 'Raw'),
  item('copper-ore', 'Copper Ore', '▴', '#d98d5f', 'Raw'),
  item('coal', 'Coal', '●', '#6f7780', 'Raw'),
  item('stone', 'Stone', '◆', '#c8b48a', 'Raw'),
  item('calcite', 'Calcite', '▴', '#e6e2d8', 'Raw'),
  item('uranium-ore', 'Uranium Ore', '▴', '#7ee87a', 'Raw'),
  item('tungsten-ore', 'Tungsten Ore', '▴', '#9a8f7a', 'Raw'),
  item('holmium-ore', 'Holmium Ore', '▴', '#e8a0c8', 'Raw'),
  item('scrap', 'Scrap', '◈', '#b09a70', 'Raw'),
  item('wood', 'Wood', '❙', '#a5763f', 'Raw'),
  item('ice', 'Ice', '❄', '#a8d8e8', 'Raw'),
  item('yumako', 'Yumako', '❀', '#e8a24a', 'Raw'),
  item('jellynut', 'Jellynut', '❀', '#7ec46a', 'Raw'),
  item('raw-fish', 'Raw Fish', '⌇', '#c07a5a', 'Raw'),
  // produced by nuclear reactors, which this app does not model
  item('depleted-uranium-fuel-cell', 'Depleted Uranium Fuel Cell', '▪', '#6a8a68', 'Raw'),

  // ---- raw fluids (extracted from the map) ----
  item('water', 'Water', '≋', '#6db8e8', 'Raw'),
  item('crude-oil', 'Crude Oil', '≋', '#8a6aa0', 'Raw'),
  item('lava', 'Lava', '≈', '#e8603a', 'Raw'),
  item('lithium-brine', 'Lithium Brine', '≋', '#b8e0d0', 'Raw'),
  item('ammoniacal-solution', 'Ammoniacal Solution', '≋', '#8ab0a0', 'Raw'),
  item('fluorine', 'Fluorine', '≋', '#d8e8a0', 'Raw'),

  // ---- produced fluids ----
  item('heavy-oil', 'Heavy Oil', '≋', '#c0503a', 'Fluids'),
  item('light-oil', 'Light Oil', '≋', '#e8b04a', 'Fluids'),
  item('petroleum-gas', 'Petroleum Gas', '≋', '#b8a0d0', 'Fluids'),
  item('sulfuric-acid', 'Sulfuric Acid', '≋', '#d8e04a', 'Fluids'),
  item('lubricant', 'Lubricant', '≋', '#6aa84a', 'Fluids'),
  item('steam', 'Steam', '≋', '#c8d8e0', 'Fluids'),
  item('molten-iron', 'Molten Iron', '≈', '#f2924a', 'Fluids'),
  item('molten-copper', 'Molten Copper', '≈', '#e8703a', 'Fluids'),
  item('holmium-solution', 'Holmium Solution', '≋', '#e8a0c8', 'Fluids'),
  item('electrolyte', 'Electrolyte', '≋', '#c86ae0', 'Fluids'),
  item('ammonia', 'Ammonia', '≋', '#9ac0b0', 'Fluids'),
  item('fluoroketone-hot', 'Fluoroketone (Hot)', '≋', '#e8846a', 'Fluids'),
  item('fluoroketone-cold', 'Fluoroketone (Cold)', '≋', '#6ac8e8', 'Fluids'),
  item('thruster-fuel', 'Thruster Fuel', '≋', '#e8c06a', 'Fluids'),
  item('thruster-oxidizer', 'Thruster Oxidizer', '≋', '#6ab8e8', 'Fluids'),

  // ---- plates & basic intermediates ----
  item('iron-plate', 'Iron Plate', '▬', '#aebfcf', 'Intermediates'),
  item('copper-plate', 'Copper Plate', '▬', '#e0966a', 'Intermediates'),
  item('steel-plate', 'Steel Plate', '▬', '#c8d4e0', 'Intermediates'),
  item('stone-brick', 'Stone Brick', '▪', '#b0a080', 'Intermediates'),
  item('concrete', 'Concrete', '▨', '#8a8a8a', 'Intermediates'),
  item('refined-concrete', 'Refined Concrete', '▨', '#9a9a8a', 'Intermediates'),
  item('iron-gear', 'Iron Gear Wheel', '⚙', '#b8c4d0', 'Intermediates'),
  item('iron-stick', 'Iron Stick', '│', '#aebfcf', 'Intermediates'),
  item('copper-cable', 'Copper Cable', '∿', '#e8a15c', 'Intermediates'),
  item('pipe', 'Pipe', '◯', '#8ab4dd', 'Intermediates'),
  item('pipe-to-ground', 'Pipe to Ground', '◍', '#8ab4dd', 'Intermediates'),
  item('rail', 'Rail', '═', '#b0b8c0', 'Intermediates'),
  item('carbon', 'Carbon', '◼', '#4a4a4a', 'Intermediates'),
  item('carbon-fiber', 'Carbon Fiber', '▤', '#5a5a5a', 'Intermediates'),
  item('plastic-bar', 'Plastic Bar', '▬', '#e8e8e8', 'Intermediates'),
  item('sulfur', 'Sulfur', '▴', '#e8d44c', 'Intermediates'),
  item('explosives', 'Explosives', '◉', '#e05a5a', 'Intermediates'),
  item('battery', 'Battery', '▮', '#d8c04a', 'Intermediates'),
  item('solid-fuel', 'Solid Fuel', '▪', '#c8b878', 'Intermediates'),
  item('rocket-fuel', 'Rocket Fuel', '▮', '#e8a86a', 'Intermediates'),
  item('nuclear-fuel', 'Nuclear Fuel', '▮', '#8ae87a', 'Intermediates'),
  item('uranium-235', 'Uranium-235', '◆', '#a0f09a', 'Intermediates'),
  item('uranium-238', 'Uranium-238', '◆', '#5a8a58', 'Intermediates'),
  item('uranium-fuel-cell', 'Uranium Fuel Cell', '▪', '#8ae87a', 'Intermediates'),
  item('low-density-structure', 'Low Density Structure', '▱', '#d0c8b0', 'Intermediates'),
  item('rocket-part', 'Rocket Part', '▲', '#c0cad4', 'Intermediates'),
  item('engine-unit', 'Engine Unit', '⛭', '#c0a070', 'Intermediates'),
  item('electric-engine-unit', 'Electric Engine Unit', '⛭', '#7aa0c0', 'Intermediates'),
  item('flying-robot-frame', 'Flying Robot Frame', '⛊', '#8ab0d0', 'Intermediates'),

  // ---- circuits ----
  item('electronic-circuit', 'Electronic Circuit', '⌁', '#7dd383', 'Intermediates'),
  item('advanced-circuit', 'Advanced Circuit', '⌁', '#e8746d', 'Intermediates'),
  item('processing-unit', 'Processing Unit', '⌁', '#6da9e8', 'Intermediates'),
  item('quantum-processor', 'Quantum Processor', '⌁', '#b46ae0', 'Intermediates'),

  // ---- Space Age materials ----
  item('tungsten-plate', 'Tungsten Plate', '▬', '#9a9080', 'Intermediates'),
  item('tungsten-carbide', 'Tungsten Carbide', '◼', '#6a6258', 'Intermediates'),
  item('holmium-plate', 'Holmium Plate', '▬', '#e8a0c8', 'Intermediates'),
  item('superconductor', 'Superconductor', '∿', '#7ae8d0', 'Intermediates'),
  item('supercapacitor', 'Supercapacitor', '▮', '#c86ae0', 'Intermediates'),
  item('lithium', 'Lithium', '◆', '#d8e8f0', 'Intermediates'),
  item('lithium-plate', 'Lithium Plate', '▬', '#d8e8f0', 'Intermediates'),
  item('fusion-power-cell', 'Fusion Power Cell', '▮', '#7ae8f0', 'Intermediates'),

  // ---- Gleba organics ----
  item('spoilage', 'Spoilage', '▒', '#8a7a4a', 'Intermediates'),
  item('nutrients', 'Nutrients', '❋', '#7ec46a', 'Intermediates'),
  item('yumako-mash', 'Yumako Mash', '▒', '#e8b45a', 'Intermediates'),
  item('jelly', 'Jelly', '▒', '#8ad07a', 'Intermediates'),
  item('bioflux', 'Bioflux', '❋', '#e8d05a', 'Intermediates'),
  item('copper-bacteria', 'Copper Bacteria', '❋', '#e0966a', 'Intermediates'),
  item('iron-bacteria', 'Iron Bacteria', '❋', '#aebfcf', 'Intermediates'),
  item('yumako-seed', 'Yumako Seed', '·', '#e8a24a', 'Intermediates'),
  item('jellynut-seed', 'Jellynut Seed', '·', '#7ec46a', 'Intermediates'),
  item('pentapod-egg', 'Pentapod Egg', '◓', '#c88ad0', 'Intermediates'),

  // ---- logistics & power buildings ----
  item('transport-belt', 'Transport Belt', '→', '#e8c04a', 'Logistics'),
  item('fast-transport-belt', 'Fast Transport Belt', '⇒', '#e8746d', 'Logistics'),
  item('express-transport-belt', 'Express Transport Belt', '⇛', '#6da9e8', 'Logistics'),
  item('turbo-transport-belt', 'Turbo Transport Belt', '⇶', '#9a9080', 'Logistics'),
  item('underground-belt', 'Underground Belt', '↧', '#e8c04a', 'Logistics'),
  item('fast-underground-belt', 'Fast Underground Belt', '↧', '#e8746d', 'Logistics'),
  item('express-underground-belt', 'Express Underground Belt', '↧', '#6da9e8', 'Logistics'),
  item('turbo-underground-belt', 'Turbo Underground Belt', '↧', '#9a9080', 'Logistics'),
  item('splitter', 'Splitter', '⋔', '#e8c04a', 'Logistics'),
  item('fast-splitter', 'Fast Splitter', '⋔', '#e8746d', 'Logistics'),
  item('express-splitter', 'Express Splitter', '⋔', '#6da9e8', 'Logistics'),
  item('turbo-splitter', 'Turbo Splitter', '⋔', '#9a9080', 'Logistics'),
  item('inserter', 'Inserter', '↦', '#e8d44c', 'Logistics'),
  item('small-electric-pole', 'Small Electric Pole', '⌁', '#c0a070', 'Power'),
  item('medium-electric-pole', 'Medium Electric Pole', '⌁', '#b0b8c0', 'Power'),
  item('big-electric-pole', 'Big Electric Pole', '⌁', '#b0b8c0', 'Power'),
  item('substation', 'Substation', '⌁', '#6da9e8', 'Power'),
  item('accumulator', 'Accumulator', '▮', '#7ac8e8', 'Power'),
  item('solar-panel', 'Solar Panel', '▤', '#4a6a88', 'Power'),
  item('lightning-rod', 'Lightning Rod', '↯', '#c86ae0', 'Power'),
  item('lightning-collector', 'Lightning Collector', '↯', '#c86ae0', 'Power'),
  item('beacon', 'Beacon', '◈', '#6da9e8', 'Power'),
  item('electric-furnace', 'Electric Furnace', '♨', '#c8d4e0', 'Logistics'),

  // ---- modules ----
  item('speed-module', 'Speed Module 1', '▤', '#5aa9f5', 'Modules'),
  item('speed-module-2', 'Speed Module 2', '▤', '#5aa9f5', 'Modules'),
  item('speed-module-3', 'Speed Module 3', '▤', '#5aa9f5', 'Modules'),
  item('productivity-module', 'Productivity Module 1', '▤', '#e8746d', 'Modules'),
  item('productivity-module-2', 'Productivity Module 2', '▤', '#e8746d', 'Modules'),
  item('productivity-module-3', 'Productivity Module 3', '▤', '#e8746d', 'Modules'),
  item('efficiency-module', 'Efficiency Module 1', '▤', '#6fce7e', 'Modules'),
  item('efficiency-module-2', 'Efficiency Module 2', '▤', '#6fce7e', 'Modules'),
  item('efficiency-module-3', 'Efficiency Module 3', '▤', '#6fce7e', 'Modules'),

  // ---- science ----
  item('automation-science-pack', 'Automation Science Pack', '⚗', '#e8746d', 'Science'),
  item('logistic-science-pack', 'Logistic Science Pack', '⚗', '#6fce7e', 'Science'),
  item('chemical-science-pack', 'Chemical Science Pack', '⚗', '#6ac8e8', 'Science'),
  item('production-science-pack', 'Production Science Pack', '⚗', '#c86ae0', 'Science'),
  item('utility-science-pack', 'Utility Science Pack', '⚗', '#e8d44c', 'Science'),
  item('metallurgic-science-pack', 'Metallurgic Science Pack', '⚗', '#e8823a', 'Science'),
  item('electromagnetic-science-pack', 'Electromagnetic Science Pack', '⚗', '#c86ae0', 'Science'),
  item('agricultural-science-pack', 'Agricultural Science Pack', '⚗', '#7ec46a', 'Science'),
  item('cryogenic-science-pack', 'Cryogenic Science Pack', '⚗', '#6ac8e8', 'Science'),
  item('science', 'Research Progress', '✦', '#b46ae0', 'Science'),
].map(i => [i.id, i]));

// Recipe helper: r(id, name, categoryOrCategories, time, inputs, outputs).
// inputs/outputs are [itemId, amount] pairs.
const r = (id, name, cat, craftingTime, inputs, outputs) => {
  const def = {
    id, name, craftingTime,
    inputs: inputs.map(([itemId, amount]) => ({ itemId, amount })),
    outputs: outputs.map(([itemId, amount]) => ({ itemId, amount })),
  };
  if (Array.isArray(cat)) def.categories = cat;
  else def.category = cat;
  return def;
};

export const RECIPES = Object.fromEntries([
  // ================= smelting (furnaces) =================
  r('iron-plate', 'Iron Plate', 'smelting', 3.2, [['iron-ore', 1]], [['iron-plate', 1]]),
  r('copper-plate', 'Copper Plate', 'smelting', 3.2, [['copper-ore', 1]], [['copper-plate', 1]]),
  r('steel-plate', 'Steel Plate', 'smelting', 16, [['iron-plate', 5]], [['steel-plate', 1]]),
  r('stone-brick', 'Stone Brick', 'smelting', 3.2, [['stone', 2]], [['stone-brick', 1]]),
  r('lithium-plate', 'Lithium Plate', 'smelting', 6.4, [['lithium', 1]], [['lithium-plate', 1]]),

  // ================= crafting (assemblers) =================
  // Recipes shared with the electromagnetic plant / foundry carry both categories.
  r('iron-gear', 'Iron Gear Wheel', 'crafting', 0.5, [['iron-plate', 2]], [['iron-gear', 1]]),
  r('iron-stick', 'Iron Stick', 'crafting', 0.5, [['iron-plate', 1]], [['iron-stick', 2]]),
  r('pipe', 'Pipe', 'crafting', 0.5, [['iron-plate', 1]], [['pipe', 1]]),
  r('pipe-to-ground', 'Pipe to Ground', 'crafting', 0.5, [['pipe', 10], ['iron-plate', 5]], [['pipe-to-ground', 2]]),
  r('rail', 'Rail', 'crafting', 0.5, [['stone', 1], ['steel-plate', 1], ['iron-stick', 1]], [['rail', 2]]),
  r('copper-cable', 'Copper Cable', ['crafting', 'electromagnetics'], 0.5, [['copper-plate', 1]], [['copper-cable', 2]]),
  r('electronic-circuit', 'Electronic Circuit', ['crafting', 'electromagnetics'], 0.5,
    [['iron-plate', 1], ['copper-cable', 3]], [['electronic-circuit', 1]]),
  r('advanced-circuit', 'Advanced Circuit', ['crafting', 'electromagnetics'], 6,
    [['electronic-circuit', 2], ['plastic-bar', 2], ['copper-cable', 4]], [['advanced-circuit', 1]]),
  r('inserter', 'Inserter', 'crafting', 0.5,
    [['electronic-circuit', 1], ['iron-gear', 1], ['iron-plate', 1]], [['inserter', 1]]),
  r('engine-unit', 'Engine Unit', 'crafting', 10,
    [['steel-plate', 1], ['iron-gear', 1], ['pipe', 2]], [['engine-unit', 1]]),
  r('flying-robot-frame', 'Flying Robot Frame', 'crafting', 20,
    [['electric-engine-unit', 1], ['battery', 2], ['steel-plate', 1], ['electronic-circuit', 3]],
    [['flying-robot-frame', 1]]),
  r('low-density-structure', 'Low Density Structure', 'crafting', 15,
    [['steel-plate', 2], ['copper-plate', 20], ['plastic-bar', 5]], [['low-density-structure', 1]]),
  r('electric-furnace', 'Electric Furnace', 'crafting', 5,
    [['steel-plate', 10], ['advanced-circuit', 5], ['stone-brick', 10]], [['electric-furnace', 1]]),
  r('uranium-fuel-cell', 'Uranium Fuel Cell', 'crafting', 10,
    [['iron-plate', 10], ['uranium-235', 1], ['uranium-238', 19]], [['uranium-fuel-cell', 10]]),

  // belts / splitters — also foundry recipes in Space Age
  r('transport-belt', 'Transport Belt', ['crafting', 'metallurgy'], 0.5,
    [['iron-plate', 1], ['iron-gear', 1]], [['transport-belt', 2]]),
  r('underground-belt', 'Underground Belt', ['crafting', 'metallurgy'], 1,
    [['iron-plate', 10], ['transport-belt', 5]], [['underground-belt', 2]]),
  r('splitter', 'Splitter', ['crafting', 'metallurgy'], 1,
    [['electronic-circuit', 5], ['iron-plate', 5], ['transport-belt', 4]], [['splitter', 1]]),
  r('fast-transport-belt', 'Fast Transport Belt', ['crafting', 'metallurgy'], 0.5,
    [['iron-gear', 5], ['transport-belt', 1]], [['fast-transport-belt', 1]]),
  r('fast-underground-belt', 'Fast Underground Belt', ['crafting', 'metallurgy'], 2,
    [['iron-gear', 40], ['underground-belt', 2]], [['fast-underground-belt', 2]]),
  r('fast-splitter', 'Fast Splitter', ['crafting', 'metallurgy'], 2,
    [['splitter', 1], ['iron-gear', 10], ['electronic-circuit', 10]], [['fast-splitter', 1]]),

  // power / beacons — also electromagnetic plant recipes
  r('small-electric-pole', 'Small Electric Pole', ['crafting', 'electromagnetics'], 0.5,
    [['wood', 1], ['copper-cable', 2]], [['small-electric-pole', 2]]),
  r('medium-electric-pole', 'Medium Electric Pole', ['crafting', 'electromagnetics'], 0.5,
    [['iron-stick', 4], ['steel-plate', 2], ['copper-cable', 2]], [['medium-electric-pole', 1]]),
  r('big-electric-pole', 'Big Electric Pole', ['crafting', 'electromagnetics'], 0.5,
    [['iron-stick', 8], ['steel-plate', 5], ['copper-cable', 4]], [['big-electric-pole', 1]]),
  r('substation', 'Substation', ['crafting', 'electromagnetics'], 0.5,
    [['steel-plate', 10], ['advanced-circuit', 5], ['copper-cable', 6]], [['substation', 1]]),
  r('accumulator', 'Accumulator', ['crafting', 'electromagnetics'], 10,
    [['iron-plate', 2], ['battery', 5]], [['accumulator', 1]]),
  r('solar-panel', 'Solar Panel', ['crafting', 'electromagnetics'], 10,
    [['steel-plate', 5], ['electronic-circuit', 15], ['copper-plate', 5]], [['solar-panel', 1]]),
  r('beacon', 'Beacon', ['crafting', 'electromagnetics'], 15,
    [['electronic-circuit', 20], ['advanced-circuit', 20], ['steel-plate', 10], ['copper-cable', 10]],
    [['beacon', 1]]),

  // modules — also electromagnetic plant recipes
  r('speed-module', 'Speed Module 1', ['crafting', 'electromagnetics'], 15,
    [['advanced-circuit', 5], ['electronic-circuit', 5]], [['speed-module', 1]]),
  r('speed-module-2', 'Speed Module 2', ['crafting', 'electromagnetics'], 30,
    [['speed-module', 4], ['advanced-circuit', 5], ['processing-unit', 5]], [['speed-module-2', 1]]),
  r('speed-module-3', 'Speed Module 3', ['crafting', 'electromagnetics'], 60,
    [['speed-module-2', 4], ['advanced-circuit', 5], ['processing-unit', 5]], [['speed-module-3', 1]]),
  r('productivity-module', 'Productivity Module 1', ['crafting', 'electromagnetics'], 15,
    [['advanced-circuit', 5], ['electronic-circuit', 5]], [['productivity-module', 1]]),
  r('productivity-module-2', 'Productivity Module 2', ['crafting', 'electromagnetics'], 30,
    [['productivity-module', 4], ['advanced-circuit', 5], ['processing-unit', 5]], [['productivity-module-2', 1]]),
  r('productivity-module-3', 'Productivity Module 3', ['crafting', 'electromagnetics'], 60,
    [['productivity-module-2', 4], ['advanced-circuit', 5], ['processing-unit', 5]], [['productivity-module-3', 1]]),
  r('efficiency-module', 'Efficiency Module 1', ['crafting', 'electromagnetics'], 15,
    [['advanced-circuit', 5], ['electronic-circuit', 5]], [['efficiency-module', 1]]),
  r('efficiency-module-2', 'Efficiency Module 2', ['crafting', 'electromagnetics'], 30,
    [['efficiency-module', 4], ['advanced-circuit', 5], ['processing-unit', 5]], [['efficiency-module-2', 1]]),
  r('efficiency-module-3', 'Efficiency Module 3', ['crafting', 'electromagnetics'], 60,
    [['efficiency-module-2', 4], ['advanced-circuit', 5], ['processing-unit', 5]], [['efficiency-module-3', 1]]),

  // science packs (assembler-made)
  r('automation-science-pack', 'Automation Science Pack', 'crafting', 5,
    [['copper-plate', 1], ['iron-gear', 1]], [['automation-science-pack', 1]]),
  r('logistic-science-pack', 'Logistic Science Pack', 'crafting', 6,
    [['inserter', 1], ['transport-belt', 1]], [['logistic-science-pack', 1]]),
  r('chemical-science-pack', 'Chemical Science Pack', 'crafting', 24,
    [['engine-unit', 2], ['advanced-circuit', 3], ['sulfur', 1]], [['chemical-science-pack', 2]]),
  r('production-science-pack', 'Production Science Pack', 'crafting', 21,
    [['electric-furnace', 1], ['productivity-module', 1], ['rail', 30]], [['production-science-pack', 3]]),
  r('utility-science-pack', 'Utility Science Pack', 'crafting', 21,
    [['low-density-structure', 3], ['processing-unit', 2], ['flying-robot-frame', 1]],
    [['utility-science-pack', 3]]),

  // ================= crafting with fluid (assemblers 2/3) =================
  r('processing-unit', 'Processing Unit', ['crafting-with-fluid', 'electromagnetics'], 10,
    [['electronic-circuit', 20], ['advanced-circuit', 2], ['sulfuric-acid', 5]], [['processing-unit', 1]]),
  r('concrete', 'Concrete', 'crafting-with-fluid', 10,
    [['stone-brick', 5], ['iron-ore', 1], ['water', 100]], [['concrete', 10]]),
  r('refined-concrete', 'Refined Concrete', 'crafting-with-fluid', 15,
    [['concrete', 20], ['iron-stick', 8], ['steel-plate', 1], ['water', 100]], [['refined-concrete', 10]]),
  r('electric-engine-unit', 'Electric Engine Unit', 'crafting-with-fluid', 10,
    [['engine-unit', 1], ['lubricant', 15], ['electronic-circuit', 2]], [['electric-engine-unit', 1]]),
  r('rocket-fuel', 'Rocket Fuel', ['crafting-with-fluid', 'organic'], 15,
    [['solid-fuel', 10], ['light-oil', 10]], [['rocket-fuel', 1]]),
  r('tungsten-carbide', 'Tungsten Carbide', 'crafting-with-fluid', 1,
    [['tungsten-ore', 2], ['sulfuric-acid', 10], ['carbon', 1]], [['tungsten-carbide', 1]]),
  r('holmium-plate', 'Holmium Plate', ['crafting-with-fluid', 'metallurgy'], 1,
    [['holmium-solution', 20]], [['holmium-plate', 1]]),
  r('express-transport-belt', 'Express Transport Belt', ['crafting-with-fluid', 'metallurgy'], 0.5,
    [['iron-gear', 10], ['fast-transport-belt', 1], ['lubricant', 20]], [['express-transport-belt', 1]]),
  r('express-underground-belt', 'Express Underground Belt', ['crafting-with-fluid', 'metallurgy'], 2,
    [['iron-gear', 80], ['fast-underground-belt', 2], ['lubricant', 40]], [['express-underground-belt', 2]]),
  r('express-splitter', 'Express Splitter', ['crafting-with-fluid', 'metallurgy'], 2,
    [['fast-splitter', 1], ['iron-gear', 10], ['advanced-circuit', 10], ['lubricant', 80]],
    [['express-splitter', 1]]),

  // ================= metallurgy (foundry) =================
  r('molten-iron', 'Molten Iron', 'metallurgy', 32,
    [['iron-ore', 50], ['calcite', 1]], [['molten-iron', 500]]),
  r('molten-copper', 'Molten Copper', 'metallurgy', 32,
    [['copper-ore', 50], ['calcite', 1]], [['molten-copper', 500]]),
  r('molten-iron-from-lava', 'Molten Iron from Lava', 'metallurgy', 16,
    [['lava', 500], ['calcite', 1]], [['molten-iron', 250], ['stone', 10]]),
  r('molten-copper-from-lava', 'Molten Copper from Lava', 'metallurgy', 16,
    [['lava', 500], ['calcite', 1]], [['molten-copper', 250], ['stone', 15]]),
  r('casting-iron', 'Casting Iron Plate', 'metallurgy', 3.2,
    [['molten-iron', 20]], [['iron-plate', 2]]),
  r('casting-copper', 'Casting Copper Plate', 'metallurgy', 3.2,
    [['molten-copper', 20]], [['copper-plate', 2]]),
  r('casting-steel', 'Casting Steel', 'metallurgy', 3.2,
    [['molten-iron', 30]], [['steel-plate', 1]]),
  r('casting-iron-gear', 'Casting Iron Gear Wheel', 'metallurgy', 1,
    [['molten-iron', 10]], [['iron-gear', 1]]),
  r('casting-iron-stick', 'Casting Iron Stick', 'metallurgy', 1,
    [['molten-iron', 20]], [['iron-stick', 4]]),
  r('casting-copper-cable', 'Casting Copper Cable', 'metallurgy', 1,
    [['molten-copper', 5]], [['copper-cable', 2]]),
  r('casting-pipe', 'Casting Pipe', 'metallurgy', 1,
    [['molten-iron', 10]], [['pipe', 1]]),
  r('casting-pipe-to-ground', 'Casting Pipe to Ground', 'metallurgy', 1,
    [['molten-iron', 50], ['pipe', 10]], [['pipe-to-ground', 2]]),
  r('casting-low-density-structure', 'Casting Low Density Structure', 'metallurgy', 15,
    [['molten-iron', 80], ['molten-copper', 250], ['plastic-bar', 5]], [['low-density-structure', 1]]),
  r('casting-concrete', 'Casting Concrete', 'metallurgy', 10,
    [['molten-iron', 20], ['water', 100], ['stone-brick', 5]], [['concrete', 10]]),
  r('tungsten-plate', 'Tungsten Plate', 'metallurgy', 10,
    [['tungsten-ore', 4], ['molten-iron', 10]], [['tungsten-plate', 1]]),
  r('metallurgic-science-pack', 'Metallurgic Science Pack', 'metallurgy', 10,
    [['molten-copper', 200], ['tungsten-carbide', 3], ['tungsten-plate', 2]],
    [['metallurgic-science-pack', 1]]),
  r('turbo-transport-belt', 'Turbo Transport Belt', 'metallurgy', 0.5,
    [['express-transport-belt', 1], ['tungsten-plate', 5], ['lubricant', 20]],
    [['turbo-transport-belt', 1]]),
  r('turbo-underground-belt', 'Turbo Underground Belt', 'metallurgy', 2,
    [['express-underground-belt', 2], ['tungsten-plate', 40], ['lubricant', 40]],
    [['turbo-underground-belt', 2]]),
  r('turbo-splitter', 'Turbo Splitter', 'metallurgy', 2,
    [['express-splitter', 1], ['tungsten-plate', 15], ['processing-unit', 2], ['lubricant', 80]],
    [['turbo-splitter', 1]]),

  // ================= electromagnetics (EM plant) =================
  r('lightning-rod', 'Lightning Rod', 'electromagnetics', 5,
    [['copper-cable', 12], ['steel-plate', 8], ['stone-brick', 4]], [['lightning-rod', 1]]),
  r('lightning-collector', 'Lightning Collector', 'electromagnetics', 5,
    [['lightning-rod', 1], ['supercapacitor', 8], ['accumulator', 1], ['electrolyte', 80]],
    [['lightning-collector', 1]]),
  r('supercapacitor', 'Supercapacitor', 'electromagnetics', 10,
    [['holmium-plate', 2], ['superconductor', 2], ['electronic-circuit', 4], ['battery', 1], ['electrolyte', 10]],
    [['supercapacitor', 1]]),
  r('electromagnetic-science-pack', 'Electromagnetic Science Pack', 'electromagnetics', 10,
    [['supercapacitor', 1], ['accumulator', 1], ['electrolyte', 25], ['holmium-solution', 25]],
    [['electromagnetic-science-pack', 1]]),
  // superconductor / electrolyte are chemistry + electromagnetics
  r('superconductor', 'Superconductor', ['chemistry', 'electromagnetics'], 5,
    [['holmium-plate', 1], ['copper-plate', 1], ['plastic-bar', 1], ['light-oil', 5]],
    [['superconductor', 2]]),
  r('electrolyte', 'Electrolyte', ['chemistry', 'electromagnetics'], 5,
    [['stone', 1], ['heavy-oil', 10], ['holmium-solution', 10]], [['electrolyte', 10]]),
  // quantum processor is craftable in the EM plant and the cryogenic plant
  r('quantum-processor', 'Quantum Processor', ['electromagnetics', 'cryogenics'], 30,
    [['tungsten-carbide', 1], ['processing-unit', 1], ['superconductor', 1], ['carbon-fiber', 1],
      ['lithium-plate', 2], ['fluoroketone-cold', 10]],
    [['quantum-processor', 1], ['fluoroketone-hot', 5]]),

  // ================= chemistry (chemical plant) =================
  // Several are chemistry + cryogenics (the cryogenic plant also runs them).
  r('sulfuric-acid', 'Sulfuric Acid', ['chemistry', 'cryogenics'], 1,
    [['sulfur', 5], ['iron-plate', 1], ['water', 100]], [['sulfuric-acid', 50]]),
  r('sulfur', 'Sulfur', ['chemistry', 'cryogenics'], 1,
    [['water', 30], ['petroleum-gas', 30]], [['sulfur', 2]]),
  r('plastic-bar', 'Plastic Bar', ['chemistry', 'cryogenics'], 1,
    [['petroleum-gas', 20], ['coal', 1]], [['plastic-bar', 2]]),
  r('explosives', 'Explosives', ['chemistry', 'cryogenics'], 4,
    [['sulfur', 1], ['coal', 1], ['water', 10]], [['explosives', 2]]),
  r('battery', 'Battery', ['chemistry', 'cryogenics'], 4,
    [['sulfuric-acid', 20], ['iron-plate', 1], ['copper-plate', 1]], [['battery', 1]]),
  r('lubricant', 'Lubricant', 'chemistry', 1, [['heavy-oil', 10]], [['lubricant', 10]]),
  r('solid-fuel-from-light-oil', 'Solid Fuel (Light Oil)', 'chemistry', 1,
    [['light-oil', 10]], [['solid-fuel', 1]]),
  r('solid-fuel-from-petroleum-gas', 'Solid Fuel (Petroleum Gas)', 'chemistry', 1,
    [['petroleum-gas', 20]], [['solid-fuel', 1]]),
  r('solid-fuel-from-heavy-oil', 'Solid Fuel (Heavy Oil)', 'chemistry', 1,
    [['heavy-oil', 20]], [['solid-fuel', 1]]),
  r('heavy-oil-cracking', 'Heavy Oil Cracking', ['chemistry', 'organic'], 2,
    [['water', 30], ['heavy-oil', 40]], [['light-oil', 30]]),
  r('light-oil-cracking', 'Light Oil Cracking', ['chemistry', 'organic'], 2,
    [['water', 30], ['light-oil', 30]], [['petroleum-gas', 20]]),
  r('carbon', 'Carbon', 'chemistry', 1,
    [['coal', 2], ['sulfuric-acid', 20]], [['carbon', 1]]),
  r('coal-synthesis', 'Coal Synthesis', 'chemistry', 2,
    [['carbon', 5], ['sulfur', 1], ['water', 10]], [['coal', 1]]),
  r('simple-coal-liquefaction', 'Simple Coal Liquefaction', 'chemistry', 5,
    [['coal', 10], ['calcite', 2], ['sulfuric-acid', 25]], [['heavy-oil', 50]]),
  r('holmium-solution', 'Holmium Solution', 'chemistry', 10,
    [['holmium-ore', 2], ['stone', 1], ['water', 10]], [['holmium-solution', 100]]),
  r('ice-melting', 'Ice Melting', 'chemistry', 1, [['ice', 1]], [['water', 20]]),
  r('solid-fuel-from-ammonia', 'Solid Fuel (Ammonia)', 'chemistry', 0.5,
    [['ammonia', 15], ['crude-oil', 6]], [['solid-fuel', 1]]),
  r('thruster-fuel', 'Thruster Fuel', 'chemistry', 2,
    [['carbon', 2], ['water', 10]], [['thruster-fuel', 75]]),
  r('thruster-oxidizer', 'Thruster Oxidizer', 'chemistry', 2,
    [['iron-ore', 2], ['water', 10]], [['thruster-oxidizer', 75]]),
  r('advanced-thruster-fuel', 'Advanced Thruster Fuel', 'chemistry', 10,
    [['carbon', 2], ['calcite', 1], ['water', 100]], [['thruster-fuel', 1500]]),
  r('advanced-thruster-oxidizer', 'Advanced Thruster Oxidizer', 'chemistry', 10,
    [['iron-ore', 2], ['calcite', 1], ['water', 100]], [['thruster-oxidizer', 1500]]),

  // ================= oil processing (refinery) =================
  r('basic-oil-processing', 'Basic Oil Processing', 'oil-processing', 5,
    [['crude-oil', 100]], [['petroleum-gas', 45]]),
  r('advanced-oil-processing', 'Advanced Oil Processing', 'oil-processing', 5,
    [['water', 50], ['crude-oil', 100]],
    [['heavy-oil', 25], ['light-oil', 45], ['petroleum-gas', 55]]),
  r('coal-liquefaction', 'Coal Liquefaction', 'oil-processing', 5,
    [['coal', 10], ['heavy-oil', 25], ['steam', 50]],
    [['heavy-oil', 90], ['light-oil', 20], ['petroleum-gas', 10]]),

  // ================= centrifuging (centrifuge) =================
  // uranium-processing outputs are expected values (0.7% / 99.3% probabilities).
  r('uranium-processing', 'Uranium Processing', 'centrifuging', 12,
    [['uranium-ore', 10]], [['uranium-235', 0.007], ['uranium-238', 0.993]]),
  r('kovarex-enrichment', 'Kovarex Enrichment Process', 'centrifuging', 60,
    [['uranium-235', 40], ['uranium-238', 5]], [['uranium-235', 41], ['uranium-238', 2]]),
  r('nuclear-fuel', 'Nuclear Fuel', 'centrifuging', 90,
    [['uranium-235', 1], ['rocket-fuel', 1]], [['nuclear-fuel', 1]]),
  r('nuclear-fuel-reprocessing', 'Nuclear Fuel Reprocessing', 'centrifuging', 60,
    [['depleted-uranium-fuel-cell', 5]], [['uranium-238', 3]]),

  // ================= organic (biochamber) =================
  // Probabilistic outputs are expected values (e.g. 2% seed chance → 0.02).
  r('yumako-processing', 'Yumako Processing', 'organic', 1,
    [['yumako', 1]], [['yumako-mash', 2], ['yumako-seed', 0.02]]),
  r('jellynut-processing', 'Jellynut Processing', 'organic', 1,
    [['jellynut', 1]], [['jelly', 4], ['jellynut-seed', 0.02]]),
  r('bioflux', 'Bioflux', 'organic', 6,
    [['yumako-mash', 15], ['jelly', 12]], [['bioflux', 4]]),
  r('copper-bacteria', 'Copper Bacteria', 'organic', 1,
    [['yumako-mash', 3]], [['copper-bacteria', 0.1], ['spoilage', 1]]),
  r('copper-bacteria-cultivation', 'Copper Bacteria Cultivation', 'organic', 4,
    [['copper-bacteria', 1], ['bioflux', 1]], [['copper-bacteria', 4]]),
  r('iron-bacteria', 'Iron Bacteria', 'organic', 1,
    [['jelly', 6]], [['iron-bacteria', 0.1], ['spoilage', 4]]),
  r('iron-bacteria-cultivation', 'Iron Bacteria Cultivation', 'organic', 4,
    [['iron-bacteria', 1], ['bioflux', 1]], [['iron-bacteria', 4]]),
  r('bioplastic', 'Bioplastic', 'organic', 2,
    [['bioflux', 1], ['yumako-mash', 4]], [['plastic-bar', 3]]),
  r('biosulfur', 'Biosulfur', 'organic', 2,
    [['spoilage', 5], ['bioflux', 1]], [['sulfur', 2]]),
  r('biolubricant', 'Biolubricant', 'organic', 3,
    [['jelly', 60]], [['lubricant', 20]]),
  r('carbon-fiber', 'Carbon Fiber', 'organic', 5,
    [['yumako-mash', 10], ['carbon', 1]], [['carbon-fiber', 1]]),
  r('burnt-spoilage', 'Burnt Spoilage', 'organic', 12,
    [['spoilage', 6]], [['carbon', 1]]),
  r('nutrients-from-spoilage', 'Nutrients from Spoilage', 'organic', 2,
    [['spoilage', 10]], [['nutrients', 1]]),
  r('nutrients-from-fish', 'Nutrients from Fish', 'organic', 2,
    [['raw-fish', 1]], [['nutrients', 20]]),
  r('fish-breeding', 'Fish Breeding', 'organic', 6,
    [['raw-fish', 2], ['nutrients', 100], ['water', 100]], [['raw-fish', 3]]),
  r('pentapod-egg', 'Pentapod Egg', 'organic', 15,
    [['pentapod-egg', 1], ['nutrients', 30], ['water', 60]], [['pentapod-egg', 2]]),
  r('rocket-fuel-from-jelly', 'Rocket Fuel from Jelly', 'organic', 10,
    [['water', 30], ['jelly', 30], ['bioflux', 2]], [['rocket-fuel', 1]]),
  r('agricultural-science-pack', 'Agricultural Science Pack', 'organic', 4,
    [['bioflux', 1], ['pentapod-egg', 1]], [['agricultural-science-pack', 1]]),

  // ================= cryogenics (cryogenic plant) =================
  r('acid-neutralisation', 'Acid Neutralisation', 'cryogenics', 0.5,
    [['calcite', 1], ['sulfuric-acid', 100]], [['steam', 1000]]),
  r('steam-condensation', 'Steam Condensation', 'cryogenics', 1,
    [['steam', 1000]], [['water', 90]]),
  r('ammoniacal-solution-separation', 'Ammoniacal Solution Separation', 'cryogenics', 1,
    [['ammoniacal-solution', 50]], [['ice', 5], ['ammonia', 50]]),
  r('fluoroketone', 'Fluoroketone', 'cryogenics', 10,
    [['fluorine', 50], ['ammonia', 50], ['solid-fuel', 1], ['lithium', 1]],
    [['fluoroketone-hot', 50]]),
  r('fluoroketone-cooling', 'Fluoroketone Cooling', 'cryogenics', 5,
    [['fluoroketone-hot', 10]], [['fluoroketone-cold', 10]]),
  // NOTE: the holmium-plate ingredient here comes straight from the prototype
  // file; worth re-checking against a second source before relying on it.
  r('lithium', 'Lithium', 'cryogenics', 20,
    [['holmium-plate', 1], ['lithium-brine', 50], ['ammonia', 50]], [['lithium', 5]]),
  r('fusion-power-cell', 'Fusion Power Cell', 'cryogenics', 10,
    [['lithium-plate', 5], ['holmium-plate', 1], ['ammonia', 100]], [['fusion-power-cell', 1]]),
  r('ammonia-rocket-fuel', 'Rocket Fuel (Ammonia)', 'cryogenics', 10,
    [['solid-fuel', 10], ['water', 50], ['ammonia', 500]], [['rocket-fuel', 1]]),
  r('cryogenic-science-pack', 'Cryogenic Science Pack', 'cryogenics', 20,
    [['ice', 3], ['lithium-plate', 1], ['fluoroketone-cold', 6]],
    [['cryogenic-science-pack', 1], ['fluoroketone-hot', 3]]),

  // ================= rocket building (silo) =================
  r('rocket-part', 'Rocket Part', 'rocket-building', 3,
    [['processing-unit', 10], ['low-density-structure', 10], ['rocket-fuel', 10]],
    [['rocket-part', 1]]),

  // ================= research (labs) =================
  r('research', 'Research', 'research', 60,
    [['automation-science-pack', 1], ['logistic-science-pack', 1]], [['science', 60]]),

  // ================= recycling (recycler) =================
  // The game auto-generates a recycling recipe for most items: 25% of the
  // original ingredients (fluids lost) in 1/16 of the crafting time. Outputs
  // below are those expected values. Scrap recycling is hand-written in the
  // prototypes; item probabilities not in this dataset are omitted.
  r('scrap-recycling', 'Scrap Recycling', 'recycling', 0.2,
    [['scrap', 1]],
    [['iron-gear', 0.2], ['solid-fuel', 0.07], ['concrete', 0.06], ['ice', 0.05],
      ['steel-plate', 0.04], ['stone', 0.04], ['copper-cable', 0.03], ['battery', 0.03],
      ['advanced-circuit', 0.03], ['processing-unit', 0.02], ['holmium-ore', 0.01],
      ['low-density-structure', 0.01]]),
  r('iron-gear-recycling', 'Iron Gear Wheel Recycling', 'recycling', 0.03125,
    [['iron-gear', 1]], [['iron-plate', 0.5]]),
  r('copper-cable-recycling', 'Copper Cable Recycling', 'recycling', 0.03125,
    [['copper-cable', 1]], [['copper-plate', 0.125]]),
  r('electronic-circuit-recycling', 'Electronic Circuit Recycling', 'recycling', 0.03125,
    [['electronic-circuit', 1]], [['copper-cable', 0.75], ['iron-plate', 0.25]]),
  r('advanced-circuit-recycling', 'Advanced Circuit Recycling', 'recycling', 0.375,
    [['advanced-circuit', 1]],
    [['copper-cable', 1], ['plastic-bar', 0.5], ['electronic-circuit', 0.5]]),
  r('processing-unit-recycling', 'Processing Unit Recycling', 'recycling', 0.625,
    [['processing-unit', 1]], [['electronic-circuit', 5], ['advanced-circuit', 0.5]]),
].map(recipe => [recipe.id, recipe]));

// Placeable entity definitions. type 'machine' contributes to rate calculations;
// other types are layout-only (belts, inserters, power, storage, pipes).
// Sizes, speeds, energy, module slots and crafting categories follow the
// prototype definitions. Energy is active consumption (drain not modeled).
export const ENTITY_DEFS = {
  'stone-furnace': {
    id: 'stone-furnace', name: 'Stone Furnace', type: 'machine', category: 'Furnaces',
    icon: '♨', w: 2, h: 2, craftingSpeed: 1, energyUsageKW: 90, recipeCategories: ['smelting'],
    stats: { 'Crafting speed': '1', 'Energy': '90 kW (burner)' },
  },
  'steel-furnace': {
    id: 'steel-furnace', name: 'Steel Furnace', type: 'machine', category: 'Furnaces',
    icon: '♨', w: 2, h: 2, craftingSpeed: 2, energyUsageKW: 90, recipeCategories: ['smelting'],
    stats: { 'Crafting speed': '2', 'Energy': '90 kW (burner)' },
  },
  'electric-furnace': {
    id: 'electric-furnace', name: 'Electric Furnace', type: 'machine', category: 'Furnaces',
    icon: '♨', w: 3, h: 3, craftingSpeed: 2, energyUsageKW: 180, recipeCategories: ['smelting'],
    moduleSlots: 2,
    stats: { 'Crafting speed': '2', 'Energy': '180 kW', 'Modules': '2 slots' },
  },
  'assembling-machine-1': {
    id: 'assembling-machine-1', name: 'Assembling Machine 1', type: 'machine', category: 'Assemblers',
    icon: '⚙', w: 3, h: 3, craftingSpeed: 0.5, energyUsageKW: 75,
    recipeCategories: ['crafting'], // no fluid handling
    stats: { 'Crafting speed': '0.5', 'Energy': '75 kW' },
  },
  'assembling-machine-2': {
    id: 'assembling-machine-2', name: 'Assembling Machine 2', type: 'machine', category: 'Assemblers',
    icon: '⚙', w: 3, h: 3, craftingSpeed: 0.75, energyUsageKW: 150,
    recipeCategories: ['crafting', 'crafting-with-fluid'],
    moduleSlots: 2,
    stats: { 'Crafting speed': '0.75', 'Energy': '150 kW', 'Modules': '2 slots' },
  },
  'assembling-machine-3': {
    id: 'assembling-machine-3', name: 'Assembling Machine 3', type: 'machine', category: 'Assemblers',
    icon: '⚙', w: 3, h: 3, craftingSpeed: 1.25, energyUsageKW: 375,
    recipeCategories: ['crafting', 'crafting-with-fluid'],
    moduleSlots: 4,
    stats: { 'Crafting speed': '1.25', 'Energy': '375 kW', 'Modules': '4 slots' },
  },

  // ---- Space Age production machines ----
  'foundry': {
    id: 'foundry', name: 'Foundry', type: 'machine', category: 'Production',
    icon: '⚒', w: 5, h: 5, craftingSpeed: 4, energyUsageKW: 2500, recipeCategories: ['metallurgy'],
    moduleSlots: 4, baseProductivity: 50,
    stats: { 'Crafting speed': '4', 'Energy': '2.5 MW', 'Base productivity': '+50%', 'Modules': '4 slots' },
  },
  'electromagnetic-plant': {
    id: 'electromagnetic-plant', name: 'Electromagnetic Plant', type: 'machine', category: 'Production',
    icon: '⚡', w: 4, h: 4, craftingSpeed: 2, energyUsageKW: 2000,
    recipeCategories: ['electromagnetics'],
    moduleSlots: 5, baseProductivity: 50,
    stats: { 'Crafting speed': '2', 'Energy': '2 MW', 'Base productivity': '+50%', 'Modules': '5 slots' },
  },
  'chemical-plant': {
    id: 'chemical-plant', name: 'Chemical Plant', type: 'machine', category: 'Production',
    icon: '⚗', w: 3, h: 3, craftingSpeed: 1, energyUsageKW: 210, recipeCategories: ['chemistry'],
    moduleSlots: 3,
    stats: { 'Crafting speed': '1', 'Energy': '210 kW', 'Modules': '3 slots' },
  },
  'oil-refinery': {
    id: 'oil-refinery', name: 'Oil Refinery', type: 'machine', category: 'Production',
    icon: '⛽', w: 5, h: 5, craftingSpeed: 1, energyUsageKW: 420, recipeCategories: ['oil-processing'],
    moduleSlots: 3,
    stats: { 'Crafting speed': '1', 'Energy': '420 kW', 'Modules': '3 slots' },
  },
  'centrifuge': {
    id: 'centrifuge', name: 'Centrifuge', type: 'machine', category: 'Production',
    icon: '◉', w: 3, h: 3, craftingSpeed: 1, energyUsageKW: 350, recipeCategories: ['centrifuging'],
    moduleSlots: 2,
    stats: { 'Crafting speed': '1', 'Energy': '350 kW', 'Modules': '2 slots' },
  },
  'biochamber': {
    id: 'biochamber', name: 'Biochamber', type: 'machine', category: 'Production',
    icon: '❁', w: 3, h: 3, craftingSpeed: 2, energyUsageKW: 500, recipeCategories: ['organic'],
    moduleSlots: 4, baseProductivity: 50,
    stats: { 'Crafting speed': '2', 'Energy': '500 kW (nutrients)', 'Base productivity': '+50%', 'Modules': '4 slots' },
  },
  'cryogenic-plant': {
    id: 'cryogenic-plant', name: 'Cryogenic Plant', type: 'machine', category: 'Production',
    icon: '❄', w: 5, h: 5, craftingSpeed: 2, energyUsageKW: 1500,
    recipeCategories: ['cryogenics'],
    moduleSlots: 8,
    stats: { 'Crafting speed': '2', 'Energy': '1.5 MW', 'Modules': '8 slots' },
  },
  'recycler': {
    id: 'recycler', name: 'Recycler', type: 'machine', category: 'Production',
    icon: '♻', w: 4, h: 2, craftingSpeed: 0.5, energyUsageKW: 186, recipeCategories: ['recycling'],
    moduleSlots: 4,
    stats: { 'Crafting speed': '0.5', 'Energy': '186 kW', 'Modules': '4 slots (no productivity)' },
  },
  'lab': {
    id: 'lab', name: 'Lab', type: 'machine', category: 'Research',
    icon: '🔬', w: 3, h: 3, craftingSpeed: 1, energyUsageKW: 60, recipeCategories: ['research'],
    moduleSlots: 2,
    stats: { 'Research speed': '1', 'Energy': '60 kW', 'Modules': '2 slots' },
  },
  'biolab': {
    id: 'biolab', name: 'Biolab', type: 'machine', category: 'Research',
    // 50% science-pack drain is modeled as +100% productivity (double science
    // per pack), the closest equivalent in this engine.
    icon: '🧬', w: 5, h: 5, craftingSpeed: 2, energyUsageKW: 300, recipeCategories: ['research'],
    moduleSlots: 4, baseProductivity: 100,
    stats: { 'Research speed': '2', 'Energy': '300 kW', 'Science pack drain': '−50%', 'Modules': '4 slots' },
  },
  'rocket-silo': {
    id: 'rocket-silo', name: 'Rocket Silo', type: 'machine', category: 'Rocket',
    icon: '🚀', w: 9, h: 9, craftingSpeed: 1, energyUsageKW: 4000, recipeCategories: ['rocket-building'],
    moduleSlots: 4,
    stats: { 'Crafting speed': '1', 'Energy': '4 MW', 'Modules': '4 slots' },
  },

  'belt': {
    id: 'belt', name: 'Transport Belt', type: 'belt', category: 'Logistics',
    icon: '→', arrow: '→', w: 1, h: 1, stats: { 'Throughput': '15 items/s' },
  },
  'inserter': {
    id: 'inserter', name: 'Inserter', type: 'inserter', category: 'Logistics',
    icon: '↦', arrow: '↦', w: 1, h: 1, stats: { 'Swings': '~0.86/s' },
  },
  'long-handed-inserter': {
    id: 'long-handed-inserter', name: 'Long-handed Inserter', type: 'inserter', category: 'Logistics',
    icon: '↠', arrow: '↠', w: 1, h: 1, stats: { 'Swings': '~1.25/s', 'Reach': '2 tiles' },
  },
  'chest': {
    id: 'chest', name: 'Steel Chest', type: 'storage', category: 'Logistics',
    icon: '▣', w: 1, h: 1, stats: { 'Slots': '48' },
  },
  'fluid-tank': {
    id: 'fluid-tank', name: 'Storage Tank', type: 'storage', category: 'Logistics',
    icon: '▣', w: 3, h: 3, stats: { 'Capacity': '25,000 fluid' },
  },
  'medium-electric-pole': {
    id: 'medium-electric-pole', name: 'Medium Electric Pole', type: 'power', category: 'Power',
    icon: '⌁', w: 1, h: 1, stats: { 'Supply area': '7×7', 'Wire reach': '9 tiles' },
  },
  'substation': {
    id: 'substation', name: 'Substation', type: 'power', category: 'Power',
    icon: '⌁', w: 2, h: 2, stats: { 'Supply area': '18×18', 'Wire reach': '18 tiles' },
  },
  'pipe': {
    id: 'pipe', name: 'Pipe', type: 'pipe', category: 'Pipes',
    icon: '◯', w: 1, h: 1, stats: { 'Capacity': '100 fluid' },
  },
  'pipe-to-ground': {
    id: 'pipe-to-ground', name: 'Underground Pipe', type: 'pipe', category: 'Pipes',
    icon: '◍', w: 1, h: 1, stats: { 'Max distance': '10 tiles', 'Capacity': '100 fluid' },
  },
};

export const ENTITY_CATEGORIES = [...new Set(Object.values(ENTITY_DEFS).map(d => d.category))];

/** Every crafting category a recipe belongs to. */
export function recipeCategoriesOf(recipe) {
  if (!recipe) return [];
  return recipe.categories || (recipe.category ? [recipe.category] : []);
}

/** True when `def` is a machine that can run `recipe`. */
export function machineCanCraft(def, recipe) {
  if (!def || def.type !== 'machine' || !recipe) return false;
  const cats = def.recipeCategories || [];
  return recipeCategoriesOf(recipe).some(c => cats.includes(c));
}

export function recipesForDef(def) {
  if (!def || def.type !== 'machine' || !def.recipeCategories) return [];
  return Object.values(RECIPES).filter(r => machineCanCraft(def, r));
}

export function machinesForCategories(categories) {
  return Object.values(ENTITY_DEFS).filter(
    d => d.type === 'machine' && d.recipeCategories?.some(c => categories.includes(c))
  );
}
