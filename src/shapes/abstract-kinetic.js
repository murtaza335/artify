'use strict';

// Kinetic and light art, re-imagined: vibrating wires, colour slats, induction bands, chromatic interference, a
// two-way picture, scattered squares, a light modulator, string constructions, metal and studded reliefs, swollen
// canvas, mirror fragments, relief cells, a wire net, light ripples, turning planes, colour discs, canvas holes, a
// glowing disc, strobe rods, louvres, a lens grid, lenticular ribs, interwoven stripes, a light curtain and
// perforated plates.

const K = require('./pattern-kit');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, ell, splitPoly, smoothPath } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function vibratingWires(ctx) {
  const { pal, ink, paper } = setup(ctx, 3);
  const items = [];
  const p = ctx.between(3.2, 4.4);
  for (let x = X0; x < X1; x += p) items.push(line([[x, Y0], [x, Y1]], pal[0], p * 0.45));
  const q = p * ctx.between(1.05, 1.14);
  for (let x = X0; x < X1; x += q) items.push(layer(line([[x + 2, Y0 + 60], [x + 2, Y1 - 40]], ink, 1), 1));
  const n = ctx.int(14, 20);
  for (let i = 0; i < n; i++) {
    const x = X0 + 10 + ((W - 20) * i) / (n - 1);
    items.push(layer(line([[x, Y0 + 20], [x, Y0 + 60 + ctx.between(0, 60)]], pal[2], 1.2), 2));
    items.push(layer(circ(x, Y0 + 60 + ctx.between(0, 60), 2.2, pal[1]), 2));
  }
  flush(ctx, items, 3);
  return 'vibrating wires';
}

function colorSlats(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const bands = ctx.int(5, 8);
  const bh = H / bands;
  for (let b = 0; b < bands; b++) items.push(poly(rp(X0, Y0 + b * bh, W, bh), pal[b % 3]));
  const step = ctx.between(6, 9);
  const lean = ctx.between(-0.6, 0.6);
  for (let x = X0 - 40; x < X1 + 40; x += step) {
    const top = [x, Y0];
    items.push(layer(poly([[x, Y0], [x + step * 0.45, Y0], [x + step * 0.45 + lean * H, Y1], [x + lean * H, Y1]], pal[3], 0.55), 1));
    items.push(layer(poly([[x + step * 0.5, Y0], [x + step * 0.7, Y0], [x + step * 0.7 + lean * H, Y1], [x + step * 0.5 + lean * H, Y1]], pal[4], 0.45), 1));
  }
  flush(ctx, items, 3);
  return 'colour slats';
}

function inductionBands(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const cols = ctx.int(3, 5);
  const cw = W / cols;
  for (let c = 0; c < cols; c++) items.push(poly(rp(X0 + c * cw, Y0, cw, H), pal[c % 4]));
  const p = ctx.between(5, 8);
  for (let c = 0; c < cols; c++) for (let y = Y0 - 10; y < Y1 + 10; y += p) items.push(layer(line([[X0 + c * cw, y + (c % 2 ? 10 : 0)], [X0 + (c + 1) * cw, y + (c % 2 ? 0 : 10)]], c % 2 ? ink : pal[4], p * 0.28), 1));
  flush(ctx, items, 3);
  return 'induction colour';
}

function chromaInterference(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const p = ctx.between(4, 6);
  const tilt = ctx.between(0.02, 0.07);
  for (let x = X0 - 40; x < X1 + 40; x += p) items.push(line([[x, Y0], [x + 20, Y1]], pal[0], p * 0.5));
  for (let x = X0 - 40; x < X1 + 40; x += p * 1.06) items.push(layer(line([[x, Y0], [x + 20 + tilt * H * 3, Y1]], pal[1], p * 0.5), 1));
  for (let x = X0 - 40; x < X1 + 40; x += p * 1.12) items.push(layer(line([[x, Y0], [x - 20 - tilt * H * 2, Y1]], pal[2], p * 0.4, false), 2));
  items.forEach((it) => it.svg.includes('stroke') && (it.svg = it.svg.replace('stroke-linecap="round"', 'stroke-linecap="butt" opacity="0.8"')));
  flush(ctx, items, 3);
  return 'chromatic interference';
}

