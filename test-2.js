(function() {
    try {
      var r = typeof window < "u" ? window : typeof global < "u" ? global : typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : {}, t = new r.Error().stack;
      t && (r._sentryDebugIds = r._sentryDebugIds || {}, r._sentryDebugIds[t] = "188fe804-3147-4ad3-be49-de29f0d34915", r._sentryDebugIdIdentifier = "sentry-dbid-188fe804-3147-4ad3-be49-de29f0d34915");
    } catch {
    }
  })();
  function o(r, t) {
    return r[0] = t[0], r[1] = t[1], r;
  }
  function p(r, t, e) {
    return r[0] = t, r[1] = e, r;
  }
  function u(r, t, e) {
    return r[0] = t[0] + e[0], r[1] = t[1] + e[1], r;
  }
  function f(r, t, e) {
    return r[0] = t[0] - e[0], r[1] = t[1] - e[1], r;
  }
  function g(r, t, e) {
    return r[0] = t[0] * e[0], r[1] = t[1] * e[1], r;
  }
  function x(r, t, e) {
    return r[0] = t[0] / e[0], r[1] = t[1] / e[1], r;
  }
  function h(r, t, e) {
    return r[0] = t[0] * e, r[1] = t[1] * e, r;
  }
  function q(r, t) {
    var e = t[0] - r[0], n = t[1] - r[1];
    return Math.sqrt(e * e + n * n);
  }
  function M(r, t) {
    var e = t[0] - r[0], n = t[1] - r[1];
    return e * e + n * n;
  }
  function c(r) {
    var t = r[0], e = r[1];
    return Math.sqrt(t * t + e * e);
  }
  function D(r) {
    var t = r[0], e = r[1];
    return t * t + e * e;
  }
  function w(r, t) {
    return r[0] = -t[0], r[1] = -t[1], r;
  }
  function I(r, t) {
    return r[0] = 1 / t[0], r[1] = 1 / t[1], r;
  }
  function L(r, t) {
    var e = t[0], n = t[1], i = e * e + n * n;
    return i > 0 && (i = 1 / Math.sqrt(i)), r[0] = t[0] * i, r[1] = t[1] * i, r;
  }
  function A(r, t) {
    return r[0] * t[0] + r[1] * t[1];
  }
  function l(r, t) {
    return r[0] * t[1] - r[1] * t[0];
  }
  function _(r, t, e, n) {
    var i = t[0], s = t[1];
    return r[0] = i + n * (e[0] - i), r[1] = s + n * (e[1] - s), r;
  }
  function v(r, t, e, n, i) {
    const s = Math.exp(-n * i);
    let a = t[0], y = t[1];
    return r[0] = e[0] + (a - e[0]) * s, r[1] = e[1] + (y - e[1]) * s, r;
  }
  function z(r, t, e) {
    var n = t[0], i = t[1];
    return r[0] = e[0] * n + e[3] * i + e[6], r[1] = e[1] * n + e[4] * i + e[7], r;
  }
  function E(r, t, e) {
    let n = t[0], i = t[1];
    return r[0] = e[0] * n + e[4] * i + e[12], r[1] = e[1] * n + e[5] * i + e[13], r;
  }
  function T(r, t) {
    return r[0] === t[0] && r[1] === t[1];
  }
  class d extends Array {
    constructor(t = 0, e = t) {
      return super(t, e), this;
    }
    get x() {
      return this[0];
    }
    get y() {
      return this[1];
    }
    set x(t) {
      this[0] = t;
    }
    set y(t) {
      this[1] = t;
    }
    set(t, e = t) {
      return t.length ? this.copy(t) : (p(this, t, e), this);
    }
    copy(t) {
      return o(this, t), this;
    }
    add(t, e) {
      return e ? u(this, t, e) : u(this, this, t), this;
    }
    sub(t, e) {
      return e ? f(this, t, e) : f(this, this, t), this;
    }
    multiply(t) {
      return t.length ? g(this, this, t) : h(this, this, t), this;
    }
    divide(t) {
      return t.length ? x(this, this, t) : h(this, this, 1 / t), this;
    }
    inverse(t = this) {
      return I(this, t), this;
    }
    len() {
      return c(this);
    }
    distance(t) {
      return t ? q(this, t) : c(this);
    }
    squaredLen() {
      return this.squaredDistance();
    }
    squaredDistance(t) {
      return t ? M(this, t) : D(this);
    }
    negate(t = this) {
      return w(this, t), this;
    }
    cross(t, e) {
      return e ? l(t, e) : l(this, t);
    }
    scale(t) {
      return h(this, this, t), this;
    }
    normalize() {
      return L(this, this), this;
    }
    dot(t) {
      return A(this, t);
    }
    equals(t) {
      return T(this, t);
    }
    applyMatrix3(t) {
      return z(this, this, t), this;
    }
    applyMatrix4(t) {
      return E(this, this, t), this;
    }
    lerp(t, e) {
      return _(this, this, t, e), this;
    }
    smoothLerp(t, e, n) {
      return v(this, this, t, e, n), this;
    }
    clone() {
      return new d(this[0], this[1]);
    }
    fromArray(t, e = 0) {
      return this[0] = t[e], this[1] = t[e + 1], this;
    }
    toArray(t = [], e = 0) {
      return t[e] = this[0], t[e + 1] = this[1], t;
    }
  }
  export {
    d as V
  };
  