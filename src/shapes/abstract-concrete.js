'use strict';

// Concrete and constructivist art, re-imagined: serial columns and colour rows, proportional blocks, an even field,
// spatial planes, ruler-and-compass lines, space-force wedges, constructivist textiles, a dynamic city, ambiguous line
// figures, transparent planes, a colour star, articulated planes, a metaschema, light threads, diagonal functions,
// modulated surfaces, a universal grid, colour rhythms, rotated and scattered bars, De Stijl glass and woven blocks.

const K = require('./pattern-kit');
const { starPoints } = require('./engine');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, flush, chunk, scalePts, centroid, ngon, rotPts, ell, splitPoly } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function serialColumns(ctx) {
  const { pal } = setup(ctx, 5);
  const n = ctx.int(7, 11);
  const items = [];
  const widths = Array.from({ length: n }, (_, i) => 1 + (i % 3));
  const total = widths.reduce((a, b) => a + b, 0);
  let x = X0;
  const shift = ctx.int(0, 4);
  widths.forEach((w, i) => {
    const cw = (W * w) / total;
    const rows = 4;
    for (let j = 0; j < rows; j++) items.push(poly(rp(x, Y0 + (j * H) / rows, cw, H / rows), pal[mod(i + j * 2 + shift, 5)]));
    x += cw;
  });
  flush(ctx, items, 1);
  return 'serial columns';
}

function colorRows(ctx) {
  const { pal } = setup(ctx, 5);
  const cols = ctx.int(5, 7);
  const rows = ctx.int(8, 11);
  const sh = ctx.int(1, 3);
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) items.push(poly(rp(X0 + (i * W) / cols + 1, Y0 + (j * H) / rows + 1, W / cols - 2, H / rows - 2), pal[mod(i + j * sh, 5)]));
  flush(ctx, items, 3);
  return 'colour rows';
}

function relationBlocks(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const ratios = [1, 2, 3, 5, 8, 13].sort(() => ctx.rand() - 0.5);
  const total = ratios.reduce((a, b) => a + b, 0);
  let y = Y0;
  const vertical = ctx.rand() < 0.5;
  let pos = 0;
  ratios.forEach((r, i) => {
    const h = (r / total) * (vertical ? W : H);
    const w = vertical ? H * (0.4 + (i % 3) * 0.25) : W * (0.4 + ((i + 1) % 3) * 0.25);
    items.push(vertical ? poly(rp(X0 + pos, Y0 + (i % 2) * (H - w), h, w), pal[i % 5]) : poly(rp(X0 + (i % 2) * (W - w), Y0 + pos, w, h), pal[i % 5]));
    pos += h;
  });
  flush(ctx, items, 1);
  return 'proportional blocks';
}

function unistRelief(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const items = [];
  const p = ctx.between(3.5, 5);
  for (let y = Y0; y < Y1; y += p) items.push(line([[X0, y], [X1, y]], pal[0], p * 0.5));
  for (let k = 0; k < ctx.int(3, 5); k++) {
    const cx = ctx.between(X0 + 40, X1 - 40);
    const cy = ctx.between(Y0 + 60, Y1 - 60);
    const R = ctx.between(26, 60);
    for (let r = R; r > 4; r -= p * 1.6) items.push(layer(ring(cx, cy, r, pal[1 + (k % 2)], p * 0.5), 1 + k));
  }
  flush(ctx, items, 3);
  return 'even field';
}

function spatialComposition(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const n = ctx.int(5, 8);
  for (let i = 0; i < n; i++) {
    const w = ctx.between(40, 120);
    const h = ctx.between(40, 110);
    const x = ctx.between(X0 + 10, X1 - w - 10);
    const y = ctx.between(Y0 + 10, Y1 - h - 10);
    const sk = ctx.between(-14, 14);
    items.push(layer(poly([[x, y], [x + w, y + sk], [x + w, y + h + sk], [x, y + h]], pal[i % 5], 0.85), i));
  }
  flush(ctx, items, 1);
  return 'spatial composition';
}

