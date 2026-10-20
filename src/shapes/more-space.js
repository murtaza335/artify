'use strict';

// More space: astronaut, UFO, solar system, satellite, constellation and eclipse.

const { TAU, fmt, pol, starPoints, rectPts, rotRect } = require('./engine');

const R = rectPts;

function stars(ctx, count, clear) {
  for (let i = 0; i < count; i++) {
    const x = ctx.between(14, 226);
    const y = ctx.between(40, 350);
    if (clear && clear(x, y)) continue;
    const r = ctx.between(2, 5.5);
    if (ctx.rand() < 0.5) ctx.poly(starPoints(x, y, r * 1.6, r * 0.5, 4), ctx.pick(ctx.colors), { inset: 1, still: true });
    else ctx.circ(x, y, r * 0.45, ctx.colors[1]);
  }
}

function astronaut(ctx) {
  const white = ctx.colors[1];
  const suit = ctx.kind === 'light' ? '#E9E4D4' : '#E6EEF2';
  const tilt = ctx.between(-0.2, 0.2);
  const rot = (x, y) => [120 + (x - 120) * Math.cos(tilt) - (y - 220) * Math.sin(tilt), 220 + (x - 120) * Math.sin(tilt) + (y - 220) * Math.cos(tilt)];
  const P = (pts) => pts.map(([x, y]) => rot(x, y));
  ctx.circ(ctx.between(40, 200), 330, ctx.between(50, 80), ctx.col(2));
  ctx.poly(P([[80, 170], [160, 170], [168, 266], [72, 266]]), ctx.col(4), { inset: 1, still: true });
  for (const s of [-1, 1]) {
    ctx.poly(P([[120 + s * 44, 180], [120 + s * 88, 214], [120 + s * 78, 236], [120 + s * 38, 210]]), suit, { inset: 1 });
    ctx.poly(P([[120 + s * 8, 262], [120 + s * 40, 262], [120 + s * 52, 330], [120 + s * 22, 336]]), suit, { inset: 1 });
    ctx.poly(P([[120 + s * 22, 334], [120 + s * 56, 328], [120 + s * 60, 348], [120 + s * 22, 350]]), ctx.col(3), { inset: 1 });
  }
  ctx.poly(P([[88, 174], [152, 174], [160, 266], [80, 266]]), suit, { inset: 1, still: true });
  ctx.poly(P([[104, 200], [136, 200], [136, 226], [104, 226]]), ctx.col(3), { inset: 1, still: true });
  ctx.circ(...rot(120, 128), 50, suit);
  const v = rot(120, 128);
  ctx.ellipse(v[0], v[1] + 2, 36, 30, ctx.ink, tilt);
  const g = rot(106, 116);
  ctx.ellipse(g[0], g[1], 9, 5, ctx.col(5), tilt - 0.5);
  ctx.poly(P([[100, 254], [140, 254], [140, 262], [100, 262]]), ctx.col(0), { inset: 1, still: true });
  ctx.line(...rot(172, 124), ...rot(172, 96), ctx.col(4), 3);
  ctx.poly(P([[172, 96], [200, 104], [172, 114]]), ctx.col(3), { inset: 1, still: true });
  stars(ctx, 18, (x, y) => Math.hypot(x - 120, y - 200) < 110);
  return 'astronaut';
}

function ufo(ctx) {
  const cy = ctx.between(130, 160);
  ctx.raw(`<polygon points="100,${cy + 20} 140,${cy + 20} 190,340 50,340" fill="${ctx.colors[0]}" opacity=".3"/>`, 120, 250, [50, cy + 20, 190, 340]);
  ctx.shape(`M80 ${cy} A40 36 0 0 1 160 ${cy} Z`, ctx.col(5), 120, cy - 16, [80, cy - 36, 160, cy]);
  ctx.ellipse(120, cy + 8, 100, 24, ctx.col(4));
  ctx.ellipse(120, cy + 4, 100, 18, ctx.col(2));
  for (let i = 0; i < 5; i++) ctx.circ(46 + i * 37, cy + 10, 5, ctx.pick([ctx.colors[0], ctx.col(3), ctx.col(6), ctx.colors[1]]));
  ctx.circ(120, cy - 14, 9, ctx.green(0));
  ctx.line(112, cy - 24, 108, cy - 44, ctx.green(0), 3);
  ctx.line(128, cy - 24, 132, cy - 44, ctx.green(0), 3);
  ctx.circ(108, cy - 46, 3, ctx.green(0));
  ctx.circ(132, cy - 46, 3, ctx.green(0));
  ctx.poly([[96, 340], [144, 340], [136, 326], [104, 326]], ctx.col(3), { inset: 1, still: true });
  stars(ctx, 20, (x, y) => y > cy - 50 && y < 345 && Math.abs(x - 120) < 100);
  return 'UFO';
}

