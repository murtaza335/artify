'use strict';

// Furniture and everyday objects: chairs, tables, lamps, a room, clocks, teapots, shelves, plants and more.

const { TAU, fmt, pol, slice, rectPts, rotRect, curvePoly } = require('./engine');

const R = (x, y, w, h) => rectPts(x, y, w, h);

// ---------------------------------------------------------------------------
// Building blocks. Each draws one object with its bottom centre at (x, y), scaled by s.
// ---------------------------------------------------------------------------

// `f` is 1 when the chair faces right and -1 when it faces left. `variant` picks the design.
function drawChair(ctx, x, y, s, variant, f = 1) {
  const main = ctx.col(4);
  const wood = ctx.col(0);
  const cushion = ctx.col(3);
  const X = (dx) => x + f * dx * s;
  const poly = (pts, color) => ctx.poly(pts.map(([dx, dy]) => [X(dx), y + dy * s]), color, { inset: 1, still: true });

  if (variant === 'armchair') {
    for (const side of [-1, 1]) {
      ctx.poly(R(x - 30 * s + (side === 1 ? 60 * s : 0) - 4 * s, y - 28 * s, 8 * s, 28 * s), main, { inset: 1, still: true });
    }
    ctx.poly(R(x - 40 * s, y - 175 * s, 80 * s, 84 * s), ctx.col(5), { inset: 1, still: true });
    ctx.shape(`M${fmt(x - 40 * s)} ${fmt(y - 175 * s)} A${fmt(40 * s)} ${fmt(30 * s)} 0 0 1 ${fmt(x + 40 * s)} ${fmt(y - 175 * s)} Z`, ctx.col(5), x, y - 190 * s, [x - 40 * s, y - 205 * s, x + 40 * s, y - 175 * s]);
    ctx.poly(R(x - 50 * s, y - 96 * s, 100 * s, 66 * s), main, { inset: 1, still: true });
    ctx.poly(R(x - 42 * s, y - 100 * s, 84 * s, 26 * s), cushion, { inset: 1, still: true });
    for (const side of [-1, 1]) {
      ctx.poly(R(x + side * 62 * s - 10 * s, y - 126 * s, 20 * s, 96 * s), ctx.col(5), { inset: 1, still: true });
      ctx.circ(x + side * 62 * s, y - 126 * s, 10 * s, ctx.col(5));
    }
    return;
  }
  if (variant === 'stool') {
    poly([[-46, -108], [46, -108], [40, -96], [-40, -96]], main);
    ctx.ellipse(x, y - 108 * s, 46 * s, 10 * s, wood);
    poly([[-34, -96], [-26, -96], [-46, 0], [-56, 0]], main);
    poly([[26, -96], [34, -96], [56, 0], [46, 0]], main);
    poly([[-4, -96], [4, -96], [3, -8], [-3, -8]], ctx.col(3));
    ctx.line(x - 42 * s, y - 46 * s, x + 42 * s, y - 46 * s, wood, 6 * s);
    return;
  }
  // Dining chair, with optional rockers.
  const rocker = variant === 'rocker';
  const foot = rocker ? -8 : 0;
  poly([[-45, -110], [-31, -110], [-38, -215], [-52, -215]], main);
  poly([[-58, -222], [-30, -222], [-30, -208], [-58, -208]], wood);
  poly([[-47, -96], [-35, -96], [-37, foot], [-49, foot]], main);
  poly([[23, -96], [35, -96], [37, foot], [25, foot]], main);
  poly([[33, -96], [45, -96], [47, foot], [35, foot]], main);
  poly([[-46, -110], [48, -110], [48, -96], [-46, -96]], wood);
  poly([[-40, -118], [42, -118], [42, -110], [-40, -110]], cushion);
  if (rocker) {
    ctx.stroke(`M${fmt(X(-62))} ${fmt(y - 8 * s)} Q${fmt(X(0))} ${fmt(y + 24 * s)} ${fmt(X(62))} ${fmt(y - 8 * s)}`, wood, 7 * s, X(0), y, [Math.min(X(-62), X(62)), y - 8 * s, Math.max(X(-62), X(62)), y + 12 * s]);
  }
}

