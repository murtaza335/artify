'use strict';

// Simulation and growth, re-imagined: Turing-style spots and labyrinths, differential growth, L-system bushes,
// space-colonisation veins, relaxed cells, low-poly meshes, metaballs, tile constraints, flocking and slime trails, a
// hexagonal snowflake automaton, lichen growth, stipples, hatch shading, island maps, mud cracks, geodesic spheres,
// swept ribbons, nail-and-thread, broken shards, soft unions, orbits, domain warping, a noise spiral and dithering.
// Every simulation is small and runs a fixed number of steps from the seed.

const K = require('./pattern-kit');

const { layer, TAU, fmt, pol, X0, Y0, X1, Y1, CX, CY, W, H, setup, poly, circ, ring, line, path, stroked, flush, chunk, scalePts, centroid, ngon, rotPts, bbox, ell, splitPoly, runs, contour, gridOf, lsystem, turtle, fit, noise2, smoothPath } = K;

const mod = (a, n) => ((a % n) + n) % n;
const rp = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const FRAME = [X0, Y0, X1, Y1];

// A Turing-like field: a few plane waves of one wavelength, summed.
function waveField(ctx, w, h, waves, wavelength) {
  const ws = Array.from({ length: waves }, (_, i) => ({ a: ctx.between(0, Math.PI) + (waves === 3 ? (i * Math.PI) / 3 : 0), p: ctx.between(0, TAU) }));
  const k = TAU / wavelength;
  const f = gridOf(w, h, (i, j) => ws.reduce((s, q) => s + Math.cos(k * (Math.cos(q.a) * i + Math.sin(q.a) * j) + q.p), 0) / waves);
  return f;
}

function reactionDiffusion(ctx) {
  const { pal } = setup(ctx, 4);
  const w = 50;
  const h = 72;
  const f = waveField(ctx, w, h, ctx.pick([3, 3, 4]), ctx.between(8, 12));
  const cw = W / w;
  const ch = H / h;
  const items = [path(runs(f, w, h, (v) => v > 0.35, X0, Y0, cw, ch), pal[0], FRAME), layer(K.stroked(contour(f, w, h, 0.35, X0, Y0, cw, ch), pal[1], 1.6, FRAME), 1), layer(K.stroked(contour(f, w, h, -0.1, X0, Y0, cw, ch), pal[2], 1, FRAME), 1)];
  chunk(ctx, items, 3);
  return 'turing spots';
}

function turingStripes(ctx) {
  const { pal } = setup(ctx, 4);
  const w = 50;
  const h = 72;
  const f = waveField(ctx, w, h, ctx.pick([1, 2, 5, 6]), ctx.between(8, 14));
  const cw = W / w;
  const ch = H / h;
  const items = [path(runs(f, w, h, (v) => v > 0.1, X0, Y0, cw, ch), pal[0], FRAME), layer(path(runs(f, w, h, (v) => v > 0.55, X0, Y0, cw, ch), pal[1], FRAME), 1), layer(K.stroked(contour(f, w, h, 0.1, X0, Y0, cw, ch), pal[2], 1.2, FRAME), 2)];
  chunk(ctx, items, 3);
  return 'labyrinth stripes';
}

function differentialGrowth(ctx) {
  const { pal } = setup(ctx, 4);
  let pts = Array.from({ length: 18 }, (_, i) => pol(CX, CY, 16, (i / 18) * TAU));
  const L = ctx.between(4.2, 5.2);
  const steps = ctx.int(70, 95);
  for (let s = 0; s < steps && pts.length < 260; s++) {
    const n = pts.length;
    const f = pts.map(() => [0, 0]);
    for (let i = 0; i < n; i++) {
      const a = pts[(i + n - 1) % n];
      const b = pts[(i + 1) % n];
      for (const o of [a, b]) {
        const dx = o[0] - pts[i][0];
        const dy = o[1] - pts[i][1];
        const d = Math.hypot(dx, dy) || 1;
        f[i][0] += (dx / d) * (d - L) * 0.3;
        f[i][1] += (dy / d) * (d - L) * 0.3;
      }
      const rx = pts[i][0] - CX;
      const ry = pts[i][1] - CY;
      const rl = Math.hypot(rx, ry) || 1;
      f[i][0] += (rx / rl) * 0.45;
      f[i][1] += (ry / rl) * 0.45;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const dx = pts[i][0] - pts[j][0];
        const dy = pts[i][1] - pts[j][1];
        const d2 = dx * dx + dy * dy;
        if (j !== (i + 1) % n && j !== (i + n - 1) % n && d2 < L * L * 4 && d2 > 1e-6) {
          const d = Math.sqrt(d2);
          f[i][0] += (dx / d) * (L * 2 - d) * 0.06;
          f[i][1] += (dy / d) * (L * 2 - d) * 0.06;
        }
      }
      f[i][0] += (ctx.rand() - 0.5) * 0.5 + (pts[i][0] - CX) * 0.002;
      f[i][1] += (ctx.rand() - 0.5) * 0.5 + (pts[i][1] - CY) * 0.002;
    }
    pts = pts.map((p, i) => [Math.max(X0 + 4, Math.min(X1 - 4, p[0] + f[i][0])), Math.max(Y0 + 4, Math.min(Y1 - 4, p[1] + f[i][1]))]);
    const next = [];
    for (let i = 0; i < pts.length; i++) {
      next.push(pts[i]);
      const b = pts[(i + 1) % pts.length];
      if (Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]) > L * 1.15) next.push([(pts[i][0] + b[0]) / 2, (pts[i][1] + b[1]) / 2]);
    }
    pts = next;
  }
  const items = [poly(pts, pal[0]), layer(line(pts, pal[1], 3, true), 1)];
  [0.78, 0.56, 0.34].forEach((k, z) => items.push(layer(line(scalePts(pts, CX, CY, k), pal[2 + (z % 2)], 1.6, true), 2 + z)));
  chunk(ctx, items, 5);
  return 'differential growth';
}

