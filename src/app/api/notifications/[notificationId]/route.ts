import { NextResponse } from "next/server";

import { markNotificationRead } from "@/lib/notifications/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type NotificationPayload = {
  action?: "mark_read";
};

type NotificationRouteProps = {
  params: Promise<{
    notificationId: string;
  }>;
};

export async function PATCH(request: Request, { params }: NotificationRouteProps) {
  const { notificationId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Sign in to continue.", status: "error" }, { status: 401 });
  }

  const payload = (await request.json()) as NotificationPayload;

  if (payload.action !== "mark_read") {
    return NextResponse.json(
      { message: "Invalid notification action.", status: "error" },
      { status: 400 },
    );
  }

  try {
    await markNotificationRead(supabase, notificationId, user.id);

    return NextResponse.json({
      message: "Notification marked as read.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to update notification.",
        status: "error",
      },
      { status: 400 },
    );
  }
}
