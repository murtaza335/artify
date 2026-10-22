'use strict';

// Curves and fractals, re-imagined: an Apollonian gasket, Ford circles, Koch snowflakes, Vicsek and Sierpinski carpets,
// a Pythagoras tree, H-trees, space-filling curves, Fourier epicycles, Chladni figures, times-table cardioids, curve
// stitching, Maurer roses, a butterfly curve, Cassini ovals, a hyperbolic disc, conformal grids, Julia and Newton
// fractals, a torus knot, Platonic solids, a stair ring and Pascal's triangle modulo p.

const K = require('./pattern-kit');

const { TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, lsystem, turtle, fit, contour, runs, gridOf } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rectPoly = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function apollonianGasket(ctx) {
  const { pal } = setup(ctx, 5);
  const R = ctx.between(98, 106);
  const rot = ctx.between(0, TAU);
  const r = R * (2 * Math.sqrt(3) - 3);
  const depthMax = ctx.int(4, 5);
  const rmin = ctx.between(2.2, 3.4);
  const items = [];
  const mk = (k, x, y) => ({ k, x, y });
  const O = mk(-1 / R, CX, CY);
  const inner = [0, 1, 2].map((i) => {
    const [x, y] = pol(CX, CY, R - r, rot + (i * TAU) / 3);
    return mk(1 / r, x, y);
  });
  const draw = (c, depth) => items.push(circ(c.x, c.y, Math.abs(1 / c.k) * 0.96, pal[depth % pal.length]));
  const rec = (c1, c2, c3, c4, depth) => {
    const k = 2 * (c1.k + c2.k + c3.k) - c4.k;
    const x = (2 * (c1.k * c1.x + c2.k * c2.x + c3.k * c3.x) - c4.k * c4.x) / k;
    const y = (2 * (c1.k * c1.y + c2.k * c2.y + c3.k * c3.y) - c4.k * c4.y) / k;
    const c = mk(k, x, y);
    if (1 / Math.abs(k) < rmin || depth > depthMax) return;
    draw(c, depth);
    rec(c1, c2, c, c3, depth + 1);
    rec(c2, c3, c, c1, depth + 1);
    rec(c1, c3, c, c2, depth + 1);
  };
  items.push(ring(CX, CY, R, pal[4], 3));
  inner.forEach((c) => draw(c, 0));
  rec(inner[0], inner[1], inner[2], O, 1);
  rec(O, inner[0], inner[1], inner[2], 1);
  rec(O, inner[1], inner[2], inner[0], 1);
  rec(O, inner[0], inner[2], inner[1], 1);
  flush(ctx, items, 3);
  return 'apollonian gasket';
}

function fordCircles(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(6, 9);
  const mirrored = ctx.rand() < 0.5;
  const span = ctx.pick([1, 1, 2]);
  const y0 = mirrored ? CY : Y1 - 8;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const items = [];
  const sc = W / span;
  for (let q = 1; q <= n; q++) {
    for (let p = 0; p <= q * span; p++) {
      if (gcd(p, q) !== 1) continue;
      const r = (sc / (2 * q * q)) * 1;
      const x = X0 + (p / q) * sc;
      items.push(circ(x, y0 - r, r * 0.97, pal[mod(q, 4)]));
      if (mirrored) items.push(circ(x, y0 + r, r * 0.97, pal[mod(q + 1, 4)]));
    }
  }
  flush(ctx, items, 3);
  return 'ford circles';
}

function kochSnowflake(ctx) {
  const { pal } = setup(ctx, 4);
  const depth = ctx.int(2, 3);
  const inward = ctx.rand() < 0.3;
  const layers = ctx.int(2, 4);
  // The sign that points a bump away from the centre, found from the first edge of the triangle.
  const tri0 = ngon(CX, CY, 1, 3, -Math.PI / 2);
  const m0 = [(tri0[0][0] + tri0[1][0]) / 2, (tri0[0][1] + tri0[1][1]) / 2];
  const e0 = [(tri0[1][0] - tri0[0][0]) / 3, (tri0[1][1] - tri0[0][1]) / 3];
  const probe = [m0[0] - e0[1] * 0.866, m0[1] + e0[0] * 0.866];
  const outward = Math.hypot(probe[0] - CX, probe[1] - CY) > Math.hypot(m0[0] - CX, m0[1] - CY) ? 1 : -1;
  const koch = (pts) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const dx = (b[0] - a[0]) / 3;
      const dy = (b[1] - a[1]) / 3;
      const p1 = [a[0] + dx, a[1] + dy];
      const p3 = [a[0] + 2 * dx, a[1] + 2 * dy];
      const s = (inward ? -1 : 1) * outward;
      const p2 = [p1[0] + dx * 0.5 - s * dy * 0.866, p1[1] + dy * 0.5 + s * dx * 0.866];
      out.push(a, p1, p2, p3);
    }
    return out;
  };
  let base = ngon(CX, CY, 1, 3, -Math.PI / 2);
  for (let i = 0; i < depth; i++) base = koch(base);
  const items = [];
  for (let l = 0; l < layers; l++) {
    const k = 108 * (1 - l / (layers + 0.4));
    const pts = rotPts(base.map(([x, y]) => [CX + (x - CX) * k, CY + (y - CY) * k]), CX, CY, (l * Math.PI) / 3);
    items.push(poly(pts, pal[l % 4]));
  }
  chunk(ctx, items, layers);
  return 'koch snowflake';
}

