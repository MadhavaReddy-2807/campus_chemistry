import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConversationListClient, type ConversationItem } from "./ConversationListClient";

export const instant = false;

export default async function MessagesPage() {
  await connection();
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch current user's profile for AppShell
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  // Find all conversations the user is a member of
  const { data: userMemberships } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", user.id);

  const conversationIds = (userMemberships || []).map((m) => m.conversation_id);
  const lastReadMap = new Map((userMemberships || []).map((m) => [m.conversation_id, m.last_read_at]));

  const conversationItems: ConversationItem[] = [];

  if (conversationIds.length > 0) {
    // Fetch peer members for these conversations
    const { data: peerMembers } = await supabase
      .from("conversation_members")
      .select(`
        conversation_id,
        user:profiles (
          id,
          display_name,
          username,
          avatar_url,
          institutes (
            short_name
          )
        )
      `)
      .in("conversation_id", conversationIds)
      .neq("user_id", user.id);

    // Fetch latest message for each conversation
    const { data: messages } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .in("conversation_id", conversationIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // Group latest message by conversation_id
    const latestMessageMap = new Map<string, { id: string; sender_id: string; body: string; created_at: string }>();
    for (const msg of messages || []) {
      if (!latestMessageMap.has(msg.conversation_id)) {
        latestMessageMap.set(msg.conversation_id, msg);
      }
    }

    for (const pm of peerMembers || []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const peer = pm.user as any;
      if (!peer) continue;

      const latestMsg = latestMessageMap.get(pm.conversation_id);
      const lastRead = lastReadMap.get(pm.conversation_id);

      const isUnread = Boolean(
        latestMsg &&
        latestMsg.sender_id !== user.id &&
        (!lastRead || new Date(latestMsg.created_at) > new Date(lastRead))
      );

      let timeStr = "";
      if (latestMsg) {
        const d = new Date(latestMsg.created_at);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
          timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else {
          timeStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
        }
      }

      conversationItems.push({
        id: pm.conversation_id,
        peerId: peer.id,
        peerName: peer.display_name || "Student",
        peerUsername: peer.username || "student",
        peerAvatar: peer.avatar_url,
        peerCampus: peer.institutes?.short_name,
        lastMessageSnippet: latestMsg ? latestMsg.body : "Direct conversation started",
        lastMessageTime: timeStr,
        isUnread,
      });
    }
  }

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
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1.25rem 1rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ margin: "0 0 0.25rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
            Messages
          </h1>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#64748b" }}>
            Direct conversations with fellow IIT and NIT students.
          </p>
        </div>

        <ConversationListClient conversations={conversationItems} />
      </div>
    </AppShell>
  );
}
