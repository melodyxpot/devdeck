import type { DevProcess } from "@/types";

export function rankProcessesByCpu(processes: DevProcess[], limit = 8): DevProcess[] {
  return [...processes]
    .filter((process) => Number.isFinite(process.cpu) && process.cpu >= 0)
    .sort((a, b) => b.cpu - a.cpu || b.memoryMb - a.memoryMb)
    .slice(0, limit);
}

export function totalCpuShare(processes: DevProcess[]): number {
  return processes.reduce((sum, process) => sum + Math.max(0, process.cpu), 0);
}

export function appendSample(history: number[], sample: number, max = 16): number[] {
  const next = [...history, Math.max(0, sample)];
  return next.length > max ? next.slice(next.length - max) : next;
}
