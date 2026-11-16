import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import {
  ShieldAlert,
  Users,
  FileText,
  LifeBuoy,
  CheckCircle2,
} from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  suspendUser,
  restoreUser,
  suspendDatingAccess,
  removeViolatingPost,
  updateTicketStatus,
  resolveReport,
} from "./actions";

export const instant = false;

function getStatusBadge(status: string) {
  switch (status) {
    case "open":
      return { label: "Open", bg: "#eff6ff", color: "#1d4ed8" };
    case "in_review":
      return { label: "In Review", bg: "#fef3c7", color: "#b45309" };
    case "waiting_for_user":
      return { label: "Waiting for User", bg: "#f3e8ff", color: "#7e22ce" };
    case "resolved":
      return { label: "Resolved", bg: "#ecfdf5", color: "#047857" };
    case "closed":
      return { label: "Closed", bg: "#f3f4f6", color: "#4b5563" };
    default:
      return { label: status, bg: "#f3f4f6", color: "#4b5563" };
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  await connection();
  const { tab = "overview", q = "" } = await searchParams;

  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="module-page" style={{ maxWidth: 500, margin: "60px auto", textAlign: "center", padding: "32px 20px" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--ink, #111827)" }}>
          Moderator sign-in required
        </h1>
        <p style={{ color: "var(--muted, #6b7280)", fontSize: 14, margin: "0 0 24px" }}>
          Administration and moderation data is never public. Please sign in with administrator credentials.
        </p>
        <Link href="/login" className="primary-button" style={{ display: "inline-block", fontSize: 13, padding: "10px 24px" }}>
          Sign in
        </Link>
      </main>
    );
  }

  // Strict Server-Side Role Enforcement
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!role) {
    return (
      <main className="module-page" style={{ maxWidth: 500, margin: "60px auto", textAlign: "center", padding: "32px 20px" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--ink, #111827)" }}>
          403 — Unauthorized
        </h1>
        <p style={{ color: "var(--muted, #6b7280)", fontSize: 14, margin: "0 0 24px" }}>
          Access to the Campus Chemistry Administration Portal requires an explicit administrator role.
        </p>
        <Link href="/" className="primary-button" style={{ display: "inline-block", fontSize: 13, padding: "10px 24px" }}>
          Return to Campus Feed
        </Link>
      </main>
    );
  }

  // Operational metrics
  const { count: verifiedCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("verification_status", "verified");

  const { count: suspendedCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("verification_status", "suspended");

  const { count: openReportsCount } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  const { count: openTicketsCount } = await supabase
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .in("status", ["open", "in_review", "waiting_for_user"]);

  const { count: datingCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("dating_enabled", true);

  // Tab Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let usersList: any[] = [];
  if (tab === "users") {
    let query = supabase
      .from("profiles")
      .select("id, display_name, username, verification_status, dating_enabled, created_at, institutes(short_name)")
      .order("created_at", { ascending: false })
      .limit(30);

    if (q.trim()) {
      query = query.or(`display_name.ilike.%${q.trim()}%,username.ilike.%${q.trim()}%`);
    }
    const { data } = await query;
    usersList = data || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contentList: any[] = [];
  if (tab === "content") {
    const { data } = await supabase
      .from("posts")
      .select(`
        id, body, audience, created_at, deleted_at,
        author:profiles(id, display_name, username, institutes(short_name)),
        post_media(id, storage_path)
      `)
      .order("created_at", { ascending: false })
      .limit(25);
    contentList = data || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reportsList: any[] = [];
  if (tab === "reports" || tab === "overview") {
    const { data } = await supabase
      .from("reports")
      .select(`
        id, reason, details, status, created_at,
        reporter:profiles!reports_reporter_id_fkey(display_name, username),
        reported:profiles!reports_reported_user_id_fkey(id, display_name, username)
      `)
      .order("created_at", { ascending: false })
      .limit(tab === "overview" ? 5 : 30);
    reportsList = data || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ticketsList: any[] = [];
  if (tab === "support" || tab === "overview") {
    const { data } = await supabase
      .from("support_tickets")
      .select(`
        id, ticket_number, category, subject, status, created_at, updated_at,
        user:profiles(display_name, username)
      `)
      .order("created_at", { ascending: false })
      .limit(tab === "overview" ? 5 : 30);
    ticketsList = data || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let auditLogs: any[] = [];
  if (tab === "audit") {
    const { data } = await supabase
      .from("audit_logs")
      .select(`
        id, action, target_id, metadata, created_at,
        actor:profiles(display_name, username)
      `)
      .order("created_at", { ascending: false })
      .limit(35);
    auditLogs = data || [];
  }

  return (
    <main className="module-page" style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 80px" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--line, #e5e7eb)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="brand-mark" style={{ width: 32, height: 32, fontSize: 14 }}>cc</span>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink, #111827)" }}>
              Admin Operations Portal
            </h1>
            <small style={{ color: "var(--muted, #6b7280)", fontSize: 11 }}>
              IIT &amp; NIT Student Safety, Content Moderation, and Support
            </small>
          </div>
        </div>

        <Link href="/" className="secondary-button" style={{ fontSize: 12, padding: "6px 14px" }}>
          Exit to Feed <span>→</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: 12, border: "1px solid var(--line, #e5e7eb)" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted, #6b7280)", letterSpacing: "0.08em" }}>VERIFIED STUDENTS</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#166534", marginTop: 4 }}>{verifiedCount ?? 0}</div>
          <small style={{ fontSize: 11, color: "var(--muted, #9ca3af)" }}>54 Institutes onboarded</small>
        </div>

        <div style={{ background: "#ffffff", padding: "16px", borderRadius: 12, border: "1px solid var(--line, #e5e7eb)" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted, #6b7280)", letterSpacing: "0.08em" }}>OPEN REPORTS</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#dc2626", marginTop: 4 }}>{openReportsCount ?? 0}</div>
          <small style={{ fontSize: 11, color: "var(--muted, #9ca3af)" }}>Awaiting safety action</small>
        </div>

        <div style={{ background: "#ffffff", padding: "16px", borderRadius: 12, border: "1px solid var(--line, #e5e7eb)" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted, #6b7280)", letterSpacing: "0.08em" }}>ACTIVE TICKETS</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#2563eb", marginTop: 4 }}>{openTicketsCount ?? 0}</div>
          <small style={{ fontSize: 11, color: "var(--muted, #9ca3af)" }}>User inquiries &amp; bugs</small>
        </div>

        <div style={{ background: "#ffffff", padding: "16px", borderRadius: 12, border: "1px solid var(--line, #e5e7eb)" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted, #6b7280)", letterSpacing: "0.08em" }}>DATING PROFILES</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#e11d48", marginTop: 4 }}>{datingCount ?? 0}</div>
          <small style={{ fontSize: 11, color: "var(--muted, #9ca3af)" }}>Opted-in 18+ students</small>
        </div>

        <div style={{ background: "#ffffff", padding: "16px", borderRadius: 12, border: "1px solid var(--line, #e5e7eb)" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted, #6b7280)", letterSpacing: "0.08em" }}>SUSPENDED</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#4b5563", marginTop: 4 }}>{suspendedCount ?? 0}</div>
          <small style={{ fontSize: 11, color: "var(--muted, #9ca3af)" }}>Policy restricted accounts</small>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--line, #e5e7eb)", marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "overview", label: "Overview", icon: ShieldAlert },
          { key: "users", label: "User Management", icon: Users },
          { key: "content", label: "Content Moderation", icon: FileText },
          { key: "reports", label: `Reports (${openReportsCount ?? 0})`, icon: ShieldAlert },
          { key: "support", label: `Support Desk (${openTicketsCount ?? 0})`, icon: LifeBuoy },
          { key: "audit", label: "Audit Logs", icon: CheckCircle2 },
        ].map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <Link
              key={t.key}
              href={`/admin?tab=${t.key}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
                borderBottom: active ? "2px solid var(--plum, #4a2c35)" : "2px solid transparent",
                textDecoration: "none",
              }}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Quick Reports Queue */}
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: 14, border: "1px solid var(--line, #e5e7eb)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Active Safety Reports</h2>
              <Link href="/admin?tab=reports" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}>View all</Link>
            </div>
            {reportsList.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>No open safety reports.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reportsList.map((r) => (
                  <div key={r.id} style={{ padding: "10px 12px", background: "#fdf4f2", borderRadius: 8, border: "1px solid #fed7d7" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: 13, color: "#dc2626" }}>{r.reason}</strong>
                      <span style={{ fontSize: 10, padding: "2px 6px", background: "#fee2e2", borderRadius: 4, fontWeight: 700 }}>{r.status}</span>
                    </div>
                    <p style={{ margin: "4px 0", fontSize: 12, color: "#374151" }}>{r.details || "No details"}</p>
                    <small style={{ fontSize: 10, color: "var(--muted)" }}>Reported by @{r.reporter?.username || "student"} against @{r.reported?.username || "student"}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Support Desk Queue */}
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: 14, border: "1px solid var(--line, #e5e7eb)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Support Tickets</h2>
              <Link href="/admin?tab=support" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}>View all</Link>
            </div>
            {ticketsList.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>No recent tickets.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ticketsList.map((t) => (
                  <Link key={t.id} href={`/support/${t.id}`} style={{ padding: "10px 12px", background: "#fbf9f5", borderRadius: 8, border: "1px solid #e5e7eb", textDecoration: "none", color: "inherit" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: 13, color: "var(--ink)" }}>#{t.ticket_number} - {t.subject}</strong>
                      <span style={{ fontSize: 10, padding: "2px 6px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 4, fontWeight: 700 }}>{t.status}</span>
                    </div>
                    <small style={{ fontSize: 11, color: "var(--muted)" }}>From @{t.user?.username || "student"} · {t.category}</small>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {tab === "users" && (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid var(--line, #e5e7eb)", padding: "20px" }}>
          {/* Search bar */}
          <form method="GET" action="/admin" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input type="hidden" name="tab" value="users" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search students by name or @username..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fbf9f5", fontSize: 13 }}
            />
            <button className="primary-button" type="submit" style={{ padding: "10px 18px", fontSize: 13 }}>
              Search
            </button>
          </form>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left", color: "var(--muted, #6b7280)" }}>
                <th style={{ padding: "10px 8px" }}>Student</th>
                <th style={{ padding: "10px 8px" }}>Campus</th>
                <th style={{ padding: "10px 8px" }}>Verification</th>
                <th style={{ padding: "10px 8px" }}>Dating</th>
                <th style={{ padding: "10px 8px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => {
                const isSuspended = u.verification_status === "suspended";
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 8px" }}>
                      <strong>{u.display_name}</strong>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>@{u.username}</div>
                    </td>
                    <td style={{ padding: "12px 8px" }}>{u.institutes?.short_name || "—"}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: isSuspended ? "#fee2e2" : "#ecfdf5",
                          color: isSuspended ? "#dc2626" : "#059669",
                        }}
                      >
                        {u.verification_status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {u.dating_enabled ? (
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "#fdf2f8", color: "#db2777", fontWeight: 600 }}>
                          Opted in
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, color: "var(--muted)" }}>Off</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <Link href={`/u/${u.username}`} className="secondary-button" style={{ fontSize: 11, padding: "4px 8px" }}>
                          Profile
                        </Link>
                        {isSuspended ? (
                          <form action={restoreUser}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button className="primary-button" style={{ fontSize: 11, padding: "4px 8px" }}>
                              Restore
                            </button>
                          </form>
                        ) : (
                          <form action={suspendUser}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button className="secondary-button" style={{ fontSize: 11, padding: "4px 8px", color: "#dc2626" }}>
                              Suspend
                            </button>
                          </form>
                        )}
                        {u.dating_enabled && (
                          <form action={suspendDatingAccess}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button className="secondary-button" style={{ fontSize: 11, padding: "4px 8px", color: "#be123c" }}>
                              Mute Dating
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Content */}
      {tab === "content" && (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid var(--line, #e5e7eb)", padding: "20px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Post Content Moderation</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {contentList.map((post) => {
              const isDeleted = Boolean(post.deleted_at);
              return (
                <div
                  key={post.id}
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: isDeleted ? "#f9fafb" : "#ffffff",
                    opacity: isDeleted ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <strong>{post.author?.display_name || "Student"}</strong>
                      <span style={{ color: "var(--muted)", fontSize: 11, marginLeft: 6 }}>@{post.author?.username} · {post.author?.institutes?.short_name}</span>
                    </div>
                    {isDeleted && <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 700 }}>REMOVED</span>}
                  </div>
                  <p style={{ margin: "6px 0", fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>
                    {post.body}
                  </p>
                  {post.post_media && post.post_media.length > 0 && (
                    <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
                      {post.post_media.map((m: { id: string; storage_path: string }) => (
                        <img key={m.id} src={m.storage_path} alt="Media" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                      ))}
                    </div>
                  )}
                  {!isDeleted && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                      <form action={removeViolatingPost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button className="secondary-button" style={{ fontSize: 11, padding: "4px 10px", color: "#dc2626" }}>
                          Remove Post
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {tab === "reports" && (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid var(--line, #e5e7eb)", padding: "20px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Safety Reports Queue</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reportsList.map((r) => (
              <div key={r.id} style={{ padding: "16px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626" }}>REPORTED: @{r.reported?.username}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0" }}>{r.reason}</h3>
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "#fee2e2", color: "#991b1b", fontWeight: 700 }}>
                    {r.status}
                  </span>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>
                  {r.details || "No additional context supplied by reporter."}
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <form action={resolveReport}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="action" value="dismiss" />
                    <button className="secondary-button" style={{ fontSize: 11, padding: "6px 12px" }}>Dismiss</button>
                  </form>
                  <form action={resolveReport}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="action" value="warn" />
                    <button className="secondary-button" style={{ fontSize: 11, padding: "6px 12px", color: "#b45309" }}>Issue Warning</button>
                  </form>
                  {r.reported?.id && (
                    <form action={suspendUser}>
                      <input type="hidden" name="userId" value={r.reported.id} />
                      <button className="primary-button" style={{ fontSize: 11, padding: "6px 12px", background: "#dc2626" }}>Suspend Account</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Support Desk */}
      {tab === "support" && (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid var(--line, #e5e7eb)", padding: "20px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Student Support Tickets</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ticketsList.map((t) => {
              const badge = getStatusBadge(t.status);
              return (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#ffffff" }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>#CC-{t.ticket_number} · {t.category.toUpperCase()}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: "2px 0 0" }}>{t.subject}</h3>
                    <small style={{ color: "var(--muted)", fontSize: 11 }}>From @{t.user?.username || "student"}</small>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    <Link href={`/support/${t.id}`} className="primary-button" style={{ fontSize: 11, padding: "6px 14px" }}>
                      Respond
                    </Link>
                    <form action={updateTicketStatus}>
                      <input type="hidden" name="ticketId" value={t.id} />
                      <input type="hidden" name="status" value={t.status === "closed" ? "open" : "closed"} />
                      <button className="secondary-button" style={{ fontSize: 11, padding: "6px 10px" }}>
                        {t.status === "closed" ? "Reopen" : "Close"}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {tab === "audit" && (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid var(--line, #e5e7eb)", padding: "20px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Cryptographic &amp; Moderation Audit Trail</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ padding: "10px 14px", borderRadius: 8, background: "#fbf9f5", border: "1px solid #e5e7eb", fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "var(--ink)" }}>{log.action}</strong>
                  <small style={{ color: "var(--muted)" }}>{new Date(log.created_at).toLocaleString()}</small>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 2 }}>
                  Actor: @{log.actor?.username || "system"} · Target ID: {log.target_id || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
