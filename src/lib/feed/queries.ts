import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import type { FeedPost } from "@/components/feed/feed-post-card";

type PostRow = Tables<"posts">;
type ProfileRow = Tables<"profiles">;
type LikeRow = Tables<"likes">;
type CommentRow = Tables<"comments">;
type SavedItemRow = Tables<"saved_items">;

export const FEED_PAGE_SIZE = 10;

function countByPostId(rows: Array<{ post_id: string }>) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
    return counts;
  }, {});
}

export async function getFeedPage(page: number, currentUserId?: string | null) {
  const supabase = await createSupabaseServerClient();
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const from = (safePage - 1) * FEED_PAGE_SIZE;
  const to = from + FEED_PAGE_SIZE - 1;

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("id, author_profile_id, body, image_url, status, tags, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (postsError) {
    throw new Error(postsError.message);
  }

  const posts = (postsData ?? []) as PostRow[];
  const postIds = posts.map((post) => post.id);
  const authorIds = Array.from(new Set(posts.map((post) => post.author_profile_id)));

  if (posts.length === 0) {
    return {
      hasNextPage: false,
      items: [] as FeedPost[],
      page: safePage,
    };
  }

  const [profilesResult, likesResult, commentsResult, savedResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, headline, avatar_url, profile_type")
      .in("id", authorIds),
    supabase.from("likes").select("post_id").in("post_id", postIds),
    supabase
      .from("comments")
      .select("post_id")
      .eq("status", "published")
      .in("post_id", postIds),
    currentUserId
      ? supabase
          .from("saved_items")
          .select("post_id")
          .eq("profile_id", currentUserId)
          .eq("item_type", "post")
          .in("post_id", postIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);
  if (likesResult.error) throw new Error(likesResult.error.message);
  if (commentsResult.error) throw new Error(commentsResult.error.message);
  if (savedResult.error) throw new Error(savedResult.error.message);

  const profiles = ((profilesResult.data ?? []) as ProfileRow[]).reduce<
    Record<string, ProfileRow>
  >((byId, profile) => {
    byId[profile.id] = profile;
    return byId;
  }, {});
  const likeCounts = countByPostId((likesResult.data ?? []) as LikeRow[]);
  const commentCounts = countByPostId((commentsResult.data ?? []) as CommentRow[]);
  const savedPostIds = new Set(
    ((savedResult.data ?? []) as SavedItemRow[])
      .map((item) => item.post_id)
      .filter((postId): postId is string => Boolean(postId)),
  );

  return {
    hasNextPage: posts.length === FEED_PAGE_SIZE,
    items: posts.map((post) => ({
      author: profiles[post.author_profile_id] ?? null,
      commentCount: commentCounts[post.id] ?? 0,
      isSaved: savedPostIds.has(post.id),
      likeCount: likeCounts[post.id] ?? 0,
      post,
    })),
    page: safePage,
  };
}
