'use strict';

// More scenery: rice terraces, iceberg, savanna, fjord, volcano, cabin by a lake, windmills and a night city.
// More weather: frost on a window, a dust storm, a sunshower and a monsoon.

const { TAU, fmt, pol, rectPts, rotRect, curvePoly, blob, stripes, arcBand, slice, interpolate } = require('./engine');

const R = rectPts;
const still = { inset: 1, still: true };
const panel = (ctx, fill) => ctx.poly(R(14, 48, 212, 298), fill, still);
const sky = (ctx, h, fill) => ctx.poly(R(14, 48, 212, h), fill, still);

function pineTree(ctx, x, base, h, color) {
  const tiers = 3;
  for (let i = 0; i < tiers; i++) {
    const w = h * (0.22 + i * 0.1);
    const y1 = base - h * 0.18 - (i * h * 0.26);
    ctx.poly([[x, y1 - h * 0.34], [x + w, y1 + h * 0.06], [x - w, y1 + h * 0.06]], color, { inset: 1, still: true });
  }
  ctx.poly(R(x - 3, base - h * 0.14, 6, h * 0.14), ctx.col(4), still);
}

function riceTerraces(ctx) {
  const hue = ctx.int(0, 7);
  sky(ctx, 90, ctx.col(5));
  ctx.circ(ctx.between(60, 180), ctx.between(80, 96), ctx.between(18, 26), ctx.col(0));
  const count = ctx.int(9, 12);
  const f = ctx.between(0.02, 0.035);
  const ph = ctx.between(0, 4);
  stripes(ctx, [14, 120, 212, 226], count, (x, k) => -22 * Math.sin(x * f + ph + k * 0.5) * (0.5 + k / count) - k * 2, (k) => (k % 3 === 1 ? ctx.col(5) : ctx.green(k + hue)), 10);
  ctx.poly([[14, 100], [60, 74], [110, 104], [160, 70], [226, 104], [226, 130], [14, 130]], ctx.col(2), { inset: 1, still: true });
  const hx = ctx.between(60, 180);
  ctx.poly(R(hx - 9, 292, 18, 14), ctx.col(4), still);
  ctx.poly([[hx - 12, 292], [hx, 280], [hx + 12, 292]], ctx.col(3), still);
  return 'rice terraces';
}

function iceberg(ctx) {
  const water = 220;
  panel(ctx, ctx.col(5));
  ctx.circ(ctx.between(60, 180), ctx.between(90, 120), ctx.between(18, 28), ctx.colors[1]);
  const peaks = ctx.int(2, 3);
  const xs = Array.from({ length: peaks + 1 }, (_, i) => 50 + (i * 140) / peaks + ctx.between(-8, 8));
  const tops = xs.map((_, i) => (i === 0 || i === peaks ? water - 20 : water - ctx.between(70, 120)));
  for (let i = 0; i < peaks; i++) {
    ctx.poly([[xs[i], tops[i]], [xs[i + 1], tops[i + 1]], [xs[i + 1], water], [xs[i], water]], i % 2 ? ctx.colors[1] : ctx.col(5), { inset: 1, still: true });
    ctx.poly([[xs[i], tops[i]], [(xs[i] + xs[i + 1]) / 2, water - 14], [xs[i], water]], ctx.col(2), { inset: 1, still: true });
  }
  ctx.poly(R(14, water, 212, 126), ctx.col(2), still);
  const deep = [[xs[0] - 10, water], [xs[peaks] + 10, water], [xs[peaks] - 20, 320], [(xs[0] + xs[peaks]) / 2, 342], [xs[0] + 20, 310]];
  ctx.poly(deep, ctx.col(4), { inset: 1, still: true });
  ctx.poly([deep[0], [(xs[0] + xs[peaks]) / 2, water], deep[4]], ctx.col(5), { inset: 1, still: true });
  for (let i = 0; i < 5; i++) ctx.line(ctx.between(20, 190), water + ctx.between(6, 100), ctx.between(40, 100) + 20, water + ctx.between(6, 100), ctx.colors[1], 2);
  return 'iceberg';
}

