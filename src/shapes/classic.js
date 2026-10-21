'use strict';

// The first set of forms: vases, a flower, a city, a fish, trees, a rocket, mountains, a gem and a tile mosaic.

const { TAU, fmt, pol, slice, interpolate } = require('./engine');

const VESSEL_PROFILES = [
  [[0, 18], [0.18, 12], [0.3, 16], [0.5, 56], [0.7, 46], [0.85, 22], [0.92, 30], [1, 48]],
  [[0, 10], [0.3, 10], [0.38, 34], [0.7, 50], [0.95, 50], [1, 46]],
  [[0, 34], [0.1, 28], [0.2, 22], [0.4, 52], [0.65, 46], [0.85, 24], [0.9, 40], [1, 44]],
  [[0, 40], [0.25, 20], [0.5, 8], [0.75, 22], [1, 44]],
  [[0, 56], [0.3, 46], [0.6, 24], [0.85, 16], [1, 40]]
];

// Vessels use either a hand-drawn profile or a random one, so the silhouette is never the same twice.
function vessel(ctx) {
  const TOP = 46;
  const H = 300;
  const C = 120;
  let points;
  if (ctx.rand() < 0.3) {
    points = ctx.pick(VESSEL_PROFILES);
  } else {
    const count = ctx.int(5, 9);
    const ts = [0, ...Array.from({ length: count - 2 }, () => ctx.rand()).sort((a, b) => a - b), 1];
    points = ts.map((t, i) => [t, i === 0 ? ctx.between(6, 40) : ctx.between(8, 58)]);
  }
  const scale = ctx.between(0.85, 1.15);
  const base = interpolate(points);
  const hw = (t) => base(t) * scale;
  const map = (t, b) => [C + b, TOP + t * H];

  // Splash crown above the neck.
  const spikes = ctx.int(6, 9);
  const cw = hw(0) * 1.2 + 8;
  const crown = [];
  for (let i = 0; i <= spikes * 2; i++) {
    const x = C - cw + (2 * cw * i) / (spikes * 2);
    const y = i % 2 === 0 ? TOP + 6 - ctx.between(14, 50) : TOP + 2 + ctx.rand() * 4;
    crown.push([x, y]);
  }
  crown.push([C + cw, TOP + 10], [C - cw, TOP + 10]);
  ctx.poly(crown, ctx.colors[1], { inset: 1, still: true });

  slice(ctx, hw, map);

  if (ctx.rand() < 0.4) {
    for (const side of [-1, 1]) {
      const t = ctx.between(0.15, 0.4);
      const x = C + side * hw(t);
      const y = TOP + t * H;
      const reach = ctx.between(26, 42);
      const drop = ctx.between(40, 70);
      ctx.stroke(
        `M${fmt(x)} ${fmt(y)} C${fmt(x + side * reach)} ${fmt(y - 10)} ${fmt(x + side * reach)} ${fmt(y + drop)} ${fmt(x)} ${fmt(y + drop - 6)}`,
        ctx.col(5), 7, x + side * reach * 0.6, y + drop / 2, [Math.min(x, x + side * reach), y - 6, Math.max(x, x + side * reach), y + drop]
      );
    }
  }

  // Cracks as short random walks inside the silhouette.
  let d = '';
  for (let c = 0; c < 3; c++) {
    const t = ctx.between(0.25, 0.8);
    let x = C + (ctx.rand() - 0.5) * hw(t) * 1.2;
    let y = TOP + t * H;
    d += `M${fmt(x)} ${fmt(y)} `;
    for (let s = 0; s < 3; s++) {
      x += (ctx.rand() - 0.5) * 36;
      y += 10 + ctx.rand() * 18;
      d += `L${fmt(x)} ${fmt(y)} `;
    }
  }
  ctx.extra.push(`<path class="f" d="${d.trim()}" fill="none" stroke="${ctx.crack}" stroke-width="1.5"/>`);
  return 'vase';
}

