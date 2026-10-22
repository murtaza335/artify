'use strict';

// Systems and early computer art, re-imagined: lines in four directions, arcs, isometric washes, bands of lines,
// zigzags and plus-minus fields from random numbers, walk-through rasters, Markov paintings, symbol mosaics, warped
// lines, permutation dots, random polygons and squares, lines from the digits of pi, loop rows, fixed stripes, brush
// imprints, a serial project, a four-colour map, XOR patterns, Langton's ant, sandpiles, aggregation clusters,
// punched cards and teletext blocks.

const K = require('./pattern-kit');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, hatchRect, splitPoly, runs, gridOf } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const PI_DIGITS = '314159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196';

const gauss = (ctx) => Math.sqrt(-2 * Math.log(Math.max(1e-6, ctx.rand()))) * Math.cos(TAU * ctx.rand());

function fourDirections(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = 2;
  const rows = 3;
  const cw = W / cols;
  const ch = H / rows;
  const gap = ctx.between(3.4, 5);
  const items = [];
  const angles = [Math.PI / 2, 0, Math.PI / 4, -Math.PI / 4];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const set = [mod(i + j * 2, 4), mod(i + j * 2 + 1 + ctx.int(0, 2), 4)];
    const n = j === 0 ? 1 : j === 1 ? 2 : 3;
    for (let k = 0; k < n; k++) hatchRect(X0 + i * cw + 3, Y0 + j * ch + 3, cw - 6, ch - 6, angles[mod(set[0] + k, 4)], gap, k).forEach((seg) => items.push(layer(line(seg, pal[mod(k, 4)], 1), k)));
  }
  flush(ctx, items, 1);
  return 'four directions';
}

function arcsAndLines(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = 2;
  const rows = 3;
  const cw = W / cols;
  const ch = H / rows;
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + i * cw;
    const y = Y0 + j * ch;
    const corner = ctx.int(0, 3);
    const [ox, oy] = [[x, y], [x + cw, y], [x + cw, y + ch], [x, y + ch]][corner];
    const a0 = (corner * Math.PI) / 2;
    for (let r = 10; r < cw * 1.2; r += ctx.between(7, 10)) {
      const pts = Array.from({ length: 16 }, (_, k) => pol(ox, oy, r, a0 + (k / 15) * (Math.PI / 2)));
      const clipped = pts.filter((p) => p[0] >= x && p[0] <= x + cw && p[1] >= y && p[1] <= y + ch);
      if (clipped.length > 1) items.push(line(clipped, pal[mod(i + j + Math.floor(r / 20), 4)], 1.2));
    }
  }
  flush(ctx, items, 1);
  return 'arcs and lines';
}

function isometricWashes(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const u = ctx.between(26, 34);
  const iso = (x, y, z) => [CX + (x - y) * u * 0.866, CY + 40 + (x + y) * u * 0.5 - z * u];
  const items = [];
  const boxes = [[0, 0, 3, 3, 1], [0, 0, 2, 2, 3], [1, 1, 1, 1, 4]];
  boxes.forEach(([x, y, w, d, h], k) => {
    const f = (a, b, c) => iso(x + a * w - 1.5, y + b * d - 1.5, c * h);
    items.push(layer(poly([f(0, 1, 1), f(1, 1, 1), f(1, 1, 0), f(0, 1, 0)], pal[0], 0.55), k), layer(poly([f(1, 0, 1), f(1, 1, 1), f(1, 1, 0), f(1, 0, 0)], pal[1], 0.55), k), layer(poly([f(0, 0, 1), f(1, 0, 1), f(1, 1, 1), f(0, 1, 1)], pal[2], 0.55), k));
    [[f(0, 0, 1), f(1, 0, 1), f(1, 1, 1), f(0, 1, 1)], [f(0, 1, 1), f(1, 1, 1), f(1, 1, 0), f(0, 1, 0)], [f(1, 0, 1), f(1, 1, 1), f(1, 1, 0), f(1, 0, 0)]].forEach((q) => items.push(layer(line(q, ink, 1.4, true), k + 4)));
  });
  flush(ctx, items, 1);
  return 'isometric washes';
}

