/**
 * Pure, frame-independent math for the post-scroll ring stages, ported from
 * `example-2.js`:
 *
 *   zoom   — RingZoom `Ir`            (bundle ~3477-3489)
 *   stack  — PlaneStacked `E` / fade  (bundle ~3099-3130, 3595-3605)
 *   row    — PlaneStacked desktop `S` (bundle ~3134-3140)
 *   hover  — PlaneStacked `K`/`U`     (bundle ~3192-3202)  [spring lives in scene]
 *
 * The per-stage geometry is exact. Two things are reconstructed because they
 * are not in this repo: the bundle's custom `bezier.inOut*` eases (replaced
 * with cubic in-out), and `p.Damp` (replaced with the standard exponential
 * approach). Both are documented at their definitions.
 */

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

// ─── Easings ────────────────────────────────────────────────────────────────

/** Stand-in for the bundle's `bezier.inOut*` eases: cubic in-out. */
export function easeBezierInOut(value: number) {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** GSAP `power2.out` (cubic ease-out): `1 - (1 - t)^3`. */
export function easePower2Out(value: number) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

/** GSAP `power1.inOut` (quad in-out). */
export function easePow1InOut(value: number) {
  const t = clamp01(value);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** GSAP `expo.in`: `2^(10(t-1))`, pinned to 0 at t=0. */
export function easeExpoIn(value: number) {
  const t = clamp01(value);
  return t <= 0 ? 0 : Math.pow(2, 10 * (t - 1));
}

/**
 * Blend factor for the orthographic/perspective camera mix. example-2 doubles
 * `expo.in` and drives it from zoom (bundle ~4043-4047). Here `t = 0` → fully
 * perspective (idle ring), `t = 1` → fully orthographic (max zoom), which is
 * the visible end state: the featured card loses perspective skew at full zoom.
 */
export function orthographicBlendT(zoomPart2: number) {
  return easeExpoIn(easeExpoIn(clamp01(zoomPart2)));
}

// ─── Angles ─────────────────────────────────────────────────────────────────

/** Wrap an angle into (-π, π]. Mirrors the bundle's `pt(0, x)` helper. */
export function wrapToPi(angle: number) {
  const twoPi = Math.PI * 2;
  let t = angle % twoPi;
  if (t < 0) t += twoPi;
  return t <= Math.PI ? t : t - twoPi;
}

// ─── Stage 1: zoom (RingZoom `Ir`) ────────────────────────────────────────────

/** `scaleZoom = lerp(1, max, bezierInOut(part1))` (bundle 3485-3486). */
export function computeZoomScale(zoomPart1: number, maxScale = 3.7) {
  return lerp(1, maxScale, easeBezierInOut(zoomPart1));
}

/** `positionZoom.y = -ringRadius · power2.out(part1)` (bundle 3486). */
export function computeZoomLift(zoomPart1: number, ringRadius: number) {
  return -ringRadius * easePower2Out(zoomPart1);
}

/**
 * `rotationZoom.z = lerp(0, wrapToPi(featuredTheta - wrapperZ), part2)`
 * — rotates the ring so the featured card lands dead-centre (bundle 3488).
 */
export function computeFeaturedCenterRotation(
  featuredTheta: number,
  wrapperZ: number,
  zoomPart2: number,
) {
  return lerp(0, wrapToPi(featuredTheta - wrapperZ), clamp01(zoomPart2));
}

// ─── Stage 2: stack fade (PlaneStacked / Index) ───────────────────────────────

/** Non-featured card opacity during the collapse: `1 - stackOpacity` (bundle 3103). */
export function computeNonFeaturedOpacity(stackOpacity: number) {
  return 1 - clamp01(stackOpacity);
}

/**
 * Container forward tilt as the deck lies down (bundle 3111: `o.x = g·M`,
 * `o.y = -g·M`, with `g = π/6` on desktop). Returns `{ x, y }` in radians.
 */
export function computeContainerTilt(stackPart2: number, g = Math.PI / 6) {
  const m = easePow1InOut(stackPart2);
  return { x: g * m, y: -g * m };
}

// ─── Stage 3: row (PlaneStacked desktop `S`) ──────────────────────────────────

/**
 * Diagonal row target, in viewport pixels (bundle 3134-3140). Cards spread from
 * the collapsed deck onto the line from lower-left to upper-right as `part4`
 * ramps. `cardHalf` is the on-screen half-size kept as a viewport margin so the
 * end cards don't clip (the bundle derives this from the design width).
 *
 * Returns the destination `{ x, y }` (px) plus the eased blend `t` so the
 * caller can `lerp(collapsePos, dest, t)`.
 */
export function computeRowTarget(input: {
  index: number;
  count: number;
  part4: number;
  viewportWidth: number;
  viewportHeight: number;
  cardHalf: number;
}) {
  const { index, count, part4, viewportWidth, viewportHeight, cardHalf } = input;
  const denom = Math.max(1, count - 1);
  const spanX = Math.max(0, viewportWidth - cardHalf * 2);
  const spanY = Math.max(0, viewportHeight - cardHalf * 2);
  const x = lerp(-spanX / 2, spanX / 2, index / denom);
  const y = lerp(-spanY / 2, spanY / 2, index / denom);
  return { x, y, t: easePow1InOut(part4) };
}

// ─── Stage 3b: flat row (PlaneStacked deck `E`) ───────────────────────────────

/**
 * Flat horizontal row target, in viewport pixels. The intermediate beat between
 * the tight album and the diagonal spread (reference Image #11 / bundle `E`,
 * ~3120-3130): cards fan out along a single horizontal line, fronto-parallel
 * (`y = 0`), each stepped back a little in `z` by deck order so the stack still
 * reads. Under the orthographic camera the `z` step changes overlap/order, not
 * size, so every card stays the same size.
 *
 * `cardStep` is the horizontal gap between adjacent cards (px); `depthStep` is
 * the per-card z recession (px, small). The row is centred on screen.
 */
export function computeFlatRowTarget(input: {
  index: number;
  count: number;
  cardStep: number;
  depthStep: number;
}) {
  const { index, count, cardStep, depthStep } = input;
  const centre = (count - 1) / 2;
  return {
    x: (index - centre) * cardStep,
    y: 0,
    z: -index * depthStep,
  };
}

// ─── Per-frame helpers ────────────────────────────────────────────────────────

/**
 * Exponential approach used for the deck's damped follow (stand-in for the
 * bundle's `p.Damp`). `damp` is a rate; larger = snappier. Frame-rate
 * independent via `dtMs`.
 */
export function dampToward(current: number, target: number, damp: number, dtMs: number) {
  const t = clamp01(1 - Math.exp(-damp * dtMs));
  return current + (target - current) * t;
}

/**
 * Element-wise mix of two 4x4 column-major projection matrices.
 * `t = 0` → perspective, `t = 1` → orthographic.
 */
export function mixProjectionMatrices(
  perspective: ArrayLike<number>,
  orthographic: ArrayLike<number>,
  t: number,
  out: number[] = new Array(16),
) {
  const k = clamp01(t);
  for (let i = 0; i < 16; i++) {
    out[i] = perspective[i] * (1 - k) + orthographic[i] * k;
  }
  return out;
}
