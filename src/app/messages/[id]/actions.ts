"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendMessage(formData: FormData) {
  const conversationId = z.string().uuid().parse(formData.get("conversationId"));
  const body = z.string().trim().min(1).max(4000).parse(formData.get("body"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before sending a message.");
  const { data: allowed, error: limitError } = await supabase.rpc("consume_rate_limit", { p_action: "message_send", p_max_count: 60, p_window_seconds: 60 });
  if (limitError || !allowed) throw new Error("You are sending messages too quickly. Please pause for a moment.");
  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, body });
  if (error) throw new Error("Message could not be sent.");
  redirect(`/messages/${conversationId}`);
}
