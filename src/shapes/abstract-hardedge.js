'use strict';

// Hard edge, minimal and early computer art, re-imagined: protractor arcs, a stripe maze, uneven targets, a
// spread chevron, colour panels, a curved field, arcs from the corners, incomplete cubes, a pale grid, a
// two-colour blade, polygon variations, serial rows, interruptions, gravel, broken cubes, a box stack, a line
// constellation, triangle truchets, a diagonal maze, stitch patterns, tilted grids, stripe blocks, pinwheel
// squares, twisted squares, dot sizes and a sliced disc.

const { TAU, fmt, pol, rotRect, arcBand, dotField, circleBand } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, ground, batcher, ring, X0, Y0, X1, Y1, CX, CY } = K;

const lineSvg = (x1, y1, x2, y2, c, w) => `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${c}" stroke-width="${fmt(w)}" stroke-linecap="round"/>`;

function protractorArcs(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.ink]);
  panel(ctx, bg);
  const pal = hues(ctx, 6, [bg]);
  const centres = ctx.rand() < 0.5 ? [[CX, 300]] : [[70, 300], [170, 300]];
  centres.forEach(([x, y], c) => {
    const bands = 6;
    const r1 = centres.length === 1 ? 104 : 54;
    for (let i = 0; i < bands; i++) {
      const r0 = (r1 * (bands - i - 1)) / bands;
      ctx.poly(arcBand(x, y, r0 + 2, r0 + r1 / bands, Math.PI, TAU, 12), pal[(i + c * 2) % 6], { inset: 1, still: true });
    }
  });
  ctx.poly(arcBand(CX, 300, 108, 118, Math.PI, TAU, 16), pal[ctx.int(0, 5)], { inset: 1, still: true });
  for (let i = 0; i < 3; i++) ctx.poly(arcBand(CX, 120, 30 + i * 22, 44 + i * 22, 0, Math.PI, 10), pal[(i + 3) % 6], { inset: 1, still: true });
  return 'protractor arcs';
}

function stripeMaze(ctx) {
  const [stripe] = hues(ctx, 1, [ctx.ink]);
  panel(ctx, ctx.ink);
  const ox = ctx.between(60, 180);
  const oy = ctx.between(100, 300);
  for (let k = 0; k < 14; k++) {
    const d = 6 + k * 16;
    const pts = [[ox - d, oy - d], [ox + d, oy - d], [ox + d, oy + d], [ox - d, oy + d], [ox - d, oy - d]];
    K.polyline(ctx, pts, k === 6 ? stripe : ctx.colors[1], 2.2);
  }
  return 'stripe maze';
}

function unevenTarget(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 6, [bg]);
  const cx = CX + ctx.between(-10, 10);
  const cy = CY + ctx.between(-20, 20);
  let r = ctx.between(96, 106);
  let i = 0;
  while (r > 8) {
    ctx.circ(cx, cy, r, i % 2 && ctx.rand() < 0.4 ? bg : pal[i % 6]);
    r -= ctx.between(8, 24);
    i++;
  }
  return 'uneven target';
}

function spreadChevron(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const tip = ctx.between(220, 330);
  const n = ctx.int(4, 6);
  for (let i = n - 1; i >= 0; i--) {
    const w = 14 + i * 16;
    ctx.poly([[X0 - 10, Y0 - 10 + i * 0], [X0 - 10 + w, Y0 - 10], [CX, tip - i * 26 + w * 0.2], [X1 + 10 - w, Y0 - 10], [X1 + 10, Y0 - 10], [CX, tip + 18 - i * 8]], pal[i % 5], still);
  }
  return 'spread chevron';
}

