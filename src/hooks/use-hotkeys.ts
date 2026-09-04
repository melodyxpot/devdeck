import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { useSettingsStore } from "@/stores/settings-store";

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split("+");
  const key = parts[parts.length - 1]?.toLowerCase();
  if (!key || event.key.toLowerCase() !== key.toLowerCase()) return false;
  const wantMod = parts.includes("Mod");
  const wantShift = parts.includes("Shift");
  const wantAlt = parts.includes("Alt");
  const hasMod = event.metaKey || event.ctrlKey;
  return hasMod === wantMod && event.shiftKey === wantShift && event.altKey === wantAlt;
}

export function useGlobalHotkeys(): void {
  const shortcuts = useSettingsStore((state) => state.settings.shortcuts);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (matchesShortcut(event, shortcuts.commandPalette)) {
        event.preventDefault();
        useAppStore.getState().setPaletteOpen(true);
        return;
      }
      if (matchesShortcut(event, shortcuts.projectSwitcher)) {
        event.preventDefault();
        useAppStore.getState().setSwitcherOpen(true);
        return;
      }
      if (matchesShortcut(event, shortcuts.clipboard)) {
        event.preventDefault();
        useAppStore.getState().setClipboardOpen(true);
        return;
      }
      if (!typing && matchesShortcut(event, shortcuts.dashboard)) {
        event.preventDefault();
        useAppStore.getState().setRoute("dashboard");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}
