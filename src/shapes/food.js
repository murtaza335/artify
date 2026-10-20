'use strict';

// Food: a fruit bowl, watermelon, sushi, pizza, ice cream, a cupcake, citrus slices, a pineapple, a layered cake
// and a breakfast plate.

const { TAU, fmt, pol, slice, interpolate, rectPts, arcBand, radial } = require('./engine');

const R = rectPts;

function fruitBowl(ctx) {
  const rim = ctx.between(250, 262);
  ctx.circ(120, 168, ctx.between(92, 104), ctx.col(ctx.int(0, 7)));
  const n = ctx.int(5, 8);
  const fruits = Array.from({ length: n }, (_, i) => ({
    x: 120 + (i - (n - 1) / 2) * (140 / (n - 1)) + ctx.between(-5, 5),
    y: rim - 20 - (i % 2) * 24 - ctx.between(0, 10),
    r: ctx.between(19, 27),
    c: ctx.pick([3, 0, 6, 7, 5, 2])
  }));
  fruits.sort((a, b) => a.y - b.y).forEach((f, i) => {
    ctx.circ(f.x, f.y, f.r, ctx.col(f.c));
    ctx.circ(f.x - f.r * 0.35, f.y - f.r * 0.35, f.r * 0.2, ctx.colors[1]);
    ctx.line(f.x, f.y - f.r, f.x + 3, f.y - f.r - 9, ctx.col(4), 3);
    ctx.ellipse(f.x + 9, f.y - f.r - 5, 8, 3.5, ctx.green(i), -0.5);
  });
  slice(ctx, interpolate([[0, 84], [1, 30]]), (t, b) => [120 + b, rim + t * 70], { bands: 4, big: 20, loosePct: 0.05, skipPct: 0 });
  ctx.poly(R(30, rim - 5, 180, 10), ctx.col(2), { inset: 1, still: true });
  ctx.poly(R(70, rim + 70, 100, 8), ctx.col(4), { inset: 1, still: true });
  return 'fruit bowl';
}

function watermelon(ctx) {
  const cx = 120;
  const cy = ctx.between(150, 170);
  const R0 = 92;
  const rind = ctx.green(0);
  ctx.shape(`M${cx - R0} ${cy} A${R0} ${R0} 0 0 0 ${cx + R0} ${cy} Z`, rind, cx, cy + 40, [cx - R0, cy, cx + R0, cy + R0]);
  ctx.shape(`M${cx - R0 + 8} ${cy} A${R0 - 8} ${R0 - 8} 0 0 0 ${cx + R0 - 8} ${cy} Z`, ctx.colors[1], cx, cy + 40, [cx - R0 + 8, cy, cx + R0 - 8, cy + R0 - 8]);
  const flesh = ctx.col(3);
  const steps = ctx.int(5, 7);
  for (let i = 0; i < steps; i++) {
    const a0 = (i * Math.PI) / steps;
    const a1 = ((i + 1) * Math.PI) / steps;
    ctx.poly(arcBand(cx, cy, 8, R0 - 14, a0, a1), i % 2 ? flesh : ctx.col(6), { inset: 0.97 });
  }
  for (let i = 0; i < 7; i++) {
    const [x, y] = pol(cx, cy, ctx.between(26, 62), ctx.between(0.25, Math.PI - 0.25));
    ctx.ellipse(x, y, 3, 5.5, ctx.ink, ctx.between(0, 3));
  }
  const sx = ctx.pick([36, 190]);
  ctx.shape(`M${sx} 296 L${sx + 20} 296 L${sx + 10} 318 Z`, flesh, sx + 10, 304, [sx, 296, sx + 20, 318]);
  ctx.circ(ctx.between(40, 200), ctx.between(84, 100), ctx.between(8, 14), ctx.col(0));
  return 'watermelon';
}

