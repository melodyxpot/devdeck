import type { ClipboardKind } from "@/types";

const COMMAND_PREFIXES = [
  "git ",
  "npm ",
  "pnpm ",
  "yarn ",
  "bun ",
  "docker ",
  "cargo ",
  "python ",
  "pip ",
  "curl ",
  "ssh ",
  "scp ",
  "kubectl ",
  "npx ",
  "cd ",
];

export function categorizeClipboard(content: string): ClipboardKind {
  const trimmed = content.trim();
  if (!trimmed) return "text";

  if (/^https?:\/\//i.test(trimmed) || /^localhost:\d+/.test(trimmed)) {
    return "url";
  }

  if (/error:|exception|eaddrinuse|enoent|traceback|panic:|failed to/i.test(trimmed)) {
    return "error";
  }

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // fall through
    }
  }

  const firstLine = trimmed.split("\n")[0] ?? "";
  if (
    COMMAND_PREFIXES.some((prefix) => firstLine.toLowerCase().startsWith(prefix)) ||
    /^[a-z0-9._-]+=/.test(firstLine)
  ) {
    return "command";
  }

  if (
    /^(import |export |const |function |class |def |fn |package |using )/m.test(trimmed) ||
    /```/.test(trimmed) ||
    /[{};]\s*$/m.test(trimmed)
  ) {
    return "code";
  }

  return "text";
}

export function clipboardPreview(content: string, max = 96): string {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}

export function isSensitiveClipboard(content: string): boolean {
  return /(api[_-]?key|secret|password|token|private[_-]?key|BEGIN (RSA |OPENSSH )?PRIVATE KEY)/i.test(
    content,
  );
}
