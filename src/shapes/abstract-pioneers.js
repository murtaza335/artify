'use strict';

// Abstract pioneers, re-imagined: orphic prisms, rayonist rays, a vorticist vortex, floating prouns, a tilted
// counter-composition, a lozenge grid, a suprematist cross, a painterly square, spirit spirals, mirrored
// evolution halves, elementary forms, stacked rectangles, futurist speed, a cubist collage, interlocking
// fugue discs, a synchromy, purist still life, ruled constructions, architectonic planes, tubular forms, a
// colour-square chart, a light raster, a shaped canvas, a neo-concrete fold, a formal alphabet and several
// circles.

const { TAU, fmt, pol, rotRect, arcBand } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, veil, glow, ring, polyline, batcher, X0, Y0, X1, Y1, CX, CY } = K;

function orphicPrism(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 6, [ctx.ink]);
  const discs = ctx.int(2, 3);
  for (let d = 0; d < discs; d++) {
    const x = ctx.between(60, 180);
    const y = 100 + d * (220 / discs) + ctx.between(0, 30);
    const r = ctx.between(46, 70);
    const rings = 3;
    for (let k = rings; k > 0; k--) {
      for (let q = 0; q < 4; q++) {
        const a = q * (Math.PI / 2) + d;
        ctx.poly(arcBand(x, y, 0, (r * k) / rings, a, a + Math.PI / 2, 6), pal[(q + k + d) % pal.length], { inset: 1, still: true });
      }
    }
  }
  for (let i = 0; i < 3; i++) ctx.poly(rotRect(CX, ctx.between(80, 320), 260, 10, ctx.between(-0.5, 0.5)), i % 2 ? bg : pal[i], still);
  return 'orphic prism';
}

function rayonism(ctx) {
  const bg = ctx.col(ctx.int(0, 7));
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  const foci = [[ctx.between(40, 100), ctx.between(80, 160)], [ctx.between(140, 200), ctx.between(230, 310)]];
  foci.forEach(([fx, fy], f) => {
    const n = ctx.int(9, 13);
    for (let i = 0; i < n; i++) {
      const a = ctx.between(0, TAU);
      const len = ctx.between(140, 300);
      const w = ctx.between(0.02, 0.06);
      ctx.poly([[fx, fy], pol(fx, fy, len, a - w), pol(fx, fy, len, a + w)], pal[(i + f * 2) % pal.length], { inset: 1, still: true });
    }
  });
  return 'rayonist rays';
}

function vorticism(ctx) {
  panel(ctx, ctx.colors[1]);
  const pal = hues(ctx, 4, [ctx.colors[1], ctx.ink]);
  const vx = ctx.between(90, 150);
  const vy = ctx.between(150, 240);
  const n = ctx.int(10, 14);
  let a = ctx.between(0, TAU);
  for (let i = 0; i < n; i++) {
    const step = ctx.between(0.3, 0.7);
    const r0 = ctx.between(10, 40);
    ctx.poly([pol(vx, vy, r0, a), pol(vx, vy, 260, a + 0.25), pol(vx, vy, 260, a + step)], i % 3 === 0 ? ctx.ink : pal[i % pal.length], { inset: 1, still: true });
    a += step + ctx.between(0.05, 0.2);
  }
  ctx.poly(rotRect(vx, vy, 30, 30, a), ctx.ink, still);
  return 'vorticist vortex';
}

function proun(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.col(0), ctx.col(5)]);
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg, ctx.ink]);
  const iso = (x, y, w, d, h, top, left, right) => {
    const dx = d * 0.87;
    const dy = d * 0.5;
    ctx.poly([[x, y], [x + w, y], [x + w + dx, y - dy], [x + dx, y - dy]], top, still);
    ctx.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], left, still);
    ctx.poly([[x + w, y], [x + w + dx, y - dy], [x + w + dx, y - dy + h], [x + w, y + h]], right, still);
  };
  ctx.line(X0, ctx.between(260, 320), X1, ctx.between(60, 140), ctx.ink, 2);
  ctx.circ(ctx.between(60, 180), ctx.between(90, 140), ctx.between(28, 44), pal[0]);
  iso(ctx.between(40, 70), ctx.between(170, 210), ctx.between(70, 100), 40, 22, ctx.colors[1] === bg ? '#C9C2AE' : ctx.colors[1], ctx.ink, pal[1]);
  iso(ctx.between(110, 140), ctx.between(250, 290), 50, 26, 50, pal[2], ctx.ink, pal[1]);
  ctx.poly(rotRect(ctx.between(80, 160), ctx.between(110, 160), 120, 6, ctx.between(-0.6, -0.3)), ctx.ink, still);
  return 'floating proun';
}

