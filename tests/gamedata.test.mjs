import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ITEMS, RECIPES, ENTITY_DEFS, MODULES, recipesForDef, recipeCategoriesOf, machineCanCraft,
} from '../src/data/gamedata.js';

// Per-machine recipe counts, verified against the official prototype data in
// github.com/wube/factorio-data (2.0 / Space Age) and wiki.factorio.com.
// These are exact: a machine offers every recipe in its crafting categories,
// the same rule the game uses. Change one only alongside a source citation.
//
// Scope exclusions applied consistently (see gamedata.js header): weapons and
// ammo, mining machines, and space-platform-only recipes.
//
// Cross-check against the wiki's "unique recipes" infobox counts, which count
// only recipes exclusive to that machine:
//   foundry            29 = 19 metallurgy-only + 9 belt/splitter (shared with
//                           assemblers) + holmium plate (shared)
//                           wiki says 20 unique; ours is 19 because the 20th,
//                           Big mining drill, is an excluded mining machine.
//   electromagnetic    27 = 7 electromagnetics-only + 20 shared with assemblers
//                           (circuits, cables, poles, substation, accumulator,
//                           solar panel, beacon, 9 modules)
//   cryogenic plant    15 = 10 cryogenics-only + 5 shared with the chem plant
//   biochamber         21 = 18 organic-only + 3 shared with the chem plant
//   recycler           14 = scrap recycling + 13 item recycling recipes. The
//                           game auto-generates recycling for most items (25% of
//                           the main recipe's solid ingredients, craft time/16);
//                           we include the Fulgora scrap-processing set: the 4
//                           circuit/gear/cable recipes, battery, concrete, LDS,
//                           the three self-recycling plates, and iron/steel chest.
//   assembler 1/3/3    +2 vs. prior (41/51/51 → 43/53/53) for iron & steel chest
//                           crafting (crafting category, wiki.factorio.com).
const WIKI_RECIPE_COUNTS = {
  'stone-furnace': 5,
  'steel-furnace': 5,
  'electric-furnace': 5,
  'assembling-machine-1': 43,
  'assembling-machine-2': 53,
  'assembling-machine-3': 53,
  'foundry': 29,
  'electromagnetic-plant': 27,
  'chemical-plant': 23,
  'oil-refinery': 3,
  'centrifuge': 4,
  'biochamber': 21,
  'cryogenic-plant': 15,
  'recycler': 14,
  'lab': 1,
  'biolab': 1,
  'rocket-silo': 1,
};

test('every recipe references only items that exist', () => {
  for (const r of Object.values(RECIPES)) {
    for (const { itemId } of [...r.inputs, ...r.outputs]) {
      assert.ok(ITEMS[itemId], `${r.id}: unknown item "${itemId}"`);
    }
    assert.ok(r.outputs.length > 0, `${r.id}: no outputs`);
    assert.ok(r.craftingTime > 0, `${r.id}: bad craftingTime`);
    assert.ok(recipeCategoriesOf(r).length > 0, `${r.id}: no crafting category`);
  }
});

test('every recipe is craftable by at least one machine', () => {
  for (const r of Object.values(RECIPES)) {
    const machines = Object.values(ENTITY_DEFS).filter(d => machineCanCraft(d, r));
    assert.ok(machines.length > 0, `${r.id}: no machine can craft it`);
  }
});

test('every machine crafting category has at least one recipe', () => {
  const used = new Set(Object.values(RECIPES).flatMap(recipeCategoriesOf));
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
      if (ITEMS[itemId].category === 'Raw') continue;
      assert.ok(produced.has(itemId),
        `${r.id}: ingredient "${itemId}" is not raw and nothing produces it`);
    }
  }
});

test('per-machine recipe counts match the verified Factorio data', () => {
  const machineIds = Object.values(ENTITY_DEFS)
    .filter(d => d.type === 'machine').map(d => d.id);
  assert.deepEqual(
    machineIds.filter(id => !(id in WIKI_RECIPE_COUNTS)), [],
    'a machine has no expected recipe count — add it to WIKI_RECIPE_COUNTS');

  for (const [machineId, expected] of Object.entries(WIKI_RECIPE_COUNTS)) {
    const def = ENTITY_DEFS[machineId];
    assert.ok(def, `unknown machine "${machineId}"`);
    const actual = recipesForDef(def).length;
    assert.equal(actual, expected,
      `${def.name}: has ${actual} recipes, verified data says ${expected}`);
  }
});

test('every production machine can actually craft something', () => {
  for (const d of Object.values(ENTITY_DEFS)) {
    if (d.type !== 'machine') continue;
    assert.ok(recipesForDef(d).length > 0, `${d.id}: no craftable recipes`);
  }
});

test('module references are well-formed', () => {
  for (const m of Object.values(MODULES)) {
    assert.ok(['speed', 'productivity', 'efficiency'].includes(m.kind));
    assert.ok(m.effects && typeof m.effects === 'object', `${m.id}: no effects`);
  }
});

test('items used as module slot contents exist as items', () => {
  // Each slottable module maps to a craftable item (tier suffix -1 → base id).
  for (const m of Object.values(MODULES)) {
    const tier = m.id.slice(m.id.lastIndexOf('-') + 1);
    const base = `${m.kind}-module`;
    const itemId = tier === '1' ? base : `${base}-${tier}`;
    assert.ok(ITEMS[itemId], `${m.id}: no matching item "${itemId}"`);
  }
});
