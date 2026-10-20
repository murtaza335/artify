'use strict';

// More nature: cactus, bonsai, cherry blossom, lotus, fern, succulents, pinecone, lavender field, bamboo and willow.

const { TAU, fmt, pol, slice, rectPts, interpolate, blob } = require('./engine');

const R = rectPts;
const still = { inset: 1, still: true };
const disc = (ctx) => ctx.circ(120, 190, ctx.between(96, 106), ctx.col(ctx.int(0, 7) + 4));

// A leaf-shaped polygon from a base point toward a tip.
function leaf(base, tip, width) {
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * width;
  const ny = (dx / len) * width;
  const mx = base[0] + dx * 0.45;
  const my = base[1] + dy * 0.45;
  return [base, [mx + nx, my + ny], tip, [mx - nx, my - ny]];
}

function cactus(ctx) {
  const skin = ctx.green(ctx.int(0, 3));
  const pot = ctx.col(ctx.int(0, 7));
  disc(ctx);
  const top = ctx.between(90, 120);
  slice(ctx, interpolate([[0, 8], [0.05, 22], [1, 22]]), (t, b) => [120 + b, top + t * (300 - top)], { bands: 6, big: 18, loosePct: 0.05, skipPct: 0, color: (b, i) => ctx.green(i) });
  for (const s of [-1, 1]) {
    if (s === 1 && ctx.rand() < 0.3) continue;
    const y = ctx.between(180, 230);
    const lift = ctx.between(60, 100);
    ctx.stroke(`M${120 + s * 18} ${y} h${s * 34} q${s * 14} 0 ${s * 14} -14 v${-lift}`, skin, 20, 120 + s * 50, y - 30, [120 + s * 10, y - lift - 14, 120 + s * 70, y + 10]);
  }
  ctx.poly([[80, 300], [160, 300], [150, 346], [90, 346]], pot, { inset: 1, still: true });
  ctx.poly(R(74, 292, 92, 14), ctx.col(4), still);
  for (let i = 0; i < 3; i++) ctx.circ(120 + ctx.between(-14, 14), top + ctx.between(30, 150), 2.4, ctx.colors[1]);
  ctx.circ(120, top - 4, 9, ctx.col(6));
  return 'cactus';
}

function bonsai(ctx) {
  const wood = ctx.col(4);
  disc(ctx);
  ctx.poly([[60, 300], [180, 300], [168, 340], [72, 340]], ctx.col(ctx.int(0, 7)), still);
  ctx.poly(R(54, 290, 132, 14), ctx.col(2), still);
  const bend = ctx.between(-30, 30);
  ctx.stroke(`M120 292 C${120 + bend} 250 ${120 - bend} 220 ${120 + bend * 0.4} 170`, wood, 16, 120, 230, [70, 160, 170, 296]);
  ctx.stroke(`M${120 + bend * 0.6} 220 Q${150 + bend} 214 ${170} 190`, wood, 7, 150, 205, [118, 186, 172, 224]);
  const clouds = [[120 + bend * 0.4, 140, 44], [168, 180, 30], [76, 176, 32], [112, 104, 30]];
  clouds.forEach(([x, y, r], i) => blob(ctx, x, y, r, 0.16, i % 2 ? ctx.green(i) : ctx.green(i + 1), 8));
  for (let i = 0; i < 6; i++) ctx.circ(ctx.between(70, 170), ctx.between(90, 190), ctx.between(3, 6), ctx.green(i + 2));
  return 'bonsai';
}

function cherryBlossom(ctx) {
  const side = ctx.rand() < 0.5 ? -1 : 1;
  ctx.circ(ctx.between(90, 150), ctx.between(90, 150), ctx.between(40, 56), ctx.col(ctx.pick([0, 1, 3])));
  const wood = ctx.col(4);
  ctx.stroke(`M${120 - side * 100} 340 C${120 - side * 60} 260 ${120 - side * 10} 250 ${120 + side * 70} 180`, wood, 12, 120, 260, [10, 170, 230, 346]);
  ctx.stroke(`M${120 - side * 30} 262 Q${120 - side * 10} 200 ${120 - side * 30} 150`, wood, 7, 100, 200, [60, 150, 130, 264]);
  const spots = [[120 + side * 70, 180], [120 + side * 40, 210], [120 + side * 90, 160], [120 - side * 30, 150], [120 - side * 20, 190], [120 + side * 10, 236], [120 - side * 10, 120], [120 + side * 60, 130], [120 + side * 20, 150]];
  const pink = ctx.col(6);
  spots.forEach(([x, y], i) => {
    const r = ctx.between(12, 17);
    let svg = '';
    for (let k = 0; k < 5; k++) {
      const [px, py] = pol(x, y, r * 0.7, (k * TAU) / 5 + i);
      svg += `<circle cx="${fmt(px)}" cy="${fmt(py)}" r="${fmt(r * 0.55)}" fill="${i % 3 ? pink : ctx.colors[1]}"/>`;
    }
    svg += `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r * 0.25)}" fill="${ctx.col(3)}"/>`;
    ctx.raw(svg, x, y, [x - r * 1.25, y - r * 1.25, x + r * 1.25, y + r * 1.25]);
  });
  for (let i = 0; i < 6; i++) ctx.ellipse(ctx.between(30, 210), ctx.between(250, 340), 5, 3, pink, ctx.between(0, 3));
  return 'cherry blossom';
}

