'use strict';

// Landscapes and an easel with a finished abstract painting.

const { TAU, fmt, pol, starPoints, rectPts, rotRect, curvePoly } = require('./engine');

const SKIES = { day: ['#62C3E3', '#8AD6F0', '#B8E6F5'], dusk: ['#E5534B', '#F79BB0', '#E9A93B'], night: ['#2B2358', '#3A2F6B', '#4B3F86'] };
const WATER = { day: ['#3F8793', '#62C3E3'], dusk: ['#8E2A33', '#E5534B'], night: ['#16303A', '#2B2358'] };
const HILLS = { dusk: ['#3F8793', '#8E2A33', '#6B2A4A'], night: ['#1D3A4A', '#16303A', '#10234B'] };

function pine(ctx, x, base, h, color, dark) {
  const w = h * 0.42;
  ctx.poly([[x, base - h], [x - w, base - h * 0.15], [x, base - h * 0.15]], color, { inset: 1, still: true });
  ctx.poly([[x, base - h], [x, base - h * 0.15], [x + w, base - h * 0.15]], dark, { inset: 1, still: true });
  ctx.poly(rectPts(x - 1.5, base - h * 0.15, 3, h * 0.15), ctx.col(4), { inset: 1, still: true });
}

function scenery(ctx) {
  const X0 = 14;
  const X1 = 226;
  const Y0 = 50;
  const Y1 = 342;
  const time = ctx.pick(['day', 'dusk', 'night']);
  const sky = SKIES[time];

  // Sky in three bands.
  const bandH = (232 - Y0) / 3;
  sky.forEach((c, i) => ctx.poly(rectPts(X0, Y0 + i * bandH, X1 - X0, bandH + 1), c, { inset: 1, still: true }));

  // Sun with rays, or a moon with stars.
  const sx = ctx.between(60, 180);
  const sy = ctx.between(84, 130);
  if (time === 'night') {
    ctx.circ(sx, sy, ctx.between(16, 24), ctx.colors[1]);
    for (let i = 0; i < 9; i++) ctx.poly(starPoints(ctx.between(24, 216), ctx.between(60, 180), 5, 1.6, 4), ctx.colors[1], { inset: 1, still: true });
  } else {
    const r = ctx.between(18, 28);
    const rays = 8;
    for (let i = 0; i < rays; i++) {
      const a = (i * TAU) / rays;
      ctx.poly([pol(sx, sy, r + 5, a - 0.12), pol(sx, sy, r + 20, a), pol(sx, sy, r + 5, a + 0.12)], ctx.colors[0], { inset: 1, still: true });
    }
    ctx.circ(sx, sy, r, ctx.colors[0]);
  }

  // Hills in layers, trees on top.
  const layers = ctx.int(2, 3);
  const bases = [];
  for (let j = 0; j < layers; j++) {
    const base = 200 + j * 34;
    bases.push(base);
    const color = time === 'day' ? ctx.green(j) : HILLS[time][j % 3];
    ctx.poly(curvePoly(X0, X1, base, ctx.between(18, 42), ctx.between(0.02, 0.05), ctx.between(0, TAU), 332), color, { inset: 1, still: true });
  }
  const trees = ctx.int(4, 7);
  for (let i = 0; i < trees; i++) {
    const base = ctx.between(250, 316);
    const light = time === 'day' ? ctx.green(i) : HILLS[time][i % 3];
    pine(ctx, ctx.between(30, 210), base, ctx.between(26, 46), light, time === 'day' ? ctx.green(i + 2) : '#10232B');
  }

  // Cabin and lake.
  if (ctx.rand() < 0.7) {
    const hx = ctx.between(40, 170);
    const hy = 296;
    ctx.poly(rectPts(hx, hy - 22, 32, 22), ctx.col(3), { inset: 1, still: true });
    ctx.poly([[hx - 4, hy - 22], [hx + 36, hy - 22], [hx + 16, hy - 40]], ctx.col(4), { inset: 1, still: true });
    ctx.poly(rectPts(hx + 6, hy - 14, 8, 14), ctx.col(0), { inset: 1, still: true });
    ctx.poly(rectPts(hx + 19, hy - 17, 8, 8), ctx.colors[1], { inset: 1, still: true });
  }
  WATER[time].forEach((c, i) => ctx.poly(rectPts(X0, 318 + i * 12, X1 - X0, 13), c, { inset: 1, still: true }));

  // Frame.
  const t = 5;
  [rectPts(X0 - t, Y0 - t, X1 - X0 + 2 * t, t), rectPts(X0 - t, Y1, X1 - X0 + 2 * t, t), rectPts(X0 - t, Y0, t, Y1 - Y0), rectPts(X1, Y0, t, Y1 - Y0)]
    .forEach((p) => ctx.poly(p, ctx.col(4), { inset: 1, still: true }));
  return `${time} landscape`;
}

