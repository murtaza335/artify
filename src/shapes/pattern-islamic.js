'use strict';

// Islamic and Persian geometry, as abstract interpretations: girih tiles, polygons-in-contact stars, zellige and
// star-and-cross tiles, muqarnas plans, sunburst medallions, rosettes, interlaced strapwork, lattice screens, brick
// mosaics, arabesque scrolls, pointed arches, garden plans, knots, dome rosettes, lustre stars, carpet medallions,
// border bands, five- and nine-fold stars, self-similar girih, inlaid panels and octagram lattices.

const { tiling, multigrid } = require('./tiling-base');
const K = require('./pattern-kit');
const { starPoints, arcBand } = require('./engine');

const { TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, inFrame, hankin, weave, ell, dihedral } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rad = (d) => (d * Math.PI) / 180;

// Faces of a tiling at edge e in pixels, those inside the frame.
function pxFaces(ctx, kind, e) {
  const sx = ctx.between(0, 3);
  const sy = ctx.between(0, 4);
  const out = [];
  tiling(kind).forEach((f) => {
    const pts = f.pts.map(([x, y]) => [X0 + (x - sx) * e, Y0 + (y - sy) * e]);
    if (inFrame(bbox(pts), 2)) out.push({ pts, n: f.n, c: centroid(pts) });
  });
  return out;
}

const strapLines = (polys, angle, w, color) => hankin(polys, angle).map((seg) => line(seg, color, w));

// A polygon from its interior angles (degrees), edge length 1.
function fromAngles(angles) {
  let x = 0;
  let y = 0;
  let h = 0;
  const pts = [];
  angles.forEach((a) => {
    pts.push([x, y]);
    x += Math.cos(h);
    y += Math.sin(h);
    h += rad(180 - a);
  });
  return pts;
}

const GIRIH = {
  decagon: () => ngon(0, 0, 1 / (2 * Math.sin(rad(18))), 10, 0),
  pentagon: () => ngon(0, 0, 1 / (2 * Math.sin(rad(36))), 5, 0),
  rhombus: () => fromAngles([72, 108, 72, 108]),
  hexagon: () => fromAngles([72, 144, 144, 72, 144, 144]),
  bowtie: () => fromAngles([72, 72, 216, 72, 72, 216])
};

function girihTiles(ctx) {
  const { pal, ink, paper } = setup(ctx, 5);
  const names = Object.keys(GIRIH);
  const e = ctx.between(28, 32);
  const angle = ctx.pick([54, 72]);
  const items = [];
  const lines = [];
  const cols = 2;
  const rows = 3;
  const cw = W / cols;
  const ch = H / rows;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const t = (i + j * 2 + ctx.int(0, 2)) % 5;
      const base = GIRIH[names[t]]().map(([x, y]) => [x * e, y * e]);
      const c0 = centroid(base);
      const spin = ctx.int(0, 9) * rad(36);
      const pts = rotPts(base.map(([x, y]) => [X0 + cw * (i + 0.5) + x - c0[0], Y0 + ch * (j + 0.5) + y - c0[1]]), X0 + cw * (i + 0.5), Y0 + ch * (j + 0.5), spin);
      items.push(poly(scalePts(pts, ...centroid(pts), 0.97), pal[t]));
      strapLines([pts], angle, 1.5, ink).forEach((l) => lines.push(l));
    }
  }
  flush(ctx, items, 3);
  flush(ctx, lines, 1);
  return 'girih tiles';
}

function hankinRosette(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const kind = ctx.pick(['rhombitrihex', 'trihexagonal', 'octagonSquares']);
  const e = ctx.between(22, 30);
  const faces = pxFaces(ctx, kind, e);
  const angle = ctx.pick([55, 62, 68, 75]);
  const items = faces.map((f) => poly(scalePts(f.pts, f.c[0], f.c[1], 0.98), pal[f.n === 3 ? 3 : f.n === 4 ? 1 : f.n === 6 ? 0 : 2]));
  flush(ctx, items, 3);
  flush(ctx, strapLines(faces.map((f) => f.pts), angle, 1.6, ctx.pick([ink, paper])), 2);
  return 'polygons in contact';
}

