import { greeting, formatRelative } from "@/lib/format";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { StatusIndicator } from "@/components/ui/status";
import { Panel } from "@/components/layout/page";
import { todayKey } from "@/lib/format";

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-[0.14em] text-faint">{label}</div>
      <div className="mt-1 font-mono text-[22px] tracking-tight">{value}</div>
      {hint ? <div className="mt-0.5 text-[12px] text-muted">{hint}</div> : null}
    </div>
  );
}

export function DashboardPage() {
  const workspace = useWorkspace();
  const select = useAppStore((state) => state.selectProject);
  const setRoute = useAppStore((state) => state.setRoute);
  const projects = workspace.projects();
  const running = projects.filter((project) => project.status === "running");
  const gitBehind = projects.filter((project) => project.gitBehind > 0).length;
  const metrics = workspace.metrics();
  const recent = [...projects].sort((a, b) => {
    return (b.lastOpenedAt ?? "").localeCompare(a.lastOpenedAt ?? "");
  });
  const activity = workspace.activity();
  const today = new Date().toDateString();
  const todays = activity.filter((item) => todayKey(item.at) === today);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-[13px] text-muted">{greeting()}</p>
        <h1 className="mt-1 text-[26px] font-medium tracking-tight">Your development environment</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8 border-b border-border pb-6 md:grid-cols-4">
        <Metric label="Projects" value={String(projects.length)} hint="Detected locally" />
        <Metric label="Servers" value={String(running.length)} hint="Listening now" />
        <Metric label="Git" value={`${gitBehind} ↓`} hint={gitBehind ? "Behind origin" : "Up to date"} />
        <Metric
          label="CPU"
          value={`${Math.round(metrics.cpu)}%`}
          hint={`${metrics.memoryUsedGb.toFixed(1)} / ${metrics.memoryTotalGb} GB RAM`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Recent projects">
          <ul className="divide-y divide-border">
            {recent.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => {
                    select(project.id);
                    setRoute("projects");
                  }}
                  className="flex w-full items-center justify-between py-2.5 text-left hover:text-primary"
                >
                  <div>
                    <div className="text-[13px]">{project.name}</div>
                    <div className="font-mono text-[11px] text-faint">
                      {project.framework} · {project.gitBranch ?? "no git"}
                    </div>
                  </div>
                  <StatusIndicator
                    tone={project.status === "running" ? "running" : "stopped"}
                    label={
                      project.status === "running"
                        ? `Running${project.ports[0] ? ` :${project.ports[0]}` : ""}`
                        : "Stopped"
                    }
                    pulse={project.status === "running"}
                  />
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="System">
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <div className="text-faint">CPU</div>
                <div className="mt-1 font-mono">{Math.round(metrics.cpu)}%</div>
              </div>
              <div>
                <div className="text-faint">Memory</div>
                <div className="mt-1 font-mono">
                  {Math.round((metrics.memoryUsedGb / metrics.memoryTotalGb) * 100)}%
                </div>
              </div>
              <div>
                <div className="text-faint">Disk</div>
                <div className="mt-1 font-mono">
                  {Math.round((metrics.diskUsedGb / metrics.diskTotalGb) * 100)}%
                </div>
              </div>
              <div>
                <div className="text-faint">Battery</div>
                <div className="mt-1 font-mono">{metrics.battery ?? "—"}%</div>
              </div>
            </div>
          </Panel>
          <Panel title="Today">
            {todays.length === 0 ? (
              <p className="text-[13px] text-muted">No local activity yet today.</p>
            ) : (
              <ul className="space-y-2">
                {todays.slice(0, 6).map((item) => (
                  <li key={item.id} className="flex gap-3 text-[12px]">
                    <span className="w-10 shrink-0 font-mono text-faint">
                      {new Date(item.at).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <p className="mt-6 text-[12px] text-faint">
        Last opened {recent[0]?.lastOpenedAt ? formatRelative(recent[0].lastOpenedAt) : "never"}
      </p>
    </div>
  );
}
