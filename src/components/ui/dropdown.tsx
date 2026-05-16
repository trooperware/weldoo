"use client";

import { useState, type ReactNode } from "react";

type DropdownItem = {
  label: string;
  onSelect?: () => void;
};

type DropdownProps = {
  items: DropdownItem[];
  label: ReactNode;
};

export function Dropdown({ items, label }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        aria-expanded={open}
        className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-white px-4 text-sm font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:bg-weldoo-bg"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {label}
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-lg">
          {items.map((item) => (
            <button
              className="block w-full px-4 py-3 text-left text-sm text-weldoo-slate transition hover:bg-weldoo-bg hover:text-weldoo-ink"
              key={item.label}
              onClick={() => {
                item.onSelect?.();
                setOpen(false);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