function vicsekFractal(ctx) {
  const { pal } = setup(ctx, 4);
  const depth = 3;
  const x = ctx.rand() < 0.5;
  const size = ctx.between(196, 206);
  const items = [];
  const rec = (cx, cy, s, d, code) => {
    if (d === 0) {
      items.push(poly(rectPoly(cx - s / 2 + 0.4, cy - s / 2 + 0.4, s - 0.8, s - 0.8), pal[code % 4]));
      return;
    }
    const t = s / 3;
    const spots = x ? [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]] : [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
    spots.forEach(([dx, dy], i) => rec(cx + dx * t, cy + dy * t, t, d - 1, d === 1 ? i : code + (i ? 1 : 0)));
  };
  rec(CX, CY, size, depth, 0);
  flush(ctx, items, 3);
  return 'cross fractal';
}

function sierpinskiCarpet(ctx) {
  const { pal } = setup(ctx, 4);
  const depth = ctx.int(3, 4);
  const size = ctx.between(196, 206);
  const items = [poly(rectPoly(CX - size / 2, CY - size / 2, size, size), pal[0])];
  const rec = (x, y, s, d) => {
    if (d === 0) return;
    const t = s / 3;
    items.push(poly(rectPoly(x + t, y + t, t, t), pal[1 + ((depth - d) % 3)]));
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (i !== 1 || j !== 1) rec(x + i * t, y + j * t, t, d - 1);
  };
  rec(CX - size / 2, CY - size / 2, size, depth);
  chunk(ctx, items, 10);
  return 'square carpet';
}

function pythagorasTree(ctx) {
  const { pal } = setup(ctx, 5);
  const depth = ctx.int(7, 9);
  const ang = ctx.between(0.45, 0.95);
  const s0 = ctx.between(46, 60);
  const items = [];
  const rec = (a, b, d) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const c = [b[0] + dy, b[1] - dx];
    const dd = [a[0] + dy, a[1] - dx];
    items.push(poly([a, b, c, dd], pal[d % 5]));
    if (d >= depth) return;
    const s = Math.cos(ang);
    const apex = [dd[0] + s * (dx * Math.cos(ang) + dy * Math.sin(ang)), dd[1] + s * (dy * Math.cos(ang) - dx * Math.sin(ang))];
    rec(dd, apex, d + 1);
    rec(apex, c, d + 1);
  };
  rec([CX - s0 / 2, Y1 - 8], [CX + s0 / 2, Y1 - 8], 0);
  flush(ctx, items, 3);
  return 'pythagoras tree';
}

function hTree(ctx) {
  const { pal } = setup(ctx, 5);
  const depth = ctx.int(6, 8);
  const ratio = ctx.between(0.68, 0.74);
  const items = [];
  const rec = (cx, cy, len, d, horiz) => {
    const w = Math.max(0.8, len * 0.09);
    const a = horiz ? [cx - len / 2, cy] : [cx, cy - len / 2];
    const b = horiz ? [cx + len / 2, cy] : [cx, cy + len / 2];
    items.push(line([a, b], pal[d % 4], w));
    if (d >= depth) return;
    [a, b].forEach((e) => rec(e[0], e[1], len * ratio, d + 1, !horiz));
  };
  rec(CX, CY, ctx.between(120, 140), 0, true);
  flush(ctx, items, 3);
  return 'h-tree';
}

// A turtle drawing split into runs of colour, fitted to the frame.
function runLines(ctx, lines, pal, w, parts = 5) {
  const fitted = fit(lines, [X0 + 8, Y0 + 8, W - 16, H - 16]);
  const items = [];
  fitted.forEach((l) => {
    const n = Math.ceil(l.length / parts);
    for (let i = 0; i < l.length - 1; i += n) items.push(line(l.slice(i, Math.min(l.length, i + n + 1)), pal[(i / n) % pal.length], w));
  });
  flush(ctx, items, 1);
}

