'use strict';

// More space: a black hole, comet, nebula, ringed planet, moon phases, space station, meteor shower and lunar lander.

const { TAU, fmt, pol, rectPts, circleBand, blob, arcBand, rotRect } = require('./engine');

const R = rectPts;
const still = { inset: 1, still: true };

function stars(ctx, n, keepOut) {
  for (let i = 0; i < n; i++) {
    const x = ctx.between(16, 224);
    const y = ctx.between(16, 364);
    if (keepOut && keepOut(x, y)) continue;
    ctx.circ(x, y, ctx.between(1.4, 3.4), ctx.pick([ctx.colors[1], ctx.colors[0], ctx.col(5)]));
  }
}

function ellipseRing(ctx, cx, cy, rx, ry, rot, color, width) {
  const reach = Math.max(rx, ry) + width;
  ctx.raw(`<ellipse cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="none" stroke="${color}" stroke-width="${fmt(width)}" transform="rotate(${fmt((rot * 180) / Math.PI)} ${fmt(cx)} ${fmt(cy)})"/>`, cx, cy, [cx - reach, cy - reach, cx + reach, cy + reach]);
}

function blackHole(ctx) {
  const cx = 120;
  const cy = ctx.between(180, 200);
  const rot = ctx.between(-0.35, 0.35);
  const hue = ctx.int(0, 7);
  stars(ctx, 14, (x, y) => Math.hypot(x - cx, y - cy) < 100);
  for (let i = 0; i < 4; i++) ellipseRing(ctx, cx, cy, 104 - i * 12, 26 - i * 4, rot, ctx.col(hue + i), 11 - i);
  ctx.circ(cx, cy, 44, ctx.col(0) === ctx.ink ? ctx.col(3) : ctx.ink);
  ctx.raw(`<circle cx="${cx}" cy="${fmt(cy)}" r="48" fill="none" stroke="${ctx.colors[1]}" stroke-width="3"/>`, cx, cy, [cx - 50, cy - 50, cx + 50, cy + 50]);
  ctx.raw(`<path d="M${cx - 60} ${fmt(cy - 20)} A60 60 0 0 1 ${cx + 60} ${fmt(cy - 20)}" fill="none" stroke="${ctx.col(hue)}" stroke-width="7" stroke-linecap="round"/>`, cx, cy - 50, [cx - 62, cy - 80, cx + 62, cy - 16]);
  ellipseRing(ctx, cx, cy, 104, 26, rot, ctx.col(hue + 5), 3);
  return 'black hole';
}

function comet(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  const hx = 120 + side * 62;
  const hy = ctx.between(100, 140);
  const hue = ctx.int(0, 7);
  stars(ctx, 14, (x, y) => Math.abs((x - hx) * 1.4 + (y - hy) * side) < 40);
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const spread = (i - (n - 1) / 2) * 0.1;
    const a = Math.atan2(1, -side * 0.6) + spread;
    const len = ctx.between(170, 240) * (1 - Math.abs(spread) * 0.8);
    const tip = pol(hx, hy, len, a);
    const l = pol(hx, hy, 18, a - Math.PI / 2);
    const r = pol(hx, hy, 18, a + Math.PI / 2);
    ctx.poly([l, tip, r].map(([x, y]) => [Math.max(8, Math.min(232, x)), Math.max(8, Math.min(372, y))]), ctx.col(hue + (i % 3)), { inset: 1 });
  }
  ctx.circ(hx, hy, 24, ctx.colors[1]);
  ctx.circ(hx, hy, 15, ctx.col(hue));
  ctx.circ(hx - 5, hy - 5, 5, ctx.colors[1]);
  return 'comet';
}

function nebula(ctx) {
  const hue = ctx.int(0, 7);
  stars(ctx, 20);
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const x = 120 + ctx.between(-36, 36);
    const y = 190 + ctx.between(-100, 100);
    const r = ctx.between(30, 48);
    const c = ctx.col(hue + (i % 4) * 2);
    const reach = r * 1.35;
    const pts = Array.from({ length: 7 }, (_, k) => pol(x, y, r * ctx.between(0.7, 1.35), ctx.rand() * 0.8 + (k * TAU) / 7));
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s = mid(pts[6], pts[0]);
    let d = `M${fmt(s[0])} ${fmt(s[1])}`;
    pts.forEach((p, k) => { const m = mid(p, pts[(k + 1) % 7]); d += `Q${fmt(p[0])} ${fmt(p[1])} ${fmt(m[0])} ${fmt(m[1])}`; });
    ctx.raw(`<path d="${d}Z" fill="${c}" fill-opacity="0.7"/>`, x, y, [x - reach, y - reach, x + reach, y + reach]);
  }
  const bx = 120 + ctx.between(-30, 30);
  const by = 190 + ctx.between(-40, 40);
  ctx.circ(bx, by, 14, ctx.colors[1]);
  ctx.circ(bx, by, 7, ctx.col(0));
  return 'nebula';
}

