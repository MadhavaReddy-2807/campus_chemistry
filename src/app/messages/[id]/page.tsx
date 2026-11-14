import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendMessage } from "./actions";
import { MessageThread } from "./MessageThread";

export const instant = false;
type Message = { id: string; sender_id: string; body: string; created_at: string };

async function getConversation(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase.from("conversation_members").select("conversation_id").eq("conversation_id", id).eq("user_id", user.id).maybeSingle();
  if (!membership) return null;
  const { data: messages } = await supabase.from("messages").select("id, sender_id, body, created_at").eq("conversation_id", id).order("created_at");
  return { userId: user.id, messages: (messages ?? []) as Message[] };
}

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Conversation details need Supabase." body="Connect the application backend to load authorized messages. No private message data is mocked here." action={{ label: "Back to inbox", href: "/messages" }} /></main>;
  const conversation = await getConversation(id);
  if (!conversation) notFound();
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/messages" className="text-button">Back to inbox <span>←</span></Link></div><section className="conversation-detail"><span className="eyebrow">PRIVATE CONVERSATION</span><h1>A conversation with room to breathe.</h1><MessageThread conversationId={id} userId={conversation.userId} initialMessages={conversation.messages} /><form action={sendMessage} className="message-form"><input type="hidden" name="conversationId" value={id} /><input name="body" required maxLength={4000} placeholder="Write a message..." /><button className="primary-button" aria-label="Send message">Send <span>→</span></button></form></section></main>;
}
