'use strict';

// Textiles of Africa, the Americas and Europe, as abstract interpretations: a stamped grid, resist-dyed indigo, wax print,
// a lozenge lattice, radial appliqué, brocade bands, a stepped cross, invented glyph squares, serrated diamonds, banded
// pottery, strip patchwork, star and log-cabin quilts, houndstooth, argyle, paisley, knitted bands and stars, cables,
// painted eggs, cross-stitch, azulejo and cement tiles.

const K = require('./pattern-kit');
const { starPoints } = require('./engine');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, inFrame, weave, ell, splitPoly, eachCell, smoothPath } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

// A little pixel picture: rows of strings, '1' for a stitch, drawn at (x, y) with pixel size s.
function pixels(items, rows, x, y, s, col, z = 0) {
  rows.forEach((row, j) => [...row].forEach((c, i) => c === '1' && items.push(layer(poly(rp(x + i * s + 0.3, y + j * s + 0.3, s - 0.6, s - 0.6), col), z))));
}

function stampedGrid(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(46, 56);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2;
    const cy = y + s / 2;
    items.push(poly(rp(x + 3, y + 3, s - 6, s - 6), pal[mod(i + j, 2)]));
    const t = mod(i * 5 + j * 3 + ctx.int(0, 1), 6);
    const col = pal[2 + mod(i + j, 2)];
    if (t === 0) for (let k = 1; k <= 3; k++) items.push(layer(poly(rp(cx - k * s * 0.11, cy - k * s * 0.11, k * s * 0.22, k * s * 0.22), k % 2 ? col : pal[mod(i + j, 2)]), 3 - k));
    else if (t === 1) items.push(layer(poly([[cx - s * 0.06, cy - s * 0.32], [cx + s * 0.06, cy - s * 0.32], [cx + s * 0.06, cy + s * 0.32], [cx - s * 0.06, cy + s * 0.32]], col), 1), layer(poly([[cx - s * 0.32, cy - s * 0.06], [cx + s * 0.32, cy - s * 0.06], [cx + s * 0.32, cy + s * 0.06], [cx - s * 0.32, cy + s * 0.06]], col), 1));
    else if (t === 2) items.push(layer(line([[cx - s * 0.3, cy + s * 0.1], [cx - s * 0.15, cy - s * 0.1], [cx, cy + s * 0.1], [cx + s * 0.15, cy - s * 0.1], [cx + s * 0.3, cy + s * 0.1]], col, 3.2), 1));
    else if (t === 3) items.push(layer(poly([[cx, cy - s * 0.3], [cx + s * 0.3, cy], [cx, cy + s * 0.3], [cx - s * 0.3, cy]], col), 1), layer(circ(cx, cy, s * 0.08, pal[mod(i + j, 2)]), 2));
    else if (t === 4) { items.push(layer(circ(cx, cy, s * 0.28, col), 1)); for (let k = 0; k < 4; k++) items.push(layer(circ(...pol(cx, cy, s * 0.28, (k * TAU) / 4 + Math.PI / 4), s * 0.06, pal[mod(i + j, 2)]), 2)); }
    else items.push(layer(poly([[cx - s * 0.3, cy + s * 0.2], [cx, cy - s * 0.3], [cx + s * 0.3, cy + s * 0.2]], col), 1), layer(poly([[cx - s * 0.15, cy + s * 0.2], [cx, cy - s * 0.05], [cx + s * 0.15, cy + s * 0.2]], pal[mod(i + j, 2)]), 2));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 1);
  return 'stamped grid';
}

function adireIndigo(ctx) {
  const { pal, ink, paper } = setup(ctx, 3);
  const s = ctx.between(66, 100);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2;
    const cy = y + s / 2;
    items.push(poly(rp(x + 2, y + 2, s - 4, s - 4), pal[0]));
    const t = mod(i + j * 2 + ctx.int(0, 1), 3);
    if (t === 0) items.push(layer(line(Array.from({ length: 40 }, (_, k) => pol(cx, cy, s * 0.4 * (1 - k / 44), (k / 40) * TAU * 2.4)), pal[1], 3), 1));
    else if (t === 1) for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) items.push(layer(circ(x + s * (0.25 + 0.25 * q), y + s * (0.25 + 0.25 * r), s * 0.06, pal[1]), 1));
    else for (let k = 0; k < 5; k++) items.push(layer(line([[x + s * 0.15, y + s * (0.2 + k * 0.15)], [x + s * 0.85, y + s * (0.2 + k * 0.15)]], pal[1], 2.4), 1));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'resist indigo';
}