function drawTeapot(ctx, x, y, s, color) {
  const accent = ctx.col(0);
  ctx.circ(x, y - 18 * s, 18 * s, color);
  ctx.circ(x, y - 38 * s, 5 * s, accent);
  ctx.poly([[x + 15 * s, y - 24 * s], [x + 36 * s, y - 38 * s], [x + 18 * s, y - 12 * s]], color, { inset: 1, still: true });
  ctx.stroke(`M${fmt(x - 15 * s)} ${fmt(y - 28 * s)} C${fmt(x - 38 * s)} ${fmt(y - 32 * s)} ${fmt(x - 38 * s)} ${fmt(y - 6 * s)} ${fmt(x - 15 * s)} ${fmt(y - 10 * s)}`, accent, 4 * s, x - 28 * s, y - 20 * s, [x - 38 * s, y - 32 * s, x - 15 * s, y - 6 * s]);
  ctx.poly(R(x - 12 * s, y - 3 * s, 24 * s, 3 * s), accent, { inset: 1, still: true });
}

function drawCup(ctx, x, y, s, color) {
  ctx.poly([[x - 9 * s, y - 14 * s], [x + 9 * s, y - 14 * s], [x + 6 * s, y], [x - 6 * s, y]], color, { inset: 1, still: true });
  ctx.raw(`<circle cx="${fmt(x + 11 * s)}" cy="${fmt(y - 8 * s)}" r="${fmt(4 * s)}" fill="none" stroke="${color}" stroke-width="${fmt(2 * s)}"/>`, x + 8 * s, y - 8 * s, [x - 9 * s, y - 14 * s, x + 16 * s, y]);
}

function drawVaseOfFlowers(ctx, x, y, s) {
  ctx.poly([[x - 7 * s, y - 26 * s], [x + 7 * s, y - 26 * s], [x + 11 * s, y], [x - 11 * s, y]], ctx.col(2), { inset: 1, still: true });
  for (let i = -1; i <= 1; i++) {
    ctx.line(x + i * 3 * s, y - 26 * s, x + i * 12 * s, y - 52 * s, ctx.green(i + 1), 2 * s);
    ctx.circ(x + i * 12 * s, y - 55 * s, 6 * s, ctx.col(i * 2 + 3));
  }
}

function drawFruitBowl(ctx, x, y, s) {
  ctx.shape(`M${fmt(x - 24 * s)} ${fmt(y - 14 * s)} A${fmt(24 * s)} ${fmt(14 * s)} 0 0 0 ${fmt(x + 24 * s)} ${fmt(y - 14 * s)} Z`, ctx.col(4), x, y - 8 * s, [x - 24 * s, y - 14 * s, x + 24 * s, y]);
  [[-11, 3], [0, 0], [11, 3]].forEach(([dx, c], i) => ctx.circ(x + dx * s, y - 21 * s, 8 * s, ctx.col(c + i * 2)));
}

function drawCandle(ctx, x, y, s) {
  ctx.poly(R(x - 3 * s, y - 30 * s, 6 * s, 30 * s), ctx.colors[1], { inset: 1, still: true });
  ctx.poly([[x - 3 * s, y - 30 * s], [x + 3 * s, y - 30 * s], [x, y - 44 * s]], ctx.colors[0], { inset: 1, still: true });
}

// A table; returns the y of its top so objects can stand on it.
function drawTable(ctx, x, y, s, round) {
  const main = ctx.col(0);
  const dark = ctx.col(4);
  const top = y - 110 * s;
  if (round) {
    ctx.ellipse(x, y - 8 * s, 46 * s, 8 * s, dark);
    ctx.poly([[x - 8 * s, y - 98 * s], [x + 8 * s, y - 98 * s], [x + 12 * s, y - 12 * s], [x - 12 * s, y - 12 * s]], dark, { inset: 1, still: true });
    ctx.poly([[x - 90 * s, top], [x + 90 * s, top], [x + 86 * s, y - 98 * s], [x - 86 * s, y - 98 * s]], main, { inset: 1, still: true });
    ctx.ellipse(x, top, 90 * s, 12 * s, ctx.col(1));
    return top - 4 * s;
  }
  ctx.poly(R(x - 62 * s, y - 78 * s, 8 * s, 74 * s), dark, { inset: 1, still: true });
  ctx.poly(R(x + 54 * s, y - 78 * s, 8 * s, 74 * s), dark, { inset: 1, still: true });
  ctx.poly(R(x - 88 * s, y - 78 * s, 12 * s, 78 * s), main, { inset: 1, still: true });
  ctx.poly(R(x + 76 * s, y - 78 * s, 12 * s, 78 * s), main, { inset: 1, still: true });
  ctx.poly(R(x - 92 * s, y - 98 * s, 184 * s, 20 * s), dark, { inset: 1, still: true });
  ctx.poly(R(x - 100 * s, top, 200 * s, 14 * s), main, { inset: 1, still: true });
  return top;
}