function lineConstruction(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const n = ctx.int(10, 16);
  for (let i = 0; i < n; i++) {
    const a = [ctx.between(X0, X1), ctx.between(Y0, Y1)];
    const b = [ctx.between(X0, X1), ctx.between(Y0, Y1)];
    items.push(line([a, b], pal[i % 4], ctx.pick([1.5, 3, 6])));
    if (i % 3 === 0) items.push(layer(ring(a[0], a[1], ctx.between(10, 50), ink, 1.6), 1));
  }
  flush(ctx, items, 1);
  return 'ruler and compass';
}

function spaceForce(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const a = ctx.between(0, TAU);
    const c = pol(CX, CY, ctx.between(0, 70), a);
    const r = ctx.between(60, 130);
    items.push(layer(poly([c, pol(c[0], c[1], r, a), pol(c[0], c[1], r * 0.8, a + ctx.between(0.15, 0.5))], pal[i % 5], 0.7), i));
    if (i % 2) items.push(layer(circ(c[0] + ctx.between(-30, 30), c[1] + ctx.between(-30, 30), ctx.between(14, 34), pal[(i + 2) % 5], 0.8), i));
  }
  flush(ctx, items, 1);
  return 'space-force construction';
}

function constructivistTextile(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(34, 46);
  const items = [];
  K.eachCell(s, s, (i, j, x, y) => {
    items.push(poly(rp(x, y, s, s * 0.5), pal[mod(i + j, 2)]));
    items.push(layer(circ(x + s * 0.5, y + s * 0.5, s * 0.22, pal[2]), 1));
    items.push(layer(poly(rp(x + s * 0.1, y + s * 0.78, s * 0.8, s * 0.12), pal[3]), 1));
    if (mod(i, 2)) items.push(layer(poly([[x, y + s], [x + s * 0.3, y + s * 0.55], [x + s * 0.6, y + s]], ink), 1));
  });
  flush(ctx, items.filter((it) => K.inFrame(it.b)), 3);
  return 'constructivist textile';
}

function dynamicCity(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  for (let i = 0; i < ctx.int(9, 14); i++) {
    const a = ctx.between(0, TAU);
    const c = pol(CX, CY, ctx.between(0, 85), a);
    const w = ctx.between(16, 50);
    items.push(layer(poly(rotPts(rp(c[0] - w / 2, c[1] - w / 2, w, w * ctx.between(0.6, 1.8)), c[0], c[1], ctx.between(-0.8, 0.8)), pal[i % 5]), i));
    if (i % 3 === 0) items.push(layer(ring(c[0], c[1], w * 1.2, pal[(i + 1) % 5], 3), i));
  }
  flush(ctx, items, 1);
  return 'dynamic city';
}

function structuralConstellation(ctx) {
  const { pal, ink, paper } = setup(ctx, 3);
  const items = [];
  const n = ctx.int(5, 8);
  const cols = [paper, pal[0], pal[1]];
  for (let k = 0; k < n; k++) {
    const cx = ctx.between(X0 + 50, X1 - 50);
    const cy = ctx.between(Y0 + 60, Y1 - 60);
    const w = ctx.between(30, 60);
    const h = w * 0.55;
    const top = [[cx - w, cy], [cx, cy - h], [cx + w, cy], [cx, cy + h]];
    items.push(layer(line([top[0], top[1], top[2], top[3], top[0]], cols[k % 3], 1.8), k));
    items.push(layer(line([top[0], [cx - w, cy + h * 1.2], top[3]], cols[(k + 1) % 3], 1.8), k));
    items.push(layer(line([top[2], [cx + w, cy + h * 1.2], top[3]], cols[(k + 2) % 3], 1.8), k));
    items.push(layer(line([top[1], top[3]], cols[k % 3], 1.8), k));
  }
  flush(ctx, items, 1);
  return 'impossible lines';
}

function transparentPlanes(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  for (let i = 0; i < ctx.int(6, 9); i++) {
    const x = ctx.between(X0, X1 - 30);
    const y = ctx.between(Y0, Y1 - 30);
    items.push(layer(i % 3 === 2 ? circ(x + 40, y + 40, ctx.between(20, 60), pal[i % 5], 0.6) : poly(rp(x, y, ctx.between(30, 120), ctx.between(30, 100)), pal[i % 5], 0.6), i));
  }
  flush(ctx, items, 1);
  return 'transparent planes';
}