function solarSystem(ctx) {
  const cx = 120;
  const cy = 190;
  ctx.circ(cx, cy, 26, ctx.colors[0]);
  ctx.circ(cx, cy, 17, ctx.col(3));
  const planets = ctx.int(5, 7);
  for (let i = 0; i < planets; i++) {
    const r = 42 + i * 12.5;
    ctx.raw(`<circle cx="${cx}" cy="${cy}" r="${fmt(r)}" fill="none" stroke="${ctx.colors[1]}" stroke-width="1.2" opacity=".55"/>`, cx, cy, [cx - r, cy - r, cx + r, cy + r]);
    const a = ctx.between(0, TAU);
    const [x, y] = pol(cx, cy, r, a);
    const pr = ctx.between(4, 11) * (i === 3 ? 1.5 : 1);
    ctx.circ(x, y, pr, ctx.col(i * 2 + 2));
    if (i === 4) ctx.raw(`<ellipse cx="${fmt(x)}" cy="${fmt(y)}" rx="${fmt(pr * 2)}" ry="${fmt(pr * 0.5)}" fill="none" stroke="${ctx.colors[1]}" stroke-width="2.5" transform="rotate(-20 ${fmt(x)} ${fmt(y)})"/>`, x, y, [x - pr * 2, y - pr, x + pr * 2, y + pr]);
  }
  stars(ctx, 14, (x, y) => Math.hypot(x - cx, y - cy) < 118);
  return 'solar system';
}

function satellite(ctx) {
  ctx.circ(120, 480, 170, ctx.col(2));
  ctx.poly([[40, 346], [90, 332], [100, 362], [30, 362]], ctx.green(0), { inset: 1, still: true });
  ctx.poly([[140, 344], [190, 330], [200, 362], [150, 364]], ctx.green(1), { inset: 1, still: true });
  const tilt = ctx.between(-0.5, 0.5);
  const cx = 120;
  const cy = 170;
  const rot = (x, y) => [cx + (x - cx) * Math.cos(tilt) - (y - cy) * Math.sin(tilt), cy + (x - cx) * Math.sin(tilt) + (y - cy) * Math.cos(tilt)];
  const P = (pts) => pts.map(([x, y]) => rot(x, y));
  for (const s of [-1, 1]) {
    ctx.poly(P([[cx + s * 22, cy - 18], [cx + s * 104, cy - 18], [cx + s * 104, cy + 18], [cx + s * 22, cy + 18]]), ctx.col(5), { inset: 1, still: true });
    for (let k = 1; k < 4; k++) ctx.poly(P([[cx + s * (22 + k * 20.5) - 1, cy - 18], [cx + s * (22 + k * 20.5) + 1, cy - 18], [cx + s * (22 + k * 20.5) + 1, cy + 18], [cx + s * (22 + k * 20.5) - 1, cy + 18]]), ctx.col(4), { inset: 1, still: true });
  }
  ctx.poly(P([[cx - 22, cy - 26], [cx + 22, cy - 26], [cx + 22, cy + 26], [cx - 22, cy + 26]]), ctx.colors[0], { inset: 1, still: true });
  ctx.poly(P([[cx - 14, cy - 18], [cx + 14, cy - 18], [cx + 14, cy + 4], [cx - 14, cy + 4]]), ctx.col(4), { inset: 1, still: true });
  const d = rot(cx, cy - 26);
  ctx.line(d[0], d[1], ...rot(cx, cy - 52), ctx.colors[1], 3);
  ctx.shape(`M${fmt(rot(cx - 20, cy - 66)[0])} ${fmt(rot(cx - 20, cy - 66)[1])} A22 14 0 0 0 ${fmt(rot(cx + 20, cy - 66)[0])} ${fmt(rot(cx + 20, cy - 66)[1])} Z`, ctx.colors[1], cx, cy - 60, [cx - 24, cy - 78, cx + 24, cy - 54]);
  stars(ctx, 16, (x, y) => y > 305 || (Math.abs(x - 120) < 110 && Math.abs(y - 170) < 80));
  return 'satellite';
}

function constellation(ctx) {
  const n = ctx.int(7, 10);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push([ctx.between(34, 206), 70 + (i / (n - 1)) * 250 + ctx.between(-14, 14)]);
  for (let i = 0; i < n - 1; i++) ctx.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ctx.colors[1], 1.8);
  if (ctx.rand() < 0.5) ctx.line(pts[1][0], pts[1][1], pts[Math.min(n - 1, 4)][0], pts[Math.min(n - 1, 4)][1], ctx.colors[1], 1.8);
  pts.forEach(([x, y], i) => ctx.poly(starPoints(x, y, 12 + (i % 3) * 3, 4, 4), ctx.pick([ctx.colors[0], ctx.colors[1], ctx.col(6)]), { inset: 1, still: true }));
  const mx = ctx.between(40, 90);
  ctx.circ(mx, ctx.between(60, 110), ctx.between(14, 20), ctx.col(1));
  stars(ctx, 22);
  return 'constellation';
}

function eclipse(ctx) {
  const cx = 120;
  const cy = ctx.between(180, 200);
  const rays = ctx.int(16, 24);
  for (let i = 0; i < rays; i++) {
    const a = (i * TAU) / rays;
    const len = ctx.between(70, 104);
    ctx.poly([pol(cx, cy, 56, a - 0.1), pol(cx, cy, len, a), pol(cx, cy, 56, a + 0.1)], i % 2 ? ctx.colors[0] : ctx.col(3), { inset: 1, still: true });
  }
  ctx.circ(cx, cy, 58, ctx.colors[0]);
  ctx.circ(cx + ctx.between(-10, 10), cy + ctx.between(-8, 8), 52, ctx.ink);
  ctx.raw(`<circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="${ctx.colors[1]}" stroke-width="2" opacity=".7"/>`, cx, cy, [cx - 62, cy - 62, cx + 62, cy + 62]);
  stars(ctx, 20, (x, y) => Math.hypot(x - cx, y - cy) < 112);
  return 'eclipse';
}

module.exports = { astronaut, ufo, solarSystem, satellite, constellation, eclipse };
