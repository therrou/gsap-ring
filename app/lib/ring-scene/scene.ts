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
  Box,
  Camera,
  Mesh,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext,
} from "ogl";
import { Spring } from "./spring";
import {
  computeCardPlaneFaceRotation,
  computeCardPlaneForwardZ,
  computeCardPlaneInfluence,
} from "../ring-parity";
import {
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
/** Per-card local depth step in the album stack. Must exceed CARD_THICKNESS so
 * adjacent slabs don't interpenetrate. */
export const ROW_DEPTH_STEP = 9;
/** Thickness of the card slab (the "album" spine), in local units. */
export const CARD_THICKNESS = 6;
/** Corner radius of the card face, in px. */
export const CARD_CORNER_RADIUS = 9;
/** Neutral colour of the card's edge / spine. */
export const CARD_EDGE_COLOR: [number, number, number] = [0.82, 0.84, 0.88];
/** Y-tilt of the stacked row so the album spines read, radians. */
export const ROW_SPINE_TILT = (14 * Math.PI) / 180;
/** Compression of the tight "album" stack vs. the full spread (0..1). */
export const STACK_TIGHT_SCALE = 0.14;

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

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vLocalNormal = normal;
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
  uniform vec3 uFallbackColor;
  uniform vec3 uEdgeColor;
  uniform vec2 uHalfSize;      // card face half-extents, px
  uniform float uCornerRadius; // px

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vLocalNormal;

  // Signed distance to a rounded rectangle (2D), in px.
  float sdRoundRect(vec2 p, vec2 halfSize, float radius) {
    vec2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }

  void main() {
    float alpha = uOpacity * uLoadOpacity;
    vec3 base;

    // Front/back faces (local normal ±Z) show the image; the thin sides are the
    // album spine and get a flat neutral colour.
    if (abs(vLocalNormal.z) > 0.5) {
      vec4 sampled = texture2D(tMap, vUv);
      base = mix(uFallbackColor, sampled.rgb, uHasMap);

      float vignette = smoothstep(0.45, 1.0, length(vUv - 0.5) * 2.0);
      base -= vignette * 0.08;

      // Rounded-corner mask in px space so corners are circular, not elliptical.
      vec2 pPx = (vUv - 0.5) * (uHalfSize * 2.0);
      float dist = sdRoundRect(pPx, uHalfSize, uCornerRadius);
      alpha *= 1.0 - smoothstep(0.0, 1.5, dist);
    } else {
      base = uEdgeColor;
    }

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
  hoverSpring: Spring;
  /**
   * Current (damped) root position. Scroll sets a per-frame target and this
   * follows it via `dampToward`, mirroring example-2's `p.Damp` deck follow so
   * the collapse/row transitions trail slightly instead of snapping.
   */
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
  /** Diagonal "iso" layout that takes the deck and fans it up-right. */
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
  setHoveredIndex: (index: number) => void;
  setPointer: (state: RingPointerState) => void;
  pickAt: (clientX: number, clientY: number) => number | null;
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

  /**
   * Card geometry. Sized so 24 cards fit cleanly on a 320–380px radius ring
   * with visible gap between every card. Aspect ≈ 0.75 to match the example-2
   * frame. The smaller footprint also keeps top-row cards clear of the top nav
   * on standard 800px-tall windows.
   */
  const cardWidth = 75;
  const cardHeight = 100;
  // A thin box gives each card real thickness (the "album" slab): the front/back
  // faces carry the image, the thin sides read as a neutral spine.
  const cardGeometry = new Box(gl, {
    width: cardWidth,
    height: cardHeight,
    depth: CARD_THICKNESS,
  });

  const cards: RingCardController[] = [];
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
      // Backface culling lets the thin slabs render correctly without a depth
      // buffer: only camera-facing faces draw, ordered between cards by
      // renderOrder (painter's). Keeps all cards the same size (z=0, no depth
      // fighting), which depth-testing coplanar slabs could not.
      cullFace: gl.BACK,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: texture },
        uOpacity: { value: 1 },
        uLoadOpacity: { value: 0 },
        uLight: { value: 0 },
        uHasMap: { value: 0 },
        uFallbackColor: { value: [0.86, 0.89, 0.95] },
        uEdgeColor: { value: CARD_EDGE_COLOR },
        uHalfSize: { value: [cardWidth * 0.5, cardHeight * 0.5] },
        uCornerRadius: { value: CARD_CORNER_RADIUS },
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
      hoverSpring: new Spring({ stiffness: 130, criticalDamping: true }),
      pos: { x: 0, y: 0, z: 0 },
    };
    cards.push(card);
  }

  const progressState: RingSceneProgress = { zoom: 0, stack: 0, iso: 0, intro: 0 };
  const config: RingSceneConfig = { ...DEFAULT_RING_CONFIG };
  const pointer: RingPointerState = { x: 0, y: 0, inside: false };
  // Damped pointer — example-2 drives the ring torque + hover from `mouseDamp`
  // (an eased follow of the cursor), not the raw pointer, so motion settles in
  // instead of snapping when the cursor jumps.
  const pointerDamp = { x: 0, y: 0 };
  let hoveredIndex = -1;
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
    if (partial.iso !== undefined) progressState.iso = clamp01(partial.iso);
    if (partial.intro !== undefined) progressState.intro = clamp01(partial.intro);
  }

  function setHoveredIndex(index: number) {
    hoveredIndex = index;
  }

  function setConfig(partial: Partial<RingSceneConfig>) {
    Object.assign(config, partial);
    // Corner radius is a uniform — push it to every card immediately.
    if (partial.cornerRadius !== undefined) {
      for (const card of cards) {
        card.mesh.program.uniforms.uCornerRadius.value = config.cornerRadius;
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
   * Lightweight screen-space picking: project each card's world centre onto the
   * screen and test the cursor against the card's projected rect. When cards
   * overlap (the spread row) we return the **frontmost** card — the one with the
   * highest `renderOrder`, i.e. the one drawn on top — so the pick matches what
   * the user sees and doesn't flicker between overlapping cards.
   */
  function pickAt(clientX: number, clientY: number): number | null {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    let bestIndex: number | null = null;
    let bestOrder = -Infinity;
    const focal = rect.height / (2 * Math.tan((RING_CAMERA_FOV * Math.PI) / 180 / 2));
    const cameraZ = camera.position.z;

    scene.updateMatrixWorld();

    cards.forEach((card) => {
      const matrix = card.mesh.worldMatrix;
      const tx = matrix[12];
      const ty = matrix[13];
      const tz = matrix[14];

      const denom = cameraZ - tz;
      if (denom <= 0) return;

      const screenX = (tx * focal) / denom + rect.width * 0.5;
      const screenY = -(ty * focal) / denom + rect.height * 0.5;

      // World scale of the card's axes (the ring/zoom scale is baked into the
      // world matrix), so the hit-rect tracks the card's true on-screen size.
      const worldScaleX = Math.hypot(matrix[0], matrix[1], matrix[2]);
      const worldScaleY = Math.hypot(matrix[4], matrix[5], matrix[6]);
      const halfWidth = cardWidth * 0.5 * worldScaleX * (focal / denom);
      const halfHeight = cardHeight * 0.5 * worldScaleY * (focal / denom);

      if (Math.abs(px - screenX) <= halfWidth && Math.abs(py - screenY) <= halfHeight) {
        if (card.mesh.renderOrder > bestOrder) {
          bestOrder = card.mesh.renderOrder;
          bestIndex = card.index;
        }
      }
    });

    return bestIndex;
  }

  function update(deltaMs: number) {
    const zoom = progressState.zoom;
    const stack = progressState.stack;
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
    const rowProgress = iso; // the `iso` channel drives the spread of the album
    const rowEase = easePow1InOut(rowProgress);
    const gatherT = stackEase; // ring → tight album stack
    const spreadT = rowEase; // tight album → full spread
    // Ring zooms up to centre featured; once the album forms it pulls back to a
    // comfortable size. Positions are divided by this scale so layout holds.
    const zoomScale =
      computeZoomScale(zoom, config.zoomScaleMax) * lerp(1, config.rowScalePullback, spreadT);
    ringRoot.scale.set(zoomScale, zoomScale, zoomScale);

    const baseTilt = radians(config.baseTiltXDeg);
    const flattenT = clamp01(zoom * 0.8);
    const activeBaseTilt = baseTilt * (1 - flattenT);
    // Mouse torque multipliers match example-2 `Ar`: x 0.032π, y 0.025π.
    ringRoot.rotation.x =
      activeBaseTilt * (1 - gatherT) + ringForce * Math.PI * 0.032 * (1 - gatherT);
    ringRoot.rotation.y = ringForce * Math.PI * 0.025 * (1 - gatherT);

    // Featured → top of the ring, then the ring drops so featured lands centre
    // (sweeps DOWN from the top). The centring frame UNWINDS during the gather,
    // so the album/deck is laid out in clean screen-aligned space.
    const featuredAngle = ringAngleAtIndex(featuredIndex, count);
    const targetWrapperRotation = shortestAngleDelta(featuredAngle, Math.PI / 2);
    const wrapperZoomRotation = lerp(0, targetWrapperRotation, clamp01((zoom - 0.2) / 0.8));
    wrapperRoot.rotation.z =
      wrapperZoomRotation * (1 - gatherT) + ringForce * Math.PI * 0.035 * (1 - gatherT);

    const featuredLocalY = radius * Math.cos(activeBaseTilt); // featured at top (+r)
    const centerYTarget = -zoomScale * featuredLocalY;
    const ringRestOffsetY = -viewportHeight * 0.05;
    ringRoot.position.y =
      ringRestOffsetY * (1 - zoomEase) + centerYTarget * zoomEase * (1 - gatherT);
    ringRoot.position.z = 0;

    // ─── Album/deck tilt ─────────────────────────────────────────────────────
    // Cards stay square to camera (no in-plane roll); a small Y-tilt on the
    // whole deck turns each slab just enough to reveal its thick edge / spine,
    // plus a gentle forward lean. Comes up as the album forms and holds through
    // the spread.
    const deckTiltT = Math.max(gatherT, spreadT);
    containerRoot.rotation.x = radians(config.containerLeanXDeg) * deckTiltT;
    containerRoot.rotation.y = radians(config.spineTiltDeg) * deckTiltT;
    containerRoot.rotation.z = 0;

    const rowHoverActive = rowProgress > 0.5;

    cards.forEach((card) => {
      const isFeatured = card.index === featuredIndex;

      // Deck order: featured is the FIRST card (slot 0, front of the stack), the
      // rest follow in index order. Matches example-2's `r = [featured, ...]`, so
      // the centred card anchors the front of the album/diagonal instead of
      // sitting in the middle of the stack.
      const deckIndex = isFeatured
        ? 0
        : card.index < featuredIndex
          ? card.index + 1
          : card.index;

      // Full diagonal spread position (px), plus the compressed "tight album"
      // version of the same arrangement. Every card stays at z = 0 so under the
      // orthographic projection they all render the SAME size (no perspective
      // falloff toward the back of the stack).
      const row = computeRowTarget({
        index: deckIndex,
        count,
        part4: 1,
        viewportWidth,
        viewportHeight,
        cardHalf: Math.max(cardWidth, cardHeight) * config.rowMarginFactor,
      });
      const fullX = row.x / zoomScale;
      const fullY = row.y / zoomScale;
      const tightX = fullX * config.tightScale;
      const tightY = fullY * config.tightScale;

      // ring → tight album stack (gather), then tight → full spread (expand).
      const gatheredX = lerp(card.ringX, tightX, gatherT);
      const gatheredY = lerp(card.ringY, tightY, gatherT);
      const targetX = lerp(gatheredX, fullX, spreadT);
      const targetY = lerp(gatheredY, fullY, spreadT);

      // Damped follow (example-2 `p.Damp`): crisp on the idle ring, trailing as
      // the cards gather and spread.
      const dampRate = lerp(0.22, 0.06, Math.max(gatherT, spreadT));
      card.pos.x = dampToward(card.pos.x, targetX, dampRate, deltaMs);
      card.pos.y = dampToward(card.pos.y, targetY, dampRate, deltaMs);
      card.pos.z = dampToward(card.pos.z, 0, dampRate, deltaMs);
      card.root.position.set(card.pos.x, card.pos.y, card.pos.z);

      // Square up the cards as they gather — no in-plane roll in the album/row
      // (the album angle comes from the deck Y-tilt, not a per-card skew).
      card.root.rotation.z = lerp(card.faceRotationZ, 0, gatherT);

      // ─── Ring-idle hover (example-2 `Ar`) ────────────────────────────────
      const currentTheta = card.ringAngle + wrapperRoot.rotation.z;
      const cardLiveX = radius * Math.cos(currentTheta);
      const cardLiveY = radius * Math.sin(currentTheta);
      const influence = pointer.inside
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

      // ─── Stage 4: row hover peek (PlaneStacked `K`/`U`) ───────────────────
      // Spring (130, critical) → target 2 on the hovered card; positionHover3 =
      // (damped, 0, 0) slides it along its LOCAL +X. A subtle sideways peek out
      // of the fan — exactly as in example-2 (no forward pop, no reorder).
      card.hoverSpring.target =
        rowHoverActive && hoveredIndex === card.index ? ROW_HOVER_TARGET : 0;
      const hoverPeek = card.hoverSpring.step(deltaMs);
      const hoverSlideX = hoverPeek * config.hoverSlide;

      // Inner mesh carries every LOCAL offset: the idle-ring forward push (+Z) +
      // face turn (Y), and the row peek (+X). Mutually exclusive by phase.
      card.mesh.position.set(hoverSlideX, 0, planeForwardZ);
      card.mesh.rotation.y = planeFaceY;

      // ─── Opacity ─────────────────────────────────────────────────────────
      // Cards do NOT fade out — every card stays visible and gathers into the
      // album stack behind featured, then spreads. Only the intro load-fade and
      // a tiny shading on the idle ring apply.
      const program = card.mesh.program;
      program.uniforms.uOpacity.value = 1;
      program.uniforms.uLight.value = 0;

      // Intro stagger fade-in across the first 60% of the intro.
      const introOffset = card.index / count;
      const introLocal = clamp01((intro - introOffset * 0.4) / 0.6);
      program.uniforms.uLoadOpacity.value = introLocal;

      // Render order (painter's, no depth buffer): featured (deck slot 0) is the
      // front of the album; the rest step back by deck order. Hovered card is
      // unchanged — example-2 doesn't reorder on hover.
      card.mesh.renderOrder = count - deckIndex;
    });

    // ─── Camera: perspective (ring) → orthographic (album + spread) ──────────
    // Orthographic once the album forms so every card renders the SAME size
    // regardless of its place in the stack (no perspective falloff). The ring
    // itself stays in perspective for depth.
    const orthoT = Math.max(orthographicBlendT(zoom), gatherT, spreadT);
    mixProjectionMatrices(
      perspProjection,
      orthoProjection,
      orthoT,
      camera.projectionMatrix as unknown as number[],
    );

    renderer.render({ scene, camera });
  }

  function destroy() {
    cards.forEach((card) => {
      const program = card.mesh.program;
      const texture = program.uniforms.tMap.value as Texture;
      gl.deleteTexture(texture.texture);
      gl.deleteProgram(program.program);
    });
    const loseContext = gl.getExtension("WEBGL_lose_context");
    loseContext?.loseContext();
  }

  // Initial layout pass before the first scroll/pointer event.
  setSize(viewportWidth, viewportHeight);
  Promise.all(pendingTexturePromises).then(() => {
    /* textures ready — uHasMap is flipped per-card on resolve */
  });

  return {
    setSize,
    setProgress,
    setHoveredIndex,
    setPointer,
    pickAt,
    update,
    setConfig,
    getConfig,
    destroy,
    getFeaturedIndex: () => featuredIndex,
    getCardCount: () => count,
  };
}
