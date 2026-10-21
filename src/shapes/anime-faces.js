'use strict';

// Anime faces and expressions: eyes, an expression sheet, a soft portrait, a determined grin, a cool rival,
// tears, an angry chibi and a sleepy chibi. All of them are original archetypes.

const { TAU, fmt, pol, rectPts, starPoints, blob } = require('./engine');
const T = require('./toon');

const R = rectPts;
const still = { inset: 1, still: true };
const FRAME = [14, 48, 212, 298];
// The panel colour is kept on ctx.bg, so figures and props drawn on it can stay clear of it. Everything drawn
// after the panel is clipped to it.
const panel = (ctx, fill) => {
  ctx.bg = fill;
  ctx.poly(R(14, 48, 212, 298), fill, still);
  ctx.clipTo(FRAME);
};
const tone = (ctx, off = 4) => ctx.col(ctx.int(0, 7) + off);

function animeEyes(ctx) {
  const skin = ctx.pick(T.skinTones(ctx));
  const hair = ctx.pick(T.hairTones(ctx));
  const iris = ctx.col(ctx.int(0, 7));
  panel(ctx, tone(ctx));
  ctx.poly(R(14, 108, 212, 168), skin, still);
  ctx.poly([[14, 48], [226, 48], [226, 116], [190, 140], [160, 108], [130, 150], [96, 110], [62, 146], [30, 112], [14, 132]], hair, still);
  ctx.poly([[40, 60], [70, 60], [56, 100]], T.mix(hair, '#FFFFFF', 0.3), still);
  const look = [ctx.between(-0.8, 0.8), ctx.between(-0.4, 0.5)];
  for (const side of [-1, 1]) {
    T.animeEye(ctx, 120 + side * 52, 196, 78, 96, { iris, skin, look, mirror: side, size: 1.05 });
    T.brows(ctx, 120 + side * 52, 146, 0, 64, ctx.pick(['calm', 'raised']));
  }
  ctx.poly([[116, 238], [124, 238], [120, 252]], T.mix(skin, ctx.ink, 0.25), still);
  T.sparkles(ctx, 4, ctx.colors[1], [24, 60, 216, 100]);
  return 'anime eyes';
}

function expressionSheet(ctx) {
  const hair = ctx.pick(T.hairTones(ctx));
  const skin = ctx.pick(T.skinTones(ctx));
  const style = ctx.pick(['bob', 'spiky', 'twin']);
  const exprs = ['happy', 'angry', 'shocked', 'sad', 'smug', 'shy', 'excited'];
  for (let i = exprs.length - 1; i > 0; i--) {
    const j = ctx.int(0, i);
    [exprs[i], exprs[j]] = [exprs[j], exprs[i]];
  }
  const base = ctx.int(0, 7);
  for (let k = 0; k < 3; k++) {
    const y = 48 + k * 100;
    const band = ctx.col(base + k * 2 + 4);
    ctx.poly(R(14, y, 212, 96), band, { inset: 1, still: true });
    T.animeHead(ctx, { x: 120, y: y + 52, s: 0.5, shape: 'chibi', skin, hair, style, expr: exprs[k], iris: ctx.col(base + 2), bg: band });
  }
  return 'expression sheet';
}

function shoujoPortrait(ctx) {
  const bg = ctx.col(ctx.pick([6, 1, 5]));
  panel(ctx, bg);
  for (let i = 0; i < 9; i++) ctx.circ(ctx.between(30, 210), ctx.between(70, 330), ctx.between(8, 26), T.mix(bg, '#FFFFFF', 0.45));
  T.sparkles(ctx, 8, ctx.colors[1], [24, 60, 216, 336], (x, y) => Math.abs(x - 120) < 70 && y > 100 && y < 300);
  T.animeHead(ctx, { x: 120, y: 206, s: 1.35, style: ctx.pick(['long', 'twin']), expr: ctx.pick(['happy', 'shy']), accessories: ['ribbon'] });
  return 'soft portrait';
}

function shonenGrin(ctx) {
  panel(ctx, ctx.col(ctx.pick([3, 0, 5])));
  T.speedLines(ctx, 120, 200, 70, 190, 22, T.apart(ctx, ctx.colors[1], ctx.bg), { area: [16, 50, 224, 344] });
  T.animeHead(ctx, { x: 120, y: 208, s: 1.35, style: 'spiky', expr: 'excited', accessories: ['headband', 'bandage'] });
  return 'determined grin';
}

function coolRival(ctx) {
  const hair = ctx.pick(T.hairTones(ctx));
  panel(ctx, ctx.col(4));
  ctx.circ(ctx.pick([60, 180]), 96, ctx.between(26, 36), ctx.colors[1]);
  ctx.poly([[14, 346], [14, 280], [226, 220], [226, 346]], ctx.ink, still);
  const h = T.animeHead(ctx, { x: 120, y: 212, s: 1.35, style: ctx.pick(['bob', 'long']), hair, expr: 'smug' });
  const side = ctx.pick([-1, 1]);
  ctx.poly([[120 + side * 6, 130], [120 + side * 58, 150], [120 + side * 54, 232], [120 + side * 34, 206], [120 + side * 14, 170]], h.hair, still);
  return 'cool glance';
}

function tearfulFace(ctx) {
  panel(ctx, ctx.col(ctx.pick([5, 2, 4])));
  for (let i = 0; i < 12; i++) T.sweatDrop(ctx, ctx.between(30, 210), ctx.between(70, 330), ctx.between(0.5, 1), ctx.colors[1]);
  T.animeHead(ctx, { x: 120, y: 200, s: 1.35, style: ctx.pick(['bob', 'long', 'twin']), expr: 'sad' });
  return 'tearful face';
}

function angryChibi(ctx) {
  panel(ctx, ctx.col(ctx.pick([4, 3])));
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 25;
    const h = ctx.between(60, 130);
    ctx.poly([[x - 16, 340], [x + 16, 340], [x + ctx.between(-6, 6), 340 - h]], T.apart(ctx, ctx.col(i % 2 ? 3 : 0), ctx.bg), { inset: 1, still: true });
  }
  T.animeHead(ctx, { x: 120, y: 210, s: 1.4, shape: 'chibi', style: ctx.pick(['spiky', 'messy']), expr: 'angry' });
  T.angerVein(ctx, 190, 110, 1.3);
  T.angerVein(ctx, 60, 130, 0.9);
  return 'angry chibi';
}

function sleepyChibi(ctx) {
  panel(ctx, ctx.col(4));
  ctx.circ(ctx.pick([50, 190]), 94, ctx.between(20, 28), ctx.colors[1]);
  for (let i = 0; i < 10; i++) ctx.circ(ctx.between(30, 210), ctx.between(60, 150), ctx.between(1.2, 2.6), ctx.colors[1]);
  ctx.poly(R(14, 288, 212, 58), ctx.col(ctx.int(0, 7)), still);
  T.animeHead(ctx, { x: 120, y: 214, s: 1.4, shape: 'chibi', style: ctx.pick(['bob', 'messy']), expr: 'sleepy' });
  ctx.raw(`<circle cx="134" cy="250" r="11" fill="${ctx.colors[1]}" fill-opacity="0.6" stroke="${ctx.colors[1]}" stroke-width="2.5"/>`, 134, 250, [121, 237, 147, 263]);
  return 'sleepy chibi';
}

module.exports = { animeEyes, expressionSheet, shoujoPortrait, shonenGrin, coolRival, tearfulFace, angryChibi, sleepyChibi };
