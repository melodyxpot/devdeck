import { isTauri } from "@/lib/platform";

export async function invokeNative<T>(command: string, args?: Record<string, unknown>): Promise<T | null> {
  if (!isTauri()) return null;
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}
