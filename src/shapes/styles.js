'use strict';

// Art styles, re-imagined in the Artify palette: pointillism, pop art, art deco, constructivism, Bauhaus,
// Matisse cut-outs, a great wave, Memphis, op art, Kusama dots, Haring dancers, Klimt spirals, Delaunay discs,
// Arp blobs, a Calder mobile, Rothko fields, a Swiss grid, hard edge, a Roman mosaic and Riley stripes.

const { TAU, fmt, pol, rectPts, rotRect, arcBand, blob, dotField, stripes, starPoints } = require('./engine');

const R = rectPts;
const still = { inset: 1, still: true };
const FRAME = [14, 48, 212, 298];
// Everything drawn after the panel is clipped to it, so nothing spills over the frame.
const panel = (ctx, fill) => {
  ctx.poly(R(14, 48, 212, 298), fill, still);
  ctx.clipTo(FRAME);
};
const frame = (ctx, color) => [[14, 48, 212, 5], [14, 341, 212, 5], [14, 48, 5, 298], [221, 48, 5, 298]].forEach(([x, y, w, h]) => ctx.poly(R(x, y, w, h), color, still));

function pointillism(ctx) {
  const horizon = ctx.between(190, 230);
  const f = ctx.between(0.02, 0.04);
  const ph = ctx.between(0, 6);
  const sun = [ctx.between(70, 170), ctx.between(100, 140)];
  const sky = ctx.col(5);
  const hill = ctx.col(7);
  const dusk = ctx.col(ctx.int(0, 7));
  const water = ctx.col(2);
  panel(ctx, ctx.colors[1]);
  dotField(ctx, [18, 52, 204, 290], 10.5, (x, y, i, j) => 3.4 + ((i * 7 + j * 13) % 3) * 0.5, (x, y, i, j) => {
    const edge = horizon - 28 * Math.sin(x * f + ph);
    const noisy = (i * 31 + j * 17) % 5 === 0;
    if (Math.hypot(x - sun[0], y - sun[1]) < 26) return ctx.col(0);
    if (y > edge + 50) return noisy ? ctx.colors[1] : water;
    if (y > edge) return noisy ? ctx.green(i) : hill;
    return noisy ? ctx.colors[1] : y > edge - 40 ? dusk : sky;
  }, 4);
  frame(ctx, ctx.ink);
  return 'pointillist landscape';
}

