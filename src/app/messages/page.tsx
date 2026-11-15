import Link from "next/link";
import { connection } from "next/server";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { MobileNav } from "@/app/_components/MobileNav";
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

const sampleMatches = [
  { name: "Naina", campus: "IIT Bombay", initials: "NS" },
  { name: "Ananya", campus: "IIT Delhi", initials: "AK" },
  { name: "Rhea", campus: "IIT Madras", initials: "RM" },
  { name: "Tanvi", campus: "NIT Trichy", initials: "TP" },
  { name: "Dev", campus: "IIT Roorkee", initials: "DS" },
];

export default async function MessagesPage() {
  await connection();
  const conversations = await getConversations();

  return (
    <main className="module-page">
      <div className="module-topbar">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <Link href="/" className="text-button">
          Back home <span>←</span>
        </Link>
      </div>

      <ModuleHeader
        eyebrow="YOUR INBOX"
        title="Conversations with room to breathe."
        body="Only authorized conversation members can read or send messages. Realtime delivery will attach to these records."
      />

      {/* Bumble/Tinder-style New Matches Horizontal Carousel Tray */}
      <section className="matches-tray" aria-label="New matches queue">
        <div className="matches-tray-header">
          <strong>NEW MATCHES</strong>
          <span className="matches-count-badge">{sampleMatches.length} recent</span>
        </div>
        <div className="matches-scroll-row">
          {sampleMatches.map((m) => (
            <Link key={m.name} href="/matches" className="match-bubble" aria-label={`Match with ${m.name} from ${m.campus}`}>
              <div className="match-bubble-circle">
                <div className="match-bubble-inner">{m.initials}</div>
              </div>
              <span className="match-bubble-name">{m.name}</span>
              <span className="match-bubble-campus">{m.campus.split(" ")[1] ?? m.campus}</span>
            </Link>
          ))}
        </div>
      </section>

      {!hasSupabaseEnv() || conversations.length === 0 ? (
        <DataState
          title="Your inbox is quiet for now."
          body="Matches, approved direct messages, and event conversations will appear here once the campus backend is connected."
          action={{ label: "Explore discovery", href: "/discover" }}
        />
      ) : (
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <Link className="conversation-row" href={`/messages/${conversation.id}`} key={conversation.id}>
              <span className="module-avatar">CC</span>
              <span>
                <strong>{conversation.kind === "match" ? "New connection" : "Campus conversation"}</strong>
                <small>Conversation created {new Date(conversation.created_at).toLocaleDateString()}</small>
              </span>
              <span>→</span>
            </Link>
          ))}
        </div>
      )}

      <MobileNav activeTab="Messages" />
    </main>
  );
}