function colorStar(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const n = 12;
  const R = ctx.between(96, 104);
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n - Math.PI / 2;
    const t = pol(CX, CY, R, a);
    items.push(poly([[CX, CY], pol(CX, CY, R * 0.55, a - TAU / n / 2), t, pol(CX, CY, R * 0.55, a + TAU / n / 2)], pal[mod(i * 2, 5)]));
    items.push(layer(poly([[CX, CY], pol(CX, CY, R * 0.3, a - TAU / n / 2), pol(CX, CY, R * 0.55, a), pol(CX, CY, R * 0.3, a + TAU / n / 2)], pal[mod(i * 2 + 2, 5)], 0.8), 1));
  }
  items.push(layer(circ(CX, CY, 10, ink), 2));
  flush(ctx, items, 1);
  return 'colour star';
}

function articulatedPlanes(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const hx = CX + ctx.between(-30, 30);
  let y = Y0 + 20;
  for (let i = 0; i < ctx.int(5, 7); i++) {
    const h = ctx.between(30, 60);
    const w = ctx.between(50, 140);
    const a = ctx.between(-0.3, 0.3);
    items.push(poly(rotPts(rp(hx - w / 2, y, w, h), hx, y + h / 2, a), pal[i % 5], 0.95));
    y += h * 0.85;
  }
  flush(ctx, items, 1);
  return 'articulated planes';
}

function coplanal(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const n = ctx.int(4, 6);
  for (let i = 0; i < n; i++) {
    const w = ctx.between(40, 110);
    const h = ctx.between(40, 110);
    const x = X0 + 14 + ((W - 28 - w) * i) / (n - 1 || 1);
    const y = ctx.between(Y0 + 14, Y1 - h - 14);
    items.push(poly(rp(x + 5, y + 5, w, h), ink, 0.35), layer(poly(rp(x, y, w, h), pal[i % 5]), 1));
  }
  flush(ctx, items, 1);
  return 'separate planes';
}

function metaschema(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const s = ctx.between(40, 50);
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = X0 + (W - cols * s) / 2 + (i + 0.5) * s;
    const cy = Y0 + (H - rows * s) / 2 + (j + 0.5) * s;
    items.push(poly(rotPts(rp(cx - s * 0.4, cy - s * 0.4, s * 0.8, s * 0.8), cx, cy, ((i * 5 + j * 3) % 7) * 0.12 - 0.35), pal[mod(i + j, 4)]));
  }
  flush(ctx, items, 3);
  return 'tilted rectangles';
}

function goldThreads(ctx) {
  const { pal } = setup(ctx, 3);
  const items = [];
  const beams = ctx.int(3, 5);
  for (let b = 0; b < beams; b++) {
    const a = ctx.between(0, Math.PI);
    const o = ctx.between(-80, 80);
    const n = ctx.int(14, 24);
    for (let i = 0; i < n; i++) {
      const t = (i / n - 0.5) * 80;
      const c = [CX + Math.cos(a + Math.PI / 2) * (o + t), CY + Math.sin(a + Math.PI / 2) * (o + t)];
      items.push(line([[c[0] - Math.cos(a) * 200, c[1] - Math.sin(a) * 200], [c[0] + Math.cos(a) * 200, c[1] + Math.sin(a) * 200]], pal[b % 2 ? 0 : 1], 0.7));
    }
  }
  flush(ctx, items, 1);
  return 'light threads';
}

function diagonalFunction(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const n = ctx.int(14, 22);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    items.push(line([[X0, Y0 + t * H], [X0 + t * W, Y1]], pal[i % 3], 1.6 + (i % 4)));
    items.push(line([[X1, Y1 - t * H], [X1 - t * W, Y0]], pal[(i + 1) % 3], 1));
  }
  flush(ctx, items, 1);
  return 'diagonal function';
}