function sushi(ctx) {
  ctx.poly(R(18, 70, 204, 270), ctx.col(4), { inset: 1, still: true });
  const n = ctx.int(2, 3);
  for (let k = 0; k < n; k++) {
    const y = 110 + k * (220 / n);
    const type = ctx.int(0, 2);
    ctx.shape(`M46 ${y} h148 a14 14 0 0 1 14 14 v22 a14 14 0 0 1 -14 14 h-148 a14 14 0 0 1 -14 -14 v-22 a14 14 0 0 1 14 -14 Z`, ctx.colors[1], 120, y + 25, [32, y, 208, y + 50]);
    if (type === 0) {
      ctx.shape(`M42 ${y - 4} h156 q8 0 8 10 v6 q-40 14 -80 10 q-50 4 -92 -8 v-8 q0 -10 8 -10 Z`, ctx.col(3), 120, y + 8, [34, y - 4, 206, y + 24]);
      ctx.poly(R(70, y - 1, 8, 20), ctx.colors[1], { inset: 1, still: true });
      ctx.poly(R(150, y - 1, 8, 20), ctx.colors[1], { inset: 1, still: true });
    } else if (type === 1) {
      ctx.poly(R(38, y - 2, 164, 12), ctx.col(0), { inset: 1, still: true });
      ctx.poly(R(104, y + 10, 32, 36), ctx.ink, { inset: 1, still: true });
    } else {
      ctx.ellipse(120, y + 8, 78, 11, ctx.col(6), 0);
      ctx.circ(ctx.between(80, 160), y + 8, 5, ctx.green(1));
    }
  }
  ctx.circ(ctx.pick([44, 196]), 82, 8, ctx.green(2));
  ctx.line(ctx.between(30, 70), 56, ctx.between(150, 200), 64, ctx.col(0), 4);
  return 'sushi';
}

function pizza(ctx) {
  const cx = 120;
  const cy = ctx.between(170, 190);
  const r = 96;
  const slices = ctx.int(6, 8);
  const gap = ctx.between(0, 0.35);
  const toppings = [ctx.col(3), ctx.col(7), ctx.col(4), ctx.col(6)];
  for (let i = 0; i < slices; i++) {
    const a0 = (i * TAU) / slices + gap * 0.05;
    const a1 = ((i + 1) * TAU) / slices - gap * 0.05;
    const push = i === 0 ? ctx.between(10, 22) : 0;
    const am = (a0 + a1) / 2;
    const [ox, oy] = [Math.cos(am) * push, Math.sin(am) * push];
    ctx.poly(arcBand(cx + ox, cy + oy, 0, r, a0, a1).slice(0, -1), ctx.col(0), { inset: 1, still: true });
    ctx.poly(arcBand(cx + ox, cy + oy, 0, r - 12, a0 + 0.02, a1 - 0.02).slice(0, -1), ctx.colors[1] === '#FFFFFF' ? ctx.col(6) : ctx.col(6), { inset: 1, still: true });
    const [tx, ty] = pol(cx + ox, cy + oy, r * ctx.between(0.35, 0.65), am);
    ctx.circ(tx, ty, ctx.between(7, 10), toppings[i % 4]);
  }
  ctx.circ(cx, cy, 10, ctx.col(3));
  return 'pizza';
}

function iceCream(ctx) {
  const cx = 120;
  const coneTop = 210;
  ctx.shape(`M${cx - 44} ${coneTop} L${cx + 44} ${coneTop} L${cx} 346 Z`, ctx.col(0), cx, 270, [cx - 44, coneTop, cx + 44, 346]);
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) / 5;
    const y = coneTop + t * 136;
    const w = 44 * (1 - t);
    ctx.line(cx - w, y, cx + w, y - 22 * (1 - t) * 0.6, ctx.col(4), 2);
  }
  const scoops = ctx.int(2, 3);
  for (let k = 0; k < scoops; k++) {
    const y = coneTop - 8 - k * 52;
    const r = 46 - k * 4;
    ctx.circ(cx + ctx.between(-5, 5), y - 30, r, ctx.col(k * 3 + ctx.int(0, 2)));
    ctx.shape(`M${cx - r} ${y - 24} q${r / 4} 22 ${r / 2} 8 q${r / 4} 22 ${r / 2} 4 q${r / 4} 20 ${r / 2} 4 q${r / 4} 16 ${r / 2} -6 Z`, ctx.col(k * 3 + 1), cx, y - 14, [cx - r, y - 24, cx + r, y + 8]);
  }
  const topY = coneTop - 8 - (scoops - 1) * 52 - 30 - 46;
  ctx.circ(cx, topY - 6, 11, ctx.col(3));
  ctx.line(cx, topY - 14, cx + 12, topY - 30, ctx.green(0), 3);
  for (let i = 0; i < 5; i++) ctx.circ(ctx.between(60, 180), ctx.between(topY + 20, coneTop - 30), 2.6, ctx.colors[1]);
  return 'ice cream';
}

