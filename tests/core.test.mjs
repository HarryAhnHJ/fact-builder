import test from 'node:test';
import assert from 'node:assert/strict';

import { aggregateRates, entityRates } from '../src/engine/rates.js';
import { designFromJSON, actions, activeTab, canPlaceAt } from '../src/store/appStore.js';

function circuitAssembler(extra = {}) {
  return {
    id: 'assembler', defId: 'assembling-machine-1', quality: 'normal',
    x: 0, y: 0, rotation: 0, recipeId: 'electronic-circuit', modules: [],
    ...extra,
  };
}

test('electronic circuit rates derive from machine speed and recipe alone', () => {
  // AM1 speed 0.5 / 0.5s crafting time → 1 craft/s
  const rates = entityRates(circuitAssembler()).rates;
  assert.equal(rates['electronic-circuit'].prod, 1);
  assert.equal(rates['iron-plate'].cons, 1);
  assert.equal(rates['copper-cable'].cons, 3);
});

test('base productivity scales outputs without increasing inputs', () => {
  // EM plant: speed 2 → 4 crafts/s, +50% base productivity on outputs only
  const rates = entityRates(circuitAssembler({ defId: 'electromagnetic-plant' })).rates;
  assert.equal(rates['electronic-circuit'].prod, 6);
  assert.equal(rates['iron-plate'].cons, 4);
  assert.equal(rates['copper-cable'].cons, 12);
});

test('incompatible recipes never contribute rates', () => {
  assert.equal(entityRates({ ...circuitAssembler(), defId: 'stone-furnace' }), null);
});

test('import sanitization rejects incompatible recipes and fixes duplicate entity IDs', () => {
  const design = designFromJSON({
    version: 1,
    entities: [
      { ...circuitAssembler(), id: 'same', defId: 'stone-furnace' },
      { ...circuitAssembler(), id: 'same', x: 10, y: 10 },
    ],
  });
  assert.equal(design.entities[0].recipeId, null);
  assert.equal(new Set(design.entities.map(entity => entity.id)).size, 2);
  assert.equal(aggregateRates(design.entities).get('electronic-circuit').prod, 1);
});

test('import drops entities whose footprints overlap and snaps to integer tiles', () => {
  const design = designFromJSON({
    version: 1,
    entities: [
      { ...circuitAssembler(), id: 'a', x: 0.4, y: 0.6 },   // rounds to (0, 1), 3×3
      { ...circuitAssembler(), id: 'b', x: 2, y: 2 },       // overlaps a → dropped
      { ...circuitAssembler(), id: 'c', x: 3, y: 1 },       // adjacent → kept
    ],
  });
  assert.deepEqual(design.entities.map(e => e.id), ['a', 'c']);
  assert.equal(design.entities[0].x, 0);
  assert.equal(design.entities[0].y, 1);
});

test('placement refuses occupied tiles', () => {
  actions.addTab('collision-test');
  const first = actions.placeEntity('chest', 5, 5);
  assert.ok(first);
  assert.equal(actions.placeEntity('chest', 5, 5), null);        // same tile
  assert.equal(actions.placeEntity('fluid-tank', 4, 4), null);   // 3×3 covering the chest
  assert.ok(actions.placeEntity('chest', 6, 5));                 // adjacent tile is fine
  assert.equal(activeTab().entities.length, 2);
  assert.equal(canPlaceAt('chest', 5, 5), false);
  assert.equal(canPlaceAt('chest', 7, 5), true);
});

test('moves onto occupied tiles are rejected atomically', () => {
  actions.addTab('move-test');
  const a = actions.placeEntity('chest', 0, 0);
  const b = actions.placeEntity('chest', 3, 0);
  actions.moveEntitiesTo({ [a.id]: { x: 3, y: 0 } });            // onto b → rejected
  assert.equal(activeTab().entities.find(e => e.id === a.id).x, 0);
  actions.moveEntitiesTo({ [a.id]: { x: 2, y: 0 } });            // free tile → applied
  assert.equal(activeTab().entities.find(e => e.id === a.id).x, 2);
  assert.equal(activeTab().entities.find(e => e.id === b.id).x, 3);
});
