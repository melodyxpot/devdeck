import {
  Activity,
  Box,
  Bug,
  Clipboard,
  FolderGit2,
  Gauge,
  GitBranch,
  GitPullRequest,
  Layers,
  PanelLeft,
  Rocket,
  Settings,
  SquareTerminal,
  TerminalSquare,
  Wifi,
} from "lucide-react";
import { NAV_ITEMS } from "@/services/command-registry";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useAppStore } from "@/stores/app-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { RouteId } from "@/types";

const ICONS: Record<RouteId, typeof Gauge> = {
  dashboard: Gauge,
  projects: Layers,
  terminal: SquareTerminal,
  git: GitBranch,
  github: GitPullRequest,
  ports: Wifi,
  processes: Activity,
  docker: Box,
  environment: FolderGit2,
  clipboard: Clipboard,
  deployments: Rocket,
  debugger: Bug,
  snippets: TerminalSquare,
  settings: Settings,
};

export function Sidebar() {
  const route = useAppStore((state) => state.route);
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggle = useAppStore((state) => state.toggleSidebar);
  const setRoute = useAppStore((state) => state.setRoute);
  const hidden = useSettingsStore((state) => state.settings.hiddenSidebarItems);
  const items = NAV_ITEMS.filter((item) => !hidden.includes(item.id));
  const main = items.filter((item) => item.id !== "settings");
  const settings = items.find((item) => item.id === "settings");

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-raised/70",
        collapsed ? "w-14" : "w-[168px] min-[900px]:w-[200px]",
      )}
    >
      <div className={cn("flex h-12 items-center px-3", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <img src="/app-icon.png" alt="" className="size-6 rounded" />
            <span className="text-[13px] font-semibold tracking-tight">DevDeck</span>
          </div>
        ) : (
          <img src="/app-icon.png" alt="DevDeck" className="size-6 rounded" />
        )}
        {!collapsed ? (
          <IconButton label="Collapse sidebar" onClick={toggle}>
            <PanelLeft className="size-4" />
          </IconButton>
        ) : null}
      </div>
      {collapsed ? (
        <div className="flex justify-center pb-2">
          <IconButton label="Expand sidebar" onClick={toggle}>
            <PanelLeft className="size-4" />
          </IconButton>
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col gap-0.5 px-2" aria-label="Primary">
        {main.map((item) => {
          const Icon = ICONS[item.id];
          const active = route === item.id;
          const button = (
            <button
              key={item.id}
              type="button"
              onClick={() => setRoute(item.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-[13px] transition-colors",
                active ? "bg-overlay text-fg" : "text-muted hover:bg-overlay/70 hover:text-fg",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </button>
          );
          return collapsed ? (
            <Tooltip key={item.id} content={item.label}>
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </nav>

      {settings ? (
        <div className="px-2 pb-3">
          <button
            type="button"
            onClick={() => setRoute("settings")}
            className={cn(
              "flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-[13px]",
              route === "settings" ? "bg-overlay text-fg" : "text-muted hover:bg-overlay/70 hover:text-fg",
              collapsed && "justify-center px-0",
            )}
          >
            <Settings className="size-4" />
            {!collapsed ? <span>Settings</span> : null}
          </button>
        </div>
      ) : null}
    </aside>
  );
}
