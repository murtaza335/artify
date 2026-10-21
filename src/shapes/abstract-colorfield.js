'use strict';

// Colour field and gesture: a zip field, poured veils, unfurled rivulets, a spray gradient, black strokes, an
// elegy, open-centre blots, a jagged field, push and pull, a burst under a disc, a near-black cross, pale
// bands, interacting squares, a colour wheel, an aperture of light, a soft horizon, a stepped gradient, a
// colour chart, a splatter storm, a halo circle, a diagonal glow, scraped paint, a drip curtain, a scumbled
// square, layered washes and a nail field.

const { TAU, fmt, pol, rotRect, arcBand, dotField } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, ground, batcher, polyline, veil, glow, X0, Y0, X1, Y1, CX, CY } = K;

const dot = (x, y, r, c) => `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${c}"/>`;

// A rectangle with soft edges: the same rectangle stacked at low opacity, a little smaller each time.
function softRect(ctx, x, y, w, h, color, layers = 5, opacity = 0.28) {
  for (let k = 0; k < layers; k++) {
    const d = k * 3;
    veil(ctx, R(x + d, y + d, Math.max(1, w - 2 * d), Math.max(1, h - 2 * d)), color, opacity);
  }
}

function zipField(ctx) {
  const [bg, zip, zip2] = hues(ctx, 3, []);
  panel(ctx, bg);
  const x = ctx.between(60, 180);
  ctx.poly(R(x, Y0, ctx.between(5, 10), 298), zip, still);
  if (ctx.rand() < 0.6) ctx.poly(R(ctx.between(24, 216), Y0, 3, 298), zip2, still);
  ctx.poly(R(X0, Y0, 212, 3), zip, still);
  return 'zip field';
}

function pouredVeils(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const x = 30 + i * (180 / (n - 1)) + ctx.between(-10, 10);
    const w = ctx.between(30, 60);
    const top = ctx.between(50, 120);
    const pts = [[x - w / 2, top], [x + w / 2, top + ctx.between(-10, 10)], [x + w * 0.7, Y1], [x - w * 0.7, Y1]];
    veil(ctx, pts, pal[i % 5], 0.42);
  }
  return 'poured veils';
}

function unfurledRivulets(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 7, [bg]);
  for (const side of [-1, 1]) {
    const n = ctx.int(5, 7);
    for (let i = 0; i < n; i++) {
      const x0 = side < 0 ? X0 + i * 9 : X1 - i * 9;
      const x1 = side < 0 ? X0 + 40 + i * 14 : X1 - 40 - i * 14;
      ctx.poly([[x0, Y1], [x0 + side * -7, Y1], [x1 + side * -7, Y0 + 40 + i * 10], [x1, Y0 + 40 + i * 10]], pal[(i + (side > 0 ? 3 : 0)) % 7], { inset: 1, still: true });
    }
  }
  return 'unfurled rivulets';
}

function sprayGradient(ctx) {
  const [bg, a, b] = hues(ctx, 3, []);
  panel(ctx, bg);
  const dir = ctx.int(0, 2);
  dotField(ctx, [X0, Y0, 212, 298], 7, (x, y) => {
    const t = dir === 0 ? (y - Y0) / 298 : dir === 1 ? (x - X0) / 212 : Math.hypot(x - CX, y - CY) / 180;
    return 0.6 + t * 2.6;
  }, (x, y, i, j) => ((i * 7 + j * 3) % 5 === 0 ? b : a), 7);
  return 'spray gradient';
}

function blackStrokes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const ink = ctx.ink;
  const n = ctx.int(4, 6);
  for (let i = 0; i < n; i++) {
    const [x, y] = [ctx.between(30, 210), ctx.between(70, 330)];
    const a = ctx.pick([0, Math.PI / 2, ctx.between(-0.8, 0.8)]);
    const len = ctx.between(110, 220);
    const w = ctx.between(14, 30);
    const pts = rotRect(x, y, len, w, a).map(([px, py]) => [px + ctx.between(-4, 4), py + ctx.between(-4, 4)]);
    ctx.poly(pts, ink, { inset: 1, still: true });
  }
  if (ctx.rand() < 0.5) ctx.poly(rotRect(ctx.between(50, 190), ctx.between(80, 320), 40, 16, ctx.between(0, 3)), hues(ctx, 1, [bg, ink])[0], still);
  return 'black strokes';
}

