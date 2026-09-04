import {
  MOCK_ACTIVITY,
  MOCK_CLIPBOARD,
  MOCK_COMPOSE,
  MOCK_CONTAINERS,
  MOCK_DEPLOYMENTS,
  MOCK_DIFF,
  MOCK_ENV,
  MOCK_GIT,
  MOCK_IMAGES,
  MOCK_ISSUES,
  MOCK_METRICS,
  MOCK_NETWORKS,
  MOCK_PORTS,
  MOCK_PROCESSES,
  MOCK_PROJECTS,
  MOCK_SYSTEM_PROCESSES,
  MOCK_PRS,
  MOCK_REPOS,
  MOCK_SNIPPETS,
  MOCK_TERMINAL_OUTPUT,
  MOCK_TERMINALS,
  MOCK_TOOLS,
  MOCK_VOLUMES,
} from "@/data/mock";
import { DevDeckError, Errors } from "@/lib/errors";
import { isTauri } from "@/lib/platform";
import type {
  ActivityEvent,
  ClipboardItem,
  Deployment,
  DevProcess,
  DockerComposeProject,
  DockerContainer,
  EnvCompareResult,
  EnvVariable,
  GitDiff,
  GitRepoState,
  GithubIssue,
  GithubPullRequest,
  GithubRepo,
  HostTelemetry,
  InstalledTool,
  ListeningPort,
  ProcessStatus,
  Project,
  ProjectContext,
  Settings,
  Snippet,
  SystemMetrics,
  TerminalSession,
} from "@/types";
import { invokeNative } from "@/services/tauri";
import { categorizeClipboard, clipboardPreview } from "@/utils/clipboard";
import { compareEnvKeys } from "@/utils/env";
import { isSafeUserPath } from "@/utils/paths";
import { walkRate } from "@/utils/network";
import { appendSample } from "@/utils/processes";

interface WorkspaceState {
  projects: Project[];
  ports: ListeningPort[];
  processes: DevProcess[];
  git: Record<string, GitRepoState>;
  containers: DockerContainer[];
  compose: DockerComposeProject[];
  clipboard: ClipboardItem[];
  snippets: Snippet[];
  deployments: Deployment[];
  activity: ActivityEvent[];
  terminals: TerminalSession[];
  terminalOutput: Record<string, string>;
  githubConnected: boolean;
  telemetry: HostTelemetry;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function nowIso(): string {
  return new Date().toISOString();
}

function createState(): WorkspaceState {
  return {
    projects: clone(MOCK_PROJECTS),
    ports: clone(MOCK_PORTS),
    processes: clone(MOCK_PROCESSES),
    git: clone(MOCK_GIT),
    containers: clone(MOCK_CONTAINERS),
    compose: clone(MOCK_COMPOSE),
    clipboard: clone(MOCK_CLIPBOARD),
    snippets: clone(MOCK_SNIPPETS),
    deployments: clone(MOCK_DEPLOYMENTS),
    activity: clone(MOCK_ACTIVITY),
    terminals: clone(MOCK_TERMINALS),
    terminalOutput: clone(MOCK_TERMINAL_OUTPUT),
    githubConnected: false,
    telemetry: createTelemetry(),
  };
}

function createTelemetry(): HostTelemetry {
  return {
    live: false,
    error: null,
    metrics: clone(MOCK_METRICS),
    systemProcesses: clone(MOCK_SYSTEM_PROCESSES),
    processHistory: Object.fromEntries(
      MOCK_SYSTEM_PROCESSES.map((process) => [process.pid, [process.cpu]]),
    ),
  };
}

interface NativeProcessRow {
  pid: number;
  name: string;
  command: string;
  cpu: number;
  memoryMb?: number;
  memory_mb?: number;
  status?: string;
}

interface NativeMetrics {
  cpu: number;
  memoryUsedGb?: number;
  memory_used_gb?: number;
  memoryTotalGb?: number;
  memory_total_gb?: number;
  diskUsedGb?: number;
  disk_used_gb?: number;
  diskTotalGb?: number;
  disk_total_gb?: number;
  networkDownKbps?: number;
  network_down_kbps?: number;
  networkUpKbps?: number;
  network_up_kbps?: number;
  battery: number | null;
}

function readNumber(...values: Array<number | undefined>): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return 0;
}

function mapNativeProcess(row: NativeProcessRow): DevProcess {
  const status = row.status;
  const allowed: ProcessStatus[] = ["running", "sleeping", "idle", "stopped"];
  return {
    pid: row.pid,
    name: row.name,
    command: row.command || row.name,
    cpu: row.cpu,
    memoryMb: readNumber(row.memoryMb, row.memory_mb),
    port: null,
    projectId: null,
    projectName: null,
    status: status && allowed.includes(status as ProcessStatus) ? (status as ProcessStatus) : "running",
    path: null,
  };
}

