"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { privacyUpdateSchema } from "@/lib/validators/profile";

export async function updatePrivacy(formData: FormData) {
  const parsed = privacyUpdateSchema.safeParse({ socialVisibility: formData.get("socialVisibility"), datingVisibility: formData.get("datingVisibility") === "on", crossCampusVisibility: formData.get("crossCampusVisibility") === "on", messagePermission: formData.get("messagePermission"), activityVisibility: formData.get("activityVisibility") === "on" });
  if (!parsed.success) throw new Error("Check your privacy choices and try again.");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before changing privacy settings.");
  const { error } = await supabase.rpc("update_my_privacy", { p_social_visibility: parsed.data.socialVisibility, p_dating_visibility: parsed.data.datingVisibility, p_cross_campus_visibility: parsed.data.crossCampusVisibility, p_message_permission: parsed.data.messagePermission, p_activity_visibility: parsed.data.activityVisibility });
  if (error) throw new Error("We could not save your privacy choices yet.");
  revalidatePath("/settings/privacy");
  revalidatePath("/profile");
}