function placeItems(ctx, x, top, s, count) {
  const spots = [-70, -35, 0, 35, 70].sort(() => ctx.rand() - 0.5).slice(0, count).sort((a, b) => a - b);
  spots.forEach((dx, i) => {
    const px = x + dx * s;
    const kind = ctx.int(0, 4);
    if (kind === 0) drawTeapot(ctx, px, top, s * 0.9, ctx.col(i * 2 + 3));
    else if (kind === 1) drawCup(ctx, px, top, s * 1.2, ctx.col(i + 2));
    else if (kind === 2) drawVaseOfFlowers(ctx, px, top, s);
    else if (kind === 3) drawFruitBowl(ctx, px, top, s);
    else drawCandle(ctx, px, top, s);
  });
}

function drawLamp(ctx, x, y, s) {
  const c = ctx.col(3);
  ctx.raw(`<polygon points="${fmt(x - 38 * s)},${fmt(y - 126 * s)} ${fmt(x + 38 * s)},${fmt(y - 126 * s)} ${fmt(x + 96 * s)},${fmt(y - 2 * s)} ${fmt(x - 96 * s)},${fmt(y - 2 * s)}" fill="${ctx.colors[0]}" opacity=".18"/>`, x, y - 60 * s, [x - 96 * s, y - 126 * s, x + 96 * s, y]);
  ctx.ellipse(x, y - 4 * s, 22 * s, 5 * s, ctx.col(4));
  ctx.poly(R(x - 2.5 * s, y - 130 * s, 5 * s, 126 * s), ctx.col(4), { inset: 1, still: true });
  ctx.poly([[x - 26 * s, y - 172 * s], [x + 26 * s, y - 172 * s], [x + 40 * s, y - 128 * s], [x - 40 * s, y - 128 * s]], c, { inset: 1, still: true });
  ctx.circ(x, y - 124 * s, 7 * s, ctx.colors[1]);
}

function drawPlant(ctx, x, y, s, leaves = ctx.int(5, 8)) {
  ctx.poly([[x - 24 * s, y - 40 * s], [x + 24 * s, y - 40 * s], [x + 18 * s, y], [x - 18 * s, y]], ctx.col(3), { inset: 1, still: true });
  ctx.poly(R(x - 28 * s, y - 50 * s, 56 * s, 10 * s), ctx.col(0), { inset: 1, still: true });
  for (let i = 0; i < leaves; i++) {
    const t = leaves === 1 ? 0.5 : i / (leaves - 1);
    const a = -Math.PI * 0.9 + t * Math.PI * 0.8;
    const len = ctx.between(50, 90) * s;
    const base = [x, y - 50 * s];
    ctx.poly([base, pol(base[0], base[1], len * 0.5, a - 0.28), pol(base[0], base[1], len, a), pol(base[0], base[1], len * 0.5, a + 0.28)], ctx.green(i), { inset: 1, loose: ctx.rand() < 0.15 });
  }
}

function drawClockFace(ctx, x, y, r) {
  ctx.circ(x, y, r, ctx.col(4));
  ctx.circ(x, y, r * 0.9, ctx.colors[1]);
  for (let i = 0; i < 12; i++) {
    const a = (i * TAU) / 12;
    const p = pol(x, y, r * 0.78, a);
    const q = pol(x, y, r * (i % 3 === 0 ? 0.62 : 0.7), a);
    ctx.line(p[0], p[1], q[0], q[1], ctx.ink, i % 3 === 0 ? 4 : 2);
  }
  const h = ctx.between(0, TAU);
  const m = ctx.between(0, TAU);
  const hp = pol(x, y, r * 0.45, h);
  const mp = pol(x, y, r * 0.68, m);
  ctx.line(x, y, hp[0], hp[1], ctx.ink, 6);
  ctx.line(x, y, mp[0], mp[1], ctx.col(3), 4);
  ctx.circ(x, y, 5, ctx.col(3));
}