function agamograph(ctx) {
  const { pal } = setup(ctx, 5);
  const strips = ctx.int(16, 24);
  const rows = 26;
  const sw = W / strips;
  const rh = H / rows;
  const pictureA = (u, v) => Math.floor((Math.abs(u) + Math.abs(v)) * 7) % 5;
  const pictureB = (u, v) => Math.floor((v + 1) * 4.5 + u * 1.2) % 5;
  const items = [];
  for (let i = 0; i < strips; i++) {
    for (let j = 0; j < rows; j++) {
      const u = (i / strips) * 2 - 1;
      const v = (j / rows) * 2 - 1;
      const col = pal[Math.abs(i % 2 ? pictureA(u, v) : pictureB(u, v)) % 5];
      const x = X0 + i * sw;
      const y = Y0 + j * rh;
      const d = sw * 0.45 * (i % 2 ? 1 : -1);
      items.push(poly([[x, y], [x + sw, y + d], [x + sw, y + rh + d], [x, y + rh]], col));
    }
  }
  flush(ctx, items, 3);
  return 'two-way picture';
}

function scatteredSquares(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(15, 20);
  const amp = s * ctx.between(0.4, 1);
  const f = ctx.between(0.02, 0.05);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (i + 0.5) * s + Math.sin(j * s * f * 3 + i * 0.3) * amp;
    const y = Y0 + (j + 0.5) * s + Math.cos(i * s * f * 3) * amp * 0.5;
    const k = s * (0.2 + 0.28 * (0.5 + 0.5 * Math.sin(i * 0.5 + j * 0.35)));
    items.push(poly(K.rotPts(rp(x - k, y - k, k * 2, k * 2), x, y, Math.sin(i * 0.4 + j * 0.2) * 0.5), pal[mod(Math.floor(j / 3) + (i % 2), 4)]));
  }
  flush(ctx, items, 3);
  return 'scattered reflections';
}

function lightModulator(ctx) {
  const { pal, ink, paper } = setup(ctx, 5);
  const items = [];
  for (let k = 0; k < 4; k++) items.push(layer(circ(ctx.between(X0 + 30, X1 - 30), ctx.between(Y0 + 60, Y1 - 60), ctx.between(40, 70), pal[k % 4], 0.6), 1));
  const plate = rotatePlate(ctx.between(X0 + 20, CX), ctx.between(Y0 + 30, CY), ctx.between(90, 130), ctx.between(120, 180), ctx.between(-0.3, 0.3));
  items.push(layer(poly(plate, ink, 0.82), 2));
  const n = ctx.int(4, 7);
  const c = centroid(plate);
  for (let i = 0; i < n; i++) for (let j = 0; j < n + 1; j++) items.push(layer(circ(c[0] + (i - (n - 1) / 2) * 14, c[1] + (j - n / 2) * 14, 4, paper, 0.9), 3));
  flush(ctx, items, 3);
  return 'light modulator';
}
const rotatePlate = (x, y, w, h, a) => K.rotPts(rp(x, y, w, h), x + w / 2, y + h / 2, a);

function stringConstruction(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.int(36, 56);
  const items = [];
  const bend = ctx.between(30, 70);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = [X0 + 14 + Math.sin(t * Math.PI) * bend, Y0 + 14 + t * (H - 28)];
    const b = [X1 - 14 - Math.sin(t * Math.PI) * bend * 0.4, Y0 + 14 + (1 - t) * (H - 28)];
    const cross = ctx.rand() < 0.0;
    items.push(line([a, b], pal[Math.floor(t * 3)], 0.9));
  }
  for (let i = 0; i <= 3; i++) items.push(layer(line([[X0 + 14, Y0 + 14 + (i / 3) * (H - 28)], [X1 - 14, Y0 + 14 + (1 - i / 3) * (H - 28)]], ink, 0.4), 1));
  flush(ctx, items, 3);
  return 'string construction';
}

function aluminiumRelief(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(26, 34);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  const f = ctx.between(0.25, 0.5);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = X0 + (W - cols * s) / 2 + (i + 0.5) * s;
    const cy = Y0 + (H - rows * s) / 2 + (j + 0.5) * s;
    const a = Math.sin(i * f) * 1.2 + Math.cos(j * f * 0.8) * 0.9;
    items.push(poly(rp(cx - s / 2 + 1, cy - s / 2 + 1, s - 2, s - 2), pal[0]));
    for (let k = -2; k <= 2; k++) items.push(layer(poly(K.rotPts(rp(cx - s * 0.34, cy + k * s * 0.15 - s * 0.045, s * 0.68, s * 0.09), cx, cy, a), pal[1 + mod(k + i, 2)]), 1));
  }
  flush(ctx, items, 3);
  return 'metal relief';
}

