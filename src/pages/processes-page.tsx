import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { StatusIndicator } from "@/components/ui/status";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import { matchesQuery } from "@/utils/search";

export function ProcessesPage() {
  const workspace = useWorkspace();
  const ask = useAppStore((state) => state.askConfirm);
  const [query, setQuery] = useState("");
  const processes = workspace
    .processes()
    .filter((process) =>
      matchesQuery(`${process.name} ${process.command} ${process.projectName ?? ""} ${process.pid}`, query),
    );

  if (workspace.processes().length === 0) {
    return (
      <EmptyState
        title="No developer processes"
        description="DevDeck only lists processes that look related to local development."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Processes"
        description="Safe inspect by default. Termination always asks first."
        search={{ value: query, onChange: setQuery, placeholder: "Filter processes" }}
      />
      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-faint">
            <tr>
              <th className="px-3 py-2 font-medium">Process</th>
              <th className="px-3 py-2 font-medium">PID</th>
              <th className="px-3 py-2 font-medium">CPU</th>
              <th className="px-3 py-2 font-medium">Memory</th>
              <th className="px-3 py-2 font-medium">Port</th>
              <th className="px-3 py-2 font-medium">Project</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr key={process.pid} className="border-b border-border/70">
                <td className="px-3 py-2">
                  <div>{process.name}</div>
                  <div className="font-mono text-[11px] text-faint">{process.command}</div>
                </td>
                <td className="px-3 py-2 font-mono">{process.pid}</td>
                <td className="px-3 py-2 font-mono">{process.cpu.toFixed(1)}%</td>
                <td className="px-3 py-2 font-mono">{process.memoryMb} MB</td>
                <td className="px-3 py-2 font-mono">{process.port ?? "—"}</td>
                <td className="px-3 py-2">{process.projectName ?? "—"}</td>
                <td className="px-3 py-2">
                  <StatusIndicator
                    tone={process.status === "running" ? "running" : "stopped"}
                    label={process.status}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toast.message(process.path ?? "Location is not available for this process.")
                      }
                    >
                      Open location
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        ask({
                          title: "Terminate this process?",
                          description: `${process.name} (PID ${process.pid}) will receive a terminate signal. Prefer stopping the project from the Projects view when you can.`,
                          confirmLabel: "Terminate",
                          destructive: true,
                          onConfirm: () => {
                            workspace.killProcess(process.pid, true);
                            toast.success(`Terminated ${process.pid}`);
                          },
                        })
                      }
                    >
                      Terminate
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
