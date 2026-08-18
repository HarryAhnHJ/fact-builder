// Static game data. Pure data module — no imports from engine/store/UI.
// To add the full Factorio dataset later, extend ITEMS / RECIPES / ENTITY_DEFS here
// (or load a generated JSON into the same shapes); nothing else needs to change.

export const GRID_TILES = 300;

export const QUALITY_ORDER = ['normal', 'uncommon', 'rare', 'epic', 'legendary'];

export const QUALITIES = {
  normal:    { id: 'normal',    name: 'Normal',    tier: 0, color: '#9aa5b1', speedMultiplier: 1.0 },
  uncommon:  { id: 'uncommon',  name: 'Uncommon',  tier: 1, color: '#4fbf58', speedMultiplier: 1.3 },
  rare:      { id: 'rare',      name: 'Rare',      tier: 2, color: '#4d9be6', speedMultiplier: 1.6 },
  epic:      { id: 'epic',      name: 'Epic',      tier: 3, color: '#b46ae0', speedMultiplier: 1.9 },
  legendary: { id: 'legendary', name: 'Legendary', tier: 4, color: '#e8a33d', speedMultiplier: 2.5 },
};

export const ITEMS = {
  'iron-ore':           { id: 'iron-ore',           name: 'Iron Ore',           icon: '▴', color: '#7fa0c0', category: 'Raw' },
  'copper-ore':         { id: 'copper-ore',         name: 'Copper Ore',         icon: '▴', color: '#d98d5f', category: 'Raw' },
  'iron-plate':         { id: 'iron-plate',         name: 'Iron Plate',         icon: '▬', color: '#aebfcf', category: 'Intermediate products' },
  'copper-plate':       { id: 'copper-plate',       name: 'Copper Plate',       icon: '▬', color: '#e0966a', category: 'Intermediate products' },
  'copper-cable':       { id: 'copper-cable',       name: 'Copper Cable',       icon: '∿', color: '#e8a15c', category: 'Intermediate products' },
  'iron-gear':          { id: 'iron-gear',          name: 'Iron Gear Wheel',    icon: '⚙', color: '#b8c4d0', category: 'Intermediate products' },
  'electronic-circuit': { id: 'electronic-circuit', name: 'Electronic Circuit', icon: '⌁', color: '#7dd383', category: 'Intermediate products' },
};

// Recipe categories decide which machines can run a recipe (machine.recipeCategories).
export const RECIPES = {
  'mine-iron-ore': {
    id: 'mine-iron-ore', name: 'Mine Iron Ore', category: 'mining', craftingTime: 1,
    inputs: [], outputs: [{ itemId: 'iron-ore', amount: 1 }],
  },
  'mine-copper-ore': {
    id: 'mine-copper-ore', name: 'Mine Copper Ore', category: 'mining', craftingTime: 1,
    inputs: [], outputs: [{ itemId: 'copper-ore', amount: 1 }],
  },
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
    id: 'copper-cable', name: 'Copper Cable', category: 'crafting', craftingTime: 0.5,
    inputs: [{ itemId: 'copper-plate', amount: 1 }], outputs: [{ itemId: 'copper-cable', amount: 2 }],
  },
  'electronic-circuit': {
    id: 'electronic-circuit', name: 'Electronic Circuit', category: 'crafting', craftingTime: 0.5,
    inputs: [{ itemId: 'iron-plate', amount: 1 }, { itemId: 'copper-cable', amount: 3 }],
    outputs: [{ itemId: 'electronic-circuit', amount: 1 }],
  },
};

