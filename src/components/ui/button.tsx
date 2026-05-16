import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-white shadow-weldoo-md hover:brightness-105",
  secondary:
    "border border-weldoo-indigo bg-white text-weldoo-indigo hover:bg-weldoo-bg",
  ghost:
    "border border-weldoo-border-light bg-white text-weldoo-slate hover:border-weldoo-border hover:bg-weldoo-bg",
  danger:
    "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-weldoo-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
