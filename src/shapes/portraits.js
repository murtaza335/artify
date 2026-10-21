'use strict';

// More faces: a robot, a mosaic face, twin profiles, a totem of stacked faces, a sleepy face and a paper cut-out face.

const { TAU, fmt, pol, rectPts, rotRect, blob, starPoints } = require('./engine');

const R = rectPts;
const still = { inset: 1, still: true };
const FRAME = [14, 48, 212, 298];
// Everything drawn after the panel is clipped to it, so nothing spills over the frame.
const panel = (ctx, fill) => {
  ctx.poly(R(14, 48, 212, 298), fill, still);
  ctx.clipTo(FRAME);
};

function robotFace(ctx) {
  const metal = ctx.col(ctx.pick([5, 2, 0, 6]));
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  ctx.line(120, 70, 120, 96, ctx.ink, 4);
  ctx.circ(120, 66, 9, ctx.col(3));
  ctx.poly(R(44, 96, 152, 148), metal, still);
  ctx.poly(R(44, 96, 152, 14), ctx.colors[1], still);
  for (const s of [-1, 1]) ctx.poly(R(s > 0 ? 196 : 28, 140, 16, 50), ctx.ink, still);
  const eyeKind = ctx.int(0, 1);
  for (const s of [-1, 1]) {
    const x = 120 + s * 38;
    if (eyeKind) { ctx.circ(x, 150, 24, ctx.colors[1]); ctx.circ(x, 150, 11, ctx.col(3)); ctx.circ(x, 150, 4, ctx.ink); }
    else { ctx.poly(R(x - 24, 130, 48, 40), ctx.ink, still); ctx.poly(R(x - 18, 138, 36, 12), ctx.col(0), still); }
  }
  ctx.poly(R(70, 196, 100, 30), ctx.ink, still);
  for (let i = 0; i < 6; i++) ctx.poly(R(76 + i * 16, 202, 10, 18), ctx.colors[1], still);
  ctx.poly(R(100, 244, 40, 20), ctx.col(4), still);
  ctx.poly(R(60, 264, 120, 66), ctx.col(ctx.int(0, 7)), still);
  ctx.circ(96, 296, 10, ctx.col(3));
  ctx.circ(144, 296, 10, ctx.col(5));
  ctx.poly(R(104, 276, 32, 8), ctx.colors[1], still);
  return 'robot';
}

function mosaicFace(ctx) {
  const hue = ctx.int(0, 7);
  panel(ctx, ctx.col(hue + 4));
  const cell = 24;
  const x0 = 38;
  const y0 = 62;
  const cols = 7;
  const rows = 11;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = x0 + i * cell;
      const y = y0 + j * cell;
      const nx = (i - 3) / 3.2;
      const ny = (j - 5) / 5.2;
      if (nx * nx + ny * ny > 1) continue;
      let c = ctx.col(hue + ((i + j) % 2) * 2 + 1);
      if (j === 3 && (i === 2 || i === 4)) c = ctx.colors[1];
      if (j === 4 && (i === 2 || i === 4)) c = ctx.ink;
      if (j === 8 && i >= 2 && i <= 4) c = ctx.col(3);
      if (j >= 5 && j <= 6 && i === 3) c = ctx.col(hue + 3);
      ctx.poly(R(x, y, cell, cell), c, { inset: 0.92, still: true });
    }
  }
  return 'mosaic face';
}

function twinProfiles(ctx) {
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  const a = ctx.col(ctx.int(0, 7));
  const b = ctx.col(ctx.int(0, 7) + 3);
  const prof = (s, c) => {
    const x = (dx) => 120 + s * dx;
    ctx.poly([[x(4), 84], [x(52), 84], [x(58), 130], [x(76), 168], [x(56), 176], [x(62), 202], [x(48), 214], [x(54), 236], [x(32), 252], [x(34), 300], [x(4), 330]].map(([px, py]) => [px, py]), c, { inset: 1, still: true });
    ctx.circ(x(34), 128, 6, ctx.ink);
    ctx.poly([[x(8), 84], [x(42), 84], [x(50), 100], [x(8), 110]], ctx.ink, { inset: 1, still: true });
  };
  prof(-1, a);
  prof(1, b);
  ctx.poly([[117, 330], [123, 330], [123, 84], [117, 84]], ctx.colors[1], still);
  for (let i = 0; i < 5; i++) ctx.circ(120 + ctx.between(-8, 8), 110 + i * 46, ctx.between(4, 8), ctx.col(3));
  return 'twin profiles';
}

