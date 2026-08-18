// Application state + actions. Entities/tabs are treated immutably so
// undo/redo can snapshot the entities array per tab.

import { createStore } from './createStore.js';
import { ENTITY_DEFS, GRID_TILES, RECIPES, QUALITIES, recipesForDef } from '../data/gamedata.js';

const HISTORY_LIMIT = 100;
let idCounter = 1;

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `e-${Date.now().toString(36)}-${idCounter++}`;
}

export function newTab(name, entities = [], settings = {}) {
  return {
    id: newId(),
    name,
    entities,
    settings: { showGrid: true, snap: true, ...settings },
    camera: null,          // set by canvas on first interaction; null → fit view
    selection: [],
    history: [],
    future: [],
  };
}

export const store = createStore({
  tabs: [],
  activeTabId: null,
  clipboard: null,
  rateUnit: 's', // 's' | 'm' | 'h'
});

// ---------- selectors ----------

export function activeTab(s = store.get()) {
  return s.tabs.find(t => t.id === s.activeTabId) || null;
}

export function selectedEntities(s = store.get()) {
  const t = activeTab(s);
  if (!t) return [];
  const sel = new Set(t.selection);
  return t.entities.filter(e => sel.has(e.id));
}

// Footprint of a placed entity, accounting for rotation.
export function getSize(e) {
  const def = ENTITY_DEFS[e.defId];
  if (!def) return { w: 1, h: 1 };
  const swapped = ((e.rotation || 0) % 180) !== 0;
  return { w: swapped ? def.h : def.w, h: swapped ? def.w : def.h };
}

// ---------- helpers ----------

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function clampPos(e, x, y) {
  const { w, h } = getSize(e);
  return { x: clamp(x, 0, GRID_TILES - w), y: clamp(y, 0, GRID_TILES - h) };
}

function updateTab(s, tabId, fn) {
  return { ...s, tabs: s.tabs.map(t => (t.id === tabId ? fn(t) : t)) };
}

function updateActive(fn) {
  store.set(s => (activeTab(s) ? updateTab(s, s.activeTabId, fn) : s));
}

// Replace a tab's entities, pushing the previous array onto the undo history.
function commitEntities(t, entities, selection = t.selection) {
  return {
    ...t,
    entities,
    selection,
    history: [...t.history.slice(-(HISTORY_LIMIT - 1)), t.entities],
    future: [],
  };
}

function untitledName(s) {
  let n = 1;
  while (s.tabs.some(t => t.name === `Design ${n}`)) n++;
  return `Design ${n}`;
}

// Coerce arbitrary (imported) data into a valid placed entity, or null.
export function sanitizeEntity(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const def = ENTITY_DEFS[raw.defId];
  if (!def) return null;
  const num = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);
  const e = {
    id: typeof raw.id === 'string' ? raw.id : newId(),
    defId: def.id,
    quality: QUALITIES[raw.quality] ? raw.quality : 'normal',
    x: 0,
    y: 0,
    rotation: [0, 90, 180, 270].includes(raw.rotation) ? raw.rotation : 0,
    recipeId: raw.recipeId && RECIPES[raw.recipeId] ? raw.recipeId : null,
    machineCount: Math.max(1, Math.round(num(raw.machineCount, 1))),
    craftingSpeedOverride:
      raw.craftingSpeedOverride != null && isFinite(raw.craftingSpeedOverride) && raw.craftingSpeedOverride > 0
        ? raw.craftingSpeedOverride : null,
    speedBonus: num(raw.speedBonus, 0),
    productivityBonus: num(raw.productivityBonus, 0),
  };
  const p = clampPos(e, num(raw.x, 0), num(raw.y, 0));
  e.x = p.x;
  e.y = p.y;
  return e;
}

// ---------- actions ----------

