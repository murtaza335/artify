'use strict';

// More scenery and weather: deserts, beaches, autumn forests, reefs, canyons, waterfalls, auroras,
// hurricanes, hail, rainy windows, heat waves and moonlit clouds.

const { TAU, fmt, pol, starPoints, rectPts, rotRect, curvePoly } = require('./engine');

const R = rectPts;
const X0 = 14;
const X1 = 226;
const STORM = { dark: ['#6C7A89', '#8A97A5', '#55616E'], light: ['#5E6B78', '#7E8C99', '#4A5560'] };
const NIGHT = ['#14122B', '#1D1845', '#2B2358'];

const FRAME = [X0, 50, X1 - X0, 296];

// Bands of colour across the frame. Everything drawn after them is clipped to the frame.
const bands = (ctx, colors, y0, y1) => {
  const h = (y1 - y0) / colors.length;
  colors.forEach((c, i) => ctx.poly(R(X0, y0 + i * h, X1 - X0, h + 1), c, { inset: 1, still: true }));
  ctx.clipTo(FRAME);
};

function sun(ctx, x, y, r, rays = 10) {
  for (let i = 0; i < rays; i++) {
    const a = (i * TAU) / rays;
    ctx.poly([pol(x, y, r + 5, a - 0.11), pol(x, y, r + ctx.between(16, 26), a), pol(x, y, r + 5, a + 0.11)], ctx.colors[0], { inset: 1, still: true });
  }
  ctx.circ(x, y, r, ctx.colors[0]);
}

function saguaro(ctx, x, base, h, color) {
  ctx.poly(R(x - 7, base - h, 14, h), color, { inset: 1, still: true });
  ctx.circ(x, base - h, 7, color);
  for (const s of [-1, 1]) {
    if (ctx.rand() < 0.2) continue;
    const ah = h * ctx.between(0.3, 0.5);
    ctx.poly(R(x + s * 15 - 5, base - h * 0.35 - ah, 10, ah), color, { inset: 1, still: true });
    ctx.poly(R(Math.min(x, x + s * 15) - 1, base - h * 0.35, 16, 9), color, { inset: 1, still: true });
    ctx.circ(x + s * 15, base - h * 0.35 - ah, 5, color);
  }
}

function desert(ctx) {
  bands(ctx, ['#62C3E3', '#8AD6F0', '#FFF0B8'], 50, 230);
  sun(ctx, ctx.between(70, 170), ctx.between(90, 130), ctx.between(22, 30), 12);
  for (let i = 0; i < 2; i++) {
    const x = ctx.between(40, 190);
    const w = ctx.between(36, 56);
    ctx.poly([[x - w, 238], [x + w, 238], [x, 238 - w * 1.1]], ctx.col(0), { inset: 1, still: true });
    ctx.poly([[x, 238 - w * 1.1], [x + w, 238], [x + 6, 238]], ctx.col(3), { inset: 1, still: true });
  }
  const tones = [ctx.col(0), ctx.colors[6], ctx.col(3)];
  for (let j = 0; j < 3; j++) ctx.poly(curvePoly(X0, X1, 236 + j * 34, ctx.between(14, 30), ctx.between(0.02, 0.04), ctx.between(0, TAU), 346), tones[j], { inset: 1, still: true });
  for (let i = 0; i < 2; i++) saguaro(ctx, ctx.between(40, 200), 330 - i * 10, ctx.between(50, 90), ctx.green(i));
  for (let i = 0; i < 2; i++) ctx.stroke(`M${60 + i * 80} 118 q8 -8 16 0 q8 -8 16 0`, ctx.ink, 3, 76 + i * 80, 114, [60 + i * 80, 110, 92 + i * 80, 118]);
  return 'desert';
}