function flower(ctx) {
  const cx = ctx.between(105, 135);
  const cy = ctx.between(110, 135);
  const n = ctx.int(5, 12);
  const R = ctx.between(52, 70);
  const rc = ctx.between(14, 24);
  const rot = ctx.rand() * TAU;

  const segment = (340 - (cy + R * 0.4)) / 3;
  for (let i = 0; i < 3; i++) {
    const y0 = cy + R * 0.4 + i * segment;
    const sway = (i - 1) * ctx.between(2, 7);
    ctx.poly([[cx - 3 + sway, y0], [cx + 3 + sway, y0], [cx + 3 - sway, y0 + segment], [cx - 3 - sway, y0 + segment]], ctx.green(0), { inset: 1 });
  }
  for (const side of [-1, 1]) {
    const y = ctx.between(cy + R + 20, 320);
    const len = ctx.between(34, 52);
    ctx.poly([[cx, y], [cx + side * len, y - ctx.between(12, 26)], [cx + side * (len + 6), y + 4], [cx, y + 12]], ctx.green(1), { loose: ctx.rand() < 0.3 });
  }

  const half = (TAU / n) * 0.42;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    ctx.poly([pol(cx, cy, rc * 0.6, a), pol(cx, cy, R * 0.58, a - half), pol(cx, cy, R, a), pol(cx, cy, R * 0.58, a + half)], ctx.col(i % 2 ? 3 : 6), { loose: ctx.rand() < 0.15, inset: 0.94 });
  }
  ctx.circ(cx, cy, rc, ctx.col(0));
  ctx.circ(cx, cy, rc * 0.4, ctx.col(4));
  return 'flower';
}

function tower(ctx) {
  const m = ctx.int(5, 8);
  const weights = Array.from({ length: m }, () => 0.7 + ctx.rand());
  const total = weights.reduce((a, b) => a + b, 0);
  const base = 346;
  let x = 16;
  for (let b = 0; b < m; b++) {
    const w = (weights[b] / total) * 208;
    const h = ctx.between(70, 250);
    const floors = ctx.int(2, 4);
    const fh = h / floors;
    for (let f = 0; f < floors; f++) {
      const y1 = base - f * fh;
      ctx.poly([[x + 1, y1 - fh + 1], [x + w - 1, y1 - fh + 1], [x + w - 1, y1], [x + 1, y1]], ctx.col(b * 2 + f), { inset: 1 });
      if (ctx.rand() < 0.5) ctx.circ(x + w / 2, y1 - fh / 2, Math.min(3, w / 6), ctx.colors[1]);
    }
    const top = base - h;
    const roof = ctx.rand();
    if (roof < 0.4) {
      ctx.poly([[x + 1, top], [x + w - 1, top], [x + w / 2, top - w * ctx.between(0.4, 0.9)]], ctx.col(b * 2 + 5), { inset: 1 });
    } else if (roof < 0.7) {
      const r = w / 2 - 1;
      ctx.shape(`M${fmt(x + 1)} ${fmt(top)} A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x + w - 1)} ${fmt(top)} Z`, ctx.col(b * 2 + 5), x + w / 2, top - r / 2, [x, top - r, x + w, top]);
    } else {
      const ah = ctx.between(14, 34);
      ctx.poly([[x + w / 2 - 1.5, top - ah], [x + w / 2 + 1.5, top - ah], [x + w / 2 + 1.5, top], [x + w / 2 - 1.5, top]], ctx.col(b + 3), { inset: 1 });
    }
    x += w;
  }
  return 'city';
}

