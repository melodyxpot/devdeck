import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

export function ConfirmDialog() {
  const confirm = useAppStore((state) => state.confirm);
  const close = useAppStore((state) => state.closeConfirm);

  return (
    <Dialog open={Boolean(confirm)} onOpenChange={(open) => !open && close()}>
      <DialogContent title={confirm?.title ?? "Confirm"}>
        <h2 className="text-[15px] font-medium">{confirm?.title}</h2>
        <p className="mt-2 text-[13px] text-muted">{confirm?.description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            variant={confirm?.destructive ? "danger" : "default"}
            onClick={() => {
              confirm?.onConfirm();
              close();
            }}
          >
            {confirm?.confirmLabel ?? "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