function elegy(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const ink = ctx.ink;
  const [accent] = hues(ctx, 1, [bg, ink]);
  const y = ctx.between(170, 230);
  const n = ctx.int(2, 3);
  for (let i = 0; i <= n; i++) ctx.poly(R(X0 + 10 + i * (192 / n) - 9, y - 110, 18, 220), ink, { inset: 1 });
  for (let i = 0; i < n; i++) ctx.ellipse(X0 + 10 + (i + 0.5) * (192 / n), y + ctx.between(-30, 30), 192 / n / 2 - 2, ctx.between(36, 56), ink, ctx.between(-0.1, 0.1));
  ctx.poly(R(X0, Y1 - 30, 212, 30), accent, still);
  return 'elegy';
}

function openCentreBlots(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  for (let i = 0; i < 26; i++) {
    const side = ctx.int(0, 3);
    const t = ctx.rand();
    const [x, y] = side === 0 ? [X0 + t * 212, Y0 + ctx.between(0, 50)] : side === 1 ? [X0 + t * 212, Y1 - ctx.between(0, 50)] : side === 2 ? [X0 + ctx.between(0, 40), Y0 + t * 298] : [X1 - ctx.between(0, 40), Y0 + t * 298];
    const r = ctx.between(8, 24);
    const pts = Array.from({ length: 8 }, (_, k) => pol(x, y, r * ctx.between(0.6, 1.3), (k * TAU) / 8));
    ctx.poly(pts, pal[i % 5], { inset: 1 });
  }
  return 'open-centre blots';
}

function jaggedField(ctx) {
  const pal = hues(ctx, 4, []);
  panel(ctx, pal[0]);
  for (let k = 1; k < 4; k++) {
    let x = X0 + k * 53 + ctx.between(-20, 20);
    const left = [];
    for (let y = Y0; y <= Y1; y += ctx.between(10, 30)) {
      x += ctx.between(-14, 14);
      left.push([x, y]);
    }
    left.push([x, Y1]);
    ctx.poly([...left, [X1, Y1], [X1, Y0]], pal[k], { inset: 1, still: true });
  }
  ctx.poly([[ctx.between(40, 180), Y0], [ctx.between(40, 180), ctx.between(150, 300)]].concat([[ctx.between(40, 180) + 4, Y0]]), ctx.colors[1] === pal[0] ? ctx.ink : ctx.colors[1], { inset: 1, still: true });
  return 'jagged field';
}

function pushPull(ctx) {
  const [bg, ...pal] = hues(ctx, 5, []);
  panel(ctx, bg);
  for (let i = 0; i < 4; i++) softRect(ctx, ctx.between(X0, 150), ctx.between(Y0, 260), ctx.between(60, 110), ctx.between(60, 120), pal[i % 4], 3, 0.35);
  for (let i = 0; i < 3; i++) {
    const [w, h] = [ctx.between(40, 80), ctx.between(40, 90)];
    ctx.poly(R(ctx.between(X0 + 10, X1 - w - 10), ctx.between(Y0 + 10, Y1 - h - 10), w, h), pal[(i + 1) % 4], still);
  }
  return 'push and pull';
}

