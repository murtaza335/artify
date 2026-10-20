// Proves the deck never repeats: every form once per round, studio designs once per round, no repeated seeds,
// no form twice in a row across a round boundary, and progress that matches what was dealt.

const { Deck } = require('../src/deck');
const { ALL, CATEGORIES, compose } = require('../src/forms');

function memento() {
  const data = {};
  return { get: (k) => data[k], update: async (k, v) => { data[k] = JSON.parse(JSON.stringify(v)); } };
}

const failures = [];
const fail = (m) => failures.push(m);

// 1. Everything: three full rounds with no repeats inside a round and no back-to-back repeats.
{
  const deck = new Deck(memento());
  const seeds = new Set();
  let previous = null;
  for (let round = 0; round < 3; round++) {
    const seen = new Set();
    for (let i = 0; i < ALL.length; i++) {
      const d = deck.next('all', []);
      if (seen.has(d.form)) fail(`round ${round}: ${d.form} repeated`);
      seen.add(d.form);
      if (d.form === previous) fail(`${d.form} came twice in a row`);
      previous = d.form;
      if (seeds.has(d.seed)) fail(`seed ${d.seed} reused`);
      seeds.add(d.seed);
    }
    if (seen.size !== ALL.length) fail(`round ${round} showed ${seen.size} of ${ALL.length} forms`);
  }
}

// 2. Every category deals only its own forms, each once per round.
for (const category of Object.keys(CATEGORIES)) {
  const deck = new Deck(memento());
  const ids = new Set(CATEGORIES[category].map((f) => f.name));
  const seen = new Set();
  for (let i = 0; i < ids.size; i++) {
    const d = deck.next(category, []);
    if (!ids.has(d.form)) fail(`${category} dealt ${d.form}, which is not in it`);
    if (seen.has(d.form)) fail(`${category} repeated ${d.form} inside a round`);
    seen.add(d.form);
  }
}

// 3. Studio designs: all of them come up before any comes up again.
{
  const creations = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id, items: [{}] }));
  const deck = new Deck(memento());
  let previous = null;
  for (let round = 0; round < 4; round++) {
    const seen = new Set();
    for (let i = 0; i < creations.length; i++) {
      const d = deck.next('mine', creations);
      if (!d.creation) fail('mine dealt a generated form');
      if (seen.has(d.creation)) fail(`my design ${d.creation} repeated inside a round`);
      if (d.creation === previous) fail(`my design ${d.creation} came twice in a row`);
      seen.add(d.creation);
      previous = d.creation;
    }
  }
  // A deleted design leaves the bag, and a new one joins at the next round.
  const smaller = creations.slice(1);
  for (let i = 0; i < 6; i++) if (deck.next('mine', smaller).creation === 'a') fail('a deleted design was dealt');
}

// 4. Mixed deck: designs appear among the forms but never twice in a row.
{
  const creations = ['x', 'y'].map((id) => ({ id, name: id, items: [{}] }));
  const deck = new Deck(memento());
  let mine = 0;
  const run = [];
  for (let i = 0; i < 400; i++) {
    const d = deck.next('all', creations);
    run.push(d.creation || d.form);
    if (d.creation) mine++;
  }
  if (mine === 0) fail('studio designs never appeared among Everything');
  for (let i = 1; i < run.length; i++) if (run[i] === run[i - 1]) fail(`${run[i]} twice in a row in the mixed deck`);
}

// 5. Puzzles stay small, still without repeating forms inside the bag.
{
  const deck = new Deck(memento());
  const seen = new Set();
  for (let i = 0; i < 25; i++) {
    const d = deck.next('all', [], { maxParts: 45 });
    if (compose('dark', d.seed, d.category, d.form).parts > 45) fail(`puzzle ${d.form} has too many pieces`);
    if (seen.has(d.form)) fail(`puzzle repeated ${d.form}`);
    seen.add(d.form);
  }
}

// 6. Progress reflects the round and resets on request; the state survives a restart.
{
  const m = memento();
  const deck = new Deck(m);
  const creations = [{ id: 'p', name: 'p', items: [{}] }, { id: 'q', name: 'q', items: [{}] }];
  if (deck.progress('animals', creations).seen !== 0) fail('progress should start at zero');
  for (let i = 0; i < 5; i++) deck.next('animals', []);
  const p = deck.progress('animals', creations);
  if (p.seen !== 5 || p.total !== CATEGORIES.animals.length) fail(`progress after 5 deals was ${p.seen} of ${p.total}`);
  const again = new Deck(m);
  if (again.progress('animals', creations).seen !== 5) fail('progress was lost across a restart');
  again.next('mine', creations);
  if (again.progress('all', creations).mineSeen !== 1) fail('studio progress did not count');
  again.newRound();
  if (again.progress('animals', creations).seen !== 0 || again.progress('all', creations).mineSeen !== 0) fail('newRound did not reset progress');
}

// 7. A form added in the middle of a round is dealt before the round ends, and forms already seen are not dealt again.
{
  const m = memento();
  // A round saved by an older version: no list of dealt forms, two animals still to come.
  m.update('artify.deck', { bags: { animals: ['cat', 'dog'] }, seeds: [] });
  const deck = new Deck(m);
  const dealt = [];
  const newOnes = CATEGORIES.animals.map((f) => f.name).filter((n) => !['cat', 'dog', 'songbird', 'owl', 'gulls', 'fish', 'fox', 'whale', 'butterfly', 'rabbit', 'turtle', 'penguin'].includes(n));
  for (let i = 0; i < 2 + newOnes.length; i++) dealt.push(deck.next('animals', []).form);
  if (!newOnes.length) fail('test expects new animal forms to exist');
  for (const id of newOnes) if (!dealt.includes(id)) fail(`new form ${id} was not merged into a round in progress`);
  for (const id of ['cat', 'dog']) if (dealt.filter((d) => d === id).length !== 1) fail(`${id} should be dealt once in the rest of the round`);
  if (dealt.includes('fox')) fail('a form already dealt this round came back');
  // A modern round that is missing one form: it joins the bag.
  const state = deck.load();
  state.bags.nature = ['tree'];
  state.dealt.nature = CATEGORIES.nature.map((f) => f.name).filter((n) => !['tree', 'cactus'].includes(n));
  m.update('artify.deck', state);
  const rest = [deck.next('nature', []).form, deck.next('nature', []).form].sort().join();
  if (rest !== ['cactus', 'tree'].sort().join()) fail(`mid-round form was not dealt: ${rest}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Deck OK: no repeats inside a round, none back to back, no reused seeds, progress tracked and saved.');
