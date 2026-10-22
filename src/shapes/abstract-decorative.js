'use strict';

// Spirit, craft and decoration, re-imagined: primordial petals, altarpieces, duality discs, circles and bars,
// simultaneous fabrics, dab rings and columns, pendulum webs, luminous peaks, wrapped bundles, polyphony, a castle and
// sun, small landscapes, interlaced bands, ornament samplers, collage fans, print strips, beaded bands, tapestry
// blocks, folded paper cuts, painted panels, rounded hills, little images, looped wire and boxed assemblages.

const K = require('./pattern-kit');
const { starPoints, arcBand } = require('./engine');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, ell, hatchRect, weave, smoothPath } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function primordialPetals(ctx) {
  const { pal, ink } = setup(ctx, 5, ctx.colors[1]);
  const items = [];
  const spots = [[CX, Y0 + 80, 70], [CX, Y1 - 80, 70], [X0 + 40, CY, 38], [X1 - 40, CY, 38]];
  spots.forEach(([cx, cy, R], s) => {
    const n = ctx.int(6, 10);
    for (let k = 0; k < n; k++) items.push(layer(ell(...pol(cx, cy, R * 0.55, (k * TAU) / n), R * 0.45, R * 0.2, (k * TAU) / n, pal[(s + k) % 5]), s));
    items.push(layer(circ(cx, cy, R * 0.28, pal[(s + 2) % 5]), s + 1), layer(circ(cx, cy, R * 0.12, ink), s + 2));
  });
  items.push(layer(line(Array.from({ length: 50 }, (_, i) => pol(CX, CY, 4 + i * 1.4, (i / 49) * TAU * 2.2)), pal[3], 3), 0));
  flush(ctx, items, 1);
  return 'primordial petals';
}

function altarpiece(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const a = [CX, Y0 + 14];
  const b = [X0 + 14, Y1 - 14];
  const c = [X1 - 14, Y1 - 14];
  items.push(poly([a, b, c], pal[0]));
  for (let k = 0; k < 4; k++) items.push(layer(poly(scalePts([a, b, c], CX, CY + 30, 0.85 - k * 0.2), pal[(k + 1) % 5]), k + 1));
  const r = ctx.between(26, 40);
  items.push(layer(circ(CX, CY + 40, r, pal[2]), 6), layer(circ(CX, CY + 40, r * 0.55, pal[3]), 7));
  for (let k = 1; k <= 3; k++) items.push(layer(ring(CX, CY + 40, r + k * 10, ink, 2), 5));
  flush(ctx, items, 1);
  return 'altarpiece';
}

function dualityDiscs(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const cols = 2;
  const rows = ctx.int(3, 4);
  const items = [];
  const R = Math.min(W / cols, H / rows) * 0.42;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = X0 + ((i + 0.5) * W) / cols;
    const cy = Y0 + ((j + 0.5) * H) / rows;
    const flip = mod(i + j, 2);
    const half = (start) => [[cx, cy], ...Array.from({ length: 21 }, (_, k) => pol(cx, cy, R, start + (k / 20) * Math.PI))];
    items.push(poly(half(Math.PI / 2), flip ? pal[0] : pal[1]));
    items.push(poly(half(-Math.PI / 2), flip ? pal[1] : pal[0]));
    items.push(layer(circ(cx, cy, R * 0.36, flip ? pal[2] : pal[3]), 1));
    items.push(layer(ring(cx, cy, R, ink, 2), 2));
  }
  flush(ctx, items, 3);
  return 'duality discs';
}

function circlesAndBars(ctx) {
  const { pal, ink } = setup(ctx, 5, ctx.colors[1]);
  const items = [];
  for (let i = 0; i < ctx.int(8, 12); i++) {
    const x = ctx.between(X0 + 20, X1 - 20);
    const y = ctx.between(Y0 + 20, Y1 - 20);
    if (i % 2) items.push(layer(circ(x, y, ctx.between(10, 32), pal[i % 5]), i), layer(ring(x, y, ctx.between(4, 9), ink, 2), i));
    else items.push(layer(poly(rp(x, y, ctx.pick([8, 14]), ctx.between(40, 120)), pal[i % 5]), i));
  }
  flush(ctx, items, 1);
  return 'circles and bars';
}

