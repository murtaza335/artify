'use strict';

// Geometry: a Penrose tiling, honeycomb, golden spiral, tangram, Islamic star tiling, guilloche rosette,
// phyllotaxis, patchwork quilt, kaleidoscope, chevrons, halftone and an impossible triangle.

const { TAU, fmt, pol, rectPts, starPoints, arcBand, stripes, dotField } = require('./engine');

const R = rectPts;
const PHI = (1 + Math.sqrt(5)) / 2;
const still = { inset: 1, still: true };

function penrose(ctx) {
  const cx = 120;
  const cy = 190;
  const radius = 108;
  let tris = [];
  for (let i = 0; i < 10; i++) {
    let b = pol(cx, cy, radius, ((2 * i - 1) * Math.PI) / 10);
    let c = pol(cx, cy, radius, ((2 * i + 1) * Math.PI) / 10);
    if (i % 2 === 0) [b, c] = [c, b];
    tris.push([0, [cx, cy], b, c]);
  }
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const depth = ctx.int(1, 2);
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (const [kind, a, b, c] of tris) {
      if (kind === 0) {
        const p = lerp(a, b, 1 / PHI);
        next.push([0, c, p, b], [1, p, c, a]);
      } else {
        const q = lerp(b, a, 1 / PHI);
        const r = lerp(b, c, 1 / PHI);
        next.push([1, r, c, a], [1, q, r, b], [0, r, q, a]);
      }
    }
    tris = next;
  }
  const rot = ctx.int(0, 7);
  tris.forEach(([kind, a, b, c], i) => ctx.poly([a, b, c], kind === 0 ? ctx.col(rot) : ctx.col(rot + 3 + (i % 2)), { inset: 0.96 }));
  return 'penrose tiling';
}

function honeycomb(ctx) {
  const r = ctx.pick([26, 30, 34]);
  const w = Math.sqrt(3) * r;
  const cols = Math.floor(206 / w);
  const rows = Math.floor(300 / (r * 1.5));
  const x0 = 120 - (cols * w) / 2 + w / 2;
  const y0 = 58 + r;
  const hot = ctx.int(0, 7);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = x0 + i * w + (j % 2 ? w / 2 : 0);
      if (x + w / 2 > 226 || x - w / 2 < 14) continue;
      const y = y0 + j * r * 1.5;
      const pts = Array.from({ length: 6 }, (_, k) => pol(x, y, r, Math.PI / 6 + (k * TAU) / 6));
      const c = ctx.rand() < 0.3 ? ctx.col(hot + 3) : ctx.rand() < 0.5 ? ctx.col(hot) : ctx.col(hot + 4);
      ctx.poly(pts, c, { inset: 0.92, still: true });
    }
  }
  return 'honeycomb';
}

