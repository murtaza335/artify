'use strict';

// Abstract faces: poster-style cubist portraits, Picasso-style double views, split faces, Bauhaus figures,
// Klee-style grids, minimal vector faces, masks, profiles, pop-art panels, faceted collages, one-line portraits,
// a Rubin vase and a sun and moon.

const { TAU, fmt, pol, slice, rectPts, rotRect, curvePoly } = require('./engine');

const R = rectPts;

function almond(ctx, x, y, w, h, color) {
  ctx.shape(`M${fmt(x - w)} ${fmt(y)} Q${fmt(x)} ${fmt(y - h * 1.4)} ${fmt(x + w)} ${fmt(y)} Q${fmt(x)} ${fmt(y + h)} ${fmt(x - w)} ${fmt(y)} Z`, color, x, y, [x - w, y - h, x + w, y + h * 0.6]);
}

function eye(ctx, x, y, w, h, iris, ink) {
  almond(ctx, x, y, w, h, ctx.colors[1]);
  ctx.circ(x + ctx.between(-w * 0.2, w * 0.2), y - h * 0.1, h * 0.7, iris);
  ctx.circ(x, y - h * 0.1, h * 0.35, ink);
}

const ellipsePoints = (cx, cy, rx, ry, a0, a1, n = 18) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + ((a1 - a0) * i) / n;
  return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
});

// ---------------------------------------------------------------------------
// 1. Poster-style cubist portrait, rebuilt from the reference composition with several palettes.
// ---------------------------------------------------------------------------

const POSTER_PALETTES = [
  { bg: '#3B3451', hair: '#1F2A3B', col2: '#58426A', warm: '#D45A38', red: '#C9504E', skin: '#E3DAC0', ochre: '#E0AB54', yellow: '#F2CD6F', lips: '#5C3A78', orange: '#E08E38', nose: '#58426A', base: '#DF9138', eyeBg: '#66A7B5', hair2: '#2495AE', pupil: '#1F2A3B', green: '#93AB5F', cheek: '#D45A38', wine: '#A8454A' },
  { bg: '#14202B', hair: '#0B0F14', col2: '#2B3F52', warm: '#E5534B', red: '#F0675E', skin: '#FFF0B8', ochre: '#F5C518', yellow: '#FFE27A', lips: '#8E2A33', orange: '#FF8A2B', nose: '#2B3F52', base: '#F5C518', eyeBg: '#62C3E3', hair2: '#1E7B8F', pupil: '#0B0F14', green: '#6BBF5A', cheek: '#E5534B', wine: '#8E2A33' },
  { bg: '#4A1B2A', hair: '#2A0F14', col2: '#6B2A4A', warm: '#F79BB0', red: '#E5534B', skin: '#FFE9D6', ochre: '#F2B134', yellow: '#FFD98A', lips: '#8E2A33', orange: '#FF8A5C', nose: '#6B2A4A', base: '#E9A93B', eyeBg: '#8AD6F0', hair2: '#3F8793', pupil: '#2A0F14', green: '#9BDB8A', cheek: '#F79BB0', wine: '#8E2A33' },
  { bg: '#F5EBCF', hair: '#12202A', col2: '#1E7B8F', warm: '#D83A2E', red: '#B8261F', skin: '#FFFBF0', ochre: '#F5C518', yellow: '#FFE27A', lips: '#12202A', orange: '#F28C28', nose: '#12202A', base: '#D83A2E', eyeBg: '#62C3E3', hair2: '#1E7B8F', pupil: '#12202A', green: '#2A7236', cheek: '#D83A2E', wine: '#12202A' }
];

