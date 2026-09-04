import { lazy, Suspense, useEffect, type LazyExoticComponent, type JSX } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { ThemeSync } from "@/components/layout/theme-sync";
import { CommandPalette } from "@/components/overlays/command-palette";
import { ProjectSwitcher } from "@/components/overlays/project-switcher";
import { ClipboardPalette } from "@/components/overlays/clipboard-palette";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { LoadingState } from "@/components/states/loading-state";
import { OnboardingPage } from "@/pages/onboarding-page";
import { useGlobalHotkeys } from "@/hooks/use-hotkeys";
import { useAppStore } from "@/stores/app-store";
import { useSettingsStore } from "@/stores/settings-store";
import { workspace } from "@/services/workspace";
import { categorizeClipboard, isSensitiveClipboard } from "@/utils/clipboard";
import type { RouteId } from "@/types";

const pages: Record<RouteId, LazyExoticComponent<() => JSX.Element>> = {
  dashboard: lazy(() => import("@/pages/dashboard-page").then((mod) => ({ default: mod.DashboardPage }))),
  projects: lazy(() => import("@/pages/projects-page").then((mod) => ({ default: mod.ProjectsPage }))),
  terminal: lazy(() => import("@/pages/terminal-page").then((mod) => ({ default: mod.TerminalPage }))),
  git: lazy(() => import("@/pages/git-page").then((mod) => ({ default: mod.GitPage }))),
  github: lazy(() => import("@/pages/github-page").then((mod) => ({ default: mod.GithubPage }))),
  ports: lazy(() => import("@/pages/ports-page").then((mod) => ({ default: mod.PortsPage }))),
  processes: lazy(() => import("@/pages/processes-page").then((mod) => ({ default: mod.ProcessesPage }))),
  docker: lazy(() => import("@/pages/docker-page").then((mod) => ({ default: mod.DockerPage }))),
  environment: lazy(() => import("@/pages/environment-page").then((mod) => ({ default: mod.EnvironmentPage }))),
  clipboard: lazy(() => import("@/pages/clipboard-page").then((mod) => ({ default: mod.ClipboardPage }))),
  deployments: lazy(() => import("@/pages/deployments-page").then((mod) => ({ default: mod.DeploymentsPage }))),
  debugger: lazy(() => import("@/pages/debugger-page").then((mod) => ({ default: mod.DebuggerPage }))),
  snippets: lazy(() => import("@/pages/snippets-page").then((mod) => ({ default: mod.SnippetsPage }))),
  settings: lazy(() => import("@/pages/settings-page").then((mod) => ({ default: mod.SettingsPage }))),
};

export default function App() {
  const route = useAppStore((state) => state.route);
  const onboarded = useSettingsStore((state) => state.settings.onboardingComplete);
  const clipboardHistory = useSettingsStore((state) => state.settings.clipboardHistory);
  useGlobalHotkeys();

  useEffect(() => {
    if (!clipboardHistory || !navigator.clipboard?.readText) return;
    const onFocus = () => {
      void navigator.clipboard.readText().then((text) => {
        if (!text || isSensitiveClipboard(text)) return;
        if (categorizeClipboard(text) === "text" && text.length < 4) return;
        workspace.addClipboard(text);
      }).catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [clipboardHistory]);

  const Page = pages[route];

  return (
    <div className="flex h-full bg-bg text-fg">
      <ThemeSync />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: "!bg-raised !text-fg !border-border",
        }}
      />
      <CommandPalette />
      <ProjectSwitcher />
      <ClipboardPalette />
      <ConfirmDialog />
      {onboarded ? (
        <>
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="min-h-0 flex-1 overflow-auto p-5">
              <Suspense fallback={<LoadingState label="Loading view…" />}>
                <Page />
              </Suspense>
            </main>
          </div>
        </>
      ) : (
        <OnboardingPage />
      )}
    </div>
  );
}
