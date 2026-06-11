import { NextResponse, type NextRequest } from "next/server";

import { hasLinkedInIdentity } from "@/lib/auth/linkedin-profile-import";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getImportUrl(request: NextRequest, params?: Record<string, string>) {
  const url = new URL("/settings/linkedin-import", request.url);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url;
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", "/settings/linkedin-import");

    return NextResponse.redirect(signInUrl);
  }

  if (hasLinkedInIdentity(user)) {
    return NextResponse.redirect(getImportUrl(request));
  }

  const callbackUrl = new URL(
    "/auth/callback?next=/settings/linkedin-import",
    request.url,
  ).toString();
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "linkedin_oidc",
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      getImportUrl(request, {
        error: "link_start",
        message: error?.message ?? "LinkedIn connection could not be started.",
      }),
    );
  }

  return NextResponse.redirect(data.url);
}
