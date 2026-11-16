"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleFollow, startDirectConversation, blockUser, reportUser } from "./actions";

export type FollowUser = {
  id: string;
  name: string;
  username: string;
  avatar_url?: string | null;
  campus?: string | null;
};

export function ProfileHeaderActions({
  targetId,
  isOwner,
  isFollowing,
}: {
  targetId: string;
  isOwner: boolean;
  isFollowing: boolean;
}) {
  const [following, setFollowing] = useState(isFollowing);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Campus Profile",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore abort
    }
  };

  const handleFollow = () => {
    const nextState = !following;
    setFollowing(nextState);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("targetId", targetId);
      try {
        await toggleFollow(fd);
      } catch {
        setFollowing(!nextState);
      }
    });
  };

  const handleMessage = () => {
    startTransition(async () => {
      await startDirectConversation(targetId);
    });
  };

  const handleBlock = () => {
    if (confirm("Block this student? You will no longer see their posts or be able to message each other.")) {
      startTransition(async () => {
        await blockUser(targetId);
      });
    }
  };

  if (isOwner) {
    return (
      <div className="profile-actions-row">
        <Link href="/edit-profile" className="primary-button" style={{ padding: "0.55rem 1.1rem", fontSize: "0.88rem" }}>
          Edit Profile
        </Link>
        <Link href="/settings" className="secondary-button" style={{ padding: "0.55rem 1.1rem", fontSize: "0.88rem" }}>
          Settings
        </Link>
        <button
          type="button"
          onClick={handleShare}
          className="text-button"
          style={{ padding: "0.55rem 0.9rem", fontSize: "0.88rem", border: "1px solid var(--border-subtle, #e5e7eb)", borderRadius: "8px" }}
        >
          {copied ? "Link Copied ✓" : "Share"}
        </button>
      </div>
    );
  }

  return (
    <div className="profile-actions-row" style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={handleFollow}
        disabled={isPending}
        className={following ? "secondary-button" : "primary-button"}
        style={{ padding: "0.55rem 1.25rem", fontSize: "0.88rem" }}
      >
        {following ? "Following" : "Follow"}
      </button>

      <button
        type="button"
        onClick={handleMessage}
        disabled={isPending}
        className="secondary-button"
        style={{ padding: "0.55rem 1.1rem", fontSize: "0.88rem" }}
      >
        Message
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="text-button"
        style={{ padding: "0.55rem 0.9rem", fontSize: "0.88rem", border: "1px solid var(--border-subtle, #e5e7eb)", borderRadius: "8px" }}
      >
        {copied ? "Copied ✓" : "Share"}
      </button>

      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="More options"
          style={{
            background: "none",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            borderRadius: "8px",
            padding: "0.55rem 0.75rem",
            cursor: "pointer",
            fontSize: "1rem",
            color: "var(--foreground-muted, #64748b)",
          }}
        >
          •••
        </button>

        {showMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "115%",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              minWidth: "150px",
              zIndex: 30,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                setShowReport(true);
              }}
              style={{
                width: "100%",
                padding: "0.65rem 1rem",
                textAlign: "left",
                background: "none",
                border: "none",
                fontSize: "0.85rem",
                cursor: "pointer",
                color: "#374151",
              }}
            >
              Report profile
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                handleBlock();
              }}
              style={{
                width: "100%",
                padding: "0.65rem 1rem",
                textAlign: "left",
                background: "none",
                border: "none",
                borderTop: "1px solid #f3f4f6",
                fontSize: "0.85rem",
                cursor: "pointer",
                color: "#dc2626",
              }}
            >
              Block student
            </button>
          </div>
        )}
      </div>

      {showReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div style={{ background: "#ffffff", borderRadius: "12px", maxWidth: "420px", width: "100%", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 600 }}>Report Student</h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#6b7280" }}>
              Our campus trust & safety team reviews reported profiles against community standards.
            </p>
            <form
              action={async (fd) => {
                await reportUser(fd);
                setShowReport(false);
                alert("Thank you. The report has been submitted to moderators.");
              }}
            >
              <input type="hidden" name="reportedUserId" value={targetId} />
              <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.85rem", fontWeight: 500 }}>
                Reason
                <select
                  name="reason"
                  style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db" }}
                >
                  <option value="Impersonation / Fake Student">Impersonation / Fake Student</option>
                  <option value="Harassment / Unwanted Contact">Harassment / Unwanted Contact</option>
                  <option value="Spam / Commercial Advertising">Spam / Commercial Advertising</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                </select>
              </label>
              <label style={{ display: "block", marginBottom: "1rem", fontSize: "0.85rem", fontWeight: 500 }}>
                Details (optional)
                <textarea
                  name="details"
                  rows={3}
                  maxLength={500}
                  placeholder="Provide context..."
                  style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", resize: "none" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowReport(false)}
                  className="secondary-button"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: "#dc2626" }}
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function FollowersModal({
  title,
  users,
  isOpen,
  onClose,
}: {
  title: string;
  users: FollowUser[];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          maxWidth: "440px",
          width: "100%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#9ca3af" }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "0.5rem 1rem" }}>
          {users.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem 0", color: "#6b7280", fontSize: "0.88rem" }}>No users yet.</p>
          ) : (
            users.map((u) => (
              <Link
                key={u.id}
                href={`/profile?user=${u.id}`}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.6rem 0.5rem",
                  borderBottom: "1px solid #f3f4f6",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "#f1f5f9",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    u.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    @{u.username} {u.campus ? `• ${u.campus}` : ""}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfileFollowCounters({
  followers,
  following,
  postsCount,
}: {
  followers: FollowUser[];
  following: FollowUser[];
  postsCount: number;
}) {
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  return (
    <>
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", fontSize: "0.9rem" }}>
        <span>
          <strong style={{ fontWeight: 600, color: "var(--foreground, #111827)" }}>{postsCount}</strong>{" "}
          <span style={{ color: "var(--foreground-muted, #64748b)" }}>posts</span>
        </span>
        <button
          type="button"
          onClick={() => setModalType("followers")}
          style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}
        >
          <strong style={{ fontWeight: 600, color: "var(--foreground, #111827)" }}>{followers.length}</strong>{" "}
          <span style={{ color: "var(--foreground-muted, #64748b)" }}>followers</span>
        </button>
        <button
          type="button"
          onClick={() => setModalType("following")}
          style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left" }}
        >
          <strong style={{ fontWeight: 600, color: "var(--foreground, #111827)" }}>{following.length}</strong>{" "}
          <span style={{ color: "var(--foreground-muted, #64748b)" }}>following</span>
        </button>
      </div>

      <FollowersModal
        title="Followers"
        users={followers}
        isOpen={modalType === "followers"}
        onClose={() => setModalType(null)}
      />

      <FollowersModal
        title="Following"
        users={following}
        isOpen={modalType === "following"}
        onClose={() => setModalType(null)}
      />
    </>
  );
}