function beach(ctx) {
  bands(ctx, ['#62C3E3', '#8AD6F0'], 50, 170);
  sun(ctx, ctx.between(50, 190), ctx.between(80, 110), 22, 10);
  bands(ctx, [ctx.col(2), ctx.col(5), ctx.col(2)], 170, 236);
  for (let i = 0; i < 3; i++) ctx.stroke(`M${20 + i * 60} ${188 + i * 20} q10 -8 20 0 q10 8 20 0`, ctx.colors[1], 3, 40 + i * 60, 190 + i * 20, [20 + i * 60, 180 + i * 20, 60 + i * 60, 200 + i * 20]);
  ctx.poly(curvePoly(X0, X1, 252, ctx.between(8, 14), 0.04, ctx.between(0, TAU), 346), ctx.col(0), { inset: 1, still: true });
  const ux = ctx.between(60, 160);
  ctx.line(ux, 220, ux - 6, 330, ctx.col(4), 5);
  const gores = 5;
  for (let i = 0; i < gores; i++) {
    const a0 = Math.PI + (i * Math.PI) / gores;
    const a1 = Math.PI + ((i + 1) * Math.PI) / gores;
    ctx.poly([[ux, 226], pol(ux, 226, 54, a0), pol(ux, 226, 54, a1)], ctx.col(i % 2 ? 3 : 1), { inset: 0.99, still: true });
  }
  ctx.poly(rotRect(ux + 70, 322, 54, 22, -0.1), ctx.col(6), { inset: 1, still: true });
  ctx.poly(rotRect(ux + 70, 322, 54, 6, -0.1), ctx.colors[1], { inset: 1, still: true });
  ctx.circ(ctx.between(30, 50), 330, 11, ctx.col(3));
  return 'beach';
}

function autumnForest(ctx) {
  bands(ctx, ['#FFF0B8', '#F79BB0'], 50, 200);
  ctx.circ(ctx.between(60, 180), 120, 26, ctx.colors[0]);
  ctx.poly(curvePoly(X0, X1, 230, 20, 0.03, ctx.between(0, TAU), 346), ctx.col(4), { inset: 1, still: true });
  ctx.poly([[100, 346], [140, 346], [128, 240], [112, 240]], ctx.col(0), { inset: 1, still: true });
  const trees = ctx.int(4, 6);
  for (let i = 0; i < trees; i++) {
    const x = 28 + i * (184 / (trees - 1)) + ctx.between(-8, 8);
    if (Math.abs(x - 120) < 30) continue;
    const base = ctx.between(270, 330);
    const h = ctx.between(50, 90);
    ctx.poly(R(x - 5, base - h, 10, h), ctx.col(4), { inset: 1, still: true });
    for (let k = 0; k < 3; k++) ctx.circ(x + ctx.between(-14, 14), base - h - ctx.between(0, 24), ctx.between(18, 30), ctx.pick([ctx.col(3), ctx.col(0), ctx.col(6), '#FF8A2B']));
  }
  for (let i = 0; i < 16; i++) ctx.poly(rotRect(ctx.between(20, 220), ctx.between(80, 340), ctx.between(9, 14), 6, ctx.between(0, TAU)), ctx.pick([ctx.col(3), ctx.col(0), '#FF8A2B']), { inset: 1, loose: true });
  return 'autumn forest';
}

function coralReef(ctx) {
  bands(ctx, ['#8AD6F0', '#62C3E3', ctx.col(2), ctx.kind === 'light' ? '#1E4A5A' : '#1F4452'], 50, 330);
  ctx.raw(`<polygon points="90,50 140,50 200,330 40,330" fill="#FFFFFF" opacity=".12"/>`, 120, 190, [40, 50, 200, 330]);
  ctx.poly(curvePoly(X0, X1, 326, 8, 0.06, ctx.between(0, TAU), 350), ctx.colors[0], { inset: 1, still: true });
  const branch = (x, y, len, ang, d, color) => {
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    ctx.line(x, y, x2, y2, color, 3 + d * 1.5);
    if (d > 0) {
      branch(x2, y2, len * 0.72, ang - 0.5, d - 1, color);
      branch(x2, y2, len * 0.72, ang + 0.5, d - 1, color);
    } else ctx.circ(x2, y2, 4, color);
  };
  const corals = ctx.int(3, 4);
  for (let i = 0; i < corals; i++) branch(40 + i * (160 / (corals - 1)) + ctx.between(-10, 10), 330, ctx.between(30, 44), -Math.PI / 2 + ctx.between(-0.2, 0.2), 2, ctx.pick([ctx.col(3), ctx.col(6), ctx.col(0)]));
  for (let i = 0; i < 3; i++) {
    const x = ctx.between(30, 210);
    ctx.stroke(`M${fmt(x)} 330 q-12 -30 0 -60 q12 -30 0 -60`, ctx.green(i), 5, x, 270, [x - 14, 210, x + 14, 330]);
  }
  for (let i = 0; i < ctx.int(2, 3); i++) {
    const x = ctx.between(50, 190);
    const y = ctx.between(110, 270);
    const s = ctx.rand() < 0.5 ? 1 : -1;
    const c = ctx.pick([ctx.col(3), ctx.col(0), ctx.col(6)]);
    ctx.ellipse(x, y, 22, 12, c);
    ctx.poly([[x - s * 18, y], [x - s * 38, y - 14], [x - s * 38, y + 14]], c, { inset: 1, still: true });
    ctx.circ(x + s * 10, y - 3, 3, ctx.ink);
  }
  for (let i = 0; i < 10; i++) ctx.raw(`<circle cx="${fmt(ctx.between(30, 210))}" cy="${fmt(ctx.between(70, 290))}" r="${fmt(ctx.between(2, 6))}" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity=".8"/>`, 120, 150, [30, 70, 210, 290]);
  return 'coral reef';
}

