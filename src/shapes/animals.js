'use strict';

// Cats, dogs, birds and gulls built from flat shards.

const { fmt, pol, slice } = require('./engine');

function body(ctx, cx, top, bottom, w0, w1, main, alt) {
  slice(ctx, (t) => w0 + (w1 - w0) * t, (t, b) => [cx + b, top + t * (bottom - top)], {
    bands: 4, big: 28, loosePct: 0.05, skipPct: 0, color: (b, i) => (i % 2 ? alt : main)
  });
}

function eyePair(ctx, cx, y, dx, rx, ry, iris, slit) {
  for (const s of [-1, 1]) {
    ctx.ellipse(cx + s * dx, y, rx, ry, ctx.colors[1]);
    ctx.circ(cx + s * dx, y, ry * 0.72, iris);
    if (slit) ctx.ellipse(cx + s * dx, y, ry * 0.22, ry * 0.68, ctx.ink);
    else ctx.circ(cx + s * dx, y, ry * 0.38, ctx.ink);
  }
}

function collar(ctx, cx, y, w, color) {
  ctx.poly([[cx - w, y], [cx + w, y], [cx + w * 0.9, y + 9], [cx - w * 0.9, y + 9]], color, { inset: 1, still: true });
  ctx.circ(cx, y + 14, 5, ctx.colors[0]);
}

function cat(ctx) {
  const cx = 120;
  const hw = ctx.between(38, 48);
  const hh = hw * 0.82;
  const headY = ctx.between(112, 124);
  const main = ctx.col(0);
  const alt = ctx.col(3);
  const pink = ctx.colors[6];
  const bodyTop = headY + hh * 0.6;
  const w1 = hw * 1.45;
  const side = ctx.rand() < 0.5 ? -1 : 1;

  // Tail curls up beside the body.
  const tx = cx + side * (w1 - 4);
  ctx.stroke(`M${fmt(tx)} 332 C${fmt(tx + side * 44)} 338 ${fmt(tx + side * 58)} 300 ${fmt(tx + side * 40)} 266`, main, 13, tx + side * 30, 300, [Math.min(tx, tx + side * 58), 262, Math.max(tx, tx + side * 58), 342]);
  ctx.circ(tx + side * 40, 266, 7, alt);

  body(ctx, cx, bodyTop, 342, hw * 0.8, w1, main, alt);

  // Ears, then the head over their bases.
  const tall = ctx.between(0.9, 1.7);
  for (const s of [-1, 1]) {
    ctx.poly([[cx + s * hw * 0.9, headY - hh * 0.4], [cx + s * hw * 0.55, headY - hh * (0.9 + tall * 0.55)], [cx + s * hw * 0.1, headY - hh * 0.95]], main, { inset: 1, still: true });
    ctx.poly([[cx + s * hw * 0.72, headY - hh * 0.55], [cx + s * hw * 0.55, headY - hh * (0.75 + tall * 0.4)], [cx + s * hw * 0.28, headY - hh * 0.85]], pink, { inset: 1, still: true });
  }
  const half = (s, color) => ctx.poly([
    [cx, headY - hh], [cx + s * hw * 0.6, headY - hh], [cx + s * hw, headY - hh * 0.2],
    [cx + s * hw * 0.85, headY + hh * 0.7], [cx + s * hw * 0.4, headY + hh], [cx, headY + hh]
  ], color, { inset: 1, still: true });
  half(-1, main);
  half(1, ctx.rand() < 0.5 ? main : alt);
  for (const dx of [-12, 0, 12]) ctx.poly([[cx + dx - 4, headY - hh], [cx + dx + 4, headY - hh], [cx + dx, headY - hh * 0.45]], alt, { inset: 1, still: true });

  eyePair(ctx, cx, headY - hh * 0.05, hw * 0.42, ctx.between(9, 11), ctx.between(8, 10), ctx.pick([ctx.colors[7], ctx.colors[0], ctx.colors[5]]), ctx.rand() < 0.6);
  ctx.poly([[cx - 5, headY + hh * 0.28], [cx + 5, headY + hh * 0.28], [cx, headY + hh * 0.4]], pink, { inset: 1, still: true });
  ctx.line(cx, headY + hh * 0.4, cx, headY + hh * 0.52, ctx.ink, 1.6);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      ctx.line(cx + s * hw * 0.45, headY + hh * 0.38 + k * 4, cx + s * (hw + 26), headY + hh * 0.2 + k * 10, ctx.colors[1], 1.6);
    }
  }
  if (ctx.rand() < 0.45) collar(ctx, cx, headY + hh * 0.98, hw * 0.55, ctx.col(5));
  for (const s of [-1, 1]) ctx.ellipse(cx + s * w1 * 0.45, 340, 14, 7, main);
  return 'cat';
}

