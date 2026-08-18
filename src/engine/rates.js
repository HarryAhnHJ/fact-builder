// Calculation engine. Pure functions over placed-entity data — no UI/store imports.
// All rates are computed and kept in items PER SECOND at full precision.
// Rounding happens only in the display layer (ui/format.js).

import { ENTITY_DEFS, RECIPES, QUALITIES, MODULES } from '../data/gamedata.js';

export const EPS = 1e-9;

// Combined effect of the modules slotted into a placed entity.
// energyMultiplier is floored at 20% of base draw, matching the game.
export function moduleEffects(e) {
  let speed = 0;
  let productivity = 0;
  let energy = 0;
  for (const id of e.modules || []) {
    const m = MODULES[id];
    if (!m) continue;
    speed += m.effects?.speed || 0;
    productivity += m.effects?.productivity || 0;
    energy += m.effects?.energy || 0;
  }
  return { speed, productivity, energyMultiplier: Math.max(0.2, 1 + energy / 100) };
}

// Total productivity bonus %: machine base (e.g. foundry +50%) + modules.
export function totalProductivity(e) {
  const def = ENTITY_DEFS[e.defId];
  return (def?.baseProductivity || 0) + moduleEffects(e).productivity;
}

// Effective crafting speed of a placed machine: base speed × quality,
// with module speed effects applied on top.
export function effectiveCraftingSpeed(e) {
  const def = ENTITY_DEFS[e.defId];
  if (!def || def.type !== 'machine') return 0;
  const quality = QUALITIES[e.quality] || QUALITIES.normal;
  const base = def.craftingSpeed * quality.speedMultiplier;
  return Math.max(0, base * (1 + moduleEffects(e).speed / 100));
}

// Power draw in kW of a placed machine, with modules.
export function machineEnergyKW(e) {
  const def = ENTITY_DEFS[e.defId];
  if (!def || def.type !== 'machine') return 0;
  return (def.energyUsageKW || 0) * moduleEffects(e).energyMultiplier;
}

// Per-entity rates: { rates: {itemId: {cons, prod}}, craftsPerSecond } or null
// for entities that do not produce/consume (no recipe, or layout-only types).
export function entityRates(e) {
  const def = ENTITY_DEFS[e.defId];
  if (!def || def.type !== 'machine' || !e.recipeId) return null;
  const recipe = RECIPES[e.recipeId];
  if (!recipe || !def.recipeCategories?.includes(recipe.category) || recipe.craftingTime <= 0) return null;

  const craftsPerSecond = effectiveCraftingSpeed(e) / recipe.craftingTime;
  const prodMult = 1 + totalProductivity(e) / 100;

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
export function aggregateRates(entities = []) {
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
      machineUnits += 1;
      powerKW += machineEnergyKW(e);
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
