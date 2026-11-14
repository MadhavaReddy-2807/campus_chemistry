"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hashCrushIdentifier, MAX_SECRET_CRUSHES } from "@/lib/domain/valentines";

const crushSchema = z.object({
  targetIdentifier: z.string().trim().min(3).max(100),
});

const safetyPlanSchema = z.object({
  buddyName: z.string().trim().min(1).max(80),
  buddyContact: z.string().trim().min(5).max(30),
  venue: z.string().trim().min(2).max(200),
  meetTime: z.string().min(5),
  emergencyNotes: z.string().max(500).optional(),
});

export async function submitSecretCrushAction(_prevState: unknown, formData: FormData) {
  const parsed = crushSchema.safeParse({
    targetIdentifier: formData.get("targetIdentifier"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid campus email or username." };
  }

  if (!hasSupabaseEnv()) {
    return {
      success: true,
      message: "Secret Crush sealed! If they also add you, you'll both receive a private match reveal.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to send a secret crush." };

  // Fetch sender's profile username / email
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const senderIdentifier = profile?.username ?? user.id;
  const senderHash = hashCrushIdentifier(senderIdentifier);
  const targetHash = hashCrushIdentifier(parsed.data.targetIdentifier);

  if (senderHash === targetHash) {
    return { error: "You cannot send a secret crush to yourself!" };
  }

  // Count existing crushes
  const { count } = await supabase
    .from("secret_crushes")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", user.id);

  if ((count ?? 0) >= MAX_SECRET_CRUSHES) {
    return { error: `You've used all ${MAX_SECRET_CRUSHES} secret crushes for Valentine's Week.` };
  }

  // Check if target already crushed on sender (mutual match!)
  const { data: reverseCrush } = await supabase
    .from("secret_crushes")
    .select("id, sender_id")
    .eq("sender_hash", targetHash)
    .eq("target_hash", senderHash)
    .maybeSingle();

  const isMutual = !!reverseCrush;

  // Insert our crush
  const { error } = await supabase.from("secret_crushes").insert({
    sender_id: user.id,
    sender_hash: senderHash,
    target_hash: targetHash,
    is_revealed: isMutual,
  });

  if (error) {
    return { error: "You've already added this person to your secret crush list." };
  }

  // If mutual, update reverse crush to revealed
  if (isMutual && reverseCrush) {
    await supabase.from("secret_crushes").update({ is_revealed: true }).eq("id", reverseCrush.id);
  }

  revalidatePath("/valentines");

  return {
    success: true,
    isMutual,
    message: isMutual
      ? "✨ IT'S A MUTUAL MATCH! Both of you crushed on each other! Check your Matches tab."
      : "🔒 Secret Crush cryptographically sealed. Kept strictly confidential until they add you too.",
  };
}

export async function saveDateSafetyPlanAction(_prevState: unknown, formData: FormData) {
  const parsed = safetyPlanSchema.safeParse({
    buddyName: formData.get("buddyName"),
    buddyContact: formData.get("buddyContact"),
    venue: formData.get("venue"),
    meetTime: formData.get("meetTime"),
    emergencyNotes: formData.get("emergencyNotes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Please fill in your buddy's name, phone, meetup venue, and time." };
  }

  if (!hasSupabaseEnv()) {
    return {
      success: true,
      message: "Safety plan saved! Share the alert link with your buddy before heading out.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to save your safety plan." };

  const { error } = await supabase.from("date_safety_plans").insert({
    user_id: user.id,
    buddy_name: parsed.data.buddyName,
    buddy_contact: parsed.data.buddyContact,
    venue: parsed.data.venue,
    meet_time: new Date(parsed.data.meetTime).toISOString(),
    emergency_notes: parsed.data.emergencyNotes,
  });

  if (error) {
    return { error: "Failed to record safety plan. Please try again." };
  }

  revalidatePath("/valentines");
  return {
    success: true,
    message: "Campus Date Safety Plan active! Remember: you can check in or leave anytime.",
  };
}
