// Sanity-checks the generated artwork: every SVG must be well-formed (balanced tags, quoted attributes)
// and free of the literal "undefined" or "NaN" that a bad template variable would leave behind.

const { vaseSvg, paintSvg, MOVEMENTS } = require('../src/art');
const { animateStatic, compose, composeCreation, renderDesign, reformed, CATEGORIES, ALL } = require('../src/forms');
const { SHAPES } = require('../src/shapes/library');

function check(label, svg) {
  const problems = [];
  const stack = [];
  const tag = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g;
  let rest = svg.replace(tag, (_, close, name, _attrs, selfClose) => {
    if (selfClose) return '';
    if (close) {
      if (stack.pop() !== name) problems.push('mismatched </' + name + '>');
    } else {
      stack.push(name);
    }
    return '';
  });
  if (stack.length) problems.push('unclosed <' + stack.join('>, <') + '>');
  if (rest.replace(/\s+/g, '') !== '') problems.push('stray markup: ' + rest.trim().slice(0, 60));
  if (/undefined|NaN/.test(svg)) problems.push('contains undefined or NaN');
  return problems.map((p) => label + ': ' + p);
}

const failures = [];
for (const kind of ['dark', 'light']) {
  failures.push(...check('vase ' + kind, vaseSvg(kind)));
  failures.push(...check('paint ' + kind, paintSvg(kind)));
}
for (const kind of ['dark', 'light']) {
  for (const category of ['all', ...Object.keys(CATEGORIES)]) {
    for (let seed = 1; seed <= 50; seed++) failures.push(...check(`reformed ${category} ${kind} seed ${seed}`, reformed(kind, seed, category)));
  }
}
// Every form is checked directly: well-formed output, a usable number of pieces, parts inside the frame,
// the same picture for the same seed, and (unless listed) a seed small enough to play as a puzzle.
const { createContext, arcBand, blob, dotField, radial, stripes } = require('../src/shapes/engine');
const FORM_IDS = ALL.map((fn) => fn.name);
const PUZZLE_MAX_PIECES = 45;
const HARD_CEILING = 150;
const NOT_PUZZLES = new Set(['pinecone', 'mosaicFace']);
// The strict frame and puzzle rules hold the forms added in this round of work; the older forms predate them.
const NEW_FORMS = new Set(['food', 'patterns', 'styles', 'wildlife', 'garden', 'cosmos', 'landscapes', 'things', 'portraits', 'anime-faces', 'anime-characters', 'anime-scenes', 'cartoons', 'cartoon-scenes', 'abstract-pioneers', 'abstract-hardedge', 'abstract-generative', 'abstract-organic', 'abstract-world', 'abstract-graphic', 'abstract-colorfield', 'abstract-illusion', 'geometry-tilings', 'geometry-math', 'pattern-islamic', 'pattern-asia', 'pattern-textiles', 'pattern-ornament', 'abstract-kinetic', 'abstract-concrete', 'abstract-systems', 'abstract-decorative', 'abstract-growth', 'abstract-global'].flatMap((f) => Object.keys(require('../src/shapes/' + f))));
const stats = new Map();
for (const id of FORM_IDS) {
  const entry = { min: Infinity, max: 0, fits: 0 };
  const times = [];
  const pictures = new Set();
  stats.set(id, entry);
  for (const kind of ['dark', 'light']) {
    for (let seed = 1; seed <= 40; seed++) {
      const t0 = process.hrtime.bigint();
      const a = compose(kind, seed, 'all', id);
      times.push(Number(process.hrtime.bigint() - t0) / 1e6);
      if (kind === 'dark') pictures.add(a.svg);
      failures.push(...check(`${id} ${kind} seed ${seed}`, a.svg));
      if (a.name === undefined || compose(kind, seed, 'all', id).svg !== a.svg) failures.push(`${id} ${kind} seed ${seed} is not deterministic`);
      if (a.parts < 3) failures.push(`${id} seed ${seed} has only ${a.parts} pieces`);
      if (NEW_FORMS.has(id) && a.parts > HARD_CEILING) failures.push(`${id} seed ${seed} has ${a.parts} pieces, over the ceiling`);
      entry.min = Math.min(entry.min, a.parts);
      entry.max = Math.max(entry.max, a.parts);
      if (kind === 'dark' && a.parts <= PUZZLE_MAX_PIECES) entry.fits++;
      const ctx = createContext(kind, seed);
      ctx.pick(ALL);
      ALL.find((fn) => fn.name === id)(ctx);
      for (const part of ctx.parts) {
        const [x0, y0, x1, y1] = part.bounds;
        if (!NEW_FORMS.has(id)) break;
        if (![x0, y0, x1, y1].every(Number.isFinite) || x0 < -10 || y0 < -10 || x1 > 250 || y1 > 390) {
          failures.push(`${id} ${kind} seed ${seed} has a part outside the frame: ${[x0, y0, x1, y1].map(Math.round)}`);
          break;
        }
      }
    }
  }
  // Time budget and variety for the forms added in this round: the median draw must be quick, the slow tail
  // bounded, and the seed must change the picture.
  if (NEW_FORMS.has(id)) {
    times.sort((x, y) => x - y);
    const median = times[Math.floor(times.length / 2)];
    const p95 = times[Math.floor(times.length * 0.95)];
    if (median > 8) failures.push(`${id} takes ${median.toFixed(1)} ms to draw, over the 8 ms budget`);
    if (p95 > 40) failures.push(`${id} takes ${p95.toFixed(0)} ms at the 95th percentile, over the 40 ms limit`);
    if (pictures.size < 8) failures.push(`${id} gives only ${pictures.size} different pictures over 40 seeds`);
  }
  if (NEW_FORMS.has(id) && !entry.fits && !NOT_PUZZLES.has(id)) failures.push(`${id} never fits the puzzle limit; add it to NOT_PUZZLES or use fewer parts`);
}
if (process.argv.includes('--verbose') || process.argv.includes('--slow')) for (const [n, e] of stats) console.log(n.padEnd(18), e.min + '-' + e.max, 'pieces,', e.fits + '/40 fit a puzzle');

