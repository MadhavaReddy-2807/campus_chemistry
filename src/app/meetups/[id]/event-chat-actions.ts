"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const messageSchema = z.object({
  eventId: z.string().uuid(),
  body: z.string().trim().min(1).max(1000),
});

export async function sendEventChatMessage(_prevState: unknown, formData: FormData) {
  const parsed = messageSchema.safeParse({
    eventId: formData.get("eventId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: "Message must be between 1 and 1000 characters." };
  }

  if (!hasSupabaseEnv()) {
    return { success: true };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to chat in this meetup." };

  const { error } = await supabase.from("event_messages").insert({
    event_id: parsed.data.eventId,
    author_id: user.id,
    body: parsed.data.body,
  });

  if (error) {
    return { error: "Could not send message. You must be a confirmed attendee." };
  }

  revalidatePath(`/meetups/${parsed.data.eventId}`);
  return { success: true };
}
