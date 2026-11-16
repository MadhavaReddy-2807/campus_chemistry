"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ticketSchema = z.object({
  category: z.enum(["feedback", "bug", "question", "harassment", "content", "account", "other"]),
  subject: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(3000),
});

export async function createSupportTicket(formData: FormData) {
  const category = formData.get("category");
  const subject = formData.get("subject");
  const description = formData.get("description");
  const file = formData.get("screenshot") as File | null;

  const parsed = ticketSchema.safeParse({ category, subject, description });
  if (!parsed.success) {
    throw new Error("Please select a category, enter a clear subject, and describe the issue (at least 10 characters).");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before submitting a support request.");

  let screenshotUrl: string | null = null;

  // Optional screenshot upload
  if (file && typeof file === "object" && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Screenshot must be under 10MB.");
    }
    const fileExt = file.name.split(".").pop() || "png";
    const storagePath = `${user.id}/${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("support-attachments")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("support-attachments")
        .getPublicUrl(storagePath);
      screenshotUrl = urlData.publicUrl;
    }
  }

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
      screenshot_url: screenshotUrl,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !ticket) {
    throw new Error("Failed to create support ticket. Please try again.");
  }

  // Create initial message
  await supabase.from("support_ticket_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    body: parsed.data.description,
    is_admin_reply: false,
    created_at: new Date().toISOString(),
  });

  revalidatePath("/support");
  redirect(`/support/${ticket.id}`);
}

export async function addTicketMessage(formData: FormData) {
  const ticketId = z.string().uuid().parse(formData.get("ticketId"));
  const body = z.string().trim().min(1).max(2000).parse(formData.get("body"));

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before replying.");

  // Check if admin
  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  const isAdmin = Boolean(adminRole);

  const { error } = await supabase.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    body,
    is_admin_reply: isAdmin,
    created_at: new Date().toISOString(),
  });

  if (error) throw new Error("Could not send reply.");

  // Update ticket updated_at and status
  const nextStatus = isAdmin ? "waiting_for_user" : "in_review";
  await supabase
    .from("support_tickets")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  // If admin replied, send notification to ticket owner
  if (isAdmin) {
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("user_id, ticket_number, subject")
      .eq("id", ticketId)
      .single();

    if (ticket && ticket.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: ticket.user_id,
        type: "support",
        title: `Support update on #${ticket.ticket_number}`,
        body: `Staff responded to "${ticket.subject}": "${body.slice(0, 60)}..."`,
        href: `/support/${ticketId}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  revalidatePath(`/support/${ticketId}`);
  revalidatePath("/support");
  revalidatePath("/admin");
}

export async function reopenTicket(formData: FormData) {
  const ticketId = z.string().uuid().parse(formData.get("ticketId"));
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to reopen ticket.");

  await supabase
    .from("support_tickets")
    .update({ status: "open", updated_at: new Date().toISOString() })
    .eq("id", ticketId)
    .eq("user_id", user.id);

  revalidatePath(`/support/${ticketId}`);
  revalidatePath("/support");
}