// A form must never be renamed or dropped, because saved designs and deck bags refer to it by name.
const shipped = require('./shipped-forms.json');
for (const id of shipped) if (!FORM_IDS.includes(id)) failures.push(`shipped form ${id} is missing: forms must never be renamed or removed`);


// Anime and cartoon forms are original archetypes. Keep franchise and character names out of function names,
// display names and the aria-labels the composer writes.
const BLOCKED = ['pikachu', 'pokemon', 'goku', 'naruto', 'sasuke', 'luffy', 'totoro', 'ghibli', 'sailormoon', 'gundam', 'evangelion', 'mickey', 'minnie', 'spongebob', 'bugsbunny', 'looney', 'scooby', 'simpson', 'doraemon', 'hellokitty', 'snoopy', 'tomandjerry', 'popeye', 'betty boop', 'bettyboop', 'dragonball', 'onepiece', 'ghostbusters', 'transformers'];
for (const id of FORM_IDS) {
  const label = compose('dark', 1, 'all', id);
  const text = (id + ' ' + label.name + ' ' + label.svg.match(/aria-label="[^"]*"/)[0]).toLowerCase().replace(/[\s_-]/g, '');
  for (const word of BLOCKED) if (text.includes(word.replace(/\s/g, ''))) failures.push(`${id} mentions a franchise or character name: ${word}`);
}

// Characters must change with the seed: six seeds give at least four different pictures.
{
  const CHARACTER_FORMS = ['anime-characters', 'cartoons'].flatMap((f) => Object.keys(require('../src/shapes/' + f)));
  for (const id of CHARACTER_FORMS) {
    const fn = ALL.find((f) => f.name === id);
    const seen = new Set();
    for (let seed = 1; seed <= 6; seed++) {
      const ctx = createContext('dark', seed);
      ctx.pick(ALL);
      fn(ctx);
      seen.add(ctx.parts.map((p) => p.svg).join(''));
    }
    if (seen.size < 4) failures.push(`${id} gives only ${seen.size} different pictures over 6 seeds`);
  }
}

// Skin and hair colours must stand out from the page behind them in both themes.
{
  const toon = require('../src/shapes/toon');
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  const ground = { dark: '#10232B', light: '#F6F0E2' };
  for (const kind of ['dark', 'light']) {
    for (const c of [...toon.SKINS[kind], ...toon.HAIRS[kind]]) if (ratio(c, ground[kind]) < 1.3) failures.push(`${kind} skin or hair ${c} is too close to the page colour`);
  }
  // Every expression builds on an anime head and on a cartoon head.
  for (const expr of ['happy', 'angry', 'shocked', 'sad', 'smug', 'sleepy', 'excited', 'shy', 'calm']) {
    for (const kind of ['dark', 'light']) {
      const a = createContext(kind, 4);
      toon.animeHead(a, { expr });
      const c = createContext(kind, 4);
      toon.cartoonHead(c, { expr });
      for (const [label, ctx] of [['anime', a], ['cartoon', c]]) {
        if (ctx.parts.length < 6) failures.push(`${label} head with ${expr} has too few parts`);
        failures.push(...check(`${label} ${expr} ${kind}`, `<svg>${ctx.parts.map((p) => p.svg).join('')}</svg>`));
      }
    }
  }
}

// Engine helpers must produce valid shapes inside their bounds.
{
  const ctx = createContext('dark', 3);
  const pts = arcBand(120, 190, 30, 60, 0, Math.PI);
  if (!pts.length || pts.flat().some((v) => !Number.isFinite(v))) failures.push('arcBand produced bad points');
  const radii = pts.map(([x, y]) => Math.hypot(x - 120, y - 190));
  if (Math.min(...radii) < 29.9 || Math.max(...radii) > 60.1) failures.push('arcBand left its radii');
  blob(ctx, 100, 100, 40, 0.3, '#fff');
  radial(5, (a, i) => ctx.circ(120 + i, 120, 3, '#000'));
  dotField(ctx, [20, 20, 100, 60], 10, () => 3, () => '#123', 3);
  stripes(ctx, [10, 10, 100, 60], 4, () => 0, () => '#456');
  for (const p of ctx.parts) {
    if (!p.bounds.every(Number.isFinite)) failures.push('a helper part has bad bounds');
  }
  const blobPart = ctx.parts[0].bounds;
  if (blobPart[0] < 100 - 40 * 1.3 - 0.1 || blobPart[2] > 100 + 40 * 1.3 + 0.1) failures.push('blob bounds exceed its reach');
  failures.push(...check('helpers', `<svg>${ctx.parts.map((p) => p.svg).join('')}</svg>`));
  const dots = ctx.parts.filter((p) => p.svg.startsWith('<circle') && p.svg.split('<circle').length > 2);
  if (dots.some((p) => p.bounds[0] < 20 || p.bounds[2] > 120 || p.bounds[1] < 20 || p.bounds[3] > 80)) failures.push('dotField left its area');
}
// Pattern helpers: the exact tilings, strapwork, contours, weaving, splitting and hatching.
{
  const K = require('../src/shapes/pattern-kit');
  const { tiling, multigrid } = require('../src/shapes/tiling-base');
  const valence = { snubSquare: 5, trihexagonal: 4, rhombitrihex: 4, octagonSquares: 3, snubHexagonal: 5, elongatedTriangular: 5, dodecagons: 3 };
  for (const [kind, want] of Object.entries(valence)) {
    const seen = new Map();
    for (const f of tiling(kind)) for (const p of f.pts) seen.set(p.map((v) => Math.round(v * 500)).join(), (seen.get(p.map((v) => Math.round(v * 500)).join()) || 0) + 1);
    const inner = [...seen].filter(([k]) => { const [x, y] = k.split(',').map((v) => v / 500); return x > 4 && x < 9 && y > 4 && y < 13; });
    if (!inner.length || inner.some(([, n]) => n !== want)) failures.push(`${kind} tiling has a vertex that is not ${want}-valent`);
  }
  const mg = multigrid(4, [0.21, 0.37, 0.52, 0.68], 4);
  if (!mg.length || mg.some((t) => t.pts.flat().some((v) => !Number.isFinite(v)))) failures.push('multigrid produced bad tiles');
  const sq = [[0, 0], [10, 0], [10, 10], [0, 10]];
  const areaOf = (p) => Math.abs(p.reduce((a, q, i) => a + q[0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * q[1], 0)) / 2;
  const parts = K.splitPoly(sq, [4, 4], 0.7);
  if (parts.length !== 2 || Math.abs(parts.reduce((a, p) => a + areaOf(p), 0) - 100) > 1e-6) failures.push('splitPoly does not keep the area of the polygon');
  for (const seg of K.hatchRect(5, 5, 20, 12, 0.6, 3)) if (seg.flat().some((v, i) => (i % 2 === 0 ? v < 4.99 || v > 25.01 : v < 4.99 || v > 17.01))) failures.push('hatchRect left its rectangle');
  const hk = K.hankin([K.ngon(0, 0, 10, 8, 0)], 67.5);
  if (!hk.length || hk.flat(2).some((v) => !Number.isFinite(v))) failures.push('hankin produced bad segments');
  const field = K.gridOf(12, 12, (i, j) => Math.hypot(i - 5.5, j - 5.5));
  const d = K.contour(field, 12, 12, 3, 0, 0, 1, 1);
  if (!d || /NaN|undefined/.test(d)) failures.push('contour produced a bad path');
  const strands = [[[0, 0], [20, 20]], [[0, 20], [20, 0]], [[0, 10], [20, 10]]];
  const woven = K.weave(strands, 4, () => '#fff', '#000');
  if (woven.length <= strands.length * 2) failures.push('weave added no crossings');
  const items = [K.circ(50, 100, 4, '#111'), K.circ(60, 300, 4, '#111')];
  const ctx2 = createContext('dark', 1);
  K.flush(ctx2, items, 3);
  if (ctx2.parts.length < 2) failures.push('flush did not split items into bands');
}
for (const m of MOVEMENTS) {
  for (const seed of [1913, 1920, 1927, 1934, 1941]) {
    failures.push(...check(`${m.id} seed ${seed}`, `<svg>${m.render(seed)}</svg>`));
  }
}

// The original vase animates too, so it must stay well-formed once its shapes are wrapped.
for (const kind of ['dark', 'light']) {
  const wrapped = animateStatic(vaseSvg(kind));
  failures.push(...check('animated vase ' + kind, wrapped));
  if (!/class="s"/.test(wrapped)) failures.push('animated vase has no animated shapes');
}

// Every picker shape must draw, and a studio creation must render in both themes and be picked up by Reform.
const sample = { id: 'check', name: 'Check', bg: 1, items: SHAPES.map((sh, i) => ({ shape: sh.id, x: 20 + (i % 6) * 40, y: 40 + Math.floor(i / 6) * 60, size: 40, rot: i * 7, color: i % 8, flip: i % 2 === 0 })) };
for (const kind of ['dark', 'light']) {
  failures.push(...check('creation ' + kind, composeCreation(kind, sample).svg));
  const picked = { seed: 0, category: 'mine', creation: 'check' };
  if (renderDesign(kind, picked, [sample]).name !== 'Check') failures.push('renderDesign did not render the saved creation');
}
for (const sh of SHAPES) if (!/^M[-\d. ]/.test(sh.d) || /NaN|undefined/.test(sh.d)) failures.push('shape ' + sh.id + ' has a bad path');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Artwork OK: ${MOVEMENTS.length} movements x 5 seeds, vase and paint in both kinds.`);
