'use strict';

const vscode = require('vscode');
const crypto = require('crypto');
const os = require('os');
const { renderDesign, composeCreation, CATEGORY_LABELS, ANIMATION_CSS } = require('./forms');
const { COLORS, COLOR_NAMES } = require('./shapes/engine');
const { SHAPES } = require('./shapes/library');
const { sanitizeCreation } = require('./store');
const { themeKind } = require('./views');

// Artify Play: a page for something to do while an agent or a long build is working.
// Four toys: Reform (endless generated art), Puzzle (drag shards back into place), Splash (throw paint)
// and Studio (build your own design from a picker of shapes). Everything can be saved.

const PUZZLE_MAX_PIECES = 45;
const MAX_IMAGE_CHARS = 600000;
const SHAPE_IDS = new Set(SHAPES.map((s) => s.id));

const MODES = [
  { id: 'reform', label: 'Reform' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'splash', label: 'Splash' },
  { id: 'studio', label: 'Studio' }
];

class PlayPanel {
  static show(context, store, deck) {
    if (PlayPanel.current) {
      PlayPanel.current.panel.reveal();
      return;
    }
    PlayPanel.current = new PlayPanel(context, store, deck);
  }

  /** Redraws the open page after a theme change. */
  static refresh() {
    if (PlayPanel.current) PlayPanel.current.sendAll();
  }

  constructor(context, store, deck) {
    this.store = store;
    this.deck = deck;
    this.current = { seed: 0, category: 'all', mode: 'reform' };
    const media = vscode.Uri.joinPath(context.extensionUri, 'media');
    this.panel = vscode.window.createWebviewPanel('artify.play', 'Artify Play', vscode.ViewColumn.Active, {
      enableScripts: true,
      localResourceRoots: [media]
    });
    this.panel.webview.html = this.html(media);
    this.panel.webview.onDidReceiveMessage((msg) => this.onMessage(msg));
    this.panel.onDidDispose(() => {
      PlayPanel.current = undefined;
    });
  }

