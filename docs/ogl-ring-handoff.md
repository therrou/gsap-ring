# OGL Image Ring — Handoff Notes

Replication of the scroll-driven image-ring flow from `example-2.js` (a 4,250-line bundled OGL/GSAP/ScrollTrigger experience). The current implementation lives on `/test` and covers **ring (+ idle hover) → zoom → stack → iso → stacked-hover**.

The ring-idle hover is a faithful port of example-2's `Ar` (bundle line ~3507): a damped-pointer "plane influence" that turns + pushes nearby cards toward the camera in their own local frame. See §1 "Ring hover" below.

---

## 1. What was built

### Route

- `app/routes/test.tsx` — React component that mounts an OGL canvas, runs the GSAP ticker, sets up ScrollTrigger, and forwards pointer events. Phase pill in the header reflects the current state.
- Route already registered in `app/routes.ts` (`route("test", "routes/test.tsx")`).

### Scene module (`app/lib/ring-scene/`)

- **`spring.ts`** — `Spring` class matching the helper in `test-3.js`:
  ```
  force = (target − damped) · stiffness − velocity · damping
  velocity += force · dt
  damped   += velocity · dt
  ```
  Supports `criticalDamping: true` → sets `damping = 2·√stiffness` (used for the stacked-hover spring at stiffness 130).

- **`scene.ts`** — `createRingScene({ canvas, imageSources })` returns a controller:
  ```ts
  type RingSceneController = {
    setSize(w, h): void
    setProgress({ zoom?, stack?, intro? }): void
    setHoveredIndex(index): void
    setPointer({ x, y, inside }): void
    pickAt(clientX, clientY): number | null
    update(deltaMs): void   // call once per frame, then renders
    destroy(): void
  }
  ```

  Internals:
  - **Renderer**: OGL `Renderer` with `dpr = min(devicePixelRatio, 2)`, alpha, antialias, high-performance power preference.
  - **Camera**: perspective FOV 45°, `position.z = vh / (2·tan(fov/2))` so 1 OGL unit = 1 CSS pixel.
  - **Transform hierarchy**:
    ```
    scene
    └── ringRoot       — mouse tilt + zoom scale + zoom translation
        └── wrapperRoot — Z rotation that brings featured to bottom of un-tilted ring
            └── containerRoot — extra X tilt added during stack phase
                └── per card:
                    └── card.root  — ring placement: position + stack/iso targets + tangent roll
                        └── card.mesh — hover "plane" offsets only (local +Z push, local Y face turn)
    ```
    The per-card `root → mesh` split mirrors example-2's outer card transform
    (`position=k`, `rotation=W`) wrapping an inner plane (`positionPlane`,
    `rotationPlane`). Keeping hover on the inner mesh makes the forward push
    happen along the card's own normal, not global Z.
  - **Cards**: each is a `Plane(75, 100)` mesh (aspect ≈0.75) with its own `Program` (so each card has independent uniforms + texture). Plane normal +Z means cards face the camera by default.
  - **Textures**: per-card `Texture` loaded from a picsum URL (`https://picsum.photos/seed/ring2-N/360/480`). `uHasMap` flips from 0 → 1 once the image resolves so a fallback colour is shown during load.
  - **Shaders**: see `VERTEX_SHADER` / `FRAGMENT_SHADER` in `scene.ts`. Fragment does diffuse darkening (`uLight`), corner vignette, and `uOpacity * uLoadOpacity` alpha.

### Phase math (in `update()`)