function zelligeStar(ctx) {
  const { pal, ink, bg } = setup(ctx, 5);
  const n = ctx.pick([8, 12, 16]);
  const rings = ctx.int(4, 5);
  const gap = ctx.between(24, 28);
  const items = [circ(CX, CY, gap * rings + 4, ink)];
  const step = TAU / n;
  for (let k = 0; k < rings; k++) {
    const r0 = k * gap + (k === 0 ? 0 : 2);
    const r1 = (k + 1) * gap;
    const off = k % 2 ? step / 2 : 0;
    for (let i = 0; i < n; i++) {
      const a = off + i * step;
      if (k === 0) {
        items.push(poly([[CX, CY], pol(CX, CY, r1, a), pol(CX, CY, r1 * 0.5, a + step / 2), pol(CX, CY, r1, a + step)], pal[i % 2]));
      } else {
        items.push(poly([pol(CX, CY, r0, a), pol(CX, CY, r0, a + step), pol(CX, CY, r1, a + step / 2)], pal[(i + k) % 5]));
        items.push(poly([pol(CX, CY, r0, a), pol(CX, CY, r1, a + step / 2), pol(CX, CY, r1, a - step / 2)], pal[(i + k + 2) % 5]));
      }
    }
  }
  chunk(ctx, items, 14);
  return 'zellige star';
}

function starAndCross(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const e = ctx.between(26, 34);
  const faces = pxFaces(ctx, 'octagonSquares', e);
  const items = [];
  const lines = [];
  faces.forEach((f) => {
    items.push(poly(f.pts, f.n === 8 ? pal[0] : pal[1]));
    if (f.n === 8) {
      const R = Math.hypot(f.pts[0][0] - f.c[0], f.pts[0][1] - f.c[1]);
      items.push(poly(starPoints(f.c[0], f.c[1], R * 0.95, R * 0.5, 8, Math.PI / 8 + ctx.rand() * 0), pal[2 + (Math.floor(f.c[0] / (e * 2.4)) % 2)]));
      items.push(poly(ngon(f.c[0], f.c[1], R * 0.28, 8, Math.PI / 8), pal[3]));
    } else items.push(poly(starPoints(f.c[0], f.c[1], e * 0.7, e * 0.22, 4, Math.PI / 4), pal[3]));
  });
  lines.push(...strapLines(faces.map((f) => f.pts), 67.5, 1.2, ink));
  flush(ctx, items, 3);
  flush(ctx, lines, 1);
  return 'stars and crosses';
}

function muqarnasPlan(ctx) {
  const { pal } = setup(ctx, 5);
  const n = ctx.pick([8, 12, 16]);
  const rings = ctx.int(4, 6);
  const light = ctx.between(0, TAU);
  const items = [];
  const R = ctx.between(100, 106);
  for (let k = rings - 1; k >= 0; k--) {
    const r0 = (R * k) / rings;
    const r1 = (R * (k + 1)) / rings;
    const off = k % 2 ? Math.PI / n : 0;
    for (let i = 0; i < n; i++) {
      const a = off + (i * TAU) / n;
      const b = a + TAU / n;
      const m = (a + b) / 2;
      const facet = (ang) => Math.max(0, Math.cos(ang - light));
      const sh = (ang) => pal[Math.min(4, Math.floor(facet(ang) * 4.99))];
      items.push(poly([pol(CX, CY, r0, a), pol(CX, CY, r1, m), pol(CX, CY, r0 * 0.4 + r1 * 0.6, a + (m - a) * 0.5)].concat([]), sh(a)));
      items.push(poly([pol(CX, CY, r0, a), pol(CX, CY, r0, b), pol(CX, CY, r1, m)], sh(m)));
      items.push(poly([pol(CX, CY, r0, b), pol(CX, CY, r1, m), pol(CX, CY, r0 * 0.4 + r1 * 0.6, b - (b - m) * 0.5)], sh(b)));
    }
  }
  chunk(ctx, items, 14);
  return 'muqarnas plan';
}

