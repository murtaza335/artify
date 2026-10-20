# Artify

Color themes for abstract art lovers. Palettes come from geometric tile posters and Bauhaus museum posters: teal, brick, ochre and cream on a maroon-ink ground, and sky blue, red and yellow on warm white.

## Themes

| Theme | Type | Character |
| --- | --- | --- |
| Artify Tile Night | Dark | Maroon-ink editor, deep teal side bar, ochre status bar |
| Artify Bauhaus Day | Light | Warm white editor, sky-blue side bar, navy activity bar, black grid lines |

Pick one with **Preferences: Color Theme** (`Ctrl+K Ctrl+T`).

## Readability

Every text color is checked against the surface it sits on, and each pair must reach WCAG AA (4.5:1). That covers syntax colors, line numbers, side bar and tab text, status bar items, the terminal's ANSI colors and the inactive icons on the activity bar.

```sh
npm run check:contrast
```

Both themes enable semantic highlighting so classes, functions, parameters and constants are colored consistently across languages.

## Artwork inside VS Code

Themes only set colors, so the poster artwork is drawn by the extension itself.

- **Explorer:** a vase breaks into geometric shards at the bottom of the Explorer. It switches between a dark and a light version with your theme.
- **Reform:** press the Reform button at the top of the Artify view (also in its title bar, or run **Artify: Reform**) and the shards fly apart and reform into something new. Every press is a fresh random seed, so the results never run out. Designs you make in Artify Studio can come up too. Set `artify.explorerShapes` to limit it to your own designs, or to faces, animals, nature, space, scenery, weather, objects, art, geometry, food, or anime and cartoons.
- **No repeats:** designs are dealt like a shuffled deck. Every shape in the chosen category is shown once before any comes round again, and the first shape of a new round is never the one you just saw. Your own Studio designs have a deck of their own, so none of them comes up twice until all of them have. Random seeds are never reused, so even the same kind of shape looks different. The Explorer view and the Play page share one deck, progress is saved between sessions, and **Artify: Start New Round** (or the button in Play) starts over.
- **Replay:** the Replay button beside it (also in the title bar, or **Artify: Replay Animation**) plays the fly-in animation again for the design that is showing, without changing it. The original vase animates too.
- **Palette panel:** a Palette tab next to Terminal shows poured paint and the active swatches.
- **Gallery:** run **Artify: Open Gallery** to browse five movements, shuffle each composition and apply a matching theme. Tile Night and Bauhaus Day can be applied. The others are artwork only for now.
- **Artify Play:** click **Artify Play** in the status bar (or run **Artify: Play**) for something to do while an agent or a long build is working. It never touches your editor, so the work carries on.
  - **Reform:** endless shard art. Choose Faces, Animals, Nature, Space, Scenery, Weather, Objects, Art, Geometry, Food, Anime & Cartoons or My designs, press Space, or let it auto-reform. Save any design, or export it as SVG.
  - **Puzzle:** the shards scatter and you drag them back into place. A faint guide is optional, Show answer is there for keyboard users, and you can save the design.
  - **Splash:** throw paint on a canvas. Drag to splash, hold still to pour a puddle, and watch the drips run. Number keys pick a color. Save the painting to your collection, reopen it later, or export it as PNG.
  - **Studio:** build your own design from a picker of shapes (circles, triangles, stars, arches, leaves, clouds, a house, a pine tree and more). Drag to move, use the round handles to resize and rotate, recolor from the theme palette, reorder, flip, duplicate, undo, and pick a background. Save it and it appears in your list of designs, can be exported as SVG, and **comes up when you reform**, both in Play and in the Explorer view. Because colors are saved as palette positions, your designs follow the light or dark theme.

Everything you save is kept in VS Code's global state, so it follows you between workspaces.

### What can appear