function lSystemPlant(ctx) {
  const { pal } = setup(ctx, 4);
  const rules = ctx.pick([
    { F: 'FF-[-F+F+F]+[+F-F-F]' },
    { F: 'F[+F]F[-F]F' },
    { F: 'FF+[+F-F-F]-[-F+F+F]' }
  ]);
  const angle = ctx.between(18, 28);
  const lines = turtle(lsystem('F', rules, ctx.int(3, 4)), angle, 1, -90);
  const fitted = fit(lines, [X0 + 10, Y0 + 10, W - 20, H - 20]);
  const items = fitted.map((l, i) => line(l, pal[mod(Math.floor(l[0][1] / 40), 3)], 1.5));
  flush(ctx, items, 1);
  return 'l-system bush';
}

function spaceColonization(ctx) {
  const { pal } = setup(ctx, 4);
  const att = Array.from({ length: ctx.int(70, 100) }, () => {
    const a = ctx.between(0, TAU);
    const r = Math.sqrt(ctx.rand());
    return [CX + Math.cos(a) * r * 92, Y0 + 130 + Math.sin(a) * r * 110];
  });
  let alive = att.slice();
  const nodes = [{ p: [CX, Y1 - 6], parent: -1, depth: 0 }];
  const D = 8;
  for (let it = 0; it < 48 && alive.length; it++) {
    const pull = new Map();
    alive.forEach((a) => {
      let best = -1;
      let bd = 1e9;
      nodes.forEach((n, i) => {
        const d = Math.hypot(a[0] - n.p[0], a[1] - n.p[1]);
        if (d < bd) { bd = d; best = i; }
      });
      if (bd < 400) {
        const n = nodes[best].p;
        const v = pull.get(best) || [0, 0];
        pull.set(best, [v[0] + (a[0] - n[0]) / bd, v[1] + (a[1] - n[1]) / bd]);
      }
    });
    if (!pull.size) break;
    pull.forEach((v, i) => {
      const l = Math.hypot(v[0], v[1]) || 1;
      if (nodes.length < 260) nodes.push({ p: [nodes[i].p[0] + (v[0] / l) * D, nodes[i].p[1] + (v[1] / l) * D], parent: i, depth: nodes[i].depth + 1 });
    });
    alive = alive.filter((a) => !nodes.some((n) => Math.hypot(a[0] - n.p[0], a[1] - n.p[1]) < D));
  }
  const items = [];
  const count = new Array(nodes.length).fill(1);
  for (let i = nodes.length - 1; i > 0; i--) count[nodes[i].parent] += count[i];
  nodes.forEach((n, i) => {
    if (n.parent >= 0) items.push(line([nodes[n.parent].p, n.p], pal[mod(Math.floor(n.depth / 8), 3)], [1, 1.8, 2.8, 4][Math.min(3, Math.floor(Math.sqrt(count[i]) / 2))]));
  });
  flush(ctx, items, 1);
  return 'branching veins';
}

