'use strict';

// Registry and composer for the procedural shapes behind the Reform button and the Play page.
// Every seed builds a different composition out of flat geometric shards in a 240 x 380 viewBox.

const { createContext, fmt, makeRand, COLORS } = require('./shapes/engine');
const { SHAPE_MAP } = require('./shapes/library');
const classic = require('./shapes/classic');
const animals = require('./shapes/animals');
const nature = require('./shapes/nature');
const space = require('./shapes/space');
const scenery = require('./shapes/scenery');
const geometric = require('./shapes/geometric');
const weather = require('./shapes/weather');
const objects = require('./shapes/objects');
const moreAnimals = require('./shapes/more-animals');
const moreNature = require('./shapes/more-nature');
const moreSpace = require('./shapes/more-space');
const moreScenery = require('./shapes/more-scenery');
const moreObjects = require('./shapes/more-objects');
const moreArt = require('./shapes/more-art');
const faces = require('./shapes/faces');
const food = require('./shapes/food');
const patterns = require('./shapes/patterns');
const styles = require('./shapes/styles');
const wildlife = require('./shapes/wildlife');
const garden = require('./shapes/garden');
const cosmos = require('./shapes/cosmos');
const landscapes = require('./shapes/landscapes');
const things = require('./shapes/things');
const portraits = require('./shapes/portraits');
const animeFaces = require('./shapes/anime-faces');
const animeCharacters = require('./shapes/anime-characters');
const animeScenes = require('./shapes/anime-scenes');
const cartoons = require('./shapes/cartoons');
const cartoonScenes = require('./shapes/cartoon-scenes');
const abstractPioneers = require('./shapes/abstract-pioneers');
const abstractHardedge = require('./shapes/abstract-hardedge');
const abstractGenerative = require('./shapes/abstract-generative');
const abstractOrganic = require('./shapes/abstract-organic');
const abstractWorld = require('./shapes/abstract-world');
const abstractGraphic = require('./shapes/abstract-graphic');
const abstractColorfield = require('./shapes/abstract-colorfield');
const abstractIllusion = require('./shapes/abstract-illusion');

