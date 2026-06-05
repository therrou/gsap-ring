/**
 * Liquid-glass edge window — a screen-space post pass used during the flat-row
 * stop. The scene is rendered into a RenderTarget, then a full-screen triangle
 * refracts only the LEFT & RIGHT margins (the centre stays pixel-perfect), like
 * looking through a window whose side edges are curved glass. Static curved lens
 * + bright rim (no animation).
 *
 * Isolated unit: owns the RenderTarget + quad + program; `scene.ts` just renders
 * into it and asks it to draw. 1 OGL unit = 1 px elsewhere, but this pass works
 * purely in 0..1 screen UV.
 */

import {
  Mesh,
  Program,
  RenderTarget,
  Triangle,
  type Camera,
  type OGLRenderingContext,
  type Renderer,
  type Transform,
} from "ogl";

export type GlassPassConfig = {
  /** Clear centre half-width (0..1 of |d|); below this no distortion. */
  center: number;
  /** Edge refraction strength (UV units at the very edge). */
  strength: number;
  /** Bright rim intensity at the centre→glass boundary. */
  rim: number;
  /** Rim colour (linear rgb). */
  rimColor: [number, number, number];
};

const GLASS_VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const GLASS_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uGlass;     // master 0..1 (fades the whole effect in/out)
  uniform float uCenter;    // clear centre half-width (|d| below this = clear)
  uniform float uStrength;  // edge bend
  uniform float uRim;       // rim intensity
  uniform vec3 uRimColor;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float d = (uv.x - 0.5) * 2.0;        // -1 (left) .. 1 (right)
    float ad = abs(d);
    // 0 across the clear centre band, ramps to 1 at the screen edges.
    float edge = smoothstep(uCenter, 1.0, ad);
    float warp = edge * edge;            // stronger near the very edge

    // Horizontal refraction (pull content toward the edge → cylinder wrap),
    // plus a mild vertical curl so the edge reads as a curved pane.
    float offX = -sign(d) * warp * uStrength * uGlass;
    float offY = (uv.y - 0.5) * warp * uStrength * 0.4 * uGlass;
    vec2 suv = vec2(uv.x + offX, uv.y + offY);

    // Chromatic aberration for glass realism (grows toward the edge).
    float ca = warp * 0.004 * uGlass;
    vec3 col;
    col.r = texture2D(tMap, suv + vec2(ca, 0.0)).r;
    col.g = texture2D(tMap, suv).g;
    col.b = texture2D(tMap, suv - vec2(ca, 0.0)).b;

    // Bright rim at the centre→glass boundary (symmetric → both sides).
    float rim = exp(-pow((ad - uCenter) / 0.04, 2.0));
    col += uRimColor * rim * uRim * uGlass;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export type GlassPass = {
  setSize: (width: number, height: number) => void;
  renderToTarget: (scene: Transform, camera: Camera) => void;
  renderGlass: (glassT: number, config: GlassPassConfig) => void;
  destroy: () => void;
};

export function createGlassPass(gl: OGLRenderingContext, renderer: Renderer): GlassPass {
  const rt = new RenderTarget(gl, {
    width: Math.max(1, gl.drawingBufferWidth),
    height: Math.max(1, gl.drawingBufferHeight),
  });
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: GLASS_VERTEX,
    fragment: GLASS_FRAGMENT,
    // Full-screen pass — no blending/depth needed (it covers the screen).
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tMap: { value: rt.texture },
      uGlass: { value: 0 },
      uCenter: { value: 0.5 },
      uStrength: { value: 0.08 },
      uRim: { value: 0.6 },
      uRimColor: { value: [0.6, 0.8, 1.0] },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });

  function setSize(_width: number, _height: number) {
    rt.setSize(Math.max(1, gl.drawingBufferWidth), Math.max(1, gl.drawingBufferHeight));
  }

  // Render the scene into the offscreen target (the glass backdrop).
  function renderToTarget(scene: Transform, camera: Camera) {
    renderer.render({ scene, camera, target: rt });
  }

  // Draw the full-screen glass quad to the screen, sampling the target.
  function renderGlass(glassT: number, config: GlassPassConfig) {
    program.uniforms.uGlass.value = glassT;
    program.uniforms.uCenter.value = config.center;
    program.uniforms.uStrength.value = config.strength;
    program.uniforms.uRim.value = config.rim;
    program.uniforms.uRimColor.value = config.rimColor;
    renderer.render({ scene: mesh, frustumCull: false, sort: false });
  }

  function destroy() {
    gl.deleteProgram(program.program);
    const tex = rt.texture as { texture?: WebGLTexture };
    if (tex.texture) gl.deleteTexture(tex.texture);
  }

  return { setSize, renderToTarget, renderGlass, destroy };
}
