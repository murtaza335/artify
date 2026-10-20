'use strict';

// Anime-style scenes and manga geometry: a school gate under blossoms, a ramen stall, a rooftop at sunset, a level
// crossing, a shrine gate, a neon alley, a summer festival, floating islands, a hot spring, a warm room, a
// transformation burst, a mecha hangar, and four manga compositions.

const { TAU, fmt, pol, rectPts, rotRect, blob, dotField, stripes, curvePoly, starPoints, arcBand } = require('./engine');
const T = require('./toon');

const R = rectPts;
const still = { inset: 1, still: true };
// The panel colour is kept on ctx.bg, so figures and props drawn on it can stay clear of it.
const panel = (ctx, fill) => {
  ctx.bg = fill;
  ctx.poly(R(14, 48, 212, 298), fill, still);
};
const tone = (ctx, off = 4) => ctx.col(ctx.int(0, 7) + off);

function windows(ctx, x, y, w, h, cols, rows, color) {
  let svg = '';
  const cw = w / cols;
  const rh = h / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) svg += `<rect x="${fmt(x + c * cw + cw * 0.18)}" y="${fmt(y + r * rh + rh * 0.2)}" width="${fmt(cw * 0.64)}" height="${fmt(rh * 0.6)}" fill="${color}"/>`;
  T.grp(ctx, svg, x + w / 2, y + h / 2, w / 2, h / 2);
}

function sakuraSchool(ctx) {
  panel(ctx, ctx.col(5));
  ctx.poly(R(14, 306, 212, 40), ctx.green(0), still);
  // The school stands to one side and the blossom tree beside it, by the gate, so the two never overlap.
  const side = ctx.pick([-1, 1]);
  const x0 = side < 0 ? 24 : 86;
  const wall = T.apart(ctx, ctx.colors[1], ctx.bg);
  ctx.poly(R(x0, 160, 130, 146), wall, still);
  ctx.poly([[x0 - 8, 160], [x0 + 138, 160], [x0 + 112, 132], [x0 + 18, 132]], T.apart(ctx, ctx.col(3), ctx.bg), still);
  windows(ctx, x0 + 8, 176, 114, 70, 4, 2, T.apart(ctx, ctx.col(5), wall));
  const door = x0 + 48;
  ctx.poly(R(door, 254, 34, 52), ctx.col(4), still);
  ctx.circ(x0 + 65, 146, 8, wall);
  const tx = side < 0 ? 186 : 54;
  for (const gx of [tx - 30, tx + 22]) ctx.poly(R(gx, 270, 8, 36), ctx.col(4), still);
  ctx.poly([[tx - 7, 306], [tx + 7, 306], [tx + 4, 190], [tx - 4, 190]], ctx.col(4), still);
  for (let i = 0; i < 6; i++) blob(ctx, tx + ctx.between(-16, 16), 172 + ctx.between(-30, 24), ctx.between(17, 22), 0.2, T.apart(ctx, ctx.col(ctx.pick([6, 6, 1])), ctx.bg), 7);
  for (let i = 0; i < 16; i++) ctx.ellipse(ctx.between(24, 216), ctx.between(70, 320), 5, 3, ctx.col(6), ctx.between(0, 3));
  return 'school gate in blossom';
}

function ramenStall(ctx) {
  panel(ctx, ctx.col(4));
  for (let i = 0; i < 3; i++) {
    const x = 50 + i * 70;
    ctx.line(x, 52, x, 76, ctx.colors[1], 2);
    ctx.circ(x, 92, 16, ctx.col(3));
    ctx.poly(R(x - 8, 88, 16, 3), ctx.ink, still);
  }
  const strips = ctx.int(4, 5);
  const sw = 190 / strips;
  for (let i = 0; i < strips; i++) ctx.poly([[25 + i * sw, 120], [25 + (i + 1) * sw - 3, 120], [25 + (i + 1) * sw - 3, 200], [25 + i * sw + sw / 2 - 2, 188], [25 + i * sw, 200]], ctx.col(i % 2 ? 3 : 0), still);
  ctx.poly(R(24, 214, 192, 22), ctx.col(2) === ctx.col(4) ? ctx.ink : ctx.col(2), still);
  ctx.poly(R(14, 236, 212, 110), ctx.ink, still);
  ctx.shape('M80 232 A40 34 0 0 0 160 232 Z', ctx.colors[1], 120, 246, [80, 232, 160, 266]);
  for (let i = 0; i < 4; i++) ctx.stroke(`M${88 + i * 14} 226 q8 -6 0 -12`, ctx.col(0), 3, 90 + i * 14, 220, [84 + i * 14, 212, 100 + i * 14, 228]);
  ctx.circ(ctx.pick([104, 134]), 224, 9, ctx.col(0));
  ctx.poly(R(134, 204, 28, 6), ctx.col(3), still);
  for (let i = 0; i < 3; i++) ctx.stroke(`M${100 + i * 20} 196 q10 -14 0 -26 t0 -26`, ctx.colors[1], 3, 104 + i * 20, 172, [92 + i * 20, 118, 116 + i * 20, 198]);
  return 'ramen stall at night';
}

