function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function easeSineInOut(value: number) {
  const t = clamp01(value);
  return 0.5 * (1 - Math.cos(Math.PI * t));
}

/**
 * GSAP `power1.out` (quadratic ease-out): `1 - (1 - t)^2`.
 * example-2 uses `p.Ease.pow1.out` to attenuate the ring-hover face turn and
 * forward push as the ring zooms in.
 */
export function easePow1Out(value: number) {
  const t = clamp01(value);
  return 1 - (1 - t) * (1 - t);
}

export function computeResponsiveRingRadius(input: {
  vw: number;
  vh: number;
  scale: number;
  isLg: boolean;
  isMd: boolean;
  ringRadiusMarginMobile?: number;
}) {
  const { vw, vh, scale, isLg, isMd } = input;
  const ringRadiusMarginMobile = input.ringRadiusMarginMobile ?? 120;

  if (isLg) {
    return 328 * scale;
  }

  const longestAxis = Math.max(vw, vh);
  if (isMd) {
    return longestAxis * 0.5 - ringRadiusMarginMobile * 1.3;
  }

  return longestAxis * 0.5 - ringRadiusMarginMobile * scale;
}

export function computeMouseRingForce(input: {
  pointerOffsetX: number;
  ringRadius: number;
  mouseForce: number;
  zoomProgress: number;
}) {
  const { pointerOffsetX, ringRadius, mouseForce, zoomProgress } = input;
  if (ringRadius <= 0) {
    return 0;
  }

  const absOffset = Math.abs(pointerOffsetX);
  const normalizedOffset =
    absOffset < ringRadius ? absOffset / ringRadius : Math.log(absOffset / ringRadius) + 1;
  const signedForce = Math.sign(pointerOffsetX) * normalizedOffset;
  return signedForce * mouseForce * (1 - clamp01(zoomProgress));
}

export function computeCardPlaneInfluence(input: {
  cardX: number;
  cardY: number;
  pointerOffsetX: number;
  pointerOffsetY: number;
  ringRadius: number;
  mouseForce: number;
  zoomProgress: number;
}) {
  const { cardX, cardY, pointerOffsetX, pointerOffsetY, ringRadius, mouseForce, zoomProgress } = input;
  if (ringRadius <= 0) {
    return 0;
  }

  const dx = cardX - pointerOffsetX;
  const dy = cardY - pointerOffsetY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const influenceRadius = Math.PI * lerp(0.3, 0.15, clamp01(zoomProgress)) * ringRadius;
  if (influenceRadius <= 0) {
    return 0;
  }

  const normalized = clamp01(1 - distance / influenceRadius);
  return easeSineInOut(normalized) * mouseForce;
}

/** Maximum forward (toward-camera) push of a hovered ring card, in CSS px. */
export const RING_CARD_PLANE_FORWARD = 160;

/**
 * Per-card hover face turn, applied to the card plane's LOCAL Y rotation
 * (example-2 `Ar`):
 *
 *   rotationPlane.y = π · influence · (1 - pow1.out(clamp(zoom / 0.7)))
 *
 * Cards rotate up to a half-turn (π) to face the pointer while the ring is
 * idle, then the effect fades out over the first 70% of the zoom.
 */
export function computeCardPlaneFaceRotation(input: {
  influence: number;
  zoomProgress: number;
}) {
  const { influence, zoomProgress } = input;
  const attenuation = 1 - easePow1Out(clamp01(zoomProgress) / 0.7);
  return Math.PI * influence * attenuation;
}

/**
 * Per-card hover push along the card plane's LOCAL +Z (its facing normal),
 * lifting the hovered card off the ring toward the camera (example-2 `Ar`):
 *
 *   positionPlane.z = 160 · influence · (1 - pow1.out(zoom))
 */
export function computeCardPlaneForwardZ(input: {
  influence: number;
  zoomProgress: number;
  maxForward?: number;
}) {
  const { influence, zoomProgress } = input;
  const maxForward = input.maxForward ?? RING_CARD_PLANE_FORWARD;
  return maxForward * influence * (1 - easePow1Out(clamp01(zoomProgress)));
}

export function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}
