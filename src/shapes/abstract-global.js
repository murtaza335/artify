'use strict';

// Global modernisms, re-imagined: a bindu, circles joined by wires, stone and plate, pencil ridges, fading points, a
// dot cosmos, mirror mosaics, invented charm grids, interlocked planes, bottle-cap tapestry, spare lines, fractured
// jewels, stacked modules, faint vectors, sign fields, pinprick maps, fine lines, an ink storm, a paper moon, infinity
// nets, open lattices, a roots grid, carnival layers, emblem totems, draped colour and paint tesserae.

const K = require('./pattern-kit');
const { starPoints } = require('./engine');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, ell, splitPoly, hatchRect, smoothPath, noise2 } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const FRAME = [X0, Y0, X1, Y1];

function bindu(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [circ(CX, CY, 104, ink)];
  const n = ctx.int(4, 6);
  for (let k = 0; k < n; k++) {
    const s = 92 - k * 15;
    items.push(layer(poly(k % 2 ? ngon(CX, CY, s, 4, Math.PI / 4) : ngon(CX, CY, s, 3, -Math.PI / 2), pal[k % 5], 0, 0), k + 1));
    items.push(layer(line(k % 2 ? ngon(CX, CY, s, 4, Math.PI / 4) : ngon(CX, CY, s, 3, -Math.PI / 2), ink, 2, true), k + 1));
  }
  items.push(layer(circ(CX, CY, 8, pal[0]), n + 2));
  chunk(ctx, items, n * 2 + 3);
  return 'bindu';
}

function electricCircles(ctx) {
  const { pal, ink } = setup(ctx, 4, ctx.colors[1]);
  const nodes = Array.from({ length: ctx.int(9, 14) }, () => ({ x: ctx.between(X0 + 20, X1 - 20), y: ctx.between(Y0 + 20, Y1 - 20), r: ctx.between(8, 24) }));
  const items = [];
  nodes.forEach((a, i) => {
    const b = nodes[(i + ctx.int(1, 3)) % nodes.length];
    items.push(line([[a.x, a.y], [b.x, b.y]], ink, 1.4));
  });
  nodes.forEach((a, i) => items.push(layer(circ(a.x, a.y, a.r, pal[i % 4]), 1), layer(ring(a.x, a.y, a.r * 0.5, ink, 1.6), 2)));
  flush(ctx, items, 1);
  return 'bulbs and wires';
}

function stoneAndPlate(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [poly(rp(X0 + 20, Y0 + 50, W - 40, H - 100), pal[0])];
  const sx = ctx.between(CX - 30, CX + 30);
  const sy = ctx.between(CY - 40, CY + 40);
  for (let k = 0; k < ctx.int(7, 11); k++) {
    const a = (k / 9) * TAU + ctx.between(-0.2, 0.2);
    const pts = [[sx, sy]];
    let p = [sx, sy];
    for (let s = 0; s < 6; s++) {
      p = [p[0] + Math.cos(a + ctx.between(-0.5, 0.5)) * 20, p[1] + Math.sin(a + ctx.between(-0.5, 0.5)) * 20];
      pts.push(p);
    }
    items.push(layer(line(pts, ink, 1.4), 1));
  }
  items.push(layer(ell(sx, sy, 30, 24, ctx.between(0, 1), pal[2]), 2), layer(ell(sx - 6, sy - 6, 16, 10, 0.3, pal[1]), 3));
  flush(ctx, items.map((it) => it), 1);
  return 'stone and glass';
}

function ecritureRidges(ctx) {
  const { pal } = setup(ctx, 3);
  const rows = ctx.int(16, 22);
  const items = [];
  for (let j = 0; j < rows; j++) {
    const y = Y0 + 10 + ((H - 20) * j) / (rows - 1);
    for (let x = X0 + 6; x < X1 - 4; x += ctx.between(6, 9)) items.push(line([[x, y - 5 + ctx.between(-1, 1)], [x + ctx.between(-1.5, 1.5) + 3, y + 5]], pal[j % 3 ? 0 : 1], 2.2));
  }
  flush(ctx, items, 3);
  return 'pencil ridges';
}

