// Tab strip: one canvas per design, open several at once.

import { h, clear } from '../dom.js';
import { store, actions } from '../store/appStore.js';

export function createTabs() {
  const root = h('div', { class: 'tabs' });

  function render(state) {
    clear(root);
    for (const t of state.tabs) {
      const active = t.id === state.activeTabId;
      const label = h('span', { class: 'tab-label' }, t.name);
      const tab = h('div', {
        class: `tab${active ? ' active' : ''}`,
        onclick: () => actions.setActiveTab(t.id),
        ondblclick: () => startRename(),
      },
        label,
        h('button', {
          class: 'tab-close', title: 'Close tab',
          onclick: ev => {
            ev.stopPropagation();
            actions.closeTab(t.id);
          },
        }, '×'),
      );

      function startRename() {
        const input = h('input', {
          class: 'tab-rename', type: 'text', value: t.name,
          onchange: () => actions.renameTab(t.id, input.value),
          onblur: () => actions.renameTab(t.id, input.value),
          onkeydown: ev => {
            if (ev.key === 'Enter') input.blur();
            if (ev.key === 'Escape') render(store.get());
          },
        });
        label.replaceWith(input);
        input.focus();
        input.select();
      }

      root.append(tab);
    }
    root.append(h('button', {
      class: 'tab-add', title: 'New design tab',
      onclick: () => actions.addTab(),
    }, '+'));
  }

  store.subscribe(render);
  render(store.get());
  return root;
}
