"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createStorySchema = z.object({
  caption: z.string().trim().min(1).max(300),
  mediaType: z.enum(["thought", "photo", "prompt"]).default("thought"),
  backgroundStyle: z.string().default("rose-gradient"),
});

export async function postStory(_prevState: unknown, formData: FormData) {
  const parsed = createStorySchema.safeParse({
    caption: formData.get("caption"),
    mediaType: formData.get("mediaType") || "thought",
    backgroundStyle: formData.get("backgroundStyle") || "rose-gradient",
  });

  if (!parsed.success) {
    return { error: "Please enter a caption (max 300 characters)." };
  }

  if (!hasSupabaseEnv()) {
    revalidatePath("/feed");
    return { success: true };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to post a campus story." };

  const { error } = await supabase.from("stories").insert({
    author_id: user.id,
    caption: parsed.data.caption,
    media_type: parsed.data.mediaType,
    background_style: parsed.data.backgroundStyle,
  });

  if (error) {
    return { error: "Could not publish your story. Please try again." };
  }

  revalidatePath("/feed");
  return { success: true };
}

export async function markStoryViewed(storyId: string) {
  if (!storyId || !hasSupabaseEnv()) return;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("story_views").upsert(
      { story_id: storyId, viewer_id: user.id },
      { onConflict: "story_id,viewer_id" }
    );
  } catch {
    // Ignore view recording errors
  }
}
