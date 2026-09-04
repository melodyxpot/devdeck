export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes("Mac");
}

export function modKey(): "⌘" | "Ctrl" {
  return isMac() ? "⌘" : "Ctrl";
}

export function formatShortcut(shortcut: string): string {
  const key = isMac() ? "⌘" : "Ctrl";
  return shortcut
    .replaceAll("Mod", key)
    .replaceAll("Shift", "Shift")
    .replaceAll("Alt", isMac() ? "⌥" : "Alt");
}
