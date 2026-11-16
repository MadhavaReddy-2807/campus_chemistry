import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Send, RefreshCw } from "lucide-react";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addTicketMessage, reopenTicket } from "../actions";

export const instant = false;

function getStatusBadge(status: string) {
  switch (status) {
    case "open":
      return { label: "Open", bg: "#eff6ff", color: "#1d4ed8" };
    case "in_review":
      return { label: "In Review", bg: "#fef3c7", color: "#b45309" };
    case "waiting_for_user":
      return { label: "Waiting for You", bg: "#f3e8ff", color: "#7e22ce" };
    case "resolved":
      return { label: "Resolved", bg: "#ecfdf5", color: "#047857" };
    case "closed":
      return { label: "Closed", bg: "#f3f4f6", color: "#4b5563" };
    default:
      return { label: status, bg: "#f3f4f6", color: "#4b5563" };
  }
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  if (!hasSupabaseEnv()) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <h2>Sign in to view ticket</h2>
        <Link href="/login" className="primary-button" style={{ display: "inline-block", marginTop: 12 }}>
          Sign In
        </Link>
      </div>
    );
  }

  // Check admin role
  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  const isAdmin = Boolean(adminRole);

  // Fetch ticket
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, user_id, category, subject, description, screenshot_url, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!ticket) notFound();

  // If not admin and not ticket owner, 404
  if (!isAdmin && ticket.user_id !== user.id) notFound();

  // Fetch ticket messages
  const { data: messages } = await supabase
    .from("support_ticket_messages")
    .select(`
      id, sender_id, body, is_admin_reply, created_at,
      sender:profiles(display_name, username, avatar_url)
    `)
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const badge = getStatusBadge(ticket.status);

  return (
    <AppShell>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 80px" }}>
        {/* Back Link */}
        <Link
          href={isAdmin ? "/admin" : "/support"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--muted, #6b7280)",
            textDecoration: "none",
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={16} />
          <span>{isAdmin ? "Back to Admin Dashboard" : "Back to My Tickets"}</span>
        </Link>

        {/* Ticket Header Card */}
        <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid var(--line, #e5e7eb)", padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted, #6b7280)" }}>
                #CC-{ticket.ticket_number} · {ticket.category.toUpperCase()}
              </span>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink, #111827)", margin: "4px 0 0" }}>
                {ticket.subject}
              </h1>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 999,
                background: badge.bg,
                color: badge.color,
                whiteSpace: "nowrap",
              }}
            >
              {badge.label}
            </span>
          </div>

          <small style={{ color: "var(--muted, #9ca3af)", fontSize: 11 }}>
            Opened on {new Date(ticket.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </small>

          {ticket.screenshot_url && (
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>Attached Screenshot:</span>
              <img
                src={ticket.screenshot_url}
                alt="Ticket attachment"
                style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </div>
          )}

          {/* Reopen action if resolved or closed */}
          {(ticket.status === "resolved" || ticket.status === "closed") && (
            <form action={reopenTicket} style={{ marginTop: 14 }}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <button
                type="submit"
                className="secondary-button"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 14px" }}
              >
                <RefreshCw size={13} />
                <span>Reopen this ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* Message Thread */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          {(messages || []).map((msg) => {
            const isStaff = msg.is_admin_reply;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const senderObj = msg.sender as any;
            const senderName = Array.isArray(senderObj) ? senderObj[0]?.display_name : senderObj?.display_name;
            return (
              <div
                key={msg.id}
                style={{
                  background: isStaff ? "#f0fdf4" : "#ffffff",
                  border: isStaff ? "1px solid #bbf7d0" : "1px solid var(--line, #e5e7eb)",
                  borderRadius: 14,
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <strong style={{ fontSize: 13, color: isStaff ? "#166534" : "var(--ink, #111827)" }}>
                      {isStaff ? "Campus Chemistry Staff" : (senderName || "Student")}
                    </strong>
                    {isStaff && (
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#dcfce7", color: "#15803d", fontWeight: 700 }}>
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <small style={{ fontSize: 11, color: "var(--muted, #9ca3af)" }}>
                    {new Date(msg.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </small>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: isStaff ? "#14532d" : "var(--ink, #1f2937)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {msg.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        {ticket.status !== "closed" && (
          <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid var(--line, #e5e7eb)", padding: "18px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px", color: "var(--ink, #111827)" }}>
              Send a Reply
            </h3>
            <form action={addTicketMessage}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <textarea
                name="body"
                rows={3}
                placeholder="Type your response or follow-up question..."
                required
                maxLength={2000}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  border: "1px solid var(--line, #e5e7eb)",
                  background: "#fbf9f5",
                  fontSize: 13,
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="primary-button"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", fontSize: 12 }}
                >
                  <Send size={13} />
                  <span>Send Reply</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