const CATEGORIES = {
  animals: [animals.cat, animals.dog, animals.songbird, animals.owl, animals.gulls, classic.fish, moreAnimals.fox, moreAnimals.whale, moreAnimals.butterfly, moreAnimals.rabbit, moreAnimals.turtle, moreAnimals.penguin, wildlife.elephant, wildlife.giraffe, wildlife.octopus, wildlife.jellyfish, wildlife.hummingbird, wildlife.flamingo, wildlife.snail, wildlife.bee, wildlife.deer, wildlife.peacock, wildlife.frog, wildlife.origamiCrane],
  nature: [classic.flower, nature.sunflower, nature.tulips, nature.bouquet, nature.grass, classic.tree, moreNature.mushrooms, moreNature.fractalTree, moreNature.palmIsland, moreNature.pond, moreNature.wreath, moreNature.seedling, garden.cactus, garden.bonsai, garden.cherryBlossom, garden.lotus, garden.fern, garden.succulents, garden.pinecone, garden.lavenderField, garden.bamboo, garden.willow],
  space: [space.galaxy, space.planet, space.nightsky, classic.rocket, moreSpace.astronaut, moreSpace.ufo, moreSpace.solarSystem, moreSpace.satellite, moreSpace.constellation, moreSpace.eclipse, cosmos.blackHole, cosmos.comet, cosmos.nebula, cosmos.ringedPlanet, cosmos.moonPhases, cosmos.spaceStation, cosmos.meteorShower, cosmos.lunarLander],
  scenery: [scenery.scenery, classic.mountains, geometric.waves, classic.tower, moreScenery.desert, moreScenery.beach, moreScenery.autumnForest, moreScenery.coralReef, moreScenery.canyon, moreScenery.waterfall, landscapes.riceTerraces, landscapes.iceberg, landscapes.savanna, landscapes.fjord, landscapes.volcano, landscapes.cabinLake, landscapes.windmills, landscapes.nightCity],
  art: [scenery.painting, classic.vessel, classic.tiles, moreArt.cubistFace, moreArt.mondrian, moreArt.homage, moreArt.suprematism, moreArt.kandinsky, moreArt.stillLife, styles.pointillism, styles.popArtDots, styles.artDeco, styles.constructivism, styles.bauhausPoster, styles.matisseCutouts, styles.greatWave, styles.memphis, styles.opArt, styles.kusamaDots, styles.haringDancers, styles.klimtSpiral, styles.delaunayDiscs, styles.arpBlobs, styles.calderMobile, styles.rothkoFields, styles.swissGrid, styles.hardEdge, styles.romanMosaic, styles.rileyStripes],
  weather: [weather.cloudscape, weather.rainstorm, weather.thunderstorm, weather.snowfall, weather.rainbow, weather.windy, weather.fog, weather.sunnyday, weather.tornado, moreScenery.aurora, moreScenery.hurricane, moreScenery.hail, moreScenery.windowRain, moreScenery.heatWave, moreScenery.moonClouds, landscapes.frostWindow, landscapes.dustStorm, landscapes.sunshower, landscapes.monsoon],
  objects: [objects.chair, objects.table, objects.room, objects.corner, objects.clock, objects.teapot, objects.shelf, objects.plant, objects.umbrella, objects.house, objects.lighthouse, objects.bicycle, objects.sailboat, moreObjects.sofa, moreObjects.bed, moreObjects.desk, moreObjects.lightbulb, moreObjects.guitar, moreObjects.hotAirBalloon, moreObjects.camera, moreObjects.door, things.piano, things.typewriter, things.recordPlayer, things.kite, things.bookStack, things.coffeeCup, things.vintageCar, things.train, things.headphones, things.wateringCan],
  faces: [faces.cubistPoster, faces.picasso, faces.splitFace, faces.triadic, faces.kleeGrid, faces.minimalFace, faces.mask, faces.profile, faces.popPanels, faces.facetedFace, faces.lineFace, faces.rubinVase, faces.celestial, moreArt.cubistFace, portraits.robotFace, portraits.mosaicFace, portraits.twinProfiles, portraits.totem, portraits.sleepyFace, portraits.cutoutFace, animeFaces.animeEyes, animeFaces.shoujoPortrait, animeFaces.coolRival, cartoons.bigNoseFace, cartoons.dizzyFace],
  geometric: [geometric.rings, geometric.star, geometric.cubes, geometric.triangles, classic.gem, classic.tiles, moreArt.truchet, moreArt.voronoi, moreArt.spirograph, moreArt.lissajous, moreArt.moire, moreArt.sierpinski, moreArt.mandala, moreArt.arches, patterns.penrose, patterns.honeycomb, patterns.goldenSpiral, patterns.tangram, patterns.islamicStar, patterns.guilloche, patterns.phyllotaxis, patterns.quilt, patterns.kaleidoscope, patterns.chevrons, patterns.halftone, patterns.impossibleTriangle],
  anime: [animeFaces.animeEyes, animeFaces.expressionSheet, animeFaces.shoujoPortrait, animeFaces.shonenGrin, animeFaces.coolRival, animeFaces.tearfulFace, animeFaces.angryChibi, animeFaces.sleepyChibi, animeCharacters.spikyHero, animeCharacters.magicalGirl, animeCharacters.schoolUniform, animeCharacters.ninjaRunner, animeCharacters.wanderingRonin, animeCharacters.mechaPilot, animeCharacters.giantRobot, animeCharacters.catEarGirl, animeCharacters.foxSpirit, animeCharacters.oniWarrior, animeCharacters.idolSinger, animeCharacters.oldMaster, animeCharacters.darkLord, animeCharacters.chibiCritter, animeCharacters.kaijuAttack, animeScenes.sakuraSchool, animeScenes.ramenStall, animeScenes.rooftopSunset, animeScenes.trainCrossing, animeScenes.shrineGate, animeScenes.neonAlley, animeScenes.summerFestival, animeScenes.floatingIslands, animeScenes.onsenNight, animeScenes.kotatsuRoom, animeScenes.transformation, animeScenes.mechaHangar, animeScenes.speedBurst, animeScenes.mangaPanels, animeScenes.screentoneGradient, animeScenes.impactFrame,
    cartoons.rubberHose, cartoons.cartoonCat, cartoons.cartoonMouse, cartoons.superheroKid, cartoons.friendlyGhost, cartoons.littleAlien, cartoons.cartoonDino, cartoons.witchOnBroom, cartoons.pirateCaptain, cartoons.monsterUnderBed, cartoons.grumpyCloud, cartoons.happySun, cartoons.bigNoseFace, cartoons.dizzyFace, cartoonScenes.chaseScene, cartoonScenes.anvilDrop, cartoonScenes.desertCliff, cartoonScenes.hillsWithFaces, cartoonScenes.wobblyHouse, cartoonScenes.popBurst, cartoonScenes.squashBall, cartoonScenes.tvTestCard],
  abstract: [...Object.values(abstractPioneers), ...Object.values(abstractHardedge), ...Object.values(abstractGenerative), ...Object.values(abstractOrganic), ...Object.values(abstractWorld), ...Object.values(abstractGraphic), ...Object.values(abstractColorfield), ...Object.values(abstractIllusion)],
  food: [food.fruitBowl, food.watermelon, food.sushi, food.pizza, food.iceCream, food.cupcake, food.citrusSlices, food.pineapple, food.layeredCake, food.breakfast]
};
const ALL = [...new Set(Object.values(CATEGORIES).flat())];