- **Animals:** cats, dogs, foxes, rabbits, penguins, whales, turtles, butterflies, songbirds, owls, gulls and fish, plus elephants, giraffes, octopuses, jellyfish, hummingbirds, flamingos, snails, bees, deer, peacocks, frogs and an origami crane.
- **Nature:** flowers, sunflowers, tulips, bouquets, meadows, mushrooms, a fractal tree grown from a branching rule, a palm island, a lily pond, a leaf wreath, a seedling, pines and round trees, plus cacti, bonsai, cherry blossom, lotus, ferns, succulents, pinecones, lavender fields, bamboo and a weeping willow.
- **Space:** spiral galaxies, ringed planets, night skies, constellations, an eclipse, a solar system, an astronaut, a UFO, a satellite, rockets, a black hole, a comet, a nebula, moon phases, a space station, a meteor shower and a lunar lander.
- **Weather:** sunny days, rainstorms, thunderstorms, snowfall, rainbows, windy days, foggy forests, tornadoes, sunset clouds, auroras, hurricanes, hailstorms, rainy windows, heat waves, moonlit clouds, frosted windows, dust storms, sunshowers and monsoons.
- **Objects:** chairs of four kinds, tables set with teapots and flowers, a cozy room, a reading corner, a sofa, a bed, a desk with a laptop showing colored code, a light bulb, a guitar, a hot air balloon, a camera, a front door, clocks, a teapot, a bookshelf, plants, an umbrella, a house, a lighthouse, a bicycle, a sailboat, a piano, a typewriter, a record player, a kite, a stack of books, a coffee cup, a vintage car, a train, headphones and a watering can.
- **Scenery:** landscapes at day, dusk and night, deserts, beaches, autumn forests, coral reefs, canyons, waterfalls, mountains, waves and cities, plus rice terraces, icebergs, savannas, fjords, volcanoes, a cabin by a lake, windmills and a night city.
- **Faces:** abstract portraits in many styles: a cubist poster face rebuilt from the reference in four palettes (mirrored at random), a Picasso-style double view, split faces over color planes, a Bauhaus stage figure, a Klee-style grid portrait, a minimal vector face, a symmetrical mask, a shard profile, four-panel pop art, a faceted collage, a one-line portrait, a Rubin vase of two profiles, a sun and moon with faces, a robot, a mosaic face, twin profiles, a totem, a sleepy face and a paper cut-out face.
- **Art:** an easel painting, a cubist face, a Mondrian-style grid built by recursive subdivision, nested squares, a Suprematist composition, a Kandinsky-style composition, a still life, vases and tile mosaics, plus pointillism, pop art, art deco, constructivism, Bauhaus posters, Matisse cut-outs, a great wave, Memphis patterns, op art, Kusama dots, Haring dancers, Klimt spirals, Delaunay discs, Arp blobs, a Calder mobile, Rothko fields, a Swiss grid, hard edge, a Roman mosaic and Riley stripes.
- **Geometry:** Truchet tiles, Voronoi stained glass, spirographs, Lissajous curves, moire circles, a Sierpinski triangle, mandalas, boho arches, rings, stars, isometric cubes, triangle grids and gems, plus Penrose tilings, honeycombs, a golden spiral, tangrams, Islamic star tilings, guilloche rosettes, phyllotaxis, patchwork quilts, kaleidoscopes, chevrons, halftone dots and an impossible triangle.
- **Anime & Cartoons:** original anime-style characters and scenes: spiky-haired heroes, magical girls, students, ninjas, swordsmen, mecha pilots and giant robots, fox spirits, oni, idols and monsters, plus big-eyed faces and expressions, school gates under blossoms, ramen stalls, rooftops at sunset, shrine gates, neon alleys, festivals and floating islands, and manga pages with speed lines and screentone. Every character is an original design, and the hair, expression, pose and colors change with each seed. Alongside them are original cartoon characters with ink outlines and scenes: rubber-hose characters, lanky cats, ghosts, aliens, dinosaurs, witches, pirates and grumpy clouds, plus chase scenes, falling anvils, cliff edges, crooked houses, comic bursts and bouncing balls.
- **Food:** fruit bowls, watermelon, sushi, pizza, ice cream, cupcakes, citrus slices, pineapples, layered cakes and breakfast plates.

Several of the geometric forms come from classic generative-art techniques: Truchet tiling (random rotation of simple tiles), Voronoi partitions, hypotrochoid spirographs, Lissajous figures, recursive subdivision and branching rules.

The art is drawn in webviews with a strict content security policy. The Explorer and Palette views run no scripts, and the Gallery and Play pages run only their own bundled script. Nothing touches the workbench files, so VS Code will not show a corrupt-installation warning.

Artify cannot tell when an agent is busy, so Play is a button you press, not something that opens on its own.

## Icons

Artify does not ship an icon theme or product icon theme. File icons, sidebar icons and all other icons use the VS Code defaults.

## Develop

The theme JSON in `themes/` is generated from one palette file, so both themes stay in step.

```sh
npm test                 # rebuild themes, check contrast, check the artwork markup
```

Edit `scripts/palettes.js`, run `npm test`, then press `F5` to open an Extension Development Host with the themes loaded.

To package: `npx @vscode/vsce package`. Before publishing, set `publisher` in `package.json` to your Marketplace publisher ID and add a 128x128 PNG `icon`.
