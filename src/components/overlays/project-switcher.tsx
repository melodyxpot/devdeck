import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StatusIndicator } from "@/components/ui/status";
import { useAppStore } from "@/stores/app-store";
import { useWorkspace } from "@/hooks/use-workspace";

export function ProjectSwitcher() {
  const open = useAppStore((state) => state.switcherOpen);
  const setOpen = useAppStore((state) => state.setSwitcherOpen);
  const select = useAppStore((state) => state.selectProject);
  const setRoute = useAppStore((state) => state.setRoute);
  const workspace = useWorkspace();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title="Project switcher" className="overflow-hidden p-0">
        <Command className="bg-raised">
          <Command.Input
            autoFocus
            placeholder="Switch project…"
            className="h-11 w-full border-b border-border bg-transparent px-4 text-[14px] outline-none placeholder:text-faint"
          />
          <Command.List className="max-h-[380px] overflow-auto p-1.5">
            <Command.Empty className="px-3 py-8 text-center text-[13px] text-muted">
              No projects match that name.
            </Command.Empty>
            {workspace.projects().map((project) => (
              <Command.Item
                key={project.id}
                value={`${project.name} ${project.path} ${project.framework}`}
                onSelect={() => {
                  select(project.id);
                  setRoute("projects");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 data-[selected=true]:bg-overlay"
              >
                <div>
                  <div className="text-[13px]">{project.name}</div>
                  <div className="font-mono text-[11px] text-faint">
                    {project.framework} · {project.path}
                  </div>
                </div>
                <StatusIndicator
                  tone={project.status === "running" ? "running" : "stopped"}
                  label={
                    project.status === "running" && project.ports[0]
                      ? `Running on :${project.ports[0]}`
                      : "Stopped"
                  }
                  pulse={project.status === "running"}
                />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
