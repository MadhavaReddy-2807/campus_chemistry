import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { INITIAL_COMMUNITIES } from "@/lib/data/communities";
import { toggleCommunityMembership, createCommunityPost } from "../actions";

export const instant = false;

type Post = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles?: { display_name: string; username: string } | null;
};

async function getCommunityDetails(id: string) {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: comm } = await supabase.from("communities").select("*").eq("id", id).maybeSingle();
      if (comm) {
        let isMember = false;
        if (user) {
          const { data: mem } = await supabase.from("community_members").select("id").eq("community_id", id).eq("user_id", user.id).maybeSingle();
          isMember = !!mem;
        }
        const { data: posts } = await supabase.from("community_posts").select("id, title, body, created_at, author_id, profiles(display_name, username)").eq("community_id", id).order("created_at", { ascending: false });
        return { community: comm, isMember, posts: (posts as unknown as Post[]) ?? [] };
      }
    } catch {
      // Fallback
    }
  }

  const fallback = INITIAL_COMMUNITIES.find((c) => c.id === id);
  if (!fallback) return null;
  return {
    community: fallback,
    isMember: false,
    posts: [
      {
        id: "post-1",
        title: "Welcome everyone! Introduce yourselves and your campus project",
        body: "Glad to kick this community off. Share what you're tinkering with this semester, what year you're in, and what kind of collaborators you're hoping to meet.",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        author_id: "system",
        profiles: { display_name: "Lead Moderator", username: "campus_mod" },
      },
    ],
  };
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const result = await getCommunityDetails(id);
  if (!result) notFound();

  const { community, isMember, posts } = result;

  return (
    <main className="module-page">
      <div className="module-topbar">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <Link href="/communities" className="text-button module-back">
          Back to all clubs <span>←</span>
        </Link>
      </div>

      <header className="community-header-box">
        <div className="community-header-top">
          <span className="eyebrow">{community.category}</span>
          <span className="campus-badge">{community.campus_scope ?? "All IITs & NITs"}</span>
        </div>
        <h1>{community.name}</h1>
        <p className="community-detail-description">{community.description}</p>
        <div className="community-action-row">
          <form action={toggleCommunityMembership}>
            <input type="hidden" name="communityId" value={community.id} />
            <button className={isMember ? "secondary-button" : "primary-button"}>
              {isMember ? "Leave Community" : "Join this Community"}
            </button>
          </form>
          <span className="community-meta-info">
            {posts.length} {posts.length === 1 ? "Discussion" : "Discussions"}
          </span>
        </div>
      </header>

      <section className="community-content-layout">
        <div className="community-discussion-area">
          <div className="section-heading">
            <div>
              <span className="eyebrow">COMMUNITY FORUM</span>
              <h2>Conversations & Threads</h2>
            </div>
          </div>

          <div className="post-composer-box">
            <form action={createCommunityPost}>
              <input type="hidden" name="communityId" value={community.id} />
              <input
                name="title"
                required
                maxLength={150}
                placeholder="Topic title or question..."
                className="composer-title-input"
              />
              <textarea
                name="body"
                required
                maxLength={3000}
                rows={3}
                placeholder="Share your perspective, project link, or ask for guidance..."
              />
              <div className="composer-footer">
                <span className="hint">Keep interactions constructive and respectful.</span>
                <button className="primary-button" type="submit">
                  Start discussion <span>→</span>
                </button>
              </div>
            </form>
          </div>

          <div className="discussion-list">
            {posts.length === 0 ? (
              <p className="empty-threads">No discussions yet. Start the first thread above!</p>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="module-card discussion-card">
                  <header className="discussion-card-header">
                    <span className="module-avatar">
                      {post.profiles?.display_name.slice(0, 2).toUpperCase() ?? "CC"}
                    </span>
                    <div>
                      <strong>{post.profiles?.display_name ?? "Campus Student"}</strong>
                      <small>
                        @{post.profiles?.username ?? "student"} ·{" "}
                        {new Date(post.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  </header>
                  <h3 className="discussion-title">{post.title}</h3>
                  <p className="discussion-body">{post.body}</p>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="community-sidebar-info">
          <div className="module-card">
            <span className="eyebrow">GUIDELINES</span>
            <h3>Community Norms</h3>
            <ul className="guidelines-list">
              <li>No spam or unvetted commercial promotions.</li>
              <li>Encourage inter-campus collaboration across IITs & NITs.</li>
              <li>Report harassment or inappropriate behavior immediately.</li>
            </ul>
            <Link href="/safety" className="text-button" style={{ marginTop: "1rem" }}>
              Campus Safety Policy <span>↗</span>
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
