export type RingTransform = {
  x: number;
  y: number;
  z: number;
  angle: number;
  faceRotationZ: number;
};

export function ringAngleAtIndex(index: number, total: number) {
  return ((index - total * 0.75) * Math.PI * 2) / total;
}

export function buildRingTransforms(input: {
  count: number;
  radius: number;
  depthWarp: number;
}): RingTransform[] {
  const { count, radius, depthWarp } = input;
  return Array.from({ length: count }, (_, index) => {
    const angle = ringAngleAtIndex(index, count);
    return {
      x: Math.cos(angle) * radius,
      y: 0,
      z: -Math.sin(angle) * radius - radius - depthWarp,
      angle,
      faceRotationZ: -angle + Math.PI * 1.5,
    };
  });
}