function shamsa(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const n = ctx.int(14, 22);
  const items = [circ(CX, CY, 106, pal[0])];
  for (let i = 0; i < n; i++) items.push(circ(...pol(CX, CY, 100, (i * TAU) / n), 9, pal[1]));
  items.push(circ(CX, CY, 94, ink));
  for (let i = 0; i < n; i++) items.push(ell(...pol(CX, CY, 74, (i * TAU) / n), 22, 8, (i * TAU) / n, pal[2 + (i % 2)]));
  items.push(circ(CX, CY, 58, pal[4]));
  const m = ctx.int(8, 12);
  items.push(poly(starPoints(CX, CY, 52, 30, m, ctx.between(0, 1)), pal[0]));
  items.push(poly(starPoints(CX, CY, 34, 20, m, ctx.between(0, 1)), pal[1]));
  items.push(circ(CX, CY, 12, pal[3]));
  chunk(ctx, items, 12);
  return 'sunburst medallion';
}

// A rosette of stacked stars, each layer turned half a step from the last.
function layeredRosette(ctx, n, rings) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const R = ctx.between(98, 106);
  for (let k = 0; k < rings; k++) {
    const r = R * (1 - k / (rings + 0.6));
    const inner = r * ctx.between(0.55, 0.72);
    items.push(poly(starPoints(CX, CY, r + 4, inner * 0.9, n, k * (Math.PI / n)), ink));
    items.push(poly(starPoints(CX, CY, r, inner, n, k * (Math.PI / n)), pal[k % 5]));
  }
  items.push(poly(ngon(CX, CY, R * 0.14, n, 0), pal[3]));
  chunk(ctx, items, 12);
}

function tenfoldRosette(ctx) {
  layeredRosette(ctx, 10, ctx.int(4, 6));
  return 'ten-fold rosette';
}

function ninefoldStar(ctx) {
  layeredRosette(ctx, 9, ctx.int(4, 6));
  return 'nine-fold star';
}

function twelvefoldRosette(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const e = ctx.between(15, 18);
  const faces = pxFaces(ctx, 'dodecagons', e);
  const items = faces.map((f) => poly(scalePts(f.pts, f.c[0], f.c[1], 0.98), f.n === 12 ? pal[0] : pal[2]));
  flush(ctx, items, 3);
  flush(ctx, strapLines(faces.filter((f) => f.n === 12).map((f) => f.pts), ctx.pick([70, 75]), 1.4, ink), 2);
  return 'twelve-fold rosette';
}

function strapworkKnot(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.int(4, 6);
  const amp = ctx.between(6, 14);
  const items = [];
  const strands = [];
  const sx = W / (n + 0.5);
  const sy = H / (n * 1.2 + 0.5);
  const ph = ctx.between(0, TAU);
  for (let i = 0; i < n; i++) {
    strands.push(Array.from({ length: 30 }, (_, s) => [X0 + 6 + (s / 29) * (W - 12), Y0 + sy * (i + 1) * 1.2 - sy * 0.3 + Math.sin(s / 29 * TAU * 2 + ph + i) * amp]));
    strands.push(Array.from({ length: 36 }, (_, s) => [X0 + sx * (i + 0.75) + Math.sin(s / 35 * TAU * 2.5 + ph + i * 1.3) * amp, Y0 + 6 + (s / 35) * (H - 12)]));
  }
  weave(strands, ctx.between(8, 11), (i) => pal[i % 2 ? 1 : 0], ink).forEach((it) => items.push(it));
  chunk(ctx, items, 18);
  return 'interlaced strapwork';
}