function waxPrint(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const s = ctx.between(46, 62);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2 + (mod(j, 2) ? s / 2 : 0);
    const cy = y + s / 2;
    [[0.5, pal[mod(i + j, 2)]], [0.38, pal[2]], [0.26, pal[3 + mod(i, 2)]], [0.13, ink]].forEach(([k, col], z) => items.push(layer(circ(cx, cy, s * k, col), z)));
    for (let k = 0; k < 8; k++) items.push(layer(circ(...pol(cx, cy, s * 0.44, (k * TAU) / 8), s * 0.025, pal[4]), 5));
    items.push(layer(line([[cx - s * 0.5, cy + s * 0.5], [cx - s * 0.4, cy + s * 0.46], [cx - s * 0.34, cy + s * 0.5]], pal[1], 1), 5));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'wax print';
}

function berberLattice(ctx) {
  const { pal, ink, paper } = setup(ctx, 3, ctx.colors[1]);
  const s = ctx.between(52, 66);
  const items = [];
  const jit = () => ctx.between(-s * 0.08, s * 0.08);
  const node = {};
  const P = (i, j) => (node[i + ',' + j] = node[i + ',' + j] || [X0 + i * s + (mod(j, 2) ? s / 2 : 0) + jit(), Y0 + j * s * 0.7 + jit()]);
  for (let j = -1; j < Math.ceil(H / (s * 0.7)) + 1; j++) {
    for (let i = -1; i < Math.ceil(W / s) + 1; i++) {
      const a = P(i, j);
      const o = mod(j, 2);
      items.push(line([a, P(i + o, j + 1)], ink, 3.4), line([a, P(i + o - 1, j + 1)], ink, 3.4));
      if (ctx.rand() < 0.3) {
        const c = centroid([a, P(i + o, j + 1), P(i, j + 2), P(i + o - 1, j + 1)]);
        items.push(layer(line([[c[0] - 4, c[1] - 4], [c[0] + 4, c[1] + 4]], pal[0], 2.4), 1), layer(line([[c[0] - 4, c[1] + 4], [c[0] + 4, c[1] - 4]], pal[0], 2.4), 1));
      }
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'lozenge lattice';
}

function tifaifaiQuilt(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.pick([4, 6, 8]);
  const items = [poly(rp(X0 + 8, Y0 + 8, W - 16, H - 16), pal[0])];
  const leaf = (r, w, a) => {
    const pts = [];
    for (let k = 0; k <= 14; k++) pts.push(pol(CX, CY, r * (k / 14), a + Math.sin((k / 14) * Math.PI) * w * 0.5));
    for (let k = 14; k >= 0; k--) pts.push(pol(CX, CY, r * (k / 14), a - Math.sin((k / 14) * Math.PI) * w * 0.5));
    return pts;
  };
  const rot = ctx.between(0, TAU);
  [[100, 0.7, pal[1]], [78, 0.62, pal[2]], [50, 0.55, pal[3]], [26, 0.5, pal[0]]].forEach(([r, w, col], k) => {
    for (let i = 0; i < n; i++) items.push(poly(leaf(r, w * (TAU / n), rot + (i * TAU) / n + (k % 2 ? Math.PI / n : 0)), col));
  });
  items.push(circ(CX, CY, 8, pal[2]));
  chunk(ctx, items, 16);
  return 'appliqué quilt';
}

function huipilBands(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const bandH = ctx.between(28, 36);
  const n = Math.floor(H / bandH);
  const y0 = Y0 + (H - n * bandH) / 2;
  for (let b = 0; b < n; b++) {
    const y = y0 + b * bandH;
    const c = bandH * 0.5;
    items.push(poly(rp(X0, y, W, bandH), pal[b % 2]));
    const t = ctx.int(0, 2);
    for (let x = X0; x < X1 + bandH; x += bandH) {
      const cx = x + c;
      const cy = y + c;
      if (t === 0) items.push(layer(poly([[cx, y + 3], [cx + c - 3, cy], [cx, y + bandH - 3], [cx - c + 3, cy]], pal[2 + (b % 2)]), 1), layer(circ(cx, cy, 3, pal[4]), 2));
      else if (t === 1) items.push(layer(poly([[x, y + bandH - 3], [x + c, y + 3], [x + bandH, y + bandH - 3]], pal[2 + (b % 2)]), 1));
      else items.push(layer(poly([[x + 2, y + bandH - 3], [x + 2, cy], [x + c, cy], [x + c, y + 3], [x + bandH - 2, y + 3], [x + bandH - 2, y + bandH - 3]], pal[2 + (b % 2)]), 1));
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'brocade bands';
}

function steppedCross(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(15, 17);
  const grid = ['0001110001000', '0001110001000'];
  const cells = 13;
  const items = [];
  const mid = 6;
  const x0 = CX - (cells * s) / 2;
  const y0 = CY - (cells * s) / 2;
  const inCross = (i, j) => {
    const d = Math.max(Math.abs(i - mid), Math.abs(j - mid));
    const m = Math.min(Math.abs(i - mid), Math.abs(j - mid));
    return (m <= 1 && d <= 5) || (m <= 2 && d <= 3 && d >= 2 && false) || (Math.abs(i - mid) + Math.abs(j - mid) <= 4 && m <= 3 && d <= 4 && (Math.abs(i - mid) <= 3 && Math.abs(j - mid) <= 3 ? (Math.abs(i - mid) + Math.abs(j - mid)) <= 4 : false));
  };
  void grid;
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      const d = Math.max(Math.abs(i - mid), Math.abs(j - mid));
      const on = inCross(i, j);
      items.push(poly(rp(x0 + i * s + 0.5, y0 + j * s + 0.5, s - 1, s - 1), on ? pal[mod(d, 2) + 1] : pal[0], 0));
    }
  }
  items.push(layer(circ(CX, CY, s * 1.4, ink), 1), layer(circ(CX, CY, s * 0.8, pal[3]), 2));
  flush(ctx, items, 2);
  return 'stepped cross';
}

function tocapuSquares(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(46, 54);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    items.push(poly(rp(x + 2, y + 2, s - 4, s - 4), pal[mod(i + j, 2)]));
    const g = s * 0.16;
    const bits = [ctx.rand() < 0.6, ctx.rand() < 0.5, ctx.rand() < 0.5, ctx.rand() < 0.7, ctx.rand() < 0.4, ctx.rand() < 0.5];
    // a 3 x 3 glyph that mirrors left to right
    [[0, 0, 0], [1, 0, 1], [2, 1, 2], [0, 2, 3], [1, 1, 4], [2, 0, 5], [1, 2, 3]].forEach(([r, c, b], k) => {
      if (!bits[b % 6]) return;
      [c, 2 - c].forEach((cc) => items.push(layer(poly(rp(x + s / 2 - 1.5 * g + cc * g, y + s / 2 - 1.5 * g + r * g, g - 0.8, g - 0.8), pal[2 + mod(i + j, 2)]), 1)));
    });
    items.push(layer(poly(rp(x + s / 2 - g / 2, y + s / 2 - g / 2, g, g), ink), 2));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'tocapu squares';
}

function serratedDiamonds(ctx) {
  const { pal } = setup(ctx, 5);
  const s = ctx.between(84, 106);
  const t = ctx.between(5, 8);
  const items = [];
  const stairs = (cx, cy, r) => {
    const pts = [];
    const n = Math.ceil(r / t);
    for (let k = 0; k <= n; k++) pts.push([cx + k * t, cy - r + k * t + t * 0], [cx + k * t + t, cy - r + k * t]);
    const quad = [];
    for (let k = 0; k < n; k++) quad.push([cx + k * t, cy - r + k * t], [cx + (k + 1) * t, cy - r + k * t]);
    const full = [];
    const q = (sx, sy) => quad.map(([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy]);
    return [...q(1, 1), ...q(1, -1).reverse(), ...q(-1, -1), ...q(-1, 1).reverse(), ...full];
  };
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2 + (mod(j, 2) ? s / 2 : 0);
    const cy = y + s / 2;
    [0.5, 0.4, 0.3, 0.2, 0.1].forEach((k, z) => items.push(layer(poly(stairs(cx, cy, s * k), pal[mod(z + i + j, 5)]), z)));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 1);
  return 'serrated diamonds';
}

function potteryBands(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const profile = ctx.pick([(t) => 40 + 55 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.05)) ** 0.8, (t) => 30 + 70 * Math.sin(Math.PI * t * 0.9 + 0.2) ** 1.2, (t) => 48 + 42 * Math.sin(Math.PI * (t * 0.9 + 0.1)) * (1 - t * 0.3)]);
  const top = Y0 + 20;
  const bot = Y1 - 14;
  const items = [];
  const s = 11;
  const rows = Math.floor((bot - top) / s);
  const kind = ctx.int(0, 2);
  for (let j = 0; j < rows; j++) {
    const t = j / rows;
    const hw = profile(t) * 0.98;
    const y = top + j * s;
    const cols = Math.floor((hw * 2) / s);
    for (let i = 0; i < cols; i++) {
      const x = CX - hw + (hw * 2 - cols * s) / 2 + i * s;
      const band = Math.floor(j / 4);
      const on = kind === 0 ? mod(i + j, 2) === 0 : kind === 1 ? mod(i, 3) !== 1 : mod(i + (band % 2) * 2, 4) < 2;
      items.push(poly(rp(x + 0.3, y + 0.3, s - 0.6, s - 0.6), band % 2 ? pal[on ? 0 : 1] : pal[on ? 2 : 3]));
    }
  }
  items.push(poly(rp(CX - profile(0) - 4, top - 6, profile(0) * 2 + 8, 6), ink));
  flush(ctx, items, 3);
  return 'banded pot';
}

