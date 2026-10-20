# Plan: 100 more shapes and art styles

A strategy for adding about 100 new Reform forms to Artify, including a set of new art styles. This is a plan only, and no code has been changed yet.

## Where things stand

- Reform forms live in `src/shapes/*.js`. Each one is a plain function `form(ctx)` that adds shards to `ctx` and returns a display name.
- They are registered in `CATEGORIES` in `src/forms.js`. The deck identifies a form by its **function name** (`FORMS_BY_ID`), and the registry throws if two forms share a name.
- There are 115 forms today, across animals, nature, space, scenery, art, weather, objects, faces and geometric.
- Every form draws into a 240 x 380 viewBox using the theme palette (`ctx.col`, `ctx.colors`, `ctx.ink`, `ctx.greens`), so it works in both light and dark.
- The Deck deals forms per category without repeats. Saved designs store `{ seed, category, form }`.
- Studio picker shapes are a separate list in `src/shapes/library.js`, and they are not part of this plan's 100.

## Ground rules for every new form

1. **Unique, stable function name.** Saved designs and deck bags reference it, so it must never be renamed later. Check it against the existing names: `star`, `house`, `plant`, `fish`, `tree`, `flower`, `waves` and others are already taken.
2. **Deterministic.** Use only `ctx.rand`, `ctx.between`, `ctx.int` and `ctx.pick`, never `Math.random`, so a seed always rebuilds the same picture.
3. **Seeded variety.** At least three things should vary per seed, such as pose, count, proportions, colour rotation or background, so a form doesn't look identical every time it comes round.
4. **Palette only.** Use no hard-coded hex colours, so the form follows both themes. Check that it reads on dark and light.
5. **Shard style.** Build forms from flat polygons, circles and paths, and use `slice()` for big silhouettes so they keep the "broken into shards" look that the fly-in animation relies on.
6. **Piece budget.** Aim for 12–90 parts. Keep the minimum at 3 or more, since the test enforces it. At least half of the seeds should come in at 45 parts or fewer (`PUZZLE_MAX_PIECES`) so the form can also appear as a puzzle.
7. **Stay in the frame.** All parts should sit inside 240 x 380, with a little room around the edge for the debris the composer scatters.
8. **No counts in the UI or README.** Don't mention how many forms or shapes exist anywhere users can see. The changelog may describe additions, but without totals.

## The 100 new forms

### Art styles: 20 forms (category `art`)

Each one is a recognisable movement or artist's style, re-imagined in Artify's palette.

| Function | Idea |
|---|---|
| `pointillism` | Hundreds of small dots that form a landscape. Group the dots into clusters so the parts stay within budget. |
| `popArtDots` | Lichtenstein-style halftone panel with a bold outline shape. |
| `artDeco` | Fan arcs, stepped sunbursts and gold-line symmetry. |
| `constructivism` | Diagonal red wedge, circles and bars, like a Lissitzky poster. |
| `bauhausPoster` | Circle, square and triangle on a grid with bold bars. |
| `matisseCutouts` | Organic paper-cut leaves and seaweed shapes. |
| `greatWave` | Hokusai-style curling wave with claw foam. Named so it doesn't clash with `waves`. |
| `memphis` | Squiggles, confetti, zigzags and pastel blocks. |
| `opArt` | Vasarely-style bulging grid of squares and circles. |
| `kusamaDots` | Polka-dot pumpkin or dotted infinity field. |
| `haringDancers` | Bold blocky figures with motion lines. |
| `klimtSpiral` | Gold mosaic spirals with rectangles and eyes. |
| `delaunayDiscs` | Orphic concentric colour discs split into quarters. |
| `arpBlobs` | Stacked soft biomorphic shapes. |
| `calderMobile` | Balanced wire arms holding paddles. |
| `rothkoFields` | Two or three soft, stacked colour fields. Today these exist only as a theme "movement", not as a form. |
| `swissGrid` | Swiss typographic poster with off-axis rules and circles. |
| `hardEdge` | Ellsworth Kelly-style single bold curve against a field. |
| `romanMosaic` | Tesserae grid forming a simple bird or vessel. |
| `rileyStripes` | Bridget Riley-style undulating stripes. |

