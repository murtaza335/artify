'use strict';

// Exact Archimedean tilings (and their duals) at unit edge length, built once and cached. A tiling is a list of
// faces { pts, n } over the region REGION. Forms scale, shift and colour them. Not a family: it has no forms of its own.

const REGION = [-3, -3, 17, 21];
const S3 = Math.sqrt(3);
const deg = Math.PI / 180;

const ngon = (cx, cy, r, n, rot = 0) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(rot + (2 * Math.PI * i) / n), cy + r * Math.sin(rot + (2 * Math.PI * i) / n)]);
const key = (p) => Math.round(p[0] * 500) + ',' + Math.round(p[1] * 500);
const centroid = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
const near = (c) => c[0] > REGION[0] - 2 && c[0] < REGION[2] + 2 && c[1] > REGION[1] - 2 && c[1] < REGION[3] + 2;

// Adds every unit equilateral triangle that the given polygons' vertices form between them.
function fillTriangles(faces) {
  const verts = new Map();
  for (const f of faces) for (const p of f.pts) verts.set(key(p), p);
  const list = [...verts.values()];
  const cell = new Map();
  const cellKey = (p) => Math.floor(p[0] * 0.8) + ',' + Math.floor(p[1] * 0.8);
  list.forEach((p) => {
    const k = cellKey(p);
    if (!cell.has(k)) cell.set(k, []);
    cell.get(k).push(p);
  });
  const nearby = (p) => {
    const out = [];
    const cx = Math.floor(p[0] * 0.8);
    const cy = Math.floor(p[1] * 0.8);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const q of cell.get(`${cx + i},${cy + j}`) || []) if (Math.abs(Math.hypot(p[0] - q[0], p[1] - q[1]) - 1) < 0.01) out.push(q);
    return out;
  };
  const seen = new Set();
  const tris = [];
  for (const p of list) {
    const nb = nearby(p);
    for (let i = 0; i < nb.length; i++) {
      for (let j = i + 1; j < nb.length; j++) {
        if (Math.abs(Math.hypot(nb[i][0] - nb[j][0], nb[i][1] - nb[j][1]) - 1) > 0.01) continue;
        const ks = [key(p), key(nb[i]), key(nb[j])].sort().join('|');
        if (seen.has(ks)) continue;
        seen.add(ks);
        tris.push({ pts: [p, nb[i], nb[j]], n: 3 });
      }
    }
  }
  return tris;
}

