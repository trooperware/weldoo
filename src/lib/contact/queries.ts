import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

type ContactRequestRow = Tables<"contact_requests">;
type ProfileRow = Tables<"profiles">;

export type ContactRequestListItem = ContactRequestRow & {
  otherProfile: Pick<
    ProfileRow,
    "avatar_url" | "display_name" | "headline" | "id" | "profile_type"
  > | null;
  otherProfileHref: string | null;
};

async function loadProfileMaps(
  supabase: SupabaseClient<Database>,
  profileIds: string[],
) {
  if (!profileIds.length) {
    return {
      hrefMap: new Map<string, string>(),
      profileMap: new Map<string, Pick<ProfileRow, "avatar_url" | "display_name" | "headline" | "id" | "profile_type">>(),
    };
  }

  const [profilesResult, companiesResult, providersResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, profile_type, display_name, headline, avatar_url")
      .in("id", profileIds),
    supabase.from("companies").select("id, owner_profile_id").in("owner_profile_id", profileIds),
    supabase
      .from("training_providers")
      .select("id, owner_profile_id")
      .in("owner_profile_id", profileIds),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);
  if (companiesResult.error) throw new Error(companiesResult.error.message);
  if (providersResult.error) throw new Error(providersResult.error.message);

  const profileMap = new Map(
    ((profilesResult.data ?? []) as Array<
      Pick<ProfileRow, "avatar_url" | "display_name" | "headline" | "id" | "profile_type">
    >).map((profile) => [profile.id, profile]),
  );
  const hrefMap = new Map<string, string>();

  profileMap.forEach((profile) => {
    if (profile.profile_type === "professional") {
      hrefMap.set(profile.id, `/professionals/${profile.id}`);
    }
  });
  ((companiesResult.data ?? []) as Array<{ id: string; owner_profile_id: string }>).forEach(
    (company) => hrefMap.set(company.owner_profile_id, `/companies/${company.id}`),
  );
  ((providersResult.data ?? []) as Array<{ id: string; owner_profile_id: string }>).forEach(
    (provider) =>
      hrefMap.set(provider.owner_profile_id, `/training-providers/${provider.id}`),
  );

  return { hrefMap, profileMap };
}

export async function getContactRequestsForProfile(
  supabase: SupabaseClient<Database>,
  profileId: string,
) {
  const [incomingResult, outgoingResult] = await Promise.all([
    supabase
      .from("contact_requests")
      .select("id, sender_profile_id, recipient_profile_id, message, read_at, archived_at, created_at")
      .eq("recipient_profile_id", profileId)
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_requests")
      .select("id, sender_profile_id, recipient_profile_id, message, read_at, archived_at, created_at")
      .eq("sender_profile_id", profileId)
      .order("created_at", { ascending: false }),
  ]);

  if (incomingResult.error) throw new Error(incomingResult.error.message);
  if (outgoingResult.error) throw new Error(outgoingResult.error.message);

  const incomingRows = (incomingResult.data ?? []) as ContactRequestRow[];
  const outgoingRows = (outgoingResult.data ?? []) as ContactRequestRow[];
  const { hrefMap, profileMap } = await loadProfileMaps(supabase, [
    ...new Set([
      ...incomingRows.map((request) => request.sender_profile_id),
      ...outgoingRows.map((request) => request.recipient_profile_id),
    ]),
  ]);

  return {
    incoming: incomingRows.map<ContactRequestListItem>((request) => ({
      ...request,
      otherProfile: profileMap.get(request.sender_profile_id) ?? null,
      otherProfileHref: hrefMap.get(request.sender_profile_id) ?? null,
    })),
    outgoing: outgoingRows.map<ContactRequestListItem>((request) => ({
      ...request,
      otherProfile: profileMap.get(request.recipient_profile_id) ?? null,
      otherProfileHref: hrefMap.get(request.recipient_profile_id) ?? null,
    })),
  };
}
