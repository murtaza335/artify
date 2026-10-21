'use strict';

// Graphic abstraction from the mid-century to the digital: atomic starbursts, boomerangs, psychedelic rings, a
// groovy sunset, supergraphic stripes, a risograph misprint, glitch slices, a synthwave grid, chrome blobs, a
// torn collage, ragged cut-outs, a comic brushstroke, pool ripples, folk geometry, bold blooms, a wavy checker,
// racing stripes, letter blocks, a squiggle field, isometric blocks, a duotone sun, neon tubes, a paper fold,
// split circles, an aura gradient and brutalist blocks.

const { TAU, fmt, pol, rotRect, arcBand, starPoints, dotField, circleBand } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, ground, batcher, polyline, veil, glow, ring, X0, Y0, X1, Y1, CX, CY } = K;

const dot = (x, y, r, c) => `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${c}"/>`;
const inkOn = (ctx, bg) => (bg === ctx.ink ? ctx.colors[1] : ctx.ink);

function atomicStarbursts(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg, ctx.ink]);
  const n = ctx.int(5, 8);
  for (let i = 0; i < n; i++) {
    const [x, y] = [ctx.between(40, 200), ctx.between(80, 320)];
    const r = ctx.between(16, 36);
    const b = batcher(ctx, 99);
    const rays = ctx.pick([8, 12, 16]);
    for (let k = 0; k < rays; k++) {
      const a = (k * TAU) / rays;
      const [ex, ey] = pol(x, y, r * (k % 2 ? 0.6 : 1), a);
      b.add(`<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(ex)}" y2="${fmt(ey)}" stroke="${i % 2 ? ctx.ink : pal[i % 3]}" stroke-width="2" stroke-linecap="round"/>` + dot(ex, ey, 2.4, i % 2 ? ctx.ink : pal[i % 3]), x - r - 3, y - r - 3, x + r + 3, y + r + 3);
    }
    b.flush();
  }
  for (let i = 0; i < 4; i++) ctx.circ(ctx.between(30, 210), ctx.between(70, 330), ctx.between(5, 10), pal[i % 3]);
  return 'atomic starbursts';
}

function boomerangs(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(5), ctx.col(7)]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const [x, y] = [ctx.between(40, 200), ctx.between(80, 320)];
    const s = ctx.between(26, 44);
    const a = ctx.between(0, TAU);
    const P = ([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s];
    const [p0, p1, p2, p3, p4] = [[-1.2, 0.3], [0, -1.2], [1.2, 0.3], [0, 0.2], [-1.2, 0.3]].map(P);
    ctx.shape(`M${fmt(p0[0])} ${fmt(p0[1])} Q${fmt(p1[0])} ${fmt(p1[1])} ${fmt(p2[0])} ${fmt(p2[1])} Q${fmt(p3[0])} ${fmt(p3[1])} ${fmt(p4[0])} ${fmt(p4[1])}Z`, pal[i % 4], x, y, [x - s * 1.3, y - s * 1.3, x + s * 1.3, y + s * 1.3]);
  }
  for (let i = 0; i < 10; i++) ctx.circ(ctx.between(24, 216), ctx.between(60, 336), 2.4, ctx.ink);
  return 'boomerangs';
}

function psychedelicRings(ctx) {
  const pal = hues(ctx, 5, []);
  panel(ctx, pal[0]);
  const fx = ctx.between(60, 180);
  const fy = ctx.between(100, 300);
  const warp = ctx.between(8, 20);
  for (let k = 16; k >= 1; k--) {
    const pts = Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * TAU;
      return pol(fx, fy, k * 16 + Math.sin(a * 3 + k * 0.6) * warp, a);
    });
    ctx.poly(pts, pal[k % 5], { inset: 1, still: true });
  }
  return 'psychedelic rings';
}

