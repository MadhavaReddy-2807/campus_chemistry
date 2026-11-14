"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reportSchema = z.object({ reportedUserId: z.string().uuid(), reason: z.string().trim().min(2).max(80), details: z.string().trim().max(2000) });

export async function blockUser(formData: FormData) {
  const targetUserId = z.string().uuid().parse(formData.get("targetUserId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before blocking a user.");
  const { error } = await supabase.rpc("block_user", { target_user_id: targetUserId });
  if (error) throw new Error("We could not block this user yet.");
  redirect("/discover");
}

export async function reportUser(formData: FormData) {
  const parsed = reportSchema.safeParse({ reportedUserId: formData.get("reportedUserId"), reason: formData.get("reason"), details: formData.get("details") ?? "" });
  if (!parsed.success) throw new Error("Choose a report reason and add any useful context.");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before submitting a report.");
  const { data: allowed, error: limitError } = await supabase.rpc("consume_rate_limit", { p_action: "report_submission", p_max_count: 5, p_window_seconds: 86400 });
  if (limitError || !allowed) throw new Error("You have reached the report limit for today. If someone is in immediate danger, contact local emergency services.");
  const { error } = await supabase.from("reports").insert({ reporter_id: user.id, reported_user_id: parsed.data.reportedUserId, reason: parsed.data.reason, details: parsed.data.details || null });
  if (error) throw new Error("We could not submit the report yet.");
  redirect("/safety");
}