function fish(ctx) {
  const x0 = ctx.between(24, 40);
  const L = ctx.between(110, 140);
  const cy = ctx.between(170, 210);
  const amp = ctx.between(34, 54);
  const tilt = ctx.between(-0.35, 0.35);
  const mx = x0 + L / 2;
  const R = (x, y) => {
    const dx = x - mx;
    const dy = y - cy;
    return [mx + dx * Math.cos(tilt) - dy * Math.sin(tilt), cy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  };
  const hw = (t) => amp * Math.pow(Math.sin(Math.PI * Math.min(0.98, Math.max(0.02, t))), 0.75) * (1.1 - 0.3 * t);
  slice(ctx, hw, (t, b) => R(x0 + t * L, cy + b), { bands: ctx.int(5, 8), big: 14, skipPct: 0.04 });

  const tx = x0 + L - 4;
  const reach = ctx.between(30, 44);
  const spread = ctx.between(22, 38);
  const mid = ctx.between(18, 26);
  ctx.poly([R(tx, cy), R(tx + reach, cy - spread), R(tx + mid, cy)], ctx.col(3), { loose: ctx.rand() < 0.3 });
  ctx.poly([R(tx, cy), R(tx + mid, cy), R(tx + reach, cy + spread)], ctx.col(0), { loose: ctx.rand() < 0.3 });
  const fh = ctx.between(22, 34);
  ctx.poly([R(x0 + L * 0.3, cy - hw(0.3)), R(x0 + L * 0.58, cy - hw(0.55)), R(x0 + L * 0.42, cy - hw(0.42) - fh)], ctx.col(6));
  const eye = R(x0 + L * 0.15, cy - 3);
  ctx.circ(eye[0], eye[1], 4, ctx.ink);
  for (let i = 0; i < 3; i++) ctx.circ(x0 - ctx.between(6, 18) - i * 8, cy - 14 - i * 16 - ctx.rand() * 6, ctx.between(2, 5), ctx.col(5));
  return 'fish';
}

function tree(ctx) {
  const tw = ctx.between(10, 16);
  // The trunk reaches up into the canopy, so the crown never floats above it.
  ctx.poly([[120 - tw / 2, 200], [120 + tw / 2, 200], [120 + tw / 2, 273], [120 - tw / 2, 273]], ctx.col(4), { inset: 1 });
  ctx.poly([[120 - tw / 2, 273], [120 + tw / 2, 273], [120 + tw / 2, 346], [120 - tw / 2, 346]], ctx.col(0), { inset: 1 });
  if (ctx.rand() < 0.4) {
    const count = ctx.int(4, 6);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + ctx.rand();
      const d = ctx.between(10, 44);
      ctx.circ(120 + Math.cos(a) * d, 170 + Math.sin(a) * d * 1.2, ctx.between(28, 44), ctx.green(i));
    }
    return 'tree';
  }
  const layers = ctx.int(4, 6);
  const step = 196 / layers;
  for (let i = 0; i < layers; i++) {
    const ytop = 48 + i * step;
    const hw = 22 + i * ctx.between(10, 14);
    const base = ytop + step * 1.7;
    ctx.poly([[120, ytop], [120 - hw, base], [120, base]], ctx.green(i), { inset: 1 });
    ctx.poly([[120, ytop], [120, base], [120 + hw, base]], ctx.green(i + 2), { inset: 1 });
  }
  return 'pine';
}

function rocket(ctx) {
  const TOP = 40;
  const H = 270;
  const amp = ctx.between(22, 32);
  const hw = interpolate([[0, 0], [0.2, amp * 0.6], [0.38, amp], [0.85, amp], [1, amp * 0.8]]);
  slice(ctx, hw, (t, b) => [120 + b, TOP + t * H], { bands: ctx.int(5, 7), big: 12, skipPct: 0.03 });
  const finTop = TOP + H * ctx.between(0.62, 0.72);
  for (const side of [-1, 1]) {
    ctx.poly([[120 + side * amp, finTop], [120 + side * (amp + ctx.between(26, 40)), TOP + H + 18], [120 + side * amp, TOP + H]], ctx.col(3), { loose: ctx.rand() < 0.25 });
  }
  ctx.circ(120, TOP + H * 0.42, ctx.between(8, 11), ctx.colors[1]);
  const flames = ctx.int(2, 3);
  for (let i = 0; i < flames; i++) {
    const x = 120 + (i - (flames - 1) / 2) * 14;
    ctx.poly([[x - 7, TOP + H + 2], [x + 7, TOP + H + 2], [x, TOP + H + ctx.between(26, 42)]], ctx.col(i ? 0 : 3));
  }
  return 'rocket';
}

function mountains(ctx) {
  const base = 340;
  ctx.circ(ctx.between(50, 190), ctx.between(58, 100), ctx.between(20, 34), ctx.col(0));
  const m = ctx.int(3, 5);
  const peaks = Array.from({ length: m }, () => ({ cx: ctx.between(36, 204), h: ctx.between(90, 230), w: ctx.between(70, 110) })).sort((a, b) => b.h - a.h);
  peaks.forEach((p, i) => {
    const l = Math.max(4, p.cx - p.w);
    const r = Math.min(236, p.cx + p.w);
    const ridge = p.cx + ctx.between(-10, 10);
    const peak = [p.cx, base - p.h];
    ctx.poly([peak, [l, base], [ridge, base]], ctx.col(i * 2 + 2), { inset: 1 });
    ctx.poly([peak, [ridge, base], [r, base]], ctx.col(i * 2 + 4), { inset: 1 });
    ctx.poly([peak, [p.cx - 14, peak[1] + 22], [p.cx + 14, peak[1] + 22]], ctx.colors[1], { inset: 1 });
  });
  return 'mountains';
}