function levyCurve(ctx) {
  const { pal } = setup(ctx, 4);
  const depth = ctx.int(9, 11);
  runLines(ctx, turtle(lsystem('F', { F: '+F--F+' }, depth), 45, 1, ctx.int(0, 7) * 45), pal, ctx.between(1.2, 2), 6);
  return 'lévy curve';
}

function gosperCurve(ctx) {
  const { pal } = setup(ctx, 4);
  const depth = ctx.int(3, 4);
  const s = lsystem('A', { A: 'A-B--B+A++AA+B-', B: '+A-BB--B-A++A+B' }, depth).replace(/A|B/g, 'F');
  runLines(ctx, turtle(s, 60, 1, ctx.int(0, 5) * 60), pal, ctx.between(1.2, 2.2), 6);
  return 'flowsnake';
}

function peanoCurve(ctx) {
  const { pal } = setup(ctx, 4);
  const depth = ctx.int(2, 3);
  const s = lsystem('X', { X: 'XFYFX+F+YFXFY-F-XFYFX', Y: 'YFXFY-F-XFYFX+F+YFXFY' }, depth);
  runLines(ctx, turtle(s, 90, 1, ctx.int(0, 3) * 90), pal, ctx.between(1.6, 2.6), 4);
  return 'peano curve';
}

function terdragon(ctx) {
  const { pal } = setup(ctx, 4);
  const depth = ctx.int(6, 7);
  const copies = ctx.pick([3, 3, 6]);
  const base = turtle(lsystem('F', { F: 'F+F-F' }, depth), 120, 1, 0);
  const b = K.bbox(base.flat());
  const k = 100 / Math.max(b[2] - b[0], b[3] - b[1]);
  const items = [];
  for (let c = 0; c < copies; c++) {
    const rot = (c * TAU) / copies;
    base.forEach((l) => {
      const pts = rotPts(l.map(([x, y]) => [CX + (x - b[0]) * k, CY + (y - b[1]) * k]), CX, CY, rot);
      const n = Math.ceil(pts.length / 4);
      for (let i = 0; i < pts.length - 1; i += n) items.push(line(pts.slice(i, i + n + 1), pal[(c + i / n) % 4], 1.6));
    });
  }
  flush(ctx, items, 1);
  return 'terdragon';
}

function fourierEpicycles(ctx) {
  const { pal } = setup(ctx, 4);
  const terms = ctx.int(3, 5);
  const coeff = [];
  for (let k = -terms; k <= terms; k++) {
    const amp = k === 0 ? 0 : ctx.between(0.4, 1) / (1 + Math.abs(k) * 0.9);
    const ph = ctx.between(0, TAU);
    coeff.push({ k, amp, ph });
  }
  const eval_ = (t, upTo = coeff.length) => {
    const chain = [[0, 0]];
    let x = 0;
    let y = 0;
    for (let i = 0; i < upTo; i++) {
      const c = coeff[i];
      x += c.amp * Math.cos(c.k * t + c.ph);
      y += c.amp * Math.sin(c.k * t + c.ph);
      chain.push([x, y]);
    }
    return chain;
  };
  const pts = Array.from({ length: 240 }, (_, i) => eval_((i / 240) * TAU).pop());
  const b = bbox(pts);
  const k = 90 / Math.max((b[2] - b[0]) / 2, (b[3] - b[1]) / 2);
  const mid = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  const map = ([x, y]) => [CX + (x - mid[0]) * k, CY + (y - mid[1]) * k];
  const items = [line(pts.map(map), pal[0], 3.2, true)];
  const t0 = ctx.between(0, TAU);
  const chain = eval_(t0).map(map);
  const used = coeff.slice();
  chain.forEach((p, i) => {
    if (i > 0) {
      const r = used[i - 1].amp * k;
      items.push(ring(chain[i - 1][0], chain[i - 1][1], r, pal[1], 0.9));
      items.push(line([chain[i - 1], p], pal[2], 1.6));
    }
  });
  items.push(circ(chain[chain.length - 1][0], chain[chain.length - 1][1], 4, pal[3]));
  chunk(ctx, items, 8);
  return 'epicycles';
}

function chladniPlate(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(2, 5);
  const m = n + ctx.int(1, 3);
  const sign = ctx.rand() < 0.5 ? 1 : -1;
  const w = 64;
  const h = 90;
  const field = gridOf(w, h, (i, j) => {
    const x = (i + 0.5) / w;
    const y = (j + 0.5) / h;
    return Math.sin(n * Math.PI * x) * Math.sin(m * Math.PI * y) + sign * Math.sin(m * Math.PI * x) * Math.sin(n * Math.PI * y);
  });
  const cw = W / w;
  const ch = H / h;
  const items = [
    path(runs(field, w, h, (v) => v > 0.35, X0, Y0, cw, ch), pal[1], [X0, Y0, X1, Y1]),
    path(runs(field, w, h, (v) => Math.abs(v) < 0.09, X0, Y0, cw, ch), pal[0], [X0, Y0, X1, Y1]),
    K.stroked(contour(field, w, h, 0.35, X0, Y0, cw, ch), pal[2], 1, [X0, Y0, X1, Y1]),
    K.stroked(contour(field, w, h, -0.35, X0, Y0, cw, ch), pal[3], 1, [X0, Y0, X1, Y1])
  ];
  chunk(ctx, items, 4);
  return 'chladni figure';
}

