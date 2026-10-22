'use strict';

// Ornament through the ages, as abstract interpretations: Celtic-style knotwork, spirals and key patterns, meanders,
// moulding bands, cut-stone floors, tracery, quatrefoils, trellises, damask and ogee lattices, leaded glass, stylised
// roses, Art Deco setbacks and fountains, speed lines, harlequin, spindle blooms, gingham, sgraffito, parquetry,
// compass stars and roses, and invented heraldic fields.

const K = require('./pattern-kit');
const { starPoints } = require('./engine');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, inFrame, weave, ell, splitPoly, eachCell, smoothPath } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function celticKnot(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = ctx.int(2, 3);
  const cw = (W - 12) / cols;
  const turns = ctx.int(4, 6);
  const strands = [];
  for (let c = 0; c < cols; c++) {
    const cx = X0 + 6 + cw * (c + 0.5);
    for (let k = 0; k < 3; k++) strands.push(Array.from({ length: 64 }, (_, i) => [cx + Math.sin((i / 63) * TAU * turns + (k * TAU) / 3) * cw * 0.36, Y0 + 8 + (i / 63) * (H - 16)]));
  }
  const items = [poly(rp(X0 + 4, Y0 + 4, W - 8, H - 8), pal[0]), ...weave(strands, cw * 0.15, (i) => pal[1 + (i % 3)], ink)];
  chunk(ctx, items, 18);
  return 'knotwork panel';
}

function celticSpiral(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.int(1, 2);
  const items = [];
  const cells = n === 1 ? [[CX, CY, 96]] : [[CX, CY - 78, 62], [CX, CY + 78, 62]];
  cells.forEach(([cx, cy, R], c) => {
    const turns = ctx.between(1.1, 1.6);
    for (let k = 0; k < 3; k++) {
      const a0 = (k * TAU) / 3 + c;
      const pts = Array.from({ length: 50 }, (_, i) => {
        const t = i / 49;
        return pol(cx + Math.cos(a0) * R * 0.5 * (1 - t) * 0.0, cy, R * (1 - t * 0.9), a0 + t * turns * Math.PI);
      });
      items.push(layer(line(pts, ink, R * 0.15), 0), layer(line(pts, pal[1 + k], R * 0.09), 1));
      items.push(layer(circ(pts[49][0], pts[49][1], R * 0.07, pal[3]), 2));
    }
    items.push(layer(ring(cx, cy, R * 1.04, pal[0], 3), 1));
  });
  flush(ctx, items, 1);
  return 'triple spirals';
}

