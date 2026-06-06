/**
 * OGL-backed 3D image ring matching the flow described in example-2.js:
 *
 *   1. Ring idle    — 24 cards on a tilted ring, log-scaled mouse torque,
 *                     per-card gaussian "plane influence" lifting cards
 *                     toward the pointer (~160px max).
 *   2. Zoom         — camera scales the whole ring (~3x) and the ring
 *                     rotates to bring the featured card (index 15) into
 *                     screen-center.
 *   3. Stack        — cards translate into a horizontal deck behind the
 *                     featured card; non-featured opacity fades.
 *   4. Stacked hover — spring-driven (stiffness 130, critically damped)
 *                     peek that fans the hovered card outward.
 *
 * All distances are in CSS pixels — the perspective camera distance is set
 * so 1 OGL unit equals 1 viewport pixel:  z = vh / (2 * tan(fov/2)).
 */

import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext,
} from "ogl";
import { Spring } from "./spring";
import { createGlassPass } from "./glass-pass";
// Indicator wheel (number + text) disabled in the spread — replaced by a
// click-to-open lightbox. Kept here (commented) so it's easy to restore.
// import { createIndicatorWheel } from "./indicator-wheel";
import {
  computeCardPlaneFaceRotation,
  computeCardPlaneForwardZ,
  computeCardPlaneInfluence,
} from "../ring-parity";
import {
  computeFlatRowTarget,
  computeRowTarget,
  computeZoomScale,
  dampToward,
  easePow1InOut,
  mixProjectionMatrices,
  orthographicBlendT,
} from "../ring-stages";

export const RING_CARD_COUNT = 23;
export const RING_FEATURED_INDEX = 15;
export const RING_CAMERA_FOV = 45;
export const RING_HOVER_LIFT = 160;
export const RING_ZOOM_SCALE = 3.7;

// ─── Row (final diagonal) tuning ──────────────────────────────────────────────
/** Scale multiplier on the zoomed ring once the row is fully formed. */
export const ROW_SCALE_PULLBACK = 0.38;
/** Viewport margin (× card size) kept clear at the diagonal's ends. Larger →
 * shorter diagonal → more card overlap. */
export const ROW_MARGIN_FACTOR = 1.2;
/** Per-card z recession in the flat horizontal row (px). Small — under the
 * orthographic camera it changes overlap order, not size. */
export const FLAT_ROW_DEPTH_STEP = 4;
/** Horizontal gap between adjacent cards in the flat row, in px. */
export const FLAT_ROW_CARD_STEP = 46;
/** Corner radius of the card face, in px. */
export const CARD_CORNER_RADIUS = 9;
/** Compression of the tight "album" stack vs. the full spread (0..1). */
export const STACK_TIGHT_SCALE = 0.14;
/** Default gap (px) added to the card size for intro column/row spacing. */
export const INTRO_GRID_GAP = 14;
/** Discrete vertical rows the intro cards scatter across (Y). Each card has a
 * UNIQUE column (X), so no two cards ever share a place. */
export const INTRO_GRID_ROWS = 7;
/** Max lateral splay (px) of side cards as the ring collapses (Image #10). */
export const SIDE_SPLAY_AMOUNT = 90;
/** How fully side cards fade out as the ring collapses (1 = invisible). */
export const SIDE_SPLAY_FADE = 1;
/** Category words cycled by the in-scene hover indicator wheel (spread phase). */
export const INDICATOR_WORDS = [
  "Concept",
  "Schematic",
  "Design Development",
  "Documentation",
  "Permitting",
  "Coordination",
  "Compliance",
  "Submission",
];

/**
 * Live-tunable scene parameters (driven by the /test debug panel via
 * `controller.setConfig`). Angles are in DEGREES here for friendlier sliders.
 */
export type RingSceneConfig = {
  zoomScaleMax: number;
  rowScalePullback: number;
  rowMarginFactor: number;
  tightScale: number;
  spineTiltDeg: number;
  containerLeanXDeg: number;
  baseTiltXDeg: number;
  cornerRadius: number;
  hoverSlide: number;
  /** Lateral splay distance of side cards as the ring collapses (px). */
  splayAmount: number;
  /** Peak opacity dip of side cards mid-collapse (0..1). */
  splayFade: number;
  /** Intro progress where the staggered fade finishes / Y-collapse starts. */
  introFadeEnd: number;
  /** Intro progress where the Y-collapse to the centred row completes. */
  introCollapseEnd: number;
  /** Intro progress where the row → ring fan begins (ends at 1). */
  introRingStart: number;
  /** Gap (px) between intro scatter-grid cells (on top of the card size). */
  introGap: number;
  /** `gatherT` point where the non-featured cards finish fading fully out
   * (start of the clean "featured alone" beat). */
  soloFadeEnd: number;
  /** `gatherT` point where the faded-out cards start reappearing stacked behind
   * featured (and the featured slab begins to rotate). Must be ≥ soloFadeEnd so
   * there is a solo gap. */
  reappearStart: number;
  /** Faux-slab inner border stroke width (px). 0 = no border. */
  borderWidth: number;
  /** Faux-slab inner border stroke colour (linear rgb 0..1). */
  borderColor: [number, number, number];
  /** Strength of the painted side-edge darkening that fakes slab thickness. */
  slabEdge: number;
  /** Album spacing multiplier at the start of the gather (tight book). */
  stackGapTight: number;
  /** Album spacing multiplier once the deck/row forms (gap opened, Image #23). */
  stackGapOpen: number;
  /** Liquid-glass panel half-width, fraction of viewport (0..0.5). */
  glassHalfW: number;
  /** Liquid-glass panel half-height, fraction of viewport (0..0.5). */
  glassHalfH: number;
  /** Liquid-glass panel corner radius, px. */
  glassRadius: number;
  /** Clear centre half-width within the panel (0..1). */
  glassCenter: number;
  /** Liquid-glass horizontal cylinder compression at the edge. */
  glassStrength: number;
  /** Liquid-glass vertical bow (cylinder wrap of the side slides). */
  glassBow: number;
  /** Liquid-glass specular streak intensity. */
  glassRim: number;
  /** Liquid-glass rim colour (linear rgb). */
  glassRimColor: [number, number, number];
  /** How far the glass panel glides toward the cursor (fraction of half-view). */
  glassFollow: number;
};

