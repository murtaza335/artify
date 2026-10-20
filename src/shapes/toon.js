'use strict';

// A small kit for anime and cartoon forms: theme-aware skin and hair colours, layered anime eyes, cartoon eyes,
// brows, mouths, hair, manga marks, expressions, ready-made heads and a jointed body. Every helper emits one part
// per feature (a grouped SVG), which keeps detailed faces inside the piece budget. No form lives in this file.
// All characters are original archetypes, never copies of an existing character.

const { TAU, fmt, pol, rectPts } = require('./engine');

const R = rectPts;

const SKINS = {
  dark: ['#F6D5B8', '#E9B58F', '#C98B62', '#F9E3D0'],
  light: ['#F2C9A5', '#E0A57A', '#B87A52', '#EDBE96']
};
const HAIRS = {
  dark: ['#E9A93B', '#F79BB0', '#62C3E3', '#FFF0B8', '#9BDB8A', '#E5534B', '#B9A7FF', '#C86B8C'],
  light: ['#12202A', '#D83A2E', '#1E7B8F', '#F28FA6', '#F5C518', '#3F95C4', '#7A5CD1', '#8A4B2A']
};

const skinTones = (ctx) => SKINS[ctx.kind] || SKINS.dark;
const hairTones = (ctx) => HAIRS[ctx.kind] || HAIRS.dark;

