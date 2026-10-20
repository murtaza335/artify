// Writes an HTML grid of forms x seeds x both themes so each batch can be eyeballed for quality, contrast and variety.
// Usage: node scripts/contact-sheet.js [formId ...] [--out file.html] [--seeds 6]

const fs = require('fs');
const os = require('os');
const path = require('path');
const { compose, ALL, ANIMATION_CSS } = require('../src/forms');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const out = flag('--out', path.join(os.tmpdir(), 'artify-contact-sheet.html'));
const seeds = Number(flag('--seeds', 6));
const ids = args.length ? args : ALL.map((fn) => fn.name);

const BG = { dark: '#0B1A20', light: '#F6F0E2' };
const cells = ids
  .map((id) => {
    const row = ['dark', 'light']
      .map((kind) =>
        Array.from({ length: seeds }, (_, s) => `<div class="c" style="background:${BG[kind]}">${compose(kind, s + 1, 'all', id).svg}</div>`).join('')
      )
      .join('');
    return `<h3>${id}</h3><div class="r">${row}</div>`;
  })
  .join('\n');
const html = `<!doctype html><meta charset="utf-8"><style>body{font:12px sans-serif;background:#888;margin:8px}h3{margin:10px 0 2px}.r{display:flex;flex-wrap:wrap}.c{width:96px;margin:1px}.c svg{width:100%;display:block}.s,.f{animation:none!important}</style>${cells}`;
fs.writeFileSync(out, html);
console.log('Wrote ' + out);
