// Design canvas: fixed 300×300 tile world with pan/zoom, entity placement,
// drag-move, rectangle selection, and context menus.
// Rendering is incremental: one DOM node per placed entity, keyed by id.

import { h } from '../dom.js';
import { GRID_TILES, ENTITY_DEFS, RECIPES, ITEMS, QUALITIES, recipesForDef, machinesForCategories } from '../data/gamedata.js';
import { entityRates } from '../engine/rates.js';
import { store, actions, activeTab, getSize } from '../store/appStore.js';
import { formatRate } from './format.js';
import { showContextMenu } from './contextMenu.js';
import { toast } from './toast.js';

export const TILE = 24; // px per tile at zoom 1
const MIN_Z = 0.06;
const MAX_Z = 4;

// Populated by createCanvas(); used by keyboard.js for paste position & space-pan.
export const canvasApi = {
  setSpace: () => {},
  pasteTile: () => null,
  zoomToFit: () => {},
};

export function createCanvas() {
  const selRect = h('div', { class: 'select-rect', style: { display: 'none' } });
  const world = h('div', {
    class: 'world',
    style: { width: GRID_TILES * TILE + 'px', height: GRID_TILES * TILE + 'px' },
  }, selRect);
  const hudCoords = h('span', { class: 'hud-coords' }, '—');
  const hudZoom = h('span', { class: 'hud-zoom' }, '100%');
  const hud = h('div', { class: 'canvas-hud' },
    hudCoords,
    h('button', { class: 'hud-btn', title: 'Zoom out', onclick: () => zoomBy(1 / 1.25) }, '−'),
    hudZoom,
    h('button', { class: 'hud-btn', title: 'Zoom in', onclick: () => zoomBy(1.25) }, '+'),
    h('button', { class: 'hud-btn', title: 'Zoom to fit design', onclick: () => zoomToFit() }, '⛶ Fit'),
  );
  const wrap = h('div', { class: 'canvas-wrap' }, world, hud);

  let cam = { x: 60, y: 40, z: 1 };
  let camTabId = null;
  let camInitialized = false;
  let spaceHeld = false;
  let gesture = null;            // {type:'pan'|'drag'|'rect', ...}
  let dragOverride = null;       // Map(id → {x,y}) while dragging entities
  let lastMouseWorld = null;     // {x, y} px in world space, for paste position
  const els = new Map();         // entity id → element

  // ---------- camera ----------

  function applyCamera() {
    world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})`;
    hudZoom.textContent = `${Math.round(cam.z * 100)}%`;
  }

  function saveCamera() {
    if (camTabId) actions.setCamera(camTabId, cam);
  }

  function worldPt(ev) {
    const rect = wrap.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left - cam.x) / cam.z,
      y: (ev.clientY - rect.top - cam.y) / cam.z,
    };
  }

  function zoomAt(cx, cy, factor) {
    const z = Math.min(MAX_Z, Math.max(MIN_Z, cam.z * factor));
    if (z === cam.z) return;
    cam.x = cx - ((cx - cam.x) / cam.z) * z;
    cam.y = cy - ((cy - cam.y) / cam.z) * z;
    cam.z = z;
    applyCamera();
    saveCamera();
  }

  function zoomBy(factor) {
    const rect = wrap.getBoundingClientRect();
    zoomAt(rect.width / 2, rect.height / 2, factor);
  }

  function zoomToFit() {
    const t = activeTab();
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    let x0 = 0, y0 = 0, x1 = GRID_TILES, y1 = GRID_TILES;
    if (t?.entities.length) {
      x0 = Infinity; y0 = Infinity; x1 = -Infinity; y1 = -Infinity;
      for (const e of t.entities) {
        const { w, h: eh } = getSize(e);
        x0 = Math.min(x0, e.x); y0 = Math.min(y0, e.y);
        x1 = Math.max(x1, e.x + w); y1 = Math.max(y1, e.y + eh);
      }
      x0 -= 3; y0 -= 3; x1 += 3; y1 += 3;
    }
    const wPx = (x1 - x0) * TILE;
    const hPx = (y1 - y0) * TILE;
    const z = Math.min(MAX_Z, Math.max(MIN_Z, Math.min(rect.width / wPx, rect.height / hPx) * 0.95));
    cam = {
      z,
      x: (rect.width - wPx * z) / 2 - x0 * TILE * z,
      y: (rect.height - hPx * z) / 2 - y0 * TILE * z,
    };
    applyCamera();
    saveCamera();
  }

  canvasApi.zoomToFit = zoomToFit;
  canvasApi.setSpace = held => {
    spaceHeld = held;
    wrap.classList.toggle('pan-cursor', held);
  };
  canvasApi.pasteTile = () =>
    lastMouseWorld ? { x: lastMouseWorld.x / TILE, y: lastMouseWorld.y / TILE } : null;

  // ---------- entity elements ----------

  function buildEntityEl(e, def) {
    return h('div', { class: 'entity', dataset: { id: e.id } },
      h('div', { class: 'e-quality' }),
      h('div', { class: 'e-head' },
        h('span', { class: 'e-icon' }, def.icon),
        h('span', { class: 'e-name' }, def.name),
      ),
      h('div', { class: 'e-recipe' }),
      h('div', { class: 'e-ports' }, h('span', {}, 'IN ▸'), h('span', {}, '▸ OUT')),
      h('div', { class: 'e-dir' }),
      h('div', { class: 'e-count' }),
    );
  }

  function updateEntityEl(el, e, t, rateUnit) {
    const def = ENTITY_DEFS[e.defId];
    const { w, h: eh } = getSize(e);
    const pos = dragOverride?.get(e.id) || e;
    el.style.left = pos.x * TILE + 'px';
    el.style.top = pos.y * TILE + 'px';
    el.style.width = w * TILE + 'px';
    el.style.height = eh * TILE + 'px';

    const size = Math.min(w, eh);
    let cls = `entity type-${def.type} size-${Math.min(size, 3)}`;
    if (t.selection.includes(e.id)) cls += ' selected';
    if (def.type === 'machine' && !e.recipeId) cls += ' no-recipe';
    el.className = cls;

    // quality pip
    const q = QUALITIES[e.quality] || QUALITIES.normal;
    const qEl = el.querySelector('.e-quality');
    qEl.style.display = q.tier === 0 ? 'none' : '';
    qEl.style.background = q.color;
    qEl.title = q.name;

    // recipe / rate line
    const recipeEl = el.querySelector('.e-recipe');
    const r = entityRates(e);
    if (r) {
      const recipe = RECIPES[e.recipeId];
      const out = recipe.outputs[0];
      const item = ITEMS[out.itemId];
      const prodMult = 1 + (e.productivityBonus || 0) / 100;
      recipeEl.textContent = `${item?.icon || ''} ${formatRate(out.amount * r.craftsPerSecond * prodMult, rateUnit)}`;
      recipeEl.style.color = item?.color || '';
    } else if (def.type === 'machine') {
      recipeEl.textContent = 'no recipe';
      recipeEl.style.color = '';
    } else {
      recipeEl.textContent = '';
    }

    // direction arrow
    const dirEl = el.querySelector('.e-dir');
    dirEl.textContent = ['→', '↓', '←', '↑'][((e.rotation || 0) / 90) % 4];

    // machine count badge
    const countEl = el.querySelector('.e-count');
    countEl.textContent = (e.machineCount || 1) > 1 ? `×${e.machineCount}` : '';

    const recipe = e.recipeId ? RECIPES[e.recipeId] : null;
    el.title = `${def.name}${q.tier ? ` (${q.name})` : ''}${recipe ? ` — ${recipe.name}` : ''}`;
  }

  // ---------- sync with store ----------

  function sync(state) {
    const t = activeTab(state);
    if (!t) return;

    if (t.id !== camTabId) {
      camTabId = t.id;
      camInitialized = false;
      for (const el of els.values()) el.remove();
      els.clear();
    }
    if (!camInitialized) {
      camInitialized = true;
      if (t.camera) {
        cam = { ...t.camera };
        applyCamera();
      } else {
        // defer so the wrap has a measured size on first mount
        requestAnimationFrame(() => zoomToFit());
      }
    }

    world.classList.toggle('no-grid', !t.settings.showGrid);

    const seen = new Set();
    for (const e of t.entities) {
      seen.add(e.id);
      let el = els.get(e.id);
      if (!el) {
        el = buildEntityEl(e, ENTITY_DEFS[e.defId]);
        els.set(e.id, el);
        world.append(el);
      }
      updateEntityEl(el, e, t, state.rateUnit);
    }
    for (const [id, el] of els) {
      if (!seen.has(id)) {
        el.remove();
        els.delete(id);
      }
    }
  }

  store.subscribe(sync);
  requestAnimationFrame(() => sync(store.get()));

  // ---------- pointer gestures ----------

  wrap.addEventListener('wheel', ev => {
    ev.preventDefault();
    const rect = wrap.getBoundingClientRect();
    zoomAt(ev.clientX - rect.left, ev.clientY - rect.top, Math.exp(-ev.deltaY * 0.0015));
  }, { passive: false });

  wrap.addEventListener('pointerdown', ev => {
    if (gesture) return;
    const t = activeTab();
    if (!t) return;

    if (ev.button === 1 || (ev.button === 0 && spaceHeld)) {
      gesture = { type: 'pan', lastX: ev.clientX, lastY: ev.clientY };
      wrap.setPointerCapture(ev.pointerId);
      wrap.classList.add('panning');
      ev.preventDefault();
      return;
    }
    if (ev.button !== 0) return;

    const entEl = ev.target.closest('.entity');
    if (entEl) {
      const id = entEl.dataset.id;
      let sel = t.selection;
      const isSel = sel.includes(id);
      if (ev.shiftKey) {
        actions.toggleSelect(id);
        if (isSel) return; // shift-click deselected: no drag
        sel = [...sel, id];
      } else if (!isSel) {
        actions.select([id]);
        sel = [id];
      }
      const tab = activeTab();
      const start = new Map();
      for (const e of tab.entities) if (sel.includes(e.id)) start.set(e.id, { x: e.x, y: e.y });
      gesture = {
        type: 'drag', id, start, moved: false,
        startWorld: worldPt(ev), shift: ev.shiftKey, prevSelLen: t.selection.length,
      };
      wrap.setPointerCapture(ev.pointerId);
    } else {
      gesture = { type: 'rect', startWorld: worldPt(ev), moved: false, shift: ev.shiftKey };
      wrap.setPointerCapture(ev.pointerId);
    }
  });

  wrap.addEventListener('pointermove', ev => {
    const p = worldPt(ev);
    lastMouseWorld = p;
    const tx = p.x / TILE;
    const ty = p.y / TILE;
    hudCoords.textContent =
      tx >= 0 && ty >= 0 && tx < GRID_TILES && ty < GRID_TILES
        ? `${Math.floor(tx)}, ${Math.floor(ty)}`
        : '—';

    if (!gesture) return;

    if (gesture.type === 'pan') {
      cam.x += ev.clientX - gesture.lastX;
      cam.y += ev.clientY - gesture.lastY;
      gesture.lastX = ev.clientX;
      gesture.lastY = ev.clientY;
      applyCamera();
      return;
    }

    if (gesture.type === 'drag') {
      const t = activeTab();
      const snap = t?.settings.snap !== false;
      const dx = (p.x - gesture.startWorld.x) / TILE;
      const dy = (p.y - gesture.startWorld.y) / TILE;
      if (!gesture.moved && Math.hypot(dx, dy) < 0.15) return;
      gesture.moved = true;
      dragOverride = new Map();
      for (const [id, s0] of gesture.start) {
        const e = t.entities.find(en => en.id === id);
        if (!e) continue;
        const { w, h: eh } = getSize(e);
        let nx = s0.x + dx;
        let ny = s0.y + dy;
        nx = snap ? Math.round(nx) : Math.round(nx * 10) / 10;
        ny = snap ? Math.round(ny) : Math.round(ny * 10) / 10;
        nx = Math.max(0, Math.min(GRID_TILES - w, nx));
        ny = Math.max(0, Math.min(GRID_TILES - eh, ny));
        dragOverride.set(id, { x: nx, y: ny });
        const el = els.get(id);
        if (el) {
          el.style.left = nx * TILE + 'px';
          el.style.top = ny * TILE + 'px';
        }
      }
      return;
    }

    if (gesture.type === 'rect') {
      gesture.moved = true;
      const x0 = Math.min(gesture.startWorld.x, p.x);
      const y0 = Math.min(gesture.startWorld.y, p.y);
      const x1 = Math.max(gesture.startWorld.x, p.x);
      const y1 = Math.max(gesture.startWorld.y, p.y);
      Object.assign(selRect.style, {
        display: '', left: x0 + 'px', top: y0 + 'px',
        width: (x1 - x0) + 'px', height: (y1 - y0) + 'px',
      });
      gesture.box = { x0: x0 / TILE, y0: y0 / TILE, x1: x1 / TILE, y1: y1 / TILE };
    }
  });

  function endGesture(ev) {
    if (!gesture) return;
    const g = gesture;
    gesture = null;
    wrap.classList.remove('panning');
    try { wrap.releasePointerCapture(ev.pointerId); } catch { /* not captured */ }

    if (g.type === 'pan') {
      saveCamera();
      return;
    }

    if (g.type === 'drag') {
      if (g.moved && dragOverride) {
        const positions = {};
        for (const [id, p] of dragOverride) positions[id] = p;
        dragOverride = null;
        actions.moveEntitiesTo(positions);
      } else {
        dragOverride = null;
        // plain click on an entity inside a multi-selection → select just it
        if (!g.shift && g.prevSelLen > 1) actions.select([g.id]);
      }
      return;
    }

    if (g.type === 'rect') {
      selRect.style.display = 'none';
      const t = activeTab();
      if (!t) return;
      if (!g.moved || !g.box) {
        if (!g.shift) actions.clearSelection();
        return;
      }
      const hit = t.entities.filter(e => {
        const { w, h: eh } = getSize(e);
        return e.x < g.box.x1 && e.x + w > g.box.x0 && e.y < g.box.y1 && e.y + eh > g.box.y0;
      }).map(e => e.id);
      actions.select(g.shift ? [...new Set([...t.selection, ...hit])] : hit);
    }
  }

  wrap.addEventListener('pointerup', endGesture);
  wrap.addEventListener('pointercancel', endGesture);

  // ---------- drop from library ----------

  wrap.addEventListener('dragover', ev => {
    if (ev.dataTransfer.types.includes('text/fb-def')) {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'copy';
    }
  });

  wrap.addEventListener('drop', ev => {
    const defId = ev.dataTransfer.getData('text/fb-def');
    if (!defId || !ENTITY_DEFS[defId]) return;
    ev.preventDefault();
    const quality = ev.dataTransfer.getData('text/fb-quality') || 'normal';
    const def = ENTITY_DEFS[defId];
    const t = activeTab();
    const snap = t?.settings.snap !== false;
    const p = worldPt(ev);
    let x = p.x / TILE - def.w / 2;
    let y = p.y / TILE - def.h / 2;
    x = snap ? Math.round(x) : Math.round(x * 10) / 10;
    y = snap ? Math.round(y) : Math.round(y * 10) / 10;
    actions.placeEntity(defId, x, y, quality);
  });

  // ---------- context menu ----------

  wrap.addEventListener('contextmenu', ev => {
    ev.preventDefault();
    const t = activeTab();
    if (!t) return;
    const entEl = ev.target.closest('.entity');

    if (entEl) {
      const id = entEl.dataset.id;
      if (!t.selection.includes(id)) actions.select([id]);
      const selIds = activeTab().selection;
      const entity = t.entities.find(e => e.id === id);
      const def = ENTITY_DEFS[entity.defId];
      const items = [
        { label: 'Edit', hint: 'inspector', action: () => toast('Entity selected — edit it in the right panel') },
      ];
      if (def.type === 'machine') {
        const recipes = recipesForDef(def);
        items.push({
          label: 'Change Recipe',
          submenu: () => [
            { label: '— None —', action: () => actions.updateEntities(selIds, { recipeId: null }) },
            ...recipes.map(r => ({
              label: r.name,
              checked: entity.recipeId === r.id,
              action: () => actions.updateEntities(
                selIds.filter(sid => {
                  const se = activeTab().entities.find(e2 => e2.id === sid);
                  return se && ENTITY_DEFS[se.defId]?.recipeCategories?.includes(r.category);
                }),
                { recipeId: r.id },
              ),
            })),
          ],
        });
        const machines = machinesForCategories(def.recipeCategories);
        items.push({
          label: 'Change Machine',
          submenu: () => machines.map(m => ({
            label: m.name,
            checked: entity.defId === m.id,
            action: () => actions.updateEntities(selIds, e2 => {
              if (ENTITY_DEFS[e2.defId]?.type !== 'machine') return {};
              const keepRecipe = e2.recipeId && m.recipeCategories.includes(RECIPES[e2.recipeId]?.category);
              return { defId: m.id, recipeId: keepRecipe ? e2.recipeId : null };
            }),
          })),
        });
      }
      items.push(
        { separator: true },
        { label: 'Rotate', hint: 'R', action: () => actions.rotateEntities(selIds) },
        { label: 'Duplicate', hint: 'Ctrl+D', action: () => actions.duplicateEntities(selIds) },
        { label: 'Copy', hint: 'Ctrl+C', action: () => actions.copySelection() },
        { separator: true },
        { label: 'Delete', hint: 'Del', danger: true, action: () => actions.deleteEntities(selIds) },
      );
      showContextMenu(ev.clientX, ev.clientY, items);
    } else {
      const pasteAt = canvasApi.pasteTile();
      showContextMenu(ev.clientX, ev.clientY, [
        {
          label: 'Paste', hint: 'Ctrl+V',
          disabled: !store.get().clipboard?.length,
          action: () => actions.paste(pasteAt),
        },
        { label: 'Select All', hint: 'Ctrl+A', action: () => actions.selectAll() },
        { label: 'Clear Selection', hint: 'Esc', action: () => actions.clearSelection() },
        { separator: true },
        { label: 'Toggle Grid', checked: t.settings.showGrid, action: () => actions.toggleGrid() },
        { label: 'Toggle Snap', checked: t.settings.snap, action: () => actions.toggleSnap() },
        { label: 'Zoom to Fit', action: () => zoomToFit() },
      ]);
    }
  });

  return wrap;
}
