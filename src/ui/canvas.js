// Design canvas: fixed 300×300 tile world with pan/zoom, entity placement,
// drag-move, rectangle selection, and context menus.
// Rendering is incremental: one DOM node per placed entity, keyed by id.

import { h } from '../dom.js';
import { GRID_TILES, ENTITY_DEFS, RECIPES, ITEMS, QUALITIES, recipesForDef, machinesForCategories } from '../data/gamedata.js';
import { entityRates, totalProductivity, aggregateRates, ratesToRows } from '../engine/rates.js';
import { store, actions, activeTab, getSize, canPlaceAt, collidesWithAny } from '../store/appStore.js';
import { formatRate } from './format.js';
import { showContextMenu } from './contextMenu.js';
import { showModal } from './modal.js';
import { ratesTable } from './ratesTable.js';
import { toast } from './toast.js';

export const TILE = 24; // px per tile at zoom 1
const MIN_Z = 0.06;
const MAX_Z = 4;

// Populated by createCanvas(); used by keyboard.js for paste position & space-pan.
export const canvasApi = {
  setSpace: () => {},
  pasteTile: () => null,
  zoomToFit: () => {},
  armPlacement: () => {},
  cancelPlacement: () => {},
  hasPlacement: () => false,
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
  const ghost = h('div', { class: 'ghost-entity', style: { display: 'none' } },
    h('span', { class: 'ghost-icon' }));
  world.append(ghost);
  const zoneRect = h('div', { class: 'zone-rect', style: { display: 'none' } });
  world.append(zoneRect);
  const rateCalcBtn = h('button', {
    class: 'rate-calc-btn',
    title: 'Drag a zone on the canvas to calculate the rates of everything inside it',
    onclick: () => setRateCalc(!rateCalcArmed),
  }, '▧ Rate calculator');
  const wrap = h('div', { class: 'canvas-wrap' }, world, hud, rateCalcBtn);

  let cam = { x: 60, y: 40, z: 1 };
  let camTabId = null;
  let camInitialized = false;
  let spaceHeld = false;
  let gesture = null;            // {type:'pan'|'drag'|'rect'|'pinch'|'place'|'zone', ...}
  let dragOverride = null;       // Map(id → {x,y}) while dragging entities
  let dragBlocked = false;       // current drag position overlaps another entity
  let lastMouseWorld = null;     // {x, y} px in world space, for paste position
  let placement = null;          // {defId, quality} — entity attached to the cursor
  let rateCalcArmed = false;     // next drag defines a rate-calculator zone
  let longPressTimer = null;
  const touchPts = new Map();    // pointerId → {x, y} client coords (touch only)
  let pinch = null;              // last {dist, cx, cy} while two fingers are down
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

  // ---------- click-to-place (ghost follows the cursor) ----------

  function placementTile(p) {
    const def = ENTITY_DEFS[placement.defId];
    return {
      x: Math.max(0, Math.min(GRID_TILES - def.w, Math.round(p.x / TILE - def.w / 2))),
      y: Math.max(0, Math.min(GRID_TILES - def.h, Math.round(p.y / TILE - def.h / 2))),
    };
  }

  function updateGhost(p) {
    if (!placement || !p) return;
    const def = ENTITY_DEFS[placement.defId];
    const tile = placementTile(p);
    ghost.style.display = '';
    ghost.style.left = tile.x * TILE + 'px';
    ghost.style.top = tile.y * TILE + 'px';
    ghost.style.width = def.w * TILE + 'px';
    ghost.style.height = def.h * TILE + 'px';
    ghost.classList.toggle('blocked', !canPlaceAt(placement.defId, tile.x, tile.y));
  }

  canvasApi.armPlacement = (defId, quality) => {
    const def = ENTITY_DEFS[defId];
    if (!def) return;
    setRateCalc(false);
    placement = { defId, quality: quality || 'normal' };
    ghost.querySelector('.ghost-icon').textContent = def.icon;
    wrap.classList.add('placing');
    updateGhost(lastMouseWorld);
  };
  canvasApi.cancelPlacement = () => {
    placement = null;
    ghost.style.display = 'none';
    wrap.classList.remove('placing');
  };
  canvasApi.hasPlacement = () => !!placement;

  function placeAt(p) {
    const tile = placementTile(p);
    if (!canPlaceAt(placement.defId, tile.x, tile.y)) {
      toast('That spot is occupied', 'warn');
      return;
    }
    actions.placeEntity(placement.defId, tile.x, tile.y, placement.quality);
    canvasApi.cancelPlacement();
  }

  // ---------- rate calculator zone ----------

  function setRateCalc(on) {
    rateCalcArmed = on;
    if (on) canvasApi.cancelPlacement();
    rateCalcBtn.classList.toggle('active', on);
    wrap.classList.toggle('rate-calc-mode', on);
    if (!on) zoneRect.style.display = 'none';
  }

  function showZoneRates(box) {
    const t = activeTab();
    if (!t) return;
    const inZone = t.entities.filter(e => {
      const { w, h: eh } = getSize(e);
      return e.x < box.x1 && e.x + w > box.x0 && e.y < box.y1 && e.y + eh > box.y0;
    });
    const machines = inZone.filter(e => ENTITY_DEFS[e.defId]?.type === 'machine');
    const rows = ratesToRows(aggregateRates(inZone));
    showModal('Rate Calculator',
      h('div', {},
        h('div', { class: 'insp-sub' },
          `${inZone.length} entities in zone · ${machines.length} production machine${machines.length === 1 ? '' : 's'}`),
        rows.length
          ? ratesTable('rate-calc', rows, store.get().rateUnit)
          : h('div', { class: 'insp-hint' },
              'No production or consumption inside this zone. Include machines with assigned recipes.'),
      ),
    );
  }

  // ---------- long-press → context menu (touch has no right-click) ----------

  function cancelLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function startLongPress(ev) {
    cancelLongPress();
    if (placement) return;
    const { clientX, clientY } = ev;
    const entEl = ev.target.closest('.entity');
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      // abandon the in-flight gesture without committing it
      if (gesture) {
        gesture = null;
        dragOverride = null;
        wrap.classList.remove('panning');
        sync(store.get());
      }
      if (navigator.vibrate) navigator.vibrate(10);
      openMenu(clientX, clientY, entEl, worldPt(ev));
    }, 450);
  }

  function pinchState() {
    const [a, b] = [...touchPts.values()];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
  }

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
      const prodMult = 1 + totalProductivity(e) / 100;
      recipeEl.textContent = `${item?.icon || ''} ${formatRate(out.amount * r.craftsPerSecond * prodMult, rateUnit)}`;
      recipeEl.style.color = item?.color || '';
    } else if (def.type === 'machine') {
      recipeEl.textContent = 'no recipe';
      recipeEl.style.color = '';
    } else {
      recipeEl.textContent = '';
    }

    // direction: belts/inserters ARE an arrow (rotated glyph); others get a corner hint
    const dirEl = el.querySelector('.e-dir');
    const iconEl = el.querySelector('.e-icon');
    if (def.arrow) {
      iconEl.textContent = def.arrow;
      iconEl.classList.add('e-arrow');
      iconEl.style.transform = `rotate(${e.rotation || 0}deg)`;
      dirEl.textContent = '';
    } else {
      iconEl.textContent = def.icon;
      iconEl.classList.remove('e-arrow');
      iconEl.style.transform = '';
      dirEl.textContent = ['→', '↓', '←', '↑'][((e.rotation || 0) / 90) % 4];
    }

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

  // capture can fail for pointers that are already gone — never fatal
  function capturePointer(ev) {
    try { wrap.setPointerCapture(ev.pointerId); } catch { /* not active */ }
  }

  wrap.addEventListener('wheel', ev => {
    ev.preventDefault();
    const rect = wrap.getBoundingClientRect();
    zoomAt(ev.clientX - rect.left, ev.clientY - rect.top, Math.exp(-ev.deltaY * 0.0015));
  }, { passive: false });

  wrap.addEventListener('pointerdown', ev => {
    const t = activeTab();
    if (!t) return;

    if (ev.pointerType === 'touch') {
      // a new primary touch starts a fresh sequence — drop any ghost points
      // left behind when a finger lifted outside the canvas (nav bar, sheets)
      if (ev.isPrimary) touchPts.clear();
      touchPts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (touchPts.size === 2) {
        // second finger: whatever was in flight becomes a pinch (zoom + pan)
        cancelLongPress();
        if (gesture) {
          gesture = null;
          dragOverride = null;
          sync(store.get());
        }
        gesture = { type: 'pinch' };
        pinch = pinchState();
        return;
      }
      if (touchPts.size > 2) return;
    }

    if (gesture) return;

    if (ev.button === 1 || (ev.button === 0 && spaceHeld)) {
      gesture = { type: 'pan', lastX: ev.clientX, lastY: ev.clientY };
      capturePointer(ev);
      wrap.classList.add('panning');
      ev.preventDefault();
      return;
    }
    if (ev.button !== 0) return;

    if (rateCalcArmed) {
      gesture = { type: 'zone', startWorld: worldPt(ev), moved: false };
      capturePointer(ev);
      return;
    }

    if (placement) {
      // armed: click places, dragging still pans so you can line up the spot
      gesture = {
        type: 'place', moved: false,
        lastX: ev.clientX, lastY: ev.clientY, pressX: ev.clientX, pressY: ev.clientY,
      };
      capturePointer(ev);
      return;
    }

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
      capturePointer(ev);
      if (ev.pointerType === 'touch') startLongPress(ev);
    } else if (ev.pointerType === 'touch') {
      // one finger on empty canvas: pan (a still finger long-presses, a tap deselects)
      gesture = {
        type: 'pan', touchTap: true, moved: false,
        lastX: ev.clientX, lastY: ev.clientY, pressX: ev.clientX, pressY: ev.clientY,
      };
      capturePointer(ev);
      startLongPress(ev);
    } else {
      gesture = { type: 'rect', startWorld: worldPt(ev), moved: false, shift: ev.shiftKey };
      capturePointer(ev);
    }
  });

  wrap.addEventListener('pointermove', ev => {
    if (ev.pointerType === 'touch' && touchPts.has(ev.pointerId)) {
      touchPts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    }

    const p = worldPt(ev);
    lastMouseWorld = p;
    const tx = p.x / TILE;
    const ty = p.y / TILE;
    hudCoords.textContent =
      tx >= 0 && ty >= 0 && tx < GRID_TILES && ty < GRID_TILES
        ? `${Math.floor(tx)}, ${Math.floor(ty)}`
        : '—';

    if (placement) updateGhost(p);

    if (!gesture) return;

    if (longPressTimer && gesture.pressX != null
        && Math.hypot(ev.clientX - gesture.pressX, ev.clientY - gesture.pressY) > 8) {
      cancelLongPress();
    }

    if (gesture.type === 'pinch') {
      if (touchPts.size < 2) return;
      const s = pinchState();
      const rect = wrap.getBoundingClientRect();
      cam.x += s.cx - pinch.cx;
      cam.y += s.cy - pinch.cy;
      applyCamera();
      zoomAt(s.cx - rect.left, s.cy - rect.top, s.dist / Math.max(1, pinch.dist));
      pinch = s;
      return;
    }

    if (gesture.type === 'pan' || gesture.type === 'place') {
      if (!gesture.moved && gesture.pressX != null
          && Math.hypot(ev.clientX - gesture.pressX, ev.clientY - gesture.pressY) > 6) {
        gesture.moved = true;
      }
      cam.x += ev.clientX - gesture.lastX;
      cam.y += ev.clientY - gesture.lastY;
      gesture.lastX = ev.clientX;
      gesture.lastY = ev.clientY;
      applyCamera();
      return;
    }

    if (gesture.type === 'drag') {
      const t = activeTab();
      const dx = (p.x - gesture.startWorld.x) / TILE;
      const dy = (p.y - gesture.startWorld.y) / TILE;
      if (!gesture.moved && Math.hypot(dx, dy) < 0.15) return;
      gesture.moved = true;
      cancelLongPress();
      dragOverride = new Map();
      for (const [id, s0] of gesture.start) {
        const e = t.entities.find(en => en.id === id);
        if (!e) continue;
        const { w, h: eh } = getSize(e);
        const nx = Math.max(0, Math.min(GRID_TILES - w, Math.round(s0.x + dx)));
        const ny = Math.max(0, Math.min(GRID_TILES - eh, Math.round(s0.y + dy)));
        dragOverride.set(id, { x: nx, y: ny });
      }
      // any dragged entity overlapping a non-dragged one (or another dragged
      // one at its new spot) blocks the whole move
      const stationary = t.entities.filter(e => !gesture.start.has(e.id));
      const movedEnts = t.entities
        .filter(e => dragOverride.has(e.id))
        .map(e => ({ ...e, ...dragOverride.get(e.id) }));
      dragBlocked = movedEnts.some(e =>
        collidesWithAny(stationary, e) || collidesWithAny(movedEnts, e));
      for (const [id, pos] of dragOverride) {
        const el = els.get(id);
        if (!el) continue;
        el.style.left = pos.x * TILE + 'px';
        el.style.top = pos.y * TILE + 'px';
        el.classList.toggle('blocked', dragBlocked);
      }
      return;
    }

    if (gesture.type === 'zone') {
      gesture.moved = true;
      const x0 = Math.max(0, Math.min(gesture.startWorld.x, p.x));
      const y0 = Math.max(0, Math.min(gesture.startWorld.y, p.y));
      const x1 = Math.min(GRID_TILES * TILE, Math.max(gesture.startWorld.x, p.x));
      const y1 = Math.min(GRID_TILES * TILE, Math.max(gesture.startWorld.y, p.y));
      Object.assign(zoneRect.style, {
        display: '', left: x0 + 'px', top: y0 + 'px',
        width: (x1 - x0) + 'px', height: (y1 - y0) + 'px',
      });
      gesture.box = { x0: x0 / TILE, y0: y0 / TILE, x1: x1 / TILE, y1: y1 / TILE };
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
    if (ev.pointerType === 'touch') touchPts.delete(ev.pointerId);
    cancelLongPress();
    if (!gesture) return;

    if (gesture.type === 'pinch') {
      if (touchPts.size < 2) {
        gesture = null;
        pinch = null;
        saveCamera();
      }
      return;
    }

    const g = gesture;
    gesture = null;
    wrap.classList.remove('panning');
    try { wrap.releasePointerCapture(ev.pointerId); } catch { /* not captured */ }

    if (g.type === 'place') {
      if (g.moved) saveCamera();
      else if (placement) placeAt(worldPt(ev));
      return;
    }

    if (g.type === 'zone') {
      zoneRect.style.display = 'none';
      setRateCalc(false);
      if (g.moved && g.box) showZoneRates(g.box);
      return;
    }

    if (g.type === 'pan') {
      saveCamera();
      if (g.touchTap && !g.moved) actions.clearSelection();
      return;
    }

    if (g.type === 'drag') {
      if (g.moved && dragOverride) {
        const positions = {};
        for (const [id, p] of dragOverride) positions[id] = p;
        dragOverride = null;
        if (dragBlocked) {
          dragBlocked = false;
          toast('That spot is occupied', 'warn');
          sync(store.get()); // snap entities back to their real positions
        } else {
          actions.moveEntitiesTo(positions);
        }
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

  // a touch lifted anywhere (nav bar, sheets, off-screen) must leave touchPts,
  // or the next single finger looks like a second finger and pinch-zooms
  const dropTouch = ev => {
    if (ev.pointerType !== 'touch' || !touchPts.has(ev.pointerId)) return;
    touchPts.delete(ev.pointerId);
    if (gesture?.type === 'pinch' && touchPts.size < 2) {
      gesture = null;
      pinch = null;
      saveCamera();
    }
  };
  window.addEventListener('pointerup', dropTouch, true);
  window.addEventListener('pointercancel', dropTouch, true);

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
    const p = worldPt(ev);
    const x = Math.round(p.x / TILE - def.w / 2);
    const y = Math.round(p.y / TILE - def.h / 2);
    if (!actions.placeEntity(defId, x, y, quality)) toast('That spot is occupied', 'warn');
  });

  // ---------- context menu ----------

  wrap.addEventListener('contextmenu', ev => {
    ev.preventDefault();
    if (placement) {
      canvasApi.cancelPlacement();
      return;
    }
    openMenu(ev.clientX, ev.clientY, ev.target.closest('.entity'), worldPt(ev));
  });

  function openMenu(clientX, clientY, entEl, menuWorldPoint = null) {
    const t = activeTab();
    if (!t) return;

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
      showContextMenu(clientX, clientY, items);
    } else {
      const pasteAt = menuWorldPoint
        ? { x: menuWorldPoint.x / TILE, y: menuWorldPoint.y / TILE }
        : canvasApi.pasteTile();
      showContextMenu(clientX, clientY, [
        {
          label: 'Paste', hint: 'Ctrl+V',
          disabled: !store.get().clipboard?.length,
          action: () => actions.paste(pasteAt),
        },
        { label: 'Select All', hint: 'Ctrl+A', action: () => actions.selectAll() },
        { label: 'Clear Selection', hint: 'Esc', action: () => actions.clearSelection() },
        { separator: true },
        { label: 'Toggle Grid', checked: t.settings.showGrid, action: () => actions.toggleGrid() },
        { label: 'Zoom to Fit', action: () => zoomToFit() },
      ]);
    }
  }

  return wrap;
}
