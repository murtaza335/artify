'use strict';

// Organic and lyrical abstraction: soak stains, a drip web, a loop scribble, an ensō, an ink blot, biomorphic
// cells, dividing cells, a lava lamp, terrazzo, an agate slice, wood grain, pebbles, seaweed ribbons, marbling,
// paper-cut waves, a dreamy constellation, a squircle grid, a petal burst, venation, soft coral, bubble foam,
// a rippling pond, gesture strokes, a river delta, moss patches and liquid bands.

const { TAU, fmt, pol, starPoints } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, ground, batcher, polyline, glow, ring, X0, Y0, X1, Y1, CX, CY } = K;

const inkOn = (ctx, bg) => (bg === ctx.ink ? ctx.colors[1] : ctx.ink);
const dot = (x, y, r, c) => `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${c}"/>`;

// A smooth closed path through points, as quadratic curves between their midpoints.
function smoothClosed(points) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const n = points.length;
  const start = mid(points[n - 1], points[0]);
  let d = `M${fmt(start[0])} ${fmt(start[1])}`;
  points.forEach((p, i) => {
    const m = mid(p, points[(i + 1) % n]);
    d += `Q${fmt(p[0])} ${fmt(p[1])} ${fmt(m[0])} ${fmt(m[1])}`;
  });
  return d + 'Z';
}

// A wobbly closed outline around a centre, with its points.
function wobble(ctx, cx, cy, rx, ry, amount, n = 9) {
  const rot = ctx.between(0, TAU);
  return Array.from({ length: n }, (_, i) => {
    const a = rot + (i * TAU) / n;
    const k = 1 + (ctx.rand() * 2 - 1) * amount;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
}

function blobPart(ctx, points, fill, opacity = 1) {
  const b = K.boundsOf(points);
  ctx.raw(`<path d="${smoothClosed(points)}" fill="${fill}"${opacity < 1 ? ` opacity="${fmt(opacity)}"` : ''}/>`, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b);
}

function soakStain(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(7, 11);
  for (let i = 0; i < n; i++) {
    const x = ctx.between(40, 200);
    const y = ctx.between(80, 320);
    blobPart(ctx, wobble(ctx, x, y, ctx.between(30, 80), ctx.between(30, 90), 0.35, 10), pal[i % 4], ctx.between(0.45, 0.75));
  }
  return 'soak stain';
}

function dripWeb(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(ctx.int(0, 7)), ctx.ink]);
  panel(ctx, bg);
  const ink = inkOn(ctx, bg);
  const pal = hues(ctx, 3, [bg, ink]);
  const layers = [ink, ...pal];
  layers.forEach((c, l) => {
    for (let k = 0; k < 3; k++) {
      const pts = [];
      let [x, y] = [ctx.between(X0, X1), ctx.between(Y0, Y1)];
      let a = ctx.between(0, TAU);
      for (let s = 0; s < 40; s++) {
        a += ctx.between(-1.2, 1.2);
        x = Math.max(X0 - 10, Math.min(X1 + 10, x + Math.cos(a) * 14));
        y = Math.max(Y0 - 10, Math.min(Y1 + 10, y + Math.sin(a) * 14));
        pts.push([x, y]);
      }
      polyline(ctx, pts, c, l === 0 ? 1.6 : ctx.between(1.5, 4));
    }
    const b = batcher(ctx, 99);
    for (let i = 0; i < 18; i++) {
      const [x, y, r] = [ctx.between(X0, X1), ctx.between(Y0, Y1), ctx.between(1, 4)];
      b.add(dot(x, y, r, c), x - r, y - r, x + r, y + r);
    }
    b.flush();
  });
  return 'drip web';
}

function loopScribble(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(ctx.int(0, 7))]);
  panel(ctx, bg);
  const ink = inkOn(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, ink]);
  const rows = ctx.int(3, 6);
  for (let r = 0; r < rows; r++) {
    const y0 = 90 + r * (240 / rows);
    const pts = [];
    const loop = ctx.between(10, 22);
    for (let t = 0; t < 160; t++) {
      const x = 26 + t * 1.2 + Math.cos(t * 0.5) * loop;
      pts.push([x, y0 + Math.sin(t * 0.5) * loop * 0.9 + Math.sin(t * 0.05 + r) * 10]);
    }
    polyline(ctx, pts, r === 1 ? accent : ink, 1.8);
  }
  return 'loop scribble';
}

