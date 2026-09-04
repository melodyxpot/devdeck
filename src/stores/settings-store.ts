import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SETTINGS } from "@/data/mock";
import type { Settings } from "@/types";

interface SettingsState {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  updateNested: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      updateNested: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: "devdeck.settings" },
  ),
);
