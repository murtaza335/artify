'use strict';

// More nature: mushrooms, a fractal tree, a palm island, a pond, a leaf wreath and a seedling.

const { TAU, fmt, pol, rectPts, curvePoly } = require('./engine');

const R = rectPts;

function mushrooms(ctx) {
  ctx.poly(curvePoly(12, 228, 330, 8, 0.05, ctx.between(0, TAU), 350), ctx.green(0), { inset: 1, still: true });
  const count = ctx.int(3, 4);
  for (let i = 0; i < count; i++) {
    const x = 36 + i * (168 / (count - 1)) + ctx.between(-8, 8);
    const h = ctx.between(60, 130) + (i % 2) * 20;
    const w = ctx.between(46, 72);
    const base = 336 - (i % 2) * 8;
    ctx.poly([[x - 9, base - h], [x + 9, base - h], [x + 12, base], [x - 12, base]], ctx.colors[1], { inset: 1, still: true });
    const cap = ctx.col(i * 2 + 3);
    ctx.shape(`M${fmt(x - w / 2)} ${fmt(base - h + 6)} A${fmt(w / 2)} ${fmt(w * 0.5)} 0 0 1 ${fmt(x + w / 2)} ${fmt(base - h + 6)} Z`, cap, x, base - h - w * 0.15, [x - w / 2, base - h - w * 0.5, x + w / 2, base - h + 6]);
    ctx.poly([[x - w / 2, base - h + 6], [x + w / 2, base - h + 6], [x + w / 2 - 6, base - h + 14], [x - w / 2 + 6, base - h + 14]], ctx.colors[1], { inset: 1, still: true });
    for (let d = 0; d < 4; d++) ctx.circ(x + ctx.between(-w * 0.32, w * 0.32), base - h - ctx.between(4, w * 0.36), ctx.between(3, 6), ctx.colors[1]);
  }
  for (let i = 0; i < 3; i++) ctx.circ(ctx.between(30, 210), ctx.between(80, 200), 3, ctx.colors[0]);
  return 'mushrooms';
}

// A tree from a recursive branching rule (an L-system style fractal).
function fractalTree(ctx) {
  ctx.poly(curvePoly(12, 228, 336, 6, 0.05, ctx.between(0, TAU), 350), ctx.col(4), { inset: 1, still: true });
  const depth = ctx.int(5, 6);
  const spread = ctx.between(0.35, 0.55);
  const grow = (x, y, len, ang, d) => {
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    ctx.line(x, y, x2, y2, ctx.col(4), 2 + d * 1.6);
    if (d <= 0) {
      ctx.circ(x2, y2, ctx.between(5, 9), ctx.pick([ctx.green(0), ctx.green(1), ctx.col(3), ctx.col(6)]));
      return;
    }
    grow(x2, y2, len * ctx.between(0.68, 0.8), ang - spread * ctx.between(0.7, 1.3), d - 1);
    grow(x2, y2, len * ctx.between(0.68, 0.8), ang + spread * ctx.between(0.7, 1.3), d - 1);
  };
  grow(120, 338, ctx.between(62, 72), -Math.PI / 2 + ctx.between(-0.1, 0.1), depth - 1);
  return 'fractal tree';
}

function palmIsland(ctx) {
  ctx.circ(ctx.between(40, 90), ctx.between(70, 100), ctx.between(20, 28), ctx.colors[0]);
  for (let i = 0; i < 4; i++) ctx.poly(curvePoly(12, 228, 300 + i * 14, ctx.between(5, 9), ctx.between(0.05, 0.1), ctx.between(0, TAU), 350), ctx.col(2 + (i % 3) * 3), { inset: 1, still: true });
  ctx.shape('M30 308 Q120 250 210 308 Z', ctx.col(0), 120, 290, [30, 262, 210, 308]);
  const lean = ctx.between(-26, 26);
  let px = 120;
  let py = 286;
  for (let i = 0; i < 5; i++) {
    const nx = px + lean / 5 + ctx.between(-3, 3);
    const ny = py - 30;
    ctx.poly([[px - 7, py], [px + 7, py], [nx + 6, ny], [nx - 6, ny]], ctx.col(i % 2 ? 4 : 0), { inset: 1, still: true });
    px = nx;
    py = ny;
  }
  const fronds = ctx.int(6, 8);
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI + (i * Math.PI) / (fronds - 1) + ctx.between(-0.1, 0.1);
    const len = ctx.between(54, 78);
    const tip = pol(px, py, len, a);
    ctx.poly([[px, py], pol(px, py, len * 0.5, a - 0.32), [tip[0], tip[1] + 14], pol(px, py, len * 0.5, a + 0.32)], ctx.green(i), { inset: 1, loose: ctx.rand() < 0.2 });
  }
  ctx.circ(px - 5, py + 6, 5, ctx.col(4));
  ctx.circ(px + 5, py + 8, 5, ctx.col(4));
  return 'palm island';
}