function seminolePatchwork(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const hs = ctx.between(16, 24);
  const n = Math.floor(H / hs);
  const y0 = Y0 + (H - n * hs) / 2;
  for (let b = 0; b < n; b++) {
    const y = y0 + b * hs;
    const t = ctx.int(0, 3);
    items.push(poly(rp(X0, y, W, hs), pal[b % 2]));
    for (let x = X0 - hs; x < X1 + hs; x += hs) {
      const c = pal[2 + (b % 3)];
      if (t === 0) items.push(layer(poly([[x + hs / 2, y], [x + hs, y + hs / 2], [x + hs / 2, y + hs], [x, y + hs / 2]], c), 1));
      else if (t === 1) items.push(layer(poly([[x, y + hs], [x + hs / 2, y], [x + hs, y + hs]], c), 1));
      else if (t === 2) items.push(layer(poly([[x, y], [x + hs / 2, y], [x + hs, y + hs], [x + hs / 2, y + hs]], c), 1));
      else items.push(layer(poly(rp(x + hs * 0.25, y + hs * 0.25, hs * 0.5, hs * 0.5), c), 1));
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'strip patchwork';
}

function starQuilt(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const k = ctx.int(3, 5);
  const L = ctx.between(72, 84);
  const items = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8;
    const b = a + TAU / 8;
    const A = [Math.cos(a) * L, Math.sin(a) * L];
    const B = [Math.cos(b) * L, Math.sin(b) * L];
    for (let u = 0; u < k; u++) {
      for (let v = 0; v < k; v++) {
        const p = (uu, vv) => [CX + (A[0] * uu + B[0] * vv) / k, CY + (A[1] * uu + B[1] * vv) / k];
        items.push(poly([p(u, v), p(u + 1, v), p(u + 1, v + 1), p(u, v + 1)], pal[(u + v + (i % 2)) % 5], 0, 0.5));
      }
    }
  }
  const R = L * 1.5;
  [[X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]].forEach(([x, y], q) => items.push(poly([[x, y], [x + (x < CX ? 1 : -1) * 76, y], [x, y + (y < CY ? 1 : -1) * 76]], pal[(q + 2) % 5])));
  chunk(ctx, items, 16);
  return 'star quilt';
}

function logCabin(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const logs = ctx.int(3, 4);
  const cols = 2;
  const rows = 3;
  const bs = Math.min(W / cols, H / rows);
  const t = bs / (2 * logs + 1);
  const barn = ctx.rand() < 0.5;
  const items = [];
  for (let bj = 0; bj < rows; bj++) {
    for (let bi = 0; bi < cols; bi++) {
      const bx = CX - (cols * bs) / 2 + bi * bs;
      const by = CY - (rows * bs) / 2 + bj * bs;
      const spin = barn ? ((bi + bj) % 2) * 2 : (bi + bj) % 4;
      const rot = (poly_) => (spin ? K.rotPts(poly_, bx + bs / 2, by + bs / 2, (spin * Math.PI) / 2) : poly_);
      let x0 = bx + bs / 2 - t / 2;
      let y0 = by + bs / 2 - t / 2;
      let x1 = x0 + t;
      let y1 = y0 + t;
      items.push(poly(rot(rp(x0, y0, t, t)), pal[3]));
      for (let r = 0; r < logs; r++) {
        for (let side = 0; side < 4; side++) {
          let rect;
          if (side === 0) { rect = rp(x0, y0 - t, x1 - x0, t); y0 -= t; }
          else if (side === 1) { rect = rp(x1, y0, t, y1 - y0); x1 += t; }
          else if (side === 2) { rect = rp(x0, y1, x1 - x0, t); y1 += t; }
          else { rect = rp(x0 - t, y0, t, y1 - y0); x0 -= t; }
          items.push(poly(rot(scalePts(rect, ...centroid(rect), 0.97)), side < 2 ? pal[mod(r, 2)] : pal[2 - 0 + (r % 2) * 0]));
        }
      }
    }
  }
  flush(ctx, items, 3);
  return 'log cabin quilt';
}

function drunkardsPath(ctx) {
  const { pal } = setup(ctx, 3);
  const s = ctx.between(34, 46);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const spin = mod(i * 3 + j * 7 + (i * j) % 3, 4);
    const base = mod(i + j, 2);
    items.push(poly(rp(x, y, s, s), pal[base]));
    const corner = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]][spin];
    const a0 = [0, 0.5, 1, 1.5][spin] * Math.PI;
    const arc = Array.from({ length: 10 }, (_, k) => pol(corner[0], corner[1], s * 0.5, a0 + (k / 9) * (Math.PI / 2)));
    items.push(layer(poly([corner, ...arc], pal[2 - base === 1 ? 1 : 2]), 1));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'quarter-circle quilt';
}

