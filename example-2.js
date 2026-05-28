var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { cb as z, cc as qe, cd as ht, ce as vt, cf as Ee, cg as eo, ch as mt, bh as te, bW as V, bw as Ce, bf as H, aX as Pt, b3 as le, aW as xe, bb as p, b5 as Q, bg as pe, ci as Et, bi as ye, cj as Ie, ck as So, cl as Pe, cm as gt, aU as oe, cn as Ro, b7 as Qe, bm as Je, b1 as Xe, b2 as Ae, a_ as me, aZ as Do, bd as Oo, aO as Y, bj as zo, b0 as T, co as Io, c1 as Ot, aN as q, cp as zt, b9 as We, bc as Ao, cq as Fo, cr as No, cs as Bo, ct as ko, cu as Go, cv as Wo, cw as Uo, aL as Vo, cx as xt, cy as Ct, b8 as _e, cz as $e, bn as et, aP as ee, bq as ke, a$ as j, be as Se, cA as Ho, aR as de, cB as to, bx as $o, ba as ut, bk as Xo, bo as Ye, bp as Be, bS as oo, cC as jo, cD as It, cE as Zo, aS as yt, cF as Ge, bA as qo, bR as Yo } from "#entry";
import { W as Ko, V as ct, R as tt, C as Re, r as At, __tla as __tla_0 } from "./CRaXDlWf.js";
import { u as Qo } from "./test-1.js";
import { V as ot } from "./test-2.js";
import { u as Ft } from "./test-3.js";
import { g as Jo } from "./test-4.js";
let ei;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })()
]).then(async () => {
  (function() {
    try {
      var i = typeof window < "u" ? window : typeof global < "u" ? global : typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : {}, e = new i.Error().stack;
      e && (i._sentryDebugIds = i._sentryDebugIds || {}, i._sentryDebugIds[e] = "8e9dd49e-8126-4e29-9670-0868499cc0c2", i._sentryDebugIdIdentifier = "sentry-dbid-8e9dd49e-8126-4e29-9670-0868499cc0c2");
    } catch {
    }
  })();
  const _t = new z();
  let en = 1;
  class tn {
    constructor({ canvas: e = document.createElement("canvas"), width: t = 300, height: o = 150, dpr: s = 1, alpha: n = false, depth: a = true, stencil: l = false, antialias: r = false, premultipliedAlpha: u = false, preserveDrawingBuffer: d = false, powerPreference: v = "default", autoClear: h = true, webgl: f = 2 } = {}) {
      const y = {
        alpha: n,
        depth: a,
        stencil: l,
        antialias: r,
        premultipliedAlpha: u,
        preserveDrawingBuffer: d,
        powerPreference: v
      };
      this.dpr = s, this.alpha = n, this.color = true, this.depth = a, this.stencil = l, this.premultipliedAlpha = u, this.autoClear = h, this.id = en++, f === 2 && (this.gl = e.getContext("webgl2", y)), this.isWebgl2 = !!this.gl, this.gl || (this.gl = e.getContext("webgl", y)), this.gl, this.gl.renderer = this, this.setSize(t, o), this.state = {}, this.state.blendFunc = {
        src: this.gl.ONE,
        dst: this.gl.ZERO
      }, this.state.blendEquation = {
        modeRGB: this.gl.FUNC_ADD
      }, this.state.cullFace = false, this.state.frontFace = this.gl.CCW, this.state.depthMask = true, this.state.depthFunc = this.gl.LEQUAL, this.state.premultiplyAlpha = false, this.state.flipY = false, this.state.unpackAlignment = 4, this.state.framebuffer = null, this.state.viewport = {
        x: 0,
        y: 0,
        width: null,
        height: null
      }, this.state.textureUnits = [], this.state.activeTextureUnit = 0, this.state.boundBuffer = null, this.state.uniformLocations = /* @__PURE__ */ new Map(), this.state.currentProgram = null, this.extensions = {}, this.isWebgl2 ? (this.getExtension("EXT_color_buffer_float"), this.getExtension("OES_texture_float_linear")) : (this.getExtension("OES_texture_float"), this.getExtension("OES_texture_float_linear"), this.getExtension("OES_texture_half_float"), this.getExtension("OES_texture_half_float_linear"), this.getExtension("OES_element_index_uint"), this.getExtension("OES_standard_derivatives"), this.getExtension("EXT_sRGB"), this.getExtension("WEBGL_depth_texture"), this.getExtension("WEBGL_draw_buffers")), this.getExtension("WEBGL_compressed_texture_astc"), this.getExtension("EXT_texture_compression_bptc"), this.getExtension("WEBGL_compressed_texture_s3tc"), this.getExtension("WEBGL_compressed_texture_etc1"), this.getExtension("WEBGL_compressed_texture_pvrtc"), this.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"), this.vertexAttribDivisor = this.getExtension("ANGLE_instanced_arrays", "vertexAttribDivisor", "vertexAttribDivisorANGLE"), this.drawArraysInstanced = this.getExtension("ANGLE_instanced_arrays", "drawArraysInstanced", "drawArraysInstancedANGLE"), this.drawElementsInstanced = this.getExtension("ANGLE_instanced_arrays", "drawElementsInstanced", "drawElementsInstancedANGLE"), this.createVertexArray = this.getExtension("OES_vertex_array_object", "createVertexArray", "createVertexArrayOES"), this.bindVertexArray = this.getExtension("OES_vertex_array_object", "bindVertexArray", "bindVertexArrayOES"), this.deleteVertexArray = this.getExtension("OES_vertex_array_object", "deleteVertexArray", "deleteVertexArrayOES"), this.drawBuffers = this.getExtension("WEBGL_draw_buffers", "drawBuffers", "drawBuffersWEBGL"), this.parameters = {}, this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS), this.parameters.maxAnisotropy = this.getExtension("EXT_texture_filter_anisotropic") ? this.gl.getParameter(this.getExtension("EXT_texture_filter_anisotropic").MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
    }
    setSize(e, t) {
      this.width = e, this.height = t, this.gl.canvas.width = e * this.dpr, this.gl.canvas.height = t * this.dpr, this.gl.canvas.style && Object.assign(this.gl.canvas.style, {
        width: e + "px",
        height: t + "px"
      });
    }
    setViewport(e, t, o = 0, s = 0) {
      this.state.viewport.width === e && this.state.viewport.height === t || (this.state.viewport.width = e, this.state.viewport.height = t, this.state.viewport.x = o, this.state.viewport.y = s, this.gl.viewport(o, s, e, t));
    }
    setScissor(e, t, o = 0, s = 0) {
      this.gl.scissor(o, s, e, t);
    }
    enable(e) {
      this.state[e] !== true && (this.gl.enable(e), this.state[e] = true);
    }
    disable(e) {
      this.state[e] !== false && (this.gl.disable(e), this.state[e] = false);
    }
    setBlendFunc(e, t, o, s) {
      this.state.blendFunc.src === e && this.state.blendFunc.dst === t && this.state.blendFunc.srcAlpha === o && this.state.blendFunc.dstAlpha === s || (this.state.blendFunc.src = e, this.state.blendFunc.dst = t, this.state.blendFunc.srcAlpha = o, this.state.blendFunc.dstAlpha = s, o !== void 0 ? this.gl.blendFuncSeparate(e, t, o, s) : this.gl.blendFunc(e, t));
    }
    setBlendEquation(e, t) {
      e = e || this.gl.FUNC_ADD, !(this.state.blendEquation.modeRGB === e && this.state.blendEquation.modeAlpha === t) && (this.state.blendEquation.modeRGB = e, this.state.blendEquation.modeAlpha = t, t !== void 0 ? this.gl.blendEquationSeparate(e, t) : this.gl.blendEquation(e));
    }
    setCullFace(e) {
      this.state.cullFace !== e && (this.state.cullFace = e, this.gl.cullFace(e));
    }
    setFrontFace(e) {
      this.state.frontFace !== e && (this.state.frontFace = e, this.gl.frontFace(e));
    }
    setDepthMask(e) {
      this.state.depthMask !== e && (this.state.depthMask = e, this.gl.depthMask(e));
    }
    setDepthFunc(e) {
      this.state.depthFunc !== e && (this.state.depthFunc = e, this.gl.depthFunc(e));
    }
    setStencilMask(e) {
      this.state.stencilMask !== e && (this.state.stencilMask = e, this.gl.stencilMask(e));
    }
    setStencilFunc(e, t, o) {
      this.state.stencilFunc === e && this.state.stencilRef === t && this.state.stencilFuncMask === o || (this.state.stencilFunc = e || this.gl.ALWAYS, this.state.stencilRef = t || 0, this.state.stencilFuncMask = o || 0, this.gl.stencilFunc(e || this.gl.ALWAYS, t || 0, o || 0));
    }
    setStencilOp(e, t, o) {
      this.state.stencilFail === e && this.state.stencilDepthFail === t && this.state.stencilDepthPass === o || (this.state.stencilFail = e, this.state.stencilDepthFail = t, this.state.stencilDepthPass = o, this.gl.stencilOp(e, t, o));
    }
    activeTexture(e) {
      this.state.activeTextureUnit !== e && (this.state.activeTextureUnit = e, this.gl.activeTexture(this.gl.TEXTURE0 + e));
    }
    bindFramebuffer({ target: e = this.gl.FRAMEBUFFER, buffer: t = null } = {}) {
      this.state.framebuffer !== t && (this.state.framebuffer = t, this.gl.bindFramebuffer(e, t));
    }
    getExtension(e, t, o) {
      return t && this.gl[t] ? this.gl[t].bind(this.gl) : (this.extensions[e] || (this.extensions[e] = this.gl.getExtension(e)), t ? this.extensions[e] ? this.extensions[e][o].bind(this.extensions[e]) : null : this.extensions[e]);
    }
    sortOpaque(e, t) {
      return e.renderOrder !== t.renderOrder ? e.renderOrder - t.renderOrder : e.program.id !== t.program.id ? e.program.id - t.program.id : e.zDepth !== t.zDepth ? e.zDepth - t.zDepth : t.id - e.id;
    }
    sortTransparent(e, t) {
      return e.renderOrder !== t.renderOrder ? e.renderOrder - t.renderOrder : e.zDepth !== t.zDepth ? t.zDepth - e.zDepth : t.id - e.id;
    }
    sortUI(e, t) {
      return e.renderOrder !== t.renderOrder ? e.renderOrder - t.renderOrder : e.program.id !== t.program.id ? e.program.id - t.program.id : t.id - e.id;
    }
    getRenderList({ scene: e, camera: t, frustumCull: o, sort: s }) {
      let n = [];
      if (t && o && t.updateFrustum(), e.traverse((a) => {
        if (!a.visible) return true;
        a.draw && (o && a.frustumCulled && t && !t.frustumIntersectsMesh(a) || n.push(a));
      }), s) {
        const a = [], l = [], r = [];
        n.forEach((u) => {
          u.program.transparent ? u.program.depthTest ? l.push(u) : r.push(u) : a.push(u), u.zDepth = 0, !(u.renderOrder !== 0 || !u.program.depthTest || !t) && (u.worldMatrix.getTranslation(_t), _t.applyMatrix4(t.projectionViewMatrix), u.zDepth = _t.z);
        }), a.sort(this.sortOpaque), l.sort(this.sortTransparent), r.sort(this.sortUI), n = a.concat(l, r);
      }
      return n;
    }
    render({ scene: e, camera: t, target: o = null, update: s = true, sort: n = true, frustumCull: a = true, clear: l }) {
      o === null ? (this.bindFramebuffer(), this.setViewport(this.width * this.dpr, this.height * this.dpr)) : (this.bindFramebuffer(o), this.setViewport(o.width, o.height)), (l || this.autoClear && l !== false) && (this.depth && (!o || o.depth) && (this.enable(this.gl.DEPTH_TEST), this.setDepthMask(true)), (this.stencil || !o || o.stencil) && (this.enable(this.gl.STENCIL_TEST), this.setStencilMask(255)), this.gl.clear((this.color ? this.gl.COLOR_BUFFER_BIT : 0) | (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) | (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0))), s && e.updateMatrixWorld(), t && t.updateMatrixWorld(), this.getRenderList({
        scene: e,
        camera: t,
        frustumCull: a,
        sort: n
      }).forEach((u) => {
        u.draw({
          camera: t
        });
      });
    }
  }
  class dt {
    constructor(e, { width: t = e.canvas.width, height: o = e.canvas.height, target: s = e.FRAMEBUFFER, color: n = 1, depth: a = true, stencil: l = false, depthTexture: r = false, wrapS: u = e.CLAMP_TO_EDGE, wrapT: d = e.CLAMP_TO_EDGE, wrapR: v = e.CLAMP_TO_EDGE, minFilter: h = e.LINEAR, magFilter: f = h, type: y = e.UNSIGNED_BYTE, format: m = e.RGBA, internalFormat: c = m, unpackAlignment: L, premultiplyAlpha: C } = {}) {
      this.gl = e, this.width = t, this.height = o, this.depth = a, this.stencil = l, this.buffer = this.gl.createFramebuffer(), this.target = s, this.gl.renderer.bindFramebuffer(this), this.textures = [];
      const w = [];
      for (let g = 0; g < n; g++) this.textures.push(new qe(e, {
        width: t,
        height: o,
        wrapS: u,
        wrapT: d,
        wrapR: v,
        minFilter: h,
        magFilter: f,
        type: y,
        format: m,
        internalFormat: c,
        unpackAlignment: L,
        premultiplyAlpha: C,
        flipY: false,
        generateMipmaps: false
      })), this.textures[g].update(), this.gl.framebufferTexture2D(this.target, this.gl.COLOR_ATTACHMENT0 + g, this.gl.TEXTURE_2D, this.textures[g].texture, 0), w.push(this.gl.COLOR_ATTACHMENT0 + g);
      w.length > 1 && this.gl.renderer.drawBuffers(w), this.texture = this.textures[0], r && (this.gl.renderer.isWebgl2 || this.gl.renderer.getExtension("WEBGL_depth_texture")) ? (this.depthTexture = new qe(e, {
        width: t,
        height: o,
        minFilter: this.gl.NEAREST,
        magFilter: this.gl.NEAREST,
        format: this.stencil ? this.gl.DEPTH_STENCIL : this.gl.DEPTH_COMPONENT,
        internalFormat: e.renderer.isWebgl2 ? this.stencil ? this.gl.DEPTH24_STENCIL8 : this.gl.DEPTH_COMPONENT16 : this.gl.DEPTH_COMPONENT,
        type: this.stencil ? this.gl.UNSIGNED_INT_24_8 : this.gl.UNSIGNED_INT
      }), this.depthTexture.update(), this.gl.framebufferTexture2D(this.target, this.stencil ? this.gl.DEPTH_STENCIL_ATTACHMENT : this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0)) : (a && !l && (this.depthBuffer = this.gl.createRenderbuffer(), this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, t, o), this.gl.framebufferRenderbuffer(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer)), l && !a && (this.stencilBuffer = this.gl.createRenderbuffer(), this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.stencilBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.STENCIL_INDEX8, t, o), this.gl.framebufferRenderbuffer(this.target, this.gl.STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.stencilBuffer)), a && l && (this.depthStencilBuffer = this.gl.createRenderbuffer(), this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthStencilBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, t, o), this.gl.framebufferRenderbuffer(this.target, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.depthStencilBuffer))), this.gl.renderer.bindFramebuffer({
        target: this.target
      });
    }
    setSize(e, t) {
      if (!(this.width === e && this.height === t)) {
        this.width = e, this.height = t, this.gl.renderer.bindFramebuffer(this);
        for (let o = 0; o < this.textures.length; o++) this.textures[o].width = e, this.textures[o].height = t, this.textures[o].needsUpdate = true, this.textures[o].update(), this.gl.framebufferTexture2D(this.target, this.gl.COLOR_ATTACHMENT0 + o, this.gl.TEXTURE_2D, this.textures[o].texture, 0);
        this.depthTexture ? (this.depthTexture.width = e, this.depthTexture.height = t, this.depthTexture.needsUpdate = true, this.depthTexture.update(), this.gl.framebufferTexture2D(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0)) : (this.depthBuffer && (this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, e, t)), this.stencilBuffer && (this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.stencilBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.STENCIL_INDEX8, e, t)), this.depthStencilBuffer && (this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthStencilBuffer), this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, e, t))), this.gl.renderer.bindFramebuffer({
          target: this.target
        });
      }
    }
  }
  class Ke extends ht {
    constructor(e, { width: t = 1, height: o = 1, widthSegments: s = 1, heightSegments: n = 1, attributes: a = {} } = {}) {
      const l = s, r = n, u = (l + 1) * (r + 1), d = l * r * 6, v = new Float32Array(u * 3), h = new Float32Array(u * 3), f = new Float32Array(u * 2), y = d > 65536 ? new Uint32Array(d) : new Uint16Array(d);
      Ke.buildPlane(v, h, f, y, t, o, 0, l, r), Object.assign(a, {
        position: {
          size: 3,
          data: v
        },
        normal: {
          size: 3,
          data: h
        },
        uv: {
          size: 2,
          data: f
        },
        index: {
          data: y
        }
      }), super(e, a);
    }
    static buildPlane(e, t, o, s, n, a, l, r, u, d = 0, v = 1, h = 2, f = 1, y = -1, m = 0, c = 0) {
      const L = m, C = n / r, w = a / u;
      for (let g = 0; g <= u; g++) {
        let x = g * w - a / 2;
        for (let _ = 0; _ <= r; _++, m++) {
          let E = _ * C - n / 2;
          if (e[m * 3 + d] = E * f, e[m * 3 + v] = x * y, e[m * 3 + h] = l / 2, t[m * 3 + d] = 0, t[m * 3 + v] = 0, t[m * 3 + h] = l >= 0 ? 1 : -1, o[m * 2] = _ / r, o[m * 2 + 1] = 1 - g / u, g === u || _ === r) continue;
          let S = L + _ + g * (r + 1), P = L + _ + (g + 1) * (r + 1), R = L + _ + (g + 1) * (r + 1) + 1, A = L + _ + g * (r + 1) + 1;
          s[c * 6] = S, s[c * 6 + 1] = P, s[c * 6 + 2] = A, s[c * 6 + 3] = P, s[c * 6 + 4] = R, s[c * 6 + 5] = A, c++;
        }
      }
    }
  }
  class St extends ht {
    constructor(e, { radius: t = 0.5, widthSegments: o = 16, heightSegments: s = Math.ceil(o * 0.5), phiStart: n = 0, phiLength: a = Math.PI * 2, thetaStart: l = 0, thetaLength: r = Math.PI, attributes: u = {} } = {}) {
      const d = o, v = s, h = n, f = a, y = l, m = r, c = (d + 1) * (v + 1), L = d * v * 6, C = new Float32Array(c * 3), w = new Float32Array(c * 3), g = new Float32Array(c * 2), x = c > 65536 ? new Uint32Array(L) : new Uint16Array(L);
      let _ = 0, E = 0, S = 0, P = y + m;
      const R = [];
      let A = new z();
      for (let D = 0; D <= v; D++) {
        let N = [], G = D / v;
        for (let K = 0; K <= d; K++, _++) {
          let U = K / d, $ = -t * Math.cos(h + U * f) * Math.sin(y + G * m), F = t * Math.cos(y + G * m), b = t * Math.sin(h + U * f) * Math.sin(y + G * m);
          C[_ * 3] = $, C[_ * 3 + 1] = F, C[_ * 3 + 2] = b, A.set($, F, b).normalize(), w[_ * 3] = A.x, w[_ * 3 + 1] = A.y, w[_ * 3 + 2] = A.z, g[_ * 2] = U, g[_ * 2 + 1] = 1 - G, N.push(E++);
        }
        R.push(N);
      }
      for (let D = 0; D < v; D++) for (let N = 0; N < d; N++) {
        let G = R[D][N + 1], K = R[D][N], U = R[D + 1][N], $ = R[D + 1][N + 1];
        (D !== 0 || y > 0) && (x[S * 3] = G, x[S * 3 + 1] = K, x[S * 3 + 2] = $, S++), (D !== v - 1 || P < Math.PI) && (x[S * 3] = K, x[S * 3 + 1] = U, x[S * 3 + 2] = $, S++);
      }
      Object.assign(u, {
        position: {
          size: 3,
          data: C
        },
        normal: {
          size: 3,
          data: w
        },
        uv: {
          size: 2,
          data: g
        },
        index: {
          data: x
        }
      }), super(e, u);
    }
  }
  class on extends ht {
    constructor(e, { attributes: t = {} } = {}) {
      Object.assign(t, {
        position: {
          size: 2,
          data: new Float32Array([
            -1,
            -1,
            3,
            -1,
            -1,
            3
          ])
        },
        uv: {
          size: 2,
          data: new Float32Array([
            0,
            0,
            2,
            0,
            0,
            2
          ])
        }
      }), super(e, t);
    }
  }
  const nn = new ot(), rn = new ot(), sn = new ot(), bt = new z(), Nt = new z(), Bt = new z(), an = new z(), ln = new z(), cn = new z(), kt = new z(), wt = new z(), Gt = new z(), Wt = new z(), un = new z(), Ut = new vt();
  class dn {
    constructor() {
      this.origin = new z(), this.direction = new z();
    }
    castMouse(e, t = [
      0,
      0
    ]) {
      if (e.type === "orthographic") {
        const { left: o, right: s, bottom: n, top: a, zoom: l } = e, r = o / l + (s - o) / l * (t[0] * 0.5 + 0.5), u = n / l + (a - n) / l * (t[1] * 0.5 + 0.5);
        this.origin.set(r, u, 0), this.origin.applyMatrix4(e.worldMatrix), this.direction.x = -e.worldMatrix[8], this.direction.y = -e.worldMatrix[9], this.direction.z = -e.worldMatrix[10];
      } else e.worldMatrix.getTranslation(this.origin), this.direction.set(t[0], t[1], 0.5), e.unproject(this.direction), this.direction.sub(this.origin).normalize();
    }
    intersectBounds(e, { maxDistance: t, output: o = [] } = {}) {
      Array.isArray(e) || (e = [
        e
      ]);
      const s = Ut, n = bt, a = Nt, l = o;
      return l.length = 0, e.forEach((r) => {
        (!r.geometry.bounds || r.geometry.bounds.radius === 1 / 0) && r.geometry.computeBoundingSphere();
        const u = r.geometry.bounds;
        s.inverse(r.worldMatrix);
        let d;
        if (t && (a.copy(this.direction).scaleRotateMatrix4(s), d = t * a.len()), n.copy(this.origin).applyMatrix4(s), a.copy(this.direction).transformDirection(s), t && n.distance(u.center) - u.radius > d) return;
        let v = 0;
        if (r.geometry.raycast === "sphere") {
          if (n.distance(u.center) > u.radius && (v = this.intersectSphere(u, n, a), !v)) return;
        } else if ((n.x < u.min.x || n.x > u.max.x || n.y < u.min.y || n.y > u.max.y || n.z < u.min.z || n.z > u.max.z) && (v = this.intersectBox(u, n, a), !v)) return;
        t && v > d || (r.hit || (r.hit = {
          localPoint: new z(),
          point: new z()
        }), r.hit.localPoint.copy(a).multiply(v).add(n), r.hit.point.copy(r.hit.localPoint).applyMatrix4(r.worldMatrix), r.hit.distance = r.hit.point.distance(this.origin), l.push(r));
      }), l.sort((r, u) => r.hit.distance - u.hit.distance), l;
    }
    intersectMeshes(e, { cullFace: t = true, maxDistance: o, includeUV: s = true, includeNormal: n = true, output: a = [] } = {}) {
      const l = this.intersectBounds(e, {
        maxDistance: o,
        output: a
      });
      if (!l.length) return l;
      const r = Ut, u = bt, d = Nt, v = Bt, h = an, f = ln, y = cn, m = kt, c = wt, L = nn, C = rn, w = sn;
      for (let g = l.length - 1; g >= 0; g--) {
        const x = l[g];
        r.inverse(x.worldMatrix);
        let _;
        o && (d.copy(this.direction).scaleRotateMatrix4(r), _ = o * d.len()), u.copy(this.origin).applyMatrix4(r), d.copy(this.direction).transformDirection(r);
        let E = 0, S, P, R;
        const A = x.geometry, D = A.attributes, N = D.index, G = D.position, K = Math.max(0, A.drawRange.start), U = Math.min(N ? N.count : G.count, A.drawRange.start + A.drawRange.count), $ = G.size;
        for (let F = K; F < U; F += 3) {
          const b = N ? N.data[F] : F, M = N ? N.data[F + 1] : F + 1, O = N ? N.data[F + 2] : F + 2;
          v.fromArray(G.data, b * $), h.fromArray(G.data, M * $), f.fromArray(G.data, O * $);
          const B = this.intersectTriangle(v, h, f, t, u, d, m);
          B && (o && B > _ || (!E || B < E) && (E = B, S = b, P = M, R = O, y.copy(m)));
        }
        E || l.splice(g, 1), x.hit.localPoint.copy(d).multiply(E).add(u), x.hit.point.copy(x.hit.localPoint).applyMatrix4(x.worldMatrix), x.hit.distance = x.hit.point.distance(this.origin), x.hit.faceNormal || (x.hit.localFaceNormal = new z(), x.hit.faceNormal = new z(), x.hit.uv = new ot(), x.hit.localNormal = new z(), x.hit.normal = new z()), x.hit.localFaceNormal.copy(y), x.hit.faceNormal.copy(x.hit.localFaceNormal).transformDirection(x.worldMatrix), (s || n) && (v.fromArray(G.data, S * 3), h.fromArray(G.data, P * 3), f.fromArray(G.data, R * 3), this.getBarycoord(x.hit.localPoint, v, h, f, c)), s && D.uv && (L.fromArray(D.uv.data, S * 2), C.fromArray(D.uv.data, P * 2), w.fromArray(D.uv.data, R * 2), x.hit.uv.set(L.x * c.x + C.x * c.y + w.x * c.z, L.y * c.x + C.y * c.y + w.y * c.z)), n && D.normal && (v.fromArray(D.normal.data, S * 3), h.fromArray(D.normal.data, P * 3), f.fromArray(D.normal.data, R * 3), x.hit.localNormal.set(v.x * c.x + h.x * c.y + f.x * c.z, v.y * c.x + h.y * c.y + f.y * c.z, v.z * c.x + h.z * c.y + f.z * c.z), x.hit.normal.copy(x.hit.localNormal).transformDirection(x.worldMatrix));
      }
      return l.sort((g, x) => g.hit.distance - x.hit.distance), l;
    }
    intersectPlane(e, t = this.origin, o = this.direction) {
      const s = bt;
      s.sub(e.origin, t);
      const n = s.dot(e.normal), a = o.dot(e.normal);
      if (a == 0) return 0;
      const l = n / a;
      return l <= 0 ? 0 : t.add(o.scale(l));
    }
    intersectSphere(e, t = this.origin, o = this.direction) {
      const s = Bt;
      s.sub(e.center, t);
      const n = s.dot(o), a = s.dot(s) - n * n, l = e.radius * e.radius;
      if (a > l) return 0;
      const r = Math.sqrt(l - a), u = n - r, d = n + r;
      return u < 0 && d < 0 ? 0 : u < 0 ? d : u;
    }
    intersectBox(e, t = this.origin, o = this.direction) {
      let s, n, a, l, r, u;
      const d = 1 / o.x, v = 1 / o.y, h = 1 / o.z, f = e.min, y = e.max;
      return s = ((d >= 0 ? f.x : y.x) - t.x) * d, n = ((d >= 0 ? y.x : f.x) - t.x) * d, a = ((v >= 0 ? f.y : y.y) - t.y) * v, l = ((v >= 0 ? y.y : f.y) - t.y) * v, s > l || a > n || (a > s && (s = a), l < n && (n = l), r = ((h >= 0 ? f.z : y.z) - t.z) * h, u = ((h >= 0 ? y.z : f.z) - t.z) * h, s > u || r > n) || (r > s && (s = r), u < n && (n = u), n < 0) ? 0 : s >= 0 ? s : n;
    }
    intersectTriangle(e, t, o, s = true, n = this.origin, a = this.direction, l = kt) {
      const r = wt, u = Gt, d = Wt;
      r.sub(t, e), u.sub(o, e), l.cross(r, u);
      let v = a.dot(l);
      if (!v) return 0;
      let h;
      if (v > 0) {
        if (s) return 0;
        h = 1;
      } else h = -1, v = -v;
      d.sub(n, e);
      let f = h * a.dot(u.cross(d, u));
      if (f < 0) return 0;
      let y = h * a.dot(r.cross(d));
      if (y < 0 || f + y > v) return 0;
      let m = -h * d.dot(l);
      return m < 0 ? 0 : m / v;
    }
    getBarycoord(e, t, o, s, n = wt) {
      const a = Gt, l = Wt, r = un;
      a.sub(s, t), l.sub(o, t), r.sub(e, t);
      const u = a.dot(a), d = a.dot(l), v = a.dot(r), h = l.dot(l), f = l.dot(r), y = u * h - d * d;
      if (y === 0) return n.set(-2, -1, -1);
      const m = 1 / y, c = (h * v - d * f) * m, L = (u * f - d * v) * m;
      return n.set(1 - c - L, L, c);
    }
  }
  class no {
    constructor(e, { width: t, height: o, dpr: s, wrapS: n = e.CLAMP_TO_EDGE, wrapT: a = e.CLAMP_TO_EDGE, minFilter: l = e.LINEAR, magFilter: r = e.LINEAR, geometry: u = new on(e), targetOnly: d = null, depth: v = true } = {}) {
      this.gl = e, this.passes = [], this.geometry = u, this.uniform = {
        value: null
      }, this.targetOnly = d, s && (this.dpr = s), t && (this.width = t), o && (this.height = o), s = this.dpr || this.gl.renderer.dpr, this.resolutionWidth = Math.floor(this.width || this.gl.renderer.width * s), this.resolutionHeight = Math.floor(this.height || this.gl.renderer.height * s);
      let h = {
        dpr: this.dpr,
        width: this.resolutionWidth,
        height: this.resolutionHeight,
        wrapS: n,
        wrapT: a,
        minFilter: l,
        magFilter: r,
        depth: v
      };
      const f = this.fbo = {
        read: new dt(this.gl, h),
        write: new dt(this.gl, h),
        swap: () => {
          let y = f.read;
          f.read = f.write, f.write = y;
        }
      };
    }
    addPass({ vertex: e = fn, fragment: t = pn, uniforms: o = {}, textureUniform: s = "tMap", enabled: n = true } = {}) {
      o[s] = {
        value: this.fbo.read.texture
      };
      const a = new Ee(this.gl, {
        vertex: e,
        fragment: t,
        uniforms: o
      }), r = {
        mesh: new eo(this.gl, {
          geometry: this.geometry,
          program: a
        }),
        program: a,
        uniforms: o,
        enabled: n,
        textureUniform: s
      };
      return this.passes.push(r), r;
    }
    resize({ width: e, height: t, dpr: o } = {}) {
      o && (this.dpr = o), e && (this.width = e), t && (this.height = t), o = this.dpr || this.gl.renderer.dpr, this.resolutionWidth = Math.floor(this.width || this.gl.renderer.width * o), this.resolutionHeight = Math.floor(this.height || this.gl.renderer.height * o), this.fbo.read.setSize(this.resolutionWidth, this.resolutionHeight), this.fbo.write.setSize(this.resolutionWidth, this.resolutionHeight);
    }
    render({ scene: e, camera: t, texture: o, target: s = null, update: n = true, sort: a = true, frustumCull: l = true, beforePostCallbacks: r }) {
      const u = this.passes.filter((d) => d.enabled);
      o || (this.gl.renderer.render({
        scene: e,
        camera: t,
        target: u.length || !s && this.targetOnly ? this.fbo.write : s,
        update: n,
        sort: a,
        frustumCull: l
      }), this.fbo.swap(), r && r.forEach((d) => d && d())), u.forEach((d, v) => {
        d.mesh.program.uniforms[d.textureUniform].value = !v && o ? o : this.fbo.read.texture, this.gl.renderer.render({
          scene: d.mesh,
          target: v === u.length - 1 && (s || !this.targetOnly) ? s : this.fbo.write,
          clear: true
        }), this.fbo.swap();
      }), this.uniform.value = this.fbo.read.texture;
    }
  }
  const fn = `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`, pn = `
    precision highp float;

    uniform sampler2D tMap;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;
  class hn extends qe {
    constructor(e, { buffer: t, wrapS: o = e.CLAMP_TO_EDGE, wrapT: s = e.CLAMP_TO_EDGE, anisotropy: n = 0, minFilter: a, magFilter: l } = {}) {
      if (super(e, {
        generateMipmaps: false,
        wrapS: o,
        wrapT: s,
        anisotropy: n,
        minFilter: a,
        magFilter: l
      }), t) return this.parseBuffer(t);
    }
    parseBuffer(e) {
      const t = new vn(e);
      t.mipmaps.isCompressedTexture = true, this.image = t.mipmaps, this.internalFormat = t.glInternalFormat, t.numberOfMipmapLevels > 1 ? this.minFilter === this.gl.LINEAR && (this.minFilter = this.gl.NEAREST_MIPMAP_LINEAR) : this.minFilter === this.gl.NEAREST_MIPMAP_LINEAR && (this.minFilter = this.gl.LINEAR);
    }
  }
  function vn(i) {
    const e = [
      171,
      75,
      84,
      88,
      32,
      49,
      49,
      187,
      13,
      10,
      26,
      10
    ], t = new Uint8Array(i, 0, 12);
    for (let v = 0; v < t.length; v++) if (t[v] !== e[v]) return;
    const o = Uint32Array.BYTES_PER_ELEMENT, s = new DataView(i, 12, 13 * o), n = s.getUint32(0, true) === 67305985;
    if (s.getUint32(1 * o, n) !== 0) return;
    this.glInternalFormat = s.getUint32(4 * o, n);
    let l = s.getUint32(6 * o, n), r = s.getUint32(7 * o, n);
    this.numberOfFaces = s.getUint32(10 * o, n), this.numberOfMipmapLevels = Math.max(1, s.getUint32(11 * o, n));
    const u = s.getUint32(12 * o, n);
    this.mipmaps = [];
    let d = 64 + u;
    for (let v = 0; v < this.numberOfMipmapLevels; v++) {
      const h = new Int32Array(i, d, 1)[0];
      d += 4;
      for (let f = 0; f < this.numberOfFaces; f++) {
        const y = new Uint8Array(i, d, h);
        this.mipmaps.push({
          data: y,
          width: l,
          height: r
        }), d += h, d += 3 - (h + 3) % 4;
      }
      l = l >> 1, r = r >> 1;
    }
  }
  let lt = {};
  const Ze = [];
  class Vt {
    static load(e, { src: t, wrapS: o = e.CLAMP_TO_EDGE, wrapT: s = e.CLAMP_TO_EDGE, anisotropy: n = 0, format: a = e.RGBA, internalFormat: l = a, generateMipmaps: r = true, minFilter: u = r ? e.NEAREST_MIPMAP_LINEAR : e.LINEAR, magFilter: d = e.LINEAR, premultiplyAlpha: v = false, unpackAlignment: h = 4, flipY: f = true } = {}) {
      const y = this.getSupportedExtensions(e);
      let m = "none";
      if (typeof t == "string" && (m = t.split(".").pop().split("?")[0].toLowerCase()), typeof t == "object") {
        for (const C in t) if (y.includes(C.toLowerCase())) {
          m = C.toLowerCase(), t = t[C];
          break;
        }
      }
      const c = t + o + s + n + a + l + r + u + d + v + h + f + e.renderer.id;
      if (lt[c]) return lt[c];
      let L;
      switch (m) {
        case "ktx":
        case "pvrtc":
        case "s3tc":
        case "etc":
        case "etc1":
        case "astc":
          L = new hn(e, {
            src: t,
            wrapS: o,
            wrapT: s,
            anisotropy: n,
            minFilter: u,
            magFilter: d
          }), L.loaded = this.loadKTX(t, L);
          break;
        case "webp":
        case "jpg":
        case "jpeg":
        case "png":
          L = new qe(e, {
            wrapS: o,
            wrapT: s,
            anisotropy: n,
            format: a,
            internalFormat: l,
            generateMipmaps: r,
            minFilter: u,
            magFilter: d,
            premultiplyAlpha: v,
            unpackAlignment: h,
            flipY: f
          }), L.loaded = this.loadImage(e, t, L, f);
          break;
        default:
          L = new qe(e);
      }
      return L.ext = m, lt[c] = L, L;
    }
    static getSupportedExtensions(e) {
      if (Ze.length) return Ze;
      const t = {
        pvrtc: e.renderer.getExtension("WEBGL_compressed_texture_pvrtc") || e.renderer.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
        s3tc: e.renderer.getExtension("WEBGL_compressed_texture_s3tc"),
        etc1: e.renderer.getExtension("WEBGL_compressed_texture_etc1"),
        astc: e.renderer.getExtension("WEBGL_compressed_texture_astc"),
        bc7: e.renderer.getExtension("EXT_texture_compression_bptc")
      };
      for (const o in t) t[o] && Ze.push(o);
      return Ze.push("png", "jpg", "webp"), Ze;
    }
    static loadKTX(e, t) {
      return fetch(e).then((o) => o.arrayBuffer()).then((o) => t.parseBuffer(o));
    }
    static loadImage(e, t, o, s) {
      return mn(t, s).then((n) => (!e.renderer.isWebgl2 && (!Ht(n.width) || !Ht(n.height)) && (o.generateMipmaps && (o.generateMipmaps = false), o.minFilter === e.NEAREST_MIPMAP_LINEAR && (o.minFilter = e.LINEAR), o.wrapS === e.REPEAT && (o.wrapS = o.wrapT = e.CLAMP_TO_EDGE)), o.image = n, o.onUpdate = () => {
        n.close && n.close(), o.onUpdate = null;
      }, n));
    }
    static clearCache() {
      lt = {};
    }
  }
  function Ht(i) {
    return Math.log2(i) % 1 === 0;
  }
  function mn(i, e) {
    return new Promise((t, o) => {
      if (gn()) fetch(i, {
        mode: "cors"
      }).then((s) => s.blob()).then((s) => createImageBitmap(s, {
        imageOrientation: e ? "flipY" : "none",
        premultiplyAlpha: "none"
      })).then(t).catch((s) => o(s));
      else {
        const s = new Image();
        s.crossOrigin = "", s.src = i, s.onerror = ({ type: n }) => o(`${n}: Loading image`), s.onload = () => t(s);
      }
    });
  }
  function gn() {
    if (!navigator.userAgent.toLowerCase().includes("chrome")) return false;
    try {
      createImageBitmap;
    } catch {
      return false;
    }
    return true;
  }
  let xn = 10;
  function ro(i) {
    i || (i = ++xn);
    const e = [
      (i >> 0 & 255) / 255,
      (i >> 8 & 255) / 255,
      (i >> 16 & 255) / 255,
      (i >> 24 & 255) / 255
    ];
    return {
      id: i,
      uId: e
    };
  }
  const $t = new vt();
  class fe extends Array {
    constructor(e = 0, t = e, o = e, s = "YXZ") {
      super(e, t, o);
      __publicField(this, "onChange");
      __publicField(this, "order");
      return this.order = s, this.onChange = () => {
      }, this;
    }
    get x() {
      return this[0];
    }
    get y() {
      return this[1];
    }
    get z() {
      return this[2];
    }
    set x(e) {
      const t = this[0];
      this[0] = e, t !== e && this.onChange();
    }
    set y(e) {
      const t = this[1];
      this[1] = e, t !== e && this.onChange();
    }
    set z(e) {
      const t = this[2];
      this[2] = e, t !== e && this.onChange();
    }
    set(e, t = e, o = e) {
      if (e.length) return this.copy(e);
      const s = this[0], n = this[1], a = this[2];
      return this[0] = e, this[1] = t, this[2] = o, (s !== e || n !== t || a !== o) && this.onChange(), this;
    }
    copy(e) {
      const t = this[0], o = this[1], s = this[2], { x: n, y: a, z: l } = e;
      return this[0] = n, this[1] = a, this[2] = l, (t !== n || o !== a || s !== l) && this.onChange(), this.onChange(), this;
    }
    reorder(e) {
      return this.order = e, this.onChange(), this;
    }
    fromRotationMatrix(e, t = this.order) {
      return yn(this, e, t), this.onChange(), this;
    }
    fromQuaternion(e, t = this.order, o) {
      return $t.fromQuaternion(e), this.fromRotationMatrix($t, t), o || this.onChange(), this;
    }
    fromArray(e, t = 0) {
      return this[0] = e[t], this[1] = e[t + 1], this[2] = e[t + 2], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this[0], e[t + 1] = this[1], e[t + 2] = this[2], e;
    }
  }
  function yn(i, e, t = "YXZ") {
    return t === "XYZ" ? (i[1] = Math.asin(Math.min(Math.max(e[8], -1), 1)), Math.abs(e[8]) < 0.99999 ? (i[0] = Math.atan2(-e[9], e[10]), i[2] = Math.atan2(-e[4], e[0])) : (i[0] = Math.atan2(e[6], e[5]), i[2] = 0)) : t === "YXZ" ? (i[0] = Math.asin(-Math.min(Math.max(e[9], -1), 1)), Math.abs(e[9]) < 0.99999 ? (i[1] = Math.atan2(e[8], e[10]), i[2] = Math.atan2(e[1], e[5])) : (i[1] = Math.atan2(-e[2], e[0]), i[2] = 0)) : t === "ZXY" ? (i[0] = Math.asin(Math.min(Math.max(e[6], -1), 1)), Math.abs(e[6]) < 0.99999 ? (i[1] = Math.atan2(-e[2], e[10]), i[2] = Math.atan2(-e[4], e[5])) : (i[1] = 0, i[2] = Math.atan2(e[1], e[0]))) : t === "ZYX" ? (i[1] = Math.asin(-Math.min(Math.max(e[2], -1), 1)), Math.abs(e[2]) < 0.99999 ? (i[0] = Math.atan2(e[6], e[10]), i[2] = Math.atan2(e[1], e[0])) : (i[0] = 0, i[2] = Math.atan2(-e[4], e[5]))) : t === "YZX" ? (i[2] = Math.asin(Math.min(Math.max(e[1], -1), 1)), Math.abs(e[1]) < 0.99999 ? (i[0] = Math.atan2(-e[9], e[5]), i[1] = Math.atan2(-e[2], e[0])) : (i[0] = 0, i[1] = Math.atan2(e[8], e[10]))) : t === "XZY" && (i[2] = Math.asin(-Math.min(Math.max(e[4], -1), 1)), Math.abs(e[4]) < 0.99999 ? (i[0] = Math.atan2(e[6], e[5]), i[1] = Math.atan2(e[8], e[0])) : (i[0] = Math.atan2(-e[9], e[10]), i[1] = 0)), i;
  }
  const Tt = Et.textures.cards.length + Et.textures.featured.length, Mt = [
    15,
    6,
    10,
    2,
    19,
    13,
    4,
    9,
    18,
    22,
    16,
    12,
    1,
    17,
    0,
    3,
    23,
    14,
    21,
    11,
    20,
    8,
    5,
    7
  ], _n = [
    6,
    4,
    5,
    2,
    3,
    3,
    2,
    1,
    7,
    2,
    3,
    6,
    0,
    0,
    4,
    1,
    1,
    1,
    4,
    5,
    2,
    4,
    0,
    5
  ], ue = {
    aspect: 51.1 / 68.14,
    desktop: {
      designWidth: 51.1
    },
    gridConfig: {
      x: Tt,
      y: 8
    },
    gap: {
      x: 10
    },
    margin: {
      y: 105.1
    },
    ringRadiusMarginMobile: 120
  };
  function bn(i) {
    return (-i + Tt * 0.75) * Math.PI * 2 / Tt;
  }
  const [wn, Ue] = mt(() => {
    const { vh: i, vw: e, scale: t, scaleWidth: o } = te(), s = V(), n = V(new z(0)), a = Ce(new z(0)), l = Ce(new z(0)), r = V(new fe(0, 0, 0, "XYZ")), u = Ce(new fe(0, 0, 0, "XYZ")), d = Ce(new fe(0, 0, 0, "XYZ")), v = Ce(new fe(0, 0, 0, "XYZ")), h = Q(() => v.z + u.z), f = V(new z(1)), y = V(new z(1)), m = Ce(new z(1)), c = new z(1);
    H([
      m,
      f,
      y
    ], ([M, O, B]) => {
      c.set(M.x * O.x * B.x, M.y * O.y * B.y, M.z * O.z * B.z);
    });
    const L = Pt(), { introProgress: C, stackProgress: w } = le(), g = pe(false);
    H(g, (M) => {
      M === true ? L.start() : L.stop();
    }, {
      immediate: true
    });
    const x = te(), _ = Q(() => x.isLg.value ? 328 * x.scale.value : x.isMd.value ? Math.max(i.value, e.value) * 0.5 - ue.ringRadiusMarginMobile * 1.3 : Math.max(i.value, e.value) * 0.5 - ue.ringRadiusMarginMobile * t.value), E = Q(() => _.value * m.z), S = Q(() => ({
      x: a.x + l.x + e.value * 0.5,
      y: -a.y - l.y + i.value * 0.5
    })), P = {
      value: 0
    }, R = new z(1), { textures: A, indexTexture: D, lazyTextures: N } = xe();
    function G({ x: M, y: O }) {
      return [
        (M - (ue.gridConfig.x - 1) * 0.5) * (ue.desktop.designWidth + ue.gap.x) * o.value,
        p.map(O, 0, ue.gridConfig.y - 1, i.value * 0.5 - ue.margin.y, ue.margin.y - i.value * 0.5),
        0
      ];
    }
    const K = Mt[0], U = [
      ...Object.entries(A.featured),
      ...Object.entries(A.cards)
    ], $ = p.Arr.create(Mt.length).map((M) => {
      const O = Mt[M], [B, I] = U[M], k = {
        x: O,
        y: _n[M]
      };
      return {
        scale: R,
        rotation: new fe(0, 0, 0, "XYZ"),
        rotationPlane: new fe(0, 0, 0, "XYZ"),
        position: new z(...G(k)),
        positionPlane: new z(0),
        gridPos: k,
        index: O,
        tMap: {
          value: I
        },
        isFeatured: M === 0,
        loaded: N[B].loaded,
        uOpacity: V(1),
        uLoadOpacity: V(0),
        initialTheta: bn(O)
      };
    });
    $.sort((M, O) => M.index - O.index);
    const F = {
      value: 1
    }, b = {
      value: 0
    };
    return H(() => w.part2, (M) => {
      b.value = M;
    }), H(() => w.cube, (M) => {
      b.value = 1 - p.Clamp(p.iLerp(M, 0, 0.8), 0, 1);
    }), {
      containerRef: s,
      positionContainer: n,
      positionWrapper: a,
      positionZoom: l,
      rotationWrapper: u,
      rotationContainer: r,
      rotationZoom: v,
      rotationMouse: d,
      thetaRingTrue: h,
      scaleWrapper: y,
      scaleZoom: m,
      scaleContainter: f,
      scaleTrue: c,
      ringCenterPixel: S,
      ringRadius: E,
      ringRadiusBase: _,
      introProgress: C,
      introDone: g,
      meshList: $,
      meshScale: R,
      gridToPos: G,
      mouseForce: P,
      featuredIndex: K,
      uAspect: F,
      uFrost: b
    };
  }), Mn = (i) => {
    const e = new tn({
      canvas: i,
      alpha: true,
      antialias: false,
      width: innerWidth,
      height: innerHeight,
      dpr: devicePixelRatio,
      powerPreference: "high-performance"
    }), t = e.gl, o = {
      value: [
        innerWidth * devicePixelRatio,
        innerHeight * devicePixelRatio
      ]
    }, s = {
      value: [
        1 / o.value[0],
        1 / o.value[1]
      ]
    }, n = V(0);
    ye((r) => {
      o.value = [
        r.vw * devicePixelRatio,
        r.vh * devicePixelRatio
      ], s.value = [
        1 / o.value[0],
        1 / o.value[1]
      ];
    });
    const a = V(new Ie()), l = {
      renderer: e,
      gl: t,
      uResolution: o,
      uRes: s,
      uPortal: n,
      scene: a
    };
    return Pe("ogl", l), l;
  }, ge = () => So("ogl"), [Rt, ft] = mt((i) => {
    const e = V(i), t = pe(0);
    return {
      camera: e,
      orthoPerspective: t
    };
  }), Xt = {
    OGLMesh: eo,
    OGLProgram: Ee,
    OGLGeometry: ht,
    OGLTransform: Ie
  };
  const En = [
    "key",
    "position",
    "ref",
    "ref_for",
    "ref_key",
    "onVnodeBeforeMount",
    "onVnodeMounted",
    "onVnodeUpdated",
    "onVnodeBeforeUnmount",
    "onVnodeUnmounted",
    "rotation",
    "position",
    "scale"
  ];
  let jt = null;
  const Zt = () => ({
    parent: null
  }), Tn = (i) => {
    const { gl: e } = i;
    return {
      createElement(t, o, s, n) {
        if (t === "template") return null;
        n || (n = {});
        let a;
        if (Xt[t]) {
          let l = function(d, v = En) {
            return Object.fromEntries(Object.entries(d).filter(([h]) => !v.includes(h)));
          };
          const r = Xt[t], u = l(n);
          r === Ie ? a = new r() : a = new r(e, u), a instanceof Ie && (p.isKeyOf(n, "position") && (a.position = n.position), p.isKeyOf(n, "rotation") && (n.rotation instanceof gt || n.rotation instanceof fe ? (n.rotation._INTERNAL || (n.rotation._INTERNAL = {
            targets: []
          }, n.rotation.onChange = () => {
            for (const d of n.rotation._INTERNAL.targets) d.set(n.rotation);
          }), n.rotation._INTERNAL.targets.push(a.rotation), a.rotation.set(n.rotation)) : (a.quaternion = n.rotation, a.rotation.onChange = () => a.quaternion.fromEuler(a.rotation, true))), p.isKeyOf(n, "scale") && (a.scale = n.scale));
        } else a = new Ie();
        return a;
      },
      insert(t, o) {
        o && (jt = o);
        const s = o ?? jt;
        t !== void 0 && (t.parent = o, t instanceof Ie && s !== void 0 && t.setParent(s));
      },
      remove(t) {
        t && t instanceof Ie && t.setParent(null);
      },
      patchProp(t, o, s, n, a, l) {
        if (t !== null) return o === "rotation" && t.children.length > 4, typeof t == "object" && n != null && (t[o] = n), t;
      },
      parentNode(t) {
        return (t == null ? void 0 : t.parent) || null;
      },
      createText: (t) => Zt(),
      createComment: (t) => Zt(),
      setText: (t, o) => "setText",
      setElementText: () => "setElementText",
      nextSibling: (t) => t,
      querySelector: () => "querySelector",
      setScopeId: () => "setScropId",
      cloneNode: () => "cloneNode",
      insertStaticContent: () => "insertStaticContent"
    };
  }, Ln = oe({
    __name: "OGLCanvas",
    setup(i) {
      var _a;
      Ao((_) => ({
        v6a362505: T(C),
        v8912b324: T(g),
        v194b9925: T(x),
        v2f44c9ff: T(w)
      }));
      const e = V(), t = (_a = zt()) == null ? void 0 : _a.appContext.app, o = Ro(), s = V(new Ie()), n = te(), a = Qe(), l = xe(), r = le(), u = Je(), d = Xe(), v = Ae(), h = (_) => oe({
        setup() {
          var _a2;
          const E = (_a2 = zt()) == null ? void 0 : _a2.appContext;
          E && (E.app = t), Pe(Fo, n), Pe(No, a), Pe(Bo, l), Pe(ko, r), Pe(Go, u), Pe(Wo, d), Pe(Uo, v), Pe("ogl", _);
          const S = (o == null ? void 0 : o.default) ? o.default() : [];
          return () => Ot(We, null, S);
        }
      }), f = (_) => {
        const E = h(_), { render: S, createApp: P } = Io(Tn(_)), R = Ot(E);
        S(R, s.value), P(R).mount(s.value);
      }, y = V(null);
      me(async () => {
        const _ = e;
        y.value = await Mn(_.value), l.init(y.value), v.init(), f(y.value);
      });
      const { blobProgress: m } = le(), c = Do(), L = Oo(), C = Q(() => L.footerProgress), w = Q(() => L.footerHeight), g = Q(() => c.formProgress), x = Q(() => c.formWidth);
      return (_, E) => (q(), Y("canvas", {
        ref_key: "canvasRef",
        ref: e,
        class: zo({
          controls: T(r).interfaceEnabled.value,
          "clip-path": T(m).enter !== 0
        })
      }, null, 2));
    }
  }), Pn = Vo(Ln, [
    [
      "__scopeId",
      "data-v-ecb618d2"
    ]
  ]), Cn = {
    io2: `float io2(float x) {
    return x < .5 ? 2. * x * x : (4. - 2. * x) * x - 1.;
}`
  }, io = `
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec2 permute(vec2 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
`, Sn = `
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

// vec4 mod289(vec4 x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// float mod289(float x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec4 permute(vec4 x) {
//     return mod289(((x * 34.0) + 1.0) * x);
// }

// float permute(float x) {
//     return mod289(((x * 34.0) + 1.0) * x);
// }

// vec4 taylorInvSqrt(vec4 r)
// {
//     return 1.79284291400159 - 0.85373472095314 * r;
// }

// float taylorInvSqrt(float r)
// {
//     return 1.79284291400159 - 0.85373472095314 * r;
// }

vec4 grad4(float j, vec4 ip)
{
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p, s;

    p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;

    return p;
}

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
{
    const vec4  C = vec4(0.138196601125011,  // (5 - sqrt(5))/20  G4
        0.276393202250021,  // 2 * G4
        0.414589803375032,  // 3 * G4
        -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i = floor(v + dot(v, vec4(F4)));
  vec4 x0 = v - i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);
    //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

    // Permutations
    i = mod289(i);
  float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute(permute(permute(permute(
        i.w + vec4(i1.w, i2.w, i3.w, 1.0))
        + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
        + i.y + vec4(i1.y, i2.y, i3.y, 1.0))
        + i.x + vec4(i1.x, i2.x, i3.x, 1.0));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);

  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4, p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
        + dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));

}