function celticKey(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const s = ctx.between(16, 22);
  const items = [];
  const seed = ctx.int(0, 7);
  eachCell(s, s, (i, j, x, y) => {
    const d = (mod(i >> 1, 2) + mod(j >> 1, 2) + seed) % 2 ? 1 : 0;
    const flip = mod(i + j, 2) ? d : 1 - d;
    const a = flip ? [x, y] : [x + s, y];
    const b = flip ? [x + s, y + s] : [x, y + s];
    items.push(layer(line([a, b], pal[2], s * 0.36), 0), layer(line([a, b], pal[mod(i + j, 2)], s * 0.2), 1));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'key pattern';
}

function meander(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const u = ctx.between(5, 7);
  const bandH = u * 8;
  const n = Math.floor(H / bandH);
  const y0 = Y0 + (H - n * bandH) / 2;
  const items = [];
  for (let b = 0; b < n; b++) {
    const y = y0 + b * bandH + u;
    items.push(poly(rp(X0, y0 + b * bandH, W, bandH), pal[b % 2]));
    for (let x = X0; x < X1 + u * 8; x += u * 8) {
      const unit = [[0, 6], [0, 0], [6, 0], [6, 4], [2, 4], [2, 2], [4, 2]].map(([a, c]) => [x + a * u, y + c * u]);
      items.push(layer(line(unit, pal[2], u * 0.9), 1));
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'meander';
}

function eggAndDart(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  let y = Y0 + 2;
  let b = 0;
  while (y < Y1 - 10) {
    const t = b % 3;
    const h = t === 0 ? ctx.between(34, 44) : t === 1 ? 14 : 8;
    items.push(poly(rp(X0, y, W, h), pal[b % 2]));
    if (t === 0) {
      const step = h * 0.8;
      for (let x = X0 + step / 2; x < X1 + step; x += step) {
        items.push(layer(ell(x, y + h * 0.45, step * 0.3, h * 0.32, 0, pal[2]), 1));
        items.push(layer(poly([[x + step * 0.42, y + 3], [x + step * 0.5, y + h - 3], [x + step * 0.58, y + 3]], pal[3]), 1));
      }
    } else if (t === 1) for (let x = X0 + h / 2; x < X1 + h; x += h * 1.1) items.push(layer(circ(x, y + h / 2, h * 0.36, pal[2]), 1));
    y += h;
    b++;
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'moulded bands';
}

function opusSectile(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const s = ctx.between(62, 78);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2;
    const cy = y + s / 2;
    items.push(poly(rp(x + 1.5, y + 1.5, s - 3, s - 3), pal[mod(i + j, 2)]));
    items.push(layer(circ(cx, cy, s * 0.36, pal[2 + mod(i + 2 * j, 2)]), 1));
    items.push(layer(poly(ngon(cx, cy, s * 0.22, 4, Math.PI / 4), pal[4]), 2));
    [[x + 1.5, y + 1.5], [x + s - 1.5, y + 1.5], [x + 1.5, y + s - 1.5], [x + s - 1.5, y + s - 1.5]].forEach(([px, py]) => items.push(layer(poly(rp(Math.min(px, px + (px < cx ? s * 0.2 : -s * 0.2)), Math.min(py, py + (py < cy ? s * 0.2 : -s * 0.2)), s * 0.2, s * 0.2), pal[3]), 1)));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'cut-stone floor';
}

function cosmati(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const n = ctx.pick([6, 8, 12]);
  const spots = [[CX, CY - 72, 52], [CX, CY + 72, 52], [CX, CY, 44]];
  items.push(layer(line([[CX, spots[0][1]], [CX, spots[1][1]]], pal[0], 16), 0));
  spots.forEach(([cx, cy, R], c) => {
    items.push(layer(circ(cx, cy, R + 4, ink), 1));
    for (let k = 0; k < n; k++) {
      const a = (k * TAU) / n;
      items.push(layer(poly([[cx, cy], pol(cx, cy, R, a), pol(cx, cy, R, a + TAU / n)], pal[1 + ((k + c) % 3)]), 2));
    }
    items.push(layer(circ(cx, cy, R * 0.3, pal[4]), 3), layer(circ(cx, cy, R * 0.12, ink), 4));
  });
  for (let y = Y0 + 4; y < Y1; y += 12) items.push(layer(circ(X0 + 12, y, 2.4, pal[2]), 0), layer(circ(X1 - 12, y, 2.4, pal[2]), 0));
  flush(ctx, items, 1);
  return 'cosmati pavement';
}

function roseWindow(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const n = ctx.pick([8, 10, 12]);
  const items = [circ(CX, CY, 106, ink)];
  items.push(layer(circ(CX, CY, 100, pal[0]), 1));
  for (let k = 0; k < n; k++) {
    const a = (k * TAU) / n;
    const p = pol(CX, CY, 70, a);
    items.push(layer(circ(p[0], p[1], 20, ink), 2), layer(circ(p[0], p[1], 16, pal[1 + (k % 3)]), 3));
    for (let q = 0; q < 3; q++) items.push(layer(circ(...pol(p[0], p[1], 8, a + (q * TAU) / 3), 5, pal[4]), 4));
    const m = pol(CX, CY, 38, a + TAU / n / 2);
    items.push(layer(ell(m[0], m[1], 14, 5, a + TAU / n / 2, pal[2 + (k % 2)]), 2));
  }
  items.push(layer(circ(CX, CY, 26, ink), 2), layer(poly(starPoints(CX, CY, 24, 12, n, 0), pal[3]), 3));
  flush(ctx, items, 1);
  return 'rose window';
}

function pointedPoly(cx, yb, w, spring, k) {
  const R = w * k;
  const phi = Math.acos((R - w / 2) / R);
  const ys = yb - spring;
  const left = Array.from({ length: 13 }, (_, i) => [cx - w / 2 + R + R * Math.cos(Math.PI + (phi * i) / 12), ys + R * Math.sin(Math.PI + (phi * i) / 12)]);
  const right = left.slice().reverse().slice(1).map(([x, y]) => [2 * cx - x, y]);
  return [[cx - w / 2, yb], ...left, ...right, [cx + w / 2, yb]];
}

function gothicTracery(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const n = ctx.int(2, 3);
  const w = (W - 10) / n;
  const items = [poly(rp(X0, Y0, W, H), pal[0])];
  for (let i = 0; i < n; i++) {
    const cx = X0 + w * (i + 0.5);
    items.push(layer(poly(pointedPoly(cx, Y1 - 4, w - 10, 180, 0.75), ink), 1));
    items.push(layer(poly(pointedPoly(cx, Y1 - 10, w - 20, 172, 0.75), pal[1 + (i % 3)]), 2));
    items.push(layer(poly(pointedPoly(cx, Y1 - 26, w - 36, 150, 0.75), pal[4]), 3));
    const fy = Y1 - 205;
    items.push(layer(circ(cx, fy, w * 0.26, ink), 1), layer(circ(cx, fy, w * 0.21, pal[2 + (i % 2)]), 2));
    for (let k = 0; k < 3; k++) items.push(layer(circ(...pol(cx, fy, w * 0.1, (k * TAU) / 3 - Math.PI / 2), w * 0.07, pal[4]), 3));
  }
  flush(ctx, items, 1);
  return 'tracery';
}

function quatrefoil(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(40, 52);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2 + (mod(j, 2) ? s / 2 : 0);
    const cy = y + s / 2;
    const r = s * 0.22;
    for (let k = 0; k < 4; k++) items.push(circ(...pol(cx, cy, r, (k * TAU) / 4 + Math.PI / 4), r * 1.02, pal[mod(i + j, 2)]));
    items.push(layer(poly(ngon(cx, cy, r * 1.2, 4, 0), pal[mod(i + j, 2)]), 0), layer(circ(cx, cy, r * 0.4, pal[2]), 1), layer(circ(cx, cy, r * 0.15, pal[3]), 2));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'quatrefoil lattice';
}

function trellis(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(40, 52);
  const items = [];
  for (let k = -12; k < 16; k++) {
    items.push(layer(line([[X0 + k * s, Y0 - 10], [X0 + k * s + H + 20, Y1 + 10]], pal[0], 5), 0), layer(line([[X0 + k * s + H + 20, Y0 - 10], [X0 + k * s, Y1 + 10]], pal[0], 5), 0));
  }
  for (let j = -1; j < Math.ceil(H / s) * 2 + 2; j++) for (let i = -1; i < Math.ceil(W / s) + 2; i++) {
    const x = X0 + i * s + (mod(j, 2) ? s / 2 : 0);
    const y = Y0 + j * s * 0.5;
    items.push(layer(circ(x, y, s * 0.17, pal[1]), 1));
    for (let q = 0; q < 6; q++) items.push(layer(circ(...pol(x, y, s * 0.13, (q * TAU) / 6), s * 0.05, pal[2]), 2));
    items.push(layer(circ(x, y, s * 0.04, pal[3]), 3));
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'trellis';
}

// An onion-shaped (ogee) outline of half-width w and half-height h.
function ogee(cx, cy, w, h) {
  const pts = [];
  for (let k = 0; k <= 16; k++) {
    const t = k / 16;
    const y = -h + 2 * h * t;
    const u = Math.abs(y) / h;
    pts.push([cx + w * (1 - Math.pow(u, 1.5)) * (1 + 0.25 * Math.sin(u * Math.PI)), cy + y]);
  }
  for (let k = 16; k >= 0; k--) {
    const t = k / 16;
    const y = -h + 2 * h * t;
    const u = Math.abs(y) / h;
    pts.push([cx - w * (1 - Math.pow(u, 1.5)) * (1 + 0.25 * Math.sin(u * Math.PI)), cy + y]);
  }
  return pts;
}

function damask(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const w = ctx.between(34, 42);
  const h = w * 1.55;
  const items = [];
  eachCell(w * 2, h, (i, j, x, y) => {
    [[0, 0], [1, 0.5]].forEach(([dx, dy], q) => {
      const cx = x + w + dx * w;
      const cy = y + h / 2 + dy * h;
      items.push(poly(ogee(cx, cy, w * 0.95, h * 0.5), pal[(q + j) % 2 ? 0 : 1]));
      items.push(layer(poly(ogee(cx, cy, w * 0.6, h * 0.34), pal[2]), 1));
      [-1, 1].forEach((s) => items.push(layer(ell(cx + s * w * 0.2, cy, w * 0.26, w * 0.1, s * 0.8, pal[3]), 2)));
      items.push(layer(circ(cx, cy, w * 0.07, ink), 3));
    });
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'damask';
}

function ogeeLattice(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const w = ctx.between(26, 34);
  const h = w * ctx.between(1.5, 1.9);
  const items = [];
  eachCell(w * 2, h, (i, j, x, y) => {
    [[0, 0], [1, 0.5]].forEach(([dx, dy], q) => {
      const cx = x + w + dx * w;
      const cy = y + h / 2 + dy * h;
      items.push(poly(ogee(cx, cy, w * 0.98, h * 0.5), pal[mod(i + j + q, 3)]));
      items.push(layer(circ(cx, cy, w * 0.14, pal[3]), 1));
    });
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'ogee lattice';
}

function prairieWindow(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  let cells = [rp(X0 + 8, Y0 + 8, W - 16, H - 16)];
  for (let k = 0; k < ctx.int(7, 11); k++) {
    cells.sort((a, b) => bbox(b)[2] - bbox(b)[0] + bbox(b)[3] - bbox(b)[1] - (bbox(a)[2] - bbox(a)[0] + bbox(a)[3] - bbox(a)[1]));
    const c = cells.shift();
    const b = bbox(c);
    const m = centroid(c);
    const wide = b[2] - b[0] > b[3] - b[1];
    const [p, q] = splitPoly(c, [m[0] + ctx.between(-12, 12), m[1] + ctx.between(-12, 12)], wide ? Math.PI / 2 : 0);
    cells.push(...(q ? [p, q] : [c]));
  }
  const items = [poly(rp(X0, Y0, W, H), ink)];
  cells.forEach((c, i) => {
    items.push(layer(poly(scalePts(c, ...centroid(c), 0.95), i % 4 === 0 ? pal[1 + (i % 3)] : pal[0], i % 4 === 0 ? 0 : 0.35), 1));
    if (i % 3 === 0) items.push(layer(poly(scalePts(c, ...centroid(c), 0.35), pal[2 + (i % 2)]), 2));
  });
  chunk(ctx, items, 14);
  return 'prairie window';
}

function glasgowRose(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.int(2, 3);
  const items = [];
  for (let k = 0; k < n; k++) {
    const x = X0 + (W / n) * (k + 0.5);
    const y = Y0 + ctx.between(60, 110);
    items.push(layer(line([[x, y], [x + ctx.between(-8, 8), Y1 - 4]], pal[0], 4), 0));
    items.push(layer(ell(x + 16, Y1 - 90, 14, 5, -0.5, pal[1]), 1), layer(ell(x - 16, Y1 - 60, 14, 5, 0.5, pal[1]), 1));
    [[34, pal[2]], [26, pal[3]], [18, pal[0]], [10, pal[2]]].forEach(([r, col], z) => {
      items.push(layer(poly(rp(x - r, y - r, r * 2, r * 2), col), 2 + z));
    });
    items.push(layer(circ(x, y, 4, ink), 7));
  }
  flush(ctx, items, 1);
  return 'stylised rose';
}

function decoSetbacks(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const rays = ctx.int(10, 16);
  for (let k = 0; k < rays; k++) items.push(layer(poly([[CX, Y1], pol(CX, Y1, 330, Math.PI + (k * Math.PI) / rays), pol(CX, Y1, 330, Math.PI + ((k + 1) * Math.PI) / rays)], pal[k % 2 ? 0 : 1]), 0));
  const steps = ctx.int(5, 7);
  let y = Y1;
  for (let k = 0; k < steps; k++) {
    const w = 190 - k * (150 / steps);
    const h = 260 / steps;
    items.push(layer(poly(rp(CX - w / 2, y - h, w, h), pal[2 + (k % 2)]), 1));
    for (let r = -w / 2 + 8; r < w / 2; r += 12) items.push(layer(line([[CX + r, y - h + 4], [CX + r, y - 4]], ink, 1.6), 2));
    y -= h;
  }
  items.push(layer(poly([[CX - 5, y], [CX, y - 40], [CX + 5, y]], pal[4]), 3));
  flush(ctx, items, 1);
  return 'stepped tower';
}

function decoFountain(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const n = ctx.int(5, 7);
  const bw = W / (2 * n + 1);
  const items = [];
  for (let k = -n; k <= n; k++) {
    const h = (Math.cos((k / (n + 0.5)) * Math.PI * 0.5) ** 1.4) * 250 + 30;
    const stepsN = Math.max(2, Math.round(h / 28));
    for (let s = 0; s < stepsN; s++) {
      const sh = h / stepsN;
      items.push(poly(rp(CX + k * bw - bw / 2 + 1, Y1 - (s + 1) * sh, bw - 2, sh - 2), pal[(Math.abs(k) + s) % 5]));
    }
    items.push(layer(circ(CX + k * bw, Y1 - h - 4, bw * 0.3, pal[3]), 1));
  }
  flush(ctx, items, 1);
  return 'frozen fountain';
}

function streamline(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const rows = ctx.int(12, 18);
  for (let r = 0; r < rows; r++) {
    const y = Y0 + 10 + (r / rows) * (H - 20);
    const len = ctx.between(60, 200);
    const x0 = ctx.rand() < 0.5 ? X0 : X1 - len;
    items.push(line([[x0 + 6, y], [x0 + len, y]], pal[r % 3], ctx.pick([4, 4, 8, 12])));
  }
  const R = ctx.between(46, 70);
  items.push(layer(circ(CX + 30, CY, R, pal[3]), 1), layer(ring(CX + 30, CY, R * 0.6, ink, 4), 2));
  flush(ctx, items, 1);
  return 'speed lines';
}

function harlequin(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const w = ctx.between(34, 46);
  const h = w * ctx.between(1.5, 2);
  const items = [];
  const lines = [];
  eachCell(w, h / 2, (i, j, x, y) => {
    const cx = x + (mod(j, 2) ? w / 2 : 0);
    const cy = y;
    const d = [[cx, cy - h / 2], [cx + w / 2, cy], [cx, cy + h / 2], [cx - w / 2, cy]];
    items.push(poly(d, pal[mod(i + j, 3)]));
    lines.push(line(d, paper, 1.4, true));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  flush(ctx, lines.filter((it) => inFrame(it.b)), 1);
  return 'harlequin';
}

function spindleBlooms(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.int(6, 9);
  const items = [];
  for (let k = 0; k < n; k++) {
    const x1 = X0 + 14 + ((W - 28) * (k + 0.5)) / n;
    const x0 = CX + (x1 - CX) * 0.25;
    const y1 = Y0 + ctx.between(36, 150);
    const pts = [[x0, Y1 - 6], [(x0 + x1) / 2 + ctx.between(-24, 24), (Y1 + y1) / 2], [x1, y1]];
    items.push(layer(stroked(smoothPath(pts), pal[0], 1.8, bbox(pts)), 0));
    const a = Math.atan2(pts[2][1] - pts[1][1], pts[2][0] - pts[1][0]);
    const cup = [];
    for (let q = 0; q <= 8; q++) cup.push(pol(x1, y1, 11, a - Math.PI / 2 + (q / 8) * Math.PI));
    items.push(layer(poly([[x1, y1], ...cup], pal[1 + (k % 3)]), 1));
    items.push(layer(circ(...pol(x1, y1, 16, a), 2.6, pal[3]), 2));
    items.push(layer(ell((x0 + x1) / 2, (Y1 + y1) / 2, 7, 2.6, 0.7 + k, pal[2]), 1));
  }
  flush(ctx, items, 1);
  return 'spindle flowers';
}

function gingham(ctx) {
  const { pal } = setup(ctx, 3);
  const s = ctx.between(16, 28);
  const items = [poly(rp(X0, Y0, W, H), pal[2])];
  for (let x = X0; x < X1; x += s * 2) items.push(layer(poly(rp(x, Y0, s, H), pal[0], 0.55), 1));
  for (let y = Y0; y < Y1; y += s * 2) items.push(layer(poly(rp(X0, y, W, s), pal[0], 0.55), 1));
  flush(ctx, items.map((it) => it), 1);
  return 'gingham';
}

function sgraffito(ctx) {
  const { pal, ink, bg } = setup(ctx, 4);
  const items = [poly(rp(X0 + 6, Y0 + 6, W - 12, H - 12), pal[0])];
  const s = ctx.between(26, 34);
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2;
    const cy = y + s / 2;
    items.push(layer(line([[cx, cy - s * 0.4], [cx + s * 0.4, cy], [cx, cy + s * 0.4], [cx - s * 0.4, cy]], bg, 1.8, true), 1));
    items.push(layer(circ(cx, cy, s * 0.07, bg), 1));
    if (mod(i + j, 2)) for (let q = 0; q < 4; q++) items.push(layer(line([[cx, cy], pol(cx, cy, s * 0.28, (q * TAU) / 4 + Math.PI / 4)], bg, 1.2), 1));
  });
  items.push(layer(poly(rp(X0 + 6, Y0 + 6, W - 12, 24), pal[1]), 2), layer(poly(rp(X0 + 6, Y1 - 30, W - 12, 24), pal[1]), 2));
  for (let x = X0 + 14; x < X1 - 10; x += 12) items.push(layer(line([[x, Y0 + 12], [x + 6, Y0 + 24]], bg, 1.6), 3), layer(line([[x, Y1 - 24], [x + 6, Y1 - 12]], bg, 1.6), 3));
  flush(ctx, items.filter((it) => inFrame(it.b)), 1);
  return 'sgraffito';
}

function parquetry(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const s = ctx.between(66, 80);
  const slats = ctx.int(5, 7);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const horiz = mod(i + j, 2) === 0;
    for (let k = 0; k < slats; k++) {
      const t = s / slats;
      const r = horiz ? rp(x + 0.8, y + k * t + 0.8, s - 1.6, t - 1.6) : rp(x + k * t + 0.8, y + 0.8, t - 1.6, s - 1.6);
      items.push(poly(r, pal[(k + (horiz ? 0 : 2) + i) % 4 < 2 ? 0 : 1 + ((k + j) % 3)]));
    }
    if (horiz) items.push(layer(poly([[x + s / 2, y + s * 0.38], [x + s * 0.62, y + s / 2], [x + s / 2, y + s * 0.62], [x + s * 0.38, y + s / 2]], pal[4]), 1));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'parquetry';
}

function marquetryStar(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const n = ctx.pick([8, 12, 16]);
  const items = [circ(CX, CY, 106, ink), circ(CX, CY, 100, pal[0])];
  [[96, pal[1], pal[2]], [66, pal[3], pal[4]], [38, pal[1], pal[2]]].forEach(([R, light, dark], k) => {
    for (let i = 0; i < n; i++) {
      const a = (i * TAU) / n + (k % 2 ? TAU / n / 2 : 0);
      const tip = pol(CX, CY, R, a);
      const l = pol(CX, CY, R * 0.34, a - TAU / n / 2);
      const r = pol(CX, CY, R * 0.34, a + TAU / n / 2);
      items.push(layer(poly([[CX, CY], l, tip], light), k + 1), layer(poly([[CX, CY], tip, r], dark), k + 1));
    }
  });
  items.push(layer(circ(CX, CY, 8, pal[0]), 5));
  flush(ctx, items, 1);
  return 'inlaid star';
}

function compassRose(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.pick([16, 32]);
  const items = [ring(CX, CY, 100, ink, 3), ring(CX, CY, 88, pal[0], 2)];
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n - Math.PI / 2;
    const len = i % 8 === 0 ? 100 : i % 4 === 0 ? 78 : i % 2 === 0 ? 56 : 40;
    const w = i % 4 === 0 ? TAU / n * 0.8 : TAU / n * 0.5;
    const tip = pol(CX, CY, len, a);
    const base = 14;
    items.push(layer(poly([[CX, CY], pol(CX, CY, base, a - w), tip], pal[1]), 1 + (i % 4 === 0 ? 1 : 0)), layer(poly([[CX, CY], tip, pol(CX, CY, base, a + w)], pal[2 + (i % 2)]), 1 + (i % 4 === 0 ? 1 : 0)));
  }
  items.push(layer(circ(CX, CY, 7, pal[3]), 3));
  for (let i = 0; i < 72; i++) items.push(layer(line([pol(CX, CY, 92, (i * TAU) / 72), pol(CX, CY, i % 6 === 0 ? 100 : 96, (i * TAU) / 72)], ink, 1), 0));
  flush(ctx, items, 1);
  return 'compass rose';
}

function heraldicField(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const full = rp(X0 + 12, Y0 + 20, W - 24, H - 40);
  const mode = ctx.int(0, 3);
  const items = [poly(full, pal[0])];
  const m = centroid(full);
  if (mode === 0) {
    const [a] = splitPoly(full, m, Math.PI * 0.3);
    if (a) items.push(layer(poly(a, pal[1]), 1));
  } else if (mode === 1) {
    items.push(layer(poly([[m[0], m[1] - 20], [X1 - 12, m[1] + 60], [X1 - 12, m[1] + 110], [m[0], m[1] + 30], [X0 + 12, m[1] + 110], [X0 + 12, m[1] + 60]], pal[1]), 1));
  } else if (mode === 2) {
    items.push(layer(poly(rp(m[0], full[0][1], (W - 24) / 2, (H - 40) / 2), pal[1]), 1), layer(poly(rp(X0 + 12, m[1], (W - 24) / 2, (H - 40) / 2), pal[1]), 1));
  } else {
    for (let k = 0; k < 8; k++) items.push(layer(poly([m, pol(m[0], m[1], 200, (k * TAU) / 8), pol(m[0], m[1], 200, ((k + 1) * TAU) / 8)], pal[k % 2 ? 0 : 1]), 1));
  }
  const ordinary = ctx.int(0, 2);
  if (ordinary === 0) items.push(layer(poly(rp(m[0] - 11, full[0][1], 22, H - 40), pal[2]), 2), layer(poly(rp(X0 + 12, m[1] - 11, W - 24, 22), pal[2]), 2));
  else if (ordinary === 1) items.push(layer(line([[X0 + 12, Y0 + 20], [X1 - 12, Y1 - 20]], pal[2], 22), 2), layer(line([[X1 - 12, Y0 + 20], [X0 + 12, Y1 - 20]], pal[2], 22), 2));
  else items.push(layer(circ(m[0], m[1], 38, pal[2]), 2), layer(circ(m[0], m[1], 18, pal[3]), 3));
  items.push(layer(poly(full, ink, 0.0), 0));
  flush(ctx, items.slice(0, -1).map((it) => it), 1);
  return 'heraldic field';
}

module.exports = {
  celticKnot, celticSpiral, celticKey, meander, eggAndDart, opusSectile, cosmati, roseWindow, gothicTracery, quatrefoil, trellis,
  damask, ogeeLattice, prairieWindow, glasgowRose, decoSetbacks, decoFountain, streamline, harlequin, spindleBlooms, gingham,
  sgraffito, parquetry, marquetryStar, compassRose, heraldicField
};
