'use strict';

// Shared helpers for the pattern and tiling families. Marks are collected as items, then flushed into a handful
// of parts (grouped by colour, or in z-order chunks), so a pattern of hundreds of tiles still plays as a puzzle.

const { TAU, fmt, pol } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, ground, FRAME, X0, Y0, X1, Y1, CX, CY } = K;
const W = X1 - X0;
const H = Y1 - Y0;

const ptsAttr = (list) => list.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ');
const bbox = (list) => {
  let b = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of list) b = [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)];
  return b;
};
const pad = (b, p) => [b[0] - p, b[1] - p, b[2] + p, b[3] + p];

// Items: { svg, b, key, cy }. `key` decides the group a mark belongs to when flushing by colour.
function poly(list, fill, opacity, seam = 0) {
  const b = bbox(list);
  const edge = seam ? ` stroke="${fill}" stroke-width="${seam}" stroke-linejoin="round"` : '';
  return { svg: `<polygon points="${ptsAttr(list)}" fill="${fill}"${opacity ? ` opacity="${opacity}"` : ''}${edge}/>`, b, key: fill + (opacity || '') + seam, cy: (b[1] + b[3]) / 2 };
}
function circ(x, y, r, fill, opacity) {
  return { svg: `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${fill}"${opacity ? ` opacity="${opacity}"` : ''}/>`, b: [x - r, y - r, x + r, y + r], key: fill, cy: y };
}
function ring(x, y, r, stroke, w) {
  return { svg: `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="none" stroke="${stroke}" stroke-width="${fmt(w)}"/>`, b: [x - r - w, y - r - w, x + r + w, y + r + w], key: 'o' + stroke + w, cy: y };
}
function line(list, stroke, w, closed = false) {
  const b = pad(bbox(list), w);
  const d = 'M' + list.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L') + (closed ? ' Z' : '');
  return { svg: `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${fmt(w)}" stroke-linecap="round" stroke-linejoin="round"/>`, b, key: 's' + stroke + w, cy: (b[1] + b[3]) / 2 };
}
function path(d, fill, b, extra = '') {
  return { svg: `<path d="${d}" fill="${fill}"${extra}/>`, b, key: fill + extra, cy: (b[1] + b[3]) / 2 };
}
function stroked(d, stroke, w, b) {
  return { svg: `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${fmt(w)}" stroke-linecap="round" stroke-linejoin="round"/>`, b: pad(b, w), key: 's' + stroke + w, cy: (b[1] + b[3]) / 2 };
}

// Puts an item on layer z, so flush() paints it above lower layers.
const layer = (it, z) => ((it.z = z), it);

