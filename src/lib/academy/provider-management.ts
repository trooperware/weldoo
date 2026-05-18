import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

export type TrainingProviderForAcademy = Pick<
  Tables<"training_providers">,
  "id" | "location" | "name"
>;

export type TrainingProviderCourseEvent = Pick<
  Tables<"course_events">,
  | "agenda"
  | "archived_at"
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
  | "status"
  | "title"
  | "topics"
  | "type"
  | "welding_processes"
>;

type InterestedProfileSummary = Pick<
  Tables<"profiles">,
  "display_name" | "headline" | "id" | "location" | "profile_type"
>;

type InterestedCourseSummary = Pick<
  Tables<"course_events">,
  "id" | "starts_at" | "status" | "title" | "type"
>;

export type TrainingProviderCourseInterest = Pick<
  Tables<"course_event_interests">,
  "created_at" | "id" | "note"
> & {
  courseEvent: InterestedCourseSummary | null;
  profile: InterestedProfileSummary | null;
};

export async function getOwnedTrainingProviderForAcademy(
  supabase: SupabaseClient<Database>,
  profileId: string,
) {
  const { data, error } = await supabase
    .from("training_providers")
    .select("id, name, location")
    .eq("owner_profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as TrainingProviderForAcademy | null;
}

export async function getTrainingProviderCourseEvents(
  supabase: SupabaseClient<Database>,
  trainingProviderId: string,
) {
  const { data, error } = await supabase
    .from("course_events")
    .select(
      "id, type, level, title, description, agenda, topics, welding_processes, location, online_url, external_registration_url, recording_url, starts_at, ends_at, duration_text, capacity, price_text, status, published_at, archived_at, created_at",
    )
    .eq("training_provider_id", trainingProviderId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as TrainingProviderCourseEvent[];
}

export async function getTrainingProviderCourseInterests(
  supabase: SupabaseClient<Database>,
  trainingProviderId: string,
) {
  const { data, error } = await supabase
    .from("course_event_interests")
    .select(
      "id, note, created_at, course_events!inner(id, title, type, status, starts_at, training_provider_id), profiles(id, display_name, headline, location, profile_type)",
    )
    .eq("course_events.training_provider_id", trainingProviderId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{
    course_events: InterestedCourseSummary | null;
    created_at: string;
    id: string;
    note: string | null;
    profiles: InterestedProfileSummary | null;
  }>).map<TrainingProviderCourseInterest>((row) => ({
    courseEvent: row.course_events,
    created_at: row.created_at,
    id: row.id,
    note: row.note,
    profile: row.profiles,
  }));
}
