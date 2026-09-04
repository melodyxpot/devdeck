import { useEffect } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useSettingsStore } from "@/stores/settings-store";
import { workspace } from "@/services/workspace";

export function useHostTelemetry() {
  const store = useWorkspace();
  return store.telemetry();
}

export function useHostTelemetryPoller(intervalMs = 1500) {
  const useMockData = useSettingsStore((state) => state.settings.useMockData);

  useEffect(() => {
    void workspace.refreshTelemetry(useSettingsStore.getState().settings);
    const timer = window.setInterval(() => {
      void workspace.refreshTelemetry(useSettingsStore.getState().settings);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, useMockData]);
}