function enso(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.ink]);
  panel(ctx, bg);
  const ink = inkOn(ctx, bg);
  const [seal] = hues(ctx, 1, [bg, ink]);
  const r = ctx.between(72, 86);
  const start = ctx.between(0, TAU);
  const sweep = ctx.between(5.3, 6.0);
  const segs = 14;
  for (let s = 0; s < segs; s++) {
    const a0 = start + (s / segs) * sweep;
    const a1 = start + ((s + 1.1) / segs) * sweep;
    const w = 6 + 16 * Math.sin(Math.PI * Math.min(1, (s + 0.5) / segs + 0.15)) * (1 - s / (segs * 1.4));
    const pts = Array.from({ length: 5 }, (_, i) => pol(CX, CY, r + Math.sin(s + i) * 1.5, a0 + ((a1 - a0) * i) / 4));
    polyline(ctx, pts, ink, Math.max(3, w));
  }
  ctx.poly(R(ctx.between(170, 196), ctx.between(286, 310), 18, 22), seal, still);
  return 'ensō';
}

function inkBlot(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = [ctx.ink, ...hues(ctx, 2, [bg, ctx.ink])];
  for (let k = 0; k < 7; k++) {
    const x = ctx.between(12, 80);
    const y = ctx.between(90, 310);
    const pts = wobble(ctx, CX - x, y, ctx.between(14, 46), ctx.between(14, 50), 0.45, 8);
    const c = pal[k < 4 ? 0 : 1 + (k % 2)];
    blobPart(ctx, pts, c, k < 4 ? 1 : 0.85);
    blobPart(ctx, pts.map(([px, py]) => [2 * CX - px, py]), c, k < 4 ? 1 : 0.85);
  }
  return 'ink blot';
}

function biomorphCells(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const x = ctx.between(40, 200);
    const y = ctx.between(80, 320);
    const r = ctx.between(22, 46);
    const pts = wobble(ctx, x, y, r, r * ctx.between(0.7, 1.2), 0.3, 8);
    blobPart(ctx, pts, pal[i % 4]);
    ctx.circ(x + ctx.between(-r / 3, r / 3), y + ctx.between(-r / 3, r / 3), r * 0.28, pal[(i + 2) % 4]);
  }
  return 'biomorphic cells';
}

function dividingCells(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(5), ctx.col(7)]);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 2; i++) {
      const x = 68 + i * 104;
      const y = 90 + j * 72;
      const split = (j * 2 + i) / 7;
      const off = 8 + split * 20;
      const a = ctx.between(0, Math.PI);
      for (const s of [-1, 1]) {
        const [cx, cy] = pol(x, y, off * s, a);
        ctx.ellipse(cx, cy, 30 - split * 8, 24, pal[0], a);
        ctx.circ(cx, cy, 6, pal[1 + ((i + j) % 2)]);
      }
    }
  }
  return 'dividing cells';
}

function lavaLamp(ctx) {
  const [bg, wax] = hues(ctx, 2, []);
  panel(ctx, bg);
  const [glowC] = hues(ctx, 1, [bg, wax]);
  glow(ctx, CX, 330, 120, glowC, 0.4);
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const y = 330 - i * (260 / n) - ctx.between(0, 20);
    const r = ctx.between(16, 40) * (i === 0 ? 2 : 1);
    blobPart(ctx, wobble(ctx, ctx.between(70, 170), y, r, r * ctx.between(1, 1.5), 0.2, 8), wax);
  }
  return 'lava lamp';
}

