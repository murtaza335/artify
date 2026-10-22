'use strict';

// Tilings and tessellations, re-imagined: a Cairo tiling, the semi-regular tilings, pinwheel, chair and sphinx
// substitutions, an eight-fold quasi-tiling, Robinson triangles, tumbling blocks, brick paving, interlocking tiles,
// edge-matching Wang tiles, multi-scale Truchet arcs, a spiral tiling, domino and lozenge tilings.

const { tiling, multigrid } = require('./tiling-base');
const K = require('./pattern-kit');
const { starPoints } = require('./engine');

const { TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, line, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, inFrame } = K;

const mod = (a, n) => ((a % n) + n) % n;
const hash = (a, b) => mod(a * 7 + b * 13 + ((a * b) % 5), 997);

// Draws a tiling from tiling-base at edge length e. colorOf(face, centre, index) gives a fill or null.
function drawTiling(ctx, kind, e, colorOf, gap = 0.95) {
  const faces = tiling(kind);
  const sx = ctx.between(0, 3);
  const sy = ctx.between(0, 4);
  const items = [];
  faces.forEach((f, i) => {
    const pts = f.pts.map(([x, y]) => [X0 + (x - sx) * e, Y0 + (y - sy) * e]);
    if (!inFrame(bbox(pts))) return;
    const c = centroid(pts);
    const fill = colorOf(f, c, i, pts);
    if (fill) items.push(poly(gap < 1 ? scalePts(pts, c[0], c[1], gap) : pts, fill, 0, gap < 1 ? 0 : 0.6));
  });
  return items;
}

const edgeAngle = (f) => Math.atan2(f.pts[1][1] - f.pts[0][1], f.pts[1][0] - f.pts[0][0]);
const edgeCls = (f, period, step) => Math.round(mod(edgeAngle(f), period) / step);
const pointsUp = (f) => {
  const ys = f.pts.map((p) => p[1]);
  const mean = (ys[0] + ys[1] + ys[2]) / 3;
  return Math.min(...ys) < mean - 1e-6;
};

function cairoTiling(ctx) {
  const { bg, pal } = setup(ctx, 5);
  const e = ctx.between(22, 30);
  const m = ctx.int(2, 4);
  const items = drawTiling(ctx, 'cairo', e, (f, c) => pal[mod(Math.floor(c[0] / (e * 1.45)) + m * Math.floor(c[1] / (e * 1.45)), pal.length)], 0.93);
  flush(ctx, items, 3);
  return 'cairo tiling';
}

function snubSquare(ctx) {
  const { pal } = setup(ctx, 5);
  const e = ctx.between(22, 32);
  const three = ctx.rand() < 0.5;
  flush(ctx, drawTiling(ctx, 'snubSquare', e, (f, c) => (f.n === 4 ? pal[edgeCls(f, Math.PI / 2, Math.PI / 6) % 2] : pal[2 + (three ? edgeCls(f, Math.PI / 3, Math.PI / 12) % 3 : pointsUpish(f))]), 0.94), 3);
  return 'snub square tiling';
}
const pointsUpish = (f) => (f.pts[0][1] + f.pts[1][1] > f.pts[2][1] * 2 ? 0 : 1);

function trihexagonal(ctx) {
  const { pal } = setup(ctx, 5);
  const e = ctx.between(22, 32);
  const k = ctx.int(2, 4);
  flush(ctx, drawTiling(ctx, 'trihexagonal', e, (f, c) => (f.n === 6 ? pal[mod(Math.floor((c[0] + c[1]) / (e * 2.2)), k)] : pal[k + (pointsUp(f) ? 0 : 1) % (pal.length - k || 1)]), 0.92), 3);
  return 'kagome tiling';
}

function rhombitrihex(ctx) {
  const { pal } = setup(ctx, 5);
  const e = ctx.between(20, 26);
  const swap = ctx.int(0, 2);
  flush(ctx, drawTiling(ctx, 'rhombitrihex', e, (f) => (f.n === 6 ? pal[swap] : f.n === 4 ? pal[(swap + 1 + edgeCls(f, Math.PI / 2, Math.PI / 6)) % 5] : pal[(swap + 4) % 5]), 0.94), 3);
  return 'rhombitrihexagonal tiling';
}