function studdedRelief(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(15, 20);
  const items = [];
  const L = ctx.between(0, TAU);
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  const dx = Math.cos(L) * s * 0.12;
  const dy = Math.sin(L) * s * 0.12;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (W - cols * s) / 2 + (i + 0.5) * s;
    const y = Y0 + (H - rows * s) / 2 + (j + 0.5) * s;
    const r = s * 0.4;
    items.push(circ(x - dx, y - dy, r, pal[3]));
    items.push(layer(circ(x, y, r, pal[0]), 1));
    items.push(layer(circ(x + dx * 1.4, y + dy * 1.4, r * 0.62, pal[1]), 2));
  }
  flush(ctx, items, 3);
  return 'studded relief';
}

function blobPath(ctx, cx, cy, r, wobble, n = 8) {
  const rot = ctx.rand() * TAU;
  const pts = Array.from({ length: n }, (_, i) => pol(cx, cy, r * (1 + (ctx.rand() * 2 - 1) * wobble), rot + (i * TAU) / n));
  return smoothPath(pts, true);
}

function swollenCanvas(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const n = ctx.int(3, 5);
  for (let i = 0; i < n; i++) {
    const cx = ctx.between(X0 + 40, X1 - 40);
    const cy = Y0 + 40 + (i * (H - 80)) / (n - 1 || 1);
    const r = ctx.between(34, 56);
    const d = blobPath(ctx, cx, cy, r, 0.18);
    const b = [cx - r * 1.3, cy - r * 1.3, cx + r * 1.3, cy + r * 1.3];
    items.push(layer(path(d, pal[i % 3], b), i * 3));
    items.push(layer(ell(cx - r * 0.3, cy - r * 0.4, r * 0.45, r * 0.18, -0.6, pal[3]), i * 3 + 1));
    items.push(layer(ell(cx + r * 0.35, cy + r * 0.5, r * 0.5, r * 0.15, -0.6, ink), i * 3 + 1));
  }
  flush(ctx, items.map((it) => it), 1);
  return 'stretched bulges';
}

function mirrorFragments(ctx) {
  const { pal, ink } = setup(ctx, 5);
  let cells = [rp(X0, Y0, W, H)];
  for (let k = 0; k < ctx.int(14, 22); k++) {
    const i = ctx.int(0, cells.length - 1);
    const m = centroid(cells[i]);
    const parts = splitPoly(cells[i], [m[0] + ctx.between(-10, 10), m[1] + ctx.between(-10, 10)], ctx.between(0, Math.PI));
    if (parts.length === 2) cells.splice(i, 1, ...parts);
  }
  const items = [];
  cells.forEach((c, i) => {
    const m = centroid(c);
    const a = Math.atan2(m[1] - CY, m[0] - CX);
    items.push(poly(c, pal[mod(Math.floor(((a + Math.PI) / TAU) * 5), 5)]));
    const [h] = splitPoly(c, m, ctx.between(0, Math.PI));
    if (h) items.push(layer(poly(h, pal[mod(i, 5)], 0.35), 1));
  });
  flush(ctx, items, 3);
  return 'mirror fragments';
}

function reliefCells(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(26, 34);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  const b = s * 0.28;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (W - cols * s) / 2 + i * s;
    const y = Y0 + (H - rows * s) / 2 + j * s;
    items.push(poly([[x, y], [x + s, y], [x + s - b, y + b], [x + b, y + b]], pal[1]));
    items.push(poly([[x, y], [x + b, y + b], [x + b, y + s - b], [x, y + s]], pal[2]));
    items.push(poly([[x + s, y], [x + s, y + s], [x + s - b, y + s - b], [x + s - b, y + b]], pal[3]));
    items.push(poly([[x, y + s], [x + b, y + s - b], [x + s - b, y + s - b], [x + s, y + s]], pal[3]));
    items.push(poly(rp(x + b, y + b, s - 2 * b, s - 2 * b), pal[0]));
  }
  flush(ctx, items, 3);
  return 'relief cells';
}

function wireNet(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const cols = ctx.int(5, 7);
  const rows = ctx.int(7, 9);
  const nodes = [];
  for (let j = 0; j <= rows; j++) {
    nodes.push([]);
    for (let i = 0; i <= cols; i++) nodes[j].push([X0 + 10 + ((W - 20) * i) / cols + ctx.between(-9, 9), Y0 + 10 + ((H - 20) * j) / rows + ctx.between(-9, 9)]);
  }
  const items = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
    const p = nodes[j][i];
    if (i < cols) items.push(line([p, nodes[j][i + 1]], pal[0], 1.4));
    if (j < rows) items.push(line([p, nodes[j + 1][i]], pal[0], 1.4));
    if (i < cols && j < rows && ctx.rand() < 0.55) items.push(line([p, nodes[j + 1][i + 1]], pal[1], 1.2));
    items.push(layer(circ(p[0], p[1], 2.6, pal[2]), 1));
  }
  flush(ctx, items, 3);
  return 'wire net';
}