function timesTable(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(90, 180);
  const mult = ctx.int(2, 7) + ctx.pick([0, 0.5, 0]);
  const R = ctx.between(98, 106);
  const items = [];
  for (let k = 0; k < n; k++) {
    const a = pol(CX, CY, R, (k / n) * TAU - Math.PI / 2);
    const b = pol(CX, CY, R, ((k * mult) / n) * TAU - Math.PI / 2);
    items.push(line([a, b], pal[Math.floor((k / n) * 3)], 0.9));
  }
  items.push(ring(CX, CY, R, pal[3], 2));
  flush(ctx, items, 1);
  return 'times-table circle';
}

function curveStitching(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(16, 28);
  const corners = [[X0, Y0, 1, 1], [X1, Y0, -1, 1], [X1, Y1, -1, -1], [X0, Y1, 1, -1]];
  const reach = ctx.between(0.62, 0.9);
  const items = [];
  corners.forEach(([cx, cy, sx, sy], c) => {
    for (let i = 0; i <= n; i++) {
      const a = [cx + sx * (i / n) * W * reach, cy];
      const b = [cx, cy + sy * (1 - i / n) * H * reach * 0.8];
      items.push(line([a, b], pal[c % 4], 0.9));
    }
  });
  flush(ctx, items, 1);
  return 'curve stitching';
}

function maurerRose(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(2, 8);
  const d = ctx.int(19, 97);
  const R = ctx.between(98, 106);
  const rose = [];
  for (let t = 0; t <= 360; t++) {
    const k = ((t * d) * Math.PI) / 180;
    rose.push(pol(CX, CY, R * Math.sin(n * k), k));
  }
  const outline = Array.from({ length: 361 }, (_, t) => pol(CX, CY, R * Math.sin(n * (t * Math.PI) / 180), (t * Math.PI) / 180));
  const items = [line(rose, pal[0], 1.1), line(outline, pal[1], 3.2, true)];
  flush(ctx, items, 1);
  return 'maurer rose';
}

function butterflyCurve(ctx) {
  const { pal } = setup(ctx, 4);
  const pts = [];
  for (let i = 0; i <= 1600; i++) {
    const t = (i / 1600) * 12 * Math.PI;
    const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin((2 * t - Math.PI) / 24), 5);
    pts.push([r * Math.sin(t), -r * Math.cos(t)]);
  }
  const k = ctx.between(26, 31);
  const items = [];
  [1, 0.72, 0.46].forEach((s, l) => {
    const mapped = pts.map(([x, y]) => [CX + x * k * s, CY + 14 + y * k * s]);
    items.push(line(mapped, pal[l], 3.2 - l * 0.8));
  });
  flush(ctx, items, 1);
  return 'butterfly curve';
}

function cassiniOvals(ctx) {
  const { pal } = setup(ctx, 4);
  const a = 1;
  const count = ctx.int(6, 9);
  const rot = ctx.pick([0, Math.PI / 2, Math.PI / 4]);
  const norm = (b) => Math.sqrt(a * a + b * b);
  const bMax = ctx.between(1.7, 2.6);
  const scale = 104 / norm(bMax);
  const items = [];
  for (let i = count; i >= 1; i--) {
    const b = 1.04 + ((bMax - 1.04) * i) / count;
    const pts = [];
    for (let s = 0; s < 120; s++) {
      const t = (s / 120) * TAU;
      const r = Math.sqrt(Math.max(0, a * a * Math.cos(2 * t) + Math.sqrt(Math.max(0, Math.pow(b, 4) - Math.pow(a, 4) * Math.pow(Math.sin(2 * t), 2)))));
      pts.push(pol(CX, CY, r * scale, t + rot));
    }
    items.push(poly(pts, pal[i % 4]));
  }
  chunk(ctx, items, count);
  return 'cassini ovals';
}