function drawBooks(ctx, x, y, w) {
  let cx = x;
  while (cx < x + w - 8) {
    const bw = ctx.between(9, 15);
    const bh = ctx.between(38, 64);
    if (cx + bw > x + w) break;
    if (ctx.rand() < 0.12) {
      ctx.poly(rotRect(cx + bh * 0.4, y - bw / 2, bh, bw, 0), ctx.col(cx), { inset: 1, still: true });
      cx += bh * 0.8 + 2;
      continue;
    }
    ctx.poly(R(cx, y - bh, bw, bh), ctx.col(cx * 0.37), { inset: 1, still: true });
    ctx.poly(R(cx + 2, y - bh + 6, bw - 4, 3), ctx.colors[1], { inset: 1, still: true });
    cx += bw + 1.5;
  }
}

function drawFrame(ctx, x, y, w, h) {
  const gold = ctx.col(0);
  ctx.poly(R(x, y, w, h), gold, { inset: 1, still: true });
  ctx.poly(R(x + 5, y + 5, w - 10, h - 10), ctx.colors[1], { inset: 1, still: true });
  ctx.circ(x + w * 0.4, y + h * 0.42, Math.min(w, h) * 0.22, ctx.col(3));
  ctx.poly([[x + w * 0.5, y + h * 0.8], [x + w * 0.88, y + h * 0.8], [x + w * 0.7, y + h * 0.4]], ctx.col(2), { inset: 1, still: true });
}

function drawUmbrella(ctx, x, y, s) {
  const cy = y - 150 * s;
  const r = 78 * s;
  const gores = 6;
  for (let i = 0; i < gores; i++) {
    const a0 = Math.PI + (i * Math.PI) / gores;
    const a1 = Math.PI + ((i + 1) * Math.PI) / gores;
    ctx.poly([[x, cy], pol(x, cy, r, a0), pol(x, cy, r * 0.96, (a0 + a1) / 2), pol(x, cy, r, a1)], ctx.col(i % 2 ? 3 : 0), { inset: 0.99, still: true });
  }
  ctx.stroke(`M${fmt(x)} ${fmt(cy)} L${fmt(x)} ${fmt(y - 24 * s)} a${fmt(11 * s)} ${fmt(11 * s)} 0 0 1 ${fmt(-22 * s)} 0`, ctx.col(4), 5 * s, x, y - 70 * s, [x - 22 * s, cy, x, y - 13 * s]);
  ctx.poly([[x - 3 * s, cy - r * 0.02], [x + 3 * s, cy - r * 0.02], [x, cy - 16 * s]], ctx.col(4), { inset: 1, still: true });
}

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

function chair(ctx) {
  const variant = ctx.pick(['dining', 'armchair', 'stool', 'rocker']);
  const s = variant === 'armchair' ? ctx.between(0.95, 1.2) : ctx.between(1.0, 1.25);
  drawChair(ctx, 120, 342, s, variant, ctx.rand() < 0.5 ? 1 : -1);
  ctx.poly(R(30, 342, 180, 6), ctx.col(4), { inset: 1, still: true });
  return variant === 'dining' ? 'dining chair' : variant;
}

function table(ctx) {
  const s = ctx.between(0.85, 1.05);
  const round = ctx.rand() < 0.4;
  const top = drawTable(ctx, 120, 342, s, round);
  placeItems(ctx, 120, top, s * 1.2, ctx.int(2, 4));
  if (ctx.rand() < 0.6) {
    // A pendant lamp over the table.
    ctx.line(120, 50, 120, 96, ctx.col(4), 3);
    ctx.poly([[100, 120], [140, 120], [128, 96], [112, 96]], ctx.col(3), { inset: 1, still: true });
    ctx.circ(120, 124, 5, ctx.colors[0]);
  }
  return round ? 'round table' : 'table';
}

