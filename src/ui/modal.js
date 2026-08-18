// Simple modal dialog. showModal(title, contentEl) → close function.
import { h } from '../dom.js';

export function showModal(title, content) {
  const overlay = h('div', { class: 'modal-overlay' });
  const box = h('div', { class: 'modal' },
    h('div', { class: 'modal-head' },
      h('span', { class: 'modal-title' }, title),
      h('button', { class: 'modal-close', title: 'Close', onclick: close }, '×'),
    ),
    h('div', { class: 'modal-body' }, content),
  );
  overlay.append(box);

  function onKey(ev) {
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      close();
    }
  }
  function close() {
    overlay.remove();
    window.removeEventListener('keydown', onKey, true);
  }

  overlay.addEventListener('pointerdown', ev => {
    if (ev.target === overlay) close();
  });
  window.addEventListener('keydown', onKey, true);
  document.body.append(overlay);
  return close;
}