function octagonSquares(ctx) {
  const { pal } = setup(ctx, 4);
  const e = ctx.between(26, 36);
  const s = e * (1 + Math.SQRT2);
  const key = ctx.int(0, 3);
  flush(ctx, drawTiling(ctx, 'octagonSquares', e, (f, c) => (f.n === 8 ? pal[mod(Math.floor(c[0] / s) + Math.floor(c[1] / s), 2) + (key % 2)] : pal[(key + 2) % 4]), ctx.pick([0.95, 0.9])), 3);
  return 'octagons and squares';
}

function snubHexagonal(ctx) {
  const { pal } = setup(ctx, 5);
  const e = ctx.between(18, 26);
  const kind = ctx.rand() < 0.5 ? 'snubHexagonal' : 'snubHexagonal:flip';
  flush(ctx, drawTiling(ctx, kind, e, (f) => (f.n === 6 ? pal[0] : pal[1 + (edgeCls(f, Math.PI / 3, Math.PI / 12) % 4)]), 0.94), 3);
  return 'snub hexagonal tiling';
}

function elongatedTriangular(ctx) {
  const { pal } = setup(ctx, 4);
  const e = ctx.between(22, 30);
  const h = 1 + Math.sqrt(3) / 2;
  flush(ctx, drawTiling(ctx, 'elongatedTriangular', e, (f, c) => (f.n === 4 ? pal[mod(Math.floor(c[1] / (e * h)), 2)] : pal[2 + (pointsUp(f) ? 0 : 1)]), 0.93), 3);
  return 'triangle and square bands';
}

function dodecagonTiling(ctx) {
  const { pal, ink, bg } = setup(ctx, 4);
  const e = ctx.between(14, 19);
  const R = 1 / (2 * Math.sin(Math.PI / 12));
  const star = ctx.rand() < 0.5;
  const k = ctx.int(2, 3);
  const items = drawTiling(ctx, 'dodecagons', e, (f, c) => (f.n === 12 ? pal[mod(Math.floor(c[0] / (e * 3.7)) + Math.floor(c[1] / (e * 3.2)), k)] : pal[3]), 0.94);
  const stars = [];
  tiling('dodecagons').forEach(() => {});
  flush(ctx, items, 3);
  if (star) {
    const motif = [];
    const inner = pal[mod(k, 4)];
    items.forEach((it) => {
      if (it.svg.split(',').length > 20) {
        const cx = (it.b[0] + it.b[2]) / 2;
        const cy = (it.b[1] + it.b[3]) / 2;
        motif.push(poly(starPoints(cx, cy, e * R * 0.78, e * R * 0.45, 12), bg));
        motif.push(poly(ngon(cx, cy, e * R * 0.3, 12, 0), inner));
      }
    });
    flush(ctx, motif, 2);
  }
  return 'dodecagons and triangles';
}

// Applies a 2 x 3 affine (a b c d e f) to a point.
const apply = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const compose = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];

function pinwheelTiling(ctx) {
  const { pal } = setup(ctx, 5);
  const depth = ctx.int(3, 4);
  const items = [];
  const T = [[0, 0], [10, 0], [0, 5]];
  const kids = [[[1, 2], [0, 0], [5, 0]], [[2, 4], [0, 5], [0, 0]], [[1, 2], [2, 4], [5, 0]], [[6, 2], [5, 0], [2, 4]], [[6, 2], [5, 0], [10, 0]]];
  // A triangle is its three corners; children come from the fixed decomposition mapped onto it.
  const split = (t) => kids.map((kid) => kid.map(([x, y]) => [t[0][0] + (x / 10) * (t[1][0] - t[0][0]) + (y / 5) * (t[2][0] - t[0][0]), t[0][1] + (x / 10) * (t[1][1] - t[0][1]) + (y / 5) * (t[2][1] - t[0][1])]));
  // Turns a child's corners into (right angle, long end, short end).
  const normal = (p) => {
    for (let i = 0; i < 3; i++) {
      const a = p[i];
      const b = p[(i + 1) % 3];
      const c = p[(i + 2) % 3];
      if (Math.abs((b[0] - a[0]) * (c[0] - a[0]) + (b[1] - a[1]) * (c[1] - a[1])) < 1e-6 * (1 + Math.abs(b[0] - a[0])))
        return Math.hypot(b[0] - a[0], b[1] - a[1]) > Math.hypot(c[0] - a[0], c[1] - a[1]) ? [a, b, c] : [a, c, b];
    }
    return p;
  };
  const flip = ctx.rand() < 0.5 ? -1 : 1;
  const L = ctx.between(250, 300);
  const map = ([x, y]) => [CX + flip * (y - 0.5) * L * 0.75, CY + (x - 1) * L * 0.75];
  const rec = (t, d, code) => {
    const pts = t.map(map);
    if (!inFrame(bbox(pts), 4)) return;
    if (d === 0) {
      const c = centroid(pts);
      items.push(poly(scalePts(pts, c[0], c[1], 0.96), pal[code % pal.length]));
      return;
    }
    split(t).forEach((kid, i) => rec(normal(kid), d - 1, d === 1 ? i : code * 3 + i + d));
  };
  rec(T.map((p) => [p[0] / 5, p[1] / 5]), depth, 0);
  const T2 = T.map((p) => [2 - p[0] / 5, 1 - p[1] / 5]);
  rec(T2, depth, 2);
  flush(ctx, items, 3);
  return 'pinwheel tiling';
}

