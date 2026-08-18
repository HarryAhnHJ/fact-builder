// Right panel: factory-wide statistics (nothing selected), single-entity
// property editor, or multi-selection editor + selected-entities table.

import { h, clear } from '../dom.js';
import {
  ENTITY_DEFS, RECIPES, ITEMS, QUALITIES, QUALITY_ORDER, MODULES, MODULE_ORDER,
  recipesForDef, machinesForCategories,
} from '../data/gamedata.js';
import {
  aggregateRates, ratesToRows, designStats, entityRates, effectiveCraftingSpeed,
  moduleEffects, machineEnergyKW, totalProductivity,
} from '../engine/rates.js';
import { store, actions, activeTab, selectedEntities } from '../store/appStore.js';
import { formatRate, formatAmount, formatPower } from './format.js';
import { ratesTable } from './ratesTable.js';

export function createInspector() {
  const root = h('aside', { class: 'panel inspector' });

  function render(state) {
    const t = activeTab(state);
    clear(root);
    if (!t) return;
    const sel = selectedEntities(state);
    if (sel.length === 0) renderTotals(t, state);
    else if (sel.length === 1) renderSingle(sel[0], state);
    else renderMulti(sel, state);
  }

  // ---------- helpers ----------

  function row(label, control) {
    return h('div', { class: 'insp-row' }, h('label', {}, label), control);
  }

  function numberInput(value, opts, onCommit) {
    return h('input', {
      type: 'number', class: 'insp-input',
      value: value ?? '',
      ...opts,
      onchange: ev => onCommit(ev.target.value),
    });
  }

  function statChip(label, value) {
    return h('div', { class: 'stat-chip' },
      h('div', { class: 'stat-value' }, String(value)),
      h('div', { class: 'stat-label' }, label),
    );
  }

  // ---------- nothing selected: total design ----------

  function renderTotals(t, state) {
    const stats = designStats(t.entities);
    const rows = ratesToRows(aggregateRates(t.entities));
    root.append(
      h('div', { class: 'panel-title' }, 'Total Design'),
      h('div', { class: 'stat-grid' },
        statChip('Entities', stats.placedCount),
        statChip('Machines', stats.machineUnits),
        statChip('Net Inputs', stats.netInputs),
        statChip('Net Outputs', stats.netOutputs),
        statChip('Balanced', stats.balanced),
        statChip('Power', formatPower(stats.powerKW)),
      ),
      h('div', { class: 'insp-section' }, 'Production / Consumption'),
      t.entities.length
        ? ratesTable('total', rows, state.rateUnit)
        : h('div', { class: 'insp-hint' }, 'Drag entities from the library onto the canvas to start designing.'),
    );
  }

  // ---------- one entity selected ----------

  function renderSingle(e, state) {
    const def = ENTITY_DEFS[e.defId];
    if (!def) return;
    const isMachine = def.type === 'machine';
    const id = [e.id];

    root.append(
      h('div', { class: 'panel-title' },
        h('span', { class: 'insp-icon' }, def.icon), def.name,
      ),
      h('div', { class: 'insp-sub' },
        `${def.category} · ${def.w}×${def.h} · at ${formatAmount(e.x)}, ${formatAmount(e.y)} · ${e.rotation || 0}°`),
    );

    root.append(row('Quality',
      h('select', {
        class: 'insp-input',
        onchange: ev => actions.updateEntities(id, { quality: ev.target.value }),
      }, QUALITY_ORDER.map(q =>
        h('option', { value: q, selected: q === e.quality }, QUALITIES[q].name))),
    ));

    if (isMachine) {
      // machine type
      const machines = machinesForCategories(def.recipeCategories);
      root.append(row('Machine',
        h('select', {
          class: 'insp-input',
          onchange: ev => {
            const m = ENTITY_DEFS[ev.target.value];
            const keep = e.recipeId && m.recipeCategories.includes(RECIPES[e.recipeId]?.category);
            actions.updateEntities(id, { defId: m.id, recipeId: keep ? e.recipeId : null });
          },
        }, machines.map(m => h('option', { value: m.id, selected: m.id === def.id }, m.name))),
      ));

      // recipe
      const recipes = recipesForDef(def);
      root.append(row('Recipe',
        h('select', {
          class: 'insp-input',
          onchange: ev => actions.updateEntities(id, { recipeId: ev.target.value || null }),
        },
          h('option', { value: '', selected: !e.recipeId }, '— none —'),
          recipes.map(r => h('option', { value: r.id, selected: r.id === e.recipeId }, r.name)),
        ),
      ));

      root.append(row('Machine count',
        numberInput(e.machineCount || 1, { min: 1, step: 1 }, v => {
          const n = Math.max(1, Math.round(parseFloat(v) || 1));
          actions.updateEntities(id, { machineCount: n });
        }),
      ));

      const quality = QUALITIES[e.quality] || QUALITIES.normal;
      const baseSpeed = def.craftingSpeed * quality.speedMultiplier;
      root.append(row('Crafting speed',
        numberInput(e.craftingSpeedOverride, {
          min: 0.01, step: 0.05,
          placeholder: formatAmount(baseSpeed),
          title: 'Override base speed × quality. Clear to use the default.',
        }, v => {
          const n = parseFloat(v);
          actions.updateEntities(id, { craftingSpeedOverride: isFinite(n) && n > 0 ? n : null });
        }),
      ));

      root.append(row('Speed bonus %',
        numberInput(e.speedBonus || 0, { step: 5, title: 'Module / beacon speed effect' }, v => {
          actions.updateEntities(id, { speedBonus: parseFloat(v) || 0 });
        }),
      ));

      root.append(row('Productivity %',
        numberInput(e.productivityBonus || 0, { min: 0, step: 5, title: 'Module productivity effect (outputs only)' }, v => {
          actions.updateEntities(id, { productivityBonus: Math.max(0, parseFloat(v) || 0) });
        }),
      ));

      // module slots
      if (def.moduleSlots) {
        root.append(h('div', { class: 'insp-section' },
          `Modules (${def.moduleSlots} slot${def.moduleSlots > 1 ? 's' : ''})`));
        const mods = e.modules || [];
        for (let slot = 0; slot < def.moduleSlots; slot++) {
          root.append(row(`Slot ${slot + 1}`,
            h('select', {
              class: 'insp-input',
              onchange: ev => {
                const next = [];
                for (let i = 0; i < def.moduleSlots; i++) {
                  const v = i === slot ? ev.target.value : (mods[i] || '');
                  if (v) next.push(v);
                }
                actions.updateEntities(id, { modules: next });
              },
            },
              h('option', { value: '', selected: !mods[slot] }, '— empty —'),
              MODULE_ORDER.map(mid =>
                h('option', { value: mid, selected: mods[slot] === mid }, MODULES[mid].name)),
            ),
          ));
        }
        if (mods.length) {
          const fx = moduleEffects(e);
          const parts = [];
          if (fx.speed) parts.push(`${fx.speed > 0 ? '+' : ''}${fx.speed}% speed`);
          if (fx.productivity) parts.push(`+${fx.productivity}% prod`);
          const dE = Math.round((fx.energyMultiplier - 1) * 100);
          if (dE) parts.push(`${dE > 0 ? '+' : ''}${dE}% energy`);
          root.append(h('div', { class: 'insp-kv' },
            h('span', {}, 'Module effects'),
            h('span', {}, parts.join(' · ') || '—'),
          ));
        }
      }

      root.append(h('div', { class: 'insp-kv' },
        h('span', {}, 'Effective speed'),
        h('span', {}, `${formatAmount(effectiveCraftingSpeed(e))}×`),
      ));
      if (totalProductivity(e)) {
        root.append(h('div', { class: 'insp-kv' },
          h('span', {}, 'Total productivity'),
          h('span', {}, `+${formatAmount(totalProductivity(e))}%`),
        ));
      }
      root.append(h('div', { class: 'insp-kv' },
        h('span', {}, 'Energy'),
        h('span', {}, formatPower(machineEnergyKW(e))),
      ));

      // recipe I/O detail
      const r = entityRates(e);
      if (r) {
        const recipe = RECIPES[e.recipeId];
        root.append(h('div', { class: 'insp-section' },
          `Rates (${formatAmount(r.craftsPerSecond)} crafts/s)`));
        const list = h('div', { class: 'io-list' });
        for (const inp of recipe.inputs) {
          const item = ITEMS[inp.itemId];
          list.append(h('div', { class: 'io-row' },
            h('span', { class: 'item-icon', style: { color: item?.color } }, item?.icon || '•'),
            h('span', { class: 'io-name' }, item?.name || inp.itemId),
            h('span', { class: 'io-rate neg' },
              `−${formatRate(inp.amount * r.craftsPerSecond, state.rateUnit)}`),
          ));
        }
        const prodMult = 1 + totalProductivity(e) / 100;
        for (const out of recipe.outputs) {
          const item = ITEMS[out.itemId];
          list.append(h('div', { class: 'io-row' },
            h('span', { class: 'item-icon', style: { color: item?.color } }, item?.icon || '•'),
            h('span', { class: 'io-name' }, item?.name || out.itemId),
            h('span', { class: 'io-rate pos' },
              `+${formatRate(out.amount * r.craftsPerSecond * prodMult, state.rateUnit)}`),
          ));
        }
        root.append(list);
      } else {
        root.append(h('div', { class: 'insp-hint' }, 'Assign a recipe to see production rates.'));
      }
    } else {
      const stats = Object.entries(def.stats || {});
      if (stats.length) {
        root.append(h('div', { class: 'insp-section' }, 'Stats'));
        for (const [k, v] of stats) {
          root.append(h('div', { class: 'insp-kv' }, h('span', {}, k), h('span', {}, v)));
        }
      }
      root.append(h('div', { class: 'insp-hint' },
        'Layout-only entity — it does not affect production rates.'));
    }

    root.append(actionButtons(id));
  }

  // ---------- multiple entities selected ----------

  function renderMulti(sel, state) {
    const ids = sel.map(e => e.id);
    const machines = sel.filter(e => ENTITY_DEFS[e.defId]?.type === 'machine');

    root.append(
      h('div', { class: 'panel-title' }, `${sel.length} entities selected`),
      h('div', { class: 'insp-sub' }, `${machines.length} production machine${machines.length === 1 ? '' : 's'}`),
    );

    // common quality
    const commonQuality = sel.every(e => e.quality === sel[0].quality) ? sel[0].quality : '';
    root.append(row('Quality',
      h('select', {
        class: 'insp-input',
        onchange: ev => { if (ev.target.value) actions.updateEntities(ids, { quality: ev.target.value }); },
      },
        commonQuality === '' && h('option', { value: '', selected: true }, '— mixed —'),
        QUALITY_ORDER.map(q =>
          h('option', { value: q, selected: q === commonQuality }, QUALITIES[q].name)),
      ),
    ));

    if (machines.length) {
      const machineIds = machines.map(e => e.id);

      // recipe select when all selected machines share the same allowed categories
      const catKey = m => (ENTITY_DEFS[m.defId].recipeCategories || []).join(',');
      if (machines.every(m => catKey(m) === catKey(machines[0]))) {
        const recipes = recipesForDef(ENTITY_DEFS[machines[0].defId]);
        const commonRecipe = machines.every(m => m.recipeId === machines[0].recipeId)
          ? (machines[0].recipeId || '') : null;
        root.append(row('Recipe',
          h('select', {
            class: 'insp-input',
            onchange: ev => actions.updateEntities(machineIds, { recipeId: ev.target.value || null }),
          },
            commonRecipe === null && h('option', { value: '', selected: true }, '— mixed —'),
            commonRecipe !== null && h('option', { value: '', selected: commonRecipe === '' }, '— none —'),
            recipes.map(r => h('option', { value: r.id, selected: r.id === commonRecipe }, r.name)),
          ),
        ));
      }

      const commonCount = machines.every(m => (m.machineCount || 1) === (machines[0].machineCount || 1))
        ? (machines[0].machineCount || 1) : null;
      root.append(row('Machine count',
        numberInput(commonCount, { min: 1, step: 1, placeholder: commonCount === null ? 'mixed' : '' }, v => {
          const n = Math.max(1, Math.round(parseFloat(v) || 1));
          actions.updateEntities(machineIds, { machineCount: n });
        }),
      ));

      const commonSpeedB = machines.every(m => (m.speedBonus || 0) === (machines[0].speedBonus || 0))
        ? (machines[0].speedBonus || 0) : null;
      root.append(row('Speed bonus %',
        numberInput(commonSpeedB, { step: 5, placeholder: commonSpeedB === null ? 'mixed' : '' }, v => {
          actions.updateEntities(machineIds, { speedBonus: parseFloat(v) || 0 });
        }),
      ));

      const commonProdB = machines.every(m => (m.productivityBonus || 0) === (machines[0].productivityBonus || 0))
        ? (machines[0].productivityBonus || 0) : null;
      root.append(row('Productivity %',
        numberInput(commonProdB, { min: 0, step: 5, placeholder: commonProdB === null ? 'mixed' : '' }, v => {
          actions.updateEntities(machineIds, { productivityBonus: Math.max(0, parseFloat(v) || 0) });
        }),
      ));

      // fill every module slot of every selected machine with one module type
      if (machines.some(m => ENTITY_DEFS[m.defId].moduleSlots > 0)) {
        root.append(row('Fill modules',
          h('select', {
            class: 'insp-input',
            onchange: ev => {
              const v = ev.target.value;
              if (!v) return;
              actions.updateEntities(machineIds, m => {
                const slots = ENTITY_DEFS[m.defId]?.moduleSlots || 0;
                return { modules: v === 'empty' ? [] : Array(slots).fill(v) };
              });
            },
          },
            h('option', { value: '', selected: true }, '— set all slots to —'),
            h('option', { value: 'empty' }, 'No modules'),
            MODULE_ORDER.map(mid => h('option', { value: mid }, MODULES[mid].name)),
          ),
        ));
      }
    }

    root.append(h('div', { class: 'insp-section' }, 'Selected Production / Consumption'));
    root.append(ratesTable('selected', ratesToRows(aggregateRates(sel)), state.rateUnit));
    root.append(actionButtons(ids));
  }

  function actionButtons(ids) {
    return h('div', { class: 'insp-actions' },
      h('button', { class: 'btn', onclick: () => actions.rotateEntities(ids) }, '⟳ Rotate'),
      h('button', { class: 'btn', onclick: () => actions.duplicateEntities(ids) }, '⧉ Duplicate'),
      h('button', { class: 'btn danger', onclick: () => actions.deleteEntities(ids) }, '✕ Delete'),
    );
  }

  store.subscribe(render);
  render(store.get());
  return root;
}