function canyon(ctx) {
  bands(ctx, ['#62C3E3', '#8AD6F0', '#FFF0B8'], 50, 200);
  sun(ctx, ctx.between(60, 180), ctx.between(90, 120), 20, 8);
  const tones = [['#E9A93B', '#E5534B', '#8E2A33'], ['#E5534B', '#8E2A33', '#6B2A4A'], ['#8E2A33', '#6B2A4A', '#4A1B2A']];
  for (let layer = 0; layer < 3; layer++) {
    const base = 250 + layer * 36;
    const count = ctx.int(2, 3);
    for (let i = 0; i < count; i++) {
      const cx = 30 + i * (180 / count) + ctx.between(-10, 20);
      const w = ctx.between(50, 80);
      const h = ctx.between(60, 110) - layer * 10;
      const top = base - h;
      const strata = 3;
      for (let k = 0; k < strata; k++) {
        const y0 = top + (k * h) / strata;
        const y1 = top + ((k + 1) * h) / strata;
        const inset0 = k === 0 ? w * 0.28 : w * (0.28 + k * 0.1);
        const inset1 = w * (0.28 + (k + 1) * 0.1);
        ctx.poly([[cx - w + inset0, y0], [cx + w - inset0, y0], [cx + w - inset1 + 4, y1 + 1], [cx - w + inset1 - 4, y1 + 1]], tones[layer][k], { inset: 1, still: true });
      }
    }
    ctx.poly(R(X0, base - 2, X1 - X0, 40), tones[layer][2], { inset: 1, still: true });
  }
  ctx.stroke(`M${X0} 336 C70 314 110 350 ${X1} 322`, ctx.col(5), 9, 120, 332, [X0, 312, X1, 352]);
  return 'canyon';
}

function waterfall(ctx) {
  bands(ctx, ['#8AD6F0', '#B8E6F5'], 50, 150);
  sun(ctx, ctx.between(150, 200), 84, 18, 8);
  const cliff = ctx.kind === 'light' ? ['#12202A', '#1E4A5A'] : ['#1F4452', '#16303A'];
  ctx.poly([[X0, 130], [86, 130], [92, 270], [X0, 300]], cliff[0], { inset: 1, still: true });
  ctx.poly([[154, 130], [X1, 150], [X1, 296], [148, 270]], cliff[1], { inset: 1, still: true });
  for (let i = 0; i < 6; i++) ctx.poly([[88 + i * 11, 130], [99 + i * 11, 130], [99 + i * 11, 276], [88 + i * 11, 276]], i % 2 ? ctx.colors[1] : ctx.col(5), { inset: 1, still: true });
  // Ground under the cliffs and the pool, so the rocks below have something to sit on.
  ctx.poly(R(X0, 270, X1 - X0, 76), cliff[1], { inset: 1, still: true });
  ctx.ellipse(120, 292, 86, 26, ctx.col(2));
  ctx.ellipse(120, 288, 64, 16, ctx.col(5));
  for (let i = 0; i < 7; i++) ctx.circ(ctx.between(88, 154), ctx.between(268, 296), ctx.between(5, 11), ctx.colors[1]);
  for (let i = 0; i < 4; i++) {
    const x = ctx.between(20, 90);
    ctx.poly([[x, 130], [x - 16, 170], [x + 16, 170]], ctx.green(i), { inset: 1, still: true });
    ctx.poly([[x, 150], [x - 20, 196], [x + 20, 196]], ctx.green(i + 2), { inset: 1, still: true });
  }
  for (let i = 0; i < 4; i++) ctx.poly([[ctx.between(20, 200), 340], [ctx.between(30, 210), 316], [ctx.between(40, 220), 340]], ctx.col(4), { inset: 1, still: true });
  return 'waterfall';
}