function modulatedSurface(ctx) {
  const { pal, ink, paper } = setup(ctx, 3, ctx.colors[1]);
  const items = [];
  const bands = ctx.int(5, 8);
  const bh = H / bands;
  const f = ctx.between(0.3, 0.9);
  const amp = ctx.between(0.15, 0.42);
  const [c1, c2] = [ctx.pick([ink, pal[0]]), ctx.pick([paper, pal[1]])];
  for (let b = 0; b < bands; b++) {
    const y = Y0 + b * bh;
    items.push(poly(rp(X0, y, W, bh), b % 2 ? c1 : c2));
    const pts = Array.from({ length: 26 }, (_, i) => [X0 + (i / 25) * W, y + bh / 2 + Math.sin(i * f + b * ctx.between(0.4, 1.2)) * bh * amp]);
    items.push(layer(line(pts, b % 2 ? c2 : c1, ctx.between(1.6, 4)), 1));
  }
  flush(ctx, items, 3);
  return 'modulated surface';
}

function universalGrid(ctx) {
  const { pal, ink, paper } = setup(ctx, 3, ctx.colors[1]);
  let cells = [rp(X0 + 6, Y0 + 6, W - 12, H - 12)];
  for (let k = 0; k < ctx.int(10, 15); k++) {
    cells.sort((a, b) => K.bbox(b)[2] - K.bbox(b)[0] + K.bbox(b)[3] - K.bbox(b)[1] - (K.bbox(a)[2] - K.bbox(a)[0] + K.bbox(a)[3] - K.bbox(a)[1]));
    const c = cells.shift();
    const m = centroid(c);
    const wide = K.bbox(c)[2] - K.bbox(c)[0] > K.bbox(c)[3] - K.bbox(c)[1];
    const parts = splitPoly(c, [m[0] + ctx.between(-8, 8), m[1] + ctx.between(-8, 8)], wide ? Math.PI / 2 : 0);
    cells.push(...(parts.length === 2 ? parts : [c]));
  }
  const items = [];
  cells.forEach((c, i) => {
    const m = centroid(c);
    const b = K.bbox(c);
    const r = Math.min(b[2] - b[0], b[3] - b[1]) * 0.28;
    items.push(layer(line(c, ink, 2.4, true), 0));
    const g = i % 5;
    if (g === 0) items.push(layer(circ(m[0], m[1], r, pal[0]), 1));
    else if (g === 1) items.push(layer(poly(rp(m[0] - r, m[1] - r, r * 2, r * 2), pal[1]), 1));
    else if (g === 2) items.push(layer(poly([[m[0], m[1] - r], [m[0] + r, m[1] + r], [m[0] - r, m[1] + r]], pal[2]), 1));
    else if (g === 3) items.push(layer(line([[m[0] - r, m[1]], [m[0] + r, m[1]]], ink, 3), 1), layer(line([[m[0], m[1] - r], [m[0], m[1] + r]], ink, 3), 1));
    else items.push(layer(ring(m[0], m[1], r, ink, 3), 1));
  });
  flush(ctx, items, 1);
  return 'universal grid';
}

function colorRhythm(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const rows = ctx.int(8, 12);
  const rh = H / rows;
  for (let j = 0; j < rows; j++) {
    let x = X0;
    let k = 0;
    while (x < X1) {
      const w = (1 + ((j * 3 + k * 2) % 4)) * ctx.between(8, 14);
      items.push(poly(rp(x, Y0 + j * rh + 1, Math.min(w, X1 - x), rh - 2), pal[mod(j + k, 5)]));
      x += w + 2;
      k++;
    }
  }
  flush(ctx, items, 3);
  return 'colour rhythm';
}

function rotatedBands(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const a = ctx.between(0.15, 0.6);
  const n = ctx.int(8, 14);
  for (let i = 0; i < n; i++) items.push(layer(poly(rotPts(rp(CX - 200, Y0 + (i * (H + 80)) / n - 40, 400, (H + 80) / n - 4), CX, CY, a), pal[i % 5]), 0));
  flush(ctx, items, 1);
  return 'rotated bands';
}

function scatteredBars(ctx) {
  const { pal, ink } = setup(ctx, 4, ctx.colors[1]);
  const items = [];
  for (let i = 0; i < ctx.int(14, 22); i++) {
    const horiz = ctx.rand() < 0.5;
    const L = ctx.between(20, 80);
    const x = ctx.between(X0 + 8, X1 - 90);
    const y = ctx.between(Y0 + 8, Y1 - 90);
    items.push(layer(poly(horiz ? rp(x, y, L, 9) : rp(x, y, 9, L), pal[i % 4]), i));
  }
  flush(ctx, items, 1);
  return 'scattered bars';
}

