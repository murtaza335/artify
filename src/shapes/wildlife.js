'use strict';

// More animals: elephant, giraffe, octopus, jellyfish, hummingbird, flamingo, snail, bee, deer, peacock, frog
// and an origami crane.

const { TAU, fmt, pol, slice, rectPts, arcBand, blob } = require('./engine');

const R = rectPts;
const still = { inset: 1, still: true };

// The round backdrop behind an animal. Its colour is stepped past any of the animal's own colours, so the
// animal never disappears into it.
function disc(ctx, cx, cy, r0, r1, avoid) {
  const r = ctx.between(r0, r1);
  let k = ctx.int(0, 7) + 4;
  for (let n = 0; n < 8 && avoid.includes(ctx.col(k)); n++) k++;
  ctx.circ(cx, cy, r, ctx.col(k));
}

// An egg-shaped body cut into shards, optionally turned about its centre.
function oval(ctx, cx, cy, rx, ry, color, { rot = 0, bands = ctx.int(4, 6) } = {}) {
  slice(ctx, (t) => ry * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)), (t, b) => {
    const dx = (t * 2 - 1) * rx;
    return [cx + dx * Math.cos(rot) - b * Math.sin(rot), cy + dx * Math.sin(rot) + b * Math.cos(rot)];
  }, { bands, big: 16, loosePct: 0.06, skipPct: 0, color });
}

function elephant(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const hide = ctx.pick([2, 5, 4, 7]);
  disc(ctx, 120, 190, 96, 106, [ctx.col(hide), ctx.col(hide + 1)]);
  for (const dx of [-38, -12, 22, 46]) ctx.poly(R(120 + dx - 11, 252, 22, 74), ctx.col(hide), still);
  oval(ctx, 120 - side * 8, 226, 66, 46, (b, i) => ctx.col(hide + (i === 1 ? 1 : 0)));
  oval(ctx, 120 + side * 62, 190, 32, 38, (b, i) => ctx.col(hide + (i === 1 ? 1 : 0)));
  ctx.circ(120 + side * 34, 186, 30, ctx.col(hide + 3));
  ctx.circ(120 + side * 34, 186, 20, ctx.col(6));
  const tx = 120 + side * 88;
  ctx.stroke(`M${tx} 204 Q${tx + side * 12} 250 ${tx - side * 6} ${ctx.between(284, 300)}`, ctx.col(hide), 16, tx, 250, [tx - 20, 204, tx + 20, 300]);
  ctx.poly([[tx - side * 6, 214], [tx + side * 16, 236], [tx - side * 4, 238]], ctx.colors[1], still);
  ctx.circ(120 + side * 76, 178, 4, ctx.ink);
  ctx.line(120 - side * 72, 212, 120 - side * 84, 250, ctx.col(hide + 1), 4);
  return 'elephant';
}

function giraffe(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const fur = ctx.col(ctx.pick([0, 0, 6]));
  const spot = ctx.col(4);
  disc(ctx, 120, 180, 94, 104, [fur]);
  for (const dx of [-30, -12, 22, 40]) ctx.poly(R(120 + dx - 6, 250, 12, 90), fur, still);
  oval(ctx, 120, 240, 56, 34, (b, i) => (i % 2 ? fur : ctx.col(1)), { bands: 5 });
  const nx = 120 + side * 36;
  ctx.poly([[nx - 14, 232], [nx + 14, 232], [nx + side * 26, 84], [nx + side * 6, 84]], fur, still);
  oval(ctx, nx + side * 30, 76, 24, 15, () => fur, { rot: side * -0.25, bands: 3 });
  for (const s of [-1, 1]) {
    ctx.line(nx + side * 22 + s * 6, 58, nx + side * 22 + s * 10, 40, ctx.ink, 3);
    ctx.circ(nx + side * 22 + s * 10, 38, 4, ctx.ink);
  }
  ctx.circ(nx + side * 36, 72, 3.4, ctx.ink);
  for (let i = 0; i < 9; i++) {
    const t = ctx.rand();
    const x = i < 4 ? nx + side * (8 + t * 18) + ctx.between(-6, 6) : 120 + ctx.between(-42, 42);
    const y = i < 4 ? 100 + t * 120 : ctx.between(224, 256);
    ctx.circ(x, y, ctx.between(6, 10), spot);
  }
  return 'giraffe';
}

