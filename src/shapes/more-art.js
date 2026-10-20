'use strict';

// More art and geometry: a cubist face, Mondrian grid, Albers squares, Suprematism, a Kandinsky composition,
// a still life, Truchet tiles, Voronoi stained glass, spirographs, Lissajous curves, moire, a Sierpinski
// triangle, a mandala and boho arches.

const { TAU, fmt, pol, slice, rectPts, rotRect } = require('./engine');

const R = rectPts;

// Draws an elliptical half as a polygon.
function ellipseHalf(cx, cy, rx, ry, left) {
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI / 2 + (left ? 1 : -1) * (i * Math.PI) / 16;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

function cubistFace(ctx) {
  ctx.poly(R(18, 52, 204, 292), ctx.col(4), { inset: 1, still: true });
  ctx.poly([[34, 130], [112, 72], [190, 112], [206, 252], [176, 332], [58, 332]], ctx.col(3), { inset: 1, still: true });
  const cy = 190;
  const left = ctx.col(ctx.int(0, 7));
  const right = ctx.col(ctx.int(0, 7));
  ctx.poly(ellipseHalf(120, cy, 64, 98, true), left, { inset: 1, still: true });
  ctx.poly(ellipseHalf(120, cy, 64, 98, false), right, { inset: 1, still: true });
  ctx.poly([[34, 170], [120, 120], [120, 150], [34, 200]], ctx.col(5), { inset: 1, still: true });
  const ey1 = ctx.between(138, 158);
  const ey2 = ctx.between(128, 150);
  for (const [x, y] of [[88, ey1], [152, ey2]]) {
    ctx.shape(`M${x - 24} ${y} Q${x} ${y - 22} ${x + 24} ${y} Q${x} ${y + 14} ${x - 24} ${y} Z`, ctx.colors[1], x, y, [x - 24, y - 12, x + 24, y + 8]);
    ctx.circ(x + ctx.between(-5, 5), y - 2, 9, ctx.col(ctx.int(2, 6)));
    ctx.circ(x + ctx.between(-4, 4), y - 2, 4.5, ctx.ink);
  }
  const nx = ctx.between(108, 132);
  ctx.poly([[nx, 160], [nx - 18, 226], [nx + 16, 226]], ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(ctx.between(92, 112), 258, ctx.between(36, 54), 14), ctx.col(3), { inset: 1, still: true });
  ctx.circ(ctx.between(150, 170), ctx.between(214, 232), ctx.between(18, 26), ctx.col(ctx.int(0, 7)));
  ctx.poly(R(100, 286, 40, 46), left, { inset: 1, still: true });
  ctx.poly([[40, 344], [100, 296], [140, 296], [200, 344]], ctx.col(0), { inset: 1, still: true });
  return 'cubist face';
}

function mondrian(ctx) {
  const lines = [];
  const cells = [];
  const split = (x, y, w, h, d) => {
    if (d === 0 || w < 46 || h < 46 || (d < 3 && ctx.rand() < 0.22)) {
      cells.push([x, y, w, h]);
      return;
    }
    const vertical = w > h ? ctx.rand() < 0.8 : ctx.rand() < 0.2;
    const t = ctx.between(0.3, 0.7);
    if (vertical) {
      const sx = x + w * t;
      lines.push([sx - 3, y, 6, h]);
      split(x, y, sx - x, h, d - 1);
      split(sx, y, x + w - sx, h, d - 1);
    } else {
      const sy = y + h * t;
      lines.push([x, sy - 3, w, 6]);
      split(x, y, w, sy - y, d - 1);
      split(x, sy, w, y + h - sy, d - 1);
    }
  };
  split(18, 52, 204, 290, 4);
  const paint = ['#E5534B', '#E9A93B', '#3FA7D6'];
  cells.forEach(([x, y, w, h]) => ctx.poly(R(x, y, w, h), ctx.rand() < 0.55 ? '#FFFBF0' : ctx.pick(paint), { inset: 1, still: true }));
  lines.forEach(([x, y, w, h]) => ctx.poly(R(x, y, w, h), '#14131A', { inset: 1, still: true }));
  [[14, 48, 212, 6], [14, 342, 212, 6], [14, 48, 6, 300], [220, 48, 6, 300]].forEach(([x, y, w, h]) => ctx.poly(R(x, y, w, h), '#14131A', { inset: 1, still: true }));
  return 'grid painting';
}

function homage(ctx) {
  const n = ctx.int(4, 5);
  ctx.poly(R(14, 48, 212, 298), ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < n; i++) {
    const s = 200 - i * (170 / n);
    ctx.poly(R(120 - s / 2, 56 + (200 - s) * 1.25, s, s), ctx.col(i * 3 + ctx.int(0, 2)), { inset: 1, still: true });
  }
  return 'nested squares';
}

function suprematism(ctx) {
  ctx.poly(R(14, 48, 212, 298), ctx.colors[1], { inset: 1, still: true });
  const ink = '#14131A';
  ctx.poly(rotRect(ctx.between(100, 140), ctx.between(130, 170), ctx.between(90, 120), ctx.between(90, 120), ctx.between(-0.5, 0.5)), ink, { inset: 1, still: true });
  ctx.poly(rotRect(ctx.between(90, 150), ctx.between(230, 270), ctx.between(110, 150), ctx.between(22, 34), ctx.between(-0.5, 0.5)), ctx.col(3), { inset: 1, still: true });
  ctx.poly(rotRect(ctx.between(60, 180), ctx.between(90, 300), ctx.between(80, 120), ctx.between(8, 14), ctx.between(0, Math.PI)), ctx.col(0), { inset: 1, still: true });
  ctx.circ(ctx.between(50, 190), ctx.between(80, 320), ctx.between(14, 26), ctx.col(5));
  ctx.circ(ctx.between(50, 190), ctx.between(80, 320), ctx.between(6, 12), ink);
  const cx = ctx.between(60, 180);
  const cy = ctx.between(280, 320);
  ctx.poly(R(cx - 30, cy - 5, 60, 10), ink, { inset: 1, still: true });
  ctx.poly(R(cx - 5, cy - 30, 10, 60), ink, { inset: 1, still: true });
  ctx.poly([[ctx.between(40, 80), 100], [ctx.between(100, 130), 70], [ctx.between(100, 140), 120]], ctx.col(2), { inset: 1, still: true });
  ctx.line(24, ctx.between(70, 120), 216, ctx.between(260, 320), ink, 2);
  [[14, 48, 212, 5], [14, 341, 212, 5], [14, 48, 5, 298], [221, 48, 5, 298]].forEach(([x, y, w, h]) => ctx.poly(R(x, y, w, h), ink, { inset: 1, still: true }));
  return 'suprematist composition';
}

function kandinsky(ctx) {
  ctx.poly(R(14, 48, 212, 298), ctx.pick(['#FFF0B8', ctx.col(5)]), { inset: 1, still: true });
  const cx = ctx.between(90, 150);
  const cy = ctx.between(150, 210);
  for (let i = 0; i < 4; i++) ctx.circ(cx, cy, 78 - i * 18, ctx.col(i * 2 + 1));
  ctx.raw(`<circle cx="${fmt(cx + 30)}" cy="${fmt(cy - 60)}" r="40" fill="none" stroke="${ctx.ink}" stroke-width="3"/>`, cx, cy, [cx - 10, cy - 100, cx + 70, cy - 20]);
  ctx.poly([[ctx.between(30, 60), 300], [ctx.between(100, 140), 250], [ctx.between(150, 200), 320]], ctx.col(3), { inset: 1, still: true });
  ctx.line(24, ctx.between(70, 120), 216, ctx.between(200, 260), ctx.ink, 3);
  ctx.line(30, 330, 210, 280, ctx.ink, 2);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if ((r + c) % 2 === 0) ctx.poly(R(30 + c * 14, 70 + r * 14, 14, 14), ctx.ink, { inset: 1, still: true });
  for (let i = 0; i < 6; i++) ctx.circ(ctx.between(30, 210), ctx.between(60, 330), ctx.between(3, 7), ctx.pick([ctx.col(3), ctx.col(0), ctx.ink]));
  ctx.shape(`M${fmt(150)} 300 A36 36 0 0 1 ${fmt(206)} 300 Z`, ctx.col(0), 178, 290, [150, 264, 206, 300]);
  [[14, 48, 212, 5], [14, 341, 212, 5], [14, 48, 5, 298], [221, 48, 5, 298]].forEach(([x, y, w, h]) => ctx.poly(R(x, y, w, h), ctx.ink, { inset: 1, still: true }));
  return 'composition';
}

function stillLife(ctx) {
  ctx.poly(R(14, 48, 212, 232), ctx.col(2), { inset: 1, still: true });
  ctx.poly(R(14, 280, 212, 66), ctx.col(4), { inset: 1, still: true });
  slice(ctx, (t) => (t < 0.35 ? 9 : 9 + ((t - 0.35) / 0.15) * 15 * Math.min(1, (t - 0.35) / 0.15) + (t >= 0.5 ? 15 - ((t - 0.5) * 0) : 0)), (t, b) => [64 + b, 80 + t * 206], {
    bands: 5, big: 16, loosePct: 0.03, skipPct: 0, color: (b, i) => ctx.green(b + i)
  });
  ctx.shape('M112 286 A44 22 0 0 0 200 286 Z', ctx.col(3), 156, 276, [112, 264, 200, 286]);
  [[130, 258, 3], [156, 254, 0], [180, 260, 6], [146, 238, 1]].forEach(([x, y, c], i) => {
    ctx.circ(x, y, 16, ctx.col(c + i));
    ctx.line(x, y - 16, x + 3, y - 24, ctx.col(4), 3);
  });
  ctx.poly([[40, 344], [14, 344], [14, 300], [60, 320]], ctx.col(6), { inset: 1, still: true });
  ctx.circ(ctx.between(180, 210), 110, 20, ctx.colors[0]);
  return 'still life';
}

function truchet(ctx) {
  const s = 50;
  const x0 = 20;
  const y0 = 46;
  const a = ctx.col(ctx.int(0, 7));
  const b = ctx.col(ctx.int(0, 7) + 3);
  ctx.poly(R(x0, y0, 4 * s, 6 * s), a, { inset: 1, still: true });
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const x = x0 + col * s;
      const y = y0 + row * s;
      const corners = ctx.rand() < 0.5 ? [[x, y, 1, 1], [x + s, y + s, -1, -1]] : [[x + s, y, -1, 1], [x, y + s, 1, -1]];
      corners.forEach(([cx, cy, dx, dy]) => {
        const r = s / 2;
        ctx.shape(`M${cx} ${cy} L${cx + dx * r} ${cy} A${r} ${r} 0 0 ${dx * dy > 0 ? 1 : 0} ${cx} ${cy + dy * r} Z`, b, cx + (dx * r) / 2, cy + (dy * r) / 2, [Math.min(cx, cx + dx * r), Math.min(cy, cy + dy * r), Math.max(cx, cx + dx * r), Math.max(cy, cy + dy * r)]);
      });
    }
  }
  return 'truchet tiles';
}

