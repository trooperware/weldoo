import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({
  className,
  error,
  id,
  label,
  ...props
}: TextareaProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      {label ? <span className="text-sm font-semibold">{label}</span> : null}
      <textarea
        aria-invalid={Boolean(error)}
        className={cn(
          "min-h-28 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 py-3 text-sm outline-none transition placeholder:text-weldoo-muted/60 focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10",
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
