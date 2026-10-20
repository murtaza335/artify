'use strict';

// Clouds and weather: rain, storms, snow, rainbows, wind, fog, sunshine, tornadoes and sunsets.

const { TAU, fmt, pol, starPoints, rectPts, rotRect, curvePoly } = require('./engine');

const STORM = { dark: ['#6C7A89', '#8A97A5', '#55616E'], light: ['#5E6B78', '#7E8C99', '#4A5560'] };
const RAIN = { dark: '#62C3E3', light: '#1E7B8F' };
const RAINBOW = ['#E5534B', '#FF8A2B', '#F5C518', '#6BBF5A', '#3FA7D6', '#8E6BD6'];
const FOG = { dark: ['#16303A', '#1F4452', '#2F6F7A', '#4C9FA6'], light: ['#12202A', '#1E4A5A', '#1E7B8F', '#4FA7B5'] };

const storm = (ctx) => STORM[ctx.kind] || STORM.dark;
const rainColor = (ctx) => RAIN[ctx.kind] || RAIN.dark;

// A cloud: a flat-bottomed base with overlapping bumps.
function cloud(ctx, cx, cy, w, c1, c2) {
  const h = w * 0.3;
  ctx.poly([[cx - w / 2, cy + h / 2], [cx + w / 2, cy + h / 2], [cx + w / 2 - h * 0.3, cy], [cx - w / 2 + h * 0.3, cy]], c1, { inset: 1, still: true });
  const bumps = ctx.int(3, 4);
  for (let i = 0; i < bumps; i++) {
    const t = i / (bumps - 1);
    const r = h * ctx.between(0.65, 1.05) * (1 - Math.abs(t - 0.5) * 0.5);
    ctx.circ(cx - w * 0.32 + t * w * 0.64, cy - r * 0.35, r, i % 2 ? c1 : c2);
  }
}

const fairCloud = (ctx, cx, cy, w) => cloud(ctx, cx, cy, w, ctx.colors[1], ctx.kind === 'light' ? '#F4EFE0' : '#FFFFFF');

function drops(ctx, count, y0, y1, slant = -5) {
  for (let i = 0; i < count; i++) {
    const x = ctx.between(20, 222);
    const y = ctx.between(y0, y1);
    ctx.line(x, y, x + slant, y + ctx.between(14, 26), rainColor(ctx), 3);
  }
}

function puddles(ctx, count) {
  const c = rainColor(ctx);
  for (let i = 0; i < count; i++) {
    const x = ctx.between(40, 200);
    const rx = ctx.between(18, 34);
    ctx.ellipse(x, 344 - (i % 2) * 6, rx, 5, c);
    ctx.raw(`<ellipse cx="${fmt(x)}" cy="${fmt(344 - (i % 2) * 6)}" rx="${fmt(rx + 8)}" ry="8" fill="none" stroke="${c}" stroke-width="1.8"/>`, x, 344, [x - rx - 8, 334, x + rx + 8, 354]);
  }
}

function pine(ctx, x, base, h, c1, c2) {
  const w = h * 0.4;
  ctx.poly([[x, base - h], [x - w, base - h * 0.12], [x, base - h * 0.12]], c1, { inset: 1, still: true });
  ctx.poly([[x, base - h], [x, base - h * 0.12], [x + w, base - h * 0.12]], c2, { inset: 1, still: true });
  ctx.poly(rectPts(x - 2, base - h * 0.12, 4, h * 0.12), ctx.col(4), { inset: 1, still: true });
}

function rainstorm(ctx) {
  const [s1, s2, s3] = storm(ctx);
  cloud(ctx, ctx.between(70, 90), 74, 120, s3, s2);
  cloud(ctx, ctx.between(130, 150), 100, ctx.between(170, 195), s1, s2);
  drops(ctx, ctx.int(34, 46), 130, 322);
  puddles(ctx, 3);
  return 'rainstorm';
}

function thunderstorm(ctx) {
  const [s1, s2, s3] = storm(ctx);
  cloud(ctx, 90, 78, 130, s3, s2);
  cloud(ctx, 138, 104, 180, s1, s3);
  const bx = ctx.between(95, 145);
  const by = 150;
  ctx.poly([[bx, by], [bx - 22, by + 52], [bx - 6, by + 52], [bx - 30, by + 124], [bx + 16, by + 42], [bx, by + 42], [bx + 22, by]], ctx.colors[0], { inset: 1, still: true });
  ctx.poly([[bx + 62, by + 40], [bx + 50, by + 74], [bx + 58, by + 74], [bx + 44, by + 112], [bx + 70, by + 70], [bx + 62, by + 70], [bx + 74, by + 40]], ctx.colors[1], { inset: 1, still: true });
  drops(ctx, ctx.int(14, 22), 140, 320);
  puddles(ctx, 2);
  return 'thunderstorm';
}