function mapNativeMetrics(row: NativeMetrics): SystemMetrics {
  return {
    cpu: row.cpu,
    memoryUsedGb: readNumber(row.memoryUsedGb, row.memory_used_gb),
    memoryTotalGb: readNumber(row.memoryTotalGb, row.memory_total_gb) || 1,
    diskUsedGb: readNumber(row.diskUsedGb, row.disk_used_gb),
    diskTotalGb: readNumber(row.diskTotalGb, row.disk_total_gb) || 1,
    networkDownKbps: readNumber(row.networkDownKbps, row.network_down_kbps),
    networkUpKbps: readNumber(row.networkUpKbps, row.network_up_kbps),
    battery: row.battery,
  };
}

function jitterMockProcesses(processes: DevProcess[]): DevProcess[] {
  return processes.map((process) => ({
    ...process,
    cpu: Math.round(walkRate(process.cpu, 0.1, 42, Math.max(0.4, process.cpu * 0.18)) * 10) / 10,
  }));
}

class Workspace {
  private state = createState();
  private listeners = new Set<() => void>();
  private rev = 0;

  revision(): number {
    return this.rev;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.rev += 1;
    for (const listener of this.listeners) listener();
  }

  private track(kind: ActivityEvent["kind"], title: string, detail: string | null = null): void {
    this.state.activity = [
      { id: crypto.randomUUID(), kind, title, detail, at: nowIso() },
      ...this.state.activity,
    ].slice(0, 80);
  }

  reset(): void {
    this.state = createState();
    this.emit();
  }

  projects(): Project[] {
    return this.state.projects;
  }

  project(id: string): Project | undefined {
    return this.state.projects.find((project) => project.id === id);
  }

  addDirectory(path: string): void {
    if (!isSafeUserPath(path)) {
      throw new DevDeckError(Errors.pathInvalid(path));
    }
  }

  startProject(id: string): Project {
    const project = this.project(id);
    if (!project) {
      throw new DevDeckError(Errors.projectStart("The project is no longer in the workspace.", "Refresh the project list."));
    }
    const port = project.ports[0] ?? (project.framework === "node" ? 4000 : 3000);
    const conflict = this.state.ports.find((item) => item.port === port && item.projectId !== id);
    if (conflict && project.status !== "running") {
      throw new DevDeckError({
        code: "PORT_IN_USE",
        title: `Port ${port} is already in use.`,
        reason: `${conflict.process} (PID ${conflict.pid}) is listening on ${port}.`,
        fix: "Inspect or kill that process, then start the project again.",
      });
    }
    project.status = "running";
    project.ports = [port];
    project.lastOpenedAt = nowIso();
    if (!this.state.ports.some((item) => item.projectId === id)) {
      const pid = 8000 + Math.floor(Math.random() * 1000);
      this.state.ports.unshift({
        port,
        pid,
        process: "node",
        projectId: id,
        projectName: project.name,
        address: "127.0.0.1",
        protocol: "tcp",
      });
      this.state.processes.unshift({
        pid,
        name: "node",
        command: `${project.packageManager} run dev`,
        cpu: 8,
        memoryMb: 220,
        port,
        projectId: id,
        projectName: project.name,
        status: "running",
        path: project.path,
      });
    }
    this.track("project.start", `Started ${project.name}`, `:${port}`);
    this.emit();
    return project;
  }

  stopProject(id: string): Project {
    const project = this.project(id);
    if (!project) {
      throw new DevDeckError(Errors.projectStart("The project is no longer in the workspace.", "Refresh the project list."));
    }
    project.status = "stopped";
    const ports = new Set(project.ports);
    this.state.ports = this.state.ports.filter((item) => item.projectId !== id);
    this.state.processes = this.state.processes.filter((item) => item.projectId !== id);
    project.ports = [];
    this.track("project.stop", `Stopped ${project.name}`, ports.size ? `:${[...ports].join(", :")}` : null);
    this.emit();
    return project;
  }

  ports(): ListeningPort[] {
    return this.state.ports;
  }

  processes(): DevProcess[] {
    return this.state.processes;
  }

  systemProcesses(): DevProcess[] {
    return this.state.telemetry.systemProcesses;
  }

  telemetry(): HostTelemetry {
    return this.state.telemetry;
  }

