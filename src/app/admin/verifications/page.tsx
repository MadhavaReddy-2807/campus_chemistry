import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reviewVerification } from "../actions";

export const instant = false;

type Related = { display_name?: string; username?: string; short_name?: string };
function first(value: Related | Related[] | null) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminVerificationsPage() {
  await connection();
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Verification review needs Supabase." body="Connect the backend before exposing the moderation queue." action={{ label: "Back home", href: "/" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Moderator sign-in required." body="Verification review is never public." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data: isModerator } = await supabase.rpc("is_moderator");
  if (!isModerator) return <main className="module-page"><DataState title="This area is restricted." body="Verification permissions are separate from ordinary account access." action={{ label: "Back home", href: "/" }} /></main>;
  const { data: requests } = await supabase.from("verification_requests").select("id, email_domain, method, status, expires_at, created_at, profiles(display_name, username), institutes(short_name)").eq("status", "pending").order("created_at", { ascending: true }).limit(50);
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/admin" className="text-button">Moderation <span>←</span></Link></div><section className="module-header"><span className="eyebrow">INSTITUTE VERIFICATION</span><h1>Review membership carefully.</h1><p>Approve only after configured email proof or approved manual review is complete. Every decision updates the profile atomically and is audited.</p></section><div className="moderation-list">{!requests?.length ? <DataState title="No pending verification requests." body="New requests appear after a student submits an approved institute email domain." /> : requests.map((request) => { const profile = first(request.profiles as Related | Related[] | null); const institute = first(request.institutes as Related | Related[] | null); return <article className="moderation-card" key={request.id}><div><span className="eyebrow">{request.method}</span><h2>{profile?.display_name ?? "Student account"}</h2><p>{institute?.short_name ?? "Institute"} · @{profile?.username ?? "private"} · {request.email_domain}</p><small>Expires {request.expires_at ? new Date(request.expires_at).toLocaleString() : "not set"}</small></div><form action={reviewVerification} className="moderation-actions"><input type="hidden" name="requestId" value={request.id} /><input type="hidden" name="decision" value="rejected" /><button className="secondary-button">Reject</button></form><form action={reviewVerification} className="moderation-actions"><input type="hidden" name="requestId" value={request.id} /><input type="hidden" name="decision" value="approved" /><button className="primary-button">Approve</button></form></article>; })}</div></main>;
}
