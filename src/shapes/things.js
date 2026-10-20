'use strict';

// More objects: a piano, typewriter, record player, kite, book stack, coffee cup, vintage car, train, headphones
// and a watering can.

const { TAU, fmt, pol, rectPts, rotRect, circleBand, arcBand } = require('./engine');

const R = rectPts;
const still = { inset: 1, still: true };
const disc = (ctx) => ctx.circ(120, 190, ctx.between(96, 108), ctx.col(ctx.int(0, 7) + 4));

function piano(ctx) {
  const body = ctx.col(ctx.pick([4, 3, 2]));
  disc(ctx);
  ctx.poly(R(28, 140, 184, 100), body, still);
  ctx.poly([[28, 140], [212, 140], [196, 110], [44, 110]], ctx.col(4) === body ? ctx.ink : ctx.col(4), still);
  ctx.poly(R(44, 118, 152, 22), ctx.colors[1], still);
  const keys = ctx.int(8, 10);
  const kw = 164 / keys;
  for (let i = 0; i < keys; i++) ctx.poly(R(36 + i * kw, 190, kw - 1.5, 50), ctx.colors[1], still);
  [0, 1, 3, 4, 5, 7, 8].forEach((k) => {
    if (k < keys - 1) ctx.poly(R(36 + (k + 1) * kw - kw * 0.28, 190, kw * 0.56, 30), ctx.ink, still);
  });
  ctx.poly(R(36, 240, 12, 90), body, still);
  ctx.poly(R(192, 240, 12, 90), body, still);
  ctx.poly(R(100, 262, 40, 12), ctx.col(0), still);
  const sx = ctx.pick([76, 164]);
  ctx.poly(R(sx - 24, 262, 48, 14), ctx.col(ctx.int(0, 7)), still);
  ctx.poly(R(sx - 20, 276, 8, 54), ctx.ink, still);
  ctx.poly(R(sx + 12, 276, 8, 54), ctx.ink, still);
  return 'piano';
}

function typewriter(ctx) {
  const body = ctx.col(ctx.pick([2, 3, 4]));
  disc(ctx);
  ctx.poly([[50, 150], [190, 150], [196, 100], [44, 100]], ctx.colors[1], still);
  for (let i = 0; i < 3; i++) ctx.line(70, 114 + i * 10, 170, 114 + i * 10, ctx.ink, 2);
  ctx.poly(R(32, 150, 176, 40), body, still);
  ctx.poly([[22, 190], [218, 190], [200, 262], [40, 262]], ctx.col(4) === body ? ctx.ink : body, { inset: 1, still: true });
  ctx.poly([[22, 190], [218, 190], [214, 204], [26, 204]], ctx.col(0), still);
  const rows = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 7 - r; c++) ctx.circ(52 + r * 12 + c * 24, 216 + r * 14, 6, ctx.colors[1]);
  }
  ctx.poly(R(56, 244, 128, 8), ctx.colors[1], still);
  ctx.circ(30, 130, 11, ctx.col(0));
  ctx.circ(210, 130, 11, ctx.col(0));
  ctx.poly(R(60, 262, 12, 24), ctx.ink, still);
  ctx.poly(R(168, 262, 12, 24), ctx.ink, still);
  return 'typewriter';
}

function recordPlayer(ctx) {
  const wood = ctx.col(ctx.pick([0, 3, 4]));
  disc(ctx);
  ctx.poly(R(28, 190, 184, 100), wood, still);
  ctx.poly(R(28, 190, 184, 12), ctx.col(4) === wood ? ctx.ink : ctx.col(4), still);
  ctx.ellipse(120, 214, 82, 26, ctx.ink, 0);
  ctx.ellipse(120, 214, 68, 21, ctx.col(5), 0);
  ctx.ellipse(120, 214, 22, 7, ctx.col(3), 0);
  ctx.ellipse(120, 214, 4, 1.6, ctx.ink, 0);
  const armX = 190;
  ctx.line(armX, 196, armX - 38, 224, ctx.colors[1], 4);
  ctx.poly(rotRect(armX - 42, 227, 16, 8, 0.6), ctx.colors[1], still);
  ctx.circ(armX, 196, 7, ctx.col(0));
  ctx.circ(48, 250, 5, ctx.colors[1]);
  ctx.circ(70, 250, 5, ctx.colors[1]);
  for (const x of [38, 190]) ctx.poly(R(x, 290, 12, 26), wood, still);
  const sx = ctx.pick([60, 180]);
  ctx.circ(sx, 148, 22, ctx.ink);
  ctx.circ(sx, 148, 8, ctx.col(3));
  return 'record player';
}

