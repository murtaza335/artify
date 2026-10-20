'use strict';

// Everything Artify Play saves lives in the extension's global state, so it follows the user across workspaces.

const KEYS = {
  collection: 'artify.collection',
  paintings: 'artify.paintings',
  creations: 'artify.creations'
};
const LIMITS = { collection: 24, paintings: 12, creations: 40 };

class Store {
  /** @param {import('vscode').Memento} memento */
  constructor(memento) {
    this.memento = memento;
  }

  // Generated designs that were kept: { seed, category, form?, creation? }
  collection() {
    return this.memento.get(KEYS.collection, []);
  }

  async addToCollection(item) {
    const list = this.collection();
    const same = (a, b) => a.seed === b.seed && a.category === b.category && (a.creation || '') === (b.creation || '') && (a.form || '') === (b.form || '');
    if (!list.some((s) => same(s, item))) {
      list.unshift(item);
      await this.memento.update(KEYS.collection, list.slice(0, LIMITS.collection));
    }
  }

  async removeFromCollection(index) {
    const list = this.collection();
    list.splice(index, 1);
    await this.memento.update(KEYS.collection, list);
  }

  clearCollection() {
    return this.memento.update(KEYS.collection, []);
  }

  // Splash paintings: { id, dataUrl }
  paintings() {
    return this.memento.get(KEYS.paintings, []);
  }

  async addPainting(dataUrl) {
    const list = this.paintings();
    list.unshift({ id: String(Date.now()), dataUrl });
    await this.memento.update(KEYS.paintings, list.slice(0, LIMITS.paintings));
  }

  async removePainting(id) {
    await this.memento.update(KEYS.paintings, this.paintings().filter((p) => p.id !== id));
  }

  // Studio creations: { id, name, bg, items: [{ shape, x, y, size, rot, color, flip }] }
  creations() {
    return this.memento.get(KEYS.creations, []);
  }

  async saveCreation(creation) {
    const list = this.creations();
    const i = list.findIndex((c) => c.id === creation.id);
    if (i >= 0) list[i] = creation;
    else list.unshift(creation);
    await this.memento.update(KEYS.creations, list.slice(0, LIMITS.creations));
  }

  async removeCreation(id) {
    await this.memento.update(KEYS.creations, this.creations().filter((c) => c.id !== id));
    // Designs that pointed at it fall back to a generated form.
    await this.memento.update(KEYS.collection, this.collection().filter((c) => c.creation !== id));
  }
}

// Accepts only well-formed creations from the webview, with sane limits.
function sanitizeCreation(raw, shapeIds) {
  if (!raw || !Array.isArray(raw.items)) return undefined;
  const num = (v, min, max, d) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d);
  const items = raw.items
    .filter((it) => it && shapeIds.has(it.shape))
    .slice(0, 200)
    .map((it) => ({
      shape: it.shape,
      x: num(it.x, -100, 340, 120),
      y: num(it.y, -100, 480, 190),
      size: num(it.size, 8, 480, 80),
      rot: num(it.rot, -720, 720, 0),
      color: Math.floor(num(it.color, 0, 7, 0)),
      flip: Boolean(it.flip)
    }));
  if (!items.length) return undefined;
  return {
    id: typeof raw.id === 'string' && /^[\w-]{1,40}$/.test(raw.id) ? raw.id : 'c' + Date.now(),
    name: String(raw.name || 'My design').slice(0, 60),
    bg: raw.bg === null || raw.bg === undefined ? null : Math.floor(num(raw.bg, 0, 7, 0)),
    items
  };
}

module.exports = { Store, sanitizeCreation };
