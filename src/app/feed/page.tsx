import Link from "next/link";
import { connection } from "next/server";
import { DataState, ModuleHeader } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createComment, togglePostLike } from "./actions";

export const instant = false;

type FeedPost = { id: string; body: string | null; audience: string; created_at: string; profiles: { display_name: string; username: string; verification_status: string } | null };

async function getPosts(): Promise<FeedPost[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("posts").select("id, body, audience, created_at, profiles(display_name, username, verification_status)").is("deleted_at", null).order("created_at", { ascending: false }).limit(30);
  return (data as FeedPost[] | null) ?? [];
}

export default async function FeedPage() {
  await connection();
  const posts = await getPosts();
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><div><Link href="/create" className="primary-button">Create post <span>+</span></Link><Link href="/" className="text-button module-back">Home <span>←</span></Link></div></div><ModuleHeader eyebrow="YOUR CAMPUS FEED" title="Small moments, shared with care." body="Posts shown here come from the database and follow each author’s audience settings." />{!hasSupabaseEnv() ? <DataState title="The campus feed is waiting for Supabase." body="Connect the backend to view real posts. This route intentionally does not fabricate feed content." action={{ label: "Read setup", href: "/" }} /> : posts.length === 0 ? <DataState title="Nothing has been shared yet." body="Be the first to start a campus conversation." action={{ label: "Create a post", href: "/create" }} /> : <div className="real-feed">{posts.map((post) => <article className="real-post" key={post.id}><header><span className="module-avatar">{post.profiles?.display_name.slice(0, 2).toUpperCase() ?? "CC"}</span><span><strong>{post.profiles?.display_name ?? "Campus student"} {post.profiles?.verification_status === "verified" && <small className="verified-mini">✓</small>}</strong><small>@{post.profiles?.username ?? "student"} · {new Date(post.created_at).toLocaleString()}</small></span></header><p>{post.body}</p><div className="post-control-row"><form action={togglePostLike}><input type="hidden" name="postId" value={post.id} /><button className="secondary-button">♡ Like</button></form><form action={createComment} className="comment-form"><input type="hidden" name="postId" value={post.id} /><input name="body" required maxLength={1000} placeholder="Add a thoughtful comment..." /><button className="primary-button">Comment <span>→</span></button></form></div></article>)}</div>}</main>;
}