function cupcake(ctx) {
  const cx = 120;
  const base = 340;
  const liner = ctx.col(ctx.int(2, 6));
  const stripe = ctx.int(4, 6);
  ctx.shape(`M62 232 L178 232 L156 ${base} L84 ${base} Z`, liner, cx, 286, [62, 232, 178, base]);
  for (let i = 1; i < stripe; i++) {
    const t = i / stripe;
    ctx.line(62 + 116 * t, 232, 84 + 72 * t, base, ctx.colors[1], 3);
  }
  const tiers = ctx.int(3, 4);
  for (let k = 0; k < tiers; k++) {
    const w = 78 - k * 15;
    const y = 232 - k * 30;
    ctx.shape(`M${cx - w} ${y} Q${cx - w - 8} ${y - 22} ${cx - w / 2} ${y - 28} Q${cx} ${y - 36} ${cx + w / 2} ${y - 28} Q${cx + w + 8} ${y - 22} ${cx + w} ${y} Z`, ctx.col(k * 2 + 1), cx, y - 14, [cx - w - 8, y - 36, cx + w + 8, y]);
  }
  const topY = 232 - tiers * 30;
  ctx.circ(cx, topY - 10, 13, ctx.col(3));
  ctx.line(cx, topY - 22, cx + 8, topY - 38, ctx.green(1), 3);
  for (let i = 0; i < 8; i++) ctx.circ(ctx.between(70, 170), ctx.between(topY + 6, 226), 2.8, ctx.pick([ctx.colors[1], ctx.col(0), ctx.col(5)]));
  return 'cupcake';
}

function citrusSlices(ctx) {
  const n = ctx.int(2, 3);
  for (let k = 0; k < n; k++) {
    const cx = ctx.pick([84, 156, 120]) + (k - 1) * 4;
    const cy = 100 + k * (n === 2 ? 120 : 82) + ctx.between(-6, 6);
    const r = ctx.between(54, 64);
    const rind = ctx.col(ctx.int(0, 7) + k * 3);
    ctx.circ(cx, cy, r, rind);
    ctx.circ(cx, cy, r - 7, ctx.colors[1]);
    const seg = ctx.int(7, 9);
    for (let i = 0; i < seg; i++) {
      const a0 = (i * TAU) / seg;
      ctx.poly(arcBand(cx, cy, 5, r - 11, a0 + 0.04, a0 + TAU / seg - 0.04), rind, { inset: 1, still: true });
    }
    ctx.circ(cx, cy, 5, ctx.colors[1]);
  }
  ctx.ellipse(ctx.pick([46, 194]), ctx.between(310, 330), 16, 7, ctx.green(0), ctx.between(-0.6, 0.6));
  return 'citrus slices';
}