function groovySunset(ctx) {
  const pal = hues(ctx, 5, [ctx.ink]);
  panel(ctx, ctx.colors[1] === pal[0] ? ctx.ink : ctx.colors[1]);
  const base = ctx.between(240, 280);
  for (let k = 5; k >= 1; k--) ctx.poly(arcBand(CX, base, 0, k * 20, Math.PI, TAU, 16), pal[k % 5], { inset: 1, still: true });
  const n = ctx.int(4, 6);
  for (let i = 0; i < n; i++) {
    const y = base + 8 + i * 16;
    ctx.poly(R(X0, y, 212, 10 - i), pal[(i + 1) % 5], still);
  }
  for (let i = 0; i < 3; i++) ctx.poly(R(X0, base - 30 - i * 22, 212, 4), ctx.bg, still);
  return 'groovy sunset';
}

function supergraphicStripes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const turnY = ctx.between(160, 240);
  const r0 = ctx.between(20, 40);
  pal.forEach((c, i) => {
    const w = 18;
    const x = X0 + 20 + i * w;
    const r = r0 + (3 - i) * w;
    const cx = x + r + w;
    const pts = [[x, Y1], [x, turnY], ...Array.from({ length: 9 }, (_, k) => pol(cx, turnY, r + w, Math.PI + (k / 8) * (Math.PI / 2))), [X1, turnY - r - w], [X1, turnY - r], ...Array.from({ length: 9 }, (_, k) => pol(cx, turnY, r, Math.PI * 1.5 - (k / 8) * (Math.PI / 2))), [x + w, turnY], [x + w, Y1]];
    ctx.poly(pts, c, { inset: 1, still: true });
  });
  return 'supergraphic stripes';
}

function risographMisprint(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [a, b] = hues(ctx, 2, [bg]);
  const n = ctx.int(4, 6);
  const shapes = Array.from({ length: n }, () => [ctx.int(0, 2), ctx.between(50, 190), ctx.between(90, 310), ctx.between(26, 54), ctx.between(0, TAU)]);
  [[a, 0, 0], [b, ctx.between(-6, 6), ctx.between(-6, 6)]].forEach(([c, dx, dy], layer) => {
    shapes.forEach(([t, x, y, r, rot], i) => {
      if ((i + layer) % 3 === 2) return;
      const X = x + dx;
      const Y = y + dy;
      if (t === 0) glow(ctx, X, Y, r, c, 0.75);
      else if (t === 1) veil(ctx, rotRect(X, Y, r * 1.8, r * 1.1, rot), c, 0.75);
      else veil(ctx, [pol(X, Y, r, rot), pol(X, Y, r, rot + 2.1), pol(X, Y, r, rot + 4.2)], c, 0.75);
    });
  });
  const g = batcher(ctx, 999);
  for (let i = 0; i < 120; i++) {
    const [x, y] = [ctx.between(X0, X1), ctx.between(Y0, Y1)];
    g.add(dot(x, y, 0.8, a), x - 1, y - 1, x + 1, y + 1);
  }
  g.flush();
  return 'risograph misprint';
}

function glitchSlices(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const r = ctx.between(70, 90);
  const slices = ctx.int(9, 14);
  for (let i = 0; i < slices; i++) {
    const y0 = CY - r + (i * 2 * r) / slices;
    const y1 = y0 + (2 * r) / slices;
    const shift = ctx.rand() < 0.4 ? ctx.between(-40, 40) : 0;
    const band = circleBand(CX, CY, r, y0, y1, 3);
    for (const [c, off] of [[pal[1], -4], [pal[2], 4], [pal[0], 0]]) ctx.poly(band.map(([x, y]) => [x + shift + off, y]), c, { inset: 1, still: true });
  }
  const b = batcher(ctx, 999);
  for (let i = 0; i < 14; i++) {
    const [x, y, w] = [ctx.between(X0, X1 - 40), ctx.between(Y0, Y1), ctx.between(10, 60)];
    b.add(`<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(ctx.between(1, 4))}" fill="${pal[i % 3]}"/>`, x, y, x + w, y + 4);
  }
  b.flush();
  return 'glitch slices';
}