function bandsOfLines(ctx) {
  const { pal } = setup(ctx, 4);
  const bands = 4;
  const bh = H / bands;
  const gap = ctx.between(3.2, 5);
  const items = [];
  const sets = [[Math.PI / 2], [0], [Math.PI / 4], [Math.PI / 2, 0, Math.PI / 4]];
  const order = [0, 1, 2, 3].sort(() => ctx.rand() - 0.5);
  order.forEach((s, b) => sets[s].forEach((a, k) => hatchRect(X0 + 2, Y0 + b * bh + 2, W - 4, bh - 4, a, gap, k * 1.3).forEach((seg) => items.push(line(seg, pal[b % 4], 1)))));
  flush(ctx, items, 1);
  return 'bands of lines';
}

function gaussianZigzag(ctx) {
  const { pal } = setup(ctx, 4);
  const sigma = ctx.between(30, 52);
  const n = ctx.int(30, 50);
  const items = [];
  for (let k = 0; k < 3; k++) {
    const pts = Array.from({ length: n }, (_, i) => [Math.max(X0 + 6, Math.min(X1 - 6, CX + gauss(ctx) * sigma)), Y0 + 6 + (i / (n - 1)) * (H - 12)]);
    items.push(line(pts, pal[k], 1.6 + k * 0.4));
  }
  flush(ctx, items, 1);
  return 'gaussian zigzag';
}

function plusMinus(ctx) {
  const { pal } = setup(ctx, 3);
  const s = ctx.between(11, 14);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (W - cols * s) / 2 + (i + 0.5) * s;
    const y = Y0 + (H - rows * s) / 2 + (j + 0.5) * s;
    const d = Math.hypot((x - CX) / 95, (y - CY) / 135);
    if (ctx.rand() > 1.25 - d * 0.9 && d > 0.2) continue;
    const plus = ctx.rand() < 0.5;
    const c = pal[plus ? 0 : 1];
    items.push(line([[x - s * 0.3, y], [x + s * 0.3, y]], c, 1.6));
    if (plus) items.push(line([[x, y - s * 0.3], [x, y + s * 0.3]], c, 1.6));
  }
  flush(ctx, items, 1);
  return 'plus and minus';
}

function walkThroughRaster(ctx) {
  const { pal } = setup(ctx, 4);
  const cols = ctx.int(4, 6);
  const rows = ctx.int(7, 10);
  const cw = W / cols;
  const ch = H / rows;
  let dir = ctx.int(0, 3);
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    dir = mod(dir + ctx.pick([-1, 0, 1]), 4);
    hatchRect(X0 + i * cw + 2, Y0 + j * ch + 2, cw - 4, ch - 4, (dir * Math.PI) / 4, 3.4).forEach((seg) => items.push(line(seg, pal[dir % 4], 1)));
  }
  flush(ctx, items, 3);
  return 'walk-through raster';
}

function homageBands(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const bands = ctx.int(5, 8);
  const bh = H / bands;
  const items = [];
  for (let b = 0; b < bands; b++) {
    const y = Y0 + b * bh;
    const kind = ctx.int(0, 2);
    for (let x = X0 + 6; x < X1 - 4; x += 9) {
      if (kind === 0) items.push(line([[x, y + 4], [x, y + bh - 4]], pal[b % 4], 1.6));
      else if (kind === 1) items.push(circ(x + 2, y + bh / 2, bh * 0.26, pal[b % 4]));
      else items.push(line([[x - 3, y + bh - 4], [x + 3, y + 4]], pal[b % 4], 1.6));
    }
  }
  flush(ctx, items, 3);
  return 'banded homage';
}

function markovPainting(ctx) {
  const { pal } = setup(ctx, 5);
  const cols = ctx.int(9, 12);
  const rows = ctx.int(13, 17);
  const stay = ctx.between(0.45, 0.75);
  let c = ctx.int(0, 4);
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (ctx.rand() > stay) c = ctx.rand() < 0.6 ? mod(c + ctx.pick([1, 2, -1]), 5) : ctx.int(0, 4);
    items.push(poly(rp(X0 + (i * W) / cols + 0.5, Y0 + (j * H) / rows + 0.5, W / cols - 1, H / rows - 1), pal[c]));
  }
  flush(ctx, items, 3);
  return 'markov painting';
}

