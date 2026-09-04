export type RouteId =
  | "dashboard"
  | "projects"
  | "terminal"
  | "git"
  | "github"
  | "ports"
  | "processes"
  | "docker"
  | "environment"
  | "clipboard"
  | "deployments"
  | "debugger"
  | "snippets"
  | "settings";

export type ThemeMode = "dark" | "light" | "system";
export type AccentId = "amber" | "teal" | "slate";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "unknown";
export type RuntimeId =
  | "node"
  | "python"
  | "rust"
  | "go"
  | "php"
  | "docker"
  | "unknown";
export type FrameworkId =
  | "nextjs"
  | "react"
  | "node"
  | "python"
  | "django"
  | "laravel"
  | "rust"
  | "go"
  | "docker"
  | "git"
  | "unknown";

export type ProjectStatus = "running" | "stopped" | "starting" | "error";
export type ProcessStatus = "running" | "sleeping" | "idle" | "stopped";
export type ContainerStatus =
  | "running"
  | "exited"
  | "paused"
  | "created"
  | "restarting";
export type ClipboardKind = "command" | "code" | "url" | "json" | "error" | "text";
export type DeploymentState = "success" | "failed" | "building" | "queued" | "cancelled";
export type GitFileStatus = "modified" | "added" | "deleted" | "untracked" | "renamed" | "conflicted";
export type ActivityKind =
  | "project.start"
  | "project.stop"
  | "git.branch"
  | "git.commit"
  | "git.push"
  | "github.pr"
  | "docker.start"
  | "docker.stop"
  | "port.conflict"
  | "build.success"
  | "build.fail"
  | "deploy.success"
  | "deploy.fail";

export interface ProjectScript {
  name: string;
  command: string;
  script: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  framework: FrameworkId;
  runtime: RuntimeId;
  packageManager: PackageManager;
  gitRemote: string | null;
  gitBranch: string | null;
  gitAhead: number;
  gitBehind: number;
  gitDirty: boolean;
  status: ProjectStatus;
  ports: number[];
  lastOpenedAt: string | null;
  scripts: ProjectScript[];
  customCommands: ProjectScript[];
  favorite: boolean;
}

export interface GitFile {
  path: string;
  status: GitFileStatus;
  staged: boolean;
  additions: number;
  deletions: number;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitRepoState {
  projectId: string;
  branch: string;
  upstream: string | null;
  ahead: number;
  behind: number;
  staged: GitFile[];
  unstaged: GitFile[];
  untracked: GitFile[];
  commits: GitCommit[];
  stashCount: number;
}

export interface DiffHunk {
  header: string;
  lines: Array<{ type: "context" | "add" | "del"; content: string }>;
}

export interface GitDiff {
  path: string;
  hunks: DiffHunk[];
}

export interface ListeningPort {
  port: number;
  pid: number;
  process: string;
  projectId: string | null;
  projectName: string | null;
  address: string;
  protocol: "tcp" | "udp";
}

export interface DevProcess {
  pid: number;
  name: string;
  command: string;
  cpu: number;
  memoryMb: number;
  port: number | null;
  projectId: string | null;
  projectName: string | null;
  status: ProcessStatus;
  path: string | null;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  cpu: number;
  memoryMb: number;
  ports: string[];
  composeProject: string | null;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  sizeMb: number;
  createdAt: string;
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
}

export interface DockerVolume {
  name: string;
  driver: string;
  mountpoint: string;
}

export interface DockerComposeProject {
  name: string;
  path: string;
  status: "up" | "down" | "partial";
  services: string[];
}

export interface EnvVariable {
  key: string;
  present: boolean;
  secret: boolean;
  files: string[];
  revealed?: string;
}

export interface EnvFileSummary {
  name: string;
  path: string;
  count: number;
}

export interface EnvCompareResult {
  missing: string[];
  unused: string[];
  shared: string[];
}

export interface ClipboardItem {
  id: string;
  kind: ClipboardKind;
  content: string;
  preview: string;
  favorite: boolean;
  pinned: boolean;
  createdAt: string;
}

export interface Snippet {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  favorite: boolean;
  shortcut: string | null;
}

export interface Deployment {
  id: string;
  providerId: string;
  projectId: string | null;
  projectName: string;
  environment: "production" | "preview" | "previous";
  state: DeploymentState;
  title: string;
  url: string | null;
  logUrl: string | null;
  createdAt: string;
}

export interface GithubPullRequest {
  number: number;
  title: string;
  state: "open" | "merged" | "closed";
  author: string;
  ci: "passing" | "failing" | "pending" | "none";
  reviewCount: number;
  deploy: "success" | "failed" | "none";
  url: string;
  branch: string;
  projectId: string | null;
}

export interface GithubIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  author: string;
  labels: string[];
  url: string;
}

export interface GithubRepo {
  name: string;
  fullName: string;
  private: boolean;
  url: string;
  description: string;
  language: string | null;
}

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string | null;
  at: string;
}

export interface SystemMetrics {
  cpu: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  networkDownKbps: number;
  networkUpKbps: number;
  battery: number | null;
}

export interface InstalledTool {
  id: string;
  name: string;
  installed: boolean;
  version: string | null;
  path: string | null;
}

export interface TerminalSession {
  id: string;
  title: string;
  projectId: string | null;
  cwd: string;
  kind: "shell" | "dev" | "git";
  createdAt: string;
}

export interface NotificationPrefs {
  builds: boolean;
  deployments: boolean;
  ports: boolean;
  git: boolean;
  docker: boolean;
}

export interface ShortcutMap {
  commandPalette: string;
  projectSwitcher: string;
  clipboard: string;
  dashboard: string;
}

export interface Settings {
  theme: ThemeMode;
  accent: AccentId;
  compact: boolean;
  launchAtLogin: boolean;
  minimizeToTray: boolean;
  defaultTerminal: "powershell" | "cmd" | "wt" | "system";
  defaultEditor: "code" | "cursor" | "system";
  projectDirectories: string[];
  hiddenSidebarItems: RouteId[];
  githubConnected: boolean;
  dockerEnabled: boolean;
  aiProvider: "none" | "openai" | "anthropic" | "custom";
  aiEndpoint: string;
  telemetry: boolean;
  clipboardHistory: boolean;
  clipboardRetentionDays: number;
  activityHistory: boolean;
  notifications: NotificationPrefs;
  shortcuts: ShortcutMap;
  onboardingComplete: boolean;
  useMockData: boolean;
}

export interface AppError {
  code: string;
  title: string;
  reason: string;
  fix: string;
  docsUrl?: string;
}

export interface ProjectContext {
  project: Project;
  git: GitRepoState | null;
  processes: DevProcess[];
  ports: ListeningPort[];
  containers: DockerContainer[];
  recentCommands: string[];
  recentErrors: string[];
  deployments: Deployment[];
}

export interface AiContextFile {
  path: string;
  included: boolean;
  reason: string;
  sensitive: boolean;
}

export interface AiAnalysis {
  summary: string;
  likelyCause: string;
  recommendedAction: string;
  process?: { name: string; pid: number; port?: number };
  actions: Array<{ id: string; label: string; destructive?: boolean }>;
}

export interface CommandDefinition {
  id: string;
  title: string;
  subtitle?: string;
  aliases: string[];
  group: string;
  shortcut?: string;
  keywords: string[];
}

export type IntegrationKind =
  | "github"
  | "vercel"
  | "railway"
  | "render"
  | "cloudflare"
  | "docker"
  | "actions";

export interface IntegrationProvider {
  id: IntegrationKind;
  name: string;
  connected: boolean;
  description: string;
}
