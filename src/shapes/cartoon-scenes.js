'use strict';

// Cartoon scenes and effects with ink outlines: a chase, a falling anvil, a cliff edge, hills with faces, a crooked
// house, a comic burst, a bouncing ball and a retro TV.

const { TAU, fmt, pol, rectPts, starPoints, blob, dotField, curvePoly } = require('./engine');
const T = require('./toon');

const R = rectPts;
const still = { inset: 1, still: true };
// The panel colour is kept on ctx.bg, so figures and props drawn on it can stay clear of it.
const panel = (ctx, fill) => {
  ctx.bg = fill;
  ctx.poly(R(14, 48, 212, 298), fill, still);
};
const tone = (ctx, off = 4) => ctx.col(ctx.int(0, 7) + off);
const OE = T.outlineEllipse;
const OP = T.outlinePoly;
const OPath = T.outlinePath;

function chaseScene(ctx) {
  panel(ctx, ctx.col(ctx.pick([0, 6, 1])));
  const flip = ctx.rand() < 0.5;
  const d = flip ? 1 : -1;
  for (let i = 0; i < 4; i++) {
    const x = 24 + i * 56;
    OP(ctx, [[x, 130], [x + 34, 130], [x + 34, 290], [x, 290]], ctx.col(i % 2 ? 2 : 3));
    OP(ctx, [[x + 6, 150], [x + 28, 150], [x + 28, 190], [x + 6, 190]], ctx.col(5), 3);
  }
  ctx.poly(R(14, 290, 212, 56), ctx.col(4), still);
  const cat = T.apart(ctx, ctx.col(ctx.pick([5, 7, 2])), ctx.bg);
  const mouse = T.apart(ctx, ctx.col(ctx.pick([1, 6])), ctx.col(4));
  const catX = 120 - d * 22;
  OE(ctx, catX, 266, 40, 24, cat);
  OE(ctx, catX + d * 40, 252, 22, 20, cat);
  OP(ctx, [[catX + d * 34, 238], [catX + d * 40, 218], [catX + d * 48, 238]], cat, 3);
  ctx.circ(catX + d * 48, 250, 3.6, ctx.ink);
  T.hose(ctx, `M${catX - d * 36} 262 q${-d * 22} -26 ${-d * 8} -50`, cat, 7, [catX - 80, 200, catX + 20, 280]);
  for (let i = 0; i < 3; i++) T.hose(ctx, `M${catX + d * (i * 12 - 10)} 282 l${-d * 22} 22`, cat, 6, [catX - 60, 270, catX + 60, 312]);
  const mx = 120 + d * 66;
  OE(ctx, mx, 296, 18, 12, mouse);
  OE(ctx, mx + d * 16, 290, 9, 8, mouse, 3);
  ctx.circ(mx + d * 18, 288, 2.4, ctx.ink);
  for (let i = 0; i < 3; i++) ctx.line(mx - d * 24 - i * 10, 288 + i * 6, mx - d * 46 - i * 12, 288 + i * 6, ctx.ink, 3);
  for (let i = 0; i < 4; i++) ctx.circ(catX - d * (44 + i * 9), 304 + ctx.between(-6, 6), 6 + i * 1.2, ctx.colors[1]);
  return 'chase scene';
}

function anvilDrop(ctx) {
  panel(ctx, ctx.col(ctx.pick([5, 0, 6])));
  ctx.poly(R(14, 280, 212, 66), ctx.col(ctx.pick([0, 3, 4])) === ctx.col(0) ? ctx.col(3) : ctx.col(4), still);
  const x = ctx.between(100, 140);
  ctx.ellipse(x, 314, 58, 10, ctx.ink, 0);
  OP(ctx, [[x - 40, 114], [x + 40, 114], [x + 24, 146], [x + 30, 160], [x + 50, 160], [x + 50, 172], [x - 50, 172], [x - 50, 160], [x - 30, 160], [x - 24, 146]], ctx.col(4) === ctx.ink ? ctx.col(2) : ctx.col(2));
  OP(ctx, [[x - 40, 114], [x - 70, 126], [x - 40, 134]], ctx.col(2));
  for (let i = 0; i < 5; i++) ctx.line(x - 36 + i * 18, 72, x - 36 + i * 18, 100 + (i % 2) * 8, ctx.ink, 3);
  OE(ctx, x, 262, 18, 22, ctx.col(ctx.int(0, 7)));
  OE(ctx, x, 224, 22, 22, ctx.colors[1]);
  for (const s of [-1, 1]) { ctx.circ(x + s * 8, 218, 6, '#FFFFFF'); ctx.circ(x + s * 8 - 1, 214, 3, ctx.ink); }
  ctx.shape(`M${x - 8} 232 Q${x} 240 ${x + 8} 232 L${x + 8} 238 Q${x} 246 ${x - 8} 238 Z`, ctx.ink, x, 238, [x - 8, 232, x + 8, 246]);
  for (const s of [-1, 1]) {
    T.hose(ctx, `M${x + s * 16} 254 q${s * 20} -26 ${s * 8} -50`, ctx.colors[1], 6, [x - 50, 190, x + 50, 270]);
    T.hose(ctx, `M${x + s * 8} 282 l${s * 8} 30`, ctx.colors[1], 6, [x - 30, 280, x + 30, 316]);
  }
  return 'falling anvil';
}

