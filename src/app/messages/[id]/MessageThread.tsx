"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { sendMessage, deleteOwnMessage, markConversationRead } from "./actions";

export type ThreadMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  deleted_at?: string | null;
};

export function MessageThread({
  conversationId,
  userId,
  peerName,
  peerAvatar,
  peerUsername,
  initialMessages,
}: {
  conversationId: string;
  userId: string;
  peerName: string;
  peerAvatar?: string | null;
  peerUsername: string;
  initialMessages: ThreadMessage[];
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>(
    initialMessages.filter((m) => !m.deleted_at)
  );
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Mark read on mount
  useEffect(() => {
    void markConversationRead(conversationId);
  }, [conversationId]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as ThreadMessage;
            if (!newMsg.deleted_at) {
              setMessages((current) =>
                current.some((m) => m.id === newMsg.id) ? current : [...current, newMsg]
              );
              void markConversationRead(conversationId);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedMsg = payload.new as ThreadMessage;
            if (updatedMsg.deleted_at) {
              setMessages((current) => current.filter((m) => m.id !== updatedMsg.id));
            } else {
              setMessages((current) =>
                current.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText("");
    setSending(true);

    try {
      const res = await sendMessage(conversationId, text);
      if (res.success && res.message) {
        setMessages((current) =>
          current.some((m) => m.id === res.message.id) ? current : [...current, res.message]
        );
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to send message.");
      setInputText(text); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!confirm("Delete this message?")) return;
    setMessages((current) => current.filter((m) => m.id !== msgId));
    try {
      await deleteOwnMessage(msgId, conversationId);
    } catch {
      // Ignore or restore
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
        maxHeight: "720px",
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid var(--border-subtle, #e5e7eb)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1.25rem",
          borderBottom: "1px solid #f1f5f9",
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/messages"
            style={{
              color: "#64748b",
              textDecoration: "none",
              fontSize: "1.2rem",
              padding: "0.2rem 0.5rem 0.2rem 0",
            }}
          >
            ←
          </Link>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#f1f5f9",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "0.95rem",
              overflow: "hidden",
            }}
          >
            {peerAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={peerAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              peerName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#111827" }}>{peerName}</div>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>@{peerUsername}</div>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          background: "#fafafa",
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", color: "#9ca3af", fontSize: "0.88rem" }}>
            <p>No messages yet.</p>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Say hi to start the conversation.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === userId;
            const timeStr = new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                  alignSelf: isMine ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "0.65rem 0.95rem",
                    borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMine ? "var(--primary-color, #9f4b59)" : "#ffffff",
                    color: isMine ? "#ffffff" : "#1f2937",
                    fontSize: "0.9rem",
                    lineHeight: 1.45,
                    border: isMine ? "none" : "1px solid #e5e7eb",
                    wordBreak: "break-word",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    position: "relative",
                  }}
                >
                  {m.body}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginTop: "0.2rem",
                    padding: "0 0.3rem",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{timeStr}</span>
                  {isMine && (
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      title="Delete message"
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: "0.6rem",
          padding: "0.85rem 1.25rem",
          background: "#ffffff",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${peerName}...`}
          maxLength={4000}
          disabled={sending}
          style={{
            flex: 1,
            padding: "0.65rem 1rem",
            borderRadius: "999px",
            border: "1px solid #d1d5db",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="primary-button"
          style={{
            borderRadius: "999px",
            padding: "0.65rem 1.35rem",
            fontSize: "0.88rem",
          }}
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