// Keeps the part of a polygon closer to point a than to point b.
function clipHalf(poly, a, b) {
  const nx = a[0] - b[0];
  const ny = a[1] - b[1];
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const d = (p) => (p[0] - mx) * nx + (p[1] - my) * ny;
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const dc = d(cur);
    const dp = d(prev);
    const cross = () => {
      const t = dp / (dp - dc);
      return [prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t];
    };
    if (dc >= 0) {
      if (dp < 0) out.push(cross());
      out.push(cur);
    } else if (dp >= 0) {
      out.push(cross());
    }
  }
  return out;
}

function voronoi(ctx) {
  const n = ctx.int(12, 16);
  const seeds = Array.from({ length: n }, () => [ctx.between(24, 216), ctx.between(58, 336)]);
  seeds.forEach((a, i) => {
    let poly = [[18, 52], [222, 52], [222, 342], [18, 342]];
    seeds.forEach((b, j) => {
      if (i !== j && poly.length > 2) poly = clipHalf(poly, a, b);
    });
    if (poly.length > 2) ctx.poly(poly, ctx.col(i * 3 + ctx.int(0, 2)), { inset: 0.96 });
  });
  return 'stained glass';
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

function spirograph(ctx) {
  const [Rr, r] = ctx.pick([[96, 32], [100, 40], [90, 36], [84, 28], [96, 60], [80, 48], [88, 33], [105, 45]]);
  const k = r / gcd(Rr, r);
  const steps = Math.min(900, 160 * k + 160);
  const layers = ctx.int(2, 3);
  for (let l = 0; l < layers; l++) {
    const d = ctx.between(26, 78);
    const scale = 108 / (Rr - r + d);
    let path = '';
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * TAU * k;
      const x = 120 + scale * ((Rr - r) * Math.cos(t) + d * Math.cos(((Rr - r) / r) * t));
      const y = 190 + scale * ((Rr - r) * Math.sin(t) - d * Math.sin(((Rr - r) / r) * t));
      path += (i ? 'L' : 'M') + fmt(x) + ' ' + fmt(y);
    }
    ctx.stroke(path, ctx.col(l * 3 + 2), 2.6, 120, 190, [10, 80, 230, 300]);
  }
  ctx.circ(120, 190, 6, ctx.colors[0]);
  return 'spirograph';
}

