import Link from "next/link";
import { connection } from "next/server";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessageThread, type ThreadMessage } from "./MessageThread";

export const instant = false;

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Database connection required</h2>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: "4rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 12, border: "1px solid var(--border-subtle, #e5e7eb)" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.3rem", fontWeight: 700, color: "#111827" }}>
          Sign in to view this conversation
        </h1>
        <p style={{ color: "#64748b", margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
          Private conversations are only accessible to authenticated students.
        </p>
        <Link href="/login" className="primary-button" style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.88rem" }}>
          Sign In
        </Link>
      </div>
    );
  }

  // Fetch current user profile for AppShell
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  // Check membership
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return (
      <AppShell
        activeTab="messages"
        user={
          currentUserProfile
            ? {
                name: currentUserProfile.display_name,
                username: currentUserProfile.username,
                avatar_url: currentUserProfile.avatar_url,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                campus: (currentUserProfile.institutes as any)?.short_name,
              }
            : undefined
        }
      >
        <div style={{ maxWidth: 560, margin: "3rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 12, border: "1px solid var(--border-subtle, #e5e7eb)" }}>
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>Conversation Unavailable</h2>
          <p style={{ color: "#64748b", margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
            You are not a participant in this conversation or it may have been closed.
          </p>
          <Link href="/messages" className="primary-button" style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}>
            Back to Messages
          </Link>
        </div>
      </AppShell>
    );
  }

  // Fetch peer in conversation
  const { data: peerMembership } = await supabase
    .from("conversation_members")
    .select("user:profiles(id, display_name, username, avatar_url, institutes(short_name))")
    .eq("conversation_id", id)
    .neq("user_id", user.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peerUser = peerMembership?.user as any;
  const peerName = peerUser?.display_name || "Student";
  const peerUsername = peerUser?.username || "student";
  const peerAvatar = peerUser?.avatar_url;

  // Fetch messages
  const { data: messagesData } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at, deleted_at")
    .eq("conversation_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const initialMessages: ThreadMessage[] = (messagesData || []) as ThreadMessage[];

  return (
    <AppShell
      activeTab="messages"
      user={
        currentUserProfile
          ? {
              name: currentUserProfile.display_name,
              username: currentUserProfile.username,
              avatar_url: currentUserProfile.avatar_url,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              campus: (currentUserProfile.institutes as any)?.short_name,
            }
          : undefined
      }
    >
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <MessageThread
          conversationId={id}
          userId={user.id}
          peerName={peerName}
          peerAvatar={peerAvatar}
          peerUsername={peerUsername}
          initialMessages={initialMessages}
        />
      </div>
    </AppShell>
  );
}
