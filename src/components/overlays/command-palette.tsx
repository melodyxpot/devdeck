import { Command } from "cmdk";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ALL_COMMANDS, ROUTE_FROM_COMMAND } from "@/services/command-registry";
import { rankCommands } from "@/utils/commands";
import { formatShortcut } from "@/lib/platform";
import { useAppStore } from "@/stores/app-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { toast } from "sonner";
import type { CommandDefinition } from "@/types";

export function CommandPalette() {
  const open = useAppStore((state) => state.paletteOpen);
  const setOpen = useAppStore((state) => state.setPaletteOpen);
  const setRoute = useAppStore((state) => state.setRoute);
  const selectProject = useAppStore((state) => state.selectProject);
  const setSwitcher = useAppStore((state) => state.setSwitcherOpen);
  const setClipboard = useAppStore((state) => state.setClipboardOpen);
  const workspace = useWorkspace();
  const [query, setQuery] = useState("");
  const projectCommands: CommandDefinition[] = workspace.projects().map((project) => ({
    id: `recent.${project.id}`,
    title: `Open recent project · ${project.name}`,
    subtitle: project.path,
    aliases: [project.name],
    group: "Recent",
    keywords: [project.framework, project.path],
  }));
  const commands = rankCommands([...ALL_COMMANDS, ...projectCommands], query);

  const run = (id: string) => {
    if (id.startsWith("recent.")) {
      const projectId = id.replace("recent.", "");
      selectProject(projectId);
      setRoute("projects");
      setOpen(false);
      return;
    }
    const route = ROUTE_FROM_COMMAND[id];
    if (route) {
      setRoute(route);
      setOpen(false);
      return;
    }
    if (id === "project.open") {
      setOpen(false);
      setSwitcher(true);
      return;
    }
    if (id === "nav.clipboard" || id === "project.localhost") {
      if (id === "nav.clipboard") setClipboard(true);
      if (id === "project.localhost") window.open("http://localhost:3000", "_blank");
      setOpen(false);
      return;
    }
    if (id === "project.start") {
      const selected = useAppStore.getState().selectedProjectId;
      if (selected) {
        try {
          workspace.startProject(selected);
          toast.success(`Started ${workspace.project(selected)?.name}`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to start project");
        }
      }
      setOpen(false);
      return;
    }
    if (id === "project.stop") {
      const selected = useAppStore.getState().selectedProjectId;
      if (selected) workspace.stopProject(selected);
      setOpen(false);
      return;
    }
    if (id === "ssh.copy") {
      void navigator.clipboard.writeText("ssh user@server");
      toast.success("SSH command copied");
      setOpen(false);
      return;
    }
    setRoute(id.startsWith("git.") ? "git" : id.startsWith("docker.") ? "docker" : "terminal");
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setQuery("");
      }}
    >
      <DialogContent title="Command palette" className="overflow-hidden p-0">
        <Command label="Command palette" className="bg-raised">
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Type a command or search…"
            className="h-11 w-full border-b border-border bg-transparent px-4 text-[14px] outline-none placeholder:text-faint"
          />
          <Command.List className="max-h-[360px] overflow-auto p-1.5">
            <Command.Empty className="px-3 py-8 text-center text-[13px] text-muted">
              No matching commands.
            </Command.Empty>
            {commands.map((command) => (
              <Command.Item
                key={command.id}
                value={`${command.title} ${command.aliases.join(" ")}`}
                onSelect={() => run(command.id)}
                className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-[13px] data-[selected=true]:bg-overlay"
              >
                <div>
                  <div>{command.title}</div>
                  {command.subtitle ? (
                    <div className="font-mono text-[11px] text-faint">{command.subtitle}</div>
                  ) : null}
                </div>
                {command.shortcut ? (
                  <kbd className="font-mono text-[10px] text-faint">{formatShortcut(command.shortcut)}</kbd>
                ) : (
                  <span className="text-[11px] text-faint">{command.group}</span>
                )}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
