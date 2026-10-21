'use strict';

// Pattern traditions from around the world, as abstract interpretations: a painted wall, woven strips, dot
// tracks, a housetop quilt, a strip quilt, mudcloth, shibori, ikat diamonds, glazed tiles, star mosaics, wave
// scales, a hemp-leaf lattice, overlapping rings, kilim steps, a step fret, batik crackle, round medallions,
// threshold loops, bark cloth, sashiko stitching, a cut-pile maze, layered appliqué, tartan, herringbone,
// whiplash curves and Vienna checks.

const { TAU, fmt, pol, rotRect, starPoints } = require('./engine');
const K = require('./abstract-kit');

const { R, still, panel, hues, batcher, polyline, veil, ring, X0, Y0, X1, Y1, CX, CY } = K;

const dot = (x, y, r, c) => `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${c}"/>`;
const line = (x1, y1, x2, y2, c, w, extra = '') => `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${c}" stroke-width="${fmt(w)}" stroke-linecap="round"${extra}/>`;

function paintedWall(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg, ctx.ink]);
  const cols = 2;
  const rows = 3;
  const w = 212 / cols;
  const h = 298 / rows;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = X0 + i * w;
      const y = Y0 + j * h;
      ctx.poly(R(x + 4, y + 4, w - 8, h - 8), ctx.ink, still);
      ctx.poly(R(x + 10, y + 10, w - 20, h - 20), pal[(i + j) % 4], still);
      const steps = ctx.int(2, 3);
      for (let s = 0; s < steps; s++) {
        const inset = 16 + s * 10;
        const p = [[x + w / 2, y + inset], [x + w - inset, y + h / 2], [x + w / 2, y + h - inset], [x + inset, y + h / 2]];
        ctx.poly(p, s % 2 ? pal[(i + j + 2) % 4] : ctx.ink, { inset: 1, still: true });
      }
      ctx.poly(R(x + w / 2 - 5, y + h / 2 - 5, 10, 10), bg, still);
    }
  }
  return 'painted wall';
}

function wovenStrips(ctx) {
  panel(ctx, ctx.ink);
  const pal = hues(ctx, 5, [ctx.ink]);
  const strips = 5;
  const w = 212 / strips;
  for (let i = 0; i < strips; i++) {
    const x = X0 + i * w;
    const b = batcher(ctx, 999);
    let y = Y0;
    let k = 0;
    while (y < Y1) {
      const h = ctx.between(18, 46);
      const warp = k % 2 === 0;
      const c = pal[(i + k) % 5];
      if (warp) {
        for (let s = 0; s < 4; s++) b.add(`<rect x="${fmt(x + 2 + s * (w - 4) / 4)}" y="${fmt(y)}" width="${fmt((w - 4) / 8)}" height="${fmt(h)}" fill="${c}"/>`, x, y, x + w, y + h);
      } else {
        b.add(`<rect x="${fmt(x + 2)}" y="${fmt(y)}" width="${fmt(w - 4)}" height="${fmt(h)}" fill="${c}"/>`, x, y, x + w, y + h);
        b.add(`<rect x="${fmt(x + 2)}" y="${fmt(y + h / 2 - 3)}" width="${fmt(w - 4)}" height="6" fill="${pal[(i + k + 2) % 5]}"/>`, x, y, x + w, y + h);
      }
      y += h + 3;
      k++;
    }
    b.flush();
  }
  return 'woven strips';
}

function dotTracks(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(4), ctx.col(3)]);
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const sites = Array.from({ length: ctx.int(3, 5) }, () => [ctx.between(50, 190), ctx.between(80, 310)]);
  for (let i = 1; i < sites.length; i++) {
    const [[x0, y0], [x1, y1]] = [sites[i - 1], sites[i]];
    const n = Math.floor(Math.hypot(x1 - x0, y1 - y0) / 8);
    const b = batcher(ctx, 999);
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const x = x0 + (x1 - x0) * t + Math.sin(t * Math.PI * 3) * 8;
      const y = y0 + (y1 - y0) * t;
      b.add(dot(x, y, 2.4, pal[3]), x - 3, y - 3, x + 3, y + 3);
    }
    b.flush();
  }
  sites.forEach(([x, y], s) => {
    const b = batcher(ctx, 999);
    for (let k = 1; k <= 5; k++) {
      const n = 6 + k * 6;
      for (let i = 0; i < n; i++) {
        const [px, py] = pol(x, y, k * 7, (i * TAU) / n);
        b.add(dot(px, py, 2.4, pal[(k + s) % 3]), px - 3, py - 3, px + 3, py + 3);
      }
    }
    b.flush();
    ctx.circ(x, y, 4, pal[s % 3]);
  });
  const field = batcher(ctx, 120);
  for (let i = 0; i < 360; i++) {
    const [x, y] = [ctx.between(X0, X1), ctx.between(Y0, Y1)];
    if (sites.some(([sx, sy]) => Math.hypot(x - sx, y - sy) < 46)) continue;
    field.add(dot(x, y, 1.4, pal[(i % 2) + 1]), x - 2, y - 2, x + 2, y + 2);
  }
  field.flush();
  return 'dot tracks';
}