// Shapes in the poster's own coordinates: [kind, data, role].
const POSTER = [
  ['poly', [[143, 143], [1285, 143], [1285, 1850], [143, 1850]], 'bg'],
  ['path', 'M143 205 C330 205 470 270 530 362 L212 362 L212 1668 L143 1668 Z', 'hair'],
  ['poly', [[212, 362], [327, 362], [327, 1668], [212, 1668]], 'col2'],
  ['poly', [[327, 1130], [715, 1130], [715, 1475], [327, 1475]], 'warm'],
  ['poly', [[327, 1475], [715, 1475], [715, 1668], [327, 1668]], 'red'],
  ['path', 'M212 362 L535 362 C650 440 715 560 715 650 L715 1415 C400 1415 220 1000 212 362 Z', 'skin'],
  ['path', 'M327 650 L715 650 L715 1415 C500 1420 400 1300 327 1130 Z', 'ochre'],
  ['poly', [[382, 690], [715, 690], [715, 1130], [382, 1130]], 'yellow'],
  ['path', 'M327 652 L605 652 C540 690 440 722 382 690 Z', 'ochre'],
  ['path', 'M327 652 L410 605 C430 620 450 635 470 635 C490 635 505 620 518 603 L605 652 Z', 'lips'],
  ['poly', [[550, 1130], [715, 1130], [715, 1176], [550, 1176]], 'orange'],
  ['poly', [[715, 690], [590, 1028], [715, 1028]], 'nose'],
  ['poly', [[143, 1668], [800, 1668], [800, 1850], [143, 1850]], 'base'],
  ['poly', [[715, 1318], [800, 1318], [800, 1750], [715, 1750]], 'base'],
  ['poly', [[715, 260], [1070, 260], [1070, 362], [715, 362]], 'ochre'],
  ['poly', [[715, 362], [1070, 362], [1070, 652], [715, 652]], 'eyeBg'],
  ['path', 'M1068 260 C1190 280 1210 480 1190 600 C1175 700 1150 770 1135 815 L1040 750 L1040 362 L1068 362 Z', 'hair2'],
  ['poly', [[728, 538], [1005, 538], [1005, 600], [728, 600]], 'skin'],
  ['path', 'M728 540 C790 490 940 480 1005 540 C940 590 800 600 728 540 Z', 'lips'],
  ['path', 'M795 503 C805 535 835 560 868 560 C905 560 935 535 942 503 C905 488 835 488 795 503 Z', 'pupil'],
  ['path', 'M715 650 C870 650 985 700 1042 750 C1010 900 975 1170 890 1262 L890 1590 L800 1590 L800 1316 C770 1316 735 1322 715 1330 Z', 'skin'],
  ['path', 'M1042 750 L1138 815 C1110 900 1150 980 1200 1060 C1260 1150 1290 1250 1262 1350 C1240 1450 1160 1505 1060 1505 C990 1505 940 1495 890 1485 L890 1262 C960 1170 1010 900 1042 750 Z', 'green'],
  ['circle', [970, 915, 137], 'cheek'],
  ['poly', [[715, 1130], [795, 1130], [795, 1200], [715, 1200]], 'warm'],
  ['path', 'M800 1850 L800 1590 L1222 1590 C1160 1740 1000 1830 800 1850 Z', 'wine'],
  ['path', 'M1222 1590 L1285 1590 L1285 1850 L800 1850 C1000 1830 1160 1740 1222 1590 Z', 'col2']
];

function cubistPoster(ctx) {
  const pal = ctx.pick(POSTER_PALETTES);
  const flip = ctx.rand() < 0.5;
  const T = (x, y) => {
    const X = 20 + (x - 143) * 0.175;
    return [flip ? 240 - X : X, 50 + (y - 143) * 0.175];
  };
  // A few roles can be swapped for variety.
  const swap = { cheek: ctx.pick([pal.cheek, pal.ochre, pal.hair2, pal.green]), green: ctx.pick([pal.green, pal.hair2, pal.warm]) };
  POSTER.forEach(([kind, data, role]) => {
    const color = swap[role] || pal[role];
    if (kind === 'poly') {
      ctx.poly(data.map(([x, y]) => T(x, y)), color, { inset: 1, still: true });
    } else if (kind === 'circle') {
      const [cx, cy] = T(data[0], data[1]);
      ctx.circ(cx, cy, data[2] * 0.175, color);
    } else {
      const nums = data.match(/-?\d+\.?\d*|[A-Za-z]/g);
      let d = '';
      const xs = [];
      const ys = [];
      for (let i = 0; i < nums.length; i++) {
        if (/[A-Za-z]/.test(nums[i])) {
          d += nums[i];
        } else {
          const [x, y] = T(Number(nums[i]), Number(nums[i + 1]));
          i++;
          xs.push(x);
          ys.push(y);
          d += fmt(x) + ' ' + fmt(y) + ' ';
        }
      }
      ctx.shape(d.trim(), color, (Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]);
    }
  });
  return 'cubist poster face';
}

