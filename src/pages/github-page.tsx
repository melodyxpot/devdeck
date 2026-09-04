import { PageHeader, Panel } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { useSettingsStore } from "@/stores/settings-store";
import { useWorkspace } from "@/hooks/use-workspace";

export function GithubPage() {
  const connected = useSettingsStore((state) => state.settings.githubConnected);
  const update = useSettingsStore((state) => state.update);
  const workspace = useWorkspace();

  if (!connected) {
    return (
      <EmptyState
        title="GitHub is not connected"
        description="Local Git, projects, and terminals keep working. Connect GitHub only if you want pull requests, issues, and Actions in this view."
        action={
          <Button
            onClick={() => {
              update({ githubConnected: true });
              workspace.setGithubConnected(true);
            }}
          >
            Connect GitHub
          </Button>
        }
      />
    );
  }

  const prs = workspace.githubPulls();
  const issues = workspace.githubIssues();
  const repos = workspace.githubRepos();

  return (
    <div>
      <PageHeader
        title="GitHub"
        description="Optional. Tokens stay on this device."
        actions={
          <Button size="sm" variant="ghost" onClick={() => update({ githubConnected: false })}>
            Disconnect
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pull requests">
          {prs.map((pr) => (
            <div key={pr.number} className="flex items-start justify-between gap-3 py-2">
              <div>
                <div className="text-[13px]">
                  PR #{pr.number} · {pr.title}
                </div>
                <div className="mt-1 flex gap-2 text-[11px] text-muted">
                  <span>CI {pr.ci === "passing" ? "✓" : pr.ci}</span>
                  <span>Review {pr.reviewCount} comment</span>
                  <span>Deploy {pr.deploy === "success" ? "✓" : pr.deploy}</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => window.open(pr.url, "_blank")}>
                Open PR
              </Button>
            </div>
          ))}
        </Panel>
        <Panel title="Issues">
          {issues.map((issue) => (
            <div key={issue.number} className="flex items-center justify-between py-2 text-[13px]">
              <span>
                #{issue.number} {issue.title}
              </span>
              <Badge>{issue.state}</Badge>
            </div>
          ))}
        </Panel>
        <Panel title="Repositories">
          {repos.map((repo) => (
            <div key={repo.fullName} className="flex items-center justify-between py-2">
              <div>
                <div className="text-[13px]">{repo.fullName}</div>
                <div className="text-[12px] text-muted">{repo.description}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => window.open(repo.url, "_blank")}>
                Open
              </Button>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
