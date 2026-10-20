# Plan: anime and cartoon characters, faces and scenes

A strategy for adding a large set of anime and cartoon forms to Artify: characters, faces and expressions, scenes, and geometric "manga" compositions. This is a plan only, and no code has been changed yet.

## Where things stand (after 0.10.0)

- Forms are plain `form(ctx)` functions in `src/shapes/*.js`. They are registered append-only in `CATEGORIES` (`src/forms.js`) and identified by function name. `scripts/shipped-forms.json` freezes every shipped name.
- The engine already has `slice`, `blob`, `arcBand`, `dotField`, `stripes` and `radial`. `dotField` doubles as manga screentone.
- `check-art.js` checks every form directly: valid SVG, determinism, 3–150 parts, frame bounds, and puzzle fit. The strict rules apply to modules listed in `NEW_FORMS`.
- `scripts/contact-sheet.js` renders any set of forms × seeds × both themes for review by eye.
- The deck merges new forms into rounds in progress, so a release is visible right away.
- Rule from earlier work: **never show how many forms exist** in the UI or README.

## 1. The big decision: original characters, not franchise characters

Artify ships publicly on the Marketplace. Named characters such as Pikachu, Goku, Naruto, Totoro, Sailor Moon, Mickey, SpongeBob and Bugs Bunny are copyrighted and trademarked, and a recognisable re-drawing of them is still a copy, even in geometric shards.

An art **style** can't be owned, and neither can genre tropes. So the strategy is:

- **Original archetypes that evoke the genre.** Examples: a spiky-haired shonen hero, a magical girl with twin tails, a mecha pilot, a fox-mask spirit, a rubber-hose cartoon character. Each is recognisable as "anime" or "cartoon" without being anyone's property.
- **Generic names only**, in function names and in the display name that ends up in the SVG `aria-label`: `spikyHero`, not `goku`.
- **No signature combinations.** Avoid the exact combination of features that identifies a character, such as round black ears with red shorts and white gloves, a straw hat with a scar under the eye, a yellow electric mouse with red cheeks, a big grey forest spirit with a leaf umbrella at a bus stop, or orange ninja clothes with whisker marks. Each piece is fine on its own; the combination is what's protected.
- **No logos, emblems, catchphrases or Japanese text** lifted from a show. Use invented emblems such as stars, bolts and circles.
- A test enforces part of this (see Tests).

If you would rather include real characters for a private build, that is a separate, non-published branch. This plan doesn't cover it.

## 2. Categories

Add two categories, so the Play pills stay readable:

| Category | Label | Contents |
|---|---|---|
| `anime` | Anime | Anime and manga characters, faces and expressions, scenes, and manga geometry |
| `cartoons` | Cartoons | Western cartoon characters, cartoon faces, cartoon scenes and cartoon effects |

Both go into `CATEGORY_LABELS`, the `artify.explorerShapes` enum and its `enumDescriptions`, and the README category lists, without counts.

Faces stay in their own categories, but nothing stops a form appearing in two places. The registry already de-duplicates. For example, a few anime faces can also be added to `faces`.

## 3. The look: what anime and cartoons need that the engine lacks

Today's forms are flat shards with no outlines. Anime and cartoons read through a few strong conventions:

- **Big layered eyes:** a white, an iris in 2–3 bands, a pupil, two highlights and a thick upper lash line.
- **Hair as spiky or swooping masses** with bangs that overlap the face.
- **Ink outlines.** Cartoons especially depend on them.
- **Manga marks:** speed lines, focus lines, sparkles, sweat drops, anger veins, blush hatching, and screentone.
- **Expressions** made from swappable brows, eyes and mouths.

### New helper module: `src/shapes/toon.js`

Keep these out of `engine.js` so the core stays small. Each helper emits **one part per feature** (grouped SVG), which keeps detailed faces within the piece budget.

