import { describe, expect, it } from "vitest";
import {
  detectFramework,
  detectPackageManager,
  hasPathTraversal,
  isSafeUserPath,
} from "@/utils/paths";

describe("path security", () => {
  it("rejects parent traversal", () => {
    expect(hasPathTraversal("D:/Projects/../Windows")).toBe(true);
    expect(isSafeUserPath("D:\\Projects\\..\\Windows")).toBe(false);
    expect(isSafeUserPath("D:\\Projects\\momoreis")).toBe(true);
    expect(isSafeUserPath("projects/foo")).toBe(false);
    expect(isSafeUserPath("")).toBe(false);
  });
});

describe("project detection", () => {
  it("detects package managers from lockfiles", () => {
    expect(detectPackageManager(["pnpm-lock.yaml", "package.json"])).toBe("pnpm");
    expect(detectPackageManager(["bun.lock", "package.json"])).toBe("bun");
    expect(detectPackageManager(["yarn.lock"])).toBe("yarn");
    expect(detectPackageManager(["package-lock.json"])).toBe("npm");
  });

  it("detects frameworks", () => {
    expect(detectFramework(["next.config.ts", "package.json"]).framework).toBe("nextjs");
    expect(detectFramework(["Cargo.toml"]).framework).toBe("rust");
    expect(detectFramework(["manage.py"]).framework).toBe("django");
    expect(detectFramework(["go.mod"]).runtime).toBe("go");
  });
});
