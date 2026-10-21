'use strict';

// Illusion and kinetic abstraction: a bulging checker, a café wall, implied shapes, a twisted-cord spiral, a
// scintillating grid, ambiguous cubes, a tunnel, drifting rings, bending lines, a line moiré, slanted parallels,
// circles in company, arrowed lines, a checker sphere, a wire torus, a zigzag ribbon, a twisted ribbon, a wire
// globe, depth squares, a wave tunnel, a roto-relief, a flicker chevron, a warped grid, shadow layers,
// vibrating squares and chromatic lines.

const { TAU, fmt, pol, rotRect } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, batcher, polyline, ring, X0, Y0, X1, Y1, CX, CY } = K;

const line = (x1, y1, x2, y2, c, w) => `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${c}" stroke-width="${fmt(w)}" stroke-linecap="round"/>`;
const dot = (x, y, r, c) => `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${c}"/>`;
const poly = (p, c) => `<polygon points="${K.pts(p)}" fill="${c}"/>`;

function bulgingChecker(ctx) {
  const [a, b] = hues(ctx, 2, []);
  panel(ctx, a);
  const bx = ctx.between(80, 160);
  const by = ctx.between(130, 260);
  const reach = ctx.between(80, 110);
  const P = (x, y) => {
    const d = Math.hypot(x - bx, y - by);
    if (d >= reach) return [x, y];
    const k = 1 + 0.5 * Math.cos((d / reach) * (Math.PI / 2)) ** 2;
    return [bx + (x - bx) * k, by + (y - by) * k];
  };
  const s = 17.7;
  for (let j = 0; j < 17; j++) {
    const bat = batcher(ctx, 999);
    for (let i = 0; i < 12; i++) {
      if ((i + j) % 2) continue;
      const [x, y] = [X0 + i * s, Y0 + j * s];
      const q = [P(x, y), P(x + s, y), P(x + s, y + s), P(x, y + s)];
      bat.add(poly(q, b), ...K.boundsOf(q));
    }
    bat.flush();
  }
  return 'bulging checker';
}

function cafeWall(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [tile] = hues(ctx, 1, [bg]);
  const s = 26.5;
  const h = 24;
  for (let j = 0; j < 12; j++) {
    const off = [0, 7, 14, 7][j % 4];
    const bat = batcher(ctx, 999);
    for (let i = -1; i < 9; i += 2) bat.add(`<rect x="${fmt(X0 + i * s + off)}" y="${fmt(Y0 + j * (h + 1.5))}" width="${fmt(s)}" height="${h}" fill="${tile}"/>`, X0, Y0 + j * (h + 1.5), X1, Y0 + j * (h + 1.5) + h);
    bat.add(`<rect x="${X0}" y="${fmt(Y0 + j * (h + 1.5) + h)}" width="212" height="1.5" fill="#8A8A8A"/>`, X0, Y0 + j * (h + 1.5) + h, X1, Y0 + j * (h + 1.5) + h + 2);
    bat.flush();
  }
  return 'café wall';
}

function impliedShapes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [disc] = hues(ctx, 1, [bg]);
  const sides = ctx.pick([3, 4]);
  const r = ctx.between(70, 86);
  const rot = sides === 3 ? -Math.PI / 2 : Math.PI / 4;
  const corners = Array.from({ length: sides }, (_, i) => pol(CX, CY, r, rot + (i * TAU) / sides));
  corners.forEach(([x, y]) => {
    const toward = Math.atan2(CY - y, CX - x);
    const open = Math.PI - TAU / sides;
    const [p, q] = [pol(x, y, 26, toward - open / 2), pol(x, y, 26, toward + open / 2)];
    ctx.shape(`M${fmt(x)} ${fmt(y)} L${fmt(q[0])} ${fmt(q[1])} A26 26 0 1 1 ${fmt(p[0])} ${fmt(p[1])}Z`, disc, x, y, [x - 26, y - 26, x + 26, y + 26]);
  });
  if (sides === 3) {
    const inv = Array.from({ length: 3 }, (_, i) => pol(CX, CY, r * 0.9, Math.PI / 2 + (i * TAU) / 3));
    polyline(ctx, [...inv, inv[0]], ctx.ink, 2.2);
  }
  return 'implied shapes';
}

