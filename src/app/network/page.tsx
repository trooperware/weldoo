import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { NetworkDirectory } from "@/components/network/network-directory";
import { getAppShellAuth } from "@/lib/auth/session";
import {
  getNetworkDirectoryPage,
  type NetworkDirectoryFilters,
} from "@/lib/network/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Discover welders, companies, and training providers on Weldoo.",
  title: "Network | Weldoo",
};

type NetworkPageProps = {
  searchParams: Promise<{
    availability?: string;
    experience?: string;
    location?: string;
    page?: string;
    process?: string;
    q?: string;
    type?: string;
  }>;
};

function parsePage(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function normalizeOption(value?: string) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function getFilters(
  params: Awaited<NetworkPageProps["searchParams"]>,
): NetworkDirectoryFilters {
  const type = normalizeOption(params.type);

  return {
    availability: normalizeOption(params.availability),
    experience: normalizeOption(params.experience),
    location: normalizeOption(params.location),
    process: normalizeOption(params.process),
    query: normalizeOption(params.q),
    type:
      type === "professional" || type === "company" || type === "training_provider"
        ? type
        : "all",
  };
}

function getOwnProfileEditHref(profileType?: string | null) {
  if (profileType === "company") return "/company/edit";
  if (profileType === "training_provider") return "/training-provider/edit";
  return "/profile/edit";
}

export default async function NetworkPage({ searchParams }: NetworkPageProps) {
  const [params, appShellAuth] = await Promise.all([
    searchParams,
    getAppShellAuth(),
  ]);
  const page = parsePage(params.page);
  const filters = getFilters(params);
  const supabase = await createSupabaseServerClient();
  const directory = await getNetworkDirectoryPage(supabase, page, filters, appShellAuth?.profileId);
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
                  Weldoo Network
                </h2>
                <p className="mb-2.5 text-xs font-normal leading-[1.45] text-weldoo-slate">
                  Discover welders, companies, and training providers.
                </p>
                <div className="flex flex-col gap-1.5 border-t border-weldoo-border-light pt-2.5 text-xs font-normal text-weldoo-slate">
                  <div className="flex items-center gap-[7px]">
                    <svg aria-hidden="true" className="h-[13px] w-[13px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                    <span>{directory.totalCount} profiles</span>
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
                  className="mt-3.5 flex h-9 w-full items-center justify-center rounded-full border-[1.5px] border-weldoo-border bg-white text-[13px] font-semibold tracking-[-0.01em] text-weldoo-slate transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/5 hover:text-weldoo-indigo"
                  href={ownProfileEditHref}
                >
                  Edit profile
                </Link>
              </div>
            </section>
          </aside>

          <NetworkDirectory
            currentProfileId={appShellAuth?.profileId}
            filters={filters}
            items={directory.items}
            page={directory.page}
            totalCount={directory.totalCount}
            totalPages={directory.totalPages}
          />
        </section>
      </main>
    </AppShell>
  );
}