function ammannBeenker(ctx) {
  const { pal } = setup(ctx, 5);
  const e = ctx.between(20, 28);
  const gamma = [ctx.between(0.05, 0.95), ctx.between(0.05, 0.95), ctx.between(0.05, 0.95), ctx.between(0.05, 0.95)];
  const tiles = multigrid(4, gamma, 6.2).map((t) => ({ ...t, pts: t.pts.map(([x, y]) => [CX + x * e, CY + y * e]) }));
  const items = [];
  tiles.forEach((t) => {
    if (!inFrame(bbox(t.pts), 2)) return;
    const c = centroid(t.pts);
    items.push(poly(scalePts(t.pts, c[0], c[1], 0.93), t.s - t.r === 2 ? pal[0] : pal[1 + ((t.r + t.s) % 3)]));
  });
  flush(ctx, items, 3);
  return 'eight-fold tiling';
}

function robinsonTriangles(ctx) {
  const { pal } = setup(ctx, 5);
  const phi = (1 + Math.sqrt(5)) / 2;
  let tris = [];
  const R = ctx.between(150, 175);
  for (let i = 0; i < 10; i++) {
    let B = pol(0, 0, 1, ((2 * i - 1) * Math.PI) / 10);
    let C = pol(0, 0, 1, ((2 * i + 1) * Math.PI) / 10);
    if (i % 2 === 0) [B, C] = [C, B];
    tris.push([0, [0, 0], B, C]);
  }
  const mix = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
  const depth = ctx.int(3, 4);
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (const [c, A, B, C] of tris) {
      if (c === 0) {
        const P = mix(A, B, 1 / phi);
        next.push([0, C, P, B], [1, P, C, A]);
      } else {
        const Q = mix(B, A, 1 / phi);
        const Rr = mix(B, C, 1 / phi);
        next.push([1, Rr, C, A], [1, Q, Rr, B], [0, Rr, Q, A]);
      }
    }
    tris = next;
  }
  const spin = ctx.between(0, TAU);
  const items = [];
  tris.forEach(([c, A, B, C], i) => {
    const pts = rotPts([A, B, C].map(([x, y]) => [CX + x * R, CY + y * R]), CX, CY, spin);
    if (!inFrame(bbox(pts), 2)) return;
    const m = centroid(pts);
    items.push(poly(scalePts(pts, m[0], m[1], 0.95), c === 0 ? pal[i % 2] : pal[2 + (i % 3)]));
  });
  flush(ctx, items, 3);
  return 'robinson triangles';
}