function rooftopSunset(ctx) {
  const hue = ctx.int(0, 7);
  stripes(ctx, [14, 48, 212, 160], 7, () => 0, (k) => ctx.col(hue + (k % 4) * 2 + 1), 2);
  ctx.circ(ctx.between(80, 160), 200, ctx.between(48, 62), ctx.col(0));
  ctx.poly([[14, 208], [14, 170], [40, 170], [40, 150], [66, 150], [66, 186], [96, 186], [96, 160], [126, 160], [126, 176], [160, 176], [160, 140], [186, 140], [186, 190], [226, 190], [226, 208]], ctx.ink, still);
  ctx.poly(R(14, 208, 212, 138), ctx.col(4), still);
  const tx = ctx.pick([50, 180]);
  ctx.poly(R(tx - 22, 128, 44, 40), ctx.col(2), still);
  ctx.poly([[tx - 26, 128], [tx, 108], [tx + 26, 128]], ctx.col(3), still);
  for (const s of [-1, 1]) ctx.line(tx + s * 16, 168, tx + s * 20, 208, ctx.ink, 3);
  ctx.poly(R(14, 214, 212, 4), ctx.ink, still);
  for (let i = 0; i < 12; i++) ctx.poly(R(14 + i * 18, 214, 3, 96), ctx.ink, still);
  ctx.poly(R(14, 306, 212, 6), ctx.ink, still);
  const px = ctx.between(90, 150);
  ctx.circ(px, 262, 12, ctx.ink);
  ctx.poly([[px - 16, 330], [px - 12, 276], [px + 12, 276], [px + 16, 330]], ctx.ink, still);
  return 'rooftop at sunset';
}

function trainCrossing(ctx) {
  panel(ctx, ctx.col(5));
  for (let i = 0; i < 3; i++) blob(ctx, ctx.between(50, 190), ctx.between(80, 130), ctx.between(22, 34), 0.2, ctx.colors[1], 7);
  ctx.poly([[14, 230], [60, 190], [110, 224], [170, 184], [226, 226], [226, 250], [14, 250]], ctx.green(1), { inset: 1, still: true });
  ctx.poly(R(14, 250, 212, 96), ctx.col(4) === ctx.ink ? ctx.col(2) : ctx.col(4), still);
  for (let i = 0; i < 2; i++) ctx.poly([[100 + i * 50, 250], [140 + i * 50, 250], [60 + i * 90, 346], [30 + i * 100, 346]], ctx.ink, { inset: 1, still: true });
  for (let i = 0; i < 6; i++) ctx.line(100 - i * 8, 262 + i * 16, Math.min(220, 190 + i * 8), 262 + i * 16, ctx.col(0), 3);
  const px = ctx.pick([36, 200]);
  ctx.poly(R(px - 3, 110, 6, 190), ctx.ink, still);
  ctx.poly(R(px - 22, 120, 44, 4), ctx.ink, still);
  ctx.stroke(`M14 124 Q${px / 2 + 60} 170 ${px} 124 Q${px + 60} 172 226 126`, ctx.ink, 2, 120, 150, [14, 120, 226, 176]);
  // The barrier arm reaches from the post across the road, never past the panel.
  const dir = px < 120 ? 1 : -1;
  for (let i = 0; i < 4; i++) ctx.poly(R(dir > 0 ? px + i * 20 : px - (i + 1) * 20, 262, 20, 6), i % 2 ? ctx.colors[1] : ctx.col(3), still);
  ctx.poly(R(px - 4, 200, 8, 100), ctx.ink, still);
  ctx.circ(px, 196, 7, ctx.col(3));
  ctx.circ(px, 214, 7, ctx.col(3));
  return 'level crossing';
}