// Voronoi cells of points clipped to the frame, by half-plane cuts.
function voronoi(points) {
  return points.map((p, i) => {
    let cell = rp(X0, Y0, W, H);
    points.forEach((q, j) => {
      if (i === j || cell.length < 3) return;
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      const a = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2;
      cell = K.clipHalfPlane(cell, m, a, true);
      if (cell.length >= 3) {
        const c = centroid(cell);
        if ((c[0] - p[0]) * (q[0] - p[0]) + (c[1] - p[1]) * (q[1] - p[1]) > ((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2) / 2) cell = K.clipHalfPlane(cell, m, a, false);
      }
    });
    return cell;
  });
}

function lloydCells(ctx) {
  const { pal, ink } = setup(ctx, 5);
  let pts = Array.from({ length: ctx.int(22, 30) }, () => [ctx.between(X0 + 4, X1 - 4), ctx.between(Y0 + 4, Y1 - 4)]);
  const rounds = ctx.int(0, 3);
  let cells = voronoi(pts);
  for (let r = 0; r < rounds; r++) {
    pts = cells.map((c, i) => (c.length >= 3 ? centroid(c) : pts[i]));
    cells = voronoi(pts);
  }
  const items = cells.map((c, i) => (c.length >= 3 ? poly(scalePts(c, ...centroid(c), 0.95), pal[i % 5]) : null)).filter(Boolean);
  pts.forEach((p) => items.push(layer(circ(p[0], p[1], 2, ink), 1)));
  flush(ctx, items, 3);
  return 'relaxed cells';
}

function delaunayMesh(ctx) {
  const { pal } = setup(ctx, 5);
  const cols = ctx.int(5, 7);
  const rows = ctx.int(7, 10);
  const jit = 0.32;
  const P = [];
  for (let j = 0; j <= rows; j++) {
    P.push([]);
    for (let i = 0; i <= cols; i++) P[j].push([X0 + (W * i) / cols + (i > 0 && i < cols ? ctx.between(-jit, jit) * (W / cols) : 0), Y0 + (H * j) / rows + (j > 0 && j < rows ? ctx.between(-jit, jit) * (H / rows) : 0)]);
  }
  const items = [];
  const g = ctx.between(0, TAU);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const [a, b, c, d] = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]];
    const tris = ctx.rand() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    tris.forEach((t) => {
      const m = centroid(t);
      const v = 0.5 + 0.5 * Math.sin(((m[0] - X0) * Math.cos(g) + (m[1] - Y0) * Math.sin(g)) * 0.015) + (ctx.rand() - 0.5) * 0.35;
      items.push(poly(t, pal[Math.max(0, Math.min(4, Math.floor(v * 5)))], 0, 0.5));
    });
  }
  flush(ctx, items, 3);
  return 'low-poly mesh';
}

function metaballs(ctx) {
  const { pal } = setup(ctx, 5);
  const w = 44;
  const h = 62;
  const balls = Array.from({ length: ctx.int(5, 9) }, () => ({ x: ctx.between(0.15, 0.85) * w, y: ctx.between(0.12, 0.88) * h, r: ctx.between(5, 11) }));
  const f = gridOf(w, h, (i, j) => balls.reduce((s, b) => s + (b.r * b.r) / ((i - b.x) ** 2 + (j - b.y) ** 2 + 1), 0));
  const cw = W / w;
  const ch = H / h;
  const items = [];
  [0.7, 1.1, 1.8, 3].forEach((t, k) => items.push(layer(path(runs(f, w, h, (v) => v > t, X0, Y0, cw, ch), pal[k], FRAME), k)));
  chunk(ctx, items, 4);
  return 'metaballs';
}

function waveCollapse(ctx) {
  const { pal, ink } = setup(ctx, 4);
  const cols = ctx.int(6, 8);
  const rows = Math.floor((cols * H) / W);
  const s = Math.min(W / cols, H / rows);
  const mask = [];
  const items = [];
  const bias = ctx.between(0.35, 0.6);
  for (let j = 0; j < rows; j++) {
    mask.push([]);
    for (let i = 0; i < cols; i++) {
      const W_ = i > 0 ? (mask[j][i - 1] >> 1) & 1 : 0;
      const N = j > 0 ? (mask[j - 1][i] >> 2) & 1 : 0;
      const E = i < cols - 1 && ctx.rand() < bias ? 1 : 0;
      const S = j < rows - 1 && ctx.rand() < bias ? 1 : 0;
      mask[j][i] = (N ? 1 : 0) | (E << 1) | (S << 2) | (W_ << 3);
      void W_;
    }
  }
  const ox = X0 + (W - cols * s) / 2;
  const oy = Y0 + (H - rows * s) / 2;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const m = mask[j][i];
    const cx = ox + (i + 0.5) * s;
    const cy = oy + (j + 0.5) * s;
    items.push(poly(rp(ox + i * s + 1, oy + j * s + 1, s - 2, s - 2), pal[0], 0.5));
    const arms = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
    arms.forEach(([dx, dy, bit]) => {
      if (m & bit) {
        items.push(layer(line([[cx, cy], [cx + dx * s / 2, cy + dy * s / 2]], ink, s * 0.34), 1), layer(line([[cx, cy], [cx + dx * s / 2, cy + dy * s / 2]], pal[1 + (i + j) % 3], s * 0.2), 2));
      }
    });
    if (m) items.push(layer(circ(cx, cy, s * 0.17, pal[1 + (i + j) % 3]), 3));
  }
  flush(ctx, items, 3);
  return 'wave function collapse';
}