function goldenSpiral(ctx) {
  const long = 272;
  const short = long / PHI;
  let rect = [0, 0, long, short];
  const squares = [];
  for (let i = 0; i < 9; i++) {
    const [x, y, w, h] = rect;
    const step = i % 4;
    if (step === 0) { squares.push([x, y, h]); rect = [x + h, y, w - h, h]; }
    else if (step === 1) { squares.push([x, y, w]); rect = [x, y + w, w, h - w]; }
    else if (step === 2) { squares.push([x + w - h, y, h]); rect = [x, y, w - h, h]; }
    else { squares.push([x, y + h - w, w]); rect = [x, y, w, h - w]; }
  }
  const swap = true;
  const flipU = ctx.rand() < 0.5;
  const flipV = ctx.rand() < 0.5;
  const map = ([u, v]) => {
    const uu = flipU ? long - u : u;
    const vv = flipV ? short - v : v;
    return swap ? [120 - short / 2 + vv, 190 - long / 2 + uu] : [120 - long / 2 + uu, 190 - short / 2 + vv];
  };
  const corners = ([x, y, s]) => [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
  squares.forEach((sq, i) => ctx.poly(corners(sq).map(map), ctx.col(i * 2 + (i % 3)), { inset: 0.985, still: true }));
  // The spiral: each quarter arc joins diagonal corners of its square, centred on a third corner.
  let p = corners(squares[0])[3];
  let prevCenter = null;
  squares.forEach((sq) => {
    const cs = corners(sq);
    const pi = cs.findIndex((c) => Math.abs(c[0] - p[0]) < 0.01 && Math.abs(c[1] - p[1]) < 0.01);
    const end = cs[(pi + 2) % 4];
    const cands = [cs[(pi + 1) % 4], cs[(pi + 3) % 4]];
    let center = cands[1];
    if (prevCenter) {
      const cross = (c) => Math.abs((c[0] - p[0]) * (prevCenter[1] - p[1]) - (c[1] - p[1]) * (prevCenter[0] - p[0]));
      center = cross(cands[0]) <= cross(cands[1]) ? cands[0] : cands[1];
    }
    const [mp, me, mc] = [p, end, center].map(map);
    const sweep = (mp[0] - mc[0]) * (me[1] - mc[1]) - (mp[1] - mc[1]) * (me[0] - mc[0]) > 0 ? 1 : 0;
    const r = sq[2];
    ctx.stroke(`M${fmt(mp[0])} ${fmt(mp[1])} A${fmt(r)} ${fmt(r)} 0 0 ${sweep} ${fmt(me[0])} ${fmt(me[1])}`, ctx.ink, 3, mc[0], mc[1], [Math.min(mp[0], me[0]) - 1, Math.min(mp[1], me[1]) - 1, Math.max(mp[0], me[0]) + 1, Math.max(mp[1], me[1]) + 1]);
    p = end;
    prevCenter = center;
  });
  return 'golden spiral';
}

function tangram(ctx) {
  const turn = ctx.pick([0, 1, 2, 3]) * (Math.PI / 4);
  const u = turn % (Math.PI / 2) ? ctx.between(30, 34) : ctx.between(40, 46);
  const blow = ctx.between(0, 0.1);
  const pieces = [
    [[0, 0], [4, 0], [2, 2]], [[0, 0], [0, 4], [2, 2]], [[4, 4], [4, 2], [2, 4]], [[4, 0], [4, 2], [3, 1]],
    [[2, 2], [3, 1], [4, 2], [3, 3]], [[2, 2], [3, 3], [1, 3]], [[1, 3], [3, 3], [2, 4], [0, 4]]
  ];
  const shift = ctx.int(0, 7);
  ctx.circ(120, 190, ctx.between(104, 112), ctx.col(ctx.int(0, 7)));
  pieces.forEach((pts, i) => {
    const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length - 2;
    const my = pts.reduce((a, p) => a + p[1], 0) / pts.length - 2;
    const place = pts.map(([x, y]) => {
      const gx = (x - 2 + mx * blow) * u;
      const gy = (y - 2 + my * blow) * u;
      return [120 + gx * Math.cos(turn) - gy * Math.sin(turn), 190 + gx * Math.sin(turn) + gy * Math.cos(turn)];
    });
    ctx.poly(place, ctx.col(shift + i + (i > 3 ? 1 : 0)), { inset: 0.97, still: true });
  });
  return 'tangram';
}

function islamicStar(ctx) {
  const cols = 3;
  const rows = ctx.int(4, 5);
  const cell = Math.min(200 / cols, 300 / rows);
  const x0 = 120 - (cols * cell) / 2;
  const y0 = 190 - (rows * cell) / 2;
  ctx.poly(R(x0, y0, cols * cell, rows * cell), ctx.col(4), still);
  const hue = ctx.int(0, 7);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = x0 + (i + 0.5) * cell;
      const cy = y0 + (j + 0.5) * cell;
      ctx.poly(starPoints(cx, cy, cell * 0.5, cell * 0.28, 8, Math.PI / 8), ctx.col(hue + ((i + j) % 2) * 3), { inset: 0.94, still: true });
      ctx.circ(cx, cy, cell * 0.1, ctx.col(hue + 5));
    }
  }
  for (let j = 1; j < rows; j++) for (let i = 1; i < cols; i++) ctx.poly(starPoints(x0 + i * cell, y0 + j * cell, cell * 0.2, cell * 0.2, 4, Math.PI / 4), ctx.col(hue + 1), { inset: 0.9, still: true });
  return 'star tiling';
}

