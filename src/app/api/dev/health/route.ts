import { NextResponse } from "next/server";

import { getSupabaseEnvStatus, hasPublicSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const env = getSupabaseEnvStatus();

  if (!hasPublicSupabaseEnv()) {
    return NextResponse.json({
      ok: false,
      service: "weldoo",
      supabase: {
        configured: false,
        env,
      },
    });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  return NextResponse.json({
    ok: !error,
    service: "weldoo",
    supabase: {
      configured: true,
      env,
      authenticated: Boolean(data.user),
      authError: error?.message ?? null,
    },
  });
}
