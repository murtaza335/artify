'use strict';

// More animals: fox, whale, butterfly, rabbit, turtle and penguin.

const { TAU, fmt, pol, slice, rectPts, curvePoly } = require('./engine');

const R = rectPts;

function fox(ctx) {
  const main = ctx.rand() < 0.5 ? ctx.col(3) : ctx.col(0);
  const shade = ctx.col(4);
  const cream = ctx.colors[1];
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const tx = 120 + side * 46;
  ctx.poly([[tx, 304], [tx + side * 72, 238], [tx + side * 64, 332], [tx + side * 6, 342]], main, { inset: 1 });
  ctx.poly([[tx + side * 72, 238], [tx + side * 64, 332], [tx + side * 40, 288]], cream, { inset: 1 });
  ctx.poly([[84, 225], [156, 225], [178, 342], [62, 342]], main, { inset: 1, still: true });
  ctx.poly([[104, 228], [136, 228], [120, 306]], cream, { inset: 1, still: true });
  for (const s of [-1, 1]) {
    ctx.poly([[120 + s * 28, 342], [120 + s * 52, 342], [120 + s * 48, 306]], shade, { inset: 1, still: true });
    ctx.poly([[120 + s * 60, 112], [120 + s * 52, 44], [120 + s * 18, 100]], main, { inset: 1, still: true });
    ctx.poly([[120 + s * 52, 106], [120 + s * 48, 66], [120 + s * 30, 100]], shade, { inset: 1, still: true });
  }
  ctx.poly([[60, 112], [120, 112], [120, 232]], main, { inset: 1, still: true });
  ctx.poly([[120, 112], [180, 112], [120, 232]], ctx.rand() < 0.5 ? main : ctx.col(0), { inset: 1, still: true });
  for (const s of [-1, 1]) ctx.poly([[120 + s * 58, 138], [120, 232], [120 + s * 24, 172]], cream, { inset: 1, still: true });
  ctx.poly([[100, 186], [140, 186], [120, 232]], cream, { inset: 1, still: true });
  ctx.circ(120, 230, 7, ctx.ink);
  for (const s of [-1, 1]) {
    ctx.ellipse(120 + s * 27, 150, 9, 4, ctx.ink, s * 0.35);
    ctx.line(120 + s * 14, 136, 120 + s * 40, 128, shade, 3);
  }
  return 'fox';
}