| Phase | Driver | Effect |
|---|---|---|
| **Ring idle** | always | Cards laid out on a vertical XY ring. `ringRoot.rotation.x = baseRotationX (-28°)` for forward perspective. |
| **Ring hover** | damped pointer + `intro` gate (example-2 `Ar`) | Log-scaled ring torque (x `0.032π`, y `0.025π`, wrapper-z `0.035π`). Per-card gaussian "plane influence" `G = sineInOut(clamp(1 − dist/N)) · intro`, `N = π · lerp(0.3, 0.15, zoom) · r`, distance measured from the card's **live** angle on the spinning ring. `G` drives a **local** face turn `rotationPlane.y = π·G·(1 − pow1out(zoom/0.7))` and a **local** forward push `positionPlane.z = 160·G·(1 − pow1out(zoom))`. No per-card spring — easing comes entirely from the damped pointer (~90ms follow). All three parity formulas live in tested `ring-parity.ts`. |
| **Zoom** | `zoom: 0→1` (scroll 0→0.5) | Scales whole ring `1 → 3`, rotates wrapper to put featured at θ=−π/2, flattens base tilt by `(1 − zoom·0.8)`, translates ringRoot to centre featured at world (0,0,~0). |
| **Stack** | `stack: 0→1` (scroll 0.5→1) | Cards lerp from `ringX/Y/Z` to `stackX = offset·36, stackY = 0, stackZ = -|offset|·14`. Container tilts down by 12°. Wrapper rotation unwound by `(1 − stack)` so deck is upright. Opacity = `lerp(1, 0.15 + distanceFalloff·0.5, stack)` where `distanceFalloff = clamp01(1 − |offset|/6)`. |
| **Stacked hover** | `hoveredIndex` + `stack > 0.6 && iso < 0.4` gate | Spring (130, critical damping) drives `hoverPeek: 0→1`. `card.root` translates +36·peek on Y, +24·peek on Z, opacity boosted to 1, `renderOrder += count*2`. This is the one hover that keeps the spring (the deck has no damped-pointer follow to ride on). |

### ScrollTrigger wiring

Single trigger in `test.tsx`:
```ts
ScrollTrigger.create({
  trigger: stageEl,
  start: "top top",
  end: `+=${SCROLL_LENGTH}`, // 1800px pinned
  pin: true,
  scrub: 0.6,
  onUpdate: (self) => {
    const p = self.progress;
    const zoom  = Math.min(1, p / 0.5);
    const stack = Math.max(0, (p - 0.5) / 0.5);
    scene.setProgress({ zoom, stack });
  },
});
```
Single ticker via `gsap.ticker.add(tick)` calls `scene.update(deltaMs)` per frame which both updates transforms and renders.

### Intro animation

GSAP tween animates `sceneState.intro: 0 → 1` over 1.6s; the per-card fragment uses `uLoadOpacity = clamp01((intro − cardIndex/count · 0.4) / 0.6)` for a staggered fade-in.

### Reduced motion

`window.matchMedia("(prefers-reduced-motion: reduce)").matches` skips the ScrollTrigger entirely and runs the intro at duration 0 (snap to ring-idle state).

### Styling

`.ogl-ring-*` styles in `app/app.css`:
- `.ogl-ring-page` — cream background (`#f6f8fa`)
- `.ogl-ring-hero` — fixed top bar with title + description + phase pill
- `.ogl-ring-stage` — full-viewport pinned section housing the canvas
- `.ogl-ring-overlay` — phase label pill at the bottom

### Dependencies

- **Added**: `ogl ^1.0.11`
- Already present: `gsap`, `three`, `@dimforge/rapier3d-compat`, React Router 7, Tailwind 4

### Verification

- `npm run typecheck` — clean
- `app/lib/ring-parity.test.ts` — 7/7 passing (hover face turn, forward push, influence, torque). Full `npm test` not re-run after the hover rework (per workflow preference); run it if you want the whole suite.
- Manual: navigate `/test`, hover the idle ring — nearby cards should turn toward the cursor and lift off the ring toward the camera, easing in/out smoothly with no spring wobble.

---

## 2. What's missing vs. the full `example-2.js`

The original bundle includes several additional layers that the user's brief did not mention. Each is independent and can be layered on top of the current implementation without rewriting any of the existing phase math.

### 2.1 Portal / logo cube transition

After the stacked deck, the example slides into a cube-formation that reveals a two-tone logo. The logo is rendered to its own framebuffer and composited as a "portal" over the ring scene.

**Pieces to build:**
- A second scene root with a logo mesh (matcap shader). Constants from `app/lib/example2-analysis.ts`:
  - `uColorStart = #0F3043` (`[15/255, 48/255, 67/255]`)
  - `uColorEnd   = #4F97B6` (`[79/255, 151/255, 182/255]`)
- Two render targets: one for the ring scene, one for the logo mask.
- A fullscreen quad composite program:
  ```glsl
  vec4 mask = texture(tMask, gl_FragCoord.xy / uResolution.xy);
  vec4 portal = texture(tPortal, gl_FragCoord.xy / uResolution.xy);
  gl_FragColor = mix(portal, vec4(0.), 1. - mask.r);
  ```