function colorPanels(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 6, []);
  const n = ctx.int(3, 6);
  const ws = Array.from({ length: n }, () => ctx.between(0.6, 1.6));
  const total = ws.reduce((a, b) => a + b, 0);
  let x = X0;
  ws.forEach((w, i) => {
    const pw = (212 * w) / total;
    ctx.poly(R(x, Y0, pw + 0.5, 298), pal[i % 6], still);
    x += pw;
  });
  if (ctx.rand() < 0.5) ctx.poly(R(X0, ctx.between(150, 250), 212, ctx.between(30, 70)), pal[(n + 1) % 6], still);
  return 'colour panels';
}

function curvedField(ctx) {
  const [bg, fg, accent] = hues(ctx, 3, []);
  panel(ctx, bg);
  const up = ctx.rand() < 0.5;
  const y0 = ctx.between(100, 160);
  const sag = ctx.between(60, 140) * (up ? -1 : 1);
  ctx.shape(`M${X0} ${fmt(y0)} Q${CX} ${fmt(y0 + sag * 2)} ${X1} ${fmt(y0)} L${X1} ${Y1} L${X0} ${Y1} Z`, fg, CX, 260, [X0, Math.min(y0, y0 + sag), X1, Y1]);
  ctx.circ(ctx.between(50, 190), y0 - ctx.between(20, 40), ctx.between(10, 18), accent);
  if (ctx.rand() < 0.6) ctx.shape(`M${X0} ${fmt(y0 + 120)} Q${CX} ${fmt(y0 + 120 + sag)} ${X1} ${fmt(y0 + 120)} L${X1} ${Y1} L${X0} ${Y1} Z`, accent, CX, 300, [X0, y0 + 60, X1, Y1]);
  return 'curved field';
}

function arcsFromCorners(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const ink = bg === ctx.ink ? ctx.colors[1] : ctx.ink;
  const pal = hues(ctx, 4, [bg, ink]);
  const corners = [[X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]].filter(() => ctx.rand() < 0.7);
  if (!corners.length) corners.push([X0, Y1]);
  corners.forEach(([x, y], c) => {
    const b = batcher(ctx, 99);
    for (let r = 20; r < 340; r += 14) b.add(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c === 0 ? ink : pal[c]}" stroke-width="1.6"/>`, x - r, y - r, x + r, y + r);
    b.flush();
  });
  return 'arcs from the corners';
}

function incompleteCubes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, ctx.ink]);
  const s = 30;
  const edges = [[[0, 0], [1, 0]], [[1, 0], [1, 1]], [[1, 1], [0, 1]], [[0, 1], [0, 0]], [[0.5, -0.4], [1.5, -0.4]], [[1.5, -0.4], [1.5, 0.6]], [[0, 0], [0.5, -0.4]], [[1, 0], [1.5, -0.4]], [[1, 1], [1.5, 0.6]]];
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 3; i++) {
      const ox = 36 + i * 64;
      const oy = 88 + j * 56;
      const b = batcher(ctx, 99);
      const keep = edges.filter(() => ctx.rand() < 0.6);
      keep.forEach(([[a, c], [d, e]]) => b.add(lineSvg(ox + a * s, oy + c * s, ox + d * s, oy + e * s, (i + j) % 4 === 0 ? accent : ctx.ink, 2.4), ox, oy - 14, ox + 46, oy + 30));
      b.flush();
    }
  }
  return 'incomplete cubes';
}

function paleGrid(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [tint] = hues(ctx, 1, [bg, ctx.ink]);
  for (let i = 0; i < 6; i++) K.veil(ctx, R(X0, Y0 + i * 50, 212, 25), tint, 0.25);
  const b = batcher(ctx, 99);
  for (let x = X0 + 10; x < X1; x += 10) b.add(lineSvg(x, Y0 + 8, x, Y1 - 8, ctx.ink, 0.5), x, Y0, x, Y1);
  b.flush();
  const c = batcher(ctx, 99);
  for (let y = Y0 + 8; y < Y1; y += 6) c.add(lineSvg(X0 + 8, y, X1 - 8, y, ctx.ink, 0.4), X0, y, X1, y);
  c.flush();
  return 'pale grid';
}

