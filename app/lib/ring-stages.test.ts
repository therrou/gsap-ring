import { describe, expect, it } from "vitest";
import {
  computeContainerTilt,
  computeFeaturedCenterRotation,
  computeNonFeaturedOpacity,
  computeRowTarget,
  computeZoomLift,
  computeZoomScale,
  dampToward,
  easeBezierInOut,
  easeExpoIn,
  easePow1InOut,
  easePower2Out,
  mixProjectionMatrices,
  orthographicBlendT,
  wrapToPi,
} from "./ring-stages";

describe("ring-stages easings", () => {
  it("bezier in-out hits endpoints and midpoint", () => {
    expect(easeBezierInOut(0)).toBeCloseTo(0, 8);
    expect(easeBezierInOut(1)).toBeCloseTo(1, 8);
    expect(easeBezierInOut(0.5)).toBeCloseTo(0.5, 8);
  });

  it("power2.out is cubic ease-out", () => {
    expect(easePower2Out(0)).toBeCloseTo(0, 8);
    expect(easePower2Out(1)).toBeCloseTo(1, 8);
    expect(easePower2Out(0.5)).toBeCloseTo(1 - 0.125, 8);
  });

  it("power1.inOut is quad in-out", () => {
    expect(easePow1InOut(0)).toBeCloseTo(0, 8);
    expect(easePow1InOut(1)).toBeCloseTo(1, 8);
    expect(easePow1InOut(0.5)).toBeCloseTo(0.5, 8);
    expect(easePow1InOut(0.25)).toBeCloseTo(0.125, 8);
  });

  it("expo.in is pinned at 0 and rises sharply", () => {
    expect(easeExpoIn(0)).toBe(0);
    expect(easeExpoIn(1)).toBeCloseTo(1, 8);
    expect(easeExpoIn(0.5)).toBeLessThan(0.05);
  });

  it("ortho blend goes perspective(0) -> orthographic(1) with zoom", () => {
    expect(orthographicBlendT(0)).toBe(0);
    expect(orthographicBlendT(1)).toBeCloseTo(1, 8);
    expect(orthographicBlendT(0.5)).toBeLessThan(0.01);
  });
});

describe("wrapToPi", () => {
  it("wraps into (-pi, pi]", () => {
    expect(wrapToPi(0)).toBeCloseTo(0, 8);
    expect(wrapToPi(Math.PI)).toBeCloseTo(Math.PI, 8);
    expect(wrapToPi(Math.PI * 1.5)).toBeCloseTo(-Math.PI * 0.5, 8);
    expect(wrapToPi(-Math.PI * 1.5)).toBeCloseTo(Math.PI * 0.5, 8);
    expect(wrapToPi(Math.PI * 2)).toBeCloseTo(0, 8);
  });
});

describe("stage 1 zoom", () => {
  it("scale ramps 1 -> max", () => {
    expect(computeZoomScale(0)).toBeCloseTo(1, 8);
    expect(computeZoomScale(1, 3.7)).toBeCloseTo(3.7, 8);
    expect(computeZoomScale(1, 3)).toBeCloseTo(3, 8);
  });

  it("lift pulls the ring up (negative) by up to one radius", () => {
    expect(computeZoomLift(0, 328)).toBeCloseTo(0, 8);
    expect(computeZoomLift(1, 328)).toBeCloseTo(-328, 6);
  });

  it("center rotation drives featured to screen centre at part2=1", () => {
    // featured at theta = π/2, wrapper unrotated → needs +π/2 to reach 0... wrap.
    const r = computeFeaturedCenterRotation(Math.PI / 2, 0, 1);
    expect(r).toBeCloseTo(wrapToPi(Math.PI / 2), 8);
    expect(computeFeaturedCenterRotation(Math.PI / 2, 0, 0)).toBeCloseTo(0, 8);
  });
});

describe("stage 2 stack fade", () => {
  it("non-featured opacity fades 1 -> 0", () => {
    expect(computeNonFeaturedOpacity(0)).toBeCloseTo(1, 8);
    expect(computeNonFeaturedOpacity(1)).toBeCloseTo(0, 8);
  });

  it("container tilt opens to +-pi/6", () => {
    expect(computeContainerTilt(0)).toEqual({ x: 0, y: -0 });
    const full = computeContainerTilt(1);
    expect(full.x).toBeCloseTo(Math.PI / 6, 8);
    expect(full.y).toBeCloseTo(-Math.PI / 6, 8);
  });
});

describe("stage 3 row", () => {
  const base = {
    count: 23,
    viewportWidth: 1440,
    viewportHeight: 900,
    cardHalf: 50,
  };

  it("at part4=0 the eased blend is 0 (cards stay collapsed)", () => {
    const r = computeRowTarget({ index: 0, part4: 0, ...base });
    expect(r.t).toBeCloseTo(0, 8);
  });

  it("spreads first/last cards to opposite diagonal corners", () => {
    const first = computeRowTarget({ index: 0, part4: 1, ...base });
    const last = computeRowTarget({ index: 22, part4: 1, ...base });
    const spanX = base.viewportWidth - base.cardHalf * 2;
    const spanY = base.viewportHeight - base.cardHalf * 2;
    expect(first.x).toBeCloseTo(-spanX / 2, 6);
    expect(first.y).toBeCloseTo(-spanY / 2, 6);
    expect(last.x).toBeCloseTo(spanX / 2, 6);
    expect(last.y).toBeCloseTo(spanY / 2, 6);
    expect(last.t).toBeCloseTo(1, 8);
  });

  it("middle card sits near the centre", () => {
    const mid = computeRowTarget({ index: 11, part4: 1, ...base });
    expect(mid.x).toBeCloseTo(0, 0);
    expect(mid.y).toBeCloseTo(0, 0);
  });
});

describe("per-frame helpers", () => {
  it("dampToward moves toward target and converges", () => {
    let v = 0;
    for (let i = 0; i < 240; i++) v = dampToward(v, 100, 0.02, 16);
    expect(v).toBeCloseTo(100, 1);
    // single step stays between current and target
    const step = dampToward(0, 100, 0.02, 16);
    expect(step).toBeGreaterThan(0);
    expect(step).toBeLessThan(100);
  });

  it("mixProjectionMatrices blends element-wise (0=persp,1=ortho)", () => {
    const persp = new Array(16).fill(2);
    const ortho = new Array(16).fill(4);
    expect(mixProjectionMatrices(persp, ortho, 0)[0]).toBeCloseTo(2, 8);
    expect(mixProjectionMatrices(persp, ortho, 1)[5]).toBeCloseTo(4, 8);
    expect(mixProjectionMatrices(persp, ortho, 0.5)[10]).toBeCloseTo(3, 8);
  });
});
