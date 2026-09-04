import { cn } from "@/lib/cn";

const tones = {
  running: "bg-running",
  stopped: "bg-stopped",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  modified: "bg-modified",
} as const;

export function StatusIndicator({
  tone,
  label,
  pulse = false,
}: {
  tone: keyof typeof tones;
  label?: string;
  pulse?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
      <span className="relative flex size-1.5">
        {pulse ? (
          <span className={cn("absolute inset-0 animate-ping rounded-full opacity-40", tones[tone])} />
        ) : null}
        <span className={cn("relative size-1.5 rounded-full", tones[tone])} />
      </span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}
