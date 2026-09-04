import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

export function ThemeSync() {
  const theme = useSettingsStore((state) => state.settings.theme);
  const accent = useSettingsStore((state) => state.settings.accent);
  const compact = useSettingsStore((state) => state.settings.compact);

  useEffect(() => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.accent = accent;
    document.documentElement.dataset.compact = compact ? "true" : "false";
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [theme, accent, compact]);

  return null;
}
