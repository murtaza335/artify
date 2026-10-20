'use strict';

// Cartoon characters and faces with ink outlines, all original: a rubber-hose character, a lanky cat, a mouse,
// a caped kid, a ghost, an alien, a dinosaur, a witch, a pirate, a monster under the bed, a grumpy cloud,
// a sun with sunglasses, a big-nosed face and a dizzy face.

const { TAU, fmt, pol, rectPts, starPoints, blob } = require('./engine');
const T = require('./toon');

const R = rectPts;
const still = { inset: 1, still: true };
// The panel colour is kept on ctx.bg, so figures and props drawn on it can stay clear of it.
const panel = (ctx, fill) => {
  ctx.bg = fill;
  ctx.poly(R(14, 48, 212, 298), fill, still);
};
const tone = (ctx, off = 4) => ctx.col(ctx.int(0, 7) + off);
const OE = T.outlineEllipse;
const OP = T.outlinePoly;
const OPath = T.outlinePath;

function rubberHose(ctx) {
  const skin = ctx.colors[1];
  panel(ctx, tone(ctx));
  const sway = ctx.between(-8, 8);
  const cx = 120 + sway;
  // Limbs first, so the body sits over them.
  const legs = [-1, 1].map((s) => [s, `M${cx + s * 14} 262 q${s * 26} 30 ${s * ctx.between(10, 30)} 60`]);
  legs.forEach(([s, d]) => T.hose(ctx, d, skin, 9, [cx - 50, 260, cx + 60, 330]));
  for (const s of [-1, 1]) OE(ctx, cx + s * 34, 326, 20, 9, ctx.ink, 3);
  // Each glove sits on the end of its own arm.
  const hands = [-1, 1].map((s) => {
    const bend = ctx.between(-30, 30);
    const reach = ctx.between(34, 48);
    const lift = ctx.between(-56, 20);
    T.hose(ctx, `M${fmt(cx + s * 36)} 206 q${fmt(s * 44)} ${fmt(bend)} ${fmt(s * reach)} ${fmt(lift)}`, skin, 8, [cx - 100, 140, cx + 100, 250]);
    return [cx + s * (36 + reach), 206 + lift];
  });
  OE(ctx, cx, 232, 38, 42, T.apart(ctx, ctx.col(ctx.int(0, 7)), [ctx.bg, skin], ctx.colors, 60));
  OP(ctx, [[cx - 36, 246], [cx + 36, 246], [cx + 34, 276], [cx - 34, 276]], ctx.col(ctx.int(0, 7) + 3));
  for (const [x, y] of hands) OE(ctx, x, y, 14, 14, '#FFFFFF', 3);
  T.cartoonHead(ctx, { x: cx, y: 134, s: 1.05, skin, pie: true, expr: ctx.pick(['excited', 'happy']) });
  OP(ctx, [[cx - 36, 96], [cx + 36, 96], [cx + 28, 64], [cx - 28, 64]], ctx.col(ctx.int(0, 7) + 2));
  OP(ctx, [[cx - 48, 96], [cx + 48, 96], [cx + 48, 104], [cx - 48, 104]], ctx.col(3));
  OP(ctx, [[cx - 12, 180], [cx + 12, 180], [cx + 20, 194], [cx - 20, 194]], ctx.col(3));
  return 'rubber-hose character';
}

function cartoonCat(ctx) {
  panel(ctx, tone(ctx));
  const fur = T.apart(ctx, ctx.col(ctx.pick([0, 7, 6, 5])), ctx.bg);
  const cx = 120;
  ctx.stroke(`M${cx + 56} 270 q50 -10 40 -80 q-8 -30 -28 -26`, ctx.ink, 17, cx + 80, 240, [cx + 40, 150, cx + 110, 280]);
  T.hose(ctx, `M${cx + 56} 270 q50 -10 40 -80 q-8 -30 -28 -26`, fur, 10, [cx + 40, 150, cx + 110, 280]);
  for (const s of [-1, 1]) T.hose(ctx, `M${cx + s * 22} 250 l${s * 8} 76`, fur, 9, [cx - 40, 246, cx + 40, 330]);
  OE(ctx, cx, 224, 52, 50, fur);
  for (let i = 0; i < 3; i++) ctx.line(cx - 30 + i * 30, 188, cx - 22 + i * 30, 210, ctx.ink, 4);
  OE(ctx, cx, 262, 30, 24, T.mix(fur, '#FFFFFF', 0.5), 3);
  for (const s of [-1, 1]) OP(ctx, [[cx + s * 28, 108], [cx + s * 56, 64], [cx + s * 60, 120]], fur);
  T.cartoonHead(ctx, { x: cx, y: 142, s: 1.0, skin: fur, expr: 'smug' });
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) ctx.line(cx + s * 40, 162 + i * 8, cx + s * 74, 154 + i * 16, ctx.ink, 2.4);
  return 'lanky cat';
}