### Geometric: 12 forms (category `geometric`)

`penrose`, `honeycomb`, `goldenSpiral`, `tangram` (a random tangram figure per seed), `islamicStar` (girih star tiling), `guilloche`, `phyllotaxis` (a sunflower-seed spiral), `quilt` (patchwork blocks), `kaleidoscope`, `chevrons`, `halftone` (a dot gradient), `impossibleTriangle`.

### Animals: 12 forms (category `animals`)

`elephant`, `giraffe`, `octopus`, `jellyfish`, `hummingbird`, `flamingo`, `snail`, `bee`, `deer`, `peacock`, `frog`, `origamiCrane`.

### Nature: 10 forms (category `nature`)

`cactus`, `bonsai`, `cherryBlossom`, `lotus`, `fern`, `succulents`, `pinecone`, `lavenderField`, `bamboo`, `willow`.

### Space: 8 forms (category `space`)

`blackHole`, `comet`, `nebula`, `ringedPlanet`, `moonPhases`, `spaceStation`, `meteorShower`, `lunarLander`.

### Scenery: 8 forms (category `scenery`)

`riceTerraces`, `iceberg`, `savanna`, `fjord`, `volcano`, `cabinLake`, `windmills`, `nightCity`.

### Weather: 4 forms (category `weather`)

`frostWindow`, `dustStorm`, `sunshower`, `monsoon`. Weather already has a lot of forms, so it gets only a few here.

### Objects: 10 forms (category `objects`)

`piano`, `typewriter`, `recordPlayer`, `kite`, `bookStack`, `coffeeCup`, `vintageCar`, `train`, `headphones`, `wateringCan`.

### Faces: 6 forms (category `faces`)

`robotFace`, `mosaicFace`, `twinProfiles`, `totem` (stacked faces), `sleepyFace`, `cutoutFace` (Matisse-style paper face).

### New category, Food: 10 forms (category `food`)

`fruitBowl`, `watermelon`, `sushi`, `pizza`, `iceCream`, `cupcake`, `citrusSlices`, `pineapple`, `layeredCake`, `breakfast`.

Altogether that is 20 + 12 + 12 + 10 + 8 + 8 + 4 + 10 + 6 + 10 = **100**.

## Engine helpers to add first

Many of the new forms share the same building blocks. Adding these to `src/shapes/engine.js` first keeps each form short:

- `radial(ctx, cx, cy, n, fn)`: repeat a part around a centre. Used by mandala-like forms such as `kaleidoscope`, `lotus`, `delaunayDiscs` and `klimtSpiral`.
- `dotField(ctx, area, spacing, sizeFn, colorFn)`: grouped dot grids that emit one part per cluster, not per dot, which keeps piece counts down. Used by `pointillism`, `popArtDots`, `halftone` and `kusamaDots`.
- `blob(ctx, cx, cy, r, wobble, fill)`: a smooth organic closed path. Used by `arpBlobs`, `matisseCutouts`, `octopus` and `cutoutFace`.
- `arcBand(cx, cy, r0, r1, a0, a1)`: an annular sector polygon. Used by `artDeco`, `delaunayDiscs`, `ringedPlanet` and `rainbow`-like shapes.
- `stripes(ctx, area, count, waveFn)`: wavy bands. Used by `rileyStripes`, `riceTerraces` and `opArt`.

Each helper also gets a unit check in `scripts/check-art.js`: it produces valid SVG, and its parts stay within its bounds.

## File layout

New files follow the existing `src/shapes/` convention, each holding 10–20 forms:

| File | Forms |
|---|---|
| `styles.js` | The 20 art styles |
| `patterns.js` | The geometric forms |
| `wildlife.js` | The animals |
| `garden.js` | The nature forms |
| `cosmos.js` | The space forms |
| `landscapes.js` | Scenery and weather |
| `things.js` | The objects |
| `portraits.js` | The faces |
| `food.js` | The new food category |

