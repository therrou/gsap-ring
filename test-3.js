import { b8 as v, bg as r, cC as f } from "#entry";
(function() {
  try {
    var e = typeof window < "u" ? window : typeof global < "u" ? global : typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : {}, u = new e.Error().stack;
    u && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[u] = "1a89f15e-2684-420e-8016-f5241f2698b5", e._sentryDebugIdIdentifier = "sentry-dbid-1a89f15e-2684-420e-8016-f5241f2698b5");
  } catch {
  }
})();
const d = ({ target: e = r(0), damped: u = r(0), velocity: a = r(0), damping: n = r(0.5), stiffness: l = r(50), useCriticalDamping: s = false } = {}) => {
  e = f(e), u = f(u), a = f(a), n = f(n), l = f(l);
  const o = r(0);
  return s && (n.value = 2 * Math.sqrt(l.value)), v(({ delta: b }) => {
    o.value = (e.value - u.value) * l.value, o.value -= a.value * n.value, a.value += o.value * b * 1e-3, u.value += a.value * b * 1e-3;
  }), { target: e, damped: u, velocity: a, stiffness: l };
};
export {
  d as u
};
