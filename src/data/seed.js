// Demo design placed on first launch (when no autosaved workspace exists).
// A small electronic-circuit chain: ore → plates → cable/gears → circuits.

import { newId } from '../store/appStore.js';

function e(defId, x, y, extra = {}) {
  return {
    id: newId(),
    defId,
    quality: 'normal',
    x, y,
    rotation: 0,
    recipeId: null,
    machineCount: 1,
    craftingSpeedOverride: null,
    speedBonus: 0,
    productivityBonus: 0,
    ...extra,
  };
}

export function demoEntities() {
  return [
    // mining
    e('electric-mining-drill', 130, 128, { recipeId: 'mine-iron-ore', machineCount: 2 }),
    e('electric-mining-drill', 136, 128, { recipeId: 'mine-copper-ore' }),

    // smelting
    e('stone-furnace', 130, 134, { recipeId: 'iron-plate' }),
    e('stone-furnace', 133, 134, { recipeId: 'iron-plate' }),
    e('steel-furnace', 136, 134, { recipeId: 'copper-plate' }),

    // crafting
    e('assembling-machine-2', 130, 139, { recipeId: 'electronic-circuit' }),
    e('assembling-machine-1', 134, 139, { recipeId: 'iron-gear' }),
    e('assembling-machine-2', 138, 139, { recipeId: 'copper-cable' }),

    // layout flavor
    e('transport-belt', 130, 138), e('transport-belt', 131, 138),
    e('transport-belt', 132, 138), e('transport-belt', 133, 138),
    e('transport-belt', 134, 138), e('transport-belt', 135, 138),
    e('inserter', 136, 138), e('fast-inserter', 137, 138),
    e('small-electric-pole', 129, 133), e('small-electric-pole', 129, 139),
    e('steel-chest', 133, 143), e('wooden-chest', 134, 143),
  ];
}
