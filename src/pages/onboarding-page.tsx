import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/stores/settings-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { isSafeUserPath } from "@/utils/paths";
import { toast } from "sonner";

export function OnboardingPage() {
  const update = useSettingsStore((state) => state.update);
  const settings = useSettingsStore((state) => state.settings);
  const workspace = useWorkspace();
  const [step, setStep] = useState(0);
  const [directory, setDirectory] = useState(settings.projectDirectories[0] ?? "D:\\Projects");
  const tools = workspace.tools();
  const count = workspace.projects().length;

  const finish = () => {
    if (directory && !isSafeUserPath(directory)) {
      toast.error("Use an absolute path without parent traversal.");
      return;
    }
    update({
      onboardingComplete: true,
      projectDirectories: directory ? [directory] : settings.projectDirectories,
    });
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {step === 0 ? (
          <>
            <p className="text-[12px] uppercase tracking-[0.16em] text-primary">DevDeck</p>
            <h1 className="mt-3 text-[32px] font-medium tracking-tight">Welcome to DevDeck</h1>
            <p className="mt-3 text-[15px] text-muted">
              Your development environment, in one place.
            </p>
            <div className="mt-8 flex gap-2">
              <Button onClick={() => setStep(1)}>Get Started</Button>
              <Button variant="ghost" onClick={finish}>
                Skip
              </Button>
            </div>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <h1 className="text-[26px] font-medium tracking-tight">Where are your projects?</h1>
            <p className="mt-2 text-[13px] text-muted">
              DevDeck only scans folders you choose. It does not walk your entire disk.
            </p>
            <Input
              className="mt-6"
              value={directory}
              onChange={(event) => setDirectory(event.target.value)}
              placeholder="D:\\Projects"
            />
            <div className="mt-8 flex gap-2">
              <Button onClick={() => setStep(2)}>Continue</Button>
              <Button variant="ghost" onClick={finish}>
                Skip
              </Button>
            </div>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <h1 className="text-[26px] font-medium tracking-tight">Detected tools</h1>
            <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
              {tools.map((tool) => (
                <li key={tool.id} className="flex items-center justify-between px-3 py-2 text-[13px]">
                  <span>{tool.name}</span>
                  <span className={tool.installed ? "text-success" : "text-faint"}>
                    {tool.installed ? `✓ ${tool.version ?? "found"}` : "Not found"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-2">
              <Button onClick={() => setStep(3)}>Continue</Button>
              <Button variant="ghost" onClick={finish}>
                Skip
              </Button>
            </div>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <h1 className="text-[26px] font-medium tracking-tight">You're ready.</h1>
            <p className="mt-3 text-[15px] text-muted">{count} projects detected.</p>
            <Button className="mt-8" onClick={finish}>
              Open DevDeck
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