- New scroll phase (e.g. progress 0.85 → 1.0) that:
  - Morphs cards from deck into a cube layout (un-fan + uniform UV crop via `uAspect: 1 → 1/0.75`)
  - Ramps `uPortal: 0 → 1` so the card fragment shader returns `vec4(0)` (carved out)
  - Ramps logo opacity 0 → 1

Reference code lines from `example-2.js`: `Logo` mesh setup ~2785, portal composite ~2484–2497, cube reveal `R()` ~3176.

### 2.2 FXAA post-pass

The example runs the final ring composite through NVIDIA FXAA (`example-2.js` ~3688–3942) for cheap anti-aliasing on the textured plane edges.

**Pieces to build:**
- Render the main scene into a `RenderTarget` instead of straight to the canvas.
- Create an OGL `Post` chain (`extras/Post.js`) with a single FXAA pass program.
- In `update()`, swap `renderer.render({ scene, camera })` for `post.render({ scene, camera })`.
- Resize handling: `post.resize(width, height)` in `setSize()`.

FXAA shader constants used: `_ContrastThreshold = 0.0312`, `_RelativeThreshold = 0.063`, `EDGE_STEP_COUNT = 6`.

### 2.3 Rapier-driven physics blobs

The example has a separate blob mode (a different scroll position / page) where matcap glass spheres are simulated with Rapier 3D and rendered with a 30-iteration hash-blur shader.

**Pieces to build:**
- Import `@dimforge/rapier3d-compat` (already in deps), `await RAPIER.init()`.
- Build a `World` with gravity, add ~6–12 sphere rigid bodies + colliders.
- Per-frame: `world.step()` then copy each rigid body translation/rotation into a mesh.
- Matcap shader with hash-noise vertex displacement + 30-iter hash blur for the glass look. See `example-2.js` ~1251–1365 for the original fragment shader.

This is a substantial standalone feature; if added, give it its own scene/canvas or its own scroll segment beyond the existing pin.

### 2.4 Lenis smooth scroll

The example uses Lenis to give the scroll a buttery feel (and pauses Lenis until the intro completes via `lenis.stop() / lenis.start()`).

**Pieces to build:**
- `npm install lenis`
- In `test.tsx`:
  ```ts
  import Lenis from "lenis";
  const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- Gate `lenis.stop()` until intro completes:
  ```ts
  introTween.eventCallback("onComplete", () => lenis.start());
  ```
- `ScrollTrigger.scrollerProxy` is not required when Lenis runs on the window (Lenis wraps `window.scrollY` natively).

### 2.5 Ortho ↔ perspective camera blend (nice-to-have)

The example morphs between an orthographic and a perspective projection during the zoom phase via a double `expo.in` ease (`example-2.js` ~4045). At full zoom the camera is essentially orthographic, removing perspective distortion on the featured card.

**Pieces to build:**
- Compute two projection matrices each frame:
  ```ts
  cameraOrtho.orthographic({ left: -w/2, right: w/2, top: h/2, bottom: -h/2, near: 1, far: 8000 });
  cameraPersp.perspective({ aspect: w/h, fov: 45, near: 1, far: 8000 });
  ```
- Blend matrices element-wise:
  ```ts
  const t = expoIn(expoIn(zoomProgress));
  for (let i = 0; i < 16; i++) {
    camera.projectionMatrix[i] = cameraOrtho.projectionMatrix[i] * t
                               + cameraPersp.projectionMatrix[i] * (1 - t);
  }
  ```
- Swap `camera.type` between `"orthographic"` and `"perspective"` at the endpoints.

---

## 3. Constants reference (verbatim from the example brief)

| Constant | Value | Where used |
|---|---|---|
| FOV | 45° | `RING_CAMERA_FOV` |
| Clear color | `(246, 248, 250, 1)/255` | `RING_CLEAR_COLOR` |
| Logo primary | `#0F3043` | (when implementing logo) |
| Logo secondary | `#4F97B6` | (when implementing logo) |
| Card aspect | ≈0.75 | matched by Plane(75, 100) |
| Ring radius (lg) | `328 × scale` | `computeRingRadius()` |
| Ring radius margin (mobile) | 120 | `computeRingRadius()` |
| Card count | 23 | `RING_CARD_COUNT` |
| Featured index | 15 | `RING_FEATURED_INDEX` |
| Angle offset | `0.75 × count` | `ringAngleAtIndex()` |
| Ring base tilt X | −6° (mine; example uses container −π/2 + view rig) | `baseRotationX` |
| Zoom scale max | 3.0 (mine; example uses 3.7) | `RING_ZOOM_SCALE` |
| Hover forward push (ring) | 160 | `RING_CARD_PLANE_FORWARD` / `computeCardPlaneForwardZ()` |
| Hover face-turn / push attenuation | `1 − pow1out(zoom/0.7)` / `1 − pow1out(zoom)` | `ring-parity.ts` (`easePow1Out`) |
| Stack card spacing | 30 (mine; example uses 200 lg / 130 md / 80 sm) | `RING_STACK_SPACING_X` |
| Spring stiffness (stacked hover) | 130, critically damped | `hoverSpring` |
| Ring mouse rot coeffs | x `0.032π`, y `0.025π`, wrapper-z `0.035π` (matches example) | `update()` |
| Damped-pointer follow | ~90ms time constant | `pointerDamp` in `update()` |
| Plane influence radius | `π × lerp(0.3, 0.15, zoom) × r` | `computeCardPlaneInfluence()` |
| Scroll pin length | 1800px | `SCROLL_LENGTH` in `test.tsx` |
| Zoom/stack split | 0.5 / 0.5 | `ZOOM_PROGRESS_END` |