function housetopQuilt(ctx) {
  const pal = hues(ctx, 6, []);
  panel(ctx, pal[0]);
  const blocks = ctx.rand() < 0.5 ? 1 : 2;
  const regions = blocks === 1 ? [[X0, Y0, 212, 298]] : [[X0, Y0, 212, 149], [X0, Y0 + 149, 212, 149]];
  regions.forEach(([x, y, w, h], r) => {
    let [a, b, c, d] = [x, y, x + w, y + h];
    let k = 0;
    while (c - a > 16 && d - b > 16) {
      ctx.poly(R(a, b, c - a, d - b), pal[(k + r * 2) % 6], still);
      const s = ctx.between(8, 20);
      a += s + ctx.between(-3, 3);
      b += s + ctx.between(-4, 4);
      c -= s + ctx.between(-3, 3);
      d -= s + ctx.between(-4, 4);
      k++;
    }
  });
  return 'housetop quilt';
}

function stripQuilt(ctx) {
  panel(ctx, ctx.colors[1]);
  const pal = hues(ctx, 6, []);
  let x = X0;
  let k = 0;
  while (x < X1) {
    const w = ctx.between(10, 40);
    const tilt = ctx.between(-6, 6);
    ctx.poly([[x, Y0], [x + w + 1, Y0], [x + w + 1 + tilt, Y1], [x + tilt, Y1]], pal[k % 6], still);
    if (ctx.rand() < 0.35) {
      const y = ctx.between(80, 300);
      ctx.poly(R(x, y, w + 1, ctx.between(14, 40)), pal[(k + 3) % 6], still);
    }
    x += w;
    k++;
  }
  return 'strip quilt';
}

function mudcloth(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(4)]);
  panel(ctx, bg);
  const ink = ctx.colors[1];
  const rows = 7;
  const h = 298 / rows;
  for (let j = 0; j < rows; j++) {
    const y = Y0 + j * h;
    const kind = (j + ctx.int(0, 3)) % 5;
    const b = batcher(ctx, 999);
    b.add(line(X0, y, X1, y, ink, 2.4), X0, y - 2, X1, y + 2);
    for (let x = X0 + 10; x < X1; x += 20) {
      if (kind === 0) b.add(dot(x, y + h / 2, 3.2, ink), x - 4, y, x + 4, y + h);
      else if (kind === 1) b.add(line(x - 6, y + h / 2 - 6, x + 6, y + h / 2 + 6, ink, 2.4) + line(x + 6, y + h / 2 - 6, x - 6, y + h / 2 + 6, ink, 2.4), x - 7, y, x + 7, y + h);
      else if (kind === 2) b.add(`<polyline points="${K.pts([[x - 10, y + h - 8], [x, y + 8], [x + 10, y + h - 8]])}" fill="none" stroke="${ink}" stroke-width="2.4"/>`, x - 10, y, x + 10, y + h);
      else if (kind === 3) b.add(line(x, y + 6, x, y + h - 6, ink, 2.4), x - 2, y, x + 2, y + h);
      else b.add(`<circle cx="${fmt(x)}" cy="${fmt(y + h / 2)}" r="6" fill="none" stroke="${ink}" stroke-width="2"/>`, x - 7, y, x + 7, y + h);
    }
    b.flush();
  }
  return 'mudcloth';
}