function hyperbolicDisc(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const [p, q] = ctx.pick([[7, 3], [8, 3], [5, 4], [6, 4], [4, 5], [5, 5]]);
  const d = Math.sqrt(Math.cos(Math.PI / p + Math.PI / q) / Math.cos(Math.PI / p - Math.PI / q));
  const R = ctx.between(100, 106);
  const rot = ctx.between(0, TAU);
  const first = ngon(0, 0, d, p, rot);
  const key = (poly_) => {
    const c = centroid(poly_);
    return Math.round(c[0] * 2000) + ',' + Math.round(c[1] * 2000);
  };
  const seen = new Set([key(first)]);
  let frontier = [{ v: first, depth: 0 }];
  const all = [frontier[0]];
  const maxDepth = ctx.int(3, 4);
  for (let depth = 1; depth <= maxDepth && all.length < 420; depth++) {
    const next = [];
    for (const { v } of frontier) {
      for (let i = 0; i < p; i++) {
        const a = v[i];
        const b = v[(i + 1) % p];
        const det = a[0] * b[1] - a[1] * b[0];
        if (Math.abs(det) < 1e-9) continue;
        const ra = (a[0] * a[0] + a[1] * a[1] + 1) / 2;
        const rb = (b[0] * b[0] + b[1] * b[1] + 1) / 2;
        const c = [(ra * b[1] - rb * a[1]) / det, (a[0] * rb - b[0] * ra) / det];
        const r2 = c[0] * c[0] + c[1] * c[1] - 1;
        const refl = v.map((pt) => {
          const dx = pt[0] - c[0];
          const dy = pt[1] - c[1];
          const dd = dx * dx + dy * dy || 1e-9;
          return [c[0] + (r2 * dx) / dd, c[1] + (r2 * dy) / dd];
        });
        const k = key(refl);
        if (seen.has(k) || refl.some((pt) => !Number.isFinite(pt[0]))) continue;
        seen.add(k);
        const node = { v: refl, depth };
        next.push(node);
        all.push(node);
      }
    }
    frontier = next;
  }
  const items = [circ(CX, CY, R, pal[3])];
  all.forEach(({ v, depth }) => {
    if (Math.max(...v.map((pt) => Math.hypot(pt[0], pt[1]))) > 0.995) return;
    const pts = [];
    for (let i = 0; i < p; i++) {
      const a = v[i];
      const b = v[(i + 1) % p];
      const det = a[0] * b[1] - a[1] * b[0];
      if (Math.abs(det) < 1e-9) {
        pts.push(a);
        continue;
      }
      const ra = (a[0] * a[0] + a[1] * a[1] + 1) / 2;
      const rb = (b[0] * b[0] + b[1] * b[1] + 1) / 2;
      const c = [(ra * b[1] - rb * a[1]) / det, (a[0] * rb - b[0] * ra) / det];
      const rc = Math.sqrt(Math.max(0, c[0] * c[0] + c[1] * c[1] - 1));
      let a0 = Math.atan2(a[1] - c[1], a[0] - c[0]);
      let a1 = Math.atan2(b[1] - c[1], b[0] - c[0]);
      let da = a1 - a0;
      while (da > Math.PI) da -= TAU;
      while (da < -Math.PI) da += TAU;
      for (let s = 0; s < 5; s++) pts.push([c[0] + rc * Math.cos(a0 + (da * s) / 5), c[1] + rc * Math.sin(a0 + (da * s) / 5)]);
    }
    items.push(poly(pts.map(([x, y]) => [CX + x * R, CY + y * R]), pal[mod(depth + (depth > 1 ? 1 : 0), 3)], 0, 0.5));
  });
  chunk(ctx, items, 14);
  return 'hyperbolic disc';
}

function conformalGrid(ctx) {
  const { pal } = setup(ctx, 4);
  const kind = ctx.pick(['square', 'exp', 'inverse', 'joukowski']);
  const n = ctx.int(12, 18);
  const map = {
    square: ([x, y]) => [x * x - y * y, 2 * x * y],
    exp: ([x, y]) => [Math.exp(x) * Math.cos(y), Math.exp(x) * Math.sin(y)],
    inverse: ([x, y]) => [x / (x * x + y * y + 0.02), -y / (x * x + y * y + 0.02)],
    joukowski: ([x, y]) => [x + x / (x * x + y * y + 0.01), y - y / (x * x + y * y + 0.01)]
  }[kind];
  const lo = kind === 'exp' ? -2 : -1.6;
  const hi = kind === 'exp' ? 1 : 1.6;
  const lines = [];
  const tag = [];
  for (let i = 0; i <= n; i++) {
    const u = lo + ((hi - lo) * i) / n;
    lines.push(Array.from({ length: 40 }, (_, s) => map([u, kind === 'exp' ? -Math.PI + (s / 39) * TAU : lo + ((hi - lo) * s) / 39])));
    tag.push(0);
    lines.push(Array.from({ length: 40 }, (_, s) => map([kind === 'exp' ? lo + ((hi - lo) * s) / 39 : lo + ((hi - lo) * s) / 39, kind === 'exp' ? -Math.PI + (i / n) * TAU : u])));
    tag.push(1);
  }
  const clean = lines.map((l) => l.filter((p) => Math.hypot(p[0], p[1]) < 60));
  const ok = clean.map((l, i) => [l, tag[i]]).filter(([l]) => l.length > 1);
  const fitted = fit(ok.map(([l]) => l), [X0 + 8, Y0 + 8, W - 16, H - 16]);
  const items = fitted.map((l, i) => line(l, pal[ok[i][1] === 0 ? 0 : 1], 1.6));
  flush(ctx, items, 1);
  return 'conformal grid';
}