| Helper | What it draws |
|---|---|
| `animeEye(ctx, cx, cy, w, h, { iris, look, lid, lash, mirror })` | Layered anime eye as one part, with the gaze direction and lid shape chosen by the caller |
| `cartoonEye(ctx, cx, cy, r, { pie, look })` | Round eye with a pie-cut or dot pupil |
| `brows(ctx, kind, …)` | Brow shapes: calm, angry, worried, raised |
| `mouth(ctx, kind, …)` | Mouth shapes: smile, grin with fang, open shout, "w" cat mouth, wavy, small o |
| `hairMass(ctx, cx, cy, r, { style, spikes, bangs, color })` | Spiky, bob, twin tails, long, ponytail or messy hair, cut into shards with `slice` so it keeps the shard look |
| `faceBase(ctx, cx, cy, w, h, shape)` | Rounded, pointed-chin anime, chibi or bean-shaped cartoon head |
| `outlined(ctx, d, fill, ink, width)` | A filled path with an ink stroke, for cartoons and selected anime parts |
| `speedLines(ctx, cx, cy, r0, r1, n)` / `focusLines(...)` | Radial or parallel line bursts, grouped into a few parts |
| `sparkles(ctx, n, area)`, `sweatDrop`, `angerVein`, `blush`, `tears`, `zzz` | Manga marks |
| `emotion(ctx, face, kind)` | Sets eyes, brows, mouth and marks together for an expression: happy, angry, shocked, sad, smug, sleepy or excited |
| `figure(ctx, pose, style)` | A simple jointed body (torso, limbs and hands) from a small pose table, with chibi or tall proportions |

### Palette additions

Skin and hair should follow the theme like everything else. Add theme-aware sets next to `GREENS` in `engine.js`:

- `SKINS[kind]`: 3–4 stylised tones per theme.
- `HAIR[kind]`: 6 hair colours per theme, including the anime pinks, blues and silvers.

Add them to `scripts/check-contrast.js` so that hair, skin and ink stay legible on both theme backgrounds. Forms still use no hard-coded hex values.

### The character kit

Building everything from scratch is slow and repetitive. Instead, each character form is an **archetype that fixes a few signature traits and lets the seed choose the rest**:

```
archetype = { head, hair style, outfit, accessory, palette rules, allowed expressions, pose set }
seed picks: hair colour, expression, gaze, pose, background, accessory variant, mirror
```

This gives the required seeded variety for free: expression, pose, colours and background change on every deal, while the archetype stays recognisable.

## 4. The forms

These are working lists. Names are generic and were checked against `shipped-forms.json`.

### Anime: faces and expressions

| Function | Idea |
|---|---|
| `animeEyes` | Extreme close-up of a pair of eyes with reflections and lashes, plus a hair strand |
| `expressionSheet` | A 2×2 chibi expression grid, with a different emotion per panel |
| `shoujoPortrait` | Soft portrait with sparkle and flower background bubbles |
| `shonenGrin` | Determined grin, bandage on the cheek, with speed lines behind |
| `coolRival` | Long bangs covering one eye, side glance, cold palette |
| `tearfulFace` | Big watery eyes and streaming tears |
| `angryChibi` | Anger vein, flame background, shouting mouth |
| `sleepyChibi` | Nodding off, with a snot bubble and zzz |

### Anime: characters

| Function | Idea |
|---|---|
| `spikyHero` | Shonen hero with spiky hair, headband and fist forward, with an aura |
| `magicalGirl` | Twin tails, a wand with an invented star emblem, ribbons and sparkles |
| `schoolUniform` | Student with sailor collar or blazer, a school bag and a petal breeze |
| `ninjaRunner` | Masked runner in the classic arms-back run, with speed lines |
| `wanderingRonin` | Topknot, straw-coloured kasa hat, sheathed katana, wind |
| `mechaPilot` | Pilot suit and helmet tucked under one arm, with a cockpit glow |
| `giantRobot` | Bust or full-body original mecha with chest light, V-fin and shard armour |
| `catEarGirl` | Cat ears, "w" mouth and paw pose |
| `foxSpirit` | Kitsune mask, many tails and spirit flames |
| `oniWarrior` | Horns, club and an oni mask on the side of the head |
| `idolSinger` | Microphone, stage lights and hearts |
| `oldMaster` | Long beard, staff and calm closed eyes |
| `darkLord` | High collar, horns, cape and glowing eyes |
| `chibiCritter` | Original round mascot creature with stubby limbs, given a different invented species per seed |
| `kaijuAttack` | Original monster over a tiny city, with a beam |