// ---------------------------------------------------------------------------
// 2. Picasso-style double view: a frontal half and a profile half in one head.
// ---------------------------------------------------------------------------

function picasso(ctx) {
  ctx.poly(R(14, 50, 212, 296), ctx.col(4), { inset: 1, still: true });
  ctx.poly([[14, 50], [120, 50], [60, 346], [14, 346]], ctx.col(2), { inset: 1, still: true });
  const skinA = ctx.col(ctx.int(0, 7));
  const skinB = ctx.col(ctx.int(0, 7) + 3);
  ctx.poly([[96, 90], [146, 96], [150, 140], [176, 196], [152, 210], [158, 232], [148, 242], [154, 254], [148, 292], [120, 306], [92, 292]], skinB, { inset: 1, still: true });
  ctx.poly([...ellipsePoints(100, 196, 58, 108, Math.PI / 2, (3 * Math.PI) / 2, 20), [120, 90], [120, 304]], skinA, { inset: 1, still: true });
  ctx.poly([[40, 130], [90, 56], [186, 70], [200, 160], [150, 120], [110, 110]], ctx.col(ctx.int(0, 7)), { inset: 1, still: true });
  eye(ctx, 82, 168, 22, 10, ctx.col(5), ctx.ink);
  ctx.circ(142, 166, 12, ctx.colors[1]);
  ctx.circ(145, 166, 6, ctx.ink);
  ctx.poly([[150, 150], [172, 200], [146, 204]], ctx.col(ctx.int(0, 7)), { inset: 1, still: true });
  ctx.poly([[86, 232], [152, 238], [150, 252], [88, 250]], ctx.col(3), { inset: 1, still: true });
  ctx.poly([[100, 306], [140, 306], [190, 346], [60, 346]], ctx.col(0), { inset: 1, still: true });
  ctx.stroke('M120 90 L120 304', ctx.ink, 3, 120, 200, [118, 90, 122, 304]);
  ctx.stroke('M146 96 L150 140 L176 196 L152 210 L158 232 L148 242 L154 254 L148 292', ctx.ink, 3, 152, 190, [146, 96, 176, 292]);
  ctx.circ(ctx.between(50, 70), ctx.between(80, 110), 10, ctx.col(6));
  return 'double-view face';
}

// ---------------------------------------------------------------------------
// 3. A face split into two hard-edge halves over color planes.
// ---------------------------------------------------------------------------

function splitFace(ctx) {
  ctx.poly(R(14, 50, 106, 150), ctx.col(2), { inset: 1, still: true });
  ctx.poly(R(120, 50, 106, 150), ctx.col(0), { inset: 1, still: true });
  ctx.poly(R(14, 200, 106, 146), ctx.col(3), { inset: 1, still: true });
  ctx.poly(R(120, 200, 106, 146), ctx.col(5), { inset: 1, still: true });
  const left = ctx.col(ctx.int(0, 7));
  const right = ctx.col(ctx.int(0, 7) + 4);
  ctx.poly(ellipsePoints(120, 196, 66, 112, Math.PI / 2, (3 * Math.PI) / 2), left, { inset: 1, still: true });
  ctx.poly(ellipsePoints(120, 196, 66, 112, -Math.PI / 2, Math.PI / 2), right, { inset: 1, still: true });
  for (let i = 0; i < 5; i++) ctx.poly(R(60, 100 + i * 22, 60, 5), ctx.colors[1], { inset: 1, still: true });
  for (let i = 0; i < 9; i++) ctx.circ(ctx.between(130, 176), ctx.between(110, 280), 2.5, ctx.colors[1]);
  const ey = ctx.between(160, 176);
  ctx.circ(92, ey, 11, ctx.colors[1]);
  ctx.circ(92, ey, 5, ctx.ink);
  ctx.circ(150, ey - 6, 15, ctx.colors[1]);
  ctx.circ(150, ey - 6, 7, ctx.ink);
  ctx.poly([[118, ey + 6], [104, ey + 56], [132, ey + 56]], ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(ctx.between(92, 108), ey + 80, ctx.between(36, 56), 10), ctx.col(3), { inset: 1, still: true });
  ctx.poly([[120, 50], [120, 308], [118, 308], [118, 50]], ctx.ink, { inset: 1, still: true });
  [[14, 199, 212, 3]].forEach(([x, y, w, h]) => ctx.poly(R(x, y, w, h), ctx.ink, { inset: 1, still: true }));
  return 'split face';
}