function totem(ctx) {
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  const n = ctx.int(3, 4);
  const h = 290 / n;
  const wide = [92, 76, 84, 70];
  for (let i = 0; i < n; i++) {
    const y = 56 + i * h;
    const w = wide[i];
    const c = ctx.col(i * 2 + ctx.int(0, 2));
    ctx.poly(R(120 - w, y, w * 2, h - 6), c, still);
    ctx.poly(R(120 - w, y, w * 2, 10), ctx.ink, still);
    for (const s of [-1, 1]) {
      ctx.circ(120 + s * w * 0.42, y + h * 0.34, h * 0.14, ctx.colors[1]);
      ctx.circ(120 + s * w * 0.42, y + h * 0.34, h * 0.06, ctx.ink);
      ctx.poly([[120 + s * w * 0.12, y + h * 0.52], [120 + s * w * 0.28, y + h * 0.62], [120 + s * w * 0.1, y + h * 0.62]], ctx.col(i * 2 + 4), { inset: 1, still: true });
    }
    ctx.poly(R(120 - w * 0.5, y + h * 0.72, w, h * 0.12), i % 2 ? ctx.col(3) : ctx.ink, still);
    if (i === 0) {
      ctx.poly([[120 - w * 0.5, y], [120, y - 0], [120 + w * 0.5, y]], c, still);
    }
  }
  return 'totem';
}

function sleepyFace(ctx) {
  const skin = ctx.col(ctx.pick([0, 6, 1, 7]));
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  ctx.circ(ctx.pick([60, 180]), ctx.between(84, 110), ctx.between(14, 20), ctx.colors[1]);
  const tilt = ctx.between(-0.15, 0.15);
  ctx.ellipse(120, 214, 78, 100, skin, tilt);
  ctx.poly([[44, 180], [120, 112], [196, 180], [176, 150], [120, 100], [64, 150]], ctx.col(4), { inset: 1, still: true });
  for (const s of [-1, 1]) {
    ctx.stroke(`M${120 + s * 48} 196 Q${120 + s * 32} 214 ${120 + s * 14} 196`, ctx.ink, 5, 120 + s * 32, 204, [120 + s * 14 - 4, 192, 120 + s * 48 + 4, 216]);
    ctx.line(120 + s * 44, 178, 120 + s * 20, 174, ctx.col(4), 4);
    ctx.circ(120 + s * 44, 230, 12, ctx.col(6));
  }
  ctx.poly([[120, 200], [112, 238], [128, 238]], ctx.col(3), { inset: 1, still: true });
  ctx.circ(120, 276, 8, ctx.col(3));
  ctx.stroke('M170 120 h14 l-14 14 h14', ctx.colors[1], 4, 177, 127, [168, 118, 188, 136]);
  ctx.stroke('M186 96 h10 l-10 10 h10', ctx.colors[1], 3, 191, 101, [184, 94, 198, 108]);
  return 'sleepy face';
}

function cutoutFace(ctx) {
  panel(ctx, ctx.colors[1]);
  const hue = ctx.int(0, 7);
  blob(ctx, 120, 200, 82, 0.1, ctx.col(hue), 7);
  blob(ctx, ctx.between(70, 100), ctx.between(150, 170), ctx.between(26, 36), 0.25, ctx.col(hue + 2), 6);
  blob(ctx, ctx.between(140, 170), ctx.between(150, 170), ctx.between(20, 28), 0.25, ctx.col(hue + 4), 6);
  ctx.circ(ctx.between(76, 98), ctx.between(150, 170), 8, ctx.ink);
  ctx.circ(ctx.between(146, 164), ctx.between(150, 170), 6, ctx.colors[1]);
  ctx.poly([[116, 170], [102, 222], [134, 222]], ctx.col(hue + 5), { inset: 1 });
  blob(ctx, 120, 262, 22, 0.35, ctx.col(3), 5);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI + (i * Math.PI) / 4;
    ctx.poly([pol(120, 122, 66, a - 0.1), pol(120, 122, 96, a), pol(120, 122, 66, a + 0.1)].map(([x, y]) => [x, Math.max(52, y)]), ctx.col(hue + 3 + i), { inset: 1 });
  }
  ctx.poly(starPoints(ctx.pick([46, 194]), ctx.between(300, 320), 18, 8, 6, 0.2), ctx.col(0), { inset: 1, still: true });
  return 'paper cut-out face';
}

module.exports = { robotFace, mosaicFace, twinProfiles, totem, sleepyFace, cutoutFace };
