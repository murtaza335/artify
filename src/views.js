'use strict';

const vscode = require('vscode');
const crypto = require('crypto');
const { vaseSvg, paintSvg, SWATCHES } = require('./art');
const { renderDesign, animateStatic, ANIMATION_CSS } = require('./forms');

// The Artify view under the Explorer (with its own Reform, Replay and Play buttons) and the poured-paint Palette panel tab.

const SEED_KEY = 'artify.vase';

function themeKind() {
  const { kind } = vscode.window.activeColorTheme;
  return kind === vscode.ColorThemeKind.Light || kind === vscode.ColorThemeKind.HighContrastLight ? 'light' : 'dark';
}

// `nonce` is set only for pages that run a script; the others stay script-free.
function shell(webview, css, body, stamp = 0, nonce = '') {
  const csp = `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline';${nonce ? ` script-src 'nonce-${nonce}';` : ''}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
html, body { margin: 0; padding: 0; height: 100%; background: transparent; }
body { color: var(--vscode-foreground); font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); }
${css}
</style>
</head>
<body>${body}<!-- replay ${stamp} --></body>
</html>`;
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TOOLBAR_SCRIPT = `
const vscode = acquireVsCodeApi();
document.querySelectorAll('[data-action]').forEach((b) => b.addEventListener('click', () => vscode.postMessage({ type: b.dataset.action })));
`;

function vaseHtml(webview, kind, design, stamp, focus) {
  // With no design this is the original vase. Otherwise it is a generated form or one of the user's studio designs.
  const nonce = crypto.randomBytes(16).toString('base64');
  const css = `
body { display: flex; flex-direction: column; min-height: 100vh; }
.bar { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px 0; }
.bar button { height: 28px; padding: 0 12px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; border: 0; color: var(--vscode-button-secondaryForeground, var(--vscode-foreground)); background: var(--vscode-button-secondaryBackground, transparent); }
.bar button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
.bar button:hover { background: var(--vscode-button-secondaryHoverBackground, var(--vscode-list-hoverBackground)); }
.bar button.primary:hover { background: var(--vscode-button-hoverBackground); }
.bar button:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; }
.name { margin: 6px 12px 0; font-size: 12px; color: var(--vscode-descriptionForeground); }
.art { margin-top: auto; }
svg { display: block; width: 100%; max-width: 260px; height: auto; margin: 0 auto; }
${ANIMATION_CSS}`;
  const af = (id) => (focus === id ? ' autofocus' : '');
  const toolbar = `<div class="bar" role="toolbar" aria-label="Artify art">
<button class="primary" data-action="reform" title="Show a new design"${af('reform')}>Reform</button>
<button data-action="replay" title="Play the animation again"${af('replay')}>Replay</button>
<button data-action="play" title="Open Artify Play">Play</button>
</div>
<p class="name">${escapeHtml(design ? design.name : 'broken vase')}</p>`;
  const body = `${toolbar}<div class="art">${design ? design.svg : animateStatic(vaseSvg(kind))}</div><script nonce="${nonce}">${TOOLBAR_SCRIPT}</script>`;
  return shell(webview, css, body, stamp, nonce);
}

function paletteHtml(webview, kind) {
  const rows = SWATCHES[kind]
    .map(([name, hex]) => `<li><span class="chip" style="background:${hex}"></span><span class="name">${name}</span><span class="hex">${hex}</span></li>`)
    .join('');
  const css = `
.wrap { display: flex; justify-content: space-between; height: 100vh; min-height: 140px; overflow: hidden; }
.swatches { padding: 8px 20px; }
h2 { margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--vscode-descriptionForeground); }
ul { list-style: none; margin: 0; padding: 0; }
li { display: flex; align-items: center; gap: 12px; height: 24px; }
.chip { width: 14px; height: 14px; border: 1px solid var(--vscode-panel-border); flex: none; }
.name { min-width: 64px; }
.hex { font-family: var(--vscode-editor-font-family); font-size: 12px; color: var(--vscode-descriptionForeground); }
.paint { flex: 0 0 500px; max-width: 50%; }
.paint svg { display: block; width: 100%; height: 100%; }
@media (max-width: 640px) { .paint { display: none; } }`;
  return shell(webview, css, `<div class="wrap"><div class="swatches"><h2>Palette</h2><ul>${rows}</ul></div><div class="paint">${paintSvg(kind)}</div></div>`);
}

class ArtViewProvider {
  /**
   * @param {'vase' | 'palette'} which
   * @param {import('./store').Store} [store] saved creations that can appear when reforming
   * @param {vscode.Memento} [state] where the current design is remembered between sessions
   * @param {import('./deck').Deck} [deck] deals designs without repeating them
   */
  constructor(which, store, state, deck) {
    this.which = which;
    this.store = store;
    this.state = state;
    this.deck = deck;
    this.view = undefined;
    this.replays = 0;
    const saved = state ? state.get(SEED_KEY) : undefined;
    this.item = saved && (saved.seed || saved.creation) ? saved : undefined;
  }

  resolveWebviewView(view) {
    this.view = view;
    // Only the Artify view needs a script, for its Reform, Replay and Play buttons.
    view.webview.options = { enableScripts: this.which === 'vase' };
    if (this.which === 'vase') {
      view.webview.onDidReceiveMessage((message) => {
        if (message.type === 'reform') {
          this.focus = 'reform';
          this.reform();
        } else if (message.type === 'replay') {
          this.focus = 'replay';
          this.replay();
        } else if (message.type === 'play') {
          vscode.commands.executeCommand('artify.play');
        }
      });
    }
    this.render();
  }

  // Picks a new random design and redraws, so the shards fly together into something different.
  // The deck makes sure nothing repeats until everything has been shown. Studio designs are dealt the same way.
  reform() {
    const category = vscode.workspace.getConfiguration('artify').get('explorerShapes', 'all');
    this.item = this.deck.next(category, this.store ? this.store.creations() : []);
    if (this.state) this.state.update(SEED_KEY, this.item);
    this.render();
  }

  // Plays the fly-in animation again for the design that is already showing.
  replay() {
    this.replays++;
    this.render();
  }

  render() {
    if (!this.view) return;
    const webview = this.view.webview;
    const kind = themeKind();
    if (this.which === 'vase') {
      const design = this.item ? renderDesign(kind, this.item, this.store ? this.store.creations() : []) : undefined;
      webview.html = vaseHtml(webview, kind, design, this.replays, this.focus);
      this.focus = undefined;
    } else {
      webview.html = paletteHtml(webview, kind);
    }
  }
}

module.exports = { ArtViewProvider, themeKind };