function cordSpiral(ctx) {
  // The cord is ink and cream, so the ground must be clearly neither.
  const [bg] = hues(ctx, 1, [ctx.ink, ctx.colors[1]]);
  panel(ctx, bg);
  const [a, b] = [ctx.ink, ctx.colors[1]];
  for (let k = 1; k <= 7; k++) {
    const r = k * 14;
    const n = 10 + k * 5;
    const bat = batcher(ctx, 999);
    for (let i = 0; i < n; i++) {
      const ang = (i * TAU) / n;
      const [x, y] = pol(CX, CY, r, ang);
      const tilt = ang + Math.PI / 2 + 0.45;
      bat.add(`<rect x="${fmt(x - 5)}" y="${fmt(y - 2)}" width="10" height="4" fill="${i % 2 ? a : b}" transform="rotate(${fmt((tilt * 180) / Math.PI)} ${fmt(x)} ${fmt(y)})"/>`, x - 6, y - 6, x + 6, y + 6);
    }
    bat.flush();
  }
  return 'twisted-cord spiral';
}

function scintillatingGrid(ctx) {
  const [bg, lane] = hues(ctx, 2, []);
  panel(ctx, bg);
  const s = 26.5;
  const w = 5;
  const b = batcher(ctx, 3);
  for (let i = 1; i < 8; i++) b.add(`<rect x="${fmt(X0 + i * s - w / 2)}" y="${Y0}" width="${w}" height="298" fill="${lane}"/>`, X0 + i * s - 3, Y0, X0 + i * s + 3, Y1);
  for (let j = 1; j < 12; j++) b.add(`<rect x="${X0}" y="${fmt(Y0 + j * s - w / 2)}" width="212" height="${w}" fill="${lane}"/>`, X0, Y0 + j * s - 3, X1, Y0 + j * s + 3);
  b.flush();
  const d = batcher(ctx, 999);
  for (let i = 1; i < 8; i++) for (let j = 1; j < 12; j++) d.add(dot(X0 + i * s, Y0 + j * s, 4.2, ctx.colors[1] === bg ? ctx.ink : ctx.colors[1]), X0 + i * s - 5, Y0 + j * s - 5, X0 + i * s + 5, Y0 + j * s + 5);
  d.flush();
  return 'scintillating grid';
}

function ambiguousCubes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [face] = hues(ctx, 1, [bg, ctx.ink]);
  const s = 34;
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 3; i++) {
      const [x, y] = [30 + i * 64, 70 + j * 56];
      const o = 14;
      const front = [[x, y + o], [x + s, y + o], [x + s, y + o + s], [x, y + o + s]];
      const back = front.map(([px, py]) => [px + o, py - o]);
      const bat = batcher(ctx, 999);
      const fill = (i + j) % 2 ? front : back;
      bat.add(poly(fill, face), x, y - 2, x + s + o, y + s + o);
      for (let k = 0; k < 4; k++) {
        bat.add(line(...front[k], ...front[(k + 1) % 4], ctx.ink, 1.8) + line(...back[k], ...back[(k + 1) % 4], ctx.ink, 1.8) + line(...front[k], ...back[k], ctx.ink, 1.8), x, y - 2, x + s + o, y + s + o);
      }
      bat.flush();
    }
  }
  return 'ambiguous cubes';
}

function tunnel(ctx) {
  const pal = hues(ctx, 3, []);
  panel(ctx, pal[0]);
  const vx = ctx.between(80, 160);
  const vy = ctx.between(130, 260);
  const n = 12;
  for (let k = 0; k < n; k++) {
    const t = 1 - k / n;
    const x0 = vx + (X0 - vx) * t;
    const y0 = vy + (Y0 - vy) * t;
    const x1 = vx + (X1 - vx) * t;
    const y1 = vy + (Y1 - vy) * t;
    ctx.poly(R(x0, y0, x1 - x0, y1 - y0), pal[k % 2 ? 1 : 2], still);
  }
  return 'tunnel';
}