function fadingPoints(ctx) {
  const { pal } = setup(ctx, 4);
  const rows = ctx.int(5, 8);
  const items = [];
  for (let j = 0; j < rows; j++) {
    const y = Y0 + 24 + ((H - 48) * j) / (rows - 1);
    const n = ctx.int(5, 9);
    const dir = ctx.rand() < 0.5 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = dir > 0 ? X0 + 16 + t * (W - 32) : X1 - 16 - t * (W - 32);
      items.push(ell(x, y + ctx.between(-3, 3), 18 * (1 - t * 0.5), 7 * (1 - t * 0.4), ctx.between(-0.1, 0.1), pal[j % 3]), layer(circ(x, y, 1, pal[3], 0), 0));
    }
  }
  flush(ctx, items, 3);
  return 'fading points';
}

function starDotGrid(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(10, 14);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const d = Math.hypot(i - cols / 2, (j - rows / 2) * 0.7) / (cols / 2);
    items.push(circ(X0 + (W - cols * s) / 2 + (i + 0.5) * s + (mod(j, 2) ? 2 : 0), Y0 + (H - rows * s) / 2 + (j + 0.5) * s, s * (0.12 + 0.28 * (0.5 + 0.5 * Math.cos(d * 5))), pal[Math.min(3, Math.floor(d * 3))]));
  }
  flush(ctx, items, 3);
  return 'dot cosmos';
}

function mirrorMosaic(ctx) {
  const { pal } = setup(ctx, 5);
  const r = ctx.between(22, 30);
  const w = Math.sqrt(3) * r;
  const L = ctx.between(0, TAU);
  const items = [];
  const rows = Math.ceil(H / (r * 1.5)) + 2;
  for (let j = -2; j < rows; j++) for (let i = -2 - Math.ceil(rows / 2); i < Math.ceil(W / w) + 3; i++) {
    const cx = X0 + w * (i + j / 2);
    const cy = Y0 + 1.5 * r * j;
    if (!K.inFrame([cx - r, cy - r, cx + r, cy + r])) continue;
    const v = ngon(cx, cy, r * 0.97, 6, Math.PI / 6);
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 6 + (k * TAU) / 6 + Math.PI / 6;
      const sh = 0.5 + 0.5 * Math.cos(a - L + (mod(i * 3 + j, 3) - 1) * 0.5);
      items.push(poly([[cx, cy], v[k], v[(k + 1) % 6]], pal[Math.min(4, Math.floor(sh * 5))], 0, 0.5));
    }
  }
  flush(ctx, items, 3);
  return 'mirror mosaic';
}

function talismanGrid(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = ctx.int(4, 5);
  const rows = ctx.int(6, 8);
  const cw = W / cols;
  const ch = H / rows;
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = X0 + (i + 0.5) * cw;
    const cy = Y0 + (j + 0.5) * ch;
    const r = Math.min(cw, ch) * 0.4;
    items.push(poly(rp(cx - cw / 2 + 2, cy - ch / 2 + 2, cw - 4, ch - 4), pal[mod(i + j, 2)]));
    const strokes = ctx.int(2, 4);
    for (let s = 0; s < strokes; s++) {
      const a = ctx.between(0, Math.PI / 2);
      const d = ctx.between(0.2, 0.9) * r;
      const L = ctx.between(0.2, 0.7) * r;
      for (let q = 0; q < 4; q++) {
        const rot = (q * Math.PI) / 2;
        const p = pol(cx, cy, d, a + rot);
        items.push(layer(line([p, pol(p[0], p[1], L, a + rot + (s % 2 ? 1.2 : -0.4))], pal[2 + (s % 2)], 2), 1));
      }
    }
    items.push(layer(circ(cx, cy, 2, ink), 2));
  }
  flush(ctx, items, 3);
  return 'charm grid';
}

