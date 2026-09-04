import type { CommandDefinition } from "@/types";
import { fuzzyScore, normalizeQuery } from "@/utils/search";

export interface RankedCommand extends CommandDefinition {
  score: number;
}

export function parseCommandTokens(input: string): { verb: string; rest: string } {
  const trimmed = input.trim();
  const space = trimmed.indexOf(" ");
  if (space === -1) return { verb: trimmed.toLowerCase(), rest: "" };
  return {
    verb: trimmed.slice(0, space).toLowerCase(),
    rest: trimmed.slice(space + 1).trim(),
  };
}

export function commandMatches(command: CommandDefinition, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  const corpus = [
    command.title,
    command.subtitle ?? "",
    command.group,
    ...command.aliases,
    ...command.keywords,
  ]
    .join(" ")
    .toLowerCase();
  return (
    fuzzyScore(corpus, q) > 0 ||
    command.aliases.some((alias) => alias.toLowerCase().includes(q))
  );
}

export function rankCommands(
  commands: CommandDefinition[],
  query: string,
): RankedCommand[] {
  const q = normalizeQuery(query);
  return commands
    .map((command) => {
      const corpus = [command.title, ...command.aliases, ...command.keywords].join(" ");
      return { ...command, score: q ? fuzzyScore(corpus, q) : 50 };
    })
    .filter((command) => (q ? command.score > 0 : true))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function expandSnippet(body: string, values: Record<string, string>): string {
  return body.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    return values[key] ?? `{${key}}`;
  });
}

export function snippetPlaceholders(body: string): string[] {
  const matches = body.matchAll(/\{([a-zA-Z0-9_]+)\}/g);
  return [...new Set([...matches].map((match) => match[1] ?? ""))].filter(Boolean);
}
