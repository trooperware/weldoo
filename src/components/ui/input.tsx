import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, error, id, label, ...props }: InputProps) {
  return (
    <label className="block" htmlFor={id}>
      {label ? (
        <span className="mb-[6px] block text-[13.8px] font-semibold leading-[1.15] text-weldoo-ink">
          {label}
        </span>
      ) : null}
      <input
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 w-full rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-4 text-sm outline-none transition placeholder:text-weldoo-muted/60 focus:border-weldoo-indigo focus:bg-white focus:ring-4 focus:ring-weldoo-indigo/10",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500/10",
          className,
        )}
        id={id}
        {...props}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </label>
  );
}