function tumblingBlocks(ctx) {
  const { pal } = setup(ctx, 4);
  const r = ctx.between(20, 30);
  const w = Math.sqrt(3) * r;
  const mixed = ctx.rand() < 0.6;
  const items = [];
  const rows = Math.ceil(H / (r * 1.5)) + 2;
  for (let j = -2; j < rows; j++) {
    for (let i = -2 - Math.ceil(rows / 2); i < Math.ceil(W / w) + 3; i++) {
      const cx = X0 + w * (i + j / 2);
      const cy = Y0 + 1.5 * r * j;
      const h = (k) => pol(cx, cy, r, ((-90 + 60 * k) * Math.PI) / 180);
      const shift = mixed ? hash(i, j) % 3 : 0;
      const faces = [[[cx, cy], h(5), h(0), h(1)], [[cx, cy], h(1), h(2), h(3)], [[cx, cy], h(3), h(4), h(5)]];
      faces.forEach((f, k) => {
        const m = centroid(f);
        items.push(poly(scalePts(f, m[0], m[1], 0.96), pal[(k + shift) % 3]));
      });
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'tumbling blocks';
}

function basketweave(ctx) {
  const { pal, bg } = setup(ctx, 4);
  const p = ctx.int(2, 4);
  const s = ctx.between(30, 44);
  const slant = ctx.rand() < 0.4 ? Math.PI / 4 : 0;
  const gap = ctx.between(1.2, 2.4);
  const items = [];
  const R = Math.ceil(Math.hypot(W, H) / s / 2) + 1;
  for (let j = -R; j <= R; j++) {
    for (let i = -R; i <= R; i++) {
      const x = CX + i * s - s / 2;
      const y = CY + j * s - s / 2;
      const horiz = mod(i + j, 2) === 0;
      for (let k = 0; k < p; k++) {
        const bw = horiz ? s : s / p;
        const bh = horiz ? s / p : s;
        const bx = horiz ? x : x + (k * s) / p;
        const by = horiz ? y + (k * s) / p : y;
        const pts = [[bx + gap, by + gap], [bx + bw - gap, by + gap], [bx + bw - gap, by + bh - gap], [bx + gap, by + bh - gap]];
        const q = slant ? rotPts(pts, CX, CY, slant) : pts;
        if (inFrame(bbox(q))) items.push(poly(q, pal[(horiz ? 0 : 2) + (k % 2)]));
      }
    }
  }
  flush(ctx, items, 3);
  return 'basketweave paving';
}

function pythagoreanTiling(ctx) {
  const { pal } = setup(ctx, 4);
  const a = ctx.between(40, 56);
  const b = a * ctx.between(0.4, 0.66);
  const tilt = ctx.pick([0, 0, Math.PI / 12, Math.PI / 8]);
  const items = [];
  const R = 7;
  for (let i = -R; i <= R; i++) {
    for (let j = -R; j <= R; j++) {
      const ox = CX + i * a - j * b;
      const oy = CY + i * b + j * a;
      const big = [[ox, oy], [ox + a, oy], [ox + a, oy + a], [ox, oy + a]];
      const small = [[ox + a, oy], [ox + a + b, oy], [ox + a + b, oy + b], [ox + a, oy + b]];
      for (const [pts, fill] of [[big, pal[mod(i + j, 2)]], [small, pal[2 + mod(i, 2)]]]) {
        const q = rotPts(pts, CX, CY, tilt);
        const m = centroid(q);
        if (inFrame(bbox(q))) items.push(poly(scalePts(q, m[0], m[1], 0.95), fill));
      }
    }
  }
  flush(ctx, items, 3);
  return 'two-square tiling';
}

function kiteTiling(ctx) {
  const { pal } = setup(ctx, 5);
  const e = ctx.between(20, 26);
  flush(ctx, drawTiling(ctx, 'kites', e, (f, c) => {
    const hx = f.pts[Math.max(0, f.ns.indexOf(6))];
    return pal[mod(Math.round(hx[0] * 3) + 2 * Math.round(hx[1] * 3), 5)] || pal[0];
  }, 0.92), 3);
  return 'kite tiling';
}

function floretTiling(ctx) {
  const { pal } = setup(ctx, 5);
  const e = ctx.between(16, 22);
  flush(ctx, drawTiling(ctx, ctx.rand() < 0.5 ? 'floret' : 'floret', e, (f) => {
    const hx = f.pts[Math.max(0, f.ns.indexOf(6))];
    return pal[mod(Math.round(hx[0]) + 2 * Math.round(hx[1]), 5)];
  }, 0.93), 3);
  return 'floret tiling';
}

function prismaticPentagons(ctx) {
  const { pal } = setup(ctx, 4);
  const e = ctx.between(24, 32);
  const k = ctx.int(2, 4);
  flush(ctx, drawTiling(ctx, 'prismatic', e, (f, c) => pal[mod(Math.floor(c[1] / (e * 1.9)) + (f.ns.indexOf(4) % 2), k)], 0.93), 3);
  return 'prism pentagons';
}

function interlockingTiles(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(34, 46);
  const amps = Array.from({ length: 4 }, () => ctx.between(-0.2, 0.2));
  const ampsB = Array.from({ length: 3 }, () => ctx.between(-0.2, 0.2));
  const curve = (t, a) => a.reduce((sum, v, k) => sum + v * Math.sin((k + 1) * Math.PI * t), 0) * s;
  const steps = 10;
  const shear = ctx.between(-0.2, 0.2);
  const items = [];
  const n = (m) => Array.from({ length: m + 1 }, (_, i) => i / m);
  for (let j = -1; j < Math.ceil(H / s) + 2; j++) {
    for (let i = -1; i < Math.ceil(W / s) + 2; i++) {
      const ox = X0 + i * s + j * shear * s;
      const oy = Y0 + j * s;
      const pts = [];
      n(steps).forEach((t) => pts.push([ox + t * s, oy + curve(t, amps)]));
      n(steps).forEach((t) => pts.push([ox + s + curve(t, ampsB), oy + t * s]));
      n(steps).reverse().forEach((t) => pts.push([ox + t * s, oy + s + curve(t, amps)]));
      n(steps).reverse().forEach((t) => pts.push([ox + curve(t, ampsB), oy + t * s]));
      const c = centroid(pts);
      if (inFrame(bbox(pts))) items.push(poly(scalePts(pts, c[0], c[1], 0.96), pal[mod(i + 2 * j, 4)]));
    }
  }
  flush(ctx, items, 3);
  return 'interlocking tiles';
}

function curvyHexTiles(ctx) {
  const { pal } = setup(ctx, 3);
  const e = ctx.between(26, 34);
  const a = ctx.between(0.12, 0.3) * e;
  const items = [];
  const rows = Math.ceil(H / (1.5 * e)) + 2;
  for (let j = -2; j < rows; j++) {
    for (let i = -2 - Math.ceil(rows / 2); i < Math.ceil(W / (Math.sqrt(3) * e)) + 3; i++) {
      const cx = X0 + Math.sqrt(3) * e * (i + j / 2);
      const cy = Y0 + 1.5 * e * j;
      const v = ngon(cx, cy, e, 6, Math.PI / 6);
      const pts = [];
      for (let k = 0; k < 6; k++) {
        const A = v[k];
        const B = v[(k + 1) % 6];
        const m = [(A[0] + B[0]) / 2 - cx, (A[1] + B[1]) / 2 - cy];
        const ml = Math.hypot(m[0], m[1]);
        for (let t = 0; t < 8; t++) {
          const u = t / 8;
          const off = a * Math.sin(TAU * u);
          pts.push([A[0] + (B[0] - A[0]) * u + (m[0] / ml) * off, A[1] + (B[1] - A[1]) * u + (m[1] / ml) * off]);
        }
      }
      const c = centroid(pts);
      if (inFrame(bbox(pts))) items.push(poly(scalePts(pts, c[0], c[1], 0.96), pal[mod(i - j, 3)]));
    }
  }
  flush(ctx, items, 3);
  return 'interlocking hexes';
}

function wangTiles(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(30, 40);
  const cols = Math.ceil(W / s) + 1;
  const rows = Math.ceil(H / s) + 1;
  const horizontal = Array.from({ length: (rows + 1) * cols }, () => ctx.int(0, pal.length - 1));
  const vertical = Array.from({ length: rows * (cols + 1) }, () => ctx.int(0, pal.length - 1));
  const items = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = X0 + i * s;
      const y = Y0 + j * s;
      const c = [x + s / 2, y + s / 2];
      const corners = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
      const sides = [horizontal[j * cols + i], vertical[j * (cols + 1) + i + 1], horizontal[(j + 1) * cols + i], vertical[j * (cols + 1) + i]];
      sides.forEach((col, k) => items.push(poly([corners[k], corners[(k + 1) % 4], c], pal[col], 0, 0.5)));
    }
  }
  flush(ctx, items, 3);
  return 'wang tiles';
}

