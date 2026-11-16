import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Grid, List, CheckCircle2, Bookmark, Bell } from "lucide-react";
import { AppShell } from "@/app/_components/AppShell";
import { PostCard, type PostData } from "@/app/_components/PostCard";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileHeaderActions, type FollowUser } from "@/app/profile/ProfileClientViews";

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

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string; view?: string }>;
}) {
  await connection();
  const { username } = await params;
  const { tab = "posts", view = "grid" } = await searchParams;

  if (!hasSupabaseEnv()) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Find target profile by username (case-insensitive)
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, display_name, username, bio, study_year, avatar_url, verification_status, institute_id, institutes(name, short_name)")
    .ilike("username", decodeURIComponent(username))
    .maybeSingle();

  if (!targetProfile) {
    notFound();
  }

  const isOwner = currentUser?.id === targetProfile.id;

  // Current user's profile for shell
  let currentUserProfile: { display_name: string; username: string; avatar_url?: string | null; campus_short?: string } | null = null;
  if (currentUser) {
    const { data: cup } = await supabase
      .from("profiles")
      .select("display_name, username, avatar_url, institutes(short_name)")
      .eq("id", currentUser.id)
      .maybeSingle();
    if (cup) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inst = cup.institutes as any;
      currentUserProfile = {
        display_name: cup.display_name,
        username: cup.username,
        avatar_url: cup.avatar_url,
        campus_short: inst?.short_name,
      };
    }
  }

  // Fetch target user's interests
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interest:interests(id, name)")
    .eq("user_id", targetProfile.id);

  const interestsList = (userInterests || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => item.interest?.name)
    .filter(Boolean) as string[];

  // Fetch followers
  const { data: followersData } = await supabase
    .from("follows")
    .select("follower:profiles!follows_follower_id_fkey(id, display_name, username, avatar_url, institutes(short_name))")
    .eq("following_id", targetProfile.id);

  const followers: FollowUser[] = (followersData || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      id: item.follower?.id,
      name: item.follower?.display_name || "Student",
      username: item.follower?.username || "student",
      avatar_url: item.follower?.avatar_url,
      campus: item.follower?.institutes?.short_name,
    }))
    .filter((u) => Boolean(u.id));

  // Fetch following
  const { data: followingData } = await supabase
    .from("follows")
    .select("following:profiles!follows_following_id_fkey(id, display_name, username, avatar_url, institutes(short_name))")
    .eq("follower_id", targetProfile.id);

  const following: FollowUser[] = (followingData || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      id: item.following?.id,
      name: item.following?.display_name || "Student",
      username: item.following?.username || "student",
      avatar_url: item.following?.avatar_url,
      campus: item.following?.institutes?.short_name,
    }))
    .filter((u) => Boolean(u.id));

  // Check if current user is following this profile
  let isFollowing = false;
  if (currentUser && !isOwner) {
    const { data: followRecord } = await supabase
      .from("follows")
      .select("status")
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetProfile.id)
      .maybeSingle();
    isFollowing = Boolean(followRecord);
  }

  // Fetch posts by target user
  const { data: postsData } = await supabase
    .from("posts")
    .select(`
      id, author_id, body, audience, created_at,
      post_media ( id, storage_path, alt_text ),
      post_likes ( user_id ),
      comments (
        id, author_id, body, created_at, parent_id,
        author:profiles!comments_author_id_fkey(display_name, username)
      )
    `)
    .eq("author_id", targetProfile.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instObj = targetProfile.institutes as any;
  const campusLabel = instObj ? (Array.isArray(instObj) ? instObj[0]?.short_name : instObj.short_name) : undefined;

  const posts: PostData[] = (postsData || []).map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const likes = (p.post_likes as any[]) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawComments = (p.comments as any[]) || [];

    return {
      id: p.id,
      author_id: p.author_id,
      body: p.body,
      audience: p.audience,
      created_at: p.created_at,
      author_name: targetProfile.display_name,
      author_username: targetProfile.username,
      author_campus: campusLabel,
      author_verified: targetProfile.verification_status === "verified",
      author_avatar: targetProfile.avatar_url,
      likes_count: likes.length,
      comments_count: rawComments.length,
      has_liked: currentUser ? likes.some((l) => l.user_id === currentUser.id) : false,
      has_bookmarked: false,
      is_following: isFollowing,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      media: (p.post_media as any[]) || [],
      comments: rawComments.map((c) => ({
        id: c.id,
        author_id: c.author_id,
        author_name: c.author?.display_name || "Student",
        author_username: c.author?.username || "student",
        body: c.body,
        created_at: c.created_at,
        parent_id: c.parent_id,
      })),
    };
  });

  // Fetch saved bookmarks if owner
  let savedPosts: PostData[] = [];
  if (isOwner && tab === "saved") {
    const { data: savedData } = await supabase
      .from("post_bookmarks")
      .select(`
        post:posts (
          id, author_id, body, audience, created_at,
          author:profiles!posts_author_id_fkey(display_name, username, avatar_url, institutes(short_name)),
          post_media ( id, storage_path, alt_text ),
          post_likes ( user_id ),
          comments ( count )
        )
      `)
      .eq("user_id", targetProfile.id)
      .order("created_at", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    savedPosts = (savedData || []).map((item: any) => {
      const p = item.post;
      if (!p) return null;
      return {
        id: p.id,
        author_id: p.author_id,
        body: p.body,
        audience: p.audience,
        created_at: p.created_at,
        author_name: p.author?.display_name || "Student",
        author_username: p.author?.username || "student",
        author_campus: p.author?.institutes?.short_name,
        author_avatar: p.author?.avatar_url,
        likes_count: (p.post_likes || []).length,
        comments_count: (p.comments || [])[0]?.count || 0,
        has_liked: false,
        has_bookmarked: true,
        media: p.post_media || [],
      };
    }).filter(Boolean) as PostData[];
  }

  // Fetch activity notifications if owner and tab is activity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activityNotifications: any[] = [];
  if (isOwner && tab === "activity") {
    const { data: notifs } = await supabase
      .from("notifications")
      .select("id, type, title, body, href, read_at, created_at")
      .eq("user_id", targetProfile.id)
      .order("created_at", { ascending: false })
      .limit(30);
    activityNotifications = notifs || [];
  }

  const initials = targetProfile.display_name.slice(0, 2).toUpperCase();

  return (
    <AppShell
      activeTab={isOwner ? "Profile" : undefined}
      user={
        currentUserProfile
          ? {
              name: currentUserProfile.display_name,
              username: currentUserProfile.username,
              avatar_url: currentUserProfile.avatar_url,
              campus: currentUserProfile.campus_short,
            }
          : undefined
      }
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px 80px" }}>
        {/* Profile Header Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--line, #e5e7eb)",
            borderRadius: 16,
            padding: "24px",
            marginBottom: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar */}
            {targetProfile.avatar_url ? (
              <img
                src={targetProfile.avatar_url}
                alt={targetProfile.display_name}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--line, #e5e7eb)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "var(--plum, #4a2c35)",
                  color: "#ffffff",
                  fontSize: 28,
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {initials}
              </div>
            )}

            {/* Profile Identity Details */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--ink, #111827)" }}>
                  {targetProfile.display_name}
                </h1>
                {targetProfile.verification_status === "verified" && (
                  <CheckCircle2 size={18} style={{ color: "#22c55e" }} aria-label="Verified IIT/NIT Student" />
                )}
                {campusLabel && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--plum, #4a2c35)",
                      background: "#fcf1ee",
                      padding: "2px 10px",
                      borderRadius: 12,
                      border: "1px solid #ebd3cd",
                    }}
                  >
                    {campusLabel}
                  </span>
                )}
              </div>

              <p style={{ margin: "0 0 10px", color: "var(--muted, #6b7280)", fontSize: 13 }}>
                @{targetProfile.username} · {getYearLabel(targetProfile.study_year)}
              </p>

              {targetProfile.bio && (
                <p style={{ margin: "0 0 14px", fontSize: 14, color: "var(--ink, #1f2937)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {targetProfile.bio}
                </p>
              )}

              {/* Interests Chips */}
              {interestsList.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {interestsList.map((interest) => (
                    <span
                      key={interest}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "#f3f4f6",
                        fontSize: 11,
                        color: "var(--ink, #374151)",
                        fontWeight: 500,
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              {/* Counters */}
              <div style={{ display: "flex", gap: 24, padding: "12px 0", borderTop: "1px solid var(--line, #f3f4f6)", borderBottom: "1px solid var(--line, #f3f4f6)", marginBottom: 16 }}>
                <div>
                  <strong style={{ fontSize: 16, color: "var(--ink, #111827)" }}>{posts.length}</strong>
                  <span style={{ fontSize: 12, color: "var(--muted, #6b7280)", marginLeft: 5 }}>posts</span>
                </div>
                <div>
                  <strong style={{ fontSize: 16, color: "var(--ink, #111827)" }}>{followers.length}</strong>
                  <span style={{ fontSize: 12, color: "var(--muted, #6b7280)", marginLeft: 5 }}>followers</span>
                </div>
                <div>
                  <strong style={{ fontSize: 16, color: "var(--ink, #111827)" }}>{following.length}</strong>
                  <span style={{ fontSize: 12, color: "var(--muted, #6b7280)", marginLeft: 5 }}>following</span>
                </div>
              </div>

              {/* Action Buttons */}
              <ProfileHeaderActions
                targetId={targetProfile.id}
                isOwner={isOwner}
                isFollowing={isFollowing}
              />
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--line, #e5e7eb)", marginBottom: 20 }}>
          <Link
            href={`/u/${targetProfile.username}?tab=posts`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: tab === "posts" ? 700 : 500,
              color: tab === "posts" ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
              borderBottom: tab === "posts" ? "2px solid var(--plum, #4a2c35)" : "2px solid transparent",
              textDecoration: "none",
            }}
          >
            <Grid size={16} />
            <span>Posts</span>
          </Link>

          {isOwner && (
            <>
              <Link
                href={`/u/${targetProfile.username}?tab=saved`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 18px",
                  fontSize: 13,
                  fontWeight: tab === "saved" ? 700 : 500,
                  color: tab === "saved" ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
                  borderBottom: tab === "saved" ? "2px solid var(--plum, #4a2c35)" : "2px solid transparent",
                  textDecoration: "none",
                }}
              >
                <Bookmark size={16} />
                <span>Saved</span>
              </Link>

              <Link
                href={`/u/${targetProfile.username}?tab=activity`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 18px",
                  fontSize: 13,
                  fontWeight: tab === "activity" ? 700 : 500,
                  color: tab === "activity" ? "var(--plum, #4a2c35)" : "var(--muted, #6b7280)",
                  borderBottom: tab === "activity" ? "2px solid var(--plum, #4a2c35)" : "2px solid transparent",
                  textDecoration: "none",
                }}
              >
                <Bell size={16} />
                <span>Activity</span>
              </Link>
            </>
          )}

          {/* View Toggle (Grid vs Feed) if in posts tab */}
          {tab === "posts" && posts.length > 0 && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <Link
                href={`/u/${targetProfile.username}?tab=posts&view=grid`}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  background: view === "grid" ? "#f3f4f6" : "none",
                  color: view === "grid" ? "var(--ink)" : "var(--muted)",
                  display: "grid",
                  placeItems: "center",
                }}
                aria-label="Grid view"
              >
                <Grid size={16} />
              </Link>
              <Link
                href={`/u/${targetProfile.username}?tab=posts&view=feed`}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  background: view === "feed" ? "#f3f4f6" : "none",
                  color: view === "feed" ? "var(--ink)" : "var(--muted)",
                  display: "grid",
                  placeItems: "center",
                }}
                aria-label="Feed view"
              >
                <List size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {tab === "posts" && (
          posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", background: "#ffffff", borderRadius: 12, border: "1px solid var(--line, #e5e7eb)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink, #111827)", margin: "0 0 6px" }}>
                No posts published yet
              </h3>
              <p style={{ fontSize: 13, color: "var(--muted, #6b7280)", margin: 0 }}>
                {isOwner ? "Share your first campus update or photo." : "This student has not shared any posts yet."}
              </p>
              {isOwner && (
                <Link href="/create" className="primary-button" style={{ display: "inline-block", marginTop: 14, fontSize: 12 }}>
                  Create Post
                </Link>
              )}
            </div>
          ) : view === "grid" ? (
            /* Instagram-style 3-Column Square Grid */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 8,
              }}
            >
              {posts.map((post) => {
                const hasMedia = post.media && post.media.length > 0;
                return (
                  <Link
                    key={post.id}
                    href={`/u/${targetProfile.username}?tab=posts&view=feed#post-${post.id}`}
                    style={{
                      aspectRatio: "1 / 1",
                      borderRadius: 8,
                      overflow: "hidden",
                      position: "relative",
                      background: hasMedia ? "#000" : "linear-gradient(135deg, #fdf2f0 0%, #f7e6e3 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 12,
                      textDecoration: "none",
                      color: hasMedia ? "#ffffff" : "var(--ink, #111827)",
                      border: "1px solid var(--line, #e5e7eb)",
                    }}
                  >
                    {hasMedia ? (
                      <img
                        src={post.media![0].storage_path}
                        alt="Post thumbnail"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                      />
                    ) : (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textAlign: "center",
                          fontWeight: 500,
                        }}
                      >
                        {post.body}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Feed List View */
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
              ))}
            </div>
          )
        )}

        {tab === "saved" && isOwner && (
          savedPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", background: "#ffffff", borderRadius: 12, border: "1px solid var(--line, #e5e7eb)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink, #111827)", margin: "0 0 6px" }}>
                No saved posts
              </h3>
              <p style={{ fontSize: 13, color: "var(--muted, #6b7280)", margin: 0 }}>
                Bookmark posts across the feed to read or revisit them here.
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              {savedPosts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
              ))}
            </div>
          )
        )}

        {tab === "activity" && isOwner && (
          <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid var(--line, #e5e7eb)", padding: "16px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px", color: "var(--ink, #111827)" }}>
              Recent Activity &amp; Notifications
            </h3>
            {activityNotifications.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted, #6b7280)", margin: 0 }}>No recent activity to show.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activityNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.href || "/"}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "10px",
                      borderRadius: 8,
                      background: notif.read_at ? "#ffffff" : "#fdf4f2",
                      border: "1px solid var(--line, #f3f4f6)",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 13, display: "block", color: "var(--ink, #111827)" }}>
                        {notif.title}
                      </strong>
                      <p style={{ margin: "2px 0 4px", fontSize: 12, color: "var(--muted, #4b5563)" }}>
                        {notif.body}
                      </p>
                      <small style={{ fontSize: 10, color: "var(--muted, #9ca3af)" }}>
                        {new Date(notif.created_at).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
