import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { enforceSiteAccess } from "@/lib/site-access";

export async function proxy(request: NextRequest) {
  const gate = await enforceSiteAccess(request);
  if (gate) return gate;
  const response = request.nextUrl.pathname.startsWith("/api/")
    ? NextResponse.next()
    : await updateSupabaseSession(request);
  if (process.env.SITE_PASSWORD) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static/|_next/webpack-hmr).*)",
  ],
};
