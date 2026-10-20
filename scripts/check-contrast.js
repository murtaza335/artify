// Verifies WCAG contrast for every text/background pair the themes rely on.
// Exits non-zero when a pair falls below its minimum, so it can gate a release.

const { dark, light } = require('./palettes');

const MIN_TEXT = 4.5;

function luminance(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function pairs(p) {
  const out = [];
  const add = (label, fg, bg, min = MIN_TEXT) => out.push({ label, fg, bg, min });

  // Editor text on the editor background
  add('editor code', p.code, p.bg);
  add('line numbers', p.lineNumber, p.bg);
  add('active line number', p.lineNumberActive, p.bg);
  for (const [k, v] of Object.entries(p.t)) add('token ' + k, v, p.bg);
  for (const [i, v] of p.brackets.entries()) add('bracket color ' + (i + 1), v, p.bg);
  for (const [k, v] of Object.entries(p.diag)) add('diagnostic ' + k, v, p.bg);

  // Chrome text on its own background
  add('foreground on title bar', p.fg, p.titleBg);
  add('muted on title bar', p.fgMuted, p.titleBg);
  add('active icon on activity bar', p.activityFg, p.activityBg);
  add('inactive icon on activity bar', p.activityMuted, p.activityBg);
  add('sidebar text', p.sidebarFg, p.sidebar);
  add('sidebar muted text', p.sidebarMuted, p.sidebar);
  add('selected row text', p.activeRowFg, p.activeRow);
  add('sidebar text on hover row', p.sidebarFg, p.hoverRow);
  add('inactive tab text', p.tabInactiveFg, p.tabBarBg);
  add('foreground on active tab', p.fg, p.bg);
  add('breadcrumb text', p.fgMuted, p.bg);
  add('panel title (inactive)', p.fgMuted, p.panel);
  add('panel text', p.fg, p.panel);
  add('widget text', p.fg, p.widget);
  add('input placeholder', p.fgMuted, p.widget);
  add('link on editor', p.link, p.bg);
  add('button text', p.onAccent, p.accent);
  add('button text on hover', p.onAccent, p.accentHover);

  // Status bar items
  add('status bar text', p.status.fg, p.status.bg);
  for (const k of ['remote', 'prominent', 'warning', 'error', 'debugging']) add('status ' + k, p[k].fg, p[k].bg);

  // Terminal
  for (const [k, v] of Object.entries(p.ansi)) {
    if (!p.ansiExempt.includes(k)) add('terminal ansi ' + k, v, p.panel);
  }
  return out;
}

let failures = 0;
for (const p of [dark, light]) {
  console.log('\n' + p.name);
  for (const { label, fg, bg, min } of pairs(p)) {
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) failures++;
    if (!ok || process.argv.includes('--verbose')) {
      console.log(`${ok ? '  ok  ' : ' FAIL '} ${r.toFixed(2).padStart(5)}  ${label}  (${fg} on ${bg})`);
    }
  }
}
console.log(failures ? `\n${failures} pair(s) below ${MIN_TEXT}:1` : '\nAll pairs meet ' + MIN_TEXT + ':1');
process.exit(failures ? 1 : 0);
