"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { findInstituteById, isApprovedDomainForInstitute } from "@/lib/data/institutes";
import {
  instituteSelectionSchema,
  type InstituteSelectionState,
  instituteEmailSchema,
  type VerificationRequestState,
} from "@/lib/validators/onboarding";

export type OnboardingState = { error?: string; success?: string };

export async function completeOnboarding(
  _state: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const fullName = (formData.get("fullName") as string | null)?.trim();
  const studyYear = formData.get("studyYear") as string | null;
  const instituteId = formData.get("instituteId") as string | null;
  const bio = (formData.get("bio") as string | null)?.trim() || null;
  const interests = formData.getAll("interests") as string[];

  if (!fullName || fullName.length < 2) {
    return { error: "Please enter your full name (at least 2 characters)." };
  }
  if (!studyYear) {
    return { error: "Please select your year of study." };
  }
  if (!instituteId) {
    return { error: "Please select your IIT/NIT campus." };
  }

  const yearMapping: Record<string, number> = {
    "First Year": 1,
    "Second Year": 2,
    "Third Year": 3,
    "Fourth Year": 4,
    "Fifth Year / Dual Degree": 5,
    "Postgraduate": 6,
    "PhD": 7,
  };
  const yearNumber = yearMapping[studyYear] ?? 1;

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const baseUsername =
          fullName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16) || "student";
        const username = `${baseUsername}.${user.id.slice(0, 4)}`;

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          username,
          display_name: fullName,
          institute_id: instituteId,
          study_year: yearNumber,
          degree: studyYear,
          bio: bio ? bio.slice(0, 300) : null,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          return { error: profileError.message || "Failed to update profile." };
        }

        if (interests.length > 0) {
          const { data: dbInterests } = await supabase
            .from("interests")
            .select("id, name")
            .in("name", interests);

          if (dbInterests && dbInterests.length > 0) {
            const rows = dbInterests.map((interest) => ({
              user_id: user.id,
              interest_id: interest.id,
            }));
            await supabase.from("user_interests").upsert(rows, { onConflict: "user_id,interest_id" });
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
      return { error: error instanceof Error ? error.message : "Failed to save profile." };
    }
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/profile");
  redirect("/");
}

export async function saveInstituteSelection(
  _state: InstituteSelectionState,
  formData: FormData
): Promise<InstituteSelectionState> {
  const parsed = instituteSelectionSchema.safeParse({ instituteId: formData.get("instituteId") });
  if (!parsed.success) return { error: "Choose an institute to continue." };
  let saved = false;

  if (!hasSupabaseEnv()) {
    const known = findInstituteById(parsed.data.instituteId);
    if (!known) return { error: "That institute is not available in the verified directory." };
    saved = true;
  } else {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: "Sign in before starting onboarding." };
      const { data: institute } = await supabase
        .from("institutes")
        .select("id")
        .eq("id", parsed.data.instituteId)
        .eq("is_active", true)
        .maybeSingle();
      if (!institute) {
        const known = findInstituteById(parsed.data.instituteId);
        if (!known) return { error: "That institute is not available in the verified directory." };
      }
      const { error } = await supabase.from("onboarding_drafts").upsert({
        user_id: user.id,
        institute_id: parsed.data.instituteId,
        current_step: 2,
        payload: { institute_id: parsed.data.instituteId },
      });
      if (error) return { error: "We could not save your institute yet. Please try again." };
      revalidatePath("/onboarding");
      saved = true;
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Onboarding is not configured yet." };
    }
  }

  if (saved) redirect("/onboarding/verify");
  return {};
}

export async function requestInstituteVerification(
  _state: VerificationRequestState,
  formData: FormData
): Promise<VerificationRequestState> {
  const parsed = instituteEmailSchema.safeParse({
    instituteId: formData.get("instituteId"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: "Enter a valid institute email address." };

  if (!hasSupabaseEnv()) {
    if (!isApprovedDomainForInstitute(parsed.data.instituteId, parsed.data.email)) {
      return { error: "That email domain is not approved for the selected institute." };
    }
    return {
      success: "Verification verified for preview. In production, a secure one-time link is delivered to your institute inbox.",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in to request verification." };

    const emailDomain = parsed.data.email.split("@")[1]?.toLowerCase() ?? "";
    const { data: domainCheck } = await supabase
      .from("institute_domains")
      .select("id")
      .eq("institute_id", parsed.data.instituteId)
      .eq("domain", emailDomain)
      .eq("is_active", true)
      .maybeSingle();

    if (!domainCheck) {
      return {
        error: "That email domain is not an approved domain for your institute. Contact campus support or use manual verification.",
      };
    }

    const { error: insertError } = await supabase.from("verification_requests").insert({
      user_id: user.id,
      institute_id: parsed.data.instituteId,
      email_domain: emailDomain,
      method: "institute_email",
      status: "pending",
      expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    });

    if (insertError) {
      return { error: "Could not create verification request: " + insertError.message };
    }

    return {
      success: "Verification request recorded for your domain. Click the confirmation link delivered to your student email.",
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Verification request failed." };
  }
}