function flockTrails(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(12, 18);
  const b = Array.from({ length: n }, () => ({ p: [ctx.between(X0 + 20, X1 - 20), ctx.between(Y0 + 20, Y1 - 20)], v: pol(0, 0, 3, ctx.between(0, TAU)), t: [] }));
  for (let s = 0; s < 90; s++) {
    b.forEach((a, i) => {
      let c = [0, 0];
      let al = [0, 0];
      let sep = [0, 0];
      let m = 0;
      b.forEach((o, j) => {
        if (i === j) return;
        const dx = o.p[0] - a.p[0];
        const dy = o.p[1] - a.p[1];
        const d = Math.hypot(dx, dy);
        if (d < 70) { c[0] += dx; c[1] += dy; al[0] += o.v[0]; al[1] += o.v[1]; m++; }
        if (d < 14 && d > 0) { sep[0] -= dx / d; sep[1] -= dy / d; }
      });
      if (m) { a.v[0] += c[0] / m * 0.006 + al[0] / m * 0.04 + sep[0] * 0.2; a.v[1] += c[1] / m * 0.006 + al[1] / m * 0.04 + sep[1] * 0.2; }
      a.v[0] += (CX - a.p[0]) * 0.0015;
      a.v[1] += (CY - a.p[1]) * 0.0015;
      const sp = Math.hypot(a.v[0], a.v[1]) || 1;
      a.v = [(a.v[0] / sp) * 3, (a.v[1] / sp) * 3];
    });
    b.forEach((a) => {
      a.p = [a.p[0] + a.v[0], a.p[1] + a.v[1]];
      a.t.push([a.p[0], a.p[1]]);
    });
  }
  const items = b.map((a, i) => line(a.t.filter((_, k) => k % 2 === 0), pal[i % 4], 1.4));
  b.forEach((a, i) => items.push(layer(circ(a.p[0], a.p[1], 3, pal[i % 4]), 1)));
  flush(ctx, items, 1);
  return 'flocking trails';
}

function slimeMould(ctx) {
  const { pal } = setup(ctx, 4);
  const w = 34;
  const h = 48;
  let trail = new Float32Array(w * h);
  const agents = Array.from({ length: 70 }, () => {
    const a = ctx.between(0, TAU);
    const p = pol(w / 2, h / 2, ctx.between(3, 13), a);
    return { x: p[0], y: p[1], a: a + Math.PI };
  });
  const sense = (ag, da) => {
    const x = Math.floor(mod(ag.x + Math.cos(ag.a + da) * 3, w));
    const y = Math.floor(mod(ag.y + Math.sin(ag.a + da) * 3, h));
    return trail[y * w + x];
  };
  for (let s = 0; s < 85; s++) {
    agents.forEach((ag) => {
      const l = sense(ag, -0.5);
      const c = sense(ag, 0);
      const r = sense(ag, 0.5);
      if (c < l && c < r) ag.a += ctx.rand() < 0.5 ? 0.4 : -0.4;
      else if (l > r) ag.a -= 0.35;
      else if (r > l) ag.a += 0.35;
      ag.x = mod(ag.x + Math.cos(ag.a), w);
      ag.y = mod(ag.y + Math.sin(ag.a), h);
      trail[Math.floor(ag.y) * w + Math.floor(ag.x)] += 1.5;
    });
    const next = new Float32Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const v = trail[j * w + i] * 4 + trail[j * w + mod(i + 1, w)] + trail[j * w + mod(i - 1, w)] + trail[mod(j + 1, h) * w + i] + trail[mod(j - 1, h) * w + i];
      next[j * w + i] = (v / 8) * 0.92;
    }
    trail = next;
  }
  const cw = W / w;
  const ch = H / h;
  const items = [];
  [0.35, 0.9, 1.8].forEach((t, k) => items.push(layer(path(runs(trail, w, h, (v) => v > t, X0, Y0, cw, ch), pal[k], FRAME), k)));
  chunk(ctx, items, 3);
  return 'slime mould';
}

