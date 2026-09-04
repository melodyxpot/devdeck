import { beforeEach, describe, expect, it } from "vitest";
import { workspace } from "@/services/workspace";
import { DevDeckError } from "@/lib/errors";

describe("workspace state", () => {
  beforeEach(() => {
    workspace.reset();
  });

  it("bumps a revision so the UI can subscribe", () => {
    const before = workspace.revision();
    workspace.killProcess(8214, true);
    expect(workspace.revision()).toBeGreaterThan(before);
  });

  it("starts and stops a project", () => {
    workspace.killProcess(8214, true);
    const started = workspace.startProject("melodyxpot");
    expect(started.status).toBe("running");
    expect(workspace.ports().some((port) => port.projectId === "melodyxpot")).toBe(true);
    workspace.stopProject("melodyxpot");
    expect(workspace.project("melodyxpot")?.status).toBe("stopped");
  });

  it("refuses to kill a process without confirmation", () => {
    expect(() => workspace.killProcess(8214, false)).toThrow(DevDeckError);
    workspace.killProcess(8214, true);
    expect(workspace.processes().some((process) => process.pid === 8214)).toBe(false);
  });

  it("rejects unsafe directories", () => {
    expect(() => workspace.addDirectory("../etc")).toThrow(DevDeckError);
  });
});
