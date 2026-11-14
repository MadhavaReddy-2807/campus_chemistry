import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveReport } from "./actions";

export const instant = false;

export default async function AdminPage() {
  await connection();
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Admin tools need Supabase." body="Connect the backend before exposing moderation workflows." action={{ label: "Back home", href: "/" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Moderator sign-in required." body="Administrative tools are never public." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data: isModerator } = await supabase.rpc("is_moderator");
  if (!isModerator) return <main className="module-page"><DataState title="This area is restricted." body="Moderation permissions are separate from ordinary account access." action={{ label: "Back home", href: "/" }} /></main>;
  const { data: reports } = await supabase.from("reports").select("id, reason, details, status, created_at").in("status", ["open", "under_review"]).order("created_at", { ascending: true }).limit(50);
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/" className="text-button">Home <span>←</span></Link></div><section className="module-header"><span className="eyebrow">MODERATION QUEUE</span><h1>Review with care.</h1><p>Every moderation action is logged. Private messages are not exposed by default.</p></section><div className="moderation-list">{!reports?.length ? <DataState title="Queue is clear." body="No open reports need review right now." /> : reports.map((report) => <article className="moderation-card" key={report.id}><div><span className="eyebrow">{report.status}</span><h2>{report.reason}</h2><p>{report.details || "No additional context provided."}</p><small>{new Date(report.created_at).toLocaleString()}</small></div><form action={resolveReport} className="moderation-actions"><input type="hidden" name="reportId" value={report.id} /><input type="hidden" name="action" value="dismiss" /><button className="secondary-button">Dismiss</button></form><form action={resolveReport} className="moderation-actions"><input type="hidden" name="reportId" value={report.id} /><input type="hidden" name="action" value="warn" /><button className="primary-button">Warn</button></form></article>)}</div></main>;
}
