import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { useSettingsStore } from "@/stores/settings-store";
import { toAppError } from "@/lib/errors";
import { formatRelative } from "@/lib/format";
import { matchesQuery } from "@/utils/search";
import type { AppError, Project } from "@/types";

export function ProjectsPage() {
  const workspace = useWorkspace();
  const selectedId = useAppStore((state) => state.selectedProjectId);
  const select = useAppStore((state) => state.selectProject);
  const setRoute = useAppStore((state) => state.setRoute);
  const directories = useSettingsStore((state) => state.settings.projectDirectories);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<AppError | null>(null);
  const projects = workspace
    .projects()
    .filter((project) =>
      matchesQuery(`${project.name} ${project.path} ${project.framework}`, query),
    );
  const selected = selectedId ? workspace.project(selectedId) : projects[0];

  const start = (project: Project) => {
    try {
      workspace.startProject(project.id);
      toast.success(`Started ${project.name}`);
      setError(null);
    } catch (caught) {
      const appError = toAppError(caught, {
        code: "START",
        title: "Unable to start the project.",
        reason: "The development server did not start.",
        fix: "Check the package manager and the configured start script.",
      });
      setError(appError);
      toast.error(appError.title);
    }
  };

  if (projects.length === 0 && !query) {
    return (
      <EmptyState
        title="No projects found"
        description={`DevDeck did not detect projects in ${directories.join(", ") || "your configured directories"}. Add a folder in Settings.`}
        action={
          <Button variant="secondary" onClick={() => setRoute("settings")}>
            Add project directory
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Projects"
        description="Detected from your configured directories. Commands stay local."
        search={{ value: query, onChange: setQuery, placeholder: "Filter projects" }}
      />
      {error ? (
        <div className="mb-4">
          <ErrorState error={error} />
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Panel>
          {projects.length === 0 ? (
            <p className="text-[13px] text-muted">No projects match “{query}”.</p>
          ) : (
            <ul className="space-y-1">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => select(project.id)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left ${
                      selected?.id === project.id ? "bg-overlay" : "hover:bg-overlay/60"
                    }`}
                  >
                    <span>{project.name}</span>
                    <StatusIndicator
                      tone={project.status === "running" ? "running" : "stopped"}
                      pulse={project.status === "running"}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        {selected ? (
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-medium">{selected.name}</h2>
                <p className="mt-1 font-mono text-[12px] text-faint">{selected.path}</p>
              </div>
              <Badge>{selected.framework}</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px] md:grid-cols-4">
              <div>
                <dt className="text-faint">Branch</dt>
                <dd className="font-mono">{selected.gitBranch ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-faint">Git</dt>
                <dd>
                  {selected.gitAhead}↑ {selected.gitBehind}↓ {selected.gitDirty ? "dirty" : "clean"}
                </dd>
              </div>
              <div>
                <dt className="text-faint">Runtime</dt>
                <dd>
                  {selected.runtime} · {selected.packageManager}
                </dd>
              </div>
              <div>
                <dt className="text-faint">Last opened</dt>
                <dd>{selected.lastOpenedAt ? formatRelative(selected.lastOpenedAt) : "Never"}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.status === "running" ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    workspace.stopProject(selected.id);
                    toast.success(`Stopped ${selected.name}`);
                  }}
                >
                  Stop
                </Button>
              ) : (
                <Button size="sm" onClick={() => start(selected)}>
                  Start development server
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (selected.ports[0]) window.open(`http://localhost:${selected.ports[0]}`, "_blank");
                  else toast.message("No localhost port is listening for this project.");
                }}
              >
                Open localhost
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRoute("terminal")}>
                Open terminal
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRoute("git")}>
                Git
              </Button>
              {selected.gitRemote ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(selected.gitRemote ?? "", "_blank")}
                >
                  Open GitHub
                </Button>
              ) : null}
            </div>
            <div className="mt-5">
              <h3 className="mb-2 text-[12px] uppercase tracking-[0.14em] text-faint">Scripts</h3>
              <ul className="divide-y divide-border">
                {[...selected.scripts, ...selected.customCommands].map((script) => (
                  <li key={script.script} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-[13px]">{script.name}</div>
                      <div className="font-mono text-[11px] text-faint">{script.command}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        workspace.createTerminal(selected.id, script.name, "dev");
                        setRoute("terminal");
                        toast.success(`Queued ${script.command}`);
                      }}
                    >
                      Run
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
