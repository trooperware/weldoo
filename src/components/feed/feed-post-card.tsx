import Link from "next/link";

import { FeedComments } from "@/components/feed/feed-comments";
import { FeedPostActions } from "@/components/feed/feed-post-actions";
import { PostOwnerControls } from "@/components/feed/post-owner-controls";
import { ReportContentButton } from "@/components/feed/report-content-button";
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
    <article className="overflow-hidden rounded-weldoo-md border border-weldoo-border-light bg-white shadow-weldoo-sm transition hover:border-weldoo-border hover:shadow-weldoo-md">
      <header className="flex items-start gap-3 px-[18px] pt-[18px]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3d3db4_0%,#5558e8_100%)] text-sm font-bold text-white shadow-[0_2px_8px_rgba(61,61,180,0.2)]">
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
                className="text-[15px] font-bold leading-tight text-weldoo-ink hover:text-weldoo-indigo"
                href={authorHref}
              >
                {author?.display_name ?? "Weldoo member"}
              </Link>
            ) : (
              <span className="text-[15px] font-bold leading-tight text-weldoo-ink">
                {author?.display_name ?? "Weldoo member"}
              </span>
            )}
            {author?.profile_type ? (
              <Badge variant="neutral">{author.profile_type.replace("_", " ")}</Badge>
            ) : null}
          </div>
          {author?.headline ? (
            <p className="mt-0.5 truncate text-[12.5px] leading-tight text-weldoo-slate">
              {author.headline}
            </p>
          ) : null}
          <p className="mt-1 text-[11.5px] text-weldoo-muted">
            {formatPostDate(post.created_at)}
          </p>
        </div>
      </header>

      <div className="px-[18px] py-3">
        <p className="whitespace-pre-line text-[15px] leading-6 text-weldoo-ink">
          {post.body}
        </p>

        {post.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="info">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {post.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="aspect-video w-full object-cover" src={post.image_url} />
      ) : null}

      <footer className="flex items-center justify-between gap-3 px-[18px] py-2 text-xs tracking-[-0.01em] text-weldoo-muted">
        <div className="flex items-center gap-1">
          {likeCount > 0 ? (
            <div className="flex">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-white bg-[linear-gradient(135deg,#3d3db4,#7b7fe8)] text-[8px]">
                👍
              </span>
              <span className="-ml-1 flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-white bg-[linear-gradient(135deg,#e05c7e,#f59b42)] text-[8px]">
                ❤️
              </span>
            </div>
          ) : null}
          <span>{likeCount}</span>
        </div>
        <span>{commentCount} comments</span>
      </footer>
      {canInteract ? (
        <>
        <div className="mx-4 h-px bg-weldoo-border-light" />
        <div className="px-2.5 pb-1.5 pt-1">
          <FeedPostActions
            initialIsLiked={isLiked}
            initialIsSaved={isSaved}
            initialLikeCount={likeCount}
            postId={post.id}
          />
        </div>
        <div className="px-[18px] pb-2">
          <ReportContentButton postId={post.id} targetLabel="post" targetType="post" />
        </div>
        </>
      ) : null}
      {canManage ? (
        <div className="px-[18px] pb-3">
        <PostOwnerControls
          defaultValues={{
            body: post.body,
            imageUrl: post.image_url,
            tags: post.tags,
          }}
          postId={post.id}
        />
        </div>
      ) : null}
      <FeedComments canComment={canInteract} comments={comments} postId={post.id} />
    </article>
  );
}