function synthwaveGrid(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const [sun, sun2, grid] = hues(ctx, 3, [bg]);
  const horizon = ctx.between(200, 230);
  const r = ctx.between(56, 70);
  ctx.poly(arcBand(CX, horizon, 0, r, Math.PI, TAU, 18), sun, { inset: 1, still: true });
  for (let i = 0; i < 5; i++) ctx.poly(R(CX - r, horizon - 8 - i * 11, 2 * r, 3 + i * 0.6), bg, still);
  ctx.poly(arcBand(CX, horizon, 0, r * 0.5, Math.PI, TAU, 10), sun2, { inset: 1, still: true });
  const b = batcher(ctx, 999);
  for (let k = -10; k <= 10; k++) b.add(`<line x1="${fmt(CX + k * 6)}" y1="${fmt(horizon)}" x2="${fmt(CX + k * 40)}" y2="${Y1}" stroke="${grid}" stroke-width="1.4"/>`, X0, horizon, X1, Y1);
  b.flush();
  const c = batcher(ctx, 999);
  for (let k = 1; k < 10; k++) {
    const y = horizon + (Y1 - horizon) * (k / 9) ** 1.8;
    c.add(`<line x1="${X0}" y1="${fmt(y)}" x2="${X1}" y2="${fmt(y)}" stroke="${grid}" stroke-width="1.4"/>`, X0, y - 1, X1, y + 1);
  }
  c.flush();
  ctx.poly(R(X0, horizon - 1, 212, 2), grid, still);
  return 'synthwave grid';
}

function chromeBlobs(ctx) {
  const bg = ctx.pick([ctx.col(5), ctx.col(6), ctx.col(7), ctx.ink]);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const n = ctx.int(3, 5);
  for (let i = 0; i < n; i++) {
    const [x, y, r] = [ctx.between(50, 190), ctx.between(90, 310), ctx.between(28, 58)];
    const pts = Array.from({ length: 8 }, (_, k) => pol(x, y, r * ctx.between(0.75, 1.2), (k * TAU) / 8));
    const b = K.boundsOf(pts);
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = `M${fmt(mid(pts[7], pts[0])[0])} ${fmt(mid(pts[7], pts[0])[1])}`;
    pts.forEach((p, k) => {
      const m = mid(p, pts[(k + 1) % 8]);
      d += `Q${fmt(p[0])} ${fmt(p[1])} ${fmt(m[0])} ${fmt(m[1])}`;
    });
    ctx.raw(`<path d="${d}Z" fill="${pal[i % 3]}"/><ellipse cx="${fmt(x - r * 0.3)}" cy="${fmt(y - r * 0.35)}" rx="${fmt(r * 0.32)}" ry="${fmt(r * 0.14)}" fill="#FFFFFF" opacity=".8" transform="rotate(-30 ${fmt(x - r * 0.3)} ${fmt(y - r * 0.35)})"/><circle cx="${fmt(x + r * 0.35)}" cy="${fmt(y + r * 0.3)}" r="${fmt(r * 0.08)}" fill="#FFFFFF" opacity=".7"/>`, x, y, b);
  }
  for (let i = 0; i < 6; i++) ctx.poly(starPoints(ctx.between(30, 210), ctx.between(70, 330), ctx.between(5, 10), 1.5, 4), ctx.colors[1] === bg ? ctx.ink : ctx.colors[1], still);
  return 'chrome blobs';
}

function tornCollage(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const [x, y, w, h, a] = [ctx.between(40, 200), ctx.between(80, 320), ctx.between(60, 130), ctx.between(40, 100), ctx.between(-0.4, 0.4)];
    const edge = [];
    const corners = rotRect(x, y, w, h, a);
    corners.forEach((p, k) => {
      const q = corners[(k + 1) % 4];
      for (let s = 0; s < 6; s++) {
        const t = s / 6;
        edge.push([p[0] + (q[0] - p[0]) * t + ctx.between(-3, 3), p[1] + (q[1] - p[1]) * t + ctx.between(-3, 3)]);
      }
    });
    ctx.raw(`<polygon points="${K.pts(edge.map(([px, py]) => [px + 3, py + 3]))}" fill="${ctx.ink}" opacity=".2"/><polygon points="${K.pts(edge)}" fill="${pal[i % 5]}"/>`, x, y, K.boundsOf(edge));
  }
  return 'torn collage';
}