function room(ctx) {
  ctx.poly(R(14, 50, 212, 252), ctx.col(2), { inset: 1, still: true });
  for (let i = 0; i < 6; i++) ctx.poly(R(14 + i * 36, 50, 14, 252), ctx.col(5), { inset: 1, still: true });
  ctx.poly(R(14, 300, 212, 46), ctx.col(4), { inset: 1, still: true });
  ctx.ellipse(120, 328, 84, 10, ctx.col(3));
  // Window with curtains.
  const wx = ctx.between(26, 40);
  ctx.poly(R(wx, 76, 74, 84), ctx.col(0), { inset: 1, still: true });
  ctx.poly(R(wx + 5, 81, 64, 74), '#62C3E3', { inset: 1, still: true });
  ctx.poly(R(wx + 34, 81, 5, 74), ctx.col(0), { inset: 1, still: true });
  ctx.poly(R(wx + 5, 114, 64, 5), ctx.col(0), { inset: 1, still: true });
  ctx.circ(wx + 22, 100, 8, ctx.colors[0]);
  ctx.poly([[wx - 6, 72], [wx + 14, 72], [wx + 4, 164], [wx - 6, 164]], ctx.col(3), { inset: 1, still: true });
  ctx.poly([[wx + 60, 72], [wx + 80, 72], [wx + 80, 164], [wx + 70, 164]], ctx.col(3), { inset: 1, still: true });
  drawFrame(ctx, 148, 76, 56, 70);
  // Table, chair and a pendant lamp.
  const top = drawTable(ctx, 100, 334, 0.55, false);
  placeItems(ctx, 100, top, 0.7, 2);
  drawChair(ctx, 188, 336, 0.5, 'dining', -1);
  ctx.line(100, 50, 100, 188, ctx.col(4), 2);
  ctx.poly([[82, 206], [118, 206], [108, 186], [92, 186]], ctx.col(3), { inset: 1, still: true });
  drawPlant(ctx, 34, 340, 0.55, 5);
  return 'cozy room';
}

function corner(ctx) {
  ctx.poly(R(14, 300, 212, 46), ctx.col(4), { inset: 1, still: true });
  ctx.ellipse(110, 334, 96, 9, ctx.col(5));
  drawChair(ctx, 90, 336, ctx.between(0.95, 1.1), 'armchair');
  drawLamp(ctx, 190, 340, ctx.between(1.05, 1.25));
  drawPlant(ctx, 32, 340, 0.75);
  drawFrame(ctx, 70, 70, 60, 74);
  return 'reading corner';
}

function clock(ctx) {
  const r = ctx.between(66, 80);
  if (ctx.rand() < 0.5) {
    // Alarm clock with bells and feet.
    for (const s of [-1, 1]) {
      ctx.shape(`M${fmt(120 + s * r * 0.9 - 24)} ${fmt(190 - r * 0.78)} A24 24 0 0 1 ${fmt(120 + s * r * 0.9 + 24)} ${fmt(190 - r * 0.78)} Z`, ctx.col(3), 120 + s * r * 0.9, 190 - r, [120 + s * r * 0.9 - 24, 190 - r * 0.78 - 24, 120 + s * r * 0.9 + 24, 190 - r * 0.78]);
      ctx.line(120 + s * r * 0.5, 190 + r * 0.9, 120 + s * r * 0.7, 190 + r + 28, ctx.col(4), 7);
    }
    ctx.line(120, 190 - r, 120, 190 - r - 16, ctx.col(4), 6);
    drawClockFace(ctx, 120, 190, r);
    return 'alarm clock';
  }
  // Pendulum clock.
  ctx.poly([[120 - r * 0.9, 60], [120 + r * 0.9, 60], [120 + r * 0.9, 330], [120 - r * 0.9, 330]], ctx.col(0), { inset: 1, still: true });
  ctx.shape(`M${fmt(120 - r * 0.9)} 60 L${fmt(120)} 36 L${fmt(120 + r * 0.9)} 60 Z`, ctx.col(4), 120, 52, [120 - r * 0.9, 36, 120 + r * 0.9, 60]);
  drawClockFace(ctx, 120, 130, r * 0.72);
  ctx.poly(R(120 - r * 0.7, 220, r * 1.4, 100), ctx.col(4), { inset: 1, still: true });
  const bob = ctx.between(-24, 24);
  ctx.line(120, 220, 120 + bob, 300, ctx.colors[1], 3);
  ctx.circ(120 + bob, 304, 12, ctx.col(0));
  return 'pendulum clock';
}

