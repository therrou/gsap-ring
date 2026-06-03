# Image Ring Scene — Architecture & Logic

A detailed map of the scroll-driven WebGL "image ring" experience on the **`/test`**
route. It is a from-scratch re-implementation of the flow in the bundled
reference `example-2.js` (a Vue + OGL + GSAP/ScrollTrigger + Lenis site), built
on **OGL** (WebGL) + **GSAP ScrollTrigger/ScrollSmoother** inside a React Router 7
route.

This document is written so a developer or AI can understand *why* each piece
exists and *where* to change behaviour. If you only want to tweak look-and-feel,
jump to [§11 Tuning recipes](#11-tuning-recipes) and the in-app **Scene tuner**.

---

## 1. The experience, in one paragraph

24-ish image cards sit on a vertical ring. The idle ring is **hoverable** — cards
near the cursor turn to face you and lift toward the camera. As you scroll, the
ring **zooms** and rotates so one **featured** card sweeps down from the top to
screen-centre. The other cards then **gather into a tight "album" stack** behind
the featured card; the stack's gap **expands**; finally the cards **spread along a
diagonal row**, all rendered the same size. In the spread row, each card is
**hoverable** again (a sideways "peek"). Cards are thin 3-D **slabs** with rounded
corners and a visible edge/spine.

---

## 2. File map

```
app/
├── routes/
│   └── test.tsx              React mount: DOM, ScrollSmoother, ScrollTrigger,
│                             pointer wiring, intro tween, the debug "Scene tuner".
├── lib/
│   ├── ring-scene/
│   │   ├── scene.ts          The whole WebGL scene: renderer, cameras, card
│   │   │                     slabs, shaders, per-frame update(), picking, config.
│   │   └── spring.ts         Critically-damped 1-D spring (matches test-3.js).
│   ├── ring-stages.ts        PURE, tested math for zoom/stack/row + easings +
│   │                         dampToward + projection-matrix mixing.
│   ├── ring-stages.test.ts   Unit tests for ring-stages.
│   ├── ring-parity.ts        PURE, tested math for the idle-ring hover ("Ar"):
│   │                         torque, plane influence, face turn, forward push.
│   ├── ring-parity.test.ts   Unit tests for ring-parity.
│   ├── ring-layout.ts        Ring angle helpers (used by other routes/tests).
│   └── example2-analysis.ts  A few constants extracted from the bundle.
└── app.css                   `.ogl-ring-*` page styling + `.ring-debug` panel.
```

Reference artefacts in the repo root (do **not** edit — they are the source being
replicated): `example-2.js` (the 4.2k-line bundle) and `test-1.js`…`test-4.js`
(sibling chunks: `createState`, Vec2, the spring helper, GSAP plugin reg).

**Design principle:** all frame-independent math lives in the pure modules
(`ring-stages.ts`, `ring-parity.ts`) with unit tests; `scene.ts` orchestrates
them per frame and owns all the WebGL/stateful concerns. Keep new math pure and
tested; keep `scene.ts` as the wiring layer.

---

## 3. Rendering & coordinate model

- **Renderer:** OGL `Renderer`, `dpr = min(devicePixelRatio, 2)`, alpha + MSAA.
- **Units:** **1 OGL unit = 1 CSS pixel.** The perspective camera is placed at
  `z = viewportHeight / (2·tan(fov/2))` (`RING_CAMERA_FOV = 45°`), so a plane of
  N units is N px tall at the z=0 focal plane.
- **Two cameras:** a perspective camera (used for the ring) and a second camera
  used only for its **orthographic** projection matrix. Each frame we mix the two
  projection matrices into `camera.projectionMatrix` (see [§9](#9-camera-perspective--orthographic)).
- **Ring shape:** a **vertical XY ring** — every card's plane normal faces +Z
  (toward camera). This is the bundle's *post-intro* state (the bundle builds a
  horizontal XZ ring then rotates the container −90° to stand it up); we skip
  straight to the upright ring, so no per-card pre-rotation is needed.

### Transform hierarchy

```
scene
└── ringRoot        zoom scale · mouse tilt · centring lift (drops featured to centre)
    └── wrapperRoot  Z-rotation that swings featured to the TOP of the ring on zoom
        └── containerRoot   album/deck tilt (X lean + Y "spine" tilt)
            └── per card:
                ├── card.root   ring placement / stack / spread position + Z roll
                └── card.mesh   LOCAL hover offsets only (forward push, face turn,
                                row peek) — the thin Box slab + program live here
```

The **`root → mesh` split** mirrors the bundle's outer card transform wrapping an
inner plane (`positionPlane`/`rotationPlane`): placement goes on `root`, hover
offsets go on `mesh`, so hover is always applied in the card's **local** frame.

---

## 4. Card geometry, shader & the "album" slab

Each card is a thin **`Box`** (`cardWidth=75 × cardHeight=100 × CARD_THICKNESS=6`),
not a flat plane — this gives real thickness (the album spine).

**Fragment shader** (`scene.ts` `FRAGMENT_SHADER`) decides per-face using the
object-space normal (`vLocalNormal`):

- **Front/back faces** (`|normal.z| > 0.5`): sample the image texture, apply a
  soft vignette, and mask a **rounded rectangle** via an SDF
  (`sdRoundRect`, radius = `uCornerRadius` px). Fully-transparent corner pixels
  `discard`.
- **Side faces** (the thin edges): flat neutral **spine** colour `uEdgeColor`
  (`CARD_EDGE_COLOR`).

**Render flags** on every card program:

- `depthTest:false`, `depthWrite:false` → **painter's algorithm**; draw order is
  pure `renderOrder` (front card = highest order). This keeps every card the
  **same size** (no depth buffer = no perspective size fighting) and avoids
  coplanar z-fighting.
- `cullFace: gl.BACK` → only camera-facing faces draw, so a thin slab renders
  correctly without a depth buffer. (When the idle-ring hover flips a card ~180°,
  its back face becomes front-facing and shows the mirrored image — intended.)

`uHasMap` flips 0→1 when each texture resolves (a fallback colour shows during
load); `uLoadOpacity` drives the staggered intro fade-in.

---

## 5. Scroll → progress schedule

`test.tsx` owns one **pinned** `ScrollTrigger` (`pin:true`, `scrub:0.6`,
`end:+=SCROLL_LENGTH` = 2600px). On update it maps the pin progress `p∈[0,1]` into
**three overlapping channels** via `mapProgress(p, start, end)`:

| Channel | Range (p)            | Drives                                   |
|---------|----------------------|------------------------------------------|
| `zoom`  | `0 → ZOOM_END` (0.45)| ring scale + featured centring + ortho   |
| `stack` | `0.4 → 0.7`          | gather into the tight album, deck tilt    |
| `iso`   | `0.65 → 1.0`         | expand + spread to the final diagonal row |

These thresholds are **reconstructed** (the bundle computes its own
`part1/part2/scrub/part4` schedule in a store not present in this repo) and are
intentionally easy to retune.

A separate **intro** tween animates `intro: 0→1` over 1.6s on mount (staggered
card load-fade + the hover "wake" gate). `prefers-reduced-motion` skips the
ScrollTrigger and ScrollSmoother entirely (snap to idle ring).

Inside `scene.update()` the raw channels are passed through easings:

```
zoomEase  = easeOutCubic(zoom)
gatherT   = stackEase = easeOutCubic(stack)   // ring → tight album
spreadT   = rowEase   = easePow1InOut(iso)    // tight album → full spread
```

---

## 6. The sequence, stage by stage (in `scene.update()`)

Everything below runs **every frame** from the current channel values. "Frame"
state that must ease over time (positions, hover) is damped, not snapped.

### 6.1 Idle ring + ring hover (`zoom≈0`)
Cards laid on the XY ring (`layoutCardsBase`): `ringX=cos θ·r`, `ringY=sin θ·r`,
`θ = ringAngleAtIndex(i)`. `ringRoot.rotation.x = baseTiltXDeg` (top of ring tipped
toward camera). A small downward rest offset keeps the ring clear of the top nav.

**Mouse torque** (`ring-parity.computeMouseRingForce`): a log-scaled, damped
pointer offset rotates `ringRoot` (x `0.032π`, y `0.025π`) and `wrapperRoot.z`
(`0.035π`), attenuated by `(1 − zoom)`.

**Per-card hover** is the faithful port of the bundle's `Ar` function — see
[§7.1](#71-idle-ring-hover-ar). It writes to `card.mesh` (local frame), never to
placement.

### 6.2 Zoom: featured sweeps to centre (`zoom: 0 → 1`)
- `zoomScale = computeZoomScale(zoom, zoomScaleMax)` scales `ringRoot`.
- `wrapperRoot.rotation.z` rotates the ring so the **featured** card reaches the
  **top** (θ=+π/2); `ringRoot.position.y` then drops so featured lands at
  screen-centre — i.e. featured **sweeps down from the top**.
- This "centring frame" (wrapper rotation + lift) **unwinds during `gatherT`**, so
  by the time the album forms the frame is screen-aligned and the deck lays out in
  clean pixel space.

### 6.3 Gather → tight album (`stack: 0 → 1`)
For each card we compute its **full** diagonal slot and a **compressed** version:

```
row    = computeRowTarget(deckIndex, count, part4=1, vw, vh, cardHalf)   // px
fullX  = row.x / zoomScale ;  fullY = row.y / zoomScale
tightX = fullX * tightScale;  tightY = fullY * tightScale                // tight album
gatheredX = lerp(card.ringX, tightX, gatherT)   // ring → tight album
gatheredY = lerp(card.ringY, tightY, gatherT)
```

- **`deckIndex`** re-orders cards so the **featured card is slot 0** (front of the
  stack); the rest follow in index order — matching the bundle's
  `r = [featured, …]`. Featured therefore anchors the front of both the album and
  the final diagonal, instead of sitting in the middle.
- Cards **do not fade out** — they stay visible and converge into the album behind
  featured. The album is just the diagonal arrangement scaled to `tightScale`.
- `card.root.rotation.z` flattens the ring's tangent roll to **0** as cards gather
  (cards are square rectangles; the album tilt comes from the deck, not a skew).
- **Deck tilt:** `containerRoot.rotation.x = containerLeanXDeg`, `.y = spineTiltDeg`
  (scaled by `max(gatherT, spreadT)`) — a small Y-turn reveals the slab spines.

### 6.4 Expand + spread (`iso: 0 → 1`)
```
targetX = lerp(gatheredX, fullX, spreadT)
targetY = lerp(gatheredY, fullY, spreadT)
targetZ = 0     // ALL cards coplanar → identical size under orthographic camera
```
`computeRowTarget` spreads cards evenly along the diagonal from lower-left to
upper-right, filling the viewport minus a margin (`rowMarginFactor`). The whole
ring scale also **pulls back** (`rowScalePullback`) so the spread isn't huge.

### 6.5 Row hover (`iso > 0.5`)
The spread cards are hoverable again — see [§7.2](#72-row-hover-peek).

### 6.6 Damped follow
The final `targetX/Y/Z` is not applied directly; each card's `pos` is eased toward
it with `dampToward(pos, target, dampRate, dtMs)` (the bundle's `p.Damp` analog),
`dampRate` ramping from crisp (idle ring) to trailing (gather/spread). This gives
the deck its fluid, slightly-lagging motion.

### 6.7 Render order
`card.mesh.renderOrder = count − deckIndex` (painter's): featured (slot 0) draws on
top, the rest step back by deck order. **Hover does not change render order**
(matches the bundle).

---

## 7. Hover behaviours

There are **two distinct** hovers, gated by phase and both ported from the bundle.

### 7.1 Idle-ring hover (`Ar`)
Pure math in `ring-parity.ts`, driven by the **damped** pointer:

```
G          = computeCardPlaneInfluence(...)      // gaussian, sineInOut, ×intro gate
faceY      = computeCardPlaneFaceRotation(G,zoom)// π·G·(1 − pow1out(zoom/0.7))
forwardZ   = computeCardPlaneForwardZ(G,zoom)    // 160·G·(1 − pow1out(zoom))
```
- `G` peaks when a card's *live* ring angle is nearest the cursor; influence radius
  = `π·lerp(0.3,0.15,zoom)·r`.
- Applied to `card.mesh`: `rotation.y = faceY` (turn to face), `position.z = forwardZ`
  (lift toward camera). **No spring** — easing comes entirely from the damped
  pointer. Both fade out as `zoom` rises, so hover never leaks into the deck.

### 7.2 Row hover "peek" (`PlaneStacked K/U`)
- A critically-damped **spring** (`spring.ts`, stiffness 130) drives the hovered
  card's value toward `ROW_HOVER_TARGET = 2`, others to 0.
- Applied as `card.mesh.position.x = damped · hoverSlide` → a subtle **sideways
  peek** along the card's local +X. No forward pop, no opacity boost, no reorder —
  exactly the bundle (`positionHover3 = (damped,0,0)`, fixed render order).

---

## 8. Picking (which card is hovered)

`scene.pickAt(clientX, clientY)` is screen-space:
1. project each card's world centre to screen (perspective focal projection);
2. test the cursor against the card's projected rect, sized using the card's
   **world scale** pulled from its world matrix (so the hit-rect tracks the real
   on-screen size at any zoom);
3. among all cards under the cursor, return the **frontmost** (highest
   `renderOrder`) — deterministic, matches what's drawn on top, no flicker.

`test.tsx` only calls `pickAt` when `iso > 0.5` (the spread row); the result is
fed back via `setHoveredIndex`.

> If you need pixel-perfect picking on overlapping rotated slabs, swap this for
> OGL's `Raycast` extra against the card meshes. Screen-space is enough for the
> current spread.

---

## 9. Camera: perspective → orthographic

`mixProjectionMatrices(persp, ortho, t)` blends the two stored projection matrices
into `camera.projectionMatrix` each frame, with

```
t = max(orthographicBlendT(zoom), gatherT, spreadT)
```

So the **idle ring is perspective** (depth/parallax), and once the album forms the
camera goes **orthographic** and stays there for the spread — which is what makes
every spread card the **same size** regardless of its place in the stack. Resize
re-snapshots both matrices in `configureCamera`.

---

## 10. Smooth scroll (ScrollSmoother)

`test.tsx` uses **GSAP ScrollSmoother** (free in GSAP 3.13+, no extra dependency)
for Lenis-style inertial scroll. Key points:
- Page is wrapped in `#smooth-wrapper > #smooth-content`; the smoother is created
  **before** the ScrollTrigger pin so the pin reads the smoothed position.
- **Fixed UI** (the top nav, the debug panel) lives **outside** the smoother —
  ScrollSmoother transforms `#smooth-content`, and a transformed ancestor would
  make `position:fixed` scroll with it.
- `smooth: 1` (≈ Lenis `lerp 0.1`). Skipped for `prefers-reduced-motion`.
- Note: ScrollTrigger's `scrub: 0.6` stacks on top of the smoother. If motion
  feels laggy behind the scroll, lower the scrub.

---

## 11. Tuning recipes

The fastest path is the in-app **Scene tuner** (top-right on `/test`): a **Scrub**
slider parks the sequence on any phase, and live sliders push to
`controller.setConfig(...)`. Values map to `RingSceneConfig`:

| Slider          | Config field        | Effect |
|-----------------|---------------------|--------|
| Zoom scale      | `zoomScaleMax`      | how big the featured card gets at full zoom |
| Spread scale    | `rowScalePullback`  | card size in the final spread |
| Spread length   | `rowMarginFactor`   | diagonal length / overlap (smaller = longer, less overlap) |
| Album tightness | `tightScale`        | gap of the tight album stack (Image-8 moment) |
| Spine tilt °    | `spineTiltDeg`      | deck Y-turn that reveals slab spines |
| Deck lean °     | `containerLeanXDeg` | deck forward lean |
| Ring tilt °     | `baseTiltXDeg`      | idle-ring X tilt (top-of-ring toward camera) |
| Corner radius   | `cornerRadius`      | card corner rounding (px) |
| Hover slide     | `hoverSlide`        | row-hover sideways peek distance |

**Common deeper tweaks (code):**

- **Stage timing / overlap** → `ZOOM_END`, `STACK_START/END`, `ISO_START/END` and
  `SCROLL_LENGTH` in `test.tsx`.
- **Card size / aspect / thickness** → `cardWidth`, `cardHeight`, `CARD_THICKNESS`
  in `scene.ts` (geometry is built once; not a live-config field).
- **Spine colour** → `CARD_EDGE_COLOR`. **Clear colour** → `RING_CLEAR_COLOR`.
- **Card count / which card is featured** → `RING_CARD_COUNT`, `RING_FEATURED_INDEX`.
- **Idle-hover strength/curves** → `ring-parity.ts`
  (`computeCardPlaneInfluence/FaceRotation/ForwardZ`, `RING_CARD_PLANE_FORWARD`).
- **Deck-follow feel** → the `dampRate` lerp in `update()` and `dampToward`.
- **Smooth-scroll feel** → `smooth` (ScrollSmoother) and `scrub` (ScrollTrigger).

When adding a new tunable: add the field to `RingSceneConfig` + `DEFAULT_RING_CONFIG`,
read `config.x` in `update()`, and add a row to `DEBUG_SLIDERS` in `test.tsx`.

---

## 12. Pure tested utilities (the safe place to change math)

**`ring-stages.ts`** (stage geometry + helpers):
`easeBezierInOut`, `easePower2Out`, `easePow1InOut`, `easeExpoIn`,
`orthographicBlendT`, `wrapToPi`, `computeZoomScale`, `computeZoomLift`,
`computeFeaturedCenterRotation`, `computeContainerTilt`, `computeNonFeaturedOpacity`,
`computeRowTarget`, `dampToward`, `mixProjectionMatrices`.
*(Some — `computeZoomLift`, `computeContainerTilt`, `computeNonFeaturedOpacity` —
are tested and available but not currently wired into `scene.ts` after the
album/same-size rework; they remain for reference and re-use.)*

**`ring-parity.ts`** (idle-ring hover + torque):
`easePow1Out`, `computeResponsiveRingRadius`, `computeMouseRingForce`,
`computeCardPlaneInfluence`, `computeCardPlaneFaceRotation`,
`computeCardPlaneForwardZ`, `RING_CARD_PLANE_FORWARD`.

**`spring.ts`**: `Spring` — `force=(target−damped)·stiffness − velocity·damping;
velocity+=force·dt; damped+=velocity·dt`; `criticalDamping → damping=2·√stiffness`.

Run a single file fast: `npx vitest run app/lib/ring-stages.test.ts`. (The full
`npm test` boots jsdom and is slower; prefer typecheck + targeted tests.)

---

## 13. What faithfully matches the bundle vs. what's reconstructed

**Faithful ports:** the idle-ring hover (`Ar`) math and curves; the row-hover
spring (`positionHover`, stiffness 130, target 2, local +X); the spring integrator
(`test-3.js`); the perspective↔orthographic blend concept; the slab card with
front/back image + neutral spine; featured-as-front-of-deck ordering; damped deck
follow (`p.Damp`).

**Reconstructed / adapted** (bundle source not in repo, or coordinate-frame
differences): the exact scroll→progress schedule and thresholds; the bundle's
custom `bezier.inOut*` eases (replaced with cubic in-out); the absolute hover-slide
magnitude (`hoverSlide` is calibrated, the bundle's `2` is in its own card-scale
units); the vertical-ring simplification of the bundle's horizontal-ring +
container-rotation construction.

**Out of scope** (present in the bundle, intentionally not built): the cube
formation + two-tone logo "portal" composite, the FXAA post-pass, the Rapier
physics "blobs" mode, the mobile (`P`) layout, and DOM category-label wiring on
hover (the scroll-driven category panel in `test.tsx` is a static stand-in).

---

## 14. Quick start for a new contributor

1. `npm run dev` → open `/test`. Scrub the page (or use the Scene tuner's **Scrub**
   slider) through: idle ring → zoom/centre → tight album → spread → row hover.
2. Read `scene.ts:update()` top-to-bottom — it is the whole per-frame story and
   maps 1:1 onto [§6](#6-the-sequence-stage-by-stage-in-sceneupdate).
3. Change *math* in the pure modules (with tests); change *wiring/feel* in
   `scene.ts`; change *timing/DOM* in `test.tsx`.
4. Verify: `npm run typecheck`, the targeted vitest files, and a visual pass on
   `/test`. `npm run build` validates the SSR path (all WebGL is inside `useEffect`,
   client-only).
```