function verticalHorizontal(ctx) {
  const { pal } = setup(ctx, 5, ctx.colors[1]);
  const xs = [X0 + 10, ...Array.from({ length: 3 }, () => ctx.between(X0 + 30, X1 - 30)).sort((a, b) => a - b), X1 - 10];
  const ys = [Y0 + 10, ...Array.from({ length: 5 }, () => ctx.between(Y0 + 30, Y1 - 30)).sort((a, b) => a - b), Y1 - 10];
  const items = [];
  for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
    if ((i * 3 + j * 5 + ctx.int(0, 2)) % 3 === 0) continue;
    items.push(poly(rp(xs[i] + 1.5, ys[j] + 1.5, xs[i + 1] - xs[i] - 3, ys[j + 1] - ys[j] - 3), pal[(i + j) % 5]));
  }
  flush(ctx, items, 3);
  return 'vertical-horizontal';
}

function simultaneousFabric(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const n = ctx.int(4, 7);
  const sw = W / n;
  const items = [];
  const rows = ctx.int(4, 7);
  const rh = H / rows;
  for (let i = 0; i < n; i++) items.push(poly(rp(X0 + i * sw, Y0, sw, H), pal[i % 5]));
  for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
    const cx = X0 + (i + 0.5) * sw;
    const cy = Y0 + (j + 0.5) * rh;
    const r = Math.min(sw, rh) * 0.4;
    const up = mod(i + j, 2);
    const half = [[cx, cy], ...Array.from({ length: 16 }, (_, k) => pol(cx, cy, r, (up ? 0 : Math.PI) + (k / 15) * Math.PI))];
    items.push(layer(poly(half, pal[(i + j + 2) % 5]), 1));
  }
  flush(ctx, items, 3);
  return 'simultaneous fabric';
}

function dabRings(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const rings = ctx.int(5, 7);
  for (let k = 0; k < rings; k++) {
    const r = 10 + (k * 92) / rings;
    const n = Math.round((TAU * r) / 11);
    for (let i = 0; i < n; i++) {
      const a = (i * TAU) / n + k * 0.4;
      const p = pol(CX, CY, r, a);
      items.push(ell(p[0], p[1], 6, 2.8, a + Math.PI / 2, pal[mod(k + (i % 3 === 0 ? 1 : 0), 5)]));
    }
  }
  flush(ctx, items, 3);
  return 'concentric dabs';
}

function dabColumns(ctx) {
  const { pal } = setup(ctx, 5);
  const items = [];
  const cols = ctx.int(6, 9);
  const rows = ctx.int(14, 20);
  const dw = W / cols;
  const dh = H / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) items.push(ell(X0 + (i + 0.5) * dw + (j % 2 ? 2 : -2), Y0 + (j + 0.5) * dh, dw * 0.22, dh * 0.42, 0, pal[mod(i + Math.floor(j / 4), 5)]));
  flush(ctx, items, 3);
  return 'dab columns';
}

function pendulumWeb(ctx) {
  const { pal, ink } = setup(ctx, 4, ctx.colors[1]);
  const items = [];
  const n = ctx.int(7, 13);
  for (let r = 0; r < 5; r++) {
    const R = 100 - r * 18;
    const k = ctx.int(2, Math.floor(n / 2));
    const pts = Array.from({ length: n + 1 }, (_, i) => pol(CX, CY, R, ((i * k) % n) * (TAU / n) + r * 0.3));
    items.push(layer(line(pts, pal[r % 4], 1.6, true), r));
  }
  for (let i = 0; i < n; i++) items.push(layer(line([[CX, CY], pol(CX, CY, 100, (i * TAU) / n)], ink, 0.8), 6));
  flush(ctx, items, 1);
  return 'pendulum web';
}

function luminousPeak(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const cx = ctx.between(CX - 30, CX + 30);
  const cy = Y0 + ctx.between(80, 130);
  for (let k = 8; k >= 1; k--) items.push(layer(circ(cx, cy, 14 + k * 9, pal[0], 0.12), 0));
  items.push(layer(circ(cx, cy, 22, pal[1]), 1));
  for (let k = 0; k < 4; k++) {
    const y = Y0 + 150 + k * 30;
    const pts = Array.from({ length: 8 }, (_, i) => [X0 + (i / 7) * W, y + Math.sin(i * 1.3 + k * 2) * 24]);
    pts.push([X1, Y1], [X0, Y1]);
    items.push(layer(path(smoothPath(pts.slice(0, 8)) + ` L${fmt(X1)} ${fmt(Y1)} L${fmt(X0)} ${fmt(Y1)} Z`, pal[2 + (k % 3)], [X0, Y0 + 100, X1, Y1]), 2 + k));
  }
  flush(ctx, items, 1);
  return 'luminous peak';
}