function shrineGate(ctx) {
  const hue = ctx.int(0, 7);
  panel(ctx, ctx.col(hue + 4));
  ctx.circ(ctx.pick([60, 180]), ctx.between(90, 120), ctx.between(22, 30), ctx.colors[1]);
  const red = ctx.col(3);
  ctx.poly([[14, 346], [14, 270], [70, 250], [120, 270], [170, 246], [226, 270], [226, 346]], T.mix(ctx.col(hue + 4), ctx.ink, 0.3), still);
  for (const s of [-1, 1]) ctx.poly(R(120 + s * 50 - 8, 140, 16, 190), red, still);
  ctx.poly([[40, 138], [200, 138], [214, 118], [26, 118]], ctx.ink, still);
  ctx.poly(R(52, 152, 136, 10), red, still);
  ctx.poly(R(104, 138, 32, 16), red, still);
  for (let i = 0; i < 4; i++) ctx.poly(R(100 - i * 6, 326 + i * 4 - 14 * 0, 40 + i * 12, 5), ctx.col(2), still);
  for (const s of [-1, 1]) {
    ctx.poly(R(120 + s * 92 - 8, 280, 16, 50), ctx.col(2), still);
    ctx.poly(R(120 + s * 92 - 13, 266, 26, 14), ctx.col(2), still);
    ctx.poly([[120 + s * 92 - 16, 266], [120 + s * 92 + 16, 266], [120 + s * 92, 252]], ctx.col(2), still);
  }
  for (let i = 0; i < 14; i++) ctx.circ(ctx.between(24, 216), ctx.between(180, 320), ctx.between(1.6, 3), ctx.col(0));
  return 'shrine gate';
}

function neonAlley(ctx) {
  panel(ctx, ctx.ink);
  const hue = ctx.int(0, 7);
  ctx.poly([[14, 48], [90, 90], [90, 250], [14, 346]], ctx.col(4), still);
  ctx.poly([[226, 48], [150, 90], [150, 250], [226, 346]], ctx.col(4), still);
  ctx.poly([[90, 90], [150, 90], [150, 250], [90, 250]], T.mix(ctx.col(4), ctx.ink, 0.4), still);
  const signs = ctx.int(5, 7);
  for (let i = 0; i < signs; i++) {
    const left = i % 2 === 0;
    const y = 90 + Math.floor(i / 2) * 50 + ctx.between(0, 14);
    const x = left ? 20 + ctx.between(0, 24) : 160 + ctx.between(0, 24);
    ctx.poly(R(x, y, ctx.between(30, 44), ctx.between(10, 16)), ctx.col(hue + i * 2 + 3), still);
  }
  ctx.poly(R(14, 250, 212, 96), ctx.col(4) === ctx.ink ? ctx.col(2) : ctx.ink, still);
  for (let i = 0; i < 6; i++) {
    const w = ctx.between(24, 50);
    ctx.poly(R(ctx.between(20, 220 - w), 260 + i * 12, w, 5), ctx.col(hue + i * 2 + 3), { inset: 1, still: true });
  }
  for (let g = 0; g < 5; g++) {
    let svg = '';
    for (let k = 0; k < 8; k++) {
      const x = ctx.between(24, 216);
      const y = ctx.between(60, 300);
      svg += `<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(x - 6)}" y2="${fmt(y + 22)}" stroke="${ctx.colors[1]}" stroke-width="1.6" stroke-opacity="0.55"/>`;
    }
    T.grp(ctx, svg, 120, 180, 100, 130);
  }
  ctx.circ(120, 150, 16, ctx.col(0));
  return 'rainy neon alley';
}

function summerFestival(ctx) {
  panel(ctx, ctx.col(4));
  for (let b = 0; b < 2; b++) {
    const x = ctx.between(70, 170);
    const y = 100 + b * 80;
    const n = 14;
    const c = ctx.col(b * 3 + ctx.int(0, 7));
    let svg = '';
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pol(x, y, 14, (i * TAU) / n);
      const [x2, y2] = pol(x, y, ctx.between(36, 50), (i * TAU) / n);
      svg += `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${c}" stroke-width="4" stroke-linecap="round"/><circle cx="${fmt(x2)}" cy="${fmt(y2)}" r="3.4" fill="${ctx.colors[1]}"/>`;
    }
    T.grp(ctx, svg, x, y, 56, 56);
  }
  ctx.stroke('M14 56 Q120 90 226 56', ctx.ink, 2, 120, 72, [14, 54, 226, 90]);
  for (let i = 0; i < 6; i++) {
    const x = 30 + i * 36;
    const y = 56 + 34 * Math.sin(Math.PI * (x - 14) / 212);
    ctx.circ(x, y + 8, 9, ctx.col(i % 2 ? 3 : 0));
  }
  ctx.poly([[14, 346], [14, 300], [226, 300], [226, 346]], ctx.ink, still);
  for (const x of [66, 150]) {
    ctx.circ(x, 262, 9, ctx.col(6));
    ctx.poly([[x - 12, 340], [x - 9, 274], [x + 9, 274], [x + 12, 340]], ctx.col(ctx.int(0, 7)), still);
  }
  ctx.poly([[100, 300], [140, 300], [136, 270], [104, 270]], ctx.col(3), still);
  return 'summer festival';
}

