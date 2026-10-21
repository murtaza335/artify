'use strict';

// Generative abstraction: a flow field, circle packing, a quadtree, ridgelines, contours, a Hilbert curve, a
// dragon curve, nested packing, jittered triangles, a cellular automaton, a game of life, a harmonograph, rose
// curves, superformula shells, dunes, wave interference, recursive triangles, binary splits, random walkers,
// an attractor, a branching weed, noise tiles, wobbly rings, pixel sorting, a dot stream and packed squares.

const { TAU, fmt, pol, dotField } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, ground, batcher, polyline, X0, Y0, X1, Y1, CX, CY } = K;

const inside = (x, y, m = 0) => x > X0 + m && x < X1 - m && y > Y0 + m && y < Y1 - m;
const dot = (x, y, r, c) => `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${c}"/>`;
const pathSvg = (pts, c, w) => `<path d="${K.pathOf(pts)}" fill="none" stroke="${c}" stroke-width="${fmt(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;

// The ink that reads on a given ground.
const inkOn = (ctx, bg) => (bg === ctx.ink ? ctx.colors[1] : ctx.ink);

function flowField(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = K.noise2(ctx.seed);
  const scale = ctx.between(0.008, 0.016);
  const turn = ctx.between(3, 6);
  const b = batcher(ctx, 8);
  for (let k = 0; k < 90; k++) {
    let x = ctx.between(X0, X1);
    let y = ctx.between(Y0, Y1);
    const pts = [[x, y]];
    for (let s = 0; s < 40 && inside(x, y); s++) {
      const a = n(x * scale, y * scale) * turn;
      x += Math.cos(a) * 4;
      y += Math.sin(a) * 4;
      pts.push([x, y]);
    }
    if (pts.length > 4) b.add(pathSvg(pts, pal[k % 4], ctx.between(1.2, 3.4)), X0, Y0, X1, Y1);
  }
  b.flush();
  return 'flow field';
}

function circlePacking(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const placed = [];
  for (let t = 0; t < 900 && placed.length < 110; t++) {
    const x = ctx.between(X0 + 4, X1 - 4);
    const y = ctx.between(Y0 + 4, Y1 - 4);
    let r = Math.min(x - X0, X1 - x, y - Y0, Y1 - y, 44);
    for (const [px, py, pr] of placed) r = Math.min(r, Math.hypot(x - px, y - py) - pr - 2);
    if (r > 3) placed.push([x, y, r]);
  }
  const b = batcher(ctx, 4);
  placed.forEach(([x, y, r], i) => b.add(dot(x, y, r, pal[i % 5]), x - r, y - r, x + r, y + r));
  b.flush();
  return 'circle packing';
}

function quadtree(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const cells = [];
  const split = (x, y, w, h, d) => {
    if (d < 5 && (d < 2 || ctx.rand() < 0.62 - d * 0.06)) {
      const hw = w / 2;
      const hh = h / 2;
      split(x, y, hw, hh, d + 1);
      split(x + hw, y, hw, hh, d + 1);
      split(x, y + hh, hw, hh, d + 1);
      split(x + hw, y + hh, hw, hh, d + 1);
    } else cells.push([x, y, w, h]);
  };
  split(X0, Y0, 212, 298, 0);
  const b = batcher(ctx, 4);
  cells.forEach(([x, y, w, h], i) => {
    const c = pal[(i * 7 + Math.round(x + y)) % 5];
    const t = ctx.int(0, 3);
    let svg = `<rect x="${fmt(x + 1.5)}" y="${fmt(y + 1.5)}" width="${fmt(w - 3)}" height="${fmt(h - 3)}" fill="${c}"/>`;
    if (t === 0 && w > 20) svg += dot(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, bg);
    b.add(svg, x, y, x + w, y + h);
  });
  b.flush();
  return 'quadtree';
}

function ridgelines(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.colors[1]]);
  panel(ctx, bg);
  const ink = inkOn(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, ink]);
  const n = K.noise2(ctx.seed);
  const rows = ctx.int(22, 30);
  const hi = ctx.int(0, rows - 1);
  for (let r = 0; r < rows; r++) {
    const base = 90 + r * (240 / rows);
    const pts = [];
    for (let x = X0 + 16; x <= X1 - 16; x += 4) {
      const centre = 1 - Math.min(1, Math.abs(x - CX) / 70);
      pts.push([x, base - n(x * 0.05, r * 0.6) * 46 * centre * centre - n(x * 0.2, r) * 4]);
    }
    const fill = [...pts, [X1 - 16, base + 4], [X0 + 16, base + 4]];
    ctx.raw(`<polygon points="${K.pts(fill)}" fill="${bg}"/><path d="${K.pathOf(pts)}" fill="none" stroke="${r === hi ? accent : ink}" stroke-width="1.6" stroke-linejoin="round"/>`, CX, base - 20, [X0 + 14, base - 52, X1 - 14, base + 4]);
  }
  return 'ridgelines';
}

function contours(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const n = K.noise2(ctx.seed);
  const peaks = Array.from({ length: ctx.int(1, 3) }, () => [ctx.between(50, 190), ctx.between(90, 300)]);
  peaks.forEach(([px, py], p) => {
    for (let k = 1; k <= 9; k++) {
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * TAU;
        const rr = k * 13 * (0.75 + 0.5 * n(Math.cos(a) * 1.5 + p * 7, Math.sin(a) * 1.5 + k * 0.15));
        pts.push(pol(px, py, rr, a));
      }
      polyline(ctx, pts, pal[(k + p) % 3], k % 4 === 0 ? 2.6 : 1.3);
    }
  });
  return 'contours';
}

function hilbertCurve(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const order = ctx.int(4, 5);
  const N = 1 << order;
  const d2xy = (d) => {
    let x = 0;
    let y = 0;
    let t = d;
    for (let s = 1; s < N; s *= 2) {
      const rx = 1 & (t / 2);
      const ry = 1 & (t ^ rx);
      if (ry === 0) {
        if (rx === 1) {
          x = s - 1 - x;
          y = s - 1 - y;
        }
        [x, y] = [y, x];
      }
      x += s * rx;
      y += s * ry;
      t = Math.floor(t / 4);
    }
    return [x, y];
  };
  const size = 196;
  const cell = size / N;
  const ox = CX - size / 2 + cell / 2;
  const oy = CY - size / 2 + cell / 2;
  const total = N * N;
  const segs = 8;
  for (let g = 0; g < segs; g++) {
    const pts = [];
    for (let d = Math.floor((g * total) / segs); d <= Math.min(total - 1, Math.floor(((g + 1) * total) / segs)); d++) {
      const [x, y] = d2xy(d);
      pts.push([ox + x * cell, oy + y * cell]);
    }
    polyline(ctx, pts, pal[g % 4], order === 4 ? 4 : 2.6);
  }
  return 'hilbert curve';
}

function dragonCurve(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.colors[1]]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  let turns = [];
  for (let i = 0; i < 11; i++) turns = [...turns, 1, ...turns.slice().reverse().map((t) => -t)];
  let a = ctx.int(0, 3) * (Math.PI / 2);
  let x = 0;
  let y = 0;
  const pts = [[0, 0]];
  for (const t of turns) {
    x += Math.cos(a);
    y += Math.sin(a);
    pts.push([x, y]);
    a += (t * Math.PI) / 2;
  }
  const [bx0, by0, bx1, by1] = K.boundsOf(pts);
  const k = Math.min(190 / (bx1 - bx0), 270 / (by1 - by0));
  const P = pts.map(([px, py]) => [CX + (px - (bx0 + bx1) / 2) * k, CY + (py - (by0 + by1) / 2) * k]);
  const segs = 8;
  for (let g = 0; g < segs; g++) polyline(ctx, P.slice(Math.floor((g * P.length) / segs), Math.floor(((g + 1) * P.length) / segs) + 1), pal[g % 4], 2);
  return 'dragon curve';
}

function nestedPacking(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 5, [ctx.ink]);
  const Rr = 100;
  ctx.circ(CX, CY, Rr, pal[0]);
  const placed = [];
  for (let t = 0; t < 700 && placed.length < 60; t++) {
    const [x, y] = pol(CX, CY, Math.sqrt(ctx.rand()) * Rr, ctx.between(0, TAU));
    let r = Rr - Math.hypot(x - CX, y - CY) - 3;
    for (const [px, py, pr] of placed) r = Math.min(r, Math.hypot(x - px, y - py) - pr - 2);
    r = Math.min(r, 34);
    if (r > 3) placed.push([x, y, r]);
  }
  const b = batcher(ctx, 3);
  placed.forEach(([x, y, r], i) => {
    let svg = dot(x, y, r, pal[1 + (i % 4)]);
    if (r > 12) svg += dot(x, y, r * 0.55, pal[0]) + dot(x, y, r * 0.25, pal[1 + ((i + 2) % 4)]);
    b.add(svg, x - r, y - r, x + r, y + r);
  });
  b.flush();
  return 'nested packing';
}

function jitterTriangles(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const cols = 6;
  const rows = 8;
  const w = 212 / cols;
  const h = 298 / rows;
  const P = [];
  for (let j = 0; j <= rows; j++) {
    P.push([]);
    for (let i = 0; i <= cols; i++) {
      const edge = i === 0 || j === 0 || i === cols || j === rows;
      P[j].push([X0 + i * w + (edge ? 0 : ctx.between(-w * 0.35, w * 0.35)), Y0 + j * h + (edge ? 0 : ctx.between(-h * 0.35, h * 0.35))]);
    }
  }
  const gy = ctx.between(0, 1);
  for (let j = 0; j < rows; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < cols; i++) {
      const [a, c, d, e] = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]];
      const t = (j / rows + gy) % 1;
      const c1 = pal[Math.floor(t * 4 + (i % 2)) % 4];
      const c2 = pal[Math.floor(t * 4 + 1 + (i % 3 === 0 ? 1 : 0)) % 4];
      b.add(`<polygon points="${K.pts([a, c, d])}" fill="${c1}"/><polygon points="${K.pts([a, d, e])}" fill="${c2}"/>`, Math.min(a[0], e[0]), Math.min(a[1], c[1]), Math.max(c[0], d[0]), Math.max(d[1], e[1]));
    }
    b.flush();
  }
  return 'jittered triangles';
}

function cellularAutomaton(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [on, accent] = hues(ctx, 2, [bg]);
  const rule = ctx.pick([30, 90, 110, 150, 45, 73]);
  const cols = 53;
  const s = 212 / cols;
  let row = Array.from({ length: cols }, (_, i) => (i === Math.floor(cols / 2) || ctx.rand() < 0.04 ? 1 : 0));
  const rows = Math.floor(298 / s);
  for (let j = 0; j < rows; j += 4) {
    const b = batcher(ctx, 999);
    for (let jj = j; jj < Math.min(rows, j + 4); jj++) {
      row.forEach((v, i) => {
        if (v) b.add(`<rect x="${fmt(X0 + i * s)}" y="${fmt(Y0 + jj * s)}" width="${fmt(s + 0.2)}" height="${fmt(s + 0.2)}" fill="${(i + jj) % 17 === 0 ? accent : on}"/>`, X0 + i * s, Y0 + jj * s, X0 + i * s + s, Y0 + jj * s + s);
      });
      row = row.map((_, i) => (rule >> ((row[(i + cols - 1) % cols] << 2) | (row[i] << 1) | row[(i + 1) % cols])) & 1);
    }
    b.flush();
  }
  return 'cellular automaton';
}

function gameOfLife(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const cols = 24;
  const rows = 34;
  let g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (ctx.rand() < 0.36 ? 1 : 0)));
  const age = g.map((r) => r.map(() => 0));
  const steps = ctx.int(4, 12);
  for (let s = 0; s < steps; s++) {
    g = g.map((r, j) => r.map((v, i) => {
      let n = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (di || dj) n += g[(j + dj + rows) % rows][(i + di + cols) % cols];
      const alive = n === 3 || (v && n === 2) ? 1 : 0;
      age[j][i] = alive ? age[j][i] + 1 : 0;
      return alive;
    }));
  }
  const cw = 212 / cols;
  const ch = 298 / rows;
  for (let j = 0; j < rows; j += 5) {
    const b = batcher(ctx, 999);
    for (let jj = j; jj < Math.min(rows, j + 5); jj++) {
      for (let i = 0; i < cols; i++) {
        if (!g[jj][i]) continue;
        const x = X0 + i * cw;
        const y = Y0 + jj * ch;
        b.add(`<rect x="${fmt(x + 0.8)}" y="${fmt(y + 0.8)}" width="${fmt(cw - 1.6)}" height="${fmt(ch - 1.6)}" rx="2" fill="${pal[Math.min(2, age[jj][i] >> 1)]}"/>`, x, y, x + cw, y + ch);
      }
    }
    b.flush();
  }
  return 'game of life';
}

function harmonograph(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const f = [ctx.pick([2, 3, 4]), ctx.pick([2, 3, 5]), ctx.pick([1, 2, 3])].map((v) => v + ctx.between(-0.02, 0.02));
  const p = [ctx.between(0, TAU), ctx.between(0, TAU), ctx.between(0, TAU)];
  const decay = ctx.between(0.003, 0.006);
  const segs = 9;
  for (let g = 0; g < segs; g++) {
    const pts = [];
    for (let t = g * 60; t <= (g + 1) * 60; t += 0.25) {
      const e = Math.exp(-decay * t * 2);
      pts.push([CX + 96 * e * (Math.sin(f[0] * t * 0.1 + p[0]) * 0.7 + Math.sin(f[2] * t * 0.1 + p[2]) * 0.3), CY + 130 * e * Math.sin(f[1] * t * 0.1 + p[1])]);
    }
    polyline(ctx, pts, pal[g % 3], 1.3);
  }
  return 'harmonograph';
}

function roseCurves(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(ctx.int(0, 7))]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(2, 4);
  for (let k = 0; k < n; k++) {
    const num = ctx.int(2, 7);
    const den = ctx.int(1, 4);
    const r = 100 - k * 18;
    const pts = [];
    for (let t = 0; t <= TAU * den + 0.01; t += 0.03) pts.push(pol(CX, CY, r * Math.cos((num / den) * t), t));
    polyline(ctx, pts, pal[k % 4], 2.4 - k * 0.4);
  }
  ctx.circ(CX, CY, 5, pal[0]);
  return 'rose curves';
}

function superformula(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const m = ctx.int(3, 9);
  const [n1, n2, n3] = [ctx.between(0.3, 3), ctx.between(0.3, 4), ctx.between(0.3, 4)];
  const shape = (a) => {
    const t1 = Math.abs(Math.cos((m * a) / 4)) ** n2;
    const t2 = Math.abs(Math.sin((m * a) / 4)) ** n3;
    return (t1 + t2) ** (-1 / n1);
  };
  const raw = Array.from({ length: 180 }, (_, i) => shape((i / 180) * TAU));
  const max = Math.max(...raw.filter(Number.isFinite), 1);
  for (let k = 0; k < 7; k++) {
    const r = 104 * (1 - k * 0.13);
    const pts = raw.map((v, i) => pol(CX, CY, (Math.min(v, max) / max) * r, (i / 180) * TAU + k * 0.08));
    ctx.poly(pts, pal[k % 4], { inset: 1, still: true });
  }
  return 'superformula shell';
}

function dunes(ctx) {
  const [sky, sand] = hues(ctx, 2, [ctx.ink]);
  panel(ctx, sky);
  const ink = ctx.ink;
  const n = K.noise2(ctx.seed);
  for (let r = 0; r < 34; r++) {
    const y0 = 70 + r * 8;
    const pts = [];
    for (let x = X0; x <= X1; x += 6) pts.push([x, y0 + Math.sin(x * 0.04 + n(x * 0.02, r * 0.3) * 6) * 8 + n(x * 0.01, r * 0.1) * 20]);
    polyline(ctx, pts, r % 5 === 0 ? ink : sand, r % 5 === 0 ? 2.4 : 1.4);
  }
  return 'dunes';
}

function waveInterference(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const [c1, c2] = hues(ctx, 2, [bg]);
  const src = [[ctx.between(40, 100), ctx.between(80, 160)], [ctx.between(140, 200), ctx.between(230, 320)]];
  const k = ctx.between(0.12, 0.2);
  dotField(ctx, [X0, Y0, 212, 298], 8.8, (x, y) => {
    const v = src.reduce((acc, [sx, sy]) => acc + Math.sin(Math.hypot(x - sx, y - sy) * k), 0);
    return 1 + Math.abs(v) * 1.5;
  }, (x, y) => (src.reduce((acc, [sx, sy]) => acc + Math.sin(Math.hypot(x - sx, y - sy) * k), 0) > 0 ? c1 : c2), 6);
  return 'wave interference';
}

function recursiveTriangles(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const tris = [];
  const go = (a, b, c, d) => {
    const longest = [[a, b, c], [b, c, a], [c, a, b]].sort((p, q) => Math.hypot(q[0][0] - q[1][0], q[0][1] - q[1][1]) - Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]))[0];
    if (d > 6 || (d > 2 && ctx.rand() < 0.25)) {
      tris.push([a, b, c, d]);
      return;
    }
    const [p, q, r] = longest;
    const t = ctx.between(0.35, 0.65);
    const m = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    go(p, m, r, d + 1);
    go(m, q, r, d + 1);
  };
  go([X0, Y0], [X1, Y0], [X1, Y1], 0);
  go([X0, Y0], [X1, Y1], [X0, Y1], 0);
  const b = batcher(ctx, 4);
  tris.forEach(([a, c, e, d], i) => b.add(`<polygon points="${K.pts([a, c, e])}" fill="${pal[(i + d) % 5]}" stroke="${bg}" stroke-width="1.5"/>`, Math.min(a[0], c[0], e[0]), Math.min(a[1], c[1], e[1]), Math.max(a[0], c[0], e[0]), Math.max(a[1], c[1], e[1])));
  b.flush();
  return 'recursive triangles';
}

function binarySplits(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg, ctx.ink]);
  const rects = [[X0, Y0, 212, 298]];
  for (let k = 0; k < 12; k++) {
    const i = ctx.int(0, rects.length - 1);
    const [x, y, w, h] = rects[i];
    if (w < 40 && h < 40) continue;
    const vertical = w > h ? ctx.rand() < 0.8 : ctx.rand() < 0.2;
    const t = ctx.pick([0.33, 0.5, 0.62]);
    rects.splice(i, 1, ...(vertical ? [[x, y, w * t, h], [x + w * t, y, w * (1 - t), h]] : [[x, y, w, h * t], [x, y + h * t, w, h * (1 - t)]]));
  }
  rects.forEach(([x, y, w, h], i) => {
    const fill = ctx.rand() < 0.35 ? pal[i % 3] : bg;
    ctx.poly(R(x + 3, y + 3, w - 6, h - 6), fill, still);
  });
  return 'binary splits';
}

function randomWalkers(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const n = ctx.int(5, 8);
  const step = ctx.pick([6, 8, 10]);
  for (let w = 0; w < n; w++) {
    let [x, y] = [CX + ctx.between(-30, 30), CY + ctx.between(-30, 30)];
    const pts = [[x, y]];
    for (let s = 0; s < 160; s++) {
      const [dx, dy] = ctx.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      x = Math.max(X0 + 8, Math.min(X1 - 8, x + dx * step));
      y = Math.max(Y0 + 8, Math.min(Y1 - 8, y + dy * step));
      pts.push([x, y]);
    }
    polyline(ctx, pts, pal[w % 5], 2.6);
  }
  return 'random walkers';
}

function attractor(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const [a, b, c, d] = [ctx.between(-2, -1.2), ctx.between(1.4, 2), ctx.between(-1.2, 1.2), ctx.between(-1.4, -0.6)];
  let x = 0.1;
  let y = 0.1;
  const pts = [];
  for (let i = 0; i < 3200; i++) {
    [x, y] = [Math.sin(a * y) + c * Math.cos(a * x), Math.sin(b * x) + d * Math.cos(b * y)];
    if (i > 20) pts.push([x, y]);
  }
  const [bx0, by0, bx1, by1] = K.boundsOf(pts);
  const k = Math.min(196 / (bx1 - bx0 || 1), 280 / (by1 - by0 || 1));
  const bat = batcher(ctx, 160);
  pts.forEach(([px, py], i) => {
    const sx = CX + (px - (bx0 + bx1) / 2) * k;
    const sy = CY + (py - (by0 + by1) / 2) * k;
    bat.add(dot(sx, sy, 0.9, pal[i % 3]), sx - 1, sy - 1, sx + 1, sy + 1);
  });
  bat.flush();
  return 'strange attractor';
}

function branchingWeed(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const spread = ctx.between(0.3, 0.6);
  const b = batcher(ctx, 12);
  const grow = (x, y, a, len, d) => {
    const [x2, y2] = pol(x, y, len, a);
    b.add(`<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${pal[d % 3]}" stroke-width="${fmt(Math.max(1, 5 - d * 0.7))}" stroke-linecap="round"/>`, Math.min(x, x2), Math.min(y, y2), Math.max(x, x2), Math.max(y, y2));
    if (d >= 7) return;
    const forks = ctx.rand() < 0.3 ? 3 : 2;
    for (let f = 0; f < forks; f++) grow(x2, y2, a + (f - (forks - 1) / 2) * spread * 2 + ctx.between(-0.15, 0.15), len * ctx.between(0.68, 0.82), d + 1);
  };
  grow(CX, Y1, -Math.PI / 2, ctx.between(60, 76), 0);
  b.flush();
  return 'branching weed';
}

