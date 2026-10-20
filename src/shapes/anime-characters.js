'use strict';

// Anime characters, all original archetypes: a spiky-haired hero, a magical girl, a student, a ninja, a ronin,
// a mecha pilot, a giant robot, a cat-eared girl, a fox spirit, an oni, an idol, an old master, a dark lord,
// a round mascot and a monster attack.

const { TAU, fmt, pol, rectPts, rotRect, starPoints, blob, circleBand } = require('./engine');
const T = require('./toon');

const R = rectPts;
const still = { inset: 1, still: true };
// The panel colour is kept on ctx.bg, so figures and props drawn on it can stay clear of it.
const panel = (ctx, fill) => {
  ctx.bg = fill;
  ctx.poly(R(14, 48, 212, 298), fill, still);
};
const tone = (ctx, off = 4) => ctx.col(ctx.int(0, 7) + off);

// A whole person: figure plus head, with the head sized to sit on the neck. The back hair (and anything in
// o.behind, such as a tail) is drawn before the body, and the hands share the face's skin.
function person(ctx, o = {}) {
  const hs = o.hs || 0.85;
  const look = T.headLook(ctx, o);
  const f = T.figure(ctx, {
    x: o.x, y: o.y === undefined ? 244 : o.y, s: o.s || 1.25, pose: o.pose, flip: o.flip, top: o.top, bottom: o.bottom, skin: look.skin, skirt: o.skirt,
    behind: (a) => {
      if (o.behind) o.behind(a);
      T.hairBack(ctx, a.head[0], a.neck[1] - 50 * hs, hs, look.hair, look.style);
    }
  });
  const head = T.animeHead(ctx, { ...look, x: f.head[0], y: f.neck[1] - 50 * hs, s: hs, expr: o.expr, accessories: o.accessories, back: false });
  return { f, head, hs };
}

function spikyHero(ctx) {
  panel(ctx, ctx.col(ctx.pick([5, 2, 3])));
  const glow = T.apart(ctx, ctx.colors[1], ctx.bg);
  T.speedLines(ctx, 120, 210, 60, 160, 20, glow, { area: [16, 50, 224, 344] });
  const flip = ctx.rand() < 0.5;
  const p = person(ctx, { x: flip ? 142 : 98, pose: 'punch', style: 'spiky', expr: 'excited', accessories: ['headband'], top: ctx.col(3), bottom: ctx.ink, flip });
  const [hx, hy] = p.f.hands[1];
  // The rings around the fist shrink near the panel edge rather than spill over it.
  const room = Math.min(hx - 16, 224 - hx, hy - 50, 344 - hy);
  for (let i = 1; i <= 2; i++) {
    const r = Math.min(14 + i * 12, room - 2 - (2 - i) * 10);
    if (r > 6) ctx.raw(`<circle cx="${fmt(hx)}" cy="${fmt(hy)}" r="${fmt(r)}" fill="none" stroke="${glow}" stroke-width="3"/>`, hx, hy, [hx - r, hy - r, hx + r, hy + r]);
  }
  return 'spiky-haired hero';
}

function magicalGirl(ctx) {
  const bg = ctx.col(ctx.pick([6, 5, 1]));
  panel(ctx, bg);
  for (let i = 0; i < 6; i++) T.sparkle(ctx, ctx.between(30, 210), ctx.between(60, 330), ctx.between(6, 14), ctx.colors[1]);
  const p = person(ctx, { pose: 'wave', style: 'twin', expr: 'happy', skirt: true, accessories: ['ribbon'], top: ctx.colors[1], bottom: ctx.col(3) });
  const [hx, hy] = p.f.hands[1];
  ctx.line(hx, hy, hx + 16, hy - 56, ctx.col(0), 4);
  ctx.poly(starPoints(hx + 17, hy - 70, 20, 9, 5, -Math.PI / 2), ctx.col(0), { inset: 1, still: true });
  ctx.circ(hx + 17, hy - 70, 5, ctx.colors[1]);
  return 'magical girl';
}

