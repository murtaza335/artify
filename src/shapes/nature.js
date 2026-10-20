'use strict';

// Flowers, a meadow of grass, and butterflies.

const { TAU, fmt, pol } = require('./engine');

// A bloom of kite-shaped petals around a centre.
function bloom(ctx, cx, cy, R, n, c1, c2, centre, dot) {
  const rot = ctx.rand() * TAU;
  const half = (TAU / n) * 0.42;
  const rc = R * 0.28;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    ctx.poly([pol(cx, cy, rc * 0.6, a), pol(cx, cy, R * 0.58, a - half), pol(cx, cy, R, a), pol(cx, cy, R * 0.58, a + half)], i % 2 ? c1 : c2, { inset: 0.94, loose: ctx.rand() < 0.1 });
  }
  ctx.circ(cx, cy, rc, centre);
  if (dot) ctx.circ(cx, cy, rc * 0.4, dot);
}

function stem(ctx, x0, y0, x1, y1, width = 6) {
  ctx.stroke(`M${fmt(x0)} ${fmt(y0)} Q${fmt((x0 + x1) / 2 + ctx.between(-14, 14))} ${fmt((y0 + y1) / 2)} ${fmt(x1)} ${fmt(y1)}`, ctx.green(0), width, (x0 + x1) / 2, (y0 + y1) / 2, [Math.min(x0, x1) - 10, Math.min(y0, y1), Math.max(x0, x1) + 10, Math.max(y0, y1)]);
}

function leaf(ctx, x, y, side, len, i) {
  ctx.poly([[x, y], [x + side * len, y - ctx.between(10, 22)], [x + side * (len + 8), y + 2], [x + side * len * 0.4, y + 10]], ctx.green(i), { loose: ctx.rand() < 0.25 });
}

function sunflower(ctx) {
  const cx = ctx.between(110, 130);
  const cy = ctx.between(115, 135);
  const R = ctx.between(60, 72);
  stem(ctx, cx, cy + R * 0.5, cx + ctx.between(-8, 8), 346, 9);
  leaf(ctx, cx, 270, -1, ctx.between(40, 56), 1);
  leaf(ctx, cx, 300, 1, ctx.between(40, 56), 2);
  const n = ctx.int(14, 20);
  const rot = ctx.rand() * TAU;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    const half = (TAU / n) * 0.3;
    ctx.poly([pol(cx, cy, R * 0.4, a), pol(cx, cy, R * 0.7, a - half), pol(cx, cy, R, a), pol(cx, cy, R * 0.7, a + half)], i % 2 ? ctx.col(0) : ctx.colors[0], { inset: 0.95 });
  }
  ctx.circ(cx, cy, R * 0.42, ctx.col(4));
  for (let ring = 1; ring <= 2; ring++) {
    const count = ring * 7;
    for (let k = 0; k < count; k++) ctx.circ(...pol(cx, cy, R * 0.14 * ring * 1.3, (k * TAU) / count + ring), 2.4, ctx.colors[0]);
  }
  return 'sunflower';
}

function tulips(ctx) {
  const count = ctx.int(2, 4);
  const ground = 346;
  for (let i = 0; i < count; i++) {
    const x = 120 + (i - (count - 1) / 2) * ctx.between(44, 60);
    const top = ctx.between(90, 200);
    const w = ctx.between(22, 32);
    const h = w * 1.5;
    stem(ctx, x, top + h, x + ctx.between(-6, 6), ground, 6);
    leaf(ctx, x, ground - 50, i % 2 ? 1 : -1, ctx.between(36, 54), i);
    const main = ctx.col(i * 2 + 3);
    ctx.poly([[x - w, top + h * 0.2], [x - w * 0.2, top], [x - w * 0.1, top + h], [x - w * 0.6, top + h]], main, { inset: 1, loose: ctx.rand() < 0.2 });
    ctx.poly([[x + w, top + h * 0.2], [x + w * 0.2, top], [x + w * 0.1, top + h], [x + w * 0.6, top + h]], ctx.col(i * 2 + 5), { inset: 1, loose: ctx.rand() < 0.2 });
    ctx.poly([[x - w * 0.45, top + h * 0.1], [x, top - h * 0.18], [x + w * 0.45, top + h * 0.1], [x + w * 0.3, top + h], [x - w * 0.3, top + h]], ctx.col(i * 2 + 2), { inset: 1 });
  }
  return 'tulips';
}

