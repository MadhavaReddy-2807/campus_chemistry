import Link from "next/link";
import { connection } from "next/server";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

type Conversation = { id: string; kind: string; created_at: string };
async function getConversations(): Promise<Conversation[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("conversations").select("id, kind, created_at, conversation_members!inner(user_id)").limit(30).order("created_at", { ascending: false });
  return (data as Conversation[] | null) ?? [];
}

export default async function MessagesPage() {
  await connection();
  const conversations = await getConversations();
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/" className="text-button">Back home <span>←</span></Link></div><ModuleHeader eyebrow="YOUR INBOX" title="Conversations with room to breathe." body="Only authorized conversation members can read or send messages. Realtime delivery will attach to these records." />{!hasSupabaseEnv() || conversations.length === 0 ? <DataState title="Your inbox is quiet for now." body="Matches, approved direct messages, and event conversations will appear here once the campus backend is connected." action={{ label: "Explore discovery", href: "/discover" }} /> : <div className="conversation-list">{conversations.map((conversation) => <Link className="conversation-row" href={`/messages/${conversation.id}`} key={conversation.id}><span className="module-avatar">CC</span><span><strong>{conversation.kind === "match" ? "New connection" : "Campus conversation"}</strong><small>Conversation created {new Date(conversation.created_at).toLocaleDateString()}</small></span><span>→</span></Link>)}</div>}</main>;
}
