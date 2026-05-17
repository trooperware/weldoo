import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { commentSchema, getCommentFieldErrors } from "@/lib/validators/comment";

type CommentCreateContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(request: Request, context: CommentCreateContext) {
  try {
    const { postId } = await context.params;
    const formData = await request.formData();
    const parsed = commentSchema.safeParse({
      body: formData.get("body"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: getCommentFieldErrors(parsed.error),
          status: "error",
        },
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
        { message: "You must be signed in to comment.", status: "error" },
        { status: 401 },
      );
    }

    const { error: insertError } = await supabase.from("comments").insert([
      {
        author_profile_id: user.id,
        body: parsed.data.body,
        post_id: postId,
        status: "published",
      },
    ] as never[]);

    if (insertError) {
      return NextResponse.json(
        { message: `Could not post comment: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Comment posted.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not post comment.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
