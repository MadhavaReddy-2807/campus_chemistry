import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveReport } from "./actions";

export const instant = false;

type Report = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};

export default async function AdminPage() {
  await connection();

  if (!hasSupabaseEnv()) {
    return (
      <main className="module-page">
        <div className="module-topbar">
          <Link href="/" className="auth-brand">
            <span className="brand-mark">cc</span>
            <span>campus chemistry</span>
          </Link>
          <div className="topbar-actions">
            <Link href="/admin/verifications" className="secondary-button">
              Review Verifications <span>→</span>
            </Link>
            <Link href="/" className="text-button module-back">
              Home <span>←</span>
            </Link>
          </div>
        </div>

        <section className="module-header" style={{ marginTop: "40px" }}>
          <span className="eyebrow">ADMINISTRATION & SAFETY CENTER</span>
          <h1>Campus Operations Dashboard</h1>
          <p>
            Overseeing student safety, verification requests, and community integrity across all 23 IITs and 31 NITs.
          </p>
        </section>

        {/* Operational Metrics Cards */}
        <div className="admin-kpi-grid">
          <div className="module-card kpi-card">
            <span className="eyebrow">VERIFIED STUDENTS</span>
            <strong>1,420</strong>
            <small>54 Institutes onboarded</small>
          </div>
          <div className="module-card kpi-card">
            <span className="eyebrow">PENDING VERIFICATIONS</span>
            <strong style={{ color: "var(--coral)" }}>14</strong>
            <Link href="/admin/verifications" className="text-button" style={{ padding: 0 }}>
              Review queue <span>→</span>
            </Link>
          </div>
          <div className="module-card kpi-card">
            <span className="eyebrow">ACTIVE MEETUPS</span>
            <strong>28</strong>
            <small>Across IIT Bombay, Delhi, Madras</small>
          </div>
          <div className="module-card kpi-card">
            <span className="eyebrow">OPEN REPORTS</span>
            <strong style={{ color: "var(--plum)" }}>2</strong>
            <small>Under safety review</small>
          </div>
        </div>

        <section style={{ maxWidth: "850px", margin: "40px auto 20px" }}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">ACTIVE REPORT QUEUE</span>
              <h2>Safety Reports Awaiting Action</h2>
            </div>
          </div>

          <div className="moderation-list">
            <article className="moderation-card">
              <div>
                <span className="eyebrow">PENDING REVIEW</span>
                <h2>Inappropriate prompt on discovery card</h2>
                <p>Profile bio contains off-campus commercial promotion link.</p>
                <small>Reported 2 hours ago · IIT Kanpur student</small>
              </div>
              <div className="moderation-actions">
                <button className="secondary-button" disabled>
                  Dismiss
                </button>
                <button className="primary-button" style={{ marginLeft: "8px" }} disabled>
                  Issue Warning
                </button>
              </div>
            </article>

            <article className="moderation-card">
              <div>
                <span className="eyebrow">PENDING REVIEW</span>
                <h2>Unwanted message harassment</h2>
                <p>User attempted repeated messages after unmatch request.</p>
                <small>Reported 6 hours ago · NIT Trichy student</small>
              </div>
              <div className="moderation-actions">
                <button className="secondary-button" disabled>
                  Dismiss
                </button>
                <button className="primary-button" style={{ marginLeft: "8px" }} disabled>
                  Suspend Account
                </button>
              </div>
            </article>
          </div>
        </section>

        <section style={{ maxWidth: "850px", margin: "40px auto 0" }}>
          <div className="module-card" style={{ padding: "24px" }}>
            <span className="eyebrow">AUDIT POLICY</span>
            <h3>Strict Privacy Boundaries</h3>
            <p style={{ color: "var(--muted)", fontSize: "12px", lineHeight: "1.6" }}>
              Per Campus Chemistry privacy guidelines, administrators cannot view private match chat histories or unencrypted personal emails. Only reported snippets or public posts/bios are surfaced during moderation audits.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Moderator sign-in required." body="Administrative tools are never public." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data: isModerator } = await supabase.rpc("is_moderator");
  if (!isModerator) return <main className="module-page"><DataState title="This area is restricted." body="Moderation permissions are separate from ordinary account access." action={{ label: "Back home", href: "/" }} /></main>;

  const { data: reports } = await supabase
    .from("reports")
    .select("id, reason, details, status, created_at")
    .in("status", ["open", "under_review"])
    .order("created_at", { ascending: true })
    .limit(50);

  const { count: pendingVerificationsCount } = await supabase
    .from("verification_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: verifiedUsersCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("verification_status", "verified");

  const { count: activeMeetupsCount } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true });

  return (
    <main className="module-page">
      <div className="module-topbar">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <div className="topbar-actions">
          <Link href="/admin/verifications" className="secondary-button">
            Review Verifications ({pendingVerificationsCount ?? 0}) <span>→</span>
          </Link>
          <Link href="/" className="text-button module-back">
            Home <span>←</span>
          </Link>
        </div>
      </div>

      <section className="module-header" style={{ marginTop: "40px" }}>
        <span className="eyebrow">ADMINISTRATION & SAFETY CENTER</span>
        <h1>Campus Operations Dashboard</h1>
        <p>Every moderation action is cryptographically logged. Private messages are never exposed by default.</p>
      </section>

      <div className="admin-kpi-grid">
        <div className="module-card kpi-card">
          <span className="eyebrow">VERIFIED STUDENTS</span>
          <strong>{verifiedUsersCount ?? 0}</strong>
          <small>Active in network</small>
        </div>
        <div className="module-card kpi-card">
          <span className="eyebrow">PENDING VERIFICATIONS</span>
          <strong style={{ color: "var(--coral)" }}>{pendingVerificationsCount ?? 0}</strong>
          <Link href="/admin/verifications" className="text-button" style={{ padding: 0 }}>
            Review queue <span>→</span>
          </Link>
        </div>
        <div className="module-card kpi-card">
          <span className="eyebrow">ACTIVE MEETUPS</span>
          <strong>{activeMeetupsCount ?? 0}</strong>
          <small>Scheduled events</small>
        </div>
        <div className="module-card kpi-card">
          <span className="eyebrow">REPORTS IN QUEUE</span>
          <strong style={{ color: "var(--plum)" }}>{reports?.length ?? 0}</strong>
          <small>Open safety tickets</small>
        </div>
      </div>

      <section style={{ maxWidth: "850px", margin: "40px auto 20px" }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">ACTIVE REPORTS</span>
            <h2>Review with Care</h2>
          </div>
        </div>

        <div className="moderation-list">
          {!reports?.length ? (
            <DataState title="Queue is clear." body="No open reports need review right now." />
          ) : (
            reports.map((report: Report) => (
              <article className="moderation-card" key={report.id}>
                <div>
                  <span className="eyebrow">{report.status}</span>
                  <h2>{report.reason}</h2>
                  <p>{report.details || "No additional context provided."}</p>
                  <small>{new Date(report.created_at).toLocaleString()}</small>
                </div>
                <form action={resolveReport} className="moderation-actions">
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="action" value="dismiss" />
                  <button className="secondary-button">Dismiss</button>
                </form>
                <form action={resolveReport} className="moderation-actions">
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="action" value="warn" />
                  <button className="primary-button">Warn</button>
                </form>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
