import { Command } from "cmdk";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/app-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { EmptyState } from "@/components/states/empty-state";

export function ClipboardPalette() {
  const open = useAppStore((state) => state.clipboardOpen);
  const setOpen = useAppStore((state) => state.setClipboardOpen);
  const enabled = useSettingsStore((state) => state.settings.clipboardHistory);
  const workspace = useWorkspace();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title="Developer clipboard" className="overflow-hidden p-0">
        {!enabled ? (
          <div className="p-4">
            <EmptyState
              title="Clipboard history is off"
              description="DevDeck is not storing clipboard items. Enable it in Privacy settings if you want a searchable history."
            />
          </div>
        ) : (
          <Command className="bg-raised">
            <Command.Input
              autoFocus
              placeholder="Search clipboard…"
              className="h-11 w-full border-b border-border bg-transparent px-4 text-[14px] outline-none placeholder:text-faint"
            />
            <Command.List className="max-h-[380px] overflow-auto p-1.5">
              <Command.Empty className="px-3 py-8 text-center text-[13px] text-muted">
                No clipboard items match.
              </Command.Empty>
              {workspace.clipboard().map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.kind} ${item.content}`}
                  onSelect={() => {
                    void navigator.clipboard.writeText(item.content);
                    toast.success("Copied");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 data-[selected=true]:bg-overlay"
                >
                  <div className="min-w-0">
                    <div className="truncate font-mono text-[12px]">{item.preview}</div>
                  </div>
                  <Badge tone="muted">{item.kind}</Badge>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        )}
      </DialogContent>
    </Dialog>
  );
}
