// Top toolbar: design name, file operations, undo/redo, rate unit, view toggles.

import { h, clear } from '../dom.js';
import { store, actions, activeTab } from '../store/appStore.js';
import { listSaves, saveDesign, loadSave, deleteSave } from '../store/persist.js';
import { showModal } from './modal.js';
import { toast } from './toast.js';
import { canvasApi } from './canvas.js';

const UNITS = [
  { id: 's', label: '/s' },
  { id: 'm', label: '/min' },
  { id: 'h', label: '/h' },
];

export function createToolbar() {
  const nameInput = h('input', {
    class: 'tb-name', type: 'text', title: 'Design name',
    onchange: ev => {
      const t = activeTab();
      if (t) actions.renameTab(t.id, ev.target.value);
    },
  });

  function openLoadModal() {
    const saves = listSaves();
    const list = h('div', { class: 'save-list' });
    if (!saves.length) {
      list.append(h('div', { class: 'insp-hint' }, 'No saved designs yet. Use Save to store the current design in this browser.'));
    }
    let close;
    for (const s of saves) {
      list.append(h('div', { class: 'save-row' },
        h('button', {
          class: 'save-load-btn',
          onclick: () => {
            try {
              const design = loadSave(s.name);
              actions.addTab(s.name, design.entities, design.settings);
              toast(`Loaded "${s.name}"`);
              close();
            } catch (err) {
              toast(`Load failed: ${err.message}`, 'warn');
            }
          },
        },
          h('span', { class: 'save-name' }, s.name),
          h('span', { class: 'save-meta' },
            `${s.entityCount} entities${s.savedAt ? ' · ' + new Date(s.savedAt).toLocaleString() : ''}`),
        ),
        h('button', {
          class: 'btn danger small', title: 'Delete this save',
          onclick: ev => {
            deleteSave(s.name);
            ev.target.closest('.save-row').remove();
            toast(`Deleted save "${s.name}"`);
          },
        }, '✕'),
      ));
    }
    close = showModal('Load Design', list);
  }

  function openHelpModal() {
    const rows = [
      ['R', 'Rotate selection'],
      ['Delete / Backspace', 'Delete selection'],
      ['Ctrl+D', 'Duplicate'],
      ['Ctrl+C / Ctrl+V', 'Copy / paste (paste follows mouse)'],
      ['Ctrl+Z / Ctrl+Shift+Z', 'Undo / redo'],
      ['Ctrl+A', 'Select all'],
      ['Shift+Click', 'Add/remove from selection'],
      ['Drag on empty canvas', 'Rectangle selection'],
      ['Middle mouse / Space+drag', 'Pan'],
      ['Mouse wheel', 'Zoom'],
      ['Right-click', 'Context menu (or cancel placement)'],
      ['Esc', 'Clear selection / cancel placement'],
      ['Click library card', 'Entity follows the cursor — click the canvas to place it'],
      ['Drag an entity', 'Move it to another tile'],
      ['One-finger drag', 'Pan (or move an entity)'],
      ['Two-finger pinch', 'Zoom'],
      ['Long-press', 'Context menu'],
    ];
    showModal('Shortcuts & Gestures', h('table', { class: 'help-table' },
      rows.map(([k, d]) => h('tr', {}, h('td', {}, h('kbd', {}, k)), h('td', {}, d))),
    ));
  }

  const unitGroup = h('div', { class: 'seg-group', title: 'Rate display unit' });
  const undoBtn = h('button', { class: 'btn', title: 'Undo (Ctrl+Z)', onclick: () => actions.undo() }, '↩');
  const redoBtn = h('button', { class: 'btn', title: 'Redo (Ctrl+Shift+Z)', onclick: () => actions.redo() }, '↪');
  const gridBtn = h('button', { class: 'btn toggle', title: 'Toggle grid', onclick: () => actions.toggleGrid() }, 'Grid');

  const root = h('header', { class: 'toolbar' },
    h('span', { class: 'brand' }, '⚙ FactBuilder'),
    nameInput,
    h('div', { class: 'tb-group' },
      h('button', { class: 'btn', title: 'New design (new tab)', onclick: () => actions.addTab() }, 'New'),
      h('button', {
        class: 'btn', title: 'Save design in this browser',
        onclick: () => {
          const t = activeTab();
          if (!t) return;
          saveDesign(t);
          toast(`Saved "${t.name}"`);
        },
      }, 'Save'),
      h('button', { class: 'btn', title: 'Load a saved design', onclick: openLoadModal }, 'Load'),
    ),
    h('div', { class: 'tb-group' }, undoBtn, redoBtn),
    unitGroup,
    h('div', { class: 'tb-group' }, gridBtn,
      h('button', { class: 'btn', title: 'Zoom to fit', onclick: () => canvasApi.zoomToFit() }, 'Fit'),
    ),
    h('div', { class: 'tb-spacer' }),
    h('button', { class: 'btn', title: 'Keyboard shortcuts', onclick: openHelpModal }, '?'),
  );

  function render(state) {
    const t = activeTab(state);
    if (t && document.activeElement !== nameInput) nameInput.value = t.name;
    undoBtn.disabled = !t?.history.length;
    redoBtn.disabled = !t?.future.length;
    gridBtn.classList.toggle('active', !!t?.settings.showGrid);
    clear(unitGroup);
    for (const u of UNITS) {
      unitGroup.append(h('button', {
        class: `seg${state.rateUnit === u.id ? ' active' : ''}`,
        onclick: () => actions.setRateUnit(u.id),
      }, u.label));
    }
  }

  store.subscribe(render);
  render(store.get());
  return root;
}