function twoColorBlade(ctx) {
  const [a, b] = hues(ctx, 2, []);
  panel(ctx, a);
  const x = ctx.between(60, 180);
  const y = ctx.between(120, 280);
  const k = ctx.int(0, 2);
  if (k === 0) ctx.poly([[x, Y0], [X1, Y0], [X1, Y1], [x - ctx.between(20, 60), Y1]], b, still);
  else if (k === 1) ctx.poly([[X0, y], [X1, y - ctx.between(80, 140)], [X1, Y1], [X0, Y1]], b, still);
  else ctx.poly([[x, Y0], [x + 30, Y0], [x + ctx.between(-60, 60), Y1], [x - 30 + ctx.between(-60, 60), Y1]], b, still);
  // A thin rule of a third colour and one small square keep the blade from being only two pieces.
  const [c] = hues(ctx, 1, [a, b]);
  ctx.poly(R(X0, ctx.between(300, 330), 212, 4), c, still);
  ctx.poly(R(ctx.between(30, 190), ctx.between(70, 110), 14, 14), c, still);
  return 'two-colour blade';
}

function polygonVariations(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 6, [bg]);
  // Regular polygons from octagon down to triangle, all standing on the same edge, largest first.
  const side = ctx.between(52, 60);
  const base = ctx.between(280, 310);
  const rot = ctx.between(-0.15, 0.15);
  for (let n = 8; n >= 3; n--) {
    const pts = [[CX - side / 2, base], [CX + side / 2, base]];
    let a = -rot;
    for (let k = 2; k < n; k++) {
      a -= TAU / n;
      const [x, y] = pts[pts.length - 1];
      pts.push([x + side * Math.cos(a), y + side * Math.sin(a)]);
    }
    ctx.poly(pts, pal[n - 3], { inset: 1, still: true });
  }
  ring(ctx, CX, base, 5, ctx.ink, 2);
  return 'polygon variations';
}

function serialRows(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 8, []);
  const cols = 6;
  const rows = 8;
  const w = 212 / cols;
  const h = 298 / rows;
  const step = ctx.int(1, 3);
  for (let j = 0; j < rows; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < cols; i++) b.add(`<rect x="${fmt(X0 + i * w)}" y="${fmt(Y0 + j * h)}" width="${fmt(w + 0.4)}" height="${fmt(h + 0.4)}" fill="${pal[(i + j * step) % 8]}"/>`, X0 + i * w, Y0 + j * h, X0 + i * w + w, Y0 + j * h + h);
    b.flush();
  }
  return 'serial rows';
}

function interruptions(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const n = K.noise2(ctx.seed);
  const s = 12;
  const holes = Array.from({ length: 4 }, () => [ctx.between(30, 210), ctx.between(70, 330), ctx.between(20, 46)]);
  for (let y = Y0 + s; y < Y1; y += s * 3) {
    const b = batcher(ctx, 999);
    for (let yy = y; yy < Math.min(Y1, y + s * 3); yy += s) {
      for (let x = X0 + s / 2; x < X1; x += s) {
        if (holes.some(([hx, hy, hr]) => Math.hypot(x - hx, yy - hy) < hr)) continue;
        const a = (n(x * 0.03, yy * 0.03) - 0.5) * 3 + Math.PI / 2;
        const [dx, dy] = [Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55];
        b.add(lineSvg(x - dx, yy - dy, x + dx, yy + dy, ctx.ink, 1.4), x - 7, yy - 7, x + 7, yy + 7);
      }
    }
    b.flush();
  }
  return 'interruptions';
}

