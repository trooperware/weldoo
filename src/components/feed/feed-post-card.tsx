import Link from "next/link";

import { FeedComments } from "@/components/feed/feed-comments";
import { FeedPostActions } from "@/components/feed/feed-post-actions";
import { PostOwnerControls } from "@/components/feed/post-owner-controls";
import { Badge } from "@/components/ui";
import type { Tables } from "@/types/database";

type PostRow = Tables<"posts">;
type CommentRow = Tables<"comments">;
type ProfileRow = Tables<"profiles">;

export type FeedComment = {
  author: Pick<ProfileRow, "display_name" | "id"> | null;
  canDelete: boolean;
  comment: CommentRow;
};

export type FeedPost = {
  author: Pick<
    ProfileRow,
    "avatar_url" | "display_name" | "headline" | "id" | "profile_type"
  > | null;
  canManage: boolean;
  canInteract: boolean;
  commentCount: number;
  comments: FeedComment[];
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  post: PostRow;
};

function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getProfileHref(author: FeedPost["author"]) {
  if (!author) return null;

  if (author.profile_type === "professional") {
    return `/professionals/${author.id}`;
  }

  return null;
}

export function FeedPostCard({ item }: { item: FeedPost }) {
  const {
    author,
    canInteract,
    canManage,
    commentCount,
    comments,
    isLiked,
    isSaved,
    likeCount,
    post,
  } = item;
  const authorHref = getProfileHref(author);
  const initials = author?.display_name.slice(0, 1).toUpperCase() ?? "W";

  return (
    <article className="rounded-[var(--weldoo-radius-md)] border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-sm font-bold text-white">
          {author?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-full w-full object-cover" src={author.avatar_url} />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {authorHref ? (
              <Link
                className="font-semibold text-[var(--weldoo-ink)] hover:text-[var(--weldoo-indigo)]"
                href={authorHref}
              >
                {author?.display_name ?? "Weldoo member"}
              </Link>
            ) : (
              <span className="font-semibold text-[var(--weldoo-ink)]">
                {author?.display_name ?? "Weldoo member"}
              </span>
            )}
            {author?.profile_type ? (
              <Badge variant="neutral">{author.profile_type.replace("_", " ")}</Badge>
            ) : null}
          </div>
          {author?.headline ? (
            <p className="mt-1 truncate text-xs font-medium text-[var(--weldoo-muted)]">
              {author.headline}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-[var(--weldoo-muted)]">
            {formatPostDate(post.created_at)}
          </p>
        </div>
      </header>

      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--weldoo-ink)]">
        {post.body}
      </p>

      {post.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="mt-4 max-h-[460px] w-full rounded-[var(--weldoo-radius-sm)] object-cover"
          src={post.image_url}
        />
      ) : null}

      {post.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="info">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <footer className="mt-4 flex flex-wrap gap-4 border-t border-[var(--weldoo-border-light)] pt-4 text-xs font-semibold text-[var(--weldoo-muted)]">
        <span>{likeCount} likes</span>
        <span>{commentCount} comments</span>
        <span>{isSaved ? "Saved" : "Not saved"}</span>
      </footer>
      {canInteract ? (
        <FeedPostActions
          initialIsLiked={isLiked}
          initialIsSaved={isSaved}
          initialLikeCount={likeCount}
          postId={post.id}
        />
      ) : null}
      {canManage ? (
        <PostOwnerControls
          defaultValues={{
            body: post.body,
            imageUrl: post.image_url,
            tags: post.tags,
          }}
          postId={post.id}
        />
      ) : null}
      <FeedComments canComment={canInteract} comments={comments} postId={post.id} />
    </article>
  );
}