function gem(ctx) {
  const n = ctx.int(7, 13);
  const cx = 120;
  const cy = ctx.between(180, 200);
  const R = ctx.between(78, 104);
  const rot = ctx.rand() * TAU;
  const step = TAU / n;
  const inner = Array.from({ length: n }, (_, i) => pol(cx, cy, R * 0.45 * ctx.between(0.8, 1.2), rot + i * step));
  const outer = Array.from({ length: n }, (_, i) => pol(cx, cy, R * ctx.between(0.8, 1.05), rot + (i + 0.5) * step));
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ctx.poly([[cx, cy], inner[i], inner[j]], ctx.col(i * 2), { inset: 0.98 });
    ctx.poly([inner[i], outer[i], inner[j]], ctx.col(i * 2 + 3), { inset: 0.98, loose: ctx.rand() < 0.12 });
  }
  return 'gem';
}

// A 3 x 4 grid of Bauhaus tiles: quarter circles, half circles, triangles and dots.
function tiles(ctx) {
  const s = 72;
  const x0 = 12;
  const y0 = 46;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const x = x0 + col * s;
      const y = y0 + row * s;
      const k = row * 3 + col;
      const bg = ctx.col(k + ctx.int(0, 2));
      const fg = ctx.col(k + ctx.int(3, 6));
      ctx.poly([[x, y], [x + s, y], [x + s, y + s], [x, y + s]], bg, { inset: 0.99, still: true });
      const type = ctx.int(0, 5);
      const o = ctx.int(0, 3);
      const xm = x + s / 2;
      const ym = y + s / 2;
      const h = s / 2 - 3;
      const cell = [x, y, x + s, y + s];
      if (type === 0 || type === 1) {
        const [cxn, cyn, dx, dy] = [[x, y, 1, 1], [x + s, y, -1, 1], [x + s, y + s, -1, -1], [x, y + s, 1, -1]][o];
        const r = type === 0 ? s - 4 : s * 0.55;
        ctx.shape(`M${cxn} ${cyn} L${cxn + dx * r} ${cyn} A${r} ${r} 0 0 ${dx * dy > 0 ? 1 : 0} ${cxn} ${cyn + dy * r} Z`, fg, xm, ym, cell);
      } else if (type === 2) {
        const d = [
          `M${x + 2} ${ym} A${h} ${h} 0 0 1 ${x + s - 2} ${ym} Z`,
          `M${x + s - 2} ${ym} A${h} ${h} 0 0 1 ${x + 2} ${ym} Z`,
          `M${xm} ${y + 2} A${h} ${h} 0 0 0 ${xm} ${y + s - 2} Z`,
          `M${xm} ${y + s - 2} A${h} ${h} 0 0 0 ${xm} ${y + 2} Z`
        ][o];
        ctx.shape(d, fg, xm, ym, cell);
      } else if (type === 3) {
        const tri = [
          [[x + 4, y + s - 4], [x + s - 4, y + s - 4], [x + 4, y + 4]],
          [[x + 4, y + 4], [x + s - 4, y + 4], [x + s - 4, y + s - 4]],
          [[x + 4, y + 4], [x + s - 4, y + 4], [x + 4, y + s - 4]],
          [[x + s - 4, y + 4], [x + s - 4, y + s - 4], [x + 4, y + s - 4]]
        ][o];
        ctx.poly(tri, fg, { inset: 1, still: true });
      } else {
        ctx.circ(xm, ym, s * 0.34, fg);
        if (type === 5) ctx.circ(xm, ym, s * 0.14, bg);
      }
    }
  }
  return 'mosaic';
}

module.exports = { vessel, flower, tower, fish, tree, rocket, mountains, gem, tiles };
