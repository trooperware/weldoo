import { NextResponse } from "next/server";

import { getOwnedTrainingProviderForAcademy } from "@/lib/academy/provider-management";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    courseEventId: string;
  }>;
};

const allowedActions = ["archive", "draft", "publish"] as const;
type StatusAction = (typeof allowedActions)[number];

function isStatusAction(value: unknown): value is StatusAction {
  return typeof value === "string" && allowedActions.includes(value as StatusAction);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const body = (await request.json()) as { action?: unknown };
    const { courseEventId } = await context.params;

    if (!isStatusAction(body.action)) {
      return NextResponse.json(
        { message: "Unsupported Academy status action.", status: "error" },
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
        {
          message: "You must be signed in as a training provider to manage Academy.",
          status: "error",
        },
        { status: 401 },
      );
    }

    const provider = await getOwnedTrainingProviderForAcademy(supabase, user.id);

    if (!provider) {
      return NextResponse.json(
        { message: "Only training provider owners can manage Academy.", status: "error" },
        { status: 403 },
      );
    }

    const now = new Date().toISOString();
    const update =
      body.action === "archive"
        ? { archived_at: now, status: "archived" }
        : body.action === "draft"
          ? { archived_at: null, published_at: null, status: "draft" }
          : { archived_at: null, published_at: now, status: "published" };

    const { data, error } = await supabase
      .from("course_events")
      .update(update as never)
      .eq("id", courseEventId)
      .eq("training_provider_id", provider.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { message: `Could not update Academy item status: ${error.message}`, status: "error" },
        { status: 400 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: "Academy item not found or not owned by your provider.", status: "error" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message:
        body.action === "archive"
          ? "Academy item archived."
          : body.action === "draft"
            ? "Academy item moved to draft."
            : "Academy item published.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not update Academy item status.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
