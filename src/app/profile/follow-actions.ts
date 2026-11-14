"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function toggleFollow(formData: FormData) {
  const targetId = z.string().uuid().parse(formData.get("targetId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before following someone.");
  if (user.id === targetId) throw new Error("You cannot follow your own profile.");
  const { data: target } = await supabase.from("profiles").select("id, social_visibility, verification_status").eq("id", targetId).maybeSingle();
  if (!target || target.social_visibility !== "public" || target.verification_status !== "verified") throw new Error("This profile is not available for following.");
  const { data: existing } = await supabase.from("follows").select("follower_id").eq("follower_id", user.id).eq("following_id", targetId).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
    if (error) throw new Error("We could not unfollow this profile yet.");
  } else {
    const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId, status: "accepted" });
    if (error) throw new Error("We could not follow this profile yet.");
  }
  revalidatePath(`/profile?user=${targetId}`);
}
