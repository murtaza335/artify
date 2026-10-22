'use strict';

// Patterns of East and South Asia, as abstract interpretations: tortoise-shell hexes, arrow feathers, offset checks,
// scale triangles, basket-weave stars, rising steam, wooden lattices, roundels, raked gravel, ice-ray lattices, ruyi
// clouds, thunder frets, coin lattices, a moon gate, painted bands, wrapping cloth, rangoli, block prints, tie-dye dots,
// darning stitch, diagonal batik, four-oval crosses, brocade diamonds, four-petal flowers, an endless knot and sheer
// jamdani motifs.

const K = require('./pattern-kit');
const { starPoints } = require('./engine');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, inFrame, weave, ell, splitPoly, eachCell } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function kikkoHexes(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const r = ctx.between(22, 30);
  const w = Math.sqrt(3) * r;
  const motif = ctx.int(0, 2);
  const items = [];
  const rows = Math.ceil(H / (r * 1.5)) + 2;
  for (let j = -2; j < rows; j++) {
    for (let i = -2 - Math.ceil(rows / 2); i < Math.ceil(W / w) + 3; i++) {
      const cx = X0 + w * (i + j / 2);
      const cy = Y0 + 1.5 * r * j;
      if (!inFrame([cx - r, cy - r, cx + r, cy + r])) continue;
      const hex = ngon(cx, cy, r * 0.96, 6, Math.PI / 6);
      items.push(poly(hex, pal[mod(i - j, 2)]));
      if (motif === 0) items.push(layer(poly(ngon(cx, cy, r * 0.6, 6, Math.PI / 6), pal[2]), 1));
      else if (motif === 1) for (let k = 0; k < 6; k++) items.push(layer(circ(...pol(cx, cy, r * 0.5, (k * TAU) / 6), r * 0.17, pal[2]), 1));
      else items.push(layer(poly(starPoints(cx, cy, r * 0.7, r * 0.35, 6, 0), pal[2]), 1));
      items.push(layer(circ(cx, cy, r * 0.16, pal[3]), 2));
    }
  }
  flush(ctx, items, 3);
  return 'tortoise shell';
}

