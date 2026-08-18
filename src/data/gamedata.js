// Static game data. Pure data module — no imports from engine/store/UI.
// To add the full Factorio dataset later, extend ITEMS / RECIPES / ENTITY_DEFS here
// (or load a generated JSON into the same shapes); nothing else needs to change.
// Entity dimensions, speeds, energy, productivity, and recipes verified against
// wiki.factorio.com (Factorio 2.0 / Space Age).

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

export const ITEMS = {
  'iron-ore':           { id: 'iron-ore',           name: 'Iron Ore',           icon: '▴', color: '#7fa0c0', category: 'Raw' },
  'copper-ore':         { id: 'copper-ore',         name: 'Copper Ore',         icon: '▴', color: '#d98d5f', category: 'Raw' },
  'coal':               { id: 'coal',               name: 'Coal',               icon: '●', color: '#6f7780', category: 'Raw' },
  'calcite':            { id: 'calcite',            name: 'Calcite',            icon: '▴', color: '#e6e2d8', category: 'Raw' },
  'uranium-ore':        { id: 'uranium-ore',        name: 'Uranium Ore',        icon: '▴', color: '#7ee87a', category: 'Raw' },
  'crude-oil':          { id: 'crude-oil',          name: 'Crude Oil',          icon: '≋', color: '#8a6aa0', category: 'Raw' },
  'water':              { id: 'water',              name: 'Water',              icon: '≋', color: '#6db8e8', category: 'Raw' },
  'scrap':              { id: 'scrap',              name: 'Scrap',              icon: '◈', color: '#b09a70', category: 'Raw' },
  'spoilage':           { id: 'spoilage',           name: 'Spoilage',           icon: '▒', color: '#8a7a4a', category: 'Raw' },

  'iron-plate':         { id: 'iron-plate',         name: 'Iron Plate',         icon: '▬', color: '#aebfcf', category: 'Intermediate products' },
  'copper-plate':       { id: 'copper-plate',       name: 'Copper Plate',       icon: '▬', color: '#e0966a', category: 'Intermediate products' },
  'steel-plate':        { id: 'steel-plate',        name: 'Steel Plate',        icon: '▬', color: '#c8d4e0', category: 'Intermediate products' },
  'molten-iron':        { id: 'molten-iron',        name: 'Molten Iron',        icon: '≈', color: '#f2924a', category: 'Intermediate products' },
  'molten-copper':      { id: 'molten-copper',      name: 'Molten Copper',      icon: '≈', color: '#e8703a', category: 'Intermediate products' },
  'copper-cable':       { id: 'copper-cable',       name: 'Copper Cable',       icon: '∿', color: '#e8a15c', category: 'Intermediate products' },
  'iron-gear':          { id: 'iron-gear',          name: 'Iron Gear Wheel',    icon: '⚙', color: '#b8c4d0', category: 'Intermediate products' },
  'electronic-circuit': { id: 'electronic-circuit', name: 'Electronic Circuit', icon: '⌁', color: '#7dd383', category: 'Intermediate products' },
  'advanced-circuit':   { id: 'advanced-circuit',   name: 'Advanced Circuit',   icon: '⌁', color: '#e8746d', category: 'Intermediate products' },
  'processing-unit':    { id: 'processing-unit',    name: 'Processing Unit',    icon: '⌁', color: '#6da9e8', category: 'Intermediate products' },
  'heavy-oil':          { id: 'heavy-oil',          name: 'Heavy Oil',          icon: '≋', color: '#c0503a', category: 'Intermediate products' },
  'light-oil':          { id: 'light-oil',          name: 'Light Oil',          icon: '≋', color: '#e8b04a', category: 'Intermediate products' },
  'petroleum-gas':      { id: 'petroleum-gas',      name: 'Petroleum Gas',      icon: '≋', color: '#b8a0d0', category: 'Intermediate products' },
  'solid-fuel':         { id: 'solid-fuel',         name: 'Solid Fuel',         icon: '▪', color: '#c8b878', category: 'Intermediate products' },
  'plastic-bar':        { id: 'plastic-bar',        name: 'Plastic Bar',        icon: '▬', color: '#e8e8e8', category: 'Intermediate products' },
  'sulfur':             { id: 'sulfur',             name: 'Sulfur',             icon: '▴', color: '#e8d44c', category: 'Intermediate products' },
  'sulfuric-acid':      { id: 'sulfuric-acid',      name: 'Sulfuric Acid',      icon: '≋', color: '#d8e04a', category: 'Intermediate products' },
  'uranium-235':        { id: 'uranium-235',        name: 'Uranium-235',        icon: '◆', color: '#a0f09a', category: 'Intermediate products' },
  'uranium-238':        { id: 'uranium-238',        name: 'Uranium-238',        icon: '◆', color: '#5a8a58', category: 'Intermediate products' },
  'nutrients':          { id: 'nutrients',          name: 'Nutrients',          icon: '❋', color: '#7ec46a', category: 'Intermediate products' },
  'transport-belt':     { id: 'transport-belt',     name: 'Transport Belt',     icon: '→', color: '#e8c04a', category: 'Intermediate products' },
  'inserter':           { id: 'inserter',           name: 'Inserter',           icon: '↦', color: '#e8d44c', category: 'Intermediate products' },
  'low-density-structure': { id: 'low-density-structure', name: 'Low Density Structure', icon: '▱', color: '#d0c8b0', category: 'Intermediate products' },
  'rocket-fuel':        { id: 'rocket-fuel',        name: 'Rocket Fuel',        icon: '▮', color: '#e8a86a', category: 'Intermediate products' },
  'rocket-part':        { id: 'rocket-part',        name: 'Rocket Part',        icon: '▲', color: '#c0cad4', category: 'Intermediate products' },

  'speed-module':        { id: 'speed-module',        name: 'Speed Module',        icon: '▤', color: '#5aa9f5', category: 'Modules' },
  'productivity-module': { id: 'productivity-module', name: 'Productivity Module', icon: '▤', color: '#e8746d', category: 'Modules' },
  'efficiency-module':   { id: 'efficiency-module',   name: 'Efficiency Module',   icon: '▤', color: '#6fce7e', category: 'Modules' },

  'automation-science-pack': { id: 'automation-science-pack', name: 'Automation Science Pack', icon: '⚗', color: '#e8746d', category: 'Science' },
  'logistic-science-pack':   { id: 'logistic-science-pack',   name: 'Logistic Science Pack',   icon: '⚗', color: '#6fce7e', category: 'Science' },
  'science':                 { id: 'science',                 name: 'Science',                 icon: '✦', color: '#b46ae0', category: 'Science' },
};