function snowflakeAutomaton(ctx) {
  const { pal } = setup(ctx, 4);
  const R = 16;
  const size = 2 * R + 1;
  const idx = (q, r) => (r + R) * size + (q + R);
  const inside = (q, r) => Math.abs(q) <= R && Math.abs(r) <= R && Math.abs(q + r) <= R;
  const beta = ctx.between(0.4, 0.7);
  const gamma = ctx.between(0.003, 0.01);
  const alpha = ctx.between(0.8, 1.2);
  const cells = [];
  for (let r = -R; r <= R; r++) for (let q = -R; q <= R; q++) if (inside(q, r)) cells.push(idx(q, r));
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const nbr = new Map(cells.map((i) => [i, null]));
  const nb = new Int32Array(size * size * 6);
  for (let r = -R; r <= R; r++) for (let q = -R; q <= R; q++) {
    if (!inside(q, r)) continue;
    const i = idx(q, r);
    dirs.forEach(([dq, dr], k) => (nb[i * 6 + k] = inside(q + dq, r + dr) ? idx(q + dq, r + dr) : i));
  }
  void nbr;
  let u = new Float32Array(size * size);
  cells.forEach((i) => (u[i] = beta));
  u[idx(0, 0)] = 1;
  const steps = ctx.int(70, 100);
  let rec = new Uint8Array(size * size);
  let next = new Float32Array(size * size);
  for (let s = 0; s < steps; s++) {
    for (let c = 0; c < cells.length; c++) {
      const i = cells[c];
      let ice = u[i] >= 1 ? 1 : 0;
      for (let k = 0; k < 6 && !ice; k++) if (u[nb[i * 6 + k]] >= 1) ice = 1;
      rec[i] = ice;
    }
    for (let c = 0; c < cells.length; c++) {
      const i = cells[c];
      const own = u[i];
      const vd = rec[i] ? 0 : own;
      let sum = 0;
      for (let k = 0; k < 6; k++) {
        const j = nb[i * 6 + k];
        if (!rec[j]) sum += u[j];
      }
      next[i] = (rec[i] ? own + gamma : 0) + vd + (alpha / 2) * (sum / 6 - vd);
    }
    [u, next] = [next, u];
  }
  const s = Math.min(W, H) / (size * 0.9);
  const items = [];
  for (let r = -R; r <= R; r++) for (let q = -R; q <= R; q++) {
    if (!inside(q, r) || u[idx(q, r)] < 1) continue;
    const x = CX + s * Math.sqrt(3) * (q + r / 2) * 0.62 * 1.0;
    const y = CY + s * 1.5 * r * 0.62;
    const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) / R;
    items.push(poly(ngon(x, y, s * 0.62, 6, Math.PI / 6), pal[Math.min(3, Math.floor(d * 4))]));
  }
  if (items.length < 3) items.push(circ(CX, CY, 10, pal[0]), circ(CX, CY, 4, pal[1]), circ(CX, CY, 2, pal[2]));
  flush(ctx, items, 3);
  return 'hex snowflake';
}

function lichenGrowth(ctx) {
  const { pal } = setup(ctx, 4);
  const w = 40;
  const h = 58;
  const age = new Int16Array(w * h).fill(-1);
  const boundary = [];
  const add = (x, y, a) => {
    age[y * w + x] = a;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && age[ny * w + nx] < 0) boundary.push([nx, ny]);
    });
  };
  for (let k = 0; k < ctx.int(1, 3); k++) add(ctx.int(8, w - 9), ctx.int(10, h - 11), 0);
  const total = ctx.int(520, 760);
  for (let n = 1; n <= total && boundary.length; n++) {
    const i = ctx.int(0, boundary.length - 1);
    const [x, y] = boundary[i];
    boundary[i] = boundary[boundary.length - 1];
    boundary.pop();
    if (age[y * w + x] < 0) add(x, y, n);
  }
  const cw = W / w;
  const ch = H / h;
  const items = [];
  for (let k = 0; k < 4; k++) items.push(path(runs(age, w, h, (v) => v >= 0 && Math.min(3, Math.floor((v / total) * 4)) === k, X0, Y0, cw, ch), pal[k], FRAME));
  flush(ctx, items, 3);
  return 'lichen';
}

function weightedStipple(ctx) {
  const { pal } = setup(ctx, 3);
  const items = [];
  const cx = ctx.between(CX - 30, CX + 30);
  const cy = ctx.between(CY - 40, CY + 40);
  const dens = (x, y) => Math.max(0, 1 - Math.hypot((x - cx) / 90, (y - cy) / 120));
  let n = 0;
  for (let t = 0; t < 2400 && n < 700; t++) {
    const x = ctx.between(X0 + 4, X1 - 4);
    const y = ctx.between(Y0 + 4, Y1 - 4);
    const d = dens(x, y);
    if (ctx.rand() < d * d * 0.9 + 0.03) {
      items.push(circ(x, y, 1 + d * 2.4, pal[d > 0.6 ? 0 : d > 0.3 ? 1 : 2]));
      n++;
    }
  }
  flush(ctx, items, 3);
  return 'weighted stipple';
}

function hatchShading(ctx) {
  const { pal } = setup(ctx, 4);
  const noise = noise2(ctx.int(1, 99));
  const s = ctx.between(9, 12);
  const f = ctx.between(0.03, 0.06);
  const items = [];
  const cols = Math.floor(W / s);
  const rows = Math.floor(H / s);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = X0 + (W - cols * s) / 2 + (i + 0.5) * s;
    const y = Y0 + (H - rows * s) / 2 + (j + 0.5) * s;
    const v = noise(x * f, y * f);
    const a = v * Math.PI * 1.5;
    const L = s * (0.35 + 0.35 * noise(x * f + 9, y * f));
    items.push(line([[x - Math.cos(a) * L, y - Math.sin(a) * L], [x + Math.cos(a) * L, y + Math.sin(a) * L]], pal[Math.min(3, Math.floor(v * 4))], 1.6));
  }
  flush(ctx, items, 3);
  return 'hatch shading';
}

