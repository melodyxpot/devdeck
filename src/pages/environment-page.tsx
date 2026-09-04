import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";

export function EnvironmentPage() {
  const workspace = useWorkspace();
  const selectedId = useAppStore((state) => state.selectedProjectId) ?? workspace.projects()[0]?.id;
  const project = selectedId ? workspace.project(selectedId) : undefined;
  const variables = selectedId ? workspace.env(selectedId) : [];
  const compare = workspace.compareEnv();
  const [revealed, setRevealed] = useState<string | null>(null);

  if (!project) {
    return (
      <EmptyState
        title="Select a project"
        description="Environment files are read from the project folder. Secret values stay hidden."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Environment"
        description={`${project.name} · names only, unless you reveal a value temporarily.`}
      />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Variables">
          <ul className="divide-y divide-border">
            {variables.map((variable) => (
              <li key={variable.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-mono text-[13px]">{variable.key}</div>
                  <div className="text-[11px] text-faint">{variable.files.join(" · ")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={variable.present ? "success" : "warning"}>
                    {variable.present ? "Configured" : "Missing"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      void navigator.clipboard.writeText(variable.key);
                      toast.success("Variable name copied");
                    }}
                  >
                    Copy name
                  </Button>
                  {variable.secret && variable.present ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setRevealed((current) => (current === variable.key ? null : variable.key))
                      }
                    >
                      {revealed === variable.key ? "••••••••" : "Reveal"}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-4">
          <Panel title="Compare with .env.example">
            <div className="space-y-3 text-[13px]">
              <div>
                <div className="text-faint">Missing</div>
                <div>{compare.missing.join(", ") || "None"}</div>
              </div>
              <div>
                <div className="text-faint">Unused</div>
                <div>{compare.unused.join(", ") || "None"}</div>
              </div>
              <div>
                <div className="text-faint">Shared</div>
                <div>{compare.shared.join(", ")}</div>
              </div>
            </div>
          </Panel>
          <p className="text-[12px] text-muted">
            Secrets are never sent to AI providers. Revealed values stay in memory for this view only.
          </p>
        </div>
      </div>
    </div>
  );
}