function cartoonMouse(ctx) {
  panel(ctx, tone(ctx));
  const fur = T.apart(ctx, ctx.col(ctx.pick([1, 7, 5, 6])), ctx.bg);
  const cx = 110;
  ctx.stroke('M148 290 q50 4 42 -50 q-4 -20 14 -26', ctx.ink, 7, 175, 260, [140, 210, 214, 296]);
  OE(ctx, cx, 270, 46, 42, fur);
  for (const s of [-1, 1]) OE(ctx, cx + s * 28, 316, 18, 8, ctx.ink, 3);
  for (const s of [-1, 1]) {
    OE(ctx, cx + s * 52, 148, 30, 32, fur);
    ctx.circ(cx + s * 52, 148, 18, T.apart(ctx, ctx.col(6), fur, ctx.colors, 60));
  }
  T.cartoonHead(ctx, { x: cx, y: 188, s: 0.85, skin: fur, expr: 'excited', nose: false });
  OE(ctx, cx, 208, 9, 7, ctx.col(6), 3);
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) ctx.line(cx + s * 22, 216 + i * 6, cx + s * 56, 206 + i * 14, ctx.ink, 2.2);
  OP(ctx, [[170, 318], [218, 336], [170, 336]], T.apart(ctx, ctx.col(0), ctx.bg));
  ctx.circ(182, 329, 3.4, ctx.ink);
  ctx.circ(198, 332, 3, ctx.ink);
  return 'small mouse';
}

function superheroKid(ctx) {
  panel(ctx, ctx.col(ctx.pick([5, 2, 4])));
  const suit = T.apart(ctx, ctx.col(ctx.pick([3, 0, 2])), ctx.bg);
  const cape = T.apart(ctx, ctx.col(ctx.pick([3, 4, 0, 6])), [ctx.bg, suit], ctx.colors, 60);
  const tilt = ctx.between(-0.25, 0.1);
  const rot = (x, y) => [120 + (x - 120) * Math.cos(tilt) - (y - 200) * Math.sin(tilt), 200 + (x - 120) * Math.sin(tilt) + (y - 200) * Math.cos(tilt)];
  OP(ctx, [rot(80, 190), rot(30, 250), rot(14, 300), rot(70, 270), rot(110, 290), rot(130, 226)], cape);
  for (const s of [-1, 1]) T.hose(ctx, `M${rot(112 + s * 14, 296).join(' ')} L${rot(112 + s * 24, 340).join(' ')}`, suit, 11, [60, 280, 180, 350]);
  OP(ctx, [rot(86, 186), rot(154, 186), rot(144, 292), rot(96, 292)], suit);
  const [ex, ey] = rot(120, 236);
  OPath(ctx, `M${fmt(ex)} ${fmt(ey - 18)} l16 24 h-32 Z`, ctx.col(0), [ex - 16, ey - 18, ex + 16, ey + 6], 3);
  T.hose(ctx, `M${rot(150, 200).join(' ')} Q${rot(190, 160).join(' ')} ${rot(214, 140).join(' ')}`, suit, 10, [140, 130, 226, 210]);
  OE(ctx, rot(216, 138)[0], rot(216, 138)[1], 10, 10, ctx.colors[1], 3);
  const [hx, hy] = rot(120, 148);
  T.cartoonHead(ctx, { x: hx, y: hy, s: 0.9, skin: ctx.colors[1], expr: 'excited' });
  OP(ctx, [[hx - 40, hy - 14], [hx + 40, hy - 14], [hx + 34, hy + 8], [hx - 34, hy + 8]], ctx.ink, 3);
  return 'caped kid';
}