function interlockedPlanes(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  for (let k = 0; k < ctx.int(6, 9); k++) {
    const x = ctx.between(X0, X1 - 40);
    const y = ctx.between(Y0, Y1 - 40);
    const w = ctx.between(50, 140);
    const h = ctx.between(40, 120);
    items.push(layer(k % 3 === 0 ? poly([[x, y + h], [x + w / 2, y], [x + w, y + h]], pal[k % 5], 0.78) : poly(rp(x, y, w, h), pal[k % 5], 0.78), k));
  }
  flush(ctx, items, 1);
  return 'interlocked planes';
}

function capTapestry(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = noise2(ctx.int(1, 99));
  const r = ctx.between(7, 9);
  const items = [];
  for (let j = 0; (j + 1) * r * 1.8 < H + r; j++) for (let x = X0 + r; x < X1 - r + 2; x += r * 2) {
    const px = x + (j % 2 ? r : 0);
    if (px > X1 - r) continue;
    const py = Y0 + r + j * r * 1.75;
    const v = n(px * 0.03, py * 0.03);
    items.push(circ(px, py, r * 0.95, pal[Math.min(3, Math.floor(v * 4))]), layer(circ(px, py, r * 0.4, ink, 0.5), 1));
  }
  flush(ctx, items, 3);
  return 'bottle-cap tapestry';
}

function uliLines(ctx) {
  const { pal, ink } = setup(ctx, 4, ctx.colors[1]);
  const items = [];
  for (let k = 0; k < ctx.int(4, 7); k++) {
    const pts = Array.from({ length: ctx.int(4, 6) }, () => [ctx.between(X0 + 10, X1 - 10), ctx.between(Y0 + 10, Y1 - 10)]);
    items.push(layer(stroked(smoothPath(pts), k % 3 ? ink : pal[0], ctx.pick([1.2, 1.2, 3.4]), K.bbox(pts)), k));
    pts.forEach((p) => ctx.rand() < 0.4 && items.push(layer(circ(p[0], p[1], 2.2, pal[1 + (k % 3)]), k)));
  }
  flush(ctx, items, 1);
  return 'spare lines';
}

function jewelFracture(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const n = ctx.pick([6, 8, 10]);
  const R = 104;
  let cells = [[[CX, CY], pol(CX, CY, R, -Math.PI / 2 - Math.PI / n), pol(CX, CY, R, -Math.PI / 2 + Math.PI / n)]];
  for (let k = 0; k < ctx.int(8, 14); k++) {
    const i = ctx.int(0, cells.length - 1);
    const m = centroid(cells[i]);
    const parts = splitPoly(cells[i], m, ctx.between(0, Math.PI));
    if (parts.length === 2) cells.splice(i, 1, ...parts);
  }
  const cols = cells.map((_, i) => pal[(i * 2) % 5]);
  const items = [];
  for (let q = 0; q < n; q++) {
    cells.forEach((c, i) => {
      let pts = rotPts(c, CX, CY, (q * TAU) / n);
      if (q % 2) pts = pts.map(([x, y]) => [2 * CX - x, y]).map(([x, y]) => [x, y]);
      items.push(poly(pts, cols[(i + q) % cols.length], 0, 0.5));
    });
  }
  flush(ctx, items, 3);
  return 'fractured jewel';
}

function stackedModules(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const cols = ctx.int(3, 5);
  const cw = W / cols;
  for (let i = 0; i < cols; i++) {
    let y = Y1;
    for (let k = 0; k < ctx.int(3, 6); k++) {
      const h = ctx.between(28, 70);
      const w = cw * ctx.between(0.7, 1);
      items.push(poly([[X0 + i * cw, y], [X0 + i * cw + w, y], [X0 + i * cw + w, y - h * 0.6], [X0 + i * cw + w * 0.6, y - h * 0.6], [X0 + i * cw + w * 0.6, y - h], [X0 + i * cw, y - h]], pal[(i + k) % 5], 0, 0.8));
      y -= h * 0.95;
      if (y < Y0 + 20) break;
    }
  }
  flush(ctx, items, 3);
  return 'stacked modules';
}

