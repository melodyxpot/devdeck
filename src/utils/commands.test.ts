import { describe, expect, it } from "vitest";
import { expandSnippet, parseCommandTokens, rankCommands, snippetPlaceholders } from "@/utils/commands";
import { ALL_COMMANDS } from "@/services/command-registry";

describe("command parsing", () => {
  it("splits verb and rest", () => {
    expect(parseCommandTokens("kill 3000")).toEqual({ verb: "kill", rest: "3000" });
    expect(parseCommandTokens("Open")).toEqual({ verb: "open", rest: "" });
  });

  it("ranks palette commands by alias", () => {
    const ranked = rankCommands(ALL_COMMANDS, "dash");
    expect(ranked.some((command) => command.id === "nav.dashboard")).toBe(true);
    const git = rankCommands(ALL_COMMANDS, "push");
    expect(git[0]?.id).toBe("git.push");
  });

  it("expands snippet placeholders", () => {
    expect(snippetPlaceholders("ssh {user}@{server}")).toEqual(["user", "server"]);
    expect(expandSnippet("ssh {user}@{server}", { user: "ada", server: "box" })).toBe("ssh ada@box");
  });
});
