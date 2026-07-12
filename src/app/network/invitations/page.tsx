import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { NetworkInvitationsList } from "@/components/network/network-invitations";
import { getAppShellAuth } from "@/lib/auth/session";
import { getNetworkInvitations } from "@/lib/network/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Manage your Weldoo network invitations.",
  title: "Invitations | Weldoo",
};

type NetworkInvitationsPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

function TabLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      className={[
        "-mb-[2px] border-b-[2.5px] px-5 py-2.5 text-sm font-semibold transition",
        active
          ? "border-weldoo-indigo text-weldoo-indigo"
          : "border-transparent text-weldoo-muted hover:text-weldoo-ink",
      ].join(" ")}
      href={href}
    >
      {children}
    </Link>
  );
}

export default async function NetworkInvitationsPage({
  searchParams,
}: NetworkInvitationsPageProps) {
  const [params, appShellAuth] = await Promise.all([
    searchParams,
    getAppShellAuth(),
  ]);

  if (!appShellAuth?.profileId) {
    redirect("/auth/sign-in");
  }

  const activeTab = params.tab === "sent" ? "sent" : "received";
  const supabase = await createSupabaseServerClient();
  const invitations = await getNetworkInvitations(supabase, appShellAuth.profileId);
  const visibleInvitations =
    activeTab === "sent" ? invitations.sent : invitations.received;

  return (
    <AppShell auth={appShellAuth}>
      <main className="px-4 pb-20 pt-7 sm:px-6">
        <div className="mx-auto max-w-[680px]">
          <Link
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-weldoo-muted transition hover:text-weldoo-indigo hover:underline"
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

          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-[18px] font-bold text-weldoo-ink">
              Manage invitations
            </h1>
          </div>

          <section className="rounded-xl border border-weldoo-border-light bg-white px-6 py-5 shadow-weldoo-sm">
            <div className="mb-5 flex border-b-2 border-weldoo-border-light">
              <TabLink active={activeTab === "received"} href="/network/invitations">
                Received{" "}
                <span className="text-xs font-medium text-weldoo-muted">
                  ({invitations.received.length})
                </span>
              </TabLink>
              <TabLink active={activeTab === "sent"} href="/network/invitations?tab=sent">
                Sent{" "}
                <span className="text-xs font-medium text-weldoo-muted">
                  ({invitations.sent.length})
                </span>
              </TabLink>
            </div>

            <NetworkInvitationsList
              invitations={visibleInvitations}
              mode={activeTab}
            />
          </section>
        </div>
      </main>
    </AppShell>
  );
}
