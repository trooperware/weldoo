import type { Metadata } from "next";

import { AppShell } from "@/components/app/app-shell";
import { NetworkDirectory } from "@/components/network/network-directory";
import { NetworkSidebar } from "@/components/network/network-sidebar";
import { getAppShellAuth } from "@/lib/auth/session";
import {
  getNetworkDirectoryPage,
  getNetworkInvitations,
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

export default async function NetworkPage({ searchParams }: NetworkPageProps) {
  const [params, appShellAuth] = await Promise.all([
    searchParams,
    getAppShellAuth(),
  ]);
  const page = parsePage(params.page);
  const filters = getFilters(params);
  const supabase = await createSupabaseServerClient();
  const [directory, invitations] = await Promise.all([
    getNetworkDirectoryPage(supabase, page, filters, appShellAuth?.profileId),
    getNetworkInvitations(supabase, appShellAuth?.profileId),
  ]);

  return (
    <AppShell auth={appShellAuth}>
      <main>
        <section className="mx-auto grid max-w-[1128px] grid-cols-1 items-start gap-6 px-4 pb-20 pt-7 lg:grid-cols-[225px_minmax(0,1fr)]">
          <NetworkSidebar
            email={appShellAuth?.email}
            profileType={appShellAuth?.profileType}
            totalCount={directory.totalCount}
          />

          <NetworkDirectory
            filters={filters}
            invitations={invitations.received}
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
