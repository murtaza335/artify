'use strict';

// More objects: sofa, bed, desk with laptop, light bulb, guitar, hot air balloon, camera and door.

const { TAU, fmt, pol, rectPts, rotRect, curvePoly } = require('./engine');

const R = rectPts;

function sofa(ctx) {
  const main = ctx.col(ctx.int(0, 7));
  const dark = ctx.col(4);
  const alt = ctx.col(ctx.int(0, 7));
  ctx.poly(R(14, 342, 212, 6), dark, { inset: 1, still: true });
  for (const x of [48, 180]) ctx.poly(R(x - 6, 312, 12, 30), dark, { inset: 1, still: true });
  ctx.poly(R(40, 170, 160, 90), main, { inset: 1, still: true });
  ctx.shape('M40 170 A80 24 0 0 1 200 170 Z', main, 120, 160, [40, 146, 200, 170]);
  ctx.poly(R(36, 262, 168, 52), alt, { inset: 1, still: true });
  for (const x of [52, 124]) ctx.poly(R(x, 232, 64, 38), ctx.col(ctx.int(1, 6)), { inset: 0.98, still: true });
  for (const s of [-1, 1]) {
    ctx.poly(R(s === -1 ? 18 : 192, 206, 30, 108), main, { inset: 1, still: true });
    ctx.circ(s === -1 ? 33 : 207, 206, 15, main);
  }
  for (let i = 0; i < 2; i++) ctx.poly(rotRect(i ? 176 : 66, 214, 40, 40, ctx.between(-0.4, 0.4)), ctx.col(ctx.int(0, 7)), { inset: 1 });
  ctx.poly(R(80, 80, 80, 56), ctx.col(0), { inset: 1, still: true });
  ctx.poly(R(86, 86, 68, 44), ctx.colors[1], { inset: 1, still: true });
  ctx.circ(112, 108, 12, ctx.col(3));
  ctx.poly([[124, 126], [146, 126], [135, 96]], ctx.col(2), { inset: 1, still: true });
  return 'sofa';
}

function bed(ctx) {
  ctx.poly(R(14, 342, 212, 6), ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(34, 120, 172, 150), ctx.col(4), { inset: 1, still: true });
  ctx.shape('M34 120 A86 30 0 0 1 206 120 Z', ctx.col(4), 120, 108, [34, 90, 206, 120]);
  ctx.poly(R(28, 250, 184, 52), ctx.colors[1], { inset: 1, still: true });
  for (const x of [58, 128]) ctx.ellipse(x + 26, 244, 36, 16, ctx.col(ctx.int(1, 6)));
  const stripes = ctx.int(4, 6);
  for (let i = 0; i < stripes; i++) ctx.poly(R(28 + (i * 184) / stripes, 268, 184 / stripes, 56), ctx.col(i * 2 + 2), { inset: 1, still: true });
  for (const x of [40, 192]) ctx.poly(R(x - 6, 322, 12, 22), ctx.col(4), { inset: 1, still: true });
  ctx.circ(ctx.between(180, 200), 90, 24, ctx.colors[0]);
  ctx.poly(R(100, 56, 60, 40), ctx.col(0), { inset: 1, still: true });
  ctx.poly(R(105, 61, 50, 30), ctx.col(5), { inset: 1, still: true });
  return 'bed';
}

function desk(ctx) {
  const wood = ctx.col(0);
  const dark = ctx.col(4);
  ctx.poly(R(14, 342, 212, 6), dark, { inset: 1, still: true });
  ctx.poly(R(18, 250, 204, 14), wood, { inset: 1, still: true });
  ctx.poly(R(26, 264, 10, 78), dark, { inset: 1, still: true });
  ctx.poly(R(60, 264, 80, 72), wood, { inset: 1, still: true });
  for (const y of [272, 302]) {
    ctx.poly(R(66, y, 68, 24), ctx.col(3), { inset: 1, still: true });
    ctx.circ(100, y + 12, 3, ctx.colors[1]);
  }
  ctx.poly(R(204, 264, 10, 78), dark, { inset: 1, still: true });
  // Laptop with colored lines of code.
  ctx.poly([[52, 250], [168, 250], [176, 242], [44, 242]], ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(56, 140, 108, 100), ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(62, 146, 96, 88), ctx.ink, { inset: 1, still: true });
  const lineColors = [ctx.col(3), ctx.col(5), ctx.green(0), ctx.col(0), ctx.col(6)];
  for (let i = 0; i < 7; i++) {
    const indent = (i % 3) * 8;
    ctx.poly(R(68 + indent, 154 + i * 11, ctx.between(24, 70 - indent), 5), lineColors[(i * 2) % 5], { inset: 1, still: true });
  }
  // Mug, books and lamp.
  ctx.poly([[184, 250], [206, 250], [203, 224], [187, 224]], ctx.col(3), { inset: 1, still: true });
  ctx.raw(`<circle cx="208" cy="236" r="6" fill="none" stroke="${ctx.col(3)}" stroke-width="3"/>`, 206, 236, [184, 224, 214, 250]);
  ctx.stroke('M190 218 q-6 -10 0 -18 q6 -8 0 -16', ctx.colors[1], 2.5, 192, 200, [184, 184, 200, 218]);
  ctx.poly(R(22, 232, 26, 10), ctx.col(2), { inset: 1, still: true });
  ctx.poly(R(24, 222, 22, 10), ctx.col(6), { inset: 1, still: true });
  ctx.line(190, 250, 186, 190, ctx.col(4), 4);
  ctx.poly([[168, 176], [204, 176], [196, 192], [176, 192]], ctx.col(0), { inset: 1, still: true });
  ctx.poly(R(70, 70, 100, 44), ctx.col(0), { inset: 1, still: true });
  ctx.poly(R(76, 76, 88, 32), ctx.col(5), { inset: 1, still: true });
  ctx.poly([[84, 108], [112, 108], [98, 86]], ctx.green(0), { inset: 1, still: true });
  return 'desk';
}

