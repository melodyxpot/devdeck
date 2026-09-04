import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-2 px-1 py-10", className)}>
      {icon ? <div className="text-faint">{icon}</div> : null}
      <h3 className="text-[15px] font-medium text-fg">{title}</h3>
      <p className="max-w-md text-[13px] text-muted">{description}</p>
      {action}
    </div>
  );
}