function painting(ctx) {
  const cx = 120;
  const w = ctx.between(120, 150);
  const h = ctx.between(150, 180);
  const x0 = cx - w / 2;
  const y0 = ctx.between(58, 72);
  const wood = ctx.col(4);
  const gold = ctx.col(0);

  // Easel legs and ledge.
  ctx.poly([[x0 + 6, y0 + h * 0.6], [x0 + 14, y0 + h * 0.6], [cx - 34, 352], [cx - 46, 352]], wood, { inset: 1, still: true });
  ctx.poly([[x0 + w - 14, y0 + h * 0.6], [x0 + w - 6, y0 + h * 0.6], [cx + 46, 352], [cx + 34, 352]], wood, { inset: 1, still: true });
  ctx.poly([[cx - 3, y0 + h], [cx + 3, y0 + h], [cx + 10, 352], [cx + 2, 352]], wood, { inset: 1, still: true });
  ctx.poly(rectPts(x0 - 10, y0 + h + 6, w + 20, 8), gold, { inset: 1, still: true });

  // The painting itself, clipped to the canvas.
  const id = `cp${ctx.seed}`;
  ctx.defs.push(`<clipPath id="${id}"><rect x="${fmt(x0)}" y="${fmt(y0)}" width="${fmt(w)}" height="${fmt(h)}"/></clipPath>`);
  ctx.poly(rectPts(x0, y0, w, h), ctx.colors[1], { inset: 1, still: true });
  ctx.clip = `url(#${id})`;
  const n = ctx.int(7, 12);
  for (let i = 0; i < n; i++) {
    const x = ctx.between(x0, x0 + w);
    const y = ctx.between(y0, y0 + h);
    const color = ctx.col(i * 2 + ctx.int(0, 3));
    const type = ctx.int(0, 5);
    const s = ctx.between(22, 56);
    if (type === 0) ctx.circ(x, y, s * 0.6, color);
    else if (type === 1) ctx.poly(rotRect(x, y, s * 1.4, s * 0.8, ctx.between(-0.6, 0.6)), color, { inset: 1, still: true });
    else if (type === 2) ctx.poly([pol(x, y, s, -Math.PI / 2), pol(x, y, s, Math.PI / 6), pol(x, y, s, (5 * Math.PI) / 6)], color, { inset: 1, still: true });
    else if (type === 3) ctx.raw(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(s * 0.7)}" fill="none" stroke="${color}" stroke-width="${fmt(ctx.between(4, 9))}"/>`, x, y, [x - s, y - s, x + s, y + s]);
    else if (type === 4) ctx.stroke(`M${fmt(x - s)} ${fmt(y)} Q${fmt(x)} ${fmt(y - s * 0.8)} ${fmt(x + s)} ${fmt(y + ctx.between(-14, 14))}`, color, ctx.between(8, 16), x, y, [x - s, y - s, x + s, y + s * 0.5]);
    else ctx.shape(`M${fmt(x)} ${fmt(y)} L${fmt(x + s)} ${fmt(y)} A${fmt(s)} ${fmt(s)} 0 0 1 ${fmt(x)} ${fmt(y + s)} Z`, color, x + s / 2, y + s / 2, [x, y, x + s, y + s]);
  }
  ctx.clip = null;

  // Frame bars.
  const t = 8;
  [rectPts(x0 - t, y0 - t, w + 2 * t, t), rectPts(x0 - t, y0 + h, w + 2 * t, t), rectPts(x0 - t, y0, t, h), rectPts(x0 + w, y0, t, h)]
    .forEach((p) => ctx.poly(p, gold, { inset: 1, still: true }));

  // A palette and brush resting on the ledge.
  const px = x0 + w + 26;
  const py = y0 + h + 28;
  ctx.ellipse(px, py, 30, 17, ctx.col(1), -0.2);
  [3, 5, 6, 0].forEach((c, i) => ctx.circ(px - 14 + i * 9, py + (i % 2 ? 3 : -4), 4, ctx.col(c)));
  ctx.poly(rotRect(x0 - 24, py - 2, 46, 4, -0.5), wood, { inset: 1, still: true });
  ctx.circ(x0 - 41, py + 7, 4, ctx.col(3));
  return 'painting';
}

module.exports = { scenery, painting };
