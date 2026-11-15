import Link from "next/link";
import { connection } from "next/server";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { MobileNav } from "@/app/_components/MobileNav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StoryRingBar, type StoryItem } from "@/app/stories/StoryRingBar";
import { createComment, togglePostLike } from "./actions";

export const instant = false;

type FeedPost = { id: string; body: string | null; audience: string; created_at: string; profiles: { display_name: string; username: string; verification_status: string } | null };

async function getPosts(): Promise<FeedPost[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("posts").select("id, body, audience, created_at, profiles(display_name, username, verification_status)").is("deleted_at", null).order("created_at", { ascending: false }).limit(30);
  return (data as FeedPost[] | null) ?? [];
}

type StoryDbRow = {
  id: string;
  caption: string | null;
  background_style: string | null;
  created_at: string;
  profiles: { display_name: string; username: string } | null;
};

async function getStories(): Promise<StoryItem[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("stories")
      .select("id, caption, background_style, created_at, profiles:author_id(display_name, username)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(10);
    if (!data) return [];
    return (data as unknown as StoryDbRow[]).map((item) => ({
      id: item.id,
      caption: item.caption ?? "",
      background_style: item.background_style ?? "rose-gradient",
      created_at: item.created_at,
      author_name: item.profiles?.display_name ?? "Campus Student",
      author_initials: (item.profiles?.display_name ?? "CC").slice(0, 2).toUpperCase(),
      author_handle: item.profiles?.username ?? "student",
    }));
  } catch {
    return [];
  }
}

export default async function FeedPage() {
  await connection();
  const posts = await getPosts();
  const stories = await getStories();

  return (
    <main className="module-page">
      <div className="module-topbar">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <div>
          <Link href="/create" className="primary-button">
            Create post <span>+</span>
          </Link>
          <Link href="/" className="text-button module-back">
            Home <span>←</span>
          </Link>
        </div>
      </div>

      <ModuleHeader
        eyebrow="YOUR CAMPUS FEED"
        title="Small moments, shared with care."
        body="Posts and stories shown here follow each author’s audience settings and 24-hour expiration."
      />

      {/* 24-Hour Stories Reel */}
      <StoryRingBar initialStories={stories} />

      {!hasSupabaseEnv() ? (
        <DataState
          title="The campus feed is waiting for Supabase."
          body="Connect the backend to view real posts. This route intentionally does not fabricate feed content."
          action={{ label: "Read setup", href: "/" }}
        />
      ) : posts.length === 0 ? (
        <DataState
          title="Nothing has been shared yet."
          body="Be the first to start a campus conversation."
          action={{ label: "Create a post", href: "/create" }}
        />
      ) : (
        <div className="real-feed">
          {posts.map((post) => (
            <article className="real-post" key={post.id}>
              <header>
                <span className="module-avatar">
                  {post.profiles?.display_name.slice(0, 2).toUpperCase() ?? "CC"}
                </span>
                <div>
                  <strong>
                    {post.profiles?.display_name ?? "Campus student"}{" "}
                    {post.profiles?.verification_status === "verified" && (
                      <small className="verified-mini">✓</small>
                    )}
                  </strong>
                  <small>
                    @{post.profiles?.username ?? "student"} ·{" "}
                    {new Date(post.created_at).toLocaleString()}
                  </small>
                </div>
              </header>
              <p>{post.body}</p>
              <div className="post-control-row">
                <form action={togglePostLike}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button className="secondary-button">♡ Like</button>
                </form>
                <form action={createComment} className="comment-form">
                  <input type="hidden" name="postId" value={post.id} />
                  <input
                    name="body"
                    required
                    maxLength={1000}
                    placeholder="Add a thoughtful comment..."
                  />
                  <button className="primary-button">
                    Comment <span>→</span>
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
      <MobileNav activeTab="Home" />
    </main>
  );
}