function faintVectors(ctx) {
  const { pal, ink } = setup(ctx, 3, ctx.colors[1]);
  const items = [];
  const n = ctx.int(14, 24);
  for (let i = 0; i < n; i++) items.push(line([[X0 + (i / n) * W, Y0], [X0 + (i / n) * W, Y1]], pal[0], 0.7));
  const dens = ctx.int(8, 16);
  for (let i = 0; i < dens; i++) items.push(layer(line([[X0, Y0 + (i / dens) * H], [X1, Y0 + (i / dens) * H * 0.5 + 30]], pal[1], 0.8), 1));
  for (let i = 0; i < 8; i++) items.push(layer(line([[X0 + ctx.between(0, W), Y1], [X0 + ctx.between(0, W), Y0]], ink, 1), 2));
  flush(ctx, items, 1);
  return 'faint vectors';
}

function glyphGlow(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const items = [];
  const cx = ctx.between(CX - 30, CX + 30);
  const cy = ctx.between(CY - 50, CY + 50);
  for (let k = 12; k >= 1; k--) items.push(layer(ell(cx, cy, 10 + k * 8, 14 + k * 10, 0, pal[k % 3], 0), 0));
  for (let k = 9; k >= 1; k--) items.push(layer(circ(cx, cy, k * 10, pal[k % 2], 0.17), 1));
  for (let k = 0; k < 14; k++) {
    const p = pol(cx, cy, ctx.between(20, 90), ctx.between(0, TAU));
    items.push(layer(line([[p[0] - 3, p[1]], [p[0] + 3, p[1]]], paper, 1.4), 2), layer(circ(p[0], p[1], 1.4, paper), 2));
  }
  flush(ctx, items.filter((it) => it.svg), 1);
  return 'sign field';
}

function pinprickLines(ctx) {
  const { pal, ink } = setup(ctx, 3, ctx.colors[1]);
  const items = [];
  const rows = ctx.int(8, 12);
  for (let j = 0; j < rows; j++) {
    const y = Y0 + 12 + ((H - 24) * j) / (rows - 1);
    const a = ctx.between(-14, 14);
    const x0 = ctx.between(X0 + 6, CX);
    const x1 = ctx.between(CX, X1 - 6);
    if (ctx.rand() < 0.5) items.push(line([[x0, y], [x1, y + a]], ink, 0.9));
    for (let x = X0 + 4; x < X1; x += 5) if (ctx.rand() < 0.7) items.push(circ(x, y + a * ((x - X0) / W) + ctx.between(-0.6, 0.6), 0.8, pal[0]));
  }
  flush(ctx, items, 3);
  return 'pinprick map';
}

function saetaLines(ctx) {
  const { pal, ink } = setup(ctx, 3, ctx.colors[1]);
  const items = [];
  const groups = ctx.int(3, 5);
  for (let g = 0; g < groups; g++) {
    const x0 = ctx.between(X0 + 10, X1 - 40);
    const n = ctx.int(8, 16);
    const bend = ctx.between(-14, 14);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * ctx.between(1.8, 3);
      items.push(line([[x, Y0 + ctx.between(0, 40)], [x + bend * 0.5, CY], [x + bend, Y1 - ctx.between(0, 60)]], g % 2 ? ink : pal[0], i % 3 ? 0.8 : 1.5));
    }
  }
  flush(ctx, items, 3);
  return 'fine lines';
}

function inkStorm(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  for (let k = 0; k < ctx.int(9, 15); k++) {
    const pts = Array.from({ length: 5 }, () => [ctx.between(X0 - 10, X1 + 10), ctx.between(Y0 - 10, Y1 + 10)]);
    items.push(layer(stroked(smoothPath(pts), pal[k % 5], ctx.between(6, 22), K.bbox(pts)), k));
  }
  flush(ctx, items, 1);
  return 'ink storm';
}