function mashrabiya(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(26, 34);
  const items = [];
  const beads = [];
  for (let j = 0; j * s < H + s; j++) items.push(line([[X0, Y0 + j * s], [X1, Y0 + j * s]], pal[0], 4));
  for (let i = 0; i * s < W + s; i++) items.push(line([[X0 + i * s, Y0], [X0 + i * s, Y1]], pal[0], 4));
  for (let j = 0; j * s < H + s; j++) {
    for (let i = 0; i * s < W + s; i++) {
      const x = X0 + i * s;
      const y = Y0 + j * s;
      beads.push(circ(x, y, s * 0.2, pal[1]));
      beads.push(circ(x, y, s * 0.1, ink));
      beads.push(circ(x + s / 2, y + s / 2, s * 0.14, pal[2 + ((i + j) % 2)]));
      beads.push(circ(x + s / 2, y, s * 0.07, pal[3]));
      beads.push(circ(x, y + s / 2, s * 0.07, pal[3]));
    }
  }
  flush(ctx, items, 2);
  flush(ctx, beads, 3);
  return 'lattice screen';
}

function jaliScreen(ctx) {
  const { pal, ink, bg } = setup(ctx, 4);
  const w = ctx.between(160, 190);
  const x0 = CX - w / 2;
  const top = Y0 + 20;
  const slab = [[x0, Y1 - 8], [x0, top + w * 0.5]];
  for (let i = 0; i <= 24; i++) slab.push(pol(CX, top + w * 0.5, w / 2, Math.PI + (i / 24) * Math.PI));
  slab.push([x0 + w, Y1 - 8]);
  const items = [poly(slab, pal[0])];
  const r = ctx.between(13, 17);
  const holes = [];
  const rows = Math.ceil((Y1 - top) / (r * 1.5)) + 1;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < Math.ceil(w / (r * 1.8)) + 1; i++) {
      const x = x0 + r + i * r * 1.8 + (j % 2 ? r * 0.9 : 0);
      const y = Y1 - 8 - r - j * r * 1.55;
      const inArch = x > x0 + r * 0.8 && x < x0 + w - r * 0.8 && (y > top + w * 0.5 || Math.hypot(x - CX, y - (top + w * 0.5)) < w / 2 - r);
      if (inArch) holes.push(poly(starPoints(x, y, r * 0.95, r * 0.55, 6, Math.PI / 6), bg));
    }
  }
  chunk(ctx, items, 1);
  flush(ctx, holes, 3);
  return 'pierced screen';
}

function brickMosaic(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(10, 14);
  const period = ctx.int(5, 8);
  const items = [];
  const cols = Math.ceil(W / s);
  const rows = Math.ceil(H / s);
  const two = ctx.rand() < 0.5;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = mod(i, period * 2) - period;
      const v = mod(j + (two && Math.floor(i / (period * 2)) % 2 ? period : 0), period * 2) - period;
      const d = Math.abs(u) + Math.abs(v);
      const col = pal[d % 2 ? 1 : d % 4 === 0 ? 0 : d % 3 === 0 ? 3 : 2];
      items.push(poly([[X0 + i * s + 0.4, Y0 + j * s + 0.4], [X0 + (i + 1) * s - 0.4, Y0 + j * s + 0.4], [X0 + (i + 1) * s - 0.4, Y0 + (j + 1) * s - 0.4], [X0 + i * s + 0.4, Y0 + (j + 1) * s - 0.4]], col));
    }
  }
  flush(ctx, items, 3);
  return 'brick mosaic';
}

