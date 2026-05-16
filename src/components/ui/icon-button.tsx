import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({
  className,
  icon,
  label,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-weldoo-border-light bg-white text-weldoo-muted shadow-weldoo-sm transition hover:border-weldoo-border hover:bg-weldoo-bg hover:text-weldoo-indigo disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      title={label}
      type={type}
      {...props}
    >
      {icon}
    </button>
  );
}
