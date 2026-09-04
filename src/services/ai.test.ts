import { describe, expect, it } from "vitest";
import { analyzeErrorLocally, buildAiContextPreview } from "@/services/ai";
import { MOCK_PORTS, MOCK_PROCESSES } from "@/data/mock";

describe("AI debugger", () => {
  it("explains port conflicts without uploading", () => {
    const result = analyzeErrorLocally(
      "Error: EADDRINUSE: address already in use :::3000",
      MOCK_PORTS,
      MOCK_PROCESSES,
    );
    expect(result.summary).toContain("3000");
    expect(result.process?.pid).toBe(8214);
    expect(result.actions.some((action) => action.destructive)).toBe(true);
  });

  it("excludes env files from default context", () => {
    const preview = buildAiContextPreview([".env", "src/app/page.tsx"]);
    expect(preview.find((file) => file.path === ".env")?.included).toBe(false);
    expect(preview.find((file) => file.path === "src/app/page.tsx")?.sensitive).toBe(false);
  });
});