function pineapple(ctx) {
  const cx = 120;
  const body = ctx.col(ctx.pick([0, 0, 3]));
  const hw = interpolate([[0, 40], [0.1, 62], [0.5, 66], [0.9, 58], [1, 44]]);
  slice(ctx, hw, (t, b) => [cx + b, 150 + t * 190], { bands: 6, big: 20, loosePct: 0.08, skipPct: 0, color: (b, i) => (b % 2 ? body : ctx.col(4 + i)) });
  for (let i = 0; i < 12; i++) {
    const x = cx + ctx.between(-46, 46);
    const y = ctx.between(180, 320);
    ctx.shape(`M${fmt(x)} ${fmt(y - 6)} L${fmt(x + 6)} ${fmt(y)} L${fmt(x)} ${fmt(y + 6)} L${fmt(x - 6)} ${fmt(y)} Z`, ctx.col(4), x, y, [x - 6, y - 6, x + 6, y + 6]);
  }
  const leaves = ctx.int(5, 7);
  for (let i = 0; i < leaves; i++) {
    const a = -Math.PI / 2 + (i - (leaves - 1) / 2) * 0.36;
    const [tx, ty] = pol(cx, 156, ctx.between(86, 118), a);
    const [lx, ly] = pol(cx, 156, 14, a - 0.3);
    const [rx, ry] = pol(cx, 156, 14, a + 0.3);
    ctx.poly([[lx, ly], [tx, ty], [rx, ry]], ctx.green(i), { inset: 1 });
  }
  return 'pineapple';
}

function layeredCake(ctx) {
  const cx = 120;
  const tiers = ctx.int(3, 4);
  const h = ctx.between(34, 42);
  let y = 336;
  ctx.poly(R(26, 336, 188, 10), ctx.col(2), { inset: 1, still: true });
  for (let k = 0; k < tiers; k++) {
    const w = 96 - k * 14;
    const c = ctx.col(k * 2 + ctx.int(0, 1));
    ctx.poly(R(cx - w, y - h, w * 2, h), c, { inset: 1, still: true });
    ctx.shape(`M${cx - w} ${y - h} h${w * 2} v6 q-${w / 4} 14 -${w / 2} 4 q-${w / 4} 14 -${w / 2} 2 q-${w / 4} 14 -${w / 2} 0 q-${w / 4} 12 -${w / 2} -6 Z`, ctx.colors[1], cx, y - h + 6, [cx - w, y - h, cx + w, y - h + 18]);
    y -= h;
  }
  ctx.line(cx, y, cx, y - 28, ctx.col(4), 3);
  ctx.ellipse(cx, y - 36, 6, 10, ctx.col(0), 0);
  for (let i = 0; i < tiers + 2; i++) ctx.circ(ctx.between(60, 180), y + ctx.between(6, 20), 6, ctx.col(3 + i));
  return 'layered cake';
}

function breakfast(ctx) {
  ctx.circ(120, 196, 106, ctx.colors[1]);
  ctx.circ(120, 196, 84, ctx.col(ctx.int(2, 6)));
  const egg = ctx.int(0, 1);
  if (egg) {
    ctx.shape('M70 160 Q56 120 100 112 Q150 100 168 138 Q184 178 140 188 Q120 212 90 196 Q60 190 70 160 Z', ctx.colors[1], 118, 154, [56, 100, 184, 212]);
    ctx.circ(118, 152, 22, ctx.col(0));
    ctx.circ(110, 144, 6, ctx.colors[1]);
  } else {
    ctx.poly(R(60, 120, 92, 70), ctx.col(0), { inset: 1, still: true });
    ctx.poly(R(70, 130, 72, 50), ctx.col(7), { inset: 1, still: true });
  }
  ctx.shape('M62 250 q30 -34 70 -6 q30 -22 48 10 q-60 20 -118 -4 Z', ctx.col(3), 120, 244, [62, 226, 180, 258]);
  ctx.shape('M70 214 q50 -16 100 4 l-6 14 q-44 -14 -90 -2 Z', ctx.col(8 - 4), 120, 220, [66, 202, 170, 232]);
  for (let i = 0; i < 6; i++) ctx.circ(ctx.between(150, 190), ctx.between(150, 230), 6, ctx.col(3));
  const cx = ctx.pick([44, 196]);
  ctx.shape(`M${cx - 18} 322 L${cx + 18} 322 L${cx + 12} 360 L${cx - 12} 360 Z`, ctx.col(6), cx, 340, [cx - 18, 322, cx + 18, 360]);
  ctx.poly(R(cx - 20, 316, 40, 6), ctx.colors[1], { inset: 1, still: true });
  return 'breakfast';
}

module.exports = { fruitBowl, watermelon, sushi, pizza, iceCream, cupcake, citrusSlices, pineapple, layeredCake, breakfast };