function savanna(ctx) {
  panel(ctx, ctx.col(ctx.pick([0, 6, 3])));
  const sunY = ctx.between(180, 220);
  ctx.circ(120, sunY, ctx.between(62, 78), ctx.col(ctx.int(0, 7) + 5));
  ctx.poly(R(14, 262, 212, 84), ctx.col(4), still);
  ctx.poly([[14, 262], [90, 252], [160, 266], [226, 256], [226, 270], [14, 270]], ctx.col(4), still);
  const acacia = (x, base, s) => {
    ctx.poly([[x - 4 * s, base], [x + 4 * s, base], [x + 2 * s, base - 60 * s], [x - 2 * s, base - 60 * s]], ctx.ink, still);
    blob(ctx, x, base - 70 * s, 34 * s, 0.1, ctx.ink, 6);
    ctx.ellipse(x - 28 * s, base - 62 * s, 22 * s, 7 * s, ctx.ink, 0.1);
  };
  acacia(ctx.between(50, 90), 292, 1.2);
  acacia(ctx.between(150, 190), 270, 0.7);
  for (let i = 0; i < 3; i++) {
    const x = ctx.between(40, 200);
    ctx.stroke(`M${fmt(x)} 346 Q${fmt(x + 4)} 326 ${fmt(x - 4)} 312`, ctx.col(0), 3, x, 330, [x - 8, 310, x + 8, 346]);
  }
  for (let i = 0; i < 3; i++) ctx.poly([[0, 0], [8, 3], [16, 0], [8, -3]].map(([bx, by]) => [ctx.between(0, 1) * 0 + bx + 40 + i * 50, by + 90 + i * 10]), ctx.ink, { inset: 1, still: true });
  return 'savanna';
}

function fjord(ctx) {
  const water = 250;
  const hue = ctx.int(0, 7);
  sky(ctx, water - 48, ctx.col(hue + 5));
  ctx.circ(ctx.between(80, 160), ctx.between(90, 120), ctx.between(16, 24), ctx.colors[1]);
  const layers = [[ctx.col(hue + 3), 120, 0.9], [ctx.col(hue + 2), 160, 1.1], [ctx.col(4), 200, 1.4]];
  layers.forEach(([color, h, k], i) => {
    const gap = 40 + i * 24;
    const peak = water - h - ctx.between(0, 20);
    ctx.poly([[14, water], [14, peak], [60 + i * 10, peak - 24 * k], [120 - gap, water - 30 * k]], color, { inset: 1, still: true });
    ctx.poly([[226, water], [226, peak + 10], [180 - i * 10, peak - 20 * k], [120 + gap, water - 30 * k]], color, { inset: 1, still: true });
  });
  ctx.poly(R(14, water, 212, 96), ctx.col(2), still);
  ctx.poly([[14, water], [60, water + 70], [100, water]], ctx.col(4), { inset: 1, still: true });
  ctx.poly([[226, water], [180, water + 70], [140, water]], ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < 6; i++) ctx.line(ctx.between(40, 170), water + 14 + i * 14, ctx.between(70, 200), water + 14 + i * 14, ctx.colors[1], 2);
  const bx = ctx.between(90, 150);
  ctx.poly([[bx - 14, water + 24], [bx + 14, water + 24], [bx + 8, water + 32], [bx - 8, water + 32]], ctx.col(3), still);
  ctx.poly([[bx, water + 4], [bx + 10, water + 22], [bx, water + 22]], ctx.colors[1], still);
  return 'fjord';
}

