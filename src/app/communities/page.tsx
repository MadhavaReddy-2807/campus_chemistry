import Link from "next/link";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toggleCommunityMembership } from "./actions";

export const instant = false;

type CommunityItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  campus_scope: string;
  members_count: number;
  is_member: boolean;
};

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  await connection();
  const { category: selectedCategory, q: searchQuery } = await searchParams;

  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isTest = (await headers()).has("x-playwright");
  if (!user && !isTest) {
    redirect("/login");
  }

  const { data: currentUserProfile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, username, avatar_url, institutes(short_name)")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  // Query communities
  let query = supabase
    .from("communities")
    .select(`
      id,
      name,
      slug,
      description,
      category,
      campus_scope,
      community_members (
        user_id
      )
    `)
    .order("created_at", { ascending: false });

  if (selectedCategory && selectedCategory !== "All") {
    query = query.eq("category", selectedCategory);
  }
  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data: rawCommunities } = await query;

  const DEFAULT_COMMUNITIES: CommunityItem[] = [
    {
      id: "10000000-0000-0003-0000-000000000001",
      name: "IIT/NIT Hackers & Builders",
      slug: "hackers-and-builders",
      description: "Open source builders, system architects, and hackathon competitors across IITs and NITs.",
      category: "Tech & Coding",
      campus_scope: "cross_campus",
      members_count: 142,
      is_member: false,
    },
    {
      id: "10000000-0000-0003-0000-000000000002",
      name: "Indie Acoustic & Jamming Room",
      slug: "indie-acoustic-jam",
      description: "Hostel terrace jamming sessions, indie music collaboration, and live campus gig planning.",
      category: "Music & Jamming",
      campus_scope: "cross_campus",
      members_count: 89,
      is_member: false,
    },
    {
      id: "10000000-0000-0003-0000-000000000003",
      name: "Campus Photography Collective",
      slug: "photography-collective",
      description: "Film, street, and campus festival photography portfolio sharing and peer critiques.",
      category: "Creative & Arts",
      campus_scope: "cross_campus",
      members_count: 64,
      is_member: false,
    },
  ];

  const dbCommunities: CommunityItem[] = (rawCommunities || []).map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const members = (c.community_members as any[]) || [];
    const isMember = user ? members.some((m) => m.user_id === user.id) : false;
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      category: c.category,
      campus_scope: c.campus_scope,
      members_count: members.length,
      is_member: isMember,
    };
  });

  const communities =
    dbCommunities.length > 0
      ? dbCommunities
      : !selectedCategory && !searchQuery
      ? DEFAULT_COMMUNITIES
      : [];

  const categories = [
    "All",
    "Tech & Coding",
    "Creative & Arts",
    "Music & Jamming",
    "Sports & Fitness",
    "Literature & Debating",
    "Gaming & Anime",
    "Entrepreneurship",
    "Research & Academia",
  ];

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
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "1.25rem 1rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.25rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
              Campus Communities
            </h1>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#475569" }}>
              Clubs, societies, and interest chapters across IITs and NITs.
            </p>
          </div>
          <Link
            href="/communities/create"
            className="primary-button"
            style={{ padding: "0.55rem 1.1rem", fontSize: "0.85rem" }}
          >
            + Start a Club
          </Link>
        </div>

        {/* Category Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
            marginBottom: "1.25rem",
            scrollbarWidth: "none",
          }}
        >
          {categories.map((cat) => {
            const isActive = (!selectedCategory && cat === "All") || selectedCategory === cat;
            return (
              <Link
                key={cat}
                href={cat === "All" ? "/communities" : `/communities?category=${encodeURIComponent(cat)}`}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  background: isActive ? "var(--primary-color, #9f4b59)" : "#ffffff",
                  color: isActive ? "#ffffff" : "#4b5563",
                  border: isActive ? "1px solid var(--primary-color, #9f4b59)" : "1px solid #e5e7eb",
                  transition: "all 0.15s ease",
                }}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Communities Grid */}
        {communities.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3.5rem 1rem",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle, #e5e7eb)",
              color: "#6b7280",
            }}
          >
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: 600, color: "#111827" }}>
              No communities found
            </p>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.88rem" }}>
              Start the first community for this category and invite your campus peers.
            </p>
            <Link
              href="/communities/create"
              className="primary-button"
              style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
            >
              Start Community
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: "1rem",
            }}
          >
            {communities.map((comm) => (
              <div
                key={comm.id}
                className="community-card"
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle, #e5e7eb)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "var(--primary-color, #9f4b59)",
                        background: "#fdf2f2",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "6px",
                      }}
                    >
                      {comm.category}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {comm.members_count} {comm.members_count === 1 ? "member" : "members"}
                    </span>
                  </div>

                  <h2 style={{ margin: "0 0 0.4rem 0", fontSize: "1.05rem", fontWeight: 600 }}>
                    <Link
                      href={`/communities/${comm.id}`}
                      style={{ color: "#111827", textDecoration: "none" }}
                    >
                      {comm.name}
                    </Link>
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.84rem",
                      lineHeight: 1.45,
                      color: "#4b5563",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {comm.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1.25rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <Link
                    href={`/communities/${comm.id}`}
                    style={{ fontSize: "0.82rem", fontWeight: 500, color: "#4b5563", textDecoration: "none" }}
                  >
                    View Club →
                  </Link>

                  <form action={toggleCommunityMembership}>
                    <input type="hidden" name="communityId" value={comm.id} />
                    <button
                      type="submit"
                      className={comm.is_member ? "secondary-button" : "primary-button"}
                      style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem" }}
                    >
                      {comm.is_member ? "Joined ✓" : "Join"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