function kite(ctx) {
  const cx = ctx.between(100, 140);
  const cy = ctx.between(130, 160);
  const [a, b, c, d] = [ctx.col(ctx.int(0, 7)), ctx.col(ctx.int(0, 7) + 2), ctx.col(ctx.int(0, 7) + 4), ctx.col(ctx.int(0, 7) + 6)];
  ctx.circ(ctx.pick([60, 180]), ctx.between(70, 100), 22, ctx.col(0));
  const top = [cx, cy - 74];
  const right = [cx + 52, cy];
  const bottom = [cx, cy + 96];
  const left = [cx - 52, cy];
  const m = [cx, cy + 10];
  ctx.poly([top, right, m], a, still);
  ctx.poly([top, left, m], b, still);
  ctx.poly([bottom, right, m], c, still);
  ctx.poly([bottom, left, m], d, still);
  ctx.line(top[0], top[1], bottom[0], bottom[1], ctx.ink, 2);
  ctx.line(left[0], left[1], right[0], right[1], ctx.ink, 2);
  const sway = ctx.between(-30, 30);
  ctx.stroke(`M${fmt(cx)} ${fmt(cy + 96)} Q${fmt(cx + sway)} ${fmt(cy + 150)} ${fmt(cx - sway * 0.5)} ${fmt(cy + 200)} T${fmt(cx + sway * 0.3)} 352`, ctx.ink, 2, cx, cy + 220, [cx - 40, cy + 96, cx + 40, 352]);
  for (let i = 0; i < 4; i++) {
    const y = cy + 108 + i * 28;
    const x = cx + sway * 0.3 * (i / 4);
    ctx.poly([[x - 9, y - 6], [x + 9, y - 6], [x, y + 6]], i % 2 ? c : a, { inset: 1 });
  }
  return 'kite';
}

function bookStack(ctx) {
  disc(ctx);
  const n = ctx.int(5, 7);
  let y = 330;
  for (let i = 0; i < n; i++) {
    const w = ctx.between(110, 160);
    const h = ctx.between(22, 32);
    const x = 120 - w / 2 + ctx.between(-14, 14);
    const c = ctx.col(i * 2 + ctx.int(0, 3));
    ctx.poly(R(x, y - h, w, h), c, still);
    ctx.poly(R(x + 8, y - h + 5, 12, h - 10), ctx.col(i * 2 + 5), still);
    ctx.poly(R(x + w - 20, y - h + h / 2 - 2, 14, 4), ctx.colors[1], still);
    y -= h;
  }
  const top = y;
  ctx.poly([[96, top], [144, top], [144, top - 30], [96, top - 30]], ctx.col(3), { inset: 1, still: true });
  ctx.line(120, top - 30, 120, top - 44, ctx.ink, 3);
  ctx.poly([[120, top - 44], [140, top - 56], [124, top - 38]], ctx.green(0), { inset: 1 });
  return 'book stack';
}

function coffeeCup(ctx) {
  const cup = ctx.col(ctx.pick([2, 3, 6, 0]));
  disc(ctx);
  ctx.ellipse(120, 312, 90, 18, ctx.col(4), 0);
  ctx.shape('M54 190 L186 190 Q186 306 120 306 Q54 306 54 190 Z', cup, 120, 250, [54, 190, 186, 306]);
  ctx.raw(`<path d="M184 212 q40 0 38 34 q-2 30 -40 28" fill="none" stroke="${cup}" stroke-width="14" stroke-linecap="round"/>`, 206, 244, [168, 204, 232, 284]);
  ctx.ellipse(120, 190, 66, 14, ctx.col(4) === cup ? ctx.ink : ctx.col(4), 0);
  ctx.ellipse(120, 192, 56, 9, ctx.col(0) === cup ? ctx.colors[1] : ctx.col(1), 0);
  ctx.poly(R(54, 226, 132, 10), ctx.colors[1], still);
  ctx.poly(R(54, 250, 132, 10), ctx.colors[1], still);
  for (let i = 0; i < 3; i++) {
    const x = 96 + i * 24;
    ctx.stroke(`M${x} 160 q-10 -20 0 -38 q10 -18 0 -36`, ctx.col(5), 6, x, 120, [x - 14, 80, x + 14, 164]);
  }
  return 'coffee cup';
}

function vintageCar(ctx) {
  const body = ctx.col(ctx.pick([3, 0, 2, 6]));
  disc(ctx);
  ctx.poly(R(14, 306, 212, 8), ctx.col(4), still);
  ctx.poly([[22, 272], [220, 272], [218, 232], [190, 224], [150, 224], [136, 188], [86, 188], [66, 224], [28, 232]], body, { inset: 1, still: true });
  ctx.poly([[74, 224], [90, 196], [118, 196], [118, 224]], ctx.col(5), still);
  ctx.poly([[126, 224], [126, 196], [136, 196], [150, 224]], ctx.col(5), still);
  ctx.poly(R(22, 262, 196, 10), ctx.colors[1], still);
  ctx.circ(212, 246, 8, ctx.col(0));
  ctx.circ(32, 246, 6, ctx.colors[1]);
  for (const x of [66, 176]) {
    ctx.circ(x, 280, 24, ctx.ink);
    ctx.circ(x, 280, 12, ctx.colors[1]);
    ctx.circ(x, 280, 4, ctx.col(0));
  }
  ctx.line(120, 188, 120, 224, ctx.ink, 3);
  return 'vintage car';
}

