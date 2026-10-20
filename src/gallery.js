'use strict';

const vscode = require('vscode');
const crypto = require('crypto');
const { MOVEMENTS } = require('./art');

// The Welcome Gallery: pick a movement, shuffle its composition, apply the matching theme.

const SEED_START = 1913;
const SEED_STEP = 7;

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function appHtml(state) {
  const m = MOVEMENTS[state.sel];
  const buttons = MOVEMENTS.map((mv, i) => {
    const on = i === state.sel;
    const chips = mv.chips
      .map((c, k) => `<span class="chip" style="background:${c};${k === 1 ? 'border-radius:50%' : ''}"></span>`)
      .join('');
    return `<button class="mv" data-action="select" data-index="${i}" data-key="mv-${i}" aria-pressed="${on}" style="--accent:${mv.btn}">
  <span class="chips" aria-hidden="true">${chips}</span>
  <span class="mvtext"><span class="mvname">${escapeHtml(mv.name)}</span><span class="mvsub">${escapeHtml(mv.sub)}</span></span>
  <span class="mvmode">${mv.mode}</span>
</button>`;
  }).join('');

  const canApply = Boolean(m.theme);
  const applyLabel = state.applied ? 'Applied to your editor' : 'Apply theme';
  const note = canApply
    ? ''
    : '<p class="note">Artwork only for now. This movement has no color theme yet.</p>';
  const status = state.applied ? `<p class="note" role="status">Theme set to ${escapeHtml(m.theme)}.</p>` : '';
  const stageBg = m.bg ? `background:${m.bg};` : '';

  return `<div class="left">
  <div class="brand">ARTIFY</div>
  <h1>Code inside<br>the painting.</h1>
  <p class="lead">Pick a movement. Shuffle the composition until it feels right, then apply the theme to your editor.</p>
  <h2>Choose a movement</h2>
  <div class="movements">${buttons}</div>
  <div class="actions">
    <button class="primary" data-action="apply" data-key="apply" style="background:${m.btn};color:${m.btnFg}" ${canApply ? '' : 'disabled'}>${applyLabel}</button>
    <button class="secondary" data-action="shuffle" data-key="shuffle">Shuffle composition</button>
  </div>
  ${note}${status}
</div>
<div class="right">
  <div class="stage" style="${stageBg}">
    <svg viewBox="0 0 720 680" role="img" aria-label="${escapeHtml(m.label)}">${m.render(state.seed)}</svg>
  </div>
  <div class="caption"><span><strong>${escapeHtml(m.name)}</strong> / ${escapeHtml(m.caption)}</span><span class="seed">composition ${state.seed}</span></div>
</div>`;
}

const CSS = `
html, body { margin: 0; padding: 0; background: var(--vscode-editor-background); }
body { color: var(--vscode-foreground); font-family: var(--vscode-font-family); font-size: 14px; }
#app { display: flex; flex-wrap: wrap; gap: 56px; padding: 40px 48px; box-sizing: border-box; }
.left { flex: 0 0 480px; max-width: 100%; }
.right { flex: 1 1 360px; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.brand { font-size: 13px; font-weight: 800; letter-spacing: .2em; color: var(--vscode-descriptionForeground); }
h1 { margin: 16px 0 0; font-size: 56px; line-height: 1; font-weight: 800; letter-spacing: -.02em; color: var(--vscode-foreground); }
h2 { margin: 32px 0 12px; font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--vscode-descriptionForeground); }
.lead { margin: 20px 0 0; max-width: 440px; font-size: 16px; line-height: 1.55; color: var(--vscode-descriptionForeground); }
.movements { display: flex; flex-direction: column; gap: 8px; }
button { font-family: inherit; cursor: pointer; }
button:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; }
.mv { display: flex; align-items: center; gap: 16px; min-height: 60px; padding: 0 18px; text-align: left; color: var(--vscode-foreground);
  background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border)); box-sizing: border-box; }
.mv[aria-pressed="true"] { border: 2px solid var(--accent); }
.chips { display: flex; gap: 3px; flex: none; }
.chip { width: 14px; height: 14px; display: block; }
.mvtext { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.mvname { font-size: 15px; font-weight: 600; }
.mvsub { font-size: 12px; color: var(--vscode-descriptionForeground); }
.mvmode { font-family: var(--vscode-editor-font-family); font-size: 11px; color: var(--vscode-descriptionForeground); }
.actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 24px; }
.primary, .secondary { height: 44px; padding: 0 24px; font-size: 14px; font-weight: 600; border: 0; }
.primary:disabled { cursor: not-allowed; background: transparent !important; color: var(--vscode-descriptionForeground) !important; border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border)); }
.secondary { font-weight: 500; background: transparent; color: var(--vscode-foreground); border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border)); }
.note { margin: 14px 0 0; font-size: 13px; color: var(--vscode-descriptionForeground); }
.stage { overflow: hidden; }
.stage svg { display: block; width: 100%; height: auto; max-width: 720px; }
.caption { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
.caption strong { color: var(--vscode-foreground); }
.seed { font-family: var(--vscode-editor-font-family); }
@media (prefers-reduced-motion: no-preference) { .stage svg { transition: opacity .15s; } }
`;

const SCRIPT = `
const vscode = acquireVsCodeApi();
const app = document.getElementById('app');
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  vscode.postMessage({ type: el.dataset.action, index: Number(el.dataset.index) });
});
window.addEventListener('message', (e) => {
  const active = document.activeElement;
  const key = active && active.dataset ? active.dataset.key : null;
  app.innerHTML = e.data.html;
  if (key) {
    const next = app.querySelector('[data-key="' + key + '"]');
    if (next) next.focus();
  }
});
`;

class Gallery {
  static show() {
    if (Gallery.current) {
      Gallery.current.panel.reveal();
      return;
    }
    Gallery.current = new Gallery();
  }

  constructor() {
    this.state = { sel: 0, seed: SEED_START, applied: false };
    this.panel = vscode.window.createWebviewPanel('artify.gallery', 'Artify Gallery', vscode.ViewColumn.Active, { enableScripts: true });
    this.panel.webview.html = this.html();
    this.panel.webview.onDidReceiveMessage((msg) => this.onMessage(msg));
    this.panel.onDidDispose(() => {
      Gallery.current = undefined;
    });
  }

  html() {
    const nonce = crypto.randomBytes(16).toString('base64');
    const csp = `default-src 'none'; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Artify Gallery</title>
<style>${CSS}</style>
</head>
<body>
<div id="app">${appHtml(this.state)}</div>
<script nonce="${nonce}">${SCRIPT}</script>
</body>
</html>`;
  }

  async onMessage(msg) {
    if (msg.type === 'select' && Number.isInteger(msg.index) && MOVEMENTS[msg.index]) {
      this.state = { ...this.state, sel: msg.index, applied: false };
    } else if (msg.type === 'shuffle') {
      this.state = { ...this.state, seed: this.state.seed + SEED_STEP, applied: false };
    } else if (msg.type === 'apply') {
      const theme = MOVEMENTS[this.state.sel].theme;
      if (!theme) return;
      await vscode.workspace.getConfiguration('workbench').update('colorTheme', theme, vscode.ConfigurationTarget.Global);
      this.state = { ...this.state, applied: true };
    } else {
      return;
    }
    this.panel.webview.postMessage({ html: appHtml(this.state) });
  }
}

module.exports = { Gallery };
