import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

export const NETWORK_PAGE_SIZE = 12;

type ProfessionalProfileRow = Tables<"professional_profiles">;
type ProfileRow = Tables<"profiles">;
type CompanyRow = Tables<"companies">;
type TrainingProviderRow = Tables<"training_providers">;

export type NetworkDirectoryFilters = {
  availability?: string;
  experience?: string;
  location?: string;
  process?: string;
  query?: string;
  type?: "all" | "professional" | "company" | "training_provider";
};

export type NetworkDirectoryItem = {
  avatarUrl: string | null;
  canConnect: boolean;
  connectionId: string | null;
  connectionStatus: "none" | "pending_sent" | "pending_received" | "accepted";
  createdAt: string;
  description: string | null;
  href: string;
  id: string;
  initials: string;
  location: string | null;
  name: string;
  tags: string[];
  targetProfileId: string;
  type: "professional" | "company" | "training_provider";
  typeLabel: string;
};

type DirectoryQueryResult = {
  items: NetworkDirectoryItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

function compactTags(values: Array<string | null | undefined>, limit = 4) {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.replaceAll("_", " "))
    .slice(0, limit);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.slice(0, 1).toUpperCase()).join("") || "W";
}

function normalizeFilter(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 120) : undefined;
}

function normalizeLike(value: string) {
  return `%${value.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
}

function emptyResult<T>() {
  return {
    count: 0,
    data: [] as T[],
    error: null,
  };
}

function professionalToItem(
  profile: Pick<
    ProfileRow,
    "avatar_url" | "created_at" | "display_name" | "headline" | "id" | "location"
  >,
  details: ProfessionalProfileRow | null,
): NetworkDirectoryItem {
  return {
    avatarUrl: profile.avatar_url,
    canConnect: false,
    connectionId: null,
    connectionStatus: "none",
    createdAt: profile.created_at,
    description: profile.headline,
    href: `/professionals/${profile.id}`,
    id: profile.id,
    initials: getInitials(profile.display_name),
    location: profile.location,
    name: profile.display_name,
    tags: compactTags([
      details?.availability,
      ...(details?.welding_processes ?? []),
      ...(details?.materials ?? []),
    ]),
    targetProfileId: profile.id,
    type: "professional",
    typeLabel: "Professional",
  };
}

function companyToItem(company: CompanyRow): NetworkDirectoryItem {
  return {
    avatarUrl: company.logo_url,
    canConnect: false,
    connectionId: null,
    connectionStatus: "none",
    createdAt: company.created_at,
    description: company.sector,
    href: `/companies/${company.id}`,
    id: company.id,
    initials: getInitials(company.name),
    location: company.location,
    name: company.name,
    tags: compactTags([company.sector, company.company_size]),
    targetProfileId: company.owner_profile_id,
    type: "company",
    typeLabel: "Company",
  };
}

function trainingProviderToItem(provider: TrainingProviderRow): NetworkDirectoryItem {
  return {
    avatarUrl: provider.logo_url,
    canConnect: false,
    connectionId: null,
    connectionStatus: "none",
    createdAt: provider.created_at,
    description: provider.training_types.length
      ? provider.training_types.join(", ")
      : "Training provider",
    href: `/training-providers/${provider.id}`,
    id: provider.id,
    initials: getInitials(provider.name),
    location: provider.location,
    name: provider.name,
    tags: compactTags(provider.training_types),
    targetProfileId: provider.owner_profile_id,
    type: "training_provider",
    typeLabel: "Training provider",
  };
}

export async function getNetworkDirectoryPage(
  supabase: SupabaseClient<Database>,
  page: number,
  filters: NetworkDirectoryFilters = {},
  currentProfileId?: string | null,
): Promise<DirectoryQueryResult> {
  const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const fetchLimit = normalizedPage * NETWORK_PAGE_SIZE;
  const query = normalizeFilter(filters.query);
  const location = normalizeFilter(filters.location);
  const process = normalizeFilter(filters.process);
  const availability = normalizeFilter(filters.availability);
  const experience = normalizeFilter(filters.experience);
  const type = filters.type ?? "all";

  const includeProfessionals = type === "all" || type === "professional";
  const includeCompanies =
    (type === "all" || type === "company") && !process && !availability && !experience;
  const includeTrainingProviders =
    (type === "all" || type === "training_provider") &&
    !process &&
    !availability &&
    !experience;

  let professionalProfilesQuery = supabase
    .from("profiles")
    .select("id, display_name, headline, location, avatar_url, created_at", {
      count: "exact",
    })
    .eq("profile_type", "professional")
    .eq("status", "active")
    .eq("onboarding_completed", true)
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  if (query) {
    const like = normalizeLike(query);
    professionalProfilesQuery = professionalProfilesQuery.or(
      `display_name.ilike.${like},headline.ilike.${like},location.ilike.${like}`,
    );
  }
  if (location) {
    professionalProfilesQuery = professionalProfilesQuery.ilike(
      "location",
      normalizeLike(location),
    );
  }

  let professionalDetailsQuery = supabase
    .from("professional_profiles")
    .select(
      "profile_id, years_experience, availability, welding_processes, materials, positions, certifications, work_preferences, travel_availability, created_at, updated_at",
    );

  if (process) {
    professionalDetailsQuery = professionalDetailsQuery.contains("welding_processes", [
      process,
    ]);
  }
  if (availability) {
    professionalDetailsQuery = professionalDetailsQuery.eq("availability", availability);
  }
  if (experience === "0-2") {
    professionalDetailsQuery = professionalDetailsQuery
      .gte("years_experience", 0)
      .lte("years_experience", 2);
  }
  if (experience === "3-5") {
    professionalDetailsQuery = professionalDetailsQuery
      .gte("years_experience", 3)
      .lte("years_experience", 5);
  }
  if (experience === "6-10") {
    professionalDetailsQuery = professionalDetailsQuery
      .gte("years_experience", 6)
      .lte("years_experience", 10);
  }
  if (experience === "10+") {
    professionalDetailsQuery = professionalDetailsQuery.gte("years_experience", 10);
  }

  let companiesQuery = supabase
    .from("companies")
    .select(
      "id, owner_profile_id, name, sector, company_size, location, description, website_url, contact_email, logo_url, cover_url, created_at, updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  if (query) {
    const like = normalizeLike(query);
    companiesQuery = companiesQuery.or(
      `name.ilike.${like},sector.ilike.${like},location.ilike.${like},description.ilike.${like}`,
    );
  }
  if (location) {
    companiesQuery = companiesQuery.ilike("location", normalizeLike(location));
  }

  let trainingProvidersQuery = supabase
    .from("training_providers")
    .select(
      "id, owner_profile_id, name, location, description, website_url, contact_email, training_types, logo_url, cover_url, created_at, updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  if (query) {
    const like = normalizeLike(query);
    trainingProvidersQuery = trainingProvidersQuery.or(
      `name.ilike.${like},location.ilike.${like},description.ilike.${like}`,
    );
  }
  if (location) {
    trainingProvidersQuery = trainingProvidersQuery.ilike(
      "location",
      normalizeLike(location),
    );
  }

  const [
    professionalProfilesResult,
    professionalDetailsResult,
    companiesResult,
    trainingProvidersResult,
  ] = await Promise.all([
    includeProfessionals
      ? professionalProfilesQuery
      : Promise.resolve(emptyResult<ProfileRow>()),
    includeProfessionals
      ? professionalDetailsQuery
      : Promise.resolve(emptyResult<ProfessionalProfileRow>()),
    includeCompanies ? companiesQuery : Promise.resolve(emptyResult<CompanyRow>()),
    includeTrainingProviders
      ? trainingProvidersQuery
      : Promise.resolve(emptyResult<TrainingProviderRow>()),
  ]);

  if (professionalProfilesResult.error) {
    throw new Error(professionalProfilesResult.error.message);
  }
  if (professionalDetailsResult.error) {
    throw new Error(professionalDetailsResult.error.message);
  }
  if (companiesResult.error) {
    throw new Error(companiesResult.error.message);
  }
  if (trainingProvidersResult.error) {
    throw new Error(trainingProvidersResult.error.message);
  }

  const professionalDetailsRows =
    (professionalDetailsResult.data ?? []) as ProfessionalProfileRow[];
  const professionalDetailsById = professionalDetailsRows.reduce<
    Record<string, ProfessionalProfileRow>
  >((accumulator, profile) => {
    accumulator[profile.profile_id] = profile;
    return accumulator;
  }, {});
  const filteredProfessionalIds =
    process || availability || experience
      ? new Set(professionalDetailsRows.map((profile) => profile.profile_id))
      : null;

  const professionals = ((professionalProfilesResult.data ?? []) as Array<
    Pick<
      ProfileRow,
      "avatar_url" | "created_at" | "display_name" | "headline" | "id" | "location"
    >
  >)
    .filter((profile) => !filteredProfessionalIds || filteredProfessionalIds.has(profile.id))
    .map((profile) =>
      professionalToItem(profile, professionalDetailsById[profile.id] ?? null),
    );

  const companies = ((companiesResult.data ?? []) as CompanyRow[]).map(companyToItem);
  const trainingProviders = (
    (trainingProvidersResult.data ?? []) as TrainingProviderRow[]
  ).map(trainingProviderToItem);

  const allItems = [...professionals, ...companies, ...trainingProviders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const browsableItems = currentProfileId
    ? allItems.filter((item) => item.targetProfileId !== currentProfileId)
    : allItems;
  const visibleItems = browsableItems.slice(
    (normalizedPage - 1) * NETWORK_PAGE_SIZE,
    (normalizedPage - 1) * NETWORK_PAGE_SIZE + NETWORK_PAGE_SIZE,
  );

  if (currentProfileId && visibleItems.length) {
    const targetProfileIds = visibleItems
      .map((item) => item.targetProfileId)
      .filter((targetProfileId) => targetProfileId !== currentProfileId);

    if (targetProfileIds.length) {
      const { data, error } = await supabase
        .from("connections")
        .select("id, requester_profile_id, recipient_profile_id, status")
        .or(
          `and(requester_profile_id.eq.${currentProfileId},recipient_profile_id.in.(${targetProfileIds.join(",")})),and(recipient_profile_id.eq.${currentProfileId},requester_profile_id.in.(${targetProfileIds.join(",")}))`,
        )
        .in("status", ["pending", "accepted"]);

      if (error) {
        throw new Error(error.message);
      }

      const connectionsByProfileId = ((data ?? []) as Array<{
        id: string;
        recipient_profile_id: string;
        requester_profile_id: string;
        status: "accepted" | "pending";
      }>).reduce<
        Record<
          string,
          {
            id: string;
            recipient_profile_id: string;
            requester_profile_id: string;
            status: "accepted" | "pending";
          }
        >
      >((accumulator, connection) => {
        const otherProfileId =
          connection.requester_profile_id === currentProfileId
            ? connection.recipient_profile_id
            : connection.requester_profile_id;
        accumulator[otherProfileId] = connection;
        return accumulator;
      }, {});

      visibleItems.forEach((item) => {
        item.canConnect = item.targetProfileId !== currentProfileId;
        const connection = connectionsByProfileId[item.targetProfileId];

        if (!connection) return;

        item.connectionId = connection.id;
        if (connection.status === "accepted") {
          item.connectionStatus = "accepted";
          return;
        }

        item.connectionStatus =
          connection.requester_profile_id === currentProfileId
            ? "pending_sent"
            : "pending_received";
      });
    }

    visibleItems.forEach((item) => {
      if (item.targetProfileId !== currentProfileId) {
        item.canConnect = true;
      }
    });
  }

  const professionalCount = filteredProfessionalIds
    ? professionals.length
    : (professionalProfilesResult.count ?? 0);
  const ownItemsCount = currentProfileId
    ? allItems.filter((item) => item.targetProfileId === currentProfileId).length
    : 0;
  const totalCount = Math.max(
    0,
    professionalCount +
      (companiesResult.count ?? 0) +
      (trainingProvidersResult.count ?? 0) -
      ownItemsCount,
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / NETWORK_PAGE_SIZE));
  return {
    items: visibleItems,
    page: normalizedPage,
    pageSize: NETWORK_PAGE_SIZE,
    totalCount,
    totalPages,
  };
}