function floatingIslands(ctx) {
  const hue = ctx.int(0, 7);
  panel(ctx, ctx.col(hue + 5));
  for (let i = 0; i < 4; i++) blob(ctx, ctx.between(30, 210), ctx.between(70, 330), ctx.between(16, 28), 0.2, ctx.colors[1], 6);
  const isl = (x, y, w, h) => {
    ctx.poly([[x - w, y], [x + w, y], [x + w * 0.5, y + h], [x + w * 0.1, y + h * 1.4], [x - w * 0.4, y + h * 0.9]], ctx.col(4), { inset: 1, still: true });
    ctx.poly([[x - w, y], [x + w, y], [x + w * 0.9, y - 10], [x - w * 0.9, y - 10]], ctx.green(0), still);
    blob(ctx, x - w * 0.3, y - 22, 14, 0.2, ctx.green(2), 6);
  };
  // The waterfall pours off the island's left lip, so it is drawn first and the island sits over its top.
  ctx.poly(R(26, 146, 7, 110), T.apart(ctx, ctx.col(5), ctx.bg), still);
  isl(80, 150, 56, 60);
  isl(170, 250, 40, 44);
  const ax = ctx.between(100, 160);
  ctx.ellipse(ax, 96, 30, 14, ctx.col(3), 0);
  ctx.poly(R(ax - 14, 108, 28, 10), ctx.col(4), still);
  ctx.poly([[ax + 30, 96], [ax + 42, 88], [ax + 42, 104]], ctx.col(0), still);
  return 'floating islands';
}

function onsenNight(ctx) {
  panel(ctx, ctx.col(4));
  for (let i = 0; i < 12; i++) ctx.circ(ctx.between(24, 216), ctx.between(58, 150), ctx.between(1, 2.2), ctx.colors[1]);
  ctx.circ(ctx.pick([56, 184]), 100, 22, ctx.colors[1]);
  ctx.poly([[14, 346], [14, 220], [226, 220], [226, 346]], ctx.col(5), still);
  ctx.ellipse(120, 280, 90, 44, ctx.col(2), 0);
  for (let i = 0; i < 5; i++) blob(ctx, 40 + i * 40 + ctx.between(-6, 6), 250 + (i % 2) * 6, ctx.between(18, 28), 0.2, ctx.pick([ctx.ink, ctx.col(4)]), 6);
  const mx = ctx.between(100, 140);
  ctx.circ(mx, 264, 18, ctx.col(3));
  ctx.ellipse(mx, 268, 11, 9, ctx.col(6), 0);
  for (const s of [-1, 1]) { ctx.circ(mx + s * 7, 262, 2.4, ctx.ink); ctx.circ(mx + s * 18, 258, 6, ctx.col(3)); }
  ctx.poly(R(mx - 12, 244, 24, 6), ctx.colors[1], still);
  for (let i = 0; i < 4; i++) ctx.stroke(`M${70 + i * 30} 236 q10 -16 0 -30 t0 -30`, ctx.colors[1], 4, 74 + i * 30, 206, [62 + i * 30, 146, 90 + i * 30, 238]);
  for (let i = 0; i < 12; i++) ctx.circ(ctx.between(24, 216), ctx.between(60, 320), 2.4, ctx.colors[1]);
  return 'hot spring at night';
}

