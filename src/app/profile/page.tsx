import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { PostCard, type PostData } from "@/app/_components/PostCard";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileHeaderActions, ProfileFollowCounters, type FollowUser } from "./ProfileClientViews";

export const instant = false;

function getYearLabel(year: number | null | undefined): string {
  switch (year) {
    case 1: return "First Year";
    case 2: return "Second Year";
    case 3: return "Third Year";
    case 4: return "Fourth Year";
    case 5: return "Fifth Year / Dual Degree";
    case 6: return "Postgraduate";
    case 7: return "PhD";
    default: return year ? `Year ${year}` : "Student";
  }
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; tab?: string }>;
}) {
  await connection();
  const { user: requestedId, tab = "posts" } = await searchParams;

  if (!hasSupabaseEnv()) {
    return <div>Database connection is required.</div>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Sign in to view campus profiles</h2>
        <p style={{ color: "#64748b", margin: "1rem 0" }}>Profiles are accessible to verified IIT and NIT students.</p>
        <Link href="/login" className="primary-button" style={{ display: "inline-block" }}>
          Sign In
        </Link>
      </div>
    );
  }

  // Fetch current user's profile for the AppShell
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, institute_id, institutes(short_name)")
    .eq("id", currentUser.id)
    .maybeSingle();

  const targetId = requestedId && /^[0-9a-f-]{36}$/i.test(requestedId) ? requestedId : currentUser.id;
  const isOwner = targetId === currentUser.id;

  // Fetch target user profile with institute
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, display_name, username, bio, study_year, avatar_url, verification_status, institute_id, institutes(name, short_name)")
    .eq("id", targetId)
    .maybeSingle();

  if (!targetProfile) {
    notFound();
  }

  // Fetch target user's interests
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interest:interests(id, name)")
    .eq("user_id", targetId);

  const interestsList = (userInterests || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => item.interest?.name)
    .filter(Boolean) as string[];

  // Fetch followers
  const { data: followersData } = await supabase
    .from("follows")
    .select("follower:profiles!follows_follower_id_fkey(id, display_name, username, avatar_url, institutes(short_name))")
    .eq("following_id", targetId);

  const followers: FollowUser[] = (followersData || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      id: item.follower?.id,
      name: item.follower?.display_name || "Student",
      username: item.follower?.username || "student",
      avatar_url: item.follower?.avatar_url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      campus: (item.follower?.institutes as any)?.short_name,
    }))
    .filter((u) => Boolean(u.id));

  // Fetch following
  const { data: followingData } = await supabase
    .from("follows")
    .select("following:profiles!follows_following_id_fkey(id, display_name, username, avatar_url, institutes(short_name))")
    .eq("follower_id", targetId);

  const following: FollowUser[] = (followingData || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      id: item.following?.id,
      name: item.following?.display_name || "Student",
      username: item.following?.username || "student",
      avatar_url: item.following?.avatar_url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      campus: (item.following?.institutes as any)?.short_name,
    }))
    .filter((u) => Boolean(u.id));

  const isFollowing = followers.some((f) => f.id === currentUser.id);

  // Fetch posts or saved posts
  let posts: PostData[] = [];
  let postsCount = 0;

  if (tab === "saved" && isOwner) {
    const { data: savedPostsData } = await supabase
      .from("post_bookmarks")
      .select(`
        post:posts (
          id,
          author_id,
          body,
          audience,
          created_at,
          profiles (
            display_name,
            username,
            avatar_url,
            verification_status,
            institutes (short_name)
          ),
          post_media (
            id,
            storage_path,
            alt_text
          ),
          post_likes (
            user_id
          ),
          comments (
            id,
            author_id,
            body,
            created_at,
            profiles!comments_author_id_fkey (
              display_name,
              username
            )
          )
        )
      `)
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posts = (savedPostsData || []).map((b: any) => {
      const item = b.post;
      if (!item) return null;
      return {
        id: item.id,
        author_id: item.author_id,
        body: item.body,
        audience: item.audience,
        created_at: item.created_at,
        author_name: item.profiles?.display_name || "Student",
        author_username: item.profiles?.username || "student",
        author_campus: item.profiles?.institutes?.short_name || "Campus",
        author_verified: item.profiles?.verification_status === "verified",
        author_avatar: item.profiles?.avatar_url,
        likes_count: item.post_likes?.length || 0,
        comments_count: item.comments?.length || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        has_liked: (item.post_likes || []).some((l: any) => l.user_id === currentUser.id),
        has_bookmarked: true,
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
      };
    }).filter(Boolean) as PostData[];
  } else {
    // Standard posts authored by target user
    const { data: postsData, count } = await supabase
      .from("posts")
      .select(`
        id,
        author_id,
        body,
        audience,
        created_at,
        profiles (
          display_name,
          username,
          avatar_url,
          verification_status,
          institutes (short_name)
        ),
        post_media (
          id,
          storage_path,
          alt_text
        ),
        post_likes (
          user_id
        ),
        comments (
          id,
          author_id,
          body,
          created_at,
          profiles!comments_author_id_fkey (
            display_name,
            username
          )
        )
      `, { count: "exact" })
      .eq("author_id", targetId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    postsCount = count || 0;

    const { data: bmarks } = await supabase
      .from("post_bookmarks")
      .select("post_id")
      .eq("user_id", currentUser.id);
    const bookmarkedIds = new Set(bmarks?.map((b) => b.post_id) || []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posts = (postsData || []).map((item: any) => ({
      id: item.id,
      author_id: item.author_id,
      body: item.body,
      audience: item.audience,
      created_at: item.created_at,
      author_name: item.profiles?.display_name || "Student",
      author_username: item.profiles?.username || "student",
      author_campus: item.profiles?.institutes?.short_name || "Campus",
      author_verified: item.profiles?.verification_status === "verified",
      author_avatar: item.profiles?.avatar_url,
      likes_count: item.post_likes?.length || 0,
      comments_count: item.comments?.length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      has_liked: (item.post_likes || []).some((l: any) => l.user_id === currentUser.id),
      has_bookmarked: bookmarkedIds.has(item.id),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instituteInfo = targetProfile.institutes as any;
  const campusDisplayName = instituteInfo ? `${instituteInfo.name} (${instituteInfo.short_name})` : "IIT/NIT Campus";

  return (
    <AppShell
      activeTab="profile"
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
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1rem" }}>
        {/* Profile Card */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                fontWeight: 700,
                flexShrink: 0,
                overflow: "hidden",
                border: "2px solid #ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {targetProfile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={targetProfile.avatar_url}
                  alt={targetProfile.display_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                targetProfile.display_name.slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "var(--foreground, #111827)" }}>
                  {targetProfile.display_name}
                </h1>
                <span
                  style={{
                    background: "#ecfdf5",
                    color: "#059669",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  ✓ Verified IIT/NIT
                </span>
              </div>

              <div style={{ fontSize: "0.88rem", color: "var(--foreground-muted, #64748b)", marginTop: "0.2rem" }}>
                @{targetProfile.username}
              </div>

              <div style={{ marginTop: "0.6rem", fontSize: "0.85rem", color: "#374151", display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontWeight: 500 }}>{campusDisplayName}</span>
                <span>•</span>
                <span>{getYearLabel(targetProfile.study_year)}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {targetProfile.bio && (
            <p style={{ margin: "1rem 0 0.5rem 0", fontSize: "0.92rem", lineHeight: 1.5, color: "#1f2937", whiteSpace: "pre-line" }}>
              {targetProfile.bio}
            </p>
          )}

          {/* Interests Chips */}
          {interestsList.length > 0 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
              {interestsList.map((interest) => (
                <span
                  key={interest}
                  style={{
                    background: "#f3f4f6",
                    color: "#374151",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "999px",
                  }}
                >
                  #{interest}
                </span>
              ))}
            </div>
          )}

          {/* Counters & Actions */}
          <ProfileFollowCounters
            followers={followers}
            following={following}
            postsCount={postsCount}
          />

          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #f3f4f6" }}>
            <ProfileHeaderActions
              targetId={targetProfile.id}
              isOwner={isOwner}
              isFollowing={isFollowing}
            />
          </div>
        </section>

        {/* Profile Tabs */}
        {isOwner && (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid var(--border-subtle, #e5e7eb)",
              marginBottom: "1rem",
            }}
          >
            <Link
              href="/profile"
              style={{
                padding: "0.65rem 0.5rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                color: tab === "posts" ? "var(--primary-color, #9f4b59)" : "#64748b",
                borderBottom: tab === "posts" ? "2px solid var(--primary-color, #9f4b59)" : "2px solid transparent",
              }}
            >
              Posts ({postsCount})
            </Link>
            <Link
              href="/profile?tab=saved"
              style={{
                padding: "0.65rem 0.5rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                color: tab === "saved" ? "var(--primary-color, #9f4b59)" : "#64748b",
                borderBottom: tab === "saved" ? "2px solid var(--primary-color, #9f4b59)" : "2px solid transparent",
              }}
            >
              Saved Posts
            </Link>
          </div>
        )}

        {/* Posts Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
              <p style={{ margin: 0, fontSize: "0.95rem" }}>
                {tab === "saved" ? "You haven't saved any posts yet." : "No posts published yet."}
              </p>
              {isOwner && tab === "posts" && (
                <Link href="/create" className="primary-button" style={{ display: "inline-block", marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  Create First Post
                </Link>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUser.id} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