const parseHex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, t) {
  const A = parseHex(a);
  const B = parseHex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

const distance = (a, b) => Math.hypot(...parseHex(a).map((v, i) => v - parseHex(b)[i]));

/**
 * Keeps a colour clear of the ones it sits on, so a body, a robot or a head of hair never vanishes into its panel.
 * Walks the pool from the colour's own place and returns the first one far enough from everything in `avoid`.
 * It uses no randomness, so the rest of a seed stays the same.
 */
function apart(ctx, color, avoid, pool = ctx.colors, min = 80) {
  const away = [].concat(avoid).filter((c) => typeof c === 'string' && c[0] === '#');
  const clear = (c) => away.every((a) => distance(c, a) >= min);
  if (clear(color)) return color;
  const start = Math.max(0, pool.indexOf(color));
  for (let i = 1; i < pool.length; i++) {
    const c = pool[(start + i) % pool.length];
    if (clear(c)) return c;
  }
  return color;
}

// Adds one grouped part with a box of half-width hw and half-height hh around (cx, cy).
const grp = (ctx, svg, cx, cy, hw, hh) => ctx.raw(svg, cx, cy, [cx - hw, cy - hh, cx + hw, cy + hh]);

const stroke = (d, color, w) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${fmt(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ell = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="${fill}"${extra}/>`;

// ---------------------------------------------------------------------------
// Eyes
// ---------------------------------------------------------------------------

/**
 * A layered anime eye: white, banded iris, pupil, two highlights and a thick upper lash line.
 * look is [-1..1, -1..1]; lid covers that fraction of the top; closed is 'up' (happy), 'down' or 'flat'; mirror is -1 on the left eye.
 */
function animeEye(ctx, cx, cy, w, h, { iris = ctx.col(2), look = [0, 0], lid = 0, closed = null, mirror = 1, skin = '#F6D5B8', lash = true, size = 1 } = {}) {
  const ink = ctx.ink;
  const lw = Math.max(3, w * 0.12);
  let svg = '';
  if (closed) {
    const dy = closed === 'up' ? -h * 0.45 : closed === 'down' ? h * 0.35 : 0;
    svg = stroke(`M${fmt(cx - w / 2)} ${fmt(cy)} Q${fmt(cx)} ${fmt(cy + dy)} ${fmt(cx + w / 2)} ${fmt(cy)}`, ink, lw);
  } else {
    const ix = cx + look[0] * w * 0.1;
    const iy = cy + look[1] * h * 0.08 + h * 0.03;
    const rx = w * 0.3 * size;
    const ry = h * 0.43 * size;
    svg += ell(cx, cy, w / 2, h / 2, ctx.colors[1]);
    svg += ell(ix, iy, rx, ry, mix(iris, ink, 0.45));
    svg += ell(ix, iy + ry * 0.2, rx * 0.86, ry * 0.7, iris);
    svg += ell(ix, iy + ry * 0.38, rx * 0.7, ry * 0.4, mix(iris, '#FFFFFF', 0.4));
    svg += ell(ix, iy - ry * 0.05, rx * 0.4, ry * 0.45, ink);
    svg += `<circle cx="${fmt(ix - rx * 0.4)}" cy="${fmt(iy - ry * 0.45)}" r="${fmt(w * 0.085)}" fill="#FFFFFF"/>`;
    svg += `<circle cx="${fmt(ix + rx * 0.45)}" cy="${fmt(iy + ry * 0.45)}" r="${fmt(w * 0.04)}" fill="#FFFFFF"/>`;
    const top = `M${fmt(cx - w / 2 - 2)} ${fmt(cy + h * 0.08)} Q${fmt(cx)} ${fmt(cy - h * 0.66)} ${fmt(cx + w / 2 + 2)} ${fmt(cy + h * 0.04)}`;
    if (lid > 0) {
      const yl = cy - h / 2 + lid * h;
      svg += `<path d="M${fmt(cx - w / 2 - 3)} ${fmt(yl)} L${fmt(cx - w / 2 - 3)} ${fmt(cy - h * 0.7)} L${fmt(cx + w / 2 + 3)} ${fmt(cy - h * 0.7)} L${fmt(cx + w / 2 + 3)} ${fmt(yl)} Z" fill="${skin}"/>`;
      svg += stroke(`M${fmt(cx - w / 2 - 2)} ${fmt(yl)} L${fmt(cx + w / 2 + 2)} ${fmt(yl)}`, ink, lw);
    } else {
      svg += stroke(top, ink, lw);
    }
    if (lash) {
      const ox = cx + mirror * (w / 2 + 2);
      svg += stroke(`M${fmt(ox)} ${fmt(cy + h * 0.02)} L${fmt(ox + mirror * w * 0.16)} ${fmt(cy - h * 0.16)}`, ink, lw * 0.8);
    }
  }
  grp(ctx, svg, cx, cy, w / 2 + w * 0.25, h / 2 + 6);
}

/** A round cartoon eye with an ink outline; pie cuts a wedge out of the pupil. */
function cartoonEye(ctx, cx, cy, rx, ry, { look = [0, 0], pie = false, lw = 3 } = {}) {
  const ink = ctx.ink;
  const px = cx + look[0] * rx * 0.35;
  const py = cy + look[1] * ry * 0.3;
  let svg = ell(cx, cy, rx, ry, '#FFFFFF', ` stroke="${ink}" stroke-width="${lw}"`);
  svg += ell(px, py, rx * 0.36, ry * 0.4, ink);
  if (pie) svg += `<polygon points="${fmt(px)},${fmt(py)} ${fmt(px + rx * 0.4)},${fmt(py - ry * 0.12)} ${fmt(px + rx * 0.3)},${fmt(py - ry * 0.42)}" fill="#FFFFFF"/>`;
  else svg += `<circle cx="${fmt(px - rx * 0.12)}" cy="${fmt(py - ry * 0.14)}" r="${fmt(rx * 0.1)}" fill="#FFFFFF"/>`;
  grp(ctx, svg, cx, cy, rx + lw, ry + lw);
}

// ---------------------------------------------------------------------------
// Brows and mouths
// ---------------------------------------------------------------------------

function brows(ctx, cx, y, dx, w, kind, color = ctx.ink) {
  const t = Math.max(2.5, w * 0.1);
  const one = (side, k) => {
    const x0 = cx + side * dx - w / 2;
    const x1 = cx + side * dx + w / 2;
    const [inner, outer] = side < 0 ? [x1, x0] : [x0, x1];
    const rise = { calm: [0, 0], angry: [8, -4], worried: [-7, 5], raised: [-5, -5], smug: [-8, -2] }[k] || [0, 0];
    const arch = k === 'calm' || k === 'raised' ? -w * 0.18 : 0;
    return stroke(`M${fmt(outer)} ${fmt(y + rise[1])} Q${fmt((inner + outer) / 2)} ${fmt(y + arch + (rise[0] + rise[1]) / 2)} ${fmt(inner)} ${fmt(y + rise[0])}`, color, t);
  };
  const [kl, kr] = Array.isArray(kind) ? kind : [kind, kind];
  grp(ctx, one(-1, kl) + one(1, kr), cx, y, dx + w / 2 + 3, 16);
}

function mouth(ctx, cx, cy, w, kind, { color = ctx.ink, tongue = ctx.col(3) } = {}) {
  const t = Math.max(2.5, w * 0.1);
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  let svg = '';
  if (kind === 'smile') svg = stroke(`M${fmt(x0)} ${fmt(cy)} Q${fmt(cx)} ${fmt(cy + w * 0.5)} ${fmt(x1)} ${fmt(cy)}`, color, t);
  else if (kind === 'grin') {
    svg = `<path d="M${fmt(x0)} ${fmt(cy)} Q${fmt(cx)} ${fmt(cy + w * 0.85)} ${fmt(x1)} ${fmt(cy)} Z" fill="${color}"/>`;
    svg += ell(cx, cy + w * 0.34, w * 0.24, w * 0.12, tongue);
    svg += `<path d="M${fmt(x0 + 2)} ${fmt(cy + 1)} L${fmt(x1 - 2)} ${fmt(cy + 1)} L${fmt(x1 - w * 0.12)} ${fmt(cy + w * 0.12)} L${fmt(x0 + w * 0.12)} ${fmt(cy + w * 0.12)} Z" fill="#FFFFFF"/>`;
  } else if (kind === 'fang') {
    svg = stroke(`M${fmt(x0)} ${fmt(cy)} Q${fmt(cx)} ${fmt(cy + w * 0.35)} ${fmt(x1)} ${fmt(cy - 2)}`, color, t);
    svg += `<polygon points="${fmt(cx + w * 0.14)},${fmt(cy + w * 0.16)} ${fmt(cx + w * 0.3)},${fmt(cy + w * 0.12)} ${fmt(cx + w * 0.24)},${fmt(cy + w * 0.34)}" fill="#FFFFFF" stroke="${color}" stroke-width="1.6"/>`;
  } else if (kind === 'cat') svg = stroke(`M${fmt(x0)} ${fmt(cy)} Q${fmt(cx - w / 4)} ${fmt(cy + w * 0.3)} ${fmt(cx)} ${fmt(cy)} Q${fmt(cx + w / 4)} ${fmt(cy + w * 0.3)} ${fmt(x1)} ${fmt(cy)}`, color, t);
  else if (kind === 'flat') svg = stroke(`M${fmt(x0)} ${fmt(cy)} L${fmt(x1)} ${fmt(cy)}`, color, t);
  else if (kind === 'o') svg = ell(cx, cy + w * 0.1, w * 0.2, w * 0.3, color);
  else if (kind === 'wavy') svg = stroke(`M${fmt(x0)} ${fmt(cy)} q${fmt(w / 6)} ${fmt(-w * 0.18)} ${fmt(w / 3)} 0 t${fmt(w / 3)} 0 t${fmt(w / 3)} 0`, color, t);
  else if (kind === 'smirk') svg = stroke(`M${fmt(x0)} ${fmt(cy + w * 0.1)} Q${fmt(cx)} ${fmt(cy + w * 0.2)} ${fmt(x1)} ${fmt(cy - w * 0.12)}`, color, t);
  else if (kind === 'shout') {
    svg = ell(cx, cy + w * 0.2, w * 0.42, w * 0.38, color);
    svg += ell(cx, cy + w * 0.36, w * 0.28, w * 0.16, tongue);
  } else svg = stroke(`M${fmt(x0)} ${fmt(cy)} Q${fmt(cx)} ${fmt(cy - w * 0.25)} ${fmt(x1)} ${fmt(cy)}`, color, t);
  grp(ctx, svg, cx, cy + w * 0.2, w / 2 + 4, w * 0.6);
}

// ---------------------------------------------------------------------------
// Manga marks
// ---------------------------------------------------------------------------

function sparkle(ctx, x, y, r, color) {
  ctx.poly([[x, y - r], [x + r * 0.25, y - r * 0.25], [x + r, y], [x + r * 0.25, y + r * 0.25], [x, y + r], [x - r * 0.25, y + r * 0.25], [x - r, y], [x - r * 0.25, y - r * 0.25]], color, { inset: 1, still: true });
}

function sparkles(ctx, n, color, area = [20, 60, 220, 330], keepOut = null) {
  let placed = 0;
  for (let tries = 0; tries < n * 6 && placed < n; tries++) {
    const x = ctx.between(area[0], area[2]);
    const y = ctx.between(area[1], area[3]);
    if (keepOut && keepOut(x, y)) continue;
    sparkle(ctx, x, y, ctx.between(5, 13), color || ctx.pick([ctx.colors[1], ctx.colors[0]]));
    placed++;
  }
}

function sweatDrop(ctx, x, y, s = 1, color = ctx.col(5)) {
  ctx.shape(`M${fmt(x)} ${fmt(y - 12 * s)} Q${fmt(x + 9 * s)} ${fmt(y + 2 * s)} ${fmt(x)} ${fmt(y + 10 * s)} Q${fmt(x - 9 * s)} ${fmt(y + 2 * s)} ${fmt(x)} ${fmt(y - 12 * s)} Z`, color, x, y, [x - 9 * s, y - 12 * s, x + 9 * s, y + 10 * s]);
}

function angerVein(ctx, x, y, s = 1, color = ctx.col(3)) {
  const a = 12 * s;
  const b = 4 * s;
  const d = [[-a, -b, -b, -a], [a, -b, b, -a], [-a, b, -b, a], [a, b, b, a]].map(([x1, y1, x2, y2]) => `M${fmt(x + x1)} ${fmt(y + y1)} Q${fmt(x + x2 * 0.6)} ${fmt(y + y1 * 0.6)} ${fmt(x + x2)} ${fmt(y + y2)}`).join(' ');
  ctx.stroke(d, color, 3 * Math.max(0.8, s), x, y, [x - a, y - a, x + a, y + a]);
}

function blush(ctx, cx, cy, w, color = ctx.col(6)) {
  let svg = ell(cx, cy, w / 2, w * 0.28, color, ' fill-opacity="0.65"');
  for (let i = -1; i <= 1; i++) svg += `<line x1="${fmt(cx + i * w * 0.22 - 3)}" y1="${fmt(cy + w * 0.1)}" x2="${fmt(cx + i * w * 0.22 + 3)}" y2="${fmt(cy - w * 0.1)}" stroke="${mix(color, '#E5534B', 0.4)}" stroke-width="1.8" stroke-linecap="round"/>`;
  grp(ctx, svg, cx, cy, w / 2 + 2, w * 0.3);
}

function tears(ctx, x, y, len, color = ctx.col(5)) {
  ctx.shape(`M${fmt(x)} ${fmt(y)} q${fmt(-len * 0.1)} ${fmt(len * 0.6)} ${fmt(len * 0.05)} ${fmt(len)} q${fmt(len * 0.15)} ${fmt(-len * 0.1)} ${fmt(len * 0.1)} ${fmt(-len * 0.4)} q${fmt(len * 0.05)} ${fmt(-len * 0.3)} ${fmt(-len * 0.15)} ${fmt(-len * 0.6)} Z`, color, x, y + len / 2, [x - len * 0.2, y, x + len * 0.3, y + len]);
}

function zzz(ctx, x, y, s, color) {
  let svg = '';
  [[0, 0, 1], [14, -16, 0.75], [26, -28, 0.55]].forEach(([dx, dy, k]) => {
    const z = 12 * s * k;
    svg += stroke(`M${fmt(x + dx * s)} ${fmt(y + dy * s)} h${fmt(z)} l${fmt(-z)} ${fmt(z)} h${fmt(z)}`, color, 3.2 * Math.max(0.7, k));
  });
  grp(ctx, svg, x + 16 * s, y - 10 * s, 26 * s, 26 * s);
}

/** Radial lines that taper toward the centre, grouped into three parts so they still scatter when the form reforms. */
function speedLines(ctx, cx, cy, r0, r1, n, color, { spread = 0.05, jitter = 0.35, area = [4, 4, 236, 376] } = {}) {
  const groups = ['', '', ''];
  const clampX = (v) => Math.max(area[0], Math.min(area[2], v));
  const clampY = (v) => Math.max(area[1], Math.min(area[3], v));
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n + ctx.between(-jitter, jitter) * (TAU / n);
    const len = r1 * ctx.between(0.78, 1);
    const pts = [pol(cx, cy, len, a - spread), pol(cx, cy, r0, a), pol(cx, cy, len, a + spread)].map(([x, y]) => `${fmt(clampX(x))},${fmt(clampY(y))}`).join(' ');
    groups[i % 3] += `<polygon points="${pts}" fill="${color}"/>`;
  }
  groups.forEach((svg) => svg && ctx.raw(svg, cx, cy, [area[0], area[1], area[2], area[3]]));
}

// ---------------------------------------------------------------------------
// Faces and heads
// ---------------------------------------------------------------------------

/** Eyes, brows, mouth and marks for an expression. f: { x, y, s, skin, iris, style, mirror }. */
function emotion(ctx, f, kind) {
  const { x, y, s, skin, iris } = f;
  const cartoon = f.style === 'cartoon';
  const ex = (cartoon ? 24 : 24) * s;
  const ey = y + 10 * s;
  const ew = 32 * s;
  const eh = 38 * s;
  const eyeSet = { happy: { closed: 'up' }, angry: { look: [0, 0.2], size: 0.95 }, shocked: { size: 0.65, look: [0, -0.2] }, sad: { look: [0, 0.8], lid: 0.12 }, smug: { lid: 0.42, look: [0.6, 0] }, sleepy: { closed: 'flat' }, excited: { size: 1.12 }, shy: { look: [-0.9, 0.5] }, calm: {} }[kind] || {};
  for (const side of [-1, 1]) {
    if (cartoon) cartoonEye(ctx, x + side * ex, ey - 4 * s, 15 * s, 19 * s, { look: eyeSet.look ? [eyeSet.look[0], eyeSet.look[1]] : [0.2, 0], pie: f.pie });
    else animeEye(ctx, x + side * ex, ey, ew, eh, { iris, skin, mirror: side, ...eyeSet });
  }
  const browKind = { happy: 'calm', angry: 'angry', shocked: 'raised', sad: 'worried', smug: ['raised', 'angry'], sleepy: 'calm', excited: 'raised', shy: 'worried', calm: 'calm' }[kind];
  brows(ctx, x, ey - 24 * s, ex, 24 * s, browKind);
  const mouthKind = { happy: 'grin', angry: 'fang', shocked: 'o', sad: 'wavy', smug: 'smirk', sleepy: 'o', excited: 'grin', shy: 'wavy', calm: 'smile' }[kind];
  mouth(ctx, x, y + 38 * s, (kind === 'excited' ? 26 : 18) * s, mouthKind);
  if (kind === 'happy' || kind === 'shy' || kind === 'excited') for (const side of [-1, 1]) blush(ctx, x + side * 33 * s, y + 28 * s, 18 * s);
  if (kind === 'angry') angerVein(ctx, x + 34 * s, y - 42 * s, 0.8 * s);
  if (kind === 'shocked' || kind === 'shy') sweatDrop(ctx, x + 50 * s, y - 20 * s, s);
  if (kind === 'sad') for (const side of [-1, 1]) tears(ctx, x + side * 26 * s, ey + 14 * s, 36 * s);
  if (kind === 'sleepy') zzz(ctx, x + 42 * s, y - 34 * s, s * 0.8, ctx.colors[1]);
}

function faceBase(ctx, x, y, s, skin, shape = 'anime', outline = false) {
  const w = (shape === 'chibi' ? 100 : 92) * s;
  const h = (shape === 'chibi' ? 94 : 108) * s;
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const t = y - h * 0.5;
  const ink = outline ? ` stroke="${ctx.ink}" stroke-width="3.5"` : '';
  let d;
  if (shape === 'chibi') d = `M${fmt(x0)} ${fmt(y)} C${fmt(x0)} ${fmt(t - h * 0.1)} ${fmt(x1)} ${fmt(t - h * 0.1)} ${fmt(x1)} ${fmt(y)} C${fmt(x1)} ${fmt(y + h * 0.5)} ${fmt(x0)} ${fmt(y + h * 0.5)} ${fmt(x0)} ${fmt(y)} Z`;
  else d = `M${fmt(x0)} ${fmt(y - h * 0.1)} C${fmt(x0)} ${fmt(t - h * 0.1)} ${fmt(x1)} ${fmt(t - h * 0.1)} ${fmt(x1)} ${fmt(y - h * 0.1)} C${fmt(x1)} ${fmt(y + h * 0.22)} ${fmt(x + w * 0.2)} ${fmt(y + h * 0.5)} ${fmt(x)} ${fmt(y + h * 0.5)} C${fmt(x - w * 0.2)} ${fmt(y + h * 0.5)} ${fmt(x0)} ${fmt(y + h * 0.22)} ${fmt(x0)} ${fmt(y - h * 0.1)} Z`;
  grp(ctx, `<path d="${d}" fill="${skin}"${ink}/>`, x, y, w / 2 + 3, h / 2 + 3);
  // Ears and a small nose.
  for (const side of [-1, 1]) grp(ctx, ell(x + side * w * 0.5, y + 4 * s, 7 * s, 11 * s, mix(skin, '#E5534B', 0.12), outline ? ` stroke="${ctx.ink}" stroke-width="3"` : ''), x + side * w * 0.5, y + 4 * s, 10 * s, 14 * s);
}

// Hair behind the head. Style: spiky, bob, twin, long, pony or messy.
function hairBack(ctx, x, y, s, color, style) {
  const dark = mix(color, ctx.ink, 0.2);
  if (style === 'spiky' || style === 'messy') {
    const n = style === 'spiky' ? 7 : 9;
    const pts = [];
    for (let i = 0; i <= n * 2; i++) {
      const a = Math.PI * 1.03 + (i * Math.PI * 0.94) / (n * 2);
      const tip = i % 2 === 1;
      const r = tip ? (style === 'spiky' ? 1.35 : 1.2) * 60 * s * ctx.between(0.88, 1.08) : 60 * s;
      pts.push(pol(x, y - 4 * s, r, a + (tip ? ctx.between(-0.1, 0.1) : 0)));
    }
    pts.push([x + 58 * s, y + 6 * s], [x - 58 * s, y + 6 * s]);
    ctx.poly(pts, color, { inset: 1, still: true });
    return;
  }
  ctx.ellipse(x, y - 14 * s, 58 * s, 54 * s, color);
  if (style === 'bob') ctx.shape(`M${fmt(x - 62 * s)} ${fmt(y - 10 * s)} Q${fmt(x - 70 * s)} ${fmt(y + 42 * s)} ${fmt(x - 50 * s)} ${fmt(y + 46 * s)} L${fmt(x + 50 * s)} ${fmt(y + 46 * s)} Q${fmt(x + 70 * s)} ${fmt(y + 42 * s)} ${fmt(x + 62 * s)} ${fmt(y - 10 * s)} Z`, color, x, y + 18 * s, [x - 70 * s, y - 10 * s, x + 70 * s, y + 46 * s]);
  else if (style === 'long') ctx.shape(`M${fmt(x - 62 * s)} ${fmt(y - 10 * s)} Q${fmt(x - 80 * s)} ${fmt(y + 60 * s)} ${fmt(x - 66 * s)} ${fmt(y + 106 * s)} L${fmt(x + 66 * s)} ${fmt(y + 106 * s)} Q${fmt(x + 80 * s)} ${fmt(y + 70 * s)} ${fmt(x + 62 * s)} ${fmt(y - 10 * s)} Z`, dark, x, y + 60 * s, [x - 80 * s, y - 10 * s, x + 80 * s, y + 106 * s]);
  else if (style === 'twin') {
    for (const side of [-1, 1]) {
      ctx.stroke(`M${fmt(x + side * 54 * s)} ${fmt(y - 14 * s)} Q${fmt(x + side * 70 * s)} ${fmt(y + 30 * s)} ${fmt(x + side * 62 * s)} ${fmt(y + 96 * s)}`, color, 22 * s, x + side * 76 * s, y + 40 * s, [Math.min(x + side * 44 * s, x + side * 80 * s) - 12, y - 14 * s, Math.max(x + side * 44 * s, x + side * 80 * s) + 12, y + 100 * s]);
      ctx.circ(x + side * 58 * s, y - 20 * s, 9 * s, ctx.col(3));
    }
  } else if (style === 'pony') ctx.stroke(`M${fmt(x + 40 * s)} ${fmt(y - 52 * s)} Q${fmt(x + 96 * s)} ${fmt(y - 80 * s)} ${fmt(x + 84 * s)} ${fmt(y + 40 * s)} Q${fmt(x + 76 * s)} ${fmt(y + 80 * s)} ${fmt(x + 62 * s)} ${fmt(y + 66 * s)}`, color, 22 * s, x + 80 * s, y, [x + 30 * s, y - 74 * s, x + 104 * s, y + 84 * s]);
}

// The fringe and side locks, drawn over the face.
function hairFront(ctx, x, y, s, color, style) {
  const light = mix(color, '#FFFFFF', 0.28);
  const n = style === 'spiky' || style === 'messy' ? 5 : 4;
  const tipLow = style === 'bob' || style === 'long' || style === 'twin' ? 2 : 14;
  const pts = [[x - 52 * s, y - 20 * s], [x - 50 * s, y - 56 * s], [x, y - 72 * s], [x + 50 * s, y - 56 * s], [x + 52 * s, y - 20 * s]];
  for (let i = n; i >= 0; i--) {
    const px = x - 52 * s + (i * 104 * s) / n;
    pts.push([px, y - 24 * s + (i % 2 ? tipLow * s * ctx.between(0.7, 1.3) : -6 * s)]);
  }
  ctx.poly(pts, color, { inset: 1, still: true });
  ctx.poly([[x - 28 * s, y - 62 * s], [x - 8 * s, y - 66 * s], [x - 20 * s, y - 44 * s]], light, { inset: 1, still: true });
  if (style === 'bob' || style === 'long' || style === 'twin' || style === 'pony') {
    for (const side of [-1, 1]) ctx.poly([[x + side * 48 * s, y - 30 * s], [x + side * 58 * s, y - 20 * s], [x + side * 56 * s, y + 40 * s], [x + side * 44 * s, y + 8 * s]], color, { inset: 1, still: true });
  }
}

function accessory(ctx, kind, x, y, s, hair) {
  if (kind === 'headband') {
    ctx.poly([[x - 56 * s, y - 36 * s], [x + 56 * s, y - 36 * s], [x + 56 * s, y - 26 * s], [x - 56 * s, y - 26 * s]], ctx.col(3), { inset: 1, still: true });
    ctx.circ(x, y - 31 * s, 7 * s, ctx.colors[0]);
  } else if (kind === 'ribbon') {
    ctx.poly([[x + 38 * s, y - 62 * s], [x + 70 * s, y - 76 * s], [x + 66 * s, y - 50 * s]], ctx.col(3), { inset: 1, still: true });
    ctx.poly([[x + 38 * s, y - 62 * s], [x + 8 * s, y - 80 * s], [x + 12 * s, y - 50 * s]], ctx.col(3), { inset: 1, still: true });
    ctx.circ(x + 38 * s, y - 62 * s, 6 * s, ctx.colors[0]);
  } else if (kind === 'catEars' || kind === 'foxEars') {
    for (const side of [-1, 1]) {
      ctx.poly([[x + side * 20 * s, y - 62 * s], [x + side * 56 * s, y - 108 * s], [x + side * 58 * s, y - 52 * s]], hair, { inset: 1, still: true });
      ctx.poly([[x + side * 28 * s, y - 62 * s], [x + side * 50 * s, y - 92 * s], [x + side * 52 * s, y - 58 * s]], kind === 'foxEars' ? ctx.colors[1] : ctx.col(6), { inset: 1, still: true });
    }
  } else if (kind === 'horns') {
    for (const side of [-1, 1]) ctx.poly([[x + side * 30 * s, y - 66 * s], [x + side * 44 * s, y - 112 * s], [x + side * 50 * s, y - 58 * s]], ctx.colors[1], { inset: 1, still: true });
  } else if (kind === 'bandage') {
    // On the cheek, below the eye and outside the mouth.
    ctx.poly(rotRectLocal(x + 32 * s, y + 40 * s, 20 * s, 7 * s, 0.7), ctx.colors[1], { inset: 1, still: true });
    ctx.poly(rotRectLocal(x + 32 * s, y + 40 * s, 20 * s, 7 * s, -0.7), ctx.colors[1], { inset: 1, still: true });
  } else if (kind === 'glasses') {
    let svg = '';
    for (const side of [-1, 1]) svg += `<circle cx="${fmt(x + side * 22 * s)}" cy="${fmt(y + 8 * s)}" r="${fmt(19 * s)}" fill="none" stroke="${ctx.ink}" stroke-width="3"/>`;
    svg += `<line x1="${fmt(x - 4 * s)}" y1="${fmt(y + 8 * s)}" x2="${fmt(x + 4 * s)}" y2="${fmt(y + 8 * s)}" stroke="${ctx.ink}" stroke-width="3"/>`;
    grp(ctx, svg, x, y + 8 * s, 44 * s, 22 * s);
  }
}

function rotRectLocal(cx, cy, w, h, rot) {
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([px, py]) => [cx + px * Math.cos(rot) - py * Math.sin(rot), cy + px * Math.sin(rot) + py * Math.cos(rot)]);
}

/**
 * A whole anime head in one call. Options: x, y, s, skin, hair, style (hair), expr, iris, shape, accessories.
 * Returns anchor points so a body or props can be attached.
 */
/** Picks skin, hair, hair style and iris for a head, keeping skin and hair clear of the panel behind them. */
function headLook(ctx, o = {}) {
  const bg = o.bg || ctx.bg;
  const skin = apart(ctx, o.skin || ctx.pick(skinTones(ctx)), bg, skinTones(ctx), 50);
  const hair = apart(ctx, o.hair || ctx.pick(hairTones(ctx)), bg, hairTones(ctx));
  const style = o.style || ctx.pick(['spiky', 'bob', 'twin', 'long', 'pony', 'messy']);
  const iris = o.iris || ctx.col(ctx.int(0, 7));
  return { skin, hair, style, iris };
}

function animeHead(ctx, o = {}) {
  const s = o.s || 1;
  const x = o.x === undefined ? 120 : o.x;
  const y = o.y === undefined ? 190 : o.y;
  const { skin, hair, style, iris } = headLook(ctx, o);
  // A body drawn first can take the back hair itself (back: false), so long hair hangs behind the shoulders.
  if (o.back !== false) hairBack(ctx, x, y, s, hair, style);
  faceBase(ctx, x, y, s, skin, o.shape || 'anime', false);
  emotion(ctx, { x, y, s, skin, iris, style: 'anime' }, o.expr || 'calm');
  hairFront(ctx, x, y, s, hair, style);
  (o.accessories || []).forEach((a) => accessory(ctx, a, x, y, s, hair));
  return { x, y, s, skin, hair, style, top: y - 72 * s, chin: y + 54 * s };
}

/** A round cartoon head with an ink outline, big eyes, a nose and a mouth. */
function cartoonHead(ctx, o = {}) {
  const s = o.s || 1;
  const x = o.x === undefined ? 120 : o.x;
  const y = o.y === undefined ? 190 : o.y;
  const skin = o.skin || ctx.col(ctx.int(0, 7));
  const shape = o.shape || 'round';
  const w = (shape === 'pear' ? 84 : 96) * s;
  const h = (shape === 'bean' ? 92 : 100) * s;
  let d;
  if (shape === 'pear') d = `M${fmt(x)} ${fmt(y - h / 2)} C${fmt(x + w * 0.55)} ${fmt(y - h / 2)} ${fmt(x + w * 0.4)} ${fmt(y)} ${fmt(x + w * 0.65)} ${fmt(y + h * 0.28)} C${fmt(x + w * 0.8)} ${fmt(y + h * 0.7)} ${fmt(x - w * 0.8)} ${fmt(y + h * 0.7)} ${fmt(x - w * 0.65)} ${fmt(y + h * 0.28)} C${fmt(x - w * 0.4)} ${fmt(y)} ${fmt(x - w * 0.55)} ${fmt(y - h / 2)} ${fmt(x)} ${fmt(y - h / 2)} Z`;
  else d = `M${fmt(x - w / 2)} ${fmt(y)} C${fmt(x - w / 2)} ${fmt(y - h * 0.7)} ${fmt(x + w / 2)} ${fmt(y - h * 0.7)} ${fmt(x + w / 2)} ${fmt(y)} C${fmt(x + w / 2)} ${fmt(y + h * 0.7)} ${fmt(x - w / 2)} ${fmt(y + h * 0.7)} ${fmt(x - w / 2)} ${fmt(y)} Z`;
  grp(ctx, `<path d="${d}" fill="${skin}" stroke="${ctx.ink}" stroke-width="3.5"/>`, x, y, w * 0.8, h * 0.7);
  if (!o.bare) emotion(ctx, { x, y, s, skin, style: 'cartoon', pie: o.pie }, o.expr || 'happy');
  if (o.nose !== false && !o.bare) grp(ctx, ell(x, y + 18 * s, 10 * s, 7 * s, mix(skin, ctx.ink, 0.25), ` stroke="${ctx.ink}" stroke-width="2.4"`), x, y + 18 * s, 13 * s, 10 * s);
  return { x, y, s, skin, top: y - h / 2, chin: y + h / 2 };
}

// ---------------------------------------------------------------------------
// Bodies
// ---------------------------------------------------------------------------

// Angles are in degrees from straight down, positive toward the way the figure faces. Limbs are [upper, lower].
const POSES = {
  stand: { al: [-12, -8], ar: [12, 8], ll: [-6, -4], lr: [6, 4], lean: 0 },
  run: { al: [-55, -120], ar: [50, 100], ll: [-45, 20], lr: [38, -8], lean: 0.2 },
  punch: { al: [-60, -140], ar: [80, 90], ll: [-34, -14], lr: [30, 12], lean: 0.15 },
  jump: { al: [-150, -170], ar: [150, 170], ll: [-25, 35], lr: [25, -35], lean: 0 },
  cheer: { al: [-140, -170], ar: [140, 170], ll: [-12, -8], lr: [12, 8], lean: 0 },
  wave: { al: [-12, -8], ar: [120, 150], ll: [-6, -4], lr: [6, 4], lean: 0 },
  point: { al: [-18, -10], ar: [90, 95], ll: [-12, -6], lr: [12, 8], lean: 0.05 },
  sing: { al: [-120, -150], ar: [20, -170], ll: [-6, -4], lr: [6, 4], lean: 0 }
};

const joint = (p, len, deg) => [p[0] + Math.sin((deg * Math.PI) / 180) * len, p[1] + Math.cos((deg * Math.PI) / 180) * len];

/**
 * A simple jointed figure (legs, torso, arms, hands, shoes). o: x, y (hip), s, pose, flip, top, bottom, skin, skirt, outline.
 * Draw the head afterwards at the returned `head` anchor.
 */
function figure(ctx, o = {}) {
  const s = o.s || 1;
  const flip = o.flip ? -1 : 1;
  const p = POSES[o.pose || 'stand'];
  const top = apart(ctx, o.top || ctx.col(2), ctx.bg);
  const bottom = apart(ctx, o.bottom || ctx.col(4), ctx.bg);
  const skin = o.skin || skinTones(ctx)[0];
  const shoe = ctx.ink;
  const hip = [o.x === undefined ? 120 : o.x, o.y === undefined ? 250 : o.y];
  const lean = (p.lean || 0) * flip;
  const torso = 66 * s;
  const neck = [hip[0] + Math.sin(lean) * torso, hip[1] - Math.cos(lean) * torso];
  const A = (v) => v * flip;
  const lw = 12 * s;
  const limb = (a, b, c, color, width) => ctx.stroke(`M${fmt(a[0])} ${fmt(a[1])} L${fmt(b[0])} ${fmt(b[1])} L${fmt(c[0])} ${fmt(c[1])}`, color, width, b[0], b[1], [Math.min(a[0], b[0], c[0]) - width, Math.min(a[1], b[1], c[1]) - width, Math.max(a[0], b[0], c[0]) + width, Math.max(a[1], b[1], c[1]) + width]);
  const out = { hip, neck, hands: [], feet: [], top, bottom };
  out.head = [neck[0] + Math.sin(lean) * 12 * s, neck[1] - Math.cos(lean) * 14 * s];
  // Anything that belongs behind the body, such as long hair or a tail, is drawn here.
  if (o.behind) o.behind(out);
  const legs = [[-1, p.ll], [1, p.lr]].map(([side, ang]) => {
    const h = [hip[0] + side * 9 * s, hip[1]];
    const k = joint(h, 40 * s, A(ang[0]));
    const f = joint(k, 40 * s, A(ang[1]));
    return [h, k, f];
  });
  legs.forEach(([h, k, f]) => {
    limb(h, k, f, bottom, lw);
    ctx.ellipse(f[0] + 5 * s * flip, f[1] + 2 * s, 11 * s, 6 * s, shoe, 0);
    out.feet.push(f);
  });
  if (o.skirt) ctx.poly([[hip[0] - 14 * s, hip[1] - 8 * s], [hip[0] + 14 * s, hip[1] - 8 * s], [hip[0] + 30 * s, hip[1] + 34 * s], [hip[0] - 30 * s, hip[1] + 34 * s]], bottom, { inset: 1, still: true });
  ctx.poly([[neck[0] - 15 * s, neck[1] + 6 * s], [neck[0] + 15 * s, neck[1] + 6 * s], [hip[0] + 13 * s, hip[1]], [hip[0] - 13 * s, hip[1]]], top, { inset: 1, still: true });
  [[-1, p.al], [1, p.ar]].forEach(([side, ang]) => {
    const sh = [neck[0] + side * 14 * s, neck[1] + 12 * s];
    const e = joint(sh, 34 * s, A(ang[0]));
    const hnd = joint(e, 32 * s, A(ang[1]));
    limb(sh, e, hnd, top, 10 * s);
    ctx.circ(hnd[0], hnd[1], 6.5 * s, skin);
    out.hands.push(hnd);
  });
  return out;
}


// ---------------------------------------------------------------------------
// Ink outlines, for cartoons
// ---------------------------------------------------------------------------

function outlinePath(ctx, d, fill, bounds, lw = 3.5) {
  ctx.raw(`<path d="${d}" fill="${fill}" stroke="${ctx.ink}" stroke-width="${lw}" stroke-linejoin="round"/>`, (bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2, bounds);
}

function outlinePoly(ctx, pts, fill, lw = 3.5) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  ctx.raw(`<polygon points="${pts.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ')}" fill="${fill}" stroke="${ctx.ink}" stroke-width="${lw}" stroke-linejoin="round"/>`, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b);
}

function outlineEllipse(ctx, cx, cy, rx, ry, fill, lw = 3.5, rot = 0) {
  const reach = Math.max(rx, ry);
  ctx.raw(`<ellipse cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="${fill}" stroke="${ctx.ink}" stroke-width="${lw}" transform="rotate(${fmt((rot * 180) / Math.PI)} ${fmt(cx)} ${fmt(cy)})"/>`, cx, cy, [cx - reach, cy - reach, cx + reach, cy + reach]);
}

// A rubber-hose limb: an ink-edged tube along a path.
function hose(ctx, d, color, width, bounds) {
  ctx.raw(`${stroke(d, ctx.ink, width + 7)}${stroke(d, color, width)}`, (bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2, bounds);
}

module.exports = { apart, headLook, outlinePath, outlinePoly, outlineEllipse, hose, SKINS, HAIRS, skinTones, hairTones, mix, animeEye, cartoonEye, brows, mouth, sparkle, sparkles, sweatDrop, angerVein, blush, tears, zzz, speedLines, emotion, faceBase, hairBack, hairFront, accessory, animeHead, cartoonHead, figure, POSES, grp, stroke, ell, rotRectLocal };