function wrappedBundles(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const n = ctx.int(3, 5);
  for (let i = 0; i < n; i++) {
    const x = X0 + ((i + 0.5) * W) / n;
    const top = Y0 + ctx.between(10, 50);
    const bot = Y1 - ctx.between(10, 60);
    const w = W / n * 0.4;
    items.push(poly([[x - w / 2, top], [x + w / 2, top], [x + w / 2 * 0.8, bot], [x - w / 2 * 0.8, bot]], pal[i % 4]));
    for (let y = top + 6; y < bot - 4; y += 8) items.push(layer(line([[x - w / 2 - 1, y], [x + w / 2 + 1, y + 2]], pal[(i + 1 + Math.floor(y / 30)) % 4], 4), 1));
    for (let k = 0; k < 5; k++) items.push(layer(line([[x + (k - 2) * 3, bot], [x + (k - 2) * 5, bot + ctx.between(6, 24)]], pal[i % 4], 1.4), 2));
  }
  flush(ctx, items, 1);
  return 'wrapped bundles';
}

function polyphony(ctx) {
  const { pal, ink, paper } = setup(ctx, 5);
  const cols = ctx.int(7, 9);
  const rows = ctx.int(10, 13);
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (i * W) / cols;
    const y = Y0 + (j * H) / rows;
    items.push(poly(rp(x + 1, y + 1, W / cols - 2, H / rows - 2), pal[mod(i * 2 + j + Math.floor(j / 3), 5)]));
    if ((i + j) % 3 === 0) items.push(layer(circ(x + W / cols / 2, y + H / rows / 2, 2.2, paper), 1));
  }
  flush(ctx, items, 3);
  return 'polyphony';
}

function castleAndSun(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [layer(circ(ctx.between(X0 + 40, X1 - 40), Y0 + ctx.between(40, 70), ctx.between(22, 34), pal[0]), 0)];
  let y = Y1 - 6;
  for (let k = 0; k < ctx.int(5, 8); k++) {
    const w = ctx.between(40, 120);
    const h = ctx.between(20, 44);
    const x = ctx.between(X0 + 4, X1 - w - 4);
    items.push(layer(poly(rp(x, y - h, w, h), pal[1 + (k % 4)]), 1 + k));
    if (k % 2) items.push(layer(poly([[x, y - h], [x + w / 2, y - h - ctx.between(12, 26)], [x + w, y - h]], pal[2 + (k % 3)]), 1 + k));
    else items.push(layer(poly(rp(x + w * 0.4, y - h * 0.6, w * 0.2, h * 0.6), ink), 2 + k));
    y -= h * 0.8;
  }
  flush(ctx, items, 1);
  return 'castle and sun';
}

function smallLandscape(ctx) {
  const { pal, ink, paper } = setup(ctx, 4, ctx.colors[1]);
  const items = [];
  const w = ctx.between(70, 100);
  const h = w * ctx.between(0.7, 1);
  const x = ctx.between(X0 + 20, X1 - w - 20);
  const y = ctx.between(Y0 + 80, Y1 - h - 80);
  items.push(poly(rp(x, y, w, h), pal[0]));
  for (let k = 0; k < 3; k++) items.push(layer(poly(rp(x, y + h * (0.4 + k * 0.2), w, h * 0.2), pal[1 + k]), 1));
  items.push(layer(circ(x + w * ctx.between(0.3, 0.7), y + h * 0.28, 4, paper), 2));
  flush(ctx, items, 1);
  return 'small landscape';
}

function interlacedBands(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const n = ctx.int(3, 4);
  const strands = [];
  const gap = (W - 30) / n;
  for (let i = 0; i < n; i++) {
    const x = X0 + 15 + i * gap + gap / 2;
    strands.push([[x - gap * 0.8, Y0 + 14], [x + gap * 0.2, Y0 + 14], [x + gap * 0.2, Y1 - 14], [x - gap * 0.8, Y1 - 14], [x - gap * 0.8, Y0 + 14]]);
    strands.push([[X0 + 14, Y0 + 20 + i * 66 + 40], [X1 - 14, Y0 + 20 + i * 66 + 40]]);
  }
  chunk(ctx, weave(strands, 10, (i) => pal[i % 4], ink), 14);
  return 'interlaced bands';
}

