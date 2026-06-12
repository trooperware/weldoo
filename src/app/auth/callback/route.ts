import { NextResponse, type NextRequest } from "next/server";

import { getPostAuthRedirectPath, getSafeRedirectPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const requestedNext = requestUrl.searchParams.get("next");
  const next =
    requestedNext === "/auth/reset-password"
      ? requestedNext
      : getSafeRedirectPath(requestedNext);

  if (error) {
    const errorUrl = new URL(
      next === "/settings/linkedin-import" ? next : "/auth/sign-in",
      requestUrl.origin,
    );
    errorUrl.searchParams.set("error", "oauth_callback");
    if (errorDescription) {
      errorUrl.searchParams.set("message", errorDescription);
    }

    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const signInUrl = new URL("/auth/sign-in", requestUrl.origin);
      signInUrl.searchParams.set("error", "oauth_callback");
      signInUrl.searchParams.set("message", exchangeError.message);

      return NextResponse.redirect(signInUrl);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (next === "/auth/reset-password") {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      const profile = profileData as { onboarding_completed: boolean | null } | null;
      const destination = getPostAuthRedirectPath({
        onboardingCompleted: Boolean(profile?.onboarding_completed),
        redirectTo: next,
      });

      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
