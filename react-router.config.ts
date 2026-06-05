import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  // This is a 100% client-side WebGL app (no loaders/server data), so SPA mode:
  // builds to static files, no serverless function to crash on Vercel.
  ssr: false,
  // Emits Vercel-compatible build output (static + SPA fallback).
  presets: [vercelPreset()],
} satisfies Config;
