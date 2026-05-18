import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Enums, Tables } from "@/types/database";

export type AcademyFilters = {
  level?: Enums<"course_level">;
  location?: string;
  process?: string;
  provider?: string;
  query?: string;
  topic?: string;
  type?: Enums<"course_event_type">;
};

type TrainingProviderSummary = Pick<
  Tables<"training_providers">,
  "id" | "location" | "logo_url" | "name"
>;

export type AcademyItem = Pick<
  Tables<"course_events">,
  | "capacity"
  | "created_at"
  | "description"
  | "duration_text"
  | "ends_at"
  | "external_registration_url"
  | "id"
  | "level"
  | "location"
  | "online_url"
  | "price_text"
  | "published_at"
  | "starts_at"
  | "title"
  | "topics"
  | "type"
  | "welding_processes"
> & {
  provider: TrainingProviderSummary | null;
};

export type AcademyListingResult = {
  items: AcademyItem[];
  totalCount: number;
};

const courseTypes = [
  "online_course",
  "webinar",
  "in_person_course",
  "workshop",
  "sector_event",
] as const;
const courseLevels = ["basic", "intermediate", "advanced"] as const;

function normalizeFilter(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 120) : undefined;
}

function normalizeLike(value: string) {
  return `%${value.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
}

function isCourseType(value?: string): value is Enums<"course_event_type"> {
  return courseTypes.includes(value as Enums<"course_event_type">);
}

function isCourseLevel(value?: string): value is Enums<"course_level"> {
  return courseLevels.includes(value as Enums<"course_level">);
}

export function parseAcademyFilters(params: {
  level?: string;
  location?: string;
  process?: string;
  provider?: string;
  q?: string;
  topic?: string;
  type?: string;
}): AcademyFilters {
  const type = normalizeFilter(params.type);
  const level = normalizeFilter(params.level);

  return {
    level: isCourseLevel(level) ? level : undefined,
    location: normalizeFilter(params.location),
    process: normalizeFilter(params.process),
    provider: normalizeFilter(params.provider),
    query: normalizeFilter(params.q),
    topic: normalizeFilter(params.topic),
    type: isCourseType(type) ? type : undefined,
  };
}

export function getAcademyHref(filters: AcademyFilters) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.type) params.set("type", filters.type);
  if (filters.level) params.set("level", filters.level);
  if (filters.location) params.set("location", filters.location);
  if (filters.process) params.set("process", filters.process);
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.provider) params.set("provider", filters.provider);

  const query = params.toString();
  return query ? `/academy?${query}` : "/academy";
}

export function hasActiveAcademyFilters(filters: AcademyFilters) {
  return Boolean(
    filters.query ||
      filters.type ||
      filters.level ||
      filters.location ||
      filters.process ||
      filters.topic ||
      filters.provider,
  );
}

export async function getAcademyListing(
  supabase: SupabaseClient<Database>,
  filters: AcademyFilters,
): Promise<AcademyListingResult> {
  let query = supabase
    .from("course_events")
    .select(
      "id, training_provider_id, type, level, title, description, topics, welding_processes, location, online_url, external_registration_url, starts_at, ends_at, duration_text, capacity, price_text, published_at, created_at, training_providers(id, name, location, logo_url)",
      { count: "exact" },
    )
    .eq("status", "published")
    .order("starts_at", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (filters.query) {
    const like = normalizeLike(filters.query);
    query = query.or(
      `title.ilike.${like},description.ilike.${like},location.ilike.${like},duration_text.ilike.${like},price_text.ilike.${like}`,
    );
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  if (filters.level) {
    query = query.eq("level", filters.level);
  }

  if (filters.location) {
    query = query.ilike("location", normalizeLike(filters.location));
  }

  if (filters.process) {
    query = query.contains("welding_processes", [filters.process]);
  }

  if (filters.topic) {
    query = query.contains("topics", [filters.topic]);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const providerFilter = filters.provider?.toLowerCase();
  const items = ((data ?? []) as Array<
    Omit<AcademyItem, "provider"> & {
      training_providers: TrainingProviderSummary | null;
    }
  >)
    .map<AcademyItem>((row) => ({
      ...row,
      provider: row.training_providers,
    }))
    .filter((item) =>
      providerFilter ? item.provider?.name.toLowerCase().includes(providerFilter) : true,
    );

  return {
    items,
    totalCount: items.length,
  };
}