function schoolUniform(ctx) {
  panel(ctx, ctx.col(ctx.pick([5, 0, 6])));
  ctx.poly(R(14, 306, 212, 40), ctx.green(0), still);
  const p = person(ctx, { pose: 'stand', style: ctx.pick(['bob', 'long', 'pony']), expr: ctx.pick(['happy', 'shy', 'calm']), skirt: ctx.rand() < 0.6, top: ctx.colors[1], bottom: ctx.col(4) });
  const [nx, ny] = p.f.neck;
  ctx.poly([[nx - 15, ny + 6], [nx + 15, ny + 6], [nx, ny + 34]], ctx.col(4), still);
  ctx.circ(nx, ny + 30, 6, ctx.col(3));
  const [bx, by] = p.f.hands[0];
  ctx.poly(R(bx - 16, by - 4, 24, 30), ctx.col(2), still);
  for (let i = 0; i < 10; i++) ctx.ellipse(ctx.between(24, 216), ctx.between(60, 300), 5, 3, ctx.col(6), ctx.between(0, 3));
  return 'student with a school bag';
}

function ninjaRunner(ctx) {
  panel(ctx, ctx.col(4));
  T.speedLines(ctx, 120, 200, 70, 170, 18, ctx.col(5), { area: [16, 50, 224, 344], spread: 0.03 });
  const flip = ctx.rand() < 0.5;
  const p = person(ctx, { pose: 'run', s: 1.12, flip, style: 'pony', expr: 'angry', top: ctx.ink, bottom: ctx.col(2) });
  const { x, y, s } = p.head;
  ctx.poly(R(x - 38 * s, y + 8 * s, 76 * s, 44 * s), ctx.ink, still);
  const dir = flip ? 1 : -1;
  ctx.stroke(`M${fmt(x + dir * 30 * s)} ${fmt(y - 22 * s)} q${fmt(dir * 40)} ${fmt(-10)} ${fmt(dir * 66)} ${fmt(16)} t${fmt(dir * 30)} ${fmt(10)}`, ctx.col(3), 7, x + dir * 60, y - 20, [x - 70, y - 40, x + 100, y + 20].map((v, i) => (i === 0 ? Math.min(x + dir * 30 * s, x + dir * 126) - 8 : i === 2 ? Math.max(x + dir * 30 * s, x + dir * 126) + 8 : v)));
  return 'masked runner';
}

function wanderingRonin(ctx) {
  panel(ctx, tone(ctx, 4));
  ctx.circ(ctx.pick([60, 180]), 100, ctx.between(22, 32), ctx.colors[1]);
  ctx.poly(R(14, 316, 212, 30), ctx.col(4), still);
  const p = person(ctx, { pose: 'stand', style: 'messy', expr: 'calm', skirt: true, top: ctx.col(2), bottom: ctx.col(4), hair: ctx.pick(T.hairTones(ctx)) });
  const { x, y, s } = p.head;
  ctx.poly([[x - 78 * s, y - 6 * s], [x, y - 74 * s], [x + 78 * s, y - 6 * s]], ctx.col(0), { inset: 1, still: true });
  ctx.poly([[x - 78 * s, y - 6 * s], [x + 78 * s, y - 6 * s], [x + 60 * s, y + 2 * s], [x - 60 * s, y + 2 * s]], T.mix(ctx.col(0), ctx.ink, 0.3), still);
  ctx.line(p.f.hip[0] - 26, p.f.hip[1] - 4, p.f.hip[0] + 56, p.f.hip[1] + 46, ctx.colors[1], 4);
  ctx.line(p.f.hip[0] - 26, p.f.hip[1] - 4, p.f.hip[0] - 40, p.f.hip[1] - 14, ctx.ink, 7);
  for (let i = 0; i < 4; i++) {
    const yy = ctx.between(120, 300);
    ctx.stroke(`M${fmt(24 + i * 10)} ${fmt(yy)} q40 -12 80 0`, ctx.colors[1], 2.5, 60, yy - 4, [20, yy - 12, 130, yy + 4]);
  }
  return 'wandering swordsman';
}

