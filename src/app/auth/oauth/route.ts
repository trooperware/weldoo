import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPostAuthRedirectPath } from "@/lib/auth/redirects";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

const OAUTH_PROVIDER_VALUES = ["google", "linkedin_oidc"] as const;

function getOAuthProvider(value: string | null) {
  return OAUTH_PROVIDER_VALUES.includes(value as (typeof OAUTH_PROVIDER_VALUES)[number])
    ? (value as (typeof OAUTH_PROVIDER_VALUES)[number])
    : null;
}

function getAuthErrorUrl(request: NextRequest, error: string, message?: string) {
  const source = request.nextUrl.searchParams.get("source");
  const path = source === "sign-up" ? "/auth/sign-up" : "/auth/sign-in";
  const errorUrl = new URL(path, request.url);
  errorUrl.searchParams.set("error", error);

  if (message) {
    errorUrl.searchParams.set("message", message);
  }

  return errorUrl;
}

export async function GET(request: NextRequest) {
  const provider = getOAuthProvider(request.nextUrl.searchParams.get("provider"));

  if (!provider) {
    return NextResponse.redirect(getAuthErrorUrl(request, "oauth_provider"));
  }

  const redirectTo = getPostAuthRedirectPath({
    onboardingCompleted: false,
    redirectTo: request.nextUrl.searchParams.get("redirectTo"),
  });
  const callbackPath = `/auth/callback?next=${encodeURIComponent(redirectTo)}`;
  const callbackUrl = new URL(callbackPath, request.nextUrl.origin).toString();
  const { anonKey, url } = getPublicSupabaseEnv();
  const cookiesToSet: Array<{ name: string; options: CookieOptions; value: string }> = [];
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(newCookies) {
        newCookies.forEach(({ name, options, value }) => {
          cookiesToSet.push({ name, options, value });
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl,
      scopes: provider === "linkedin_oidc" ? "openid profile email" : undefined,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      getAuthErrorUrl(request, "oauth_start", error?.message ?? undefined),
    );
  }

  const response = NextResponse.redirect(data.url);
  cookiesToSet.forEach(({ name, options, value }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
