import { describe, expect, it } from "vitest";
import {
  EXAMPLE2_BASE_CLEAR_COLOR,
  EXAMPLE2_FOV_DEGREES,
  EXAMPLE2_LOGO_PRIMARY_COLOR,
  EXAMPLE2_LOGO_SECONDARY_COLOR,
  computePerspectiveCameraDistanceFromViewportHeight,
  mixScalar,
} from "./example2-analysis";

describe("example-2 analysis constants", () => {
  it("keeps the shared FOV used by all OGL renderers", () => {
    expect(EXAMPLE2_FOV_DEGREES).toBe(45);
  });

  it("keeps the non-blob base clear color from OGLRenderer", () => {
    expect(EXAMPLE2_BASE_CLEAR_COLOR).toEqual([246 / 255, 248 / 255, 250 / 255]);
  });

  it("keeps the two-tone logo shader palette", () => {
    expect(EXAMPLE2_LOGO_PRIMARY_COLOR).toEqual([15 / 255, 48 / 255, 67 / 255]);
    expect(EXAMPLE2_LOGO_SECONDARY_COLOR).toEqual([79 / 255, 151 / 255, 182 / 255]);
  });
});

describe("example-2 camera helpers", () => {
  it("computes the same perspective distance formula seen in the bundle", () => {
    const distance = computePerspectiveCameraDistanceFromViewportHeight(900, EXAMPLE2_FOV_DEGREES);
    const expected = 900 / (2 * Math.tan((45 * Math.PI) / 180 / 2));
    expect(distance).toBeCloseTo(expected, 8);
  });

  it("linearly interpolates scalar values for projection blending", () => {
    expect(mixScalar(10, 30, 0)).toBe(10);
    expect(mixScalar(10, 30, 1)).toBe(30);
    expect(mixScalar(10, 30, 0.5)).toBe(20);
  });
});