function friendlyGhost(ctx) {
  panel(ctx, ctx.col(4));
  for (let i = 0; i < 8; i++) T.sparkle(ctx, ctx.between(30, 210), ctx.between(60, 330), ctx.between(4, 9), ctx.colors[1]);
  const body = ctx.colors[1];
  const bob = ctx.between(-10, 10);
  const d = `M60 ${300 + bob} L60 190 Q60 90 120 90 Q180 90 180 190 L180 ${300 + bob} Q165 ${280 + bob} 150 ${300 + bob} Q135 ${322 + bob} 120 ${300 + bob} Q105 ${280 + bob} 90 ${300 + bob} Q75 ${322 + bob} 60 ${300 + bob} Z`;
  OPath(ctx, d, body, [56, 86, 184, 326 + bob], 4);
  for (const s of [-1, 1]) {
    OE(ctx, 120 + s * 78, 210 + s * 0 - 10, 18, 12, body, 3.5, s * 0.5);
    OE(ctx, 120 + s * 26, 168, 11, 15, ctx.ink, 2);
    ctx.circ(120 + s * 26 - 3, 163, 4, '#FFFFFF');
    T.blush(ctx, 120 + s * 46, 192, 20, ctx.col(6));
  }
  T.mouth(ctx, 120, 196, 22, ctx.pick(['smile', 'o', 'grin']));
  return 'friendly ghost';
}

function littleAlien(ctx) {
  panel(ctx, ctx.col(4));
  for (let i = 0; i < 10; i++) ctx.circ(ctx.between(24, 216), ctx.between(60, 330), ctx.between(1, 2.4), ctx.colors[1]);
  ctx.raw(`<polygon points="120,236 60,346 180,346" fill="${ctx.col(0)}" fill-opacity="0.35"/>`, 120, 300, [60, 236, 180, 346]);
  OE(ctx, 120, 236, 100, 26, ctx.col(5));
  OPath(ctx, 'M70 228 Q120 160 170 228 Z', T.mix(ctx.col(5), '#FFFFFF', 0.5), [70, 180, 170, 228], 3.5);
  for (let i = 0; i < 5; i++) ctx.circ(46 + i * 37, 244, 4.5, ctx.col(0));
  const skin = ctx.green(ctx.int(0, 3));
  for (const s of [-1, 1]) {
    ctx.line(120 + s * 22, 102, 120 + s * 40, 62, ctx.ink, 4);
    ctx.circ(120 + s * 40, 58, 7, ctx.col(3));
  }
  OP(ctx, [[100, 188], [140, 188], [136, 224], [104, 224]], skin);
  OE(ctx, 120, 136, 42, 50, skin);
  for (const [x, y, r] of [[102, 126, 11], [138, 126, 11], [120, 106, 8]]) { OE(ctx, x, y, r, r * 1.2, '#FFFFFF', 2.6); ctx.circ(x + 1, y + 1, r * 0.4, ctx.ink); }
  T.mouth(ctx, 120, 156, 22, 'grin');
  return 'little alien';
}

function cartoonDino(ctx) {
  panel(ctx, tone(ctx));
  const hide = ctx.green(ctx.int(0, 3));
  const side = ctx.pick([-1, 1]);
  const cx = 120;
  ctx.poly([[14, 322], [226, 322], [226, 346], [14, 346]], ctx.col(4) === ctx.ink ? ctx.col(2) : ctx.col(7), still);
  OPath(ctx, `M${cx - side * 40} 250 Q${cx - side * 110} 270 ${cx - side * 100} 316 Q${cx - side * 70} 290 ${cx - side * 30} 290 Z`, hide, [cx - 112, 246, cx + 40, 320], 3.5);
  for (let i = 0; i < 5; i++) OP(ctx, [[cx - side * (28 - i * 14) - 9, 176 + i * 6], [cx - side * (28 - i * 14) + 9, 176 + i * 6], [cx - side * (28 - i * 14), 150 + i * 6]], ctx.col(3));
  OE(ctx, cx, 250, 62, 64, hide);
  OE(ctx, cx + side * 10, 276, 40, 40, T.mix(hide, '#FFFFFF', 0.5), 3);
  for (const s of [-1, 1]) OE(ctx, cx + s * 30, 322, 22, 10, hide, 3.5);
  OE(ctx, cx + side * 34, 150, 52, 48, hide);
  OPath(ctx, `M${cx + side * 34} 164 L${cx + side * 90} 164 Q${cx + side * 92} 190 ${cx + side * 50} 192 Z`, ctx.col(3), [cx - 60, 150, cx + 100, 196], 3);
  for (let i = 0; i < 4; i++) ctx.poly([[cx + side * (56 + i * 8), 164], [cx + side * (62 + i * 8), 174], [cx + side * (66 + i * 8), 164]], ctx.colors[1], { inset: 1, still: true });
  OE(ctx, cx + side * 28, 134, 10, 12, '#FFFFFF', 2.6);
  ctx.circ(cx + side * 30, 136, 4, ctx.ink);
  for (const s of [-1, 1]) OE(ctx, cx + side * 56 + s * 4, 262, 9, 7, hide, 3);
  return 'round dinosaur';
}