function juliaBands(ctx) {
  const { pal } = setup(ctx, 5);
  const c = ctx.pick([[-0.8, 0.156], [-0.4, 0.6], [0.285, 0.01], [-0.70176, -0.3842], [-0.835, -0.2321], [0.355, 0.355], [-0.123, 0.745], [0.37, 0.1]]);
  const zoom = ctx.between(1.1, 1.7);
  const w = 66;
  const h = 94;
  const maxIter = 26;
  const field = gridOf(w, h, (i, j) => {
    let x = ((i / w - 0.5) * 2 * zoom) * 1.0;
    let y = ((j / h - 0.5) * 2 * zoom * (H / W));
    [x, y] = [x, y / 1.0];
    let n = 0;
    while (n < maxIter && x * x + y * y < 16) {
      [x, y] = [x * x - y * y + c[0], 2 * x * y + c[1]];
      n++;
    }
    return n;
  });
  const cw = W / w;
  const ch = H / h;
  const items = [];
  const cuts = [3, 6, 11, 19, maxIter];
  cuts.forEach((hi, b) => {
    const lo = b ? cuts[b - 1] : 0;
    items.push(path(runs(field, w, h, (v) => v >= lo && (b === cuts.length - 1 ? v >= lo : v < hi), X0, Y0, cw, ch), pal[b], [X0, Y0, X1, Y1]));
  });
  chunk(ctx, items, 5);
  return 'julia bands';
}

function newtonBasins(ctx) {
  const { pal } = setup(ctx, 6);
  const nRoots = ctx.pick([3, 4]);
  const roots = Array.from({ length: nRoots }, (_, i) => [Math.cos((i * TAU) / nRoots), Math.sin((i * TAU) / nRoots)]);
  const zoom = ctx.between(1.2, 1.8);
  const w = 66;
  const h = 94;
  const field = gridOf(w, h, (i, j) => {
    let x = (i / w - 0.5) * 2 * zoom;
    let y = (j / h - 0.5) * 2 * zoom * (H / W);
    let it = 0;
    for (; it < 14; it++) {
      // z - (z^n - 1) / (n z^(n-1))
      let px = 1;
      let py = 0;
      for (let k = 0; k < nRoots - 1; k++) [px, py] = [px * x - py * y, px * y + py * x];
      const fx = px * x - py * y - 1;
      const fy = px * y + py * x;
      const dx = nRoots * px;
      const dy = nRoots * py;
      const den = dx * dx + dy * dy || 1e-9;
      const qx = (fx * dx + fy * dy) / den;
      const qy = (fy * dx - fx * dy) / den;
      x -= qx;
      y -= qy;
      if (qx * qx + qy * qy < 1e-6) break;
    }
    let best = 0;
    roots.forEach((r, i) => {
      if (Math.hypot(x - r[0], y - r[1]) < Math.hypot(x - roots[best][0], y - roots[best][1])) best = i;
    });
    return best * 100 + Math.min(it, 99);
  });
  const cw = W / w;
  const ch = H / h;
  const items = [];
  for (let r = 0; r < nRoots; r++) {
    items.push(path(runs(field, w, h, (v) => Math.floor(v / 100) === r && v % 100 >= 5, X0, Y0, cw, ch), pal[r], [X0, Y0, X1, Y1]));
    items.push(path(runs(field, w, h, (v) => Math.floor(v / 100) === r && v % 100 < 5, X0, Y0, cw, ch), pal[nRoots + (r % 2)], [X0, Y0, X1, Y1]));
  }
  chunk(ctx, items, items.length);
  return 'newton basins';
}

