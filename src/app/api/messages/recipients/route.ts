import { NextResponse } from "next/server";

import { searchMessageRecipients } from "@/lib/messages/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Sign in to search recipients.", status: "error" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const recipients = await searchMessageRecipients(supabase, user.id, query);

    return NextResponse.json({ recipients, status: "success" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to search recipients.";

    return NextResponse.json({ message, status: "error" }, { status: 500 });
  }
}
