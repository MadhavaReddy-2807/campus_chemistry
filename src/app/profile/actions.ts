"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validators/profile";

export async function updateProfile(formData: FormData) {
  const parsed = profileUpdateSchema.safeParse({ displayName: formData.get("displayName"), username: formData.get("username"), bio: formData.get("bio"), department: formData.get("department"), degree: formData.get("degree"), studyYear: formData.get("studyYear") });
  if (!parsed.success) throw new Error("Check your profile details and try again.");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before editing your profile.");
  const { error } = await supabase.rpc("update_my_profile", { p_display_name: parsed.data.displayName, p_username: parsed.data.username, p_bio: parsed.data.bio, p_department: parsed.data.department, p_degree: parsed.data.degree, p_study_year: parsed.data.studyYear });
  if (error) throw new Error(error.code === "23505" ? "That username is already taken." : "We could not save your profile yet.");
  revalidatePath("/profile");
  revalidatePath("/edit-profile");
}
