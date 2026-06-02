import { describe, expect, it } from "vitest";
import {
  RING_CARD_PLANE_FORWARD,
  computeCardPlaneFaceRotation,
  computeCardPlaneForwardZ,
  computeCardPlaneInfluence,
  computeMouseRingForce,
  easePow1Out,
} from "./ring-parity";

describe("ring parity hover", () => {
  it("power1.out matches GSAP quad-out curve", () => {
    expect(easePow1Out(0)).toBeCloseTo(0, 8);
    expect(easePow1Out(1)).toBeCloseTo(1, 8);
    expect(easePow1Out(0.5)).toBeCloseTo(0.75, 8);
    // clamps out-of-range inputs
    expect(easePow1Out(2)).toBe(1);
    expect(easePow1Out(-1)).toBe(0);
  });

  it("influence peaks at the pointer and decays to zero past the radius", () => {
    const onPointer = computeCardPlaneInfluence({
      cardX: 0,
      cardY: 0,
      pointerOffsetX: 0,
      pointerOffsetY: 0,
      ringRadius: 328,
      mouseForce: 1,
      zoomProgress: 0,
    });
    expect(onPointer).toBeCloseTo(1, 6);

    const far = computeCardPlaneInfluence({
      cardX: 100000,
      cardY: 0,
      pointerOffsetX: 0,
      pointerOffsetY: 0,
      ringRadius: 328,
      mouseForce: 1,
      zoomProgress: 0,
    });
    expect(far).toBe(0);
  });

  it("face turn reaches a half-turn at full influence and idle zoom", () => {
    expect(
      computeCardPlaneFaceRotation({ influence: 1, zoomProgress: 0 }),
    ).toBeCloseTo(Math.PI, 8);
  });

  it("face turn is fully attenuated once zoom passes 0.7", () => {
    expect(
      computeCardPlaneFaceRotation({ influence: 1, zoomProgress: 0.7 }),
    ).toBeCloseTo(0, 8);
    expect(
      computeCardPlaneFaceRotation({ influence: 1, zoomProgress: 1 }),
    ).toBeCloseTo(0, 8);
  });

  it("forward push is 160px at full influence and fades to zero on zoom", () => {
    expect(
      computeCardPlaneForwardZ({ influence: 1, zoomProgress: 0 }),
    ).toBeCloseTo(RING_CARD_PLANE_FORWARD, 6);
    expect(
      computeCardPlaneForwardZ({ influence: 1, zoomProgress: 1 }),
    ).toBeCloseTo(0, 8);
  });

  it("forward push scales linearly with influence", () => {
    expect(
      computeCardPlaneForwardZ({ influence: 0.5, zoomProgress: 0 }),
    ).toBeCloseTo(RING_CARD_PLANE_FORWARD * 0.5, 6);
  });

  it("ring force is log-scaled past the radius and gated by zoom", () => {
    const force = computeMouseRingForce({
      pointerOffsetX: 328,
      ringRadius: 328,
      mouseForce: 1,
      zoomProgress: 0,
    });
    // |offset| == radius → normalized == 1 → force == 1
    expect(force).toBeCloseTo(1, 6);

    const zoomed = computeMouseRingForce({
      pointerOffsetX: 328,
      ringRadius: 328,
      mouseForce: 1,
      zoomProgress: 1,
    });
    expect(zoomed).toBe(0);
  });
});