function volcano(ctx) {
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  const peakX = ctx.between(100, 140);
  const peakY = ctx.between(150, 180);
  slice(ctx, interpolate([[0, 14], [1, 100]]), (t, b) => [peakX + b, peakY + t * (330 - peakY)], { bands: 5, big: 30, loosePct: 0.04, skipPct: 0, color: (b, i) => ctx.col(4 + i + b) === ctx.col(3) ? ctx.ink : ctx.col(2 + (b % 2) + i) });
  ctx.poly([[peakX - 14, peakY], [peakX + 14, peakY], [peakX + 6, peakY - 10], [peakX - 6, peakY - 10]], ctx.col(3), still);
  const lava = ctx.int(2, 3);
  for (let i = 0; i < lava; i++) {
    const s = i % 2 ? 1 : -1;
    const x = peakX + s * ctx.between(2, 16);
    ctx.poly([[x - 5, peakY], [x + 5, peakY], [x + s * ctx.between(40, 70) + 6, 330], [x + s * ctx.between(40, 70) - 6, 330]], ctx.col(3), { inset: 1, still: true });
  }
  for (let i = 0; i < 5; i++) blob(ctx, peakX + ctx.between(-10, 20) + i * 5, peakY - 24 - i * 18, 14 + i * 3, 0.2, i % 2 ? ctx.col(4) : ctx.col(6), 6);
  for (let i = 0; i < 6; i++) ctx.circ(peakX + ctx.between(-50, 50), peakY - ctx.between(20, 110), ctx.between(2, 4), ctx.col(0));
  ctx.poly(R(14, 330, 212, 16), ctx.ink, still);
  return 'volcano';
}

function cabinLake(ctx) {
  const hue = ctx.int(0, 7);
  sky(ctx, 150, ctx.col(hue + 5));
  ctx.circ(ctx.pick([60, 180]), ctx.between(80, 110), ctx.between(14, 22), ctx.colors[1]);
  ctx.poly([[14, 198], [14, 150], [70, 100], [118, 160], [160, 112], [226, 170], [226, 198]], ctx.col(hue + 3), { inset: 1, still: true });
  ctx.poly([[14, 198], [14, 196], [226, 196], [226, 198]], ctx.green(0), still);
  ctx.poly(R(14, 196, 212, 150), ctx.col(2), still);
  ctx.poly(R(14, 190, 212, 14), ctx.green(1), still);
  const cx = ctx.between(90, 150);
  ctx.poly(R(cx - 24, 166, 48, 30), ctx.col(4), still);
  ctx.poly([[cx - 30, 166], [cx, 142], [cx + 30, 166]], ctx.col(3), still);
  ctx.poly(R(cx - 5, 178, 10, 18), ctx.col(0), still);
  ctx.poly(R(cx + 10, 172, 9, 9), ctx.col(0), still);
  pineTree(ctx, cx - 56, 196, 70, ctx.green(0));
  pineTree(ctx, cx + 54, 196, 58, ctx.green(1));
  pineTree(ctx, cx - 76, 200, 46, ctx.green(2));
  ctx.poly([[cx - 24, 206], [cx + 24, 206], [cx + 20, 240], [cx - 20, 240]], ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < 5; i++) ctx.line(ctx.between(30, 150), 250 + i * 16, ctx.between(70, 200), 250 + i * 16, ctx.colors[1], 2);
  return 'cabin by the lake';
}

function windmills(ctx) {
  sky(ctx, 220, ctx.col(5));
  for (let i = 0; i < 2; i++) blob(ctx, ctx.between(50, 190), ctx.between(80, 130), ctx.between(18, 28), 0.15, ctx.colors[1], 6);
  const n = ctx.int(1, 2);
  for (let k = 0; k < n; k++) {
    const x = n === 1 ? 120 : 66 + k * 96;
    const s = n === 1 ? 1.2 : 0.8 + k * 0.1;
    const base = 280 - k * 6;
    ctx.poly([[x - 26 * s, base], [x + 26 * s, base], [x + 16 * s, base - 110 * s], [x - 16 * s, base - 110 * s]], ctx.col(ctx.int(0, 7) + k), { inset: 1, still: true });
    ctx.poly([[x - 20 * s, base - 110 * s], [x + 20 * s, base - 110 * s], [x, base - 140 * s]], ctx.col(3), { inset: 1, still: true });
    ctx.poly(R(x - 6 * s, base - 30 * s, 12 * s, 30 * s), ctx.col(4), still);
    const hub = [x, base - 108 * s];
    const a0 = ctx.between(0, Math.PI / 2);
    for (let b = 0; b < 4; b++) {
      const a = a0 + (b * Math.PI) / 2;
      const [mx, my] = pol(hub[0], hub[1], 44 * s, a);
      ctx.poly(rotRect(mx, my, 76 * s, 10 * s, a), ctx.colors[1], still);
      const [lx, ly] = pol(hub[0], hub[1], 56 * s, a + 0.16);
      ctx.poly(rotRect(lx, ly, 34 * s, 10 * s, a + 0.2), ctx.col(4), { inset: 1, still: true });
    }
    ctx.circ(hub[0], hub[1], 6 * s, ctx.ink);
  }
  const rows = ctx.int(3, 4);
  for (let i = 0; i < rows; i++) ctx.poly([[14, 286 + i * 14], [226, 280 + i * 14], [226, 296 + i * 14], [14, 300 + i * 14]], ctx.col(i * 3 + ctx.int(0, 2)), { inset: 1, still: true });
  return 'windmills';
}