function burstUnderDisc(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [disc, halo] = hues(ctx, 2, [bg, ctx.ink]);
  const dy = ctx.between(100, 130);
  glow(ctx, CX, dy, 52, halo, 0.35);
  ctx.circ(CX, dy, 38, disc);
  const cy = ctx.between(250, 280);
  const b = batcher(ctx, 6);
  for (let i = 0; i < 26; i++) {
    const a = ctx.between(0, TAU);
    const pts = [[CX + ctx.between(-8, 8), cy + ctx.between(-8, 8)]];
    let [x, y] = pts[0];
    for (let s = 0; s < 5; s++) {
      x += Math.cos(a + ctx.between(-0.6, 0.6)) * ctx.between(6, 14);
      y += Math.sin(a + ctx.between(-0.6, 0.6)) * ctx.between(6, 14);
      pts.push([x, y]);
    }
    b.add(`<path d="${K.pathOf(pts)}" fill="none" stroke="${ctx.ink}" stroke-width="${fmt(ctx.between(2, 5))}" stroke-linecap="round"/>`, CX - 80, cy - 80, CX + 80, cy + 80);
  }
  b.flush();
  return 'burst under a disc';
}

function nearBlackCross(ctx) {
  const shades = ctx.kind === 'light' ? ['#1A2530', '#202C38', '#26323F'] : ['#16242C', '#1D2C35', '#25343E'];
  const bg = shades[0];
  panel(ctx, bg);
  const w = 212 / 3;
  const h = 298 / 3;
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (i === 1 || j === 1) ctx.poly(R(X0 + i * w, Y0 + j * h, w + 0.5, h + 0.5), shades[i === 1 && j === 1 ? 2 : 1], still);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (i !== 1 && j !== 1) ctx.poly(R(X0 + i * w + 6, Y0 + j * h + 6, w - 12, h - 12), shades[0], still);
  return 'near-black cross';
}

function paleBands(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg, ctx.ink]);
  const n = ctx.int(6, 10);
  const h = 298 / n;
  for (let i = 0; i < n; i++) if (i % 2) veil(ctx, R(X0, Y0 + i * h, 212, h), pal[(i >> 1) % 3], 0.35);
  const b = batcher(ctx, 99);
  for (let i = 1; i < n; i++) b.add(`<line x1="${X0 + 8}" y1="${fmt(Y0 + i * h)}" x2="${X1 - 8}" y2="${fmt(Y0 + i * h)}" stroke="${ctx.ink}" stroke-width=".6"/>`, X0, Y0 + i * h, X1, Y0 + i * h);
  b.flush();
  return 'pale bands';
}

function interactingSquares(ctx) {
  const [a, b, mid] = hues(ctx, 3, []);
  panel(ctx, a);
  ctx.poly(R(CX, Y0, X1 - CX, 298), b, still);
  for (const [x, y] of [[(X0 + CX) / 2, CY - 50], [(CX + X1) / 2, CY - 50], [(X0 + CX) / 2, CY + 60], [(CX + X1) / 2, CY + 60]]) ctx.poly(R(x - 18, y - 18, 36, 36), mid, still);
  ctx.poly(R(CX - 3, CY - 120, 6, 240), mid, still);
  return 'interacting squares';
}

function colorWheel(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 8, []).filter((c) => c !== bg);
  const n = 12;
  const rot = ctx.between(0, TAU);
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    ctx.poly(arcBand(CX, CY, 60, 96, a, a + TAU / n, 4), pal[i % pal.length], { inset: 0.97, still: true });
    ctx.poly(arcBand(CX, CY, 30, 58, a + TAU / n / 2, a + TAU / n * 1.5, 3), pal[(i + 4) % pal.length], { inset: 0.95, still: true });
  }
  ctx.circ(CX, CY, 26, pal[0]);
  return 'colour wheel';
}

function apertureLight(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const [light] = hues(ctx, 1, [bg]);
  const [w, h] = [ctx.between(100, 150), ctx.between(140, 200)];
  for (let k = 8; k >= 0; k--) {
    const d = k * 7;
    veil(ctx, R(CX - w / 2 - d, CY - h / 2 - d, w + 2 * d, h + 2 * d), light, k ? 0.1 : 1);
  }
  return 'aperture of light';
}

