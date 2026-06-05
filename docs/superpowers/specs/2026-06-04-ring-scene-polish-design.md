# Ring Scene — Polish Pass (solo moment · slab border · animated gap · hover wheel)

Date: 2026-06-04
Scope: `app/components/ring-experience.tsx`, `app/lib/ring-scene/scene.ts`,
`app/lib/ring-stages.ts`, new `app/lib/ring-scene/indicator-wheel.ts`.

Four polish tweaks on top of the working reconstruction. Source of truth is the
bundled `example-2.js`; the slab look stays **faked** (frosted shader + overlap +
tilt — the bundle uses `tFrost`, no real geometry, confirmed L1458-1504). The
hover wheel is a **net-new** addition (not in the bundle), inspired by the iOS
alarm picker.

Decisions locked with user:
- Slab thickness/border: **faked** (shader border stroke + painted side-edge), no
  Box geometry.
- Stack gap: **animates open** over scroll (tight → wide), not fixed.
- Indicator wheel: **in-scene WebGL**, fixed lower-center, fixed category word
  list, **random** pick on hover, reappear-behind for the solo moment.
- No new tests (user pref); no git actions.

---

## Revision (post-review, storyboard #26–#29)

User clarified the zoom→stack transition with a 4-frame storyboard:
1. featured card pinned dead-center, others fade out to the corners (#26),
2. featured alone, a flat plane facing camera (#27),
3. featured slightly rotates → slab edge appears (#28),
4. the rest fade back in **stacked directly behind featured**, z-stepped, the
   deck tilts → thick book-edge (#29). Then the existing flat-row + diagonal
   spread continues (featured → lower-left in the spread, unchanged).

Changes vs. the original sections below:
- **Album geometry**: the tight album is no longer `full × tightScale` (a scaled
  diagonal, which put featured off-center at the lower-left). It is now a true
  **z-stack at screen-center**: `tightX = tightY = 0`, `tightZ = -deckIndex *
  stackDepth`. Featured (deckIndex 0) → `(0,0,0)`, pinned. `tightScale` is now
  unused (left in config/tuner as a no-op).
- **Album-formation timeline moved onto the gather** (not the `row` channel):
  `fadeOutT` (gather 0→`soloFadeEnd`), solo gap, `reappearT` (gather
  `reappearStart`→1). `deckFormT = max(reappearT, flatRowT, spreadT)` drives the
  slab rotation, deck tilt, and gap opening — so the featured rotates and the
  deck thickens as the others reappear, all within the gather.
- New config `soloFadeEnd` (0.4); `reappearStart` retimed to the gather
  timeline (0.55).
- **Wheel**: per-card mapping (`WORDS[cardIndex % wordCount]`), shortest-path
  spin (no overshoot turns) — replaces the random pick, which felt too fast.

## Revision 2 (post-review) — true two-set hand-off

Replaced the single-set approximation with the bundle's **two card sets**
(`example-2.js` `PlaneStacked` `r` + ring `meshList` `g`):

- **Ring set** (`cards`, under `ringRoot/wrapperRoot/containerRoot`): intro →
  ring → idle hover → zoom-centre, then **fades out** as the stack begins. The
  ±6 neighbours of featured **swing ±π/2** around the ring (port of bundle
  `G.opacity`, L3595-3606). It no longer collapses into a deck; the centring
  frame no longer unwinds.
- **Deck set** (`deckCards`, under a new screen-aligned `deckRoot`): a second
  24-card set reusing the ring textures. Slot 0 = **main** (featured), born at
  centre, fades in first (crossfades over the ring-featured). The rest fade in
  from `reappearStart`, stacked behind. Deck does stack (z-book) → flat row →
  diagonal; `deckRoot` tilt pivots on screen-centre so the **main rotates in
  place** (slab reveal) and stays genuinely immovable.
- Picking + debug labels now target the **deck** (`pickAt` returns `deckIndex`).
- Hand-off timing: ring-featured fades `gatherT 0.12→0.30`; deck-main fades in
  by `gatherT 0.12` (covers it); ring non-featured fade by `soloFadeEnd`; deck
  others fade in from `reappearStart`.
- `splayAmount` / `splayFade` / `tightScale` sliders are now **no-ops** (the
  splay is replaced by the ring swing; the stack is a pure z-book). Left in the
  tuner to avoid churn.

The single-set sections A–E below are superseded for the stack/row mechanics but
kept for the shader (B) and gap (C) details, which are unchanged.

## A. Clean solo moment (zoom → stack) — `scene.ts` `update()`

Today non-featured opacity is `max(1 - fadeOut*splayFade, fadeIn)` with
`fadeIn = easePow1InOut(flatRowT)`. Because `ROW_START (0.54) < STACK_END (0.58)`
the sides fade back **before** they are fully gone — no clean "featured alone"
frame (Image #21).

Change:
- Keep the fade-out + splay (sides drift outward and reach **0** opacity at
  `gatherT = 1`).
- Gate the fade-**in** behind a new `reappearStart` so there is a short solo beat
  before the deck rebuilds:
  ```
  const reappearT = easePow1InOut(
    clamp01((row - config.reappearStart) / Math.max(0.001, 1 - config.reappearStart))
  );
  const nonFeaturedVis = Math.max(1 - easePow1InOut(gatherT) * config.splayFade, reappearT);
  ```
- `config.reappearStart` default `0.18` (in the `row` channel). Cards reappear
  **stacked behind featured** (their tight-album / deck slot) as the gap opens.
- `splayFade` default already `1` (full fade-out) — unchanged.
- Featured (`isFeatured`) stays opacity 1 throughout.

No schedule-threshold edits required; `reappearStart` lives in `RingSceneConfig`.

## B. Faked slab — border + faux thickness — `FRAGMENT_SHADER` (`scene.ts`)

New uniforms per card program:
- `uBorder` (float 0..1) — border amount, ramped per frame with the slab.
- `uBorderColor` (vec3) — stroke colour (default near-white, slightly cool).
- `uSlabEdge` (float 0..1) — strength of the painted side-spine darkening.

Shader (after the existing rounded-corner mask, before final colour):
- **Inner stroke** from the existing SDF distance `dist` (negative inside):
  ```
  float edge = 1.0 - smoothstep(0.0, config.borderWidth_px, abs(dist));
  // ring just inside the rounded edge
  float ring = smoothstep(-2.0, 0.0, dist) * (1.0 - smoothstep(0.0, 1.5, dist));
  base = mix(base, uBorderColor, ring * uBorder);
  ```
  (final px width comes from a `uBorderWidth` uniform; keep the band 1–2px.)
- **Faux side-spine**: reuse the view-angle term already present, scale by
  `uSlabEdge` so tilted cards read a darker edge (thickness) on the deck:
  ```
  base -= (1.0 - abs(vNormal.z)) * 0.2 * uFrost;          // existing
  base -= (1.0 - abs(vNormal.z)) * 0.35 * uSlabEdge;       // new, deeper edge
  ```

Uniforms initialised in the per-card `Program` `uniforms` block. Per frame in
`update()`:
```
program.uniforms.uBorder.value   = Math.max(gatherT, flatRowT, spreadT); // with the slab
program.uniforms.uSlabEdge.value = deckTiltT;                            // with the tilt
program.uniforms.uBorderWidth.value = config.borderWidth;
program.uniforms.uBorderColor.value = config.borderColor;
```
New config fields: `borderWidth` (px, default ~1.5), `borderColor`
(`[r,g,b]`, default `[0.92,0.94,0.97]`), `slabEdge` (0..1, default ~0.6).
`uBorderColor` pushed in `setConfig` like `cornerRadius`.

## C. Animated stack gap — `ring-stages.ts` + `scene.ts`

Behind-cards start tight against featured, the inter-card gap grows over the
stack→row scroll (book-edge opening, Image #23).

- Drive with `gapT = Math.max(flatRowT, spreadT)` (gap opens as the deck forms,
  stays open through the spread).
- Apply a spacing multiplier to the **tight album** target so the album is no
  longer a single fixed `tightScale`, but interpolates its spacing:
  ```
  const gap = lerp(config.stackGapTight, config.stackGapOpen, gapT);
  const tightX = fullX * config.tightScale * gap;
  const tightY = fullY * config.tightScale * gap;
  ```
  (`stackGapTight` default `1.0`, `stackGapOpen` default `2.2` — tune in the
  panel.)
- The flat-row depth step `FLAT_ROW_DEPTH_STEP` is also scaled by `gapT` so the
  z-spacing of the book edge grows in step:
  ```
  depthStep: FLAT_ROW_DEPTH_STEP * lerp(1, config.stackGapOpen, gapT)
  ```
- New config: `stackGapTight`, `stackGapOpen`. Featured stays slot 0 (gap grows
  behind it).
- No change to the diagonal-spread (`full`) targets or damp-follow.

## D. WebGL indicator wheel — new `app/lib/ring-scene/indicator-wheel.ts`

Net-new module. One clear purpose: build + drive an iOS-alarm-style rotating
text cylinder, in-scene, fixed lower-center, visible only during the spread.

**Interface:**
```ts
createIndicatorWheel(gl, { parent: Transform, words: string[] }): {
  group: Transform;                 // attach under `scene` (not the ring)
  setVisible(v01: number): void;    // opacity / fade with spread
  hover(active: boolean): void;     // true → pick a random word, spin to it
  update(deltaMs: number): void;    // step the spin spring, apply rotateX
  layout(viewportW: number, viewportH: number): void; // fixed screen position
  destroy(): void;
}
```

**Construction:**
- `words` = fixed list (default
  `["Concept","Schematic","Design Development","Documentation","Permitting",
    "Coordination","Compliance","Submission"]`).
- One **canvas-texture** per word: draw the word (and optional small index number,
  echoing the "13" chip in the reference) onto a 2D canvas, upload as `Texture`.
- A `Plane` per word, placed on a **cylinder**: each plane at angle
  `θ_i = i * (2π / N)`, positioned `y = R·sin θ`, `z = R·cos θ`, rotated
  `rotation.x = -θ_i` so its face is tangent (text upright when at front). `R`
  small (a few card-heights). This is the alarm-wheel cylinder.
- Programs: `transparent`, `depthTest:false`, `depthWrite:false`, `cullFace:null`
  (consistent with the cards), a simple textured shader with `uOpacity` + a
  per-plane angular **fade** so only the front ~2 words read (others dim toward
  the cylinder back), matching the iOS picker falloff.

**Spin / hover:**
- A `Spring` (reuse `spring.ts`, stiffness ~90, critically damped) holds
  `angleDamped` → `angleTarget`. `hover(true)` sets `angleTarget` to the angle of
  a **random** word (`pick = floor(random*N)`, `angleTarget = pick * step`),
  optionally + a full turn so it spins past several entries (alarm overshoot).
- `update()` steps the spring and sets `group.rotation.x = angleDamped`. The
  critically-damped spring gives the settle; add a small extra target offset that
  decays for the iOS overshoot feel if needed.
- Idle (`hover(false)`): hold last word (no auto-spin), or a very slow drift —
  default: hold.

**Placement (`layout`) — fixed lower-center, screen-aligned:**
- Parent is `scene` (so the ring's zoom/tilt/rotation never touch it).
- Position `group.position.set(0, -viewportH * 0.34, 0)` (lower-center in px
  space; 1 unit = 1px). Scale chosen so the front word is legible.
- Because the camera goes orthographic during the spread, a child of `scene` at a
  fixed px position renders at a stable screen spot — exactly the readout slot in
  the reference panel.

**Wiring in `scene.ts`:**
- Create the wheel after the cards, `parent: scene`.
- `setSize` → `wheel.layout(w, h)`.
- Pointer/hover already tracked (`hoveredIndex`, `iso > 0.5`). Each frame:
  ```
  const spreadActive = iso > 0.5;
  wheel.setVisible(spreadActive ? easePow1InOut((iso - 0.5) / 0.5) : 0);
  wheel.hover(spreadActive && hoveredIndex >= 0);
  wheel.update(deltaMs);
  ```
- A new hover only triggers a fresh random pick on the **rising edge** (track
  `lastHovered`); holding hover over one card does not re-spin every frame.
- `destroy()` disposes wheel textures/programs alongside the cards.

## Config + tuner (`ring-experience.tsx`)

Add to `RingSceneConfig` / `DEFAULT_RING_CONFIG` and `DEBUG_SLIDERS`:
- `reappearStart` (0..1, default 0.18)
- `borderWidth` (px, 0–4, default 1.5)
- `slabEdge` (0..1, default 0.6)
- `stackGapTight` (0.5–2, default 1.0)
- `stackGapOpen` (1–4, default 2.2)

`borderColor` is a colour (not a slider) — set in `DEFAULT_RING_CONFIG`, pushed in
`setConfig`; no tuner row (keep the panel simple).

## Out of scope

Real Box geometry, the bundle `00-frost` texture asset, DOM category panel wiring,
FXAA, cube/portal, mobile layout, two-set ring/deck handoff. Existing hover
behaviours (idle-ring `Ar`, row peek) unchanged. No automated tests this pass.