function train(ctx) {
  const hue = ctx.int(0, 7);
  ctx.poly(R(14, 304, 212, 6), ctx.ink, still);
  ctx.poly(R(14, 312, 212, 4), ctx.col(4), still);
  const loco = ctx.col(hue);
  ctx.poly(R(100, 196, 110, 78), loco, still);
  ctx.poly(R(150, 164, 60, 40), ctx.col(hue + 3), still);
  ctx.poly(R(158, 172, 22, 20), ctx.col(5), still);
  ctx.poly(R(40, 214, 70, 60), ctx.col(hue + 4), still);
  ctx.poly([[34, 214], [34, 196], [100, 196], [100, 214]], ctx.col(hue + 4) === ctx.ink ? ctx.col(3) : ctx.ink, { inset: 1, still: true });
  ctx.poly([[34, 186], [58, 186], [48, 214], [34, 214]], ctx.col(3), still);
  ctx.poly([[210, 274], [226, 296], [210, 296]], ctx.col(3), still);
  for (let i = 0; i < 3; i++) {
    const y = 160 - i * 22;
    ctx.circ(46 + i * 14, y, 12 + i * 5, ctx.colors[1]);
  }
  for (const [x, r] of [[64, 20], [104, 20], [172, 26]]) {
    ctx.circ(x, 282, r, ctx.ink);
    ctx.circ(x, 282, r * 0.45, ctx.col(0));
  }
  ctx.line(64, 282, 172, 282, ctx.col(0), 4);
  return 'train';
}

function headphones(ctx) {
  const band = ctx.col(ctx.pick([3, 2, 0, 6]));
  const cup = ctx.col(ctx.int(0, 7) + 3);
  disc(ctx);
  ctx.raw(`<path d="M52 230 A68 96 0 0 1 188 230" fill="none" stroke="${band}" stroke-width="16" stroke-linecap="round"/>`, 120, 160, [44, 124, 196, 238]);
  ctx.raw(`<path d="M52 230 A68 96 0 0 1 188 230" fill="none" stroke="${ctx.colors[1]}" stroke-width="4" stroke-linecap="round" transform="translate(0 -8) scale(1 1)"/>`, 120, 150, [44, 116, 196, 232]);
  for (const s of [-1, 1]) {
    const x = 120 + s * 68;
    ctx.poly(R(x - 24, 214, 48, 84), cup, still);
    ctx.poly(R(x - 18, 224, 36, 64), ctx.col(4) === cup ? ctx.ink : ctx.col(4), still);
    ctx.circ(x, 256, 10, ctx.colors[1]);
  }
  ctx.stroke('M188 298 q0 40 -30 40 q-30 0 -40 20', ctx.ink, 3, 160, 330, [110, 296, 192, 360]);
  return 'headphones';
}

function wateringCan(ctx) {
  const can = ctx.col(ctx.pick([2, 5, 3, 0]));
  disc(ctx);
  ctx.poly([[50, 190], [170, 190], [160, 310], [60, 310]], can, still);
  ctx.poly(R(46, 184, 128, 10), ctx.col(4) === can ? ctx.ink : ctx.col(4), still);
  ctx.poly(R(60, 238, 100, 8), ctx.colors[1], still);
  ctx.raw(`<path d="M170 210 L214 150" fill="none" stroke="${can}" stroke-width="18" stroke-linecap="round"/>`, 192, 180, [160, 140, 224, 220]);
  ctx.poly([[204, 122], [232, 142], [220, 170], [194, 150]], ctx.colors[1], still);
  ctx.raw(`<path d="M52 204 q-40 8 -32 58 q4 24 38 30" fill="none" stroke="${can}" stroke-width="12" stroke-linecap="round"/>`, 34, 250, [12, 196, 60, 300]);
  ctx.raw(`<path d="M70 190 q50 -64 100 0" fill="none" stroke="${can}" stroke-width="10" stroke-linecap="round"/>`, 120, 160, [64, 134, 176, 192]);
  for (let i = 0; i < 6; i++) {
    const x = 214 + (i % 3) * 5 - 6;
    ctx.line(x + 14, 186 + i * 22, x + 8, 196 + i * 22, ctx.col(5), 3);
  }
  ctx.poly(R(60, 310, 100, 8), ctx.col(4), still);
  return 'watering can';
}

module.exports = { piano, typewriter, recordPlayer, kite, bookStack, coffeeCup, vintageCar, train, headphones, wateringCan };
