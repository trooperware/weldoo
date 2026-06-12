"use client";

import { useEffect } from "react";

const POPOVER_SELECTOR = "details[data-weldoo-popover]";

function closePopover(popover: HTMLDetailsElement) {
  popover.open = false;
}

export function PopoverDismissListener() {
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      document.querySelectorAll<HTMLDetailsElement>(POPOVER_SELECTOR).forEach((popover) => {
        if (!popover.open || popover.contains(target)) {
          return;
        }

        closePopover(popover);
      });
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      document.querySelectorAll<HTMLDetailsElement>(POPOVER_SELECTOR).forEach(closePopover);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