function yagasuri(ctx) {
  const { pal } = setup(ctx, 4);
  const cw = ctx.between(26, 36);
  const step = ctx.between(16, 22);
  const items = [];
  const cols = Math.ceil(W / cw) + 1;
  for (let c = 0; c < cols; c++) {
    const x = X0 + c * cw;
    const dir = c % 2 ? 1 : -1;
    for (let y = Y0 - step; y < Y1 + step; y += step) {
      const a = [x, y + (dir > 0 ? 0 : step * 0.9)];
      items.push(poly([[x, y], [x + cw / 2, y + dir * step * 0.9], [x + cw, y], [x + cw, y + step * 0.45], [x + cw / 2, y + dir * step * 0.9 + step * 0.45], [x, y + step * 0.45]], pal[(c + Math.round((y - Y0) / step)) % 2 ? 0 : 1 + (c % 2)]));
      void a;
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'arrow feathers';
}

function ichimatsu(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(22, 34);
  const items = [];
  const rate = ctx.between(0.1, 0.3);
  eachCell(s, s, (i, j, x, y) => {
    if (mod(i + j, 2)) return;
    items.push(poly(rp(x, y, s, s), pal[0]));
    if (ctx.rand() < rate) items.push(poly(rp(x + s * 0.25, y + s * 0.25, s * 0.5, s * 0.5), pal[1]));
  });
  eachCell(s, s, (i, j, x, y) => {
    if (!mod(i + j, 2)) return;
    items.push(poly(rp(x, y, s, s), pal[2]));
    if (ctx.rand() < rate) items.push(circ(x + s / 2, y + s / 2, s * 0.2, pal[3]));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'offset checks';
}

function uroko(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(28, 38);
  const h = s * 0.866;
  const items = [];
  eachCell(s, h, (i, j, x, y) => {
    const o = mod(j, 2) ? s / 2 : 0;
    const up = [[x + o, y + h], [x + o + s, y + h], [x + o + s / 2, y]];
    items.push(poly(up, pal[mod(i + j, 2)]));
    items.push(poly(scalePts(up, ...centroid(up), 0.5), pal[2 + mod(i + j, 2)]));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'scale triangles';
}

function kagomeWeave(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const gap = ctx.between(34, 44);
  const strands = [];
  [0, 60, 120].forEach((deg, d) => {
    const a = (deg * Math.PI) / 180;
    const off = ctx.between(0, gap);
    for (let k = -7; k <= 7; k++) {
      const n = [-Math.sin(a), Math.cos(a)];
      const c = [CX + n[0] * (k * gap + off * 0.3 + d * 3), CY + n[1] * (k * gap + off * 0.3 + d * 3)];
      strands.push([[c[0] - Math.cos(a) * 210, c[1] - Math.sin(a) * 210], [c[0] + Math.cos(a) * 210, c[1] + Math.sin(a) * 210]]);
    }
  });
  const keep = strands.filter((s) => {
    const mid = [(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2];
    return Math.abs((mid[0] - CX) * (s[1][1] - s[0][1]) - (mid[1] - CY) * (s[1][0] - s[0][0])) / 420 < 200;
  });
  const dirOf = (i) => Math.floor(i / 15);
  const items = weave(keep, ctx.between(7, 10), (i) => pal[dirOf(i) % 3], ink);
  chunk(ctx, items, 18);
  return 'basket weave star';
}

function tachiwaki(ctx) {
  const { pal } = setup(ctx, 4);
  const cw = ctx.between(34, 46);
  const amp = cw * ctx.between(0.2, 0.34);
  const f = ctx.between(0.035, 0.055);
  const items = [];
  const cols = Math.ceil(W / cw) + 2;
  const curve = (x0, ph) => Array.from({ length: 40 }, (_, i) => [x0 + amp * Math.sin(f * i * 8 + ph), Y0 + (i / 39) * H]);
  for (let c = 0; c < cols; c++) {
    const L = curve(X0 + c * cw, 0);
    const R = curve(X0 + (c + 1) * cw, 0).reverse();
    items.push(poly([...L, ...R], pal[c % 3]));
    for (let k = 0; k < 7; k++) {
      const p = L[Math.floor(2 + k * 5.4)] || L[5];
      items.push(circ(p[0] + cw / 2, p[1], cw * 0.1, pal[3]));
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'rising steam';
}

function kumikoSakura(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const r = ctx.between(26, 34);
  const w = Math.sqrt(3) * r;
  const items = [];
  const lines = [];
  const petals = ctx.pick([5, 6]);
  const rows = Math.ceil(H / (r * 1.5)) + 2;
  for (let j = -2; j < rows; j++) {
    for (let i = -2 - Math.ceil(rows / 2); i < Math.ceil(W / w) + 3; i++) {
      const cx = X0 + w * (i + j / 2);
      const cy = Y0 + 1.5 * r * j;
      if (!inFrame([cx - r, cy - r, cx + r, cy + r])) continue;
      const hex = ngon(cx, cy, r, 6, Math.PI / 6);
      items.push(poly(scalePts(hex, cx, cy, 0.9), pal[1]));
      for (let k = 0; k < petals; k++) items.push(ell(...pol(cx, cy, r * 0.38, (k * TAU) / petals - Math.PI / 2), r * 0.28, r * 0.14, (k * TAU) / petals - Math.PI / 2, pal[2]));
      items.push(circ(cx, cy, r * 0.12, pal[3]));
      for (let k = 0; k < 6; k++) lines.push(line([hex[k], hex[(k + 1) % 6]], pal[0], 3.4));
    }
  }
  flush(ctx, lines, 2);
  flush(ctx, items, 3);
  return 'wooden lattice';
}

function crestRings(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = 2;
  const rows = 3;
  const items = [];
  const n = ctx.pick([5, 6, 8]);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = X0 + (W / cols) * (i + 0.5);
      const cy = Y0 + (H / rows) * (j + 0.5);
      const R = 44;
      items.push(circ(cx, cy, R, pal[(i + j) % 2]));
      items.push(ring(cx, cy, R - 4, pal[2], 2.4));
      const rot = ctx.between(0, TAU);
      for (let k = 0; k < n; k++) items.push(ell(...pol(cx, cy, R * 0.5, rot + (k * TAU) / n), R * 0.3, R * 0.13, rot + (k * TAU) / n, pal[2 + (k % 2)]));
      items.push(circ(cx, cy, R * 0.2, pal[3]));
    }
  }
  chunk(ctx, items, 18);
  return 'crest rings';
}

function rakedGravel(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const stones = Array.from({ length: ctx.int(2, 4) }, () => ({ x: ctx.between(X0 + 40, X1 - 40), y: ctx.between(Y0 + 50, Y1 - 50), r: ctx.between(16, 28) }));
  const gap = ctx.between(7, 9);
  const items = [];
  for (let y = Y0 + 6; y < Y1; y += gap) {
    const pts = [];
    for (let x = X0; x <= X1; x += 4) {
      let dy = 0;
      stones.forEach((s) => {
        const d = Math.hypot(x - s.x, y - s.y);
        const reach = s.r * 2.6;
        if (d < reach) dy += (y < s.y ? -1 : 1) * (reach - d) * 0.45 * (1 - d / reach + 0.2);
      });
      pts.push([x, y + dy]);
    }
    items.push(line(pts, pal[0], 1.7));
  }
  flush(ctx, items, 1);
  stones.forEach((s, i) => {
    const e1 = ell(s.x, s.y, s.r * 1.2, s.r, ctx.between(0, 1), pal[2]);
    items.length = 0;
    items.push(e1, ell(s.x - s.r * 0.2, s.y - s.r * 0.25, s.r * 0.7, s.r * 0.5, 0.3, pal[1]));
    flush(ctx, items, 1);
  });
  return 'raked gravel';
}

function iceRayLattice(ctx) {
  const { pal, ink, bg } = setup(ctx, 4);
  let cells = [rp(X0, Y0, W, H)];
  const cuts = ctx.int(18, 28);
  for (let k = 0; k < cuts; k++) {
    const idx = ctx.int(0, cells.length - 1);
    const c = cells[idx];
    const m = centroid(c);
    const parts = splitPoly(c, [m[0] + ctx.between(-8, 8), m[1] + ctx.between(-8, 8)], ctx.between(0, Math.PI));
    if (parts.length === 2) cells.splice(idx, 1, ...parts);
  }
  const items = cells.map((c, i) => poly(scalePts(c, ...centroid(c), 0.93), pal[i % 3]));
  flush(ctx, items, 3);
  return 'ice-ray lattice';
}

function ruyiClouds(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(34, 46);
  const items = [];
  const cols = Math.ceil(W / s) + 1;
  const rows = Math.ceil(H / (s * 0.9)) + 1;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = X0 + i * s + (j % 2 ? s / 2 : 0);
      const cy = Y0 + j * s * 0.9;
      const r = s * 0.22;
      const col = pal[mod(i + j, 3)];
      items.push(circ(cx, cy - r * 0.4, r, col), circ(cx - r * 1.1, cy + r * 0.3, r * 0.9, col), circ(cx + r * 1.1, cy + r * 0.3, r * 0.9, col));
      items.push(poly([[cx - r * 1.6, cy + r * 0.6], [cx + r * 1.6, cy + r * 0.6], [cx, cy - r * 0.2]], col));
      items.push(layer(circ(cx, cy - r * 0.2, r * 0.45, pal[3]), 1));
      items.push(line([[cx, cy + r * 0.8], [cx + r * 0.8, cy + r * 1.6], [cx + r * 1.6, cy + r * 1.2]], col, r * 0.4));
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'auspicious clouds';
}

function thunderFret(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(46, 62);
  const turns = ctx.int(3, 4);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const mirror = mod(i + j, 2) ? 1 : -1;
    const pts = [];
    let px = x + s * 0.1;
    let py = y + s * 0.1;
    let len = s * 0.8;
    let d = 0;
    pts.push([px, py]);
    for (let t = 0; t < turns * 4; t++) {
      const dir = [[1, 0], [0, 1], [-1, 0], [0, -1]][mod(d * mirror, 4)];
      px += dir[0] * len;
      py += dir[1] * len;
      pts.push([px, py]);
      d++;
      if (t % 2) len -= s * 0.8 / (turns * 2 + 0.5);
    }
    items.push(line(pts.map(([a, b]) => (mirror > 0 ? [a, b] : [2 * x + s - a, b])), pal[mod(i + 2 * j, 3)], s * 0.075));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'thunder fret';
}

function coinLattice(ctx) {
  const { pal, ink, bg } = setup(ctx, 4);
  const r = ctx.between(26, 34);
  const items = [];
  const rings = [];
  eachCell(r, r, (i, j, x, y) => {
    const cx = x + (mod(j, 2) ? r / 2 : 0);
    rings.push(ring(cx, y, r * 0.72, pal[mod(i + j, 2) ? 0 : 1], r * 0.14));
    items.push(poly(ngon(cx, y, r * 0.2, 4, Math.PI / 4), pal[2]));
    items.push(circ(cx, y + r / 2, r * 0.1, pal[3]));
  });
  flush(ctx, rings.filter((it) => inFrame(it.b)), 3);
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'coin lattice';
}

function moonGate(ctx) {
  const { pal, ink, bg } = setup(ctx, 4);
  const R = ctx.between(70, 82);
  const items = [];
  const s = 22;
  for (let y = Y0; y < Y1; y += s * 0.5) items.push(line([[X0, y], [X1, y]], pal[0], 1.2));
  for (let y = Y0, r = 0; y < Y1; y += s * 0.5, r++) for (let x = X0 + (r % 2) * s; x < X1; x += s * 2) items.push(line([[x, y], [x, y + s * 0.5]], pal[0], 1.2));
  items.push(circ(CX, CY, R + 8, ink), circ(CX, CY, R, pal[2]));
  items.push(circ(CX, CY + R * 0.3, R * 0.5, pal[3]));
  for (let k = 0; k < 12; k++) items.push(line([[CX, CY], pol(CX, CY, R, (k * TAU) / 12)], ink, 1.4));
  [0.35, 0.65, 0.9].forEach((k) => items.push(ring(CX, CY, R * k, ink, 1.4)));
  flush(ctx, items.filter((it) => inFrame(it.b)), 2);
  return 'moon gate';
}

function dancheong(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const bandH = ctx.between(40, 52);
  const rows = Math.floor(H / bandH);
  const y0 = Y0 + (H - rows * bandH) / 2;
  for (let b = 0; b < rows; b++) {
    const y = y0 + b * bandH;
    items.push(poly(rp(X0, y, W, bandH), pal[b % 3]));
    items.push(layer(poly(rp(X0, y + 4, W, 4), ink), 1), layer(poly(rp(X0, y + bandH - 8, W, 4), ink), 1));
    const step = bandH * 1.05;
    for (let x = X0 + step / 2; x < X1 + step; x += step) {
      const cy = y + bandH / 2;
      for (let k = 0; k < 8; k++) items.push(layer(ell(...pol(x, cy, bandH * 0.2, (k * TAU) / 8), bandH * 0.15, bandH * 0.07, (k * TAU) / 8, pal[(b + 1 + (k % 2)) % 5]), 2));
      items.push(layer(circ(x, cy, bandH * 0.1, pal[3 + (b % 2)]), 3));
    }
  }
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'painted bands';
}

function bojagi(ctx) {
  const { pal, ink } = setup(ctx, 5);
  let cells = [rp(X0, Y0, W, H)];
  for (let k = 0; k < ctx.int(10, 15); k++) {
    cells.sort((a, b) => bbox(b)[2] - bbox(b)[0] + bbox(b)[3] - bbox(b)[1] - (bbox(a)[2] - bbox(a)[0] + bbox(a)[3] - bbox(a)[1]));
    const c = cells.shift();
    const m = centroid(c);
    const vertical = bbox(c)[2] - bbox(c)[0] > bbox(c)[3] - bbox(c)[1];
    const parts = splitPoly(c, [m[0] + ctx.between(-10, 10), m[1] + ctx.between(-10, 10)], vertical ? Math.PI / 2 : 0);
    cells.push(...(parts.length === 2 ? parts : [c]));
  }
  const items = [];
  const seams = [];
  cells.forEach((c, i) => {
    items.push(poly(c, pal[i % 5], 0.9));
    const inner = scalePts(c, ...centroid(c), 0.86);
    seams.push(line(inner, ink, 1, true));
  });
  flush(ctx, items, 2);
  flush(ctx, seams, 1);
  return 'wrapping cloth';
}

function rangoliPetals(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const n = ctx.pick([6, 8, 12]);
  const items = [];
  const rings = ctx.int(3, 4);
  for (let k = rings; k >= 1; k--) {
    const r = (100 * k) / rings;
    for (let i = 0; i < n; i++) {
      const a = (i * TAU) / n + (k % 2 ? Math.PI / n : 0);
      items.push(ell(...pol(CX, CY, r * 0.72, a), r * 0.3, r * 0.14, a, pal[(k + i) % 5]));
      items.push(circ(...pol(CX, CY, r * 1.0, a), Math.max(2, r * 0.05), pal[(k + 2) % 5]));
    }
  }
  items.push(poly(starPoints(CX, CY, 26, 12, n, 0), pal[0]), circ(CX, CY, 6, ink));
  chunk(ctx, items, 14);
  return 'rangoli';
}

function ajrakh(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(48, 60);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2;
    const cy = y + s / 2;
    items.push(poly(rp(x + 1, y + 1, s - 2, s - 2), pal[mod(i + j, 2)]));
    items.push(layer(poly(starPoints(cx, cy, s * 0.46, s * 0.22, 8, Math.PI / 8), pal[2]), 1));
    items.push(layer(poly([[cx, cy - s * 0.2], [cx + s * 0.2, cy], [cx, cy + s * 0.2], [cx - s * 0.2, cy]], ink), 2));
    [[0, 0], [s, 0], [0, s], [s, s]].forEach(([dx, dy]) => items.push(layer(circ(x + dx, y + dy, s * 0.08, pal[3]), 3)));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'block print';
}

function bandhani(ctx) {
  const { pal } = setup(ctx, 3);
  const s = ctx.between(9, 11);
  const kind = ctx.int(0, 2);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = (i - cols / 2) / (cols / 2);
      const v = (j - rows / 2) / (rows / 2);
      const m = mod(i, 8) - 4;
      const n = mod(j, 8) - 4;
      const on = kind === 0 ? Math.abs(m) + Math.abs(n) <= 3 : kind === 1 ? Math.abs(Math.abs(m) - Math.abs(n)) <= 0 || (Math.abs(m) + Math.abs(n)) % 4 === 0 : (Math.abs(u) + Math.abs(v)) % 0.25 < 0.12;
      if (!on) continue;
      const x = X0 + (i + 0.5) * s;
      const y = Y0 + (j + 0.5) * s;
      items.push(circ(x, y, s * 0.42, pal[0]), circ(x, y, s * 0.17, pal[1]));
    }
  }
  flush(ctx, items, 3);
  return 'tie-dye dots';
}

function phulkari(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(40, 54);
  const items = [];
  const gap = ctx.between(1.8, 2.6);
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const col = pal[mod(i + j, 3)];
    for (let t = -s / 2 + gap; t < s / 2; t += gap) {
      const hw = (s / 2 - Math.abs(t)) * 0.95;
      items.push(line([[cx - hw, cy + t], [cx + hw, cy + t]], col, gap * 0.62));
    }
    const q = s * 0.5;
    for (let t = -s / 4 + gap; t < s / 4; t += gap) items.push(line([[x + s - q / 2 - (s / 4 - Math.abs(t)) * 0.6, y + q / 2 + t + s / 2], [x + s - q / 2 + (s / 4 - Math.abs(t)) * 0.6, y + q / 2 + t + s / 2]], pal[3], gap * 0.6));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'darning stitch';
}

function parangBatik(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const bw = ctx.between(44, 58);
  const items = [];
  const curl = [];
  const N = Math.ceil((W + H) / bw) + 2;
  for (let k = -2; k < N; k++) {
    const o = k * bw;
    items.push(poly([[X0 + o - H, Y1], [X0 + o - H + bw, Y1], [X0 + o + bw, Y0], [X0 + o, Y0]], pal[mod(k, 3)]));
    for (let t = 0; t < 8; t++) {
      const cx = X0 + o + bw / 2 - H / 2 + (t - 3.5) * 40 + 40;
      const cy = Y0 + H / 2 - (t - 3.5) * 40 * 0 - (t - 3.5) * 40;
      void cx;
      void cy;
    }
    const pts = Array.from({ length: 40 }, (_, i) => {
      const f = i / 39;
      const along = [X0 + o - H * (1 - f) + bw / 2, Y1 - H * f];
      return [along[0] + Math.sin(f * TAU * 4) * bw * 0.28, along[1] + Math.cos(f * TAU * 4) * bw * 0.1];
    });
    curl.push(line(pts, pal[3], bw * 0.1), line(pts, ink, 1.4));
  }
  flush(ctx, items, 3);
  flush(ctx, curl.filter((it) => inFrame(it.b)), 2);
  return 'diagonal batik';
}

function kawung(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(34, 44);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const col = pal[mod(i + j, 2)];
    for (let k = 0; k < 4; k++) items.push(ell(...pol(cx, cy, s * 0.26, (k * TAU) / 4), s * 0.27, s * 0.14, (k * TAU) / 4, pal[mod(i + j, 2) + (k % 2) * 2]));
    items.push(layer(circ(cx, cy, s * 0.07, pal[3]), 1));
    items.push(layer(circ(x, y, s * 0.1, ink), 2));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'four-oval cross';
}

function songketDiamonds(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(38, 52);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2 + (mod(j, 2) ? s / 2 : 0);
    const cy = y + s / 2;
    [[0.5, pal[0]], [0.36, pal[2]], [0.22, pal[1]], [0.09, pal[3]]].forEach(([k, col]) => items.push(poly([[cx, cy - s * k * 1.1], [cx + s * k, cy], [cx, cy + s * k * 1.1], [cx - s * k, cy]], col)));
  });
  items.push(poly(rp(X0, Y0, W, 8), pal[3]), poly(rp(X0, Y1 - 8, W, 8), pal[3]));
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'brocade diamonds';
}

function prajamYam(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(30, 40);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2 + (mod(j, 2) ? s / 2 : 0);
    const cy = y + s / 2;
    for (let k = 0; k < 4; k++) items.push(ell(...pol(cx, cy, s * 0.22, (k * TAU) / 4 + Math.PI / 4), s * 0.22, s * 0.12, (k * TAU) / 4 + Math.PI / 4, pal[mod(i + j, 2)]));
    items.push(layer(circ(cx, cy, s * 0.08, pal[2]), 1));
    items.push(layer(poly([[cx + s / 2, cy], [cx + s / 2 + s * 0.1, cy + s * 0.1], [cx + s / 2, cy + s * 0.2], [cx + s / 2 - s * 0.1, cy + s * 0.1]], pal[3]), 1));
  });
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'four-petal flowers';
}

function endlessKnot(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const a = ctx.between(60, 76);
  const b = ctx.between(86, 100);
  const strands = [
    [[CX - a, CY - b], [CX + a, CY - b], [CX + a, CY + b], [CX - a, CY + b], [CX - a, CY - b]],
    [[CX, CY - b - 12], [CX + a + 14, CY], [CX, CY + b + 12], [CX - a - 14, CY], [CX, CY - b - 12]],
    [[CX - a * 0.5, CY - b * 0.5], [CX + a * 0.5, CY - b * 0.5], [CX + a * 0.5, CY + b * 0.5], [CX - a * 0.5, CY + b * 0.5], [CX - a * 0.5, CY - b * 0.5]]
  ];
  chunk(ctx, weave(strands, ctx.between(9, 12), (i) => pal[i % 3], ink), 14);
  return 'endless knot';
}

function jamdani(ctx) {
  const { pal } = setup(ctx, 4);
  const s = ctx.between(30, 40);
  const items = [];
  eachCell(s, s, (i, j, x, y) => {
    const cx = x + s / 2 + (mod(j, 2) ? s / 2 : 0);
    const cy = y + s / 2;
    const t = mod(i * 3 + j * 5, 4);
    if (t === 0) items.push(poly([[cx, cy - s * 0.22], [cx + s * 0.16, cy], [cx, cy + s * 0.22], [cx - s * 0.16, cy]], pal[0], 0.9));
    else if (t === 1) for (let k = 0; k < 6; k++) items.push(circ(...pol(cx, cy, s * 0.15, (k * TAU) / 6), s * 0.07, pal[1], 0.9));
    else if (t === 2) items.push(poly(starPoints(cx, cy, s * 0.2, s * 0.09, 6, 0), pal[2], 0.9));
    else items.push(line([[cx - s * 0.2, cy], [cx - s * 0.1, cy - s * 0.12], [cx, cy], [cx + s * 0.1, cy - s * 0.12], [cx + s * 0.2, cy]], pal[3], 2));
  });
  items.push(poly(rp(X0, Y0, W, 14), pal[0], 0.9), poly(rp(X0, Y1 - 14, W, 14), pal[0], 0.9), poly(rp(X0, Y0 + 18, W, 3), pal[1], 0.9), poly(rp(X0, Y1 - 21, W, 3), pal[1], 0.9));
  flush(ctx, items.filter((it) => inFrame(it.b)), 3);
  return 'sheer motifs';
}

module.exports = {
  kikkoHexes, yagasuri, ichimatsu, uroko, kagomeWeave, tachiwaki, kumikoSakura, crestRings, rakedGravel, iceRayLattice, ruyiClouds,
  thunderFret, coinLattice, moonGate, dancheong, bojagi, rangoliPetals, ajrakh, bandhani, phulkari, parangBatik, kawung,
  songketDiamonds, prajamYam, endlessKnot, jamdani
};