function gravel(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, ctx.ink]);
  const s = 17;
  const cols = 10;
  const rows = 15;
  for (let j = 0; j < rows; j++) {
    const b = batcher(ctx, 99);
    const t = j / (rows - 1);
    for (let i = 0; i < cols; i++) {
      const x = 35 + i * s + (ctx.rand() - 0.5) * t * 14;
      const y = 72 + j * s + (ctx.rand() - 0.5) * t * 14;
      const rot = (ctx.rand() - 0.5) * t * 90;
      b.add(`<rect x="${fmt(x - s / 2)}" y="${fmt(y - s / 2)}" width="${s}" height="${s}" fill="none" stroke="${j === rows - 1 && i % 3 === 0 ? accent : ctx.ink}" stroke-width="1.3" transform="rotate(${fmt(rot)} ${fmt(x)} ${fmt(y)})"/>`, x - s, y - s, x + s, y + s);
    }
    b.flush();
  }
  return 'gravel';
}

function brokenCubes(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 3, [ctx.ink]);
  const n = ctx.int(3, 5);
  for (let k = 0; k < n; k++) {
    const cx = ctx.between(60, 180);
    const cy = 80 + k * (250 / n) + ctx.between(0, 30);
    const s = ctx.between(26, 44);
    const rot = ctx.between(0, TAU);
    const cube = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) cube.push([x, y, z]);
    const P = ([x, y, z]) => {
      const xr = x * Math.cos(rot) - z * Math.sin(rot);
      const zr = x * Math.sin(rot) + z * Math.cos(rot);
      const yr = y * Math.cos(0.5) - zr * Math.sin(0.5);
      return [cx + xr * s, cy + yr * s];
    };
    const b = batcher(ctx, 99);
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        const d = cube[i].reduce((acc, v, q) => acc + (v !== cube[j][q] ? 1 : 0), 0);
        if (d !== 1 || ctx.rand() < 0.3) continue;
        const [a, c] = [P(cube[i]), P(cube[j])];
        b.add(lineSvg(a[0], a[1], c[0], c[1], pal[k % 3], 2), cx - s * 2, cy - s * 2, cx + s * 2, cy + s * 2);
      }
    }
    b.flush();
  }
  return 'broken cubes';
}

function boxStack(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(5), ctx.col(0)]);
  panel(ctx, bg);
  const [box] = hues(ctx, 1, [bg, ctx.ink]);
  const n = ctx.int(6, 9);
  const h = 20;
  const gap = (260 - n * h) / (n - 1);
  for (let i = 0; i < n; i++) {
    const y = 64 + i * (h + gap);
    ctx.poly([[70, y + h], [170, y + h], [186, y + h + 10], [86, y + h + 10]], ctx.ink, still);
    ctx.poly(R(70, y, 100, h), box, still);
    ctx.poly([[170, y], [186, y + 10], [186, y + h + 10], [170, y + h]], ctx.rand() < 0.5 ? ctx.ink : ctx.col(4), still);
  }
  return 'box stack';
}

function lineConstellation(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const ink = ctx.colors[1];
  const [accent] = hues(ctx, 1, [bg, ink]);
  const u = 24;
  const n = 6;
  const P = (i, j) => [CX + (i - j) * u * 0.87, CY - 50 + (i + j) * u * 0.5];
  // An isometric lattice with each edge kept by chance, like a wall drawing of open lines.
  for (let j = 0; j < n; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < n; i++) {
      for (const [di, dj] of [[1, 0], [0, 1]]) {
        if (i + di >= n || j + dj >= n || ctx.rand() < 0.4) continue;
        const [a, c] = [P(i, j), P(i + di, j + dj)];
        b.add(lineSvg(a[0], a[1], c[0], c[1], (i * 3 + j) % 7 === 0 ? accent : ink, 3), Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[0], c[0]), Math.max(a[1], c[1]));
      }
      if (ctx.rand() < 0.12) {
        const [a, c] = [P(i, j), P(i, j)];
        b.add(lineSvg(a[0], a[1], c[0], c[1] + u * 1.2, ink, 3), a[0], a[1], c[0], c[1] + u * 1.2);
      }
    }
    b.flush();
  }
  ctx.poly([P(2, 2), P(3, 2), P(3, 3), P(2, 3)], accent, { inset: 0.9, still: true });
  return 'line constellation';
}

