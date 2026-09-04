import { useSyncExternalStore } from "react";
import { workspace } from "@/services/workspace";

export function useWorkspace() {
  useSyncExternalStore(
    (onStoreChange) => workspace.subscribe(onStoreChange),
    () => workspace.revision(),
    () => 0,
  );
  return workspace;
}
