import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/states/empty-state";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";
import type { GitFile } from "@/types";

function FileRow({
  file,
  onSelect,
  onDiscard,
}: {
  file: GitFile;
  onSelect: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12px]">
      <button type="button" onClick={onSelect} className="min-w-0 text-left hover:text-primary">
        <span className="font-mono">{file.path}</span>
        <span className="ml-2 text-faint">{file.status}</span>
      </button>
      <div className="flex items-center gap-2 font-mono text-faint">
        <span className="text-success">+{file.additions}</span>
        <span className="text-danger">-{file.deletions}</span>
        {!file.staged ? (
          <Button size="sm" variant="ghost" onClick={onDiscard}>
            Discard
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function GitPage() {
  const workspace = useWorkspace();
  const ask = useAppStore((state) => state.askConfirm);
  const selectedId = useAppStore((state) => state.selectedProjectId) ?? workspace.projects()[0]?.id;
  const project = selectedId ? workspace.project(selectedId) : undefined;
  const repo = selectedId ? workspace.git(selectedId) : null;
  const [message, setMessage] = useState("");
  const [branch, setBranch] = useState("");
  const [diffPath, setDiffPath] = useState<string | null>(null);
  const diff = selectedId && diffPath ? workspace.diff(selectedId, diffPath) : null;

  if (!project || !repo) {
    return (
      <EmptyState
        title="No Git repository selected"
        description="Open a project that contains a .git directory to inspect branches, diffs, and history."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Git"
        description={`${project.name} · ${repo.branch}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => toast.success("Fetched from origin")}>
              Fetch
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast.success("Pulled latest commits")}>
              Pull
            </Button>
            <Button
              size="sm"
              onClick={() => {
                ask({
                  title: "Push this branch?",
                  description: `${repo.ahead} commit(s) will be sent to ${repo.upstream ?? "origin"}. Force push is not used.`,
                  confirmLabel: "Push",
                  onConfirm: () => toast.success("Push completed"),
                });
              }}
            >
              Push
            </Button>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-4 text-[13px] text-muted">
        <span className="font-mono text-fg">{repo.branch}</span>
        <span>
          {repo.ahead} ahead · {repo.behind} behind
        </span>
        <span>{repo.stashCount} stash</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Panel title="Staged">
            {repo.staged.length === 0 ? (
              <p className="text-[13px] text-muted">Nothing staged.</p>
            ) : (
              repo.staged.map((file) => (
                <FileRow
                  key={file.path}
                  file={file}
                  onSelect={() => setDiffPath(file.path)}
                  onDiscard={() => undefined}
                />
              ))
            )}
          </Panel>
          <Panel title="Modified">
            {repo.unstaged.length === 0 ? (
              <p className="text-[13px] text-muted">Working tree is clean.</p>
            ) : (
              repo.unstaged.map((file) => (
                <FileRow
                  key={file.path}
                  file={file}
                  onSelect={() => setDiffPath(file.path)}
                  onDiscard={() =>
                    ask({
                      title: "Discard changes?",
                      description: `Uncommitted edits in ${file.path} will be permanently lost.`,
                      confirmLabel: "Discard",
                      destructive: true,
                      onConfirm: () => workspace.discard(project.id, file.path, true),
                    })
                  }
                />
              ))
            )}
          </Panel>
          <Panel title="Untracked">
            {repo.untracked.length === 0 ? (
              <p className="text-[13px] text-muted">No untracked files.</p>
            ) : (
              repo.untracked.map((file) => (
                <FileRow
                  key={file.path}
                  file={file}
                  onSelect={() => setDiffPath(file.path)}
                  onDiscard={() =>
                    ask({
                      title: "Discard untracked file?",
                      description: `${file.path} will be removed from disk.`,
                      confirmLabel: "Discard",
                      destructive: true,
                      onConfirm: () => workspace.discard(project.id, file.path, true),
                    })
                  }
                />
              ))
            )}
          </Panel>
          <Panel title="Commit">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!message.trim()) return;
                workspace.commit(project.id, message.trim());
                setMessage("");
                toast.success("Commit created locally");
              }}
            >
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Commit message"
              />
              <Button type="submit" size="sm">
                Commit
              </Button>
            </form>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!branch.trim()) return;
                workspace.checkout(project.id, branch.trim());
                setBranch("");
              }}
            >
              <Input
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                placeholder="Create or checkout branch"
              />
              <Button type="submit" size="sm" variant="secondary">
                Checkout
              </Button>
            </form>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Diff">
            {!diff ? (
              <p className="text-[13px] text-muted">Select a file to inspect the diff.</p>
            ) : (
              <div>
                <div className="mb-2 font-mono text-[12px] text-muted">{diff.path}</div>
                {diff.hunks.map((hunk) => (
                  <div key={hunk.header} className="overflow-auto font-mono text-[12px]">
                    <div className="text-info">{hunk.header}</div>
                    {hunk.lines.map((line, index) => (
                      <div
                        key={`${hunk.header}-${index}`}
                        className={
                          line.type === "add"
                            ? "bg-success/10 text-success"
                            : line.type === "del"
                              ? "bg-danger/10 text-danger"
                              : "text-muted"
                        }
                      >
                        {line.type === "add" ? "+" : line.type === "del" ? "-" : " "}
                        {line.content}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Recent commits">
            <ul className="space-y-2">
              {repo.commits.map((commit) => (
                <li key={commit.hash} className="text-[12px]">
                  <span className="font-mono text-primary">{commit.shortHash}</span>{" "}
                  {commit.message}
                  <div className="text-faint">
                    {commit.author}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
