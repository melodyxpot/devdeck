import { describe, expect, it } from "vitest";
import { formatKbps, formatKbpsCompact, ringProgress, walkRate } from "@/utils/network";

describe("network rates", () => {
  it("formats kbps into glanceable units", () => {
    expect(formatKbps(0)).toBe("0 bps");
    expect(formatKbps(0.4)).toBe("400 bps");
    expect(formatKbps(12)).toBe("12 Kbps");
    expect(formatKbps(1800)).toBe("1.8 Mbps");
  });

  it("compacts labels for the top-bar ring", () => {
    expect(formatKbpsCompact(0)).toBe("0");
    expect(formatKbpsCompact(2500)).toBe("2.5M");
  });

  it("maps rates onto a log ring so small traffic is still visible", () => {
    expect(ringProgress(0)).toBe(0);
    expect(ringProgress(80)).toBeGreaterThan(0.2);
    expect(ringProgress(80)).toBeLessThan(ringProgress(8000));
    expect(ringProgress(1_000_000)).toBe(1);
  });

  it("walks a mock rate without leaving the band", () => {
    const next = walkRate(100, 40, 160, 20);
    expect(next).toBeGreaterThanOrEqual(40);
    expect(next).toBeLessThanOrEqual(160);
  });
});
