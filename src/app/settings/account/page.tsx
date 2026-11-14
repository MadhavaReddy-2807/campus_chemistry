import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestAccountDeletion } from "./actions";

export const instant = false;

export default async function AccountSettingsPage() {
  await connection();
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Account controls need Supabase." body="Connect the backend to export your data or request account deletion." action={{ label: "Back to settings", href: "/settings" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Sign in to manage your account." body="Account controls are private to your account." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data: deletion } = await supabase.from("account_deletion_requests").select("status, requested_at").eq("user_id", user.id).eq("status", "pending").maybeSingle();
  return <main className="module-page"><div className="module-topbar"><Link href="/settings" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/settings" className="text-button">Settings <span>←</span></Link></div><section className="module-header"><span className="eyebrow">ACCOUNT CONTROL</span><h1>Your data, your decision.</h1><p>Export the data associated with your account, or submit a deletion request for review. Requests are logged and handled with retention and safety requirements in mind.</p></section><div className="module-grid"><article className="module-card"><h2>Export your data</h2><p>Download a JSON copy of your profile, posts, comments, follows, events, notifications, reports, and discovery activity visible to your account.</p><a className="primary-button" href="/account/export">Download export <span>↓</span></a></article><article className="module-card danger-card"><h2>Request account deletion</h2><p>This does not delete immediately. It creates a private request so safety records, active reports, and legal retention requirements can be reviewed before deletion.</p>{deletion ? <p className="form-success" role="status">Deletion request submitted on {new Date(deletion.requested_at).toLocaleDateString("en-IN")}.</p> : <form action={requestAccountDeletion}><button className="secondary-button" type="submit">Request deletion</button></form>}</article></div></main>;
}