// ---------------------------------------------------------------------------
// 4. A Bauhaus-style stage figure from a circle, square and triangle in three colors.
// ---------------------------------------------------------------------------

function triadic(ctx) {
  const y = ctx.pick(['#F5C518', '#E9A93B']);
  const p = ctx.pick(['#F28FA6', '#F79BB0']);
  const k = ctx.kind === 'dark' ? '#8E2A33' : '#12202A';
  const cream = ctx.colors[1];
  ctx.poly(R(14, 50, 212, 296), ctx.col(2), { inset: 1, still: true });
  ctx.raw(`<circle cx="120" cy="120" r="76" fill="none" stroke="${cream}" stroke-width="3" opacity=".7"/>`, 120, 120, [44, 44, 196, 196]);
  ctx.circ(120, 120, 46, cream);
  ctx.shape('M120 74 A46 46 0 0 1 120 166 Z', p, 143, 120, [120, 74, 166, 166]);
  ctx.poly(R(103, 108, 14, 3), k, { inset: 1, still: true });
  ctx.poly(R(123, 108, 14, 3), k, { inset: 1, still: true });
  ctx.poly([[120, 112], [114, 134], [126, 134]], k, { inset: 1, still: true });
  ctx.poly(R(108, 146, 24, 5), k, { inset: 1, still: true });
  ctx.poly(R(110, 166, 20, 18), y, { inset: 1, still: true });
  ctx.poly(R(84, 184, 72, 72), y, { inset: 1, still: true });
  ctx.poly([[84, 184], [156, 184], [84, 256]], p, { inset: 1, still: true });
  ctx.circ(120, 220, 14, k);
  ctx.poly([[60, 256], [180, 256], [150, 330], [90, 330]], k, { inset: 1, still: true });
  ctx.poly([[96, 256], [144, 256], [120, 330]], y, { inset: 1, still: true });
  for (const s of [-1, 1]) {
    ctx.poly(R(120 + s * 60 - 6, 190, 12, 60), s === -1 ? p : y, { inset: 1, still: true });
    ctx.poly(R(120 + s * 22 - 8, 330, 16, 16), k, { inset: 1, still: true });
  }
  return 'bauhaus figure';
}

// ---------------------------------------------------------------------------
// 5. A square grid face in the manner of Klee's Senecio.
// ---------------------------------------------------------------------------

function kleeGrid(ctx) {
  ctx.poly(R(14, 50, 212, 296), ctx.colors[1], { inset: 1, still: true });
  const hue = ctx.int(0, 7);
  const x0 = 50;
  const y0 = 80;
  const s = 28;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      ctx.poly(R(x0 + c * s, y0 + r * s, s, s), ctx.col(hue + ((r * 2 + c) % 3)), { inset: 0.97, still: true });
    }
  }
  for (const dx of [-1, 1]) {
    ctx.circ(x0 + 70 + dx * 34, y0 + 52, 20, ctx.colors[1]);
    ctx.circ(x0 + 70 + dx * 34, y0 + 52, 9, ctx.ink);
  }
  ctx.poly([[x0 + 70, y0 + 66], [x0 + 56, y0 + 104], [x0 + 84, y0 + 104]], ctx.col(3), { inset: 1, still: true });
  ctx.poly(R(x0 + 40, y0 + 128, 60, 10), ctx.col(4), { inset: 1, still: true });
  for (let i = 0; i < 4; i++) ctx.poly([[x0 + i * 38, y0], [x0 + i * 38 + 19, y0 - 30], [x0 + i * 38 + 38, y0]], ctx.col(hue + 4 + i), { inset: 1, still: true });
  ctx.poly(R(x0 + 52, y0 + 168, 36, 60), ctx.col(hue + 2), { inset: 1, still: true });
  ctx.poly([[x0 - 20, 340], [x0 + 160, 340], [x0 + 140, y0 + 228], [x0 + 0, y0 + 228]], ctx.col(hue + 5), { inset: 1, still: true });
  return 'grid portrait';
}