function mechaPilot(ctx) {
  panel(ctx, ctx.col(4));
  for (let i = 0; i < 6; i++) ctx.poly(R(14, 60 + i * 50, 212, 6), ctx.col(2), still);
  ctx.circ(120, 190, 88, ctx.col(5));
  const suit = ctx.col(ctx.pick([3, 0, 2]));
  const p = person(ctx, { pose: 'stand', style: ctx.pick(['spiky', 'messy', 'pony']), expr: ctx.pick(['calm', 'smug']), top: suit, bottom: suit });
  const [hx, hy] = p.f.hands[1];
  ctx.circ(hx + 4, hy + 10, 18, ctx.colors[1]);
  ctx.poly([[hx - 10, hy + 6], [hx + 18, hy + 6], [hx + 14, hy + 16], [hx - 6, hy + 16]], ctx.ink, still);
  return 'mecha pilot';
}

function giantRobot(ctx) {
  const pick = ctx.col(ctx.pick([2, 5, 3, 0]));
  const trimPick = ctx.col(ctx.int(0, 7) + 3);
  panel(ctx, ctx.col(ctx.int(0, 7) + 4));
  const halo = T.apart(ctx, ctx.col(ctx.pick([0, 6])), ctx.bg, ctx.colors, 50);
  const c = T.apart(ctx, pick, [ctx.bg, halo]);
  const trim = T.apart(ctx, trimPick, [c, ctx.bg], ctx.colors, 60);
  ctx.circ(120, 150, 70, halo);
  ctx.poly([[14, 346], [14, 300], [40, 300], [40, 280], [70, 280], [70, 310], [100, 310], [100, 290], [140, 290], [140, 306], [170, 306], [170, 284], [200, 284], [200, 300], [226, 300], [226, 346]], ctx.ink, still);
  ctx.poly(R(78, 262, 30, 76), c, still);
  ctx.poly(R(132, 262, 30, 76), c, still);
  ctx.poly(R(70, 330, 46, 12), trim, still);
  ctx.poly(R(124, 330, 46, 12), trim, still);
  ctx.poly([[84, 150], [156, 150], [168, 262], [72, 262]], c, still);
  ctx.poly([[92, 168], [148, 168], [152, 216], [88, 216]], T.mix(c, ctx.ink, 0.25), still);
  ctx.circ(120, 192, 14, ctx.colors[1]);
  ctx.circ(120, 192, 7, ctx.col(3));
  const raise = ctx.rand() < 0.5;
  for (const side of [-1, 1]) {
    // The arm hangs from under the shoulder pad, or swings up from it; the pad goes on top to cover the joint.
    if (raise && side > 0) {
      ctx.poly(rotRect(192, 118, 22, 66, 0.2), c, still);
      ctx.poly(rotRect(185, 84, 26, 18, 0.2), trim, still);
    } else ctx.poly(R(120 + side * 70 - (side > 0 ? 0 : 20), 170, 20, 84), c, still);
    ctx.poly([[120 + side * 40, 144], [120 + side * 80, 140], [120 + side * 82, 176], [120 + side * 44, 180]], trim, still);
  }
  ctx.poly(R(100, 108, 40, 44), c, still);
  ctx.poly([[100, 108], [140, 108], [134, 94], [106, 94]], trim, still);
  for (const side of [-1, 1]) ctx.poly([[120 + side * 6, 96], [120 + side * 38, 62], [120 + side * 24, 98]], ctx.col(0), { inset: 1, still: true });
  ctx.poly(R(104, 122, 32, 8), ctx.col(0), still);
  ctx.poly(R(110, 138, 20, 8), ctx.ink, still);
  return 'giant robot';
}

function catEarGirl(ctx) {
  panel(ctx, ctx.col(ctx.pick([6, 1, 0])));
  for (let i = 0; i < 6; i++) T.sparkle(ctx, ctx.between(30, 210), ctx.between(60, 330), ctx.between(6, 11), ctx.colors[1]);
  const flip = ctx.rand() < 0.5;
  const hair = ctx.pick(T.hairTones(ctx));
  const dir = flip ? 1 : -1;
  const tail = (a) => {
    const [x, y] = a.hip;
    ctx.stroke(`M${fmt(x - dir * 10)} ${fmt(y)} q${fmt(-dir * 60)} ${fmt(-10)} ${fmt(-dir * 54)} ${fmt(-70)}`, T.apart(ctx, hair, ctx.bg, T.hairTones(ctx)), 10, x - dir * 50, y - 40, [x - 80, y - 80, x + 80, y + 4]);
  };
  person(ctx, { pose: 'wave', flip, style: ctx.pick(['bob', 'twin']), hair, expr: 'happy', skirt: true, accessories: ['catEars'], top: ctx.col(5), bottom: ctx.col(3), behind: tail });
  return 'cat-eared girl';
}

