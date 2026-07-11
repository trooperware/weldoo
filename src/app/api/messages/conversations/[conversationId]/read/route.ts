import { NextResponse } from "next/server";

import { markConversationRead } from "@/lib/messages/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { conversationId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Sign in to update messages.", status: "error" },
        { status: 401 },
      );
    }

    await markConversationRead(supabase, conversationId, user.id);

    return NextResponse.json({
      message: "Conversation marked as read.",
      status: "success",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to mark this conversation as read.";

    return NextResponse.json({ message, status: "error" }, { status: 500 });
  }
}
