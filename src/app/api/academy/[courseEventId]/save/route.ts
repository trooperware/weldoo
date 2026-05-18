import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type SaveCourseRouteContext = {
  params: Promise<{
    courseEventId: string;
  }>;
};

async function getUserAndCourseEvent(context: SaveCourseRouteContext) {
  const { courseEventId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      courseEventId,
      error: NextResponse.json(
        { message: "You must be signed in to save academy items.", status: "error" },
        { status: 401 },
      ),
      supabase,
      user: null,
    };
  }

  return { courseEventId, error: null, supabase, user };
}

export async function POST(_request: Request, context: SaveCourseRouteContext) {
  try {
    const { courseEventId, error, supabase, user } = await getUserAndCourseEvent(context);

    if (error) return error;

    const { error: insertError } = await supabase.from("saved_items").insert([
      {
        course_event_id: courseEventId,
        item_type: "course_event",
        profile_id: user.id,
      },
    ] as never[]);

    if (insertError && insertError.code !== "23505") {
      return NextResponse.json(
        {
          message: `Could not save academy item: ${insertError.message}`,
          status: "error",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Academy item saved.", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not save academy item.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