function asymmetricPlanes(ctx) {
  const { pal, ink } = setup(ctx, 4, ctx.colors[1]);
  const items = [];
  const x1 = ctx.between(X0 + 40, CX);
  const y1 = ctx.between(Y0 + 60, CY);
  items.push(poly(rp(x1, Y0 + 20, ctx.between(50, 100), y1 - Y0), pal[0]));
  items.push(poly(rp(X0 + 10, y1, ctx.between(90, 160), ctx.between(40, 90)), pal[1]));
  items.push(poly(rp(CX, CY + 20, ctx.between(50, 90), ctx.between(60, 110)), pal[2]));
  items.push(poly(rp(X0 + 10, Y1 - 60, 80, 40), pal[3]));
  [Y0 + 20, y1, CY + 20, Y1 - 20].forEach((y) => items.push(layer(line([[X0 + 6, y], [X1 - 6, y]], ink, 2), 1)));
  [x1, CX, X1 - 40].forEach((x) => items.push(layer(line([[x, Y0 + 6], [x, Y1 - 6]], ink, 2), 1)));
  flush(ctx, items, 1);
  return 'asymmetric planes';
}

function stijlWindow(ctx) {
  const { pal, ink } = setup(ctx, 4, ctx.colors[1]);
  const xs = [X0, ...Array.from({ length: ctx.int(2, 4) }, () => ctx.between(X0 + 30, X1 - 30)).sort((a, b) => a - b), X1];
  const ys = [Y0, ...Array.from({ length: ctx.int(3, 5) }, () => ctx.between(Y0 + 30, Y1 - 30)).sort((a, b) => a - b), Y1];
  const items = [];
  for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) items.push(poly(rp(xs[i], ys[j], xs[i + 1] - xs[i], ys[j + 1] - ys[j]), (i * 3 + j * 5) % 7 < 3 ? pal[(i + j) % 4] : ctx.colors[1]));
  xs.forEach((x) => items.push(layer(line([[x, Y0], [x, Y1]], ink, 5), 1)));
  ys.forEach((y) => items.push(layer(line([[X0, y], [X1, y]], ink, 5), 1)));
  flush(ctx, items, 1);
  return 'stained grid';
}

function bauhausWeaving(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const cols = ctx.int(4, 6);
  const rows = ctx.int(6, 9);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (i * W) / cols;
    const y = Y0 + (j * H) / rows;
    const w = W / cols;
    const h = H / rows;
    const threads = 6;
    const horiz = (i * 7 + j * 3) % 3 !== 0;
    for (let t = 0; t < threads; t++) items.push(poly(horiz ? rp(x, y + (t * h) / threads, w, h / threads - 0.4) : rp(x + (t * w) / threads, y, w / threads - 0.4, h), pal[mod(i + j + (t % 2) * 2, 5)]));
  }
  flush(ctx, items, 3);
  return 'woven blocks';
}

function pictureArchitecture(ctx) {
  const { pal, ink } = setup(ctx, 5, ctx.colors[1]);
  const items = [];
  let y = Y1 - 10;
  for (let i = 0; i < ctx.int(6, 9) && y > Y0 + 30; i++) {
    const w = ctx.between(60, 180);
    const h = ctx.between(22, 48);
    const x = ctx.between(X0 + 4, X1 - w - 4);
    items.push(layer(poly(rp(x, y - h, w, h), pal[i % 5]), i));
    if (i % 2) items.push(layer(poly([[x, y - h], [x + w * 0.3, y - h - 14], [x + w * 0.6, y - h]], ink), i));
    y -= h * 0.75;
  }
  flush(ctx, items, 1);
  return 'picture architecture';
}

module.exports = {
  serialColumns, colorRows, relationBlocks, unistRelief, spatialComposition, lineConstruction, spaceForce, constructivistTextile,
  dynamicCity, structuralConstellation, transparentPlanes, colorStar, articulatedPlanes, coplanal, metaschema, goldThreads,
  diagonalFunction, modulatedSurface, universalGrid, colorRhythm, rotatedBands, scatteredBars, asymmetricPlanes, stijlWindow,
  bauhausWeaving, pictureArchitecture
};