function emit(ctx, group) {
  if (!group.length) return;
  let b = [Infinity, Infinity, -Infinity, -Infinity];
  for (const it of group) b = [Math.min(b[0], it.b[0]), Math.min(b[1], it.b[1]), Math.max(b[2], it.b[2]), Math.max(b[3], it.b[3])];
  ctx.raw(group.map((it) => it.svg).join(''), (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b);
}

// One part per colour, split into `bands` horizontal bands. Order within a colour is kept; between colours it is not,
// so use this where marks do not overlap.
function flush(ctx, items, bands = 2) {
  const groups = new Map();
  for (const it of items) {
    const band = Math.max(0, Math.min(bands - 1, Math.floor(((it.cy - Y0) / H) * bands)));
    const k = (it.z || 0) + '|' + it.key + '|' + band;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(it);
  }
  // Layers (item.z) keep their stacking order; within a layer, groups are painted in the order they first appear.
  [...groups.values()].map((g, i) => [g, i]).sort((a, b) => (a[0][0].z || 0) - (b[0][0].z || 0) || a[1] - b[1]).forEach(([g]) => emit(ctx, g));
}

// Parts in z-order: the list is cut into `parts` consecutive runs, so overlaps keep their order.
function chunk(ctx, items, parts = 12) {
  const n = Math.max(1, Math.ceil(items.length / parts));
  for (let i = 0; i < items.length; i += n) emit(ctx, items.slice(i, i + n));
}

// A framed panel with a ground and a palette that never matches it.
function setup(ctx, n = 5, bg = ground(ctx)) {
  panel(ctx, bg);
  return { bg, pal: hues(ctx, n, [bg]), ink: ctx.ink, paper: ctx.colors[1] };
}

const ngon = (cx, cy, r, n, rot = 0) => Array.from({ length: n }, (_, i) => pol(cx, cy, r, rot + (i * TAU) / n));
const rotPts = (list, cx, cy, a) => list.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const scalePts = (list, cx, cy, k) => list.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
const centroid = (list) => [list.reduce((a, p) => a + p[0], 0) / list.length, list.reduce((a, p) => a + p[1], 0) / list.length];
const inFrame = (b, m = 0) => b[2] > X0 - m && b[0] < X1 + m && b[3] > Y0 - m && b[1] < Y1 + m;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Calls fn(i, j, x, y) for every cell of a grid with spacing (sx, sy) that touches the frame.
function eachCell(sx, sy, fn, ox = 0, oy = 0) {
  const cols = Math.ceil(W / sx) + 2;
  const rows = Math.ceil(H / sy) + 2;
  for (let j = -1; j < rows; j++) for (let i = -1; i < cols; i++) fn(i, j, X0 + ox + i * sx, Y0 + oy + j * sy);
}

// Rotations (and optionally mirrors) of a drawing around a centre: fn(angle, index, mirrored).
function dihedral(n, fn, mirror = false, rot = 0) {
  for (let i = 0; i < n; i++) {
    fn(rot + (i * TAU) / n, i, false);
    if (mirror) fn(rot + (i * TAU) / n, i, true);
  }
}

// Catmull-Rom through points, as a cubic path. `closed` joins the last point to the first.
function smoothPath(points, closed = false) {
  const n = points.length;
  const at = (i) => (closed ? points[((i % n) + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    d += ` C${fmt(p1[0] + (p2[0] - p0[0]) / 6)} ${fmt(p1[1] + (p2[1] - p0[1]) / 6)} ${fmt(p2[0] - (p3[0] - p1[0]) / 6)} ${fmt(p2[1] - (p3[1] - p1[1]) / 6)} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return closed ? d + ' Z' : d;
}

// A string rewritten n times by `rules`, e.g. lsystem('F', { F: 'F+F-F' }, 3).
function lsystem(axiom, rules, n) {
  let s = axiom;
  for (let i = 0; i < n; i++) s = s.replace(/./g, (c) => rules[c] || c);
  return s;
}

// Turtle graphics for an L-system string. F and G draw, f moves, + and - turn, [ and ] branch.
// Returns polylines (arrays of points).
function turtle(str, angleDeg, step = 1, startAngle = 0) {
  const lines = [];
  let cur = [[0, 0]];
  let x = 0;
  let y = 0;
  let a = (startAngle * Math.PI) / 180;
  const stack = [];
  const turn = (angleDeg * Math.PI) / 180;
  for (const c of str) {
    if (c === 'F' || c === 'G') {
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      cur.push([x, y]);
    } else if (c === 'f') {
      if (cur.length > 1) lines.push(cur);
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      cur = [[x, y]];
    } else if (c === '+') a += turn;
    else if (c === '-') a -= turn;
    else if (c === '[') stack.push([x, y, a, cur]), (cur = [[x, y]]);
    else if (c === ']') {
      if (cur.length > 1) lines.push(cur);
      [x, y, a] = stack.pop().slice(0, 3);
      cur = [[x, y]];
    }
  }
  if (cur.length > 1) lines.push(cur);
  return lines;
}

// Scales and centres polylines to fit a box [x, y, w, h], keeping their proportions.
function fit(lines, [bx, by, bw, bh]) {
  const b = bbox(lines.flat());
  const k = Math.min(bw / (b[2] - b[0] || 1), bh / (b[3] - b[1] || 1));
  const ox = bx + (bw - (b[2] - b[0]) * k) / 2 - b[0] * k;
  const oy = by + (bh - (b[3] - b[1]) * k) / 2 - b[1] * k;
  return lines.map((l) => l.map(([x, y]) => [x * k + ox, y * k + oy]));
}

// Marching squares: the contour at `thr` of a w x h field, as one path of segments laid over [x0, y0, cw, ch] cells.
function contour(field, w, h, thr, x0, y0, cw, ch) {
  const f = (i, j) => field[j * w + i];
  const cut = (i0, j0, i1, j1) => {
    const a = f(i0, j0);
    const b = f(i1, j1);
    const t = b === a ? 0.5 : (thr - a) / (b - a);
    return [x0 + (i0 + (i1 - i0) * t + 0.5) * cw, y0 + (j0 + (j1 - j0) * t + 0.5) * ch];
  };
  let d = '';
  const seg = (p, q) => (d += `M${fmt(p[0])} ${fmt(p[1])}L${fmt(q[0])} ${fmt(q[1])}`);
  for (let j = 0; j < h - 1; j++) {
    for (let i = 0; i < w - 1; i++) {
      const a = f(i, j) > thr ? 8 : 0;
      const b = f(i + 1, j) > thr ? 4 : 0;
      const c = f(i + 1, j + 1) > thr ? 2 : 0;
      const dd = f(i, j + 1) > thr ? 1 : 0;
      const idx = a + b + c + dd;
      if (idx === 0 || idx === 15) continue;
      const top = () => cut(i, j, i + 1, j);
      const right = () => cut(i + 1, j, i + 1, j + 1);
      const bottom = () => cut(i, j + 1, i + 1, j + 1);
      const left = () => cut(i, j, i, j + 1);
      switch (idx) {
        case 1: case 14: seg(left(), bottom()); break;
        case 2: case 13: seg(bottom(), right()); break;
        case 3: case 12: seg(left(), right()); break;
        case 4: case 11: seg(top(), right()); break;
        case 6: case 9: seg(top(), bottom()); break;
        case 7: case 8: seg(left(), top()); break;
        case 5: case 10: {
          const mid = (f(i, j) + f(i + 1, j) + f(i + 1, j + 1) + f(i, j + 1)) / 4 > thr;
          if ((idx === 5) === mid) (seg(top(), left()), seg(bottom(), right()));
          else (seg(top(), right()), seg(left(), bottom()));
          break;
        }
        default: break;
      }
    }
  }
  return d;
}

// Merged horizontal runs of cells where test(value, i, j) holds, as one filled path.
function runs(field, w, h, test, x0, y0, cw, ch) {
  let d = '';
  for (let j = 0; j < h; j++) {
    let i = 0;
    while (i < w) {
      if (!test(field[j * w + i], i, j)) {
        i++;
        continue;
      }
      let k = i;
      while (k < w && test(field[j * w + k], k, j)) k++;
      d += `M${fmt(x0 + i * cw)} ${fmt(y0 + j * ch)}h${fmt((k - i) * cw)}v${fmt(ch)}h${fmt(-(k - i) * cw)}Z`;
      i = k;
    }
  }
  return d;
}

// A cheap smooth value noise on a fixed lattice: noise(seed)(x, y) in 0..1.
const noise2 = K.noise2;

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const lenOf = (list) => list.reduce((s, p, i) => (i ? s + dist(p, list[i - 1]) : 0), 0);

// Intersection of segments ab and cd, or null.
function crossing(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]];
  const s = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return [a[0] + r[0] * t, a[1] + r[1] * t, t, u];
}

// Interlaced bands. Each strand is a polyline (open, or closed when it ends where it starts). Every strand is drawn as an
// outlined band; then at each crossing the strand that is "over" is redrawn across it. Over and under alternate along
// every strand, found by two-colouring the crossings. Returns items in z-order.
function weave(strands, width, colorOf, edge) {
  const items = [];
  strands.forEach((s, i) => {
    items.push(line(s, edge, width + 3), line(s, colorOf(i), width));
  });
  const nodes = [];
  const along = strands.map(() => []);
  for (let a = 0; a < strands.length; a++) {
    for (let b = a; b < strands.length; b++) {
      for (let i = 0; i < strands[a].length - 1; i++) {
        for (let j = a === b ? i + 2 : 0; j < strands[b].length - 1; j++) {
          const hit = crossing(strands[a][i], strands[a][i + 1], strands[b][j], strands[b][j + 1]);
          if (!hit) continue;
          const id = nodes.length;
          nodes.push({ a, b, i, j, hit });
          along[a].push({ id, pos: i + hit[2], first: true });
          along[b].push({ id, pos: j + hit[3], first: false });
        }
      }
    }
  }
  // over[id] true means strand a is over strand b.
  const over = new Array(nodes.length).fill(null);
  const adj = nodes.map(() => []);
  along.forEach((list) => {
    list.sort((p, q) => p.pos - q.pos);
    for (let k = 0; k + 1 < list.length; k++) {
      const p = list[k];
      const q = list[k + 1];
      // along this strand the status flips: status(p) = p.first ? over : !over
      adj[p.id].push({ to: q.id, flip: p.first === q.first });
      adj[q.id].push({ to: p.id, flip: p.first === q.first });
    }
  });
  nodes.forEach((_, start) => {
    if (over[start] !== null) return;
    over[start] = true;
    const queue = [start];
    while (queue.length) {
      const cur = queue.shift();
      for (const { to, flip } of adj[cur]) {
        if (over[to] === null) {
          over[to] = flip ? !over[cur] : over[cur];
          queue.push(to);
        }
      }
    }
  });
  nodes.forEach((n, id) => {
    const top = over[id] ? n.a : n.b;
    const seg = over[id] ? [strands[n.a][n.i], strands[n.a][n.i + 1]] : [strands[n.b][n.j], strands[n.b][n.j + 1]];
    const L = dist(seg[0], seg[1]) || 1;
    const u = [(seg[1][0] - seg[0][0]) / L, (seg[1][1] - seg[0][1]) / L];
    const reach = Math.min(L / 2, width * 1.1);
    const p = [[n.hit[0] - u[0] * reach, n.hit[1] - u[1] * reach], [n.hit[0] + u[0] * reach, n.hit[1] + u[1] * reach]];
    items.push(line(p, edge, width + 3), line(p, colorOf(top), width));
  });
  return items;
}

// An ellipse part-item, rotated by `rot` radians.
function ell(cx, cy, rx, ry, rot, fill) {
  const r = Math.max(rx, ry);
  return { svg: `<ellipse cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="${fill}" transform="rotate(${fmt((rot * 180) / Math.PI)} ${fmt(cx)} ${fmt(cy)})"/>`, b: [cx - r, cy - r, cx + r, cy + r], key: fill + 'e', cy };
}

// The part of a polygon on the left of the line through p at angle a (Sutherland-Hodgman against one half-plane).
function clipHalfPlane(pts, p, a, keepLeft = true) {
  const nx = -Math.sin(a) * (keepLeft ? 1 : -1);
  const ny = Math.cos(a) * (keepLeft ? 1 : -1);
  const side = (q) => (q[0] - p[0]) * nx + (q[1] - p[1]) * ny;
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const A = pts[i];
    const B = pts[(i + 1) % pts.length];
    const sa = side(A);
    const sb = side(B);
    if (sa >= 0) out.push(A);
    if (sa >= 0 !== sb >= 0) {
      const t = sa / (sa - sb);
      out.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]);
    }
  }
  return out;
}

// Cuts a polygon in two along the line through p at angle a.
const splitPoly = (pts, p, a) => [clipHalfPlane(pts, p, a, true), clipHalfPlane(pts, p, a, false)].filter((q) => q.length >= 3);

// A segment clipped to the rectangle [x, y, w, h] (Liang-Barsky), or null.
function clipSegment(a, b, [x, y, w, h]) {
  let t0 = 0;
  let t1 = 1;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] - x], [dx, x + w - a[0]], [-dy, a[1] - y], [dy, y + h - a[1]]]) {
    if (p === 0) {
      if (q < 0) return null;
    } else {
      const r = q / p;
      if (p < 0) t0 = Math.max(t0, r);
      else t1 = Math.min(t1, r);
    }
  }
  return t0 >= t1 ? null : [[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]];
}

// Parallel lines at `angle` radians, `gap` apart, clipped to a rectangle. Returns segments.
function hatchRect(x, y, w, h, angle, gap, offset = 0) {
  const c = [x + w / 2, y + h / 2];
  const reach = Math.hypot(w, h) / 2 + 2;
  const d = [Math.cos(angle), Math.sin(angle)];
  const n = [-d[1], d[0]];
  const out = [];
  for (let t = -reach + offset; t <= reach; t += gap) {
    const seg = clipSegment([c[0] + n[0] * t - d[0] * reach, c[1] + n[1] * t - d[1] * reach], [c[0] + n[0] * t + d[0] * reach, c[1] + n[1] * t + d[1] * reach], [x, y, w, h]);
    if (seg) out.push(seg);
  }
  return out;
}

// A grid of w x h numbers filled by fn(i, j), for small simulations.
const gridOf = (w, h, fn) => Float32Array.from({ length: w * h }, (_, k) => fn(k % w, Math.floor(k / w)));

// Hankin strapwork: rays leave the middle of every polygon edge at `angle` degrees to the edge, inwards, and stop where
// they meet the ray from the next edge. Returns segments [[x1, y1], [x2, y2]].
function hankin(polys, angleDeg) {
  const th = (angleDeg * Math.PI) / 180;
  const out = [];
  for (const poly of polys) {
    const n = poly.length;
    const c = centroid(poly);
    const rays = poly.map((v, i) => {
      const w = poly[(i + 1) % n];
      const m = [(v[0] + w[0]) / 2, (v[1] + w[1]) / 2];
      let nx = -(w[1] - v[1]);
      let ny = w[0] - v[0];
      if (nx * (c[0] - m[0]) + ny * (c[1] - m[1]) < 0) (nx = -nx), (ny = -ny);
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;
      const toward = (p) => {
        const l = dist(p, m) || 1;
        const u = [(p[0] - m[0]) / l, (p[1] - m[1]) / l];
        return [u[0] * Math.cos(th) + nx * Math.sin(th), u[1] * Math.cos(th) + ny * Math.sin(th)];
      };
      return { m, toNext: toward(w), toPrev: toward(v) };
    });
    for (let i = 0; i < n; i++) {
      const a = rays[i];
      const b = rays[(i + 1) % n];
      const den = a.toNext[0] * b.toPrev[1] - a.toNext[1] * b.toPrev[0];
      if (Math.abs(den) < 1e-9) continue;
      const t = ((b.m[0] - a.m[0]) * b.toPrev[1] - (b.m[1] - a.m[1]) * b.toPrev[0]) / den;
      const u = ((b.m[0] - a.m[0]) * a.toNext[1] - (b.m[1] - a.m[1]) * a.toNext[0]) / den;
      if (t <= 0 || u <= 0) continue;
      const p = [a.m[0] + a.toNext[0] * t, a.m[1] + a.toNext[1] * t];
      out.push([a.m, p], [b.m, p]);
    }
  }
  return out;
}

// Smoothly interpolates colours of the palette: pal[k] for k in 0..1 across the list.
const ramp = (pal, t) => pal[Math.max(0, Math.min(pal.length - 1, Math.floor(t * pal.length)))];

module.exports = {
  ...K, layer, W, H, ptsAttr, bbox, pad, poly, circ, ring, line, path, stroked, emit, flush, chunk, setup, ngon, rotPts, scalePts, centroid, inFrame, lerp,
  ell, clipSegment, hatchRect, clipHalfPlane, splitPoly, eachCell, dihedral, smoothPath, lsystem, turtle, fit, contour, runs, noise2, dist, lenOf, crossing, weave, gridOf, hankin, ramp, TAU, fmt, pol
};
