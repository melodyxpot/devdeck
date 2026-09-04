import { describe, expect, it } from "vitest";
import { categorizeClipboard, isSensitiveClipboard } from "@/utils/clipboard";

describe("clipboard categorization", () => {
  it("classifies common developer payloads", () => {
    expect(categorizeClipboard("https://localhost:3000")).toBe("url");
    expect(categorizeClipboard('{"ok":true}')).toBe("json");
    expect(categorizeClipboard("pnpm run dev")).toBe("command");
    expect(categorizeClipboard("Error: EADDRINUSE: address already in use :::3000")).toBe("error");
    expect(categorizeClipboard("export type Foo = string;")).toBe("code");
  });

  it("flags secrets", () => {
    expect(isSensitiveClipboard("API_KEY=sk-test")).toBe(true);
    expect(isSensitiveClipboard("hello world")).toBe(false);
  });
});