function islimiScrolls(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const rowsN = ctx.int(2, 3);
  const turns = ctx.between(1.6, 2.6);
  const rh = H / rowsN;
  for (let r = 0; r < rowsN; r++) {
    for (const side of [-1, 1]) {
      const cx = CX + side * 54;
      const cy = Y0 + rh * (r + 0.5);
      const R = rh * 0.42;
      const spiral = Array.from({ length: 60 }, (_, i) => {
        const t = i / 59;
        return pol(cx, cy, R * (1 - t * 0.9), side * (t * turns * TAU + r));
      });
      items.push(line(spiral, pal[r % 3], 5));
      items.push(line([spiral[0], [CX, spiral[0][1] + (r % 2 ? -R * 0.5 : R * 0.5)]], pal[r % 3], 5));
      for (let k = 0; k < 6; k++) {
        const p = spiral[Math.floor(k * 9 + 4)];
        items.push(ell(p[0], p[1], 12, 5, side * (k * 0.9 + r), pal[3 - (k % 2)]));
      }
      items.push(circ(spiral[59][0], spiral[59][1], 6, pal[3]));
    }
  }
  chunk(ctx, items, 14);
  return 'scrolling vines';
}

// A pointed arch as a polygon: base width w, spring height, and the radius of its two arcs as a multiple of w.
function archPts(cx, yb, w, spring, k) {
  const R = w * k;
  const phi = Math.acos((R - w / 2) / R);
  const ys = yb - spring;
  const left = Array.from({ length: 15 }, (_, i) => {
    const a = Math.PI + (phi * i) / 14;
    return [cx - w / 2 + R + R * Math.cos(a), ys + R * Math.sin(a)];
  });
  const right = left.slice().reverse().slice(1).map(([x, y]) => [2 * cx - x, y]);
  return [[cx - w / 2, yb], ...left, ...right, [cx + w / 2, yb]];
}

function pointedArches(ctx) {
  const { pal, ink, bg } = setup(ctx, 5);
  const cols = ctx.int(1, 2);
  const w = (W - 8) / cols;
  const items = [];
  const k = ctx.between(0.62, 0.9);
  for (let c = 0; c < cols; c++) {
    const cx = X0 + w * (c + 0.5);
    for (let l = 0; l < 4; l++) {
      const inset = l * 11;
      const ww = w - 8 - inset * 2;
      if (ww < 14) break;
      items.push(poly(archPts(cx, Y1 - 6 - inset * 0.4, ww, 150 - inset * 2, k), pal[l % 5]));
    }
    for (let d = 0; d < 7; d++) items.push(circ(cx, Y1 - 24 - d * 16, 3.2, pal[4]));
  }
  chunk(ctx, items, 10);
  return 'pointed arches';
}

function fourGardens(ctx) {
  const { pal, ink, bg } = setup(ctx, 5);
  const s = 196;
  const x0 = CX - s / 2;
  const y0 = CY - s / 2;
  const ch = ctx.between(12, 18);
  const items = [poly([[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]], pal[0])];
  const bed = (s - ch) / 2;
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 2; i++) {
      const bx = x0 + i * (bed + ch);
      const by = y0 + j * (bed + ch);
      const c = [bx + bed / 2, by + bed / 2];
      items.push(poly([[bx + 5, by + 5], [bx + bed - 5, by + 5], [bx + bed - 5, by + bed - 5], [bx + 5, by + bed - 5]], pal[1 + ((i + j) % 2)]));
      items.push(poly(ngon(c[0], c[1], bed * 0.34, ctx.pick([4, 8]), Math.PI / 4), pal[3]));
      items.push(circ(c[0], c[1], bed * 0.15, pal[4]));
    }
  }
  items.push(poly(ngon(CX, CY, ch * 1.8, 8, Math.PI / 8), pal[4]));
  items.push(circ(CX, CY, ch, pal[2]));
  chunk(ctx, items, 10);
  return 'four gardens';
}