function softHorizon(ctx) {
  const pal = hues(ctx, 3, []);
  panel(ctx, pal[0]);
  const y = ctx.between(150, 240);
  softRect(ctx, X0 - 6, y, 224, Y1 - y + 10, pal[1], 6, 0.3);
  softRect(ctx, X0 + 16, Y0 + 20, 180, y - Y0 - 40, pal[2], 6, 0.25);
  return 'soft horizon';
}

function stepGradient(ctx) {
  const [a, b] = hues(ctx, 2, []);
  panel(ctx, a);
  const n = ctx.int(8, 12);
  const vertical = ctx.rand() < 0.5;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const rect = vertical ? R(X0, Y0 + (i * 298) / n, 212, 298 / n + 0.5) : R(X0 + (i * 212) / n, Y0, 212 / n + 0.5, 298);
    veil(ctx, rect, b, fmt(t));
  }
  return 'stepped gradient';
}

function colorChart(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 8, []);
  const cols = ctx.int(4, 6);
  const rows = Math.round(cols * 1.4);
  const w = 200 / cols;
  const h = 286 / rows;
  for (let j = 0; j < rows; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < cols; i++) {
      const [x, y] = [X0 + 6 + i * w, Y0 + 6 + j * h];
      b.add(`<rect x="${fmt(x + 2)}" y="${fmt(y + 2)}" width="${fmt(w - 4)}" height="${fmt(h - 4)}" fill="${pal[ctx.int(0, 7)]}"/>`, x, y, x + w, y + h);
    }
    b.flush();
  }
  return 'colour chart';
}

function splatterStorm(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.ink, ctx.col(ctx.int(0, 7))]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  pal.forEach((c, l) => {
    const b = batcher(ctx, 60);
    for (let i = 0; i < 70; i++) {
      const [x, y] = [ctx.between(X0, X1), ctx.between(Y0, Y1)];
      const r = ctx.rand() < 0.1 ? ctx.between(5, 10) : ctx.between(0.8, 3);
      b.add(dot(x, y, r, c), x - r, y - r, x + r, y + r);
      if (ctx.rand() < 0.25) {
        const [ex, ey] = pol(x, y, ctx.between(10, 30), ctx.between(0, TAU));
        b.add(`<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(ex)}" y2="${fmt(ey)}" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/>`, Math.min(x, ex), Math.min(y, ey), Math.max(x, ex), Math.max(y, ey));
      }
    }
    b.flush();
    polyline(ctx, Array.from({ length: 16 }, () => [ctx.between(X0, X1), ctx.between(Y0, Y1)]), c, 1 + l * 0.4, ' opacity=".7"');
  });
  return 'splatter storm';
}

function haloCircle(ctx) {
  const [bg, c, inner] = hues(ctx, 3, []);
  panel(ctx, bg);
  const r = ctx.between(60, 84);
  for (let k = 6; k >= 1; k--) glow(ctx, CX, CY, r + k * 6, c, 0.12);
  ctx.circ(CX, CY, r, c);
  glow(ctx, CX + ctx.between(-10, 10), CY + ctx.between(-10, 10), r * 0.5, inner, 0.6);
  return 'halo circle';
}

function diagonalGlow(ctx) {
  const [a, b, c] = hues(ctx, 3, []);
  panel(ctx, a);
  ctx.poly([[X1, Y0], [X1, Y1], [X0, Y1]], b, still);
  for (let k = 0; k < 6; k++) {
    const d = 10 + k * 8;
    veil(ctx, [[X1 - d, Y0], [X1, Y0], [X1, Y0 + d * 1.4], [X0 + d, Y1], [X0, Y1], [X0, Y1 - d * 1.4]], c, 0.16);
  }
  return 'diagonal glow';
}

function scrapedPaint(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 6, []);
  for (let i = 0; i < 26; i++) {
    const y = ctx.between(Y0, Y1);
    const h = ctx.between(4, 26);
    const x = ctx.between(X0 - 20, CX);
    veil(ctx, R(x, y, ctx.between(100, 240), h), pal[i % 6], fmt(ctx.between(0.55, 0.95)));
  }
  return 'scraped paint';
}

