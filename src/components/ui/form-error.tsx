import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function FormError({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  if (!children) return null;

  return (
    <div
      className={cn(
        "rounded-weldoo-sm border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700",
        className,
      )}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
}
