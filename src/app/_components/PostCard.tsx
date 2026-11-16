"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  Flag,
  Ban,
  Edit3,
  Trash2,
  Send,
  CornerDownRight,
  CheckCircle2,
} from "lucide-react";
import {
  togglePostLike,
  togglePostBookmark,
  createComment,
  deleteComment,
  deletePost,
  editPost,
  toggleFollow,
  blockUserFromFeed,
} from "@/app/feed/actions";

export type PostData = {
  id: string;
  author_id: string;
  body: string | null;
  audience: string;
  created_at: string;
  author_name: string;
  author_username: string;
  author_campus?: string;
  author_verified?: boolean;
  author_avatar?: string | null;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
  has_bookmarked: boolean;
  is_following?: boolean;
  media?: Array<{ id: string; storage_path: string; alt_text?: string | null }>;
  comments?: Array<{
    id: string;
    author_id: string;
    author_name: string;
    author_username: string;
    body: string;
    created_at: string;
    parent_id?: string | null;
  }>;
};

export function PostCard({
  post,
  currentUserId,
}: {
  post: PostData;
  currentUserId?: string;
}) {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body || "");
  const [showMenu, setShowMenu] = useState(false);

  // Optimistic Likes
  const [hasLiked, setHasLiked] = useState(post.has_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  // Optimistic Bookmarks
  const [hasBookmarked, setHasBookmarked] = useState(post.has_bookmarked);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [commentInput, setCommentInput] = useState("");

  const isAuthor = currentUserId === post.author_id;
  const initials = post.author_name ? post.author_name.slice(0, 2).toUpperCase() : "CC";
  const profileUrl = post.author_username ? `/u/${post.author_username}` : `/profile?user=${post.author_id}`;

  const handleLike = async () => {
    const nextState = !hasLiked;
    setHasLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    const formData = new FormData();
    formData.append("postId", post.id);
    try {
      await togglePostLike(formData);
    } catch {
      // Revert if error
      setHasLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleBookmark = async () => {
    const nextState = !hasBookmarked;
    setHasBookmarked(nextState);
    const formData = new FormData();
    formData.append("postId", post.id);
    try {
      await togglePostBookmark(formData);
    } catch {
      setHasBookmarked(!nextState);
    }
  };

  return (
    <article
      id={`post-${post.id}`}
      className="real-post"
      style={{
        background: "#ffffff",
        border: "1px solid var(--line, #e5e7eb)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        position: "relative",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "relative",
        }}
      >
        <Link href={profileUrl} style={{ textDecoration: "none", flexShrink: 0 }}>
          {post.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={post.author_name}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "var(--plum, #4a2c35)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
          )}
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Link
              href={profileUrl}
              style={{
                textDecoration: "none",
                color: "var(--ink, #111827)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {post.author_name}
            </Link>
            {post.author_verified && (
              <CheckCircle2
                size={14}
                className="verified-check"
                style={{ color: "#22c55e", flexShrink: 0 }}
                aria-label="Verified IIT/NIT Student"
              />
            )}
            {post.author_campus && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--plum, #4a2c35)",
                  background: "#fcf1ee",
                  padding: "2px 8px",
                  borderRadius: 10,
                  border: "1px solid #ebd3cd",
                }}
              >
                {post.author_campus}
              </span>
            )}
          </div>
          <small style={{ color: "var(--muted, #6b7280)", fontSize: 11, display: "block" }}>
            @{post.author_username} ·{" "}
            {new Date(post.created_at).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })}
          </small>
        </div>

        {/* Three-dot menu */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: "none",
              border: 0,
              padding: "6px",
              color: "var(--muted, #6b7280)",
              cursor: "pointer",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
            }}
            aria-label="Post options"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 32,
                background: "#ffffff",
                border: "1px solid var(--line, #e5e7eb)",
                borderRadius: 10,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                zIndex: 40,
                minWidth: 160,
                overflow: "hidden",
                padding: "4px 0",
              }}
            >
              <Link
                href={profileUrl}
                onClick={() => setShowMenu(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "var(--ink, #111827)",
                  textDecoration: "none",
                }}
              >
                <UserCheck size={15} />
                <span>View Profile</span>
              </Link>

              {isAuthor ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setShowMenu(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      background: "none",
                      border: 0,
                      fontSize: 13,
                      color: "var(--ink, #111827)",
                      cursor: "pointer",
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Edit Post</span>
                  </button>
                  <form action={deletePost}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      onClick={() => setShowMenu(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background: "none",
                        border: 0,
                        fontSize: 13,
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Delete Post</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <form action={toggleFollow}>
                    <input type="hidden" name="targetId" value={post.author_id} />
                    <button
                      type="submit"
                      onClick={() => setShowMenu(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background: "none",
                        border: 0,
                        fontSize: 13,
                        color: "var(--ink, #111827)",
                        cursor: "pointer",
                      }}
                    >
                      {post.is_following ? <UserCheck size={15} /> : <UserPlus size={15} />}
                      <span>{post.is_following ? "Unfollow" : "Follow"}</span>
                    </button>
                  </form>

                  <Link
                    href={`/safety/report?post=${post.id}`}
                    onClick={() => setShowMenu(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#dc2626",
                      textDecoration: "none",
                    }}
                  >
                    <Flag size={15} />
                    <span>Report Post</span>
                  </Link>

                  <form action={blockUserFromFeed}>
                    <input type="hidden" name="targetUserId" value={post.author_id} />
                    <button
                      type="submit"
                      onClick={() => setShowMenu(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background: "none",
                        border: 0,
                        fontSize: 13,
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
                    >
                      <Ban size={15} />
                      <span>Block User</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Post Images / Carousel */}
      {post.media && post.media.length > 0 && (
        <div
          style={{
            marginTop: 14,
            marginBottom: 14,
            borderRadius: 12,
            overflow: "hidden",
            background: "#f3f4f6",
            display: "grid",
            gridTemplateColumns: post.media.length > 1 ? "repeat(2, 1fr)" : "1fr",
            gap: 4,
          }}
        >
          {post.media.map((img) => (
            <img
              key={img.id}
              src={img.storage_path}
              alt={img.alt_text || "Post attachment"}
              style={{
                width: "100%",
                maxHeight: 480,
                objectFit: "cover",
                display: "block",
              }}
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Body / Caption */}
      {isEditing ? (
        <form
          action={async (formData) => {
            await editPost(formData);
            setIsEditing(false);
          }}
          style={{ marginTop: 14 }}
        >
          <input type="hidden" name="postId" value={post.id} />
          <textarea
            name="body"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            required
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="primary-button" type="submit" style={{ padding: "6px 14px", fontSize: 12 }}>
              Save
            </button>
            <button
              type="button"
              className="secondary-button"
              style={{ padding: "6px 14px", fontSize: 12 }}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        post.body && (
          <p
            className="post-caption"
            style={{
              margin: "14px 0 10px",
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink, #1f2937)",
              whiteSpace: "pre-wrap",
            }}
          >
            {post.body}
          </p>
        )
      )}

      {/* Action Row — NO SHARE BUTTON */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--line, #f3f4f6)",
          fontSize: 13,
        }}
      >
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: 0,
            color: hasLiked ? "#e11d48" : "var(--muted, #6b7280)",
            cursor: "pointer",
            fontWeight: hasLiked ? 700 : 500,
            padding: "4px 0",
          }}
          aria-label={hasLiked ? "Unlike post" : "Like post"}
        >
          <Heart
            size={19}
            fill={hasLiked ? "#e11d48" : "none"}
            stroke={hasLiked ? "#e11d48" : "currentColor"}
            strokeWidth={2}
          />
          <span>{likesCount > 0 ? likesCount : "Like"}</span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: 0,
            color: "var(--muted, #6b7280)",
            cursor: "pointer",
            fontWeight: 500,
            padding: "4px 0",
          }}
          aria-label="Comments"
        >
          <MessageCircle size={19} strokeWidth={2} />
          <span>{post.comments_count > 0 ? post.comments_count : "Comment"}</span>
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleBookmark}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: 0,
            color: hasBookmarked ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
            cursor: "pointer",
            fontWeight: hasBookmarked ? 700 : 500,
            padding: "4px 0",
          }}
          aria-label={hasBookmarked ? "Saved" : "Save post"}
        >
          <Bookmark
            size={19}
            fill={hasBookmarked ? "var(--plum, #4a2c35)" : "none"}
            stroke={hasBookmarked ? "var(--plum, #4a2c35)" : "currentColor"}
            strokeWidth={2}
          />
          <span>{hasBookmarked ? "Saved" : "Save"}</span>
        </button>
      </div>

      {/* Comment preview (first comment) when comments are collapsed */}
      {!showComments && post.comments && post.comments.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted, #6b7280)" }}>
          <button
            type="button"
            onClick={() => setShowComments(true)}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              color: "var(--muted, #6b7280)",
              cursor: "pointer",
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            View all {post.comments_count} {post.comments_count === 1 ? "comment" : "comments"}
          </button>
          <div style={{ lineHeight: 1.4 }}>
            <strong style={{ color: "var(--ink, #111827)", marginRight: 6 }}>
              {post.comments[0].author_name}:
            </strong>
            <span>{post.comments[0].body}</span>
          </div>
        </div>
      )}

      {/* Expandable Comments Drawer / Sheet */}
      {showComments && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--line, #e5e7eb)" }}>
          {/* Active Reply Banner */}
          {replyingTo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: "#f3f4f6",
                borderRadius: 6,
                fontSize: 11,
                marginBottom: 8,
              }}
            >
              <span>Replying to <strong>{replyingTo.name}</strong></span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", fontSize: 11 }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Comment composer */}
          <form
            action={async (formData) => {
              if (!commentInput.trim()) return;
              await createComment(formData);
              setCommentInput("");
              setReplyingTo(null);
            }}
            style={{ display: "flex", gap: 8, marginBottom: 16 }}
          >
            <input type="hidden" name="postId" value={post.id} />
            {replyingTo && <input type="hidden" name="parentId" value={replyingTo.id} />}
            <input
              name="body"
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Add a comment..."}
              required
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--line, #e5e7eb)",
                background: "#fbf9f5",
                fontSize: 13,
              }}
            />
            <button
              className="primary-button"
              type="submit"
              disabled={!commentInput.trim()}
              style={{ padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
            >
              <Send size={13} />
              <span>Post</span>
            </button>
          </form>

          {/* Comments list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(!post.comments || post.comments.length === 0) ? (
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0" }}>No comments yet. Be the first to start the conversation.</p>
            ) : (
              post.comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    fontSize: 13,
                    padding: "6px 0",
                    marginLeft: c.parent_id ? 20 : 0,
                    borderLeft: c.parent_id ? "2px solid var(--line, #e5e7eb)" : "none",
                    paddingLeft: c.parent_id ? 10 : 0,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#e5e7eb",
                      color: "var(--ink)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {c.author_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <strong style={{ fontSize: 12, color: "var(--ink)" }}>{c.author_name}</strong>
                      <small style={{ fontSize: 10, color: "var(--muted)" }}>
                        {new Date(c.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </small>
                    </div>
                    <p style={{ margin: "2px 0 4px", fontSize: 13, color: "var(--ink)", lineHeight: 1.4 }}>
                      {c.body}
                    </p>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo({ id: c.id, name: c.author_name });
                        }}
                        style={{
                          background: "none",
                          border: 0,
                          padding: 0,
                          fontSize: 11,
                          color: "var(--muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <CornerDownRight size={11} />
                        <span>Reply</span>
                      </button>

                      {currentUserId === c.author_id && (
                        <form action={deleteComment} style={{ margin: 0 }}>
                          <input type="hidden" name="commentId" value={c.id} />
                          <button
                            type="submit"
                            style={{
                              background: "none",
                              border: 0,
                              padding: 0,
                              fontSize: 11,
                              color: "#dc2626",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
}