function ornamentSampler(ctx) {
  const { pal, ink } = setup(ctx, 5, ctx.colors[1]);
  const items = [];
  const cols = 2;
  const rows = 3;
  const cw = W / cols;
  const ch = H / rows;
  const kinds = [0, 1, 2, 3, 4, 5].sort(() => ctx.rand() - 0.5);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = X0 + (i + 0.5) * cw;
    const cy = Y0 + (j + 0.5) * ch;
    const r = Math.min(cw, ch) * 0.42;
    const k = kinds[i + j * cols];
    items.push(poly(rp(cx - r, cy - r, r * 2, r * 2), pal[mod(i + j, 2)]));
    if (k === 0) for (let q = 0; q < 8; q++) items.push(layer(ell(...pol(cx, cy, r * 0.5, (q * TAU) / 8), r * 0.36, r * 0.12, (q * TAU) / 8, pal[2]), 1));
    else if (k === 1) items.push(layer(poly(starPoints(cx, cy, r * 0.9, r * 0.4, 8, 0), pal[3]), 1));
    else if (k === 2) for (let q = -2; q <= 2; q++) items.push(layer(line([[cx - r * 0.9, cy + q * r * 0.35], [cx + r * 0.9, cy + q * r * 0.35 - r * 0.3]], pal[4], 2), 1));
    else if (k === 3) for (let q = 0; q < 4; q++) items.push(layer(circ(cx, cy, r * (0.9 - q * 0.22), pal[2 + (q % 3)]), 1 + q));
    else if (k === 4) items.push(layer(line(Array.from({ length: 30 }, (_, q) => pol(cx, cy, r * 0.9 * (1 - q / 32), (q / 29) * TAU * 2)), pal[3], 3), 1));
    else for (let q = 0; q < 4; q++) items.push(layer(poly([[cx - r + q * r * 0.5, cy + r * 0.8], [cx - r * 0.75 + q * r * 0.5, cy - r * 0.6], [cx - r * 0.5 + q * r * 0.5, cy + r * 0.8]], pal[2 + (q % 2)]), 1));
  }
  flush(ctx, items, 1);
  return 'ornament sampler';
}

function femmageFan(ctx) {
  const { pal, ink, paper } = setup(ctx, 5);
  const n = ctx.int(7, 10);
  const items = [];
  const O = [CX, Y1 - 20];
  const R = 190;
  const a0 = Math.PI * 1.08;
  const a1 = Math.PI * 1.92;
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const b = a0 + ((a1 - a0) * (i + 1)) / n;
    items.push(poly(arcBand(O[0], O[1], 20, R, a, b, 6), pal[i % 5]));
    const m = (a + b) / 2;
    const kind = i % 3;
    for (let k = 0; k < 7; k++) {
      const r = 50 + k * 20;
      if (kind === 0) items.push(layer(circ(...pol(O[0], O[1], r, m), 3.4, paper), 1));
      else if (kind === 1) items.push(layer(line([pol(O[0], O[1], r - 6, m), pol(O[0], O[1], r + 6, m)], ink, 2), 1));
      else items.push(layer(poly([pol(O[0], O[1], r - 5, m - 0.03), pol(O[0], O[1], r + 5, m), pol(O[0], O[1], r - 5, m + 0.03)], paper), 1));
    }
  }
  flush(ctx, items, 1);
  return 'collage fan';
}

function stripSampler(ctx) {
  const { pal, ink, paper } = setup(ctx, 5);
  const n = ctx.int(5, 7);
  const items = [];
  let x = X0;
  for (let i = 0; i < n; i++) {
    const w = (W / n) * ctx.between(0.7, 1.3);
    const ww = Math.min(w, X1 - x);
    if (ww < 6) break;
    items.push(poly(rp(x, Y0, ww, H), pal[i % 5]));
    const k = i % 4;
    for (let y = Y0 + 8; y < Y1 - 4; y += 14) {
      if (k === 0) items.push(layer(circ(x + ww / 2, y, ww * 0.18, paper), 1));
      else if (k === 1) items.push(layer(line([[x + 3, y], [x + ww - 3, y + 6]], ink, 2), 1));
      else if (k === 2) items.push(layer(poly([[x + ww / 2, y - 6], [x + ww - 4, y + 4], [x + 4, y + 4]], paper), 1));
      else items.push(layer(poly(rp(x + ww * 0.3, y - 4, ww * 0.4, 8), pal[(i + 2) % 5]), 1));
    }
    x += ww;
  }
  flush(ctx, items, 3);
  return 'print strips';
}