  async refreshTelemetry(settings: Settings): Promise<void> {
    if (usesLiveNative(settings)) {
      try {
        const [metricsRow, processRows] = await Promise.all([
          invokeNative<NativeMetrics>("system_metrics"),
          invokeNative<NativeProcessRow[]>("list_system_processes", { limit: 12 }),
        ]);
        if (!metricsRow || !processRows) {
          throw new Error("The host did not return system telemetry.");
        }
        const systemProcesses = processRows.map(mapNativeProcess);
        this.state.telemetry = {
          live: true,
          error: null,
          metrics: mapNativeMetrics(metricsRow),
          systemProcesses,
          processHistory: mergeProcessHistory(this.state.telemetry.processHistory, systemProcesses),
        };
        this.emit();
      } catch (error) {
        this.state.telemetry = {
          ...this.state.telemetry,
          live: false,
          error: error instanceof Error ? error.message : "Unable to read host telemetry.",
        };
        this.emit();
      }
      return;
    }

    const systemProcesses = jitterMockProcesses(this.state.telemetry.systemProcesses);
    const metrics = this.state.telemetry.metrics;
    this.state.telemetry = {
      live: false,
      error: null,
      metrics: {
        ...metrics,
        cpu: walkRate(metrics.cpu, 8, 72, 4),
        networkDownKbps: walkRate(metrics.networkDownKbps, 40, 2400, 180),
        networkUpKbps: walkRate(metrics.networkUpKbps, 8, 420, 36),
      },
      systemProcesses,
      processHistory: mergeProcessHistory(this.state.telemetry.processHistory, systemProcesses),
    };
    this.emit();
  }

  killProcess(pid: number, confirmed: boolean): void {
    if (!confirmed) throw new DevDeckError(Errors.confirmRequired("Terminate process"));
    const process = this.state.processes.find((item) => item.pid === pid);
    this.state.processes = this.state.processes.filter((item) => item.pid !== pid);
    this.state.ports = this.state.ports.filter((item) => item.pid !== pid);
    if (process?.projectId) {
      const project = this.project(process.projectId);
      if (project) {
        project.status = "stopped";
        project.ports = [];
      }
    }
    this.emit();
  }

  git(projectId: string): GitRepoState | null {
    return this.state.git[projectId] ?? null;
  }

  diff(projectId: string, path: string): GitDiff {
    const repo = this.state.git[projectId];
    if (!repo) return { path, hunks: [] };
    if (MOCK_DIFF.path === path) return clone(MOCK_DIFF);
    return {
      path,
      hunks: [
        {
          header: `@@ ${path} @@`,
          lines: [{ type: "context", content: `// ${path}` }],
        },
      ],
    };
  }

  commit(projectId: string, message: string): void {
    const repo = this.state.git[projectId];
    const project = this.project(projectId);
    if (!repo || !project) return;
    repo.commits.unshift({
      hash: crypto.randomUUID().replaceAll("-", "").slice(0, 12),
      shortHash: crypto.randomUUID().slice(0, 7),
      message,
      author: "you",
      date: nowIso(),
    });
    repo.staged = [];
    repo.ahead += 1;
    project.gitDirty = repo.unstaged.length + repo.untracked.length > 0;
    this.track("git.commit", `Committed in ${project.name}`, message);
    this.emit();
  }

  checkout(projectId: string, branch: string): void {
    const repo = this.state.git[projectId];
    const project = this.project(projectId);
    if (!repo || !project) return;
    repo.branch = branch;
    project.gitBranch = branch;
    this.track("git.branch", `Checked out ${branch}`, project.name);
    this.emit();
  }

  discard(projectId: string, path: string, confirmed: boolean): void {
    if (!confirmed) throw new DevDeckError(Errors.confirmRequired("Discard changes"));
    const repo = this.state.git[projectId];
    if (!repo) return;
    repo.unstaged = repo.unstaged.filter((file) => file.path !== path);
    repo.untracked = repo.untracked.filter((file) => file.path !== path);
    this.emit();
  }

  containers(): DockerContainer[] {
    return this.state.containers;
  }

  compose(): DockerComposeProject[] {
    return this.state.compose;
  }

  setContainer(id: string, status: DockerContainer["status"]): void {
    const container = this.state.containers.find((item) => item.id === id);
    if (!container) return;
    container.status = status;
    this.track(
      status === "running" ? "docker.start" : "docker.stop",
      `${status === "running" ? "Started" : "Stopped"} ${container.name}`,
      container.image,
    );
    this.emit();
  }

  removeContainer(id: string, confirmed: boolean): void {
    if (!confirmed) throw new DevDeckError(Errors.confirmRequired("Remove container"));
    this.state.containers = this.state.containers.filter((item) => item.id !== id);
    this.emit();
  }

  env(_projectId: string): EnvVariable[] {
    return clone(MOCK_ENV);
  }

  compareEnv(): EnvCompareResult {
    const example = { DATABASE_URL: "", NEXTAUTH_SECRET: "", NEXT_PUBLIC_APP_URL: "", SENTRY_DSN: "" };
    const actual = {
      DATABASE_URL: "set",
      NEXTAUTH_SECRET: "set",
      STRIPE_SECRET: "set",
      TELEGRAM_TOKEN: "set",
      NEXT_PUBLIC_APP_URL: "set",
    };
    return compareEnvKeys(example, actual);
  }

