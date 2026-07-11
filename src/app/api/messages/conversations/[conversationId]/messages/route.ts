import { NextResponse } from "next/server";

import { sendMessage } from "@/lib/messages/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

function getApiErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unable to send the message.";

  if (message.includes("<!DOCTYPE html>") || message.includes("Connection timed out")) {
    return "Supabase is not responding right now. Please try again in a few minutes.";
  }

  return message;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { conversationId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Sign in to send a message.", status: "error" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      message?: unknown;
    };
    const message = typeof body.message === "string" ? body.message : "";
    const sentMessage = await sendMessage(supabase, conversationId, user.id, message);

    return NextResponse.json({
      message: "Message sent.",
      sentMessage,
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      { message: getApiErrorMessage(error), status: "error" },
      { status: 500 },
    );
  }
}
