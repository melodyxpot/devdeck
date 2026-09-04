import { Search } from "lucide-react";
import { formatShortcut } from "@/lib/platform";
import { useAppStore } from "@/stores/app-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { StatusIndicator } from "@/components/ui/status";

export function TopBar() {
  const setPalette = useAppStore((state) => state.setPaletteOpen);
  const selectedId = useAppStore((state) => state.selectedProjectId);
  const shortcut = useSettingsStore((state) => state.settings.shortcuts.commandPalette);
  const workspace = useWorkspace();
  const project = selectedId ? workspace.project(selectedId) : undefined;
  const running = workspace.projects().filter((item) => item.status === "running").length;

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
      <button
        type="button"
        onClick={() => setPalette(true)}
        className="flex h-8 min-w-[240px] flex-1 items-center gap-2 rounded-md border border-border bg-raised px-3 text-left text-[13px] text-faint hover:border-primary/40 hover:text-muted"
      >
        <Search className="size-3.5" />
        <span>Search projects, ports, commands…</span>
        <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-faint">
          {formatShortcut(shortcut)}
        </kbd>
      </button>
      <div className="hidden items-center gap-3 text-[12px] text-muted md:flex">
        <StatusIndicator tone={running > 0 ? "running" : "stopped"} label={`${running} running`} pulse={running > 0} />
        {project ? (
          <span className="font-mono text-[11px] text-faint">{project.name}</span>
        ) : null}
        <span
          className="flex size-7 items-center justify-center rounded-full bg-overlay text-[11px] font-medium text-fg"
          aria-hidden
        >
          DD
        </span>
      </div>
    </header>
  );
}