function flyingGeese(ctx) {
  const { pal } = setup(ctx, 4);
  const h = ctx.between(22, 28);
  const w = h * 2;
  const items = [];
  const rows = Math.ceil(H / h) + 1;
  const vertical = ctx.rand() < 0.5;
  for (let j = 0; j < rows; j++) {
    for (let i = -1; i < Math.ceil(W / w) + 2; i++) {
      const x = X0 + i * w + (j % 2 ? w / 2 : 0);
      const y = Y0 + j * h;
      const tri = (pts) => pts;
      items.push(poly(rp(x, y, w, h), pal[0]));
      items.push(layer(poly(tri([[x, y + h], [x + w / 2, y], [x + w, y + h]]), pal[1 + mod(j, 3)]), 1));
      items.push(layer(poly(tri([[x, y], [x + w / 4, y], [x, y + h * 0.5]]), pal[3]), 1), layer(poly(tri([[x + w, y], [x + w * 0.75, y], [x + w, y + h * 0.5]]), pal[3]), 1));
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  void vertical;
  return 'flying geese';
}

function crazyQuilt(ctx) {
  const { pal, ink, paper } = setup(ctx, 5);
  let cells = [rp(X0, Y0, W, H)];
  for (let k = 0; k < ctx.int(22, 32); k++) {
    const i = ctx.int(0, cells.length - 1);
    const m = centroid(cells[i]);
    const parts = splitPoly(cells[i], [m[0] + ctx.between(-6, 6), m[1] + ctx.between(-6, 6)], ctx.between(0, Math.PI));
    if (parts.length === 2) cells.splice(i, 1, ...parts);
  }
  const items = cells.map((c, i) => poly(c, pal[i % 5]));
  const stitch = [];
  cells.forEach((c) => c.forEach((p, i) => {
    const q = c[(i + 1) % c.length];
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    for (let t = 6; t < L - 4; t += 7) {
      const u = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
      const m = [p[0] + u[0] * t, p[1] + u[1] * t];
      stitch.push(line([[m[0] - u[1] * 2.6, m[1] + u[0] * 2.6], [m[0] + u[1] * 2.6, m[1] - u[0] * 2.6]], paper, 0.9));
    }
  }));
  flush(ctx, items, 3);
  flush(ctx, stitch, 1);
  return 'crazy quilt';
}

function houndstooth(ctx) {
  const { pal } = setup(ctx, 3);
  const s = ctx.between(9, 13);
  const tile = ['1100', '1110', '0011', '0111'];
  const items = [];
  const cols = Math.ceil(W / s);
  const rows = Math.ceil(H / s);
  items.push(poly(rp(X0, Y0, W, H), pal[0]));
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (tile[mod(j, 4)][mod(i, 4)] === '1') items.push(poly(rp(X0 + i * s, Y0 + j * s, s, s), pal[1]));
      else if (mod(i + j, 2) === 0 && tile[mod(j, 4)][mod(i + 1, 4)] === '1') items.push(poly([[X0 + i * s, Y0 + j * s], [X0 + (i + 1) * s, Y0 + j * s], [X0 + i * s, Y0 + (j + 1) * s]], pal[1]));
    }
  }
  flush(ctx, items, 3);
  return 'houndstooth';
}