function witchOnBroom(ctx) {
  panel(ctx, ctx.col(4));
  ctx.circ(ctx.pick([60, 180]), 100, ctx.between(26, 36), ctx.colors[1]);
  const tilt = ctx.between(-0.3, -0.1);
  const rot = (x, y) => [120 + (x - 120) * Math.cos(tilt) - (y - 220) * Math.sin(tilt), 220 + (x - 120) * Math.sin(tilt) + (y - 220) * Math.cos(tilt)];
  const stick = T.apart(ctx, ctx.col(0), ctx.bg);
  const [a, b] = [rot(24, 240), rot(190, 240)];
  ctx.stroke(`M${fmt(a[0])} ${fmt(a[1])} L${fmt(b[0])} ${fmt(b[1])}`, ctx.ink, 12, 120, 235, [10, 150, 230, 320]);
  ctx.line(a[0], a[1], b[0], b[1], stick, 7);
  OP(ctx, [rot(178, 226), rot(210, 214), rot(210, 266), rot(178, 254)], stick);
  // The rider sits on the stick and the cat rides behind her, both resting on it.
  const [bx, by] = rot(112, 208);
  OE(ctx, bx, by + 6, 26, 22, T.apart(ctx, ctx.col(ctx.int(0, 7)), ctx.bg));
  for (const s of [-1, 1]) T.hose(ctx, `M${fmt(bx + s * 10)} ${fmt(by + 24)} q${s * 14} 20 ${s * 22} 34`, ctx.colors[1], 7, [bx - 50, by + 20, bx + 50, by + 70]);
  const [kx, ky] = rot(64, 222);
  for (const s of [-1, 1]) OP(ctx, [[kx + s * 3, ky - 12], [kx + s * 11, ky - 30], [kx + s * 14, ky - 8]], ctx.ink, 2);
  OE(ctx, kx, ky, 14, 18, ctx.ink, 2.4);
  T.cartoonHead(ctx, { x: bx, y: by - 52, s: 0.62, skin: ctx.green(ctx.int(0, 3)), expr: 'excited' });
  OP(ctx, [[bx - 38, by - 72], [bx + 38, by - 72], [bx + 6, by - 150]], ctx.col(4) === ctx.ink ? ctx.col(2) : ctx.col(2));
  OP(ctx, [[bx - 54, by - 70], [bx + 54, by - 70], [bx + 54, by - 60], [bx - 54, by - 60]], ctx.col(2));
  for (let i = 0; i < 4; i++) T.sparkle(ctx, ctx.between(20, 70), ctx.between(250, 320), ctx.between(4, 9), ctx.col(0));
  return 'witch on a broom';
}