function driftRings(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [a, b] = hues(ctx, 2, [bg, ctx.ink]);
  const seq = [ctx.ink, a, bg, b];
  const centres = [[70, 120], [170, 120], [70, 270], [170, 270], [CX, 195]];
  centres.forEach(([x, y], c) => {
    for (let k = 3; k >= 1; k--) {
      const segs = 8 + k * 4;
      const bat = batcher(ctx, 999);
      for (let i = 0; i < segs; i++) {
        const a0 = (i * TAU) / segs + (c % 2 ? 0.1 : -0.1);
        const band = K.pts([...Array.from({ length: 4 }, (_, q) => pol(x, y, k * 16, a0 + (q / 3) * (TAU / segs))), ...Array.from({ length: 4 }, (_, q) => pol(x, y, k * 16 - 14, a0 + ((3 - q) / 3) * (TAU / segs)))]);
        bat.add(`<polygon points="${band}" fill="${seq[i % 4]}"/>`, x - 50, y - 50, x + 50, y + 50);
      }
      bat.flush();
    }
  });
  return 'drifting rings';
}

function bendingLines(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, ctx.ink]);
  const bx = ctx.between(80, 160);
  const by = ctx.between(130, 260);
  const r = ctx.between(60, 90);
  for (let j = 0; j < 40; j++) {
    const y0 = Y0 + 4 + j * 7.4;
    const pts = [];
    for (let x = X0; x <= X1; x += 4) {
      const dx = (x - bx) / r;
      const bump = Math.abs(dx) < 1 ? Math.sqrt(1 - dx * dx) : 0;
      const side = y0 < by ? -1 : 1;
      pts.push([x, y0 + side * bump * Math.max(0, r - Math.abs(y0 - by)) * 0.6]);
    }
    polyline(ctx, pts, j % 9 === 4 ? accent : ctx.ink, 2.4);
  }
  return 'bending lines';
}

function lineMoire(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [c2] = hues(ctx, 1, [bg, ctx.ink]);
  [[0, ctx.ink], [ctx.between(0.04, 0.12), c2]].forEach(([rot, c]) => {
    const bat = batcher(ctx, 20);
    for (let k = -40; k <= 40; k++) {
      const off = k * 5;
      const [p, q] = [[-250, off], [250, off]].map(([x, y]) => [CX + x * Math.cos(rot) - y * Math.sin(rot), CY + x * Math.sin(rot) + y * Math.cos(rot)]);
      bat.add(line(p[0], p[1], q[0], q[1], c, 1.8), X0, Y0, X1, Y1);
    }
    bat.flush();
  });
  return 'line moiré';
}

function slantedParallels(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, ctx.ink]);
  for (let i = 0; i < 7; i++) {
    const x = X0 + 18 + i * 30;
    const bat = batcher(ctx, 999);
    bat.add(line(x, Y0 + 8, x, Y1 - 8, ctx.ink, 3), x - 2, Y0, x + 2, Y1);
    const dir = i % 2 ? 1 : -1;
    for (let y = Y0 + 16; y < Y1 - 10; y += 14) bat.add(line(x - 8, y - dir * 6, x + 8, y + dir * 6, i === 3 ? accent : ctx.ink, 1.8), x - 9, y - 7, x + 9, y + 7);
    bat.flush();
  }
  return 'slanted parallels';
}

function circlesInCompany(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [mid, ring1, ring2] = hues(ctx, 3, [bg]);
  const groups = [[CX, 120, 28, 6, ring1], [CX, 280, 8, 10, ring2]];
  groups.forEach(([x, y, r, n, c]) => {
    const d = r < 15 ? 30 : 58;
    for (let i = 0; i < n; i++) {
      const [px, py] = pol(x, y, d, (i * TAU) / n);
      ctx.circ(px, py, r, c);
    }
    ctx.circ(x, y, 17, mid);
  });
  return 'circles in company';
}

function arrowedLines(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  for (let j = 0; j < 7; j++) {
    const y = Y0 + 24 + j * 41;
    const out = j % 2 === 0;
    const [x0, x1] = [70, 170];
    const bat = batcher(ctx, 999);
    const c = pal[j % 3];
    bat.add(line(x0, y, x1, y, c, 4), x0 - 20, y - 20, x1 + 20, y + 20);
    for (const [x, s] of [[x0, 1], [x1, -1]]) {
      const dx = out ? -s * 18 : s * 18;
      bat.add(line(x, y, x + dx, y - 16, c, 4) + line(x, y, x + dx, y + 16, c, 4), x - 20, y - 20, x + 20, y + 20);
    }
    bat.flush();
  }
  return 'arrowed lines';
}