function textureMoon(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  for (let k = 0; k < 120; k++) {
    const x = ctx.between(X0, X1);
    const y = ctx.between(Y0, Y1);
    items.push(line([[x, y], [x + ctx.between(-14, 14), y + ctx.between(-6, 6)]], pal[0], 0.7));
  }
  const cx = ctx.between(CX - 20, CX + 20);
  const cy = ctx.between(CY - 40, CY + 20);
  const R = ctx.between(54, 72);
  items.push(layer(circ(cx, cy, R, pal[1]), 1));
  [[0.9, 0.2], [0.65, 0.35], [0.4, 0.5]].forEach(([k, o], z) => items.push(layer(circ(cx - R * o * 0.4, cy - R * o * 0.4, R * k, pal[2 + (z % 2)], 0.7), 2 + z)));
  flush(ctx, items, 1);
  return 'paper moon';
}

function infinityNets(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const r = ctx.between(12, 17);
  const items = [];
  for (let j = 0; j * r * 0.9 < H + r; j++) for (let x = X0 - r + (j % 2 ? r : 0); x < X1 + r; x += r * 2) {
    const y = Y0 + j * r * 0.9;
    const pts = Array.from({ length: 10 }, (_, k) => pol(x, y, r, Math.PI + (k / 9) * Math.PI));
    items.push(line(pts, pal[mod(j, 3)], 1.8), layer(circ(x, y - r * 0.3, 1.5, pal[(j + 1) % 3]), 1));
  }
  flush(ctx, items.filter((it) => K.inFrame(it.b)), 3);
  return 'infinity nets';
}

function openLattice(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const s = ctx.between(26, 34);
  const items = [];
  const rows = Math.ceil(H / (s * 1.5)) + 2;
  for (let j = -1; j < rows; j++) for (let i = -2 - Math.ceil(rows / 2); i < Math.ceil(W / (s * 1.73)) + 2; i++) {
    const cx = X0 + s * 1.732 * (i + j / 2);
    const cy = Y0 + s * 1.5 * j;
    const v = ngon(cx, cy, s, 6, Math.PI / 6);
    const c = pal[mod(i + j, 3)];
    items.push(line(v, c, 1.8, true));
    items.push(line([v[1], [cx, cy]], c, 1.4), line([v[3], [cx, cy]], c, 1.4), line([v[5], [cx, cy]], c, 1.4));
  }
  flush(ctx, items.filter((it) => K.inFrame(it.b)), 3);
  return 'open lattice';
}

function rootsGrid(ctx) {
  const { pal, ink } = setup(ctx, 4, ctx.colors[1]);
  const cols = ctx.int(4, 5);
  const rows = ctx.int(6, 8);
  const cw = W / cols;
  const ch = H / rows;
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = X0 + (i + 0.5) * cw;
    const cy = Y0 + (j + 0.5) * ch;
    const r = Math.min(cw, ch) * 0.34;
    const t = mod(i * 2 + j * 3 + ctx.int(0, 1), 4);
    if (t === 0) items.push(ring(cx, cy, r, ink, 2.4));
    else if (t === 1) items.push(line(rp(cx - r, cy - r, r * 2, r * 2), pal[0], 2.4, true));
    else if (t === 2) items.push(layer(circ(cx, cy, r * 0.8, pal[1 + (i % 2)]), 1), layer(line(rp(cx - r, cy - r, r * 2, r * 2), ink, 2, true), 2));
    else items.push(layer(poly(rp(cx - r * 0.7, cy - r, r * 1.4, r * 2), pal[2]), 1), layer(ring(cx, cy, r * 0.5, ink, 2), 2));
  }
  flush(ctx, items, 3);
  return 'roots grid';
}

