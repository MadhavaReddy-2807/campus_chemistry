"use client";

import { useState } from "react";
import Link from "next/link";

export type ConversationItem = {
  id: string;
  peerId: string;
  peerName: string;
  peerUsername: string;
  peerAvatar?: string | null;
  peerCampus?: string | null;
  lastMessageSnippet: string;
  lastMessageTime: string;
  isUnread: boolean;
};

export function ConversationListClient({
  conversations,
}: {
  conversations: ConversationItem[];
}) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.peerName.toLowerCase().includes(q) ||
      c.peerUsername.toLowerCase().includes(q) ||
      (c.peerCampus && c.peerCampus.toLowerCase().includes(q)) ||
      c.lastMessageSnippet.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Search Bar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations by student or campus..."
          style={{
            width: "100%",
            padding: "0.65rem 1rem",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            background: "#ffffff",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            color: "#6b7280",
          }}
        >
          {search ? (
            <p>No conversations found matching &ldquo;{search}&rdquo;.</p>
          ) : (
            <>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: 600, color: "#111827" }}>
                Your inbox is quiet
              </p>
              <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
                Connect with students from your campus or start a conversation from their profile.
              </p>
              <Link
                href="/explore"
                className="primary-button"
                style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
              >
                Find Students
              </Link>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            overflow: "hidden",
          }}
        >
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.9rem",
                padding: "0.95rem 1.25rem",
                borderBottom: "1px solid #f1f5f9",
                textDecoration: "none",
                color: "inherit",
                background: c.isUnread ? "#fdf8f8" : "#ffffff",
                transition: "background 0.15s ease",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "1rem",
                  flexShrink: 0,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {c.peerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.peerAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  c.peerName.slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.2rem" }}>
                  <span style={{ fontWeight: c.isUnread ? 700 : 600, fontSize: "0.92rem", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.peerName}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af", flexShrink: 0, marginLeft: "0.5rem" }}>
                    {c.lastMessageTime}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.82rem",
                      color: c.isUnread ? "#111827" : "#64748b",
                      fontWeight: c.isUnread ? 600 : 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.lastMessageSnippet}
                  </p>
                  {c.isUnread && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--primary-color, #9f4b59)",
                        flexShrink: 0,
                        marginLeft: "0.5rem",
                      }}
                    />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