function symbolMosaic(ctx) {
  const { pal } = setup(ctx, 3);
  const s = ctx.between(9, 11);
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  const bx = ctx.between(-0.2, 0.2);
  const by = ctx.between(-0.2, 0.2);
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const u = (i / cols) * 2 - 1 - bx;
    const v = (j / rows) * 2 - 1 - by;
    const val = Math.max(0, 1 - Math.hypot(u * 1.2, v * 0.9)) + (ctx.rand() - 0.5) * 0.2;
    const k = Math.floor(val * 6);
    const x = X0 + (W - cols * s) / 2 + (i + 0.5) * s;
    const y = Y0 + (H - rows * s) / 2 + (j + 0.5) * s;
    const c = pal[k % 2];
    if (k <= 0) continue;
    if (k === 1) items.push(circ(x, y, 0.9, c));
    else if (k === 2) items.push(line([[x - 2, y], [x + 2, y]], c, 1.2));
    else if (k === 3) { items.push(line([[x - 2.5, y], [x + 2.5, y]], c, 1.2)); items.push(line([[x, y - 2.5], [x, y + 2.5]], c, 1.2)); }
    else if (k === 4) items.push(ring(x, y, 2.6, c, 1.2));
    else items.push(poly(rp(x - 3, y - 3, 6, 6), pal[2]));
  }
  flush(ctx, items, 3);
  return 'symbol mosaic';
}

function sineWarp(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(26, 40);
  const items = [];
  const f = ctx.between(0.04, 0.09);
  const A = ctx.between(6, 16);
  const ph = ctx.between(0.15, 0.4);
  for (let i = 0; i < n; i++) {
    const y = Y0 + 8 + ((H - 16) * i) / (n - 1);
    const amp = A * Math.sin((i / n) * Math.PI);
    items.push(line(Array.from({ length: 50 }, (_, k) => [X0 + (k / 49) * W, y + Math.sin(k * 0.5 * f * 20 + i * ph) * amp]), pal[i % 3], 1.2));
  }
  flush(ctx, items, 1);
  return 'sine warp';
}

function permutationDots(ctx) {
  const { pal } = setup(ctx, 4);
  const items = [];
  const n = ctx.int(7, 10);
  const t = ctx.between(0, TAU);
  for (let i = 1; i <= n; i++) {
    const r = (100 * i) / n;
    items.push(ring(CX, CY, r, pal[0], 0.5));
    for (let k = 0; k < i; k++) items.push(layer(circ(...pol(CX, CY, r, (k * TAU) / i + t * i), 3.2, pal[1 + (i % 3)]), 1));
  }
  flush(ctx, items, 3);
  return 'permutation dots';
}

function polygonWalk(ctx) {
  const { pal } = setup(ctx, 4);
  const cols = 3;
  const rows = 4;
  const cw = W / cols;
  const ch = H / rows;
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const pts = Array.from({ length: ctx.int(10, 16) }, () => [X0 + i * cw + ctx.between(6, cw - 6), Y0 + j * ch + ctx.between(6, ch - 6)]);
    items.push(line(pts, pal[mod(i + j, 4)], 1.2, true));
  }
  flush(ctx, items, 3);
  return 'random polygons';
}

function randomSquares(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const cols = ctx.int(14, 20);
  const rows = Math.floor((cols * H) / W);
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const v = ctx.rand();
    if (v < 0.35) continue;
    items.push(poly(rp(X0 + (i * W) / cols + 1, Y0 + (j * H) / rows + 1, W / cols - 2, H / rows - 2), v < 0.7 ? pal[0] : pal[1]));
  }
  flush(ctx, items, 3);
  return 'random distribution';
}

