# Ring scene — remaining stages (zoom → stack → row → hover) design

**Date:** 2026-06-02
**Branch:** `feat/example-2-ring-parity`
**Route:** `/test` (`app/routes/test.tsx`, `app/lib/ring-scene/scene.ts`)

## Goal

Port the post-scroll stages of `example-2.js` so `/test` reproduces the
reference behaviour: the ring translates/zooms, one card centers, the rest
fade out, the deck spreads into a diagonal row with rotation + perspective, and
row cards are hoverable (spring pop). Per-stage **geometry math is exact**
(copied from the bundle); the **scroll→progress schedule is reconstructed**
(the bundle computes it in the `#entry` store, which is not in this repo).

## Decisions (locked)

- **Fidelity:** port exact bundle math for the remaining stages.
- **Hover:** WebGL spring-pop only — no DOM category-label wiring. The existing
  scroll-driven category panel in `test.tsx` stays as-is.
- **Scope stops at the hoverable row.** Out of scope: cube formation, logo /
  portal composite, FXAA post-pass, mobile (`P`) layout. Desktop row only.
- **Picking:** replace screen-space `pickAt` with OGL `Raycast` against the cards.
- **Scroll thresholds:** reconstructed/tunable — zoom `0→0.45`, stack `0.4→0.7`,
  row `0.65→1.0`, camera blend tied to `zoom.part2`.

## Coordinate model (unchanged)

Keep the current vertical-XY ring + perspective camera (1 OGL unit = 1 CSS px,
camera `z = vh / (2·tan(fov/2))`). This already equals the bundle's post-intro
state: the bundle builds a horizontal XZ ring (`x=cos(A)·r`, `z=−sin(A)·r−r`)
then rotates `rotationContainer.x → −π/2` to stand it upright facing camera. No
ring rebuild — the idle ring and the already-ported ring-hover (`Ar`) are kept.

## Architecture

Pure, frame-independent math goes in tested modules following the existing
pattern (`ring-parity.ts`, `ring-layout.ts`); `scene.ts` wires them per frame.

- **`app/lib/ring-stages.ts`** (new, unit-tested):
  - `computeZoomScale(zoomPart1, max=3.7)` — `lerp(1, max, bezierInOut(p))`.
  - `computeZoomLift(zoomPart1, ringRadius)` — `−ringRadius·power2out(p)`.
  - `computeFeaturedCenterRotation(featuredTheta, wrapperZ, zoomPart2)`.
  - `computeStackTargetX(cardOffset, stackPart2, spacing, viewportSpread)` — bundle `E`.
  - `computeRowTarget(index, count, part4, vw, vh, cardHalf)` — bundle desktop `S`;
    returns `{x, y}` on the diagonal lower-left→upper-right line.
  - `computeNonFeaturedOpacity(stackOpacity)` — `1 − stackOpacity`.
  - `dampToward(current, target, damp, dtMs)` — bundle `Damp`.
  - `mixProjectionMatrices(ortho, persp, t)` — element-wise mix; `t = expoIn(expoIn(1−zoomPart2))`.
  - easings: `bezierInOut`, `power2out`, `pow1inOut`, `expoIn` (clamped, tested).
- **`scene.ts`** changes:
  - Add an **orthographic** `Camera` alongside the perspective one; each frame
    write `camera.projectionMatrix = mixProjectionMatrices(...)`.
  - Per-card **position damper**: scroll sets `card.target`; ticker damps
    `card.root.position` toward it (`dampToward`) with a per-stage `damp` ramp.
  - Replace `pickAt` with OGL `Raycast`; keep the `Spring` (stiffness 130,
    critical) for the hover pop, now pushing `card.mesh.position.x`.
- **`test.tsx`**: reconstruct the progress schedule (above); feed
  `zoom/stack/row` + a `camera` blend value into `scene.setProgress`.

## Stage math (exact, with bundle line refs)

### Stage 1 — Zoom (`RingZoom Ir`, 3477-3489)
- `scaleZoom = lerp(1, 3.7, bezierInOut(zoom.part1))`.
- `positionZoom.y = −ringRadius · power2out(zoom.part1)`.
- `rotationZoom.z = lerp(0, shortestAngle(featured.initialTheta − wrapper.z), zoom.part2)`.
- Ortho/persp blend (4030-4059): `proj = mix(ortho, persp, expoIn(expoIn(1−zoom.part2)))`
  → orthographic at full zoom.

### Stage 2 — Stack (`PlaneStacked E` 3120-3130; opacity `Gr` 3595-3605; tilt 3109-3112)
- `O = expoInOut(stack.part2)`; deck target
  `x = (w·k·O − I·stack.scrub)/scale` (staggered per card index `k`).
- Per-card `damp = lerp(dampInit, 0.06, clamp(1 − iLerp(B,0,0.5)))`.
- Container tilt `o.x = π/6·O`, `o.y = −π/6·O`.
- Non-featured `uOpacity = 1 − stack.opacity`.
- Angular fan: cards within ±6 of featured rotate ±π/2 (`Gr` 3597-3604).

### Stage 3 — Row (`PlaneStacked` desktop part4 `S`, 3134-3140)
- `B = designWidth·scale·…`; `I = vw − 2B`, `k = vh − 2B`.
- For card `X`: `ne = lerp(−I/2, I/2, X/(n−1))`, `re = lerp(−k/2, k/2, X/(n−1))`.
- `M = pow1inOut(part4)`; target
  `x = lerp(deckX, ne, M)/scale`, `y = M·re/scale`, `z = 0`.
- Visual rotation/perspective = container tilt (Stage 2) + perspective camera.

### Stage 4 — Hover pop (`PlaneStacked K`/`U`, 3192-3202)
- Active only in the row phase (bundle gate `step5`).
- Raycast pick → hovered card `positionHover.target = 2`, others `0`.
- `Spring` (stiffness 130, critical) → `mesh.position.x = damped · unit`
  (`unit` calibrated to card scale). Card pops along its local X. WebGL only.

## Testing

- Unit tests for every `ring-stages.ts` function (boundary values 0/1, midpoint,
  monotonicity, clamping) — mirrors `ring-parity.test.ts`.
- Manual: scrub `/test`; verify center → fade → diagonal row → hover pop; verify
  full-zoom card has no perspective skew (ortho blend).
- Per workflow preference: prefer `npm run typecheck` + targeted single-file
  vitest over the full `npm test` suite.

## Out of scope

Cube formation, logo/portal, FXAA, mobile layout, DOM hover labels.
