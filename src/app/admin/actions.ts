"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function resolveReport(formData: FormData) {
  const reportId = z.string().uuid().parse(formData.get("reportId"));
  const action = z.enum(["dismiss", "warn", "remove_content", "suspend", "restore"]).parse(formData.get("action"));
  const note = z.string().trim().max(2000).parse(formData.get("note") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");
  const { data: isModerator, error: roleError } = await supabase.rpc("is_moderator");
  if (roleError || !isModerator) throw new Error("Moderator access required.");
  const { error } = await supabase.from("reports").update({ status: action === "dismiss" ? "dismissed" : "resolved", resolved_at: new Date().toISOString() }).eq("id", reportId);
  if (error) throw new Error("Report could not be updated.");
  const { error: auditError } = await supabase.from("moderation_actions").insert({ moderator_id: user.id, report_id: reportId, action, note: note || null });
  if (auditError) throw new Error("Moderation audit could not be recorded.");
  revalidatePath("/admin");
}

export async function reviewVerification(formData: FormData) {
  const requestId = z.string().uuid().parse(formData.get("requestId"));
  const decision = z.enum(["approved", "rejected"]).parse(formData.get("decision"));
  const note = z.string().trim().max(2000).parse(formData.get("note") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");
  const { data: isModerator, error: roleError } = await supabase.rpc("is_moderator");
  if (roleError || !isModerator) throw new Error("Moderator access required.");
  const { error } = await supabase.rpc("review_verification_request", { p_request_id: requestId, p_decision: decision, p_note: note || null });
  if (error) throw new Error("Verification review could not be completed.");
  revalidatePath("/admin");
}