function kotatsuRoom(ctx) {
  panel(ctx, ctx.col(ctx.pick([0, 6, 1])));
  ctx.poly(R(14, 250, 212, 96), ctx.col(4), still);
  ctx.poly(R(48, 70, 100, 100), ctx.col(4), still);
  ctx.poly(R(56, 78, 84, 84), ctx.col(5), still);
  for (let i = 0; i < 12; i++) ctx.circ(ctx.between(62, 134), ctx.between(84, 156), 2.4, ctx.colors[1]);
  ctx.poly(R(95, 78, 4, 84), ctx.col(4), still);
  ctx.poly([[40, 250], [200, 250], [214, 300], [26, 300]], ctx.col(3), still);
  ctx.poly(R(26, 232, 188, 20), ctx.col(2) === ctx.col(3) ? ctx.col(5) : ctx.col(2), still);
  const cx = ctx.between(70, 150);
  ctx.circ(cx, 224, 11, ctx.col(0));
  ctx.circ(cx + 20, 228, 10, ctx.col(0));
  ctx.circ(cx + 10, 216, 9, ctx.col(0));
  ctx.line(cx + 10, 207, cx + 14, 202, ctx.green(0), 3);
  blob(ctx, 170, 322, 30, 0.1, ctx.col(ctx.pick([0, 7, 6])), 6);
  for (const s of [-1, 1]) ctx.poly([[170 + s * 14, 296], [170 + s * 26, 284], [170 + s * 28, 304]], ctx.col(6), { inset: 1, still: true });
  ctx.stroke('M200 326 q16 -4 10 -22', ctx.col(0), 7, 206, 316, [196, 300, 216, 328]);
  return 'warm room with a sleeping cat';
}

function transformation(ctx) {
  panel(ctx, ctx.col(ctx.pick([6, 5, 3])));
  T.speedLines(ctx, 120, 196, 50, 230, 26, ctx.colors[1], { area: [16, 50, 224, 344], spread: 0.07 });
  for (let k = 0; k < 4; k++) {
    let d = '';
    for (let i = 0; i <= 28; i++) {
      const a = i * 0.32 + k * (TAU / 4);
      const r = 30 + i * 2.45;
      const [x, y] = pol(120, 196, r, a);
      d += (i ? 'L' : 'M') + fmt(x) + ' ' + fmt(y * 1);
    }
    ctx.stroke(d, ctx.col(k * 2 + 3), 10, 120, 196, [20, 96, 220, 296]);
  }
  ctx.circ(120, 156, 17, ctx.colors[1]);
  ctx.poly([[100, 176], [140, 176], [150, 250], [90, 250]], ctx.colors[1], still);
  for (let i = 0; i < 8; i++) T.sparkle(ctx, ctx.between(30, 210), ctx.between(64, 330), ctx.between(6, 14), ctx.pick([ctx.colors[1], ctx.colors[0]]));
  return 'transformation burst';
}

function mechaHangar(ctx) {
  panel(ctx, ctx.col(4));
  for (let i = 0; i < 7; i++) ctx.poly(R(14, 56 + i * 40, 212, 4), ctx.col(2), still);
  for (let i = 0; i < 3; i++) {
    const x = 50 + i * 70;
    ctx.raw(`<polygon points="${x},48 ${x - 30},346 ${x + 30},346" fill="${ctx.colors[1]}" fill-opacity="0.18"/>`, x, 200, [x - 30, 48, x + 30, 346]);
  }
  const c = T.mix(ctx.col(2), ctx.ink, 0.5);
  ctx.poly(R(88, 80, 64, 50), c, still);
  ctx.poly([[100, 80], [140, 80], [130, 66], [110, 66]], c, still);
  ctx.poly([[70, 130], [170, 130], [160, 250], [80, 250]], c, still);
  for (const s of [-1, 1]) {
    ctx.poly(R(120 + s * 60 - 12, 130, 24, 110), c, still);
    ctx.poly(R(120 + s * 22 - 14, 250, 28, 90), c, still);
  }
  ctx.circ(120, 108, 6, ctx.col(0));
  ctx.circ(120, 180, 12, ctx.col(3));
  ctx.poly(R(14, 300, 212, 46), ctx.ink, still);
  for (let i = 0; i < 4; i++) ctx.poly(R(24 + i * 56, 306, 34, 20), ctx.col(i % 2 ? 0 : 3), still);
  return 'mecha hangar';
}

function speedBurst(ctx) {
  const bg = ctx.col(ctx.int(0, 7) + 4);
  panel(ctx, bg);
  T.speedLines(ctx, 120, 196, 56, 230, 34, ctx.colors[1], { area: [16, 50, 224, 344], spread: 0.045 });
  T.speedLines(ctx, 120, 196, 72, 180, 22, ctx.col(ctx.int(0, 7)), { area: [16, 50, 224, 344], spread: 0.03 });
  ctx.poly(starPoints(120, 196, 54, 26, ctx.int(9, 13), ctx.rand()), ctx.colors[0], { inset: 1, still: true });
  ctx.poly(starPoints(120, 196, 34, 16, ctx.int(7, 11), ctx.rand()), ctx.col(3), { inset: 1, still: true });
  return 'speed burst';
}