function noiseTiles(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = K.noise2(ctx.seed);
  const s = 23.5;
  for (let j = 0; j < 13; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < 9; i++) {
      const x = X0 + i * s + s / 2;
      const y = Y0 + j * s + s / 2;
      const v = n(i * 0.25, j * 0.25);
      const sz = s * (0.3 + v * 0.7);
      b.add(`<rect x="${fmt(x - sz / 2)}" y="${fmt(y - sz / 2)}" width="${fmt(sz)}" height="${fmt(sz)}" fill="${pal[Math.floor(v * 4) % 4]}" transform="rotate(${fmt(v * 180)} ${fmt(x)} ${fmt(y)})"/>`, x - s / 2, y - s / 2, x + s / 2, y + s / 2);
    }
    b.flush();
  }
  return 'noise tiles';
}

function wobblyRings(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = K.noise2(ctx.seed);
  for (let k = 1; k <= 16; k++) {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * TAU;
      pts.push(pol(CX, CY, k * 7 + n(Math.cos(a) + k * 0.2, Math.sin(a) + k * 0.2) * 14, a));
    }
    polyline(ctx, pts, pal[k % 4], 2.4);
  }
  return 'wobbly rings';
}

function pixelSort(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 8, []);
  const cols = 24;
  const w = 212 / cols;
  const n = K.noise2(ctx.seed);
  for (let i = 0; i < cols; i += 3) {
    const b = batcher(ctx, 999);
    for (let ii = i; ii < Math.min(cols, i + 3); ii++) {
      let y = Y0;
      const runs = [];
      while (y < Y1) {
        const h = 6 + n(ii * 0.3, y * 0.02) * 40;
        runs.push([y, Math.min(h, Y1 - y), Math.floor(n(ii * 0.1, y * 0.01) * 8)]);
        y += h;
      }
      const start = ctx.int(0, runs.length - 1);
      const sorted = runs.slice(start).map((r) => r[2]).sort((a, c) => a - c);
      runs.forEach(([yy, h, c], k) => {
        const col = k >= start ? sorted[k - start] : c;
        b.add(`<rect x="${fmt(X0 + ii * w)}" y="${fmt(yy)}" width="${fmt(w + 0.3)}" height="${fmt(h + 0.3)}" fill="${pal[col % 8]}"/>`, X0 + ii * w, yy, X0 + ii * w + w, yy + h);
      });
    }
    b.flush();
  }
  return 'pixel sort';
}

