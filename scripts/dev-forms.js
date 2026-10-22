// Quick check for a family of forms before it is registered.
// Usage: node scripts/dev-forms.js pattern-islamic [more-modules] [--verbose]
// Draws every form over 40 seeds in both themes and reports bad markup, parts outside the frame, piece counts,
// timing and forms that ignore their seed.

const { createContext } = require('../src/shapes/engine');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const mods = args.filter((a) => !a.startsWith('--'));
const failures = [];
const counts = new Map();
const fail = (id, msg) => {
  const n = (counts.get(id) || 0) + 1;
  counts.set(id, n);
  if (n <= 3) failures.push(msg);
};

for (const mod of mods) {
  const forms = require('../src/shapes/' + mod);
  for (const [id, fn] of Object.entries(forms)) {
    if (typeof fn !== 'function' || fn.name !== id) continue;
    let min = Infinity;
    let max = 0;
    let fits = 0;
    let slow = 0;
    let total = 0;
    const seen = new Set();
    const times = [];
    for (const kind of ['dark', 'light']) {
      for (let seed = 1; seed <= 40; seed++) {
        const ctx = createContext(kind, seed);
        ctx.pick([1, 2, 3]);
        let name;
        const t0 = process.hrtime.bigint();
        try {
          name = fn(ctx);
        } catch (e) {
          fail(id, `${id} ${kind} seed ${seed} threw: ${e.message.split('\n')[0]} (${(e.stack.split('\n')[1] || '').trim()})`);
          break;
        }
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        times.push(ms);
        total++;
        if (ms > 40) slow++;
        const svg = ctx.parts.map((p) => p.svg).join('');
        if (typeof name !== 'string' || !name) fail(id, `${id} returned no name`);
        if (/undefined|NaN|Infinity/.test(svg)) fail(id, `${id} ${kind} seed ${seed} has undefined/NaN in its markup`);
        const n = ctx.parts.length;
        min = Math.min(min, n);
        max = Math.max(max, n);
        if (kind === 'dark' && n <= 45) fits++;
        if (n < 3) fail(id, `${id} ${kind} seed ${seed} has only ${n} parts`);
        if (n > 150) fail(id, `${id} ${kind} seed ${seed} has ${n} parts`);
        for (const part of ctx.parts) {
          const [x0, y0, x1, y1] = part.bounds;
          if (![x0, y0, x1, y1].every(Number.isFinite) || x0 < -10 || y0 < -10 || x1 > 250 || y1 > 390) {
            fail(id, `${id} ${kind} seed ${seed} part outside the frame: ${part.bounds.map(Math.round)}`);
            break;
          }
        }
        if (kind === 'dark') seen.add(svg);
        if (kind === 'dark' && seed <= 2) {
          const again = createContext(kind, seed);
          again.pick([1, 2, 3]);
          fn(again);
          if (again.parts.map((p) => p.svg).join('') !== svg) fail(id, `${id} seed ${seed} is not deterministic`);
        }
      }
    }
    times.sort((a, b) => a - b);
    const median = times[Math.floor(times.length / 2)] || 0;
    if (median > 8) fail(id, `${id} median ${median.toFixed(1)} ms is over 8 ms`);
    if (slow) fail(id, `${id} took over 40 ms on ${slow} runs (max ${times[times.length - 1].toFixed(0)} ms)`);
    if (seen.size < 8) fail(id, `${id} gives only ${seen.size} different pictures over 40 seeds`);
    if (!fits) fail(id, `${id} never fits the puzzle limit (${min}-${max} parts)`);
    if (verbose) console.log(id.padEnd(20), `${min}-${max} parts`, `${fits}/40 puzzle`, `${seen.size} distinct`, `${median.toFixed(1)} ms`);
  }
}
if (failures.length) {
  console.error([...new Set(failures)].slice(0, 80).join('\n'));
  console.error(`${failures.length} problems`);
  process.exit(1);
}
console.log('OK');