// ---------------------------------------------------------------------------
// 6. A minimal vector face: a color disc, big almond eyes and a few strokes.
// ---------------------------------------------------------------------------

function minimalFace(ctx) {
  ctx.circ(120, 190, 118, ctx.col(ctx.int(0, 7)));
  ctx.circ(120, 200, 82, ctx.pick([ctx.colors[1], ctx.colors[6]]));
  const tilt = ctx.between(-0.15, 0.15);
  const y = 184;
  for (const s of [-1, 1]) {
    const x = 120 + s * 36;
    almond(ctx, x, y + s * tilt * 30, 26, 14, ctx.colors[1]);
    ctx.circ(x + s * 3, y - 2 + s * tilt * 30, 9, ctx.col(5));
    ctx.circ(x + s * 3, y - 2 + s * tilt * 30, 4, ctx.ink);
    ctx.line(x - 26, y - 14 + s * tilt * 30, x + 26, y - 22 + s * tilt * 30, ctx.ink, 3);
  }
  ctx.poly([[120, 196], [108, 238], [132, 238]], ctx.col(ctx.int(0, 7)), { inset: 1, still: true });
  ctx.ellipse(120, 266, 22, 7, ctx.col(3));
  ctx.shape('M30 150 Q60 60 120 66 Q184 60 212 160 Q170 100 120 112 Q70 104 30 150 Z', ctx.col(4), 120, 100, [30, 60, 212, 160]);
  ctx.circ(ctx.between(34, 50), 222, 8, ctx.col(0));
  ctx.circ(ctx.between(190, 206), 222, 8, ctx.col(0));
  return 'minimal face';
}

// ---------------------------------------------------------------------------
// 7. A symmetrical mask.
// ---------------------------------------------------------------------------

function mask(ctx) {
  const main = ctx.col(ctx.int(0, 7));
  const accent = ctx.col(ctx.int(0, 7) + 3);
  const dark = ctx.ink;
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) ctx.poly([[120 + s * (20 + i * 22), 100], [120 + s * (34 + i * 22), 52 - i * 2], [120 + s * (46 + i * 22), 104]], ctx.col(i * 2 + 1), { inset: 1, still: true });
  }
  ctx.poly(ellipsePoints(120, 200, 82, 130, 0, TAU, 28), main, { inset: 1, still: true });
  for (const s of [-1, 1]) {
    ctx.poly([[120, 110], [120 + s * 76, 150], [120 + s * 60, 200], [120, 160]], accent, { inset: 1, still: true });
    almond(ctx, 120 + s * 38, 176, 26, 11, dark);
    ctx.poly([[120 + s * 14, 232], [120 + s * 74, 220], [120 + s * 60, 262], [120 + s * 22, 262]], ctx.col(5), { inset: 1, still: true });
    for (let k = 0; k < 3; k++) ctx.line(120 + s * (30 + k * 10), 214, 120 + s * (34 + k * 10), 244, dark, 2.5);
    ctx.circ(120 + s * 90, 218, 11, ctx.col(0));
  }
  ctx.poly([[120, 120], [106, 216], [134, 216]], ctx.col(4), { inset: 1, still: true });
  ctx.poly(R(94, 276, 52, 22), dark, { inset: 1, still: true });
  for (let k = 0; k < 4; k++) ctx.poly(R(100 + k * 12, 278, 6, 18), ctx.colors[1], { inset: 1, still: true });
  ctx.poly([[100, 326], [140, 326], [128, 346], [112, 346]], ctx.col(3), { inset: 1, still: true });
  return 'mask';
}

// ---------------------------------------------------------------------------
// 8. A side profile built from shards.
// ---------------------------------------------------------------------------