export const DEFAULT_RING_CONFIG: RingSceneConfig = {
  zoomScaleMax: RING_ZOOM_SCALE,
  rowScalePullback: ROW_SCALE_PULLBACK,
  rowMarginFactor: ROW_MARGIN_FACTOR,
  tightScale: STACK_TIGHT_SCALE,
  spineTiltDeg: 14,
  containerLeanXDeg: -6,
  baseTiltXDeg: 6,
  cornerRadius: CARD_CORNER_RADIUS,
  hoverSlide: 15, // = ROW_HOVER_SLIDE (declared below; literal avoids TDZ)
  splayAmount: SIDE_SPLAY_AMOUNT,
  splayFade: SIDE_SPLAY_FADE,
  introFadeEnd: 0.5,
  introCollapseEnd: 0.75,
  introRingStart: 0.72,
  introGap: INTRO_GRID_GAP,
  soloFadeEnd: 0.4,
  reappearStart: 0.55,
  borderWidth: 1.5,
  borderColor: [0.92, 0.94, 0.97],
  slabEdge: 0.6,
  stackGapTight: 1.0,
  stackGapOpen: 2.2,
  glassHalfW: 0.38,
  glassHalfH: 0.3,
  glassRadius: 18,
  glassCenter: 0.5,
  glassStrength: 0.12,
  glassBow: 0.6,
  glassRim: 0.8,
  glassRimColor: [0.6, 0.8, 1.0],
  glassFollow: 0.1,
};
/**
 * Row hover, ported from example-2 `PlaneStacked` (positionHover): a critically
 * damped spring (stiffness 130) drives `damped` toward `ROW_HOVER_TARGET` on the
 * hovered card and `positionHover3 = (damped, 0, 0)` slides it along its LOCAL
 * +X — a subtle sideways peek, no forward pop, no render-order change.
 * `ROW_HOVER_SLIDE` converts the spring's target-2 units into local +X distance.
 */
export const ROW_HOVER_TARGET = 2;
export const ROW_HOVER_SLIDE = 15;
export const RING_CLEAR_COLOR: [number, number, number, number] = [
  246 / 255,
  248 / 255,
  250 / 255,
  1,
];

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  attribute vec3 normal;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vLocalNormal;
  varying vec3 vLocalPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vLocalNormal = normal;
    vLocalPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D tMap;
  uniform float uOpacity;
  uniform float uLoadOpacity;
  uniform float uLight;
  uniform float uHasMap;
  uniform float uFrost;        // frosted-glass "slab" amount (0 ring → 1 album)
  uniform vec3 uFallbackColor;
  uniform vec2 uHalfSize;      // card face half-extents, px
  uniform float uCornerRadius; // px
  uniform float uBorder;       // faux-slab border amount (0 ring → 1 album)
  uniform float uBorderWidth;  // border stroke band width, px
  uniform vec3 uBorderColor;   // border stroke colour
  uniform float uSlabEdge;     // painted side-edge darkening (fakes thickness)

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vLocalNormal;
  varying vec3 vLocalPos;

  // Signed distance to a rounded rectangle (2D), in px.
  float sdRoundRect(vec2 p, vec2 halfSize, float radius) {
    vec2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }

  // Cheap value noise (no texture) — stands in for the bundle's tFrost map.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    float alpha = uOpacity * uLoadOpacity;

    // Flat plane: sample the full image from the face position.
    vec2 faceUv = vLocalPos.xy / (uHalfSize * 2.0) + 0.5;
    vec4 sampled = texture2D(tMap, faceUv);
    vec3 base = mix(uFallbackColor, sampled.rgb, uHasMap);

    float vignette = smoothstep(0.45, 1.0, length(faceUv - 0.5) * 2.0);
    base -= vignette * 0.08;

    // Rounded-corner mask.
    float dist = sdRoundRect(vLocalPos.xy, uHalfSize, uCornerRadius);
    alpha *= 1.0 - smoothstep(0.0, 1.5, dist);

    // ─── Faux-slab inner border stroke (Image #22) ───────────────────────────
    // A thin band just INSIDE the rounded edge, painted toward uBorderColor.
    // dist < 0 inside; the band sits in [-uBorderWidth, 0]. Gated by uBorder so
    // the idle ring stays a clean plane.
    float ring = smoothstep(-uBorderWidth, -uBorderWidth * 0.5, dist) *
                 (1.0 - smoothstep(-0.5, 1.0, dist));
    base = mix(base, uBorderColor, clamp(ring, 0.0, 1.0) * uBorder);

    // ─── Frosted-glass "slab" look (bundle co/In shader, ~L1502-1510) ─────────
    // Only present once the cards gather/spread (uFrost ramps 0→1); on the idle
    // ring + intro uFrost = 0 so the card reads as a clean plane.
    float n = valueNoise(faceUv * 6.0);
    base *= mix(mix(0.90, 1.0, 1.0 - uFrost), 1.0, n);
    alpha *= 1.0 - smoothstep(0.4, 1.0, length(faceUv - 0.5) * 2.0) * 0.18 * uFrost;
    // View-angle darkening → tilted slabs read a frosted "spine"; gated by frost.
    base -= (1.0 - abs(vNormal.z)) * 0.2 * uFrost;
    // Deeper painted side-edge → fakes slab thickness on the tilted deck (#23).
    base -= (1.0 - abs(vNormal.z)) * 0.35 * uSlabEdge;

    float diffuse = max(dot(vNormal, normalize(vec3(-10.0, -10.0, -1.0))), 0.0);
    base -= base * diffuse * 0.6 * uLight;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(base, alpha);
  }