function raggedCutouts(ctx) {
  const bg = ctx.pick([ctx.col(3), ctx.col(0), ctx.colors[1]]);
  panel(ctx, bg);
  const ink = ctx.ink;
  const [accent] = hues(ctx, 1, [bg, ink]);
  const n = ctx.int(5, 8);
  for (let i = 0; i < n; i++) {
    const y = 70 + i * (250 / n);
    const x = ctx.between(X0, 120);
    const w = ctx.between(60, 160);
    const pts = [[x, y], [x + w, y + ctx.between(-6, 6)], [x + w + ctx.between(-10, 10), y + 22], [x, y + 20 + ctx.between(-4, 4)]];
    ctx.poly(pts, i === 2 ? accent : ink, { inset: 1 });
  }
  ctx.poly(rotRect(ctx.between(60, 180), ctx.between(100, 300), 18, 220, ctx.between(-0.5, 0.5)), ink, { inset: 1 });
  return 'ragged cut-outs';
}

function comicBrushstroke(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [paint, dotC] = hues(ctx, 2, [bg, ctx.ink]);
  dotField(ctx, [X0, Y0, 212, 298], 10, () => 2.2, () => dotC, 6);
  const pts = [];
  const top = [];
  const bot = [];
  for (let t = 0; t <= 1.0001; t += 0.1) {
    const x = 40 + t * 160;
    const y = 280 - t * 170 + Math.sin(t * 6) * 16;
    const w = 26 + Math.sin(t * Math.PI) * 12;
    top.push([x - w * 0.5, y - w]);
    bot.unshift([x + w * 0.5, y + w]);
    pts.push([x, y]);
  }
  const shape = [...top, ...bot];
  ctx.raw(`<polygon points="${K.pts(shape)}" fill="${paint}" stroke="${ctx.ink}" stroke-width="4" stroke-linejoin="round"/>`, CX, CY, K.boundsOf(shape));
  for (let k = 0; k < 4; k++) polyline(ctx, pts.map(([x, y]) => [x + (k - 1.5) * 10, y + (k - 1.5) * 6]), ctx.ink, 2);
  return 'comic brushstroke';
}

function poolRipples(ctx) {
  const bg = ctx.pick([ctx.col(5), ctx.col(2)]);
  panel(ctx, bg);
  const [light, deep] = hues(ctx, 2, [bg]);
  const n = K.noise2(ctx.seed);
  for (let j = 0; j < 14; j++) {
    const pts = [];
    for (let x = X0; x <= X1; x += 6) pts.push([x, Y0 + 10 + j * 22 + Math.sin(x * 0.08 + j * 1.7) * 6 + n(x * 0.03, j * 0.4) * 10]);
    polyline(ctx, pts, j % 3 ? light : deep, j % 3 ? 2.4 : 4);
  }
  return 'pool ripples';
}

function folkGeometry(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const rows = 5;
  const h = 298 / rows;
  for (let j = 0; j < rows; j++) {
    const y = Y0 + j * h;
    const kind = (j + ctx.int(0, 3)) % 4;
    for (let i = 0; i < 4; i++) {
      const x = X0 + i * 53;
      const c = pal[(i + j) % 5];
      if (kind === 0) ctx.circ(x + 26.5, y + h / 2, 20, c);
      else if (kind === 1) ctx.poly([[x + 4, y + h - 6], [x + 26.5, y + 8], [x + 49, y + h - 6]], c, still);
      else if (kind === 2) {
        ctx.circ(x + 26.5, y + h / 2, 22, c);
        ctx.poly(starPoints(x + 26.5, y + h / 2, 14, 6, 8), pal[(i + j + 2) % 5], still);
      } else ctx.poly(R(x + 6, y + 10, 41, h - 20), c, still);
    }
  }
  return 'folk geometry';
}