function nightCity(ctx) {
  panel(ctx, ctx.col(4));
  ctx.circ(ctx.between(60, 180), ctx.between(90, 120), ctx.between(20, 30), ctx.colors[1]);
  for (let i = 0; i < 8; i++) ctx.circ(ctx.between(24, 216), ctx.between(60, 170), ctx.between(1, 2.4), ctx.colors[0]);
  const n = ctx.int(7, 9);
  const w = 212 / n;
  const glow = ctx.colors[0];
  for (let i = 0; i < n; i++) {
    const h = ctx.between(70, 180);
    const x = 14 + i * w;
    const y = 346 - h;
    let svg = `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w - 2)}" height="${fmt(h)}" fill="${ctx.col(i % 2 ? 2 : 6) === ctx.colors[1] ? ctx.ink : ctx.ink}" stroke="${ctx.col(2)}" stroke-width="1.5"/>`;
    for (let wy = y + 8; wy < 336; wy += 14) {
      for (let wx = x + 5; wx < x + w - 9; wx += 10) {
        if (ctx.rand() < 0.5) svg += `<rect x="${fmt(wx)}" y="${fmt(wy)}" width="5" height="7" fill="${glow}"/>`;
      }
    }
    ctx.raw(svg, x + w / 2, y + h / 2, [x, y, x + w, 346]);
    if (ctx.rand() < 0.4) ctx.line(x + w / 2, y, x + w / 2, y - 14, ctx.col(3), 2);
  }
  return 'night city';
}

function frostWindow(ctx) {
  panel(ctx, ctx.col(5));
  const cx = 120;
  ctx.poly(R(14, 48, 212, 298), ctx.col(2), { inset: 1, still: true });
  ctx.poly(R(26, 60, 188, 274), ctx.col(5), still);
  ctx.poly(R(cx - 3, 60, 6, 274), ctx.colors[1], still);
  ctx.poly(R(26, 190, 188, 6), ctx.colors[1], still);
  const flakes = ctx.int(3, 5);
  for (let i = 0; i < flakes; i++) {
    const x = ctx.between(52, 190);
    const y = ctx.between(88, 310);
    const r = ctx.between(22, 38);
    let svg = '';
    for (let k = 0; k < 6; k++) {
      const a = (k * TAU) / 6;
      const [ex, ey] = pol(x, y, r, a);
      svg += `<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(ex)}" y2="${fmt(ey)}" stroke="${ctx.colors[1]}" stroke-width="2.4" stroke-linecap="round"/>`;
      for (const f of [0.5, 0.75]) {
        const [bx, by] = pol(x, y, r * f, a);
        for (const s of [-1, 1]) {
          const [tx, ty] = pol(bx, by, r * 0.3, a + s * 0.9);
          svg += `<line x1="${fmt(bx)}" y1="${fmt(by)}" x2="${fmt(tx)}" y2="${fmt(ty)}" stroke="${ctx.colors[1]}" stroke-width="2" stroke-linecap="round"/>`;
        }
      }
    }
    ctx.raw(svg, x, y, [x - r * 1.2, y - r * 1.2, x + r * 1.2, y + r * 1.2]);
  }
  for (let i = 0; i < 12; i++) ctx.circ(ctx.between(34, 206), ctx.between(70, 322), ctx.between(1.4, 3), ctx.colors[1]);
  return 'frosted window';
}