  html(media) {
    const webview = this.panel.webview;
    const nonce = crypto.randomBytes(16).toString('base64');
    const uri = (name) => webview.asWebviewUri(vscode.Uri.joinPath(media, name));
    const csp = `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src data:;`;
    const tabs = MODES.map((m, i) => `<button role="tab" id="tab-${m.id}" aria-selected="${i === 0}" aria-controls="panel-${m.id}" tabindex="${i === 0 ? 0 : -1}" data-mode="${m.id}">${m.label}</button>`).join('');
    const pills = Object.entries(CATEGORY_LABELS)
      .map(([id, label]) => `<button class="pill" data-category="${id}" aria-pressed="${id === 'all'}">${label}</button>`)
      .join('');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Artify Play</title>
<link rel="stylesheet" href="${uri('play.css')}">
<style>${ANIMATION_CSS}</style>
</head>
<body>
<div class="app">
  <header>
    <div class="brand">ARTIFY</div>
    <h1>Play while you wait.</h1>
    <p class="lead">Make art, solve it, throw paint, or build your own. Nothing here needs your editor, so your agent keeps working.</p>
    <div class="tabs" role="tablist" aria-label="Toys">${tabs}</div>
  </header>

  <div class="layout">
    <div class="controls">
      <section id="panel-reform" role="tabpanel" aria-labelledby="tab-reform">
        <h2>Pick a theme</h2>
        <div class="pills" role="group" aria-label="Shape category">${pills}</div>
        <div class="actions">
          <button id="reform" class="primary">Reform</button>
          <button id="keep" class="secondary">Save design</button>
          <button id="export-svg" class="secondary">Export SVG</button>
        </div>
        <label class="check"><input type="checkbox" id="auto"> Auto-reform every 5 seconds</label>
        <button id="new-round" class="secondary small">Start a new round</button>
        <p class="hint">Press Space or R to reform. Nothing repeats until you have seen everything, then a new round begins. Designs you make in Studio are dealt the same way. <span id="made"></span></p>
      </section>

      <section id="panel-puzzle" role="tabpanel" aria-labelledby="tab-puzzle" hidden>
        <h2>Put it back together</h2>
        <p class="hint">Drag each shard to where it belongs. Pieces snap into place when they are close.</p>
        <div class="actions">
          <button id="newpuzzle" class="primary">New puzzle</button>
          <button id="solve" class="secondary">Show answer</button>
          <button id="keep-puzzle" class="secondary">Save design</button>
        </div>
        <label class="check"><input type="checkbox" id="guide" checked> Show a faint guide</label>
        <p id="progress" class="progress" role="status"></p>
      </section>

      <section id="panel-splash" role="tabpanel" aria-labelledby="tab-splash" hidden>
        <h2>Pick a paint</h2>
        <div id="swatches" class="swatches" role="group" aria-label="Paint colors"></div>
        <label class="range">Brush size <input type="range" id="size" min="8" max="60" value="26"></label>
        <div class="actions">
          <button id="clear" class="secondary">Clear canvas</button>
          <button id="save-painting" class="primary">Save painting</button>
          <button id="export-png" class="secondary">Export PNG</button>
        </div>
        <p class="hint">Drag to splash paint. Hold still to pour a puddle. Number keys pick a color, C clears.</p>
      </section>

      <section id="panel-studio" role="tabpanel" aria-labelledby="tab-studio" hidden>
        <h2>Shapes</h2>
        <div id="picker" class="picker" role="group" aria-label="Shape picker"></div>
        <h2 class="spaced">Selected shape</h2>
        <div id="studio-colors" class="swatches" role="group" aria-label="Color of the selected shape"></div>
        <div class="tools" role="group" aria-label="Shape tools">
          <button id="t-forward" class="secondary small">Bring forward</button>
          <button id="t-back" class="secondary small">Send back</button>
          <button id="t-flip" class="secondary small">Flip</button>
          <button id="t-dup" class="secondary small">Duplicate</button>
          <button id="t-del" class="secondary small">Delete</button>
        </div>
        <p class="hint">Drag a shape to move it. Use the round handles to resize and rotate. With a shape selected, arrow keys move it, plus and minus resize it, [ and ] rotate it, D duplicates it and Delete removes it.</p>
        <h2 class="spaced">Background</h2>
        <div id="studio-bg" class="swatches" role="group" aria-label="Canvas background"></div>
        <div class="actions">
          <button id="t-undo" class="secondary small">Undo</button>
          <button id="t-clear" class="secondary small">Clear all</button>
        </div>
        <label class="range">Name <input type="text" id="design-name" maxlength="60" value="My design"></label>
        <div class="actions">
          <button id="save-design" class="primary">Save design</button>
          <button id="export-design" class="secondary">Export SVG</button>
        </div>
        <h2 class="spaced">My designs</h2>
        <div id="creations" class="strip"></div>
        <p id="creations-empty" class="hint">Saved designs show up here, and can appear when you reform.</p>
      </section>
    </div>

    <div class="stage-wrap">
      <div class="stage">
        <div id="art" aria-live="polite"></div>
        <canvas id="paint" hidden aria-label="Paint canvas. Use a mouse or touch to splash paint."></canvas>
        <div id="studio-wrap" hidden></div>
      </div>
      <p id="caption" class="caption"></p>
      <p id="toast" class="toast" role="status"></p>
    </div>
  </div>

  <aside id="collection-wrap" class="collection">
    <h2>Saved designs</h2>
    <div id="collection" class="strip"></div>
    <p id="collection-empty" class="hint">Press Save design to keep a design here.</p>
    <button id="clear-collection" class="secondary small" hidden>Clear saved designs</button>
    <h2 class="spaced">Saved paintings</h2>
    <div id="paintings" class="strip"></div>
    <p id="paintings-empty" class="hint">Press Save painting in Splash to keep one here.</p>
  </aside>
</div>
<script nonce="${nonce}" src="${uri('play.js')}"></script>
<script nonce="${nonce}" src="${uri('studio.js')}"></script>
</body>
</html>`;
  }

  post(message) {
    return this.panel.webview.postMessage(message);
  }

  toast(text) {
    this.post({ type: 'toast', text });
  }

  // The state the page needs to redraw itself.
  sendAll() {
    const kind = themeKind();
    this.post({ type: 'library', shapes: SHAPES });
    this.post({ type: 'palette', colors: COLORS[kind], names: COLOR_NAMES[kind] });
    this.sendCreations();
    this.sendCollection();
    this.sendPaintings();
    this.showDesign(this.current.seed || this.current.creation ? this.current : this.deck.next('all', this.store.creations()), this.current.mode === 'puzzle' ? 'puzzle' : 'reform');
  }

  showDesign(item, mode) {
    this.current = { seed: item.seed, category: item.category, creation: item.creation, form: item.form, mode };
    const { svg, name } = renderDesign(themeKind(), item, this.store.creations());
    this.post({ type: 'art', svg, name, seed: item.seed, creation: item.creation, mode });
  }

  sendCollection() {
    const kind = themeKind();
    const creations = this.store.creations();
    const items = this.store.collection().map((item) => {
      const { svg, name } = renderDesign(kind, item, creations);
      return { svg, name, seed: item.seed };
    });
    this.post({ type: 'collection', items });
  }

  sendPaintings() {
    this.post({ type: 'paintings', items: this.store.paintings().map(({ id, dataUrl }) => ({ id, dataUrl })) });
  }

  sendCreations() {
    const kind = themeKind();
    const items = this.store.creations().map((c) => ({ ...c, svg: composeCreation(kind, c).svg }));
    this.post({ type: 'creations', items });
  }

  async exportFile(defaultName, filters, bytes) {
    const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
    const base = folder ? folder.uri : vscode.Uri.file(os.homedir());
    const target = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.joinPath(base, defaultName), filters });
    if (!target) return;
    await vscode.workspace.fs.writeFile(target, bytes);
    this.toast('Exported ' + target.path.split('/').pop() + '.');
    vscode.window.showInformationMessage('Artify exported ' + target.fsPath);
  }

  async onMessage(msg) {
    const categories = Object.keys(CATEGORY_LABELS);
    const category = categories.includes(msg.category) ? msg.category : this.current.category;
    const creations = this.store.creations();
    switch (msg.type) {
      case 'ready':
        this.sendAll();
        break;
      case 'reform':
        this.showDesign(this.deck.next(category, creations), 'reform');
        break;
      case 'puzzle':
        this.showDesign(this.deck.next(category, creations, { maxParts: PUZZLE_MAX_PIECES }), 'puzzle');
        break;
      case 'keep':
        if (!this.current.seed && !this.current.creation) return;
        await this.store.addToCollection({ seed: this.current.seed, category: this.current.category, form: this.current.form, creation: this.current.creation });
        this.sendCollection();
        this.toast('Design saved.');
        break;
      case 'newRound':
        await this.deck.newRound();
        this.toast('New round: every shape counts as unseen again.');
        break;
      case 'openCollection': {
        const item = this.store.collection()[msg.index];
        if (item) this.showDesign(item, 'reform');
        break;
      }
      case 'removeCollection':
        await this.store.removeFromCollection(msg.index);
        this.sendCollection();
        break;
      case 'clearCollection':
        await this.store.clearCollection();
        this.sendCollection();
        break;
      case 'savePainting':
        if (typeof msg.dataUrl === 'string' && /^data:image\/(jpeg|png);base64,/.test(msg.dataUrl) && msg.dataUrl.length < MAX_IMAGE_CHARS) {
          await this.store.addPainting(msg.dataUrl);
          this.sendPaintings();
          this.toast('Painting saved.');
        }
        break;
      case 'removePainting':
        await this.store.removePainting(String(msg.id));
        this.sendPaintings();
        break;
      case 'loadPainting': {
        const found = this.store.paintings().find((p) => p.id === String(msg.id));
        if (found) this.post({ type: 'paintingData', dataUrl: found.dataUrl });
        break;
      }
      case 'exportPng':
        if (typeof msg.dataUrl === 'string' && /^data:image\/png;base64,/.test(msg.dataUrl)) {
          await this.exportFile('artify-painting.png', { 'PNG image': ['png'] }, Buffer.from(msg.dataUrl.split(',')[1], 'base64'));
        }
        break;
      case 'exportSvg': {
        if (!this.current.seed && !this.current.creation) return;
        const { svg } = renderDesign(themeKind(), this.current, creations);
        await this.exportFile('artify-design.svg', { 'SVG image': ['svg'] }, Buffer.from(svg, 'utf8'));
        break;
      }
      case 'saveCreation': {
        const creation = sanitizeCreation(msg.creation, SHAPE_IDS);
        if (!creation) {
          this.toast('Add at least one shape first.');
          return;
        }
        await this.store.saveCreation(creation);
        this.sendCreations();
        this.post({ type: 'creationSaved', id: creation.id });
        this.toast('Saved "' + creation.name + '". It can now appear when you reform.');
        break;
      }
      case 'removeCreation':
        await this.store.removeCreation(String(msg.id));
        this.sendCreations();
        this.sendCollection();
        break;
      case 'exportCreation': {
        const creation = sanitizeCreation(msg.creation, SHAPE_IDS);
        if (creation) await this.exportFile('artify-design.svg', { 'SVG image': ['svg'] }, Buffer.from(composeCreation(themeKind(), creation).svg, 'utf8'));
        break;
      }
      default:
    }
  }
}

module.exports = { PlayPanel };
