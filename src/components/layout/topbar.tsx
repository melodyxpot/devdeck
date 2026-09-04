import { Search } from "lucide-react";
import { formatShortcut } from "@/lib/platform";
import { useAppStore } from "@/stores/app-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { useHostTelemetry } from "@/hooks/use-host-telemetry";
import { StatusIndicator } from "@/components/ui/status";
import { NetworkSpeedRing } from "@/features/dashboard/network-speed-ring";
import { Tooltip } from "@/components/ui/tooltip";
import { formatKbps } from "@/utils/network";

export function TopBar() {
  const setPalette = useAppStore((state) => state.setPaletteOpen);
  const selectedId = useAppStore((state) => state.selectedProjectId);
  const shortcut = useSettingsStore((state) => state.settings.shortcuts.commandPalette);
  const workspace = useWorkspace();
  const telemetry = useHostTelemetry();
  const project = selectedId ? workspace.project(selectedId) : undefined;
  const running = workspace.projects().filter((item) => item.status === "running").length;
  const down = telemetry.metrics.networkDownKbps;
  const up = telemetry.metrics.networkUpKbps;

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 sm:gap-3 sm:px-4">
      <button
        type="button"
        onClick={() => setPalette(true)}
        className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-raised px-3 text-left text-[13px] text-faint hover:border-primary/40 hover:text-muted"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="truncate">Search projects, ports, commands…</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">
          {formatShortcut(shortcut)}
        </kbd>
      </button>
      <Tooltip content={`${formatKbps(down)} down · ${formatKbps(up)} up`}>
        <button type="button" className="shrink-0" aria-label="Network speed">
          <NetworkSpeedRing downKbps={down} upKbps={up} size="sm" sample={!telemetry.live} />
        </button>
      </Tooltip>
      <div className="hidden items-center gap-3 text-[12px] text-muted lg:flex">
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