function dog(ctx) {
  const cx = 120;
  const hw = ctx.between(42, 52);
  const hh = hw * 0.9;
  const headY = ctx.between(112, 124);
  const main = ctx.col(0);
  const alt = ctx.col(4);
  const cream = ctx.colors[1];
  const bodyTop = headY + hh * 0.6;
  const w1 = hw * 1.5;
  const side = ctx.rand() < 0.5 ? -1 : 1;

  // Wagging tail.
  const tx = cx + side * (w1 - 6);
  ctx.poly([[tx, 326], [tx + side * 40, 280 + ctx.between(-10, 14)], [tx + side * 22, 340]], main, { loose: true, inset: 1 });

  body(ctx, cx, bodyTop, 342, hw * 0.85, w1, main, ctx.rand() < 0.5 ? main : alt);
  for (const s of [-1, 1]) ctx.ellipse(cx + s * w1 * 0.45, 340, 15, 7, cream);

  // Ears behind the head: floppy or erect.
  const floppy = ctx.rand() < 0.6;
  for (const s of [-1, 1]) {
    if (floppy) {
      ctx.poly([[cx + s * hw * 0.7, headY - hh * 0.8], [cx + s * hw * 1.4, headY - hh * 0.2], [cx + s * hw * 1.15, headY + hh * 0.9], [cx + s * hw * 0.7, headY + hh * 0.2]], alt, { inset: 1, still: true });
    } else {
      ctx.poly([[cx + s * hw * 0.95, headY - hh * 0.5], [cx + s * hw * 0.75, headY - hh * 1.7], [cx + s * hw * 0.25, headY - hh * 0.95]], alt, { inset: 1, still: true });
    }
  }
  ctx.poly([
    [cx - hw * 0.7, headY - hh], [cx + hw * 0.7, headY - hh], [cx + hw, headY - hh * 0.4], [cx + hw, headY + hh * 0.5],
    [cx + hw * 0.6, headY + hh], [cx - hw * 0.6, headY + hh], [cx - hw, headY + hh * 0.5], [cx - hw, headY - hh * 0.4]
  ], main, { inset: 1, still: true });
  if (ctx.rand() < 0.6) ctx.circ(cx + ctx.pick([-1, 1]) * hw * 0.42, headY - hh * 0.3, hw * 0.3, alt);

  // Snout, nose and tongue.
  ctx.poly([[cx - hw * 0.5, headY + hh * 0.05], [cx + hw * 0.5, headY + hh * 0.05], [cx + hw * 0.42, headY + hh * 0.85], [cx - hw * 0.42, headY + hh * 0.85]], cream, { inset: 1, still: true });
  if (ctx.rand() < 0.6) ctx.poly([[cx - 8, headY + hh * 0.7], [cx + 8, headY + hh * 0.7], [cx + 6, headY + hh * 1.12], [cx - 6, headY + hh * 1.12]], ctx.colors[6], { inset: 1, still: true });
  ctx.ellipse(cx, headY + hh * 0.2, 11, 8, ctx.ink);
  ctx.line(cx, headY + hh * 0.28, cx, headY + hh * 0.58, ctx.ink, 1.8);
  ctx.stroke(`M${fmt(cx - 14)} ${fmt(headY + hh * 0.6)} Q${fmt(cx)} ${fmt(headY + hh * 0.78)} ${fmt(cx + 14)} ${fmt(headY + hh * 0.6)}`, ctx.ink, 1.8, cx, headY + hh * 0.66, [cx - 14, headY + hh * 0.6, cx + 14, headY + hh * 0.78]);
  for (const s of [-1, 1]) {
    ctx.circ(cx + s * hw * 0.42, headY - hh * 0.3, 8, cream);
    ctx.circ(cx + s * hw * 0.42, headY - hh * 0.3, 4, ctx.ink);
  }
  if (ctx.rand() < 0.55) collar(ctx, cx, headY + hh * 0.98, hw * 0.6, ctx.col(3));
  return 'dog';
}

