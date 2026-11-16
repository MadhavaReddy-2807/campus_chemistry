"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!role) {
    throw new Error("Unauthorized: Explicit administrator access required.");
  }
  return { supabase, user };
}

export async function suspendUser(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const targetUserId = z.string().uuid().parse(formData.get("userId"));
  const reason = (formData.get("reason") as string) || "Policy violation";

  const { error } = await supabase
    .from("profiles")
    .update({ verification_status: "suspended", updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) throw new Error("Could not suspend user.");

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "user_suspended",
    target_id: targetUserId,
    metadata: { reason },
    created_at: new Date().toISOString(),
  });

  revalidatePath("/admin");
}

export async function restoreUser(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const targetUserId = z.string().uuid().parse(formData.get("userId"));

  const { error } = await supabase
    .from("profiles")
    .update({ verification_status: "verified", updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) throw new Error("Could not restore user.");

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "user_restored",
    target_id: targetUserId,
    created_at: new Date().toISOString(),
  });

  revalidatePath("/admin");
}

export async function suspendDatingAccess(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const targetUserId = z.string().uuid().parse(formData.get("userId"));

  const { error } = await supabase
    .from("profiles")
    .update({ dating_enabled: false, dating_visibility: false, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) throw new Error("Could not suspend dating access.");

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "dating_access_suspended",
    target_id: targetUserId,
    created_at: new Date().toISOString(),
  });

  revalidatePath("/admin");
}

export async function removeViolatingPost(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const postId = z.string().uuid().parse(formData.get("postId"));
  const reason = (formData.get("reason") as string) || "Content moderation removal";

  const { error } = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) throw new Error("Could not remove post.");

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "post_removed",
    target_id: postId,
    metadata: { reason },
    created_at: new Date().toISOString(),
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/feed");
}

export async function updateTicketStatus(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const ticketId = z.string().uuid().parse(formData.get("ticketId"));
  const status = z.enum(["open", "in_review", "waiting_for_user", "resolved", "closed"]).parse(formData.get("status"));

  const { error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString(), resolved_at: status === "resolved" ? new Date().toISOString() : null })
    .eq("id", ticketId);

  if (error) throw new Error("Could not update ticket status.");

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: `ticket_${status}`,
    target_id: ticketId,
    created_at: new Date().toISOString(),
  });

  revalidatePath("/admin");
  revalidatePath(`/support/${ticketId}`);
}

export async function resolveReport(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const reportId = z.string().uuid().parse(formData.get("reportId"));
  const action = z.enum(["dismiss", "warn", "remove_content", "suspend"]).parse(formData.get("action"));
  const note = (formData.get("note") as string) || "";

  const { error } = await supabase
    .from("reports")
    .update({
      status: action === "dismiss" ? "dismissed" : "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) throw new Error("Report could not be resolved.");

  await supabase.from("moderation_actions").insert({
    moderator_id: user.id,
    report_id: reportId,
    action,
    note: note || null,
  });

  revalidatePath("/admin");
}

export async function reviewVerification(formData: FormData) {
  const { supabase } = await requireAdmin();
  const requestId = z.string().uuid().parse(formData.get("requestId"));
  const decision = z.enum(["approved", "rejected"]).parse(formData.get("decision"));
  const note = z.string().trim().max(2000).parse(formData.get("note") ?? "");

  const { error } = await supabase.rpc("review_verification_request", {
    p_request_id: requestId,
    p_decision: decision,
    p_note: note || null,
  });

  if (error) throw new Error("Verification review could not be completed.");
  revalidatePath("/admin");
}
