import Link from "next/link";

import { Avatar } from "@/components/ui";

type NetworkSidebarProps = {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  headline?: string | null;
  isAuthenticated?: boolean;
  location?: string | null;
  profileType?: string | null;
};

function getProfileTypeLabel(profileType?: string | null) {
  if (profileType === "company") return "Company";
  if (profileType === "training_provider") return "Training provider";
  if (profileType === "professional") return "Professional";
  return "Weldoo Community";
}

function getOwnProfileEditHref(profileType?: string | null) {
  if (profileType === "company") return "/company/edit";
  if (profileType === "training_provider") return "/training-provider/edit";
  return "/profile/edit";
}

export function NetworkSidebar({
  avatarUrl,
  displayName,
  email,
  headline,
  isAuthenticated = false,
  location,
  profileType,
}: NetworkSidebarProps) {
  const ownProfileEditHref = getOwnProfileEditHref(profileType);
  const resolvedDisplayName = displayName ?? email ?? "Weldoo member";
  const initial = resolvedDisplayName.slice(0, 1).toUpperCase();
  const profileTypeLabel = getProfileTypeLabel(profileType);

  return (
    <aside className="hidden flex-col gap-3 lg:sticky lg:top-20 lg:flex">
      <section className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
        <div className="h-16 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
        <div className="px-4 pb-4">
          <Avatar
            className="-mt-[22px] mb-2.5 h-12 w-12 rounded-weldoo-md text-base shadow-weldoo-sm [&>span]:rounded-weldoo-md"
            initials={initial}
            src={avatarUrl}
          />
          <h2 className="mb-0.5 truncate text-[15px] font-bold tracking-[-0.01em] text-weldoo-ink">
            {resolvedDisplayName}
          </h2>
          <p className="mb-2.5 text-xs font-normal leading-[1.45] text-weldoo-slate">
            {headline ?? profileTypeLabel}
          </p>
          <div className="flex flex-col gap-1.5 border-t border-weldoo-border-light pt-2.5 text-xs font-normal text-weldoo-slate">
            <div className="flex items-center gap-[7px]">
              <svg aria-hidden="true" className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                <path d="M21 10C21 17 12 23 12 23S3 17 3 10A9 9 0 0 1 21 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
              <span>{location ?? "Location not set"}</span>
            </div>
            <div className="flex items-center gap-[7px]">
              <svg aria-hidden="true" className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                <path d="M9 7V5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7M5 7H19V20H5V7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
              </svg>
              <span>{profileTypeLabel}</span>
            </div>
          </div>
          <Link
            className="mt-3.5 flex h-9 w-full items-center justify-center rounded-full border-[1.5px] border-weldoo-border bg-white text-[13px] font-semibold tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/5 hover:text-weldoo-indigo"
            href={isAuthenticated ? ownProfileEditHref : "/auth/sign-in"}
          >
            {isAuthenticated ? "Edit profile" : "Sign in"}
          </Link>
        </div>
      </section>
    </aside>
  );
}