function islandMap(ctx) {
  const { pal } = setup(ctx, 5);
  const w = 44;
  const h = 62;
  const n = noise2(ctx.int(1, 99));
  const f = gridOf(w, h, (i, j) => {
    const x = i / w - 0.5;
    const y = j / h - 0.5;
    const e = n(i * 0.13, j * 0.13) * 0.65 + n(i * 0.31, j * 0.31) * 0.25 + n(i * 0.7, j * 0.7) * 0.1;
    return e - Math.hypot(x * 1.4, y) * 0.9;
  });
  const cw = W / w;
  const ch = H / h;
  const cuts = [[-9, pal[0]], [0.0, pal[1]], [0.14, pal[2]], [0.22, pal[3]], [0.36, pal[4]]];
  const items = cuts.map(([t, col], k) => layer(path(runs(f, w, h, (v) => v > t, X0, Y0, cw, ch), col, FRAME), k));
  chunk(ctx, items, 5);
  return 'island map';
}

function mudCracks(ctx) {
  const { pal, ink } = setup(ctx, 3);
  const pts = Array.from({ length: ctx.int(26, 36) }, () => [ctx.between(X0, X1), ctx.between(Y0, Y1)]);
  const cells = voronoi(pts);
  const items = [];
  cells.forEach((c, i) => {
    if (c.length < 3) return;
    const m = centroid(c);
    const rough = c.map(([x, y]) => [x + ctx.between(-1.6, 1.6), y + ctx.between(-1.6, 1.6)]);
    items.push(poly(scalePts(rough, m[0], m[1], 0.93), pal[i % 3]));
    items.push(layer(circ(m[0] + ctx.between(-3, 3), m[1] + ctx.between(-3, 3), ctx.between(1, 2.4), ink), 1));
  });
  flush(ctx, items, 3);
  return 'mud cracks';
}

function geodesicSphere(ctx) {
  const { pal, ink } = setup(ctx, 5);
  const phi = (1 + Math.sqrt(5)) / 2;
  let V = [];
  [-1, 1].forEach((a) => [-1, 1].forEach((b) => V.push([0, a, b * phi], [a, b * phi, 0], [b * phi, 0, a])));
  const nrm = (v) => {
    const l = Math.hypot(...v);
    return v.map((x) => x / l);
  };
  V = V.map(nrm);
  const edgeLen = Math.hypot(...V[0].map((x, k) => x - V[3 + 0][k]));
  void edgeLen;
  let min = Infinity;
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) min = Math.min(min, Math.hypot(...V[i].map((x, k) => x - V[j][k])));
  const faces = [];
  for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) for (let c = b + 1; c < 12; c++) {
    const d = (p, q) => Math.abs(Math.hypot(...V[p].map((x, k) => x - V[q][k])) - min) < 1e-6;
    if (d(a, b) && d(b, c) && d(a, c)) faces.push([V[a], V[b], V[c]]);
  }
  const mid = (p, q) => nrm(p.map((x, k) => (x + q[k]) / 2));
  const subdivide = (fs) => fs.flatMap(([a, b, c]) => {
    const ab = mid(a, b);
    const bc = mid(b, c);
    const ca = mid(c, a);
    return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
  });
  let tris = faces;
  for (let k = 0; k < ctx.int(1, 2); k++) tris = subdivide(tris);
  const a1 = ctx.between(0, TAU);
  const a2 = ctx.between(0.2, 1.2);
  const rot = ([x, y, z]) => {
    const [x1, y1] = [x * Math.cos(a1) - y * Math.sin(a1), x * Math.sin(a1) + y * Math.cos(a1)];
    return [x1, y1 * Math.cos(a2) - z * Math.sin(a2), y1 * Math.sin(a2) + z * Math.cos(a2)];
  };
  const R = ctx.between(90, 100);
  const light = [-0.4, -0.5, 0.75];
  const items = [circ(CX, CY, R + 2, ink)];
  tris.map((t) => t.map(rot)).filter((t) => (t[0][2] + t[1][2] + t[2][2]) / 3 > -0.1).sort((p, q) => p[0][2] + p[1][2] + p[2][2] - (q[0][2] + q[1][2] + q[2][2])).forEach((t) => {
    const c = [0, 1, 2].map((k) => (t[0][k] + t[1][k] + t[2][k]) / 3);
    const l = Math.hypot(...c);
    const sh = Math.max(0, (c[0] * light[0] + c[1] * light[1] + c[2] * light[2]) / l);
    items.push(layer(poly(t.map((v) => [CX + v[0] * R, CY + v[1] * R]), pal[Math.min(4, Math.floor(sh * 5))], 0, 0.7), 1));
  });
  flush(ctx, items, 1);
  return 'geodesic sphere';
}

