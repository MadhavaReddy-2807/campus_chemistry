"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const postSchema = z.object({
  body: z.string().trim().min(1).max(2200),
  audience: z.enum(["campus", "followers", "public"]).default("campus"),
});

export async function createPost(formData: FormData) {
  const rawBody = formData.get("body");
  const rawAudience = formData.get("audience") || "campus";

  const parsed = postSchema.safeParse({
    body: rawBody,
    audience: rawAudience,
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

  // Process uploaded image files
  const files = formData.getAll("mediaFiles") as File[];
  let sortOrder = 0;

  for (const file of files) {
    if (file && typeof file === "object" && file.size > 0) {
      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Attached file exceeds the 10MB limit.");
      }
      // Validate mime type
      if (!file.type.startsWith("image/")) {
        throw new Error("Only images (JPEG, PNG, WebP, GIF) are supported.");
      }

      const fileExt = file.name.split(".").pop() || "jpg";
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const storagePath = `${user.id}/${post.id}/${cleanFileName}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("posts").getPublicUrl(storagePath);
        await supabase.from("post_media").insert({
          post_id: post.id,
          storage_path: urlData.publicUrl,
          media_type: "image",
          sort_order: sortOrder++,
        });
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/profile");
  redirect("/");
}