// Recipe categories decide which machines can run a recipe (machine.recipeCategories).
// 'crafting-with-fluid' / 'electronics-fluid' mark recipes with fluid inputs, which
// assembling machine 1 cannot run.
export const RECIPES = {
  'iron-plate': {
    id: 'iron-plate', name: 'Iron Plate', category: 'smelting', craftingTime: 3.2,
    inputs: [{ itemId: 'iron-ore', amount: 1 }], outputs: [{ itemId: 'iron-plate', amount: 1 }],
  },
  'copper-plate': {
    id: 'copper-plate', name: 'Copper Plate', category: 'smelting', craftingTime: 3.2,
    inputs: [{ itemId: 'copper-ore', amount: 1 }], outputs: [{ itemId: 'copper-plate', amount: 1 }],
  },
  'iron-gear': {
    id: 'iron-gear', name: 'Iron Gear Wheel', category: 'crafting', craftingTime: 0.5,
    inputs: [{ itemId: 'iron-plate', amount: 2 }], outputs: [{ itemId: 'iron-gear', amount: 1 }],
  },
  'copper-cable': {
    id: 'copper-cable', name: 'Copper Cable', category: 'electronics', craftingTime: 0.5,
    inputs: [{ itemId: 'copper-plate', amount: 1 }], outputs: [{ itemId: 'copper-cable', amount: 2 }],
  },
  'electronic-circuit': {
    id: 'electronic-circuit', name: 'Electronic Circuit', category: 'electronics', craftingTime: 0.5,
    inputs: [{ itemId: 'iron-plate', amount: 1 }, { itemId: 'copper-cable', amount: 3 }],
    outputs: [{ itemId: 'electronic-circuit', amount: 1 }],
  },
  'transport-belt': {
    id: 'transport-belt', name: 'Transport Belt', category: 'crafting', craftingTime: 0.5,
    inputs: [{ itemId: 'iron-plate', amount: 1 }, { itemId: 'iron-gear', amount: 1 }],
    outputs: [{ itemId: 'transport-belt', amount: 2 }],
  },
  'inserter': {
    id: 'inserter', name: 'Inserter', category: 'crafting', craftingTime: 0.5,
    inputs: [
      { itemId: 'iron-plate', amount: 1 },
      { itemId: 'iron-gear', amount: 1 },
      { itemId: 'electronic-circuit', amount: 1 },
    ],
    outputs: [{ itemId: 'inserter', amount: 1 }],
  },

  // ---- smelting ----
  'steel-plate': {
    id: 'steel-plate', name: 'Steel Plate', category: 'smelting', craftingTime: 16,
    inputs: [{ itemId: 'iron-plate', amount: 5 }], outputs: [{ itemId: 'steel-plate', amount: 1 }],
  },

  // ---- metallurgy (foundry) ----
  'molten-iron': {
    id: 'molten-iron', name: 'Molten Iron', category: 'metallurgy', craftingTime: 32,
    inputs: [{ itemId: 'iron-ore', amount: 50 }, { itemId: 'calcite', amount: 1 }],
    outputs: [{ itemId: 'molten-iron', amount: 500 }],
  },
  'molten-copper': {
    id: 'molten-copper', name: 'Molten Copper', category: 'metallurgy', craftingTime: 32,
    inputs: [{ itemId: 'copper-ore', amount: 50 }, { itemId: 'calcite', amount: 1 }],
    outputs: [{ itemId: 'molten-copper', amount: 500 }],
  },
  'casting-iron-plate': {
    id: 'casting-iron-plate', name: 'Casting Iron Plate', category: 'metallurgy', craftingTime: 3.2,
    inputs: [{ itemId: 'molten-iron', amount: 20 }], outputs: [{ itemId: 'iron-plate', amount: 2 }],
  },
  'casting-copper-plate': {
    id: 'casting-copper-plate', name: 'Casting Copper Plate', category: 'metallurgy', craftingTime: 3.2,
    inputs: [{ itemId: 'molten-copper', amount: 20 }], outputs: [{ itemId: 'copper-plate', amount: 2 }],
  },
  'casting-steel': {
    id: 'casting-steel', name: 'Casting Steel', category: 'metallurgy', craftingTime: 3.2,
    inputs: [{ itemId: 'molten-iron', amount: 30 }], outputs: [{ itemId: 'steel-plate', amount: 1 }],
  },

  // ---- oil & chemistry ----
  'basic-oil-processing': {
    id: 'basic-oil-processing', name: 'Basic Oil Processing', category: 'oil-processing', craftingTime: 5,
    inputs: [{ itemId: 'crude-oil', amount: 100 }], outputs: [{ itemId: 'petroleum-gas', amount: 45 }],
  },
  'advanced-oil-processing': {
    id: 'advanced-oil-processing', name: 'Advanced Oil Processing', category: 'oil-processing', craftingTime: 5,
    inputs: [{ itemId: 'crude-oil', amount: 100 }, { itemId: 'water', amount: 50 }],
    outputs: [
      { itemId: 'heavy-oil', amount: 25 },
      { itemId: 'light-oil', amount: 45 },
      { itemId: 'petroleum-gas', amount: 55 },
    ],
  },
  'solid-fuel-from-light-oil': {
    id: 'solid-fuel-from-light-oil', name: 'Solid Fuel (Light Oil)', category: 'chemistry', craftingTime: 1,
    inputs: [{ itemId: 'light-oil', amount: 10 }], outputs: [{ itemId: 'solid-fuel', amount: 1 }],
  },
  'plastic-bar': {
    id: 'plastic-bar', name: 'Plastic Bar', category: 'chemistry', craftingTime: 1,
    inputs: [{ itemId: 'coal', amount: 1 }, { itemId: 'petroleum-gas', amount: 20 }],
    outputs: [{ itemId: 'plastic-bar', amount: 2 }],
  },
  'sulfur': {
    id: 'sulfur', name: 'Sulfur', category: 'chemistry', craftingTime: 1,
    inputs: [{ itemId: 'water', amount: 30 }, { itemId: 'petroleum-gas', amount: 30 }],
    outputs: [{ itemId: 'sulfur', amount: 2 }],
  },
  'sulfuric-acid': {
    id: 'sulfuric-acid', name: 'Sulfuric Acid', category: 'chemistry', craftingTime: 1,
    inputs: [
      { itemId: 'iron-plate', amount: 1 },
      { itemId: 'sulfur', amount: 5 },
      { itemId: 'water', amount: 100 },
    ],
    outputs: [{ itemId: 'sulfuric-acid', amount: 50 }],
  },

  // ---- electronics (EM plant / assemblers) ----
  'advanced-circuit': {
    id: 'advanced-circuit', name: 'Advanced Circuit', category: 'electronics', craftingTime: 6,
    inputs: [
      { itemId: 'plastic-bar', amount: 2 },
      { itemId: 'copper-cable', amount: 4 },
      { itemId: 'electronic-circuit', amount: 2 },
    ],
    outputs: [{ itemId: 'advanced-circuit', amount: 1 }],
  },
  'processing-unit': {
    id: 'processing-unit', name: 'Processing Unit', category: 'electronics-fluid', craftingTime: 10,
    inputs: [
      { itemId: 'electronic-circuit', amount: 20 },
      { itemId: 'advanced-circuit', amount: 2 },
      { itemId: 'sulfuric-acid', amount: 5 },
    ],
    outputs: [{ itemId: 'processing-unit', amount: 1 }],
  },
  'speed-module': {
    id: 'speed-module', name: 'Speed Module', category: 'electronics', craftingTime: 15,
    inputs: [{ itemId: 'advanced-circuit', amount: 5 }, { itemId: 'electronic-circuit', amount: 5 }],
    outputs: [{ itemId: 'speed-module', amount: 1 }],
  },
  'productivity-module': {
    id: 'productivity-module', name: 'Productivity Module', category: 'electronics', craftingTime: 15,
    inputs: [{ itemId: 'advanced-circuit', amount: 5 }, { itemId: 'electronic-circuit', amount: 5 }],
    outputs: [{ itemId: 'productivity-module', amount: 1 }],
  },
  'efficiency-module': {
    id: 'efficiency-module', name: 'Efficiency Module', category: 'electronics', craftingTime: 15,
    inputs: [{ itemId: 'advanced-circuit', amount: 5 }, { itemId: 'electronic-circuit', amount: 5 }],
    outputs: [{ itemId: 'efficiency-module', amount: 1 }],
  },

  // ---- centrifuging ----
  'uranium-processing': {
    id: 'uranium-processing', name: 'Uranium Processing', category: 'centrifuging', craftingTime: 12,
    inputs: [{ itemId: 'uranium-ore', amount: 10 }],
    outputs: [{ itemId: 'uranium-235', amount: 0.007 }, { itemId: 'uranium-238', amount: 0.993 }],
  },

  // ---- organics (biochamber) ----
  'nutrients-from-spoilage': {
    id: 'nutrients-from-spoilage', name: 'Nutrients from Spoilage', category: 'organics', craftingTime: 2,
    inputs: [{ itemId: 'spoilage', amount: 10 }], outputs: [{ itemId: 'nutrients', amount: 1 }],
  },

  // ---- recycling (recycler) ----
  // Recycling returns on average 25% of a recipe's ingredients (fluids are lost)
  // and takes 1/16 of the original crafting time. Outputs below are expected values.
  'scrap-recycling': {
    id: 'scrap-recycling', name: 'Scrap Recycling', category: 'recycling', craftingTime: 0.2,
    inputs: [{ itemId: 'scrap', amount: 1 }],
    // expected drops per scrap (items not in this dataset — concrete, ice, stone,
    // battery, holmium ore — are omitted)
    outputs: [
      { itemId: 'iron-gear', amount: 0.2 },
      { itemId: 'solid-fuel', amount: 0.07 },
      { itemId: 'steel-plate', amount: 0.04 },
      { itemId: 'copper-cable', amount: 0.03 },
      { itemId: 'advanced-circuit', amount: 0.03 },
      { itemId: 'processing-unit', amount: 0.02 },
      { itemId: 'low-density-structure', amount: 0.01 },
    ],
  },
  'iron-gear-recycling': {
    id: 'iron-gear-recycling', name: 'Iron Gear Wheel Recycling', category: 'recycling', craftingTime: 0.03125,
    inputs: [{ itemId: 'iron-gear', amount: 1 }], outputs: [{ itemId: 'iron-plate', amount: 0.5 }],
  },
  'copper-cable-recycling': {
    id: 'copper-cable-recycling', name: 'Copper Cable Recycling', category: 'recycling', craftingTime: 0.03125,
    inputs: [{ itemId: 'copper-cable', amount: 1 }], outputs: [{ itemId: 'copper-plate', amount: 0.125 }],
  },
  'electronic-circuit-recycling': {
    id: 'electronic-circuit-recycling', name: 'Electronic Circuit Recycling', category: 'recycling', craftingTime: 0.03125,
    inputs: [{ itemId: 'electronic-circuit', amount: 1 }],
    outputs: [{ itemId: 'copper-cable', amount: 0.75 }, { itemId: 'iron-plate', amount: 0.25 }],
  },
  'advanced-circuit-recycling': {
    id: 'advanced-circuit-recycling', name: 'Advanced Circuit Recycling', category: 'recycling', craftingTime: 0.375,
    inputs: [{ itemId: 'advanced-circuit', amount: 1 }],
    outputs: [
      { itemId: 'copper-cable', amount: 1 },
      { itemId: 'plastic-bar', amount: 0.5 },
      { itemId: 'electronic-circuit', amount: 0.5 },
    ],
  },
  'processing-unit-recycling': {
    id: 'processing-unit-recycling', name: 'Processing Unit Recycling', category: 'recycling', craftingTime: 0.625,
    inputs: [{ itemId: 'processing-unit', amount: 1 }],
    outputs: [
      { itemId: 'electronic-circuit', amount: 5 },
      { itemId: 'advanced-circuit', amount: 0.5 },
    ],
  },

  // ---- science & research ----
  'automation-science-pack': {
    id: 'automation-science-pack', name: 'Automation Science Pack', category: 'crafting', craftingTime: 5,
    inputs: [{ itemId: 'copper-plate', amount: 1 }, { itemId: 'iron-gear', amount: 1 }],
    outputs: [{ itemId: 'automation-science-pack', amount: 1 }],
  },
  'logistic-science-pack': {
    id: 'logistic-science-pack', name: 'Logistic Science Pack', category: 'crafting', craftingTime: 6,
    inputs: [{ itemId: 'transport-belt', amount: 1 }, { itemId: 'inserter', amount: 1 }],
    outputs: [{ itemId: 'logistic-science-pack', amount: 1 }],
  },
  'research': {
    id: 'research', name: 'Research', category: 'research', craftingTime: 60,
    inputs: [
      { itemId: 'automation-science-pack', amount: 1 },
      { itemId: 'logistic-science-pack', amount: 1 },
    ],
    outputs: [{ itemId: 'science', amount: 60 }],
  },

  // ---- rocket building ----
  'low-density-structure': {
    id: 'low-density-structure', name: 'Low Density Structure', category: 'crafting', craftingTime: 15,
    inputs: [
      { itemId: 'copper-plate', amount: 20 },
      { itemId: 'plastic-bar', amount: 5 },
      { itemId: 'steel-plate', amount: 2 },
    ],
    outputs: [{ itemId: 'low-density-structure', amount: 1 }],
  },
  'rocket-fuel': {
    id: 'rocket-fuel', name: 'Rocket Fuel', category: 'crafting-with-fluid', craftingTime: 15,
    inputs: [{ itemId: 'solid-fuel', amount: 10 }, { itemId: 'light-oil', amount: 10 }],
    outputs: [{ itemId: 'rocket-fuel', amount: 1 }],
  },
  'rocket-part': {
    id: 'rocket-part', name: 'Rocket Part', category: 'rocket-building', craftingTime: 3,
    inputs: [
      { itemId: 'low-density-structure', amount: 1 },
      { itemId: 'processing-unit', amount: 1 },
      { itemId: 'rocket-fuel', amount: 1 },
    ],
    outputs: [{ itemId: 'rocket-part', amount: 1 }],
  },
};

