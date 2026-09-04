import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { matchesQuery } from "@/utils/search";

export function PortsPage() {
  const workspace = useWorkspace();
  const ask = useAppStore((state) => state.askConfirm);
  const setRoute = useAppStore((state) => state.setRoute);
  const select = useAppStore((state) => state.selectProject);
  const [query, setQuery] = useState("");
  const ports = workspace
    .ports()
    .filter((port) => matchesQuery(`${port.port} ${port.process} ${port.projectName ?? ""}`, query));

  if (workspace.ports().length === 0) {
    return (
      <EmptyState
        title="No ports currently in use"
        description="When a development server starts listening, it will appear here."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Ports"
        description="Listening TCP ports mapped to developer processes."
        search={{ value: query, onChange: setQuery, placeholder: "Filter ports" }}
      />
      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-faint">
            <tr>
              <th className="px-3 py-2 font-medium">Port</th>
              <th className="px-3 py-2 font-medium">Process</th>
              <th className="px-3 py-2 font-medium">Project</th>
              <th className="px-3 py-2 font-medium">PID</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {ports.map((port) => (
              <tr key={`${port.port}-${port.pid}`} className="border-b border-border/70">
                <td className="px-3 py-2 font-mono">{port.port}</td>
                <td className="px-3 py-2">{port.process}</td>
                <td className="px-3 py-2">{port.projectName ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-muted">{port.pid}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`http://localhost:${port.port}`, "_blank")}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        void navigator.clipboard.writeText(`http://localhost:${port.port}`);
                        toast.success("localhost URL copied");
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (port.projectId) select(port.projectId);
                        setRoute("processes");
                      }}
                    >
                      Inspect
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        ask({
                          title: `Kill process on port ${port.port}?`,
                          description: `${port.process} (PID ${port.pid}) will be terminated. This cannot be undone.`,
                          confirmLabel: "Kill process",
                          destructive: true,
                          onConfirm: () => {
                            workspace.killProcess(port.pid, true);
                            toast.success(`Stopped PID ${port.pid}`);
                          },
                        })
                      }
                    >
                      Kill
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