function carnivalLayers(ctx) {
  const { pal, ink, paper } = setup(ctx, 5);
  const items = [];
  const sw = ctx.between(8, 14);
  for (let x = X0; x < X1; x += sw * 2) items.push(poly(rp(x, Y0, sw, H), pal[0], 0.6));
  for (let k = 0; k < ctx.int(4, 6); k++) {
    const cx = ctx.between(X0 + 20, X1 - 20);
    const cy = ctx.between(Y0 + 30, Y1 - 30);
    const R = ctx.between(24, 50);
    items.push(layer(circ(cx, cy, R, pal[1 + (k % 4)]), 1 + k * 3));
    items.push(layer(ring(cx, cy, R * 0.8, paper, 3), 2 + k * 3));
    for (let q = 0; q < 10; q++) items.push(layer(circ(...pol(cx, cy, R * 0.62, (q * TAU) / 10), 3, ink), 2 + k * 3));
    items.push(layer(circ(cx, cy, R * 0.25, pal[(k + 2) % 5]), 3 + k * 3));
  }
  flush(ctx, items, 1);
  return 'carnival layers';
}

function emblematicTotem(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const n = ctx.int(4, 6);
  const h = (H - 16) / n;
  for (let k = 0; k < n; k++) {
    const cy = Y0 + 8 + (k + 0.5) * h;
    const t = ctx.int(0, 3);
    const c = pal[k % 5];
    items.push(layer(poly(rp(CX - 50, cy - h / 2 + 3, 100, h - 6), ink, 0.2), 0));
    if (t === 0) items.push(layer(poly([[CX - 40, cy - h * 0.38], [CX, cy], [CX - 40, cy + h * 0.38]], c), 1), layer(poly([[CX + 40, cy - h * 0.38], [CX, cy], [CX + 40, cy + h * 0.38]], pal[(k + 2) % 5]), 1));
    else if (t === 1) items.push(layer(circ(CX, cy, h * 0.36, c), 1), layer(poly(rp(CX - 4, cy - h * 0.46, 8, h * 0.92), ink), 2));
    else if (t === 2) items.push(layer(poly([[CX, cy - h * 0.4], [CX + 38, cy], [CX, cy + h * 0.4], [CX - 38, cy]], c), 1));
    else items.push(layer(poly(starPoints(CX, cy, h * 0.42, h * 0.18, 6, 0), c), 1));
  }
  flush(ctx, items, 1);
  return 'emblem totem';
}

function drapedColor(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const n = ctx.int(8, 13);
  const amp = ctx.between(14, 34);
  const f = ctx.between(0.02, 0.045);
  for (let i = 0; i < n; i++) {
    const off = (i / n) * (W + H) - H * 0.3;
    const top = Array.from({ length: 24 }, (_, k) => [X0 + off + k * 8 + Math.sin(k * 0.5 + i) * amp * 0.3, Y0 + (k / 23) * H]);
    const bot = top.map(([x, y]) => [x + (W + H) / n + Math.sin(y * f * 3 + i) * amp * 0.4, y]).reverse();
    items.push(layer(poly([...top, ...bot], pal[i % 5], 0.88), i));
  }
  flush(ctx, items, 1);
  return 'draped colour';
}

function tesseraeSlabs(ctx) {
  const { pal } = setup(ctx, 5);
  const cols = ctx.int(6, 8);
  const rows = ctx.int(9, 12);
  const P = Array.from({ length: rows + 1 }, (_, j) => Array.from({ length: cols + 1 }, (_, i) => [X0 + (W * i) / cols + (i > 0 && i < cols ? ctx.between(-6, 6) : 0), Y0 + (H * j) / rows + (j > 0 && j < rows ? ctx.between(-6, 6) : 0)]));
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const q = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]];
    items.push(poly(scalePts(q, ...centroid(q), 0.9), pal[mod(Math.floor((i + j) / 2) + ctx.int(0, 1), 5)]));
  }
  flush(ctx, items, 3);
  return 'paint tesserae';
}

module.exports = {
  bindu, electricCircles, stoneAndPlate, ecritureRidges, fadingPoints, starDotGrid, mirrorMosaic, talismanGrid, interlockedPlanes,
  capTapestry, uliLines, jewelFracture, stackedModules, faintVectors, glyphGlow, pinprickLines, saetaLines, inkStorm, textureMoon,
  infinityNets, openLattice, rootsGrid, carnivalLayers, emblematicTotem, drapedColor, tesseraeSlabs
};
