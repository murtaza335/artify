'use strict';

// Decides what to show next, and remembers what has been shown.
//
// Forms are dealt from a shuffled bag per category: every form appears once before any form comes round
// again, and the first form of a new round is never the one that just played. The same goes for the user's
// own Studio designs, which have a bag of their own. Seeds are never reused while they are still in the
// recent list, so even the same form looks different each time. The bags are saved, so a round carries on
// across sessions and across the Explorer view and the Play page.

const { canonicalCategory, compose, formIds } = require('./forms');

const KEY = 'artify.deck';
const RECENT_SEEDS = 400;
const MINE_SHARE = 0.2; // how often a studio design is dealt when the category is Everything
const PUZZLE_TRIES = 6;

// Forms that existed before decks remembered which forms a round had dealt. A round saved without that list
// treats these as already dealt unless they are still in the bag, so only forms added later get merged in.
const LEGACY_IDS = [
  'cat', 'dog', 'songbird', 'owl', 'gulls', 'fish', 'fox', 'whale',
  'butterfly', 'rabbit', 'turtle', 'penguin', 'flower', 'sunflower', 'tulips', 'bouquet',
  'grass', 'tree', 'mushrooms', 'fractalTree', 'palmIsland', 'pond', 'wreath', 'seedling',
  'galaxy', 'planet', 'nightsky', 'rocket', 'astronaut', 'ufo', 'solarSystem', 'satellite',
  'constellation', 'eclipse', 'scenery', 'mountains', 'waves', 'tower', 'desert', 'beach',
  'autumnForest', 'coralReef', 'canyon', 'waterfall', 'painting', 'vessel', 'tiles', 'cubistFace',
  'mondrian', 'homage', 'suprematism', 'kandinsky', 'stillLife', 'cloudscape', 'rainstorm', 'thunderstorm',
  'snowfall', 'rainbow', 'windy', 'fog', 'sunnyday', 'tornado', 'aurora', 'hurricane',
  'hail', 'windowRain', 'heatWave', 'moonClouds', 'chair', 'table', 'room', 'corner',
  'clock', 'teapot', 'shelf', 'plant', 'umbrella', 'house', 'lighthouse', 'bicycle',
  'sailboat', 'sofa', 'bed', 'desk', 'lightbulb', 'guitar', 'hotAirBalloon', 'camera',
  'door', 'cubistPoster', 'picasso', 'splitFace', 'triadic', 'kleeGrid', 'minimalFace', 'mask',
  'profile', 'popPanels', 'facetedFace', 'lineFace', 'rubinVase', 'celestial', 'rings', 'star',
  'cubes', 'triangles', 'gem', 'truchet', 'voronoi', 'spirograph', 'lissajous', 'moire',
  'sierpinski', 'mandala', 'arches'
];

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Starts a fresh bag, making sure its first item is not the one that was dealt last.
function freshBag(ids, last) {
  const bag = shuffle(ids);
  if (bag.length > 1 && bag[0] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
  return bag;
}

class Deck {
  /**
   * @param {{ get(key: string): any, update(key: string, value: any): any }} memento
   * @param {string} [key] separate decks keep separate rounds
   */
  constructor(memento, key = KEY) {
    this.memento = memento;
    this.key = key;
  }

  load() {
    const s = this.memento.get(this.key) || {};
    return { bags: s.bags || {}, dealt: s.dealt || {}, creationBag: s.creationBag || null, lastForm: s.lastForm || null, lastCreation: s.lastCreation || null, seeds: s.seeds || [] };
  }

  save(state) {
    return this.memento.update(this.key, state);
  }

  /**
   * Deals the next design: { seed, category, form } for a generated form or { seed: 0, category, creation } for a studio design.
   * @param {string} category
   * @param {Array<{ id: string, items: unknown[] }>} creations
   * @param {{ maxParts?: number }} [opts] maxParts keeps puzzles to a playable size
   */
  next(category, creations = [], opts = {}) {
    category = canonicalCategory(category);
    const state = this.load();
    const usable = creations.filter((c) => !opts.maxParts || c.items.length <= opts.maxParts);
    const wantMine = usable.length > 0 && (category === 'mine' || (category === 'all' && Math.random() < MINE_SHARE));
    const design = wantMine ? this.dealCreation(state, usable, category) : this.dealForm(state, category === 'mine' ? 'all' : category, opts);
    this.save(state);
    return design;
  }

  dealCreation(state, usable, category) {
    const ids = usable.map((c) => c.id);
    let bag = (state.creationBag || []).filter((id) => ids.includes(id));
    if (!bag.length) bag = freshBag(ids, state.lastCreation);
    const id = bag.shift();
    state.creationBag = bag;
    state.lastCreation = id;
    return { seed: 0, category, creation: id };
  }

  /**
   * Shuffles forms added since a round began into its bag, so a release is visible before the round ends.
   * Returns the bag for the key, with unknown forms dropped.
   */
  mergeNew(state, key, valid) {
    const stored = state.bags[key];
    if (!stored) return [];
    let bag = stored.filter((id) => valid.includes(id));
    if (!state.dealt[key]) state.dealt[key] = LEGACY_IDS.filter((id) => valid.includes(id) && !bag.includes(id));
    const fresh = valid.filter((id) => !bag.includes(id) && !state.dealt[key].includes(id));
    if (fresh.length) bag = shuffle(bag.concat(fresh));
    return bag;
  }

  dealForm(state, pool, opts) {
    const key = opts.maxParts ? pool + ':puzzle' : pool;
    const valid = formIds(pool);
    let bag = this.mergeNew(state, key, valid);
    let form;
    let seed = null;
    for (let attempt = 0; attempt < (opts.maxParts ? PUZZLE_TRIES : 1); attempt++) {
      if (!bag.length) {
        bag = freshBag(valid, state.lastForm);
        state.dealt[key] = [];
      }
      form = bag.shift();
      state.dealt[key] = (state.dealt[key] || []).concat(form);
      seed = this.freshSeed(state, pool, form, opts);
      if (seed !== null) break;
    }
    // A puzzle form that never fits is still better than nothing: take any new seed.
    if (seed === null) seed = this.freshSeed(state, pool, form, {});
    state.bags[key] = bag;
    state.lastForm = form;
    state.seeds = state.seeds.concat(seed).slice(-RECENT_SEEDS);
    return { seed, category: pool, form };
  }

  freshSeed(state, pool, form, opts) {
    for (let tries = 0; tries < 14; tries++) {
      const seed = 1 + Math.floor(Math.random() * 99999);
      if (state.seeds.includes(seed)) continue;
      if (opts.maxParts && compose('dark', seed, pool, form).parts > opts.maxParts) continue;
      return seed;
    }
    return null;
  }

  /** How far through the current round the user is, for the form bag of a category and for their own designs. */
  progress(category, creations = []) {
    const state = this.load();
    const pool = category === 'mine' ? 'all' : canonicalCategory(category);
    const valid = formIds(pool);
    const bag = state.bags[pool] ? this.mergeNew(state, pool, valid) : null;
    const left = bag ? bag.length : valid.length;
    const mineIds = creations.map((c) => c.id);
    const mineLeft = state.creationBag ? state.creationBag.filter((id) => mineIds.includes(id)).length : mineIds.length;
    return {
      seen: bag ? valid.length - left : 0,
      total: valid.length,
      mineSeen: state.creationBag ? mineIds.length - mineLeft : 0,
      mineTotal: mineIds.length
    };
  }

  /** Starts over: every form and every studio design counts as unseen again. */
  newRound() {
    const state = this.load();
    state.bags = {};
    state.dealt = {};
    state.creationBag = null;
    return this.save(state);
  }
}

module.exports = { Deck };