function popArtDots(ctx) {
  const bg = ctx.col(ctx.int(0, 7));
  const dot = ctx.col(ctx.int(0, 7) + 3);
  panel(ctx, bg);
  const cx = ctx.between(100, 140);
  const cy = ctx.between(170, 210);
  dotField(ctx, [18, 52, 204, 290], 13, (x, y) => (Math.hypot(x - cx, y - cy) > 84 ? 4.6 * (0.55 + 0.45 * (y - 52) / 290) : 0), () => dot, 4);
  ctx.circ(cx, cy, 82, ctx.colors[1]);
  ctx.raw(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="82" fill="none" stroke="${ctx.ink}" stroke-width="5"/>`, cx, cy, [cx - 84, cy - 84, cx + 84, cy + 84]);
  ctx.poly(starPoints(cx + 30, cy - 18, 30, 15, 9, 0.3), ctx.col(3), { inset: 1, still: true });
  ctx.poly(R(cx - 54, cy + 28, 80, 12), ctx.ink, still);
  ctx.poly(R(cx - 42, cy + 52, 56, 8), ctx.ink, still);
  frame(ctx, ctx.ink);
  return 'pop art panel';
}

function artDeco(ctx) {
  const cx = 120;
  const cy = ctx.between(290, 310);
  panel(ctx, ctx.col(4));
  const gold = ctx.colors[0];
  const rays = ctx.int(9, 13);
  for (let i = 0; i < rays; i++) {
    const a = Math.PI + (i * Math.PI) / rays;
    ctx.poly([pol(cx, cy, 20, a), pol(cx, cy, 214, a + Math.PI / rays / 2), pol(cx, cy, 214, a + Math.PI / rays)].map((p) => [Math.max(20, Math.min(220, p[0])), Math.max(52, p[1])]), i % 2 ? ctx.col(3) : gold, { inset: 0.9, still: true });
  }
  for (let ring = 0; ring < 3; ring++) {
    const segs = 8;
    for (let i = 0; i < segs; i++) {
      const a = Math.PI + (i * Math.PI) / segs;
      ctx.poly(arcBand(cx, cy, 14 + ring * 22, 34 + ring * 22, a, a + Math.PI / segs), ctx.col(ring * 2 + (i % 2) * 3 + 1), { inset: 0.94, still: true });
    }
  }
  ctx.poly(R(60, cy, 120, 36), gold, still);
  ctx.poly(R(80, cy + 8, 80, 8), ctx.col(4), still);
  frame(ctx, gold);
  return 'art deco fan';
}

function constructivism(ctx) {
  panel(ctx, ctx.colors[1]);
  const red = ctx.col(3);
  ctx.poly([[14, 346], [14, ctx.between(160, 220)], [ctx.between(150, 220), 346]], red, still);
  ctx.circ(ctx.between(120, 170), ctx.between(110, 150), ctx.between(34, 48), ctx.ink);
  ctx.circ(ctx.between(80, 120), ctx.between(250, 290), ctx.between(14, 22), ctx.col(0));
  for (let i = 0; i < 4; i++) ctx.poly(rotRect(ctx.between(80, 160), ctx.between(100, 300), ctx.between(70, 120), ctx.between(8, 20), ctx.between(-0.9, -0.4)), i % 2 ? ctx.ink : ctx.col(5), still);
  ctx.line(24, 330, 216, 70, ctx.ink, 3);
  ctx.poly([[ctx.between(150, 190), 300], [226, 270], [226, 346], [ctx.between(150, 190), 346]], ctx.ink, still);
  frame(ctx, ctx.ink);
  return 'constructivist poster';
}

function bauhausPoster(ctx) {
  panel(ctx, ctx.colors[1]);
  const cw = 106;
  const ch = 99;
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 2; i++) {
      const x = 14 + i * cw;
      const y = 48 + j * ch;
      const c = ctx.col(i * 3 + j * 2 + ctx.int(0, 1));
      const type = ctx.int(0, 4);
      if (type === 0) ctx.circ(x + cw / 2, y + ch / 2, 42, c);
      else if (type === 1) ctx.poly(R(x + 10, y + 8, cw - 20, ch - 16), c, still);
      else if (type === 2) ctx.poly([[x + cw / 2, y + 8], [x + cw - 10, y + ch - 8], [x + 10, y + ch - 8]], c, still);
      else if (type === 3) ctx.shape(`M${x + 10} ${y + ch - 8} A${(cw - 20) / 2} ${(cw - 20) / 2} 0 0 1 ${x + cw - 10} ${y + ch - 8} Z`, c, x + cw / 2, y + ch - 30, [x + 10, y + ch - 8 - (cw - 20) / 2, x + cw - 10, y + ch - 8]);
      else ctx.poly(R(x, y + ch / 2 - 8, cw, 16), c, still);
    }
  }
  ctx.poly(R(14, 48 + 99 - 3, 212, 6), ctx.ink, still);
  ctx.poly(R(14, 48 + 198 - 3, 212, 6), ctx.ink, still);
  ctx.poly(R(120 - 3, 48, 6, 298), ctx.ink, still);
  frame(ctx, ctx.ink);
  return 'bauhaus poster';
}

function matisseCutouts(ctx) {
  panel(ctx, ctx.colors[1]);
  const lobed = (cx, cy, Rr, r, n, fill) => {
    const rot = ctx.rand() * TAU;
    const pts = Array.from({ length: n * 2 }, (_, i) => pol(cx, cy, (i % 2 ? r : Rr) * ctx.between(0.8, 1.15), rot + (i * Math.PI) / n));
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s = mid(pts[pts.length - 1], pts[0]);
    let d = `M${fmt(s[0])} ${fmt(s[1])}`;
    pts.forEach((p, i) => {
      const m = mid(p, pts[(i + 1) % pts.length]);
      d += `Q${fmt(p[0])} ${fmt(p[1])} ${fmt(m[0])} ${fmt(m[1])}`;
    });
    const reach = Rr * 1.15;
    ctx.shape(d + 'Z', fill, cx, cy, [cx - reach, cy - reach, cx + reach, cy + reach]);
  };
  const n = ctx.int(7, 10);
  for (let i = 0; i < n; i++) {
    const cx = ctx.between(52, 188);
    const cy = ctx.between(100, 300);
    lobed(cx, cy, ctx.between(26, 46), ctx.between(10, 20), ctx.int(4, 7), ctx.col(i + ctx.int(0, 7)));
  }
  for (let i = 0; i < 3; i++) blob(ctx, ctx.between(50, 190), ctx.between(80, 310), ctx.between(12, 22), 0.3, ctx.col(ctx.int(0, 7)));
  return 'paper cut-outs';
}

function greatWave(ctx) {
  panel(ctx, ctx.colors[1]);
  ctx.circ(ctx.between(150, 190), ctx.between(100, 130), ctx.between(26, 34), ctx.col(3));
  ctx.poly([[14, 250], [60, 220], [120, 250], [170, 250], [226, 250], [226, 346], [14, 346]], ctx.col(5), still);
  const navy = ctx.col(4);
  const lift = ctx.between(0, 30);
  const crest = ctx.between(60, 90);
  ctx.shape(`M14 346 L14 ${220 - lift} C50 ${130 - lift} 150 ${crest} 205 ${150 - lift} C170 ${118 - lift} 130 ${150 - lift} 132 ${190 - lift} C140 250 110 300 100 346 Z`, navy, 110, 220, [14, crest, 210, 346]);
  ctx.shape(`M14 346 L14 ${270 - lift} C60 ${210 - lift} 120 ${210 - lift} 140 ${250 - lift} C130 300 120 330 120 346 Z`, ctx.col(2), 70, 300, [14, 200, 142, 346]);
  ctx.shape('M120 346 C150 300 190 280 226 270 L226 346 Z', ctx.col(2), 180, 320, [120, 270, 226, 346]);
  const foam = ctx.colors[1];
  for (let i = 0; i < 6; i++) {
    const x = 140 + i * 13 + ctx.between(-4, 4);
    const y = 150 - lift - Math.sin(i / 5 * Math.PI) * 24 + ctx.between(0, 20);
    ctx.shape(`M${fmt(x)} ${fmt(y)} q8 -22 18 -4 q-6 4 -4 14 q-10 -14 -14 -10 Z`, foam, x + 8, y - 6, [x - 2, y - 26, x + 20, y + 12]);
  }
  for (let i = 0; i < 5; i++) ctx.circ(ctx.between(130, 210), ctx.between(150, 230) - lift, ctx.between(2, 4), foam);
  frame(ctx, ctx.ink);
  return 'great wave';
}

function memphis(ctx) {
  panel(ctx, ctx.col(ctx.int(0, 7)));
  const squiggle = (x, y, color) => {
    let d = `M${x} ${y}`;
    for (let i = 0; i < 4; i++) d += ` q6 -10 12 0 t12 0`;
    ctx.stroke(d, color, 4, x + 36, y, [x, y - 8, x + 96, y + 8]);
  };
  for (let i = 0; i < 3; i++) squiggle(ctx.between(24, 110), ctx.between(80, 320), ctx.pick([ctx.ink, ctx.colors[1], ctx.col(3)]));
  for (let i = 0; i < 3; i++) {
    const x = ctx.between(30, 180);
    const y = ctx.between(70, 320);
    ctx.stroke(`M${fmt(x)} ${fmt(y)} l10 -14 l10 14 l10 -14 l10 14`, ctx.ink, 3, x + 20, y, [x, y - 14, x + 40, y]);
  }
  for (let i = 0; i < 6; i++) ctx.poly(rotRect(ctx.between(40, 200), ctx.between(80, 320), ctx.between(24, 54), ctx.between(24, 54), ctx.between(0, 1.5)), ctx.col(ctx.int(0, 7) + 3), still);
  for (let i = 0; i < 6; i++) ctx.circ(ctx.between(36, 204), ctx.between(70, 330), ctx.between(8, 22), ctx.col(ctx.int(0, 7) + 2));
  for (let i = 0; i < 4; i++) {
    const x = ctx.between(40, 200);
    const y = ctx.between(80, 320);
    ctx.poly([[x, y - 14], [x + 14, y + 10], [x - 14, y + 10]], ctx.pick([ctx.ink, ctx.colors[1]]), { inset: 1, still: true });
  }
  dotField(ctx, [ctx.between(20, 120), ctx.between(60, 260), 70, 50], 10, () => 2.2, () => ctx.ink, 3);
  frame(ctx, ctx.ink);
  return 'memphis pattern';
}

function opArt(ctx) {
  const cols = 5;
  const rows = 8;
  const s = 40;
  const bx = ctx.between(80, 160);
  const by = ctx.between(140, 240);
  const a = ctx.col(ctx.int(0, 7));
  const b = ctx.col(ctx.int(0, 7) + 4);
  const round = ctx.rand() < 0.4;
  ctx.poly(R(20, 30, cols * s, rows * s), b, still);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = 20 + (i + 0.5) * s;
      const y = 30 + (j + 0.5) * s;
      const d = Math.hypot(x - bx, y - by);
      const k = 0.3 + 0.62 * Math.max(0, 1 - d / 160);
      const q = s * k;
      if (round) ctx.circ(x, y, q / 2 + 3, a);
      else ctx.poly(rotRect(x, y, q, q, (k - 0.3) * 0.9), a, { inset: 1, still: true });
    }
  }
  return 'op art';
}

function kusamaDots(ctx) {
  const body = ctx.col(ctx.pick([0, 0, 3, 6]));
  const dot = ctx.ink;
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  const cx = 120;
  const cy = ctx.between(210, 230);
  const ribs = ctx.int(4, 6);
  for (let i = 0; i < ribs; i++) {
    const t = (i - (ribs - 1) / 2) / ribs;
    ctx.ellipse(cx + t * 150, cy, 54 - Math.abs(t) * 40, 86 - Math.abs(t) * 40, i % 2 ? body : ctx.col(ctx.int(0, 7)), 0);
  }
  ctx.shape(`M${cx - 6} ${cy - 82} q-4 -24 10 -34 q6 14 4 34 Z`, ctx.col(4), cx, cy - 98, [cx - 10, cy - 116, cx + 10, cy - 82]);
  ctx.shape(`M${cx + 4} ${cy - 100} q22 -14 34 6 q-18 2 -34 -6 Z`, ctx.green(0), cx + 20, cy - 100, [cx + 4, cy - 116, cx + 38, cy - 94]);
  for (let i = 0; i < 26; i++) {
    const a = ctx.rand() * TAU;
    const rr = Math.sqrt(ctx.rand());
    ctx.circ(cx + Math.cos(a) * rr * 112, cy + Math.sin(a) * rr * 70, ctx.between(4, 9), dot);
  }
  dotField(ctx, [20, 300, 200, 40], 14, () => ctx.rand() * 3 + 1.4, () => ctx.col(body === ctx.col(0) ? 1 : 0), 4);
  frame(ctx, ctx.ink);
  return 'dotted pumpkin';
}

function haringDancers(ctx) {
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  const n = ctx.int(2, 3);
  for (let k = 0; k < n; k++) {
    const x = n === 2 ? 80 + k * 80 : 56 + k * 64;
    const y = 190 + ctx.between(-20, 20);
    const c = ctx.col(ctx.int(0, 7) + k * 2);
    const lean = ctx.between(-14, 14);
    ctx.circ(x + lean, y - 70, 15, c);
    ctx.line(x + lean, y - 54, x, y + 10, c, 13);
    for (const s of [-1, 1]) {
      ctx.line(x + lean * 0.8, y - 40, x + s * ctx.between(34, 54), y - ctx.between(70, 100), c, 9);
      ctx.line(x, y + 8, x + s * ctx.between(24, 44), y + ctx.between(52, 80), c, 10);
    }
    for (let m = 0; m < 3; m++) {
      const a = ctx.between(-0.6, 0.6) + (m - 1) * 0.35;
      const [x1, y1] = pol(x + lean, y - 70, 24, -Math.PI / 2 + a);
      const [x2, y2] = pol(x + lean, y - 70, 38, -Math.PI / 2 + a);
      ctx.line(x1, y1, x2, y2, ctx.ink, 3);
    }
  }
  ctx.poly([[120, 322], [112, 308], [128, 308]], ctx.col(3), still);
  frame(ctx, ctx.ink);
  return 'dancing figures';
}

function klimtSpiral(ctx) {
  panel(ctx, ctx.col(4));
  const gold = ctx.colors[0];
  const total = ctx.int(26, 32);
  const rot = ctx.rand() * TAU;
  const cx = ctx.between(112, 128);
  const cy = ctx.between(180, 200);
  for (let i = 0; i < total; i++) {
    const a = rot + i * 0.55;
    const r = 10 + i * 2.6;
    const [x, y] = pol(cx, cy, r, a);
    const w = 14 + i * 0.5;
    ctx.poly(rotRect(x, y, w, 9 + (i % 3) * 3, a + Math.PI / 2), i % 4 === 0 ? ctx.col(3) : i % 4 === 2 ? ctx.col(2) : gold, { inset: 1, still: true });
  }
  for (let k = 0; k < 3; k++) {
    const x = ctx.between(40, 200);
    const y = ctx.pick([76, 316]) + ctx.between(-8, 8);
    ctx.ellipse(x, y, 16, 8, gold, ctx.between(-0.4, 0.4));
    ctx.circ(x, y, 4, ctx.ink);
  }
  frame(ctx, gold);
  return 'gold spiral';
}

function delaunayDiscs(ctx) {
  panel(ctx, ctx.colors[1]);
  const discs = ctx.int(1, 2);
  const hue = ctx.int(0, 7);
  for (let d = 0; d < discs; d++) {
    const cx = discs === 1 ? 120 : 120 + (d ? 28 : -28);
    const cy = discs === 1 ? 196 : d ? 270 : 130;
    const big = discs === 1 ? 88 : 66;
    const spin = ctx.int(0, 3) * (Math.PI / 2);
    for (let ring = 0; ring < 4; ring++) {
      const r0 = (big * ring) / 4;
      const r1 = (big * (ring + 1)) / 4;
      for (let q = 0; q < 4; q++) {
        const a = spin + (q * Math.PI) / 2;
        ctx.poly(arcBand(cx, cy, r0 === 0 ? 0.01 : r0, r1, a, a + Math.PI / 2, 6), ctx.col(hue + ring * 2 + (q % 2) * 3 + d), { inset: 1, still: true });
      }
    }
  }
  frame(ctx, ctx.ink);
  return 'orphic discs';
}

function arpBlobs(ctx) {
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  const n = ctx.int(4, 6);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    blob(ctx, 120 + Math.sin(t * 5 + ctx.between(0, 1)) * 38, 100 + t * 200, ctx.between(36, 52), 0.28, ctx.col(i * 2 + ctx.int(0, 2)), 6);
  }
  ctx.circ(ctx.between(90, 150), ctx.between(130, 280), ctx.between(8, 12), ctx.ink);
  ctx.circ(ctx.between(60, 180), ctx.between(80, 300), ctx.between(5, 9), ctx.colors[1]);
  frame(ctx, ctx.ink);
  return 'biomorphic forms';
}

function calderMobile(ctx) {
  const wire = ctx.ink;
  const hang = (x, y, depth) => {
    const L = [20, 30, 52][depth] * ctx.between(0.9, 1.1);
    const tilt = ctx.between(-0.25, 0.25);
    const ax = L * Math.cos(tilt);
    const ay = L * Math.sin(tilt);
    ctx.line(x - ax, y - ay, x + ax, y + ay, wire, 3);
    for (const s of [-1, 1]) {
      const ex = x + s * ax;
      const ey = y + s * ay;
      const drop = ctx.between(18, 32);
      if (depth > 0 && ctx.rand() < 0.65) {
        ctx.line(ex, ey, ex, ey + drop, wire, 2);
        hang(ex, ey + drop, depth - 1);
      } else {
        ctx.line(ex, ey, ex, ey + drop, wire, 2);
        const c = ctx.col(ctx.int(0, 7));
        const kind = ctx.int(0, 2);
        if (kind === 0) ctx.circ(ex, ey + drop + 14, ctx.between(10, 17), c);
        else if (kind === 1) ctx.ellipse(ex, ey + drop + 16, ctx.between(8, 12), ctx.between(16, 24), c, ctx.between(-0.5, 0.5));
        else blob(ctx, ex, ey + drop + 16, ctx.between(11, 16), 0.3, c, 5);
      }
    }
  };
  panel(ctx, ctx.colors[1]);
  ctx.line(120, 52, 120, 88, wire, 2);
  hang(120, 96, 2);
  return 'wire mobile';
}

function rothkoFields(ctx) {
  const bg = ctx.col(ctx.int(0, 7) + 4);
  panel(ctx, bg);
  const n = ctx.int(2, 3);
  let y = 76;
  for (let i = 0; i < n; i++) {
    const h = i === n - 1 ? 346 - 28 - y : ctx.between(90, 120);
    const c = ctx.col(ctx.int(0, 7) + i * 2);
    const x = 36;
    for (let halo = 2; halo >= 0; halo--) {
      const g = halo * 5;
      ctx.raw(`<rect x="${x - g}" y="${fmt(y - g)}" width="${168 + g * 2}" height="${fmt(h + g * 2)}" rx="${3 + g}" fill="${c}" fill-opacity="${halo ? 0.28 : 1}"/>`, 120, y + h / 2, [x - g, y - g, x + 168 + g, y + h + g]);
    }
    y += h + 18;
  }
  return 'color fields';
}

function swissGrid(ctx) {
  panel(ctx, ctx.colors[1]);
  const ink = ctx.ink;
  const accent = ctx.col(ctx.pick([3, 0, 2, 5]));
  ctx.poly(R(30, 70, 180, 10), ink, still);
  ctx.poly(R(30, 336 - 14, 180, 4), ink, still);
  const big = ctx.between(60, 80);
  const cx = ctx.pick([30 + big, 210 - big]);
  ctx.circ(cx, ctx.between(160, 220), big, accent);
  const rules = ctx.int(5, 8);
  const x0 = cx < 120 ? 120 : 30;
  for (let i = 0; i < rules; i++) ctx.poly(R(x0, 250 + i * 10, ctx.between(50, 90), 4), ink, still);
  ctx.poly(R(30, ctx.between(96, 110), ctx.between(24, 40), ctx.between(24, 40)), ink, still);
  ctx.poly(rotRect(120, ctx.between(200, 250), 150, 8, ctx.between(-0.35, -0.15)), ink, still);
  dotField(ctx, [150, 90, 60, 36], 12, () => 2.4, () => ink, 3);
  frame(ctx, ink);
  return 'grid poster';
}

function hardEdge(ctx) {
  const a = ctx.int(0, 7);
  panel(ctx, ctx.col(a));
  const k = ctx.between(120, 220);
  const flip = ctx.rand() < 0.5;
  const sx = flip ? 14 : 226;
  const dir = flip ? 1 : -1;
  ctx.shape(`M${sx} 346 L${sx} 48 Q${sx + dir * k * 0.2} ${k + 50} ${sx + dir * (k + 20)} 346 Z`, ctx.col(a + 3), 120, 250, [14, 48, 226, 346]);
  ctx.shape(`M${sx} 346 L${sx} ${ctx.between(220, 280)} Q${sx + dir * 60} ${ctx.between(300, 330)} ${sx + dir * 100} 346 Z`, ctx.col(a + 5), 120, 330, [14, 220, 226, 346]);
  ctx.poly(R(14, 336, 212, 10), ctx.ink, still);
  return 'bold curve';
}

function romanMosaic(ctx) {
  const cell = 11;
  const x0 = 22;
  const y0 = 58;
  const cols = 19;
  const rows = 26;
  const bird = ctx.rand() < 0.6;
  const body = ctx.col(ctx.int(0, 7));
  const wing = ctx.col(ctx.int(0, 7) + 3);
  const bg = ctx.col(ctx.int(0, 7) + 4);
  const ground = ctx.col(7);
  const kind = (x, y) => {
    if (bird) {
      const bx = (x - 100) / 66;
      const by = (y - 210) / 40;
      if (bx * bx + by * by < 1) return Math.hypot((x - 96) / 40, (y - 212) / 20) < 1 ? wing : body;
      if (Math.hypot(x - 164, y - 160) < 22) return Math.hypot(x - 170, y - 156) < 4 ? ctx.ink : body;
      if (y > 156 && y < 192 && Math.abs(x - 164) < 14 + (y - 156) * 0.1 && x > 150 && x < 178) return body;
      if (x > 184 && x < 206 && y > 158 && y < 166 + (x - 184) * 0.3) return ctx.col(0);
      if (x < 46 && y > 214 - (46 - x) * 0.3 && y < 250 && y > 190) return wing;
      if ((Math.abs(x - 96) < 3 || Math.abs(x - 120) < 3) && y > 240 && y < 290) return ctx.col(0);
      if (y > 292) return ground;
      return null;
    }
    const w = 20 + 38 * Math.sin(((y - 80) / 240) * Math.PI) ** 0.8 * (y > 80 && y < 320 ? 1 : 0);
    if (y > 80 && y < 320 && Math.abs(x - 120) < w) return Math.abs(y - (150 + 40)) < 6 || Math.abs(y - 260) < 6 ? wing : body;
    if (y > 100 && y < 230 && Math.abs(Math.abs(x - 120) - (w + 12)) < 6 && y > 120) return wing;
    return null;
  };
  ctx.poly(R(18, 52, 204, 290), bg, still);
  const group = 4;
  for (let gj = 0; gj < rows; gj += group) {
    for (let gi = 0; gi < cols; gi += group) {
      let svg = '';
      let b = [Infinity, Infinity, -Infinity, -Infinity];
      for (let j = gj; j < Math.min(rows, gj + group); j++) {
        for (let i = gi; i < Math.min(cols, gi + group); i++) {
          const x = x0 + (i + 0.5) * cell;
          const y = y0 + (j + 0.5) * cell;
          const c = kind(x, y);
          if (!c && (i * 3 + j * 5) % 3 !== 0) continue;
          const s = cell * 0.42;
          svg += `<rect x="${fmt(x - s)}" y="${fmt(y - s)}" width="${fmt(s * 2)}" height="${fmt(s * 2)}" fill="${c || ctx.colors[1]}" fill-opacity="${c ? 1 : 0.5}"/>`;
          b = [Math.min(b[0], x - s), Math.min(b[1], y - s), Math.max(b[2], x + s), Math.max(b[3], y + s)];
        }
      }
      if (svg) ctx.raw(svg, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b);
    }
  }
  return bird ? 'mosaic bird' : 'mosaic vessel';
}

function rileyStripes(ctx) {
  const count = ctx.int(14, 20);
  const amp = ctx.between(10, 26);
  const f = ctx.between(0.02, 0.045);
  const ph = ctx.between(0, 3);
  const a = ctx.col(ctx.int(0, 7));
  const b = ctx.col(ctx.int(0, 7) + 4);
  stripes(ctx, [18, 56, 204, 262], count, (x, k) => amp * Math.sin(x * f + ph + k * 0.18) * (0.3 + k / count), (k) => (k % 2 ? a : b), 16);
  return 'wave stripes';
}

module.exports = { pointillism, popArtDots, artDeco, constructivism, bauhausPoster, matisseCutouts, greatWave, memphis, opArt, kusamaDots, haringDancers, klimtSpiral, delaunayDiscs, arpBlobs, calderMobile, rothkoFields, swissGrid, hardEdge, romanMosaic, rileyStripes };
