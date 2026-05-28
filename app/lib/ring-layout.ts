export type RingTransform = {
  x: number;
  y: number;
  z: number;
  angle: number;
  faceRotationZ: number;
  stackTilt: number;
};

export function ringAngleAtIndex(index: number, total: number) {
  return ((index - total * 0.75) * Math.PI * 2) / total;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function wrapIndexOffset(index: number, focusIndex: number, total: number) {
  return ((index - focusIndex + total / 2) % total + total) % total - total / 2;
}

export function stackedRingTiltAtIndex(index: number, total: number, focusIndex: number) {
  const offset = wrapIndexOffset(index, focusIndex, total);

  if (offset > 0 && offset <= 6) {
    return -Math.PI * 0.5;
  }

  if (offset < 0 && offset >= -6) {
    return Math.PI * 0.5;
  }

  return 0;
}

export function stackedRingAngleAtIndex(
  index: number,
  total: number,
  focusIndex: number,
  progress: number,
) {
  const t = clamp01(progress);
  const baseAngle = ringAngleAtIndex(index, total);
  const stackTilt = stackedRingTiltAtIndex(index, total, focusIndex);
  const stackedAngle = baseAngle - stackTilt;
  return baseAngle + (stackedAngle - baseAngle) * t;
}

export function buildRingTransforms(input: {
  count: number;
  radius: number;
  depthWarp: number;
  stackProgress?: number;
  focusIndex?: number;
}): RingTransform[] {
  const { count, radius, depthWarp } = input;
  const stackProgress = clamp01(input.stackProgress ?? 0);
  const focusIndex = input.focusIndex ?? Math.floor(count * 0.625);

  return Array.from({ length: count }, (_, index) => {
    const angle = stackedRingAngleAtIndex(index, count, focusIndex, stackProgress);
    const stackTilt = stackedRingTiltAtIndex(index, count, focusIndex) * stackProgress;

    return {
      x: Math.cos(angle) * radius,
      y: 0,
      z: -Math.sin(angle) * radius - radius - depthWarp,
      angle,
      faceRotationZ: -angle + Math.PI * 1.5 + stackTilt,
      stackTilt,
    };
  });
}