function shibori(ctx) {
  const white = ctx.colors[1];
  let bg = ctx.pick([ctx.col(2), ctx.ink, ctx.col(4)]);
  // The resist is cream, so the dye must not be.
  if (bg === white) bg = ctx.ink;
  panel(ctx, bg);
  const mode = ctx.int(0, 2);
  if (mode === 0) {
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 3; i++) {
        const [x, y] = [X0 + 35 + i * 71, Y0 + 37 + j * 75];
        for (let k = 3; k >= 1; k--) ctx.raw(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${k * 9}" fill="none" stroke="${white}" stroke-width="${fmt(4 - k * 0.6)}" opacity="${fmt(0.4 + 0.2 * (3 - k))}"/>`, x, y, [x - 30, y - 30, x + 30, y + 30]);
      }
    }
  } else {
    const n = mode === 1 ? 9 : 14;
    for (let k = 0; k < n; k++) {
      const p = mode === 1 ? [[X0, Y0 + k * 34], [X1, Y0 + k * 34 - 60], [X1, Y0 + k * 34 - 48], [X0, Y0 + k * 34 + 12]] : [[X0 + k * 16, Y0], [X0 + k * 16 + 6, Y0], [X0 + k * 16 + 6 + Math.sin(k) * 10, Y1], [X0 + k * 16 + Math.sin(k) * 10, Y1]];
      veil(ctx, p, white, fmt(ctx.between(0.45, 0.85)));
    }
  }
  return 'shibori';
}

function ikatDiamonds(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  for (let j = 0; j < 4; j++) {
    const cy = Y0 + 37 + j * 75;
    const cx = CX + (j % 2 ? -40 : 40);
    for (let k = 0; k < 3; k++) {
      const w = 74 - k * 22;
      const h = 34 - k * 10;
      const pts = [];
      for (let s = 0; s <= 10; s++) {
        const t = s / 10;
        const y = cy - h + 2 * h * t;
        const half = w * (1 - Math.abs(t * 2 - 1));
        pts.push([cx - half + ctx.between(-6, 6), y]);
      }
      const right = pts.map(([x, y]) => [2 * cx - x + ctx.between(-6, 6), y]).reverse();
      ctx.poly([...pts, ...right], pal[k], { inset: 1, still: true });
    }
  }
  return 'ikat diamonds';
}

function glazedTiles(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [blue, accent] = hues(ctx, 2, [bg]);
  const s = 70.6;
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 3; i++) {
      const [x, y] = [X0 + i * s, Y0 - 4 + j * s];
      const [cx, cy] = [x + s / 2, y + s / 2];
      const b = batcher(ctx, 999);
      b.add(`<rect x="${fmt(x + 1)}" y="${fmt(y + 1)}" width="${fmt(s - 2)}" height="${fmt(s - 2)}" fill="none" stroke="${blue}" stroke-width="2"/>`, x, y, x + s, y + s);
      for (const [qx, qy] of [[x, y], [x + s, y], [x + s, y + s], [x, y + s]]) b.add(`<path d="M${fmt(qx)} ${fmt(qy)} m${fmt(cx > qx ? s * 0.3 : -s * 0.3)} 0 A${fmt(s * 0.3)} ${fmt(s * 0.3)} 0 0 ${(cx > qx) === (cy > qy) ? 1 : 0} ${fmt(qx)} ${fmt(qy + (cy > qy ? s * 0.3 : -s * 0.3))}" fill="none" stroke="${blue}" stroke-width="3"/>`, x, y, x + s, y + s);
      b.add(`<polygon points="${K.pts(starPoints(cx, cy, s * 0.26, s * 0.1, 4, Math.PI / 4))}" fill="${blue}"/>` + dot(cx, cy, 5, accent), x, y, x + s, y + s);
      b.flush();
    }
  }
  return 'glazed tiles';
}

function starMosaic(ctx) {
  const pal = hues(ctx, 4, []);
  panel(ctx, pal[0]);
  const s = 53;
  for (let j = 0; j < 7; j++) {
    const b = batcher(ctx, 99);
    for (let i = 0; i < 5; i++) {
      const [cx, cy] = [X0 + i * s, Y0 + j * s];
      b.add(`<polygon points="${K.pts(starPoints(cx, cy, s * 0.5, s * 0.36, 8, Math.PI / 8))}" fill="${pal[1]}"/>` + `<polygon points="${K.pts(starPoints(cx, cy, s * 0.3, s * 0.22, 8, Math.PI / 8))}" fill="${pal[2]}"/>`, cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2);
      b.add(`<polygon points="${K.pts(starPoints(cx + s / 2, cy + s / 2, s * 0.2, s * 0.08, 4))}" fill="${pal[3]}"/>`, cx, cy, cx + s, cy + s);
    }
    b.flush();
  }
  return 'star mosaic';
}