function branch(ctx, y, tilt) {
  const x0 = 10;
  const x1 = 230;
  ctx.poly([[x0, y], [x1, y + tilt], [x1, y + tilt + 8], [x0, y + 8]], ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < 3; i++) {
    const x = ctx.between(30, 210);
    const yy = y + (tilt * (x - x0)) / (x1 - x0);
    ctx.poly([[x, yy], [x + 18, yy - ctx.between(8, 16)], [x + 26, yy + 2]], ctx.green(i), { loose: ctx.rand() < 0.3 });
  }
}

function songbird(ctx) {
  const by = ctx.between(290, 310);
  branch(ctx, by, ctx.between(-8, 8));
  const cx = 118;
  const cy = ctx.between(215, 235);
  const L = ctx.between(100, 118);
  const amp = ctx.between(34, 42);
  const tilt = ctx.between(-0.4, -0.15);
  const main = ctx.col(3);
  const alt = ctx.col(0);
  const R = (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    return [cx + dx * Math.cos(tilt) - dy * Math.sin(tilt), cy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  };

  // Legs reach the branch; the tail fans out behind.
  for (const dx of [-10, 12]) ctx.line(cx + dx, cy + amp * 0.6, cx + dx, by + 2, ctx.col(0), 3);
  const tail = R(cx + L / 2 - 8, cy + 6);
  for (let i = 0; i < 3; i++) {
    ctx.poly([tail, [tail[0] + ctx.between(34, 52), tail[1] + 8 + i * 12], [tail[0] + ctx.between(26, 40), tail[1] + 20 + i * 12]], ctx.col(5 + i), { inset: 1 });
  }
  slice(ctx, (t) => amp * Math.pow(Math.sin(Math.PI * (0.1 + 0.8 * t)), 0.8), (t, b) => R(cx - L / 2 + t * L, cy + b), {
    bands: ctx.int(4, 6), big: 14, loosePct: 0.05, skipPct: 0, color: (b, i) => (i ? alt : main)
  });
  const head = R(cx - L / 2 - 2, cy - amp * 0.5);
  const hr = ctx.between(18, 23);
  ctx.circ(head[0], head[1], hr, main);
  ctx.poly([[head[0] - hr + 2, head[1] - 4], [head[0] - hr - ctx.between(16, 24), head[1] + 3], [head[0] - hr + 2, head[1] + 9]], ctx.col(0), { inset: 1, still: true });
  ctx.circ(head[0] - 5, head[1] - 4, 6, ctx.colors[1]);
  ctx.circ(head[0] - 6, head[1] - 4, 3, ctx.ink);
  const sh = R(cx - L * 0.05, cy - amp * 0.2);
  for (let i = 0; i < 3; i++) {
    ctx.poly([sh, [sh[0] + ctx.between(40, 60), sh[1] + i * 10 + ctx.between(-6, 6)], [sh[0] + ctx.between(24, 36), sh[1] + 22 + i * 8]], ctx.col(i + 1), { loose: ctx.rand() < 0.2 });
  }
  return 'songbird';
}

function owl(ctx) {
  const cx = 120;
  const main = ctx.col(0);
  const alt = ctx.col(4);
  const by = ctx.between(300, 314);
  branch(ctx, by, 0);
  const top = 70;
  const bottom = by - 2;
  slice(ctx, (t) => 30 + 44 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62), (t, b) => [cx + b, top + t * (bottom - top)], {
    bands: 6, big: 30, loosePct: 0.05, skipPct: 0, color: (b, i) => (i % 2 ? alt : main)
  });
  // Ear tufts and wings.
  for (const s of [-1, 1]) {
    ctx.poly([[cx + s * 38, top + 12], [cx + s * 52, top - 22], [cx + s * 18, top + 2]], alt, { inset: 1, still: true });
    ctx.poly([[cx + s * 60, top + 70], [cx + s * 84, top + 110 + ctx.between(0, 30)], [cx + s * 52, bottom - 20], [cx + s * 44, top + 110]], ctx.col(5), { inset: 1 });
  }
  // Chest feathers as rows of chevrons.
  for (let row = 0; row < 3; row++) {
    for (let k = -1; k <= 1; k++) {
      const x = cx + k * 22 + (row % 2) * 11;
      const y = top + 130 + row * 28;
      ctx.poly([[x - 10, y], [x + 10, y], [x, y + 18]], ctx.col(row + k + 2), { inset: 1 });
    }
  }
  // Big eyes and beak.
  const ey = top + 52;
  for (const s of [-1, 1]) {
    ctx.circ(cx + s * 26, ey, 24, ctx.colors[1]);
    ctx.circ(cx + s * 26, ey, 15, ctx.col(5));
    ctx.circ(cx + s * 26, ey, 7, ctx.ink);
  }
  ctx.poly([[cx - 8, ey + 18], [cx + 8, ey + 18], [cx, ey + 38]], ctx.col(3), { inset: 1, still: true });
  for (const s of [-1, 1]) ctx.poly([[cx + s * 22, by - 4], [cx + s * 36, by - 4], [cx + s * 29, by + 10]], ctx.col(3), { inset: 1 });
  return 'owl';
}

