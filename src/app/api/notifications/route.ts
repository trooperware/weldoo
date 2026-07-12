import { NextResponse } from "next/server";

import {
  getNotificationDropdownData,
  markAllNotificationsRead,
} from "@/lib/notifications/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type NotificationsPayload = {
  action?: "mark_all_read";
};

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in to continue.", status: "error" }, { status: 401 });
  }

  try {
    const data = await getNotificationDropdownData(supabase, user.id);

    return NextResponse.json({
      data,
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to load notifications.",
        status: "error",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in to continue.", status: "error" }, { status: 401 });
  }

  const payload = (await request.json()) as NotificationsPayload;

  if (payload.action !== "mark_all_read") {
    return NextResponse.json(
      { message: "Invalid notification action.", status: "error" },
      { status: 400 },
    );
  }

  try {
    await markAllNotificationsRead(supabase, user.id);

    return NextResponse.json({
      message: "Notifications marked as read.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to update notifications.",
        status: "error",
      },
      { status: 400 },
    );
  }
}
