import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { analyzeErrorLocally, buildAiContextPreview } from "@/services/ai";
import { useSettingsStore } from "@/stores/settings-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAppStore } from "@/stores/app-store";

const SAMPLE = "Error: EADDRINUSE: address already in use :::3000";

export function DebuggerPage() {
  const provider = useSettingsStore((state) => state.settings.aiProvider);
  const workspace = useWorkspace();
  const ask = useAppStore((state) => state.askConfirm);
  const setRoute = useAppStore((state) => state.setRoute);
  const [errorText, setErrorText] = useState(SAMPLE);
  const [reviewed, setReviewed] = useState(false);
  const context = buildAiContextPreview([]);
  const analysis = analyzeErrorLocally(errorText, workspace.ports(), workspace.processes());

  return (
    <div>
      <PageHeader
        title="AI Debugger"
        description="Local analysis first. Nothing is uploaded until you review context and ask."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Error">
          <textarea
            value={errorText}
            onChange={(event) => {
              setErrorText(event.target.value);
              setReviewed(false);
            }}
            className="min-h-40 w-full resize-y rounded-md border border-border bg-bg p-2 font-mono text-[12px] outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="Error output"
          />
          <p className="mt-2 text-[12px] text-muted">
            Paste terminal output or pick a recent error. .env files stay excluded.
          </p>
        </Panel>
        <Panel title="AI Context">
          <ul className="space-y-1.5 text-[13px]">
            {context.map((file) => (
              <li key={file.path} className="flex items-start justify-between gap-3">
                <span>
                  {file.included ? "✓" : "⚠"} {file.path}
                </span>
                <span className="text-[11px] text-faint">
                  {file.sensitive ? "secrets excluded" : file.reason}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setReviewed(true)}>
              Review Context
            </Button>
            <Button
              size="sm"
              disabled={!reviewed}
              onClick={() => {
                if (provider === "none") {
                  toast.message("No AI provider configured. Using the local analyzer.");
                  return;
                }
                toast.success("Context approved. Provider call is opt-in in the desktop build.");
              }}
            >
              Ask AI
            </Button>
          </div>
          {provider === "none" ? (
            <p className="mt-3 text-[12px] text-muted">
              AI provider is not configured. The local debugger still explains common port, install, and path errors.
            </p>
          ) : null}
        </Panel>
      </div>
      {errorText.trim() ? (
        <Panel title="Analysis" action={<span className="text-[11px] text-faint">On-device</span>}>
          <h3 className="text-[15px] font-medium">{analysis.summary}</h3>
          {analysis.process ? (
            <p className="mt-2 font-mono text-[12px] text-muted">
              Process: {analysis.process.name}
              <br />
              PID: {analysis.process.pid}
              {analysis.process.port ? (
                <>
                  <br />
                  Port: {analysis.process.port}
                </>
              ) : null}
            </p>
          ) : null}
          <p className="mt-3 text-[13px]">
            <span className="text-faint">Likely cause</span>
            <br />
            {analysis.likelyCause}
          </p>
          <p className="mt-3 text-[13px]">
            <span className="text-faint">Recommended action</span>
            <br />
            {analysis.recommendedAction}
          </p>
          <div className="mt-4 flex gap-2">
            {analysis.actions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.destructive ? "danger" : "secondary"}
                onClick={() => {
                  if (action.id === "inspect") {
                    setRoute("processes");
                    return;
                  }
                  if (action.id === "kill" && analysis.process) {
                    const pid = analysis.process.pid;
                    ask({
                      title: `Kill ${analysis.process.name}?`,
                      description: `PID ${pid} will be terminated.`,
                      confirmLabel: "Kill process",
                      destructive: true,
                      onConfirm: () => {
                        workspace.killProcess(pid, true);
                        toast.success(`Stopped ${pid}`);
                      },
                    });
                  }
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </Panel>
      ) : (
        <EmptyState title="Paste an error" description="The debugger stays empty until there is something to read." />
      )}
    </div>
  );
}