function profile(ctx) {
  ctx.poly(R(14, 50, 212, 296), ctx.col(2), { inset: 1, still: true });
  ctx.circ(ctx.between(60, 90), 110, 40, ctx.col(0));
  const skin = ctx.col(ctx.int(0, 7));
  const shade = ctx.col(ctx.int(0, 7) + 3);
  ctx.poly([[70, 60], [160, 56], [184, 130], [150, 160], [100, 140], [60, 160]], ctx.col(4), { inset: 1, still: true });
  ctx.poly([[100, 120], [150, 118], [160, 150], [190, 214], [162, 226], [168, 244], [158, 252], [166, 266], [152, 298], [100, 300]], skin, { inset: 1, still: true });
  ctx.poly([[100, 120], [128, 120], [124, 300], [100, 300]], shade, { inset: 1, still: true });
  ctx.poly([[90, 300], [160, 300], [200, 346], [60, 346]], ctx.col(5), { inset: 1, still: true });
  ctx.poly([[96, 300], [160, 300], [150, 330], [110, 330]], skin, { inset: 1, still: true });
  almond(ctx, 150, 176, 16, 7, ctx.colors[1]);
  ctx.circ(154, 176, 4.5, ctx.ink);
  ctx.poly([[142, 160], [170, 154], [172, 160], [144, 166]], ctx.ink, { inset: 1, still: true });
  ctx.poly([[152, 254], [168, 254], [162, 266], [154, 264]], ctx.col(3), { inset: 1, still: true });
  for (let i = 0; i < 3; i++) ctx.line(30 + i * 8, 130 + i * 60, 90 + i * 8, 150 + i * 60, ctx.col(4 + i), 3);
  return 'profile';
}

// ---------------------------------------------------------------------------
// 9. Four pop-art panels of one face in four palettes.
// ---------------------------------------------------------------------------

function popPanels(ctx) {
  const panel = (x, y, w, h, bg, skin, hair, lip) => {
    ctx.poly(R(x, y, w, h), bg, { inset: 1, still: true });
    const cx = x + w / 2;
    const cy = y + h / 2 + 4;
    ctx.shape(`M${fmt(x + 8)} ${fmt(y + h)} Q${fmt(cx)} ${fmt(y + h * 0.7)} ${fmt(x + w - 8)} ${fmt(y + h)} Z`, hair, cx, y + h * 0.85, [x, y + h * 0.7, x + w, y + h]);
    ctx.ellipse(cx, cy, w * 0.3, h * 0.38, skin);
    ctx.shape(`M${fmt(cx - w * 0.32)} ${fmt(cy - h * 0.12)} Q${fmt(cx)} ${fmt(cy - h * 0.62)} ${fmt(cx + w * 0.32)} ${fmt(cy - h * 0.12)} Q${fmt(cx)} ${fmt(cy - h * 0.3)} ${fmt(cx - w * 0.32)} ${fmt(cy - h * 0.12)} Z`, hair, cx, cy - h * 0.3, [cx - w * 0.32, cy - h * 0.62, cx + w * 0.32, cy - h * 0.1]);
    for (const s of [-1, 1]) {
      ctx.ellipse(cx + s * w * 0.13, cy - h * 0.04, w * 0.07, h * 0.035, ctx.colors[1]);
      ctx.circ(cx + s * w * 0.13, cy - h * 0.04, w * 0.025, ctx.ink);
    }
    ctx.poly([[cx, cy - h * 0.02], [cx - w * 0.05, cy + h * 0.1], [cx + w * 0.05, cy + h * 0.1]], hair, { inset: 1, still: true });
    ctx.ellipse(cx, cy + h * 0.2, w * 0.1, h * 0.03, lip);
  };
  const w = 102;
  const h = 144;
  const schemes = [
    ['#F5C518', '#F28FA6', '#12202A', '#D83A2E'],
    ['#62C3E3', '#FFF0B8', '#8E2A33', '#E5534B'],
    ['#E5534B', '#F5C518', '#1F2A3B', '#FFF0B8'],
    ['#9BDB8A', '#FFE9D6', '#6B2A4A', '#F79BB0']
  ].sort(() => ctx.rand() - 0.5);
  schemes.forEach(([bg, skin, hair, lip], i) => panel(14 + (i % 2) * (w + 6), 56 + Math.floor(i / 2) * (h + 6), w, h, bg, skin, hair, lip));
  return 'pop panels';
}

// ---------------------------------------------------------------------------
// 10. A faceted collage: a head cut into overlapping triangles.
// ---------------------------------------------------------------------------

