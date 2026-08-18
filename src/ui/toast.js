// Transient status messages (bottom center).
import { h } from '../dom.js';

let container = null;

export function toast(message, kind = 'info') {
  if (!container) {
    container = h('div', { class: 'toast-container' });
    document.body.append(container);
  }
  const el = h('div', { class: `toast toast-${kind}` }, message);
  container.append(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2600);
}
