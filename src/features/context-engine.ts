import type { ProjectContext } from "@/types";
import { workspace } from "@/services/workspace";

export function projectContext(projectId: string): ProjectContext | null {
  return workspace.context(projectId);
}

export function answerLocalQuestion(projectId: string, question: string): string {
  const context = projectContext(projectId);
  if (!context) return "That project is not in the workspace.";
  const q = question.toLowerCase();
  if (q.includes("port")) {
    const ports = context.ports.map((port) => `:${port.port}`).join(", ");
    return ports
      ? `${context.project.name} is listening on ${ports}.`
      : `${context.project.name} is not listening on a port.`;
  }
  if (q.includes("running") || q.includes("working")) {
    return context.project.status === "running"
      ? `${context.project.name} is running (${context.processes.length} process(es)).`
      : `${context.project.name} is stopped.`;
  }
  if (q.includes("git")) {
    const git = context.git;
    if (!git) return "This folder is not a Git repository.";
    return `${git.branch} · ${git.ahead} ahead / ${git.behind} behind · ${git.unstaged.length + git.untracked.length} uncommitted`;
  }
  if (q.includes("changed")) {
    const git = context.git;
    const files = git ? [...git.staged, ...git.unstaged, ...git.untracked].map((file) => file.path) : [];
    return files.length ? `Recently dirty: ${files.join(", ")}` : "The working tree is clean.";
  }
  return `${context.project.name} · ${context.project.framework} · ${context.project.status}`;
}
