# Liquid-Glass Edge Window (flat-row stop)

## Revision (2026-06-06) — bounded panel, not full viewport

Changed from a full-screen edge effect to a **centred, card-like glass panel**
drawn on top of the canvas:
- Panel is a rounded rect bounded in **both** width and height (`glassHalfW`,
  `glassHalfH` fractions of viewport; `glassRadius` px corners). Outside the
  panel = untouched canvas.
- Inside: only the panel's **L/R edges** refract (`glassCenter` keeps the middle
  clear); a **rim** traces the rounded border (card look).
- Shader works in px (`uResolution`) for isotropic round corners; SDF rounded
  rect → `mask`; refraction is panel-relative (`dx = p.x / panelHalfW`).
- New config: `glassHalfW` (0.38), `glassHalfH` (0.3), `glassRadius` (18) +
  the existing `glassCenter/Strength/Rim/RimColor`. Three new tuner sliders.

Original full-viewport design retained below for reference.

---


Date: 2026-06-05
Scope: new `app/lib/ring-scene/glass-pass.ts`, wiring in
`app/lib/ring-scene/scene.ts`, sliders in `app/components/ring-experience.tsx`.

A screen-space "glass window" during the flat horizontal row beat: the centre is
pixel-perfect, the **left & right screen margins** act as curved glass that
refracts the scene behind them (cylinder-wrap curl + bright rim). Matches the
Loewe-editorial reference. Decisions locked: flat-row stop only; full-screen edge
window; real refraction via a render-target pass; static curved lens + rim.

## Pipeline

- New `RenderTarget` (`rt`) sized to the drawing buffer.
- Each frame, **only when the glass is active** (`glassT > 0.001`): render the
  scene into `rt`, then draw a full-screen triangle with the glass shader
  sampling `rt.texture` → screen. Otherwise render straight to screen as today
  (no extra pass outside the row beat).
- Gating: `glassT = flatRowT * (1 - spreadT)` — ramps in over the row beat,
  peaks at the full flat row, fades out as the diagonal spread begins. Strength
  scales with `glassT`.

## Module: `glass-pass.ts`

`createGlassPass(gl, renderer)` →
`{ setSize(w,h), renderToTarget(scene,camera), renderGlass(glassT,cfg), destroy() }`.
- Owns the `RenderTarget`, a `Triangle` full-screen geometry, and the glass
  `Program`. `setSize` resizes the RT to `gl.drawingBufferWidth/Height` and sets
  `uAspect`. `renderGlass` pushes uniforms and renders the quad (no camera).

## Glass shader (fragment)

Per pixel, `d = (uv.x - 0.5) * 2` (∈ [-1,1]), `ad = abs(d)`:
- `edge = smoothstep(uCenter, 1.0, ad)` → 0 across the clear centre band, →1 at
  the L/R edges. `warp = edge*edge` (stronger near the very edge).
- Horizontal refraction (pull toward edge / cylinder wrap):
  `offX = -sign(d) * warp * uStrength * uGlass`. Mild vertical curl
  `offY = (uv.y-0.5) * warp * uStrength * 0.4 * uGlass`.
- Chromatic aberration on the offset (`ca = warp * 0.004 * uGlass`, R/B split).
- Sample `tMap` at `uv + (offX,offY)`; centre band → untouched (passthrough).
- Bright rim at the centre→glass boundary:
  `rim = exp(-((ad - uCenter)/0.04)^2)`, add `uRimColor * rim * uRim * uGlass`
  (appears on both sides by symmetry).

Vertex: full-screen triangle, `gl_Position = vec4(position, 0, 1)`, pass `uv`.

## Config + tuner (`scene.ts` / `ring-experience.tsx`)

New `RingSceneConfig` fields + defaults:
- `glassCenter` (clear-band half-width, 0..1, default 0.5)
- `glassStrength` (edge bend, default 0.08)
- `glassRim` (rim intensity, default 0.6)
- `glassRimColor` (vec3, default `[0.6, 0.8, 1.0]`, no slider)

Three numeric sliders added to `DEBUG_SLIDERS`.

## Wiring (`scene.ts`)

- Create the pass after the deck. `setSize` → `glass.setSize`.
- In `update()`, after the ortho-blend matrix mix, replace the final render with
  the gated branch above. `destroy()` disposes the pass.

## Perf / reduced-motion / out of scope

- One extra full-screen pass, only during the ~0.6–0.8 row window.
- Reduced-motion users never scroll to the row stop → never runs.
- Out of scope: animated liquid wobble, per-card glass, top/bottom edges, the
  lightbox (still CSS blur). No tests/git this pass.
