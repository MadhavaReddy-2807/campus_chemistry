"use client";

import { useState } from "react";
import Link from "next/link";
import {
  togglePostLike,
  togglePostBookmark,
  createComment,
  deleteComment,
  deletePost,
  editPost,
  toggleFollow,
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
  const [copied, setCopied] = useState(false);

  const isAuthor = currentUserId === post.author_id;
  const initials = post.author_name.slice(0, 2).toUpperCase();

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#post-${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      id={`post-${post.id}`}
      className="real-post"
      style={{
        background: "#ffffff",
        border: "1px solid var(--line)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
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
        <Link
          href={`/profile?user=${post.author_id}`}
          style={{ textDecoration: "none", flexShrink: 0 }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "var(--plum)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link
              href={`/profile?user=${post.author_id}`}
              style={{
                textDecoration: "none",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {post.author_name}
            </Link>
            {post.author_verified && (
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#4f7755",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 900,
                }}
                title="Verified IIT/NIT Student"
              >
                ✓
              </span>
            )}
            {post.author_campus && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--plum)",
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
          <small style={{ color: "var(--muted)", fontSize: 11 }}>
            @{post.author_username} ·{" "}
            {new Date(post.created_at).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })}
          </small>
        </div>

        {/* Actions Menu */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: "none",
              border: 0,
              padding: "4px 8px",
              fontSize: 16,
              color: "var(--muted)",
              cursor: "pointer",
            }}
            aria-label="Post options"
          >
            ···
          </button>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 28,
                background: "#fff",
                border: "1px solid var(--line)",
                borderRadius: 8,
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                zIndex: 20,
                minWidth: 140,
                overflow: "hidden",
              }}
            >
              {isAuthor ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setShowMenu(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      background: "none",
                      border: 0,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Edit post
                  </button>
                  <form action={deletePost}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        background: "none",
                        border: 0,
                        fontSize: 12,
                        color: "#a34c4e",
                        cursor: "pointer",
                      }}
                    >
                      Delete post
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <form action={toggleFollow}>
                    <input type="hidden" name="targetId" value={post.author_id} />
                    <button
                      type="submit"
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        background: "none",
                        border: 0,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {post.is_following ? "Unfollow student" : "Follow student"}
                    </button>
                  </form>
                  <Link
                    href={`/safety/report?post=${post.id}`}
                    style={{
                      display: "block",
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#a34c4e",
                      textDecoration: "none",
                    }}
                  >
                    Report post
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
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
        <p
          style={{
            margin: "14px 0",
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--ink)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {post.body}
        </p>
      )}

      {/* Post Images if present */}
      {post.media && post.media.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: post.media.length > 1 ? "repeat(2, 1fr)" : "1fr",
            gap: 8,
            marginBottom: 14,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {post.media.map((img) => (
            <img
              key={img.id}
              src={img.storage_path}
              alt={img.alt_text || "Post media"}
              style={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          ))}
        </div>
      )}

      {/* Engagement Actions Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--line)",
          fontSize: 12,
        }}
      >
        <form action={togglePostLike} style={{ margin: 0 }}>
          <input type="hidden" name="postId" value={post.id} />
          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: 0,
              color: post.has_liked ? "var(--rose)" : "var(--muted)",
              cursor: "pointer",
              fontWeight: post.has_liked ? 700 : 500,
              padding: "4px 0",
            }}
            aria-label={post.has_liked ? "Unlike post" : "Like post"}
          >
            <span style={{ fontSize: 16 }}>{post.has_liked ? "♥" : "♡"}</span>
            <span>{post.likes_count > 0 ? post.likes_count : "Like"}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            border: 0,
            color: "var(--muted)",
            cursor: "pointer",
            fontWeight: 500,
            padding: "4px 0",
          }}
          aria-label="Comments"
        >
          <span style={{ fontSize: 15 }}>💬</span>
          <span>{post.comments_count > 0 ? post.comments_count : "Comment"}</span>
        </button>

        <form action={togglePostBookmark} style={{ margin: 0 }}>
          <input type="hidden" name="postId" value={post.id} />
          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: 0,
              color: post.has_bookmarked ? "var(--plum)" : "var(--muted)",
              cursor: "pointer",
              padding: "4px 0",
            }}
            aria-label={post.has_bookmarked ? "Saved" : "Save post"}
          >
            <span>{post.has_bookmarked ? "★" : "☆"}</span>
            <span>{post.has_bookmarked ? "Saved" : "Save"}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            border: 0,
            color: "var(--muted)",
            cursor: "pointer",
            marginLeft: "auto",
            padding: "4px 0",
          }}
        >
          <span>↗</span>
          <span>{copied ? "Link copied!" : "Share"}</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
          {/* Comment composer */}
          <form action={createComment} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input type="hidden" name="postId" value={post.id} />
            <input
              name="body"
              type="text"
              placeholder="Add a comment..."
              required
              maxLength={1000}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 20,
                border: "1px solid var(--line)",
                background: "#fbf9f5",
                fontSize: 12,
              }}
            />
            <button
              className="primary-button"
              type="submit"
              style={{ padding: "8px 14px", borderRadius: 20, fontSize: 11 }}
            >
              Post
            </button>
          </form>

          {/* Comment list */}
          {post.comments && post.comments.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    background: "#fbf9f5",
                    padding: "8px 12px",
                    borderRadius: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginBottom: 2 }}>
                      <strong style={{ fontSize: 12 }}>{comment.author_name}</strong>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>
                        @{comment.author_username}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--ink)", wordBreak: "break-word" }}>
                      {comment.body}
                    </p>
                  </div>

                  {comment.author_id === currentUserId && (
                    <form action={deleteComment} style={{ margin: 0 }}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <button
                        type="submit"
                        style={{
                          background: "none",
                          border: 0,
                          color: "var(--soft)",
                          cursor: "pointer",
                          fontSize: 12,
                          padding: "0 4px",
                        }}
                        aria-label="Delete comment"
                      >
                        ✕
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: "6px 0", fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
              No comments yet. Start the conversation.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