function beadedBands(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const r = ctx.between(3.6, 5);
  const rows = Math.floor(H / (r * 2));
  for (let j = 0; j < rows; j++) {
    const band = Math.floor(j / 4);
    for (let x = X0 + r; x < X1; x += r * 2) {
      const i = Math.round((x - X0) / (r * 2));
      const v = band % 3 === 0 ? mod(i + j, 4) < 2 : band % 3 === 1 ? Math.abs(mod(i, 8) - 4) + Math.abs(mod(j, 4) - 2) < 3 : mod(i, 3) !== 0;
      items.push(circ(x + (j % 2 ? r : 0), Y0 + r + j * r * 2, r * 0.9, v ? pal[mod(band + 2, 5)] : pal[mod(band, 2)]));
    }
  }
  flush(ctx, items.filter((it) => K.inFrame(it.b)), 3);
  return 'beaded bands';
}

function tapestryBlocks(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = ctx.int(3, 4);
  const rows = ctx.int(5, 7);
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (i * W) / cols;
    const y = Y0 + (j * H) / rows;
    const w = W / cols;
    const h = H / rows;
    items.push(poly(rp(x + 1, y + 1, w - 2, h - 2), pal[mod(i + j, 2)]));
    hatchRect(x + 1, y + 1, w - 2, h - 2, mod(i + j, 2) ? Math.PI / 4 : -Math.PI / 4, 3.6).forEach((seg) => items.push(layer(line(seg, pal[2 + mod(i * j, 2)], 1.4), 1)));
  }
  flush(ctx, items, 3);
  return 'tapestry blocks';
}

function foldedPaperCut(ctx) {
  const { pal, ink, paper } = setup(ctx, 4);
  const n = ctx.pick([6, 8, 10]);
  const items = [circ(CX, CY, 106, pal[0])];
  const motif = [];
  for (let k = 0; k < ctx.int(3, 5); k++) motif.push({ r: ctx.between(24, 90), w: ctx.between(0.08, 0.22), len: ctx.between(16, 30) });
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n;
    motif.forEach((m, k) => {
      for (const s of [-1, 1]) {
        const p = pol(CX, CY, m.r, a + s * m.w);
        items.push(layer(ell(p[0], p[1], m.len, m.len * 0.3, a + s * m.w, k % 2 ? pal[1] : paper), 1 + k));
      }
    });
    items.push(layer(circ(...pol(CX, CY, 96, a), 4, paper), 1));
  }
  items.push(layer(circ(CX, CY, 8, paper), 6));
  flush(ctx, items, 1);
  return 'folded paper cut';
}

function omegaPanels(ctx) {
  const { pal, ink } = setup(ctx, 5, ctx.colors[1]);
  const items = [];
  const blocks = ctx.int(5, 8);
  for (let i = 0; i < blocks; i++) {
    const w = ctx.between(50, 120);
    const h = ctx.between(50, 130);
    const x = ctx.between(X0 + 6, X1 - w - 6);
    const y = ctx.between(Y0 + 6, Y1 - h - 6);
    items.push(layer(poly(rp(x, y, w, h), pal[i % 5]), i));
    for (let k = 0; k < 5; k++) items.push(layer(line([[x + ctx.between(0, w * 0.5), y + ctx.between(0, h)], [x + ctx.between(w * 0.5, w), y + ctx.between(0, h)]], pal[(i + 2) % 5], 2.4), i));
  }
  flush(ctx, items, 1);
  return 'painted panels';
}

function roundedHills(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const items = [];
  const n = ctx.int(3, 5);
  for (let i = 0; i < n; i++) {
    const cx = X0 + ((i + 0.5) * W) / n + ctx.between(-14, 14);
    const r = ctx.between(60, 110);
    const top = Y1 - ctx.between(60, 150);
    items.push(layer(circ(cx, top + r, r, pal[i % 4 + (i % 4 > 2 ? 0 : 0)]), i));
  }
  for (let k = 0; k < 2; k++) {
    const x = ctx.between(X0 + 20, X1 - 20);
    const h = ctx.between(60, 110);
    items.push(layer(line([[x, Y1 - 4], [x, Y1 - h]], pal[4], 12), 8), layer(line([[x, Y1 - h * 0.5], [x + 16, Y1 - h * 0.5], [x + 16, Y1 - h * 0.8]], pal[4], 8), 8));
  }
  items.push(layer(circ(X1 - 40, Y0 + 44, 18, pal[3]), 9));
  flush(ctx, items, 1);
  return 'rounded hills';
}