function pirateCaptain(ctx) {
  panel(ctx, ctx.col(ctx.pick([5, 2, 4])));
  const coat = ctx.col(ctx.pick([3, 4, 2]));
  OP(ctx, [[50, 346], [66, 252], [120, 232], [174, 252], [190, 346]], coat);
  OP(ctx, [[110, 236], [130, 236], [120, 290]], ctx.colors[1]);
  for (let i = 0; i < 3; i++) ctx.circ(120, 262 + i * 24, 4.5, ctx.col(0));
  const skin = ctx.pick(T.skinTones(ctx));
  T.cartoonHead(ctx, { x: 120, y: 168, s: 1.05, skin, expr: ctx.pick(['smug', 'excited']), bare: false });
  OPath(ctx, 'M70 190 Q120 280 170 190 Q150 232 120 238 Q90 232 70 190 Z', ctx.pick([ctx.ink, ctx.col(4)]), [70, 190, 170, 280], 3);
  OP(ctx, [[48, 130], [120, 80], [192, 130], [170, 130], [120, 108], [70, 130]], ctx.ink, 3);
  OP(ctx, [[60, 130], [180, 130], [190, 120], [50, 120]], ctx.col(0), 2.6);
  ctx.circ(120, 106, 9, ctx.colors[1]);
  OE(ctx, 100, 158, 17, 15, ctx.ink, 2.6);
  ctx.line(60, 140, 100, 158, ctx.ink, 3);
  const px = ctx.pick([48, 192]);
  OE(ctx, px, 242, 20, 24, ctx.col(3));
  OP(ctx, [[px - 6, 262], [px - 14, 300], [px + 6, 266]], ctx.col(5));
  OE(ctx, px + (px < 120 ? 6 : -6), 218, 12, 12, ctx.col(3));
  OPath(ctx, `M${px + (px < 120 ? 14 : -14)} 218 l${px < 120 ? 14 : -14} 6 l${px < 120 ? -14 : 14} 4 Z`, ctx.col(0), [px - 30, 210, px + 30, 232], 2.4);
  return 'pirate captain';
}

function monsterUnderBed(ctx) {
  panel(ctx, ctx.col(4));
  ctx.circ(ctx.pick([60, 180]), 100, 24, ctx.colors[1]);
  ctx.poly(R(14, 300, 212, 46), T.mix(ctx.col(4), ctx.ink, 0.5), still);
  const frame = ctx.col(ctx.pick([0, 2, 3]));
  OP(ctx, [[22, 214], [218, 214], [218, 230], [22, 230]], frame);
  OP(ctx, [[22, 230], [218, 230], [210, 270], [30, 270]], ctx.col(ctx.int(0, 7) + 3));
  for (const x of [34, 196]) OP(ctx, [[x - 6, 270], [x + 6, 270], [x + 6, 330], [x - 6, 330]], frame);
  OP(ctx, [[22, 150], [38, 150], [38, 214], [22, 214]], frame);
  ctx.poly(R(46, 272, 148, 52), ctx.ink, still);
  const eye = ctx.col(0);
  for (const s of [-1, 1]) { ctx.ellipse(120 + s * 24, 290, 9, 12, eye, 0); ctx.circ(120 + s * 24, 292, 4, ctx.ink); }
  let tooth = 'M82 316';
  for (let i = 0; i < 8; i++) tooth += ` l10 ${i % 2 ? 8 : -8}`;
  ctx.stroke(tooth, ctx.colors[1], 4, 120, 316, [80, 306, 170, 326]);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ctx.line(120 + s * (74 + i * 8), 326, 120 + s * (80 + i * 12), 340, ctx.colors[1], 3.4);
  OE(ctx, 66, 336, 18, 7, ctx.col(6), 3);
  OE(ctx, 94, 338, 18, 7, ctx.col(6), 3);
  return 'monster under the bed';
}

function grumpyCloud(ctx) {
  panel(ctx, tone(ctx));
  const c = T.mix(ctx.col(ctx.pick([5, 4, 2])), ctx.colors[1], 0.5);
  for (const [x, y, r] of [[120, 130, 56], [72, 154, 38], [168, 154, 38], [120, 170, 44]]) OE(ctx, x, y, r, r * 0.9, c, 3.5);
  ctx.ellipse(120, 140, 72, 52, c, 0);
  T.cartoonHead(ctx, { x: 120, y: 146, s: 0.7, skin: c, expr: 'angry', nose: false });
  for (let i = 0; i < 12; i++) {
    const x = 60 + i * 11 + ctx.between(-3, 3);
    const y = 210 + (i % 3) * 30 + ctx.between(0, 20);
    ctx.shape(`M${fmt(x)} ${fmt(y)} q8 14 0 20 q-8 -6 0 -20 Z`, ctx.col(5), x, y + 10, [x - 8, y, x + 8, y + 20]);
  }
  OP(ctx, [[130, 196], [110, 236], [126, 236], [108, 286], [146, 226], [128, 226], [144, 196]], ctx.col(0));
  ctx.poly(R(14, 326, 212, 20), ctx.green(0), still);
  return 'grumpy cloud';
}

