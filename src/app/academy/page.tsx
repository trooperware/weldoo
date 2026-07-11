import type { Metadata } from "next";
import Link from "next/link";

import { AcademyListing } from "@/components/academy/academy-listing";
import { AppShell } from "@/components/app/app-shell";
import { getAppShellAuth } from "@/lib/auth/session";
import {
  getAcademyListing,
  parseAcademyFilters,
  type AcademyItem,
} from "@/lib/academy/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Discover welding courses, webinars, workshops, and sector events.",
  title: "Academy | Weldoo",
};

type AcademyPageProps = {
  searchParams: Promise<{
    level?: string;
    location?: string;
    process?: string;
    provider?: string;
    q?: string;
    topic?: string;
    type?: string;
  }>;
};

function getOwnProfileEditHref(profileType?: string | null) {
  if (profileType === "company") return "/company/edit";
  if (profileType === "training_provider") return "/training-provider/edit";
  return "/profile/edit";
}

function AcademyTypeIcon({
  className = "h-3 w-3",
  type,
}: {
  className?: string;
  type: AcademyItem["type"] | "in_person";
}) {
  if (type === "online_course") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="20" x="2" y="3" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "webinar") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <path d="m23 7-7 5 7 5V7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <rect height="14" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="15" x="1" y="5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default async function AcademyPage({ searchParams }: AcademyPageProps) {
  const [params, appShellAuth] = await Promise.all([searchParams, getAppShellAuth()]);
  const filters = parseAcademyFilters(params);
  const supabase = await createSupabaseServerClient();
  const listing = await getAcademyListing(supabase, { ...filters, type: undefined });
  const ownProfileEditHref = getOwnProfileEditHref(appShellAuth?.profileType);

  return (
    <AppShell auth={appShellAuth}>
      <main>
        <section className="mx-auto grid max-w-[1128px] grid-cols-1 items-start gap-6 px-4 pb-20 pt-7 lg:grid-cols-[225px_minmax(0,1fr)]">
          <aside className="hidden flex-col gap-3 lg:sticky lg:top-20 lg:flex">
            <section className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm">
              <div className="h-16 bg-[linear-gradient(135deg,#2a2a8a_0%,#3d3db4_35%,#42b8d4_70%,#5ce8b4_100%)]" />
              <div className="px-4 pb-4">
                <div className="-mt-[22px] mb-2.5 flex h-12 w-12 items-center justify-center rounded-weldoo-md bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-base font-bold text-white shadow-weldoo-sm">
                  {(appShellAuth?.email ?? "W").slice(0, 1).toUpperCase()}
                </div>
                <h2 className="mb-0.5 truncate text-[15px] font-bold tracking-[-0.01em] text-weldoo-ink">
                  Weldoo Academy
                </h2>
                <p className="mb-2.5 text-xs font-normal leading-[1.45] text-weldoo-slate">
                  Courses, webinars, and training events for welders.
                </p>
                <div className="flex flex-col gap-1.5 border-t border-weldoo-border-light pt-2.5 text-xs font-normal text-weldoo-slate">
                  <div className="flex items-center gap-[7px]">
                    <AcademyTypeIcon className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" type="online_course" />
                    <span>{listing.totalCount} courses</span>
                  </div>
                  <div className="flex items-center gap-[7px]">
                    <ClockIcon className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" />
                    <span>Updated live</span>
                  </div>
                </div>
                <Link
                  className="mt-3.5 flex h-9 w-full items-center justify-center rounded-full border-[1.5px] border-weldoo-border bg-white text-[13px] font-semibold tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/5 hover:text-weldoo-indigo"
                  href={ownProfileEditHref}
                >
                  Edit profile
                </Link>
              </div>
            </section>
          </aside>

          <AcademyListing filters={filters} items={listing.items} />
        </section>
      </main>
    </AppShell>
  );
}