function guilloche(ctx) {
  const cx = 120;
  const cy = 190;
  const n = ctx.int(18, 30);
  const d = ctx.between(24, 40);
  const r = ctx.between(46, 60);
  const rot = ctx.rand() * TAU;
  for (let i = 0; i < n; i++) {
    const [x, y] = pol(cx, cy, d, rot + (i * TAU) / n);
    ctx.raw(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="none" stroke="${ctx.col(i % 3 === 0 ? 3 : 2 + (i % 2) * 3)}" stroke-width="2.4"/>`, x, y, [x - r, y - r, x + r, y + r]);
  }
  ctx.circ(cx, cy, 12, ctx.colors[0]);
  ctx.circ(cx, cy, 5, ctx.ink);
  return 'guilloche';
}

function phyllotaxis(ctx) {
  const total = ctx.int(150, 190);
  const angle = ctx.pick([137.508, 137.508, 137.3, 137.64, 99.5]) * (Math.PI / 180);
  const c = 98 / Math.sqrt(total);
  const hue = ctx.int(0, 7);
  for (let g = 0; g < total; g += 4) {
    let svg = '';
    let b = [Infinity, Infinity, -Infinity, -Infinity];
    for (let i = g; i < Math.min(total, g + 4); i++) {
      const [x, y] = pol(120, 190, c * Math.sqrt(i + 1), i * angle);
      const r = 2.2 + 3.4 * Math.sqrt((i + 1) / total);
      svg += `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${ctx.col(hue + Math.floor(i / 14))}"/>`;
      b = [Math.min(b[0], x - r), Math.min(b[1], y - r), Math.max(b[2], x + r), Math.max(b[3], y + r)];
    }
    ctx.raw(svg, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b);
  }
  ctx.circ(120, 190, 6, ctx.colors[0]);
  return 'phyllotaxis';
}

function quilt(ctx) {
  const cell = 60;
  const x0 = 30;
  const y0 = 40;
  const a = ctx.int(0, 7);
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 3; i++) {
      const x = x0 + i * cell;
      const y = y0 + j * cell;
      const type = ctx.int(0, 2);
      const c1 = ctx.col(a + ctx.int(0, 5));
      const c2 = ctx.col(a + ctx.int(0, 5) + 3);
      const m = [x + cell / 2, y + cell / 2];
      const [tl, tr, br, bl] = [[x, y], [x + cell, y], [x + cell, y + cell], [x, y + cell]];
      if (type === 0) {
        ctx.poly([tl, tr, bl], c1, { inset: 0.97, still: true });
        ctx.poly([tr, br, bl], c2, { inset: 0.97, still: true });
      } else if (type === 1) {
        ctx.poly(R(x, y, cell, cell), c1, { inset: 0.97, still: true });
        ctx.poly([[m[0], y], [x + cell, m[1]], [m[0], y + cell], [x, m[1]]], c2, { inset: 0.97, still: true });
        ctx.circ(m[0], m[1], cell * 0.12, c1);
      } else {
        [[tl, tr, m], [tr, br, m], [br, bl, m], [bl, tl, m]].forEach((tri, k) => ctx.poly(tri, k % 2 ? c1 : c2, { inset: 0.97, still: true }));
      }
    }
  }
  return 'patchwork quilt';
}