### Anime: scenes

| Function | Idea |
|---|---|
| `sakuraSchool` | School gate, blossom trees and falling petals |
| `ramenStall` | Counter, noren curtain, steaming bowl and lanterns |
| `rooftopSunset` | School rooftop fence, water tower and a long sunset |
| `trainCrossing` | Level crossing, power lines and summer clouds |
| `shrineGate` | Torii, stone lanterns, steps and fireflies |
| `neonAlley` | Rainy night alley with neon signs (shapes, no text) and puddle reflections |
| `summerFestival` | Fireworks, yukata silhouettes and paper lanterns |
| `floatingIslands` | Sky islands with waterfalls, an airship and clouds |
| `onsenNight` | Hot spring steam, rocks, moon and a snow monkey |
| `kotatsuRoom` | Low table, mikan oranges, a sleeping cat and snow outside the window |
| `transformation` | Ribbon spiral, light rays and a silhouette mid-transformation |
| `mechaHangar` | Giant robot silhouette in a hangar, with catwalks |

### Anime: manga geometry

| Function | Idea |
|---|---|
| `speedBurst` | Radial focus lines around an impact star |
| `mangaPanels` | Irregular panel grid with screentone, focus lines and an action silhouette |
| `screentoneGradient` | Halftone dot fields in overlapping manga tones |
| `impactFrame` | Inverted, high-contrast lightning-crack composition |

### Cartoons: characters and faces

| Function | Idea |
|---|---|
| `rubberHose` | 1930s-style character with pie-cut eyes, gloved hands and hose limbs, posed mid-bounce. It must not use round black ears together with shorts. |
| `cartoonCat` | Lanky cat with a grin and a squash-and-stretch pose |
| `cartoonMouse` | Small mouse with a big nose, shown sneaking |
| `superheroKid` | Cape, mask and an invented emblem, flying |
| `friendlyGhost` | Wobbly sheet ghost |
| `littleAlien` | Antenna, three eyes and a flying saucer |
| `cartoonDino` | Round dinosaur with tiny arms, roaring |
| `witchOnBroom` | Pointy hat, cat on the broom and a moon |
| `pirateCaptain` | Tricorn hat, eye patch and a parrot |
| `monsterUnderBed` | Eyes and teeth peeking out from under a bed |
| `grumpyCloud` | Cartoon cloud with a face, raining |
| `happySun` | Sun with a face and sunglasses |
| `bigNoseFace` | Classic cartoon face with a big nose and expressions |
| `dizzyFace` | Spiral eyes and orbiting stars |

### Cartoons: scenes and effects

| Function | Idea |
|---|---|
| `chaseScene` | Cat chasing mouse past a repeating background, with dust clouds |
| `anvilDrop` | Shadow, falling anvil and a character looking up |
| `desertCliff` | Mesa cliff edge, a character hanging in mid-air and a tiny puff below |
| `hillsWithFaces` | Saturday-morning hills, trees and a sun, all with faces |
| `wobblyHouse` | Crooked cartoon house with a smiling door |
| `popBurst` | Comic "POW" burst made of jagged stars and dots. Generic sound-effect text is fine. |
| `squashBall` | Bouncing ball sequence showing squash and stretch |
| `tvTestCard` | Retro cartoon TV with a character on screen |

Each list is a working target. The quality bar matters more than hitting a number, so weak forms are cut rather than shipped.

## 5. File layout

