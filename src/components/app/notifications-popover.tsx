"use client";

import Link from "next/link";

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-[19px] w-[19px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function NotificationsPopover() {
  return (
    <details className="group relative hidden lg:block">
      <summary
        aria-haspopup="dialog"
        aria-label="Notifications"
        className="relative flex h-[38px] w-[38px] cursor-pointer list-none items-center justify-center rounded-full text-weldoo-muted transition hover:bg-weldoo-bg-strong hover:text-weldoo-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weldoo-indigo [&::-webkit-details-marker]:hidden"
        title="Notifications"
      >
        <BellIcon />
      </summary>
      <div
        aria-label="Notifications"
        className="absolute right-[-8px] top-[48px] z-40 w-[380px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-weldoo-border-light bg-white shadow-weldoo-xl"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-weldoo-border-light px-[18px] pb-3 pt-4">
          <span className="text-[16.5px] font-bold text-weldoo-ink">Notifications</span>
          <Link
            className="text-[12.1px] font-semibold text-weldoo-indigo transition hover:opacity-70"
            href="/notifications"
          >
            View all
          </Link>
        </div>
        <div className="max-h-[440px] overflow-y-auto">
          <Link
            className="flex items-start gap-3 px-[18px] py-4 transition hover:bg-weldoo-bg"
            href="/notifications"
          >
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-weldoo-bg-strong text-weldoo-indigo">
              <BellIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.2px] font-semibold leading-5 text-weldoo-ink">
                No notifications yet
              </span>
              <span className="mt-0.5 block text-[12.1px] leading-5 text-weldoo-muted">
                Updates will appear here when notification delivery is enabled.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </details>
  );
}