function desertCliff(ctx) {
  panel(ctx, ctx.col(ctx.pick([0, 6, 5])));
  ctx.circ(ctx.pick([60, 180]), 96, ctx.between(20, 30), ctx.col(3));
  const rock = ctx.col(ctx.pick([3, 4, 0]));
  const side = ctx.pick([-1, 1]);
  const edge = 120 + side * 20;
  const cliff = side > 0 ? [[14, 346], [14, 200], [edge, 200], [edge + 8, 240], [edge - 6, 280], [edge + 4, 346]] : [[226, 346], [226, 200], [edge, 200], [edge - 8, 240], [edge + 6, 280], [edge - 4, 346]];
  OP(ctx, cliff, rock);
  for (let i = 0; i < 4; i++) ctx.line(side > 0 ? 24 + i * 16 : 216 - i * 16, 214 + i * 24, side > 0 ? 50 + i * 16 : 190 - i * 16, 214 + i * 24, ctx.ink, 2.4);
  ctx.poly(R(14, 320, 212, 26), T.mix(rock, ctx.ink, 0.3), still);
  const x = edge + side * 34;
  const y = 244;
  OE(ctx, x, y + 18, 16, 22, ctx.col(ctx.int(0, 7)));
  OE(ctx, x, y - 14, 20, 20, ctx.colors[1]);
  for (const s of [-1, 1]) { ctx.circ(x + s * 7, y - 16, 6, '#FFFFFF'); ctx.circ(x + s * 7, y - 14, 3, ctx.ink); }
  T.mouth(ctx, x, y - 2, 12, 'o');
  for (const s of [-1, 1]) {
    T.hose(ctx, `M${x + s * 12} ${y + 8} q${s * 10} 18 ${s * 4} 36`, ctx.colors[1], 5, [x - 40, y, x + 40, y + 60]);
    T.hose(ctx, `M${x + s * 14} ${y + 14} l${s * 14} -26`, ctx.colors[1], 5, [x - 40, y - 20, x + 40, y + 40]);
  }
  for (let i = 0; i < 4; i++) ctx.circ(x + ctx.between(-14, 14), 330 + ctx.between(-4, 4), 5 + i, ctx.colors[1]);
  ctx.poly(rectPts(x - 8, 290, 16, 4), ctx.ink, still);
  return 'hanging over the edge';
}

function hillsWithFaces(ctx) {
  panel(ctx, ctx.col(5));
  const hue = ctx.int(0, 7);
  const sx = ctx.pick([50, 190]);
  ctx.circ(sx, 92, 30, T.apart(ctx, ctx.col(0), ctx.bg));
  for (const s of [-1, 1]) { ctx.circ(sx + s * 10, 88, 4, ctx.ink); }
  T.mouth(ctx, sx, 100, 16, 'smile');
  const hills = [[190, 220, 120], [250, 100, 160], [300, 150, 110]];
  hills.forEach(([base, cx, r], i) => {
    const c = ctx.green(i + hue);
    ctx.raw(`<path d="M14 346 L14 ${base} Q${cx} ${base - r} 226 ${base} L226 346 Z" fill="${c}" stroke="${ctx.ink}" stroke-width="3.5" stroke-linejoin="round"/>`, 120, (base + 346) / 2, [14, base - r / 2, 226, 346]);
  });
  const trees = ctx.int(2, 3);
  for (let i = 0; i < trees; i++) {
    const x = 50 + i * 70 + ctx.between(-10, 10);
    const y = 260 + ctx.between(-10, 20);
    OP(ctx, [[x - 6, y + 30], [x + 6, y + 30], [x + 4, y], [x - 4, y]], ctx.col(4));
    OE(ctx, x, y - 12, 28, 26, ctx.green(i + 2));
    for (const s of [-1, 1]) ctx.circ(x + s * 8, y - 14, 3, ctx.ink);
    T.mouth(ctx, x, y - 4, 12, 'smile');
  }
  return 'hills with faces';
}