function mangaPanels(ctx) {
  const ink = ctx.ink;
  const cells = [];
  const split = (x, y, w, h, d) => {
    if (d === 0 || w < 70 || h < 70) { cells.push([x, y, w, h]); return; }
    if (w > h * 0.9 ? ctx.rand() < 0.7 : ctx.rand() < 0.25) {
      const s = ctx.between(0.35, 0.65);
      split(x, y, w * s - 3, h, d - 1);
      split(x + w * s + 3, y, w * (1 - s) - 3, h, d - 1);
    } else {
      const s = ctx.between(0.35, 0.65);
      split(x, y, w, h * s - 3, d - 1);
      split(x, y + h * s + 3, w, h * (1 - s) - 3, d - 1);
    }
  };
  panel(ctx, ctx.colors[1]);
  split(20, 54, 200, 286, 3);
  cells.forEach(([x, y, w, h], i) => {
    const kind = i % 4;
    ctx.poly(R(x, y, w, h), kind === 1 ? ctx.col(ctx.int(0, 7)) : ctx.colors[1], { inset: 1, still: true });
    if (kind === 0) dotField(ctx, [x, y, w, h], 8, (px, py) => 2.4 * (0.4 + 0.6 * (py - y) / h), () => ink, 4);
    else if (kind === 2) ctx.poly([[x, y + h], [x + w * 0.5, y + h * 0.2], [x + w, y + h]], ink, { inset: 1, still: true });
    else if (kind === 3) { ctx.circ(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, ink); ctx.circ(x + w / 2 - 4, y + h / 2 - 4, Math.min(w, h) * 0.08, ctx.colors[1]); }
    ctx.raw(`<rect x="${x}" y="${y}" width="${fmt(w)}" height="${fmt(h)}" fill="none" stroke="${ink}" stroke-width="3"/>`, x + w / 2, y + h / 2, [x, y, x + w, y + h]);
  });
  return 'manga page';
}

function screentoneGradient(ctx) {
  const a = ctx.col(ctx.int(0, 7));
  const b = ctx.col(ctx.int(0, 7) + 4);
  panel(ctx, b);
  const cx = ctx.between(80, 160);
  const cy = ctx.between(140, 250);
  dotField(ctx, [18, 52, 204, 290], 10, (x, y) => Math.max(0, 1 - Math.hypot(x - cx, y - cy) / 150) * 4.8, () => a, 6);
  dotField(ctx, [18, 52, 204, 290], 10, (x, y) => Math.max(0, (y - 52) / 290 - 0.3) * 4.8, () => ctx.colors[1], 6);
  return 'screentone gradient';
}

function impactFrame(ctx) {
  const dark = ctx.ink;
  const light = ctx.colors[1];
  panel(ctx, dark);
  const cx = ctx.between(90, 150);
  const cy = ctx.between(170, 220);
  const n = ctx.int(10, 14);
  for (let i = 0; i < n; i++) {
    const a0 = (i * TAU) / n;
    const a1 = ((i + 1) * TAU) / n;
    const r = ctx.between(120, 220);
    const clamp = ([x, y]) => [Math.max(16, Math.min(224, x)), Math.max(50, Math.min(344, y))];
    ctx.poly([[cx, cy], clamp(pol(cx, cy, r, a0)), clamp(pol(cx, cy, r * ctx.between(0.5, 1), (a0 + a1) / 2)), clamp(pol(cx, cy, r, a1))], i % 2 ? light : dark, { inset: 1, still: true });
  }
  ctx.poly(starPoints(cx, cy, 70, 30, ctx.int(8, 12), ctx.rand()), ctx.col(3), { inset: 1, still: true });
  ctx.poly(starPoints(cx, cy, 36, 14, ctx.int(6, 9), ctx.rand()), light, { inset: 1, still: true });
  return 'impact frame';
}

module.exports = { sakuraSchool, ramenStall, rooftopSunset, trainCrossing, shrineGate, neonAlley, summerFestival, floatingIslands, onsenNight, kotatsuRoom, transformation, mechaHangar, speedBurst, mangaPanels, screentoneGradient, impactFrame };
