import { cG as a, cH as r } from "#entry";
(function() {
  try {
    var e = typeof window < "u" ? window : typeof global < "u" ? global : typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : {}, n = new e.Error().stack;
    n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "078785ef-3658-4fce-a22e-b5238cb2aa42", e._sentryDebugIdIdentifier = "sentry-dbid-078785ef-3658-4fce-a22e-b5238cb2aa42");
  } catch {
  }
})();
var s = a.registerPlugin(r) || a;
s.core.Tween;
export {
  s as g
};
