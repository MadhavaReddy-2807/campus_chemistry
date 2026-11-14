"use server";

import { revalidatePath } from "next/cache";
import { instituteSelectionSchema, type InstituteSelectionState, instituteEmailSchema, type VerificationRequestState } from "@/lib/validators/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveInstituteSelection(_state: InstituteSelectionState, formData: FormData): Promise<InstituteSelectionState> {
  const parsed = instituteSelectionSchema.safeParse({ instituteId: formData.get("instituteId") });
  if (!parsed.success) return { error: "Choose an institute to continue." };
  let saved = false;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in before starting onboarding." };
    const { data: institute } = await supabase.from("institutes").select("id").eq("id", parsed.data.instituteId).eq("is_active", true).maybeSingle();
    if (!institute) return { error: "That institute is not available in the verified directory." };
    const { error } = await supabase.from("onboarding_drafts").upsert({ user_id: user.id, institute_id: institute.id, current_step: 2, payload: { institute_id: institute.id } });
    if (error) return { error: "We could not save your institute yet. Please try again." };
    revalidatePath("/onboarding");
    saved = true;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Onboarding is not configured yet." };
  }
  if (saved) redirect("/onboarding/verify");
  return {};
}

export async function requestInstituteVerification(_state: VerificationRequestState, formData: FormData): Promise<VerificationRequestState> {
  const parsed = instituteEmailSchema.safeParse({ instituteId: formData.get("instituteId"), email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid institute email address." };
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in before starting verification." };
    const { error } = await supabase.rpc("request_institute_email_verification", { p_institute_id: parsed.data.instituteId, p_email: parsed.data.email });
    if (error) return { error: error.message.includes("approved") ? "That email domain is not approved for the selected institute." : "We could not start verification yet. Please try again." };
    revalidatePath("/onboarding/verify");
    return { success: "Your verification request is recorded. Email delivery must be configured before a link can be sent." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Verification is not configured yet." };
  }
}