function boldBlooms(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg, ctx.ink]);
  const n = ctx.int(2, 4);
  for (let i = 0; i < n; i++) {
    const [x, y, r] = [ctx.between(40, 200), ctx.between(80, 320), ctx.between(40, 80)];
    const petals = ctx.int(5, 7);
    const pts = [];
    for (let k = 0; k < petals * 6; k++) {
      const a = (k / (petals * 6)) * TAU;
      pts.push(pol(x, y, r * (0.72 + 0.28 * Math.abs(Math.sin((a * petals) / 2))), a));
    }
    ctx.poly(pts, pal[i % 3], { inset: 1, still: true });
    ctx.circ(x, y, r * 0.3, ctx.ink);
    ctx.circ(x, y, r * 0.14, pal[(i + 1) % 3]);
  }
  return 'bold blooms';
}

function wavyChecker(ctx) {
  const [a, b] = hues(ctx, 2, []);
  panel(ctx, a);
  const amp = ctx.between(6, 14);
  const cols = 8;
  const rows = 11;
  const w = 212 / cols;
  const h = 298 / rows;
  const P = (i, j) => [X0 + i * w + Math.sin(j * 0.7) * amp, Y0 + j * h + Math.sin(i * 0.8) * amp * 0.6];
  for (let j = 0; j < rows; j++) {
    const bat = batcher(ctx, 999);
    for (let i = 0; i < cols; i++) {
      if ((i + j) % 2) continue;
      const quad = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
      bat.add(`<polygon points="${K.pts(quad)}" fill="${b}"/>`, ...K.boundsOf(quad));
    }
    bat.flush();
  }
  return 'wavy checker';
}

function racingStripes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const r0 = ctx.between(20, 40);
  const cx = ctx.between(80, 110);
  const w = 14;
  // Nested L-shaped stripes: each runs in from the left, turns a rounded corner and climbs to the top.
  pal.forEach((c, i) => {
    const yb = 250 + i * w;
    const r = r0 + i * w;
    const outer = Array.from({ length: 10 }, (_, k) => pol(cx, yb - r, r, Math.PI / 2 - (k / 9) * (Math.PI / 2)));
    const inner = Array.from({ length: 10 }, (_, k) => pol(cx, yb - r, r - w + 1, (k / 9) * (Math.PI / 2)));
    ctx.poly([[X0, yb], ...outer, [cx + r, Y0], [cx + r - w + 1, Y0], ...inner, [X0, yb - w + 1]], c, { inset: 1, still: true });
  });
  return 'racing stripes';
}

function letterBlocks(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = [ctx.ink, ...hues(ctx, 2, [bg, ctx.ink])];
  const cell = 70;
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 3; i++) {
      const [x, y] = [X0 + 1 + i * cell, Y0 + 9 + j * cell];
      const c = pal[(i + j) % 3 === 0 ? 1 + ((i + j) % 2) : 0];
      const t = ctx.int(0, 5);
      if (t === 0) ctx.poly(arcBand(x + cell / 2, y + cell / 2, cell * 0.2, cell * 0.45, Math.PI / 4, Math.PI * 1.75, 10), c, { inset: 1, still: true });
      else if (t === 1) {
        ctx.poly(R(x + 8, y + 6, 16, cell - 12), c, still);
        ctx.poly(arcBand(x + 24, y + cell / 2, cell * 0.12, cell * 0.44, -Math.PI / 2, Math.PI / 2, 8), c, { inset: 1, still: true });
      } else if (t === 2) {
        ctx.poly([[x + 6, y + cell - 6], [x + cell / 2 - 6, y + 6], [x + cell / 2 + 6, y + 6], [x + cell - 6, y + cell - 6], [x + cell - 22, y + cell - 6], [x + cell / 2, y + 22], [x + 22, y + cell - 6]], c, still);
      } else if (t === 3) ring(ctx, x + cell / 2, y + cell / 2, cell * 0.32, c, 14);
      else if (t === 4) {
        ctx.poly(R(x + 8, y + 6, 16, cell - 12), c, still);
        ctx.poly(R(x + 8, y + cell - 22, cell - 16, 16), c, still);
      } else ctx.poly([[x + 6, y + 6], [x + 22, y + 6], [x + cell - 6, y + cell - 6], [x + cell - 22, y + cell - 6]], c, still);
    }
  }
  return 'letter blocks';
}

