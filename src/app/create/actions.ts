"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const postSchema = z.object({
  body: z.string().trim().min(1).max(2200),
  audience: z.enum(["campus", "followers", "public"]).default("campus"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createPost(formData: FormData) {
  const rawBody = formData.get("body");
  const rawAudience = formData.get("audience") || "campus";
  const rawImageUrl = formData.get("imageUrl") || "";

  const parsed = postSchema.safeParse({
    body: rawBody,
    audience: rawAudience,
    imageUrl: rawImageUrl,
  });

  if (!parsed.success) {
    throw new Error("Write a post under 2,200 characters and choose a valid audience.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please sign in before publishing a post.");
  }

  // Get user's institute
  const { data: profile } = await supabase
    .from("profiles")
    .select("institute_id")
    .eq("id", user.id)
    .single();

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      body: parsed.data.body,
      audience: parsed.data.audience,
      institute_id: profile?.institute_id || null,
    })
    .select("id")
    .single();

  if (error || !post) {
    throw new Error("We could not publish that post. Please try again.");
  }

  // If image URL provided, link in post_media
  if (parsed.data.imageUrl) {
    await supabase.from("post_media").insert({
      post_id: post.id,
      storage_path: parsed.data.imageUrl,
      media_type: "image",
      sort_order: 0,
    });
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/profile");
  redirect("/");
}