function torusKnot(ctx) {
  const { pal, bg } = setup(ctx, 4);
  const [p, q] = ctx.pick([[2, 3], [3, 2], [2, 5], [3, 4], [3, 5], [4, 3], [5, 2]]);
  const tiltA = ctx.between(0.6, 1.1);
  const spin = ctx.between(0, TAU);
  const N = 260;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * TAU;
    const r = 2 + Math.cos(q * t);
    let x = r * Math.cos(p * t);
    let y = r * Math.sin(p * t);
    let z = Math.sin(q * t);
    const xr = x * Math.cos(spin) - y * Math.sin(spin);
    const yr = x * Math.sin(spin) + y * Math.cos(spin);
    x = xr;
    y = yr * Math.cos(tiltA) - z * Math.sin(tiltA);
    z = yr * Math.sin(tiltA) + z * Math.cos(tiltA);
    pts.push({ x: CX + x * 34, y: CY + y * 34, z });
  }
  const segs = [];
  for (let i = 0; i < N; i++) segs.push({ a: pts[i], b: pts[i + 1], z: (pts[i].z + pts[i + 1].z) / 2, i });
  segs.sort((u, v) => u.z - v.z);
  const stripes = ctx.int(2, 4);
  const items = [];
  segs.forEach((s) => {
    items.push(line([[s.a.x, s.a.y], [s.b.x, s.b.y]], ctx.ink, 14));
    items.push(line([[s.a.x, s.a.y], [s.b.x, s.b.y]], pal[Math.floor((s.i / N) * stripes * 2) % pal.length], 9.5));
  });
  chunk(ctx, items, 16);
  return 'torus knot';
}

function platonicSolids(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const phi = (1 + Math.sqrt(5)) / 2;
  const kind = ctx.pick(['tetra', 'cube', 'octa', 'icosa', 'dodeca']);
  let V;
  let F;
  const trisByEdge = (verts) => {
    let min = Infinity;
    for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) min = Math.min(min, Math.hypot(...verts[i].map((v, k) => v - verts[j][k])));
    const near = (a, b) => Math.abs(Math.hypot(...verts[a].map((v, k) => v - verts[b][k])) - min) < 1e-6;
    const faces = [];
    for (let a = 0; a < verts.length; a++) for (let b = a + 1; b < verts.length; b++) for (let c = b + 1; c < verts.length; c++) if (near(a, b) && near(b, c) && near(a, c)) faces.push([a, b, c]);
    return faces;
  };
  const icosa = [];
  [-1, 1].forEach((a) => [-1, 1].forEach((b) => {
    icosa.push([0, a, b * phi], [a, b * phi, 0], [b * phi, 0, a]);
  }));
  if (kind === 'tetra') {
    V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    F = trisByEdge(V);
  } else if (kind === 'cube') {
    V = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) V.push([x, y, z]);
    F = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
  } else if (kind === 'octa') {
    V = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    F = trisByEdge(V);
  } else if (kind === 'icosa') {
    V = icosa;
    F = trisByEdge(V);
  } else {
    const tri = trisByEdge(icosa);
    V = tri.map((f) => [0, 1, 2].map((k) => (icosa[f[0]][k] + icosa[f[1]][k] + icosa[f[2]][k]) / 3));
    F = icosa.map((v, vi) => {
      const around = tri.map((f, fi) => [f, fi]).filter(([f]) => f.includes(vi)).map(([, fi]) => fi);
      const n = v.map((x) => x);
      const ax = Math.abs(n[0]) < 0.9 * Math.hypot(...n) ? [1, 0, 0] : [0, 1, 0];
      const u = [n[1] * ax[2] - n[2] * ax[1], n[2] * ax[0] - n[0] * ax[2], n[0] * ax[1] - n[1] * ax[0]];
      const w2 = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
      return around.sort((i, j) => Math.atan2(V[i][0] * w2[0] + V[i][1] * w2[1] + V[i][2] * w2[2], V[i][0] * u[0] + V[i][1] * u[1] + V[i][2] * u[2]) - Math.atan2(V[j][0] * w2[0] + V[j][1] * w2[1] + V[j][2] * w2[2], V[j][0] * u[0] + V[j][1] * u[1] + V[j][2] * u[2]));
    });
  }
  const norm = Math.max(...V.map((v) => Math.hypot(...v)));
  const a1 = ctx.between(0, TAU);
  const a2 = ctx.between(0.3, 1.2);
  const a3 = ctx.between(0, TAU);
  const rotate = ([x, y, z]) => {
    let [x1, y1] = [x * Math.cos(a1) - y * Math.sin(a1), x * Math.sin(a1) + y * Math.cos(a1)];
    let [y2, z2] = [y1 * Math.cos(a2) - z * Math.sin(a2), y1 * Math.sin(a2) + z * Math.cos(a2)];
    const [x3, z3] = [x1 * Math.cos(a3) + z2 * Math.sin(a3), -x1 * Math.sin(a3) + z2 * Math.cos(a3)];
    return [x3, y2, z3];
  };
  const P = V.map((v) => rotate(v.map((c) => c / norm)));
  const R = ctx.between(88, 100);
  const faces = F.map((f) => {
    const vs = f.map((i) => P[i]);
    const c = [0, 1, 2].map((k) => vs.reduce((s, v) => s + v[k], 0) / vs.length);
    const e1 = vs[1].map((x, k) => x - vs[0][k]);
    const e2 = vs[2].map((x, k) => x - vs[0][k]);
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (n[0] * c[0] + n[1] * c[1] + n[2] * c[2] < 0) n = n.map((x) => -x);
    const l = Math.hypot(...n);
    n = n.map((x) => x / l);
    return { vs, c, n };
  });
  const light = [-0.4, -0.6, 0.7];
  const items = [];
  faces.filter((f) => f.n[2] > -0.02 || true).sort((u, v) => u.c[2] - v.c[2]).forEach((f) => {
    const shade = Math.max(0, f.n[0] * light[0] + f.n[1] * light[1] + f.n[2] * light[2]);
    items.push(poly(f.vs.map((v) => [CX + v[0] * R, CY + v[1] * R]), pal[Math.min(4, Math.floor(shade * 5))], 0, 1.4));
  });
  chunk(ctx, items, Math.min(20, items.length));
  return 'platonic solid';
}