function foxSpirit(ctx) {
  panel(ctx, ctx.col(4));
  const fur = ctx.col(ctx.pick([0, 3, 6]));
  const n = ctx.int(3, 5);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.55;
    const [tx, ty] = pol(120, 270, 120, a);
    const [lx, ly] = pol(120, 270, 52, a - 0.45);
    const [rx, ry] = pol(120, 270, 52, a + 0.45);
    ctx.shape(`M120 270 Q${fmt(lx)} ${fmt(ly)} ${fmt(tx)} ${fmt(ty)} Q${fmt(rx)} ${fmt(ry)} 120 270 Z`, fur, 120, 200, [Math.min(lx, tx, rx, 120) - 4, Math.min(ly, ty, ry) - 4, Math.max(lx, tx, rx, 120) + 4, 272]);
    ctx.circ(tx, ty, 8, ctx.colors[1]);
  }
  const p = person(ctx, { pose: 'stand', style: 'long', expr: 'smug', skirt: true, accessories: ['foxEars'], top: ctx.colors[1], bottom: ctx.col(3), hair: fur, hs: 0.8 });
  // The mask is worn on the side of the head, over the ear and clear of the eye.
  const { x: hx, y: hy } = p.head;
  const k = p.hs;
  ctx.poly([[hx + 46 * k, hy - 34 * k], [hx + 74 * k, hy - 34 * k], [hx + 74 * k, hy + 10 * k], [hx + 60 * k, hy + 26 * k], [hx + 46 * k, hy + 10 * k]], ctx.colors[1], still);
  ctx.line(hx + 54 * k, hy - 24 * k, hx + 66 * k, hy - 4 * k, ctx.col(3), 3);
  for (let i = 0; i < 3; i++) {
    const x = ctx.between(30, 210);
    const y = ctx.between(70, 150);
    ctx.shape(`M${fmt(x)} ${fmt(y - 14)} Q${fmt(x + 10)} ${fmt(y)} ${fmt(x)} ${fmt(y + 8)} Q${fmt(x - 10)} ${fmt(y)} ${fmt(x)} ${fmt(y - 14)} Z`, ctx.col(5), x, y, [x - 10, y - 14, x + 10, y + 8]);
  }
  return 'fox spirit';
}

function oniWarrior(ctx) {
  panel(ctx, ctx.col(4));
  const skin = ctx.col(ctx.pick([3, 5, 2]));
  const p = person(ctx, { pose: 'stand', style: 'messy', hair: ctx.ink, skin, expr: 'angry', accessories: ['horns'], top: skin, bottom: ctx.col(0), hs: 0.88 });
  for (let i = 0; i < 4; i++) ctx.poly([[p.f.hip[0] - 22 + i * 12, p.f.hip[1] + 10], [p.f.hip[0] - 14 + i * 12, p.f.hip[1] + 10], [p.f.hip[0] - 18 + i * 12, p.f.hip[1] + 40]], ctx.ink, { inset: 1, still: true });
  const [hx, hy] = p.f.hands[1];
  ctx.line(hx, hy + 30, hx + 6, hy - 70, ctx.col(4) === ctx.ink ? ctx.col(2) : ctx.col(2), 9);
  ctx.ellipse(hx + 7, hy - 80, 17, 34, ctx.col(2), 0.05);
  for (let i = 0; i < 6; i++) ctx.circ(hx + 7 + ctx.between(-14, 14), hy - 80 + ctx.between(-26, 26), 3.4, ctx.colors[1]);
  return 'horned warrior';
}

