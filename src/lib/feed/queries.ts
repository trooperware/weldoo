import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "@/types/database";
import type { FeedComment, FeedPost } from "@/components/feed/feed-post-card";

type PostRow = Tables<"posts">;
type ProfileRow = Tables<"profiles">;
type LikeRow = Tables<"likes">;
type CommentRow = Tables<"comments">;
type SavedItemRow = Tables<"saved_items">;

export const FEED_PAGE_SIZE = 10;
const COMMENT_PREVIEW_LIMIT = 3;

type CommentCountRow = {
  comment_count: number;
  post_id: string;
};

type FeedSupabaseClient = SupabaseClient<Database>;

function countByPostId(rows: Array<{ post_id: string }>) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
    return counts;
  }, {});
}

function isMissingFeedRpc(error: { code?: string; message?: string } | null | undefined) {
  return (
    error?.code === "PGRST202" ||
    Boolean(error?.message?.includes("schema cache") && error.message.includes("feed_comment"))
  );
}

async function getCommentPreviewRows(supabase: FeedSupabaseClient, postIds: string[]) {
  const commentsResult = await supabase.rpc("feed_comment_preview" as never, {
    preview_limit: COMMENT_PREVIEW_LIMIT,
    target_post_ids: postIds,
  } as never);

  if (!commentsResult.error) {
    return (commentsResult.data ?? []) as CommentRow[];
  }

  if (!isMissingFeedRpc(commentsResult.error)) {
    throw new Error(commentsResult.error.message);
  }

  const fallbackResult = await supabase
    .from("comments")
    .select("id, post_id, author_profile_id, body, status, created_at, updated_at")
    .eq("status", "published")
    .in("post_id", postIds)
    .order("post_id", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (fallbackResult.error) {
    throw new Error(fallbackResult.error.message);
  }

  const perPostCount: Record<string, number> = {};

  return ((fallbackResult.data ?? []) as CommentRow[])
    .filter((comment) => {
    perPostCount[comment.post_id] = (perPostCount[comment.post_id] ?? 0) + 1;
    return perPostCount[comment.post_id] <= COMMENT_PREVIEW_LIMIT;
    })
    .sort((a, b) => {
      if (a.post_id !== b.post_id) return a.post_id.localeCompare(b.post_id);
      const createdAtDiff =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return createdAtDiff || a.id.localeCompare(b.id);
    });
}

async function getCommentCountRows(supabase: FeedSupabaseClient, postIds: string[]) {
  const commentCountsResult = await supabase.rpc("feed_comment_counts" as never, {
    target_post_ids: postIds,
  } as never);

  if (!commentCountsResult.error) {
    return (commentCountsResult.data ?? []) as CommentCountRow[];
  }

  if (!isMissingFeedRpc(commentCountsResult.error)) {
    throw new Error(commentCountsResult.error.message);
  }

  const fallbackResult = await supabase
    .from("comments")
    .select("post_id")
    .eq("status", "published")
    .in("post_id", postIds);

  if (fallbackResult.error) {
    throw new Error(fallbackResult.error.message);
  }

  return Object.entries(countByPostId((fallbackResult.data ?? []) as Array<{ post_id: string }>))
    .map(([post_id, comment_count]) => ({ comment_count, post_id }));
}

function groupCommentsByPostId(
  comments: CommentRow[],
  profiles: Record<string, ProfileRow>,
  currentUserId?: string | null,
) {
  return comments.reduce<Record<string, FeedComment[]>>((byPost, comment) => {
    byPost[comment.post_id] = byPost[comment.post_id] ?? [];
    byPost[comment.post_id].push({
      author: profiles[comment.author_profile_id]
        ? {
            avatar_url: profiles[comment.author_profile_id].avatar_url,
            display_name: profiles[comment.author_profile_id].display_name,
            headline: profiles[comment.author_profile_id].headline,
            id: profiles[comment.author_profile_id].id,
          }
        : null,
      canDelete: currentUserId === comment.author_profile_id,
      comment,
    });
    return byPost;
  }, {});
}

export async function getFeedPage(page: number, currentUserId?: string | null) {
  const supabase = await createSupabaseServerClient();
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const from = (safePage - 1) * FEED_PAGE_SIZE;
  const to = from + FEED_PAGE_SIZE;

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("id, author_profile_id, body, image_url, image_urls, status, tags, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (postsError) {
    throw new Error(postsError.message);
  }

  const fetchedPosts = (postsData ?? []) as PostRow[];
  const posts = fetchedPosts.slice(0, FEED_PAGE_SIZE);
  const postIds = posts.map((post) => post.id);
  const authorIds = Array.from(new Set(posts.map((post) => post.author_profile_id)));

  if (posts.length === 0) {
    return {
      hasNextPage: false,
      items: [] as FeedPost[],
      page: safePage,
    };
  }

  const [likesResult, commentsResult, commentCountsResult, savedResult] = await Promise.all([
    supabase.from("likes").select("post_id, profile_id").in("post_id", postIds),
    getCommentPreviewRows(supabase, postIds),
    getCommentCountRows(supabase, postIds),
    currentUserId
      ? supabase
          .from("saved_items")
          .select("post_id")
          .eq("profile_id", currentUserId)
          .eq("item_type", "post")
          .in("post_id", postIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (likesResult.error) throw new Error(likesResult.error.message);
  if (savedResult.error) throw new Error(savedResult.error.message);

  const comments = commentsResult;
  const profileIds = Array.from(
    new Set([...authorIds, ...comments.map((comment) => comment.author_profile_id)]),
  );
  const profilesResult = await supabase
    .from("profiles")
    .select("id, display_name, headline, avatar_url, profile_type")
    .in("id", profileIds);

  if (profilesResult.error) throw new Error(profilesResult.error.message);

  const profiles = ((profilesResult.data ?? []) as ProfileRow[]).reduce<
    Record<string, ProfileRow>
  >((byId, profile) => {
    byId[profile.id] = profile;
    return byId;
  }, {});
  const likeCounts = countByPostId((likesResult.data ?? []) as LikeRow[]);
  const commentCounts = commentCountsResult.reduce<Record<string, number>>((counts, row) => {
    counts[row.post_id] = Number(row.comment_count);
    return counts;
  }, {});
  const commentsByPostId = groupCommentsByPostId(comments, profiles, currentUserId);
  const likedPostIds = new Set(
    ((likesResult.data ?? []) as LikeRow[])
      .filter((like) => like.profile_id === currentUserId)
      .map((like) => like.post_id),
  );
  const savedPostIds = new Set(
    ((savedResult.data ?? []) as SavedItemRow[])
      .map((item) => item.post_id)
      .filter((postId): postId is string => Boolean(postId)),
  );

  return {
    hasNextPage: fetchedPosts.length > FEED_PAGE_SIZE,
    items: posts.map((post) => ({
      author: profiles[post.author_profile_id] ?? null,
      canManage: currentUserId === post.author_profile_id,
      canInteract: Boolean(currentUserId),
      commentCount: commentCounts[post.id] ?? 0,
      comments: commentsByPostId[post.id] ?? [],
      isLiked: likedPostIds.has(post.id),
      isSaved: savedPostIds.has(post.id),
      likeCount: likeCounts[post.id] ?? 0,
      post,
    })),
    page: safePage,
  };
}