function kaleidoscope(ctx) {
  const n = ctx.pick([6, 8]);
  const wedge = TAU / n;
  const bases = n === 6 ? ctx.int(2, 3) : 2;
  const rot = ctx.rand() * TAU;
  const hue = ctx.int(0, 7);
  ctx.circ(120, 190, 104, ctx.col(hue + 6));
  for (let k = 0; k < bases; k++) {
    const pts = [[ctx.between(16, 60), 0.03], [ctx.between(50, 98), wedge / 2 - 0.03], [ctx.between(20, 90), ctx.between(0.05, wedge / 2 - 0.05)]];
    for (let i = 0; i < n; i++) {
      [1, -1].forEach((sign) => {
        ctx.poly(pts.map(([r, t]) => pol(120, 190, r, rot + i * wedge + sign * t)), ctx.col(hue + k * 2 + (sign > 0 ? 0 : 1)), { inset: 0.96, still: true });
      });
    }
  }
  ctx.circ(120, 190, 14, ctx.colors[0]);
  return 'kaleidoscope';
}

function chevrons(ctx) {
  const zigs = ctx.int(3, 4);
  const amp = ctx.between(24, 36);
  const hue = ctx.int(0, 7);
  const count = ctx.int(10, 14);
  stripes(ctx, [18, 56, 204, 276 - amp], count, (x) => {
    const s = Math.round(((x - 18) / 204) * zigs * 2);
    return s % 2 ? amp : 0;
  }, (k) => ctx.col(hue + (k % 3) * 2 + Math.floor(k / 3)), zigs * 2);
  return 'chevrons';
}

function halftone(ctx) {
  const spacing = 12;
  const mode = ctx.int(0, 2);
  const cx = ctx.between(80, 160);
  const cy = ctx.between(150, 230);
  const angle = ctx.between(0, Math.PI);
  const base = ctx.int(0, 7);
  ctx.poly(R(22, 54, 196, 280), ctx.col(base + 4), still);
  const hue = ctx.col(base);
  dotField(ctx, [22, 54, 196, 280], spacing, (x, y) => {
    let t;
    if (mode === 0) t = 1 - Math.hypot(x - cx, y - cy) / 150;
    else if (mode === 1) t = ((x - 120) * Math.cos(angle) + (y - 194) * Math.sin(angle)) / 240 + 0.5;
    else t = 0.5 + 0.5 * Math.sin(y / 38 + x / 90);
    return Math.max(0, Math.min(1, t)) * spacing * 0.5 * 1.02 - 0.2;
  }, () => hue, 4);
  return 'halftone';
}

function impossibleTriangle(ctx) {
  const cx = 120;
  const cy = 190;
  const rot = ctx.rand() < 0.5 ? 0 : Math.PI;
  const side = ctx.between(176, 196);
  const outer = Array.from({ length: 3 }, (_, i) => pol(cx, cy, side * 0.577, -Math.PI / 2 + rot + (i * TAU) / 3));
  const k = ctx.between(0.46, 0.56);
  const lerp = (p, t) => [cx + (p[0] - cx) * t, cy + (p[1] - cy) * t];
  const inner = outer.map((p) => lerp(p, k));
  const mid = outer.map((p) => lerp(p, (1 + k) / 2));
  const hue = ctx.int(0, 7);
  ctx.circ(cx, cy, 108, ctx.col(hue + 4));
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    ctx.poly([outer[i], outer[j], mid[j], mid[i]], ctx.col(hue + i * 2), still);
    ctx.poly([mid[i], mid[j], inner[j], inner[i]], ctx.col(hue + ((i + 1) % 3) * 2 + 1), still);
  }
  [[0, 1], [1, 2], [2, 0]].forEach(([a, b]) => ctx.line(inner[a][0], inner[a][1], inner[b][0], inner[b][1], ctx.ink, 2));
  return 'impossible triangle';
}

module.exports = { penrose, honeycomb, goldenSpiral, tangram, islamicStar, guilloche, phyllotaxis, quilt, kaleidoscope, chevrons, halftone, impossibleTriangle };
