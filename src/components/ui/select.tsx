import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function Select({ className, error, id, label, ...props }: SelectProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      {label ? <span className="text-[13.5px] font-bold">{label}</span> : null}
      <select
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none transition focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500/10",
          className,
        )}
        id={id}
        {...props}
      />
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </label>
  );
}