function snowfall(ctx) {
  cloud(ctx, 120, 84, ctx.between(170, 200), '#C9D3DC', '#E1E8EE');
  ctx.poly(curvePoly(12, 228, 300, ctx.between(10, 22), ctx.between(0.02, 0.05), ctx.between(0, TAU), 346), ctx.colors[1], { inset: 1, still: true });
  const trees = ctx.int(2, 4);
  for (let i = 0; i < trees; i++) pine(ctx, 30 + i * ctx.between(50, 70), ctx.between(300, 324), ctx.between(50, 90), ctx.green(i), ctx.green(i + 2));
  if (ctx.rand() < 0.6) {
    const sx = ctx.between(150, 200);
    ctx.circ(sx, 318, 20, '#FFFFFF');
    ctx.circ(sx, 288, 15, '#FFFFFF');
    ctx.circ(sx, 264, 11, '#FFFFFF');
    ctx.poly([[sx, 266], [sx + 20, 270], [sx, 274]], ctx.col(0), { inset: 1, still: true });
    ctx.poly(rectPts(sx - 12, 246, 24, 6), ctx.ink, { inset: 1, still: true });
    ctx.poly(rectPts(sx - 8, 232, 16, 15), ctx.ink, { inset: 1, still: true });
  }
  for (let i = 0; i < 24; i++) {
    const r = ctx.between(3.5, 9);
    ctx.poly(starPoints(ctx.between(20, 220), ctx.between(130, 300), r, r * 0.35, 6), i % 3 ? '#FFFFFF' : ctx.colors[5], { inset: 1, still: true });
  }
  return 'snowfall';
}

function rainbow(ctx) {
  const cx = 120;
  const cy = ctx.between(250, 280);
  const bands = 6;
  const width = ctx.between(11, 13);
  for (let i = 0; i < bands; i++) {
    const outer = 108 - i * width;
    const inner = outer - width + 0.5;
    ctx.shape(
      `M${fmt(cx - outer)} ${fmt(cy)} A${fmt(outer)} ${fmt(outer)} 0 0 1 ${fmt(cx + outer)} ${fmt(cy)} L${fmt(cx + inner)} ${fmt(cy)} A${fmt(inner)} ${fmt(inner)} 0 0 0 ${fmt(cx - inner)} ${fmt(cy)} Z`,
      RAINBOW[i], cx, cy - outer / 2, [cx - outer, cy - outer, cx + outer, cy]
    );
  }
  fairCloud(ctx, 26, cy + 4, 92);
  fairCloud(ctx, 214, cy + 4, 92);
  ctx.circ(ctx.between(40, 200), ctx.between(70, 110), ctx.between(16, 24), ctx.colors[0]);
  ctx.poly(curvePoly(12, 228, 330, ctx.between(10, 20), ctx.between(0.02, 0.05), ctx.between(0, TAU), 346), ctx.green(0), { inset: 1, still: true });
  return 'rainbow';
}

function windy(ctx) {
  const streaks = ctx.int(4, 6);
  for (let i = 0; i < streaks; i++) {
    const y = 110 + i * ctx.between(32, 44);
    const x0 = ctx.between(10, 50);
    const len = ctx.between(120, 170);
    ctx.stroke(
      `M${fmt(x0)} ${fmt(y)} C${fmt(x0 + len * 0.3)} ${fmt(y - 14)} ${fmt(x0 + len * 0.6)} ${fmt(y + 14)} ${fmt(x0 + len)} ${fmt(y)} a14 14 0 1 0 -4 -22`,
      ctx.pick([ctx.colors[1], ctx.colors[5], ctx.colors[2]]), 5, x0 + len / 2, y, [x0, y - 34, x0 + len + 16, y + 18]
    );
  }
  const leaves = ctx.int(8, 12);
  for (let i = 0; i < leaves; i++) {
    const x = ctx.between(20, 220);
    const y = ctx.between(110, 340);
    const s = ctx.between(8, 14);
    ctx.poly(rotRect(x, y, s * 2, s * 0.9, ctx.between(0, TAU)), ctx.pick([ctx.green(0), ctx.green(1), ctx.col(0), ctx.col(3)]), { inset: 1, loose: true });
  }
  fairCloud(ctx, ctx.between(70, 150), 72, ctx.between(100, 130));
  return 'windy day';
}

function fog(ctx) {
  const tones = FOG[ctx.kind] || FOG.dark;
  for (let layer = 0; layer < 4; layer++) {
    const base = 170 + layer * 52;
    const count = ctx.int(4, 6);
    for (let i = 0; i < count; i++) pine(ctx, ctx.between(26, 214), base, ctx.between(60, 110) + layer * 8, tones[layer], tones[Math.max(0, layer - 1)]);
    ctx.poly(rectPts(14, base, 212, 40), tones[layer], { inset: 1, still: true });
    ctx.raw(`<rect x="14" y="${base - 16}" width="212" height="36" fill="${ctx.colors[1]}" opacity=".5"/>`, 120, base, [14, base - 16, 226, base + 20]);
  }
  return 'foggy forest';
}

