'use strict';

// Shared engine for the procedural "reform" shapes. Every form is built from flat geometric shards in a
// 240 x 380 viewBox. Pure functions, no VS Code API, so they can be tested in Node.

const COLORS = {
  dark: ['#E9A93B', '#FFF0B8', '#3F8793', '#E5534B', '#8E2A33', '#62C3E3', '#F79BB0', '#9BDB8A'],
  light: ['#F5C518', '#FFFFFF', '#1E7B8F', '#D83A2E', '#12202A', '#62C3E3', '#F28FA6', '#FFFBF0']
};
const COLOR_NAMES = {
  dark: ['Ochre', 'Cream', 'Teal', 'Brick', 'Maroon', 'Sky', 'Pink', 'Green'],
  light: ['Yellow', 'White', 'Teal', 'Red', 'Navy', 'Sky', 'Pink', 'Cream']
};
const GREENS = {
  dark: ['#9BDB8A', '#6BBF7A', '#B5E8A6', '#4C9F70'],
  light: ['#2A7236', '#3A9B4A', '#6BBF5A', '#1F8A5B']
};
const CRACK = { dark: '#10232B', light: '#CFEAF4' };
const INK = { dark: '#10232B', light: '#12202A' };

const TAU = Math.PI * 2;
const fmt = (v) => Math.round(v * 10) / 10;
const pol = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

function makeRand(seed) {
  let n = 0;
  return () => {
    const x = Math.sin((seed * 31 + 7) * 9301 + n++ * 49297) * 233280;
    return x - Math.floor(x);
  };
}

// Collects shards. Each part knows its centre and bounds so the composer can animate it and keep debris clear of it.
function createContext(kind, seed) {
  const rand = makeRand(seed);
  const colors = COLORS[kind] || COLORS.dark;
  const offset = Math.floor(rand() * colors.length);
  const parts = [];
  const extra = [];
  const defs = [];

  const ctx = {
    rand, colors, parts, extra, defs, kind, seed,
    clip: null,
    ink: INK[kind] || INK.dark,
    crack: CRACK[kind] || CRACK.dark,
    greens: GREENS[kind] || GREENS.dark,
    col: (i) => colors[(Math.abs(Math.round(i)) + offset) % colors.length],
    green: (i) => (GREENS[kind] || GREENS.dark)[Math.abs(Math.round(i)) % 4],
    between: (a, b) => a + rand() * (b - a),
    int: (a, b) => Math.floor(a + rand() * (b - a + 1)),
    pick: (list) => list[Math.floor(rand() * list.length)],

    raw(svg, cx, cy, bounds) {
      parts.push({ svg: ctx.clip ? `<g clip-path="${ctx.clip}">${svg}</g>` : svg, cx, cy, bounds });
    },
    circ(cx, cy, r, fill) {
      ctx.raw(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="${fill}"/>`, cx, cy, [cx - r, cy - r, cx + r, cy + r]);
    },
    ellipse(cx, cy, rx, ry, fill, rot = 0) {
      ctx.raw(
        `<ellipse cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="${fill}" transform="rotate(${fmt((rot * 180) / Math.PI)} ${fmt(cx)} ${fmt(cy)})"/>`,
        cx, cy, [cx - rx, cy - ry, cx + rx, cy + ry]
      );
    },
    // An arbitrary filled path; bounds are given by the caller.
    shape(d, fill, cx, cy, bounds) {
      ctx.raw(`<path d="${d}" fill="${fill}"/>`, cx, cy, bounds);
    },
    // A round-capped stroke along a path, for whiskers, stems, tails and branches.
    stroke(d, color, width, cx, cy, bounds) {
      ctx.raw(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${fmt(width)}" stroke-linecap="round" stroke-linejoin="round"/>`, cx, cy, bounds);
    },
    line(x1, y1, x2, y2, color, width) {
      ctx.stroke(`M${fmt(x1)} ${fmt(y1)} L${fmt(x2)} ${fmt(y2)}`, color, width, (x1 + x2) / 2, (y1 + y2) / 2, [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)]);
    },
    // A polygon shard. `loose` shards sit tilted and displaced, like pieces that just broke off.
    poly(pts, fill, { loose = false, inset = 0.96, still = false } = {}) {
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
      const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      const shown = pts.map(([x, y]) => `${fmt(cx + (x - cx) * inset)},${fmt(cy + (y - cy) * inset)}`).join(' ');
      const jx = still ? 0 : (rand() - 0.5) * (loose ? 20 : 3);
      const jy = still ? 0 : (rand() - 0.5) * (loose ? 20 : 3);
      const jr = still ? 0 : (rand() - 0.5) * (loose ? 30 : 4);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      ctx.raw(
        `<polygon points="${shown}" fill="${fill}" transform="translate(${fmt(jx)} ${fmt(jy)}) rotate(${fmt(jr)} ${fmt(cx)} ${fmt(cy)})"/>`,
        cx, cy, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
      );
    }
  };
  return ctx;
}