function whale(ctx) {
  const x0 = 20;
  const L = ctx.between(150, 170);
  const cy = ctx.between(190, 214);
  const amp = ctx.between(44, 54);
  const tilt = ctx.between(-0.1, 0.06);
  const mx = x0 + L / 2;
  const Rot = (x, y) => {
    const dx = x - mx;
    const dy = y - cy;
    return [mx + dx * Math.cos(tilt) - dy * Math.sin(tilt), cy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  };
  const hw = (t) => amp * Math.pow(Math.sin(Math.PI * Math.min(0.98, Math.max(0.02, t))), 0.6) * (1.05 - 0.35 * t);
  const main = ctx.col(2);
  slice(ctx, hw, (t, b) => Rot(x0 + t * L, cy + b), {
    bands: ctx.int(6, 8), big: 20, loosePct: 0.08, skipPct: 0, color: (b, i) => (i === 0 ? main : i === 1 ? ctx.col(5) : ctx.colors[1])
  });
  const tx = x0 + L - 6;
  ctx.poly([Rot(tx, cy), Rot(tx + 26, cy - 54), Rot(tx + 40, cy - 40), Rot(tx + 14, cy)], main, { inset: 1 });
  ctx.poly([Rot(tx, cy), Rot(tx + 14, cy), Rot(tx + 40, cy + 6), Rot(tx + 22, cy + 34)], ctx.col(5), { inset: 1 });
  const eye = Rot(x0 + L * 0.17, cy - 6);
  ctx.circ(eye[0], eye[1], 4.5, ctx.ink);
  const bx = x0 + L * 0.32;
  const by = cy - hw(0.32);
  for (let i = -1; i <= 1; i++) {
    ctx.stroke(`M${fmt(bx)} ${fmt(by)} q${fmt(i * 20)} -34 ${fmt(i * 34)} -14`, ctx.colors[1], 4, bx + i * 14, by - 20, [bx - 40, by - 40, bx + 40, by]);
    ctx.circ(bx + i * 34, by - 18, 4, ctx.colors[1]);
  }
  for (let i = 0; i < 4; i++) {
    ctx.poly(curvePoly(12, 228, 288 + i * 18, ctx.between(5, 9), ctx.between(0.05, 0.1), ctx.between(0, TAU), 350), ctx.col(2 + (i % 3) * 3), { inset: 1, still: true });
  }
  return 'whale';
}

function butterfly(ctx) {
  const cx = 120;
  const cy = 190;
  const s = ctx.between(1.15, 1.45);
  const tilt = ctx.between(-0.15, 0.15);
  const rot = (px, py) => [cx + (px - cx) * Math.cos(tilt) - (py - cy) * Math.sin(tilt), cy + (px - cx) * Math.sin(tilt) + (py - cy) * Math.cos(tilt)];
  const wing = (side, a0, a1, radius, count, colorBase) => {
    for (let i = 0; i < count; i++) {
      const u0 = a0 + ((a1 - a0) * i) / count;
      const u1 = a0 + ((a1 - a0) * (i + 1)) / count;
      const rr = radius * ctx.between(0.88, 1.08);
      const pts = [[cx + side * 6, cy], pol(cx + side * 6, cy, rr, side === 1 ? u0 : Math.PI - u0), pol(cx + side * 6, cy, rr * 0.92, side === 1 ? (u0 + u1) / 2 : Math.PI - (u0 + u1) / 2), pol(cx + side * 6, cy, rr, side === 1 ? u1 : Math.PI - u1)]
        .map(([x, y]) => rot(cx + (x - cx) * s, cy + (y - cy) * s));
      ctx.poly(pts, ctx.col(colorBase + i * 2), { inset: 0.97 });
    }
  };
  for (const side of [-1, 1]) {
    wing(side, -1.45, -0.1, 84, 4, 3);
    wing(side, 0.2, 1.15, 58, 3, 0);
    const dot = rot(cx + side * 46 * s, cy - 36 * s);
    ctx.circ(dot[0], dot[1], 8 * s, ctx.colors[1]);
    const dot2 = rot(cx + side * 34 * s, cy + 30 * s);
    ctx.circ(dot2[0], dot2[1], 5 * s, ctx.colors[1]);
    const top = rot(cx + side * 4, cy - 26);
    const tip = rot(cx + side * 22 * s, cy - 72 * s);
    ctx.stroke(`M${fmt(top[0])} ${fmt(top[1])} Q${fmt(top[0] + side * 4)} ${fmt(top[1] - 24)} ${fmt(tip[0])} ${fmt(tip[1])}`, ctx.colors[4], 2.5, tip[0], tip[1], [Math.min(top[0], tip[0]), tip[1], Math.max(top[0], tip[0]), top[1]]);
    ctx.circ(tip[0], tip[1], 3, ctx.colors[4]);
  }
  const body = rot(cx, cy);
  ctx.ellipse(body[0], body[1], 6 * s, 30 * s, ctx.colors[4], tilt);
  return 'butterfly';
}

function rabbit(ctx) {
  const fur = ctx.rand() < 0.5 ? ctx.colors[1] : ctx.col(5);
  const pink = ctx.colors[6];
  ctx.circ(ctx.between(176, 196), 306, 14, ctx.colors[1]);
  slice(ctx, (t) => 46 + 12 * Math.sin(t * Math.PI * 0.8), (t, b) => [120 + b, 190 + t * 148], {
    bands: 4, big: 30, loosePct: 0.04, skipPct: 0, color: (b, i) => (i % 2 ? fur : ctx.col(2))
  });
  for (const s of [-1, 1]) {
    ctx.poly([[120 + s * 8, 118], [120 + s * 30, 112], [120 + s * 40 + s * ctx.between(-6, 8), 30], [120 + s * 14, 36]], fur, { inset: 1, still: true });
    ctx.poly([[120 + s * 14, 106], [120 + s * 28, 102], [120 + s * 34, 50], [120 + s * 18, 54]], pink, { inset: 1, still: true });
    ctx.ellipse(120 + s * 30, 336, 18, 8, fur);
  }
  ctx.circ(120, 156, 42, fur);
  for (const s of [-1, 1]) {
    ctx.circ(120 + s * 17, 150, 5.5, ctx.ink);
    ctx.circ(120 + s * 28, 170, 8, pink);
  }
  ctx.poly([[114, 164], [126, 164], [120, 172]], pink, { inset: 1, still: true });
  ctx.line(120, 172, 120, 180, ctx.ink, 2);
  if (ctx.rand() < 0.6) {
    ctx.poly([[96, 250], [112, 250], [104, 310]], ctx.col(0), { inset: 1, still: true });
    ctx.poly([[100, 246], [92, 232], [104, 238], [108, 226], [110, 246]], ctx.green(0), { inset: 1, still: true });
  }
  return 'rabbit';
}

function turtle(ctx) {
  const cx = 120;
  const cy = ctx.between(188, 200);
  const shell = [ctx.green(0), ctx.green(1), ctx.green(3)];
  for (const s of [-1, 1]) {
    ctx.ellipse(cx + s * 78, cy - 52, 26, 12, ctx.col(0), s * 0.5);
    ctx.ellipse(cx + s * 78, cy + 56, 26, 12, ctx.col(0), -s * 0.5);
  }
  ctx.poly([[cx - 12, cy + 88], [cx + 12, cy + 88], [cx, cy + 128]], ctx.col(0), { inset: 1, still: true });
  ctx.circ(cx, cy - 98, 24, ctx.col(0));
  for (const s of [-1, 1]) ctx.circ(cx + s * 9, cy - 104, 3.5, ctx.ink);
  ctx.ellipse(cx, cy, 86, 96, ctx.col(4));
  const size = 24;
  for (let r = -1; r <= 1; r++) {
    for (let q = -1; q <= 1; q++) {
      if (Math.abs(q + r) > 1) continue;
      const x = cx + size * Math.sqrt(3) * (q + r / 2);
      const y = cy + size * 1.5 * r;
      const pts = [0, 1, 2, 3, 4, 5].map((k) => pol(x, y, size, ((-90 + 60 * k) * Math.PI) / 180));
      ctx.poly(pts, shell[(q + r + 3) % 3], { inset: 0.92 });
    }
  }
  for (let k = 0; k < 6; k++) {
    const a = ((-60 + 60 * k) * Math.PI) / 180;
    const [x, y] = pol(cx, cy, 70, a);
    ctx.poly([pol(x, y, 18, a - 0.5), pol(x, y, 18, a + 0.5), pol(x, y, 30, a)], ctx.green(k + 1), { inset: 1 });
  }
  return 'turtle';
}

function penguin(ctx) {
  const cy = 230;
  ctx.poly([[20, 330], [220, 330], [196, 350], [44, 350]], ctx.col(5), { inset: 1, still: true });
  const coat = ctx.colors[4];
  ctx.ellipse(120, cy, 62, 100, coat);
  ctx.ellipse(120, cy + 14, 42, 80, ctx.colors[1]);
  for (const s of [-1, 1]) {
    ctx.poly([[120 + s * 58, cy - 40], [120 + s * 100, cy + 20], [120 + s * 66, cy + 30]], coat, { inset: 1, still: true });
    ctx.poly([[120 + s * 14, 326], [120 + s * 50, 326], [120 + s * 34, 340]], ctx.col(0), { inset: 1, still: true });
  }
  ctx.circ(120, 124, 42, coat);
  ctx.circ(104, 128, 17, ctx.colors[1]);
  ctx.circ(136, 128, 17, ctx.colors[1]);
  for (const x of [105, 135]) {
    ctx.circ(x, 124, 5, ctx.ink);
  }
  ctx.poly([[110, 136], [130, 136], [120, 156]], ctx.col(0), { inset: 1, still: true });
  if (ctx.rand() < 0.7) {
    ctx.poly([[84, 150], [156, 150], [152, 164], [88, 164]], ctx.col(3), { inset: 1, still: true });
    ctx.poly([[136, 162], [150, 162], [158, 196], [144, 196]], ctx.col(3), { inset: 1, still: true });
  }
  return 'penguin';
}

module.exports = { fox, whale, butterfly, rabbit, turtle, penguin };