function counterComposition(ctx) {
  panel(ctx, ctx.colors[1]);
  const pal = hues(ctx, 3, [ctx.colors[1], ctx.ink]);
  const rot = Math.PI / 4 + ctx.between(-0.08, 0.08);
  const cells = [];
  const xs = [-200, ctx.between(-80, -30), ctx.between(10, 60), ctx.between(90, 130), 200];
  const ys = [-200, ctx.between(-90, -40), ctx.between(0, 50), ctx.between(80, 120), 200];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) cells.push([xs[i], ys[j], xs[i + 1], ys[j + 1]]);
  const T = ([x, y]) => [CX + x * Math.cos(rot) - y * Math.sin(rot), CY + x * Math.sin(rot) + y * Math.cos(rot)];
  cells.forEach(([a, b, c, d], i) => {
    const fill = ctx.rand() < 0.4 ? pal[i % 3] : ctx.colors[1];
    ctx.poly([[a + 5, b + 5], [c - 5, b + 5], [c - 5, d - 5], [a + 5, d - 5]].map(T), fill, still);
  });
  for (const x of xs.slice(1, -1)) ctx.poly([[x - 5, -200], [x + 5, -200], [x + 5, 200], [x - 5, 200]].map(T), ctx.ink, still);
  for (const y of ys.slice(1, -1)) ctx.poly([[-200, y - 5], [200, y - 5], [200, y + 5], [-200, y + 5]].map(T), ctx.ink, still);
  return 'counter-composition';
}

function lozengeGrid(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 3, [ctx.colors[1], ctx.ink]);
  const s = 104;
  const D = [[CX, CY - s * 1.35], [CX + s, CY], [CX, CY + s * 1.35], [CX - s, CY]];
  ctx.poly(D, ctx.colors[1], still);
  ctx.clipTo(null);
  const id = `loz-${fmt(s)}`;
  ctx.defs.push(`<clipPath id="${id}"><polygon points="${K.pts(D)}"/></clipPath>`);
  ctx.clip = `url(#${id})`;
  const vx = [CX + ctx.between(-60, -20), CX + ctx.between(10, 50)];
  const hy = [CY + ctx.between(-80, -30), CY + ctx.between(30, 90)];
  ctx.poly(R(X0, Y0, vx[0] - X0, hy[0] - Y0), pal[0], still);
  ctx.poly(R(vx[1], hy[1], X1 - vx[1], Y1 - hy[1]), pal[1], still);
  if (ctx.rand() < 0.6) ctx.poly(R(vx[1], Y0, X1 - vx[1], hy[0] - Y0), pal[2], still);
  vx.forEach((x) => ctx.poly(R(x - 4, Y0, 8, Y1 - Y0), ctx.ink, still));
  hy.forEach((y) => ctx.poly(R(X0, y - 4, X1 - X0, 8), ctx.ink, still));
  ctx.clip = null;
  return 'lozenge composition';
}

function suprematistCross(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const rot = ctx.between(-0.5, 0.5);
  const cx = ctx.between(100, 140);
  const cy = ctx.between(170, 220);
  ctx.poly(rotRect(cx, cy, 150, 34, rot), ctx.ink, still);
  ctx.poly(rotRect(cx, cy, 34, 190, rot), ctx.ink, still);
  const n = ctx.int(5, 8);
  for (let i = 0; i < n; i++) {
    const x = ctx.between(30, 210);
    const y = ctx.between(60, 330);
    ctx.poly(rotRect(x, y, ctx.between(14, 60), ctx.between(4, 12), rot + ctx.between(-0.8, 0.8)), pal[i % 4], still);
  }
  ctx.circ(ctx.between(40, 200), ctx.between(70, 120), ctx.between(6, 12), pal[0]);
  return 'suprematist cross';
}

