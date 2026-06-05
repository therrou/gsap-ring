/**
 * In-scene WebGL "indicator wheel" — a net-new addition (not in example-2.js),
 * inspired by the iOS alarm picker. A cylinder of word planes rotating about the
 * X axis; on hover of a spread card it spins to a RANDOM word and settles with a
 * critically-damped spring (the alarm-wheel snap).
 *
 * Rendered as a child of the scene root (NOT the ring) at a fixed lower-center
 * screen position, so the ring's zoom/tilt/rotation never move it. Visible only
 * during the diagonal spread.
 *
 * Coordinate note (matches scene.ts): 1 OGL unit = 1 CSS pixel.
 */

import { Mesh, Plane, Program, Texture, Transform, type OGLRenderingContext } from "ogl";
import { Spring } from "./spring";

const WORD_PLANE_W = 260;
const WORD_PLANE_H = 58;
/** Cylinder radius (px). Sets the vertical spacing between adjacent words. */
const WHEEL_RADIUS = 92;
/** Text canvas resolution (CSS-independent; sampled onto the plane). */
const TEXT_CANVAS_W = 512;
const TEXT_CANVAS_H = 128;

const WHEEL_VERTEX = /* glsl */ `
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

const WHEEL_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec4 t = texture2D(tMap, vUv);
    // Only the front-facing words read; planes curving away (and the word on the
    // cylinder back) dim out (iOS picker falloff). Front plane → normal.z ≈ 1,
    // back-facing → negative, hidden.
    float front = smoothstep(0.35, 0.92, vNormal.z);
    float alpha = t.a * uOpacity * front;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(t.rgb, alpha);
  }
`;

function makeWordTexture(gl: OGLRenderingContext, word: string, index: number): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = TEXT_CANVAS_W;
  canvas.height = TEXT_CANVAS_H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, TEXT_CANVAS_W, TEXT_CANVAS_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cy = TEXT_CANVAS_H * 0.5;

  // Small index chip on the left (echoes the "13" circle in the reference panel).
  ctx.fillStyle = "#111418";
  ctx.font = "600 30px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(String(index + 1).padStart(2, "0"), 54, cy);
  ctx.strokeStyle = "rgba(17,20,24,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(54, cy, 32, 0, Math.PI * 2);
  ctx.stroke();

  // The word itself.
  ctx.fillStyle = "#111418";
  ctx.font = "500 40px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(word, TEXT_CANVAS_W * 0.5 + 40, cy);

  const texture = new Texture(gl, { generateMipmaps: false, flipY: true });
  texture.image = canvas as unknown as HTMLImageElement;
  texture.needsUpdate = true;
  return texture;
}

export type IndicatorWheel = {
  group: Transform;
  setVisible: (v01: number) => void;
  /** Spin to the word mapped from a card index (call on hover rising edge). */
  spinTo: (cardIndex: number) => void;
  /** Number of words in the wheel (for the caller's card→word mapping). */
  wordCount: number;
  update: (deltaMs: number) => void;
  layout: (viewportWidth: number, viewportHeight: number) => void;
  destroy: () => void;
};

export function createIndicatorWheel(
  gl: OGLRenderingContext,
  { parent, words }: { parent: Transform; words: string[] },
): IndicatorWheel {
  const group = new Transform();
  group.setParent(parent);

  const count = words.length;
  const step = (Math.PI * 2) / count;
  const programs: Program[] = [];
  const meshes: Mesh[] = [];
  const geometry = new Plane(gl, { width: WORD_PLANE_W, height: WORD_PLANE_H });

  for (let i = 0; i < count; i++) {
    const texture = makeWordTexture(gl, words[i], i);
    const program = new Program(gl, {
      vertex: WHEEL_VERTEX,
      fragment: WHEEL_FRAGMENT,
      transparent: true,
      cullFace: null,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tMap: { value: texture },
        uOpacity: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    // Place plane i on the cylinder (angle a = i*step from +Z toward +Y), rotated
    // to face radially outward. group.rotation.x = -a brings word i to the front.
    const a = i * step;
    mesh.position.set(0, WHEEL_RADIUS * Math.sin(a), WHEEL_RADIUS * Math.cos(a));
    mesh.rotation.x = -a;
    // Draw above the cards (which use renderOrder up to the card count) so the
    // readout is never occluded by an overlapping spread slab.
    mesh.renderOrder = 1000 + i;
    mesh.setParent(group);
    programs.push(program);
    meshes.push(mesh);
  }

  // Critically-damped spring drives the cylinder rotation toward the chosen word.
  const spin = new Spring({ stiffness: 90, criticalDamping: true });
  let visible = 0;

  function setVisible(v01: number) {
    visible = Math.min(1, Math.max(0, v01));
    for (const p of programs) p.uniforms.uOpacity.value = visible;
  }

  function spinTo(cardIndex: number) {
    // Each card maps to one word; land that word at the front. Take the SHORTEST
    // path from the current angle (no extra full turns) so the wheel settles
    // calmly rather than whipping around on every hover.
    const slot = ((cardIndex % count) + count) % count;
    const base = -slot * step;
    const current = spin.damped;
    let target = base;
    while (target - current > Math.PI) target -= Math.PI * 2;
    while (target - current < -Math.PI) target += Math.PI * 2;
    spin.target = target;
  }

  function update(deltaMs: number) {
    const angle = spin.step(deltaMs);
    group.rotation.x = angle;
  }

  function layout(_viewportWidth: number, viewportHeight: number) {
    // Fixed lower-center. Child of the scene root, so it stays put under the
    // ortho camera regardless of the ring transform. 1 unit = 1px.
    group.position.set(0, -viewportHeight * 0.34, 0);
  }

  function destroy() {
    for (const program of programs) {
      const texture = program.uniforms.tMap.value as Texture;
      gl.deleteTexture(texture.texture);
      gl.deleteProgram(program.program);
    }
  }

  return { group, setVisible, spinTo, wordCount: count, update, layout, destroy };
}
