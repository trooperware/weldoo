import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type SaveJobRouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

async function getUserAndJob(context: SaveJobRouteContext) {
  const { jobId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { message: "You must be signed in to save jobs.", status: "error" },
        { status: 401 },
      ),
      jobId,
      supabase,
      user: null,
    };
  }

  return { error: null, jobId, supabase, user };
}

export async function POST(_request: Request, context: SaveJobRouteContext) {
  try {
    const { error, jobId, supabase, user } = await getUserAndJob(context);

    if (error) return error;

    const { error: insertError } = await supabase.from("saved_items").insert([
      {
        item_type: "job",
        job_id: jobId,
        profile_id: user.id,
      },
    ] as never[]);

    if (insertError && insertError.code !== "23505") {
      return NextResponse.json(
        { message: `Could not save job: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Job saved.", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not save job.",
        status: "error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: SaveJobRouteContext) {
  try {
    const { error, jobId, supabase, user } = await getUserAndJob(context);

    if (error) return error;

    const { error: deleteError } = await supabase
      .from("saved_items")
      .delete()
      .eq("profile_id", user.id)
      .eq("item_type", "job")
      .eq("job_id", jobId);

    if (deleteError) {
      return NextResponse.json(
        { message: `Could not remove saved job: ${deleteError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Saved job removed.", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not remove saved job.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
