import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/profile/actions";

export const instant = false;

export default async function EditProfilePage() {
  await connection();
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Profile editing needs Supabase." body="Connect the backend to save profile changes securely." action={{ label: "Back home", href: "/" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Sign in to edit your profile." body="Your profile details are only editable by your account." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data: profile } = await supabase.from("profiles").select("display_name, username, bio, degree, department, study_year").eq("id", user.id).maybeSingle();
  if (!profile) return <main className="module-page"><DataState title="No profile yet." body="Complete onboarding before editing profile details." action={{ label: "Start onboarding", href: "/onboarding" }} /></main>;
  return <main className="module-page"><div className="module-topbar"><Link href="/profile" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/profile" className="text-button">Cancel <span>×</span></Link></div><section className="create-card"><span className="eyebrow">YOUR PROFILE</span><h1>Make it sound like you.</h1><p>These details can be edited later. Your student email and verification records never appear here.</p><form action={updateProfile} className="post-form"><label>Display name<input name="displayName" required maxLength={80} defaultValue={profile.display_name} /></label><label>Username<input name="username" required maxLength={24} defaultValue={profile.username} /></label><label>Bio<textarea name="bio" maxLength={500} defaultValue={profile.bio ?? ""} placeholder="A sentence that sounds like you..." /></label><div className="form-two-column"><label>Degree<input name="degree" maxLength={120} defaultValue={profile.degree ?? ""} placeholder="B.Tech" /></label><label>Study year<input name="studyYear" type="number" min="1" max="10" defaultValue={profile.study_year ?? 1} /></label></div><label>Department<input name="department" maxLength={120} defaultValue={profile.department ?? ""} placeholder="Computer Science" /></label><button className="primary-button">Save profile <span>→</span></button></form></section></main>;
}
