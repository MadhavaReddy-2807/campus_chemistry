import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ user: null });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ user: null });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url, institute_id, institutes ( short_name, name )")
      .eq("id", authUser.id)
      .maybeSingle();

    const { count: unreadNotifs } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", authUser.id)
      .is("read_at", null);

    let unreadMessagesCount = 0;
    const { data: memberships } = await supabase
      .from("conversation_members")
      .select("conversation_id, last_read_at")
      .eq("user_id", authUser.id);

    if (memberships && memberships.length > 0) {
      for (const m of memberships) {
        let msgQuery = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", m.conversation_id)
          .neq("sender_id", authUser.id)
          .is("deleted_at", null);
        if (m.last_read_at) {
          msgQuery = msgQuery.gt("created_at", m.last_read_at);
        }
        const { count } = await msgQuery;
        if (count && count > 0) {
          unreadMessagesCount += count;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inst = (profile as any)?.institutes;
    const campusShort = inst ? (Array.isArray(inst) ? inst[0]?.short_name : inst.short_name) : undefined;
    const campusName = inst ? (Array.isArray(inst) ? inst[0]?.name : inst.name) : undefined;

    return NextResponse.json({
      user: {
        id: authUser.id,
        display_name: profile?.display_name || authUser.email?.split("@")[0] || "Student",
        name: profile?.display_name || authUser.email?.split("@")[0] || "Student",
        username: profile?.username || authUser.email?.split("@")[0] || "student",
        institute_id: profile?.institute_id,
        campus_short: campusShort,
        campus: campusName || campusShort,
        avatar_url: profile?.avatar_url,
        unread_notifications: unreadNotifs || 0,
        unread_messages: unreadMessagesCount,
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("Failed to get user summary:", err);
    return NextResponse.json({ user: null });
  }
}
