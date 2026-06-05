# Ring Scene — 4-Point Upgrade (Intro grid · Plane+frost · Side fade · Flat-row beat)

Date: 2026-06-04
Scope: `/test` + landing ring scene (`app/components/ring-experience.tsx`,
`app/lib/ring-scene/scene.ts`, `app/lib/ring-stages.ts`). Brings the
from-scratch reconstruction closer to the bundled reference `example-2.js` on
four points the user called out, plus a debug control for the intro phase.

Source-of-truth references in `example-2.js`:
- Intro grid: `gridConfig {x,y:8}`, `gridToPos` (L794), `_n`/`Mt` tables (L703/728),
  Y-collapse `b[1]*(1-part1)` (L3559), row→ring `D()` (L3561).
- Frost slab: `uFrost` from `stackProgress.part2` (L833), shader (L1498-1514).
- Side fade/splay: non-featured `uOpacity = 1-b` on `stackProgress.opacity`
  (L3099), ±π/2 swing of ±6 neighbours (L3595-3606).
- Spread stages: flat deck `E()` (L3120) then diagonal `S()` (L3134).

Design decisions (locked with user):
- **Single card set** kept (no two-set handoff); side fade is an opacity dip.
- **Plane + procedural frost** (no external frost asset; value-noise in shader).
- **Insert** a flat-row beat between tight album and diagonal spread.

The on-mount **Intro debug slider** is already shipped (a 0→1 `intro` scrub in
the Scene tuner that kills the auto intro tween). Not re-specified here.

---

## A. Stage schedule (`ring-experience.tsx`)

Add a 4th overlapping scroll channel `row` between `stack` and `iso`.

| Channel | Range (p) | Drives |
|---------|-----------|--------|
| `zoom`  | 0 → 0.40  | ring scale + featured centring + side-splay/fade onset |
| `stack` | 0.35 → 0.58 | gather into tight album behind featured (opacity dip) |
| `row`   | 0.54 → 0.78 | tight album → flat horizontal fronto-parallel row |
| `iso`   | 0.74 → 1.0 | flat row → diagonal slab spread |

Changes:
- `SCROLL_LENGTH` 2600 → 3200.
- New constants `ROW_START=0.54`, `ROW_END=0.78`; retune `ZOOM_END=0.40`,
  `STACK_START=0.35`, `STACK_END=0.58`, `ISO_START=0.74`.
- `onUpdate` computes `row = mapProgress(p, ROW_START, ROW_END)` and passes it in
  `scene.setProgress({ zoom, stack, row, iso })`.
- `scrubTo` (tuner Scrub slider) also sets `row` so parking works on the new beat.
- `RingSceneProgress` gains `row: number`; `setProgress` clamps and stores it.

## B. Grid intro (`scene.ts`) — Point 1

Replace continuous random `scatterNY` with a discrete grid (bundle-faithful).

- New constant `INTRO_GRID_ROWS = 8`.
- Per-card seed: `gridRow = Math.floor(Math.random() * INTRO_GRID_ROWS)`
  (replaces `scatterNY`). Keep shuffled `introColumn` (permutation of `0..count-1`)
  for the X column.
- In `update()`, the appear position uses the grid instead of random height:
  - `columnX = (introColumn - (count-1)/2) * rowSlotW` (unchanged).
  - `gridMarginY = viewportHeight * 0.12`
  - `scatterY = mapRange(gridRow, 0, INTRO_GRID_ROWS-1,
       viewportHeight*0.5 - gridMarginY, gridMarginY - viewportHeight*0.5)`
- Existing two-phase intro is unchanged: `intro 0→0.5` collapses Y→0 (centred
  row, X fixed), `0.5→1` row→ring; staggered `uLoadOpacity` fade unchanged.
- Result: cards fade in across a tidy upright rectangle (8 discrete heights),
  not scattered randomly.
- `RingCardController.scatterNY` field is renamed to `gridRow: number`.

## C. Plane + procedural frost (`scene.ts`) — Point 2

Geometry:
- `cardGeometry`: `Box(width,height,depth)` → `Plane(width,height)`.
- Remove `CARD_THICKNESS` use, the side-face spine branch in the fragment shader,
  and `cullFace: gl.BACK` from each `Program` (so a card flipped ~180° by hover
  still renders its back). Keep `depthTest:false`, `depthWrite:false` (painter's,
  ordered by `renderOrder`).
- `CARD_THICKNESS`, `ROW_DEPTH_STEP`, `CARD_EDGE_COLOR` constants removed (or left
  unused/deleted as the diff dictates). Album depth is now a small per-card `z`
  step in the flat-row/diagonal layout (ortho keeps cards same-size).