`;

export type RingCardController = {
  /**
   * Per-card transform placed on the ring (carries position + tangent roll +
   * stack/iso targets). Mirrors example-2's outer card `OGLTransform`
   * (`position=k`, `rotation=W`).
   */
  root: Transform;
  /**
   * Inner plane mesh. Only the hover "plane" offsets live here — a local +Z
   * forward push and a local Y face turn — mirroring example-2's
   * `positionPlane` / `rotationPlane` applied to the inner Plane.
   */
  mesh: Mesh;
  index: number;
  isFeatured: boolean;
  ringAngle: number;
  ringX: number;
  ringY: number;
  ringZ: number;
  faceRotationZ: number;
  /**
   * Intro scatter seeds: `introCol` is the card's UNIQUE column (a permutation of
   * 0..count-1 → one card per X, never the same place), `introRow ∈
   * [0,INTRO_GRID_ROWS-1]` its scattered height. Column step = card width + gap,
   * so the grid is wider than the viewport (edge cards overflow) but never
   * overlaps. `introDelayN ∈ [0,1]` staggers the fade-in.
   */
  introCol: number;
  introRow: number;
  introDelayN: number;
  hoverSpring: Spring;
  /**
   * Current (damped) root position. Scroll sets a per-frame target and this
   * follows it via `dampToward`, mirroring example-2's `p.Damp` deck follow so
   * the collapse/row transitions trail slightly instead of snapping.
   */
  pos: { x: number; y: number; z: number };
};

/**
 * Deck card (example-2 `PlaneStacked` entry). `root` carries the stack/row/spread
 * placement under `deckRoot`; `mesh` carries the row-hover local peek. `origIndex`
 * is the ring card whose texture it shares; `deckIndex 0` is the featured "main".
 */
export type DeckCardController = {
  root: Transform;
  mesh: Mesh;
  deckIndex: number;
  origIndex: number;
  isMain: boolean;
  hoverSpring: Spring;
  pos: { x: number; y: number; z: number };
};

export type RingSceneOptions = {
  canvas: HTMLCanvasElement;
  imageSources: string[];
  featuredIndex?: number;
  count?: number;
};

export type RingSceneProgress = {
  zoom: number;
  stack: number;
  /** Flat horizontal row beat between the tight album and the diagonal spread. */
  row: number;
  /** Diagonal "iso" layout that takes the flat row and fans it up-right. */
  iso: number;
  intro: number;
};

export type RingPointerState = {
  /** Offset from viewport center in CSS pixels. */
  x: number;
  /** Offset from viewport center in CSS pixels (Y up — DOM Y is flipped). */
  y: number;
  /** True while the pointer is over the stage. */
  inside: boolean;
};

export type RingSceneController = {
  setSize: (width: number, height: number) => void;
  setProgress: (progress: Partial<RingSceneProgress>) => void;
  getProgress: () => RingSceneProgress;
  setHoveredIndex: (index: number) => void;
  setPointer: (state: RingPointerState) => void;
  pickAt: (clientX: number, clientY: number) => number | null;
  getCardScreenPositions: () => {
    index: number;
    x: number;
    y: number;
    visible: boolean;
    opacity: number;
  }[];
  getCardScreenRect: (deckIndex: number) => {
    left: number;
    top: number;
    width: number;
    height: number;
    imageIndex: number;
  } | null;
  update: (deltaMs: number) => void;
  setConfig: (partial: Partial<RingSceneConfig>) => void;
  getConfig: () => RingSceneConfig;
  destroy: () => void;
  getFeaturedIndex: () => number;
  getCardCount: () => number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function ringAngleAtIndex(index: number, count: number) {
  return ((index - count * 0.75) * Math.PI * 2) / count;
}

function shortestAngleDelta(from: number, to: number) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function loadTexture(gl: OGLRenderingContext, src: string): { texture: Texture; promise: Promise<void> } {
  const texture = new Texture(gl, { generateMipmaps: false });
  const image = new Image();
  image.crossOrigin = "anonymous";

  const promise = new Promise<void>((resolve) => {
    image.onload = () => {
      texture.image = image;
      texture.needsUpdate = true;
      resolve();
    };
    image.onerror = () => {
      resolve();
    };
  });

  image.src = src;
  return { texture, promise };
}

export function createRingScene({
  canvas,
  imageSources,
  featuredIndex = RING_FEATURED_INDEX,
  count = RING_CARD_COUNT,
}: RingSceneOptions): RingSceneController {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new Renderer({
    canvas,
    dpr,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  const gl = renderer.gl;
  gl.clearColor(...RING_CLEAR_COLOR);

  const camera = new Camera(gl, { fov: RING_CAMERA_FOV, near: 1, far: 8000 });
  camera.position.set(0, 0, 800);
  camera.lookAt([0, 0, 0]);

  // Second camera used only for its orthographic projection matrix. example-2
  // blends perspective→orthographic as the ring zooms in (bundle ~4036-4054)
  // so the featured card loses perspective skew at full zoom. We keep both
  // projection matrices and mix them into `camera.projectionMatrix` per frame.
  const orthoCamera = new Camera(gl);
  const perspProjection = new Float32Array(16);
  const orthoProjection = new Float32Array(16);

  const scene = new Transform();

  /**
   * Transform hierarchy:
   *   ringRoot      — mouse-driven tilt + zoom scale + zoom translation
   *     wrapperRoot — Y-rotation that brings the featured card to center on zoom
   *       containerRoot — additional X-tilt added during stack phase
   *         per-card meshes — positioned on a vertical ring in the XY plane;
   *                           Plane normals face +Z so every card faces camera.
   *
   * The vertical (XY) ring keeps Plane orientation natural (no need to rebuild
   * geometry or add per-card pre-rotations). Forward perspective comes from a
   * small X-tilt on the ringRoot.
   */
  const ringRoot = new Transform();
  ringRoot.setParent(scene);
  const wrapperRoot = new Transform();
  wrapperRoot.setParent(ringRoot);
  const containerRoot = new Transform();
  containerRoot.setParent(wrapperRoot);

  // Two-set hand-off (faithful to example-2): the ring set above lives on the
  // ring and fades OUT as the stack begins; a SEPARATE deck set (`deckRoot`,
  // screen-aligned, a direct child of the scene like the bundle's PlaneStacked
  // wrapper) fades IN and does the stack → row → diagonal. The deck-main card is
  // born at screen-centre exactly where the zoom parks the ring-featured card,
  // so the centred card is genuinely immovable through the hand-off.
  const deckRoot = new Transform();
  deckRoot.setParent(scene);

  /**
   * Card geometry. Sized so 24 cards fit cleanly on a 320–380px radius ring
   * with visible gap between every card. Aspect ≈ 0.75 to match the example-2
   * frame. The smaller footprint also keeps top-row cards clear of the top nav
   * on standard 800px-tall windows.
   */
  const cardWidth = 75;
  const cardHeight = 100;
  // Flat plane. The "album/slab" look is not real geometry — it comes from the
  // frosted-glass shader (`uFrost`) plus card overlap + deck tilt once the cards
  // gather. On the idle ring + intro the card is a clean plane.
  const cardGeometry = new Plane(gl, {
    width: cardWidth,
    height: cardHeight,
  });

  const cards: RingCardController[] = [];

  // Unique column per card (a permutation of 0..count-1) → no two cards share an
  // X slot. Shuffled so neighbouring indices don't sit in neighbouring columns.
  const introColumns = Array.from({ length: count }, (_, i) => i);
  for (let i = introColumns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [introColumns[i], introColumns[j]] = [introColumns[j], introColumns[i]];
  }

  /**
   * Ring tilt. Nearly upright, tipped so the TOP arc of the ring faces the
   * camera (positive X) — matching the reference, where the featured card
   * sweeps in from the top rather than the bottom.
   */
  const baseRotationX = radians(6);
  ringRoot.rotation.x = baseRotationX;

  const pendingTexturePromises: Promise<void>[] = [];

  for (let i = 0; i < count; i++) {
    const src = imageSources[i % imageSources.length];
    const { texture, promise } = loadTexture(gl, src);
    pendingTexturePromises.push(promise);

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      transparent: true,
      // Painter's algorithm: no depth buffer, draw order is pure renderOrder, so
      // every card stays the same size (no perspective size fighting). cullFace
      // off so a card flipped ~180° by hover still shows its (mirrored) back.
      cullFace: null,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: texture },
        uOpacity: { value: 1 },
        uLoadOpacity: { value: 0 },
        uLight: { value: 0 },
        uHasMap: { value: 0 },
        uFrost: { value: 0 },
        uFallbackColor: { value: [0.86, 0.89, 0.95] },
        uHalfSize: { value: [cardWidth * 0.5, cardHeight * 0.5] },
        uCornerRadius: { value: CARD_CORNER_RADIUS },
        uBorder: { value: 0 },
        uBorderWidth: { value: DEFAULT_RING_CONFIG.borderWidth },
        uBorderColor: { value: DEFAULT_RING_CONFIG.borderColor },
        uSlabEdge: { value: 0 },
      },
    });

    promise.then(() => {
      program.uniforms.uHasMap.value = 1;
    });

    // example-2 nests the plane inside the card transform so the hover
    // "plane" offsets (forward push + face turn) are applied in the card's
    // LOCAL frame, after the card is placed and rolled on the ring. We mirror
    // that: `root` carries the ring placement, `mesh` carries only the hover.
    const root = new Transform();
    root.setParent(containerRoot);
    const mesh = new Mesh(gl, { geometry: cardGeometry, program });
    mesh.setParent(root);

    const angle = ringAngleAtIndex(i, count);
    const card: RingCardController = {
      root,
      mesh,
      index: i,
      isFeatured: i === featuredIndex,
      ringAngle: angle,
      ringX: 0,
      ringY: 0,
      ringZ: 0,
      // Cards rotate so their Y-axis aligns with the circle's tangent at this
      // position — gives the "clock stripe" look where each card faces along
      // the ring rather than sitting flat-horizontal.
      faceRotationZ: angle - Math.PI / 2,
      introCol: introColumns[i],
      introRow: Math.floor(Math.random() * INTRO_GRID_ROWS),
      introDelayN: Math.random(),
      hoverSpring: new Spring({ stiffness: 130, criticalDamping: true }),
      pos: { x: 0, y: 0, z: 0 },
    };
    cards.push(card);
  }

  // ─── Deck set (example-2 `PlaneStacked` `r`) ──────────────────────────────
  // A second card set, screen-aligned under `deckRoot`. Deck slot 0 is the MAIN
  // card (featured texture), born at centre; the rest map to the remaining ring
  // textures in deck order. Each deck card reuses the ring card's GPU texture
  // (no second download). Like the ring cards, placement lives on `root`, the
  // row-hover peek on the inner `mesh`.
  const deckCards: DeckCardController[] = [];
  for (let d = 0; d < count; d++) {
    const origIndex = d === 0 ? featuredIndex : d <= featuredIndex ? d - 1 : d;
    const sharedTexture = cards[origIndex].mesh.program.uniforms.tMap.value as Texture;
    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      transparent: true,
      cullFace: null,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: sharedTexture },
        uOpacity: { value: 0 },
        uLoadOpacity: { value: 1 },
        uLight: { value: 0 },
        uHasMap: { value: 0 },
        uFrost: { value: 0 },
        uFallbackColor: { value: [0.86, 0.89, 0.95] },
        uHalfSize: { value: [cardWidth * 0.5, cardHeight * 0.5] },
        uCornerRadius: { value: CARD_CORNER_RADIUS },
        uBorder: { value: 0 },
        uBorderWidth: { value: DEFAULT_RING_CONFIG.borderWidth },
        uBorderColor: { value: DEFAULT_RING_CONFIG.borderColor },
        uSlabEdge: { value: 0 },
      },
    });
    const root = new Transform();
    root.setParent(deckRoot);
    const mesh = new Mesh(gl, { geometry: cardGeometry, program });
    mesh.setParent(root);
    deckCards.push({
      root,
      mesh,
      deckIndex: d,
      origIndex,
      isMain: d === 0,
      hoverSpring: new Spring({ stiffness: 130, criticalDamping: true }),
      pos: { x: 0, y: 0, z: 0 },
    });
  }
  let needsDeckSnap = true;

  // ── Indicator wheel (number + text) DISABLED in the spread ──────────────────
  // Replaced by the click-to-open lightbox (handled in ring-experience.tsx).
  // Re-enable by uncommenting this + the `wheel.*` calls in update()/destroy()
  // and the import at the top.
  // const wheel = createIndicatorWheel(gl, { parent: scene, words: INDICATOR_WORDS });
  // let indicatorCard = -1;

  // Liquid-glass edge window — a post pass used only during the flat-row stop.
  const glass = createGlassPass(gl, renderer);

  const progressState: RingSceneProgress = { zoom: 0, stack: 0, row: 0, iso: 0, intro: 0 };
  const config: RingSceneConfig = { ...DEFAULT_RING_CONFIG };
  const pointer: RingPointerState = { x: 0, y: 0, inside: false };
  // Damped pointer — example-2 drives the ring torque + hover from `mouseDamp`
  // (an eased follow of the cursor), not the raw pointer, so motion settles in
  // instead of snapping when the cursor jumps.
  const pointerDamp = { x: 0, y: 0 };
  let hoveredIndex = -1;
  // On the first frame we snap each card's damped position straight to its
  // target so the intro starts from the scattered layout (no settle from 0,0).
  let needsPositionSnap = true;
  let viewportWidth = canvas.clientWidth || window.innerWidth;
  let viewportHeight = canvas.clientHeight || window.innerHeight;

  function computeRingRadius(width: number, height: number) {
    // Lower bound: cards just touch along the circumference at this radius
    // (2π·r ≈ count·cardWidth). Larger is better but we'll cap by viewport
    // height so the ring always fits.
    const minRadius = (count * cardWidth) / (2 * Math.PI);

    // 0.40 of the viewport height keeps the ring inside the visible area even
    // with the small -6° X tilt and a tiny downward bias added later.
    const heightCap = height * 0.5;

    // Clamp: at least minRadius (cards touch, no overlap), at most heightCap
    // (no clipping), and never bigger than 460 (visual consistency).
    const target = Math.max(minRadius, Math.min(heightCap, 460));

    if (width >= 1280) return target;
    if (width >= 768) {
      return Math.min(target, Math.max(width, height) * 0.5 - 120 * 1.3);
    }
    return Math.min(target, Math.max(width, height) * 0.5 - 120);
  }

  function configureCamera(width: number, height: number) {
    camera.perspective({
      aspect: width / height,
      fov: RING_CAMERA_FOV,
      near: 1,
      far: 8000,
    });
    const distance = height / (2 * Math.tan((RING_CAMERA_FOV * Math.PI) / 180 / 2));
    camera.position.set(0, 0, distance);
    camera.lookAt([0, 0, 0]);
    // Snapshot the perspective projection, then build a matching orthographic
    // one (same view volume in CSS px so 1 unit stays 1 px at the focal plane).
    perspProjection.set(camera.projectionMatrix);
    orthoCamera.orthographic({
      left: -width / 2,
      right: width / 2,
      top: height / 2,
      bottom: -height / 2,
      near: 1,
      far: 8000,
    });
    orthoProjection.set(orthoCamera.projectionMatrix);
  }

  function setSize(width: number, height: number) {
    viewportWidth = width;
    viewportHeight = height;
    renderer.setSize(width, height);
    configureCamera(width, height);
    layoutCardsBase();
    glass.setSize(width, height);
    // wheel.layout(width, height);
  }

  function layoutCardsBase() {
    const radius = computeRingRadius(viewportWidth, viewportHeight);
    cards.forEach((card) => {
      const theta = card.ringAngle;
      // Vertical ring in the XY plane (clock-face). Slight Z-fan so cards on
      // the far side recede into the background after the ring is tilted.
      card.ringX = Math.cos(theta) * radius;
      card.ringY = Math.sin(theta) * radius;
      card.ringZ = 0;
    });
  }

  function setProgress(partial: Partial<RingSceneProgress>) {
    if (partial.zoom !== undefined) progressState.zoom = clamp01(partial.zoom);
    if (partial.stack !== undefined) progressState.stack = clamp01(partial.stack);
    if (partial.row !== undefined) progressState.row = clamp01(partial.row);
    if (partial.iso !== undefined) progressState.iso = clamp01(partial.iso);
    if (partial.intro !== undefined) progressState.intro = clamp01(partial.intro);
  }

  function getProgress(): RingSceneProgress {
    return { ...progressState };
  }

  function setHoveredIndex(index: number) {
    hoveredIndex = index;
  }

  function setConfig(partial: Partial<RingSceneConfig>) {
    Object.assign(config, partial);
    // Uniform-backed fields — push to every card immediately.
    if (partial.cornerRadius !== undefined) {
      for (const card of cards) {
        card.mesh.program.uniforms.uCornerRadius.value = config.cornerRadius;
      }
    }
    if (partial.borderWidth !== undefined) {
      for (const card of cards) {
        card.mesh.program.uniforms.uBorderWidth.value = config.borderWidth;
      }
    }
    if (partial.borderColor !== undefined) {
      for (const card of cards) {
        card.mesh.program.uniforms.uBorderColor.value = config.borderColor;
      }
    }
  }

  function getConfig(): RingSceneConfig {
    return { ...config };
  }

  function setPointer(state: RingPointerState) {
    pointer.x = state.x;
    pointer.y = state.y;
    pointer.inside = state.inside;
  }

  /**
   * Project a card-LOCAL point (px, relative to the card centre) to screen px,
   * using the camera's live `projectionViewMatrix` — so it matches whatever is
   * actually drawn, perspective OR orthographic. Returns null when behind the
   * camera. Requires `scene`/`camera` matrices to be up to date.
   */
  function projectLocal(
    card: RingCardController | DeckCardController,
    lx: number,
    ly: number,
    rect: DOMRect,
  ) {
    const m = card.mesh.worldMatrix;
    // mesh-local (lx, ly, 0) → world
    const wx = m[0] * lx + m[4] * ly + m[12];
    const wy = m[1] * lx + m[5] * ly + m[13];
    const wz = m[2] * lx + m[6] * ly + m[14];
    // world → clip (column-major projectionViewMatrix · vec4)
    const pv = camera.projectionViewMatrix as unknown as number[];
    const cx = pv[0] * wx + pv[4] * wy + pv[8] * wz + pv[12];
    const cy = pv[1] * wx + pv[5] * wy + pv[9] * wz + pv[13];
    const cw = pv[3] * wx + pv[7] * wy + pv[11] * wz + pv[15];
    if (cw <= 0) return null;
    return {
      x: (cx / cw * 0.5 + 0.5) * rect.width,
      y: (0.5 - cy / cw * 0.5) * rect.height,
    };
  }

  /** True if (px, py) is inside the convex quad (4 ordered screen corners). */
  function pointInQuad(px: number, py: number, quad: { x: number; y: number }[]) {
    let sign = 0;
    for (let i = 0; i < 4; i++) {
      const a = quad[i];
      const b = quad[(i + 1) % 4];
      const cross = (b.x - a.x) * (py - a.y) - (b.y - a.y) * (px - a.x);
      if (Math.abs(cross) < 1e-6) continue;
      const s = Math.sign(cross);
      if (sign === 0) sign = s;
      else if (s !== sign) return false;
    }
    return true;
  }

  /**
   * Screen-space picking against each card's true projected **quad** (not an
   * axis-aligned rect), so rotated/tilted cards in the spread are hit accurately.
   * Among cards under the cursor we return the **frontmost** (highest
   * `renderOrder`) — matching what's drawn on top, no flicker.
   */
  function pickAt(clientX: number, clientY: number): number | null {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const hw = cardWidth * 0.5;
    const hh = cardHeight * 0.5;

    scene.updateMatrixWorld();
    camera.updateMatrixWorld();

    let bestIndex: number | null = null;
    let bestOrder = -Infinity;

    // Pick against the DECK set — that's what's on screen in the spread, and the
    // hovered deck index is what the indicator wheel + row-hover key off.
    deckCards.forEach((dc) => {
      if (dc.mesh.renderOrder <= bestOrder) return; // can't win — skip projection
      const c0 = projectLocal(dc, -hw, -hh, rect);
      const c1 = projectLocal(dc, hw, -hh, rect);
      const c2 = projectLocal(dc, hw, hh, rect);
      const c3 = projectLocal(dc, -hw, hh, rect);
      if (!c0 || !c1 || !c2 || !c3) return;
      if (pointInQuad(px, py, [c0, c1, c2, c3])) {
        bestOrder = dc.mesh.renderOrder;
        bestIndex = dc.deckIndex;
      }
    });

    return bestIndex;
  }

  /**
   * Screen-space centre of every card (for debug number labels). Projected with
   * the live camera matrix so labels track the cards under any projection.
   */
  function getCardScreenPositions(): {
    index: number;
    x: number;
    y: number;
    visible: boolean;
    opacity: number;
  }[] {
    const rect = canvas.getBoundingClientRect();
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    // One label per ORIGINAL card index (stable identity — same image, same
    // number on both sets). Track whichever set is currently more visible: the
    // ring card on the idle ring/zoom, the matching deck card once it forms.
    return cards.map((card) => {
      const deckIndex =
        card.index === featuredIndex
          ? 0
          : card.index < featuredIndex
            ? card.index + 1
            : card.index;
      const deckCard = deckCards[deckIndex];
      const ringOpacity = card.mesh.program.uniforms.uOpacity.value as number;
      const deckOpacity = deckCard.mesh.program.uniforms.uOpacity.value as number;
      const useDeck = deckOpacity >= ringOpacity;
      const target = useDeck ? deckCard : card;
      const p = projectLocal(target, 0, 0, rect);
      return {
        index: card.index,
        x: p ? p.x : 0,
        y: p ? p.y : 0,
        visible: p !== null,
        opacity: Math.max(ringOpacity, deckOpacity),
      };
    });
  }

  /**
   * Axis-aligned screen rect (CLIENT coords) of a deck card's projected quad, plus
   * the original image index it shows. Used to animate the lightbox open from the
   * exact spot the clicked card sits on screen. Returns null if off-screen.
   */
  function getCardScreenRect(deckIndex: number) {
    const dc = deckCards[deckIndex];
    if (!dc) return null;
    const rect = canvas.getBoundingClientRect();
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    const hw = cardWidth * 0.5;
    const hh = cardHeight * 0.5;
    const corners = [
      projectLocal(dc, -hw, -hh, rect),
      projectLocal(dc, hw, -hh, rect),
      projectLocal(dc, hw, hh, rect),
      projectLocal(dc, -hw, hh, rect),
    ];
    if (corners.some((c) => c === null)) return null;
    const xs = corners.map((c) => rect.left + c!.x);
    const ys = corners.map((c) => rect.top + c!.y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    return {
      left,
      top,
      width: Math.max(...xs) - left,
      height: Math.max(...ys) - top,
      imageIndex: dc.origIndex,
    };
  }

  function update(deltaMs: number) {
    const zoom = progressState.zoom;
    const stack = progressState.stack;
    const row = progressState.row;
    const iso = progressState.iso;
    const intro = progressState.intro;

    const radius = computeRingRadius(viewportWidth, viewportHeight);

    /**
     * Mouse-driven ring rotation (matches example §5: log-scaled X offset
     * normalized against ringRadius, attenuated by (1 - zoom)).
     */
    const pointerTargetX = pointer.inside ? pointer.x : 0;
    const pointerTargetY = pointer.inside ? pointer.y : 0;
    // Exponential follow (~90ms time constant), frame-rate independent.
    const pointerDampFactor = 1 - Math.exp(-deltaMs / 90);
    pointerDamp.x += (pointerTargetX - pointerDamp.x) * pointerDampFactor;
    pointerDamp.y += (pointerTargetY - pointerDamp.y) * pointerDampFactor;
    const pointerOffsetX = pointerDamp.x;
    const pointerOffsetY = pointerDamp.y;
    const absOffset = Math.abs(pointerOffsetX);
    const normalized =
      radius > 0
        ? absOffset < radius
          ? absOffset / radius
          : Math.log(absOffset / radius) + 1
        : 0;
    const ringForce = Math.sign(pointerOffsetX) * normalized * (1 - zoom);

    // ─── Stage 1: zoom (RingZoom `Ir`) ───────────────────────────────────────
    // Scale the whole ring up, rotate featured toward the top, and lift it to
    // screen-centre. The centring frame (wrapper rotation + ring lift) then
    // UNWINDS as the deck forms (`* (1 - stackEase)`) so by stack=1 the frame is
    // screen-aligned and the diagonal row can be laid out in clean px space.
    const zoomEase = easeOutCubic(zoom);
    const stackEase = easeOutCubic(stack);
    // Three deck beats: ring → tight album (gatherT) → flat horizontal row
    // (flatRowT) → diagonal slab spread (spreadT). Each overlaps the next.
    const gatherT = stackEase; // ring → stack behind featured
    const flatRowT = easePow1InOut(row); // stack → flat horizontal row
    const spreadT = easePow1InOut(iso); // flat row → diagonal spread
    // Album-formation beats, all on the gather timeline (the transition the user
    // storyboarded #26-#29): non-featured cards fade fully OUT by `soloFadeEnd`
    // (featured alone, #27), then from `reappearStart` they fade back IN stacked
    // behind featured (#29) while the featured slab rotates in. A solo gap exists
    // because reappearStart ≥ soloFadeEnd.
    const fadeOutT = easePow1InOut(clamp01(gatherT / Math.max(0.001, config.soloFadeEnd)));
    const reappearT = easePow1InOut(
      clamp01((gatherT - config.reappearStart) / Math.max(0.001, 1 - config.reappearStart)),
    );
    // The deck "forms" as the cards reappear, then holds through the row + spread.
    // Drives the slab rotation (featured turns flat→tilted, #27→#28), the deck
    // tilt, and the gap opening (book-edge thickness, #29).
    const deckFormT = Math.max(reappearT, flatRowT, spreadT);
    const gapT = deckFormT;
    const stackGap = lerp(config.stackGapTight, config.stackGapOpen, gapT);
    // Intro "row → ring" progress (global mirror of the per-card `introToRing`).
    // 0 through the fade + grid→row collapse, ramps only in the final row→ring
    // beat — so the ring tilt, rest offset, and ALL mouse torque stay off until
    // the ring actually forms (no hover/tilt reaction during the intro).
    const introRingT = easePow1InOut(
      clamp01((intro - config.introRingStart) / Math.max(0.001, 1 - config.introRingStart)),
    );
    // Ring zooms up to centre featured; once the album forms it pulls back to a
    // comfortable size. Positions are divided by this scale so layout holds.
    const zoomScale =
      computeZoomScale(zoom, config.zoomScaleMax) * lerp(1, config.rowScalePullback, spreadT);
    ringRoot.scale.set(zoomScale, zoomScale, zoomScale);

    const baseTilt = radians(config.baseTiltXDeg);
    const flattenT = clamp01(zoom * 0.8);
    // Tilt fades in with the ring (introRingT): flat row during the intro.
    const activeBaseTilt = baseTilt * (1 - flattenT) * introRingT;
    // Mouse torque multipliers match example-2 `Ar`: x 0.032π, y 0.025π.
    // Suppressed during the intro so the centred row sits still and flat.
    // Two-set: the ring no longer unwinds into a deck — it just fades out in
    // place, so the centring frame holds (no `* (1 - gatherT)`).
    ringRoot.rotation.x = activeBaseTilt + ringForce * Math.PI * 0.032 * introRingT;
    ringRoot.rotation.y = ringForce * Math.PI * 0.025 * introRingT;

    // Featured → top of the ring, then the ring drops so featured lands centre
    // (sweeps DOWN from the top). The centring frame UNWINDS during the gather,
    // so the album/deck is laid out in clean screen-aligned space.
    const featuredAngle = ringAngleAtIndex(featuredIndex, count);
    const targetWrapperRotation = shortestAngleDelta(featuredAngle, Math.PI / 2);
    const wrapperZoomRotation = lerp(0, targetWrapperRotation, clamp01((zoom - 0.2) / 0.8));
    wrapperRoot.rotation.z = wrapperZoomRotation + ringForce * Math.PI * 0.035 * introRingT;

    const featuredLocalY = radius * Math.cos(activeBaseTilt); // featured at top (+r)
    const centerYTarget = -zoomScale * featuredLocalY;
    const ringRestOffsetY = -viewportHeight * 0.05;
    // Rest offset (ring sits slightly low) also fades in with the ring, so the
    // intro row is centred on screen like the flat DOM original.
    ringRoot.position.y =
      ringRestOffsetY * (1 - zoomEase) * introRingT + centerYTarget * zoomEase;
    ringRoot.position.z = 0;

    // The ring container no longer tilts — the deck owns the slab tilt now.
    containerRoot.rotation.set(0, 0, 0);

    // ─── Deck frame (example-2 PlaneStacked wrapper) ─────────────────────────
    // Screen-aligned, scaled like the ring so the deck-main matches the parked
    // ring-featured size at the hand-off. The slab tilt pivots on the deck origin
    // (= screen centre = the main card), so the featured card rotates IN PLACE to
    // reveal the slab (#28) while the z-stepped cards behind swing into a spine
    // (#29). `deckTiltT` ramps on `deckFormT` (gather end → row → spread).
    const deckTiltT = deckFormT;
    deckRoot.scale.set(zoomScale, zoomScale, zoomScale);
    deckRoot.position.set(0, 0, 0);
    deckRoot.rotation.x = radians(config.containerLeanXDeg) * deckTiltT;
    deckRoot.rotation.y = radians(config.spineTiltDeg) * deckTiltT;
    deckRoot.rotation.z = 0;

    const rowHoverActive = iso > 0.5;

    // ════ RING SET ════ intro → ring → idle hover → fade out + neighbour swing.
    // The ring set no longer collapses into a deck; it lives on the ring and
    // dissolves as the stack begins (the deck set below takes over).
    cards.forEach((card) => {
      const isFeatured = card.index === featuredIndex;
      // Render-order slot only (featured draws on top within the ring set).
      const deckIndex = isFeatured
        ? 0
        : card.index < featuredIndex
          ? card.index + 1
          : card.index;

      // ─── Intro: scattered grid → centred row → ring ──────────────────────
      const introCollapse = easePow1InOut(
        clamp01(
          (intro - config.introFadeEnd) /
            Math.max(0.001, config.introCollapseEnd - config.introFadeEnd),
        ),
      );
      const introToRing = easePow1InOut(
        clamp01((intro - config.introRingStart) / Math.max(0.001, 1 - config.introRingStart)),
      );
      const colStep = cardWidth + config.introGap;
      const rowStep = cardHeight + config.introGap;
      const gridX = (card.introCol - (count - 1) / 2) * colStep;
      const gridY = ((INTRO_GRID_ROWS - 1) / 2 - card.introRow) * rowStep;
      const collapsedY = lerp(gridY, 0, introCollapse);

      // ─── Fade-out + neighbour swing (example-2 G.opacity, L3595-3606) ─────
      // As the stack begins, the ±6 neighbours of featured swing ±π/2 around the
      // ring while the whole ring fades, so it "peels" away under the incoming
      // deck. Featured ring card stays put (the deck-main covers it).
      const swingF = isFeatured
        ? 0
        : Math.pow(clamp01(gatherT / Math.max(0.001, config.soloFadeEnd)), 2);
      let indexDelta = card.index - featuredIndex;
      const half = Math.floor(count / 2);
      indexDelta = ((((indexDelta % count) + count) % count) + half) % count - half;
      const isNeighbour = indexDelta !== 0 && Math.abs(indexDelta) <= 6;
      const swungAngle = card.ringAngle + (isNeighbour ? Math.sign(indexDelta) * Math.PI * 0.5 : 0);
      const liveAngle = lerp(card.ringAngle, swungAngle, swingF);
      const ringPosX = Math.cos(liveAngle) * radius;
      const ringPosY = Math.sin(liveAngle) * radius;

      const baseX = lerp(gridX, ringPosX, introToRing);
      const baseY = lerp(collapsedY, ringPosY, introToRing);

      const dampRate = 0.2;
      if (needsPositionSnap) {
        card.pos.x = baseX;
        card.pos.y = baseY;
        card.pos.z = 0;
      } else {
        card.pos.x = dampToward(card.pos.x, baseX, dampRate, deltaMs);
        card.pos.y = dampToward(card.pos.y, baseY, dampRate, deltaMs);
        card.pos.z = dampToward(card.pos.z, 0, dampRate, deltaMs);
      }
      card.root.position.set(card.pos.x, card.pos.y, card.pos.z);
      card.root.rotation.z = (liveAngle - Math.PI / 2) * introToRing;

      // ─── Ring-idle hover (example-2 `Ar`) ────────────────────────────────
      const currentTheta = card.ringAngle + wrapperRoot.rotation.z;
      const cardLiveX = radius * Math.cos(currentTheta);
      const cardLiveY = radius * Math.sin(currentTheta);
      const introDone = intro > 0.999;
      const influence =
        pointer.inside && introDone
          ? computeCardPlaneInfluence({
              cardX: cardLiveX,
              cardY: cardLiveY,
              pointerOffsetX,
              pointerOffsetY,
              ringRadius: radius,
              mouseForce: intro,
              zoomProgress: zoom,
            })
          : 0;
      const planeForwardZ = computeCardPlaneForwardZ({ influence, zoomProgress: zoom });
      const planeFaceY = computeCardPlaneFaceRotation({ influence, zoomProgress: zoom });
      card.mesh.position.set(0, 0, planeForwardZ);
      card.mesh.rotation.y = planeFaceY;

      // Opacity: non-featured fade out by `soloFadeEnd`; featured hands off to the
      // deck-main a touch later (once the opaque deck-main covers it). Ring stays
      // a clean plane — no frost/border/edge.
      const ringFeatOut = easePow1InOut(clamp01((gatherT - 0.12) / 0.18));
      const program = card.mesh.program;
      program.uniforms.uOpacity.value = isFeatured ? 1 - ringFeatOut : 1 - fadeOutT;
      program.uniforms.uLight.value = 0;
      program.uniforms.uFrost.value = 0;
      program.uniforms.uBorder.value = 0;
      program.uniforms.uSlabEdge.value = 0;

      const fadeEnd = config.introFadeEnd;
      const introLocal = clamp01(
        (intro - card.introDelayN * 0.6 * fadeEnd) / Math.max(0.001, 0.4 * fadeEnd),
      );
      program.uniforms.uLoadOpacity.value = introLocal;
      card.mesh.renderOrder = count - deckIndex;
    });
    needsPositionSnap = false;

    // ════ DECK SET ════ stack (z-book behind main) → flat row → diagonal.
    // Main (deckIndex 0) fades in first at centre (crossfades with ring-featured);
    // the rest fade in from `reappearStart`, stacked behind, as the slab tilts.
    const deckMainIn = easePow1InOut(clamp01(gatherT / 0.12));
    deckCards.forEach((dc) => {
      const d = dc.deckIndex;
      // Stack: every card dead-centre behind main, stepped back in z (the book);
      // z-gap grows with `stackGap`. Then flat horizontal row, then diagonal.
      const stackZpx = -d * (FLAT_ROW_DEPTH_STEP * stackGap);
      const flat = computeFlatRowTarget({
        index: d,
        count,
        cardStep: FLAT_ROW_CARD_STEP,
        depthStep: FLAT_ROW_DEPTH_STEP * stackGap,
      });
      const diag = computeRowTarget({
        index: d,
        count,
        part4: 1,
        viewportWidth,
        viewportHeight,
        cardHalf: Math.max(cardWidth, cardHeight) * config.rowMarginFactor,
      });
      const rx = lerp(0, flat.x, flatRowT);
      const ry = lerp(0, flat.y, flatRowT);
      const rz = lerp(stackZpx, flat.z, flatRowT);
      // ÷zoomScale because deckRoot is scaled like the ring (keeps px constant).
      const targetX = lerp(rx, diag.x, spreadT) / zoomScale;
      const targetY = lerp(ry, diag.y, spreadT) / zoomScale;
      const targetZ = lerp(rz, 0, spreadT) / zoomScale;

      const dampRate = lerp(0.2, 0.06, deckFormT);
      if (needsDeckSnap) {
        dc.pos.x = targetX;
        dc.pos.y = targetY;
        dc.pos.z = targetZ;
      } else {
        dc.pos.x = dampToward(dc.pos.x, targetX, dampRate, deltaMs);
        dc.pos.y = dampToward(dc.pos.y, targetY, dampRate, deltaMs);
        dc.pos.z = dampToward(dc.pos.z, targetZ, dampRate, deltaMs);
      }
      dc.root.position.set(dc.pos.x, dc.pos.y, dc.pos.z);
      dc.root.rotation.set(0, 0, 0);

      // Row-hover peek: spring (130, critical) → local +X slide. No reorder.
      dc.hoverSpring.target = rowHoverActive && hoveredIndex === d ? ROW_HOVER_TARGET : 0;
      const peek = dc.hoverSpring.step(deltaMs) * config.hoverSlide;
      dc.mesh.position.set(peek, 0, 0);

      const program = dc.mesh.program;
      // Share the ring card's texture-loaded flag (textures are shared).
      program.uniforms.uHasMap.value = cards[dc.origIndex].mesh.program.uniforms.uHasMap.value;
      program.uniforms.uOpacity.value = dc.isMain ? deckMainIn : reappearT;
      program.uniforms.uLight.value = 0;
      // Frost + border come in as the slab forms; side-edge tracks the deck tilt.
      program.uniforms.uFrost.value = deckFormT;
      program.uniforms.uBorder.value = deckFormT;
      program.uniforms.uSlabEdge.value = deckTiltT * config.slabEdge;
      program.uniforms.uBorderWidth.value = config.borderWidth;
      program.uniforms.uBorderColor.value = config.borderColor;
      program.uniforms.uCornerRadius.value = config.cornerRadius;
      // Above the ring set; main (slot 0) on top of the deck.
      dc.mesh.renderOrder = 100 + (count - d);
    });
    needsDeckSnap = false;

    // ─── Camera: perspective (ring) → orthographic (album + spread) ──────────
    // Orthographic once the album forms so every card renders the SAME size
    // regardless of its place in the stack (no perspective falloff). The ring
    // itself stays in perspective for depth.
    const orthoT = Math.max(orthographicBlendT(zoom), gatherT, flatRowT, spreadT);
    mixProjectionMatrices(
      perspProjection,
      orthoProjection,
      orthoT,
      camera.projectionMatrix as unknown as number[],
    );

    // ─── Indicator wheel (number + text) DISABLED — see lightbox in React ─────
    // const spreadActive = iso > 0.5;
    // wheel.setVisible(spreadActive ? easePow1InOut(clamp01((iso - 0.5) / 0.5)) : 0);
    // if (spreadActive && hoveredIndex >= 0) {
    //   if (hoveredIndex !== indicatorCard) { wheel.spinTo(hoveredIndex); indicatorCard = hoveredIndex; }
    // } else { indicatorCard = -1; }
    // wheel.update(deltaMs);

    // ─── Liquid-glass edge window (flat-row stop only) ───────────────────────
    // Ramps in over the flat row, fades out as the diagonal spread begins. When
    // off we render straight to screen (no extra pass).
    const glassT = flatRowT * (1 - spreadT);
    if (glassT > 0.001) {
      // Same damped pointer the ring uses → consistent "lean toward cursor" feel.
      // Normalize to -1..1 and flip Y to screen-down for the shader.
      const glassPointerX = Math.max(-1, Math.min(1, pointerDamp.x / Math.max(1, viewportWidth * 0.5)));
      const glassPointerY = Math.max(-1, Math.min(1, -pointerDamp.y / Math.max(1, viewportHeight * 0.5)));
      glass.renderToTarget(scene, camera);
      glass.renderGlass(
        glassT,
        {
          halfW: config.glassHalfW,
          halfH: config.glassHalfH,
          radius: config.glassRadius,
          center: config.glassCenter,
          strength: config.glassStrength,
          bow: config.glassBow,
          rim: config.glassRim,
          rimColor: config.glassRimColor,
          follow: config.glassFollow,
        },
        glassPointerX,
        glassPointerY,
      );
    } else {
      renderer.render({ scene, camera });
    }
  }

  function destroy() {
    cards.forEach((card) => {
      const program = card.mesh.program;
      const texture = program.uniforms.tMap.value as Texture;
      gl.deleteTexture(texture.texture);
      gl.deleteProgram(program.program);
    });
    // Deck programs only — their textures are SHARED with the ring set (already
    // freed above), so don't double-delete them.
    deckCards.forEach((dc) => {
      gl.deleteProgram(dc.mesh.program.program);
    });
    glass.destroy();
    // wheel.destroy();
    // NOTE: do NOT call WEBGL_lose_context.loseContext() here. The <canvas> is a
    // persistent DOM node reused across React 19 StrictMode's mount→unmount→mount
    // dev cycle (and any future remount). Force-losing the context kills it for
    // the next createRingScene on the SAME canvas, so every program then fails to
    // link (uniformLocations undefined → Program.use forEach crash). On a real
    // unmount the canvas is removed and its GL context is reclaimed by the GC.
  }

  // Initial layout pass before the first scroll/pointer event.
  setSize(viewportWidth, viewportHeight);
  Promise.all(pendingTexturePromises).then(() => {
    /* textures ready — uHasMap is flipped per-card on resolve */
  });

  return {
    setSize,
    setProgress,
    getProgress,
    setHoveredIndex,
    setPointer,
    pickAt,
    getCardScreenPositions,
    getCardScreenRect,
    update,
    setConfig,
    getConfig,
    destroy,
    getFeaturedIndex: () => featuredIndex,
    getCardCount: () => count,
  };
}
