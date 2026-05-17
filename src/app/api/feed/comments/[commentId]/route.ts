import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type CommentDeleteContext = {
  params: Promise<{
    commentId: string;
  }>;
};

export async function DELETE(_request: Request, context: CommentDeleteContext) {
  try {
    const { commentId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: "You must be signed in to delete comments.", status: "error" },
        { status: 401 },
      );
    }

    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, author_profile_id")
      .eq("id", commentId)
      .maybeSingle();

    if (commentError) {
      return NextResponse.json(
        { message: `Could not load comment: ${commentError.message}`, status: "error" },
        { status: 400 },
      );
    }

    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found.", status: "error" },
        { status: 404 },
      );
    }

    if ((comment as { author_profile_id: string }).author_profile_id !== user.id) {
      return NextResponse.json(
        { message: "You can only delete your own comments.", status: "error" },
        { status: 403 },
      );
    }

    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      return NextResponse.json(
        { message: `Could not delete comment: ${deleteError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Comment deleted.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not delete comment.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
