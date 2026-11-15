import Link from "next/link";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { MobileNav } from "@/app/_components/MobileNav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = ((await searchParams).q ?? "").trim().slice(0, 80);
  if (!hasSupabaseEnv()) return <main className="module-page"><ModuleHeader eyebrow="EXPLORE" title="Find people and campus energy." body="Search is database-backed and privacy-aware. No fabricated profiles or results are shown." /><DataState title="Explore is waiting for your campus connection." body="Connect Supabase to search verified, visible profiles and published campus content." action={{ label: "Read setup", href: "/" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Sign in to explore." body="Search results respect profile visibility and database access policies." action={{ label: "Sign in", href: "/login" }} /></main>;
  const [displayNameResult, usernameResult] = query ? await Promise.all([
    supabase.from("profiles").select("id, display_name, username, bio, verification_status").ilike("display_name", `%${query}%`).eq("verification_status", "verified").eq("social_visibility", "public").limit(30),
    supabase.from("profiles").select("id, display_name, username, bio, verification_status").ilike("username", `%${query}%`).eq("verification_status", "verified").eq("social_visibility", "public").limit(30),
  ]) : [{ data: [] }, { data: [] }];
  const profiles = Array.from(new Map([...(displayNameResult.data ?? []), ...(usernameResult.data ?? [])].map((profile) => [profile.id, profile])).values());
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/feed" className="text-button">Feed <span>→</span></Link></div><ModuleHeader eyebrow="EXPLORE" title="Find people and campus energy." body="Search verified, visible profiles. Posts, institutes, interests, and events will join this surface as their modules mature." /><form className="explore-search" method="get"><label htmlFor="q">Search people</label><div><input id="q" name="q" defaultValue={query} placeholder="Name or username" maxLength={80} /><button className="primary-button" type="submit">Search</button></div></form>{query && (profiles?.length ? <div className="module-grid">{profiles.map((profile) => <article className="module-card profile-module-card" key={profile.id}><div className="module-avatar">{profile.display_name.slice(0, 2).toUpperCase()}</div><div><span className="verified-label">✓ VERIFIED</span><h2>{profile.display_name}</h2><p>@{profile.username}</p>{profile.bio && <blockquote>{profile.bio}</blockquote>}</div><Link className="secondary-button" href={`/profile?user=${profile.id}`}>View profile</Link></article>)}</div> : <DataState title="No visible profiles matched that search." body="Try a different name or username. Private profiles and unverified accounts are not returned." />)}<MobileNav /></main>;
}
