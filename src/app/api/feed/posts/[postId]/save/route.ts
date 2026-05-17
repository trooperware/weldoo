import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type SaveRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

async function getUserAndPost(context: SaveRouteContext) {
  const { postId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { message: "You must be signed in to save posts.", status: "error" },
        { status: 401 },
      ),
      postId,
      supabase,
      user: null,
    };
  }

  return { error: null, postId, supabase, user };
}

export async function POST(_request: Request, context: SaveRouteContext) {
  try {
    const { error, postId, supabase, user } = await getUserAndPost(context);

    if (error) return error;

    const { error: insertError } = await supabase.from("saved_items").insert([
      {
        item_type: "post",
        post_id: postId,
        profile_id: user.id,
      },
    ] as never[]);

    if (insertError && insertError.code !== "23505") {
      return NextResponse.json(
        { message: `Could not save post: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Post saved.", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not save post.",
        status: "error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: SaveRouteContext) {
  try {
    const { error, postId, supabase, user } = await getUserAndPost(context);

    if (error) return error;

    const { error: deleteError } = await supabase
      .from("saved_items")
      .delete()
      .eq("profile_id", user.id)
      .eq("item_type", "post")
      .eq("post_id", postId);

    if (deleteError) {
      return NextResponse.json(
        { message: `Could not remove saved post: ${deleteError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Saved post removed.", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not remove saved post.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
