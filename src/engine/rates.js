// Calculation engine. Pure functions over placed-entity data — no UI/store imports.
// All rates are computed and kept in items PER SECOND at full precision.
// Rounding happens only in the display layer (ui/format.js).

import { ENTITY_DEFS, RECIPES, QUALITIES } from '../data/gamedata.js';

export const EPS = 1e-9;

// Effective crafting speed of one machine of this placed entity.
// craftingSpeedOverride (when set) replaces base speed × quality;
// the module/beacon speed bonus still applies on top.
export function effectiveCraftingSpeed(e) {
  const def = ENTITY_DEFS[e.defId];
  if (!def || def.type !== 'machine') return 0;
  const quality = QUALITIES[e.quality] || QUALITIES.normal;
  const base = e.craftingSpeedOverride != null
    ? e.craftingSpeedOverride
    : def.craftingSpeed * quality.speedMultiplier;
  return base * (1 + (e.speedBonus || 0) / 100);
}

// Per-entity rates: { rates: {itemId: {cons, prod}}, craftsPerSecond } or null
// for entities that do not produce/consume (no recipe, or layout-only types).
export function entityRates(e) {
  const def = ENTITY_DEFS[e.defId];
  if (!def || def.type !== 'machine' || !e.recipeId) return null;
  const recipe = RECIPES[e.recipeId];
  if (!recipe) return null;

  const speed = effectiveCraftingSpeed(e);
  const count = Math.max(1, e.machineCount || 1);
  const craftsPerSecond = (speed / recipe.craftingTime) * count;
  const prodMult = 1 + (e.productivityBonus || 0) / 100;

  const rates = {};
  for (const { itemId, amount } of recipe.inputs) {
    const r = rates[itemId] || (rates[itemId] = { cons: 0, prod: 0 });
    r.cons += amount * craftsPerSecond;
  }
  for (const { itemId, amount } of recipe.outputs) {
    const r = rates[itemId] || (rates[itemId] = { cons: 0, prod: 0 });
    r.prod += amount * craftsPerSecond * prodMult;
  }
  return { rates, craftsPerSecond };
}

// Aggregate a set of placed entities → Map(itemId → {cons, prod}).
// Independent of visual positions.
export function aggregateRates(entities) {
  const total = new Map();
  for (const e of entities) {
    const r = entityRates(e);
    if (!r) continue;
    for (const [itemId, { cons, prod }] of Object.entries(r.rates)) {
      const t = total.get(itemId) || { cons: 0, prod: 0 };
      t.cons += cons;
      t.prod += prod;
      total.set(itemId, t);
    }
  }
  return total;
}

// Map → sortable rows [{itemId, cons, prod, net}], net = prod - cons.
export function ratesToRows(map) {
  return [...map.entries()].map(([itemId, { cons, prod }]) => ({
    itemId, cons, prod, net: prod - cons,
  }));
}

export function designStats(entities) {
  const rows = ratesToRows(aggregateRates(entities));
  let machineUnits = 0;
  let powerKW = 0;
  for (const e of entities) {
    const def = ENTITY_DEFS[e.defId];
    if (def?.type === 'machine') {
      const count = Math.max(1, e.machineCount || 1);
      machineUnits += count;
      powerKW += (def.energyUsageKW || 0) * count;
    }
  }
  return {
    placedCount: entities.length,
    machineUnits,
    powerKW,
    netInputs: rows.filter(r => r.net < -EPS).length,
    netOutputs: rows.filter(r => r.net > EPS).length,
    balanced: rows.filter(r => Math.abs(r.net) <= EPS && (r.cons > EPS || r.prod > EPS)).length,
  };
}