function facetedFace(ctx) {
  const cx = 120;
  const cy = 196;
  const n = ctx.int(10, 14);
  const rim = Array.from({ length: n }, (_, i) => {
    const a = (i * TAU) / n + ctx.between(-0.1, 0.1);
    return [cx + Math.cos(a) * 68 * ctx.between(0.85, 1.08), cy + Math.sin(a) * 112 * ctx.between(0.88, 1.06)];
  });
  const centre = [cx + ctx.between(-14, 14), cy + ctx.between(-20, 20)];
  const mid = rim.map(([x, y]) => [cx + (x - cx) * 0.55 + ctx.between(-6, 6), cy + (y - cy) * 0.55 + ctx.between(-6, 6)]);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ctx.poly([mid[i], rim[i], rim[j], mid[j]], ctx.col(i * 2 + ctx.int(0, 2)), { inset: 0.98, loose: ctx.rand() < 0.1 });
    ctx.poly([centre, mid[i], mid[j]], ctx.col(i * 3 + 1), { inset: 0.98 });
  }
  almond(ctx, 96, 176, 22, 10, ctx.colors[1]);
  almond(ctx, 146, 170, 22, 10, ctx.colors[1]);
  ctx.circ(98, 175, 5, ctx.ink);
  ctx.circ(148, 169, 5, ctx.ink);
  ctx.poly([[122, 178], [108, 228], [138, 224]], ctx.col(4), { inset: 1, still: true });
  ctx.poly([[96, 262], [150, 258], [142, 274], [104, 276]], ctx.col(3), { inset: 1, still: true });
  for (let i = 0; i < 3; i++) ctx.poly([[ctx.between(20, 200), ctx.between(52, 90)], [ctx.between(30, 210), ctx.between(52, 90)], [ctx.between(60, 180), ctx.between(80, 120)]], ctx.col(i * 2 + 5), { inset: 1, loose: true });
  return 'faceted portrait';
}

// ---------------------------------------------------------------------------
// 11. A portrait drawn as one flowing line over offset color blobs.
// ---------------------------------------------------------------------------

