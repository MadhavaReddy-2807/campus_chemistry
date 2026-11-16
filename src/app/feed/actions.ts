"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function togglePostLike(formData: FormData) {
  const postId = z.string().uuid().parse(formData.get("postId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before liking a post.");

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    
    // Notification for post author
    const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).single();
    if (post && post.author_id !== user.id) {
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
      const likerName = profile?.display_name || "A student";
      await supabase.from("notifications").insert({
        user_id: post.author_id,
        type: "like",
        title: "New like on your post",
        body: `${likerName} liked your post.`,
        href: `/#post-${postId}`,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/feed");
}

export async function togglePostBookmark(formData: FormData) {
  const postId = z.string().uuid().parse(formData.get("postId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before saving a post.");

  const { data: existing } = await supabase
    .from("post_bookmarks")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_bookmarks").delete().eq("post_id", postId).eq("user_id", user.id);
  } else {
    await supabase.from("post_bookmarks").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/profile");
}

export async function createComment(formData: FormData) {
  const postId = z.string().uuid().parse(formData.get("postId"));
  const body = z.string().trim().min(1).max(1000).parse(formData.get("body"));
  const parentId = (formData.get("parentId") as string | null) || null;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before commenting.");

  const { error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      parent_id: parentId,
      body,
    });

  if (error) throw new Error("Comment could not be added.");

  // Notify post author
  const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).single();
  if (post && post.author_id !== user.id) {
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
    const commenterName = profile?.display_name || "A student";
    await supabase.from("notifications").insert({
      user_id: post.author_id,
      type: "comment",
      title: "New comment on your post",
      body: `${commenterName}: "${body.slice(0, 80)}${body.length > 80 ? '...' : ''}"`,
      href: `/#post-${postId}`,
    });
  }

  revalidatePath("/");
  revalidatePath("/feed");
}

export async function deleteComment(formData: FormData) {
  const commentId = z.string().uuid().parse(formData.get("commentId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before deleting comments.");

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  revalidatePath("/");
  revalidatePath("/feed");
}

export async function deletePost(formData: FormData) {
  const postId = z.string().uuid().parse(formData.get("postId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before deleting posts.");

  await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("author_id", user.id);

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/profile");
}

export async function editPost(formData: FormData) {
  const postId = z.string().uuid().parse(formData.get("postId"));
  const body = z.string().trim().min(1).max(2200).parse(formData.get("body"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before editing posts.");

  await supabase
    .from("posts")
    .update({ body, updated_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("author_id", user.id);

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/profile");
}

export async function toggleFollow(formData: FormData) {
  const targetId = z.string().uuid().parse(formData.get("targetId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before following users.");
  if (user.id === targetId) throw new Error("You cannot follow yourself.");

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
  } else {
    await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId, status: "accepted" });

    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
    await supabase.from("notifications").insert({
      user_id: targetId,
      type: "follow",
      title: "New follower",
      body: `${profile?.display_name || "A student"} started following you.`,
      href: `/profile?user=${user.id}`,
    });
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/profile");
  revalidatePath("/explore");
}