function lotus(ctx) {
  const hue = ctx.int(0, 7);
  ctx.circ(120, 190, ctx.between(98, 106), ctx.col(hue + 4));
  ctx.ellipse(120, 300, 98, 24, ctx.green(0), 0);
  ctx.poly([[120, 300], [200, 280], [210, 300]], ctx.col(hue + 4), still);
  const rings = [[9, 96, 0.34], [7, 76, 0.4], [5, 56, 0.5]];
  rings.forEach(([n, len, wid], k) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * (k === 0 ? 0.34 : 0.4 + k * 0.05);
      const tip = pol(120, 280, len, a);
      ctx.poly(leaf([120, 280], tip, len * wid * 0.45), ctx.col(hue + k * 2 + (i % 2)), { inset: 0.97 });
    }
  });
  ctx.circ(120, 262, 8, ctx.col(0));
  for (let i = 0; i < 3; i++) ctx.line(30 + i * 50, 322 + i * 3, 70 + i * 50, 322 + i * 3, ctx.col(5), 3);
  return 'lotus';
}

function fern(ctx) {
  disc(ctx);
  const fronds = ctx.int(1, 2);
  for (let f = 0; f < fronds; f++) {
    const bx = fronds === 1 ? 120 : 84 + f * 72;
    const lean = (f - (fronds - 1) / 2) * 0.22 + ctx.between(-0.05, 0.05);
    const n = ctx.int(7, 9);
    const len = ctx.between(190, 225);
    const curl = ctx.between(-0.3, 0.3);
    let prev = [bx, 340];
    let ang = -Math.PI / 2 + lean;
    for (let i = 0; i < n; i++) {
      ang += curl / n;
      const step = len / n;
      const next = pol(prev[0], prev[1], step, ang);
      ctx.line(prev[0], prev[1], next[0], next[1], ctx.green(0), 3);
      const size = (1 - i / (n + 2)) * 52;
      for (const s of [-1, 1]) ctx.poly(leaf(next, pol(next[0], next[1], size, ang + s * 1.15), size * 0.22), ctx.green(i + (s > 0 ? 1 : 0) + f), { inset: 1 });
      prev = next;
    }
  }
  return 'fern';
}

function succulents(ctx) {
  const hue = ctx.int(0, 7);
  ctx.circ(120, 200, ctx.between(98, 106), ctx.col(hue + 4));
  const pot = (x, w, y, c) => {
    ctx.poly([[x - w, y], [x + w, y], [x + w * 0.8, y + 40], [x - w * 0.8, y + 40]], c, still);
    ctx.poly(R(x - w - 4, y - 6, w * 2 + 8, 10), ctx.col(4), still);
  };
  const rosette = (cx, cy, r, tone) => {
    const layers = r > 40 ? [[7, 1], [5, 0.62]] : [[6, 1], [4, 0.6]];
    layers.forEach(([n, k], li) => {
      const rot = ctx.rand() * TAU;
      for (let i = 0; i < n; i++) {
        const a = rot + (i * TAU) / n;
        ctx.poly(leaf([cx, cy], pol(cx, cy, r * k, a), r * k * 0.28), ctx.green(tone + li + (i % 2)), { inset: 0.96 });
      }
    });
    ctx.circ(cx, cy, r * 0.08, ctx.col(6));
  };
  pot(120, 44, 262, ctx.col(hue));
  rosette(120, 214, 52, 0);
  pot(48, 24, 308, ctx.col(hue + 3));
  rosette(48, 292, 24, 2);
  pot(192, 24, 308, ctx.col(hue + 5));
  rosette(192, 292, 24, 1);
  return 'succulents';
}

function pinecone(ctx) {
  const cx = 120;
  const cy = ctx.between(200, 215);
  const rx = 52;
  const ry = 98;
  const base = ctx.int(0, 7);
  disc(ctx);
  ctx.line(cx, cy - ry - 8, cx + ctx.between(-8, 8), cy - ry - 34, ctx.col(4), 7);
  const step = ctx.between(13, 15);
  for (let row = 0; row < 16; row++) {
    const y = cy - ry + 6 + row * step;
    if (y > cy + ry - 4) break;
    const half = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)) * (1 - (y - cy) / (ry * 5));
    const w = 20;
    const n = Math.max(1, Math.floor((half * 2) / w));
    for (let i = 0; i < n; i++) {
      const x = cx - (n * w) / 2 + w / 2 + i * w + (row % 2 ? w / 2 : 0) - (row % 2 ? w / 2 : 0) * 0;
      if (Math.abs(x - cx) > half) continue;
      ctx.poly([[x, y - step * 0.7], [x + w / 2, y], [x, y + step * 0.7], [x - w / 2, y]], ctx.col(base + ((row + i) % 2) * 3 + (row > 8 ? 1 : 0)), { inset: 0.94, still: true });
    }
  }
  return 'pinecone';
}