function multiscaleTruchet(ctx) {
  const { pal, bg } = setup(ctx, 3);
  const C = 53;
  const p = ctx.between(0.3, 0.6);
  const [ink, a, b] = [pal[0], pal[1], pal[2]];
  const items = [];
  const arcs = (x, y, s, w, col) => {
    const flip = ctx.rand() < 0.5;
    const r = s / 2;
    const d = flip
      ? `M${fmt(x + r)} ${fmt(y)}A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x)} ${fmt(y + r)}M${fmt(x + s)} ${fmt(y + r)}A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x + r)} ${fmt(y + s)}`
      : `M${fmt(x + r)} ${fmt(y)}A${fmt(r)} ${fmt(r)} 0 0 0 ${fmt(x + s)} ${fmt(y + r)}M${fmt(x)} ${fmt(y + r)}A${fmt(r)} ${fmt(r)} 0 0 0 ${fmt(x + r)} ${fmt(y + s)}`;
    items.push(K.stroked(d, col, w, [x, y, x + s, y + s]));
  };
  const rec = (x, y, s, depth) => {
    if (depth < 2 && ctx.rand() < p) {
      for (let k = 0; k < 4; k++) rec(x + (k % 2) * (s / 2), y + Math.floor(k / 2) * (s / 2), s / 2, depth + 1);
      return;
    }
    arcs(x, y, s, s * 0.26, [a, b, ink][depth]);
  };
  for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) rec(X0 + 0 + i * C, Y0 + 16 + j * C, C, 0);
  flush(ctx, items, 3);
  return 'multi-scale truchet';
}

