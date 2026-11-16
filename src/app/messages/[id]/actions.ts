"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendMessage(conversationId: string, bodyText: string) {
  const convId = z.string().uuid().parse(conversationId);
  const body = z.string().trim().min(1).max(4000).parse(bodyText);

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before sending a message.");

  // Verify membership
  const { data: member } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", convId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) throw new Error("You are not a participant in this conversation.");

  // Check rate limit
  const { data: allowed } = await supabase.rpc("consume_rate_limit", {
    p_action: "message_send",
    p_max_count: 60,
    p_window_seconds: 60,
  });
  if (allowed === false) throw new Error("Please pause a moment before sending more messages.");

  // Insert message
  const { data: newMsg, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: convId,
      sender_id: user.id,
      body,
    })
    .select("id, conversation_id, sender_id, body, created_at")
    .single();

  if (error) throw new Error("Message could not be sent.");

  // Update sender's last_read_at
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", convId)
    .eq("user_id", user.id);

  // Notify other members
  const { data: otherMembers } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", convId)
    .neq("user_id", user.id);

  if (otherMembers && otherMembers.length > 0) {
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const notifs = otherMembers.map((m) => ({
      user_id: m.user_id,
      type: "message",
      title: "New Message",
      body: `${senderProfile?.display_name || "A student"}: ${body.slice(0, 60)}${body.length > 60 ? "..." : ""}`,
      href: `/messages/${convId}`,
    }));

    await supabase.from("notifications").insert(notifs);
  }

  revalidatePath(`/messages/${convId}`);
  revalidatePath("/messages");
  return { success: true, message: newMsg };
}

export async function deleteOwnMessage(messageId: string, conversationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");

  const { error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("sender_id", user.id);

  if (error) throw new Error("Could not delete message.");

  revalidatePath(`/messages/${conversationId}`);
  return { success: true };
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);
}
