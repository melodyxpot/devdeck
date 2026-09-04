import { create } from "zustand";
import type { RouteId } from "@/types";

export interface ConfirmRequest {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}

interface AppState {
  route: RouteId;
  sidebarCollapsed: boolean;
  selectedProjectId: string | null;
  paletteOpen: boolean;
  switcherOpen: boolean;
  clipboardOpen: boolean;
  confirm: ConfirmRequest | null;
  notice: { title: string; detail: string } | null;
  setRoute: (route: RouteId) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  selectProject: (id: string | null) => void;
  setPaletteOpen: (value: boolean) => void;
  setSwitcherOpen: (value: boolean) => void;
  setClipboardOpen: (value: boolean) => void;
  askConfirm: (request: ConfirmRequest) => void;
  closeConfirm: () => void;
  setNotice: (notice: { title: string; detail: string } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  route: "dashboard",
  sidebarCollapsed: false,
  selectedProjectId: "momoreis",
  paletteOpen: false,
  switcherOpen: false,
  clipboardOpen: false,
  confirm: null,
  notice: null,
  setRoute: (route) => set({ route }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  selectProject: (selectedProjectId) => set({ selectedProjectId }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setSwitcherOpen: (switcherOpen) => set({ switcherOpen }),
  setClipboardOpen: (clipboardOpen) => set({ clipboardOpen }),
  askConfirm: (confirm) => set({ confirm }),
  closeConfirm: () => set({ confirm: null }),
  setNotice: (notice) => set({ notice }),
}));
