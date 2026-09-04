import { describe, expect, it } from "vitest";
import { answerLocalQuestion } from "@/features/context-engine";
import { workspace } from "@/services/workspace";

describe("project context engine", () => {
  it("answers local questions from cached project state", () => {
    workspace.reset();
    expect(answerLocalQuestion("momoreis", "Which port is my project using?")).toContain("3000");
    expect(answerLocalQuestion("momoreis", "What is my current Git status?")).toContain("feature/leaderboard");
    expect(answerLocalQuestion("melodyxpot", "What's currently running?")).toContain("stopped");
  });
});
