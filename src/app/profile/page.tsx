import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { MobileNav } from "@/app/_components/MobileNav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toggleFollow } from "./follow-actions";

export const instant = false;
type Profile = { display_name: string; username: string; bio: string | null; degree: string | null; department: string | null; study_year: number | null; verification_status: string; dating_enabled?: boolean; social_visibility?: string };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  await connection();
  if (!hasSupabaseEnv()) return <main className="module-page"><DataState title="Profiles need Supabase." body="Connect the backend to load and persist verified profiles." action={{ label: "Back home", href: "/" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Sign in to view profiles." body="Profile visibility is controlled by authenticated access and privacy settings." action={{ label: "Sign in", href: "/login" }} /></main>;
  const requestedId = (await searchParams).user;
  const targetId = requestedId && /^[0-9a-f-]{36}$/i.test(requestedId) ? requestedId : user.id;
  const isOwner = targetId === user.id;
  const profileQuery = isOwner
    ? await supabase.from("profiles").select("display_name, username, bio, degree, department, study_year, verification_status, dating_enabled, social_visibility").eq("id", targetId).maybeSingle()
    : await supabase.from("profiles").select("display_name, username, bio, degree, department, study_year, verification_status").eq("id", targetId).maybeSingle();
  const profile = profileQuery.data as Profile | null;
  if (!profile) return <main className="module-page"><DataState title="This profile is not available." body="It may be private, removed, or unavailable under the current visibility settings." action={{ label: "Explore people", href: "/explore" }} /></main>;
  const { data: follow } = !isOwner ? await supabase.from("follows").select("follower_id").eq("follower_id", user.id).eq("following_id", targetId).maybeSingle() : { data: null };
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><div>{isOwner ? <Link href="/edit-profile" className="primary-button">Edit profile <span>→</span></Link> : <Link href="/explore" className="text-button">Explore <span>←</span></Link>}<Link href="/" className="text-button module-back">Home <span>←</span></Link></div></div><section className="profile-page-card"><div className="profile-hero-avatar">{profile.display_name.slice(0, 2).toUpperCase()}</div><div className="profile-status"><span className="verified-label">{profile.verification_status === "verified" ? "✓ VERIFIED STUDENT" : "VERIFICATION PENDING"}</span><h1>{profile.display_name}</h1><p>@{profile.username}</p></div><p className="profile-page-bio">{profile.bio || (isOwner ? "Add a little more of you to help campus connections feel more human." : "This student has not added a bio yet.")}</p><div className="profile-facts"><span><strong>STUDY</strong>{profile.degree || "Degree not added"}</span><span><strong>DEPARTMENT</strong>{profile.department || "Department hidden"}</span><span><strong>YEAR</strong>{profile.study_year ? `Year ${profile.study_year}` : "Not added"}</span></div>{isOwner ? <div className="profile-controls"><Link href="/settings/privacy" className="text-button">Privacy controls <span>→</span></Link><span>{profile.dating_enabled ? "Dating enabled" : "Social only"} · {profile.social_visibility === "public" ? "Public social profile" : "Private social profile"}</span></div> : <div className="profile-controls"><form action={toggleFollow}><input type="hidden" name="targetId" value={targetId} /><button className="primary-button" type="submit">{follow ? "Following" : "Follow"} <span>{follow ? "✓" : "+"}</span></button></form><span>Verified profile details are shown according to this student&apos;s visibility settings.</span></div>}</section><MobileNav /></main>;
}