// Cuts a silhouette into bands, then each band into slanted shards.
// hw(t) is the half width at position t (0..1 along the axis); map(t, b) turns axis position and sideways offset into x,y.
function slice(ctx, hw, map, { bands = ctx.int(6, 9), big = 30, loosePct = 0.22, skipPct = 0.07, color } = {}) {
  const weights = Array.from({ length: bands }, () => 0.6 + ctx.rand());
  const total = weights.reduce((a, b) => a + b, 0);
  const edges = [0];
  weights.forEach((w) => edges.push(edges[edges.length - 1] + w / total));

  for (let b = 0; b < bands; b++) {
    const t0 = edges[b];
    const t1 = edges[b + 1];
    const w0 = hw(t0);
    const w1 = hw(t1);
    const k = (w0 + w1) / 2 > big ? ctx.int(2, 3) : ctx.int(1, 2);
    const top = [0];
    for (let i = 1; i < k; i++) top.push(ctx.rand());
    top.sort((a, c) => a - c);
    top.push(1);
    const bottom = top.map((f, i) => (i === 0 ? 0 : i === top.length - 1 ? 1 : Math.min(0.95, Math.max(0.05, f + (ctx.rand() - 0.5) * 0.3))));
    bottom.sort((a, c) => a - c);
    for (let i = 0; i < k; i++) {
      const pts = [
        map(t0, -w0 + 2 * w0 * top[i]),
        map(t0, -w0 + 2 * w0 * top[i + 1]),
        map(t1, -w1 + 2 * w1 * bottom[i + 1]),
        map(t1, -w1 + 2 * w1 * bottom[i])
      ];
      const loose = ctx.rand() < loosePct;
      const skip = ctx.rand() < skipPct && b > 0 && b < bands - 1;
      if (!skip) ctx.poly(pts, color ? color(b, i) : ctx.col(b * 2 + i * 3), { loose });
    }
  }
}

function interpolate(points) {
  return (t) => {
    for (let i = 1; i < points.length; i++) {
      if (t <= points[i][0]) {
        const [t0, w0] = points[i - 1];
        const [t1, w1] = points[i];
        return w0 + ((w1 - w0) * (t - t0)) / (t1 - t0 || 1);
      }
    }
    return points[points.length - 1][1];
  };
}

// Alternating outer and inner points of an n-pointed star.
function starPoints(cx, cy, R, r, n, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) pts.push(pol(cx, cy, i % 2 === 0 ? R : r, rot + (i * Math.PI) / n));
  return pts;
}

// The part of a circle between two horizontal lines, as a polygon.
function circleBand(cx, cy, r, y0, y1, steps = 5) {
  const half = (y) => Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)));
  const left = [];
  const right = [];
  for (let k = 0; k <= steps; k++) {
    const y = y0 + ((y1 - y0) * k) / steps;
    left.push([cx - half(y), y]);
    right.unshift([cx + half(y), y]);
  }
  return left.concat(right);
}

const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function rotRect(cx, cy, w, h, rot) {
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
}

