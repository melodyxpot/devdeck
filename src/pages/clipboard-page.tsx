import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { useSettingsStore } from "@/stores/settings-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { matchesQuery } from "@/utils/search";
import type { ClipboardKind } from "@/types";

const KINDS: Array<ClipboardKind | "all"> = ["all", "command", "code", "url", "json", "error", "text"];

export function ClipboardPage() {
  const enabled = useSettingsStore((state) => state.settings.clipboardHistory);
  const workspace = useWorkspace();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ClipboardKind | "all">("all");
  const items = workspace
    .clipboard()
    .filter((item) => kind === "all" || item.kind === kind)
    .filter((item) => matchesQuery(`${item.kind} ${item.content}`, query))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));

  if (!enabled) {
    return (
      <EmptyState
        title="Clipboard history is disabled"
        description="Turn it on in Privacy settings if you want a searchable developer clipboard. Nothing is stored while this is off."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Clipboard"
        description="Local history only. Sensitive-looking text is never categorized as a secret reveal."
        search={{ value: query, onChange: setQuery, placeholder: "Search clipboard" }}
      />
      <div className="mb-4 flex flex-wrap gap-1">
        {KINDS.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={kind === item ? "secondary" : "ghost"}
            onClick={() => setKind(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      {items.length === 0 ? (
        <EmptyState title="No clipboard items" description="Copy something, or change the filter." />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 px-3 py-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <Badge>{item.kind}</Badge>
                  {item.pinned ? <Badge tone="primary">Pinned</Badge> : null}
                  {item.favorite ? <Badge tone="warning">Favorite</Badge> : null}
                </div>
                <pre className="overflow-auto font-mono text-[12px] text-muted">{item.content}</pre>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(item.content);
                    toast.success("Copied");
                  }}
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => workspace.updateClipboard(item.id, { pinned: !item.pinned })}
                >
                  {item.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => workspace.updateClipboard(item.id, { favorite: !item.favorite })}
                >
                  Favorite
                </Button>
                <Button size="sm" variant="ghost" onClick={() => workspace.deleteClipboard(item.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