function lissajous(ctx) {
  const curves = ctx.int(3, 4);
  for (let c = 0; c < curves; c++) {
    const a = ctx.int(1, 5);
    const b = ctx.int(2, 6);
    const phase = ctx.between(0, Math.PI);
    let path = '';
    for (let i = 0; i <= 480; i++) {
      const t = (i / 480) * TAU;
      path += (i ? 'L' : 'M') + fmt(120 + 100 * Math.sin(a * t + phase)) + ' ' + fmt(196 + 138 * Math.sin(b * t));
    }
    ctx.stroke(path, ctx.col(c * 3 + 1), 3, 120, 196, [20, 58, 220, 334]);
  }
  return 'lissajous curves';
}

function moire(ctx) {
  const cy = 190;
  const c1 = ctx.col(ctx.int(0, 7));
  const c2 = ctx.col(ctx.int(0, 7) + 3);
  const off = ctx.between(16, 28);
  for (const [cx, color] of [[120 - off, c1], [120 + off, c2]]) {
    for (let r = 8; r <= 88; r += ctx.between(7, 8.5)) ctx.raw(`<circle cx="${fmt(cx)}" cy="${cy}" r="${fmt(r)}" fill="none" stroke="${color}" stroke-width="1.8"/>`, cx, cy, [cx - r, cy - r, cx + r, cy + r]);
  }
  return 'moire';
}