function painterlySquare(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg, ctx.ink]);
  const s = ctx.between(110, 140);
  const x = ctx.between(30, 230 - s - 10);
  const y = ctx.between(70, 140);
  const j = () => ctx.between(-8, 8);
  ctx.poly([[x + j(), y + j()], [x + s + j(), y + j() + 6], [x + s + j(), y + s + j()], [x + j(), y + s + j() - 4]], ctx.rand() < 0.5 ? pal[0] : ctx.ink, still);
  const t = ctx.between(26, 40);
  ctx.poly(rotRect(ctx.between(50, 190), ctx.between(280, 320), t, t, ctx.between(-0.3, 0.3)), pal[1], still);
  ctx.poly(rotRect(ctx.between(40, 200), ctx.between(250, 330), t * 0.5, t * 0.3, ctx.between(-0.5, 0.5)), pal[2], still);
  return 'painterly square';
}

function spiritSpiral(ctx) {
  const bg = ctx.pick([ctx.col(6), ctx.col(0), ctx.col(5), ctx.ink]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(14, 20);
  let r = 104;
  let a = ctx.between(0, TAU);
  let x = CX;
  let y = CY;
  for (let i = 0; i < n; i++) {
    glow(ctx, x, y, r, pal[i % 4], 0.9);
    const nr = r * 0.86;
    const [nx, ny] = pol(x, y, r - nr, a);
    x = nx;
    y = ny;
    r = nr;
    a += 0.55;
  }
  for (let i = 0; i < 6; i++) {
    const [px, py] = pol(CX, CY, 118, (i * TAU) / 6 + 0.5);
    ctx.ellipse(px, py, 16, 6, ctx.colors[1], (i * TAU) / 6 + 0.5);
  }
  return 'spirit spiral';
}

function evolutionHalves(ctx) {
  const [a, b] = hues(ctx, 2, [ctx.ink]);
  panel(ctx, a);
  ctx.poly(R(CX, Y0, X1 - CX, Y1 - Y0), b, still);
  const r = ctx.between(70, 90);
  ctx.shape(`M${CX} ${CY - r} A${fmt(r)} ${fmt(r)} 0 0 0 ${CX} ${CY + r} Z`, b, CX - r / 2, CY, [CX - r, CY - r, CX, CY + r]);
  ctx.shape(`M${CX} ${CY - r} A${fmt(r)} ${fmt(r)} 0 0 1 ${CX} ${CY + r} Z`, a, CX + r / 2, CY, [CX, CY - r, CX + r, CY + r]);
  const h = r / 2;
  ctx.shape(`M${CX} ${CY - r} A${fmt(h)} ${fmt(h)} 0 0 1 ${CX} ${CY} A${fmt(h)} ${fmt(h)} 0 0 0 ${CX} ${CY + r}`, ctx.ink, CX, CY, [CX - h, CY - r, CX + h, CY + r]);
  ctx.circ(CX, CY - h, h * 0.3, a);
  ctx.circ(CX, CY + h, h * 0.3, b);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) ctx.circ(CX + s * (r + 30 + i * 14), CY + (i - 1) * 60, 6 + i * 2, ctx.colors[1]);
  }
  return 'evolution halves';
}

function elementaryForms(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 5, [ctx.ink]);
  const cols = 3;
  const rows = 4;
  const w = 212 / cols;
  const h = 298 / rows;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = X0 + i * w + w / 2;
      const y = Y0 + j * h + h / 2;
      const c = pal[(i + j * 2 + ctx.int(0, 1)) % 5];
      const t = ctx.int(0, 3);
      if (t === 0) ctx.circ(x, y, w * 0.3, c);
      else if (t === 1) ctx.poly(R(x - w * 0.3, y - h * 0.3, w * 0.6, h * 0.6), c, still);
      else if (t === 2) ctx.poly(R(x - w * 0.42, y - 6, w * 0.84, 12), c, still);
      else ctx.circ(x + ctx.pick([-1, 1]) * w * 0.15, y, w * 0.18, c);
    }
  }
  return 'elementary forms';
}

function stackedRectangles(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  let y = Y0 + 10;
  let i = 0;
  while (y < Y1 - 20) {
    const h = ctx.between(16, 44);
    let x = X0 + 10;
    while (x < X1 - 20) {
      const w = ctx.between(24, 80);
      if (ctx.rand() < 0.75) ctx.poly(R(x, y, Math.min(w, X1 - 10 - x), h), pal[i++ % 5], still);
      x += w + 6;
    }
    y += h + 6;
  }
  return 'stacked rectangles';
}