function argyle(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const w = ctx.between(34, 44);
  const h = w * ctx.between(1.4, 1.9);
  const items = [];
  const lines = [];
  eachCell(w, h / 2, (i, j, x, y) => {
    if (mod(i + j, 2)) return;
    const cx = x + w / 2;
    const cy = y + h / 4;
    items.push(poly([[cx, cy - h / 2], [cx + w / 2, cy], [cx, cy + h / 2], [cx - w / 2, cy]], pal[mod(i / 2 + j, 3) % 3 === 0 ? 0 : mod(i + j / 2, 2) ? 1 : 2]));
  });
  eachCell(w, h / 2, (i, j, x, y) => {
    const cx = x + w / 2 + w / 2;
    const cy = y + h / 4 + h / 2;
    if (!mod(i + j, 2)) return;
    items.push(poly([[x, y], [x + w, y], [x + w, y + h / 2], [x, y + h / 2]].map((p) => p), pal[3]));
  });
  for (let k = -20; k < 40; k++) {
    lines.push(line([[X0 + k * w / 2, Y0], [X0 + k * w / 2 + H * (w / h), Y1]], paper, 1), line([[X0 + k * w / 2 + H * (w / h), Y0], [X0 + k * w / 2, Y1]], paper, 1));
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  flush(ctx, lines, 1);
  return 'argyle';
}

function paisleyBoteh(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(52, 64);
  const items = [];
  const drop = (cx, cy, r, rot, col, z) => {
    for (let k = 0; k < 14; k++) {
      const t = k / 13;
      const a = rot + t * 1.2;
      const p = [cx + Math.cos(a) * r * 0.1 * 0 + Math.cos(rot + Math.PI * 0.5) * t * r * 1.6 * 0 + (Math.cos(rot) * t * r * 1.5) + Math.cos(rot + Math.PI / 2) * Math.sin(t * 2.4) * r * 0.9 * 0.3, cy + (Math.sin(rot) * t * r * 1.5) + Math.sin(rot + Math.PI / 2) * Math.sin(t * 2.4) * r * 0.9 * 0.3];
      items.push(layer(circ(p[0], p[1], Math.max(1.2, r * (1 - t * 0.92)), col), z));
    }
  };
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s * 0.4 + (mod(j, 2) ? s / 2 : 0);
    const cy = y + s * 0.4;
    const rot = -0.9 + (mod(j, 2) ? 0.5 : 0);
    drop(cx, cy, s * 0.26, rot, pal[mod(i + j, 2)], 0);
    drop(cx, cy, s * 0.17, rot, pal[2], 1);
    drop(cx, cy, s * 0.08, rot, pal[3], 2);
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'paisley';
}

function fairIsle(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(8, 10);
  const cols = Math.floor(W / s);
  const items = [];
  const motifs = [['0010100', '0101010', '1010101', '0101010', '0010100'], ['111', '010', '111'], ['0001000', '0011100', '0111110', '1111111', '0111110', '0011100', '0001000'], ['1', '0', '1']];
  let y = Y0 + 4;
  let b = 0;
  while (y + 3 * s < Y1) {
    const m = motifs[ctx.int(0, 3)];
    const h = m.length;
    const bandH = h + 2;
    const bgc = b % 2;
    for (let r = 0; r < bandH; r++) for (let c = 0; c < cols; c++) items.push(poly(rp(X0 + c * s, y + r * s, s - 0.5, s - 0.5), pal[bgc]));
    const w = m[0].length + 1;
    for (let c0 = 0; c0 < cols; c0 += w) pixels(items, m.map((row) => row.slice(0, Math.max(0, Math.min(row.length, cols - c0)))), X0 + c0 * s, y + s, s - 0.5 + 0.5, pal[2 + (b % 2)], 1);
    y += bandH * s + s;
    b++;
  }
  flush(ctx, items, 3);
  return 'knitted bands';
}

function knittedStar(ctx) {
  const { pal } = setup(ctx, 3);
  const n = 15;
  const s = ctx.between(5.5, 6.5);
  const star = [];
  for (let j = 0; j < n; j++) {
    let row = '';
    for (let i = 0; i < n; i++) {
      const x = i - 7;
      const y = j - 7;
      const r = Math.hypot(x, y);
      const a = Math.atan2(y, x);
      const lim = 3.2 + 4 * Math.abs(Math.cos(a * 4));
      row += r <= lim - 0.6 * (r > 5.5 ? 1 : 0) && (Math.abs(x) + Math.abs(y) < 11) ? '1' : '0';
    }
    star.push(row);
  }
  const items = [poly(rp(X0, Y0, W, H), pal[0])];
  const cols = 2;
  const rows = 3;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) pixels(items, star, X0 + (W / cols) * (i + 0.5) - (n * s) / 2 + (j % 2 ? 6 : 0), Y0 + (H / rows) * (j + 0.5) - (n * s) / 2, s, pal[1 + ((i + j) % 2)], 1);
  for (let y = Y0 + 4; y < Y1; y += s * 3) for (let x = X0 + 4 + (Math.floor((y - Y0) / (s * 3)) % 2) * s * 3; x < X1; x += s * 6) items.push(layer(poly(rp(x, y, s * 0.9, s * 0.9), pal[2]), 2));
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'knitted star';
}

