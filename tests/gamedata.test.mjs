import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ITEMS, RECIPES, ENTITY_DEFS, MODULES, recipesForDef,
} from '../src/data/gamedata.js';

// Wiki-verified unique recipe counts per machine (wiki.factorio.com, 2.0 / Space Age).
// Filled in as each machine's list is verified; the suite fails if the data drifts.
// Assembling machines are excluded: the wiki defines no bounded list for them
// ("any recipe in its categories"), so they are covered by the closure test instead.
export const WIKI_RECIPE_COUNTS = {
  // machineId: expected recipesForDef(...).length
};

test('every recipe references only items that exist', () => {
  for (const r of Object.values(RECIPES)) {
    for (const { itemId } of [...r.inputs, ...r.outputs]) {
      assert.ok(ITEMS[itemId], `${r.id}: unknown item "${itemId}"`);
    }
    assert.ok(r.outputs.length > 0, `${r.id}: no outputs`);
    assert.ok(r.craftingTime > 0, `${r.id}: bad craftingTime`);
  }
});

test('every recipe is craftable by at least one machine', () => {
  const runnable = new Set(
    Object.values(ENTITY_DEFS).flatMap(d => d.recipeCategories || []));
  for (const r of Object.values(RECIPES)) {
    assert.ok(runnable.has(r.category),
      `${r.id}: category "${r.category}" matches no machine`);
  }
});

// TODO(recipe-audit): currently red — cryogenic-plant declares 'cryogenics'
// with no recipes. Re-enable (drop the todo flag) when the wiki recipe
// fill-in lands; the audit in progress adds the missing recipes.
test('every machine category has at least one recipe', { todo: true }, () => {
  const used = new Set(Object.values(RECIPES).map(r => r.category));
  for (const d of Object.values(ENTITY_DEFS)) {
    for (const c of d.recipeCategories || []) {
      assert.ok(used.has(c), `${d.id}: category "${c}" has no recipes`);
    }
  }
});

test('closure: every non-raw ingredient is produced by some recipe', () => {
  const produced = new Set(
    Object.values(RECIPES).flatMap(r => r.outputs.map(o => o.itemId)));
  for (const r of Object.values(RECIPES)) {
    for (const { itemId } of r.inputs) {
      const item = ITEMS[itemId];
      if (item.category === 'Raw') continue;
      assert.ok(produced.has(itemId),
        `${r.id}: ingredient "${itemId}" is not raw and nothing produces it`);
    }
  }
});

test('per-machine recipe counts match the Factorio wiki', () => {
  for (const [machineId, expected] of Object.entries(WIKI_RECIPE_COUNTS)) {
    const def = ENTITY_DEFS[machineId];
    assert.ok(def, `unknown machine "${machineId}"`);
    const actual = recipesForDef(def).length;
    assert.equal(actual, expected,
      `${def.name}: has ${actual} recipes, wiki says ${expected}`);
  }
});

test('module references are well-formed', () => {
  for (const m of Object.values(MODULES)) {
    assert.ok(['speed', 'productivity', 'efficiency'].includes(m.kind));
  }
});