function bouquet(ctx) {
  const bx = 120;
  const by = 300;
  const count = ctx.int(3, 5);
  const blooms = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    blooms.push({ x: 120 + (t - 0.5) * ctx.between(110, 150), y: 110 + Math.abs(t - 0.5) * 60 + ctx.between(0, 40), R: ctx.between(20, 32) });
  }
  blooms.forEach((b) => stem(ctx, bx, by, b.x, b.y + b.R * 0.4, 5));
  blooms.forEach((b, i) => bloom(ctx, b.x, b.y, b.R, ctx.int(5, 9), ctx.col(i * 2 + 3), ctx.col(i * 2 + 6), ctx.col(0), ctx.col(4)));
  leaf(ctx, 120, 250, -1, 36, 1);
  leaf(ctx, 120, 262, 1, 36, 2);
  // Wrapping paper and a ribbon.
  ctx.poly([[bx - 46, 280], [bx + 46, 280], [bx + 8, 354], [bx - 8, 354]], ctx.col(1), { inset: 1, still: true });
  ctx.poly([[bx - 30, 296], [bx + 30, 296], [bx + 22, 318], [bx - 22, 318]], ctx.col(3), { inset: 1, still: true });
  ctx.circ(bx, 307, 6, ctx.col(0));
  return 'bouquet';
}

function butterfly(ctx, x, y, s, rot) {
  const R = (px, py) => {
    const dx = (px - x) * s;
    const dy = (py - y) * s;
    return [x + dx * Math.cos(rot) - dy * Math.sin(rot), y + dx * Math.sin(rot) + dy * Math.cos(rot)];
  };
  const c1 = ctx.col(3);
  const c2 = ctx.col(0);
  for (const side of [-1, 1]) {
    ctx.poly([R(x, y), R(x + side * 26, y - 22), R(x + side * 30, y + 2)], c1, { inset: 1, still: true });
    ctx.poly([R(x, y), R(x + side * 22, y + 4), R(x + side * 16, y + 22)], c2, { inset: 1, still: true });
  }
  ctx.ellipse(x, y, 2.2 * s, 10 * s, ctx.ink, rot);
}

function grass(ctx) {
  const base = 346;
  const blades = ctx.int(26, 38);
  for (let i = 0; i < blades; i++) {
    const x = 10 + (i / (blades - 1)) * 220 + ctx.between(-4, 4);
    const h = ctx.between(60, 190);
    const lean = ctx.between(-26, 26);
    const w = ctx.between(3, 6);
    ctx.poly([[x - w, base], [x + w, base], [x + lean, base - h]], ctx.green(i + ctx.int(0, 1)), { inset: 1, still: true });
  }
  // A few wild flowers and butterflies above the blades.
  const flowers = ctx.int(2, 4);
  for (let i = 0; i < flowers; i++) {
    const x = ctx.between(30, 210);
    const y = ctx.between(120, 220);
    stem(ctx, x, base, x, y + 10, 3);
    bloom(ctx, x, y, ctx.between(12, 18), ctx.int(5, 7), ctx.col(i * 2 + 3), ctx.col(i * 2 + 6), ctx.col(0));
  }
  const flies = ctx.int(1, 2);
  for (let i = 0; i < flies; i++) butterfly(ctx, ctx.between(40, 200), ctx.between(60, 120), ctx.between(0.9, 1.4), ctx.between(-0.5, 0.5));
  return 'meadow';
}

module.exports = { sunflower, tulips, bouquet, grass };