function wobblyHouse(ctx) {
  panel(ctx, ctx.col(5));
  ctx.poly(R(14, 300, 212, 46), ctx.green(0), still);
  const wall = ctx.col(ctx.int(0, 7));
  OP(ctx, [[56, 304], [50, 190], [64, 186], [174, 192], [184, 196], [188, 306]], wall);
  OP(ctx, [[36, 194], [112, 100], [204, 190]], ctx.col(3));
  OP(ctx, [[152, 140], [174, 150], [176, 112], [154, 108]], ctx.col(4));
  for (let i = 0; i < 3; i++) ctx.circ(166 + i * 6, 100 - i * 16, 9 + i * 3, T.apart(ctx, ctx.colors[1], ctx.bg));
  OP(ctx, [[98, 306], [96, 240], [134, 238], [138, 306]], ctx.col(4));
  for (const s of [-1, 1]) ctx.circ(110 + s * 10 + 6, 262, 3, ctx.ink);
  T.mouth(ctx, 118, 276, 20, 'grin');
  OP(ctx, [[62, 218], [90, 216], [92, 244], [64, 246]], ctx.col(5));
  OP(ctx, [[150, 222], [176, 220], [178, 248], [152, 250]], ctx.col(5));
  for (let i = 0; i < 6; i++) OP(ctx, [[20 + i * 10, 330], [26 + i * 10, 330], [26 + i * 10, 304 + (i % 2) * 6], [23 + i * 10, 298 + (i % 2) * 6], [20 + i * 10, 304]], ctx.colors[1], 2.4);
  for (let i = 0; i < 4; i++) { const x = 30 + i * 52; ctx.circ(x, 326, 6, ctx.col(i % 2 ? 3 : 6)); ctx.line(x, 332, x, 344, ctx.green(1), 3); }
  return 'crooked house';
}

function popBurst(ctx) {
  const a = ctx.col(ctx.int(0, 7));
  const b = ctx.col(ctx.int(0, 7) + 3);
  panel(ctx, ctx.colors[1]);
  dotField(ctx, [18, 52, 204, 290], 12, () => 3.6, () => b, 4);
  const cx = ctx.between(112, 128);
  const cy = ctx.between(170, 220);
  const n = ctx.int(12, 16);
  OP(ctx, starPoints(cx, cy, 90, 54, n, ctx.rand()), a, 4);
  OP(ctx, starPoints(cx, cy, 64, 36, n - 3, ctx.rand()), ctx.col(0), 4);
  OP(ctx, starPoints(cx, cy, 38, 22, 8, ctx.rand()), ctx.colors[1], 3.5);
  for (let i = 0; i < 4; i++) ctx.line(cx - 60 + i * 40, 330, cx - 52 + i * 40, 316, ctx.ink, 3);
  return 'comic burst';
}

function squashBall(ctx) {
  panel(ctx, ctx.col(ctx.pick([5, 6, 1])));
  ctx.poly(R(14, 300, 212, 46), ctx.col(4), still);
  const c = ctx.col(ctx.pick([3, 0, 2]));
  const steps = [[44, 110, 1.0, 1.25], [80, 176, 0.9, 1.15], [116, 262, 1.0, 1.0], [156, 292, 1.5, 0.55], [196, 214, 0.95, 1.2]];
  steps.forEach(([x, y, sx, sy], i) => {
    ctx.ellipse(x, 312, 16 * sx * 0.8, 4, ctx.ink, 0);
    OE(ctx, x, y, 24 * sx, 24 * sy, c, 3.5);
    ctx.circ(x - 7 * sx, y - 9 * sy, 5, ctx.colors[1]);
  });
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = 44 + t * 152;
    ctx.circ(x, 312 - Math.abs(Math.sin(t * Math.PI * 2)) * 160 * (1 - t * 0.2), 2.2, ctx.colors[1]);
  }
  return 'bouncing ball';
}

function tvTestCard(ctx) {
  panel(ctx, tone(ctx));
  const body = ctx.col(ctx.pick([0, 2, 3, 6]));
  ctx.line(120, 120, 80, 72, ctx.ink, 4);
  ctx.line(120, 120, 160, 72, ctx.ink, 4);
  ctx.circ(80, 70, 5, ctx.ink);
  ctx.circ(160, 70, 5, ctx.ink);
  OPath(ctx, 'M34 130 H206 Q216 130 216 140 V300 Q216 312 206 312 H34 Q24 312 24 300 V140 Q24 130 34 130 Z', body, [24, 130, 216, 312], 4);
  OPath(ctx, 'M46 148 H158 Q168 148 168 158 V284 Q168 294 158 294 H46 Q36 294 36 284 V158 Q36 148 46 148 Z', ctx.ink, [36, 148, 168, 294], 3);
  const bars = 6;
  for (let i = 0; i < bars; i++) ctx.poly(R(44 + i * (116 / bars), 156, 116 / bars, 60), ctx.col(i * 2 + 1), still);
  ctx.poly(R(44, 216, 116, 70), ctx.col(5), still);
  T.cartoonHead(ctx, { x: 102, y: 252, s: 0.42, skin: ctx.colors[1], expr: ctx.pick(['happy', 'shocked', 'excited']) });
  for (let i = 0; i < 3; i++) {
    ctx.circ(192, 164 + i * 36, 11, ctx.colors[1]);
    ctx.circ(192, 164 + i * 36, 11, ctx.colors[1]);
    ctx.line(192, 164 + i * 36, 197, 158 + i * 36, ctx.ink, 3);
  }
  ctx.poly(R(46, 312, 20, 18), ctx.ink, still);
  ctx.poly(R(174, 312, 20, 18), ctx.ink, still);
  return 'retro TV';
}

module.exports = { chaseScene, anvilDrop, desertCliff, hillsWithFaces, wobblyHouse, popBurst, squashBall, tvTestCard };
