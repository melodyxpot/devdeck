import { describe, expect, it } from "vitest";
import { appendSample, rankProcessesByCpu, totalCpuShare } from "@/utils/processes";
import type { DevProcess } from "@/types";

function process(partial: Partial<DevProcess> & Pick<DevProcess, "pid" | "name" | "cpu">): DevProcess {
  return {
    command: partial.name,
    memoryMb: 32,
    port: null,
    projectId: null,
    projectName: null,
    status: "running",
    path: null,
    ...partial,
  };
}

describe("process ranking", () => {
  it("orders by CPU and keeps a short list", () => {
    const ranked = rankProcessesByCpu(
      [
        process({ pid: 1, name: "idle", cpu: 0.2 }),
        process({ pid: 2, name: "node", cpu: 18.4 }),
        process({ pid: 3, name: "chrome", cpu: 9.1 }),
      ],
      2,
    );
    expect(ranked.map((item) => item.name)).toEqual(["node", "chrome"]);
  });

  it("sums CPU share for the stacked bar", () => {
    expect(totalCpuShare([process({ pid: 1, name: "a", cpu: 10 }), process({ pid: 2, name: "b", cpu: 5 })])).toBe(15);
  });

  it("caps sparkline history", () => {
    const history = appendSample([1, 2, 3], 4, 3);
    expect(history).toEqual([2, 3, 4]);
  });
});