function cableKnit(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = ctx.int(3, 4);
  const cw = W / cols;
  const items = [];
  const strands = [];
  const amp = cw * 0.2;
  const turns = ctx.int(3, 5);
  for (let c = 0; c < cols; c++) {
    const cx = X0 + cw * (c + 0.5);
    for (let k = 0; k < 2; k++) strands.push(Array.from({ length: 50 }, (_, i) => [cx + Math.sin((i / 49) * TAU * turns + k * Math.PI) * amp, Y0 + 6 + (i / 49) * (H - 12)]));
    for (let y = Y0 + 8; y < Y1; y += 12) items.push(circ(cx + cw * 0.5, y + (c % 2) * 6, 1.6, pal[3]));
  }
  const woven = weave(strands, cw * 0.22, (i) => pal[Math.floor(i / 2) % 2 ? 1 : 0], ink);
  flush(ctx, items.filter((it) => inFrame(it.b)), 1);
  chunk(ctx, woven, 18);
  return 'cable knit';
}

function eggBands(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const top = Y0 + 12;
  const bot = Y1 - 12;
  const hw = (t) => 78 * Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2))) * (1 - 0.22 * (1 - t) ** 2 * (t < 0.5 ? 1 : 0)) * (0.85 + 0.15 * t);
  const pt = (t, side) => [CX + side * hw(t), top + t * (bot - top)];
  const n = ctx.int(5, 7);
  const items = [];
  const edge = Array.from({ length: 40 }, (_, i) => pt(i / 39, -1)).concat(Array.from({ length: 40 }, (_, i) => pt(1 - i / 39, 1)));
  items.push(poly(edge, pal[0]));
  const cuts = Array.from({ length: n + 1 }, (_, i) => 0.04 + (0.92 * i) / n);
  for (let b = 0; b < n; b++) {
    const t0 = cuts[b];
    const t1 = cuts[b + 1];
    const steps = 10;
    const left = Array.from({ length: steps + 1 }, (_, i) => pt(t0 + ((t1 - t0) * i) / steps, -1));
    const right = Array.from({ length: steps + 1 }, (_, i) => pt(t1 - ((t1 - t0) * i) / steps, 1));
    items.push(layer(poly([...left, ...right], pal[1 + (b % 2)]), 1));
    const mid = (t0 + t1) / 2;
    const w = hw(mid) * 2;
    const k = Math.max(3, Math.round(w / 14));
    const x0 = CX - hw(mid);
    for (let i = 0; i < k; i++) {
      const a = [x0 + (i / k) * w, top + t1 * (bot - top) - 2];
      const bb = [x0 + ((i + 1) / k) * w, a[1]];
      items.push(layer(poly([a, bb, [(a[0] + bb[0]) / 2, top + t0 * (bot - top) + 3]], pal[3 + (b % 2)]), 2));
    }
  }
  chunk(ctx, items, 14);
  return 'painted egg';
}