export const actions = {
  // tabs -------------------------------------------------------------------
  addTab(name, entities = [], settings = {}) {
    const t = newTab(name || untitledName(store.get()), entities, settings);
    store.set(s => ({ ...s, tabs: [...s.tabs, t], activeTabId: t.id }));
    return t;
  },

  closeTab(id) {
    store.set(s => {
      const idx = s.tabs.findIndex(t => t.id === id);
      if (idx < 0) return s;
      let tabs = s.tabs.filter(t => t.id !== id);
      let activeTabId = s.activeTabId;
      if (!tabs.length) {
        const t = newTab('Design 1');
        tabs = [t];
        activeTabId = t.id;
      } else if (activeTabId === id) {
        activeTabId = tabs[Math.max(0, idx - 1)].id;
      }
      return { ...s, tabs, activeTabId };
    });
  },

  setActiveTab(id) {
    store.set(s => (s.tabs.some(t => t.id === id) ? { ...s, activeTabId: id } : s));
  },

  renameTab(id, name) {
    name = (name || '').trim();
    if (!name) return;
    store.set(s => updateTab(s, id, t => ({ ...t, name })));
  },

  // view settings ----------------------------------------------------------
  setRateUnit(unit) {
    store.set(s => ({ ...s, rateUnit: unit }));
  },

  toggleGrid() {
    updateActive(t => ({ ...t, settings: { ...t.settings, showGrid: !t.settings.showGrid } }));
  },

  toggleSnap() {
    updateActive(t => ({ ...t, settings: { ...t.settings, snap: !t.settings.snap } }));
  },

  setCamera(tabId, camera) {
    store.set(s => updateTab(s, tabId, t => ({ ...t, camera: { ...camera } })));
  },

  // selection (no history) ---------------------------------------------------
  select(ids) {
    updateActive(t => ({ ...t, selection: [...ids] }));
  },

  toggleSelect(id) {
    updateActive(t => ({
      ...t,
      selection: t.selection.includes(id)
        ? t.selection.filter(x => x !== id)
        : [...t.selection, id],
    }));
  },

  selectAll() {
    updateActive(t => ({ ...t, selection: t.entities.map(e => e.id) }));
  },

  clearSelection() {
    updateActive(t => ({ ...t, selection: [] }));
  },

  // entity mutations (with history) ------------------------------------------
  placeEntity(defId, x, y, quality = 'normal') {
    const def = ENTITY_DEFS[defId];
    if (!def) return;
    const recipes = recipesForDef(def);
    const e = {
      id: newId(),
      defId,
      quality: QUALITIES[quality] ? quality : 'normal',
      x: 0,
      y: 0,
      rotation: 0,
      recipeId: recipes.length === 1 ? recipes[0].id : null,
      machineCount: 1,
      craftingSpeedOverride: null,
      speedBonus: 0,
      productivityBonus: 0,
    };
    const p = clampPos(e, x, y);
    e.x = p.x;
    e.y = p.y;
    updateActive(t => commitEntities(t, [...t.entities, e], [e.id]));
    return e;
  },

  // positions: { [id]: {x, y} } — single undo step for a whole drag.
  moveEntitiesTo(positions) {
    updateActive(t => {
      const entities = t.entities.map(e => {
        const p = positions[e.id];
        if (!p) return e;
        const c = clampPos(e, p.x, p.y);
        return { ...e, x: c.x, y: c.y };
      });
      return commitEntities(t, entities);
    });
  },

  rotateEntities(ids) {
    const set = new Set(ids);
    updateActive(t => {
      if (!ids.length) return t;
      const entities = t.entities.map(e => {
        if (!set.has(e.id)) return e;
        const rotated = { ...e, rotation: ((e.rotation || 0) + 90) % 360 };
        const p = clampPos(rotated, rotated.x, rotated.y);
        return { ...rotated, x: p.x, y: p.y };
      });
      return commitEntities(t, entities);
    });
  },

  deleteEntities(ids) {
    const set = new Set(ids);
    updateActive(t => {
      if (!ids.length) return t;
      return commitEntities(
        t,
        t.entities.filter(e => !set.has(e.id)),
        t.selection.filter(id => !set.has(id)),
      );
    });
  },

  duplicateEntities(ids) {
    const set = new Set(ids);
    updateActive(t => {
      const src = t.entities.filter(e => set.has(e.id));
      if (!src.length) return t;
      const copies = src.map(e => {
        const c = { ...e, id: newId() };
        const p = clampPos(c, c.x + 1, c.y + 1);
        c.x = p.x;
        c.y = p.y;
        return c;
      });
      return commitEntities(t, [...t.entities, ...copies], copies.map(c => c.id));
    });
  },

  copySelection() {
    const sel = selectedEntities();
    if (!sel.length) return;
    store.set(s => ({ ...s, clipboard: JSON.parse(JSON.stringify(sel)) }));
  },

  // at: optional {x, y} tile to paste around (e.g. mouse position).
  paste(at) {
    store.set(s => {
      const clip = s.clipboard;
      const t = activeTab(s);
      if (!clip?.length || !t) return s;
      const minX = Math.min(...clip.map(e => e.x));
      const minY = Math.min(...clip.map(e => e.y));
      const base = at ? { x: Math.round(at.x), y: Math.round(at.y) } : { x: minX + 1, y: minY + 1 };
      const copies = clip.map(e => {
        const c = { ...e, id: newId() };
        const p = clampPos(c, e.x - minX + base.x, e.y - minY + base.y);
        c.x = p.x;
        c.y = p.y;
        return c;
      });
      return updateTab(s, t.id, tab =>
        commitEntities(tab, [...tab.entities, ...copies], copies.map(c => c.id)),
      );
    });
  },

  // patch: object merged into each entity, or fn(entity) → partial.
  updateEntities(ids, patch) {
    const set = new Set(ids);
    updateActive(t => {
      if (!ids.length) return t;
      let changed = false;
      const entities = t.entities.map(e => {
        if (!set.has(e.id)) return e;
        changed = true;
        const partial = typeof patch === 'function' ? patch(e) : patch;
        const next = { ...e, ...partial };
        const p = clampPos(next, next.x, next.y);
        next.x = p.x;
        next.y = p.y;
        return next;
      });
      return changed ? commitEntities(t, entities) : t;
    });
  },

  // undo / redo -------------------------------------------------------------
  undo() {
    updateActive(t => {
      if (!t.history.length) return t;
      const prev = t.history[t.history.length - 1];
      const ids = new Set(prev.map(e => e.id));
      return {
        ...t,
        entities: prev,
        history: t.history.slice(0, -1),
        future: [t.entities, ...t.future.slice(0, HISTORY_LIMIT - 1)],
        selection: t.selection.filter(id => ids.has(id)),
      };
    });
  },

  redo() {
    updateActive(t => {
      if (!t.future.length) return t;
      const next = t.future[0];
      const ids = new Set(next.map(e => e.id));
      return {
        ...t,
        entities: next,
        history: [...t.history.slice(-(HISTORY_LIMIT - 1)), t.entities],
        future: t.future.slice(1),
        selection: t.selection.filter(id => ids.has(id)),
      };
    });
  },
};