function terrazzo(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(6), ctx.col(7)]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const b = batcher(ctx, 6);
  for (let i = 0; i < 90; i++) {
    const x = ctx.between(X0, X1);
    const y = ctx.between(Y0, Y1);
    const r = ctx.between(2, i < 10 ? 18 : 7);
    const pts = Array.from({ length: ctx.int(4, 6) }, (_, k) => pol(x, y, r * ctx.between(0.6, 1.2), (k * TAU) / 5 + ctx.rand()));
    b.add(`<polygon points="${K.pts(pts)}" fill="${pal[i % 4]}"/>`, x - r * 1.2, y - r * 1.2, x + r * 1.2, y + r * 1.2);
  }
  b.flush();
  return 'terrazzo';
}

function agateSlice(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 5, [ctx.ink]);
  const n = K.noise2(ctx.seed);
  const cx = CX + ctx.between(-10, 10);
  const cy = CY + ctx.between(-10, 10);
  for (let k = 12; k >= 1; k--) {
    const pts = Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * TAU;
      return pol(cx, cy, k * 9 * (0.8 + 0.45 * n(Math.cos(a) * 1.4 + 3, Math.sin(a) * 1.4 + k * 0.05)), a);
    });
    blobPart(ctx, pts, k === 1 ? ctx.colors[1] : pal[k % 5]);
  }
  return 'agate slice';
}

function woodGrain(ctx) {
  const [bg, line] = hues(ctx, 2, [ctx.ink]);
  panel(ctx, bg);
  const knots = Array.from({ length: ctx.int(1, 3) }, () => [ctx.between(50, 190), ctx.between(90, 310), ctx.between(14, 28)]);
  for (let x0 = X0 - 20; x0 < X1 + 20; x0 += 9) {
    const pts = [];
    for (let y = Y0; y <= Y1; y += 6) {
      let dx = Math.sin(y * 0.02 + x0 * 0.03) * 4;
      for (const [kx, ky, kr] of knots) {
        const d = Math.hypot(x0 - kx, y - ky);
        if (d < kr * 4) dx += Math.sign(x0 - kx || 1) * kr * Math.max(0, 1 - d / (kr * 4)) * 1.4;
      }
      pts.push([x0 + dx, y]);
    }
    polyline(ctx, pts, line, 1.6);
  }
  knots.forEach(([kx, ky, kr]) => {
    ctx.ellipse(kx, ky, kr * 0.5, kr * 0.8, line);
    ring(ctx, kx, ky, kr * 0.9, line, 1.6);
  });
  return 'wood grain';
}

function pebbles(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(5), ctx.col(7)]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const placed = [];
  for (let t = 0; t < 400 && placed.length < 26; t++) {
    const x = ctx.between(36, 204);
    const y = ctx.between(70, 326);
    const rx = ctx.between(14, 34);
    const ry = rx * ctx.between(0.55, 0.85);
    if (placed.some(([px, py, prx]) => Math.hypot(px - x, py - y) < prx + rx * 0.9)) continue;
    placed.push([x, y, rx]);
    blobPart(ctx, wobble(ctx, x, y, rx, ry, 0.08, 8), pal[placed.length % 4]);
  }
  return 'pebbles';
}

function seaweedRibbons(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(2), ctx.col(5)]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(6, 9);
  for (let i = 0; i < n; i++) {
    const x0 = 24 + i * (192 / (n - 1));
    const amp = ctx.between(8, 20);
    const f = ctx.between(0.02, 0.04);
    const ph = ctx.between(0, TAU);
    const w = ctx.between(8, 16);
    const top = ctx.between(60, 160);
    const left = [];
    const right = [];
    for (let y = Y1; y >= top; y -= 8) {
      const t = (Y1 - y) / (Y1 - top);
      const x = x0 + Math.sin(y * f + ph) * amp * t;
      const hw = w * (1 - t * 0.8);
      left.push([x - hw, y]);
      right.unshift([x + hw, y]);
    }
    ctx.poly([...left, ...right], pal[i % 4], { inset: 1, still: true });
  }
  return 'seaweed ribbons';
}

