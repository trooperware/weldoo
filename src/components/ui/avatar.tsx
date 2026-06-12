import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  initials: string;
  size?: "sm" | "md" | "lg";
  src?: string | null;
};

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function Avatar({
  className,
  initials,
  size = "md",
  src,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4,#5558e8)] font-bold text-white shadow-weldoo-md",
        sizes[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <span className="absolute inset-0 overflow-hidden rounded-[inherit] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="block h-full w-full scale-[1.01] object-cover"
            draggable={false}
            src={src}
          />
        </span>
      ) : (
        initials
      )}
    </div>
  );
}