function littleImages(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const s = ctx.between(15, 19);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (W - cols * s) / 2 + (i + 0.5) * s;
    const y = Y0 + (H - rows * s) / 2 + (j + 0.5) * s;
    const t = ctx.int(0, 5);
    const c = pal[ctx.int(0, 3)];
    const r = s * 0.32;
    if (t === 0) items.push(line([[x - r, y - r], [x + r, y + r]], c, 2));
    else if (t === 1) items.push(line([[x - r, y + r], [x, y - r], [x + r, y + r]], c, 2));
    else if (t === 2) items.push(ring(x, y, r * 0.7, c, 2));
    else if (t === 3) items.push(line([[x - r, y], [x + r, y], [x + r, y + r]], c, 2));
    else if (t === 4) items.push(line([[x, y - r], [x, y + r]], c, 2), line([[x - r, y], [x + r, y]], c, 2));
    else items.push(circ(x, y, 1.8, c));
  }
  flush(ctx, items, 3);
  return 'little images';
}

function loopedWire(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const items = [];
  const n = ctx.int(2, 3);
  for (let k = 0; k < n; k++) {
    const x = X0 + ((k + 0.5) * W) / n;
    const top = Y0 + ctx.between(0, 20);
    items.push(layer(line([[x, Y0], [x, top + 10]], pal[0], 1.4), 0));
    let y = top + 10;
    const lobes = ctx.int(4, 6);
    for (let l = 0; l < lobes; l++) {
      const rx = (W / n) * (0.2 + 0.18 * Math.sin((l / lobes) * Math.PI));
      const ry = ctx.between(24, 34);
      items.push(layer(ell(x, y + ry, rx, ry, 0, pal[1 + (l % 2)]), 1 + l * 2));
      items.push(layer(ell(x, y + ry, rx * 0.78, ry * 0.8, 0, pal[3]), 2 + l * 2));
      y += ry * 1.3;
    }
  }
  flush(ctx, items, 1);
  return 'looped wire';
}

function boxedAssemblage(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const cols = ctx.int(3, 4);
  const rows = ctx.int(4, 5);
  const bw = W / cols;
  const bh = H / rows;
  const items = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + i * bw;
    const y = Y0 + j * bh;
    items.push(poly(rp(x + 2, y + 2, bw - 4, bh - 4), ink));
    items.push(layer(poly(rp(x + 5, y + 5, bw - 10, bh - 10), pal[0], 0.35 + ((i + j) % 3) * 0.2), 1));
    const cx = x + bw / 2;
    const cy = y + bh / 2;
    const t = ctx.int(0, 3);
    if (t === 0) items.push(layer(circ(cx, cy, Math.min(bw, bh) * 0.28, pal[1], 0.8), 2));
    else if (t === 1) items.push(layer(poly([[cx - bw * 0.25, cy + bh * 0.3], [cx, cy - bh * 0.3], [cx + bw * 0.25, cy + bh * 0.3]], pal[1], 0.8), 2));
    else if (t === 2) for (let q = 0; q < 3; q++) items.push(layer(poly(rp(cx - bw * 0.3 + q * bw * 0.22, cy - bh * 0.25, bw * 0.1, bh * 0.5), pal[1], 0.8), 2));
    else items.push(layer(line([[x + 6, y + bh - 8], [x + bw - 6, y + 8]], pal[2], 3), 2));
  }
  flush(ctx, items, 1);
  return 'boxed assemblage';
}

module.exports = {
  primordialPetals, altarpiece, dualityDiscs, circlesAndBars, verticalHorizontal, simultaneousFabric, dabRings, dabColumns,
  pendulumWeb, luminousPeak, wrappedBundles, polyphony, castleAndSun, smallLandscape, interlacedBands, ornamentSampler, femmageFan,
  stripSampler, beadedBands, tapestryBlocks, foldedPaperCut, omegaPanels, roundedHills, littleImages, loopedWire, boxedAssemblage
};