function marbling(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const drops = Array.from({ length: ctx.int(2, 4) }, () => [ctx.between(50, 190), ctx.between(90, 300)]);
  const comb = ctx.between(0.03, 0.06);
  const pull = ctx.between(10, 24);
  drops.forEach(([dx, dy], d) => {
    for (let k = 9; k >= 1; k--) {
      const pts = Array.from({ length: 40 }, (_, i) => {
        const [x, y] = pol(dx, dy, k * 10, (i / 40) * TAU);
        return [x + Math.sin(y * comb) * pull, y];
      });
      K.polyline(ctx, [...pts, pts[0]], pal[(k + d) % 3], 4);
    }
  });
  return 'marbling';
}

function paperWaves(ctx) {
  const pal = hues(ctx, 6, []);
  panel(ctx, pal[0]);
  for (let i = 1; i < 6; i++) {
    const base = 70 + i * 52;
    const pts = [];
    const f = ctx.between(0.02, 0.05);
    const ph = ctx.between(0, TAU);
    for (let x = X0; x <= X1; x += 8) pts.push([x, base + Math.sin(x * f + ph) * ctx.between(10, 14)]);
    pts.push([X1, Y1], [X0, Y1]);
    ctx.raw(`<polygon points="${K.pts(pts.map(([x, y]) => [x + 3, y + 4]))}" fill="${ctx.ink}" opacity=".25"/><polygon points="${K.pts(pts)}" fill="${pal[i]}"/>`, CX, base + 60, [X0, base - 16, X1, Y1]);
  }
  return 'paper-cut waves';
}

function dreamConstellation(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(5), ctx.col(0)]);
  panel(ctx, bg);
  const ink = ctx.ink;
  const pal = hues(ctx, 3, [bg, ink]);
  const pts = Array.from({ length: ctx.int(6, 9) }, () => [ctx.between(30, 210), ctx.between(70, 330)]);
  polyline(ctx, pts, ink, 1.4);
  pts.forEach(([x, y], i) => {
    const t = i % 4;
    if (t === 0) ctx.circ(x, y, ctx.between(8, 16), pal[i % 3]);
    else if (t === 1) ctx.poly(starPoints(x, y, 12, 3, 4), ink, still);
    else if (t === 2) ctx.circ(x, y, 4, ink);
    else ctx.shape(`M${fmt(x - 14)} ${fmt(y)} A14 14 0 1 0 ${fmt(x + 14)} ${fmt(y)} A10 14 0 1 1 ${fmt(x - 14)} ${fmt(y)}Z`, pal[(i + 1) % 3], x, y, [x - 14, y - 14, x + 14, y + 14]);
  });
  const ex = ctx.between(60, 180);
  const ey = ctx.between(100, 300);
  ctx.ellipse(ex, ey, 22, 12, ctx.colors[1] === bg ? pal[2] : ctx.colors[1]);
  ctx.circ(ex, ey, 7, ink);
  blobPart(ctx, wobble(ctx, ctx.between(50, 190), ctx.between(90, 310), 18, 24, 0.4, 7), ink);
  return 'dream constellation';
}

function squircleGrid(ctx) {
  const bg = ground(ctx);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const s = 52;
  for (let j = 0; j < 6; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < 4; i++) {
      const x = 20 + i * s;
      const y = 50 + j * s;
      const rr = ctx.pick([6, 14, 26]);
      b.add(`<rect x="${fmt(x + 3)}" y="${fmt(y + 3)}" width="${s - 6}" height="${s - 6}" rx="${rr}" fill="${pal[(i + j + ctx.int(0, 1)) % 4]}"/>`, x, y, x + s, y + s);
    }
    b.flush();
  }
  return 'squircle grid';
}

function petalBurst(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.colors[1]]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(8, 14);
  const rings = ctx.int(2, 3);
  for (let r = 0; r < rings; r++) {
    const len = 90 - r * 26;
    for (let i = 0; i < n; i++) {
      const a = (i * TAU) / n + r * 0.3;
      const [x, y] = pol(CX, CY, len * 0.55, a);
      K.veil(ctx, Array.from({ length: 12 }, (_, k) => {
        const t = (k / 12) * TAU;
        const [ex, ey] = [Math.cos(t) * len * 0.5, Math.sin(t) * len * 0.16];
        return [x + ex * Math.cos(a) - ey * Math.sin(a), y + ex * Math.sin(a) + ey * Math.cos(a)];
      }), pal[(i + r) % 4], 0.8);
    }
  }
  ctx.circ(CX, CY, 12, pal[0]);
  return 'petal burst';
}