function futuristSpeed(ctx) {
  const bg = ctx.pick([ctx.colors[1], ctx.ink]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const n = ctx.int(6, 9);
  const dir = ctx.pick([-1, 1]);
  for (let i = 0; i < n; i++) {
    const cx = CX + dir * (i - n / 2) * 18;
    const cy = ctx.between(120, 280);
    const r = 60 + i * 12;
    ctx.poly(arcBand(cx, cy, r - ctx.between(6, 14), r, Math.PI + 0.3, TAU - 0.3, 10), pal[i % 4], { inset: 1, still: true });
  }
  for (let i = 0; i < 5; i++) {
    const y = ctx.between(80, 330);
    const x = ctx.between(20, 120);
    ctx.poly([[x, y], [x + ctx.between(80, 140), y - 8], [x + ctx.between(80, 140), y + 8]].map(([px, py]) => [dir > 0 ? px : 240 - px, py]), pal[(i + 1) % 4], still);
  }
  return 'futurist speed';
}

function cubistCollage(ctx) {
  const bg = ctx.col(ctx.int(0, 7));
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  for (let i = 0; i < 8; i++) {
    const p = rotRect(ctx.between(50, 190), ctx.between(80, 310), ctx.between(50, 120), ctx.between(40, 110), ctx.between(-0.4, 0.4));
    ctx.poly(p, pal[i % 5], { inset: 1 });
    if (i % 3 === 0) {
      const b = batcher(ctx, 99);
      const [x, y] = p[0];
      for (let k = 0; k < 7; k++) b.add(`<line x1="${fmt(x + 6)}" y1="${fmt(y + 8 + k * 6)}" x2="${fmt(x + 46)}" y2="${fmt(y + 8 + k * 6)}" stroke="${ctx.ink}" stroke-width="1.6"/>`, x, y, x + 46, y + 50);
      b.flush();
    }
  }
  ctx.circ(ctx.between(90, 150), ctx.between(160, 230), ctx.between(18, 28), ctx.ink);
  ctx.line(ctx.between(30, 80), 340, ctx.between(160, 210), 60, ctx.ink, 3);
  return 'cubist collage';
}

function fugueDiscs(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 4, [ctx.ink]);
  const r = ctx.between(78, 92);
  const centres = [[CX - r * 0.45, CY - 30], [CX + r * 0.45, CY + 30]];
  centres.forEach(([x, y], d) => {
    const bands = ctx.int(5, 7);
    for (let i = 0; i < bands; i++) {
      const a0 = d * Math.PI + (i * Math.PI) / bands;
      ctx.poly(arcBand(x, y, r * 0.2, r, a0, a0 + Math.PI / bands, 4), pal[(i + d) % 4], { inset: 1, still: true });
      ctx.poly(arcBand(x, y, r * 0.2, r, a0 + Math.PI, a0 + Math.PI + Math.PI / bands, 4), pal[(i + d + 2) % 4], { inset: 1, still: true });
    }
  });
  ctx.circ(CX, CY, 12, ctx.colors[1]);
  return 'fugue in two discs';
}

function synchromy(ctx) {
  panel(ctx, ctx.colors[1]);
  const pal = hues(ctx, 6, [ctx.colors[1]]);
  const n = ctx.int(9, 13);
  const fx = ctx.between(90, 150);
  const fy = ctx.between(150, 240);
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n + ctx.between(-0.1, 0.1);
    const r0 = ctx.between(10, 50);
    const r1 = ctx.between(110, 220);
    ctx.poly([pol(fx, fy, r0, a), pol(fx, fy, r1, a - 0.18), pol(fx, fy, r1 * 0.8, a + 0.3)], pal[i % 6], { inset: 1 });
  }
  return 'synchromy';
}

