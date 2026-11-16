import { connection } from "next/server";
import Link from "next/link";
import { AppShell } from "@/app/_components/AppShell";
import { type UserSummary } from "@/app/_components/AppSidebar";
import { PostCard, type PostData } from "@/app/_components/PostCard";
import { toggleFollow } from "@/app/feed/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OFFICIAL_INSTITUTES } from "@/lib/data/institutes";
import { INITIAL_COMMUNITIES } from "@/lib/data/communities";

export const instant = false;

type ExplorePerson = {
  id: string;
  display_name: string;
  username: string;
  bio: string | null;
  campus?: string;
  is_following?: boolean;
};

type ExploreCommunity = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  campus_scope: string;
  member_count?: number;
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 80);
  const filterType = params.type || "all";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentUser: any = null;
  let userProfile: UserSummary | null = null;

  let people: ExplorePerson[] = [];
  let posts: PostData[] = [];
  let communities: ExploreCommunity[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let campuses: any[] = [];

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        currentUser = user;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, display_name, username, institutes(short_name)")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          const inst = profile.institutes as { short_name?: string } | null;
          userProfile = {
            id: profile.id,
            display_name: profile.display_name,
            username: profile.username,
            campus_short: inst?.short_name,
          };
        }
      }

      // 1. Search People
      if (filterType === "all" || filterType === "people") {
        let pQuery = supabase
          .from("profiles")
          .select("id, display_name, username, bio, verification_status, institutes(short_name)")
          .eq("social_visibility", "public")
          .limit(20);

        if (query) {
          pQuery = pQuery.or(`display_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`);
        }

        const { data: pData } = await pQuery;

        if (pData) {
          let followingSet = new Set<string>();
          if (currentUser) {
            const { data: follows } = await supabase
              .from("follows")
              .select("following_id")
              .eq("follower_id", currentUser.id);
            followingSet = new Set(follows?.map((f) => f.following_id) || []);
          }

          people = pData
            .filter((p) => p.id !== currentUser?.id)
            .map((p) => ({
              id: p.id,
              display_name: p.display_name,
              username: p.username,
              bio: p.bio,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              campus: (p as any).institutes?.short_name,
              is_following: followingSet.has(p.id),
            }));
        }
      }

      // 2. Search Posts
      if (filterType === "all" || filterType === "posts") {
        let postQuery = supabase
          .from("posts")
          .select(`
            id,
            author_id,
            body,
            audience,
            created_at,
            profiles!posts_author_id_fkey (
              id,
              display_name,
              username,
              verification_status,
              institutes (short_name)
            ),
            post_media (id, storage_path, alt_text),
            post_likes (user_id),
            comments (id, author_id, body, created_at, profiles!comments_author_id_fkey (display_name, username))
          `)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(20);

        if (query) {
          postQuery = postQuery.ilike("body", `%${query}%`);
        }

        const { data: postData } = await postQuery;
        if (postData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          posts = postData.map((item: any) => ({
            id: item.id,
            author_id: item.author_id,
            body: item.body,
            audience: item.audience,
            created_at: item.created_at,
            author_name: item.profiles?.display_name || "Campus Student",
            author_username: item.profiles?.username || "student",
            author_campus: item.profiles?.institutes?.short_name,
            author_verified: item.profiles?.verification_status === "verified",
            likes_count: item.post_likes?.length || 0,
            comments_count: item.comments?.length || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            has_liked: currentUser ? item.post_likes?.some((l: any) => l.user_id === currentUser.id) : false,
            has_bookmarked: false,
            media: item.post_media || [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            comments: (item.comments || []).map((c: any) => ({
              id: c.id,
              author_id: c.author_id,
              author_name: c.profiles?.display_name || "Student",
              author_username: c.profiles?.username || "student",
              body: c.body,
              created_at: c.created_at,
            })),
          }));
        }
      }

      // 3. Search Communities
      if (filterType === "all" || filterType === "communities") {
        let cQuery = supabase
          .from("communities")
          .select("id, name, slug, description, category, campus_scope")
          .limit(20);

        if (query) {
          cQuery = cQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
        }

        const { data: cData } = await cQuery;
        if (cData && cData.length > 0) {
          communities = cData;
        } else {
          communities = INITIAL_COMMUNITIES.filter(
            (c) =>
              !query ||
              c.name.toLowerCase().includes(query.toLowerCase()) ||
              c.description.toLowerCase().includes(query.toLowerCase())
          );
        }
      }

      // 4. Search Campuses
      if (filterType === "all" || filterType === "campuses") {
        campuses = OFFICIAL_INSTITUTES.filter(
          (inst) =>
            !query ||
            inst.official_name.toLowerCase().includes(query.toLowerCase()) ||
            inst.short_name.toLowerCase().includes(query.toLowerCase()) ||
            inst.city.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 16);
      }
    } catch {
      // Fallback
    }
  } else {
    communities = INITIAL_COMMUNITIES.slice(0, 6);
    campuses = OFFICIAL_INSTITUTES.slice(0, 8);
  }

  const filterTabs = [
    { id: "all", label: "All" },
    { id: "people", label: "Students" },
    { id: "posts", label: "Posts" },
    { id: "campuses", label: "Campuses" },
    { id: "communities", label: "Clubs" },
  ];

  return (
    <AppShell user={userProfile} activeTab="Explore" headerTitle="Explore Campus">
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px" }}>
        {/* Search Bar */}
        <form method="get" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search students, campuses, topics, or clubs..."
              maxLength={80}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 24,
                border: "1px solid var(--line)",
                background: "#ffffff",
                fontSize: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            />
            {filterType !== "all" && <input type="hidden" name="type" value={filterType} />}
            <button
              className="primary-button"
              type="submit"
              style={{ padding: "0 20px", borderRadius: 24, fontSize: 13 }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
          {filterTabs.map((tab) => {
            const isSelected = filterType === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/explore?type=${tab.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  textDecoration: "none",
                  border: isSelected ? "1px solid var(--plum)" : "1px solid var(--line)",
                  background: isSelected ? "#f4e5e0" : "#ffffff",
                  color: isSelected ? "var(--plum)" : "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* 1. People Results */}
        {(filterType === "all" || filterType === "people") && people.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span className="eyebrow">STUDENTS</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{people.length} found</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {people.map((person) => (
                <div
                  key={person.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--plum)",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {person.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Link
                        href={`/profile?user=${person.id}`}
                        style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}
                      >
                        {person.display_name}
                      </Link>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        @{person.username} {person.campus && `· ${person.campus}`}
                      </span>
                    </div>
                  </div>
                  {person.bio && (
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.4 }}>
                      {person.bio.slice(0, 70)}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <form action={toggleFollow} style={{ margin: 0, flex: 1 }}>
                      <input type="hidden" name="targetId" value={person.id} />
                      <button
                        className={person.is_following ? "secondary-button" : "primary-button"}
                        style={{ width: "100%", padding: "6px", fontSize: 11 }}
                      >
                        {person.is_following ? "Following" : "Follow"}
                      </button>
                    </form>
                    <Link
                      href={`/profile?user=${person.id}`}
                      className="secondary-button"
                      style={{ padding: "6px 10px", fontSize: 11, textDecoration: "none" }}
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. Posts Results */}
        {(filterType === "all" || filterType === "posts") && posts.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span className="eyebrow">POSTS</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{posts.length} found</span>
            </div>
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
              ))}
            </div>
          </section>
        )}

        {/* 3. Campuses Results */}
        {(filterType === "all" || filterType === "campuses") && campuses.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span className="eyebrow">INSTITUTES</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{campuses.length} campuses</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {campuses.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/?tab=my-campus`}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: "12px",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <strong style={{ fontSize: 13, display: "block", color: "var(--ink)" }}>{inst.short_name}</strong>
                  <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>{inst.official_name}</span>
                  <span style={{ fontSize: 10, color: "var(--rose)", fontWeight: 600, marginTop: 4, display: "inline-block" }}>
                    {inst.city}, {inst.state}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. Clubs & Communities Results */}
        {(filterType === "all" || filterType === "communities") && communities.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span className="eyebrow">CAMPUS CLUBS &amp; SOCIETIES</span>
              <Link href="/communities" style={{ fontSize: 11, color: "var(--rose)", textDecoration: "none" }}>
                Browse all <span>→</span>
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {communities.map((comm) => (
                <div
                  key={comm.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--rose)", textTransform: "uppercase" }}>
                      {comm.category}
                    </span>
                    <strong style={{ fontSize: 14, display: "block", margin: "4px 0" }}>{comm.name}</strong>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px", lineHeight: 1.4 }}>
                      {comm.description.slice(0, 90)}
                    </p>
                  </div>
                  <Link
                    href={`/communities/${comm.id}`}
                    className="secondary-button"
                    style={{ textAlign: "center", textDecoration: "none", padding: "6px", fontSize: 11 }}
                  >
                    View discussions
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state when nothing matches */}
        {query && people.length === 0 && posts.length === 0 && campuses.length === 0 && (
          <div
            style={{
              background: "#fff",
              border: "1px dashed var(--line)",
              borderRadius: 16,
              padding: "48px 20px",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            <h2 style={{ fontSize: 16, margin: "0 0 6px" }}>No results found for &quot;{query}&quot;</h2>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
              Try searching with another name, campus name, or keyword.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