function stairRing(ctx) {
  const { pal } = setup(ctx, 4);
  const N = ctx.int(4, 6);
  const u = ctx.between(15, 19);
  const rise = u * ctx.between(0.45, 0.7);
  const iso = (x, y, z) => [CX + (x - y) * u * 0.866, CY + (x + y) * u * 0.5 - z - (N + 1) * u * 0.5 - rise * N * 0.4];
  const side = N + 1;
  const steps = [];
  let z = 0;
  const dirs = [[1, 0, 1], [0, 1, 1], [-1, 0, -1], [0, -1, -1]];
  let x = 0;
  let y = 0;
  dirs.forEach(([dx, dy, dz]) => {
    for (let i = 0; i < N + 0; i++) {
      steps.push({ x, y, z });
      x += dx;
      y += dy;
      z += dz * rise;
    }
  });
  steps.sort((a, b) => a.x + a.y - (b.x + b.y));
  const items = [];
  steps.forEach((s) => {
    const top = [iso(s.x, s.y, s.z), iso(s.x + 1, s.y, s.z), iso(s.x + 1, s.y + 1, s.z), iso(s.x, s.y + 1, s.z)];
    const lef = [iso(s.x, s.y + 1, s.z), iso(s.x + 1, s.y + 1, s.z), iso(s.x + 1, s.y + 1, s.z - rise * 1.6), iso(s.x, s.y + 1, s.z - rise * 1.6)];
    const rig = [iso(s.x + 1, s.y, s.z), iso(s.x + 1, s.y + 1, s.z), iso(s.x + 1, s.y + 1, s.z - rise * 1.6), iso(s.x + 1, s.y, s.z - rise * 1.6)];
    items.push(poly(lef, pal[1], 0, 0.6), poly(rig, pal[2], 0, 0.6), poly(top, pal[0], 0, 0.6));
  });
  void side;
  chunk(ctx, items, 16);
  return 'stair ring';
}

function pascalMod(ctx) {
  const { pal } = setup(ctx, 5);
  const p = ctx.pick([2, 2, 3, 3, 4, 5, 7]);
  const rows = ctx.int(24, 34);
  const r = Math.min(W / (Math.sqrt(3) * rows), 4.8);
  const tri = [];
  for (let n = 0; n < rows; n++) {
    tri.push([]);
    for (let k = 0; k <= n; k++) tri[n].push(k === 0 || k === n ? 1 : (tri[n - 1][k - 1] + tri[n - 1][k]) % p);
  }
  const flip = ctx.rand() < 0.5;
  const items = [];
  const top = CY - ((rows - 1) * 1.5 * r) / 2;
  for (let n = 0; n < rows; n++) {
    for (let k = 0; k <= n; k++) {
      const v = tri[n][k];
      if (v === 0) continue;
      const x = CX + (k - n / 2) * Math.sqrt(3) * r;
      const y = flip ? CY + ((rows - 1) * 1.5 * r) / 2 - n * 1.5 * r : top + n * 1.5 * r;
      items.push(poly(ngon(x, y, r * 0.98, 6, Math.PI / 6), pal[(v - 1) % 5]));
    }
  }
  flush(ctx, items, 3);
  return "pascal's triangle";
}

module.exports = {
  apollonianGasket, fordCircles, kochSnowflake, vicsekFractal, sierpinskiCarpet, pythagorasTree, hTree, levyCurve, gosperCurve,
  peanoCurve, terdragon, fourierEpicycles, chladniPlate, timesTable, curveStitching, maurerRose, butterflyCurve, cassiniOvals,
  hyperbolicDisc, conformalGrid, juliaBands, newtonBasins, torusKnot, platonicSolids, stairRing, pascalMod
};