function venation(ctx) {
  const [bg, vein] = hues(ctx, 2, [ctx.ink]);
  panel(ctx, bg);
  const b = batcher(ctx, 24);
  const grow = (x, y, a, len, w) => {
    if (w < 0.6 || len < 4) return;
    const [x2, y2] = pol(x, y, len, a);
    b.add(`<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${vein}" stroke-width="${fmt(w)}" stroke-linecap="round"/>`, Math.min(x, x2), Math.min(y, y2), Math.max(x, x2), Math.max(y, y2));
    grow(x2, y2, a + ctx.between(-0.25, 0.25), len * 0.94, w * 0.93);
    if (ctx.rand() < 0.34) grow(x2, y2, a + ctx.pick([-1, 1]) * ctx.between(0.6, 1.1), len * 0.75, w * 0.62);
  };
  for (const dx of [-60, 0, 60]) grow(CX + dx, Y1, -Math.PI / 2 + dx * 0.004, 18, 7);
  b.flush();
  return 'venation';
}

function softCoral(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(5), ctx.col(2)]);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const n = ctx.int(3, 5);
  for (let c = 0; c < n; c++) {
    const col = pal[c % 3];
    const grow = (x, y, a, len, d) => {
      const mid = pol(x, y, len / 2, a + ctx.between(-0.4, 0.4));
      const [x2, y2] = pol(x, y, len, a);
      ctx.raw(`<path d="M${fmt(x)} ${fmt(y)} Q${fmt(mid[0])} ${fmt(mid[1])} ${fmt(x2)} ${fmt(y2)}" fill="none" stroke="${col}" stroke-width="${fmt(12 - d * 2.2)}" stroke-linecap="round"/>`, (x + x2) / 2, (y + y2) / 2, [Math.min(x, x2) - 10, Math.min(y, y2) - 10, Math.max(x, x2) + 10, Math.max(y, y2) + 10]);
      if (d < 3) for (const s of [-1, 1]) grow(x2, y2, a + s * ctx.between(0.3, 0.7), len * 0.75, d + 1);
    };
    grow(30 + c * (180 / Math.max(1, n - 1)), Y1, -Math.PI / 2 + ctx.between(-0.3, 0.3), ctx.between(50, 80), 0);
  }
  return 'soft coral';
}

function bubbleFoam(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(5), ctx.col(2)]);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const b = batcher(ctx, 6);
  for (let i = 0; i < 70; i++) {
    const x = ctx.between(X0, X1);
    const y = ctx.between(Y0, Y1);
    const r = ctx.between(4, i < 8 ? 40 : 18);
    const c = pal[i % 3];
    b.add(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${c}" fill-opacity=".18" stroke="${c}" stroke-width="1.8"/>` + dot(x - r * 0.4, y - r * 0.4, r * 0.15, c), x - r, y - r, x + r, y + r);
  }
  b.flush();
  return 'bubble foam';
}

function ripplePond(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(2), ctx.col(5)]);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const drops = Array.from({ length: ctx.int(3, 5) }, () => [ctx.between(30, 210), ctx.between(70, 330)]);
  drops.forEach(([x, y], d) => {
    const b = batcher(ctx, 99);
    for (let k = 1; k <= 7; k++) {
      const r = k * 13;
      b.add(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${r}" fill="none" stroke="${pal[d % 3]}" stroke-width="${fmt(3.2 - k * 0.35)}" opacity="${fmt(1 - k * 0.1)}"/>`, x - r, y - r, x + r, y + r);
    }
    b.flush();
    ctx.circ(x, y, 3, pal[d % 3]);
  });
  return 'rippling pond';
}