function teapot(ctx) {
  ctx.poly(R(20, 322, 200, 12), ctx.col(4), { inset: 1, still: true });
  drawTeapot(ctx, ctx.between(100, 120), 322, ctx.between(3.2, 3.8), ctx.col(3));
  drawCup(ctx, 34, 322, 2.2, ctx.col(2));
  drawCup(ctx, 206, 322, 2.2, ctx.col(5));
  for (let i = 0; i < 3; i++) {
    const x = 160 + i * 8;
    ctx.stroke(`M${fmt(x)} 170 q-10 -14 0 -26 q10 -12 0 -26`, ctx.colors[1], 4, x, 150, [x - 12, 118, x + 12, 170]);
  }
  return 'teapot';
}

function shelf(ctx) {
  ctx.poly(R(26, 56, 188, 292), ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(34, 64, 172, 276), ctx.col(2), { inset: 1, still: true });
  const rows = [136, 206, 276, 340];
  rows.forEach((bottom, i) => {
    ctx.poly(R(26, bottom - 4, 188, 10), ctx.col(4), { inset: 1, still: true });
    const kind = ctx.int(0, 3);
    if (kind === 0 && i > 0) drawBooks(ctx, 40, bottom - 4, 160);
    else if (kind === 1) {
      drawBooks(ctx, 40, bottom - 4, 80);
      drawPlant(ctx, 164, bottom - 4, 0.45, 5);
    } else if (kind === 2) {
      drawClockFace(ctx, 120, bottom - 36, 24);
      drawBooks(ctx, 40, bottom - 4, 50);
    } else {
      drawBooks(ctx, 40, bottom - 4, 110);
      drawCup(ctx, 170, bottom - 4, 1.6, ctx.col(3));
    }
  });
  drawPlant(ctx, 190, 56, 0.4, 5);
  return 'bookshelf';
}

function plant(ctx) {
  ctx.poly(R(30, 342, 180, 6), ctx.col(4), { inset: 1, still: true });
  if (ctx.rand() < 0.4) {
    // A cactus with arms and spines.
    const color = ctx.green(0);
    ctx.poly(R(120 - 30, 120, 60, 200), color, { inset: 1, still: true });
    ctx.shape(`M${fmt(90)} 120 A30 30 0 0 1 ${fmt(150)} 120 Z`, color, 120, 106, [90, 90, 150, 120]);
    for (const s of [-1, 1]) {
      ctx.poly(R(120 + s * 44 - 11, 190, 22, 60), ctx.green(1), { inset: 1, still: true });
      ctx.poly(R(120 + s * 30 - 2, 240, 34, 18), ctx.green(1), { inset: 1, still: true });
      ctx.circ(120 + s * 44, 190, 11, ctx.green(1));
    }
    for (let i = 0; i < 10; i++) ctx.circ(ctx.between(98, 142), ctx.between(110, 300), 2, ctx.colors[1]);
    ctx.poly([[70, 320], [170, 320], [156, 346], [84, 346]], ctx.col(3), { inset: 1, still: true });
    return 'cactus';
  }
  drawPlant(ctx, 120, 346, ctx.between(1.9, 2.4), ctx.int(6, 9));
  return 'potted plant';
}

function umbrella(ctx) {
  drawUmbrella(ctx, 120, 330, ctx.between(1.3, 1.6));
  const color = ctx.kind === 'light' ? '#1E7B8F' : '#62C3E3';
  for (let i = 0; i < 18; i++) {
    const x = ctx.between(16, 224);
    const y = ctx.between(40, 300);
    if (Math.abs(x - 120) < 70 && y > 80 && y < 250) continue;
    ctx.line(x, y, x - 5, y + ctx.between(14, 22), color, 3);
  }
  ctx.ellipse(120, 344, 60, 6, color);
  return 'umbrella';
}

