"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type ModalProps = {
  children: ReactNode;
  description?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

export function Modal({
  children,
  description,
  onOpenChange,
  open,
  title,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-weldoo-ink/40 p-4"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-weldoo-lg border border-weldoo-border-light bg-white shadow-weldoo-xl">
        <div className="border-b border-weldoo-border-light p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm leading-6 text-weldoo-muted">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              aria-label="Close modal"
              className="rounded-full px-2 py-1 text-weldoo-muted hover:bg-weldoo-bg hover:text-weldoo-ink"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              x
            </button>
          </div>
        </div>
        <div className="p-6">{children}</div>
        <div className="flex justify-end gap-3 border-t border-weldoo-border-light p-4">
          <Button onClick={() => onOpenChange(false)} variant="ghost">
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
