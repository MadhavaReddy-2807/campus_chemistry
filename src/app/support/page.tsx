import Link from "next/link";
import { connection } from "next/server";
import { LifeBuoy, Plus, Clock } from "lucide-react";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupportTicket } from "./actions";

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

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();
  const { tab = "tickets" } = await searchParams;

  if (!hasSupabaseEnv()) {
    return <div>Database connection required</div>;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "4rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid var(--line, #e5e7eb)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Sign in to access Help Desk</h1>
        <p style={{ color: "var(--muted, #6b7280)", fontSize: 13, margin: "0 0 20px" }}>
          Support communications and ticket tracking require authenticated student credentials.
        </p>
        <Link href="/login" className="primary-button" style={{ display: "inline-block", fontSize: 13, padding: "10px 24px" }}>
          Sign In
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inst = profile?.institutes as any;
  const campus = inst ? (Array.isArray(inst) ? inst[0]?.short_name : inst.short_name) : undefined;

  // Fetch user's support tickets
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, category, subject, status, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell
      user={
        profile
          ? {
              name: profile.display_name,
              username: profile.username,
              avatar_url: profile.avatar_url,
              campus,
            }
          : undefined
      }
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#eff6ff",
              color: "#2563eb",
              display: "grid",
              placeItems: "center",
            }}
          >
            <LifeBuoy size={24} />
          </div>
          <div>
            <span className="eyebrow">HELP DESK &amp; SAFETY</span>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 0", color: "var(--ink, #111827)" }}>
              Support Center
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--line, #e5e7eb)", marginBottom: 20 }}>
          <Link
            href="/support?tab=tickets"
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: tab === "tickets" ? 700 : 500,
              color: tab === "tickets" ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
              borderBottom: tab === "tickets" ? "2px solid var(--plum, #4a2c35)" : "2px solid transparent",
              textDecoration: "none",
            }}
          >
            My Tickets ({tickets?.length ?? 0})
          </Link>
          <Link
            href="/support?tab=new"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: tab === "new" ? 700 : 500,
              color: tab === "new" ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
              borderBottom: tab === "new" ? "2px solid var(--plum, #4a2c35)" : "2px solid transparent",
              textDecoration: "none",
            }}
          >
            <Plus size={15} />
            <span>New Ticket</span>
          </Link>
        </div>

        {/* Tab 1: New Ticket Form */}
        {tab === "new" ? (
          <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid var(--line, #e5e7eb)", padding: "24px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "var(--ink, #111827)" }}>
              Submit a Request or Report
            </h2>

            <form action={createSupportTicket} className="auth-form">
              <label>
                Category
                <select name="category" required defaultValue="feedback" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line, #e5e7eb)", background: "#fbf9f5" }}>
                  <option value="feedback">General Feedback &amp; Suggestions</option>
                  <option value="bug">Report a Bug / Platform Issue</option>
                  <option value="question">Question about Campus Chemistry</option>
                  <option value="harassment">Report Harassment or Safety Concern</option>
                  <option value="content">Report Inappropriate Content / Impersonation</option>
                  <option value="account">Account &amp; Campus Verification Issue</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </label>

              <label>
                Subject
                <input
                  name="subject"
                  type="text"
                  placeholder="Brief summary of your request"
                  required
                  maxLength={120}
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Provide all relevant details so our campus support team can investigate and assist you."
                  required
                  maxLength={3000}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: "1px solid var(--line, #e5e7eb)",
                    background: "#fbf9f5",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                />
              </label>

              <label>
                Optional Screenshot (PNG, JPG, WebP max 10MB)
                <input name="screenshot" type="file" accept="image/png,image/jpeg,image/webp" />
              </label>

              <button className="primary-button" type="submit" style={{ padding: "12px 24px", fontSize: 13, marginTop: 12 }}>
                Submit Ticket
              </button>
            </form>
          </div>
        ) : (
          /* Tab 2: Ticket List */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(!tickets || tickets.length === 0) ? (
              <div style={{ textAlign: "center", padding: "48px 16px", background: "#ffffff", borderRadius: 16, border: "1px solid var(--line, #e5e7eb)" }}>
                <Clock size={32} style={{ color: "var(--muted, #9ca3af)", margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>No support tickets submitted</h3>
                <p style={{ fontSize: 13, color: "var(--muted, #6b7280)", margin: "0 0 16px" }}>
                  Have an issue, bug, question, or feedback? Create a ticket and our team will respond privately.
                </p>
                <Link href="/support?tab=new" className="primary-button" style={{ display: "inline-block", fontSize: 13 }}>
                  Create Support Ticket
                </Link>
              </div>
            ) : (
              tickets.map((t) => {
                const badge = getStatusBadge(t.status);
                return (
                  <Link
                    key={t.id}
                    href={`/support/${t.id}`}
                    style={{
                      display: "block",
                      background: "#ffffff",
                      borderRadius: 14,
                      border: "1px solid var(--line, #e5e7eb)",
                      padding: "18px 20px",
                      textDecoration: "none",
                      color: "inherit",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted, #6b7280)" }}>
                          #CC-{t.ticket_number} · {t.category.toUpperCase()}
                        </span>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink, #111827)", margin: "4px 0 0" }}>
                          {t.subject}
                        </h2>
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
                      Updated {new Date(t.updated_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </small>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