function pond(ctx) {
  ctx.ellipse(120, 270, 106, 56, ctx.col(2));
  ctx.ellipse(120, 270, 82, 40, ctx.col(5));
  const pads = ctx.int(3, 5);
  for (let i = 0; i < pads; i++) {
    const x = ctx.between(56, 184);
    const y = ctx.between(250, 296);
    const r = ctx.between(14, 22);
    const a = ctx.between(0, TAU);
    const p0 = pol(x, y, r, a + 0.3);
    const p1 = pol(x, y, r, a - 0.3);
    ctx.shape(`M${fmt(x)} ${fmt(y)} L${fmt(p0[0])} ${fmt(p0[1])} A${fmt(r)} ${fmt(r)} 0 1 1 ${fmt(p1[0])} ${fmt(p1[1])} Z`, ctx.green(i), x, y, [x - r, y - r, x + r, y + r]);
  }
  for (let i = 0; i < 2; i++) {
    const x = ctx.between(70, 170);
    const y = ctx.between(256, 290);
    for (let k = -2; k <= 2; k++) ctx.poly([[x, y], [x + k * 9 - 6, y - 14], [x + k * 9 + 6, y - 14]], ctx.col(6 + i), { inset: 1, loose: false });
    ctx.circ(x, y - 4, 4, ctx.col(0));
  }
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * ctx.between(34, 46);
    const top = ctx.between(110, 220);
    ctx.line(x, 300, x + ctx.between(-6, 6), top, ctx.green(i), 4);
    if (i % 2 === 0) ctx.ellipse(x, top - 6, 4, 12, ctx.col(4));
  }
  ctx.circ(ctx.between(150, 200), 90, ctx.between(18, 26), ctx.colors[0]);
  return 'pond';
}

function wreath(ctx) {
  const cx = 120;
  const cy = 190;
  const n = ctx.int(18, 26);
  const rad = 76;
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n;
    const base = pol(cx, cy, rad, a);
    ctx.poly([pol(base[0], base[1], 4, a + 1.5), pol(base[0], base[1], 26, a + 0.7), pol(base[0], base[1], 34, a + 0.9), pol(base[0], base[1], 22, a + 1.25)], ctx.green(i), { inset: 1, loose: ctx.rand() < 0.1 });
    ctx.poly([pol(base[0], base[1], 4, a - 1.5), pol(base[0], base[1], 26, a - 0.7), pol(base[0], base[1], 34, a - 0.9), pol(base[0], base[1], 22, a - 1.25)], ctx.green(i + 1), { inset: 1 });
  }
  for (let i = 0; i < ctx.int(8, 12); i++) {
    const [x, y] = pol(cx, cy, rad + ctx.between(-14, 14), ctx.between(0, TAU));
    ctx.circ(x, y, ctx.between(3.5, 6), ctx.pick([ctx.col(3), ctx.col(6), ctx.col(0)]));
  }
  ctx.poly([[cx, cy + rad], [cx - 30, cy + rad + 40], [cx - 10, cy + rad + 44]], ctx.col(3), { inset: 1, still: true });
  ctx.poly([[cx, cy + rad], [cx + 30, cy + rad + 40], [cx + 10, cy + rad + 44]], ctx.col(3), { inset: 1, still: true });
  ctx.poly([[cx - 8, cy + rad - 8], [cx + 8, cy + rad - 8], [cx + 8, cy + rad + 8], [cx - 8, cy + rad + 8]], ctx.col(0), { inset: 1, still: true });
  return 'wreath';
}

function seedling(ctx) {
  const sx = ctx.between(100, 140);
  ctx.circ(ctx.between(40, 80), 80, 22, ctx.colors[0]);
  for (let i = 0; i < 10; i++) {
    const a = (i * TAU) / 10;
    ctx.poly([pol(60, 80, 28, a - 0.1), pol(60, 80, 42, a), pol(60, 80, 28, a + 0.1)], ctx.colors[0], { inset: 1, still: true });
  }
  ctx.poly([[40, 342], [sx - 50, 300], [sx + 50, 300], [200, 342]], ctx.col(4), { inset: 1, still: true });
  ctx.poly([[sx - 80, 342], [sx - 30, 306], [sx + 30, 306], [sx + 80, 342]], ctx.col(3), { inset: 1, still: true });
  const h = ctx.between(120, 190);
  ctx.line(sx, 306, sx, 306 - h, ctx.green(0), 7);
  for (const s of [-1, 1]) {
    const y = 306 - h;
    ctx.poly([[sx, y], [sx + s * 50, y - 26], [sx + s * 64, y + 8], [sx + s * 8, y + 16]], ctx.green(s === 1 ? 1 : 2), { inset: 1, loose: ctx.rand() < 0.2 });
    ctx.poly([[sx, y + 40], [sx + s * 38, y + 34], [sx + s * 46, y + 58], [sx, y + 62]], ctx.green(s === 1 ? 2 : 1), { inset: 1 });
  }
  for (let i = 0; i < 6; i++) ctx.line(ctx.between(150, 200), 110 + i * 18, ctx.between(144, 194), 124 + i * 18, ctx.col(5), 3);
  return 'seedling';
}

module.exports = { mushrooms, fractalTree, palmIsland, pond, wreath, seedling };
