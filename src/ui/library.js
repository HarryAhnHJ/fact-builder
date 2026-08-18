// Left panel: searchable entity / recipe / item library with drag-and-drop
// placement. Entities are placed at normal quality; change quality per entity
// in the inspector (right panel).

import { h, clear } from '../dom.js';
import { ENTITY_DEFS, ENTITY_CATEGORIES, ITEMS, RECIPES } from '../data/gamedata.js';
import { store, actions, selectedEntities } from '../store/appStore.js';
import { toast } from './toast.js';
import { canvasApi } from './canvas.js';

// Panel-local UI state (survives re-renders; not part of app state).
let search = '';
let category = 'All';

export function createLibrary() {
  const body = h('div', { class: 'lib-body' });

  const searchInput = h('input', {
    class: 'lib-search', type: 'search', placeholder: 'Search entities, recipes, items…',
    oninput: () => {
      search = searchInput.value;
      renderBody();
    },
  });

  const chipRow = h('div', { class: 'chip-row lib-cats' });

  function renderChips() {
    clear(chipRow);
    for (const cat of ['All', ...ENTITY_CATEGORIES]) {
      chipRow.append(h('button', {
        class: `chip${category === cat ? ' active' : ''}`,
        onclick: () => {
          category = cat;
          renderChips();
          renderBody();
        },
      }, cat));
    }
  }

  function matches(name) {
    return !search.trim() || name.toLowerCase().includes(search.trim().toLowerCase());
  }

  function entityCard(def) {
    const stats = Object.entries(def.stats || {}).map(([k, v]) => `${k}: ${v}`).join(' · ');
    const card = h('div', {
      class: `lib-card type-${def.type}`, draggable: true,
      title: 'Drag onto the canvas, or click — the entity follows your cursor; click the canvas to place it',
      onclick: () => {
        canvasApi.armPlacement(def.id);
        window.dispatchEvent(new CustomEvent('fb:close-sheets'));
      },
    },
      h('span', { class: 'lib-icon' }, def.icon),
      h('div', { class: 'lib-card-main' },
        h('div', { class: 'lib-card-name' }, def.name),
        h('div', { class: 'lib-card-sub' }, `${def.w}×${def.h}${stats ? ' · ' + stats : ''}`),
      ),
      h('span', { class: 'lib-drag-hint' }, '⠿'),
    );
    card.addEventListener('dragstart', ev => {
      ev.dataTransfer.setData('text/fb-def', def.id);
      ev.dataTransfer.effectAllowed = 'copy';
    });
    return card;
  }

  function recipeCard(recipe) {
    const io = [
      recipe.inputs.map(i => `${i.amount}× ${ITEMS[i.itemId]?.name || i.itemId}`).join(' + ') || '∅',
      '→',
      recipe.outputs.map(o => `${o.amount}× ${ITEMS[o.itemId]?.name || o.itemId}`).join(' + '),
    ].join(' ');
    return h('div', { class: 'lib-card lib-recipe', title: 'Click to assign to selected machines' },
      h('span', { class: 'lib-icon' }, ITEMS[recipe.outputs[0]?.itemId]?.icon || '⚙'),
      h('div', {
        class: 'lib-card-main clickable',
        onclick: () => assignRecipe(recipe),
      },
        h('div', { class: 'lib-card-name' }, recipe.name),
        h('div', { class: 'lib-card-sub' }, `${io} · ${recipe.craftingTime}s`),
      ),
    );
  }

  function assignRecipe(recipe) {
    const sel = selectedEntities();
    const compatible = sel.filter(e => ENTITY_DEFS[e.defId]?.recipeCategories?.includes(recipe.category));
    if (!compatible.length) {
      toast(`Select a machine that can craft "${recipe.name}" first`, 'warn');
      return;
    }
    actions.updateEntities(compatible.map(e => e.id), { recipeId: recipe.id });
    toast(`Recipe "${recipe.name}" assigned to ${compatible.length} machine${compatible.length > 1 ? 's' : ''}`);
  }

  function itemChip(item) {
    return h('div', { class: 'lib-item-chip', title: item.category },
      h('span', { class: 'item-icon', style: { color: item.color } }, item.icon),
      item.name,
    );
  }

  function renderBody() {
    clear(body);

    const defs = Object.values(ENTITY_DEFS)
      .filter(d => (category === 'All' || d.category === category) && matches(d.name));
    body.append(h('div', { class: 'lib-section' }, `Entities (${defs.length})`));
    if (defs.length) body.append(...defs.map(entityCard));
    else body.append(h('div', { class: 'lib-empty' }, 'No entities match'));

    if (category === 'All') {
      const recipes = Object.values(RECIPES).filter(r => matches(r.name));
      if (recipes.length) {
        body.append(h('div', { class: 'lib-section' }, `Recipes (${recipes.length})`));
        body.append(...recipes.map(recipeCard));
      }
      const items = Object.values(ITEMS).filter(i => matches(i.name));
      if (items.length) {
        body.append(h('div', { class: 'lib-section' }, `Items (${items.length})`));
        body.append(h('div', { class: 'lib-items' }, items.map(itemChip)));
      }
    }
  }

  renderChips();
  renderBody();

  return h('aside', { class: 'panel library' },
    h('div', { class: 'panel-title' }, 'Library'),
    h('div', { class: 'lib-controls' }, searchInput),
    chipRow,
    body,
  );
}