// Placeable entity definitions. type 'machine' contributes to rate calculations;
// other types are layout-only (belts, inserters, power, storage, pipes).
export const ENTITY_DEFS = {
  'electric-mining-drill': {
    id: 'electric-mining-drill', name: 'Electric Mining Drill', type: 'machine', category: 'Mining',
    icon: '⛏', w: 3, h: 3, craftingSpeed: 0.5, energyUsageKW: 90, recipeCategories: ['mining'],
    stats: { 'Mining speed': '0.5', 'Energy': '90 kW' },
  },
  'stone-furnace': {
    id: 'stone-furnace', name: 'Stone Furnace', type: 'machine', category: 'Furnaces',
    icon: '♨', w: 2, h: 2, craftingSpeed: 1, energyUsageKW: 90, recipeCategories: ['smelting'],
    stats: { 'Crafting speed': '1', 'Energy': '90 kW' },
  },
  'steel-furnace': {
    id: 'steel-furnace', name: 'Steel Furnace', type: 'machine', category: 'Furnaces',
    icon: '♨', w: 2, h: 2, craftingSpeed: 2, energyUsageKW: 90, recipeCategories: ['smelting'],
    stats: { 'Crafting speed': '2', 'Energy': '90 kW' },
  },
  'assembling-machine-1': {
    id: 'assembling-machine-1', name: 'Assembling Machine 1', type: 'machine', category: 'Assemblers',
    icon: '⚙', w: 3, h: 3, craftingSpeed: 0.5, energyUsageKW: 75, recipeCategories: ['crafting'],
    stats: { 'Crafting speed': '0.5', 'Energy': '75 kW' },
  },
  'assembling-machine-2': {
    id: 'assembling-machine-2', name: 'Assembling Machine 2', type: 'machine', category: 'Assemblers',
    icon: '⚙', w: 3, h: 3, craftingSpeed: 0.75, energyUsageKW: 150, recipeCategories: ['crafting'],
    stats: { 'Crafting speed': '0.75', 'Energy': '150 kW' },
  },
  'assembling-machine-3': {
    id: 'assembling-machine-3', name: 'Assembling Machine 3', type: 'machine', category: 'Assemblers',
    icon: '⚙', w: 3, h: 3, craftingSpeed: 1.25, energyUsageKW: 375, recipeCategories: ['crafting'],
    stats: { 'Crafting speed': '1.25', 'Energy': '375 kW' },
  },

  'transport-belt': {
    id: 'transport-belt', name: 'Transport Belt', type: 'belt', category: 'Belts',
    icon: '▶', w: 1, h: 1, stats: { 'Throughput': '15 items/s' },
  },
  'fast-transport-belt': {
    id: 'fast-transport-belt', name: 'Fast Transport Belt', type: 'belt', category: 'Belts',
    icon: '⏩', w: 1, h: 1, stats: { 'Throughput': '30 items/s' },
  },
  'inserter': {
    id: 'inserter', name: 'Inserter', type: 'inserter', category: 'Inserters',
    icon: '↻', w: 1, h: 1, stats: { 'Swings': '~0.83/s' },
  },
  'fast-inserter': {
    id: 'fast-inserter', name: 'Fast Inserter', type: 'inserter', category: 'Inserters',
    icon: '⟳', w: 1, h: 1, stats: { 'Swings': '~2.3/s' },
  },
  'small-electric-pole': {
    id: 'small-electric-pole', name: 'Small Electric Pole', type: 'power', category: 'Power',
    icon: '⌁', w: 1, h: 1, stats: { 'Supply area': '5×5' },
  },
  'medium-electric-pole': {
    id: 'medium-electric-pole', name: 'Medium Electric Pole', type: 'power', category: 'Power',
    icon: '⌁', w: 1, h: 1, stats: { 'Supply area': '7×7' },
  },
  'pipe': {
    id: 'pipe', name: 'Pipe', type: 'pipe', category: 'Pipes',
    icon: '◯', w: 1, h: 1, stats: {},
  },
  'storage-tank': {
    id: 'storage-tank', name: 'Storage Tank', type: 'storage', category: 'Storage',
    icon: '▣', w: 3, h: 3, stats: { 'Capacity': '25k fluid' },
  },
  'wooden-chest': {
    id: 'wooden-chest', name: 'Wooden Chest', type: 'storage', category: 'Storage',
    icon: '▢', w: 1, h: 1, stats: { 'Slots': '16' },
  },
  'steel-chest': {
    id: 'steel-chest', name: 'Steel Chest', type: 'storage', category: 'Storage',
    icon: '▣', w: 1, h: 1, stats: { 'Slots': '48' },
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
