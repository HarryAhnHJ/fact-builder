// Persistence: localStorage autosave + named saves + JSON file export/import.

import { store, serializeWorkspace, restoreWorkspace, serializeDesign, designFromJSON } from './appStore.js';

const WS_KEY = 'factbuilder.workspace.v1';
const SAVES_KEY = 'factbuilder.saves.v1';

export function tryRestoreWorkspace() {
  try {
    const raw = localStorage.getItem(WS_KEY);
    if (!raw) return false;
    return restoreWorkspace(JSON.parse(raw));
  } catch (err) {
    console.warn('Workspace restore failed:', err);
    return false;
  }
}

export function initAutosave() {
  let timer = null;
  store.subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        localStorage.setItem(WS_KEY, JSON.stringify(serializeWorkspace()));
      } catch (err) {
        console.warn('Autosave failed:', err);
      }
    }, 400);
  });
}

// ---------- named saves ----------

function readSaves() {
  try {
    return JSON.parse(localStorage.getItem(SAVES_KEY)) || {};
  } catch {
    return {};
  }
}

export function listSaves() {
  return Object.entries(readSaves())
    .map(([name, d]) => ({ name, entityCount: d.entities?.length ?? 0, savedAt: d.savedAt }))
    .sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
}

export function saveDesign(tab) {
  const saves = readSaves();
  saves[tab.name] = { ...serializeDesign(tab), savedAt: new Date().toISOString() };
  localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
}

export function loadSave(name) {
  const raw = readSaves()[name];
  if (!raw) throw new Error(`No saved design named "${name}"`);
  return designFromJSON(raw);
}

export function deleteSave(name) {
  const saves = readSaves();
  delete saves[name];
  localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
}

// ---------- file export / import ----------

export function exportDesignFile(tab) {
  const json = JSON.stringify(serializeDesign(tab), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tab.name.replace(/[^\w\- ]+/g, '_')}.factory.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function importDesignFile(file) {
  const text = await file.text();
  return designFromJSON(JSON.parse(text));
}
