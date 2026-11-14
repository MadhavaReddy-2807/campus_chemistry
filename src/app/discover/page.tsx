import Link from "next/link";
import { connection } from "next/server";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendDiscoveryAction } from "./actions";
import { blockUser } from "@/app/safety/actions";

export const instant = false;

type Person = { id: string; display_name: string; username: string; bio: string | null; institute_id: string | null; verification_status: string };

async function getPeople(): Promise<Person[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("id, display_name, username, bio, institute_id, verification_status").eq("verification_status", "verified").eq("dating_visibility", true).eq("dating_enabled", true).limit(24);
  return data ?? [];
}

export default async function DiscoverPage() {
  await connection();
  const people = await getPeople();
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/" className="text-button">Back home <span>←</span></Link></div><ModuleHeader eyebrow="DISCOVERY, WITH INTENTION" title="Meet people who feel like your kind of people." body="Verified profiles only. Dating is opt-in, 18+, and always separate from social participation." />{!hasSupabaseEnv() ? <DataState title="Discovery is waiting for your campus connection." body="Add Supabase credentials and apply the reviewed institute seed to load real eligible profiles. No sample people are presented as real here." action={{ label: "Read setup", href: "/" }} /> : people.length === 0 ? <DataState title="No eligible profiles yet." body="Complete verification, enable dating visibility, and set your preferences to appear here." action={{ label: "Open onboarding", href: "/onboarding" }} /> : <div className="module-grid">{people.map((person) => <article className="module-card profile-module-card" key={person.id}><div className="module-avatar">{person.display_name.slice(0, 2).toUpperCase()}</div><div><span className="verified-label">✓ VERIFIED</span><h2>{person.display_name}</h2><p>@{person.username}</p>{person.bio && <blockquote>{person.bio}</blockquote>}</div><div className="profile-action-row"><form action={sendDiscoveryAction}><input type="hidden" name="targetId" value={person.id} /><input type="hidden" name="action" value="like" /><button className="primary-button">Like <span>♡</span></button></form><form action={sendDiscoveryAction}><input type="hidden" name="targetId" value={person.id} /><input type="hidden" name="action" value="pass" /><button className="secondary-button">Pass</button></form><form action={blockUser}><input type="hidden" name="targetUserId" value={person.id} /><button className="quiet-button">Block</button></form></div></article>)}</div>}</main>;
}