function aurora(ctx) {
  bands(ctx, NIGHT, 50, 342);
  for (let i = 0; i < 30; i++) ctx.circ(ctx.between(20, 220), ctx.between(56, 240), ctx.between(0.9, 2), ctx.colors[1]);
  const curtains = ctx.int(3, 5);
  for (let i = 0; i < curtains; i++) {
    const y = 100 + i * ctx.between(22, 34);
    const phase = ctx.between(0, TAU);
    const top = [];
    const bottom = [];
    for (let x = X0; x <= X1; x += 12) {
      const yy = y + Math.sin(x * 0.04 + phase) * 22;
      top.push([x, yy]);
      bottom.unshift([x, yy + ctx.between(60, 120)]);
    }
    ctx.raw(`<polygon points="${top.concat(bottom).map(([a, b]) => `${fmt(a)},${fmt(b)}`).join(' ')}" fill="${ctx.pick([ctx.green(0), ctx.col(6), ctx.col(5), ctx.col(2)])}" opacity=".6"/>`, 120, y + 40, [X0, y - 22, X1, y + 140]);
  }
  ctx.poly(curvePoly(X0, X1, 300, 36, 0.035, ctx.between(0, TAU), 346), '#0B0A14', { inset: 1, still: true });
  for (let i = 0; i < 4; i++) {
    const x = ctx.between(30, 210);
    ctx.poly([[x, 304], [x - 10, 326], [x + 10, 326]], '#0B0A14', { inset: 1, still: true });
  }
  return 'aurora';
}

function hurricane(ctx) {
  const [s1, s2, s3] = STORM[ctx.kind] || STORM.dark;
  const cx = 120;
  const cy = 190;
  ctx.circ(cx, cy, 112, ctx.col(2));
  const arms = ctx.int(3, 4);
  for (let a = 0; a < arms; a++) {
    for (let i = 0; i < 22; i++) {
      const t = i / 21;
      const r = 22 + t * 82;
      const ang = (a * TAU) / arms + t * 3.4;
      const [x, y] = pol(cx, cy, r, ang);
      ctx.ellipse(x, y, ctx.between(10, 18) * (1.1 - t * 0.4), ctx.between(6, 11), ctx.pick([s1, s2, ctx.colors[1]]), ang + 1.2);
    }
  }
  ctx.circ(cx, cy, 20, ctx.col(5));
  ctx.circ(cx, cy, 9, s3);
  return 'hurricane';
}

function hail(ctx) {
  const [s1, s2, s3] = STORM[ctx.kind] || STORM.dark;
  for (const [x, y, w, c, d] of [[84, 70, 120, s3, s2], [144, 98, 180, s1, s2]]) {
    ctx.poly([[x - w / 2, y + w * 0.15], [x + w / 2, y + w * 0.15], [x + w / 2 - w * 0.09, y], [x - w / 2 + w * 0.09, y]], c, { inset: 1, still: true });
    for (let i = 0; i < 4; i++) ctx.circ(x - w * 0.3 + i * w * 0.2, y - 6, w * 0.13 * (i % 2 ? 1.2 : 1), i % 2 ? c : d);
  }
  for (let i = 0; i < 20; i++) {
    const x = ctx.between(24, 216);
    const y = ctx.between(140, 320);
    const r = ctx.between(5, 10);
    ctx.line(x + 4, y - r - 12, x + 1, y - r, ctx.colors[1], 2);
    ctx.circ(x, y, r, '#FFFFFF');
    ctx.circ(x - r * 0.3, y - r * 0.3, r * 0.3, ctx.col(5));
  }
  ctx.poly(curvePoly(X0, X1, 332, 6, 0.06, 0, 350), ctx.green(0), { inset: 1, still: true });
  return 'hailstorm';
}

function windowRain(ctx) {
  ctx.poly(R(X0, 50, X1 - X0, 296), ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(30, 66, 180, 250), NIGHT[0], { inset: 1, still: true });
  // The lights and buildings outside are seen only through the glass.
  ctx.clipTo([30, 66, 180, 250]);
  for (let i = 0; i < 22; i++) ctx.raw(`<circle cx="${fmt(ctx.between(40, 200))}" cy="${fmt(ctx.between(180, 300))}" r="${fmt(ctx.between(5, 14))}" fill="${ctx.pick([ctx.colors[0], ctx.col(3), ctx.col(6), ctx.col(5)])}" opacity=".55"/>`, 120, 240, [40, 170, 200, 314]);
  for (let i = 0; i < 6; i++) ctx.poly(R(44 + i * 28, ctx.between(200, 260), ctx.between(10, 20), 120), NIGHT[2], { inset: 1, still: true });
  const rainy = ctx.kind === 'light' ? '#8AD6F0' : '#62C3E3';
  for (let i = 0; i < 26; i++) {
    const x = ctx.between(40, 200);
    const y = ctx.between(80, 290);
    const r = ctx.between(3, 7);
    if (ctx.rand() < 0.5) ctx.line(x, y - ctx.between(16, 40), x + ctx.between(-3, 3), y, rainy, 2);
    ctx.poly([[x, y - r * 2.4], [x + r, y - r * 0.4], [x - r, y - r * 0.4]], rainy, { inset: 1, still: true });
    ctx.circ(x, y, r, rainy);
  }
  ctx.clipTo(null);
  ctx.poly(R(100, 66, 6, 250), ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(30, 180, 180, 6), ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(18, 316, 204, 14), ctx.col(0), { inset: 1, still: true });
  ctx.poly([[150, 316], [186, 316], [182, 292], [154, 292]], ctx.col(3), { inset: 1, still: true });
  for (let i = 0; i < 4; i++) ctx.poly([[168, 294], [150 + i * 14, 262 - (i % 2) * 14], [176 + i * 6, 270]], ctx.green(i), { inset: 1, loose: ctx.rand() < 0.2 });
  return 'rainy window';
}

