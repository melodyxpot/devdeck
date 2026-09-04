import type { CommandDefinition, RouteId } from "@/types";

export const NAV_COMMANDS: CommandDefinition[] = [
  { id: "nav.dashboard", title: "Open Dashboard", aliases: ["home"], group: "Navigate", shortcut: "Mod+Shift+D", keywords: ["dashboard"] },
  { id: "nav.projects", title: "Open Projects", aliases: ["project manager"], group: "Navigate", keywords: ["projects"] },
  { id: "nav.terminal", title: "Open Terminal", aliases: ["term", "shell"], group: "Navigate", keywords: ["terminal"] },
  { id: "nav.git", title: "Open Git", aliases: ["source"], group: "Navigate", keywords: ["git"] },
  { id: "nav.github", title: "Open GitHub", aliases: ["prs", "issues"], group: "Navigate", keywords: ["github"] },
  { id: "nav.ports", title: "Open Ports", aliases: ["localhost"], group: "Navigate", keywords: ["ports"] },
  { id: "nav.processes", title: "Open Processes", aliases: ["pid"], group: "Navigate", keywords: ["processes"] },
  { id: "nav.docker", title: "Open Docker", aliases: ["containers"], group: "Navigate", keywords: ["docker"] },
  { id: "nav.environment", title: "Open Environment", aliases: ["env", "dotenv"], group: "Navigate", keywords: ["environment"] },
  { id: "nav.clipboard", title: "Search clipboard", aliases: ["paste"], group: "Navigate", shortcut: "Mod+Shift+V", keywords: ["clipboard"] },
  { id: "nav.deployments", title: "Open Deployments", aliases: ["vercel"], group: "Navigate", keywords: ["deploy"] },
  { id: "nav.debugger", title: "Ask AI", aliases: ["debug", "error"], group: "Navigate", keywords: ["ai", "debugger"] },
  { id: "nav.snippets", title: "Open Snippets", aliases: ["templates"], group: "Navigate", keywords: ["snippets"] },
  { id: "nav.settings", title: "Open settings", aliases: ["prefs"], group: "Navigate", keywords: ["settings"] },
];

export const ACTION_COMMANDS: CommandDefinition[] = [
  { id: "project.open", title: "Open Project", aliases: ["switch project"], group: "Projects", shortcut: "Mod+Shift+P", keywords: ["open"] },
  { id: "project.start", title: "Start Project", aliases: ["run dev"], group: "Projects", keywords: ["start", "dev"] },
  { id: "project.stop", title: "Stop Project", aliases: ["kill server"], group: "Projects", keywords: ["stop"] },
  { id: "project.localhost", title: "Open localhost:3000", aliases: ["open local"], group: "Projects", keywords: ["localhost", "3000"] },
  { id: "port.kill.3000", title: "Kill process on port 3000", aliases: ["free 3000"], group: "Ports", keywords: ["kill", "port"] },
  { id: "git.branch", title: "Create branch", aliases: ["new branch"], group: "Git", keywords: ["branch"] },
  { id: "git.commit", title: "Commit changes", aliases: ["commit"], group: "Git", keywords: ["commit"] },
  { id: "git.push", title: "Push branch", aliases: ["push"], group: "Git", keywords: ["push"] },
  { id: "docker.restart", title: "Restart container", aliases: ["reboot container"], group: "Docker", keywords: ["restart"] },
  { id: "ssh.copy", title: "Copy SSH command", aliases: ["ssh"], group: "Snippets", keywords: ["ssh"] },
  { id: "run.npm", title: "Run npm command", aliases: ["npm"], group: "Run", keywords: ["npm"] },
  { id: "run.pnpm", title: "Run pnpm command", aliases: ["pnpm"], group: "Run", keywords: ["pnpm"] },
  { id: "run.git", title: "Run git command", aliases: ["git cmd"], group: "Run", keywords: ["git"] },
];

export const ALL_COMMANDS: CommandDefinition[] = [...NAV_COMMANDS, ...ACTION_COMMANDS];

export const ROUTE_FROM_COMMAND: Record<string, RouteId> = {
  "nav.dashboard": "dashboard",
  "nav.projects": "projects",
  "nav.terminal": "terminal",
  "nav.git": "git",
  "nav.github": "github",
  "nav.ports": "ports",
  "nav.processes": "processes",
  "nav.docker": "docker",
  "nav.environment": "environment",
  "nav.clipboard": "clipboard",
  "nav.deployments": "deployments",
  "nav.debugger": "debugger",
  "nav.snippets": "snippets",
  "nav.settings": "settings",
};

export const NAV_ITEMS: Array<{ id: RouteId; label: string; command: string }> = [
  { id: "dashboard", label: "Dashboard", command: "nav.dashboard" },
  { id: "projects", label: "Projects", command: "nav.projects" },
  { id: "terminal", label: "Terminal", command: "nav.terminal" },
  { id: "git", label: "Git", command: "nav.git" },
  { id: "github", label: "GitHub", command: "nav.github" },
  { id: "ports", label: "Ports", command: "nav.ports" },
  { id: "processes", label: "Processes", command: "nav.processes" },
  { id: "docker", label: "Docker", command: "nav.docker" },
  { id: "environment", label: "Environment", command: "nav.environment" },
  { id: "clipboard", label: "Clipboard", command: "nav.clipboard" },
  { id: "deployments", label: "Deployments", command: "nav.deployments" },
  { id: "debugger", label: "AI Debugger", command: "nav.debugger" },
  { id: "snippets", label: "Snippets", command: "nav.snippets" },
  { id: "settings", label: "Settings", command: "nav.settings" },
];
