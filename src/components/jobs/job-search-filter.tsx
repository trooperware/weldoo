"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function applyInstantJobSearch(query: string) {
  const normalizedQuery = normalizeSearch(query);
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-job-card]"));
  let visibleCount = 0;

  cards.forEach((card) => {
    const searchText = card.dataset.searchText ?? card.textContent ?? "";
    const visible = !normalizedQuery || searchText.includes(normalizedQuery);

    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  const count = document.querySelector<HTMLElement>("[data-jobs-results-count]");
  if (count) {
    count.textContent = `${visibleCount} results`;
  }
}

export function JobSearchFilter({ defaultValue = "" }: { defaultValue?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    applyInstantJobSearch(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextQuery = value.trim();
      const currentQuery = searchParams.get("q") ?? "";

      if (nextQuery === currentQuery) return;

      const params = new URLSearchParams(searchParams.toString());

      if (nextQuery) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }

      params.delete("job");
      const queryString = params.toString();

      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }, 750);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams, value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      action="/jobs"
      className="flex h-10 w-full items-center gap-2 rounded-full border-[1.5px] border-weldoo-border-light bg-white px-4 shadow-weldoo-sm transition focus-within:border-weldoo-indigo focus-within:shadow-[0_0_0_3px_rgba(61,61,180,0.09)] sm:w-[200px]"
      onSubmit={handleSubmit}
    >
      <svg
        aria-hidden="true"
        className="h-[15px] w-[15px] shrink-0 text-weldoo-muted"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          cx="11"
          cy="11"
          r="8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <line
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          x1="21"
          x2="16.65"
          y1="21"
          y2="16.65"
        />
      </svg>
      <input
        aria-label="Search jobs"
        className="min-w-0 flex-1 bg-transparent text-[13px] text-weldoo-ink outline-none placeholder:text-[#b0b0cc]"
        name="q"
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          applyInstantJobSearch(nextValue);
        }}
        placeholder="Search jobs..."
        type="search"
        value={value}
      />
    </form>
  );
}