function octopus(ctx) {
  const body = ctx.col(ctx.pick([3, 6, 2, 0]));
  disc(ctx, 120, 190, 100, 108, [body]);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const x0 = 120 + (i - 3.5) * 14;
    const a = (i - 3.5) * 12;
    const wig = ctx.between(10, 24) * (i % 2 ? 1 : -1);
    ctx.stroke(`M${fmt(x0)} 170 C${fmt(x0 + a)} 220 ${fmt(x0 + a + wig)} 250 ${fmt(x0 + a * 1.6)} ${fmt(300 + ctx.between(0, 30))}`, body, 13, x0 + a, 240, [x0 - 40, 170, x0 + 60, 340]);
  }
  blob(ctx, 120, 128, 56, 0.06, body, 8);
  for (let i = 0; i < 7; i++) ctx.circ(ctx.between(84, 156), ctx.between(96, 130), ctx.between(3, 6), ctx.col(6));
  for (const s of [-1, 1]) {
    ctx.circ(120 + s * 22, 142, 11, ctx.colors[1]);
    ctx.circ(120 + s * 22, 144, 5, ctx.ink);
  }
  ctx.stroke('M108 166 q12 8 24 0', ctx.ink, 3, 120, 168, [108, 164, 132, 174]);
  return 'octopus';
}

function jellyfish(ctx) {
  const bell = ctx.col(ctx.pick([6, 5, 3, 0]));
  disc(ctx, 120, 190, 100, 108, [bell]);
  const top = ctx.between(80, 100);
  const r = ctx.between(62, 76);
  slice(ctx, (t) => r * Math.sqrt(Math.max(0, 1 - (1 - t) ** 2)), (t, b) => [120 + b, top + t * r * 1.1], { bands: 5, big: 24, loosePct: 0.06, skipPct: 0, color: (b, i) => (i === 1 ? ctx.colors[1] : bell) });
  const by = top + r * 1.1;
  for (let i = 0; i < 6; i++) ctx.circ(120 - r + (i + 0.5) * ((2 * r) / 6), by, (r / 3) * 0.95, bell);
  const n = ctx.int(5, 7);
  for (let i = 0; i < n; i++) {
    const x = 120 - r * 0.8 + (i * 1.6 * r) / (n - 1);
    const len = ctx.between(90, 150);
    const w = ctx.between(8, 16) * (i % 2 ? 1 : -1);
    ctx.stroke(`M${fmt(x)} ${fmt(by)} q${w} ${fmt(len / 4)} 0 ${fmt(len / 2)} t0 ${fmt(len / 2)}`, ctx.col(i + 1), 4, x, by + len / 2, [x - 20, by, x + 20, by + len]);
  }
  for (let i = 0; i < 4; i++) ctx.circ(ctx.between(96, 144), ctx.between(top + 14, by - 12), ctx.between(3, 6), ctx.colors[1]);
  return 'jellyfish';
}