function house(ctx) {
  const stories = ctx.int(1, 2);
  const w = ctx.between(110, 140);
  const x0 = 120 - w / 2;
  const base = 330;
  const h = stories * 70;
  ctx.circ(ctx.between(40, 70), 80, 20, ctx.colors[0]);
  ctx.poly(R(x0, base - h, w, h), ctx.col(1), { inset: 1, still: true });
  ctx.poly(R(x0 + w - 28, base - h - 44, 16, 44), ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < 3; i++) ctx.circ(x0 + w - 20 + i * 8, base - h - 56 - i * 16, 5 + i * 2, ctx.colors[1]);
  ctx.poly([[x0 - 12, base - h], [x0 + w + 12, base - h], [120, base - h - 56]], ctx.col(3), { inset: 1, still: true });
  ctx.poly(R(110, base - 44, 20, 44), ctx.col(4), { inset: 1, still: true });
  ctx.circ(124, base - 22, 2, ctx.colors[0]);
  for (let st = 0; st < stories; st++) {
    for (const wx of [x0 + 14, x0 + w - 38]) {
      if (st === 0 && Math.abs(wx - 110) < 40 && wx < 120 + 20 && wx > 120 - 50) continue;
      ctx.poly(R(wx, base - 60 - st * 70, 24, 26), ctx.col(5), { inset: 1, still: true });
      ctx.poly(R(wx + 11, base - 60 - st * 70, 2, 26), ctx.col(4), { inset: 1, still: true });
    }
  }
  ctx.poly([[110, base], [130, base], [150, 346], [90, 346]], ctx.col(0), { inset: 1, still: true });
  for (let i = 0; i < 6; i++) ctx.poly(R(14 + i * 14, base - 22, 8, 22), ctx.colors[1], { inset: 1, still: true });
  for (let i = 0; i < 4; i++) ctx.poly(R(150 + i * 14 + 34, base - 22, 8, 22), ctx.colors[1], { inset: 1, still: true });
  ctx.poly(curvePoly(12, 228, 338, 6, 0.05, ctx.between(0, TAU), 350), ctx.green(0), { inset: 1, still: true });
  return 'little house';
}

function lighthouse(ctx) {
  const top = 110;
  const bottom = 300;
  slice(ctx, (t) => 22 + 18 * t, (t, b) => [120 + b, top + t * (bottom - top)], {
    bands: 6, big: 40, loosePct: 0.04, skipPct: 0, color: (b, i) => (b % 2 ? ctx.colors[1] : ctx.col(3))
  });
  ctx.poly(R(92, top - 22, 56, 22), ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(100, top - 44, 40, 22), ctx.colors[0], { inset: 1, still: true });
  ctx.poly([[94, top - 44], [146, top - 44], [120, top - 74]], ctx.col(3), { inset: 1, still: true });
  for (const s of [-1, 1]) {
    ctx.raw(`<polygon points="${120 + s * 20},${top - 34} ${120 + s * 118},${top - 70} ${120 + s * 118},${top + 4}" fill="${ctx.colors[0]}" opacity=".35"/>`, 120 + s * 70, top - 34, [Math.min(120 + s * 20, 120 + s * 118), top - 70, Math.max(120 + s * 20, 120 + s * 118), top + 4]);
  }
  ctx.poly(R(112, bottom - 40, 16, 40), ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < 4; i++) {
    const x = 20 + i * 62;
    ctx.poly([[x, 330], [x + 30, 296 + ctx.between(0, 14)], [x + 74, 330]], ctx.col(4), { inset: 1, still: true });
  }
  for (let i = 0; i < 4; i++) {
    const y = 326 + i * 6;
    ctx.stroke(`M${14 + i * 10} ${y} q14 -10 28 0 q14 10 28 0 q14 -10 28 0 q14 10 28 0 q14 -10 28 0 q14 10 28 0`, ctx.col(5 + (i % 2)), 4, 120, y, [14, y - 10, 226, y + 10]);
  }
  return 'lighthouse';
}