function spiralTiling(ctx) {
  const { pal } = setup(ctx, 4);
  const m = ctx.pick([8, 10, 12, 14]);
  const twist = ctx.between(0.15, 0.5) * (ctx.rand() < 0.5 ? 1 : -1);
  const g = 1 + (TAU / m) * ctx.between(0.8, 1.0);
  const items = [];
  let r = 3;
  for (let i = 0; i < 30 && r < 230; i++) {
    for (let j = 0; j < m; j++) {
      const a0 = ((j + i * twist) * TAU) / m;
      const a1 = ((j + 1 + i * twist) * TAU) / m;
      const a2 = ((j + 1 + (i + 1) * twist) * TAU) / m;
      const a3 = ((j + (i + 1) * twist) * TAU) / m;
      const pts = [pol(CX, CY, r, a0), pol(CX, CY, r, a1), pol(CX, CY, r * g, a2), pol(CX, CY, r * g, a3)];
      if (inFrame(bbox(pts))) {
        const c = centroid(pts);
        items.push(poly(scalePts(pts, c[0], c[1], 0.94), pal[mod(i + 2 * j, 4)]));
      }
    }
    r *= g;
  }
  flush(ctx, items, 3);
  return 'spiral tiling';
}

function chairTiling(ctx) {
  const { pal } = setup(ctx, 5);
  const depth = ctx.int(3, 4);
  const P0 = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]];
  const kids = [[1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 1, 1], [-1, 0, 0, 1, 4, 0], [1, 0, 0, -1, 0, 4]].map((m) => m.map((v, i) => (i < 4 ? v * 0.5 : v * 0.5)));
  const scale = ctx.between(100, 108);
  const rot = ctx.int(0, 3) * (Math.PI / 2);
  const flip = ctx.rand() < 0.5 ? -1 : 1;
  const lin = [flip * Math.cos(rot) * scale, Math.sin(rot) * scale, -flip * Math.sin(rot) * scale, Math.cos(rot) * scale];
  const place = [...lin, CX - (lin[0] + lin[2]), CY - (lin[1] + lin[3])];
  const items = [];
  const rec = (m, d, code) => {
    if (d === 0) {
      const pts = P0.map((p) => apply(compose(place, m), p));
      const c = centroid(pts);
      items.push(poly(scalePts(pts, c[0], c[1], 0.95), pal[code % 5]));
      return;
    }
    kids.forEach((kid, i) => rec(compose(m, kid), d - 1, code * 2 + i + d));
  };
  rec([1, 0, 0, 1, 0, 0], depth, 0);
  flush(ctx, items, 3);
  return 'chair tiling';
}