function waveScales(ctx) {
  const [bg, a, b] = hues(ctx, 3, []);
  panel(ctx, bg);
  const r = ctx.pick([22, 26, 30]);
  for (let j = 0; ; j++) {
    const y = Y0 + j * r * 0.5;
    if (y > Y1 + r) break;
    const bat = batcher(ctx, 999);
    for (let x = X0 - r + (j % 2 ? r : 0); x < X1 + r; x += r * 2) {
      for (let k = 4; k >= 1; k--) bat.add(dot(x, y, (r * k) / 4, k % 2 ? a : b), x - r, y - r, x + r, y);
    }
    bat.flush();
  }
  return 'wave scales';
}

function hempLattice(ctx) {
  const [bg, ln] = hues(ctx, 2, []);
  panel(ctx, bg);
  const s = 36;
  const h = s * 0.866;
  for (let j = -1; j < 13; j++) {
    const b = batcher(ctx, 999);
    for (let i = -1; i < 9; i++) {
      const x = X0 + i * s + (j % 2 ? s / 2 : 0);
      const y = Y0 + j * h;
      const hex = Array.from({ length: 6 }, (_, k) => pol(x, y, s / 1.732, (k * TAU) / 6 + Math.PI / 6));
      hex.forEach((p, k) => {
        const q = hex[(k + 1) % 6];
        const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        b.add(line(x, y, p[0], p[1], ln, 1.4) + line(x, y, m[0], m[1], ln, 0.8) + line(p[0], p[1], q[0], q[1], ln, 1.4), x - s, y - s, x + s, y + s);
      });
    }
    b.flush();
  }
  return 'hemp-leaf lattice';
}

function overlappingRings(ctx) {
  const [bg, a, b] = hues(ctx, 3, []);
  panel(ctx, bg);
  const r = ctx.pick([24, 30, 36]);
  for (let j = 0; j * r <= 298 + r; j++) {
    const bat = batcher(ctx, 999);
    for (let i = 0; i * r <= 212 + r; i++) {
      const [x, y] = [X0 + i * r, Y0 + j * r];
      bat.add(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r * 0.71)}" fill="none" stroke="${(i + j) % 3 ? a : b}" stroke-width="2.6"/>`, x - r, y - r, x + r, y + r);
    }
    bat.flush();
  }
  return 'overlapping rings';
}

function kilimSteps(ctx) {
  const pal = hues(ctx, 5, []);
  panel(ctx, pal[0]);
  const rows = 4;
  const h = 298 / rows;
  for (let j = 0; j < rows; j++) {
    const cy = Y0 + h * j + h / 2;
    ctx.poly(R(X0, Y0 + h * j, 212, 8), pal[4], still);
    for (let k = 0; k < 2; k++) {
      const cx = X0 + 53 + k * 106;
      const steps = 3;
      for (let s = steps; s >= 1; s--) {
        const w = s * 14;
        ctx.poly([[cx, cy - w * 0.9], [cx + w, cy], [cx, cy + w * 0.9], [cx - w, cy]], pal[(s + j + k) % 4 + 1], { inset: 1, still: true });
      }
      for (const sx of [-1, 1]) ctx.poly(R(cx + sx * 50 - 4, cy - 4, 8, 8), pal[(j + 2) % 4 + 1], still);
    }
  }
  return 'kilim steps';
}

function stepFret(ctx) {
  const [bg, fg, accent] = hues(ctx, 3, []);
  panel(ctx, bg);
  const u = 9;
  const bands = 5;
  for (let j = 0; j < bands; j++) {
    const y0 = Y0 + 12 + j * 58;
    const b = batcher(ctx, 999);
    for (let x = X0 - 40 + (j % 2) * 20; x < X1 + 40; x += u * 8) {
      const pts = [[x, y0 + u * 5], [x + u * 4, y0 + u * 5], [x + u * 4, y0 + u], [x + u, y0 + u], [x + u, y0 + u * 3], [x + u * 2, y0 + u * 3], [x + u * 2, y0 + u * 2], [x + u * 3, y0 + u * 2], [x + u * 3, y0 + u * 4], [x + u * 5, y0 + u * 4], [x + u * 5, y0], [x + u * 8, y0]];
      b.add(`<polyline points="${K.pts(pts)}" fill="none" stroke="${j % 2 ? accent : fg}" stroke-width="${fmt(u * 0.8)}" stroke-linejoin="miter"/>`, x, y0 - 4, x + u * 8, y0 + u * 5 + 4);
    }
    b.flush();
  }
  return 'step fret';
}