function ringedPlanet(ctx) {
  const cx = 120;
  const cy = ctx.between(180, 200);
  const r = ctx.between(50, 58);
  const rot = ctx.between(-0.5, 0.5);
  const base = ctx.int(0, 7);
  stars(ctx, 14, (x, y) => Math.hypot(x - cx, y - cy) < 110);
  ellipseRing(ctx, cx, cy, r * 1.55, r * 0.45, rot, ctx.col(base + 3), 12);
  const bands = ctx.int(5, 7);
  for (let i = 0; i < bands; i++) {
    const y0 = cy - r + (i * 2 * r) / bands;
    const y1 = cy - r + ((i + 1) * 2 * r) / bands;
    ctx.poly(circleBand(cx, cy, r, y0, y1, 6), ctx.col(base + (i % 3) * 2), still);
  }
  ctx.raw(`<path d="M${fmt(cx - r * 1.55)} ${fmt(cy)} A${fmt(r * 1.55)} ${fmt(r * 0.45)} 0 0 0 ${fmt(cx + r * 1.55)} ${fmt(cy)}" fill="none" stroke="${ctx.col(base + 3)}" stroke-width="12" transform="rotate(${fmt((rot * 180) / Math.PI)} ${cx} ${fmt(cy)})"/>`, cx, cy + r * 0.3, [cx - r * 2.1, cy - 20, cx + r * 2.1, cy + r * 0.7 + 30]);
  ctx.circ(ctx.pick([46, 194]), ctx.pick([80, 310]), ctx.between(9, 15), ctx.colors[1]);
  return 'ringed planet';
}

function moonPhases(ctx) {
  const n = 5;
  const start = ctx.int(0, 3);
  const dir = ctx.rand() < 0.5 ? 1 : -1;
  const r = 30;
  const lit = ctx.colors[1];
  const dark = ctx.col(4);
  const glow = ctx.col(ctx.int(0, 7));
  for (let i = 0; i < n; i++) {
    const cx = 120;
    const cy = 76 + i * 62;
    const p = (start + i * 1.25) / 5 + 0.0;
    const phase = Math.min(1, p * 0.8 + i * 0.04);
    const f = Math.min(1, (i + 0.5) / n + (start % 2 ? 0.1 : 0));
    ctx.circ(cx, cy, r + 5, glow);
    ctx.circ(cx, cy, r, dark);
    if (f >= 0.98) { ctx.circ(cx, cy, r, lit); continue; }
    const rx = r * Math.abs(1 - 2 * f);
    const outer = dir > 0 ? 1 : 0;
    const inner = (f < 0.5 ? 1 - outer : outer);
    ctx.shape(`M${cx} ${cy - r} A${r} ${r} 0 0 ${outer} ${cx} ${cy + r} A${fmt(rx)} ${r} 0 0 ${inner} ${cx} ${cy - r} Z`, lit, cx, cy, [cx - r, cy - r, cx + r, cy + r]);
  }
  stars(ctx, 12, (x) => Math.abs(x - 120) < 50);
  return 'moon phases';
}

function spaceStation(ctx) {
  const cy = ctx.between(150, 190);
  const tilt = ctx.between(-0.25, 0.25);
  const hue = ctx.int(0, 7);
  ctx.shape('M0 338 Q120 270 240 338 L240 380 L0 380 Z', ctx.col(5), 120, 350, [0, 300, 240, 380]);
  ctx.stroke('M0 338 Q120 270 240 338', ctx.colors[1], 3, 120, 316, [0, 304, 240, 340]);
  stars(ctx, 14, (x, y) => y > 280);
  const P = (x, y) => [120 + (x - 120) * Math.cos(tilt) - (y - cy) * Math.sin(tilt), cy + (x - 120) * Math.sin(tilt) + (y - cy) * Math.cos(tilt)];
  ctx.poly([P(104, cy - 12), P(136, cy - 12), P(136, cy + 12), P(104, cy + 12)].concat([]), ctx.colors[1], still);
  ctx.poly([P(40, cy - 4), P(200, cy - 4), P(200, cy + 4), P(40, cy + 4)], ctx.col(hue + 3), still);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const x = 120 + s * (52 + k * 38);
      ctx.poly([P(x - 17, cy - 56), P(x + 17, cy - 56), P(x + 17, cy - 8), P(x - 17, cy - 8)], ctx.col(hue + 2), { inset: 0.94, still: true });
      ctx.poly([P(x - 17, cy + 8), P(x + 17, cy + 8), P(x + 17, cy + 56), P(x - 17, cy + 56)], ctx.col(hue + 2), { inset: 0.94, still: true });
    }
    ctx.circ(...P(120 + s * 22, cy), 11, ctx.col(hue));
  }
  ctx.circ(...P(120, cy - 30), 7, ctx.col(0));
  ctx.line(...P(120, cy - 12), ...P(120, cy - 36), ctx.ink, 2);
  return 'space station';
}

