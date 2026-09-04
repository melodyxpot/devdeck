import { PageHeader, Panel } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { StatusIndicator } from "@/components/ui/status";
import { INTEGRATION_CATALOG, createStaticDeploymentProvider } from "@/services/integrations";
import { useWorkspace } from "@/hooks/use-workspace";
import { formatRelative } from "@/lib/format";
import { useSettingsStore } from "@/stores/settings-store";

export function DeploymentsPage() {
  const workspace = useWorkspace();
  const github = useSettingsStore((state) => state.settings.githubConnected);
  const deployments = workspace.deployments();
  const provider = createStaticDeploymentProvider("catalog", "Catalog", deployments);

  if (!github && deployments.length === 0) {
    return (
      <EmptyState
        title="No deployment providers connected"
        description="Connect GitHub Actions, Vercel, or another provider in Settings. The local app stays useful without them."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Deployments"
        description="Providers are interchangeable. DevDeck never hardcodes a single host."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          {deployments.map((deployment) => (
            <article key={deployment.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium">{deployment.title}</span>
                  <Badge>{deployment.environment}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[12px] text-muted">
                  <StatusIndicator
                    tone={
                      deployment.state === "success"
                        ? "success"
                        : deployment.state === "failed"
                          ? "danger"
                          : "warning"
                    }
                    label={deployment.state === "success" ? "Successful" : deployment.state}
                  />
                  <span>{formatRelative(deployment.createdAt)}</span>
                  <span>{deployment.projectName}</span>
                </div>
              </div>
              <div className="flex gap-1">
                {deployment.url ? (
                  <Button size="sm" variant="ghost" onClick={() => window.open(deployment.url ?? "", "_blank")}>
                    Open
                  </Button>
                ) : null}
                {provider.openLogs(deployment) ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(provider.openLogs(deployment) ?? "", "_blank")}
                  >
                    Logs
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <Panel title="Providers">
          <ul className="space-y-2 text-[13px]">
            {INTEGRATION_CATALOG.filter((item) =>
              ["vercel", "actions", "railway", "render", "cloudflare"].includes(item.id),
            ).map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span className="text-[11px] text-faint">{item.connected ? "Ready" : "Adapter"}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