function ribbonSweep(ctx) {
  const { pal } = setup(ctx, 4);
  const pts = Array.from({ length: 9 }, (_, i) => [CX + ctx.between(-70, 70), Y0 + 14 + ((H - 28) * i) / 8]);
  const dense = [];
  const N = 70;
  for (let i = 0; i < N; i++) {
    const t = (i / (N - 1)) * 8;
    const k = Math.min(7, Math.floor(t));
    const u = t - k;
    const p0 = pts[Math.max(0, k - 1)];
    const p1 = pts[k];
    const p2 = pts[k + 1];
    const p3 = pts[Math.min(8, k + 2)];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    dense.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
  }
  const items = [];
  const tw = ctx.between(2, 4);
  for (let i = 0; i < N - 1; i++) {
    const a = dense[i];
    const b = dense[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const wa = 22 * Math.cos(i * 0.22 * tw);
    const wb = 22 * Math.cos((i + 1) * 0.22 * tw);
    const n = [-dy / l, dx / l];
    items.push(poly([[a[0] + n[0] * wa, a[1] + n[1] * wa], [b[0] + n[0] * wb, b[1] + n[1] * wb], [b[0] - n[0] * wb, b[1] - n[1] * wb], [a[0] - n[0] * wa, a[1] - n[1] * wa]], wa > 0 ? pal[mod(Math.floor(i / 7), 2)] : pal[2 + mod(Math.floor(i / 7), 2)], 0, 0.5));
  }
  chunk(ctx, items, 14);
  return 'swept ribbon';
}

function nailThread(ctx) {
  const { pal } = setup(ctx, 4);
  const n = ctx.int(90, 140);
  const R = ctx.between(98, 104);
  const step = ctx.int(Math.floor(n * 0.3), Math.floor(n * 0.7));
  const items = [];
  const nails = Array.from({ length: n }, (_, i) => pol(CX, CY, R, (i / n) * TAU));
  let cur = 0;
  const jumps = ctx.int(180, 260);
  for (let k = 0; k < jumps; k++) {
    const next = (cur + step + ((k * 7) % 5) - 2 + n) % n;
    items.push(line([nails[cur], nails[next]], pal[Math.floor((k / jumps) * 3)], 0.7));
    cur = next;
  }
  nails.forEach((p) => items.push(layer(circ(p[0], p[1], 1.3, pal[3]), 1)));
  flush(ctx, items, 1);
  return 'nail and thread';
}

function shardSplits(ctx) {
  const { pal } = setup(ctx, 5);
  let cells = [rp(X0 + 4, Y0 + 4, W - 8, H - 8)];
  for (let k = 0; k < ctx.int(16, 26); k++) {
    cells.sort((a, b) => Math.abs(K.bbox(b)[2] - K.bbox(b)[0]) * (K.bbox(b)[3] - K.bbox(b)[1]) - Math.abs(K.bbox(a)[2] - K.bbox(a)[0]) * (K.bbox(a)[3] - K.bbox(a)[1]));
    const c = cells.shift();
    const m = centroid(c);
    const parts = splitPoly(c, [m[0] + ctx.between(-6, 6), m[1] + ctx.between(-6, 6)], ctx.between(0, Math.PI));
    cells.push(...(parts.length === 2 ? parts : [c]));
  }
  const items = cells.map((c, i) => {
    const m = centroid(c);
    const turn = ctx.between(-0.09, 0.09);
    return poly(rotPts(scalePts(c, m[0], m[1], 0.93), m[0], m[1], turn), pal[mod(Math.floor((m[1] - Y0) / 50) + i, 5)]);
  });
  flush(ctx, items, 3);
  return 'recursive shards';
}

function smoothUnion(ctx) {
  const { pal } = setup(ctx, 5);
  const w = 44;
  const h = 62;
  const shapes = Array.from({ length: ctx.int(3, 5) }, () => ({ x: ctx.between(0.2, 0.8) * w, y: ctx.between(0.2, 0.8) * h, r: ctx.between(5, 9), box: ctx.rand() < 0.4 }));
  const k = ctx.between(4, 8);
  const sd = (i, j) => {
    let d = 1e9;
    shapes.forEach((s) => {
      const v = s.box ? Math.max(Math.abs(i - s.x), Math.abs(j - s.y)) - s.r : Math.hypot(i - s.x, j - s.y) - s.r;
      const hh = Math.max(k - Math.abs(d - v), 0) / k;
      d = Math.min(d, v) - hh * hh * k * 0.25;
    });
    return d;
  };
  const f = gridOf(w, h, sd);
  const cw = W / w;
  const ch = H / h;
  const items = [];
  [12, 8, 5, 2.5, 0].forEach((t, z) => items.push(layer(path(runs(f, w, h, (v) => v < t, X0, Y0, cw, ch), pal[z], FRAME), z)));
  chunk(ctx, items, 5);
  return 'soft union';
}

function orbitTrails(ctx) {
  const { pal } = setup(ctx, 4);
  const att = Array.from({ length: ctx.int(2, 3) }, () => [ctx.between(X0 + 50, X1 - 50), ctx.between(Y0 + 80, Y1 - 80)]);
  const ps = Array.from({ length: ctx.int(14, 20) }, () => ({ p: [ctx.between(X0, X1), ctx.between(Y0, Y1)], v: [ctx.between(-1.5, 1.5), ctx.between(-1.5, 1.5)], t: [] }));
  for (let s = 0; s < 110; s++) {
    ps.forEach((a) => {
      att.forEach((m) => {
        const dx = m[0] - a.p[0];
        const dy = m[1] - a.p[1];
        const d2 = dx * dx + dy * dy + 120;
        a.v[0] += (dx / Math.sqrt(d2)) * (60 / d2) * 4;
        a.v[1] += (dy / Math.sqrt(d2)) * (60 / d2) * 4;
      });
      a.p = [a.p[0] + a.v[0], a.p[1] + a.v[1]];
      a.t.push([Math.max(X0, Math.min(X1, a.p[0])), Math.max(Y0, Math.min(Y1, a.p[1]))]);
    });
  }
  const items = ps.map((a, i) => line(a.t, pal[i % 3], 1.2));
  att.forEach((m) => items.push(layer(circ(m[0], m[1], 5, pal[3]), 1)));
  flush(ctx, items, 1);
  return 'orbit trails';
}

function domainWarp(ctx) {
  const { pal } = setup(ctx, 5);
  const w = 44;
  const h = 62;
  const n = noise2(ctx.int(1, 99));
  const f0 = ctx.between(0.08, 0.14);
  const A = ctx.between(3, 7);
  const f = gridOf(w, h, (i, j) => {
    const qx = n(i * f0, j * f0);
    const qy = n(i * f0 + 5.2, j * f0 + 1.3);
    return n(i * f0 * 0.7 + A * qx, j * f0 * 0.7 + A * qy);
  });
  const cw = W / w;
  const ch = H / h;
  const items = [0.2, 0.35, 0.5, 0.65].map((t, k) => layer(path(runs(f, w, h, (v) => v > t, X0, Y0, cw, ch), pal[k + 1], FRAME), k));
  chunk(ctx, [poly(rp(X0, Y0, W, H), pal[0]), ...items], 5);
  return 'warped bands';
}

function noiseSpiral(ctx) {
  const { pal } = setup(ctx, 4);
  const n = noise2(ctx.int(1, 99));
  const items = [];
  const turns = ctx.int(12, 18);
  const amp = ctx.between(2, 5);
  for (let k = 0; k < 3; k++) {
    const pts = Array.from({ length: 700 }, (_, i) => {
      const t = i / 699;
      const a = t * turns * TAU + k * 0.5;
      const r = 4 + t * 100 + (n(Math.cos(a) * 3 + 5, Math.sin(a) * 3 + t * 8 + k) - 0.5) * amp * 6;
      return pol(CX, CY, r, a);
    });
    items.push(line(pts, pal[k], 1.2));
  }
  flush(ctx, items, 1);
  return 'plotter spiral';
}

function orderedDither(ctx) {
  const { pal } = setup(ctx, 3);
  const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const w = 54;
  const h = 76;
  const cx = ctx.between(0.35, 0.65) * w;
  const cy = ctx.between(0.35, 0.65) * h;
  const r = ctx.between(14, 22);
  const f = gridOf(w, h, (i, j) => {
    const d = Math.hypot(i - cx, (j - cy) * 0.9);
    const shape = d < r ? 0.35 + 0.65 * (1 - d / r) : 0;
    return shape * 0.8 + (j / h) * 0.35 * (1 - Math.min(1, shape * 2));
  });
  const cw = W / w;
  const ch = H / h;
  const on = (v, i, j) => v > (bayer[j % 4][i % 4] + 0.5) / 16;
  const items = [path(runs(f, w, h, on, X0, Y0, cw, ch), pal[0], FRAME), layer(path(runs(f, w, h, (v, i, j) => v > 0.7 && on(v, i, j), X0, Y0, cw, ch), pal[1], FRAME), 1)];
  chunk(ctx, items, 3);
  return 'dithered gradient';
}

module.exports = {
  reactionDiffusion, turingStripes, differentialGrowth, lSystemPlant, spaceColonization, lloydCells, delaunayMesh, metaballs,
  waveCollapse, flockTrails, slimeMould, snowflakeAutomaton, lichenGrowth, weightedStipple, hatchShading, islandMap, mudCracks,
  geodesicSphere, ribbonSweep, nailThread, shardSplits, smoothUnion, orbitTrails, domainWarp, noiseSpiral, orderedDither
};
