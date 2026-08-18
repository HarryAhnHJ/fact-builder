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

const libraryPanel = createLibrary();
const canvasPanel = createCanvas();
const inspectorPanel = createInspector();
const main = h('main', { class: 'main' }, libraryPanel, canvasPanel, inspectorPanel);

// Mobile bottom nav: on narrow screens the side panels become slide-up
// sheets over the canvas (CSS hides this nav on desktop).
let openSheet = null; // 'library' | 'inspector' | null

function setSheet(name) {
  openSheet = name;
  main.classList.toggle('sheet-library', name === 'library');
  main.classList.toggle('sheet-inspector', name === 'inspector');
  libBtn.classList.toggle('active', name === 'library');
  inspBtn.classList.toggle('active', name === 'inspector');
}

const libBtn = h('button', { class: 'nav-btn', onclick: () => setSheet(openSheet === 'library' ? null : 'library') },
  h('span', { class: 'nav-icon' }, '⚙'), 'Library');
const inspBtn = h('button', { class: 'nav-btn', onclick: () => setSheet(openSheet === 'inspector' ? null : 'inspector') },
  h('span', { class: 'nav-icon' }, '☰'), 'Inspect');
const mobileNav = h('nav', { class: 'mobile-nav' }, libBtn, inspBtn);

// touching the canvas (or arming placement from the library) dismisses any open sheet
canvasPanel.addEventListener('pointerdown', () => { if (openSheet) setSheet(null); }, true);
window.addEventListener('fb:close-sheets', () => setSheet(null));

clear(app);
app.append(
  createToolbar(),
  createTabs(),
  main,
  mobileNav,
);

initKeyboard();
initAutosave();