// Each form is known by its function name, so the deck can say which forms were shown.
const FORMS_BY_ID = Object.fromEntries(ALL.map((fn) => [fn.name, fn]));
if (Object.keys(FORMS_BY_ID).length !== ALL.length) throw new Error('Artify: two forms share a function name');
// Anime and Cartoons were once two categories. Settings, saved designs and deck bags that still say `cartoons`
// are read as the merged `anime` category.
const CATEGORY_ALIASES = { cartoons: 'anime' };
const canonicalCategory = (category) => CATEGORY_ALIASES[category] || category;
const formIds = (category) => [...new Set((CATEGORIES[canonicalCategory(category)] || ALL).map((fn) => fn.name))];

const CATEGORY_LABELS = {
  all: 'Everything', animals: 'Animals', nature: 'Nature', space: 'Space', scenery: 'Scenery', weather: 'Weather', objects: 'Objects', art: 'Art', abstract: 'Abstract', faces: 'Faces', geometric: 'Geometry', food: 'Food', anime: 'Anime & Cartoons', mine: 'My designs'
};

// Shards fly together when the host page includes this CSS. `p` marks a piece of the form, `d` marks debris.
const ANIMATION_CSS = `
.s { transform-box: fill-box; transform-origin: center; animation: reform .9s cubic-bezier(.2, .8, .2, 1) both; }
.f { animation: fade .4s .8s both; }
@keyframes reform { from { transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(.5); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .s, .f { animation: none; } }`;

/**
 * Builds a composition for the given seed.
 * @returns {{ svg: string, name: string, parts: number, category: string }}
 */