`, Rn = `
    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat3 normalMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float uTime;
    uniform float uSeed;

    varying vec3 vPosition;
    varying vec3 vNoisedPosition;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec3 vNoisedNormal;
    varying vec2 vUv;
    varying float vNoise;

    ${io}
    ${Sn}
    

    float fbm(vec3 pos) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;

        for (int i = 0; i < 4; i++) { // 4 octaves of noise
            value += amplitude * snoise(vec4(pos * frequency, uSeed + uTime * 0.3));
            frequency *= 2.0;
            amplitude *= 0.5;
        }

        return value;
    }

    void main() {

        vec3 noisedPosition = normalize(position) * length(position);

        vUv = uv;
        vNoise = 1.;
        vPosition = position;
        vNoisedPosition = noisedPosition;
        vNormal = normalize(normalMatrix * normal);
        vNoisedNormal = normalize(normalMatrix * normal);

        
        vec4 modelViewPosition = modelViewMatrix * vec4(vNoisedPosition, 1.0);
        vec4 viewPosition = projectionMatrix * modelViewPosition;

        vWorldPosition = modelViewPosition.xyz;
    
        gl_Position = viewPosition;
    }
`, Dn = `
    precision highp float;
    precision highp int;

    uniform sampler2D tMap;
    uniform float uOpacity;
    uniform float uBlur;
    uniform vec2 uResolution;

    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec3 vNoisedNormal;
    varying vec2 vUv;
    varying float vNoise;
    uniform float uTime;
    uniform vec3 uCameraPosition;

    #define PI 3.14159265359
    ${Cn.io2}

    // Can go down to 10 or so, and still be usable, probably...
    #define ITERATIONS 30

    #define TAU  6.28318530718

    //-------------------------------------------------------------------------------------------
    // Use last part of hash function to generate new random radius and angle...
    vec2 Sample(inout vec2 r)
    {
        r = fract(r * vec2(33.3983, 43.4427));
        return r-.5;
        //return sqrt(r.x+.001) * vec2(sin(r.y * TAU), cos(r.y * TAU))*.5; // <<=== circular sampling.
    }

    //-------------------------------------------------------------------------------------------
    #define HASHSCALE 443.8975
    vec2 Hash22(vec2 p)
    {
        vec3 p3 = fract(vec3(p.xyx) * HASHSCALE);
        p3 += dot(p3, p3.yzx+19.19);
        return fract(vec2((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y));
    }

    //-------------------------------------------------------------------------------------------
    vec4 Blur(vec2 uv, float radius, out vec4 exactTexel)
    {
        radius = radius * .04;
        
        vec2 circle = vec2(radius) * vec2(1.0);
        
        // Remove the time reference to prevent random jittering if you don't like it.
        vec2 random = Hash22(uv);

        // Do the blur here...
        vec4 acc = vec4(0.0);
        for (int i = 0; i < ITERATIONS; i++)
        {
            if(i == 0) {
                exactTexel = texture2D(tMap, uv);
            }
            acc += texture2D(tMap, uv + circle * Sample(random), radius * 10.0);
        }
        return acc / float(ITERATIONS);
    }

    void main() {
        vec2 normalUv = (vNoisedNormal.xy + 1.) * 0.5;

        vec4 texel = vec4(0.);
        vec2 texelSize = 1.0 / vec2(60.);

        vec4 exactTexel = vec4(0.);
        texel = Blur(normalUv, 2., exactTexel);
        texel = mix(exactTexel, texel, uBlur);

        vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
        float fresnel = pow((1.0 - abs(dot(vNoisedNormal, viewDirection))), 6.) * 4.;
        // float fresnel = pow((1.0 - abs(dot(vNoisedNormal, viewDirection))), 3.) * 2.5;

        //  // Light reflection (Phong lighting model)
        vec3 lightDir = normalize(vec3(50., 25., 10.));

        vec3 reflectDir = reflect(-lightDir, vNormal);
        // float specular = pow(max(dot(viewDirection, reflectDir), 0.0), 12.0); // Shininess
        float specular = pow(max(dot(viewDirection, reflectDir), 0.0), 16.0); 

        float diffuse = max(dot(vNormal, lightDir), 0.0);
        float diffuseNoised = max(dot(vNoisedNormal, lightDir), 0.0);

        // **Ambient Occlusion (AO - Fake Soft Shadows)**
        float ao = clamp(1.0 - vNoise * 0.8, 0.2, 1.0); // More noise = more occlusion

        float glassyFactor = pow((1.0 - abs(dot(vNoisedNormal, viewDirection))), 2.0) * 1.2;

        vec4 glassyColor = vec4(0.8, 0.8, 1., 0.1);
        float scattering = exp(-2.0 * (1.0 - diffuseNoised)) * 0.4;

        vec4 baseColor = mix(texel, glassyColor, glassyFactor) + specular * 0.3;
        vec4 shadowColor = vec4(0.05, 0.05, 0.3, 1.0); // Dark blue shadows

        vec4 fresnelColor = vec4(1., 0.5, 0., .1);

        vec4 glassy = mix(texel, (glassyColor), glassyFactor) + specular * diffuse;

        vec4 shaded = mix(baseColor, shadowColor, (1.0 - diffuse) * ao); // Stronger shadows
        vec4 finalColor = mix(shaded, fresnelColor, fresnel + scattering); // Mix with fresnel & glow


        finalColor.a *= uOpacity;

        finalColor.a *= io2(vNormal.z);

        gl_FragColor = finalColor;
    }
`;
  function so(i, { texture: e, seed: t }) {
    const o = ft(), s = {
      value: [
        1,
        1
      ]
    };
    ye(({ vh: l, vw: r }) => {
      s.value[0] = r, s.value[1] = l;
    });
    const n = {
      value: 1
    }, a = {
      value: 0
    };
    return {
      program: new Ee(i, {
        vertex: Rn,
        fragment: Dn,
        transparent: true,
        uniforms: {
          uTime: {
            value: 0
          },
          uSeed: {
            value: t
          },
          uCameraPosition: {
            value: o.camera.value.position
          },
          tMap: e,
          uResolution: s,
          uOpacity: n,
          uBlur: a
        }
      }),
      uOpacity: n,
      uBlur: a
    };
  }
  const [ao, Ve] = mt(() => {
    const i = new ct(0, 0, 0);
    return {
      world: new Ko(i),
      SCALING_FACTOR: 1
    };
  }), Lt = {
    fromVector(i) {
      return new z(i.x, i.y, i.z);
    },
    fromRotation(i) {
      return new xt(i.x, i.y, i.z, i.w);
    },
    toRapier(i) {
      return new ct(i.x, i.y, i.z);
    },
    multiplyScalar(i, e) {
      return new ct(i.x * e, i.y * e, i.z * e);
    },
    sub3(i, e) {
      const t = this.fromVector(i), o = this.fromVector(e);
      return t.sub(o), new ct(t.x, t.y, t.z);
    },
    length(i) {
      return this.fromVector(i).len();
    }
  }, lo = `
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vN;

void main() {
  vUv = uv;

  vN = normal;
  vNormal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`, nt = `
` + lo, rt = `#version 300 es
#define attribute in
#define varying out
` + lo, On = (i, e, t, o) => {
    const { uPortal: s } = ge(), { stackProgress: n } = le(), { uAspect: a, uFrost: l } = Ue(), { isSafari: r } = te(), { textures: u } = xe(), d = Q(() => 1 - n.opacity);
    return {
      program: new Ee(i, {
        fragment: i.renderer.isWebgl2 ? In : zn,
        vertex: i.renderer.isWebgl2 ? rt : nt,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        uniforms: {
          tMap: e,
          uSafari: r,
          uPortal: s,
          uOpacity: t,
          uAspect: a,
          uFrost: l,
          tFrost: {
            value: u["00-frost"][Et.textures["00-frost"][0].src]
          },
          uLight: d
        }
      })
    };
  }, co = `
uniform sampler2D tMap;
uniform sampler2D tFrost;

uniform vec4 uId;
uniform float uOpacity;
uniform float uPortal;
uniform float uLight;
uniform float uFrost;
uniform bool uSafari;

uniform float uAspect;

varying vec3 vNormal;
varying vec3 vN;
varying vec2 vUv;

void main() {
    vec4 color = texture(tMap, vec2(vUv.x, (vUv.y - .5) / uAspect + .5));
    color.a = uOpacity;


    color.rgb *= mix(mix(0.90, 1., 1. - uFrost), 1., length(texture(tFrost, vUv).rgb));

    color.a *= 1. - smoothstep(0.4, 1., length(vUv - .5) * 2.) * .18 * uFrost;

    float diffuse = max(dot(vNormal, normalize(vec3(-10., -10., -1.))), 0.0);

    color.rgb -= color.rgb * vec3(1.,1.,1.) * diffuse * 0.6 * uLight;

    color.rgb -= (1. - abs(vN.z)) * 0.2;

    if(uSafari) {
        color.a = uOpacity;
    }

    gl_FragColor = uPortal >= 1. ? vec4(0., 0., 0., 0.) : color;
}
`, zn = `#extension GL_OES_standard_derivatives : enable
precision highp float;
` + co, In = `#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;
` + co, uo = (i, e) => {
    const { id: t } = ro(e == null ? void 0 : e.id), { registerMaterial: o, registerMesh: s } = Je();
    return o(t, (e == null ? void 0 : e.target) ?? i), s(i), Ct(() => {
      i.value && (i.value.pickerId = t);
    }), {
      id: t
    };
  }, An = [
    "scale",
    "rotation",
    "position"
  ], Fn = [
    "scale"
  ], Nn = [
    "program",
    "geometry"
  ], Bn = 4e5, kn = oe({
    __name: "Blob",
    props: {
      cameraPan: {},
      seed: {},
      setup: {}
    },
    emits: [
      "mouseenter",
      "mouseleave"
    ],
    setup(i, { emit: e }) {
      var _a;
      const { vh: t, vw: o, diagonale: s, scaleWidth: n, isLg: a } = te(), l = i, { initialPos: r, scale: u } = l.setup, d = u * p.Lerp(0.8, 1.2, Math.random()), { gl: v } = ge(), { world: h } = Ve(), f = V(), y = new St(v, {
        widthSegments: 64
      });
      y.raycast = "sphere";
      const { getNewBlob: m, blobsBounds: c, currentBlobHover: L, canDrag: C, activeGravity: w, removeBlob: g, walls: x } = Ae(), { growProgress: _, explosionProgress: E, explosion: S } = Xe(), { blobProgress: P, blobStep: R } = le();
      let A = m();
      const D = {
        value: (_a = A == null ? void 0 : A.lazyTexture) == null ? void 0 : _a.getTexture()
      }, { program: N, uOpacity: G, uBlur: K } = so(v, {
        texture: D,
        seed: l.seed
      });
      G.value = 0;
      const U = Q(() => P.enter > l.seed), $ = {
        x: 0,
        y: 0
      }, F = pe(0);
      H(U, (Z) => {
        Se(() => {
          j.to(G, {
            value: +Z,
            duration: 1
          }), j.to(F, {
            value: +Z,
            duration: 1
          });
          const ce = Math.random() * Math.PI * 2, ve = 80 * Math.cos(ce), J = 80 * Math.sin(ce);
          j.fromTo($, {
            x: Z ? 0 : ve,
            y: Z ? 0 : J,
            duration: 0.3
          }, {
            x: Z ? ve : 0,
            y: Z ? J : 0
          });
        });
      }, {
        immediate: true
      });
      const b = Q(() => P.enter * _.value > 0), { id: M } = uo(f), O = new xt(), B = new z(), I = r.clone(), { SCALING_FACTOR: k } = Ve(), X = tt.dynamic().setTranslation(r.x / k, r.y / k, r.z / k);
      X.setAdditionalMass(1e6), X.setCcdEnabled(true);
      const W = h.createRigidBody(X);
      let ne = Re.ball(d / k / 2);
      ne.setFriction(1).setRestitution(0);
      let re;
      const ie = r.clone().divide(k);
      ye(({ vw: Z }) => {
        we();
      });
      function se() {
        var _a2;
        A = m(A.index), D.value = (_a2 = A == null ? void 0 : A.lazyTexture) == null ? void 0 : _a2.getTexture();
      }
      let be = 1;
      const he = {
        value: 0
      };
      H(w, (Z) => {
        Z && Se(() => {
          j.to(he, {
            value: +Z,
            duration: 0.5
          });
        });
      }, {
        immediate: true
      });
      function we() {
        const Z = d * n.value * be;
        B.set(Z), re && h.removeCollider(re, true), ne = Re.ball(Z * st.z / k / 2), ne.setRestitution(0.1).setFriction(1), Ne.value && (re = h.createCollider(ne, W));
      }
      const Fe = l.seed * 2 - 1, De = 2e5 + Fe * 1e4, je = 12e4 + Fe * 15e3, it = {
        value: De
      };
      H(() => E.value === 1, (Z) => {
        Z ? Se(() => {
          j.to(K, {
            value: +Z,
            duration: 0.7
          });
        }) : Se(() => {
          j.to(K, {
            value: -Z,
            duration: 0.7
          });
        });
      }, {
        immediate: true
      }), H([
        _,
        E,
        F
      ], ([Z, ce, ve], J) => {
        it.value = p.Lerp(Bn, p.Lerp(p.Lerp(De, je, Z), De, ce), ve);
      });
      const _o = 17e4 + Fe * 12e3, Oe = {
        x: 0,
        y: 0
      }, He = Ce({
        x: 0,
        y: 0
      });
      function bo() {
        Ne.value || (He.x < 0 && I.x < -c.value.width / 2 && (Oe.x += c.value.width, I.x += c.value.width, se(), W.setTranslation(I, true), W.setLinvel({
          x: 0,
          y: 0,
          z: 0
        }, true)), He.x > 0 && I.x > c.value.width / 2 && (Oe.x -= c.value.width, I.x -= c.value.width, se(), W.setTranslation(I, true), W.setLinvel({
          x: 0,
          y: 0,
          z: 0
        }, true)), He.y < 0 && I.y < -c.value.height / 2 && (Oe.y += c.value.height, I.y += c.value.height, se(), W.setTranslation(I, true), W.setLinvel({
          x: 0,
          y: 0,
          z: 0
        }, true)), He.y > 0 && I.y > c.value.height / 2 && (Oe.y -= c.value.height, I.y -= c.value.height, se(), W.setTranslation(I, true), W.setLinvel({
          x: 0,
          y: 0,
          z: 0
        }, true)));
      }
      const Ne = pe(false);
      H(() => P.gravity, (Z) => {
        if (!(l.seed > 0.4 && !a.value)) {
          if (Z < l.seed) {
            Ne.value = false;
            return;
          }
          Ne.value || (Ne.value = true);
        }
      }, {
        immediate: true
      }), H(Ne, (Z) => {
        if (Z) {
          re && h.removeCollider(re, true), re = h.createCollider(ne, W);
          const ce = (Math.random() - 0.5) * o.value, ve = t.value * 0.5 + B.y;
          W.setTranslation({
            x: ce,
            y: ve,
            z: 0
          }, true), W.setEnabledTranslations(true, true, false, true);
        } else re && h.removeCollider(re, true), W.setEnabledTranslations(true, true, true, true);
      }, {
        immediate: true
      });
      const { scale: wo } = Xe();
      _e(({ elapsed: Z, delta: ce }) => {
        if (G.value === 0) return;
        if (N.uniforms.uTime.value = Z * 1e-3, E.value !== 1) {
          let J = r.x + l.cameraPan.x + Oe.x + $.x, ae = r.y - l.cameraPan.y + Oe.y + $.y;
          const Te = Math.atan2(ae, J), Le = Math.sqrt(J * J + ae * ae);
          if (E.value > 0) {
            if (E.value > Le / s.value * 1.5) {
              const ze = Le + s.value * 1.5;
              J = ze * Math.cos(Te), ae = ze * Math.sin(Te);
            }
          } else {
            const ze = Le - wo.value / 2, at = Le - ze * _.value * 0.85;
            J = at * Math.cos(Te), ae = at * Math.sin(Te);
          }
          ie.set(J, ae, 0);
        } else {
          let J = r.x + l.cameraPan.x + Oe.x + $.x, ae = r.y - l.cameraPan.y + Oe.y + $.y;
          const Te = Math.atan2(ae, J), ze = Math.sqrt(J * J + ae * ae) + s.value * 1.5;
          J = p.Clamp(ze * Math.cos(Te), -o.value * 0.5 - 120, o.value * 0.5 + 120), ae = p.Clamp(ze * Math.sin(Te), -t.value * 0.5 - 120, t.value * 0.5 + 120), ie.set(J, ae, 0);
        }
        if (Ne.value) {
          const { x: J, y: ae, z: Te } = W.translation();
          W.setTranslation({
            x: J,
            y: ae,
            z: 0
          }, true);
          const Le = new z(0, -3e7, 0);
          W.applyImpulse(Le, true), Mo();
        } else {
          const ae = ie.clone().sub(I.divide(k)).clone().multiply(it.value), Le = Lt.fromVector(W.linvel()).multiply(-_o);
          if (ae.add(Le), P.logoGrow < 1 && (be = p.Lerp(p.Lerp(1, 1.1, Math.cos(Z / 800 + l.seed * 20) * 0.5 + 0.5), 1, he.value), we()), b.value && P.logoGrow < 1) {
            const at = I.clone().divide(k).squaredLen(), Lo = Math.max(at, 1e-4), Po = 2 * 1e11, Co = I.clone().normalize().multiply(Po * 1 / Lo);
            ae.add(Co);
          }
          W.applyImpulse(ae, true), bo();
        }
        const ve = Lt.fromVector(W.translation()).multiply(k);
        He.x = ve.x - I.x, He.y = ve.y - I.y, I.copy(ve);
      });
      function Mo() {
        const { x: Z, y: ce, z: ve } = W.translation(), J = B.x / 2;
        Z + J > x.value.right && W.setTranslation({
          x: x.value.right - (J + 1),
          y: ce,
          z: ve
        }, true), Z - J < x.value.left && W.setTranslation({
          x: x.value.left + (J + 1),
          y: ce,
          z: ve
        }, true), ce - J < x.value.bottom && W.setTranslation({
          x: Z,
          y: x.value.bottom + (J + 1),
          z: ve
        }, true);
      }
      const Dt = pe(false);
      me(async () => {
        f.value && ($e("click", M, (Z) => {
          var _a2;
          if (P.textPickerLeave < 1 || P.logoGrow === 1) return;
          const ce = ke[A.index];
          ce.link && ((_a2 = window.open(ce.link, "_blank")) == null ? void 0 : _a2.focus());
        }), $e("mouseenter", M, (Z) => {
          P.textPickerLeave < 1 || P.logoGrow === 1 || (Eo(), !ke[A.index].link) || (Dt.value = true);
        }), $e("mouseleave", M, (Z) => {
          To(), ke[A.index].link && (Dt.value = false);
        }));
      });
      let Me;
      const st = new z(1);
      function Eo() {
        Me && Me.kill(), Me = j.timeline(), L.value = A.index, Me.to(st, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 1,
          ease: "expo.out",
          onUpdate() {
            we();
          }
        });
      }
      function To() {
        L.value === A.index && (L.value = null), Me && Me.kill(), Me = j.timeline(), Me.to(st, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: "power1.out",
          onUpdate() {
            we();
          }
        });
      }
      return et(() => {
        h.removeRigidBody(W), re && h.removeCollider(re, true), g(A.index), Me && Me.kill();
      }), (Z, ce) => (q(), Y("OGLTransform", {
        ref: "transform",
        scale: T(B),
        rotation: T(O),
        position: T(I)
      }, [
        ee("OGLTransform", {
          scale: T(st)
        }, [
          ee("OGLMesh", {
            ref_key: "mesh",
            ref: f,
            program: T(N),
            geometry: T(y)
          }, null, 8, Nn)
        ], 8, Fn)
      ], 8, An));
    }
  }), Gn = [
    "scale",
    "rotation",
    "position"
  ], Wn = [
    "program",
    "geometry"
  ], Un = oe({
    __name: "BlobIndustruies",
    props: {
      show: {
        type: Boolean
      },
      index: {}
    },
    setup(i) {
      const { vh: e, vw: t, isLg: o } = te(), s = i, n = Q(() => o.value ? 200 : 115);
      H(n, (P) => {
        a(P);
      });
      function a(P) {
        const R = P ?? n.value;
        l.set(R), w.removeCollider(E, true), _ = Re.ball(R / C / 2), _.setRestitution(0.1).setFriction(1), E = w.createCollider(_, x);
      }
      const l = new z(n.value), r = new z(t.value * (Math.random() - 0.5), e.value * 0.5 + 120, 0), u = new xt(), { gl: d } = ge(), { lazyTextures: v } = xe(), h = {
        value: v[Ho[s.index].src].getTexture()
      }, { program: f, uOpacity: y } = so(d, {
        texture: h,
        seed: 0
      }), { blobsBounds: m, walls: c } = Ae(), L = new St(d, {
        widthSegments: 64
      });
      L.raycast = "sphere", H(() => s.show, (P) => {
        Se(() => {
          E && w.removeCollider(E, true), P && (r.set(t.value * (Math.random() - 0.5), e.value * 0.5 + 120, 0), x.setTranslation(r, true), E = w.createCollider(_, x)), j.to(y, {
            value: +P,
            duration: 1,
            onComplete: () => {
              P || (r.set(t.value * (Math.random() - 0.5), e.value * 0.5 + 120, 0), x.setTranslation(r, true), E = w.createCollider(_, x));
            }
          });
        });
      });
      const { SCALING_FACTOR: C, world: w } = Ve(), g = tt.dynamic().setTranslation(r.x, r.y, 0);
      g.setAdditionalMass(1e6), g.setCcdEnabled(true);
      const x = w.createRigidBody(g);
      x.setEnabledTranslations(true, true, false, true);
      let _ = Re.ball(n.value / C / 2);
      _.setFriction(1).setRestitution(0.2);
      let E = w.createCollider(_, x);
      _e(({ elapsed: P, delta: R }) => {
        if (!s.show) return;
        const A = new z(0, -3e7, 0);
        x.applyImpulse(A, true), S();
        const { x: D, y: N, z: G } = x.translation();
        r.set(D, N, G);
      });
      function S() {
        const { x: P, y: R, z: A } = x.translation(), D = x.linvel(), N = l.x / 2;
        P + N > c.value.right && (x.setTranslation({
          x: c.value.right - (N + 1),
          y: R,
          z: A
        }, true), x.setLinvel({
          x: 0,
          y: D.y,
          z: D.z
        }, true)), P - N < c.value.left && (x.setTranslation({
          x: c.value.left + (N + 1),
          y: R,
          z: A
        }, true), x.setLinvel({
          x: 0,
          y: D.y,
          z: D.z
        }, true)), R - N < c.value.bottom && (x.setTranslation({
          x: P,
          y: c.value.bottom + (N + 1),
          z: A
        }, true), x.setLinvel({
          x: D.x,
          y: 0,
          z: D.z
        }, true));
      }
      return et(() => {
        w.removeRigidBody(x), w.removeCollider(E, true);
      }), (P, R) => (q(), Y("OGLTransform", {
        ref: "transform",
        scale: T(l),
        rotation: T(u),
        position: T(r)
      }, [
        ee("OGLTransform", null, [
          ee("OGLMesh", {
            ref: "mesh",
            program: T(f),
            geometry: T(L)
          }, null, 8, Wn)
        ])
      ], 8, Gn));
    }
  }), Vn = () => {
    const i = {
      value: 0
    };
    return _e(({ elapsed: e }) => {
      i.value = e;
    }), {
      uTime: i
    };
  }, Hn = [
    "scale",
    "position"
  ], $n = [
    "geometry",
    "program"
  ], Xn = [
    "geometry",
    "program",
    "scale",
    "rotation"
  ], qt = `
uniform float uPortal;
uniform float uOpacity;

varying vec3 vNormal;

varying vec2 vUv;

void main() {
    float diffuse = max(dot(vNormal, normalize(vec3(0., 0., 10.))), 0.0);

    vec3 color = vec3(0.89,0.89,0.89) + vec3(0.396,0.3,0.304) * diffuse;


    gl_FragColor = vec4(color.r, color.g, color.b, uOpacity);
}
`, jn = oe({
    __name: "Logo",
    props: {
      cameraPan: {}
    },
    setup(i) {
      const { vh: e, vw: t, scale: o } = te(), { mouse: s } = Qe(), { scale: n, dimensions: a, logoPosition: l } = Xe(), { world: r } = Ve(), u = V(), d = V(), v = new z(), h = new z(), f = new z(), y = tt.kinematicPositionBased(), m = r.createRigidBody(y);
      m.setEnabledTranslations(true, true, false, true);
      const c = new gt(0, 0, 0, "XYZ"), { growProgress: L } = Xe(), { blobProgress: C, creditDomSize: w } = le(), g = Q(() => C.enter * L.value > 0), _ = xe().geometries.logo.meshes[0].primitives.map((O) => O.geometry), { gl: E } = ge(), S = Q(() => p.Clamp(p.iLerp(C.enter * L.value, 0, 0.2), 0, 1));
      me(() => {
        H(S, (O) => {
          u.value && (u.value.visible = O !== 0), d.value && (d.value.visible = O !== 0);
        }, {
          immediate: true
        });
      });
      const P = new St(E, {
        widthSegments: 64
      }), R = new Ee(E, {
        vertex: `
    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat3 normalMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        vec4 modelViewPosition = modelViewMatrix * vec4(vNormal, 1.0);
        vec4 viewPosition = projectionMatrix * modelViewPosition;
        gl_Position = viewPosition;
    }
`,
        fragment: `
    precision highp float;
    precision highp int;

    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec3 vNoisedNormal;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uOpacity;

    #define PI 3.14159265359

    void main() {
        vec2 vN = vNormal.xy;
        float r = sqrt(vN.x * vN.x + vN.y * vN.y);
        vec4 color = vec4(1.);
        color.a = r * .5 * uOpacity;

        vec2 vN2 = vec2(vNormal.x - 0.01, vNormal.y + 0.012);
        float r2 = sqrt(vN2.x * vN2.x + vN2.y * vN2.y);
        if(r2 > 1.) {
            color.a = 0.63 * uOpacity;
        }

        gl_FragColor = color;
    }
`,
        transparent: true,
        uniforms: {
          uTime: Vn().uTime,
          uOpacity: S
        }
      }), A = `#extension GL_OES_standard_derivatives : enable
precision highp float;
` + qt, D = `#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;
` + qt, N = new Ee(E, {
        fragment: E.renderer.isWebgl2 ? D : A,
        vertex: E.renderer.isWebgl2 ? rt : nt,
        uniforms: {
          uOpacity: S
        }
      });
      let G = Re.ball(n.value / 2), K = r.createCollider(G, m);
      H(g, (O) => {
        U(n.value);
      }, {
        immediate: true
      }), H(n, (O) => {
        U(O);
      });
      function U(O) {
        v.set(O / 2), r.removeCollider(K, true), g.value && (G = Re.ball(O / 1.9), G.setRestitution(0.1).setFriction(1), K = r.createCollider(G, m));
      }
      const { activeGravity: $, walls: F } = Ae();
      H([
        () => C.credit,
        w
      ], ([O, B]) => {
        if (m.isDynamic()) return;
        const I = p.iLerp(O, e.value * 0.1 / B, 1, {
          clamp: true
        });
        f.set(0, I * (B - e.value * 0.5), 0);
      });
      const b = {
        value: +!$.value
      };
      H($, (O) => {
        O ? (f.set(0, e.value * 0.5, 0), m.setTranslation({
          x: 0,
          y: e.value * 0.7,
          z: 0
        }, true), b.value = 0, m.setBodyType(At.RigidBodyType.Dynamic, true)) : (m.setBodyType(At.RigidBodyType.KinematicPositionBased, true), Se(() => {
          j.fromTo(b, {
            value: 0
          }, {
            value: 1,
            duration: 3,
            ease: "power2.out"
          });
        }));
      }), _e(({ elapsed: O, delta: B }) => {
        if (c.y = p.Lerp(-Math.PI / 8, Math.PI / 8, Math.cos(O / 2e3) * 0.5 + 0.5), !$.value) m.setTranslation(h, true);
        else {
          const k = new z(0, -3e7, 0);
          m.applyImpulse(k, true);
        }
        M(), l.value = m.translation();
        const I = Lt.fromVector(m.translation());
        h.set(p.Lerp(I.x, f.x, b.value), p.Lerp(I.y, f.y, b.value), 0);
      });
      function M() {
        const { x: O, y: B, z: I } = m.translation(), k = m.linvel(), X = v.x;
        O + X > F.value.right && (m.setTranslation({
          x: F.value.right - (X + 1),
          y: B,
          z: I
        }, true), m.setLinvel({
          x: 0,
          y: k.y,
          z: k.z
        }, true)), O - X < F.value.left && (m.setTranslation({
          x: F.value.left + (X + 1),
          y: B,
          z: I
        }, true), m.setLinvel({
          x: 0,
          y: k.y,
          z: k.z
        }, true)), B - X < F.value.bottom && (m.setTranslation({
          x: O,
          y: F.value.bottom + (X + 1),
          z: I
        }, true), m.setLinvel({
          x: k.x,
          y: 0,
          z: k.z
        }, true));
      }
      return et(() => {
        r.removeRigidBody(m), r.removeCollider(K, true);
      }), (O, B) => (q(), Y("OGLTransform", {
        ref: "transform",
        scale: T(v),
        position: T(h)
      }, [
        ee("OGLMesh", {
          ref_key: "ballRef",
          ref: u,
          geometry: T(P),
          program: T(R)
        }, null, 8, $n),
        ee("OGLMesh", {
          ref_key: "logoRef",
          ref: d,
          geometry: T(_)[0],
          program: T(N),
          scale: new (T(z))(0.4),
          rotation: T(c)
        }, null, 8, Xn)
      ], 8, Hn));
    }
  }), Zn = [
    "scale",
    "position"
  ], qn = oe({
    __name: "MouseBall",
    setup(i) {
      const { vh: e, vw: t, scale: o } = te(), { mouse: s, mouseDamp: n } = Qe(), { mousePosition: a, mouseActivate: l } = Xe(), { world: r } = Ve(), u = new z(), d = new z(), v = tt.kinematicPositionBased(), h = r.createRigidBody(v);
      h.setEnabledTranslations(true, true, false, true);
      let f = Re.ball(200 * o.value / 2), y = r.createCollider(f, h);
      ye(({ vw: c, scale: L }) => {
        m(l.value);
      });
      function m(c) {
        u.set(200 * o.value), r.removeCollider(y, true), c && (f = Re.ball(200 * o.value / 2), y = r.createCollider(f, h));
      }
      return H(l, (c) => {
        m(c);
      }), _e(({ elapsed: c, delta: L }) => {
        l.value && (h.setNextKinematicTranslation({
          x: n.value.x - t.value * 0.5,
          y: e.value * 0.5 - n.value.y,
          z: 0
        }), a.value = h.translation());
      }), et(() => {
        r.removeRigidBody(h), r.removeCollider(y, true);
      }), (c, L) => (q(), Y("OGLTransform", {
        ref: "transform",
        scale: T(u),
        position: T(d)
      }, null, 8, Zn));
    }
  }), Yn = oe({
    __name: "Wall",
    props: {
      x: {},
      y: {},
      rotation: {},
      resitution: {}
    },
    setup(i) {
      const { world: e } = Ve(), { activeWalls: t } = Ae(), o = i;
      H([
        () => o.x,
        () => o.y
      ], ([r, u]) => {
        n.setNextKinematicTranslation({
          x: r,
          y: u,
          z: 0
        });
      });
      const s = tt.kinematicPositionBased().setRotation(new xt().fromEuler(new gt(0, 0, o.rotation))), n = e.createRigidBody(s);
      n.setNextKinematicTranslation({
        x: o.x,
        y: o.y,
        z: 0
      });
      const a = Re.cuboid(10, 1e5, 1e4);
      let l;
      return H(t, (r) => {
        r === false && l !== void 0 ? e.removeCollider(l, true) : r === true && (l = e.createCollider(a, n));
      }, {
        immediate: true
      }), et(() => {
        e.removeRigidBody(n);
      }), (r, u) => (q(), Y("OGLTransform"));
    }
  }), Kn = oe({
    __name: "Walls",
    setup(i) {
      const { walls: e } = Ae(), { world: t } = Ve();
      return (o, s) => {
        const n = Yn;
        return q(), Y(We, null, [
          de(n, {
            x: T(e).left,
            y: 0,
            rotation: 0
          }, null, 8, [
            "x"
          ]),
          de(n, {
            x: T(e).right,
            y: 0,
            rotation: 0
          }, null, 8, [
            "x"
          ]),
          de(n, {
            x: 0,
            y: T(e).bottom,
            rotation: -Math.PI * 0.5,
            resitution: 0.2
          }, null, 8, [
            "y",
            "rotation"
          ])
        ], 64);
      };
    }
  });
  function Qn(i, e, t, o, s = 30) {
    const n = t / Math.SQRT2, a = Math.ceil(i / n), l = Math.ceil(e / n), r = Array.from({
      length: a
    }, () => Array(l).fill(null)), u = [], d = [];
    function v(f, y) {
      if (f < 0 || f >= i || y < 0 || y >= e) return false;
      const m = Math.floor(f / n), c = Math.floor(y / n), L = t * t;
      for (let C = Math.max(m - 2, 0); C <= Math.min(m + 2, a - 1); C++) for (let w = Math.max(c - 2, 0); w <= Math.min(c + 2, l - 1); w++) {
        const g = r[C][w];
        if (g) {
          const x = g.x - f, _ = g.y - y;
          if (x * x + _ * _ < L) return false;
        }
      }
      return true;
    }
    function h(f, y) {
      const m = {
        x: f,
        y
      };
      u.push({
        x: f - i / 2,
        y: y - e / 2
      }), d.push(m);
      const c = Math.floor(f / n), L = Math.floor(y / n);
      r[c][L] = m;
    }
    for (h(Math.random() * i, Math.random() * e); d.length > 0 && u.length < o; ) {
      const f = Math.floor(Math.random() * d.length), y = d[f];
      let m = false;
      for (let c = 0; c < s; c++) {
        const L = Math.random() * Math.PI * 2, C = t + Math.random() * t, w = y.x + Math.cos(L) * C, g = y.y + Math.sin(L) * C;
        if (v(w, g)) {
          h(w, g), m = true;
          break;
        }
      }
      m || d.splice(f, 1);
    }
    return u;
  }
  const Jn = ({ wrapper: i, limitX: e, limitY: t, on: o }) => {
    e = e || {
      min: -1 / 0,
      max: 1 / 0
    }, t = t || {
      min: -1 / 0,
      max: 1 / 0
    };
    const s = o ?? V(true), n = pe(false), a = {
      x: 0,
      y: 0
    }, l = {
      x: 0,
      y: 0
    }, r = $o({
      x: 0,
      y: 0
    }), u = {
      x: 0,
      y: 0
    };
    Ct(() => {
      i === void 0 && (i = V(document.body)), i.value && (i.value.addEventListener("mousedown", h), i.value.addEventListener("touchstart", v), window.addEventListener("mousemove", f), window.addEventListener("touchmove", y), window.addEventListener("mouseup", m), window.addEventListener("touchend", c), to(() => {
        i === void 0 && (i = V(document.body)), i.value && (i.value.removeEventListener("mousedown", h), i.value.removeEventListener("touchstart", v), window.removeEventListener("mousemove", f), window.removeEventListener("touchmove", y), window.removeEventListener("mouseup", m), window.removeEventListener("touchend", c));
      }));
    });
    const { isTouch: d } = te();
    function v(S) {
      d.value || L({
        x: S.touches[0].clientX,
        y: S.touches[0].clientY
      });
    }
    function h(S) {
      d.value || L({
        x: S.clientX,
        y: S.clientY
      });
    }
    function f(S) {
      d.value || C({
        x: S.clientX,
        y: S.clientY,
        fromTouch: false
      });
    }
    function y(S) {
      d.value || C({
        x: S.touches[0].clientX,
        y: S.touches[0].clientY,
        fromTouch: true
      });
    }
    function m() {
      E();
    }
    function c() {
      E();
    }
    function L({ x: S, y: P }) {
      if (!s.value) return E();
      n.value = true, a.x = S, a.y = P, w = false, g = false, u.x = r.x, u.y = r.y;
    }
    function C({ x: S, y: P, fromTouch: R }) {
      if (l.x = S, l.y = P, !(R && _()) && n.value) {
        if (!s.value) return E();
        r.x = l.x - a.x + u.x, r.y = l.y - a.y + u.y, r.x = p.Clamp(r.x, e.min, e.max), r.y = p.Clamp(r.y, t.min, t.max);
      }
    }
    let w = false, g = false;
    const x = 4;
    function _() {
      if (w || g) return g;
      const S = Math.abs(l.y - a.y), P = Math.abs(l.x - a.x);
      return S > x ? g = true : P > x && (w = true), P < x && P < x;
    }
    function E() {
      n.value = false, w = false, g = false;
    }
    return {
      distance: r,
      on: n
    };
  }, er = 120, fo = oe({
    __name: "Blobs",
    setup(i) {
      const { scale: e, vw: t, vh: o, diagonale: s, isLg: n } = te(), { blobsBounds: a, currentBlobHover: l } = Ae(), { blobProgress: r, activeSectionProgress: u, creditActive: d } = le(), v = V([]);
      ye(({ breakpoint: g }) => {
        const x = n.value ? Math.sqrt(a.value.width * a.value.height / ke.length) : Math.sqrt(a.value.width * a.value.height / ke.length) * 1.1;
        v.value = Qn(a.value.width, a.value.height, x, ke.length);
      });
      const { canDrag: h } = Ae(), { distance: f, on: y } = Jn({
        on: h
      }), m = Q(() => l.value !== null), c = Q(() => h.value || m.value), L = Q(() => m.value ? "default" : y.value ? "grab-active" : "grab"), C = Q(() => l.value !== null && ke[l.value].link ? "pointer" : null);
      Qo({
        mode: L,
        active: c,
        id: "blobs",
        cssBodyCursor: C
      });
      const w = Q(() => v.value.map((g) => ({
        seed: Math.random(),
        key: `${Math.random()}-${g.x}-${g.y}`,
        blobSetup: {
          initialPos: new z(g.x, g.y, 0),
          scale: er,
          scaleMobile: 90
        }
      })));
      return (g, x) => {
        const _ = kn, E = Un, S = jn, P = qn, R = Kn;
        return q(), Y("OGLTransform", null, [
          (q(true), Y(We, null, ut(T(w), ({ seed: A, blobSetup: D, key: N }) => (q(), Y("OGLTransform", {
            key: N
          }, [
            de(_, {
              seed: A,
              setup: D,
              "camera-pan": T(f)
            }, null, 8, [
              "seed",
              "setup",
              "camera-pan"
            ])
          ]))), 128)),
          (q(true), Y(We, null, ut(T(Xo).length, (A) => (q(), Y("OGLTransform", {
            key: A
          }, [
            de(E, {
              show: A <= T(d),
              index: A - 1
            }, null, 8, [
              "show",
              "index"
            ])
          ]))), 128)),
          de(S, {
            "camera-pan": T(f)
          }, null, 8, [
            "camera-pan"
          ]),
          T(n) ? (q(), Ye(P, {
            key: 0
          })) : Be("", true),
          de(R)
        ]);
      };
    }
  });
  function tr(i, e, t) {
    let o = V();
    i == document ? o.value = i : o = i;
    const s = () => {
      o.value.removeEventListener(e, t);
    };
    return Ct(() => {
      o.value.addEventListener(e, t), to(() => {
        s();
      });
    }), s;
  }
  let po, or, Yt, nr, rr, ir, sr, ho, vo, mo, ar, lr, cr, ur, dr, fr, pr, hr, vr, Kt, mr, gr, go, xr, yr, _r, br, wr, Mr, Er, Tr, Lr, xo, Pr, Cr, Sr, Rr, Dr, pt, Or, zr, Ir, Ar, Fr, Nr, Br, kr, Gr, yo, Wr, Qt, Ur, Jt, Vr, Hr, $r;
  po = oe({
    __name: "Picker",
    setup(i) {
      const e = V(), { isPicking: t, emit: o, pickedMeshes: s } = Je(), { isTouch: n } = te();
      return me(() => {
        const a = V(-1), { camera: l } = ft();
        tr(document, "click", () => {
          o("click", a.value);
        }), H(a, (h, f) => {
          o("mouseenter", h), o("mouseleave", f);
        });
        const r = new dn(), { mouse: u } = Qe(), { vh: d, vw: v } = te();
        _e(async () => {
          if (n.value) return;
          r.castMouse(l.value, new ot(2 * (u.value.x / v.value) - 1, 2 * (1 - u.value.y / d.value) - 1));
          const h = [
            ...s.map(({ id: y, value: m }) => m)
          ], f = r.intersectBounds(h);
          f.length === 0 ? (a.value = -1, t.value = false) : (t.value = true, a.value = f[0].pickerId ?? -1);
        });
      }), (a, l) => (q(), Y("OGLTransform", {
        ref_key: "scene",
        ref: e
      }, [
        oo(a.$slots, "default")
      ], 512));
    }
  });
  or = [
    "scale",
    "geometry",
    "program"
  ];
  Yt = `
uniform sampler2D tPortal;
uniform sampler2D tMask;
uniform vec2 uResolution;
uniform float uOpacity;


varying vec2 vUv;

void main() {
    vec4 mask = texture(tMask, gl_FragCoord.xy / uResolution.xy);
    vec4 portal = texture(tPortal, gl_FragCoord.xy / uResolution.xy);
    gl_FragColor = mix(portal, vec4(0.), 1. - mask.r);
}
`;
  nr = oe({
    __name: "Portal",
    props: {
      tPortal: {},
      tMask: {}
    },
    setup(i) {
      const { gl: e, renderer: t, uResolution: o } = ge(), s = new z(1), n = V(), a = {
        value: 0
      }, { stackProgress: l } = le();
      H(() => l.cube, (h) => {
        a.value = p.Ease.pow1.inOut(p.Clamp(p.iLerp(h, 0.6, 0.602), 0, 1));
      });
      const r = `#extension GL_OES_standard_derivatives : enable
precision highp float;
` + Yt, u = `#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;
` + Yt, d = new Ke(e), v = new Ee(e, {
        vertex: e.renderer.isWebgl2 ? rt : nt,
        fragment: e.renderer.isWebgl2 ? u : r,
        uniforms: {
          tPortal: i.tPortal,
          uResolution: o,
          tMask: i.tMask,
          uOpacity: a
        }
      });
      return ye((h) => {
        s.set(h.vw, h.vh, 1);
      }), _e(() => {
      }), (h, f) => (q(), Y("OGLTransform", null, [
        ee("OGLMesh", {
          ref_key: "composeSceneRef",
          ref: n,
          scale: T(s),
          geometry: T(d),
          program: T(v)
        }, null, 8, or)
      ]));
    }
  });
  [rr, ir] = mt(() => ({
    scene: V(),
    togglePortal: {
      value: (t) => {
      }
    }
  }));
  sr = `//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}`;
  ho = (i, e, t, o, s = V(0)) => {
    const n = Vt.load(i, {
      src: "/static/env/matcap_roughness_4_light.png"
    }), a = Vt.load(i, {
      src: "/static/env/bg.png"
    }), { uResolution: l } = ge();
    return {
      program: new Ee(i, {
        vertex: i.renderer.isWebgl2 ? cr : ar,
        fragment: i.renderer.isWebgl2 ? ur : lr,
        transparent: true,
        uniforms: {
          tMap: {
            value: n
          },
          tBg: {
            value: a
          },
          uColorStart: e,
          uColorEnd: t,
          uOpacity: o,
          uResolution: l,
          uTransmissionOpacity: {
            value: 0.1
          },
          uIOR: {
            value: 1.5
          },
          uPortal: s
        }
      })
    };
  };
  vo = `
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying float vGradientFactor;
varying vec2 vUv;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;

    vec3 viewNormal = normalize(normalMatrix * normal);
    vNormal = viewNormal;
    vGradientFactor = uv.y; // Utilisation de la coordonn\xE9e Y du vertex comme facteur de gradient
    vUv = uv;
    
    gl_Position = projectionMatrix * mvPosition;
}
`;
  mo = `
uniform sampler2D tMap;
uniform sampler2D tBg;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;
uniform float uOpacity;
uniform float uPortal;
uniform float uIOR;
uniform float uTransmissionOpacity;
uniform vec2 uResolution;

uniform float uNoiseStrength; // Intensit\xE9 de la perturbation

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying float vGradientFactor;

${io}
${sr}

void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
    vec3 y = cross(viewDir, x);
    
    vec2 uvMatcap = vec2(dot(x, vNormal), dot(y, vNormal)) * 0.495 + 0.5;

    float noise = snoise(vUv * uResolution * 0.002);
    float noise2 = snoise(vUv * uResolution * 1.);
    uvMatcap = uvMatcap + noise * 0.008 + noise2 * 0.0001;

    vec4 matcapColor = texture2D(tMap, uvMatcap) + noise2 * 0.03;

    vec3 gradientColor = mix(uColorStart, uColorEnd, vGradientFactor);

    vec2 UV = gl_FragCoord.xy / uResolution;
    vec4 backgroundColor = texture(tBg, UV);
    vec3 refractedColor = backgroundColor.rgb * (1.0 - uTransmissionOpacity) + backgroundColor.rgb * uTransmissionOpacity * uIOR;


    vec3 finalColor = mix(gradientColor, matcapColor.rgb, matcapColor.r);
    finalColor = mix(refractedColor, finalColor, 0.8);
    
    gl_FragColor = vec4(finalColor, uOpacity);
    gl_FragColor = uPortal < 0.5 ? gl_FragColor : vec4(1.0, 0.0, 0.0, 1.0);
}
`;
  ar = `
` + vo;
  lr = `#extension GL_OES_standard_derivatives : enable
precision highp float;
` + mo;
  cr = `#version 300 es
#define attribute in
#define varying out
` + vo;
  ur = `#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;
` + mo;
  dr = [
    "scale"
  ];
  fr = [
    "geometry",
    "program",
    "scale",
    "rotation",
    "position"
  ];
  pr = [
    "rotation"
  ];
  hr = [
    "geometry",
    "program",
    "scale",
    "position"
  ];
  vr = [
    "geometry",
    "program",
    "scale",
    "position"
  ];
  Kt = `
varying vec2 vUv;

uniform float uOpacity;

void main() {
    gl_FragColor = vec4(1. - uOpacity, 0., 0., 1.);
}
`;
  mr = oe({
    __name: "Logo",
    setup(i) {
      const e = V(), { scene: t, togglePortal: o } = ir(), { portalProgress: s } = le();
      o.value = (R) => {
        C.value.visible = R, L.value.visible = R;
      }, me(() => {
        e.value && (t.value = e.value);
      });
      const { vh: n, vw: a, scale: l, isLg: r } = te(), u = Q(() => r.value ? ue.desktop.designWidth * l.value * 1.33 : ue.desktop.designWidth * 1.53), d = Q(() => Math.sqrt(n.value * n.value + a.value * a.value) * 1.32), v = new z(0), h = new fe(0, 0, 0, "XYZ"), { gl: f, uPortal: y } = ge(), c = xe().geometries.logov2.meshes[0].primitives.map((R) => R.geometry), L = V(), C = V(), w = V(), { stackProgress: g } = le(), x = V(0);
      me(() => {
        const R = g.cube;
        w.value.visible = R > 0.6;
      }), H(() => g.cube, (R) => {
        w.value.visible = R > 0.6, x.value = p.easeMaping(0.6, 0.61, p.Ease.pow1.inOut)(R);
        const A = p.easeMaping(0.6, 0.9, p.Ease.pow1.out)(R);
        h.y = p.Lerp(-3 * Math.PI / 4, 0 * Math.PI, A), v.set(p.Lerp(u.value, d.value, p.easeMaping(0.6, 1, p.Ease.expoInOut)(R))), R === 1 && (v.z = 1e8);
      });
      const { program: _ } = ho(f, pe([
        15 / 255,
        48 / 255,
        67 / 255
      ]), pe([
        79 / 255,
        151 / 255,
        182 / 255
      ]), x, y), E = `#extension GL_OES_standard_derivatives : enable
precision highp float;
` + Kt, S = `#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;
` + Kt, P = new Ee(f, {
        fragment: f.renderer.isWebgl2 ? S : E,
        vertex: f.renderer.isWebgl2 ? rt : nt,
        uniforms: {
          uOpacity: x
        }
      });
      return (R, A) => (q(), Y("OGLTemplate", {
        ref_key: "scene",
        ref: e,
        scale: new (T(z))(1, 1, 1)
      }, [
        ee("OGLMesh", {
          ref_key: "mesh",
          ref: w,
          geometry: T(c)[0],
          program: T(_),
          scale: T(v),
          rotation: T(h),
          position: new (T(z))(0)
        }, [
          ee("OGLTransform", {
            rotation: new (T(gt))(0, 0 * Math.PI, 0, "XYZ")
          }, [
            ee("OGLMesh", {
              ref_key: "plane",
              ref: L,
              geometry: new (T(Ke))(T(f)),
              program: T(P),
              scale: new (T(z))(1, 1.1, 1),
              position: new (T(z))(0, 0, 0)
            }, null, 8, hr),
            ee("OGLMesh", {
              ref_key: "plane2",
              ref: C,
              geometry: new (T(Ke))(T(f)),
              program: T(P),
              scale: new (T(z))(0.5, 1.1, 1),
              position: new (T(z))(0, -0.6, 0)
            }, null, 8, vr)
          ], 8, pr)
        ], 8, fr)
      ], 8, dr));
    }
  });
  gr = (i) => ({
    program: new Ee(i, {
      fragment: i.renderer.isWebgl2 ? yr : xr,
      vertex: i.renderer.isWebgl2 ? rt : nt,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      uniforms: {}
    })
  });
  go = `
    void main() {
        gl_FragColor = vec4(0.);
        discard;
    }
`;
  xr = `#extension GL_OES_standard_derivatives : enable
precision mediump float;
` + go;
  yr = `#version 300 es
precision mediump float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;
` + go;
  _r = [
    "scale",
    "position",
    "rotation"
  ];
  br = [
    "rotation",
    "scale"
  ];
  wr = [
    "program",
    "geometry"
  ];
  Mr = [
    "position"
  ];
  Er = [
    "program",
    "geometry"
  ];
  Tr = [
    "program",
    "geometry"
  ];
  Lr = [
    "program",
    "geometry"
  ];
  xo = oe({
    __name: "Plane",
    props: {
      index: {},
      position: {},
      scale: {},
      positionHover: {},
      rotation: {},
      tMap: {},
      uOpacity: {},
      uLoadOpacity: {},
      no: {
        type: Boolean
      },
      orderI: {},
      picked: {
        type: Boolean
      }
    },
    emits: [
      "mouseenter",
      "mouseleave",
      "click"
    ],
    setup(i, { emit: e }) {
      const { gl: t } = ge(), o = i, { position: s, scale: n, rotation: a, tMap: l, uOpacity: r, uLoadOpacity: u, no: d = false, picked: v = false } = o, h = xe().geometries.card, f = V(), y = V(), m = V(), c = V(), L = V(), C = jo(u);
      me(() => {
        y.value && c.value && L.value && (y.value.renderOrder = 24 - (o.index ?? 0), c.value.renderOrder = 24 - (o.index ?? 0), L.value.renderOrder = 24 - (o.index ?? 0), y.value.oI = o.orderI, c.value.oI = o.orderI, L.value.oI = o.orderI);
      });
      const w = Q(() => C.value < 1 ? C.value : r.value);
      H(w, (P) => {
        f.value && (f.value.visible = P !== 0);
      });
      const { program: g } = On(t, l, w), { program: x } = gr(t), { stackProgress: _ } = le();
      if (H(() => _.cube, (P) => {
        g.depthTest = P !== 0, g.depthWrite = P !== 0;
      }), v) {
        const { id: P } = ro();
        uo(m, {
          id: P,
          target: f
        }), me(() => {
          $e("click", P, (R) => {
            S("click", o.index);
          }), $e("mouseenter", P, (R) => {
            S("mouseenter", o.index);
          }), $e("mouseleave", P, (R) => {
            S("mouseleave", o.index);
          });
        });
      }
      const E = h.meshes[0].primitives.map((P) => P.geometry);
      me(async () => {
        f.value && Se(() => {
          if (o.no === true) {
            f.value.visible = false;
            return;
          }
        });
      });
      const S = e;
      return (P, R) => T(E) ? (q(), Y("OGLTransform", {
        key: 0,
        ref_key: "wrapperRef",
        ref: f,
        scale: T(n),
        position: T(s),
        rotation: T(a)
      }, [
        ee("OGLTransform", {
          rotation: new (T(fe))(0, 0, Math.PI * 0, "ZYX"),
          scale: new (T(z))(1, 1, 1)
        }, [
          T(E)[0] ? (q(), Y("OGLMesh", {
            key: 0,
            ref_key: "frontRefPointer",
            ref: m,
            program: T(x),
            geometry: T(E)[0],
            visible: false
          }, null, 8, wr)) : Be("", true),
          ee("OGLTransform", {
            position: i.positionHover
          }, [
            T(E)[0] ? (q(), Y("OGLMesh", {
              key: 0,
              ref_key: "frontRef",
              ref: y,
              program: T(g),
              geometry: T(E)[0]
            }, null, 8, Er)) : Be("", true),
            T(E)[1] ? (q(), Y("OGLMesh", {
              key: 1,
              ref_key: "backRef",
              ref: c,
              program: T(g),
              geometry: T(E)[1]
            }, null, 8, Tr)) : Be("", true),
            T(E)[2] ? (q(), Y("OGLMesh", {
              key: 2,
              ref_key: "sideRef",
              ref: L,
              program: T(g),
              geometry: T(E)[2]
            }, null, 8, Lr)) : Be("", true)
          ], 8, Mr)
        ], 8, br)
      ], 8, _r)) : Be("", true);
    }
  });
  Pr = [
    "position",
    "rotation"
  ];
  Cr = [
    "position",
    "scale",
    "rotation"
  ];
  Sr = [
    "rotation",
    "scale"
  ];
  Rr = [
    "rotation",
    "position"
  ];
  Dr = oe({
    __name: "PlaneStacked",
    props: {
      position: {},
      scale: {
        default: () => new z(1)
      },
      rotation: {},
      tMap: {},
      uLoadOpacity: {}
    },
    emits: [
      "click"
    ],
    setup(i, { emit: e }) {
      const t = V(), o = new fe(0, 0, 0, "XYZ"), s = new fe(0, 0, 0, "XYZ"), n = new z(1), { lazyTextures: a } = xe(), l = p.Arr.create(It.length).map((b) => {
        const M = a[It[b].src].getTexture();
        return {
          isMain: false,
          index: b + 1,
          tl: {
            value: j.timeline()
          },
          position: new z(0),
          positionIso: new z(0),
          positionHover: Ft({
            stiffness: 130,
            useCriticalDamping: true
          }),
          positionHover3: new z(),
          positionTarget: new z(0),
          damp: p.Lerp(6e-3, 0.012, (b + 1) / 24),
          dampInit: p.Lerp(6e-3, 0.012, (b + 1) / 24),
          rotation: new fe(0, 0, 0, "XYZ"),
          scale: new z(1),
          uOpacity: V(0),
          tMap: {
            value: M
          }
        };
      }), r = [
        {
          isMain: true,
          tl: {
            value: j.timeline()
          },
          position: new z(-10, 0, 0),
          positionIso: new z(0),
          positionHover: Ft({
            stiffness: 130,
            useCriticalDamping: true
          }),
          positionHover3: new z(),
          positionTarget: new z(0),
          damp: p.Lerp(6e-3, 0.012, 0),
          dampInit: p.Lerp(6e-3, 0.012, 0),
          rotation: new fe(0, 0, 0, "XYZ"),
          scale: new z(1),
          index: 0,
          uOpacity: V(1),
          tMap: i.tMap
        },
        ...l
      ], { stackProgress: u, zoomProgress: d, STEP: v } = le(), { meshList: h, featuredIndex: f, ringRadius: y, uAspect: m } = Ue(), c = te(), L = Q(() => v.step5.value), C = {
        init: 1,
        scrub: Q(() => c.isLg.value ? 1.8 : c.isMd.value ? 1.1 * c.scale.value : 1.8),
        end: Q(() => c.isLg.value ? 0.6 * Math.SQRT2 : 1 * Math.SQRT2)
      }, w = Q(() => c.isLg.value ? 200 * c.scale.value : c.isMd.value ? 130 : 80);
      H(() => u.part2, (b) => {
        for (const M of l) M.uOpacity.value = p.Clamp(p.iLerp(b, 0, 0.1), 0, 1);
      }, {
        immediate: true
      }), H(() => u.opacity, (b) => {
        for (let M = 0; M < h.length; M++) {
          if (M === f) continue;
          const O = h[M];
          O.uOpacity.value = 1 - b;
        }
      }), H(() => u.part1, (b) => {
        D(), x(b);
      });
      const g = Q(() => c.isLg.value ? Math.PI / 6 : Math.PI / 8);
      function x(b) {
        const M = p.Ease.expoInOut(b);
        o.x = g.value * M, o.y = -g.value * M;
      }
      const { scaleTrue: _ } = Ue();
      H([
        () => u.part2,
        () => u.scrub
      ], ([b, M]) => {
        E(b, M);
      });
      function E(b, M) {
        const O = p.Ease.expoInOut(b);
        let B;
        M < 0.4 ? B = p.Lerp(0, 0.4, p.Ease.pow1.in(p.iLerp(M, 0, 0.4))) : M > 0.9 ? B = p.Lerp(0.9, 1, p.Ease.pow2.out(p.iLerp(M, 0.9, 1))) : B = M, B *= +c.isLg.value;
        const I = w.value * (r.length - 1);
        D();
        for (let k = 0; k < r.length; k++) {
          const X = r[k], W = O === 0 ? 0 : p.Lerp(-0.5 * k, 0, p.Ease.pow1.inOut(O));
          X.damp = p.Lerp(X.dampInit, 0.06, p.Clamp(1 - p.iLerp(B, 0, 0.5), 0, 1)), c.isLg.value ? (X.positionTarget.set((w.value * k * O - I * B) / _.x, 0, W), X.positionIso.set(0)) : (X.positionTarget.set(0, 0, W), X.positionIso.set(w.value * k * O / _.x * 0.3, 0, -(w.value * k * O) / _.x));
        }
      }
      H(() => u.part4, (b) => {
        D(), c.isLg.value ? S(b) : P(b);
      });
      function S(b) {
        const M = p.Ease.pow1.inOut(b), O = w.value * (r.length - 1), B = ue.desktop.designWidth * _.x * n.x * c.scale.value, I = c.vw.value - B * 2, k = c.vh.value - B * 2;
        for (let X = 0; X < r.length; X++) {
          const W = r[X], ne = p.Lerp(-I / 2, I / 2, X / (r.length - 1)), re = p.Lerp(-k / 2, k / 2, X / (r.length - 1));
          W.positionTarget.set(p.Lerp(w.value * X - O, ne, M) / _.x, M * re / _.y, 0), W.positionIso.set(0);
        }
      }
      function P(b) {
        const M = p.Ease.pow1.inOut(b), O = w.value * (r.length - 1), B = M * (r.length - 1);
        G.value = Math.min(Math.round(B + 0.2), r.length - 1);
        for (let I = 0; I < r.length; I++) {
          const k = r[I], X = p.Lerp(-0.5 * I, 0, 1), W = p.Clamp(B - I, 0, 1);
          let ne = 0.7 * w.value * p.Ease.pow1.inOut(W);
          I === r.length - 1 && (ne = 0), k.positionIso.set((w.value * I - O * M - ne) / _.x * 0.3, 0, -(w.value * I - O * M - ne) / _.x), k.positionTarget.set(0, 0, X);
        }
      }
      H(() => u.cube, (b) => {
        R(b);
      });
      function R(b) {
        const M = c.isLg.value, O = p.easeMaping(0, 0.35, p.Ease.pow1.inOut)(b), B = p.easeMaping(0.2, 0.6, p.Ease.pow1.in)(b), I = M ? p.easeMaping(0.3, 0.52, p.Ease.pow1.inOut)(b) : p.easeMaping(0.1, 0.5, p.Ease.pow1.inOut)(b), k = p.easeMaping(0.25, 0.5, p.Ease.pow1.inOut)(b), X = ue.desktop.designWidth * _.x * n.x * c.scale.value, W = c.vw.value - X * 2, ne = c.vh.value - X * 2;
        s.y = p.Lerp(0, Math.PI * 2.25, B), o.x = g.value * (1 - I), o.z = Math.PI / 4 * I;
        const re = p.Ease.pow1.inOut(1 - p.Clamp(p.iLerp(b, 0.58, 0.6), 0, 1));
        m.value = p.Lerp(1, 1 / ue.aspect, I), M || (n.x = p.Lerp(C.scrub.value, C.end.value, I)), n.y = p.Lerp(M ? C.end.value * c.scale.value : C.scrub.value, (M ? C.end.value * c.scale.value : C.end.value) * ue.aspect, I);
        for (let ie = 0; ie < r.length; ie++) {
          const se = r[ie], { uOpacity: be } = r[ie];
          be.value = re;
          const he = M ? p.Lerp(-W / 2, W / 2, ie / (r.length - 1)) : 0, we = M ? p.Lerp(-ne / 2, ne / 2, ie / (r.length - 1)) : 0, Fe = 0, De = 0, je = p.Lerp(5, -5, ie / (r.length - 1));
          o.x = p.Lerp(g.value, 0, O), o.y = p.Lerp(-g.value, 0, O), se.positionTarget.set(p.Lerp(he, Fe, O) / _.x, p.Lerp(we, De, O) / _.y, je), se.damp = p.Lerp(se.dampInit, 0.5, k);
        }
        if (!M) {
          const ie = w.value * (r.length - 1), se = p.easeMaping(0, 0.3, p.Ease.pow1.inOut)(b), be = r.length - 1;
          for (let he = 0; he < r.length; he++) {
            const we = r[he], Fe = p.Clamp(be - he, 0, 1), De = 0.7 * w.value * p.Ease.pow1.out(Fe), je = (w.value * he - ie - De) / _.x * 0.3, it = -(w.value * he - ie - De) / _.x;
            we.positionIso.set(p.Lerp(je, 0, se), 0, p.Lerp(it, 0, se));
          }
        }
      }
      ye(() => {
        x(u.part1), D(), A();
      });
      function A() {
        u.scrub < 1 ? E(u.part2, u.scrub) : u.part4 < 1 ? c.isLg.value ? S(u.part4) : P(u.part4) : R(u.cube);
      }
      function D() {
        u.part1 > 0 && u.part4 <= 0 ? c.isLg.value ? n.set(p.Lerp(C.init, C.scrub.value * c.scale.value, u.part1)) : n.set(p.Lerp(C.init, C.scrub.value, u.part1)) : u.part4 > 0 && (c.isLg.value ? n.set(p.Lerp(C.scrub.value * c.scale.value, C.end.value * c.scale.value, u.part4)) : n.set(C.scrub.value));
      }
      _e(({ elapsed: b, delta: M }) => {
        for (let O = 0; O < r.length; O++) {
          const { position: B, positionTarget: I, damp: k, positionHover3: X, positionHover: W } = r[O];
          B.set(p.Damp(B.x, I.x, k, M), p.Damp(B.y, I.y, k, M), p.Damp(B.z, I.z, k, M)), X.set(W.damped.value, 0, 0);
        }
      });
      const { isPicking: N, currentCard: G } = Je();
      H(N, (b) => {
        if (c.isTouch.value) return G.value - 1;
        b === false && (G.value = -1);
      });
      function K(b) {
        if (c.isTouch.value || b === void 0 || !L.value) return;
        G.value = b;
        const { positionHover: M } = r[b];
        M.target.value = 2;
      }
      function U(b) {
        if (c.isTouch.value || b === void 0) return;
        const { positionHover: M } = r[b];
        M.target.value = 0;
      }
      Zo(() => {
        for (const { tl: b } of r) b.value.kill();
      });
      function $() {
        F("click");
      }
      const F = e;
      return (b, M) => {
        const O = xo;
        return q(), Y("OGLTransform", {
          ref_key: "wrapperRef",
          ref: t,
          position: i.position,
          rotation: T(s)
        }, [
          (q(), Y(We, null, ut(r, ({ position: B, tMap: I, positionIso: k, positionHover3: X, isMain: W, scale: ne, uOpacity: re, rotation: ie, index: se }) => ee("OGLTransform", {
            key: se,
            position: B,
            scale: ne,
            rotation: ie
          }, [
            ee("OGLTransform", {
              rotation: T(o),
              scale: T(n)
            }, [
              ee("OGLTransform", {
                rotation: i.rotation,
                position: k
              }, [
                de(O, {
                  picked: true,
                  no: !W,
                  "t-map": I,
                  "u-opacity": re,
                  "u-load-opacity": i.uLoadOpacity,
                  scale: i.scale,
                  index: se,
                  "position-hover": X,
                  "order-i": T(h)[T(f)].index,
                  onMouseenter: K,
                  onMouseleave: U,
                  onClick: (be) => W && $()
                }, null, 8, [
                  "no",
                  "t-map",
                  "u-opacity",
                  "u-load-opacity",
                  "scale",
                  "index",
                  "position-hover",
                  "order-i",
                  "onClick"
                ])
              ], 8, Rr)
            ], 8, Sr)
          ], 8, Cr)), 64))
        ], 8, Pr);
      };
    }
  });
  pt = (i, e) => {
    const t = p.mod(e, Math.PI * 2);
    return t < p.mod(i + Math.PI, Math.PI * 2) ? t : t - Math.PI * 2;
  };
  Or = () => {
    const { meshList: i, mouseForce: e, scaleZoom: t, introProgress: o, containerRef: s, ringRadius: n, positionContainer: a, positionWrapper: l, rotationContainer: r, introDone: u } = Ue(), d = Ce(new fe(0, 0, 0, "XYZ")), { gl: v, renderer: h, scene: f } = ge(), { camera: y } = ft(), m = j.timeline();
    i.forEach((x, _) => {
      const E = H(x.loaded, (S) => {
        S && (C.value || g(), m.fromTo(x.uLoadOpacity, {
          value: 0
        }, {
          value: 1,
          duration: 0.3,
          ease: "none"
        }, Math.max(m.time(), _ * 0.04)), E());
      });
    });
    const c = Pt(), { preloadDone: L } = xe(), { isLg: C } = te();
    me(() => {
      document.body.classList.add("no-scroll"), C.value || g();
    });
    const { orthoPerspective: w } = ft();
    H(L, (x) => {
      c.stop(), C.value ? Se(() => {
        const _ = j.timeline();
        for (const E of i) _.to(E.position, {
          y: 0,
          ease: "bezier.inOut1",
          duration: 1.5
        }, 0);
        _.to(o, {
          part1: 1,
          ease: "bezier.inOut1",
          duration: 1.5
        }, 0), _.fromTo(w, {
          value: 0,
          duration: 1,
          ease: "power4.in"
        }, {
          value: 0.01
        }), _.call(() => {
          var _a;
          const E = j.timeline();
          E.fromTo(w, {
            value: 0.01,
            duration: 0.3,
            ease: "power4.in"
          }, {
            value: 1
          }, 0.1), E.to(o, {
            part2: 1,
            duration: 3
          }, 0);
          for (let S = 0; S < i.length; S++) {
            const P = i[S];
            (_a = s.value) == null ? void 0 : _a.children[S].traverse((N) => {
              if (!N.visible) return true;
              N.draw;
            });
            const R = P.index > i.length * 0.5 ? i.length - P.index : P.index, A = (P.index - i.length * 0.75) * Math.PI * 2 / i.length, D = 0.5;
            E.to(P.rotation, {
              x: Math.PI * -1,
              duration: D,
              ease: "power1.out"
            }, R * 0.05), E.to(P.rotation, {
              x: Math.PI * -1.5,
              ease: "power1.inOut",
              duration: 1
            }, R * 0.05 + D), E.to(P.rotation, {
              y: -pt(0, A - Math.PI * 1.5),
              duration: 2
            }, R * 0.05), E.to(P.rotation, {
              y: 0,
              duration: 2
            }, R * 0.05 + 1), E.to(P.rotation, {
              z: pt(0, -A + Math.PI * 1.5),
              ease: "power1.inOut",
              duration: 1.5
            }, 0.5), E.to(P.position, {
              x: () => Math.cos(A) * n.value,
              z: () => -Math.sin(A) * n.value - n.value,
              ease: "bezier.inOut1",
              duration: 2
            }, R * 0.05);
          }
          E.to(l, {
            z: () => -n.value,
            duration: 2
          }, 0), E.to(a.value, {
            z: () => n.value,
            duration: 2
          }, 0), r.value && (E.to(r.value, {
            x: -Math.PI * 0.5,
            ease: "power1.inOut",
            duration: 2
          }, 0.75), E.to(a.value, {
            y: () => n.value,
            ease: "power1.inOut",
            duration: 2
          }, 1), E.to(d, {
            2: -Math.PI * 0.6,
            ease: "power1.inOut",
            duration: 3.5
          }, 0.4), E.to(e, {
            value: 1,
            duration: 2,
            ease: "power1.inOut"
          }, 1.5), E.call(() => {
            u.value = true;
          }));
        }), m.add(_);
      }) : Se(() => {
        const S = j.timeline();
        j.set(w, {
          value: 1
        }), j.set(o, {
          part1: 1
        });
        const P = n.value, R = 4.5 * 0.2 + i.length * 0.3 * 0.2;
        S.to(o, {
          part1: 1,
          duration: R / 2
        }, 0), S.to(o, {
          part2: 1,
          duration: R
        }, 0), g();
        for (let D = 0; D < i.length; D++) {
          const N = i[p.mod(D + 5, i.length)], K = 1 - (D - 1) / i.length, U = K * Math.PI * 2 + Math.PI * 0.4, $ = K * Math.PI * 2 + Math.PI * 0.4 + Math.PI * 0.5 - Math.PI * 2, F = -400;
          j.set(N.position, {
            y: F
          }), S.fromTo(N.position, {
            y: F,
            x: 0,
            z: () => -P
          }, {
            y: 0,
            x: () => Math.cos(-U) * P,
            z: () => -Math.sin(-U) * P - P,
            ease: "power2.inOut",
            duration: 4.5 * 0.2
          }, D * 0.3 * 0.2), S.fromTo(N.rotation, {
            z: () => Math.PI
          }, {
            z: () => p.Lerp(Math.PI, $, 0.3),
            duration: D * 0.3 * 0.2,
            ease: "power2.in"
          }, 0), j.set(N.rotationPlane, {
            y: Math.PI
          }), S.fromTo(N.rotationPlane, {
            y: Math.PI,
            z: 0
          }, {
            z: p.Lerp(Math.PI, $, 0.7),
            y: 0,
            duration: 4.5 * 0.2,
            ease: "power2.out"
          }, D * 0.3 * 0.2);
        }
        const A = h.getRenderList({
          scene: f.value,
          frustumCull: false,
          sort: true
        });
        for (let D = 0; D < A.length; D++) {
          const N = A[D];
          if (N.oI !== void 0) {
            const G = N.renderOrder;
            N.renderOrder = -(p.mod(N.oI - 5, i.length) + 1), S.call(() => {
              N.renderOrder = G;
            });
          }
        }
        S.call(() => {
          u.value = true;
        });
      });
    });
    function g() {
      const x = n.value, _ = -400;
      for (let E = 0; E < i.length; E++) {
        const S = i[p.mod(E + 5, i.length)];
        j.set(S.rotation, {
          y: 0,
          x: Math.PI * -1.5,
          z: Math.PI
        }), j.set(S.position, {
          y: _,
          x: 0,
          z: () => -x
        });
      }
      j.set(l, {
        z: () => -x
      }), j.set(a.value, {
        z: () => x,
        y: () => x
      }), j.set(r.value, {
        x: -Math.PI * 0.5
      }), j.set(a.value, {
        y: () => x
      });
    }
    return {
      rotationWrapperPreloadAnimation: d
    };
  };
  zr = [
    "position",
    "rotation",
    "scale"
  ];
  Ir = oe({
    __name: "RingZoom",
    setup(i) {
      const { introProgress: e, ringRadius: t, ringRadiusBase: o, meshList: s, featuredIndex: n, rotationWrapper: a, positionZoom: l, scaleZoom: r, rotationZoom: u } = Ue(), { zoomProgress: d } = le(), { currentCardRingZoom: v } = Je(), { isMd: h, isLg: f, scaleWidth: y } = te();
      return me(() => {
        const m = j.parseEase("power2.out"), c = j.parseEase("bezier.inOutZoom"), L = te();
        H([
          () => d.part1,
          t,
          L.scale
        ], ([C, w]) => {
          const g = f.value ? 3.7 : 2 / (o.value / 360);
          r.set(p.Lerp(1, g, c(C))), l.y = -w * m(C);
        }), H(() => d.part2, (C) => {
          C === 0 ? v.value = -1 : v.value = Math.round(p.Lerp(5, n, C)) - 5, u.z = p.Lerp(0, pt(0, s[n].initialTheta - a.z), C);
        });
      }), (m, c) => (q(), Y("OGLTransform", {
        position: T(l),
        rotation: T(u),
        scale: T(r)
      }, [
        oo(m.$slots, "default")
      ], 8, zr));
    }
  });
  Ar = () => {
    const { mouseDamp: i } = Qe(), e = Ce(new fe(0, 0, 0, "XYZ")), { ringRadius: t, ringCenterPixel: o, positionWrapper: s, introProgress: n, meshList: a, rotationWrapper: l, rotationMouse: r, thetaRingTrue: u, mouseForce: d } = Ue(), { zoomProgress: v } = le(), { breakpoint: h, isLg: f } = te();
    return me(() => {
      const y = j.parseEase("sine.inOut");
      H([
        i,
        () => v.part2
      ], ([m, c]) => {
        const L = m.x - o.value.x, C = o.value.y - m.y, w = L < t.value ? Math.abs(L) / t.value : Math.log(Math.abs(L) / t.value) + 1, g = Math.sign(L) * w * d.value * (1 - c);
        e.z = g * Math.PI * 0.035 * +f.value, r.y = g * Math.PI * 0.025 * +f.value, r.x = g * Math.PI * 0.032 * +f.value;
        for (let x = 0; x < a.length; x++) {
          const _ = a[x], E = _.initialTheta + u.value, S = t.value * Math.cos(E), P = t.value * Math.sin(E), R = S - L, A = P - C, D = Math.sqrt(R * R + A * A), N = Math.PI * p.Lerp(0.3, 0.15, c) * t.value, G = y(p.Clamp(1 - D / N, 0, 1)) * d.value * +f.value;
          _.rotationPlane.y = Math.PI * G * (1 - p.Ease.pow1.out(p.Clamp(p.iLerp(c, 0, 0.7), 0, 1))), _.positionPlane.z = 160 * G * p.Lerp(1, 0, p.Ease.pow1.out(c));
        }
      });
    }), {
      rotationWrapperDrag: e
    };
  };
  Fr = [
    "rotation"
  ];
  Nr = [
    "position",
    "rotation",
    "scale"
  ];
  Br = [
    "position",
    "scale",
    "rotation"
  ];
  kr = [
    "rotation",
    "position"
  ];
  Gr = oe({
    __name: "Index",
    setup(i) {
      const { scale: e, scaleWidth: t, breakpoint: o, isMd: s, isLg: n, lenisVelocityDamp: a, vw: l, vh: r } = te(), { containerRef: u, positionContainer: d, positionWrapper: v, rotationWrapper: h, rotationContainer: f, rotationMouse: y, scaleWrapper: m, scaleContainter: c, scaleZoom: L, ringRadius: C, ringRadiusBase: w, meshList: g, meshScale: x, introProgress: _, gridToPos: E } = Ue(), { rotationWrapperPreloadAnimation: S } = Or(), { rotationWrapperDrag: P } = Ar();
      H([
        P,
        S
      ], ([F, b]) => {
        h.x = F.x + b.x, h.y = F.y + b.y, h.z = F.z + b.z;
      }), H(() => _.part2, (F) => {
        R(F);
      }), ye(({ vh: F, vw: b, scale: M }) => {
        R(_.part2), _.part1 < 1 ? A() : _.part2 < 1 || D();
      });
      const R = (F = 0) => {
        if (!n.value) {
          const M = ue.desktop.designWidth * w.value / 360 * 1.1;
          return x.set(M * 0.5, M * 0.5, M * 0.5);
        }
        const b = ue.desktop.designWidth * 0.95 * p.Lerp(t.value, e.value, p.Ease.pow2.in(p.Clamp(F, 0, 1)));
        x.set(b * 0.5, b * 0.5, b * 0.5);
      }, A = () => {
        for (const F of g) {
          const b = E(F.gridPos);
          F.position.set(b[0], b[1] * (1 - _.part1), 0);
        }
      }, D = () => {
        const F = w.value;
        for (const b of g) {
          const M = (b.index - g.length * 0.75) * Math.PI * 2 / g.length;
          j.set(b.rotation, {
            z: pt(0, -M + Math.PI * 1.5)
          }), j.set(b.rotationPlane, {
            z: 0
          }), j.set(b.position, {
            x: () => Math.cos(M) * F,
            z: () => -Math.sin(M) * F - F
          });
        }
        j.set(v, {
          z: () => -F
        }), j.set(d.value, {
          z: () => F,
          y: () => F
        }), j.set(f.value, {
          x: -Math.PI * 0.5
        }), j.set(f.value, {
          x: -Math.PI * 0.5
        }), j.set(d.value, {
          y: () => F
        }), j.set(S, {
          2: -Math.PI * 0.6
        });
      };
      me(() => {
        H(() => N.part2, (F) => {
          D();
        });
      });
      const { zoomProgress: N, stackProgress: G } = le();
      H(() => G.opacity, (F) => {
        F = p.Ease.pow2.in(F);
        const b = w.value, M = 15, O = (M - g.length * 0.75) * Math.PI * 2 / g.length;
        for (const B of g) {
          let I = (B.index - g.length * 0.75) * Math.PI * 2 / g.length;
          const k = (p.mod(B.index - M, 24) + 12) % 24 - 12;
          let X = 0;
          k === 0 ? I = O : k > 0 && k <= 6 ? (X -= Math.PI * 0.5, I += Math.PI * 0.5) : k < 0 && k >= -6 && (X += Math.PI * 0.5, I -= Math.PI * 0.5);
          const W = p.Lerp((B.index - g.length * 0.75) * Math.PI * 2 / g.length, I, F);
          B.position.x = Math.cos(W) * b, B.position.z = -(1 + Math.sin(W)) * b, B.rotationPlane.z = p.Lerp(0, X, F);
        }
      });
      const { zoomEndScroll: K } = le(), U = Pt();
      function $() {
        N.part2 > 0.5 || U.scrollTo(K.value, {
          duration: 4
        });
      }
      return (F, b) => {
        const M = mr, O = xo, B = Dr, I = Ir;
        return q(), Y(We, null, [
          de(M),
          de(I, null, {
            default: yt(() => [
              ee("OGLTransform", {
                rotation: T(y)
              }, [
                ee("OGLTransform", {
                  position: T(v),
                  rotation: T(h),
                  scale: T(m)
                }, [
                  ee("OGLTransform", {
                    ref_key: "containerRef",
                    ref: u,
                    position: T(d),
                    scale: T(c),
                    rotation: T(f)
                  }, [
                    (q(true), Y(We, null, ut(T(g), ({ position: k, scale: X, rotation: W, rotationPlane: ne, positionPlane: re, tMap: ie, index: se, uOpacity: be, uLoadOpacity: he, isFeatured: we }) => (q(), Y("OGLTransform", {
                      key: se,
                      rotation: W,
                      position: k
                    }, [
                      we ? (q(), Ye(B, {
                        key: 1,
                        position: re,
                        rotation: ne,
                        scale: X,
                        "t-map": ie,
                        "u-opacity": be,
                        "u-load-opacity": he,
                        onClick: $
                      }, null, 8, [
                        "position",
                        "rotation",
                        "scale",
                        "t-map",
                        "u-opacity",
                        "u-load-opacity"
                      ])) : (q(), Ye(O, {
                        key: 0,
                        index: Math.abs(12 - se),
                        position: re,
                        rotation: ne,
                        scale: X,
                        "t-map": ie,
                        "u-opacity": be,
                        "u-load-opacity": he,
                        "order-i": se,
                        picked: true,
                        onClick: $
                      }, null, 8, [
                        "index",
                        "position",
                        "rotation",
                        "scale",
                        "t-map",
                        "u-opacity",
                        "u-load-opacity",
                        "order-i"
                      ]))
                    ], 8, kr))), 128))
                  ], 8, Br)
                ], 8, Nr)
              ], 8, Fr)
            ]),
            _: 1
          })
        ], 64);
      };
    }
  });
  yo = (i) => {
    const e = `
    // FXAA algorithm from NVIDIA, C# implementation by Jasper Flick, GLSL port by Dave Hoskins
    // http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf
    // https://catlikecoding.com/unity/tutorials/advanced-rendering/fxaa/

    uniform sampler2D tMap;
    uniform vec2 uResolution;
    varying vec2 vUv;

    #define EDGE_STEP_COUNT 6
    #define EDGE_GUESS 8.0
    #define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
    const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

    float _ContrastThreshold = 0.0312;
    float _RelativeThreshold = 0.063;
    float _SubpixelBlending = 1.0;

    vec4 Sample( sampler2D  tex2D, vec2 uv ) {

        return texture( tex2D, uv );

    }

    float SampleLuminance( sampler2D tex2D, vec2 uv ) {

        return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

    }

    float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

        uv += texSize * vec2(uOffset, vOffset);
        return SampleLuminance(tex2D, uv);

    }

    struct LuminanceData {

        float m, n, e, s, w;
        float ne, nw, se, sw;
        float highest, lowest, contrast;

    };

    LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

        LuminanceData l;
        l.m = SampleLuminance( tex2D, uv );
        l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
        l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
        l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
        l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

        l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
        l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
        l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
        l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

        l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
        l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
        l.contrast = l.highest - l.lowest;
        return l;

    }

    bool ShouldSkipPixel( LuminanceData l ) {

        float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
        return l.contrast < threshold;

    }

    float DeterminePixelBlendFactor( LuminanceData l ) {

        float f = 2.0 * ( l.n + l.e + l.s + l.w );
        f += l.ne + l.nw + l.se + l.sw;
        f *= 1.0 / 12.0;
        f = abs( f - l.m );
        f = clamp( f / l.contrast, 0.0, 1.0 );

        float blendFactor = smoothstep( 0.0, 1.0, f );
        return blendFactor * blendFactor * _SubpixelBlending;

    }

    struct EdgeData {

        bool isHorizontal;
        float pixelStep;
        float oppositeLuminance, gradient;

    };

    EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

        EdgeData e;
        float horizontal =
            abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
            abs( l.ne + l.se - 2.0 * l.e ) +
            abs( l.nw + l.sw - 2.0 * l.w );
        float vertical =
            abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
            abs( l.ne + l.nw - 2.0 * l.n ) +
            abs( l.se + l.sw - 2.0 * l.s );
        e.isHorizontal = horizontal >= vertical;

        float pLuminance = e.isHorizontal ? l.n : l.e;
        float nLuminance = e.isHorizontal ? l.s : l.w;
        float pGradient = abs( pLuminance - l.m );
        float nGradient = abs( nLuminance - l.m );

        e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;
        
        if (pGradient < nGradient) {

            e.pixelStep = -e.pixelStep;
            e.oppositeLuminance = nLuminance;
            e.gradient = nGradient;

        } else {

            e.oppositeLuminance = pLuminance;
            e.gradient = pGradient;

        }

        return e;

    }

    float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

        vec2 uvEdge = uv;
        vec2 edgeStep;
        if (e.isHorizontal) {

            uvEdge.y += e.pixelStep * 0.5;
            edgeStep = vec2( texSize.x, 0.0 );

        } else {

            uvEdge.x += e.pixelStep * 0.5;
            edgeStep = vec2( 0.0, texSize.y );

        }

        float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
        float gradientThreshold = e.gradient * 0.25;

        vec2 puv = uvEdge + edgeStep * edgeSteps[0];
        float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
        bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

        for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

            puv += edgeStep * edgeSteps[i];
            pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
            pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

        }

        if ( !pAtEnd ) {

            puv += edgeStep * EDGE_GUESS;

        }

        vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
        float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
        bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

        for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

            nuv -= edgeStep * edgeSteps[i];
            nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
            nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

        }

        if ( !nAtEnd ) {

            nuv -= edgeStep * EDGE_GUESS;

        }

        float pDistance, nDistance;
        if ( e.isHorizontal ) {

            pDistance = puv.x - uv.x;
            nDistance = uv.x - nuv.x;

        } else {
            
            pDistance = puv.y - uv.y;
            nDistance = uv.y - nuv.y;

        }

        float shortestDistance;
        bool deltaSign;
        if ( pDistance <= nDistance ) {

            shortestDistance = pDistance;
            deltaSign = pLuminanceDelta >= 0.0;

        } else {

            shortestDistance = nDistance;
            deltaSign = nLuminanceDelta >= 0.0;

        }

        if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

            return 0.0;

        }

        return 0.5 - shortestDistance / ( pDistance + nDistance );

    }

    vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

        LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
        if ( ShouldSkipPixel( luminance ) ) {

            return Sample( tex2D, uv );

        }

        float pixelBlend = DeterminePixelBlendFactor( luminance );
        EdgeData edge = DetermineEdge( texSize, luminance );
        float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
        float finalBlend = max( pixelBlend, edgeBlend );

        if (edge.isHorizontal) {

            uv.y += edge.pixelStep * finalBlend;

        } else {

            uv.x += edge.pixelStep * finalBlend;

        }

        return Sample( tex2D, uv );

    }

    void main() {

        gl_FragColor = ApplyFXAA( tMap, uResolution.xy, vUv );
        
    }`, t = `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }`, { uRes: o } = ge(), s = `
        #extension GL_OES_standard_derivatives : enable
        precision highp float;` + e, n = `#version 300 es
        precision highp float;
        #define varying in
        #define texture2D texture
        #define gl_FragColor FragColor
        out vec4 FragColor;` + e, a = "" + t, l = `#version 300 es
        #define attribute in
        #define varying out` + t;
    return {
      fragment: i.renderer.isWebgl2 ? n : s,
      vertex: i.renderer.isWebgl2 ? l : a,
      uniforms: {
        uResolution: o
      }
    };
  };
  Wr = {
    key: 0
  };
  Qt = 45;
  Ur = oe({
    __name: "OGLRenderer",
    setup(i) {
      const { scene: e, togglePortal: t } = rr({}), { zoomProgress: o, blobProgress: s } = le();
      wn({});
      const { world: n } = ao({}), { gl: a, renderer: l, uPortal: r, uResolution: u, scene: d } = ge(), v = V(), h = V(), f = V(), y = new Ge(a, {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1
      }), m = new Ge(a, {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1
      }), c = new Ge(a, {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1
      }), { orthoPerspective: L } = Rt(y), { loadGeometries: C, loadManifest: w } = xe(), g = pe(false);
      C().then(() => {
        g.value = true, w();
      }), H(g, async () => {
        await qo(), d.value = v.value;
      }), y.position.z = 5;
      const x = new dt(a, {}), _ = new dt(a), E = {
        value: x.texture
      }, S = {
        value: _.texture
      }, { isSafari: P } = te();
      _e(() => {
        g.value && (s.enter > 0 ? (n.step(), P.value ? a.clearColor(0, 0, 0, 0) : a.clearColor(1, 1, 1, 0), R.render({
          scene: h.value,
          camera: y
        })) : (a.clearColor(246 / 255, 248 / 255, 250 / 255, 1), r.value = 0, t.value(false), l.render({
          scene: v.value,
          camera: y,
          target: x
        }), t.value(true), r.value = 1, a.clearColor(1, 0, 0, 1), l.render({
          scene: e.value,
          camera: y,
          target: _
        }), a.clearColor(1, 1, 1, 0), r.value = 0, R.render({
          scene: f.value,
          camera: y
        })));
      });
      const R = new no(a);
      R.addPass(yo(a)), ye(({ vh: U, vw: $ }) => {
        R.resize({
          width: $ * devicePixelRatio,
          height: U * devicePixelRatio,
          dpr: devicePixelRatio
        }), l.dpr = devicePixelRatio, l.setSize($, U), x.setSize($ * devicePixelRatio, U * devicePixelRatio), _.setSize($ * devicePixelRatio, U * devicePixelRatio);
        const F = Qt * Math.PI / 180, b = U / (2 * Math.tan(F / 2));
        y.position.z = b, m.perspective({
          aspect: $ / U,
          near: 0.1 * b / 5,
          far: 100 * b / 2,
          fov: Qt
        }), c.orthographic({
          left: -$ * 0.5,
          right: $ * 0.5,
          top: U * 0.5,
          bottom: -U * 0.5,
          near: 0.1 * b / 5,
          far: 100 * b / 5
        }), y.type = "perspective", G(1 - o.part2);
      });
      const A = j.parseEase("expo.in"), D = (U) => A(A(U)), { stackProgress: N } = le();
      H(() => N.camera, (U) => {
        L.value = D(1 - U);
      }, {
        immediate: true
      }), H(L, (U) => {
        G(U);
      });
      const G = (U) => {
        y.projectionMatrix = K(c.projectionMatrix, m.projectionMatrix, U), Object.assign(y, {
          left: c.left,
          right: c.right,
          top: c.top,
          bottom: c.bottom,
          zoom: c.zoom
        }), y.worldMatrix = K(c.worldMatrix, m.worldMatrix, U), U === 0 ? y.type = "orthographic" : y.type = "perspective";
      };
      function K(U, $, F) {
        const b = [];
        for (let M = 0; M < U.length; M++) b.push(p.Lerp(U[M], $[M], p.Clamp(F, 0, 1)));
        return new vt(...b);
      }
      return (U, $) => {
        const F = fo, b = po, M = nr;
        return T(g) ? (q(), Y("OGLTransform", Wr, [
          de(b, null, {
            default: yt(() => [
              ee("OGLTransform", {
                ref_key: "scene",
                ref: v
              }, [
                de(Gr)
              ], 512),
              ee("OGLTransform", {
                ref_key: "sceneBlob",
                ref: h
              }, [
                de(F)
              ], 512)
            ]),
            _: 1
          }),
          ee("OGLTransform", {
            ref_key: "portalScene",
            ref: f
          }, [
            de(M, {
              "t-portal": E,
              "t-mask": S
            })
          ], 512)
        ])) : Be("", true);
      };
    }
  });
  Jt = 45;
  Vr = oe({
    __name: "OGLRendererBlob",
    setup(i) {
      const { gl: e, renderer: t } = ge(), o = V(), s = new Ge(e, {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1
      }), n = new Ge(e, {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1
      }), a = new Ge(e, {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1
      }), l = () => {
        const { world: c } = ao({});
        return {
          world: c
        };
      }, { world: r } = l();
      Rt(s);
      const { loadGeometries: u, loadManifest: d } = xe(), v = pe(false);
      u().then(() => {
        v.value = true, d();
      }), s.position.z = 5, _e(() => {
        v.value && (y(0), r.step(), t.render({
          scene: o.value,
          camera: s
        }));
      }), ye(({ vh: c, vw: L }) => {
        t.dpr = devicePixelRatio, t.setSize(L, c);
        const C = Jt * Math.PI / 180, w = c / (2 * Math.tan(C / 2));
        s.position.z = w, n.perspective({
          aspect: L / c,
          near: 0.1 * w / 5,
          far: 100 * w / 5,
          fov: Jt
        }), a.orthographic({
          left: -L * 0.5,
          right: L * 0.5,
          top: c * 0.5,
          bottom: -c * 0.5,
          near: 0.1 * w / 5,
          far: 100 * w / 5
        }), s.type = "perspective", y(1);
      });
      const h = Jo.parseEase("expo.in"), f = (c) => h(h(c)), y = (c) => {
        c = f(c), s.projectionMatrix = m(a.projectionMatrix, n.projectionMatrix, c), s.worldMatrix = m(a.worldMatrix, n.worldMatrix, c), Object.assign(s, {
          left: a.left,
          right: a.right,
          top: a.top,
          bottom: a.bottom,
          zoom: a.zoom
        }), c === 0 ? s.type = "orthographic" : s.type = "perspective";
      };
      function m(c, L, C) {
        const w = [];
        for (let g = 0; g < c.length; g++) w.push(p.Lerp(c[g], L[g], p.Clamp(C, 0, 1)));
        return new vt(...w);
      }
      return (c, L) => {
        const C = fo, w = po;
        return q(), Y("OGLTransform", {
          ref_key: "scene",
          ref: o
        }, [
          de(w, null, {
            default: yt(() => [
              ee("OGLTransform", null, [
                de(C)
              ])
            ]),
            _: 1
          })
        ], 512);
      };
    }
  });
  Hr = 45;
  $r = oe({
    __name: "OGLRendererLogo",
    setup(i) {
      const { gl: e, renderer: t } = ge(), o = V(), s = new Ge(e, {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1
      });
      Rt(s);
      const { loadGeometries: n, loadManifest: a, geometries: l, textures: r } = xe(), u = pe(false), d = new no(e);
      d.addPass(yo());
      const { program: v } = ho(e, pe([
        15 / 255,
        48 / 255,
        67 / 255
      ]), pe([
        79 / 255,
        151 / 255,
        182 / 255
      ]), pe(1), pe(0));
      return n().then(() => {
        u.value = true, a();
        const h = l.logov2;
        (h.scene || h.scenes[0]).forEach((y) => {
          y.setParent(o.value), y.traverse((m) => {
            m.program && (m.program = v);
          });
        });
      }), _e(() => {
        u.value && (e.clearColor(1, 1, 1, 0), o.value.rotation.y += 25e-4, d.render({
          scene: o.value,
          camera: s
        }));
      }), ye(({ vh: h, vw: f }) => {
        t.dpr = devicePixelRatio, t.setSize(f, h), d.resize(), s.position.z = 5, s.perspective({
          aspect: f / h,
          near: 0.1,
          far: 1e3,
          fov: Hr
        }), s.type = "perspective";
      }), (h, f) => (q(), Y("OGLTransform", {
        ref_key: "scene",
        ref: o
      }, null, 512));
    }
  });
  ei = oe({
    __name: "WebGLScene",
    props: {
      route: {}
    },
    setup(i) {
      return (e, t) => (q(), Ye(Pn, null, {
        default: yt(() => [
          (q(), Ye(Yo(i.route === "index" ? Ur : i.route === "blob" ? Vr : $r)))
        ]),
        _: 1
      }));
    }
  });
});
export {
  ei as _,
  __tla
};
