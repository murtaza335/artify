# Change Log

## Unreleased

- Bauhaus Day is easier to read and calmer to look at. The highlighted row in the Command Palette, suggestions and menus is visible again (it was white on white). Buttons, badges and focus rings are Bauhaus blue instead of red, so they no longer look like errors. Red stays on the cursor and the active tab. The near-black outlines between every part of the window are now soft warm rules. The sidebar is a lighter sky blue with clearer selected and hover rows, the secondary buttons are light, and diffs, hovers, peek and keybinding labels have been restyled to match.
- Tile Night polish. Selected rows in the sidebar stand out from hovered ones. Find matches have an ochre outline, so the code underneath stays readable. Added lines in diffs are a clear mint instead of olive. The current line is a little easier to spot. ANSI black in the terminal is no longer invisible against the panel. Keybinding labels, inline code and quote blocks are restyled to match the theme.

## 0.11.4

- README images now load in the editor's extension page: they link straight to raw.githubusercontent.com instead of a GitHub redirect.

## 0.11.3

- New logo: a shard-cut A with a paint splash and loose geometric shapes, in the Tile Night palette. It is the extension icon and appears at the top of the README.

## 0.11.2

- Rewrote the README for the current features, with screenshots of the Explorer view and every Artify Play mode, a commands and settings table, and a link to the GitHub repository.

## 0.11.1

- Anime and Cartoons are now one category, Anime & Cartoons. A `cartoons` value left in `artify.explorerShapes`, a saved design or a round in progress carries on in the merged category.
- Characters are better put together: long hair and tails hang behind the body, hands match the face, the idol holds her microphone at her mouth, the robot's raised arm comes out of its shoulder, gloves sit on the ends of the rubber-hose arms, and the witch's cat is in one piece.
- Faces, props and scenery sit where they belong: the bandage is on the cheek instead of the eye, the sleepy bubble hangs below the eyes, the cartoon sun wears its own face, hair grows from the top of the big-nosed head, the school and its blossom tree no longer overlap, and the waterfall pours off its island.
- Bodies, hair and props no longer vanish into a panel of the same colour, and beams, barriers, spirals, bursts and dust clouds stay inside the frame.

## 0.11.0

- New Anime and Cartoons categories, both available in `artify.explorerShapes`. They hold original characters, faces, expressions and scenes, never copies of existing characters.
- Anime: big-eyed faces and expression sheets, heroes, magical girls, students, ninjas, mecha, spirits and monsters, scenes such as school gates, ramen stalls and neon alleys, and manga pages with speed lines and screentone.
- Cartoons: ink-outlined characters and scenes, from rubber-hose characters to chase scenes and comic bursts.
- A few of the new faces are also dealt in Faces.
- Hair, expression, pose and colors change with every seed. Skin and hair colors follow the light and dark themes.
- Tests check that no franchise or character name appears in a form, that characters really change with the seed, and that skin and hair colors stay visible in both themes.

## 0.10.0

- Many new shapes across every category: animals, nature, space, scenery, weather, objects, faces, geometry and art.
- New art styles, including pointillism, pop art, art deco, constructivism, Matisse cut-outs, op art, Kusama dots, a Calder mobile and Rothko fields.
- New Food category, also available in `artify.explorerShapes`.
- Shapes added after a round has started are shuffled into that round, so an update shows up right away.
- Tests now check every shape on its own: frame bounds, repeatable output and a frozen list of shipped shape names. `scripts/contact-sheet.js` writes an HTML grid for reviewing shapes by eye.

## 0.9.0

- Removed the editor art feature: nothing is drawn in text editors any more.

## 0.8.0

- Faces category: 14 abstract portraits, including the poster-style cubist face from the reference in four palettes, a Picasso double view, split faces, a Bauhaus stage figure, a Klee grid portrait, masks, a one-line portrait and a Rubin vase.
- The Artify view now has Reform, Replay and Play buttons at the top of the panel itself, not only in its title bar.

## 0.7.0

- Reform no longer repeats itself. Shapes and your own Studio designs are dealt from shuffled decks that are remembered between sessions and shared by the Explorer view and Play.
- Play shows round progress, and **Artify: Start New Round** resets it.
- A test (`npm run check:deck`) proves nothing repeats inside a round, nothing repeats back to back, and seeds are not reused.

## 0.6.1

- Replay button in the Artify view's title bar plays the shard animation again for the current design. The original vase now animates as well.

## 0.6.0

- Artify Studio: build designs from a picker of about 30 shapes, save them, edit them later and export them as SVG.
- Saved Studio designs now come up when you press Reform, in Artify Play and in the Explorer view. `artify.explorerShapes` accepts `mine` for only your own designs.
- Save buttons everywhere: designs from Reform and Puzzle, and paintings from Splash, each with its own saved list, remove buttons and export (SVG or PNG).
- The Explorer button and command are now called Reform instead of Reform Vase.

## 0.5.0

- 52 more forms, about 100 in total: fox, rabbit, penguin, whale, turtle, butterfly, mushrooms, fractal tree, palm island, pond, wreath, seedling, astronaut, UFO, solar system, satellite, constellation, eclipse, desert, beach, autumn forest, coral reef, canyon, waterfall, aurora, hurricane, hail, rainy window, heat wave, moonlit clouds, sofa, bed, desk, light bulb, guitar, hot air balloon, camera, door, cubist face, Mondrian grid, nested squares, Suprematism, Kandinsky composition, still life, Truchet tiles, Voronoi, spirograph, Lissajous, moire, Sierpinski, mandala and arches.

## 0.4.0

- Weather category: clouds, rain, thunderstorms, snow, rainbows, wind, fog, sunshine, tornadoes and sunsets.
- Objects category: chairs, tables, a room, a reading corner, clocks, teapots, bookshelves, plants, umbrellas, houses, lighthouses, bicycles and sailboats.
- Weather and Objects added to the Play page and to the `artify.explorerShapes` setting.

## 0.3.0

- Artify Play: Reform, Puzzle and Splash toys, a status bar button and a saved collection.
- 30 new procedural forms: cats, dogs, songbirds, owls, gulls, sunflowers, tulips, bouquets, meadows, galaxies, planets, night skies, landscapes, an easel painting, rings, stars, cubes and triangle grids.
- `artify.explorerShapes` setting to choose the kind of shapes the Explorer Reform button builds.

## 0.2.0

- Broken-vase artwork under the Explorer, poured-paint Palette panel tab and an Artify Gallery command.
- Reform button: every press builds a new random composition (vases, flowers, cities, fish, birds, trees, rockets, mountains, gems, tile mosaics) from shards, animated, and remembers it.

## 0.1.0

- Initial release with two color themes: Artify Tile Night (dark) and Artify Bauhaus Day (light).
- Palettes drawn from retro geometric tile posters and Bauhaus museum posters.
- Contrast check script covering syntax, UI text, status bar and terminal colors.