function smoothPath(points) {
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    d += ` C${fmt(p1[0] + (p2[0] - p0[0]) / 6)} ${fmt(p1[1] + (p2[1] - p0[1]) / 6)} ${fmt(p2[0] - (p3[0] - p1[0]) / 6)} ${fmt(p2[1] - (p3[1] - p1[1]) / 6)} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return d;
}

function lineFace(ctx) {
  const ink = ctx.kind === 'dark' ? ctx.colors[1] : ctx.ink;
  ctx.shape('M40 120 Q50 60 120 62 Q190 64 200 130 Q214 220 150 300 Q120 330 92 300 Q30 220 40 120 Z', ctx.col(ctx.int(0, 7)), 120, 190, [30, 60, 214, 330]);
  ctx.circ(ctx.between(60, 90), ctx.between(150, 200), ctx.between(34, 48), ctx.col(ctx.int(0, 7) + 3));
  ctx.shape('M120 120 Q180 120 196 190 Q170 260 120 300 Z', ctx.col(ctx.int(0, 7) + 5), 160, 210, [120, 120, 196, 300]);
  const jitter = () => ctx.between(-4, 4);
  const face = [[54, 90], [92, 70], [138, 76], [168, 110], [172, 150], [196, 190], [170, 202], [174, 226], [160, 236], [166, 260], [148, 296], [118, 308], [96, 340]];
  ctx.stroke(smoothPath(face.map(([x, y]) => [x + jitter(), y + jitter()])), ink, 4, 130, 200, [50, 70, 200, 342]);
  ctx.stroke(smoothPath([[54, 90], [40, 150], [58, 210], [78, 250], [96, 290]]), ink, 3, 70, 190, [38, 90, 98, 292]);
  ctx.stroke(smoothPath([[120, 160], [138, 150], [156, 160], [138, 170], [120, 160]]), ink, 3, 138, 160, [118, 148, 158, 172]);
  ctx.circ(139, 160, 4, ink);
  ctx.stroke(smoothPath([[88, 84], [60, 110], [74, 140], [100, 128], [96, 100], [76, 98]]), ink, 3, 80, 112, [58, 82, 102, 142]);
  ctx.stroke(smoothPath([[150, 250], [160, 256], [170, 250]]), ink, 3, 160, 252, [148, 248, 172, 258]);
  return 'one-line portrait';
}

// ---------------------------------------------------------------------------
// 12. A Rubin vase: two profiles facing each other around a vase.
// ---------------------------------------------------------------------------

function rubinVase(ctx) {
  const wave = (y) => 34 + 22 * Math.sin((y - 60) / 34) + 10 * Math.sin((y - 60) / 14);
  const left = [[14, 52]];
  const right = [[226, 52]];
  const vase = [];
  const back = [];
  for (let y = 60; y <= 336; y += 8) {
    left.push([120 - wave(y), y]);
    right.push([120 + wave(y), y]);
    vase.push([120 - wave(y), y]);
    back.push([120 + wave(y), y]);
  }
  left.push([14, 346]);
  right.push([226, 346]);
  ctx.poly(R(14, 50, 212, 296), ctx.colors[1], { inset: 1, still: true });
  ctx.poly(left, ctx.col(ctx.int(0, 7)), { inset: 1, still: true });
  ctx.poly(right, ctx.col(ctx.int(0, 7) + 4), { inset: 1, still: true });
  ctx.poly(vase.concat(back.reverse()), ctx.col(ctx.int(0, 7) + 2), { inset: 1, still: true });
  for (const s of [-1, 1]) {
    ctx.circ(120 + s * 80, 120, 8, ctx.ink);
    ctx.circ(120 + s * 80 + s * 2, 118, 3, ctx.colors[1]);
    ctx.poly(R(120 + s * 70 - 12, 250, 24, 6), ctx.col(3), { inset: 1, still: true });
  }
  for (let y = 120; y < 330; y += 36) ctx.poly(R(120 - wave(y) * 0.6, y, wave(y) * 1.2, 5), ctx.colors[1], { inset: 1, still: true });
  return 'rubin vase faces';
}

// ---------------------------------------------------------------------------
// 13. A sun with a face and a crescent moon with a profile.
// ---------------------------------------------------------------------------

function celestial(ctx) {
  const sx = ctx.between(110, 140);
  const sy = ctx.between(150, 180);
  const rays = ctx.int(14, 18);
  for (let i = 0; i < rays; i++) {
    const a = (i * TAU) / rays;
    ctx.poly([pol(sx, sy, 62, a - 0.1), pol(sx, sy, ctx.between(82, 104), a), pol(sx, sy, 62, a + 0.1)], i % 2 ? ctx.col(0) : ctx.col(3), { inset: 1, still: true });
  }
  ctx.circ(sx, sy, 62, ctx.col(0));
  for (const s of [-1, 1]) {
    ctx.stroke(`M${fmt(sx + s * 34 - 12)} ${fmt(sy - 10)} Q${fmt(sx + s * 34)} ${fmt(sy - 24)} ${fmt(sx + s * 34 + 12)} ${fmt(sy - 10)}`, ctx.ink, 4, sx + s * 34, sy - 16, [sx + s * 34 - 12, sy - 24, sx + s * 34 + 12, sy - 10]);
    ctx.circ(sx + s * 40, sy + 14, 10, ctx.col(6));
  }
  ctx.poly([[sx, sy - 4], [sx - 7, sy + 20], [sx + 7, sy + 20]], ctx.col(3), { inset: 1, still: true });
  ctx.stroke(`M${fmt(sx - 24)} ${fmt(sy + 30)} Q${fmt(sx)} ${fmt(sy + 52)} ${fmt(sx + 24)} ${fmt(sy + 30)}`, ctx.ink, 4, sx, sy + 40, [sx - 24, sy + 30, sx + 24, sy + 52]);
  const mx = ctx.between(60, 90);
  const my = 300;
  ctx.shape(`M${fmt(mx)} ${my - 46} A46 46 0 1 0 ${fmt(mx)} ${my + 46} A34 34 0 1 1 ${fmt(mx)} ${my - 46} Z`, ctx.colors[1], mx, my, [mx - 46, my - 46, mx + 20, my + 46]);
  ctx.circ(mx - 20, my - 6, 4, ctx.ink);
  ctx.poly([[mx - 38, my + 6], [mx - 50, my + 18], [mx - 36, my + 18]], ctx.colors[1], { inset: 1, still: true });
  for (let i = 0; i < 12; i++) ctx.circ(ctx.between(20, 220), ctx.between(56, 340), ctx.between(1, 2.4), ctx.colors[1]);
  return 'sun and moon';
}

module.exports = { cubistPoster, picasso, splitFace, triadic, kleeGrid, minimalFace, mask, profile, popPanels, facetedFace, lineFace, rubinVase, celestial };
