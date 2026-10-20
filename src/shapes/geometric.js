'use strict';

// Pure geometry: rings, stars, cubes, triangle grids and waves.

const { TAU, fmt, pol, starPoints } = require('./engine');

function rings(ctx) {
  const cx = 120;
  const cy = ctx.between(180, 200);
  const n = ctx.int(5, 6);
  const step = ctx.between(11, 13);
  const r0 = ctx.between(14, 22);
  const sector = (outer, inner, start, span, fill) => {
    const a = pol(cx, cy, outer, start);
    const b = pol(cx, cy, outer, start + span);
    const c = pol(cx, cy, inner, start + span);
    const d = pol(cx, cy, inner, start);
    const large = span > Math.PI ? 1 : 0;
    ctx.shape(
      `M${fmt(a[0])} ${fmt(a[1])} A${fmt(outer)} ${fmt(outer)} 0 ${large} 1 ${fmt(b[0])} ${fmt(b[1])} L${fmt(c[0])} ${fmt(c[1])} A${fmt(inner)} ${fmt(inner)} 0 ${large} 0 ${fmt(d[0])} ${fmt(d[1])} Z`,
      fill, cx, cy, [cx - outer, cy - outer, cx + outer, cy + outer]
    );
  };
  for (let i = n - 1; i >= 0; i--) {
    const outer = r0 + (i + 1) * step;
    const inner = r0 + i * step;
    const start = ctx.rand() * TAU;
    const span = ctx.pick([Math.PI, Math.PI / 2, (TAU * 3) / 4, Math.PI]);
    sector(outer, inner, start, span, ctx.col(i * 2));
    sector(outer, inner, start + span, TAU - span, ctx.col(i * 2 + 3));
  }
  ctx.circ(cx, cy, r0, ctx.colors[1]);
  return 'rings';
}

function star(ctx) {
  const cx = 120;
  const cy = ctx.between(180, 200);
  const n = ctx.int(5, 9);
  const layers = ctx.int(2, 3);
  const R = ctx.between(86, 104);
  for (let l = 0; l < layers; l++) {
    const outer = R * (1 - l * 0.28);
    const inner = outer * ctx.between(0.35, 0.55);
    const pts = starPoints(cx, cy, outer, inner, n, -Math.PI / 2 + (l * Math.PI) / n * ctx.between(0.5, 1));
    for (let i = 0; i < n * 2; i++) {
      ctx.poly([[cx, cy], pts[i], pts[(i + 1) % (n * 2)]], ctx.col(l * 3 + i), { inset: 0.98 });
    }
  }
  return 'star';
}

// Hexagons drawn as isometric cubes with three faces each.
function cubes(ctx) {
  const s = ctx.between(21, 24);
  const cy = ctx.between(185, 195);
  const corner = (cx, cyc, k) => pol(cx, cyc, s, ((-90 + 60 * k) * Math.PI) / 180);
  for (let r = -2; r <= 2; r++) {
    for (let q = -2; q <= 2; q++) {
      if (Math.abs(q + r) > 2) continue;
      if (ctx.rand() < 0.08) continue;
      const x = 120 + s * Math.sqrt(3) * (q + r / 2);
      const y = cy + s * 1.5 * r;
      const b = ctx.int(0, 7);
      const c = [0, 1, 2, 3, 4, 5].map((k) => corner(x, y, k));
      ctx.poly([[x, y], c[5], c[0], c[1]], ctx.col(b), { inset: 0.97, loose: ctx.rand() < 0.06 });
      ctx.poly([[x, y], c[5], c[4], c[3]], ctx.col(b + 2), { inset: 0.97 });
      ctx.poly([[x, y], c[1], c[2], c[3]], ctx.col(b + 5), { inset: 0.97 });
    }
  }
  return 'cubes';
}

function triangles(ctx) {
  const a = 48;
  const h = a * 0.866;
  const rows = 7;
  const x0 = 12;
  const y0 = 50;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 8; c++) {
      if (ctx.rand() < 0.07) continue;
      const x = x0 + c * (a / 2);
      const y = y0 + r * h;
      const up = (r + c) % 2 === 0;
      const pts = up ? [[x, y + h], [x + a, y + h], [x + a / 2, y]] : [[x, y], [x + a, y], [x + a / 2, y + h]];
      ctx.poly(pts, ctx.col(r * 2 + c * 3), { inset: 0.98, loose: ctx.rand() < 0.05 });
    }
  }
  return 'triangles';
}

function waves(ctx) {
  const layers = ctx.int(6, 8);
  ctx.circ(ctx.between(80, 160), ctx.between(70, 100), ctx.between(24, 36), ctx.col(0));
  for (let i = 0; i < layers; i++) {
    const base = 120 + i * (220 / layers);
    const amp = ctx.between(6, 16);
    const freq = ctx.between(0.04, 0.09);
    const phase = ctx.between(0, TAU);
    const pts = [];
    for (let x = 12; x <= 228; x += 8) pts.push([x, base + amp * Math.sin(freq * x + phase)]);
    pts.push([228, 346], [12, 346]);
    ctx.poly(pts, ctx.col(i * 2 + 3), { inset: 1, still: true });
  }
  return 'waves';
}

module.exports = { rings, star, cubes, triangles, waves };
