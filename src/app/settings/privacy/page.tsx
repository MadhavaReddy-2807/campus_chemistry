import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updatePrivacy } from "./actions";

export const instant = false;

export default async function PrivacyPage() {
  await connection();
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Privacy controls need Supabase." body="Connect the backend to load and save your account visibility choices." action={{ label: "Back home", href: "/" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Sign in to manage privacy." body="Visibility choices are private account settings." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data: profile } = await supabase.from("profiles").select("social_visibility, dating_visibility, cross_campus_visibility, message_permission, activity_visibility").eq("id", user.id).maybeSingle();
  if (!profile) return <main className="module-page"><DataState title="Complete onboarding first." body="Privacy settings become available after your profile is created." action={{ label: "Continue onboarding", href: "/onboarding" }} /></main>;
  return <main className="module-page"><div className="module-topbar"><Link href="/settings" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/settings" className="text-button">Settings <span>←</span></Link></div><section className="create-card privacy-card"><span className="eyebrow">PRIVACY & CONSENT</span><h1>You decide what gets shared.</h1><p>Dating and social participation remain separate. Changes apply server-side to discovery and message authorization.</p><form action={updatePrivacy} className="privacy-form"><label>Social profile<select name="socialVisibility" defaultValue={profile.social_visibility}><option value="public">Public to verified students</option><option value="private">Private until I approve follows</option></select></label><label>Who can message you<select name="messagePermission" defaultValue={profile.message_permission}><option value="nobody">Nobody</option><option value="matches">Dating matches</option><option value="following">People I follow</option><option value="everyone">Everyone verified</option></select></label><label className="toggle-row"><span><strong>Dating discovery</strong><small>Only applies if you are verified and 18+.</small></span><input name="datingVisibility" type="checkbox" defaultChecked={profile.dating_visibility} /></label><label className="toggle-row"><span><strong>Cross-campus discovery</strong><small>Allow eligible people beyond your institute.</small></span><input name="crossCampusVisibility" type="checkbox" defaultChecked={profile.cross_campus_visibility} /></label><label className="toggle-row"><span><strong>Recent activity</strong><small>Let people see when you were recently active.</small></span><input name="activityVisibility" type="checkbox" defaultChecked={profile.activity_visibility} /></label><button className="primary-button">Save privacy choices <span>→</span></button></form></section></main>;
}
