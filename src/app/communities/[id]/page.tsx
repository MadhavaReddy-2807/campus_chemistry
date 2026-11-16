import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toggleCommunityMembership, createCommunityPost } from "../actions";

export const instant = false;

type CommunityPost = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar?: string | null;
  author_campus?: string | null;
};

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: "4rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 12, border: "1px solid var(--border-subtle, #e5e7eb)" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.3rem", fontWeight: 700, color: "#111827" }}>
          Sign in to view club discussions
        </h1>
        <p style={{ color: "#64748b", margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
          Community discussions and member details are private to campus students.
        </p>
        <Link href="/login" className="primary-button" style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.88rem" }}>
          Sign In
        </Link>
      </div>
    );
  }

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch community
  const { data: comm } = await supabase
    .from("communities")
    .select(`
      id,
      name,
      slug,
      description,
      category,
      campus_scope,
      created_by,
      created_at,
      community_members (
        user_id,
        role
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (!comm) {
    return (
      <AppShell
        activeTab="communities"
        user={
          currentUserProfile
            ? {
                name: currentUserProfile.display_name,
                username: currentUserProfile.username,
                avatar_url: currentUserProfile.avatar_url,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                campus: (currentUserProfile.institutes as any)?.short_name,
              }
            : undefined
        }
      >
        <div style={{ maxWidth: 560, margin: "3rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 12, border: "1px solid var(--border-subtle, #e5e7eb)" }}>
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>Community Not Found</h2>
          <p style={{ color: "#64748b", margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
            This community does not exist or may have been archived.
          </p>
          <Link href="/communities" className="primary-button" style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}>
            Explore Communities
          </Link>
        </div>
      </AppShell>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const membersList = (comm.community_members as any[]) || [];
  const isMember = membersList.some((m) => m.user_id === user.id);
  const memberCount = membersList.length;

  // Fetch discussions/posts
  const { data: postsData } = await supabase
    .from("community_posts")
    .select(`
      id,
      title,
      body,
      created_at,
      author_id,
      profiles (
        display_name,
        username,
        avatar_url,
        institutes (
          short_name
        )
      )
    `)
    .eq("community_id", id)
    .order("created_at", { ascending: false });

  const posts: CommunityPost[] = (postsData || []).map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prof = p.profiles as any;
    return {
      id: p.id,
      title: p.title,
      body: p.body,
      created_at: p.created_at,
      author_id: p.author_id,
      author_name: prof?.display_name || "Student",
      author_username: prof?.username || "student",
      author_avatar: prof?.avatar_url,
      author_campus: prof?.institutes?.short_name,
    };
  });

  return (
    <AppShell
      activeTab="communities"
      user={
        currentUserProfile
          ? {
              name: currentUserProfile.display_name,
              username: currentUserProfile.username,
              avatar_url: currentUserProfile.avatar_url,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              campus: (currentUserProfile.institutes as any)?.short_name,
            }
          : undefined
      }
    >
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "1.25rem 1rem" }}>
        {/* Back Link */}
        <div style={{ marginBottom: "1rem" }}>
          <Link
            href="/communities"
            style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none" }}
          >
            ← Back to all communities
          </Link>
        </div>

        {/* Community Header Card */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--primary-color, #9f4b59)",
                    background: "#fdf2f2",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "6px",
                  }}
                >
                  {comm.category}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  • {memberCount} {memberCount === 1 ? "member" : "members"}
                </span>
              </div>
              <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.45rem", fontWeight: 700, color: "#111827" }}>
                {comm.name}
              </h1>
            </div>

            <form action={toggleCommunityMembership}>
              <input type="hidden" name="communityId" value={comm.id} />
              <button
                type="submit"
                className={isMember ? "secondary-button" : "primary-button"}
                style={{ padding: "0.55rem 1.25rem", fontSize: "0.88rem" }}
              >
                {isMember ? "Joined ✓" : "Join Club"}
              </button>
            </form>
          </div>

          <p style={{ margin: "1rem 0 0 0", fontSize: "0.92rem", lineHeight: 1.55, color: "#374151" }}>
            {comm.description}
          </p>
        </section>

        {/* Discussion Composer (Only if Member) */}
        {isMember ? (
          <section
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle, #e5e7eb)",
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem", fontWeight: 600, color: "#111827" }}>
              Start a Discussion
            </h2>
            <form action={createCommunityPost} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input type="hidden" name="communityId" value={comm.id} />
              <input
                name="title"
                required
                minLength={3}
                maxLength={150}
                placeholder="Topic or question title..."
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
              <textarea
                name="body"
                required
                minLength={5}
                maxLength={3000}
                rows={3}
                placeholder="Share details, code snippets, project links, or discussion points..."
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="primary-button"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}
                >
                  Post Discussion
                </button>
              </div>
            </form>
          </section>
        ) : (
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.88rem", color: "#475569" }}>
              Join this community to start discussions and participate in conversations.
            </span>
            <form action={toggleCommunityMembership}>
              <input type="hidden" name="communityId" value={comm.id} />
              <button
                type="submit"
                className="primary-button"
                style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}
              >
                Join Now
              </button>
            </form>
          </div>
        )}

        {/* Discussions List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>
            Discussions ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle, #e5e7eb)",
                color: "#6b7280",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.92rem" }}>
                No discussions yet. Be the first member to start a discussion thread!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle, #e5e7eb)",
                  padding: "1.25rem",
                }}
              >
                {/* Author Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                  <Link
                    href={`/profile?user=${post.author_id}`}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#f1f5f9",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      overflow: "hidden",
                    }}
                  >
                    {post.author_avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.author_avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      post.author_name.slice(0, 2).toUpperCase()
                    )}
                  </Link>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Link
                        href={`/profile?user=${post.author_id}`}
                        style={{ fontWeight: 600, fontSize: "0.88rem", color: "#111827", textDecoration: "none" }}
                      >
                        {post.author_name}
                      </Link>
                      {post.author_campus && (
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          • {post.author_campus}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      {new Date(post.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", fontWeight: 600, color: "#111827" }}>
                  {post.title}
                </h3>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, color: "#374151", whiteSpace: "pre-line" }}>
                  {post.body}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