function lightbulb(ctx) {
  const cx = 120;
  const cy = ctx.between(130, 150);
  ctx.raw(`<circle cx="${cx}" cy="${cy}" r="96" fill="${ctx.colors[0]}" opacity=".18"/>`, cx, cy, [cx - 96, cy - 96, cx + 96, cy + 96]);
  for (let i = 0; i < 14; i++) {
    const a = (i * TAU) / 14;
    const p = pol(cx, cy, 78, a);
    const q = pol(cx, cy, ctx.between(94, 108), a);
    ctx.line(p[0], p[1], q[0], q[1], ctx.colors[0], 5);
  }
  ctx.circ(cx, cy, 64, ctx.colors[0]);
  ctx.circ(cx - 22, cy - 24, 14, ctx.colors[1]);
  ctx.poly([[cx - 36, cy + 52], [cx + 36, cy + 52], [cx + 24, cy + 106], [cx - 24, cy + 106]], ctx.colors[0], { inset: 1, still: true });
  for (let i = 0; i < 3; i++) ctx.poly(R(cx - 26 + (i === 2 ? 4 : 0), cy + 108 + i * 18, 52 - (i === 2 ? 8 : 0), 14), i % 2 ? ctx.col(4) : ctx.col(2), { inset: 1, still: true });
  ctx.circ(cx, cy + 172, 9, ctx.col(4));
  ctx.stroke(`M${cx - 18} ${cy + 100} L${cx - 18} ${cy + 10} L${cx - 8} ${cy + 30} L${cx} ${cy + 6} L${cx + 8} ${cy + 30} L${cx + 18} ${cy + 10} L${cx + 18} ${cy + 100}`, ctx.col(3), 3, cx, cy + 50, [cx - 18, cy + 6, cx + 18, cy + 100]);
  return 'light bulb';
}

function guitar(ctx) {
  const wood = ctx.pick([ctx.col(0), ctx.col(3), ctx.col(2)]);
  const dark = ctx.col(4);
  const cx = 120;
  ctx.poly(R(cx - 7, 40, 14, 190), dark, { inset: 1, still: true });
  ctx.poly([[cx - 12, 40], [cx + 12, 40], [cx + 14, 8], [cx - 14, 8]], dark, { inset: 1, still: true });
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) ctx.circ(cx + s * 17, 14 + k * 11, 3.5, ctx.colors[1]);
  for (let k = 0; k < 8; k++) ctx.line(cx - 7, 64 + k * 22, cx + 7, 64 + k * 22, ctx.colors[1], 1.6);
  ctx.circ(cx, 262, 40, wood);
  ctx.circ(cx, 316, 30, wood);
  ctx.poly([[cx - 36, 262], [cx + 36, 262], [cx + 52, 316], [cx - 52, 316]], wood, { inset: 1, still: true });
  ctx.circ(cx, 316, 52, wood);
  ctx.circ(cx, 288, 16, ctx.ink);
  ctx.raw(`<circle cx="${cx}" cy="288" r="21" fill="none" stroke="${dark}" stroke-width="4"/>`, cx, 288, [cx - 23, 265, cx + 23, 311]);
  ctx.poly(R(cx - 22, 330, 44, 8), dark, { inset: 1, still: true });
  for (let i = 0; i < 6; i++) ctx.line(cx - 6 + i * 2.4, 22, cx - 18 + i * 7.2, 334, ctx.colors[1], 1.4);
  return 'guitar';
}

function circleColumn(cx, cy, r, x0, x1, steps = 5) {
  const half = (x) => Math.sqrt(Math.max(0, r * r - (x - cx) * (x - cx)));
  const top = [];
  const bottom = [];
  for (let k = 0; k <= steps; k++) {
    const x = x0 + ((x1 - x0) * k) / steps;
    top.push([x, cy - half(x)]);
    bottom.unshift([x, cy + half(x)]);
  }
  return top.concat(bottom);
}

