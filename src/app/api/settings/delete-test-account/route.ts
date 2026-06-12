import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getServerSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DeleteAccountPayload = {
  confirmation?: string;
};

async function clearSupabaseAuthCookies() {
  const { url } = getServerSupabaseEnv();
  const projectRef = new URL(url).hostname.split(".")[0];
  const authCookiePrefix = `sb-${projectRef}-auth-token`;
  const cookieStore = await cookies();

  cookieStore
    .getAll()
    .filter(
      ({ name }) => name === authCookiePrefix || name.startsWith(`${authCookiePrefix}.`),
    )
    .forEach(({ name }) => cookieStore.delete(name));
}

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as DeleteAccountPayload;

    if (payload.confirmation !== "DELETE") {
      return NextResponse.json(
        { message: "Type DELETE to confirm account deletion.", status: "error" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: "You must be signed in to delete this test account.", status: "error" },
        { status: 401 },
      );
    }

    const adminSupabase = createSupabaseAdminClient();
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json(
        { message: `Could not delete account: ${deleteError.message}`, status: "error" },
        { status: 400 },
      );
    }

    await supabase.auth.signOut().catch(() => undefined);
    await clearSupabaseAuthCookies();

    return NextResponse.json({
      message: "Account deleted.",
      redirectTo: "/auth/sign-up?status=account-deleted",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not delete account.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