function checkerSphere(ctx) {
  panel(ctx, ctx.ink);
  const [a, b] = hues(ctx, 2, [ctx.ink]);
  const r = ctx.between(86, 98);
  const spin = ctx.between(0, Math.PI / 6);
  const lat = 8;
  const lon = 12;
  for (let j = 0; j < lat; j++) {
    const bat = batcher(ctx, 999);
    const t0 = -Math.PI / 2 + (j * Math.PI) / lat;
    const t1 = t0 + Math.PI / lat;
    for (let i = 0; i < lon; i++) {
      const p0 = -Math.PI / 2 + (i * Math.PI) / lon + spin;
      const p1 = p0 + Math.PI / lon;
      if (p0 > Math.PI / 2) continue;
      const P = (t, p) => [CX + r * Math.cos(t) * Math.sin(Math.min(Math.PI / 2, p)), CY + r * Math.sin(t)];
      const q = [P(t0, p0), P(t0, p1), P(t1, p1), P(t1, p0)];
      bat.add(poly(q, (i + j) % 2 ? a : b), ...K.boundsOf(q));
    }
    bat.flush();
  }
  return 'checker sphere';
}

function wireTorus(ctx) {
  panel(ctx, ctx.ink);
  const [a, b] = hues(ctx, 2, [ctx.ink]);
  const [Rr, r] = [62, 30];
  const tilt = ctx.between(0.45, 0.7);
  const b1 = batcher(ctx, 4);
  for (let i = 0; i < 18; i++) {
    const u = (i * TAU) / 18;
    const pts = Array.from({ length: 25 }, (_, k) => {
      const v = (k / 24) * TAU;
      const x = (Rr + r * Math.cos(v)) * Math.cos(u);
      const y = (Rr + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);
      return [CX + x, CY + y * Math.cos(tilt) - z * Math.sin(tilt) * 1.6];
    });
    b1.add(`<path d="${K.pathOf(pts)}" fill="none" stroke="${a}" stroke-width="1.4"/>`, ...K.boundsOf(pts));
  }
  b1.flush();
  const b2 = batcher(ctx, 3);
  for (let k = 0; k < 9; k++) {
    const v = (k * TAU) / 9;
    const pts = Array.from({ length: 41 }, (_, i) => {
      const u = (i / 40) * TAU;
      const x = (Rr + r * Math.cos(v)) * Math.cos(u);
      const y = (Rr + r * Math.cos(v)) * Math.sin(u);
      return [CX + x, CY + y * Math.cos(tilt) - r * Math.sin(v) * Math.sin(tilt) * 1.6];
    });
    b2.add(`<path d="${K.pathOf(pts)}" fill="none" stroke="${b}" stroke-width="1.4"/>`, ...K.boundsOf(pts));
  }
  b2.flush();
  return 'wire torus';
}

function zigzagRibbon(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [top, left, right] = hues(ctx, 3, [bg]);
  const u = 24;
  const P = (i, j, k) => [CX - 10 + (i - j) * u * 0.87, 96 + (i + j) * u * 0.5 - k * u];
  let [i, j, k] = [0, 0, 0];
  for (let s = 0; s < 14; s++) {
    const q = [P(i, j, k + 1), P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)];
    const l = [P(i, j + 1, k + 1), P(i + 1, j + 1, k + 1), P(i + 1, j + 1, k), P(i, j + 1, k)];
    const rr = [P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i + 1, j + 1, k), P(i + 1, j, k)];
    ctx.raw(poly(l, left) + poly(rr, right) + poly(q, top), (q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2, K.boundsOf([...q, ...l, ...rr]));
    if (s % 3 === 2) k -= 1;
    else if (s % 2) j += 1;
    else i += 1;
  }
  return 'zigzag ribbon';
}