function piLines(ctx) {
  const { pal } = setup(ctx, 4);
  const cols = ctx.int(8, 11);
  const rows = Math.floor((cols * H) / W);
  const items = [];
  let k = ctx.int(0, 40);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const d = +PI_DIGITS[k++ % PI_DIGITS.length];
    const a = (d / 10) * Math.PI;
    const x = X0 + ((i + 0.5) * W) / cols;
    const y = Y0 + ((j + 0.5) * H) / rows;
    const L = Math.min(W / cols, H / rows) * 0.44;
    items.push(line([[x - Math.cos(a) * L, y - Math.sin(a) * L], [x + Math.cos(a) * L, y + Math.sin(a) * L]], pal[d % 4], 2));
  }
  flush(ctx, items, 3);
  return 'pi lines';
}

function loopRows(ctx) {
  const { pal } = setup(ctx, 3);
  const rows = ctx.int(10, 15);
  const items = [];
  for (let r = 0; r < rows; r++) {
    const y = Y0 + 14 + ((H - 28) * r) / (rows - 1);
    const R = ctx.between(4, 7);
    const step = ctx.between(3, 6);
    const pts = Array.from({ length: 90 }, (_, i) => {
      const t = (i / 89) * TAU * 12;
      return [X0 + 6 + (i / 89) * (W - 12) + Math.cos(t) * R, y + Math.sin(t) * R * 1.2 - Math.sin(t * 0.5) * 1.5];
    });
    items.push(line(pts, pal[r % 3], 1.2));
  }
  flush(ctx, items, 1);
  return 'loop rows';
}

function fixedStripes(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const w = ctx.between(10, 16);
  const items = [];
  for (let x = X0, k = 0; x < X1; x += w, k++) if (k % 2 === 0) items.push(poly(rp(x, Y0, Math.min(w, X1 - x), H), pal[0]));
  const cut = rp(ctx.between(X0 + 20, CX), ctx.between(Y0 + 40, CY), ctx.between(60, 110), ctx.between(80, 150));
  items.push(layer(poly(cut, pal[1]), 1));
  for (let x = cut[0][0], k = 1; x < cut[1][0]; x += w, k++) if (k % 2) items.push(layer(poly(rp(x, cut[0][1], Math.min(w, cut[1][0] - x), cut[2][1] - cut[0][1]), pal[2]), 2));
  flush(ctx, items, 1);
  return 'fixed stripes';
}

function brushImprints(ctx) {
  const { pal } = setup(ctx, 3);
  const s = ctx.between(28, 38);
  const items = [];
  const k = ctx.between(0.4, 0.7);
  K.eachCell(s, s, (i, j, x, y) => {
    const tilt = mod(i + j, 2) ? 0.06 : -0.06;
    items.push(poly(rotPts(rp(x + s * 0.15, y + s * 0.15, s * k, s * k), x + s / 2, y + s / 2, tilt), pal[mod(i + j, 2)]));
  });
  flush(ctx, items.filter((it) => K.inFrame(it.b)), 3);
  return 'brush imprints';
}

function serialProject(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = 3;
  const rows = 4;
  const cw = W / cols;
  const ch = H / rows;
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = X0 + (i + 0.5) * cw;
    const cy = Y0 + (j + 0.5) * ch;
    const n = 1 + ((i + j * cols) % 5);
    const s = Math.min(cw, ch) * 0.42;
    for (let k = n; k >= 1; k--) items.push(layer(line(rp(cx - (s * k) / n, cy - (s * k) / n, (2 * s * k) / n, (2 * s * k) / n), pal[mod(j, 4)], 1.4, true), n - k));
    if (i % 2) items.push(layer(circ(cx, cy, 2.4, pal[2]), 6));
  }
  flush(ctx, items, 1);
  return 'serial project';
}