function starKnot(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.pick([8, 10, 12]);
  const skip = n === 8 ? 3 : n === 10 ? 3 : 5;
  const rot = ctx.between(0, TAU);
  const strands = [];
  for (let r = 0; r < ctx.int(1, 2); r++) {
    const R = 100 - r * 26;
    const pts = Array.from({ length: n + 1 }, (_, i) => pol(CX, CY, R, rot + ((i * skip) % n) * (TAU / n) + r * (TAU / n / 2)));
    strands.push(pts);
  }
  const items = weave(strands, ctx.between(9, 12), (i) => pal[i % 4], ink);
  items.push(...[circ(CX, CY, 8, pal[3])]);
  chunk(ctx, items, 16);
  return 'star knot';
}

function nasridTiles(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(34, 44);
  const amp = ctx.between(0.14, 0.28) * s;
  const items = [];
  const edge = (a, b, flip) => Array.from({ length: 8 }, (_, t) => {
    const u = t / 8;
    const off = amp * Math.sin(TAU * u) * flip + amp * 0.5 * Math.sin(TAU * 2 * u) * 0;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy);
    return [a[0] + dx * u - (dy / L) * off, a[1] + dy * u + (dx / L) * off];
  });
  for (let j = -1; j < Math.ceil(H / s) + 1; j++) {
    for (let i = -1; i < Math.ceil(W / s) + 1; i++) {
      const x = X0 + i * s;
      const y = Y0 + j * s;
      const c = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
      const pts = [...edge(c[0], c[1], 1), ...edge(c[1], c[2], 1), ...edge(c[2], c[3], 1), ...edge(c[3], c[0], 1)];
      items.push(poly(scalePts(pts, x + s / 2, y + s / 2, 0.96), pal[mod(i + 2 * j, 3) + (mod(i, 2) ? 0 : 0)]));
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'nasrid tessellation';
}

function domeRosette(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const rings = ctx.int(5, 7);
  const n = ctx.pick([8, 12, 16]);
  const items = [];
  const R = 104;
  const light = ctx.between(0, TAU);
  for (let k = 0; k < rings; k++) {
    const r1 = R * (1 - k / rings) ** 1.1;
    const r0 = R * (1 - (k + 1) / rings) ** 1.1;
    const off = k % 2 ? Math.PI / n : 0;
    for (let i = 0; i < n; i++) {
      const a = off + (i * TAU) / n;
      const b = a + TAU / n;
      const l = Math.max(0, Math.cos((a + b) / 2 - light));
      items.push(poly(arcBand(CX, CY, r0 + 1, r1 - 1, a + 0.02, b - 0.02, 4), pal[Math.min(4, Math.floor((l * 0.7 + (k % 2) * 0.3) * 4.99))]));
      items.push(circ(...pol(CX, CY, (r0 + r1) / 2, (a + b) / 2), Math.max(1.2, (r1 - r0) * 0.14), ink));
    }
  }
  items.push(poly(starPoints(CX, CY, R / rings, R / rings / 2, n, 0), pal[3]));
  chunk(ctx, items, 16);
  return 'dome rosette';
}

function lustreStars(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const e = ctx.between(28, 36);
  const faces = pxFaces(ctx, 'octagonSquares', e);
  const items = [];
  const lines = [];
  const dir = ctx.rand() < 0.5 ? 1 : -1;
  faces.forEach((f) => {
    items.push(poly(f.pts, f.n === 8 ? pal[0] : pal[1]));
    if (f.n === 8) {
      const R = Math.hypot(f.pts[0][0] - f.c[0], f.pts[0][1] - f.c[1]);
      items.push(poly(starPoints(f.c[0], f.c[1], R * 0.92, R * 0.6, 8, Math.PI / 8), pal[2]));
      const swirl = Array.from({ length: 26 }, (_, i) => pol(f.c[0], f.c[1], R * 0.5 * (1 - i / 26), dir * (i / 26) * TAU * 1.5));
      lines.push(line(swirl, pal[3], 1.8));
    } else {
      items.push(poly(ngon(f.c[0], f.c[1], e * 0.4, 4, 0), pal[3]));
    }
  });
  flush(ctx, items, 3);
  flush(ctx, lines, 1);
  return 'lustre stars';
}

function carpetMedallion(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const bands = [[0, pal[0]], [8, ink], [14, pal[1]], [28, ink], [34, pal[2]]];
  bands.forEach(([inset, col]) => items.push(poly(rect(X0 + inset, Y0 + inset, W - inset * 2, H - inset * 2), col)));
  const cx = CX;
  const cy = CY;
  const rx = 72;
  const ry = 110;
  [[1, pal[3]], [0.78, pal[0]], [0.54, pal[4]], [0.3, pal[1]]].forEach(([k, col]) => items.push(poly([[cx, cy - ry * k], [cx + rx * k, cy], [cx, cy + ry * k], [cx - rx * k, cy]], col)));
  [[X0 + 34, Y0 + 34, 1, 1], [X1 - 34, Y0 + 34, -1, 1], [X0 + 34, Y1 - 34, 1, -1], [X1 - 34, Y1 - 34, -1, -1]].forEach(([x, y, sx, sy]) => {
    items.push(poly([[x, y], [x + sx * 56, y], [x, y + sy * 70]], pal[4]));
    items.push(poly([[x, y], [x + sx * 32, y], [x, y + sy * 40]], pal[3]));
  });
  for (let i = 0; i < 12; i++) items.push(circ(X0 + 17, Y0 + 40 + i * 21, 3.4, pal[3]), circ(X1 - 17, Y0 + 40 + i * 21, 3.4, pal[3]));
  chunk(ctx, items, 16);
  return 'carpet medallion';
}

function borderBands(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const bandH = ctx.between(24, 32);
  const count = Math.floor(H / bandH);
  const types = Array.from({ length: count }, () => ctx.int(0, 3));
  for (let b = 0; b < count; b++) {
    const y = Y0 + b * bandH + (H - count * bandH) / 2;
    const m = y + bandH / 2;
    const step = bandH * ctx.between(0.8, 1.2);
    const t = types[b];
    items.push(poly([[X0, y + 2], [X1, y + 2], [X1, y + bandH - 2], [X0, y + bandH - 2]], pal[(b + 1) % 5]));
    for (let x = X0 + step / 2; x < X1; x += step) {
      if (t === 0) items.push(poly([[x - step * 0.45, m], [x, y + 5], [x + step * 0.45, m], [x, y + bandH - 5]], pal[b % 5]));
      else if (t === 1) items.push(circ(x, m, bandH * 0.28, pal[b % 5]));
      else if (t === 2) items.push(poly([[x - step / 2, y + bandH - 4], [x, y + 4], [x + step / 2, y + bandH - 4]], pal[b % 5]));
      else items.push(poly(ngon(x, m, bandH * 0.36, 6, Math.PI / 6), pal[b % 5]));
    }
  }
  flush(ctx, items, 3);
  return 'border bands';
}

function fivefoldStars(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const e = ctx.between(26, 34);
  const g = Array.from({ length: 4 }, () => ctx.between(0.1, 0.9));
  const gamma = [...g, -g.reduce((a, b) => a + b, 0)];
  const tiles = multigrid(5, gamma, 5.2).map((t) => ({ ...t, pts: t.pts.map(([x, y]) => [CX + x * e, CY + y * e]) })).filter((t) => inFrame(bbox(t.pts), 2));
  const items = tiles.map((t) => poly(scalePts(t.pts, ...centroid(t.pts), 0.99), pal[(t.s - t.r) % 2 ? 0 : 1]));
  flush(ctx, items, 3);
  flush(ctx, strapLines(tiles.map((t) => t.pts), ctx.pick([54, 72]), 1.5, ctx.pick([ink, paper])), 2);
  return 'five-fold stars';
}

function darbImam(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const kind = ctx.pick(['octagonSquares', 'dodecagons']);
  const e = kind === 'dodecagons' ? ctx.between(15, 18) : ctx.between(30, 38);
  const faces = pxFaces(ctx, kind, e);
  const big = faces.filter((f) => f.n > 4);
  const items = faces.map((f) => poly(scalePts(f.pts, f.c[0], f.c[1], 0.99), f.n > 4 ? pal[0] : pal[1]));
  const inner = big.map((f) => scalePts(f.pts, f.c[0], f.c[1], 0.5));
  big.forEach((f, i) => items.push(poly(scalePts(f.pts, f.c[0], f.c[1], 0.55), pal[2 + (i % 2)])));
  flush(ctx, items, 3);
  flush(ctx, strapLines(big.map((f) => f.pts), 72, 1.8, ink), 2);
  flush(ctx, strapLines(inner, 62, 1.1, paper), 2);
  return 'self-similar girih';
}

function kundekari(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  items.push(poly(rect(X0 + 4, Y0 + 4, W - 8, H - 8), ink));
  const u = ctx.between(42, 48);
  const stars = [[CX, CY - 80], [CX, CY + 80]];
  const rhombi = (cx, cy, scale, rot, shift) => {
    for (let i = 0; i < 8; i++) {
      const a = rot + (i * TAU) / 8;
      const b = a + TAU / 8;
      const A = [Math.cos(a) * scale, Math.sin(a) * scale];
      const B = [Math.cos(b) * scale, Math.sin(b) * scale];
      items.push(poly([[cx, cy], [cx + A[0], cy + A[1]], [cx + A[0] + B[0], cy + A[1] + B[1]], [cx + B[0], cy + B[1]]], pal[(i + shift) % 5], 0, 0.8));
    }
  };
  stars.forEach(([cx, cy], k) => {
    rhombi(cx, cy, u, 0, k);
    rhombi(cx, cy, u * 0.5, TAU / 16, k + 2);
    items.push(circ(cx, cy, u * 0.14, pal[3]));
  });
  [[X0 + 22, CY], [X1 - 22, CY], [CX, CY]].forEach(([cx, cy], k) => {
    items.push(poly([[cx, cy - 26], [cx + 18, cy], [cx, cy + 26], [cx - 18, cy]], pal[(k + 1) % 5]));
    items.push(poly([[cx, cy - 12], [cx + 8, cy], [cx, cy + 12], [cx - 8, cy]], pal[(k + 3) % 5]));
  });
  chunk(ctx, items, 16);
  return 'inlaid star panel';
}

function eightfoldLattice(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const s = ctx.between(52, 66);
  const skip = ctx.pick([2, 3]);
  const items = [];
  const lines = [];
  for (let j = 0; j * s < H + s; j++) {
    for (let i = 0; i * s < W + s; i++) {
      const cx = X0 + i * s + s / 2;
      const cy = Y0 + j * s + s / 2;
      if (!inFrame([cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2])) continue;
      const R = s * 0.62;
      items.push(circ(cx, cy, R * 0.34, pal[(i + j) % 2 ? 2 : 3]));
      const pts = Array.from({ length: 9 }, (_, k) => pol(cx, cy, R, ((k * skip) % 8) * (TAU / 8) + Math.PI / 8));
      lines.push(line(pts, pal[0], 2.6), line(pts, paper, 1));
    }
  }
  flush(ctx, items, 3);
  flush(ctx, lines, 3);
  return 'eight-fold lattice';
}

module.exports = {
  girihTiles, hankinRosette, zelligeStar, starAndCross, muqarnasPlan, shamsa, tenfoldRosette, twelvefoldRosette, strapworkKnot,
  mashrabiya, jaliScreen, brickMosaic, islimiScrolls, pointedArches, fourGardens, starKnot, nasridTiles, domeRosette, lustreStars,
  carpetMedallion, borderBands, fivefoldStars, ninefoldStar, darbImam, kundekari, eightfoldLattice
};
