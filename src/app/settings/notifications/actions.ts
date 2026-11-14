"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const settingsSchema = z.object({ inAppNotifications: z.boolean(), emailNotifications: z.boolean(), webPushNotifications: z.boolean(), readReceipts: z.boolean(), activityStatus: z.boolean() });

export async function updateNotificationSettings(formData: FormData) {
  const parsed = settingsSchema.safeParse({ inAppNotifications: formData.get("inAppNotifications") === "on", emailNotifications: formData.get("emailNotifications") === "on", webPushNotifications: formData.get("webPushNotifications") === "on", readReceipts: formData.get("readReceipts") === "on", activityStatus: formData.get("activityStatus") === "on" });
  if (!parsed.success) throw new Error("Check your notification choices.");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before changing notification settings.");
  const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, in_app_notifications: parsed.data.inAppNotifications, email_notifications: parsed.data.emailNotifications, web_push_notifications: parsed.data.webPushNotifications, read_receipts: parsed.data.readReceipts, activity_status: parsed.data.activityStatus });
  if (error) throw new Error("We could not save notification settings yet.");
  revalidatePath("/settings/notifications");
}