function puristStill(ctx) {
  const bg = ctx.pick([ctx.col(0), ctx.col(5), ctx.col(6), ctx.colors[1]]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  ctx.poly(R(X0, ctx.between(230, 260), X1 - X0, 120), pal[0], still);
  const bottle = (x, h, c) => {
    ctx.poly(R(x - 18, 300 - h, 36, h), c, still);
    ctx.poly(R(x - 6, 300 - h - 34, 12, 36), c, still);
    ctx.ellipse(x, 300 - h, 18, 7, c);
  };
  bottle(ctx.between(60, 80), ctx.between(110, 150), pal[1]);
  ctx.ellipse(CX, 300, 46, 12, ctx.ink);
  ctx.poly(R(CX - 30, 236, 60, 64), pal[2], still);
  ctx.ellipse(CX, 236, 30, 9, ctx.colors[1] === bg ? pal[3] : ctx.colors[1]);
  bottle(ctx.between(160, 180), ctx.between(80, 120), pal[3]);
  ctx.line(X0, 300, X1, 300, ctx.ink, 3);
  return 'purist still life';
}

function ruledConstruction(ctx) {
  panel(ctx, ctx.pick([ctx.ink, ctx.colors[1]]));
  const ink = ctx.bg === ctx.ink ? ctx.colors[1] : ctx.ink;
  const pal = hues(ctx, 2, [ctx.bg, ink]);
  for (let i = 0; i < 4; i++) ring(ctx, ctx.between(40, 200), ctx.between(80, 310), ctx.between(30, 110), i ? ink : pal[0], i ? 1.6 : 4);
  for (let i = 0; i < 7; i++) {
    const a = ctx.between(0, Math.PI);
    const [x, y] = [ctx.between(40, 200), ctx.between(80, 310)];
    const [x1, y1] = pol(x, y, 200, a);
    const [x2, y2] = pol(x, y, -200, a);
    ctx.line(x1, y1, x2, y2, i === 3 ? pal[1] : ink, i === 3 ? 5 : 1.6);
  }
  return 'ruled construction';
}

function architectonicPlanes(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 5, [bg]);
  for (let i = 0; i < 7; i++) {
    const x = ctx.between(40, 200);
    const y = ctx.between(70, 320);
    const w = ctx.between(60, 160);
    const h = ctx.between(30, 120);
    const sk = ctx.between(-40, 40);
    veil(ctx, [[x - w / 2 + sk, y - h / 2], [x + w / 2 + sk, y - h / 2], [x + w / 2 - sk, y + h / 2], [x - w / 2 - sk, y + h / 2]], pal[i % 5], 0.82);
  }
  ctx.poly([[ctx.between(20, 60), 346], [ctx.between(100, 140), 48], [ctx.between(140, 180), 48], [ctx.between(80, 120), 346]], ctx.ink, still);
  return 'architectonic planes';
}

function tubularForms(ctx) {
  const bg = ctx.col(ctx.int(0, 7));
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg, ctx.ink]);
  const tube = (x, y, len, w, vertical, c) => {
    const shades = [c, ctx.colors[1], c, ctx.ink];
    for (let k = 0; k < 4; k++) {
      const off = -w / 2 + (k * w) / 4;
      if (vertical) ctx.poly(R(x + off, y, w / 4 + 0.5, len), shades[k], still);
      else ctx.poly(R(x, y + off, len, w / 4 + 0.5), shades[k], still);
    }
  };
  tube(ctx.between(40, 80), 40, 320, ctx.between(30, 44), true, pal[0]);
  tube(X0, ctx.between(100, 160), 230, ctx.between(26, 36), false, pal[1]);
  tube(ctx.between(150, 190), 120, 240, ctx.between(26, 36), true, pal[2]);
  for (let i = 0; i < 3; i++) ctx.circ(ctx.between(40, 200), ctx.between(200, 320), ctx.between(10, 22), pal[3]);
  ctx.poly(R(X0, ctx.between(260, 300), 230, 14), ctx.ink, still);
  return 'tubular forms';
}

function colorSquares(ctx) {
  panel(ctx, ctx.ink);
  const warm = [ctx.col(0), ctx.col(3), ctx.col(6), ctx.col(4), ctx.colors[1], ctx.col(2), ctx.col(5), ctx.col(7)];
  const cols = ctx.int(5, 6);
  const rows = ctx.int(7, 8);
  const w = 206 / cols;
  const h = 292 / rows;
  for (let j = 0; j < rows; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < cols; i++) {
      const x = X0 + 3 + i * w;
      const y = Y0 + 3 + j * h;
      const c = warm[(i * 3 + j * 5 + ctx.int(0, 2)) % 8];
      b.add(`<rect x="${fmt(x + 1.5)}" y="${fmt(y + 1.5)}" width="${fmt(w - 3)}" height="${fmt(h - 3)}" fill="${c}" opacity="${fmt(ctx.between(0.82, 1))}"/>`, x, y, x + w, y + h);
    }
    b.flush();
  }
  return 'magic squares';
}

