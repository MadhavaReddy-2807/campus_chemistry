import Link from "next/link";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function MatchesPage() {
  if (!hasSupabaseEnv()) {
    return <main className="module-page"><ModuleHeader eyebrow="MUTUAL INTEREST" title="Your matches, when the feeling is mutual." body="Matches are created atomically on the server and never shown as one-sided interest." /><DataState title="Matches will appear after your campus connection is ready." body="Connect Supabase, verify your institute membership, and express interest in eligible profiles to begin." action={{ label: "Open discovery", href: "/discover" }} /></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="module-page"><DataState title="Sign in to see your matches." body="Your matches are private and only available to your account." action={{ label: "Sign in", href: "/login" }} /></main>;

  const { data } = await supabase.from("matches").select("id, created_at, user_a, user_b").or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq("status", "active").order("created_at", { ascending: false });
  const rows = data ?? [];
  const otherIds = rows.map((row) => row.user_a === user.id ? row.user_b : row.user_a);
  const { data: profiles } = otherIds.length ? await supabase.from("profiles").select("id, display_name, username, bio").in("id", otherIds) : { data: [] };
  const { data: conversations } = rows.length ? await supabase.from("conversations").select("id, match_id").in("match_id", rows.map((row) => row.id)) : { data: [] };
  const conversationMap = new Map((conversations ?? []).map((conversation) => [conversation.match_id, conversation.id]));
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/discover" className="text-button">Discover <span>→</span></Link></div><ModuleHeader eyebrow="MUTUAL INTEREST" title="Your matches, when the feeling is mutual." body="A match means you both chose to connect. Start with a thoughtful message, whenever you feel ready." />{rows.length === 0 ? <DataState title="No matches yet." body="Keep discovery intentional. You can pass, like, or block without creating a visible one-sided trail." action={{ label: "Open discovery", href: "/discover" }} /> : <div className="module-grid">{rows.map((row) => { const otherId = row.user_a === user.id ? row.user_b : row.user_a; const profile = profileMap.get(otherId); const conversationId = conversationMap.get(row.id); if (!profile) return null; return <article className="module-card profile-module-card" key={row.id}><div className="module-avatar">{profile.display_name.slice(0, 2).toUpperCase()}</div><div><span className="verified-label">✓ MATCHED</span><h2>{profile.display_name}</h2><p>@{profile.username}</p>{profile.bio && <blockquote>{profile.bio}</blockquote>}</div>{conversationId ? <Link href={`/messages/${conversationId}`} className="primary-button">Open conversation <span>→</span></Link> : <span className="empty-inline">Conversation is being prepared.</span>}</article>; })}</div>}</main>;
}