function squiggleField(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(6), ctx.col(5)]);
  panel(ctx, bg);
  const pal = [ctx.ink, ...hues(ctx, 3, [bg, ctx.ink])];
  for (let i = 0; i < 14; i++) {
    const [x, y] = [ctx.between(20, 180), ctx.between(60, 336)];
    const pts = Array.from({ length: 12 }, (_, k) => [x + k * 4, y + (k % 2 ? -5 : 5)]);
    polyline(ctx, pts, pal[i % 4], 3);
  }
  const b = batcher(ctx, 20);
  for (let i = 0; i < 40; i++) {
    const [x, y] = [ctx.between(X0, X1), ctx.between(Y0, Y1)];
    b.add(dot(x, y, ctx.between(2, 5), pal[i % 4]), x - 5, y - 5, x + 5, y + 5);
  }
  b.flush();
  for (let i = 0; i < 4; i++) ctx.poly(rotRect(ctx.between(40, 200), ctx.between(80, 320), 30, 10, ctx.between(0, Math.PI)), pal[1 + (i % 3)], still);
  return 'squiggle field';
}

function isometricBlocks(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const u = 20;
  const P = (i, j, k) => [CX + (i - j) * u * 0.87, 250 + (i + j) * u * 0.5 - k * u];
  const cubes = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const hgt = ctx.int(0, 5);
    for (let k = 0; k < hgt; k++) cubes.push([i, j, k]);
  }
  cubes.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[2] - b[2]);
  for (let s = 0; s < cubes.length; s += 6) {
    const bat = batcher(ctx, 999);
    cubes.slice(s, s + 6).forEach(([i, j, k]) => {
      const top = [P(i, j, k + 1), P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)];
      const left = [P(i, j + 1, k + 1), P(i + 1, j + 1, k + 1), P(i + 1, j + 1, k), P(i, j + 1, k)];
      const right = [P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i + 1, j + 1, k), P(i + 1, j, k)];
      bat.add(`<polygon points="${K.pts(left)}" fill="${pal[1]}"/><polygon points="${K.pts(right)}" fill="${pal[2]}"/><polygon points="${K.pts(top)}" fill="${pal[0]}"/>`, ...K.boundsOf([...top, ...left, ...right]));
    });
    bat.flush();
  }
  return 'isometric blocks';
}

function duotoneSun(ctx) {
  const [a, b] = hues(ctx, 2, []);
  panel(ctx, a);
  const r = ctx.between(70, 90);
  const cy = ctx.between(150, 230);
  const n = 14;
  for (let i = 0; i < n; i++) {
    const y0 = cy - r + (i * 2 * r) / n;
    const h = ((2 * r) / n) * (0.25 + (i / n) * 0.7);
    ctx.poly(circleBand(CX, cy, r, y0, y0 + h, 3), b, { inset: 1, still: true });
  }
  for (let i = 0; i < 6; i++) ctx.poly(R(X0, cy + r + 14 + i * 10, 212, 4 - i * 0.5), b, still);
  return 'duotone sun';
}

function neonTubes(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const tube = (d, c, b) => ctx.raw(`<path d="${d}" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".25"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>`, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, [b[0] - 6, b[1] - 6, b[2] + 6, b[3] + 6]);
  const [x, y, r] = [ctx.between(80, 160), ctx.between(130, 170), ctx.between(34, 50)];
  tube(`M${fmt(x - r)} ${fmt(y)} A${fmt(r)} ${fmt(r)} 0 1 1 ${fmt(x - r + 0.1)} ${fmt(y + 0.1)}`, pal[0], [x - r, y - r, x + r, y + r]);
  const zig = Array.from({ length: 7 }, (_, k) => [40 + k * 27, 250 + (k % 2 ? -22 : 22)]);
  tube(K.pathOf(zig), pal[1], K.boundsOf(zig));
  const tri = [[ctx.between(40, 80), 330], [ctx.between(150, 200), 330], [ctx.between(90, 150), 280]];
  tube(K.pathOf(tri, true), pal[2], K.boundsOf(tri));
  tube(`M${fmt(x - r * 0.5)} ${fmt(y)} L${fmt(x + r * 0.5)} ${fmt(y)}`, pal[1], [x - r, y - 2, x + r, y + 2]);
  return 'neon tubes';
}

