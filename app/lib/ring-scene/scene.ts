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

export const RING_CARD_COUNT = 24;
export const RING_FEATURED_INDEX = 15;
export const RING_CAMERA_FOV = 45;
export const RING_HOVER_LIFT = 160;
/** Per-card horizontal spread when the deck collapses into a stack. */
export const RING_STACK_SPACING_X = 30;
/** Per-card depth offset within the stacked deck (negative = farther). */
export const RING_STACK_SPACING_Z = -8;
/** Per-card offset along the diagonal iso layout. Larger = longer diagonal. */
export const RING_ISO_SPACING = 36;
export const RING_ZOOM_SCALE = 3.0;
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

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
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

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec4 sampled = texture2D(tMap, vUv);
    vec3 base = mix(uFallbackColor, sampled.rgb, uHasMap);

    float diffuse = max(dot(vNormal, normalize(vec3(-10.0, -10.0, -1.0))), 0.0);
    base -= base * diffuse * 0.6 * uLight;

    float vignette = smoothstep(0.45, 1.0, length(vUv - 0.5) * 2.0);
    base -= vignette * 0.08;

    float alpha = uOpacity * uLoadOpacity;
    gl_FragColor = vec4(base, alpha);
  }
`;

export type RingCardController = {
  mesh: Mesh;
  index: number;
  isFeatured: boolean;
  ringAngle: number;
  ringX: number;
  ringY: number;
  ringZ: number;
  faceRotationZ: number;
  hoverSpring: Spring;
  liftSpring: Spring;
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

function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
  const planeGeometry = new Plane(gl, {
    width: cardWidth,
    height: cardHeight,
    widthSegments: 1,
    heightSegments: 1,
  });

  const cards: RingCardController[] = [];
  /**
   * Ring tilt. The reference design sits nearly upright — just enough X-tilt
   * to give a hint of perspective without pushing top-row cards into the same
   * screen-space as bottom-row cards (which would create the Z-fighting look).
   */
  const baseRotationX = radians(-6);
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
      cullFace: null,
      depthWrite: true,
      depthTest: true,
      uniforms: {
        tMap: { value: texture },
        uOpacity: { value: 1 },
        uLoadOpacity: { value: 0 },
        uLight: { value: 0 },
        uHasMap: { value: 0 },
        uFallbackColor: { value: [0.86, 0.89, 0.95] },
      },
    });

    promise.then(() => {
      program.uniforms.uHasMap.value = 1;
    });

    const mesh = new Mesh(gl, { geometry: planeGeometry, program });
    mesh.setParent(containerRoot);

    const angle = ringAngleAtIndex(i, count);
    const card: RingCardController = {
      mesh,
      index: i,
      isFeatured: i === featuredIndex,
      ringAngle: angle,
      ringX: 0,
      ringY: 0,
      ringZ: 0,
      // Subtle face rotation — cards rotate gently with their position on the
      // ring so the deck reads as "rolling". Coefficient is small so cards
      // never tilt far enough to feel chaotic.
      faceRotationZ: -angle * 0.08,
      hoverSpring: new Spring({ stiffness: 130, criticalDamping: true }),
      liftSpring: new Spring({ stiffness: 90, damping: 16 }),
    };
    cards.push(card);
  }

  const progressState: RingSceneProgress = { zoom: 0, stack: 0, iso: 0, intro: 0 };
  const pointer: RingPointerState = { x: 0, y: 0, inside: false };
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
    const heightCap = height * 0.40;

    // Clamp: at least minRadius (cards touch, no overlap), at most heightCap
    // (no clipping), and never bigger than 380 (visual consistency).
    const target = Math.max(minRadius, Math.min(heightCap, 380));

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

  function setPointer(state: RingPointerState) {
    pointer.x = state.x;
    pointer.y = state.y;
    pointer.inside = state.inside;
  }

  /**
   * Lightweight screen-space picking: project each card's world position
   * onto the screen, see which (if any) the cursor is inside. When several
   * cards overlap (deck phase) we prefer the one with the largest world Z
   * — i.e. the card visually on top.
   */
  function pickAt(clientX: number, clientY: number): number | null {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    let bestIndex: number | null = null;
    let bestZ = -Infinity;
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

      const halfWidth = cardWidth * 0.5 * (focal / denom);
      const halfHeight = cardHeight * 0.5 * (focal / denom);

      if (Math.abs(px - screenX) <= halfWidth && Math.abs(py - screenY) <= halfHeight) {
        if (tz > bestZ) {
          bestZ = tz;
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
    const pointerOffsetX = pointer.inside ? pointer.x : 0;
    const pointerOffsetY = pointer.inside ? pointer.y : 0;
    const absOffset = Math.abs(pointerOffsetX);
    const normalized =
      radius > 0
        ? absOffset < radius
          ? absOffset / radius
          : Math.log(absOffset / radius) + 1
        : 0;
    const ringForce = Math.sign(pointerOffsetX) * normalized * (1 - zoom);

    /**
     * Zoom phase — rotate the ring around its own Z so the featured card
     * lands at θ = -π/2 (bottom of the un-tilted ring), then scale up and
     * translate so the featured card sits at world (0, 0, ~0) — i.e. dead
     * center on the screen. As zoom progresses we also flatten the ring
     * tilt so the featured card faces camera squarely.
     */
    const zoomEase = easeOutCubic(zoom);
    // During iso we pull the camera back (effectively) by shrinking the
    // ringRoot scale so the long diagonal stack fits comfortably on screen.
    const isoEaseForScale = easeInOutCubic(iso);
    const isoPullback = lerp(1, 0.55, isoEaseForScale);
    const zoomScale = lerp(1, RING_ZOOM_SCALE, zoomEase) * isoPullback;
    ringRoot.scale.set(zoomScale, zoomScale, zoomScale);

    const tiltEase = easeOutCubic(stack);
    const flattenT = clamp01(zoom * 0.8);
    const activeBaseTilt = baseRotationX * (1 - flattenT);
    ringRoot.rotation.x =
      activeBaseTilt * (1 - tiltEase) + ringForce * Math.PI * 0.025 * (1 - tiltEase);
    ringRoot.rotation.y = ringForce * Math.PI * 0.04 * (1 - tiltEase);

    const featuredAngle = ringAngleAtIndex(featuredIndex, count);
    // We want featured to end up at θ = -π/2 (bottom of un-tilted ring).
    const targetWrapperRotation = shortestAngleDelta(featuredAngle, -Math.PI / 2);
    const wrapperZoomRotation = lerp(0, targetWrapperRotation, clamp01((zoom - 0.2) / 0.8));
    // Unwind the rotation during stack so the deck reads as upright.
    wrapperRoot.rotation.z = wrapperZoomRotation * (1 - tiltEase);

    /**
     * Centering math: after the wrapper rotation places featured at local
     * (0, -r, 0) and the (damped) base X-tilt is applied, featured ends up
     * at parent-local (0, -r·cos(tilt), r·sin(|tilt|)). Translating the
     * ringRoot by +scale * |featured.y| moves featured to world Y = 0.
     */
    const tiltCos = Math.cos(activeBaseTilt);
    const tiltSin = Math.sin(Math.abs(activeBaseTilt));
    const featuredLocalY = -radius * tiltCos;
    const featuredLocalZ = radius * tiltSin;
    const centerYTarget = -zoomScale * featuredLocalY;
    const centerZTarget = -zoomScale * featuredLocalZ * 0.4; // partial pull-back
    // Baseline ring-phase offset so the ring sits a touch below the viewport
    // centre — keeps the top of the circle clear of the top nav bar and lets
    // the centred hero text breathe just above the ring's geometric centre.
    const ringRestOffsetY = -viewportHeight * 0.05;
    ringRoot.position.y =
      ringRestOffsetY * (1 - zoomEase) + centerYTarget * zoomEase * (1 - tiltEase);
    ringRoot.position.z = centerZTarget * zoomEase * (1 - tiltEase);

    /**
     * Per-card placement: blend ring → stacked deck → diagonal iso layout.
     *
     *  - Stack phase: cards fan horizontally behind featured, container tilts
     *    forward slightly so the deck reads as "lying down" toward the viewer.
     *  - Iso phase:   cards re-stack along a diagonal going up-and-right, with
     *    featured at the bottom-front and successive cards receding into the
     *    distance. Visually matches the "category drill-in" layout where the
     *    card list extends diagonally beside a category label panel.
     */
    const isoEase = easeInOutCubic(iso);
    const stackOnlyEase = tiltEase * (1 - isoEase);

    // Container takes a gentle forward tilt during stack, then rotates a bit
    // further (and adds a small Y twist) during iso so the diagonal projects
    // up-right rather than straight back.
    containerRoot.rotation.x = lerp(0, radians(-14), tiltEase) + lerp(0, radians(-6), isoEase);
    containerRoot.rotation.y = lerp(0, radians(8), isoEase);
    containerRoot.rotation.z = lerp(0, radians(4), isoEase);

    cards.forEach((card) => {
      // ─── Stack target ────────────────────────────────────────────────────
      // Featured sits at center, neighbours fan horizontally with a quadratic
      // depth fall-off. Reads as a tightly packed "deck" with featured on top.
      const stackOffset = card.index - featuredIndex;
      const stackX = stackOffset * RING_STACK_SPACING_X;
      const stackY = 0;
      const stackZ = RING_STACK_SPACING_Z * Math.abs(stackOffset);

      // ─── Iso target ──────────────────────────────────────────────────────
      // Re-index so featured = 0 and wrap around (mod count) — this gives the
      // diagonal a single unbroken stack starting from featured at front.
      // Diagonal direction: right (+X), up (+Y), away (−Z).
      const isoStackPos = ((card.index - featuredIndex) + count) % count;
      const isoX = isoStackPos * RING_ISO_SPACING * 0.7;
      const isoY = isoStackPos * RING_ISO_SPACING * 0.7;
      const isoZ = -isoStackPos * RING_ISO_SPACING * 0.9;

      // Blend stack → iso first, then ring → (stack/iso) by tiltEase.
      const targetX = lerp(stackX, isoX, isoEase);
      const targetY = lerp(stackY, isoY, isoEase);
      const targetZ = lerp(stackZ, isoZ, isoEase);
      const posX = lerp(card.ringX, targetX, tiltEase);
      const posY = lerp(card.ringY, targetY, tiltEase);
      const posZ = lerp(card.ringZ, targetZ, tiltEase);

      // Stacked-hover spring drives a vertical peek (push the hovered
      // card UP and slightly forward so the user can read it clearly).
      // Gated to the horizontal deck phase only — hovering during iso would
      // ruin the diagonal silhouette.
      const stackedHoverActive = stack > 0.6 && iso < 0.4;
      card.hoverSpring.target =
        stackedHoverActive && hoveredIndex === card.index ? 1 : 0;
      const hoverPeek = card.hoverSpring.step(deltaMs);

      // Ring-phase gaussian lift toward pointer. Distance is measured in
      // the screen-aligned XY plane (ring is roughly XY before tilt).
      const dx = card.ringX - pointerOffsetX;
      const dy = card.ringY - pointerOffsetY;
      const planeDistance = Math.sqrt(dx * dx + dy * dy);
      const influenceRadius = Math.PI * lerp(0.3, 0.15, zoom) * radius;
      let influence = 0;
      if (influenceRadius > 0 && pointer.inside && stack < 0.4) {
        const normalizedDistance = clamp01(1 - planeDistance / influenceRadius);
        influence = 0.5 * (1 - Math.cos(Math.PI * normalizedDistance));
      }
      const ringLift = RING_HOVER_LIFT * influence * (1 - zoom);
      card.liftSpring.target = ringLift;
      const liftDamped = card.liftSpring.step(deltaMs);

      // Stacked hover: raise card (+Y) and pop forward (+Z) so it sits above
      // the deck. Magnitudes are in local space, so they get multiplied by
      // the ring's zoom scale — keep them modest.
      const peekY = hoverPeek * 36;
      const peekZ = hoverPeek * 24;
      card.mesh.position.set(posX, posY + peekY, posZ + liftDamped + peekZ);

      // Cards have a subtle radial roll while in ring; reset to upright in
      // stack, then add a tiny shared roll during iso so the diagonal reads
      // as a slightly tossed deck rather than a perfectly clinical line.
      const ringFace = card.faceRotationZ + influence * Math.PI * 0.06;
      const isoRoll = radians(-3) * isoEase;
      card.mesh.rotation.z = lerp(ringFace, isoRoll, tiltEase);

      // Opacity blending. During stack, non-featured cards fade in proportion
      // to their distance from featured. During iso the falloff softens and
      // re-uses the iso stack distance so deeper cards fade gracefully into
      // the background plane.
      const program = card.mesh.program;
      const stackFalloff = clamp01(1 - Math.abs(stackOffset) / 6);
      const stackedOpacity =
        card.index === featuredIndex
          ? 1
          : lerp(1, 0.15 + stackFalloff * 0.5, stackOnlyEase);

      const isoFalloff = clamp01(1 - isoStackPos / 14);
      const isoOpacity =
        card.index === featuredIndex
          ? 1
          : lerp(0.5, 1, isoFalloff);
      const stackToIsoOpacity = lerp(stackedOpacity, isoOpacity, isoEase);
      const hoverOpacityBoost = (1 - stackToIsoOpacity) * hoverPeek;
      program.uniforms.uOpacity.value = stackToIsoOpacity + hoverOpacityBoost;
      program.uniforms.uLight.value =
        card.index === featuredIndex
          ? 0
          : stackOnlyEase * 0.7 * (1 - stackFalloff * 0.4) * (1 - hoverPeek);

      // Intro stagger fade-in across the first 60% of the intro.
      const introOffset = card.index / count;
      const introLocal = clamp01((intro - introOffset * 0.4) / 0.6);
      program.uniforms.uLoadOpacity.value = introLocal;

      // Render order. In stack phase the featured card always wins; in iso
      // we order by isoStackPos so the front card (featured) renders on top
      // and successive cards stack behind it visually.
      const isoOrder = count - isoStackPos;
      const stackOrder = card.index === featuredIndex ? count + 10 : count - Math.abs(stackOffset);
      const baseOrder = lerp(stackOrder, isoOrder, isoEase);
      const hoverBoost = hoverPeek > 0.05 ? count * 2 : 0;
      card.mesh.renderOrder = baseOrder + hoverBoost;
    });

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
    destroy,
    getFeaturedIndex: () => featuredIndex,
    getCardCount: () => count,
  };
}
