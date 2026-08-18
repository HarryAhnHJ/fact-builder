// Entry point: assemble panels, restore/seed the workspace, start autosave.

import { h, clear } from './dom.js';
import { store, actions } from './store/appStore.js';
import { tryRestoreWorkspace, initAutosave } from './store/persist.js';
import { demoEntities } from './data/seed.js';
import { createToolbar } from './ui/toolbar.js';
import { createTabs } from './ui/tabs.js';
import { createLibrary } from './ui/library.js';
import { createCanvas } from './ui/canvas.js';
import { createInspector } from './ui/inspector.js';
import { initKeyboard } from './ui/keyboard.js';

const app = document.getElementById('app');

if (!tryRestoreWorkspace()) {
  actions.addTab('Electronic Circuits Demo', demoEntities());
}

clear(app);
app.append(
  createToolbar(),
  createTabs(),
  h('main', { class: 'main' },
    createLibrary(),
    createCanvas(),
    createInspector(),
  ),
);

initKeyboard();
initAutosave();
