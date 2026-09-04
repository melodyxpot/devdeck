import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { StatusIndicator } from "@/components/ui/status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/stores/settings-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";

export function DockerPage() {
  const enabled = useSettingsStore((state) => state.settings.dockerEnabled);
  const workspace = useWorkspace();
  const ask = useAppStore((state) => state.askConfirm);
  const containers = workspace.containers();

  if (!enabled) {
    return (
      <EmptyState
        title="No Docker installation detected"
        description="Install Docker Desktop and enable the integration in Settings. Local projects still work without it."
      />
    );
  }

  return (
    <div>
      <PageHeader title="Docker" description="Engine status is checked locally. Destructive actions ask first." />
      <Tabs defaultValue="containers">
        <TabsList>
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="networks">Networks</TabsTrigger>
          <TabsTrigger value="volumes">Volumes</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
        </TabsList>
        <TabsContent value="containers" className="mt-4">
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-faint">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">CPU</th>
                  <th className="px-3 py-2 font-medium">Memory</th>
                  <th className="px-3 py-2 font-medium">Ports</th>
                  <th className="px-3 py-2 font-medium">Image</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {containers.map((container) => (
                  <tr key={container.id} className="border-b border-border/70">
                    <td className="px-3 py-2">{container.name}</td>
                    <td className="px-3 py-2">
                      <StatusIndicator
                        tone={container.status === "running" ? "running" : "stopped"}
                        label={container.status}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono">{container.cpu.toFixed(1)}%</td>
                    <td className="px-3 py-2 font-mono">{container.memoryMb} MB</td>
                    <td className="px-3 py-2 font-mono">{container.ports.join(", ") || "—"}</td>
                    <td className="px-3 py-2">{container.image}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        {container.status === "running" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => workspace.setContainer(container.id, "exited")}
                          >
                            Stop
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => workspace.setContainer(container.id, "running")}
                          >
                            Start
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => workspace.setContainer(container.id, "running")}
                        >
                          Restart
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            ask({
                              title: `Remove ${container.name}?`,
                              description: "The container will be deleted. Volumes are left untouched.",
                              confirmLabel: "Remove",
                              destructive: true,
                              onConfirm: () => workspace.removeContainer(container.id, true),
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="images" className="mt-4">
          <Panel>
            {workspace.images().map((image) => (
              <div key={image.id} className="flex justify-between py-1.5 text-[13px]">
                <span>
                  {image.repository}:{image.tag}
                </span>
                <span className="font-mono text-faint">{image.sizeMb} MB</span>
              </div>
            ))}
          </Panel>
        </TabsContent>
        <TabsContent value="networks" className="mt-4">
          <Panel>
            {workspace.networks().map((network) => (
              <div key={network.id} className="flex justify-between py-1.5 text-[13px]">
                <span>{network.name}</span>
                <Badge>{network.driver}</Badge>
              </div>
            ))}
          </Panel>
        </TabsContent>
        <TabsContent value="volumes" className="mt-4">
          <Panel>
            {workspace.volumes().map((volume) => (
              <div key={volume.name} className="py-1.5 text-[13px]">
                {volume.name}
                <div className="font-mono text-[11px] text-faint">{volume.mountpoint}</div>
              </div>
            ))}
          </Panel>
        </TabsContent>
        <TabsContent value="compose" className="mt-4">
          <Panel>
            {workspace.compose().map((project) => (
              <div key={project.name} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-[13px]">{project.name}</div>
                  <div className="font-mono text-[11px] text-faint">{project.services.join(", ")}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => toast.success("docker compose up")}>
                    Up
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.success("docker compose restart")}>
                    Restart
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      ask({
                        title: "Bring this Compose project down?",
                        description: `${project.name} services will stop. Volumes are not removed.`,
                        confirmLabel: "Compose down",
                        destructive: true,
                        onConfirm: () => toast.success("docker compose down"),
                      })
                    }
                  >
                    Down
                  </Button>
                </div>
              </div>
            ))}
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