// A rolling skyline: sampled sine hills closed off at `bottom`.
function curvePoly(x0, x1, base, amp, freq, phase, bottom) {
  const pts = [];
  for (let x = x0; x <= x1; x += 12) pts.push([x, base - amp * (0.5 + 0.5 * Math.sin(freq * x + phase))]);
  pts.push([x1, bottom], [x0, bottom]);
  return pts;
}

// Repeats fn(angle, index) n times around a centre.
function radial(n, fn, rot = 0) {
  for (let i = 0; i < n; i++) fn(rot + (i * TAU) / n, i);
}

// An annular sector as a polygon.
function arcBand(cx, cy, r0, r1, a0, a1, steps = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.3))) {
  const outer = [];
  const inner = [];
  for (let k = 0; k <= steps; k++) {
    const a = a0 + ((a1 - a0) * k) / steps;
    outer.push(pol(cx, cy, r1, a));
    inner.unshift(pol(cx, cy, r0, a));
  }
  return outer.concat(inner);
}

// A smooth, wobbly closed shape around a centre. Stays within r * (1 + wobble) of it.
function blob(ctx, cx, cy, r, wobble, fill, n = 7) {
  const rot = ctx.rand() * TAU;
  const pts = Array.from({ length: n }, (_, i) => pol(cx, cy, r * (1 + (ctx.rand() * 2 - 1) * wobble), rot + (i * TAU) / n));
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[n - 1], pts[0]);
  let d = `M${fmt(start[0])} ${fmt(start[1])}`;
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % n]);
    d += `Q${fmt(p[0])} ${fmt(p[1])} ${fmt(m[0])} ${fmt(m[1])}`;
  });
  const reach = r * (1 + wobble);
  ctx.shape(d + 'Z', fill, cx, cy, [cx - reach, cy - reach, cx + reach, cy + reach]);
}

// A grid of dots inside area [x, y, w, h]. Dots are grouped `group` x `group` per part, so the piece count stays low.
// sizeFn(x, y, i, j) gives a radius (0 skips the dot) and colorFn(x, y, i, j) a fill.
function dotField(ctx, [x0, y0, w, h], spacing, sizeFn, colorFn, group = 3) {
  const cols = Math.max(1, Math.floor(w / spacing));
  const rows = Math.max(1, Math.floor(h / spacing));
  for (let gj = 0; gj < rows; gj += group) {
    for (let gi = 0; gi < cols; gi += group) {
      let svg = '';
      let b = [Infinity, Infinity, -Infinity, -Infinity];
      for (let j = gj; j < Math.min(rows, gj + group); j++) {
        for (let i = gi; i < Math.min(cols, gi + group); i++) {
          const x = x0 + spacing * (i + 0.5);
          const y = y0 + spacing * (j + 0.5);
          const r = sizeFn(x, y, i, j);
          if (!(r > 0)) continue;
          svg += `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${colorFn(x, y, i, j)}"/>`;
          b = [Math.min(b[0], x - r), Math.min(b[1], y - r), Math.max(b[2], x + r), Math.max(b[3], y + r)];
        }
      }
      if (svg) ctx.raw(svg, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b);
    }
  }
}

// Wavy bands across area [x, y, w, h]. wave(x, k) gives the vertical shift of band edge k at x.
function stripes(ctx, [x0, y0, w, h], count, wave, colorFn, steps = 8) {
  const edge = (k) => Array.from({ length: steps + 1 }, (_, s) => {
    const x = x0 + (w * s) / steps;
    return [x, y0 + (h * k) / count + wave(x, k)];
  });
  for (let k = 0; k < count; k++) ctx.poly(edge(k).concat(edge(k + 1).reverse()), colorFn(k), { inset: 1, still: true });
}

module.exports = { radial, arcBand, blob, dotField, stripes, rectPts, rotRect, curvePoly, COLORS, COLOR_NAMES, GREENS, TAU, fmt, pol, makeRand, createContext, slice, interpolate, starPoints, circleBand };