function heatWave(ctx) {
  bands(ctx, ['#FFF0B8', '#F5C518', '#FF8A2B'], 50, 250);
  const sx = ctx.between(90, 150);
  const sy = 130;
  for (let i = 0; i < 16; i++) {
    const a = (i * TAU) / 16;
    ctx.poly([pol(sx, sy, 50, a - 0.09), pol(sx, sy, ctx.between(78, 100), a), pol(sx, sy, 50, a + 0.09)], i % 2 ? '#E5534B' : '#FF8A2B', { inset: 1, still: true });
  }
  ctx.circ(sx, sy, 48, '#E5534B');
  ctx.circ(sx, sy, 34, '#FF8A2B');
  for (let i = 0; i < 5; i++) {
    const y = 214 + i * 14;
    ctx.stroke(`M${X0} ${y} q15 -9 30 0 q15 9 30 0 q15 -9 30 0 q15 9 30 0 q15 -9 30 0 q15 9 30 0 q15 -9 30 0`, '#FFFFFF', 3, 120, y, [X0, y - 9, X1, y + 9]);
  }
  ctx.poly(curvePoly(X0, X1, 292, 20, 0.03, ctx.between(0, TAU), 346), ctx.col(4), { inset: 1, still: true });
  saguaro(ctx, ctx.between(40, 90), 330, 60, ctx.green(0));
  // A thermometer showing the heat.
  ctx.poly(R(186, 214, 14, 100), '#FFFFFF', { inset: 1, still: true });
  ctx.poly(R(189, 244, 8, 70), '#D83A2E', { inset: 1, still: true });
  ctx.circ(193, 322, 14, '#D83A2E');
  for (let i = 0; i < 5; i++) ctx.line(204, 226 + i * 16, 214, 226 + i * 16, ctx.ink, 2);
  return 'heat wave';
}

function moonClouds(ctx) {
  bands(ctx, NIGHT, 50, 342);
  const mx = ctx.between(90, 150);
  const my = ctx.between(130, 170);
  ctx.circ(mx, my, 56, ctx.colors[1]);
  [[-16, -14, 9], [14, 10, 12], [-10, 22, 6], [22, -22, 6]].forEach(([dx, dy, r]) => ctx.circ(mx + dx, my + dy, r, ctx.kind === 'light' ? '#F4EFE0' : '#E8D9A0'));
  const clouds = Array.from({ length: 4 }, (_, i) => [ctx.between(40, 200), 210 + i * 34 + ctx.between(-6, 6), ctx.between(100, 160)]);
  // Stars go in before the clouds, so the clouds pass in front of them.
  for (let i = 0; i < 26; i++) {
    const x = ctx.between(20, 220);
    const y = ctx.between(60, 340);
    if (Math.hypot(x - mx, y - my) < 66) continue;
    if (ctx.rand() < 0.4) ctx.poly(starPoints(x, y, ctx.between(4, 8), 1.6, 4), ctx.colors[1], { inset: 1, still: true });
    else ctx.circ(x, y, ctx.between(0.9, 2), ctx.colors[1]);
  }
  const shades = ['#6C7A89', '#8A97A5', '#55616E'];
  clouds.forEach(([x, y, w], i) => {
    ctx.ellipse(x, y, w / 2, 14, shades[i % 3]);
    ctx.ellipse(x - w * 0.2, y - 8, w * 0.22, 14, shades[(i + 1) % 3]);
    ctx.ellipse(x + w * 0.18, y - 6, w * 0.26, 16, shades[i % 3]);
  });
  return 'moonlit clouds';
}

module.exports = { desert, beach, autumnForest, coralReef, canyon, waterfall, aurora, hurricane, hail, windowRain, heatWave, moonClouds };
