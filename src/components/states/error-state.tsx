import type { AppError } from "@/types";
import { Button } from "@/components/ui/button";

export function ErrorState({
  error,
  onRetry,
}: {
  error: AppError;
  onRetry?: () => void;
}) {
  return (
    <div className="max-w-lg rounded-lg border border-danger/30 bg-danger/5 p-4">
      <h3 className="text-[14px] font-medium text-fg">{error.title}</h3>
      <p className="mt-2 text-[12px] text-muted">
        <span className="text-faint">Reason</span>
        <br />
        {error.reason}
      </p>
      <p className="mt-2 text-[12px] text-muted">
        <span className="text-faint">Fix</span>
        <br />
        {error.fix}
      </p>
      <div className="mt-3 flex gap-2">
        {onRetry ? (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        {error.docsUrl ? (
          <Button size="sm" variant="ghost" asChild>
            <a href={error.docsUrl} target="_blank" rel="noreferrer">
              Open documentation
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