// Placeable entity definitions. type 'machine' contributes to rate calculations;
// other types are layout-only (belts, inserters, power, storage, pipes).
// Energy values are active consumption (drain not modeled separately).
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
    recipeCategories: ['crafting', 'electronics'], // cannot run recipes with fluids
    stats: { 'Crafting speed': '0.5', 'Energy': '75 kW' },
  },
  'assembling-machine-2': {
    id: 'assembling-machine-2', name: 'Assembling Machine 2', type: 'machine', category: 'Assemblers',
    icon: '⚙', w: 3, h: 3, craftingSpeed: 0.75, energyUsageKW: 150,
    recipeCategories: ['crafting', 'crafting-with-fluid', 'electronics', 'electronics-fluid'],
    moduleSlots: 2,
    stats: { 'Crafting speed': '0.75', 'Energy': '150 kW', 'Modules': '2 slots' },
  },
  'assembling-machine-3': {
    id: 'assembling-machine-3', name: 'Assembling Machine 3', type: 'machine', category: 'Assemblers',
    icon: '⚙', w: 3, h: 3, craftingSpeed: 1.25, energyUsageKW: 375,
    recipeCategories: ['crafting', 'crafting-with-fluid', 'electronics', 'electronics-fluid'],
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
    recipeCategories: ['electronics', 'electronics-fluid'],
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
    icon: '❁', w: 3, h: 3, craftingSpeed: 2, energyUsageKW: 500, recipeCategories: ['organics'],
    moduleSlots: 4, baseProductivity: 50,
    stats: { 'Crafting speed': '2', 'Energy': '500 kW (nutrients)', 'Base productivity': '+50%', 'Modules': '4 slots' },
  },
  'cryogenic-plant': {
    id: 'cryogenic-plant', name: 'Cryogenic Plant', type: 'machine', category: 'Production',
    icon: '❄', w: 5, h: 5, craftingSpeed: 2, energyUsageKW: 1500,
    recipeCategories: ['chemistry', 'crafting-with-fluid', 'cryogenics'],
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

export function recipesForDef(def) {
  if (!def || def.type !== 'machine' || !def.recipeCategories) return [];
  return Object.values(RECIPES).filter(r => def.recipeCategories.includes(r.category));
}

export function machinesForCategories(categories) {
  return Object.values(ENTITY_DEFS).filter(
    d => d.type === 'machine' && d.recipeCategories?.some(c => categories.includes(c))
  );
}