function batikCrackle(ctx) {
  const [bg, wax, accent] = hues(ctx, 3, []);
  panel(ctx, bg);
  for (let i = 0; i < 9; i++) {
    const [x, y] = [ctx.between(40, 200), ctx.between(80, 320)];
    ctx.circ(x, y, ctx.between(14, 34), wax);
    ctx.circ(x, y, ctx.between(4, 10), accent);
  }
  const b = batcher(ctx, 20);
  for (let i = 0; i < 70; i++) {
    let [x, y] = [ctx.between(X0, X1), ctx.between(Y0, Y1)];
    const pts = [[x, y]];
    for (let s = 0; s < 4; s++) {
      x += ctx.between(-24, 24);
      y += ctx.between(-24, 24);
      pts.push([x, y]);
    }
    b.add(`<polyline points="${K.pts(pts)}" fill="none" stroke="${ctx.ink}" stroke-width="0.9" opacity=".6"/>`, X0, Y0, X1, Y1);
  }
  b.flush();
  return 'batik crackle';
}

function roundMedallions(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 4, [bg]);
  const spots = ctx.rand() < 0.5 ? [[CX, CY, 92]] : [[CX, 128, 66], [CX, 274, 66]];
  spots.forEach(([x, y, r], m) => {
    const petals = ctx.int(8, 12);
    for (let i = 0; i < petals; i++) {
      const a = (i * TAU) / petals;
      const [px, py] = pol(x, y, r * 0.72, a);
      ctx.ellipse(px, py, r * 0.3, r * 0.15, pal[(i + m) % 2], a);
    }
    ctx.circ(x, y, r * 0.5, pal[2]);
    ctx.circ(x, y, r * 0.34, pal[3]);
    ctx.poly(starPoints(x, y, r * 0.3, r * 0.14, 8), pal[(m + 1) % 2], still);
    ctx.circ(x, y, r * 0.08, bg);
  });
  return 'round medallions';
}

function thresholdLoops(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(3), ctx.col(4)]);
  panel(ctx, bg);
  const [ln] = hues(ctx, 1, [bg]);
  const white = ctx.colors[1] === bg ? ln : ctx.colors[1];
  const s = 34;
  const n = 5;
  const ox = CX - ((n - 1) * s) / 2;
  const oy = CY - ((n + 1) * s) / 2;
  const b = batcher(ctx, 999);
  for (let j = 0; j < n + 2; j++) for (let i = 0; i < n; i++) b.add(dot(ox + i * s, oy + j * s, 3, white), ox + i * s - 3, oy + j * s - 3, ox + i * s + 3, oy + j * s + 3);
  b.flush();
  for (let j = 0; j < n + 1; j++) {
    const bb = batcher(ctx, 999);
    for (let i = 0; i < n - 1; i++) {
      const [x, y] = [ox + i * s + s / 2, oy + j * s + s / 2];
      const r = s * 0.62;
      bb.add(`<path d="M${fmt(x - r)} ${fmt(y)} Q${fmt(x - r)} ${fmt(y - r)} ${fmt(x)} ${fmt(y - r)} Q${fmt(x + r)} ${fmt(y - r)} ${fmt(x + r)} ${fmt(y)} Q${fmt(x + r)} ${fmt(y + r)} ${fmt(x)} ${fmt(y + r)} Q${fmt(x - r)} ${fmt(y + r)} ${fmt(x - r)} ${fmt(y)}Z" fill="none" stroke="${ln}" stroke-width="2.4" transform="rotate(45 ${fmt(x)} ${fmt(y)})"/>`, x - r * 1.5, y - r * 1.5, x + r * 1.5, y + r * 1.5);
    }
    bb.flush();
  }
  return 'threshold loops';
}

