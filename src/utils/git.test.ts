import { describe, expect, it } from "vitest";
import { parseAheadBehind, parsePorcelainLine } from "@/utils/git";

describe("git status parsing", () => {
  it("parses porcelain lines", () => {
    expect(parsePorcelainLine(" M src/lib/ranking.ts")).toMatchObject({
      path: "src/lib/ranking.ts",
      status: "modified",
      staged: false,
    });
    expect(parsePorcelainLine("A  src/new.ts")).toMatchObject({
      path: "src/new.ts",
      status: "added",
      staged: true,
    });
    expect(parsePorcelainLine("?? src/podium.tsx")).toMatchObject({
      path: "src/podium.tsx",
      status: "untracked",
    });
  });

  it("parses ahead/behind", () => {
    expect(parseAheadBehind("## feature [ahead 2, behind 1]")).toEqual({ ahead: 2, behind: 1 });
  });
});