function hummingbird(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const body = ctx.col(ctx.pick([2, 7, 5]));
  const fx = 120 - side * 66;
  const stem = ctx.green(0);
  disc(ctx, 120, 180, 94, 104, [body]);
  ctx.line(fx, 340, fx + side * 8, 270, stem, 4);
  ctx.poly([[fx - 26, 236], [fx + 26, 236], [fx + 8, 276], [fx - 8, 276]], ctx.col(3), still);
  ctx.ellipse(fx, 236, 26, 6, ctx.col(6), 0);
  oval(ctx, 120 + side * 14, 190, 42, 22, (b, i) => (i === 1 ? ctx.col(0) : body), { rot: side * 0.5, bands: 4 });
  ctx.circ(120 + side * 52, 168, 16, body);
  ctx.poly([[120 + side * 64, 164], [120 + side * 126, 150 - 2], [120 + side * 64, 172]], ctx.ink, still);
  ctx.circ(120 + side * 56, 164, 3, ctx.ink);
  ctx.poly([[120 - side * 20, 206], [120 - side * 70, 250], [120 - side * 62, 262], [120 - side * 14, 214]], ctx.col(4), still);
  for (let i = 0; i < 3; i++) {
    const a = -2 + i * 0.3;
    const r = ctx.between(76, 100);
    const sx = 120 + side * 2;
    ctx.poly([[sx, 178], [sx + side * r * Math.cos(a), 178 + r * Math.sin(a)], [sx + side * 54 * Math.cos(a + 0.4), 178 + 54 * Math.sin(a + 0.4)]], ctx.col(5 + i), { inset: 1 });
  }
  return 'hummingbird';
}

function flamingo(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const pink = ctx.col(6);
  const deep = ctx.col(3);
  disc(ctx, 120, 180, 94, 104, [pink, deep]);
  ctx.ellipse(120, 334, 78, 10, ctx.col(5), 0);
  const kx = 120 + side * 10;
  ctx.line(120, 238, kx, 296, deep, 5);
  ctx.line(kx, 296, kx - side * 10, 332, deep, 5);
  ctx.line(120 + side * 24, 238, 120 + side * 36, 270, deep, 5);
  oval(ctx, 112, 216, 52, 30, (b, i) => (i === 1 ? deep : pink), { rot: -side * 0.1 });
  ctx.poly([[112 - side * 44, 214], [112 - side * 78, 250], [112 - side * 30, 236]], deep, { inset: 1 });
  const hx = 120 + side * 54;
  ctx.stroke(`M${120 + side * 30} 200 C${120 + side * 74} 190 ${120 + side * 16} 130 ${hx} 100`, pink, 12, 120 + side * 40, 150, [100, 90, 180, 210]);
  ctx.circ(hx, 94, 13, pink);
  ctx.poly([[hx + side * 8, 90], [hx + side * 32, 100], [hx + side * 22, 114], [hx + side * 6, 104]], ctx.ink, still);
  ctx.circ(hx + side * 2, 90, 3, ctx.ink);
  return 'flamingo';
}

function snail(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const shell = ctx.int(0, 7);
  const slug = ctx.col(ctx.pick([0, 7, 6]));
  ctx.circ(ctx.between(60, 180), ctx.between(80, 120), ctx.between(24, 34), ctx.col(ctx.int(0, 7) + 4));
  ctx.poly([[10, 336], [230, 336], [230, 346], [10, 346]], ctx.green(1), still);
  ctx.poly([[120 - side * 80, 330], [120 + side * 76, 330], [120 + side * 92, 300], [120 + side * 86, 262], [120 + side * 70, 300], [120 - side * 56, 300]], slug, { inset: 1, still: true });
  for (const s of [-1, 1]) {
    const x = 120 + side * 86 + s * 4;
    ctx.line(x, 270, x + side * 14 + s * 10, 226, slug, 4);
    ctx.circ(x + side * 14 + s * 10, 224, 5, ctx.ink);
  }
  const rings = ctx.int(4, 5);
  // The shell rests on the body, largest ring first so the smaller ones show on top of it.
  for (let i = 0; i <= rings; i++) ctx.circ(120 - side * 6 + i * 2 * side, 250 - i * 3, 56 - i * 9, ctx.col(shell + (i % 2 ? 3 : 0)));
  ctx.circ(120 - side * 6 + rings * 2 * side, 250 - rings * 3, 5, ctx.ink);
  return 'snail';
}

