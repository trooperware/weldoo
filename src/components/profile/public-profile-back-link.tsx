import Link from "next/link";

export function PublicProfileBackLink() {
  return (
    <div className="mx-auto mb-4 max-w-[780px]">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--weldoo-muted)] transition hover:text-[var(--weldoo-indigo)] hover:underline"
        href="/network"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
          <path
            d="M19 12H5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="m12 19-7-7 7-7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        Back to network
      </Link>
    </div>
  );
}