function dustStorm(ctx) {
  const tone = ctx.int(0, 7);
  panel(ctx, ctx.col(tone + 4));
  ctx.circ(ctx.between(70, 170), ctx.between(100, 140), ctx.between(26, 36), ctx.col(0));
  const count = ctx.int(6, 8);
  for (let i = 0; i < count; i++) {
    const y = 130 + i * 28;
    ctx.poly(curvePoly(14, 226, y + 34, 22, 0.03 + i * 0.004, i * 1.3, y + 78).map(([x, yy]) => [x, Math.min(346, yy)]), ctx.col(tone + (i % 3) * 2 + 1), { inset: 1, still: true });
  }
  const px = ctx.between(60, 180);
  ctx.poly(R(px - 3, 224, 6, 110), ctx.ink, still);
  ctx.poly(R(px - 22, 232, 44, 5), ctx.ink, still);
  for (let i = 0; i < 12; i++) ctx.circ(ctx.between(20, 220), ctx.between(150, 330), ctx.between(2, 5), ctx.col(tone + 2));
  return 'dust storm';
}

function sunshower(ctx) {
  const hue = ctx.int(0, 7);
  panel(ctx, ctx.col(hue + 5));
  const sx = ctx.pick([64, 176]);
  ctx.circ(sx, 110, 34, ctx.col(0));
  for (let i = 0; i < 10; i++) {
    const a = (i * TAU) / 10;
    ctx.poly([pol(sx, 110, 42, a - 0.1), pol(sx, 110, 60, a), pol(sx, 110, 42, a + 0.1)], ctx.col(0), { inset: 1 });
  }
  const cx = 240 - sx;
  [[cx, 150, 34], [cx - 30, 164, 26], [cx + 30, 164, 26], [cx, 176, 28]].forEach(([x, y, r]) => ctx.circ(x, y, r, ctx.colors[1]));
  for (let i = 0; i < 16; i++) {
    const x = cx - 56 + (i * 112) / 15;
    const y = 200 + (i % 3) * 22 + ctx.between(0, 20);
    ctx.line(x, y, x - 8, y + 24, ctx.col(2), 3);
  }
  for (let i = 0; i < 4; i++) ctx.poly(arcBand(120, 400, 70 + i * 10, 80 + i * 10, Math.PI * 1.12, Math.PI * 1.88, 10), ctx.col(i * 2 + hue), { inset: 1, still: true });
  ctx.poly(R(14, 326, 212, 20), ctx.green(0), still);
  return 'sunshower';
}

function monsoon(ctx) {
  const dark = ctx.col(ctx.int(0, 7) + 4);
  panel(ctx, ctx.col(ctx.int(0, 7) + 5));
  for (let i = 0; i < 3; i++) {
    const y = 80 + i * 40;
    for (let k = 0; k < 4; k++) blob(ctx, 50 + k * 44 + (i % 2) * 12, y, ctx.between(26, 36), 0.2, i === 0 ? ctx.ink : dark, 7);
  }
  for (let g = 0; g < 8; g++) {
    let svg = '';
    const x0 = 24 + g * 26;
    for (let k = 0; k < 6; k++) {
      const x = x0 + ctx.between(-8, 8);
      const y = 150 + k * 30 + ctx.between(0, 14);
      svg += `<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(x - 8)}" y2="${fmt(y + 24)}" stroke="${ctx.colors[1]}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    ctx.raw(svg, x0, 250, [x0 - 20, 150, x0 + 14, 350]);
  }
  ctx.poly(R(14, 322, 212, 24), ctx.col(2), still);
  const tx = ctx.pick([50, 140]);
  ctx.stroke(`M${tx} 322 Q${tx + 10} 270 ${tx + 36} 244`, ctx.col(4), 6, tx + 14, 280, [tx - 4, 240, tx + 40, 324]);
  for (let i = 0; i < 4; i++) {
    const a = -0.2 + i * 0.5;
    const [ex, ey] = pol(tx + 36, 244, 38, a - 0.4);
    ctx.poly([[tx + 36, 244], [ex + 8, ey - 8], [ex, ey + 8]], ctx.green(i), { inset: 1 });
  }
  for (let i = 0; i < 3; i++) ctx.ellipse(ctx.between(60, 180), 334 + i * 4, ctx.between(14, 24), 3, ctx.colors[1], 0);
  return 'monsoon';
}

module.exports = { riceTerraces, iceberg, savanna, fjord, volcano, cabinLake, windmills, nightCity, frostWindow, dustStorm, sunshower, monsoon };
