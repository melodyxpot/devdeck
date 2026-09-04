import type { AiAnalysis, AiContextFile, DevProcess, ListeningPort } from "@/types";
import { shouldExcludeFromAi } from "@/utils/env";

const SENSITIVE_DEFAULTS = [".env", ".env.local", "id_rsa", "credentials.json"];

export function buildAiContextPreview(files: string[]): AiContextFile[] {
  const defaults = [
    { path: "error output", included: true, reason: "Selected error", sensitive: false },
    { path: "package.json", included: true, reason: "Project metadata", sensitive: false },
    { path: "tsconfig.json", included: true, reason: "Compiler options", sensitive: false },
    { path: "git status", included: true, reason: "Working tree", sensitive: false },
    ...SENSITIVE_DEFAULTS.map((path) => ({
      path,
      included: false,
      reason: "Excluded by default",
      sensitive: true,
    })),
  ];
  const extra = files
    .filter((file) => !defaults.some((item) => item.path === file))
    .map((path) => ({
      path,
      included: !shouldExcludeFromAi(path),
      reason: shouldExcludeFromAi(path) ? "Looks like a secret file" : "User selected",
      sensitive: shouldExcludeFromAi(path),
    }));
  return [...defaults, ...extra];
}

export function analyzeErrorLocally(
  errorText: string,
  ports: ListeningPort[],
  processes: DevProcess[],
): AiAnalysis {
  const text = errorText.toLowerCase();

  if (text.includes("eaddrinuse") || text.includes("address already in use")) {
    const portMatch = /:(\d{2,5})/.exec(errorText);
    const port = portMatch?.[1] ? Number(portMatch[1]) : 3000;
    const listener = ports.find((item) => item.port === port);
    const process = processes.find((item) => item.pid === listener?.pid) ?? processes[0];
    return {
      summary: `Port ${port} is already being used.`,
      likelyCause: "Another development server is running.",
      recommendedAction: "Stop the existing process or start this project on another port.",
      process: process
        ? { name: process.name, pid: process.pid, port: process.port ?? port }
        : listener
          ? { name: listener.process, pid: listener.pid, port }
          : undefined,
      actions: [
        { id: "inspect", label: "Inspect Process" },
        { id: "kill", label: "Kill Process", destructive: true },
      ],
    };
  }

  if (text.includes("enoent") && text.includes("package.json")) {
    return {
      summary: "The working directory does not look like a Node project.",
      likelyCause: "A script ran outside the project root, or the folder is missing package.json.",
      recommendedAction: "Open the project folder and confirm package.json exists before running scripts.",
      actions: [{ id: "open-project", label: "Open Project" }],
    };
  }

  if (text.includes("module not found") || text.includes("cannot find module")) {
    return {
      summary: "A required package is missing from node_modules.",
      likelyCause: "Dependencies were not installed, or the lockfile is out of date.",
      recommendedAction: "Run the package manager install command in the project root.",
      actions: [{ id: "install", label: "Run install" }],
    };
  }

  return {
    summary: "DevDeck read the error but needs more context for a precise fix.",
    likelyCause: "This may be a compile, runtime, or environment issue.",
    recommendedAction: "Review the AI context, include package.json and recent terminal output, then ask again.",
    actions: [{ id: "review", label: "Review Context" }],
  };
}