function barkCloth(ctx) {
  const bg = ctx.pick(['#C98B4E', ctx.col(0), ctx.colors[1]]);
  panel(ctx, bg);
  const ink = ctx.ink;
  const [accent] = hues(ctx, 1, [bg, ink]);
  const rows = 6;
  const h = 298 / rows;
  for (let j = 0; j < rows; j++) {
    const y = Y0 + j * h;
    const b = batcher(ctx, 999);
    b.add(`<rect x="${X0}" y="${fmt(y)}" width="212" height="4" fill="${ink}"/>`, X0, y, X1, y + 4);
    const t = (j + ctx.int(0, 2)) % 3;
    for (let x = X0; x < X1; x += 21.2) {
      if (t === 0) b.add(`<polygon points="${K.pts([[x, y + h], [x + 10.6, y + 8], [x + 21.2, y + h]])}" fill="${ink}"/>`, x, y, x + 22, y + h);
      else if (t === 1) b.add(`<polygon points="${K.pts([[x, y + 8], [x + 21.2, y + 8], [x + 10.6, y + h - 6]])}" fill="${(x / 21.2) % 2 < 1 ? ink : accent}"/>`, x, y, x + 22, y + h);
      else b.add(line(x + 4, y + 10, x + 17, y + h - 8, ink, 3) + line(x + 17, y + 10, x + 4, y + h - 8, ink, 3), x, y, x + 22, y + h);
    }
    b.flush();
  }
  return 'bark cloth';
}

function sashikoStitch(ctx) {
  const bg = ctx.pick([ctx.ink, ctx.col(2)]);
  panel(ctx, bg);
  const white = ctx.colors[1];
  const s = 26;
  const dash = ' stroke-dasharray="5 4"';
  for (let j = 0; j < 12; j++) {
    const b = batcher(ctx, 999);
    for (let i = 0; i < 9; i++) {
      const [x, y] = [X0 + i * s, Y0 + j * s];
      b.add(line(x, y + s / 2, x + s / 2, y, white, 1.6, dash) + line(x + s / 2, y, x + s, y + s / 2, white, 1.6, dash), x, y, x + s, y + s);
      if ((i + j) % 2) b.add(`<rect x="${fmt(x + s / 2 - 3)}" y="${fmt(y + s / 2 - 3)}" width="6" height="6" fill="none" stroke="${white}" stroke-width="1.4"/>`, x, y, x + s, y + s);
    }
    b.flush();
  }
  return 'sashiko stitching';
}

function cutPileMaze(ctx) {
  const bg = ctx.pick(['#C98B4E', ctx.colors[1], ctx.col(0)]);
  panel(ctx, bg);
  const ink = ctx.ink;
  const blocks = ctx.int(4, 6);
  for (let k = 0; k < blocks; k++) {
    const [x, y, w, h] = [ctx.between(X0, 150), ctx.between(Y0, 270), ctx.between(50, 100), ctx.between(50, 100)];
    const b = batcher(ctx, 999);
    for (let d = 4; d < Math.min(w, h) / 2; d += 8) {
      // Each ring of the labyrinth leaves one side open.
      const gap = ctx.int(0, 3);
      const c = [[x + d, y + d], [x + w - d, y + d], [x + w - d, y + h - d], [x + d, y + h - d]];
      c.forEach((p, q) => {
        if (q !== gap) b.add(line(p[0], p[1], c[(q + 1) % 4][0], c[(q + 1) % 4][1], ink, 3), x, y, x + w, y + h);
      });
    }
    b.flush();
  }
  return 'cut-pile maze';
}

function layeredApplique(ctx) {
  const pal = hues(ctx, 5, []);
  panel(ctx, pal[0]);
  const motifs = ctx.int(1, 2);
  for (let m = 0; m < motifs; m++) {
    const [cx, cy] = motifs === 1 ? [CX, CY] : [CX, 122 + m * 150];
    const size = motifs === 1 ? 92 : 62;
    const kind = ctx.int(0, 2);
    for (let k = 0; k < 5; k++) {
      const r = size - k * (size / 5.5);
      let pts;
      if (kind === 0) pts = starPoints(cx, cy, r, r * 0.6, 6);
      else if (kind === 1) pts = Array.from({ length: 24 }, (_, i) => pol(cx, cy, r * (1 + 0.12 * Math.sin(i * 2)), (i / 24) * TAU));
      else pts = [[cx, cy - r], [cx + r * 0.8, cy], [cx, cy + r], [cx - r * 0.8, cy]];
      ctx.poly(pts, pal[1 + (k % 4)], { inset: 1, still: true });
    }
  }
  return 'layered appliqué';
}