function triangleTruchet(ctx) {
  const pal = hues(ctx, 2, []);
  panel(ctx, pal[0]);
  const s = 35.4;
  for (let j = 0; j < 9; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < 6; i++) {
      const x = X0 + i * s;
      const y = Y0 - 4 + j * s;
      const c = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
      const k = ctx.int(0, 3);
      const tri = [c[k], c[(k + 1) % 4], c[(k + 2) % 4]];
      b.add(`<polygon points="${K.pts(tri)}" fill="${pal[1]}"/>`, x, y, x + s, y + s);
    }
    b.flush();
  }
  return 'triangle truchet';
}

function diagonalMaze(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const ink = bg === ctx.ink ? ctx.colors[1] : ctx.ink;
  const [accent] = hues(ctx, 1, [bg, ink]);
  const s = 15;
  for (let j = 0; j < 20; j += 2) {
    const b = batcher(ctx, 999);
    for (let jj = j; jj < j + 2; jj++) {
      for (let i = 0; i < 15; i++) {
        const x = X0 + i * s;
        const y = Y0 + jj * s;
        const d = ctx.rand() < 0.5;
        b.add(lineSvg(x, d ? y : y + s, x + s, d ? y + s : y, (i + jj) % 11 === 0 ? accent : ink, 2.6), x, y, x + s, y + s);
      }
    }
    b.flush();
  }
  return 'diagonal maze';
}

function stitchPattern(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(2), ctx.col(4)]);
  panel(ctx, bg);
  const [a, c] = hues(ctx, 2, [bg]);
  const s = 12;
  const rowsOn = Array.from({ length: 26 }, () => ctx.rand() < 0.5);
  const colsOn = Array.from({ length: 18 }, () => ctx.rand() < 0.5);
  const h = batcher(ctx, 3);
  rowsOn.forEach((on, j) => {
    let svg = '';
    const y = Y0 + 6 + j * s;
    for (let i = on ? 0 : 1; i < 18; i += 2) svg += lineSvg(X0 + i * s, y, X0 + (i + 1) * s, y, a, 2.4);
    h.add(svg, X0, y - 2, X1, y + 2);
  });
  h.flush();
  const v = batcher(ctx, 3);
  colsOn.forEach((on, i) => {
    let svg = '';
    const x = X0 + 6 + i * s;
    for (let j = on ? 0 : 1; j < 26; j += 2) svg += lineSvg(x, Y0 + j * s, x, Y0 + (j + 1) * s, c, 2.4);
    v.add(svg, x - 2, Y0, x + 2, Y1);
  });
  v.flush();
  return 'stitch pattern';
}

function tiltedGrids(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const n = ctx.int(2, 3);
  for (let g = 0; g < n; g++) {
    const rot = ctx.between(-0.5, 0.5);
    const b = batcher(ctx, 6);
    for (let k = -14; k <= 14; k++) {
      const off = k * 14;
      for (const swap of [0, 1]) {
        const p = swap ? [[-200, off], [200, off]] : [[off, -200], [off, 200]];
        const [[x1, y1], [x2, y2]] = p.map(([x, y]) => [CX + x * Math.cos(rot) - y * Math.sin(rot), CY + x * Math.sin(rot) + y * Math.cos(rot)]);
        b.add(lineSvg(x1, y1, x2, y2, g === 0 ? ctx.ink : pal[g], 0.9), X0, Y0, X1, Y1);
      }
    }
    b.flush();
  }
  return 'tilted grids';
}

