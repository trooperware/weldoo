import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { commentSchema, getCommentFieldErrors } from "@/lib/validators/comment";
import type { Tables } from "@/types/database";

type CommentCreateContext = {
  params: Promise<{
    postId: string;
  }>;
};

type CommentRow = Tables<"comments">;
type ProfileRow = Tables<"profiles">;

export async function GET(_request: Request, context: CommentCreateContext) {
  try {
    const { postId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select("id, post_id, author_profile_id, body, status, created_at, updated_at")
      .eq("post_id", postId)
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (commentsError) {
      return NextResponse.json(
        { message: `Could not load comments: ${commentsError.message}`, status: "error" },
        { status: 400 },
      );
    }

    const comments = (commentsData ?? []) as CommentRow[];
    const authorIds = Array.from(new Set(comments.map((comment) => comment.author_profile_id)));
    const profilesResult = authorIds.length
      ? await supabase
          .from("profiles")
          .select("id, display_name, headline, avatar_url")
          .in("id", authorIds)
      : { data: [], error: null };

    if (profilesResult.error) {
      return NextResponse.json(
        { message: `Could not load comment authors: ${profilesResult.error.message}`, status: "error" },
        { status: 400 },
      );
    }

    const profilesById = ((profilesResult.data ?? []) as ProfileRow[]).reduce<
      Record<string, ProfileRow>
    >((profiles, profile) => {
      profiles[profile.id] = profile;
      return profiles;
    }, {});

    return NextResponse.json({
      comments: comments.map((comment) => ({
        author: profilesById[comment.author_profile_id]
          ? {
              avatar_url: profilesById[comment.author_profile_id].avatar_url,
              display_name: profilesById[comment.author_profile_id].display_name,
              headline: profilesById[comment.author_profile_id].headline,
              id: profilesById[comment.author_profile_id].id,
            }
          : null,
        canDelete: user?.id === comment.author_profile_id,
        comment,
      })),
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not load comments.",
        status: "error",
      },
      { status: 500 },
    );
  }
}

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

    const { data: comment, error: insertError } = await supabase
      .from("comments")
      .insert([
        {
          author_profile_id: user.id,
          body: parsed.data.body,
          post_id: postId,
          status: "published",
        },
      ] as never[])
      .select("id, post_id, author_profile_id, body, status, created_at, updated_at")
      .single();

    if (insertError) {
      return NextResponse.json(
        { message: `Could not post comment: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      comment,
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