function hotAirBalloon(ctx) {
  const cx = 120;
  const cy = ctx.between(120, 140);
  const r = ctx.between(64, 74);
  const stripes = ctx.int(5, 7);
  for (let i = 0; i < stripes; i++) {
    const x0 = cx - r + (i * 2 * r) / stripes;
    const x1 = cx - r + ((i + 1) * 2 * r) / stripes;
    ctx.poly(circleColumn(cx, cy, r, x0, x1), ctx.col(i * 2 + (i % 2 ? 3 : 0)), { inset: 1, still: true });
  }
  ctx.poly([[cx - r * 0.55, cy + r * 0.8], [cx + r * 0.55, cy + r * 0.8], [cx + 18, cy + r + 34], [cx - 18, cy + r + 34]], ctx.col(3), { inset: 1, still: true });
  const by = cy + r + 70;
  for (const dx of [-16, -6, 6, 16]) ctx.line(cx + dx * 1.2, cy + r + 34, cx + dx, by, ctx.col(4), 1.6);
  ctx.poly(R(cx - 22, by, 44, 34), ctx.col(0), { inset: 1, still: true });
  for (let i = 0; i < 3; i++) ctx.poly(R(cx - 22, by + 8 + i * 9, 44, 2), ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < 3; i++) {
    const x = ctx.between(30, 210);
    const y = ctx.between(270, 330);
    ctx.circ(x, y, 16, ctx.colors[1]);
    ctx.circ(x + 18, y + 4, 12, ctx.colors[1]);
    ctx.circ(x - 16, y + 6, 11, ctx.colors[1]);
  }
  return 'hot air balloon';
}

function camera(ctx) {
  const body = ctx.col(4);
  ctx.poly(R(26, 130, 188, 150), body, { inset: 1, still: true });
  ctx.poly([[80, 130], [160, 130], [150, 100], [90, 100]], body, { inset: 1, still: true });
  ctx.poly(R(26, 168, 188, 50), ctx.col(3), { inset: 1, still: true });
  ctx.circ(120, 206, 62, ctx.colors[1]);
  ctx.circ(120, 206, 52, ctx.ink);
  ctx.circ(120, 206, 38, ctx.col(5));
  ctx.circ(120, 206, 24, ctx.ink);
  ctx.circ(108, 194, 8, ctx.colors[1]);
  ctx.poly(R(40, 108, 28, 22), ctx.colors[0], { inset: 1, still: true });
  ctx.circ(184, 118, 12, ctx.col(3));
  ctx.poly(R(172, 142, 30, 8), ctx.colors[1], { inset: 1, still: true });
  ctx.line(40, 130, 30, 70, ctx.col(0), 8);
  ctx.line(200, 130, 212, 70, ctx.col(0), 8);
  ctx.circ(46, 252, 5, ctx.colors[1]);
  ctx.circ(194, 252, 5, ctx.colors[1]);
  return 'camera';
}

function door(ctx) {
  ctx.poly(R(14, 342, 212, 6), ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(44, 130, 152, 212), ctx.col(4), { inset: 1, still: true });
  ctx.shape('M44 130 A76 56 0 0 1 196 130 Z', ctx.col(4), 120, 110, [44, 74, 196, 130]);
  const door = ctx.col(ctx.int(0, 7));
  ctx.poly(R(54, 134, 132, 208), door, { inset: 1, still: true });
  ctx.shape('M54 134 A66 52 0 0 1 186 134 Z', door, 120, 116, [54, 82, 186, 134]);
  ctx.shape('M70 134 A50 38 0 0 1 170 134 Z', ctx.col(5), 120, 120, [70, 96, 170, 134]);
  for (const [x, y, w, h] of [[68, 160, 48, 70], [124, 160, 48, 70], [68, 244, 48, 80], [124, 244, 48, 80]]) {
    ctx.poly(R(x, y, w, h), ctx.col(4), { inset: 1, still: true });
    ctx.poly(R(x + 5, y + 5, w - 10, h - 10), door, { inset: 1, still: true });
  }
  ctx.circ(168, 246, 6, ctx.colors[0]);
  ctx.poly(R(104, 140, 32, 14), ctx.colors[0], { inset: 1, still: true });
  ctx.poly(R(60, 332, 120, 10), ctx.col(3), { inset: 1, still: true });
  for (const s of [-1, 1]) {
    const x = 120 + s * 90;
    ctx.poly([[x - 14, 342], [x + 14, 342], [x + 11, 312], [x - 11, 312]], ctx.col(3), { inset: 1, still: true });
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.9 + (i * Math.PI * 0.8) / 4;
      ctx.poly([[x, 312], pol(x, 312, 22, a - 0.3), pol(x, 312, 44, a), pol(x, 312, 22, a + 0.3)], ctx.green(i), { inset: 1, still: true });
    }
  }
  return 'front door';
}

module.exports = { sofa, bed, desk, lightbulb, guitar, hotAirBalloon, camera, door };
