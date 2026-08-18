// Production/consumption table with search, type filter, and sortable columns.
// UI state (search/sort/filter) persists per table key across re-renders.

import { h, clear } from '../dom.js';
import { ITEMS } from '../data/gamedata.js';
import { EPS } from '../engine/rates.js';
import { formatRate } from './format.js';

const uiStates = new Map(); // key → {search, sort, dir, filter}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in', label: 'Inputs' },
  { id: 'out', label: 'Outputs' },
  { id: 'bal', label: 'Balanced' },
];

export function ratesTable(key, rows, unit) {
  let ui = uiStates.get(key);
  if (!ui) {
    ui = { search: '', sort: 'item', dir: 1, filter: 'all' };
    uiStates.set(key, ui);
  }

  const tbody = h('tbody');

  function itemName(r) {
    return ITEMS[r.itemId]?.name || r.itemId;
  }

  function renderBody() {
    clear(tbody);
    let filtered = rows;
    const q = ui.search.trim().toLowerCase();
    if (q) filtered = filtered.filter(r => itemName(r).toLowerCase().includes(q));
    if (ui.filter === 'in') filtered = filtered.filter(r => r.net < -EPS);
    else if (ui.filter === 'out') filtered = filtered.filter(r => r.net > EPS);
    else if (ui.filter === 'bal') filtered = filtered.filter(r => Math.abs(r.net) <= EPS);

    filtered = [...filtered].sort((a, b) => {
      let v;
      if (ui.sort === 'item') v = itemName(a).localeCompare(itemName(b));
      else v = a[ui.sort] - b[ui.sort];
      return v * ui.dir;
    });

    if (!filtered.length) {
      tbody.append(h('tr', {}, h('td', { class: 'rt-empty', colspan: 4 }, 'No items')));
      return;
    }
    for (const r of filtered) {
      const item = ITEMS[r.itemId];
      const netCls = r.net > EPS ? 'pos' : r.net < -EPS ? 'neg' : 'zero';
      tbody.append(h('tr', {},
        h('td', { class: 'rt-item' },
          h('span', { class: 'item-icon', style: { color: item?.color || '#9aa5b1' } }, item?.icon || '•'),
          itemName(r),
        ),
        h('td', { class: `rt-num${r.cons <= EPS ? ' dim' : ''}` }, formatRate(r.cons, unit)),
        h('td', { class: `rt-num${r.prod <= EPS ? ' dim' : ''}` }, formatRate(r.prod, unit)),
        h('td', { class: `rt-num rt-net ${netCls}` },
          r.net < -EPS ? `−${formatRate(-r.net, unit)}` : formatRate(r.net, unit, true)),
      ));
    }
  }

  function sortHeader(label, sortKey, numeric) {
    const arrow = ui.sort === sortKey ? (ui.dir === 1 ? ' ▲' : ' ▼') : '';
    return h('th', {
      class: `sortable${numeric ? ' rt-num' : ''}`,
      onclick: () => {
        if (ui.sort === sortKey) ui.dir = -ui.dir;
        else {
          ui.sort = sortKey;
          ui.dir = numeric ? -1 : 1; // numeric columns: biggest first by default
        }
        rerenderHead();
        renderBody();
      },
    }, label + arrow);
  }

  const thead = h('thead');
  function rerenderHead() {
    clear(thead);
    thead.append(h('tr', {},
      sortHeader('Item', 'item', false),
      sortHeader('Cons', 'cons', true),
      sortHeader('Prod', 'prod', true),
      sortHeader('Net', 'net', true),
    ));
  }
  rerenderHead();

  const searchInput = h('input', {
    class: 'rt-search', type: 'search', placeholder: 'Filter items…', value: ui.search,
    oninput: () => {
      ui.search = searchInput.value;
      renderBody();
    },
  });

  const filterBtns = FILTERS.map(f => h('button', {
    class: `chip${ui.filter === f.id ? ' active' : ''}`,
    onclick: ev => {
      ui.filter = f.id;
      for (const b of ev.target.parentElement.children) b.classList.remove('active');
      ev.target.classList.add('active');
      renderBody();
    },
  }, f.label));

  renderBody();

  return h('div', { class: 'rates-table' },
    h('div', { class: 'rt-controls' }, searchInput, h('div', { class: 'chip-row' }, filterBtns)),
    h('table', {}, thead, tbody),
  );
}
