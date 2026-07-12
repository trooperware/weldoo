"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type AutoDismissNoticeProps = {
  className?: string;
  durationMs?: number;
  message?: string | null;
  variant?: "error" | "success";
};

const variantClasses = {
  error: "border-red-200 bg-red-50 text-red-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function AutoDismissNotice({
  className,
  durationMs = 3600,
  message,
  variant = "success",
}: AutoDismissNoticeProps) {
  const [displayMessage, setDisplayMessage] = useState(message ?? null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!message) {
      window.queueMicrotask(() => {
        setDisplayMessage(null);
        setLeaving(false);
      });
      return;
    }

    window.queueMicrotask(() => {
      setDisplayMessage(message);
      setLeaving(false);
    });

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, durationMs);
    const removeTimer = window.setTimeout(() => {
      setDisplayMessage(null);
    }, durationMs + 280);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [durationMs, message]);

  if (!displayMessage) return null;

  return (
    <div
      className={cn(
        "rounded-weldoo-sm border px-3 py-2 text-sm font-medium transition-all duration-300 ease-out",
        leaving
          ? "-translate-y-1 opacity-0"
          : "translate-y-0 opacity-100",
        variantClasses[variant],
        className,
      )}
      role="status"
    >
      {displayMessage}
    </div>
  );
}