function idolSinger(ctx) {
  panel(ctx, ctx.col(4));
  for (let i = 0; i < 3; i++) {
    const x = 50 + i * 70;
    ctx.raw(`<polygon points="${x},48 ${x - 44},346 ${x + 44},346" fill="${ctx.col(i * 2 + 5)}" fill-opacity="0.4"/>`, x, 200, [x - 44, 48, x + 44, 346]);
  }
  const p = person(ctx, { pose: 'sing', style: 'twin', expr: 'excited', skirt: true, top: ctx.col(6), bottom: ctx.col(3) });
  // The microphone runs from the hand to beside the mouth.
  const [hx, hy] = p.f.hands[1];
  const [mx, my] = [p.head.x + 13 * p.hs, p.head.y + 44 * p.hs];
  ctx.line(hx, hy + 4, mx, my, ctx.ink, 5);
  ctx.circ(mx, my - 2, 7, ctx.colors[1]);
  for (let i = 0; i < 5; i++) {
    const x = ctx.between(30, 210);
    const y = ctx.between(70, 320);
    ctx.shape(`M${fmt(x)} ${fmt(y + 8)} L${fmt(x - 10)} ${fmt(y - 2)} Q${fmt(x - 10)} ${fmt(y - 12)} ${fmt(x)} ${fmt(y - 5)} Q${fmt(x + 10)} ${fmt(y - 12)} ${fmt(x + 10)} ${fmt(y - 2)} Z`, ctx.col(3), x, y, [x - 10, y - 12, x + 10, y + 8]);
  }
  return 'stage idol';
}

function oldMaster(ctx) {
  panel(ctx, ctx.col(ctx.pick([0, 5, 6])));
  ctx.circ(120, 150, 70, ctx.colors[1]);
  ctx.poly([[14, 346], [14, 280], [90, 240], [150, 280], [226, 250], [226, 346]], ctx.col(4), still);
  const robe = ctx.col(ctx.pick([2, 3, 4]));
  ctx.poly([[90, 190], [150, 190], [190, 340], [50, 340]], robe, still);
  ctx.poly([[100, 190], [140, 190], [120, 250]], T.mix(robe, '#FFFFFF', 0.3), still);
  ctx.line(190, 118, 196, 330, ctx.col(4), 5);
  ctx.circ(190, 114, 8, ctx.col(0));
  for (const side of [-1, 1]) ctx.poly([[120 + side * 28, 196], [120 + side * 76, 250], [120 + side * 60, 276], [120 + side * 22, 226]], robe, still);
  const skin = ctx.pick(T.skinTones(ctx));
  // Hands come out of the sleeves; the right one grips the staff.
  ctx.circ(54, 266, 9, skin);
  ctx.circ(194, 264, 9, skin);
  const head = T.animeHead(ctx, { x: 120, y: 150, s: 0.8, style: 'long', hair: ctx.colors[1], expr: 'happy', skin });
  ctx.poly([[84, 176], [156, 176], [136, 262], [120, 276], [104, 262]], ctx.colors[1], still);
  return 'old master';
}

function darkLord(ctx) {
  panel(ctx, ctx.col(4));
  ctx.circ(120, 150, 64, ctx.col(3));
  const cape = ctx.col(ctx.pick([3, 4, 2]));
  ctx.poly([[70, 180], [170, 180], [226, 346], [14, 346]], cape, still);
  ctx.poly([[90, 200], [150, 200], [170, 346], [70, 346]], T.mix(cape, ctx.ink, 0.4), still);
  const p = person(ctx, { pose: 'stand', style: 'long', hair: ctx.ink, skin: ctx.pick(T.skinTones(ctx).slice(3)), expr: 'smug', accessories: ['horns'], top: ctx.ink, bottom: ctx.ink, hs: 0.85 });
  const { x, y, s } = p.head;
  for (const side of [-1, 1]) ctx.poly([[x + side * 16 * s, y + 52 * s], [x + side * 52 * s, y + 6 * s], [x + side * 60 * s, y + 60 * s]], cape, still);
  for (const side of [-1, 1]) ctx.circ(x + side * 22 * s * 1.1, y + 10 * s + 2, 3, ctx.col(0));
  return 'dark lord';
}

