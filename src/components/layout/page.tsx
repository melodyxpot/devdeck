import type { ReactNode } from "react";
import { SearchInput } from "@/components/ui/input";

export function PageHeader({
  title,
  description,
  actions,
  search,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  search?: { value: string; onChange: (value: string) => void; placeholder: string };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[18px] font-medium tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-[13px] text-muted">{description}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        {search ? (
          <SearchInput
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder}
            className="w-56"
          />
        ) : null}
        {actions}
      </div>
    </div>
  );
}

export function Panel({
  title,
  children,
  action,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-raised/40">
      {title ? (
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.14em] text-faint">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className="p-3">{children}</div>
    </section>
  );
}
