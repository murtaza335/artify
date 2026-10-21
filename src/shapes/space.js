'use strict';

// Galaxies, planets and night skies.

const { TAU, fmt, pol, starPoints, circleBand } = require('./engine');

function diamond(cx, cy, r) {
  return [[cx, cy - r], [cx + r * 0.7, cy], [cx, cy + r], [cx - r * 0.7, cy]];
}

function scatterStars(ctx, count, keepClear) {
  for (let i = 0; i < count; i++) {
    const x = ctx.between(14, 226);
    const y = ctx.between(40, 350);
    if (keepClear && keepClear(x, y)) continue;
    const r = ctx.between(2, 6);
    if (ctx.rand() < 0.5) ctx.poly(starPoints(x, y, r * 1.6, r * 0.5, 4), ctx.pick(ctx.colors), { inset: 1, still: true });
    else ctx.circ(x, y, r * 0.5, ctx.colors[1]);
  }
}

function galaxy(ctx) {
  const cx = 120;
  const cy = ctx.between(180, 200);
  const arms = ctx.int(2, 4);
  const twist = ctx.between(2.2, 4.2);
  const squash = ctx.between(0.7, 0.95);
  const tilt = ctx.between(-0.5, 0.5);
  const R = (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    return [cx + dx * Math.cos(tilt) - dy * Math.sin(tilt), cy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  };
  const per = ctx.int(24, 32);
  for (let a = 0; a < arms; a++) {
    for (let i = 0; i < per; i++) {
      const t = i / (per - 1);
      const r = 16 + t * 98;
      const ang = (a * TAU) / arms + t * twist;
      const [x, y] = R(cx + Math.cos(ang) * r + ctx.between(-5, 5), cy + Math.sin(ang) * r * squash + ctx.between(-5, 5));
      const size = ctx.between(2.4, 7) * (1.2 - t * 0.5);
      const color = ctx.col(a * 2 + (i % 3));
      if (ctx.rand() < 0.5) ctx.circ(x, y, size, color);
      else ctx.poly(diamond(x, y, size * 1.5), color, { inset: 1, still: true });
    }
  }
  ctx.circ(cx, cy, 38, ctx.col(3));
  ctx.circ(cx, cy, 26, ctx.col(0));
  ctx.circ(cx, cy, 13, ctx.colors[1]);
  scatterStars(ctx, 14, (x, y) => Math.hypot(x - cx, (y - cy) / squash) < 112);
  return 'galaxy';
}

function planet(ctx) {
  const cx = ctx.between(100, 140);
  const cy = ctx.between(170, 200);
  const r = ctx.between(52, 68);
  const bands = ctx.int(4, 6);
  // The ring is two tilted ellipse outlines. Their far half is drawn before the planet and their near half after
  // it, so the ring passes behind the planet at the top and in front of it at the bottom.
  const tilt = ctx.between(-0.5, -0.1);
  const rings = [[1.9, 0.42, ctx.colors[1], 7], [1.65, 0.36, ctx.col(0), 3]];
  const ring = (near) => rings.forEach(([kx, ky, color, width]) => {
    const rx = r * kx;
    const ry = r * ky;
    ctx.raw(`<path d="M${fmt(cx - rx)} ${fmt(cy)} A${fmt(rx)} ${fmt(ry)} 0 0 ${near ? 0 : 1} ${fmt(cx + rx)} ${fmt(cy)}" fill="none" stroke="${color}" stroke-width="${width}" transform="rotate(${fmt((tilt * 180) / Math.PI)} ${fmt(cx)} ${fmt(cy)})"/>`, cx, cy, [cx - rx, cy - r * kx * 0.42, cx + rx, cy + r * kx * 0.42]);
  });
  ring(false);
  for (let i = 0; i < bands; i++) {
    const y0 = cy - r + (i * 2 * r) / bands;
    const y1 = cy - r + ((i + 1) * 2 * r) / bands;
    ctx.poly(circleBand(cx, cy, r, y0, y1), ctx.col(i * 2 + 3), { inset: 1, still: true });
  }
  ring(true);
  const moons = ctx.int(1, 3);
  for (let m = 0; m < moons; m++) {
    const a = ctx.between(0, TAU);
    const [x, y] = pol(cx, cy, r * ctx.between(1.5, 1.9), a);
    ctx.circ(Math.min(226, Math.max(14, x)), Math.min(350, Math.max(48, y)), ctx.between(7, 14), ctx.col(m * 2 + 1));
  }
  scatterStars(ctx, 14, (x, y) => Math.hypot(x - cx, y - cy) < r * 2);
  return 'planet';
}

function nightsky(ctx) {
  // A crescent moon between two arcs, a comet, and stars.
  const mx = ctx.between(100, 150);
  const my = ctx.between(100, 150);
  const R = ctx.between(40, 56);
  const a = ctx.between(-1.2, -0.9);
  const A = pol(mx, my, R, a);
  const B = pol(mx, my, R, -a);
  const inner = R * ctx.between(0.75, 0.9);
  ctx.shape(`M${fmt(A[0])} ${fmt(A[1])} A${fmt(R)} ${fmt(R)} 0 1 0 ${fmt(B[0])} ${fmt(B[1])} A${fmt(inner)} ${fmt(inner)} 0 1 1 ${fmt(A[0])} ${fmt(A[1])} Z`, ctx.col(0), mx, my, [mx - R, my - R, mx + R, my + R]);
  const hx = ctx.between(150, 200);
  const hy = ctx.between(250, 300);
  ctx.circ(hx, hy, 9, ctx.colors[1]);
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.12;
    ctx.poly([[hx, hy], pol(hx, hy, ctx.between(50, 90), Math.PI * 0.75 + spread - 0.07), pol(hx, hy, ctx.between(50, 90), Math.PI * 0.75 + spread + 0.07)], ctx.col(i + 3), { inset: 1, still: true });
  }
  // Rolling hills along the bottom.
  for (let i = 0; i < 3; i++) {
    const x = 30 + i * 80 + ctx.between(-10, 10);
    const h = ctx.between(30, 60);
    ctx.poly([[x - 70, 354], [x, 354 - h], [x + 70, 354]], ctx.col(i + 2), { inset: 1, still: true });
  }
  scatterStars(ctx, 22, (x, y) => Math.hypot(x - mx, y - my) < R + 10);
  return 'night sky';
}

module.exports = { galaxy, planet, nightsky };