function gull(ctx, cx, cy, size, tilt) {
  const R = (x, y) => {
    const dx = (x - cx) * size;
    const dy = (y - cy) * size;
    return [cx + dx * Math.cos(tilt) - dy * Math.sin(tilt), cy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  };
  const main = ctx.col(1);
  const tip = ctx.col(4);
  for (const s of [-1, 1]) {
    const lift = ctx.between(34, 54);
    // Wing feathers: three shards fanning out and up from the shoulder.
    ctx.poly([R(cx + s * 6, cy), R(cx + s * 52, cy - lift), R(cx + s * 40, cy + 2)], main, { inset: 1 });
    ctx.poly([R(cx + s * 6, cy), R(cx + s * 82, cy - lift + 14), R(cx + s * 64, cy + 8)], ctx.col(5), { inset: 1 });
    ctx.poly([R(cx + s * 52, cy - lift + 6), R(cx + s * 100, cy - lift + 26), R(cx + s * 78, cy - lift + 4)], tip, { inset: 1 });
  }
  const b = R(cx, cy + 8);
  ctx.ellipse(b[0], b[1], 14 * size, 8 * size, main, tilt);
  const h = R(cx - 14, cy + 6);
  ctx.circ(h[0], h[1], 6 * size, main);
  const k = R(cx - 22, cy + 7);
  ctx.poly([[k[0], k[1] - 3 * size], [k[0] - 9 * size, k[1] + 2 * size], [k[0], k[1] + 4 * size]], ctx.col(0), { inset: 1, still: true });
}

function gulls(ctx) {
  const count = ctx.int(1, 3);
  for (let i = 0; i < count; i++) {
    gull(ctx, 120 + ctx.between(-14, 14), 110 + i * 95, i === 0 ? ctx.between(0.95, 1.1) : ctx.between(0.6, 0.8), ctx.between(-0.25, 0.25));
  }
  // A cloud and a sun for company.
  ctx.circ(ctx.between(30, 70), ctx.between(300, 330), ctx.between(14, 20), ctx.col(0));
  for (let i = 0; i < 3; i++) ctx.circ(150 + i * 22, 320 - (i % 2) * 8, 18 + (i % 2) * 6, ctx.colors[1]);
  return 'gulls';
}

module.exports = { cat, dog, songbird, owl, gulls };