// ---------- (de)serialization ----------

export function serializeDesign(t) {
  return { version: 1, name: t.name, settings: t.settings, entities: t.entities };
}

export function designFromJSON(json) {
  if (!json || typeof json !== 'object') throw new Error('Not a design file');
  if (json.version !== 1) throw new Error(`Unsupported design version: ${json.version}`);
  if (!Array.isArray(json.entities)) throw new Error('Design has no entities array');
  const entities = json.entities.map(sanitizeEntity).filter(Boolean);
  return {
    name: typeof json.name === 'string' && json.name.trim() ? json.name.trim() : null,
    settings: typeof json.settings === 'object' && json.settings ? json.settings : {},
    entities,
  };
}

export function serializeWorkspace(s = store.get()) {
  return {
    version: 1,
    activeTabId: s.activeTabId,
    rateUnit: s.rateUnit,
    tabs: s.tabs.map(t => ({
      id: t.id,
      name: t.name,
      settings: t.settings,
      camera: t.camera,
      entities: t.entities,
    })),
  };
}

export function restoreWorkspace(json) {
  if (!json || json.version !== 1 || !Array.isArray(json.tabs) || !json.tabs.length) return false;
  const tabs = json.tabs.map(raw => {
    const t = newTab(
      typeof raw.name === 'string' ? raw.name : 'Design',
      (Array.isArray(raw.entities) ? raw.entities : []).map(sanitizeEntity).filter(Boolean),
      typeof raw.settings === 'object' && raw.settings ? raw.settings : {},
    );
    if (typeof raw.id === 'string') t.id = raw.id;
    if (raw.camera && isFinite(raw.camera.x) && isFinite(raw.camera.y) && raw.camera.z > 0) {
      t.camera = { x: raw.camera.x, y: raw.camera.y, z: raw.camera.z };
    }
    return t;
  });
  const activeTabId = tabs.some(t => t.id === json.activeTabId) ? json.activeTabId : tabs[0].id;
  const rateUnit = ['s', 'm', 'h'].includes(json.rateUnit) ? json.rateUnit : 's';
  store.set(s => ({ ...s, tabs, activeTabId, rateUnit }));
  return true;
}