function fourColorMap(ctx) {
  const { pal, ink } = setup(ctx, 5);
  let cells = [rp(X0 + 6, Y0 + 6, W - 12, H - 12)];
  for (let k = 0; k < ctx.int(14, 22); k++) {
    const i = ctx.int(0, cells.length - 1);
    const m = centroid(cells[i]);
    const parts = splitPoly(cells[i], [m[0] + ctx.between(-14, 14), m[1] + ctx.between(-14, 14)], ctx.between(0, Math.PI));
    if (parts.length === 2) cells.splice(i, 1, ...parts);
  }
  const samples = cells.map((c) => c.flatMap((p, i) => {
    const q = c[(i + 1) % c.length];
    return Array.from({ length: 6 }, (_, t) => [p[0] + ((q[0] - p[0]) * t) / 6, p[1] + ((q[1] - p[1]) * t) / 6]);
  }));
  const near = (a, b) => samples[a].some((p) => samples[b].some((q) => Math.abs(p[0] - q[0]) < 0.6 && Math.abs(p[1] - q[1]) < 0.6));
  const color = [];
  cells.forEach((c, i) => {
    const used = new Set();
    for (let j = 0; j < i; j++) if (near(i, j)) used.add(color[j]);
    let k = 0;
    while (used.has(k)) k++;
    color[i] = k;
  });
  const items = cells.map((c, i) => poly(c, pal[color[i] % 5]));
  cells.forEach((c) => items.push(layer(line(c, ink, 2, true), 1)));
  flush(ctx, items, 1);
  return 'four-colour map';
}

function xorPattern(ctx) {
  const { pal } = setup(ctx, 5);
  const s = ctx.between(7, 9);
  const mask = ctx.pick([3, 7, 15, 5, 11]);
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  const ox = ctx.int(0, 15);
  const oy = ctx.int(0, 15);
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const v = ((i + ox) ^ (j + oy)) & mask;
    if (v === 0) continue;
    items.push(poly(rp(X0 + i * s, Y0 + j * s, s - 0.5, s - 0.5), pal[v % 5]));
  }
  flush(ctx, items, 3);
  return 'xor pattern';
}

function langtonAnt(ctx) {
  const { pal } = setup(ctx, 5);
  const w = 48;
  const h = 68;
  const rule = ctx.pick(['RLR', 'LLRR', 'RLLR', 'LRRL', 'RRLL']);
  const grid = new Uint8Array(w * h);
  let x = Math.floor(w / 2);
  let y = Math.floor(h / 2);
  let d = 0;
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  const steps = ctx.int(7000, 12000);
  for (let s = 0; s < steps; s++) {
    const st = grid[y * w + x];
    d = mod(d + (rule[st] === 'R' ? 1 : -1), 4);
    grid[y * w + x] = (st + 1) % rule.length;
    x = mod(x + dx[d], w);
    y = mod(y + dy[d], h);
  }
  const cw = W / w;
  const ch = H / h;
  const items = [];
  for (let k = 1; k < rule.length; k++) items.push(path(runs(grid, w, h, (v) => v === k, X0, Y0, cw, ch), pal[k % 5], [X0, Y0, X1, Y1]));
  flush(ctx, items, 3);
  return "langton's ant";
}

function sandpile(ctx) {
  const { pal } = setup(ctx, 4);
  const w = 37;
  const h = 53;
  const g = new Int32Array(w * h);
  g[Math.floor(h / 2) * w + Math.floor(w / 2)] = ctx.int(1800, 3000);
  let changed = true;
  let guard = 0;
  while (changed && guard++ < 400) {
    changed = false;
    for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
      const v = g[j * w + i];
      if (v >= 4) {
        const t = v >> 2;
        g[j * w + i] = v - t * 4;
        g[j * w + i - 1] += t;
        g[j * w + i + 1] += t;
        g[(j - 1) * w + i] += t;
        g[(j + 1) * w + i] += t;
        changed = true;
      }
    }
  }
  const cw = W / w;
  const ch = H / h;
  const items = [];
  for (let k = 1; k <= 3; k++) items.push(path(runs(g, w, h, (v) => v === k, X0, Y0, cw, ch), pal[k - 1], [X0, Y0, X1, Y1]));
  flush(ctx, items, 3);
  return 'sandpile';
}

