import { useState, type ReactNode } from "react";
import { PageHeader, Panel } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NAV_ITEMS } from "@/services/command-registry";
import { isSafeUserPath } from "@/utils/paths";
import { useSettingsStore } from "@/stores/settings-store";
import { toast } from "sonner";
import type { AccentId, RouteId, ThemeMode } from "@/types";

const SECTIONS = [
  "General",
  "Appearance",
  "Keyboard Shortcuts",
  "Projects",
  "Terminal",
  "Git",
  "GitHub",
  "Docker",
  "AI",
  "Notifications",
  "Privacy",
  "Integrations",
  "Advanced",
] as const;

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <div className="text-[13px]">{label}</div>
        {hint ? <div className="text-[12px] text-muted">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const update = useSettingsStore((state) => state.update);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("General");
  const [directory, setDirectory] = useState("");

  return (
    <div>
      <PageHeader title="Settings" description="Local preferences. Nothing here is uploaded unless you connect a provider." />
      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        <nav className="rounded-lg border border-border p-2">
          {SECTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={`flex h-8 w-full items-center rounded-md px-2 text-left text-[13px] ${
                section === item ? "bg-overlay" : "text-muted hover:bg-overlay/60 hover:text-fg"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <Panel title={section}>
          {section === "General" ? (
            <>
              <Row label="Launch at login" hint="Windows startup folder / registry, desktop build only.">
                <Switch checked={settings.launchAtLogin} onCheckedChange={(value) => update({ launchAtLogin: value })} />
              </Row>
              <Row label="Minimize to tray">
                <Switch checked={settings.minimizeToTray} onCheckedChange={(value) => update({ minimizeToTray: value })} />
              </Row>
              <Row label="Use sample workspace data" hint="Keeps the UI usable when Git, Docker, or scanners are missing.">
                <Switch checked={settings.useMockData} onCheckedChange={(value) => update({ useMockData: value })} />
              </Row>
            </>
          ) : null}
          {section === "Appearance" ? (
            <>
              <Row label="Theme">
                <select
                  className="h-8 rounded-md border border-border bg-raised px-2"
                  value={settings.theme}
                  onChange={(event) => update({ theme: event.target.value as ThemeMode })}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </Row>
              <Row label="Accent">
                <select
                  className="h-8 rounded-md border border-border bg-raised px-2"
                  value={settings.accent}
                  onChange={(event) => update({ accent: event.target.value as AccentId })}
                >
                  <option value="amber">Amber</option>
                  <option value="teal">Teal</option>
                  <option value="slate">Slate</option>
                </select>
              </Row>
              <Row label="Compact mode">
                <Switch checked={settings.compact} onCheckedChange={(value) => update({ compact: value })} />
              </Row>
              <div className="pt-2 text-[12px] text-muted">Sidebar visibility</div>
              {NAV_ITEMS.filter((item) => item.id !== "settings").map((item) => {
                const hidden = settings.hiddenSidebarItems.includes(item.id);
                return (
                  <Row key={item.id} label={item.label}>
                    <Switch
                      checked={!hidden}
                      onCheckedChange={(value) => {
                        const next = value
                          ? settings.hiddenSidebarItems.filter((id) => id !== item.id)
                          : [...settings.hiddenSidebarItems, item.id];
                        update({ hiddenSidebarItems: next as RouteId[] });
                      }}
                    />
                  </Row>
                );
              })}
            </>
          ) : null}
          {section === "Keyboard Shortcuts" ? (
            <>
              {(
                [
                  ["commandPalette", "Command palette"],
                  ["projectSwitcher", "Project switcher"],
                  ["clipboard", "Developer clipboard"],
                  ["dashboard", "Dashboard"],
                ] as const
              ).map(([key, label]) => (
                <Row key={key} label={label} hint="Use Mod for Ctrl or ⌘.">
                  <Input
                    className="w-40"
                    value={settings.shortcuts[key]}
                    onChange={(event) =>
                      update({ shortcuts: { ...settings.shortcuts, [key]: event.target.value } })
                    }
                  />
                </Row>
              ))}
            </>
          ) : null}
          {section === "Projects" ? (
            <>
              <div className="text-[13px] text-muted">Project directories</div>
              <ul className="mt-2 space-y-1">
                {settings.projectDirectories.map((path) => (
                  <li key={path} className="flex items-center justify-between font-mono text-[12px]">
                    {path}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        update({
                          projectDirectories: settings.projectDirectories.filter((item) => item !== path),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!isSafeUserPath(directory)) {
                    toast.error("That path is not allowed. Use an absolute path without ..");
                    return;
                  }
                  update({ projectDirectories: [...settings.projectDirectories, directory] });
                  setDirectory("");
                }}
              >
                <Input
                  value={directory}
                  onChange={(event) => setDirectory(event.target.value)}
                  placeholder="D:\\Projects"
                />
                <Button type="submit" size="sm">
                  Add
                </Button>
              </form>
              <Row label="Default editor">
                <select
                  className="h-8 rounded-md border border-border bg-raised px-2"
                  value={settings.defaultEditor}
                  onChange={(event) =>
                    update({ defaultEditor: event.target.value as typeof settings.defaultEditor })
                  }
                >
                  <option value="cursor">Cursor</option>
                  <option value="code">VS Code</option>
                  <option value="system">System</option>
                </select>
              </Row>
            </>
          ) : null}
          {section === "Terminal" ? (
            <Row label="Default terminal">
              <select
                className="h-8 rounded-md border border-border bg-raised px-2"
                value={settings.defaultTerminal}
                onChange={(event) =>
                  update({ defaultTerminal: event.target.value as typeof settings.defaultTerminal })
                }
              >
                <option value="powershell">PowerShell</option>
                <option value="wt">Windows Terminal</option>
                <option value="cmd">Command Prompt</option>
                <option value="system">System</option>
              </select>
            </Row>
          ) : null}
          {section === "Git" ? (
            <p className="text-[13px] text-muted">
              Git runs as subprocesses on your machine. Destructive commands always confirm first.
            </p>
          ) : null}
          {section === "GitHub" ? (
            <Row label="GitHub connected" hint="Optional. Local Git still works without it.">
              <Switch
                checked={settings.githubConnected}
                onCheckedChange={(value) => update({ githubConnected: value })}
              />
            </Row>
          ) : null}
          {section === "Docker" ? (
            <Row label="Docker integration">
              <Switch
                checked={settings.dockerEnabled}
                onCheckedChange={(value) => update({ dockerEnabled: value })}
              />
            </Row>
          ) : null}
          {section === "AI" ? (
            <>
              <Row label="Provider" hint="Keep this off unless you want cloud analysis.">
                <select
                  className="h-8 rounded-md border border-border bg-raised px-2"
                  value={settings.aiProvider}
                  onChange={(event) =>
                    update({ aiProvider: event.target.value as typeof settings.aiProvider })
                  }
                >
                  <option value="none">None (local only)</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="custom">Custom endpoint</option>
                </select>
              </Row>
              <Row label="Custom endpoint">
                <Input
                  className="w-64"
                  value={settings.aiEndpoint}
                  onChange={(event) => update({ aiEndpoint: event.target.value })}
                />
              </Row>
            </>
          ) : null}
          {section === "Notifications" ? (
            <>
              {(
                [
                  ["builds", "Builds"],
                  ["deployments", "Deployments"],
                  ["ports", "Port conflicts"],
                  ["git", "Git"],
                  ["docker", "Docker"],
                ] as const
              ).map(([key, label]) => (
                <Row key={key} label={label}>
                  <Switch
                    checked={settings.notifications[key]}
                    onCheckedChange={(value) =>
                      update({ notifications: { ...settings.notifications, [key]: value } })
                    }
                  />
                </Row>
              ))}
            </>
          ) : null}
          {section === "Privacy" ? (
            <>
              <Row label="Telemetry" hint="Off by default. DevDeck does not need analytics to work.">
                <Switch checked={settings.telemetry} onCheckedChange={(value) => update({ telemetry: value })} />
              </Row>
              <Row label="Clipboard history">
                <Switch
                  checked={settings.clipboardHistory}
                  onCheckedChange={(value) => update({ clipboardHistory: value })}
                />
              </Row>
              <Row label="Activity history">
                <Switch
                  checked={settings.activityHistory}
                  onCheckedChange={(value) => update({ activityHistory: value })}
                />
              </Row>
              <Row label="Clipboard retention (days)">
                <Input
                  className="w-20"
                  type="number"
                  min={1}
                  max={90}
                  value={settings.clipboardRetentionDays}
                  onChange={(event) => update({ clipboardRetentionDays: Number(event.target.value) })}
                />
              </Row>
            </>
          ) : null}
          {section === "Integrations" ? (
            <p className="text-[13px] text-muted">
              GitHub, Vercel, Railway, Render, Cloudflare, and Actions plug in through the same provider
              interface. Only enable what you need.
            </p>
          ) : null}
          {section === "Advanced" ? (
            <Row label="Replay onboarding">
              <Button size="sm" variant="secondary" onClick={() => update({ onboardingComplete: false })}>
                Start
              </Button>
            </Row>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
