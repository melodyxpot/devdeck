import { formatKbps, formatKbpsCompact, ringProgress } from "@/utils/network";

function Ring({
  progress,
  radius,
  color,
  width,
}: {
  progress: number;
  radius: number;
  color: string;
  width: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;
  return (
    <>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        className="text-border"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 50 50)"
        className="transition-[stroke-dasharray] duration-700 ease-out"
      />
    </>
  );
}

export function NetworkSpeedRing({
  downKbps,
  upKbps,
  size = "lg",
  sample = false,
}: {
  downKbps: number;
  upKbps: number;
  size?: "sm" | "lg";
  sample?: boolean;
}) {
  const compact = size === "sm";
  const total = downKbps + upKbps;
  const label = compact ? formatKbpsCompact(total) : formatKbps(downKbps);

  return (
    <div
      className={compact ? "relative size-10 shrink-0" : "relative mx-auto size-[168px] max-w-full"}
      role="img"
      aria-label={`Network ${formatKbps(downKbps)} down, ${formatKbps(upKbps)} up`}
    >
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
        <Ring
          progress={ringProgress(downKbps)}
          radius={compact ? 40 : 42}
          width={compact ? 7 : 6}
          color="var(--primary)"
        />
        {compact ? null : (
          <Ring progress={ringProgress(upKbps)} radius={30} width={5} color="var(--info)" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={compact ? "font-mono text-[10px] leading-none tracking-tight text-primary" : "font-mono text-[22px] leading-none tracking-tight"}>
          {label}
        </span>
        {compact ? null : (
          <>
            <span className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-faint">Down</span>
            <span className="mt-1 font-mono text-[11px] text-info">↑ {formatKbps(upKbps)}</span>
            {sample ? <span className="mt-1 text-[10px] text-faint">Sample</span> : null}
          </>
        )}
      </div>
    </div>
  );
}