function compose(kind, seed, category = 'all', formId) {
  const ctx = createContext(kind, seed);
  const pool = CATEGORIES[canonicalCategory(category)] || ALL;
  // The pick always consumes the same random number, so a forced form keeps every other detail of its seed.
  const picked = ctx.pick(pool);
  const form = (formId && FORMS_BY_ID[formId]) || picked;
  const name = form(ctx);

  const bounds = ctx.parts.reduce(
    (b, p) => [Math.min(b[0], p.bounds[0]), Math.min(b[1], p.bounds[1]), Math.max(b[2], p.bounds[2]), Math.max(b[3], p.bounds[3])],
    [Infinity, Infinity, -Infinity, -Infinity]
  );
  const clear = (x, y, m) => x < bounds[0] - m || x > bounds[2] + m || y < bounds[1] - m || y > bounds[3] + m;

  let order = 0;
  const motion = () =>
    `--dx:${Math.round((ctx.rand() - 0.5) * 220)}px;--dy:${Math.round((ctx.rand() - 0.5) * 220)}px;--r:${Math.round((ctx.rand() - 0.5) * 240)}deg;animation-delay:${Math.min(order++ * 20, 600)}ms`;
  const wrap = (svg, role) => `<g class="s ${role}" data-i="${order}" style="${motion()}">${svg}</g>`;

  const out = ctx.parts.map((p) => wrap(p.svg, 'p'));

  // Debris around the form.
  const wanted = ctx.int(8, 11);
  let placed = 0;
  for (let tries = 0; tries < 80 && placed < wanted; tries++) {
    const x = 10 + ctx.rand() * 220;
    const y = 8 + ctx.rand() * 364;
    const s = 6 + ctx.rand() * 12;
    if (!clear(x, y, 12)) continue;
    const pts = [[x, y - s * 0.8], [x + s, y + s * 0.6], [x - s * 0.7, y + s * 0.5]]
      .map(([px, py]) => `${fmt(px + (ctx.rand() - 0.5) * 4)},${fmt(py + (ctx.rand() - 0.5) * 4)}`)
      .join(' ');
    out.push(wrap(`<polygon points="${pts}" fill="${ctx.pick(ctx.colors)}"/>`, 'd'));
    placed++;
  }
  placed = 0;
  for (let tries = 0; tries < 60 && placed < 5; tries++) {
    const x = 8 + ctx.rand() * 224;
    const y = 8 + ctx.rand() * 364;
    if (!clear(x, y, 10)) continue;
    out.push(wrap(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(2 + ctx.rand() * 3)}" fill="${ctx.pick(ctx.colors)}"/>`, 'd'));
    placed++;
  }

  const defs = ctx.defs.length ? `<defs>${ctx.defs.join('')}</defs>\n` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 380" role="img" aria-label="Abstract ${name}, design number ${seed}, made of flat geometric shards">
${defs}${out.join('\n')}
${ctx.extra.join('\n')}
</svg>`;
  return { svg, name, parts: ctx.parts.length, category };
}

const reformed = (kind, seed, category) => compose(kind, seed, category).svg;

/**
 * Makes a plain SVG (like the original vase) animate the same way generated forms do, by wrapping each shape
 * in a group that carries the fly-in variables. Wrapping keeps any transform the shape already has.
 */
function animateStatic(svg) {
  let i = 0;
  const unit = (n) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return svg.replace(/<(polygon|circle|path|ellipse|rect)\b[^>]*\/>/g, (shape) => {
    const style = `--dx:${Math.round((unit(1) - 0.5) * 220)}px;--dy:${Math.round((unit(2) - 0.5) * 220)}px;--r:${Math.round((unit(3) - 0.5) * 240)}deg;animation-delay:${Math.min(i * 20, 600)}ms`;
    i++;
    return `<g class="s" style="${style}">${shape}</g>`;
  });
}

const hashString = (s) => Array.from(String(s)).reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 99991, 7);

/**
 * Draws a design made in Artify Studio. Colors are stored as palette positions, so a saved design
 * follows the light or dark theme. Pieces fly together like the generated forms do.
 * @returns {{ svg: string, name: string, parts: number, category: string, creation: string }}
 */
function composeCreation(kind, creation) {
  const colors = COLORS[kind] || COLORS.dark;
  const rand = makeRand(hashString(creation.id));
  let order = 0;
  const motion = () =>
    `--dx:${Math.round((rand() - 0.5) * 220)}px;--dy:${Math.round((rand() - 0.5) * 220)}px;--r:${Math.round((rand() - 0.5) * 240)}deg;animation-delay:${Math.min(order++ * 20, 600)}ms`;
  const out = [];
  if (creation.bg !== null && creation.bg !== undefined) {
    out.push(`<g class="s p" data-i="0" style="${motion()}"><rect x="0" y="0" width="240" height="380" fill="${colors[creation.bg % 8]}"/></g>`);
  }
  creation.items.forEach((it) => {
    const shape = SHAPE_MAP[it.shape];
    if (!shape) return;
    const k = it.size / 100;
    const path = `<path d="${shape.d}"${shape.evenodd ? ' fill-rule="evenodd"' : ''} fill="${colors[it.color % 8]}" transform="translate(${fmt(it.x)} ${fmt(it.y)}) rotate(${fmt(it.rot)}) scale(${it.flip ? -k : k} ${k})"/>`;
    out.push(`<g class="s p" data-i="${order}" style="${motion()}">${path}</g>`);
  });
  const name = creation.name || 'My design';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 380" role="img" aria-label="Your design, ${String(name).replace(/[<>&"]/g, '')}">
${out.join('\n')}
</svg>`;
  return { svg, name, parts: out.length, category: 'mine', creation: creation.id };
}

/** Draws a saved design item: a studio creation, or a generated form from its seed. */
function renderDesign(kind, item, creations = []) {
  if (item.creation) {
    const found = creations.find((c) => c.id === item.creation);
    if (found) return composeCreation(kind, found);
  }
  return compose(kind, item.seed || 1, item.category === 'mine' ? 'all' : item.category, item.form);
}

module.exports = { animateStatic, canonicalCategory, compose, composeCreation, renderDesign, formIds, reformed, CATEGORIES, CATEGORY_LABELS, ALL, ANIMATION_CSS };