function twistedRibbon(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const [a, b] = hues(ctx, 2, [bg]);
  const n = 40;
  const amp = ctx.between(50, 80);
  const turns = ctx.between(1.5, 3);
  for (let s = 0; s < n; s++) {
    const t0 = s / n;
    const t1 = (s + 1) / n;
    const y0 = Y0 + 10 + t0 * 278;
    const y1 = Y0 + 10 + t1 * 278;
    const w0 = Math.cos(t0 * TAU * turns) * 34;
    const w1 = Math.cos(t1 * TAU * turns) * 34;
    const c0 = CX + Math.sin(t0 * TAU) * amp * 0.5;
    const c1 = CX + Math.sin(t1 * TAU) * amp * 0.5;
    const q = [[c0 - w0, y0], [c0 + w0, y0], [c1 + w1, y1 + 0.5], [c1 - w1, y1 + 0.5]];
    ctx.poly(q, w0 > 0 ? a : b, still);
  }
  return 'twisted ribbon';
}

function wireGlobe(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.colors[1]]);
  panel(ctx, bg);
  const [a, b] = hues(ctx, 2, [bg]);
  const r = ctx.between(84, 98);
  const tilt = ctx.between(-0.3, 0.3);
  const b1 = batcher(ctx, 3);
  for (let k = 1; k < 8; k++) {
    const y = CY - r + (k * 2 * r) / 8;
    const w = Math.sqrt(r * r - (y - CY) ** 2);
    b1.add(`<ellipse cx="${CX}" cy="${fmt(y)}" rx="${fmt(w)}" ry="${fmt(w * 0.18)}" fill="none" stroke="${a}" stroke-width="1.6" transform="rotate(${fmt(tilt * 30)} ${CX} ${CY})"/>`, CX - w, y - 10, CX + w, y + 10);
  }
  b1.flush();
  const b2 = batcher(ctx, 3);
  for (let k = 0; k < 9; k++) {
    const w = r * Math.abs(Math.cos((k * Math.PI) / 9));
    b2.add(`<ellipse cx="${CX}" cy="${CY}" rx="${fmt(w)}" ry="${fmt(r)}" fill="none" stroke="${b}" stroke-width="1.6" transform="rotate(${fmt(tilt * 30)} ${CX} ${CY})"/>`, CX - r, CY - r, CX + r, CY + r);
  }
  b2.flush();
  ring(ctx, CX, CY, r, a, 3);
  return 'wire globe';
}

function depthSquares(ctx) {
  const pal = hues(ctx, 5, []);
  panel(ctx, pal[0]);
  const dx = ctx.between(-5, 5);
  const dy = ctx.between(-7, 7);
  let s = 100;
  let [x, y] = [CX, CY];
  for (let k = 0; k < 11; k++) {
    ctx.poly(R(x - s, y - s * 1.35, 2 * s, 2 * s * 1.35), pal[1 + (k % 4)], still);
    x += dx;
    y += dy;
    s *= 0.82;
  }
  return 'depth squares';
}

function waveTunnel(ctx) {
  const bg = ctx.ink;
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const lobes = ctx.int(3, 7);
  for (let k = 14; k >= 1; k--) {
    const pts = Array.from({ length: 60 }, (_, i) => {
      const a = (i / 60) * TAU;
      return pol(CX, CY, k * 8 * (1 + 0.12 * Math.sin(a * lobes + k * 0.5)), a);
    });
    ctx.poly(pts, k % 2 ? pal[k % 3] : bg, { inset: 1, still: true });
  }
  return 'wave tunnel';
}

function rotoRelief(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const n = 9;
  const off = ctx.between(3, 6);
  const a = ctx.between(0, TAU);
  ctx.circ(CX, CY, 104, pal[0]);
  for (let k = n; k >= 1; k--) {
    const [x, y] = pol(CX, CY, (n - k) * off, a);
    ctx.circ(x, y, k * 11, k % 2 ? bg : pal[(k >> 1) % 3]);
  }
  return 'roto-relief';
}

function flickerChevron(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [c] = hues(ctx, 1, [bg]);
  for (let j = 0; j < 36; j++) {
    const y = Y0 + 4 + j * 8.2;
    const amp = 3 + 9 * Math.abs(Math.sin(j * 0.25));
    const pts = [];
    for (let x = X0, k = 0; x <= X1 + 1; x += 12, k++) pts.push([x, y + (k % 2 ? amp : -amp)]);
    polyline(ctx, pts, j % 2 ? ctx.ink : c, 2.6);
  }
  return 'flicker chevron';
}

