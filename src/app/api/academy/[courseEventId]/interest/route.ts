import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type CourseInterestRouteContext = {
  params: Promise<{
    courseEventId: string;
  }>;
};

async function getUserAndCourseEvent(context: CourseInterestRouteContext) {
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
        { message: "You must be signed in to register interest.", status: "error" },
        { status: 401 },
      ),
      supabase,
      user: null,
    };
  }

  return { courseEventId, error: null, supabase, user };
}

export async function POST(request: Request, context: CourseInterestRouteContext) {
  try {
    const { courseEventId, error, supabase, user } = await getUserAndCourseEvent(context);

    if (error) return error;

    const body = (await request.json().catch(() => ({}))) as { note?: unknown };
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";

    const { error: insertError } = await supabase.from("course_event_interests").insert([
      {
        course_event_id: courseEventId,
        note: note || null,
        profile_id: user.id,
      },
    ] as never[]);

    if (insertError && insertError.code !== "23505") {
      return NextResponse.json(
        {
          message: `Could not register interest: ${insertError.message}`,
          status: "error",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Interest registered.", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not register interest.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