Shader (`FRAGMENT_SHADER`):
- Add uniform `uFrost` (float, 0..1), default 0.
- Add a small hash/value-noise function (no texture). Apply, mirroring the bundle:
  - `float n = valueNoise(vUv * 6.0);`
  - `base *= mix(mix(0.90, 1.0, 1.0 - uFrost), 1.0, n);`  // frosted-glass tint
  - `alpha *= 1.0 - smoothstep(0.4, 1.0, length(vUv-0.5)*2.0) * 0.18 * uFrost;`
  - `base -= (1.0 - abs(vNormal.z)) * 0.2;`  // view-angle darkening → frosted spine
- Keep the rounded-corner SDF mask and vignette.

Wiring (`update()`):
- Each frame `program.uniforms.uFrost.value = Math.max(gatherT, rowT, spreadT)`
  → 0 on the idle ring + intro (clean plane), fades in as cards gather/spread.
- New uniform initialised per card in the program's `uniforms` block.

## D. Side cards splay + fade on stack (`scene.ts` `update()`) — Point 3

Single-set "dispersion hump" over the gather:
- `const disperse = Math.sin(Math.PI * gatherT);` // 0 at ends, 1 mid-transition.
- Signed ring distance of a non-featured card from featured:
  `s = shortestAngleDelta(card.ringAngle, featuredAngle)` normalised to
  `sNorm = s / Math.PI` (∈ [-1,1]).
- Transient lateral splay added to the card's target X (before damping):
  `splayX = Math.sign(sNorm) * disperse * config.splayAmount`.
- Opacity dip (replaces the current always-1 for non-featured):
  `uOpacity = 1 - disperse * config.splayFade * Math.abs(sNorm)` (featured stays 1).
- By `gatherT=1`, `disperse=0` → splay gone, opacity back to 1 as cards settle
  into the album. Featured (`isFeatured`) is exempt from both.
- New config fields: `splayAmount` (px, default ~90), `splayFade` (0..1, default
  ~0.85). Added to `RingSceneConfig`, `DEFAULT_RING_CONFIG`, and `DEBUG_SLIDERS`.

## E. Flat-row beat (`ring-stages.ts` + `scene.ts`) — Point 4

New pure helper in `ring-stages.ts`:
```
computeFlatRowTarget({ index, count, viewportWidth, cardStep, depthStep }):
  { x, y, z }
```
- Cards along a horizontal line centred on screen: evenly spaced in X by
  `cardStep`, `y = 0`, fronto-parallel; small `z = -index * depthStep` so deck
  order reads (ortho → no size change, just overlap order).
- Unit-tested: monotonic X, symmetric about centre, `z` steps by index.

Position pipeline in `update()` (per card):
```
gatheredX/Y = lerp(base, tight, gatherT)            // ring → tight album
flatX/Y/Z   = computeFlatRowTarget(...) / zoomScale  // flat horizontal row
rowedX/Y/Z  = lerp(gathered, flat, rowEase)          // tight album → flat row
fullX/Y     = computeRowTarget(...)/zoomScale        // diagonal (existing)
targetX/Y   = lerp(rowed, full, spreadT)             // flat row → diagonal
targetZ     = lerp(flatZ, 0, spreadT)
```
- `rowEase = easePow1InOut(row)`, `spreadT = easePow1InOut(iso)` (unchanged curve).
- Deck tilt (`spineTiltDeg`, `containerLeanXDeg`) ramps on `max(rowT, spreadT)`
  so the frosted spines reveal during the row + diagonal, not on the tight album.
- Ortho blend `t = max(orthographicBlendT(zoom), gatherT, rowT, spreadT)`.
- Damp-follow and render-order logic unchanged.

## Testing & docs

- New pure helpers (`computeFlatRowTarget`, grid-row map if extracted, dispersion
  if extracted) get vitest units in the existing `ring-stages.test.ts` style.
- `npm run typecheck` + targeted `npx vitest run app/lib/ring-stages.test.ts`.
- Visual pass on `/test` via the tuner: Intro slider (grid → row → ring), Scrub
  slider through zoom → side-fade → tight album → flat row → diagonal.
- Update `docs/ring-scene-architecture.md` §4 (plane+frost, no slab geometry),
  §5 (4-channel schedule), §6 (side-fade + flat-row beats), §12 (new helper).

## Out of scope

Two-set ring/deck handoff, the bundle's frost texture asset, the cube/portal
formation, mobile layout. Hover behaviours (idle-ring `Ar`, row peek) unchanged.
