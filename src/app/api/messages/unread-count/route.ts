import { NextResponse } from "next/server";

import { getUnreadContactRequestCount } from "@/lib/contact/queries";
import { getUnreadMessageCount } from "@/lib/messages/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in to continue.", status: "error" }, { status: 401 });
  }

  try {
    const [contactRequestCount, messageCount] = await Promise.all([
      getUnreadContactRequestCount(supabase, user.id),
      getUnreadMessageCount(supabase, user.id),
    ]);

    return NextResponse.json({
      count: contactRequestCount + messageCount,
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to load unread messages.",
        status: "error",
      },
      { status: 400 },
    );
  }
}