function dotStream(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.colors[1]]);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const n = K.noise2(ctx.seed);
  const b = batcher(ctx, 60);
  for (let k = 0; k < 40; k++) {
    let x = X0 + 4;
    let y = Y0 + (k + 0.5) * (298 / 40);
    for (let s = 0; s < 22 && inside(x, y); s++) {
      const r = 1 + (s / 22) * 3;
      b.add(dot(x, y, r, pal[k % 3]), x - r, y - r, x + r, y + r);
      const a = (n(x * 0.012, y * 0.012) - 0.5) * 2.4;
      x += Math.cos(a) * 10;
      y += Math.sin(a) * 10;
    }
  }
  b.flush();
  return 'dot stream';
}

function packedSquares(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const placed = [];
  for (let t = 0; t < 800 && placed.length < 70; t++) {
    const x = ctx.between(X0 + 6, X1 - 6);
    const y = ctx.between(Y0 + 6, Y1 - 6);
    let s = Math.min(x - X0, X1 - x, y - Y0, Y1 - y, 40) - 3;
    for (const [px, py, ps] of placed) s = Math.min(s, Math.max(Math.abs(x - px), Math.abs(y - py)) - ps - 3);
    if (s > 3) placed.push([x, y, s]);
  }
  const b = batcher(ctx, 4);
  placed.forEach(([x, y, s], i) => b.add(`<rect x="${fmt(x - s)}" y="${fmt(y - s)}" width="${fmt(s * 2)}" height="${fmt(s * 2)}" fill="${pal[i % 4]}"/>`, x - s, y - s, x + s, y + s));
  b.flush();
  return 'packed squares';
}

module.exports = { flowField, circlePacking, quadtree, ridgelines, contours, hilbertCurve, dragonCurve, nestedPacking, jitterTriangles, cellularAutomaton, gameOfLife, harmonograph, roseCurves, superformula, dunes, waveInterference, recursiveTriangles, binarySplits, randomWalkers, attractor, branchingWeed, noiseTiles, wobblyRings, pixelSort, dotStream, packedSquares };
