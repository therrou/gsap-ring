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

export function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}