function sierpinski(ctx) {
  const depth = ctx.int(3, 4);
  const draw = (a, b, c, d, index) => {
    if (d === 0) {
      ctx.poly([a, b, c], ctx.col(index), { inset: 0.97 });
      return;
    }
    const ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
    const ca = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2];
    draw(a, ab, ca, d - 1, index + 1);
    draw(ab, b, bc, d - 1, index + 3);
    draw(ca, bc, c, d - 1, index + 5);
  };
  draw([120, 100], [12, 290], [228, 290], depth, ctx.int(0, 7));
  return 'sierpinski triangle';
}

function mandala(ctx) {
  const cx = 120;
  const cy = 192;
  const rings = ctx.int(3, 4);
  for (let k = rings - 1; k >= 0; k--) {
    const n = 8 + k * 4;
    const base = 26 + k * 26;
    const tip = base + 34 - k * 3;
    const rot = ctx.rand() * TAU;
    for (let i = 0; i < n; i++) {
      const a = rot + (i * TAU) / n;
      const half = (TAU / n) * 0.48;
      ctx.poly([pol(cx, cy, base - 6, a), pol(cx, cy, base + 12, a - half), pol(cx, cy, tip, a), pol(cx, cy, base + 12, a + half)], ctx.col(k * 2 + (i % 2) * 3), { inset: 0.95 });
    }
  }
  ctx.circ(cx, cy, 16, ctx.colors[0]);
  ctx.circ(cx, cy, 8, ctx.col(3));
  return 'mandala';
}

function arches(ctx) {
  const n = ctx.int(5, 7);
  const base = 340;
  for (let i = 0; i < n; i++) {
    const w = 208 - i * (170 / n);
    const top = 70 + i * 22;
    const x = 120 - w / 2;
    ctx.shape(`M${fmt(x)} ${base} V${fmt(top + w / 2)} A${fmt(w / 2)} ${fmt(w / 2)} 0 0 1 ${fmt(x + w)} ${fmt(top + w / 2)} V${base} Z`, ctx.col(i * 2 + (i % 2) * 3), 120, (top + base) / 2, [x, top, x + w, base]);
  }
  ctx.circ(120, 300, 14, ctx.colors[0]);
  return 'arches';
}

module.exports = { cubistFace, mondrian, homage, suprematism, kandinsky, stillLife, truchet, voronoi, spirograph, lissajous, moire, sierpinski, mandala, arches };