function happySun(ctx) {
  panel(ctx, ctx.col(ctx.pick([5, 6, 2])));
  const sun = ctx.col(0);
  const n = ctx.int(10, 14);
  for (let i = 0; i < n; i++) {
    const a = (i * TAU) / n;
    OP(ctx, [pol(120, 196, 72, a - 0.12), pol(120, 196, 108, a), pol(120, 196, 72, a + 0.12)], ctx.col(ctx.pick([3, 0])), 3);
  }
  ctx.circ(120, 196, 70, ctx.ink);
  ctx.circ(120, 196, 66, sun);
  for (const s of [-1, 1]) OE(ctx, 120 + s * 26, 184, 22, 15, ctx.ink, 3);
  OP(ctx, [[96, 184], [144, 184], [140, 176], [100, 176]], ctx.ink, 3);
  T.mouth(ctx, 120, 220, 38, 'grin');
  for (const s of [-1, 1]) T.blush(ctx, 120 + s * 48, 214, 20);
  return 'sun with sunglasses';
}

function bigNoseFace(ctx) {
  panel(ctx, tone(ctx));
  const skin = ctx.pick(T.skinTones(ctx));
  const hair = T.apart(ctx, ctx.pick(T.hairTones(ctx)), ctx.bg, T.hairTones(ctx));
  const shape = ctx.pick(['round', 'bean']);
  // Spikes grow out of the crown: each base sits just inside the head outline, which then covers it.
  const rx = 48 * 1.35;
  const ry = (shape === 'bean' ? 92 : 100) * 1.35 * 0.525;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.36;
    const at = (t, k) => [120 + rx * k * Math.cos(t), 182 + ry * k * Math.sin(t)];
    OP(ctx, [at(a - 0.17, 0.86), at(a + 0.17, 0.86), at(a + ctx.between(-0.08, 0.08), ctx.between(1.32, 1.5))], hair, 3);
  }
  T.cartoonHead(ctx, { x: 120, y: 182, s: 1.35, skin, shape, expr: ctx.pick(['smug', 'excited', 'shocked', 'happy']), nose: false });
  OE(ctx, 120, 200, 24, 30, T.mix(skin, '#E5534B', 0.25), 3.5);
  ctx.circ(112, 206, 3, ctx.ink);
  ctx.circ(128, 206, 3, ctx.ink);
  for (const s of [-1, 1]) OE(ctx, 120 + s * 76, 190, 10, 22, skin, 3);
  return 'big-nosed face';
}

function dizzyFace(ctx) {
  panel(ctx, tone(ctx));
  const skin = T.apart(ctx, ctx.col(ctx.int(0, 7)), ctx.bg);
  T.cartoonHead(ctx, { x: 120, y: 200, s: 1.45, skin, bare: true });
  for (const s of [-1, 1]) {
    const cx = 120 + s * 36;
    OE(ctx, cx, 190, 22, 24, '#FFFFFF', 3);
    let d = '';
    for (let i = 0; i <= 26; i++) {
      const [x, y] = pol(cx, 190, 1.2 + i * 0.6, i * 0.5 * s);
      d += (i ? 'L' : 'M') + fmt(x) + ' ' + fmt(y);
    }
    ctx.stroke(d, ctx.ink, 2.4, cx, 190, [cx - 22, 166, cx + 22, 214]);
  }
  T.mouth(ctx, 120, 244, 40, 'wavy');
  for (let i = 0; i < 5; i++) {
    const [x, y] = pol(120, 112, 70, (i * TAU) / 5 + 0.3);
    ctx.poly(starPoints(x, Math.max(62, y), 12, 5, 5, ctx.between(0, 1)), T.apart(ctx, ctx.col(0), ctx.bg), { inset: 1, still: true });
  }
  return 'dizzy face';
}

module.exports = { rubberHose, cartoonCat, cartoonMouse, superheroKid, friendlyGhost, littleAlien, cartoonDino, witchOnBroom, pirateCaptain, monsterUnderBed, grumpyCloud, happySun, bigNoseFace, dizzyFace };