function bee(ctx) {
  const rot = ctx.between(-0.4, 0.4);
  ctx.circ(120, 190, ctx.between(100, 108), ctx.col(ctx.int(0, 7) + 4));
  for (const s of [-1, 1]) ctx.ellipse(120 + s * 44, 150, 26, 50, ctx.colors[1] === '#FFFFFF' ? ctx.col(5) : ctx.col(5), s * 0.6);
  oval(ctx, 120, 214, 64, 48, (b) => (b % 2 ? ctx.ink : ctx.col(0)), { rot: Math.PI / 2 + rot, bands: 7 });
  ctx.circ(120, 130, 28, ctx.ink);
  for (const s of [-1, 1]) {
    ctx.circ(120 + s * 12, 128, 6, ctx.colors[1]);
    ctx.line(120 + s * 10, 108, 120 + s * 28, 78, ctx.ink, 3);
    ctx.circ(120 + s * 28, 76, 4, ctx.ink);
  }
  ctx.poly([[116, 292], [124, 292], [120, 316]], ctx.ink, still);
  return 'bee';
}

function deer(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const coat = ctx.col(ctx.pick([0, 3, 4]));
  disc(ctx, 120, 180, 96, 106, [coat]);
  for (const dx of [-36, -22, 24, 38]) ctx.line(120 + dx, 252, 120 + dx + ctx.between(-4, 4), 336, coat, 7);
  oval(ctx, 120, 236, 62, 32, (b, i) => (i === 2 ? ctx.colors[1] : coat), { bands: 5 });
  const nx = 120 + side * 40;
  ctx.poly([[nx - 12, 230], [nx + 12, 224], [nx + side * 26, 130], [nx + side * 6, 134]], coat, still);
  oval(ctx, nx + side * 34, 124, 22, 13, () => coat, { rot: side * -0.4, bands: 3 });
  ctx.circ(nx + side * 40, 120, 3, ctx.ink);
  ctx.circ(nx + side * 54, 128, 4.5, ctx.ink);
  const branch = (x, y, a, len, d) => {
    const [x2, y2] = pol(x, y, len, a);
    ctx.line(x, y, x2, y2, ctx.col(4), 4 - (2 - d) * 0.5);
    if (d > 0) {
      branch(x2, y2, a - 0.5, len * 0.62, d - 1);
      branch(x2, y2, a + 0.4, len * 0.7, d - 1);
    }
  };
  for (const s of [-1, 1]) branch(nx + side * 28 + s * 4, 112, -Math.PI / 2 + s * 0.5, 28, 2);
  for (let i = 0; i < 7; i++) ctx.circ(120 + ctx.between(-46, 46), ctx.between(222, 246), 2.8, ctx.colors[1]);
  return 'deer';
}

function peacock(ctx) {
  const n = ctx.int(11, 15);
  const hue = ctx.int(0, 7);
  const base = [120, 252];
  const len = ctx.between(108, 118);
  ctx.circ(120, 200, ctx.between(104, 110), ctx.col(hue + 4));
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * (1.9 / (n - 1));
    const [x, y] = pol(base[0], base[1], len * 0.62, a);
    const [x2, y2] = pol(base[0], base[1], len * 0.98, a);
    const svg = `<ellipse cx="${fmt(x)}" cy="${fmt(y)}" rx="${fmt(len * 0.17)}" ry="${fmt(len * 0.4)}" fill="${ctx.col(hue + (i % 2) * 2)}" transform="rotate(${fmt((a * 180) / Math.PI + 90)} ${fmt(x)} ${fmt(y)})"/><circle cx="${fmt(x2)}" cy="${fmt(y2)}" r="9" fill="${ctx.col(hue + 3)}"/><circle cx="${fmt(x2)}" cy="${fmt(y2)}" r="4.4" fill="${ctx.ink}"/>`;
    ctx.raw(svg, x, y, [Math.min(x, x2) - 22, Math.min(y, y2) - 22, Math.max(x, x2) + 22, Math.max(y, y2) + 22]);
  }
  oval(ctx, 120, 288, 26, 46, (b, i) => (i % 2 ? ctx.col(5) : ctx.col(2)), { rot: Math.PI / 2, bands: 4 });
  ctx.stroke('M120 262 Q126 232 120 220', ctx.col(2), 10, 122, 240, [112, 218, 130, 264]);
  ctx.circ(120, 214, 10, ctx.col(2));
  ctx.poly([[116, 206], [118, 190], [120, 204], [122, 188], [124, 206]], ctx.col(0), { inset: 1 });
  ctx.poly([[128, 214], [140, 218], [128, 220]], ctx.col(0), still);
  return 'peacock';
}

