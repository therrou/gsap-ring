import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  // This is a 100% client-side WebGL app (no loaders/server data), so SPA mode:
  // builds to static files, no serverless function to crash on Vercel.
  ssr: false,
  // SPA mode only prerenders "/" by default, so deep links like /test 404 on a
  // static host. Prerender every route to a static HTML file so Vercel serves
  // them directly (no SSR function, no SPA-fallback config needed).
  prerender: ["/", "/test"],
  // Emits Vercel-compatible build output.
  presets: [vercelPreset()],
} satisfies Config;