function tartan(ctx) {
  const [bg, a, b] = hues(ctx, 3, []);
  panel(ctx, bg);
  const sett = [ctx.between(20, 40), ctx.between(6, 12), ctx.between(10, 24), ctx.between(3, 6)];
  const span = sett.reduce((p, q) => p + q + 8, 0);
  for (let o = 0; o < 300; o += span) {
    let pos = o;
    sett.forEach((w, k) => {
      const c = k % 2 ? b : a;
      veil(ctx, R(X0 + pos, Y0, w, 298), c, 0.55);
      veil(ctx, R(X0, Y0 + pos, 212, w), c, 0.55);
      pos += w + 8;
    });
  }
  return 'tartan';
}

function herringbone(ctx) {
  const [bg, a, b] = hues(ctx, 3, []);
  panel(ctx, bg);
  const w = 26.5;
  const h = 14;
  for (let i = 0; i < 8; i++) {
    const bat = batcher(ctx, 999);
    const x = X0 + i * w;
    for (let y = Y0 - 20; y < Y1 + 20; y += h) {
      const dir = i % 2 ? 1 : -1;
      bat.add(`<polygon points="${K.pts([[x, y], [x + w, y + dir * 10], [x + w, y + dir * 10 + h - 3], [x, y + h - 3]])}" fill="${(Math.round((y - Y0) / h) + i) % 3 ? a : b}"/>`, x, y - 12, x + w, y + h + 12);
    }
    bat.flush();
  }
  return 'herringbone';
}

function whiplashCurves(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const pal = hues(ctx, 3, [bg]);
  const n = ctx.int(4, 7);
  for (let i = 0; i < n; i++) {
    const x0 = ctx.between(30, 210);
    const pts = [];
    let a = -Math.PI / 2 + ctx.between(-0.3, 0.3);
    let [x, y] = [x0, Y1];
    let curl = ctx.between(0.004, 0.012) * ctx.pick([-1, 1]);
    for (let s = 0; s < 64; s++) {
      a += curl;
      curl *= 1.06;
      x += Math.cos(a) * 6;
      y += Math.sin(a) * 6;
      pts.push([x, y]);
    }
    polyline(ctx, pts, pal[i % 3], 5 - i * 0.4);
    ctx.circ(x, y, 5, pal[i % 3]);
  }
  ring(ctx, CX, ctx.between(90, 140), ctx.between(20, 34), pal[0], 3);
  return 'whiplash curves';
}

function viennaChecks(ctx) {
  const bg = ctx.colors[1];
  panel(ctx, bg);
  const [accent] = hues(ctx, 1, [bg, ctx.ink]);
  const s = 26.5;
  for (let j = 0; j < 12; j++) {
    const b = batcher(ctx, 999);
    for (let i = 0; i < 8; i++) {
      const [x, y] = [X0 + i * s, Y0 + j * s];
      const border = i === 0 || j === 0 || i === 7 || j === 11;
      if (border && (i + j) % 2 === 0) b.add(`<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(s)}" height="${fmt(s)}" fill="${ctx.ink}"/>`, x, y, x + s, y + s);
      else if (!border && (i * 3 + j) % 7 === 0) b.add(`<rect x="${fmt(x + 6)}" y="${fmt(y + 6)}" width="${fmt(s - 12)}" height="${fmt(s - 12)}" fill="${accent}"/>`, x, y, x + s, y + s);
      else if (!border) b.add(`<rect x="${fmt(x + s / 2 - 1.5)}" y="${fmt(y + s / 2 - 1.5)}" width="3" height="3" fill="${ctx.ink}"/>`, x, y, x + s, y + s);
    }
    b.flush();
  }
  ctx.poly(rotRect(CX, CY, 60, 60, Math.PI / 4), ctx.ink, still);
  ctx.poly(rotRect(CX, CY, 34, 34, Math.PI / 4), accent, still);
  return 'Vienna checks';
}

module.exports = { paintedWall, wovenStrips, dotTracks, housetopQuilt, stripQuilt, mudcloth, shibori, ikatDiamonds, glazedTiles, starMosaic, waveScales, hempLattice, overlappingRings, kilimSteps, stepFret, batikCrackle, roundMedallions, thresholdLoops, barkCloth, sashikoStitch, cutPileMaze, layeredApplique, tartan, herringbone, whiplashCurves, viennaChecks };