function dlaCluster(ctx) {
  const { pal } = setup(ctx, 4);
  const w = 38;
  const h = 54;
  const grid = new Int16Array(w * h).fill(-1);
  const seeds = ctx.int(1, 3);
  const mx = w / 2;
  const my = h / 2;
  for (let s = 0; s < seeds; s++) grid[ctx.int(my - 6, my + 6) * w + ctx.int(mx - 4, mx + 4)] = 0;
  const total = ctx.int(120, 190);
  let reach = 8;
  for (let n = 1; n <= total; n++) {
    for (let tries = 0; tries < 4; tries++) {
      const a = ctx.rand() * TAU;
      let x = Math.round(mx + Math.cos(a) * Math.min(w / 2 - 2, reach + 2));
      let y = Math.round(my + Math.sin(a) * Math.min(h / 2 - 2, (reach + 2) * 1.3));
      let stuck = false;
      for (let s = 0; s < 220 && !stuck; s++) {
        const r4 = (ctx.rand() * 4) | 0;
        x = Math.max(1, Math.min(w - 2, x + (r4 === 0 ? -1 : r4 === 1 ? 1 : 0)));
        y = Math.max(1, Math.min(h - 2, y + (r4 === 2 ? -1 : r4 === 3 ? 1 : 0)));
        if (Math.hypot(x - mx, (y - my) / 1.3) > reach + 7) break;
        if (grid[(y - 1) * w + x] >= 0 || grid[(y + 1) * w + x] >= 0 || grid[y * w + x - 1] >= 0 || grid[y * w + x + 1] >= 0) {
          grid[y * w + x] = n;
          reach = Math.max(reach, Math.hypot(x - mx, (y - my) / 1.3));
          stuck = true;
        }
      }
      if (stuck) break;
    }
  }
  const cw = W / w;
  const ch = H / h;
  const items = [];
  for (let k = 0; k < 4; k++) items.push(path(runs(grid, w, h, (v) => v >= 0 && Math.min(3, Math.floor((v / total) * 4)) === k, X0, Y0, cw, ch), pal[k], [X0, Y0, X1, Y1]));
  flush(ctx, items, 3);
  return 'aggregation';
}

function punchCard(ctx) {
  const { pal, ink, paper } = setup(ctx, 3);
  const items = [];
  const card = [[X0 + 20, Y0 + 12], [X1 - 20, Y0 + 12], [X1 - 20, Y1 - 12], [X0 + 20, Y1 - 12]];
  const notch = [[X0 + 20, Y0 + 12], [X0 + 50, Y0 + 12], [X0 + 20, Y0 + 42]];
  items.push(poly(card, paper), layer(poly(notch, ctx.colors[0]), 1));
  const rows = 12;
  const cols = 34;
  const dens = ctx.between(0.25, 0.55);
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) if (ctx.rand() < dens) items.push(layer(poly(rp(X0 + 28 + (r * (W - 56)) / rows, Y0 + 30 + (c * (H - 60)) / cols, (W - 56) / rows - 3, (H - 60) / cols - 2.6), ink), 2));
  items.push(layer(poly(rp(X0 + 28, Y0 + 20, W - 56, 4), pal[0]), 1));
  flush(ctx, items, 3);
  return 'punched card';
}

function teletextMosaic(ctx) {
  const { pal } = setup(ctx, 5);
  const bw = ctx.between(5, 6.5);
  const cols = Math.floor(W / bw);
  const rows = Math.floor(H / (bw * 1.1));
  const items = [];
  const a = ctx.between(0.15, 0.45);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const u = (i / cols) * 2 - 1;
    const v = (j / rows) * 2 - 1;
    const inCircle = Math.hypot(u, v * 0.8 + 0.2) < 0.55;
    const diag = Math.abs(u - v * 1.4 + a) < 0.1;
    const wedge = v > 0.35 && Math.abs(u) < (1 - v) * 1.6;
    const k = inCircle ? 1 : diag ? 2 : wedge ? 3 : (i + j) % 7 === 0 ? 4 : -1;
    if (k < 0) continue;
    items.push(poly(rp(X0 + i * bw + 0.5, Y0 + j * bw * 1.1 + 0.5, bw - 1, bw * 1.1 - 1), pal[k % 5]));
  }
  flush(ctx, items, 3);
  return 'teletext blocks';
}

module.exports = {
  fourDirections, arcsAndLines, isometricWashes, bandsOfLines, gaussianZigzag, plusMinus, walkThroughRaster, homageBands,
  markovPainting, symbolMosaic, sineWarp, permutationDots, polygonWalk, randomSquares, piLines, loopRows, fixedStripes,
  brushImprints, serialProject, fourColorMap, xorPattern, langtonAnt, sandpile, dlaCluster, punchCard, teletextMosaic
};
