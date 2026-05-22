import { describe, expect, it } from "vitest";
import { buildRingTransforms, ringAngleAtIndex } from "./ring-layout";

describe("ring layout", () => {
  it("uses example-2 angle offset formula", () => {
    const angle = ringAngleAtIndex(0, 24);
    const expected = ((0 - 24 * 0.75) * Math.PI * 2) / 24;
    expect(angle).toBeCloseTo(expected, 8);
  });

  it("places cards on circular x/z radius with negative depth offset", () => {
    const transforms = buildRingTransforms({ count: 4, radius: 300, depthWarp: 0 });
    expect(transforms[1].x).toBeCloseTo(-300, 6);
    expect(transforms[1].z).toBeCloseTo(-300, 6);
  });

  it("applies depth warp on z channel", () => {
    const transforms = buildRingTransforms({ count: 4, radius: 300, depthWarp: 80 });
    expect(transforms[1].z).toBeCloseTo(-380, 6);
  });

  it("returns one transform per requested card", () => {
    const transforms = buildRingTransforms({ count: 24, radius: 350, depthWarp: 115 });
    expect(transforms).toHaveLength(24);
  });
});
