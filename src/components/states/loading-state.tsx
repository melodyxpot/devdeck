export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-8 text-[13px] text-muted" role="status">
      <span className="size-3.5 animate-spin rounded-full border border-border border-t-primary" />
      {label}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-md bg-overlay/70" />
      ))}
    </div>
  );
}