## Registry and settings changes

For each new form or category:

1. Require the new file in `src/forms.js` and append the form functions to the right `CATEGORIES` array. **Append only:** never reorder or rename, because saved designs and seeds depend on it.
2. For the new `food` category:
   - Add it to `CATEGORY_LABELS`, which drives the Play page pills.
   - Add it to the `artify.explorerShapes` enum and its `enumDescriptions` in `package.json`.
   - Update the README category lists, without counts.

## Deck behaviour to know about

`Deck.dealForm` filters a saved bag down to the forms that still exist, but it **doesn't add new ones** to a bag already in progress. Users mid-round won't see new forms until their current round ends, or until they run **Artify: Start New Round**.

The options are:

- **Accept it.** This is the simplest, and the new forms show up naturally in the next round.
- **Merge new forms into in-progress bags.** On load, compare the bag with the valid ids and the forms already dealt, then shuffle the unseen new ids into the bag. This needs a small "dealt this round" list in deck state.

**Recommendation:** merge them, so a release that adds 100 forms is visible right away. Add a check in `scripts/check-deck.js` that a form added mid-round is dealt before the round ends.

## Tests

1. **Coverage.** `check-art.js` checks that every form appears within 1500 random seeds. With about 215 forms that becomes flaky, so replace it with a direct loop over every form id: `compose(kind, seed, 'all', id)` for seeds 1–40, in both kinds.
2. **Per-form checks.** For each form:
   - The SVG is valid, with no `undefined` or `NaN`.
   - Every seed has 3 or more parts.
   - The maximum part count stays under a hard ceiling of about 150.
   - All part bounds lie within -10..250 x -10..390.
   - At least one seed fits the puzzle limit, unless the form is listed in an explicit `NOT_PUZZLES` set.
3. **Determinism.** The same seed and form gives the same SVG on two calls.
4. **Name safety.** `FORMS_BY_ID` already throws on duplicates. Also add a test that fails if an existing form id disappears, using a frozen list of all ids shipped so far, so a rename can never silently break saved designs.
5. **Contact sheet** (manual review). Add `scripts/contact-sheet.js` to write an HTML grid of every form × 6 seeds × both themes to a temp folder, so each wave can be eyeballed for quality, contrast and variety before release.

## Rollout in waves

Each wave is one minor version and is shippable on its own. Run `npm test` and review the contact sheet before each release.

| Wave | Contents | Why this order |
|---|---|---|
| 1 | Engine helpers, test upgrades, contact sheet, deck merge, Food (10), Geometric (12) | Lays the foundations. Geometric forms exercise the new helpers hardest, and Food proves the new-category path end to end. |
| 2 | Art styles (20) | This is the headline feature, and it reuses `dotField`, `blob`, `arcBand` and `stripes`. |
| 3 | Animals (12), Nature (10) | Mostly built from silhouettes with `slice()`, which is the established pattern. |
| 4 | Space (8), Scenery (8), Weather (4) | Background-heavy compositions. Watch the piece budget. |
| 5 | Objects (10), Faces (6) | Detailed forms, done last when the helpers are mature. |

## Quality checklist per form

- [ ] It reads as its subject at Explorer size, which is about 120 px wide.
- [ ] It looks right in both themes, with no shard lost against the background.
- [ ] Six random seeds look clearly different from each other.
- [ ] The fly-in animation looks good, meaning the parts are big enough to see moving.
- [ ] It works as a puzzle if its piece count allows.
- [ ] Its name is unique and was checked against the frozen id list.

## Optional extension: style treatments

Separate from the 100 forms, a later phase could add **render treatments** that re-skin *any* form: outlined stained glass, risograph offset, paper cut-out with drop shadow, or monochrome ink. They would be applied in `compose()` as a post-pass over `ctx.parts` and chosen per seed or by a setting. That multiplies the look of every form without new drawing code, but it changes how existing designs render, so treat it as a separate decision.
