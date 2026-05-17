import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { ConnectionActionButton } from "@/components/network/connection-action-button";
import { Badge, EmptyState } from "@/components/ui";
import { getAppShellAuth, getCurrentProfile } from "@/lib/auth/session";
import {
  getNetworkDirectoryPage,
  NETWORK_PAGE_SIZE,
  type NetworkDirectoryFilters,
  type NetworkDirectoryItem,
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

function typeBadgeVariant(type: NetworkDirectoryItem["type"]) {
  if (type === "professional") return "default";
  if (type === "company") return "info";
  return "success";
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

function hasActiveFilters(filters: NetworkDirectoryFilters) {
  return Boolean(
    filters.query ||
      filters.type !== "all" ||
      filters.location ||
      filters.process ||
      filters.availability ||
      filters.experience,
  );
}

function getPageHref(filters: NetworkDirectoryFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.location) params.set("location", filters.location);
  if (filters.process) params.set("process", filters.process);
  if (filters.availability) params.set("availability", filters.availability);
  if (filters.experience) params.set("experience", filters.experience);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/network?${query}` : "/network";
}

function getOwnProfileEditHref(profileType?: string | null) {
  if (profileType === "company") return "/company/edit";
  if (profileType === "training_provider") return "/training-provider/edit";
  return "/profile/edit";
}

function getTypeHref(filters: NetworkDirectoryFilters, type: NetworkDirectoryFilters["type"]) {
  return getPageHref({ ...filters, type }, 1);
}

function TypePill({
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
        "inline-flex h-8 items-center rounded-full border-[1.5px] px-4 text-[12.5px] font-medium tracking-[-0.01em] shadow-weldoo-sm transition",
        active
          ? "border-weldoo-indigo bg-weldoo-indigo/[0.08] font-semibold text-weldoo-indigo shadow-[0_0_0_3px_rgba(61,61,180,0.08)]"
          : "border-weldoo-border-light bg-white text-weldoo-slate hover:border-[#c8c8e4] hover:text-weldoo-indigo",
      ].join(" ")}
      href={href}
    >
      {children}
    </Link>
  );
}

function NetworkCard({ item }: { item: NetworkDirectoryItem }) {
  return (
    <article className="group flex flex-col items-center overflow-hidden rounded-[16px] border border-weldoo-border-light bg-white text-center shadow-weldoo-sm transition hover:-translate-y-[3px] hover:border-[#d0d0ea] hover:shadow-[0_8px_32px_rgba(61,61,180,0.12)]">
      <div
        className={[
          "h-[60px] w-full",
          item.type === "professional"
            ? "bg-[linear-gradient(135deg,#1e1e4a,#2a2a6a)]"
            : item.type === "company"
              ? "bg-[linear-gradient(135deg,#0a2a3a,#0e4a5a)]"
              : "bg-[linear-gradient(135deg,#0a2a1a,#0e3a2a)]",
        ].join(" ")}
      />
      <div className="-mt-[26px] mb-2.5">
        <div
          className={[
            "flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-lg font-extrabold text-white",
            item.type === "professional"
              ? "bg-[linear-gradient(135deg,#3d3db4,#5558e8)]"
              : item.type === "company"
                ? "bg-[linear-gradient(135deg,#42b8d4,#2a9ab8)]"
                : "bg-[linear-gradient(135deg,#5ce8b4,#3ac898)]",
          ].join(" ")}
        >
          {item.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-full w-full object-cover" src={item.avatarUrl} />
          ) : (
            item.initials
          )}
        </div>
      </div>

      <div className="w-full px-3.5 pb-4">
        <Badge
          className="mb-2 h-5 px-[9px] text-[9.5px] font-bold uppercase tracking-[0.06em]"
          variant={typeBadgeVariant(item.type)}
        >
          {item.typeLabel}
        </Badge>

        <h2 className="truncate text-[13.5px] font-bold leading-[1.3] tracking-[-0.1px] text-weldoo-ink">
          {item.name}
        </h2>
        <p className="mt-0.5 line-clamp-1 text-[11.5px] font-medium leading-[1.4] text-weldoo-slate">
          {item.description ?? "Weldoo member"}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] leading-[1.4] text-weldoo-muted">
          {item.location ?? "Location not set"}
        </p>

        <div className="mt-2 flex items-center justify-center gap-[5px] text-[11px] text-weldoo-slate">
          <svg
            aria-hidden="true"
            className="h-3 w-3 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <path
              d="M23 21v-2a4 4 0 0 0-3-3.87"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <path
              d="M16 3.13a4 4 0 0 1 0 7.75"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <span>{item.tags.length ? item.tags.length : 1} relevant tag{item.tags.length === 1 ? "" : "s"}</span>
        </div>

        <Link
          className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-full border border-weldoo-border-light bg-white text-[12px] font-semibold tracking-[-0.01em] text-weldoo-muted transition hover:border-weldoo-indigo hover:bg-weldoo-indigo/[0.04] hover:text-weldoo-indigo"
          href={item.href}
        >
          View profile
        </Link>
        <ConnectionActionButton item={item} />
      </div>
    </article>
  );
}

export default async function NetworkPage({ searchParams }: NetworkPageProps) {
  const [params, appShellAuth, currentProfile] = await Promise.all([
    searchParams,
    getAppShellAuth(),
    getCurrentProfile(),
  ]);
  const page = parsePage(params.page);
  const filters = getFilters(params);
  const supabase = await createSupabaseServerClient();
  const directory = await getNetworkDirectoryPage(supabase, page, filters, currentProfile?.id);
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

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[18px] font-extrabold tracking-[-0.3px] text-weldoo-ink">
                <span>{directory.totalCount}</span> professionals
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <TypePill active={filters.type === "all"} href={getTypeHref(filters, "all")}>
                  All
                </TypePill>
                <TypePill
                  active={filters.type === "professional"}
                  href={getTypeHref(filters, "professional")}
                >
                  Professional
                </TypePill>
                <TypePill
                  active={filters.type === "company"}
                  href={getTypeHref(filters, "company")}
                >
                  Company
                </TypePill>
                <TypePill
                  active={filters.type === "training_provider"}
                  href={getTypeHref(filters, "training_provider")}
                >
                  School
                </TypePill>
                <form
                  action="/network"
                  className="flex h-[38px] items-center gap-2 rounded-full border-[1.5px] border-weldoo-border-light bg-white px-4 shadow-weldoo-sm transition focus-within:border-weldoo-indigo focus-within:shadow-[0_0_0_3px_rgba(61,61,180,0.09)]"
                >
                  {filters.type && filters.type !== "all" ? (
                    <input name="type" type="hidden" value={filters.type} />
                  ) : null}
                  <svg aria-hidden="true" className="h-[15px] w-[15px] shrink-0 text-weldoo-muted" fill="none" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <line x1="21" x2="16.65" y1="21" y2="16.65" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <input
                    className="w-[180px] bg-transparent text-[13px] text-weldoo-ink outline-none placeholder:text-[#b0b0cc]"
                    defaultValue={filters.query ?? ""}
                    name="q"
                    placeholder="Search by name or role..."
                    type="search"
                  />
                </form>
                <details className="relative">
                  <summary className="inline-flex h-8 cursor-pointer list-none items-center rounded-full border-[1.5px] border-weldoo-border-light bg-white px-4 text-[12.5px] font-medium tracking-[-0.01em] text-weldoo-slate shadow-weldoo-sm transition hover:border-[#c8c8e4] hover:text-weldoo-indigo">
                    Filters
                  </summary>
                  <div className="absolute right-0 top-10 z-20 w-[min(640px,calc(100vw-32px))] rounded-weldoo-md border border-weldoo-border-light bg-white p-4 text-sm shadow-weldoo-lg">
                    <form action="/network" className="grid gap-3 md:grid-cols-4">
                      {filters.query ? <input name="q" type="hidden" value={filters.query} /> : null}
                      {filters.type && filters.type !== "all" ? (
                        <input name="type" type="hidden" value={filters.type} />
                      ) : null}
                      <input
                        className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none"
                        defaultValue={filters.location ?? ""}
                        name="location"
                        placeholder="Location"
                        type="search"
                      />
                      <input
                        className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none"
                        defaultValue={filters.process ?? ""}
                        name="process"
                        placeholder="Welding process"
                        type="search"
                      />
                      <select
                        className="h-10 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none"
                        defaultValue={filters.availability ?? ""}
                        name="availability"
                      >
                        <option value="">Any availability</option>
                        <option value="available">Available</option>
                        <option value="open_to_opportunities">Open to opportunities</option>
                        <option value="not_available">Not available</option>
                      </select>
                      <div className="flex gap-2">
                        <select
                          className="h-10 min-w-0 flex-1 rounded-weldoo-sm border border-weldoo-border-light bg-weldoo-bg px-3 text-sm outline-none"
                          defaultValue={filters.experience ?? ""}
                          name="experience"
                        >
                          <option value="">Any experience</option>
                          <option value="0-2">0-2 years</option>
                          <option value="3-5">3-5 years</option>
                          <option value="6-10">6-10 years</option>
                          <option value="10+">10+ years</option>
                        </select>
                        <button className="h-10 rounded-weldoo-sm bg-weldoo-indigo px-4 text-sm font-semibold text-white" type="submit">
                          Apply
                        </button>
                      </div>
                    </form>
                    {hasActiveFilters(filters) ? (
                      <Link className="mt-3 inline-flex text-[12.5px] font-semibold text-weldoo-indigo" href="/network">
                        Clear filters
                      </Link>
                    ) : null}
                  </div>
                </details>
              </div>
            </div>

          {directory.items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {directory.items.map((item) => (
                <NetworkCard item={item} key={`${item.type}-${item.id}`} />
              ))}
            </div>
          ) : (
            <EmptyState
              description="Profiles will appear here once users complete onboarding and publish their professional, company, or training provider profile."
              title="No profiles yet"
            />
          )}

          <nav
            aria-label="Network pagination"
            className="mt-6 flex items-center justify-between gap-3"
          >
            {page > 1 ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-weldoo-sm border border-weldoo-border bg-white px-4 text-sm font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                href={getPageHref(filters, page - 1)}
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-xs font-semibold text-weldoo-muted">
              Page {directory.page} of {directory.totalPages} · {NETWORK_PAGE_SIZE} profiles
              per page
            </span>
            {page < directory.totalPages ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-weldoo-sm border border-weldoo-border bg-white px-4 text-sm font-semibold text-weldoo-slate shadow-weldoo-sm transition hover:border-weldoo-indigo hover:text-weldoo-indigo"
                href={getPageHref(filters, page + 1)}
              >
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