  clipboard(): ClipboardItem[] {
    return this.state.clipboard;
  }

  addClipboard(content: string): ClipboardItem | null {
    const trimmed = content.trim();
    if (!trimmed) return null;
    const item: ClipboardItem = {
      id: crypto.randomUUID(),
      kind: categorizeClipboard(trimmed),
      content: trimmed,
      preview: clipboardPreview(trimmed),
      favorite: false,
      pinned: false,
      createdAt: nowIso(),
    };
    this.state.clipboard = [item, ...this.state.clipboard.filter((row) => row.content !== trimmed)].slice(0, 200);
    this.emit();
    return item;
  }

  updateClipboard(id: string, patch: Partial<ClipboardItem>): void {
    this.state.clipboard = this.state.clipboard.map((item) => (item.id === id ? { ...item, ...patch } : item));
    this.emit();
  }

  deleteClipboard(id: string): void {
    this.state.clipboard = this.state.clipboard.filter((item) => item.id !== id);
    this.emit();
  }

  snippets(): Snippet[] {
    return this.state.snippets;
  }

  upsertSnippet(snippet: Snippet): void {
    const index = this.state.snippets.findIndex((item) => item.id === snippet.id);
    if (index === -1) this.state.snippets.unshift(snippet);
    else this.state.snippets[index] = snippet;
    this.emit();
  }

  deleteSnippet(id: string): void {
    this.state.snippets = this.state.snippets.filter((item) => item.id !== id);
    this.emit();
  }

  deployments(): Deployment[] {
    return this.state.deployments;
  }

  activity(): ActivityEvent[] {
    return this.state.activity;
  }

  terminals(): TerminalSession[] {
    return this.state.terminals;
  }

  terminalOutput(id: string): string {
    return this.state.terminalOutput[id] ?? "";
  }

  createTerminal(projectId: string | null, title: string, kind: TerminalSession["kind"]): TerminalSession {
    const project = projectId ? this.project(projectId) : undefined;
    const session: TerminalSession = {
      id: crypto.randomUUID(),
      title,
      projectId,
      cwd: project?.path ?? "~",
      kind,
      createdAt: nowIso(),
    };
    this.state.terminals.unshift(session);
    this.state.terminalOutput[session.id] = `DevDeck · ${session.cwd}\n`;
    this.emit();
    return session;
  }

  appendTerminal(id: string, line: string): void {
    this.state.terminalOutput[id] = `${this.state.terminalOutput[id] ?? ""}${line}\n`;
    this.emit();
  }

  closeTerminal(id: string): void {
    this.state.terminals = this.state.terminals.filter((item) => item.id !== id);
    delete this.state.terminalOutput[id];
    this.emit();
  }

  renameTerminal(id: string, title: string): void {
    const session = this.state.terminals.find((item) => item.id === id);
    if (session) session.title = title;
    this.emit();
  }

  metrics(): SystemMetrics {
    return this.state.telemetry.metrics;
  }

  tools(): InstalledTool[] {
    return clone(MOCK_TOOLS);
  }

  images() {
    return clone(MOCK_IMAGES);
  }

  networks() {
    return clone(MOCK_NETWORKS);
  }

  volumes() {
    return clone(MOCK_VOLUMES);
  }

  githubRepos(): GithubRepo[] {
    return clone(MOCK_REPOS);
  }

  githubPulls(): GithubPullRequest[] {
    return clone(MOCK_PRS);
  }

  githubIssues(): GithubIssue[] {
    return clone(MOCK_ISSUES);
  }

  context(projectId: string): ProjectContext | null {
    const project = this.project(projectId);
    if (!project) return null;
    return {
      project,
      git: this.git(projectId),
      processes: this.state.processes.filter((item) => item.projectId === projectId),
      ports: this.state.ports.filter((item) => item.projectId === projectId),
      containers: this.state.containers.filter((item) => item.composeProject === project.name),
      recentCommands: project.scripts.map((script) => script.command),
      recentErrors: ["Error: EADDRINUSE: address already in use :::3000"],
      deployments: this.state.deployments.filter((item) => item.projectId === projectId),
    };
  }

  setGithubConnected(value: boolean): void {
    this.state.githubConnected = value;
    this.emit();
  }
}

export const workspace = new Workspace();

function mergeProcessHistory(
  current: Record<number, number[]>,
  processes: DevProcess[],
): Record<number, number[]> {
  const next: Record<number, number[]> = {};
  for (const process of processes) {
    next[process.pid] = appendSample(current[process.pid] ?? [], process.cpu);
  }
  return next;
}

export function usesLiveNative(settings: Settings): boolean {
  return isTauri() && !settings.useMockData;
}
