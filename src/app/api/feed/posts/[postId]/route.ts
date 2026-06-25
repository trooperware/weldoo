import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPostFieldErrors, postSchema } from "@/lib/validators/post";

type PostRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

async function requirePostOwner(postId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { message: "You must be signed in to manage posts.", status: "error" },
        { status: 401 },
      ),
      supabase,
      user: null,
    };
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, author_profile_id")
    .eq("id", postId)
    .maybeSingle();

  if (postError) {
    return {
      error: NextResponse.json(
        { message: `Could not load post: ${postError.message}`, status: "error" },
        { status: 400 },
      ),
      supabase,
      user,
    };
  }

  if (!post) {
    return {
      error: NextResponse.json({ message: "Post not found.", status: "error" }, { status: 404 }),
      supabase,
      user,
    };
  }

  if ((post as { author_profile_id: string }).author_profile_id !== user.id) {
    return {
      error: NextResponse.json(
        { message: "You can only manage your own posts.", status: "error" },
        { status: 403 },
      ),
      supabase,
      user,
    };
  }

  return { error: null, supabase, user };
}

export async function PATCH(request: Request, context: PostRouteContext) {
  try {
    const { postId } = await context.params;
    const formData = await request.formData();
    const parsed = postSchema.safeParse({
      body: formData.get("body"),
      imageUrl: formData.get("imageUrl"),
      imageUrls: formData.get("imageUrls"),
      tags: formData.get("tags"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: getPostFieldErrors(parsed.error),
          status: "error",
        },
        { status: 400 },
      );
    }

    const ownerCheck = await requirePostOwner(postId);

    if (ownerCheck.error) {
      return ownerCheck.error;
    }

    const data = parsed.data;
    const imageUrls = data.imageUrl && data.imageUrls[0] !== data.imageUrl
      ? [data.imageUrl]
      : data.imageUrls.length > 0
      ? data.imageUrls
      : data.imageUrl
        ? [data.imageUrl]
        : [];
    const { error: updateError } = await ownerCheck.supabase
      .from("posts")
      .update({
        body: data.body,
        image_url: imageUrls[0] ?? null,
        image_urls: imageUrls,
        tags: data.tags,
      } as never)
      .eq("id", postId)
      .eq("author_profile_id", ownerCheck.user.id);

    if (updateError) {
      return NextResponse.json(
        { message: `Could not update post: ${updateError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Post updated.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not update post.",
        status: "error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: PostRouteContext) {
  try {
    const { postId } = await context.params;
    const ownerCheck = await requirePostOwner(postId);

    if (ownerCheck.error) {
      return ownerCheck.error;
    }

    const { error: deleteError } = await ownerCheck.supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("author_profile_id", ownerCheck.user.id);

    if (deleteError) {
      return NextResponse.json(
        { message: `Could not delete post: ${deleteError.message}`, status: "error" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Post deleted.",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not delete post.",
        status: "error",
      },
      { status: 500 },
    );
  }
}