function warpedGrid(ctx) {
  const [bg, ln] = hues(ctx, 2, []);
  panel(ctx, bg);
  const [px, py] = [ctx.between(70, 170), ctx.between(120, 280)];
  const k = ctx.between(0.5, 0.8) * ctx.pick([-1, 1]);
  const W = (x, y) => {
    const d = Math.hypot(x - px, y - py) / 140;
    const f = 1 + k * Math.exp(-d * d * 2);
    return [px + (x - px) * f, py + (y - py) * f];
  };
  const b = batcher(ctx, 4);
  for (let i = 0; i <= 12; i++) {
    const x = X0 + (i * 212) / 12;
    const pts = Array.from({ length: 31 }, (_, s) => W(x, Y0 + (s * 298) / 30));
    b.add(`<path d="${K.pathOf(pts)}" fill="none" stroke="${ln}" stroke-width="1.8"/>`, X0, Y0, X1, Y1);
  }
  for (let j = 0; j <= 16; j++) {
    const y = Y0 + (j * 298) / 16;
    const pts = Array.from({ length: 31 }, (_, s) => W(X0 + (s * 212) / 30, y));
    b.add(`<path d="${K.pathOf(pts)}" fill="none" stroke="${ln}" stroke-width="1.8"/>`, X0, Y0, X1, Y1);
  }
  b.flush();
  return 'warped grid';
}

function shadowLayers(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(5, 7);
  for (let i = 0; i < n; i++) {
    const [w, h] = [ctx.between(60, 140), ctx.between(50, 120)];
    const [x, y] = [ctx.between(X0, X1 - w), ctx.between(Y0, Y1 - h)];
    const round = ctx.rand() < 0.4;
    const shape = round ? `<ellipse cx="${fmt(x + w / 2)}" cy="${fmt(y + h / 2)}" rx="${fmt(w / 2)}" ry="${fmt(h / 2)}"` : `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}"`;
    ctx.raw(`${shape} fill="${ctx.ink}" opacity=".25" transform="translate(6 8)"/>${shape} fill="${pal[i % 4]}"/>`, x + w / 2, y + h / 2, [x, y, x + w + 6, y + h + 8]);
  }
  return 'shadow layers';
}

function vibratingSquares(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg, ctx.ink]);
  const b = batcher(ctx, 40);
  for (let x = X0 + 2; x < X1; x += 4) b.add(`<rect x="${fmt(x)}" y="${Y0}" width="1.6" height="298" fill="${ctx.ink}"/>`, x, Y0, x + 2, Y1);
  b.flush();
  for (let i = 0; i < 9; i++) {
    const s = ctx.between(16, 40);
    ctx.poly(rotRect(ctx.between(40, 200), ctx.between(80, 320), s, s, ctx.between(-0.2, 0.2)), pal[i % 3], still);
  }
  return 'vibrating squares';
}

function chromaticLines(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 6, []);
  const sections = ctx.int(3, 5);
  const w = 212 / sections;
  for (let s = 0; s < sections; s++) {
    const [a, b] = [pal[s % 6], pal[(s + 3) % 6]];
    const bat = batcher(ctx, 999);
    for (let x = X0 + s * w; x < X0 + (s + 1) * w - 0.1; x += 6) bat.add(`<rect x="${fmt(x)}" y="${Y0}" width="3" height="298" fill="${a}"/><rect x="${fmt(x + 3)}" y="${Y0}" width="3" height="298" fill="${b}"/>`, x, Y0, x + 6, Y1);
    bat.flush();
  }
  ctx.poly(R(X0, ctx.between(150, 240), 212, ctx.between(20, 40)), pal[ctx.int(0, 5)], still);
  return 'chromatic lines';
}

module.exports = { bulgingChecker, cafeWall, impliedShapes, cordSpiral, scintillatingGrid, ambiguousCubes, tunnel, driftRings, bendingLines, lineMoire, slantedParallels, circlesInCompany, arrowedLines, checkerSphere, wireTorus, zigzagRibbon, twistedRibbon, wireGlobe, depthSquares, waveTunnel, rotoRelief, flickerChevron, warpedGrid, shadowLayers, vibratingSquares, chromaticLines };