| File | Contents |
|---|---|
| `src/shapes/toon.js` | Helpers, kit and expressions (no forms) |
| `src/shapes/anime-faces.js` | Anime faces and expressions |
| `src/shapes/anime-characters.js` | Anime characters |
| `src/shapes/anime-scenes.js` | Anime scenes and manga geometry |
| `src/shapes/cartoons.js` | Cartoon characters and faces |
| `src/shapes/cartoon-scenes.js` | Cartoon scenes and effects |

Add each new form module to `NEW_FORMS` in `check-art.js` so the strict rules apply.

## 6. Tests

1. **Existing per-form checks apply unchanged:** valid SVG, determinism, 3–150 parts, frame bounds and puzzle fit (or listed in `NOT_PUZZLES`).
2. **Franchise-name guard.** Add a blocklist of franchise and character names (pikachu, pokemon, goku, naruto, sasuke, luffy, totoro, ghibli, sailormoon, gundam, evangelion, mickey, minnie, spongebob, bugs, looney, scooby, simpsons, and others). It fails if any function name, display name or `aria-label` contains one. This is a cheap backstop, not a substitute for review.
3. **Helper checks.** Each `toon.js` helper produces valid SVG within its stated bounds. `emotion()` must cover every expression on both an anime face and a cartoon face.
4. **Variety check.** For each character form, 6 seeds must produce at least 4 distinct SVGs after removing the composer's debris. This catches archetypes where the seed changes nothing.
5. **Contrast.** `SKINS` and `HAIR` must be legible against both theme backgrounds and against `ctx.ink`.
6. **Frozen ids.** Append each wave's names to `shipped-forms.json` when it ships.

## 7. Review: the contact sheet and an IP check

For each wave, render `node scripts/contact-sheet.js <ids> --seeds 6` and check:

- [ ] It reads as its archetype at Explorer size, about 120 px wide.
- [ ] Faces read as faces: eyes have highlights, and expressions are distinguishable.
- [ ] It works in both themes: skin and hair don't vanish, and outlines show on the dark background.
- [ ] Six seeds look clearly different: expression, pose, colours and background.
- [ ] The fly-in looks good. Grouped eye and hair parts move as units and don't scatter into confetti.
- [ ] **IP check:** describe the form in one sentence without naming a show. If the sentence brings one specific character to mind, change a signature trait.

## 8. Rollout in waves

Each wave is one minor version and shippable on its own.

| Wave | Contents | Why this order |
|---|---|---|
| 1 | `toon.js` helpers, `SKINS`/`HAIR` palettes, name guard, variety test, the `anime` category, anime faces | Faces exercise eyes, hair and expressions hardest, and everything later reuses them |
| 2 | Anime characters, plus `figure()` and pose tables | Builds on the face kit and adds bodies |
| 3 | Anime scenes and manga geometry | Background-heavy work, mostly existing engine helpers plus speed lines and screentone |
| 4 | `cartoons` category, outlines, cartoon characters and faces | Adds the outline style and cartoon eyes and mouths |
| 5 | Cartoon scenes and effects, plus cross-listing a few faces into `faces` | Polish, done once both kits are mature |

## 9. Risks

- **Piece budget.** Detailed characters can easily exceed 45 parts. Group each eye, the mouth, brows and hair highlights into single parts, and accept that some full-body scenes go into `NOT_PUZZLES`.
- **Shard look against anime clarity.** Too much `slice` jitter makes faces mushy. Use `still: true` on facial features, and keep the shard break-up for hair, clothes and backgrounds.
- **Outlines in the fly-in.** Stroked parts animate fine, but their stroke width should stay at or above 2.5 so they survive at Explorer size.
- **Sameness.** A kit can make every character look like a recolour. The variety test plus at least one unique silhouette element per archetype (ears, horns, hat, tails, wings, helmet) guard against that.
- **Legal look-alikes.** Covered by section 1, the name guard and the per-form IP check. When in doubt, change the silhouette.

## Open decisions for you

1. **Original archetypes only?** This is recommended for the published extension. The alternative is a separate private build with real characters.
2. **Two categories or one?** The plan uses `anime` and `cartoons`. The alternative is a single `toons` category.
3. **Outlines:** cartoons only (recommended), or anime too?
