/* Artify Studio: build a design from a picker of shapes. Loaded after play.js, which provides window.artifyPlay.
   Designs live in the same 240 x 380 box as the generated art, so saved designs can appear when you reform. */
(function () {
  'use strict';

  const play = window.artifyPlay;
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';

  const state = {
    shapes: [],
    items: [],
    selected: null,
    bg: null,
    nextId: 1,
    nextColor: 0,
    undo: [],
    editingId: null,
    drag: null
  };

  const wrap = $('studio-wrap');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('id', 'studio');
  svg.setAttribute('viewBox', '0 0 240 380');
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('role', 'application');
  svg.setAttribute('aria-label', 'Design canvas. Pick a shape from the list to add it. Use the arrow keys to move the selected shape.');
  wrap.appendChild(svg);

  const colors = () => play.palette().colors;
  const names = () => play.palette().names;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const selectedItem = () => state.items.find((it) => it.uid === state.selected);
  const shapeOf = (id) => state.shapes.find((s) => s.id === id);

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  function render() {
    const palette = colors();
    let html = '';
    html += state.bg === null
      ? '<rect class="frame" x="0" y="0" width="240" height="380"/>'
      : `<rect x="0" y="0" width="240" height="380" fill="${palette[state.bg]}"/>`;
    state.items.forEach((it) => {
      const shape = shapeOf(it.shape);
      if (!shape) return;
      const k = it.size / 100;
      html += `<path class="item" data-uid="${it.uid}" d="${shape.d}"${shape.evenodd ? ' fill-rule="evenodd"' : ''} fill="${palette[it.color]}" transform="translate(${it.x} ${it.y}) rotate(${it.rot}) scale(${it.flip ? -k : k} ${k})"/>`;
    });
    const sel = selectedItem();
    if (sel) {
      const h = sel.size / 2;
      html += `<g class="overlay" transform="translate(${sel.x} ${sel.y}) rotate(${sel.rot})">
<rect class="sel-box" x="${-h}" y="${-h}" width="${sel.size}" height="${sel.size}"/>
<line class="sel-box" x1="0" y1="${-h}" x2="0" y2="${-h - 14}"/>
<circle class="hit h-scale" cx="${h}" cy="${h}" r="12"/><circle class="handle" cx="${h}" cy="${h}" r="5"/>
<circle class="hit h-rot" cx="0" cy="${-h - 18}" r="12"/><circle class="handle" cx="0" cy="${-h - 18}" r="5"/>
</g>`;
    }
    svg.innerHTML = html;
    syncControls();
  }

  function syncControls() {
    const sel = selectedItem();
    Array.from($('studio-colors').children).forEach((b, i) => b.setAttribute('aria-pressed', String(sel ? sel.color === i : state.nextColor === i)));
    Array.from($('studio-bg').children).forEach((b, i) => b.setAttribute('aria-pressed', String(state.bg === (i === 0 ? null : i - 1))));
    ['t-forward', 't-back', 't-flip', 't-dup', 't-del'].forEach((id) => { $(id).disabled = !sel; });
    $('t-undo').disabled = state.undo.length === 0;
  }

  function buildSwatches() {
    const palette = colors();
    const mk = (box, list, onPick, withNone) => {
      box.innerHTML = '';
      if (withNone) {
        const none = document.createElement('button');
        none.className = 'swatch none';
        none.textContent = 'None';
        none.setAttribute('aria-label', 'No background');
        none.addEventListener('click', () => onPick(null));
        box.appendChild(none);
      }
      list.forEach((c, i) => {
        const b = document.createElement('button');
        b.className = 'swatch';
        b.style.background = c;
        b.setAttribute('aria-label', names()[i] || 'Color ' + (i + 1));
        b.addEventListener('click', () => onPick(i));
        box.appendChild(b);
      });
    };
    mk($('studio-colors'), palette, (i) => {
      const sel = selectedItem();
      if (sel) { snapshot(); sel.color = i; }
      state.nextColor = i;
      render();
    }, false);
    mk($('studio-bg'), palette, (i) => { snapshot(); state.bg = i; render(); }, true);
    syncControls();
  }

  function buildPicker() {
    const box = $('picker');
    box.innerHTML = '';
    state.shapes.forEach((s) => {
      const b = document.createElement('button');
      b.className = 'shape-btn';
      b.setAttribute('aria-label', 'Add ' + s.name);
      b.title = s.name;
      b.innerHTML = `<svg viewBox="-60 -60 120 120" aria-hidden="true"><path d="${s.d}"${s.evenodd ? ' fill-rule="evenodd"' : ''} fill="currentColor"/></svg>`;
      b.addEventListener('click', () => addItem(s.id));
      box.appendChild(b);
    });
  }

  // ---------------------------------------------------------------------------
  // Editing
  // ---------------------------------------------------------------------------

  function snapshot() {
    state.undo.push(JSON.stringify({ items: state.items, bg: state.bg, selected: state.selected }));
    if (state.undo.length > 50) state.undo.shift();
  }

  function undo() {
    const last = state.undo.pop();
    if (!last) return;
    const prev = JSON.parse(last);
    state.items = prev.items;
    state.bg = prev.bg;
    state.selected = state.items.some((it) => it.uid === prev.selected) ? prev.selected : null;
    render();
  }

  function addItem(shape) {
    snapshot();
    const item = {
      uid: state.nextId++, shape, x: Math.round(120 + (Math.random() - 0.5) * 60), y: Math.round(190 + (Math.random() - 0.5) * 100),
      size: 80, rot: 0, color: state.nextColor, flip: false
    };
    state.items.push(item);
    state.selected = item.uid;
    render();
    play.toast('Added ' + (shapeOf(shape) ? shapeOf(shape).name.toLowerCase() : 'shape') + '.');
  }

  function select(uid) {
    state.selected = uid;
    render();
  }

  function reorder(delta) {
    const i = state.items.findIndex((it) => it.uid === state.selected);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= state.items.length) return;
    snapshot();
    [state.items[i], state.items[j]] = [state.items[j], state.items[i]];
    render();
  }

  function remove() {
    if (!selectedItem()) return;
    snapshot();
    state.items = state.items.filter((it) => it.uid !== state.selected);
    state.selected = null;
    render();
  }

  function duplicate() {
    const sel = selectedItem();
    if (!sel) return;
    snapshot();
    const copy = Object.assign({}, sel, { uid: state.nextId++, x: sel.x + 12, y: sel.y + 12 });
    state.items.push(copy);
    state.selected = copy.uid;
    render();
  }

  function clearAll() {
    if (!state.items.length && state.bg === null) return;
    snapshot();
    state.items = [];
    state.bg = null;
    state.selected = null;
    state.editingId = null;
    $('design-name').value = 'My design';
    render();
  }

  $('t-forward').addEventListener('click', () => reorder(1));
  $('t-back').addEventListener('click', () => reorder(-1));
  $('t-flip').addEventListener('click', () => { const s = selectedItem(); if (s) { snapshot(); s.flip = !s.flip; render(); } });
  $('t-dup').addEventListener('click', duplicate);
  $('t-del').addEventListener('click', remove);
  $('t-undo').addEventListener('click', undo);
  $('t-clear').addEventListener('click', clearAll);

  // ---------------------------------------------------------------------------
  // Pointer and keyboard
  // ---------------------------------------------------------------------------

  function toSvg(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  svg.addEventListener('pointerdown', (e) => {
    const t = e.target;
    const p = toSvg(e);
    const sel = selectedItem();
    if (t.classList.contains('h-scale') && sel) state.drag = { kind: 'scale' };
    else if (t.classList.contains('h-rot') && sel) state.drag = { kind: 'rot' };
    else if (t.dataset && t.dataset.uid) {
      const it = state.items.find((x) => x.uid === Number(t.dataset.uid));
      state.selected = it.uid;
      state.drag = { kind: 'move', dx: p.x - it.x, dy: p.y - it.y };
    } else {
      state.drag = null;
      select(null);
      return;
    }
    snapshot();
    svg.setPointerCapture(e.pointerId);
    svg.focus();
    e.preventDefault();
  });

  svg.addEventListener('pointermove', (e) => {
    const it = selectedItem();
    if (!state.drag || !it) return;
    const p = toSvg(e);
    if (state.drag.kind === 'move') {
      it.x = Math.round(clamp(p.x - state.drag.dx, -40, 280));
      it.y = Math.round(clamp(p.y - state.drag.dy, -40, 420));
    } else if (state.drag.kind === 'scale') {
      it.size = Math.round(clamp(Math.hypot(p.x - it.x, p.y - it.y) * Math.SQRT2, 12, 480));
    } else {
      let deg = (Math.atan2(p.y - it.y, p.x - it.x) * 180) / Math.PI + 90;
      if (e.shiftKey) deg = Math.round(deg / 15) * 15;
      it.rot = Math.round(deg);
    }
    render();
  });

  const release = () => { state.drag = null; };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  document.addEventListener('keydown', (e) => {
    if (play.mode() !== 'studio') return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const onButton = tag === 'BUTTON';
    const it = selectedItem();
    const step = e.shiftKey ? 10 : 2;
    let used = true;
    if (e.key === ',' || e.key === '.') {
      if (!state.items.length) return;
      const i = state.items.findIndex((x) => x.uid === state.selected);
      select(state.items[(i + (e.key === '.' ? 1 : state.items.length - 1) + state.items.length) % state.items.length].uid);
    } else if (!it) {
      used = false;
    } else if (e.key === 'ArrowLeft' && !onButton) { snapshot(); it.x -= step; render(); }
    else if (e.key === 'ArrowRight' && !onButton) { snapshot(); it.x += step; render(); }
    else if (e.key === 'ArrowUp' && !onButton) { snapshot(); it.y -= step; render(); }
    else if (e.key === 'ArrowDown' && !onButton) { snapshot(); it.y += step; render(); }
    else if (e.key === '+' || e.key === '=') { snapshot(); it.size = clamp(Math.round(it.size * 1.1), 12, 480); render(); }
    else if (e.key === '-') { snapshot(); it.size = clamp(Math.round(it.size / 1.1), 12, 480); render(); }
    else if (e.key === '[') { snapshot(); it.rot -= 15; render(); }
    else if (e.key === ']') { snapshot(); it.rot += 15; render(); }
    else if (e.key.toLowerCase() === 'd') duplicate();
    else if (e.key === 'Delete' || e.key === 'Backspace') remove();
    else if (e.key === 'Escape') select(null);
    else used = false;
    if (used) e.preventDefault();
  });

  // ---------------------------------------------------------------------------
  // Saving
  // ---------------------------------------------------------------------------

  function currentCreation() {
    return {
      id: state.editingId || 'c' + Date.now(),
      name: $('design-name').value.trim() || 'My design',
      bg: state.bg,
      items: state.items.map(({ shape, x, y, size, rot, color, flip }) => ({ shape, x, y, size, rot, color, flip }))
    };
  }

  $('save-design').addEventListener('click', () => {
    if (!state.items.length) { play.toast('Add at least one shape first.'); return; }
    const creation = currentCreation();
    state.editingId = creation.id;
    play.post('saveCreation', { creation });
  });
  $('export-design').addEventListener('click', () => {
    if (!state.items.length) { play.toast('Add at least one shape first.'); return; }
    play.post('exportCreation', { creation: currentCreation() });
  });

  function renderCreations(items) {
    const box = $('creations');
    box.innerHTML = '';
    items.forEach((c) => {
      const w = document.createElement('div');
      w.className = 'thumb-wrap';
      const open = document.createElement('button');
      open.className = 'thumb';
      open.setAttribute('aria-label', 'Edit ' + c.name);
      open.innerHTML = c.svg;
      open.addEventListener('click', () => {
        snapshot();
        state.items = c.items.map((it) => Object.assign({ uid: state.nextId++ }, it));
        state.bg = c.bg === undefined ? null : c.bg;
        state.selected = null;
        state.editingId = c.id;
        $('design-name').value = c.name;
        render();
        play.toast('Editing "' + c.name + '".');
      });
      const del = document.createElement('button');
      del.className = 'remove';
      del.textContent = '×';
      del.setAttribute('aria-label', 'Remove ' + c.name);
      del.addEventListener('click', () => {
        if (state.editingId === c.id) state.editingId = null;
        play.post('removeCreation', { id: c.id });
      });
      w.appendChild(open);
      w.appendChild(del);
      box.appendChild(w);
    });
    $('creations-empty').hidden = items.length > 0;
  }

  document.addEventListener('artify:message', (e) => {
    const m = e.detail;
    if (m.type === 'library') { state.shapes = m.shapes; buildPicker(); render(); }
    else if (m.type === 'palette') { buildSwatches(); render(); }
    else if (m.type === 'creations') renderCreations(m.items);
    else if (m.type === 'creationSaved') state.editingId = m.id;
  });

  play.onMode.push((mode) => { if (mode === 'studio') render(); });
})();
