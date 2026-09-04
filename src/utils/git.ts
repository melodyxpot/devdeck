import type { GitFile, GitFileStatus } from "@/types";

export function parsePorcelainLine(line: string): GitFile | null {
  if (line.length < 4) return null;
  const xy = line.slice(0, 2);
  const path = line.slice(3).replace(/^"+|"+$/g, "");
  if (!path) return null;

  const stagedCode = xy[0] ?? " ";
  const unstagedCode = xy[1] ?? " ";
  const status = porcelainStatus(stagedCode === " " ? unstagedCode : stagedCode);
  const staged = stagedCode !== " " && stagedCode !== "?";

  return {
    path,
    status,
    staged,
    additions: 0,
    deletions: 0,
  };
}

function porcelainStatus(code: string): GitFileStatus {
  switch (code) {
    case "A":
      return "added";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    case "U":
      return "conflicted";
    case "?":
      return "untracked";
    default:
      return "modified";
  }
}

export function parseAheadBehind(branchLine: string): { ahead: number; behind: number } {
  const ahead = /ahead (\d+)/.exec(branchLine);
  const behind = /behind (\d+)/.exec(branchLine);
  return {
    ahead: ahead?.[1] ? Number(ahead[1]) : 0,
    behind: behind?.[1] ? Number(behind[1]) : 0,
  };
}

export function parsePortsFromListen(line: string): number | null {
  const match = /:(\d+)\s/.exec(` ${line} `) ?? /:(\d+)$/.exec(line);
  if (!match?.[1]) return null;
  const port = Number(match[1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  return port;
}
