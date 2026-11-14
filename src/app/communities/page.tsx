import Link from "next/link";
import { connection } from "next/server";
import { ModuleHeader } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { INITIAL_COMMUNITIES, type Community } from "@/lib/data/communities";
import { toggleCommunityMembership } from "./actions";

export const instant = false;

async function getCommunities(): Promise<Community[]> {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("communities").select("id, name, slug, description, category, campus_scope").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        if (user) {
          const { data: memberships } = await supabase.from("community_members").select("community_id").eq("user_id", user.id);
          const joinedIds = new Set(memberships?.map((m) => m.community_id) ?? []);
          return data.map((c) => ({
            ...c,
            is_member: joinedIds.has(c.id),
          }));
        }
        return data;
      }
    } catch {
      // Fallback
    }
  }
  return INITIAL_COMMUNITIES;
}

export default async function CommunitiesPage() {
  await connection();
  const communities = await getCommunities();

  const categories = [
    "All",
    "Tech & Coding",
    "Creative & Arts",
    "Music & Jamming",
    "Sports & Fitness",
    "Entrepreneurship",
    "Literature & Debating",
  ];

  return (
    <main className="module-page">
      <div className="module-topbar">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <div className="topbar-actions">
          <Link href="/communities/create" className="primary-button">
            Start a club <span>+</span>
          </Link>
          <Link href="/" className="text-button module-back">
            Home <span>←</span>
          </Link>
        </div>
      </div>

      <ModuleHeader
        eyebrow="CAMPUS SOCIETIES & CLUBS"
        title="Find your tribe across IITs & NITs."
        body="Shared interests, campus chapters, and inter-institute collaborations. No awkward networking, just students building together."
      />

      <div className="interest-row" style={{ marginBottom: "2rem" }}>
        {categories.map((cat) => (
          <span key={cat} className="interest-chip">
            {cat}
          </span>
        ))}
      </div>

      <div className="community-grid">
        {communities.map((comm) => (
          <article className="module-card community-card" key={comm.id}>
            <div className="community-card-top">
              <span className="eyebrow">{comm.category}</span>
              <span className="campus-badge">{comm.campus_scope ?? "All IITs & NITs"}</span>
            </div>
            <h2>
              <Link href={`/communities/${comm.id}`}>{comm.name}</Link>
            </h2>
            <p className="community-description">{comm.description}</p>
            <div className="community-footer">
              <span className="member-count">
                <strong>{comm.member_count ?? 50}+</strong> active members
              </span>
              <div className="community-actions">
                <form action={toggleCommunityMembership}>
                  <input type="hidden" name="communityId" value={comm.id} />
                  <button className={comm.is_member ? "secondary-button" : "primary-button"}>
                    {comm.is_member ? "Joined ✓" : "Join Club"}
                  </button>
                </form>
                <Link href={`/communities/${comm.id}`} className="text-button">
                  Discussions <span>→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
