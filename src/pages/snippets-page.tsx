import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/states/empty-state";
import { useWorkspace } from "@/hooks/use-workspace";
import { expandSnippet, snippetPlaceholders } from "@/utils/commands";
import { matchesQuery } from "@/utils/search";

export function SnippetsPage() {
  const workspace = useWorkspace();
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General");
  const [activeId, setActiveId] = useState<string | null>(workspace.snippets()[0]?.id ?? null);
  const snippets = workspace
    .snippets()
    .filter((snippet) =>
      matchesQuery(`${snippet.title} ${snippet.body} ${snippet.category} ${snippet.tags.join(" ")}`, query),
    );
  const active = snippets.find((snippet) => snippet.id === activeId) ?? snippets[0];
  const placeholders = active ? snippetPlaceholders(active.body) : [];
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div>
      <PageHeader
        title="Snippets"
        description="Reusable commands and templates with placeholders like {user}@{server}."
        search={{ value: query, onChange: setQuery, placeholder: "Search snippets" }}
      />
      {snippets.length === 0 && !query ? (
        <EmptyState title="No snippets yet" description="Save a command or template you reuse." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <Panel>
            <ul className="space-y-1">
              {snippets.map((snippet) => (
                <li key={snippet.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(snippet.id);
                      setValues({});
                    }}
                    className={`flex w-full flex-col rounded-md px-2 py-2 text-left ${
                      active?.id === snippet.id ? "bg-overlay" : "hover:bg-overlay/60"
                    }`}
                  >
                    <span className="text-[13px]">{snippet.title}</span>
                    <span className="text-[11px] text-faint">{snippet.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          {active ? (
            <Panel>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-medium">{active.title}</h2>
                  <div className="mt-1 flex gap-1">
                    <Badge>{active.category}</Badge>
                    {active.tags.map((tag) => (
                      <Badge key={tag} tone="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const expanded = expandSnippet(active.body, values);
                    void navigator.clipboard.writeText(expanded);
                    toast.success("Snippet copied");
                  }}
                >
                  Copy
                </Button>
              </div>
              <pre className="mt-4 overflow-auto rounded-md bg-bg p-3 font-mono text-[12px]">{active.body}</pre>
              {placeholders.length > 0 ? (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {placeholders.map((key) => (
                    <label key={key} className="text-[12px] text-muted">
                      {key}
                      <Input
                        className="mt-1"
                        value={values[key] ?? ""}
                        onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
            </Panel>
          ) : null}
        </div>
      )}
      <Panel title="New snippet">
        <form
          className="grid gap-2 md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || !body.trim()) return;
            workspace.upsertSnippet({
              id: crypto.randomUUID(),
              title: title.trim(),
              body,
              category,
              tags: [category.toLowerCase()],
              favorite: false,
              shortcut: null,
            });
            setTitle("");
            setBody("");
          }}
        >
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
          <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
          <Button type="submit" size="sm">
            Save
          </Button>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Body. Use {placeholders}."
            className="min-h-20 rounded-md border border-border bg-raised p-2 font-mono text-[12px] md:col-span-3"
          />
        </form>
      </Panel>
    </div>
  );
}
