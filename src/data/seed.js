// Demo design placed on first launch (when no autosaved workspace exists).
// A small electronic-circuit chain: plates → cable/gears → circuits.

import { newId } from '../store/appStore.js';

function e(defId, x, y, extra = {}) {
  return {
    id: newId(),
    defId,
    quality: 'normal',
    x, y,
    rotation: 0,
    recipeId: null,
    modules: [],
    ...extra,
  };
}

export function demoEntities() {
  return [
    // smelting
    e('stone-furnace', 130, 134, { recipeId: 'iron-plate' }),
    e('stone-furnace', 133, 134, { recipeId: 'iron-plate' }),
    e('steel-furnace', 136, 134, { recipeId: 'copper-plate' }),

    // crafting
    e('assembling-machine-2', 130, 139, { recipeId: 'electronic-circuit' }),
    e('assembling-machine-1', 134, 139, { recipeId: 'iron-gear' }),
    e('assembling-machine-2', 138, 139, { recipeId: 'copper-cable' }),

    // layout flavor
    e('belt', 130, 138), e('belt', 131, 138),
    e('belt', 132, 138), e('belt', 133, 138),
    e('belt', 134, 138), e('belt', 135, 138),
    e('inserter', 136, 138), e('long-handed-inserter', 137, 138),
    e('substation', 127, 136),
    e('chest', 133, 143), e('fluid-tank', 135, 143),
  ];
}