function lightRelief(ctx) {
  const { pal } = setup(ctx, 4);
  const items = [];
  const bw = ctx.between(10, 16);
  const amp = ctx.between(3, 8);
  const f = ctx.between(0.03, 0.06);
  for (let x = X0; x < X1; x += bw) {
    const k = Math.round((x - X0) / bw);
    const L = Array.from({ length: 30 }, (_, i) => [x + Math.sin(i * 0.5 + k * 0.4) * amp, Y0 + (i / 29) * H]);
    const R = L.map(([a, b]) => [a + bw * 0.6, b]).reverse();
    items.push(poly([...L, ...R], pal[k % 2]));
    const L2 = L.map(([a, b]) => [a + bw * 0.6, b]);
    const R2 = L.map(([a, b]) => [a + bw, b]).reverse();
    items.push(poly([...L2, ...R2], pal[2 + (k % 2)]));
  }
  flush(ctx, items, 3);
  return 'light ripples';
}

function luminoDynamic(ctx) {
  const { pal } = setup(ctx, 5);
  const n = ctx.int(7, 11);
  const items = [];
  const step = ctx.between(0.08, 0.2);
  for (let i = 0; i < n; i++) items.push(layer(poly(K.rotPts(rp(CX - 70, CY - 100 + i * 4, 140, 200 - i * 14), CX, CY, i * step), pal[i % 5], 0.6), 1));
  flush(ctx, items, 3);
  return 'turning planes';
}

function kineticDiscs(ctx) {
  const { pal } = setup(ctx, 4);
  const items = [];
  const arcs = ctx.int(3, 4);
  for (let a = 0; a < arcs; a++) {
    const R = 40 + a * 30;
    const n = 14;
    const r0 = ctx.between(6, 12);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const p = pol(CX, CY, R, -Math.PI * 0.9 + t * Math.PI * 1.4 + a);
      items.push(layer(circ(p[0], p[1], r0 + t * 14, pal[a % 4], 0.25 + t * 0.55), a));
    }
  }
  flush(ctx, items, 3);
  return 'colour discs';
}

function canvasHoles(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const items = [];
  const rows = ctx.int(7, 10);
  const cols = ctx.int(4, 6);
  const cw = W / cols;
  const rh = H / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (i + 0.5 + (j % 2 ? 0.25 : -0.25)) * cw;
    const y = Y0 + (j + 0.5) * rh;
    items.push(ell(x, y, cw * 0.32, rh * 0.28, 0, ink));
    items.push(layer(ell(x + 1.5, y + 1.5, cw * 0.28, rh * 0.22, 0, pal[1]), 1));
    items.push(layer(ell(x - cw * 0.12, y - rh * 0.12, cw * 0.1, rh * 0.05, -0.5, pal[2]), 2));
  }
  flush(ctx, items, 3);
  return 'rows of holes';
}

function glowingDisc(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const R = ctx.between(58, 74);
  const corners = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]];
  for (let k = 8; k >= 1; k--) items.push(layer(circ(CX, CY, R * (1 + k * 0.1), pal[0], 0.1), 0));
  items.push(layer(circ(CX, CY, R, pal[1]), 1));
  corners.forEach(([x, y], q) => {
    const a = Math.atan2(CY - y, CX - x);
    const c = pol(CX, CY, R * 0.5, a + Math.PI);
    items.push(layer(ell(c[0] + 3, c[1] + 3, R * 0.42, R * 0.13, a, ink), 2));
    items.push(layer(ell(c[0], c[1], R * 0.42, R * 0.13, a, pal[2 + (q % 2)]), 3));
  });
  items.push(layer(circ(CX, CY, R * 0.16, pal[3]), 4));
  flush(ctx, items, 3);
  return 'glowing disc';
}

function strobeRods(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(18, 26);
  const w = W / n;
  const items = [];
  const f = ctx.between(0.02, 0.04);
  for (let i = 0; i < n; i++) {
    const pts = Array.from({ length: 40 }, (_, k) => [X0 + (i + 0.5) * w + Math.sin(k * 0.35 + i * 0.5) * w * 0.35, Y0 + (k / 39) * H]);
    items.push(line(pts, pal[i % 4], w * 0.55));
  }
  flush(ctx, items, 3);
  return 'strobe rods';
}

