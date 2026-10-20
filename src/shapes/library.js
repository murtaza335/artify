'use strict';

// The shape picker for Artify Studio. Each shape is a path drawn in a 100 x 100 box centred on the origin,
// so the studio can place, scale and rotate it, and the Reform button can draw saved designs.

const TAU = Math.PI * 2;
const f = (v) => Math.round(v * 10) / 10;
const pt = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
const polygon = (points) => 'M' + points.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
const circle = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}A${r} ${r} 0 1 1 ${f(cx + r)} ${f(cy)}A${r} ${r} 0 1 1 ${f(cx - r)} ${f(cy)}Z`;
const regular = (n, r, rot = -Math.PI / 2) => polygon(Array.from({ length: n }, (_, i) => pt(r, rot + (i * TAU) / n)));
const star = (n, outer, inner) => polygon(Array.from({ length: n * 2 }, (_, i) => pt(i % 2 ? inner : outer, -Math.PI / 2 + (i * Math.PI) / n)));

const SHAPES = [
  { id: 'circle', name: 'Circle', d: circle(0, 0, 50) },
  { id: 'square', name: 'Square', d: 'M-50 -50H50V50H-50Z' },
  { id: 'rectangle', name: 'Rectangle', d: 'M-50 -25H50V25H-50Z' },
  { id: 'triangle', name: 'Triangle', d: 'M0 -50L50 50H-50Z' },
  { id: 'right-triangle', name: 'Right triangle', d: 'M-50 -50L50 50H-50Z' },
  { id: 'semicircle', name: 'Semicircle', d: 'M-50 25A50 50 0 0 1 50 25Z' },
  { id: 'quarter', name: 'Quarter circle', d: 'M-50 50L-50 -50A100 100 0 0 1 50 50Z' },
  { id: 'ring', name: 'Ring', d: circle(0, 0, 50) + circle(0, 0, 28), evenodd: true },
  { id: 'diamond', name: 'Diamond', d: 'M0 -50L35 0L0 50L-35 0Z' },
  { id: 'pentagon', name: 'Pentagon', d: regular(5, 50) },
  { id: 'hexagon', name: 'Hexagon', d: regular(6, 50, 0) },
  { id: 'octagon', name: 'Octagon', d: regular(8, 50, Math.PI / 8) },
  { id: 'star4', name: 'Four-point star', d: star(4, 50, 16) },
  { id: 'star5', name: 'Star', d: star(5, 50, 21) },
  { id: 'burst', name: 'Burst', d: star(10, 50, 38) },
  { id: 'pill', name: 'Pill', d: 'M-25 -25H25A25 25 0 0 1 25 25H-25A25 25 0 0 1 -25 -25Z' },
  { id: 'arch', name: 'Arch', d: 'M-35 50V-15A35 35 0 0 1 35 -15V50Z' },
  { id: 'cross', name: 'Cross', d: 'M-15 -50H15V-15H50V15H15V50H-15V15H-50V-15H-15Z' },
  { id: 'crescent', name: 'Crescent', d: 'M20 -48A50 50 0 1 0 20 48A38 38 0 1 1 20 -48Z' },
  { id: 'heart', name: 'Heart', d: 'M0 45C-60 0 -40 -45 0 -20C40 -45 60 0 0 45Z' },
  { id: 'drop', name: 'Drop', d: 'M0 -50C25 -15 40 5 40 20A40 40 0 0 1 -40 20C-40 5 -25 -15 0 -50Z' },
  { id: 'leaf', name: 'Leaf', d: 'M-45 45C-45 -20 0 -50 45 -45C50 0 20 45 -45 45Z' },
  { id: 'cloud', name: 'Cloud', d: 'M-34 5H34V30H-34Z' + circle(-24, 8, 22) + circle(0, -8, 28) + circle(26, 6, 24) },
  {
    id: 'sun',
    name: 'Sun',
    d: circle(0, 0, 24) + Array.from({ length: 8 }, (_, i) => polygon([pt(30, (i * TAU) / 8 - 0.18), pt(50, (i * TAU) / 8), pt(30, (i * TAU) / 8 + 0.18)])).join('')
  },
  { id: 'mountain', name: 'Mountain', d: 'M-50 50L-10 -30L10 10L25 -15L50 50Z' },
  { id: 'wave', name: 'Wave', d: 'M-50 5Q-25 -35 0 5T50 5V40H-50Z' },
  { id: 'flower', name: 'Flower', d: Array.from({ length: 6 }, (_, i) => circle(...pt(28, (i * TAU) / 6), 17)).join('') + circle(0, 0, 13) },
  { id: 'house', name: 'House', d: 'M-40 50V-5L0 -45L40 -5V50Z' },
  { id: 'pine', name: 'Pine tree', d: 'M0 -50L30 -10H12L38 25H6V50H-6V25H-38L-12 -10H-30Z' },
  { id: 'fish', name: 'Fish', d: 'M-50 0Q-20 -35 20 -20L50 -35V35L20 20Q-20 35 -50 0Z' },
  { id: 'bolt', name: 'Lightning bolt', d: 'M10 -50L-25 5H-3L-12 50L28 -8H5Z' },
  { id: 'line', name: 'Line', d: 'M-50 -4H50V4H-50Z' }
];

const SHAPE_MAP = Object.fromEntries(SHAPES.map((s) => [s.id, s]));

module.exports = { SHAPES, SHAPE_MAP };