function bicycle(ctx) {
  const wr = ctx.between(36, 42);
  const gy = 320;
  const rx = 64;
  const fx = 176;
  const color = ctx.col(3);
  const wheel = (cx) => {
    ctx.raw(`<circle cx="${cx}" cy="${gy - wr}" r="${fmt(wr)}" fill="none" stroke="${ctx.col(4)}" stroke-width="6"/>`, cx, gy - wr, [cx - wr, gy - 2 * wr, cx + wr, gy]);
    for (let i = 0; i < 8; i++) {
      const p = pol(cx, gy - wr, wr - 3, (i * TAU) / 8);
      ctx.line(cx, gy - wr, p[0], p[1], ctx.colors[1], 1.6);
    }
    ctx.circ(cx, gy - wr, 5, ctx.col(0));
  };
  wheel(rx);
  wheel(fx);
  const seat = [104, gy - wr - 70];
  const crank = [118, gy - wr];
  const head = [150, gy - wr - 64];
  ctx.line(rx, gy - wr, seat[0], seat[1], color, 6);
  ctx.line(rx, gy - wr, crank[0], crank[1], color, 6);
  ctx.line(seat[0], seat[1], crank[0], crank[1], color, 6);
  ctx.line(seat[0], seat[1], head[0], head[1], color, 6);
  ctx.line(crank[0], crank[1], head[0], head[1], color, 6);
  ctx.line(head[0], head[1], fx, gy - wr, color, 6);
  ctx.line(head[0], head[1], head[0] - 4, head[1] - 16, ctx.col(4), 5);
  ctx.line(head[0] - 4, head[1] - 16, head[0] + 12, head[1] - 22, ctx.col(4), 5);
  ctx.poly(R(seat[0] - 14, seat[1] - 10, 28, 7), ctx.col(4), { inset: 1, still: true });
  ctx.line(crank[0] - 12, crank[1] + 8, crank[0] + 12, crank[1] - 8, ctx.col(0), 5);
  if (ctx.rand() < 0.6) {
    ctx.poly([[head[0] + 8, head[1] - 20], [head[0] + 40, head[1] - 20], [head[0] + 34, head[1] + 4], [head[0] + 14, head[1] + 4]], ctx.col(0), { inset: 1, still: true });
  }
  ctx.poly(curvePoly(12, 228, 340, 4, 0.05, 0, 350), ctx.green(0), { inset: 1, still: true });
  return 'bicycle';
}

function sailboat(ctx) {
  ctx.circ(ctx.between(40, 190), ctx.between(70, 100), ctx.between(18, 26), ctx.colors[0]);
  const mx = ctx.between(110, 130);
  ctx.line(mx, 90, mx, 290, ctx.col(4), 5);
  ctx.poly([[mx + 6, 96], [mx + 6, 280], [mx + ctx.between(60, 84), 280]], ctx.colors[1], { inset: 1, still: true });
  ctx.poly([[mx - 6, 120], [mx - 6, 280], [mx - ctx.between(44, 60), 280]], ctx.col(3), { inset: 1, loose: ctx.rand() < 0.3 });
  ctx.poly([[mx, 90], [mx + 26, 98], [mx, 108]], ctx.col(0), { inset: 1, still: true });
  ctx.poly([[40, 290], [mx, 290], [mx - 14, 322], [64, 322]], ctx.col(4), { inset: 1, still: true });
  ctx.poly([[mx, 290], [200, 290], [176, 322], [mx - 14, 322]], ctx.col(0), { inset: 1, still: true });
  for (let i = 0; i < 4; i++) {
    const y = 320 + i * 8;
    ctx.poly(curvePoly(12, 228, y, ctx.between(5, 9), ctx.between(0.05, 0.1), ctx.between(0, TAU), 350), ctx.col(2 + (i % 3)), { inset: 1, still: true });
  }
  for (let i = 0; i < 2; i++) {
    const x = ctx.between(30, 190);
    const y = ctx.between(130, 190);
    ctx.stroke(`M${fmt(x)} ${fmt(y)} q8 -8 16 0 q8 -8 16 0`, ctx.ink, 3, x + 16, y - 4, [x, y - 8, x + 32, y]);
  }
  return 'sailboat';
}

module.exports = { chair, table, room, corner, clock, teapot, shelf, plant, umbrella, house, lighthouse, bicycle, sailboat };
