"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type TabItem = {
  content: ReactNode;
  id: string;
  label: string;
};

type TabsProps = {
  defaultValue?: string;
  items: TabItem[];
};

export function Tabs({ defaultValue, items }: TabsProps) {
  const [active, setActive] = useState(defaultValue ?? items[0]?.id);
  const activeItem = items.find((item) => item.id === active);

  return (
    <div>
      <div className="flex gap-2 border-b border-weldoo-border-light">
        {items.map((item) => (
          <button
            aria-selected={item.id === active}
            className={cn(
              "border-b-2 px-1 pb-3 text-sm font-semibold transition",
              item.id === active
                ? "border-weldoo-indigo text-weldoo-ink"
                : "border-transparent text-weldoo-muted hover:text-weldoo-ink",
            )}
            key={item.id}
            onClick={() => setActive(item.id)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pt-5" role="tabpanel">
        {activeItem?.content}
      </div>
    </div>
  );
}
