"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type ModalProps = {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

export function Modal({
  children,
  description,
  footer,
  onOpenChange,
  open,
  title,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-weldoo-ink/35 p-4 backdrop-blur-[2px]"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-xl">
        <div className="border-b border-weldoo-border-light p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm leading-6 text-weldoo-muted">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              aria-label="Close modal"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg hover:text-weldoo-ink"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex justify-end gap-3 border-t border-weldoo-border-light px-5 py-4">
          {footer ?? (
            <>
              <Button onClick={() => onOpenChange(false)} variant="ghost">
                Cancel
              </Button>
              <Button onClick={() => onOpenChange(false)}>Confirm</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