function lightRaster(ctx) {
  const bg = ctx.pick([ctx.col(0), ctx.col(3), ctx.col(2), ctx.ink]);
  panel(ctx, bg);
  const light = ctx.colors[1];
  const cx = ctx.between(90, 150);
  const cy = ctx.between(150, 240);
  const rings = 9;
  for (let k = 1; k <= rings; k++) {
    const b = batcher(ctx, 999);
    const n = 8 + k * 6;
    for (let i = 0; i < n; i++) {
      const [x, y] = pol(cx, cy, k * 18, (i * TAU) / n + k * 0.2);
      const r = 4.2 - k * 0.3;
      b.add(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${light}"/>`, x - r, y - r, x + r, y + r);
    }
    b.flush();
  }
  ctx.circ(cx, cy, 10, light);
  return 'light raster';
}

function shapedCanvas(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 4, [ctx.ink]);
  const shape = [[ctx.between(20, 50), ctx.between(60, 100)], [ctx.between(140, 200), ctx.between(52, 80)], [ctx.between(200, 222), ctx.between(160, 220)], [ctx.between(150, 200), ctx.between(300, 340)], [ctx.between(40, 90), ctx.between(280, 330)], [ctx.between(18, 40), ctx.between(190, 230)]];
  ctx.poly(shape, pal[0], still);
  for (let i = 0; i < 3; i++) {
    const [a, b] = [shape[i], shape[i + 3]];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    ctx.poly([a, m, shape[(i + 1) % 6]], pal[i + 1], still);
  }
  ctx.circ(CX, CY, ctx.between(14, 24), ctx.colors[1]);
  return 'shaped canvas';
}

function neoConcreteFold(ctx) {
  const [a, b] = ctx.rand() < 0.5 ? [ctx.ink, ctx.colors[1]] : [ctx.colors[1], ctx.ink];
  panel(ctx, a);
  const gap = ctx.between(3, 6);
  const y = ctx.between(140, 260);
  const x = ctx.between(80, 160);
  ctx.poly([[X0, Y0], [x - gap, Y0], [x - gap, y - gap], [X0, y + ctx.between(-40, 40)]], b, still);
  ctx.poly([[x + gap, y + gap], [X1, y + ctx.between(-30, 30)], [X1, Y1], [x + ctx.between(-30, 30), Y1]], b, still);
  ctx.poly([[x + gap, Y0 + 30], [X1 - 30, Y0 + 30], [x + gap, y - 40]], hues(ctx, 1, [a, b])[0], still);
  return 'neo-concrete fold';
}

function formalAlphabet(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 6, [bg]);
  const cell = 70;
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 3; i++) {
      const x = X0 + 1 + i * cell + cell / 2;
      const y = Y0 + 9 + j * cell + cell / 2;
      const c = pal[(i + j * 3) % 6];
      const t = ctx.int(0, 4);
      const rot = ctx.int(0, 3) * (Math.PI / 2);
      if (t === 0) ctx.circ(x, y, cell * 0.42, c);
      else if (t === 1) ctx.poly([pol(x, y, cell * 0.48, rot - Math.PI / 2), pol(x, y, cell * 0.48, rot + Math.PI / 6), pol(x, y, cell * 0.48, rot + (5 * Math.PI) / 6)], c, still);
      else if (t === 2) ctx.poly(arcBand(x, y, 0, cell * 0.46, rot, rot + Math.PI, 8), c, { inset: 1, still: true });
      else if (t === 3) ctx.poly(R(x - cell / 2, y - cell / 2, cell, cell), c, still);
      else ctx.poly(arcBand(x - cell / 2, y + cell / 2, 0, cell, -Math.PI / 2, 0, 6), c, { inset: 1, still: true });
    }
  }
  return 'formal alphabet';
}

function severalCircles(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 6, [ctx.ink]);
  const big = ctx.between(60, 80);
  const bx = ctx.between(90, 150);
  const by = ctx.between(130, 200);
  glow(ctx, bx, by, big, pal[0], 0.9);
  glow(ctx, bx + 10, by + 6, big * 0.7, ctx.ink, 0.7);
  const n = ctx.int(14, 22);
  for (let i = 0; i < n; i++) {
    const r = ctx.between(6, 36);
    glow(ctx, ctx.between(30, 210), ctx.between(60, 330), r, pal[1 + (i % 5)], fmt(ctx.between(0.6, 0.9)));
  }
  return 'several circles';
}

module.exports = { orphicPrism, rayonism, vorticism, proun, counterComposition, lozengeGrid, suprematistCross, painterlySquare, spiritSpiral, evolutionHalves, elementaryForms, stackedRectangles, futuristSpeed, cubistCollage, fugueDiscs, synchromy, puristStill, ruledConstruction, architectonicPlanes, tubularForms, colorSquares, lightRaster, shapedCanvas, neoConcreteFold, formalAlphabet, severalCircles };
