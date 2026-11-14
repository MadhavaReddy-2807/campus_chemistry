"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Message = { id: string; sender_id: string; body: string; created_at: string };

export function MessageThread({ conversationId, userId, initialMessages }: { conversationId: string; userId: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  useEffect(() => {
    const channel = supabase.channel(`conversation:${conversationId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
      const message = payload.new as Message;
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [conversationId, supabase]);
  return <div className="message-list" aria-live="polite">{messages.length === 0 ? <p className="empty-inline">No messages yet. Start with something specific and kind.</p> : messages.map((message) => <div className={`message-bubble ${message.sender_id === userId ? "mine" : "theirs"}`} key={message.id}><p>{message.body}</p><small>{new Date(message.created_at).toLocaleString()}</small></div>)}</div>;
}