function crossStitchRhombs(ctx) {
  const { pal } = setup(ctx, 3);
  const s = ctx.between(9, 11);
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  const period = ctx.int(7, 9);
  const items = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = mod(i, period) - (period - 1) / 2;
      const v = mod(j, period) - (period - 1) / 2;
      const d = Math.abs(u) + Math.abs(v);
      const col = d < 2 ? pal[2] : d < (period - 1) / 2 + 0.5 ? pal[d % 2 ? 0 : 1] : null;
      if (!col) continue;
      const x = X0 + i * s;
      const y = Y0 + j * s;
      items.push(line([[x + 1.5, y + 1.5], [x + s - 1.5, y + s - 1.5]], col, s * 0.2), line([[x + s - 1.5, y + 1.5], [x + 1.5, y + s - 1.5]], col, s * 0.2));
    }
  }
  flush(ctx, items, 3);
  return 'cross-stitch rhombs';
}

function azulejoTiles(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(60, 76);
  const items = [];
  const kind = ctx.int(0, 1);
  eachCell(s, s, (i, j, x, y) => {
    const spin = (mod(i, 2) * 1 + mod(j, 2) * 3) % 4;
    const rot = (pts) => rotPts(pts, x + s / 2, y + s / 2, (spin * Math.PI) / 2);
    items.push(poly(rp(x + 1, y + 1, s - 2, s - 2), pal[0]));
    const q = Array.from({ length: 10 }, (_, k) => pol(x + 1, y + 1, s * 0.5, (k / 9) * (Math.PI / 2)));
    items.push(layer(poly(rot([[x + 1, y + 1], ...q]), pal[1]), 1));
    if (kind) items.push(layer(poly(rot([[x + s * 0.5, y + s * 0.5], [x + s * 0.8, y + s * 0.5], [x + s * 0.5, y + s * 0.8]]), pal[2]), 1));
    else items.push(layer(ell(...rot([[x + s * 0.7, y + s * 0.7]])[0], s * 0.16, s * 0.07, spin * Math.PI / 2 + Math.PI / 4, pal[2]), 1));
    items.push(layer(circ(...rot([[x + s * 0.2, y + s * 0.2]])[0], s * 0.07, pal[3]), 2));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'azulejo tiles';
}

function cementTiles(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(50, 64);
  const items = [];
  const kind = ctx.int(0, 2);
  eachCell(s, s, (i, j, x, y) => {
    const spin = mod(i * 2 + j * 3 + (i * j), 4);
    const cx = x + s / 2;
    const cy = y + s / 2;
    items.push(poly(rp(x + 1, y + 1, s - 2, s - 2), pal[0]));
    for (let q = 0; q < 4; q++) {
      const a = (spin + q) * (Math.PI / 2);
      const rot = (p) => rotPts(p, cx, cy, a);
      if (kind === 0) items.push(layer(poly(rot([[x + 1, y + 1], [x + s * 0.5, y + 1], [x + 1, y + s * 0.5]]), pal[1 + (q % 2)]), 1));
      else if (kind === 1) { const arc = Array.from({ length: 8 }, (_, k) => pol(x + 1, y + 1, s * 0.46, (k / 7) * (Math.PI / 2))); items.push(layer(poly(rot([[x + 1, y + 1], ...arc]), pal[1 + (q % 2)]), 1)); }
      else items.push(layer(poly(rot([[x + s * 0.5, y + 1], [x + s * 0.7, y + s * 0.3], [x + s * 0.5, y + s * 0.4], [x + s * 0.3, y + s * 0.3]]), pal[1 + (q % 2)]), 1));
    }
    items.push(layer(circ(cx, cy, s * 0.08, pal[3]), 2));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'cement tiles';
}

module.exports = {
  stampedGrid, adireIndigo, waxPrint, berberLattice, tifaifaiQuilt, huipilBands, steppedCross, tocapuSquares, serratedDiamonds,
  potteryBands, seminolePatchwork, starQuilt, logCabin, drunkardsPath, flyingGeese, crazyQuilt, houndstooth, argyle, paisleyBoteh,
  fairIsle, knittedStar, cableKnit, eggBands, crossStitchRhombs, azulejoTiles, cementTiles
};