function meteorShower(ctx) {
  stars(ctx, 10);
  const n = ctx.int(8, 12);
  const angle = ctx.between(0.9, 1.2);
  for (let i = 0; i < n; i++) {
    const x = ctx.between(40, 230);
    const y = ctx.between(20, 220);
    const len = ctx.between(50, 110);
    const [tx, ty] = [x - Math.cos(angle) * len, y - Math.sin(angle) * len];
    ctx.poly([[x, y], [Math.max(6, tx) + 2, Math.max(6, ty) + 4], [Math.max(6, tx) - 3, Math.max(6, ty) - 1]], ctx.col(i % 3 === 0 ? 0 : 5), { inset: 1 });
    ctx.circ(x, y, ctx.between(3, 5), ctx.colors[1]);
  }
  ctx.poly([[0, 346], [0, 310], [40, 270], [74, 300], [120, 250], [168, 296], [200, 272], [240, 312], [240, 346]].map(([x, y]) => [Math.max(0, x), y]), ctx.col(4), { inset: 1, still: true });
  ctx.poly([[0, 346], [0, 330], [60, 316], [130, 332], [200, 318], [240, 330], [240, 346]], ctx.ink, { inset: 1, still: true });
  ctx.poly([[96, 322], [104, 300], [112, 322]], ctx.col(0), still);
  return 'meteor shower';
}

function lunarLander(ctx) {
  const cx = ctx.between(100, 140);
  const hue = ctx.int(0, 7);
  stars(ctx, 12, (x, y) => y > 280);
  ctx.circ(ctx.pick([56, 184]), ctx.between(72, 110), ctx.between(22, 32), ctx.col(2));
  ctx.circ(ctx.pick([56, 184]) - 6, ctx.between(72, 110) - 4, 8, ctx.col(5));
  ctx.poly([[0, 346], [0, 316], [50, 304], [110, 322], [170, 308], [240, 320], [240, 346]], ctx.col(hue + 4), { inset: 1, still: true });
  for (let i = 0; i < 4; i++) ctx.ellipse(ctx.between(20, 220), ctx.between(326, 340), ctx.between(8, 18), 3, ctx.col(hue + 5), 0);
  for (const s of [-1, 1]) {
    ctx.line(cx + s * 22, 252, cx + s * 52, 312, ctx.colors[1], 4);
    ctx.line(cx + s * 52, 312, cx + s * 66, 312, ctx.colors[1], 5);
    ctx.line(cx + s * 22, 252, cx + s * 22, 282, ctx.colors[1], 3);
  }
  ctx.poly([[cx - 28, 196], [cx + 28, 196], [cx + 38, 224], [cx + 28, 252], [cx - 28, 252], [cx - 38, 224]], ctx.col(hue), { inset: 1, still: true });
  ctx.poly([[cx - 20, 150], [cx + 20, 150], [cx + 28, 196], [cx - 28, 196]], ctx.col(hue + 3), { inset: 1, still: true });
  ctx.circ(cx, 172, 10, ctx.col(5));
  ctx.poly([[cx - 12, 252], [cx + 12, 252], [cx + 20, 270], [cx - 20, 270]], ctx.ink, still);
  const fx = cx + ctx.pick([-88, 88]);
  ctx.line(fx, 322, fx, 270, ctx.colors[1], 3);
  ctx.poly([[fx, 270], [fx + 22, 276], [fx, 284]], ctx.col(3), still);
  return 'lunar lander';
}

module.exports = { blackHole, comet, nebula, ringedPlanet, moonPhases, spaceStation, meteorShower, lunarLander };