function sphinxTiling(ctx) {
  const { pal } = setup(ctx, 5);
  const S = [[[0, 0], [1, 0], [0, 1]], [[0, 0], [-1, 1], [0, 1]], [[-1, 0], [0, 0], [-1, 1]], [[-1, 0], [-2, 1], [-1, 1]], [[-2, 0], [-1, 0], [-2, 1]], [[-2, 1], [-1, 1], [-2, 2]]];
  const kids = [
    { A: [[-1, -1], [0, 1]], t: [-3, 0] },
    { A: [[0, 1], [-1, -1]], t: [-4, 2] },
    { A: [[1, 1], [0, -1]], t: [-1, 2] },
    { A: [[-1, -1], [0, 1]], t: [0, 0] }
  ];
  const depth = ctx.int(2, 3);
  const ang = ctx.pick([Math.PI / 2, -Math.PI / 2, Math.PI / 6, Math.PI / 2 + Math.PI / 3]);
  const k = ctx.between(95, 125);
  const toScreen = (a, b) => {
    const x = (a + b / 2) * k;
    const y = ((b * Math.sqrt(3)) / 2) * k;
    return [CX + (x * Math.cos(ang) - y * Math.sin(ang)), CY + (x * Math.sin(ang) + y * Math.cos(ang))];
  };
  const items = [];
  // A tile is the affine map from base lattice coordinates; children are the tile shrunk by half and placed per the rule.
  const rec = (M, d, code) => {
    const at = (p) => [M.A[0][0] * p[0] + M.A[0][1] * p[1] + M.t[0], M.A[1][0] * p[0] + M.A[1][1] * p[1] + M.t[1]];
    const tris = S.map((tri) => tri.map(at).map(([a, b]) => toScreen(a, b)));
    const bb = bbox(tris.flat());
    if (!inFrame(bb, 6)) return;
    if (d === 0) {
      tris.forEach((t) => items.push(poly(t, pal[code % 5], 0, 0.7)));
      return;
    }
    kids.forEach((c, i) => {
      // child = M o (1/2) o (A p + t)
      const A = [
        [0.5 * (M.A[0][0] * c.A[0][0] + M.A[0][1] * c.A[1][0]), 0.5 * (M.A[0][0] * c.A[0][1] + M.A[0][1] * c.A[1][1])],
        [0.5 * (M.A[1][0] * c.A[0][0] + M.A[1][1] * c.A[1][0]), 0.5 * (M.A[1][0] * c.A[0][1] + M.A[1][1] * c.A[1][1])]
      ];
      const t = [M.A[0][0] * 0.5 * c.t[0] + M.A[0][1] * 0.5 * c.t[1] + M.t[0], M.A[1][0] * 0.5 * c.t[0] + M.A[1][1] * 0.5 * c.t[1] + M.t[1]];
      rec({ A, t }, d - 1, code * 2 + i + d);
    });
  };
  // Start from a tile twice the size so the pattern fills the frame.
  const mid = [S.flat().reduce((a, p) => a + p[0], 0) / 18, S.flat().reduce((a, p) => a + p[1], 0) / 18];
  rec({ A: [[4, 0], [0, 4]], t: [-4 * mid[0] + ctx.between(-1, 1), -4 * mid[1] + ctx.between(-1, 1)] }, depth + 2, 0);
  flush(ctx, items, 3);
  return 'sphinx tiling';
}

