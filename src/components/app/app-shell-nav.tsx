"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MainNavItem = {
  href: string;
  label: string;
};

type MainNavigationProps = {
  items: MainNavItem[];
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ className = "h-4 w-4", label }: { className?: string; label: string }) {
  const pathClass = "stroke-current";

  if (label === "Home") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path className={pathClass} d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline className={pathClass} points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }

  if (label === "Network") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle className={pathClass} cx="12" cy="5" r="2" />
        <circle className={pathClass} cx="5" cy="19" r="2" />
        <circle className={pathClass} cx="19" cy="19" r="2" />
        <path className={pathClass} d="M12 7v4" />
        <line className={pathClass} x1="9" x2="15" y1="14" y2="14" />
        <path className={pathClass} d="M9.5 13.5 6.5 17" />
        <path className={pathClass} d="M14.5 13.5 17.5 17" />
      </svg>
    );
  }

  if (label === "Events") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <rect className={pathClass} height="18" rx="2" width="18" x="3" y="4" />
        <line className={pathClass} x1="16" x2="16" y1="2" y2="6" />
        <line className={pathClass} x1="8" x2="8" y1="2" y2="6" />
        <line className={pathClass} x1="3" x2="21" y1="10" y2="10" />
      </svg>
    );
  }

  if (label === "Jobs") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <rect className={pathClass} height="14" rx="2" width="20" x="2" y="7" />
        <path className={pathClass} d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path className={pathClass} d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path className={pathClass} d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

export function MainNavigation({ items }: MainNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="hidden overflow-x-auto md:block">
      <ul className="flex min-w-max items-center gap-0.5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <li key={item.label}>
              <Link
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-[7px] rounded-full px-[18px] py-2 text-[13.5px] tracking-[-0.01em] transition ${
                  active
                    ? "bg-[rgba(61,61,180,0.09)] font-semibold text-weldoo-indigo"
                    : "font-medium text-weldoo-ink hover:bg-weldoo-bg-strong"
                }`}
                href={item.href}
              >
                <NavIcon label={item.label} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileBottomNavigation({ items }: MainNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-weldoo-border-light bg-white shadow-[0_-2px_12px_rgba(61,61,180,0.06)] md:hidden"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))", paddingTop: 6 }}
    >
      <ul className="grid w-full grid-cols-5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <li key={item.label} className="min-w-0">
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-[3px] px-1 py-1.5 text-[10px] font-medium leading-none transition ${
                  active ? "text-weldoo-indigo" : "text-weldoo-muted hover:text-weldoo-indigo"
                }`}
                href={item.href}
              >
                <NavIcon className="h-[22px] w-[22px] shrink-0" label={item.label} />
                <span className="truncate leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
