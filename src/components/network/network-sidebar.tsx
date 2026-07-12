import Link from "next/link";

type NetworkSidebarProps = {
  email?: string | null;
  profileType?: string | null;
  totalCount: number;
};

function getOwnProfileEditHref(profileType?: string | null) {
  if (profileType === "company") return "/company/edit";
  if (profileType === "training_provider") return "/training-provider/edit";
  return "/profile/edit";
}

export function NetworkSidebar({
  email,
  profileType,
  totalCount,
}: NetworkSidebarProps) {
  const ownProfileEditHref = getOwnProfileEditHref(profileType);

  return (
    <aside className="hidden flex-col gap-3 lg:sticky lg:top-20 lg:flex">
      <section className="overflow-hidden rounded-xl border border-weldoo-border-light bg-white shadow-weldoo-sm transition hover:shadow-[0_4px_16px_rgba(61,61,180,0.09)]">
        <div className="h-16 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
        <div className="px-4 pb-4">
          <div className="-mt-[22px] mb-2.5 flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-base font-bold text-white shadow-weldoo-sm">
            {(email ?? "W").slice(0, 1).toUpperCase()}
          </div>
          <h2 className="mb-0.5 truncate text-[15px] font-bold tracking-[-0.01em] text-weldoo-ink transition hover:text-weldoo-indigo">
            Weldoo Network
          </h2>
          <p className="mb-2.5 text-xs font-normal leading-[1.45] text-[#44446a]">
            Discover welders, companies, and training providers.
          </p>
          <div className="flex flex-col gap-1.5 border-t border-weldoo-border-light pt-2.5 text-xs font-normal text-[#44446a]">
            <div className="flex items-center gap-[7px]">
              <svg aria-hidden="true" className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
              <span>{totalCount} profiles</span>
            </div>
            <div className="flex items-center gap-[7px]">
              <svg aria-hidden="true" className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                <path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
              <span>Updated live</span>
            </div>
          </div>
          <Link
            className="mt-3.5 flex h-9 w-full items-center justify-center rounded-full border-[1.5px] border-[#e0e0ed] bg-transparent text-[13px] font-semibold tracking-[-0.01em] text-[#44446a] transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/5 hover:text-weldoo-indigo"
            href={ownProfileEditHref}
          >
            Edit profile
          </Link>
        </div>
      </section>
    </aside>
  );
}