const dedupe = (faces) => {
  const seen = new Set();
  return faces.filter((f) => {
    const k = key(centroid(f.pts)) + f.n;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

function lattice(a, b, fn, range = 14) {
  for (let i = -range; i <= range; i++) {
    for (let j = -range; j <= range; j++) fn(i * a[0] + j * b[0], i * a[1] + j * b[1], i, j);
  }
}

const BUILD = {
  // 3.3.4.3.4
  snubSquare() {
    const d = (1 + S3) / 2;
    const out = [];
    lattice([d, 0], [0, d], (x, y, i, j) => {
      if (!near([x, y])) return;
      const a = (((i + j) % 2) + 2) % 2 ? 60 : 30;
      out.push({ pts: ngon(x, y, Math.SQRT1_2, 4, (a + 45) * deg), n: 4 });
    });
    return out.concat(fillTriangles(out));
  },
  // 3.6.3.6
  trihexagonal() {
    const out = [];
    lattice([2, 0], [1, S3], (x, y) => near([x, y]) && out.push({ pts: ngon(x, y, 1, 6, 0), n: 6 }));
    return out.concat(fillTriangles(out));
  },
  // 3.4.6.4
  rhombitrihex() {
    const out = [];
    const s = 1 + S3;
    lattice([s, 0], [s / 2, (s * S3) / 2], (x, y) => {
      if (!near([x, y])) return;
      const hex = ngon(x, y, 1, 6, 30 * deg);
      out.push({ pts: hex, n: 6 });
      for (let k = 0; k < 6; k++) {
        const a = hex[k];
        const b = hex[(k + 1) % 6];
        const mx = (a[0] + b[0]) / 2 - x;
        const my = (a[1] + b[1]) / 2 - y;
        const l = Math.hypot(mx, my);
        out.push({ pts: [a, b, [b[0] + (mx / l), b[1] + (my / l)], [a[0] + (mx / l), a[1] + (my / l)]], n: 4 });
      }
    });
    const uniq = dedupe(out);
    return uniq.concat(fillTriangles(uniq));
  },
  // 4.8.8
  octagonSquares() {
    const s = 1 + Math.SQRT2;
    const R = 1 / (2 * Math.sin(Math.PI / 8));
    const out = [];
    lattice([s, 0], [0, s], (x, y) => {
      if (!near([x, y])) return;
      out.push({ pts: ngon(x, y, R, 8, Math.PI / 8), n: 8 });
      out.push({ pts: ngon(x + s / 2, y + s / 2, Math.SQRT1_2, 4, 0), n: 4 });
    });
    return out;
  },
  // 3.3.3.3.6, chiral
  snubHexagonal(flip = false) {
    const a = Math.atan2(S3, 5) * (flip ? -1 : 1);
    const k = Math.sqrt(7);
    const out = [];
    lattice([k * Math.cos(a), k * Math.sin(a)], [k * Math.cos(a + Math.PI / 3), k * Math.sin(a + Math.PI / 3)], (x, y) => near([x, y]) && out.push({ pts: ngon(x, y, 1, 6, 0), n: 6 }));
    return out.concat(fillTriangles(out));
  },
  // 3.3.3.4.4
  elongatedTriangular() {
    const out = [];
    const h = 1 + S3 / 2;
    for (let r = -8; r < 30; r++) {
      for (let c = -14; c < 30; c++) {
        const x = c + (r % 2 ? 0.5 : 0);
        const y = r * h;
        if (near([x, y])) out.push({ pts: [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]], n: 4 });
      }
    }
    return out.concat(fillTriangles(out));
  },
  // 3.12.12
  dodecagons() {
    const ap = (2 + S3) / 2;
    const s = 2 * ap;
    const R = 1 / (2 * Math.sin(Math.PI / 12));
    const out = [];
    lattice([s, 0], [s / 2, (s * S3) / 2], (x, y) => near([x, y]) && out.push({ pts: ngon(x, y, R, 12, Math.PI / 12), n: 12 }), 8);
    return out.concat(fillTriangles(out));
  }
};

// The dual: one face per vertex of the tiling, joining the centres of the faces that meet there.
function dual(faces, valence) {
  const at = new Map();
  for (const f of faces) {
    const c = centroid(f.pts);
    for (const p of f.pts) {
      const k = key(p);
      if (!at.has(k)) at.set(k, { p, around: [] });
      at.get(k).around.push({ c, n: f.n });
    }
  }
  const out = [];
  for (const { p, around } of at.values()) {
    if (around.length !== valence || !near(p)) continue;
    const sorted = around.slice().sort((a, b) => Math.atan2(a.c[1] - p[1], a.c[0] - p[0]) - Math.atan2(b.c[1] - p[1], b.c[0] - p[0]));
    out.push({ pts: sorted.map((a) => a.c), n: valence, ns: sorted.map((a) => a.n) });
  }
  return out;
}

const cache = new Map();
function tiling(kind) {
  if (!cache.has(kind)) {
    const [name, flip] = kind.split(':');
    let faces;
    if (name === 'cairo') faces = dual(tiling('snubSquare'), 5);
    else if (name === 'kites') faces = dual(tiling('rhombitrihex'), 4);
    else if (name === 'floret') faces = dual(tiling('snubHexagonal'), 5);
    else if (name === 'prismatic') faces = dual(tiling('elongatedTriangular'), 5);
    else faces = BUILD[name](flip === 'flip');
    cache.set(kind, faces);
  }
  return cache.get(kind);
}

// The de Bruijn multigrid: n families of parallel lines; every crossing of two families is a rhombus (or a square).
function multigrid(n, gamma, radius) {
  const dirs = Array.from({ length: n }, (_, t) => [Math.cos((Math.PI * t) / n), Math.sin((Math.PI * t) / n)]);
  const N = Math.ceil(radius) + 3;
  const out = [];
  for (let r = 0; r < n; r++) {
    for (let s = r + 1; s < n; s++) {
      const [a, b] = dirs[r];
      const [c, d] = dirs[s];
      const det = a * d - b * c;
      for (let kr = -N; kr <= N; kr++) {
        for (let ks = -N; ks <= N; ks++) {
          const u = kr + gamma[r];
          const v = ks + gamma[s];
          const P = [(u * d - v * b) / det, (a * v - c * u) / det];
          if (Math.hypot(P[0], P[1]) > radius) continue;
          let base = [0, 0];
          for (let t = 0; t < n; t++) {
            if (t === r || t === s) continue;
            const k = Math.ceil(P[0] * dirs[t][0] + P[1] * dirs[t][1] - gamma[t]);
            base = [base[0] + k * dirs[t][0], base[1] + k * dirs[t][1]];
          }
          const corner = (i, j) => [base[0] + (kr + i) * a + (ks + j) * c, base[1] + (kr + i) * b + (ks + j) * d];
          out.push({ r, s, pts: [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)] });
        }
      }
    }
  }
  return out;
}

module.exports = { multigrid, tiling, REGION, ngon, centroid, key };
