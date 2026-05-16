import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type CurrentProfile = Pick<
  Tables<"profiles">,
  "display_name" | "id" | "onboarding_completed" | "profile_type" | "status"
>;

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

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, profile_type, status, display_name, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function requireCompletedOnboarding() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return { profile, user };
}
