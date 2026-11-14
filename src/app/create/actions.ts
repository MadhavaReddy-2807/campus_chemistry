"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const postSchema = z.object({ body: z.string().trim().min(1).max(2200), audience: z.enum(["campus", "followers", "public"]) });
export async function createPost(formData: FormData) {
  const parsed = postSchema.safeParse({ body: formData.get("body"), audience: formData.get("audience") });
  if (!parsed.success) throw new Error("Write a post under 2,200 characters and choose an audience.");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before publishing a post.");
  const { error } = await supabase.from("posts").insert({ author_id: user.id, body: parsed.data.body, audience: parsed.data.audience });
  if (error) throw new Error("We could not publish that post yet.");
  redirect("/feed");
}
