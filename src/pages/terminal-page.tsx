import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/states/empty-state";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { Copy, RotateCcw, Trash2, X } from "lucide-react";

export function TerminalPage() {
  const workspace = useWorkspace();
  const selectedProject = useAppStore((state) => state.selectedProjectId);
  const sessions = workspace.terminals();
  const [activeId, setActiveId] = useState(sessions[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const outputRef = useRef<HTMLPreElement>(null);
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof sessions>();
    for (const session of sessions) {
      const key = session.projectId ?? "workspace";
      const list = groups.get(key) ?? [];
      list.push(session);
      groups.set(key, list);
    }
    return groups;
  }, [sessions]);

  const active = sessions.find((session) => session.id === activeId) ?? sessions[0];
  const output = active ? workspace.terminalOutput(active.id) : "";
  const filtered = query
    ? output
        .split("\n")
        .filter((line) => line.toLowerCase().includes(query.toLowerCase()))
        .join("\n")
    : output;

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [filtered, activeId]);

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No terminal sessions"
        description="Create a shell for a project or a free-standing workspace session."
        action={
          <Button
            onClick={() => {
              const created = workspace.createTerminal(selectedProject, "shell", "shell");
              setActiveId(created.id);
            }}
          >
            New terminal
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Terminal"
        description="Project-scoped sessions. Output stays on this machine."
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const created = workspace.createTerminal(selectedProject, "shell", "shell");
              setActiveId(created.id);
            }}
          >
            New terminal
          </Button>
        }
      />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="overflow-auto rounded-lg border border-border p-2">
          {[...grouped.entries()].map(([key, list]) => (
            <div key={key} className="mb-3">
              <div className="px-2 pb-1 text-[11px] uppercase tracking-[0.14em] text-faint">
                {key === "workspace" ? "Workspace" : workspace.project(key)?.name ?? key}
              </div>
              {list.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setActiveId(session.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] ${
                    active?.id === session.id ? "bg-overlay" : "hover:bg-overlay/60"
                  }`}
                >
                  <span>{session.title}</span>
                  <span className="font-mono text-[10px] text-faint">{session.kind}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>
        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-[#0a0b0c]">
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
            <div className="font-mono text-[11px] text-faint">{active?.cwd}</div>
            <div className="flex items-center gap-1">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search output"
                className="h-7 w-40 bg-transparent"
              />
              <IconButton
                label="Copy output"
                onClick={() => {
                  void navigator.clipboard.writeText(output);
                  toast.success("Output copied");
                }}
              >
                <Copy className="size-3.5" />
              </IconButton>
              <IconButton
                label="Clear"
                onClick={() => {
                  if (active) workspace.appendTerminal(active.id, "— cleared —");
                }}
              >
                <Trash2 className="size-3.5" />
              </IconButton>
              <IconButton
                label="Restart"
                onClick={() => toast.message("Session restarted locally.")}
              >
                <RotateCcw className="size-3.5" />
              </IconButton>
              <IconButton
                label="Close"
                onClick={() => {
                  if (active) {
                    workspace.closeTerminal(active.id);
                    setActiveId(null);
                  }
                }}
              >
                <X className="size-3.5" />
              </IconButton>
            </div>
          </div>
          <pre
            ref={outputRef}
            className="min-h-0 flex-1 overflow-auto p-3 font-mono text-[12px] leading-relaxed text-[#d7d2c8]"
          >
            {filtered || " "}
          </pre>
          <form
            className="flex border-t border-border"
            onSubmit={(event) => {
              event.preventDefault();
              if (!active || !draft.trim()) return;
              workspace.appendTerminal(active.id, `$ ${draft}`);
              workspace.appendTerminal(active.id, "Command recorded locally. Live PTY runs inside the desktop build.");
              setDraft("");
            }}
          >
            <span className="px-3 py-2 font-mono text-[12px] text-primary">❯</span>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="flex-1 bg-transparent py-2 font-mono text-[12px] outline-none"
              placeholder="Run a command…"
              aria-label="Terminal input"
            />
          </form>
        </section>
      </div>
    </div>
  );
}
