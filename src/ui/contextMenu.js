// Singleton context menu. Items: {label, action?, hint?, disabled?, checked?,
// danger?, separator?, submenu?: () => items}. A submenu replaces the menu
// contents in place with a "back" row.

import { h, clear } from '../dom.js';

let menuEl = null;

export function closeContextMenu() {
  if (menuEl) {
    menuEl.remove();
    menuEl = null;
    document.removeEventListener('pointerdown', onGlobalDown, true);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('blur', closeContextMenu);
  }
}

function onGlobalDown(ev) {
  if (menuEl && !menuEl.contains(ev.target)) closeContextMenu();
}

function onKey(ev) {
  if (ev.key === 'Escape') {
    ev.stopPropagation();
    closeContextMenu();
  }
}

function renderItems(items, parentItems) {
  clear(menuEl);
  if (parentItems) {
    menuEl.append(h('button', {
      class: 'menu-item menu-back',
      onclick: () => renderItems(parentItems, null),
    }, '‹ Back'));
    menuEl.append(h('div', { class: 'menu-sep' }));
  }
  for (const item of items) {
    if (item.separator) {
      menuEl.append(h('div', { class: 'menu-sep' }));
      continue;
    }
    const hasSub = typeof item.submenu === 'function';
    menuEl.append(h('button', {
      class: `menu-item${item.danger ? ' danger' : ''}${item.checked ? ' checked' : ''}`,
      disabled: !!item.disabled,
      onclick: () => {
        if (hasSub) {
          renderItems(item.submenu(), items);
        } else {
          closeContextMenu();
          item.action?.();
        }
      },
    },
      h('span', { class: 'menu-check' }, item.checked ? '✓' : ''),
      h('span', { class: 'menu-label' }, item.label),
      h('span', { class: 'menu-hint' }, hasSub ? '›' : (item.hint || '')),
    ));
  }
}

export function showContextMenu(x, y, items) {
  closeContextMenu();
  menuEl = h('div', { class: 'context-menu' });
  renderItems(items, null);
  document.body.append(menuEl);

  // keep inside the viewport
  const r = menuEl.getBoundingClientRect();
  menuEl.style.left = Math.min(x, window.innerWidth - r.width - 8) + 'px';
  menuEl.style.top = Math.min(y, window.innerHeight - r.height - 8) + 'px';

  document.addEventListener('pointerdown', onGlobalDown, true);
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('blur', closeContextMenu);
}