function paperFold(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [c] = hues(ctx, 1, [bg, ctx.ink]);
  const folds = ctx.int(5, 7);
  const w = ctx.between(40, 56);
  let [x, y] = [ctx.between(40, 80), Y0 + 10];
  const step = (298 - 20) / folds;
  for (let i = 0; i < folds; i++) {
    const nx = i % 2 ? x - ctx.between(30, 70) : x + ctx.between(30, 70);
    const ny = y + step;
    const quad = [[x, y], [x + w, y], [nx + w, ny], [nx, ny]];
    ctx.poly(quad, c, still);
    ctx.raw(`<polygon points="${K.pts(quad)}" fill="${i % 2 ? '#000000' : '#FFFFFF'}" opacity="${i % 2 ? 0.25 : 0.2}"/>`, (x + nx) / 2 + w / 2, y + step / 2, K.boundsOf(quad));
    x = nx;
    y = ny;
  }
  return 'paper fold';
}

function splitCircles(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const s = 53;
  for (let j = 0; j < 6; j++) {
    const b = batcher(ctx, 999);
    for (let i = 0; i < 4; i++) {
      const [x, y] = [X0 + i * s + s / 2, Y0 + j * s + s / 2 - 10];
      const a = ctx.int(0, 7) * (Math.PI / 4);
      const r = s * 0.42;
      const [p, q] = [pol(x, y, r, a), pol(x, y, r, a + Math.PI)];
      b.add(`<path d="M${fmt(p[0])} ${fmt(p[1])} A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(q[0])} ${fmt(q[1])}Z" fill="${pal[(i + j) % 4]}"/><path d="M${fmt(q[0])} ${fmt(q[1])} A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(p[0])} ${fmt(p[1])}Z" fill="${pal[(i + j + 2) % 4]}"/>`, x - r, y - r, x + r, y + r);
    }
    b.flush();
  }
  return 'split circles';
}

function auraGradient(ctx) {
  const pal = hues(ctx, 4, []);
  panel(ctx, pal[0]);
  const n = ctx.int(3, 5);
  for (let i = 0; i < n; i++) {
    const [x, y, r] = [ctx.between(30, 210), ctx.between(70, 330), ctx.between(70, 120)];
    for (let k = 6; k >= 1; k--) glow(ctx, x, y, (r * k) / 6, pal[1 + (i % 3)], 0.16);
  }
  return 'aura gradient';
}

function brutalistBlocks(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, ctx.ink]);
  const b = batcher(ctx, 999);
  for (let x = X0; x <= X1; x += 26.5) b.add(`<line x1="${fmt(x)}" y1="${Y0}" x2="${fmt(x)}" y2="${Y1}" stroke="${ctx.ink}" stroke-width=".6"/>`, x, Y0, x, Y1);
  b.flush();
  const n = ctx.int(4, 6);
  for (let i = 0; i < n; i++) {
    const w = 26.5 * ctx.int(2, 6);
    const h = ctx.between(20, 70);
    const x = X0 + 26.5 * ctx.int(0, Math.max(0, 8 - w / 26.5));
    const y = ctx.between(Y0, Y1 - h);
    ctx.poly(R(x, y, w, h), i === 0 ? accent : ctx.ink, still);
  }
  ctx.poly(R(X0, ctx.between(300, 330), 212, 6), ctx.ink, still);
  return 'brutalist blocks';
}

module.exports = { atomicStarbursts, boomerangs, psychedelicRings, groovySunset, supergraphicStripes, risographMisprint, glitchSlices, synthwaveGrid, chromeBlobs, tornCollage, raggedCutouts, comicBrushstroke, poolRipples, folkGeometry, boldBlooms, wavyChecker, racingStripes, letterBlocks, squiggleField, isometricBlocks, duotoneSun, neonTubes, paperFold, splitCircles, auraGradient, brutalistBlocks };