---

## 4. File map

```
app/
├── routes/
│   └── test.tsx              ← React mount, ScrollTrigger, pointer wiring
├── lib/
│   ├── ring-scene/
│   │   ├── scene.ts          ← OGL renderer + ring + cards + per-frame update
│   │   └── spring.ts         ← critical-damped spring (matches test-3.js)
│   ├── ring-layout.ts        ← (still used by home.tsx; not by /test)
│   ├── ring-parity.ts        ← tested ring-hover formulas, consumed by /test scene.ts
│   ├── ring-parity.test.ts   ← unit tests for the hover/torque parity math
│   └── example2-analysis.ts  ← shared constants extracted from example-2.js
├── app.css                   ← `.ogl-ring-*` styles added
└── routes.ts                 ← `/test` route already registered
```

Reference materials in repo root (do NOT edit, they're the source artefacts):
- `example-2.js` — full bundle being replicated
- `test-1.js`..`test-4.js` — sibling chunks (createState hook, Vec2, spring helper, GSAP plugin reg)

---

## 5. How to continue in a new context

1. Read this file plus `app/lib/ring-scene/scene.ts` (≈350 lines) and `app/routes/test.tsx` (≈185 lines). Together they're the whole implementation.
2. To re-run the technical-brief subagent on the bundle, use the same prompt as before — section §4 of the brief (scroll state machine) and §7 (shader snippets) are the highest-value reference.
3. For each missing feature in §2:
   - Add a new tween/progress channel in `test.tsx` (don't try to overload `zoom`/`stack`).
   - Add new fields to `RingSceneProgress` and consume them in `scene.update()`.
   - Keep scene-module concerns inside `scene.ts`; only React lifecycle + scroll wiring goes in `test.tsx`.
4. Visual verification: dev server is `npm run dev` (port 5173). Page is `/test`. Chrome DevTools MCP gives `take_screenshot` + `evaluate_script` for headless validation.
5. Commands:
   - `npm run dev` — local dev server with HMR
   - `npm run typecheck` — `react-router typegen && tsc`
   - `npm test` — vitest run (uses jsdom; OGL code is only loaded in browser so untested)
   - `npm run build` — production build (verify SSR-safety — all OGL work is inside `useEffect`)

---

## 6. Known caveats

- **Picsum image loads** are slow-ish on first paint. Each card flashes its fallback grey colour until the texture resolves. Could be improved with a preload/warm-up gate before starting the intro tween.
- **Picking** is screen-space distance based on the card's projected centre, not raycast. Good enough for the deck phase; if you add interactive ring-phase hover-clicks, swap in OGL's `Raycast` extra (`import { Raycast } from 'ogl'`).
- **`baseRotationX = -6°`** was chosen empirically to look pleasant (nearly upright ring); the example uses a more complex `containerRoot.rotation.x = -π/2` + offset rig that you may want to reinstate if matching the original camera angle exactly matters.
- **Reduced motion** simply skips ScrollTrigger entirely — user sees only the ring-idle state. Consider whether you'd rather show the stacked deck as a static snapshot for these users.
- The example-2 ring **does not auto-spin**; my implementation also doesn't. If you want gentle idle rotation, add `wrapperRoot.rotation.z += 0.001` (or similar) in the ticker, gated by `(1 - zoom)` so the spin stops during zoom.
