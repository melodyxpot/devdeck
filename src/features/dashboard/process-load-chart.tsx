import { rankProcessesByCpu, totalCpuShare } from "@/utils/processes";
import type { DevProcess } from "@/types";

const BAR_COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--running)",
  "var(--modified)",
  "var(--muted)",
  "var(--warning)",
  "var(--success)",
  "var(--faint)",
];

function Sparkline({ samples }: { samples: number[] }) {
  if (samples.length < 2) {
    return <span className="text-[10px] text-faint">—</span>;
  }
  const width = 56;
  const height = 18;
  const max = Math.max(...samples, 1);
  const points = samples
    .map((sample, index) => {
      const x = (index / (samples.length - 1)) * width;
      const y = height - (sample / max) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-4 w-14" aria-hidden>
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

export function ProcessLoadChart({
  processes,
  history,
}: {
  processes: DevProcess[];
  history: Record<number, number[]>;
}) {
  const ranked = rankProcessesByCpu(processes, 8);
  const share = Math.max(totalCpuShare(ranked), 1);

  if (ranked.length === 0) {
    return <p className="text-[13px] text-muted">No process samples yet.</p>;
  }

  return (
    <div className="min-w-0 space-y-3">
      <div
        className="flex h-2 overflow-hidden rounded-full bg-overlay"
        aria-hidden
      >
        {ranked.map((process, index) => (
          <span
            key={process.pid}
            className="h-full"
            style={{
              width: `${(process.cpu / share) * 100}%`,
              background: BAR_COLORS[index % BAR_COLORS.length],
            }}
          />
        ))}
      </div>
      <ul className="space-y-2">
        {ranked.map((process, index) => {
          const width = Math.min(100, Math.max(3, process.cpu * 2.2));
          return (
            <li key={process.pid} className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-[12px]">
                <span className="min-w-0 flex-1 truncate">{process.name}</span>
                <Sparkline samples={history[process.pid] ?? [process.cpu]} />
                <span className="w-12 shrink-0 text-right font-mono text-[11px] text-muted">
                  {process.cpu.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-overlay">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${width}%`,
                    background: BAR_COLORS[index % BAR_COLORS.length],
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
