// Global keyboard shortcuts.
//   R rotate · Del/Backspace delete · Ctrl+D duplicate · Ctrl+C/V copy/paste
//   Ctrl+Z undo · Ctrl+Shift+Z / Ctrl+Y redo · Ctrl+A select all
//   Space+drag pan · Esc clear selection

import { actions, activeTab } from '../store/appStore.js';
import { canvasApi } from './canvas.js';

function isTyping(ev) {
  const el = ev.target;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

export function initKeyboard() {
  window.addEventListener('keydown', ev => {
    if (isTyping(ev)) return;
    const t = activeTab();
    if (!t) return;
    const sel = t.selection;
    const k = ev.key.toLowerCase();

    if (ev.key === ' ') {
      canvasApi.setSpace(true);
      ev.preventDefault();
      return;
    }

    if (ev.ctrlKey || ev.metaKey) {
      if (k === 'z' && ev.shiftKey) { actions.redo(); ev.preventDefault(); }
      else if (k === 'z') { actions.undo(); ev.preventDefault(); }
      else if (k === 'y') { actions.redo(); ev.preventDefault(); }
      else if (k === 'd') { if (sel.length) actions.duplicateEntities(sel); ev.preventDefault(); }
      else if (k === 'c') { if (sel.length) actions.copySelection(); }
      else if (k === 'v') { actions.paste(canvasApi.pasteTile()); }
      else if (k === 'a') { actions.selectAll(); ev.preventDefault(); }
      return;
    }

    if (k === 'r' && sel.length) { actions.rotateEntities(sel); ev.preventDefault(); }
    else if ((ev.key === 'Delete' || ev.key === 'Backspace') && sel.length) {
      actions.deleteEntities(sel);
      ev.preventDefault();
    }
    else if (ev.key === 'Escape') actions.clearSelection();
  });

  window.addEventListener('keyup', ev => {
    if (ev.key === ' ') canvasApi.setSpace(false);
  });
  window.addEventListener('blur', () => canvasApi.setSpace(false));
}