function lavenderField(ctx) {
  const hue = ctx.int(0, 7);
  ctx.poly(R(14, 48, 212, 130), ctx.col(hue + 5), still);
  ctx.circ(ctx.between(60, 180), ctx.between(90, 120), ctx.between(22, 32), ctx.col(0));
  ctx.poly([[14, 178], [90, 150], [160, 172], [226, 140], [226, 190], [14, 190]], ctx.col(hue + 3), still);
  ctx.poly(R(14, 186, 212, 160), ctx.green(0), still);
  const bloom = ctx.col(ctx.pick([2, 6, 5, 3]));
  for (let row = 0; row < 3; row++) {
    const y = 214 + row * 52;
    const n = 6 - row;
    const h = 38 + row * 20;
    for (let i = 0; i < n; i++) {
      const x = 34 + (i + 0.5) * (172 / n) + (row % 2) * 8 + ctx.between(-4, 4);
      let svg = `<line x1="${fmt(x)}" y1="${y + 30}" x2="${fmt(x + 2)}" y2="${fmt(y + 30 - h)}" stroke="${ctx.green(2)}" stroke-width="2.4"/>`;
      for (let k = 0; k < 5; k++) svg += `<ellipse cx="${fmt(x + 1)}" cy="${fmt(y + 24 - h + k * (h * 0.14))}" rx="${3 + row}" ry="${5 + row * 1.2}" fill="${k % 2 ? bloom : ctx.col(7)}"/>`;
      ctx.raw(svg, x, y, [x - 8, y - h, x + 10, y + 32]);
    }
  }
  return 'lavender field';
}

function bamboo(ctx) {
  disc(ctx);
  const stalks = ctx.int(3, 4);
  for (let s = 0; s < stalks; s++) {
    const x = 120 + (s - (stalks - 1) / 2) * 40 + ctx.between(-6, 6);
    const w = ctx.between(9, 13);
    const segs = ctx.int(4, 6);
    const h = 296 / segs;
    const top = ctx.between(60, 100);
    for (let i = 0; i < segs; i++) {
      const y = top + i * ((340 - top) / segs);
      ctx.poly(R(x - w, y + 2, w * 2, (340 - top) / segs - 4), ctx.green(s + i), { inset: 1, still: true });
    }
    for (let k = 0; k < 2; k++) {
      const y = top + (k + 1) * ((340 - top) / segs) * ctx.int(1, 2);
      const side = k ? 1 : -1;
      ctx.poly(leaf([x + side * w, y], [x + side * ctx.between(26, 36), y - ctx.between(24, 40)], 6), ctx.green(s + k + 1), { inset: 1 });
    }
  }
  return 'bamboo';
}

function willow(ctx) {
  const hue = ctx.int(0, 7);
  ctx.circ(ctx.between(80, 160), ctx.between(110, 150), ctx.between(38, 52), ctx.col(hue));
  ctx.poly(R(14, 300, 212, 46), ctx.col(5), still);
  ctx.poly([[108, 300], [132, 300], [138, 230], [102, 230]], ctx.col(4), still);
  ctx.stroke('M120 240 Q150 206 176 170', ctx.col(4), 7, 148, 205, [118, 170, 180, 244]);
  ctx.stroke('M120 240 Q88 206 64 176', ctx.col(4), 7, 92, 205, [60, 172, 122, 244]);
  const strands = ctx.int(13, 17);
  for (let i = 0; i < strands; i++) {
    const t = i / (strands - 1);
    const x = 40 + t * 160;
    const top = 150 - Math.sin(t * Math.PI) * 50 + ctx.between(-6, 6);
    const drop = ctx.between(110, 150) - Math.abs(t - 0.5) * 50;
    const sway = ctx.between(-14, 14);
    ctx.stroke(`M${fmt(x)} ${fmt(top)} Q${fmt(x + sway)} ${fmt(top + drop / 2)} ${fmt(x + sway * 0.4)} ${fmt(top + drop)}`, ctx.green(i), 5, x, top + drop / 2, [x - 16, top, x + 16, top + drop]);
  }
  ctx.ellipse(120, 324, 56, 7, ctx.col(2), 0);
  return 'weeping willow';
}

module.exports = { cactus, bonsai, cherryBlossom, lotus, fern, succulents, pinecone, lavenderField, bamboo, willow };
