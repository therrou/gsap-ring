/**
 * Liquid-glass panel — a bounded, card-like glass pane drawn ON TOP of the canvas
 * during the flat-row stop. The scene is rendered into a RenderTarget; a
 * full-screen triangle then composites a centred rounded-rect panel over it: the
 * panel's CENTRE is pixel-perfect, only its LEFT & RIGHT edges refract the
 * backdrop, and a bright rim traces the rounded border. Everything outside the
 * panel is the untouched canvas. Static curved lens (no animation).
 *
 * Isolated unit: owns the RenderTarget + quad + program; `scene.ts` just renders
 * into it and asks it to draw.
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
  /** Panel half-width as a fraction of the viewport (0..0.5). */
  halfW: number;
  /** Panel half-height as a fraction of the viewport (0..0.5). */
  halfH: number;
  /** Panel corner radius, px. */
  radius: number;
  /** Clear centre half-width WITHIN the panel (0..1 of panel half-width). */
  center: number;
  /** Horizontal cylinder compression at the panel's L/R edge. */
  strength: number;
  /** Vertical bow — squeeze toward the centre-line (the cylinder wrap). */
  bow: number;
  /** Specular streak intensity along the curved edge. */
  rim: number;
  /** Rim colour (linear rgb). */
  rimColor: [number, number, number];
  /** How far the panel glides toward the cursor (fraction of half-viewport). */
  follow: number;
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
  uniform vec2 uResolution;  // viewport px (for isotropic rounded corners)
  uniform float uGlass;      // master 0..1 (fades the whole effect in/out)
  uniform vec2 uHalf;        // panel half-size, fraction of viewport
  uniform float uRadius;     // panel corner radius, px
  uniform float uCenter;     // clear centre half-width within the panel (0..1)
  uniform float uStrength;   // horizontal cylinder compression at the edge
  uniform float uBow;        // vertical bow (squeeze toward the centre-line)
  uniform float uRim;        // specular streak intensity
  uniform vec3 uRimColor;
  uniform vec2 uPointer;     // damped pointer, normalized -1..1 (y-down)
  uniform float uFollow;     // how far the panel glides toward the cursor
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec3 clean = texture2D(tMap, uv).rgb;

    // Panel geometry in px (isotropic → round corners regardless of aspect).
    // The panel glides a little toward the cursor (like the ring leaning).
    vec2 panelCenter = uPointer * uResolution * 0.5 * uFollow;
    vec2 p = (uv - 0.5) * uResolution - panelCenter;  // px from panel centre
    vec2 panelHalf = uHalf * uResolution;       // panel half-size, px
    float dx = p.x / max(panelHalf.x, 1.0);     // -1..1 across the panel width

    // Rounded-rect signed distance (px): <0 inside the panel.
    vec2 q = abs(p) - panelHalf + uRadius;
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    float mask = 1.0 - smoothstep(0.0, 1.5, sd);

    // ─── Cylinder lens (side slides wrap around a vertical glass tube) ────────
    // Clear centre band (|dx| < uCenter); beyond it the side region curves away.
    // s = 0 at the clear-centre boundary, 1 at the panel L/R edge.
    float s = clamp((abs(dx) - uCenter) / max(1.0 - uCenter, 0.001), 0.0, 1.0);
    // Foreshorten — accelerates toward the edge like a cylinder surface.
    float curve = 1.0 - cos(s * 1.5707963);

    // Horizontal compress (wrap toward centre) + vertical bow (squeeze toward the
    // horizontal centre-line) → the content wraps around the cylinder, so the
    // top/bottom edges of the side slides curl inward (the 3D "sphere" look).
    float offX = -sign(dx) * curve * uStrength * uGlass;
    float vk = curve * uBow * uGlass;                  // vertical squeeze 0..~1
    float ny = 0.5 + (uv.y - 0.5) * (1.0 - vk);
    vec2 suv = vec2(uv.x + offX, ny);

    // Chromatic aberration grows with the curve.
    float ca = curve * 0.006 * uGlass;
    vec3 refr;
    refr.r = texture2D(tMap, suv + vec2(ca, 0.0)).r;
    refr.g = texture2D(tMap, suv).g;
    refr.b = texture2D(tMap, suv - vec2(ca, 0.0)).b;

    // Inside the panel → wrapped/refracted; outside → untouched canvas.
    vec3 col = mix(clean, refr, mask * uGlass);

    // Sharp specular streak along the curved edge (the bright glass rim).
    float spec = exp(-pow((s - 0.62) / 0.13, 2.0)) * mask;
    col += uRimColor * spec * uRim * uGlass;
    // Faint rounded-border outline to seat the panel.
    float border = exp(-pow(sd / 4.0, 2.0));
    col += uRimColor * border * uRim * 0.2 * uGlass;

    // Specular glint that tracks the cursor across the glass (the panel only
    // glides part-way, so the cursor still moves relative to it → the light slides).
    vec2 pointerUV = 0.5 + uPointer * 0.5;
    vec2 gd = uv - pointerUV;
    gd.x *= uResolution.x / uResolution.y;       // aspect-correct
    float glint = exp(-dot(gd, gd) / 0.02) * mask;
    col += uRimColor * glint * uRim * uGlass * 0.7;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export type GlassPass = {
  setSize: (width: number, height: number) => void;
  renderToTarget: (scene: Transform, camera: Camera) => void;
  renderGlass: (
    glassT: number,
    config: GlassPassConfig,
    pointerX: number,
    pointerY: number,
  ) => void;
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
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tMap: { value: rt.texture },
      uResolution: { value: [1, 1] },
      uGlass: { value: 0 },
      uHalf: { value: [0.38, 0.3] },
      uRadius: { value: 18 },
      uCenter: { value: 0.5 },
      uStrength: { value: 0.12 },
      uBow: { value: 0.6 },
      uRim: { value: 0.8 },
      uRimColor: { value: [0.6, 0.8, 1.0] },
      uPointer: { value: [0, 0] },
      uFollow: { value: 0.1 },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });

  function setSize(width: number, height: number) {
    rt.setSize(Math.max(1, gl.drawingBufferWidth), Math.max(1, gl.drawingBufferHeight));
    program.uniforms.uResolution.value = [width, height];
  }

  // Render the scene into the offscreen target (the glass backdrop).
  function renderToTarget(scene: Transform, camera: Camera) {
    renderer.render({ scene, camera, target: rt });
  }

  // Draw the full-screen quad: clean canvas everywhere, glass panel on top.
  function renderGlass(
    glassT: number,
    config: GlassPassConfig,
    pointerX: number,
    pointerY: number,
  ) {
    program.uniforms.uGlass.value = glassT;
    program.uniforms.uHalf.value = [config.halfW, config.halfH];
    program.uniforms.uRadius.value = config.radius;
    program.uniforms.uCenter.value = config.center;
    program.uniforms.uStrength.value = config.strength;
    program.uniforms.uBow.value = config.bow;
    program.uniforms.uRim.value = config.rim;
    program.uniforms.uRimColor.value = config.rimColor;
    program.uniforms.uPointer.value = [pointerX, pointerY];
    program.uniforms.uFollow.value = config.follow;
    renderer.render({ scene: mesh, frustumCull: false, sort: false });
  }

  function destroy() {
    gl.deleteProgram(program.program);
    const tex = rt.texture as { texture?: WebGLTexture };
    if (tex.texture) gl.deleteTexture(tex.texture);
  }

  return { setSize, renderToTarget, renderGlass, destroy };
}
