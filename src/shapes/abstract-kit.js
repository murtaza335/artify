'use strict';

// Shared helpers for the abstract forms: a framed panel that clips what is drawn on it, colours that never
// match each other or the ground, and bundles that keep many small marks in one puzzle piece.

const { fmt, rectPts } = require('./engine');

const R = rectPts;
const still = { inset: 1, still: true };
const FRAME = [14, 48, 212, 298];
const X0 = 14;
const Y0 = 48;
const X1 = 226;
const Y1 = 346;
const CX = 120;
const CY = 197;

// The picture ground. Everything drawn after it is clipped to the frame.
function panel(ctx, fill) {
  ctx.bg = fill;
  ctx.poly(R(X0, Y0, X1 - X0, Y1 - Y0), fill, still);
  ctx.clipTo(FRAME);
}

// A thin border inside the frame.
function frame(ctx, color, t = 5) {
  [[X0, Y0, X1 - X0, t], [X0, Y1 - t, X1 - X0, t], [X0, Y0, t, Y1 - Y0], [X1 - t, Y0, t, Y1 - Y0]].forEach(([x, y, w, h]) => ctx.poly(R(x, y, w, h), color, still));
}

// Two colours read as the same when they are this close, like the light palette's white and cream.
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const close = (a, b) => {
  const [p, q] = [rgb(a), rgb(b)];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 48;
};

// n palette colours, clearly different from each other and from every colour in `avoid`. Stepping by three
// walks the whole palette of eight, so the result only repeats when the palette runs out.
function hues(ctx, n, avoid = []) {
  const out = [];
  let k = ctx.int(0, 7);
  for (let i = 0; i < 8 && out.length < n; i++, k += 3) {
    const c = ctx.col(k);
    if (!avoid.some((a) => close(a, c)) && !out.some((o) => close(o, c))) out.push(c);
  }
  for (let i = 0; out.length < n; i++) out.push(out[i % Math.max(1, out.length)] || ctx.ink);
  return out;
}

// A ground colour: usually cream, sometimes ink or a palette colour.
function ground(ctx) {
  const r = ctx.rand();
  return r < 0.45 ? ctx.colors[1] : r < 0.6 ? ctx.ink : ctx.col(ctx.int(0, 7));
}

// Many small marks as one piece. `svg` is raw markup; `b` its bounds.
function bundle(ctx, svg, b) {
  if (svg) ctx.raw(svg, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b);
}

// Marks are collected with add(svg, x, y, r) and flushed as one piece every `size` marks.
function batcher(ctx, size = 12) {
  let svg = '';
  let b = [Infinity, Infinity, -Infinity, -Infinity];
  let n = 0;
  const flush = () => {
    bundle(ctx, svg, b);
    svg = '';
    b = [Infinity, Infinity, -Infinity, -Infinity];
    n = 0;
  };
  const add = (markup, x0, y0, x1, y1) => {
    svg += markup;
    b = [Math.min(b[0], x0), Math.min(b[1], y0), Math.max(b[2], x1), Math.max(b[3], y1)];
    if (++n >= size) flush();
  };
  return { add, flush };
}

const pts = (list) => list.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ');
const pathOf = (list, close = false) => 'M' + list.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L') + (close ? ' Z' : '');
const boundsOf = (list) => [Math.min(...list.map((p) => p[0])), Math.min(...list.map((p) => p[1])), Math.max(...list.map((p) => p[0])), Math.max(...list.map((p) => p[1]))];

// A polyline as a stroke part.
function polyline(ctx, list, color, width, extra = '') {
  const b = boundsOf(list);
  ctx.raw(`<path d="${pathOf(list)}" fill="none" stroke="${color}" stroke-width="${fmt(width)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, [b[0] - width, b[1] - width, b[2] + width, b[3] + width]);
}

// A filled polygon with an opacity, for veils and overlapping planes.
function veil(ctx, list, color, opacity) {
  const b = boundsOf(list);
  ctx.raw(`<polygon points="${pts(list)}" fill="${color}" opacity="${opacity}"/>`, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b);
}

// A circle with an opacity.
function glow(ctx, x, y, r, color, opacity) {
  ctx.raw(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${color}" opacity="${opacity}"/>`, x, y, [x - r, y - r, x + r, y + r]);
}

// An outlined circle.
function ring(ctx, x, y, r, color, width) {
  ctx.raw(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="none" stroke="${color}" stroke-width="${fmt(width)}"/>`, x, y, [x - r - width, y - r - width, x + r + width, y + r + width]);
}

// A small deterministic value noise in 0..1, smooth in x and y, for flow fields and ridgelines.
function noise2(seed) {
  const h = (i, j) => {
    const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const sm = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const u = sm(x - i);
    const v = sm(y - j);
    const a = h(i, j) + (h(i + 1, j) - h(i, j)) * u;
    const c = h(i, j + 1) + (h(i + 1, j + 1) - h(i, j + 1)) * u;
    return a + (c - a) * v;
  };
}

module.exports = { R, still, FRAME, X0, Y0, X1, Y1, CX, CY, panel, frame, hues, ground, bundle, batcher, pts, pathOf, boundsOf, polyline, veil, glow, ring, noise2 };
