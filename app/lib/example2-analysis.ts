export const EXAMPLE2_FOV_DEGREES = 45;

export const EXAMPLE2_BASE_CLEAR_COLOR: readonly [number, number, number] = [
  246 / 255,
  248 / 255,
  250 / 255,
];

export const EXAMPLE2_LOGO_PRIMARY_COLOR: readonly [number, number, number] = [
  15 / 255,
  48 / 255,
  67 / 255,
];

export const EXAMPLE2_LOGO_SECONDARY_COLOR: readonly [number, number, number] = [
  79 / 255,
  151 / 255,
  182 / 255,
];

export function computePerspectiveCameraDistanceFromViewportHeight(height: number, fovDegrees: number) {
  const fovRadians = (fovDegrees * Math.PI) / 180;
  return height / (2 * Math.tan(fovRadians * 0.5));
}

export function mixScalar(from: number, to: number, progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  return from + (to - from) * t;
}