function frog(ctx) {
  const skin = ctx.green(ctx.int(0, 3));
  disc(ctx, 120, 190, 100, 108, [skin]);
  ctx.ellipse(120, 318, 94, 20, ctx.green(1), 0);
  for (const s of [-1, 1]) {
    ctx.ellipse(120 + s * 66, 296, 30, 16, skin, s * 0.3);
    ctx.ellipse(120 + s * 76, 322, 22, 8, skin, 0);
  }
  oval(ctx, 120, 240, 66, 64, (b, i) => (i === 2 ? ctx.col(0) : skin), { rot: Math.PI / 2, bands: 5 });
  for (const s of [-1, 1]) {
    ctx.circ(120 + s * 34, 170, 24, skin);
    ctx.circ(120 + s * 34, 168, 15, ctx.colors[1]);
    ctx.circ(120 + s * 34, 170, 7, ctx.ink);
  }
  ctx.stroke('M80 232 Q120 262 160 232', ctx.ink, 4, 120, 244, [80, 230, 160, 252]);
  for (const s of [-1, 1]) ctx.circ(120 + s * 10, 214, 2.6, ctx.ink);
  const fx = ctx.pick([40, 196]);
  ctx.circ(fx, 110, 5, ctx.ink);
  ctx.ellipse(fx - 8, 104, 8, 4, ctx.colors[1], -0.5);
  return 'frog';
}

function origamiCrane(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const a = ctx.col(ctx.int(0, 7));
  const b = ctx.col(ctx.int(0, 7) + 3);
  const c = ctx.col(ctx.int(0, 7) + 5);
  const lift = ctx.between(0, 30);
  disc(ctx, 120, 190, 100, 108, [a, b, c]);
  const P = (pts) => pts.map(([x, y]) => [120 + side * x, y]);
  ctx.poly(P([[-8, 214 - lift * 0.2], [-62, 112 - lift], [28, 196]]), b, still);
  ctx.poly(P([[-8, 214 - lift * 0.2], [-62, 112 - lift], [-30, 176]]), c, still);
  ctx.poly(P([[-62, 232], [-14, 214], [34, 232], [-14, 276]]), a, still);
  ctx.poly(P([[-62, 232], [-14, 214], [-14, 276]]), c, still);
  ctx.poly(P([[34, 232], [-14, 214], [8, 196]]), b, still);
  ctx.poly(P([[-62, 232], [-104, 258], [-52, 250]]), a, still);
  ctx.poly(P([[34, 232], [62, 164], [72, 172], [48, 244]]), a, still);
  ctx.poly(P([[62, 164], [96, 150], [72, 172]]), b, still);
  ctx.poly(P([[10, 218], [92, 128 - lift], [40, 230]]), a, still);
  ctx.poly(P([[10, 218], [92, 128 - lift], [60, 196]]), c, still);
  ctx.ellipse(120, 326, 70, 8, ctx.col(5), 0);
  return 'origami crane';
}

module.exports = { elephant, giraffe, octopus, jellyfish, hummingbird, flamingo, snail, bee, deer, peacock, frog, origamiCrane };
