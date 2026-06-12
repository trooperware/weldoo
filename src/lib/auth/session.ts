import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type CurrentProfile = Pick<
  Tables<"profiles">,
  | "avatar_url"
  | "display_name"
  | "headline"
  | "id"
  | "location"
  | "onboarding_completed"
  | "profile_type"
  | "status"
>;

async function getCurrentProfileByUserId(userId: string): Promise<CurrentProfile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, profile_type, status, display_name, headline, avatar_url, location, onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireUser(redirectTo = "/dashboard") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return getCurrentProfileByUserId(user.id);
}

export async function requireCompletedOnboarding() {
  const user = await requireUser();
  const profile = await getCurrentProfileByUserId(user.id);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return { profile, user };
}

export async function getAppShellAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return undefined;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, profile_type, status, display_name, headline, avatar_url, location, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  const profile = (profileData ?? null) as CurrentProfile | null;
  let avatarUrl = profile?.avatar_url ?? null;
  let publicProfileHref: string | null = null;
  let unreadContactRequestCount = 0;

  if (profile?.profile_type === "professional") {
    publicProfileHref = `/professionals/${profile.id}`;
  }

  if (profile?.profile_type === "company") {
    const { data } = await supabase
      .from("companies")
      .select("id, logo_url")
      .eq("owner_profile_id", profile.id)
      .maybeSingle();
    const company = data as Pick<Tables<"companies">, "id" | "logo_url"> | null;
    publicProfileHref = company?.id ? `/companies/${company.id}` : null;
    avatarUrl = company?.logo_url ?? avatarUrl;
  }

  if (profile?.profile_type === "training_provider") {
    const { data } = await supabase
      .from("training_providers")
      .select("id, logo_url")
      .eq("owner_profile_id", profile.id)
      .maybeSingle();
    const provider = data as Pick<Tables<"training_providers">, "id" | "logo_url"> | null;
    publicProfileHref = provider?.id ? `/training-providers/${provider.id}` : null;
    avatarUrl = provider?.logo_url ?? avatarUrl;
  }

  if (profile?.id) {
    const { count } = await supabase
      .from("contact_requests")
      .select("id", { count: "exact", head: true })
      .eq("recipient_profile_id", profile.id)
      .is("read_at", null)
      .is("archived_at", null);
    unreadContactRequestCount = count ?? 0;
  }

  return {
    avatarUrl,
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "Weldoo member",
    email: user.email,
    profileId: profile?.id ?? user.id,
    publicProfileHref,
    unreadContactRequestCount,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    profileType: profile?.profile_type ?? null,
    status: profile?.status ?? null,
  };
}