function dripCurtain(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const band = ctx.between(80, 130);
  ctx.poly(R(X0, Y0, 212, band - Y0), pal[0], still);
  const b = batcher(ctx, 6);
  for (let x = X0 + 4; x < X1; x += ctx.between(6, 14)) {
    const len = ctx.between(20, 220);
    const w = ctx.between(2, 6);
    b.add(`<rect x="${fmt(x)}" y="${fmt(band - 2)}" width="${fmt(w)}" height="${fmt(len)}" rx="${fmt(w / 2)}" fill="${pal[0]}"/>` + dot(x + w / 2, band + len, w * 0.8, pal[0]), x, band, x + w, band + len + w);
  }
  b.flush();
  ctx.poly(R(X0, ctx.between(300, 330), 212, 6), pal[1], still);
  return 'drip curtain';
}

function scumbledSquare(ctx) {
  const [bg, c, c2] = hues(ctx, 3, []);
  panel(ctx, bg);
  const s = ctx.between(120, 160);
  const [x0, y0] = [CX - s / 2, CY - s / 2 - 10];
  for (let j = 0; j < 8; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < 30; i++) {
      const [x, y] = [x0 + ctx.between(0, s), y0 + (j + ctx.rand()) * (s / 8)];
      const a = ctx.between(-0.4, 0.4);
      const [ex, ey] = pol(x, y, ctx.between(10, 24), a);
      b.add(`<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(Math.min(x0 + s, ex))}" y2="${fmt(ey)}" stroke="${i % 5 ? c : c2}" stroke-width="${fmt(ctx.between(3, 7))}" stroke-linecap="round" opacity=".85"/>`, x - 4, y - 10, x + 28, y + 10);
    }
    b.flush();
  }
  return 'scumbled square';
}

function layeredWashes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  for (let i = 0; i < 7; i++) {
    const y = ctx.between(Y0 - 20, Y1 - 40);
    const h = ctx.between(40, 110);
    const pts = [];
    for (let x = X0 - 10; x <= X1 + 10; x += 12) pts.push([x, y + Math.sin(x * 0.03 + i) * 8]);
    for (let x = X1 + 10; x >= X0 - 10; x -= 12) pts.push([x, y + h + Math.sin(x * 0.025 + i * 2) * 10]);
    veil(ctx, pts, pal[i % 4], 0.38);
  }
  return 'layered washes';
}

function nailField(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const shadow = ctx.ink;
  const n = K.noise2(ctx.seed);
  const cx = ctx.between(80, 160);
  const cy = ctx.between(140, 260);
  for (let j = 0; j < 14; j++) {
    const b = batcher(ctx, 999);
    for (let i = 0; i < 10; i++) {
      const x = X0 + 11 + i * 21;
      const y = Y0 + 11 + j * 21;
      const a = Math.atan2(y - cy, x - cx) + (n(i * 0.3, j * 0.3) - 0.5);
      const len = 6 + Math.min(10, Math.hypot(x - cx, y - cy) / 14);
      const [ex, ey] = pol(x, y, len, a);
      b.add(`<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(ex)}" y2="${fmt(ey)}" stroke="${shadow}" stroke-width="2" stroke-linecap="round" opacity=".55"/>` + dot(x, y, 2.6, shadow), x - 18, y - 18, x + 18, y + 18);
    }
    b.flush();
  }
  return 'nail field';
}

module.exports = { zipField, pouredVeils, unfurledRivulets, sprayGradient, blackStrokes, elegy, openCentreBlots, jaggedField, pushPull, burstUnderDisc, nearBlackCross, paleBands, interactingSquares, colorWheel, apertureLight, softHorizon, stepGradient, colorChart, splatterStorm, haloCircle, diagonalGlow, scrapedPaint, dripCurtain, scumbledSquare, layeredWashes, nailField };
