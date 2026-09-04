import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-8 w-full rounded-md border border-border bg-raised px-2.5 text-[13px] text-fg placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        className,
      )}
      {...props}
    />
  );
}

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("relative block", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
      <input
        className="h-8 w-full rounded-md border border-border bg-raised pl-8 pr-2.5 text-[13px] text-fg placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        {...props}
      />
    </label>
  );
}
