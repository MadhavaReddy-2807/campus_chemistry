"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createCommunitySchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1000),
  category: z.enum([
    "Tech & Coding",
    "Creative & Arts",
    "Music & Jamming",
    "Sports & Fitness",
    "Literature & Debating",
    "Gaming & Anime",
    "Entrepreneurship",
    "Research & Academia",
  ]),
});

const createPostSchema = z.object({
  communityId: z.string().uuid(),
  title: z.string().trim().min(3).max(150),
  body: z.string().trim().min(5).max(3000),
});

export async function createCommunity(formData: FormData): Promise<void> {
  const parsed = createCommunitySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    redirect("/communities");
  }

  if (!hasSupabaseEnv()) {
    redirect("/communities");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { data, error } = await supabase.from("communities").insert({
    name: parsed.data.name,
    slug,
    description: parsed.data.description,
    category: parsed.data.category,
    campus_scope: "all",
    created_by: user.id,
  }).select("id").single();

  if (error || !data) {
    redirect("/communities");
  }

  // Auto-join creator as lead
  await supabase.from("community_members").insert({
    community_id: data.id,
    user_id: user.id,
    role: "lead",
  });

  revalidatePath("/communities");
  redirect(`/communities/${data.id}`);
}

export async function toggleCommunityMembership(formData: FormData): Promise<void> {
  const communityId = formData.get("communityId") as string;
  if (!communityId) return;

  if (!hasSupabaseEnv()) {
    revalidatePath(`/communities/${communityId}`);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("community_members")
    .select("id")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("community_members").delete().eq("id", existing.id);
  } else {
    await supabase.from("community_members").insert({
      community_id: communityId,
      user_id: user.id,
      role: "member",
    });
  }

  revalidatePath(`/communities/${communityId}`);
  revalidatePath("/communities");
}

export async function createCommunityPost(formData: FormData): Promise<void> {
  const parsed = createPostSchema.safeParse({
    communityId: formData.get("communityId"),
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return;
  }

  if (!hasSupabaseEnv()) {
    revalidatePath(`/communities/${parsed.data.communityId}`);
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("community_posts").insert({
    community_id: parsed.data.communityId,
    author_id: user.id,
    title: parsed.data.title,
    body: parsed.data.body,
  });

  revalidatePath(`/communities/${parsed.data.communityId}`);
}