function louvres(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(8, 14);
  const w = W / n;
  const items = [];
  const bands = 3;
  const d = ctx.between(10, 24);
  for (let b = 0; b < bands; b++) {
    const y0 = Y0 + (b * H) / bands;
    const y1 = Y0 + ((b + 1) * H) / bands;
    for (let i = 0; i < n; i++) {
      const x = X0 + i * w;
      const k = i % 2 ? -1 : 1;
      items.push(poly([[x, y0], [x + w, y0 + d * k], [x + w, y1 + d * k], [x, y1]], pal[(i + b) % 2 ? b % 4 : (b + 2) % 4]));
    }
  }
  flush(ctx, items, 3);
  return 'louvres';
}

function lensGrid(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const items = [];
  const p = ctx.between(5, 7);
  for (let y = Y0; y < Y1; y += p) items.push(line([[X0, y], [X1, y]], pal[0], p * 0.5));
  const r = ctx.between(22, 28);
  const cols = Math.floor(W / (r * 2.2));
  const rows = Math.floor(H / (r * 2.2));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = X0 + (i + 0.5) * (W / cols) + (j % 2 ? 8 : -8);
    const cy = Y0 + (j + 0.5) * (H / rows);
    items.push(layer(circ(cx, cy, r, pal[1]), 1));
    for (let y = Y0 + p / 2; y < Y1; y += p) {
      const dy = y - cy;
      if (Math.abs(dy) >= r) continue;
      const half = Math.sqrt(r * r - dy * dy);
      items.push(layer(line([[cx - half, y], [cx + half, y]], pal[2], p * 0.5), 2));
    }
  }
  flush(ctx, items, 3);
  return 'lens grid';
}

function lenticularRibs(ctx) {
  const { pal } = setup(ctx, 5);
  const n = ctx.int(26, 38);
  const w = W / n;
  const items = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    items.push(poly(rp(X0 + i * w, Y0, w / 2, H), pal[Math.min(4, Math.floor(t * 5))]));
    items.push(poly(rp(X0 + i * w + w / 2, Y0, w / 2, H), pal[Math.min(4, Math.floor((1 - t) * 5))]));
  }
  flush(ctx, items, 3);
  return 'lenticular ribs';
}

function interwovenOptics(ctx) {
  const { pal } = setup(ctx, 5);
  const s = ctx.between(10, 14);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const over = mod(i + j, 2);
    const col = over ? pal[mod(j, 3)] : pal[2 + mod(i, 3)];
    items.push(poly(rp(X0 + i * s + 0.4, Y0 + j * s + 0.4, s - 0.8, s - 0.8), col));
  }
  flush(ctx, items, 3);
  return 'interwoven stripes';
}

function lightCurtain(ctx) {
  const { pal } = setup(ctx, 4);
  const items = [];
  const n = ctx.int(50, 80);
  for (let i = 0; i < n; i++) {
    const x = X0 + 4 + ((W - 8) * i) / (n - 1);
    const len = H * ctx.between(0.4, 1) * (0.7 + 0.3 * Math.sin(i * 0.3));
    const pts = Array.from({ length: 12 }, (_, k) => [x + Math.sin(k * 0.5 + i * 0.2) * 2, Y0 + (k / 11) * len]);
    items.push(line(pts, pal[i % 3], ctx.pick([1.2, 1.2, 2.4])));
  }
  flush(ctx, items, 3);
  return 'light curtain';
}

function perforatedPlate(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const p = ctx.between(12, 15);
  const items = [];
  const a = ctx.between(0.04, 0.12);
  for (const [k, col, rot, pitch] of [[0, pal[0], 0, p], [1, pal[1], a, p * 1.05]]) {
    for (let y = -20; y < H + 40; y += pitch) for (let x = -20; x < W + 40; x += pitch) {
      const q = K.rotPts([[X0 + x, Y0 + y]], CX, CY, rot)[0];
      if (q[0] > X0 && q[0] < X1 && q[1] > Y0 && q[1] < Y1) items.push(layer(circ(q[0], q[1], pitch * 0.36, col, 0.7), k));
    }
  }
  flush(ctx, items, 3);
  return 'perforated plate';
}

module.exports = {
  vibratingWires, colorSlats, inductionBands, chromaInterference, agamograph, scatteredSquares, lightModulator, stringConstruction,
  aluminiumRelief, studdedRelief, swollenCanvas, mirrorFragments, reliefCells, wireNet, lightRelief, luminoDynamic, kineticDiscs,
  canvasHoles, glowingDisc, strobeRods, louvres, lensGrid, lenticularRibs, interwovenOptics, lightCurtain, perforatedPlate
};
