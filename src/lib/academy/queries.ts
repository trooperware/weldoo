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

type TrainingProviderDetail = Pick<
  Tables<"training_providers">,
  "contact_email" | "description" | "id" | "location" | "logo_url" | "name" | "website_url"
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

export type EventFilters = {
  location?: string;
  mode?: "in_person" | "virtual";
  query?: string;
  topic?: string;
};

export type EventsListingResult = {
  items: AcademyItem[];
  totalCount: number;
};

export type AcademyDetail = Pick<
  Tables<"course_events">,
  | "agenda"
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
  | "recording_url"
  | "starts_at"
  | "title"
  | "topics"
  | "type"
  | "welding_processes"
> & {
  provider: TrainingProviderDetail | null;
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

export function parseEventFilters(params: {
  location?: string;
  mode?: string;
  q?: string;
  topic?: string;
}): EventFilters {
  const mode = normalizeFilter(params.mode);

  return {
    location: normalizeFilter(params.location),
    mode: mode === "in_person" || mode === "virtual" ? mode : undefined,
    query: normalizeFilter(params.q),
    topic: normalizeFilter(params.topic),
  };
}

export function getEventsHref(filters: EventFilters) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.location) params.set("location", filters.location);
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.topic) params.set("topic", filters.topic);

  const query = params.toString();
  return query ? `/events?${query}` : "/events";
}

export function hasActiveEventFilters(filters: EventFilters) {
  return Boolean(filters.query || filters.location || filters.mode || filters.topic);
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

export async function getEventsListing(
  supabase: SupabaseClient<Database>,
  filters: EventFilters,
): Promise<EventsListingResult> {
  let query = supabase
    .from("course_events")
    .select(
      "id, training_provider_id, type, level, title, description, topics, welding_processes, location, online_url, external_registration_url, starts_at, ends_at, duration_text, capacity, price_text, published_at, created_at, training_providers(id, name, location, logo_url)",
      { count: "exact" },
    )
    .eq("status", "published")
    .eq("type", "sector_event")
    .order("starts_at", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (filters.query) {
    const like = normalizeLike(filters.query);
    query = query.or(
      `title.ilike.${like},description.ilike.${like},location.ilike.${like},duration_text.ilike.${like},price_text.ilike.${like}`,
    );
  }

  if (filters.location) {
    query = query.ilike("location", normalizeLike(filters.location));
  }

  if (filters.topic) {
    query = query.contains("topics", [filters.topic]);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const items = ((data ?? []) as Array<
    Omit<AcademyItem, "provider"> & {
      training_providers: TrainingProviderSummary | null;
    }
  >).map<AcademyItem>((row) => ({
    ...row,
    provider: row.training_providers,
  })).filter((item) => {
    if (filters.mode === "virtual") return Boolean(item.online_url) || item.location === "Online";
    if (filters.mode === "in_person") return !item.online_url && item.location !== "Online";
    return true;
  });

  return {
    items,
    totalCount: items.length,
  };
}

export async function getPublishedAcademyItemById(
  supabase: SupabaseClient<Database>,
  courseEventId: string,
) {
  const { data, error } = await supabase
    .from("course_events")
    .select(
      "id, training_provider_id, type, level, title, description, agenda, topics, welding_processes, location, online_url, external_registration_url, recording_url, starts_at, ends_at, duration_text, capacity, price_text, published_at, created_at, training_providers(id, name, location, description, website_url, contact_email, logo_url)",
    )
    .eq("id", courseEventId)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as Omit<AcademyDetail, "provider"> & {
    training_providers: TrainingProviderDetail | null;
  };

  return {
    ...row,
    provider: row.training_providers,
  } satisfies AcademyDetail;
}

export async function getSavedCourseEventForCurrentUser(
  supabase: SupabaseClient<Database>,
  courseEventId: string,
  profileId?: string | null,
) {
  if (!profileId) return null;

  const { data, error } = await supabase
    .from("saved_items")
    .select("id")
    .eq("profile_id", profileId)
    .eq("item_type", "course_event")
    .eq("course_event_id", courseEventId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as Pick<Tables<"saved_items">, "id"> | null;
}

export async function getCourseEventInterestForCurrentUser(
  supabase: SupabaseClient<Database>,
  courseEventId: string,
  profileId?: string | null,
) {
  if (!profileId) return null;

  const { data, error } = await supabase
    .from("course_event_interests")
    .select("id, created_at")
    .eq("profile_id", profileId)
    .eq("course_event_id", courseEventId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as Pick<Tables<"course_event_interests">, "created_at" | "id"> | null;
}