function sunnyday(ctx) {
  const sx = ctx.between(140, 190);
  const sy = ctx.between(80, 110);
  const r = ctx.between(26, 34);
  const rays = 12;
  for (let i = 0; i < rays; i++) {
    const a = (i * TAU) / rays;
    ctx.poly([pol(sx, sy, r + 6, a - 0.1), pol(sx, sy, r + ctx.between(20, 30), a), pol(sx, sy, r + 6, a + 0.1)], ctx.colors[0], { inset: 1, still: true });
  }
  ctx.circ(sx, sy, r, ctx.colors[0]);
  fairCloud(ctx, ctx.between(50, 90), ctx.between(120, 150), ctx.between(80, 100));
  fairCloud(ctx, ctx.between(120, 170), ctx.between(190, 210), ctx.between(60, 80));
  for (let i = 0; i < 3; i++) {
    const x = ctx.between(30, 150);
    const y = ctx.between(60, 160);
    ctx.stroke(`M${fmt(x)} ${fmt(y)} q8 -8 16 0 q8 -8 16 0`, ctx.ink, 3, x + 16, y - 4, [x, y - 8, x + 32, y]);
  }
  for (let j = 0; j < 2; j++) {
    ctx.poly(curvePoly(12, 228, 270 + j * 40, ctx.between(20, 40), ctx.between(0.02, 0.05), ctx.between(0, TAU), 346), ctx.green(j * 2), { inset: 1, still: true });
  }
  for (let i = 0; i < 6; i++) ctx.circ(ctx.between(24, 216), ctx.between(300, 336), 3.5, ctx.pick([ctx.col(3), ctx.col(6), ctx.colors[1]]));
  return 'sunny day';
}

function tornado(ctx) {
  const [s1, s2, s3] = storm(ctx);
  cloud(ctx, 90, 80, 150, s3, s2);
  cloud(ctx, 150, 100, 170, s1, s2);
  const phase = ctx.between(0, TAU);
  const layers = 9;
  for (let i = 0; i < layers; i++) {
    const y = 120 + i * 24;
    const w0 = 110 - i * 10;
    const w1 = 110 - (i + 1) * 10;
    const c0 = 120 + Math.sin(i * 0.9 + phase) * 12;
    const c1 = 120 + Math.sin((i + 1) * 0.9 + phase) * 12;
    ctx.poly([[c0 - w0 / 2, y], [c0 + w0 / 2, y], [c1 + w1 / 2, y + 24], [c1 - w1 / 2, y + 24]], i % 2 ? s1 : s2, { inset: 1, loose: ctx.rand() < 0.12 });
  }
  for (let i = 0; i < 9; i++) {
    const y = ctx.between(130, 330);
    const spread = 60 - (y - 120) * 0.2;
    const x = 120 + ctx.between(-spread, spread) * 1.3;
    ctx.poly(rotRect(x, y, ctx.between(8, 16), ctx.between(5, 9), ctx.between(0, TAU)), ctx.pick([ctx.col(0), ctx.col(4), ctx.green(0)]), { inset: 1, loose: true });
  }
  ctx.poly(curvePoly(12, 228, 340, 10, 0.04, phase, 350), ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < 5; i++) ctx.circ(ctx.between(60, 180), ctx.between(322, 342), ctx.between(8, 14), s1);
  return 'tornado';
}

function cloudscape(ctx) {
  const sky = ['#E5534B', '#F79BB0', '#E9A93B'];
  const bandH = 66;
  sky.forEach((c, i) => ctx.poly(rectPts(12, 50 + i * bandH, 216, bandH + 1), c, { inset: 1, still: true }));
  const sx = ctx.between(80, 160);
  ctx.shape(`M${fmt(sx - 44)} 262 A44 44 0 0 1 ${fmt(sx + 44)} 262 Z`, ctx.colors[1], sx, 240, [sx - 44, 218, sx + 44, 262]);
  const strips = ctx.int(5, 7);
  for (let i = 0; i < strips; i++) {
    const y = 80 + i * ctx.between(24, 32);
    const x = ctx.between(40, 200);
    const w = ctx.between(34, 60);
    const color = ctx.pick(['#FFF0B8', '#F79BB0', '#8E2A33', '#FFFFFF']);
    ctx.ellipse(x, y, w, ctx.between(6, 10), color);
    ctx.ellipse(x - w * 0.5, y + 3, w * 0.55, 6, color);
    ctx.ellipse(x + w * 0.55, y + 2, w * 0.6, 7, color);
  }
  ctx.poly(curvePoly(12, 228, 290, ctx.between(14, 28), ctx.between(0.02, 0.05), ctx.between(0, TAU), 346), '#8E2A33', { inset: 1, still: true });
  ctx.poly(curvePoly(12, 228, 320, ctx.between(10, 20), ctx.between(0.03, 0.06), ctx.between(0, TAU), 346), '#4A1B2A', { inset: 1, still: true });
  return 'sunset clouds';
}

module.exports = { rainstorm, thunderstorm, snowfall, rainbow, windy, fog, sunnyday, tornado, cloudscape };