function aztecDiamond(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(9, 13);
  const size = 2 * n;
  const grid = Array.from({ length: size }, () => Array(size).fill(-1));
  const inside = (x, y) => {
    const cx = x - n + 0.5;
    const cy = y - n + 0.5;
    return Math.abs(cx) + Math.abs(cy) <= n;
  };
  const doms = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x += 1) {
      if (inside(x, y) && grid[y][x] < 0 && inside(x + 1, y) && grid[y][x + 1] < 0) {
        grid[y][x] = grid[y][x + 1] = doms.length;
        doms.push({ x, y, h: true });
      }
    }
  }
  for (let step = 0; step < 6000; step++) {
    const x = ctx.int(0, size - 2);
    const y = ctx.int(0, size - 2);
    if (![[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].every(([a, b]) => inside(a, b))) continue;
    const a = grid[y][x];
    const b = grid[y][x + 1];
    const c = grid[y + 1][x];
    const d = grid[y + 1][x + 1];
    if (a === b && c === d && a !== c && doms[a].h && doms[c].h && doms[a].x === x && doms[c].x === x) {
      doms[a] = { x, y, h: false };
      doms[c] = { x: x + 1, y, h: false };
      grid[y][x] = grid[y + 1][x] = a;
      grid[y][x + 1] = grid[y + 1][x + 1] = c;
    } else if (a === c && b === d && a !== b && !doms[a].h && !doms[b].h && doms[a].y === y && doms[b].y === y) {
      doms[a] = { x, y, h: true };
      doms[b] = { x, y: y + 1, h: true };
      grid[y][x] = grid[y][x + 1] = a;
      grid[y + 1][x] = grid[y + 1][x + 1] = b;
    }
  }
  const s = 200 / size;
  const items = [];
  doms.forEach((dm) => {
    const col = pal[(dm.h ? 0 : 2) + mod(dm.x + dm.y, 2)];
    const x = X0 + 6 + dm.x * s;
    const y = CY - 100 + dm.y * s;
    const w = dm.h ? 2 * s : s;
    const h = dm.h ? s : 2 * s;
    items.push(poly([[x + 0.6, y + 0.6], [x + w - 0.6, y + 0.6], [x + w - 0.6, y + h - 0.6], [x + 0.6, y + h - 0.6]], col));
  });
  flush(ctx, items, 3);
  return 'aztec diamond';
}

function planePartition(ctx) {
  const { pal } = setup(ctx, 3);
  const a = ctx.int(5, 7);
  const c = ctx.int(5, 7);
  const h = Array.from({ length: a }, () => Array(a).fill(0));
  for (let step = 0; step < 2500; step++) {
    const i = ctx.int(0, a - 1);
    const j = ctx.int(0, a - 1);
    const up = ctx.rand() < 0.58;
    const v = h[i][j] + (up ? 1 : -1);
    if (v < 0 || v > c) continue;
    if (up && ((i > 0 && h[i - 1][j] < v) || (j > 0 && h[i][j - 1] < v))) continue;
    if (!up && ((i < a - 1 && h[i + 1][j] > v) || (j < a - 1 && h[i][j + 1] > v))) continue;
    h[i][j] = v;
  }
  const u = Math.min(115 / a, 280 / (a + c));
  const iso = (x, y, z) => [CX + (x - y) * u * 0.866, CY + 20 + (x + y) * u * 0.5 - z * u - a * u * 0.5];
  const items = [];
  const order = [];
  for (let i = a - 1; i >= 0; i--) for (let j = a - 1; j >= 0; j--) order.push([i, j]);
  order.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
  order.forEach(([i, j]) => {
    const z = h[i][j];
    if (z === 0) return;
    const top = [iso(i, j, z), iso(i + 1, j, z), iso(i + 1, j + 1, z), iso(i, j + 1, z)];
    const lef = [iso(i, j + 1, z), iso(i + 1, j + 1, z), iso(i + 1, j + 1, 0), iso(i, j + 1, 0)];
    const rig = [iso(i + 1, j, z), iso(i + 1, j + 1, z), iso(i + 1, j + 1, 0), iso(i + 1, j, 0)];
    items.push(poly(lef, pal[1], 0, 0.5), poly(rig, pal[2], 0, 0.5), poly(top, pal[0], 0, 0.5));
  });
  chunk(ctx, items, 18);
  return 'stacked lozenges';
}

module.exports = {
  cairoTiling, snubSquare, trihexagonal, rhombitrihex, octagonSquares, snubHexagonal, elongatedTriangular, dodecagonTiling,
  pinwheelTiling, ammannBeenker, robinsonTriangles, tumblingBlocks, basketweave, pythagoreanTiling, kiteTiling, floretTiling,
  prismaticPentagons, interlockingTiles, curvyHexTiles, wangTiles, multiscaleTruchet, spiralTiling, chairTiling, sphinxTiling,
  aztecDiamond, planePartition
};
