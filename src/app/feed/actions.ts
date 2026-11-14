"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function togglePostLike(formData: FormData) {
  const postId = z.string().uuid().parse(formData.get("postId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before liking a post.");
  const { data: existing } = await supabase.from("post_likes").select("post_id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
  const result = existing ? await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id) : await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  if (result.error) throw new Error("Like could not be updated.");
  redirect("/feed");
}

export async function createComment(formData: FormData) {
  const postId = z.string().uuid().parse(formData.get("postId"));
  const body = z.string().trim().min(1).max(1000).parse(formData.get("body"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before commenting.");
  const { error } = await supabase.from("comments").insert({ post_id: postId, author_id: user.id, body });
  if (error) throw new Error("Comment could not be added.");
  redirect("/feed");
}