function stripeBlocks(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 6, []);
  const cols = 2;
  const rows = 3;
  const w = 212 / cols;
  const h = 298 / rows;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = X0 + i * w;
      const y = Y0 + j * h;
      const vertical = (i + j) % 2 === 0;
      const n = ctx.int(4, 6);
      const [c1, c2] = [pal[(i + j * 2) % 6], pal[(i + j * 2 + 3) % 6]];
      const b = batcher(ctx, 99);
      for (let k = 0; k < n; k++) {
        const f = k / n;
        const svg = vertical ? `<rect x="${fmt(x + f * w)}" y="${fmt(y)}" width="${fmt(w / n + 0.4)}" height="${fmt(h)}" fill="${k % 2 ? c1 : c2}"/>` : `<rect x="${fmt(x)}" y="${fmt(y + f * h)}" width="${fmt(w)}" height="${fmt(h / n + 0.4)}" fill="${k % 2 ? c1 : c2}"/>`;
        b.add(svg, x, y, x + w, y + h);
      }
      b.flush();
    }
  }
  return 'stripe blocks';
}

function pinwheelSquares(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const s = 70.6;
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 3; i++) {
      const x = X0 + i * s;
      const y = Y0 - 4 + j * s;
      const c = [x + s / 2, y + s / 2];
      const corners = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
      const spin = ctx.int(0, 3);
      const b = batcher(ctx, 99);
      for (let k = 0; k < 4; k++) {
        const a = corners[k];
        const m = [(a[0] + corners[(k + 1) % 4][0]) / 2, (a[1] + corners[(k + 1) % 4][1]) / 2];
        b.add(`<polygon points="${K.pts([c, a, m])}" fill="${pal[(k + spin) % 4]}"/>`, x, y, x + s, y + s);
        b.add(`<polygon points="${K.pts([c, m, corners[(k + 1) % 4]])}" fill="${pal[(k + spin + 2) % 4]}"/>`, x, y, x + s, y + s);
      }
      b.flush();
    }
  }
  return 'pinwheel squares';
}

function twistedSquares(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const twist = ctx.between(0.06, 0.12) * ctx.pick([-1, 1]);
  let s = 104;
  let a = 0;
  let i = 0;
  while (s > 6) {
    ctx.poly(rotRect(CX, CY, s * 2, s * 2, a), pal[i % 3], { inset: 1, still: true });
    a += twist;
    s *= 0.9;
    i++;
  }
  return 'twisted squares';
}

function dotSizes(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.ink, ctx.col(ctx.int(0, 7))]);
  panel(ctx, bg);
  const [dot, accent] = hues(ctx, 2, [bg]);
  const mode = ctx.int(0, 2);
  const n = K.noise2(ctx.seed + 3);
  dotField(ctx, [X0, Y0, 212, 298], 17.6, (x, y) => {
    const t = mode === 0 ? (y - Y0) / 298 : mode === 1 ? Math.hypot(x - CX, y - CY) / 180 : n(x * 0.02, y * 0.02);
    return 1 + t * 7.5;
  }, (x, y, i, j) => ((i * 5 + j * 3) % 13 === 0 ? accent : dot), 3);
  return 'dot sizes';
}

function slicedDisc(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 2, [bg]);
  const r = ctx.between(80, 98);
  const n = ctx.int(5, 9);
  const shear = ctx.between(10, 26);
  for (let i = 0; i < n; i++) {
    const y0 = CY - r + (i * 2 * r) / n;
    const y1 = CY - r + ((i + 1) * 2 * r) / n;
    const pts = circleBand(CX, CY, r, y0, y1, 5).map(([x, y]) => [x + (i % 2 ? shear : -shear), y]);
    ctx.poly(pts, pal[i % 2], { inset: 1, still: true });
  }
  return 'sliced disc';
}

module.exports = { protractorArcs, stripeMaze, unevenTarget, spreadChevron, colorPanels, curvedField, arcsFromCorners, incompleteCubes, paleGrid, twoColorBlade, polygonVariations, serialRows, interruptions, gravel, brokenCubes, boxStack, lineConstellation, triangleTruchet, diagonalMaze, stitchPattern, tiltedGrids, stripeBlocks, pinwheelSquares, twistedSquares, dotSizes, slicedDisc };