function chibiCritter(ctx) {
  const bg = ctx.col(ctx.int(0, 7) + 4);
  const body = ctx.col(ctx.int(0, 7));
  panel(ctx, bg);
  for (let i = 0; i < 7; i++) T.sparkle(ctx, ctx.between(30, 210), ctx.between(60, 330), ctx.between(5, 10), ctx.colors[1]);
  const species = ctx.int(0, 3);
  ctx.ellipse(120, 330, 70, 10, T.mix(bg, ctx.ink, 0.3), 0);
  for (const side of [-1, 1]) ctx.ellipse(120 + side * 34, 308, 18, 14, T.mix(body, ctx.ink, 0.15), 0);
  if (species === 0) for (const side of [-1, 1]) ctx.poly([[120 + side * 26, 150], [120 + side * 66, 90], [120 + side * 70, 170]], body, { inset: 1, still: true });
  else if (species === 1) { ctx.line(120, 150, 128, 100, ctx.ink, 4); ctx.circ(130, 94, 10, ctx.col(0)); }
  else if (species === 2) for (const side of [-1, 1]) ctx.ellipse(120 + side * 18, 112, 10, 26, ctx.green(0), side * 0.5);
  else ctx.poly([[120, 146], [108, 96], [132, 96]], ctx.colors[1], { inset: 1, still: true });
  blob(ctx, 120, 222, 82, 0.05, body, 8);
  ctx.ellipse(120, 252, 46, 38, T.mix(body, '#FFFFFF', 0.45), 0);
  for (const side of [-1, 1]) {
    T.grp(ctx, `<circle cx="${120 + side * 28}" cy="204" r="13" fill="${ctx.ink}"/><circle cx="${120 + side * 28 - 4}" cy="199" r="5" fill="#FFFFFF"/><circle cx="${120 + side * 28 + 4}" cy="209" r="2.4" fill="#FFFFFF"/>`, 120 + side * 28, 204, 14, 14);
    T.blush(ctx, 120 + side * 52, 228, 20);
  }
  T.mouth(ctx, 120, 226, 16, 'cat');
  return 'round mascot';
}

function kaijuAttack(ctx) {
  panel(ctx, ctx.col(4));
  for (let i = 0; i < 10; i++) ctx.circ(ctx.between(24, 216), ctx.between(60, 160), ctx.between(1, 2.4), ctx.colors[1]);
  ctx.circ(ctx.pick([48, 192]), 90, ctx.between(14, 20), ctx.colors[1]);
  const hide = ctx.col(ctx.pick([2, 7, 3]));
  const side = ctx.pick([-1, 1]);
  const cx = 120 + side * 20;
  ctx.poly([[cx - 56, 346], [cx - 40, 190], [cx - 14, 130], [cx + 14, 112], [cx + 38, 126], [cx + 52, 190], [cx + 64, 346]], hide, still);
  for (let i = 0; i < 4; i++) ctx.poly([[cx - 46 + i * 2, 190 + i * 30], [cx - 78, 176 + i * 30], [cx - 46, 214 + i * 30]], ctx.col(0), { inset: 1, still: true });
  ctx.poly([[cx - 6, 112], [cx + 38, 126], [cx + 16 * -side + 30, 148]], ctx.col(3), still);
  for (const k of [-1, 1]) ctx.circ(cx + 8 + k * 12, 132, 5, ctx.col(0));
  const beamX = cx + side * 10;
  ctx.raw(`<polygon points="${beamX},146 ${beamX + side * 70},300 ${beamX + side * 40},330" fill="${ctx.col(0)}" fill-opacity="0.85"/>`, beamX, 230, [Math.min(beamX, beamX + side * 70), 146, Math.max(beamX, beamX + side * 70), 330]);
  const n = ctx.int(6, 8);
  for (let i = 0; i < n; i++) {
    const x = 14 + i * (212 / n);
    const h = ctx.between(40, 120);
    ctx.poly(R(x, 346 - h, 212 / n - 3, h), ctx.ink, still);
    for (let k = 0; k < 3; k++) ctx.poly(R(x + 5, 346 - h + 10 + k * 18, 6, 8), ctx.col(0), still);
  }
  return 'monster attack';
}

module.exports = { spikyHero, magicalGirl, schoolUniform, ninjaRunner, wanderingRonin, mechaPilot, giantRobot, catEarGirl, foxSpirit, oniWarrior, idolSinger, oldMaster, darkLord, chibiCritter, kaijuAttack };
