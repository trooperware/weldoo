import { NextResponse } from "next/server";

import {
  sendDirectMessage,
} from "@/lib/messages/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getApiErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unable to send the message.";

  if (message.includes("<!DOCTYPE html>") || message.includes("Connection timed out")) {
    return "Supabase is not responding right now. Please try again in a few minutes.";
  }

  return message;
}

export async function POST(request: Request) {
  try {
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
      recipientProfileId?: unknown;
    };
    const recipientProfileId =
      typeof body.recipientProfileId === "string" ? body.recipientProfileId : "";
    const message = typeof body.message === "string" ? body.message : "";

    if (!recipientProfileId) {
      return NextResponse.json(
        { message: "Choose a recipient before sending.", status: "error" },
        { status: 400 },
      );
    }

    if (recipientProfileId === user.id) {
      return NextResponse.json(
        { message: "Choose another Weldoo member.", status: "error" },
        { status: 400 },
      );
    }

    const { conversationId, sentMessage } = await sendDirectMessage(
      supabase,
      recipientProfileId,
      message,
    );

    return NextResponse.json({
      conversationId,
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
