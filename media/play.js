/* Artify Play: client script for the Play page. Runs in a webview with a strict CSP.
   studio.js, loaded after this file, adds the Studio tab and uses window.artifyPlay. */
(function () {
  'use strict';

  const vscode = acquireVsCodeApi();
  const $ = (id) => document.getElementById(id);
  const post = (type, extra) => vscode.postMessage(Object.assign({ type }, extra));
  const rand = (a, b) => a + Math.random() * (b - a);

  const state = {
    mode: 'reform',
    category: 'all',
    made: 0,
    auto: 0,
    moves: 0,
    palette: { colors: ['#E9A93B', '#FFF0B8', '#3F8793', '#E5534B', '#8E2A33', '#62C3E3', '#F79BB0', '#9BDB8A'], names: [] },
    color: 0
  };

  // Shared with studio.js.
  window.artifyPlay = {
    post,
    palette: () => state.palette,
    toast: (text) => { $('toast').textContent = text; },
    onMode: [],
    mode: () => state.mode
  };

  // ---------------------------------------------------------------------------
  // Tabs
  // ---------------------------------------------------------------------------

  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const STAGES = { reform: 'art', puzzle: 'art', splash: 'paint', studio: 'studio-wrap' };

  function stopAuto() {
    if (state.auto) clearInterval(state.auto);
    state.auto = 0;
    $('auto').checked = false;
  }

  function showMode(mode) {
    state.mode = mode;
    tabs.forEach((t) => {
      const on = t.dataset.mode === mode;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('panel-' + t.dataset.mode).hidden = !on;
    });
    ['art', 'paint', 'studio-wrap'].forEach((id) => { $(id).hidden = id !== STAGES[mode]; });
    $('caption').textContent = mode === 'splash' ? 'Your canvas' : mode === 'studio' ? 'Your design' : $('caption').textContent;
    $('toast').textContent = '';
    window.artifyPlay.onMode.forEach((fn) => fn(mode));
  }

  function setMode(mode) {
    showMode(mode);
    stopAuto();
    if (mode === 'splash') setupCanvas();
    else if (mode === 'puzzle') post('puzzle', { category: state.category });
    else if (mode === 'reform') post('reform', { category: state.category });
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setMode(t.dataset.mode));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      setMode(next.dataset.mode);
    });
  });

  // ---------------------------------------------------------------------------
  // Reform
  // ---------------------------------------------------------------------------

  document.querySelectorAll('.pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      state.category = pill.dataset.category;
      document.querySelectorAll('.pill').forEach((p) => p.setAttribute('aria-pressed', String(p === pill)));
      post('reform', { category: state.category });
    });
  });
  $('reform').addEventListener('click', () => post('reform', { category: state.category }));
  $('keep').addEventListener('click', () => post('keep'));
  $('keep-puzzle').addEventListener('click', () => post('keep'));
  $('export-svg').addEventListener('click', () => post('exportSvg'));
  $('auto').addEventListener('change', (e) => {
    if (state.auto) clearInterval(state.auto);
    state.auto = e.target.checked ? setInterval(() => post('reform', { category: state.category }), 5000) : 0;
  });
  $('clear-collection').addEventListener('click', () => post('clearCollection'));
  $('new-round').addEventListener('click', () => post('newRound'));

  // A strip of thumbnails, each with an open button and a remove button.
  function renderStrip(box, emptyEl, items, build) {
    box.innerHTML = '';
    items.forEach((item, index) => {
      const wrap = document.createElement('div');
      wrap.className = 'thumb-wrap';
      const open = document.createElement('button');
      open.className = 'thumb';
      open.setAttribute('aria-label', 'Open ' + item.label);
      open.innerHTML = item.html;
      open.addEventListener('click', () => item.open(index));
      const remove = document.createElement('button');
      remove.className = 'remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remove ' + item.label);
      remove.addEventListener('click', () => item.remove(index));
      wrap.appendChild(open);
      wrap.appendChild(remove);
      box.appendChild(wrap);
    });
    if (emptyEl) emptyEl.hidden = items.length > 0;
    if (build) build(items.length);
  }

  function renderCollection(items) {
    renderStrip(
      $('collection'),
      $('collection-empty'),
      items.map((it) => ({
        label: it.name + ', design ' + it.seed,
        html: it.svg,
        open: (index) => {
          if (state.mode !== 'reform') showMode('reform');
          post('openCollection', { index });
        },
        remove: (index) => post('removeCollection', { index })
      })),
      (n) => { $('clear-collection').hidden = n === 0; }
    );
  }

  function renderPaintings(items) {
    renderStrip(
      $('paintings'),
      $('paintings-empty'),
      items.map((it) => ({
        label: 'painting',
        html: '<img alt="" src="' + it.dataUrl + '">',
        open: () => {
          if (state.mode !== 'splash') { showMode('splash'); setupCanvas(); }
          post('loadPainting', { id: it.id });
        },
        remove: () => post('removePainting', { id: it.id })
      }))
    );
  }

  // ---------------------------------------------------------------------------
  // Puzzle
  // ---------------------------------------------------------------------------

  const puzzle = { svg: null, pieces: [], drag: null };
  const SNAP = 12;

  function toSvg(e) {
    const pt = puzzle.svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(puzzle.svg.getScreenCTM().inverse());
  }

  function place(g, x, y) {
    g.__x = x;
    g.__y = y;
    g.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  }

  function updateProgress() {
    const total = puzzle.pieces.length;
    const done = puzzle.pieces.filter((g) => g.classList.contains('done')).length;
    $('progress').textContent = done === total
      ? 'Reformed in ' + state.moves + ' moves. Press New puzzle to go again.'
      : done + ' of ' + total + ' pieces placed';
    if (done === total && total > 0) puzzle.svg.classList.add('win');
  }

  function restack() {
    puzzle.pieces.slice().sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i)).forEach((g) => puzzle.svg.appendChild(g));
    puzzle.svg.querySelectorAll('.f').forEach((n) => puzzle.svg.appendChild(n));
  }

  function startPuzzle() {
    const svg = $('art').querySelector('svg');
    if (!svg) return;
    puzzle.svg = svg;
    state.moves = 0;
    svg.classList.add('puzzle');
    svg.querySelectorAll('.s.d').forEach((d) => { d.style.display = 'none'; });
    puzzle.pieces = Array.from(svg.querySelectorAll('.s.p'));

    // A faint copy of the solved picture so there is something to aim for.
    const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ghost.setAttribute('class', 'ghost');
    ghost.setAttribute('aria-hidden', 'true');
    puzzle.pieces.forEach((g) => {
      const copy = g.cloneNode(true);
      ['class', 'style', 'data-i'].forEach((a) => copy.removeAttribute(a));
      ghost.appendChild(copy);
    });
    const defs = svg.querySelector('defs');
    svg.insertBefore(ghost, defs ? defs.nextSibling : svg.firstChild);
    svg.classList.toggle('ghost-off', !$('guide').checked);

    puzzle.pieces.forEach((g) => {
      const b = g.getBBox();
      const lo = { x: Math.max(-120, 4 - b.x), y: Math.max(-120, 4 - b.y) };
      const hi = { x: Math.min(120, 236 - (b.x + b.width)), y: Math.min(120, 376 - (b.y + b.height)) };
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 10 && Math.hypot(x, y) < 30; tries++) {
        x = Math.round(rand(Math.min(lo.x, hi.x), Math.max(lo.x, hi.x)));
        y = Math.round(rand(Math.min(lo.y, hi.y), Math.max(lo.y, hi.y)));
      }
      g.classList.remove('done');
      place(g, x, y);
    });
    updateProgress();

    svg.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.s.p');
      if (!g || g.classList.contains('done')) return;
      const p = toSvg(e);
      puzzle.drag = { g, dx: p.x - g.__x, dy: p.y - g.__y };
      svg.appendChild(g);
      svg.setPointerCapture(e.pointerId);
      svg.classList.add('dragging');
      e.preventDefault();
    });
    svg.addEventListener('pointermove', (e) => {
      if (!puzzle.drag) return;
      const p = toSvg(e);
      place(puzzle.drag.g, Math.round((p.x - puzzle.drag.dx) * 10) / 10, Math.round((p.y - puzzle.drag.dy) * 10) / 10);
    });
    const release = () => {
      if (!puzzle.drag) return;
      const g = puzzle.drag.g;
      puzzle.drag = null;
      svg.classList.remove('dragging');
      state.moves++;
      if (Math.hypot(g.__x, g.__y) < SNAP) {
        place(g, 0, 0);
        g.classList.add('done');
      }
      restack();
      updateProgress();
    };
    svg.addEventListener('pointerup', release);
    svg.addEventListener('pointercancel', release);
  }

  $('guide').addEventListener('change', (e) => {
    if (puzzle.svg) puzzle.svg.classList.toggle('ghost-off', !e.target.checked);
  });
  $('newpuzzle').addEventListener('click', () => post('puzzle', { category: state.category }));
  $('solve').addEventListener('click', () => {
    puzzle.pieces.forEach((g) => {
      place(g, 0, 0);
      g.classList.add('done');
    });
    restack();
    updateProgress();
  });

  // ---------------------------------------------------------------------------
  // Splash
  // ---------------------------------------------------------------------------

  const cv = $('paint');
  const g2 = cv.getContext('2d');
  const paint = { down: false, last: null, pool: 0, timer: 0, drips: [], raf: 0, ready: false };

  function background() {
    return getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-background').trim() || '#1b1016';
  }

  function clearCanvas() {
    g2.globalCompositeOperation = 'source-over';
    g2.fillStyle = background();
    g2.fillRect(0, 0, cv.width, cv.height);
    paint.drips = [];
  }

  function setupCanvas() {
    if (paint.ready) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.min(760, Math.max(320, Math.floor(cv.parentElement.clientWidth || 600)));
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(520 * dpr);
    g2.setTransform(1, 0, 0, 1, 0, 0);
    g2.scale(dpr, dpr);
    cv.style.width = w + 'px';
    paint.ready = true;
    clearCanvas();
  }

  function renderSwatches() {
    const box = $('swatches');
    box.innerHTML = '';
    state.palette.colors.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'swatch';
      b.style.background = c;
      b.setAttribute('aria-pressed', String(i === state.color));
      b.setAttribute('aria-label', (state.palette.names[i] || 'Color ' + (i + 1)) + ', key ' + (i + 1));
      b.addEventListener('click', () => pickColor(i));
      box.appendChild(b);
    });
  }

  function pickColor(i) {
    if (i < 0 || i >= state.palette.colors.length) return;
    state.color = i;
    Array.from($('swatches').children).forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  }

  function blob(x, y, r, color) {
    g2.fillStyle = color;
    g2.beginPath();
    const n = 16;
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI * 2;
      const rr = r * rand(0.82, 1.12);
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (k === 0) g2.moveTo(px, py);
      else g2.lineTo(px, py);
    }
    g2.closePath();
    g2.fill();
  }

  function splat(x, y, r, color) {
    blob(x, y, r, color);
    const sat = Math.floor(rand(2, 6));
    for (let k = 0; k < sat; k++) {
      const a = rand(0, Math.PI * 2);
      const d = r * rand(1.2, 2.4);
      g2.fillStyle = color;
      g2.beginPath();
      g2.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * rand(0.08, 0.22), 0, Math.PI * 2);
      g2.fill();
    }
    if (Math.random() < 0.12) paint.drips.push({ x: x + rand(-r * 0.4, r * 0.4), y: y + r * 0.6, len: 0, max: rand(20, 80), w: Math.max(2, r * 0.14), color });
  }

  function loop() {
    paint.raf = 0;
    paint.drips = paint.drips.filter((d) => d.len < d.max);
    paint.drips.forEach((d) => {
      d.len += 1.1;
      g2.fillStyle = d.color;
      g2.beginPath();
      g2.arc(d.x, d.y + d.len, d.w, 0, Math.PI * 2);
      g2.fill();
    });
    if (paint.drips.length) paint.raf = requestAnimationFrame(loop);
  }

  function kick() {
    if (!paint.raf) paint.raf = requestAnimationFrame(loop);
  }

  function pt(e) {
    const rect = cv.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  cv.addEventListener('pointerdown', (e) => {
    paint.down = true;
    paint.last = pt(e);
    paint.pool = 0;
    cv.setPointerCapture(e.pointerId);
    const size = Number($('size').value);
    splat(paint.last.x, paint.last.y, size * 0.7, state.palette.colors[state.color]);
    kick();
    // Holding still pours a growing puddle.
    paint.timer = setInterval(() => {
      if (!paint.down) return;
      paint.pool += 1.4;
      splat(paint.last.x, paint.last.y, size * 0.5 + paint.pool, state.palette.colors[state.color]);
      kick();
    }, 90);
  });
  cv.addEventListener('pointermove', (e) => {
    if (!paint.down) return;
    const p = pt(e);
    const size = Number($('size').value);
    const dist = Math.hypot(p.x - paint.last.x, p.y - paint.last.y);
    if (dist < 2) return;
    paint.pool = 0;
    const steps = Math.max(1, Math.floor(dist / (size * 0.5)));
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      splat(paint.last.x + (p.x - paint.last.x) * t, paint.last.y + (p.y - paint.last.y) * t, size * rand(0.35, 0.7), state.palette.colors[state.color]);
    }
    paint.last = p;
    kick();
  });
  const lift = () => {
    paint.down = false;
    clearInterval(paint.timer);
  };
  cv.addEventListener('pointerup', lift);
  cv.addEventListener('pointercancel', lift);
  $('clear').addEventListener('click', clearCanvas);

  // Saved paintings are stored small; the full-size canvas can be exported as PNG.
  $('save-painting').addEventListener('click', () => {
    const small = document.createElement('canvas');
    small.width = 380;
    small.height = Math.round((380 * cv.height) / cv.width);
    small.getContext('2d').drawImage(cv, 0, 0, small.width, small.height);
    post('savePainting', { dataUrl: small.toDataURL('image/jpeg', 0.85) });
  });
  $('export-png').addEventListener('click', () => post('exportPng', { dataUrl: cv.toDataURL('image/png') }));

  function loadPainting(dataUrl) {
    const img = new Image();
    img.onload = () => {
      clearCanvas();
      g2.drawImage(img, 0, 0, cv.width / (window.devicePixelRatio || 1), cv.height / (window.devicePixelRatio || 1));
    };
    img.src = dataUrl;
  }

  // ---------------------------------------------------------------------------
  // Messages and keys
  // ---------------------------------------------------------------------------

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (m.type === 'art') {
      $('art').innerHTML = m.svg;
      $('caption').textContent = m.name + (m.seed ? ' number ' + m.seed : '');
      if (m.mode === 'puzzle') {
        startPuzzle();
      } else {
        state.made++;
        $('made').textContent = 'Reformed ' + state.made + (state.made === 1 ? ' shape' : ' shapes') + ' so far.';
      }
    } else if (m.type === 'collection') {
      renderCollection(m.items);
    } else if (m.type === 'paintings') {
      renderPaintings(m.items);
    } else if (m.type === 'paintingData') {
      loadPainting(m.dataUrl);
    } else if (m.type === 'palette') {
      state.palette = { colors: m.colors, names: m.names };
      renderSwatches();
    } else if (m.type === 'toast') {
      $('toast').textContent = m.text;
    }
    document.dispatchEvent(new CustomEvent('artify:message', { detail: m }));
  });

  document.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
    const onButton = tag === 'BUTTON';
    if (state.mode === 'reform' && (e.key === 'r' || (e.key === ' ' && !onButton))) {
      e.preventDefault();
      post('reform', { category: state.category });
    } else if (state.mode === 'puzzle' && e.key === 'n') {
      post('puzzle', { category: state.category });
    } else if (state.mode === 'splash') {
      if (e.key === 'c') clearCanvas();
      else if (/^[1-8]$/.test(e.key)) pickColor(Number(e.key) - 1);
    }
  });

  renderSwatches();
  post('ready');
})();
