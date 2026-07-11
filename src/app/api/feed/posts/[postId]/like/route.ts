import { NextResponse } from "next/server";

import { publishNotificationEvent } from "@/lib/notifications/events";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LikeRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

async function getUserAndPost(context: LikeRouteContext) {
  const { postId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { message: "You must be signed in to like posts.", status: "error" },
        { status: 401 },
      ),
      postId,
      supabase,
      user: null,
    };
  }

  return { error: null, postId, supabase, user };
}

export async function POST(_request: Request, context: LikeRouteContext) {
  try {
    const { error, postId, supabase, user } = await getUserAndPost(context);

    if (error) return error;

    const [{ data: post }, { data: existingLike }] = await Promise.all([
      supabase
        .from("posts")
        .select("id, author_profile_id")
        .eq("id", postId)
        .maybeSingle(),
      supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("profile_id", user.id)
        .maybeSingle(),
    ]);

    const { error: insertError } = await supabase.from("likes").upsert(
      [
        {
          post_id: postId,
          profile_id: user.id,
        },
      ] as never[],
      { onConflict: "post_id,profile_id" },
    );

    if (insertError) {
      return NextResponse.json(
        { message: `Could not like post: ${insertError.message}`, status: "error" },
        { status: 400 },
      );
    }

    const postRow = post as { author_profile_id?: string } | null;
    if (!existingLike && postRow?.author_profile_id) {
      await publishNotificationEvent({
        actorProfileId: user.id,
        recipientProfileId: postRow.author_profile_id,
        targetPath: "/",
        type: "post_like",
      });
    }

    return NextResponse.json({ message: "Post liked.", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not like post.",
        status: "error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: LikeRouteContext) {
  try {
    const { error, postId, supabase, user } = await getUserAndPost(context);

    if (error) return error;

    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("profile_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { message: `Could not remove like: ${deleteError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Like removed.", status: "success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not remove like.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