function gestureStrokes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = [ctx.ink, ...hues(ctx, 4, [bg, ctx.ink])];
  const n = ctx.int(8, 12);
  for (let i = 0; i < n; i++) {
    const [x, y] = [ctx.between(30, 210), ctx.between(70, 330)];
    const a = ctx.between(-1, 1) + (i % 2 ? Math.PI / 2 : 0);
    const len = ctx.between(60, 140);
    const w = ctx.between(10, 28);
    const [x2, y2] = pol(x, y, len, a);
    const mid = pol((x + x2) / 2, (y + y2) / 2, ctx.between(-20, 20), a + Math.PI / 2);
    ctx.raw(`<path d="M${fmt(x)} ${fmt(y)} Q${fmt(mid[0])} ${fmt(mid[1])} ${fmt(x2)} ${fmt(y2)}" fill="none" stroke="${pal[i % 5]}" stroke-width="${fmt(w)}" stroke-linecap="square" opacity=".92"/>`, (x + x2) / 2, (y + y2) / 2, [Math.min(x, x2) - w, Math.min(y, y2) - w, Math.max(x, x2) + w, Math.max(y, y2) + w]);
  }
  return 'gesture strokes';
}

function riverDelta(ctx) {
  const [bg, water] = hues(ctx, 2, [ctx.ink]);
  panel(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, water]);
  const b = batcher(ctx, 3);
  const flow = (x, y, w, d) => {
    let a = Math.PI / 2 + ctx.between(-0.3, 0.3);
    const pts = [[x, y]];
    const steps = ctx.int(6, 10);
    for (let s = 0; s < steps; s++) {
      a += ctx.between(-0.35, 0.35);
      x += Math.cos(a) * 10;
      y += Math.sin(a) * 10;
      pts.push([x, y]);
    }
    const bb = K.boundsOf(pts);
    b.add(`<path d="${K.pathOf(pts)}" fill="none" stroke="${d > 3 ? accent : water}" stroke-width="${fmt(w)}" stroke-linecap="round" stroke-linejoin="round"/>`, bb[0] - w, bb[1] - w, bb[2] + w, bb[3] + w);
    if (d < 5 && y < Y1) for (let k = 0; k < (d < 2 || ctx.rand() < 0.7 ? 2 : 1); k++) flow(x, y, w * 0.72, d + 1);
  };
  flow(CX + ctx.between(-30, 30), Y0, 14, 0);
  b.flush();
  return 'river delta';
}

function mossPatches(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.ink, ctx.col(4)]);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const patches = ctx.int(5, 8);
  for (let p = 0; p < patches; p++) {
    const [cx, cy, r] = [ctx.between(40, 200), ctx.between(80, 320), ctx.between(22, 46)];
    const b = batcher(ctx, 99);
    for (let i = 0; i < 40; i++) {
      const [x, y] = pol(cx, cy, Math.sqrt(ctx.rand()) * r, ctx.between(0, TAU));
      const rr = ctx.between(1.5, 5);
      b.add(dot(x, y, rr, pal[(p + (i % 3 === 0 ? 1 : 0)) % 3]), x - rr, y - rr, x + rr, y + rr);
    }
    b.flush();
  }
  return 'moss patches';
}

function liquidBands(ctx) {
  const pal = hues(ctx, 6, []);
  panel(ctx, pal[0]);
  const n = 6;
  const ph = ctx.between(0, TAU);
  const amp = ctx.between(30, 60);
  // Each band runs from its wave to the right edge, so the leftmost goes first and the rest lie over it.
  for (let i = 1; i < n; i++) {
    const pts = [];
    for (let y = Y0; y <= Y1; y += 8) pts.push([X0 + i * (212 / n) + Math.sin(y * 0.018 + ph + i * 0.35) * amp, y]);
    pts.push([X1 + 10, Y1], [X1 + 10, Y0]);
    ctx.poly(pts, pal[i % 6], { inset: 1, still: true });
  }
  return 'liquid bands';
}

module.exports = { soakStain, dripWeb, loopScribble, enso, inkBlot, biomorphCells, dividingCells, lavaLamp, terrazzo, agateSlice, woodGrain, pebbles, seaweedRibbons, marbling, paperWaves, dreamConstellation, squircleGrid, petalBurst, venation, softCoral, bubbleFoam, ripplePond, gestureStrokes, riverDelta, mossPatches, liquidBands };
