import { cI as t, cy as d } from "#entry";
(function() {
  try {
    var e = typeof window < "u" ? window : typeof global < "u" ? global : typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : {}, s = new e.Error().stack;
    s && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[s] = "4c631489-fe0a-40fd-a107-e3f19e4d8b83", e._sentryDebugIdIdentifier = "sentry-dbid-4c631489-fe0a-40fd-a107-e3f19e4d8b83");
  } catch {
  }
})();
const f = (e) => {
  const { createState: s } = t();
  d(() => {
    s(e);
  });
};
export {
  f as u
};
